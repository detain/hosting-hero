/**
 * `tools/transport/src/codec.ts` — THE boundary parse for hh-coop-transport@1.
 *
 * House codec style, verbatim from apps/proto shared/protocol.ts: encode is
 * key-order-by-construction (a rebuilt literal, never a spread of untrusted
 * insertion order), decode is the ONE place strings become bigints, every
 * refusal names its exact field path (Law 4 — silent half-states are worse
 * than a crash), unknown TOP-LEVEL keys are tolerated (extras are the codec's
 * blind spot BY PRECEDENT — boot.corpus/boot.build) while unknown KINDS and
 * half-values are refused.
 *
 * The record authority stays upstream: `decodeRecordWire` revives the JSON-
 * impossible bigint tick at this boundary, then DELEGATES to replay's
 * `parseCoopTimelineRecord` — the strict parser remains the single record
 * law (parse don't validate; this codec never re-invents deeper checks). A
 * string tick reaching that parser (i.e. skipping revival) dies there —
 * pinned in tests, which is the proof the delegation is real.
 *
 * Determinism law: no Math.random / Date.now / new Date / Intl / performance
 * anywhere — pure functions of bytes in, trusted values out.
 */

import {
  COOP_TIMELINE_KINDS,
  encodeCanonicalJson,
  parseCoopTimelineRecord,
  utf8Encode,
} from "@hh/sim-core/replay";
import type { CoopTimelineKind, CoopTimelineRecord } from "@hh/sim-core/replay";
import type { CoopNodeMetadata, SeatHolder } from "@hh/sim-core/save";
import {
  MAX_FRAME_BYTES,
  TRANSPORT_FRAME_KINDS,
  TRANSPORT_PROTOCOL,
  TRANSPORT_PROTOCOL_VERSION,
} from "./envelope.ts";
import type {
  SeatLedgerWire,
  SeatViewWire,
  StampWire,
  TransportCellWire,
  TransportFrame,
  TransportFrameKind,
} from "./envelope.ts";

/* ═══════════════════════════ error grammar ═══════════════════════════ */

/** Closed refusal-code vocabulary (I-T §4). Anything outside this list is a
 *  codec bug, not a wire verdict. */
export const TRANSPORT_ERROR_CODES = Object.freeze([
  "bad-json",
  "bad-frame",
  "bad-protocol",
  "bad-version",
  "bad-kind",
  "bad-field",
  "unsafe-key",
  "oversize-frame",
  "bad-limit",
  "unknown-participant",
  "not-seated",
  "log-budget",
  "dup-conflict",
] as const);

export type TransportErrorCode = (typeof TRANSPORT_ERROR_CODES)[number];

/** House grammar: `transport[CODE] at 'path': expected {e}, got {d}` — the
 *  versus/unattended family shape with the transport tag. */
export class TransportError extends Error {
  readonly code: TransportErrorCode;
  readonly path: string;

  constructor(code: TransportErrorCode, path: string, expected: string, received: unknown) {
    super(`transport[${code}] at '${path}': expected ${expected}, got ${describe(received)}`);
    this.name = "TransportError";
    this.code = code;
    this.path = path;
  }
}

function describe(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return `${typeof value} ${String(value).slice(0, 40)}`;
}

/* ═══════════════════════════ scalar walls ═══════════════════════════ */

const INT_RE = /^-?\d+$/;
const UNSAFE_KEYS: ReadonlySet<string> = new Set(["__proto__", "constructor", "prototype"]);

function isRecord(path: string, value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TransportError("bad-frame", path, "object", value);
  }
  return value as Record<string, unknown>;
}

function parseNonEmptyString(path: string, raw: unknown): string {
  if (typeof raw !== "string") throw new TransportError("bad-field", path, "string", raw);
  if (raw.length === 0) throw new TransportError("bad-field", path, "non-empty string", raw);
  return raw;
}

