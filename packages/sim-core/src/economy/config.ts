/**
 * Economy configuration — ALL tunable knobs live here, each carrying its
 * provenance §-cite. Nothing in this directory hard-codes a rate inline;
 * content/rulesets may override these values (they are DEFAULTS, and the
 * ruleset-card system, not this module, owns per-type truth).
 *
 * PROVENANCE MARKERS:
 *  - "LIVE"   — value taken directly from a MASTER_REPORT / hosting_game figure.
 *  - "MID"    — midpoint of a documented range.
 *  - "PROVISIONAL" — no doc figure; placeholder that must be tuned (OD list).
 * RATIFIED 2026-10-09 (docs/adr/0009-owner-ratifications-calibration.md):
 *  - OD-1 scorecard — "commitment-convergence" ACTIVE (scoring.ts keeps all
 *    three candidates side-by-side as comparison data)
 *  - OD-2 tuning sheet — B canonical; month stays 7 real-min (the 43200n/7n
 *    BUSINESS_SCALE_DEFAULT is KEPT; the 4-min flip was declined)
 * Still NOT resolved by this module:
 *  - suspension dial day 3|10|30 and policy-book concessions (player choices).
 */

import type { MoneyUnit, NegotiationTone, PriceTargetKind } from "../types.ts";
import { asMoney } from "../types.ts";
import type { MultipleBandBps, ValuationExitKind } from "./valuation.ts";

/** The three candidate tuning sheets (Appendix D, MASTER_REPORT). */
export type TuningSheet = "A" | "B" | "C";

/* ─────────────────────────── business calendar ─────────────────────────── */

/** Structure of the BUSINESS clock calendar. The real-minute ⇄ business-minute
 *  RATIO lives in kernel/time.ts (BUSINESS_SCALE_DEFAULT, OD-2/D-1); this is
 *  only the calendar shape. 30-day month per hosting_game §6.16 header
 *  "(1 − commitment) × 30 days" — LIVE (§6.16). */
export interface BusinessCalendarConfig {
  readonly minutesPerDay: number; // 1440 — LIVE (calendar tautology)
  readonly daysPerWeek: number; // 7 — LIVE
  readonly minutesPerMonth: number; // 43200 = 30d — LIVE (§6.16 header; OD-2 ratified 2026-10-09: 30d/7-real-min month KEPT)
  readonly monthsPerYear: number; // 12 — LIVE
}

/* ─────────────────────────────── fees (§6.13) ──────────────────────────── */

export interface TransactionFeeConfig {
  /** 2.9% retail card rate — LIVE (§6.13 payment-fee table). */
  readonly cardRateBps: bigint;
  /** $0.30 per-transaction fixed — LIVE (§6.13). */
  readonly cardFixedMicroUsd: MoneyUnit;
  /** $20 chargeback fee (doc range $15–25) — MID (§6.13). */
  readonly chargebackFeeMicroUsd: MoneyUnit;
  /** Card settlement 2–3 days — MID, applied as rolling-reserve release lag (§6.13). */
  readonly cardSettlementDays: number;
  /** Rolling reserve: % of card revenue parked in `restricted` — LIVE 10% (§6.13 example). */
  readonly rollingReserveBps: bigint;
  /** Rolling reserve hold length in business days — LIVE 180 (§6.13 example). */
  readonly rollingReserveDays: number;
}

/* ─────────────────────────────── billing (§6.4) ───────────────────────── */

export interface BillingConfig {
  /** Annual-prepay discount 15% ("2 months free") — LIVE (§6.13 financing note). */
  readonly annualPrepayDiscountBps: bigint;
  /** "Net-60 is really net-75": the clock starts when THEY process —
   *  +15 days slip — LIVE (§6.4). */
  readonly netTermsSlipDays: number;
  /** Fallback net terms when the contract carries none — RATIFIED 2026-10-16 (ADR-0015 #1); the
   *  doc shows 30/60/90 as a per-deal choice, §6.4. */
  readonly defaultNetTermsDays: number;
  /** Hourly cycle length in business minutes — LIVE (calendar tautology). */
  readonly hourlyCycleMinutes: number;
  /** Hard cap on invoices generated per contract per tick (long-pause catch-up
   *  guard) — RATIFIED 2026-10-16 (ADR-0015 #1). */
  readonly maxCatchUpInvoicesPerTick: number;
  /** Early-pay discount lever "2/10 net 30": bps off when paid within
   * *earlyPayDays of issue — LIVE rates; wiring RATIFIED 2026-10-16
   *  (ADR-0015 #1) (§6.4). */
  readonly earlyPayDiscountBps: bigint;
  readonly earlyPayDays: number;
}

/* ─────────────────────────────── dunning (§6.4) ───────────────────────── */

/** Ordered stage day-boundaries measured from the invoice due date. The
 *  doc's shape — declines days 1–4, dunning days 5–20 — is LIVE; the exact
 *  split between reminder/warning is RATIFIED 2026-10-16 (ADR-0015 #1)
 *  (§6.4). Per §7.10/E-18: the
 *  recovery challenge rolls at EVERY stage entry (retry…terminate), not only
 *  once the ladder reaches warning depth — the retry roll models the card-
 *  retry schedule itself. */
export interface DunningConfig {
  /** Monthly card-payment failure rate 5–9% — MID (§6.4 involuntary churn). */
  readonly cardFailureBps: bigint;
  /** Day the `retry` stage opens (declines begin) — LIVE 1 (§6.4). */
  readonly retryStartDay: number;
  /** Day the `reminder` stage opens — LIVE 5 (§6.4 dunning 5–20). */
  readonly reminderStartDay: number;
  /** Day the `warning` stage opens — RATIFIED 2026-10-16 (ADR-0015 #1), inside the
   *  5–20 window. */
  readonly warningStartDay: number;
  /** Suspension Policy Dial: 3 | 10 | 30 (player choice, §6.4). Default is
   *  the middle rung; each rung trades cash for reviews. */
  readonly suspensionDay: number;
  /** Days AFTER suspension before `terminate` — RATIFIED 2026-10-16 (ADR-0015 #1); the doc ends
   *  the dunning window at day 20 total, §6.4. */
  readonly terminationAfterSuspensionDays: number;
  /** Per-stage recovery rates (roll at stage entry). Tuned so the cumulative
   *  dunning recovery lands inside the documented 30–50% of failures —
   *  RATIFIED 2026-10-16 (ADR-0015 #1) split, LIVE aggregate band (§6.4). */
  readonly stageRecoveryBps: Readonly<Record<"retry" | "reminder" | "warning" | "suspend", bigint>>;
  /** Recoveries after the site is already suspended — RATIFIED 2026-10-16 (ADR-0015 #1);
   *  doc: "suspending guarantees non-payment", §6.4 — modeled as steep decay,
   *  not 0, so the state machine stays live. */
  readonly postSuspensionRecoveryBps: bigint;
  /** Flat bonus recovery bps while a built Dunning Engine is owned (data ref;
   *  tick receives it via config override) — doc: buildable lifts recovery
   *  from 30–50% to 40–70% — MID (§6.4 / wave2_ceo_fresh). */
  readonly dunningEngineBonusBps: bigint;
}

