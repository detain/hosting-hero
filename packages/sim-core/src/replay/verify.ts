/**
 * Replay verifier: bundle + injected SimRunner → re-sim, digest-equality at
 * every recorded hash point, first-divergent-tick pinpointing, path-level
 * diff (MASTER_REPORT §3.3 item 3 — replay bundles referee postmortems,
 * Decision-Audits and Versus duels; §7.0 state-hash tripwire; CONVENTIONS §3
 * "×100 byte-identical replay is a hard gate").
 *
 * The SimRunner is the module's ONLY coupling to the machine: defined
 * structurally so this module never imports the pipeline (browser/Node port
 * parity, §3.4). A runner may be a full re-sim from `initialState` (the
 * honest contract) or wrap an incremental engine — determinism only requires
 * that (initialState, seed, intents≤tick) → stateAtTick is a pure function.
 */

import type { Checkpoint, HashHex, RunSeed, SimTick } from "../types.ts";
import type { ReplayBundleDoc, StampedIntent } from "./bundle.ts";
import { ReplayError, digestCanonicalValue } from "./canonical.ts";
import { diffStates, type DiffResult } from "./diff.ts";

export interface SimRunnerRequest<S> {
  readonly initialState: S;
  readonly runSeed: RunSeed;
  /** Re-simulate the run UP TO AND INCLUDING this macro-tick. */
  readonly targetTick: SimTick;
  /** Every logged intent stamped at tick ≤ targetTick, in log order. */
  readonly intentsUpToTick: readonly StampedIntent[];
}

/** (initialState, seed, intentsUpToTick) → stateAtTick. Pure by contract;
 *  the verifier calls it repeatedly and assumes same-request-same-answer. */
export type SimRunner<S> = (request: SimRunnerRequest<S>) => S;

/** Default hash: canonical-binary FNV-1a-64 (works on GameState-shaped
 *  values containing Maps/bigints). Override to pin an external digest. */
export type StateDigest<S> = (state: S) => HashHex;

export const canonicalDigest: StateDigest<unknown> = (state) => digestCanonicalValue(state);

export interface VerifyRequest<S> {
  readonly doc: ReplayBundleDoc;
  readonly initialState: S;
  readonly runner: SimRunner<S>;
  readonly digest?: StateDigest<S>;
  /** Cap on per-failure diff paths (default 64). */
  readonly diffLimit?: number;
}

export interface SnapshotFailure {
  /** Recorded hash point where re-sim disagreed. */
  readonly tick: SimTick;
  readonly expectedHash: HashHex;
  readonly actualHash: HashHex;
  /** Exact first divergent tick when the checkpoint ring covered the gap
   *  (or the failing tick itself when it is a ring tick); null when the
   *  divergence is only bracketed between two ring ticks. */
  readonly firstDivergentTick: SimTick | null;
  /** Path-level diff (recorded-vs-actual) taken at the first state-bearing
   *  snapshot at or after the divergence, when the bundle embedded states. */
  readonly diff?: DiffResult;
  readonly diffSnapshotTick?: SimTick;
}

export interface VerifyResult {
  readonly ok: boolean;
  /** Number of recorded hash points (ring ticks + snapshot ticks) checked. */
  readonly checkedHashPoints: number;
  readonly failures: readonly SnapshotFailure[];
}

interface HashPoint {
  readonly tick: SimTick;
  readonly stateHash: HashHex;
  readonly kind: "checkpoint" | "snapshot";
  readonly snapshotIndex: number | null;
}

function collectHashPoints(doc: ReplayBundleDoc): HashPoint[] {
  const byTick = new Map<SimTick, HashPoint>();
  for (const c of doc.checkpoints) {
    byTick.set(c.tick, { tick: c.tick, stateHash: c.stateHash, kind: "checkpoint", snapshotIndex: null });
  }
  doc.snapshots.forEach((s, index) => {
    // Bisection precondition: the snapshot overwrite is VALUE-PRESERVING on
    // shared ticks because the bundle parser (R3) rejects any snapshot whose
    // stateHash disagrees with the ring hash at that tick — so the dense
    // ring stays the single truth the bisection probes below.
    byTick.set(s.tick, { tick: s.tick, stateHash: s.stateHash, kind: "snapshot", snapshotIndex: index });
  });
  return [...byTick.values()].sort((a, b) => (a.tick < b.tick ? -1 : a.tick > b.tick ? 1 : 0));
}

function intentsUpTo(doc: ReplayBundleDoc, targetTick: SimTick): readonly StampedIntent[] {
  const out: StampedIntent[] = [];
  for (const entry of doc.intentLog) {
    if (entry.tick > targetTick) break; // intentLog is tick-monotonic (parse-enforced)
    out.push(entry);
  }
  return out;
}

