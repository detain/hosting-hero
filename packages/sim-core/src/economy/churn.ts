/**
 * Churn (MASTER_REPORT §4.4 T1: "churn in terms, not months").
 *
 * Two channels, per the doc:
 *  1. VOLUNTARY logo churn — a monthly probabilistic roll per contract, drawn
 *     from a stream keyed (runSeed, "economy/churn", business-month index,
 *     contractId) so the SAME (seed, contract, month) always gives the SAME
 *     answer (§4.1 R-16; determinism ×100 is a CI gate). Base rates: Sheet C
 *     real-market bands (§6.16:25610), bundle-keyed in config.
 *  2. INVOLUNTARY churn — card failure → dunning pipeline (see dunning.ts);
 *     this module only exposes the failure-rate helper the tick uses.
 *
 * Renewal cliffs are NOT rolled here — contract.ts resolves them as DATA
 * (renew/lapse/escalate) with retention from the term matrix (§6.12:24772);
 * the cliff rate simply replaces the monthly rate in the cliff month.
 *
 * The GHOSTED FORECAST (§7.15 / hosting_game.md:28660: "tickets → churn,
 * 30–60 day lag; show as forecast, not a timer"): support signals light a
 * fuse with a seeded 30–60 day lag; while lit, the fuse adds bps to the
 * contract's effective churn rate until an intervention defuses it or the
 * decay window passes. Trend, not countdown — but mechanically it is a
 * scheduled modifier so the sim stays deterministic.
 */

import { streamFor } from "../kernel/rng.ts";
import { type EntityId, type RunSeed, type SimMinute } from "../types.ts";
import type { EconomyConfig } from "./config.ts";
import { BPS_DEN } from "./money.ts";
import { applyFactorBps } from "./elasticity.ts";

export const CHURN_DOMAIN = "economy/churn";
export const CHURN_SIGNAL_DOMAIN = "economy/churn-signal";

export type ChurnRoll = "retained" | "churned";

/** Monthly voluntary churn rate for a contract: bundle base rate (Sheet C
 *  band via config lookup on `bundleId`), ghosted fuses added, clamped to
 *  [0, 10000] bps. Deterministic pure read.
 *
 *  `priceChurnFactorBps` (OD-24(a) part 2, default exactly 1.0): the
 *  elasticity multiplier from an active adjust-price override, applied to
 *  the rate BEFORE the clamp. Neutral ⇒ the pre-existing arithmetic runs
 *  byte-identically (no-roll discipline: this only re-scales the bps fed
 *  to churnRoll's single existing draw — it never adds a roll). */
export function effectiveMonthlyChurnBps(
  bundleId: string,
  contractId: EntityId,
  forecasts: readonly GhostedForecast[],
  atBusinessMin: SimMinute,
  cfg: EconomyConfig,
  priceChurnFactorBps: bigint = BPS_DEN,
): bigint {
  const base = cfg.churn.monthlyLogoChurnBpsByBundle[bundleId] ?? cfg.churn.fallbackMonthlyBps;
  const lit = forecastChurnBpsAt(forecasts, contractId, atBusinessMin);
  const total = applyFactorBps(base + lit, priceChurnFactorBps);
  return total > 10_000n ? 10_000n : total;
}

export function churnRoll(
  contractId: EntityId,
  effectiveBps: bigint,
  businessMonthIndex: number,
  runSeed: RunSeed,
): ChurnRoll {
  if (effectiveBps <= 0n) return "retained";
  const stream = streamFor(runSeed, CHURN_DOMAIN, businessMonthIndex, contractId);
  return stream.range(10_000) < Number(effectiveBps) ? "churned" : "retained";
}

/** Involuntary: monthly card-payment failure (5–9%, MID 7% §6.4). The tick
 *  rolls this per ACTIVE invoice at due time; dunning does the rest. */
export function paymentFailureRoll(invoiceDueAtMin: SimMinute, contractId: EntityId, runSeed: RunSeed, cfg: EconomyConfig): boolean {
  const stream = streamFor(runSeed, "economy/payment", invoiceDueAtMin, contractId);
  return stream.range(10_000) < Number(cfg.dunning.cardFailureBps);
}

