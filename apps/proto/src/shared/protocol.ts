/**
 * `proto` ↔ worker message protocol — the observed-layer seam (MASTER_REPORT
 * §3.1 law 3: "the ObservedCell shape is the binding contract… same cell shape
 * flows worker→main→Pixi adapter, server→relay→remote seats").
 *
 * Boundary law ("Parse, Don't Validate", CONVENTIONS §4): the WIRE form is
 * JSON-safe — every bigint crosses as a decimal string so the identical schema
 * survives a future Workerman→relay hop, even though same-browser structured
 * clone could carry bigint directly. `decodeProjection` is the ONE place
 * strings become bigint again; everything downstream trusts parsed types.
 *
 * The projection carries ONLY observed-layer material: LaneStats aggregates +
 * ObservedCells + event notices + counters. Per-request units never cross this
 * boundary (§4.7: "motes are cosmetic interpolants of throughput statistics,
 * generated locally from (rate, latency-distribution, class-mix, health)").
 */
import {
  asEntityId,
  asMetricId,
  asMoney,
  asRuleId,
  PLAYER_VERBS,
  type ClockKind,
  type ClockState,
  type Comparator,
  type DelegationBand,
  type EntityId,
  type Fixed,
  type LaneStats,
  type MetricUnit,
  type MoneyUnit,
  type ObservedCell,
  type ObservedKey,
  type OneTwoThree,
  type PlayerIntent,
  type PlayerVerbArgs,
  type PolicyAction,
  type PolicyActionId,
  type PolicyCard,
  type PolicyEscalation,
  type PolicyThreshold,
  type Predicate,
  type RuleId,
  type ScopeSelector,
  type SimMinute,
  type SimTick,
  type SimTimeUs,
  type SustainedWindow,
} from "@hh/sim-core";

/* ═══════════════════════════ Errors ═══════════════════════════ */

/** Every codec failure names its exact field path — silent half-states are
 *  worse than a crash (Law 4, fail loud). */
export class ProtocolError extends Error {
  constructor(path: string, expected: string, received: unknown) {
    super(`protocol violation at ${path}: expected ${expected}, got ${describe(received)}`);
    this.name = "ProtocolError";
  }
}

function describe(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return `${typeof value} ${String(value).slice(0, 40)}`;
}

/* ═══════════════════════════ Wire scalars ═══════════════════════════ */

/** Decimal-string integer microseconds (`SimTimeUs` / `MoneyUnit` on the wire). */
export type WireUs = string;
/** Decimal-string Q16.16 raw units (`Fixed` on the wire). */
export type WireFixed = string;

const INT_RE = /^-?\d+$/;

function parseUs(path: string, raw: unknown): SimTimeUs {
  if (typeof raw !== "string" || !INT_RE.test(raw)) {
    throw new ProtocolError(path, "integer-microsecond string", raw);
  }
  const parsed = BigInt(raw);
  if (parsed < 0n) throw new ProtocolError(path, "non-negative µs", raw);
  return parsed;
}

function parseFixed(path: string, raw: unknown): Fixed {
  if (typeof raw !== "string" || !INT_RE.test(raw)) {
    throw new ProtocolError(path, "Q16.16 raw string", raw);
  }
  return BigInt(raw);
}

/** How to interpret an ObservedCell payload — self-describing so the boundary
 *  parse never guesses (R-66 "nothing, not zero" survives the hop). */
export type CellEncoding = "fixed" | "int" | "text";

/* ═══════════════════════════ Trust-internal projection ═══════════════════════ */

export type CellValue = Fixed | number | string;

/** A fully parsed ObservedCell: `value === null` means NO DATA (≠ 0). */
export type ProtoCell = ObservedCell<CellValue>;

export type NoticeKind =
  | "arrival-surge"
  | "bounce"
  | "false-positive"
  | "landed"
  | "rule-fired"
  /** Intent-door receipts (contract #10): one per fed external intent, the
   *  verdict roll-up the host HUD ticks. `detail` carries "<verb>" (or,
   *  since E2b, "<verb>: <handler-detail>" when the handler booked one —
   *  adjust-price names target+price) on an execution and
   *  "<verb>: <reason>" on a refusal. */
  | "intent-executed"
  | "intent-refused"
  /** Runner money-lane roll-up (REST-PROTO-FINAL): one notice per
   *  EconomyNotice out of `runEconomyTick`, so the 25-kind economy vocabulary
   *  does NOT bloat this union — `detail` carries `<economyKind>:<contractId>`
   *  and consumers who care split on the first colon. laneId is always null
   *  (money is company-wide, not per-lane). */
  | "economy-notice";

const NOTICE_KINDS: readonly NoticeKind[] = [
  "arrival-surge",
  "bounce",
  "false-positive",
  "landed",
  "rule-fired",
  "intent-executed",
  "intent-refused",
  "economy-notice",
];

/** One FX-worthy moment, aggregate-level only (no unit ids cross the seam). */
export interface EventNotice {
  readonly kind: NoticeKind;
  readonly laneId: EntityId | null;
  readonly atUs: SimTimeUs;
  /** Optional plain-text rider (door receipts). Absent = nothing to render;
   *  omitted from the WIRE when unset, so pre-door frames encode byte-identically. */
  readonly detail?: string;
  /** Engine attribution for money-lane riders (E2b additive seam): the
   *  EconomyNotice's own causeId (e.g. `economy:death:dissolved:churn-collapse:5760`),
   *  so chrome narrators (LossCard) can name the real mechanism without
   *  parsing it out of a two-segment detail. Optional: pre-E2b producers set
   *  nothing, the wire OMITS the key when unset, and decode tolerates both —
   *  legacy frames round-trip exactly as before (PROTOCOL_VERSION stays 1). */
  readonly causeId?: string;
}

/** Attention-pool roll-up on the wire (E2b additive seam, §7.5/OD-6(a)): the
 *  OBSERVABLE aggregates of `GameState.attention` — capacity, unrepaid debt,
 *  the monotonic window ordinal, and the ledger row count. Deliberately
 *  plain numbers (JSON-safe, zero bigints): the individual HandTokens stay
 *  engine-side, only what a HUD can show crosses. Present ONLY when the host
 *  minted the pool (the runner's `options.attention`); absent ⇒ key omitted
 *  on the wire ⇒ legacy frames byte-identical. */
export interface AttentionSummary {
  readonly capacity: number;
  readonly debt: number;
  readonly window: number;
  readonly loanCount: number;
}

/** The G1 outcome counters (three terminals + false-positive ticker). */
export interface OutcomeCounters {
  readonly served: number;
  readonly bounced: number;
  readonly blockedFalsePositive: number;
  readonly landed: number;
}

/** Parsed, trusted projection consumed by renderer + chrome. */
export interface SimProjection {
  readonly seq: number;
  readonly tick: SimTick;
  readonly minute: SimMinute;
  readonly clocks: ClockState;
  readonly lanes: readonly LaneStats[];
  readonly observed: ReadonlyMap<ObservedKey, ProtoCell>;
  readonly notices: readonly EventNotice[];
  readonly counters: OutcomeCounters;
  /** Free bucket only at P0 (full six-bucket stack arrives with G5). Signed
   *  integer µ$ — same MoneyUnit discipline as sim-core. */
  readonly freeCashMicroUsd: bigint;
  /** Attention readback (E2b): the loan-pool roll-up when the runner planted
   *  the special hand; undefined on every default run (never-minted law). */
  readonly attention?: AttentionSummary;
}

