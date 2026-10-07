/** perf-tools grid — board-size × arrival-rate throughput grid.
 *
 *  Measures @hh/sim-core tick throughput (ticks/s) across the audit's default
 *  4 sizes × 3 rates grid, in two arms:
 *    advance — driver.advance only (engine floor)
 *    digest  — driver.advance + digestState EVERY tick (what a real host loop
 *              — unattended fastForward / proto runner / replay harness — pays)
 *
 *  Best-of-N per cell (never a single number — shared box, see README).
 *  Machine-readable output via --json; human table on stdout.
 *
 *  Run: node --experimental-transform-types src/grid.ts [flags]   (or pnpm -F perf-tools grid -- …)
 *  Exit codes: 0 ok · 1 bench/load failure · 2 usage error.
 */

import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

import { defaultTicks, gridSpec, runBench, warmup, GRID_NODES, GRID_RATES, type BenchResult, type BenchSpec, type SegmentRow } from "./board.ts";
import { parseEnum, parseFlags, parsePositiveInt, parsePositiveIntList, UsageError } from "./flags.ts";
import { envMeta, statsOf, type EnvMeta } from "./timing.ts";
import { DEFAULT_SIM_SRC, loadTree } from "./tree.ts";

const USAGE = `perf grid — sim-core throughput vs board size × arrival rate

Usage:
  grid [flags]
    --arms a[,b]        advance | digest | advance,digest (default advance,digest)
    --nodes 2,10,50,200 board sizes (idle-padded path boards; default audit grid)
    --rates 6,50,200    arrivals/min plateau (default audit grid)
    --ticks N           override per-cell ticks (default: auto by size — see README)
    --reps N            best-of-N per cell (default 3; use 1 for a quick look)
    --only n2@6,n50@50  run ONLY these cells (label = n<nodes>@<rate>)
    --sim-root PATH     sim-core src root (default: this checkout's packages/sim-core/src)
    --json PATH|'-'     machine-readable results (file or stdout)
    --dry-run           print the planned cell census as JSON and exit (no benches)

Best-of-N + median only — this box and CI runners are shared. See README.`;

type Arm = "advance" | "digest";

interface PlannedCell {
  readonly label: string;
  readonly arm: Arm;
  readonly nodes: number;
  readonly rate: number;
  readonly ticks: number;
}

interface CellReport extends PlannedCell {
  readonly reps: number;
  readonly bestTps: number;
  readonly medianTps: number;
  readonly samplesTps: readonly number[];
  readonly wallMs: readonly number[];
  readonly unitsLast: number;
  readonly nodesLast: number;
  readonly observedLast: number;
  readonly digestHex: string;
  readonly finalQueue: number;
  readonly finalDuplicates: number;
  readonly maxDuplicates: number;
  readonly segments: readonly SegmentRow[] | null;
}

interface GridReport {
  readonly tool: "perf-grid";
  readonly dry_run?: true;
  readonly meta: EnvMeta;
  readonly simSrcRoot: string;
  readonly reps: number;
  readonly plannedCells: readonly PlannedCell[];
  readonly cells?: readonly CellReport[];
}

function planCells(nodes: readonly number[], rates: readonly number[], arms: readonly Arm[], ticksOverride: number | null, only: readonly string[] | null): PlannedCell[] {
  const cells: PlannedCell[] = [];
  for (const arm of arms) {
    for (const n of nodes) {
      for (const rate of rates) {
        const label = `n${String(n)}@${String(rate)}`;
        if (only !== null && !only.includes(label)) continue;
        cells.push({ label, arm, nodes: n, rate, ticks: ticksOverride ?? defaultTicks(n) });
      }
    }
  }
  return cells;
}

function parseArms(raw: string | undefined): Arm[] {
  if (raw === undefined) return ["advance", "digest"];
  const parts = raw.split(",").map((p) => p.trim()).filter((p) => p.length > 0);
  if (parts.length === 0) throw new UsageError('--arms needs at least one of "advance","digest"');
  return parts.map((p) => parseEnum(p, ["advance", "digest"] as const, "arms"));
}

