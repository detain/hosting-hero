/**
 * `@hh/sim-core` — THE SHARED CONTRACT.
 *
 * Every later module (rules interpreter, board, economy, renderer adapters,
 * worker host, Node MP harness) compiles against this file. Shapes here trace
 * to reports/MASTER_REPORT.md (§3 architecture, §4.1 WS-1 pipeline/time/RNG/
 * ground-observed laws, §4.4 WS-4 contract & ledger objects, §7.0 P0 skeleton)
 * and hosting_game.md §7.11–§7.14, §7.8d, §0.2.
 *
 * Determinism laws that bind everything below (MASTER_REPORT §3.4):
 *  - integer µs time and Q16.16 fixed-point only in math paths; floats are
 *    display-only and can never touch replay state;
 *  - no `Math.random`, no `Date.now`, no `Intl`, Map-insertion-order iteration,
 *    stable sorted output;
 *  - all randomness through counter-based keyed streams
 *    `(runSeed, domain, simMinute, entityId)` — §4.1 R-16;
 *  - every state mutation carries a `CauseId` — §7.0 "unretrofittable"
 *    Attribution Ledger law.
 */

/* ═══════════════════════════ Branding ═══════════════════════════ */

declare const HH_BRAND: unique symbol;

/** Attach a nominal identity to a structural type so ids never mix. */
export type Branded<T, Tag extends string> = T & { readonly [HH_BRAND]: Tag };

/* ═══════════════════════════ Identities & scalars ═════════════════ */

/** Stable entity identifier (units, nodes, lanes, contracts…). Opaque: never
 *  parse meaning out of it; carry it as a key. */
export type EntityId = Branded<string, "EntityId">;

/** Parse an external string into an EntityId (boundary parse — Law 2). */
export function asEntityId(raw: string): EntityId {
  if (raw.length === 0) throw new Error("asEntityId: empty id");
  return raw as EntityId;
}

/** Attribution stamp on EVERY state mutation (MASTER_REPORT §7.0, WS-4 R4).
 *  Stamped at creation, never back-filled. */
export type CauseId = Branded<string, "CauseId">;
export function asCauseId(raw: string): CauseId {
  if (raw.length === 0) throw new Error("asCauseId: empty cause id");
  return raw as CauseId;
}

/** Metric noun from the observed-truth namespace (Policy grammar,
 *  MASTER_REPORT Appendix B §2.2). Instrumentation gates availability. */
export type MetricId = Branded<string, "MetricId">;
export function asMetricId(raw: string): MetricId {
  if (raw.length === 0) throw new Error("asMetricId: empty metric id");
  return raw as MetricId;
}

/** Policy card id — rules are "visible, ordered, editable, auditable". */
export type RuleId = Branded<string, "RuleId">;
export function asRuleId(raw: string): RuleId {
  if (raw.length === 0) throw new Error("asRuleId: empty rule id");
  return raw as RuleId;
}

/** Seed for the whole run; every RNG stream derives from it (R-14). */
export type RunSeed = Branded<bigint, "RunSeed">;
export function asRunSeed(raw: bigint): RunSeed {
  return raw as RunSeed;
}

/** Lowercase hex digest (sha-256 hex by convention; hashing lives in the
 *  save/replay module, not this contract). */
export type HashHex = string;

/**
 * Simulation time — INTEGER MICROSECONDS ONLY (bigint).
 *
 * bigint is chosen over number because per-type rescaling puts "years" on the
 * same pipeline (hosting_game.md §7.8d: web seconds … colo years), where a
 * µs-scale timeline over a long save exceeds 2^53; bigint keeps every DES key
 * exact. A SimTimeUs is never negative: `subUs` fails loud on a negative
 * result (kernel/time.ts).
 */
export type SimTimeUs = bigint;

/** Whole-minute index of the sim clock. Range-safe as number: the RNG keys on
 *  it (§4.1 R-16) and sim-minutes over even a 300-hour run stay far below 2^53. */
export type SimMinute = number;

/** Macro-tick index (aggregate state / projection / checkpoint boundary).
 *  Tick length = one sim minute at the engine default (kernel/time.ts). */
export type SimTick = bigint;

/** Money in signed integer micro-units of the accounting currency (µ$),
 *  bigint so TCV-scale numbers never round.
 *
 *  CONTRACT DECISION: money is integer micro-units, NOT Q16.16 Fixed —
 *  Q16.16's ±32768 whole-unit ceiling cannot hold contract values. Fixed is
 *  reserved for ratios / probabilities / multipliers. */
export type MoneyUnit = Branded<bigint, "MicroUsd">;
export function asMoney(raw: bigint): MoneyUnit {
  return raw as MoneyUnit;
}

/**
 * Q16.16 fixed-point number: raw bigint, value = raw / 65536.
 * Representable domain is 32-bit two's complement of raw units
 * (≈ −32768.0 … +32767.99998). Arithmetic + overflow checks:
 * kernel/fixed.ts. `toNumber` is DISPLAY ONLY (MASTER_REPORT §4.1:
 * "Fixed-point core … bounce sigmoid").
 */
export type Fixed = bigint;

/* ═══════════════════════════ Tiers ═══════════════════════════ */

/** The ONE engine's seven board tiers (ratified decision #6: one engine,
 *  7 tiers, per-tier verb sets). Tier gates which verbs/buildables are live. */
export enum Tier {
  Tier0_SharedCloset = 0,
  Tier1_SharedWeb = 1,
  Tier2_VPS = 2,
  Tier3_Dedicated = 3,
  Tier4_PoP = 4,
  Tier5_Colo = 5,
  Tier6_FinColoSovereign = 6,
}

/* ═══════════════════════════ RNG discipline ═══════════════════════════ */

/** Key of a counter-based stream: position is (key, internal counter), so
 *  consumption ORDER in one domain can never perturb another (§4.1 R-16). */
export interface RngKey {
  readonly runSeed: RunSeed;
  /** Slash-joined domain path, e.g. "director", "wave", "inspect/edge-7".
   *  Must be a stable literal per call site — it IS the stream identity. */
  readonly domain: string;
  readonly simMinute: SimMinute;
  /** null for aggregate (non-entity) draws. */
  readonly entityId: EntityId | null;
}

export interface RngStream {
  readonly key: RngKey;
  /** Next unsigned 32-bit value. */
  nextU32(): number;
  /** Uniform integer in [0, n). Rejection-sampled — never modulo-biased,
   *  never floating point. Throws on n < 1 or n ≥ 2^32. */
  range(n: number): number;
  /** Independent child stream: domain path extends, counter restarts at 0.
   *  Forking consumes nothing from the parent. */
  fork(domain: string): RngStream;
}

/* ═══════════════════════════ Ground / observed (§4.1 R-66…R-72) ═════════════════ */

/** Telemetry resolution band — "telemetry resolution bands determine what is
 *  true" (§4.1). Drives UI fidelity (stroke/blur) in the renderer adapter. */
export enum ResolutionBand {
  None = 0,
  Coarse = 1,
  Medium = 2,
  Fine = 3,
  Exact = 4,
}

/**
 * Per-property fog cell — THE binding contract between core, renderer and
 * seats (MASTER_REPORT §3.1 law 3). Degradation is a property of this binding
 * layer, not of 200 components. Same shape worker→main→Pixi, server→relay,
 * save→restore. Uninstrumented means `value: null` with coverage 0 —
 * "nothing, not zero" (§4.1 R-66…R-72).
 */
export interface ObservedCell<T> {
  /** null = never observed (unknown). A stale probe may keep its last value;
   *  `status` says whether to trust it. */
  readonly value: T | null;
  readonly fidelity: ResolutionBand;
  /** Age of the last sample, µs (observation latency 30–60 s default). */
  readonly freshnessUs: SimTimeUs;
  /** Instrumentation coverage 0..1 (Fixed). */
  readonly coverage: Fixed;
  /** Certainty 0..1 (Fixed) — renderer maps certainty→stroke, confidence→blur. */
  readonly certainty: Fixed;
  readonly status: "live" | "stale" | "unknown";
}

/** Flat observed-store key: `${entityId}::${property}`. Step 12 is the ONLY
 *  writer; HUD/renderer read observed cells only (§4.1 R-13/R-18). */
export type ObservedKey = Branded<string, "ObservedKey">;
export function observedKey(entity: EntityId, property: string): ObservedKey {
  if (property.length === 0) throw new Error("observedKey: empty property");
  return `${entity}::${property}` as ObservedKey;
}

/** One step-12 observed-layer write (single-writer guarantee). */
export interface ObservedWrite {
  readonly key: ObservedKey;
  readonly cell: ObservedCell<unknown>;
  readonly causeId: CauseId;
}

/* ═══════════════════════════ Clocks (§4.1 R-20…R-31) ═════════════════ */

/** Which clock an action/input belongs to. Dual-Clock rule: exactly one, and
 *  the business clock never pauses mid-incident. */
export type ClockKind = "sim" | "business" | "wall";

