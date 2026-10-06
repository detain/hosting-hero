/**
 * Q16.16 fixed-point arithmetic over bigint raw units (MASTER_REPORT §4.1
 * "Fixed-point core", §7.0 P0). A `Fixed` value is a bigint where
 * value = raw / 2^16; the representable domain is the 32-bit two's complement
 * range of raw units (≈ −32768.0 … +32767.99998), matching the ratified
 * Q16.16 format. Every operation fails loud on overflow instead of wrapping
 * (Law 4) — a silently wrapped probability is the replay-poison class of bug.
 *
 * bigint is deliberate: an exact (a*b)>>16 product can need 64 bits, which
 * 32-bit-safe number arithmetic cannot hold; the shift/truncation semantics
 * are fully specified here, so results are bit-reproducible across browser
 * and Node (the OD-5(b) dual-runtime parity gate).
 *
 * PERF AUDIT (2026-10-06 kernel limb experiment, MEASURED AND REVERTED): a
 * 32-bit-limb fast path for `mul` (16-bit split via ./limbs.ts — the same
 * technique that WON 6.7× in rng.ts) was built, proven bit-identical over
 * ≥10^6 pairs by `__tests__/fixed-oracle.test.ts`, then benchmarked ~30%
 * SLOWER than this bigint form at every operand magnitude: boxed-bigint →
 * double conversion + re-boxing dominate, while V8's 1-limb mul/shift is
 * near-free. The tripwire tests are KEPT so any future attempt inherits the
 * identity proof. `div`/`fromRatio` stay bigint on principle too: float
 * quotient rounding is not spec-safe for exact floor semantics.
 *
 * Rounding policy (documented once, honored everywhere):
 *  - `mul`  → round-half-away-from-zero after the 16-bit downshift;
 *  - `div` / `fromRatio` → round-half-away-from-zero on the exact quotient;
 *  - `toNumber` → DISPLAY ONLY. Its IEEE-754 result may never re-enter sim
 *    state or replay paths (§4.1: "floats only in display math that can't
 *    touch replay").
 */

import type { Fixed } from "../types";

export const FRACTIONAL_BITS = 16;

/** Raw units per whole unit (2^16). */
export const FIXED_SCALE: Fixed = 1n << 16n;

/** 32-bit two's-complement raw domain, per Q16.16. */
export const FIXED_RAW_MAX: bigint = (1n << 31n) - 1n;
export const FIXED_RAW_MIN: bigint = -(1n << 31n);

export const FIXED_ZERO: Fixed = 0n;
export const FIXED_ONE: Fixed = FIXED_SCALE;
/** Largest value ≤ 1 — safe upper bound for probabilities (1.0 exactly). */
export const FIXED_UNIT: Fixed = FIXED_ONE;

function checked(raw: bigint, op: string): Fixed {
  if (raw > FIXED_RAW_MAX || raw < FIXED_RAW_MIN) {
    throw new Error(
      `fixed.${op}: result ${raw} overflows Q16.16 raw range [${FIXED_RAW_MIN}, ${FIXED_RAW_MAX}]`,
    );
  }
  return raw as Fixed;
}

/** Round an exact rational `num/den` half-away-from-zero (both bigint,
 *  den ≠ 0). Sign handled explicitly; no floating point. */
function divideRoundHalfAway(num: bigint, den: bigint): bigint {
  const negative = num < 0n !== den < 0n;
  const absNum = num < 0n ? -num : num;
  const absDen = den < 0n ? -den : den;
  const whole = absNum / absDen;
  const remainderTimesTwo = (absNum % absDen) * 2n;
  const magnitude = remainderTimesTwo >= absDen ? whole + 1n : whole;
  return negative ? -magnitude : magnitude;
}

/** Exact integer → Fixed. Rejects non-integers and out-of-range whole parts. */
export function fromInt(whole: number): Fixed {
  if (!Number.isSafeInteger(whole)) {
    throw new Error(`fixed.fromInt: ${whole} is not a safe integer`);
  }
  return checked(BigInt(whole) * FIXED_SCALE, "fromInt");
}

/** Exact rational → Fixed, e.g. fromRatio(1n, 3n) ≈ 0.33333. Fails loud on
 *  a zero denominator (Law 4: invalid state halts, no NaN culture). */
export function fromRatio(numerator: bigint, denominator: bigint): Fixed {
  if (denominator === 0n) {
    throw new Error(`fixed.fromRatio: zero denominator (numerator ${numerator})`);
  }
  return checked(divideRoundHalfAway(numerator * FIXED_SCALE, denominator), "fromRatio");
}

export function add(a: Fixed, b: Fixed): Fixed {
  return checked(a + b, "add");
}

export function sub(a: Fixed, b: Fixed): Fixed {
  return checked(a - b, "sub");
}

/** Product with one 16-bit downshift, rounded half away from zero.
 *  PERF NOTE (2026-10-06 kernel limb experiment, MEASURED AND REVERTED): a
 *  32-bit-limb fast path for this function was built, proven bit-identical
 *  (see __tests__/fixed-oracle.test.ts tripwires), and benchmarked ~30%
 *  SLOWER than the V8 small-bigint path below on every operand magnitude —
 *  boxed-bigint→double conversion and re-boxing dominate while V8's 1-limb
 *  mul/shift is near-free. Do not re-attempt without beating this baseline
 *  on the tools/headless bench. The bigint form IS the reference semantics. */
export function mul(a: Fixed, b: Fixed): Fixed {
  const product = a * b;
  const shifted = divideRoundHalfAway(product, FIXED_SCALE);
  return checked(shifted, "mul");
}

/** Quotient with one 16-bit upshift, rounded half away from zero.
 *  Fails loud on division by zero. */
export function div(a: Fixed, b: Fixed): Fixed {
  if (b === 0n) {
    throw new Error(`fixed.div: division by zero (numerator ${a})`);
  }
  return checked(divideRoundHalfAway(a * FIXED_SCALE, b), "div");
}

/** Total order: -1 | 0 | 1 (sort keys must use this, never subtraction —
 *  subtraction overflows). */
export function compare(a: Fixed, b: Fixed): -1 | 0 | 1 {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/** DISPLAY ONLY — convert to JS number for HUD/canvas text. The returned
 *  float must never re-enter any Fixed-domain computation or replay state. */
export function toNumber(value: Fixed): number {
  return Number(value) / Number(FIXED_SCALE);
}

/** Clamp to [0, 1] — for probabilities the pipeline composes. */
export function clampUnit(value: Fixed): Fixed {
  if (value < FIXED_ZERO) return FIXED_ZERO;
  if (value > FIXED_UNIT) return FIXED_UNIT;
  return value;
}

/** True when `raw` is inside the Q16.16 domain (loader validation helper). */
export function inRange(raw: bigint): boolean {
  return raw >= FIXED_RAW_MIN && raw <= FIXED_RAW_MAX;
}