/* ═══════════════════════════ Wire forms ═══════════════════════════ */

export interface ObservedCellWire {
  readonly key: string;
  readonly encoding: CellEncoding;
  readonly value: number | string | null;
  readonly fidelity: number;
  readonly freshnessUs: WireUs;
  readonly coverage: WireFixed;
  readonly certainty: WireFixed;
  readonly status: "live" | "stale" | "unknown";
}

export interface LaneWire {
  readonly laneId: string;
  readonly ratePerMin: WireFixed;
  readonly latencyDistributionRef: string;
  readonly classMix: Readonly<Record<string, WireFixed>>;
  readonly health: WireFixed;
}

export interface ClocksWire {
  readonly realUs: WireUs;
  readonly simUs: WireUs;
  readonly businessUs: WireUs;
  readonly wallUs: WireUs;
}

export interface EventNoticeWire {
  readonly kind: NoticeKind;
  readonly laneId: string | null;
  readonly atUs: WireUs;
  readonly detail?: string;
  readonly causeId?: string;
}

export interface ProjectionWire {
  readonly protocol: typeof PROTOCOL_VERSION;
  readonly seq: number;
  readonly tick: WireUs;
  readonly minute: number;
  readonly clocks: ClocksWire;
  readonly lanes: readonly LaneWire[];
  readonly observed: readonly ObservedCellWire[];
  readonly notices: readonly EventNoticeWire[];
  readonly counters: OutcomeCounters;
  readonly freeCashMicroUsd: WireUs;
  /** Attention roll-up — structurally identical to the trusted form (all
   *  plain numbers), so no separate wire type is invented. Omitted when the
   *  runner never minted the pool. */
  readonly attention?: AttentionSummary;
  /** Renderer heartbeat frequency (§4.7 item 1.2: global ~0.5 Hz sync). */
  readonly heartbeatHz: number;
}

export const PROTOCOL_VERSION = 1 as const;
export const HEARTBEAT_HZ_WIRE = 0.5 as const;

/* ═══════════════════════════ Direction: main → worker ═══════════════════════ */

/** Mirror of sim-core `IntentPayload` with wire scalars (parsed at the seam). */
export type WireIntentPayload =
  | { readonly kind: "verb"; readonly verb: string; readonly target: string | null; readonly value: WireFixed | null }
  | { readonly kind: "slider"; readonly control: string; readonly value: WireFixed }
  /** Door-executed arm (contract #10): `args` is the flat PlayerVerbArgs
   *  record — ids/strings/numbers/null ONLY, never embedded structure, so a
   *  JSON hop cannot smuggle objects into the sim. Per-verb field semantics
   *  are the door's boundary problem (IntentDoorError), not this codec's. */
  | { readonly kind: "player-verb"; readonly args: Readonly<Record<string, string | number | null>> };

export type RunnerKindWire = "mock" | "sim-core";
const RUNNER_KINDS: readonly RunnerKindWire[] = ["mock", "sim-core"];

/** Worker-loop corpus citation (WORKER-CORPUS leg of the §1.5 seam — the
 *  wire half of @007a15d's runner leg). Additive protocol-v1 law, exact
 *  precedent of notice.causeId / attention (@0b35b15): the key is OPTIONAL,
 *  absent ⇒ legacy boot byte-ident, present-but-malformed ⇒ ProtocolError.
 *  The tableId is the shipped slice identity — the slice JSON's own `type`
 *  minus the `official:` prefix — and a drift-pin test (simWorker.corpus.
 *  test.ts) re-derives the closed list from packages/content/waves/ on disk
 *  (era-census precedent), so a new hosting type cannot join the wire by
 *  silence. Structural shape only: ≥1 / strictly-ascending wave numbers are
 *  the runner's domain wall (mintCorpusDrive), reached through the worker's
 *  boot-fault channel — the codec never re-invents a deeper law. */
export const CORPUS_WIRE_TABLE_IDS = Object.freeze([
  "shared-web",
  "game-servers",
  "mail-hosting",
  "dns-hosting",
  "dedicated",
  "object-storage",
  "trunk-group-voip",
  "serverless",
  "exchange-colo",
  "colo",
  "backup-archival",
  "dbaas",
  "observability",
  "ci-build-farm",
] as const);

export type CorpusTableId = (typeof CORPUS_WIRE_TABLE_IDS)[number];

/** Cited slice + the shipped wave numbers to schedule through the seam. */
export interface BootCorpusWire {
  readonly tableId: CorpusTableId;
  readonly waves: readonly number[];
}

/** D7 build-state rider (ADR-0014 #D7) — the boot may seed the intent door's
 *  two ground-truth embeds. Exact `boot.corpus` precedent (@1165368):
 *  additive-optional under PROTOCOL_VERSION 1, absent ⇒ the legacy wire is
 *  byte-ident (key never posted, never parsed), present-but-malformed ⇒
 *  ProtocolError. SHAPE wall only lives here; the SEMANTIC walls (duplicate
 *  edge ids, endpoints off the runner's node roster, sub-one hand rail) are
 *  the runner's construction domain and fault the boot through the shared
 *  try/catch (lastRunner witness pattern), never crash.
 *
 *  The JSON mirrors what `createInitialState({hands, board})` already
 *  consumes — sim-core `BoardEdgeRecord`/`HandState` (types.ts:1530/1566) —
 *  no invented schema: `hands` is the door rail capacity (the runner's
 *  `mintHandState` seed, §7.5); `board` is the structural edge list, each
 *  edge `{relation, from, to, slot?}` with the door's OWN connect-verb socket
 *  law (power carries a socket name, every other relation forbids one), and
 *  an OPTIONAL `id` — when absent the runner derives the engine's private
 *  `defaultEdgeId` convention (`edge:<relation>:<from>-><to>` plus `:<slot>`
 *  for power, intent-door.ts:716), so a seeded edge and a connect-verb mint
 *  collide on the SAME id by construction (the edge-exists liveness witness). */
export const BOARD_RELATION_WIRE_IDS = Object.freeze(["data", "power", "control", "trust"] as const);

export type BoardRelationWire = (typeof BOARD_RELATION_WIRE_IDS)[number];

/** One structural edge of the seeded board (door BoardEdgeRecord on the wire). */
export interface BootBoardEdgeWire {
  readonly relation: BoardRelationWire;
  readonly from: string;
  readonly to: string;
  /** Socket name — REQUIRED for power, FORBIDDEN otherwise (door law).
   *  Producers may omit it; the parser ALWAYS emits `slot: string | null`
   *  on the trusted record (absent ⇒ null), so downstream never guesses. */
  readonly slot?: string | null;
  /** Explicit edge id; absent ⇒ the runner derives the defaultEdgeId form. */
  readonly id?: string;
}

/** Optional opening build state: the hands rail + the structural board edges. */
export interface BootBuildWire {
  readonly hands?: number;
  readonly board?: readonly BootBoardEdgeWire[];
}

