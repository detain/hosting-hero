/**
 * SimCoreRunner — the REAL @hh/sim-core pipeline behind the same SimRunner
 * seam the mock fills (wave-2 swap: `createRunner("sim-core")`).
 *
 * Authority contract (ARCHITECTURE.md §3.1): this file runs in the worker (or
 * a headless test) and is the ONLY ground-truth writer in the app. It composes
 * the public sim-core surface EXCLUSIVELY through package subpath exports
 * (`@hh/sim-core/pipeline`, `/observed`, `/waves`, `/kernel`, `/types`) — zero
 * deep relative imports into packages/sim-core, zero edits to it.
 *
 * Composition per tick (mirrors the sanctioned example in
 * sim-core src/__tests__/integration-smoke.test.ts):
 *   waves.planWave            → WaveEnvelope fed to the real arrival slot
 *   pipeline.createTickDriver → 12-step deterministic tick (ground truth);
 *                               its pre-step-1 intent door receives the player
 *                               verbs stamped by `submit` (contract #10)
 *   observed.ObservedStore    → step-12 gate: renderer-facing cells derived
 *                               from REAL driver outputs, sealed via the
 *                               store, merged into GameState.observed
 *   economy.runEconomyTick    → money lane (REST-PROTO-FINAL): the tick's
 *                               observedWrites (company::reputation publisher)
 *                               forward through the SAME store; cash +
 *                               ledgerSeq mirror into GameState like the
 *                               sanctioned fastForward example
 *
 * MAINLINE MAZING (§7.10, audit g21 #2): the board is a real fork —
 * `edge` is the shared front door; cold traffic (score ≤ dial) walks the
 * EXPRESS lane edge→waf→origin (short, shallow, cheap); hot traffic is
 * scored at arrival and routed into the DEEP lane edge→deep (slow, high
 * inspection depth, terminal — "the only route you are allowed to lengthen
 * is the deep lane"). The score is `1 − source.reputation` (the §7.10
 * scoring vocabulary's first input, already minted on the arrival stream —
 * zero new RNG), and it is consulted ONLY while the front door is authored
 * to actually look: a door-set `ConfigureNode edge pass-through` stops the
 * intel and every unit rides express (§7.10's bargain — inspection is what
 * makes routing a choice). The dial is a `slider` arm ("dial", Fixed
 * 0…FIXED_UNIT = expressMaxConfidence); node depths move through the REAL
 * intent door (`player-verb` configure). The bundle's authored
 * threats.familyWeights (batch-B handoff, audit fix 3) now steers the
 * arrival dice via waves.parseFamilyWeightsTable → arrival config.familyMix.
 * v0 honesty: mid-path demotion (G3's wire-yank) is NOT mainlined — the
 * lane is decided at arrival and re-decided on each retry re-entry (the
 * re-mint carries the same source identity, so stickiness rides reputation).
 * The projection that leaves through the protocol carries ONLY observed-layer
 * data: LaneStats aggregates, ObservedCells, counters, notices, clocks.
 *
 * WAVE RULES LIVE (§2.24, B4): the traffic is the SHIPPED g1 shared-web slice
 * (five par-scaled waves via the canonical foreign adapter @c9c0433), planned
 * lazily at each window entry with the three host inputs wired in
 * `runner/waveRules.ts` — OD-24's 8:1 oversell proposal (gated on the bundle
 * declaring the slider), a bounce/land incident clock (fires wave-4's
 * secondIncident marker), and the deep lane's engaged-family census (copycat).
 * All thresholds PROVISIONAL scenario rows; witnesses via wavePlan(n) /
 * incidentState() / dominantDefenseFamily().
 *
 * Purity law: every per-run mutable object (driver, store, plan, counters) is
 * minted inside the constructor, so two fresh instances on one seed replay
 * byte-identically through the wire (see __tests__/simCoreRunner.test.ts).
 *
 * Determinism note: `headlessStep(dtRealMs)` advances EXACTLY one macro-tick
 * (1 sim-minute via the driver clock chain) and ignores `dtRealMs` — real time
 * gates EMISSION cadence in `start()`, never physics (§4.1: speed gates
 * observation detail, not the sim).
 */
import {
  ResolutionBand,
  asCauseId,
  asEntityId,
  asMoney,
  asRunSeed,
  observedKey,
  type ClockState,
  type Contract,
  type DependencyEdge,
  type EntityId,
  type ExternalIntent,
  type Fixed,
  type LaneStats,
  type NodeRecord,
  type ObservedCell,
  type ObservedKey,
  type GameState,
  type Outcome,
  type PlayerIntent,
  type QosClassDef,
  type RetryPolicy,
  type RouteIn,
  type RouteOut,
  type RunSeed,
  type SimTick,
  type ThreatFamily,
  type TickStep,
  type WaveEnvelope,
} from "@hh/sim-core/types";
import {
  FIXED_UNIT,
  FIXED_ZERO,
  MICROS_PER_MIN,
  fromInt,
  fromRatio,
  initialClocks,
  streamFor,
  sub,
} from "@hh/sim-core/kernel";
import {
  createDefaultSlots,
  createInitialState,
  createTickDriver,
  makeSlots,
  type DefaultPipelineConfig,
  type TickDriver,
  type TickInputs,
} from "@hh/sim-core/pipeline";
import { ObservedStore } from "@hh/sim-core/observed";
import {
  defaultEconomyConfig,
  emptyEconomyState,
  postEntry,
  registerContractEconomy,
  runEconomyTick,
  type EconomyConfig,
  type EconomyNotice,
  type EconomyState,
  type EntryDraft,
  type RevenueColourTags,
} from "@hh/sim-core/economy";
import {
  INITIAL_DIRECTOR_STATE,
  buildInvitations,
  directorPropose,
  ledgerSnapshot,
  parseFamilyWeightsTable,
  planWave,
  waveStream,
  type DirectorState,
  type PressureParams,
  type WavePlan,
  type WaveTable,
} from "@hh/sim-core/waves";
import {
  INCIDENT_ACTIVE_MINUTES,
  INITIAL_INCIDENT_CLOCK,
  OVERSELL_RATIO_MICRO,
  SHARED_WEB_G1_TABLE,
  bundleDeclaresOversellSlider,
  dominantFamilyOfCensus,
  homogeneityMicroFromClassMix,
  incidentStateOf,
  planWaveWindowSchedule,
  stepIncidentClock,
  threatFamilyOfIntent,
  type IncidentClock,
  type IncidentState,
  type WaveWindowSpec,
} from "./waveRules";
// SSOT law: the traffic mix comes from the authored bundle, never a copied
// number (precedent: lab/coverageGridModel.ts, gates/g5, gates/g6).
import sharedWebBundleRaw from "../../../../packages/content/types/shared-web.json?raw";
import type { SimProjection, EventNotice, ProtoCell, CellValue } from "../shared/protocol";
import type { SimRunner } from "./simRunner";

