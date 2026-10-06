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
 *  - EXECUTE-OR-REFUSE, NEVER CRASH-BUT-ALSO-NEVER-SILENT: semantic failures
 *    (unknown id, slot taken, power cycle, hands exhausted, unknown card
 *    hash…) become deterministic `intent-refused` events — no RNG is consulted
 *    anywhere here, no state changes, nothing is consumed. STRUCTURAL garbage
 *    (wrong wire TYPES where bigint/string belongs) throws `IntentDoorError`
 *    at the boundary (Law 2 parse-don't-validate + Law 4 fail-fast): a host
 *    feeding malformed wire data has a bug to find, not a game state to fork;
 *  - HANDS ARE PHYSICS (§7.5): every executed intent pays `handCost` tokens
 *    for `occupancyTicks` from `GameState.hands`; refusal never spends hands.
 *    Default occupancies follow the §7.5 reference durations (config change
 *    40s→1 tick, failover 90s→2, cable trace 3min→3; 1 tick = 1 sim-minute);
 *  - SCOPE DISCIPLINE: handlers mutate ONLY their named slice — nodes (place/
 *    configure), board (connect/disconnect), ruleBook (+hash) (commit),
 *    hands+events (everything), events-only (shed-load/communicate/
 *    toggle-speed). units/lanes/observed/cash/ledger/contracts are NEVER
 *    reachable from the door (audit-tested by reference identity);
 *  - GROUND-TRUTH TOPOLOGY STAYS GROUND: `BoardState` is the pipeline-local
 *    structural embed (this module never imports topology/ — the topology
 *    lane's mutable MultiGraph keeps owning blast/domain math; edge ids
 *    follow topology's `defaultEdgeId` convention so hosts correlate views);
 *  - pause-with-orders (§7.13): an entry stamped at the PAUSED tick arrives
 *    at the first unfrozen `advance` and applies then (tick <= current);
 *    future stamps are refused loudly, so "the whole schedule at once" host
 *    patterns fail visible instead of smearing across ticks. Each intent is
 *    fed EXACTLY ONCE (ambient-input contract, same as envelopes/evidence).
 */

import type {
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
  PLAYER_VERBS,
  PlayerVerb,
} from "../types.ts";
import { MICROS_PER_MIN } from "../kernel/time.ts";
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
  /** policy-card-commit resolver: maps the payload hash to the authored card.
   *  Absent → commits refuse with "no-card-lookup". */
  readonly lookupPolicyCard?: (cardHash: string) => PolicyCard | null;
  /** Skeleton NodeRecord knobs for placed devices. */
  readonly deviceSlots?: number;
  readonly deviceServiceTimeUs?: SimTimeUs;
  readonly deviceInspectionDepth?: InspectionDepth;
  readonly deviceShedOrder?: ShedOrder;
  readonly deviceDiscipline?: NodeDiscipline;
}

/** §7.5 reference durations, rounded UP to whole sim-minute ticks:
 *  config change 40s → 1 · failover 90s → 2 · cable trace 3 min → 3.
 *  "duration vs attendance" is COLLAPSED to one window in v0 (attendance ==
 *  duration): the unattended-job split (RAID 19h/0 hands) needs a scheduler
 *  the door does not own — reported as a seam for the receipt-engine twist. */
export const DEFAULT_INTENT_OCCUPANCY_TICKS: Readonly<Record<PlayerVerb, number>> = Object.freeze({
  [PlayerVerb.PlaceDevice]: 3,
  [PlayerVerb.ConnectPorts]: 3,
  [PlayerVerb.DisconnectDrain]: 2,
  [PlayerVerb.ConfigureNode]: 1,
  [PlayerVerb.PolicyCardCommit]: 1,
  [PlayerVerb.ShedLoad]: 2,
  [PlayerVerb.Communicate]: 2,
  [PlayerVerb.ToggleSpeed]: 0,
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
});

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
  /** Same object identity when NOTHING applied (no intents / all refused). */
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

/* ═══════════════════════════ Door internals (mutable draft) ═══════════════ */

interface Draft {
  readonly origin: GameState;
  readonly context: TickContext;
  readonly config: IntentDoorConfig;
  nodes: ReadonlyMap<EntityId, NodeRecord> | null;
  board: BoardState | null;
  hands: HandState | null;
  ruleBook: readonly PolicyCard[] | null;
  ruleBookHash: string | null;
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

/** Boundary parse (Law 2): validate WIRE TYPES of one fed entry; a pass here
 *  means the entry is well-formed, NOT that it will execute (semantics are
 *  the handlers' refusal space). */
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
  const nodeId = requireString(args.nodeId, "place-device.args.nodeId");
  if (nodeId.length === 0) return { ok: false, reason: "empty-node-id" };
  const devices = draftNodes(draft);
  if (devices.has(nodeId as EntityId)) {
    return { ok: false, reason: `node-exists: "${nodeId}"` };
  }
  requireString(args.deviceKind, "place-device.args.deviceKind");
  if (args.deviceKind.length === 0) return { ok: false, reason: "empty-device-kind" };
  if (args.template !== null) requireString(args.template, "place-device.args.template");
  const rejection = draft.config.canPlaceDevice?.({ args, state: snapshotFor(draft), context: draft.context });
  if (rejection !== undefined && rejection !== null) {
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
  const relation = requireString(args.relation, "connect-ports.args.relation");
  if (!RELATIONS.includes(relation as BoardRelation)) {
    return { ok: false, reason: `bad-relation: "${relation}" not in {${RELATIONS.join(",")}}` };
  }
  const from = requireString(args.from, "connect-ports.args.from") as EntityId;
  const to = requireString(args.to, "connect-ports.args.to") as EntityId;
  if (args.slot !== null) {
    requireString(args.slot, "connect-ports.args.slot");
    if (args.slot.length === 0) return { ok: false, reason: "empty-slot" };
  }
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
  const edgeId = requireString(args.edgeId, "disconnect-drain.args.edgeId") as EntityId;
  const board = draft.board ?? draft.origin.board ?? createBoardState();
  if (!board.edges.has(edgeId)) return { ok: false, reason: `unknown-edge: "${edgeId}"` };
  const edges = new Map(board.edges);
  edges.delete(edgeId);
  // v0 = plain pull; graceful drain (evacuate in-flight before unlink) binds
  // to the serve step's slot ledger — reported seam, never implicit.
  draft.board = Object.freeze({ version: board.version + 1, edges: Object.freeze(edges) });
  return { ok: true, detail: `pulled:${edgeId}` };
}

function handleConfigureNode(draft: Draft, args: ConfigureNodeArgs): HandlerVerdict {
  const nodeId = requireString(args.nodeId, "configure-node.args.nodeId") as EntityId;
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

function handlePolicyCardCommit(draft: Draft, args: PolicyCardCommitArgs): HandlerVerdict {
  const cardHash = requireString(args.cardHash, "policy-card-commit.args.cardHash");
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
  draft.ruleBookHash = cardHash;
  return { ok: true, detail: `rule=${card.id}` };
}

function handleShedLoad(draft: Draft, args: ShedLoadArgs): HandlerVerdict {
  const nodeId = requireString(args.nodeId, "shed-load.args.nodeId") as EntityId;
  const nodes = draft.nodes ?? draft.origin.nodes;
  if (!nodes.has(nodeId)) return { ok: false, reason: `unknown-node: "${nodeId}"` };
  if (args.qosClassId !== null) requireString(args.qosClassId, "shed-load.args.qosClassId");
  // Directive-only verb (contract scope): the actual shedding stays in step
  // 5's shed order / hard-ceiling logic; this records the player ORDER.
  return { ok: true, detail: args.qosClassId === null ? `node=${nodeId},qos=all-unclassified` : `node=${nodeId},qos=${args.qosClassId}` };
}

function handleCommunicate(draft: Draft, args: CommunicateArgs): HandlerVerdict {
  if (args.note.length === 0) return { ok: false, reason: "empty-note" };
  requireString(args.note, "communicate.args.note");
  if (args.target !== null) {
    const target = requireString(args.target, "communicate.args.target") as EntityId;
    const nodes = draft.nodes ?? draft.origin.nodes;
    if (!nodes.has(target)) return { ok: false, reason: `unknown-node: "${target}"` };
  }
  return { ok: true, detail: args.target === null ? `estate:"${args.note}"` : `node=${args.target}:"${args.note}"` };
}

function handleToggleSpeed(_draft: Draft, args: ToggleSpeedArgs): HandlerVerdict {
  const speed = args.speedX as number;
  if (typeof speed !== "number" || !Number.isSafeInteger(speed) || !SPEED_VALUES.includes(speed)) {
    return { ok: false, reason: `bad-speed: ${String(args.speedX)} not in {1,2,4}` };
  }
  return { ok: true, detail: `speed=${speed}` };
}

/** Read-only view of the draft for the placement validator (it must see
 *  devices placed EARLIER in the same tick, never a stale board). */
function snapshotFor(draft: Draft): GameState {
  return buildState(draft);
}

/** Freeze the draft into a GameState — unchanged sections keep the ORIGIN's
 *  object identity (the ground-truth audit test relies on it). */
function buildState(draft: Draft): GameState {
  if (draft.nodes === null && draft.board === null && draft.hands === null && draft.ruleBook === null && draft.ruleBookHash === null) {
    return draft.origin;
  }
  return Object.freeze({
    ...draft.origin,
    ...(draft.nodes !== null ? { nodes: draft.nodes } : {}),
    ...(draft.board !== null ? { board: draft.board } : {}),
    ...(draft.hands !== null ? { hands: draft.hands } : {}),
    ...(draft.ruleBook !== null ? { ruleBook: draft.ruleBook } : {}),
    ...(draft.ruleBookHash !== null ? { ruleBookHash: draft.ruleBookHash } : {}),
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
    handsSnapshot = draft.hands;
    busyUntilTick = tick + BigInt(occupancy);
    handIndexes = Object.freeze(occupyHands(draft, tick, cost, cause, busyUntilTick));
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
    nodes: null,
    board: null,
    hands: null,
    ruleBook: null,
    ruleBookHash: null,
    events: [],
    receipts: [],
  };

  const due: ExternalIntent[] = [];
  const future: ExternalIntent[] = [];
  externalIntents.forEach((raw, index) => {
    const entry = parseEntry(raw, index);
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