/* ─────────────────────────────── churn (§6.12/§6.16) ──────────────────── */

export interface ChurnConfig {
  /** Monthly voluntary logo-churn by bundle id; Sheet C real-market rates
   *  (MIDs of §6.16 25610: shared 3–6%, VPS 4–8%, managed-WP 1.5–3%,
   *  dedicated 1–2%, colo 0.3–0.8%, enterprise-managed 0.2–0.5%).
   *  Unknown bundles fall back to `fallbackMonthlyBps`. */
  readonly monthlyLogoChurnBpsByBundle: Readonly<Record<string, bigint>>;
  readonly fallbackMonthlyBps: bigint;
  /** Renewal-cliff retention by term length in whole months — LIVE term
   *  matrix (§6.12 24772: monthly ~55%, annual 78%, 2yr 82%, 3yr 85%). */
  readonly renewalRetentionBpsByTermMonths: Readonly<Record<number, bigint>>;
  /** Retention used when the term length is off-matrix — RATIFIED 2026-10-16 (ADR-0015 #1). */
  readonly renewalRetentionFallbackBps: bigint;
  /** Ghosted-forecast fuse window: tickets → churn lag 30–60 days — LIVE
   *  band (§7.15 / hosting_game.md:28670). */
  readonly ghostedSignalLagMinDays: number;
  readonly ghostedSignalLagMaxDays: number;
  /** A lit fuse decays out after this many quiet days — RATIFIED 2026-10-16 (ADR-0015 #1); doc:
   *  "show as forecast trend, not a timer". */
  readonly ghostedSignalDecayDays: number;
  /** Bps added to monthly churn per unresolved ticket signal — RATIFIED 2026-10-16 (ADR-0015 #1). */
  readonly ghostedSignalAddBps: bigint;
}

/* ────────────────────────── error budget (§6.1/§6.16) ─────────────────── */

/** The spendable-mitigation verbs. `sla-hit` is auto-charged by breaches,
 *  never player-locked; the rest are deliberate spends (§6.1 "spendable
 *  in-combat currency"). */
export type BudgetSpendAction =
  | "shed"
  | "stale-cache"
  | "feature-off"
  | "sla-hit"
  | "risky-deploy"
  | "reboot-not-diagnose"
  | "maintenance-window";

export interface ErrorBudgetConfig {
  /** Seconds charged per deliberate spend. risky-deploy −3 min and
   *  reboot-don't-diagnose −90 s are LIVE (§6.1); the rest RATIFIED
   *  2026-10-16 (ADR-0015 #1). */
  readonly spendSecs: Readonly<Record<BudgetSpendAction, bigint>>;
  /** Verbs locked out while the budget is exhausted — LIVE concept (§6.1
   *  "exhaustion locks risky actions"), exact membership RATIFIED 2026-10-16
   *  (ADR-0015 #1). */
  readonly riskyActions: readonly BudgetSpendAction[];
  /** Clean-week refund seconds — RATIFIED 2026-10-16 (ADR-0015 #1),
   *  "a small refund", §6.1. */
  readonly cleanWeekRefundSec: bigint;
  /** Month-end surplus carry cap, bps of that month's budget. Doc says
   *  surplus carries across levels (§6.1/§6.14) — full carry default is
   *  RATIFIED 2026-10-16 (ADR-0015 #1). */
  readonly carryCapBps: bigint;
}

/* ─────────────────────────────── contracts (§6.12) ────────────────────── */

export interface ContractEconomyConfig {
  /** Typical annual escalator 3% — LIVE (§6.12 clause table). */
  readonly defaultAnnualEscalatorBps: bigint;
  /** MFN reprices "3 levels later" — LIVE count (§7.15); mapping a "level" to
   *  one business month is RATIFIED 2026-10-16 (ADR-0015 #1). */
  readonly mfnRepriceLagLevels: number;
  readonly mfnLagMinutesPerLevel: number;
  /** Renewal Window pulse lead 90 days — LIVE (§6.4). */
  readonly renewalPulseLeadDays: number;
  /** Lapse-by-default after cliff unless auto-renew/evergreen — LIVE (§6.4). */
  readonly evergreenExtensionMonths: number;
}

/* ────────────────────────────── AR aging (§6.13) ──────────────────────── */

export interface ArAgingConfig {
  /** Four trays 0–30 / 31–60 / 61–90 / 90+ — LIVE (§6.13). */
  readonly trayEdgesDays: readonly [number, number, number];
  /** Tray midpoints used for the DSO approximation — RATIFIED 2026-10-16 (ADR-0015 #1) for the
   *  open-ended 90+ tray (120 chosen). */
  readonly trayMidpointDays: readonly [number, number, number, number];
  /** Expected bad-debt rate past 90 days by bundle — MIDs of §6.13 (consumer
   *  2–4%, VPS 1–3%, SMB ded 1–2%, enterprise <0.5%, colo <0.5%, bulletproof
   *  ~0%). */
  readonly badDebtBpsByBundle: Readonly<Record<string, bigint>>;
  readonly badDebtFallbackBps: bigint;
}

/* ─────────────────────── deferred-revenue recognition (§6.13) ─────────── */

export interface DeferredRevenueConfig {
  /** Recognition slice per business month for prepayments — LIVE 1/12 (§6.13). */
  readonly recognitionNum: bigint;
  readonly recognitionDen: bigint;
}

/* ─────────────────────── runway / death spiral (§6.4/§6.13) ───────────── */

export interface RunwayConfig {
  /** Runway tone shifts below 6 months — LIVE (§6.4 Runway Tone Shift). */
  readonly cautionMonths: number;
  /** Number-promotion / critical below 3 months — LIVE (§6.4). */
  readonly criticalMonths: number;
  /** Consecutive credit-line borrow months that flag the death spiral —
   *  RATIFIED 2026-10-16 (ADR-0015 #1); doc: utilization flag, §6.13. */
  readonly spiralBorrowStreakMonths: number;
  /** Runway ceiling (months) under which the streak matters — RATIFIED 2026-10-16 (ADR-0015 #1). */
  readonly spiralRunwayCeilingMonths: number;
  /** Lose-slowly guard: player must get ≥ this many REAL minutes of warning
   *  before an unavoidable loss — LIVE 3 (§9.6 gate; conversion through the
   *  business clock scale happens in runway.ts). */
  readonly minWarningRealMinutes: number;
  /** Credit-line APR 8–14% — MID, data ref for the finance module (§6.13). */
  readonly creditLineAprBps: bigint;
}

