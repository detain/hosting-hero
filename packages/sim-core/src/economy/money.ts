/**
 * Money primitives — integer µ$ arithmetic only (MASTER_REPORT §4.4, C5).
 *
 * CONTRACT DECISION (§4.1 "Fixed-point core"): every dollar amount is a
 * `MoneyUnit` (signed integer micro-dollars, bigint). Multiplication of money
 * by a rate uses an EXACT bigint ratio {num, den} rather than Q16.16 Fixed:
 * µ$ is already micro-scaled, so a second rounding layer would make invoices
 * drift between replays. Fixed stays reserved for probabilities, scores and
 * display ratios (kernel/fixed.ts). Ratios here are always reduced at the
 * point of rounding, never accumulated as floats (docs/CONVENTIONS.md: no
 * floats in logic).
 */

import { asMoney, type MoneyUnit } from "../types.ts";

/** Micro-dollars per whole dollar. */
export const MICRO_USD_PER_USD: bigint = 1_000_000n;

/** Basis-point denominator (1 bp = 1/100 of a percent). */
export const BPS_DEN: bigint = 10_000n;

/** An exact rational multiplier for money, e.g. {num: 290n, den: 10_000n} = 2.9%. */
export interface MoneyRatio {
  readonly num: bigint;
  readonly den: bigint;
}

/** Parse a basis-point value into a trusted MoneyRatio (boundary parse). */
export function ratioFromBps(bps: bigint): MoneyRatio {
  if (bps < 0n) throw new RangeError(`economy/money: negative bps ${bps}`);
  return { num: bps, den: BPS_DEN };
}

/** Whole-dollar literal → MoneyUnit (test/content authoring convenience). */
export function usd(wholeDollars: bigint): MoneyUnit {
  return asMoney(wholeDollars * MICRO_USD_PER_USD);
}

/** Raw µ$ literal → MoneyUnit. */
export function micro(n: bigint): MoneyUnit {
  return asMoney(n);
}

export function addMoney(a: MoneyUnit, b: MoneyUnit): MoneyUnit {
  return asMoney(a + b);
}

/** Difference; result may be negative (deltas are signed by contract). */
export function subMoney(a: MoneyUnit, b: MoneyUnit): MoneyUnit {
  return asMoney(a - b);
}

export function negateMoney(a: MoneyUnit): MoneyUnit {
  return asMoney(-a);
}

export function isPositiveMoney(a: MoneyUnit): boolean {
  return a > 0n;
}

export function isNegativeMoney(a: MoneyUnit): boolean {
  return a < 0n;
}

/** Fail-loud (Law 4) helper for "this must be a spendable positive amount". */
export function requirePositive(amount: MoneyUnit, context: string): void {
  if (amount > 0n) return;
  throw new RangeError(`economy/money: ${context} requires amount > 0, got ${amount} µ$`);
}

/** Fail-loud helper for balances: a bucket total may never go negative. */
export function requireNonNegative(amount: MoneyUnit, context: string): void {
  if (amount >= 0n) return;
  throw new RangeError(`economy/money: ${context} would go negative: ${amount} µ$`);
}

/**
 * amount × num/den, rounded HALF-AWAY-FROM-ZERO (same rounding discipline as
 * kernel/fixed.ts). den must be ≥ 1; fails loud otherwise.
 */
export function scaleMoney(amount: MoneyUnit, ratio: MoneyRatio, context: string): MoneyUnit {
  if (ratio.den < 1n) {
    throw new RangeError(`economy/money: ${context} ratio den must be >= 1, got ${ratio.den}`);
  }
  const product = amount * ratio.num;
  const sign = product < 0n ? -1n : 1n;
  const magnitude = (product < 0n ? -product : product) * 2n + ratio.den;
  return asMoney(sign * (magnitude / (2n * ratio.den)));
}

/** money × bps / 10000 — the bread-and-butter fee/discount roll. */
export function bpsOf(amount: MoneyUnit, bps: bigint, context: string): MoneyUnit {
  return scaleMoney(amount, { num: bps, den: BPS_DEN }, context);
}

export function sumMoney(values: readonly MoneyUnit[]): MoneyUnit {
  return values.reduce<bigint>((acc, v) => acc + v, 0n) as MoneyUnit;
}

/** True when a value is genuinely a bigint at runtime (fuzz-test support:
 *  no float may ever masquerade as money). */
export function isBigintMoney(value: unknown): value is bigint {
  return typeof value === "bigint";
}
