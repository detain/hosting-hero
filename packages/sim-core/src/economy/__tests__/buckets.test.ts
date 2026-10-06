import { describe, expect, it } from "vitest";

import { asCauseId, asMoney, emptyMoneyBuckets, type BucketId, type MoneyBuckets, type MoneyUnit } from "../../types.js";
import { streamFor } from "../../kernel/rng.js";
import {
  applyBucketDelta,
  assertBucketInvariants,
  bankBalance,
  BUCKET_IDS,
  creditBucket,
  isSpendableBucket,
  netPosition,
  spendFree,
  transferBetween,
} from "../buckets.js";
import { emptyJournal, postEntry } from "../ledger.js";
import { SEED } from "./helpers.js";

/**
 * Bucket invariants under 1,000 seeded random transactions (task-1): the
 * journal is the ONLY mutation path, so conservation + non-negativity +
 * causeId presence + seq monotonicity must all survive.
 */

const TRANSACTIONS = 1_000;

function bucketAt(stream: { range(n: number): number }): BucketId {
  return BUCKET_IDS[stream.range(BUCKET_IDS.length)]!;
}

describe("bucket invariants under 1k seeded transactions", () => {
  const cash0: MoneyBuckets = {
    ...emptyMoneyBuckets(),
    free: asMoney(1_000_000_000n), // $1,000
    restricted: asMoney(500_000_000n),
    deferred: asMoney(250_000_000n),
    accountsReceivable: asMoney(100_000_000n),
    backlog: asMoney(75_000_000n),
    committedOut: asMoney(25_000_000n),
  };

  let journal = emptyJournal;
  let cash = cash0;
  let applied = 0;
  let rejected = 0;
  let skipped = 0; // no-op rolls (same-bucket transfer) — never posted

  const stream = streamFor(SEED, "test/bucket-fuzz", 0);
  for (let i = 0; i < TRANSACTIONS; i += 1) {
    const roll = stream.range(100);
    const amount = asMoney(BigInt(1 + stream.range(50_000_000)));
    try {
      if (roll < 35) {
        const posted = postEntry(journal, cash, {
          causeId: asCauseId(`test:credit:${i}`),
          atBusinessMin: i,
          moneyColour: "green",
          delta: { [bucketAt(stream)]: amount } as Partial<Record<BucketId, MoneyUnit>>,
        });
        ({ journal, cash } = posted);
        applied += 1;
      } else if (roll < 85) {
        const from = bucketAt(stream);
        const to = bucketAt(stream);
        if (from === to) {
          skipped += 1;
          continue;
        }
        const posted = postEntry(journal, cash, {
          causeId: asCauseId(`test:transfer:${i}:${from}->${to}`),
          atBusinessMin: i,
          moneyColour: "blue",
          delta: { [from]: asMoney(-amount), [to]: amount } as Partial<Record<BucketId, MoneyUnit>>,
        });
        ({ journal, cash } = posted);
        applied += 1;
      } else {
        const posted = postEntry(journal, cash, {
          causeId: asCauseId(`test:spend:${i}`),
          atBusinessMin: i,
          moneyColour: "amber",
          delta: { free: asMoney(-amount) },
        });
        ({ journal, cash } = posted);
        applied += 1;
      }
      assertBucketInvariants(cash, `t${i}`);
    } catch (err) {
      if (!(err instanceof RangeError)) throw err;
      rejected += 1;
    }
  }

  it("applied the overwhelming majority of the fuzz transactions", () => {
    // transfers out of thin-air buckets legitimately RangeError (fail-fast,
    // Law 4); the invariant under test is that none of them CORRUPTED state.
    expect(applied).toBeGreaterThan(800);
    expect(applied + rejected + skipped).toBe(TRANSACTIONS);
  });

  it("every bucket stayed non-negative", () => {
    for (const b of BUCKET_IDS) expect(cash[b] >= 0n || cash[b] === 0n).toBe(true);
    expect(() => assertBucketInvariants(cash, "final")).not.toThrow();
  });

  it("every journal entry carries a non-empty causeId and monotonic seq", () => {
    expect(journal.entries.length).toBe(applied);
    journal.entries.forEach((entry, index) => {
      expect(typeof entry.causeId).toBe("string");
      expect(entry.causeId.length).toBeGreaterThan(0);
      expect(entry.seq).toBe(index);
    });
  });

  it("delta sums conserve mass per bucket (journal mirrors reality)", () => {
    const totals = new Map<BucketId, bigint>(BUCKET_IDS.map((b) => [b, 0n]));
    for (const entry of journal.entries) {
      for (const [bucket, amount] of Object.entries(entry.delta) as [BucketId, MoneyUnit][]) {
        totals.set(bucket, (totals.get(bucket) ?? 0n) + amount);
      }
    }
    for (const bucket of BUCKET_IDS) {
      expect(cash[bucket]).toBe(asMoney(cash0[bucket] + (totals.get(bucket) ?? 0n)));
    }
  });

  it("all money values stayed bigint through the fuzz (never float)", () => {
    for (const bucket of BUCKET_IDS) expect(typeof cash[bucket]).toBe("bigint");
    for (const entry of journal.entries) {
      for (const amount of Object.values(entry.delta)) expect(typeof amount).toBe("bigint");
    }
  });
});