/* ──────────────────── reputation deltas (§2.10/§5.10) ────────────────── */

/** Signed bps of the FULL 0..10,000 score moved by each reputation signal
 *  (economy/reputation.ts folds them). Every value RATIFIED 2026-10-16
 *  (ADR-0015 #1) — the docs
 *  give the DIRECTION (§2.10 outages/reviews hurt, recoveries and honest
 *  post-mortems help; §5.10 permanent damage floor after a published
 *  post-mortem) but no magnitudes. Tuning was an owner/list item, same
 *  class, RATIFIED together 2026-10-16 with the unattended thresholds
 *  (ADR-0015 #1). */
export interface ReputationConfig {
  /** Billing failure made public and final (dunning write-off) — §2.10. */
  readonly writtenOffChurnBps: bigint;
  /** A logo left on its own — milder than being thrown out over money. */
  readonly voluntaryChurnBps: bigint;
  /** A failed payment recovered before it went public — §6.4 dunning win. */
  readonly dunningRecoveredBps: bigint;
  /** Card chargeback (§6.13 fee table) — accusations stick. */
  readonly chargebackBps: bigint;
  /** SLA credit due / host-reported major incident (§2.10 outage reviews).
   *  Halved in magnitude once honestHostFloor is set (§5.10). */
  readonly majorIncidentBps: bigint;
  /** Published honest post-mortem (§5.10) — earns score AND sets the
   *  permanent damage floor. */
  readonly honestPostmortemBps: bigint;
}

/* ────────────────── company death thresholds (OD-25(a), §6.10) ────────── */

/** The three canonical company deaths (economy/death.ts folds them at tick
 *  step 12.6). Every value RATIFIED 2026-10-16 (ADR-0014 #D4). Days go
 *  through `daysToMinutes` (calendar-driven), never a hardcoded 1440. */
export interface DeathConfig {
  /** Active-customer book BELOW this counts as collapse territory. Default
   *  1 = literal extinction (zero customers sustained). */
  readonly churnFloor: number; // RATIFIED 2026-10-16 (ADR-0014 #D4)
  /** How long the book must stay under the floor before DISSOLUTION arms. */
  readonly churnCollapseSustainedDays: number; // RATIFIED 2026-10-16 (ADR-0014 #D4)
  /** How long free cash may sit at zero WITH refused settles before the float
   *  death arms (the refused-settles requirement is part of the ratified
   *  shape). 3 days mirrors the unattended LONG_WEEKEND ceiling (2880
   *  business minutes), so a weekend never outlives the threshold. */
  readonly floatInsolvencySustainedDays: number; // RATIFIED 2026-10-16 (ADR-0014 #D4)
  /** Cure window a latched covenant breach gets after its month-roll
   *  (dunning's middle-rung shape, §6.4: warn long, escapable at a cost). */
  readonly covenantCureGraceDays: number; // RATIFIED 2026-10-16 (ADR-0014 #D4)
}

/* ─────────────── price elasticity of the adjust-price book (OD-24(a)) ──── */

/** The elasticity dial set behind `economy/elasticity.ts` (OD-24(a) owner
 *  ruling 2026-10-09 — part 2 of the pricing surface: the door's
 *  `adjust-price` records are CONSUMED here). Every value RATIFIED
 *  2026-10-16 (ADR-0014 #D4) — the retention-vs-churn asymmetry is ratified
 *  as deliberate (cuts buy no certainty). Direction law:
 *  a price HIKE raises churn pressure and lowers both renewal retention and
 *  dunning recovery odds; a CUT mirrors. All factors are exact bigint bps
 *  multipliers applied to the SAME single seeded roll each consumer already
 *  draws — elasticity never adds an RNG roll (neutral ⇒ byte-identity). */
export interface PricingConfig {
  /** Churn-pressure coefficient: bps of extra churn-factor per 10,000 bps of
   *  out-of-band price deviation (150% ⇒ churn doubles at +110% over the
   *  dead-band). RATIFIED 2026-10-16 (ADR-0014 #D4). */
  readonly churnCoefficientBps: bigint;
  /** Renewal-cliff retention coefficient (win/loss pulse): a hike scales the
   *  term-matrix retention DOWN by this leverage (80%).
   *  RATIFIED 2026-10-16 (ADR-0014 #D4). */
  readonly retentionCoefficientBps: bigint;
  /** Dunning-recovery coefficient: a hike scales per-stage recovery odds
   *  DOWN by this leverage (angry wallets pay slower, 50%).
   *  RATIFIED 2026-10-16 (ADR-0014 #D4). */
  readonly dunningCoefficientBps: bigint;
  /** Dead-band: |deviation| ≤ this many bps from the authored price is
   *  INERTIA — every factor stays exactly 1.0 (±10%).
   *  RATIFIED 2026-10-16 (ADR-0014 #D4). */
  readonly deadBandBps: bigint;
  /** Saturation floor for adverse-direction factors (a −90% cut can only
   *  halve churn pressure; a hike can at most multiply it by factorMax).
   *  The [0.5×, 3×] churn clamp is RATIFIED 2026-10-16 (ADR-0014 #D4). */
  readonly factorMinBps: bigint;
  /** Saturation clamp for the churn factor above the dead band.
   *  RATIFIED 2026-10-16 (ADR-0014 #D4). */
  readonly factorMaxBps: bigint;
  /** Hard floor for the retention mirror (0.1×): even a brutal hike keeps a
   *  small chance of renewal (retention factor never reaches 0).
   *  RATIFIED 2026-10-16 (ADR-0014 #D4). */
  readonly retentionFactorMinBps: bigint;
}

/* ─────────────── negotiation posture of the negotiate-terms book ──────── */

/** The tone/concession bumps behind `economy/negotiate.ts` (ADR-0015
 *  door-mechanics ruling 2026-10-16 — 5/5 · Negotiate, the money-lane leg:
 *  the door's `negotiate-terms` records are CONSUMED here). Grounded §1.3
 *  colo "Amps and Aisles" (hosting_game.md:1637): "tone options and a
 *  relationship meter. **This is the level's combat.**" The v0 honest gap:
 *  the per-tenant relationship meter does NOT exist — these bumps are its
 *  company-level stand-in (types.ts `NegotiationTerm`). Direction law: the
 *  bumps RAISE the cliff's retention factor BEFORE the existing single
 *  draw (never a new roll), clamped to ≤ 1.0 — a rapport buys leverage,
 *  never certainty (the elasticity ceiling, mirrored). All values
 *  RATIFIED 2026-10-17 (ADR-0017 #6) — the wave-23 game-feel batch-ratify
 *  (owner ruling 4a; the #11-named survivor). ADR-0015 mechanics
 *  authorization; the card names no numbers — the ordering law it DOES
 *  name, rapport-with-concession > rapport-without, is pinned in tests. */
