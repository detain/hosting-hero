/**
 * The 13 default pipeline steps of the §7.13 tick shell (steps 1–12 + 12.5),
 * each a PURE `TickStep` closed only over the run configuration — never over
 * mutable state (MASTER_REPORT §4.1 "steps are pure: data-in → data-out").
 *
 * Gate-assembly waves may swap any single slot; everything here honors the
 * frozen types.ts contract. Where the contract is thinner than the mechanic
 * requires (documented per-site below) the DRIVER passes structurally-richer
 * input objects — extra fields are invisible to foreign steps, so any
 * PipelineSlots remains a legal swap-in.
 *
 * Contract deviations worked around (report, don't fix):
 *  - `PatienceCheckIn` carries no `rng` → bounce draws key off the config's
 *    runSeed directly (same R-16 key tuple, just opened here).
 *  - `PatienceCheckIn` carries no prior corruption slice and
 *    `PatienceCheckOut` no updated one → the driver hands `corruption` in
 *    and reads it back out-of-band (`PatienceCheckInExt` /
 *    `PatienceCheckOutExt`); swapped-in steps just omit the channel and the
 *    corruption machinery stays dormant.
 *  - `ServeOut` carries no units → hop progress is derived by the driver from
 *    the assignments (serviceEndUs vs simNow, blocked flag).
 *  - `BackpressureIn` carries no units/retry-depth → driver attaches
 *    `unitsById` / `retryDepthById` extension fields (subtype-safe).
 *  - Holds cross step 5→8 need unit→downstream context absent from both
 *    shapes → `UNIT_HOLD` side-table, written by defaultServeStep and read by
 *    defaultDependencyBlockStep INSIDE one synchronous driver tick (the
 *    frozen ServeOut/DependencyBlockIn shapes leave no in-band channel).
 */

import type {
  ArrivalIn,
  ArrivalOut,
  BackpressureIn,
  BackpressureOut,
  ConfidenceContribution,
  CorruptOutcome,
  CorruptionState,
  DependencyBlockIn,
  DependencyBlockOut,
  EntityId,
  Fixed,
  InspectionDepth,
  InspectIn,
  InspectOut,
  NodeRecord,
  NodeSlotRecord,
  Outcome,
  OutcomeCandidate,
  OutcomeIn,
  OutcomeOut,
  OutcomeTerminal,
  PatienceCheckIn,
  PatienceCheckOut,
  PatienceMode,
  PipelineSlots,
  QosClassifyIn,
  QosClassifyOut,
  QueueWait,
  QueueWaitIn,
  QueueWaitOut,
  RecoveryState,
  RouteIn,
  RouteOut,
  RulePhaseIn,
  RulePhaseOut,
  RunSeed,
  ScoringIn,
  ScoringOut,
  ServeIn,
  ServeOut,
  SimEvent,
  SimMinute,
  SimTick,
  SimTimeUs,
  SlotAssignment,
  StateEconomicsIn,
  StateEconomicsOut,
  TickStep,
  Unit,
  UnitDraft,
  CauseId,
  ClockState,
  ObservedCell,
  ObservedKey,
  ObservedWrite,
  JobWindow,
  JobWindowBook,
  MaintainBook,
  MaintainWindow,
  ReclaimEntry,
  ScaleBook,
  ScaleEntry,
  ShieldBook,
} from "../types.ts";
import { asCauseId, asEntityId, observedKey, ResolutionBand } from "../types.ts";
import { FIXED_SCALE, FIXED_UNIT, FIXED_ZERO, clampUnit, fromRatio, mul, sub } from "../kernel/fixed.ts";
import { streamFor } from "../kernel/rng.ts";
import { MICROS_PER_MIN } from "../kernel/time.ts";
import {
  familyToIntent,
  type FamilyMixEntry,
  fracRawOfUnit,
  isAdversarialIntent,
  mulUsFixed,
  rollUnder,
  slotsNeeded,
  sortedIds,
  validateFamilyMix,
  weightedFamilyOf,
  wholeOf,
  withUnit,
} from "./internal.ts";
import { bounceProbability, patienceRatioBps } from "./bounce.ts";
import { DEFAULT_KNEE_RHO, effectiveRho, hockeyStickWaitUs, makeSlots, utilization } from "./queue.ts";
import { shieldBusinessMinuteOf, nodeShielded } from "./corruption.ts";
import { voidedByTombstone } from "./reclaim.ts";

/* ═══════════════════════ Extension inputs (driver-supplied) ═════════════════ */

/** BackpressureIn + lineage context the retry rules need. */
export interface BackpressureInExt extends BackpressureIn {
  readonly unitsById: ReadonlyMap<EntityId, Unit>;
  /** Current retry-generation of each live unit (0 = first visit). */
  readonly retryDepthById: ReadonlyMap<EntityId, number>;
}

/** OutcomeIn + unit context for intent resolution at the terminals. */
export interface OutcomeInExt extends OutcomeIn {
  readonly unitsById: ReadonlyMap<EntityId, Unit>;
}

/* ═══════════════════════════ Step configuration ═══════════════════════════ */

export interface DefaultPipelineConfig {
  /** Bounce/backoff draws in contract inputs WITHOUT an rng handle key off
   *  this seed directly (PatienceCheckIn friction — see module header). */
  readonly runSeed: RunSeed;
  /** DNS pre-board first hop (R-05): null disables it. Must exist in nodes. */
  readonly dnsNodeId: EntityId | null;
  /** Low-suspicion lane and the deep-inspection lane (express never maze —
   *  D-4). Node ids must exist in the board. */
  readonly expressPath: readonly EntityId[];
  readonly deepPath: readonly EntityId[];
  /** v0 synthetic population defaults until the bundle loader feeds real
   *  per-type patience/size (loader wave owns that; arrival only drafts). */
  readonly defaultPatienceUs: SimTimeUs;
  readonly defaultSizeCost: Fixed;
  /** Uniform patience jitter ± this percent (0…50). */
  readonly patienceJitterPct: number;
  /** Per-depth latency stamps (R-08): µs charged to inspectionCostUs. */
  readonly inspectionCostUs: Readonly<Record<InspectionDepth, SimTimeUs>>;
  /** ROC knobs (R-52: the aggression slider moves these, never a damage
   *  number): P(block) = aggression × ratio for the intent class. */
  readonly detectionRatio: Fixed;
  readonly falsePositiveRatio: Fixed;
  /** Served-customer viral loop: P(referral draft), P(return-visit draft). */
  readonly referralProbability: Fixed;
  readonly returnProbability: Fixed;
  /** AUDIT FIX 3 (heading 11385): the bundle's threats.familyWeights table,
   *  normalized by waves.parseFamilyWeightsTable. When set, every minted
   *  unit draws its family on the arrival stream (one roll after
   *  sourceBucket) and carries it as trueIntent — the traffic mix IS the
   *  bundle's contract, not just the envelope's single dominantFamily label.
   *  Absent ⇒ no roll, no stream-shape change, byte-identical arrivals. */
  readonly familyMix?: readonly FamilyMixEntry[];
  /** AUDIT FIX (g09/g11: "loader closes a 7-mode patience enum… engine
   *  implements only sigmoid-budget"): R25 per-type patience MODES, keyed by
   *  `Unit.type` (the bundle tableId the arrival step stamps). Presence-
   *  gated like the batch-B rules: absent/empty ⇒ every type keeps today's
   *  LUT path, byte-identical. Semantics per mode in the step-9 docstring. */
  readonly patienceModeByType?: Readonly<Record<string, PatienceMode>>;
  /** §3.1 corrupts-mode damage dial (v0): P(the exhaustion die corrupts the
   *  completed response). Default FIXED_UNIT — certainty SKIPS the roll
   *  entirely (the bounce-gate pattern), so an authored `corrupts` row
   *  corrupts EVERY patience-exhausted completion without ever consulting
   *  entropy. Sub-certainty answers draw ONE per exhausted unit on a NEW
   *  per-unit-key "corrupt" stream (never the "bounce" stream — zero blast
   *  radius). 0 ⇒ every mark resolves will-corrupt = false: the unit behaves
   *  exactly like `resident` while still recording the exhaustion.
   *  Absent ⇒ FIXED_UNIT; no corrupts row ⇒ the dial is never read. */
  readonly corruptionProbability?: Fixed;
  /** AUDIT FIX (g09 TOP-PROBLEM #2: "populationEffect is a lying field"):
   *  the Population Effect feedback curve (§2.13 "The Population Effect" /
   *  Herding / Empty Server Spiral), keyed by `Unit.type`. The host derives
   *  each row from LoadedVisitor when `populationEffect && herdingEnabled`
   *  (coefficient = herdingCoefficient; floor = authored capacity anchor).
   *  The coefficient is SIGNED — one parameter carries the whole curve:
   *  • positive 0..1 Fixed → REPEL half: below the floor each candidate
   *    rolls a disgust draw (the shipped spiral, audit g09).
   *  • negative -1..0 Fixed → ATTRACT half: above the floor each candidate
   *    rolls a cohort-gravity draw; on success ONE bonus unit mints beside
   *    it (population attracts population, word-of-mouth). Magnitude =
   *    pull strength, p grows linearly with the surplus over the floor.
   *  • zero → inert (the row rolls nothing in either direction).
   *  Absent/empty ⇒ zero draws, byte-identical arrivals. The loader already
   *  tolerates a negative herding.coefficient (toFixed/decimalRatioFromText
   *  accept the sign; only assertFixedDomain bounds it), so the host pipes
   *  herdingCoefficient through untouched. */
  readonly populationEffects?: Readonly<
    Record<string, { readonly coefficient: Fixed; readonly floor: number }>
  >;
}

/* ═══════════════════════════ Step 1 · Arrival ═══════════════════════════ */

/** Envelope rate → whole + fractional units this sim-minute; the fraction is
 *  one Bernoulli on the "arrival" stream (exact Fixed comparison). Ids are
 *  minted `${tableId}@${tick}#${envelopeIndex}.${unitIndex}` — unique across
 *  the run because the tick embeds. The population ATTRACT half mints cohort
 *  bonuses with unitIndex continuing past the envelope's authored count
 *  (`count + bonusSequence`) — same grammar, same uniqueness, ordinary
 *  "arrival" events (the frozen SimEvent union gains no new kind).
 *
 *  ⚠ CONSUMER NOTE (F2): retry/referral re-entries do NOT flow through this
 *  step. The driver mints their ids (`re<n>@${tick}`) and appends matured
 *  drafts straight into the roster BETWEEN steps — no arrival envelope, no
 *  arrival events, and the re-entry delay is the backoff schedule (≥1 tick,
 *  arbitrary multiples). Arrival-counting consumers therefore miss retry
 *  storms; count `SimEvent` arrivals or roster growth, not this step alone.
 *
 *  ⚠ CONSERVATION NOTE (population halves): the envelope-rate law (Σ
 *  ratePerMin ≈ minted arrivals) is APPROXIMATE, by design, once a
 *  `populationEffects` row is configured for a table — the repel half mints
 *  FEWER units than the envelope authored (skipped candidates), the attract
 *  half mints MORE (cohort bonuses beside surviving candidates). Absent/
 *  empty config ⇒ exact-rate behavior, every golden kept. */
/** Driver-stamped extension of the frozen ArrivalIn: the count of units
 *  ALREADY in the system when this tick's arrivals are drawn (pre-tick
 *  roster + matured re-entries). Invisible to foreign steps; read ONLY when
 *  the host configured `populationEffects` (presence gate) — it judges both
 *  halves of the curve: below the floor the herd repels, above it the herd
 *  attracts. */
