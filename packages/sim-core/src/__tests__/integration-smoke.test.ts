/**
 * INTEGRATION SMOKE — the seed of gate G1 (§9.13 "one quarter" plumbing):
 * the REAL modules interlock byte-deterministically when composed through
 * the public barrel surface ONLY (no deep imports, no test-private helpers).
 *
 * Composition per tick:
 *   waves.planWave            → WaveEnvelope fed to the arrival slot
 *   pipeline.createTickDriver → 13-slot deterministic tick (ground truth)
 *   observed.ObservedStore    → step-12 gate: cells derived from REAL driver
 *                               results, merged into GameState.observed
 *   policy.createRulePhaseStep→ slot 12.5 evaluates the merged observed map
 *                               (a card actually fires mid-run)
 *   economy.runEconomyTick    → primed contract ticked against business clock
 *   replay.createHarness      → capture ring + ×100 re-sim digest identity
 *
 * Purity law honored: every per-run mutable object (driver, store, rule
 * runtime, economy state chain) is minted INSIDE the SimRunner, so
 * same-request ⇒ same-answer holds by construction.
 */

import { describe, expect, it } from "vitest";
import {
  // types + kernel
  asCauseId,
  asEntityId,
  asMetricId,
  asMoney,
  asRuleId,
  asRunSeed,
  observedKey,
  MICROS_PER_MIN,
  FIXED_ZERO,
  fromInt,
  fromRatio,
  initialClocks,
  streamFor,
  // pipeline
  createDefaultSlots,
  createInitialState,
  createTickDriver,
  digestState,
  makeSlots,
  // policy
  createRulePhaseStep,
  // observed
  ObservedStore,
  // economy
  defaultEconomyConfig,
  emptyEconomyState,
  NEUTRAL_REVENUE_TAGS,
  registerContractEconomy,
  runEconomyTick,
  // waves
  buildInvitations,
  directorPropose,
  INITIAL_DIRECTOR_STATE,
  ledgerSnapshot,
  parseWaveTable,
  planWave,
  waveStream,
  // replay
  canonicalDigest,
  createHarness,
  type DirectorDraw,
  type Contract,
  type EconomyState,
  type GameState,
  type NodeRecord,
  type PolicyAction,
  type PolicyCard,
  type PolicyThreshold,
  type Predicate,
  type PressureParams,
  type QosClassDef,
  type RetryPolicy,
  type RunSeed,
  type SimTick,
  type ObservedCell,
  type ResolutionBand,
} from "../index.ts";

/* ═══════════════════════ scenario constants ═══════════════════════════ */

const SEED = asRunSeed(42n);
const TOTAL_TICKS: SimTick = 12n;
const SNAPSHOT_EVERY: SimTick = 4n;
const CHECKPOINT_EVERY: SimTick = 2n;
const REPLAYS = 100;

const IDS = {
  edge: asEntityId("edge"),
  origin: asEntityId("origin"),
  waf: asEntityId("waf"),
  web1: asEntityId("web-1"), // observed-layer subject entity (rule scope)
} as const;

/** Pressure override: the smoke wants ~6 units total in wave 1, not the
 *  PROVISIONAL sheet's 100-point opening budget. Legal per WavePlanInput. */
const SMOKE_PRESSURE: PressureParams = {
  baseMicro: 6n * 1_000_000n,
  growthNum: 223n,
  growthDen: 200n,
  sawtoothMicro: [1_000_000n],
};

const RAW_TABLE = {
  id: "g1-smoke",
  typeBundleId: "shared-web",
  tuningSheet: "B",
  unitsPerPressurePoint: 1,
  waves: [
    {
      n: 1,
      windowMinutes: 12,
      rampMin: 3,
      plateauMin: 3,
      decayMin: 2,
      parPct: 100,
      hard: false,
      entries: [
        {
          threatId: "smoke-swarm",
          role: "swarm",
          family: "malicious",
          band: "storm",
          sharePct: 100,
          denominations: ["bandwidth"],
          targets: ["origin"],
        },
      ],
    },
  ],
};

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

function mkNode(id: NodeRecord["id"], slots: number, serviceUs: bigint, depth: NodeRecord["inspectionDepth"], dep: NodeRecord["dependencyNodeId"]): NodeRecord {
  return Object.freeze({
    id,
    kind: "generic",
    slots: makeSlots(slots),
    serviceTimeUs: serviceUs,
    queueDepth: 0,
    queue: Object.freeze([]),
    shedOrder: "qos-weighted" as const,
    inspectionDepth: depth,
    discipline: "hockey-stick" as const,
    utilizationRho: 0n,
    dependencyNodeId: dep,
  });
}

