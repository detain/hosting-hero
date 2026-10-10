/**
 * THE INTENT DOOR — the only legal door through which external (player or
 * re-fed rule) intents enter the deterministic sim (MASTER_REPORT §4.2
 * player action economy + Hands, §7.5 hands-as-action-slots, §7.13
 * tick-inserted intents / pause-with-orders). Closes proto friction #1
 * ("TickInputs has NO external-intent door").
 *
 * Laws this file obeys:
 *  - CANONICAL POSITION: the driver calls `applyIntentDoor` BEFORE step 1
 *    (arrival) each tick; entries are applied in (tick, seq) order — a fixed
 *    order over host-fed data, so two runs with the same schedule digest
 *    identically (×100-gated in __tests__/intent-door.test.ts);
 *  - EXECUTE-OR-REFUSE, NEVER CRASH-BUT-ALSO-NEVER-SILENT: VALUE-DOMAIN
 *    violations (speed ∉ {1,2,4}, empty-after-parse strings, unknown ids,
 *    slot taken, power cycle, hands exhausted…) become deterministic
 *    `intent-refused` events — no RNG is consulted anywhere here, no state
 *    changes, nothing is consumed. STRUCTURAL wire garbage — a primitive TYPE
 *    mismatch anywhere on the entry (stamp fields AND, per M2, every per-verb
 *    arg shape parsed in `parseEntry`) — throws `IntentDoorError` at the
 *    boundary (Law 2 parse-don't-validate + Law 4 fail-fast): a host feeding
 *    malformed wire data has a bug to find, not a game state to fork. The
 *    split is one law, not three handlers: type checks happen ONLY at parse,
 *    handlers trust their args and own the refusal space alone;
 *  - FEED UNIQUENESS (M4): a schedule is a SET of (tick, seq) stamps — a
 *    repeated pair within one `applyIntentDoor` feed is host programming
 *    garbage (two intents claiming one attribution identity) and throws,
 *    naming both offending input positions;
 *  - HANDS ARE PHYSICS (§7.5): every executed intent pays its verb's
 *    `handCost` tokens for `occupancyTicks` from `GameState.hands` — and a
 *    verb whose cost is 0 (toggle-speed by default, or any host override)
 *    books NOTHING: the rail is never touched (`if (cost > 0)` gates the
 *    whole allocation). Refusal never spends hands.
 *    Default occupancies follow the §7.5 reference durations (config change
 *    40s→1 tick, failover 90s→2, cable trace 3min→3; 1 tick = 1 sim-minute);
 *  - SCOPE DISCIPLINE: handlers mutate ONLY their named slice — nodes (place/
 *    configure), board (connect/disconnect), ruleBook (+hash) (commit),
 *    pricing (adjust-price — the OPTIONAL OD-24(a) part-1 override book,
 *    STATE-NEUTRAL: no revenue, no elasticity, no invoice math in the door),
 *    hands+events (everything), events-only (shed-load/communicate/
 *    toggle-speed). units/lanes/observed/cash/ledger/contracts are NEVER
 *    reachable from the door (audit-tested by reference identity);
 *  - GROUND-TRUTH TOPOLOGY STAYS GROUND: `BoardState` is the pipeline-local
 *    structural embed (this module never imports topology/ — the topology
 *    lane's mutable MultiGraph keeps owning blast/domain math; edge ids
 *    follow topology's `defaultEdgeId` FORMAT for data and power edges only
 *    so hosts correlate those two views — control/trust suffix topology
 *    hangs on `domain`/`via` fields this slice does not carry, so their ids
 *    are door-local and not 1:1 correlatable);
 *  - pause-with-orders (§7.13): an entry stamped at the PAUSED tick arrives
 *    at the first unfrozen `advance` and applies then (tick <= current);
 *    future stamps are refused loudly, so "the whole schedule at once" host
 *    patterns fail visible instead of smearing across ticks. Each intent is
 *    fed EXACTLY ONCE (ambient-input contract, same as envelopes/evidence);
 *  - DRAIN BEFORE DISCONNECT (§7.2 R54, OPT-IN): with
 *    `config.drainPolicy.enabled` (DEFAULT OFF — v0 plain pull stays law),
 *    `disconnect-drain` becomes a two-phase choreography carried ENTIRELY by
 *    the EXISTING occupancy law, so the ratified BoardState/HandState wire
 *    shapes stay untouched: phase 1 reserves hands with
 *    `busyCauseId = drain:<edgeId>` for `drainTicks` (edge still present,
 *    still routable — in-flight is not dropped); when the reservation comes
 *    due, a DOOR-INTERNAL continuation (never a fed input) executes the pull
 *    as a due-queue entry BEFORE that tick's external intents, minting its
 *    own `intent-executed` event under the same `drain:<edgeId>` cause with
 *    detail `drained:<edgeId>` (v0's executed-pull detail is `pulled:<edgeId>`).
 *    The hand token IS the pending-disconnect record — the digest already
 *    absorbs cause + stamp, replays re-fire the continuation identically, and
 *    a started drain COMPLETES even if the host flips the policy off mid-drain
 *    (the promise lives in state, not config). `drain:<edgeId>` is the door's
 *    RESERVED continuation namespace; while enabled, occupancyTicks for
 *    disconnect-drain is superseded by drainTicks (the drain hold covers the
 *    whole choreography, and the pull lands exactly as the hand frees).
 */

import type {
  AdjustPriceArgs,
  BoardEdgeRecord,
  BoardRelation,
  BoardState,
  CauseId,
  CommunicateArgs,
  ConfigureNodeArgs,
  ConnectPortsArgs,
  DisconnectDrainArgs,
  EntityId,
  ExternalIntent,
  GameState,
  HandState,
  HandToken,
  InspectionDepth,
  NodeDiscipline,
  NodeRecord,
  PlaceDeviceArgs,
  PlayerIntent,
  PolicyCard,
  PolicyCardCommitArgs,
  PriceOverrideBook,
  PriceOverrideRecord,
  PriceTargetKind,
  ShedLoadArgs,
  ShedOrder,
  SimEvent,
  SimTick,
  SimTimeUs,
  TickContext,
  ToggleSpeedArgs,
} from "../types.ts";
import {
  asCauseId,
  asEntityId,
  PLAYER_VERBS,
  PlayerVerb,
} from "../types.ts";
import { MICROS_PER_MIN } from "../kernel/time.ts";
import { compareCodeUnits, fnv1a64OverCodePoints } from "../internal/canonical.ts";
import { compareEntityId } from "./internal.ts";
import { makeSlots } from "./queue.ts";

/* ═══════════════════════════ Errors & config ═══════════════════════════ */

/** Boundary parse failure — malformed wire TYPES (host bug). Distinct from
 *  refusal (semantic, in-game, event-logged). */
export class IntentDoorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IntentDoorError";
  }
}

/** What the host's placement validator sees: the parsed args plus a READ-ONLY
 *  view of the state the device would land in. Returns null = accept, or a
 *  rejection reason that lands verbatim in the refusal event. Needs/provides
 *  checks (palette membership, U-space, power fit…) stay in the HOST lane —
 *  this callback is how they enter the sim without the pipeline importing
 *  bundle/content knowledge (module-decoupling decision, reported). */
export interface PlaceDeviceQuery {
  readonly args: PlaceDeviceArgs;
  readonly state: GameState;
  readonly context: TickContext;
}
export interface PlacementRejection {
  readonly reason: string;
}

