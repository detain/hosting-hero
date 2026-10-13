/**
 * ADR-0012 host-wiring proof (reconciliation lane @cdb2bc5): the recovery
 * ENGINE's story rides the unattended weekend end to end — a node struggles,
 * a shadow window opens, a second failure inside it locks the node to floor
 * posture, the ramp restores full arms, and every beat lands on the report's
 * `recoveryNotices` witness channel. Discrimination is tested on the SAME
 * traffic: a struggle while a window is LIVE mints second-failure +
 * lock-engaged; the identical struggle AFTER the window CLEARED mints a plain
 * episode. Default-off arm: config without `recovery` keeps the report key
 * absent and the run byte-identical (the sparse-witness law, mirrors of
 * `finalAttention` @8994f96 and `refusedSettlements` @984759b).
 *
 * Minute pins below are EMPIRICAL (probe @cdb2bc5 tree, seed UA_SEED):
 * the surge burst mints the episode at m1; the retry tail keeps the node
 * struggling to ~m22; the window opens at m23; the scheduled wave's tail
 * bounces inside it at m25 (STRIKE); the lock holds to m37, the re-anchored
 * ramp closes at m50 untouched → window-cleared with full 3 arms.
 */

import { describe, expect, it } from "vitest";
import { asEntityId, asCauseId } from "../../types.ts";
import { fromInt } from "../../kernel/fixed.ts";
import { makeSurgeWindow, runUnattendedWithSurge } from "../fastForward.ts";
import type { RunUnattendedConfig } from "../fastForward.ts";
import { uaConfig } from "./fixtures.ts";

/* ─────────────────────────── the storm recipe ─────────────────────────── */

/** One 3-arm front door: 20s service ⇒ ~9 units/min capacity. Baseline 1/min
 *  is quiet weather; ×30 surge and the scheduled wave both overrun it. */
const BURSTY_BOARD = Object.freeze({
  nodes: Object.freeze([
    Object.freeze({ id: "web-1", slots: 3, serviceTimeUs: 20_000_000n }),
  ]),
  edges: Object.freeze([]),
});

/** One 10-minute concurrency storm at full budget, scheduled from
 *  `waveStartMinute` (back-to-back scheduling law ⇒ the wave IS the burst). */
function burstTable(): unknown {
  return Object.freeze({
    id: "ua-recovery-forwarding",
    typeBundleId: "shared-web",
    tuningSheet: "A",
    unitsPerPressurePoint: 1,
    waves: Object.freeze([
      Object.freeze({
        n: 1,
        windowMinutes: 10,
        rampMin: 1,
        plateauMin: 8,
        decayMin: 1,
        parPct: 100,
        hard: false,
        entries: Object.freeze([
          Object.freeze({
            threatId: "ua-recovery-swarm",
            role: "swarm",
            family: "malicious",
            band: "storm",
            sharePct: 100,
            denominations: Object.freeze(["concurrency"]),
            targets: Object.freeze(["web-1"]),
          }),
        ]),
      }),
    ]),
  });
}

/** Threshold 1 (not the shipped 2): every attributed bounce struggles —
 *  the host wiring test wants the WINDOW story, not the dice tail. */
const RECOVERY = Object.freeze({
  windowMinutes: 12,
  rampMinutes: 4,
  floorSlots: 1,
  struggleBounceThreshold: 1,
  quietMinutes: 1,
});

/** Surge covers minutes 1–8 (the first burst); it ends long before the
 *  wave, so the ONLY way a second-failure fires is the engine's window. */
const SURGE = makeSurgeWindow(fromInt(30), 1, 8);

function stormConfig(waveStartMinute: number, overrides: Partial<RunUnattendedConfig> = {}): RunUnattendedConfig {
  return uaConfig({
    ticks: 90n,
    board: BURSTY_BOARD,
    defaultPatienceMin: 1,
    traffic: {
      baselineRatePerMin: fromInt(1),
      table: burstTable(),
      waveStartMinute,
    },
    ...overrides,
  });
}

/* ─────────────────────────── the strike story ─────────────────────────── */

