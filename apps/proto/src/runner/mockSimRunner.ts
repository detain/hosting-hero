/**
 * MockSimRunner — the placeholder "engine" behind the `SimRunner` seam.
 *
 * It owns a tiny queueing toy (one ingress, one app node, one defense slider)
 * shaped to G1's slice (MASTER_REPORT §7.1): diurnal baseline envelope +
 * scripted spike, ρ/(1−ρ) knee pressure, silent bounces above patience,
 * amber-403 false positives scaled by aggression. Every value it emits is
 * OBSERVED-LAYER ONLY: `LaneStats` aggregates + `ObservedCell`s + counters +
 * notices. It fakes fog deliberately (one stale probe, one unknown cell) so
 * the degradation binding has something to chew on from day one (§4.7).
 *
 * Presentation-side discipline (CONVENTIONS §4 renderer carve-out): floats and
 * a seeded LCG are allowed HERE because this mock is not the sim; the real
 * @hh/sim-core driver will replace it behind `SimRunner` unchanged.
 */
import {
  ResolutionBand,
  asEntityId,
  observedKey,
  type EntityId,
  type LaneStats,
  type ObservedKey,
  type PlayerIntent,
  type SimTimeUs,
} from "@hh/sim-core";
import {
  displayToFixed,
  type EventNotice,
  type ProtoCell,
  type SimProjection,
} from "../shared/protocol";

/* ═══════════════════════════ Seeded presentation jitter ══════════════════════ */

/** mulberry32 — deterministic toy RNG keyed by the boot seed. */
function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ═══════════════════════════ Toy model constants ═══════════════════════════ */

const LANE_ID = asEntityId("lane/ingress-1");
const APP_NODE_ID = asEntityId("node/app-1");
const SERVE_CAP_PER_SEC = 4; // units/s the app node can drain at 1×
const QUEUE_SOFT_CAP = 60; // patience horizon — overflow starts bouncing
const TICK_REAL_MS = 100; // 10 Hz emit cadence (worker→main, §7.0)
const SIM_SECONDS_PER_REAL_SECOND = 60; // 1 real s = 1 sim min at 1×

type ToyState = {
  simUs: SimTimeUs;
  tick: bigint;
  inflight: number;
  queueDepth: number;
  served: number;
  bounced: number;
  falsePositives: number;
  landed: number;
  aggression: number; // 0..1 from the defense slider
  freeCash: number; // µ$ display toy
};

/* ═══════════════════════════ The mock ═══════════════════════════════════════ */

export class MockSimRunner {
  readonly runnerId = "mock" as const;
  readonly engineVersion = "proto-mock-0.1.0";

  private state: ToyState;
  private seq = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private emit: ((p: SimProjection) => void) | null = null;
  private readonly rng: () => number;
  private speedX: 1 | 2 | 4 = 1;

  constructor(seed: number) {
    this.rng = makeRng(seed);
    this.state = {
      simUs: 0n,
      tick: 0n,
      inflight: 0,
      queueDepth: 0,
      served: 0,
      bounced: 0,
      falsePositives: 0,
      landed: 0,
      aggression: 0.2,
      freeCash: 12_500_000_000, // $12.5k free bucket
    };
  }

  start(emit: (p: SimProjection) => void): void {
    if (this.timer !== null) throw new Error("MockSimRunner already started");
    this.emit = emit;
    this.timer = setInterval(() => this.headlessStep(TICK_REAL_MS), TICK_REAL_MS);
    this.headlessStep(TICK_REAL_MS); // one projection immediately so first paint isn't empty
  }

  /** Single manual advance (tests + fake worker drive this; no timers). */
  headlessStep(dtRealMs: number): SimProjection {
    const projection = this.stepAndEmit(dtRealMs);
    this.emit?.(projection);
    return projection;
  }

  stop(): void {
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = null;
    this.emit = null;
  }

  setSpeed(speedX: 1 | 2 | 4): void {
    this.speedX = speedX;
  }

