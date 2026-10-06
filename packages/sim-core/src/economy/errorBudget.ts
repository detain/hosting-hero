/**
 * Error budget as SPENDABLE CURRENCY (MASTER_REPORT §6.1 / §6.16:
 * "the budget is (1 − commitment) × 30 days", "spendable in-combat",
 * "exhaustion locks risky actions", "clean-week refund", "surplus carries
 * across levels").
 *
 * Accounting is in integer SECONDS (bigint): the doc's derived table
 * (§6.16:25629) lands exactly on whole seconds for the fine rows —
 * 99.9% → 2592 s ("43 m"), 99.95% → 1296 s ("21 m 36 s"),
 * 99.99% → 259 s ("4 m 19 s") — and `budgetSecondsFor` floors, matching the
 * doc's floor-style readouts. NOTE (§6.16 internal inconsistency): the two
 * coarse rows (99% "7h18m", 99.5% "3h39m") were computed with a 30.42-day
 * average month; with the §6.16 header's 30-day month they are 7h12m/3h36m.
 * This module follows the header formula; the discrepancy is logged for the
 * owner-tuning pass (OD-2 family).
 *
 * Commitments are basis points (99.9% → 9990): exact integers, never floats.
 * `budgetMinutesFixed` offers the Q16.16 view for display/ratio consumers.
 *
 * Lock law (§6.1): when remaining ≤ 0, RISKY actions (config.riskyActions —
 * risky-deploy, reboot-don't-diagnose) throw; defensive drains (sla-hit,
 * outage) may push the meter NEGATIVE, and negative remaining is the
 * SLA-credit-owed zone ("when you burn it to zero you start paying SLA
 * credits").
 */

import { fromRatio } from "../kernel/fixed.ts";
import { asCauseId, type CauseId, type EntityId, type Fixed, type SimMinute } from "../types.ts";
import { type BudgetSpendAction, type EconomyConfig } from "./config.ts";
import { minutesPerWeek, secondsPerBusinessMonth } from "./config.ts";
import { floorDiv } from "./intMath.ts";

export const ERROR_BUDGET_DOMAIN = "economy/error-budget";

/** Business minutes in one sim month — 43,200 (30 × 1440) per §6.16 header.
 *  SINGLE CONSTANT (OD-2/D-1 discipline): calendar lives in config, this
 *  export is the doc-canonical shortcut. */
export const BUSINESS_MONTH_MINUTES = 43_200;

/** (1 − commitment) × 30 days, in whole seconds, floored. */
export function budgetSecondsFor(commitmentBps: bigint, cfg: EconomyConfig): bigint {
  if (commitmentBps < 0n || commitmentBps > 10_000n) {
    throw new RangeError(`economy/errorBudget: commitment ${commitmentBps} bps outside [0,10000]`);
  }
  const missBps = 10_000n - commitmentBps;
  return (secondsPerBusinessMonth(cfg) * missBps) / 10_000n;
}

/** The same budget as a Fixed number of MINUTES for ratio/display use. */
export function budgetMinutesFixed(commitmentBps: bigint, cfg: EconomyConfig): Fixed {
  const missBps = 10_000n - commitmentBps;
  return fromRatio(BigInt(cfg.calendar.minutesPerMonth) * missBps, 10_000n);
}

export interface ErrorBudgetState {
  readonly contractId: EntityId;
  /** Sold commitment in bps (from Contract.sla.uptimeTarget — parsed to bps
   *  by the orchestrator; Fixed→bps conversion helper below). */
  readonly commitmentBps: bigint;
  readonly monthIndex: number;
  /** Fresh monthly grant (seconds). */
  readonly budgetSec: bigint;
  /** Passive outage drain (SLA-relevant, counts against clean weeks). */
  readonly drainedSec: bigint;
  /** Deliberate player spends (shed/stale/feature-off/deploy...). */
  readonly spentSec: bigint;
  /** Clean-week refunds granted this month. */
  readonly refundedSec: bigint;
  /** Carried-in surplus from the previous month (capped). */
  readonly carryInSec: bigint;
  readonly weekIndex: number;
  /** Drain + spend inside the CURRENT week (clean-week detector). */
  readonly weekConsumedSec: bigint;
}

