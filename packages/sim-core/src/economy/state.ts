/**
 * EconomyState — the GameState-attached ledger aggregate (MASTER_REPORT
 * §4.4 C5: "double-entry is SIM STATE computed in-core at step 12; MySQL is
 * a notary, not the ledger").
 *
 * One immutable-by-convention value per tick, holding: the six-bucket cash
 * stack, the append-only journal (every entry cause-stamped — P10), the
 * per-contract economy records, invoices, unlock schedules, the MFN queue,
 * ghosted churn forecasts, per-contract error budgets, and the runway/death-
 * spiral readout. Maps are rebuilt in EntityId-sorted order (CONVENTIONS:
 * iteration order must be declared, never insertion-accidental).
 */

import {
  asMoney,
  emptyMoneyBuckets,
  type Contract,
  type EntityId,
  type MoneyBuckets,
  type MoneyUnit,
  type SimMinute,
} from "../types.ts";
import { MICROS_PER_MIN } from "../kernel/time.ts";
import type { Journal } from "./ledger.ts";
import { emptyJournal } from "./ledger.ts";
import type { Invoice, InvoiceTerms, UnlockSchedule } from "./billing.ts";
import {
  openContractEconomy,
  type ContractEconomy,
  type GrandfatherLock,
  type MfnRepriceEvent,
  type RevenueColourTags,
} from "./contract.ts";
import type { GhostedForecast } from "./churn.ts";
import { initBudget, type ErrorBudgetState } from "./errorBudget.ts";
import { initialDeathSpiralState, type DeathSpiralState } from "./runway.ts";
import { floorDiv } from "./intMath.ts";
import { daysToMinutes, type EconomyConfig } from "./config.ts";

export interface EconomyState {
  readonly cash: MoneyBuckets;
  readonly journal: Journal;
  readonly contractEconomy: ReadonlyMap<EntityId, ContractEconomy>;
  /** Insertion order == generation order (sorted contracts per tick). */
  readonly invoices: readonly Invoice[];
  readonly unlockSchedules: readonly UnlockSchedule[];
  readonly mfnQueue: readonly MfnRepriceEvent[];
  readonly forecasts: readonly GhostedForecast[];
  readonly errorBudgets: ReadonlyMap<EntityId, ErrorBudgetState>;
  readonly spiral: DeathSpiralState;
  /** Business month the state is parked in (floor(businessMin / 43200)). */
  readonly monthIndex: number;
  /** Free cash when the current month opened (runway burn tracker). */
  readonly freeAtMonthStart: MoneyUnit;
  /** Net free-cash burn of the last CLOSED month; null until month 1 ends. */
  readonly lastClosedBurn: MoneyUnit | null;
  /** Credit-line draw flag for the running month (finance module writes via
   *  input; consumed at month roll for the spiral detector). */
  readonly creditDrawnThisMonth: boolean;
  /** Lose-slowly guard latch (§9.6): set once the ≥3-real-minute warning
   *  lead is provably blown; scenario code must surface it, never clear it. */
  readonly loseSlowlyViolated: boolean;
  /** When the runway tone first left "normal" (guard lead-time anchor). */
  readonly warnedAtBusinessMin: SimMinute | null;
  readonly lastBusinessMin: SimMinute | null;
}

export function emptyEconomyState(): EconomyState {
  return {
    cash: emptyMoneyBuckets(),
    journal: emptyJournal,
    contractEconomy: new Map(),
    invoices: [],
    unlockSchedules: [],
    mfnQueue: [],
    forecasts: [],
    errorBudgets: new Map(),
    spiral: initialDeathSpiralState,
    monthIndex: 0,
    freeAtMonthStart: asMoney(0n),
    lastClosedBurn: null,
    creditDrawnThisMonth: false,
    loseSlowlyViolated: false,
    warnedAtBusinessMin: null,
    lastBusinessMin: null,
  };
}

/** Business-minute of the clock triple (kernel has simMinuteOf; the macro
 *  clock minute is economy-owned until the kernel grows one). */