  /** The mock understands the G1 surface: aggression slider + scale-out verb. */
  submit(intent: PlayerIntent): void {
    if (intent.payload.kind === "slider" && intent.payload.control === "defense.aggression") {
      const v = Number(intent.payload.value) / 65536;
      this.state.aggression = Math.max(0, Math.min(1, v));
    }
    if (intent.payload.kind === "verb" && intent.payload.verb === "scale-out") {
      // each scale-out buys a little more drain rate (toy economy)
      this.inflightCapBonus += 2;
    }
  }

  private inflightCapBonus = 0;

  /* ───────────────────────── one tick of the toy ───────────────────────── */

  private stepAndEmit(dtRealMs: number): SimProjection {
    const dtSimSec = (dtRealMs / 1000) * SIM_SECONDS_PER_REAL_SECOND * this.speedX;
    const minutes = Number(this.state.simUs / 60_000_000n);

    // Envelope: diurnal baseline + a scripted spike every ~90 sim minutes.
    const diurnal = 2.4 + 1.3 * Math.sin((minutes / 30) * Math.PI);
    const spikePhase = minutes % 90;
    const spiking = spikePhase < 12;
    const arrivalPerSec = spiking ? diurnal * 3.2 : diurnal;

    const arrivals = Math.max(0, Math.round(arrivalPerSec * dtSimSec + (this.rng() - 0.5)));
    this.state.inflight += arrivals;

    // Defense: aggression inspects a slice of arrivals; a share are false
    // positives (amber-403 — paying traffic bounced by the filter).
    const inspected = Math.floor(this.state.inflight * this.state.aggression * 0.4);
    const fpShare = 0.12 + this.state.aggression * 0.55;
    const fps = Math.floor(inspected * fpShare);
    const blocked = inspected - fps; // "correctly" held (threats, in the toy)

    // Queueing: drain up to capacity, the rest waits; overflow bounces
    // silently (patience horizon).
    const capacity = (SERVE_CAP_PER_SEC + this.inflightCapBonus) * dtSimSec;
    const served = Math.min(Math.max(0, this.state.inflight - inspected + fps), Math.floor(capacity));
    this.state.inflight -= served;
    this.state.inflight -= blocked; // threats removed by the filter

    this.state.queueDepth = Math.max(0, this.state.inflight);
    const overflow = Math.max(0, this.state.queueDepth - QUEUE_SOFT_CAP);
    this.state.queueDepth -= overflow;
    this.state.bounced += overflow;

    // Rare scripted breach: at very high pressure some malicious pass through.
    if (spiking && this.rng() < 0.15 * this.state.aggression) {
      this.state.landed += 1;
    }
    this.state.inflight = Math.max(0, this.state.inflight - overflow);

    this.state.served += served;
    this.state.falsePositives += fps;
    this.state.freeCash += served * 3_200 - fps * 4_100 - overflow * 900; // toy µ$ flow
    this.state.simUs += BigInt(Math.round(dtSimSec * 1_000_000));
    this.state.tick += 1n;

    return this.projection();
  }

  /* ────────────────────── projection building blocks ────────────────────── */

  private rho(): number {
    const load = (SERVE_CAP_PER_SEC + this.inflightCapBonus) * 60;
    const minutes = Number(this.state.simUs / 60_000_000n);
    const diurnal = 2.4 + 1.3 * Math.sin((minutes / 30) * Math.PI);
    return Math.min(1.45, (diurnal * 60) / load + this.state.queueDepth / (QUEUE_SOFT_CAP * 2));
  }

  private health(): number {
    const knee = Math.max(0, this.rho() - 0.7); // ρ/(1−ρ) pain past the knee
    return Math.max(0.05, 1 - knee * 1.4 - this.state.queueDepth / (QUEUE_SOFT_CAP * 3));
  }

