/**
 * MONEY-AT-THE-END leg 1/3 (wave-28, owner-ratified program) — the PURE
 * READ-PROJECTION valuation leaf: WARCT per-tenant arithmetic + the company
 * exit-CASH-SLICE composition (headline offer → what actually reaches the
 * bank). Zero state, zero dice, zero fold change: nothing in this file is
 * imported by `tick.ts`, `EconomyState` carries NO valuation field, and the
 * money-lane fold byte-stands UNAIDED (pinned by the negotiate-era-identities
 * twin in __tests__/valuation.test.ts). The runner/campaign consumes this leg
 * AT CLOSE — that wiring is a LATER lane of the same program, not this file.
 *
 * WHY THE LEG EXISTS (the deferred owner ask it discharges): the colo card
 * names it — "**tenant credit quality affects your building's valuation**"
 * (hosting_game.md:1674-1675) — and relationship.ts:19-22 recorded exactly
 * this leg as "the WARCT readout, §6.9 … stays a deferred owner ask".
 * ADR-0016 #8 kept the ask open; wave-28 #3 ("money at the end") takes it.
 * endings.ts:52-54 refused "Due Diligence / valuation arithmetic … NOT v0"
 * from the CAMPAIGN side — correct then: the arithmetic had no home. Now it
 * has one, and the campaign/runner lanes may consume it without owning it.
 *
 * THE GROUNDING TABLE (every factor quotes the doc verbatim; the NUMBERS are
 * PROVISIONAL taste — register posture ADR-0016 #10, ratify-on-playtest):
 *  - WARCT + contracted revenue % (hg:24960-24962): "**Weighted Average
 *    Remaining Contract Term** and **contracted revenue %** (the fraction of
 *    MRR with >12 months left)." — both read-only legs below. The §6.9
 *    modifier row (hg:24396-24397) calls WARCT "**the single biggest multiple
 *    driver in colo and managed services**".
 *  - MRC is the annuity (hg:24906, §6.12 three-component bill): "**MRC**
 *    (monthly recurring) is the annuity." The per-tenant value below is a
 *    MULTIPLE OF MONTHLY REVENUE (the doc's own unit column), and the term
 *    rides the slope — see the DISCLOSED COMPOSITION NOTE on
 *    `tenantWholeLeaseValueMicroUsd` for why recon's literal "multiple × TCV"
 *    was adapted (double-counts months against the doc's 10-18x monthly band).
 *  - Per-line multiples (hg:24381-24383): "Shared / VPS book | EBITDA
 *    multiple, or monthly-revenue multiple | 3-6x EBITDA / 10-18x monthly
 *    revenue" · "Managed / cloud services | EBITDA or ARR multiple | 6-12x
 *    EBITDA" · "Colocation | **NOI and cap rate, like real estate** | 6-9%
 *    cap rate (~11-16x NOI)". v0 keys the band by the CLOSED priceKey kind
 *    {plan|contract-class|sku}; the colo NOI band floor-maps onto the
 *    revenue band (the honest-partial note lives on the table itself — NOI
 *    needs expense truth the engine does not have).
 *  - The headline itself (§6.7, hg:23739-23740): "A multiple of ARR (or NOI,
 *    or backlog — see §6.9's per-line valuation bases) modified by your
 *    diligence report." This leg composes the modification; authoring the
 *    headline offer is the acquisition-offer lane, not this file.
 *  - Diligence posture (§1.12, hg:5620-5621): "each finding either **knocks
 *    a turn off the multiple**, **moves money into escrow**, or **converts
 *    purchase price into an earnout.** The level is won on final **proceeds**,
 *    not headline price." — hence every adjustment is a DISCOUNT: the slice is
 *    NEVER above the headline, exactly as trust is never above 1.0 upward
 *    (the negotiate.ts goodwill-ceiling posture, mirrored).
 *  - Concentration (hg:24439-24441): "If one customer or one business line
 *    exceeds **40% of revenue**, valuation takes a hit" — STRICTLY above 40
 *    is the law ("exceeds"); the magnitude borrows the §6.9 modifier row's
 *    only number (hg:24397-24398): "**revenue concentration** (>25% in one
 *    customer typically costs **20-30% of the multiple**)".
 *  - Term slope (hg:1672-1673): "**The escalator** - 3%/yr baked into the
 *    lease. A five-year deal is worth ~15% more than it looks" — 300 bps per
 *    WHOLE year remaining, capped at the band top (a band is a range, and
 *    WARCT walks it, it does not escape it).
 *  - Exit kinds (§1.6, hg:4501-4514): seven bullets, "each with a different
 *    meta-currency profile and epilogue" — IPO "most currency", "Strategic
 *    acquisition … highest multiple", "PE bolt-on … lower multiple … high
 *    churn", "Asset sale … **you keep the liabilities**" (the liabilities-
 *    shedding asymmetry is a NAMED FUTURE leg — v0 prices only the cash
 *    profile), "Management buyout … lowest cash", and "Wind-down - sell the
 *    book, sell the hardware, pay the creditors, keep what's left" — no
 *    headline offer EXISTS in a wind-down, so its factor is 0 (reserved:
 *    the CAMPAIGN parse wall, a later lane, refuses wind-down before this
 *    function is ever reached; the division of labor is on the table itself).
 *
 * THE RESERVED-VS-SPOT ROW (hg:24894-24896): "**Reserved 1-3 year contracts
 * (30-50% below spot, often prepaid)** are how the hardware is financed.
 * **On-demand** is the middle. **Spot/preemptible** monetizes the residual
 * and is reclaimable at any moment." The doc gives NO revenue multiple for
 * on-demand/spot lines, so v0 prices `sku` on the shared/VPS band and the
 * spot-EVICTION discount rides as a named-future leg (the reclaim-note
 * discipline of sell.ts / ADR-0016: record the gap, do not forge the number).
 *
 * THE ZERO-ROLLS LAW (relationship.ts mirrored verbatim): this module casts
 * NO dice — the kernel RNG stream token never appears in this file's text,
 * and the zero-rolls roster in __tests__ pins it. Everything here is a READ
 * of facts other legs already booked.
 *
 * REPRESENTATION: exact bigint bps math throughout (round-half-away at each
 * composition, the money.ts discipline); business-month grammar via the
 * shared `BUSINESS_MONTH_MINUTES` (43,200 business minutes = 30-day month,
 * OD-2 ratified). Money in micro-USD. No floats, no drift, replay-stable.
 */