/** The three clocks, all integer µs, all derived from one monotonic real-time
 *  driver by scale factors (kernel/time.ts):
 *  - `simUs`      ops clock, speed-scaled (1 real s = 1 sim min at 1×);
 *  - `businessUs` macro clock, never scaled or paused (month ≈ every 7 real
 *                 min pending OD-2/D-1);
 *  - `wallUs`     drama/animation clock (1.5 s/hop cascade fuse, renderer
 *                 interpolation) — injected, never read from `Date.now`. */
export interface ClockState {
  readonly realUs: SimTimeUs;
  readonly simUs: SimTimeUs;
  readonly businessUs: SimTimeUs;
  readonly wallUs: SimTimeUs;
}

/** Per-tick identity bundle handed to every pipeline step. */
export interface TickContext {
  readonly tick: SimTick;
  /** Whole sim-minute index — an RNG key component (§4.1 R-16). */
  readonly minute: SimMinute;
  readonly clocks: ClockState;
}

/* ═══════════════════════════ Unit / Node / Lane ═══════════════════════════ */

/** Hidden purpose of a traffic unit — NEVER copied into any ObservedCell;
 *  the player only ever sees suspicion/confidence (R-02: "true_intent —
 *  never shown"). */
export type UnitIntent =
  | "customer" // paying or trial visitor
  | "prospect" // funnel traffic that may convert
  | "abuser" // customer-as-threat (§App A familyWeights.customerAsThreat)
  | "malicious" // scripted threat families (ddos, griefer, …)
  | "human-error" // the human threat family
  | "entropic" // hardware/entropy family
  | "systemic" // correlated/systemic family
  | "automaton"; // bots, crawlers, health checks

/** Origin reputation of a source (source-identity key granularity: G-6 open). */
export interface SourceRef {
  readonly identity: string;
  /** 0..1 composite reputation, scored not judged (R-45…R-54). */
  readonly reputation: Fixed;
}

/**
 * Traffic unit — the thing queues, waits and bounces. One record accumulates
 * through the pipeline; each step returns updated copies (never mutates).
 */
export interface Unit {
  readonly id: EntityId;
  /** Type id from the bundle (visitor.unitTerm vocabulary). */
  readonly type: string;
  /** Slot capacity consumed (size ≠ 1 everywhere: "slots not HP", R-32). */
  readonly sizeCost: Fixed;
  /** Millisecond budget carried per population (R-45; §App A patienceModel). */
  readonly patienceUs: SimTimeUs;
  readonly trueIntent: UnitIntent;
  readonly source: SourceRef;
  /** Retry lineage — required for emergent retry storms (§4.1 Q4). */
  readonly retryOf: EntityId | null;
  readonly arrivedAtTick: SimTick;
  /** Sum of per-hop service + queue waits so far (Lag Table input). */
  readonly accumulatedLatencyUs: SimTimeUs;
  /** Inspection cost accrued at hops (R-08). */
  readonly inspectionCostUs: SimTimeUs;
  /** Composite confidence C = 1 − Π(1 − cᵢ), 0..1, contributions never
   *  boolean (R-03). 0 until step 2 runs. */
  readonly confidence: Fixed;
  /** Set by step 3; null = unclassified (unclassified can only shed at
   *  random — WS-5 R57). */
  readonly qosClassId: string | null;
  /** Set by step 4 (node ids end-to-end, DNS as pre-board first hop).
   *  Empty until routed. */
  readonly routeHops: readonly EntityId[];
  /** Set by step 8: downstream node this slot is blocked on ("the single
   *  most important coupling", R-09). */
  readonly waitingOn: EntityId | null;
}

/** Draft as emitted by step 1 (Arrival) / step 11 (retry re-entry). */
export interface UnitDraft {
  readonly type: string;
  readonly sizeCost: Fixed;
  readonly patienceUs: SimTimeUs;
  readonly trueIntent: UnitIntent;
  readonly source: SourceRef;
  readonly retryOf: EntityId | null;
}

/** Inspection depth slider positions (R-08, §7.11). */
export type InspectionDepth = "pass-through" | "sample-1-in-20" | "inspect" | "challenge";

/** Shed order at capacity ("sold classes cannot be shed" binds into this —
 *  R-55…R-58 × WS-4 contracts). */
export type ShedOrder = "first-in-first-out" | "last-in-first-out" | "lowest-value-first" | "qos-weighted";

/** Per-node queueing discipline (R-81…R-85): the ONE explicit exception —
 *  hard-ceiling nodes fail instantly at capacity instead of queue-kneedle. */
export type NodeDiscipline = "hockey-stick" | "hard-ceiling";

/** One physical slot: occupied-but-blocked is a FIRST-CLASS state (retry
 *  storm requirement, §4.1 Q4). */
export interface NodeSlotRecord {
  readonly occupied: boolean;
  readonly unitId: EntityId | null;
  /** Per-slot `waiting_on` introspection ("a ring full of slots waiting on
   *  the same downstream"). */
  readonly waitingOn: EntityId | null;
  readonly releasedAtUs: SimTimeUs | null;
}

/** Service node. SLOTS, not HP (R-32): "100% and healthy, or 60% and dying
 *  of a slow dependency". */
export interface NodeRecord {
  readonly id: EntityId;
  /** Buildable/archetype id from the bundle. */
  readonly kind: string;
  /** S = slots.length. */
  readonly slots: readonly NodeSlotRecord[];
  /** Base per-hop service time (integer µs). */
  readonly serviceTimeUs: SimTimeUs;
  /** Mirror of queue.length for cheap HUD reads. */
  readonly queueDepth: number;
  /** FIFO waiting order (unit ids). */
  readonly queue: readonly EntityId[];
  readonly shedOrder: ShedOrder;
  readonly inspectionDepth: InspectionDepth;
  readonly discipline: NodeDiscipline;
  /** Instantaneous utilization ρ 0..1+ (definition open item G-1; windowed
   *  variant is a tuning module's job). Feeds the ρ/(1−ρ) knee (R-07). */
  readonly utilizationRho: Fixed;
  /** v0 single dependency (stub DB for G1). Multi-dependency edges extend
   *  the board graph, WS-2. */
  readonly dependencyNodeId: EntityId | null;
}

/** QoS class definition (player-defined 3–5 classes, R-55). */
export interface QosClassDef {
  readonly id: string;
  readonly label: string;
  readonly weight: Fixed;
  /** Lower number = shed earlier. */
  readonly shedPriority: number;
  /** Per-class latency budget. */
  readonly budgetUs: SimTimeUs;
  readonly inspectionDepth: InspectionDepth;
}

/**
 * Lane statistics — the stats-not-entities law (MASTER_REPORT §7.7b: the
 * renderer draws mote fields FROM aggregates, lanes never hold units).
 */
export interface LaneStats {
  readonly laneId: EntityId;
  /** Arrivals/throughput per sim-minute (Fixed). */
  readonly ratePerMin: Fixed;
  /** Reference into the latency-histogram store (per-hop distributions
   *  with p99 whiskers, R-52). Histograms live in a stats module. */
  readonly latencyDistributionRef: string;
  /** Per-QoS-class share of traffic, keyed by QosClassDef.id (shares sum ~1). */
  readonly classMix: Readonly<Record<string, Fixed>>;
  /** 0..1 composite health (degradation-not-destruction, R-73). */
  readonly health: Fixed;
}

/* ═══════════════════════════ 12-step pipeline (§7.13 / §4.1) ═════════════════
 * Every mechanic is a modifier on exactly one step. Steps are pure:
 * data-in → data-out, no hidden mutation, deterministic given their inputs
 * (RNG arrives explicitly via stream handles). Steps 1–11 run GROUND TRUTH;
 * step 12 is the ONLY writer of the observed layer; step 12.5 is the rule
 * phase (policy interpreter slot — an empty interpreter is a legal
 * implementation).
 */

/** Authored wave/spawn envelope (director never touches telegraphed
 *  composition, R-31). */
export interface WaveEnvelope {
  /** Wave-table id, recorded in the replay log (authored+seeded, §App A
   *  threats.waveTable). */
  readonly tableId: string;
  readonly role: "baseline" | "spike" | "wave";
  readonly shape: "ramp" | "plateau" | "decay";
  /** Units per sim-minute. */
  readonly ratePerMin: Fixed;
  /** Telegraphed silhouettes are visible to the player beforehand. */
  readonly telegraphed: boolean;
  readonly dominantFamily: ThreatFamily | "organic";
}

/** Purchasable retry policy (§4.1 Q4 counterability guards). */
export interface RetryPolicy {
  readonly maxRetries: number;
  readonly backoffBaseUs: SimTimeUs;
  readonly jitterPurchased: boolean;
}

export interface ArrivalIn {
  readonly context: TickContext;
  readonly envelopes: readonly WaveEnvelope[];
  readonly rng: RngStream;
}
export interface ArrivalOut {
  /** Fully-formed units entering the ingress this tick. */
  readonly units: readonly Unit[];
  readonly events: readonly SimEvent[];
}

