/**
 * Incident Room · co-op seat ledger + shared timeline (chrome consumer, v0) —
 * the OD-9 / OD-17-A rulings get a playable mouth, entirely inside one browser.
 * Two simulated seats author onto one shared incident timeline; no transport,
 * no worker, no save writes. Both ratified contracts are consumed through
 * their PUBLIC barrels and nothing else:
 *
 *  - @hh/sim-core/save  (coop.ts): COOP_MIN/MAX_SEAT_WRITERS, seatParticipant,
 *    vacateSeat, participantSeatedAt — the seat-ledger law, driven for real:
 *    every join/vacate here runs through the engine's own validating folds,
 *    so the refusals this panel prints are the ENGINE's sentences, not
 *    chrome's paraphrase.
 *  - @hh/sim-core/replay (coopTimeline.ts): orderCoopTimeline,
 *    assertCoopTimelineAppendOrder, digestCoopTimeline, parseCoopTimelineRecord
 *    — the shared-log law. Staging is boundary-PARSED (a record is built
 *    through the engine's strict parser); the relay drain MERGES each seat's
 *    pending feed via orderCoopTimeline and APPENDS the ordered result to the
 *    shared log through assertCoopTimelineAppendOrder — a duplicate (tick,seq)
 *    is refused LOUD, naming both positions, by the engine's throw. The room
 *    NEVER swallows it: the pure law rethrows, the component quotes it.
 *
 * SCOPE DISCLOSURE — timeline-side demo only, NO save writes. The
 * guardCoopAttributionBatch laws (facet wall, ≥ MIN writers, seating window,
 * stamp-equals-author) are PREVIEWED here: attributionPreview() answers
 * "would a write authored at this record's tick pass the guard's SEATING leg
 * (participantSeatedAt, half-open [joined,left))" and the guard-status
 * readout answers the MIN-writers leg. commitCoopAttribution/addScar are
 * never touched — the branch node stays unwritten; the demo teaches the law,
 * it does not exercise the ledger.
 *
 * RE-JOIN LAW (transport-lane note, recorded at the co-op closeout): a
 * departure + re-handoff is a NEW tenure row. The engine's v0 ledger rejects
 * two rows for the same participant ("one tenure row per participant" — the
 * transport gap is real and stays in the engine), so the room keeps the full
 * TENURE HISTORY (new row per re-join, exactly the future record shape) and
 * hands the engine a PROJECTION: the latest row per participant. History is
 * display + transport-format; the projection is the authority every seating
 * check runs against. The raw-history refusal is pinned falsifiably in the
 * law test, so when the transport lane lifts the v0 ban, the projection is
 * the single seam that collapses.
 */
import {
  assertCoopTimelineAppendOrder,
  COOP_TIMELINE_KINDS,
  digestCoopTimeline,
  orderCoopTimeline,
  parseCoopTimelineRecord,
} from "@hh/sim-core/replay";
import type { CoopTimelineKind, CoopTimelineRecord } from "@hh/sim-core/replay";
import {
  COOP_MAX_SEAT_WRITERS,
  COOP_MIN_SEAT_WRITERS,
  participantSeatedAt,
  seatParticipant,
  vacateSeat,
} from "@hh/sim-core/save";
import type { CoopNodeMetadata, SeatHolder } from "@hh/sim-core/save";
import { asEntityId, type EntityId, type HashHex, type SimTick } from "@hh/sim-core/types";
import { compareCodeUnits } from "./textLaw";

/* ────────────────────────────── the cast ─────────────────────────────── */

export interface CoopDemoParticipant {
  readonly id: EntityId;
  readonly label: string;
  /** bench seats exist only to drive the MAX_SEAT_WRITERS refusal leg. */
  readonly bench: boolean;
}

/** Two primary seats (the panel's columns) + three bench writers (the
 *  3rd/4th join and the 5th refusal). Closed cast — nobody else may act. */
/** Ids are the bare seat letters (they ride the shared log's participantId
 *  and the engine's refusal wording — short keeps the tape readable; the
 *  panel's columns are the long labels). */
export const COOP_ROOM_PARTICIPANTS: readonly CoopDemoParticipant[] = Object.freeze([
  Object.freeze({ id: asEntityId("a"), label: "Seat A", bench: false }),
  Object.freeze({ id: asEntityId("b"), label: "Seat B", bench: false }),
  Object.freeze({ id: asEntityId("c"), label: "Bench C", bench: true }),
  Object.freeze({ id: asEntityId("d"), label: "Bench D", bench: true }),
  Object.freeze({ id: asEntityId("e"), label: "Bench E", bench: true }),
]);

