/**
 * `tools/transport/src/server.ts` — the hub half: attach the coop relay to a
 * TransportPort (I-T §7).
 *
 * The relay (tools/relay) stays the SOLE stamp + ledger authority; this file
 * only moves frames. Law posture, verbatim from the SERVER CONTRACT this
 * package hands the PHP/Workerman carrier:
 *
 *  - the HUB stamps (R1): a submit is relay.submit at the relay's CURRENT
 *    tick — client tick hints are advisory telemetry, never authority;
 *  - payloads ride OPAQUE until the door (R2): the hub structural-checks
 *    nothing beyond the codec's plain-object + unsafe-key walls;
 *  - EVERY refusal becomes a fault FRAME (worker fault-channel precedent):
 *    drain() wraps each dispatch in try/catch (TransportError | RelayError)
 *    — a sync throw becomes an async verdict, the hub never crashes;
 *  - catch-up is a PURE READ of the shared log at the CLIENT's cursor:
 *    pageCoopLog(sharedLog, after, clamp(limit)) — client-truth paging, the
 *    R4 window law, which is exactly why a dropped mid-page-set resumes to
 *    a byte-identical inbox (pinned in hub.conformance.test);
 *  - departed seats page nothing (the @24426ec freeze, restated through the
 *    wire: fault cause carries the relay's OWN `relay[not-seated]` grammar
 *    verbatim);
 *  - zero save writes (the v0 incident-room law @10f05fb): the hub touches
 *    timeline records + the in-relay ledger only.
 *
 * Determinism law: no timers, no wall-clock; the host pumps drain().
 */

import type { CoopTimelineRecord } from "@hh/sim-core/replay";
import { digestCoopTimeline, orderCoopTimeline } from "@hh/sim-core/replay";
import type { HashHex } from "@hh/sim-core/types";
import {
  DEFAULT_CATCH_UP_PAGE_SIZE,
  pageCoopLog,
  RelayError,
} from "relay-tools";
import type { CoopRelay, RelayStamp } from "relay-tools";
import {
  decodeFrame,
  encodeFrame,
  encodeStampWire,
  ledgerToWire,
  TransportError,
} from "./codec.ts";
import {
  TRANSPORT_PROTOCOL,
  TRANSPORT_PROTOCOL_VERSION,
} from "./envelope.ts";
import type { SeatLedgerWire, SeatViewWire, StampWire, TransportFrame } from "./envelope.ts";
import type { TransportPort } from "./port.ts";

export interface AttachRelayHubOptions {
  /** Per-seat projection source: called with the seat's id, returns that
   *  seat's SeatViewWire (observed_view(seat)) or undefined for no rider.
   *  THIS is where the host decides what each scope sees — the wire type
   *  cannot express more than one seat's projection. */
  readonly projectionSource?: (seat: string) => SeatViewWire | undefined;
  /** Records per page when a request omits `limit` (default the relay's
   *  DEFAULT_CATCH_UP_PAGE_SIZE). */
  readonly pageSize?: number;
  /** Ceiling a client may ask for. PROVISIONAL taste row (I-T §5; owner
   *  ratify against frame-size budgeting once MAX_FRAME_BYTES is settled). */
  readonly maxPageSize?: number; // PROVISIONAL (default below)
  /** Shared-log length at which the hub refuses further submits with
   *  transport[log-budget]. PROVISIONAL taste row (I-T §5): v0 protects the
   *  in-memory room only; MySQL-notary sizing is the carrier lane's. */
  readonly logBudget?: number; // PROVISIONAL (default below)
}

export interface HubFaultRecord {
  readonly against: string;
  readonly cause: string;
}

export interface RelayHubHandle {
  /** Process every frame currently in the hub's mailbox. Returns the number
   *  of frames consumed. NEVER throws on wire verdicts — refusals ride out
   *  as fault frames (and stay observable via faults()). */
  drain(): number;
  /** Every fault the hub has emitted (delivered or unaddressable), in order. */
  faults(): readonly HubFaultRecord[];
}

const DEFAULT_MAX_PAGE_SIZE = 64; // PROVISIONAL (I-T §5 taste row)
const DEFAULT_LOG_BUDGET = 10_000; // PROVISIONAL (I-T §5 taste row)

function requirePositiveInteger(code: "bad-limit" | "bad-field", name: string, value: number): number {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new TransportError(code, `options.${name}`, "safe integer >= 1", value);
  }
  return value;
}

