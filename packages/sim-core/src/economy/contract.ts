/**
 * Contract-economy objects — the commercial half of "contract-as-tower"
 * (MASTER_REPORT §4.4, hosting_game.md §6.12 clause table).
 *
 * `types.ts` owns the shared `Contract` value object; this file wraps it with
 * the economy-owned lifecycle the shared contract deliberately does not carry:
 *  - term structure + renewal cliff / renewal-window pulse (90 d lead, §6.4)
 *  - annual escalators and grandfathered-price locks (§6.12)
 *  - SLA clauses as DATA REFS into the clause table (P13: the clause list is
 *    a hook other systems read; nothing here interprets legal text)
 *  - revenue-colour tags: margin / churn-risk / term / concentration / abuse
 *    ("colour tags on every dollar", §4.4; "valuation reads the bar, not the
 *    number")
 *  - MFN repricing events queued with a lag-table delay ("MFN reprices 3
 *    levels later", §7.15).
 *
 * Every function is pure (Law 3): lifecycle transitions return new records
 * and the ledger postings they imply, never mutate.
 */

import {
  asCauseId,
  asMoney,
  type CauseId,
  type Contract,
  type EntityId,
  type MoneyUnit,
  type RevenueQualityBand,
  type SimMinute,
} from "../types.ts";
import { ratioFromBps, scaleMoney, type MoneyRatio } from "./money.ts";
import { floorDiv, roundDiv } from "./intMath.ts";
import { daysToMinutes, type EconomyConfig } from "./config.ts";

/* ─────────────────────── SLA clause table (P13 data refs) ─────────────── */

/** The 13-clause tower table (§6.12 "every concession writes a permanent
 *  line"). Economy stores only the IDS; legal semantics belong to the
 *  ruleset cards that consume these refs. */
export const SLA_CLAUSE_IDS = [
  "liability-cap",
  "sla-credit-cap",
  "claim-window",
  "maintenance-exclusion",
  "auto-renew",
  "annual-escalator",
  "power-pass-through",
  "mfn",
  "audit-right",
  "consent-to-assignment",
  "etf",
  "deposit-or-loc",
  "notice-period",
] as const;
export type SlaClauseId = (typeof SLA_CLAUSE_IDS)[number];

const KNOWN_CLAUSES: ReadonlySet<string> = new Set<string>(SLA_CLAUSE_IDS);

/** Boundary parse (Law 2): reject clause ids outside the table, loudly. */
export function parseClauseRefs(refs: readonly string[]): readonly SlaClauseId[] {
  return refs.map((ref) => {
    if (!KNOWN_CLAUSES.has(ref)) {
      throw new RangeError(`economy/contract: unknown SLA clause '${ref}' (P13 table is SLA_CLAUSE_IDS)`);
    }
    return ref as SlaClauseId;
  });
}

/* ─────────────────────────── price modifiers ──────────────────────────── */

export interface Escalator {
  /** Percent bump applied on each anniversary, basis points (3% → 300) —
   *  LIVE default §6.12. */
  readonly annualBps: bigint;
  /** First anniversary (term-years) the bump applies at — PROVISIONAL (1). */
  readonly firstApplicationYear: number;
}

export interface GrandfatherLock {
  /** Price locked while `now <= lockedThroughMin` ("permanent line", §6.12). */
  readonly lockedMrc: MoneyUnit;
  readonly lockedThroughMin: SimMinute;
}

/* ───────────────────────── revenue colour tags ────────────────────────── */

/** Five tag axes (§4.4: term remaining, margin, cost-to-serve≈abuse, source/
 *  concentration, payment-method≈churn-risk). Bands ordered best→worst. */
export interface RevenueColourTags {
  readonly margin: RevenueQualityBand;
  readonly churnRisk: RevenueQualityBand;
  readonly term: RevenueQualityBand;
  readonly concentration: RevenueQualityBand;
  readonly abuse: RevenueQualityBand;
}

const BAND_SEVERITY: readonly RevenueQualityBand[] = ["gold", "green", "blue", "amber", "red"];