/** What the host's price-target validator sees — the SAME decoupling pattern
 *  as `canPlaceDevice`: plan/catalog/contract-class knowledge stays HOST-side,
 *  the door only learns "resolved" or "refused, because <reason verbatim>".
 *  Returns null = accept (target resolves in the host's namespace), or a
 *  rejection that lands in the refusal event as `unknown-plan: <reason>`. */
export interface AdjustPriceQuery {
  readonly args: AdjustPriceArgs;
  readonly state: GameState;
  readonly context: TickContext;
}
export interface PriceTargetRejection {
  readonly reason: string;
}

export interface IntentDoorConfig {
  /** Hand tokens when materializing a missing GameState.hands (default 1 —
   *  T0/T2 per §7.5). Hosts SHOULD seed hands via createInitialState instead. */
  readonly handCapacity?: number;
  /** Tokens consumed per verb (default table below; toggle-speed is free). */
  readonly handCost?: Partial<Record<PlayerVerb, number>>;
  /** Ticks a verb holds its tokens (default = §7.5 reference durations). */
  readonly occupancyTicks?: Partial<Record<PlayerVerb, number>>;
  /** place-device validator (host-wired needs/provides check; absent = the
   *  door only enforces id uniqueness + structural sanity). */
  readonly canPlaceDevice?: (query: PlaceDeviceQuery) => PlacementRejection | null;
  /** adjust-price target validator (OD-24(a) part 1; host-wired plan/catalog
   *  resolution — absent = the door only enforces structural sanity, exactly
   *  the `canPlaceDevice` law). Callback output is validated: `reason` must
   *  be a string, host bugs throw rather than fork a state. */
  readonly canAdjustPrice?: (query: AdjustPriceQuery) => PriceTargetRejection | null;
  /** policy-card-commit resolver: maps the payload hash to the authored card.
   *  Absent → commits refuse with "no-card-lookup". */
  readonly lookupPolicyCard?: (cardHash: string) => PolicyCard | null;
  /** Skeleton NodeRecord knobs for placed devices. */
  readonly deviceSlots?: number;
  readonly deviceServiceTimeUs?: SimTimeUs;
  readonly deviceInspectionDepth?: InspectionDepth;
  readonly deviceShedOrder?: ShedOrder;
  readonly deviceDiscipline?: NodeDiscipline;
  /** GRACEFUL DRAIN (§7.2 R54), opt-in. `enabled` defaults FALSE — hosts
   *  without this field keep the v0 plain-pull law byte-identically. When
   *  true, `disconnect-drain` executes phase 1 (stop new, edge stays live,
   *  hands reserved `drain:<edgeId>` for `drainTicks`) and the pull executes
   *  as a door-internal continuation when the reservation matures.
   *  `drainTicks` default 2; must be a safe integer >= 1 (0-length drain ==
   *  plain pull — use the flag off for that). A malformed policy object is
   *  host programming garbage and THROWS `IntentDoorError` (Laws 2+4), and
   *  enabling with `handCost[disconnect-drain]` overridden to 0 throws too:
   *  the pending-drain record lives on a hand token, a free verb would leave
   *  the continuation unrecordable. */
  readonly drainPolicy?: {
    readonly enabled?: boolean;
    readonly drainTicks?: number;
  };
}

/** §7.5 reference durations, rounded UP to whole sim-minute ticks:
 *  config change 40s → 1 · failover 90s → 2 · cable trace 3 min → 3.
 *  "duration vs attendance" is COLLAPSED to one window in v0 (attendance ==
 *  duration): the unattended-job split (RAID 19h/0 hands) needs a scheduler
 *  the door does not own — reported as a seam for the receipt-engine twist.
 *
 *  CONFIG ANOMALY (W3 — documented, legal, no behavior gate): a host may
 *  override `occupancyTicks` to 0 for a verb whose `handCost` is > 0. The
 *  reservation is then stamped `busyUntilTick == tick + 0n`, and because
 *  occupancy is HALF-OPEN `[start, busyUntilTick)` that window is empty — the
 *  token's cause is cleared by the next door pass that TOUCHES the rail —
 *  the release sweep runs once per `draftHands` invocation (before any
 *  allocation), and a pass that never allocates never invokes it — firing at
 *  `busyUntilTick <= tick`. Within
 *  the submitting pass the token still counts as busy (free-hand accounting
 *  and refusals see the reservation it paid for), so the combination is not
 *  a spend-free loophole — it is a same-tick-boundary release, exactly what
 *  the half-open law promises. No DEFAULT verb pairs the two (the only
 *  occupancy-0 entry, toggle-speed, is also cost-0). */
export const DEFAULT_INTENT_OCCUPANCY_TICKS: Readonly<Record<PlayerVerb, number>> = Object.freeze({
  [PlayerVerb.PlaceDevice]: 3,
  [PlayerVerb.ConnectPorts]: 3,
  [PlayerVerb.DisconnectDrain]: 2,
  [PlayerVerb.ConfigureNode]: 1,
  [PlayerVerb.PolicyCardCommit]: 1,
  [PlayerVerb.ShedLoad]: 2,
  [PlayerVerb.Communicate]: 2,
  [PlayerVerb.ToggleSpeed]: 0,
  // OD-24(a) part 1: a price order is a decision at the desk — the COMMIT
  // class (1 tick, same window as policy-card-commit/configure-node).
  [PlayerVerb.AdjustPrice]: 1,
});

export const DEFAULT_INTENT_HAND_COST: Readonly<Record<PlayerVerb, number>> = Object.freeze({
  [PlayerVerb.PlaceDevice]: 1,
  [PlayerVerb.ConnectPorts]: 1,
  [PlayerVerb.DisconnectDrain]: 1,
  [PlayerVerb.ConfigureNode]: 1,
  [PlayerVerb.PolicyCardCommit]: 1,
  [PlayerVerb.ShedLoad]: 1,
  [PlayerVerb.Communicate]: 1,
  [PlayerVerb.ToggleSpeed]: 0,
  [PlayerVerb.AdjustPrice]: 1,
});

/* ═══════════════════════════ Drain choreography (§7.2 R54) ═══════════════ */

const DEFAULT_DRAIN_TICKS = 2;

/** RESERVED continuation namespace on `HandToken.busyCauseId`: a token whose
 *  cause is `drain:<edgeId>` IS the pending-disconnect record (the whole
 *  reason BoardState/HandState shapes never changed). The maturity scan reads
 *  this prefix from state — it runs WHETHER OR NOT the policy is currently
 *  enabled, because a drain that was started is a promise kept in state. */
const DRAIN_CAUSE_PREFIX = "drain:";

/** `intent-executed` events minted by the drain continuation carry this
 *  sentinel seq: a continuation is never a fed schedule entry, so it owns no
 *  player seq — attribution lives in its `drain:<edgeId>` causeId. */
const DRAIN_CONTINUATION_SEQ = -1;

interface ResolvedDrainPolicy {
  readonly enabled: boolean;
  readonly drainTicks: number;
}

const IDLE_DRAIN_POLICY: ResolvedDrainPolicy = Object.freeze({ enabled: false, drainTicks: DEFAULT_DRAIN_TICKS });

/** Parse the host-supplied drain policy at the door boundary (Laws 2+4):
 *  absent = the frozen idle constant (byte-identical v0 path), malformed =
 *  throw naming the field, exactly like the wire-parse law for entries. */
