/**
 * `tools/transport/src/client.ts` — the seat-side endpoint.
 *
 * A client never stamps, never orders, never trusts its own clock: it sends
 * join/leave/submit/catchup-request frames up the pipe and turns whatever
 * arrives down it into (a) an arrival-ordered inbox, (b) the canonical door
 * feed, (c) the latest ledger/seat-state copy. The relay's stamped-feed laws
 * are RE-USED verbatim (feedToDoor is the behavioral twin of
 * relay.feedFrom — pinned by test) so the door sees one intent grammar from
 * either host.
 *
 * CLIENT-SIDE IDEMPOTENCE — the new transport law (I-T; the hub laws are
 * unchanged). The channel is at-least-once (the in-memory carrier's dup knob
 * proves it; a real carrier's retry semantics are worse, not better), so the
 * client keeps `seen: (tick, seq) → identity`:
 *
 *  - an IDENTICAL re-send — field-wise participantId/tick/seq/kind equal and
 *    encodeCanonicalJson(payload) equal — is DROPPED with an observable
 *    `duplicatesDropped` counter. Never silent (a counter a host can meter),
 *    never thrown (at-least-once is legal, absorbing it is the point).
 *  - the same stamp with a DIFFERENT payload is FATAL: TransportError
 *    dup-conflict. This is the coopTimeline collision law (`orderCoopTimeline`
 *    refuses "(tick, seq) claimed by two records") pulled FORWARD to the
 *    boundary: we absorb at-least-once, we never split-brain. Because of it
 *    `orderCoopTimeline` — and with it the door's M4 — stays unreachable-
 *    by-wire-dup on this path.
 */

import { minutesToSimUs } from "@hh/sim-core/kernel";
import { PLAYER_VERBS } from "@hh/sim-core/types";
import type { CoopTimelineKind, CoopTimelineRecord } from "@hh/sim-core/replay";
import { orderCoopTimeline } from "@hh/sim-core/replay";
import { compareRelayStamps } from "relay-tools";
import type { ExternalIntent, PlayerVerbArgs } from "@hh/sim-core/types";
import { decodeFrame, encodeFrame, payloadIdentity, TransportError } from "./codec.ts";
import {
  TRANSPORT_PROTOCOL,
  TRANSPORT_PROTOCOL_VERSION,
} from "./envelope.ts";
import type {
  FaultFrame,
  SeatLedgerWire,
  SeatViewWire,
  StampWire,
  TransportFrame,
  WireUs,
} from "./envelope.ts";
import type { TransportPort } from "./port.ts";
import { decodeScopedView } from "./fog.ts";
import type { ScopedReadView } from "@hh/sim-core/observed";

/* ═══════════════ door bigint-arg revival (proto wireIntent twin) ═══════════════ */

/** CLOSED mirror of the proto's BIGINT_ARG_FIELDS (apps/proto
 *  shared/protocol.ts) — and the sibling NULLABLE arm. Twin-copy BY
 *  DISCLOSURE: transport imports sim-core subpaths only and must not import
 *  the app, so the table is restated here; the drift pin (codec.test) greps
 *  the proto SOURCE for both declarations and reddens the day a carrier
 *  joins one table without the other. Consolidation into sim-core is the
 *  honest eventual home — noted, NOT forced (the proto lane owns its file). */
export const TRANSPORT_BIGINT_ARG_FIELDS: Readonly<Record<string, readonly string[]>> = Object.freeze({
  "adjust-price": Object.freeze(["newPriceMicroUsd"]),
  "sell-offer": Object.freeze(["offerPriceMicroUsd"]),
});

export const TRANSPORT_NULLABLE_BIGINT_ARG_FIELDS: Readonly<Record<string, readonly string[]>> = Object.freeze({
  "negotiate-terms": Object.freeze(["concessionMicroUsd"]),
});

const INT_STRING_RE = /^-?\d+$/;