describe("recovery witnesses ride the unattended report (ADR-0012 host wiring)", () => {
  it("armed weekend: struggle → window opens → strike locks → ramps back to full", () => {
    const report = runUnattendedWithSurge(
      stormConfig(13, { recovery: RECOVERY }),
      SURGE,
    );
    const notices = report.recoveryNotices;
    expect(notices).toBeDefined();
    // Full empirical arc, minute-for-minute (probe-captured @cdb2bc5):
    expect(notices!.map((n) => `${n.kind}@${n.atMinute}`)).toEqual([
      "episode@1",
      "window-opened@23",
      "second-failure@25",
      "lock-engaged@25",
      "window-cleared@50",
    ]);
    // Posture truth per beat: full arms at the episode, clamped to the
    // floor through the lock, and RESTORED to 3 arms at the clear.
    expect(notices!.map((n) => n.effectiveSlots)).toEqual([3, 1, 1, 1, 3]);
    expect(notices!.map((n) => n.strikes)).toEqual([0, 0, 1, 1, 1]);
    expect(notices!.every((n) => n.nodeId === asEntityId("web-1"))).toBe(true);
    for (const n of notices!) {
      expect(n.causeId).toBe(asCauseId(`recovery:${n.kind}:web-1:${n.atMinute}`));
    }
    // The engine clamped REAL serves: checkpoint digests inside the lock
    // window differ from the unarmed twin (throttle is ground truth), while
    // every checkpoint BEFORE the window opened agrees byte-for-byte.
    const armed = runUnattendedWithSurge(
      stormConfig(13, { recovery: RECOVERY, checkpointEvery: 10 }),
      SURGE,
    );
    const plain = runUnattendedWithSurge(stormConfig(13, { checkpointEvery: 10 }), SURGE);
    expect(armed.finalDigest).toBe(plain.finalDigest); // the episode washes out
    // While the story is being told, the armed digest differs from its
    // unarmed twin — the recovery slice (episode minute, window posture) is
    // GROUND TRUTH absorbed by digest.ts. When the window clears at m50 the
    // slice self-expires and byte-identity with the unarmed run returns:
    // recovery is a temporary posture, not a permanent scar.
    const byTick = (r: typeof armed) => new Map(r.perCheckpoint.map((c) => [Number(c.tick), c.digest]));
    const a = byTick(armed);
    const p = byTick(plain);
    for (const t of [10, 20, 30, 40]) {
      expect(a.get(t), `digest at t${t} should differ (recovery slice live)`).not.toBe(p.get(t));
    }
    for (const t of [50, 60, 70, 80, 90]) {
      expect(a.get(t), `digest at t${t} should agree (window cleared)`).toBe(p.get(t));
    }
  });

  it("discrimination: the SAME struggle is an episode once the window cleared", () => {
    // Identical surge, identical wave — only the schedule moves: the wave
    // now lands at m60, long after the first window CLEARED at m34.
    const report = runUnattendedWithSurge(
      stormConfig(60, { recovery: RECOVERY }),
      SURGE,
    );
    const notices = report.recoveryNotices as readonly { kind: string; atMinute: number }[];
    const kinds = notices.map((n) => `${n.kind}@${n.atMinute}`);
    // Act one: the surge story closes WITHOUT a strike (no wave inside it).
    expect(kinds.slice(0, 3)).toEqual(["episode@1", "window-opened@21", "window-cleared@34"]);
    // Act two: the m60 wave's first bounce mints a plain EPISODE (strikes 0,
    // full arms) — at m25 the identical bounce minted second-failure+lock.
    const waveBeat = notices.find((n) => n.atMinute === 60);
    expect(waveBeat!.kind).toBe("episode");
    // A later strike IS legal here: the wave's own retry tail re-enters the
    // SECOND window (opened m70). Authority is positional, not nostalgic —
    // this is exactly the discrimination the dual design used to blur.
    const second = notices.filter((n) => n.kind === "second-failure");
    expect(second.length).toBe(1);
    expect(second[0]!.atMinute).toBeGreaterThan(70);
  });

  it("default OFF: unarmed reports carry no recovery key and run byte-identical", () => {
    const a = runUnattendedWithSurge(stormConfig(13), SURGE);
    const b = runUnattendedWithSurge(stormConfig(13), SURGE);
    expect(Object.keys(a)).not.toContain("recoveryNotices");
    expect(a.finalDigest).toBe(b.finalDigest);
    expect(a.perCheckpoint.map((c) => c.digest)).toEqual(b.perCheckpoint.map((c) => c.digest));
    // Armed-but-quiet is the honest empty array, not a missing key.
    const calm = runUnattendedWithSurge(
      uaConfig({ ticks: 30n, recovery: RECOVERY }),
      null,
    );
    expect(calm.recoveryNotices).toEqual([]);
  });
});