export interface ScoringIn {
  readonly context: TickContext;
  readonly units: readonly Unit[];
  /** Evidence catalog: per-source per-metric confidence contributions cᵢ
   *  (never booleans, R-03). Producer: classification/defense modules. */
  readonly evidence: readonly ConfidenceContribution[];
}
export interface ConfidenceContribution {
  readonly unitId: EntityId;
  readonly metric: MetricId;
  /** 0..1 contribution cᵢ; composite C = 1 − Π(1 − cᵢ) is applied here. */
  readonly value: Fixed;
}
export interface ScoringOut {
  /** Units with `confidence` composed. */
  readonly units: readonly Unit[];
}

export interface QosClassifyIn {
  readonly context: TickContext;
  readonly units: readonly Unit[];
  readonly classes: readonly QosClassDef[];
}
export interface QosClassifyOut {
  /** Units with `qosClassId` set (or explicitly null = unclassified). */
  readonly units: readonly Unit[];
}

export interface RouteIn {
  readonly context: TickContext;
  readonly units: readonly Unit[];
  readonly nodes: ReadonlyMap<EntityId, NodeRecord>;
  /** Contract locks consulted here: "cheapest failover path may be
   *  contractually illegal" (§4.4, WS-4 RoutingLock). */
  readonly routingLocks: readonly RoutingLock[];
  /** Suspicion split point: express vs deep path (R-05; never maze the
   *  express lane — D-4). */
  readonly expressMaxConfidence: Fixed;
  readonly rng: RngStream;
}
export interface RouteOut {
  /** Units with `routeHops` filled. */
  readonly units: readonly Unit[];
}

export interface ServeIn {
  readonly context: TickContext;
  readonly units: readonly Unit[];
  readonly nodes: ReadonlyMap<EntityId, NodeRecord>;
}
export interface SlotAssignment {
  readonly unitId: EntityId;
  readonly nodeId: EntityId;
  readonly slotIndex: number;
  readonly serviceStartUs: SimTimeUs;
  readonly serviceEndUs: SimTimeUs;
  readonly blocked: boolean;
}
export interface ServeOut {
  readonly assignments: readonly SlotAssignment[];
  /** Unit ids at the head of the queue waiting for capacity. */
  readonly waiting: readonly EntityId[];
  /** Units shed this tick (R-06 shed order). */
  readonly shed: readonly EntityId[];
  /** Updated nodes (slots/queue changed — returned, never mutated). */
  readonly nodes: ReadonlyMap<EntityId, NodeRecord>;
}

export interface QueueWaitIn {
  readonly context: TickContext;
  readonly waiting: readonly EntityId[];
  readonly nodes: ReadonlyMap<EntityId, NodeRecord>;
  /** Knee threshold ρ (≈0.7 default — "the most important curve in the
   *  game", R-07; final sheet pending OD-2). */
  readonly kneeRho: Fixed;
}
export interface QueueWait {
  readonly unitId: EntityId;
  /** Closed form service_time × ρ/(1−ρ) above the knee; computed in Fixed
   *  so the curve is bit-reproducible (aggregate-per-class law: individual
   *  units are sampled only for outcome draws). */
  readonly queueWaitUs: SimTimeUs;
}
export interface QueueWaitOut {
  readonly waits: readonly QueueWait[];
}

export interface InspectIn {
  readonly context: TickContext;
  readonly units: readonly Unit[];
  /** Per-node inspection depth at the inspecting hop. */
  readonly depths: ReadonlyMap<EntityId, InspectionDepth>;
  /** Aggression slider 0..1 — moves the ROC curve, NEVER a damage number
   *  (R-52; G3). */
  readonly aggression: Fixed;
  readonly rng: RngStream;
}
export interface InspectionVerdict {
  readonly unitId: EntityId;
  readonly nodeId: EntityId;
  readonly costUs: SimTimeUs;
  /** Blocked here = candidate false positive until Outcome resolves. */
  readonly blocked: boolean;
  /** Suspicion after this hop (sticky decay ~10 min handled upstream). */
  readonly suspicionAfter: Fixed;
}
export interface InspectOut {
  readonly verdicts: readonly InspectionVerdict[];
}

export interface DependencyEdge {
  readonly upstreamNodeId: EntityId;
  readonly downstreamNodeId: EntityId;
  /** Correlation class for redundancy math (power|path|software|human|time). */
  readonly correlation: "power" | "path" | "software" | "human" | "time";
}
export interface DependencyBlockIn {
  readonly context: TickContext;
  readonly assignments: readonly SlotAssignment[];
  readonly edges: readonly DependencyEdge[];
}
export interface SlotBlock {
  readonly unitId: EntityId;
  /** Slot stays occupied while blocked (retry-storm prerequisite, Q4). */
  readonly waitingOn: EntityId;
}
export interface DependencyBlockOut {
  readonly blocks: readonly SlotBlock[];
}

export interface PatienceCheckIn {
  readonly context: TickContext;
  readonly units: readonly Unit[];
  /** Wait predictions from steps 5–8 for units still in flight. */
  readonly waits: readonly QueueWait[];
}
export interface PatienceCheckOut {
  /** Silent bounces (R-10: patience exceeded → gone without ceremony). */
  readonly bounced: readonly EntityId[];
}

/** The four terminals (R-11). */
export type OutcomeTerminal = "served" | "bounced" | "blocked-false-positive" | "landed";

export interface OutcomeCandidate {
  readonly unitId: EntityId;
  readonly nodeId: EntityId | null;
  /** Node whose trust envelope a breach lands through. */
  readonly targetId: EntityId | null;
  readonly terminal: OutcomeTerminal | null;
}
export interface OutcomeIn {
  readonly context: TickContext;
  readonly candidates: readonly OutcomeCandidate[];
  readonly inspections: readonly InspectionVerdict[];
  readonly bounced: readonly EntityId[];
  readonly completed: readonly EntityId[];
  readonly valueByUnit: ReadonlyMap<EntityId, Fixed>;
  readonly rng: RngStream;
}
export interface OutcomeOut {
  readonly outcomes: readonly Outcome[];
  readonly events: readonly SimEvent[];
}
export interface Outcome {
  readonly unitId: EntityId;
  readonly terminal: OutcomeTerminal;
  readonly atUs: SimTimeUs;
  readonly causeId: CauseId;
}

export interface BackpressureIn {
  readonly context: TickContext;
  readonly outcomes: readonly Outcome[];
  readonly policy: RetryPolicy;
  /** Contention multiplier ((ratio/10)^2.2 × homogeneity, R-61). */
  readonly stormFactor: Fixed;
  readonly rng: RngStream;
}
export interface BackpressureOut {
  /** Retry drafts the driver re-admits as units once their backoff matures —
   *  storms EMERGE here, unscripted (R-12). NOTE (F2): they join the roster
   *  between steps, NOT through step 1's arrival machinery — no arrival
   *  events are minted for them. */
  readonly reentries: readonly UnitDraft[];
  /** 0..1 measured retry-storm pressure (metastability indicator). */
  readonly pressure: Fixed;
  readonly events: readonly SimEvent[];
}

export interface StateEconomicsIn {
  readonly context: TickContext;
  readonly prior: GameState;
  readonly outcomes: readonly Outcome[];
  readonly reentries: readonly UnitDraft[];
  readonly nodes: ReadonlyMap<EntityId, NodeRecord>;
  readonly lanes: ReadonlyMap<EntityId, LaneStats>;
}
export interface StateEconomicsOut {
  /** Invoices, SLA credits, error-budget settlement, upkeep (step 12 runs
   *  the ledger — C5 restatement, §3.2). */
  readonly cash: MoneyBuckets;
  readonly ledgerEntry: LedgerEntry | null;
  /** THE single-writer channel to the observed layer. */
  readonly observedWrites: readonly ObservedWrite[];
  readonly laneStats: readonly LaneStats[];
  readonly events: readonly SimEvent[];
}

export interface RulePhaseIn {
  readonly context: TickContext;
  /** Rules read ONLY the observed layer — fog degrades automation, by
   *  design (WS-5 G1 ratified). */
  readonly observed: ReadonlyMap<ObservedKey, ObservedCell<unknown>>;
  readonly book: readonly PolicyCard[];
  /** Kill-switch suppressed set (R18: manual switch, the only "rules about
   *  rules"). */
  readonly suppressed: readonly RuleId[];
  readonly rng: RngStream;
}
export interface RulePhaseOut {
  /** Live + shadow (dry-run) firings; shadow log feeds oscillation
   *  detection (Appendix B §2.4). */
  readonly firings: readonly RuleFiring[];
  /** Rule actions enter the input log as clock-typed intents. */
  readonly intents: readonly PlayerIntent[];
}

export interface RuleFiring {
  readonly ruleId: RuleId;
  readonly tick: SimTick;
  readonly mode: "live" | "shadow";
  readonly band: DelegationBand;
  readonly actions: readonly PolicyAction[];
  readonly causeId: CauseId;
}

