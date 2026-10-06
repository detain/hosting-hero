/**
 * G1 smoke model — the visitor-dot lane, WebGL-free.
 *
 * The dot field is EXACTLY what §4.7 says motes must be: "cosmetic interpolants
 * of throughput statistics, generated locally from (rate, latency-distribution,
 * class-mix, health) per lane; per-request units never cross any boundary."
 * This module consumes a parsed `LaneStats` (+ the bounce/FP notices) and
 * paints a story: dots stream ingress→node, and when the knee bites, dots
 * visibly bounce back out. All floats, all wall-clock — display math only.
 *
 * `SmokeField` is deterministic given (seed, dtMs sequence) so tests can pin
 * spawn counts to rates within tolerance and prove bounce geometry.
 */
import type { LaneStats } from "@hh/sim-core";
import { fixedToDisplay } from "../../shared/protocol";

export interface Mote {
  id: number;
  /** Progress along the lane, 0 (ingress) → 1 (node door). */
  t: number;
  /** Perpendicular jitter lane offset in world px (-1..1), fixed per mote. */
  readonly band: number;
  readonly classOf: "standard" | "express";
  state: "flowing" | "bouncing" | "dead";
  /** Bounce progress 0..1 (bouncing motes walk back to 0 then die). */
  bounceT: number;
}

export interface SmokeFrame {
  readonly motes: readonly Mote[];
  readonly spawned: number;
  readonly bouncedAway: number;
}

export class SmokeField {
  private motes: Mote[] = [];
  private nextId = 0;
  private spawnCarry = 0;
  private readonly rng: () => number;

  constructor(seed: number, private readonly maxMotes = 160) {
    let state = (seed ^ 0x9e3779b9) >>> 0;
    this.rng = () => {
      state = (state + 0x6d2b79f5) | 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Advance the field. `dtMs` = real ms since last frame (wall clock, display
   *  law). `lane` carries the stats; `bouncePressure` 0..1 comes from the
   *  observed health cell — the renderer reads it, it does NOT compute queueing. */
  step(dtMs: number, lane: LaneStats, bouncePressure: number): SmokeFrame {
    if (!(dtMs >= 0) || !Number.isFinite(dtMs)) {
      throw new Error(`SmokeField.step: bad dtMs ${dtMs}`);
    }
    const ratePerMin = Math.max(0, fixedToDisplay(lane.ratePerMin));
    const health = Math.min(1, Math.max(0, fixedToDisplay(lane.health)));

    // Spawn: scale sim-rate down to a watchable mote rate (prototype theatre:
    // 1 mote ≈ 8 units — density communicates, count never lies about order).
    const motesPerMs = ratePerMin / 60_000 / 8;
    this.spawnCarry += motesPerMs * dtMs;
    let spawned = 0;
    while (this.spawnCarry >= 1 && this.motes.length < this.maxMotes) {
      this.spawnCarry -= 1;
      this.motes.push(this.makeMote(lane));
      spawned += 1;
    }
    if (this.spawnCarry > 4) this.spawnCarry = 0; // far-supply cap, no runaway

    // Flow: express class moves faster (class-mix is visible as speed, a
    // Two-Channel redundancy over colour).
    const baseSpeed = 0.00028 * (0.4 + health * 0.6);
    let bouncedAway = 0;
    for (const mote of this.motes) {
      if (mote.state === "dead") continue;
      if (mote.state === "bouncing") {
        mote.bounceT = Math.min(1, mote.bounceT + dtMs * 0.0016);
        mote.t = 1 - mote.bounceT; // walks back out the way it came
        if (mote.bounceT >= 1) mote.state = "dead";
        continue;
      }
      const speed = mote.classOf === "express" ? baseSpeed * 1.55 : baseSpeed;
      mote.t += speed * dtMs;
      if (mote.t >= 1) {
        // The door: pressure decides bounce vs serve — cosmetic draw from the
        // health stat, never from unit truth (there is no unit truth here).
        if (this.rng() < bouncePressure) {
          mote.state = "bouncing";
          bouncedAway += 1;
        } else {
          mote.state = "dead"; // served: absorbed into the node
        }
      }
    }
    this.motes = this.motes.filter((m) => m.state !== "dead");
    return { motes: this.motes, spawned, bouncedAway };
  }

  private makeMote(lane: LaneStats): Mote {
    const expressShare = fixedToDisplay(lane.classMix["express"] ?? 0n);
    return {
      id: this.nextId++,
      t: 0,
      band: this.rng() * 2 - 1,
      classOf: this.rng() < expressShare ? "express" : "standard",
      state: "flowing",
      bounceT: 0,
    };
  }
}
