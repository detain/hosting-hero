/**
 * Six-bucket cash stack operations (MASTER_REPORT §4.4 / hosting_game.md
 * §6.13 "Cash Is Not One Number").
 *
 * Invariants enforced on EVERY mutation (assert, fail loud — Law 4):
 *  1. No bucket total may go negative. `committedOut` is stored as a POSITIVE
 *     magnitude of money already promised away ("negative cash"), so the
 *     non-negativity rule is uniform across all six.
 *  2. Only `free` is spendable; every other drain must arrive via a named
 *     transfer with its own cause (§6.13: death happens on free, not on the
 *     stack).
 *  3. A transfer conserves mass between the two buckets it touches.
 *
 * These functions are pure: they return NEW MoneyBuckets (Law 3). The only
 * sanctioned write path in the engine is `ledger.postEntry`, which calls
 * `applyBucketDelta` and stamps a causeId.
 */

import {
  asMoney,
  emptyMoneyBuckets,
  type BucketId,
  type MoneyBuckets,
  type MoneyUnit,
} from "../types.ts";
import { requireNonNegative, requirePositive } from "./money.ts";

/** Stable iteration order for bucket-keyed output (CONVENTIONS: sorted/
 *  declared order, never Object.entries of a mutated record). */
export const BUCKET_IDS: readonly BucketId[] = [
  "free",
  "restricted",
  "deferred",
  "accountsReceivable",
  "backlog",
  "committedOut",
] as const;

/** §6.13 spendability column: only free cash buys anything. */
export function isSpendableBucket(bucket: BucketId): boolean {
  return bucket === "free";
}

export function bucketBalance(cash: MoneyBuckets, bucket: BucketId): MoneyUnit {
  return cash[bucket];
}

/** Law-4 audit: called after every apply; names the offending bucket. */
export function assertBucketInvariants(cash: MoneyBuckets, context: string): void {
  for (const bucket of BUCKET_IDS) {
    requireNonNegative(cash[bucket], `bucket '${bucket}' at ${context}`);
  }
}

export function initialCash(free: MoneyUnit): MoneyBuckets {
  const cash: MoneyBuckets = { ...emptyMoneyBuckets(), free };
  assertBucketInvariants(cash, "initialCash");
  return cash;
}

export interface BucketDelta {
  readonly bucket: BucketId;
  readonly amount: MoneyUnit;
}

/**
 * Apply one bucket delta, failing loud (with the shortfall) when it would
 * drive the bucket negative. Returns the new stack; the old one is untouched.
 */
export function applyBucketDelta(cash: MoneyBuckets, delta: BucketDelta, context: string): MoneyBuckets {
  const next: MoneyBuckets = { ...cash, [delta.bucket]: asMoney(cash[delta.bucket] + delta.amount) };
  if (next[delta.bucket] < 0n) {
    throw new RangeError(
      `economy/buckets: ${context}: ${delta.amount} µ$ on '${delta.bucket}' ` +
        `(had ${cash[delta.bucket]} µ$) would go negative`,
    );
  }
  return next;
}

/** Free-cash spend; throws when the company literally cannot pay (§6.13). */
export function spendFree(cash: MoneyBuckets, amount: MoneyUnit, context: string): MoneyBuckets {
  requirePositive(amount, context);
  if (cash.free < amount) {
    throw new RangeError(
      `economy/buckets: ${context}: free cash ${cash.free} µ$ cannot cover ${amount} µ$ ` +
        `(restricted/deferred/AR are NOT spendable, §6.13)`,
    );
  }
  return applyBucketDelta(cash, { bucket: "free", amount: asMoney(-amount) }, context);
}

/** Non-free buckets gain only via explicit transfer (escrow→free release,
 *  deferred recognition, AR collection, factorization...). */
export function transferBetween(
  cash: MoneyBuckets,
  from: BucketId,
  to: BucketId,
  amount: MoneyUnit,
  context: string,
): MoneyBuckets {
  requirePositive(amount, context);
  if (from === to) {
    throw new RangeError(`economy/buckets: ${context}: transfer from '${from}' to itself`);
  }
  const left = applyBucketDelta(cash, { bucket: from, amount: asMoney(-amount) }, `${context} (out of ${from})`);
  const right = applyBucketDelta(left, { bucket: to, amount }, `${context} (into ${to})`);
  // Law-4 belt: mass conservation of a transfer.
  const before = cash[from] + cash[to];
  const after = right[from] + right[to];
  if (before !== after) {
    throw new Error(`economy/buckets: ${context}: transfer violated conservation (${before} → ${after})`);
  }
  return right;
}

export function creditBucket(cash: MoneyBuckets, bucket: BucketId, amount: MoneyUnit, context: string): MoneyBuckets {
  requirePositive(amount, context);
  return applyBucketDelta(cash, { bucket, amount }, context);
}

/** Cash the bank statement would show: settled money, wherever parked.
 *  AR/backlog are receivables, committedOut is a promise — not in the bank. */
export function bankBalance(cash: MoneyBuckets): MoneyUnit {
  return asMoney(cash.free + cash.restricted + cash.deferred);
}

/** Full economic position including receivables minus committed-out promises. */
export function netPosition(cash: MoneyBuckets): MoneyUnit {
  return asMoney(
    cash.free + cash.restricted + cash.deferred + cash.accountsReceivable + cash.backlog - cash.committedOut,
  );
}