export interface NegotiationConfig {
  /** Additive bps over 1.0 of retention lift per tone at the renewal
   *  cliff (rapport leans on the relationship, firm on the arithmetic,
   *  legal on the contract — which buys no goodwill: 0).
   *  RATIFIED 2026-10-17 (ADR-0017 #6). */
  readonly retentionBumpBpsByTone: Readonly<Record<NegotiationTone, bigint>>;
  /** Additive bps for a NON-ZERO booked concession (money talks in every
   *  tone; a booked 0n is a stance, not a sweetener). Combined with the
   *  tone bump, then clamped ≤ 1.0. RATIFIED 2026-10-17 (ADR-0017 #6). */
  readonly concessionPresenceBps: bigint;
}

/* ────────── per-tenant relationship trust (ADR-0016 mechanic A) ──────── */

/** The signed-bps accrual table behind `economy/relationship.ts` (ADR-0016
 *  mechanic A — the colo card's per-tenant RELATIONSHIP METER
 *  (hosting_game.md §1.3 "Amps and Aisles":1637: "tone options and a
 *  relationship meter. **This is the level's combat.**"): every booked
 *  negotiation encounter, renewal, lapse, dunning step, suspension,
 *  recovery, payment-after-stage, voluntary churn and write-off moves the
 *  TENANT's own trust (keyed by the priceKey grammar), and that trust is
 *  what the negotiation bump adds at the next cliff (the downward leg the
 *  ADR-0015 company-proxy posture could not reach). Direction law lives in
 *  relationship.ts (rapport/firm +, legal −, recoveries +, losses −); the
 *  values here are magnitudes. The section is OPTIONAL on EconomyConfig
 *  (postMortem law — sibling hosts hand-build config literals); the fold
 *  reads `cfg.relationships ?? DEFAULT_RELATIONSHIP_CONFIG`. */
export interface RelationshipConfig {
  /** Trust earned per booked rapport negotiation encounter.
   *  RATIFIED 2026-10-17 (ADR-0016 #11). */
  readonly toneRapportBps: bigint;
  /** Trust earned per booked firm negotiation encounter — the arithmetic
   *  half-works on the meter too.
   *  RATIFIED 2026-10-17 (ADR-0016 #11). */
  readonly toneFirmBps: bigint;
  /** Trust COST per booked legal negotiation encounter (stored as the
   *  magnitude; relationship.ts applies it NEGATIVE — "each with a legal
   *  and reputational cost", §1.3 Enforce ladder).
   *  RATIFIED 2026-10-17 (ADR-0016 #11). */
  readonly toneLegalBps: bigint;
  /** Trust earned when the tenant renews at the cliff.
   *  RATIFIED 2026-10-17 (ADR-0016 #11). */
  readonly renewedBps: bigint;
  /** Trust burned when the tenant lapses at the cliff.
   *  RATIFIED 2026-10-17 (ADR-0016 #11). */
  readonly lapsedBps: bigint;
  /** Trust burned per dunning stage entry; `suspended` rides this same
   *  magnitude (the spec's dunning-stage/suspended slash group — a
   *  suspension IS the ladder's hardest stage).
   *  RATIFIED 2026-10-17 (ADR-0016 #11). */
  readonly dunningStageBps: bigint;
  /** Trust repaired by a dunning recovery; `invoice-paid` (after-stage)
   *  rides this same magnitude (the dunning-recovered/invoice-paid-after-
   *  stage slash group).
   *  RATIFIED 2026-10-17 (ADR-0016 #11). */
  readonly dunningRecoveredBps: bigint;
  /** Heavy trust burn when the account is written off.
   *  RATIFIED 2026-10-17 (ADR-0016 #11). */
  readonly writtenOffBps: bigint;
  /** Heavy trust burn when the logo leaves on its own.
   *  RATIFIED 2026-10-17 (ADR-0016 #11). */
  readonly voluntaryChurnBps: bigint;
  /** Inclusive clamp floor of the signed reading.
   *  RATIFIED 2026-10-17 (ADR-0016 #11). */
  readonly trustFloorBps: bigint;
  /** Inclusive clamp ceiling of the signed reading — a ±10-point goodwill
   *  band around 1.0, reachable by sustained talking (40 rapport
   *  encounters) or by bullying (a write-off alone is 400 of the 1000).
   *  RATIFIED 2026-10-17 (ADR-0016 #11). */
  readonly trustCeilingBps: bigint;
}

/** The shipped default trust book — shared frozen const, single source,
 *  never restated inline (the `DEFAULT_POST_MORTEM_CONFIG` pattern). */
export const DEFAULT_RELATIONSHIP_CONFIG: RelationshipConfig = Object.freeze({
  toneRapportBps: 25n, // RATIFIED 2026-10-17 (ADR-0016 #11) — goodwill accrues gently
  toneFirmBps: 10n, // RATIFIED 2026-10-17 (ADR-0016 #11)
  toneLegalBps: 15n, // RATIFIED 2026-10-17 (ADR-0016 #11) — applied NEGATIVE (the card's cost)
  renewedBps: 50n, // RATIFIED 2026-10-17 (ADR-0016 #11)
  lapsedBps: 80n, // RATIFIED 2026-10-17 (ADR-0016 #11) — leaving stings more than staying pays
  dunningStageBps: 100n, // RATIFIED 2026-10-17 (ADR-0016 #11) — the shared stage/suspension damage rung
  dunningRecoveredBps: 50n, // RATIFIED 2026-10-17 (ADR-0016 #11) — the shared recovery/paid-after-stage repair rung
  writtenOffBps: 400n, // RATIFIED 2026-10-17 (ADR-0016 #11) — heavy
  voluntaryChurnBps: 200n, // RATIFIED 2026-10-17 (ADR-0016 #11) — heavy
  trustFloorBps: -1_000n, // RATIFIED 2026-10-17 (ADR-0016 #11)
  trustCeilingBps: 1_000n, // RATIFIED 2026-10-17 (ADR-0016 #11)
});

/* ─────────────── scale warmth billing (ADR-0016 mechanic C) ────────────── */

/** The price of RESERVED WARMTH behind the money-lane fold
 *  (`internal/tickFold.ts`, ADR-0016 mechanic C — warmth cost, the Scale
 *  money leg: the door's `scale-node` bookings are CHARGED here, never by
 *  the door itself — the door never touches cash, its own law). Grounded
 *  §1.3 serverless "Cold Start" / Chrysalis Pool (hosting_game.md):
 *  "a Chrysalis Pool of pre-warmed shells is the buildable: buying warmth
 *  is buying the absence of a stutter" — and absence has a line item.
 *  Direction law: ONE derived draft per business-month roll, amount =
 *  Σ in-force `reservedSlots` × this rate under the as-of law (the
 *  `scaleWarmInForce` twin); zero in force ⇒ NO draft (the ≥1 µ$ burn
 *  boundary, review F6 — nothing to bill is nothing to post). The section
 *  is OPTIONAL on EconomyConfig (postMortem law — sibling hosts hand-build
 *  config literals); the fold reads `cfg.warmth ?? DEFAULT_WARMTH_CONFIG`. */
