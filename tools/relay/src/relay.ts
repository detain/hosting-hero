/**
 * CO-OP NODE RELAY — SPIKE (ADR-0014 #D6), WIRE MECHANICS LANDED 2026-10-16.
 *
 * What this is: an IN-PROCESS hub that plays the role the future PHP/Workerman
 * transport will play — the single server-side authority that (1) keeps the
 * ADR-0013 ruling-2 SEAT LEDGER (save/coop law: 1–4 concurrent writers,
 * half-open [joined,left) tenure rows, same-tick joins in canonical
 * participantId order, re-join as a NEW disjoint tenure row), (2) STAMPS every
 * timeline record with a globally-unique (tick, seq) pair per the
 * replay/coopTimeline law, (3) BROADCASTS the stamped log to every seat, and
 * (4) delivers joiner history through deterministic stamp-range PAGES. Seats
 * may receive records in any arrival order; `feedFor()` normalizes via
 * `orderCoopTimeline` and re-exports the action arm as the exact
 * `ExternalIntent[]` shape the intent door eats — carrying payloads OPAQUELY:
 * the door's parseEntry (VERB_ARG_SHAPES, M2) is the sole arg-parsing
 * authority, the relay only enforces its own structural boundary.
 *
 * What this is NOT: not a network layer, not shipped multiplayer, not an
 * adoption — MODULE-STATUS transport row (future) deliberately stays "future".
 * The relay never touches the sim; a separate runner.ts drives applyIntentDoor.
 * The spike's falsifiable claim (test/relay.runners.test.ts): two independent
 * runners fed the SAME relay-stamped feed, delivered in DIFFERENT arrival
 * orders and normalized, produce equal per-frame AND terminal digestState.
 *
 * Law surfaces honored here:
 *  - save/coop.ts       → seat ledger validation (canonical same-tick joins,
 *                         re-join-as-new-row tenures), seatParticipant/
 *                         vacateSeat, participantSeatedAt per-tenure (ghost-
 *                         intent refusal), MIN_WRITERS history posture.
 *  - replay/coopTimeline.ts → parseCoopTimelineRecord boundary (every submit
 *                         passes the strict parser), the (tick, seq) append
 *                         law (upheld ONE-PASS per append — see R3 below —
 *                         with the upstream whole-log assert kept as the
 *                         boundary equivalence check in tests),
 *                         orderCoopTimeline normalization,
 *                         digestCoopTimeline interleaving invariance.
 *  - intent-door M4     → (tick, seq) uniqueness is exactly what the relay
 *                         stamps, so a normalized feed can never trip the
 *                         door's dup throw.
 *
 * WIRE MECHANICS LANDED 2026-10-16 (lane T-R, owner session-6 ruling; the
 * four debts the L-RH hardening left listed in README "wire mechanics"):
 *
 *  R1 — PER-SEAT SEQ STREAMS. Every seat owns a strictly-increasing seq
 *       stream; the hub realizes the streams through a SINGLE LIFETIME-
 *       MONOTONIC NUMBERING (the per-tick reset is retired — advanceTo
 *       consumes nothing). Each seat's stream is the subsequence of stamps
 *       bearing its participantId: strictly increasing, submission-ordered.
 *       Why not seat-independent counters (each seat 0,1,2,…)? The upstream
 *       laws key on (tick, seq) IGNORING participantId — orderCoopTimeline
 *       (replay/coopTimeline.ts, "claimed by two records") and the door's M4
 *       (pipeline/intent-door.ts, "duplicate (tick, seq) stamp") both refuse
 *       the first same-tick cross-seat pair. So the SHARED LOG's global
 *       (tick, seq) uniqueness law is PRESERVED, and the composition is
 *       tie-free BY CONSTRUCTION: seq values never repeat anywhere in the
 *       log, so (tick, seq) pairs cannot, and within a tick the stamp order
 *       IS submission order — the hand-contention law is unchanged.
 *  R2 — PAYLOAD OPAACITY UNTIL THE DOOR. The relay's structural boundary for
 *       an action is: `payload.args` is a plain object whose `verb` is a
 *       STRING INSIDE the closed PLAYER_VERBS enum (./types). Nothing deeper
 *       is inspected — any door-shaped intent (all ten verbs, unknown extra
 *       fields included) is stamped, ordered, broadcast, and re-exported
 *       byte-identical; the door parses, the door refuses (receipts), and
 *       structural wire garbage is the door's OWN throw. The three per-verb
 *       builders survive as the exported seat-side convenience API
 *       (`RELAY_ACTION_BUILDERS`), decoupled from feed composition.
 *  R3 — ONE-PASS APPEND SELF-CHECK. `submit` validates the append with
 *       `assertRelayAppendStep` (previous-vs-next, mirroring the upstream
 *       message grammar) instead of re-scanning the whole log per append —
 *       O(1) per submit, O(n) per run, replacing the O(n²) self-audit.
 *  R4 — PAGED CATCH-UP. Joiner delivery runs through `pageCoopLog`, a PURE
 *       function of the log over stamp range (from, →], limit records; page
 *       boundaries are immutable once the seat's lastSeen advances
 *       (strictly-after law), and R1's never-repeating seq means log growth
 *       can never re-sort a previously delivered window — re-pages are
 *       byte-stable and a resume mid-page-set ends with the identical inbox.
 *
 * Earlier hardening (lane L-RH, owner session-5 agenda (e)): the four LAW
 * frictions the D6 spike left open are RESOLVED in-repo — (1) same-tick joins
 * land in canonical (tick, participantId code-unit) ledger order; (2) re-join
 * is a NEW tenure row per ADR-0014 #D6, windows resolved per tenure; (3) mid-
 * run joiners and re-joiners get relay-side catch-up delivery of the shared
 * log (timeline records only — still zero save writes, v0 incident-room law
 * @10f05fb); (4) the guard's MIN_WRITERS leg is RATIFIED as the recorded-
 * writers history law. The @24426ec departed-seat broadcast filter stands.
 * This is still spike-grade hardening, not the shipped transport.
 *
 * Determinism law: no Math.random / Date.now / new Date / Intl / performance
 * anywhere — the relay clock is advanced by its host, values are bigint/int.
 */

