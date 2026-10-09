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

import type { MoneyUnit } from "../types.ts";
import { asMoney } from "../types.ts";

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
  /** Fallback net terms when the contract carries none — PROVISIONAL (doc
   *  shows 30/60/90 as a per-deal choice, §6.4). */
  readonly defaultNetTermsDays: number;
  /** Hourly cycle length in business minutes — LIVE (calendar tautology). */
  readonly hourlyCycleMinutes: number;
  /** Hard cap on invoices generated per contract per tick (long-pause catch-up
   *  guard) — PROVISIONAL. */
  readonly maxCatchUpInvoicesPerTick: number;
  /** Early-pay discount lever "2/10 net 30": bps off when paid within
   * *earlyPayDays of issue — LIVE rates, PROVISIONAL wiring (§6.4). */
  readonly earlyPayDiscountBps: bigint;
  readonly earlyPayDays: number;
}

/* ─────────────────────────────── dunning (§6.4) ───────────────────────── */

/** Ordered stage day-boundaries measured from the invoice due date. The
 *  doc's shape — declines days 1–4, dunning days 5–20 — is LIVE; the exact
 *  split between reminder/warning is PROVISIONAL (§6.4). Per §7.10/E-18: the
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
  /** Day the `warning` stage opens — PROVISIONAL (inside the 5–20 window). */
  readonly warningStartDay: number;
  /** Suspension Policy Dial: 3 | 10 | 30 (player choice, §6.4). Default is
   *  the middle rung; each rung trades cash for reviews. */
  readonly suspensionDay: number;
  /** Days AFTER suspension before `terminate` — PROVISIONAL (doc ends the
   *  dunning window at day 20 total, §6.4). */
  readonly terminationAfterSuspensionDays: number;
  /** Per-stage recovery rates (roll at stage entry). Tuned so the cumulative
   *  dunning recovery lands inside the documented 30–50% of failures —
   *  PROVISIONAL split, LIVE aggregate band (§6.4). */
  readonly stageRecoveryBps: Readonly<Record<"retry" | "reminder" | "warning" | "suspend", bigint>>;
  /** Recoveries after the site is already suspended — PROVISIONAL (doc:
   *  "suspending guarantees non-payment", §6.4; modeled as steep decay, not 0,
   *  so the state machine stays live). */
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
  /** Retention used when the term length is off-matrix — PROVISIONAL. */
  readonly renewalRetentionFallbackBps: bigint;
  /** Ghosted-forecast fuse window: tickets → churn lag 30–60 days — LIVE
   *  band (§7.15 / hosting_game.md:28660). */
  readonly ghostedSignalLagMinDays: number;
  readonly ghostedSignalLagMaxDays: number;
  /** A lit fuse decays out after this many quiet days — PROVISIONAL (doc:
   *  "show as forecast trend, not a timer"). */
  readonly ghostedSignalDecayDays: number;
  /** Bps added to monthly churn per unresolved ticket signal — PROVISIONAL. */
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
   *  reboot-don't-diagnose −90 s are LIVE (§6.1); the rest PROVISIONAL. */
  readonly spendSecs: Readonly<Record<BudgetSpendAction, bigint>>;
  /** Verbs locked out while the budget is exhausted — LIVE concept (§6.1
   *  "exhaustion locks risky actions"), exact membership PROVISIONAL. */
  readonly riskyActions: readonly BudgetSpendAction[];
  /** Clean-week refund seconds — PROVISIONAL ("a small refund", §6.1). */
  readonly cleanWeekRefundSec: bigint;
  /** Month-end surplus carry cap, bps of that month's budget. Doc says
   *  surplus carries across levels (§6.1/§6.14) — full carry default is
   *  PROVISIONAL. */
  readonly carryCapBps: bigint;
}

/* ─────────────────────────────── contracts (§6.12) ────────────────────── */

