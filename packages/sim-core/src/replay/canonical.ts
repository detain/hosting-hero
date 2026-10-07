/**
 * Canonical deterministic serializer + pure-TS digest (MASTER_REPORT §3.3
 * replay-artifact contract, §3.4 runtime-neutral discipline, §7.0 P0
 * "state-hash tripwire").
 *
 * Properties (each pinned by tests):
 *  - object keys are emitted in code-unit sorted order → key-insertion
 *    shuffles never change bytes (the "digest stability under key-shuffle"
 *    requirement; locale-free comparison, never `localeCompare`);
 *  - bigint survives EXACTLY as decimal text (never JSON-rejected, never
 *    rounded to float — §3.4 "integer-only arithmetic");
 *  - `Map`/`Set` preserve INSERTION order (§3.4 "Map insertion-order
 *    iteration only" — a reorder of state maps IS a divergence, so order
 *    is content here, unlike plain-object keys);
 *  - non-finite numbers (NaN/±Infinity) fail loud — floats must never
 *    touch replay state (CONVENTIONS §4);
 *  - signed zero: −0 is normalised to +0 AT ENCODE in BOTH variants (the
 *    JSON wire could never carry the sign anyway — `JSON.stringify(-0)`
 *    is "0" — so one digest truth had to be picked; a −0 that hashes like
 *    0 is the honest single source, while `diffStates` still flags an
 *    unnormalised −0 vs +0 pair when two raw in-memory values are walked);
 *  - parse-side nesting is capped at `MAX_CANONICAL_DEPTH`: a crafted
 *    deeply-nested wire buffer throws ReplayError, never a raw RangeError
 *    stack-overflow (shared replay files are untrusted input — DoS law);
 *  - the 64-bit FNV-1a digest is computed over the canonical BINARY form,
 *    so the JSON variant and the binary variant of the same value always
 *    share one hash. No platform crypto anywhere: `node:crypto`/WebCrypto
 *    would break browser⇄Node parity (§3.4); collision resistance is not
 *    the property — bit-equality of the same recomputation is.
 *
 * Reserved-tag policy: string data is escaped on encode (leading "$" is
 * doubled) and unescaped on decode, so a payload that merely LOOKS like a
 * tag round-trips as plain data. Prototype-polluting keys are rejected at
 * the boundary.
 *
 * Sharing note: the primitive machinery (comparator, UTF-8, FNV-1a-64, the
 * tagged-JSON walk) lives in src/internal/canonical.ts — the single home
 * that replaced the hand-maintained forks. The HHC1 binary codec and the
 * depth-cap policy stay here (replay-only); error wording stays here via
 * the problem reporters below, so every legacy message survives verbatim.
 */

import {
  compareCodeUnits,
  decodeTaggedTree,
  describeCanonicalValue,
  encodeTaggedTree,
  fnv1a64OverBytes,
  isPlainCanonicalObject,
  isUnsafeObjectKey,
  normalizeSignedZero,
  utf8Encode,
  type CanonicalProblem,
  type CanonicalProblemReporter,
  type JsonValue,
} from "../internal/canonical.ts";
import type { HashHex } from "../types.ts";

export { compareCodeUnits } from "../internal/canonical.ts";
export type { JsonValue } from "../internal/canonical.ts";
export { utf8Encode } from "../internal/canonical.ts";

/* ═══════════════════════ Fail-loud error (shared by this dir) ═══════════════════════ */

/** Every replay-module rejection (bad wire data, cyclic state, unsafe key)
 *  throws this so callers can distinguish codec failures from bugs. */
export class ReplayError extends Error {
  constructor(message: string) {
    super(`replay: ${message}`);
    this.name = "ReplayError";
  }
}

/** Law-of-intentional-naming guards, reused across the replay module. */
export function requireDefined<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new ReplayError(`${what} is required but missing`);
  return value;
}

export function fail(what: string): never {
  throw new ReplayError(what);
}

