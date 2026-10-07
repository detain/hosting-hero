/**
 * Journal storage-structure tests (perf audit #3): the chunked cons-list
 * behind Journal must be INVISIBLE — every serialization surface (JSON,
 * canonical binary, Object.keys order) must stay byte-identical to the old
 * flat-array journal — while append becomes O(1) and compaction gains
 * FireLog-style keepLast/archive semantics.
 */

import { describe, expect, it } from "vitest";

import { asCauseId, asMoney, type LedgerEntry, type MoneyBuckets } from "../../types.ts";
import {
  appendJournal,
  compactJournal,
  draftEntry,
  emptyJournal,
  entriesWithoutCause,
  JOURNAL_CHUNK_ROWS,
  journalCompactedCount,
  journalFromEntries,
  lastEntry,
  postEntry,
  type EntryDraft,
  type Journal,
} from "../ledger.ts";
import { encodeCanonicalBinary } from "../../replay/canonical.ts";

const CASH: MoneyBuckets = {
  free: asMoney(1_000_000n),
  restricted: asMoney(0n),
  deferred: asMoney(0n),
  accountsReceivable: asMoney(0n),
  backlog: asMoney(0n),
  committedOut: asMoney(0n),
};

function appendN(journal: Journal, n: number, cash: MoneyBuckets = CASH): Journal {
  let j = journal;
  let c = cash;
  for (let i = 0; i < n; i += 1) {
    const posted = postEntry(j, c, {
      causeId: asCauseId(`economy:test:${j.nextSeq}`),
      atBusinessMin: j.nextSeq,
      moneyColour: "blue",
      delta: { free: j.nextSeq % 2 === 0 ? asMoney(7n) : asMoney(-7n) },
    });
    j = posted.journal;
    c = posted.cash;
  }
  return j;
}

const stringify = (v: unknown): string =>
  JSON.stringify(v, (_k, x: unknown) => (typeof x === "bigint" ? `${x}n` : x))!;

describe("journal serialization identity (chunked spine is invisible)", () => {
  it("exposes exactly {nextSeq, entries} in that insertion order", () => {
    const j = appendN(emptyJournal, JOURNAL_CHUNK_ROWS + 5);
    expect(Object.keys(j)).toEqual(["nextSeq", "entries"]);
  });

  it("JSON and canonical-binary bytes match a hand-built flat literal of the same rows", () => {
    const j = appendN(emptyJournal, JOURNAL_CHUNK_ROWS + 5);
    const bare: Journal = { nextSeq: j.nextSeq, entries: [...j.entries] };
    expect(stringify(j)).toBe(stringify(bare));
    expect(encodeCanonicalBinary(j)).toEqual(encodeCanonicalBinary(bare));
  });

  it("entries is oldest→newest with monotonic seq across chunk boundaries", () => {
    const j = appendN(emptyJournal, JOURNAL_CHUNK_ROWS * 3 + 1);
    expect(j.entries.map((e) => e.seq)).toEqual([...j.entries.keys()]);
    expect(lastEntry(j)!.seq).toBe(j.nextSeq - 1);
  });

  it("the flattened view memoizes — repeat reads never re-walk the spine", () => {
    const j = appendN(emptyJournal, 3);
    expect(j.entries).toBe(j.entries);
  });

  it("older journal values are unaffected by later appends (copy-on-write)", () => {
    const j5 = appendN(emptyJournal, 5);
    const j9 = appendN(j5, 4); // crosses into a consed chunk? no — 5<64, same chunk, still pure
    appendN(j9, JOURNAL_CHUNK_ROWS); // force new chunks after j5 exists
    expect(j5.entries.length).toBe(5);
    expect(j9.entries.length).toBe(9);
    expect(j9.entries[8]!.seq).toBe(8);
  });
});