const CONTRACT: Contract = Object.freeze({
  id: asEntityId("ctr-gold-1"),
  customerEntityId: asEntityId("cust-1"),
  bundleId: "shared-web",
  mrcMicroUsd: asMoney(5_000_000n), // $5/mo
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

/** Rule: sustained high "cpu" on web-1 → scale-out 2 (execute band). */
function predicate(metric: string, comparator: Predicate["comparator"], threshold: PolicyThreshold): Predicate {
  return { metric: asMetricId(metric), comparator, threshold };
}
const ACTION: PolicyAction = Object.freeze({ id: "scale-out", runbookName: null, value: fromInt(2) });
const RULEBOOK: readonly PolicyCard[] = Object.freeze([
  Object.freeze({
    id: asRuleId("r-g1-autoscale"),
    scope: Object.freeze({ kind: "object" as const, ref: "web-1" }),
    when: Object.freeze([predicate("cpu", ">", Object.freeze({ kind: "value" as const, amount: 55706n, unit: "percent" as const }))]),
    for: Object.freeze({ durationUs: 2n * MICROS_PER_MIN }),
    then: Object.freeze([ACTION]),
    band: "execute" as const,
    upkeepMicroUsd: asMoney(10n),
  } satisfies PolicyCard),
]);

const CPU_HIGH = 62259n; // Fixed 0.95
const CPU_LOW = 13107n; // Fixed 0.20

function liveCell(value: bigint): ObservedCell<unknown> {
  return Object.freeze({
    value,
    fidelity: 4 as ResolutionBand,
    freshnessUs: 0n,
    coverage: fromInt(1),
    certainty: fromInt(1),
    status: "live" as const,
  });
}

/* ═══════════════════════ the composed run ═══════════════════════ */

interface RunState {
  readonly game: GameState;
  readonly econ: EconomyState;
  /** Store digest INSIDE the digested composite — observed truth must
   *  replay byte-identically too, not just the ground truth. */
  readonly observedDigest: string;
  /** Number of live rule firings so far — interlock proof counter. */
  readonly firings: number;
}

/** One full deterministic scenario: seed → state at `targetTick`. */
function simulate(seed: RunSeed, initial: RunState, targetTick: SimTick): RunState {
  const config = Object.freeze({
    runSeed: seed,
    dnsNodeId: null,
    expressPath: Object.freeze([IDS.edge, IDS.origin]),
    deepPath: Object.freeze([IDS.waf, IDS.edge, IDS.origin]),
    defaultPatienceUs: 3n * MICROS_PER_MIN,
    defaultSizeCost: fromInt(1),
    patienceJitterPct: 0,
    inspectionCostUs: Object.freeze({
      "pass-through": 0n,
      "sample-1-in-20": 3n * 1_000_000n,
      inspect: 10n * 1_000_000n,
      challenge: 20n * 1_000_000n,
    }),
    detectionRatio: fromRatio(9n, 10n),
    falsePositiveRatio: fromRatio(2n, 100n),
    referralProbability: FIXED_ZERO,
    returnProbability: FIXED_ZERO,
  });

  const rulePhase = createRulePhaseStep();
  const slots = Object.freeze({ ...createDefaultSlots(config), rulePhase: rulePhase.step });
  const driver = createTickDriver(slots, streamFor(seed, "root", 0), initial.game.context.clocks);
  const store = new ObservedStore();

  // Waves: director nudge FIRST (logged input), then plan wave 1.
  let director = INITIAL_DIRECTOR_STATE;
  const proposed = directorPropose(director, 0n, streamFor(seed, "director", 0));
  director = proposed.next;
  const table = parseWaveTable(RAW_TABLE);
  const plan = planWave(table, 1, {
    startMinute: 2,
    tick: 0n,
    rng: waveStream(seed, 1, 2),
    director,
    ledger: ledgerSnapshot([], 0n),
    invitations: buildInvitations({}),
    entropyForecastPurchased: false,
    pressureParams: SMOKE_PRESSURE,
  });

  let game = initial.game;
  let econ = initial.econ;
  let firings = 0;
  let arrivalsSeen = 0;
  const cfg = defaultEconomyConfig();

  for (let t = 1; t <= Number(targetTick); t += 1) {
    const minute = game.context.minute + 1;
    const inWave = minute >= plan.startMinute && minute < plan.startMinute + 12;
    const envelopes = inWave ? Object.freeze([plan.waveEnvelope]) : Object.freeze([]);

    const result = driver.advance(game, Object.freeze({
      envelopes,
      evidence: Object.freeze([]),
      classes: CLASSES,
      dependencyEdges: Object.freeze([
        Object.freeze({ upstreamNodeId: IDS.edge, downstreamNodeId: IDS.origin, correlation: "software" as const }),
      ]),
      retryPolicy: RETRY,
      aggression: fromRatio(5n, 10n),
      expressMaxConfidence: fromRatio(8n, 10n),
    }));
    game = result.state;
    firings += result.ruleFirings.length;
    // Cumulative REAL arrival events (waves → arrival slot → event stream).
    for (const event of result.events) {
      if (event.kind === "arrival") arrivalsSeen += 1;
    }

    /* step-12 observed layer: cells DERIVED FROM REAL DRIVER OUTPUT (the
       wave's arrival pressure), applied through the store's single-writer
       gate. Terminal units purge fast at this scale, so the cumulative
       arrival count is the honest load signal. */
    const loaded = arrivalsSeen >= 3;
    store.applyObservedWrites(
      Object.freeze([
        Object.freeze({
          key: observedKey(IDS.web1, "cpu"),
          cell: liveCell(loaded ? CPU_HIGH : CPU_LOW),
          causeId: asCauseId(`g1-smoke:cpu:${t}`),
        }),
      ]),
      game.context.clocks.simUs,
    );
    const merged = new Map(game.observed);
    for (const [key, cell] of store.toObservedMap()) merged.set(key, cell);
    game = Object.freeze({ ...game, observed: Object.freeze(merged) });

    /* economy tick against the shared GameState contract table. */
    econ = runEconomyTick({
      context: game.context,
      runSeed: seed,
      contracts: game.contracts,
      prior: econ,
      cfg,
    }).state;
  }

  return Object.freeze({ game, econ, observedDigest: store.digest(), firings });
}

function initialState(seed: RunSeed = SEED): RunState {
  const game = createInitialState({
    runSeed: seed,
    engineVersion: "integration-smoke",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "sha-sheets", ruleBookHash: "sha-book" },
    clocks: initialClocks(),
    nodes: [
      mkNode(IDS.edge, 2, MICROS_PER_MIN, "sample-1-in-20", IDS.origin),
      mkNode(IDS.origin, 1, MICROS_PER_MIN, "pass-through", null),
      mkNode(IDS.waf, 1, MICROS_PER_MIN, "challenge", IDS.edge),
    ],
    contracts: [CONTRACT],
    ruleBook: RULEBOOK,
    ruleBookHash: "sha-book",
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
  return Object.freeze({ game, econ, observedDigest: "", firings: 0 });
}

const runner = (request: {
  readonly initialState: RunState;
  readonly runSeed: RunSeed;
  readonly targetTick: SimTick;
  readonly intentsUpToTick: readonly unknown[];
}): RunState => simulate(request.runSeed, request.initialState, request.targetTick);

const harnessOptions = {
  runner,
  initialState: initialState(),
  runSeed: SEED,
  engineVersion: "integration-smoke",
  contentHashes: { rulesetCardHashes: {}, sheetsHash: "sha-sheets", ruleBookHash: "sha-book" },
  totalTicks: TOTAL_TICKS,
  snapshotEveryTicks: SNAPSHOT_EVERY,
  checkpointEveryTicks: CHECKPOINT_EVERY,
  directorDraws: [] as readonly DirectorDraw[],
};

/* ═══════════════════════ the gate ═══════════════════════ */

describe("integration smoke (G1 seed): real modules interlock byte-deterministically", () => {
  const reference = simulate(SEED, initialState(), TOTAL_TICKS);

  it("the scenario actually runs the world (waves→pipeline→observed→policy)", () => {
    expect(reference.game.context.tick).toBe(TOTAL_TICKS);
    // waves fed arrivals through the real arrival slot:
    expect(reference.game.units.size).toBeGreaterThan(0);
    // the observed store sealed cells and its digest is non-empty:
    expect(reference.observedDigest.length).toBeGreaterThan(0);
    expect(reference.game.observed.size).toBeGreaterThan(0);
    // state actually moved (per-tick pipeline digest differs from origin):
    const originDigest = digestState(initialState().game);
    expect(digestState(reference.game)).not.toBe(originDigest);
  });

  it("the policy rule phase FIRES off observed truth written via the store (interlock, not wiring)", () => {
    expect(reference.firings).toBeGreaterThan(0);
  });

  it("replay harness verifies the composite run ring + snapshots", () => {
    const harness = createHarness(harnessOptions);
    const verdict = harness.verify();
    expect(verdict.ok).toBe(true);
    expect(verdict.failures).toHaveLength(0);
    expect(verdict.checkedHashPoints).toBeGreaterThan(0);
  });

  it(`×${REPLAYS} harness re-sims are digest-identical, and equal the manual run`, () => {
    const harness = createHarness(harnessOptions);
    const digests = new Set(harness.replayDigests(REPLAYS));
    expect(digests.size).toBe(1);
    const [only] = [...digests];
    expect(only).toBe(canonicalDigest(reference));
    // an independent second harness (fresh closures) agrees byte-for-byte:
    expect(createHarness({ ...harnessOptions, initialState: initialState() }).replayFinalDigest()).toBe(only);
  });

  it("seed sensitivity: a different run seed diverges the final digest", () => {
    const other = simulate(asRunSeed(43n), initialState(asRunSeed(43n)), TOTAL_TICKS);
    expect(canonicalDigest(other)).not.toBe(canonicalDigest(reference));
    const sameSeed = simulate(SEED, initialState(), TOTAL_TICKS);
    expect(canonicalDigest(sameSeed)).toBe(canonicalDigest(reference));
  });
});