export function attachRelayHub(
  relay: CoopRelay,
  port: TransportPort,
  options: AttachRelayHubOptions = {},
): RelayHubHandle {
  const pageSize = requirePositiveInteger("bad-limit", "pageSize", options.pageSize ?? DEFAULT_CATCH_UP_PAGE_SIZE);
  const maxPageSize = requirePositiveInteger("bad-limit", "maxPageSize", options.maxPageSize ?? DEFAULT_MAX_PAGE_SIZE);
  const logBudget = requirePositiveInteger("bad-field", "logBudget", options.logBudget ?? DEFAULT_LOG_BUDGET);
  const hub = port.hub;
  const emitted: HubFaultRecord[] = [];

  function liveSeats(): string[] {
    try {
      return relay
        .ledger()
        .seatHolders.filter((seat) => seat.leftAtTick === undefined)
        .map((seat) => seat.participantId as string);
    } catch (error) {
      if (error instanceof RelayError && error.message.includes("no-seats")) return []; // empty room, empty fan-out
      throw error;
    }
  }

  function lastLogStamp(): RelayStamp | null {
    const log = relay.sharedLog();
    const tail = log[log.length - 1];
    return tail === undefined ? null : { tick: tail.tick, seq: tail.seq };
  }

  function recordFault(against: string, cause: string, deliverable: boolean): void {
    emitted.push(Object.freeze({ against, cause }));
    if (!deliverable) return;
    port.client(against).send({
      kind: "fault",
      protocol: TRANSPORT_PROTOCOL,
      version: TRANSPORT_PROTOCOL_VERSION,
      against,
      cause,
    });
  }

  function sendSeatStates(): void {
    const ledger = ledgerToWire(relay.ledger());
    const last = lastLogStamp();
    const lastStamp: StampWire | null = last === null ? null : encodeStampWire(last);
    const sentAtTick = relay.tick().toString();
    for (const seat of liveSeats()) {
      const view = options.projectionSource?.(seat);
      port.client(seat).send({
        kind: "seat-state",
        protocol: TRANSPORT_PROTOCOL,
        version: TRANSPORT_PROTOCOL_VERSION,
        sentAtTick,
        ledger,
        lastStamp,
        ...(view === undefined ? {} : { view }),
      });
    }
  }

  function broadcastToLive(record: CoopTimelineRecord): void {
    for (const seat of liveSeats()) {
      port.client(seat).send({
        kind: "broadcast",
        protocol: TRANSPORT_PROTOCOL,
        version: TRANSPORT_PROTOCOL_VERSION,
        record,
      });
    }
  }

  /** Seating wall for the PURE-READ catch-up path (the relay's own submit
   *  already carries this wall; the hub-side page read needs it stated).
   *  Never-seated → transport[unknown-participant]; departed → the relay's
   *  OWN `relay[not-seated]` grammar verbatim. */
  function requireSeatedForRead(pid: string): void {
    if (relay.isSeated(pid)) return;
    let everSeated = false;
    try {
      everSeated = relay.ledger().seatHolders.some((seat) => seat.participantId === pid);
    } catch (error) {
      if (!(error instanceof RelayError)) throw error; // no ledger at all → never seated
    }
    if (!everSeated) {
      throw new TransportError(
        "unknown-participant",
        "catchup-request.participantId",
        "a participant with a seat-ledger row (open or departed tenure)",
        pid,
      );
    }
    throw new RelayError(
      "not-seated",
      `"${pid}" has no seat at tick ${relay.tick()} — ghost intents are refused at the relay`,
    );
  }

  function handleJoin(pid: string): void {
    relay.joinSeat(pid); // wire posture: the relay is constructed autoCatchUpOnJoin:false —
    // the TENURE opens dry and the client pumps catchup-request pages itself
    // (the whole reconnect story stays ONE frame type, resumable mid-page-set).
    sendSeatStates();
  }

  function handleLeave(pid: string): void {
    relay.leaveSeat(pid);
    sendSeatStates();
  }

  function handleSubmit(pid: string, recordKind: CoopTimelineRecord["kind"], payload: Readonly<Record<string, unknown>>): void {
    const size = relay.sharedLog().length;
    if (size >= logBudget) {
      throw new TransportError(
        "log-budget",
        "submit",
        `shared log shorter than the budget (${logBudget} records)`,
        `log holds ${size}`,
      );
    }
    const record = relay.submit(pid, recordKind, payload); // relay owns EVERY deeper wall (R2)
    broadcastToLive(record);
    sendSeatStates();
  }

  function handleCatchUpRequest(pid: string, after: StampWire | null, limit: number): void {
    requireSeatedForRead(pid);
    const log = relay.sharedLog();
    const cursor: RelayStamp | undefined = after === null ? undefined : { tick: BigInt(after.tick), seq: after.seq };
    const page = pageCoopLog(log, cursor, limit);
    const tail = page[page.length - 1];
    const to: StampWire | null = tail === undefined ? after : encodeStampWire({ tick: tail.tick, seq: tail.seq });
    const hasMore = tail !== undefined && pageCoopLog(log, { tick: tail.tick, seq: tail.seq }, 1).length > 0;
    port.client(pid).send({
      kind: "catchup-page",
      protocol: TRANSPORT_PROTOCOL,
      version: TRANSPORT_PROTOCOL_VERSION,
      participantId: pid,
      from: after,
      to,
      records: page,
      hasMore,
    });
  }

  function dispatch(raw: string): void {
    let frame: TransportFrame;
    try {
      frame = decodeFrame(raw);
    } catch (error) {
      if (error instanceof TransportError) {
        recordFault("frame", error.message, false); // undecodable → nowhere to send it
        return;
      }
      throw error;
    }
    if (frame.kind !== "join" && frame.kind !== "leave" && frame.kind !== "submit" && frame.kind !== "catchup-request") {
      recordFault(
        frame.kind,
        `transport[bad-frame] at 'frame.kind': expected a client-to-hub frame, got hub-to-client kind "${frame.kind}" on the hub channel`,
        false,
      );
      return;
    }
    try {
      switch (frame.kind) {
        case "join":
          handleJoin(frame.participantId);
          return;
        case "leave":
          handleLeave(frame.participantId);
          return;
        case "submit":
          handleSubmit(frame.participantId, frame.recordKind, frame.payload);
          return;
        case "catchup-request": {
          const limit = frame.limit === undefined ? pageSize : Math.min(frame.limit, maxPageSize);
          handleCatchUpRequest(frame.participantId, frame.after, limit);
          return;
        }
      }
    } catch (error) {
      if (error instanceof TransportError || error instanceof RelayError) {
        // The fault-channel law: sync throw → async verdict, hub survives.
        recordFault(frame.participantId, error.message, true);
        return;
      }
      throw error; // a real bug stays a real crash — refusals have names
    }
  }

  return {
    drain(): number {
      const frames = hub.poll();
      for (const raw of frames) dispatch(raw);
      return frames.length;
    },
    faults: () => Object.freeze([...emitted]),
  };
}

