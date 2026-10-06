/**
 * Billing engine (MASTER_REPORT §6.4 "billing 1st, declines 1–4, dunning
 * 5–20"; §6.13 fees/reserve/deferred).
 *
 * Owns:
 *  - the invoice calendar: per-cycle invoice generation on the BUSINESS clock
 *    (hourly / monthly / annual grids anchored at the contract cycle anchor),
 *  - the net-terms clock: "net-60 is really net-75" (§6.4) — invoiced terms
 *    slip by config.netTermsSlipDays because the clock starts when THEY
 *    process; card-cycled (net 0) invoices are due on issue,
 *  - transaction-fee math (2.9% + $0.30 retail schedule, §6.13) and the
 *    rolling reserve (10% × 180 d, §6.13),
 *  - unlock schedules: deferred-revenue recognition at 1/12 per month and
 *    reserve releases — both deferred→free / restricted→free transfers with
 *    per-bucket invariants,
 *  - AR aging: the four trays 0–30 / 31–60 / 61–90 / 90+ plus a DSO readout
 *    (§6.13).
 *
 * Pure functions only; the tick orchestrator performs the postings.
 */

import {
  asEntityId,
  asMoney,
  type Contract,
  type EntityId,
  type Fixed,
  type MoneyUnit,
  type SimMinute,
} from "../types.ts";
import { fromRatio } from "../kernel/fixed.ts";
import { daysToMinutes, type EconomyConfig } from "./config.ts";
import type { DunningStage } from "./dunning.ts";
import { bpsOf, scaleMoney } from "./money.ts";
import type { ContractEconomy } from "./contract.ts";
import { billedMrc, hasClause } from "./contract.ts";

/* ───────────────────────────── invoices ───────────────────────────────── */

export type InvoiceState = "issued" | "paid" | "failed" | "written-off";

export interface InvoiceTerms {
  /** 0 = card auto-pay (due on issue); 30/60/90 = invoiced B2B (§6.4). */
  readonly netTermsDays: number;
  /** Prepaid-annual deal: full year up front at 15% off, recognized 1/12
   *  monthly — LIVE mechanics (§6.13). */
  readonly annualPrepay: boolean;
}

export interface Invoice {
  readonly id: EntityId;
  readonly contractId: EntityId;
  readonly cycleIndex: number;
  readonly periodStartMin: SimMinute;
  readonly periodEndMin: SimMinute;
  readonly issuedAtMin: SimMinute;
  readonly dueAtMin: SimMinute;
  readonly gross: MoneyUnit;
  /** Card-processing fee deducted at settlement (§6.13). */
  readonly fee: MoneyUnit;
  /** What actually lands in the bank when it settles: gross − fee. */
  readonly net: MoneyUnit;
  readonly state: InvoiceState;
  readonly settledAtMin: SimMinute | null;
  readonly dunningStage: DunningStage | null;
  readonly dunningStageAtMin: SimMinute | null;
  readonly terms: InvoiceTerms;
  /** Set when a deferred-recognition or reserve-release schedule was created
   *  alongside this invoice (schedule ids are `inv.id + suffix`). */
  readonly unlockScheduleId: EntityId | null;
}

/** Whole business days past the due date (negative while still on credit). */
export function daysPastDue(invoice: Invoice, atBusinessMin: SimMinute, cfg: EconomyConfig): number {
  return Math.floor((atBusinessMin - invoice.dueAtMin) / cfg.calendar.minutesPerDay);
}

export function cyclePeriodMinutes(contract: Contract, cfg: EconomyConfig): number {  switch (contract.billingCycle) {
    case "hourly":
      return cfg.billing.hourlyCycleMinutes;
    case "monthly":
      return cfg.calendar.minutesPerMonth;
    case "annual":
      return cfg.calendar.minutesPerMonth * cfg.calendar.monthsPerYear;
  }
}

/** Net-terms due-date clock (§6.4): invoiced terms slip by the processing
 *  delay; card terms are due at issue (declines then run days 1–4). */
export function invoiceDueAtMin(issuedAtMin: SimMinute, terms: InvoiceTerms, cfg: EconomyConfig): SimMinute {
  if (terms.netTermsDays <= 0) return issuedAtMin;
  const slip = terms.netTermsDays + cfg.billing.netTermsSlipDays;
  return issuedAtMin + slip * cfg.calendar.minutesPerDay;
}

/** Cycle grid position (prepaid: cycle k opens at anchor + k×period; the
 *  tick's cyclesDueFor counts cycles STARTED ≤ now minus invoiced). */
export function cyclePeriodStart(econ: ContractEconomy, contract: Contract, cycleIndex: number, cfg: EconomyConfig): SimMinute {
  return econ.cycleAnchorMin + cycleIndex * cyclePeriodMinutes(contract, cfg);
}