import { asMoney, type MoneyUnit, type PriceTargetKind, type SimMinute } from "../types.ts";
import { BPS_DEN, bpsOf } from "./money.ts";
import { floorDiv } from "./intMath.ts";
import { BUSINESS_MONTH_MINUTES } from "./errorBudget.ts";
import { DEFAULT_VALUATION_CONFIG, type ValuationConfig } from "./config.ts";

/* ───────────────────────── vocabulary (module-owned) ───────────────────── */

/** The seven §1.6 exit profiles, IN DOC ORDER (hg:4503-4514). The save-side
 *  bridge (`save/node.ts` `ExitKind = string`) stays OPAQUE — mapping a
 *  company node's `succession.exitKind` onto this closed vocabulary is the
 *  campaign parse wall's job (a later lane; endings.ts:46-48 records the
 *  same wall from its side). `wind-down` participates in the TYPE so the
 *  factor table is exhaustive over the doc, but its factor is 0 and the
 *  campaign wall is expected to refuse it BEFORE any call reaches here. */
export const VALUATION_EXIT_KINDS = Object.freeze([
  "ipo",
  "strategic-acquisition",
  "pe-platform",
  "pe-bolt-on",
  "asset-sale",
  "management-buyout",
  "wind-down",
] as const);
export type ValuationExitKind = (typeof VALUATION_EXIT_KINDS)[number];

/** One revenue row for the book-level reads: the tenant's own MRC annuity
 *  and its WHOLE remaining months (the `contractRemainingTerm` output).
 *  Callers map contracts (or `ContractEconomy` mirrors) into this shape —
 *  the leaf deliberately reads no state type, only money and months. */
export interface ValuationRevenueRow {
  readonly mrcMicroUsd: MoneyUnit;
  readonly remainingMonths: number;
}

/** A per-line valuation band, in bps of 1.0x of the tenant's OWN monthly
 *  revenue (10x monthly revenue = 100_000 bps). `floorBps` prices a
 *  month-to-month reading; `topBps` is where the term slope STOPS. */
