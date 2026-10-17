/**
 * ADR-0015 5/5 NEGOTIATE ↔ the money-lane reader of the door's
 * `GameState.negotiate` book (economy leaf — imports ONLY ../types +
 * economy-local, exactly the elasticity.ts law; the pipeline never
 * imports this module and this module never imports the pipeline).
 *
 * Grounded §1.3 colo card "Amps and Aisles", hosting_game.md:1632:
 * "**Dominant verb: Negotiate.**" and :1637: "2. **Negotiate** — a
 * ticket/conversation system with a tenant, with tone options and a
 * relationship meter. **This is the level's combat.**" The card's
 * per-tenant relationship meter does NOT exist in v0 (the company
 * reputation ledger @57ea80e is the only meter shipped); the tone
 * retention bumps in `NegotiationConfig` are its honest company-proxy
 * stand-in — recorded as the gap it is.
 *
 * THE ZERO-NEW-ROLLS LAW (mirrors OD-24(a) part 2 @5781335): the
 * negotiation never casts a die. `negotiationRetentionFactorBps` tilts
 * the retention bps BEFORE the cliff's EXISTING single `range(10_000)`
 * draw, through the same `applyFactorBps` house math — when no term is
 * in force the factor rides through UNTOUCHED (identity tripwire), and
 * the shipped roll count is invariant: exactly one draw per cliff,
 * negotiated or not.
 *
 * BILLING-ORDER LAW (ADR-0014 #D4, grandfather-WINS): a concession
 * enters at the override-chain HEAD — `negotiatedBillingBase` moves the
 * effective base BEFORE the escalator compounds, and the grandfather
 * lock inside `billedMrc` still outranks everything when it is holding
 * (contract.ts chain order untouched). The concession does NOT re-enter
 * the elasticity deviation mirror on its own (double-count argument:
 * its retention effect is the bump); when a price override ALSO keys
 * the same priceKey the two books compose at the chain head, and the
 * churn mirror reads the composed base — a documented composition.
 */

import type {
  Contract,
  MoneyUnit,
  NegotiationTerm,
  SimMinute,
} from "../types.ts";
import { asMoney } from "../types.ts";
import type { EconomyConfig } from "./config.ts";
import { BPS_DEN } from "./money.ts";
import { applyFactorBps } from "./elasticity.ts";

/** The economy's tone vocabulary — the CLOSED set the door mirrors
 *  privately (pipeline import law). Declaration order is the card's
 *  escalation ladder: rapport → firm → legal ("each with a legal and
 *  reputational cost", §1.3 Enforce ladder). Drift-pinned against the
 *  door's mirror by pipeline/__tests__/intent-door-negotiate.test.ts,
 *  the `PRICE_TARGET_KINDS`/`PRICE_KEY_KINDS` precedent. */
export const NEGOTIATION_TONES: readonly NegotiationTerm["tone"][] = Object.freeze([
  "rapport",
  "firm",
  "legal",
]);

/** As-of resolution (the `activePriceOverride` twin): undefined book,
 *  undefined key (an un-keyed contract negotiates with nobody), no
 *  entry, or a FUTURE effective stamp (not-yet-law) all yield null.
 *  There is no expiry leg — last-write-wins replaces the standing term
 *  (the pricing book's own discipline). */
export function activeNegotiation(
  negotiations: ReadonlyMap<string, NegotiationTerm> | undefined,
  priceKey: string | undefined,
  atBusinessMin: SimMinute,
): NegotiationTerm | null {
  if (negotiations === undefined || priceKey === undefined) return null;
  const term = negotiations.get(priceKey);
  if (term === undefined) return null;
  if (term.effectiveAtBusinessMinute !== null && term.effectiveAtBusinessMinute > atBusinessMin) {
    return null;
  }
  return term;
}

/** Retention tilt for the cliff's EXISTING single draw.
 *
 *  `term === null` ⇒ the price factor rides through UNTOUCHED (identity
 *  tripwire — no multiplication, no rounding, byte-identity with the
 *  pre-negotiate world). Otherwise the tone bump plus a concession-
 *  presence bump lift the factor additively (bps over 1.0), applied
 *  through the house `applyFactorBps` (so a zero total bump hits the
 *  early-exit and is exactly the input). The result is CLAMPED to ≤ 1.0:
 *  a rapport buys leverage, never certainty — the same ceiling the
 *  elasticity mirror honors (cuts cap at 1.0, @5781335).
 *
 *  A booked 0n concession is money-present but money-absent: it behaves
 *  like null for the bump ("we will not move on price" is a stance, not
 *  a sweetener), while remaining DISTINCT from null in the digest. */
export function negotiationRetentionFactorBps(
  term: NegotiationTerm | null,
  priceRetentionFactorBps: bigint,
  cfg: EconomyConfig,
): bigint {
  if (term === null) return priceRetentionFactorBps;
  const concessionBump =
    term.concessionMicroUsd !== null && term.concessionMicroUsd > 0n
      ? cfg.negotiation.concessionPresenceBps
      : 0n;
  const bump = cfg.negotiation.retentionBumpBpsByTone[term.tone] + concessionBump;
  if (bump === 0n) return priceRetentionFactorBps;
  const lifted = applyFactorBps(priceRetentionFactorBps, BPS_DEN + bump);
  return lifted > BPS_DEN ? BPS_DEN : lifted;
}

/** Billing-base move for the invoice calendar. With no in-force
 *  concession the effective base rides through UNTOUCHED (identity —
 *  including `null`, the "no override, bill the authored MRC" shape).
 *  A positive concession discounts the base by the sign law
 *  (types.ts `NegotiateTermsArgs.concessionMicroUsd`); the floor is 0n
 *  — a concession deeper than the rent gives the cycle away, it never
 *  bills the tenant money (a price RIDE rides adjust-price/sell-offer). */
export function negotiatedBillingBase(
  contract: Contract,
  term: NegotiationTerm | null,
  effectiveBaseMicroUsd: MoneyUnit | null,
): MoneyUnit | null {
  const concession = term?.concessionMicroUsd ?? null;
  if (concession === null || concession <= 0n) return effectiveBaseMicroUsd;
  const base = effectiveBaseMicroUsd ?? contract.mrcMicroUsd;
  const moved = base - concession;
  return asMoney(moved >= 0n ? moved : 0n);
}
