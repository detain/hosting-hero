/**
 * CO-OP NODE RELAY — SPIKE (ADR-0014 #D6).
 *
 * What this is: an IN-PROCESS hub that plays the role the future PHP/Workerman
 * transport will play — the single server-side authority that (1) keeps the
 * ADR-0013 ruling-2 SEAT LEDGER (save/coop law: 1–4 concurrent writers,
 * half-open [joined,left) tenure rows), (2) STAMPS every timeline record with a
 * globally-unique (tick, seq) pair per the replay/coopTimeline law, and (3)
 * BROADCASTS the stamped log to every seat. Seats may receive records in any
 * arrival order; `feedFor()` normalizes via `orderCoopTimeline` and re-exports
 * the action arm as the exact `ExternalIntent[]` shape the intent door eats.
 *
 * What this is NOT: not a network layer, not shipped multiplayer, not an
 * adoption — MODULE-STATUS row 216 (transport) deliberately stays "future".
 * The relay never touches the sim; a separate runner.ts drives applyIntentDoor.
 * The spike's falsifiable claim (test/relay.runners.test.ts): two independent
 * runners fed the SAME relay-stamped feed, delivered in DIFFERENT arrival
 * orders and normalized, produce equal per-frame AND terminal digestState.
 *
 * Law surfaces honored here:
 *  - save/coop.ts       → seat ledger validation, seatParticipant/vacateSeat,
 *                         participantSeatedAt (ghost-intent refusal).
 *  - replay/coopTimeline.ts → parseCoopTimelineRecord boundary (every submit
 *                         passes the strict parser), assertCoopTimelineAppendOrder
 *                         on every append, orderCoopTimeline normalization,
 *                         digestCoopTimeline interleaving invariance.
 *  - intent-door M4     → (tick, seq) uniqueness is exactly what the relay
 *                         stamps, so a normalized feed can never trip the
 *                         door's dup throw.
 *
 * Determinism law: no Math.random / Date.now / new Date / Intl / performance
 * anywhere — the relay clock is advanced by its host, values are bigint/int.
 */

import { asEntityId, PlayerVerb } from "@hh/sim-core/types";
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
  assertCoopTimelineAppendOrder,
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

export interface CoopRelayOptions {
  readonly seats?: readonly RelaySeatSpec[];
}

/** The action-arm payload envelope a seat submits: { args: <door args wire> }.
 *  Every field is a plain string/number/null/boolean — the strict door parser
 *  (VERB_ARG_SHAPES) is the authority once the feed is applied. */
export interface RelayActionPayload {
  readonly args: Readonly<Record<string, unknown>>;
}

export interface CoopRelay {
  /** Current relay stamp clock (advanced only by the host via advanceTo). */
  tick(): SimTick;
  /** Monotonic clock: moving backwards throws (the stamp authority's word). */
  advanceTo(tick: SimTick): void;
  /** Seat a writer at the CURRENT tick (server-side join delivery). */
  joinSeat(participantId: string): CoopNodeMetadata;
  /** End a tenure at the CURRENT tick (half-open [joined,left)). */
  leaveSeat(participantId: string): CoopNodeMetadata;
  /** The validated seat ledger (live view — frozen rows). */
  ledger(): CoopNodeMetadata;
  isSeated(participantId: string, tick?: SimTick): boolean;
  /**
   * Stamp + append + broadcast one record. Ghost seats are refused at the
   * door of the relay (participantSeatedAt over the half-open window), the
   * seq is the relay's per-tick counter, and every append is self-checked
   * against assertCoopTimelineAppendOrder.
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
  /**
   * Normalize a seat's inbox to the canonical stamped feed the door consumes:
   * orderCoopTimeline (dup (tick,seq) throws) → action arm → ExternalIntent[].
   */
  feedFor(participantId: string): readonly ExternalIntent[];
  /** Normalize an arbitrary (possibly shuffled) record list to a door feed. */
  feedFrom(records: readonly CoopTimelineRecord[]): readonly ExternalIntent[];
}

/* ─────────────────────────── action re-export grammar ─────────────────────────── */

/** Closed spike scope: the verbs the runners actually exercise. Widening is
 *  mechanical; inventing silent passthrough is not. */
const ACTION_VERB_BUILDERS: Readonly<
  Record<string, (args: Readonly<Record<string, unknown>>) => PlayerVerbArgs>