export interface MultipleBandBps {
  readonly floorBps: bigint;
  readonly topBps: bigint;
}

/** The shipped band table, keyed by the CLOSED priceKey kind (types.ts
 *  `PriceTargetKind`). Single source: the alias of `DEFAULT_VALUATION_CONFIG.
 *  bandsBps` (config.ts owns the numbers, this module owns the MEANING —
 *  the toBe-identity pin in __tests__ keeps the claim honest). The drift
 *  pins mirror the sell lane: kind list === elasticity PRICE_KEY_KINDS ===
 *  the door's private PRICE_TARGET_KINDS (source-read, import law honored).
 *
 *  THE COLO HONEST-PARTIAL (hg:24383): "Colocation | **NOI and cap rate,
 *  like real estate** | 6-9% cap rate (~11-16x NOI)". The engine has NO
 *  expense truth — no NOI, no EBITDA — so `contract-class` (the B2B
 *  contracted book) rides the REVENUE basis with the shared-band FLOOR and
 *  the colo band's TOP: the shape of "lease term remaining, tenant credit
 *  quality" pricing, stripped of the part the books cannot support. The
 *  managed row's "6-12x EBITDA" is the same refusal (hg:24382): pricing on
 *  a basis the engine cannot compute would be forged truth. */
export const VALUATION_MULTIPLE_BANDS_BPS: Readonly<Record<PriceTargetKind, MultipleBandBps>> =
  DEFAULT_VALUATION_CONFIG.bandsBps;

/* ─────────────────────────── the guards (Law 4) ────────────────────────── */

function guardMonths(months: number, context: string): void {
  if (!Number.isSafeInteger(months) || months < 0) {
    throw new RangeError(
      "economy/valuation: " + context + " remainingMonths must be a safe integer >= 0, got " + String(months),
    );
  }
}

function guardMrc(mrc: bigint, context: string): void {
  if (mrc < 0n) {
    throw new RangeError(
      "economy/valuation: " + context + " mrcMicroUsd must be >= 0, got " + String(mrc) + " (rows come from booked contracts — a negative annuity is authoring poison)",
    );
  }
}

function guardSignedBps(value: bigint, context: string): void {
  if (value < 0n) {
    throw new RangeError(
      "economy/valuation: " + context + " must be a non-negative bps reading, got " + String(value),
    );
  }
}

/** round-half-AWAY(n/d), d > 0, signed numerator — the house rounding
 *  (kernel/fixed.ts family). Non-negative callers are the common case. */
function divHalfAway(numerator: bigint, denominator: bigint): bigint {
  const sign = numerator < 0n ? -1n : 1n;
  const magnitude = numerator < 0n ? -numerator : numerator;
  return sign * ((2n * magnitude + denominator) / (2n * denominator));
}

/* ───────────────────── the term reads (WARCT family) ────────────────────── */

/** Whole months still to run on a contract-shaped row (accepts the raw
 *  `Contract` or the `ContractEconomy` mirror — both carry `termEndMin` on
 *  the BUSINESS clock). FLOOR of the whole months: a term ending 43,199
 *  business minutes out has ZERO whole months left; one ending exactly a
 *  month out has one. Past terms and lapse-boundary equals floor to 0 —
 *  remaining term is never negative (the doc's ribbons run out, they do not
 *  go behind you). Month grammar: `BUSINESS_MONTH_MINUTES` (43,200 = the
 *  ratified 30-day business month, OD-2). */
export function contractRemainingTerm(
  contract: { readonly termEndMin: SimMinute },
  atBusinessMinute: SimMinute,
): number {
  const remaining = contract.termEndMin - atBusinessMinute;
  if (!Number.isSafeInteger(remaining)) {
    throw new RangeError(
      "economy/valuation: contractRemainingTerm needs safe-integer business minutes, got termEndMin " +
        String(contract.termEndMin) + " at " + String(atBusinessMinute),
    );
  }
  if (remaining <= 0) return 0;
  return floorDiv(remaining, BUSINESS_MONTH_MINUTES);
}