/* ───────────────────── boot.rules rider (ADR-0019 program 5 follow-on) ─────────────
 * The wave-25 runner leg (@9748ee4) armed the Book behind a plain runner
 * option and explicitly left the wire for a later additive rider — this is
 * that rider. A boot may now carry THE POLICY BOOK itself: every entry is
 * the host's own lookup hash paired with the full PolicyCard document, so
 * `createRunner` can hand the door the same `lookupPolicyCard` seam the
 * gates and the direct-runner tests ride, across any worker hop.
 *
 * Why the CARD crosses (and not just hashes — the lane's Option-B probe):
 * PolicyCards are app-side authored data. packages/content carries ZERO
 * card documents (upkeepMicroUsd greps empty across the corpus; the loader
 * parses ruleset CARDS, not policy cards), and g7Deck lives gates/g7 — the
 * worker graph cannot reach any book by itself. A hash-only boot would
 * require cards already reachable; they are not, so Option B degenerates
 * into Option A. The hash rides as an OPAQUE KEY because the fingerprint
 * grammar is host-owned (g7Deck's `g7-card|…` summary vs the mainline
 * deck's `l-g7m-card|…` — the door treats it as a lookup string, never a
 * claim, types.ts `PolicyCardCommitArgs`); the worker must not re-derive
 * what the committing player already knows, and protocol.ts must not gain
 * a digest dependency to try.
 *
 * Wire law = `boot.corpus`/`boot.build` precedent (@1165368 / @921ca7b):
 * PROTOCOL_VERSION stays 1, the rider is additive-optional, absent ⇒ the
 * key is never posted, never parsed, never present (legacy boots byte-
 * identical); present-but-malformed SHAPE ⇒ ProtocolError with the exact
 * field path; unknown keys inside the records are ignored (envelope
 * tolerance). The bigints (threshold amounts, action values, sustained
 * duration, upkeep) follow the house decimal-string law — `WireFixed`/
 * `WireUs` — and revive HERE, at the boundary, exactly where
 * `wireIntentToPlayerIntent` revives verb args (E2b), so the runner and
 * the engine only ever see real `PolicyCard` values. SHAPE walls live here
 * (closed vocabularies, the OneTwoThree 1..3 arity, key-set uniqueness);
 * the §2.2 GRAMMAR wall is the engine's — the policy evaluator re-runs
 * `validatePolicyCard` over the whole book on every rule fold, so a lie in
 * a card faults the sim, never the codec (the "codec never re-invents a
 * deeper law" sentence from parseBootCorpus, verbatim doctrine). */

/** Closed wire vocabularies mirroring the sim-core grammar unions (types.ts
 *  §B 2.2). Drift-pinned against the engine source by
 *  `__tests__/simWorker.rules.test.ts` — the BIGINT_ARG_FIELDS law: a member
 *  joining an engine union without joining its table reddens there first. */
export const POLICY_COMPARATOR_WIRE_IDS = Object.freeze([">", "<", "changed", "fails", "completes"] as const);
export const METRIC_UNIT_WIRE_IDS = Object.freeze([
  "percent", "us", "ms", "count", "micro-usd", "ratio", "minutes",
] as const);
export const POLICY_ACTION_ID_WIRE_IDS = Object.freeze([
  "scale-out", "shed-class", "page", "open-ticket", "dispatch-remote-hands",
  "raise-inspection-depth", "failover", "run-runbook", "drain", "queue-change",
] as const);
export const POLICY_SCOPE_KIND_WIRE_IDS = Object.freeze([
  "object", "role", "query", "class", "estate",
] as const);
export const POLICY_BAND_WIRE_IDS = Object.freeze(["inform", "consult", "execute"] as const);
export const POLICY_ESCALATION_TARGET_WIRE_IDS = Object.freeze(["band", "role", "runbook"] as const);
export const POLICY_THRESHOLD_KIND_WIRE_IDS = Object.freeze(["value", "class-ref", "event-name"] as const);
/** Compile-time direction only (no runtime cost): each table stays a subset
 *  of its engine union; the ADD direction is the source-grep drift pin's. */
const _policyVocabDrift: readonly [
  readonly Comparator[], readonly MetricUnit[], readonly PolicyActionId[],
  readonly ScopeSelector["kind"][], readonly DelegationBand[], readonly PolicyEscalation["to"][],
] = [POLICY_COMPARATOR_WIRE_IDS, METRIC_UNIT_WIRE_IDS, POLICY_ACTION_ID_WIRE_IDS, POLICY_SCOPE_KIND_WIRE_IDS, POLICY_BAND_WIRE_IDS, POLICY_ESCALATION_TARGET_WIRE_IDS];
void _policyVocabDrift;

/** JSON-safe form of `PolicyThreshold` (the value arm carries WireFixed). */
export type PolicyThresholdWire =
  | { readonly kind: "value"; readonly amount: WireFixed; readonly unit: MetricUnit }
  | { readonly kind: "class-ref"; readonly classId: string }
  | { readonly kind: "event-name"; readonly name: string };

export interface PolicyPredicateWire {
  readonly metric: string;
  readonly comparator: Comparator;
  readonly threshold: PolicyThresholdWire;
}

export interface PolicyActionWire {
  readonly id: PolicyActionId;
  readonly runbookName: string | null;
  /** Decimal-string Fixed, or null (the verbs that take no parameter). */
  readonly value: WireFixed | null;
}

/** JSON-safe form of sim-core `PolicyCard` — field-for-field, bigints as
 *  decimal strings. Optional arms (`for`/`unless`/`else`) follow the
 *  omit-when-unset law on BOTH sides of the seam. */
export interface PolicyCardWire {
  readonly id: string;
  readonly scope: { readonly kind: ScopeSelector["kind"]; readonly ref: string | null };
  readonly when: readonly PolicyPredicateWire[];
  readonly for?: { readonly durationUs: WireUs };
  readonly then: readonly PolicyActionWire[];
  readonly unless?: readonly PolicyPredicateWire[];
  readonly else?: { readonly to: PolicyEscalation["to"]; readonly ref: string };
  readonly band: DelegationBand;
  readonly upkeepMicroUsd: WireUs;
}

/** One book entry: the host's opaque lookup hash + the card it resolves to. */
export interface BootRuleEntryWire {
  readonly hash: string;
  readonly card: PolicyCardWire;
}

export interface BootRulesWire {
  readonly entries: readonly BootRuleEntryWire[];
}

/** TRUSTED forms — what `assertToWorker` hands the hosts (bigints revived,
 *  records deep-frozen). `BootRules` doubles as `SimClient.boot`'s input
 *  type: producers hand real PolicyCards (g7Deck exports them branded) and
 *  `encodeBootRules` stringifies at the send boundary, the sendPlayerVerb
 *  bigint law (E2b) in boot clothing. */
export interface BootRuleEntry {
  readonly hash: string;
  readonly card: PolicyCard;
}

export interface BootRules {
  readonly entries: readonly BootRuleEntry[];
}

export type ToWorker =
  | { readonly kind: "boot"; readonly protocol: typeof PROTOCOL_VERSION; readonly seed: string; readonly speedX: SpeedX; readonly runnerKind: RunnerKindWire; readonly corpus?: BootCorpusWire; readonly build?: BootBuildWire; readonly rules?: BootRules }
  | { readonly kind: "intent"; readonly protocol: typeof PROTOCOL_VERSION; readonly seq: number; readonly clock: ClockKind; readonly atUs: WireUs; readonly origin: "player" | "rule"; readonly payload: WireIntentPayload }
  | { readonly kind: "speed"; readonly protocol: typeof PROTOCOL_VERSION; readonly speedX: SpeedX }
  | { readonly kind: "halt"; readonly protocol: typeof PROTOCOL_VERSION };

