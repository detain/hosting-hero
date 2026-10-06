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
 */

import type { HashHex } from "../types.ts";

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

/* ═══════════════════════ Type predicates & tiny utilities ═══════════════════════ */

const UNSAFE_OBJECT_KEYS: readonly string[] = ["__proto__", "constructor", "prototype"];

function isUnsafeKey(key: string): boolean {
  return UNSAFE_OBJECT_KEYS.includes(key);
}

/** Code-unit comparison (§3.4: pinned order, never locale). */
export function compareCodeUnits(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function isPlainObject(value: object): value is Record<string, unknown> {
  const proto: unknown = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export type JsonValue = string | number | boolean | null | readonly JsonValue[] | { readonly [k: string]: JsonValue };

/** Hand-rolled UTF-8 (code-point based) — no TextEncoder dependency keeps
 *  this file identical on every runtime and test-able in pure TS. */
export function utf8Encode(text: string): number[] {
  const out: number[] = [];
  for (const ch of text) {
    const cp = ch.codePointAt(0) as number;
    if (cp < 0x80) out.push(cp);
    else if (cp < 0x800) out.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
    else if (cp < 0x10000) out.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    else out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
  }
  return out;
}

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
  if (typeof value === "object" && isPlainObject(value)) return void writeObject(writer, value, seen);
  return fail(`encodeCanonicalBinary: unsupported value ${describeValue(value)}`);
}

function describeValue(value: unknown): string {
  return typeof value === "object" && value !== null ? (Object.getPrototypeOf(value)?.constructor?.name ?? "object") : String(value);
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

/** −0 → +0 (see header): the JSON variant could not carry the sign, so the
 *  binary variant must not either — both encoders normalise identically. */
function normalizeSignedZero(value: number): number {
  return Object.is(value, -0) ? 0 : value;
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
    if (isUnsafeKey(key)) fail(`encodeCanonicalBinary: unsafe object key "${key}"`);
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
        if (isUnsafeKey(key)) fail(`decodeCanonicalBinary: unsafe object key "${key}"`);
        obj[key] = readValue(reader, depth + 1);
      }
      return obj;
    }
    default:
      return fail(`decodeCanonicalBinary: unknown tag 0x${tag.toString(16)}`);
  }
}

/* ═══════════════════════ Canonical JSON variant (tagged) ═══════════════════════ */

const TAG_INT = "$i";
const TAG_UNDEF = "$u";
const TAG_MAP = "$m";
const TAG_SET = "$s";
/* Reserved tags: `$i/$u/$m/$s`. A data object carrying ANY "$"-prefixed key
 * is escaped by prefixing each key with one extra "$"; a data string with a
 * leading "$" is doubled — so tag-shaped payloads round-trip as plain data. */

/** Deterministic JSON text: sorted object keys, bigint as `{"$i":"123"}`,
 *  Map as `{"$m":[[k,v]…]}` (insertion order), Set as `{"$s":[…]}`. */
export function encodeCanonicalJson(value: unknown): string {
  return JSON.stringify(toTaggedJson(value, new Set<object>())) ?? fail("encodeCanonicalJson: stringify returned undefined");
}

/** Parse {@link encodeCanonicalJson} text back to the value. */
export function decodeCanonicalJson(text: string): unknown {
  let parsed: JsonValue;
  try {
    parsed = JSON.parse(text) as JsonValue;
  } catch (cause) {
    return fail(`decodeCanonicalJson: invalid JSON (${String(cause)})`);
  }
  return fromTaggedJson(parsed, 0);
}

function toTaggedJson(value: unknown, seen: Set<object>): JsonValue {
  if (value === null) return null;
  if (value === undefined) return singleTag(TAG_UNDEF, 1);
  if (typeof value === "boolean") return value;
  if (typeof value === "bigint") return singleTag(TAG_INT, value.toString(10));
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      fail(`encodeCanonicalJson: non-finite number ${String(value)} is banned from replay state (CONVENTIONS §4)`);
    }
    return normalizeSignedZero(value); // mirrors the binary encoder — one digest truth
  }
  if (typeof value === "string") return escapeDataString(value);
  if (Array.isArray(value)) {
    guardCycle(seen, value);
    const items = value.map((item) => toTaggedJson(item, seen));
    seen.delete(value);
    return items;
  }
  if (value instanceof Map) {
    guardCycle(seen, value);
    const pairs: JsonValue[] = [];
    for (const [k, v] of value) pairs.push([toTaggedJson(k, seen), toTaggedJson(v, seen)]);
    seen.delete(value);
    return singleTag(TAG_MAP, pairs);
  }
  if (value instanceof Set) {
    guardCycle(seen, value);
    const items = [...value].map((item) => toTaggedJson(item, seen));
    seen.delete(value);
    return singleTag(TAG_SET, items);
  }
  if (typeof value === "object" && isPlainObject(value)) {
    guardCycle(seen, value);
    const keys = Object.keys(value).sort(compareCodeUnits);
    for (const key of keys) {
      if (isUnsafeKey(key)) fail(`encodeCanonicalJson: unsafe object key "${key}"`);
    }
    // Per-key escape: any "$"-prefixed key gains one extra "$" — exactly
    // inverted by the decoder's strip (wire keys never start with a lone
    // "$" unless they are tags).
    const out: { [k: string]: JsonValue } = {};
    for (const key of keys) {
      const emitted = key.startsWith("$") ? `$${key}` : key;
      out[emitted] = toTaggedJson(value[key], seen);
    }
    seen.delete(value);
    return out;
  }
  return fail(`encodeCanonicalJson: unsupported value ${describeValue(value)}`);
}