/** The doc's first number (hg:24961): "**Weighted Average Remaining Contract
 *  Term** …" — MRC-weighted average of whole remaining months, in MONTHS.
 *  UNIT HONESTY (disclosed): the recon brief named this `warctBps`; WARCT is
 *  measured in months, not basis points, so the shipped name says MONTHS
 *  (Law 5). The weighted mean FLOORS (an annuity does not divide: 1.5
 *  weighted months reads as 1 whole month). Empty book or a book of pure
 *  zero-MRC rows returns EXACTLY 0n — the ABSENCE reading, not an average
 *  of nothing (pinned; callers who must distinguish "no book" from "one-month
 *  book" check `rows.length` / the weight sum themselves). */
export function warctMonths(rows: readonly ValuationRevenueRow[]): bigint {
  let weight = 0n;
  let termMass = 0n;
  for (const row of rows) {
    guardMrc(row.mrcMicroUsd, "warctMonths");
    guardMonths(row.remainingMonths, "warctMonths");
    weight += row.mrcMicroUsd;
    termMass += row.mrcMicroUsd * BigInt(row.remainingMonths);
  }
  if (weight === 0n) return 0n;
  return termMass / weight;
}

/** The doc's second number (hg:24961-24958): "**contracted revenue %** (the
 *  fraction of MRR with >12 months left)" — STRICTLY more than twelve whole
 *  months ("with >12 months left"), Σ qualifying MRC / Σ MRC x 10_000,
 *  floor. Empty / all-zero-MRC book ⇒ 0n (same absence law as
 *  `warctMonths`; there is no fraction of nothing). The 12-month line is DOC
 *  LAW, not taste, so it is a named constant, not a config dial. */
export const CONTRACTED_REVENUE_MIN_MONTHS = 12;

export function contractedRevenueShareBps(rows: readonly ValuationRevenueRow[]): bigint {
  let weight = 0n;
  let long = 0n;
  for (const row of rows) {
    guardMrc(row.mrcMicroUsd, "contractedRevenueShareBps");
    guardMonths(row.remainingMonths, "contractedRevenueShareBps");
    weight += row.mrcMicroUsd;
    if (row.remainingMonths > CONTRACTED_REVENUE_MIN_MONTHS) long += row.mrcMicroUsd;
  }
  if (weight === 0n) return 0n;
  return (long * BPS_DEN) / weight;
}

/* ─────────────── the per-tenant lease value (band x term x trust) ───────── */

export interface TenantLeaseValueInput {
  /** The tenant's monthly annuity (§6.12: "MRC … is the annuity"). */
  readonly mrcMicroUsd: MoneyUnit;
  /** WHOLE months left (`contractRemainingTerm` output). */
  readonly remainingMonths: number;
  /** Closed priceKey kind selecting the valuation band. */
  readonly priceKeyKind: PriceTargetKind;
  /** The relationship ledger's SIGNED trust for this tenant
   *  (`relationshipTrustBps` output), or null for "no file" (table-first —
   *  a tenant never talked to is priced NEUTRAL, never penalized). */
  readonly trustBps: bigint | null;
}

/** What one tenant's remaining lease is worth to a buyer.
 *
 *  value = bandFloorMultiple x MRC, walked up the band by the term slope
 *  (+3%/yr, hg:1673 "A five-year deal is worth ~15% more than it looks",
 *  capped at the band TOP — the slope moves WITHIN the doc's range, it never
 *  escapes it), then multiplied by the trust adjustment
 *  `1 + trustBps x trustLeverageBps / 10_000` CLAMPED TO <= 1.0 UPWARD and
 *  read honestly DOWNWARD (trust is SIGNED: burned tenants sink the price —
 *  the negotiate.ts goodwill ceiling mirrored; hg:1676-1677 prices credit
 *  quality into the building, and it prices BAD quality too).
 *
 *  DISCLOSED COMPOSITION NOTE (disk wins over recon): recon spelled this leg
 *  "band multiple x MRC-annuity (TCV)"; the doc's band UNITS (hg:24381
 *  "10-18x monthly revenue") are multiples of MONTHLY REVENUE, so multiplying
 *  them by the full remaining TCV would price a 12-month contract at 120-216x
 *  monthly revenue — the months counted twice. The annuity instead sets the
 *  PRICING HORIZON (term slope) and TCV stays the named home of the
 *  reserved-vs-spot future leg (hg:24894-24896). A month-to-month tenant
 *  (`remainingMonths` 0) still prices at the band FLOOR — the doc's bands are
 *  whole-book readings ("Shared / VPS book | … 10-18x monthly revenue"), and
 *  this is the per-tenant share of exactly that shape.
 *
 *  Trust inputs outside [-trustCeiling.. ] are NOT re-clamped here — the
 *  relationship ledger owns the band and re-clamps on read
 *  (`relationshipTrustBps` is the sanctioned source); this leaf only caps the
 *  GOODWILL side at 1.0 and floors the factor at 0 (a forged -1_000_000 sink
 *  erases the price, it cannot make it negative). */
