/**
 * Run artifacts — the self-contained JSON a `run` writes and `replay-verify`
 * consumes (the replay contract, §3.3 item 1: seed + inputs + checkpoints
 * reproduce every state hash).
 *
 * The artifact EMBEDS the bundle (canonical tree) so a replay needs no other
 * file; the original bundleDir is recorded for humans only. `timing` is
 * display metadata measured with wall clocks OUTSIDE sim state — it is
 * excluded from every digest by construction (it never enters the engine).
 */

import { readFileSync, writeFileSync } from "node:fs";

import { asRunSeed, type Checkpoint, type TypeBundle } from "./sim-core.ts";
import { canonicalize, digestOfCanonical, type CanonicalValue } from "./canonical.ts";
import { FLAT_CLOCK, HEADLESS_ENGINE_VERSION, runFromBundle, type RunOutput } from "./engine.ts";
import { isCompositionFlavor, type CompositionFlavor } from "./slots.ts";
import { parseBundleValue, type ParsedBundle } from "./bundle.ts";

export const RUN_ARTIFACT_KIND = "hh-run";

export interface RunArtifact {
  readonly kind: typeof RUN_ARTIFACT_KIND;
  readonly engineVersion: string;
  readonly slotsComposition: CompositionFlavor;
  readonly bundleDir: string;
  readonly runSeed: string; // decimal bigint string
  readonly ticks: number;
  readonly snapshotEveryTicks: number;
  readonly clockScript: "flat-1x";
  readonly chainDigest: string;
  readonly checkpoints: readonly { tick: string; stateHash: string }[];
  readonly stats: RunOutput["stats"];
  readonly finalState: CanonicalValue;
  /** Bundle as canonical JSON text (authored floats stay OUT of the value
   *  tree; hashes run over this text — engine.bundleContentHash). */
  readonly bundleJson: string;
  readonly timing?: { readonly wallMs: number; readonly ticksPerSec: number };
}

export function buildArtifact(
  parsed: ParsedBundle,
  bundleDir: string,
  seedValue: bigint,
  ticks: number,
  snapshotEveryTicks: number,
  run: RunOutput,
  timing: { wallMs: number; ticksPerSec: number } | undefined,
): RunArtifact {
  const checkpoints = run.checkpoints.map((cp: Checkpoint) => ({ tick: cp.tick.toString(), stateHash: cp.stateHash }));
  return {
    kind: RUN_ARTIFACT_KIND,
    engineVersion: HEADLESS_ENGINE_VERSION,
    slotsComposition: run.slotsFlavor,
    bundleDir,
    runSeed: seedValue.toString(),
    ticks,
    snapshotEveryTicks,
    clockScript: "flat-1x",
    chainDigest: run.chainDigest,
    checkpoints,
    stats: run.stats,
    finalState: canonicalize(run.finalState, "$.finalState"),
    bundleJson: JSON.stringify(parsed.bundle),
    ...(timing === undefined ? {} : { timing }),
  };
}

export function serializeArtifact(artifact: RunArtifact): string {
  return `${JSON.stringify(artifact, null, 2)}\n`;
}

export function writeArtifact(path: string, artifact: RunArtifact): void {
  writeFileSync(path, serializeArtifact(artifact), "utf8");
}

export function readArtifact(path: string): RunArtifact {
  const raw = readFileSync(path, "utf8");
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch (error) {
    throw new Error(`artifact ${path}: invalid JSON — ${String(error)}`);
  }
  return parseArtifact(value, path);
}

export function parseArtifact(value: unknown, source: string): RunArtifact {
  if (typeof value !== "object" || value === null) {
    throw new Error(`artifact ${source}: expected an object`);
  }
  const record = value as Record<string, unknown>;
  if (record["kind"] !== RUN_ARTIFACT_KIND) {
    throw new Error(`artifact ${source}: kind must be "${RUN_ARTIFACT_KIND}", got ${String(record["kind"])}`);
  }
  const seedRaw = record["runSeed"];
  if (typeof seedRaw !== "string" || !/^\d+$/.test(seedRaw)) {
    throw new Error(`artifact ${source}: runSeed must be a decimal string`);
  }
  for (const key of ["ticks", "snapshotEveryTicks"] as const) {
    const v = record[key];
    if (typeof v !== "number" || !Number.isSafeInteger(v) || v < 1) {
      throw new Error(`artifact ${source}: ${key} must be a positive safe integer`);
    }
  }
  const checkpoints = record["checkpoints"];
  if (!Array.isArray(checkpoints)) throw new Error(`artifact ${source}: checkpoints must be an array`);
  const chainDigest = record["chainDigest"];
  if (typeof chainDigest !== "string") throw new Error(`artifact ${source}: chainDigest missing`);
  const slotsComposition = record["slotsComposition"];
  if (!isCompositionFlavor(slotsComposition)) {
    throw new Error(
      `artifact ${source}: slotsComposition must be a known flavor ("stub-v1"|"real-v1"), got ${String(slotsComposition)}`,
    );
  }
  const bundle = record["bundleJson"];
  if (typeof bundle !== "string") throw new Error(`artifact ${source}: embedded bundleJson missing`);
  const finalState = record["finalState"];
  if (typeof finalState !== "object" || finalState === null) throw new Error(`artifact ${source}: finalState missing`);

  return value as unknown as RunArtifact;
}

export interface VerifyResult {
  readonly ok: boolean;
  readonly mismatches: readonly string[];
  readonly rerunChainDigest: string;
}

/** Re-execute the artifact's inputs — at the composition flavor it was
 *  stamped with (a stub-era artifact replays stub, a real-era artifact
 *  replays real; the stamp is provenance AND replay input) — and compare
 *  every checkpoint + the chain digest byte-for-byte. This is `replay-verify`. */
export function verifyArtifact(artifact: RunArtifact): VerifyResult {
  const bundleValue = JSON.parse(artifact.bundleJson) as TypeBundle;
  const parsed = parseBundleValue(bundleValue, `artifact:${artifact.bundleDir}`);
  const seed = asRunSeed(BigInt(artifact.runSeed));
  const run = runFromBundle(parsed, seed, artifact.ticks, artifact.snapshotEveryTicks, FLAT_CLOCK, artifact.slotsComposition);

  const mismatches: string[] = [];
  if (run.chainDigest !== artifact.chainDigest) {
    mismatches.push(`chainDigest: expected ${artifact.chainDigest}, got ${run.chainDigest}`);
  }
  if (run.checkpoints.length !== artifact.checkpoints.length) {
    mismatches.push(`checkpoints: expected ${String(artifact.checkpoints.length)}, got ${String(run.checkpoints.length)}`);
  } else {
    for (const [i, cp] of run.checkpoints.entries()) {
      const expected = artifact.checkpoints[i];
      if (expected === undefined) break;
      if (cp.tick.toString() !== expected.tick || cp.stateHash !== expected.stateHash) {
        mismatches.push(`checkpoint[${String(i)}] tick ${expected.tick}: expected ${expected.stateHash}, got ${cp.stateHash}`);
      }
    }
  }
  const rerunFinalHash = digestOfCanonical(canonicalize(run.finalState, "$.finalState"));
  const storedFinalHash = digestOfCanonical(artifact.finalState);
  if (rerunFinalHash !== storedFinalHash) {
    mismatches.push(`finalState: expected ${storedFinalHash}, got ${rerunFinalHash}`);
  }
  return { ok: mismatches.length === 0, mismatches, rerunChainDigest: run.chainDigest };
}
