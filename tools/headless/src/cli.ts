/**
 * headless-tools CLI — run / replay-verify / digest / canary / parity / bench.
 *
 * Execute with PLAIN NODE (no build step, no tsx):
 *   node --experimental-transform-types src/cli.ts <command> …
 * (the flag is required because sim-core's types.ts carries `export enum`;
 *  README §Toolchain documents the choice + the tsx alternative.)
 *
 * Exit codes: 0 ok · 1 verification/canary/budget failure · 2 usage error.
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { runFromBundle } from "./engine.ts";
import { parseBundleJson } from "./bundle.ts";
import { buildArtifact, readArtifact, verifyArtifact, writeArtifact } from "./artifact.ts";
import { canonicalize, digestOfCanonical, decodeCanonical, type CanonicalValue } from "./canonical.ts";
import { runParityFixture } from "./harness.ts";
import { formatReport, scanDirectory, simCoreSrcDir } from "./canary.ts";
import { formatBench, runBench, PROVISIONAL_TARGET_TICKS_PER_SEC } from "./bench.ts";

const USAGE = `headless-tools — Node-port harness for @hh/sim-core (RISK-1 parity gate)

Usage:
  run <bundleDir> --seed N --ticks N [--snapshot-every K] [--out FILE]
        Executes the stub-composition sim for N ticks (bundleDir/bundle.json
        holds the TypeBundle). Prints digests; --out writes a replay artifact.

  replay-verify <artifact.json>
        Re-executes the run captured in a --out artifact and compares every
        checkpoint + chain digest byte-for-byte. Exit 1 on any divergence.

  digest <state.json>
        Prints the canonical (bigint-tagged, insertion-order) digest of a
        state tree — a standalone state file or any artifact's finalState.

  canary [dir]
        Scans TypeScript sources (default: packages/sim-core/src) for
        forbidden runtime-sensitive APIs. Exit 1 on violations.

  parity [--seed N] [--ticks N] [--json]
        Runs the dual-runtime parity fixture in THIS runtime and prints the
        report (the CI test compares this against the vitest arm).

  bench [--seed N] [--ticks N] [--target TPS]
        Kernel + engine throughput vs the PROVISIONAL budget
        (${PROVISIONAL_TARGET_TICKS_PER_SEC.toLocaleString("en-US")} ticks/s; see README §Budget).`;

interface Flags {
  readonly get: (name: string) => string | undefined;
  readonly has: (name: string) => boolean;
}

function parseFlags(args: readonly string[]): { readonly positional: string[]; readonly flags: Flags } {
  const positional: string[] = [];
  const map = new Map<string, string>();
  const set = new Set<string>();
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i] ?? "";
    if (arg.startsWith("--")) {
      const eq = arg.indexOf("=");
      if (eq !== -1) {
        map.set(arg.slice(2, eq), arg.slice(eq + 1));
        set.add(arg.slice(2, eq));
      } else {
        const name = arg.slice(2);
        const next = args[i + 1];
        if (next !== undefined && !next.startsWith("--")) {
          map.set(name, next);
          set.add(name);
          i += 1;
        } else {
          set.add(name);
        }
      }
      continue;
    }
    positional.push(arg);
  }
  return {
    positional,
    flags: { get: (name) => map.get(name), has: (name) => set.has(name) },
  };
}

function requireFlag(flags: Flags, name: string): string {
  const value = flags.get(name);
  if (value === undefined) throw new UsageError(`missing --${name}`);
  return value;
}

function parseSeed(raw: string): bigint {
  if (!/^(0x[0-9a-fA-F]+|\d+)$/.test(raw)) throw new UsageError(`--seed must be decimal or 0x hex, got "${raw}"`);
  return BigInt(raw);
}

function parsePositiveInt(raw: string, label: string): number {
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1) throw new UsageError(`--${label} must be a positive integer, got "${raw}"`);
  return value;
}

class UsageError extends Error {}

/* ─────────────────────────── commands ─────────────────────────── */

function cmdRun(positional: readonly string[], flags: Flags): number {
  const bundleDir = positional[0];
  if (bundleDir === undefined) throw new UsageError("run requires <bundleDir>");
  const bundlePath = join(bundleDir, "bundle.json");
  if (!existsSync(bundlePath)) throw new UsageError(`no bundle.json under ${bundleDir}`);

  const seed = parseSeed(requireFlag(flags, "seed"));
  const ticks = parsePositiveInt(requireFlag(flags, "ticks"), "ticks");
  const snapshotEvery = parsePositiveInt(flags.get("snapshot-every") ?? "100", "snapshot-every");

  const parsed = parseBundleJson(readFileSync(bundlePath, "utf8"), bundlePath);

  const wallStart = process.hrtime.bigint();
  const run = runFromBundle(parsed, seed, ticks, snapshotEvery);
  const wallMs = Number(process.hrtime.bigint() - wallStart) / 1e6;

  const artifact = buildArtifact(parsed, bundleDir, seed, ticks, snapshotEvery, run, {
    wallMs: Math.round(wallMs * 100) / 100,
    ticksPerSec: Math.round(ticks / (wallMs / 1000)),
  });

  const outPath = flags.get("out");
  if (outPath !== undefined) writeArtifact(outPath, artifact);

  process.stdout.write(
    [
      `run: bundle=${parsed.bundle.id} seed=${seed.toString()} ticks=${String(ticks)} slots=${artifact.slotsComposition}`,
      `stats: arrived=${String(run.stats.arrived)} served=${String(run.stats.served)} bounced=${String(run.stats.bounced)} blocked=${String(run.stats.blocked)} events=${String(run.stats.events)}`,
      `chain: ${run.chainDigest}`,
      `final: ${digestOfCanonical(artifact.finalState)}`,
      `checkpoints: ${String(artifact.checkpoints.length)}${artifact.checkpoints.length > 0 ? ` (last @tick ${artifact.checkpoints[artifact.checkpoints.length - 1]?.tick}: ${artifact.checkpoints[artifact.checkpoints.length - 1]?.stateHash})` : ""}`,
      `wall: ${wallMs.toFixed(1)}ms (${String(artifact.timing?.ticksPerSec ?? 0)} ticks/s, display-only)`,
      outPath === undefined ? "" : `artifact: ${outPath}`,
    ]
      .filter((l) => l.length > 0)
      .join("\n") + "\n",
  );
  return 0;
}

