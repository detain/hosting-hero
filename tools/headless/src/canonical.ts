/**
 * Canonical serialization + state hashing — runtime-neutral by construction.
 *
 * Rules (docs/ARCHITECTURE.md §6, MASTER_REPORT §3.4 — parity is the gate):
 *  - plain objects serialize with keys sorted lexicographically (code-unit);
 *  - `Map`s serialize as `{"#map":[[k,v],…]}` preserving INSERTION order —
 *    the contract's only sanctioned iteration order (types.ts: "Map-insertion-
 *    order only");
 *  - `bigint` serializes as `{"#bi":"-123"}`;
 *  - `number` is admitted ONLY as a safe integer — a float reaching the
 *    canonicalizer means a float leaked into state, and we fail loud (Law 4);
 *  - the digest is double FNV-1a/64 over UTF-16 code units (32 lowercase
 *    hex chars). No platform crypto: `node:crypto`/WebCrypto byte-order
 *    questions are exactly the parity surface we are trying to certify.
 *
 * This module must never import `node:*`. It is also what `digest <state.json>`
 * and every checkpoint/hash in the CLI runs through.
 */

export type CanonicalValue =
  | null
  | boolean
  | string
  | number
  | CanonicalValue[]
  | { readonly [key: string]: CanonicalValue };

/** Anything the encoder accepts from sim state (adds bigint + Map). */
export type EncodableState = unknown;

const MAP_TAG = "#map";
const BIGINT_TAG = "#bi";
const SET_TAG = "#set";

/** Encode trusted sim state into a canonical JSON value tree. */
export function canonicalize(value: EncodableState, path: string): CanonicalValue {
  if (value === null) return null;

  const kind = typeof value;

  if (kind === "boolean" || kind === "string") return value as boolean | string;

  if (kind === "bigint") return { [BIGINT_TAG]: (value as bigint).toString() };

  if (kind === "number") {
    const n = value as number;
    // Display floats must never enter state; fail loud, name the offender.
    if (!Number.isSafeInteger(n)) {
      throw new Error(`canonicalize: non-integer number at ${path}: ${String(n)}`);
    }
    return n;
  }

  if (kind === "undefined") {
    throw new Error(`canonicalize: undefined at ${path} (use explicit null)`);
  }

  if (kind === "function" || kind === "symbol") {
    throw new Error(`canonicalize: ${kind} at ${path} is not serializable`);
  }

  if (Array.isArray(value)) {
    return value.map((item, i) => canonicalize(item, `${path}[${String(i)}]`));
  }

  if (value instanceof Map) {
    const entries: CanonicalValue[] = [];
    let i = 0;
    for (const [k, v] of value) {
      entries.push([
        canonicalize(k, `${path}<key ${String(i)}>`),
        canonicalize(v, `${path}<value ${String(i)}>`),
      ]);
      i += 1;
    }
    return { [MAP_TAG]: entries };
  }

  if (value instanceof Set) {
    const items: CanonicalValue[] = [];
    let i = 0;
    for (const v of value) {
      items.push(canonicalize(v, `${path}<member ${String(i)}>`));
      i += 1;
    }
    return { [SET_TAG]: items };
  }

  if (kind === "object") {
    const source = value as Record<string, unknown>;
    const keys = Object.keys(source).sort();
    const out: Record<string, CanonicalValue> = {};
    for (const key of keys) {
      const child = source[key];
      if (child === undefined) continue; // absent optional ≡ not present
      out[key] = canonicalize(child, `${path}.${key}`);
    }
    return out;
  }

  throw new Error(`canonicalize: unhandled typeof ${kind} at ${path}`);
}

/** Serialize a canonical tree to compact JSON. Keys are already sorted. */
export function serializeCanonical(canonical: CanonicalValue): string {
  return JSON.stringify(canonical, (_key, v: unknown) => v) ?? "null";
}

const FNV_OFFSET_BASIS_64 = 14695981039346656037n;
const FNV_PRIME_64 = 1099511628211n;
const MASK_64 = 0xffffffffffffffffn;

/** Reference implementation: FNV-1a 64-bit over UTF-16 code units with
 *  bigint arithmetic. Kept as the ORACLE for the fast path below. */