import { asEntityId, PLAYER_VERBS, PlayerVerb } from "@hh/sim-core/types";
import type {
  CommunicateArgs,
  ConnectPortsArgs,
  EntityId,
  ExternalIntent,
  HashHex,
  PlaceDeviceArgs,
  PlayerVerbArgs,
  SimTick,
} from "@hh/sim-core/types";
import { minutesToSimUs } from "@hh/sim-core/kernel";
import {
  digestCoopTimeline,
  orderCoopTimeline,
  parseCoopTimelineRecord,
} from "@hh/sim-core/replay";
import type { CoopTimelineKind, CoopTimelineRecord } from "@hh/sim-core/replay";
import {
  participantSeatedAt,
  seatParticipant,
  vacateSeat,
} from "@hh/sim-core/save";
import type { CoopNodeMetadata, SeatHolder } from "@hh/sim-core/save";

/** Relay failures wear the house grammar `relay[CODE]: detail`. */
export class RelayError extends Error {
  constructor(code: string, detail: string) {
    super(`relay[${code}]: ${detail}`);
    this.name = "RelayError";
  }
}

/** One seat's registration line at construction time. */
export interface RelaySeatSpec {
  readonly participantId: string;
  readonly joinedAtTick: SimTick;
}

/** Default records per catch-up page (R4). A transport picks its own window
 *  size per request; in-process join loops page to completion with this. */
export const DEFAULT_CATCH_UP_PAGE_SIZE = 8;

export interface CoopRelayOptions {
  readonly seats?: readonly RelaySeatSpec[];
  /** R4: records per page for the join-driven catch-up loop. */
  readonly catchUpPageSize?: number;
  /**
   * R4: L-RH law 3 default TRUE — `joinSeat` runs the page loop to
   * completion synchronously. A wire transport sets this false to pump the
   * same windows itself over its own latency budget via `catchUpPage`
   * (mid-page-set drops then resume — the pure page law makes the final
   * inbox identical either way, which is exactly what the tests pin).
   */
  readonly autoCatchUpOnJoin?: boolean;
}

/** A position in the shared log: the (tick, seq) pair the coopTimeline law
 *  makes globally unique. Catch-up pages are ranges over stamps. */
