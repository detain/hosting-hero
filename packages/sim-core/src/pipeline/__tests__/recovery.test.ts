/**
 * §7.7 recovery-half laws (pipeline/recovery.ts) — every law falsifiable:
 *  1. second-failure-window escalation (2× ramp inside, base ramp outside);
 *  2. blameless post-mortem HALVES the escalation excess, exactly once
 *     (§5.10 honestHostFloor precedent);
 *  3. safe-mode derate arithmetic (floor→full, exact integer bps);
 *  4. failback hold — steer-back refuses inside the delay, opens at it;
 *  5. crew serialization + the priority flip (recovery ORDER matters);
 *  6. degradation-debt meter == wall minutes below full capacity;
 *  7. quiet-tick identity (the observer folds nothing when nothing happens);
 *  8. DIGEST NEUTRALITY through the real driver (71b8960 precedent): wired
 *     vs bare runs produce byte-identical digestState chains ×10, while the
 *     observer provably fires (not a silent-board proof).
 */

import { describe, expect, it } from "vitest";
import type { BouncedEvent, EntityId, SimEvent, SimTimeUs } from "../../types.ts";
import { asCauseId, asEntityId, asRunSeed } from "../../types.ts";
import { fromInt } from "../../kernel/fixed.ts";
import { initialClocks } from "../../kernel/time.ts";
import { streamFor } from "../../kernel/rng.ts";
import { createDefaultSlots, createInitialState, createTickDriver, digestState } from "../index.ts";
import {
  acceptsFailback,
  createRecoveryTracker,
  declareRecoveryFailure,
  markBlamelessPostmortem,
  nodeRecovery,
  observeRecoveryTick,
  recoveryCapacityBps,
  resolveRecoveryTuning,
  secondFailureWindowActive,
  setRecoveryPriority,
  type RecoveryTrackerState,
  type RecoveryTransition,
} from "../recovery/tracker.ts";
import { DEFAULT_CLASSES, IDS, envelope, node, retryPolicy, testConfig, tickInputs } from "./helpers.ts";

const MIN = 60_000_000n;
const EDGE = IDS.edge;
const ORIGIN = IDS.origin;

const TUNE = resolveRecoveryTuning(); // defaults: ramp 30, window 60, ×2, floor 2500, failback 15, crew 1, delay 5

function bounced(nodeId: EntityId | null, unit: string, minute: number): SimEvent {
  return Object.freeze({
    kind: "bounced",
    atUs: BigInt(minute) * MIN as SimTimeUs,
    tick: BigInt(minute),
    causeId: asCauseId(`test:bounce:${unit}`),
    unitId: asEntityId(unit),
    nodeId,
  } satisfies BouncedEvent);
}

function bounces(nodeId: EntityId, minute: number, count: number): readonly SimEvent[] {
  return Array.from({ length: count }, (_, i) => bounced(nodeId, `${nodeId}-b${minute}-${i}`, minute));
}

function run(script: readonly (readonly [number, readonly SimEvent[]])[], from: RecoveryTrackerState = createRecoveryTracker(), tune = TUNE) {
  let state = from;
  const log: RecoveryTransition[] = [];
  for (const [minute, events] of script) {
    const out = observeRecoveryTick(state, { minute, events }, tune);
    state = out.state;
    log.push(...out.transitions);
  }
  return { state, log };
}

describe("tracker birth + quiet-tick identity", () => {
  it("a fresh tracker is empty and answers healthy at full capacity", () => {
    const t = createRecoveryTracker();
    expect(t.nodes.size).toBe(0);
    expect(nodeRecovery(t, EDGE).phase).toBe("healthy");
    expect(recoveryCapacityBps(t, EDGE, 999, TUNE)).toBe(10_000n);
    expect(acceptsFailback(t, EDGE, 999)).toBe(false); // healthy never "fails back"
    expect(secondFailureWindowActive(t, EDGE, 999, TUNE)).toBe(false);
  });

  it("re-observing the same minute with no events returns the SAME state object", () => {
    const failed = declareRecoveryFailure(createRecoveryTracker(), EDGE, 0, TUNE).state;
    const out = observeRecoveryTick(failed, { minute: 0, events: [] }, TUNE);
    expect(out.state).toBe(failed); // identity — fold-free quiet witness
    expect(out.transitions).toEqual([]);
  });

  it("a clock jump over an empty world updates only the minute", () => {
    const out = observeRecoveryTick(createRecoveryTracker(), { minute: 42, events: [bounced(null, "n", 42)] }, TUNE);
    expect(out.state.minute).toBe(42);
    expect(out.state.nodes.size).toBe(0); // null-node bounces have no subject
    expect(out.transitions).toEqual([]);
  });
});