/** Function contract for one pipeline slot: pure data-in → data-out. */
export type TickStep<In, Out> = (input: In) => Out;

/** Slot registry — the extension-point architecture: a modifier binds to
 *  exactly one named slot. */
export interface PipelineSlots {
  readonly arrival: TickStep<ArrivalIn, ArrivalOut>;
  readonly scoring: TickStep<ScoringIn, ScoringOut>;
  readonly qosClassify: TickStep<QosClassifyIn, QosClassifyOut>;
  readonly route: TickStep<RouteIn, RouteOut>;
  readonly serve: TickStep<ServeIn, ServeOut>;
  readonly queueWait: TickStep<QueueWaitIn, QueueWaitOut>;
  readonly inspect: TickStep<InspectIn, InspectOut>;
  readonly dependencyBlock: TickStep<DependencyBlockIn, DependencyBlockOut>;
  readonly patienceCheck: TickStep<PatienceCheckIn, PatienceCheckOut>;
  readonly outcome: TickStep<OutcomeIn, OutcomeOut>;
  readonly backpressure: TickStep<BackpressureIn, BackpressureOut>;
  readonly stateEconomics: TickStep<StateEconomicsIn, StateEconomicsOut>;
  /** Step 12.5 — policy interpreter phase (empty interpreter allowed). */
  readonly rulePhase: TickStep<RulePhaseIn, RulePhaseOut>;
}

/** Canonical order: 1…12 then 12.5. */
export const TICK_STEP_ORDER = [
  "arrival",
  "scoring",
  "qosClassify",
  "route",
  "serve",
  "queueWait",
  "inspect",
  "dependencyBlock",
  "patienceCheck",
  "outcome",
  "backpressure",
  "stateEconomics",
  "rulePhase",
] as const satisfies readonly (keyof PipelineSlots)[];

export type StepId = (typeof TICK_STEP_ORDER)[number];

/* ═══════════════════════════ Policy cards (Appendix B grammar) ═════════════════
 * Rows, not code. Closed-enum metric/action ids. State budget: rules may
 * reference only engine-maintained counters surfaced as nouns — no
 * player-declared variables, ever (§B 2.2).
 */

/** Grammar tuple 1..3 — "one rule = one story" (AND-only, ≤3; §B 2.3.5). */
export type OneTwoThree<T> = readonly [T] | readonly [T, T] | readonly [T, T, T];

/** Closed comparator enum (§B 2.2). */
export type Comparator = ">" | "<" | "changed" | "fails" | "completes";

/** Units a value threshold may carry. */
export type MetricUnit = "percent" | "us" | "ms" | "count" | "micro-usd" | "ratio" | "minutes";

/** threshold := number , unit | class-ref | event-name (§B 2.2). */
export type PolicyThreshold =
  | { readonly kind: "value"; readonly amount: Fixed; readonly unit: MetricUnit }
  | { readonly kind: "class-ref"; readonly classId: string }
  | { readonly kind: "event-name"; readonly name: string };

/** predicate := metric , comparator , threshold. Guards are the same shape
 *  over resources/counts/state-flags nouns. */
export interface Predicate {
  readonly metric: MetricId;
  readonly comparator: Comparator;
  readonly threshold: PolicyThreshold;
}

/** selector := object | role/tag | query | class | whole estate. */
export interface ScopeSelector {
  readonly kind: "object" | "role" | "query" | "class" | "estate";
  /** null for `estate`. */
  readonly ref: string | null;
}

/** action := closed enum of game verbs (manual verb set; the action→effect
 *  table IS the surface area — §B 2.4). */
export type PolicyActionId =
  | "scale-out"
  | "shed-class"
  | "page"
  | "open-ticket"
  | "dispatch-remote-hands"
  | "raise-inspection-depth"
  | "failover"
  | "run-runbook"
  | "drain"
  | "queue-change";

export interface PolicyAction {
  readonly id: PolicyActionId;
  /** Runbook name for `run-runbook:NAME`; null for other verbs. */
  readonly runbookName: string | null;
  /** Numeric parameter where the verb takes one (shed-class id, scale
   *  count, new depth…); null otherwise. */
  readonly value: Fixed | null;
}

/** else := "escalate to" , ( band-ref | role-ref | runbook-ref ). */
export type PolicyEscalation =
  | { readonly to: "band"; readonly ref: DelegationBand }
  | { readonly to: "role"; readonly ref: string }
  | { readonly to: "runbook"; readonly ref: string };

/** §7.14 Delegation Bands. */
export type DelegationBand = "inform" | "consult" | "execute";

/** for := "for" , duration — sustained-window debounce, the ONE temporal
 *  operator allowed (§B 2.2/2.3.4). */
export interface SustainedWindow {
  readonly durationUs: SimTimeUs;
}

/** policy := rule-id , SCOPE , WHEN , [FOR] , THEN , [UNLESS] , [ELSE] , [BAND]. */
export interface PolicyCard {
  readonly id: RuleId;
  readonly scope: ScopeSelector;
  readonly when: OneTwoThree<Predicate>;
  readonly for?: SustainedWindow;
  readonly then: OneTwoThree<PolicyAction>;
  readonly unless?: OneTwoThree<Predicate>;
  readonly else?: PolicyEscalation;
  readonly band: DelegationBand;
  /** Rules carry upkeep (§B 2.1: "each with upkeep") — micro-$/sim-minute. */
  readonly upkeepMicroUsd: MoneyUnit;
}

/* ═══════════════════════════ Money & contracts (§4.4) ═══════════════════════════ */

export type BucketId =
  | "free"
  | "restricted"
  | "deferred"
  | "accountsReceivable"
  | "backlog"
  | "committedOut";

/** Six-bucket cash stack (§4.4: free/restricted/deferred/AR/backlog/
 *  committed-out). Only `free` is spendable; death happens on `free`. */
export interface MoneyBuckets {
  readonly free: MoneyUnit;
  readonly restricted: MoneyUnit;
  readonly deferred: MoneyUnit;
  readonly accountsReceivable: MoneyUnit;
  readonly backlog: MoneyUnit;
  readonly committedOut: MoneyUnit;
}

export const emptyMoneyBuckets = (): MoneyBuckets => ({
  free: asMoney(0n),
  restricted: asMoney(0n),
  deferred: asMoney(0n),
  accountsReceivable: asMoney(0n),
  backlog: asMoney(0n),
  committedOut: asMoney(0n),
});

/** Revenue quality colour tag (§4.4: "colour tags on every dollar"),
 *  5 bands. */
export type RevenueQualityBand = "gold" | "green" | "blue" | "amber" | "red";

/** Append-only ledger row, cause-stamped at creation (WS-4 R4 / §7.0
 *  unretrofittable law). */
export interface LedgerEntry {
  readonly seq: number;
  readonly causeId: CauseId;
  readonly atBusinessMin: SimMinute;
  readonly moneyColour: RevenueQualityBand;
  /** Bucket deltas; omitted bucket = untouched. */
  readonly delta: Readonly<Partial<Record<BucketId, MoneyUnit>>>;
}

/** Colored routing lock from contract clauses (step 4 consults these). */
export interface RoutingLock {
  readonly color: string;
  /** Hops the locked path must keep (or must avoid, when negated). */
  readonly hopNodeKinds: readonly string[];
  readonly negated: boolean;
}

/** Capacity allocation crossing The Bridge (commercial ⇄ infra, §4.4 R86-88). */
export interface Allocation {
  readonly resourceId: string;
  readonly amount: Fixed;
}

/** SLA terms — 8-field v0 subset of the WS-4 clause table. */
export interface SlaTerms {
  /** e.g. 0.999 as Fixed. */
  readonly uptimeTarget: Fixed;
  /** SLA burn measured on ops-sim µs; windows on business calendar (§4.1). */
  readonly responseBudgetUs: SimTimeUs;
  readonly creditRate: Fixed;
  readonly creditCap: Fixed;
  readonly claimWindowUs: SimTimeUs;
  readonly autoRenew: boolean;
  readonly noticePeriodMin: SimMinute;
  readonly threeBreachExitRight: boolean;
}

/** Contract-as-tower (§4.4 WS-4 §2.1 object model, v0 skeleton). */
export interface Contract {
  readonly id: EntityId;
  readonly customerEntityId: EntityId;
  /** Type bundle this contract sells out of (Appendix A id). */
  readonly bundleId: string;
  readonly mrcMicroUsd: MoneyUnit;
  readonly tcvMicroUsd: MoneyUnit;
  readonly acvMicroUsd: MoneyUnit;
  /** Term dates on the BUSINESS clock (Dual-Clock law). */
  readonly termStartMin: SimMinute;
  readonly termEndMin: SimMinute;
  readonly billingCycle: "hourly" | "monthly" | "annual";
  readonly sla: SlaTerms;
  readonly routingLocks: readonly RoutingLock[];
  /** Sold QoS class that shed order must respect ("sold classes cannot be
   *  shed", R-55…R-58). null = none sold. */
  readonly shedImmunityClassId: string | null;
  readonly allocations: readonly Allocation[];
}

