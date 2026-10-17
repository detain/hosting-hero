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
  /** ADR-0014 #D2 tier-extension door mechanic (first pair): the 10th door
   *  verb. PRE-ARM a node against the §3.1 corrupts channel — while a node
   *  is shielded (as-of its effective business minute), the exhaustion die
   *  never marks its queued units, so its served terminals stay clean. The
   *  door writes the OPTIONAL `GameState.shield` book; the veto is read at
   *  step 9 (pipeline/corruption.ts owns the as-of law). */
  Shield = "shield-node",
  /** ADR-0015 door-mechanics ruling (tier verbs 1/5): the 11th door verb —
   *  the Scale tier verb made playable (§1.3 serverless card "Cold Start":
   *  "a Chrysalis Pool of pre-warmed shells is the buildable: buying warmth
   *  is buying the absence of a stutter"). The door records the ORDER into
   *  the OPTIONAL `GameState.scale` book (reservedSlots per node, as-of a
   *  business minute; 0 = the card's "scale to zero" amendment — replace,
   *  not expiry, per the shield precedent); the warmth is materialized as
   *  RESERVED SLOTS on the node roster at the step-5/6 capacity read
   *  (pipeline/defaults.ts owns the fold) — the slots-not-HP arithmetic
   *  then flows: ρ, queues, patience all follow the booked roster. Cost of
   *  warmth is NOT door-side (the door never touches cash; host opex
   *  consumption is the future seam, recorded in the door docblock). */
  ScaleNode = "scale-node",
  /** ADR-0015 door-mechanics ruling (tier verbs 2/5 · Maintain): the 12th
   *  door verb — the Maintain tier verb made playable (§1.3 trunk-group-voip
   *  card "The Switchboard", hosting_game.md:1771; the §2.24 hygiene-win law
   *  "cheap but not free" :14907). The door records the window into the
   *  OPTIONAL `GameState.maintain` book (an open/close business-minute band
   *  per node, last-write-wins); the effect is read at step 9 — a queued
   *  unit whose queue-head node is under maintenance as-of the business
   *  minute does NOT cast its abandonment die (ALL bounce modes: the unit
   *  HOLDS instead of walking off). Attendance ABSORBS bounce risk — the
   *  v0 choice is absorb-not-prevent: the wait still accrues, the unit just
   *  never gives up while the switchboard is manned. The window EXPIRES
   *  (hygiene is periodic): past `closeAtBusinessMinute` the entry is inert
   *  at read but kept in the book as the history witness. */
  MaintainNode = "maintain-node",
  /** ADR-0015 door-mechanics ruling (tier verbs 2/5 · Schedule): the 13th
   *  door verb — the Schedule tier verb made playable (§1.3 backup/archival
   *  card "Restore Point", hosting_game.md:1947: "Dominant verb: Schedule.
   *  Teaches: verification is the only proof; the window is the constraint";
   *  the jobs "must complete inside a backup window or fail. They don't
   *  bounce; they fail and retry" :1956; "Jobs that don't finish by 06:00
   *  didn't happen" :4995). The door records the band into the OPTIONAL
   *  `GameState.schedule` book (`JobWindowBook` — deliberately NOT named
   *  after §7.7 recovery windows, which own their own slice); the effect is
   *  read at step 9 ONLY for patience-mode "window" units: inside a live
   *  band the unit's effective deadline becomes the sim-time distance to the
   *  band edge, so a job that fits HOLDS (p = 0) and a job that cannot
   *  finish by the edge FAILS there (p = 1 — the card's window that moved,
   *  made mechanical). Threshold math, zero RNG — the window IS the
   *  deadline. Maintain = attendance absorbs the risk; Schedule = the
   *  calendar imposes it. */
  ScheduleWindow = "schedule-window",
  /** ADR-0015 door-mechanics ruling (tier verbs 3/5 · Sell): the 14th door
   *  verb — the Sell tier verb made playable (§1.3 exchange-colo card "The
   *  Microsecond Cathedral", hosting_game.md:2361-2378: "microseconds are
   *  what you sell", "you sell *equal* latency as a product" :2370; the
   *  §0.3-area verb-shift line "Colo: sell space and police power" :514).
   *  The door records the OFFER into the OPTIONAL `GameState.sell` book
   *  (a priceKey-shaped offer: target + integer µ$ price + term months,
   *  as-of a business minute, last-write-wins per key). OD-24(a) part-1
   *  posture VERBATIM: the book is the order, not the money — closing the
   *  sale is the host's signed contract through the EXISTING economy seam
   *  (register/openContractEconomy + priceKey @5781335), "the queued
   *  economy/HUD lanes reading this book, not the door's job". The sales
   *  act is deterministic player authority — an executed intent IS the
   *  close; no acceptance dice in v0 (refusal grammar is the counterparty). */
  SellOffer = "sell-offer",
  /** ADR-0015 door-mechanics ruling (tier verbs 5/5 · Negotiate): the 15th
   *  door verb — the Negotiate tier verb made playable, the money-lane leg
   *  of the five (§1.3 colo card "Amps and Aisles", hosting_game.md:1632:
   *  "**Dominant verb: Negotiate.**"; ":1637: 2. **Negotiate** — a
   *  ticket/conversation system with a tenant, with tone options and a
   *  relationship meter. **This is the level's combat.**"). The door
   *  records the TALK into the OPTIONAL `GameState.negotiate` book — a
   *  priceKey-shaped term per target: tone, an optional concession (a µ$
   *  renewal-price move), an optional whole-month term extension, all
   *  as-of a business minute, last-write-wins per key. Unlike sell, the
   *  book HAS an engine reader (economy/negotiate.ts): at a contract's
   *  renewal cliff the tone/concession tilt the SAME single retention
   *  draw the elasticity mirror already tilts (zero new rolls), a live
   *  concession discounts the renewal billing base through the existing
   *  override chain head (grandfather still WINS, ADR-0014 #D4), and a
   *  term extension rolls the cliff forward on renewal. The v0 honest
   *  gap: the card's per-tenant relationship meter does not exist — the
   *  tone bumps are its company-level stand-in (the company reputation
   *  ledger @57ea80e stays untouched; record). */
  NegotiateTerms = "negotiate-terms",
  /** ADR-0015 door-mechanics ruling (session-6 roster extension · Isolate):
   *  the 16th door verb — the twelfth hosting type's own card verb made
   *  playable (§1.3 dbaas card "The Managed Database", hosting_game.md
   *  ~:2243: "**Verb: isolate and throttle.** **The boss is a split
   *  brain.**"), and the §7.16 Act-row law finally catching the spec
   *  (~:28825: "every object's inspector has an 'Act' row of at most four
   *  one-click emergency verbs… drain, restart, isolate, shed" — drain is
   *  `disconnect-drain` and shed is `shed-load` today; isolate is the
   *  named Act verb this lands; §7.5 Incident Mode ~:26759 also names it).
   *  One-click ⇒ COMMIT class, one hand / one tick. The door records the
   *  FENCE into the OPTIONAL `GameState.isolate` book — a half-open
   *  window per node `[effective, release)`, last-write-wins — and
   *  touches nothing else: no units, no slots, no routing truth, no RNG,
   *  no cash (state-neutral, the shield/sell posture). The engine reader
   *  is `pipeline/isolation.ts` (`nodeIsolated`/`isolatedNodeIds`),
   *  consumed at the step-5 serve input: while fenced, the node assigns
   *  NO new units — its free arms answer zero to arrivals — while
   *  in-flight and queued work completes or bounces under the existing
   *  patience law. Shield protects what a node SERVES (the step-9
   *  exhaustion die); Isolate stops what a node RECEIVES (step-5
   *  admissions) — the player-authored sibling of the recovery throttle
   *  (`throttleServeNodes`), authorities separate, precedence
   *  min-of-clamps with the fence beating scale warmth. Unlike Shield's
   *  no-un-shield, a fence EXPIRES: §1.4's build-farm verb line
   *  "~:2679 `Verb: isolate, expire, reclaim`" grounds the release
   *  window — isolation is a burden, not a blessing. A null
   *  `releaseAtBusinessMinute` is indefinite until explicitly replaced
   *  (the amendment IS the lift; no dedicated un-isolate verb in v0). */
  IsolateNode = "isolate-node",
  /** ADR-0016 successor program (lane L-TR): the 17th door verb — the dbaas
   *  card's OWN second verb, verbatim §1.3 "The Managed Database"
   *  (hosting_game.md ~:2253): "**Verb: isolate and throttle.**" Isolate
   *  landed the total fence (`isolate-node`, ADR-0015 @86cff89); Throttle
   *  lands the PLAYER-AUTHORED PARTIAL capacity cut — "lose capacity" as a
   *  deliberate trade (§1.3: "throttle everything (lose capacity)"), the
   *  soft-degrade sibling of the engine's automatic recovery clamp. The §7.16
   *  Act-row one-click law (~:28825) again lands it in the COMMIT class: one
   *  hand / one tick. The door records the CUT into the OPTIONAL
   *  `GameState.throttle` book — a half-open window `[effective, release)`
   *  per node, last-write-wins, cut ∈ [0, roster) — and touches nothing
   *  else: no units, no slots, no roster, no RNG, no cash (state-neutral,
   *  the fence posture VERBATIM, both minute legs reused). The engine reader
   *  is `pipeline/throttle.ts` (`nodeThrottleCut`/`throttleCuts`), consumed
   *  at the step-5 serve input as a CAPACITY-AS-CLAMP on ADMISSIONS
   *  (`ServeInExt.throttleCuts`, `defaultServeStep` §(c)): a throttled node
   *  admits while `occupied + need ≤ slots.length(view) − cut`; the roster
   *  is NEVER written (materialized shrink was REJECTED — it poisons
   *  recovery's `fullSlots` capture and would make the cut permanent through
   *  a restoration window), over-cap nodes admit nothing until work walks
   *  off (never-evict honored), and the fence stays the TOTAL case — the
   *  door REFUSES `cut >= roster` pointing at `isolate-node`. The legibility
   *  the card demands — "CPUs throttle by visibly *shrinking the maximum* of
   *  their utilization donut — a beautifully legible way to show 'your
   *  ceiling dropped'" (hosting_game.md ~:2247) — is HUD-side on the cut
   *  book; the sim keeps the authored roster as ground truth. A cut of 0 is
   *  the explicit lift amendment (last-write-wins; no dedicated un-throttle
   *  verb in v0, the fence posture again). */
  ThrottleNode = "throttle-node",
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
  PlayerVerb.Shield,
  PlayerVerb.ScaleNode,
  PlayerVerb.MaintainNode,
  PlayerVerb.ScheduleWindow,
  PlayerVerb.SellOffer,
  PlayerVerb.NegotiateTerms,
  PlayerVerb.IsolateNode,
  PlayerVerb.ThrottleNode,
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