describe("failure detection from terminal outcomes", () => {
  it("at-threshold bounces fail the node with a base-length ramp", () => {
    const { state, log } = run([[10, bounces(EDGE, 10, 4)]]);
    expect(nodeRecovery(state, EDGE).phase).toBe("failed");
    expect(log.map((t) => `${t.kind}@${t.atMinute}`)).toEqual(["node-failed@10"]);
    expect(log[0]?.detail).toBe("ramp=30");
    expect(log[0]?.causeId).toBe("recovery:node-failed:edge:10");
    expect(recoveryCapacityBps(state, EDGE, 10, TUNE)).toBe(0n); // v0: down until the crew starts
    expect(secondFailureWindowActive(state, EDGE, 10, TUNE)).toBe(true); // the amber bar
  });

  it("one bounce short of the threshold stays healthy", () => {
    const { state } = run([[10, bounces(EDGE, 10, 3)]]);
    expect(state.nodes.size).toBe(0);
  });

  it("declared failure on an already-failed node throws (a host bug, said loud)", () => {
    const failed = declareRecoveryFailure(createRecoveryTracker(), EDGE, 0, TUNE).state;
    expect(() => declareRecoveryFailure(failed, EDGE, 3, TUNE)).toThrow(/recovery\[RECOVERY_BAD_PHASE\] at 'edge'/);
  });

  it("backwards clocks throw", () => {
    const { state } = run([[10, bounces(EDGE, 10, 4)]]);
    expect(() => observeRecoveryTick(state, { minute: 9, events: [] }, TUNE)).toThrow(/RECOVERY_BAD_CLOCK/);
    expect(() => declareRecoveryFailure(state, ORIGIN, 9, TUNE)).toThrow(/RECOVERY_BAD_CLOCK/);
  });
});

describe("safe mode — the gradual restore ramp arithmetic", () => {
  it("failed → recovering after the dispatch delay, floor→full, exact bps", () => {
    const declared = declareRecoveryFailure(createRecoveryTracker(), EDGE, 0, TUNE).state;
    const started = observeRecoveryTick(declared, { minute: 5, events: [] }, TUNE);
    expect(started.transitions.map((t) => t.kind)).toEqual(["recovery-started"]);
    expect(recoveryCapacityBps(started.state, EDGE, 5, TUNE)).toBe(2_500n); // safe-mode floor at ramp start
    expect(recoveryCapacityBps(started.state, EDGE, 20, TUNE)).toBe(6_250n); // halfway: 2500 + 7500×0.5
    expect(recoveryCapacityBps(started.state, EDGE, 34, TUNE)).toBe(9_749n); // floor(29/30 progress, floored twice)
    const done = observeRecoveryTick(started.state, { minute: 35, events: [] }, TUNE);
    expect(done.transitions.map((t) => t.kind)).toEqual(["recovery-completed"]);
    expect(nodeRecovery(done.state, EDGE).phase).toBe("recovered");
    expect(recoveryCapacityBps(done.state, EDGE, 35, TUNE)).toBe(10_000n);
  });

  it("degradedMinutes == the wall minutes spent below capacity (5 failed + 30 ramp)", () => {
    const declared = declareRecoveryFailure(createRecoveryTracker(), EDGE, 0, TUNE).state;
    const { state } = run([[5, []], [35, []]], declared);
    expect(nodeRecovery(state, EDGE).degradedMinutes).toBe(35);
  });

  it("an earlier completion minute reported late still uses the EXACT completion stamp", () => {
    const declared = declareRecoveryFailure(createRecoveryTracker(), EDGE, 0, TUNE).state;
    const { state, log } = run([[5, []], [100, []]], declared); // sampling skips past 35
    expect(log.map((t) => `${t.kind}@${t.atMinute}`)).toEqual(["recovery-started@5", "recovery-completed@35"]);
    expect(nodeRecovery(state, EDGE).recoveredAtMinute).toBe(35);
    expect(nodeRecovery(state, EDGE).failbackEligibleAtMinute).toBe(50);
  });
});