/** Decimal-string integer kept as `WireUs` (the wire form is the trusted form
 *  for stamps at this layer; bigints are revived where a sim type needs them
 *  — decodeRecordWire is the tick's ONLY revival site). */
function parseWireUs(path: string, raw: unknown): string {
  if (typeof raw !== "string" || !INT_RE.test(raw)) {
    throw new TransportError("bad-field", path, "decimal integer string", raw);
  }
  if (BigInt(raw) < 0n) throw new TransportError("bad-field", path, "non-negative tick", raw);
  return raw;
}

function parseSignedWireUs(path: string, raw: unknown): string {
  if (typeof raw !== "string" || !INT_RE.test(raw)) {
    throw new TransportError("bad-field", path, "decimal integer string", raw);
  }
  return raw;
}

function parseSeq(path: string, raw: unknown): number {
  if (typeof raw !== "number" || !Number.isSafeInteger(raw) || raw < 0) {
    throw new TransportError("bad-field", path, "safe integer seq >= 0", raw);
  }
  return raw;
}

function parseInteger(path: string, raw: unknown): number {
  if (typeof raw !== "number" || !Number.isSafeInteger(raw)) {
    throw new TransportError("bad-field", path, "safe integer", raw);
  }
  return raw;
}

function parseBoolean(path: string, raw: unknown): boolean {
  if (typeof raw !== "boolean") throw new TransportError("bad-field", path, "boolean", raw);
  return raw;
}

function parseLiteral<T extends string>(path: string, raw: unknown, allowed: readonly T[]): T {
  for (const candidate of allowed) {
    if (raw === candidate) return candidate;
  }
  throw new TransportError("bad-kind", path, `one of ${allowed.join("|")}`, raw);
}

/** Unsafe-key law: an inbound payload is data, never code. `__proto__`,
 *  `constructor`, `prototype` at ANY nesting depth are refused outright —
 *  the same posture replay/canonical.ts takes toward keys it will fold into
 *  digests (a poison key surviving into payload means surviving into the
 *  shared log and every seat's re-parse of it). */
function assertSafeKeys(value: unknown, path: string): void {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertSafeKeys(entry, `${path}[${index}]`));
    return;
  }
  if (typeof value !== "object" || value === null) return;
  for (const key of Object.keys(value)) {
    if (UNSAFE_KEYS.has(key)) {
      throw new TransportError(
        "unsafe-key",
        `${path}.${key}`,
        "data keys only — __proto__/constructor/prototype are refused at every depth",
        key,
      );
    }
    assertSafeKeys((value as Record<string, unknown>)[key], `${path}.${key}`);
  }
}

function parsePayload(path: string, raw: unknown): Readonly<Record<string, unknown>> {
  const rec = isRecord(path, raw);
  assertSafeKeys(rec, path);
  return rec;
}

/* ═══════════════════════════ encode (trusted → bytes) ═══════════════════════════ */

/** bigint leaves (trusted CoopTimelineRecord ticks, wire-intent args carrying
 *  bigints through an in-process hub) cross as decimal strings — the same
 *  JSON-safe law WireUs already obeys. Client-side revival: reviveHubArgs. */
function bigintReplacer(_key: string, value: unknown): unknown {
  return typeof value === "bigint" ? value.toString() : value;
}

function stampDict(stamp: StampWire): { tick: string; seq: number } {
  return { tick: stamp.tick, seq: stamp.seq };
}

function recordDict(record: CoopTimelineRecord): Record<string, unknown> {
  return {
    participantId: record.participantId,
    tick: record.tick.toString(),
    seq: record.seq,
    kind: record.kind,
    payload: record.payload,
  };
}

function cellDict(cell: TransportCellWire): Record<string, unknown> {
  return {
    key: cell.key,
    encoding: cell.encoding,
    value: cell.value,
    fidelity: cell.fidelity,
    freshnessUs: cell.freshnessUs,
    coverage: cell.coverage,
    certainty: cell.certainty,
    status: cell.status,
  };
}

