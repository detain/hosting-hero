/**
 * `tools/transport/src/envelope.ts` — hh-coop-transport@1 WIRE SHAPES.
 *
 * The frame vocabulary of the in-repo co-op transport layer (ADR-0016 owner
 * ruling 2026-10-17, design lane I-T): eight kinds, four up the pipe
 * (client→hub: join, leave, submit, catchup-request) and four down
 * (hub→client: broadcast, catchup-page, seat-state, fault). Shapes only —
 * encoding lives in codec.ts, the hub laws in server.ts, the client idempotence
 * law in client.ts.
 *
 * Wire discipline, verbatim from the proto worker protocol (the house codec
 * style this package mirrors): every bigint crosses as a DECIMAL STRING
 * (`WireUs`), optional riders use the omit-when-unset law (the key is NEVER
 * posted as null — absence is the legacy byte-identity mechanism,
 * notice.causeId/attention/boot.corpus precedents), and the version tag rides
 * every frame so a future additive rider (v1) never needs a second envelope.
 *
 * Law surfaces this envelope serves:
 *  - replay/coopTimeline.ts → CoopRecordWire is the JSON-safe twin of
 *    CoopTimelineRecord; the (tick, seq) pair stays globally unique because
 *    ONLY the hub stamps (R1, tools/relay).
 *  - save/coop.ts           → SeatHolderWire mirrors SeatHolder; leftAtTick is
 *    absent-while-seated, never a null key.
 *  - observed/view.ts       → SeatViewWire carries the PER-SEAT projection
 *    (observed_view(seat)), never ground truth; TransportCellWire is
 *    field-isomorphic to the proto ObservedCellWire (drift-pinned — a silent
 *    shape drift would leak or mangle cells).
 */

import type { CoopTimelineKind } from "@hh/sim-core/replay";
import type { CoopTimelineRecord } from "@hh/sim-core/replay";

/* ═══════════════════════════ identity ═══════════════════════════ */

/** Protocol name carried on every frame; a mismatch is a foreign carrier. */
export const TRANSPORT_PROTOCOL = "hh-coop-transport";

/** Frame schema version. Additive riders keep v1 (the proto-protocol law);
 *  a breaking change bumps this and the codec names BOTH sides on refusal. */
export const TRANSPORT_PROTOCOL_VERSION = 1;

/** The eight frame kinds, EXACTLY. Four client→hub, four hub→client. */
export const TRANSPORT_FRAME_KINDS = Object.freeze([
  "join",
  "leave",
  "submit",
  "broadcast",
  "catchup-page",
  "seat-state",
  "fault",
  "catchup-request",
] as const);

export type TransportFrameKind = (typeof TRANSPORT_FRAME_KINDS)[number];

const CLIENT_TO_HUB_KINDS: readonly TransportFrameKind[] = ["join", "leave", "submit", "catchup-request"];
const HUB_TO_CLIENT_KINDS: readonly TransportFrameKind[] = ["broadcast", "catchup-page", "seat-state", "fault"];

export function isClientToHubKind(kind: TransportFrameKind): boolean {
  return CLIENT_TO_HUB_KINDS.includes(kind);
}

export function isHubToClientKind(kind: TransportFrameKind): boolean {
  return HUB_TO_CLIENT_KINDS.includes(kind);
}

/* ═══════════════════════════ caps ═══════════════════════════ */

/** Largest frame the codec will parse, UTF-8 BYTES, checked BEFORE JSON.parse
 *  (the DoS-surface law: never hand an unbounded string to a parser).
 *  PROVISIONAL taste row (I-T §5; owner ratify): 64 KiB bounds a worst-case
 *  catchup-page of 64 compact records with room to spare. */
export const MAX_FRAME_BYTES = 65_536; // PROVISIONAL

/* ═══════════════════════════ wire primitives ═══════════════════════════ */

/** Decimal-string integer (bigint ticks cross as strings, proto `WireUs` law). */
export type WireUs = string;

/** A position in the shared log, JSON-safe twin of replay (tick, seq). */
export interface StampWire {
  readonly tick: WireUs;
  readonly seq: number;
}

/** JSON-safe twin of CoopTimelineRecord. `payload` is opaque structure
 *  (door-shaped when the kind is "action"); the codec proves it is a plain
 *  object with no prototype-pollution keys, nothing deeper (R2 posture —
 *  the door parses, the door refuses). */
export interface CoopRecordWire {
  readonly participantId: string;
  readonly tick: WireUs;
  readonly seq: number;
  readonly kind: CoopTimelineKind;
  readonly payload: Readonly<Record<string, unknown>>;
}