/* ═══════════════════════════ Type bundle (Appendix A mirror) ═════════════════
 * JSON is the canonical wire format; these interfaces mirror Appendix A
 * verbatim-ly (v0 = that appendix IS the mod format, G6 §7.6).
 * CONTRACT DECISION: bundle numbers are JSON `number`s (authoring convenience);
 * the zod-validated loader PARSES them into Fixed/bigint at the boundary —
 * floats never enter sim state ("Parse, Don't Validate").
 * All fields except schemaVersion/id are optional-safe (data-only).
 */

export type ThreatFamily = "malicious" | "human" | "entropic" | "systemic" | "customerAsThreat";
export type DurationClass = "Instant" | "Session" | "BatchJob" | "Resident";
export type PatienceMode =
  | "sigmoid-budget"
  | "window"
  | "value-decay"
  | "resident"
  | "binary"
  | "corrupts"
  | "none";
/** Per-type rescale unit (§7.8d: "the meter never swaps, only rescales"). */
export type BundleTimeScale = "ms" | "µs" | "s" | "hours" | "years";

export interface BundleMeta {
  readonly name?: string;
  readonly codexSummary?: string;
  readonly tone?: "comedy" | "straight";
  readonly official?: boolean;
  readonly publishedAsEditableCard?: boolean;
}

export interface VisitorStats {
  readonly patience?: number;
  readonly value?: number;
  readonly weight?: number;
  readonly loyalty?: number;
  readonly fragility?: number;
}

export interface PatienceModelParams {
  readonly budgetMs?: number;
  /** Sigmoid anchors [lo, mid, hi] — official 10%@0.6 / 50%@1.0 / 95%@1.6
   *  (R-60; matches the bounce LUT). */
  readonly bounceSigmoid?: readonly [number, number, number];
}

export interface PatienceModel {
  readonly mode: PatienceMode;
  readonly params?: PatienceModelParams;
}

export interface BundleVisitor {
  /** mining=true → no-lane levels (§App A). */
  readonly nullable?: boolean;
  readonly unitTerm?: string;
  readonly durationClass?: DurationClass;
  readonly stats?: VisitorStats;
  readonly patienceModel?: PatienceModel;
  readonly party?: { readonly allOrNothing?: boolean; readonly size?: readonly [number, number] };
  readonly herding?: { readonly enabled?: boolean; readonly coefficient?: number };
  readonly populationEffect?: boolean;
  readonly retryAmplifies?: boolean;
  readonly cohortSpawn?: { readonly fromCustomerCard?: boolean; readonly tier?: number };
  readonly costPerInvocation?: string;
  readonly trustReadable?: boolean;
}

export interface GoalCondition {
  readonly kind:
    | "hold-metric"
    | "survive"
    | "grow-to-N"
    | "cash-intact"
    | "audit-pass"
    | "convert-pct"
    | "reputation-collapse";
  readonly metric?: string;
  readonly threshold?: number;
}

export interface BundleGoal {
  readonly nodeType?: string;
  readonly winCondition?: GoalCondition;
  readonly loseCondition?: GoalCondition;
  /** §9.6 fail-slow law: minWarningMinutes matches WS-1's 3-minute guard. */
  readonly loseSlowlyGuard?: { readonly minWarningMinutes?: number };
  readonly bindingConstraintLine?: string;
}

export interface BundleScarce {
  readonly resourceId?: string;
  readonly meterWidget?: string;
  readonly meterBoundStat?: string;
  readonly commercialSlider?: string;
  readonly operationalDials?: readonly string[];
  /** backup's hallmark (R22 Window module). */
  readonly windowGrows?: boolean;
  readonly shedOrder?: string;
  readonly qosAnswer?: string;
}

export interface BundleTempo {
  readonly simTimeScale?: BundleTimeScale;
  /** game/adtech/fin-colo run permanently at incident-clock 0.25× (§7.13). */
  readonly permanentIncidentClock?: boolean;
  readonly contractTerms?: {
    readonly default?: string;
    readonly escalator?: boolean;
    readonly grandfathering?: boolean;
  };
  readonly seasonality?: readonly string[];
  readonly diurnalBaseline?: string;
}

export interface SignatureThreat {
  readonly id: string;
  /** R36 pruning rule: mechanical = owns balance numbers. */
  readonly mechanical?: boolean;
  readonly codexOnly?: boolean;
}

export interface BundleThreats {
  readonly familyWeights?: Readonly<Partial<Record<ThreatFamily, number>>>;
  /** Pool cap 8–10 (§2.24). */
  readonly activeFamilies?: readonly string[];
  readonly signatureThreats?: readonly SignatureThreat[];
  /** tech-tree-is-bestiary: buildable id → threat ids unlocked. */
  readonly unlockedByBuildables?: Readonly<Record<string, readonly string[]>>;
  readonly twoFrontDraw?: readonly string[];
  readonly waveTable?: string;
}

export interface BundleSkin {
  readonly palette?: {
    readonly dominant?: string;
    readonly accent?: string;
    readonly chord?: readonly string[];
  };
  /** Pixi-adapted: lookup of shader/blend/tint presets (Appendix A note). */
  readonly materialPreset?: string;
  readonly visitorCostume?: { readonly hull?: string; readonly propSlot?: string };
  readonly heroSilhouette?: string;
  readonly heroObject?: string;
  readonly meterFace?: string;
  readonly catastropheFx?: string;
  readonly ambientSoundPack?: string;
  readonly densityMultiplier?: number;
  readonly arrivalRhythm?: string;
  readonly homeAltitude?: string;
  readonly detailAltitude?: string;
  readonly commercialArtifactIcon?: string;
  readonly signatureMotion?: string;
  readonly signatureFrame?: string;
  readonly lodContract?: Readonly<Record<string, string>>;
}

export interface BundleEras {
  readonly availableFrom?: string;
  readonly obsoleteBy?: string | null;
  readonly eraOverrides?: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
}

export interface BundleEconomy {
  readonly unitOfSale?: string;
  readonly revenueShape?: string;
  readonly marginProfile?: string;
  readonly cashTiming?: "negative-CCC" | "prepaid" | "net60";
  readonly termStructure?: { readonly typical?: string; readonly churn?: string };
  readonly cacProfile?: string;
  readonly ticketsPerCustomer?: number;
  readonly signatureCost?: string;
  readonly badMonth?: string;
  /** R42 fifth scoring axis. */
  readonly fifthAxisScore?: { readonly metric?: string; readonly weight?: number };
  readonly realismToggles?: { readonly p95billing?: boolean; readonly demandCharges?: boolean };
}

export interface BundleBuildables {
  readonly paletteRef?: string;
  readonly archetypeInstances?: readonly {
    readonly archetype: string;
    readonly skin?: string;
  }[];
  /** Only from ~15 verb-changers (R61). */
  readonly distinct?: readonly string[];
  /** R62 staff-time economy, non-physical entries. */
  readonly nonPhysical?: readonly string[];
}

export interface BundleControl {
  readonly pips?: {
    readonly hardware?: number;
    readonly software?: number;
    readonly network?: number;
    readonly data?: number;
  };
  readonly keyhole?: boolean;
  readonly unclickableObjects?: boolean;
}

export interface BundleVerbs {
  readonly dominant?: string;
  readonly transfers?: readonly string[];
}

export interface BundleRelations {
  readonly synergies?: readonly {
    readonly with: string;
    readonly kind?: string;
    readonly numbers?: Readonly<Record<string, number>>;
  }[];
  readonly antagonisms?: readonly {
    readonly with: string;
    readonly resource?: string;
    readonly kind?: string;
    readonly render?: string;
  }[];
  readonly unlocks?: {
    readonly prereqSets?: readonly Readonly<Record<string, readonly string[]>>[];
  };
  readonly pivots?: Readonly<Record<string, Readonly<Record<string, number>>>>;
  readonly masteryBuff?: string;
  readonly distillate?: string;
}

export interface HandoverNote {
  readonly runsOut?: string;
  readonly killsYou?: string;
  readonly customerWants?: string;
}

export interface RosettaCard {
  readonly canonical: string;
  readonly alias?: string;
  readonly line?: string;
}

export interface BundleScenarios {
  readonly archetypeApplicability?: readonly ("Endure" | "Escort" | "Convert")[];
  readonly analogues?: Readonly<Record<string, string>>;
}

export interface BundleGuardrails {
  readonly depiction?: string;
  readonly arcMustEnd?: boolean;
}