/** Parse-side nesting cap (both codec variants + the diff walk). A replay
 *  file is UNTRUSTED input: recursion without a ceiling turns a 60 KB
 *  crafted buffer into a RangeError stack-overflow, violating the
 *  "every rejection throws ReplayError" law. Legit sim state nests in the
 *  tens; 512 leaves a generous margin above anything the sim can produce. */
export const MAX_CANONICAL_DEPTH = 512 as const;

/* ═══════════════════════ UTF-8 decoder (encoder shared via internal) ═══════════════════════ */

export function utf8Decode(bytes: Uint8Array, start: number, length: number): string {
  const parts: string[] = [];
  const end = start + length;
  let i = start;
  while (i < end) {
    const b0 = bytes[i] ?? fail(`utf8Decode: read past end at ${i}`);
    if (b0 < 0x80) {
      parts.push(String.fromCodePoint(b0));
      i += 1;
    } else if (b0 >= 0xc0 && b0 < 0xe0) {
      const b1 = continuation(bytes, i + 1, end);
      parts.push(String.fromCodePoint(((b0 & 0x1f) << 6) | b1));
      i += 2;
    } else if (b0 >= 0xe0 && b0 < 0xf0) {
      const b1 = continuation(bytes, i + 1, end);
      const b2 = continuation(bytes, i + 2, end);
      parts.push(String.fromCodePoint(((b0 & 0x0f) << 12) | (b1 << 6) | b2));
      i += 3;
    } else if (b0 >= 0xf0) {
      const b1 = continuation(bytes, i + 1, end);
      const b2 = continuation(bytes, i + 2, end);
      const b3 = continuation(bytes, i + 3, end);
      parts.push(String.fromCodePoint(((b0 & 0x07) << 18) | (b1 << 12) | (b2 << 6) | b3));
      i += 4;
    } else fail(`utf8Decode: invalid lead byte 0x${b0.toString(16)} at ${i}`);
  }
  return parts.join("");
}

function continuation(bytes: Uint8Array, at: number, end: number): number {
  if (at >= end) fail("utf8Decode: truncated multi-byte sequence");
  const b = bytes[at] as number;
  if ((b & 0xc0) !== 0x80) fail(`utf8Decode: invalid continuation byte 0x${b.toString(16)} at ${at}`);
  return b & 0x3f;
}

/* ═══════════════════════ Canonical BINARY variant (DataView) ═══════════════════════ */

/** Tag bytes — frozen once shipped, bump the frame version if they change. */
const T_NULL = 0x00;
const T_TRUE = 0x01;
const T_FALSE = 0x02;
const T_UNDEFINED = 0x03;
const T_STRING = 0x04;
const T_NUMBER = 0x05;
const T_BIGINT = 0x06;
const T_ARRAY = 0x07;
const T_MAP = 0x08;
const T_SET = 0x09;
const T_OBJECT = 0x0a;
const FRAME_MAGIC = 0x48484331; // "HHC1"
const FRAME_HEADER_BYTES = 8;

class ByteWriter {
  private readonly out: number[] = [];

  u8(value: number): void {
    this.out.push(value & 0xff);
  }

  u32(value: number): void {
    if (!Number.isSafeInteger(value) || value < 0 || value > 0xffff_ffff) {
      fail(`byteWriter.u32: ${value} out of range`);
    }
    const view = new DataView(new ArrayBuffer(4));
    view.setUint32(0, value);
    for (let i = 0; i < 4; i += 1) this.out.push(view.getUint8(i) as number);
  }

  f64(value: number): void {
    const view = new DataView(new ArrayBuffer(8));
    view.setFloat64(0, value);
    for (let i = 0; i < 8; i += 1) this.out.push(view.getUint8(i) as number);
  }

  bytes(values: readonly number[]): void {
    for (const v of values) this.out.push(v & 0xff);
  }

  text(value: string): void {
    const encoded = utf8Encode(value);
    this.u32(encoded.length);
    this.bytes(encoded);
  }

  toUint8Array(): Uint8Array {
    return new Uint8Array(this.out);
  }
}