describe("bucket spendability law (§6.13: only free is spendable)", () => {
  it("flags exactly one spendable bucket", () => {
    expect(BUCKET_IDS.filter(isSpendableBucket)).toEqual(["free"]);
  });

  it("refuses free-spend beyond balance with a loud message", () => {
    const cash = { ...emptyMoneyBuckets(), free: asMoney(10n) };
    expect(() => spendFree(cash, asMoney(11n), "overdraft")).toThrow(/NOT spendable/);
  });

  it("refuses any negative-result bucket mutation", () => {
    const cash = { ...emptyMoneyBuckets(), deferred: asMoney(5n) };
    expect(() => applyBucketDelta(cash, { bucket: "deferred", amount: asMoney(-6n) }, "x")).toThrow(/negative/);
    expect(() => transferBetween(cash, "deferred", "free", asMoney(6n), "x")).toThrow(/negative/);
  });

  it("transfers conserve mass and credits stay positive-only", () => {
    const cash = { ...emptyMoneyBuckets(), restricted: asMoney(100n) };
    const moved = transferBetween(cash, "restricted", "free", asMoney(40n), "release");
    expect(moved.restricted).toBe(asMoney(60n));
    expect(moved.free).toBe(asMoney(40n));
    expect(() => creditBucket(cash, "free", asMoney(-1n), "bad")).toThrow();
  });

  it("bankBalance excludes AR/backlog/committed-out; netPosition includes them", () => {
    const cash: MoneyBuckets = {
      free: asMoney(10n),
      restricted: asMoney(20n),
      deferred: asMoney(30n),
      accountsReceivable: asMoney(40n),
      backlog: asMoney(50n),
      committedOut: asMoney(60n),
    };
    expect(bankBalance(cash)).toBe(asMoney(60n));
    expect(netPosition(cash)).toBe(asMoney(90n));
  });
});

describe("journal write path structure (P10 attribution)", () => {
  it("postEntry REQUIRES a causeId at the type level and rejects empty deltas", () => {
    const cash = { ...emptyMoneyBuckets(), free: asMoney(10n) };
    expect(() => postEntry(emptyJournal, cash, {
      causeId: asCauseId("x"),
      atBusinessMin: 0,
      moneyColour: "gold",
      delta: { free: asMoney(0n) },
    })).toThrow(/at least one bucket/);
  });

  it("a rejected entry leaves caller state untouched (purity on failure)", () => {
    const cash = { ...emptyMoneyBuckets(), free: asMoney(10n) };
    const journal = emptyJournal;
    expect(() => postEntry(journal, cash, {
      causeId: asCauseId("bad"),
      atBusinessMin: 0,
      moneyColour: "gold",
      delta: { free: asMoney(-11n) },
    })).toThrow();
    expect(journal.entries.length).toBe(0);
    expect(cash.free).toBe(asMoney(10n));
  });

  it("atBusinessMin must be a non-negative integer minute", () => {
    const cash = { ...emptyMoneyBuckets(), free: asMoney(10n) };
    expect(() => postEntry(emptyJournal, cash, {
      causeId: asCauseId("t"),
      atBusinessMin: 1.5,
      moneyColour: "gold",
      delta: { free: asMoney(1n) },
    })).toThrow(/integer minute/);
  });
});