function viewDict(view: SeatViewWire): { cells: Record<string, unknown>[] } {
  return { cells: view.cells.map(cellDict) };
}

function holderDict(holder: SeatLedgerWire["seatHolders"][number]): Record<string, unknown> {
  return {
    participantId: holder.participantId,
    joinedAtTick: holder.joinedAtTick,
    // omit-when-unset: a null leftAtTick key is NEVER posted (absence is the
    // seated sentinel; the decoder still absorbs null to absent, S-12 twin).
    ...(holder.leftAtTick === undefined ? {} : { leftAtTick: holder.leftAtTick }),
  };
}

function ledgerDict(ledger: SeatLedgerWire): { seatHolders: Record<string, unknown>[] } {
  return { seatHolders: ledger.seatHolders.map(holderDict) };
}

/** Key order fixed BY CONSTRUCTION: every frame is rebuilt from its typed
 *  fields in this literal order, so two honest producers encode byte-equal
 *  regardless of their object-insertion history. */
function toOrderedWire(frame: TransportFrame): Record<string, unknown> {
  const head = { protocol: TRANSPORT_PROTOCOL, version: TRANSPORT_PROTOCOL_VERSION, kind: frame.kind };
  switch (frame.kind) {
    case "join":
      return {
        ...head,
        participantId: frame.participantId,
        ...(frame.clientTickHint === undefined ? {} : { clientTickHint: frame.clientTickHint }),
      };
    case "leave":
      return { ...head, participantId: frame.participantId };
    case "submit":
      return { ...head, participantId: frame.participantId, recordKind: frame.recordKind, payload: frame.payload };
    case "catchup-request":
      return {
        ...head,
        participantId: frame.participantId,
        after: frame.after === null ? null : stampDict(frame.after),
        ...(frame.limit === undefined ? {} : { limit: frame.limit }),
      };
    case "broadcast":
      return { ...head, record: recordDict(frame.record) };
    case "catchup-page":
      return {
        ...head,
        participantId: frame.participantId,
        from: frame.from === null ? null : stampDict(frame.from),
        to: frame.to === null ? null : stampDict(frame.to),
        records: frame.records.map(recordDict),
        hasMore: frame.hasMore,
      };
    case "seat-state":
      return {
        ...head,
        sentAtTick: frame.sentAtTick,
        ledger: ledgerDict(frame.ledger),
        lastStamp: frame.lastStamp === null ? null : stampDict(frame.lastStamp),
        ...(frame.view === undefined ? {} : { view: viewDict(frame.view) }),
      };
    case "fault":
      return { ...head, against: frame.against, cause: frame.cause };
  }
}

export function encodeFrame(frame: TransportFrame): string {
  return JSON.stringify(toOrderedWire(frame), bigintReplacer);
}

/* ═══════════════════════════ records + stamps + ledger ═══════════════════════════ */

export function encodeRecordWire(record: CoopTimelineRecord): {
  participantId: string;
  tick: string;
  seq: number;
  kind: CoopTimelineKind;
  payload: Readonly<Record<string, unknown>>;
} {
  const dict = recordDict(record);
  return {
    participantId: dict.participantId as string,
    tick: dict.tick as string,
    seq: dict.seq as number,
    kind: dict.kind as CoopTimelineKind,
    payload: dict.payload as Readonly<Record<string, unknown>>,
  };
}

/**
 * Wire dict → trusted CoopTimelineRecord. Revive the bigint tick HERE (the
 * one revival site), then delegate the whole record to replay's strict
 * parser — parseCoopTimelineRecord is the single record authority; this
 * codec adds only what JSON made impossible (the bigint) and the unsafe-key
 * wall (which the parser's asDictStrict cannot see, being about CONTENT keys
 * deeper in the payload). A parser rejection is re-thrown in transport
 * grammar carrying the upstream message verbatim.
 */