export interface ArrivalInExt extends ArrivalIn {
  readonly inFlightUnits?: number;
}

/** Boundary parse (Laws 2/4): closed-key Map with every row validated once
 *  — coefficient a SIGNED Fixed in [-1, 1] (positive repels below the floor,
 *  negative attracts above it, 0 inert), floor a positive safe integer. An
 *  empty/absent table returns an empty Map: the step then never reads
 *  `inFlightUnits` and never rolls. */
function parsePopulationEffects(
  table: DefaultPipelineConfig["populationEffects"],
): ReadonlyMap<string, { readonly coefficient: Fixed; readonly floor: number }> {
  const out = new Map<string, { readonly coefficient: Fixed; readonly floor: number }>();
  if (table === undefined) return out;
  for (const type of Object.keys(table).sort()) {
    const row = table[type] as { readonly coefficient: Fixed; readonly floor: number };
    if (typeof row.coefficient !== "bigint" || row.coefficient < -FIXED_UNIT || row.coefficient > FIXED_UNIT) {
      throw new Error(`arrival: populationEffects["${type}"].coefficient must be a signed Fixed in -1..1 (positive repels below the floor, negative attracts above it), got ${String(row.coefficient)}`);
    }
    if (!Number.isSafeInteger(row.floor) || row.floor < 1) {
      throw new Error(`arrival: populationEffects["${type}"].floor must be a positive safe integer (the herd anchor population), got ${String(row.floor)}`);
    }
    out.set(type, Object.freeze({ coefficient: row.coefficient, floor: row.floor }));
  }
  return out;
}

export function createArrivalStep(
  config: Pick<
    DefaultPipelineConfig,
    "defaultPatienceUs" | "defaultSizeCost" | "patienceJitterPct" | "familyMix" | "populationEffects"
  >,
): TickStep<ArrivalIn, ArrivalOut> {
  if (config.patienceJitterPct < 0 || config.patienceJitterPct > 50) {
    throw new Error(`arrival: patienceJitterPct must be 0..50, got ${config.patienceJitterPct}`);
  }
  const mix = config.familyMix;
  if (mix !== undefined) validateFamilyMix(mix);
  const population = parsePopulationEffects(config.populationEffects);
  const jitterSpread = 2 * config.patienceJitterPct + 1;
  return (input: ArrivalIn): ArrivalOut => {
    const { context, envelopes, rng } = input;
    const inFlight = (input as ArrivalInExt).inFlightUnits;
    if (population.size > 0 && inFlight === undefined) {
      throw new Error(
        "arrival: populationEffects configured but the input carries no inFlightUnits — run through createTickDriver (it stamps the channel) or feed the step a stamped window",
      );
    }
    const units: Unit[] = [];
    const events: SimEvent[] = [];
    for (let e = 0; e < envelopes.length; e += 1) {
      const envelope = envelopes[e];
      if (envelope === undefined) continue;
      let count = Math.max(0, wholeOf(envelope.ratePerMin));
      const frac = fracRawOfUnit(envelope.ratePerMin);
      if (frac > 0n && rollUnder(frac, rng.nextU32())) count += 1;
      /* Mint closure — one candidate unit, rolls in the fixed order
         jitter → sourceBucket → family → reputation. Authored candidates AND
         attracted cohort bonuses mint through this SAME path, so a bonus unit
         is diegetically indistinguishable from an envelope arrival (frozen
         SimEvent union — kind "arrival", no new event kinds). */
      const mintUnit = (unitIndex: number): void => {
        const unitId = asEntityId(`${envelope.tableId}@${context.tick}#${e}.${unitIndex}`);
        const jitterPct = jitterSpread === 1 ? 100 : 100 - config.patienceJitterPct + rng.range(jitterSpread);
        const sourceBucket = rng.range(1024);
        // familyMix die (audit fix 3): rolled ONLY when the bundle authors a
        // weighted table — absent keeps the stream position byte-identical.
        const drawnFamily = mix === undefined ? envelope.dominantFamily : weightedFamilyOf(mix, rng.range(1_000_000));
        units.push(
          Object.freeze({
            id: unitId,
            type: envelope.tableId,
            sizeCost: config.defaultSizeCost,
            patienceUs: (config.defaultPatienceUs * BigInt(jitterPct)) / 100n,
            trueIntent: familyToIntent(drawnFamily),
            source: Object.freeze({
              identity: `${envelope.tableId}:s${sourceBucket}`,
              reputation: fromRatio(BigInt(rng.range(101)), 100n),
            }),
            retryOf: null,
            arrivedAtTick: context.tick,
            accumulatedLatencyUs: 0n,
            inspectionCostUs: 0n,
            confidence: FIXED_ZERO,
            qosClassId: null,
            routeHops: [],
            waitingOn: null,
          }) satisfies Unit,
        );
        events.push(
          Object.freeze({
            kind: "arrival",
            atUs: context.clocks.simUs,
            tick: context.tick,
            causeId: asCauseId(`arrival:${envelope.tableId}:${context.tick}:${e}`),
            unitId,
            envelopeTableId: envelope.tableId,
          }) satisfies SimEvent,
        );
      };
      /* Cohort bonuses continue the unit-index numbering AFTER the authored
         count (`${e}.${count + b}`), preserving the id grammar and per-tick
         uniqueness without disturbing authored candidates' ids. */
      let bonusMints = 0;
      for (let i = 0; i < count; i += 1) {
        /* THE POPULATION LOOP (§2.13 "The Population Effect" / Herding —
           audit g09 TOP-PROBLEM #2 repel half, attract half completed this
           wave): a herding population judges the server BEFORE visiting.
           ROLL BUDGET (determinism law, auditable): each candidate consumes
           AT MOST ONE population draw on the "arrival" stream, positioned
           FIRST for the candidate — before its jitter/source rolls — and the
           two halves are disjoint by construction (sign × side-of-floor), so
           a repel-configured run can never shift an attract stream position
           and vice versa:
           • BELOW the floor, positive coefficient → disgust draw:
             p = coefficient × shortfall / floor. A hit SKIPS the candidate
             entirely (repelled visitors simply never come — no unit, no
             event; diegetically honest: you cannot observe someone who
             stayed home).
           • ABOVE the floor, negative coefficient → cohort-gravity draw:
             p = |coefficient| × surplus / floor (rollUnder clamps, so a
             surplus ≥ floor/(|coefficient|) makes the bonus certain — word-
             of-mouth saturation, honest v0). A hit mints the candidate PLUS
             ONE bonus unit brought in by the crowd. The bonus does NOT re-
             roll gravity (ONE generation per tick — the fixed budget is what
             keeps the stream position auditable; no branching process).
           • At/above floor with a positive row, or at/below floor with a
             negative row, or coefficient 0 → ZERO draws, mints unchanged.
           Retries/re-entries skip this step entirely (⚠ consumer note above). */
        const effect = population.get(envelope.tableId);
        let attracted = false;
        if (effect !== undefined && inFlight !== undefined) {
          if (effect.coefficient > FIXED_ZERO && inFlight < effect.floor) {
            const shortfall = BigInt(effect.floor - inFlight);
            const repelP = (effect.coefficient * shortfall) / BigInt(effect.floor);
            if (repelP > FIXED_ZERO && rollUnder(repelP, rng.nextU32())) continue;
          } else if (effect.coefficient < FIXED_ZERO && inFlight > effect.floor) {
            const surplus = BigInt(inFlight - effect.floor);
            const attractP = (-effect.coefficient * surplus) / BigInt(effect.floor);
            attracted = rollUnder(attractP, rng.nextU32());
          }
        }
        mintUnit(i);
        if (attracted) {
          mintUnit(count + bonusMints);
          bonusMints += 1;
        }
      }
    }
    return Object.freeze({ units: Object.freeze(units), events: Object.freeze(events) });
  };
}

/* ═══════════════════════════ Step 2 · Scoring ═══════════════════════════ */

/** Compose C = 1 − Π(1 − cᵢ) (R-03: contributions never boolean).
 *  NOTE (FIX-3): exact-multiplication commutativity does NOT survive Q16.16
 *  round-half-away — Fixed `mul` is not associative, so the fold's ORDER is
 *  part of the result. Evidence is therefore sorted into the canonical total
 *  order (unitId, metric, value) before folding: whatever permutation a
 *  producer hands over — even one carrying DUPLICATE (unitId, metric) pairs,
 *  O1 — the product per unit is identical. value is the last field of a
 *  contribution, so pairs tied on the first two keys still fall into a
 *  content-determined order, and contributions identical in every field are
 *  interchangeable under the fold. That is what makes the "evidence order
 *  cannot affect the result" claim actually true. */
export const defaultScoringStep: TickStep<ScoringIn, ScoringOut> = (input) => {
  const productByUnit = new Map<EntityId, Fixed>();
  for (const evidence of canonicalEvidenceOrder(input.evidence)) {
    const contribution: ConfidenceContribution = evidence;
    const prior = productByUnit.get(contribution.unitId) ?? FIXED_UNIT;
    productByUnit.set(contribution.unitId, mul(prior, clampUnit(sub(FIXED_UNIT, contribution.value))));
  }
  const units = input.units.map((unit) => {
    const product = productByUnit.get(unit.id);
    if (product === undefined) return unit;
    return withUnit(unit, { confidence: clampUnit(sub(FIXED_UNIT, product)) });
  });
  return Object.freeze({ units: Object.freeze(units) });
};

/** Copy of the evidence list in its canonical fold order: unitId, then
 *  metric (both code-unit, locale-free total order, §3.4), then value —
 *  O1's total tie-break. Only byte-identical contributions can still tie,
 *  and those commute through the fold, so the result is permutation-
 *  invariant for ANY input, duplicate (unitId, metric) pairs included. */
function canonicalEvidenceOrder(
  evidence: readonly ConfidenceContribution[],
): readonly ConfidenceContribution[] {
  return [...evidence].sort(
    (a, b) =>
      (a.unitId < b.unitId ? -1 : a.unitId > b.unitId ? 1 : 0) ||
      (a.metric < b.metric ? -1 : a.metric > b.metric ? 1 : 0) ||
      (a.value < b.value ? -1 : a.value > b.value ? 1 : 0),
  );
}

/* ═══════════════════════════ Step 3 · QoS classify ═══════════════════════════ */

/** v0 classifier: classes form a weight ladder (sorted by `weight` ascending,
 *  ties by id — stable, no Map order); a unit joins the HIGHEST-weight class
 *  whose gate its confidence passes (the ascending scan keeps the last
 *  passing entry). No match ⇒ unclassified (null; "unclassified can only
 *  shed at random" is the policy wave's problem, WS-5 R57). */
export const defaultQosClassifyStep: TickStep<QosClassifyIn, QosClassifyOut> = (input) => {
  const ladder = [...input.classes].sort(
    (a, b) => (a.weight < b.weight ? -1 : a.weight > b.weight ? 1 : 0) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  );
  const units = input.units.map((unit) => {
    if (unit.qosClassId !== null) return unit; // sticky once classified
    let chosen: string | null = null;
    for (const def of ladder) {
      if (def.weight <= unit.confidence) chosen = def.id;
    }
    return chosen === null ? unit : withUnit(unit, { qosClassId: chosen });
  });
  return Object.freeze({ units: Object.freeze(units) });
};

/* ═══════════════════════════ Step 4 · Route ═══════════════════════════ */