/** The verbs the "act" button may put on the shared log (opaque payload —
 *  the transport lane interprets it; the demo only needs it to VARY). */
export const COOP_ROOM_VERBS: readonly string[] = Object.freeze([
  "patch",
  "reboot",
  "escalate",
] as const);

/** One RNG-free label source for the two slot-free kinds: a rolling word
 *  per (tick, seq) so consecutive lines never print identical prose. */
const NOTE_WORDS = Object.freeze([
  "failed over on manual",
  "customer called back",
  "blast radius halved",
  "postmortem started",
  "page was a drill",
] as const);
const SIGHTLINE_VIEWS = Object.freeze([
  "lane/ingress-1",
  "node/waf-1",
  "node/origin-1",
  "rack/a-3",
] as const);

function failRoom(code: string, detail: string): never {
  throw new RangeError(`coop-room[${code}]: ${detail}`);
}

function participantOf(id: EntityId): CoopDemoParticipant {
  const found = COOP_ROOM_PARTICIPANTS.find((p) => p.id === id);
  if (found === undefined) {
    failRoom("unknown-participant", `"${id}" is not in the demo cast [${COOP_ROOM_PARTICIPANTS.map((p) => p.id).join(", ")}]`);
  }
  return found;
}

export function participantLabel(id: EntityId): string {
  return participantOf(id).label;
}

/* ─────────────────────────────── the state ────────────────────────────── */

export interface CoopRoomState {
  /** Demo relay clock. Advances only by explicit click (zero-timer law). */
  readonly tick: SimTick;
  /** FULL tenure history — re-join appends a NEW row (transport-lane shape). */
  readonly tenures: readonly SeatHolder[];
  /** The merged shared log, canonical (tick, seq) order. */
  readonly log: readonly CoopTimelineRecord[];
  /** Per-seat pending feeds (staged, not yet relayed), keyed by author. */
  readonly pending: ReadonlyMap<EntityId, readonly CoopTimelineRecord[]>;
  /** The relay's stamp ledger: last (tick, seq) it handed out. */
  readonly lastStampTick: SimTick;
  readonly lastStampSeq: number;
}

/** An empty room is legal and honest: tick 0, no seats, no records, and the
 *  SAME digest machinery answers (digest of the empty log). */
export function createCoopRoom(): CoopRoomState {
  return Object.freeze({
    tick: 0n,
    tenures: Object.freeze([]),
    log: Object.freeze([]),
    pending: new Map<EntityId, readonly CoopTimelineRecord[]>(),
    lastStampTick: -1n,
    lastStampSeq: 0,
  });
}

/** +1 relay tick — the only clock there is. */
export function advanceClock(state: CoopRoomState): CoopRoomState {
  return Object.freeze({ ...state, tick: state.tick + 1n });
}

/* ───────────────────── seat ledger (save/coop law, driven) ───────────────────── */

function latestRows(tenures: readonly SeatHolder[]): SeatHolder[] {
  const latest = new Map<EntityId, SeatHolder>();
  for (const row of tenures) {
    const prior = latest.get(row.participantId);
    if (prior === undefined || row.joinedAtTick >= prior.joinedAtTick) latest.set(row.participantId, row);
  }
  return [...latest.values()].sort(
    (a, b) => Number(a.joinedAtTick - b.joinedAtTick) || compareCodeUnits(a.participantId, b.participantId),
  );
}

/**
 * The engine-facing ledger: latest tenure row per participant, folded through
 * the engine's OWN seatParticipant so every intermediate state re-validates
 * (append-order strictness, half-open concurrency ≤ COOP_MAX_SEAT_WRITERS).
 * An empty room returns the bare empty shape WITHOUT engine validation —
 * the engine calls an empty co-op ledger a phantom company, and a room
 * before the first join genuinely is one; the guard-status readout says so.
 */
export function coopRoomLedger(state: CoopRoomState): CoopNodeMetadata {
  let ledger: CoopNodeMetadata | undefined;
  for (const row of latestRows(state.tenures)) ledger = seatParticipant(ledger, row);
  return ledger ?? Object.freeze({ seatHolders: Object.freeze([]) });
}

function openSeatRow(state: CoopRoomState, id: EntityId): SeatHolder | undefined {
  return latestRows(state.tenures).find((r) => r.participantId === id && r.leftAtTick === undefined);
}