export function businessMinuteOf(clocks: { readonly businessUs: bigint }): SimMinute {
  const minute = clocks.businessUs / MICROS_PER_MIN;
  if (minute > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new RangeError(`economy/state: business clock ${clocks.businessUs}µs exceeds safe minute range`);
  }
  return Number(minute);
}

export function monthIndexOf(businessMin: SimMinute, cfg: EconomyConfig): number {
  // bigint floor division (E-12): float `x/43200` could round k−1/43200 up
  // to k and fire a month roll a full period early.
  const month = floorDiv(businessMin, cfg.calendar.minutesPerMonth);
  if (month < 0) {
    throw new RangeError(`economy/state: cannot index month of business minute ${businessMin}`);
  }
  return month;
}

/** Neutral tag set for un-primed contracts (auto-prime guard in the tick). */
export const NEUTRAL_REVENUE_TAGS: RevenueColourTags = {
  margin: "blue",
  churnRisk: "blue",
  term: "blue",
  concentration: "blue",
  abuse: "blue",
};

export interface RegisterContractInput {
  readonly contract: Contract;
  readonly atBusinessMin: SimMinute;
  readonly clauseRefs: readonly string[];
  readonly grandfather: GrandfatherLock | null;
  readonly revenueTags: RevenueColourTags;
  readonly commitmentBps: bigint;
}

/** Orchestrator-side priming: creates the ContractEconomy + error-budget
 *  records for a shared Contract BEFORE the tick auto-primes defaults. */
export function registerContractEconomy(
  state: EconomyState,
  input: RegisterContractInput,
  cfg: EconomyConfig,
): EconomyState {
  if (state.contractEconomy.has(input.contract.id)) {
    throw new Error(`economy/state: '${input.contract.id}' already registered`);
  }
  const econ = openContractEconomy(
    {
      contract: input.contract,
      atBusinessMin: input.atBusinessMin,
      clauseRefs: input.clauseRefs,
      grandfather: input.grandfather,
      revenueTags: input.revenueTags,
    },
    cfg,
  );
  const budget = initBudget(
    input.contract.id,
    input.commitmentBps,
    monthIndexOf(input.atBusinessMin, cfg),
    input.atBusinessMin,
    cfg,
  );
  return {
    ...state,
    contractEconomy: sortedById(state.contractEconomy, { contractId: econ.contractId }, econ),
    errorBudgets: sortedById(state.errorBudgets, { contractId: budget.contractId }, budget),
  };
}

/** Renewal-window pulse open minute for a term (§6.4: 90 d before end). */
export function pulseOpenMinFor(termEndMin: SimMinute, cfg: EconomyConfig): SimMinute {
  return termEndMin - daysToMinutes(cfg, cfg.contracts.renewalPulseLeadDays);
}

/** Default invoice terms when the deal carries none (PROVISIONAL §6.4):
 *  card-cycled consumer plans auto-pay at issue (net-0); annual deals are
 *  invoiced with the config default terms + the net-75 slip. */
export function defaultTermsFor(contract: Contract, cfg: EconomyConfig): InvoiceTerms {
  return {
    netTermsDays: contract.billingCycle === "annual" ? cfg.billing.defaultNetTermsDays : 0,
    annualPrepay: contract.billingCycle === "annual",
  };
}

/** Rebuild a Map in EntityId-sorted order after inserting/replacing one. */
export function sortedById<V>(
  source: ReadonlyMap<EntityId, V>,
  replace: { readonly contractId: EntityId } | null,
  value?: V,
): ReadonlyMap<EntityId, V> {
  const next = new Map<EntityId, V>(source);
  if (replace !== null) {
    if (value === undefined) throw new RangeError("economy/state: sortedById replace needs a value");
    next.set(replace.contractId, value);
  }
  return new Map([...next.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)));
}

export function sortedEntityIds(ids: Iterable<EntityId>): readonly EntityId[] {
  return [...ids].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}
