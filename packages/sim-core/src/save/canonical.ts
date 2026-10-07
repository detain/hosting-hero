/**
 * Deterministic stable serialization for save artifacts.
 *
 * The canonical machinery is SHARED with replay via src/internal/canonical.ts
 * (the former hand-maintained duplicate — kept honest only by the S-3 parity
 * tripwire — is retired). The save workstream boundary still holds at the
 * public surface: save exports its own names, its own error wording, and its
 * own decode policy (no depth cap — a save file is the player's own sealed
 * artifact, not a shared untrusted replay buffer). The pinned properties,
 * unchanged:
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

import {
  decodeTaggedTree,
  encodeTaggedTree,
  fnv1a64OverBytes,
  NO_DEPTH_LIMIT,
  utf8Bytes as sharedUtf8Bytes,
  type CanonicalProblem,
  type CanonicalProblemReporter,
} from "../internal/canonical.ts";
import { fail } from "./errors.ts";

export { compareCodeUnits } from "../internal/canonical.ts";

/* ═══════════════════════ canonical JSON text ═══════════════════════ */

/** Save's wording of the shared walker's rejections (SaveError via ./errors). */
const reportEncode: CanonicalProblemReporter = (problem: CanonicalProblem): never => {
  switch (problem.kind) {
    case "non-finite-number":
      return fail(`canonicalJson: non-finite number ${String(problem.value)} is banned from save state (CONVENTIONS §4)`);
    case "unsafe-object-key":
      return fail(`canonicalJson: unsafe object key "${problem.key}"`);
    case "cyclic-structure":
      return fail("canonicalJson: cyclic structure is not serializable");
    case "unsupported-value":
      return fail(`canonicalJson: unsupported value of type ${typeof problem.value}`);
    case "malformed-map-entry":
      return fail("canonicalJson: malformed $m entry"); // encode never emits a tag tree to re-read
    case "depth-cap-exceeded":
      return fail("canonicalJson: nesting exceeds depth cap"); // save encodes uncapped — unreachable
  }
};

const reportDecode: CanonicalProblemReporter = (problem: CanonicalProblem): never => {
  switch (problem.kind) {
    case "unsafe-object-key":
      return fail(`fromCanonicalJson: unsafe object key "${problem.key}"`);
    case "malformed-map-entry":
      return fail("fromCanonicalJson: malformed $m entry");
    case "depth-cap-exceeded":
      return fail(`fromCanonicalJson: nesting exceeds depth cap ${problem.cap}`); // save decodes uncapped — unreachable
    case "non-finite-number":
      return fail(`fromCanonicalJson: non-finite number ${String(problem.value)}`); // JSON text can never carry one
    case "cyclic-structure":
      return fail("canonicalJson: cyclic structure is not serializable");
    case "unsupported-value":
      return fail(`canonicalJson: unsupported value of type ${typeof problem.value}`);
  }
};

/** Deterministic JSON text: sorted keys, bigint `{"$i":"123"}`,
 *  Map `{"$m":[[k,v]…]}` (insertion order), Set `{"$s":[…]}`. */
export function canonicalJson(value: unknown): string {
  const encoded = encodeTaggedTree(value, reportEncode);
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
  return decodeTaggedTree(parsed, reportDecode, NO_DEPTH_LIMIT);
}

/* ═══════════════════════ pure-TS FNV-1a-64 digest ═══════════════════════ */

/** Hand-rolled UTF-8 (code-point based) — runtime-identical bytes browser⇄Node. */
export function utf8Bytes(text: string): Uint8Array {
  return sharedUtf8Bytes(text);
}

/** FNV-1a 64-bit over bytes + splitmix-style avalanche. 16 lowercase hex.
 *  (Mechanism shared via src/internal/canonical.ts; the byte constants are
 *  identical to replay's — the S-3 tripwire keeps that lockstep pinned.) */
export function fnv1a64Hex(bytes: Uint8Array): string {
  return fnv1a64OverBytes(bytes);
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