/** Decimal string → real bigint at the door boundary, exactly the proto
 *  `reviveWireArgs` law (bigint already revived passes through; the explicit
 *  null sentinel on the nullable arm stays null — 0-vs-null is load-bearing
 *  for negotiate-terms). */
export function reviveHubArgs(args: Readonly<Record<string, unknown>>): Readonly<Record<string, unknown>> {
  const verb = args["verb"];
  if (typeof verb !== "string") return args;
  const strict = TRANSPORT_BIGINT_ARG_FIELDS[verb];
  const nullable = TRANSPORT_NULLABLE_BIGINT_ARG_FIELDS[verb];
  if (strict === undefined && nullable === undefined) return args;
  const revived: Record<string, unknown> = { ...args };
  for (const field of strict ?? []) {
    const raw = revived[field];
    if (typeof raw === "bigint") continue;
    if (typeof raw !== "string" || !INT_STRING_RE.test(raw)) {
      throw new TransportError("bad-field", `args.${field}`, "decimal-string bigint (wire law)", raw);
    }
    revived[field] = BigInt(raw);
  }
  for (const field of nullable ?? []) {
    const raw = revived[field];
    if (raw === null || typeof raw === "bigint") continue;
    if (typeof raw !== "string" || !INT_STRING_RE.test(raw)) {
      throw new TransportError("bad-field", `args.${field}`, "decimal-string bigint-or-null (wire law)", raw);
    }
    revived[field] = BigInt(raw);
  }
  return Object.freeze(revived);
}

/* ═══════════════════════ record → door feed (relay twin) ═══════════════════════ */

const DOOR_VERB_SET: ReadonlySet<string> = new Set<string>(PLAYER_VERBS);

/** Structural envelope check — the client's mirror of relay R2: the door is
 *  the parse authority; the client only refuses structurally non-door-shaped
 *  actions (a forged hub frame), never a value. */
function assertActionEnvelope(payload: Readonly<Record<string, unknown>>, where: string): void {
  const args = payload["args"];
  if (typeof args !== "object" || args === null || Array.isArray(args)) {
    throw new TransportError("bad-field", `${where}.args`, "an 'args' object (door envelope)", args);
  }
  const verb = (args as Readonly<Record<string, unknown>>)["verb"];
  if (typeof verb !== "string" || !DOOR_VERB_SET.has(verb)) {
    throw new TransportError("bad-field", `${where}.args.verb`, `a PlayerVerb of ${PLAYER_VERBS.join("|")}`, verb);
  }
}

/** Behavioral twin of tools/relay recordToExternalIntent (pinned in
 *  hub.conformance.test): 1 tick = 1 sim minute, clock "sim", origin
 *  "player", args opaque EXCEPT the decimal-string bigint revival the JSON
 *  hop made necessary. */
function recordToExternalIntent(record: CoopTimelineRecord): ExternalIntent {
  if (record.kind !== "action") {
    throw new TransportError("bad-kind", `inbox(${record.tick}:${record.seq})`, "an 'action' record for the door feed", record.kind);
  }
  assertActionEnvelope(record.payload, `inbox(${record.tick}:${record.seq})`);
  const args = reviveHubArgs(record.payload["args"] as Readonly<Record<string, unknown>>);
  return {
    tick: record.tick,
    intent: {
      seq: record.seq,
      clock: "sim",
      atUs: minutesToSimUs(record.tick),
      origin: "player",
      payload: { kind: "player-verb", args: args as unknown as PlayerVerbArgs },
    },
  };
}

/* ═══════════════════════════ the client ═══════════════════════════ */

interface SeenEntry {
  readonly participantId: string;
  readonly kind: CoopTimelineKind;
  readonly payloadIdentity: string;
}

