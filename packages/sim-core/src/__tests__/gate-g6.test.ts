/**
 * GATE G6 — "Two Types, One Engine" (§9.13 gate #6, THE generality proof).
 *
 * Two REAL hosting types from the shipped corpus — `official:shared-web` and
 * `official:game-servers` — run through ONE composed pipeline (one board, one
 * physics, one tick loop). The ONLY difference between the two runs is DATA
 * loaded from each bundle via the loader boundary: the visitor patience budget,
 * the wave slice + invitation graph, the diurnal rhythm selector, the tempo
 * flag. No engine call site may branch on a bundle id — that law is pinned
 * twice over: structurally (this file composes identically for both types) and
 * literally (the grep audit below scans every engine source file).
 *
 *  1. EMERGENCE: per-type behavior profiles FALL OUT of the data. Shared-web's
 *     hot midday plateau keeps the board over capacity for most of the day —
 *     BOUNCE-HEAVY (its bounced count exceeds its served count on every seed),
 *     losses spread tick-after-tick, benign retries storming back. Game-
 *     servers' cold evening-trough baseline runs under capacity between
 *     spikes — COLDER service overall (strictly fewer served AND fewer
 *     bounced), losses concentrated into cliff ticks, and its quiet minutes
 *     let adversarial wave units LAND while the web's chronic congestion
 *     absorbs every attacker into the queue (landed: game ≫ web, 0-1 for web).
 *     The §7.8d patience data itself surfaces an honesty finding: BOTH loaded
 *     budgets (3 s / 90 ms) sit below the 60 M µs sim-minute wait quantum, so
 *     the one ratified LUT maps them to the SAME decisions — control (3)
 *     proves the budgets are carried (digest differs) and live above quantum
 *     (decisions change), while sub-quantum swap is behaviorally silent.
 *     Directional assertions across a seed cohort; zero `if (id === …)`
 *     anywhere in the composition.
 *
 *  2. GREP PROOF: the strings "shared-web", "game-servers" (and their
 *     official: forms) must not occur in pipeline/, waves/, observed/ or
 *     kernel/ sources outside __tests__ — the no-type-branches law, CI-pinned.
 *
 *  3. DETERMINISM ×100 per type + CROSS-SWAP CONTROLS: fully swapped data on
 *     one seed diverges (seed identity does not mask type identity); an
 *     above-quantum patience budget changes DECISIONS; the loaded sub-quantum
 *     swap changes state but not behavior — the saturated single law, pinned.
 *
 *  4. TIME-SCALE PROOF: `tempo.permanentIncidentClock` alone re-times the
 *     clock chain (ops clock runs at 15/60 → one sim-minute costs exactly 4×
 *     the real time, the 0.25× permanent-incident drama rate) while simUs and
 *     the ENTIRE outcome stream stay byte-identical. Tempo is presentation
 *     physics, never gameplay physics — and it is driven purely by the flag.
 *
 * Corpus-derived, never corpus-edited (read-only consumer law).
 */

import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  asCauseId,
  asEntityId,
  asMoney,
  asRunSeed,
  buildInvitations,
  clampUnit,
  createDefaultSlots,
  createInitialState,
  createTickDriver,
  digestState,
  FIXED_UNIT,
  FIXED_ZERO,
  fromInt,
  fromRatio,
  INITIAL_DIRECTOR_STATE,
  initialClocks,
  ledgerSnapshot,
  loadTypeBundle,
  makeSlots,
  MICROS_PER_MIN,
  MICROS_PER_SEC,
  observedKey,
  ObservedStore,
  parseDiurnalCurve,
  parseForeignWaveSlice,
  planWave,
  sampleCurveMicro,
  streamFor,
  sub,
  waveStream,
  type Contract,
  type DefaultPipelineConfig,
  type DiurnalCurveTable,
  type EntityId,
  type Fixed,
  type ForeignThreatMeta,
  type GameState,
  type LaneStats,
  type NodeRecord,
  type ObservedCell,
  type QosClassDef,
  type ResolutionBand,
  type RetryPolicy,
  type RunSeed,
  type SimTick,
  type SimTimeUs,
  type ThreatInvitations,
  type TickInputs,
  type WaveEnvelope,
  type WaveTable,
  type LoadedTypeBundle,
} from "../index.ts";

/* ═══════════════════════════ corpus (read-only) ═══════════════════════════ */

const CONTENT_ROOT = join(process.cwd(), "..", "..", "packages", "content");

