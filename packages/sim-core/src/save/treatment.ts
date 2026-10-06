/**
 * Reputation ledger = ONE append-only treatment-event store (Appendix C §2.4,
 * WS-6 Q4 answer). The flagship cross-level memory features —
 *
 *   "customers you treated well in level 3 show up in level 9 as references"
 *   "Level 3's shortcut is Level 9's deposition" (L6)
 *
 * — all run as QUERIES over stored events; nothing is authored one-off state
 * ("generatable rather than authored", §9.13). Every event carries:
 *  - an ENTITY REF (the customer book),
 *  - a TREATMENT VECTOR (dimension + signed valence, Fixed),
 *  - a verbatim SUMMARY (depositions quote the stored line),
 *  - run+seed PROVENANCE (museum provenance law),
 *  - a SIM-TIME stamp (fictional-clock discipline: "years later" = range scan).
 *
 * Derived scores (grudgeScore, referenceEligible) are CHEAP PROJECTIONS kept
 * beside the log for display — the log is truth, projections are caches.
 */

import type { EntityId, Fixed, SimTick } from "../types.ts";
import { asEntityId, asRunSeed } from "../types.ts";
import { fail } from "./errors.ts";
import type { CustomerBookRecord, TreatmentDimension, TreatmentEvent } from "./node.ts";

/** (TreatmentDimension / TreatmentEvent ship from ./node — do not re-export
 *  them here: `export *` collisions in the barrel.) */

/* ═══════════════════════ append (pure) ═══════════════════════ */

export interface TreatmentEventDraft {
  readonly atTick: SimTick;
  readonly causeId: string;
  readonly dimension: TreatmentDimension;
  readonly valence: Fixed;
  readonly summary: string;
  readonly runId: EntityId;
  readonly runSeed: bigint;
}

/** Append one treatment fact to a customer's log; seq continues, monotonically. */
export function appendTreatment(
  node: { readonly customerBooks: readonly CustomerBookRecord[] },
  subject: EntityId,
  draft: TreatmentEventDraft,
): { readonly customerBooks: readonly CustomerBookRecord[] } {
  const book = node.customerBooks.find((b) => b.id === subject);
  if (book === undefined) fail(`appendTreatment: customer book "${subject}" not found — events attach to named entities only`);
  const event: TreatmentEvent = {
    seq: book.treatmentLog.length,
    atTick: draft.atTick,
    causeId: draft.causeId,
    subject,
    dimension: draft.dimension,
    valence: draft.valence,
    summary: draft.summary,
    provenance: { runId: draft.runId, runSeed: asRunSeed(draft.runSeed) },
  };
  const updated: CustomerBookRecord = { ...book, treatmentLog: [...book.treatmentLog, event] };
  return { customerBooks: node.customerBooks.map((b) => (b.id === subject ? updated : b)) };
}

/* ═══════════════════════ query API ═══════════════════════ */

export interface TreatmentQuery {
  /** Restrict to one entity ref. */
  readonly subject?: EntityId;
  readonly dimension?: TreatmentDimension;
  /** Inclusive bounds on the signed valence vector. */
  readonly minValence?: Fixed;
  readonly maxValence?: Fixed;
  /** Sim-time window ("years later" = a range, never wall-clock). */
  readonly sinceTick?: SimTick;
  readonly untilTick?: SimTick;
}

/** Scan all customer books in a node, return matching events in
 *  (atTick, subject, seq) stable order — deterministic regardless of roster
 *  insertion order (Law 3). */
export function queryTreatment(
  node: { readonly customerBooks: readonly CustomerBookRecord[] },
  query: TreatmentQuery,
): readonly TreatmentEvent[] {
  const matches: TreatmentEvent[] = [];
  for (const book of node.customerBooks) {
    if (query.subject !== undefined && book.id !== query.subject) continue;
    for (const event of book.treatmentLog) {
      if (!matchesQuery(event, query)) continue;
      matches.push(event);
    }
  }
  return matches.sort(
    (a, b) =>
      a.atTick < b.atTick ? -1 : a.atTick > b.atTick ? 1 : a.subject < b.subject ? -1 : a.subject > b.subject ? 1 : a.seq - b.seq,
  );
}

