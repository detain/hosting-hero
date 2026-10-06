/**
 * Replay verifier tests (§3.3 item 3, §7.0 tripwire): a captured run must
 * verify clean; a ONE-BIT runner mutation must be pinpointed to its exact
 * tick via checkpoint-ring bisection; the path diff must name the diverged
 * field; a tampered recorded hash must be caught.
 */

import { describe, expect, it } from "vitest";
import type { StubState } from "./helpers";
import { STUB_SEED, TEST_HASHES, stampedIntents, stubInitialState, stubRunner } from "./helpers";
import type { SimRunner, SimRunnerRequest } from "../verify";
import { assertReplayVerifiable, canonicalDigest, verifyReplay } from "../verify";
import { captureRun } from "../harness";
import { ReplayError } from "../canonical";

const TOTAL = 24n;
const SNAPSHOT_EVERY = 6n;

function captureClean() {
  return captureRun({
    runner: stubRunner,
    initialState: stubInitialState(),
    runSeed: STUB_SEED,
    engineVersion: "verify-test",
    contentHashes: { ...TEST_HASHES, rulesetCardHashes: { ...TEST_HASHES.rulesetCardHashes } },
    totalTicks: TOTAL,
    snapshotEveryTicks: SNAPSHOT_EVERY,
    intents: stampedIntents(6, 4n),
  });
}

/** A runner mutated to flip one bit of `cash.free` from `mutateTick`. */
function mutatedRunner(mutateTick: bigint): SimRunner<StubState> {
  return (request: SimRunnerRequest<StubState>) => {
    const state = stubRunner(request);
    if (request.targetTick >= mutateTick) {
      return { ...state, cash: { ...state.cash, free: state.cash.free ^ 1n } };
    }
    return state;
  };
}

describe("verifyReplay — clean runs", () => {
  it("verifies a freshly captured bundle at every hash point", () => {
    const doc = captureClean();
    const result = verifyReplay({ doc, initialState: stubInitialState(), runner: stubRunner });
    expect(result.ok).toBe(true);
    expect(result.failures).toHaveLength(0);
    // ring (0..24 dense) + snapshots share ticks (Map-deduped) = 25 points
    expect(result.checkedHashPoints).toBe(25);
    expect(doc.snapshots.map((s) => s.tick)).toEqual([0n, 6n, 12n, 18n, 24n]);
  });

  it("assertReplayVerifiable passes silently on clean bundles", () => {
    const doc = captureClean();
    expect(() => assertReplayVerifiable({ doc, initialState: stubInitialState(), runner: stubRunner })).not.toThrow();
  });
});

describe("verifyReplay — one-bit mutation pinpointing", () => {
  for (const mutateTick of [1n, 7n, 13n, 24n]) {
    it(`mutation entering at tick ${mutateTick} is pinpointed exactly`, () => {
      const doc = captureClean();
      const result = verifyReplay({ doc, initialState: stubInitialState(), runner: mutatedRunner(mutateTick) });
      expect(result.ok).toBe(false);
      expect(result.failures).toHaveLength(1);
      const failure = result.failures[0];
      expect(failure?.tick).toBe(mutateTick);
      expect(failure?.firstDivergentTick).toBe(mutateTick);
      expect(failure?.expectedHash).not.toBe(failure?.actualHash);
    });
  }

  it("diff names the exact diverged field path", () => {
    const doc = captureClean();
    const result = verifyReplay({ doc, initialState: stubInitialState(), runner: mutatedRunner(7n) });
    const failure = result.failures[0];
    expect(failure?.diff).toBeDefined();
    expect(failure?.diffSnapshotTick).toBe(12n); // next state-bearing snapshot ≥ 7
    const paths = failure?.diff?.diffs.map((d) => d.path) ?? [];
    expect(paths).toContain("cash.free");
    expect(paths).not.toContain("cash.restricted"); // the untouched sibling stays quiet
    const entry = failure?.diff?.diffs.find((d) => d.path === "cash.free");
    expect(entry?.kind).toBe("changed");
  });

  it("bisection over a sparse ring still pinpoints every tick", () => {
    // checkpointEvery 4n: ring ticks {0,4,…,24}; snapshot state at 6n? no —
    // snapshots land on multiples of SNAPSHOT_EVERY∩ring; divergence from
    // tick 7 is bracketed to ring tick 8 (first ring point that differs).
    const doc = captureRun({
      runner: stubRunner,
      initialState: stubInitialState(),
      runSeed: STUB_SEED,
      engineVersion: "verify-test-sparse",
      contentHashes: { ...TEST_HASHES, rulesetCardHashes: { ...TEST_HASHES.rulesetCardHashes } },
      totalTicks: TOTAL,
      snapshotEveryTicks: SNAPSHOT_EVERY,
      checkpointEveryTicks: 4n,
      intents: stampedIntents(6, 4n),
    });
    const result = verifyReplay({ doc, initialState: stubInitialState(), runner: mutatedRunner(7n) });
    expect(result.failures[0]?.firstDivergentTick).toBe(8n);
    expect(result.failures[0]?.tick).toBe(8n);
  });
});

describe("verifyReplay — tamper detection on the artifact itself", () => {
  it("a flipped recorded snapshot hash fails at that tick", () => {
    const doc = captureClean();
    const tamperedSnapshots = doc.snapshots.map((s) => (s.tick === 12n ? { ...s, stateHash: canonicalDigest({ poison: 1n }) } : s));
    const tamperedRing = doc.checkpoints.map((c) => (c.tick === 12n ? { ...c, stateHash: canonicalDigest({ poison: 1n }) } : c));
    const result = verifyReplay({ doc: { ...doc, snapshots: tamperedSnapshots, checkpoints: tamperedRing }, initialState: stubInitialState(), runner: stubRunner });
    expect(result.ok).toBe(false);
    expect(result.failures[0]?.tick).toBe(12n);
    expect(result.failures[0]?.firstDivergentTick).toBe(12n);
    // the embedded state still matches reality — diff must be empty
    expect(result.failures[0]?.diff?.diffs).toHaveLength(0);
  });

  it("a runner ignoring an intent diverges exactly where it matters", () => {
    const doc = captureClean();
    const droppingRunner: SimRunner<StubState> = (request) =>
      stubRunner({ ...request, intentsUpToTick: request.intentsUpToTick.filter((e) => e.intent.seq !== 2) });
    const result = verifyReplay({ doc, initialState: stubInitialState(), runner: droppingRunner });
    const dropped = doc.intentLog.find((e) => e.intent.seq === 2);
    expect(result.failures[0]?.tick).toBe(dropped?.tick);
    expect(result.failures[0]?.firstDivergentTick).toBe(dropped?.tick);
  });
});

describe("verifyReplay — guard rails", () => {
  it("rejects unsupported schema versions loud", () => {
    const doc = { ...captureClean(), schemaVersion: 2 as unknown as 1 };
    expect(() => verifyReplay({ doc, initialState: stubInitialState(), runner: stubRunner })).toThrow(ReplayError);
  });
});