function singleTag(tag: string, payload: JsonValue): { readonly [k: string]: JsonValue } {
  return { [tag]: payload };
}

/** Leading-$ strings are doubled so `"$i:5"` as DATA never decodes as a tag. */
function escapeDataString(value: string): string {
  return value.startsWith("$") ? `$${value}` : value;
}

function fromTaggedJson(value: JsonValue, depth: number): unknown {
  if (depth > MAX_CANONICAL_DEPTH) {
    fail(`decodeCanonicalJson: nesting exceeds depth cap ${MAX_CANONICAL_DEPTH} (crafted input rejected, not overflowed)`);
  }
  if (value === null) return null;
  // NOTE: callbacks must stay arrow-wrapped — passing `fromTaggedJson` bare to
  // .map() would feed the ARRAY INDEX in as the depth parameter.
  if (Array.isArray(value)) return value.map((item) => fromTaggedJson(item, depth + 1));
  if (typeof value === "object") {
    // `readonly JsonValue[]` survives Array.isArray narrowing (TS limitation
    // with readonly tuples) — the array case already returned; cast to dict.
    const dict = value as { readonly [k: string]: JsonValue };
    const keys = Object.keys(dict);
    if (keys.length === 1) {
      const key = keys[0] as string;
      const inner = dict[key] as JsonValue;
      if (key === TAG_INT && typeof inner === "string" && /^-?\d+$/.test(inner)) return BigInt(inner);
      if (key === TAG_UNDEF) return undefined;
      if (key === TAG_MAP && Array.isArray(inner)) {
        return new Map(
          inner.map((pair) => {
            if (!Array.isArray(pair) || pair.length !== 2) fail("decodeCanonicalJson: malformed $m entry");
            return [fromTaggedJson(pair[0] as JsonValue, depth + 1), fromTaggedJson(pair[1] as JsonValue, depth + 1)];
          }),
        );
      }
      if (key === TAG_SET && Array.isArray(inner)) return new Set(inner.map((item) => fromTaggedJson(item, depth + 1)));
    }
    const out: Record<string, unknown> = {};
    for (const key of keys) {
      if (isUnsafeKey(key)) fail(`decodeCanonicalJson: unsafe object key "${key}"`);
      const target = key.startsWith("$$") ? key.slice(1) : key;
      out[target] = fromTaggedJson(dict[key] as JsonValue, depth + 1);
    }
    return out;
  }
  if (typeof value === "string") {
    return value.startsWith("$$") ? value.slice(1) : value;
  }
  return value; // finite number | boolean (booleans arrive as data unchanged)
}

/* ═══════════════════════ Pure-TS FNV-1a-64 digest ═══════════════════════ */

const MASK64 = (1n << 64n) - 1n;
const FNV_OFFSET64 = 0xcbf29ce484222325n;
const FNV_PRIME64 = 0x100000001b3n;

/** FNV-1a 64-bit over bytes, then a splitmix-style avalanche so near-miss
 *  states (one flipped µs) differ far apart in hex. 16 lowercase hex chars. */
export function fnv1a64Hex(bytes: Uint8Array): HashHex {
  let h = FNV_OFFSET64;
  for (let i = 0; i < bytes.length; i += 1) {
    h = ((h ^ BigInt(bytes[i] as number)) * FNV_PRIME64) & MASK64;
  }
  h = avalanche(h);
  return h.toString(16).padStart(16, "0");
}

function avalanche(z0: bigint): bigint {
  let z = z0 & MASK64;
  z = ((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n) & MASK64;
  z = ((z ^ (z >> 27n)) * 0x94d049bb133111ebn) & MASK64;
  return (z ^ (z >> 31n)) & MASK64;
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