export function decodeRecordWire(raw: unknown, where: string): CoopTimelineRecord {
  const rec = isRecord(where, raw);
  const participantId = parseNonEmptyString(`${where}.participantId`, rec["participantId"]);
  const tickRaw = rec["tick"];
  if (typeof tickRaw !== "string" || !INT_RE.test(tickRaw)) {
    throw new TransportError("bad-field", `${where}.tick`, "decimal integer string (WireUs)", tickRaw);
  }
  const tick = BigInt(tickRaw);
  if (tick < 0n) throw new TransportError("bad-field", `${where}.tick`, "non-negative tick", tickRaw);
  const seq = parseSeq(`${where}.seq`, rec["seq"]);
  const kind = parseLiteral(`${where}.kind`, rec["kind"], COOP_TIMELINE_KINDS);
  const payload = parsePayload(`${where}.payload`, rec["payload"]);
  try {
    return parseCoopTimelineRecord({ participantId, tick, seq, kind, payload }, where);
  } catch (error) {
    throw new TransportError(
      "bad-field",
      where,
      `record accepted by the strict coopTimeline parser — upstream said: ${error instanceof Error ? error.message : String(error)}`,
      raw,
    );
  }
}

export function decodeStampWire(raw: unknown, where: string): StampWire {
  const rec = isRecord(where, raw);
  return { tick: parseWireUs(`${where}.tick`, rec["tick"]), seq: parseSeq(`${where}.seq`, rec["seq"]) };
}

export function encodeStampWire(stamp: { tick: bigint; seq: number }): StampWire {
  return { tick: stamp.tick.toString(), seq: stamp.seq };
}

/** Trusted save/coop ledger → wire (bigints → decimal strings; the undefined
 *  leftAtTick drops the key entirely). */
export function ledgerToWire(ledger: CoopNodeMetadata): SeatLedgerWire {
  return {
    seatHolders: Object.freeze(
      ledger.seatHolders.map((holder: SeatHolder) =>
        Object.freeze({
          participantId: holder.participantId,
          joinedAtTick: holder.joinedAtTick.toString(),
          ...(holder.leftAtTick === undefined ? {} : { leftAtTick: holder.leftAtTick.toString() }),
        }),
      ),
    ),
  };
}

/* ═══════════════════════════ frames (boundary parse) ═══════════════════════════ */

function parseStampOrNull(path: string, raw: unknown): StampWire | null {
  if (raw === null) return null;
  return decodeStampWire(raw, path);
}

function parseLedgerWire(path: string, raw: unknown): SeatLedgerWire {
  const rec = isRecord(path, raw);
  const rows = rec["seatHolders"];
  if (!Array.isArray(rows)) throw new TransportError("bad-field", `${path}.seatHolders`, "array of seat rows", rows);
  const seatHolders = rows.map((entry, index): SeatLedgerWire["seatHolders"][number] => {
    const where = `${path}.seatHolders[${index}]`;
    const holder = isRecord(where, entry);
    const participantId = parseNonEmptyString(`${where}.participantId`, holder["participantId"]);
    const joinedAtTick = parseWireUs(`${where}.joinedAtTick`, holder["joinedAtTick"]);
    const leftRaw = holder["leftAtTick"];
    if (leftRaw === undefined) return Object.freeze({ participantId, joinedAtTick });
    if (leftRaw === null) return Object.freeze({ participantId, joinedAtTick }); // S-12 absorb: null ≡ absent
    return Object.freeze({ participantId, joinedAtTick, leftAtTick: parseWireUs(`${where}.leftAtTick`, leftRaw) });
  });
  return Object.freeze({ seatHolders: Object.freeze(seatHolders) });
}