export type SpeedX = 1 | 2 | 4;
const SPEEDS: readonly SpeedX[] = [1, 2, 4];

/* ═══════════════════════════ Direction: worker → main ═══════════════════════ */

export type FromWorker =
  | { readonly kind: "ready"; readonly protocol: typeof PROTOCOL_VERSION; readonly engineVersion: string; readonly runnerId: "mock" | "sim-core" }
  | { readonly kind: "projection"; readonly protocol: typeof PROTOCOL_VERSION; readonly projection: ProjectionWire }
  | { readonly kind: "fault"; readonly protocol: typeof PROTOCOL_VERSION; readonly message: string };

/* ═══════════════════════════ Guards ═══════════════════════════ */

function isRecord(path: string, value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ProtocolError(path, "object", value);
  }
  return value as Record<string, unknown>;
}

function parseNumber(path: string, raw: unknown): number {
  if (typeof raw !== "number" || !Number.isFinite(raw)) {
    throw new ProtocolError(path, "finite number", raw);
  }
  return raw;
}

function parseString(path: string, raw: unknown): string {
  if (typeof raw !== "string") throw new ProtocolError(path, "string", raw);
  return raw;
}

function parseLiteral<T extends string | number>(path: string, raw: unknown, allowed: readonly T[]): T {
  for (const candidate of allowed) {
    if (raw === candidate) return candidate;
  }
  throw new ProtocolError(path, `one of ${allowed.join("|")}`, raw);
}

/** Validated µs/integer string kept in its WIRE form (the worker side re-parses
 *  to bigint when building sim-core types — strings survive structuredClone). */
function parseWireUsString(path: string, raw: unknown): string {
  return parseUs(path, raw).toString();
}

/** Parse the optional boot.corpus rider (WORKER-CORPUS leg): closed tableId
 *  enum + an array of integer wave numbers. Unknown keys inside the record are
 *  ignored — the same tolerance the envelope parser shows every producer
 *  (extras are the codec's blind spot BY PRECEDENT, half-values are not). */
function parseBootCorpus(raw: unknown): BootCorpusWire {
  const rec = isRecord("boot.corpus", raw);
  const tableId = parseLiteral("boot.corpus.tableId", rec["tableId"], CORPUS_WIRE_TABLE_IDS);
  const wavesRaw = rec["waves"];
  if (!Array.isArray(wavesRaw)) {
    throw new ProtocolError("boot.corpus.waves", "array of shipped wave numbers", wavesRaw);
  }
  const waves: number[] = [];
  wavesRaw.forEach((entry, index) => {
    const path = `boot.corpus.waves[${index}]`;
    if (typeof entry !== "number" || !Number.isInteger(entry)) {
      throw new ProtocolError(path, "integer wave number", entry);
    }
    waves.push(entry);
  });
  return { tableId, waves: Object.freeze(waves) };
}

function parseNonEmptyString(path: string, raw: unknown): string {
  const value = parseString(path, raw);
  if (value.length === 0) throw new ProtocolError(path, "non-empty string", raw);
  return value;
}

/** Parse the optional boot.build rider (ADR-0014 #D7): hands integer + board
 *  edge records with the door's socket law. Unknown keys inside the record are
 *  ignored — the exact envelope tolerance `parseBootCorpus` documents (extras
 *  are the codec's blind spot BY PRECEDENT, half-values are not). */
function parseBootBuild(raw: unknown): BootBuildWire {
  const rec = isRecord("boot.build", raw);
  const handsRaw = rec["hands"];
  let hands: number | undefined;
  if (handsRaw !== undefined) {
    if (typeof handsRaw !== "number" || !Number.isInteger(handsRaw) || handsRaw < 0) {
      throw new ProtocolError("boot.build.hands", "non-negative integer hand count", handsRaw);
    }
    hands = handsRaw;
  }
  const boardRaw = rec["board"];
  let board: readonly BootBoardEdgeWire[] | undefined;
  if (boardRaw !== undefined) {
    if (!Array.isArray(boardRaw)) {
      throw new ProtocolError("boot.build.board", "array of edge records", boardRaw);
    }
    board = Object.freeze(boardRaw.map(parseBootBoardEdge));
  }
  const build: { hands?: number; board?: readonly BootBoardEdgeWire[] } = {};
  if (hands !== undefined) build.hands = hands;
  if (board !== undefined) build.board = board;
  return Object.freeze(build);
}

function parseBootBoardEdge(raw: unknown, index: number): BootBoardEdgeWire {
  const path = `boot.build.board[${index}]`;
  const rec = isRecord(path, raw);
  const relation = parseLiteral(`${path}.relation`, rec["relation"], BOARD_RELATION_WIRE_IDS);
  const from = parseNonEmptyString(`${path}.from`, rec["from"]);
  const to = parseNonEmptyString(`${path}.to`, rec["to"]);
  const slotRaw = rec["slot"];
  let slot: string | null;
  if (slotRaw === undefined || slotRaw === null) {
    slot = null;
  } else if (typeof slotRaw === "string" && slotRaw.length > 0) {
    slot = slotRaw;
  } else {
    throw new ProtocolError(`${path}.slot`, "null, absent, or non-empty socket name", slotRaw);
  }
  // The door's own connect-verb socket law, applied to pre-seeded records:
  // a power edge without a socket or a data edge carrying one is a lying
  // record — refuse at the boundary, never smuggle it into the ground map.
  if (relation === "power" && slot === null) {
    throw new ProtocolError(`${path}.slot`, "power edges carry a socket name (door law)", slotRaw);
  }
  if (relation !== "power" && slot !== null) {
    throw new ProtocolError(`${path}.slot`, `slot only for power edges (door law), got "${slot}"`, slotRaw);
  }
  const idRaw = rec["id"];
  if (idRaw !== undefined && typeof idRaw !== "string") {
    throw new ProtocolError(`${path}.id`, "string edge id or absent", idRaw);
  }
  return Object.freeze({
    relation,
    from,
    to,
    slot,
    ...(idRaw === undefined ? {} : { id: parseNonEmptyString(`${path}.id`, idRaw) }),
  });
}

/* ───────────────────── boot.rules parse + encode + book builder ───────────────────── */

/** Signed decimal-string integer → bigint (the Fixed/Money carrier; unlike
 *  parseUs there is NO non-negativity wall — threshold amounts are plain
 *  Q16.16 Fixed and may be authored negative by grammar, not by the wire). */
function parseWireInt(path: string, raw: unknown): bigint {
  if (typeof raw !== "string" || !INT_RE.test(raw)) {
    throw new ProtocolError(path, "decimal-string integer (wire bigint law)", raw);
  }
  return BigInt(raw);
}

function parseStringOrNull(path: string, raw: unknown): string | null {
  if (raw === null) return null;
  return parseString(path, raw);
}

/** The OneTwoThree arity wall (§B 2.3.5 "one rule = one story"): the codec
 *  proves 1..3 so the TRUSTED type never lies; ordering is data, untouched. */
