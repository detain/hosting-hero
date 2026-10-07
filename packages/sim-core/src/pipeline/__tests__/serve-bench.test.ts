/**
 * FIX-8 era throughput witness (perf rec#1/#2/#3).
 *
 * The ghost-era congested bench ran at ~33–53 t/s because every waiter
 * re-appended a duplicate of itself each tick (O(waiter×ticks) queues). The
 * dedup fix measured ~1,000+ t/s on the same board; rec#2 (serve
 * unchanged-node copy-on-write reuse) and rec#3 (economics publish-on-change)
 * add the board-churn savings visible on the 200-node grids.
 *
 * This file does NOT gate on absolute t/s — CI boxes vary. Instead:
 *  1. a machine-speed calibration loop runs in the same test, and the floor
 *     scales with it (contention-adaptive);
 *  2. the floor itself is set at 5× the GHOST-era rate, so the test is red on
 *     the pre-fix behaviour and has ~7× headroom over the fixed behaviour;
 *  3. the digest pins below vendor the wave-9 audit's fixed-code literals
 *     (fresh-run-vs-PINNED-digest) — a fresh-vs-fresh pair alone would only
 *     prove determinism, never that rec#2/rec#3 left observable state
 *     untouched.
 */

import { describe, expect, it } from "vitest";
import type { GameState, NodeRecord, QosClassDef } from "../../types";
import { asEntityId, asRunSeed, observedKey } from "../../types";
import { FIXED_ONE, FIXED_ZERO, fromInt, fromRatio } from "../../kernel/fixed";
import { streamFor } from "../../kernel/rng";
import { createInitialState } from "../driver";
import type { TickInputs } from "../driver";
import type { DefaultPipelineConfig } from "../defaults";
import { createDefaultSlots, createTickDriver, digestState } from "../index";
import { utilization } from "../queue";
import { DEFAULT_CLASSES, MIN, freshClocks, node, testConfig } from "./helpers";

/** Ghost-era congested throughput (t/s) on the authoring machine, from the
 *  rec#6 A/B (33.4 t/s worst; 53 t/s this board shape) — the floor is 5× it. */
const GHOST_ERAS_TPS = 33.4;
/** Calibration-loop time (ms) on the authoring machine at rest. */
const CALIBRATION_BASE_MS = 45;

/** Deterministic bigint ladder — a machine-speed probe (same shape every
 *  run; ~40 ms on the authoring box). */
function calibrationMs(): number {
  const start = Date.now();
  let a = 1n;
  let b = 1n;
  for (let i = 0; i < 400_000; i += 1) {
    const next = (a + b) % 0xdeadbeefcafebaben;
    a = b;
    b = next;
  }
  return Math.max(1, Date.now() - start);
}

/** Contention-adaptive floor: if the box (or CI neighbour) is N× slower on
 *  pure CPU, the throughput floor shrinks by the same N (clamped so a wild
 *  calibration outlier cannot make the gate meaningless). */
function adaptiveFloorTps(calMs: number): number {
  const scale = Math.min(1, Math.max(0.2, CALIBRATION_BASE_MS / calMs));
  return GHOST_ERAS_TPS * 5 * scale;
}

interface BenchReport {
  readonly tps: number;
  readonly entries: number;
  readonly dups: number;
  readonly digest: string;
}

/** One-slot-per-node two-hop board with an eternal-patience backlog — the
 *  canonical ghost generator (every waiter survives many ticks queued). */
