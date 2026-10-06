/**
 * GATE G1 — "the bounce loop" (hosting_game.md §9.13 gate #1).
 *
 * The game must communicate its central tension — defense vs friction — inside
 * 90 seconds of play. This headless slice proves the tension EXISTS in the
 * engine before any renderer draws it:
 *
 *  TRIAD MONOTONICITY (5 seeds, aggression slider swept 0→100):
 *    · block-rate        (adversarial neutralized at inspection)   rises,
 *    · legit-bounce       (benign users blocked false-positive)    rises,
 *    · false-positive cost (wasted challenge-lane compute µs)      rises,
 *    · benign served                                               falls —
 *  i.e. the "how paranoid can I afford to be" curve is real, seeded, and
 *  reproducible across every seed in the cohort.
 *
 *  THE DEFENSE TOGGLE is a genuine intent-door verb (configure-node,
 *  pass-through ⇄ challenge) — refusals never half-mutate, executions land.
 *
 *  SLIDER-SCHEDULE REPLAY ×100 byte-identical: the ramping-aggression run is
 *  captured through the replay harness and re-simmed one hundred times to a
 *  single canonical digest.
 *
 * Composition follows docs/API-REFERENCE.md §"How to build a gate slice" and
 * the interlock skeleton of ./integration-smoke.test.ts — barrel imports only,
 * mutables minted per simulate(), ObservedStore as the single observed writer,
 * everything frozen.
 */

import { describe, expect, it } from "vitest";
import {
  asCauseId,
  asEntityId,
  asMoney,
  asRunSeed,
  canonicalDigest,
  createDefaultSlots,
  createHarness,
  createInitialState,
  createTickDriver,
  clampUnit,
  defaultEconomyConfig,
  emptyEconomyState,
  FIXED_UNIT,
  FIXED_ZERO,
  fromInt,
  fromRatio,
  initialClocks,
  MICROS_PER_MIN,
  NEUTRAL_REVENUE_TAGS,
  observedKey,
  ObservedStore,
  PlayerVerb,
  registerContractEconomy,
  runEconomyTick,
  streamFor,
  sub,
  type Contract,
  type DirectorDraw,
  type EconomyState,
  type ExternalIntent,
  type GameState,
  type LaneStats,
  type NodeRecord,
  type ObservedCell,
  type QosClassDef,
  type ResolutionBand,
  type RetryPolicy,
  type RunSeed,
  type SimTick,
  type WaveEnvelope,
} from "../index.ts";

/* ═══════════════════════════ scenario authoring ═══════════════════════════ */

const GATE_ENGINE = "gate-g1";
const TOTAL_TICKS: SimTick = 20n;
const SNAPSHOT_EVERY: SimTick = 4n;
const CHECKPOINT_EVERY: SimTick = 2n;
const REPLAYS = 100;
const SWEEP_POINTS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;
const SEED_COHORT = [11n, 22n, 33n, 44n, 55n] as const;

const IDS = {
  waf: asEntityId("waf-1"),
  lane: asEntityId("lane/g1-ingress"),
} as const;

/** One sim-minute = one tick, so integer Fixed rates make unit ids
 *  (`${tableId}@${tick}#${e}.${i}`) fully known at authoring time — the
 *  gate needs no future-sight to attribute outcomes. */
const ORGANIC: WaveEnvelope = Object.freeze({
  tableId: "g1-organic",
  role: "baseline",
  shape: "plateau",
  ratePerMin: fromInt(8),
  telegraphed: true,
  dominantFamily: "organic",
});
const MALICIOUS: WaveEnvelope = Object.freeze({
  tableId: "g1-malicious",
  role: "spike",
  shape: "plateau",
  ratePerMin: fromInt(4),
  telegraphed: true,
  dominantFamily: "malicious",
});
const ENVELOPES: readonly WaveEnvelope[] = Object.freeze([ORGANIC, MALICIOUS]);

const CHALLENGE_FEE_US = 20n * 1_000_000n;

const PIPELINE_CONFIG = Object.freeze({
  dnsNodeId: null,
  expressPath: Object.freeze([IDS.waf]),
  deepPath: Object.freeze([IDS.waf]), // ONE lane, ONE node: no routing story here
  defaultPatienceUs: 4n * MICROS_PER_MIN,
  defaultSizeCost: fromInt(1),
  patienceJitterPct: 0,
  inspectionCostUs: Object.freeze({
    "pass-through": 0n,
    "sample-1-in-20": 3n * 1_000_000n,
    inspect: 10n * 1_000_000n,
    challenge: CHALLENGE_FEE_US,
  }),
  /** R-52: the slider moves THESE, never a damage number. A thick
   *  false-positiveRatio is the authored G1 posture — paranoia has a price. */
  detectionRatio: fromRatio(9n, 10n),
  falsePositiveRatio: fromRatio(15n, 100n),
  referralProbability: FIXED_ZERO,
  returnProbability: FIXED_ZERO,
});