function parseOneTwoThree<T>(path: string, what: string, raw: unknown, parse: (p: string, r: unknown) => T): OneTwoThree<T> {
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > 3) {
    throw new ProtocolError(path, `1..3 ${what}`, raw);
  }
  const list: T[] = [];
  raw.forEach((entry, index) => list.push(parse(`${path}[${index}]`, entry)));
  if (list.length === 1) return Object.freeze([list[0]]) as OneTwoThree<T>;
  if (list.length === 2) return Object.freeze([list[0]!, list[1]!]) as OneTwoThree<T>;
  return Object.freeze([list[0]!, list[1]!, list[2]!]) as OneTwoThree<T>;
}

function parsePolicyThreshold(path: string, raw: unknown): PolicyThreshold {
  const rec = isRecord(path, raw);
  const kind = parseLiteral(`${path}.kind`, rec["kind"], POLICY_THRESHOLD_KIND_WIRE_IDS);
  if (kind === "value") {
    return Object.freeze({
      kind,
      amount: parseWireInt(`${path}.amount`, rec["amount"]),
      unit: parseLiteral(`${path}.unit`, rec["unit"], METRIC_UNIT_WIRE_IDS),
    });
  }
  if (kind === "class-ref") {
    return Object.freeze({ kind, classId: parseString(`${path}.classId`, rec["classId"]) });
  }
  return Object.freeze({ kind, name: parseString(`${path}.name`, rec["name"]) });
}

function parsePolicyPredicate(path: string, raw: unknown): Predicate {
  const rec = isRecord(path, raw);
  return Object.freeze({
    metric: asMetricId(parseNonEmptyString(`${path}.metric`, rec["metric"])),
    comparator: parseLiteral(`${path}.comparator`, rec["comparator"], POLICY_COMPARATOR_WIRE_IDS),
    threshold: parsePolicyThreshold(`${path}.threshold`, rec["threshold"]),
  });
}

function parsePolicyAction(path: string, raw: unknown): PolicyAction {
  const rec = isRecord(path, raw);
  const valueRaw = rec["value"];
  return Object.freeze({
    id: parseLiteral(`${path}.id`, rec["id"], POLICY_ACTION_ID_WIRE_IDS),
    runbookName: parseStringOrNull(`${path}.runbookName`, rec["runbookName"]),
    value: valueRaw === null ? null : parseWireInt(`${path}.value`, valueRaw),
  });
}

/** Full-shape boundary parse → trusted `PolicyCard`. Field-for-field mirror
 *  of types.ts:766; the closed vocabularies above are the ONLY walls here —
 *  grammar legality (metric-vs-comparator pairings, runbookName discipline)
 *  is the evaluator's fold-time wall, never duplicated at the seam. */
function parsePolicyCard(path: string, raw: unknown): PolicyCard {
  const rec = isRecord(path, raw);
  const scopeRec = isRecord(`${path}.scope`, rec["scope"]);
  const card: {
    id: RuleId;
    scope: ScopeSelector;
    when: OneTwoThree<Predicate>;
    for?: SustainedWindow;
    then: OneTwoThree<PolicyAction>;
    unless?: OneTwoThree<Predicate>;
    else?: PolicyEscalation;
    band: DelegationBand;
    upkeepMicroUsd: MoneyUnit;
  } = {
    id: asRuleId(parseNonEmptyString(`${path}.id`, rec["id"])),
    scope: Object.freeze({
      kind: parseLiteral(`${path}.scope.kind`, scopeRec["kind"], POLICY_SCOPE_KIND_WIRE_IDS),
      // "null for `estate`" (ScopeSelector docblock) is a grammar question;
      // the wire form is string-or-null and this codec does not read meaning.
      ref: parseStringOrNull(`${path}.scope.ref`, scopeRec["ref"]),
    }),
    when: parseOneTwoThree(`${path}.when`, "predicates", rec["when"], parsePolicyPredicate),
    then: parseOneTwoThree(`${path}.then`, "actions", rec["then"], parsePolicyAction),
    band: parseLiteral(`${path}.band`, rec["band"], POLICY_BAND_WIRE_IDS),
    upkeepMicroUsd: asMoney(parseWireInt(`${path}.upkeepMicroUsd`, rec["upkeepMicroUsd"])),
  };
  const forRaw = rec["for"];
  if (forRaw !== undefined) {
    const forRec = isRecord(`${path}.for`, forRaw);
    card.for = Object.freeze({ durationUs: parseUs(`${path}.for.durationUs`, forRec["durationUs"]) });
  }
  const unlessRaw = rec["unless"];
  if (unlessRaw !== undefined) {
    card.unless = parseOneTwoThree(`${path}.unless`, "predicates", unlessRaw, parsePolicyPredicate);
  }
  const elseRaw = rec["else"];
  if (elseRaw !== undefined) {
    const elseRec = isRecord(`${path}.else`, elseRaw);
    // Discriminated-union arms need the literal narrowed by the parseLiteral
    // result type — the freeze widens, so the boundary cast is the honest shape.
    card.else = Object.freeze({
      to: parseLiteral(`${path}.else.to`, elseRec["to"], POLICY_ESCALATION_TARGET_WIRE_IDS),
      ref: parseNonEmptyString(`${path}.else.ref`, elseRec["ref"]),
    }) as PolicyEscalation;
  }
  return Object.freeze(card);
}

/** Parse the optional boot.rules rider (ADR-0019 program 5 follow-on): the
 *  book is a SET of {host hash → trusted card} entries. Duplicate hashes are
 *  a literal wire-field collision (unlike boot.build's DERIVED edge ids) —
 *  refused right here, naming both positions, so no second entry can shadow
 *  the first into a silent overwrite. Unknown keys inside the records are
 *  ignored: the envelope tolerance parseBootCorpus documents. */
function parseBootRules(raw: unknown): BootRules {
  const rec = isRecord("boot.rules", raw);
  const entriesRaw = rec["entries"];
  if (!Array.isArray(entriesRaw)) {
    throw new ProtocolError("boot.rules.entries", "array of {hash, card} book entries", entriesRaw);
  }
  const seen = new Map<string, number>();
  const entries: BootRuleEntry[] = [];
  entriesRaw.forEach((entry, index) => {
    const path = `boot.rules.entries[${index}]`;
    const entryRec = isRecord(path, entry);
    const hash = parseNonEmptyString(`${path}.hash`, entryRec["hash"]);
    const first = seen.get(hash);
    if (first !== undefined) {
      throw new ProtocolError(`${path}.hash`, `unique card hash (book is a set; duplicates entries[${first}])`, hash);
    }
    seen.set(hash, index);
    entries.push(Object.freeze({ hash, card: parsePolicyCard(`${path}.card`, entryRec["card"]) }));
  });
  return Object.freeze({ entries: Object.freeze(entries) });
}

function encodePolicyThreshold(threshold: PolicyThreshold): PolicyThresholdWire {
  if (threshold.kind === "value") {
    return { kind: "value", amount: threshold.amount.toString(), unit: threshold.unit };
  }
  return threshold; // the class-ref / event-name arms are already JSON-safe
}

function encodePolicyPredicate(predicate: Predicate): PolicyPredicateWire {
  return { metric: predicate.metric, comparator: predicate.comparator, threshold: encodePolicyThreshold(predicate.threshold) };
}

function encodePolicyAction(action: PolicyAction): PolicyActionWire {
  return {
    id: action.id,
    runbookName: action.runbookName,
    value: action.value === null ? null : action.value.toString(),
  };
}

/** Trusted PolicyCard → JSON-safe wire form (exported: the send-boundary
 *  half of the E2b bigint law — real bigints in, decimal strings out). */