function resolveDrainPolicy(config: IntentDoorConfig): ResolvedDrainPolicy {
  const policy = config.drainPolicy;
  if (policy === undefined) return IDLE_DRAIN_POLICY;
  if (policy.enabled !== undefined && typeof policy.enabled !== "boolean") {
    fail("config.drainPolicy.enabled", `expected boolean, got ${typeof policy.enabled}`);
  }
  let drainTicks = DEFAULT_DRAIN_TICKS;
  if (policy.drainTicks !== undefined) {
    requireInt(policy.drainTicks, "config.drainPolicy.drainTicks");
    if (policy.drainTicks < 1) {
      fail("config.drainPolicy.drainTicks", `expected >= 1 (a 0-length drain IS the plain pull — leave the policy off for that), got ${String(policy.drainTicks)}`);
    }
    drainTicks = policy.drainTicks;
  }
  const enabled = policy.enabled === true;
  if (enabled) {
    const disconnectCost = config.handCost?.[PlayerVerb.DisconnectDrain] ?? DEFAULT_INTENT_HAND_COST[PlayerVerb.DisconnectDrain];
    if (!(Number.isSafeInteger(disconnectCost) && disconnectCost >= 1)) {
      fail(
        "config.drainPolicy",
        `enabled requires handCost[disconnect-drain] >= 1 (got ${String(disconnectCost)}) — the pending drain lives on a hand token (busyCauseId \`${DRAIN_CAUSE_PREFIX}<edgeId>\`); a cost-0 disconnect would leave no continuation record`,
      );
    }
  }
  return Object.freeze({ enabled, drainTicks });
}

function drainCause(edgeId: EntityId): CauseId {
  return asCauseId(`${DRAIN_CAUSE_PREFIX}${edgeId}`);
}

/** Decode a hand cause back to its pending edge id — null for every other
 *  namespace (a plain `intent:<seq>` release, a forged unrelated cause). */
function drainEdgeOf(cause: CauseId | null): EntityId | null {
  if (cause === null || !cause.startsWith(DRAIN_CAUSE_PREFIX)) return null;
  return asEntityId(cause.slice(DRAIN_CAUSE_PREFIX.length));
}

/* ═══════════════════════════ Result surface ═══════════════════════════ */

/** One per fed intent — the door's verdict roll-up (host HUD ticker / test
 *  assertion sugar; the events array is the replay-grade record). */
export interface IntentReceipt {
  /** Submission stamp carried in from the entry (ordering key). */
  readonly submittedTick: SimTick;
  readonly seq: number;
  /** PlayerVerb string, or a carrier label for refused non-door payloads. */
  readonly verb: string;
  readonly outcome: "executed" | "refused";
  readonly reason: string | null;
}

export interface IntentDoorResult {
  /** Same object identity when NOTHING applied (no intents / all refused)
   *  AND no hand token was due for release — a refused pass that still
   *  touches the rail materializes the released-hands slice (F4/P3-proven),
   *  which is a state change, not an identity violation. */
  readonly state: GameState;
  /** Executed + refused events in canonical application order (future-stamp
   *  refusals trail, in input order). */
  readonly events: readonly SimEvent[];
  readonly receipts: readonly IntentReceipt[];
}

/* ═══════════════════════════ State constructors ═══════════════════════════ */

export function mintHandState(capacity: number): HandState {
  if (!Number.isSafeInteger(capacity) || capacity < 1) {
    throw new IntentDoorError(`mintHandState: capacity must be a safe integer >= 1, got ${String(capacity)}`);
  }
  const tokens: HandToken[] = [];
  for (let i = 0; i < capacity; i += 1) {
    tokens.push(Object.freeze({ index: i, busyUntilTick: 0n, busyCauseId: null }));
  }
  return Object.freeze({ capacity, tokens: Object.freeze(tokens) });
}

export function createBoardState(edges: readonly BoardEdgeRecord[] = []): BoardState {
  const byId = new Map<EntityId, BoardEdgeRecord>();
  for (const edge of [...edges].sort((a, b) => compareEntityId(a.id, b.id))) {
    byId.set(edge.id, Object.freeze({ ...edge }));
  }
  return Object.freeze({ version: 0, edges: Object.freeze(byId) });
}

/** Empty price-override book (OD-24(a) part 1) — hosts that want the embed
 *  present from tick 0 (e.g. seeded catalog overrides) mint it here; the
 *  `adjust-price` handler materializes lazily without it. */
export function createPriceOverrideBook(): PriceOverrideBook {
  return Object.freeze({ version: 0, overrides: Object.freeze(new Map<string, PriceOverrideRecord>()) });
}

/** Composite book key. `targetKind` is a colon-free closed vocabulary, so the
 *  first-colon split is exact even for namespaced ids ("plan:pro-2026"
 *  and "sku:cb:bandwidth" both round-trip through `parsePriceOverrideKey`). */
export function priceOverrideKey(targetKind: PriceTargetKind, targetId: EntityId): string {
  return `${targetKind}:${targetId}`;
}

/** Inverse of `priceOverrideKey` — null for any key outside the closed kind
 *  vocabulary (foreign book, hand-forged state). Consumers (economy/HUD lanes)
 *  parse through this instead of re-splitting. */
export function parsePriceOverrideKey(key: string): { readonly targetKind: PriceTargetKind; readonly targetId: EntityId } | null {
  const sep = key.indexOf(":");
  if (sep <= 0) return null;
  const kind = key.slice(0, sep);
  if (!PRICE_TARGET_KINDS.includes(kind as PriceTargetKind)) return null;
  const targetId = key.slice(sep + 1);
  if (targetId.length === 0) return null; // empty ids are uncastable (types.ts asEntityId law)
  return Object.freeze({ targetKind: kind as PriceTargetKind, targetId: asEntityId(targetId) });
}

/* ═══════════════════════════ Door internals (mutable draft) ═══════════════ */

interface Draft {
  readonly origin: GameState;
  readonly context: TickContext;
  readonly config: IntentDoorConfig;
  readonly drain: ResolvedDrainPolicy;
  nodes: ReadonlyMap<EntityId, NodeRecord> | null;
  board: BoardState | null;
  hands: HandState | null;
  ruleBook: readonly PolicyCard[] | null;
  ruleBookHash: string | null;
  pricing: PriceOverrideBook | null;
  readonly events: SimEvent[];
  readonly receipts: IntentReceipt[];
}

const SPEED_VALUES: readonly number[] = Object.freeze([1, 2, 4]);
const INSPECTION_DEPTHS: readonly InspectionDepth[] = Object.freeze([
  "pass-through",
  "sample-1-in-20",
  "inspect",
  "challenge",
]);
const SHED_ORDERS: readonly ShedOrder[] = Object.freeze([
  "first-in-first-out",
  "last-in-first-out",
  "lowest-value-first",
  "qos-weighted",
]);
const RELATIONS: readonly BoardRelation[] = Object.freeze(["data", "power", "control", "trust"]);
/** adjust-price target namespaces (OD-24(a) part 1, closed — types.ts
 *  `PriceTargetKind` is the type-law twin of this value law). */
const PRICE_TARGET_KINDS: readonly PriceTargetKind[] = Object.freeze(["plan", "contract-class", "sku"]);
const VERB_SET: ReadonlySet<string> = new Set<string>(PLAYER_VERBS);

function fail(where: string, detail: string): never {
  throw new IntentDoorError(`intent-door: ${where}: ${detail}`);
}

function requireBigint(value: unknown, where: string): bigint {
  if (typeof value !== "bigint") fail(where, `expected bigint, got ${typeof value}`);
  return value;
}

