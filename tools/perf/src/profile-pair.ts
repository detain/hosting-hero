/** perf-tools profile-pair — CPU-profile one or two sim-core trees and
 *  (optionally) summarize the .cpuprofile output.
 *
 *  Folds the audit's p8/p10 pattern: each workload runs in a CHILD process
 *  spawned with --cpu-prof --cpu-prof-dir=<out>/<arm>; the pair shape (A/B arms
 *  profiled with the identical workload) is what made the FIX-8 and digest
 *  findings comparable. Summarizer: src/summarize.mjs (areas + top frames +
 *  line:column decomposition).
 *
 *  Variants follow the ab.ts law: paths or git refs; refs get detached /tmp
 *  worktrees only — the main checkout is never checked out in.
 *
 *  Run: node --experimental-transform-types src/profile-pair.ts --workload engine [flags]
 *  Exit codes: 0 ok · 1 child/spawn failure · 2 usage error.
 */

import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { parseEnum, parseFlags, UsageError } from "./flags.ts";
import { addWorktree, classifyVariant, removeWorktree, type WorktreeHandle } from "./tree.ts";

const PROF_CHILD = fileURLToPath(new URL("prof-child.ts", import.meta.url));
const SUMMARIZE = fileURLToPath(new URL("summarize.mjs", import.meta.url));

const USAGE = `perf profile-pair — CPU-profile sim-core workloads (one arm or an A/B pair)

Usage:
  profile-pair --workload W [flags]
    --workload W          engine | versus | economy | digest | policy
    --variant LOC         repeatable (max 2): "repo" (default), path, or git ref.
                          Two --variant flags = a pair; children run sequentially
                          (all sim-core model servers share this box's CPUs).
    --nodes N --rate R    engine/digest grid point (default 200 @ 6/min)
    --ticks N             engine loop length (default 4000)
    --digest              engine arm: digestState every tick
    --out DIR             results root (default /tmp/hh-perf-profiles/<timestamp>)
    --summarize           run summarize.mjs on each arm's profile afterwards
    --worktree-root DIR   ref worktrees (default /tmp/hh-perf-worktrees)
    --keep-worktrees      leave ref worktrees in place
    --dry-run             print the planned spawn commands; start nothing

Profiles land as <out>/<label>/CPU.*.cpuprofile — inspect with summarize.mjs
or https://ui.perf.dev.tools .`;

const WORKLOADS = ["engine", "versus", "economy", "digest", "policy"] as const;

interface Arm {
  readonly label: string;
  readonly simSrcRoot: string;
  readonly worktree: WorktreeHandle | null;
  readonly outDir: string;
}

function slug(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "arm";
}

function buildArms(flags: { get: (n: string) => string | undefined; has: (n: string) => boolean; all: (n: string) => readonly string[] }, outRoot: string, dryRun: boolean, worktreeRoot: string): Arm[] {
  const raws = flags.all("variant").length === 0 ? ["repo"] : flags.all("variant");
  if (raws.length > 2) throw new UsageError("at most two --variant arms (pair profiling); run twice for more");
  return raws.map((raw, i) => {
    const kind = classifyVariant(raw);
    const label = `${String(i + 1)}-${slug(raw)}`;
    if (kind.kind === "path") {
      return { label, simSrcRoot: kind.simSrcRoot, worktree: null, outDir: join(outRoot, label) };
    }
    if (dryRun) {
      return { label, simSrcRoot: `<worktree ${raw}>`, worktree: null, outDir: join(outRoot, label) };
    }
    const worktree = addWorktree(kind.ref, worktreeRoot);
    return { label, simSrcRoot: worktree.simSrcRoot, worktree, outDir: join(outRoot, label) };
  });
}

function planChildCommand(arm: Arm, workload: string, flags: { get: (n: string) => string | undefined; has: (n: string) => boolean }): string[] {
  const args = [
    process.execPath,
    "--experimental-transform-types",
    "--cpu-prof",
    `--cpu-prof-dir=${arm.outDir}`,
    PROF_CHILD,
    "--workload",
    workload,
    "--sim-root",
    arm.simSrcRoot,
  ];
  if (workload === "engine" || workload === "digest") {
    args.push("--nodes", flags.get("nodes") ?? "200", "--rate", flags.get("rate") ?? "6");
    if (workload === "engine") args.push("--ticks", flags.get("ticks") ?? "4000");
    if (flags.has("digest")) args.push("--digest");
  }
  return args;
}

// versus fixtures read ../content/<registry> relative to CWD → run children
// from the sim-core package dir of the arm's own tree (worktree-safe).
function cwdFor(workload: string, simSrcRoot: string): string {
  if (workload === "versus" && !simSrcRoot.includes("packages/sim-core/src")) {
    throw new UsageError("versus workload needs a full repo tree layout (…/packages/sim-core/src); use another workload for bare src copies");
  }
  return resolve(simSrcRoot, "..");
}

export function main(argv: readonly string[]): number {
  const { flags } = parseFlags(argv);
  if (flags.has("help")) {
    process.stdout.write(`${USAGE}\n`);
    return 0;
  }
  const workload = parseEnum(flags.get("workload"), WORKLOADS, "workload");
  const dryRun = flags.has("dry-run");
  const worktreeRoot = flags.get("worktree-root") ?? "/tmp/hh-perf-worktrees";
  const outRoot = flags.get("out") ?? join("/tmp", "hh-perf-profiles", new Date().toISOString().replace(/[:.]/g, "-"));

  const arms = buildArms(flags, outRoot, dryRun, worktreeRoot);
  const commands = arms.map((arm) => planChildCommand(arm, workload, flags));

  if (dryRun) {
    process.stdout.write(
      `${JSON.stringify(
        {
          tool: "perf-profile-pair",
          dry_run: true,
          workload,
          outRoot,
          arms: arms.map((arm, i) => ({ label: arm.label, simSrcRoot: arm.simSrcRoot, outDir: arm.outDir, command: commands[i] })),
        },
        null,
        2,
      )}\n`,
    );
    process.stdout.write("dry-run: nothing spawned, no git, no profile dirs\n");
    return 0;
  }

  mkdirSync(outRoot, { recursive: true });
  let failures = 0;
  try {
    for (const [i, arm] of arms.entries()) {
      const args = commands[i] as readonly string[];
      const cwd = cwdFor(workload, arm.simSrcRoot);
      process.stdout.write(`▶ ${arm.label}: ${workload} (cwd=${cwd}) → ${arm.outDir}\n`);
      const r = spawnSync(args[0] as string, args.slice(1), { cwd, stdio: "inherit" });
      if (r.status !== 0) {
        process.stderr.write(`arm ${arm.label} exited ${String(r.status)}\n`);
        failures += 1;
        continue;
      }
      if (flags.has("summarize")) {
        const s = spawnSync(process.execPath, [SUMMARIZE, arm.outDir], { stdio: "inherit" });
        if (s.status !== 0) failures += 1;
      }
    }
  } finally {
    for (const arm of arms) {
      if (arm.worktree !== null && !flags.has("keep-worktrees")) process.stdout.write(`${removeWorktree(arm.worktree)}\n`);
      else if (arm.worktree !== null) process.stdout.write(`kept worktree: ${arm.worktree.dir}\n`);
    }
  }
  process.stdout.write(`profiles: ${outRoot}\n`);
  return failures === 0 ? 0 : 1;
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