/** Join (or RE-JOIN — a new tenure row lands in history; the projection
 *  replaces the participant's closed row). Engine refusals propagate. */
export function joinSeat(state: CoopRoomState, id: EntityId): CoopRoomState {
  participantOf(id); // closed-cast guard (throws coop-room[unknown-participant])
  if (openSeatRow(state, id) !== undefined) {
    failRoom("already-seated", `"${id}" already holds an open seat — vacate first`);
  }
  const row: SeatHolder = Object.freeze({ participantId: id, joinedAtTick: state.tick });
  const next: CoopRoomState = Object.freeze({ ...state, tenures: Object.freeze([...state.tenures, row]) });
  coopRoomLedger(next); // throws the engine's SaveError on ties / > MAX seats
  return next;
}

/** Close the open tenure — engine vacateSeat stamps leftAtTick and
 *  re-validates; ONLY that seat's open row is replaced with the closed twin,
 *  every other history row (earlier closed tenures included) rides along. */
export function vacateSeatInRoom(state: CoopRoomState, id: EntityId): CoopRoomState {
  const closedLedger = vacateSeat(coopRoomLedger(state), id, state.tick);
  const closedRow = closedLedger.seatHolders.find((r) => r.participantId === id);
  if (closedRow === undefined) failRoom("vacate-lost", `"${id}" vanished from the ledger mid-vacate`);
  const tenures = state.tenures.map((r) => (r.participantId === id && r.leftAtTick === undefined ? closedRow : r));
  return Object.freeze({ ...state, tenures: Object.freeze(tenures) });
}

export interface GuardStatus {
  readonly writers: number;
  readonly armed: boolean;
  readonly note: string;
}

/** The guardCoopAttributionBatch MIN-writers leg, read off the projection —
 *  a one-person room has nothing co-op to guard. */
export function attributionGuardStatus(state: CoopRoomState): GuardStatus {
  const writers = coopRoomLedger(state).seatHolders.length;
  const armed = writers >= COOP_MIN_SEAT_WRITERS;
  return Object.freeze({
    writers,
    armed,
    note: armed
      ? `attribution guard armed — ${writers} writers recorded (law: ${COOP_MIN_SEAT_WRITERS}–${COOP_MAX_SEAT_WRITERS})`
      : `guard idle — ${writers} of ${COOP_MIN_SEAT_WRITERS} minimum writers recorded`,
  });
}

/* ─────────────── relay: stage → pending feed → merge → shared log ─────────────── */

function stageWord(kind: CoopTimelineKind, tick: SimTick, seq: number, verb: string | undefined): Readonly<Record<string, unknown>> {
  if (kind === "action") {
    if (verb !== undefined && !COOP_ROOM_VERBS.includes(verb)) {
      failRoom("bad-verb", `"${verb}" is not a demo verb [${COOP_ROOM_VERBS.join(", ")}]`);
    }
    return Object.freeze({ verb: verb ?? COOP_ROOM_VERBS[0] });
  }
  if (kind === "note") {
    return Object.freeze({ text: NOTE_WORDS[Number(tick + BigInt(seq)) % NOTE_WORDS.length] });
  }
  return Object.freeze({ view: SIGHTLINE_VIEWS[Number(tick + BigInt(seq)) % SIGHTLINE_VIEWS.length] });
}

/**
 * A seat authors one record; the demo relay STAMPS it (tick, seq-within-tick)
 * and parks it in that seat's pending feed. Staging deliberately does NOT
 * police seating — the transport lane never does; a record from a vacated
 * seat stages fine and is refused at the ATTRIBUTION PREVIEW, which is
 * exactly the ghost-author story the panel exists to show. The record is
 * built through the engine's strict boundary parser, so a drifted kind or a
 * bad seq can never enter the room uninvited.
 */
export function stageRecord(
  state: CoopRoomState,
  id: EntityId,
  kind: CoopTimelineKind,
  verb?: string,
): CoopRoomState {
  participantOf(id);
  const seq = state.tick === state.lastStampTick ? state.lastStampSeq + 1 : 1;
  const record = parseCoopTimelineRecord({
    participantId: id,
    tick: state.tick,
    seq,
    kind,
    payload: stageWord(kind, state.tick, seq, verb),
  });
  const feed = [...(state.pending.get(id) ?? []), record];
  const pending = new Map(state.pending);
  pending.set(id, Object.freeze(feed));
  return Object.freeze({
    ...state,
    pending,
    lastStampTick: state.tick,
    lastStampSeq: seq,
  });
}

