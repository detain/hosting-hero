/**
 * ReplayHarness tests — the ×100 byte-identical determinism gate
 * (CONVENTIONS §3, §7 acceptance G1(a)) plus capture→codec→verify as one
 * adoptable pipeline for every other module's own fixtures.
 */

import { describe, expect, it } from "vitest";
import type { StubState } from "./helpers";
import { STUB_SEED, TEST_HASHES, stampedIntents, stubInitialState, stubRunner } from "./helpers";
import { captureRun, createHarness } from "../harness";
import { decodeReplayBundle, encodeReplayBundleBinary, encodeReplayBundleJson } from "../bundle";
import type { SimRunner, SimRunnerRequest } from "../verify";

const BASE = {
  runner: stubRunner,
  initialState: stubInitialState(),
  runSeed: STUB_SEED,
  engineVersion: "harness-test",
  contentHashes: { ...TEST_HASHES, rulesetCardHashes: { ...TEST_HASHES.rulesetCardHashes } },
  totalTicks: 16n,
  snapshotEveryTicks: 4n,
  intents: stampedIntents(5, 3n),
  lineage: { companyNodeId: "gen-1" },
} as const;

describe("harness determinism ×100 (G1 acceptance (a))", () => {
  it("100 independent re-sims share one final digest", () => {
    const harness = createHarness<StubState>(BASE);
    const digests = harness.replayDigests(100);
    expect(digests).toHaveLength(100);
    expect(new Set(digests).size).toBe(1);
    // and that digest equals the captured ring tail hash — same truth, twice derived
    expect(digests[0]).toBe(harness.capture().checkpoints.at(-1)?.stateHash);
  });

  it("100 captures of the scenario produce byte-identical bundles", () => {
    const harness = createHarness<StubState>(BASE);
    const first = encodeReplayBundleJson(captureRun(BASE));
    for (let i = 0; i < 100; i += 1) {
      expect(encodeReplayBundleJson(harness.capture())).toBe(first);
    }
  });
});

describe("harness capture → codec → verify pipeline", () => {
  it("a captured bundle verifies through JSON and binary artifact forms", () => {
    const harness = createHarness<StubState>(BASE);
    const doc = harness.capture();
    expect(harness.verify().ok).toBe(true);
    const jsonDoc = decodeReplayBundle(encodeReplayBundleJson(doc));
    const binDoc = decodeReplayBundle(encodeReplayBundleBinary(doc));
    expect(harness.verify(jsonDoc).ok).toBe(true);
    expect(harness.verify(binDoc).ok).toBe(true);
  });

  it("compactAndVerify keeps the tail resumable and the bundle verifiable", () => {
    const harness = createHarness<StubState>(BASE);
    const doc = harness.capture();
    const result = harness.compactAndVerify(doc, { keepEveryNthSnapshot: 2, keepLastSnapshots: 1 });
    expect(result.doc.snapshots.at(-1)?.state).toBeDefined();
    expect(result.doc.checkpoints).toEqual(doc.checkpoints);
  });

  it("compactAndVerify throws when a runner would disagree with the compacted artifact", () => {
    const harness = createHarness<StubState>(BASE);
    const doc = harness.capture();
    const poisonRunner: SimRunner<StubState> = (request: SimRunnerRequest<StubState>) => {
      const state = stubRunner(request);
      return request.targetTick >= 9n ? { ...state, note: `${state.note}!` } : state;
    };
    const poisoned = createHarness<StubState>({ ...BASE, runner: poisonRunner });
    const capturedByPoison = captureRun({ ...BASE, runner: poisonRunner });
    expect(() => poisoned.compactAndVerify(capturedByPoison, { keepEveryNthSnapshot: 1, keepLastSnapshots: 1 })).not.toThrow();
    // harness-runner mismatch vs a bundle captured by the CLEAN runner:
    expect(() => poisoned.compactAndVerify(doc, { keepEveryNthSnapshot: 1, keepLastSnapshots: 1 })).toThrow(/failed re-verification at tick 9/);
  });
});