/** ADR-0015 5/5 NEGOTIATE ↔ the card's tone options (§1.3 colo "Amps and
 *  Aisles", hosting_game.md:1637: "a ticket/conversation system with a
 *  tenant, with tone options"). Closed vocabulary, declared in doc order
 *  (escalation ladder): rapport leans on the relationship, firm on the
 *  arithmetic, legal on the contract — each with a legal and reputational
 *  cost the Enforce ladder names; in v0 only the retention bump is built.
 *  The economy module names the vocabulary (`NEGOTIATION_TONES`,
 *  economy/negotiate.ts); the door keeps a private mirror (import law:
 *  pipeline never imports economy) drift-pinned by tests, exactly the
 *  `PRICE_TARGET_KINDS`/`PRICE_KEY_KINDS` precedent. */
export type NegotiationTone = "rapport" | "firm" | "legal";

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

export interface ShieldArgs {
  readonly verb: PlayerVerb.Shield;
  /** Node to pre-arm against the corrupts channel — resolved against
   *  `GameState.nodes` (same world-existence check as shed-load /
   *  communicate; an absent node is the `unknown-node` refusal). */
  readonly targetNodeId: EntityId;
  /** Business-clock effective minute (Dual-Clock law §4.4: data rot accrues
   *  on the macro calendar; the shield is a business action too). The null
   *  sentinel = law from the executing tick; a future stamp is armed but NOT
   *  yet law — the same as-of law as `PriceOverrideRecord` (economy reads
   *  those via `activePriceOverride`; step 9 reads this book via
   *  `nodeShielded` in pipeline/corruption.ts). */
  readonly effectiveAtBusinessMinute: SimMinute | null;
}

export interface ScaleArgs {
  readonly verb: PlayerVerb.ScaleNode;
  /** Node to book reserved warmth for — resolved against `GameState.nodes`
   *  (same world-existence check as shield/shed/communicate; an absent node
   *  is the `unknown-node` refusal). */
  readonly targetNodeId: EntityId;
  /** Reserved slots to hold WARM beyond the node's authored roster — an
   *  integer >= 0. 0 is the legal "scale to zero" amendment (§1.3 serverless
   *  card): it REPLACES a prior booking, withdrawing the warmth (bounded by
   *  the occupied-slot floor — warmth already carrying a unit is never
   *  evicted from under it, the recovery throttle's non-eviction law).
   *  Negative or fractional warmth is unbuyable → value-domain refusal. */
  readonly reservedSlots: number;
  /** Business-clock effective minute (Dual-Clock law §4.4: capacity is a
   *  business action, the same as pricing and shielding). The null sentinel
   *  = law from the executing tick; a future stamp is armed but NOT yet law
   *  — the same as-of law as the shield book. */
  readonly effectiveAtBusinessMinute: SimMinute | null;
}