/** Gross amount for a cycle: hourly bills MRC/720 (exact bigint ratio),
 *  monthly bills MRC (escalated/grandfathered), annual — and any prepay-
 *  elected monthly deal — bill a full year at the 15% prepay discount
 *  ("2 months free", financing instrument, §6.13). */
export function cycleGross(
  contract: Contract,
  econ: ContractEconomy,
  periodStartMin: SimMinute,
  terms: InvoiceTerms,
  mfnDiscountBps: bigint,
  cfg: EconomyConfig,
): MoneyUnit {
  const monthly = billedMrc(contract, econ, periodStartMin, escalatorFor(contract, econ, cfg), mfnDiscountBps, cfg);
  const prepayDiscount = (amount: MoneyUnit): MoneyUnit =>
    bpsOf(amount, 10_000n - cfg.billing.annualPrepayDiscountBps, `prepay discount '${contract.id}'`);
  const year = scaleMoney(
    monthly,
    { num: BigInt(cfg.calendar.monthsPerYear), den: 1n },
    `annual gross '${contract.id}'`,
  );
  switch (contract.billingCycle) {
    case "hourly": {
      const hoursPerMonth = cfg.calendar.minutesPerMonth / cfg.billing.hourlyCycleMinutes;
      return scaleMoney(monthly, { num: 1n, den: BigInt(hoursPerMonth) }, `hourly cycle '${contract.id}'`);
    }
    case "monthly":
      return terms.annualPrepay ? prepayDiscount(year) : monthly;
    case "annual":
      return prepayDiscount(year);
  }
}

function escalatorFor(contract: Contract, econ: ContractEconomy, cfg: EconomyConfig) {
  return hasClause(econ.clauseRefs, "annual-escalator")
    ? { annualBps: cfg.contracts.defaultAnnualEscalatorBps, firstApplicationYear: 1 }
    : null;
}

export function issueInvoice(
  contract: Contract,
  econ: ContractEconomy,
  cycleIndex: number,
  atBusinessMin: SimMinute,
  terms: InvoiceTerms,
  mfnDiscountBps: bigint,
  cfg: EconomyConfig,
): Invoice {
  const period = cyclePeriodMinutes(contract, cfg);
  const periodStartMin = econ.cycleAnchorMin + cycleIndex * period;
  const gross = cycleGross(contract, econ, periodStartMin, terms, mfnDiscountBps, cfg);
  // Retail card schedule on net-0 auto-pay; invoiced B2B settles by wire/ACH
  // at interchange-plus — modeled here as rate-only (PROVISIONAL split §6.13).
  const rateFee = bpsOf(gross, cfg.fees.cardRateBps, `card rate '${contract.id}'`);
  const fixedFee = terms.netTermsDays > 0 ? 0n : cfg.fees.cardFixedMicroUsd;
  const fee = asMoney(rateFee + fixedFee);
  return {
    id: asEntityId(`inv:${contract.id}:${cycleIndex}`),
    contractId: contract.id,
    cycleIndex,
    periodStartMin,
    periodEndMin: periodStartMin + period,
    issuedAtMin: periodStartMin,
    dueAtMin: invoiceDueAtMin(periodStartMin, terms, cfg),
    gross,
    fee,
    net: asMoney(gross - fee),
    state: "issued",
    settledAtMin: null,
    dunningStage: null,
    dunningStageAtMin: null,
    terms,
    unlockScheduleId: null,
  };
}

/* ─────────────────────── unlock schedules (deferred & reserve) ─────────── */

/**
 * One money "timer" that moves fixed slices between two buckets on the
 * business calendar:
 *  - deferred recognition: deferred → free, 1/12 of the prepay each month
 *    (refund pulls the unreleased remainder straight back out of deferred;
 *    already-recognized parts must be clawed from free — "refund punishes",
 *    §6.13),
 *  - rolling reserve: restricted → free, one slab after 180 business days
 *    (§6.13).
 */
export interface UnlockSchedule {
  readonly id: EntityId;
  readonly contractId: EntityId;
  readonly total: MoneyUnit;
  readonly released: MoneyUnit;
  /** Slice per period (1/12) — for single-shot releases use {1,1}. */
  readonly sliceNum: bigint;
  readonly sliceDen: bigint;
  readonly periodMinutes: number;
  readonly nextReleaseAtMin: SimMinute;
  readonly reason: "deferred-recognition" | "rolling-reserve";
}

export function openRecognitionSchedule(
  scheduleId: EntityId,
  contractId: EntityId,
  prepaidTotal: MoneyUnit,
  recognizedAtMin: SimMinute,
  cfg: EconomyConfig,
): UnlockSchedule {
  return {
    id: scheduleId,
    contractId,
    total: prepaidTotal,
    released: asMoney(0n),
    sliceNum: cfg.deferred.recognitionNum,
    sliceDen: cfg.deferred.recognitionDen,
    periodMinutes: cfg.calendar.minutesPerMonth,
    nextReleaseAtMin: recognizedAtMin + cfg.calendar.minutesPerMonth,
    reason: "deferred-recognition",
  };
}

