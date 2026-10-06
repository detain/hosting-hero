/**
 * `src/replay` — canonical serialization, ReplayBundle codec, replay
 * verification, causality traces, compaction, and the test harness
 * (MASTER_REPORT §3.3 save & replay artifacts, §3.4 Node port parity,
 * §7.0 P0 ReplayLog/checkpoint-ring/state-hash-tripwire row).
 *
 * Dependency law (hard): ../types.js + ../kernel/* only; SimRunner is
 * injected structurally so this dir NEVER imports pipeline/policy/economy/
 * observed/topology. No Node crypto in the sim path.
 */

export {
  MAX_CANONICAL_DEPTH,
  ReplayError,
  compareCodeUnits,
  decodeCanonicalBinary,
  decodeCanonicalJson,
  digestCanonicalValue,
  encodeCanonicalBinary,
  encodeCanonicalJson,
  fail,
  fnv1a64Hex,
  fnv1a64Text,
  requireDefined,
  utf8Decode,
  utf8Encode,
  type JsonValue,
} from "./canonical.ts";
export {
  REPLAY_SCHEMA_VERSION,
  decodeReplayBundle,
  decodeReplayBundleBinary,
  decodeReplayBundleJson,
  encodeReplayBundleBinary,
  encodeReplayBundleJson,
  parseReplayBundleWire,
  replayBundleDocToWire,
  stampIntents,
  toReplayBundle,
  type BundleExtras,
  type ReplayBundleDoc,
  type SnapshotRecord,
  type StampedIntent,
} from "./bundle.ts";
export { diffStates, type DiffKind, type DiffOptions, type DiffResult, type PathDiff } from "./diff.ts";
export {
  assertReplayVerifiable,
  canonicalDigest,
  verifyReplay,
  type SimRunner,
  type SimRunnerRequest,
  type SnapshotFailure,
  type StateDigest,
  type VerifyRequest,
  type VerifyResult,
} from "./verify.ts";
export {
  buildCauseIndex,
  causeRecordsFromEvents,
  oneSentenceExplanation,
  redHerringLane,
  traceContributingFactors,
  type CauseIndex,
  type CauseRecord,
  type CausalTrace,
} from "./causality.ts";
export { assertCompactionSafe, compactBundle, type CompactionOptions, type CompactionResult } from "./compact.ts";
export { captureRun, createHarness, type CaptureOptions, type Harness } from "./harness.ts";