/** Root Type-Bundle mirror of Appendix A (schema v3.0 wire format). */
export interface TypeBundle {
  readonly schemaVersion: string;
  /** Stable mod-safe namespacing, e.g. "official:game-servers". */
  readonly id: string;
  readonly meta?: BundleMeta;
  /** SLOT 1 · the unit. */
  readonly visitor?: BundleVisitor;
  /** SLOT 2 · the goal node. */
  readonly goal?: BundleGoal;
  /** SLOT 3 · the scarce resource. */
  readonly scarce?: BundleScarce;
  /** SLOT 4 · patience analog / business tempo. */
  readonly tempo?: BundleTempo;
  /** SLOT 5 · the threat mix. */
  readonly threats?: BundleThreats;
  /** SLOT 6 · the look. */
  readonly skin?: BundleSkin;
  readonly eras?: BundleEras;
  readonly economy?: BundleEconomy;
  readonly buildables?: BundleBuildables;
  readonly control?: BundleControl;
  readonly mechanics?: readonly string[];
  readonly verbs?: BundleVerbs;
  readonly relations?: BundleRelations;
  readonly ticketPack?: string;
  readonly handoverNote?: HandoverNote;
  readonly rosettaCards?: readonly RosettaCard[];
  readonly scenarios?: BundleScenarios;
  readonly guardrails?: BundleGuardrails;
}

/* ═══════════════════════════ Replay & inputs (§3.3, §4.1 replay artifact) ═════════════════ */

/** Clock-typed player/rule input as it enters the append-only input log.
 *  Canonical order = what the host fed the core (§3.2); `seq` records it. */
export interface PlayerIntent {
  readonly seq: number;
  readonly clock: ClockKind;
  /** Timestamp on the intent's own clock. */
  readonly atUs: SimTimeUs;
  readonly origin: "player" | "rule";
  readonly ruleId?: RuleId;
  readonly payload: IntentPayload;
}

/** Board verbs (string ids from the per-tier verb sets, WS-2) and slider
 *  moves; pause-with-orders is just an intent submitted while paused.
 *
 *  The `player-verb` arm (INTENT-DOOR contract, §4.2/§7.5/§7.13) is the ONLY
 *  carrier the pipeline door EXECUTES; the legacy `verb` arm stays alive for
 *  rule-minted actions (`PolicyActionId` / `run-runbook:NAME` strings emitted
 *  by policy/evaluator.ts) and the door refuses those with an
 *  `unsupported-verb-carrier` refusal event until the policy lane maps them
 *  onto handlers. Replay-bundle compatibility: bundle.ts parses payloads
 *  OPAQUELY ("forward-compat: any kind string survives; the runner validates
 *  semantics"), so the new arm survives the wire untouched. */
export type IntentPayload =
  | { readonly kind: "verb"; readonly verb: string; readonly target: EntityId | null; readonly value: Fixed | null }
  | { readonly kind: "slider"; readonly control: string; readonly value: Fixed }
  | PlayerVerbPayload;

/* ─────────────────────── Player verbs (the intent door) ───────────────────────
 * Closed player verb set for the external-intent door: MASTER_REPORT §4.2
 * (player action economy, Hands), §7.5 (hands as action slots; duration vs
 * attendance), §7.13 (intents tick-inserted deterministically; pause-with-
 * orders queues actions for unpause). Every submitted player-verb intent is
 * EXECUTED by a named pipeline handler or REFUSED with a deterministic
 * `intent-refused` event — refusal consumes nothing (no RNG anywhere in the
 * door). Payloads reference topology/entity ids and plain strings ONLY —
 * embedded objects are illegal here (Law 2: the card itself is looked up by
 * hash through the host-wired `lookupPolicyCard`, never smuggled in).
 *
 * Reconciliation against surfaces that already accept verbs:
 *  - policy/evaluator.ts: emits `{kind:"verb", verb: PolicyActionId |
 *    "run-runbook:NAME", target, value}` — the ten PolicyActionId verbs
 *    (scale-out, shed-class, page, open-ticket, dispatch-remote-hands,
 *    raise-inspection-depth, failover, run-runbook, drain, queue-change)
 *    are RULE-carrier actions, deliberately NOT part of this enum; the door
 *    refuses that carrier with an explicit event (reported seam).
 *  - topology/graph.ts: `EdgeDraft.kind` is "data"|"power"|"control"|"trust"
 *    — `connect-ports` mirrors exactly that relation set (`BoardRelation`)
 *    and the graph's structural invariants (self-edge, slot double-feed,
 *    power-tree cycle) WITHOUT importing topology/ — the door mutates the
 *    pipeline-local `BoardState` slice (§4.2 graph-is-map embed).
 *  - NodeRecord already carries `inspectionDepth: InspectionDepth` and
 *    `shedOrder: ShedOrder` — `configure-node` writes exactly those fields.
 */
export enum PlayerVerb {
  PlaceDevice = "place-device",
  ConnectPorts = "connect-ports",
  DisconnectDrain = "disconnect-drain",
  ConfigureNode = "configure-node",
  PolicyCardCommit = "policy-card-commit",
  ShedLoad = "shed-load",
  Communicate = "communicate",
  ToggleSpeed = "toggle-speed",
  /** OD-24(a) FULL PRICING SURFACE (owner ruling 2026-10-09b) part 1: the 9th
   *  door verb. The door records the ORDER into `GameState.pricing` (structure
   *  + target resolution only); elasticity, revenue and dial wiring are the
   *  queued economy/HUD lanes reading this book, not the door's job. */
  AdjustPrice = "adjust-price",
}

/** Enumeration of the closed verb set (door guard + host introspection). */
export const PLAYER_VERBS: readonly PlayerVerb[] = Object.freeze([
  PlayerVerb.PlaceDevice,
  PlayerVerb.ConnectPorts,
  PlayerVerb.DisconnectDrain,
  PlayerVerb.ConfigureNode,
  PlayerVerb.PolicyCardCommit,
  PlayerVerb.ShedLoad,
  PlayerVerb.Communicate,
  PlayerVerb.ToggleSpeed,
  PlayerVerb.AdjustPrice,
]);

/** Board relation mirror of topology's EdgeKind (id-space twin, no import). */
export type BoardRelation = "data" | "power" | "control" | "trust";

/** Per-verb argument records — the discriminated half of the door payload.
 *  `verb` is the discriminant; every field is an id/string/number, never an
 *  object, so a wire round-trip can never smuggle structure into the sim. */
export interface PlaceDeviceArgs {
  readonly verb: PlayerVerb.PlaceDevice;
  /** Host-minted id for the new node (unique or the door refuses). */
  readonly nodeId: EntityId;
  /** Bundle archetype string ("server", "switch", …) — never branched on by
   *  the door; the validator callback interprets it (module decoupling). */
  readonly deviceKind: string;
  /** Software/artifact template id (topology correlation field); null = ad-hoc. */
  readonly template: string | null;
}
export interface ConnectPortsArgs {
  readonly verb: PlayerVerb.ConnectPorts;
  readonly relation: BoardRelation;
  /** `from` RELATION-applies to `to` with topology's reading: data = from
   *  DEPENDS ON to; power = from FEEDS to; control = from GOVERNS to;
   *  trust = from AUTHENTICATES AGAINST to. */
  readonly from: EntityId;
  readonly to: EntityId;
  /** Power only: consumer socket name ("psu1"); null for other relations. */
  readonly slot: string | null;
}
export interface DisconnectDrainArgs {
  readonly verb: PlayerVerb.DisconnectDrain;
  readonly edgeId: EntityId;
}
export interface ConfigureNodeArgs {
  readonly verb: PlayerVerb.ConfigureNode;
  readonly nodeId: EntityId;
  /** null field = leave untouched; at least one must be set. */
  readonly inspectionDepth: InspectionDepth | null;
  readonly shedOrder: ShedOrder | null;
}
export interface PolicyCardCommitArgs {
  readonly verb: PlayerVerb.PolicyCardCommit;
  /** Hash-checked: resolved through the host-wired `lookupPolicyCard`; an
   *  unknown hash is a refusal event, never a crash. */
  readonly cardHash: HashHex;
}
export interface ShedLoadArgs {
  readonly verb: PlayerVerb.ShedLoad;
  readonly nodeId: EntityId;
  /** Sold-class-shed immunity (R-55…R-58) is enforced where shedding
   *  actually happens (step 5) — this intent records the DIRECTIVE. */
  readonly qosClassId: string | null;
}
export interface CommunicateArgs {
  readonly verb: PlayerVerb.Communicate;
  /** Affected object/segment; null = estate-wide status post. */
  readonly target: EntityId | null;
  /** Status-page line — non-empty or refused. Reputation accounting is the
   *  economy lane's reader of the emitted event, not the door's job. */
  readonly note: string;
}
export interface ToggleSpeedArgs {
  readonly verb: PlayerVerb.ToggleSpeed;
  /** Speed gates OBSERVATION, never physics (§7.5) — no hand cost by
   *  default; the door records the request as an event for HUD/projection. */
  readonly speedX: 1 | 2 | 4;
}
/** What an `adjust-price` order binds to (OD-24(a) vocabulary, closed):
 *  plan = a sellable price-list entry; contract-class = a cohort of live
 *  contracts (uplift/legacy tier); sku = the finest metered line. The door
 *  never interprets them — the host validator (`canAdjustPrice`) resolves
 *  target ids inside whichever namespace the kind selects. */
