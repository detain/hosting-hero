/**
 * §7.7 recovery-half laws (pipeline/recovery/tracker.ts — the ADVISORY
 * observer) — every law falsifiable:
 *  1. second-failure escalation rides THE SIM AUTHORITY (ADR-0012): the
 *     2× ramp lands iff the ENGINE GameState carries a live window for the
 *     node at failure time, base ramp iff it says peace — and NO observation
 *     without an engine escalates at all;
 *  2. blameless post-mortem HALVES the escalation excess, exactly once
 *     (§5.10 honestHostFloor precedent) — escalation math only, never
 *     reputation (economy/postmortem.ts owns that credit, single source);
 *  3. safe-mode derate arithmetic (floor→full, exact integer bps);
 *  4. failback hold — steer-back refuses inside the delay, opens at it;
 *  5. crew serialization + the priority flip (recovery ORDER matters);
 *  6. degradation-debt meter == wall minutes below full capacity;
 *  7. quiet-tick identity (the observer folds nothing when nothing happens);
 *  8. DIGEST NEUTRALITY through the real driver (71b8960 precedent): wired
 *     vs bare runs produce byte-identical digestState chains ×10, while the
 *     observer provably fires (not a silent-board proof) — AND an observer
 *     reading the LIVE engine slice keeps a recovery-wired run's digests
 *     byte-identical to the same run with the observer unwired (read, never
 *     write).
 */