function requireString(value: unknown, where: string): string {
  if (typeof value !== "string") fail(where, `expected string, got ${typeof value}`);
  return value;
}

function requireRecord(value: unknown, where: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(where, `expected plain object, got ${Array.isArray(value) ? "array" : typeof value}`);
  }
  return value as Record<string, unknown>;
}

function requireInt(value: unknown, where: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value)) {
    fail(where, `expected safe integer, got ${String(value)}`);
  }
  return value;
}

function requireNumber(value: unknown, where: string): number {
  if (typeof value !== "number") fail(where, `expected number, got ${typeof value}`);
  return value;
}

/** Per-verb WIRE arg shapes (M2 — one type law at the boundary). A primitive
 *  TYPE mismatch here (including a missing key, which parses as `undefined`)
 *  is structural garbage → `IntentDoorError`; value-domain violations stay
 *  the handlers' refusal space. `string-or-null` / `number-or-null` fields
 *  accept the JSON null sentinel ONLY — null in a non-nullable field is a
 *  type mismatch, and a present-but-wrong type is never silently coerced.
 *  `bigint` is the money/clock wire family (MoneyUnit, SimTimeUs): a float or
 *  string price is structural garbage, which makes a FRACTIONAL price
 *  unrepresentable (Law 2 — the handler's `invalid-price` refusal owns only
 *  the ≤ 0 value domain). The table's field order is fixed, so an error
 *  naming "the first offender" is deterministic. */
type ArgWireType = "string" | "string-or-null" | "number" | "number-or-null" | "bigint";
const VERB_ARG_SHAPES: Readonly<Record<PlayerVerb, Readonly<Record<string, ArgWireType>>>> = Object.freeze({
  [PlayerVerb.PlaceDevice]: Object.freeze({ nodeId: "string", deviceKind: "string", template: "string-or-null" }),
  [PlayerVerb.ConnectPorts]: Object.freeze({ relation: "string", from: "string", to: "string", slot: "string-or-null" }),
  [PlayerVerb.DisconnectDrain]: Object.freeze({ edgeId: "string" }),
  [PlayerVerb.ConfigureNode]: Object.freeze({ nodeId: "string", inspectionDepth: "string-or-null", shedOrder: "string-or-null" }),
  [PlayerVerb.PolicyCardCommit]: Object.freeze({ cardHash: "string" }),
  [PlayerVerb.ShedLoad]: Object.freeze({ nodeId: "string", qosClassId: "string-or-null" }),
  [PlayerVerb.Communicate]: Object.freeze({ target: "string-or-null", note: "string" }),
  [PlayerVerb.ToggleSpeed]: Object.freeze({ speedX: "number" }),
  [PlayerVerb.AdjustPrice]: Object.freeze({ targetKind: "string", targetId: "string", newPriceMicroUsd: "bigint", effectiveAtBusinessMinute: "number-or-null" }),
});

/** Boundary parse (Law 2): validate WIRE TYPES of one fed entry; a pass here
 *  means the entry is well-formed, NOT that it will execute (semantics are
 *  the handlers' refusal space). Per M2 this covers the per-verb ARG SHAPES
 *  too — handlers never re-check primitive types of their args. */
function parseEntry(entry: unknown, index: number): ExternalIntent {
  const where = `externalIntents[${index}]`;
  const record = requireRecord(entry, where);
  const tick = requireBigint(record.tick, `${where}.tick`);
  const intentWire = requireRecord(record.intent, `${where}.intent`);
  requireInt(intentWire.seq, `${where}.intent.seq`);
  requireBigint(intentWire.atUs, `${where}.intent.atUs`);
  const clock = requireString(intentWire.clock, `${where}.intent.clock`);
  if (clock !== "sim" && clock !== "business" && clock !== "wall") {
    fail(`${where}.intent.clock`, `"${clock}" not in {sim, business, wall}`);
  }
  const origin = requireString(intentWire.origin, `${where}.intent.origin`);
  if (origin !== "player" && origin !== "rule") {
    fail(`${where}.intent.origin`, `"${origin}" not in {player, rule}`);
  }
  const payload = requireRecord(intentWire.payload, `${where}.intent.payload`);
  const kind = requireString(payload.kind, `${where}.intent.payload.kind`);
  if (kind === "player-verb") {
    const args = requireRecord(payload.args, `${where}.intent.payload.args`);
    const verb = requireString(args.verb, `${where}.intent.payload.args.verb`);
    if (!VERB_SET.has(verb)) fail(`${where}.intent.payload.args.verb`, `"${verb}" not a PlayerVerb`);
    const shape = VERB_ARG_SHAPES[verb as PlayerVerb];
    for (const field of Object.keys(shape)) {
      const fieldWhere = `${where}.intent.payload.args.${field}`;
      const value = args[field];
      const wireType = shape[field];
      if (wireType === "string") requireString(value, fieldWhere);
      else if (wireType === "number") requireNumber(value, fieldWhere);
      else if (wireType === "bigint") requireBigint(value, fieldWhere);
      else if (wireType === "number-or-null") { if (value !== null) requireNumber(value, fieldWhere); }
      else if (value !== null) requireString(value, fieldWhere);
    }
  }
  return entry as ExternalIntent;
}

/* ── draft accessors (copy-on-write; unchanged sections keep identity) ── */

function draftNodes(draft: Draft): Map<EntityId, NodeRecord> {
  return new Map(draft.nodes ?? draft.origin.nodes);
}

function draftBoard(draft: Draft): Map<EntityId, BoardEdgeRecord> {
  return new Map(draft.board?.edges ?? draft.origin.board?.edges ?? createBoardState().edges);
}

function draftHands(draft: Draft, tick: SimTick): HandState {
  if (draft.hands !== null) return draft.hands;
  const base = draft.origin.hands ?? mintHandState(draft.config.handCapacity ?? 1);
  // Release due tokens once per tick, before any allocation (§7.5: a hand is
  // free again at its busyUntilTick boundary). The release is cached ONLY
  // when it actually changed something — a refused-only pass with nothing
  // due must leave the state's hands identity untouched.
  const tokens = base.tokens.map(
    (token): HandToken =>
      token.busyCauseId !== null && token.busyUntilTick <= tick
        ? Object.freeze({ ...token, busyCauseId: null })
        : token,
  );
  const changed = tokens.some((token, i) => token !== base.tokens[i]);
  if (!changed) return base;
  const released = Object.freeze({ capacity: base.capacity, tokens: Object.freeze(tokens) });
  draft.hands = released;
  return released;
}

function occupyHands(draft: Draft, tick: SimTick, cost: number, cause: CauseId, until: SimTick): number[] {
  const hands = draftHands(draft, tick);
  const taken: number[] = [];
  const tokens = [...hands.tokens];
  for (let i = 0; i < tokens.length && taken.length < cost; i += 1) {
    const token = tokens[i] as HandToken;
    if (token.busyCauseId !== null) continue;
    tokens[i] = Object.freeze({ ...token, busyUntilTick: until, busyCauseId: cause });
    taken.push(token.index);
  }
  draft.hands = Object.freeze({ capacity: hands.capacity, tokens: Object.freeze(tokens) });
  return taken;
}

function freeHandCount(hands: HandState): number {
  let free = 0;
  for (const token of hands.tokens) if (token.busyCauseId === null) free += 1;
  return free;
}