describe("bare-literal boundary parse", () => {
  it("postEntry accepts {nextSeq, entries} literals (spread/JSON origin)", () => {
    const j = appendN(emptyJournal, 3);
    const bare = JSON.parse(stringify(j), (_k, x) =>
      typeof x === "string" && /^\d+n$/.test(x) ? BigInt(x.slice(0, -1)) : x,
    ) as Journal;
    const posted = postEntry(bare, CASH, {
      causeId: asCauseId("economy:test:revived"),
      atBusinessMin: 99,
      moneyColour: "blue",
      delta: { free: asMoney(1n) },
    });
    expect(posted.journal.entries.length).toBe(4);
    expect(posted.journal.entries[3]!.causeId).toBe("economy:test:revived");
    expect(posted.entry.seq).toBe(3);
  });

  it("journalFromEntries revives rows and fails loud when nextSeq cannot precede them", () => {
    const j = appendN(emptyJournal, 2);
    const rows: readonly LedgerEntry[] = [...j.entries];
    expect(stringify(journalFromEntries(rows))).toBe(stringify(j));
    expect(() => journalFromEntries(rows, 1)).toThrow(RangeError);
  });

  it("postEntry rejects a non-array bare entries field (corruption, not reinterpretation)", () => {
    const forged = { nextSeq: 0, entries: undefined } as unknown as Journal;
    expect(() =>
      postEntry(forged, CASH, { causeId: asCauseId("economy:test:x"), atBusinessMin: 0, moneyColour: "blue", delta: { free: asMoney(1n) } }),
    ).toThrow(RangeError);
  });

  it("draftEntry fails loud on an undefined-valued bucket, naming it (review-5 LOW #1)", () => {
    // Pre-perf-audit loudness: undefined reached applyBucketDelta and blew up
    // mixing BigInt with undefined. The `|| amount === 0n` merge had quietly
    // DROPPED such money — a present key is never treated as absent again.
    const delta = { free: undefined, deferred: asMoney(5n) } as unknown as EntryDraft["delta"];
    expect(() =>
      draftEntry(CASH, { causeId: asCauseId("economy:test:undefined-bucket"), atBusinessMin: 0, moneyColour: "blue", delta }, 0),
    ).toThrow(/bucket 'free' delta is undefined/);
    // The context tag rides the message when the caller supplied one:
    const tagged = { backlog: undefined } as unknown as EntryDraft["delta"];
    expect(() =>
      draftEntry(CASH, { causeId: asCauseId("economy:test:ctx"), atBusinessMin: 0, moneyColour: "blue", delta: tagged, context: "payroll lane" }, 0),
    ).toThrow("economy/ledger: bucket 'backlog' delta is undefined (payroll lane)");
  });

  it("a bare literal is never promoted in place — repeated reads re-parse, identically, silently (review-5 LOW #5)", () => {
    // The honest 'parse on demand' claim pinned: postEntry on the SAME bare
    // literal twice must agree, and the input object must gain NOTHING —
    // no spine symbol, no touched array (Law 3, and why write-back caching
    // onto a possibly-frozen caller object is the wrong trade).
    const rows = [...appendN(emptyJournal, 3).entries];
    const bare: Journal = { nextSeq: 3, entries: rows };
    const draft = {
      causeId: asCauseId("economy:test:bare-twice"),
      atBusinessMin: 9,
      moneyColour: "blue" as const,
      delta: { free: asMoney(1n) },
    };
    const first = postEntry(bare, CASH, draft);
    const second = postEntry(bare, CASH, draft);
    expect(stringify(first.journal)).toBe(stringify(second.journal));
    expect(stringify(first.cash)).toBe(stringify(second.cash));
    expect(Object.getOwnPropertySymbols(bare)).toEqual([]);
    expect(Object.keys(bare)).toEqual(["nextSeq", "entries"]);
    expect(bare.entries).toBe(rows); // the caller's array itself untouched
    expect(rows.length).toBe(3);
  });
});