export function encodePolicyCard(card: PolicyCard): PolicyCardWire {
  return {
    id: card.id,
    scope: { kind: card.scope.kind, ref: card.scope.ref },
    when: card.when.map(encodePolicyPredicate),
    ...(card.for === undefined ? {} : { for: { durationUs: card.for.durationUs.toString() } }),
    then: card.then.map(encodePolicyAction),
    ...(card.unless === undefined ? {} : { unless: card.unless.map(encodePolicyPredicate) }),
    ...(card.else === undefined ? {} : { else: { to: card.else.to, ref: card.else.ref } }),
    band: card.band,
    upkeepMicroUsd: card.upkeepMicroUsd.toString(),
  };
}

export function encodeBootRules(rules: BootRules): BootRulesWire {
  return {
    entries: rules.entries.map((entry) => ({ hash: entry.hash, card: encodePolicyCard(entry.card) })),
  };
}

/** THE worker-side book materialization: parsed boot.rules → the runner's
 *  `lookupPolicyCard` seam, VERBATIM the shape the door config forwards. One
 *  shared builder for BOTH runner hosts (the `wireIntentToPlayerIntent`
 *  anti-drift law, E2b): the fake and the browser worker cannot disagree on
 *  what a booted book means. Unknown hash → null keeps the ordinary
 *  `unknown-card-hash` refusal the last word (g7Deck's seam law restated). */
export function workerRulesLookup(rules: BootRules): {
  readonly lookupPolicyCard: (cardHash: string) => PolicyCard | null;
} {
  const byHash = new Map<string, PolicyCard>();
  for (const entry of rules.entries) byHash.set(entry.hash, entry.card);
  const book = Object.freeze(byHash);
  return Object.freeze({ lookupPolicyCard: (cardHash: string) => book.get(cardHash) ?? null });
}

/* ═══════════════════════════ Encode (trusted → wire) ═══════════════════════ */

function encodeCell(key: ObservedKey, cell: ProtoCell): ObservedCellWire {
  const encoding: CellEncoding =
    typeof cell.value === "bigint" ? "fixed" : typeof cell.value === "number" ? "int" : "text";
  return {
    key,
    encoding,
    value:
      cell.value === null
        ? null
        : typeof cell.value === "bigint"
          ? cell.value.toString()
          : cell.value,
    fidelity: cell.fidelity,
    freshnessUs: cell.freshnessUs.toString(),
    coverage: cell.coverage.toString(),
    certainty: cell.certainty.toString(),
    status: cell.status,
  };
}

export function encodeProjection(p: SimProjection): ProjectionWire {
  const lanes: LaneWire[] = p.lanes.map((lane) => ({
    laneId: lane.laneId,
    ratePerMin: lane.ratePerMin.toString(),
    latencyDistributionRef: lane.latencyDistributionRef,
    classMix: Object.fromEntries(
      Object.entries(lane.classMix).map(([id, share]) => [id, share.toString()]),
    ),
    health: lane.health.toString(),
  }));
  const observed: ObservedCellWire[] = [];
  for (const [key, cell] of p.observed) observed.push(encodeCell(key, cell));
  return {
    protocol: PROTOCOL_VERSION,
    seq: p.seq,
    tick: p.tick.toString(),
    minute: p.minute,
    clocks: {
      realUs: p.clocks.realUs.toString(),
      simUs: p.clocks.simUs.toString(),
      businessUs: p.clocks.businessUs.toString(),
      wallUs: p.clocks.wallUs.toString(),
    },
    lanes,
    observed,
    notices: p.notices.map((n) => ({
      kind: n.kind,
      laneId: n.laneId,
      atUs: n.atUs.toString(),
      ...(n.detail === undefined ? {} : { detail: n.detail }),
      ...(n.causeId === undefined ? {} : { causeId: n.causeId }),
    })),
    counters: { ...p.counters },
    freeCashMicroUsd: p.freeCashMicroUsd.toString(),
    ...(p.attention === undefined ? {} : { attention: { ...p.attention } }),
    heartbeatHz: HEARTBEAT_HZ_WIRE,
  };
}

/* ═══════════════════════════ Decode (wire → trusted) ═══════════════════════ */

function decodeCell(raw: unknown, index: number): [ObservedKey, ProtoCell] {
  const path = `observed[${index}]`;
  const rec = isRecord(path, raw);
  const key = parseString(`${path}.key`, rec["key"]);
  const encoding = parseLiteral(`${path}.encoding`, rec["encoding"], ["fixed", "int", "text"] as const);
  const valueRaw = rec["value"];
  let value: CellValue | null;
  if (valueRaw === null) {
    value = null;
  } else if (encoding === "fixed") {
    value = parseFixed(`${path}.value`, valueRaw);
  } else if (encoding === "int") {
    value = parseNumber(`${path}.value`, valueRaw);
  } else {
    value = parseString(`${path}.value`, valueRaw);
  }
  const status = parseLiteral(`${path}.status`, rec["status"], ["live", "stale", "unknown"] as const);
  const cell: ProtoCell = {
    value,
    fidelity: parseNumber(`${path}.fidelity`, rec["fidelity"]),
    freshnessUs: parseUs(`${path}.freshnessUs`, rec["freshnessUs"]),
    coverage: parseFixed(`${path}.coverage`, rec["coverage"]),
    certainty: parseFixed(`${path}.certainty`, rec["certainty"]),
    status,
  };
  return [key as ObservedKey, cell];
}

function decodeLane(raw: unknown, index: number): LaneStats {
  const path = `lanes[${index}]`;
  const rec = isRecord(path, raw);
  const classMixRaw = isRecord(`${path}.classMix`, rec["classMix"]);
  const classMix: Record<string, Fixed> = {};
  for (const [id, share] of Object.entries(classMixRaw)) {
    classMix[id] = parseFixed(`${path}.classMix.${id}`, share);
  }
  return {
    laneId: asEntityId(parseString(`${path}.laneId`, rec["laneId"])),
    ratePerMin: parseFixed(`${path}.ratePerMin`, rec["ratePerMin"]),
    latencyDistributionRef: parseString(`${path}.latencyDistributionRef`, rec["latencyDistributionRef"]),
    classMix,
    health: parseFixed(`${path}.health`, rec["health"]),
  };
}

function decodeNotice(raw: unknown, index: number): EventNotice {
  const path = `notices[${index}]`;
  const rec = isRecord(path, raw);
  const laneRaw = rec["laneId"];
  const detailRaw = rec["detail"];
  if (detailRaw !== undefined && typeof detailRaw !== "string") {
    throw new ProtocolError(`${path}.detail`, "string rider or absent", detailRaw);
  }
  const causeRaw = rec["causeId"];
  if (causeRaw !== undefined && typeof causeRaw !== "string") {
    throw new ProtocolError(`${path}.causeId`, "string causeId or absent", causeRaw);
  }
  return {
    kind: parseLiteral(`${path}.kind`, rec["kind"], NOTICE_KINDS),
    laneId: laneRaw === null ? null : asEntityId(parseString(`${path}.laneId`, laneRaw)),
    atUs: parseUs(`${path}.atUs`, rec["atUs"]),
    ...(detailRaw === undefined ? {} : { detail: detailRaw }),
    ...(causeRaw === undefined ? {} : { causeId: causeRaw }),
  };
}

