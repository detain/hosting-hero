/**
 * rec#5 · targeted purge (perf lane).
 *
 * The driver now indexes queue/slot membership from the serve step's own
 * output channels (assignments / waiting / shed) and, at terminal time,
 * walks ONLY the attributed nodes instead of sweeping the full board. The
 * full sweep survives as a LOUD, counted fallback: probe overflow, an
 * attribution contradiction, or `purgeProbeCap: 0` (the pre-rec#5 behaviour).
 *
 * Digest law under test: for every state the step contract can produce, the
 * targeted purge is byte-identical to the sweep. This file proves it per
 * terminal path — patience bounce, hard-ceiling shed, inspection block
 * (benign FP), dependency hold release, plain completion, parked-zombie
 * reap, retry-storm re-entry, and a 200-node grid — by running twin drivers
 * (cap 0 vs default) over identical boards and diffing the per-tick
 * digestState chains. Any chain split means the index is wrong; the fix is
 * the index, never the pin.
 */

import { describe, expect, it } from "vitest";
import type { GameState, NodeRecord, PipelineSlots } from "../../types";
import { asEntityId, asRunSeed } from "../../types";
import { fromInt, fromRatio } from "../../kernel/fixed";
import { streamFor } from "../../kernel/rng";
import {
  createInitialState,
  createTickDriver,
  type TickDriver,
  type TickDriverOptions as DriverOptions,
  type TickInputs,
} from "../driver";
import { createDefaultSlots, digestState } from "../index";
import { utilization } from "../queue";
import type { DefaultPipelineConfig } from "../defaults";
import { IDS, MIN, SEC, freshClocks, node, retryPolicy, testConfig, tickInputs } from "./helpers";

/* ═══════════════════════════ run harness ═══════════════════════════ */

interface RunSpec {
  readonly config: DefaultPipelineConfig;
  readonly nodes: readonly NodeRecord[];
  readonly inputs: TickInputs;
  readonly ticks: number;
  readonly driverOptions?: DriverOptions;
  /** Step-set surgeon (foreign-step probes only). */
  readonly slots?: (base: PipelineSlots) => PipelineSlots;
  /** True = do NOT inject the test's min-nodes pin; exercise production gate. */
  readonly keepDefaultGate?: boolean;
}

interface RunReport {
  readonly chain: readonly string[];
  readonly final: GameState;
  readonly driver: TickDriver;
}

function runTicks(spec: RunSpec): RunReport {
  const slots = createDefaultSlots(spec.config);
  const wired = spec.slots === undefined ? slots : spec.slots(slots);
  const driver = createTickDriver(
    wired,
    streamFor(spec.config.runSeed, "root", 0),
    freshClocks(),
    // These tests are ABOUT the index; production boards default to the
    // small-board gate (>=8 nodes). Pin indexing on for tiny fixtures.
    spec.keepDefaultGate === true
      ? (spec.driverOptions ?? {})
      : { purgeTargetedMinNodes: 0, ...spec.driverOptions },
  );
  let state: GameState = createInitialState({
    runSeed: spec.config.runSeed,
    engineVersion: "purge-targeted",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "pt", ruleBookHash: "" },
    clocks: freshClocks(),
    nodes: spec.nodes,
  });
  const chain: string[] = [];
  for (let t = 0; t < spec.ticks; t += 1) {
    state = driver.advance(state, spec.inputs).state;
    chain.push(digestState(state));
  }
  return { chain, final: state, driver };
}

/** Twin witness: default (targeted) arm vs the pinned full-sweep arm. */
function expectTwinDigestsEqual(spec: Omit<RunSpec, "driverOptions">): RunReport {
  const targeted = runTicks({ ...spec, driverOptions: {} });
  const swept = runTicks({ ...spec, driverOptions: { purgeProbeCap: 0 } });
  expect(targeted.chain).toStrictEqual(swept.chain);
  return targeted;
}

const PLAIN_NODES = Object.freeze([
  node(IDS.edge, { slots: 1 }),
  node(IDS.origin, { slots: 2 }),
]);

