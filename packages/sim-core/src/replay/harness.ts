/**
 * ReplayHarness — the test-utility facade other modules adopt for their
 * determinism gates (CONVENTIONS §3: "every sim-core module ships
 * deterministic-replay tests"; §7 G1–G6 acceptance "byte-identical ×100").
 *
 * Everything flows through the structural `SimRunner` contract, so the
 * harness works against the pipeline driver, the economy tick, or a stub —
 * no imports from sibling modules (§3.4 portability discipline).
 */

import type { Checkpoint, DirectorDraw, HashHex, ReplayContentHashes, RunSeed, SimTick } from "../types.ts";
import type { ReplayBundleDoc, SnapshotRecord, StampedIntent } from "./bundle.ts";
import { ReplayError } from "./canonical.ts";
import { assertCompactionSafe, compactBundle, type CompactionOptions, type CompactionResult } from "./compact.ts";
import { type SimRunner, type StateDigest, type VerifyResult, canonicalDigest, verifyReplay } from "./verify.ts";

export interface CaptureOptions<S> {
  readonly runner: SimRunner<S>;
  readonly initialState: S;
  readonly runSeed: RunSeed;
  readonly engineVersion: string;
  readonly contentHashes: ReplayContentHashes;
  readonly totalTicks: SimTick;
  readonly snapshotEveryTicks: SimTick;
  readonly intents?: readonly StampedIntent[];
  readonly directorDraws?: readonly DirectorDraw[];
  /** Record a ring checkpoint every N ticks (default 1 = every tick —
   *  bisection precision; memory-cheap: tick + 16-hex). */
  readonly checkpointEveryTicks?: SimTick;
  /** Embed the full canonical state at every snapshot (default true). */
  readonly embedState?: boolean;
  readonly digest?: StateDigest<S>;
  /** CompanyNode boundary fields — carried verbatim into the doc. */
  readonly lineage?: Readonly<Record<string, unknown>>;
}

function positiveTick(tick: SimTick, what: string): void {
  if (tick <= 0n) throw new ReplayError(`capture: ${what} must be > 0, got ${tick}`);
}

/**
 * Run a scenario once through the runner and produce a validated
 * ReplayBundleDoc (checkpoint ring + snapshots + stamped input tail).
 * Tick 0 (the seed state) is always captured first — every verified replay
 * starts from a hashed baseline — and the terminal tick lands in the ring
 * even when it is not a multiple of `checkpointEveryTicks` (the LONG SAVE
 * tail must be hashed).
 */
export function captureRun<S>(options: CaptureOptions<S>): ReplayBundleDoc {
  positiveTick(options.totalTicks, "totalTicks");
  positiveTick(options.snapshotEveryTicks, "snapshotEveryTicks");
  const checkpointEvery = options.checkpointEveryTicks ?? 1n;
  positiveTick(checkpointEvery, "checkpointEveryTicks");
  const embedState = options.embedState ?? true;
  const digest: StateDigest<S> = options.digest ?? (canonicalDigest as StateDigest<S>);
  const intents = options.intents ?? [];
  const checkpoints: Checkpoint[] = [];
  const snapshots: SnapshotRecord[] = [];

  const capturePoint = (tick: SimTick, embed: boolean): void => {
    const state = options.runner({
      initialState: options.initialState,
      runSeed: options.runSeed,
      targetTick: tick,
      intentsUpToTick: intents.filter((entry) => entry.tick <= tick),
    });
    const stateHash = digest(state);
    checkpoints.push({ tick, stateHash });
    if (!embed) return;
    const snapshot: { tick: SimTick; stateHash: HashHex; state?: unknown; stateEncoding?: "canonical-json" } = { tick, stateHash };
    if (embedState) {
      snapshot.state = state;
      snapshot.stateEncoding = "canonical-json";
    }
    snapshots.push(snapshot);
  };

  // Capture ticks = ring stride ∪ snapshot stride ∪ {0, terminal}, ascending.
  // Snapshots must land on EVERY snapshotEveryTicks multiple even when the
  // ring stride skips it — and parse law keeps snapshot ⊆ ring, so any
  // snapshot tick is also recorded into the ring.
  const captureTicks = new Set<SimTick>([0n, options.totalTicks]);
  for (let tick = checkpointEvery; tick <= options.totalTicks; tick += checkpointEvery) captureTicks.add(tick);
  for (let tick = options.snapshotEveryTicks; tick <= options.totalTicks; tick += options.snapshotEveryTicks) captureTicks.add(tick);
  const sorted = [...captureTicks].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  for (const tick of sorted) {
    const isSnapshot = tick % options.snapshotEveryTicks === 0n;
    if (isSnapshot || tick === 0n) capturePoint(tick, true);
    else capturePoint(tick, false);
  }

  return {
    schemaVersion: 1,
    runSeed: options.runSeed,
    engineVersion: options.engineVersion,
    contentHashes: options.contentHashes,
    snapshotEveryTicks: options.snapshotEveryTicks,
    intentLog: [...intents],
    directorDraws: [...(options.directorDraws ?? [])],
    checkpoints,
    snapshots,
    lineage: { ...(options.lineage ?? {}) },
  };
}

