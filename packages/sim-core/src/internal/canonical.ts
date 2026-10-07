/**
 * SHARED canonical machinery — the single home for the primitives that were
 * hand-forked across replay / save / observed / loader / pipeline(intent-door).
 *
 * This module is INTERNAL: it is not re-exported from the package barrels and
 * not reachable through the package.json exports map. Domain modules wrap it
 * and keep their own public names; error wording, depth policy, and digest
 * DOMAIN choices stay with each caller (mechanism lives here, policy does not).
 *
 * What lives here and who uses it:
 *  - `compareCodeUnits` — the pinned code-unit order (§3.4, never locale).
 *    replay/canonical.ts re-exports it; observed/store.ts, loader/packs.ts,
 *    save/canonical.ts and pipeline/intent-door.ts sort with it.
 *  - `utf8Encode` / `utf8Bytes` — hand-rolled code-point UTF-8 (runtime-
 *    identical bytes browser⇄Node, no TextEncoder dependency).
 *  - `fnv1a64OverBytes` — FNV-1a over BYTES plus splitmix-style avalanche
 *    (the replay/save digest family; `fnv1a64Text`/`digestSaveValue` build
 *    on it; save's TEXT-vs-replay's BINARY digest domains are each caller
 *    policy and are deliberately NOT merged).
 *  - `fnv1a64OverCodePoints` — FNV-1a walking code points, NO avalanche
 *    (the kernel `hashTextFast` family; observed's `hh-canon-v1` composite
 *    fold and the intent-door M3 rule-book fold hash text through this).
 *  - `encodeTaggedTree` / `decodeTaggedTree` — the tagged-JSON walk shared
 *    by replay's `encodeCanonicalJson` and save's `canonicalJson`. The two
 *    forks were byte-identical on output (verified by the S-3 parity
 *    tripwire over adversarial fixtures); the only walk difference was save
 *    omitting the explicit −0 normalisation, which is unobservable because
 *    `JSON.stringify(-0)` is `"0"` anyway. Everything that genuinely
 *    differed — error strings, the depth cap, the cycle-message label —
 *    is injected via `report` (fail-loud, caller-worded) and `maxDepth`.
 *
 * Dependency law: this file imports NOTHING (not even ../types.ts — `HashHex`
 * is a plain `string` alias there; returning `string` keeps the strictest
 * possible boundary). Callers cast/annotate to their own domain types.
 */

/* ═══════════════════════ comparators & predicates ═══════════════════════ */