/**
 * DRAIN CONTINUATION — the due-queue half of the two-phase disconnect.
 * Called ONCE at the top of every door pass, BEFORE the external entries of
 * the tick (deterministic ordering law, pinned in tests: a pull maturing at
 * tick T makes its edge safe-to-touch for entries also stamped at T).
 *
 * Reads the pending-disconnect records straight off the ORIGIN hand rail
 * (tokens whose cause is `drain:<edgeId>` and whose reservation has come due,
 * `busyUntilTick <= tick` — the same half-open release law every occupancy
 * obeys) and executes the actual pulls: edge deleted (board version bumps
 * once PER removal, the mutation-count convention), one `intent-executed`
 * event per pull carrying causeId `drain:<edgeId>`, detail `drained:<edgeId>`
 * and the sentinel continuation seq. Then the ordinary release sweep runs
 * (cause nulled, busyUntilTick stamp kept) so the continuation can never
 * re-fire. Runs regardless of the CURRENT policy — a drain started is a
 * drain finished; flipping the flag mid-drain cannot strand a promised pull.
 */
function processMaturedDrains(draft: Draft): void {
  const hands = draft.origin.hands;
  if (hands === undefined) return;
  const tick = draft.context.tick;
  const due: { readonly index: number; readonly edgeId: EntityId; readonly busyUntilTick: SimTick }[] = [];
  for (const token of hands.tokens) {
    // pinned token-index order — the rail is the schedule, never a Map.
    const edgeId = drainEdgeOf(token.busyCauseId);
    if (edgeId !== null && token.busyUntilTick <= tick) {
      due.push(Object.freeze({ index: token.index, edgeId, busyUntilTick: token.busyUntilTick }));
    }
  }
  if (due.length === 0) return;
  const board = draft.board ?? draft.origin.board ?? createBoardState();
  const edges = new Map(board.edges);
  let version = board.version;
  for (const drain of due) {
    if (edges.delete(drain.edgeId)) version += 1; // already gone (forged state) → no phantom bump
    draft.events.push(
      Object.freeze({
        kind: "intent-executed" as const,
        atUs: draft.context.clocks.simUs,
        tick,
        causeId: drainCause(drain.edgeId),
        verb: PlayerVerb.DisconnectDrain,
        intentSeq: DRAIN_CONTINUATION_SEQ,
        handIndexes: Object.freeze([drain.index]),
        busyUntilTick: drain.busyUntilTick,
        detail: `drained:${drain.edgeId}`,
      }),
    );
  }
  if (version !== board.version) {
    draft.board = Object.freeze({ version, edges: Object.freeze(edges) });
  }
  // Materialize the release sweep so the matured drains free their tokens in
  // the built state (identity-preserving when nothing else is due).
  draftHands(draft, tick);
}

/* ═══════════════════════════ Handlers (execute-or-refuse) ═══════════════ */

type HandlerVerdict = { readonly ok: true; readonly detail: string | null } | { readonly ok: false; readonly reason: string };

function defaultEdgeId(relation: BoardRelation, from: EntityId, to: EntityId, slot: string | null): EntityId {
  // topology/graph.ts `defaultEdgeId` convention (control/trust suffixes are
  // topology-only fields; this slice carries no domain/via metadata).
  const base = `edge:${relation}:${from}->${to}`;
  return (relation === "power" && slot !== null ? `${base}:${slot}` : base) as EntityId;
}

/** Would a power edge from→to close a feed cycle? Walk `from`'s UPSTREAM
 *  supplier chain; reaching `to` means `to` already feeds `from`, so making
 *  `from` feed `to` back would form a loop — the feed graph is a tree
 *  (structural mirror of topology's assertNoPowerCycle). Note `from` already
 *  feeding `to` on a DIFFERENT slot is a legal multi-feed (dual-PSU), never
 *  a cycle, and passes. */
function powerCycle(edges: ReadonlyMap<EntityId, BoardEdgeRecord>, from: EntityId, to: EntityId): boolean {
  const suppliers = new Map<EntityId, EntityId[]>();
  for (const edge of edges.values()) {
    if (edge.relation !== "power") continue;
    const list = suppliers.get(edge.to) ?? [];
    list.push(edge.from);
    suppliers.set(edge.to, list);
  }
  const seen = new Set<EntityId>([from]);
  let frontier: EntityId[] = [from];
  while (frontier.length > 0) {
    const next: EntityId[] = [];
    for (const current of frontier) {
      for (const supplier of suppliers.get(current) ?? []) {
        if (supplier === to) return true;
        if (seen.has(supplier)) continue;
        seen.add(supplier);
        next.push(supplier);
      }
    }
    frontier = next;
  }
  return false;
}

function handlePlaceDevice(draft: Draft, args: PlaceDeviceArgs): HandlerVerdict {
  // args carry TRUSTED wire types (parseEntry parsed every field per M2) —
  // only value-domain checks remain below.
  const nodeId = args.nodeId;
  if (nodeId.length === 0) return { ok: false, reason: "empty-node-id" };
  const devices = draftNodes(draft);
  if (devices.has(nodeId as EntityId)) {
    return { ok: false, reason: `node-exists: "${nodeId}"` };
  }
  if (args.deviceKind.length === 0) return { ok: false, reason: "empty-device-kind" };
  const rejection = draft.config.canPlaceDevice?.({ args, state: snapshotFor(draft), context: draft.context });
  if (rejection !== undefined && rejection !== null) {
    // host CALLBACK output stays validated (it is not door-wire input):
    return { ok: false, reason: `placement-rejected: ${requireString(rejection.reason, "canPlaceDevice result.reason")}` };
  }
  const node: NodeRecord = Object.freeze({
    id: nodeId as EntityId,
    kind: args.deviceKind,
    slots: makeSlots(draft.config.deviceSlots ?? 1),
    serviceTimeUs: draft.config.deviceServiceTimeUs ?? MICROS_PER_MIN,
    queueDepth: 0,
    queue: Object.freeze([]),
    shedOrder: draft.config.deviceShedOrder ?? "qos-weighted",
    inspectionDepth: draft.config.deviceInspectionDepth ?? "pass-through",
    discipline: draft.config.deviceDiscipline ?? "hockey-stick",
    utilizationRho: 0n,
    dependencyNodeId: null,
  });
  devices.set(node.id, node);
  draft.nodes = Object.freeze(devices);
  return { ok: true, detail: `kind=${args.deviceKind}` };
}

function handleConnectPorts(draft: Draft, args: ConnectPortsArgs): HandlerVerdict {
  const relation = args.relation; // wire type trusted (parseEntry, M2)
  if (!RELATIONS.includes(relation as BoardRelation)) {
    return { ok: false, reason: `bad-relation: "${relation}" not in {${RELATIONS.join(",")}}` };
  }
  const from = args.from;
  const to = args.to;
  if (args.slot !== null && args.slot.length === 0) return { ok: false, reason: "empty-slot" };
  if (relation === "power" && args.slot === null) return { ok: false, reason: "power-needs-slot" };
  if (relation !== "power" && args.slot !== null) return { ok: false, reason: `slot-only-for-power: got "${args.slot}"` };
  const nodes = draftNodes(draft);
  if (!nodes.has(from)) return { ok: false, reason: `unknown-node: "${from}"` };
  if (!nodes.has(to)) return { ok: false, reason: `unknown-node: "${to}"` };
  if (from === to) return { ok: false, reason: `self-edge: "${from}"` };
  const edges = draftBoard(draft);
  const id = defaultEdgeId(relation as BoardRelation, from, to, args.slot);
  if (edges.has(id)) return { ok: false, reason: `edge-exists: "${id}"` };
  if (relation === "power") {
    for (const edge of edges.values()) {
      if (edge.relation === "power" && edge.to === to && edge.slot === args.slot) {
        return { ok: false, reason: `slot-occupied: "${args.slot}" on "${to}" fed by "${edge.from}" — one supplier per socket` };
      }
    }
    if (powerCycle(edges, from, to)) {
      return { ok: false, reason: `power-cycle: "${from}" already draws power through "${to}" — the feed graph is a tree` };
    }
  }
  edges.set(id, Object.freeze({ id, relation: relation as BoardRelation, from, to, slot: args.slot }));
  const board = draft.board ?? draft.origin.board ?? createBoardState();
  draft.board = Object.freeze({ version: board.version + 1, edges: Object.freeze(edges) });
  return { ok: true, detail: `${relation}:${from}->${to}` };
}