function runCongested(ticks: number): BenchReport {
  const config = testConfig({
    expressPath: Object.freeze([asEntityId("edge"), asEntityId("origin")]),
    deepPath: Object.freeze([asEntityId("edge"), asEntityId("origin")]),
    defaultPatienceUs: 1_000_000n * MIN, // never bounce: pure waiters
  });
  const driver = createTickDriver(
    createDefaultSlots(config),
    streamFor(config.runSeed, "root", 0),
    freshClocks(),
  );
  const game0 = initialState([node(asEntityId("edge"), { slots: 1 }), node(asEntityId("origin"), { slots: 1 })]);
  const envelopes = Object.freeze([
    Object.freeze({
      tableId: "bench:congested",
      role: "baseline" as const,
      shape: "plateau" as const,
      ratePerMin: fromInt(2),
      telegraphed: false,
      dominantFamily: "organic" as const,
    }),
  ]);
  const inputs: TickInputs = Object.freeze({ ...snapshotOf, envelopes });
  const start = Date.now();
  let game: GameState = game0;
  for (let t = 0; t < ticks; t += 1) game = driver.advance(game, inputs).state;
  const ms = Math.max(1, Date.now() - start);
  let entries = 0;
  let dups = 0;
  for (const record of game.nodes.values()) {
    entries += record.queue.length;
    dups += record.queue.length - new Set(record.queue).size;
  }
  return { tps: (ticks / ms) * 1000, entries, dups, digest: digestState(game) };
}

/** n200 grid: 2 busy path nodes + 198 idle nodes — rec#2/#3's churn target. */
function runGrid(ticks: number, ratePerMin: number): BenchReport {
  const config = testConfig({
    expressPath: Object.freeze([asEntityId("edge"), asEntityId("origin")]),
    deepPath: Object.freeze([asEntityId("edge"), asEntityId("origin")]),
  });
  const driver = createTickDriver(
    createDefaultSlots(config),
    streamFor(config.runSeed, "root", 0),
    freshClocks(),
  );
  const nodes = [
    node(asEntityId("edge"), { slots: 64, serviceUs: 10n * 1000n * 1000n }),
    node(asEntityId("origin"), { slots: 64, serviceUs: 20n * 1000n * 1000n, depth: "inspect" }),
  ];
  for (let i = 2; i < 200; i += 1) {
    nodes.push(node(asEntityId(`idle-${String(i).padStart(4, "0")}`), { slots: 2 }));
  }
  const game0 = initialState(nodes);
  const envelopes = Object.freeze([
    Object.freeze({
      tableId: "bench:grid",
      role: "baseline" as const,
      shape: "plateau" as const,
      ratePerMin: fromInt(ratePerMin),
      telegraphed: false,
      dominantFamily: "organic" as const,
    }),
  ]);
  const inputs: TickInputs = Object.freeze({ ...snapshotOf, envelopes });
  const start = Date.now();
  let game: GameState = game0;
  for (let t = 0; t < ticks; t += 1) game = driver.advance(game, inputs).state;
  const ms = Math.max(1, Date.now() - start);
  return { tps: (ticks / ms) * 1000, entries: 0, dups: 0, digest: digestState(game) };
}

function initialState(nodes: readonly NodeRecord[]): GameState {
  return createInitialState({
    runSeed: asRunSeed(42n),
    engineVersion: "serve-bench",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "b8", ruleBookHash: "" },
    clocks: freshClocks(),
    nodes,
  });
}

/** Static (traffic-independent) tick inputs shared by both benches. */
const snapshotOf: Omit<TickInputs, "envelopes"> = Object.freeze({
  evidence: Object.freeze([]),
  classes: DEFAULT_CLASSES,
  dependencyEdges: Object.freeze([]),
  retryPolicy: Object.freeze({ maxRetries: 0, backoffBaseUs: 0n, jitterPurchased: false }),
  aggression: fromRatio(3n, 10n),
  expressMaxConfidence: fromRatio(5n, 10n),
});

describe("serve throughput floor (FIX-8 dedup + rec#2/#3 churn savings)", () => {
  it(
    "congested backlog runs ≥5× the ghost-era rate (contention-adaptive)",
    () => {
      const cal = calibrationMs();
      const floor = adaptiveFloorTps(cal);
      const bench = runCongested(300);
      // Ghost hygiene first: the floor would be gameable by an empty board.
      expect(bench.entries).toBeGreaterThan(50); // real backlog present
      expect(bench.dups).toBe(0); // zero ghosts
      expect(bench.tps).toBeGreaterThan(floor);
    },
    120_000,
  );

  it(
    "n200 grid (traffic + idle) beats the same adaptive floor",
    () => {
      const cal = calibrationMs();
      const floor = adaptiveFloorTps(cal);
      const bench = runGrid(400, 6);
      expect(bench.tps).toBeGreaterThan(floor);
    },
    180_000,
  );
});