/** DNS pre-board stub + express/deep split (R-05, D-4): confidence at or
 *  below the split point travels the express path; hotter units are steered
 *  to the deep path. In-flight units keep their already-assigned path. */
export function createRouteStep(
  config: Pick<DefaultPipelineConfig, "dnsNodeId" | "expressPath" | "deepPath">,
): TickStep<RouteIn, RouteOut> {
  const prefix: readonly EntityId[] = config.dnsNodeId === null ? [] : [config.dnsNodeId];
  return (input) => {
    const units = input.units.map((unit) => {
      if (unit.routeHops.length > 0) return unit;
      const path = unit.confidence <= input.expressMaxConfidence ? config.expressPath : config.deepPath;
      return withUnit(unit, { routeHops: Object.freeze([...prefix, ...path]) });
    });
    return Object.freeze({ units: Object.freeze(units) });
  };
}

/* ═══════════════════════════ Step 5 · Serve (queueing core) ═════════════════ */

type MutableSlot = { -readonly [K in keyof NodeSlotRecord]: NodeSlotRecord[K] };

/** Serve records dependency holds here (unitId → downstream node id) so the
 *  frozen `DependencyBlockIn` shape can still edge-validate them at step 8.
 *  The driver clears this table at the start of every tick; steps run
 *  synchronously in TICK_STEP_ORDER, so the window is one tick. */
export const UNIT_HOLD = new Map<EntityId, EntityId>();

/**
 * Slot-occupancy service with dependency hold ("the single most important
 * coupling", R-09; occupied-but-blocked is first-class, §4.1 Q4):
 *  1. per node (iterated in pinned sorted-id order — stable admissions):
 *     a. units whose CURRENT hop (routeHops[0]) is this node and that hold no
 *        slot anywhere join the node's FIFO queue (unit-list order);
 *     b. expired slots (releasedAtUs ≤ simNow): if the node's
 *        dependencyNodeId is FULL (zero free slots), the slot STAYS occupied
 *        (waitingOn = downstream) and a blocked assignment is emitted; else
 *        the slot frees and a completion assignment is emitted. Slots held
 *        from previous ticks re-check every tick;
 *     c. queue heads are admitted into the lowest free slot indices while
 *        capacity lasts (a unit of sizeCost w holds ceil(w) slots — R-32
 *        "size ≠ 1");
 *     d. `hard-ceiling` discipline (R-81…R-85) sheds the un-admitted queue
 *        instantly; `hockey-stick` nodes let the queue ride the curve.
 *        The step emits shed candidates in queue order; the DRIVER re-orders
 *        that channel per node by the R-06 class-aware shed law (see
 *        internal.orderShedForTick) so the terminal ledger honors each node's
 *        `shedOrder` + QoS class ranking (§7.11) — ServeIn itself is a frozen
 *        contract and cannot see the class table.
 *  2. `assignments` = new starts (serviceEndUs > simNow, blocked=false)
 *     ∪ completions (blocked=false, serviceEndUs ≤ simNow)
 *     ∪ holds (blocked=true). The driver derives hop progress from (2).
 *  3. `utilizationRho` = occupied/S (pure occupancy; the downstream queue
 *     shadow is applied where read — queue.effectiveRho).
 */

/**
 * L-V (ADR-0015 mechanics) — ServeIn presence-extension carrying the
 * ISOLATION FENCE: the node ids whose `GameState.isolate` book entries are
 * in force as-of this tick's business minute (pipeline/isolation.ts
 * `isolatedNodeIds`, threaded by the driver's step-5 site). The laws the
 * serve step honors:
 *  - a fenced node admits NO new units — §(c) skips the whole channel, so
 *    its free arms (including scale-warmth-booked ones) answer zero:
 *    FENCE BEATS WARMTH; with the recovery throttle also live this is
 *    min-of-clamps — the fence's new-work capacity is 0 and nothing can
 *    restore it (the dbaas card, §1.3: "isolate and throttle" — the player
 *    authored the fence, the engine owns the throttle, §7.16 Act-row law);
 *  - joins (§(a)) and releases (§(b)) are NOT blocked — in-flight work
 *    completes through the fence and queued units age under the existing
 *    patience dice (the fence site rolls zero dice);
 *  - the fence WRITES NO ROSTER: slots, queue arrays and NodeRecord values
 *    stay byte-untouched, so an occupied floor can never be evicted and
 *    throttleServeNodes' board-drift throw is structurally unreachable;
 *  - ABSENT fence set (no book seeded) ⇒ every branch below is identity —
 *    shipped digests byte-identical (zero-golden default);
 *  - L-TR (ADR-0016 successor program) adds a SECOND, PARTIAL discount on
 *    the same channel: `throttleCuts` (pipeline/throttle.ts, driver-
 *    threaded) maps node id → slots removed from the ADMISSION ceiling.
 *    A throttled node admits while `occupied + need ≤ slots.length(view)
 *    − cut` — capacity-as-CLAMP, the roster is NEVER written (materialized
 *    shrink REJECTED: it would poison throttleServeNodes' `fullSlots`
 *    capture and make the player's cut PERMANENT through a restoration
 *    window; and a bps-probability admit is REJECTED because step 5 is
 *    dice-FREE and its digests depend on it). An over-cap node (occupied
 *    already past the ceiling) admits NOTHING until work walks off —
 *    never-evict honored, releases (§(b)) untouched. PRECEDENCE BY CODE
 *    POSITION: the fenced skip-branch stays the FIRST branch of §(c); a
 *    fenced node never reaches the ceiling guard — fence beats throttle
 *    (the emergency outranks the dial), pinned falsifiably.
 *  - L-RS (ADR-0016 successor program) adds the RESTART as a third presence
 *    on the same channel: `restartFence`/`restartDrop` (pipeline/restart.ts,
 *    driver-threaded) are the two LIVE-window sets of the bounded reboot.
 *    The fence leg joins the §(c) skip-branch condition (`!fenced &&
 *    !restartFenced` — an isolate and a restart zero admissions the same
 *    way; `keep` mode is EXACTLY the bounded isolate — the keep==fence twin,
 *    pinned). The drop leg opens §(c′), BETWEEN §(c) and §(d): every
 *    in-window tick the node's entire queue — including this tick's §(a)
 *    joins — walks the EXISTED shed channel, byte-for-byte the §(d)
 *    hard-ceiling shape (`shed.push` loop, `queue.length = 0`,
 *    `queueDirty = true`) so the driver's R-06 reorder, the rec#5 purge
 *    attribution, and the R8 F-2 terminal PRESET branch all apply UNCHANGED
 *    — cause `outcome:<unitId>`, event kind "bounced", nodeId via
 *    routeHops[0]; ZERO new event kinds, ZERO dice. §(b) releases run
 *    BEFORE the flush (completion-before-purge: work finishing at the reboot
 *    minute is SERVED, not a casualty) and occupied arms are NEVER evicted
 *    (true kill-in-flight stays DEFERRED — the wedge-state reason lives in
 *    pipeline/restart.ts). Restart-into-hard-ceiling double-pushes the same
 *    unit into `shed`; the driver's `candidateSeen` makes it idempotent —
 *    bounced ONCE (pinned). Ladder of severity, all three on the same
 *    channel: throttle-partial < restart-keep (bounded fence) <
 *    restart-drop (bounded fence + queue flush) ≤ isolate (indefinite
 *    fence). Fields ABSENT ⇒ every branch identity — shipped digests
 *    byte-identical (zero-golden default).
 * `ServeIn` itself stays the frozen contract; like ArrivalInExt /
 * PatienceCheckInExt / BackpressureInExt this rides as an optional field
 * the base step reads through a cast.
 */
export interface ServeInExt extends ServeIn {
  /** Node ids fenced against NEW admissions this tick (frozen by isolation.ts). */
  readonly isolationFence?: ReadonlySet<EntityId>;
  /** Node id → admission-ceiling slots REMOVED this tick (frozen by
   *  throttle.ts; live cuts only, `cut >= 1` — an idle book omits the key). */
  readonly throttleCuts?: ReadonlyMap<EntityId, number>;
  /** Node ids inside a LIVE restart window this tick — the fence leg
   *  (frozen by restart.ts; drop ⊆ fence — an idle book omits the key). */
  readonly restartFence?: ReadonlySet<EntityId>;
  /** Node ids inside a LIVE restart window with `dropQueued` this tick —
   *  the §(c′) flush leg (frozen by restart.ts; a book without live drop
   *  rows omits the key). */
  readonly restartDrop?: ReadonlySet<EntityId>;
}