function handleDisconnectDrain(draft: Draft, args: DisconnectDrainArgs): HandlerVerdict {
  const edgeId = args.edgeId as EntityId; // wire type trusted (parseEntry, M2)
  const board = draft.board ?? draft.origin.board ?? createBoardState();
  if (!board.edges.has(edgeId)) return { ok: false, reason: `unknown-edge: "${edgeId}"` };
  if (draft.drain.enabled) {
    // PHASE 1 of the §7.2 R54 choreography — stop new, let finish. The board
    // is NOT touched here: the edge stays present (and the socket stays
    // occupied — `edge-exists` / `slot-occupied` refuse re-plugs for free,
    // the existing-code reuse decision) until the continuation pulls it when
    // the reservation matures. The pending-disconnect record IS the hand
    // reservation executeEntry minted with cause `drain:<edgeId>` — no
    // BoardState/HandState field was invented to carry it.
    return { ok: true, detail: `drain-started:${edgeId}` };
  }
  const edges = new Map(board.edges);
  edges.delete(edgeId);
  // v0 plain pull (policy OFF — the default law).
  draft.board = Object.freeze({ version: board.version + 1, edges: Object.freeze(edges) });
  return { ok: true, detail: `pulled:${edgeId}` };
}

function handleConfigureNode(draft: Draft, args: ConfigureNodeArgs): HandlerVerdict {
  const nodeId = args.nodeId as EntityId; // wire type trusted (parseEntry, M2)
  if (args.inspectionDepth === null && args.shedOrder === null) {
    return { ok: false, reason: "no-fields: set inspectionDepth and/or shedOrder" };
  }
  if (args.inspectionDepth !== null && !INSPECTION_DEPTHS.includes(args.inspectionDepth)) {
    return { ok: false, reason: `bad-inspection-depth: "${String(args.inspectionDepth)}"` };
  }
  if (args.shedOrder !== null && !SHED_ORDERS.includes(args.shedOrder)) {
    return { ok: false, reason: `bad-shed-order: "${String(args.shedOrder)}"` };
  }
  const nodes = draftNodes(draft);
  const node = nodes.get(nodeId);
  if (node === undefined) return { ok: false, reason: `unknown-node: "${nodeId}"` };
  const detailParts: string[] = [];
  if (args.inspectionDepth !== null) detailParts.push(`depth=${args.inspectionDepth}`);
  if (args.shedOrder !== null) detailParts.push(`shed=${args.shedOrder}`);
  nodes.set(nodeId, Object.freeze({ ...node, ...(args.inspectionDepth !== null ? { inspectionDepth: args.inspectionDepth } : {}), ...(args.shedOrder !== null ? { shedOrder: args.shedOrder } : {}) }));
  draft.nodes = Object.freeze(nodes);
  return { ok: true, detail: detailParts.join(",") };
}

/* ── ruleBookHash derivation (M3) ─────────────────────────────────────────
 * FNV-1a-64, the KERNEL's hash family — same offset basis, prime and
 * codepoint walk as kernel/rng.ts `hashTextFast`, now shared through
 * src/internal/canonical.ts (`fnv1a64OverCodePoints`) instead of a local
 * transcription; that twin stays private in the kernel and rng-reference.ts
 * is test-only by its own header law (no new hash family is introduced).
 * The fold runs over the WHOLE book — code-unit-sorted by card id, hence
 * insertion-order independent — each entry `id␀fingerprint` joined by ␁.
 * The per-card fingerprint mirrors digest.ts's absorb walk (same fields in
 * same order) so "same hash" means "same digested book content". Like every
 * kernel hash this is a deterministic fingerprint, not a cryptographic
 * digest. */

function cardFingerprint(card: PolicyCard): string {
  const parts: string[] = [
    card.id,
    card.scope.kind,
    card.scope.ref ?? "\u2205",
    card.band,
    String(card.upkeepMicroUsd),
  ];
  for (const predicate of card.when) {
    const t = predicate.threshold;
    parts.push(predicate.metric, predicate.comparator, t.kind);
    if (t.kind === "value") parts.push(String(t.amount), t.unit);
    else if (t.kind === "class-ref") parts.push(t.classId);
    else parts.push(t.name);
  }
  for (const action of card.then) {
    parts.push(action.id, action.runbookName ?? "\u2205", String(action.value ?? -1n));
  }
  return fnv1a64OverCodePoints(parts.join("\u0000"));
}

function foldRuleBookHash(book: readonly PolicyCard[]): string {
  const sorted = [...book].sort((a, b) => compareCodeUnits(a.id, b.id));
  return fnv1a64OverCodePoints(sorted.map((card) => `${card.id}\u0000${cardFingerprint(card)}`).join("\u0001"));
}

function handlePolicyCardCommit(draft: Draft, args: PolicyCardCommitArgs): HandlerVerdict {
  const cardHash = args.cardHash; // wire type trusted (parseEntry, M2)
  if (cardHash.length === 0) return { ok: false, reason: "empty-card-hash" };
  if (draft.config.lookupPolicyCard === undefined) {
    return { ok: false, reason: "no-card-lookup: host wired no lookupPolicyCard" };
  }
  const card = draft.config.lookupPolicyCard(cardHash);
  if (card === null || card === undefined) return { ok: false, reason: `unknown-card-hash: "${cardHash}"` };
  requireString(card.id, "lookupPolicyCard result.id");
  const book = [...(draft.ruleBook ?? draft.origin.ruleBook)];
  if (book.some((existing) => existing.id === card.id)) {
    return { ok: false, reason: `card-id-collision: "${card.id}" already committed` };
  }
  book.push(Object.freeze({ ...card }));
  draft.ruleBook = Object.freeze(book);
  // M3: the hash describes the WHOLE BOOK (deterministic fold), never just
  // the last payment — save/ persists ruleBookHash as the book's identity.
  draft.ruleBookHash = foldRuleBookHash(book);
  return { ok: true, detail: `rule=${card.id}` };
}

function handleShedLoad(draft: Draft, args: ShedLoadArgs): HandlerVerdict {
  const nodeId = args.nodeId as EntityId; // wire types trusted (parseEntry, M2)
  const nodes = draft.nodes ?? draft.origin.nodes;
  if (!nodes.has(nodeId)) return { ok: false, reason: `unknown-node: "${nodeId}"` };
  // Directive-only verb (contract scope): the actual shedding stays in step
  // 5's shed order / hard-ceiling logic; this records the player ORDER.
  return { ok: true, detail: args.qosClassId === null ? `node=${nodeId},qos=all-unclassified` : `node=${nodeId},qos=${args.qosClassId}` };
}

