/**
 * Compaction tests (§3.3 LONG SAVE = latest checkpoint + input tail):
 * every-Nth + last pruning, superseded-state stripping, opaque lineage
 * passthrough — and the law that a compacted bundle MUST still verify.
 */

import { describe, expect, it } from "vitest";
import { STUB_SEED, TEST_HASHES, stampedIntents, stubInitialState, stubRunner } from "./helpers";
import { captureRun } from "../harness";
import { assertCompactionSafe, compactBundle } from "../compact";
import { decodeReplayBundleJson, encodeReplayBundleJson } from "../bundle";
import { verifyReplay } from "../verify";
import { ReplayError } from "../canonical";

const LINEAGE = { companyNodeId: "gen-7", parentRef: "gen-6", inheritanceManifest: { scars: ["pdu-shared"], doctrines: ["shed-gold-last"] } };

function captureCompactable() {
  return captureRun({
    runner: stubRunner,
    initialState: stubInitialState(),
    runSeed: STUB_SEED,
    engineVersion: "compact-test",
    contentHashes: { ...TEST_HASHES, rulesetCardHashes: { ...TEST_HASHES.rulesetCardHashes } },
    totalTicks: 30n,
    snapshotEveryTicks: 5n,
    checkpointEveryTicks: 2n,
    intents: stampedIntents(8, 3n),
    lineage: LINEAGE,
  });
}

describe("compactBundle", () => {
  it("drops every-Nth snapshot entries but always the tail", () => {
    const doc = captureCompactable(); // snapshots 0,5,…,30 → 7 entries
    expect(doc.snapshots).toHaveLength(7);
    const { doc: compacted, droppedSnapshotTicks } = compactBundle(doc, { keepEveryNthSnapshot: 3, keepLastSnapshots: 1 });
    // keep indexes 0,3,6(first/last of the every-3 stride) + tail 6 → ticks 0,15,30
    expect(compacted.snapshots.map((s) => s.tick)).toEqual([0n, 15n, 30n]);
    expect(droppedSnapshotTicks).toEqual([5n, 10n, 20n, 25n]);
    // ring and input tail are UNTOUCHED (verification stays dense)
    expect(compacted.checkpoints).toEqual(doc.checkpoints);
    expect(compacted.intentLog).toEqual(doc.intentLog);
  });

  it("strips superseded embedded states, keeping the resume tail", () => {
    const doc = captureCompactable();
    const { doc: compacted, strippedStateTicks } = compactBundle(doc, { keepEveryNthSnapshot: 1, keepLastSnapshots: 2, keepStatesLast: 1 });
    const withState = compacted.snapshots.filter((s) => s.state !== undefined);
    expect(withState.map((s) => s.tick)).toEqual([30n]); // only the LONG SAVE tail keeps a blob
    expect(strippedStateTicks).toEqual([0n, 5n, 10n, 15n, 20n, 25n]);
    for (const snap of withState) expect(snap.stateEncoding).toBe("canonical-json");
  });

  it("re-verifies after compaction — the hard rule", () => {
    const doc = captureCompactable();
    for (const every of [1, 2, 3, 5, 7]) {
      const { doc: compacted } = compactBundle(doc, { keepEveryNthSnapshot: every, keepLastSnapshots: 2 });
      assertCompactionSafe(doc, compacted);
      const result = verifyReplay({ doc: compacted, initialState: stubInitialState(), runner: stubRunner });
      expect(result.ok, `keepEveryNthSnapshot=${every}`).toBe(true);
      // and the compacted bundle survives the codec round trip verifiably
      const reread = decodeReplayBundleJson(encodeReplayBundleJson(compacted));
      expect(verifyReplay({ doc: reread, initialState: stubInitialState(), runner: stubRunner }).ok).toBe(true);
    }
  });

  it("lineage boundary fields pass through untouched", () => {
    const doc = captureCompactable();
    const { doc: compacted } = compactBundle(doc, { keepEveryNthSnapshot: 2, keepLastSnapshots: 1 });
    expect(compacted.lineage).toEqual(LINEAGE);
    const round = decodeReplayBundleJson(encodeReplayBundleJson(compacted));
    expect(round.lineage).toEqual(LINEAGE);
  });
});

describe("assertCompactionSafe guards", () => {
  it("rejects a compaction that pruned the input tail or the ring", () => {
    const doc = captureCompactable();
    expect(() => assertCompactionSafe(doc, { ...doc, intentLog: [] })).toThrow(/input tail is not compactable/);
    expect(() => assertCompactionSafe(doc, { ...doc, checkpoints: doc.checkpoints.slice(0, -1) })).toThrow(/ring was pruned/);
    expect(() => assertCompactionSafe(doc, { ...doc, lineage: {} })).toThrow(/lineage boundary keys changed/);
  });

  it("validate() rejects nonsense strides", () => {
    const doc = captureCompactable();
    expect(() => compactBundle(doc, { keepEveryNthSnapshot: 0, keepLastSnapshots: 1 })).toThrow(ReplayError);
    expect(() => compactBundle(doc, { keepEveryNthSnapshot: 1, keepLastSnapshots: 1, keepStatesLast: -2 })).toThrow(ReplayError);
  });
});
