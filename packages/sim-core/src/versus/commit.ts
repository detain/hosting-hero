/**
 * versus/commit.ts — the BLIND-COMMIT envelope for deck drafts (ADR-0004
 * §"blind pre-commitment round"): hash the deck, send the hash, reveal the
 * doc later, verify loudly.
 *
 * Hash family: whole-document canonical fold, same SHAPE as the door's M3
 * ruleBookHash (deterministic fold over canonical content), but built from
 * the shared canonical encoder (src/internal/canonical.ts) + the
 * fnv1a64OverBytes avalanche digest — the replay/save digest family. The M3
 * fold joins with raw control characters; versus keeps the wire pure JSON
 * instead, so the commitment is human-inspectable at reveal time.
 *
 * Determinism: canonical encoding sorts object keys by code unit, tags
 * bigints exactly, and orders Maps by insertion — deck documents are plain
 * frozen objects/arrays of integers and strings, so two runs over the same
 * deck byte-fold to the same 16-hex hash with zero configuration.
 */
import {
  compareCodeUnits,
  encodeTaggedTree,
  fnv1a64OverBytes,
  utf8Bytes,
  type CanonicalProblem,
  type JsonValue,
} from "../internal/canonical.ts";
import { VersusError, type DefenseDeck, type ThreatDeck } from "./deck.ts";

/** Version tag so a future format change cannot silently re-bind old
 *  commitments. Mirrors the `hh-state-v1` / `sv1` stamping habit. */
export const VERSUS_HASH_DOMAIN = "hh-versus-deck-v1";

/** Anything the two deck parsers emit (or any committed document once the
 *  lane needs it — the fold is type-agnostic over canonical JSON values). */
export type CommittableDeck = ThreatDeck | DefenseDeck;

export interface DeckCommitment {
  /** Discriminator so a reveal can be routed to the right parser. */
  readonly kind: CommittableDeck["kind"];
  /** `hh-versus-deck-v1:<16 hex>` over the canonical JSON below. */
  readonly deckHash: string;
  /** The canonical rendering the hash was taken over (reveal-side
   *  diff material; NOT the pretty-printed source doc). */
  readonly canonicalJson: string;
}

function canonicalReportProblem(problem: CanonicalProblem): never {
  throw new VersusError("WRONG_TYPE", "commit.canonical", `canonical fold refused (${problem.kind})`);
}

/** Canonical JSON of a deck document (sorted keys, tagged bigints).
 *  Exported because reveal-side verification and audit tooling need the
 *  exact bytes the hash bound. Accepts `unknown` so the reveal path can
 *  fold wire data it has not (and must not) trust. */
export function deckCanonicalJson(deck: unknown): string {
  return JSON.stringify(encodeTaggedTree(deck, canonicalReportProblem));
}

/** Blind commit: hash + canonical bytes, nothing else — no deck content
 *  leaks into the hash output beyond a 64-bit fold (the pre-commitment
 *  round in ADR-0004: opponent commits, THEN the other side drafts). */
export function commitDeck(deck: CommittableDeck): DeckCommitment {
  const canonicalJson = deckCanonicalJson(deck);
  const digest = fnv1a64OverBytes(utf8Bytes(canonicalJson));
  return Object.freeze({
    kind: deck.kind,
    deckHash: `${VERSUS_HASH_DOMAIN}:${digest}`,
    canonicalJson,
  });
}

export interface RevealVerdict {
  readonly ok: true;
  /** Echo of the commitment hash — the caller's proof-of-binding handle. */
  readonly deckHash: string;
}

/** Reveal a committed deck. Recomputes the fold over the REVEALED document
 *  and fails loud — with the first diverging canonical path when the two
 *  trees differ structurally — on any mismatch. Returns a typed verdict
 *  (ok true) or throws VersusError COMMIT_MISMATCH. */
export function revealAndVerify(envelope: DeckCommitment, revealed: unknown): RevealVerdict {
  // Wire data arrives untyped — only the discriminant is inspected before
  // the canonical fold; everything else is exactly what the fold binds.
  const revealedKind = typeof revealed === "object" && revealed !== null
    ? (revealed as { readonly kind?: unknown }).kind
    : undefined;
  if (envelope.kind !== revealedKind) {
    failMismatch(envelope, `revealed a "${String(revealedKind)}" deck against a "${envelope.kind}" commitment`);
  }
  const revealedJson = deckCanonicalJson(revealed);
  if (revealedJson === envelope.canonicalJson) {
    const recomputed = recomputedHash(revealedJson);
    if (recomputed === envelope.deckHash) {
      return Object.freeze({ ok: true as const, deckHash: envelope.deckHash });
    }
    failMismatch(envelope, `canonical bytes match but the hash differs (${envelope.deckHash} vs ${recomputed}) — corrupt envelope`);
  }

  // Cheap forensic: locate the first diverging canonical path so the
  // failure message names the tampered field, not just "hash differs".
  const path = firstDivergingPath(envelope.canonicalJson, revealedJson);
  failMismatch(envelope, path === null ? "canonical documents diverge (unlocated)" : `canonical documents diverge at '${path}'`);
}

function recomputedHash(canonicalJson: string): string {
  return `${VERSUS_HASH_DOMAIN}:${fnv1a64OverBytes(utf8Bytes(canonicalJson))}`;
}

function failMismatch(envelope: DeckCommitment, detail: string): never {
  throw new VersusError("COMMIT_MISMATCH", "commit.deckHash", `commitment ${envelope.deckHash}: ${detail}`);
}

/** Parse both canonical renderings and walk the tagged trees in lockstep,
 *  returning the dotted path of the first difference ($-tagged scalars,
 *  sorted object keys, positional arrays). null = indistinguishable walk
 *  (caller falls back to the plain hash-mismatch wording). */
function firstDivergingPath(committedJson: string, revealedJson: string): string | null {
  let committed: JsonValue;
  let revealedValue: JsonValue;
  try {
    committed = JSON.parse(committedJson) as JsonValue;
    revealedValue = JSON.parse(revealedJson) as JsonValue;
  } catch {
    return null;
  }
  return walkDivergence(committed, revealedValue, "$");
}

function walkDivergence(a: JsonValue, b: JsonValue, path: string): string | null {
  if (a === b) return null;
  const aIsObject = typeof a === "object" && a !== null && !Array.isArray(a);
  const bIsObject = typeof b === "object" && b !== null && !Array.isArray(b);
  if (aIsObject && bIsObject) {
    const aObj = a as Record<string, JsonValue>;
    const bObj = b as Record<string, JsonValue>;
    const keys = [...new Set([...Object.keys(aObj), ...Object.keys(bObj)])].sort(compareCodeUnits);
    for (const key of keys) {
      const child = walkDivergence(aObj[key] as JsonValue, bObj[key] as JsonValue, `${path}.${key}`);
      if (child !== null) return child;
    }
    return null;
  }
  const aIsArray = Array.isArray(a);
  const bIsArray = Array.isArray(b);
  if (aIsArray && bIsArray) {
    const aArr = a as JsonValue[];
    const bArr = b as JsonValue[];
    const shared = Math.min(aArr.length, bArr.length);
    for (let index = 0; index < shared; index += 1) {
      const child = walkDivergence(aArr[index] as JsonValue, bArr[index] as JsonValue, `${path}[${index}]`);
      if (child !== null) return child;
    }
    if (aArr.length !== bArr.length) return `${path}.length`;
    return null;
  }
  return path;
}