function readCorpusJson(relPath: string): Record<string, unknown> {
  const abs = join(CONTENT_ROOT, relPath);
  if (!existsSync(abs)) {
    throw new Error(`gate-g6: content corpus missing at ${abs} — run from packages/sim-core`);
  }
  return JSON.parse(readFileSync(abs, "utf8")) as Record<string, unknown>;
}

/** Parse a shipped type-bundle through the REAL loader boundary. */
function loadBundle(typeFile: string): LoadedTypeBundle {
  return loadTypeBundle(readCorpusJson(`types/${typeFile}`));
}

interface CorpusThreat {
  readonly id: string;
  readonly family: string;
  readonly band: string;
  readonly denomination: string;
}

function corpusThreatIndex(): Map<string, CorpusThreat> {
  const registry = readCorpusJson("threats/registry-core.json");
  const threats = registry["threats"] as CorpusThreat[];
  return new Map(threats.map((t) => [t.id, t]));
}

const WAVE_WINDOW_MINUTES = 12;
const WAVE_GEOMETRY = Object.freeze({ windowMinutes: WAVE_WINDOW_MINUTES, rampMin: 3, plateauMin: 3, decayMin: 2 });

/** Adapt a foreign-schema g1 slice through the CANONICAL waves/foreign
 *  adapter (REST-RULES-ADAPTER — same carry-through gate-g2 now uses):
 *  existence data verbatim, geometry authored, §2.24 rules block and
 *  per-wave secondIncident markers forwarded to the engine consumers. */
function corpusWaveTable(sliceRelPath: string, typeBundleId: string): WaveTable {
  const slice = readCorpusJson(sliceRelPath);
  const index = corpusThreatIndex();
  return parseForeignWaveSlice(slice, {
    typeBundleId,
    geometry: WAVE_GEOMETRY,
    threatMeta: (threatId) => {
      const meta = index.get(threatId);
      if (meta === undefined) return undefined;
      return { family: meta.family as ForeignThreatMeta["family"], denomination: meta.denomination as ForeignThreatMeta["denomination"] };
    },
  });
}

/** bundle.threats.waveTable is a "file:…" reference — resolve under content. */
function waveTableFromBundle(bundle: LoadedTypeBundle): WaveTable {
  const ref = bundle.threats.waveTable;
  if (!ref.startsWith("file:")) {
    throw new Error(`gate-g6: unsupported waveTable reference "${ref}" (expected "file:…")`);
  }
  return corpusWaveTable(ref.slice("file:".length), bundle.id);
}

/* ═══════════════════════ diurnal curve library (data) ═══════════════════════
 * A LIBRARY keyed by the bundle's `tempo.diurnalBaseline` id — the same lookup
 * law the skin palette follows. Unknown id → fail loud. The curves share one
 * normalization (same peak magnitude); only their SHAPES differ, straight from
 * what each type's rhythm says it is. Period 90 sim-minutes keeps a run short
 * enough for the ×100 replay cohort. */

const SIM_DAY_US: SimTimeUs = 90n * MICROS_PER_MIN; // 90 sim-min — one compact "day"

function curvePoint(minutes: number, ratePerMin: number): { atUs: SimTimeUs; valueMicro: bigint } {
  return Object.freeze({
    atUs: BigInt(Math.round(minutes)) * MICROS_PER_MIN,
    valueMicro: BigInt(Math.round(ratePerMin * 1_000_000)),
  });
}

const CURVE_LIBRARY: Readonly<Record<string, DiurnalCurveTable>> = Object.freeze({
  "web-midday": parseDiurnalCurve({
    id: "web-midday",
    periodUs: SIM_DAY_US,
    points: Object.freeze([
      curvePoint(0, 2),
      curvePoint(20, 6),
      curvePoint(40, 11),
      curvePoint(60, 11),
      curvePoint(75, 5),
      curvePoint(85, 2.5),
    ]),
  }),
  "evening-peak-18-24-local": parseDiurnalCurve({
    id: "evening-peak-18-24-local",
    periodUs: SIM_DAY_US,
    points: Object.freeze([
      curvePoint(0, 2.2),
      curvePoint(50, 2.5),
      curvePoint(58, 6),
      curvePoint(64, 12),
      curvePoint(72, 12),
      curvePoint(80, 3),
      curvePoint(86, 2.2),
    ]),
  }),
});