export interface RelayStamp {
  readonly tick: SimTick;
  readonly seq: number;
}

/** The action-arm payload envelope a seat submits: { args: <door args wire> }.
 *  R2: nothing inside `args` beyond the verb's enum membership is the relay's
 *  business — the door's VERB_ARG_SHAPES parse is the sole authority. */
export interface RelayActionPayload {
  readonly args: Readonly<Record<string, unknown>>;
}

export interface CoopRelay {
  /** Current relay stamp clock (advanced only by the host via advanceTo). */
  tick(): SimTick;
  /** Monotonic clock: moving backwards throws (the stamp authority's word).
   *  R1: advancing consumes NOTHING from the seq stream — it never resets. */
  advanceTo(tick: SimTick): void;
  /** Seat a writer at the CURRENT tick (server-side join delivery).
   *  Same-tick joins are legal (canonical participantId code-unit order,
   *  L-RH law 1); a re-handoff after leaveSeat adds a NEW tenure row
   *  (L-RH law 2, ADR-0014 #D6 "re-join-as-new-row"). The seat's inbox is
   *  immediately caught up with the shared log it missed — relay-side
   *  catch-up (L-RH law 3) delivered through the R4 page loop; no save
   *  writes. */
  joinSeat(participantId: string): CoopNodeMetadata;
  /** End a tenure at the CURRENT tick (half-open [joined,left)). */
  leaveSeat(participantId: string): CoopNodeMetadata;
  /** The validated seat ledger (live view — frozen rows). */
  ledger(): CoopNodeMetadata;
  isSeated(participantId: string, tick?: SimTick): boolean;
  /**
   * Stamp + append + broadcast one record. Ghost seats are refused at the
   * door of the relay (participantSeatedAt over the half-open window), the
   * seq is the next stamp of the R1 lifetime-monotonic stream (every seat's
   * own subsequence strictly increases; no seq ever repeats), the action
   * envelope is checked ONLY structurally (R2 — verb inside PLAYER_VERBS,
   * contents opaque), and every append is self-checked ONE-PASS against the
   * (tick, seq) append law (R3).
   */
  submit(
    participantId: string,
    kind: CoopTimelineKind,
    payload: Readonly<Record<string, unknown>>,
  ): CoopTimelineRecord;
  /** The shared log in stamp order (append-only, frozen snapshot). */
  sharedLog(): readonly CoopTimelineRecord[];
  /** What a given seat received, IN ARRIVAL ORDER (transport may shuffle). */
  inbox(participantId: string): readonly CoopTimelineRecord[];
  /** Interleaving-invariant digest over the shared log (coopTimeline law). */
  timelineDigest(): HashHex;
  /** R4: how many shared-log records sit strictly after the seat's lastSeen
   *  stamp — 0 exactly when the seat's inbox already holds full history. */
  pendingCatchUp(participantId: string): number;
  /**
   * R4: deliver the NEXT catch-up page (up to `limit` records, default the
   * configured page size) into the seat's inbox and return it. Requires an
   * OPEN tenure (the @24426ec freeze holds on this path: departed seats
   * page nothing). The page is the head of `pageCoopLog(log, lastSeen, limit)`
   * — a pure function of the log — so resuming a page set after any drop
   * continues strictly-after the seat's own lastSeen and ends with the
   * identical inbox. The lastSeen law (strictly-after, dup-never-twice) is
   * the same L-RH law 3 cursor.
   */
  catchUpPage(participantId: string, limit?: number): readonly CoopTimelineRecord[];
  /**
   * Normalize a seat's inbox to the canonical stamped feed the door consumes:
   * orderCoopTimeline (dup (tick,seq) throws) → action arm → ExternalIntent[].
   * Action payloads pass through OPAQUE (R2); the door is the parse authority.
   */
  feedFor(participantId: string): readonly ExternalIntent[];
  /** Normalize an arbitrary (possibly shuffled) record list to a door feed. */
  feedFrom(records: readonly CoopTimelineRecord[]): readonly ExternalIntent[];
}

/* ─────────────────────────── stamp + page law (R1, R4) ─────────────────────────── */

/** Shared-log stamp comparison: tick asc, then seq asc — the same total order
 *  replay/coopTimeline.ts uses (participantId is NOT part of the key, which
 *  is exactly why R1 keeps one global numbering instead of per-seat counters). */