export interface WarmthConfig {
  /** Micro-USD charged per in-force reserved slot per business month
   *  (25_000_000n = $25 per warm slot per month — a rack-slot rental
   *  order of magnitude, the doc's §6.4 opex register style).
   *  RATIFIED 2026-10-17 (ADR-0016 #11). */
  readonly rateMicroUsdPerSlotMonth: bigint;
}

/** The shipped default warmth book — the fold bills this rate whenever a
 *  host never names `cfg.warmth` (the `DEFAULT_POST_MORTEM_CONFIG`
 *  pattern: shared frozen const, single source, never restated inline). */
export const DEFAULT_WARMTH_CONFIG: WarmthConfig = Object.freeze({
  rateMicroUsdPerSlotMonth: 25_000_000n, // RATIFIED 2026-10-17 (ADR-0016 #11) — $25/slot/month
});

/* ─────────────── blameless post-mortem filing gate (§7.7, g21) ─────────── */

/** The adjudication limit behind `economy/postmortem.ts` (audit g21: the
 *  §7.7 post-mortem rows were PARTIAL — evidence in, gated credit out).
 *  RATIFIED 2026-10-16 (ADR-0015 #1), together with the reputation
 *  deltas themselves.
 *  The section is OPTIONAL on EconomyConfig: absent ⇒ DEFAULT_POST_MORTEM_
 *  CONFIG ships the limit, and the credit rides the existing
 *  `reputation.honestPostmortemBps` (single source, never forked). */
export interface PostMortemConfig {
  /** §7.7 "if TWO changes were in-flight, the post-mortem cannot attribute
   *  a cause": filings at/under this count are attributable; above it the
   *  card goes `postmortem-unattributed` with zero credit. RATIFIED
   *  2026-10-16 (ADR-0015 #1) at 1. */
  readonly maxAttributableChanges: number;
}

/** The shipped default book — hosts that never pass `cfg.postMortem` get
 *  exactly this (the fold reads `cfg.postMortem ?? DEFAULT_POST_MORTEM_CONFIG`). */
export const DEFAULT_POST_MORTEM_CONFIG: PostMortemConfig = Object.freeze({
  maxAttributableChanges: 1, // RATIFIED 2026-10-16 (ADR-0015 #1) — the doc's "two changes" example
});

/* ─────────────── sell acceptance dice (ADR-0016 mechanic B) ────────────── */

/** The market-adjudication curve behind `economy/sell.ts` (mechanic B: the
 *  `sell-offer` book gets VERDICTS, not money — the fold rolls one die per
 *  fresh offer fingerprint against an anchored market rate). Shape mirrors
 *  `PricingConfig`: base at the dead-band, coefficient × out-of-band
 *  leverage, clamped both ways. The clamp asymmetry is law: the ceiling is
 *  strictly below 10,000 bps — a sale is never certain (the retention-floor
 *  lesson, ADR-0014 #D4, now a two-domain shape). The section is OPTIONAL
 *  on EconomyConfig (postMortem law — sibling hosts hand-build config
 *  literals); the fold reads `cfg.sell ?? DEFAULT_SELL_CONFIG`. */
export interface SellConfig {
  /** Acceptance at-market (inside the dead band), basis points.
   *  RATIFIED 2026-10-17 (ADR-0016 #11). */
  readonly acceptBaseBps: bigint;
  /** bps of acceptance lost per 10,000 bps of out-of-band price deviation
   *  (150% leverage — harsher than churn's 150/80/50 family because the
   *  counterparty here walks away whole).
   *  RATIFIED 2026-10-17 (ADR-0016 #11). */
  readonly acceptCoefficientBps: bigint;
  /** Inclusive no-move band around the anchor, bps — elasticity twin.
   *  RATIFIED 2026-10-17 (ADR-0016 #11). */
  readonly acceptDeadBandBps: bigint;
  /** Never hopeless: a bargain still cannot reach certainty-of-zero.
   *  RATIFIED 2026-10-17 (ADR-0016 #11). */
  readonly acceptFloorBps: bigint;
  /** Never certain: strictly below BPS_DEN (ADR-0014 #D4 asymmetry law).
   *  RATIFIED 2026-10-17 (ADR-0016 #11). */
  readonly acceptCeilingBps: bigint;
}

/** The shipped default sell book — the fold reads `cfg.sell ??
 *  DEFAULT_SELL_CONFIG` (the `DEFAULT_POST_MORTEM_CONFIG` pattern). */
export const DEFAULT_SELL_CONFIG: SellConfig = Object.freeze({
  acceptBaseBps: 7_500n, // RATIFIED 2026-10-17 (ADR-0016 #11) — at-market offers close three-quarters of the time
  acceptCoefficientBps: 15_000n, // RATIFIED 2026-10-17 (ADR-0016 #11) — 150% out-of-band leverage
  acceptDeadBandBps: 1_000n, // RATIFIED 2026-10-17 (ADR-0016 #11) — ±10% inertia, pricing.deadBandBps twin
  acceptFloorBps: 1_000n, // RATIFIED 2026-10-17 (ADR-0016 #11) — never hopeless
  acceptCeilingBps: 9_500n, // RATIFIED 2026-10-17 (ADR-0016 #11) — NEVER certain (ADR-0014 #D4 two-domain law)
});

/* ─────────────────── valuation (wave-28 money-at-the-end 1/3) ─────────────────── */

/** The dial surface for economy/valuation.ts — the PURE read-projection
 *  valuation leaf (WARCT per-tenant + exit cash-slice composition). The
 *  money-lane fold reads NONE of these numbers: `EconomyConfig.valuation`
 *  exists so a host can re-taste the book without touching the leaf, and
 *  the fold byte-identity twin pins that claim (importing this leaf changes
 *  not one µ$ of a running ledger — negotiate-era-identities precedent).
 *  Every field docblock quotes its hosting_game.md sentence VERBATIM; every
 *  magnitude is a house PROVISIONAL taste (ADR-0016 #10 — ratify-on-playtest). */