const CLASSES: readonly QosClassDef[] = Object.freeze([
  Object.freeze({
    id: "gold",
    label: "Gold",
    weight: fromRatio(6n, 10n),
    shedPriority: 0,
    budgetUs: 5n * MICROS_PER_MIN,
    inspectionDepth: "inspect" as const,
  }),
  Object.freeze({
    id: "bronze",
    label: "Bronze",
    weight: FIXED_ZERO,
    shedPriority: 1,
    budgetUs: 30n * MICROS_PER_MIN,
    inspectionDepth: "pass-through" as const,
  }),
]);

const RETRY: RetryPolicy = Object.freeze({
  maxRetries: 2,
  backoffBaseUs: 2n * MICROS_PER_MIN,
  jitterPurchased: false,
});

const CONTRACT: Contract = Object.freeze({
  id: asEntityId("ctr-g1-gold"),
  customerEntityId: asEntityId("cust-g1"),
  bundleId: "shared-web",
  mrcMicroUsd: asMoney(5_000_000n),
  tcvMicroUsd: asMoney(60_000_000n),
  acvMicroUsd: asMoney(60_000_000n),
  termStartMin: 0,
  termEndMin: 43_200,
  billingCycle: "monthly" as const,
  sla: Object.freeze({
    uptimeTarget: fromRatio(999n, 1000n),
    responseBudgetUs: 3_600n * MICROS_PER_MIN,
    creditRate: fromRatio(5n, 100n),
    creditCap: fromRatio(25n, 100n),
    claimWindowUs: 30n * 24n * 3_600n * MICROS_PER_MIN,
    autoRenew: false,
    noticePeriodMin: 1_440,
    threeBreachExitRight: false,
  }),
  routingLocks: Object.freeze([]),
  shedImmunityClassId: "gold",
  allocations: Object.freeze([]),
});

function mkNode(depth: NodeRecord["inspectionDepth"]): NodeRecord {
  return Object.freeze({
    id: IDS.waf,
    kind: "generic",
    // 16 slots vs 12 arrivals/min keeps ρ far below the knee: the G1 curves
    // stay pure defense-attribution, not queue-noise artifacts.
    slots: Object.freeze(
      Array.from({ length: 16 }, () =>
        Object.freeze({ occupied: false, unitId: null, waitingOn: null, releasedAtUs: null }),
      ),
    ),
    serviceTimeUs: 6_000_000n,
    queueDepth: 0,
    queue: Object.freeze([]),
    shedOrder: "qos-weighted" as const,
    inspectionDepth: depth,
    discipline: "hockey-stick" as const,
    utilizationRho: 0n,
    dependencyNodeId: null,
  });
}

function exactCell(value: number | bigint): ObservedCell<unknown> {
  return Object.freeze({
    value,
    fidelity: 4 as ResolutionBand,
    freshnessUs: 0n,
    coverage: FIXED_UNIT,
    certainty: FIXED_UNIT,
    status: "live" as const,
  });
}

/* ═══════════════════════════ the triad ledger ═══════════════════════════ */

/** Defense attribution comes from the engine's OWN causeId ledger
 *  (§7.0): `defense:<node>:<unit>` neutralized, `false-positive:<node>:…`,
 *  `breach:…` landed, `served:…` benign served. */
interface G1Triad {
  readonly neutralized: number;
  readonly falsePositives: number;
  readonly threatsLanded: number;
  readonly benignServed: number;
  /** Wasted challenge-lane compute (µs) paid by every false positive. */
  readonly fpWasteUs: bigint;
  readonly doorExecuted: number;
  readonly doorRefused: number;
}

const ZERO_TRIAD: G1Triad = Object.freeze({
  neutralized: 0,
  falsePositives: 0,
  threatsLanded: 0,
  benignServed: 0,
  fpWasteUs: 0n,
  doorExecuted: 0,
  doorRefused: 0,
});