export type PriceTargetKind = "plan" | "contract-class" | "sku";

export interface AdjustPriceArgs {
  readonly verb: PlayerVerb.AdjustPrice;
  /** Closed vocabulary above; anything else is a `bad-target-kind` refusal. */
  readonly targetKind: PriceTargetKind;
  /** Id inside the targetKind namespace — resolved by the host validator
   *  (absent validator = the door enforces structural sanity only, exactly
   *  the `canPlaceDevice` decoupling pattern). */
  readonly targetId: EntityId;
  /** Integer µ$ — the MoneyUnit bigint makes a fractional price
   *  UNREPRESENTABLE at the wire (Law 2): a float/string price is structural
   *  garbage (throws), a non-positive bigint is a value-domain refusal. */
  readonly newPriceMicroUsd: MoneyUnit;
  /** Business-clock effective minute (Dual-Clock law §4.4: pricing is a
   *  business action); null sentinel = effective at the executing tick.
   *  The door only STAMPS this field (part 1 is state-neutral); the economy
   *  lane decides what "later" means when it consumes the book. */
  readonly effectiveAtBusinessMinute: SimMinute | null;
}

/** The closed discriminated union of verb args. */
export type PlayerVerbArgs =
  | PlaceDeviceArgs
  | ConnectPortsArgs
  | DisconnectDrainArgs
  | ConfigureNodeArgs
  | PolicyCardCommitArgs
  | ShedLoadArgs
  | CommunicateArgs
  | ToggleSpeedArgs
  | AdjustPriceArgs;

/** IntentPayload arm the door executes. */
export interface PlayerVerbPayload {
  readonly kind: "player-verb";
  readonly args: PlayerVerbArgs;
}

/** A PlayerIntent stamped with the macro tick the host submitted it.
 *  Structurally compatible with replay/bundle.ts `StampedIntent` (which adds
 *  an optional `extras` sidecar) — this contract file must not import the
 *  replay module, so the door takes this narrower twin; any StampedIntent is
 *  assignable here and any fed schedule survives `stampIntents` unchanged. */
export interface ExternalIntent {
  /** Macro tick of submission (pause-with-orders: the PAUSED tick; the door
   *  applies every fed entry stamped at or before the current tick, ordered
   *  by (tick, seq) — §7.13). */
  readonly tick: SimTick;
  readonly intent: PlayerIntent;
}

/** Difficulty Director draw — enters ONLY as a logged input, never a mid-run
 *  world edit (R-31). */
export interface DirectorDraw {
  readonly atTick: SimTick;
  readonly subject: "sawtooth-trough-depth" | "entropy-budget";
  readonly value: Fixed;
}

/** State-hash checkpoint; doubles as the CI determinism tripwire.
 *  THE LONG SAVE = latest checkpoint + input tail (§4.1 replay artifact). */
export interface Checkpoint {
  readonly tick: SimTick;
  readonly stateHash: HashHex;
}

/** Content hashes pinned by the bundle: "anything not referenced by hash is
 *  non-canonical" (§3.2). */
export interface ReplayContentHashes {
  readonly rulesetCardHashes: Readonly<Record<string, HashHex>>;
  readonly sheetsHash: HashHex;
  readonly ruleBookHash: HashHex;
}

/** The replay contract (§3.3 item 1 + §4.1): seed + inputs + checkpoints
 *  reproduce every state hash; nothing may render that is not re-derivable. */
export interface ReplayBundle {
  readonly runSeed: RunSeed;
  readonly engineVersion: string;
  readonly contentHashes: ReplayContentHashes;
  readonly snapshotEveryTicks: SimTick;
  readonly intentLog: readonly PlayerIntent[];
  readonly directorDraws: readonly DirectorDraw[];
  readonly snapshots: readonly Checkpoint[];
}

/* ═══════════════════════════ Sim events ═══════════════════════════ */

interface SimEventBase {
  readonly atUs: SimTimeUs;
  readonly tick: SimTick;
  /** Every event carries its creation cause (attribution end-to-end, §7.0). */
  readonly causeId: CauseId;
}

export interface ArrivalEvent extends SimEventBase {
  readonly kind: "arrival";
  readonly unitId: EntityId;
  readonly envelopeTableId: string;
}
export interface ServedEvent extends SimEventBase {
  readonly kind: "served";
  readonly unitId: EntityId;
  readonly nodeId: EntityId;
}
/** R-10 silent bounce — patience exhausted, unit leaves unremarked. */
export interface BouncedEvent extends SimEventBase {
  readonly kind: "bounced";
  readonly unitId: EntityId;
  readonly nodeId: EntityId | null;
}
/** Amber-403: a paying customer blocked by inspection (G3's cost ticker). */
export interface BlockedFalsePositiveEvent extends SimEventBase {
  readonly kind: "blocked-false-positive";
  readonly unitId: EntityId;
  readonly nodeId: EntityId;
}
/** R-11 landed: threat reached its goal node (breach). */
export interface LandedEvent extends SimEventBase {
  readonly kind: "landed";
  readonly unitId: EntityId;
  readonly targetId: EntityId;
}
export interface RetryEvent extends SimEventBase {
  readonly kind: "retry";
  readonly unitId: EntityId;
  readonly retryOf: EntityId;
}
/** Live or shadow (dry-run) policy firing — the ticker shows both so the
 *  3am fight is watchable (§B 2.4). */
export interface RuleFiredEvent extends SimEventBase {
  readonly kind: "rule-fired";
  readonly ruleId: RuleId;
  readonly mode: "live" | "shadow";
}
export interface InvoiceSettledEvent extends SimEventBase {
  readonly kind: "invoice-settled";
  readonly contractId: EntityId;
  readonly amount: MoneyUnit;
  readonly bucket: BucketId;
}
export interface CheckpointEvent extends SimEventBase {
  readonly kind: "checkpoint";
  readonly stateHash: HashHex;
}
/** The door executed an external intent and its handler mutated state (or,
 *  for event-only verbs, recorded its directive). `causeId` is
 *  `intent:<seq>` — replay-visible attribution for every applied order. */
export interface IntentExecutedEvent extends SimEventBase {
  readonly kind: "intent-executed";
  readonly verb: PlayerVerb;
  readonly intentSeq: number;
  /** Hand tokens the action occupied (empty = free verb, e.g. toggle-speed). */
  readonly handIndexes: readonly number[];
  /** Tick from which those tokens are free again (occupancy end, exclusive). */
  readonly busyUntilTick: SimTick;
  /** Canonical short rendering of the directive (e.g. "speed=2",
   *  "qos=bronze", "depth=inspect"); null for pure structural verbs. */
  readonly detail: string | null;
}
/** The door REFUSED an external intent — deterministic reason, nothing
 *  consumed, RNG never consulted. Refusals are as replay-logged as
 *  executions: replaying the same schedule re-refuses identically. */
export interface IntentRefusedEvent extends SimEventBase {
  readonly kind: "intent-refused";
  /** PlayerVerb string, or the legacy carrier label for refused non-door
   *  payloads (e.g. "verb:scale-out"). */
  readonly verb: string;
  readonly intentSeq: number;
  /** Machine-prefixed reason: "<code>: <detail>" (e.g.
   *  "hands-exhausted: need 1, free 0 of 2"). */
  readonly reason: string;
}

export type SimEvent =
  | ArrivalEvent
  | ServedEvent
  | BouncedEvent
  | BlockedFalsePositiveEvent
  | LandedEvent
  | RetryEvent
  | RuleFiredEvent
  | InvoiceSettledEvent
  | CheckpointEvent
  | IntentExecutedEvent
  | IntentRefusedEvent;

/* ═══════════════════════════ Board & Hands (door-owned state slices) ═════════════════
 * The intent door's two ground-truth embeds. Both are OPTIONAL GameState
 * fields (backward-compat law: existing GameState construction sites never
 * pass them; the door materializes lazily), so every pre-door host compiles
 * and digests unchanged.
 */

/** One structural edge of the pipeline-local board slice — the frozen mirror
 *  of topology/graph.ts `Edge` (no import: pipeline embeds a PIPELINE-LOCAL
 *  slice per the INTENT-DOOR contract; the topology lane keeps its own
 *  mutable MultiGraph for blast/domain math). Edge ids mint with topology's
 *  `defaultEdgeId` convention so hosts can correlate the two views. */
export interface BoardEdgeRecord {
  readonly id: EntityId;
  readonly relation: BoardRelation;
  readonly from: EntityId;
  readonly to: EntityId;
  /** Power socket name; null for the other relations. */
  readonly slot: string | null;
}

/** Pipeline-local structural embed of "what CAN happen" (§4.2 graph-is-map).
 *  `version` bumps on every mutation (topology's memoization convention).
 *  Map iteration NEVER defines order — consumers sort by id (digest does).
 *  `edges` read-onlyness is a TYPE-LEVEL guarantee (`ReadonlyMap` is a
 *  compile-time view; `Object.freeze` on a Map seals its properties, not its
 *  contents — `map.set()` still works on a frozen Map). Runtime deep-freeze
 *  applies to the RECORDS stored in the Map, not to Map contents themselves;
 *  writers must replace the Map, never mutate it in place (the door does). */