/* ═══════════════════════════ scenario (G1 maze board) ═══════════════════════════
 * Local constants, not sim-core internals: a two-lane maze board whose
 * base numbers come from the sanctioned integration example, forked per
 * §7.10. Placeholder-content grade — the content wave replaces this with
 * loaded ruleset bundles.
 *
 *        cold (score ≤ dial)                service target
 *  edge ────────────────────► waf ─────────► origin
 *       ╲                                      ▲
 *        ╲ hot (score > dial), terminal        │ deep lane never
 *         ╲─────────────────────────────► deep─╯ reaches origin —
 *                                              the maze IS the containment.
 */

const LANE_ID = asEntityId("lane/ingress-1");
const NODE_EDGE = asEntityId("edge");
const NODE_WAF = asEntityId("waf");
const NODE_DEEP = asEntityId("deep");
const NODE_ORIGIN = asEntityId("origin");
const LAG_TABLE_REF = "g1-smoke-lag-v0";
const WAVE_START_MINUTE = 2;

/** Demo-cheap pressure override — same legal shape the smoke uses, kept so a
 *  100-tick test run stays cheap without losing bounce physics. The REAL
 *  shipped g1 slice rides on top of it: each wave's parPct (25/60/30/75/100)
 *  scales the draw, so the quarter builds instead of one flat placeholder. */
