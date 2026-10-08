/** perf-tools ab — A/B throughput bench across two sim-core trees.
 *
 *  Variants are either filesystem paths (a worktree, a scratch copy like the
 *  audit's /tmp/opencode/perf6/fix/src, or "repo" = this checkout) or git refs
 *  (a ref gets a DETACHED `git worktree add` under /tmp, removed at the end).
 *
 *  READ-ONLY LAW (why): a sibling lane once lost uncommitted work to
 *  `git checkout -- .` inside the main tree. This tool never checks anything
 *  out in the main tree and never writes into the working tree (git admin
 *  metadata under .git/worktrees/ is created and removed/pruned) — tree.ts#assertGitCommandSafe
 *  rejects every git verb except `worktree add --detach|remove|prune` and
 *  `rev-parse`, and worktree targets must live under /tmp.
 *
 *  Scenarios (default suite, the FIX-8 reproduction shape):
 *    congested     1-slot path, 30/60-min services, patience > run → pure
 *                  waiter backlog; queue-ghosts guaranteed (where dedup/COW
 *                  style fixes show up)
 *    control-n2    fast 64-slot grid cell — a behavior-preserving fix must be
 *                  a ~1.00x no-op here
 *    control-n200  same control on a 200-node board (per-node walks dominate)
 *
 *  Interleaved reps (A,B,A,B,…) so drift in machine load hits both arms.
 *  Run: node --experimental-transform-types src/ab.ts --variant-a X --variant-b Y
 *  Exit codes: 0 measured · 1 load/bench failure · 2 usage error.
 */

import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

import { AB_SCENARIOS, gridSpec, runBench, type BenchSpec, type BenchResult } from "./board.ts";
import { parseFlags, parsePositiveInt, UsageError } from "./flags.ts";
import { envMeta, type EnvMeta } from "./timing.ts";
import { addWorktree, classifyVariant, loadTree, removeWorktree, type WorktreeHandle } from "./tree.ts";

const USAGE = `perf ab — two-tree A/B bench (paths or git refs; worktrees only under /tmp)

Usage:
  ab --variant-a REF_OR_PATH --variant-b REF_OR_PATH [flags]
    --variant-a X         left arm: path (repo root / package / src dir / "repo")
                          or git ref (detached /tmp worktree)
    --variant-b X         right arm (the candidate — speedup is B/A)
    --scenarios a,b,c     congested | control-n2 | control-n200 (default all three)
    --cells n50@6,n2@200  extra grid-shaped cells appended to the suite
    --digest              run cells with digestState every tick
    --reps N              interleaved best-of-N per arm (default 2)
    --label-a NAME        display name for A (default: the locator)
    --label-b NAME        display name for B
    --worktree-root DIR   where ref worktrees go (default /tmp/hh-perf-worktrees)
    --keep-worktrees      leave /tmp worktrees in place (prints cleanup hint)
    --json PATH|'-'       machine-readable results
    --dry-run             resolve + print the plan only (loads nothing, spawns no git)

READ-ONLY against the repo: never checkout/reset/clean in the main tree.`;

interface ResolvedVariant {
  readonly locator: string;
  readonly label: string;
  readonly kind: "path" | "ref";
  readonly simSrcRoot: string;
  readonly worktree: WorktreeHandle | null;
}

interface ArmReport {
  readonly label: string;
  readonly bestTps: number;
  readonly samplesTps: readonly number[];
  readonly unitsLast: number;
  readonly finalQueue: number;
  readonly finalDuplicates: number;
  readonly maxDuplicates: number;
}

interface ScenarioReport {
  readonly scenario: string;
  readonly ticks: number;
  readonly digest: boolean;
  readonly a: ArmReport;
  readonly b: ArmReport;
  readonly speedupBOverA: number;
}

interface AbReport {
  readonly tool: "perf-ab";
  readonly meta: EnvMeta;
  readonly variantA: string;
  readonly variantB: string;
  readonly simSrcRootA: string;
  readonly simSrcRootB: string;
  readonly reps: number;
  readonly scenarios: readonly ScenarioReport[];
}

