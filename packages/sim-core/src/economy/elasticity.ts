/**
 * Price-override CONSUMPTION and elasticity (OD-24(a) owner ruling 2026-10-09,
 * part 2 — the pricing surface the `adjust-price` door verb actually has an
 * economic effect through).
 *
 * The door (part 1, @0032a21) freezes `PriceOverrideRecord`s into
 * `GameState.pricing.overrides`, keyed `<targetKind>:<targetId>`. The host
 * forwards that book per fold as `EconomyTickIn.priceOverrides`, and each
 * signed contract carries an optional `priceKey` (added here at signing time
 * — Contracts have no planId, so the HOST classifies; economy only resolves).
 *
 * TWO CONSEQUENCES of an active override, both default-OFF:
 *  1. BILLING — the override REPLACES the authored MRC as the base of the
 *     billedMrc composition chain (base → escalator → grandfather → MFN);
 *     the grandfather lock still wins over the player's price line — a
 *     written concession is a permanent line (§6.12) the dial cannot cross.
 *  2. ELASTICITY — the price the customer PAYS relative to the price the
 *     plan was AUTHORED at moves three odds: monthly churn UP on a hike,
 *     renewal-cliff retention DOWN, dunning recovery DOWN (angry wallets).
 *     Reference is always `Contract.mrcMicroUsd`; contractual concessions
 *     (escalators/grandfather/MFN) are contract-law mechanics with their own
 *     economics and never drive elasticity — the model reacts to the PLAYER's
 *     decision, which is what the dial is for.
 *
 * NO-NEW-ROLLS LAW (byte-identity, the discipline of 4856a42's contention
 * no-roll precedent): elasticity only RE-SCALES the bps inputs fed to the
 * single seeded roll each consumer ALREADY draws (churn / renewal / dunning
 * stage entry). `EconomyTickIn.priceOverrides` unset ⇒ every consumer takes
 * its pre-existing code path verbatim; an ACTIVE override inside the dead
 * band ⇒ factors are exactly 1.0 and every consumer's early-exit keeps the
 * pre-existing arithmetic byte-identical. Nothing here rolls the RNG.
 *
 * All math is exact bigint bps (round-half-away, same discipline as
 * kernel/fixed.ts / money.ts). Constants live in `config.ts → pricing`,
 * every one PROVISIONAL (ratify-on-playtest).
 */

import {
  type Contract,
  type EntityId,
  type MoneyUnit,
  type PriceOverrideRecord,
  type SimMinute,
} from "../types.ts";
import { BPS_DEN } from "./money.ts";
import type { EconomyConfig, PricingConfig } from "./config.ts";
import type { ContractEconomy } from "./contract.ts";

/**
 * Closed kind vocabulary of the composite override key. TYPE law lives in
 * types.ts (`PriceTargetKind`); the VALUE array lives in
 * pipeline/intent-door.ts (`PRICE_TARGET_KINDS`, private). The economy module
 * imports ONLY `../types.ts` + `../kernel/*` + economy-local files (the
 * de-facto per-module law every lane honors, same as replay/ and death.ts's
 * leaf law), so reaching into pipeline/ is off-limits and the set is
 * re-declared here exactly like loader/packs.ts re-declares the pack walls
 * citing validate.mjs as law source. Drift is caught by
 * __tests__/elasticity.test.ts reading both literals side by side.
 */
export const PRICE_KEY_KINDS: readonly string[] = Object.freeze(["plan", "contract-class", "sku"]);

/** Fail-loud boundary parse (Law 2 + Law 4): a priceKey must be exactly
 *  `<kind>:<id>` with a closed-vocabulary kind and a non-empty id — the
 *  same grammar the door's `priceOverrideKey` mints (part 1). A typo'd key
 *  could never match a book entry, so it is REJECTED at signing, not
 *  silently ignored for the contract's whole life. */
export function assertValidPriceKey(key: string, context: string): void {
  const colon = key.indexOf(":");
  if (colon <= 0 || colon === key.length - 1) {
    throw new RangeError(
      `economy/elasticity: ${context} priceKey '${key}' must be '<kind>:<id>' with both segments non-empty`,
    );
  }
  const kind = key.slice(0, colon);
  if (!PRICE_KEY_KINDS.includes(kind)) {
    throw new RangeError(
      `economy/elasticity: ${context} priceKey '${key}' kind '${kind}' outside the closed set {${PRICE_KEY_KINDS.join(", ")}}`,
    );
  }
}

/** As-of resolution of the book (the effectiveAtBusinessMinute honor): a
 *  record with a FUTURE stamp is not yet law; `null` means "effective when
 *  the door executed it" — from the moment the host forwards it. Absent
 *  book / absent key / no entry ⇒ null (every consumer's neutral path). */
export function activePriceOverride(
  overrides: ReadonlyMap<string, PriceOverrideRecord> | undefined,
  priceKey: string | undefined,
  atBusinessMin: SimMinute,
): PriceOverrideRecord | null {
  if (overrides === undefined || priceKey === undefined) return null;
  const record = overrides.get(priceKey);
  if (record === undefined) return null;
  if (record.effectiveAtBusinessMinute !== null && atBusinessMin < record.effectiveAtBusinessMinute) {
    return null;
  }
  return record;
}

/** Signed round-half-away division (den > 0). money.ts scaleMoney has the
 *  same shape scoped to money×ratio; this is the plain-bps twin. */
