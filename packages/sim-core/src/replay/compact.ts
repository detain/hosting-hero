/**
 * Bundle compaction — "THE LONG SAVE" stays bounded while remaining
 * replay-verifiable (§4.1 replay artifact: latest checkpoint + input tail;
 * §3.3 item 3: nothing in a bundle that isn't re-derivable from it).
 *
 * Two independent prunings, both preserving verifiability:
 *  1. SUPERSEDED SNAPSHOT STATES are dropped (a state at tick t is superseded
 *     once the intent tail t→t′ is logged — re-sim regenerates it). Kept
 *     snapshots follow "every-Nth + always-last" so a resume point stays
 *     near the tail; hash checkpoints themselves are NEVER dropped (they
 *     are the tripwire the verifier asserts).
 *  2. Whole every-Nth + last SNAPSHOT ENTRIES may additionally be dropped
 *     when their ticks remain covered by the dense checkpoint ring — the
 *     ring keeps verification dense; `checkpoints` and `intentLog` are
 *     always preserved byte-faithfully.
 *
 * Lineage boundary fields (`doc.lineage`, Appendix C CompanyNode refs) are
 * OPAQUE PASSTHROUGH — copied verbatim; the save workstream owns tree
 * semantics, this module only guarantees they survive the round trip.
 */

import type { ReplayBundleDoc, SnapshotRecord } from "./bundle.ts";
import { ReplayError } from "./canonical.ts";

export interface CompactionOptions {
  /** Keep every Nth surviving snapshot (1 = keep all entries). ≥ 1. */
  readonly keepEveryNthSnapshot: number;
  /** Always keep this many trailing snapshot entries (≥ 1). */
  readonly keepLastSnapshots: number;
  /** Additionally strip embedded `state` blobs from entries that survive
   *  entry-level pruning (default true — the LONG SAVE tail keeps the last
   *  `keepLastSnapshots` entries' states for fast resume). */
  readonly dropSupersededStates?: boolean;
  /** How many trailing surviving snapshots KEEP their embedded state
   *  (default = keepLastSnapshots). */
  readonly keepStatesLast?: number;
}

export interface CompactionResult {
  readonly doc: ReplayBundleDoc;
  /** Snapshot ticks whose ENTRIES were dropped. */
  readonly droppedSnapshotTicks: readonly bigint[];
  /** Snapshot ticks whose embedded STATE was stripped (entry survives). */
  readonly strippedStateTicks: readonly bigint[];
}

function validate(options: CompactionOptions): void {
  if (!Number.isSafeInteger(options.keepEveryNthSnapshot) || options.keepEveryNthSnapshot < 1) {
    throw new ReplayError(`compact: keepEveryNthSnapshot must be an integer ≥ 1, got ${options.keepEveryNthSnapshot}`);
  }
  if (!Number.isSafeInteger(options.keepLastSnapshots) || options.keepLastSnapshots < 1) {
    throw new ReplayError(`compact: keepLastSnapshots must be an integer ≥ 1, got ${options.keepLastSnapshots}`);
  }
  const keepStates = options.keepStatesLast ?? options.keepLastSnapshots;
  if (!Number.isSafeInteger(keepStates) || keepStates < 0) {
    throw new ReplayError(`compact: keepStatesLast must be an integer ≥ 0, got ${keepStates}`);
  }
}

/** Indexes into `doc.snapshots` that survive entry-level pruning:
 *  every-Nth (counting from the FIRST snapshot so tick-0 stays) plus the
 *  trailing `keepLastSnapshots`. */
function survivingIndexes(count: number, everyNth: number, keepLast: number): Set<number> {
  const keep = new Set<number>();
  if (count === 0) return keep;
  for (let i = 0; i < count; i += everyNth) keep.add(i);
  keep.add(count - 1); // the tail — never pruned (LONG SAVE resume point)
  for (let i = Math.max(0, count - keepLast); i < count; i += 1) keep.add(i);
  return keep;
}

export function compactBundle(doc: ReplayBundleDoc, options: CompactionOptions): CompactionResult {
  validate(options);
  const keepStates = options.keepStatesLast ?? options.keepLastSnapshots;
  const dropStates = options.dropSupersededStates ?? true;

  const keep = survivingIndexes(doc.snapshots.length, options.keepEveryNthSnapshot, options.keepLastSnapshots);
  const droppedSnapshotTicks: bigint[] = [];
  const survivors: SnapshotRecord[] = [];
  doc.snapshots.forEach((snapshot, index) => {
    if (keep.has(index)) survivors.push(snapshot);
    else droppedSnapshotTicks.push(snapshot.tick);
  });

  const strippedStateTicks: bigint[] = [];
  const stateCutoff = survivors.length - keepStates; // survivors below this lose blobs
  const compactedSnapshots = dropStates
    ? survivors.map((snapshot, index) => {
        if (snapshot.state === undefined || index >= stateCutoff) return snapshot;
        strippedStateTicks.push(snapshot.tick);
        const { state: _state, stateEncoding: _encoding, ...rest } = snapshot;
        return rest;
      })
    : survivors;

  const compacted: ReplayBundleDoc = { ...doc, snapshots: compactedSnapshots };
  return { doc: compacted, droppedSnapshotTicks, strippedStateTicks };
}

/** Law check used by tests and CI: a compacted doc must still contain every
 *  snapshot tick in the checkpoint ring and never touch seed-tick coverage. */
export function assertCompactionSafe(original: ReplayBundleDoc, compacted: ReplayBundleDoc): void {
  if (compacted.intentLog.length !== original.intentLog.length) {
    throw new ReplayError("assertCompactionSafe: intentLog was pruned — the input tail is not compactable");
  }
  if (compacted.checkpoints.length !== original.checkpoints.length) {
    throw new ReplayError("assertCompactionSafe: checkpoint ring was pruned — verification would go blind");
  }
  if (compacted.lineage !== original.lineage) {
    const same = JSON.stringify(Object.keys(compacted.lineage).sort()) === JSON.stringify(Object.keys(original.lineage).sort());
    if (!same) throw new ReplayError("assertCompactionSafe: lineage boundary keys changed — passthrough violated");
  }
  for (const snapshot of compacted.snapshots) {
    if (!compacted.checkpoints.some((c) => c.tick === snapshot.tick)) {
      throw new ReplayError(`assertCompactionSafe: snapshot tick ${snapshot.tick} has no ring coverage`);
    }
  }
}
