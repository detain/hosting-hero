/**
 * Deterministic stable serialization for save artifacts.
 *
 * ORDERING RULES ARE A LOCAL DUPLICATE of replay/canonical.ts (the save
 * workstream may not import ../replay — workstream boundary; the replay lane
 * owns that file). If those rules ever change, BOTH copies change — the
 * tripwire tests here pin the same properties:
 *
 *  - object keys emitted in code-unit sorted order → key-insertion shuffles
 *    never change bytes (never `localeCompare`, §3.4 runtime-neutral);
 *  - bigint survives EXACTLY as decimal text via the `{"$i":"…"}` tag —
 *    the Long Save is full of µs timestamps and µ$ money;
 *  - `Map`/`Set` preserve INSERTION order (order is content);
 *  - non-finite numbers fail loud; prototype-polluting keys fail loud;
 *  - data strings/keys with a leading "$" are doubled on encode and peeled
 *    on decode, so tag-shaped payloads round-trip as plain data.
 *
 * Tag set matches replay: `$i` bigint, `$u` undefined, `$m` Map, `$s` Set.
 *
 * Digest note (documented boundary): replay's `digestCanonicalValue` hashes
 * the canonical BINARY frame ("HHC1"); envelope digests here hash the
 * canonical JSON TEXT. Same value → same ordering → stable within each
 * domain; the two digest domains are deliberately separate artifacts
 * (state hash vs save-file hash) and are never compared against each other.
 */

import { fail } from "./errors.ts";

/* ═══════════════════════ tiny utilities (duplicated, see header) ═══════════════════════ */

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

/* ═══════════════════════ canonical JSON text ═══════════════════════ */

const TAG_INT = "$i";
const TAG_UNDEF = "$u";
const TAG_MAP = "$m";
const TAG_SET = "$s";

/** Deterministic JSON text: sorted keys, bigint `{"$i":"123"}`,
 *  Map `{"$m":[[k,v]…]}` (insertion order), Set `{"$s":[…]}`. */
export function canonicalJson(value: unknown): string {
  const encoded = encodeTagged(value, new Set<object>());
  return JSON.stringify(encoded) ?? fail("canonicalJson: stringify returned undefined");
}

/** Parse {@link canonicalJson} text back (bigints restored). */
export function fromCanonicalJson(text: string): unknown {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch (cause) {
    return fail(`fromCanonicalJson: invalid JSON (${String(cause)})`);
  }
  return decodeTagged(parsed);
}

function encodeTagged(value: unknown, seen: Set<object>): unknown {
  if (value === null) return null;
  if (value === undefined) return { [TAG_UNDEF]: 1 };
  if (typeof value === "boolean") return value;
  if (typeof value === "bigint") return { [TAG_INT]: value.toString(10) };
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      fail(`canonicalJson: non-finite number ${String(value)} is banned from save state (CONVENTIONS §4)`);
    }
    return value;
  }
  if (typeof value === "string") return value.startsWith("$") ? `$${value}` : value;
  if (Array.isArray(value)) {
    guardCycle(seen, value);
    const items = value.map((item) => encodeTagged(item, seen));
    seen.delete(value);
    return items;
  }
  if (value instanceof Map) {
    guardCycle(seen, value);
    const pairs: unknown[] = [];
    for (const [k, v] of value) pairs.push([encodeTagged(k, seen), encodeTagged(v, seen)]);
    seen.delete(value);
    return { [TAG_MAP]: pairs };
  }
  if (value instanceof Set) {
    guardCycle(seen, value);
    const items = [...value].map((item) => encodeTagged(item, seen));
    seen.delete(value);
    return { [TAG_SET]: items };
  }
  if (typeof value === "object" && isPlainObject(value)) {
    guardCycle(seen, value);
    const keys = Object.keys(value).sort(compareCodeUnits);
    for (const key of keys) {
      if (isUnsafeKey(key)) fail(`canonicalJson: unsafe object key "${key}"`);
    }
    const out: Record<string, unknown> = {};
    for (const key of keys) {
      out[key.startsWith("$") ? `$${key}` : key] = encodeTagged(value[key], seen);
    }
    seen.delete(value);
    return out;
  }
  return fail(`canonicalJson: unsupported value of type ${typeof value}`);
}

function guardCycle(seen: Set<object>, value: object): void {
  if (seen.has(value)) fail("canonicalJson: cyclic structure is not serializable");
  seen.add(value);
}

function decodeTagged(value: unknown): unknown {
  if (value === null) return null;
  if (Array.isArray(value)) return value.map(decodeTagged);
  if (typeof value === "object") {
    const dict = value as Record<string, unknown>;
    const keys = Object.keys(dict);
    if (keys.length === 1) {
      const key = keys[0] as string;
      const inner = dict[key] as unknown;
      if (key === TAG_INT && typeof inner === "string" && /^-?\d+$/.test(inner)) return BigInt(inner);
      if (key === TAG_UNDEF) return undefined;
      if (key === TAG_MAP && Array.isArray(inner)) {
        return new Map(
          inner.map((pair) => {
            if (!Array.isArray(pair) || pair.length !== 2) fail("fromCanonicalJson: malformed $m entry");
            return [decodeTagged(pair[0]), decodeTagged(pair[1])];
          }),
        );
      }
      if (key === TAG_SET && Array.isArray(inner)) return new Set(inner.map(decodeTagged));
    }
    const out: Record<string, unknown> = {};
    for (const key of keys) {
      if (isUnsafeKey(key)) fail(`fromCanonicalJson: unsafe object key "${key}"`);
      out[key.startsWith("$$") ? key.slice(1) : key] = decodeTagged(dict[key]);
    }
    return out;
  }
  if (typeof value === "string") return value.startsWith("$$") ? value.slice(1) : value;
  return value;
}

/* ═══════════════════════ pure-TS FNV-1a-64 digest (duplicated) ═══════════════════════ */

const MASK64 = (1n << 64n) - 1n;
const FNV_OFFSET64 = 0xcbf29ce484222325n;
const FNV_PRIME64 = 0x100000001b3n;

/** Hand-rolled UTF-8 (code-point based) — runtime-identical bytes browser⇄Node. */
export function utf8Bytes(text: string): Uint8Array {
  const out: number[] = [];
  for (const ch of text) {
    const cp = ch.codePointAt(0) as number;
    if (cp < 0x80) out.push(cp);
    else if (cp < 0x800) out.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
    else if (cp < 0x10000) out.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    else out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
  }
  return new Uint8Array(out);
}

/** FNV-1a 64-bit over bytes + splitmix-style avalanche. 16 lowercase hex. */
export function fnv1a64Hex(bytes: Uint8Array): string {
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

/** Digest of any save artifact value: FNV-1a-64 over its canonical JSON.
 *  Bit-equality of the same recomputation is the property, not collision
 *  resistance; no platform crypto (browser⇄Node parity, §3.4 / RISK-1). */
export function digestSaveValue(value: unknown): string {
  return fnv1a64Hex(utf8Bytes(canonicalJson(value)));
}

/** Clone through the canonical codec: bigint-exact, insertion-order-exact.
 *  The test-workhorse way to get a fresh copy of wire data without trusting
 *  structuredClone's runtime variance. */
export function canonicalClone<T>(value: T): T {
  return fromCanonicalJson(canonicalJson(value)) as T;
}
