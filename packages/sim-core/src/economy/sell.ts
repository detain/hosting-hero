/**
 * Sell acceptance dice (mechanic B of the negotiation-depth program, ADR-0016).
 *
 * The `sell-offer` door verb books the player's price list on
 * `GameState.sell` (part 1 @a760771 shipped the book with ZERO sim-side
 * readers — the part-1 posture). This leaf is the reader: each business
 * minute the money fold asks "would the market take this offer?" and stamps
 * a PERSISTENT verdict per key. Verdicts are market opinion, not money —
 * nothing here touches cash, invoices, or the ledger. A host that wants to
 * sign an accepted offer into a contract registers it out-of-band via the
 * existing `priceKey` seam (@5781335); the fold only adjudicates.
 *
 * Shape mirrors `economy/elasticity.ts` deliberately: same deviation math
 * (`priceDeviationBps`), same inclusive signed dead-band, same
 * coefficient-times-out-of-band leverage, same clamp discipline. The
 * retention-floor lesson (ADR-0014 #D4) is law here in mirror: acceptance
 * is clamped strictly BELOW one and strictly ABOVE zero — a sale is never
 * certain and a bargain is never hopeless. That is now a two-domain law;
 * pinned by test.
 *
 * Anchor resolution per offer key (first authority wins):
 *   1. `marketRates.get(key)` — the host's catalog authority (explicit).
 *   2. MRC of the lowest-EntityId contract whose `priceKey == key` — the
 *      installed base IS a market rate when no catalog was offered.
 *   3. Neither (or the anchor is zero — free tier has no ratio) ⇒
 *      UNADJUDICATED. Honest gap: a ratio without a denominator is a lie,
 *      the elasticity free-tier twin. No roll, no notice, no verdict.
 *
 * Determinism: one roll per adjudication on a NEW stream domain
 * ("economy/sell") so no existing stream's slot sequence moves; verdicts
 * persist in EconomyState so replays never re-roll. Amending an offer
 * (price, term, or re-booking — the door bumps shippedAtTick) changes its
 * fingerprint and re-rolls at the current minute's slot.
 *
 * Import law (economy leaf): ../types + ../kernel/* + economy-local only.
 */

import type {
  MoneyUnit,
  RunSeed,
  SellOffer,
  SimMinute,
  SimTick,
} from "../types.ts";
import { asEntityId } from "../types.ts";
import { streamFor } from "../kernel/rng.ts";
import type { SellConfig } from "./config.ts";
import { DEFAULT_SELL_CONFIG } from "./config.ts";
import { priceDeviationBps } from "./elasticity.ts";
import { BPS_DEN } from "./money.ts";

/** A market verdict on one sell-offer, stamped when adjudicated. */
export interface SellVerdict {
  readonly accepted: boolean;
  /** Probability the market took the offer, basis points (clamped < BPS_DEN). */
  readonly acceptanceBps: bigint;
  readonly anchorMicroUsd: MoneyUnit;
  readonly offerPriceMicroUsd: MoneyUnit;
  readonly termMonths: number;
  /** Door stamp of the offer this verdict answers (fingerprint leg). */
  readonly shippedAtTick: SimTick;
  readonly adjudicatedAtBusinessMin: SimMinute;
}

/** Everything the adjudication fold needs for one business minute. */
export interface SellAdjudicationInput {
  /** Verdicts carried from prior state (null/undefined = none yet). */
  readonly prior?: ReadonlyMap<string, SellVerdict> | null | undefined;
  /** The live sell-offer book (absent or empty ⇒ idle, verdicts ride). */
  readonly offers?: ReadonlyMap<string, SellOffer> | undefined;
  /** Host catalog authority: priceKey -> market rate in micro-USD. */
  readonly marketRates?: ReadonlyMap<string, MoneyUnit> | undefined;
  /** Fallback authority: priceKey -> MRC of the lowest-EntityId keyed contract. */
  readonly contractAnchor?: ReadonlyMap<string, MoneyUnit> | undefined;
  readonly now: SimMinute;
  readonly runSeed: RunSeed;
  readonly cfg: SellConfig;
}

/** Fresh verdicts keyed by offer key, plus the merged carry-forward map. */
export interface SellAdjudicationOutcome {
  /** Merged (prior + fresh) verdict map, code-unit sorted. Null when idle. */
  readonly verdicts: ReadonlyMap<string, SellVerdict> | null;
  /** Only the verdicts stamped THIS call, in key order (notice fuel). */
  readonly fresh: ReadonlyArray<{ readonly key: string; readonly verdict: SellVerdict }>;
}

/** Signed half-away division — the elasticity private twin (leaf law: no
 *  widening elasticity's surface just to borrow one arithmetic helper). */
function roundDivSigned(numerator: bigint, den: bigint): bigint {
  const sign = numerator < 0n ? -1n : 1n;
  const magnitude = (numerator < 0n ? -numerator : numerator) * 2n + den;
  return sign * (magnitude / (2n * den));
}

/** Deviation outside the inclusive dead band, signed (0 inside) — the
 *  elasticity private `outOfBandBps` mirrored verbatim. */
function outOfBandBps(deviationBps: bigint, deadBandBps: bigint): bigint {
  if (deviationBps > deadBandBps) return deviationBps - deadBandBps;
  if (deviationBps < -deadBandBps) return deviationBps + deadBandBps;
  return 0n;
}