/* ═══════════════════════════ the replica witness ═══════════════════════════ */

export interface TransportReplica {
  /** Ingest one frame the carrier mirrored from the AUTHORITY's outbound
   *  stream. Mirrors (broadcast/catchup-page/seat-state/fault) return null;
   *  a WRITE attempt (join/leave/submit/catchup-request) returns an encoded
   *  fault frame whose cause is the relay's own `relay[replica-authority]`
   *  grammar — the pinned posture that a replica never re-stamps. */
  ingest(raw: string): string | null;
  /** The shadow log: append-replay of STAMPED broadcast records, in relay
   *  stamp order — positions copied verbatim, never re-derived. */
  shadowLog(): readonly CoopTimelineRecord[];
  /** Latest mirrored ledger copy (null until the first seat-state). */
  ledger(): SeatLedgerWire | null;
  /** digestCoopTimeline over the shadow — equals the authority's after every
   *  pump-set (the re-hosting contract witness). */
  digest(): HashHex;
}

export function createReplica(): TransportReplica {
  // Bare orderCoopTimeline is the shadow's normalizer: a mirror may receive
  // its stream in carrier order, which a hostile (permutation-seeded) channel
  // can scramble WITHIN one step — the stamps are the truth, never the
  // arrival. A stamp that appears twice is a genuine mirror break and the
  // collision law throws it upstream's way.
  const mirror: CoopTimelineRecord[] = [];
  let canonical: readonly CoopTimelineRecord[] = Object.freeze([]);
  let ledger: SeatLedgerWire | null = null;

  function append(record: CoopTimelineRecord): void {
    mirror.push(record);
    canonical = orderCoopTimeline(mirror);
  }

  return {
    ingest(raw: string): string | null {
      const frame = decodeFrame(raw);
      switch (frame.kind) {
        case "broadcast":
          append(frame.record);
          return null;
        case "catchup-page":
          for (const record of frame.records) append(record);
          return null;
        case "seat-state":
          ledger = frame.ledger;
          return null;
        case "fault":
          return null;
        default: {
          const cause = new RelayError(
            "replica-authority",
            `${frame.kind} refused at the replica: a replica mirrors the authority's STAMPED log and never re-stamps — writes belong to the authority hub`,
          ).message;
          return encodeFrame({
            kind: "fault",
            protocol: TRANSPORT_PROTOCOL,
            version: TRANSPORT_PROTOCOL_VERSION,
            against: frame.participantId,
            cause,
          });
        }
      }
    },
    shadowLog: () => Object.freeze([...canonical]),
    ledger: () => ledger,
    digest: () => digestCoopTimeline(canonical),
  };
}
