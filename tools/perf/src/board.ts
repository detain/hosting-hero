/** The bench board: one canonical scenario shape, tree-parameterized so the
 *  identical workload can run against any loaded SimTree (grid arms, A/B pair,
 *  profiling children). Ported from the 2026-10-07 audit harness
 *  (p1-scale.ts / p6-grid.ts / p6-ab.ts).
 *
 *  Board model: two routable path nodes (edge→origin) padded with IDLE nodes
 *  to the size point — serve / purgeTerminals / sortedIds walk EVERY node each
 *  tick, so idle padding is precisely what a "200-node board" costs a ticker.
 *  Arrival load is a constant plateau envelope at ratePerMin. */

import type { GameStateView, SimTree } from "./tree.ts";
import { hrMs } from "./timing.ts";

export interface BenchSpec {
  readonly label: string;
  readonly nodeCount: number;
  readonly ratePerMin: number;
  readonly pathSlots: number;
  readonly edgeServiceUs: bigint;
  readonly originServiceUs: bigint;
  readonly patienceUs: bigint;
  readonly ticks: number;
  /** true = call digestState every tick (what the real host loop pays:
   *  unattended fastForward / proto runner / replay harness). */
  readonly digestPerTick: boolean;
}

export interface SegmentRow {
  readonly name: string;
  readonly usPerTick: number;
  readonly n: number;
}

export interface BenchResult {
  readonly tps: number;
  readonly ms: number;
  readonly unitsLast: number;
  readonly nodesLast: number;
  readonly observedLast: number;
  readonly digestHex: string;
  readonly finalQueue: number;
  readonly finalDuplicates: number;
  readonly maxDuplicates: number;
  /** Set only for instrumented scratch trees (README §Segment instrumentation). */
  readonly segments: readonly SegmentRow[] | null;
}

/* Default grid — the audit's 4 sizes × 3 rates. */
export const GRID_NODES = [2, 10, 50, 200] as const;
export const GRID_RATES = [6, 50, 200] as const;

/** Long cells on small boards, shorter cells once the board is huge — keeps a
 *  full default grid a few minutes, not an hour (audit convention). */
export function defaultTicks(nodeCount: number): number {
  return nodeCount >= 100 ? 1000 : 2000;
}

export function gridSpec(nodeCount: number, ratePerMin: number, digestPerTick: boolean): BenchSpec {
  return {
    label: `n${String(nodeCount)}@${String(ratePerMin)}`,
    nodeCount,
    ratePerMin,
    pathSlots: 64,
    edgeServiceUs: 10_000_000n,
    originServiceUs: 20_000_000n,
    patienceUs: 180_000_000n,
    ticks: defaultTicks(nodeCount),
    digestPerTick,
  };
}

/** Congested multi-waiter board: 1-slot path, hours-long service, patience
 *  beyond the run → a pure waiter backlog where queue-ghosts are guaranteed
 *  (the FIX-8 reproduction shape). */
export const CONGESTED_SPEC: BenchSpec = {
  label: "congested-n2@2",
  nodeCount: 2,
  ratePerMin: 2,
  pathSlots: 1,
  edgeServiceUs: 1_800_000_000n,
  originServiceUs: 3_600_000_000n,
  patienceUs: 10_000_000_000_000n,
  ticks: 300,
  digestPerTick: false,
};

export const AB_SCENARIOS: ReadonlyMap<string, (digest: boolean) => BenchSpec> = new Map<string, (digest: boolean) => BenchSpec>([
  ["congested", () => CONGESTED_SPEC],
  ["control-n2", (d: boolean) => gridSpec(2, 6, d)],
  ["control-n200", (d: boolean) => gridSpec(200, 6, d)],
]);

/* ─────────────────────────── world build ─────────────────────────── */

function node(t: SimTree, id: string, slots: number, serviceTimeUs: bigint, depth: "pass-through" | "inspect"): unknown {
  return Object.freeze({
    id: t.types.asEntityId(id),
    kind: "generic",
    slots: t.pipeline.makeSlots(slots),
    serviceTimeUs,
    queueDepth: 0,
    queue: Object.freeze([]),
    shedOrder: "qos-weighted" as const,
    inspectionDepth: depth,
    discipline: "hockey-stick" as const,
    utilizationRho: 0n,
    dependencyNodeId: null,
  });
}