function cmdReplayVerify(positional: readonly string[]): number {
  const path = positional[0];
  if (path === undefined) throw new UsageError("replay-verify requires <artifact.json>");
  const artifact = readArtifact(path);
  const result = verifyArtifact(artifact);
  if (result.ok) {
    process.stdout.write(
      `replay-verify: PASS — ${String(artifact.checkpoints.length)} checkpoint(s) + chain ${artifact.chainDigest} reproduced byte-identically (seed ${artifact.runSeed}, ${String(artifact.ticks)} ticks)\n`,
    );
    return 0;
  }
  process.stdout.write(`replay-verify: FAIL — ${String(result.mismatches.length)} divergence(s) (seed ${artifact.runSeed}, ${String(artifact.ticks)} ticks)\n`);
  for (const mismatch of result.mismatches) process.stdout.write(`  ${mismatch}\n`);
  return 1;
}

function cmdDigest(positional: readonly string[]): number {
  const path = positional[0];
  if (path === undefined) throw new UsageError("digest requires <state.json>");
  const tree: unknown = JSON.parse(readFileSync(path, "utf8"));
  const state =
    typeof tree === "object" && tree !== null && (tree as Record<string, unknown>)["kind"] === "hh-run"
      ? (tree as { finalState: unknown }).finalState
      : tree;
  // Round-trip guard: decode → re-canonicalize must equal the stored tree.
  const decoded = decodeCanonical(state, "$");
  const reCanonical = canonicalize(decoded, "$");
  const hash = digestOfCanonical(reCanonical);
  const stored = digestOfCanonical(state as CanonicalValue);
  if (hash !== stored) {
    process.stdout.write(`digest: FAIL — tree is not canonical-stable (${hash} ≠ ${stored})\n`);
    return 1;
  }
  process.stdout.write(`${hash}\n`);
  return 0;
}

function cmdCanary(positional: readonly string[]): number {
  const dir = positional[0] ?? simCoreSrcDir();
  const report = scanDirectory(dir);
  process.stdout.write(formatReport(report) + "\n");
  return report.violations.length === 0 ? 0 : 1;
}

function cmdParity(positional: readonly string[], flags: Flags): number {
  void positional;
  const seed = parseSeed(flags.get("seed") ?? "7");
  const ticks = parsePositiveInt(flags.get("ticks") ?? "1000", "ticks");
  const report = runParityFixture(seed, ticks);
  process.stdout.write(`${JSON.stringify(report)}\n`);
  return 0;
}

function cmdBench(flags: Flags): number {
  const seed = parseSeed(flags.get("seed") ?? "7");
  const ticks = parsePositiveInt(flags.get("ticks") ?? "20000", "ticks");
  const target = parsePositiveInt(flags.get("target") ?? String(PROVISIONAL_TARGET_TICKS_PER_SEC), "target");
  const result = runBench(seed, ticks, target);
  process.stdout.write(formatBench(result) + "\n");
  return result.target.met ? 0 : 1;
}

/* ─────────────────────────── dispatch ─────────────────────────── */

export function main(argv: readonly string[]): number {
  const [command = "", ...rest] = argv;
  const { positional, flags } = parseFlags(rest);
  switch (command) {
    case "run":
      return cmdRun(positional, flags);
    case "replay-verify":
      return cmdReplayVerify(positional);
    case "digest":
      return cmdDigest(positional);
    case "canary":
      return cmdCanary(positional);
    case "parity":
      return cmdParity(positional, flags);
    case "bench":
      return cmdBench(flags);
    case "help":
    case "":
      process.stdout.write(`${USAGE}\n`);
      return command === "" ? 2 : 0;
    default:
      throw new UsageError(`unknown command "${command}"`);
  }
}

function isDirectRun(): boolean {
  const entry = process.argv[1];
  if (entry === undefined) return false;
  return pathToFileURL(entry).href === import.meta.url;
}

if (isDirectRun()) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (error) {
    if (error instanceof UsageError) {
      process.stderr.write(`error: ${error.message}\n\n${USAGE}\n`);
      process.exitCode = 2;
    } else {
      process.stderr.write(`error: ${String(error instanceof Error ? error.stack ?? error.message : error)}\n`);
      process.exitCode = 1;
    }
  }
}