/** The bar the valuation reads: worst tag wins (§4.4). */
export function revenueBar(tags: RevenueColourTags): RevenueQualityBand {
  const axes = [tags.margin, tags.churnRisk, tags.term, tags.concentration, tags.abuse];
  let worst = BAND_SEVERITY[0]!;
  for (const axis of axes) {
    if (BAND_SEVERITY.indexOf(axis) > BAND_SEVERITY.indexOf(worst)) worst = axis;
  }
  return worst;
}

/** Band a basis-point "badness" reading (higher = worse) against four
 *  ascending edges. Edges are PROVISIONAL colour-dial stops. */
export function bandFromBps(value: bigint, edges: readonly [bigint, bigint, bigint, bigint]): RevenueQualityBand {
  const [goldMax, greenMax, blueMax, amberMax] = edges;
  if (value <= goldMax) return "gold";
  if (value <= greenMax) return "green";
  if (value <= blueMax) return "blue";
  if (value <= amberMax) return "amber";
  return "red";
}

/** Term-remaining band: long term = good revenue (inverse of badness).
 *  Edges in business months — PROVISIONAL. */
export function bandFromTermMonths(monthsRemaining: number): RevenueQualityBand {
  if (monthsRemaining >= 24) return "gold";
  if (monthsRemaining >= 12) return "green";
  if (monthsRemaining >= 6) return "blue";
  if (monthsRemaining >= 1) return "amber";
  return "red";
}

/* ─────────────────────────── contract lifecycle ───────────────────────── */

export type ContractPhase = "pending" | "active" | "suspended" | "terminated";

export interface ContractEconomy {
  readonly contractId: EntityId;
  readonly phase: ContractPhase;
  /** Economy-owned mirror of the current term end (advanced on renewal so
   *  the cliff fires exactly on the business tick without waiting for the
   *  orchestrator to re-bind the shared Contract). */
  readonly termEndMin: SimMinute;
  /** Signed business-minute when the invoice cycle grid starts (defaults to
   *  Contract.termStartMin; renewals roll it forward). */
  readonly cycleAnchorMin: SimMinute;
  /** Cycles already invoiced (cycle grid index, monotonic per contract). */
  readonly invoicedCycles: number;
  /** Renewal pulse opened (90 d window, once per term) — §6.4. */
  readonly renewalPulseOpened: boolean;
  /** The cliff at termEndMin has fired exactly once for the current term. */
  readonly cliffFired: boolean;
  readonly phaseEnteredAtMin: SimMinute;
  /** Bumps applied at past anniversaries (escalator bookkeeping). */
  readonly escalationsApplied: number;
  readonly grandfather: GrandfatherLock | null;
  readonly clauseRefs: readonly SlaClauseId[];
  /** True while an "mfn" clause is in effect. */
  readonly mfnActive: boolean;
  /** Active MFN discount floor, bps off list — set when a queued reprice
   *  fires; billedMrc subtracts it from price (§7.15). */
  readonly mfnDiscountBps: bigint;
  readonly revenueTags: RevenueColourTags;
  /** Months the current term spans (renewal-cliff retention lookup). */
  readonly termMonths: number;
  /** Suspended since (dunning dial), for the suspension-clock readout. */
  readonly suspendedAtMin: SimMinute | null;
  /** §6.13 MRR backlog ("the gap between TCV and Billing MRR"): the not-yet-
   *  invoiced share of this contract's promise, mirrored from the `backlog`
   *  cash bucket so the cash view and the contract view can never disagree.
   *  0n for everything except signed-but-not-started (pending) deals; the
   *  tick drains it into AR as invoices issue and unwinds the remainder on
   *  termination. */
  readonly backlogRemaining: MoneyUnit;
  /** Business minute the tick posted this contract's backlog credit (null =
   *  not yet posted) — the once-only posting stamp. */
  readonly backlogPostedAtMin: SimMinute | null;
}

export interface OpenContractInput {
  readonly contract: Contract;
  readonly atBusinessMin: SimMinute;
  readonly clauseRefs: readonly string[];
  readonly grandfather: GrandfatherLock | null;
  readonly revenueTags: RevenueColourTags;
  readonly mfnActive?: boolean;
}