export const defaultServeStep: TickStep<ServeIn, ServeOut> = (input) => {
  const { context, nodes } = input;
  const simNow = context.clocks.simUs;
  const isolationFence = (input as ServeInExt).isolationFence;
  const throttleCuts = (input as ServeInExt).throttleCuts;
  const restartFence = (input as ServeInExt).restartFence;
  const restartDrop = (input as ServeInExt).restartDrop;
  const unitById = new Map<EntityId, Unit>();
  for (const unit of input.units) unitById.set(unit.id, unit);

  const holderOf = new Map<EntityId, EntityId>();
  for (const node of nodes.values()) {
    for (const slot of node.slots) {
      if (slot.occupied && slot.unitId !== null) holderOf.set(slot.unitId, node.id);
    }
  }

  // FIX-8 (queue-ghost guard): a unit ALREADY riding a queue is a waiter, not
  // a joiner. Without this, every multi-tick waiter re-appended a duplicate of
  // itself each surviving tick — ghosts stole free slots, re-triggered
  // admission-time inspection rolls, and inflated the digest-visible queueDepth
  // (measured 99.1% ghost entries on a congested bench, 21× tick cost). The
  // set is membership-only: node Map order can never leak into it, and the
  // survivor's FIFO position (its existing queue index) is preserved exactly —
  // joins only ever append after releases, never re-sort. A queue entry whose
  // unit's hop no longer names that node cannot be produced by these defaults
  // (admission shifts the entry out before the hop can advance); foreign steps
  // that forge one keep the unit in its recorded queue — the same pre-fix
  // behaviour, minus the self-multiplication.
  const alreadyQueued = new Set<EntityId>();
  for (const node of nodes.values()) {
    for (const unitId of node.queue) alreadyQueued.add(unitId);
  }

  const pendingJoins = new Map<EntityId, EntityId[]>();
  for (const unit of input.units) {
    const hop = unit.routeHops[0];
    if (hop === undefined || holderOf.has(unit.id) || alreadyQueued.has(unit.id)) continue;
    if (!nodes.has(hop)) {
      // FIX-7 fail-loud at join: silently idling an unroutable unit created
      // zombies that never queue, never age and never terminate. A route onto
      // a node that is not on the board is authoring poison — halt the tick.
      throw new Error(
        `pipeline.serve: unit ${unit.id} routes to unknown node ${hop} — every hop must exist on the board`,
      );
    }
    const list = pendingJoins.get(hop);
    if (list === undefined) pendingJoins.set(hop, [unit.id]);
    else list.push(unit.id);
  }

  const assignments: SlotAssignment[] = [];
  const waiting: EntityId[] = [];
  const shed: EntityId[] = [];
  const nextNodes = new Map<EntityId, NodeRecord>();

  for (const nodeId of sortedIds(nodes.keys())) {
    const node = nodes.get(nodeId);
    if (node === undefined) continue;
    // L-V isolation fence: true ⇒ §(c) admits nothing new onto this node
    // (the whole admissions channel skips it). Joins/releases/shed-order
    // truth below are untouched by the flag — a fence stops RECEIVING new
    // work, never keeps in-flight work from finishing.
    const fenced = isolationFence !== undefined && isolationFence.has(nodeId);
    // L-RS restart fence leg: the SAME skip as isolation (a live reboot
    // window takes no new work either); `keep` mode is exactly this — the
    // bounded isolate twin. The flush leg below is the `drop` difference.
    const restartFenced = restartFence !== undefined && restartFence.has(nodeId);
    // rec#2 (copy-on-write discipline): queue/slot arrays materialize ONLY
    // when this tick has something to change on this node. An untouched node
    // flows through with its frozen arrays and its own record identity —
    // the +301µs/tick board churn of re-spreading every NodeRecord and
    // re-cloning every slot on a 200-node grid is what this skips.
    const joins = pendingJoins.get(nodeId);
    let queue: EntityId[] | null =
      node.queue.length > 0 || (joins !== undefined && joins.length > 0) ? [...node.queue, ...(joins ?? [])] : null;
    let queueDirty = joins !== undefined && joins.length > 0;
    let slots: MutableSlot[] | null = null;
    const mutableSlots = (): MutableSlot[] => (slots ??= node.slots.map((slot) => ({ ...slot })));

    const freeIndices = (): number[] => {
      const live = slots ?? node.slots;
      const free: number[] = [];
      for (let i = 0; i < live.length; i += 1) {
        const slot = live[i];
        if (slot !== undefined && !slot.occupied) free.push(i);
      }
      return free;
    };
    const downstreamId = node.dependencyNodeId;
    const downstream = downstreamId === null ? undefined : nodes.get(downstreamId);
    const downstreamFull = (): boolean =>
      downstream !== undefined &&
      downstream.slots.length > 0 &&
      downstream.slots.every((slot) => slot.occupied);

    // (b) releases / dependency holds — read-only inspection walks the
    // FROZEN source slots; the first branch that actually mutates pays for
    // the copy (mutableSlots).
    const slotCount = node.slots.length;
    for (let i = 0; i < slotCount; i += 1) {
      const slot = (slots ?? node.slots)[i];
      if (slot === undefined || !slot.occupied) continue;
      const expired = slot.releasedAtUs !== null && slot.releasedAtUs <= simNow;
      const held = slot.waitingOn !== null;
      if (!expired && !held) continue; // still in service
      const serviceEnd = slot.releasedAtUs;
      const unitId = slot.unitId;
      if (serviceEnd === null || unitId === null) {
        // Defensive: an occupied slot must carry a deadline + owner. A torn
        // slot (foreign step artifact) is force-freed rather than crash the
        // run — the board invariant scanner (topology wave) owns detection.
        const live = mutableSlots()[i];
        if (live === undefined) continue;
        live.occupied = false;
        live.unitId = null;
        live.waitingOn = null;
        live.releasedAtUs = null;
        continue;
      }
      if (!held && downstreamId !== null && downstreamFull()) {
        // Fresh hold: service finished but the dependency cannot admit —
        // the slot STAYS occupied (retry-storm prerequisite, Q4).
        const live = mutableSlots()[i];
        if (live !== undefined) live.waitingOn = downstreamId;
        UNIT_HOLD.set(unitId, downstreamId);
        assignments.push(
          Object.freeze({
            unitId,
            nodeId,
            slotIndex: i,
            serviceStartUs: serviceEnd - node.serviceTimeUs,
            serviceEndUs: serviceEnd,
            blocked: true,
          }),
        );
        continue;
      }
      if (held && downstreamFull()) {
        // Still starved: keep holding; re-emit so step 8 stays authoritative.
        UNIT_HOLD.set(unitId, downstreamId ?? slot.waitingOn ?? nodeId);
        assignments.push(
          Object.freeze({
            unitId,
            nodeId,
            slotIndex: i,
            serviceStartUs: serviceEnd - node.serviceTimeUs,
            serviceEndUs: serviceEnd,
            blocked: true,
          }),
        );
        continue;
      }
      const freed = mutableSlots()[i];
      if (freed !== undefined) {
        freed.occupied = false;
        freed.unitId = null;
        freed.waitingOn = null;
        freed.releasedAtUs = null;
      }
      UNIT_HOLD.delete(unitId);
      assignments.push(
        Object.freeze({
          unitId,
          nodeId,
          slotIndex: i,
          serviceStartUs: serviceEnd - node.serviceTimeUs,
          serviceEndUs: serviceEnd,
          blocked: false,
        }),
      );
    }

    // (c) FIFO admissions into the lowest free slots — a FENCED node skips
    // the whole channel: its free (and warmth-booked) arms answer zero new
    // work, the queue array is left exactly as §(a) built it (no
    // truncation, no eviction, and even the phantom purge — a hygiene
    // WRITE — stays silent: the fence writes nothing).
    // L-TR throttle clamp (ADR-0016): the ADMISSION ceiling the viewed
    // roster offers once the player's live cut is discounted. No cut for
    // this node ⇒ Infinity ⇒ the guard below is provably inert
    // (byte-identity). It is a SECOND guard on the channel, positioned
    // INSIDE the loop AFTER the fenced skip-branch — fence beats throttle
    // by code position (the emergency outranks the dial). `slotCount -
    // free.length` is what §(b) left occupied right now, so an over-cap
    // node (occupancy already past the ceiling) admits NOTHING until work
    // walks off — never-evict honored, the roster never written.
    const cut = throttleCuts?.get(nodeId);
    const ceiling = cut === undefined ? Infinity : slotCount - cut;
    while (!fenced && !restartFenced && queue !== null && queue.length > 0) {
      const head = queue[0];
      if (head === undefined) break;
      const unit = unitById.get(head);
      if (unit === undefined) {
        queue.shift(); // phantom entry — queue member missing from the
        // roster: only reachable on restored/foreign-authored boards (the
        // default steps purge terminals out of queues the same tick they
        // terminate, and serve runs before the outcome step).
        queueDirty = true;
        continue;
      }
      const need = slotsNeeded(unit.sizeCost);
      const free = freeIndices();
      if (free.length < need) break;
      if (ceiling !== Infinity && (slotCount - free.length) + need > ceiling) break;
      queue.shift();
      queueDirty = true;
      const taken = free.slice(0, need);
      const serviceEnd = simNow + node.serviceTimeUs;
      for (const slotIndex of taken) {
        const slot = mutableSlots()[slotIndex];
        if (slot !== undefined) {
          slot.occupied = true;
          slot.unitId = head;
          slot.waitingOn = null;
          slot.releasedAtUs = serviceEnd;
        }
      }
      assignments.push(
        Object.freeze({
          unitId: head,
          nodeId,
          slotIndex: taken[0] ?? 0,
          serviceStartUs: simNow,
          serviceEndUs: serviceEnd,
          blocked: false,
        }),
      );
    }

    // (c′) RESTART flush leg (L-RS, ADR-0016): a live `drop` window walks
    // the ENTIRE queue — this tick's §(a) joins included — through the
    // EXISTED shed channel, byte-for-byte the §(d) hard-ceiling shape, so
    // every downstream law rides unchanged: the driver's orderShedForTick
    // reorder, the rec#5 purge attribution, and the R8 F-2 terminal PRESET
    // branch ("bounced", cause `outcome:<unitId>`, zero dice, nodeId = the
    // rebooting node via routeHops[0]). Runs AFTER §(b) releases and §(c)
    // admissions — completion-before-purge: work that finished at the
    // reboot minute is served, not a casualty; occupied arms are never
    // evicted (kill-in-flight DEFERRED, see pipeline/restart.ts). On a
    // hard-ceiling node the same unit may be pushed by both legs; the
    // driver's candidateSeen first-writer makes the terminal idempotent —
    // bounced ONCE (pinned). ZERO dice: the flush casts nothing, so
    // surviving units' patience patterns on OTHER nodes are byte-identical
    // to the unarmed run (per-unit-key stream law, pinned falsifiably).
    if (restartDrop !== undefined && restartDrop.has(nodeId) && queue !== null && queue.length > 0) {
      for (const unitId of queue) shed.push(unitId);
      queue.length = 0;
      queueDirty = true;
    }

    // (d) discipline: hard-ceiling sheds the residual queue instantly
    if (node.discipline === "hard-ceiling" && queue !== null && queue.length > 0) {
      for (const unitId of queue) shed.push(unitId);
      queue.length = 0;
      queueDirty = true;
    }
    if (queue !== null) waiting.push(...queue);

    // FIX-6: ONE shared ρ writer — queue.utilization is the single helper
    // (round-half-away fromRatio + RHO_CEILING clamp) that every step and the
    // driver's purge path now agree on.
    //
    // rec#2 unchanged-node reuse: when nothing was written this tick (no
    // join/shift/shed, no slot mutation) the node's CONTENT is provably the
    // same array the pre-reuse code would rebuild — so we re-verify the two
    // derived stamps (ρ via the shared helper, and the queueDepth↔queue
    // honesty the FIX-6 era relies on) and, on a match, hand back the SAME
    // frozen record. Re-checking instead of trusting keeps foreign stamps
    // repaired exactly like before; the only saving is allocation identity,
    // which no digest, event, or HUD can observe.
    if (slots === null && !queueDirty) {
      const rho = utilization(node);
      const stampsHonest =
        rho === node.utilizationRho && node.queueDepth === node.queue.length;
      nextNodes.set(nodeId, stampsHonest ? node : Object.freeze({ ...node, utilizationRho: rho, queueDepth: node.queue.length }));
      continue;
    }
    const nodeAfter = Object.freeze({
      ...node,
      slots: Object.freeze(slots ?? node.slots),
      queue: Object.freeze(queue ?? node.queue),
      queueDepth: queue === null ? node.queue.length : queue.length,
    });
    nextNodes.set(nodeId, Object.freeze({ ...nodeAfter, utilizationRho: utilization(nodeAfter) }));
  }

  return Object.freeze({
    assignments: Object.freeze(assignments),
    waiting: Object.freeze(waiting),
    shed: Object.freeze(shed),
    nodes: nextNodes,
  });
};

/* ═══════════════════════════ Step 6 · Queue wait ═══════════════════════════ */

/** Aggregate hockey-stick prediction per waiting unit (R-07). No LUT needed:
 *  the closed form is O(1) exact integer math; monotonicity is tested.
 *  FIX-5: the prediction reads through queue.effectiveRho, so a congested
 *  dependency casts its queue-depth shadow upstream — the stick bends before
 *  the node's own slots fill (the HUD foreshadowing rule). */
export const defaultQueueWaitStep: TickStep<QueueWaitIn, QueueWaitOut> = (input) => {
  const knee = input.kneeRho > 0n ? input.kneeRho : DEFAULT_KNEE_RHO;
  const nodeOfUnit = new Map<EntityId, NodeRecord>();
  for (const node of input.nodes.values()) {
    for (const unitId of node.queue) nodeOfUnit.set(unitId, node);
  }
  const waits: QueueWait[] = [];
  for (const unitId of input.waiting) {
    const node = nodeOfUnit.get(unitId);
    if (node === undefined) continue;
    const downstreamDepth =
      node.dependencyNodeId === null
        ? 0
        : (input.nodes.get(node.dependencyNodeId)?.queueDepth ?? 0);
    waits.push(
      Object.freeze({
        unitId,
        queueWaitUs: hockeyStickWaitUs(node.serviceTimeUs, effectiveRho(node, downstreamDepth), knee),
      }),
    );
  }
  return Object.freeze({ waits: Object.freeze(waits) });
};