/** Two saturated queues (edge 1/min + origin 10min, one slot each): every
 *  terminal tick's doomed set spans BOTH nodes, so the probe grows to 2 —
 *  the shape that exercises the overflow ladder at cap 1. */
const CONGESTED_NODES = Object.freeze([
  node(IDS.edge, { slots: 1 }),
  node(IDS.origin, { slots: 1, serviceUs: 10n * MIN }),
]);

function congestedConfig(overrides: Partial<DefaultPipelineConfig> = {}): DefaultPipelineConfig {
  return testConfig({
    // short patience: queue waiters bounce every tick → constant terminal fire
    defaultPatienceUs: MIN,
    ...overrides,
  });
}

function backlogInputs(ratePerMin: number): TickInputs {
  return tickInputs({
    envelopes: Object.freeze([
      Object.freeze({
        tableId: "purge:backlog",
        role: "baseline" as const,
        shape: "plateau" as const,
        ratePerMin: fromInt(ratePerMin),
        telegraphed: false,
        dominantFamily: "organic" as const,
      }),
    ]),
    // NO dependency edges here keeps hop geometry plain for path attribution
    dependencyEdges: Object.freeze([]),
  });
}

/* ═══════════════════ 1 · attribution index health ═══════════════════ */

describe("targeted purge — attribution index health (default steps)", () => {
  it("bounce-heavy run: targeted purges fire, zero fallbacks, bounded probe", () => {
    const run = runTicks({
      config: congestedConfig(),
      nodes: PLAIN_NODES,
      inputs: backlogInputs(6),
      ticks: 120,
    });
    const stats = run.driver.purgeStats();
    expect(stats.targetPurges).toBeGreaterThan(0); // terminals really fired
    expect(stats.overflowFallbacks).toBe(0);
    expect(stats.contradictionFallbacks).toBe(0);
    expect(stats.forcedFallbacks).toBe(0);
    expect(stats.maxProbeNodes).toBeLessThanOrEqual(8); // 2-node board: probe is tiny
    expect(stats.attributedUnits).toBeLessThanOrEqual(50); // index stays bounded
  });

  it("200-node grid: fallbacks stay silent while the purge walk shrinks", () => {
    const nodes = [
      node(IDS.edge, { slots: 64, serviceUs: 30n * SEC }),
      node(IDS.origin, { slots: 64, serviceUs: 60n * SEC }),
    ];
    for (let i = 2; i < 200; i += 1) {
      nodes.push(node(asEntityId(`idle-${String(i).padStart(4, "0")}`), { slots: 2 }));
    }
    const run = runTicks({
      config: congestedConfig({ defaultPatienceUs: 3n * MIN }),
      nodes,
      inputs: backlogInputs(6),
      ticks: 200,
    });
    const stats = run.driver.purgeStats();
    expect(stats.targetPurges).toBeGreaterThan(0);
    expect(stats.overflowFallbacks).toBe(0);
    expect(stats.contradictionFallbacks).toBe(0);
    expect(stats.forcedFallbacks).toBe(0);
    // busy nodes are 2 of 200: the probe must not be board-sized
    expect(stats.maxProbeNodes).toBeLessThanOrEqual(8);
  });
});

/* ═══════════════ 2 · byte-identity per terminal path (twins) ═══════════════ */

