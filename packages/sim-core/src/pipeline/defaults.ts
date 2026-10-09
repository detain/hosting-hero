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
  SimTick,
  SimTimeUs,
  SlotAssignment,
  StateEconomicsIn,
  StateEconomicsOut,
  TickStep,
  Unit,
  UnitDraft,
  CauseId,
  ObservedCell,
  ObservedKey,
  ObservedWrite,
} from "../types.ts";
import { asCauseId, asEntityId, observedKey, ResolutionBand } from "../types.ts";
import { FIXED_SCALE, FIXED_UNIT, FIXED_ZERO, clampUnit, fromRatio, mul, sub } from "../kernel/fixed.ts";
import { streamFor } from "../kernel/rng.ts";
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
import { DEFAULT_KNEE_RHO, effectiveRho, hockeyStickWaitUs, utilization } from "./queue.ts";

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
  /** AUDIT FIX (g09 TOP-PROBLEM #2: "populationEffect is a lying field"):
   *  the Empty Server Spiral repel loop (§2.13 "The Population Effect" /
   *  Herding), keyed by `Unit.type`. The host derives each row from
   *  LoadedVisitor when `populationEffect && herdingEnabled`
   *  (coefficient = herdingCoefficient; floor = authored capacity anchor).
   *  Absent/empty ⇒ zero draws, byte-identical arrivals. */
  readonly populationEffects?: Readonly<
    Record<string, { readonly coefficient: Fixed; readonly floor: number }>
  >;
}

/* ═══════════════════════════ Step 1 · Arrival ═══════════════════════════ */

/** Envelope rate → whole + fractional units this sim-minute; the fraction is
 *  one Bernoulli on the "arrival" stream (exact Fixed comparison). Ids are
 *  minted `${tableId}@${tick}#${envelopeIndex}.${unitIndex}` — unique across
 *  the run because the tick embeds.
 *
 *  ⚠ CONSUMER NOTE (F2): retry/referral re-entries do NOT flow through this
 *  step. The driver mints their ids (`re<n>@${tick}`) and appends matured
 *  drafts straight into the roster BETWEEN steps — no arrival envelope, no
 *  arrival events, and the re-entry delay is the backoff schedule (≥1 tick,
 *  arbitrary multiples). Arrival-counting consumers therefore miss retry
 *  storms; count `SimEvent` arrivals or roster growth, not this step alone. */
/** Driver-stamped extension of the frozen ArrivalIn: the count of units
 *  ALREADY in the system when this tick's arrivals are drawn (pre-tick
 *  roster + matured re-entries). Invisible to foreign steps; read ONLY when
 *  the host configured `populationEffects` (presence gate). */
export interface ArrivalInExt extends ArrivalIn {
  readonly inFlightUnits?: number;
}

/** Boundary parse (Laws 2/4): closed-key Map with every row validated once
 *  — coefficient a 0..1 Fixed, floor a positive safe integer. An empty/
 *  absent table returns an empty Map: the step then never reads
 *  `inFlightUnits` and never rolls. */
function parsePopulationEffects(
  table: DefaultPipelineConfig["populationEffects"],
): ReadonlyMap<string, { readonly coefficient: Fixed; readonly floor: number }> {
  const out = new Map<string, { readonly coefficient: Fixed; readonly floor: number }>();
  if (table === undefined) return out;
  for (const type of Object.keys(table).sort()) {
    const row = table[type] as { readonly coefficient: Fixed; readonly floor: number };
    if (typeof row.coefficient !== "bigint" || row.coefficient < FIXED_ZERO || row.coefficient > FIXED_UNIT) {
      throw new Error(`arrival: populationEffects["${type}"].coefficient must be a 0..1 Fixed, got ${String(row.coefficient)}`);
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
      for (let i = 0; i < count; i += 1) {
        /* THE REPEL LOOP (§2.13 "The Population Effect" / Herding, audit
           g09 TOP-PROBLEM #2): a herding population judges the server
           BEFORE visiting. Below the authored floor, P(skip) grows linearly
           with the shortfall — a half-empty game server repels half its
           would-be players, and every repelled arrival deepens the spiral.
           Above the floor p = 0: the v0 consumer implements the spiral's
           REPULSE half only (the attract half would mint units the envelope
           never authored — conservation-law territory, reported). The draw
           rides the "arrival" stream FIRST for the candidate, before its
           jitter/source rolls; repelled visitors simply never come — no
           unit, no event (diegetically honest: you cannot observe someone
           who stayed home). Retries/re-entries skip this step entirely
           (⚠ consumer note above). */
        const effect = population.get(envelope.tableId);
        if (effect !== undefined && inFlight !== undefined && inFlight < effect.floor) {
          const shortfall = BigInt(effect.floor - inFlight);
          const repelP = (effect.coefficient * shortfall) / BigInt(effect.floor);
          if (repelP > FIXED_ZERO && rollUnder(repelP, rng.nextU32())) continue;
        }
        const unitId = asEntityId(`${envelope.tableId}@${context.tick}#${e}.${i}`);
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
export const defaultServeStep: TickStep<ServeIn, ServeOut> = (input) => {
  const { context, nodes } = input;
  const simNow = context.clocks.simUs;
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

    // (c) FIFO admissions into the lowest free slots
    while (queue !== null && queue.length > 0) {
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
 *  - corrupts — "corrupt-not-bounce": the unit stays (p = 0 here); the
 *    DAMAGE-instead-of-departure half needs a terminal/evidence channel the
 *    frozen 4-terminal Outcome set does not carry — reported for batch-E,
 *    never silently invented.
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
 */
export function createPatienceCheckStep(
  config: Pick<DefaultPipelineConfig, "runSeed" | "patienceModeByType">,
): TickStep<PatienceCheckIn, PatienceCheckOut> {
  const modeByType = parsePatienceModeByType(config.patienceModeByType);
  return (input) => {
    const waitByUnit = new Map<EntityId, SimTimeUs>();
    for (const wait of input.waits) waitByUnit.set(wait.unitId, wait.queueWaitUs);
    const bounced: EntityId[] = [];
    for (const unit of input.units) {
      const predicted = waitByUnit.get(unit.id);
      if (predicted === undefined) continue; // only queued units bounce from patience
      if (unit.waitingOn !== null || unit.routeHops.length === 0) continue;
      const elapsed = unit.accumulatedLatencyUs + unit.inspectionCostUs;
      const probability = patienceProbabilityFor(
        modeByType.get(unit.type) ?? "sigmoid-budget",
        elapsed,
        predicted,
        unit.patienceUs,
      );
      if (probability <= FIXED_ZERO) continue;
      const certain = probability >= FIXED_UNIT;
      if (
        certain ||
        rollUnder(probability, streamFor(config.runSeed, "bounce", input.context.minute, unit.id).nextU32())
      ) {
        bounced.push(unit.id);
      }
    }
    return Object.freeze({ bounced: Object.freeze(bounced) });
  };
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