function resolveVariant(flagsValue: string | undefined, side: "a" | "b", label: string | undefined, worktreeRoot: string, dryRun: boolean): ResolvedVariant {
  if (flagsValue === undefined) throw new UsageError(`--variant-${side} is required`);
  const kind = classifyVariant(flagsValue);
  if (kind.kind === "path") {
    return { locator: flagsValue, label: label ?? flagsValue, kind: "path", simSrcRoot: kind.simSrcRoot, worktree: null };
  }
  if (dryRun) {
    // Plan-only: name the tree we WOULD create without touching git at all.
    return { locator: flagsValue, label: label ?? flagsValue, kind: "ref", simSrcRoot: `<worktree ${flagsValue}>`, worktree: null };
  }
  const handle = addWorktree(kind.ref, worktreeRoot);
  return { locator: flagsValue, label: label ?? flagsValue, kind: "ref", simSrcRoot: handle.simSrcRoot, worktree: handle };
}

function parseSuite(raw: string | undefined, cellsRaw: string | undefined, digest: boolean): { name: string; spec: () => BenchSpec }[] {
  const names = raw === undefined ? [...AB_SCENARIOS.keys()] : raw.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
  const suite: { name: string; spec: () => BenchSpec }[] = [];
  for (const name of names) {
    const factory = AB_SCENARIOS.get(name);
    if (factory === undefined) throw new UsageError(`unknown scenario "${name}" (known: ${[...AB_SCENARIOS.keys()].join(", ")})`);
    suite.push({ name, spec: () => factory(digest) });
  }
  if (cellsRaw !== undefined) {
    for (const cell of cellsRaw.split(",").map((s) => s.trim()).filter((s) => s.length > 0)) {
      const m = /^n(\d+)@(\d+)$/.exec(cell);
      if (m === null) throw new UsageError(`--cells entries must look like n200@50, got "${cell}"`);
      suite.push({ name: `cell-${cell}`, spec: () => gridSpec(Number(m[1]), Number(m[2]), digest) });
    }
  }
  if (suite.length === 0) throw new UsageError("empty scenario suite");
  return suite;
}

function armReport(label: string, results: readonly BenchResult[]): ArmReport {
  const best = results.reduce((a, b) => (b.tps > a.tps ? b : a), results[0] as BenchResult);
  return {
    label,
    bestTps: Math.round(best.tps),
    samplesTps: results.map((r) => Math.round(r.tps)),
    unitsLast: best.unitsLast,
    finalQueue: best.finalQueue,
    finalDuplicates: best.finalDuplicates,
    maxDuplicates: best.maxDuplicates,
  };
}

function line(label: string, r: ArmReport): string {
  return `${label.padEnd(28)} t/s ${String(r.bestTps).padStart(7)}  q ${String(r.finalQueue).padStart(6)}  dup ${String(r.finalDuplicates).padStart(6)}  maxDup ${String(r.maxDuplicates).padStart(6)}`;
}