/* ═══════════ Step 5/6 side law · Scale ↔ reserved warmth (ADR-0015) ═══════════ */

/** ADR-0015 door-mechanics ruling, Scale 1/5 — the AS-OF law of the
 *  reserved-warmth book, a flat twin of corruption.ts `nodeShielded` (and
 *  economy's `activePriceOverride`): an absent entry books no warmth;
 *  `effectiveAtBusinessMinute === null` is law from the executing tick; a
 *  future stamp is armed but NOT yet law. Accepting the optional book keeps
 *  the caller's guard flat (Law 1): `undefined` book ⇒ null for every node
 *  — the byte-identity switch. ADR-0017 #3 RECLAIM void: when a live
 *  reclaim index is threaded and the warmth shipped AT OR BEFORE its node's
 *  tombstone, the destroy-and-rebuild cycle collected the reservation — the
 *  entry reads INERT (null, no padding) while the book keeps it raw; a
 *  re-booking after the tombstone STANDS (the rebuild). Omitted/null index
 *  ⇒ zero void checks, the pre-reclaim law exact. §1.3 serverless card
 *  "Cold Start": "a Chrysalis Pool of pre-warmed shells is the buildable:
 *  buying warmth is buying the absence of a stutter." */
export function scaleWarmInForce(
  scale: ScaleBook | undefined,
  nodeId: EntityId,
  atBusinessMinute: SimMinute,
  reclaims: ReadonlyMap<EntityId, ReclaimEntry> | null = null,
): ScaleEntry | null {
  if (scale === undefined) return null;
  const entry = scale.entries.get(nodeId);
  if (entry === undefined) return null;
  // ADR-0017 #3 void FIRST — order-irrelevant to the answer (an unarmed row
  // reads null either way; a voided one reads null either way) and the
  // ternary below is DRIFT-PINNED verbatim by internal/__tests__/warmth-cost
  // .test.ts against the tickFold.ts twin: do not restructure it.
  if (voidedByTombstone(entry.shippedAtTick, reclaims?.get(nodeId))) return null;
  return entry.effectiveAtBusinessMinute === null || atBusinessMinute >= entry.effectiveAtBusinessMinute
    ? entry
    : null;
}

/** Last occupied slot index + 1 for a stored record (0 when none). The
 *  shrink twin of recovery.ts `occupiedFloor` (private there, recovery.ts
 *  :415) — an occupied arm is NEVER evicted: withdrawing warmth while a
 *  head carries a unit defers the release until the unit walks off, so
 *  scale-to-zero can never orphan an in-service tenant. */
function scaleOccupiedFloor(slots: readonly NodeSlotRecord[]): number {
  let floor = 0;
  for (let i = slots.length - 1; i >= 0; i -= 1) {
    const slot = slots[i];
    if (slot !== undefined && slot.occupied) {
      floor = i + 1;
      break;
    }
  }
  return floor;
}

/**
 * Present the SERVE step its node view under booked reserved warmth: every
 * node with warmth in force (see `scaleWarmInForce`) sees a roster of
 * `max(baseRosterSlots + reservedSlots, occupiedFloor)` arms — grown on the
 * pad tail with blank arms (queue.ts `makeSlots`, the board-bootstrap
 * scaffold — a warm head starts empty, never with a ghost tenant), shrunk
 * toward the authored roster on withdrawal (0-amendment = the card's
 * "scale to zero"). Nodes without a live booking pass through by record
 * identity; a book with nothing in force returns the SAME Map object, so a
 * driver whose host merely never books warmth pays zero copies and zero
 * clock math (byte-identity gate: `undefined` book ⇒ the function is never
 * even called — driver gates on `worked.scale !== undefined`).
 *
 * This view is what gets STORED (serve echoes its nodes) — the recovery
 * throttle's doctrine, deliberately adopted: the booked roster is ground
 * truth for the tick, so EVERY capacity read follows the slots-not-HP
 * arithmetic downstream — serve's free-slot scan, admission,
 * `utilization`/`effectiveRho` (queue.ts divides by `slots.length`),
 * patience waits, the hockey stick. The fold itself is PURE arithmetic on
 * the roster: ZERO RNG, zero event mints, zero unit writes.
 *
 * RECOVERY DEFERRAL: a node under a live §7.7 recovery window keeps the
 * THROTTLED arms — the two books must not fight (recovery fail-louds
 * `recovery[board-drift]` when stored capacity exceeds the captured
 * `fullSlots`, and padding past a window mid-restoration would trip its
 * own law). Booking stays valid; materialization waits for the window to
 * close. A booking made DURING a window anchors `baseRosterSlots` at the
 * throttled length (the door reads the live roster) — deterministic and
 * disclosed.
 *
 * ADR-0017 #3 RECLAIM VOID: the threaded tombstone index (null = nothing
 * armed) is forwarded to `scaleWarmInForce` — a collected reservation
 * simply reads inert, so the node serves its authored clean capacity; the
 * recovery deferral law is UNTOUCHED (engine authority, never voided).
 */
export function applyScaleWarmth(
  nodes: ReadonlyMap<EntityId, NodeRecord>,
  scale: ScaleBook | undefined,
  atBusinessMinute: SimMinute,
  recovery: RecoveryState | undefined,
  reclaims: ReadonlyMap<EntityId, ReclaimEntry> | null = null,
): ReadonlyMap<EntityId, NodeRecord> {
  if (scale === undefined || scale.entries.size === 0) return nodes;
  let changed = false;
  const out = new Map<EntityId, NodeRecord>();
  for (const [nodeId, record] of nodes) {
    const warm = scaleWarmInForce(scale, nodeId, atBusinessMinute, reclaims);
    if (warm === null || (recovery !== undefined && recovery.windows.has(nodeId))) {
      out.set(nodeId, record);
      continue;
    }
    const stored = record.slots.length;
    const target = Math.max(warm.baseRosterSlots + warm.reservedSlots, scaleOccupiedFloor(record.slots));
    if (target === stored) {
      out.set(nodeId, record);
      continue;
    }
    changed = true;
    const slots =
      target < stored
        ? Object.freeze(record.slots.slice(0, target))
        : Object.freeze([...record.slots, ...makeSlots(target - stored)]);
    out.set(nodeId, Object.freeze({ ...record, slots }));
  }
  // Whole-map identity when nothing materialized (inert future stamps,
  // zero-warmth amendments already at floor) — the byte-identity twin of
  // throttleServeNodes' `windows.size === 0` early return.
  return changed ? out : nodes;
}

/* ═══════════ Step 9 side law · Maintain/Schedule ↔ the patience die (ADR-0015) ═══════════ */

/** Both ADR-0015 window books share ONE live-band law: a row is in force
 *  from its open edge (the null sentinel = already open) INCLUSIVE until its
 *  closing edge EXCLUSIVE. Past `closeAtBusinessMinute` the row is inert at
 *  read — hygiene is periodic (§2.24: manning a switchboard buys the night,
 *  not forever; the backup window is a band, not a permanent upgrade) — but
 *  the book KEEPS the row as the history witness (digest absorbs raw). */
function bandLive(band: MaintainWindow | JobWindow, atBusinessMinute: SimMinute): boolean {
  if (band.openAtBusinessMinute !== null && atBusinessMinute < band.openAtBusinessMinute) return false;
  return atBusinessMinute < band.closeAtBusinessMinute;
}

/** ADR-0015 door-mechanics ruling, Maintain 2/5 — the AS-OF + EXPIRY law of
 *  the maintenance-attendance book, a flat twin of corruption.ts
 *  `nodeShielded` and `scaleWarmInForce` (the as-of half), plus the band law
 *  the pre-arm books never needed (`bandLive`). Accepting the optional book
 *  keeps the caller's guard flat (Law 1): `undefined` book ⇒ null for every
 *  node — the byte-identity switch. ADR-0017 #3 RECLAIM void: a live
 *  reclaim index threaded with the attendance shipped AT OR BEFORE its
 *  node's tombstone collects it — the veto answers inert (null) and the
 *  abandonment die rolls again, while the book keeps the band raw; a
 *  re-booked band after the tombstone STANDS. Omitted/null index ⇒ zero
 *  void checks, the pre-reclaim law exact. §1.3 trunk-group-voip card "The
 *  Switchboard" (hosting_game.md:1771): when the board is attended callers
 *  hold; when the crew walks off, the trunk group's binary patience bites. */
export function maintainInForce(
  maintain: MaintainBook | undefined,
  nodeId: EntityId,
  atBusinessMinute: SimMinute,
  reclaims: ReadonlyMap<EntityId, ReclaimEntry> | null = null,
): MaintainWindow | null {
  if (maintain === undefined) return null;
  const entry = maintain.entries.get(nodeId);
  if (entry === undefined) return null;
  if (voidedByTombstone(entry.shippedAtTick, reclaims?.get(nodeId))) return null;
  return bandLive(entry, atBusinessMinute) ? entry : null;
}

/** ADR-0015 Schedule 2/5 — the job-window book's as-of + expiry law, the
 *  exact twin of `maintainInForce` over `JobWindowBook`. Distinct from §7.7
 *  recovery windows (`GameState.recovery` — the second-failure throttle's
 *  damage records): this band is a DEADLINE the player booked on the
 *  calendar, read only by patience-mode "window" units. ADR-0017 #3 RECLAIM
 *  void: same tombstone law as `maintainInForce` — a collected window
 *  answers null and the unit's AUTHORED deadline governs again (window mode
 *  reverts to its budget), the book keeps the row raw. */
export function jobWindowInForce(
  schedule: JobWindowBook | undefined,
  nodeId: EntityId,
  atBusinessMinute: SimMinute,
  reclaims: ReadonlyMap<EntityId, ReclaimEntry> | null = null,
): JobWindow | null {
  if (schedule === undefined) return null;
  const entry = schedule.entries.get(nodeId);
  if (entry === undefined) return null;
  if (voidedByTombstone(entry.shippedAtTick, reclaims?.get(nodeId))) return null;
  return bandLive(entry, atBusinessMinute) ? entry : null;
}

/** ADR-0015 Schedule 2/5 — the band → SIM-TIME conversion that makes the
 *  job window a patience budget: the distance from NOW to the band's
 *  trailing edge, in sim µs, through the Dual-Clock laws (kernel/time.ts):
 *  business advances at 43200/7 µs per real µs (`BUSINESS_SCALE_DEFAULT`,
 *  exact by telescoping floor from zero — `shieldBusinessMinuteOf` reads the
 *  same clock), sim advances at 60·speed µs per real µs (`simScale`).
 *
 *  FORMULA (accumulated-ratio): `distanceSimUs = remainingBusinessUs ×
 *  clocks.simUs / clocks.businessUs`, where `remainingBusinessUs =
 *  closeAt × 60_000_000 − businessUs`. At a CONSTANT speed the accumulated
 *  sim:business ratio IS the current speed's ratio, so the conversion is
 *  exact; under mixed speeds it weights the remaining edge by the run's
 *  AVERAGE so-far (the player's speed history is deterministic replay input,
 *  so this stays byte-reproducible either way). The conversion law was
 *  registered as new mechanics postdating the ADR-0015 #1 numerics
 *  ratification; it is RATIFIED 2026-10-17 (ADR-0017 #6) with the wave-23
 *  game-feel batch (same posture as the Maintain v0 absorb-not-prevent
 *  choice below, discharged together).
 *
 *  Tick-0 fallback: businessUs 0 divides nothing — at 1× the law is exact by
 *  construction (60 sim µs ÷ (43200/7) business µs = 7/720 per business µs),
 *  so the first stamp uses `remaining × 7n / 720n`.
 *
 *  The guard clause answers "edge already passed" with ZERO budget — a live
 *  band read through `jobWindowInForce` mathematically keeps remaining > 0
 *  (floor-minute law: `minute < close` ⇒ `businessUs < close × MICROS_PER_
 *  MIN`), so this line only fires for a mis-threaded caller: failing the job
 *  is the honest floor, never inflating a dead band into infinite patience. */