describe("targeted purge — digest chains byte-equal the full sweep", () => {
  it("patience bounces + completions (×3 seeds)", () => {
    for (const seed of [42n, 7n, 1337n]) {
      expectTwinDigestsEqual({
        config: congestedConfig({ runSeed: asRunSeed(seed) }),
        nodes: PLAIN_NODES,
        inputs: backlogInputs(6),
        ticks: 120,
      });
    }
  });

  it("hard-ceiling shed drains queues every tick", () => {
    const run = expectTwinDigestsEqual({
      config: congestedConfig({ defaultPatienceUs: 60n * MIN }), // shed only
      nodes: Object.freeze([
        node(IDS.edge, { slots: 1, discipline: "hard-ceiling" }),
        node(IDS.origin, { slots: 2 }),
      ]),
      inputs: backlogInputs(20),
      ticks: 60,
    });
    expect(run.driver.purgeStats().targetPurges).toBeGreaterThan(0);
  });

  it("inspection blocks (benign false positives at challenge depth)", () => {
    const run = expectTwinDigestsEqual({
      config: congestedConfig({
        defaultPatienceUs: 60n * MIN,
        falsePositiveRatio: fromRatio(5n, 10n), // half of inspected units block
      }),
      nodes: Object.freeze([
        node(IDS.edge, { slots: 1 }),
        node(IDS.origin, { slots: 2, depth: "challenge" }),
      ]),
      inputs: tickInputs({
        envelopes: Object.freeze([
          Object.freeze({
            tableId: "purge:inspect",
            role: "baseline" as const,
            shape: "plateau" as const,
            ratePerMin: fromInt(8),
            telegraphed: false,
            dominantFamily: "organic" as const,
          }),
        ]),
        dependencyEdges: Object.freeze([]),
        aggression: fromRatio(9n, 10n),
      }),
      ticks: 80,
    });
    expect(run.driver.purgeStats().targetPurges).toBeGreaterThan(0);
  });

  it("dependency holds occupy slots, re-emit, then release into completions", () => {
    const run = expectTwinDigestsEqual({
      config: congestedConfig({ defaultPatienceUs: 30n * MIN }),
      nodes: Object.freeze([
        node(IDS.edge, { slots: 1, serviceUs: 2n * MIN }),
        node(IDS.origin, { slots: 1, serviceUs: 1n * MIN, dep: IDS.edge }),
      ]),
      // tickInputs default edges: edge→origin and waf→edge (step-8 validated)
      inputs: tickInputs({
        envelopes: Object.freeze([
          Object.freeze({
            tableId: "purge:dep",
            role: "baseline" as const,
            shape: "plateau" as const,
            ratePerMin: fromInt(12),
            telegraphed: false,
            dominantFamily: "organic" as const,
          }),
        ]),
      }),
      ticks: 80,
    });
    expect(run.driver.purgeStats().targetPurges).toBeGreaterThan(0);
  });

  it("parked-zombie reap (never routed: probe empty, purge a no-op)", () => {
    // Identity route step: arrivals keep their empty routeHops (drafts mint
    // unrouted), so every unit parks — it can never queue, never touches a
    // slot. The idle-reap (FIX-7) still terminalizes it, exercising the
    // terminal-with-empty-probe arm of the targeted purge.
    const run = expectTwinDigestsEqual({
      config: congestedConfig(),
      nodes: PLAIN_NODES,
      inputs: backlogInputs(3),
      ticks: 40,
      slots: (base) =>
        Object.freeze({
          ...base,
          route: (input: Parameters<typeof base.route>[0]) =>
            Object.freeze({ units: input.units }),
        }),
    });
    expect(run.driver.purgeStats().targetPurges).toBeGreaterThan(0);
    expect(run.driver.purgeStats().attributedUnits).toBe(0); // nothing was ever indexed
  });

  it("retry-storm re-entries (fresh ids re-attribute cleanly)", () => {
    const run = expectTwinDigestsEqual({
      config: congestedConfig(),
      nodes: PLAIN_NODES,
      inputs: tickInputs({
        envelopes: Object.freeze([
          Object.freeze({
            tableId: "purge:storm",
            role: "baseline" as const,
            shape: "plateau" as const,
            ratePerMin: fromInt(8),
            telegraphed: false,
            dominantFamily: "organic" as const,
          }),
        ]),
        dependencyEdges: Object.freeze([]),
        retryPolicy: retryPolicy(3),
      }),
      ticks: 120,
    });
    expect(run.driver.purgeStats().targetPurges).toBeGreaterThan(0);
  });

  it("multi-hop path waf→edge→origin (attribution follows the unit)", () => {
    const run = expectTwinDigestsEqual({
      config: congestedConfig({
        // both arms of the ROC split ride the 3-hop chain: every unit walks
        // waf → edge → origin, so attribution must move node-to-node with it
        expressPath: Object.freeze([IDS.waf, IDS.edge, IDS.origin]),
        deepPath: Object.freeze([IDS.waf, IDS.edge, IDS.origin]),
        defaultPatienceUs: 2n * MIN,
      }),
      nodes: Object.freeze([
        node(IDS.waf, { slots: 1 }),
        node(IDS.edge, { slots: 1 }),
        node(IDS.origin, { slots: 1 }),
      ]),
      inputs: tickInputs({
        envelopes: Object.freeze([
          Object.freeze({
            tableId: "purge:deep",
            role: "baseline" as const,
            shape: "plateau" as const,
            ratePerMin: fromInt(5),
            telegraphed: false,
            dominantFamily: "organic" as const,
          }),
        ]),
        dependencyEdges: Object.freeze([]),
      }),
      ticks: 100,
    });
    expect(run.driver.purgeStats().targetPurges).toBeGreaterThan(0);
    expect(run.driver.purgeStats().maxProbeNodes).toBeLessThanOrEqual(3);
  });

  it("200-node grid twin (the rec#6 audit shape) — chains equal", () => {
    const nodes = [
      node(IDS.edge, { slots: 64, serviceUs: 30n * SEC }),
      node(IDS.origin, { slots: 64, serviceUs: 60n * SEC }),
    ];
    for (let i = 2; i < 200; i += 1) {
      nodes.push(node(asEntityId(`idle-${String(i).padStart(4, "0")}`), { slots: 2 }));
    }
    expectTwinDigestsEqual({
      config: congestedConfig({ defaultPatienceUs: 3n * MIN }),
      nodes,
      inputs: backlogInputs(6),
      ticks: 150,
    });
  });
});