/** Tolerant-optional parse of the attention roll-up (E2b): absent key ⇒
 *  absent field; a PRESENT record is validated field-wise (a half-shaped
 *  attention block is a producer bug, fail loud per Law 4). */
function decodeAttention(raw: unknown): AttentionSummary {
  const rec = isRecord("attention", raw);
  return {
    capacity: parseNumber("attention.capacity", rec["capacity"]),
    debt: parseNumber("attention.debt", rec["debt"]),
    window: parseNumber("attention.window", rec["window"]),
    loanCount: parseNumber("attention.loanCount", rec["loanCount"]),
  };
}

/** THE boundary parse. Anything malformed throws ProtocolError naming the
 *  exact field; the consumer never sees half-trusted data. */
export function decodeProjection(raw: unknown): SimProjection {
  const rec = isRecord("projection", raw);
  if (rec["protocol"] !== PROTOCOL_VERSION) {
    throw new ProtocolError("protocol", `v${PROTOCOL_VERSION}`, rec["protocol"]);
  }
  const clocksPath = "clocks";
  const clocksRaw = isRecord(clocksPath, rec["clocks"]);
  const countersRaw = isRecord("counters", rec["counters"]);
  const lanesRaw = rec["lanes"];
  if (!Array.isArray(lanesRaw)) throw new ProtocolError("lanes", "array", lanesRaw);
  const observedRaw = rec["observed"];
  if (!Array.isArray(observedRaw)) throw new ProtocolError("observed", "array", observedRaw);
  const noticesRaw = rec["notices"];
  if (!Array.isArray(noticesRaw)) throw new ProtocolError("notices", "array", noticesRaw);

  const observed = new Map<ObservedKey, ProtoCell>();
  observedRaw.forEach((entry, i) => {
    const [key, cell] = decodeCell(entry, i);
    observed.set(key, cell);
  });

  return {
    seq: parseNumber("seq", rec["seq"]),
    tick: parseUs("tick", rec["tick"]),
    minute: parseNumber("minute", rec["minute"]),
    clocks: {
      realUs: parseUs(`${clocksPath}.realUs`, clocksRaw["realUs"]),
      simUs: parseUs(`${clocksPath}.simUs`, clocksRaw["simUs"]),
      businessUs: parseUs(`${clocksPath}.businessUs`, clocksRaw["businessUs"]),
      wallUs: parseUs(`${clocksPath}.wallUs`, clocksRaw["wallUs"]),
    },
    lanes: lanesRaw.map(decodeLane),
    observed,
    notices: noticesRaw.map(decodeNotice),
    counters: {
      served: parseNumber("counters.served", countersRaw["served"]),
      bounced: parseNumber("counters.bounced", countersRaw["bounced"]),
      blockedFalsePositive: parseNumber("counters.blockedFalsePositive", countersRaw["blockedFalsePositive"]),
      landed: parseNumber("counters.landed", countersRaw["landed"]),
    },
    freeCashMicroUsd: parseUs("freeCashMicroUsd", rec["freeCashMicroUsd"]),
    ...(rec["attention"] === undefined ? {} : { attention: decodeAttention(rec["attention"]) }),
  };
}

/* ═══════════════════════════ Envelope assertions ═══════════════════════════ */

export function assertToWorker(raw: unknown): ToWorker {
  const rec = isRecord("toWorker", raw);
  if (rec["protocol"] !== PROTOCOL_VERSION) {
    throw new ProtocolError("protocol", `v${PROTOCOL_VERSION}`, rec["protocol"]);
  }
  const kind = parseLiteral("toWorker.kind", rec["kind"], ["boot", "intent", "speed", "halt"] as const);
  if (kind === "halt") return { kind, protocol: PROTOCOL_VERSION };
  if (kind === "speed") {
    return { kind, protocol: PROTOCOL_VERSION, speedX: parseLiteral("speedX", rec["speedX"], SPEEDS) };
  }
  if (kind === "boot") {
    const corpusRaw = rec["corpus"];
    const buildRaw = rec["build"];
    const rulesRaw = rec["rules"];
    return {
      kind,
      protocol: PROTOCOL_VERSION,
      seed: parseString("boot.seed", rec["seed"]),
      speedX: parseLiteral("boot.speedX", rec["speedX"], SPEEDS),
      // Absent ⇒ the demo mock (back-compat); "sim-core" ⇒ the real driver.
      runnerKind:
        rec["runnerKind"] === undefined
          ? "mock"
          : parseLiteral("boot.runnerKind", rec["runnerKind"], RUNNER_KINDS),
      // Absent ⇒ no key at all on the parsed record (legacy boots stay
      // byte-ident through this seam — WORKER-CORPUS rider law).
      ...(corpusRaw === undefined ? {} : { corpus: parseBootCorpus(corpusRaw) }),
      // Same absent-means-no-key law (D7 build-state rider, ADR-0014 #D7).
      ...(buildRaw === undefined ? {} : { build: parseBootBuild(buildRaw) }),
      // And again for the policy book (boot.rules, ADR-0019 program 5
      // follow-on): absent ⇒ no key ⇒ the runner boots UN-ARMED, byte-ident.
      ...(rulesRaw === undefined ? {} : { rules: parseBootRules(rulesRaw) }),
    };
  }
  return {
    kind,
    protocol: PROTOCOL_VERSION,
    seq: parseNumber("intent.seq", rec["seq"]),
    clock: parseLiteral("intent.clock", rec["clock"], ["sim", "business", "wall"] as const),
    atUs: parseWireUsString("intent.atUs", rec["atUs"]),
    origin: parseLiteral("intent.origin", rec["origin"], ["player", "rule"] as const),
    payload: decodeIntentPayload(rec["payload"]),
  };
}

function decodeIntentPayload(raw: unknown): WireIntentPayload {
  const path = "intent.payload";
  const rec = isRecord(path, raw);
  const kind = parseLiteral(`${path}.kind`, rec["kind"], ["verb", "slider", "player-verb"] as const);
  if (kind === "player-verb") {
    const argsRaw = isRecord(`${path}.args`, rec["args"]);
    parseLiteral(`${path}.args.verb`, argsRaw["verb"], PLAYER_VERBS);
    const args: Record<string, string | number | null> = {};
    for (const [field, value] of Object.entries(argsRaw)) {
      if (value === null || typeof value === "string" || typeof value === "number") {
        args[field] = value;
        continue;
      }
      throw new ProtocolError(`${path}.args.${field}`, "scalar (id/string/number/null)", value);
    }
    return { kind, args: Object.freeze(args) };
  }
  if (kind === "verb") {
    const targetRaw = rec["target"];
    return {
      kind,
      verb: parseString(`${path}.verb`, rec["verb"]),
      target: targetRaw === null ? null : parseString(`${path}.target`, targetRaw),
      value: rec["value"] === null ? null : parseString(`${path}.value`, rec["value"]),
    };
  }
  return {
    kind,
    control: parseString(`${path}.control`, rec["control"]),
    value: parseString(`${path}.value`, rec["value"]),
  };
}

/* ═══════════════ main→worker intent materialization (E2b bigint revival) ═══════════ */

/** Closed mirror of the door's `VERB_ARG_SHAPES` bigint-typed fields (the
 *  table itself stays private in pipeline/intent-door.ts). A drift-pin test
 *  (chrome/__tests__/wireIntent.test.ts) greps the engine source and reddens
 *  the day a bigint arg appears without joining this list — sell-offer's
 *  offerPriceMicroUsd (ADR-0015 3/5) is the second such arg and joined the
 *  list in its landing commit. */