/* ───────────────── Vendored digest-neutrality proof (R7 F1/F2) ─────────────────
 * The runner below ports the 2026-10-07 FIX-8 audit harness
 * (/tmp/opencode/bench8/bench8.ts) shape-for-shape: seed 4242, the single
 * gold QoS class, the 10s/20s edge→origin pair (plus 198 idle 2-slot nodes
 * on the grid variants), the 5s three-retry backoff, and the plateau
 * envelopes the audit used. The three literals are that audit's expected
 * digests for the FIXED code (FIX-8 dedup + rec#2 serve COW + rec#3
 * publish-on-change):
 *
 *   congested 13a6ace754ff430872e4c081769a75f4   run(2, 2/min, never-bounce, 300 ticks)
 *   grid200   7e8a0aeb2edae5e84c61abc0c549d302   run(200, 6/min, 180s patience, 400 ticks)
 *   idle200   f7f548ef284afd23c8c7128e966655a6   run(200, 0/min, 180s patience, 400 ticks)
 *
 * Provenance: the audit's per-arm JSON reports no longer exist on disk, so
 * the literals were RE-DERIVED 2026-10-07 by running that very harness
 * against the shipped tree — congested and grid200 byte-matched the values
 * quoted in the FIX-8 commit body, and the idle200 literal recovered whole
 * from the same run (prefix f7f548ef284a per the wave-9 notes). The current
 * tree reproducing the pre-rec#5 "full"-arm digests is itself the proof that
 * rec#5's targeted purge is digest-neutral on the audited boards.
 *
 * This is a FRESH-RUN-VS-PINNED-DIGEST gate: fresh-vs-fresh agreement alone
 * proves determinism, never that a reuse/publish optimization left the
 * observable state untouched — only the vendored literal closes that gap.
 * If a number here moves, re-audit against the pre-change tree; never
 * casually re-pin.
 */
const AUDIT_SEED = asRunSeed(4242n);
const AUDIT_CLASSES: readonly QosClassDef[] = Object.freeze([
  Object.freeze({
    id: "gold",
    label: "gold",
    weight: fromInt(3),
    shedPriority: 3,
    budgetUs: 200_000n,
    inspectionDepth: "inspect" as const,
  }),
]);

interface AuditRun {
  readonly digest: string;
  readonly state: GameState;
  readonly entries: number;
  readonly dups: number;
}

function runAuditBoard(
  nodeCount: number,
  ratePerMin: number,
  pathSlots: number,
  patienceUs: bigint,
  ticks: number,
): AuditRun {
  const config: DefaultPipelineConfig = Object.freeze({
    runSeed: AUDIT_SEED,
    dnsNodeId: null,
    expressPath: Object.freeze([asEntityId("edge"), asEntityId("origin")]),
    deepPath: Object.freeze([asEntityId("edge"), asEntityId("origin")]),
    defaultPatienceUs: patienceUs,
    defaultSizeCost: FIXED_ONE,
    patienceJitterPct: 0,
    inspectionCostUs: Object.freeze({
      "pass-through": 0n,
      "sample-1-in-20": 50_000n,
      inspect: 50_000n,
      challenge: 100_000n,
    }),
    detectionRatio: fromRatio(9n, 10n),
    falsePositiveRatio: fromRatio(10n, 100n),
    referralProbability: FIXED_ZERO,
    returnProbability: FIXED_ZERO,
  });
  const nodes = [
    node(asEntityId("edge"), { slots: pathSlots, serviceUs: 10_000_000n }),
    node(asEntityId("origin"), { slots: pathSlots, serviceUs: 20_000_000n, depth: "inspect" }),
  ];
  for (let i = 2; i < nodeCount; i += 1) {
    nodes.push(node(asEntityId(`idle-${String(i).padStart(4, "0")}`), { slots: 2, serviceUs: 30_000_000n }));
  }
  const driver = createTickDriver(
    createDefaultSlots(config),
    streamFor(AUDIT_SEED, "root", 0),
    freshClocks(),
  );
  let game: GameState = createInitialState({
    runSeed: AUDIT_SEED,
    engineVersion: "bench8",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "b8", ruleBookHash: "" },
    clocks: freshClocks(),
    nodes,
  });
  const inputs: TickInputs = Object.freeze({
    envelopes: Object.freeze([
      Object.freeze({
        tableId: "bench:baseline",
        role: "baseline" as const,
        shape: "plateau" as const,
        ratePerMin: fromInt(ratePerMin),
        telegraphed: false,
        dominantFamily: "organic" as const,
      }),
    ]),
    evidence: Object.freeze([]),
    classes: AUDIT_CLASSES,
    dependencyEdges: Object.freeze([]),
    retryPolicy: Object.freeze({ maxRetries: 3, backoffBaseUs: 5_000_000n, jitterPurchased: true }),
    aggression: fromRatio(3n, 10n),
    expressMaxConfidence: fromRatio(5n, 10n),
  });
  for (let t = 0; t < ticks; t += 1) game = driver.advance(game, inputs).state;
  let entries = 0;
  let dups = 0;
  for (const record of game.nodes.values()) {
    entries += record.queue.length;
    dups += record.queue.length - new Set(record.queue).size;
  }
  return { digest: digestState(game), state: game, entries, dups };
}