export interface MaintainArgs {
  readonly verb: PlayerVerb.MaintainNode;
  /** Node whose switchboard gets manned for the band — resolved against
   *  `GameState.nodes` (same world-existence check as shield/scale; an
   *  absent node is the `unknown-node` refusal). */
  readonly targetNodeId: EntityId;
  /** Business minute the maintenance window OPENS (inclusive). The null
   *  sentinel = open from the executing tick (attendance starts now); a
   *  future stamp arms the band — Dual-Clock as-of law, the same reading
   *  discipline as the shield/scale books. */
  readonly openAtBusinessMinute: SimMinute | null;
  /** Business minute the window CLOSES (exclusive — the instant the crew
   *  walks off, the abandonment die re-admits). Must exceed the open edge;
   *  a zero-length band is a booking error, not a legal no-op (§2.24
   *  hygiene is "cheap but not free" — an empty window buys nothing and
   *  refusing it is cheaper than pretending it holds units). */
  readonly closeAtBusinessMinute: SimMinute;
}

export interface ScheduleArgs {
  readonly verb: PlayerVerb.ScheduleWindow;
  /** Node whose job traffic gets a deadline band — resolved against
   *  `GameState.nodes` (same world-existence check; `unknown-node`). */
  readonly targetNodeId: EntityId;
  /** Business minute the job window OPENS (inclusive). The null sentinel =
   *  in force from the executing tick; a future stamp arms the band. */
  readonly openAtBusinessMinute: SimMinute | null;
  /** Business minute the window CLOSES (exclusive) — the trailing edge the
   *  card's "Jobs that don't finish by 06:00 didn't happen" law made
   *  mechanical: a window-mode job that cannot finish by this edge FAILS
   *  there. Must exceed the open edge (same refuse-not-pretend law as
   *  maintenance bands). */
  readonly closeAtBusinessMinute: SimMinute;
}

/** What a `sell-offer` order binds to (ADR-0015 3/5 · Sell). The target
 *  reuses the CLOSED `PriceTargetKind` vocabulary {plan|contract-class|sku}
 *  — deliberately the SAME kind space as `adjust-price`: an offer is a price
 *  on a sellable, so its composite key is exactly the economy `priceKey`
 *  grammar (codec `priceOverrideKey`/`parsePriceOverrideKey`, reused by
 *  identity — a host can feed a sell-book key straight into the pricing
 *  override / priceKey seam with no re-derivation). The door never
 *  interprets kinds; `canSellOffer` resolves them host-side. */
export interface SellOfferArgs {
  readonly verb: PlayerVerb.SellOffer;
  /** Closed PriceTargetKind vocabulary; anything else is a
   *  `bad-target-kind` refusal (phrase shared with `adjust-price`). */
  readonly targetKind: PriceTargetKind;
  /** Id inside the targetKind namespace — resolved by the host validator
   *  (`canSellOffer`; absent validator = structural sanity only, the
   *  `canPlaceDevice`/`canAdjustPrice` decoupling pattern). */
  readonly targetId: EntityId;
  /** Integer µ$ — the MoneyUnit bigint makes a fractional offer
   *  UNREPRESENTABLE at the wire (Law 2): a float/string price is
   *  structural garbage (throws), a non-positive bigint is the
   *  `bad-offer-price` value-domain refusal. */
  readonly offerPriceMicroUsd: MoneyUnit;
  /** Contract term in whole business months — a safe integer >= 1
   *  (`bad-term-months` refuses everything else). The term is what the
   *  host signs onto when it consumes the offer; the door just books it. */
  readonly termMonths: number;
  /** Business-clock effective minute (Dual-Clock law §4.4: a sale is a
   *  business act); null sentinel = the offer stands from the executing
   *  tick, a future stamp arms it — the `PriceOverrideRecord` as-of
   *  discipline. The door only STAMPS this field (part-1 posture is
   *  state-neutral); the host decides what "later" means. */
  readonly effectiveAtBusinessMinute: SimMinute | null;
}

/** ADR-0015 5/5 NEGOTIATE ↔ the terms talked onto one price target
 *  (targetKind/targetId reuse the `PriceTargetKind`/priceKey grammar —
 *  the `priceOverrideKey` codec is REUSED by identity exactly as sell-offer
 *  does, so a negotiation key IS an economy priceKey and matches a live
 *  contract's sparse `priceKey` with zero translation). */
export interface NegotiateTermsArgs {
  readonly verb: PlayerVerb.NegotiateTerms;
  /** Closed price-target kind (see `AdjustPriceArgs`). */
  readonly targetKind: PriceTargetKind;
  /** Id inside the targetKind namespace — resolved by the host validator
   *  (`canNegotiateTerms`; absent validator = structural sanity only, the
   *  `canPlaceDevice`/`canAdjustPrice` decoupling pattern). */
  readonly targetId: EntityId;
  /** Closed tone vocabulary (`NegotiationTone`); anything else is the
   *  `bad-tone` refusal. The card's combat choice (":1637 … tone options
   *  and a relationship meter"). */
  readonly tone: NegotiationTone;
  /** Signed renewal-cycle price move in integer µ$ — the SIGN LAW is
   *  defined ONCE here: a POSITIVE concession is a DISCOUNT granted to the
   *  tenant (the renewal bills at base − concession); null = the talk
   *  carries no money (rapport by words alone). 0n is legal and MEANINGFUL
   *  ("we will not move on price") — it behaves like null for the money
   *  and like a presence for the digest. Negatives refuse (`bad-concession`
   *  — an agreed PRICE RISE rides adjust-price/sell-offer, not the
   *  concession leg). MoneyUnit keeps a fractional concession
   *  UNREPRESENTABLE at the wire (Law 2). */
  readonly concessionMicroUsd: MoneyUnit | null;
  /** Whole business months the renewal term rolls forward on top of the
   *  renewed geometry at the cliff (safe integer >= 1 or null = no
   *  extension). An extension never re-arms a written-off contract — the
   *  fold only touches the roll-forward on a renewing cliff. */
  readonly termMonthsExtension: number | null;
  /** Business-clock effective minute (Dual-Clock law §4.4: a negotiation
   *  is a business act); null sentinel = in force from the executing
   *  tick, a future stamp arms it — the `PriceOverrideRecord` as-of
   *  discipline, consumed at the cliff by `activeNegotiation`. */
  readonly effectiveAtBusinessMinute: SimMinute | null;
}

