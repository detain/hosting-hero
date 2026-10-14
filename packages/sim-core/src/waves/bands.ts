/**
 * Telegraph band law (§1.7, ratified 2026-10-06, MASTER_REPORT §4.3).
 *
 * Four bands decide what the player can SEE before an envelope lands —
 * they never decide whether it exists (R-16 keeps existence in the table):
 *
 *  - weather : fully visible at all times (the honest background)
 *  - storm   : telegraphed silhouette ahead of arrival
 *  - hunter  : NEVER telegraphed — symptom-only detection
 *  - entropy : telegraphed only if the forecast instrument is bought
 *              ("foresight is a purchase", §1.7)
 */

export type TelegraphBand = "weather" | "storm" | "hunter" | "entropy";

export const TELEGRAPH_BANDS: readonly TelegraphBand[] = ["weather", "storm", "hunter", "entropy"];

export function isTelegraphBand(value: unknown): value is TelegraphBand {
  return typeof value === "string" && (TELEGRAPH_BANDS as readonly string[]).includes(value);
}

/**
 * D-7 bounded storm-severity cap (ADR-0013 ruling 6, 2026-10-14): the engine
 * refuses to mint storms beyond these physical bounds. The ruling blessed the
 * SHAPE (hard rate ceiling + stacked-envelope cap) but explicitly NOT the
 * numbers "128/min + 8-stacked" — these constants are derived from the
 * ratified-adjacent inventory the gap row points at:
 *
 * - `rateUnitsPerMinute = 1024` (2^10):
 *   • 3.9× headroom over the census worst emergent storm in the shipped g1
 *     corpus — 264 units in one minute (mail/dns wave 5 at the full director
 *     entropy band ×1.25) — so the cap is inert for every authored slice
 *     (zero golden movement) while `128` would have refused shipped content.
 *   • ~1/32 of the Q16.16 saturation constant 32767.0 from the same pressure
 *     budget law: a capped storm front still moves the ρ gauge honestly
 *     instead of pinning it; 4096 aggregate (see below) is exactly
 *     saturation/8 territory, keeping gauges and budgets in one family.
 *   • same power-of-two family as pressure.ts's wave-index bound (4096):
 *     4 stacked fronts × 1024 = 4096 = the CI exponent bound — the whole
 *     lawful storm fits the pressure law's own complexity budget.
 *   • cross-check vs the 30:1 contention detent (OVERSELL_RATIO_MAX_MICRO):
 *     worst-case clumping concentrates a wave's ENTIRE budget into one
 *     minute, so the per-minute ceiling is the only honest bound on the
 *     oversell path — and it rides the clamp, not the die.
 *   • consequence (BOUNDED by the ruling): sheet-B 100%-par crests cross 1024
 *     around wave ~17–18 of a long table — late-game authors must par down
 *     or split across waves. That is the point of a severity cap.
 *
 * - `maxStackedEnvelopes = 4`: the §2.24 / ratified pressure-budget law
 *   (commit 47b2c33) composition cap of ≤4 entries per wave, promoted to an
 *   engine parse law by the same ADR-0013 ruling ("stacked-envelope cap
 *   expressed in the band ladder" — and TELEGRAPH_BANDS above has exactly
 *   this many rungs). Aggregate lawful load = 4 × 1024 units/minute.
 */
export const STORM_CAP: {
  readonly rateUnitsPerMinute: number;
  readonly maxStackedEnvelopes: number;
} = Object.freeze({
  rateUnitsPerMinute: 1024,
  maxStackedEnvelopes: 4,
});

/**
 * Is an envelope of `band` visible to the player pre-arrival?
 * `entropyForecastPurchased` is the only lever, and it moves only entropy.
 */
export function telegraphVisible(band: TelegraphBand, entropyForecastPurchased: boolean): boolean {
  if (band === "weather") return true;
  if (band === "storm") return true;
  if (band === "hunter") return false;
  return entropyForecastPurchased;
}