/** The double-send: the last relayed record re-enters its author's pending
 *  feed with its ORIGINAL (tick, seq) — the network glitch the shared-log
 *  law exists to refuse. */
export function replayLastRelay(state: CoopRoomState): CoopRoomState {
  const last = state.log[state.log.length - 1];
  if (last === undefined) failRoom("nothing-relayed", "the shared log is empty — there is no record to double-send");
  const feed = [...(state.pending.get(last.participantId) ?? []), last];
  const pending = new Map(state.pending);
  pending.set(last.participantId, Object.freeze(feed));
  return Object.freeze({ ...state, pending });
}

function pendingFlatOrdered(pending: ReadonlyMap<EntityId, readonly CoopTimelineRecord[]>): CoopTimelineRecord[] {
  const seats = [...pending.keys()].sort(compareCodeUnits);
  const flat: CoopTimelineRecord[] = [];
  for (const seat of seats) flat.push(...(pending.get(seat) ?? []));
  return flat;
}

/**
 * The relay drain — BOTH engine ordering laws, visibly:
 *  1. every seat's pending feed is MERGED through orderCoopTimeline (any
 *     arrival interleaving of the same logical events yields one order — a
 *     duplicate across feeds still throws there);
 *  2. the ordered result is APPENDED to the shared log record-by-record
 *     through assertCoopTimelineAppendOrder — the append law the relay must
 *     uphold, so a (tick, seq) already in the log is refused naming the
 *     colliding positions. The throw PROPAGATES (never swallowed); the log
 *     is only replaced once the whole drain has passed the law.
 */
export function mergeFeeds(state: CoopRoomState): CoopRoomState {
  const ordered = orderCoopTimeline(pendingFlatOrdered(state.pending));
  let log = state.log;
  for (const record of ordered) {
    const candidate = [...log, record];
    assertCoopTimelineAppendOrder(candidate);
    log = Object.freeze(candidate);
  }
  return Object.freeze({ ...state, log, pending: new Map<EntityId, readonly CoopTimelineRecord[]>() });
}

/* ─────────────── attribution preview (guard laws, preview only) ─────────────── */

export interface AttributionPreview {
  readonly recorded: boolean;
  readonly seated: boolean;
  readonly reasons: readonly string[];
}

/** Would a co-op write attributed to this record's author, committed at the
 *  record's OWN tick, pass the guard's seating legs? Mirrors
 *  guardCoopAttributionBatch's wording (not-recorded / not-seated), reads
 *  only participantSeatedAt — no save state is consulted or written. */
export function attributionPreview(state: CoopRoomState, record: CoopTimelineRecord): AttributionPreview {
  const ledger = coopRoomLedger(state);
  const reasons: string[] = [];
  const recorded = ledger.seatHolders.some((row) => row.participantId === record.participantId);
  if (!recorded) {
    reasons.push(`author "${record.participantId}" is not recorded in the seat ledger`);
    return Object.freeze({ recorded, seated: false, reasons: Object.freeze(reasons) });
  }
  const seated = participantSeatedAt(ledger, record.participantId, record.tick);
  if (!seated) {
    reasons.push(`author "${record.participantId}" is not seated at tick ${record.tick} (half-open [joined, left))`);
  }
  return Object.freeze({ recorded, seated, reasons: Object.freeze(reasons) });
}

/* ─────────────────────── views (tape · digest · probe) ─────────────────────── */

export interface CoopTapeRow {
  readonly key: string;
  readonly tick: string;
  readonly seq: number;
  readonly participantId: EntityId;
  readonly label: string;
  readonly kind: CoopTimelineKind;
  readonly seated: boolean;
  readonly payloadText: string;
}

function payloadTextOf(record: CoopTimelineRecord): string {
  if (record.kind === "action") return `verb=${String(record.payload.verb ?? "?")}`;
  if (record.kind === "note") return String(record.payload.text ?? "");
  return `sight → ${String(record.payload.view ?? "?")}`;
}

function tapeRowOf(record: CoopTimelineRecord, state: CoopRoomState): CoopTapeRow {
  const preview = attributionPreview(state, record);
  return Object.freeze({
    key: `${record.tick}:${record.seq}`,
    tick: record.tick.toString(),
    seq: record.seq,
    participantId: record.participantId,
    label: participantLabel(record.participantId),
    kind: record.kind,
    seated: preview.seated,
    payloadText: payloadTextOf(record),
  });
}