export function initBudget(
  contractId: EntityId,
  commitmentBps: bigint,
  monthIndex: number,
  atBusinessMin: SimMinute,
  cfg: EconomyConfig,
): ErrorBudgetState {
  return {
    contractId,
    commitmentBps,
    monthIndex,
    budgetSec: budgetSecondsFor(commitmentBps, cfg),
    drainedSec: 0n,
    spentSec: 0n,
    refundedSec: 0n,
    carryInSec: 0n,
    weekIndex: weekIndexOf(atBusinessMin, cfg),
    weekConsumedSec: 0n,
  };
}

/** Absolute business-week index (calendar-derived, month-independent).
 *  bigint floor (E-12) so a `k×week − 1` minute can never float-round to k. */
export function weekIndexOf(atBusinessMin: SimMinute, cfg: EconomyConfig): number {
  return floorDiv(atBusinessMin, minutesPerWeek(cfg));
}

/** Fixed uptime (e.g. 0.999) → bps, rounded half-away-from-zero (same
 *  discipline as scaleMoney/fixed.ts). Boundary parse. */
export function commitmentBpsOf(uptimeTarget: Fixed): bigint {
  const scaled = (uptimeTarget * 10_000n * 2n + 65_536n) / (65_536n * 2n);
  if (scaled < 0n || scaled > 10_000n) {
    throw new RangeError(`economy/errorBudget: uptime target raw ${uptimeTarget} out of [0,1] as bps`);
  }
  return scaled;
}

/** Remaining budget; negative = the SLA-credit-owed zone (§6.1). */
export function remainingSec(state: ErrorBudgetState): bigint {
  return state.budgetSec + state.carryInSec + state.refundedSec - state.drainedSec - state.spentSec;
}

/** True while risky verbs are locked (§6.1 exhaustion lock). */
export function exhaustionLockActive(state: ErrorBudgetState): boolean {
  return remainingSec(state) <= 0n;
}

export class RiskyActionLockedError extends Error {
  constructor(action: BudgetSpendAction, contractId: EntityId, remaining: bigint) {
    super(
      `economy/errorBudget: '${action}' locked on '${contractId}' — budget exhausted ` +
        `(remaining ${remaining}s ≤ 0; risky actions need headroom, §6.1). ` +
        `Defensive moves only until a clean-week refund or month roll.`,
    );
    this.name = "RiskyActionLockedError";
  }
}

/** The deliberate-spend API. `seconds` overrides the config flat cost
 *  (needed for computed sla-hit charges); pass null for the table value. */
export function spend(
  state: ErrorBudgetState,
  action: BudgetSpendAction,
  seconds: bigint | null,
  cfg: EconomyConfig,
  causeId: CauseId,
): ErrorBudgetState {
  void causeId; // attribution is the CALLER's ledger duty; kept in-signature so no spend can forget it (P10)
  const cost = seconds ?? cfg.errorBudget.spendSecs[action];
  if (cost < 0n) throw new RangeError(`economy/errorBudget: negative spend cost ${cost}s for '${action}'`);
  const risky = cfg.errorBudget.riskyActions.includes(action);
  if (risky && exhaustionLockActive(state)) {
    throw new RiskyActionLockedError(action, state.contractId, remainingSec(state));
  }
  return {
    ...state,
    spentSec: state.spentSec + cost,
    weekConsumedSec: state.weekConsumedSec + cost,
  };
}

/** Passive outage drain (SLA breach seconds from the ops side). Never locked:
 *  reality does not ask permission; it may tip the meter negative. */
export function drainOutage(state: ErrorBudgetState, seconds: bigint, causeId: CauseId): ErrorBudgetState {
  void causeId;
  if (seconds < 0n) throw new RangeError(`economy/errorBudget: negative outage drain ${seconds}s`);
  if (seconds === 0n) return state;
  return { ...state, drainedSec: state.drainedSec + seconds, weekConsumedSec: state.weekConsumedSec + seconds };
}

