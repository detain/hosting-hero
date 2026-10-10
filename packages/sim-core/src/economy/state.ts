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
import {
  initialDeathSpiralState,
  type Covenant,
  type CovenantBreachRecord,
  type DeathSpiralState,
} from "./runway.ts";
import { initialReputationLedger, type ReputationLedger } from "./reputation.ts";
import type {
  CompanyDeathRecord,
  DeathWarningRecord,
  DeathWatch,
} from "./death.ts";
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
  /** §2.10/§5.10 company reputation score (audit g17 #2 producer). The tick
   *  folds this-tick signals and publishes the observed cell on change. */
  readonly reputation: ReputationLedger;
  /** The bank's card the host primed (audit g19 #2 consumer input). Empty
   *  array = no covenants = evaluation is a structural no-op. */
  readonly covenants: readonly Covenant[];
  /** Covenants breached at the LAST month roll (the edge-detect latch: a
   *  recovered covenant leaves this set and a relapse fires again). */
  readonly breachedCovenantIds: readonly string[];
  /** Append-only breach history (§5.10-style permanent record; OD-25: data
   *  only — posture/game-over semantics stay owner-open). */
  readonly covenantBreachLog: readonly CovenantBreachRecord[];
  /** The `committedOut` bucket total the last vendor-commit recompute
   *  produced (audit g15 #2 writer bookkeeping; 0n until a host supplies
   *  commitments, so delta math is exactly zero for every existing run). */
  readonly committedOutTarget: MoneyUnit;
  /** OD-25(a) death-watch counters (economy/death.ts). The key is ABSENT
   *  while every spell is idle — existing hosts' serialization shape never
   *  changes until a death path actually starts running. */
  readonly deathWatch?: DeathWatch | undefined;
  /** DEATH NOTICE phase (§9.6): one canonical cause armed, dissolution
   *  projected at the next still-armed fold. ESCAPABLE — recovery before
   *  then lifts this and the watch restarts from zero. */
  readonly deathWarning?: DeathWarningRecord | undefined;
  /** DISSOLVED terminal record (OD-25(a)): once set, `runEconomyTick` is a
   *  no-op-preserve — no settle, no MRR accrual, no throw. The endings/
   *  HUD lane reads `companyDeath.cause` to pick the epilogue. */
  readonly companyDeath?: CompanyDeathRecord | undefined;
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
    reputation: initialReputationLedger(),
    covenants: [],
    breachedCovenantIds: [],
    covenantBreachLog: [],
    committedOutTarget: asMoney(0n),
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
  /** OD-24(a): pricing classification for the override book (see
   *  OpenContractInput.priceKey). Sparse — absent keeps records byte-ident. */
  readonly priceKey?: string;
}

/** The single choke-point every registration folds through: per-entry side
 *  effects are EXACTLY these two constructions in this order (open validates
 *  the term, initBudget validates the commitment) — single and batch share
 *  the body so their error families, messages, and record bytes can never
 *  drift apart. */