/**
 * R7-F2 — what rec#2's reuse branch guarantees per node: the queueDepth stamp
 * mirrors the queue array's length, the ρ stamp mirrors `utilization()` (the
 * step re-verifies BOTH before handing back an unchanged record), and the
 * observed cells the HUD reads via rec#3's publish-on-change channel carry
 * exactly those honest numbers. Replaces the old vacuous "differs from tick
 * 1 / tps > 0" idle-board check.
 */
function assertNodeStampsAndCells(state: GameState): void {
  expect(state.nodes.size).toBe(200);
  for (const record of state.nodes.values()) {
    expect(record.queueDepth, `queueDepth stamp on ${record.id}`).toBe(record.queue.length);
    expect(record.utilizationRho, `rho stamp on ${record.id}`).toBe(utilization(record));
    const depthCell = state.observed.get(observedKey(record.id, "queueDepth"));
    expect(depthCell, `queueDepth cell on ${record.id}`).toBeDefined();
    expect(depthCell?.value, `queueDepth cell value on ${record.id}`).toBe(record.queue.length);
    const rhoCell = state.observed.get(observedKey(record.id, "utilizationRho"));
    expect(rhoCell, `rho cell on ${record.id}`).toBeDefined();
    expect(rhoCell?.value, `rho cell value on ${record.id}`).toBe(utilization(record));
  }
}

describe("copy-on-write reuse is digest-invisible (fresh-run-vs-pinned-digest)", () => {
  it("fresh congested audit run lands on the vendored fixed-code digest", () => {
    const run = runAuditBoard(2, 2, 1, 10_000_000_000_000n, 300);
    expect(run.entries).toBe(300); // the audit's real never-bounce backlog
    expect(run.dups).toBe(0); // FIX-8 dedup holds on the audit board too
    expect(run.digest).toBe("13a6ace754ff430872e4c081769a75f4");
  });

  it("fresh grid200 audit run lands on the vendored fixed-code digest", () => {
    const run = runAuditBoard(200, 6, 64, 180_000_000n, 400);
    expect(run.entries).toBe(0); // queue-free board — the audit's zero-ghost witness
    expect(run.digest).toBe("7e8a0aeb2edae5e84c61abc0c549d302");
    assertNodeStampsAndCells(run.state);
  });

  it("fresh idle200 audit run lands on the vendored fixed-code digest", () => {
    const run = runAuditBoard(200, 0, 64, 180_000_000n, 400);
    expect(run.digest).toBe("f7f548ef284afd23c8c7128e966655a6");
    assertNodeStampsAndCells(run.state); // pure identity-reuse board: stamps stay honest
  });
});