export function compareRelayStamps(a: RelayStamp, b: RelayStamp): number {
  if (a.tick !== b.tick) return a.tick < b.tick ? -1 : 1;
  return a.seq - b.seq;
}

/** Strict-after: the catch-up window opens EXCLUSIVE at `after` (L-RH law 3
 *  cursor — a seat's own lastSeen is never delivered twice). */
export function isStampAfter(stamp: RelayStamp, after: RelayStamp | undefined): boolean {
  return after !== undefined ? compareRelayStamps(stamp, after) > 0 : true;
}

/**
 * R4 — PURE CATCH-UP PAGE. The next `limit` records of `records` that sit
 * strictly after stamp `after`, in canonical (tick, seq) order (dup stamps
 * throw via the upstream normalizer — the same collision law every consumer
 * assumes). Because relay stamps carry a never-repeating seq (R1), records
 * appended later can only sort AFTER an already-delivered window: the page
 * for (logPrefix, after, limit) is byte-stable across re-requests, and any
 * sequence of pages that resumes at the seat's lastSeen covers the tail
 * exactly once.
 */
export function pageCoopLog(
  records: readonly CoopTimelineRecord[],
  after: RelayStamp | undefined,
  limit: number,
): readonly CoopTimelineRecord[] {
  if (!Number.isSafeInteger(limit) || limit < 1) {
    throw new RelayError("bad-page-size", `page limit must be a safe integer ≥ 1, got ${String(limit)}`);
  }
  const pending = after === undefined ? records : records.filter((record) => isStampAfter(record, after));
  return orderCoopTimeline(pending).slice(0, limit);
}

/**
 * R3 — ONE-PASS APPEND SELF-CHECK. Validates ONLY the previous-vs-next pair
 * at the append boundary (the whole-log scan was O(n) per submit → O(n²) per
 * run; under R1's monotonic numbering the local step IS the whole law).
 * Messages mirror `assertCoopTimelineAppendOrder`'s grammar verbatim (M4
 * precedent: a duplicated pair names BOTH positions), so a relay-side refusal
 * reads exactly like the upstream law it enforces. Unreachable while the hub
 * stamps its own monotonic stream — kept as the tripwire against relay bugs,
 * and falsifiable directly (see test/relay.law.test.ts).
 */
export function assertRelayAppendStep(log: readonly CoopTimelineRecord[], next: RelayStamp): void {
  if (log.length === 0) return;
  const prevIndex = log.length - 1;
  const prev = log[prevIndex] as CoopTimelineRecord;
  const positions = `${prevIndex} and ${log.length}`;
  const cmp = compareRelayStamps(next, prev);
  if (cmp === 0) {
    throw new RelayError(
      "append-order",
      `coop timeline: (${next.tick}, ${next.seq}) appears at both positions ${positions} — (tick, seq) must be unique in the shared log`,
    );
  }
  if (cmp < 0) {
    throw new RelayError(
      "append-order",
      `coop timeline: record ${log.length} (${next.tick}, ${next.seq}) sorts before record ${prevIndex} (${prev.tick}, ${prev.seq}) — append order violated`,
    );
  }
}

/* ───────────────────────── action convenience builders (R2) ───────────────────────── */

/** Seat-side convenience only (R2): builders mint the three action arms the
 *  spike's runners exercise, pre-validated for ergonomics. The relay itself
 *  NO LONGER parses through these on the feed path — verbs outside the set
 *  ride opaquely to the door, which is the actual arg authority. Widening is
 *  mechanical; inventing silent passthrough is not. */
export const RELAY_ACTION_BUILDERS: Readonly<
  Record<string, (args: Readonly<Record<string, unknown>>) => PlayerVerbArgs>