export function tenantWholeLeaseValueMicroUsd(
  input: TenantLeaseValueInput,
  valuation: ValuationConfig = DEFAULT_VALUATION_CONFIG,
): MoneyUnit {
  const band = valuation.bandsBps[input.priceKeyKind] as MultipleBandBps | undefined;
  if (band === undefined) {
    throw new RangeError(
      "economy/valuation: priceKeyKind '" + String(input.priceKeyKind) +
        "' outside the closed set {plan, contract-class, sku} — the band table has no such line",
    );
  }
  guardMrc(input.mrcMicroUsd, "tenantWholeLeaseValueMicroUsd");
  guardMonths(input.remainingMonths, "tenantWholeLeaseValueMicroUsd");

  const wholeYears = floorDiv(input.remainingMonths, 12);
  const slopeFactorBps = BPS_DEN + BigInt(wholeYears) * valuation.termSlopeBpsPerYear;
  const rawMultiple = divHalfAway(band.floorBps * slopeFactorBps, BPS_DEN);
  const multipleBps = rawMultiple > band.topBps ? band.topBps : rawMultiple;

  let trustFactorBps = BPS_DEN;
  if (input.trustBps !== null) {
    trustFactorBps = BPS_DEN + divHalfAway(input.trustBps * valuation.trustLeverageBps, BPS_DEN);
    if (trustFactorBps > BPS_DEN) trustFactorBps = BPS_DEN; // goodwill ceiling: never above the band
    if (trustFactorBps < 0n) trustFactorBps = 0n;           // a sink erases; it cannot invert
  }
  return asMoney(
    bpsOf(bpsOf(input.mrcMicroUsd, multipleBps, "tenantWholeLeaseValueMicroUsd multiple"),
      trustFactorBps, "tenantWholeLeaseValueMicroUsd trust"),
  );
}

/* ─────────────────── the exit cash-slice (headline → proceeds) ──────────── */

/** The frozen diligence register: every adjustment basis this leg can book,
 *  each quoting its hg sentence VERBATIM (cleaned of markdown emphasis).
 *  ORDERED BY BASIS CODE-UNIT (the house sorted-iteration law — products and
 *  reported arrays are both walked in this order, so the floor-rounding of a
 *  multi-leg product is permutation-deterministic by construction). */
export interface ValuationAdjustment {
  readonly basis: ValuationAdjustmentBasis;
  /** The realized discount, bps of 1.0 — ALWAYS <= BPS_DEN: diligence knocks
   *  price OFF (hg:5620 "knocks a turn off the multiple"); nothing in this
   *  family ever adds (the slice is never above the headline). */
  readonly factorBps: bigint;
}

export const VALUATION_ADJUSTMENT_BASES = Object.freeze([
  Object.freeze({
    basis: "churn",
    cite: "hg:24369-24370 \u201CMRR/ARR x a multiple, modified by growth rate, NRR, churn, concentration, margin, reputation and infrastructure quality.\u201D"
  }),
  Object.freeze({
    basis: "concentration",
    cite: "hg:24440-24441 \u201CIf one customer or one business line exceeds 40% of revenue, valuation takes a hit\u201D"
  }),
  Object.freeze({
    basis: "exit-kind",
    cite: "hg:4501-4514 \u201CExit types, each with a different meta-currency profile and epilogue\u201D"
  }),
  Object.freeze({
    basis: "reputation",
    cite: "hg:1676-1677 \u201Ctenant credit quality affects your building's valuation\u201D"
  }),
  Object.freeze({
    basis: "term-coverage",
    cite: "hg:24898-24900 \u201Ccontract-term coverage - what fraction of your hardware's financing term is covered by contracted revenue\u201D"
  }),
  Object.freeze({
    basis: "written-off",
    cite: "hg:24399-24400 \u201Cquality of earnings (are your numbers reconcilable? unreconcilable books cost turns)\u201D"
  }),
] as const);