/* ═══════════════════ 3 · fallback ladder is loud ═══════════════════ */

describe("targeted purge — fallback ladder", () => {
  it("purgeProbeCap 0 forces the sweep on every terminal tick (and is counted)", () => {
    const swept = runTicks({
      config: congestedConfig(),
      nodes: PLAIN_NODES,
      inputs: backlogInputs(6),
      ticks: 60,
      driverOptions: { purgeProbeCap: 0 },
    });
    const stats = swept.driver.purgeStats();
    expect(stats.forcedFallbacks).toBeGreaterThan(0);
    expect(stats.targetPurges).toBe(0);
  });

  it("probe overflow at cap 1: counted fallback, digests unchanged", () => {
    const overflowing = runTicks({
      config: congestedConfig(),
      nodes: CONGESTED_NODES, // both queues bounce every tick → probe spans 2
      inputs: backlogInputs(6),
      ticks: 120,
      driverOptions: { purgeProbeCap: 1 },
    });
    const swept = runTicks({
      config: congestedConfig(),
      nodes: CONGESTED_NODES,
      inputs: backlogInputs(6),
      ticks: 120,
      driverOptions: { purgeProbeCap: 0 },
    });
    expect(overflowing.driver.purgeStats().overflowFallbacks).toBeGreaterThan(0);
    expect(overflowing.chain).toStrictEqual(swept.chain);
  });

  it("phantom waiter (id in waiting, absent from roster) latches the contradiction fallback", () => {
    // The waiting-scan's `hop === undefined` guard is the simplest anomaly
    // arm: a serve step reporting a queue member the roster never minted.
    // Latched ticks take the counted sweep, so the chain stays byte-equal.
    const withPhantom = (base: PipelineSlots): PipelineSlots =>
      Object.freeze({
        ...base,
        serve: (input: Parameters<typeof base.serve>[0]) => {
          const out = base.serve(input);
          if (input.context.tick < 5) return out;
          return Object.freeze({
            ...out,
            waiting: Object.freeze([...out.waiting, asEntityId("phantom-waiter")]),
          });
        },
      });
    const spec = {
      config: congestedConfig(),
      nodes: PLAIN_NODES,
      inputs: backlogInputs(6),
      ticks: 40,
      slots: withPhantom,
    } satisfies RunSpec;
    const latched = runTicks({ ...spec, driverOptions: {} });
    const swept = runTicks({ ...spec, driverOptions: { purgeProbeCap: 0 } });
    expect(latched.driver.purgeStats().contradictionFallbacks).toBeGreaterThan(0);
    expect(latched.chain).toStrictEqual(swept.chain);
  });

  it("cross-node admission without release latches the contradiction fallback (digests survive)", () => {
    // The deep arm: a queue resident (attributed to its queue node) gets an
    // admission assignment for ANOTHER node without ever releasing the first
    // — precisely the "occupy while attributed elsewhere" shape the
    // attributeMembership occupy branch flags. Long patience keeps the queue
    // resident alive; the fabrication happens once, mid-run.
    const forgeAdmission = (base: PipelineSlots): PipelineSlots =>
      Object.freeze({
        ...base,
        serve: (input: Parameters<typeof base.serve>[0]) => {
          const out = base.serve(input);
          const resident = out.waiting[out.waiting.length - 1];
          if (input.context.tick !== 7n || resident === undefined) return out;
          const simNow = input.context.clocks.simUs;
          return Object.freeze({
            ...out,
            assignments: Object.freeze([
              ...out.assignments,
              Object.freeze({
                unitId: resident,
                nodeId: IDS.origin,
                slotIndex: 0,
                serviceStartUs: simNow,
                serviceEndUs: simNow + MIN,
                blocked: false,
              }),
            ]),
          });
        },
      });
    // Moderate-ρ board: edge has 4 slots for 6/min arrivals (queue residents
    // survive — a saturated 1-slot edge LUT-bounces every joiner instantly),
    // origin has 8 slots (every tick completes terminals → the latched tick
    // actually reaches a purge).
    const spec = {
      config: congestedConfig({ defaultPatienceUs: 60n * MIN }),
      nodes: Object.freeze([
        node(IDS.edge, { slots: 4, serviceUs: MIN }),
        node(IDS.origin, { slots: 8, serviceUs: MIN }),
      ]),
      inputs: backlogInputs(6),
      ticks: 40,
      slots: forgeAdmission,
    } satisfies RunSpec;
    const latched = runTicks({ ...spec, driverOptions: {} });
    const swept = runTicks({ ...spec, driverOptions: { purgeProbeCap: 0 } });
    expect(latched.driver.purgeStats().contradictionFallbacks).toBeGreaterThan(0);
    expect(latched.chain).toStrictEqual(swept.chain);
  });

  it("small-board gate (production default): sub-8-node boards never index", () => {
    // No purgeTargetedMinNodes override here: the DEFAULT gate must keep tiny
    // boards on the legacy sweep path — zero indexing, zero targeted purges,
    // and the digest chain still equals the pinned full-sweep arm.
    const spec = {
      config: congestedConfig(),
      nodes: PLAIN_NODES,
      inputs: backlogInputs(6),
      ticks: 60,
      keepDefaultGate: true,
    } satisfies Omit<RunSpec, "driverOptions">;
    const gated = runTicks(spec);
    const stats = gated.driver.purgeStats();
    expect(stats.smallBoardSweeps).toBeGreaterThan(0);
    expect(stats.targetPurges).toBe(0);
    expect(stats.attributedUnits).toBe(0);
    expect(stats.verifyRuns).toBe(0);
    const swept = runTicks({ ...spec, driverOptions: { purgeProbeCap: 0 } });
    expect(gated.chain).toStrictEqual(swept.chain);
  });

  it("verify cadence 1 rebuilds every tick and twin-digests the sweep arm", () => {
    const targeted = runTicks({
      config: congestedConfig(),
      nodes: PLAIN_NODES,
      inputs: backlogInputs(6),
      ticks: 40,
      driverOptions: { purgeVerifyTicks: 1 },
    });
    expect(targeted.driver.purgeStats().verifyRuns).toBe(40);
    expect(targeted.driver.purgeStats().contradictionFallbacks).toBe(0);
    expect(targeted.driver.purgeStats().targetPurges).toBeGreaterThan(0);
  });

  it("cold-boot roster arms one counted boot sweep, then targeted resumes", () => {
    // Run a board warm, then hand the mid-run state to a FRESH driver (the
    // checkpoint-resume shape): the new driver never saw the in-slot
    // occupants' occupy signals, so its first purge must be one boot sweep —
    // and every digest from the handover onward must still equal the
    // original run's chain.
    const spec = {
      config: congestedConfig(),
      nodes: PLAIN_NODES,
      inputs: backlogInputs(6),
      ticks: 40,
    } satisfies Omit<RunSpec, "driverOptions">;
    const original = runTicks({ ...spec, driverOptions: {} });
    const warm = runTicks({ ...spec, ticks: 12, driverOptions: {} });
    const resumed = createTickDriver(
      createDefaultSlots(spec.config),
      streamFor(spec.config.runSeed, "root", 0),
      freshClocks(),
      { purgeTargetedMinNodes: 0 },
    );
    resumed.importPending(warm.driver.exportPending(), warm.driver.currentMintCounter());
    let state = warm.final;
    const chain: string[] = [digestState(state)];
    for (let t = 12; t < spec.ticks; t += 1) {
      state = resumed.advance(state, spec.inputs).state;
      chain.push(digestState(state));
    }
    const stats = resumed.purgeStats();
    expect(stats.bootFallbacks).toBe(1); // exactly one counted boot sweep
    expect(stats.targetPurges).toBeGreaterThan(0); // then targeted resumes
    expect(chain).toStrictEqual(original.chain.slice(11));
  });

  it("invalid caps fail fast at construction", () => {
    const slots = createDefaultSlots(testConfig());
    const make = (cap: number): DriverOptions => ({ purgeProbeCap: cap });
    expect(() =>
      createTickDriver(slots, streamFor(asRunSeed(42n), "root", 0), freshClocks(), make(-1)),
    ).toThrow(/purgeProbeCap/);
    expect(() =>
      createTickDriver(slots, streamFor(asRunSeed(42n), "root", 0), freshClocks(), make(1.5)),
    ).toThrow(/purgeProbeCap/);
  });

  it("purgeStats snapshot is frozen", () => {
    const run = runTicks({
      config: congestedConfig(),
      nodes: PLAIN_NODES,
      inputs: backlogInputs(6),
      ticks: 20,
    });
    expect(Object.isFrozen(run.driver.purgeStats())).toBe(true);
  });
});