/* ───────────────────────── ghosted forecast ───────────────────────────── */

export interface GhostedForecast {
  readonly contractId: EntityId;
  /** Extra churn bps applied while lit. */
  readonly addBps: bigint;
  /** When the signal was observed (ticket storm, PM ghosting...). */
  readonly signalledAtMin: SimMinute;
  /** Seeded point inside the 30–60 d lag band where the fuse LIT (§7.15). */
  readonly litAtMin: SimMinute;
  /** Lit fuses decay out after `ghostedSignalDecayDays` unless re-signalled
   *  (PROVISIONAL; the doc insists on trend-not-timer presentation). */
  readonly expiresAtMin: SimMinute;
}

/** Observe a churn signal: the lag inside the doc band is drawn from the
 *  per-(seed, contract, signal-minute) stream, so replays re-light exactly
 *  the same day. */
export function addChurnSignal(
  forecasts: readonly GhostedForecast[],
  contractId: EntityId,
  signalledAtMin: SimMinute,
  runSeed: RunSeed,
  cfg: EconomyConfig,
): readonly GhostedForecast[] {
  const minLag = cfg.churn.ghostedSignalLagMinDays;
  const maxLag = cfg.churn.ghostedSignalLagMaxDays;
  if (maxLag < minLag) throw new RangeError("economy/churn: ghosted lag band inverted");
  const stream = streamFor(runSeed, CHURN_SIGNAL_DOMAIN, signalledAtMin, contractId);
  const lagDays = minLag + stream.range(maxLag - minLag + 1);
  const litAtMin = signalledAtMin + lagDays * cfg.calendar.minutesPerDay;
  const entry: GhostedForecast = {
    contractId,
    addBps: cfg.churn.ghostedSignalAddBps,
    signalledAtMin,
    litAtMin,
    expiresAtMin: litAtMin + cfg.churn.ghostedSignalDecayDays * cfg.calendar.minutesPerDay,
  };
  // Sorted by (contractId, litAtMin) for CONVENTIONS-legal iteration order.
  return [...forecasts, entry].sort(
    (a, b) => (a.contractId < b.contractId ? -1 : a.contractId > b.contractId ? 1 : a.litAtMin - b.litAtMin),
  );
}

/** Sum of currently-lit fuse contributions for one contract. */
export function forecastChurnBpsAt(
  forecasts: readonly GhostedForecast[],
  contractId: EntityId,
  atBusinessMin: SimMinute,
): bigint {
  let bps = 0n;
  for (const f of forecasts) {
    if (f.contractId !== contractId) continue;
    if (f.litAtMin <= atBusinessMin && atBusinessMin < f.expiresAtMin) bps += f.addBps;
  }
  return bps;
}

/** A save-the-account intervention (ticket answered, credit offered) clears
 *  that contract's fuses — both lit and still-ghosted. */
export function defuseForecasts(
  forecasts: readonly GhostedForecast[],
  contractId: EntityId,
): readonly GhostedForecast[] {
  return forecasts.filter((f) => f.contractId !== contractId);
}

/** Drop fully decayed fuses (state hygiene; never affects a roll outcome
 *  since expired entries contribute 0). */
export function pruneForecasts(
  forecasts: readonly GhostedForecast[],
  atBusinessMin: SimMinute,
): readonly GhostedForecast[] {
  return forecasts.filter((f) => f.expiresAtMin > atBusinessMin);
}

/** The FORECAST VIEW (HUD reads observed truth only — expose the shape, not
 *  a countdown): per-contract expected extra churn bps from lit fuses. */
export function ghostedForecastTable(
  forecasts: readonly GhostedForecast[],
  atBusinessMin: SimMinute,
): ReadonlyMap<EntityId, bigint> {
  const table = new Map<EntityId, bigint>();
  for (const f of forecasts) {
    if (f.litAtMin <= atBusinessMin && atBusinessMin < f.expiresAtMin) {
      table.set(f.contractId, (table.get(f.contractId) ?? 0n) + f.addBps);
    }
  }
  return table;
}