/** ADR-0015 session-6 roster extension (`IsolateNode` — the 16th verb). */
export interface IsolateArgs {
  readonly verb: PlayerVerb.IsolateNode;
  /** Node to fence against NEW work — resolved against `GameState.nodes`
   *  (same world-existence check as shield-node / scale-node; an absent
   *  node is the `unknown-node` refusal). The fence never touches the
   *  node's records: edges stay intact, in-flight and queued units ride
   *  the existing patience law (`pipeline/isolation.ts`). */
  readonly targetNodeId: EntityId;
  /** Business-clock effective minute (Dual-Clock law §4.4 — a fence is a
   *  business act, the shield/scale as-of discipline): the null sentinel =
   *  fenced from the executing tick; a future stamp is armed but NOT yet
   *  law, honored same-tick by `nodeIsolated`. */
  readonly effectiveAtBusinessMinute: SimMinute | null;
  /** Business-clock RELEASE minute — the fence window is HALF-OPEN
   *  `[effective, release)`: at `release` the node admits again, strictly.
   *  §1.4's build-farm verb line ("isolate, expire, reclaim",
   *  hosting_game.md ~:2679) grounds the expiry: isolation is a burden,
   *  not a blessing — unlike Shield there is a reckoning. The null
   *  sentinel = indefinite until explicitly replaced (last-write-wins;
   *  the amendment IS the lift — no dedicated un-isolate verb in v0).
   *  When both minutes are non-null, `release` must be strictly greater
   *  than `effective` (`release-before-effective` refusal); a null
   *  effective with release 0 is accepted as already-expired inert
   *  history (the maintain close-0 posture, ADR-0015 lane L-DM2). */
  readonly releaseAtBusinessMinute: SimMinute | null;
}

/** ADR-0016 successor program (`ThrottleNode` — the 17th verb, the dbaas
 *  card's OWN second verb: §1.3 "Verb: isolate and throttle."). */