function roundDivSigned(numerator: bigint, den: bigint): bigint {
  const sign = numerator < 0n ? -1n : 1n;
  const magnitude = (numerator < 0n ? -numerator : numerator) * 2n + den;
  return sign * (magnitude / (2n * den));
}

/** Relative price vs the AUTHORED reference, in signed bps:
 *  deviation = (effective − reference) / reference × 10,000, half-away.
 *  Fails loud on reference ≤ 0 — free-tier contracts have no ratio to
 *  speak of; `priceElasticityFor` handles that case before calling. */
export function priceDeviationBps(effective: MoneyUnit, reference: MoneyUnit): bigint {
  if (reference <= 0n) {
    throw new RangeError(`economy/elasticity: priceDeviationBps needs reference > 0, got ${reference}`);
  }
  return roundDivSigned((effective - reference) * BPS_DEN, reference);
}

/** Deviation outside the inclusive dead band, signed (0 inside). */
function outOfBandBps(deviationBps: bigint, deadBandBps: bigint): bigint {
  if (deviationBps > deadBandBps) return deviationBps - deadBandBps;
  if (deviationBps < -deadBandBps) return deviationBps + deadBandBps;
  return 0n;
}

/** Leverage: coefficient × out-of-band deviation, expressed in factor bps. */
function adjustmentBps(coefficientBps: bigint, deviationBps: bigint, pricing: PricingConfig): bigint {
  return roundDivSigned(coefficientBps * outOfBandBps(deviationBps, pricing.deadBandBps), BPS_DEN);
}

function clamp(value: bigint, min: bigint, max: bigint): bigint {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/** Churn-pressure factor (rises with price): hike ⇒ > 1.0, cut ⇒ < 1.0,
 *  clamped to [factorMinBps, factorMaxBps]. Exactly 1.0 inside the band. */
export function churnPressureFactorBps(deviationBps: bigint, pricing: PricingConfig): bigint {
  return clamp(BPS_DEN + adjustmentBps(pricing.churnCoefficientBps, deviationBps, pricing), pricing.factorMinBps, pricing.factorMaxBps);
}

/** Renewal-retention mirror (falls with price): hike ⇒ < 1.0, cut caps at
 *  exactly 1.0 — no discount buys certainty. Floor retentionFactorMinBps. */
export function retentionFactorBps(deviationBps: bigint, pricing: PricingConfig): bigint {
  return clamp(BPS_DEN - adjustmentBps(pricing.retentionCoefficientBps, deviationBps, pricing), pricing.retentionFactorMinBps, BPS_DEN);
}

/** Dunning-recovery mirror (falls with price), same cap/floor shape as
 *  retention but with its own coefficient and the shared adverse floor. */
export function paymentRecoveryFactorBps(deviationBps: bigint, pricing: PricingConfig): bigint {
  return clamp(BPS_DEN - adjustmentBps(pricing.dunningCoefficientBps, deviationBps, pricing), pricing.factorMinBps, BPS_DEN);
}

/** value × factor / 10,000, half-away. The EXACT-IDENTITY early exit at
 *  10,000 is the no-roll-discipline tripwire: a neutral factor must not even
 *  re-round the input. */
export function applyFactorBps(valueBps: bigint, factorBps: bigint): bigint {
  if (factorBps === BPS_DEN) return valueBps;
  return roundDivSigned(valueBps * factorBps, BPS_DEN);
}

/** The three multipliers + the billing base one contract feels THIS tick,
 *  or null when nothing is active (the neutral fast path the whole design
 *  hangs on). Reference ≤ 0 (free tier) has no ratio — billing still takes
 *  the player's price, elasticity stays neutral. */
export interface PriceElasticityFactors {
  readonly effectiveBaseMicroUsd: MoneyUnit;
  readonly churnBpsFactor: bigint;
  readonly retentionBpsFactor: bigint;
  readonly recoveryBpsFactor: bigint;
}

export function priceElasticityFor(
  contract: Contract,
  econ: ContractEconomy,
  overrides: ReadonlyMap<string, PriceOverrideRecord> | undefined,
  atBusinessMin: SimMinute,
  cfg: EconomyConfig,
): PriceElasticityFactors | null {
  const override = activePriceOverride(overrides, econ.priceKey, atBusinessMin);
  if (override === null) return null;
  const effective = override.newPriceMicroUsd;
  if (contract.mrcMicroUsd <= 0n) {
    return {
      effectiveBaseMicroUsd: effective,
      churnBpsFactor: BPS_DEN,
      retentionBpsFactor: BPS_DEN,
      recoveryBpsFactor: BPS_DEN,
    };
  }
  const deviation = priceDeviationBps(effective, contract.mrcMicroUsd);
  return {
    effectiveBaseMicroUsd: effective,
    churnBpsFactor: churnPressureFactorBps(deviation, cfg.pricing),
    retentionBpsFactor: retentionFactorBps(deviation, cfg.pricing),
    recoveryBpsFactor: paymentRecoveryFactorBps(deviation, cfg.pricing),
  };
}

/** Key the override for a target id under a kind (host signing convenience,
 *  mirroring the door's `priceOverrideKey` without importing it). Ids may
 *  contain colons — the kind segment is colon-free, split-on-first is exact. */
export function priceKeyFor(kind: string, id: EntityId): string {
  const key = `${kind}:${id}`;
  assertValidPriceKey(key, "priceKeyFor");
  return key;
}