export interface ValuationConfig {
  /** Per-line multiple bands, bps of 1.0× of the tenant's own MONTHLY
   *  revenue. hg:24377 "Shared / VPS book | EBITDA multiple, or
   *  monthly-revenue multiple | 3–6× EBITDA / 10–18× monthly revenue" ·
   *  hg:24379 "Colocation | NOI and cap rate, like real estate | 6–9% cap
   *  rate (≈11–16× NOI)" — the contract-class line is the NOI floor-map
   *  honest-partial (the engine has no expense truth; see the band note in
   *  economy/valuation.ts). */
  readonly bandsBps: Readonly<Record<PriceTargetKind, MultipleBandBps>>;
  /** Price sensitivity of the relationship meter (economy/relationship.ts,
   *  ±1000 bps signed). hg:1674 "tenant credit quality affects your
   *  building's valuation". */
  readonly trustLeverageBps: bigint;
  /** hg:1670-1671 "The escalator — 3%/yr baked into the lease. A five-year
   *  deal is worth ~15% more than it looks" → 300 bps per WHOLE remaining
   *  year, capped at the band top. */
  readonly termSlopeBpsPerYear: bigint;
  /** hg:24436-24437 "If one customer or one business line exceeds 40% of
   *  revenue, valuation takes a hit" — STRICTLY above (the doc says
   *  "exceeds"). */
  readonly concentrationThresholdBps: bigint;
  /** Magnitude of that hit. The only number the doc attaches to
   *  concentration is hg:24393-24394 ">25% in one customer typically costs
   *  20–30% of the multiple" → mid-band 25%. */
  readonly concentrationPenaltyBps: bigint;
  /** Per-bps-of-monthly-churn knock. hg:24365-24366 lists "churn" among the
   *  modifiers of the MRR/ARR multiple but gives no magnitude → taste. */
  readonly churnDiligenceFactorBps: bigint;
  /** Per-bps-of-lifetime-written-off knock — the quality-of-earnings leg,
   *  hg:24395-24396 "quality of earnings (are your numbers reconcilable?
   *  unreconcilable books cost turns)". Written-off revenue is the books'
   *  own reconcilability stain, so the factor runs gentler than churn. */
  readonly writtenOffDiligenceFactorBps: bigint;
  /** Leverage of the contract-term-coverage reading (gap from full buys the
   *  discount linearly). hg:24894-24896 "contract-term coverage — what
   *  fraction of your hardware's financing term is covered by contracted
   *  revenue"; hg:24392 WARCT is "the single biggest multiple driver" →
   *  the strongest diligence leg in the book. */
  readonly termCoverageLeverageBps: bigint;
  /** Leverage of (1 − company reputation). hg:24365 "reputation" is in the
   *  modifier list; no magnitude given → taste. */
  readonly reputationLeverageBps: bigint;
  /** Floor on the diligence product BEFORE the exit-kind factor multiplies
   *  (the split floor law: economy/valuation.ts exitCashSliceMicroUsd
   *  docblock). hg:24415 "10–20% of purchase price held in escrow" + the
   *  hg:24418 62%-received lesson: findings shave price, they do not
   *  collectively erase it — the DEAL SHAPE (exit kind) may. */
  readonly sliceFloorBps: bigint;
  /** §1.6 exit profiles, hg:4499-4512 — seven endings "each with a
   *  different meta-currency profile and epilogue". wind-down carries 0:
   *  "sell the book, sell the hardware, pay the creditors, keep what's
   *  left" — no purchase price exists to slice; the CAMPAIGN parse wall
   *  (a later lane of the program) is expected to refuse wind-down before
   *  this book is consulted (division of labor documented in
   *  economy/valuation.ts). */
  readonly exitKindFactorBps: Readonly<Record<ValuationExitKind, bigint>>;
}

export const DEFAULT_VALUATION_CONFIG: ValuationConfig = Object.freeze({
  /* Posture: PROVISIONAL (ADR-0016 #10 register — ratify-on-playtest). The
   * SHAPE of every number below is doc-grounded (cites inline); the
   * MAGNITUDES await a playtest. The leaf that reads this book casts zero
   * dice (zero-rolls roster pin in economy/__tests__). */
  bandsBps: Object.freeze({
    plan: Object.freeze({ floorBps: 100_000n, topBps: 180_000n }), // PROVISIONAL (ADR-0016 #10) — hg:24377 shared/VPS "10–18× monthly revenue"
    "contract-class": Object.freeze({ floorBps: 100_000n, topBps: 160_000n }), // PROVISIONAL (ADR-0016 #10) — hg:24379 colo "≈11–16× NOI" floor-mapped to revenue basis (NOI needs expense truth the engine lacks)
    sku: Object.freeze({ floorBps: 100_000n, topBps: 180_000n }), // PROVISIONAL (ADR-0016 #10) — hg:24890 reserved-vs-spot row gives NO multiple for on-demand lines; spot-eviction discount = named-future leg
  }),
  trustLeverageBps: 500n, // PROVISIONAL (ADR-0016 #10) — ±1000 bps trust ⇒ ∓5% price; hg:1674 credit-quality-prices-the-building
  termSlopeBpsPerYear: 300n, // PROVISIONAL (ADR-0016 #10) — hg:1670-1671 "A five-year deal is worth ~15% more than it looks" (3%/yr)
  concentrationThresholdBps: 4_000n, // PROVISIONAL (ADR-0016 #10) — hg:24436 "exceeds 40% of revenue"; law is STRICT (>), 4000 exactly books no hit
  concentrationPenaltyBps: 2_500n, // PROVISIONAL (ADR-0016 #10) — hg:24393-24394 "costs 20–30% of the multiple" mid-band
  churnDiligenceFactorBps: 200n, // PROVISIONAL (ADR-0016 #10) — hg:24365 churn is a modifier, magnitude ungiven → taste
  writtenOffDiligenceFactorBps: 50n, // PROVISIONAL (ADR-0016 #10) — hg:24395-24396 quality-of-earnings leg, gentler than churn
  termCoverageLeverageBps: 5_000n, // PROVISIONAL (ADR-0016 #10) — hg:24894-24896 term coverage; hg:24392 WARCT "single biggest multiple driver"
  reputationLeverageBps: 2_000n, // PROVISIONAL (ADR-0016 #10) — hg:24365 reputation modifier, magnitude ungiven → taste
  sliceFloorBps: 5_000n, // PROVISIONAL (ADR-0016 #10) — diligence alone never takes more than half; hg:24415-24418 escrow lesson
  exitKindFactorBps: Object.freeze({
    "ipo": 10_000n, // PROVISIONAL (ADR-0016 #10) — hg:4501-4502 IPO: public market sets the price, "most currency" (currency quality, not cash %, is the meta-axis)
    "strategic-acquisition": 10_000n, // PROVISIONAL (ADR-0016 #10) — hg:4503-4504 "highest multiple"; synergies live IN the headline, slice not discounted twice
    "pe-platform": 9_000n, // PROVISIONAL (ADR-0016 #10) — hg:4505-4506 platform deal: disciplined price, "second bite" thesis waits elsewhere
    "pe-bolt-on": 8_000n, // PROVISIONAL (ADR-0016 #10) — hg:4507-4508 "lower multiple ... high churn" — folded into the buyer's model, cash follows
    "asset-sale": 7_000n, // PROVISIONAL (ADR-0016 #10) — hg:4509-4510 "you keep the liabilities" — liabilities-shedding asymmetry = named-future leg
    "management-buyout": 5_000n, // PROVISIONAL (ADR-0016 #10) — hg:4511 "lowest cash" (seller paper, not proceeds)
    "wind-down": 0n, // PROVISIONAL (ADR-0016 #10) — hg:4512 no purchase price exists to slice; campaign parse wall refuses the kind BEFORE this call (documented division of labor)
  }),
});