export async function main(argv: readonly string[]): Promise<number> {
  const { flags } = parseFlags(argv);
  if (flags.has("help")) {
    process.stdout.write(`${USAGE}\n`);
    return 0;
  }
  const dryRun = flags.has("dry-run");
  const digest = flags.has("digest");
  const reps = parsePositiveInt(flags.get("reps") ?? "2", "reps");
  const worktreeRoot = flags.get("worktree-root") ?? "/tmp/hh-perf-worktrees";

  const a = resolveVariant(flags.get("variant-a"), "a", flags.get("label-a"), worktreeRoot, dryRun);
  const b = resolveVariant(flags.get("variant-b"), "b", flags.get("label-b"), worktreeRoot, dryRun);
  const suite = parseSuite(flags.get("scenarios"), flags.get("cells"), digest);
  const jsonOut = flags.get("json");

  if (dryRun) {
    process.stdout.write(
      `${JSON.stringify(
        {
          tool: "perf-ab",
          dry_run: true,
          meta: envMeta(),
          variantA: { locator: a.locator, kind: a.kind, simSrcRoot: a.simSrcRoot },
          variantB: { locator: b.locator, kind: b.kind, simSrcRoot: b.simSrcRoot },
          reps,
          digest,
          scenarios: suite.map((s) => ({ name: s.name, ticks: s.spec().ticks })),
        },
        null,
        2,
      )}\n`,
    );
    process.stdout.write("dry-run: plan printed, nothing loaded, no git spawned\n");
    return 0;
  }

  const reports: ScenarioReport[] = [];
  // Normalised roots: `tree.srcRoot` once loaded (the resolveSimSrcRoot
  // locator root is the honest pre-load value; a mid-load throw never
  // reaches the report below anyway).
  let srcRootA = a.simSrcRoot;
  let srcRootB = b.simSrcRoot;
  try {
    // Load both trees (boundary-verified; sibling mid-edit trees fail loud
    // here) INSIDE the try: ref worktrees already exist by this point, so a
    // mid-load throw must still run the `finally` cleanup — the pre-R8
    // placement leaked every /tmp worktree a failed load had created.
    const [treeA, treeB] = await Promise.all([loadTree(a.simSrcRoot), loadTree(b.simSrcRoot)]);
    srcRootA = treeA.srcRoot;
    srcRootB = treeB.srcRoot;
    process.stdout.write(`ab A=${a.label} (${srcRootA})\n   B=${b.label} (${srcRootB})\nreps=${String(reps)} digest=${String(digest)} load1=${envMeta().loadAvg1} — interleaved A,B,A,B\n`);
    for (const { name, spec: makeSpec } of suite) {
      const spec = makeSpec();
      const resultsA: BenchResult[] = [];
      const resultsB: BenchResult[] = [];
      for (let rep = 0; rep < reps; rep += 1) {
        resultsA.push(runBench(treeA, spec));
        resultsB.push(runBench(treeB, spec));
      }
      const ra = armReport(a.label, resultsA);
      const rb = armReport(b.label, resultsB);
      const speedup = ra.bestTps === 0 ? Number.NaN : Math.round((rb.bestTps / ra.bestTps) * 100) / 100;
      reports.push({ scenario: name, ticks: spec.ticks, digest, a: ra, b: rb, speedupBOverA: speedup });
      process.stdout.write(`${name} (${String(spec.ticks)} ticks)\n`);
      process.stdout.write(`  ${line(`${a.label}:`, ra)}\n`);
      process.stdout.write(`  ${line(`${b.label}:`, rb)}\n`);
      process.stdout.write(`  speedup B/A ${speedup.toFixed(2)}x\n`);
      const segs = resultsB[resultsB.length - 1]?.segments;
      if (segs !== null && segs !== undefined && segs.length > 0) {
        for (const s of segs.slice(0, 8)) {
          process.stdout.write(`    B-segment ${s.usPerTick.toFixed(1).padStart(8)} µs/tick  ${s.name} (n=${String(s.n)})\n`);
        }
      }
    }
  } finally {
    for (const v of [a, b]) {
      if (v.worktree !== null && !flags.has("keep-worktrees")) process.stdout.write(`${removeWorktree(v.worktree)}\n`);
      else if (v.worktree !== null) process.stdout.write(`kept worktree: ${v.worktree.dir} (git worktree remove to clean)\n`);
    }
  }

  const full: AbReport = {
    tool: "perf-ab",
    meta: envMeta(),
    variantA: a.locator,
    variantB: b.locator,
    simSrcRootA: srcRootA,
    simSrcRootB: srcRootB,
    reps,
    scenarios: reports,
  };
  const summary: Record<string, number> = {};
  for (const r of reports) summary[r.scenario] = r.speedupBOverA;
  process.stdout.write(`SUMMARY ${JSON.stringify(summary)}\n`);

  if (jsonOut === "-") process.stdout.write(`${JSON.stringify(full, null, 2)}\n`);
  else if (jsonOut !== undefined) {
    writeFileSync(jsonOut, `${JSON.stringify(full, null, 2)}\n`, "utf8");
    process.stdout.write(`json: ${jsonOut}\n`);
  }
  return 0;
}

function isDirectRun(): boolean {
  const entry = process.argv[1];
  if (entry === undefined) return false;
  return pathToFileURL(entry).href === import.meta.url;
}

if (isDirectRun()) {
  main(process.argv.slice(2)).then(
    (code) => {
      process.exitCode = code;
    },
    (error: unknown) => {
      if (error instanceof UsageError) {
        process.stderr.write(`error: ${error.message}\n\n${USAGE}\n`);
        process.exitCode = 2;
      } else {
        process.stderr.write(`error: ${String(error instanceof Error ? error.stack ?? error.message : error)}\n`);
        process.exitCode = 1;
      }
    },
  );
}