export const BIGINT_ARG_FIELDS: Readonly<Record<string, readonly string[]>> = Object.freeze({
  "adjust-price": Object.freeze(["newPriceMicroUsd"]),
  "sell-offer": Object.freeze(["offerPriceMicroUsd"]),
});

/** Sibling mirror for the door's `bigint-or-null` wire arm (ADR-0015 5/5
 *  Negotiate): the same decimal-string revival law, but the EXPLICIT null
 *  sentinel crosses the JSON hop as real `null` and stays null — 0-vs-null
 *  is load-bearing there ("we will not move on price" vs "no money in the
 *  talk", types.ts `NegotiateTermsArgs.concessionMicroUsd`). The drift pin
 *  (chrome/__tests__/wireIntent.test.ts) greps the engine's VERB_ARG_SHAPES
 *  for BOTH arms and reddens the day a carrier joins neither list. */
export const NULLABLE_BIGINT_ARG_FIELDS: Readonly<Record<string, readonly string[]>> = Object.freeze({
  "negotiate-terms": Object.freeze(["concessionMicroUsd"]),
});

const INT_STRING_RE = /^-?\d+$/;

/** Revive one player-verb args record: fields the door parses as `bigint`
 *  (MoneyUnit / SimTimeUs wire family) cross the JSON hop as decimal strings
 *  — the same law `WireUs`/`WireFixed` already obey — and become REAL bigints
 *  here, at the boundary, before the door's requireBigint sees them. A
 *  non-integer shape on a bigint-typed field is structural garbage → loud
 *  ProtocolError (never a silent number → door throws a vaguer error deeper).
 *  `bigint-or-null` fields take the same law with one honest exception: the
 *  explicit null sentinel passes through untouched (NULLABLE table above). */
function reviveWireArgs(
  args: Readonly<Record<string, string | number | null>>,
): Readonly<Record<string, string | number | bigint | null>> {
  const verb = args["verb"];
  const strict = typeof verb === "string" ? BIGINT_ARG_FIELDS[verb] : undefined;
  const nullable = typeof verb === "string" ? NULLABLE_BIGINT_ARG_FIELDS[verb] : undefined;
  if (strict === undefined && nullable === undefined) return args;
  const revived: Record<string, string | number | bigint | null> = { ...args };
  for (const field of strict ?? []) {
    const raw = revived[field];
    if (typeof raw !== "string" || !INT_STRING_RE.test(raw)) {
      throw new ProtocolError(`intent.payload.args.${field}`, "decimal-string bigint (wire law)", raw);
    }
    revived[field] = BigInt(raw);
  }
  for (const field of nullable ?? []) {
    const raw = revived[field];
    if (raw === null) continue; // the sentinel IS wire-able — keep it null
    if (typeof raw !== "string" || !INT_STRING_RE.test(raw)) {
      throw new ProtocolError(`intent.payload.args.${field}`, "decimal-string bigint-or-null (wire law)", raw);
    }
    revived[field] = BigInt(raw);
  }
  return Object.freeze(revived);
}

/** A parsed main→worker intent envelope (the `intent` arm of `ToWorker`,
 *  structurally). */
export interface WireIntentEnvelope {
  readonly seq: number;
  readonly clock: ClockKind;
  readonly atUs: WireUs;
  readonly origin: "player" | "rule";
  readonly payload: WireIntentPayload;
}

/** THE worker-side materialization (E2b): flat wire scalars → trusted
 *  `PlayerIntent`. One shared implementation for both runner hosts — the real
 *  `sim.worker.ts` and the in-process `fakeWorker.ts` — so the bigint revival
 *  law cannot drift between them (the seam this closes: adjust-price threw
 *  IntentDoorError over the worker path while headless worked, because both
 *  hosts cast the scalar record blindly). The door still owns per-verb
 *  semantics; this only restores the JSON-impossible bigint type. */
export function wireIntentToPlayerIntent(message: WireIntentEnvelope): PlayerIntent {
  const { payload } = message;
  const atUs = BigInt(message.atUs);
  if (payload.kind === "slider") {
    return {
      seq: message.seq,
      clock: message.clock,
      atUs,
      origin: message.origin,
      payload: { kind: "slider", control: payload.control, value: BigInt(payload.value) },
    };
  }
  if (payload.kind === "player-verb") {
    // Codec proved args is a flat scalar record with a closed `verb`
    // discriminant; per-verb structural typing stays the door's boundary.
    return {
      seq: message.seq,
      clock: message.clock,
      atUs,
      origin: message.origin,
      payload: { kind: "player-verb", args: reviveWireArgs(payload.args) as unknown as PlayerVerbArgs },
    };
  }
  return {
    seq: message.seq,
    clock: message.clock,
    atUs,
    origin: message.origin,
    payload: {
      kind: "verb",
      verb: payload.verb,
      target: payload.target === null ? null : asEntityId(payload.target),
      value: payload.value === null ? null : BigInt(payload.value),
    },
  };
}

export function assertFromWorker(raw: unknown): FromWorker {
  const rec = isRecord("fromWorker", raw);
  if (rec["protocol"] !== PROTOCOL_VERSION) {
    throw new ProtocolError("protocol", `v${PROTOCOL_VERSION}`, rec["protocol"]);
  }
  const kind = parseLiteral("fromWorker.kind", rec["kind"], ["ready", "projection", "fault"] as const);
  if (kind === "ready") {
    return {
      kind,
      protocol: PROTOCOL_VERSION,
      engineVersion: parseString("ready.engineVersion", rec["engineVersion"]),
      runnerId: parseLiteral("ready.runnerId", rec["runnerId"], ["mock", "sim-core"] as const),
    };
  }
  if (kind === "fault") {
    return { kind, protocol: PROTOCOL_VERSION, message: parseString("fault.message", rec["message"]) };
  }
  // Deep field validation happens in `decodeProjection` (the single boundary
  // parse); here we only prove it is an object at all.
  isRecord("projection", rec["projection"]);
  return { kind, protocol: PROTOCOL_VERSION, projection: rec["projection"] as ProjectionWire };
}

/* ═══════════════════════════ Display-side helpers ═══════════════════════════ */

/** Q16.16 → JS number. DISPLAY ONLY (§4.1: floats never touch replay state). */
export function fixedToDisplay(fixed: Fixed): number {
  return Number(fixed) / 65536;
}

/** Display number → Q16.16 raw. Used by the mock (presentation-side toy model)
 *  and by chrome when formatting — never by any sim-authority path. */
export function displayToFixed(value: number): Fixed {
  if (!Number.isFinite(value)) throw new ProtocolError("displayToFixed", "finite number", value);
  return BigInt(Math.round(value * 65536));
}

/** Read a parsed cell as Fixed, failing loud when the encoding disagrees —
 *  a mismatch is a producer bug we want at the console immediately. */
export function requireFixed(cell: ProtoCell | undefined, what: string): Fixed {
  if (cell === undefined) {
    throw new ProtocolError(`cell(${what})`, "present cell", "undefined");
  }
  if (typeof cell.value !== "bigint") {
    throw new ProtocolError(`cell(${what}).value`, "bigint (fixed encoding)", cell.value);
  }
  return cell.value;
}