> = {
  [PlayerVerb.PlaceDevice]: (args) => ({
    verb: PlayerVerb.PlaceDevice,
    nodeId: asEntityId(requireBuilderString(args, "nodeId")),
    deviceKind: requireBuilderString(args, "deviceKind"),
    template: optionalStringOrNull(args, "template"),
  } satisfies PlaceDeviceArgs),
  [PlayerVerb.ConnectPorts]: (args) => ({
    verb: PlayerVerb.ConnectPorts,
    relation: requireRelation(args),
    from: asEntityId(requireBuilderString(args, "from")),
    to: asEntityId(requireBuilderString(args, "to")),
    slot: optionalStringOrNull(args, "slot"),
  } satisfies ConnectPortsArgs),
  [PlayerVerb.Communicate]: (args) => ({
    verb: PlayerVerb.Communicate,
    target: args.target === null ? null : asEntityId(requireBuilderString(args, "target")),
    note: requireBuilderString(args, "note"),
  } satisfies CommunicateArgs),
};

function requireBuilderString(args: Readonly<Record<string, unknown>>, key: string): string {
  const value = args[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new RelayError("bad-action", `args.${key} must be a non-empty string`);
  }
  return value;
}

function optionalStringOrNull(args: Readonly<Record<string, unknown>>, key: string): string | null {
  const value = args[key];
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") {
    throw new RelayError("bad-action", `args.${key} must be a string or null`);
  }
  return value;
}

const RELATIONS = ["data", "power", "control", "trust"] as const;

function requireRelation(args: Readonly<Record<string, unknown>>): (typeof RELATIONS)[number] {
  const value = args.relation;
  if (typeof value !== "string" || !(RELATIONS as readonly string[]).includes(value)) {
    throw new RelayError("bad-action", `args.relation "${String(value)}" outside board grammar`);
  }
  return value as (typeof RELATIONS)[number];
}

/* ─────────────────────── boundary parse + action envelope (R2) ─────────────────────── */

const DOOR_VERB_SET: ReadonlySet<string> = new Set<string>(PLAYER_VERBS);

/** R2 structural boundary — the relay's ENTIRE say about an action payload:
 *  `payload.args` must be a plain object and `args.verb` a string inside the
 *  closed PLAYER_VERBS enum. That is what "PlayerVerbPayload-shaped" means at
 *  this layer; every per-field wire type is the door's parseEntry business
 *  (intent-door M2), and value-domain problems are its refusal receipts. */
function assertActionEnvelope(payload: Readonly<Record<string, unknown>>, where: string): void {
  const args = payload.args;
  if (typeof args !== "object" || args === null || Array.isArray(args)) {
    throw new RelayError("bad-action", `${where}: action payload needs an 'args' object at 'payload.args'`);
  }
  const verb = (args as Readonly<Record<string, unknown>>).verb;
  if (typeof verb !== "string" || !DOOR_VERB_SET.has(verb)) {
    throw new RelayError(
      "bad-action",
      `${where}: args.verb ${JSON.stringify(verb)} is not a PlayerVerb — the relay carries only door-shaped intents`,
    );
  }
}

function recordToExternalIntent(record: CoopTimelineRecord): ExternalIntent {
  if (record.kind !== "action") {
    throw new RelayError("bad-kind", `only 'action' records enter the door feed, got '${record.kind}'`);
  }
  assertActionEnvelope(record.payload, `relay.feed(${record.tick}:${record.seq})`);
  // 1 tick = 1 sim minute (kernel/time DEFAULT_TICK_US) — the relay stamps
  // sim-clock intents; business-clock intents are a transport-lane question.
  const atUs = minutesToSimUs(record.tick);
  return {
    tick: record.tick,
    intent: {
      seq: record.seq,
      clock: "sim",
      atUs,
      origin: "player",
      // R2: the args dict rides BYTE-IDENTICAL into the door payload — the
      // coopTimeline parser already proved payload (and here the envelope)
      // structural; the door owns everything deeper.
      payload: {
        kind: "player-verb",
        args: record.payload.args as PlayerVerbArgs,
      },
    },
  };
}

/* ─────────────────────────────── the relay ─────────────────────────────── */