  /** Deterministic pure-snapshot of the observed layer for the current state. */
  projection(): SimProjection {
    const rhoFixed = displayToFixed(Math.min(1, this.rho()));
    const health = this.health();
    const minutes = Number(this.state.simUs / 60_000_000n);
    const ratePerMin =
      (2.4 + 1.3 * Math.sin((minutes / 30) * Math.PI)) *
      (minutes % 90 < 12 ? 3.2 : 1) *
      60;

    const lane: LaneStats = {
      laneId: LANE_ID,
      ratePerMin: displayToFixed(ratePerMin),
      latencyDistributionRef: "hist/app-1/p50-p95-p99",
      classMix: {
        standard: displayToFixed(0.7),
        express: displayToFixed(0.3),
      },
      health: displayToFixed(health),
    };

    const observed = new Map<ObservedKey, ProtoCell>();
    observed.set(observedKey(APP_NODE_ID, "utilizationRho"), liveCell(rhoFixed, ResolutionBand.Medium));
    observed.set(observedKey(APP_NODE_ID, "health"), liveCell(displayToFixed(health), ResolutionBand.Medium));
    observed.set(observedKey(APP_NODE_ID, "queueDepth"), intCell(this.state.queueDepth, ResolutionBand.Fine));
    // Faked fog — the seam exists day one:
    // a 30s-stale probe keeps its last value with status stale (§4.1 R-68).
    observed.set(observedKey(APP_NODE_ID, "p50LatencyUs"), {
      value: 118_000 + this.state.queueDepth * 4_000,
      fidelity: ResolutionBand.Coarse,
      freshnessUs: 30_000_000n,
      coverage: displayToFixed(0.55),
      certainty: displayToFixed(0.4),
      status: "stale",
    });
    // Uninstrumented property: nothing, not zero (§4.1 R-66).
    observed.set(observedKey(APP_NODE_ID, "p99LatencyUs"), {
      value: null,
      fidelity: ResolutionBand.None,
      freshnessUs: 0n,
      coverage: 0n,
      certainty: 0n,
      status: "unknown",
    });
    observed.set(observedKey(LANE_ID, "served"), intCell(this.state.served, ResolutionBand.Exact));
    observed.set(observedKey(LANE_ID, "bounced"), intCell(this.state.bounced, ResolutionBand.Exact));
    observed.set(observedKey(LANE_ID, "falsePositives"), intCell(this.state.falsePositives, ResolutionBand.Exact));
    observed.set(observedKey(LANE_ID, "landed"), intCell(this.state.landed, ResolutionBand.Exact));

    const notices: EventNotice[] = [];
    if (this.state.bounced > 0) {
      notices.push({ kind: "bounce", laneId: LANE_ID, atUs: this.state.simUs });
    }
    if (this.state.falsePositives > 0) {
      notices.push({ kind: "false-positive", laneId: LANE_ID, atUs: this.state.simUs });
    }
    if (this.state.landed > 0) {
      notices.push({ kind: "landed", laneId: LANE_ID, atUs: this.state.simUs });
    }
    if (minutes % 90 < 12) {
      notices.push({ kind: "arrival-surge", laneId: LANE_ID, atUs: this.state.simUs });
    }

    return {
      seq: ++this.seq,
      tick: this.state.tick,
      minute: minutes,
      clocks: {
        realUs: this.state.simUs / BigInt(SIM_SECONDS_PER_REAL_SECOND),
        simUs: this.state.simUs,
        businessUs: this.state.simUs / 4n, // toy macro ratio; real kernel owns this
        wallUs: this.state.simUs / BigInt(SIM_SECONDS_PER_REAL_SECOND),
      },
      lanes: [lane],
      observed,
      notices,
      counters: {
        served: this.state.served,
        bounced: this.state.bounced,
        blockedFalsePositive: this.state.falsePositives,
        landed: this.state.landed,
      },
      freeCashMicroUsd: BigInt(Math.round(this.state.freeCash)),
    };
  }
}

function liveCell(value: bigint, fidelity: ResolutionBand): ProtoCell {
  return {
    value,
    fidelity,
    freshnessUs: 2_000_000n,
    coverage: displayToFixed(0.9),
    certainty: displayToFixed(0.85),
    status: "live",
  };
}

function intCell(value: number, fidelity: ResolutionBand): ProtoCell {
  return {
    value,
    fidelity,
    freshnessUs: 1_000_000n,
    coverage: displayToFixed(1),
    certainty: displayToFixed(0.95),
    status: "live",
  };
}

/*
 * Stats-not-entities law (§7.7b): this toy keeps no per-unit truth and the
 * projection type has no field that could carry one — units can never leak
 * across the seam by construction.
 */