export function jobBandDistanceUs(band: JobWindow, clocks: ClockState): SimTimeUs {
  const remainingBusinessUs = BigInt(band.closeAtBusinessMinute) * MICROS_PER_MIN - clocks.businessUs;
  if (remainingBusinessUs <= 0n) return 0n;
  if (clocks.businessUs <= 0n) return (remainingBusinessUs * 7n) / 720n;
  return (remainingBusinessUs * clocks.simUs) / clocks.businessUs;
}

/* ═══════════════════════════ Step 7 · Inspect ═══════════════════════════ */

/**
 * Inspection-depth latency stamps + ROC gating (R-08, R-52):
 *  - pass-through: no verdict, no cost;
 *  - sample-1-in-20: one in twenty units (per-unit forked stream) pays a
 *    5 %-weighted sampling stamp;
 *  - inspect: every unit pays the full stamp — and adversarial units roll
 *    their block HERE too (the block roll fires at every non-pass-through,
 *    non-sample depth);
 *  - challenge: full stamp AND the block roll — P(block) = aggression ×
 *    detectionRatio for adversarial intent, aggression × falsePositiveRatio
 *    for benign (the benign FP roll is challenge-ONLY; adversarial blocking
 *    is not). A blocked benign unit is a *candidate* false positive
 *    (resolved at step 10); a blocked adversarial unit is neutralized there.
 * The driver calls this with units ADMITTED this tick, so every unit-hop is
 * inspected exactly once (no re-rolls per waiting tick).
 */
export function createInspectStep(
  config: Pick<DefaultPipelineConfig, "inspectionCostUs" | "detectionRatio" | "falsePositiveRatio">,
): TickStep<InspectIn, InspectOut> {
  return (input) => {
    const verdicts = [];
    for (const unit of input.units) {
      const nodeId = unit.routeHops[0];
      if (nodeId === undefined) continue;
      const depth = input.depths.get(nodeId);
      if (depth === undefined || depth === "pass-through") continue;
      const perUnit = input.rng.fork(`u:${unit.id}`);
      if (depth === "sample-1-in-20") {
        if (perUnit.range(20) !== 0) continue; // not sampled at this hop
        verdicts.push(
          Object.freeze({
            unitId: unit.id,
            nodeId,
            costUs: mulUsFixed(config.inspectionCostUs[depth] ?? 0n, fromRatio(1n, 20n)),
            blocked: false,
            suspicionAfter: suspicionOf(unit.trueIntent, input.aggression),
          }),
        );
        continue;
      }
      const adversarial = isAdversarialIntent(unit.trueIntent);
      const blockP = adversarial
        ? mul(input.aggression, config.detectionRatio)
        : depth === "challenge"
          ? mul(input.aggression, config.falsePositiveRatio)
          : FIXED_ZERO;
      const blocked = blockP > FIXED_ZERO && rollUnder(blockP, perUnit.nextU32());
      verdicts.push(
        Object.freeze({
          unitId: unit.id,
          nodeId,
          costUs: config.inspectionCostUs[depth] ?? 0n,
          blocked,
          suspicionAfter: suspicionOf(unit.trueIntent, input.aggression),
        }),
      );
    }
    return Object.freeze({ verdicts: Object.freeze(verdicts) });
  };
}

function suspicionOf(intent: Unit["trueIntent"], aggression: Fixed): Fixed {
  // v0 reading: adversarial presence reads hot under scrutiny, benign cold.
  // Suspicion stickiness/decay (~10 min) belongs to the observed wave.
  const base = isAdversarialIntent(intent) ? fromRatio(9n, 10n) : fromRatio(1n, 10n);
  const scrutiny = aggression + FIXED_UNIT / 2n > FIXED_UNIT ? FIXED_UNIT : aggression + FIXED_UNIT / 2n;
  return clampUnit(mul(base, scrutiny));
}

/* ═══════════════════════════ Step 8 · Dependency block ═══════════════════════════ */

/** Formalizes the holds step 5 produced (slots stay occupied — Q4) and
 *  validates each against the authoritative dependency-edge list: a hold
 *  whose (upstream → downstream) pair has no edge is DROPPED, so the driver
 *  releases a mis-wired slot (fail-safe against board-graph drift). */
export const defaultDependencyBlockStep: TickStep<DependencyBlockIn, DependencyBlockOut> = (input) => {
  const edgePairs = new Set<string>();
  for (const edge of input.edges) {
    edgePairs.add(`${edge.upstreamNodeId}>${edge.downstreamNodeId}`);
  }
  const blocks = [];
  for (const assignment of input.assignments) {
    if (!assignment.blocked) continue;
    const downstream = UNIT_HOLD.get(assignment.unitId);
    if (downstream === undefined) continue;
    if (!edgePairs.has(`${assignment.nodeId}>${downstream}`)) continue;
    blocks.push(Object.freeze({ unitId: assignment.unitId, waitingOn: downstream }));
  }
  return Object.freeze({ blocks: Object.freeze(blocks) });
};

/* ═══════════════════════════ Step 9 · Patience check ═══════════════════════════ */

/** R25 closed vocabulary — runtime mirror of the types.ts `PatienceMode`
 *  union (the same boundary-parse shape as the loader's private array; a
 *  typo'd authored mode fails loud at step CREATION, never mid-run). */
export const PATIENCE_MODE_VOCAB: readonly PatienceMode[] = Object.freeze([
  "sigmoid-budget",
  "window",
  "value-decay",
  "resident",
  "binary",
  "corrupts",
  "none",
]);

/** Parse-don't-validate (Laws 2/4): sorted-key Map, every mode checked
 *  against the closed set once; the per-unit loop then trusts the table. */
function parsePatienceModeByType(
  table: Readonly<Record<string, PatienceMode>> | undefined,
): ReadonlyMap<string, PatienceMode> {
  const out = new Map<string, PatienceMode>();
  if (table === undefined) return out;
  for (const type of Object.keys(table).sort()) {
    const mode = table[type] as PatienceMode;
    if (!PATIENCE_MODE_VOCAB.includes(mode)) {
      throw new Error(
        `patienceCheck: unknown patience mode ${String(mode)} for type "${type}" (R25 vocabulary: ${PATIENCE_MODE_VOCAB.join(" | ")})`,
      );
    }
    out.set(type, mode);
  }
  return out;
}

/**
 * This tick's bounce probability for ONE queued unit under its type's R25
 * mode (MASTER_REPORT §4.1 R25 census — "patience as MODE enum"). The
 * probability rides the SAME roll gate as sigmoid-budget, so modes never
 * need their own branch at the roll site; zero-probability and certainty
 * answers skip the "bounce" stream draw entirely (per-unit-key streams ⇒
 * zero blast radius on other units either way).
 *
 *  - sigmoid-budget — TODAY'S LAW (R-60 LUT through 10%@0.6× / 50%@1.0× /
 *    95%@1.6×). The default for every unlisted type.
 *  - window — hard cutoff (backup's "window module"): no gradient at all.
 *    The unit makes its window or it is gone: p = 1 once
 *    elapsed + predicted ≥ budget, else 0.
 *  - value-decay — the budget doubles as the value meter: p grows LINEARLY
 *    with elapsed/patience (truncated Fixed ratio), saturating at certainty
 *    at 1× — the slow bleed the sigmoid approximates with three anchors.
 *  - binary — connect-now-or-leave (R25 "binary-connect"): ANY predicted
 *    wait repels, regardless of budget (p = 1 iff predicted > 0).
 *  - none — infinite patience: never abandons the queue.
 *  - resident — the sticky session (§App A durationClass Resident): once it
 *    has joined a queue it WAITS — capacity is held, not abandoned. The
 *    other half of resident-UNSHEDABLE binds in the serve/shed ladder
 *    (qos-class shedOrder already owns order; class-level immunity remains
 *    an open content question, reported).
 *  - corrupts — "corrupt-not-bounce" (R25 census; §3.1 heading "Patience as
 *    HP — the unified visitor spec (the reverse creep)", hosting_game.md
 *    :11436 under "## 3.1 The visitor model" :11434): the unit stays
 *    (p = 0 here) and COMPLETES service, but a patience-exhausted
 *    completion corrupts its response — the damage rides the side channel
 *    this step's `corruption` output opens (CorruptOutcome + GameState
 *    .corruption + observed cell; pipeline/corruption.ts owns the fold and
 *    the economy adapter). The frozen 4-terminal Outcome set stays untouched:
 *    corruption is NOT a fifth terminal, it is a mark that outlives the
 *    queue and reports at the `served` terminal. SHIELDED queue nodes
 *    (ADR-0014 #D2 `shield-node` pre-arm — `GameState.shield` read as-of the
 *    business minute via corruption.ts `nodeShielded`) never cast the
 *    exhaustion die: the mark never lands, the response serves clean.
 */
function patienceProbabilityFor(
  mode: PatienceMode,
  elapsedUs: SimTimeUs,
  predictedUs: SimTimeUs,
  patienceUs: SimTimeUs,
): Fixed {
  switch (mode) {
    case "sigmoid-budget":
      return bounceProbability(patienceRatioBps(elapsedUs + predictedUs, patienceUs));
    case "window":
      return elapsedUs + predictedUs >= patienceUs ? FIXED_UNIT : FIXED_ZERO;
    case "value-decay": {
      if (patienceUs <= 0n || elapsedUs + predictedUs >= patienceUs) return FIXED_UNIT;
      if (elapsedUs + predictedUs <= 0n) return FIXED_ZERO;
      return ((elapsedUs + predictedUs) * FIXED_SCALE) / patienceUs; // bigint-truncated, monotone
    }
    case "binary":
      return predictedUs > 0n ? FIXED_UNIT : FIXED_ZERO;
    case "none":
    case "resident":
    case "corrupts":
      return FIXED_ZERO;
  }
}

/**
 * Silent bounce (R-10): queued units compare elapsed-so-far + the PREDICTED
 * hockey-stick wait against their patience budget under their type's R25
 * MODE (see patienceProbabilityFor); the resulting probability gates one
 * roll on the per-unit "bounce" stream. Units in service or dependency-held
 * never bounce here — they are committed; their pain surfaces as latency,
 * not departure.
 *
 * PRESENCE GATE: with `patienceModeByType` unset (every shipped run today)
 * every unit resolves to sigmoid-budget and the step is byte-identical to
 * its pre-fix self — pinned by the paired default-vs-empty-table test.
 * The corruption channel follows the SAME law: it stays DORMANT until a
 * table row actually names `corrupts`; absent that, the output is exactly
 * the historical `{ bounced }` — no extra key, no extra entropy.
 */