export function createCoopRelay(options: CoopRelayOptions = {}): CoopRelay {
  const pageSize = options.catchUpPageSize ?? DEFAULT_CATCH_UP_PAGE_SIZE;
  if (!Number.isSafeInteger(pageSize) || pageSize < 1) {
    throw new RelayError("bad-page-size", `catchUpPageSize must be a safe integer ≥ 1, got ${String(pageSize)}`);
  }
  const autoCatchUpOnJoin = options.autoCatchUpOnJoin ?? true;
  let currentTick: SimTick = 0n;
  // R1: the LIFETIME-MONOTONIC seq numbering. Never reset — advanceTo
  // consumes nothing. Each seat's stream is the strictly-increasing
  // subsequence of stamps bearing its participantId.
  let nextSeq = 0;
  let ledger: CoopNodeMetadata | undefined;
  const log: CoopTimelineRecord[] = [];
  const inboxes = new Map<EntityId, CoopTimelineRecord[]>();

  function requireLedger(): CoopNodeMetadata {
    if (ledger === undefined) {
      throw new RelayError("no-seats", "the relay seats at least one writer before timeline traffic");
    }
    return ledger;
  }

  function openInbox(participantId: EntityId): CoopTimelineRecord[] {
    let inbox = inboxes.get(participantId);
    if (inbox === undefined) {
      inbox = [];
      inboxes.set(participantId, inbox);
    }
    return inbox;
  }

  function broadcast(record: CoopTimelineRecord): void {
    // Fan-out is over CURRENT seats only: a departed row (leftAtTick set) is
    // skipped, so that writer's inbox freezes at vacate — it survives as
    // history (what they saw while seated) and never grows again.
    // The @24426ec law stands; mid-run joiners and re-joiners are served by
    // deliverCatchUp (L-RH law 3 via R4 pages), not by widening this fan-out.
    for (const seat of requireLedger().seatHolders) {
      if (seat.leftAtTick !== undefined) continue; // departed: inbox is history
      openInbox(seat.participantId).push(record);
    }
  }

  /** Highest (tick, seq) a seat's inbox already holds — scan, never trust
   *  array tail: the inbox is arrival-ordered by contract. */
  function lastSeenStamp(
    rows: readonly CoopTimelineRecord[],
  ): RelayStamp | undefined {
    let max: RelayStamp | undefined;
    for (const row of rows) {
      if (max === undefined || compareRelayStamps(row, max) > 0) max = { tick: row.tick, seq: row.seq };
    }
    return max;
  }

  /**
   * L-RH law 3 (via R4) — JOINER CATCH-UP, relay-side only (the v0
   * incident-room law @10f05fb keeps the relay out of save state; this
   * delivers timeline records, never save writes). A seat joining mid-run
   * receives the shared log as of the join tick; a RE-JOINER whose inbox
   * froze at vacate receives only the tail strictly after the last stamp
   * they hold — so no record can be delivered twice (a duplicate stamp would
   * trip orderCoopTimeline's collision law at the first feedFor). Each page
   * passes through `pageCoopLog` (pure, canonical), and the join path loops
   * pages to completion — identical inbox to a whole-tail push, because the
   * windows partition the ordered tail. The inbox is frozen history plus that
   * tail, and feedFor re-normalizes at consumption.
   */
  function deliverCatchUp(pid: EntityId): void {
    for (;;) {
      const page = catchUpPageOf(pid, pageSize);
      if (page.length === 0) return;
    }
  }

  function catchUpPageOf(pid: EntityId, limit: number): readonly CoopTimelineRecord[] {
    // R4/freeze law: the catch-up channel OPENS with a tenure — a departed
    // seat pages nothing (its inbox is history, @24426ec stands on this path
    // too). The pure `pageCoopLog` stays open to any host as a read window.
    if (ledger === undefined || !participantSeatedAt(ledger, pid, currentTick)) {
      throw new RelayError(
        "not-seated",
        `"${pid}" has no seat at tick ${currentTick} — catch-up pages flow only while a tenure is open`,
      );
    }
    const inbox = openInbox(pid);
    const page = pageCoopLog(log, lastSeenStamp(inbox), limit);
    for (const record of page) inbox.push(record);
    return page;
  }

  function stamp(participantId: EntityId, kind: CoopTimelineKind, payload: Readonly<Record<string, unknown>>): CoopTimelineRecord {
    // The strict coopTimeline parser is the relay's own boundary door: bad
    // kinds or payloads never enter the log (parse don't validate, S-1 shape).
    // R1: a refused submit consumes NOTHING — the lifetime stream stays
    // gap-free because the counter only advances once the stamp is real.
    const seq = nextSeq;
    const parsed = parseCoopTimelineRecord(
      { participantId, tick: currentTick, seq, kind, payload },
      `relay.submit(${participantId})`,
    );
    nextSeq += 1;
    return Object.freeze(parsed);
  }

  return {
    tick: () => currentTick,

    advanceTo(tick: SimTick): void {
      if (tick < currentTick) {
        throw new RelayError("clock-went-back", `relay stamps ${currentTick}, refuses to rewind to ${tick}`);
      }
      // R1: the clock and the stream are independent — advancing time does
      // NOT reset the seq numbering (the retired per-tick reset was the old
      // global-per-tick policy the owner ruling replaced).
      currentTick = tick;
    },

    joinSeat(participantId: string): CoopNodeMetadata {
      const seat: SeatHolder = {
        participantId: asEntityId(participantId),
        joinedAtTick: currentTick,
      };
      ledger = seatParticipant(ledger, seat); // canonical insert + whole-ledger re-validation
      if (autoCatchUpOnJoin) {
        deliverCatchUp(seat.participantId); // L-RH law 3 (R4 pages): history up to the join tick
      }
      // autoCatchUpOnJoin=false (R4, wire transports): the tenure opens dry
      // and the host pumps `catchUpPage` itself — resume mid-page-set ends
      // with the identical inbox (pinned in tests), which is the whole point
      // of the page window being a pure function of the log.
      return ledger;
    },

    leaveSeat(participantId: string): CoopNodeMetadata {
      ledger = vacateSeat(requireLedger(), asEntityId(participantId), currentTick);
      return ledger;
    },

    ledger(): CoopNodeMetadata {
      return requireLedger();
    },

    isSeated(participantId: string, tick: SimTick = currentTick): boolean {
      if (ledger === undefined) return false;
      return participantSeatedAt(ledger, asEntityId(participantId), tick);
    },

    submit(
      participantId: string,
      kind: CoopTimelineKind,
      payload: Readonly<Record<string, unknown>>,
    ): CoopTimelineRecord {
      const pid = asEntityId(participantId);
      if (!this.isSeated(pid)) {
        throw new RelayError("not-seated", `"${participantId}" has no seat at tick ${currentTick} — ghost intents are refused at the relay`);
      }
      if (kind === "action") {
        // R2 boundary: shape ONLY (args dict + verb inside PLAYER_VERBS).
        // Per-field wire types are the door's parse authority at apply time;
        // the relay's pre-flight stops structurally-invalid wire from
        // polluting the shared log, nothing more.
        assertActionEnvelope(payload, `relay.submit(${participantId})`);
      }
      const record = stamp(pid, kind, payload);
      // R3: one-pass prev-vs-next step check (upstream-message grammar),
      // replacing the O(n) whole-log scan per append. The whole-log audit
      // stays available (and is pinned in tests via the upstream assert) as
      // the boundary equivalence check.
      assertRelayAppendStep(log, record);
      log.push(record);
      broadcast(record);
      return record;
    },

    sharedLog(): readonly CoopTimelineRecord[] {
      return Object.freeze([...log]);
    },

    inbox(participantId: string): readonly CoopTimelineRecord[] {
      const rows = inboxes.get(asEntityId(participantId));
      return Object.freeze([...(rows ?? [])]);
    },

    timelineDigest(): HashHex {
      return digestCoopTimeline(log);
    },

    pendingCatchUp(participantId: string): number {
      const last = lastSeenStamp(inboxes.get(asEntityId(participantId)) ?? []);
      if (last === undefined) return log.length;
      let count = 0;
      for (const record of log) {
        if (isStampAfter(record, last)) count += 1;
      }
      return count;
    },

    catchUpPage(participantId: string, limit: number = pageSize): readonly CoopTimelineRecord[] {
      return Object.freeze([...catchUpPageOf(asEntityId(participantId), limit)]);
    },

    feedFor(participantId: string): readonly ExternalIntent[] {
      return this.feedFrom(this.inbox(participantId));
    },

    feedFrom(records: readonly CoopTimelineRecord[]): readonly ExternalIntent[] {
      return orderCoopTimeline(records) // dup (tick,seq) throws naming both claims
        .filter((record) => record.kind === "action")
        .map(recordToExternalIntent); // R2: opaque passthrough; the door parses
    },
  };
}