export interface TransportClient {
  readonly participantId: string;
  /** Ask the hub to open a tenure for this seat (hint is advisory — R1). */
  join(clientTickHint?: WireUs): void;
  leave(): void;
  /** Ask the hub to stamp + append + broadcast one record. The client never
   *  carries a stamp; the payload rides opaque (R2). */
  submit(recordKind: CoopTimelineKind, payload: Readonly<Record<string, unknown>>): void;
  /** Open (or re-open) the paged catch-up story: ONE catchup-request at the
   *  client's own lastSeen cursor (null = cold, full log). Subsequent pages
   *  chain automatically while hasMore holds (R4, resumable mid-page-set). */
  runCatchUp(): void;
  /** The whole reconnect story is ONE frame type: resume() = one more
   *  catchup-request at the cursor the server-truth pages left it at. */
  resume(): void;
  /** Decode + absorb every frame currently delivered to this seat. */
  drain(): number;
  /** One frame's absorb step (drain loops this). Malformed hub frames become
   *  observable faults; a divergent-payload dup THROWS (fatal by law). */
  handleFrame(raw: string): void;
  /** Arrival-ordered inbox (what the carrier delivered, dups absorbed). */
  records(): readonly CoopTimelineRecord[];
  lastSeen(): StampWire | null;
  ledger(): SeatLedgerWire | null;
  /** Raw last seat-state view rider (null when no projectionSource / legacy
   *  frames — the view-absent identity law). */
  view(): SeatViewWire | null;
  /** Decoded per-seat projection (observed_view(seat)), or null. NEVER ground
   *  truth: only what the hub's projectionSource chose to show THIS seat. */
  observed(): ScopedReadView | null;
  hubLastStamp(): StampWire | null;
  faults(): readonly FaultFrame[];
  /** Observable at-least-once absorption — the idempotence counter a host
   *  meters. A resend that is NOT counted means the law went silent. */
  duplicatesDropped(): number;
  /** True while no auto-chained page request is outstanding. */
  isCaughtUp(): boolean;
  /** Canonical door feed: orderCoopTimeline (collision law — unreachable-
   *  by-dup thanks to the idempotence gate) → action arm → ExternalIntent[]. */
  feedToDoor(): readonly ExternalIntent[];
}

function stampWire(record: { tick: bigint; seq: number }): StampWire {
  return { tick: record.tick.toString(), seq: record.seq };
}

