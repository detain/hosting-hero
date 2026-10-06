/**
 * The loader's boundary conversions — THE float-exclusion gate
 * (MASTER_REPORT §4.1 / docs/CONVENTIONS.md §4: "no floats in logic paths").
 *
 * JSON numbers arrive as IEEE-754 doubles. This module never does arithmetic
 * on them: every number is first recovered as its SHORTEST ROUND-TRIP DECIMAL
 * TEXT (`String(n)` — for authored literals like `0.1`, `3000`, `[0.6,1.0,1.6]`
 * this reproduces exactly what the author typed), then parsed digit-by-digit
 * into an exact bigint ratio, then scaled with pure bigint math
 * (`fixed.fromRatio` / exact integer products). A float therefore NEVER enters
 * loaded state — the loaded struct holds only `Fixed` (bigint Q16.16),
 * `SimTimeUs` (bigint µs), `MoneyUnit` (bigint µ$) and verified safe integers.
 *
 * Law 4 (fail fast): out-of-range, non-integer, sub-µs, sub-µ$ and malformed
 * values throw `LoaderError` carrying the dotted JSON path, never coerce.
 */

import type { Fixed, MoneyUnit, SimTimeUs } from "../types.ts";
import { asMoney } from "../types.ts";
import { FIXED_ONE, FIXED_RAW_MAX, FIXED_RAW_MIN, fromRatio } from "../kernel/fixed.ts";
import { MICROS_PER_MS } from "../kernel/time.ts";

/** Machine-readable failure codes; every loader error carries one + a path. */
export type LoaderErrorCode =
  | "MISSING_FIELD"
  | "UNKNOWN_FIELD"
  | "WRONG_TYPE"
  | "BAD_ENUM"
  | "OUT_OF_RANGE"
  | "NOT_A_SAFE_INTEGER"
  | "SUB_MICROSECOND_RESOLUTION"
  | "SUB_MICROUSD_RESOLUTION"
  | "BAD_PATTERN"
  | "NON_FINITE_NUMBER";

export class LoaderError extends Error {
  readonly code: LoaderErrorCode;
  /** Dotted path of the offending value, e.g. "economy.fifthAxisScore.weight". */
  readonly path: string;

  constructor(code: LoaderErrorCode, path: string, message: string) {
    super(`loader[${code}] at '${path}': ${message}`);
    this.name = "LoaderError";
    this.code = code;
    this.path = path;
  }
}

/* ═════════════════════ exact decimal capture ═════════════════════ */

const DECIMAL_TEXT = /^(-?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/;

export interface DecimalRatio {
  readonly numerator: bigint;
  readonly denominator: bigint;
}

/** Parse a decimal literal text (as produced by `String(number)`) into an
 *  exact bigint ratio. Pure string→bigint digit math; no float arithmetic.
 *  Throws LoaderError (WRONG_TYPE) on anything that is not a plain decimal. */
export function decimalRatioFromText(text: string, path: string): DecimalRatio {
  const match = DECIMAL_TEXT.exec(text);
  if (match === null) {
    throw new LoaderError("WRONG_TYPE", path, `'${text}' is not a plain decimal literal`);
  }
  const [, sign, whole, frac, expText] = match;
  const digits = `${whole ?? ""}${frac ?? ""}`;
  let numerator = BigInt(digits);
  let denominator = 10n ** BigInt((frac ?? "").length);
  const exponent = expText === undefined ? 0 : Number(expText);
  if (exponent >= 0) {
    numerator *= 10n ** BigInt(exponent);
  } else {
    denominator *= 10n ** BigInt(-exponent);
  }
  if (sign === "-") numerator = -numerator;
  return { numerator, denominator };
}

function requireFinite(value: number, path: string): number {
  if (!Number.isFinite(value)) {
    throw new LoaderError("NON_FINITE_NUMBER", path, `${String(value)} can never enter loaded state`);
  }
  return value;
}

/* ═════════════════════ branded-value conversions ═════════════════════ */

/** JSON number → Q16.16 Fixed. Exact: decimal text → ratio → fromRatio
 *  (round-half-away, same policy as every other Fixed producer). */
export function toFixed(value: number, path: string): Fixed {
  requireFinite(value, path);
  const { numerator, denominator } = decimalRatioFromText(String(requireFinite(value, path)), path);
  return fromRatio(numerator, denominator);
}

/** JSON number → Fixed restricted to [0, 1] (probabilities, shares, weights). */
export function toFixedUnit(value: number, path: string): Fixed {
  const raw = toFixed(value, path);
  if (raw < 0n || raw > FIXED_ONE) {
    throw new LoaderError(
      "OUT_OF_RANGE",
      path,
      `${value} maps to raw ${raw}; expected fraction in [0,1] (raw [0,${FIXED_ONE}])`,
    );
  }
  return raw;
}

/** JSON number (milliseconds) → SimTimeUs integer microseconds, exact.
 *  Sub-microsecond precision fails loud: the budget could not be honoured. */
export function msToUs(value: number, path: string): SimTimeUs {
  requireFinite(value, path);
  if (value < 0) {
    throw new LoaderError("OUT_OF_RANGE", path, `millisecond budget ${value} is negative`);
  }
  const { numerator, denominator } = decimalRatioFromText(String(value), path);
  const microsTimesScale = numerator * MICROS_PER_MS;
  if (microsTimesScale % denominator !== 0n) {
    throw new LoaderError(
      "SUB_MICROSECOND_RESOLUTION",
      path,
      `${value} ms is not an integer number of microseconds; integer-µs state cannot hold it`,
    );
  }
  return microsTimesScale / denominator;
}

/** JSON number (whole dollars) → MoneyUnit integer micro-dollars, exact.
 *  Sub-µ$ precision fails loud (money is bigint µ$, types.ts contract). */
export function dollarsToMoney(value: number, path: string): MoneyUnit {
  requireFinite(value, path);
  const { numerator, denominator } = decimalRatioFromText(String(value), path);
  const micros = numerator * 1_000_000n;
  if (micros % denominator !== 0n) {
    throw new LoaderError(
      "SUB_MICROUSD_RESOLUTION",
      path,
      `${value} USD is not an integer number of micro-dollars`,
    );
  }
  return asMoney(micros / denominator);
}

/** JSON number that must be a safe integer (counts, minutes, pips, tiers). */
export function toSafeInt(value: number, path: string, min: number, max: number): number {
  requireFinite(value, path);
  if (!Number.isSafeInteger(value)) {
    throw new LoaderError(
      "NOT_A_SAFE_INTEGER",
      path,
      `${value} must be an integer — fractional counts never enter loaded state`,
    );
  }
  if (value < min || value > max) {
    throw new LoaderError("OUT_OF_RANGE", path, `${value} outside [${min}, ${max}]`);
  }
  return value;
}

/** Guard: Fixed inside the Q16.16 domain (fromRatio already checks; exposed
 *  for callers pre-screening authored numbers). */
export function fixedInDomain(raw: bigint): boolean {
  return raw >= FIXED_RAW_MIN && raw <= FIXED_RAW_MAX;
}