export function buildCase(tree: SimTree, spec: BenchSpec, engineVersion: string) {
  const seed = tree.types.asRunSeed(7n);
  const nodes: unknown[] = [
    node(tree, "edge", spec.pathSlots, spec.edgeServiceUs, "pass-through"),
    node(tree, "origin", spec.pathSlots, spec.originServiceUs, "inspect"),
  ];
  for (let i = 2; i < spec.nodeCount; i += 1) {
    nodes.push(node(tree, `idle-${String(i).padStart(4, "0")}`, 2, 30_000_000n, "pass-through"));
  }
  const config = Object.freeze({
    runSeed: seed,
    dnsNodeId: null,
    expressPath: Object.freeze([tree.types.asEntityId("edge"), tree.types.asEntityId("origin")]),
    deepPath: Object.freeze([tree.types.asEntityId("edge"), tree.types.asEntityId("origin")]),
    defaultPatienceUs: spec.patienceUs,
    defaultSizeCost: tree.fixed.FIXED_ONE,
    patienceJitterPct: 0,
    inspectionCostUs: Object.freeze({ "pass-through": 0n, "sample-1-in-20": 50_000n, inspect: 50_000n, challenge: 100_000n }),
    detectionRatio: tree.fixed.fromRatio(9n, 10n),
    falsePositiveRatio: tree.fixed.fromRatio(10n, 100n),
    referralProbability: tree.fixed.FIXED_ZERO,
    returnProbability: tree.fixed.FIXED_ZERO,
  });
  const driver = tree.pipeline.createTickDriver(
    tree.pipeline.createDefaultSlots(config),
    tree.rng.streamFor(seed, "root", 0),
    tree.time.initialClocks(),
  );
  const game0 = tree.pipeline.createInitialState({
    runSeed: seed,
    engineVersion,
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "perf-tools", ruleBookHash: "" },
    clocks: tree.time.initialClocks(),
    nodes,
  });
  const envelopes = Object.freeze([
    Object.freeze({
      tableId: "perf:baseline",
      role: "baseline" as const,
      shape: "plateau" as const,
      ratePerMin: tree.fixed.fromInt(spec.ratePerMin),
      telegraphed: false,
      dominantFamily: "organic" as const,
    }),
  ]);
  const classes = Object.freeze([
    Object.freeze({
      id: "gold",
      label: "gold",
      weight: tree.fixed.fromInt(3),
      shedPriority: 3,
      budgetUs: 200_000n,
      inspectionDepth: "inspect" as const,
    }),
  ]);
  const inputs = () =>
    Object.freeze({
      envelopes,
      evidence: Object.freeze([]),
      classes,
      dependencyEdges: Object.freeze([]),
      retryPolicy: Object.freeze({ maxRetries: 3, backoffBaseUs: 5_000_000n, jitterPurchased: true }),
      aggression: tree.fixed.fromRatio(3n, 10n),
      expressMaxConfidence: tree.fixed.fromRatio(5n, 10n),
    });
  return { driver, game0, inputs };
}

/* ─────────────────────────── ghost census ─────────────────────────── */

interface QueueStats {
  queue: number;
  duplicates: number;
}

function queueStats(state: GameStateView): QueueStats {
  let queue = 0;
  let duplicates = 0;
  for (const n of state.nodes.values()) {
    queue += n.queue.length;
    duplicates += n.queue.length - new Set(n.queue).size;
  }
  return { queue, duplicates };
}

/* ─────────────────────────── run loop ─────────────────────────── */

export function runBench(tree: SimTree, spec: BenchSpec): BenchResult {
  const { driver, game0, inputs } = buildCase(tree, spec, "perf-tools");
  let game = game0 as GameStateView;
  let digestHex = "";
  let maxDuplicates = 0;
  const acc = accOf(tree);
  if (acc !== null) acc.clear(); // instrumented driver accumulates process-wide → isolate THIS run
  const s = process.hrtime.bigint();
  for (let t = 1; t <= spec.ticks; t += 1) {
    game = driver.advance(game, inputs()).state as GameStateView;
    if (spec.digestPerTick) digestHex = tree.pipeline.digestState(game);
    // ghost census every 20 ticks — Set sizing per tick would skew the bench
    if (t % 20 === 0) {
      const { duplicates } = queueStats(game);
      if (duplicates > maxDuplicates) maxDuplicates = duplicates;
    }
  }
  const ms = hrMs(s, process.hrtime.bigint());
  const { queue: finalQueue, duplicates: finalDuplicates } = queueStats(game);
  return {
    tps: spec.ticks / (ms / 1000),
    ms,
    unitsLast: game.units.size,
    nodesLast: game.nodes.size,
    observedLast: game.observed.size,
    digestHex,
    finalQueue,
    finalDuplicates,
    maxDuplicates,
    segments: acc === null ? null : segmentsFrom(acc, spec.ticks),
  };
}

/** Warm the JIT + shape caches for both board sizes before timing cells. */
export function warmup(tree: SimTree, digestPerTick: boolean): void {
  runBench(tree, { ...gridSpec(2, 6, digestPerTick), ticks: 100, label: "warm-small" });
  runBench(tree, { ...gridSpec(200, 6, digestPerTick), ticks: 100, label: "warm-large" });
}

/* ─────────────── instrumented-tree segment support (optional) ─────────────── */

type AccMap = Map<string, { ns: bigint; n: number }>;

function accOf(tree: SimTree): AccMap | null {
  const acc = (tree.pipeline as { ACC?: unknown }).ACC;
  return acc instanceof Map ? (acc as AccMap) : null;
}

function segmentsFrom(acc: AccMap, ticks: number): readonly SegmentRow[] {
  const rows: SegmentRow[] = [];
  for (const [name, e] of acc) rows.push({ name, usPerTick: Number(e.ns) / 1000 / ticks, n: e.n });
  rows.sort((a, b) => b.usPerTick - a.usPerTick);
  acc.clear();
  return rows;
}