/** Code-unit comparison (§3.4: pinned order, never locale). */
export function compareCodeUnits(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

const UNSAFE_OBJECT_KEYS: readonly string[] = ["__proto__", "constructor", "prototype"];

/** Prototype-polluting keys are rejected at every canonical boundary. */
export function isUnsafeObjectKey(key: string): boolean {
  return UNSAFE_OBJECT_KEYS.includes(key);
}

/** Only plain data objects (Object.prototype or null) are canonicalizable. */
export function isPlainCanonicalObject(value: object): value is Record<string, unknown> {
  const proto: unknown = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/** −0 → +0: the JSON wire could never carry the sign (`JSON.stringify(-0)`
 *  is "0"), so one digest truth had to be picked — normalise at encode. */
export function normalizeSignedZero(value: number): number {
  return Object.is(value, -0) ? 0 : value;
}

/** How replay describes a rejected value: constructor name for objects,
 *  String(v) otherwise. */
export function describeCanonicalValue(value: unknown): string {
  return typeof value === "object" && value !== null
    ? (Object.getPrototypeOf(value)?.constructor?.name ?? "object")
    : String(value);
}

/* ═══════════════════════ JSON value type ═══════════════════════ */

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | readonly JsonValue[]
  | { readonly [k: string]: JsonValue };

/* ═══════════════════════ hand-rolled UTF-8 ═══════════════════════ */

/** Code-point based UTF-8 — no TextEncoder dependency keeps every runtime
 *  byte-identical (browser⇄Node parity, RISK-1). */
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

/** The same bytes as {@link utf8Encode}, wrapped. */
export function utf8Bytes(text: string): Uint8Array {
  return new Uint8Array(utf8Encode(text));
}

/* ═══════════════════════ FNV-1a-64 families ═══════════════════════ */

const MASK64 = (1n << 64n) - 1n;
const FNV_OFFSET64 = 0xcbf29ce484222325n;
const FNV_PRIME64 = 0x100000001b3n;

/** FNV-1a 64-bit over bytes, then a splitmix-style avalanche so near-miss
 *  inputs differ far apart in hex. 16 lowercase hex chars. (replay/save
 *  digest family.) */
export function fnv1a64OverBytes(bytes: Uint8Array): string {
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

/** FNV-1a 64-bit walking CODE POINTS of a string, NO avalanche — the fast
 *  tripwire family (kernel `hashTextFast` shape) used by observed's
 *  `hh-canon-v1` composite fold and the intent-door rule-book fold.
 *  Collisions are acceptable for a tripwire; bit-equality of the same
 *  recomputation is the property. 16 lowercase hex chars. */
export function fnv1a64OverCodePoints(text: string): string {
  let h = FNV_OFFSET64;
  for (const ch of text) {
    h = ((h ^ BigInt(ch.codePointAt(0) as number)) * FNV_PRIME64) & MASK64;
  }
  return h.toString(16).padStart(16, "0");
}

/* ═══════════════════════ tagged-JSON walk (mechanism; policy injected) ═══════════════════════ */

/** Sentinel `maxDepth` for domains that cap nesting nowhere (save). */
export const NO_DEPTH_LIMIT = Number.POSITIVE_INFINITY;

/** Everything the walker can reject. The walker never throws itself — it
 *  calls `report`, which MUST throw, so the domain owns wording (and error
 *  class) while the mechanism stays single-sourced. */
export type CanonicalProblem =
  | { readonly kind: "non-finite-number"; readonly value: number }
  | { readonly kind: "unsafe-object-key"; readonly key: string; readonly side: "encode" | "decode" }
  | { readonly kind: "cyclic-structure" }
  | { readonly kind: "unsupported-value"; readonly value: unknown }
  | { readonly kind: "malformed-map-entry" }
  | { readonly kind: "depth-cap-exceeded"; readonly cap: number };

export type CanonicalProblemReporter = (problem: CanonicalProblem) => never;

/* Reserved tags: `$i/$u/$m/$s`. A data object carrying ANY "$"-prefixed key
 * is escaped by prefixing each key with one extra "$"; a data string with a
 * leading "$" is doubled — so tag-shaped payloads round-trip as plain data. */
const TAG_INT = "$i";
const TAG_UNDEF = "$u";
const TAG_MAP = "$m";
const TAG_SET = "$s";

/** Build the tagged tree (the pre-`JSON.stringify` shape shared by
 *  replay's `encodeCanonicalJson` and save's `canonicalJson`):
 *  undefined → `{"$u":1}`, bigint → `{"$i":"dec"}`, −0 normalised,
 *  Map → `{"$m":[[k,v]…]}` insertion order, Set → `{"$s":[…]}`,
 *  plain objects with code-unit-sorted, $-escaped keys. */
export function encodeTaggedTree(value: unknown, report: CanonicalProblemReporter): JsonValue {
  return toTagged(value, new Set<object>(), report);
}

function toTagged(value: unknown, seen: Set<object>, report: CanonicalProblemReporter): JsonValue {
  if (value === null) return null;
  if (value === undefined) return singleTag(TAG_UNDEF, 1);
  if (typeof value === "boolean") return value;
  if (typeof value === "bigint") return singleTag(TAG_INT, value.toString(10));
  if (typeof value === "number") {
    if (!Number.isFinite(value)) report({ kind: "non-finite-number", value });
    return normalizeSignedZero(value);
  }
  if (typeof value === "string") return escapeDataString(value);
  if (Array.isArray(value)) {
    guardCycle(seen, value, report);
    const items = value.map((item) => toTagged(item, seen, report));
    seen.delete(value);
    return items;
  }
  if (value instanceof Map) {
    guardCycle(seen, value, report);
    const pairs: JsonValue[] = [];
    for (const [k, v] of value) pairs.push([toTagged(k, seen, report), toTagged(v, seen, report)]);
    seen.delete(value);
    return singleTag(TAG_MAP, pairs);
  }
  if (value instanceof Set) {
    guardCycle(seen, value, report);
    const items = [...value].map((item) => toTagged(item, seen, report));
    seen.delete(value);
    return singleTag(TAG_SET, items);
  }
  if (typeof value === "object" && isPlainCanonicalObject(value)) {
    guardCycle(seen, value, report);
    const keys = Object.keys(value).sort(compareCodeUnits);
    for (const key of keys) {
      if (isUnsafeObjectKey(key)) report({ kind: "unsafe-object-key", key, side: "encode" });
    }
    // Per-key escape: any "$"-prefixed key gains one extra "$" — exactly
    // inverted by the decoder's strip (wire keys never start with a lone
    // "$" unless they are tags).
    const out: { [k: string]: JsonValue } = {};
    for (const key of keys) {
      const emitted = key.startsWith("$") ? `$${key}` : key;
      out[emitted] = toTagged(value[key], seen, report);
    }
    seen.delete(value);
    return out;
  }
  return report({ kind: "unsupported-value", value });
}

function singleTag(tag: string, payload: JsonValue): { readonly [k: string]: JsonValue } {
  return { [tag]: payload };
}

/** Leading-$ strings are doubled so `"$i:5"` as DATA never decodes as a tag. */
function escapeDataString(value: string): string {
  return value.startsWith("$") ? `$${value}` : value;
}

function guardCycle(seen: Set<object>, value: object, report: CanonicalProblemReporter): void {
  if (seen.has(value)) report({ kind: "cyclic-structure" });
  seen.add(value);
}

/** Inverse of {@link encodeTaggedTree}. `maxDepth` is caller policy: replay
 *  caps crafted wire input at 512 (DoS law), save decodes without a cap. */
export function decodeTaggedTree(
  parsed: unknown,
  report: CanonicalProblemReporter,
  maxDepth: number = NO_DEPTH_LIMIT,
): unknown {
  // NOTE: recursion stays arrow-wrapped — passing the walker bare to .map()
  // would feed the ARRAY INDEX in as the depth parameter.
  return fromTagged(parsed, 0);

  function fromTagged(value: unknown, depth: number): unknown {
    if (depth > maxDepth) report({ kind: "depth-cap-exceeded", cap: maxDepth });
    if (value === null) return null;
    if (Array.isArray(value)) return value.map((item) => fromTagged(item, depth + 1));
    if (typeof value === "object") {
      const dict = value as { readonly [k: string]: unknown };
      const keys = Object.keys(dict);
      if (keys.length === 1) {
        const key = keys[0] as string;
        const inner = dict[key] as unknown;
        if (key === TAG_INT && typeof inner === "string" && /^-?\d+$/.test(inner)) return BigInt(inner);
        if (key === TAG_UNDEF) return undefined;
        if (key === TAG_MAP && Array.isArray(inner)) {
          return new Map(
            inner.map((pair) => {
              if (!Array.isArray(pair) || pair.length !== 2) report({ kind: "malformed-map-entry" });
              return [fromTagged(pair[0], depth + 1), fromTagged(pair[1], depth + 1)];
            }),
          );
        }
        if (key === TAG_SET && Array.isArray(inner)) {
          return new Set(inner.map((item) => fromTagged(item, depth + 1)));
        }
      }
      const out: Record<string, unknown> = {};
      for (const key of keys) {
        if (isUnsafeObjectKey(key)) report({ kind: "unsafe-object-key", key, side: "decode" });
        const target = key.startsWith("$$") ? key.slice(1) : key;
        out[target] = fromTagged(dict[key], depth + 1);
      }
      return out;
    }
    if (typeof value === "string") {
      return value.startsWith("$$") ? value.slice(1) : value;
    }
    return value; // finite number | boolean (booleans arrive as data unchanged)
  }
}