function toCellReport(cell: PlannedCell, reps: number, results: readonly BenchResult[]): CellReport {
  const best = results.reduce((a, b) => (b.tps > a.tps ? b : a), results[0] as BenchResult);
  return {
    ...cell,
    reps,
    bestTps: Math.round(best.tps),
    medianTps: Math.round(statsOf(results.map((r) => r.tps)).medianMs),
    samplesTps: results.map((r) => Math.round(r.tps)),
    wallMs: results.map((r) => Math.round(r.ms)),
    unitsLast: best.unitsLast,
    nodesLast: best.nodesLast,
    observedLast: best.observedLast,
    digestHex: best.digestHex,
    finalQueue: best.finalQueue,
    finalDuplicates: best.finalDuplicates,
    maxDuplicates: best.maxDuplicates,
    segments: best.segments,
  };
}

export async function main(argv: readonly string[]): Promise<number> {
  const { flags } = parseFlags(argv);
  if (flags.has("help")) {
    process.stdout.write(`${USAGE}\n`);
    return 0;
  }
  const arms = parseArms(flags.get("arms"));
  const nodes = flags.get("nodes") === undefined ? [...GRID_NODES] : parsePositiveIntList(flags.get("nodes") as string, "nodes");
  const rates = flags.get("rates") === undefined ? [...GRID_RATES] : parsePositiveIntList(flags.get("rates") as string, "rates");
  const reps = parsePositiveInt(flags.get("reps") ?? "3", "reps");
  const ticksRaw = flags.get("ticks");
  const ticksOverride = ticksRaw === undefined ? null : parsePositiveInt(ticksRaw, "ticks");
  const onlyRaw = flags.get("only");
  const only = onlyRaw === undefined ? null : onlyRaw.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
  const simRoot = flags.get("sim-root") ?? DEFAULT_SIM_SRC;
  const jsonOut = flags.get("json");

  const planned = planCells(nodes, rates, arms, ticksOverride, only);
  if (planned.length === 0) throw new UsageError("grid is empty — --only matched no planned cell");

  if (flags.has("dry-run")) {
    const report: GridReport = { tool: "perf-grid", dry_run: true, meta: envMeta(), simSrcRoot: simRoot, reps, plannedCells: planned };
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    process.stdout.write(`dry-run: ${String(planned.length)} cell(s) planned, nothing executed\n`);
    return 0;
  }

  const tree = await loadTree(simRoot);
  warmup(tree, false);

  process.stdout.write(`grid sim-root=${tree.srcRoot} arms=${arms.join(",")} reps=${String(reps)} node=${process.version} load1=${envMeta().loadAvg1}\n`);
  const cells: CellReport[] = [];
  for (const cell of planned) {
    const spec: BenchSpec = { ...gridSpec(cell.nodes, cell.rate, cell.arm === "digest"), ticks: cell.ticks };
    const results: BenchResult[] = [];
    for (let rep = 0; rep < reps; rep += 1) results.push(runBench(tree, spec));
    const report = toCellReport(cell, reps, results);
    cells.push(report);
    process.stdout.write(
      `${report.label.padEnd(9)} [${report.arm.padEnd(7)}] nodes=${String(report.nodes).padStart(3)} rate=${String(report.rate).padStart(3)}/min ticks=${String(report.ticks)} best-of-${String(reps)} → ${String(report.bestTps).padStart(6)} t/s (median ${String(report.medianTps).padStart(6)} ` +
        `roster=${report.unitsLast} q=${report.finalQueue} dup=${report.finalDuplicates}${report.digestHex.length > 0 ? ` digest=${report.digestHex}` : ""})\n`,
    );
    if (report.segments !== null && report.segments.length > 0) {
      for (const s of report.segments.slice(0, 8)) {
        process.stdout.write(`    segment ${s.usPerTick.toFixed(1).padStart(8)} µs/tick  ${s.name} (n=${String(s.n)})\n`);
      }
    }
  }

  const full: GridReport = { tool: "perf-grid", meta: envMeta(), simSrcRoot: tree.srcRoot, reps, plannedCells: planned, cells };
  const summary: Record<string, number> = {};
  for (const c of cells) summary[`${c.arm}:${c.label}`] = c.bestTps;
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