/* ─────────────────────────────── root config ──────────────────────────── */

export interface EconomyConfig {
  readonly calendar: BusinessCalendarConfig;
  readonly fees: TransactionFeeConfig;
  readonly billing: BillingConfig;
  readonly dunning: DunningConfig;
  readonly churn: ChurnConfig;
  readonly errorBudget: ErrorBudgetConfig;
  readonly contracts: ContractEconomyConfig;
  readonly arAging: ArAgingConfig;
  readonly deferred: DeferredRevenueConfig;
  readonly runway: RunwayConfig;
  readonly reputation: ReputationConfig;
  readonly death: DeathConfig;
  readonly pricing: PricingConfig;
  readonly negotiation: NegotiationConfig;
  /** ADR-0016 mechanic A per-tenant relationship trust (economy/relationship.ts)
   *  — OPTIONAL (postMortem law: sibling hosts hand-build config literals).
   *  The fold reads `cfg.relationships ?? DEFAULT_RELATIONSHIP_CONFIG`. */
  readonly relationships?: RelationshipConfig | undefined;
  /** ADR-0016 mechanic C scale-warmth billing — OPTIONAL (postMortem law:
   *  sibling hosts hand-build config literals). The money-lane fold reads
   *  `cfg.warmth ?? DEFAULT_WARMTH_CONFIG`. */
  readonly warmth?: WarmthConfig | undefined;
  /** ADR-0016 mechanic B sell acceptance dice (economy/sell.ts) — OPTIONAL
   *  (postMortem law: sibling hosts hand-build config literals). The fold
   *  reads `cfg.sell ?? DEFAULT_SELL_CONFIG`. */
  readonly sell?: SellConfig | undefined;
  /** wave-28 money-at-the-end 1/3 valuation book (economy/valuation.ts) —
   *  OPTIONAL (postMortem law: sibling hosts hand-build config literals).
   *  Read by NO fold — pure read-projection (the money-lane digest twin
   *  proves it); the close-time runner/campaign lane consumes it later. */
  readonly valuation?: ValuationConfig | undefined;
  /** §7.7 post-mortem filing gate — OPTIONAL (unlike every section above):
   *  sibling hosts hand-build config literals, and a REQUIRED key would
   *  break their typecheck for a fold that is input-gated anyway. The fold
   *  reads `cfg.postMortem ?? DEFAULT_POST_MORTEM_CONFIG`. */
  readonly postMortem?: PostMortemConfig | undefined;
}