function attributeOutcome(triad: G1Triad, outcome: { terminal: string; causeId: string }): G1Triad {
  const cause = String(outcome.causeId);
  if (outcome.terminal === "bounced" && cause.startsWith("defense:")) {
    return { ...triad, neutralized: triad.neutralized + 1 };
  }
  if (outcome.terminal === "blocked-false-positive") {
    return {
      ...triad,
      falsePositives: triad.falsePositives + 1,
      fpWasteUs: triad.fpWasteUs + CHALLENGE_FEE_US,
    };
  }
  if (outcome.terminal === "landed") return { ...triad, threatsLanded: triad.threatsLanded + 1 };
  if (outcome.terminal === "served") return { ...triad, benignServed: triad.benignServed + 1 };
  return triad;
}

/* ═══════════════════════════ run composition ═══════════════════════════ */

interface RunState {
  readonly game: GameState;
  readonly econ: EconomyState;
  readonly observedDigest: string;
  readonly triad: G1Triad;
}

/** How the slider moves during one run: pinned constant, or the ramping
 *  schedule used by the ×100 replay proof. */
type SliderPolicy =
  | { readonly kind: "constant"; readonly percent: number }
  | { readonly kind: "schedule" };

function sliderPercent(policy: SliderPolicy, tick: SimTick): number {
  if (policy.kind === "constant") return policy.percent;
  return Math.min(Number(tick) * 10, 100); // 10 %/min ramp, capped at 100
}

/** The defense toggle, expressed as the ONE door verb G1 owns: flip waf-1
 *  pass-through ⇄ challenge at the authored tick. */
function toggleIntent(tick: SimTick, depth: "pass-through" | "challenge"): ExternalIntent {
  return Object.freeze({
    tick,
    intent: Object.freeze({
      seq: 1,
      clock: "sim" as const,
      atUs: tick * MICROS_PER_MIN,
      origin: "player" as const,
      payload: Object.freeze({
        kind: "player-verb" as const,
        args: Object.freeze({
          verb: PlayerVerb.ConfigureNode,
          nodeId: IDS.waf,
          inspectionDepth: depth,
          shedOrder: null,
        }),
      }),
    }),
  });
}

function gateLane(arrivals: number, triad: G1Triad): LaneStats {
  // stats-not-entities law: the renderer gets AGGREGATES only, derived here
  // from this tick's REAL driver output (arrival events + triad attribution).
  const benignDecisions = triad.benignServed + triad.falsePositives;
  const fpShare = benignDecisions === 0 ? FIXED_ZERO : fromRatio(BigInt(triad.falsePositives), BigInt(benignDecisions));
  return Object.freeze({
    laneId: IDS.lane,
    ratePerMin: fromInt(arrivals),
    latencyDistributionRef: "gate-g1/hist/express",
    classMix: Object.freeze({ gold: FIXED_ZERO, bronze: FIXED_UNIT }),
    health: clampUnit(sub(FIXED_UNIT, fpShare)),
  });
}

interface G1Scenario {
  readonly aggression: SliderPolicy;
  readonly startDepth: "pass-through" | "challenge";
  /** Door-flip schedule; each entry executes (or refuses) once, pre-step-1. */
  readonly toggles: ReadonlyArray<{ readonly tick: SimTick; readonly depth: "pass-through" | "challenge" }>;
}