describe("failback hold — getting home waits", () => {
  it("steer-back is refused through the hold and opens exactly at it", () => {
    const declared = declareRecoveryFailure(createRecoveryTracker(), EDGE, 0, TUNE).state;
    const { state } = run([[5, []], [35, []]], declared); // recovered at 35
    expect(acceptsFailback(state, EDGE, 35)).toBe(false);
    expect(acceptsFailback(state, EDGE, 49)).toBe(false);
    expect(acceptsFailback(state, EDGE, 50)).toBe(true); // 35 + 15
  });

  it("with a zero failback delay, recovery completion immediately accepts (the knob is live)", () => {
    const now = resolveRecoveryTuning(TUNE, { failbackDelayMinutes: 0 });
    const declared = declareRecoveryFailure(createRecoveryTracker(), EDGE, 0, now).state;
    const { state } = run([[5, []], [35, []]], declared, now);
    expect(acceptsFailback(state, EDGE, 35)).toBe(true);
  });
});

describe("the Second Failure Window", () => {
  const recoveredScript: readonly (readonly [number, readonly SimEvent[]])[] = [
    [0, bounces(EDGE, 0, 4)], // failed at 0
    [5, []], // ramp 5→35
    [35, []], // recovered at 35
  ];

  it("re-failure inside the window doubles the ramp and marks second-failure", () => {
    const { state, log } = run([...recoveredScript, [60, bounces(EDGE, 60, 4)]]); // 25m after 35 < 60
    expect(nodeRecovery(state, EDGE).secondFailure).toBe(true);
    expect(nodeRecovery(state, EDGE).rampMinutes).toBe(60); // 30 × 2
    expect(log.map((t) => t.kind)).toEqual([
      "node-failed",
      "recovery-started",
      "recovery-completed",
      "node-failed",
      "second-failure",
    ]);
    // and the escalated ramp runs its full 60: crew starts at 65, complete at 125
    const later = run([[65, []], [125, []]], state);
    expect(later.log.map((t) => `${t.kind}@${t.atMinute}`)).toEqual(["recovery-started@65", "recovery-completed@125"]);
  });

  it("re-failure OUTSIDE the window is a fresh incident at base length", () => {
    const { state, log } = run([...recoveredScript, [96, bounces(EDGE, 96, 4)]]); // 61m after 35 ≥ 60
    expect(nodeRecovery(state, EDGE).secondFailure).toBe(false);
    expect(nodeRecovery(state, EDGE).rampMinutes).toBe(30);
    expect(log.filter((t) => t.kind === "second-failure")).toEqual([]);
  });

  it("the danger bar closes exactly when the window ends", () => {
    const { state } = run(recoveredScript);
    expect(secondFailureWindowActive(state, EDGE, 94, TUNE)).toBe(true); // 35+59
    expect(secondFailureWindowActive(state, EDGE, 95, TUNE)).toBe(false); // 35+60
  });

  it("a post-mortem halves the escalation EXCESS, consumed exactly once", () => {
    const credited = markBlamelessPostmortem(run(recoveredScript).state, EDGE, 40).state;
    const { state, log } = run([[60, bounces(EDGE, 60, 4)]], credited);
    expect(nodeRecovery(state, EDGE).rampMinutes).toBe(45); // 30 × 1.5
    expect(nodeRecovery(state, EDGE).postmortemCredit).toBe(false);
    expect(log.some((t) => t.kind === "second-failure" && t.detail === "escalation halved by postmortem credit")).toBe(true);
    // a THIRD failure inside the next window pays FULL base escalation again —
    // escalation rides baseRampMinutes and never compounds (60 × 2 would be a spiral)
    const cycle = run([[65, []], [110, []], [126, bounces(EDGE, 126, 4)]], state);
    // 65 start + 45 ramp ⇒ recovered at 110; 126 is 16m later ⇒ inside the 60m window
    expect(nodeRecovery(cycle.state, EDGE).rampMinutes).toBe(60); // 30 × 2, credit already spent
  });

  it("post-mortem refusals: unknown incident and double credit both throw", () => {
    expect(() => markBlamelessPostmortem(createRecoveryTracker(), EDGE, 5)).toThrow(/RECOVERY_UNKNOWN_NODE/);
    const { state } = run(recoveredScript);
    const once = markBlamelessPostmortem(state, EDGE, 40);
    expect(once.transitions.map((t) => t.kind)).toEqual(["postmortem-credited"]);
    expect(() => markBlamelessPostmortem(once.state, EDGE, 41)).toThrow(/RECOVERY_BAD_PHASE/);
  });
});