import { describe, expect, it } from "vitest";
import type {
  BouncedEvent,
  EntityId,
  GameState,
  RecoveryWindowRecord,
  SimEvent,
  SimTimeUs,
} from "../../types.ts";
import { asCauseId, asEntityId, asRunSeed } from "../../types.ts";
import { fromInt } from "../../kernel/fixed.ts";
import { initialClocks } from "../../kernel/time.ts";
import { streamFor } from "../../kernel/rng.ts";
import { createDefaultSlots, createInitialState, createTickDriver, digestState } from "../index.ts";
import { defaultRecoveryConfig } from "../recovery.ts";
import {
  acceptsFailback,
  createRecoveryTracker,
  declareRecoveryFailure,
  deriveDurableImpressions,
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

/* ── the SIM AUTHORITY stand-ins (ADR-0012): the observer escalates ONLY on
   what GameState.recovery says. These carry engine-shaped window records —
   the exact RecoveryWindowRecord field set the real fold emits, so the read
   path (deriveDurableImpressions) is exercised verbatim. ── */

function windowRecord(nodeId: EntityId, phase: RecoveryWindowRecord["phase"]): RecoveryWindowRecord {
  return Object.freeze({
    nodeId,
    phase,
    openedAtMinute: 0,
    closesAtMinute: 1_000,
    lockUntilMinute: phase === "locked" ? 1_000 : 0,
    strikes: 1,
    fullSlots: 2,
    effectiveSlots: 1,
  });
}

/** A GameState whose engine slice has these nodes under a live window. */
function gameUnderWindow(...nodeIds: readonly EntityId[]): GameState {
  return gameWithWindows(nodeIds.map((id) => [id, windowRecord(id, "window")] as const));
}

/** Same, with one node LOCKED (the second-failure posture). */
function gameLocked(nodeId: EntityId): GameState {
  return gameWithWindows([[nodeId, windowRecord(nodeId, "locked")]]);
}

function gameWithWindows(
  entries: readonly (readonly [EntityId, RecoveryWindowRecord])[],
): GameState {
  return Object.freeze({
    recovery: Object.freeze({
      windows: Object.freeze(new Map<EntityId, RecoveryWindowRecord>(entries)),
      lastStruggleMinute: Object.freeze(new Map<EntityId, number>()),
    }),
  }) as unknown as GameState;
}

/** A GameState with the recovery slice materialized but EMPTY — the engine
 *  says peace. (An ABSENT slice is the same answer; both pin it.) */
const PEACE = Object.freeze({
  recovery: Object.freeze({
    windows: Object.freeze(new Map<EntityId, RecoveryWindowRecord>()),
    lastStruggleMinute: Object.freeze(new Map<EntityId, number>()),
  }),
}) as unknown as GameState;

/** A GameState WITHOUT the recovery slice at all — the unwired engine. */
function gameAtPeaceNoSlice(): GameState {
  return Object.freeze({}) as unknown as GameState;
}

type ScriptStep = readonly [number, readonly SimEvent[], GameState?];

function run(script: readonly ScriptStep[], from: RecoveryTrackerState = createRecoveryTracker(), tune = TUNE) {
  let state = from;
  const log: RecoveryTransition[] = [];
  for (const [minute, events, engine] of script) {
    const out = observeRecoveryTick(
      state,
      engine === undefined ? { minute, events } : { minute, events, engine },
      tune,
    );
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
    expect(secondFailureWindowActive(gameAtPeaceNoSlice(), EDGE)).toBe(false); // engine says peace
    expect(secondFailureWindowActive(PEACE, EDGE)).toBe(false);
  });

  it("deriveDurableImpressions answers EMPTY for an absent slice and mirrors the engine otherwise", () => {
    const quiet = deriveDurableImpressions(gameAtPeaceNoSlice());
    expect(quiet.windowNodeIds.size).toBe(0);
    expect(quiet.strikesByNode.size).toBe(0);
    const live = deriveDurableImpressions(gameLocked(EDGE));
    expect([...live.windowNodeIds]).toEqual([EDGE]);
    expect(live.strikesByNode.get(EDGE)).toBe(1); // the record's strikes ride through
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
    // SINGLE AUTHORITY (ADR-0012): the tracker's own `failed` phase must NOT
    // light the amber bar — only the engine's live window does. Here the
    // engine says peace, so the bar is dark despite a failed observation.
    expect(secondFailureWindowActive(PEACE, EDGE)).toBe(false);
    expect(secondFailureWindowActive(gameUnderWindow(EDGE), EDGE)).toBe(true);
    expect(secondFailureWindowActive(gameLocked(EDGE), EDGE)).toBe(true);
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

describe("second-failure escalation rides the engine authority (ADR-0012)", () => {
  const recoveredScript: readonly ScriptStep[] = [
    [0, bounces(EDGE, 0, 4)], // failed at 0 — engine at peace: a FIRST failure
    [5, []], // ramp 5→35
    [35, []], // recovered at 35
  ];

  it("re-failure while the engine window is live doubles the ramp and marks second-failure", () => {
    const { state, log } = run([...recoveredScript, [60, bounces(EDGE, 60, 4), gameUnderWindow(EDGE)]]);
    expect(nodeRecovery(state, EDGE).secondFailure).toBe(true);
    expect(nodeRecovery(state, EDGE).rampMinutes).toBe(60); // 30 × 2
    expect(log.map((t) => t.kind)).toEqual([
      "node-failed",
      "recovery-started",
      "recovery-completed",
      "node-failed",
      "second-failure",
    ]);
    expect(log[3]?.detail).toBe("ramp=60");
    expect(log[4]?.detail).toBe("engine recovery window live");
    // and the escalated ramp runs its full 60: crew starts at 65, complete at 125
    const later = run([[65, []], [125, []]], state);
    expect(later.log.map((t) => `${t.kind}@${t.atMinute}`)).toEqual(["recovery-started@65", "recovery-completed@125"]);
  });

  it("re-failure while the engine says peace is a fresh incident at base length — WITH and WITHOUT a slice", () => {
    for (const peace of [PEACE, gameAtPeaceNoSlice()]) {
      const { state, log } = run([...recoveredScript, [60, bounces(EDGE, 60, 4), peace]]);
      expect(nodeRecovery(state, EDGE).secondFailure).toBe(false);
      expect(nodeRecovery(state, EDGE).rampMinutes).toBe(30);
      expect(log.filter((t) => t.kind === "second-failure")).toEqual([]);
    }
  });

  it("an observation with NO engine never escalates — the observer fabricates no windows", () => {
    // The pre-reconciliation law "25m after a recovery is inside the 60m
    // tail" is DEAD: the same clock, the same script, minus the engine —
    // base ramp, no second-failure mark. Falsifies any reinstated tail.
    const { state, log } = run([...recoveredScript, [60, bounces(EDGE, 60, 4)]]);
    expect(nodeRecovery(state, EDGE).secondFailure).toBe(false);
    expect(nodeRecovery(state, EDGE).rampMinutes).toBe(30);
    expect(log.filter((t) => t.kind === "second-failure")).toEqual([]);
  });

  it("the amber bar is ONLY the engine's live window — the deleted observer tail stays deleted", () => {
    const { state } = run(recoveredScript);
    expect(nodeRecovery(state, EDGE).phase).toBe("recovered"); // tracker memory…
    // …has NO say over the bar: engine peace right at the old "35+59" minute
    // (where the pre-reconciliation knob still glowed) reads dark.
    expect(secondFailureWindowActive(PEACE, EDGE)).toBe(false);
    expect(secondFailureWindowActive(gameAtPeaceNoSlice(), EDGE)).toBe(false);
    expect(secondFailureWindowActive(gameUnderWindow(EDGE), EDGE)).toBe(true);
    expect(secondFailureWindowActive(gameUnderWindow(ORIGIN), EDGE)).toBe(false); // per-node read
  });

  it("a post-mortem halves the escalation EXCESS, consumed exactly once", () => {
    const credited = markBlamelessPostmortem(run(recoveredScript).state, EDGE, 40).state;
    const { state, log } = run([[60, bounces(EDGE, 60, 4), gameUnderWindow(EDGE)]], credited);
    expect(nodeRecovery(state, EDGE).rampMinutes).toBe(45); // 30 × 1.5
    expect(nodeRecovery(state, EDGE).postmortemCredit).toBe(false);
    expect(log.some((t) => t.kind === "second-failure" && t.detail === "escalation halved by postmortem credit")).toBe(true);
    // a THIRD failure inside the next engine window pays FULL base escalation
    // again — escalation rides baseRampMinutes and never compounds (60 × 2
    // would be a spiral)
    const cycle = run([[65, []], [110, []], [126, bounces(EDGE, 126, 4), gameUnderWindow(EDGE)]], state);
    expect(nodeRecovery(cycle.state, EDGE).rampMinutes).toBe(60); // 30 × 2, credit already spent
  });

  it("declareRecoveryFailure rides the same authority: engine window escalates, peace (or none) does not", () => {
    const escalated = declareRecoveryFailure(createRecoveryTracker(), EDGE, 0, TUNE, gameUnderWindow(EDGE));
    expect(nodeRecovery(escalated.state, EDGE).secondFailure).toBe(true); // drill at minute 0, engine live
    expect(nodeRecovery(escalated.state, EDGE).rampMinutes).toBe(60);
    const calm = declareRecoveryFailure(createRecoveryTracker(), EDGE, 0, TUNE);
    expect(nodeRecovery(calm.state, EDGE).secondFailure).toBe(false);
    expect(nodeRecovery(calm.state, EDGE).rampMinutes).toBe(30);
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
  it("unknown keys refuse by name — including the DELETED secondFailureWindowMinutes tail knob (ADR-0012)", () => {
    expect(() => resolveRecoveryTuning(TUNE, { rampOfDoom: 3 })).toThrow(/recovery\[RECOVERY_UNKNOWN_KEY\] at 'cfg.rampOfDoom'/);
    expect(() => resolveRecoveryTuning(TUNE, { secondFailureWindowMinutes: 60 })).toThrow(
      /recovery\[RECOVERY_UNKNOWN_KEY\] at 'cfg.secondFailureWindowMinutes'/,
    );
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
    const script: ScriptStep[] = [
      [4, bounces(EDGE, 4, 5)],
      [9, bounces(ORIGIN, 9, 4)],
      [34, bounces(EDGE, 34, 2)], // below threshold while mid-incident — no effect
      [39, bounces(EDGE, 39, 9)], // bounces during the ramp — incident already open
      [65, []],
      [70, bounces(EDGE, 70, 4), gameUnderWindow(EDGE)], // second failure per the ENGINE authority
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
  function drive(
    wired: boolean,
    ticks: number,
    engineWired: boolean = false,
  ): { digests: readonly string[]; tracker: RecoveryTrackerState; notices: number } {
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
    const driver = createTickDriver(
      slots,
      streamFor(config.runSeed, "root", 0),
      state.context.clocks,
      engineWired ? { recovery: defaultRecoveryConfig() } : {},
    );
    const tune = resolveRecoveryTuning(TUNE, { failureBounceThreshold: 1 }); // any bounce fails a node
    let tracker = createRecoveryTracker();
    let notices = 0;
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
      if (wired) {
        tracker = observeRecoveryTick(
          tracker,
          engineWired
            ? { minute: t, events: result.events, engine: state }
            : { minute: t, events: result.events },
          tune,
        ).state;
      }
      notices += result.recoveryNotices?.length ?? 0;
    }
    return { digests, tracker, notices };
  }

  it("wired vs bare runs are byte-identical AND the observer provably fired", () => {
    const bare = drive(false, 100);
    const wired = drive(true, 100);
    expect(wired.digests).toEqual(bare.digests); // the chain — 100 digest stamps
    expect(wired.tracker.nodes.size).toBeGreaterThan(0); // NOT a silent-board proof
    expect(nodeRecovery(wired.tracker, EDGE).failures + nodeRecovery(wired.tracker, ORIGIN).failures).toBeGreaterThan(0);
  });

  it("an observer fed LIVE engine snapshots changes nothing on a recovery-wired run (ADR-0012 read-not-write)", () => {
    const bare = drive(false, 100, true); // engine wired, observer off
    const watched = drive(true, 100, true); // same engine, observer reads its slice every tick
    expect(watched.digests).toEqual(bare.digests); // reading the authority never writes it
    expect(bare.notices).toBeGreaterThan(0); // the fold actually spoke — not a silent board
    expect(watched.tracker.nodes.size).toBeGreaterThan(0); // and the observer provably fired
  });

  it("the wired run itself re-runs byte-identical ×10 (replay-stable observer)", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 10; i += 1) seen.add(drive(true, 100).digests.join(","));
    expect(seen.size).toBe(1);
  });
});