class ByteReader {
  private pos = 0;

  constructor(private readonly view: DataView) {}

  get offset(): number {
    return this.pos;
  }

  u8(): number {
    if (this.pos + 1 > this.view.byteLength) fail("byteReader: unexpected end of buffer");
    const v = this.view.getUint8(this.pos);
    this.pos += 1;
    return v;
  }

  u32(): number {
    if (this.pos + 4 > this.view.byteLength) fail("byteReader: unexpected end of buffer");
    const v = this.view.getUint32(this.pos);
    this.pos += 4;
    return v;
  }

  f64(): number {
    if (this.pos + 8 > this.view.byteLength) fail("byteReader: unexpected end of buffer");
    const v = this.view.getFloat64(this.pos);
    this.pos += 8;
    return v;
  }

  text(): string {
    const length = this.u32();
    if (this.pos + length > this.view.byteLength) fail("byteReader: string extends past buffer");
    const s = utf8Decode(new Uint8Array(this.view.buffer, this.view.byteOffset + this.pos, length), 0, length);
    this.pos += length;
    return s;
  }

  requireEnd(): void {
    if (this.pos !== this.view.byteLength) {
      fail(`byteReader: ${this.view.byteLength - this.pos} trailing byte(s) after canonical value`);
    }
  }
}

/** Encode any canonicalizable value to deterministic bytes (framed "HHC1"). */
export function encodeCanonicalBinary(value: unknown): Uint8Array {
  const writer = new ByteWriter();
  writer.u32(FRAME_MAGIC);
  writer.u32(FRAME_HEADER_BYTES);
  writeValue(writer, value, new Set<object>());
  return writer.toUint8Array();
}

/** Decode bytes produced by {@link encodeCanonicalBinary} back to the value
 *  (bigints restored, Maps/Sets rebuilt in stored order). */