describe("recovery crew — order matters", () => {
  function twoFailures() {
    const a = declareRecoveryFailure(createRecoveryTracker(), EDGE, 0, TUNE).state;
    return declareRecoveryFailure(a, ORIGIN, 1, TUNE).state;
  }

  it("one crew slot: the earlier failure ramps first, the other waits", () => {
    const { state, log } = run([[5, []], [35, []]], twoFailures());
    expect(log.map((t) => `${t.kind}:${t.nodeId}@${t.atMinute}`)).toEqual([
      "recovery-started:edge@5",
      "recovery-completed:edge@35",
      "recovery-started:origin@35", // crew frees at the exact completion minute
    ]);
    expect(nodeRecovery(state, ORIGIN).phase).toBe("recovering");
  });

  it("setRecoveryPriority FLIPS the queue for the same seed and failures", () => {
    const boosted = setRecoveryPriority(twoFailures(), ORIGIN, 5);
    const { log } = run([[6, []]], boosted.state); // minute 6: both crashes have their cart (5m delay)
    expect(log.map((t) => `${t.kind}:${t.nodeId}@${t.atMinute}`)).toEqual(["recovery-started:origin@6"]);
    const { log: baseline } = run([[6, []]], twoFailures()); // NO priority ⇒ earlier crash wins
    expect(baseline.map((t) => `${t.kind}:${t.nodeId}@${t.atMinute}`)).toEqual(["recovery-started:edge@6"]);
  });

  it("priority on an untracked node throws; non-integer throws", () => {
    expect(() => setRecoveryPriority(createRecoveryTracker(), EDGE, 1)).toThrow(/RECOVERY_UNKNOWN_NODE/);
    expect(() => setRecoveryPriority(twoFailures(), EDGE, 1.5)).toThrow(/RECOVERY_BAD_VALUE/);
  });
});

describe("tuning parse (fail-loud boundary)", () => {
  it("unknown keys refuse by name", () => {
    expect(() => resolveRecoveryTuning(TUNE, { rampOfDoom: 3 })).toThrow(/recovery\[RECOVERY_UNKNOWN_KEY\] at 'cfg.rampOfDoom'/);
  });
  it("degenerate values refuse: zero threshold, zero crew, zero ramp, shrinking multiplier, out-of-band floor, floats", () => {
    expect(() => resolveRecoveryTuning(TUNE, { failureBounceThreshold: 0 })).toThrow(/RECOVERY_BAD_VALUE/);
    expect(() => resolveRecoveryTuning(TUNE, { recoveryCrewSlots: 0 })).toThrow(/RECOVERY_BAD_VALUE/);
    expect(() => resolveRecoveryTuning(TUNE, { baseRampMinutes: 0 })).toThrow(/RECOVERY_BAD_VALUE/);
    expect(() => resolveRecoveryTuning(TUNE, { secondFailureRampMultiplierBps: 9_999n })).toThrow(/RECOVERY_BAD_VALUE/);
    expect(() => resolveRecoveryTuning(TUNE, { safeModeFloorBps: 10_001n })).toThrow(/RECOVERY_BAD_VALUE/);
    expect(() => resolveRecoveryTuning(TUNE, { failbackDelayMinutes: 2.5 })).toThrow(/RECOVERY_BAD_VALUE/);
  });
  it("the resolved tuning is frozen", () => {
    expect(Object.isFrozen(resolveRecoveryTuning(TUNE, { failbackDelayMinutes: 0 }))).toBe(true);
  });
});

