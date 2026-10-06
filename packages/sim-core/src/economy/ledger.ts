/**
 * The append-only ledger journal (MASTER_REPORT §4.4 C5 + WS-4 R4:
 * "attribution from day one").
 *
 * This is THE single write path for money in the economy module: every
 * mutation must flow through `postEntry`, which makes an CauseId a required
 * argument — a mutation without attribution is unrepresentable (Law 2), and
 * the seq counter is monotonic so entries can never be re-ordered or
 * retrofitted (P10, §7.0 unretrofittable law).
 *
 * MySQL is the notary, not the ledger: this journal IS sim state, re-derived
 * from seed + inputs on replay (§3.2, §4.4 C5 restatement).
 */

import {
  type BucketId,
  type CauseId,
  type LedgerEntry,
  type MoneyBuckets,
  type MoneyUnit,
  type RevenueQualityBand,
  type SimMinute,
} from "../types.ts";
import { applyBucketDelta } from "./buckets.ts";

export interface Journal {
  /** Next LedgerEntry.seq (mirrors GameState.ledgerSeq; monotonic). */
  readonly nextSeq: number;
  /** Append-only history, oldest first. Never mutated in place. */
  readonly entries: readonly LedgerEntry[];
}

export const emptyJournal: Journal = { nextSeq: 0, entries: [] };

export interface EntryDraft {
  readonly causeId: CauseId;
  readonly atBusinessMin: SimMinute;
  readonly moneyColour: RevenueQualityBand;
  readonly delta: Readonly<Partial<Record<BucketId, MoneyUnit>>>;
  /** Human-readable tag used in the fail-loud message; not persisted. */
  readonly context?: string;
}

export interface PostedEntry {
  readonly journal: Journal;
  readonly cash: MoneyBuckets;
  readonly entry: LedgerEntry;
}

/** Zero deltas are rejected: an attributed "no-op" pollutes audit history. */
function sanitizeDelta(delta: EntryDraft["delta"]): Partial<Record<BucketId, MoneyUnit>> {
  const clean: Partial<Record<BucketId, MoneyUnit>> = {};
  let touched = 0;
  for (const [bucket, amount] of Object.entries(delta) as [BucketId, MoneyUnit][]) {
    if (amount === 0n) continue;
    clean[bucket] = amount;
    touched += 1;
  }
  if (touched === 0) throw new RangeError("economy/ledger: entry delta must touch at least one bucket");
  return clean;
}

/**
 * Apply the draft's deltas to `cash` and append the resulting entry.
 * Bucket non-negativity is asserted by `applyBucketDelta` (fail loud, Law 4)
 * BEFORE anything is recorded, so a rejected entry leaves the journal pure
 * (Law 3): the caller keeps the previous state untouched.
 */
export function postEntry(journal: Journal, cash: MoneyBuckets, draft: EntryDraft): PostedEntry {
  if (!Number.isInteger(journal.nextSeq) || journal.nextSeq < 0) {
    throw new RangeError(`economy/ledger: corrupt nextSeq ${journal.nextSeq}`);
  }
  if (!Number.isInteger(draft.atBusinessMin) || draft.atBusinessMin < 0) {
    throw new RangeError(`economy/ledger: atBusinessMin must be a non-negative integer minute`);
  }
  const clean = sanitizeDelta(draft.delta);
  const context = draft.context ?? `cause '${draft.causeId}'`;

  let next = cash;
  for (const [bucket, amount] of Object.entries(clean) as [BucketId, MoneyUnit][]) {
    next = applyBucketDelta(next, { bucket, amount }, context);
  }

  const entry: LedgerEntry = {
    seq: journal.nextSeq,
    causeId: draft.causeId,
    atBusinessMin: draft.atBusinessMin,
    moneyColour: draft.moneyColour,
    delta: clean,
  };
  return {
    journal: { nextSeq: journal.nextSeq + 1, entries: [...journal.entries, entry] },
    cash: next,
    entry,
  };
}

/** Audit helper used by tests and the notary export: every entry, every cause. */
export function entriesWithoutCause(journal: Journal): readonly LedgerEntry[] {
  return journal.entries.filter((e) => typeof e.causeId !== "string" || e.causeId.length === 0);
}

export function lastEntry(journal: Journal): LedgerEntry | null {
  return journal.entries.length === 0 ? null : journal.entries[journal.entries.length - 1]!;
}