export type ValuationAdjustmentBasis = (typeof VALUATION_ADJUSTMENT_BASES)[number]["basis"];

export interface ExitCashSliceInput {
  /** The offer the acquisition-offer leg authors (§6.7: "A multiple of ARR
   *  … modified by your diligence report" — here the multiple has ALREADY
   *  been agreed as a headline; this function only answers "how much of it
   *  is cash at close"). Negative THROWS; 0 is legal (a worthless headline
   *  slices to 0). */
  readonly headlineOfferMicroUsd: MoneyUnit;
  /** Monthly churn reading, bps (0 = clean). Levers the churn basis. */
  readonly churnBps: bigint;
  /** Lifetime written-off revenue share, bps (0 = clean). Levers the
   *  written-off basis (the quality-of-earnings leg). */
  readonly writtenOffBps: bigint;
  /** Largest single customer/line revenue share, bps, or null when the
   *  reading is unavailable — ABSENCE books NO finding (a diligence memo
   *  cannot flag a number the books never showed). */
  readonly concentrationBps: bigint | null;
  /** Contract-term coverage of the financing term, bps (hg:24898), or null.
   *  Readings above 10_000 clamp to full (never-above-headline: over-
   *  coverage buys NO bonus). */
  readonly warctCoverageBps: bigint | null;
  /** Company reputation, bps 0..10_000 (the `company::reputation` ledger
   *  reading), or null (no pool ⇒ no finding — absent, not punished).
   *  Readings above 10_000 clamp to full. */
  readonly reputationBps: bigint | null;
  /** Which §1.6 ending the close is. */
  readonly exitKind: ValuationExitKind;
}

export interface ExitCashSliceResult {
  readonly cashSliceMicroUsd: MoneyUnit;
  /** The booked findings, code-unit order by basis, frozen. A diligence leg
   *  appears ONLY when its factor bites (< BPS_DEN) — a clean bill of health
   *  is not a finding — with the single always-present exception of
   *  `exit-kind`, which is the DEAL SHAPE, not a finding. */
  readonly adjustments: readonly ValuationAdjustment[];
}

function legOrNothing(basis: ValuationAdjustmentBasis, factorBps: bigint): ValuationAdjustment | null {
  if (factorBps >= BPS_DEN) return null;
  return Object.freeze({ basis, factorBps });
}

/** The headline-to-cash composition (§1.12 Diligence + §1.6 exit profiles):
 *
 *   cashSlice = headline x clamp(diligenceProduct, sliceFloorBps) x
 *               exitKindFactorBps[kind] / 10_000^2, clamped into [0, headline].
 *
 *  DILIGENCE PRODUCT: every basis whose factor < BPS_DEN multiplies in (each
 *  factor itself is a config-quantified discount off 1.0, floored at 0 —
 *  see the ValuationConfig docblocks for the per-basis hg sentence). The
 *  product NEVER re-inflates above 1.0 (all factors <= 1.0 by construction),
 *  and `sliceFloorBps` keeps the DILIGENCE legs from collectively eating
 *  more than half the headline in v0 — the escrow lesson (hg:24417-24422:
 *  "10-20% of purchase price held in escrow" and "sells at '5x EBITDA' and
 *  receives 62% of it at close") is modeled through the KIND factor and the
 *  per-leg discounts, not by letting findings run to zero.
 *  THE FLOOR-LAW SPLIT (disclosed vs recon's single clamp): the floor guards
 *  the diligence product ONLY; the exit-kind factor multiplies AFTER it, so
 *  `wind-down` (factor 0 — "sell the book, sell the hardware, pay the
 *  creditors, keep what's left": NO purchase price exists to slice) lands on
 *  EXACT 0 rather than being re-inflated to half a headline that was never
 *  offered. The campaign parse wall refuses wind-down BEFORE this call
 *  (division of labor: this leaf answers correctly for every kind; the wall
 *  decides which kinds a campaign may even ask about).
 *
 *  Unknown exit kinds THROW the closed-set guard (boundary parse — the
 *  save-side ExitKind stays a string EXACTLY so this wall is loud). */