function buildRegistration(
  input: RegisterContractInput,
  cfg: EconomyConfig,
): { readonly econ: ContractEconomy; readonly budget: ErrorBudgetState } {
  const econ = openContractEconomy(
    {
      contract: input.contract,
      atBusinessMin: input.atBusinessMin,
      clauseRefs: input.clauseRefs,
      grandfather: input.grandfather,
      revenueTags: input.revenueTags,
      ...(input.priceKey === undefined ? {} : { priceKey: input.priceKey }),
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
  return { econ, budget };
}

function alreadyRegistered(id: EntityId): Error {
  return new Error(`economy/state: '${id}' already registered`);
}

/** Orchestrator-side priming: creates the ContractEconomy + error-budget
 *  records for a shared Contract BEFORE the tick auto-primes defaults. */
export function registerContractEconomy(
  state: EconomyState,
  input: RegisterContractInput,
  cfg: EconomyConfig,
): EconomyState {
  if (state.contractEconomy.has(input.contract.id)) {
    throw alreadyRegistered(input.contract.id);
  }
  const { econ, budget } = buildRegistration(input, cfg);
  return {
    ...state,
    contractEconomy: sortedById(state.contractEconomy, { contractId: econ.contractId }, econ),
    errorBudgets: sortedById(state.errorBudgets, { contractId: budget.contractId }, budget),
  };
}

/**
 * BATCH PRIME (owner-ratified 2026-10-09, ADR-0009): register every input
 * atomically — the output is BYTE-IDENTICAL to folding `registerContractEconomy`
 * over the same sequence in the same order, at O(n + m log m) instead of the
 * chained merge-inserts' O(n·m). A 1,000-contract bootstrap was the audit's
 * hottest orchestrator path; this is its fix.
 *
 * Laws (pinned by __tests__/batch-register.test.ts):
 * - Validate-then-build per entry IN ORDER (duplicate check first, exactly
 *   as the single path orders it), so a failing batch throws the SAME error
 *   the chain would have thrown at the same position, with the input state
 *   untouched (nothing mutates; the fold's result simply never forms).
 * - Duplicate ids — against `state.contractEconomy` or within `inputs` —
 *   throw the single path's `economy/state: '<id>' already registered`.
 * - Empty batch returns `state` by identity (===), the fold's neutral element.
 * - The merge replaces an id that already sits in `errorBudgets` while absent
 *   from `contractEconomy` (twin-map skew is legal — the dup wall guards only
 *   the econ map) position-preserving with the new value, mirroring
 *   `sortedById`'s in-place arm.
 */
export function registerContractsEconomy(
  state: EconomyState,
  inputs: readonly RegisterContractInput[],
  cfg: EconomyConfig,
): EconomyState {
  if (inputs.length === 0) return state;
  const econRows: [EntityId, ContractEconomy][] = [];
  const budgetRows: [EntityId, ErrorBudgetState][] = [];
  const planned = new Set<EntityId>();
  for (const input of inputs) {
    const id = input.contract.id;
    if (state.contractEconomy.has(id) || planned.has(id)) throw alreadyRegistered(id);
    planned.add(id);
    const { econ, budget } = buildRegistration(input, cfg);
    econRows.push([id, econ]);
    budgetRows.push([id, budget]);
  }
  const byIdAsc = (a: readonly [EntityId, unknown], b: readonly [EntityId, unknown]): number =>
    a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;
  econRows.sort(byIdAsc);
  budgetRows.sort(byIdAsc);
  return {
    ...state,
    contractEconomy: mergeSortedById(state.contractEconomy, econRows),
    errorBudgets: mergeSortedById(state.errorBudgets, budgetRows),
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

/** Codepoint-ascending key order? One pass, early exit on the first inversion. */
function isIdSorted(source: ReadonlyMap<EntityId, unknown>): boolean {
  let previous: EntityId | null = null;
  for (const id of source.keys()) {
    if (previous !== null && previous > id) return false;
    previous = id;
  }
  return true;
}

function sortEntries<V>(rows: Iterable<readonly [EntityId, V]>): Map<EntityId, V> {
  return new Map([...rows].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)));
}

/**
 * Rebuild a Map in EntityId-sorted order after inserting/replacing one.
 *
 * PERF LANE: the old body was copy → set → expand-to-array → sort on EVERY
 * call, so a register loop over N contracts cost O(N² log N) — the profile
 * on a 1,000-contract setup showed it as the single hottest function in the
 * process (267ms self, entirely OUTSIDE the measured tick: this is the
 * orchestrator bootstrap path, not tick behaviour). Result is byte-identical
 * for EVERY input, sorted or not: on a sorted source the answer is a
 * position-preserving overwrite, a merge-insert, or a plain clone; only a
 * detected inversion falls back to the old copy-and-full-sort.
 */
export function sortedById<V>(
  source: ReadonlyMap<EntityId, V>,
  replace: { readonly contractId: EntityId } | null,
  value?: V,
): ReadonlyMap<EntityId, V> {
  if (!isIdSorted(source)) {
    const copy = new Map<EntityId, V>(source);
    if (replace !== null) {
      if (value === undefined) throw new RangeError("economy/state: sortedById replace needs a value");
      copy.set(replace.contractId, value);
    }
    return sortEntries(copy);
  }
  if (replace === null) return new Map(source);
  if (value === undefined) throw new RangeError("economy/state: sortedById replace needs a value");
  const id = replace.contractId;
  if (source.has(id)) return new Map(source).set(id, value);
  const next = new Map<EntityId, V>();
  let merged = false;
  for (const [existingId, existing] of source) {
    if (!merged && id < existingId) {
      next.set(id, value);
      merged = true;
    }
    next.set(existingId, existing);
  }
  if (!merged) next.set(id, value);
  return next;
}

/**
 * Fold `newcomers` (ALREADY EntityId-ascending, ids deduped by the caller)
 * into `source` in one O(n + m) merge pass — the batch half of
 * {@link registerContractsEconomy}, replacing m chained {@link sortedById}
 * shift-inserts. Insertion order of the result is strictly ascending, so the
 * Map's iteration order equals any chain of single inserts (digests see Map
 * order). A newcomer whose id already sits in `source` lands at SOURCE's
 * position with the NEWCOMER's value — `Map.set` keeps first-insert position
 * and the trailing overwrite carries the new value, exactly the in-place arm
 * of {@link sortedById}. An unsorted `source` falls back to the full sort,
 * the same recovery {@link sortedById} performs per call.
 */
function mergeSortedById<V>(
  source: ReadonlyMap<EntityId, V>,
  newcomers: readonly (readonly [EntityId, V])[],
): ReadonlyMap<EntityId, V> {
  if (!isIdSorted(source)) {
    return sortEntries(new Map<EntityId, V>([...source, ...newcomers]));
  }
  const next = new Map<EntityId, V>();
  let at = 0;
  for (const [existingId, existing] of source) {
    while (at < newcomers.length && newcomers[at]![0] < existingId) {
      next.set(newcomers[at]![0], newcomers[at]![1]);
      at += 1;
    }
    next.set(existingId, existing);
  }
  for (; at < newcomers.length; at += 1) next.set(newcomers[at]![0], newcomers[at]![1]);
  return next;
}

export function sortedEntityIds(ids: Iterable<EntityId>): readonly EntityId[] {
  return [...ids].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}