/** The merged shared log, newest first (the OD-17 tape). */
export function buildTape(state: CoopRoomState, limit: number): readonly CoopTapeRow[] {
  if (!Number.isSafeInteger(limit) || limit < 1) failRoom("bad-limit", `tape limit must be a safe integer ≥ 1, got ${String(limit)}`);
  return Object.freeze([...state.log].reverse().slice(0, limit).map((record) => tapeRowOf(record, state)));
}

/** The seat's outbox (pending feed) shown newest-first in its column. */
export function pendingFeedOf(state: CoopRoomState, id: EntityId): readonly CoopTapeRow[] {
  const feed = state.pending.get(id) ?? [];
  return Object.freeze([...feed].reverse().map((record) => tapeRowOf(record, state)));
}

/** The OD-17 digest over the CURRENT merged timeline. Cheap, recomputed on
 *  every update — this hex IS the panel's heartbeat readout. */
export function roomDigest(state: CoopRoomState): HashHex {
  return digestCoopTimeline(state.log);
}

/**
 * The ruling made visible: digest EVERY arrival interleaving of the room's
 * logical record set (log + every pending feed) through the engine's own
 * digestCoopTimeline. Append-merged, seats-last, seat-by-seat and
 * reversed-arrival arms must print ONE hex — the interleaving invariant. A
 * CONTROL arm mutates one seq on the spot; it must print a DIFFERENT hex,
 * proving the readout discriminates rather than always smiling.
 */
export interface DigestProbeArm {
  readonly label: string;
  readonly digest: HashHex;
}

export interface DigestProbeResult {
  readonly records: number;
  readonly digest: HashHex;
  readonly arms: readonly DigestProbeArm[];
  readonly invariantsHold: boolean;
  /** null while the room holds no records — no tamper is definable yet. */
  readonly controlDiffers: boolean | null;
  /** A staged double-send makes the logical set ambiguous: the engine's own
   *  refuse-with-wording, SURFACED here (probe held), never swallowed. */
  readonly collision: string | null;
}

export function digestEquivalenceProbe(state: CoopRoomState): DigestProbeResult {
  const log = state.log;
  const feeds = [...state.pending.entries()].sort((a, b) => compareCodeUnits(a[0], b[0])).map(([, feed]) => feed);
  const total = log.length + feeds.reduce((n, feed) => n + feed.length, 0);
  let canonical: CoopTimelineRecord[];
  try {
    canonical = orderCoopTimeline([...log, ...pendingFlatOrdered(state.pending)]);
  } catch (error) {
    return Object.freeze({
      records: total,
      digest: roomDigest(state),
      arms: Object.freeze([]),
      invariantsHold: false,
      controlDiffers: null,
      collision: error instanceof Error ? error.message : String(error),
    });
  }
  const seatsLast = [...feeds.flat(), ...log];
  const bySeat = [...log, ...feeds.reduce<CoopTimelineRecord[]>((acc, feed) => acc.concat([...feed].reverse()), [])];
  const arms: DigestProbeArm[] = [
    Object.freeze({ label: "append-merged (relay order)", digest: digestCoopTimeline([...log, ...pendingFlatOrdered(state.pending)]) }),
    Object.freeze({ label: "seats-last (log behind every feed)", digest: digestCoopTimeline(seatsLast) }),
    Object.freeze({ label: "seat-by-seat (reversed per feed)", digest: digestCoopTimeline(bySeat) }),
    Object.freeze({ label: "reversed arrivals", digest: digestCoopTimeline([...canonical].reverse()) }),
  ];
  const merged = arms[0]?.digest ?? roomDigest(state);
  const head = canonical[0];
  let controlDiffers: boolean | null = null;
  if (head !== undefined) {
    try {
      controlDiffers = digestCoopTimeline([Object.freeze({ ...head, seq: head.seq + 1000 }), ...canonical.slice(1)]) !== merged;
    } catch {
      controlDiffers = true; // the tamper collided with a live slot — that IS a difference
    }
  }
  return Object.freeze({
    records: total,
    digest: roomDigest(state),
    arms: Object.freeze(arms),
    invariantsHold: new Set(arms.map((arm) => arm.digest)).size === 1,
    controlDiffers,
    collision: null,
  });
}

/** The closed kind vocabulary, re-exported so the panel never re-spells it
 *  (drift-pin twin of RECOVERY_WATCH_KINDS). */
export const COOP_ROOM_KINDS: readonly CoopTimelineKind[] = COOP_TIMELINE_KINDS;