export function fnv1a64HexBigInt(input: string): string {
  let hash = FNV_OFFSET_BASIS_64;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= BigInt(input.charCodeAt(i));
    hash = (hash * FNV_PRIME_64) & MASK_64;
  }
  return hash.toString(16).padStart(16, "0");
}

/**
 * Fast path: identical function, computed with two 32-bit limbs via
 * Math.imul — every operation is spec-exact integer arithmetic (ES2015
 * Math.imul + ToUint32 wraps), so it is bit-identical across V8 pipelines
 * with NO float involvement and no bigint allocation pressure.
 * (Prime split: 0x00000100_000001B3 → hi limb 256, lo limb 435.)
 */
export function fnv1a64Hex(input: string): string {
  let h1 = 0xcbf29ce4 | 0; // offset basis high half
  let h0 = 0x84222325 | 0; // offset basis low half
  for (let i = 0; i < input.length; i += 1) {
    h0 ^= input.charCodeAt(i); // chars are ≤ 0xffff → low half only
    const carry = (((h0 >>> 16) * 435 + (((h0 & 0xffff) * 435) >>> 16)) >>> 16) >>> 0;
    const new0 = Math.imul(h0, 435);
    h1 = (Math.imul(h1, 435) + Math.imul(h0, 256) + carry) >>> 0;
    h0 = new0;
  }
  return (h1 >>> 0).toString(16).padStart(8, "0") + (h0 >>> 0).toString(16).padStart(8, "0");
}

/** State hash: FNV-1a(FNV-1a(canonical-json)) → 32 hex chars (HashHex). */
export function digestOfCanonical(canonical: CanonicalValue): string {
  const inner = fnv1a64Hex(serializeCanonical(canonical));
  return inner + fnv1a64Hex(inner);
}

/** One-call convenience: state → 32-hex HashHex. */
export function stateDigest(value: EncodableState, path = "$"): string {
  return digestOfCanonical(canonicalize(value, path));
}

/**
 * Decode a canonical tree (as parsed from a state.json artifact) back into
 * JS values: `{"#bi"}` → bigint, `{"#map"}` → insertion-ordered Map.
 * Validates shape as it goes (Law 2 — the file is an external boundary).
 */
export function decodeCanonical(node: unknown, path: string): unknown {
  if (node === null) return null;

  if (Array.isArray(node)) return node.map((item, i) => decodeCanonical(item, `${path}[${String(i)}]`));

  if (typeof node === "object") {
    const record = node as Record<string, unknown>;
    const keys = Object.keys(record);
    if (keys.length === 1 && typeof record[BIGINT_TAG] === "string") {
      return parseBigIntLiteral(record[BIGINT_TAG], `${path}.${BIGINT_TAG}`);
    }
    if (keys.length === 1 && Array.isArray(record[MAP_TAG])) {
      const map = new Map<unknown, unknown>();
      for (const [i, entry] of (record[MAP_TAG] as unknown[]).entries()) {
        if (!Array.isArray(entry) || entry.length !== 2) {
          throw new Error(`decodeCanonical: bad map entry at ${path}<${String(i)}>`);
        }
        map.set(decodeCanonical(entry[0], `${path}<key ${String(i)}>`), decodeCanonical(entry[1], `${path}<value ${String(i)}>`));
      }
      return map;
    }
    if (keys.length === 1 && Array.isArray(record[SET_TAG])) {
      return new Set((record[SET_TAG] as unknown[]).map((item, i) => decodeCanonical(item, `${path}<member ${String(i)}>`)));
    }
    const plain: Record<string, unknown> = {};
    for (const key of keys) plain[key] = decodeCanonical(record[key], `${path}.${key}`);
    return plain;
  }

  if (typeof node === "number" && !Number.isSafeInteger(node)) {
    throw new Error(`decodeCanonical: non-integer number at ${path}: ${String(node)}`);
  }

  if (typeof node === "number" || typeof node === "string" || typeof node === "boolean") {
    return node;
  }

  throw new Error(`decodeCanonical: unexpected ${typeof node} at ${path}`);
}

function parseBigIntLiteral(raw: string, path: string): bigint {
  if (!/^-?\d+$/.test(raw)) throw new Error(`decodeCanonical: bad bigint literal at ${path}: ${raw}`);
  return BigInt(raw);
}
