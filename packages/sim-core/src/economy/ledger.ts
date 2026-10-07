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
 *
 * STORAGE SHAPE (perf audit #3): a journal built here is {nextSeq, entries}
 * on the surface and an immutable chunked cons-list underneath (same
 * philosophy as policy/evaluator.ts FireLog — but one row at a time, and
 * copy-on-write sealed chunks so NO journal value ever aliases another's
 * history). The old `{...journal.entries, entry}` rebuild was O(entries) per
 * post — O(entries²) across a long run (measured 2.1ms/append at 100k).
 * A bare-literal journal — what spreads, JSON.parse, and hand-written
 * fixtures produce — remains legal input to every function: `readSpine`
 * boundary-parses it into chunks once, on demand.
 *
 * SERIALIZATION IDENTITY: the spine hangs off a symbol key (invisible to
 * Object.keys / JSON.stringify / the canonical replay walker) and `entries`
 * is an enumerable own accessor evaluated on read, so `{nextSeq, entries}`
 * stays the complete visible shape, in insertion order, byte-identical to
 * the old flat-array journal (pinned in __tests__/journal.test.ts against
 * encodeCanonicalBinary).
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

/**
 * The public shape of the journal:
 *  - `nextSeq` — Next LedgerEntry.seq (mirrors GameState.ledgerSeq; monotonic).
 *  - `entries` — append-only history, oldest first, never mutated in place.
 */
export interface Journal {
  readonly nextSeq: number;
  readonly entries: readonly LedgerEntry[];
}

/**
 * One sealed batch of journal rows (mirror of FireLogChunk's shape law).
 * Tail batches live in a shared bounded accumulator (spine.open) whose
 * readable length per VALUE is spine.openCount — see spineAppend.
 */
export interface JournalChunk {
  readonly rows: readonly LedgerEntry[];
  readonly count: number;
  /** Older chunk, or null at the journal head. */
  readonly previous: JournalChunk | null;
}

/**
 * Rows per chunk. The hot append path pushes into the open tail array
 * IN PLACE at index openCount and conses a fresh spine pointer, so a linear
 * append costs zero row copies; 16 bounds every fallback path (branched
 * appends and the eventual seal) at a 16-element slice. Measured on the
 * perf-lane micro-bench: allocation shape, not copying, dominates below this,
 * and 16 keeps both bounded with margin to spare.
 */
export const JOURNAL_CHUNK_ROWS = 16;

interface JournalSpine {
  /** Newest SEALED chunk (fully owned rows), or null. */
  readonly head: JournalChunk | null;
  /** Shared tail accumulator; only its first `openCount` rows belong to
   *  THIS value (siblings may have pushed beyond — reads stay bounded). */
  readonly open: { rows: LedgerEntry[]; previous: JournalChunk | null } | null;
  readonly openCount: number;
  /** Rows currently retained (post-compaction). */
  readonly total: number;
  /** Rows dropped by compactJournal — truncation is never silent. */
  readonly compacted: number;
  /** Mutable ONLY for the lazy entries memo; each postEntry conses a fresh
   *  spine, so a memoized flat view can never leak across journal values. */
  flat: readonly LedgerEntry[] | null;
}

const SPINE: unique symbol = Symbol("economy/ledger/spine");

interface SpinedJournal extends Journal {
  readonly [SPINE]: JournalSpine;
}

function flattenSpine(spine: JournalSpine): readonly LedgerEntry[] {
  const chunks: Array<readonly LedgerEntry[]> = [];
  if (spine.open !== null && spine.openCount > 0) chunks.push(spine.open.rows.slice(0, spine.openCount));
  for (let node = spine.head; node !== null; node = node.previous) chunks.push(node.rows);
  const out: LedgerEntry[] = [];
  for (let i = chunks.length - 1; i >= 0; i -= 1) out.push(...(chunks[i] as readonly LedgerEntry[]));
  return out;
}

/** Entries view, memoized on the (per-value) spine. No closure per journal:
 *  the accessor reads its own spine via the symbol, keeping allocation shape
 *  monomorphic — this was the bulk of the per-append cost. */
function readEntries(this: SpinedJournal): readonly LedgerEntry[] {
  const spine = this[SPINE];
  if (spine.flat === null) spine.flat = flattenSpine(spine);
  return spine.flat;
}

/** Build the public value: enumerable own keys in the old literal's order
 *  (nextSeq, then the entries accessor); symbol-keyed spine invisible to
 *  every string-key walk. The accessor is ONE shared function attached via
 *  defineProperty — a per-value closure turned out to be the dominant
 *  per-append cost in the perf-lane micro-bench. */
function buildJournal(nextSeq: number, spine: JournalSpine): Journal {
  const journal = { nextSeq, [SPINE]: spine } as SpinedJournal;
  Object.defineProperty(journal, "entries", {
    get: readEntries,
    enumerable: true,
    configurable: true,
  });
  return journal;
}

function freshSpine(
  head: JournalChunk | null,
  open: JournalSpine["open"],
  openCount: number,
  total: number,
  compacted: number,
): JournalSpine {
  return { head, open, openCount, total, compacted, flat: null };
}

/** Chunk an oldest-first row list into a fresh (fully sealed) spine. */
function spineFromRows(rows: readonly LedgerEntry[]): JournalSpine {
  let head: JournalChunk | null = null;
  for (let start = 0; start < rows.length; start += JOURNAL_CHUNK_ROWS) {
    const chunk = rows.slice(start, Math.min(start + JOURNAL_CHUNK_ROWS, rows.length));
    head = { rows: chunk, count: chunk.length, previous: head };
  }
  return freshSpine(head, null, 0, rows.length, 0);
}

/** Trusted internal spine; bare literals are parsed once at the boundary. */
function readSpine(journal: Journal): JournalSpine {
  const internal = (journal as Partial<SpinedJournal>)[SPINE];
  if (internal !== undefined) return internal;
  if (!Array.isArray(journal.entries)) {
    throw new RangeError("economy/ledger: journal.entries must be an array (bare-literal boundary parse)");
  }
  return spineFromRows(journal.entries);
}

/**
 * Amortized-O(1) append with immutable VALUES (Law 3 kept honest):
 *  - LINEAR tail (openCount === rows.length, the hot postEntry path): the
 *    entry pushes at the tail of the shared accumulator and a fresh spine
 *    pointer takes it — zero row copies. Siblings that branched earlier are
 *    bounded by THEIR openCount and never observe this row.
 *  - SEALED tail (accumulator reached JOURNAL_CHUNK_ROWS): the tail becomes
 *    an owned JournalChunk and a fresh accumulator starts.
 *  - BRANCHED tail (openCount < rows.length — someone else pushed first):
 *    copy the bounded rows into a private accumulator; two siblings can
 *    never overwrite each other's slot. Rare, ≤ JOURNAL_CHUNK_ROWS moves.
 */
function spineAppend(spine: JournalSpine, entry: LedgerEntry): JournalSpine {
  const open = spine.open;
  const count = spine.openCount;
  if (open !== null && count < JOURNAL_CHUNK_ROWS) {
    if (count === open.rows.length) {
      open.rows.push(entry);
      return freshSpine(spine.head, open, count + 1, spine.total + 1, spine.compacted);
    }
    return freshSpine(spine.head, { rows: [...open.rows.slice(0, count), entry], previous: open.previous }, count + 1, spine.total + 1, spine.compacted);
  }
  const sealed: JournalChunk | null = open === null || count === 0 ? spine.head : { rows: open.rows.slice(0, count), count, previous: spine.head };
  return freshSpine(sealed, { rows: [entry], previous: sealed }, 1, spine.total + 1, spine.compacted);
}

export const emptyJournal: Journal = buildJournal(0, freshSpine(null, null, 0, 0, 0));

/** Boundary constructor: re-chunk a plain row list (JSON round-trips,
 *  test fixtures) into a spined journal. `nextSeq` defaults to rows.length,
 *  matching the monotonic-append law. */
export function journalFromEntries(entries: readonly LedgerEntry[], nextSeq: number = entries.length): Journal {
  if (!Number.isInteger(nextSeq) || nextSeq < entries.length) {
    throw new RangeError(`economy/ledger: journalFromEntries nextSeq ${nextSeq} cannot precede ${entries.length} rows`);
  }
  return buildJournal(nextSeq, spineFromRows(entries));
}

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

/**
 * Apply the draft's deltas to `cash` and append the resulting entry.
 * Bucket non-negativity is asserted by `applyBucketDelta` (fail loud, Law 4)
 * BEFORE anything is recorded, so a rejected entry leaves the journal pure
 * (Law 3): the caller keeps the previous state untouched.
 *
 * Zero deltas are rejected as a whole: an attributed "no-op" pollutes audit
 * history. Sanitize + apply fuse into one single-bucket-at-a-time walk in the
 * draft's key-insertion order (same order, same messages as the two-pass
 * form they replace); the persisted `clean` clone keeps every bucket value a
 * branded MoneyUnit, and the entry only materializes once the whole delta
 * applied cleanly.
 */
/**
 * Validate the draft, apply it to cash, and stamp the row — the shared core
 * of `postEntry` and the tick's batch lane (`appendJournal`). Every guard,
 * message, and check ORDER lives here so both lanes fail identically; only
 * journal construction differs.
 */
export function draftEntry(
  cash: MoneyBuckets,
  draft: EntryDraft,
  seq: number,
): { readonly cash: MoneyBuckets; readonly entry: LedgerEntry } {
  if (!Number.isInteger(seq) || seq < 0) {
    throw new RangeError(`economy/ledger: corrupt nextSeq ${seq}`);
  }
  if (!Number.isInteger(draft.atBusinessMin) || draft.atBusinessMin < 0) {
    throw new RangeError(`economy/ledger: atBusinessMin must be a non-negative integer minute`);
  }
  const context = draft.context ?? `cause '${draft.causeId}'`;

  const clean: Partial<Record<BucketId, MoneyUnit>> = {};
  let touched = 0;
  let next = cash;
  // for-in, not Object.entries: same insertion order over plain-literal
  // deltas (own-key filter keeps it exactly Object.entries semantics),
  // without the per-entry [key, value] pair-array allocations — measurable
  // at the µ$/append level on the 100k bench.
  for (const key in draft.delta) {
    if (!Object.prototype.hasOwnProperty.call(draft.delta, key)) continue;
    const bucket = key as BucketId;
    const amount = draft.delta[bucket];
    if (amount === undefined || amount === 0n) continue;
    next = applyBucketDelta(next, { bucket, amount }, context);
    clean[bucket] = amount;
    touched += 1;
  }
  if (touched === 0) throw new RangeError("economy/ledger: entry delta must touch at least one bucket");

  const entry: LedgerEntry = {
    seq,
    causeId: draft.causeId,
    atBusinessMin: draft.atBusinessMin,
    moneyColour: draft.moneyColour,
    delta: clean,
  };
  return { cash: next, entry };
}

export function postEntry(journal: Journal, cash: MoneyBuckets, draft: EntryDraft): PostedEntry {
  const { cash: next, entry } = draftEntry(cash, draft, journal.nextSeq);
  return {
    journal: buildJournal(journal.nextSeq + 1, spineAppend(readSpine(journal), entry)),
    cash: next,
    entry,
  };
}

/** Seal any open tail accumulator into an owned chunk (fully-sealed spine). */
function sealSpine(spine: JournalSpine): JournalSpine {
  if (spine.open === null || spine.openCount === 0) return spine;
  const sealed: JournalChunk = {
    rows: spine.open.rows.slice(0, spine.openCount),
    count: spine.openCount,
    previous: spine.head,
  };
  return freshSpine(sealed, null, 0, spine.total, spine.compacted);
}

/**
 * Batch lane for the tick: append an ordered run of already-validated rows
 * in ONE journal construction — per-row cost is a slice + a chunk cons every
 * JOURNAL_CHUNK_ROWS, not a spine clone plus a defineProperty accessor per
 * post. Rows come from `draftEntry` (the same validation core `postEntry`
 * uses), so a batched tick and a sequential postEntry tick are byte-
 * identical in `entries`, `nextSeq`, and every cash mirror.
 *
 * Boundary law (parse-don't-validate for the internal fast path): the batch
 * must continue the seq exactly and carry valid minutes — a gap throws;
 * anything deeper is the save lane's job, not this loop's.
 */
export function appendJournal(journal: Journal, rows: readonly LedgerEntry[]): Journal {
  if (!Number.isInteger(journal.nextSeq) || journal.nextSeq < 0) {
    throw new RangeError(`economy/ledger: corrupt nextSeq ${journal.nextSeq}`);
  }
  if (rows.length === 0) return journal;
  let seq = journal.nextSeq;
  for (const row of rows) {
    if (row.seq !== seq) {
      throw new RangeError(`economy/ledger: appendJournal row seq ${row.seq} breaks continuity at ${seq}`);
    }
    if (!Number.isInteger(row.atBusinessMin) || row.atBusinessMin < 0) {
      throw new RangeError(`economy/ledger: atBusinessMin must be a non-negative integer minute`);
    }
    seq += 1;
  }
  const sealed = sealSpine(readSpine(journal));
  let head = sealed.head;
  for (let start = 0; start < rows.length; start += JOURNAL_CHUNK_ROWS) {
    const chunk = rows.slice(start, Math.min(start + JOURNAL_CHUNK_ROWS, rows.length));
    head = { rows: chunk, count: chunk.length, previous: head };
  }
  return buildJournal(seq, freshSpine(head, null, 0, sealed.total + rows.length, sealed.compacted));
}

/** Result of a compaction pass: the slimmed journal plus the rows it dropped. */
export interface JournalCompaction {
  readonly journal: Journal;
  /** Archived rows, oldest first — the journal was the audit truth, so the
   *  caller (save lane, notary export) keeps custody of what was dropped. */
  readonly archived: readonly LedgerEntry[];
}

/**
 * Ring/compaction hook mirroring `compactFireLog` (policy/evaluator.ts) and
 * `dropSupersededStates` (replay/compact.ts): keep the LAST `keepLast` rows,
 * never silently — everything dropped comes back as `archived` and counts
 * toward `journalCompactedCount`. `nextSeq` is PRESERVED (the monotonic-seq
 * law: GameState.ledgerSeq mirrors it and is digest-visible; the seq counter
 * remembers rows the working set no longer holds).
 *
 * Money truth while compacted: each retained entry is cause-stamped, so the
 * surviving tail + the archive (or a fold of it) still attribute every µ$.
 * The caller decides what the archive is for — this function never discards.
 */
export function compactJournal(journal: Journal, keepLast: number): JournalCompaction {
  if (!Number.isSafeInteger(keepLast) || keepLast < 0) {
    throw new RangeError(`economy/ledger: compactJournal keepLast must be a non-negative integer, got ${keepLast}`);
  }
  const spine = readSpine(journal);
  if (spine.total <= keepLast) return { journal, archived: [] };
  const all = journal.entries; // materialize once; the memo caches it
  const cut = all.length - keepLast;
  const archived = all.slice(0, cut);
  const rebuilt = spineFromRows(all.slice(cut));
  return {
    journal: buildJournal(journal.nextSeq, freshSpine(rebuilt.head, null, 0, rebuilt.total, spine.compacted + archived.length)),
    archived,
  };
}

/** Rows an earlier compactJournal dropped (0 for bare-literal journals). */
export function journalCompactedCount(journal: Journal): number {
  return readSpine(journal).compacted;
}

/** Audit helper used by tests and the notary export: every entry, every cause. */
export function entriesWithoutCause(journal: Journal): readonly LedgerEntry[] {
  return journal.entries.filter((e) => typeof e.causeId !== "string" || e.causeId.length === 0);
}

export function lastEntry(journal: Journal): LedgerEntry | null {
  // O(1) via the spine tip — never materializes history for one row.
  const spine = readSpine(journal);
  if (spine.open !== null && spine.openCount > 0) return spine.open.rows[spine.openCount - 1]!;
  if (spine.head === null) return null;
  return spine.head.rows[spine.head.count - 1]!;
}
