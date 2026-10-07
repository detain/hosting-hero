/**
 * Number Law (§8.15) — every display formatter the HUD is allowed to use,
 * as pure functions so the laws are testable without a DOM:
 *
 *  • tabular figures everywhere (digit-by-digit roll is a Vue concern; the
 *    string shape is fixed-width per fraction-digit count here),
 *  • money NEVER abbreviated below $10k,
 *  • percentages get a decimal place ONLY below 10,
 *  • latency is always ms — never seconds,
 *  • uptime renders as nines WITH minutes, always both: "three nines (43m/mo)",
 *  • units are returned SEPARATELY from the value so the SFC can stamp them
 *    in a lighter weight than the number (§8.15 unit-stamp law).
 *
 * Fog law rides through all of these: `null` input renders "?", never 0
 * (§4.1 R-66) — an unmeasured number is not a zero number.
 */

/** A value plus its unit stamp; the component renders the unit dimmer. */
export interface StampedValue {
  readonly value: string;
  readonly unit: string;
}

/** NO DATA is "?" — shared glyph across every formatter. */
export const NO_DATA = "?";

function isDisplayable(value: number | null | undefined): value is number {
  return value !== null && value !== undefined && Number.isFinite(value);
}

/**
 * Locale-free grouping (Text Law — chrome/textLaw.ts): `toLocaleString`
 * smuggles an ICU table into a byte-identity contract; the HUD must print the
 * same string on every host. `toFixed` supplies the deterministic digit
 * string (same spec rounding the en-US formatter used); we then stamp a
 * U+002C every three integer digits. |value| ≥ 1e21 escapes to toFixed's
 * exponential form — honest, deterministic, and far outside HUD display
 * range (money arrives as µ$ bigint and divides down long before this).
 */
function formatGrouped(value: number, fractionDigits: number): string {
  const fixed = value.toFixed(fractionDigits);
  if (fixed.includes("e")) return fixed;
  const negative = fixed.startsWith("-");
  const unsigned = negative ? fixed.slice(1) : fixed;
  const dot = unsigned.indexOf(".");
  const intPart = dot === -1 ? unsigned : unsigned.slice(0, dot);
  const fracPart = dot === -1 ? "" : unsigned.slice(dot);
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${negative ? "-" : ""}${grouped}${fracPart}`;
}

/** Grouped, fixed-fraction digits — the string half of tabular display.
 *  (CSS `font-variant-numeric: tabular-nums` is the other half; every HUD
 *  number element carries it in its class.) */
export function tabularNumber(value: number | null, fractionDigits = 0): string {
  if (!isDisplayable(value)) return NO_DATA;
  return formatGrouped(value, fractionDigits);
}

/**
 * Money from micro-dollars. Abbreviation floor: below $10k the FULL exact
 * figure ships ("$9,990.00", not "$10.0k"). Byte-identical to the former
 * `metrics.formatMicroUsd` — relocated here as the single money law (§8.15).
 */
export function formatMoney(microUsd: bigint): string {
  const negative = microUsd < 0n;
  const abs = negative ? -microUsd : microUsd;
  const dollars = Number(abs / 10_000n) / 100; // µ$ → $ at cent precision
  const body =
    abs >= 10_000_000_000n // $10k floor for abbreviation
      ? `${(dollars / 1000).toFixed(1)}k`
      : formatGrouped(dollars, 2);
  return `${negative ? "−" : ""}$${body}`;
}

export function formatMoneyOrNull(microUsd: bigint | null): string {
  if (microUsd === null) return NO_DATA;
  return formatMoney(microUsd);
}

/** Percentage display: one decimal ONLY below 10 (§8.15).
 *  0–100 percent value, not a 0–1 fraction. */
export function formatPercent(percent: number | null): string {
  if (!isDisplayable(percent)) return NO_DATA;
  if (percent < 0 || percent > 100) {
    throw new RangeError(`formatPercent: expected 0–100, got ${percent}`);
  }
  if (percent < 10) return `${percent.toFixed(1)}%`;
  return `${Math.round(percent)}%`;
}

/** Utilization fraction (0–1 Fixed display) → percent under the same law. */
export function formatRatioAsPercent(ratio: number | null): string {
  if (!isDisplayable(ratio)) return NO_DATA;
  return formatPercent(ratio * 100);
}

/**
 * Latency law: always milliseconds, never seconds (§8.15). One decimal
 * below 100 ms, whole grouped ms above. Value/unit split so the SFC can
 * stamp "ms" lighter than the number.
 */
export function formatLatencyMs(ms: number | null): StampedValue {
  if (!isDisplayable(ms)) return { value: NO_DATA, unit: "" };
  if (ms < 0) throw new RangeError(`formatLatencyMs: negative ${ms}ms`);
  const value = ms < 100 ? ms.toFixed(1) : tabularNumber(Math.round(ms));
  return { value, unit: "ms" };
}

export function formatLatencyFromUs(microUs: bigint | null): StampedValue {
  if (microUs === null) return { value: NO_DATA, unit: "" };
  return formatLatencyMs(Number(microUs) / 1000);
}

/** 30-day business month in minutes — the SLA budget denominator (§8.15). */
export const MINUTES_PER_BUSINESS_MONTH = 43_200;

const NINE_WORDS = ["", "one", "two", "three", "four", "five"] as const;

/**
 * Nines-with-minutes, ALWAYS BOTH (§8.15): 0.999 → "three nines (43m/mo)".
 * Minutes = (1 − ratio) × 43,200 (30-day month), rounded. A ratio with no
 * nines in it falls back to the plain percent so the string never lies
 * ("two nines" requires at least two).
 */
export function ninesWithMinutes(ratio: number | null): string {
  if (!isDisplayable(ratio)) return NO_DATA;
  if (ratio < 0 || ratio > 1) throw new RangeError(`ninesWithMinutes: ratio out of 0–1: ${ratio}`);
  const downtime = 1 - ratio;
  const minutes = Math.round(downtime * MINUTES_PER_BUSINESS_MONTH);
  if (downtime <= 0) return "five nines (0m/mo)";
  const nines = Math.floor(-Math.log10(downtime) + 1e-9);
  if (nines < 1) return `${formatPercent(ratio * 100)} (${minutes}m/mo)`;
  const phrase = nines === 1 ? "one nine" : nines > 5 ? "five+ nines" : `${NINE_WORDS[nines]} nines`;
  return `${phrase} (${minutes}m/mo)`;
}