describe("compactJournal (FireLog keepLast law, nextSeq preserved)", () => {
  it("keeps the LAST rows, archives the head, and never touches nextSeq", () => {
    const j = appendN(emptyJournal, JOURNAL_CHUNK_ROWS * 2 + 10);
    const comp = compactJournal(j, 20);
    expect(comp.archived.length).toBe(j.entries.length - 20);
    expect(comp.archived[0]!.seq).toBe(0);
    expect(comp.journal.entries.map((e) => e.seq)).toEqual([
      ...Array.from({ length: 20 }, (_, i) => j.entries.length - 20 + i),
    ]);
    expect(comp.journal.nextSeq).toBe(j.nextSeq); // ledgerSeq mirror law
    expect(journalCompactedCount(comp.journal)).toBe(comp.archived.length);
    expect(journalCompactedCount(j)).toBe(0);
  });

  it("compacted journals still append: seq continues from nextSeq, not row count", () => {
    const j = appendN(emptyJournal, 10);
    const comp = compactJournal(j, 2);
    const posted = postEntry(comp.journal, CASH, {
      causeId: asCauseId("economy:test:after-compact"),
      atBusinessMin: 999,
      moneyColour: "blue",
      delta: { free: asMoney(3n) },
    });
    expect(posted.entry.seq).toBe(10);
    expect(posted.journal.entries.length).toBe(3);
    expect(posted.journal.entries[2]!.seq).toBe(10);
    expect(stringify(entriesWithoutCause(posted.journal))).toBe("[]");
  });

  it("no-op compaction returns the SAME value; illegal keepLast throws", () => {
    const j = appendN(emptyJournal, 4);
    expect(compactJournal(j, 4).journal).toBe(j);
    expect(compactJournal(j, 99).journal).toBe(j);
    expect(() => compactJournal(j, -1)).toThrow(RangeError);
    expect(() => compactJournal(j, 1.5)).toThrow(RangeError);
  });

  it("compacted output stays serialization-clean {nextSeq, entries}", () => {
    const j = appendN(emptyJournal, JOURNAL_CHUNK_ROWS + 1);
    const comp = compactJournal(j, 3);
    expect(Object.keys(comp.journal)).toEqual(["nextSeq", "entries"]);
    const bare: Journal = { nextSeq: comp.journal.nextSeq, entries: [...comp.journal.entries] };
    expect(encodeCanonicalBinary(comp.journal)).toEqual(encodeCanonicalBinary(bare));
  });

  it("keepLast 0 drops every row but keeps the seq counter honest", () => {
    const j = appendN(emptyJournal, JOURNAL_CHUNK_ROWS + 1);
    const comp = compactJournal(j, 0);
    expect(comp.journal.entries.length).toBe(0);
    expect(comp.archived.length).toBe(j.entries.length);
    expect(lastEntry(comp.journal)).toBeNull();
  });
});

describe("append cost (perf audit #3 bench)", () => {
  it(
    "100k appends finish < 200ms total, contention-adaptive (was O(n²) spread-append, ~2.1ms/append at 100k)",
    () => {
      // The PIN budget is the audit's 200ms. The dev box carries a steady
      // ~4.4 load average from sibling lanes, which inflates EVERY wall
      // sample, so the budget scales with a self-measured contention factor
      // (fixed CPU spin: ~8ms idle). Hard ceiling 4×200 = 800ms stays ~250×
      // below the quadratic failure mode (old spread-append needed minutes
      // for 100k here), and the amortized-O(1) probe below independently
      // pins linearity — a re-introduced O(n) copy cannot pass both.
      let spin = 0;
      const tCal = performance.now();
      for (let i = 0; i < 3e7; i += 1) spin += i & 7;
      const calMs = performance.now() - tCal;
      if (spin < 0) throw new Error("unreachable");
      const factor = Math.min(4, Math.max(1, calMs / 8));
      const budget = 200 * factor;

      let best = Number.POSITIVE_INFINITY;
      let j: Journal = emptyJournal;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const t0 = performance.now();
        j = appendN(emptyJournal, 100_000);
        best = Math.min(best, performance.now() - t0);
      }
      expect(j.entries.length).toBe(100_000);
      expect(j.nextSeq).toBe(100_000);
      // sanity that the tail is intact and cheap to read
      expect(lastEntry(j)!.seq).toBe(99_999);
      expect(best).toBeLessThan(budget);
    },
    180_000, // generous: calibration + three 100k runs under contention
  );

  it("append cost does not grow with history size (amortized O(1) probe)", () => {
    const small = appendN(emptyJournal, 1_000);
    const big = appendN(small, 99_000); // now at 100k rows
    const t0 = performance.now();
    for (let i = 0; i < 5_000; i += 1) {
      void postEntry(big, CASH, {
        causeId: asCauseId(`economy:test:probe:${i}`),
        atBusinessMin: i,
        moneyColour: "blue",
        delta: { free: asMoney(1n) },
      });
    }
    const atBig = performance.now() - t0;
    const t1 = performance.now();
    for (let i = 0; i < 5_000; i += 1) {
      void postEntry(small, CASH, {
        causeId: asCauseId(`economy:test:probe:${i}`),
        atBusinessMin: i,
        moneyColour: "blue",
        delta: { free: asMoney(1n) },
      });
    }
    const atSmall = performance.now() - t1;
    // Same order of work regardless of history length: ≤ 6× the small-history
    // cost. (Old spread-append was ~100× slower at 100k than at 1k.)
    expect(atBig).toBeLessThan(Math.max(6 * atSmall, 50));
  });
});