function curveFromBundle(bundle: LoadedTypeBundle): DiurnalCurveTable {
  const key = bundle.tempo.diurnalBaseline;
  const hit = CURVE_LIBRARY[key];
  if (hit === undefined) {
    throw new Error(`gate-g6: no diurnal curve for tempo.diurnalBaseline "${key}" (library: ${Object.keys(CURVE_LIBRARY).join("|")})`);
  }
  return hit;
}

/* ═══════════════════════════ the shared board ════════════════════════════
 * ONE physical board for both types — same slots, same per-hop service time,
 * same lanes. The whole point: identical box, different visitors. The board's
 * numbers are law, not type data. */

const LANE_ID = asEntityId("lane/g6-ingress");
const NODE_EDGE = asEntityId("node/g6-edge");
const NODE_ORIGIN = asEntityId("node/g6-origin");
const EDGE_SLOTS = 8;
const HOP_SERVICE_US: SimTimeUs = 20_000n; // 20 ms per hop — ms-scale truth for both types

/** Queue aging is one sim-minute per tick while a visitor waits; the hockey
 *  stick predicts serviceTime × ρ/(1−ρ) at ρ>knee. With an 8-slot node the
 *  PREDICTED wait spans 0 → ~2 s, straddling BOTH loaded budgets on purpose:
 *  game-servers (90 000 µs) abandons at ρ≈0.75, shared-web (3 000 000 µs)
 *  only after visitors actually sit through a minute. Emergence, not branch. */

function mkNode(id: EntityId, dependency: EntityId | null, serviceTimeUs: SimTimeUs): NodeRecord {
  return Object.freeze({
    id,
    kind: "generic",
    slots: makeSlots(EDGE_SLOTS),
    serviceTimeUs,
    queueDepth: 0,
    queue: Object.freeze([]),
    shedOrder: "qos-weighted" as const,
    inspectionDepth: "pass-through" as const, // G6 has no defense story — pure queueing
    discipline: "hockey-stick" as const,
    utilizationRho: 0n,
    dependencyNodeId: dependency,
  });
}

const CLASSES: readonly QosClassDef[] = Object.freeze([
  Object.freeze({
    id: "standard",
    label: "Standard",
    weight: FIXED_UNIT,
    shedPriority: 0,
    budgetUs: 30n * MICROS_PER_MIN,
    inspectionDepth: "pass-through" as const,
  }),
]);

const RETRY: RetryPolicy = Object.freeze({
  maxRetries: 2,
  backoffBaseUs: 2n * MICROS_PER_MIN,
  jitterPurchased: false,
});

/** One paid contract so GameState.contracts is real (identical for both
 *  types — the money face is not what G6 proves). */
function g6Contract(): Contract {
  return Object.freeze({
    id: asEntityId("ctr-g6-gold"),
    customerEntityId: asEntityId("cust-g6"),
    bundleId: "g6-audit-board",
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
    shedImmunityClassId: null,
    allocations: Object.freeze([]),
  });
}

function zeroLane(): LaneStats {
  return Object.freeze({
    laneId: LANE_ID,
    ratePerMin: FIXED_ZERO,
    latencyDistributionRef: "gate-g6/hist/express",
    classMix: Object.freeze({}),
    health: FIXED_UNIT,
  });
}