/** Parse-and-trust constructor (Law 2): validates term geometry once. */
export function openContractEconomy(input: OpenContractInput, cfg: EconomyConfig): ContractEconomy {
  const { contract } = input;
  if (contract.termEndMin <= contract.termStartMin) {
    throw new RangeError(
      `economy/contract: '${contract.id}' term ends (${contract.termEndMin}) at/before start (${contract.termStartMin})`,
    );
  }
  // Hourly contracts may span a fractional month; termMonths rounds to 0 and
  // the renewal lookup falls back to its PROVISIONAL default. Half-up round
  // in bigint (E-12) — no float can nudge a k−ε quotient to k.
  const termMonths = roundDiv(contract.termEndMin - contract.termStartMin, cfg.calendar.minutesPerMonth);
  // Signed-but-not-started (§6.13): a deal whose service grid opens in the
  // FUTURE is PENDING — its value sits in backlog, not in billable anything.
  // A contract signed at-or-after its start keeps today's behavior exactly
  // (every existing host registers that way, so no digest moves). The invoice
  // calendar already refuses to bill before cycleAnchorMin (= termStartMin),
  // so pending additionally gains only the churn/cliff skips (both gate on
  // phase === "active") — which is the honest reading: you cannot churn or
  // lapse out of a service that has not started.
  const startsInTheFuture = contract.termStartMin > input.atBusinessMin;
  // Backlog seed: TCV when the deal states one (§6.13 "enormous colo/GPU");
  // otherwise mrc × whole term months as the documented estimate.
  const backlogSeed = startsInTheFuture
    ? contract.tcvMicroUsd > 0n
      ? contract.tcvMicroUsd
      : asMoney(contract.mrcMicroUsd * BigInt(Math.max(1, termMonths)))
    : asMoney(0n);
  return {
    contractId: contract.id,
    phase: startsInTheFuture ? "pending" : "active",
    termEndMin: contract.termEndMin,
    cycleAnchorMin: contract.termStartMin,
    invoicedCycles: 0,
    renewalPulseOpened: false,
    cliffFired: false,
    phaseEnteredAtMin: input.atBusinessMin,
    escalationsApplied: 0,
    grandfather: input.grandfather,
    clauseRefs: parseClauseRefs(input.clauseRefs),
    mfnActive: input.mfnActive ?? hasClause(input.clauseRefs, "mfn"),
    mfnDiscountBps: 0n,
    revenueTags: input.revenueTags,
    termMonths,
    suspendedAtMin: null,
    backlogRemaining: backlogSeed,
    backlogPostedAtMin: null,
  };
}

export function hasClause(refs: readonly string[], clause: SlaClauseId): boolean {
  return refs.includes(clause);
}

/** The phase transition helper (Law 3: returns the new record).
 *  Allowed edges are enforced here — illegal transitions fail loud. */
const PHASE_EDGES: Readonly<Record<ContractPhase, readonly ContractPhase[]>> = {
  pending: ["active", "terminated"],
  active: ["suspended", "terminated"],
  suspended: ["active", "terminated"],
  terminated: [],
};

export function setPhase(
  econ: ContractEconomy,
  next: ContractPhase,
  atBusinessMin: SimMinute,
): ContractEconomy {
  if (!PHASE_EDGES[econ.phase].includes(next)) {
    throw new Error(`economy/contract: illegal phase edge '${econ.phase}' → '${next}' on '${econ.contractId}'`);
  }
  return {
    ...econ,
    phase: next,
    phaseEnteredAtMin: atBusinessMin,
    suspendedAtMin: next === "suspended" ? atBusinessMin : next === "active" ? null : econ.suspendedAtMin,
  };
}

/* ───────────────────────── pricing composition ────────────────────────── */

/** Whole anniversaries elapsed since the cycle anchor (E-12: one bigint
 *  floor over the year period — the float two-step could double-round). */