function simulate(seed: RunSeed, initial: RunState, targetTick: SimTick, scenario: G1Scenario): RunState {
  const slots = createDefaultSlots(Object.freeze({ ...PIPELINE_CONFIG, runSeed: seed }));
  const driver = createTickDriver(slots, streamFor(seed, "root", 0), initial.game.context.clocks);
  const store = new ObservedStore();

  let game = initial.game;
  let econ = initial.econ;
  let triad = initial.triad;
  const cfg = defaultEconomyConfig();

  for (let t = 1; t <= Number(targetTick); t += 1) {
    const tick = BigInt(t);
    const externalIntents = scenario.toggles
      .filter((toggle) => toggle.tick === tick)
      .map((toggle) => toggleIntent(tick, toggle.depth));

    const result = driver.advance(game, Object.freeze({
      envelopes: ENVELOPES,
      evidence: Object.freeze([]),
      classes: CLASSES,
      dependencyEdges: Object.freeze([]),
      retryPolicy: RETRY,
      aggression: fromRatio(BigInt(sliderPercent(scenario.aggression, tick)), 100n),
      expressMaxConfidence: FIXED_UNIT, // single lane — the dial is inert in G1
      lanes: game.lanes,
      ...(externalIntents.length > 0 ? { externalIntents: Object.freeze(externalIntents) } : {}),
    }));

    for (const outcome of result.outcomes) triad = attributeOutcome(triad, outcome);
    for (const receipt of result.doorReceipts) {
      triad = receipt.outcome === "executed"
        ? { ...triad, doorExecuted: triad.doorExecuted + 1 }
        : { ...triad, doorRefused: triad.doorRefused + 1 };
    }
    let arrivalsThisTick = 0;
    for (const event of result.events) if (event.kind === "arrival") arrivalsThisTick += 1;

    game = Object.freeze({ ...result.state, lanes: Object.freeze(new Map([[IDS.lane, gateLane(arrivalsThisTick, triad)]])) });

    // Observed layer: cumulative TRIAD cells derived from real driver output.
    store.applyObservedWrites(
      Object.freeze([
        Object.freeze({ key: observedKey(IDS.waf, "defenseBlocks"), cell: exactCell(triad.neutralized), causeId: asCauseId(`g1:triad:${t}:blocks`) }),
        Object.freeze({ key: observedKey(IDS.waf, "falsePositives"), cell: exactCell(triad.falsePositives), causeId: asCauseId(`g1:triad:${t}:fps`) }),
        Object.freeze({ key: observedKey(IDS.waf, "threatsLanded"), cell: exactCell(triad.threatsLanded), causeId: asCauseId(`g1:triad:${t}:landed`) }),
        Object.freeze({ key: observedKey(IDS.waf, "benignServed"), cell: exactCell(triad.benignServed), causeId: asCauseId(`g1:triad:${t}:served`) }),
        Object.freeze({ key: observedKey(IDS.waf, "fpWasteUs"), cell: exactCell(triad.fpWasteUs), causeId: asCauseId(`g1:triad:${t}:waste`) }),
      ]),
      game.context.clocks.simUs,
    );
    const merged = new Map(game.observed);
    for (const [key, cell] of store.toObservedMap()) merged.set(key, cell);
    game = Object.freeze({ ...game, observed: Object.freeze(merged) });

    econ = runEconomyTick({ context: game.context, runSeed: seed, contracts: game.contracts, prior: econ, cfg }).state;
  }

  return Object.freeze({ game, econ, observedDigest: store.digest(), triad });
}

function initialState(seed: RunSeed = asRunSeed(11n), depth: "pass-through" | "challenge" = "challenge"): RunState {
  const game = createInitialState({
    runSeed: seed,
    engineVersion: GATE_ENGINE,
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "sha-g1-sheets", ruleBookHash: "sha-g1-book" },
    clocks: initialClocks(),
    nodes: [mkNode(depth)],
    lanes: [Object.freeze({ ...gateLane(0, ZERO_TRIAD) })],
    contracts: [CONTRACT],
    // The door needs hands; G1 spends at most one verb per tick.
    handCapacity: 2,
  });
  const cfg = defaultEconomyConfig();
  const econ = registerContractEconomy(
    emptyEconomyState(),
    {
      contract: CONTRACT,
      atBusinessMin: 0,
      clauseRefs: [],
      grandfather: null,
      revenueTags: NEUTRAL_REVENUE_TAGS,
      commitmentBps: 10_000n,
    },
    cfg,
  );
  return Object.freeze({ game, econ, observedDigest: "", triad: ZERO_TRIAD });
}

const PARANOID_SCENARIO: G1Scenario = Object.freeze({
  aggression: Object.freeze({ kind: "constant", percent: 100 } as const),
  startDepth: "challenge" as const,
  toggles: Object.freeze([]),
});
const CALM_SCENARIO: G1Scenario = Object.freeze({
  aggression: Object.freeze({ kind: "constant", percent: 0 } as const),
  startDepth: "challenge" as const,
  toggles: Object.freeze([]),
});

function runSweepPoint(seedValue: bigint, percent: number): G1Triad {
  const seed = asRunSeed(seedValue);
  return simulate(seed, initialState(seed), TOTAL_TICKS, {
    aggression: { kind: "constant", percent },
    startDepth: "challenge",
    toggles: [],
  }).triad;
}

/** Malicious units still mid-hop when the window closes (ids embed the
 *  table, so the roster scan is exact, never estimated). */
function threatsInFlight(state: RunState): number {
  let open = 0;
  for (const unitId of state.game.units.keys()) {
    if (String(unitId).startsWith("g1-malicious@")) open += 1;
  }
  return open;
}