export function defaultEconomyConfig(): EconomyConfig {
  return {
    calendar: { minutesPerDay: 1440, daysPerWeek: 7, minutesPerMonth: 43_200, monthsPerYear: 12 },
    fees: {
      cardRateBps: 290n, // 2.9% — LIVE §6.13
      cardFixedMicroUsd: asMoney(300_000n), // $0.30 — LIVE §6.13
      chargebackFeeMicroUsd: asMoney(20_000_000n), // $20 (15–25) — MID §6.13
      cardSettlementDays: 3, // MID §6.13
      rollingReserveBps: 1000n, // 10% — LIVE §6.13 example
      rollingReserveDays: 180, // LIVE §6.13 example
    },
    billing: {
      annualPrepayDiscountBps: 1500n, // LIVE §6.13
      netTermsSlipDays: 15, // LIVE §6.4 ("net-60 is really net-75")
      defaultNetTermsDays: 30, // RATIFIED 2026-10-16 (ADR-0015 #1)
      hourlyCycleMinutes: 60, // LIVE
      maxCatchUpInvoicesPerTick: 24, // RATIFIED 2026-10-16 (ADR-0015 #1)
      earlyPayDiscountBps: 200n, // LIVE "2/10 net 30" §6.4
      earlyPayDays: 10, // LIVE §6.4
    },
    dunning: {
      cardFailureBps: 700n, // 7% (5–9) — MID §6.4
      retryStartDay: 1, // LIVE declines days 1–4 §6.4
      reminderStartDay: 5, // LIVE dunning 5–20 §6.4
      warningStartDay: 8, // RATIFIED 2026-10-16 (ADR-0015 #1); inside the 5–20 dunning window
      suspensionDay: 10, // dial rung 3|10|30 — default middle, PLAYER CHOICE §6.4
      terminationAfterSuspensionDays: 10, // RATIFIED 2026-10-16 (ADR-0015 #1); ends window ~day 20 §6.4
      stageRecoveryBps: { retry: 1200n, reminder: 1000n, warning: 800n, suspend: 400n }, // RATIFIED 2026-10-16 (ADR-0015 #1) split, 30–50% aggregate LIVE §6.4
      postSuspensionRecoveryBps: 200n, // RATIFIED 2026-10-16 (ADR-0015 #1); §6.4 suspension decays recovery
      dunningEngineBonusBps: 400n, // MID: lifts 30–50% → 40–70% §6.4
    },
    churn: {
      monthlyLogoChurnBpsByBundle: {
        shared: 450n, // 3–6% MID §6.16:25618
        vps: 600n, // 4–8% MID
        "managed-wordpress": 225n, // 1.5–3% MID
        dedicated: 150n, // 1–2% MID
        colo: 55n, // 0.3–0.8% MID
        "enterprise-managed": 35n, // 0.2–0.5% MID
      },
      fallbackMonthlyBps: 450n, // RATIFIED 2026-10-16 (ADR-0015 #1); = shared rate
      renewalRetentionBpsByTermMonths: { 0: 5500n, 12: 7800n, 24: 8200n, 36: 8500n }, // LIVE §6.12:24778
      renewalRetentionFallbackBps: 5500n, // RATIFIED 2026-10-16 (ADR-0015 #1); monthly rung
      ghostedSignalLagMinDays: 30, // LIVE §7.15/hosting_game:28670
      ghostedSignalLagMaxDays: 60, // LIVE
      ghostedSignalDecayDays: 90, // RATIFIED 2026-10-16 (ADR-0015 #1)
      ghostedSignalAddBps: 300n, // RATIFIED 2026-10-16 (ADR-0015 #1)
    },
    errorBudget: {
      spendSecs: {
        shed: 120n, // RATIFIED 2026-10-16 (ADR-0015 #1)
        "stale-cache": 60n, // RATIFIED 2026-10-16 (ADR-0015 #1)
        "feature-off": 300n, // RATIFIED 2026-10-16 (ADR-0015 #1)
        "sla-hit": 0n, // computed per breach by caller, not a flat spend — LIVE semantics §6.1
        "risky-deploy": 180n, // −3 min LIVE §6.1
        "reboot-not-diagnose": 90n, // −90 s LIVE §6.1
        "maintenance-window": 3600n, // RATIFIED 2026-10-16 (ADR-0015 #1); listed as a spend, no number
      },
      riskyActions: ["risky-deploy", "reboot-not-diagnose"] as const, // RATIFIED 2026-10-16 (ADR-0015 #1) membership, LIVE concept §6.1
      cleanWeekRefundSec: 60n, // RATIFIED 2026-10-16 (ADR-0015 #1) — "small refund" §6.1
      carryCapBps: 10_000n, // RATIFIED 2026-10-16 (ADR-0015 #1): full month-end surplus carries (§6.1/§6.14)
    },
    contracts: {
      defaultAnnualEscalatorBps: 300n, // 3% LIVE §6.12
      mfnRepriceLagLevels: 3, // LIVE §7.15 "reprices 3 levels later"
      mfnLagMinutesPerLevel: 43_200, // RATIFIED 2026-10-16 (ADR-0015 #1): level ⇒ one business month
      renewalPulseLeadDays: 90, // LIVE §6.4
      evergreenExtensionMonths: 12, // RATIFIED 2026-10-16 (ADR-0015 #1); auto-renew re-clocks a year
    },
    arAging: {
      trayEdgesDays: [30, 60, 90] as const, // LIVE four trays §6.13
      trayMidpointDays: [15, 45, 75, 120] as const, // RATIFIED 2026-10-16 (ADR-0015 #1); 90+ open tray
      badDebtBpsByBundle: {
        consumer: 300n, // 2–4% MID §6.13
        vps: 200n, // 1–3% MID
        "smb-dedicated": 150n, // 1–2% MID
        enterprise: 25n, // <0.5% MID
        colo: 25n, // <0.5% MID
        bulletproof: 0n, // ~0 LIVE §6.13
      },
      badDebtFallbackBps: 150n, // RATIFIED 2026-10-16 (ADR-0015 #1); SMB-dedicated rung
    },
    deferred: { recognitionNum: 1n, recognitionDen: 12n }, // LIVE 1/12 per month §6.13
    runway: {
      cautionMonths: 6, // LIVE §6.4 tone shift
      criticalMonths: 3, // LIVE §6.4 number promotion
      spiralBorrowStreakMonths: 3, // RATIFIED 2026-10-16 (ADR-0015 #1); §6.13 utilization flag
      spiralRunwayCeilingMonths: 3, // RATIFIED 2026-10-16 (ADR-0015 #1)
      minWarningRealMinutes: 3, // LIVE §9.6 lose-slowly gate
      creditLineAprBps: 1100n, // 8–14% MID §6.13
    },
    reputation: {
      writtenOffChurnBps: -600n, // RATIFIED 2026-10-16 (ADR-0015 #1); §2.10 direction; no magnitude
      voluntaryChurnBps: -200n, // RATIFIED 2026-10-16 (ADR-0015 #1)
      dunningRecoveredBps: 150n, // RATIFIED 2026-10-16 (ADR-0015 #1)
      chargebackBps: -400n, // RATIFIED 2026-10-16 (ADR-0015 #1)
      majorIncidentBps: -500n, // RATIFIED 2026-10-16 (ADR-0015 #1); §2.10 reddit-thread class event
      honestPostmortemBps: 250n, // RATIFIED 2026-10-16 (ADR-0015 #1); §5.10 transparency earns back
    },
    death: {
      churnFloor: 1, // RATIFIED 2026-10-16 (ADR-0014 #D4) — extinction line
      churnCollapseSustainedDays: 3, // RATIFIED 2026-10-16 (ADR-0014 #D4)
      floatInsolvencySustainedDays: 3, // RATIFIED 2026-10-16 (ADR-0014 #D4) — matches LONG_WEEKEND 2880-min ceiling
      covenantCureGraceDays: 10, // RATIFIED 2026-10-16 (ADR-0014 #D4) — dunning middle-rung shape (§6.4)
    },
    pricing: {
      churnCoefficientBps: 15_000n, // RATIFIED 2026-10-16 (ADR-0014 #D4) — churn 150% (OD-24(a) part 2)
      retentionCoefficientBps: 8_000n, // RATIFIED 2026-10-16 (ADR-0014 #D4) — retention 80%
      dunningCoefficientBps: 5_000n, // RATIFIED 2026-10-16 (ADR-0014 #D4) — recovery 50%
      deadBandBps: 1_000n, // RATIFIED 2026-10-16 (ADR-0014 #D4) — ±10% inertia band
      factorMinBps: 5_000n, // RATIFIED 2026-10-16 (ADR-0014 #D4) — 0.5× floor of the [0.5×,3×] churn clamp
      factorMaxBps: 30_000n, // RATIFIED 2026-10-16 (ADR-0014 #D4) — 3× ceiling of the [0.5×,3×] churn clamp
      retentionFactorMinBps: 1_000n, // RATIFIED 2026-10-16 (ADR-0014 #D4) — 0.1× floor: hikes never zero the renewal chance
    },
    negotiation: {
      // ADR-0015 5/5 (Negotiate). RATIFIED 2026-10-17 (ADR-0017 #6) — the
      // card names tones, not numbers; the ORDERING law it names is pinned.
      retentionBumpBpsByTone: Object.freeze({
        rapport: 300n, // the relationship meter works (+3% retention)
        firm: 100n, // the arithmetic half-works (+1%)
        legal: 0n, // "each with a legal and reputational cost" — no goodwill bought
      }),
      concessionPresenceBps: 300n, // money talks in every tone (+3%; 0n booked = stance, no bump)
    },
    relationships: DEFAULT_RELATIONSHIP_CONFIG, // ADR-0016 mechanic A — shared frozen trust book
    postMortem: DEFAULT_POST_MORTEM_CONFIG, // §7.7 — shared frozen default book
    warmth: DEFAULT_WARMTH_CONFIG, // ADR-0016 mechanic C — shared frozen default book
    sell: DEFAULT_SELL_CONFIG, // ADR-0016 mechanic B — shared frozen default book
    valuation: DEFAULT_VALUATION_CONFIG, // wave-28 money-at-the-end 1/3 — shared frozen valuation book
  };
}

/** Business-minute helpers derived from the calendar (never re-hardcoded). */
export function minutesPerWeek(cfg: EconomyConfig): number {
  return cfg.calendar.minutesPerDay * cfg.calendar.daysPerWeek;
}
export function minutesPerYear(cfg: EconomyConfig): number {
  return cfg.calendar.minutesPerMonth * cfg.calendar.monthsPerYear;
}
export function daysToMinutes(cfg: EconomyConfig, days: number): number {
  return days * cfg.calendar.minutesPerDay;
}
export function secondsPerBusinessMonth(cfg: EconomyConfig): bigint {
  return BigInt(cfg.calendar.minutesPerMonth) * 60n;
}