export function termYearsElapsed(econ: ContractEconomy, atBusinessMin: SimMinute, cfg: EconomyConfig): number {
  const minutesPerYear = cfg.calendar.minutesPerMonth * cfg.calendar.monthsPerYear;
  return Math.max(0, floorDiv(atBusinessMin - econ.cycleAnchorMin, minutesPerYear));
}

/**
 * Billed MRC for the cycle starting at `periodStartMin` (grandfather beats
 * escalator beats base; MFN discount applies on top, §6.12):
 *   base → ×(1 + escalator)^years → grandfathered override → ×(1 − mfnDiscount)
 * Exact bigint ratio math; "each concession writes a permanent line" —
 * escalator applications are counted, never recomputed from floats.
 */
export function billedMrc(
  contract: Contract,
  econ: ContractEconomy,
  periodStartMin: SimMinute,
  escalator: Escalator | null,
  mfnDiscountBps: bigint,
  cfg: EconomyConfig,
): MoneyUnit {
  let amount: MoneyUnit = contract.mrcMicroUsd;
  const yearsAt = Math.max(
    0,
    floorDiv(periodStartMin - econ.cycleAnchorMin, cfg.calendar.minutesPerMonth * cfg.calendar.monthsPerYear),
  );
  if (escalator !== null && yearsAt >= escalator.firstApplicationYear) {
    const bumps = yearsAt - escalator.firstApplicationYear + 1;
    const ratio: MoneyRatio = ratioFromBps(10_000n + escalator.annualBps);
    for (let bump = 0; bump < bumps; bump += 1) {
      amount = scaleMoney(amount, ratio, `escalator on '${contract.id}'`);
    }
  }
  if (econ.grandfather !== null && periodStartMin <= econ.grandfather.lockedThroughMin) {
    amount = econ.grandfather.lockedMrc;
  }
  if (mfnDiscountBps > 0n) {
    amount = scaleMoney(
      amount,
      { num: 10_000n - mfnDiscountBps, den: 10_000n },
      `mfn '${contract.id}' −${mfnDiscountBps}bps`,
    );
  }
  return amount;
}

/* ───────────────────────── renewal cliff machinery ────────────────────── */

/** Business minute the 90-day renewal-window pulse opens at (§6.4). */
export function renewalPulseOpenMin(termEndMin: SimMinute, cfg: EconomyConfig): SimMinute {
  return termEndMin - daysToMinutes(cfg, cfg.contracts.renewalPulseLeadDays);
}

export type RenewalCliffOutcome =
  | { readonly kind: "renewed"; readonly econ: ContractEconomy }
  | { readonly kind: "lapsed"; readonly econ: ContractEconomy }
  | { readonly kind: "escalate-and-renew"; readonly econ: ContractEconomy; readonly newMrc: MoneyUnit };

/** The cliff decision RESULT as data (Gate-5: renew / escalate / lapse).
 *  Who decides (auto-renew default, notice events, player card) is the rules
 *  layer's job; this module exposes the deterministic transition once a
 *  decision arrives. `causeId` attributes whichever rule decided. */
export interface RenewalDecision {
  readonly choice: "renew" | "lapse" | "escalate-and-renew";
  readonly causeId: CauseId;
  /** New MRC for escalate-and-renew (ignored otherwise). */
  readonly escalatedMrc: MoneyUnit | null;
}