/** JSON view with bigint-safe rendering (delta amounts are MoneyUnit bigints). */
const show = (value: unknown): string =>
  JSON.stringify(value, (_k, v) => (typeof v === "bigint" ? `${v}n` : v));

describe("appendJournal batch lane (tick post path)", () => {
  const cash0: MoneyBuckets = {
    free: asMoney(1_000_000n),
    restricted: asMoney(0n),
    deferred: asMoney(0n),
    accountsReceivable: asMoney(0n),
    backlog: asMoney(0n),
    committedOut: asMoney(0n),
  };
  const draft = (n: number, minute: number) => ({
    causeId: asCauseId(`batch:${n}`),
    atBusinessMin: minute,
    moneyColour: "green" as never,
    delta: { free: asMoney(BigInt(n + 1) * 1000n) },
    context: `batch ${n}`,
  });

  it("sequential postEntry and batched draftEntry+appendJournal are byte-identical", () => {
    let seqJournal = emptyJournal;
    let seqCash = cash0;
    const batchRows: LedgerEntry[] = [];
    let batchCash = cash0;
    for (let i = 0; i < 40; i += 1) {
      const d = draft(i, i * 7);
      const posted = postEntry(seqJournal, seqCash, d);
      seqJournal = posted.journal;
      seqCash = posted.cash;
      const drafted = draftEntry(batchCash, d, batchRows.length);
      batchRows.push(drafted.entry);
      batchCash = drafted.cash;
    }
    const batchJournal = appendJournal(emptyJournal, batchRows);
    expect(batchJournal.nextSeq).toBe(seqJournal.nextSeq);
    expect(show(batchJournal)).toBe(show(seqJournal));
    expect(batchJournal.entries.map((e) => e.seq)).toEqual(seqJournal.entries.map((e) => e.seq));
    expect(show(batchCash)).toBe(show(seqCash));
    expect(lastEntry(batchJournal)?.causeId).toBe("batch:39");
  });

  it("appends onto a journal that already has posts and bare-literal history", () => {
    const seeded = postEntry(postEntry(emptyJournal, cash0, draft(0, 0)).journal, cash0, draft(1, 3));
    const fromLiteral: Journal = JSON.parse(show(seeded.journal));
    const rows = [draftEntry(seeded.cash, draft(2, 5), 2).entry, draftEntry(seeded.cash, draft(3, 6), 3).entry];
    const batched = appendJournal(fromLiteral, rows);
    let manual = fromLiteral;
    let manualCash = seeded.cash;
    for (const d of [draft(2, 5), draft(3, 6)]) {
      const posted = postEntry(manual, manualCash, d);
      manual = posted.journal;
      manualCash = posted.cash;
    }
    expect(show(batched)).toBe(show(manual));
    expect(batched.nextSeq).toBe(4);
  });

  it("zero rows returns the SAME journal value", () => {
    const j = postEntry(emptyJournal, cash0, draft(0, 0)).journal;
    expect(appendJournal(j, [])).toBe(j);
  });

  it("seq gap, bad minute, and corrupt nextSeq all throw fail-loud", () => {
    const good = draftEntry(cash0, draft(0, 0), 0).entry;
    const skipped = { ...draftEntry(cash0, draft(5, 1), 5).entry };
    expect(() => appendJournal(emptyJournal, [good, skipped])).toThrow(/breaks continuity at 1/);
    const badMinute = { ...good, atBusinessMin: -2 as never };
    expect(() => appendJournal(emptyJournal, [badMinute])).toThrow(/atBusinessMin/);
    const corrupt = { ...emptyJournal, nextSeq: -1 } as unknown as Journal;
    expect(() => appendJournal(corrupt, [good])).toThrow(/corrupt nextSeq -1/);
  });

  it("base journal stays pure across two branched batch appends", () => {
    const base = postEntry(emptyJournal, cash0, draft(0, 0)).journal;
    const rowA = draftEntry(cash0, draft(1, 1), base.nextSeq).entry;
    const rowB = draftEntry(cash0, draft(2, 2), base.nextSeq).entry;
    const withA = appendJournal(base, [rowA]);
    const withB = appendJournal(base, [rowB]);
    expect(base.entries.map((e) => e.causeId)).toEqual(["batch:0"]);
    expect(withA.entries.map((e) => e.causeId)).toEqual(["batch:0", "batch:1"]);
    expect(withB.entries.map((e) => e.causeId)).toEqual(["batch:0", "batch:2"]);
  });
});
