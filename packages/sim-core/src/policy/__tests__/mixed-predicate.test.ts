/**
 * Mixed-predicate snapshot-visibility differential (R6 review item 2(b),
 * promoted from /tmp/opencode/r6-probe/probe2b-policy-mixed.ts).
 *
 * After the 734ea56 hot-loop rewrite the comparator-family dispatch and the
 * direct-write snapshot path (scratch.snapWrites → snapshots merge) became the
 * drift surface: a numeric predicate (`>`) and a counter predicate (`changed`,
 * `fails`, `completes`) SHARING one observed key exercise both arms in one
 * rule pass, and no other in-repo test pinned that combination against the
 * pre-optimization semantics. This test is the permanent pin.
 *
 * Method: the SAME 8-card mixed rulebook and the SAME 12-tick crafted cell
 * tape run through the frozen oracle (./evaluator-before.ts — byte-faithful
 * c8a3606 reference, test-only, NEVER edit; re-cutting it is the perf lane's
 * lever per its own header) and the live evaluator (../evaluator), with the
 * two runtime states threaded independently. Per tick, five parts are
 * compared as canonical text: fireLog serialization, entries, intents
 * serialization, firings, and the FULL runtime state — sorted-iterated
 * snapshot CONTENT (not just size), sustained clocks, latches, pending and
 * deferred consults, intent seq.
 *
 * Red-first credibility: the round-6 reviewer proved this differential is
 * live, not decorative — swapping in a stubbed-gate evaluator whose dispatch
 * skips the counter arm on numeric-first cards (probe2c's eval-broken.ts)
 * flips the comparison to divergences > 0. That control file is deliberately
 * NOT vendored here; the frozen oracle is the control.
 *
 * Note on intents: every card here is inform/consult band, so no intent is
 * ever adjudicated and the intents part is identically "[]" on both sides
 * across the tape. The equality pin still bites — a regression that emits
 * intents off this book would diverge the part. Execute-band intent bytes are
 * pinned by ./evaluator.test.ts.
 */
import { describe, expect, it, beforeAll } from "vitest";

import type { PolicyThreshold } from "../../types";
import {
  createRuntimeState,
  defaultEvaluationConfig,
  runRulePhase,
  serializeFireLog,
} from "../evaluator";
import {
  createRuntimeState as createRuntimeStateOracle,
  defaultEvaluationConfig as defaultEvaluationConfigOracle,
  runRulePhase as runRulePhaseOracle,
  serializeFireLog as serializeFireLogOracle,
} from "./evaluator-before";
import {
  F,
  action,
  card,
  observedOf,
  phaseInput,
  predicate,
  stableJson,
  valueThreshold,
} from "./fixtures";

const EVT = (name: string): PolicyThreshold => ({ kind: "event-name", name });

/* ------------------------------------------------------------------ *
 * The 8-card mixed rulebook. Cards 1–2 are the drift surface itself:
 * numeric + counter predicates on the SAME metric (m1) in both WHEN
 * orderings. The rest probe the surrounding dispatch paths: UNLESS-position
 * guards, pure arms, object scope, the numeric fast-path early return
 * (threshold low enough that the run takes the partial-scan branch on most
 * entities), and a consult-band mixed pair on the counter metric m2.
 * ------------------------------------------------------------------ */

const mixedWhenNumFirst = card({
  id: "r-mix-nf",
  when: [predicate("m1", ">", valueThreshold(F(0.5), "percent")), predicate("m1", "changed", EVT("move"))],
  then: [action("page")],
  band: "inform",
});
const mixedWhenCntFirst = card({
  id: "r-mix-cf",
  when: [predicate("m1", "changed", EVT("move")), predicate("m1", ">", valueThreshold(F(0.5), "percent"))],
  then: [action("page")],
  band: "inform",
});
const mixedUnless = card({
  id: "r-mix-un",
  when: [predicate("m1", ">", valueThreshold(F(0.5), "percent"))],
  unless: [predicate("m1", "changed", EVT("move"))],
  then: [action("page")],
  band: "inform",
});
const numericOnly = card({
  id: "r-num",
  when: [predicate("m1", ">", valueThreshold(F(0.4), "percent"))],
  then: [action("page")],
  band: "inform",
});
const counterOnly = card({
  id: "r-cnt",
  when: [predicate("m2", "fails", EVT("f"))],
  then: [action("page")],
  band: "inform",
});
const objectMixed = card({
  id: "r-obj",
  scopeEntity: "b",
  when: [predicate("m1", ">", valueThreshold(F(0.45), "percent")), predicate("m1", "changed", EVT("move"))],
  then: [action("page")],
  band: "inform",
});
const earlyReturn = card({
  id: "r-early",
  when: [predicate("m1", ">", valueThreshold(F(0.2), "percent"))],
  then: [action("page")],
  band: "inform",
});
const consultMixed = card({
  id: "r-cons",
  when: [predicate("m2", "completes", EVT("c")), predicate("m2", ">", valueThreshold(F(0), "percent"))],
  then: [action("page")],
  band: "consult",
});