describe("replay stability of the transition log", () => {
  it("the same observed event sequence re-derives byte-identical transitions ×100", () => {
    const script: (readonly [number, readonly SimEvent[]])[] = [
      [4, bounces(EDGE, 4, 5)],
      [9, bounces(ORIGIN, 9, 4)],
      [34, bounces(EDGE, 34, 2)], // below threshold while mid-incident — no effect
      [39, bounces(EDGE, 39, 9)], // bounces during the ramp — incident already open
      [65, []],
      [70, bounces(EDGE, 70, 4)], // second failure inside the window
      [200, []],
    ];
    const first = run(script);
    for (let i = 0; i < 100; i += 1) {
      expect(run(script).log).toEqual(first.log);
    }
    expect(first.log.some((t) => t.kind === "second-failure")).toBe(true);
  });

  it("the observer never mutates its inputs (frozen events, frozen prior state)", () => {
    const events = bounces(EDGE, 7, 4);
    Object.freeze(events);
    const before = createRecoveryTracker();
    const json = JSON.stringify([...before.nodes.entries()]);
    const out = observeRecoveryTick(before, { minute: 7, events }, TUNE);
    expect(JSON.stringify([...before.nodes.entries()])).toBe(json);
    expect(out.state).not.toBe(before);
  });
});

/* ═══════════════════════ digest neutrality through the REAL driver ══════════ */

describe("digest neutrality (71b8960 observer-seam precedent)", () => {
  /** Congested one-slot origin: guaranteed patience bounces by tick ~20. */
  function drive(wired: boolean, ticks: number): { digests: readonly string[]; tracker: RecoveryTrackerState } {
    const config = testConfig({ runSeed: asRunSeed(4242n), defaultPatienceUs: 2n * MIN });
    const slots = createDefaultSlots(config);
    let state = createInitialState({
      runSeed: config.runSeed,
      engineVersion: "test-recovery-neutrality",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
      clocks: initialClocks(),
      nodes: [
        node(EDGE, { slots: 2, serviceUs: 2n * MIN, dep: ORIGIN }),
        node(ORIGIN, { slots: 1, serviceUs: 3n * MIN }),
      ],
    });
    const driver = createTickDriver(slots, streamFor(config.runSeed, "root", 0), state.context.clocks);
    const tune = resolveRecoveryTuning(TUNE, { failureBounceThreshold: 1 }); // any bounce fails a node
    let tracker = createRecoveryTracker();
    const digests: string[] = [];
    for (let t = 1; t <= ticks; t += 1) {
      digests.push(digestState(state));
      const result = driver.advance(
        state,
        tickInputs({
          envelopes: [envelope("base", fromInt(4))],
          classes: DEFAULT_CLASSES,
          retryPolicy: retryPolicy(0),
        }),
      );
      state = result.state;
      if (wired) tracker = observeRecoveryTick(tracker, { minute: t, events: result.events }, tune).state;
    }
    return { digests, tracker };
  }

  it("wired vs bare runs are byte-identical AND the observer provably fired", () => {
    const bare = drive(false, 100);
    const wired = drive(true, 100);
    expect(wired.digests).toEqual(bare.digests); // the chain — 100 digest stamps
    expect(wired.tracker.nodes.size).toBeGreaterThan(0); // NOT a silent-board proof
    expect(nodeRecovery(wired.tracker, EDGE).failures + nodeRecovery(wired.tracker, ORIGIN).failures).toBeGreaterThan(0);
  });

  it("the wired run itself re-runs byte-identical ×10 (replay-stable observer)", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 10; i += 1) seen.add(drive(true, 100).digests.join(","));
    expect(seen.size).toBe(1);
  });
});