/** Leverage: coefficient × out-of-band deviation, in bps — elasticity's
 *  private `adjustmentBps` with the sell config's own coefficient. */
function adjustmentBps(coefficientBps: bigint, deviationBps: bigint, sell: SellConfig): bigint {
  return roundDivSigned(coefficientBps * outOfBandBps(deviationBps, sell.acceptDeadBandBps), BPS_DEN);
}

/**
 * Acceptance probability for one offer against one anchor, basis points.
 * Below-market offers sell; above-market ones stall — never certainly
 * either way (ceiling strictly under BPS_DEN, floor strictly above zero).
 */
export function sellAcceptanceBps(
  offerPriceMicroUsd: MoneyUnit,
  anchorMicroUsd: MoneyUnit,
  sell: SellConfig = DEFAULT_SELL_CONFIG,
): bigint {
  if (anchorMicroUsd <= 0n) {
    throw new RangeError(
      `economy/sell: acceptance needs anchor > 0, got ${anchorMicroUsd} — resolve a missing anchor as unadjudicated, never as a rate`,
    );
  }
  const deviation = priceDeviationBps(offerPriceMicroUsd, anchorMicroUsd);
  const raw = sell.acceptBaseBps - adjustmentBps(sell.acceptCoefficientBps, deviation, sell);
  if (raw < sell.acceptFloorBps) return sell.acceptFloorBps;
  if (raw > sell.acceptCeilingBps) return sell.acceptCeilingBps;
  return raw;
}

/** Fingerprint legs: any of these changing means the player re-offered. */
function sameFingerprint(verdict: SellVerdict, offer: SellOffer): boolean {
  return (
    verdict.offerPriceMicroUsd === offer.offerPriceMicroUsd &&
    verdict.termMonths === offer.termMonths &&
    verdict.shippedAtTick === offer.shippedAtTick
  );
}

/**
 * One pass of the sell dice. Pure: same input ⇒ byte-identical outcome.
 * Offers effective in the future are not yet law (activePriceOverride
 * twin); verdicts for vanished keys carry forward untouched — the verdict
 * log is history, not a live view.
 */
export function adjudicateSellOffers(input: SellAdjudicationInput): SellAdjudicationOutcome {
  const prior = input.prior ?? null;
  const offers = input.offers;
  if (offers === undefined || offers.size === 0) {
    // Idle book: verdicts ride the prior state untouched (identity law).
    return { verdicts: prior, fresh: [] };
  }
  const fresh: Array<{ readonly key: string; readonly verdict: SellVerdict }> = [];
  for (const key of [...offers.keys()].sort()) {
    const offer = offers.get(key);
    if (offer === undefined) continue; // unreachable via keys(); interior is trusted
    if (offer.effectiveAtBusinessMinute !== null && offer.effectiveAtBusinessMinute > input.now) {
      continue; // future stamp is not yet law
    }
    const stale = prior?.get(key);
    if (stale !== undefined && sameFingerprint(stale, offer)) continue; // verdict persists
    const catalog = input.marketRates?.get(key);
    if (catalog !== undefined && (typeof catalog !== "bigint" || catalog < 0n)) {
      throw new RangeError(
        `economy/sell: market rate for '${key}' must be a non-negative bigint of micro-USD, got ${String(catalog)}`,
      );
    }
    const anchor = catalog !== undefined ? catalog : input.contractAnchor?.get(key);
    if (anchor === undefined || anchor <= 0n) continue; // unadjudicated: no denominator, no dice
    const acceptanceBps = sellAcceptanceBps(offer.offerPriceMicroUsd, anchor, input.cfg);
    const roll = streamFor(input.runSeed, "economy/sell", input.now, asEntityId(key)).range(Number(BPS_DEN));
    fresh.push({
      key,
      verdict: Object.freeze({
        accepted: BigInt(roll) < acceptanceBps,
        acceptanceBps,
        anchorMicroUsd: anchor,
        offerPriceMicroUsd: offer.offerPriceMicroUsd,
        termMonths: offer.termMonths,
        shippedAtTick: offer.shippedAtTick,
        adjudicatedAtBusinessMin: input.now,
      }),
    });
  }
  if (fresh.length === 0) {
    return { verdicts: prior, fresh: [] };
  }
  const merged = new Map<string, SellVerdict>(prior ?? []);
  for (const entry of fresh) merged.set(entry.key, entry.verdict);
  const sorted = new Map<string, SellVerdict>();
  for (const key of [...merged.keys()].sort()) {
    const value = merged.get(key);
    if (value !== undefined) sorted.set(key, value);
  }
  return { verdicts: sorted, fresh };
}

/**
 * Build the fallback anchor map from registered contracts. Caller iterates
 * EntityId-SORTED contracts (tick.ts's `ids`), so first key wins = the
 * lowest-EntityId contract's MRC per priceKey.
 */
export function sellAnchorFromContracts(
  priceKeyByContract: Iterable<{ readonly priceKey: string; readonly mrcMicroUsd: MoneyUnit }>,
): Map<string, MoneyUnit> {
  const anchor = new Map<string, MoneyUnit>();
  for (const row of priceKeyByContract) {
    if (!anchor.has(row.priceKey)) anchor.set(row.priceKey, row.mrcMicroUsd);
  }
  return anchor;
}