> = {
  [PlayerVerb.PlaceDevice]: (args) => ({
    verb: PlayerVerb.PlaceDevice,
    nodeId: asEntityId(requireString(args, "nodeId")),
    deviceKind: requireString(args, "deviceKind"),
    template: optionalStringOrNull(args, "template"),
  } satisfies PlaceDeviceArgs),
  [PlayerVerb.ConnectPorts]: (args) => ({
    verb: PlayerVerb.ConnectPorts,
    relation: requireRelation(args),
    from: asEntityId(requireString(args, "from")),
    to: asEntityId(requireString(args, "to")),
    slot: optionalStringOrNull(args, "slot"),
  } satisfies ConnectPortsArgs),
  [PlayerVerb.Communicate]: (args) => ({
    verb: PlayerVerb.Communicate,
    target: args.target === null ? null : asEntityId(requireString(args, "target")),
    note: requireString(args, "note"),
  } satisfies CommunicateArgs),
};

function requireString(args: Readonly<Record<string, unknown>>, key: string): string {
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

function recordToExternalIntent(record: CoopTimelineRecord): ExternalIntent {
  if (record.kind !== "action") {
    throw new RelayError("bad-kind", `only 'action' records enter the door feed, got '${record.kind}'`);
  }
  const args = record.payload.args;
  if (typeof args !== "object" || args === null) {
    throw new RelayError("bad-action", `action payload needs an 'args' object at 'payload.args'`);
  }
  const verb = (args as Readonly<Record<string, unknown>>).verb;
  const build = typeof verb === "string" ? ACTION_VERB_BUILDERS[verb] : undefined;
  if (build === undefined) {
    throw new RelayError("unsupported-action", `verb "${String(verb)}" is outside the spike's closed builder set`);
  }
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
      payload: { kind: "player-verb", args: build(args as Readonly<Record<string, unknown>>) },
    },
  };
}

/* ─────────────────────────────── the relay ─────────────────────────────── */

export function createCoopRelay(options: CoopRelayOptions = {}): CoopRelay {
  let currentTick: SimTick = 0n;
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
    // Every seated writer's inbox receives the stamp in broadcast order; a
    // departed writer's inbox survives as history (what they saw while seated).
    for (const seat of requireLedger().seatHolders) {
      openInbox(seat.participantId).push(record);
    }
  }

  function stamp(participantId: EntityId, kind: CoopTimelineKind, payload: Readonly<Record<string, unknown>>): CoopTimelineRecord {
    const seq = nextSeq;
    // The strict coopTimeline parser is the relay's own boundary door: bad
    // kinds or payloads never enter the log (parse don't validate, S-1 shape).
    const parsed = parseCoopTimelineRecord(
      { participantId, tick: currentTick, seq, kind, payload },
      `relay.submit(${participantId})`,
    );
    return Object.freeze(parsed);
  }

  return {
    tick: () => currentTick,

    advanceTo(tick: SimTick): void {
      if (tick < currentTick) {
        throw new RelayError("clock-went-back", `relay stamps ${currentTick}, refuses to rewind to ${tick}`);
      }
      if (tick > currentTick) nextSeq = 0;
      currentTick = tick;
    },

    joinSeat(participantId: string): CoopNodeMetadata {
      const seat: SeatHolder = {
        participantId: asEntityId(participantId),
        joinedAtTick: currentTick,
      };
      ledger = seatParticipant(ledger, seat); // re-validates the whole ledger
      openInbox(seat.participantId);
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
        // Pre-flight the action envelope so garbage never pollutes the log;
        // full arg parsing stays the door's authority at apply time.
        const args = payload.args;
        if (typeof args !== "object" || args === null || typeof (args as Record<string, unknown>).verb !== "string") {
          throw new RelayError("bad-action", "action payload needs args.verb (string) at 'payload.args.verb'");
        }
      }
      const record = stamp(pid, kind, payload);
      log.push(record);
      // Invariant self-check: the relay's own stamping must satisfy the
      // append-order law it will hold every consumer to.
      assertCoopTimelineAppendOrder(log);
      broadcast(record);
      nextSeq += 1;
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

    feedFor(participantId: string): readonly ExternalIntent[] {
      return this.feedFrom(this.inbox(participantId));
    },

    feedFrom(records: readonly CoopTimelineRecord[]): readonly ExternalIntent[] {
      return orderCoopTimeline(records) // dup (tick,seq) throws naming both claims
        .filter((record) => record.kind === "action")
        .map(recordToExternalIntent);
    },
  };
}