export function createTransportClient(port: TransportPort, participantId: string): TransportClient {
  const endpoint = port.client(participantId);
  const hub = port.hub;
  const inbox: CoopTimelineRecord[] = [];
  const seen = new Map<string, SeenEntry>();
  const receivedFaults: FaultFrame[] = [];
  let lastSeen: StampWire | null = null;
  let ledger: SeatLedgerWire | null = null;
  let view: SeatViewWire | null = null;
  let hubLastStamp: StampWire | null = null;
  let duplicates = 0;
  let catchingUp = false;

  function send(frame: TransportFrame): void {
    hub.send(frame);
  }

  function requestCatchUp(): void {
    send({
      protocol: TRANSPORT_PROTOCOL,
      version: TRANSPORT_PROTOCOL_VERSION,
      kind: "catchup-request",
      participantId,
      after: lastSeen,
    });
  }

  /** THE idempotence gate — see the header law. */
  function absorb(record: CoopTimelineRecord): void {
    const key = `${record.tick}:${record.seq}`;
    const entry: SeenEntry = {
      participantId: record.participantId,
      kind: record.kind,
      payloadIdentity: payloadIdentity(record.payload),
    };
    const prior = seen.get(key);
    if (prior !== undefined) {
      const identical =
        prior.participantId === entry.participantId &&
        prior.kind === entry.kind &&
        prior.payloadIdentity === entry.payloadIdentity;
      if (identical) {
        duplicates += 1; // at-least-once absorbed — counted, never silent
        return;
      }
      throw new TransportError(
        "dup-conflict",
        `inbox(${key})`,
        "an identical re-send (at-least-once delivery)",
        `a divergent payload claiming the same (tick, ${record.seq}) stamp — the shared log cannot hold two records in one slot`,
      );
    }
    seen.set(key, entry);
    inbox.push(record);
    if (lastSeen === null || compareRelayStamps(record, { tick: BigInt(lastSeen.tick), seq: lastSeen.seq }) > 0) {
      lastSeen = stampWire(record);
    }
  }

  const HEAD = { protocol: TRANSPORT_PROTOCOL, version: TRANSPORT_PROTOCOL_VERSION } as const;

  return {
    participantId,

    join(clientTickHint?: WireUs): void {
      send({ ...HEAD, kind: "join", participantId, ...(clientTickHint === undefined ? {} : { clientTickHint }) });
    },

    leave(): void {
      send({ ...HEAD, kind: "leave", participantId });
    },

    submit(recordKind: CoopTimelineKind, payload: Readonly<Record<string, unknown>>): void {
      send({ ...HEAD, kind: "submit", participantId, recordKind, payload });
    },

    runCatchUp(): void {
      catchingUp = true;
      requestCatchUp();
    },

    resume(): void {
      catchingUp = true;
      requestCatchUp();
    },

    handleFrame(raw: string): void {
      let frame: TransportFrame;
      try {
        frame = decodeFrame(raw);
      } catch (error) {
        if (error instanceof TransportError) {
          // A hub frame this side cannot parse is a hub/carrier fault, not a
          // verdict: surface it, keep the client alive, keep the inbox clean.
          receivedFaults.push(
            Object.freeze({
              ...HEAD,
              kind: "fault" as const,
              against: "hub",
              cause: `${error.message} (undeliverable frame bytes: ${raw.slice(0, 80)})`,
            }),
          );
          return;
        }
        throw error;
      }
      switch (frame.kind) {
        case "broadcast":
          absorb(frame.record);
          return;
        case "catchup-page": {
          if (frame.participantId !== participantId) {
            receivedFaults.push(
              Object.freeze({
                ...HEAD,
                kind: "fault" as const,
                against: frame.participantId,
                cause: `transport[bad-field] at 'frame.participantId': expected this seat "${participantId}", got a page addressed to another seat (cross-talk ignored, inbox untouched)`,
              }),
            );
            return;
          }
          for (const record of frame.records) absorb(record);
          if (frame.hasMore && catchingUp) requestCatchUp();
          else if (!frame.hasMore) catchingUp = false;
          return;
        }
        case "seat-state":
          ledger = frame.ledger;
          hubLastStamp = frame.lastStamp;
          view = frame.view === undefined ? null : frame.view;
          return;
        case "fault":
          receivedFaults.push(frame);
          return;
        default:
          // A client-direction mailbox receiving an up-pipe kind is carrier
          // cross-talk; a hub frame we cannot route is surfaced, never eaten.
          receivedFaults.push(
            Object.freeze({
              ...HEAD,
              kind: "fault" as const,
              against: frame.kind,
              cause: `transport[bad-frame] at 'frame.kind': expected a hub-to-client frame, got "${frame.kind}" on the seat channel`,
            }),
          );
      }
    },

    drain(): number {
      const raws = endpoint.poll();
      for (const raw of raws) this.handleFrame(raw);
      return raws.length;
    },

    records: () => Object.freeze([...inbox]),
    lastSeen: () => lastSeen,
    ledger: () => ledger,
    view: () => view,
    observed: () => (view === null ? null : decodeScopedView(view)),
    hubLastStamp: () => hubLastStamp,
    faults: () => Object.freeze([...receivedFaults]),
    duplicatesDropped: () => duplicates,
    isCaughtUp: () => !catchingUp,

    feedToDoor(): readonly ExternalIntent[] {
      return orderCoopTimeline(inbox) // collision law; dup-absorb made it unreachable-by-wire
        .filter((record) => record.kind === "action")
        .map(recordToExternalIntent); // twin of relay.feedFrom — pinned by test
    },
  };
}