export interface ContractEconomyConfig {
  /** Typical annual escalator 3% — LIVE (§6.12 clause table). */
  readonly defaultAnnualEscalatorBps: bigint;
  /** MFN reprices "3 levels later" — LIVE count (§7.15); mapping a "level" to
   *  one business month is PROVISIONAL. */
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
  /** Tray midpoints used for the DSO approximation — PROVISIONAL for the
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
   *  PROVISIONAL (doc: utilization flag, §6.13). */
  readonly spiralBorrowStreakMonths: number;
  /** Runway ceiling (months) under which the streak matters — PROVISIONAL. */
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
 *  (economy/reputation.ts folds them). Every value PROVISIONAL — the docs
 *  give the DIRECTION (§2.10 outages/reviews hurt, recoveries and honest
 *  post-mortems help; §5.10 permanent damage floor after a published
 *  post-mortem) but no magnitudes. Tuning is an owner/list item, same class
 *  as the unattended thresholds. */
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
      defaultNetTermsDays: 30, // PROVISIONAL
      hourlyCycleMinutes: 60, // LIVE
      maxCatchUpInvoicesPerTick: 24, // PROVISIONAL
      earlyPayDiscountBps: 200n, // LIVE "2/10 net 30" §6.4
      earlyPayDays: 10, // LIVE §6.4
    },
    dunning: {
      cardFailureBps: 700n, // 7% (5–9) — MID §6.4
      retryStartDay: 1, // LIVE declines days 1–4 §6.4
      reminderStartDay: 5, // LIVE dunning 5–20 §6.4
      warningStartDay: 8, // PROVISIONAL (inside the 5–20 dunning window)
      suspensionDay: 10, // dial rung 3|10|30 — default middle, PLAYER CHOICE §6.4
      terminationAfterSuspensionDays: 10, // PROVISIONAL (ends window ~day 20 §6.4)
      stageRecoveryBps: { retry: 1200n, reminder: 1000n, warning: 800n, suspend: 400n }, // PROVISIONAL split, 30–50% aggregate LIVE §6.4
      postSuspensionRecoveryBps: 200n, // PROVISIONAL (§6.4 suspension decays recovery)
      dunningEngineBonusBps: 400n, // MID: lifts 30–50% → 40–70% §6.4
    },
    churn: {
      monthlyLogoChurnBpsByBundle: {
        shared: 450n, // 3–6% MID §6.16:25610
        vps: 600n, // 4–8% MID
        "managed-wordpress": 225n, // 1.5–3% MID
        dedicated: 150n, // 1–2% MID
        colo: 55n, // 0.3–0.8% MID
        "enterprise-managed": 35n, // 0.2–0.5% MID
      },
      fallbackMonthlyBps: 450n, // PROVISIONAL (= shared rate)
      renewalRetentionBpsByTermMonths: { 0: 5500n, 12: 7800n, 24: 8200n, 36: 8500n }, // LIVE §6.12:24772
      renewalRetentionFallbackBps: 5500n, // PROVISIONAL (monthly rung)
      ghostedSignalLagMinDays: 30, // LIVE §7.15/hosting_game:28660
      ghostedSignalLagMaxDays: 60, // LIVE
      ghostedSignalDecayDays: 90, // PROVISIONAL
      ghostedSignalAddBps: 300n, // PROVISIONAL
    },
    errorBudget: {
      spendSecs: {
        shed: 120n, // PROVISIONAL
        "stale-cache": 60n, // PROVISIONAL
        "feature-off": 300n, // PROVISIONAL
        "sla-hit": 0n, // computed per breach by caller, not a flat spend — LIVE semantics §6.1
        "risky-deploy": 180n, // −3 min LIVE §6.1
        "reboot-not-diagnose": 90n, // −90 s LIVE §6.1
        "maintenance-window": 3600n, // PROVISIONAL (listed as a spend, no number)
      },
      riskyActions: ["risky-deploy", "reboot-not-diagnose"] as const, // PROVISIONAL membership, LIVE concept §6.1
      cleanWeekRefundSec: 60n, // PROVISIONAL "small refund" §6.1
      carryCapBps: 10_000n, // PROVISIONAL: full month-end surplus carries (§6.1/§6.14)
    },
    contracts: {
      defaultAnnualEscalatorBps: 300n, // 3% LIVE §6.12
      mfnRepriceLagLevels: 3, // LIVE §7.15 "reprices 3 levels later"
      mfnLagMinutesPerLevel: 43_200, // PROVISIONAL: level ⇒ one business month
      renewalPulseLeadDays: 90, // LIVE §6.4
      evergreenExtensionMonths: 12, // PROVISIONAL (auto-renew re-clocks a year)
    },
    arAging: {
      trayEdgesDays: [30, 60, 90] as const, // LIVE four trays §6.13
      trayMidpointDays: [15, 45, 75, 120] as const, // PROVISIONAL (90+ open tray)
      badDebtBpsByBundle: {
        consumer: 300n, // 2–4% MID §6.13
        vps: 200n, // 1–3% MID
        "smb-dedicated": 150n, // 1–2% MID
        enterprise: 25n, // <0.5% MID
        colo: 25n, // <0.5% MID
        bulletproof: 0n, // ~0 LIVE §6.13
      },
      badDebtFallbackBps: 150n, // PROVISIONAL (SMB-dedicated rung)
    },
    deferred: { recognitionNum: 1n, recognitionDen: 12n }, // LIVE 1/12 per month §6.13
    runway: {
      cautionMonths: 6, // LIVE §6.4 tone shift
      criticalMonths: 3, // LIVE §6.4 number promotion
      spiralBorrowStreakMonths: 3, // PROVISIONAL (§6.13 utilization flag)
      spiralRunwayCeilingMonths: 3, // PROVISIONAL
      minWarningRealMinutes: 3, // LIVE §9.6 lose-slowly gate
      creditLineAprBps: 1100n, // 8–14% MID §6.13
    },
    reputation: {
      writtenOffChurnBps: -600n, // PROVISIONAL (§2.10 direction; no magnitude)
      voluntaryChurnBps: -200n, // PROVISIONAL
      dunningRecoveredBps: 150n, // PROVISIONAL
      chargebackBps: -400n, // PROVISIONAL
      majorIncidentBps: -500n, // PROVISIONAL (§2.10 reddit-thread class event)
      honestPostmortemBps: 250n, // PROVISIONAL (§5.10 transparency earns back)
    },
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