/* ═══════════════════ 4 · post-run node hygiene ═══════════════════ */

describe("targeted purge — node hygiene after heavy runs", () => {
  const hygieneBoards: readonly [string, RunSpec][] = [
    [
      "bounce+complete",
      { config: congestedConfig(), nodes: PLAIN_NODES, inputs: backlogInputs(6), ticks: 120 },
    ],
    [
      "shed",
      {
        config: congestedConfig({ defaultPatienceUs: 60n * MIN }),
        nodes: Object.freeze([
          node(IDS.edge, { slots: 1, discipline: "hard-ceiling" }),
          node(IDS.origin, { slots: 2 }),
        ]),
        inputs: backlogInputs(20),
        ticks: 60,
      },
    ],
    [
      "grid200",
      {
        config: congestedConfig({ defaultPatienceUs: 3n * MIN }),
        nodes: (() => {
          const nodes = [
            node(IDS.edge, { slots: 64, serviceUs: 30n * SEC }),
            node(IDS.origin, { slots: 64, serviceUs: 60n * SEC }),
          ];
          for (let i = 2; i < 200; i += 1) {
            nodes.push(node(asEntityId(`idle-${String(i).padStart(4, "0")}`), { slots: 2 }));
          }
          return nodes;
        })(),
        inputs: backlogInputs(6),
        ticks: 150,
      },
    ],
  ];

  for (const [label, spec] of hygieneBoards) {
    it(`${label}: no terminal ever lingers in a queue or slot`, () => {
      const run = runTicks({ ...spec, driverOptions: {} });
      const mid = runTicks({ ...spec, driverOptions: { purgeProbeCap: 1 } }); // overflow arm too
      for (const state of [run.final, mid.final]) {
        for (const nodeRecord of state.nodes.values()) {
          for (const unitId of nodeRecord.queue) {
            expect(state.units.has(unitId)).toBe(true); // queue honesty (FIX-8)
          }
          expect(nodeRecord.queueDepth).toBe(nodeRecord.queue.length);
          expect(nodeRecord.utilizationRho).toBe(utilization(nodeRecord));
          for (const slot of nodeRecord.slots) {
            if (slot.occupied && slot.unitId !== null) {
              expect(state.units.has(slot.unitId)).toBe(true);
            }
          }
        }
      }
    });
  }
});