function handleCommunicate(draft: Draft, args: CommunicateArgs): HandlerVerdict {
  // wire types trusted (parseEntry, M2): note is a string, target string|null
  if (args.note.length === 0) return { ok: false, reason: "empty-note" };
  if (args.target !== null) {
    const target = args.target as EntityId;
    const nodes = draft.nodes ?? draft.origin.nodes;
    if (!nodes.has(target)) return { ok: false, reason: `unknown-node: "${target}"` };
  }
  return { ok: true, detail: args.target === null ? `estate:"${args.note}"` : `node=${args.target}:"${args.note}"` };
}

function handleToggleSpeed(_draft: Draft, args: ToggleSpeedArgs): HandlerVerdict {
  // speedX is a number by parse law (M2); membership in {1,2,4} is the
  // value-domain question — 2.5, NaN, 0 are refusals, never throws.
  if (!SPEED_VALUES.includes(args.speedX)) {
    return { ok: false, reason: `bad-speed: ${String(args.speedX)} not in {1,2,4}` };
  }
  return { ok: true, detail: `speed=${args.speedX}` };
}

/** OD-24(a) part 1 — the ONLY side effect is one frozen record in the
 *  OPTIONAL `GameState.pricing` book (absent ⇒ every pre-pricing digest is
 *  byte-identical — the same embed law as board/hands). No revenue, no
 *  elasticity, no invoice math: those are the queued part-2/part-3 lanes
 *  READING this book. Wire types are parse-trusted (M2): `newPriceMicroUsd`
 *  is a bigint by law, so fractional prices never exist down here — the
 *  value-domain refusals are positivity (`invalid-price`), target shape, and
 *  a well-formed non-negative business minute. */
function handleAdjustPrice(draft: Draft, args: AdjustPriceArgs): HandlerVerdict {
  const targetKind = args.targetKind;
  if (!PRICE_TARGET_KINDS.includes(targetKind)) {
    return { ok: false, reason: `bad-target-kind: "${String(targetKind)}" not in {${PRICE_TARGET_KINDS.join(",")}}` };
  }
  if (args.targetId.length === 0) return { ok: false, reason: "empty-target-id" };
  if (args.newPriceMicroUsd <= 0n) {
    return { ok: false, reason: `invalid-price: ${String(args.newPriceMicroUsd)} µ$ must be > 0` };
  }
  const effectiveAt = args.effectiveAtBusinessMinute;
  if (effectiveAt !== null && (!Number.isSafeInteger(effectiveAt) || effectiveAt < 0)) {
    return { ok: false, reason: `bad-effective-minute: ${String(effectiveAt)} must be a safe integer >= 0 (or null = now)` };
  }
  const rejection = draft.config.canAdjustPrice?.({ args, state: snapshotFor(draft), context: draft.context });
  if (rejection !== undefined && rejection !== null) {
    // host CALLBACK output stays validated (it is not door-wire input):
    return { ok: false, reason: `unknown-plan: ${requireString(rejection.reason, "canAdjustPrice result.reason")}` };
  }
  const base = draft.pricing ?? draft.origin.pricing ?? createPriceOverrideBook();
  const overrides = new Map(base.overrides);
  overrides.set(
    priceOverrideKey(targetKind, args.targetId as EntityId),
    Object.freeze({
      targetKind,
      targetId: args.targetId as EntityId,
      newPriceMicroUsd: args.newPriceMicroUsd,
      effectiveAtBusinessMinute: effectiveAt,
      setAtTick: draft.context.tick,
    }),
  );
  draft.pricing = Object.freeze({ version: base.version + 1, overrides: Object.freeze(overrides) });
  const detail = `target=${targetKind}:${args.targetId},price=${String(args.newPriceMicroUsd)}`;
  return { ok: true, detail: effectiveAt === null ? detail : `${detail},at=${String(effectiveAt)}` };
}

/** Read-only view of the draft for the placement validator (it must see
 *  devices placed EARLIER in the same tick, never a stale board — and,
 *  F5, never a stale TickContext either: snapshots take the stamped build). */
function snapshotFor(draft: Draft): GameState {
  return buildState(draft, true);
}

/** Freeze the draft into a GameState — unchanged sections keep the ORIGIN's
 *  object identity (the ground-truth audit test relies on it).
 *  `forSnapshot` (F5): the validator's view ALWAYS carries this pass's
 *  context stamp, even when nothing else materialized — with a zero-cost
 *  verb first, the old early-return handed `draft.origin` (PRIOR tick's
 *  context) straight to `query.state`, contradicting W1. Snapshots are
 *  throwaway frozen copies the validator cannot poison; the FINAL door
 *  state still keeps origin identity when nothing applied (identity law). */
function buildState(draft: Draft, forSnapshot = false): GameState {
  if (
    draft.nodes === null && draft.board === null && draft.hands === null &&
    draft.ruleBook === null && draft.ruleBookHash === null && draft.pricing === null
  ) {
    if (!forSnapshot) return draft.origin;
    return Object.freeze({ ...draft.origin, context: draft.context });
  }
  return Object.freeze({
    ...draft.origin,
    // W1 — single fresh-context source: the validator's `query.state.context`
    // must agree with `query.context`. draft.origin carries the PRIOR tick's
    // context; every state this door hands out (snapshots AND the final
    // result) is stamped with this pass's TickContext. Nothing mutates it —
    // the driver still rebuilds its own when it assembles the next state.
    context: draft.context,
    ...(draft.nodes !== null ? { nodes: draft.nodes } : {}),
    ...(draft.board !== null ? { board: draft.board } : {}),
    ...(draft.hands !== null ? { hands: draft.hands } : {}),
    ...(draft.ruleBook !== null ? { ruleBook: draft.ruleBook } : {}),
    ...(draft.ruleBookHash !== null ? { ruleBookHash: draft.ruleBookHash } : {}),
    ...(draft.pricing !== null ? { pricing: draft.pricing } : {}),
  });
}

/* ═══════════════════════════ The door ═══════════════════════════ */

function carrierLabel(payload: PlayerIntent["payload"]): string {
  if (payload.kind === "verb") return `verb:${payload.verb}`;
  if (payload.kind === "slider") return `slider:${payload.control}`;
  return "player-verb";
}