export function openReserveSchedule(
  scheduleId: EntityId,
  contractId: EntityId,
  parkedAmount: MoneyUnit,
  parkedAtMin: SimMinute,
  cfg: EconomyConfig,
): UnlockSchedule {
  return {
    id: scheduleId,
    contractId,
    total: parkedAmount,
    released: asMoney(0n),
    sliceNum: 1n,
    sliceDen: 1n,
    periodMinutes: daysToMinutes(cfg, cfg.fees.rollingReserveDays),
    nextReleaseAtMin: parkedAtMin + daysToMinutes(cfg, cfg.fees.rollingReserveDays),
    reason: "rolling-reserve",
  };
}

export interface UnlockRelease {
  readonly schedule: UnlockSchedule;
  readonly amount: MoneyUnit;
  readonly completed: boolean;
}

/** Due releases for one schedule (catch-up loop lives in the tick).
 *  Recognition releases the LESSER of the slice and the remainder, so the
 *  final month closes to the exact cent (no float drift, no over-release). */
export function nextUnlockAt(schedule: UnlockSchedule, atBusinessMin: SimMinute): UnlockRelease | null {
  if (schedule.released >= schedule.total) return null;
  if (atBusinessMin < schedule.nextReleaseAtMin) return null;
  const slice = scaleMoney(schedule.total, { num: schedule.sliceNum, den: schedule.sliceDen }, `unlock '${schedule.id}'`);
  const remaining = (schedule.total - schedule.released) as MoneyUnit;
  const amount = slice < remaining ? slice : remaining;
  return {
    schedule: {
      ...schedule,
      released: (schedule.released + amount) as MoneyUnit,
      nextReleaseAtMin: schedule.nextReleaseAtMin + schedule.periodMinutes,
    },
    amount,
    completed: schedule.released + amount >= schedule.total,
  };
}

/** Refund split (§6.13): pull the unreleased remainder from deferred, and
 *  any already-recognized overshoot from FREE — that is the punishment. */
export function planRefund(schedule: UnlockSchedule, refundAmount: MoneyUnit): {
  readonly fromDeferred: MoneyUnit;
  readonly fromFree: MoneyUnit;
} {
  if (refundAmount < 0n) throw new RangeError(`economy/billing: negative refund ${refundAmount} on '${schedule.id}'`);
  const unreleased = (schedule.total - schedule.released) as MoneyUnit;
  const fromDeferred = refundAmount < unreleased ? refundAmount : unreleased;
  return { fromDeferred, fromFree: (refundAmount - fromDeferred) as MoneyUnit };
}

/* ───────────────────────────── AR aging ───────────────────────────────── */

export interface ArAging {
  /** Tray totals µ$ in [0–30, 31–60, 61–90, 90+] business days past due. */
  readonly trays: readonly [MoneyUnit, MoneyUnit, MoneyUnit, MoneyUnit];
  readonly openCount: number;
  /** Days-sales-outstanding approximation from tray midpoints (Fixed,
   *  display-grade ratio only — arithmetic stays bigint, §4.1). */
  readonly dsoDays: Fixed;
}

export function arAgingTrays(invoices: readonly Invoice[], atBusinessMin: SimMinute, cfg: EconomyConfig): ArAging {
  const [e1, e2, e3] = cfg.arAging.trayEdgesDays;
  const mid = cfg.arAging.trayMidpointDays;
  const trays: [MoneyUnit, MoneyUnit, MoneyUnit, MoneyUnit] = [0n, 0n, 0n, 0n] as [MoneyUnit, MoneyUnit, MoneyUnit, MoneyUnit];
  let openCount = 0;
  let weightedDays = 0n;
  let total = 0n;
  for (const invoice of invoices) {
    if (invoice.state !== "issued" && invoice.state !== "failed") continue;
    openCount += 1;
    const ageDays = Math.max(0, Math.floor((atBusinessMin - invoice.dueAtMin) / cfg.calendar.minutesPerDay));
    const trayIndex = ageDays <= e1 ? 0 : ageDays <= e2 ? 1 : ageDays <= e3 ? 2 : 3;
    trays[trayIndex] = (trays[trayIndex] + invoice.gross) as MoneyUnit;
    weightedDays += BigInt(mid[trayIndex]!) * invoice.gross;
    total += invoice.gross;
  }
  const dsoDays = total === 0n ? 0n : fromRatio(weightedDays, total);
  return { trays, openCount, dsoDays };
}