function parseViewWire(path: string, raw: unknown): SeatViewWire {
  const rec = isRecord(path, raw);
  const cellsRaw = rec["cells"];
  if (!Array.isArray(cellsRaw)) throw new TransportError("bad-field", `${path}.cells`, "array of cells", cellsRaw);
  const cells = cellsRaw.map((entry, index): TransportCellWire => {
    const where = `${path}.cells[${index}]`;
    const cell = isRecord(where, entry);
    const key = parseNonEmptyString(`${where}.key`, cell["key"]);
    const encoding = parseLiteral(`${where}.encoding`, cell["encoding"], ["fixed", "int", "text"] as const);
    const valueRaw = cell["value"];
    let value: number | string | null;
    if (valueRaw === null) {
      value = null;
    } else if (encoding === "fixed") {
      value = parseSignedWireUs(`${where}.value`, valueRaw);
    } else if (encoding === "int") {
      if (typeof valueRaw !== "number" || !Number.isFinite(valueRaw)) {
        throw new TransportError("bad-field", `${where}.value`, "finite number", valueRaw);
      }
      value = valueRaw;
    } else {
      if (typeof valueRaw !== "string") throw new TransportError("bad-field", `${where}.value`, "string", valueRaw);
      value = valueRaw;
    }
    const fidelity = parseInteger(`${where}.fidelity`, cell["fidelity"]);
    if (fidelity < 0 || fidelity > 4) {
      throw new TransportError("bad-field", `${where}.fidelity`, "ResolutionBand 0..4", cell["fidelity"]);
    }
    const status = parseLiteral(`${where}.status`, cell["status"], ["live", "stale", "unknown"] as const);
    return Object.freeze({
      key,
      encoding,
      value,
      fidelity,
      freshnessUs: parseWireUs(`${where}.freshnessUs`, cell["freshnessUs"]),
      coverage: parseSignedWireUs(`${where}.coverage`, cell["coverage"]),
      certainty: parseSignedWireUs(`${where}.certainty`, cell["certainty"]),
      status,
    });
  });
  return Object.freeze({ cells: Object.freeze(cells) });
}

/** THE boundary parse. Byte-cap first (never hand an unbounded string to a
 *  JSON parser), then protocol name, then version (both sides named on
 *  mismatch — a carrier talking to the wrong protocol needs a diagnosable
 *  refusal), then kind (closed — unknown kinds are refused even though
 *  unknown FIELDS are tolerated: a new kind is a new law), then fields.
 *  Returns deep-frozen trusted frames; unknown top-level keys are ignored. */