const BOOK = [
  mixedWhenNumFirst,
  mixedWhenCntFirst,
  mixedUnless,
  numericOnly,
  counterOnly,
  objectMixed,
  earlyReturn,
  consultMixed,
];

/* 12-tick crafted cell tape: crossing thresholds (0.4/0.45/0.5), first-ever
 * observations (m2 jumps 5→7: no "changed"/"fails" edge is minted from
 * nothing — D-6b), null and unknown cells (fog silence — D-6), stale cells,
 * a total blackout tick, and a post-blackout re-assertion tick. */
type TapeRow = readonly (readonly [string, string, bigint | null, ("live" | "stale" | "unknown")?])[];

const TAPE: readonly TapeRow[] = [
  [["a", "m1", F(0.3)], ["b", "m1", F(0.3)], ["c", "m1", F(0.3)], ["a", "m2", 5n], ["b", "m2", 5n]],
  [["a", "m1", F(0.6)], ["b", "m1", F(0.3)], ["c", "m1", null], ["a", "m2", 5n], ["b", "m2", 7n]],
  [["a", "m1", F(0.6)], ["b", "m1", F(0.5)], ["c", "m1", F(0.1)], ["a", "m2", 5n], ["b", "m2", 7n]],
  [["a", "m1", F(0.2)], ["b", "m1", F(0.7)], ["c", "m1", F(0.45), "stale"], ["a", "m2", 9n], ["b", "m2", 7n]],
  [["a", "m1", F(0.42)], ["b", "m1", F(0.7)], ["c", "m1", F(0.5)], ["d", "m1", F(0.9)], ["a", "m2", 9n], ["b", "m2", 12n]],
  [["a", "m1", F(0.42)], ["b", "m1", F(0.2)], ["c", "m1", F(0.5)], ["d", "m1", F(0.9)], ["a", "m2", 9n], ["b", "m2", 12n]],
  [["a", "m1", F(0.8)], ["b", "m1", F(0.2)], ["c", "m1", F(0.3)], ["a", "m2", 9n], ["b", "m2", 9n]],
  [["a", "m1", F(0.8), "unknown"], ["b", "m1", F(0.55)], ["c", "m1", F(0.3)], ["a", "m2", 10n], ["b", "m2", 9n]],
  [["a", "m1", F(0.55)], ["b", "m1", F(0.55)], ["c", "m1", F(0.44)], ["a", "m2", 10n], ["b", "m2", 11n]],
  [["a", "m1", F(0.55)], ["b", "m1", F(0.46)], ["c", "m1", F(0.6)], ["a", "m2", 11n], ["b", "m2", 11n]],
  [],
  [["a", "m1", F(0.99)], ["b", "m1", F(0.1)], ["c", "m1", F(0.99), "stale"], ["a", "m2", 12n], ["b", "m2", 11n]],
];

/* ------------------------------------------------------------------ *
 * Canonical serialization shared by both sides
 * ------------------------------------------------------------------ */

/** Minimal structural view both PolicyRuntimeStates satisfy (the oracle
 *  re-declares the same interface; snapshot/sustained VALUES are plain
 *  bigints, so String() is loss-free content, not [object Object]). */
interface ComparableState {
  readonly sustainedSinceUs: ReadonlyMap<string, bigint>;
  readonly latched: ReadonlySet<string>;
  readonly snapshots: ReadonlyMap<string, bigint>;
  readonly pendingConsults: readonly unknown[];
  readonly deferredResolutions: readonly unknown[];
  readonly nextIntentSeq: number;
}

function serializeState(state: ComparableState): string {
  const sortedMap = (m: ReadonlyMap<string, bigint>): string =>
    [...m.entries()]
      .sort((x, y) => (x[0] < y[0] ? -1 : 1))
      .map(([key, value]) => `${key}=${String(value)}`)
      .join(";");
  return stableJson({
    sustained: sortedMap(state.sustainedSinceUs),
    latched: [...state.latched].sort().join(";"),
    snapshots: sortedMap(state.snapshots),
    pending: state.pendingConsults,
    deferred: state.deferredResolutions,
    seq: state.nextIntentSeq,
  });
}

const PART_NAMES = ["fireLog", "entries", "intents", "firings", "state"] as const;
type PartName = (typeof PART_NAMES)[number];

interface TickWitness {
  readonly tick: number;
  readonly parts: Record<PartName, readonly [live: string, oracle: string]>;
}

interface DiffResult {
  readonly witnesses: readonly TickWitness[];
  readonly divergences: readonly string[];
  readonly finalFireLog: string;
  readonly ruleCounts: Readonly<Record<string, number>>;
  readonly finalSnapshotCount: number;
  readonly finalLatchedCount: number;
  readonly finalPendingCount: number;
  readonly totalFirings: number;
  readonly totalEntries: number;
  readonly totalIntents: number;
}