const PRESSURE: PressureParams = Object.freeze({
  baseMicro: 6n * 1_000_000n,
  growthNum: 223n,
  growthDen: 200n,
  sawtoothMicro: Object.freeze([1_000_000n]),
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

const DEPENDENCY_EDGES: readonly DependencyEdge[] = Object.freeze([
  Object.freeze({ upstreamNodeId: NODE_EDGE, downstreamNodeId: NODE_ORIGIN, correlation: "software" as const }),
]);

function mkNode(id: EntityId, slots: number, serviceUs: bigint, depth: NodeRecord["inspectionDepth"], dep: EntityId | null): NodeRecord {
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

/** One paid contract so GameState.contracts is a real (non-degenerate) map. */
const CONTRACT: Contract = Object.freeze({
  id: asEntityId("ctr-gold-1"),
  customerEntityId: asEntityId("cust-1"),
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

/* ───────────────────────── money-lane roster ─────────────────────────
 * REST-PROTO-FINAL (audit 45f0edf handoff #1): the product runner advances
 * the REAL economy engine alongside the pipeline and forwards the tick's
 * `EconomyTickOut.observedWrites` into the same ObservedStore the lanes use
 * — so `company::reputation` (fix-economy @57ea80e publisher) and the money
 * notices flow live instead of reading '?'. Composition mirrors the
 * sanctioned money lane in sim-core src/unattended/fastForward.ts.
 *
 * The book is deliberately THREE-shaped so every v0 money surface is a
 * witness, not a placeholder:
 *  · ctr-gold-1  — the monthly contract already on GameState.contracts
 *                  ($5 MRC; the ~420-tick monthly cycle stays quiet in a
 *                  100-tick run, which is itself the honest baseline).
 *  · ctr-hourly-1 — hourly cycle at mrc 720_000_000 µ$ ($720/mo, $1 per
 *                  60-business-minute cycle — exact-÷720 so scaleMoney
 *                  never rounds): issues AND settles inside the test window.
 *  · ctr-pending-1 — signed-not-started (termStartMin 300 business-min ≈
 *                  tick 3 on the driver clock): exercises the 57ea80e
 *                  pending→activate phase with a real `contract-activated`
 *                  witness.
 *
 * GameState.contracts keeps ONLY the monthly record — the money book is the
 * runner's private contractsBook (fastForward's separation law: pipeline
 * physics never reads it; digest sees cash/ledgerSeq, which the mirror moves
 * honestly). */

/** Hourly-metered SMB ticket — the fast money heartbeat of the demo board. */
const CONTRACT_HOURLY: Contract = Object.freeze({
  id: asEntityId("ctr-hourly-1"),
  customerEntityId: asEntityId("cust-2"),
  bundleId: "shared-web",
  mrcMicroUsd: asMoney(720_000_000n),
  tcvMicroUsd: asMoney(720_000_000n),
  acvMicroUsd: asMoney(720_000_000n),
  termStartMin: 0,
  termEndMin: 43_200,
  billingCycle: "hourly" as const,
  sla: CONTRACT.sla,
  routingLocks: Object.freeze([]),
  shedImmunityClassId: "bronze",
  allocations: Object.freeze([]),
});

/** Signed deal with a future service start: prime pending → the engine
 *  flips it live at termStartMin with a `contract-activated` notice. */
const CONTRACT_PENDING: Contract = Object.freeze({
  id: asEntityId("ctr-pending-1"),
  customerEntityId: asEntityId("cust-3"),
  bundleId: "shared-web",
  mrcMicroUsd: asMoney(12_000_000n),
  tcvMicroUsd: asMoney(144_000_000n),
  acvMicroUsd: asMoney(144_000_000n),
  termStartMin: 300,
  termEndMin: 43_500,
  billingCycle: "monthly" as const,
  sla: CONTRACT.sla,
  routingLocks: Object.freeze([]),
  shedImmunityClassId: null,
  allocations: Object.freeze([]),
});

const MONEY_CONTRACTS: readonly Contract[] = Object.freeze([
  CONTRACT,
  CONTRACT_HOURLY,
  CONTRACT_PENDING,
]);

/** Opening float (PROVISIONAL scenario row): $25,000 of free cash so the
 *  settle lane is funded from tick one — an unfunded roster would only ever
 *  exercise the insolvent-settle boundary. */
const OPENING_FREE_MICRO_USD: bigint = 25_000_000_000n;

/** Neutral five-axis "blue" census — verbatim fastForward default (the
 *  tags are a content/finance decision the runner has no authority to invent). */
const DEFAULT_REVENUE_TAGS: RevenueColourTags = Object.freeze({
  margin: "blue",
  churnRisk: "blue",
  term: "blue",
  concentration: "blue",
  abuse: "blue",
} as const);

/** One landed breach = one sim-minute of company-wide outage (the
 *  fastForward PROVISIONAL reading — per-contract target attribution is an
 *  open OD item; landed traffic must at least cost SLA budget, not nothing). */
const OUTAGE_SECONDS_PER_LANDED = 60n;

/** Review-F4 boundary (mirrors fastForward): economy/ refuses negative
 *  buckets by throwing a raw RangeError deep inside settle. ONLY that family
 *  is converted into a counted refusal (prior econ kept — the same invoice
 *  retries next tick, deterministic livelock-by-design, never a crash and
 *  never a silent success). OWNER QUESTION (economy lane): canSettle() so
 *  this catch can retire. */
const NEGATIVE_BUCKET_LAW = /would go negative/;

function openingDraft(amountMicroUsd: bigint): EntryDraft {
  return Object.freeze({
    causeId: asCauseId("adapter:opening-balance"),
    atBusinessMin: 0,
    moneyColour: "gold" as const,
    delta: Object.freeze({ free: asMoney(amountMicroUsd) }),
    context: "runner opening float",
  });
}

/** Prime the money state: opening float + one registration per contract,
 *  exactly the fastForward money-lane fold (single-registration chaining —
 *  three contracts, no need for the batch API at this roster size). */
function primeEconomy(cfg: EconomyConfig): EconomyState {
  const posted = postEntry(
    emptyEconomyState().journal,
    emptyEconomyState().cash,
    openingDraft(OPENING_FREE_MICRO_USD),
  );
  let econ: EconomyState = Object.freeze({
    ...emptyEconomyState(),
    journal: posted.journal,
    cash: posted.cash,
  });
  for (const contract of MONEY_CONTRACTS) {
    econ = registerContractEconomy(
      econ,
      {
        contract,
        atBusinessMin: 0,
        clauseRefs: ["auto-renew"],
        grandfather: null,
        revenueTags: DEFAULT_REVENUE_TAGS,
        commitmentBps: 9_990n,
      },
      cfg,
    );
  }
  return econ;
}

/** AUDIT FIX 3 consumer wiring (batch-B handoff @4856a42): the bundle's
 *  authored five-family weights become the arrival dice's table. Parsed
 *  once at module load — a drift in the bundle text fails the boot LOUD
 *  (parseFamilyWeightsTable is fail-loud), never silently smooths over. */
function bundleFamilyMix(): NonNullable<DefaultPipelineConfig["familyMix"]> {
  const doc = JSON.parse(sharedWebBundleRaw) as {
    threats?: { familyWeights?: Record<string, unknown> };
  };
  const table = doc.threats?.familyWeights;
  if (table === undefined) {
    throw new Error(
      "SimCoreRunner: shared-web.json#threats.familyWeights missing — the authored traffic mix cannot be wired",
    );
  }
  return parseFamilyWeightsTable(table, "shared-web.json#threats.familyWeights");
}

export const FAMILY_MIX = bundleFamilyMix();

/* ═══════════════════════ mainline mazing law (§7.10) ═══════════════════════ */

/** Exactly the rule inputs handed to planWave when a window was minted
 *  (null-side semantics: oversell undefined ⇒ slider not declared by the
 *  bundle; dominantDefenseFamily undefined ⇒ deep lane never engaged). */
export interface WaveRuleInputs {
  readonly incidentState: IncidentState;
  readonly dominantDefenseFamily: ThreatFamily | undefined;
  readonly oversell: { readonly ratioMicro: bigint; readonly homogeneityMicro: bigint } | undefined;
}

/** Cumulative lane-split ledger — minted per runner instance (purity law),
 *  written ONLY by the maze route step, read into observed cells each frame.
 *  `deepByFamily` is the B4 copycat witness: the hidden true-intent family of
 *  every unit the DEEP lane engaged (host-side ground truth — it never rides
 *  the wire; only its derived dominant-family shows up inside wave plans). */
export interface MazeSplitLedger {
  express: number;
  deep: number;
  readonly deepByFamily?: Partial<Record<ThreatFamily, number>> | undefined;
}

/** Score a fresh visit at arrival (the §7.10 "scored on arrival, not
 *  judged" input): 1 − source.reputation, the first-named scoring input in
 *  the spec's vocabulary. The value is ALREADY minted on the arrival stream
 *  (defaults.ts `source.reputation`) — the score consults truth, it does
 *  not roll dice. */
export function arrivalSuspicion(unit: { readonly source: { readonly reputation: Fixed } }): Fixed {
  return sub(FIXED_UNIT, unit.source.reputation);
}

/**
 * The route-slot wrapper that puts mazing on the mainline board. The stock
 * createRouteStep splits `confidence <= dial` between expressPath and
 * deepPath, but every unit arrives (and re-enters) with confidence 0 and
 * the product runner feeds no per-tick evidence — so with paths equal the
 * dial was decorative. This wrapper applies the SAME engine predicate
 * (`score > expressMaxConfidence ⇒ deep`) to the arrival score, at the
 * engine's own routing boundary:
 *
 *  · intel is armed only while the FRONT DOOR (edge) is authored to look —
 *    `inspectionDepth !== "pass-through"` on that node. A door-set
 *    `ConfigureNode edge pass-through` stops classification cold: every
 *    unit rides express (cheap, exposed). That is the "route selection
 *    honors per-node inspection depth" lever, moved by the REAL intent door.
 *  · demoted units get the deep remainder verbatim; never the express lane
 *    (D-4: "you never maze the express lane").
 *  · every fresh assignment increments the split ledger — the numbers the
 *    renderer reads as "watch the ratio of motes taking each lane".
 *
 * Pure over (input, ledger): same seed + same intents ⇒ same frames.
 */
export function createMazeRouteStep(
  base: TickStep<RouteIn, RouteOut>,
  law: Readonly<{
    frontDoor: EntityId;
    deepPath: readonly EntityId[];
    split: MazeSplitLedger;
  }>,
): TickStep<RouteIn, RouteOut> {
  return (input) => {
    const preHops = new Map<string, number>();
    for (const unit of input.units) preHops.set(String(unit.id), unit.routeHops.length);

    const routed = base(input).units;
    const door = input.nodes.get(law.frontDoor);
    const armed = door !== undefined && door.inspectionDepth !== "pass-through";

    const units = routed.map((unit) => {
      if (preHops.get(String(unit.id)) !== 0) return unit; // in-flight: lane untouched
      if (armed && arrivalSuspicion(unit) > input.expressMaxConfidence) {
        law.split.deep += 1;
        // B4 copycat input: the deep lane's engaged-family census (hidden
        // truth read host-side; benign intents contribute nothing).
        const census = law.split.deepByFamily;
        const family = threatFamilyOfIntent(unit.trueIntent);
        if (census !== undefined && family !== null) {
          census[family] = (census[family] ?? 0) + 1;
        }
        return Object.freeze({ ...unit, routeHops: Object.freeze([...law.deepPath]) });
      }
      law.split.express += 1;
      return unit;
    });
    return Object.freeze({ units: Object.freeze(units) });
  };
}

const PIPELINE_CONFIG: Omit<DefaultPipelineConfig, "runSeed"> = Object.freeze({
  dnsNodeId: null,
  // §7.10 fork: express = front door → WAF tier → service; deep = front door
  // → slow inspection terminal (containment; hot traffic never pays for
  // reaching origin, benign FPs routed there cost conversion — the ache).
  expressPath: Object.freeze([NODE_EDGE, NODE_WAF, NODE_ORIGIN]),
  deepPath: Object.freeze([NODE_EDGE, NODE_DEEP]),
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

/* ═══════════════════════════ adapter helpers ═══════════════════════════ */

function clampUnit(value: Fixed): Fixed {
  if (value < FIXED_ZERO) return FIXED_ZERO;
  if (value > FIXED_UNIT) return FIXED_UNIT;
  return value;
}

/** Fail-loud narrowing from the sim-core `ObservedCell<unknown>` union into
 *  the protocol's `CellValue` (bigint|number|string|null). Anything else is a
 *  contract breach at the boundary, not something to hide. */
function narrowCellValue(key: ObservedKey, value: unknown): CellValue | null {
  if (value === null) return null;
  const kind = typeof value;
  if (kind === "bigint" || kind === "number" || kind === "string") return value as CellValue;
  throw new Error(`SimCoreRunner: observed cell "${key}" carries non-wire value type "${kind}"`);
}

function toProtoCell(key: ObservedKey, cell: ObservedCell<unknown>): ProtoCell {
  return Object.freeze({
    value: narrowCellValue(key, cell.value),
    fidelity: cell.fidelity,
    freshnessUs: cell.freshnessUs,
    coverage: cell.coverage,
    certainty: cell.certainty,
    status: cell.status,
  });
}

/** Honest arrival accounting (F2): the driver mints retry/referral/return
 *  re-entries BETWEEN steps — they join the roster directly and mint NO
 *  arrival event, so counting step-1 events alone reads a retry storm as a
 *  calm lane. "Units that entered this tick" = arrival events (organic) plus
 *  every unit NEW to the roster without an arrival event (re-entered); the
 *  outcome stream is unioned in so a unit that enters and terminates within
 *  one tick is still seen. Pure over id sets — real ticks and synthetic
 *  fixtures alike flow through the same law. CAVEAT: this is a LANE-BLIND
 *  placeholder aggregate (the runner owns exactly one lane); multi-lane
 *  boards need per-node attribution before reuse. */
export function partitionLaneEntries(input: {
  readonly priorUnitIds: ReadonlySet<EntityId>;
  readonly arrivalUnitIds: ReadonlySet<EntityId>;
  readonly currentUnitIds: ReadonlySet<EntityId>;
  readonly outcomeUnitIds: ReadonlySet<EntityId>;
}): { readonly organic: number; readonly reentered: number } {
  let reentered = 0;
  for (const id of input.currentUnitIds) {
    if (input.priorUnitIds.has(id)) continue;
    if (input.arrivalUnitIds.has(id)) continue;
    reentered += 1;
  }
  for (const id of input.outcomeUnitIds) {
    if (input.priorUnitIds.has(id)) continue;
    if (input.arrivalUnitIds.has(id)) continue;
    if (input.currentUnitIds.has(id)) continue; // counted above
    reentered += 1;
  }
  return Object.freeze({ organic: input.arrivalUnitIds.size, reentered });
}

/** Exact integer counter cell (maze split totals) — the G3-exact shape:
 *  the renderer sees "metered-exact", not a derived 80%-coverage Fixed. */
function countCell(value: number): ObservedCell<unknown> {
  return Object.freeze({
    value,
    fidelity: ResolutionBand.Exact,
    freshnessUs: 0n,
    coverage: FIXED_UNIT,
    certainty: FIXED_UNIT,
    status: "live" as const,
  });
}

function derivedCell(value: Fixed): ObservedCell<Fixed> {
  // Derived (not metered) truth: Fine band, 80% coverage/certainty — the
  // renderer must be able to SEE that these are computed aggregates.
  return Object.freeze({
    value,
    fidelity: ResolutionBand.Fine,
    freshnessUs: 0n,
    coverage: fromRatio(4n, 5n),
    certainty: fromRatio(4n, 5n),
    status: "live" as const,
  });
}

const NOTICE_FOR_TERMINAL = Object.freeze({
  served: null, // at nominal, instruments are still
  bounced: "bounce",
  "blocked-false-positive": "false-positive",
  landed: "landed",
} as const) satisfies Record<Outcome["terminal"], EventNotice["kind"] | null>;

/* ═══════════════════════════ the runner ═══════════════════════════ */

export interface SimCoreRunnerOptions {
  /** Deterministic run seed (whole number; the worker boot message carries it). */
  readonly seed: number;
  /** Emission cadence divisor at 1× — 100ms = 10Hz protocol cap (§7.0). */
  readonly tickRealMs?: number;
  /** TEST SEAM (F2 arrival honesty): force every wave envelope's label to one
   *  family so benign bounces can form real retry storms. Shipped g1 content
   *  is mostly adversarial — neutralized units never re-enter — so without
   *  this knob the driver's between-steps re-entry mint is unobservable in
   *  tests. The override also DISARMS the bundle familyMix dice (audit fix 3):
   *  the seam means "force one family", and with the mix table off the arrival
   *  stream is byte-identical to the pre-mix era (envelope label decides).
   *  Unset keeps the shipped dice; the wire itself gains one always-zero
   *  additive cell (`reentryRatePerMin`) from the F2 split, which every pre-F2
   *  consumer reads as absent-0. */
  readonly familyOverride?: WaveEnvelope["dominantFamily"];
  /** TEST SEAM (B4): swap the wave table the schedule is built from — the
   *  feint-liveness proof plants a marker in an otherwise-shipped slice.
   *  Absent ⇒ the shipped g1 shared-web slice (SHARED_WEB_G1_TABLE). */
  readonly table?: WaveTable;
}

export class SimCoreRunner implements SimRunner {
  readonly runnerId = "sim-core" as const;
  readonly engineVersion = "hh-sim-core-adapter v0 (pipeline+observed)";

  private readonly runSeed: RunSeed;
  private readonly driver: TickDriver;
  private readonly store: ObservedStore;
  /* ── B4 wave-rules host inputs (per-instance, purity law covers plans) ──
   *  The shipped g1 slice's waves are planned LAZILY at window entry, each
   *  with the host signals live AT THAT MINUTE (incident state, deep-lane
   *  family census, QoS homogeneity). RNG inputs (waveStream + director
   *  chain) are keyed only by (seed, n, cursor) and precomputed in the
   *  constructor, so deferral changes WHEN a draw happens, never WHAT. */
  private readonly table: WaveTable;
  private readonly windows: readonly WaveWindowSpec[];
  private readonly directorChain: readonly DirectorState[];
  private readonly oversellDeclared: boolean;
  private readonly familyOverride: WaveEnvelope["dominantFamily"] | undefined;
  private readonly plans = new Map<number, WavePlan>();
  private readonly envelopes = new Map<number, WaveEnvelope>();
  /** Witness of the rule inputs each lazy plan actually rode (B4 liveness). */
  private readonly ruleInputs = new Map<number, WaveRuleInputs>();
  private incidentClock: IncidentClock = INITIAL_INCIDENT_CLOCK;
  private game: GameState;
  private lanes: ReadonlyMap<EntityId, LaneStats>;
  private aggression: Fixed = fromRatio(5n, 10n);
  /** §7.10 suspicion dial = TickInputs.expressMaxConfidence (Fixed 0…1).
   *  Slider arm "dial" moves it; the maze route step compares every arrival
   *  score against it. Default 0.8 ⇒ roughly the hottest fifth of traffic
   *  (reputation < 0.2) walks the deep lane while the door is armed. */
  private dial: Fixed = fromRatio(8n, 10n);
  /** Lane-split totals (minted per instance — the purity law covers ledgers). */
  private readonly split: MazeSplitLedger = { express: 0, deep: 0, deepByFamily: {} };
  private readonly intentLog: PlayerIntent[] = [];
  /** Door schedule: intents stamped for the next headlessStep, fed EXACTLY once. */
  private pendingDoorIntents: ExternalIntent[] = [];
  private counters = { served: 0, bounced: 0, blockedFalsePositive: 0, landed: 0 };
  /* ── money lane (per-instance, purity law covers the ledger) ── */
  private readonly ecoCfg: EconomyConfig;
  private readonly contractsBook: ReadonlyMap<EntityId, Contract>;
  private econ: EconomyState;
  /** Review-F4 refusal census (test-visible via economyInvoiceRefusals()). */
  private invoiceRefusals = 0;
  private seq = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private speedX: 1 | 2 | 4 = 1;
  private readonly baseTickMs: number;

  constructor(options: SimCoreRunnerOptions) {
    if (!Number.isInteger(options.seed) || options.seed < 0) {
      throw new Error(`SimCoreRunner: seed must be a non-negative integer, got ${options.seed}`);
    }
    this.runSeed = asRunSeed(BigInt(options.seed));
    this.baseTickMs = options.tickRealMs ?? 100;

    const clocks: ClockState = initialClocks();
    this.game = createInitialState({
      runSeed: this.runSeed,
      engineVersion: this.engineVersion,
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "adapter-sheets-v0", ruleBookHash: "" },
      clocks,
      nodes: [
        // Shared front door — its AUTHORED depth arms/disarms the arrival
        // classifier (see createMazeRouteStep); door-settable posture.
        mkNode(NODE_EDGE, 2, MICROS_PER_MIN, "sample-1-in-20", NODE_ORIGIN),
        // Express defense tier — pass-through at boot, the door can deepen
        // it (inspect/challenge) into a real ROC on the fast lane.
        mkNode(NODE_WAF, 2, 30_000_000n, "pass-through", null),
        // Deep lane — slow by law (§7.10 "the slow lane is made of depth"),
        // terminal: hot traffic is contained here, never reaches origin.
        mkNode(NODE_DEEP, 4, 90_000_000n, "inspect", null),
        mkNode(NODE_ORIGIN, 1, MICROS_PER_MIN, "pass-through", null),
      ],
      lanes: [this.zeroLane()],
      contracts: [CONTRACT],
      // §7.5 action economy: two hands (T2 staff) — the door pays verbs here.
      handCapacity: 2,
    });
    this.lanes = this.game.lanes;

    const config: DefaultPipelineConfig = Object.freeze({
      ...PIPELINE_CONFIG,
      runSeed: this.runSeed,
      // Audit fix 3: the dice roll the bundle's mix — unless the test seam
      // forces a single family (then the stream stays pre-mix byte-identical).
      ...(options.familyOverride === undefined ? { familyMix: FAMILY_MIX } : {}),
    });
    const baseSlots = createDefaultSlots(config);
    const slots = Object.freeze({
      ...baseSlots,
      // The sanctioned composition seam (mirrors gates/g3): swap ONE slot.
      route: createMazeRouteStep(baseSlots.route, {
        frontDoor: NODE_EDGE,
        deepPath: PIPELINE_CONFIG.deepPath,
        split: this.split,
      }),
    });
    this.driver = createTickDriver(slots, streamFor(this.runSeed, "root", 0), this.game.context.clocks);
    this.store = new ObservedStore();

    // Money lane priming (mirrors fastForward's register-fold): opening float
    // + one ContractEconomy/error-budget record per book entry.
    this.ecoCfg = defaultEconomyConfig();
    this.contractsBook = Object.freeze(
      new Map<EntityId, Contract>(MONEY_CONTRACTS.map((contract) => [contract.id, contract])),
    );
    this.econ = primeEconomy(this.ecoCfg);

    /* B4: shipped g1 slice on the wire. Director chain + window schedule are
     * precomputed exactly like fastForward.buildWaveWindows (logged-input law
     * R-31), so a lazy per-wave plan is bit-identical to an eager one. */
    this.table = options.table ?? SHARED_WEB_G1_TABLE;
    this.familyOverride = options.familyOverride;
    this.windows = planWaveWindowSchedule(this.table, WAVE_START_MINUTE);
    this.oversellDeclared = bundleDeclaresOversellSlider(JSON.parse(sharedWebBundleRaw));
    const chain: DirectorState[] = [];
    let director: DirectorState = INITIAL_DIRECTOR_STATE;
    for (const w of this.windows) {
      director = directorPropose(director, BigInt(w.cursor), streamFor(this.runSeed, "director", w.cursor)).next;
      chain.push(director);
    }
    this.directorChain = Object.freeze(chain);
  }

  /** Lazily plan + label window `w` with the host signals LIVE AT ENTRY.
   *  Memoized per wave number — the first covering minute mints it once. */
  private envelopeFor(spec: WaveWindowSpec): WaveEnvelope {
    const cached = this.envelopes.get(spec.n);
    if (cached !== undefined) return cached;
    const plan = this.planMemo(spec);
    const envelope =
      this.familyOverride === undefined
        ? plan.waveEnvelope
        : Object.freeze({ ...plan.waveEnvelope, dominantFamily: this.familyOverride });
    this.envelopes.set(spec.n, envelope);
    return envelope;
  }

  /** The §2.24 wiring point: every host-derived rule input rides THIS call.
   *  incidentState "quiet" is engine-inert (absent ≙ quiet), dominantDefense-
   *  Family is omitted until the deep lane has engaged a family, and oversell
   *  is supplied only when the bundle declares the slider (OD-24). */
  private planWaveFor(spec: WaveWindowSpec): WavePlan {
    const lane = this.lanes.get(LANE_ID);
    const dominant = dominantFamilyOfCensus(this.split.deepByFamily ?? {});
    const oversell = this.oversellDeclared
      ? Object.freeze({
          ratioMicro: OVERSELL_RATIO_MICRO,
          homogeneityMicro: homogeneityMicroFromClassMix(lane?.classMix ?? {}),
        })
      : undefined;
    const incident = incidentStateOf(this.incidentClock);
    this.ruleInputs.set(
      spec.n,
      Object.freeze({ incidentState: incident, dominantDefenseFamily: dominant, oversell }),
    );
    return planWave(this.table, spec.n, {
      startMinute: spec.cursor,
      tick: BigInt(spec.cursor),
      rng: waveStream(this.runSeed, spec.n, spec.cursor),
      director: this.directorChain[spec.index] as DirectorState,
      ledger: ledgerSnapshot([], 0n),
      invitations: buildInvitations({}),
      entropyForecastPurchased: false,
      pressureParams: PRESSURE,
      incidentState: incident,
      ...(dominant === undefined ? {} : { dominantDefenseFamily: dominant }),
      ...(oversell === undefined ? {} : { oversell }),
    });
  }

  /** The fastForward envelope law (sim-core unattended): a window is active
   *  at `minute` iff minute ∈ [plan.startMinute, plan.startMinute + authored
   *  window) — plan.startMinute being the PLACEMENT-DRAW result, not the
   *  cursor. Minting triggers the first time the cursor minute is reached,
   *  so overlapping placements can legitimately feed two envelopes (the
   *  arrival step fans every active envelope; the quarter builds). */
  private envelopesAtMinute(minute: number): readonly WaveEnvelope[] {
    const active: WaveEnvelope[] = [];
    for (const w of this.windows) {
      if (minute < w.cursor) continue; // not entered yet — never mint early
      const plan = this.planMemo(w);
      if (minute >= plan.startMinute && minute < plan.startMinute + w.windowMinutes) {
        active.push(this.envelopeFor(w));
      }
    }
    return Object.freeze(active);
  }

  private planMemo(spec: WaveWindowSpec): WavePlan {
    const cached = this.plans.get(spec.n);
    if (cached !== undefined) return cached;
    const plan = this.planWaveFor(spec);
    this.plans.set(spec.n, plan);
    return plan;
  }

  /** B4 witnesses (tests / future HUD explain chains): plans mint LAZILY at
   *  window entry, so a wave not yet reached reads undefined — never a lie. */
  wavePlan(n: number): WavePlan | undefined {
    return this.plans.get(n);
  }

  waveEnvelopes(): ReadonlyMap<number, WaveEnvelope> {
    return this.envelopes;
  }

  incidentState(): IncidentState {
    return incidentStateOf(this.incidentClock);
  }

  dominantDefenseFamily(): ThreatFamily | undefined {
    return dominantFamilyOfCensus(this.split.deepByFamily ?? {});
  }

  /** The rule inputs each minted plan actually rode (B4 liveness witness —
   *  undefined until that window's entry minute has been stepped). */
  waveRuleInputs(n: number): WaveRuleInputs | undefined {
    return this.ruleInputs.get(n);
  }

  start(emit: (projection: SimProjection) => void): void {
    if (this.timer !== null) return; // idempotent boot
    this.emitSink = emit;
    emit(this.headlessStep(this.baseTickMs));
    this.timer = setInterval(() => emit(this.headlessStep(this.baseTickMs)), this.baseTickMs / this.speedX);
  }

  /** THE intent door is open (contract #10, docs/API-REFERENCE.md §10): the
   *  driver runs `applyIntentDoor` before step 1 of every tick, so a
   *  `player-verb` intent is stamped for the NEXT macro-tick and fed EXACTLY
   *  ONCE through `TickInputs.externalIntents` — hands pay there, execute-or-
   *  refuse verdicts return as `doorReceipts` and surface on the projection
   *  as `intent-executed` / `intent-refused` notices. `configure` on a board
   *  node moves per-node inspection depth — which is what arms/disarms the
   *  §7.10 arrival classifier (front door) and sets each lane's ROC posture
   *  (waf/deep tiers). The slider arms keep direct pre-door bindings
   *  ("aggression" = ROC posture, "dial" = expressMaxConfidence). The legacy `verb`
   *  carrier stays INPUT-LOG ONLY by law: the door refuses that carrier
   *  (`unsupported-verb-carrier`), so it must never reach the schedule. */
  submit(intent: PlayerIntent): void {
    this.intentLog.push(intent);
    const payload = intent.payload;
    if (payload.kind === "slider") {
      if (payload.control === "aggression") this.aggression = clampUnit(payload.value);
      // §7.10 suspicion dial: Fixed 0…FIXED_UNIT straight into
      // expressMaxConfidence. 0 ⇒ maze everything hot; 1 ⇒ no mazing.
      else if (payload.control === "dial") this.dial = clampUnit(payload.value);
      return;
    }
    if (payload.kind === "player-verb") {
      this.pendingDoorIntents.push({ tick: this.game.context.tick + 1n, intent });
    }
  }

  /** Speed gates OBSERVATION cadence, never physics: it re-times the emit
   *  interval; per-step tick advance is untouched either way. */
  setSpeed(speedX: 1 | 2 | 4): void {
    this.speedX = speedX;
    if (this.timer === null) return;
    clearInterval(this.timer);
    this.timer = null;
    if (this.emitSink !== null) this.start(this.emitSink);
  }

  stop(): void {
    if (this.timer === null) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  /** Intents recorded this run (read-only view for the bridge/tests). */
  submittedIntents(): readonly PlayerIntent[] {
    return Object.freeze([...this.intentLog]);
  }

  /** Review-F4 insolvent-settle refusal census (test/ops visibility — a
   *  growing count means the roster is underfunded, not that physics broke). */
  economyInvoiceRefusals(): number {
    return this.invoiceRefusals;
  }

  headlessStep(_dtRealMs: number): SimProjection {
    const minute = this.game.context.minute + 1;
    /* placement-gated envelopes (fastForward law); lazily-planned waves mint
       their plan with the host signals LIVE AT WINDOW ENTRY. */
    const envelopes: readonly WaveEnvelope[] = this.envelopesAtMinute(minute);
    const due = this.pendingDoorIntents.splice(0, this.pendingDoorIntents.length);

    const inputs: TickInputs = Object.freeze({
      envelopes,
      evidence: Object.freeze([]),
      classes: CLASSES,
      dependencyEdges: DEPENDENCY_EDGES,
      retryPolicy: RETRY,
      aggression: this.aggression,
      expressMaxConfidence: this.dial,
      lanes: this.lanes,
      ...(due.length > 0 ? { externalIntents: Object.freeze(due) } : {}),
    });

    const priorUnitIds = new Set<EntityId>(this.game.units.keys());
    const result = this.driver.advance(this.game, inputs);
    this.game = result.state;

    /* step-12 observed layer: renderer-facing lane cells DERIVED FROM REAL
       driver outputs (honest entry accounting — arrival events PLUS the F2
       re-entries the driver mints between steps, worst node ρ, live QoS
       mix), sealed through the store's single-writer gate. */
    const arrivalUnitIds = new Set<EntityId>();
    for (const event of result.events) {
      if (event.kind === "arrival") arrivalUnitIds.add(event.unitId);
    }
    const entries = partitionLaneEntries({
      priorUnitIds,
      arrivalUnitIds,
      currentUnitIds: new Set<EntityId>(this.game.units.keys()),
      outcomeUnitIds: new Set<EntityId>(result.outcomes.map((outcome) => outcome.unitId)),
    });
    const ratePerMin = fromInt(entries.organic + entries.reentered);
    const health = this.laneHealthFromNodes(this.game);
    const tickUs = this.game.context.clocks.simUs;
    this.store.applyObservedWrites(
      Object.freeze([
        Object.freeze({
          key: observedKey(LANE_ID, "ratePerMin"),
          cell: derivedCell(ratePerMin),
          causeId: asCauseId(`adapter:lane-rate:${this.game.context.tick}`),
        }),
        Object.freeze({
          // Explicit organic-vs-retry split (§7.13 story): a retry storm must
          // READ differently from a traffic spike. ratePerMin above is the
          // honest total; this cell isolates the between-steps re-entry mint.
          key: observedKey(LANE_ID, "reentryRatePerMin"),
          cell: derivedCell(fromInt(entries.reentered)),
          causeId: asCauseId(`adapter:lane-reentry:${this.game.context.tick}`),
        }),
        Object.freeze({
          key: observedKey(LANE_ID, "health"),
          cell: derivedCell(health),
          causeId: asCauseId(`adapter:lane-health:${this.game.context.tick}`),
        }),
        /* §7.10 lane-split cells — "watch the ratio of motes taking each
           lane": cumulative arrival routings by lane + the classifier's
           armed flag (0/1), so a flat deep-count is READABLE as "the door
           stopped looking", not as "nobody is hot". */
        Object.freeze({
          key: observedKey(LANE_ID, "routedExpress"),
          cell: countCell(this.split.express),
          causeId: asCauseId(`adapter:maze:${this.game.context.tick}:exp`),
        }),
        Object.freeze({
          key: observedKey(LANE_ID, "routedDeep"),
          cell: countCell(this.split.deep),
          causeId: asCauseId(`adapter:maze:${this.game.context.tick}:deep`),
        }),
        Object.freeze({
          key: observedKey(LANE_ID, "mazeArmed"),
          cell: countCell(this.edgeIsArmed(this.game)),
          causeId: asCauseId(`adapter:maze:${this.game.context.tick}:armed`),
        }),
      ]),
      tickUs,
    );
    const merged = new Map(this.game.observed);
    for (const [key, cell] of this.store.toObservedMap()) merged.set(key, cell);
    this.game = Object.freeze({ ...this.game, observed: Object.freeze(merged) });

    /* ── money lane (REST-PROTO-FINAL, 45f0edf handoff #1) ──────────────
       runEconomyTick on the driver's business clock, seeded dunning rolls,
       company-wide outage reading of landed breaches. The tick's own
       observedWrites (fix-economy @57ea80e: today `company::reputation`,
       publish-on-change so quiet ticks ship an empty batch) go through the
       SAME single-writer store, then the observed map is re-merged this tick
       — without that second pass chrome would keep '?' reputation cells for
       the frame the score moved. Same-tick watermark is legal (store allows
       equal tickUs). Cash + ledger seq mirror into GameState exactly like
       fastForward's withCashMirror: the ledger becomes the money authority
       the projection reads (the pre-lane `cash.free` was a createInitialState
       placeholder that never moved). */
    const landedThisTick = result.outcomes.reduce(
      (acc, outcome) => (outcome.terminal === "landed" ? acc + OUTAGE_SECONDS_PER_LANDED : acc),
      0n,
    );
    const outage =
      landedThisTick === 0n
        ? null
        : Object.freeze(new Map<EntityId, bigint>([...this.contractsBook.keys()].map((id) => [id, landedThisTick])));
    const economyNotices: EconomyNotice[] = [];
    try {
      const out = runEconomyTick(
        Object.freeze({
          context: this.game.context,
          runSeed: this.runSeed,
          contracts: this.contractsBook,
          prior: this.econ,
          cfg: this.ecoCfg,
          dunningEngineOwned: false,
          ...(outage === null ? {} : { outageSecs: outage }),
        }),
      );
      this.econ = out.state;
      economyNotices.push(...out.notices);
      if (out.observedWrites.length > 0) {
        this.store.applyObservedWrites(out.observedWrites, tickUs);
        const remerged = new Map(this.game.observed);
        for (const [key, cell] of this.store.toObservedMap()) remerged.set(key, cell);
        this.game = Object.freeze({ ...this.game, observed: Object.freeze(remerged) });
      }
    } catch (err) {
      if (!(err instanceof RangeError) || !NEGATIVE_BUCKET_LAW.test(err.message)) throw err;
      this.invoiceRefusals += 1; // prior econ kept; the invoice retries next tick
    }
    this.game = Object.freeze({
      ...this.game,
      cash: this.econ.cash,
      ledgerSeq: this.econ.journal.nextSeq,
    });

    /* counters + notices from the REAL outcome stream. Surge reads the HONEST
       entry total (organic + re-entries): a retry storm flooding the lane IS a
       surge — that blindness was the F2 bug this fix retires. */
    const notices: EventNotice[] = [];
    const incidentLosses = { bounced: 0, landed: 0 };
    if (entries.organic + entries.reentered >= 3) {
      notices.push({ kind: "arrival-surge", laneId: LANE_ID, atUs: tickUs });
    }
    /* door verdicts ride the same seam (contract #10 receipts): one notice
       per fed intent, detail "<verb>" executed / "<verb>: <reason>" refused. */
    for (const receipt of result.doorReceipts) {
      notices.push({
        kind: receipt.outcome === "executed" ? "intent-executed" : "intent-refused",
        laneId: null,
        atUs: tickUs,
        detail: receipt.reason === null ? receipt.verb : `${receipt.verb}: ${receipt.reason}`,
      });
    }
    for (const outcome of result.outcomes) {
      const terminal = outcome.terminal;
      if (terminal === "served") this.counters.served += 1;
      else if (terminal === "bounced") this.counters.bounced += 1;
      else if (terminal === "blocked-false-positive") this.counters.blockedFalsePositive += 1;
      else this.counters.landed += 1;
      /* B4 incident fold: losses THIS minute feed the rolling clock the next
         lazy wave plan reads (a landed breach is an incident on sight; two
         losses inside the window make one together). */
      if (terminal === "bounced") incidentLosses.bounced += 1;
      else if (terminal === "landed") incidentLosses.landed += 1;
      const noticeKind = NOTICE_FOR_TERMINAL[terminal];
      if (noticeKind !== null) {
        notices.push({ kind: noticeKind, laneId: LANE_ID, atUs: outcome.atUs });
      }
    }
    this.incidentClock = stepIncidentClock(this.incidentClock, incidentLosses);
    for (const firing of result.ruleFirings) {
      void firing;
      notices.push({ kind: "rule-fired", laneId: null, atUs: tickUs });
    }
    /* Money-lane roll-up (protocol NoticeKind "economy-notice"): one wire
       notice per EconomyNotice the tick emitted, detail carrying the
       engine-kind + contract so chrome/i18n consumers split on the first
       colon without a 25-member union crossing the seam. Order = engine
       order (deterministic). */
    for (const notice of economyNotices) {
      notices.push({
        kind: "economy-notice",
        laneId: null,
        atUs: tickUs,
        detail: `${notice.kind}:${notice.contractId}`,
      });
    }

    /* next tick's lane input: aggregates of THIS ground truth (the default
       state-economics step passes lanes through; derivation is the caller's
       observed-layer job, so it lives in this adapter). */
    this.lanes = Object.freeze(
      new Map<EntityId, LaneStats>([
        [
          LANE_ID,
          Object.freeze({
            laneId: LANE_ID,
            ratePerMin,
            latencyDistributionRef: LAG_TABLE_REF,
            classMix: this.classMixFromUnits(this.game),
            health,
          }),
        ],
      ]),
    );

    this.seq += 1;
    const observed = new Map<ObservedKey, ProtoCell>();
    for (const [key, cell] of this.game.observed) observed.set(key, toProtoCell(key, cell));

    return Object.freeze({
      seq: this.seq,
      tick: this.game.context.tick,
      minute: this.game.context.minute,
      clocks: this.game.context.clocks,
      lanes: Object.freeze([...this.lanes.values()]),
      observed,
      notices: Object.freeze(notices),
      counters: Object.freeze({ ...this.counters }),
      freeCashMicroUsd: this.game.cash.free,
    });
  }

  /* ═══════════════════════ internals ═══════════════════════ */

  private emitSink: ((projection: SimProjection) => void) | null = null;

  private zeroLane(): LaneStats {
    return Object.freeze({
      laneId: LANE_ID,
      ratePerMin: FIXED_ZERO,
      latencyDistributionRef: LAG_TABLE_REF,
      classMix: Object.freeze({}),
      health: FIXED_UNIT,
    });
  }

  /** Classifier posture reader (0/1 for the wire): the front door sees
   *  traffic only while its (door-settable) inspection depth is not
   *  pass-through — the exact law createMazeRouteStep applies. */
  private edgeIsArmed(state: GameState): number {
    const door = state.nodes.get(NODE_EDGE);
    return door !== undefined && door.inspectionDepth !== "pass-through" ? 1 : 0;
  }

  /** Worst-node saturation → headroom: health = clamp(1 − max ρ). ρ is a
   *  ground-truth node stamp the state-economics step already observed. */
  private laneHealthFromNodes(state: GameState): Fixed {
    let worst = FIXED_ZERO;
    for (const node of state.nodes.values()) {
      if (node.utilizationRho > worst) worst = node.utilizationRho;
    }
    return clampUnit(FIXED_UNIT - worst);
  }

  /** Live-unit QoS mix (insertion order of units is part of the deterministic
   *  identity, and shares are ratios → Map-free plain record). */
  private classMixFromUnits(state: GameState): Readonly<Record<string, Fixed>> {
    const total = state.units.size;
    if (total === 0) return Object.freeze({});
    const byClass = new Map<string, number>();
    for (const unit of state.units.values()) {
      const cls = unit.qosClassId ?? "unclassified";
      byClass.set(cls, (byClass.get(cls) ?? 0) + 1);
    }
    const mix: Record<string, Fixed> = {};
    for (const key of [...byClass.keys()].sort()) {
      const count = byClass.get(key);
      if (count === undefined) continue;
      mix[key] = fromRatio(BigInt(count), BigInt(total));
    }
    return Object.freeze(mix);
  }
}