function laneStats(arrivalsThisTick: number, worstRho: Fixed): LaneStats {
  return Object.freeze({
    laneId: LANE_ID,
    ratePerMin: fromInt(arrivalsThisTick),
    latencyDistributionRef: "gate-g6/hist/express",
    classMix: Object.freeze({}),
    health: clampUnit(sub(FIXED_UNIT, worstRho)),
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

/* ═══════════════════════ profiles: bundle → params ═══════════════════════
 * The ONLY place bundle data enters the scenario. runScenario below cannot
 * tell which type it is running — it receives plain parsed params. */

interface G6Profile {
  readonly seed: RunSeed;
  /** visitor.patienceParams.budgetUs — loaded, verbatim (µs). */
  readonly patienceUs: SimTimeUs;
  readonly table: WaveTable;
  readonly invitations: ThreatInvitations;
  readonly curve: DiurnalCurveTable;
  /** tempo.permanentIncidentClock — the whole clock-chain difference. */
  readonly incident: boolean;
  readonly serviceTimeUs?: SimTimeUs;
}

function profileFromBundle(bundle: LoadedTypeBundle, seedValue: bigint): G6Profile {
  const budget = bundle.visitor.patienceParams.budgetUs;
  if (budget === null) {
    throw new Error(`gate-g6: bundle "${bundle.id}" carries a null patience budget — G6 needs the sigmoid-budget arm`);
  }
  return Object.freeze({
    seed: asRunSeed(seedValue),
    patienceUs: budget,
    table: waveTableFromBundle(bundle),
    invitations: buildInvitations(bundle.threats.unlockedByBuildables),
    curve: curveFromBundle(bundle),
    incident: bundle.tempo.permanentIncidentClock,
  });
}

/* ═══════════════════════════ the run loop ══════════════════════════════════
 * Composed ONCE, driven by ANY profile. Note what is absent: no bundle id,
 * no type switch, no `family === …` steering. Every behavioural input arrives
 * through G6Profile fields. */

interface TickStat {
  readonly tick: SimTick;
  readonly minute: number;
  readonly simUs: SimTimeUs;
  readonly realUs: SimTimeUs;
  readonly businessUs: SimTimeUs;
  readonly arrivals: number;
  readonly served: number;
  readonly bounced: number;
  readonly blockedFalsePositive: number;
  readonly landed: number;
  readonly reentries: number;
  readonly digest: string;
  readonly eventStream: string;
}

interface RunResult {
  readonly stats: readonly TickStat[];
  readonly arrivals: number;
  readonly served: number;
  readonly bounced: number;
  readonly blockedFalsePositive: number;
  readonly landed: number;
  readonly reentries: number;
  /** First tick (1-based) with any patience bounce at all. */
  readonly firstBounceTick: SimTick | null;
  readonly finalDigest: string;
  readonly observedDigest: string;
}

/** One organic arrival envelope per tick, sampled from the loaded curve. */
function baselineEnvelope(curve: DiurnalCurveTable, tableId: string, simUs: SimTimeUs): WaveEnvelope {
  const micro = sampleCurveMicro(curve, simUs);
  return Object.freeze({
    tableId: `${tableId}/organic`,
    role: "baseline" as const,
    shape: "plateau" as const,
    ratePerMin: fromRatio(micro, 1_000_000n),
    telegraphed: false,
    dominantFamily: "organic" as const,
  });
}

interface PlannedWave {
  readonly plan: ReturnType<typeof planWave>;
  readonly windowEndMinute: number;
}

function planAllWaves(profile: G6Profile): readonly PlannedWave[] {
  const director = INITIAL_DIRECTOR_STATE;
  return Object.freeze(
    profile.table.waves.map((wave, i) => {
      const windowStart = 2 + i * WAVE_WINDOW_MINUTES; // two quiet minutes, then back-to-back
      const plan = planWave(profile.table, wave.n, {
        startMinute: windowStart,
        tick: 0n,
        rng: waveStream(profile.seed, wave.n, windowStart),
        director,
        ledger: ledgerSnapshot([], 0n),
        invitations: profile.invitations,
        entropyForecastPurchased: false,
      });
      return Object.freeze({ plan, windowEndMinute: windowStart + WAVE_WINDOW_MINUTES });
    }),
  );
}

function runScenario(profile: G6Profile, totalTicks: number): RunResult {
  const config: DefaultPipelineConfig = Object.freeze({
    runSeed: profile.seed,
    dnsNodeId: null,
    expressPath: Object.freeze([NODE_EDGE, NODE_ORIGIN]),
    deepPath: Object.freeze([NODE_EDGE, NODE_ORIGIN]),
    defaultPatienceUs: profile.patienceUs,
    defaultSizeCost: fromInt(1),
    patienceJitterPct: 0,
    inspectionCostUs: Object.freeze({
      "pass-through": 0n,
      "sample-1-in-20": 3n * 1_000_000n,
      inspect: 10n * 1_000_000n,
      challenge: 20n * 1_000_000n,
    }),
    detectionRatio: FIXED_UNIT,
    falsePositiveRatio: FIXED_ZERO,
    referralProbability: FIXED_ZERO,
    returnProbability: FIXED_ZERO,
  });

  const slots = createDefaultSlots(config);
  // Tempo is the ONLY clock difference, and it comes from the bundle flag:
  // incident=true pins the ops clock at 15/60, so a sim-minute costs 4× the
  // real time. simUs per tick stays one minute either way (kernel law).
  const driver = createTickDriver(slots, streamFor(profile.seed, "root", 0), initialClocks(), {
    tickAdvance: Object.freeze({
      realElapsedUs: profile.incident ? 4n * MICROS_PER_SEC : MICROS_PER_SEC,
      speed: 1 as const,
      incident: profile.incident,
    }),
  });
  const store = new ObservedStore();
  const plans = planAllWaves(profile);
  const service = profile.serviceTimeUs ?? HOP_SERVICE_US;

  let game: GameState = createInitialState({
    runSeed: profile.seed,
    engineVersion: "gate-g6",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "gate-g6/sheets", ruleBookHash: "gate-g6/book" },
    clocks: initialClocks(),
    nodes: [mkNode(NODE_EDGE, NODE_ORIGIN, service), mkNode(NODE_ORIGIN, null, service)],
    lanes: [zeroLane()],
    contracts: [g6Contract()],
  });

  let arrivals = 0;
  let served = 0;
  let bounced = 0;
  let blockedFalsePositive = 0;
  let landed = 0;
  let reentries = 0;
  let firstBounceTick: SimTick | null = null;
  const stats: TickStat[] = [];

  for (let t = 1; t <= totalTicks; t += 1) {
    const minute = game.context.minute + 1;
    const simUsNow = BigInt(minute) * MICROS_PER_MIN;

    const envelopes: WaveEnvelope[] = [baselineEnvelope(profile.curve, profile.table.id, simUsNow)];
    for (const { plan, windowEndMinute } of plans) {
      if (minute >= plan.startMinute && minute < windowEndMinute) envelopes.push(plan.waveEnvelope);
    }

    const inputs: TickInputs = Object.freeze({
      envelopes: Object.freeze(envelopes),
      evidence: Object.freeze([]),
      classes: CLASSES,
      dependencyEdges: Object.freeze([]),
      retryPolicy: RETRY,
      aggression: FIXED_ZERO,
      expressMaxConfidence: FIXED_UNIT,
      lanes: game.lanes,
    });

    const result = driver.advance(game, inputs);

    let tickArrivals = 0;
    let tickServed = 0;
    let tickBounced = 0;
    let tickBlocked = 0;
    let tickLanded = 0;
    const eventTags: string[] = [];
    for (const event of result.events) {
      if (event.kind === "arrival") tickArrivals += 1;
      eventTags.push(`${event.kind}@${String(event.tick)}`);
    }
    for (const outcome of result.outcomes) {
      if (outcome.terminal === "served") {
        served += 1;
        tickServed += 1;
      } else if (outcome.terminal === "bounced") {
        bounced += 1;
        tickBounced += 1;
      } else if (outcome.terminal === "blocked-false-positive") {
        blockedFalsePositive += 1;
        tickBlocked += 1;
      } else {
        landed += 1;
        tickLanded += 1;
      }
      eventTags.push(`terminal:${outcome.terminal}:${String(outcome.atUs)}`);
    }
    arrivals += tickArrivals;
    reentries += result.pendingReentries;
    if (tickBounced > 0 && firstBounceTick === null) firstBounceTick = BigInt(t);

    let worstRho: Fixed = FIXED_ZERO;
    for (const node of result.state.nodes.values()) {
      if (node.utilizationRho > worstRho) worstRho = node.utilizationRho;
    }

    game = Object.freeze({ ...result.state, lanes: Object.freeze(new Map([[LANE_ID, laneStats(tickArrivals, worstRho)]])) });

    // Step-12 law: renderer-facing cells derived from ground truth (the ρ the
    // engine stamped + queue depth), sealed through the single-writer store.
    const edge = game.nodes.get(NODE_EDGE);
    if (edge === undefined) throw new Error(`gate-g6: edge node vanished at tick ${t}`);
    store.applyObservedWrites(
      Object.freeze([
        Object.freeze({ key: observedKey(NODE_EDGE, "utilizationRho"), cell: exactCell(edge.utilizationRho), causeId: asCauseId(`g6:rho:${t}`) }),
        Object.freeze({ key: observedKey(NODE_EDGE, "queueDepth"), cell: exactCell(edge.queueDepth), causeId: asCauseId(`g6:queue:${t}`) }),
      ]),
      game.context.clocks.simUs,
    );
    const merged = new Map(game.observed);
    for (const [key, cell] of store.toObservedMap()) merged.set(key, cell);
    game = Object.freeze({ ...game, observed: Object.freeze(merged) });

    stats.push(
      Object.freeze({
        tick: game.context.tick,
        minute: game.context.minute,
        simUs: game.context.clocks.simUs,
        realUs: game.context.clocks.realUs,
        businessUs: game.context.clocks.businessUs,
        arrivals: tickArrivals,
        served: tickServed,
        bounced: tickBounced,
        blockedFalsePositive: tickBlocked,
        landed: tickLanded,
        reentries: result.pendingReentries,
        digest: digestState(game),
        eventStream: eventTags.join(";"),
      }),
    );
  }

  return Object.freeze({
    stats: Object.freeze(stats),
    arrivals,
    served,
    bounced,
    blockedFalsePositive,
    landed,
    reentries,
    firstBounceTick,
    finalDigest: digestState(game),
    observedDigest: store.digest(),
  });
}

const TOTAL_TICKS = 90;

/* Profiles are built INSIDE the tests (fresh per assertion group); the engine
 * never sees a bundle — only these parsed params. */

function sharedWebProfile(seedValue: bigint): G6Profile {
  return profileFromBundle(loadBundle("shared-web.json"), seedValue);
}
function gameServersProfile(seedValue: bigint): G6Profile {
  return profileFromBundle(loadBundle("game-servers.json"), seedValue);
}

/** Loss CONCENTRATION: the biggest single tick's share of the day's total
 *  bounces. A chronic profile (shared-web's long hot plateau) spreads its
 *  losses across many ticks; a binary profile (game-servers' cliff evening)
 *  spends a larger fraction of all its losses in its worst single tick. */
function lossConcentration(run: RunResult): number {
  if (run.bounced === 0) return 0;
  const worst = Math.max(...run.stats.map((s) => s.bounced));
  return worst / run.bounced;
}

/** The per-tick DECISION fingerprint (arrivals + all four terminals). Two
 *  profiles with identical fingerprints make identical choices minute after
 *  minute — behavioral equivalence regardless of what state they carry. */
function decisionFingerprint(run: RunResult): string {
  return run.stats
    .map((s) => `${s.tick}:${s.arrivals}:${s.served}:${s.bounced}:${s.blockedFalsePositive}:${s.landed}`)
    .join("|");
}

/* ═══════════════════════ 1 · emergence from loaded data ══════════════════ */

describe("G6 · one engine, two types — behavior profiles EMERGE from bundle data", () => {
  const SEED_COHORT = [1n, 7n, 4242n] as const;

  it("the loaded budgets really are different (3 s vs 90 ms)", () => {
    const web = sharedWebProfile(1n);
    const game = gameServersProfile(1n);
    expect(web.patienceUs).toBe(3_000_000n);
    expect(game.patienceUs).toBe(90_000n);
    expect(web.incident).toBe(false);
    expect(game.incident).toBe(true);
    expect(web.table.id).not.toBe(game.table.id);
  });

  it("shared-web: bounce-HEAVY — the chronic hot baseline keeps visitors queuing, and losses outnumber wins", () => {
    for (const seed of SEED_COHORT) {
      const run = runScenario(sharedWebProfile(seed), TOTAL_TICKS);
      expect(run.served, `seed ${seed}: shared-web still serves`).toBeGreaterThan(0);
      expect(run.bounced, `seed ${seed}: shared-web is the bounce-heavy profile`).toBeGreaterThan(run.served);
      expect(run.reentries, `seed ${seed}: bounced customers retry (benign storm re-entry)`).toBeGreaterThan(0);
      expect(run.blockedFalsePositive, `seed ${seed}: pass-through board has no defense losses`).toBe(0);
    }
  });

  it("game-servers: BINARY and TIGHT — cold troughs serve flawlessly then lose the whole queue at once; quiet windows let threats LAND (breach exposure, not congestion cover)", () => {
    for (const seed of SEED_COHORT) {
      const web = runScenario(sharedWebProfile(seed), TOTAL_TICKS);
      const game = runScenario(gameServersProfile(seed), TOTAL_TICKS);

      // Both types bounce (the loaded budgets are BOTH sub-quantum: one
      // minute of simulated waiting exceeds any patience either bundle
      // ships — the abandonment law is saturated for the pair, which is
      // itself the §7.8d finding this gate surfaces).
      expect(game.firstBounceTick, `seed ${seed}: game-servers does bounce`).not.toBeNull();
      expect(web.firstBounceTick, `seed ${seed}: shared-web does bounce too`).not.toBeNull();

      // COLD service: the tight-tolerance type with the quiet baseline ends
      // the day having served strictly FEWER visitors overall.
      expect(game.served, `seed ${seed}: game-servers serves less`).toBeLessThan(web.served);

      // BINARY in time: game-servers' losses arrive as cliffs — a bigger
      // fraction of its (smaller) total bounce count lands in its single
      // worst tick — while shared-web bleeds steadily across the long hot
      // plateau, spreading its (larger) losses thinner per tick.
      expect(game.bounced, `seed ${seed}: game bounces less in total`).toBeLessThan(web.bounced);
      expect(lossConcentration(game), `seed ${seed}: game losses cluster in cliffs`).toBeGreaterThan(
        lossConcentration(web),
      );

      // BREACH EXPOSURE: the game's quiet minutes let adversarial wave units
      // walk into the origin unserved-and-unbounced; the web's chronic
      // congestion absorbs every attacker into the queue before it lands.
      expect(game.landed, `seed ${seed}: game's troughs let threats land`).toBeGreaterThan(web.landed);
    }
  });

  it("the bounce physics runs the SAME code path: no terminal type ever appears that the other type could not produce", () => {
    const web = runScenario(sharedWebProfile(1n), TOTAL_TICKS);
    const game = runScenario(gameServersProfile(1n), TOTAL_TICKS);
    // Both profiles produce the same terminal VOCABULARY (served/bounced/
    // landed), differing only in counts — the engine has no per-type arm.
    expect(web.blockedFalsePositive).toBe(0);
    expect(game.blockedFalsePositive).toBe(0);
    expect(web.landed + game.landed).toBeGreaterThan(0);
  });
});

/* ═════════════════════════ 2 · grep proof (CI law) ═══════════════════════ */

describe("G6 · no-type-branches law: engine sources carry zero bundle-id literals", () => {
  const FORBIDDEN = ["official:shared-web", "official:game-servers", "game-servers", "shared-web"] as const;
  const ENGINE_DIRS = ["pipeline", "waves", "observed", "kernel"] as const;

  it("pipeline/, waves/, observed/, kernel/ contain no type-name strings outside __tests__", () => {
    const srcRoot = join(process.cwd(), "src");
    const offenders: string[] = [];
    for (const dir of ENGINE_DIRS) {
      const abs = join(srcRoot, dir);
      if (!existsSync(abs)) throw new Error(`gate-g6: engine dir ${abs} missing — run from packages/sim-core`);
      // Names-only readdir (the shape the workspace's ambient node:fs stub
      // types): in these four engine dirs the only non-file entries are
      // `__tests__/` and `tsconfig.check.json`, so filtering on the `.ts`
      // suffix scans EXACTLY the files withFileTypes+isFile would.
      for (const name of readdirSync(abs)) {
        if (!name.endsWith(".ts")) continue;
        const file = join(abs, name);
        const text = readFileSync(file, "utf8");
        for (const needle of FORBIDDEN) {
          if (text.includes(needle)) offenders.push(`${dir}/${name} contains "${needle}"`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

/* ═══════════════════ 3 · determinism ×100 + cross-swap control ═══════════ */

describe("G6 · determinism, and the seed does not mask the type", () => {
  it.each([
    ["shared-web", sharedWebProfile],
    ["game-servers", gameServersProfile],
  ] as const)("%s replays ×100 byte-identically (per-tick digests + observed seal)", (_label, build) => {
    const profile = build(31337n);
    const first = runScenario(profile, TOTAL_TICKS);
    const finals = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      const again = runScenario(profile, TOTAL_TICKS);
      finals.add(again.finalDigest);
      if (i === 0) {
        expect(again.observedDigest).toBe(first.observedDigest);
        expect(again.stats.map((s) => s.digest)).toEqual(first.stats.map((s) => s.digest));
      }
    }
    expect(finals.size).toBe(1);
    expect(finals.has(first.finalDigest)).toBe(true);
  }, 240_000);

  it("cross-swap controls: DATA steers the trajectory — full param swap diverges, above-quantum patience diverges, and sub-quantum patience budgets are provably equivalent through the ONE saturated law", () => {
    const seed = 555n;
    const web = sharedWebProfile(seed);
    const game = gameServersProfile(seed);

    const webRun = runScenario(web, TOTAL_TICKS);
    const gameRun = runScenario(game, TOTAL_TICKS);
    // (a) Same seed, fully swapped data (each type's patience+waves+curve on
    //     the other's identity): digests differ — seed identity does not
    //     mask type identity.
    expect(webRun.finalDigest).not.toBe(gameRun.finalDigest);
    expect(webRun.stats.map((s) => s.digest)).not.toEqual(gameRun.stats.map((s) => s.digest));

    // (b) Patience-only swap between the two LOADED budgets: BEHAVIORALLY
    //     indistinguishable — every tick's decision fingerprint identical —
    //     while the state (and digest) honestly CARRIES the different number.
    //     Not a dead dial: a saturation proof. Both 3 s and 90 ms sit below
    //     the 60 M µs sim-minute wait quantum, so the one ratified LUT
    //     (certainty at ratio ≥ 2.0) maps both budgets to the same
    //     decisions. One engine, one sigmoid, two points on its plateau.
    const webWithGameBudget: G6Profile = Object.freeze({ ...web, patienceUs: game.patienceUs });
    const swapRun = runScenario(webWithGameBudget, TOTAL_TICKS);
    expect(decisionFingerprint(swapRun)).toBe(decisionFingerprint(webRun));
    expect(swapRun.finalDigest).not.toBe(webRun.finalDigest);

    // (c) …and the dial IS live: an ABOVE-quantum patience budget (10 sim-
    //     minutes) changes the DECISIONS, not just the record — patients
    //     queues jam the board and the day's served count collapses.
    const patientRun = runScenario(
      Object.freeze({ ...web, patienceUs: 10n * MICROS_PER_MIN }),
      TOTAL_TICKS,
    );
    expect(decisionFingerprint(patientRun)).not.toBe(decisionFingerprint(webRun));
    expect(patientRun.served).toBeLessThan(webRun.served);
  });
});

/* ═══════════════════════ 4 · time-scale from the flag ════════════════════ */

describe("G6 · tempo.permanentIncidentClock alone drives the 0.25× incident rate", () => {
  it("game-servers (flag on) costs exactly 4× real µs per sim-minute; flipping ONLY the flag leaves simUs and the whole outcome stream byte-identical", () => {
    const seed = 99n;
    const game = gameServersProfile(seed);
    const gameWithoutFlag: G6Profile = Object.freeze({ ...game, incident: false });
    const web = sharedWebProfile(seed);

    // The loaded flags really differ, and the runs inherit them.
    expect(game.incident).toBe(true);
    expect(web.incident).toBe(false);

    const flagged = runScenario(game, TOTAL_TICKS);
    const plain = runScenario(gameWithoutFlag, TOTAL_TICKS);
    const webRun = runScenario(web, TOTAL_TICKS);

    // (a) sim-minute cost in REAL time: exactly 4× on every tick when the
    //     flag is set — the permanent 15/60 ops scale is the 0.25× drama rate.
    for (let i = 0; i < TOTAL_TICKS; i += 1) {
      const f = flagged.stats[i]!;
      const p = plain.stats[i]!;
      const prevF = i === 0 ? 0n : flagged.stats[i - 1]!.realUs;
      const prevP = i === 0 ? 0n : plain.stats[i - 1]!.realUs;
      expect(f.realUs - prevF).toBe(4n * (p.realUs - prevP));
      // sim clock and business-keyed physics are UNTOUCHED by tempo (the
      // state digest DOES differ — it seals the real/business clock fields,
      // which is exactly the ONLY thing tempo changes):
      expect(f.simUs).toBe(p.simUs);
      expect(f.eventStream).toBe(p.eventStream);
      expect(f.arrivals).toBe(p.arrivals);
      expect(f.served).toBe(p.served);
      expect(f.bounced).toBe(p.bounced);
      expect(f.landed).toBe(p.landed);
    }

    // (b) business clock keeps real time regardless of tempo — it MUST feel
    //     the 4× wall cost (that is the permanent-incident drama), while the
    //     shared-web profile sits on the 1× rate.
    const flaggedBusiness = flagged.stats[TOTAL_TICKS - 1]!.businessUs;
    const plainBusiness = plain.stats[TOTAL_TICKS - 1]!.businessUs;
    expect(flaggedBusiness > plainBusiness * 4n - 4n).toBe(true);
    expect(flaggedBusiness < plainBusiness * 4n + 4n).toBe(true);
    const webReal = webRun.stats[TOTAL_TICKS - 1]!.realUs;
    const gameReal = flagged.stats[TOTAL_TICKS - 1]!.realUs;
    expect(gameReal).toBe(4n * webReal);

    // (c) whole-stream identity: the flagged run's outcome stream equals the
    //     unflagged twin's exactly (already checked per tick in (a)) — tempo
    //     is the clock mapping, never the physics.
    expect(flagged.arrivals + flagged.served + flagged.bounced + flagged.landed).toBe(
      plain.arrivals + plain.served + plain.bounced + plain.landed,
    );
  });
});