export interface Harness<S> {
  /** Capture the reference run once (memoized bundle with ring + snapshots). */
  capture(): ReplayBundleDoc;
  /** Final-ring-tick digest of one fresh re-sim. */
  replayFinalDigest(doc?: ReplayBundleDoc): HashHex;
  /** Digests of `runs` independent re-sims (the ×100 byte-identical gate). */
  replayDigests(runs: number, doc?: ReplayBundleDoc): HashHex[];
  /** Verify a doc (defaults to the harness's own capture) against the runner. */
  verify(doc?: ReplayBundleDoc): VerifyResult;
  /** Compact then re-verify — compaction may never break verifiability.
   *  Throws with the offending tick when a compacted doc fails to verify. */
  compactAndVerify(doc: ReplayBundleDoc, options: CompactionOptions): CompactionResult;
}

/** Build a reusable harness around one scenario (runner + initial state). */
export function createHarness<S>(options: CaptureOptions<S>): Harness<S> {
  const digest: StateDigest<S> = options.digest ?? (canonicalDigest as StateDigest<S>);
  let captured: ReplayBundleDoc | undefined;

  const docOr = (doc?: ReplayBundleDoc): ReplayBundleDoc => doc ?? (captured ??= captureRun(options));

  const replayDigestAt = (doc: ReplayBundleDoc, tick: SimTick): HashHex => {
    const state = options.runner({
      initialState: options.initialState,
      runSeed: doc.runSeed,
      targetTick: tick,
      intentsUpToTick: doc.intentLog.filter((entry) => entry.tick <= tick),
    });
    return digest(state);
  };

  const finalRingTick = (doc: ReplayBundleDoc): SimTick => {
    const last = doc.checkpoints[doc.checkpoints.length - 1];
    if (last === undefined) throw new ReplayError("harness: captured doc has an empty checkpoint ring");
    return last.tick;
  };

  const harness: Harness<S> = {
    capture: () => docOr(),
    replayFinalDigest: (doc?) => replayDigestAt(docOr(doc), finalRingTick(docOr(doc))),
    replayDigests: (runs, doc?) => {
      if (!Number.isSafeInteger(runs) || runs < 1) throw new ReplayError(`harness: runs must be an integer ≥ 1, got ${runs}`);
      const target = docOr(doc);
      const tick = finalRingTick(target);
      const out: HashHex[] = [];
      for (let i = 0; i < runs; i += 1) out.push(replayDigestAt(target, tick));
      return out;
    },
    verify: (doc?) =>
      verifyReplay({
        doc: docOr(doc),
        initialState: options.initialState,
        runner: options.runner,
        ...(options.digest === undefined ? {} : { digest: options.digest }),
      }),
    compactAndVerify: (doc, compaction) => {
      const result = compactBundle(doc, compaction);
      assertCompactionSafe(doc, result.doc);
      const verified = verifyReplay({
        doc: result.doc,
        initialState: options.initialState,
        runner: options.runner,
        ...(options.digest === undefined ? {} : { digest: options.digest }),
      });
      if (!verified.ok) {
        throw new ReplayError(`harness: compacted bundle failed re-verification at tick ${verified.failures[0]?.tick}`);
      }
      return result;
    },
  };
  return harness;
}