export interface BoardState {
  readonly version: number;
  readonly edges: ReadonlyMap<EntityId, BoardEdgeRecord>;
}

/** One hand token. Free iff `busyUntilTick <= current tick` (occupancy is
 *  half-open [start, busyUntilTick)). `busyCauseId` names the intent event
 *  that took it (§7.0 attribution on every state change). */
export interface HandToken {
  /** Stable 0-based token index (insertion order == index order). */
  readonly index: number;
  readonly busyUntilTick: SimTick;
  readonly busyCauseId: CauseId | null;
}

/** The Hands action economy (§7.5): capacity is staff hands (T0–1: 1 ·
 *  T2: 2 · …), tokens are concurrent actions. Not storable; occupancy
 *  duration per verb is door CONFIG (§7.5 "duration vs attendance" — v0
 *  collapses attendance into one occupancy window per action). */
export interface HandState {
  readonly capacity: number;
  readonly tokens: readonly HandToken[];
}

/** One executed `adjust-price` order, frozen into the price book. The record
 *  is the ENTIRE part-1 side effect (OD-24(a)): revenue, churn-elasticity and
 *  invoice math READ this book downstream — nothing in the door consults it.
 *  `causeId` attribution lives on the minting `intent-executed` event
 *  (`intent:<seq>`), mirroring every other door verb. */
export interface PriceOverrideRecord {
  readonly targetKind: PriceTargetKind;
  readonly targetId: EntityId;
  readonly newPriceMicroUsd: MoneyUnit;
  /** null = effective at `setAtTick`; a business-minute stamp otherwise. */
  readonly effectiveAtBusinessMinute: SimMinute | null;
  /** Macro tick the door executed the order (order-of-writes tie-break for
   *  consumers; the book's Map is keyed, never ordered). */
  readonly setAtTick: SimTick;
}

/** OPTIONAL `GameState` embed — the digest-safe price-override book written
 *  ONLY by the door's `adjust-price` handler (same embed law as board/hands:
 *  absent ⇒ byte-identical digests everywhere; `pipeline/digest.ts` absorbs
 *  it WHEN PRESENT, keys sorted code-unit so Map insertion order never
 *  leaks). Composite key `<targetKind>:<targetId>` — the kind segment is a
 *  colon-free closed vocabulary, so the split on the FIRST colon is exact and
 *  ids inside a namespace may themselves contain colons. `version` bumps on
 *  every materialized write (topology/board memoization convention). */
export interface PriceOverrideBook {
  readonly version: number;
  readonly overrides: ReadonlyMap<string, PriceOverrideRecord>;
}

/* ═══════════════════════ Attention denominations (OD-6/OD-23/OD-4a) ═══════ */

/** The TWO attention denominations (§7.5 · OD-6(a) one pool, one special
 *  hand). `normal` is the everyday hand the `GameState.hands` pool already
 *  carries (unchanged by this lane). `attention` is the scarcest resource —
 *  the FOCUS hand — minted ONLY as a bounded loan. Kept as a marker union so
 *  HUD/verb-class consumers can label which denomination a spend drew from
 *  without re-deriving it from field presence. */
export type AttentionDenomination = "normal" | "attention";

/** The two loan denominations of the special hand (OD-4a). Both are BOUNDED
 *  LEDGERED LOANS — the ONLY hand-creation event in the game.
 *  `triage-window` is the focus hand the Triage Window extends while the
 *  arrivals queue is visible and patience drains; `grace` is the single free
 *  focus hand Attention Grace mints on a sev-1 (duplicate alerts suppressed).
 *  Every mint appends an `AttentionLoanRecord`; the loan is serviced out of
 *  the NEXT window's/month's replenished budget, never silently forgiven. */
export type AttentionLoanKind = "triage-window" | "grace";

/** One ledgered attention loan (OD-4a). Immutable record appended to
 *  `AttentionState.loanLedger` at window entry; `repaid` flips to true exactly
 *  once when the replenish seam services it. The row's existence while
 *  `repaid === false` IS the outstanding attention debt — the ledger length is
 *  the count of hand-creation events (the invariant this lane pins). */
export interface AttentionLoanRecord {
  /** Business minute the window/grace minted the focus hand (attribution). */
  readonly createdAtMinute: SimMinute;
  readonly kind: AttentionLoanKind;
  /** Window ordinal in force when the loan was minted (monotonic integer the
   *  attention seam bumps on every entry — NOT a wall clock; the host drives
   *  windows). The replenish services loans oldest-first regardless of this
   *  stamp; it is carried for HUD "due since" attribution. */
  readonly repayAtWindow: number;
  /** true once the replenish seam has folded this loan into paid budget. */
  readonly repaid: boolean;
}

/** OPTIONAL `GameState` embed — the ATTENTION denomination (§7.5 · OD-6(a)
 *  two denominations drawn from one special-hand pool; OD-23(a) design;
 *  OD-4a bounded loan ledger). `capacity` is the focus-hand ceiling (v0: 1);
 *  `tokens` is a `HandState`-shaped pool of those special hands (free iff
 *  `busyUntilTick <= current tick && busyCauseId === null` — the SAME
 *  half-open occupancy law as the everyday `hands` pool, which this embed
 *  never mutates). `debt` is the count of unrepaid ledger rows (attention
 *  owed): while debt reaches capacity the BOUNDED mint refuses a fresh focus
 *  hand (`attentionWindowEntry` returns the refusal, never silent), and a
 *  spend with no free hand refuses `attention-debt` — the row stays owed
 *  until the replenish seam services it. `loanLedger` is the append-only
 *  record of every focus-hand mint — the only hand-creation event. `window`
 *  is the monotonic ordinal bumped on each entry. Written ONLY by
 *  pipeline/attention.ts and the door's opt-in `attentionCost` path;
 *  OPTIONAL, digest-switch law: `pipeline/digest.ts` absorbs it WHEN PRESENT,
 *  so every pre-attention state — all shipped goldens — digests byte-
 *  identically. */
export interface AttentionState {
  readonly capacity: number;
  readonly tokens: readonly HandToken[];
  readonly debt: number;
  readonly loanLedger: readonly AttentionLoanRecord[];
  readonly window: number;
  readonly lastReplenishBusinessMinute: SimMinute;
}

/* ═══════════════════════════ GameState root ═══════════════════════════ */

/**
 * The whole deterministic run state, one immutable-by-convention value flowing
 * through the 12 steps (+12.5). Ground truth lives HERE and only here; every
 * consumer else sees `observed`. Iteration order: Map insertion order only
 * (§3.4 runtime-neutral discipline).
 */
export interface GameState {
  readonly runSeed: RunSeed;
  readonly engineVersion: string;
  readonly contentHashes: ReplayContentHashes;
  readonly context: TickContext;
  /** In-flight + terminal-marked units, keyed by id. */
  readonly units: ReadonlyMap<EntityId, Unit>;
  readonly nodes: ReadonlyMap<EntityId, NodeRecord>;
  /** Stats-only lane aggregates (stats-not-entities). */
  readonly lanes: ReadonlyMap<EntityId, LaneStats>;
  /** The observed layer — written ONLY by step 12; read by everyone visible. */
  readonly observed: ReadonlyMap<ObservedKey, ObservedCell<unknown>>;
  readonly cash: MoneyBuckets;
  /** Next LedgerEntry.seq (append-only monotonic). */
  readonly ledgerSeq: number;
  readonly contracts: ReadonlyMap<EntityId, Contract>;
  /** Active rule book, by hash; version history lives MySQL-side (§3.2). */
  readonly ruleBook: readonly PolicyCard[];
  readonly ruleBookHash: HashHex;
  /** INTENT-DOOR embeds — both OPTIONAL (hosts predating the door compile
   *  and digest unchanged). `board` is the pipeline-local structural slice
   *  connect/disconnect mutate; `hands` is the action-economy ledger every
   *  executed intent must pay from. The digest-switch law binds: pipeline/
   *  digest.ts absorbs both WHEN PRESENT. */
  readonly board?: BoardState;
  readonly hands?: HandState;
  /** OD-24(a) part-1 embed — the price-override book `adjust-price` writes
   *  (see `PriceOverrideBook`; OPTIONAL, digest-switch law: absorbed by
   *  pipeline/digest.ts ONLY when present, so every pre-pricing state — all
   *  shipped goldens — digests byte-identically). */
  readonly pricing?: PriceOverrideBook;
  /** OD-6/OD-23/OD-4a embed — the ATTENTION denomination (see
   *  `AttentionState`). The special-hand pool every `attentionCost` verb also
   *  pays from, plus its bounded loan ledger. OPTIONAL, digest-switch law:
   *  `pipeline/digest.ts` absorbs it ONLY when present, so every pre-attention
   *  state — all shipped goldens — digests byte-identically. */
  readonly attention?: AttentionState;
}