export function decodeFrame(raw: string): TransportFrame {
  if (raw.length > MAX_FRAME_BYTES || utf8Encode(raw).length > MAX_FRAME_BYTES) {
    throw new TransportError("oversize-frame", "frame", `at most ${MAX_FRAME_BYTES} UTF-8 bytes`, `${raw.length} code units`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new TransportError("bad-json", "frame", "JSON object", error instanceof Error ? error.message : String(error));
  }
  const rec = isRecord("frame", parsed);
  const protocol = rec["protocol"];
  if (protocol !== TRANSPORT_PROTOCOL) {
    throw new TransportError("bad-protocol", "frame.protocol", `protocol "${TRANSPORT_PROTOCOL}"`, protocol);
  }
  const version = rec["version"];
  if (version !== TRANSPORT_PROTOCOL_VERSION) {
    throw new TransportError("bad-version", "frame.version", `version ${TRANSPORT_PROTOCOL_VERSION}`, version);
  }
  const kind = parseLiteral("frame.kind", rec["kind"], TRANSPORT_FRAME_KINDS) as TransportFrameKind;
  return Object.freeze(parseBody(kind, rec));
}

function parseBody(kind: TransportFrameKind, rec: Readonly<Record<string, unknown>>): TransportFrame {
  switch (kind) {
    case "join": {
      const participantId = parseNonEmptyString("frame.participantId", rec["participantId"]);
      const hintRaw = rec["clientTickHint"];
      return Object.freeze({
        kind,
        protocol: TRANSPORT_PROTOCOL,
        version: TRANSPORT_PROTOCOL_VERSION,
        participantId,
        ...(hintRaw === undefined ? {} : { clientTickHint: parseWireUs("frame.clientTickHint", hintRaw) }),
      });
    }
    case "leave":
      return Object.freeze({
        kind,
        protocol: TRANSPORT_PROTOCOL,
        version: TRANSPORT_PROTOCOL_VERSION,
        participantId: parseNonEmptyString("frame.participantId", rec["participantId"]),
      });
    case "submit": {
      const participantId = parseNonEmptyString("frame.participantId", rec["participantId"]);
      const recordKind = parseLiteral("frame.recordKind", rec["recordKind"], COOP_TIMELINE_KINDS);
      const payload = parsePayload("frame.payload", rec["payload"]);
      return Object.freeze({ kind, protocol: TRANSPORT_PROTOCOL, version: TRANSPORT_PROTOCOL_VERSION, participantId, recordKind, payload });
    }
    case "catchup-request": {
      const participantId = parseNonEmptyString("frame.participantId", rec["participantId"]);
      const after = parseStampOrNull("frame.after", rec["after"]);
      const limitRaw = rec["limit"];
      if (limitRaw === undefined) {
        return Object.freeze({ kind, protocol: TRANSPORT_PROTOCOL, version: TRANSPORT_PROTOCOL_VERSION, participantId, after });
      }
      if (typeof limitRaw !== "number" || !Number.isSafeInteger(limitRaw) || limitRaw < 1) {
        throw new TransportError("bad-limit", "frame.limit", "safe integer page limit >= 1", limitRaw);
      }
      return Object.freeze({ kind, protocol: TRANSPORT_PROTOCOL, version: TRANSPORT_PROTOCOL_VERSION, participantId, after, limit: limitRaw });
    }
    case "broadcast":
      return Object.freeze({
        kind,
        protocol: TRANSPORT_PROTOCOL,
        version: TRANSPORT_PROTOCOL_VERSION,
        record: decodeRecordWire(rec["record"], "frame.record"),
      });
    case "catchup-page": {
      const participantId = parseNonEmptyString("frame.participantId", rec["participantId"]);
      const recordsRaw = rec["records"];
      if (!Array.isArray(recordsRaw)) throw new TransportError("bad-field", "frame.records", "array of records", recordsRaw);
      return Object.freeze({
        kind,
        protocol: TRANSPORT_PROTOCOL,
        version: TRANSPORT_PROTOCOL_VERSION,
        participantId,
        from: parseStampOrNull("frame.from", rec["from"]),
        to: parseStampOrNull("frame.to", rec["to"]),
        records: Object.freeze(recordsRaw.map((entry, index) => decodeRecordWire(entry, `frame.records[${index}]`))),
        hasMore: parseBoolean("frame.hasMore", rec["hasMore"]),
      });
    }
    case "seat-state":
      return Object.freeze({
        kind,
        protocol: TRANSPORT_PROTOCOL,
        version: TRANSPORT_PROTOCOL_VERSION,
        sentAtTick: parseWireUs("frame.sentAtTick", rec["sentAtTick"]),
        ledger: parseLedgerWire("frame.ledger", rec["ledger"]),
        lastStamp: parseStampOrNull("frame.lastStamp", rec["lastStamp"]),
        ...(rec["view"] === undefined ? {} : { view: parseViewWire("frame.view", rec["view"]) }),
      });
    case "fault":
      return Object.freeze({
        kind,
        protocol: TRANSPORT_PROTOCOL,
        version: TRANSPORT_PROTOCOL_VERSION,
        against: parseNonEmptyString("frame.against", rec["against"]),
        cause: parseNonEmptyString("frame.cause", rec["cause"]),
      });
  }
}

/** Canonical payload identity — the client idempotence law compares payloads
 *  through THIS function (key order never matters; bigint-safe). */
export function payloadIdentity(payload: Readonly<Record<string, unknown>>): string {
  return encodeCanonicalJson(payload);
}