export function createPatienceCheckStep(
  config: Pick<DefaultPipelineConfig, "runSeed" | "patienceModeByType" | "corruptionProbability">,
): TickStep<PatienceCheckIn, PatienceCheckOut> {
  const modeByType = parsePatienceModeByType(config.patienceModeByType);
  /* ARMING census (parse-don't-validate, Law 2): one pass over the closed
   * table decides whether the corruption machinery can EVER fire, so the
   * per-unit loop below keeps its historical shape for every unlisted and
   * listed-but-not-corrupts run. */
  let corruptsAuthored = false;
  for (const mode of modeByType.values()) {
    if (mode === "corrupts") {
      corruptsAuthored = true;
      break;
    }
  }
  const corruptionProbability = config.corruptionProbability ?? FIXED_UNIT;
  return (input) => {
    const waitByUnit = new Map<EntityId, SimTimeUs>();
    for (const wait of input.waits) waitByUnit.set(wait.unitId, wait.queueWaitUs);
    const bounced: EntityId[] = [];
    const prior = corruptsAuthored ? (input as PatienceCheckInExt).corruption : undefined;
    const marks = prior === undefined ? new Map<EntityId, boolean>() : new Map(prior.marks);
    let markedThisTick = false;
    /* ADR-0014 #D2 SHIELD pre-arm — the read is presence-gated: NO book on
     * input ⇒ zero business-clock math, zero behavior change (the exact
     * byte-identity switch, same law as the `corruption` slice above).
     * ADR-0015 2/5: the Maintain + Schedule books share the gate — ANY of
     * the three window books present computes the business minute ONCE;
     * all three absent keeps the pre-door shape exactly. */
    const shield = (input as PatienceCheckInExt).shield;
    const maintain = (input as PatienceCheckInExt).maintain;
    const schedule = (input as PatienceCheckInExt).schedule;
    /* ADR-0017 #3 — the LIVE reclaim tombstone index (driver-threaded,
     * null/absent = nothing armed). It deliberately does NOT join the
     * business-minute gate below: with no maintain/schedule book the two
     * void-capable readers short-circuit on their own `undefined` book
     * before ever consulting the index, so an reclaim-only run keeps the
     * pre-door shape (zero clock math) — the shield veto below NEVER
     * consults it (protection is not capacity). */
    const reclaims = (input as PatienceCheckInExt).reclaims ?? null;
    const atBusinessMin =
      shield === undefined && maintain === undefined && schedule === undefined
        ? 0
        : shieldBusinessMinuteOf(input.context.clocks);
    for (const unit of input.units) {
      const predicted = waitByUnit.get(unit.id);
      if (predicted === undefined) continue; // only queued units bounce from patience
      if (unit.waitingOn !== null || unit.routeHops.length === 0) continue;
      const elapsed = unit.accumulatedLatencyUs + unit.inspectionCostUs;
      const mode = modeByType.get(unit.type) ?? "sigmoid-budget";
      /* Queue-head node, hoisted once (routeHops[0] — the FIX-8 queue-member-
       * implies-hop invariant names it): the shield veto, the attendance veto
       * and the job-window budget all read the SAME head. */
      const queueNode = unit.routeHops[0];
      if (mode === "corrupts") {
        /* §3.1 corrupt-not-bounce: exhaustion MARKS the unit once (die cast
         * never re-rolled — a unit already marked rides its verdict to the
         * terminal); the bounce probability stays 0 by construction. */
        if (marks.has(unit.id)) continue;
        if (elapsed + predicted < unit.patienceUs) continue; // still inside budget
        /* SHIELDED queue node (routeHops[0] — the FIX-8 queue-member-implies-
         * hop invariant names it): the exhaustion die is NEVER cast, the mark
         * never lands, the response completes as a plain served terminal.
         * Per-unit stream discipline means skipping this unit's draw shifts
         * nobody else's dice — the veto has zero blast radius. */
        if (queueNode !== undefined && nodeShielded(shield, queueNode, atBusinessMin)) continue;
        marks.set(
          unit.id,
          corruptionVerdictFor(corruptionProbability, config.runSeed, input.context.minute, unit.id),
        );
        markedThisTick = true;
        continue;
      }
      /* ADR-0015 (Maintain 2/5) ATTENDANCE VETO — gated BEFORE the
       * abandonment die is cast, for EVERY bounce mode (corrupts branched
       * away above; its exhaustion die stays shield-owned in v0 — honest
       * division of labour between the two vetoes): a queued unit whose
       * queue-head node is manned by a live band SKIPS the die entirely.
       * The unit HOLDS — elapsed keeps accruing, the wait keeps
       * re-predicting, capacity is still consumed; what attendance absorbs
       * is the GIVING-UP, not the queueing (the v0 absorb-not-prevent
       * choice — new mechanics postdating the ADR-0015 #1 numerics
       * ratification, RATIFIED 2026-10-17 (ADR-0017 #6) with the wave-23
       * game-feel batch). Zero blast radius exactly as the shield veto
       * cites above:
       * "skipping this unit's draw shifts nobody else's dice" — and with
       * NO book on input this line answers null without touching a Map. */
      if (queueNode !== undefined && maintainInForce(maintain, queueNode, atBusinessMin, reclaims) !== null) continue;
      /* ADR-0015 (Schedule 2/5) WINDOW-AS-DEADLINE — patience-mode "window"
       * BRANCH ONLY: inside a live band the job's effective budget becomes
       * the sim-time distance to the band's trailing edge
       * (`jobBandDistanceUs`), replacing the unit's authored patience —
       * "the window is the constraint" (hosting_game.md:1947). A job that
       * fits HOLDS (p = 0); a job that cannot finish by the edge FAILS
       * THERE (p = 1 — the certain path: "Jobs that don't finish by 06:00
       * didn't happen" :4995; the engine's fail terminal is the bounce, the
       * card's "they fail and RETRY" is the retry-policy layer above).
       * Threshold math, ZERO RNG: window mode answers p ∈ {0,1} and both
       * answers skip the "bounce" draw — the band never touches the stream.
       * No live band (or no book at all) ⇒ the authored budget governs —
       * byte-identical to every pre-schedule run, pinned both ways. */
      const band =
        mode === "window" && queueNode !== undefined
          ? jobWindowInForce(schedule, queueNode, atBusinessMin, reclaims)
          : null;
      const budgetUs = band === null ? unit.patienceUs : jobBandDistanceUs(band, input.context.clocks);
      const probability = patienceProbabilityFor(mode, elapsed, predicted, budgetUs);
      if (probability <= FIXED_ZERO) continue;
      const certain = probability >= FIXED_UNIT;
      if (
        certain ||
        rollUnder(probability, streamFor(config.runSeed, "bounce", input.context.minute, unit.id).nextU32())
      ) {
        bounced.push(unit.id);
      }
    }
    if (prior === undefined && !markedThisTick) {
      return Object.freeze({ bounced: Object.freeze(bounced) }); // historical shape, byte-ident
    }
    const out: PatienceCheckOutExt = Object.freeze({
      bounced: Object.freeze(bounced),
      corruption: Object.freeze({
        marks: Object.freeze(marks),
        corruptedCount: prior?.corruptedCount ?? 0,
      }),
    });
    return out;
  };
}

/** Driver-supplied extra: the live corruption slice (absent = dormant), the
 *  ADR-0014 #D2 pre-arm book (absent = the shield veto never reads), the
 *  two ADR-0015 2/5 window books (absent = attendance veto inert / window
 *  mode keeps its authored budget — the byte-identity switch per book), and
 *  the ADR-0017 #3 LIVE reclaim tombstone index (absent/null = no void
 *  checks; when armed it collects pre-tombstone attendance/job windows at
 *  the two window reads ONLY — the shield veto and the corruption slice are
 *  engine/protection surfaces, NEVER voided). */
export interface PatienceCheckInExt extends PatienceCheckIn {
  readonly corruption?: CorruptionState;
  readonly shield?: ShieldBook;
  readonly maintain?: MaintainBook;
  readonly schedule?: JobWindowBook;
  readonly reclaims?: ReadonlyMap<EntityId, ReclaimEntry>;
}

/** Step-9 out-of-band answer: the merged slice whenever the channel is
 *  live (marks in flight or a lifetime count on the books). */
export interface PatienceCheckOutExt extends PatienceCheckOut {
  readonly corruption?: CorruptionState;
}

/**
 * The exhaustion die, cast ONCE per unit (stream discipline: a NEW
 * per-unit-key "corrupt" domain — the "bounce" stream never sees it, so
 * enabling corrupts cannot reshape any other mode's bounce pattern).
 * Certainty and zero skip the draw, exactly like the bounce gate above.
 */
function corruptionVerdictFor(
  probability: Fixed,
  runSeed: RunSeed,
  minute: number,
  unitId: EntityId,
): boolean {
  if (probability <= FIXED_ZERO) return false;
  if (probability >= FIXED_UNIT) return true;
  return rollUnder(probability, streamFor(runSeed, "corrupt", minute, unitId).nextU32());
}

/* ═══════════════════════════ Step 10 · Outcome (4 terminals) ═════════════════ */

/**
 * Resolves the four terminals (R-11) for every candidate:
 *   bounced = patience expiry, hard-ceiling shed, or a NEUTRALIZED adversarial
 *             unit blocked at inspection — the frozen terminal set has no
 *             "blocked-true-positive" slot; causeId attribution keeps the two
 *             cases distinguishable end-to-end (§7.0 Attribution Ledger);
 *   blocked-false-positive = benign intent stopped by an inspection verdict
 *             (the amber 403 — G3's cost ticker);
 *   landed = adversarial unit with an empty path (reached its goal node);
 *   served = benign unit with an empty path.
 */
export const defaultOutcomeStep: TickStep<OutcomeIn, OutcomeOut> = (input) => {
  const ext = input as OutcomeInExt;
  const bouncedSet = new Set<EntityId>(input.bounced);
  const completedSet = new Set<EntityId>(input.completed);
  const blockedAt = new Map<EntityId, EntityId>();
  for (const verdict of input.inspections) {
    if (verdict.blocked) blockedAt.set(verdict.unitId, verdict.nodeId);
  }
  const outcomes: Outcome[] = [];
  const events: SimEvent[] = [];
  for (const candidate of input.candidates) {
    const unit = ext.unitsById.get(candidate.unitId);
    if (unit === undefined) continue;
    const resolution = resolveTerminal(candidate, unit, bouncedSet, completedSet, blockedAt);
    if (resolution === null) continue; // still in flight
    const atUs = input.context.clocks.simUs;
    const causeId = asCauseId(resolution.cause);
    outcomes.push(Object.freeze({ unitId: unit.id, terminal: resolution.terminal, atUs, causeId }));
    events.push(terminalEvent(resolution.terminal, unit.id, candidate, atUs, input.context.tick, causeId));
  }
  return Object.freeze({ outcomes: Object.freeze(outcomes), events: Object.freeze(events) });
};

function resolveTerminal(
  candidate: OutcomeCandidate,
  unit: Unit,
  bouncedSet: ReadonlySet<EntityId>,
  completedSet: ReadonlySet<EntityId>,
  blockedAt: ReadonlyMap<EntityId, EntityId>,
): { terminal: OutcomeTerminal; cause: string } | null {
  if (candidate.terminal !== null) {
    return { terminal: candidate.terminal, cause: `outcome:${unit.id}` };
  }
  if (bouncedSet.has(unit.id)) {
    return { terminal: "bounced", cause: `bounce:${unit.id}` };
  }
  const blockedNode = blockedAt.get(unit.id);
  if (blockedNode !== undefined) {
    return isAdversarialIntent(unit.trueIntent)
      ? { terminal: "bounced", cause: `defense:${blockedNode}:${unit.id}` } // neutralized
      : { terminal: "blocked-false-positive", cause: `false-positive:${blockedNode}:${unit.id}` };
  }
  if (completedSet.has(unit.id)) {
    return isAdversarialIntent(unit.trueIntent)
      ? { terminal: "landed", cause: `breach:${candidate.targetId ?? "goal"}:${unit.id}` }
      : { terminal: "served", cause: `served:${unit.id}` };
  }
  return null;
}