function collectDifferential(): DiffResult {
  let stateLive = createRuntimeState();
  let stateOracle = createRuntimeStateOracle();
  const witnesses: TickWitness[] = [];
  const divergences: string[] = [];
  let totalFirings = 0;
  let totalEntries = 0;
  let totalIntents = 0;

  for (let tick = 0; tick < TAPE.length; tick += 1) {
    // One shared input per tick is safe: evaluation never touches `rng`
    // (the no-RNG-in-evaluation law in the evaluator's own header).
    const input = phaseInput(BigInt(tick), observedOf(TAPE[tick] ?? []), BOOK);
    const live = runRulePhase(stateLive, input, defaultEvaluationConfig);
    const oracle = runRulePhaseOracle(stateOracle, input, defaultEvaluationConfigOracle);

    const parts: Record<PartName, readonly [string, string]> = {
      fireLog: [serializeFireLog(live.state.fireLog), serializeFireLogOracle(oracle.state.fireLog)],
      entries: [stableJson(live.entries), stableJson(oracle.entries)],
      intents: [stableJson(live.out.intents), stableJson(oracle.out.intents)],
      firings: [stableJson(live.out.firings), stableJson(oracle.out.firings)],
      state: [serializeState(live.state), serializeState(oracle.state)],
    };
    for (const part of PART_NAMES) {
      const [a, b] = parts[part]!;
      if (a !== b) divergences.push(`tick=${String(tick)} part=${part}`);
    }
    witnesses.push({ tick, parts });

    totalFirings += live.out.firings.length;
    totalEntries += live.entries.length;
    totalIntents += live.out.intents.length;
    stateLive = live.state;
    stateOracle = oracle.state;
  }

  const finalFireLog = serializeFireLog(stateLive.fireLog);
  const lines = finalFireLog.split("\n").filter((line) => line.length > 0);
  const ruleCounts: Record<string, number> = {};
  for (const card of BOOK) {
    ruleCounts[card.id] = lines.filter((line) => line.includes(card.id)).length;
  }

  return {
    witnesses,
    divergences,
    finalFireLog,
    ruleCounts,
    finalSnapshotCount: stateLive.snapshots.size,
    finalLatchedCount: stateLive.latched.size,
    finalPendingCount: stateLive.pendingConsults.length,
    totalFirings,
    totalEntries,
    totalIntents,
  };
}

describe("mixed numeric+counter predicates on one observed key — oracle vs hot-loop evaluator", () => {
  let diff!: DiffResult;

  beforeAll(() => {
    diff = collectDifferential();
  });

  it("never diverges across the 12-tick mixed tape (all five parts)", () => {
    expect(diff.divergences).toEqual([]);
  });

  it("fireLog text is identical at every tick", () => {
    const fireLogDivergences = diff.divergences.filter((label) => label.endsWith("part=fireLog"));
    expect(fireLogDivergences).toEqual([]);
    for (const witness of diff.witnesses) {
      const [live, oracle] = witness.parts.fireLog;
      expect(live, `fireLog at tick=${String(witness.tick)}`).toBe(oracle);
    }
  });

  it("reproduces the reviewer's journal exactly: 21 rows, per-rule firing counts pinned", () => {
    const rows = diff.finalFireLog.split("\n").filter((line) => line.length > 0);
    expect(rows).toHaveLength(21);
    expect(diff.ruleCounts).toEqual({
      "r-mix-nf": 2,
      "r-mix-cf": 2,
      "r-mix-un": 2,
      "r-num": 2,
      "r-cnt": 4,
      "r-obj": 3,
      "r-early": 2,
      "r-cons": 4,
    });
    // Both WHEN orderings of the shared-key pair fire — the drift surface
    // itself is exercised, not just adjacent code.
    expect(diff.ruleCounts["r-mix-nf"]).toBeGreaterThan(0);
    expect(diff.ruleCounts["r-mix-cf"]).toBeGreaterThan(0);
  });

  it("intents serialization is identical at every tick (0 intents: inform/consult book)", () => {
    expect(diff.divergences.filter((label) => label.endsWith("part=intents"))).toEqual([]);
    expect(diff.totalIntents).toBe(0);
  });

  it("firings count and entries serialization are identical at every tick; totals non-trivial", () => {
    expect(diff.divergences.filter((label) => label.endsWith("part=firings"))).toEqual([]);
    expect(diff.divergences.filter((label) => label.endsWith("part=entries"))).toEqual([]);
    expect(diff.totalFirings).toBe(19);
    expect(diff.totalEntries).toBe(21);
  });

  it("FULL runtime state is byte-identical at every tick, final state pinned", () => {
    expect(diff.divergences.filter((label) => label.endsWith("part=state"))).toEqual([]);
    // Non-triviality of the state part: 22 sorted snapshot entries (the
    // numeric+counter shared-key visibility records), 7 latches, and 4
    // pending consults from the consult-band mixed pair.
    expect(diff.finalSnapshotCount).toBe(22);
    expect(diff.finalLatchedCount).toBe(7);
    expect(diff.finalPendingCount).toBe(4);
  });
});