export function decodeCanonicalBinary(bytes: Uint8Array): unknown {
  const view = new DataView(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  const reader = new ByteReader(view);
  const magic = reader.u32();
  if (magic !== FRAME_MAGIC) fail(`decodeCanonicalBinary: bad frame magic 0x${magic.toString(16)}`);
  const headerEnd = reader.u32();
  if (headerEnd !== FRAME_HEADER_BYTES) fail(`decodeCanonicalBinary: unsupported header length ${headerEnd}`);
  const value = readValue(reader, 0);
  reader.requireEnd();
  return value;
}

function writeValue(writer: ByteWriter, value: unknown, seen: Set<object>): void {
  if (value === null) return void writer.u8(T_NULL);
  if (value === undefined) return void writer.u8(T_UNDEFINED);
  if (typeof value === "boolean") return void writer.u8(value ? T_TRUE : T_FALSE);
  if (typeof value === "bigint") return void writeBigint(writer, value);
  if (typeof value === "number") return void writeNumber(writer, value);
  if (typeof value === "string") return void writeString(writer, value);
  if (Array.isArray(value)) return void writeArray(writer, value, seen);
  if (value instanceof Map) return void writeMap(writer, value, seen);
  if (value instanceof Set) return void writeSet(writer, value, seen);
  if (typeof value === "object" && isPlainCanonicalObject(value)) return void writeObject(writer, value, seen);
  return fail(`encodeCanonicalBinary: unsupported value ${describeCanonicalValue(value)}`);
}

function writeBigint(writer: ByteWriter, value: bigint): void {
  writer.u8(T_BIGINT);
  writer.text(value.toString(10)); // exact decimal — never float-rounded
}

function writeNumber(writer: ByteWriter, value: number): void {
  if (!Number.isFinite(value)) {
    fail(`encodeCanonicalBinary: non-finite number ${String(value)} is banned from replay state (CONVENTIONS §4)`);
  }
  writer.u8(T_NUMBER);
  writer.f64(normalizeSignedZero(value)); // one digest truth: −0 never reaches the wire
}

function writeString(writer: ByteWriter, value: string): void {
  writer.u8(T_STRING);
  writer.text(value);
}

function guardCycle(seen: Set<object>, value: object): void {
  if (seen.has(value)) fail("encodeCanonicalBinary: cyclic structure is not canonicalizable");
  seen.add(value);
}

function writeArray(writer: ByteWriter, value: readonly unknown[], seen: Set<object>): void {
  guardCycle(seen, value);
  writer.u8(T_ARRAY);
  writer.u32(value.length);
  for (const item of value) writeValue(writer, item, seen);
  seen.delete(value);
}

function writeMap(writer: ByteWriter, value: Map<unknown, unknown>, seen: Set<object>): void {
  guardCycle(seen, value);
  writer.u8(T_MAP);
  writer.u32(value.size);
  for (const [k, v] of value) {
    writeValue(writer, k, seen);
    writeValue(writer, v, seen);
  }
  seen.delete(value);
}

function writeSet(writer: ByteWriter, value: Set<unknown>, seen: Set<object>): void {
  guardCycle(seen, value);
  writer.u8(T_SET);
  writer.u32(value.size);
  for (const item of value) writeValue(writer, item, seen);
  seen.delete(value);
}

function writeObject(writer: ByteWriter, value: Record<string, unknown>, seen: Set<object>): void {
  guardCycle(seen, value);
  const keys = Object.keys(value).sort(compareCodeUnits);
  for (const key of keys) {
    if (isUnsafeObjectKey(key)) fail(`encodeCanonicalBinary: unsafe object key "${key}"`);
  }
  writer.u8(T_OBJECT);
  writer.u32(keys.length);
  for (const key of keys) {
    writeString(writer, key);
    writeValue(writer, value[key], seen);
  }
  seen.delete(value);
}

function readValue(reader: ByteReader, depth: number): unknown {
  if (depth > MAX_CANONICAL_DEPTH) {
    fail(`decodeCanonicalBinary: nesting exceeds depth cap ${MAX_CANONICAL_DEPTH} (crafted input rejected, not overflowed)`);
  }
  const tag = reader.u8();
  switch (tag) {
    case T_NULL:
      return null;
    case T_UNDEFINED:
      return undefined;
    case T_TRUE:
      return true;
    case T_FALSE:
      return false;
    case T_BIGINT:
      return BigInt(reader.text());
    case T_NUMBER: {
      const n = reader.f64();
      if (!Number.isFinite(n)) fail(`decodeCanonicalBinary: non-finite number ${String(n)}`);
      return n;
    }
    case T_STRING:
      return reader.text();
    case T_ARRAY: {
      const length = reader.u32();
      const items: unknown[] = [];
      for (let i = 0; i < length; i += 1) items.push(readValue(reader, depth + 1));
      return items;
    }
    case T_MAP: {
      const size = reader.u32();
      const map = new Map<unknown, unknown>();
      for (let i = 0; i < size; i += 1) {
        const k = readValue(reader, depth + 1);
        map.set(k, readValue(reader, depth + 1));
      }
      return map;
    }
    case T_SET: {
      const size = reader.u32();
      const set = new Set<unknown>();
      for (let i = 0; i < size; i += 1) set.add(readValue(reader, depth + 1));
      return set;
    }
    case T_OBJECT: {
      const count = reader.u32();
      const obj: Record<string, unknown> = {};
      for (let i = 0; i < count; i += 1) {
        const key = readValue(reader, depth + 1);
        if (typeof key !== "string") fail("decodeCanonicalBinary: object key not a string");
        if (isUnsafeObjectKey(key)) fail(`decodeCanonicalBinary: unsafe object key "${key}"`);
        obj[key] = readValue(reader, depth + 1);
      }
      return obj;
    }
    default:
      return fail(`decodeCanonicalBinary: unknown tag 0x${tag.toString(16)}`);
  }
}

/* ═══════════════════════ Canonical JSON variant (tagged) ═══════════════════════
 * The tagged walk itself is shared (src/internal/canonical.ts); replay owns
 * only the wording of its rejections and the parse-side depth cap. The cycle
 * message keeps its historical "encodeCanonicalBinary:" label even on the
 * JSON path — the guard was written first for the binary codec and shipped;
 * byte-for-byte message stability beats tidiness here.
 */

const reportEncode: CanonicalProblemReporter = (problem: CanonicalProblem): never => {
  switch (problem.kind) {
    case "non-finite-number":
      return fail(`encodeCanonicalJson: non-finite number ${String(problem.value)} is banned from replay state (CONVENTIONS §4)`);
    case "unsafe-object-key":
      return fail(`encodeCanonicalJson: unsafe object key "${problem.key}"`);
    case "cyclic-structure":
      return fail("encodeCanonicalBinary: cyclic structure is not canonicalizable");
    case "unsupported-value":
      return fail(`encodeCanonicalJson: unsupported value ${describeCanonicalValue(problem.value)}`);
    case "malformed-map-entry":
      return fail("encodeCanonicalJson: malformed $m entry"); // encode never emits a tag tree to re-read
    case "depth-cap-exceeded":
      return fail(`encodeCanonicalJson: nesting exceeds depth cap ${problem.cap}`); // encoding trusts in-memory state, uncapped
  }
};

const reportDecode: CanonicalProblemReporter = (problem: CanonicalProblem): never => {
  switch (problem.kind) {
    case "depth-cap-exceeded":
      return fail(`decodeCanonicalJson: nesting exceeds depth cap ${problem.cap} (crafted input rejected, not overflowed)`);
    case "malformed-map-entry":
      return fail("decodeCanonicalJson: malformed $m entry");
    case "unsafe-object-key":
      return fail(`decodeCanonicalJson: unsafe object key "${problem.key}"`);
    case "non-finite-number":
      return fail(`decodeCanonicalJson: non-finite number ${String(problem.value)}`);
    case "cyclic-structure":
      return fail("decodeCanonicalBinary: cyclic structure is not canonicalizable");
    case "unsupported-value":
      return fail(`decodeCanonicalJson: unsupported value ${describeCanonicalValue(problem.value)}`);
  }
};

/** Deterministic JSON text: sorted object keys, bigint as `{"$i":"123"}`,
 *  Map as `{"$m":[[k,v]…]}` (insertion order), Set as `{"$s":[…]}`. */
export function encodeCanonicalJson(value: unknown): string {
  return JSON.stringify(encodeTaggedTree(value, reportEncode)) ?? fail("encodeCanonicalJson: stringify returned undefined");
}

/** Parse {@link encodeCanonicalJson} text back to the value. */
export function decodeCanonicalJson(text: string): unknown {
  let parsed: JsonValue;
  try {
    parsed = JSON.parse(text) as JsonValue;
  } catch (cause) {
    return fail(`decodeCanonicalJson: invalid JSON (${String(cause)})`);
  }
  return decodeTaggedTree(parsed, reportDecode, MAX_CANONICAL_DEPTH);
}

/* ═══════════════════════ Pure-TS FNV-1a-64 digest ═══════════════════════ */

/** FNV-1a 64-bit over bytes, then a splitmix-style avalanche so near-miss
 *  states (one flipped µs) differ far apart in hex. 16 lowercase hex chars.
 *  (Mechanism shared via src/internal/canonical.ts; this name is replay's
 *  public face of it.) */
export function fnv1a64Hex(bytes: Uint8Array): HashHex {
  return fnv1a64OverBytes(bytes);
}

/** FNV-1a 64-bit over a string's UTF-8 bytes. */
export function fnv1a64Text(text: string): HashHex {
  return fnv1a64Hex(new Uint8Array(utf8Encode(text)));
}

/** THE state-hash for capture & verification: digest of the canonical
 *  binary form, so JSON-encoded and binary-encoded copies of one state
 *  always share it. Callers that must match an external digest function
 *  (e.g. pipeline's `digestState`) pass their own to capture/verify. */
export function digestCanonicalValue(value: unknown): HashHex {
  return fnv1a64Hex(encodeCanonicalBinary(value));
}
