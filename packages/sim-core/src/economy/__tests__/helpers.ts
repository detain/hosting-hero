/** Shared fixtures for the economy test suite (test-only, not exported via
 *  the module barrel). */

import {
  asEntityId,
  asMoney,
  asRunSeed,
  type Contract,
  type EntityId,
  type RunSeed,
  type SimMinute,
  type TickContext,
} from "../../types.js";
import { fromRatio } from "../../kernel/fixed.js";
import { type Invoice, type InvoiceTerms } from "../billing.js";
import { defaultEconomyConfig, type EconomyConfig } from "../config.js";
import { emptyEconomyState, type EconomyState } from "../state.js";

export const SEED: RunSeed = asRunSeed(42n);
export const OTHER_SEED: RunSeed = asRunSeed(1337n);

export const MONTH = 43_200;
export const DAY = 1_440;

export function ctxAt(businessMin: SimMinute, tick: bigint = 0n): TickContext {
  return {
    tick,
    minute: 0,
    clocks: {
      realUs: 0n,
      simUs: 0n,
      businessUs: BigInt(businessMin) * 60_000_000n,
      wallUs: 0n,
    },
  };
}

export function contractOf(id: string, over: Partial<Omit<Contract, "id">> = {}): Contract {
  return {
    id: asEntityId(id),
    customerEntityId: asEntityId(`cust:${id}`),
    bundleId: "shared",
    mrcMicroUsd: asMoney(100_000_000n), // $100/mo
    tcvMicroUsd: asMoney(0n),
    acvMicroUsd: asMoney(0n),
    termStartMin: 0,
    termEndMin: 2 * MONTH,
    billingCycle: "monthly",
    sla: {
      uptimeTarget: fromRatio(999n, 1000n), // 99.9%
      responseBudgetUs: 0n,
      creditRate: 0n,
      creditCap: 0n,
      claimWindowUs: 0n,
      autoRenew: false,
      noticePeriodMin: 0,
      threeBreachExitRight: false,
    },
    routingLocks: [],
    shedImmunityClassId: null,
    allocations: [],
    ...over,
  };
}

/** Neutral-ish tags: colour assertions only care the entry HAS a colour. */
export const TAGS = {
  margin: "green",
  churnRisk: "green",
  term: "blue",
  concentration: "blue",
  abuse: "gold",
} as const;

export function makeInvoice(over: Partial<Invoice> & Pick<Invoice, "id" | "contractId">): Invoice {
  const terms: InvoiceTerms = { netTermsDays: 0, annualPrepay: false };
  return {
    cycleIndex: 0,
    periodStartMin: 0,
    periodEndMin: MONTH,
    issuedAtMin: 0,
    dueAtMin: 0,
    gross: asMoney(100_000_000n),
    fee: asMoney(3_200_000n),
    net: asMoney(96_800_000n),
    state: "issued",
    settledAtMin: null,
    dunningStage: null,
    dunningStageAtMin: null,
    terms,
    unlockScheduleId: null,
    ...over,
  };
}

export function stateWithCash(free: bigint, over: Partial<EconomyState> = {}): EconomyState {
  return {
    ...emptyEconomyState(),
    cash: {
      free: asMoney(free),
      restricted: asMoney(0n),
      deferred: asMoney(0n),
      accountsReceivable: asMoney(0n),
      backlog: asMoney(0n),
      committedOut: asMoney(0n),
    },
    freeAtMonthStart: asMoney(free),
    ...over,
  };
}

/** Deterministic, Map-aware JSON so ×100 replays compare byte-for-byte. */
export function digest(value: unknown): string {
  return JSON.stringify(value, (_k, v: unknown) => {
    if (typeof v === "bigint") return `${v}n`;
    if (v instanceof Map) return [...v.entries()];
    return v;
  })!;
}

export function cfgWith(patch: (cfg: EconomyConfig) => EconomyConfig): EconomyConfig {
  return patch(defaultEconomyConfig());
}