function terminalEvent(
  terminal: OutcomeTerminal,
  unitId: EntityId,
  candidate: { nodeId: EntityId | null; targetId: EntityId | null },
  atUs: SimTimeUs,
  tick: SimTick,
  causeId: CauseId,
): SimEvent {
  const base = { atUs, tick, causeId };
  switch (terminal) {
    case "served":
      return Object.freeze({ ...base, kind: "served", unitId, nodeId: candidate.nodeId ?? asEntityId("goal") });
    case "bounced":
      return Object.freeze({ ...base, kind: "bounced", unitId, nodeId: candidate.nodeId });
    case "blocked-false-positive":
      return Object.freeze({
        ...base,
        kind: "blocked-false-positive",
        unitId,
        nodeId: candidate.nodeId ?? asEntityId("waf"),
      });
    case "landed":
      return Object.freeze({ ...base, kind: "landed", unitId, targetId: candidate.targetId ?? asEntityId("goal") });
  }
}

/* ═══════════════════════════ Step 11 · Backpressure ═══════════════════════════ */

/**
 * The storm engine (R-12): benign bounced / false-positive outcomes re-enter
 * the roster when their backoff matures as NEW retry units carrying `retryOf`
 * lineage — the storm EMERGES, unscripted: retries raise ρ, ρ raises the
 * hockey stick, the stick raises bounces. "Benign" gates the whole admitted
 * list (both event kinds alike; hard-ceiling SHEDS ride the "bounced" branch,
 * they arrive as bounced terminals, not a distinct kind). Adversarial neutralizations never retry (fairness
 * guard, §4.1 Q4). Served customers seed the viral loop on the same re-entry
 * channel: referral drafts (new source identity, prospect intent) and
 * return-visit drafts (same source). Retry depth caps at
 * RetryPolicy.maxRetries; backoff/jitter SCHEDULING is applied by the driver
 * (UnitDraft has no schedule field in the frozen contract).
 */
export function createBackpressureStep(
  config: Pick<DefaultPipelineConfig, "referralProbability" | "returnProbability">,
): TickStep<BackpressureIn, BackpressureOut> {
  return (input) => {
    const ext = input as BackpressureInExt;
    const reentries: UnitDraft[] = [];
    const events: SimEvent[] = [];
    let retries = 0;
    for (const outcome of input.outcomes) {
      const unit = ext.unitsById.get(outcome.unitId);
      if (unit === undefined) continue;
      const benign = !isAdversarialIntent(unit.trueIntent);
      if (outcome.terminal === "bounced" || outcome.terminal === "blocked-false-positive") {
        if (!benign) continue; // defense kills the packet, not the queue
        const depth = ext.retryDepthById.get(unit.id) ?? 0;
        if (depth >= input.policy.maxRetries) continue; // even clients run out of patience
        reentries.push(
          Object.freeze({
            type: unit.type,
            sizeCost: unit.sizeCost,
            patienceUs: unit.patienceUs,
            trueIntent: unit.trueIntent,
            source: Object.freeze({
              identity: `${unit.source.identity}#r${depth + 1}`,
              reputation: unit.source.reputation,
            }),
            retryOf: unit.id,
          }),
        );
        retries += 1;
        events.push(
          Object.freeze({
            kind: "retry",
            atUs: outcome.atUs,
            tick: input.context.tick,
            causeId: asCauseId(`retry:${unit.id}:${depth + 1}`),
            unitId: unit.id,
            retryOf: unit.id,
          }) satisfies SimEvent,
        );
        continue;
      }
      if (outcome.terminal !== "served" || unit.trueIntent !== "customer") continue;
      const perUnit = input.rng.fork(`viral:${unit.id}`);
      if (rollUnder(config.referralProbability, perUnit.nextU32())) {
        reentries.push(
          Object.freeze({
            type: unit.type,
            sizeCost: unit.sizeCost,
            patienceUs: unit.patienceUs,
            trueIntent: "prospect" as const,
            source: Object.freeze({ identity: `ref:${unit.source.identity}`, reputation: unit.source.reputation }),
            retryOf: null,
          }),
        );
      }
      if (rollUnder(config.returnProbability, perUnit.nextU32())) {
        reentries.push(
          Object.freeze({
            type: unit.type,
            sizeCost: unit.sizeCost,
            patienceUs: unit.patienceUs,
            trueIntent: "customer" as const,
            source: Object.freeze({ identity: unit.source.identity, reputation: unit.source.reputation }),
            retryOf: null,
          }),
        );
      }
    }
    const retryShare =
      input.outcomes.length === 0
        ? FIXED_ZERO
        : clampUnit(fromRatio(BigInt(retries), BigInt(Math.max(1, input.outcomes.length))));
    const pressure = clampUnit(mul(retryShare, input.stormFactor));
    return Object.freeze({
      reentries: Object.freeze(reentries),
      pressure,
      events: Object.freeze(events),
    });
  };
}

/* ═══════════════════════════ Step 12 · State economics ═══════════════════════════ */

/**
 * THE single writer of the observed layer (§4.1 R-13/R-18). The default
 * publishes per-node ground aggregates as Exact live cells (queueDepth,
 * utilizationRho) plus an estate-wide retry-pressure cell (metastability
 * read-out, R-12). Money is passed through untouched — the economy wave
 * replaces this slot with real ledger/invoicing (C5 restatement) without
 * touching the driver.
 */
/** Driver-supplied extra: this tick's corrupted completions (step 9/10
 *  side channel). Absent/empty ⇒ zero writes — the default-off law. */
export interface StateEconomicsInExt extends StateEconomicsIn {
  readonly corruptions?: readonly CorruptOutcome[];
}

export function createStateEconomicsStep(estateAnchor: EntityId): TickStep<StateEconomicsIn, StateEconomicsOut> {
  const exactCell = (value: number | bigint): ObservedCell<unknown> =>
    Object.freeze({
      value,
      fidelity: ResolutionBand.Exact,
      freshnessUs: 0n,
      coverage: FIXED_UNIT,
      certainty: FIXED_UNIT,
      status: "live" as const,
    });
  // rec#3 (publish-on-change discipline): these cells are constant-shaped
  // snapshots (freshnessUs is a literal 0n here, never a wall stamp), so a
  // re-publish of an identical value produces a byte-equivalent cell under
  // the same key — the driver's Map copy keeps insertion order for existing
  // keys, hence skipping is unobservable in the digest. The staleness-flip
  // law ("aged cells progress even when no batch writes") lives in the
  // observed/ STORE's apply-side re-derivation (applyObservedWrites re-runs
  // deriveCell per binding on every batch; `read()` only returns stored
  // cells), not in write cadence: an
  // already-published unchanged cell carries the exact same freshnessUs the
  // skipped rewrite would have carried, so empty-batch ageing proceeds
  // identically. A foreign cell under the same key (any field differs) is
  // NOT matched, so restatements still flow through.
  const alreadyPublished = (
    observed: ReadonlyMap<ObservedKey, ObservedCell<unknown>>,
    key: ObservedKey,
    value: number | bigint,
  ): boolean => {
    const prior = observed.get(key);
    return (
      prior !== undefined &&
      prior.value === value &&
      prior.fidelity === ResolutionBand.Exact &&
      prior.freshnessUs === 0n &&
      prior.coverage === FIXED_UNIT &&
      prior.certainty === FIXED_UNIT &&
      prior.status === "live"
    );
  };
  return (input) => {
    const writes: ObservedWrite[] = [];
    const published = input.prior.observed;
    const cause = (what: string): CauseId => asCauseId(`observe:${input.context.tick}:${what}`);
    const publish = (key: ObservedKey, value: number | bigint, what: string): void => {
      if (alreadyPublished(published, key, value)) return;
      writes.push(Object.freeze({ key, cell: exactCell(value), causeId: cause(what) }));
    };
    for (const nodeId of sortedIds(input.nodes.keys())) {
      const node = input.nodes.get(nodeId);
      if (node === undefined) continue;
      publish(observedKey(nodeId, "queueDepth"), node.queueDepth, `${nodeId}:queueDepth`);
      publish(observedKey(nodeId, "utilizationRho"), node.utilizationRho, `${nodeId}:utilizationRho`);
    }
    const pressureNumerator = input.reentries.length;
    const pressureDenominator = Math.max(1, input.outcomes.length);
    const pressureKey = observedKey(estateAnchor, "retryPressure");
    publish(pressureKey, clampUnit(fromRatio(BigInt(pressureNumerator), BigInt(pressureDenominator))), "retryPressure");
    /* §3.1 corrupts-mode truth cells: one exact int per corrupted COMPLETED
     * response (the unit id is unique per response, so the count is 1 —
     * presence IS the damage; absence = never corrupted). Nothing to fold,
     * nothing written: default-off law. */
    for (const corrupted of (input as StateEconomicsInExt).corruptions ?? []) {
      publish(observedKey(corrupted.unitId, "corruptedCount"), 1, `${String(corrupted.unitId)}:corruptedCount`);
    }
    return Object.freeze({
      cash: input.prior.cash,
      ledgerEntry: null,
      observedWrites: Object.freeze(writes),
      laneStats: Object.freeze([...input.lanes.values()]),
      events: Object.freeze([]),
    });
  };
}

/* ═══════════════════════════ Step 12.5 · Rule phase ═══════════════════════════ */

/** The legal empty interpreter (§4.5: "an empty interpreter is a legal
 *  implementation"). The policy wave supplies the real closed-enum card
 *  evaluator into this exact slot; the driver hands it the fresh observed
 *  map, the rule book, the suppressed set, and a "rules" stream. */
export const emptyRulePhaseStep: TickStep<RulePhaseIn, RulePhaseOut> = () =>
  Object.freeze({ firings: Object.freeze([]), intents: Object.freeze([]) });

/* ═══════════════════════════ Slots bundle ═══════════════════════════ */

/** All 13 default steps wired for a run — the gate-assembly wave's starting
 *  point; override any slot before handing the bundle to createTickDriver. */
export function createDefaultSlots(config: DefaultPipelineConfig): PipelineSlots {
  if (config.defaultPatienceUs <= 0n) {
    throw new Error("default pipeline: defaultPatienceUs must be > 0 (the bounce curve needs a budget)");
  }
  const estateAnchor = config.dnsNodeId ?? config.expressPath[0];
  if (estateAnchor === undefined) {
    throw new Error("default pipeline: need dnsNodeId or a non-empty expressPath");
  }
  return Object.freeze({
    arrival: createArrivalStep(config),
    scoring: defaultScoringStep,
    qosClassify: defaultQosClassifyStep,
    route: createRouteStep(config),
    serve: defaultServeStep,
    queueWait: defaultQueueWaitStep,
    inspect: createInspectStep(config),
    dependencyBlock: defaultDependencyBlockStep,
    patienceCheck: createPatienceCheckStep(config),
    outcome: defaultOutcomeStep,
    backpressure: createBackpressureStep(config),
    stateEconomics: createStateEconomicsStep(estateAnchor),
    rulePhase: emptyRulePhaseStep,
  });
}