/** Bisect the ascending tick list for the FIRST tick whose predicate is
 *  true. Assumes `predicate(hi)` holds (caller verified the interval end). */
function bisectFirstDivergent(
  ticks: readonly SimTick[],
  loInclusive: number,
  hiInclusive: number,
  diverges: (tick: SimTick) => boolean,
): SimTick {
  let lo = loInclusive;
  let hi = hiInclusive;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (diverges(ticks[mid] as SimTick)) hi = mid;
    else lo = mid + 1;
  }
  return ticks[hi] as SimTick;
}

/**
 * Re-simulate and compare every recorded hash point. On the first failing
 * point the checkpoint ring is bisected to pinpoint the exact divergent
 * tick; when the snapshot carries embedded state, a structured path diff is
 * attached so the failure is legible without a debugger.
 */
export function verifyReplay<S>(request: VerifyRequest<S>): VerifyResult {
  const { doc, initialState, runner } = request;
  if (doc.schemaVersion !== 1) throw new ReplayError(`verifyReplay: unsupported schemaVersion ${doc.schemaVersion}`);
  const digest: StateDigest<S> = request.digest ?? (canonicalDigest as StateDigest<S>);
  const points = collectHashPoints(doc);
  const ringTicks = doc.checkpoints.map((c: Checkpoint) => c.tick);
  const ringHash = new Map(ringTicks.map((t, i) => [t, doc.checkpoints[i]?.stateHash ?? ""]));
  const failures: SnapshotFailure[] = [];
  let lastGoodRingIndex = -1; // index into ringTicks of the last matching point

  for (const point of points) {
    const state = runner({ initialState, runSeed: doc.runSeed, targetTick: point.tick, intentsUpToTick: intentsUpTo(doc, point.tick) });
    const actualHash = digest(state);
    if (actualHash === point.stateHash) {
      const ringIndex = ringTicks.indexOf(point.tick);
      if (ringIndex > lastGoodRingIndex) lastGoodRingIndex = ringIndex;
      continue;
    }
    // --- divergence: pinpoint via the ring, then diff if state is embedded
    const failRingIndex = ringTicks.indexOf(point.tick);
    let firstDivergentTick: SimTick | null = null;
    if (failRingIndex >= 0) {
      const searchLo = lastGoodRingIndex + 1;
      firstDivergentTick =
        searchLo >= failRingIndex
          ? point.tick
          : bisectFirstDivergent(ringTicks, searchLo, failRingIndex, (tick) => {
              const probe = runner({ initialState, runSeed: doc.runSeed, targetTick: tick, intentsUpToTick: intentsUpTo(doc, tick) });
              return digest(probe) !== ringHash.get(tick);
            });
    }
    // Diff source: the failing point itself when it embeds state, else the
    // first state-bearing snapshot at/after it (ring ticks are hash-only).
    const diffSource =
      doc.snapshots.find((s) => s.tick === point.tick && s.state !== undefined) ??
      doc.snapshots.find((s) => s.tick >= point.tick && s.state !== undefined);
    const diffTargetState = diffSource === undefined ? state : runner({
      initialState,
      runSeed: doc.runSeed,
      targetTick: diffSource.tick,
      intentsUpToTick: intentsUpTo(doc, diffSource.tick),
    });
    const diff =
      diffSource?.state !== undefined
        ? diffStates(diffSource.state, diffTargetState, request.diffLimit === undefined ? {} : { limit: request.diffLimit })
        : undefined;
    failures.push({
      tick: point.tick,
      expectedHash: point.stateHash,
      actualHash,
      firstDivergentTick,
      ...(diff === undefined ? {} : { diff }),
      ...(diff === undefined || diffSource === undefined ? {} : { diffSnapshotTick: diffSource.tick }),
    });
    // Everything after a divergence is noise — stop at the FIRST failing
    // point (fail-loud, explain-once: the pinpoint + diff is the report).
    break;
  }

  return { ok: failures.length === 0, checkedHashPoints: points.length, failures };
}

/** Convenience for CI gates: throws with the pinpointed tick on mismatch. */
export function assertReplayVerifiable<S>(request: VerifyRequest<S>): VerifyResult {
  const result = verifyReplay(request);
  if (!result.ok) {
    const first = result.failures[0];
    throw new ReplayError(
      `assertReplayVerifiable: divergence at tick ${first?.tick ?? "?"} (first divergent ${first?.firstDivergentTick ?? "unbracketed"}) — expected ${first?.expectedHash}, got ${first?.actualHash}`,
    );
  }
  return result;
}