export function resolveRenewalCliff(
  econ: ContractEconomy,
  decision: RenewalDecision,
  atBusinessMin: SimMinute,
  cfg: EconomyConfig,
): RenewalCliffOutcome {
  if (econ.cliffFired) {
    throw new Error(`economy/contract: cliff already fired for '${econ.contractId}' term ending ${econ.termEndMin}`);
  }
  if (atBusinessMin < econ.termEndMin) {
    throw new Error(
      `economy/contract: cliff decision for '${econ.contractId}' at ${atBusinessMin} before term end ${econ.termEndMin}`,
    );
  }
  if (decision.choice === "lapse") {
    return { kind: "lapsed", econ: setPhase({ ...econ, cliffFired: true }, "terminated", atBusinessMin) };
  }
  const extensionMonths = econ.termMonths > 0 ? econ.termMonths : cfg.contracts.evergreenExtensionMonths;
  // Renewing rewrites the SHARED contract — that's the orchestrator's job via
  // `renewedContractGeometry`; here we only roll the economy bookkeeping.
  const rolled: ContractEconomy = {
    ...econ,
    cliffFired: false,
    renewalPulseOpened: false,
    cycleAnchorMin: econ.termEndMin,
    termEndMin: econ.termEndMin + extensionMonths * cfg.calendar.minutesPerMonth,
    termMonths: extensionMonths,
    // The NEW term starts its own prepaid cycle grid at the anchor.
    invoicedCycles: 0,
  };
  if (decision.choice === "escalate-and-renew") {
    if (decision.escalatedMrc === null) {
      throw new Error(`economy/contract: escalate-and-renew for '${econ.contractId}' missing new MRC`);
    }
    return { kind: "escalate-and-renew", econ: rolled, newMrc: decision.escalatedMrc };
  }
  return { kind: "renewed", econ: rolled };
}

/** Geometry for the renewed shared Contract (the orchestrator re-binds it in
 *  GameState.contracts; economy cannot mutate types.ts objects). */
export function renewedContractGeometry(contract: Contract, atBusinessMin: SimMinute, cfg: EconomyConfig): Contract {
  // E-12 bigint round; and the sub-month-term fallback now actually fires:
  // the old `Math.max(1, …) || evergreen` made the evergreen branch dead
  // code, contradicting resolveRenewalCliff's `termMonths > 0 ? … : evergreen`.
  const rounded = roundDiv(contract.termEndMin - contract.termStartMin, cfg.calendar.minutesPerMonth);
  const months = rounded > 0 ? rounded : cfg.contracts.evergreenExtensionMonths;
  const lengthMin = months * cfg.calendar.minutesPerMonth;
  const anchor = atBusinessMin >= contract.termEndMin ? contract.termEndMin : atBusinessMin;
  return {
    ...contract,
    termStartMin: contract.billingCycle === "monthly" ? anchor : contract.termStartMin,
    termEndMin: anchor + lengthMin,
    mrcMicroUsd: contract.mrcMicroUsd,
    tcvMicroUsd: contract.tcvMicroUsd,
    acvMicroUsd: contract.acvMicroUsd,
  };
}

/* ─────────────────────────── MFN repricing queue ──────────────────────── */

export interface MfnRepriceEvent {
  readonly contractId: EntityId;
  /** Discount floor the MFN clause entitles the customer to, bps off list. */
  readonly discountBps: bigint;
  readonly queuedAtMin: SimMinute;
  /** "MFN reprices 3 levels later" (§7.15): firesAt = queued + lag table. */
  readonly firesAtMin: SimMinute;
  readonly fired: boolean;
  readonly causeId: CauseId;
}

export function queueMfnReprice(
  contractId: EntityId,
  discountBps: bigint,
  queuedAtMin: SimMinute,
  cfg: EconomyConfig,
  triggerCause: CauseId,
): MfnRepriceEvent {
  if (discountBps < 0n || discountBps > 10_000n) {
    throw new RangeError(`economy/contract: MFN discount ${discountBps} bps outside [0,10000]`);
  }
  const lagMin = cfg.contracts.mfnRepriceLagLevels * cfg.contracts.mfnLagMinutesPerLevel;
  return {
    contractId,
    discountBps,
    queuedAtMin,
    firesAtMin: queuedAtMin + lagMin,
    fired: false,
    causeId: asCauseId(`${triggerCause}+mfn-lag-${lagMin}`),
  };
}

export function dueMfnReprices(queue: readonly MfnRepriceEvent[], atBusinessMin: SimMinute): readonly MfnRepriceEvent[] {
  return queue.filter((e) => !e.fired && e.firesAtMin <= atBusinessMin);
}

export function markMfnFired(queue: readonly MfnRepriceEvent[], contractId: EntityId): readonly MfnRepriceEvent[] {
  return queue.map((e) => (e.contractId === contractId && !e.fired ? { ...e, fired: true } : e));
}