export function exitCashSliceMicroUsd(
  input: ExitCashSliceInput,
  valuation: ValuationConfig = DEFAULT_VALUATION_CONFIG,
): ExitCashSliceResult {
  guardMrc(input.headlineOfferMicroUsd, "exitCashSliceMicroUsd headlineOfferMicroUsd");
  guardSignedBps(input.churnBps, "exitCashSliceMicroUsd churnBps");
  guardSignedBps(input.writtenOffBps, "exitCashSliceMicroUsd writtenOffBps");
  if (input.concentrationBps !== null) guardSignedBps(input.concentrationBps, "exitCashSliceMicroUsd concentrationBps");
  if (input.warctCoverageBps !== null) guardSignedBps(input.warctCoverageBps, "exitCashSliceMicroUsd warctCoverageBps");
  if (input.reputationBps !== null) guardSignedBps(input.reputationBps, "exitCashSliceMicroUsd reputationBps");

  const kindFactor = valuation.exitKindFactorBps[input.exitKind] as bigint | undefined;
  if (kindFactor === undefined) {
    throw new RangeError(
      "economy/valuation: exitKind '" + String(input.exitKind) +
        "' outside the closed seven — {ipo, strategic-acquisition, pe-platform, pe-bolt-on, asset-sale, management-buyout, wind-down} (§1.6)",
    );
  }

  const churnKnock = divHalfAway(input.churnBps * valuation.churnDiligenceFactorBps, BPS_DEN);
  const writtenOffKnock = divHalfAway(input.writtenOffBps * valuation.writtenOffDiligenceFactorBps, BPS_DEN);
  const coverage = input.warctCoverageBps === null ? null : input.warctCoverageBps > BPS_DEN ? BPS_DEN : input.warctCoverageBps;
  const reputation = input.reputationBps === null ? null : input.reputationBps > BPS_DEN ? BPS_DEN : input.reputationBps;

  const legs: ValuationAdjustment[] = [];
  const churnLeg = legOrNothing("churn", BPS_DEN - churnKnock);
  if (churnLeg !== null) legs.push(churnLeg);
  if (input.concentrationBps !== null && input.concentrationBps > valuation.concentrationThresholdBps) {
    legs.push(Object.freeze({ basis: "concentration", factorBps: BPS_DEN - valuation.concentrationPenaltyBps }));
  }
  if (reputation !== null) {
    const repLeg = legOrNothing("reputation", BPS_DEN - divHalfAway((BPS_DEN - reputation) * valuation.reputationLeverageBps, BPS_DEN));
    if (repLeg !== null) legs.push(repLeg);
  }
  if (coverage !== null) {
    const covLeg = legOrNothing("term-coverage", BPS_DEN - divHalfAway((BPS_DEN - coverage) * valuation.termCoverageLeverageBps, BPS_DEN));
    if (covLeg !== null) legs.push(covLeg);
  }
  const woLeg = legOrNothing("written-off", BPS_DEN - writtenOffKnock);
  if (woLeg !== null) legs.push(woLeg);

  legs.sort((a, b) => (a.basis < b.basis ? -1 : a.basis > b.basis ? 1 : 0));
  let productBps = BPS_DEN;
  for (const leg of legs) {
    productBps = divHalfAway(productBps * leg.factorBps, BPS_DEN);
  }
  if (productBps < valuation.sliceFloorBps) productBps = valuation.sliceFloorBps;

  const kindClamped = kindFactor > BPS_DEN ? BPS_DEN : kindFactor < 0n ? 0n : kindFactor;
  let cash = asMoney(
    bpsOf(bpsOf(input.headlineOfferMicroUsd, productBps, "exitCashSliceMicroUsd diligence"),
      kindClamped, "exitCashSliceMicroUsd exit kind"),
  );
  if (cash > input.headlineOfferMicroUsd) cash = input.headlineOfferMicroUsd; // NEVER above headline (hg:5621: proceeds, not headline)
  legs.push(Object.freeze({ basis: "exit-kind", factorBps: kindClamped }));
  legs.sort((a, b) => (a.basis < b.basis ? -1 : a.basis > b.basis ? 1 : 0));
  return Object.freeze({ cashSliceMicroUsd: cash, adjustments: Object.freeze(legs) });
}