/** One granted refund, anchored to the week it pays for (E-9): the cause id
 *  pins the CLOSED week index, so every grant in a catch-up loop stays
 *  individually attributable and replay-stable. */
export interface WeekRefund {
  readonly closedWeekIndex: number;
  readonly seconds: bigint;
  readonly causeId: CauseId;
}

export interface WeekRollResult {
  readonly state: ErrorBudgetState;
  /** Total refund granted for the closed window (0 = none). */
  readonly refundGrantedSec: bigint;
  /** One entry per closed clean week — empty unless the whole window was
   *  provably clean (zero consumption across every skipped week, §6.1). */
  readonly refunds: readonly WeekRefund[];
}

/** Call when the business week index advances: a week that closed with zero
 *  consumption refunds config.cleanWeekRefundSec ("a small refund", §6.1).
 *  A paused clock can close SEVERAL weeks between calls (E-9, mirroring the
 *  tick's month catch-up loop): cleanliness is only provable for the whole
 *  window when consumption stayed zero, so a clean window grants one refund
 *  per closed week; any consumption in the window grants none (conservative,
 *  matching the single-week rule). */
export function rollWeek(state: ErrorBudgetState, nowWeekIndex: number, cfg: EconomyConfig): WeekRollResult {
  if (nowWeekIndex <= state.weekIndex) return { state, refundGrantedSec: 0n, refunds: [] };
  const clean = state.weekConsumedSec === 0n;
  const refunds: WeekRefund[] = [];
  if (clean) {
    for (let closed = state.weekIndex; closed < nowWeekIndex; closed += 1) {
      refunds.push({
        closedWeekIndex: closed,
        seconds: cfg.errorBudget.cleanWeekRefundSec,
        causeId: asCauseId(`${ERROR_BUDGET_DOMAIN}:clean-week:${state.contractId}:w${closed}`),
      });
    }
  }
  const total = cfg.errorBudget.cleanWeekRefundSec * BigInt(refunds.length);
  return {
    state: {
      ...state,
      weekIndex: nowWeekIndex,
      weekConsumedSec: 0n,
      refundedSec: state.refundedSec + total,
    },
    refundGrantedSec: total,
    refunds,
  };
}

/** Month rollover: bank the surplus (capped by carryCapBps of the monthly
 *  grant — "surplus carries across levels", §6.1/§6.14) and re-grant. */
export interface MonthRollResult {
  readonly state: ErrorBudgetState;
  readonly carryOutSec: bigint;
}

export function rollMonth(
  state: ErrorBudgetState,
  nowMonthIndex: number,
  atBusinessMin: SimMinute,
  cfg: EconomyConfig,
): MonthRollResult {
  if (nowMonthIndex <= state.monthIndex) {
    return { state, carryOutSec: 0n };
  }
  const remaining = remainingSec(state);
  const cap = (state.budgetSec * cfg.errorBudget.carryCapBps) / 10_000n;
  const carryOut = remaining > 0n ? (remaining > cap ? cap : remaining) : 0n;
  return {
    state: {
      ...state,
      monthIndex: nowMonthIndex,
      budgetSec: budgetSecondsFor(state.commitmentBps, cfg),
      drainedSec: 0n,
      spentSec: 0n,
      refundedSec: 0n,
      carryInSec: carryOut,
      weekIndex: weekIndexOf(atBusinessMin, cfg),
      weekConsumedSec: 0n,
    },
    carryOutSec: carryOut,
  };
}

/** Seconds the meter is in the red — the SLA credit pool the rules layer
 *  converts to money via Contract.sla.creditRate (data hand-off). */
export function slaCreditOwedSec(state: ErrorBudgetState): bigint {
  const remaining = remainingSec(state);
  return remaining < 0n ? -remaining : 0n;
}
