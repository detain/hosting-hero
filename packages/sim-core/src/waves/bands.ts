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
 * Is an envelope of `band` visible to the player pre-arrival?
 * `entropyForecastPurchased` is the only lever, and it moves only entropy.
 */
export function telegraphVisible(band: TelegraphBand, entropyForecastPurchased: boolean): boolean {
  if (band === "weather") return true;
  if (band === "storm") return true;
  if (band === "hunter") return false;
  return entropyForecastPurchased;
}