function matchesQuery(event: TreatmentEvent, query: TreatmentQuery): boolean {
  if (query.subject !== undefined && event.subject !== query.subject) return false;
  if (query.dimension !== undefined && event.dimension !== query.dimension) return false;
  if (query.minValence !== undefined && event.valence < query.minValence) return false;
  if (query.maxValence !== undefined && event.valence > query.maxValence) return false;
  if (query.sinceTick !== undefined && event.atTick < query.sinceTick) return false;
  if (query.untilTick !== undefined && event.atTick > query.untilTick) return false;
  return true;
}

/* ═══════════════════════ flagship queries (L6/§9.1) ═══════════════════════ */

export interface ReferenceCriteria {
  /** A kindness at/after this valence counts as reference-worthy. */
  readonly minKindnessValence: Fixed;
  readonly dimension?: TreatmentDimension;
  /** Trust floor on the current book projection. */
  readonly minTenureMin?: number;
  /** Only references earned this far in the past still vouch (decay window). */
  readonly asOfTick: SimTick;
  readonly withinTicks?: SimTick;
}

export interface ReferenceCandidate {
  readonly customer: CustomerBookRecord;
  /** The stored event a docent/annual report can quote VERBATIM. */
  readonly proofEvent: TreatmentEvent;
}

/** "find customers treated well, still active" (§4.6 Q4) — the level-3→level-9
 *  round trip. Newest qualifying kindness is the proof event. */
export function findReferenceCandidates(
  node: { readonly customerBooks: readonly CustomerBookRecord[] },
  criteria: ReferenceCriteria,
): readonly ReferenceCandidate[] {
  const candidates: ReferenceCandidate[] = [];
  for (const book of node.customerBooks) {
    if (book.status === "churned") continue; // ghosts attack; they don't vouch
    if (criteria.minTenureMin !== undefined && book.tenureMin < criteria.minTenureMin) continue;
    const qualifying = book.treatmentLog.filter(
      (event) =>
        event.valence >= criteria.minKindnessValence &&
        (criteria.dimension === undefined || event.dimension === criteria.dimension) &&
        (criteria.withinTicks === undefined || criteria.asOfTick - event.atTick <= criteria.withinTicks),
    );
    const proofEvent = qualifying[qualifying.length - 1];
    if (proofEvent === undefined) continue;
    candidates.push({ customer: book, proofEvent });
  }
  return candidates.sort((a, b) => (a.customer.id < b.customer.id ? -1 : a.customer.id > b.customer.id ? 1 : 0));
}

/** Depositions (L6): the shortcut you took at level 3, quoted back at level 9.
 *  Negative-valence events on a dimension — returned with their STORED summary. */
export function findDepositions(
  node: { readonly customerBooks: readonly CustomerBookRecord[] },
  criteria: { readonly dimension: TreatmentDimension; readonly asOfTick: SimTick; readonly olderThanTicks: SimTick },
): readonly TreatmentEvent[] {
  const depositions: TreatmentEvent[] = [];
  for (const book of node.customerBooks) {
    for (const event of book.treatmentLog) {
      if (event.dimension !== criteria.dimension) continue;
      if (event.valence >= 0n) continue; // shortcuts are negative valence
      if (criteria.asOfTick - event.atTick < criteria.olderThanTicks) continue; // lag is the point
      depositions.push(event);
    }
  }
  return depositions.sort((a, b) => (a.atTick < b.atTick ? -1 : a.atTick > b.atTick ? 1 : a.subject < b.subject ? -1 : a.subject > b.subject ? 1 : a.seq - b.seq));
}

/** Recompute a book's cheap projections from its log (grudge = sum of
 *  negative valences; eligibility = any positive kindness). Pure. */
export function projectBook(book: CustomerBookRecord): CustomerBookRecord {
  let grudge = 0n;
  let referenceEligible = false;
  for (const event of book.treatmentLog) {
    if (event.valence < 0n) grudge += event.valence;
    if (event.valence > 0n) referenceEligible = true;
  }
  return { ...book, grudgeScore: grudge, referenceEligible };
}

/** Boundary parse for standalone treatment events (used by envelope parse). */
export function parseTreatmentSubject(raw: string): EntityId {
  if (raw.length === 0) fail("parseTreatmentSubject: empty subject");
  return asEntityId(raw);
}