/** Wire twin of save/coop.ts SeatHolder. leftAtTick is ABSENT while seated —
 *  the encoder never posts a null key (omit-when-unset law); the decoder
 *  absorbs an explicit null to absent (missing-key≡null, S-12 precedent). */
export interface SeatHolderWire {
  readonly participantId: string;
  readonly joinedAtTick: WireUs;
  readonly leftAtTick?: WireUs;
}

export interface SeatLedgerWire {
  readonly seatHolders: readonly SeatHolderWire[];
}

/** Field-isomorphic twin of the proto `ObservedCellWire` (apps/proto
 *  shared/protocol.ts) — own copy because transport imports sim-core
 *  subpaths ONLY (it must not import the app). Drift-pinned in fog.test:
 *  a proto cell-shape change reddens this mirror on purpose. */
export type CellEncoding = "fixed" | "int" | "text";

export interface TransportCellWire {
  readonly key: string;
  readonly encoding: CellEncoding;
  readonly value: number | string | null;
  readonly fidelity: number;
  readonly freshnessUs: WireUs;
  readonly coverage: WireUs;
  readonly certainty: WireUs;
  readonly status: "live" | "stale" | "unknown";
}

/** One seat's projected map — observed_view(seat) over the wire. Cells ride
 *  code-unit-sorted by key (Map insertion order is NOT a wire fact). */
export interface SeatViewWire {
  readonly cells: readonly TransportCellWire[];
}

/* ═══════════════════════════ frames ═══════════════════════════ */

interface FrameBase {
  readonly protocol: typeof TRANSPORT_PROTOCOL;
  readonly version: typeof TRANSPORT_PROTOCOL_VERSION;
}

/** Client announces a seat. `clientTickHint` is advisory carrier telemetry
 *  (the SERVER CONTRACT selects the acceptance tick; the hub stamps, period —
 *  R1). The hub parses the shape and ignores the value. */
export interface JoinFrame extends FrameBase {
  readonly kind: "join";
  readonly participantId: string;
  readonly clientTickHint?: WireUs;
}

export interface LeaveFrame extends FrameBase {
  readonly kind: "leave";
  readonly participantId: string;
}

/** Client asks the hub to stamp + append + broadcast one record. The client
 *  never carries a stamp; `payload` rides opaque (R2). */
export interface SubmitFrame extends FrameBase {
  readonly kind: "submit";
  readonly participantId: string;
  readonly recordKind: CoopTimelineKind;
  readonly payload: Readonly<Record<string, unknown>>;
}

export interface CatchUpRequestFrame extends FrameBase {
  readonly kind: "catchup-request";
  readonly participantId: string;
  /** The CLIENT's own lastSeen cursor — client-truth paging (R4): the hub
   *  answers pageCoopLog(sharedLog, after, limit) as a pure read. */
  readonly after: StampWire | null;
  readonly limit?: number;
}

/** The hub's stamped record, fanned out to every LIVE seat. (The I-T spec
 *  sketch left this one shape implicit; {record} is the minimal honest
 *  reading — broadcast carries exactly one shared-log line.) */
export interface BroadcastFrame extends FrameBase {
  readonly kind: "broadcast";
  readonly record: CoopTimelineRecord;
}

export interface CatchUpPageFrame extends FrameBase {
  readonly kind: "catchup-page";
  readonly participantId: string;
  readonly from: StampWire | null;
  readonly to: StampWire | null;
  readonly records: readonly CoopTimelineRecord[];
  readonly hasMore: boolean;
}

export interface SeatStateFrame extends FrameBase {
  readonly kind: "seat-state";
  readonly sentAtTick: WireUs;
  readonly ledger: SeatLedgerWire;
  /** Highest stamp in the shared log (null while the log is empty). */
  readonly lastStamp: StampWire | null;
  /** Per-seat projection rider — omit-when-unset: present ONLY for the one
   *  seat this frame is addressed to, and ONLY when a projectionSource is
   *  wired. A seat-state frame is never fan-out identical when wired. */
  readonly view?: SeatViewWire;
}

/** Verdict roll-up. `cause` is the verbatim `relay[CODE]`/`transport[CODE]`
 *  message — the worker fault-channel precedent: a sync throw becomes an
 *  async verdict frame, never a crashed hub. */
export interface FaultFrame extends FrameBase {
  readonly kind: "fault";
  readonly against: string;
  readonly cause: string;
}

export type TransportFrame =
  | JoinFrame
  | LeaveFrame
  | SubmitFrame
  | BroadcastFrame
  | CatchUpPageFrame
  | SeatStateFrame
  | FaultFrame
  | CatchUpRequestFrame;