function aggregate(percent: number): G1Triad {
  return SEED_COHORT.map((seed) => runSweepPoint(seed, percent)).reduce(
    (acc, t) => ({
      neutralized: acc.neutralized + t.neutralized,
      falsePositives: acc.falsePositives + t.falsePositives,
      threatsLanded: acc.threatsLanded + t.threatsLanded,
      benignServed: acc.benignServed + t.benignServed,
      fpWasteUs: acc.fpWasteUs + t.fpWasteUs,
      doorExecuted: acc.doorExecuted,
      doorRefused: acc.doorRefused,
    }),
    ZERO_TRIAD,
  );
}

/* ═══════════════════════════ the gate ═══════════════════════════ */

const SWEEP = new Map<number, G1Triad>(SWEEP_POINTS.map((p) => [p, aggregate(p)]));

describe("gate G1 · the bounce loop: defense-vs-friction triangle is real", () => {
  it("paranoia ladder (5 seeds aggregated): block-rate, legit-bounce and FP cost rise together", () => {
    const curveBlocks = SWEEP_POINTS.map((p) => SWEEP.get(p)!.neutralized);
    const curveFps = SWEEP_POINTS.map((p) => SWEEP.get(p)!.falsePositives);
    const curveWaste = SWEEP_POINTS.map((p) => Number(SWEEP.get(p)!.fpWasteUs));
    const curveServed = SWEEP_POINTS.map((p) => SWEEP.get(p)!.benignServed);

    expect(curveBlocks).toEqual([...curveBlocks].sort((a, b) => a - b));
    expect(curveFps).toEqual([...curveFps].sort((a, b) => a - b));
    expect(curveWaste).toEqual([...curveWaste].sort((a, b) => a - b));

    // strict at the meaningful anchors — the triangle has slope, not noise.
    // noUncheckedIndexedAccess types curve[i] as `number | undefined`; every
    // curve is map-built over SWEEP_POINTS so these anchors exist by
    // construction — the lookup fails loud if that ever stops being true.
    const at = (curve: readonly number[], index: number): number => {
      const value = curve[index];
      if (value === undefined) throw new Error(`gate-g1: sweep anchor ${index} missing — SWEEP_POINTS shrank?`);
      return value;
    };
    expect(at(curveBlocks, 0)).toBe(0);
    expect(at(curveBlocks, 5)).toBeGreaterThan(at(curveBlocks, 0));
    expect(at(curveBlocks, 10)).toBeGreaterThan(at(curveBlocks, 5));
    expect(at(curveFps, 0)).toBe(0);
    expect(at(curveFps, 10)).toBeGreaterThan(at(curveFps, 0));
    expect(at(curveWaste, 10)).toBe(at(curveFps, 10) * Number(CHALLENGE_FEE_US));

    // the friction side: what paranoia costs paying customers
    expect(at(curveServed, 0)).toBeGreaterThan(at(curveServed, 10));
  });

  it("block-RATE (neutralized ÷ adversarial throughput) climbs 0 → paranoia", () => {
    const rate = (p: number): number => {
      const t = SWEEP.get(p)!;
      const throughput = t.neutralized + t.threatsLanded;
      return throughput === 0 ? 0 : t.neutralized / throughput;
    };
    const rates = SWEEP_POINTS.map(rate);
    expect(rates).toEqual([...rates].sort((a, b) => a - b));
    expect(rates[0]).toBe(0);
    expect(rates[10]).toBeGreaterThan(0.8);
  });

  it("every seed in the cohort independently shows the triangle (no seed-averaged illusion)", () => {
    for (const seedValue of SEED_COHORT) {
      const seed = asRunSeed(seedValue);
      const calm = simulate(seed, initialState(seed), TOTAL_TICKS, CALM_SCENARIO).triad;
      const paranoidRun = simulate(seed, initialState(seed), TOTAL_TICKS, PARANOID_SCENARIO);
      expect(calm.neutralized).toBe(0);
      expect(calm.falsePositives).toBe(0);
      expect(paranoidRun.triad.neutralized).toBeGreaterThan(0);
      expect(paranoidRun.triad.falsePositives).toBeGreaterThan(0);
      // adversarial conservation: never retried — every threat either
      // terminates or is provably still mid-hop when the window closes
      expect(paranoidRun.triad.neutralized + paranoidRun.triad.threatsLanded + threatsInFlight(paranoidRun)).toBe(
        4 * Number(TOTAL_TICKS),
      );
    }
  });

  it("defense OFF is total exposure, defense ON is a priced trade", () => {
    const seed = asRunSeed(11n);
    const undefendedRun = simulate(seed, initialState(seed, "pass-through"), TOTAL_TICKS, {
      aggression: { kind: "constant", percent: 100 },
      startDepth: "pass-through",
      toggles: [],
    });
    expect(undefendedRun.triad.neutralized).toBe(0);
    expect(undefendedRun.triad.falsePositives).toBe(0);
    // everything that finishes GETS IN (no defense attribution at all)
    expect(
      undefendedRun.triad.threatsLanded + threatsInFlight(undefendedRun),
    ).toBe(4 * Number(TOTAL_TICKS));

    // defended cohort conservation: neutralized + landed + in-flight = spawned
    const defended = SEED_COHORT.reduce((sum, s) => {
      const run = simulate(asRunSeed(s), initialState(asRunSeed(s)), TOTAL_TICKS, PARANOID_SCENARIO);
      return sum + run.triad.neutralized + run.triad.threatsLanded + threatsInFlight(run);
    }, 0);
    expect(defended).toBe(SEED_COHORT.length * 4 * Number(TOTAL_TICKS));
  });

  it("the defense toggle travels the INTENT DOOR: refused never, executed exactly once", () => {
    const seed = asRunSeed(11n);
    const run = simulate(seed, initialState(seed, "pass-through"), TOTAL_TICKS, {
      aggression: { kind: "constant", percent: 100 },
      startDepth: "pass-through",
      toggles: [Object.freeze({ tick: 8n, depth: "challenge" as const })],
    });
    expect(run.triad.doorExecuted).toBe(1);
    expect(run.triad.doorRefused).toBe(0);

    // defense truly OFF before the toggle: split the identical scenario at tick 8
    const before = simulate(seed, initialState(seed, "pass-through"), 8n, {
      aggression: { kind: "constant", percent: 100 },
      startDepth: "pass-through",
      toggles: [],
    }).triad;
    expect(before.neutralized).toBe(0);
    expect(before.falsePositives).toBe(0);
    // …and ON after it, inside the same 20-tick run
    expect(run.triad.neutralized).toBeGreaterThan(0);
    expect(run.triad.falsePositives).toBeGreaterThan(0);
  });

  it(`slider-schedule replay ×${REPLAYS}: the ramping-aggression run is byte-identical`, () => {
    const seed = asRunSeed(77n);
    const scheduleScenario: G1Scenario = Object.freeze({
      aggression: { kind: "schedule" as const },
      startDepth: "pass-through",
      toggles: Object.freeze([Object.freeze({ tick: 5n, depth: "challenge" as const })]),
    });
    const reference = simulate(seed, initialState(seed, "pass-through"), TOTAL_TICKS, scheduleScenario);
    expect(reference.triad.doorExecuted).toBe(1);

    const runner = (request: {
      readonly initialState: RunState;
      readonly runSeed: RunSeed;
      readonly targetTick: SimTick;
      readonly intentsUpToTick: readonly unknown[];
    }): RunState => simulate(request.runSeed, request.initialState, request.targetTick, scheduleScenario);

    const harnessOptions = {
      runner,
      initialState: initialState(seed, "pass-through"),
      runSeed: seed,
      engineVersion: GATE_ENGINE,
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "sha-g1-sheets", ruleBookHash: "sha-g1-book" },
      totalTicks: TOTAL_TICKS,
      snapshotEveryTicks: SNAPSHOT_EVERY,
      checkpointEveryTicks: CHECKPOINT_EVERY,
      directorDraws: [] as readonly DirectorDraw[],
    };
    const harness = createHarness(harnessOptions);
    const verdict = harness.verify();
    expect(verdict.ok).toBe(true);
    expect(verdict.failures).toHaveLength(0);

    const digests = new Set<string>(harness.replayDigests(REPLAYS));
    expect(digests.size).toBe(1);
    const [only] = [...digests];
    expect(only).toBe(canonicalDigest(reference));
    // fresh-closure second harness agrees byte-for-byte
    expect(
      createHarness({ ...harnessOptions, initialState: initialState(seed, "pass-through") }).replayFinalDigest(),
    ).toBe(only);
    // …and a different seed diverges (the schedule really rides the seed)
    const otherSeed = asRunSeed(78n);
    expect(canonicalDigest(simulate(otherSeed, initialState(otherSeed, "pass-through"), TOTAL_TICKS, scheduleScenario)))
      .not.toBe(only);
  });
});