function executeEntry(draft: Draft, entry: ExternalIntent): void {
  const context = draft.context;
  const tick = context.tick;
  const intent = entry.intent;
  const seq = intent.seq;
  const cause: CauseId = asCauseId(`intent:${seq}`);
  const reject = (verbLabel: string, reason: string): void => {
    draft.events.push(
      Object.freeze({
        kind: "intent-refused" as const,
        atUs: context.clocks.simUs,
        tick,
        causeId: cause,
        verb: verbLabel,
        intentSeq: seq,
        reason,
      }),
    );
    draft.receipts.push(Object.freeze({ submittedTick: entry.tick, seq, verb: verbLabel, outcome: "refused" as const, reason }));
  };

  if (intent.payload.kind !== "player-verb") {
    reject(carrierLabel(intent.payload), "unsupported-verb-carrier: the door executes only kind=\"player-verb\" intents");
    return;
  }
  const args = intent.payload.args;
  const verb = args.verb as PlayerVerb; // parseEntry validated membership
  const label = verb;

  // Canonical payment order: HANDS first, then handler semantics — an
  // unaffordable action is refused before its payload is even interpreted.
  const cost = draft.config.handCost?.[verb] ?? DEFAULT_INTENT_HAND_COST[verb];
  const occupancy = draft.config.occupancyTicks?.[verb] ?? DEFAULT_INTENT_OCCUPANCY_TICKS[verb];
  // DRAIN MODE (§7.2 R54): the hand's CAUSE becomes the pending-disconnect
  // record (`drain:<edgeId>` instead of `intent:<seq>`) and the hold covers
  // the drain window (drainTicks SUPERSEDES occupancyTicks for this verb —
  // the pull lands exactly as the token frees; resolveDrainPolicy has already
  // thrown if the host zeroed this verb's cost, so a drain always books a
  // hand). The EVENT keeps its `intent:<seq>` attribution; only the token
  // namespace differs.
  const drainMode = draft.drain.enabled && verb === PlayerVerb.DisconnectDrain;
  const tokenCause: CauseId = drainMode ? drainCause((args as DisconnectDrainArgs).edgeId) : cause;
  let handIndexes: readonly number[] = Object.freeze([]);
  let busyUntilTick = tick;
  let handsSnapshot: HandState | null = null; // pre-occupy draft value for undo
  if (cost > 0) {
    const hands = draftHands(draft, tick);
    const free = freeHandCount(hands);
    if (free < cost) {
      reject(label, `hands-exhausted: need ${cost}, free ${free} of ${hands.capacity}`);
      return;
    }
    if (drainMode && hands.tokens.some((token) => token.busyCauseId === tokenCause)) {
      // A live drain on this edge holds a token (matured ones were just
      // swept by the due-queue pass). Refused BEFORE any spend — the half of
      // "stop new" that says stop NEW disconnects too: one choreography per
      // cable, the second pull order is redundant input.
      reject(label, `edge-draining: "${(args as DisconnectDrainArgs).edgeId}" is already draining — the safe-to-touch pull lands when its reservation frees`);
      return;
    }
    handsSnapshot = draft.hands;
    busyUntilTick = tick + BigInt(drainMode ? draft.drain.drainTicks : occupancy);
    handIndexes = Object.freeze(occupyHands(draft, tick, cost, tokenCause, busyUntilTick));
  }

  const verdict: HandlerVerdict = (() => {
    switch (verb) {
      case PlayerVerb.PlaceDevice:
        return handlePlaceDevice(draft, args as PlaceDeviceArgs);
      case PlayerVerb.ConnectPorts:
        return handleConnectPorts(draft, args as ConnectPortsArgs);
      case PlayerVerb.DisconnectDrain:
        return handleDisconnectDrain(draft, args as DisconnectDrainArgs);
      case PlayerVerb.ConfigureNode:
        return handleConfigureNode(draft, args as ConfigureNodeArgs);
      case PlayerVerb.PolicyCardCommit:
        return handlePolicyCardCommit(draft, args as PolicyCardCommitArgs);
      case PlayerVerb.ShedLoad:
        return handleShedLoad(draft, args as ShedLoadArgs);
      case PlayerVerb.Communicate:
        return handleCommunicate(draft, args as CommunicateArgs);
      case PlayerVerb.ToggleSpeed:
        return handleToggleSpeed(draft, args as ToggleSpeedArgs);
      case PlayerVerb.AdjustPrice:
        return handleAdjustPrice(draft, args as AdjustPriceArgs);
    }
  })();

  if (!verdict.ok) {
    // Undo the reservation by restoring the pre-occupy snapshot: a refusal
    // spends nothing, including not materializing a `hands` slice that was
    // absent on entry (keeps refused-only passes state-identity-stable).
    draft.hands = handsSnapshot;
    reject(label, verdict.reason);
    return;
  }

  draft.events.push(
    Object.freeze({
      kind: "intent-executed" as const,
      atUs: context.clocks.simUs,
      tick,
      causeId: cause,
      verb: label,
      intentSeq: seq,
      handIndexes,
      busyUntilTick,
      detail: verdict.detail,
    }),
  );
  draft.receipts.push(Object.freeze({ submittedTick: entry.tick, seq, verb: label, outcome: "executed" as const, reason: null }));
}

/**
 * Apply the external-intent schedule BEFORE step 1 of `context.tick`
 * (§7.13 canonical position). Pure over GameState: returns a NEW state (or
 * the same object when nothing applied). Order: entries stamped at or before
 * the current tick sort by (tick, seq); future stamps refuse after the due
 * pass, in input order. No RNG, no clock reads, no platform APIs.
 */
export function applyIntentDoor(
  state: GameState,
  context: TickContext,
  externalIntents: readonly ExternalIntent[],
  config: IntentDoorConfig = {},
): IntentDoorResult {
  const draft: Draft = {
    origin: state,
    context,
    config,
    drain: resolveDrainPolicy(config),
    nodes: null,
    board: null,
    hands: null,
    ruleBook: null,
    ruleBookHash: null,
    pricing: null,
    events: [],
    receipts: [],
  };

  // Due-queue BEFORE entries (§7.13 ordering law for the two-phase pull): a
  // drain maturing at this tick pulls its cable FIRST, so entries stamped at
  // the same tick already see the edge safe-to-touch (gone). Continuations
  // mint events, never receipts — receipts stay "one per FED intent".
  processMaturedDrains(draft);

  const due: ExternalIntent[] = [];
  const future: ExternalIntent[] = [];
  // M4 — FEED UNIQUENESS: (tick, seq) is the attribution identity (causeId
  // `intent:<seq>` and receipts key on it). Two entries carrying one stamp in
  // a single feed would execute under ONE causeId — a host programming bug,
  // structural garbage by the same law as wrong wire types, so it throws and
  // names both offending input positions rather than silently double-firing.
  const seenStamp = new Map<string, number>();
  externalIntents.forEach((raw, index) => {
    const entry = parseEntry(raw, index);
    const stampKey = `${entry.tick}|${entry.intent.seq}`;
    const firstIndex = seenStamp.get(stampKey);
    if (firstIndex !== undefined) {
      fail(
        "externalIntents",
        `duplicate (tick, seq) stamp tick=${entry.tick} seq=${entry.intent.seq}: externalIntents[${firstIndex}] and externalIntents[${index}] both carry it — every intent must be fed EXACTLY ONCE per schedule`,
      );
    }
    seenStamp.set(stampKey, index);
    if (entry.tick > context.tick) future.push(entry);
    else due.push(entry);
  });
  due.sort((a, b) => {
    if (a.tick !== b.tick) return a.tick < b.tick ? -1 : 1;
    return a.intent.seq - b.intent.seq;
  });

  for (const entry of due) executeEntry(draft, entry);
  for (const entry of future) {
    const label =
      entry.intent.payload.kind === "player-verb"
        ? (entry.intent.payload.args.verb as string)
        : carrierLabel(entry.intent.payload);
    draft.events.push(
      Object.freeze({
        kind: "intent-refused" as const,
        atUs: context.clocks.simUs,
        tick: context.tick,
        causeId: asCauseId(`intent:${entry.intent.seq}`),
        verb: label,
        intentSeq: entry.intent.seq,
        reason: `stamped-in-future: entry tick ${entry.tick} > current ${context.tick}`,
      }),
    );
    draft.receipts.push(
      Object.freeze({
        submittedTick: entry.tick,
        seq: entry.intent.seq,
        verb: label,
        outcome: "refused" as const,
        reason: `stamped-in-future: entry tick ${entry.tick} > current ${context.tick}`,
      }),
    );
  }

  return Object.freeze({
    state: buildState(draft),
    events: Object.freeze(draft.events),
    receipts: Object.freeze(draft.receipts),
  });
}