export interface ThrottleArgs {
  readonly verb: PlayerVerb.ThrottleNode;
  /** Node whose admission ceiling drops — resolved against `GameState.nodes`
   *  (the fence's world-existence check reused verbatim; an absent node is
   *  the `unknown-node` refusal). The cut never touches the node's records:
   *  the roster is NOT shrunk, the queue is NOT truncated, occupied slots
   *  are NOT evicted — the discount is applied at the step-5 admissions
   *  read (`pipeline/throttle.ts` + `defaults.ts` §(c)). */
  readonly targetNodeId: EntityId;
  /** Slots of NEW-ADMISSION ceiling removed, value domain `[0, roster)`
   *  where roster is the node's live `slots.length` at the door. 0 is the
   *  explicit LIFT amendment (book the row, law answers null); `cut >=
   *  roster` is refused with `bad-cut-slots` pointing at `isolate-node` —
   *  the total case belongs to the fence, and the door's range check is
   *  what keeps every throttle a PARTIAL cut. Structural type (safe
   *  integer) is M2's parse wall; the value domain is the handler's. */
  readonly cutSlots: number;
  /** Business-clock effective minute (Dual-Clock law §4.4 — a throttle is a
   *  business act, the fence/shield as-of discipline VERBATIM): the null
   *  sentinel = cut from the executing tick; a future stamp is armed but NOT
   *  yet law, honored same-tick by `nodeThrottleCut`. */
  readonly effectiveAtBusinessMinute: SimMinute | null;
  /** Business-clock RELEASE minute — the cut window is HALF-OPEN
   *  `[effective, release)`, the fence's window law VERBATIM (ADR-0016
   *  #D8-style reuse, no new grammar): at `release` the node admits at full
   *  ceiling again, strictly. The null sentinel = indefinite until
   *  explicitly replaced (last-write-wins; the cut-0 amendment IS the
   *  lift). When both minutes are non-null, `release` must be strictly
   *  greater than `effective` (`release-before-effective` refusal, reused);
   *  a null effective with release 0 is accepted as already-expired inert
   *  history (the maintain close-0 posture, lane L-DM2 @5987ef1). */
  readonly releaseAtBusinessMinute: SimMinute | null;
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
  | AdjustPriceArgs
  | ShieldArgs
  | ScaleArgs
  | MaintainArgs
  | ScheduleArgs
  | SellOfferArgs
  | NegotiateTermsArgs
  | IsolateArgs
  | ThrottleArgs;

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

/** One executed `shield-node` order, frozen into the pre-arm book. The
 *  record is the ENTIRE door side effect (ADR-0014 #D2): the corruption
 *  channel READS this book at step 9 (pipeline/corruption.ts
 *  `nodeShielded` mirrors economy's `activePriceOverride` as-of law) —
 *  nothing in the door touches units, marks, or RNG. `causeId` attribution
 *  lives on the minting `intent-executed` event (`intent:<seq>`), mirroring
 *  every other door verb. */
export interface ShieldEntry {
  /** Macro tick the door executed the order (write-order witness; the book's
   *  Map is keyed by node, never ordered — last-write-wins per node). */
  readonly shippedAtTick: SimTick;
  /** null = law from `shippedAtTick`; a business-minute stamp otherwise
   *  (armed early, effective later — the pre-arm reads its name). */
  readonly effectiveAtBusinessMinute: SimMinute | null;
}

/** OPTIONAL `GameState` embed — the corruption pre-arm book written ONLY by
 *  the door's `shield-node` handler (same embed law as board/hands/pricing:
 *  absent ⇒ byte-identical digests everywhere; `pipeline/digest.ts` absorbs
 *  it WHEN PRESENT, node ids sorted code-unit so Map insertion order never
 *  leaks). Keyed by node id, LAST-WRITE-WINS per node (re-shielding a node
 *  replaces its entry and bumps `version` — the topology/board memoization
 *  convention). There is NO un-shield verb in v0: re-arming with a fresh
 *  stamp is the only amendment, and a stamp already in force never expires
 *  (pre-arm, not a lease — the amendment door follows its own mechanic
 *  design per ADR-0014 #D2 mechanics order). */
export interface ShieldBook {
  readonly version: number;
  readonly entries: ReadonlyMap<EntityId, ShieldEntry>;
}

/** One executed `scale-node` order, frozen into the reserved-warmth book.
 *  The record is the ENTIRE door side effect (ADR-0015, mirroring
 *  `ShieldEntry`): the serve capacity read consumes this book at step 5/6
 *  (pipeline/defaults.ts `scaleWarmInForce` owns the as-of law, mirroring
 *  corruption.ts `nodeShielded` and economy's `activePriceOverride`) —
 *  nothing in the door touches nodes, units, or RNG. `causeId` attribution
 *  lives on the minting `intent-executed` event (`intent:<seq>`), mirroring
 *  every other door verb. */
export interface ScaleEntry {
  /** Warm slots booked BEYOND `baseRosterSlots` — integer >= 0; 0 is the
   *  legal "scale to zero" amendment (§1.3 serverless card: withdraw the
   *  pool, the roster returns to its authored size once no warm slot is
   *  carrying a unit — the occupied-slot floor governs the release). */
  readonly reservedSlots: number;
  /** The node's authored roster length at booking time. The effective
   *  capacity is `baseRosterSlots + reservedSlots`, and the anchor RIDES
   *  the entry (chain-inherited across amendments) so pure arithmetic on
   *  the live roster can never mistake a grown head for authored capacity
   *  — re-arming a node that already spent its warmth stays exact. The
   *  door stamps it from the live roster (or the prior entry's anchor),
   *  never the fold. */
  readonly baseRosterSlots: number;
  /** Macro tick the door executed the order (write-order witness; the book's
   *  Map is keyed by node, never ordered — last-write-wins per node). */
  readonly shippedAtTick: SimTick;
  /** null = law from `shippedAtTick`; a business-minute stamp otherwise
   *  (buy warmth ahead of the rush — the pre-arm reads its name). */
  readonly effectiveAtBusinessMinute: SimMinute | null;
}

/** OPTIONAL `GameState` embed — the reserved-warmth book `scale-node` writes
 *  (same embed law as board/hands/pricing/shield: absent ⇒ byte-identical
 *  digests everywhere; `pipeline/digest.ts` absorbs it WHEN PRESENT, node
 *  ids sorted code-unit so Map insertion order never leaks). Keyed by node
 *  id, LAST-WRITE-WINS per node (re-booking a node replaces its entry and
 *  bumps `version` — the topology/board memoization convention). There is
 *  NO dedicated withdrawal verb: the amendment door follows its own
 *  mechanic design (ADR-0015), and `reservedSlots: 0` replaces a prior
 *  booking per the card's scale-to-zero law; a stamp already in force
 *  never expires on its own. */
export interface ScaleBook {
  readonly version: number;
  readonly entries: ReadonlyMap<EntityId, ScaleEntry>;
}

/** One executed `maintain-node` order, frozen into the attendance book. The
 *  record is the ENTIRE door side effect (ADR-0015, mirroring `ShieldEntry`/
 *  `ScaleEntry`): the patience step READS this book at step 9 (pipeline/
 *  defaults.ts `maintainInForce` owns the as-of law, mirroring corruption.ts
 *  `nodeShielded`) — nothing in the door touches units, dice, or RNG.
 *  `causeId` attribution lives on the minting `intent-executed` event
 *  (`intent:<seq>`), mirroring every other door verb. */
export interface MaintainWindow {
  /** Business minute the band OPENS (inclusive). null = in force from the
   *  executing tick (the crew is already at the board). */
  readonly openAtBusinessMinute: SimMinute | null;
  /** Business minute the band CLOSES (exclusive). Past this edge the entry
   *  is INERT at read — hygiene is periodic (§2.24: the window is a band,
   *  not a permanent upgrade) — but the row is KEPT in the book as the
   *  history witness of who manned what, when. */
  readonly closeAtBusinessMinute: SimMinute;
  /** Macro tick the door executed the order (write-order witness; the book's
   *  Map is keyed by node, never ordered — last-write-wins per node). */
  readonly shippedAtTick: SimTick;
}

/** OPTIONAL `GameState` embed — the maintenance-attendance book
 *  `maintain-node` writes (same embed law as board/hands/pricing/shield/
 *  scale: absent ⇒ byte-identical digests everywhere; `pipeline/digest.ts`
 *  absorbs it WHEN PRESENT, node ids sorted code-unit so Map insertion order
 *  never leaks). Keyed by node id, LAST-WRITE-WINS per node (a fresh booking
 *  replaces the node's band and bumps `version` — expired bands are NOT
 *  pruned: the digest encodes the book raw, expiry is a READ-time law owned
 *  by `maintainInForce`). */
export interface MaintainBook {
  readonly version: number;
  readonly entries: ReadonlyMap<EntityId, MaintainWindow>;
}

/** One executed `schedule-window` order, frozen into the job-window band.
 *  The record is the ENTIRE door side effect (ADR-0015): the patience step
 *  READS this book at step 9 for patience-mode "window" units ONLY
 *  (pipeline/defaults.ts `jobWindowInForce` + `jobBandDistanceUs` own the
 *  as-of and conversion laws) — nothing in the door touches units or RNG.
 *  Deliberately NOT named after §7.7 recovery windows — those are the
 *  second-failure throttle's own slice (`GameState.recovery`); a job window
 *  is a DEADLINE the player books on the calendar, not a damage record.
 *  `causeId` attribution lives on the minting `intent-executed` event. */
export interface JobWindow {
  /** Business minute the band OPENS (inclusive). null = in force from the
   *  executing tick (tonight's window, already open). */
  readonly openAtBusinessMinute: SimMinute | null;
  /** Business minute the band CLOSES (exclusive) — "Jobs that don't finish
   *  by 06:00 didn't happen" (hosting_game.md:4995). Past this edge the
   *  entry is INERT at read; the row is KEPT as the history witness. */
  readonly closeAtBusinessMinute: SimMinute;
  /** Macro tick the door executed the order (write-order witness;
   *  last-write-wins per node). */
  readonly shippedAtTick: SimTick;
}

/** OPTIONAL `GameState` embed — the backup job-window book `schedule-window`
 *  writes (same embed law as the other door books: absent ⇒ byte-identical
 *  digests everywhere; `pipeline/digest.ts` absorbs it WHEN PRESENT, node
 *  ids sorted code-unit). Keyed by node id, LAST-WRITE-WINS per node —
 *  re-arming the window is the cheap move (occupancy 1: the 26-hour-disaster
 *  law, hosting_game.md:1964, says the calendar must never be expensive to
 *  correct). Expired bands are NOT pruned; expiry is a READ-time law owned
 *  by `jobWindowInForce`. */
export interface JobWindowBook {
  readonly version: number;
  readonly entries: ReadonlyMap<EntityId, JobWindow>;
}

/** One executed `sell-offer` order, frozen into the offer book. The record
 *  is the ENTIRE door side effect (ADR-0015 3/5 · Sell): NOTHING in the sim
 *  reads this book in v0 — closing the sale is the host's, which signs a
 *  contract through the EXISTING economy seam (register/openContractEconomy
 *  + priceKey @5781335) with the booked price and term. The sales act is
 *  deterministic player authority — an executed intent IS the close; no
 *  acceptance dice in v0 (grounded; the refusal grammar is the
 *  counterparty). */
export interface SellOffer {
  /** Closed price-target kind (see `SellOfferArgs`). */
  readonly targetKind: PriceTargetKind;
  /** Host-namespace id of what is being sold (never resolved by the door). */
  readonly targetId: EntityId;
  /** Integer µ$ of the standing offer. */
  readonly offerPriceMicroUsd: MoneyUnit;
  /** Whole business months of the offered term (>= 1 by the door's law). */
  readonly termMonths: number;
  /** Macro tick the door executed the order (write-order witness;
   *  last-write-wins per key). */
  readonly shippedAtTick: SimTick;
  /** Business minute the offer takes effect; null = from `shippedAtTick`.
   *  The as-of reading discipline is the `PriceOverrideRecord` twin. */
  readonly effectiveAtBusinessMinute: SimMinute | null;
}

/** OPTIONAL `GameState` embed — the sell-offer book `sell-offer` writes
 *  (same embed law as the other door books: absent ⇒ byte-identical
 *  digests everywhere; `pipeline/digest.ts` absorbs it WHEN PRESENT).
 *  Keyed by the COMPOSITE `<targetKind>:<targetId>` priceKey grammar —
 *  the `priceOverrideKey`/`parsePriceOverrideKey` codec REUSED by identity,
 *  so a sell-book key IS an economy priceKey with zero translation.
 *  LAST-WRITE-WINS per key (amending an offer replaces it; `version` bumps
 *  per materialized write — the board/pricing memoization convention). */
export interface SellBook {
  readonly version: number;
  readonly entries: ReadonlyMap<string, SellOffer>;
}

/** One executed `negotiate-terms` order, frozen into the negotiation book
 *  (ADR-0015 5/5 · Negotiate). The record is the entire door side effect;
 *  the ENGINE reader is economy/negotiate.ts, consumed at the renewal
 *  cliff and the invoice calendar through the forwarded
 *  `EconomyTickIn.negotiations` map. Grounded §1.3 colo "Amps and
 *  Aisles", hosting_game.md:1632 "**Dominant verb: Negotiate.**" and
 *  :1637 "tone options and a relationship meter. **This is the level's
 *  combat.**" — the card's per-tenant relationship meter does NOT exist
 *  in v0 (honest gap; company-level reputation @57ea80e stays untouched);
 *  the tone retention bumps in `NegotiationConfig` are its stand-in. */
export interface NegotiationTerm {
  /** Closed price-target kind (see `NegotiateTermsArgs`). */
  readonly targetKind: PriceTargetKind;
  /** Host-namespace id of who is being negotiated with. */
  readonly targetId: EntityId;
  /** Closed tone vocabulary (see `NegotiationTone`). */
  readonly tone: NegotiationTone;
  /** Signed renewal-cycle price move in µ$, positive = tenant discount
   *  (the sign law lives on `NegotiateTermsArgs.concessionMicroUsd`);
   *  null = no money in the talk. 0n is a booked "no movement". */
  readonly concessionMicroUsd: MoneyUnit | null;
  /** Whole months the renewed term rolls forward at the cliff (>= 1 by
   *  the door's law); null = the term renews on its existing geometry. */
  readonly termMonthsExtension: number | null;
  /** Macro tick the door executed the order (write-order witness;
   *  last-write-wins per key). */
  readonly shippedAtTick: SimTick;
  /** Business minute the terms take effect; null = from `shippedAtTick`.
   *  The as-of reading discipline is the `PriceOverrideRecord` twin
   *  (`activeNegotiation` — a future stamp is not-yet-law). */
  readonly effectiveAtBusinessMinute: SimMinute | null;
}

/** OPTIONAL `GameState` embed — the negotiate-terms book `negotiate-terms`
 *  writes (same embed law as the other door books: absent ⇒ byte-identical
 *  digests everywhere; `pipeline/digest.ts` absorbs it WHEN PRESENT).
 *  Keyed by the COMPOSITE `<targetKind>:<targetId>` priceKey grammar — the
 *  `priceOverrideKey`/`parsePriceOverrideKey` codec REUSED by identity, so
 *  a negotiation key matches a contract's sparse `priceKey` (the leg the
 *  economy fold reads). LAST-WRITE-WINS per key (re-negotiating replaces
 *  the standing terms; `version` bumps per materialized write — the
 *  board/pricing memoization convention). */
export interface NegotiateBook {
  readonly version: number;
  readonly entries: ReadonlyMap<string, NegotiationTerm>;
}

/** ADR-0015 session-6 roster extension (`IsolateNode`) — one fence record
 *  per node. The door stamps the window and NOTHING else; the fold reads it
 *  as-of business minutes (`nodeIsolated`). No base-roster anchor lives
 *  here (unlike `ScaleEntry`): the fence never writes the roster — it blocks
 *  step-5 admissions — so there is nothing to restore when it lifts and
 *  occupied arms are trivially never evicted. */
export interface IsolateEntry {
  /** Macro tick the door executed the order (write-order witness;
   *  last-write-wins per node). */
  readonly shippedAtTick: SimTick;
  /** Business minute the fence drops; null = from `shippedAtTick`
   *  (same-tick pre-arm honored — the `ShieldEntry` as-of twin). */
  readonly effectiveAtBusinessMinute: SimMinute | null;
  /** Business minute the fence lifts, STRICTLY exclusive — the window is
   *  half-open `[effective, release)`, at `release` the node admits again
   *  (§1.4 "isolate, expire, reclaim"). Null = indefinite until explicitly
   *  replaced. Expired rows are KEPT as history witness, inert at read —
   *  the maintain/schedule read-time expiry law (ADR-0015 lane L-DM2);
   *  nothing is ever pruned, the digest encodes rows raw. */
  readonly releaseAtBusinessMinute: SimMinute | null;
}

/** OPTIONAL `GameState` embed — the isolate-node book `isolate-node` writes
 *  (same embed law as the other door books: absent ⇒ byte-identical digests
 *  everywhere; `pipeline/digest.ts` absorbs it WHEN PRESENT). Keyed by node
 *  id — LAST-WRITE-WINS per node: re-fencing replaces the standing window
 *  (a shorter window is the amendment that lifts early; there is no
 *  dedicated un-isolate verb in v0). `version` bumps per materialized write
 *  — the board/pricing memoization convention. */
export interface IsolateBook {
  readonly version: number;
  readonly entries: ReadonlyMap<EntityId, IsolateEntry>;
}

/** ADR-0016 successor program (`ThrottleNode`) — one cut record per node.
 *  The door stamps the WINDOW and the CUT and NOTHING else; the fold reads
 *  it as-of business minutes (`nodeThrottleCut`). No base-roster anchor
 *  lives here (unlike `ScaleEntry`): the cut discounts the ADMISSION ceiling
 *  at read time and never writes the roster — so there is nothing to
 *  restore when it lifts, and occupied arms are trivially never evicted. */
export interface ThrottleEntry {
  /** Macro tick the door executed the order (write-order witness;
   *  last-write-wins per node). */
  readonly shippedAtTick: SimTick;
  /** Admission-ceiling slots REMOVED while the window is in force, value
   *  domain `[0, roster)` enforced at the door (roster = the node's live
   *  `slots.length` — the scale lane's live-roster-check precedent). A
   *  booked cut is never re-validated downstream: if a foreign board later
   *  shrinks the view below it, §(c)'s ceiling arithmetic admits nothing
   *  (min-of-clamps composes), the book stays inert-but-carried, and no
   *  throw is possible. 0 = the explicit lift amendment (reads null —
   *  indistinguishable from absent to the fold, kept raw in the book). */
  readonly cutSlots: number;
  /** Business minute the cut drops; null = from `shippedAtTick`
   *  (same-tick pre-arm honored — the `ShieldEntry`/`IsolateEntry` as-of
   *  twin). */
  readonly effectiveAtBusinessMinute: SimMinute | null;
  /** Business minute the cut lifts, STRICTLY exclusive — the window is
   *  half-open `[effective, release)`, at `release` the node admits at full
   *  ceiling again (the fence's release leg VERBATIM). Null = indefinite
   *  until explicitly replaced. Expired rows are KEPT as history witness,
   *  inert at read — the maintain/schedule/isolate read-time expiry law;
   *  nothing is ever pruned, the digest encodes rows raw. */
  readonly releaseAtBusinessMinute: SimMinute | null;
}

/** OPTIONAL `GameState` embed — the throttle-node book `throttle-node`
 *  writes (same embed law as the other door books: absent ⇒ byte-identical
 *  digests everywhere; `pipeline/digest.ts` absorbs it WHEN PRESENT). Keyed
 *  by node id — LAST-WRITE-WINS per node: re-throttling replaces the
 *  standing window (a cut of 0 is the amendment that lifts; there is no
 *  dedicated un-throttle verb in v0). `version` bumps per materialized
 *  write — the board/pricing memoization convention. */
export interface ThrottleBook {
  readonly version: number;
  readonly entries: ReadonlyMap<EntityId, ThrottleEntry>;
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

/* ═══════════════════════════ §7.7 recovery embed (pipeline/recovery.ts) ══════ */

/** The two phases of a node's SECOND FAILURE WINDOW (§7.7 "Second Failure
 *  Window", audit g21 MISSING row): `window` is the shadow period — the
 *  countdown the player "desperately wants to hit zero" while the node
 *  climbs back through gradual restoration; `locked` is the safe-mode floor
 *  a failure INSIDE the window forces (reduced posture, window restarts). */
export type RecoveryWindowPhase = "window" | "locked";

/** One node's live recovery record. `fullSlots` is the undamaged arm count
 *  captured at window open; `effectiveSlots` is the (re)computed slot count
 *  the serve step sees while the record lives — the engine-side GRADUAL
 *  RESTORATION and the cold-cache slow-admission counter, pure minute math,
 *  never an RNG draw. Written ONLY by pipeline/recovery.ts. */
export interface RecoveryWindowRecord {
  readonly nodeId: EntityId;
  readonly phase: RecoveryWindowPhase;
  /** Minute the CURRENT window (or lock) opened — the countdown anchor. */
  readonly openedAtMinute: SimMinute;
  /** Minute the window closes untouched (the bar draining to zero). */
  readonly closesAtMinute: SimMinute;
  /** Locked-phase floor expiry; 0 while phase === "window". */
  readonly lockUntilMinute: SimMinute;
  /** Second failures folded so far this episode (each one re-locks). */
  readonly strikes: number;
  /** Arm count captured whole at window open (restoration target). */
  readonly fullSlots: number;
  /** Visible slots this minute (monotone ramp; locks clamp it to the floor). */
  readonly effectiveSlots: number;
}

/** OPTIONAL `GameState` embed — the §7.7 recovery half v0. `windows` are the
 *  live second-failure records per node; `lastStruggleMinute` is the
 *  pre-window episode memory (the minute a node last bounced at/above the
 *  struggle threshold). Written ONLY by pipeline/recovery.ts, and only when
 *  the driver is wired with `options.recovery` — OPTIONAL, digest-switch law:
 *  `pipeline/digest.ts` absorbs it ONLY when present, so every pre-recovery
 *  state — all shipped goldens — digests byte-identically. */
export interface RecoveryState {
  readonly windows: ReadonlyMap<EntityId, RecoveryWindowRecord>;
  readonly lastStruggleMinute: ReadonlyMap<EntityId, SimMinute>;
}

/**
 * §3.1 "corrupt-not-bounce" (R25 census) — ONE corrupted COMPLETED response,
 * raised by the step-9 `corrupts` patience mode when a marked unit terminates
 * `served`. It never enters the frozen SimEvent union: like
 * `RecoveryNotice`, it rides its own `TickResult.corruptions` channel
 * (host-forwarded, replay-visible through the state slice it mutated).
 * `causeId` convention: `corruption:<unitId>:<minute>` (house precedent:
 * `economy:death:{…}`, `recovery:<kind>:…`).
 */
export interface CorruptOutcome {
  readonly unitId: EntityId;
  readonly atUs: SimTimeUs;
  readonly causeId: CauseId;
}

/** OPTIONAL `GameState` embed — the §3.1 `corrupts` patience-mode ledger.
 *  `marks` are LIVE in-flight units whose patience budget ran out while the
 *  type-mode was `corrupts` (the step-9 exhaustion die decides whether the
 *  completed response will corrupt; ONE roll per unit, never re-cast; the
 *  entry clears at the unit's terminal). `corruptedCount` is the lifetime
 *  count of corrupted completed responses. Written ONLY by the patience step
 *  (marks) and the driver fold (terminals), and only once a `corrupts` row
 *  is authored — OPTIONAL, digest-switch law: `pipeline/digest.ts` absorbs
 *  it ONLY when present, so every pre-corruption state — all shipped
 *  goldens — digests byte-identically. */
export interface CorruptionState {
  readonly marks: ReadonlyMap<EntityId, boolean>;
  readonly corruptedCount: number;
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
  /** §7.7 recovery embed — the SECOND FAILURE WINDOWS + gradual-restoration
   *  throttles live on the board (see `RecoveryState`). Written only when the
   *  driver is wired with `options.recovery`. OPTIONAL, digest-switch law:
   *  `pipeline/digest.ts` absorbs it ONLY when present, so every pre-recovery
   *  state — all shipped goldens — digests byte-identically. */
  readonly recovery?: RecoveryState;
  /** §3.1 corrupts-mode embed — the exhaustion marks + lifetime corrupted
   *  response count (see `CorruptionState`). Written only when a
   *  `patienceModeByType` row names "corrupts" and a queued unit actually
   *  exhausts its budget. OPTIONAL, digest-switch law: `pipeline/digest.ts`
   *  absorbs it ONLY when present, so every pre-corruption state — all
   *  shipped goldens — digests byte-identically. */
  readonly corruption?: CorruptionState;
  /** ADR-0014 #D2 embed — the corruption PRE-ARM book `shield-node` writes
   *  (see `ShieldBook`). Read at step 9 by the patience step through the
   *  driver-forwarded input (pipeline/corruption.ts owns the as-of veto).
   *  OPTIONAL, digest-switch law: `pipeline/digest.ts` absorbs it ONLY when
   *  present, so every pre-shield state — all shipped goldens — digests
   *  byte-identically. */
  readonly shield?: ShieldBook;
  /** ADR-0015 embed — the reserved-warmth (Scale) book `scale-node` writes
   *  (see `ScaleBook`). Read at the step-5/6 serve capacity fold through
   *  the driver-forwarded state view (pipeline/defaults.ts owns the as-of
   *  law; recovery windows defer the materialization). OPTIONAL,
   *  digest-switch law: `pipeline/digest.ts` absorbs it ONLY when present,
   *  so every pre-scale state — all shipped goldens — digests
   *  byte-identically. */
  readonly scale?: ScaleBook;
  /** ADR-0015 embed — the maintenance-attendance (Maintain) book
   *  `maintain-node` writes (see `MaintainBook`). Read at step 9 by the
   *  patience step through the driver-forwarded input: a queued unit whose
   *  queue-head node is manned as-of the business minute does NOT cast its
   *  abandonment die (pipeline/defaults.ts owns the as-of law). OPTIONAL,
   *  digest-switch law: `pipeline/digest.ts` absorbs it ONLY when present,
   *  so every pre-maintain state — all shipped goldens — digests
   *  byte-identically. */
  readonly maintain?: MaintainBook;
  /** ADR-0015 embed — the backup job-window (Schedule) book
   *  `schedule-window` writes (see `JobWindowBook`). Read at step 9 by the
   *  patience step ONLY for patience-mode "window" units: inside a live band
   *  the unit's effective deadline becomes the sim-time distance to the
   *  band's trailing edge (pipeline/defaults.ts owns the as-of + conversion
   *  laws; the window IS the deadline — zero RNG). Distinct from
   *  `GameState.recovery` (§7.7 second-failure windows — damage records, not
   *  calendar deadlines). OPTIONAL, digest-switch law: `pipeline/digest.ts`
   *  absorbs it ONLY when present, so every pre-schedule state — all shipped
   *  goldens — digests byte-identically. */
  readonly schedule?: JobWindowBook;
  /** ADR-0015 embed — the sell-offer (Sell) book `sell-offer` writes (see
   *  `SellBook`): a priceKey-shaped standing offer per target, no sim-side
   *  reader in v0 — the host consumes the book between ticks and signs the
   *  sale through the EXISTING economy priceKey seam (OD-24(a) part-1
   *  posture; the door never moves money, audit-tested by reference
   *  identity). OPTIONAL, digest-switch law: `pipeline/digest.ts` absorbs
   *  it ONLY when present, so every pre-sell state — all shipped goldens —
   *  digests byte-identically. */
  readonly sell?: SellBook;
  /** ADR-0015 embed — the negotiate-terms (Negotiate) book
   *  `negotiate-terms` writes (see `NegotiateBook`): a priceKey-shaped
   *  standing term per target — tone, an optional µ$ concession, an
   *  optional whole-month term extension, as-of a business minute.
   *  Forwarded per fold as `EconomyTickIn.negotiations` (internal/
   *  tickFold.ts, mirrors the priceOverrides seam exactly — absent book ⇒
   *  key omitted ⇒ every shipped money digest byte-identical); consumed at
   *  the renewal cliff (retention factor × tone/concession bumps BEFORE
   *  the existing single draw — zero new rolls; economy/negotiate.ts) and
   *  at the invoice calendar (concession discounts the billing base at
   *  the override-chain head — the grandfather lock still WINS,
   *  ADR-0014 #D4). OPTIONAL, digest-switch law: `pipeline/digest.ts`
   *  absorbs it ONLY when present, so every pre-negotiate state — all
   *  shipped goldens — digests byte-identically. */
  readonly negotiate?: NegotiateBook;
  /** ADR-0015 session-6 embed — the isolate-node (Isolate) book
   *  `isolate-node` writes (see `IsolateBook`): a half-open fence window
   *  `[effective, release)` per node, last-write-wins. The player-authored
   *  SIBLING of the engine's automatic recovery clamp: while a node is
   *  fenced the step-5 serve input offers it ZERO new admissions — free
   *  arms answer nothing to arrivals — while in-flight and queued work
   *  completes or bounces under the existing patience law (occupied slots
   *  are never evicted, the queue is never truncated, the roster is never
   *  written). The as-of law lives ONCE in `pipeline/isolation.ts`
   *  (`nodeIsolated`/`isolatedNodeIds`); the consumption gate lives in
   *  `pipeline/defaults.ts` `defaultServeStep` §(c); the driver threads
   *  the fence set as a presence-only `ServeInExt.isolationFence` —
   *  absent book ⇒ zero calls ⇒ every shipped golden byte-identical
   *  (digest-switch law: `pipeline/digest.ts` absorbs it ONLY when
   *  present). */
  readonly isolate?: IsolateBook;
  /** ADR-0016 successor-program embed — the throttle-node (Throttle) book
   *  `throttle-node` writes (see `ThrottleBook`): a half-open cut window
   *  `[effective, release)` per node, last-write-wins, cut ∈ [0, roster).
   *  The player-authored PARTIAL sibling of both the engine's automatic
   *  recovery clamp AND the isolate fence (total case): while a cut is in
   *  force the step-5 serve input discounts the node's ADMISSION ceiling by
   *  `cutSlots` — capacity-as-clamp at `defaultServeStep` §(c) — while the
   *  roster is never written, in-flight and queued work completes or bounces
   *  under the existing patience law, and over-cap nodes admit nothing until
   *  work walks off (never-evict honored; materialized shrink REJECTED — it
   *  poisons recovery's `fullSlots` capture, making the cut permanent
   *  through a restoration window). The as-of law lives ONCE in
   *  `pipeline/throttle.ts` (`nodeThrottleCut`/`throttleCuts`); the driver
   *  threads the cut map as a presence-only `ServeInExt.throttleCuts` —
   *  absent/idle book ⇒ zero calls ⇒ every shipped golden byte-identical
   *  (digest-switch law: `pipeline/digest.ts` absorbs it ONLY when
   *  present). */
  readonly throttle?: ThrottleBook;
}
