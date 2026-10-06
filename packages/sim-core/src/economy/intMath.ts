/**
 * Integer calendar-division helpers — NO FLOATS (E-12; docs/CONVENTIONS.md
 * "no floats in logic").
 *
 * Business-minute quantities are safe integers, but float64 `x / y` can round
 * a true `k − 1/y` quotient UP to exactly `k`, silently shifting a month /
 * week / term boundary by one period at the worst possible place (the tick
 * that decides what invoices, rolls, or anniversaries fire). Every boundary
 * division in the economy therefore goes through bigint, where the floor and
 * the half-up round are exact by construction.
 *
 * Internal to the economy module — deliberately NOT re-exported through the
 * barrel: these are implementation discipline, not public API surface.
 */

function guardOperands(numerator: number, denominator: number): void {
  if (!Number.isSafeInteger(numerator) || !Number.isSafeInteger(denominator)) {
    throw new RangeError(
      `economy/intMath: operands must be safe integers, got ${numerator} / ${denominator}`,
    );
  }
  if (denominator <= 0) {
    throw new RangeError(`economy/intMath: denominator must be positive, got ${denominator}`);
  }
}

function toSafeNumber(quotient: bigint): number {
  if (quotient > BigInt(Number.MAX_SAFE_INTEGER) || quotient < BigInt(Number.MIN_SAFE_INTEGER)) {
    throw new RangeError(`economy/intMath: quotient ${quotient} exceeds the safe-integer range`);
  }
  return Number(quotient);
}

/** floor(n / d) in bigint — correct for signed numerators (truncating `/`
 *  would round TOWARD ZERO, one period too late on the negative side). */
export function floorDiv(numerator: number, denominator: number): number {
  guardOperands(numerator, denominator);
  const d = BigInt(denominator);
  let q = BigInt(numerator) / d;
  if (numerator < 0 && q * d !== BigInt(numerator)) q -= 1n;
  return toSafeNumber(q);
}

/** round-half-UP(n / d) in bigint, for non-negative n — the term-length
 *  reading ("does this span k or k+1 months?"). */
export function roundDiv(numerator: number, denominator: number): number {
  guardOperands(numerator, denominator);
  if (numerator < 0) {
    throw new RangeError(`economy/intMath: roundDiv needs numerator >= 0, got ${numerator}`);
  }
  return toSafeNumber((2n * BigInt(numerator) + BigInt(denominator)) / (2n * BigInt(denominator)));
}
