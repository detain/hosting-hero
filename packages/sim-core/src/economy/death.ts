/**
 * OD-25(a) — the three canonical company deaths (owner ruling 2026-10-09b,
 * docs/DECISIONS-PENDING.md OD-25; taxonomy at §6.10, warning law at §9.6
 * "Lose slowly": ≥3 minutes of VISIBLE warning before an unavoidable loss).
 *
 * Causes, in CANONICAL ORDER (also the priority when several arm on the same
 * fold — float first because it is the ledger's own pulse, covenant next
 * because the bank moves outside the company's control, churn last because
 * the customer book is slowest to speak):
 *
 *   float-insolvency — free cash pinned at zero while settlements the company
 *     owed were REFUSED (the host forwards `EconomyTickIn.refusedSettlements`;
 *     this is the witness lane for the class the unattended runner currently
 *     handles by catch-and-void). Zero cash alone is a bad day; zero cash plus
 *     refused bills sustained for `floatInsolvencySustainedDays` is death.
 *
 *   covenant-default — a latched breach (§5.10 edge-trigger from the month
 *     roll) that survives the full `covenantCureGraceDays` cure window. The
 *     recovery semantics stay the shipped ones: only a clean month roll lifts
 *     the latch, and a lifted latch clears the watch.
 *
 *   churn-collapse — the active customer book falls BELOW `churnFloor`
 *     (default 1: extinction, not a downturn) and stays there sustained for
 *     `churnCollapseSustainedDays`.
 *
 * Phase machine (folded inside `runEconomyTick` step 12.6):
 *
 *   LIVE ──armed fold──▶ DEATH NOTICE (deathWarning + `death-imminent`
 *                          notice; ESCAPABLE — any fold where the cause
 *                          disarms lifts the warning and the watch restarts)
 *   DEATH NOTICE ──still-armed next fold──▶ DISSOLVED (companyDeath record +
 *                          `company-dissolved` notice; terminal: every later
 *                          tick is a no-op-preserve, no settle, no accrual,
 *                          no throw — the ledger closes with its last word).
 *
 * Digest safety: every threshold is business-minute arithmetic (no wall clock,
 * no floats, no RNG draws) and the whole record set is OPTIONAL on EconomyState
 * — keys are ABSENT while idle, so existing hosts serialize byte-identically
 * and the pipeline digest (which covers GameState, not EconomyState) never
 * sees any of it. All PROVISIONAL rows ratify-on-playtest like the runway
 * constants beside them.
 */

import {
  asMoney,
  type CauseId,
  type EntityId,
  type MoneyUnit,
  type SimMinute,
} from "../types.ts";
import { daysToMinutes, type EconomyConfig } from "./config.ts";

/* ─────────────────────────── vocabulary ───────────────────────────────── */

export type CompanyDeathCause = "float-insolvency" | "covenant-default" | "churn-collapse";

/** Canonical order = fold priority when multiple causes arm on one tick. */
export const COMPANY_DEATH_CAUSES: readonly CompanyDeathCause[] = Object.freeze([
  "float-insolvency",
  "covenant-default",
  "churn-collapse",
] as const);

export type DeathPhase = "live" | "notice" | "dissolved";

/** One settlement the host could not pay out of free cash, forwarded on the
 *  tick that refused it (the float-insolvency evidence stream). */
export interface RefusedSettlement {
  readonly contractId: EntityId;
  readonly amountMicroUsd: MoneyUnit;
}

/* ─────────────────────────── evidence records ─────────────────────────── */

/** Free cash at zero + refused settles sustained past the float threshold. */
export interface FloatInsolvencyEvidence {
  readonly cause: "float-insolvency";
  readonly freeCash: MoneyUnit;
  readonly refusedSettles: number;
  readonly refusedMicroUsd: MoneyUnit;
  readonly watchSinceBusinessMin: SimMinute;
  readonly sustainedBusinessMin: number;
}

/** A latched covenant breach that outlived the cure grace. */
export interface CovenantDefaultEvidence {
  readonly cause: "covenant-default";
  readonly covenantId: string;
  readonly breachCauseId: CauseId;
  readonly breachAtBusinessMin: SimMinute;
  readonly graceBusinessMin: number;
}

/** The customer book under the floor, sustained past the churn threshold. */
export interface ChurnCollapseEvidence {
  readonly cause: "churn-collapse";
  readonly activeCustomers: number;
  readonly churnFloor: number;
  readonly watchSinceBusinessMin: SimMinute;
  readonly sustainedBusinessMin: number;
}

export type DeathEvidence =
  | FloatInsolvencyEvidence
  | CovenantDefaultEvidence
  | ChurnCollapseEvidence;

/** DEATH NOTICE (§9.6): the visible warning, one cause, escapable. */
export interface DeathWarningRecord {
  readonly cause: CompanyDeathCause;
  readonly atBusinessMinute: SimMinute;
  readonly evidence: DeathEvidence;
}

/** DISSOLVED: the terminal record. `warnedAtBusinessMin` proves the
 *  warning-then-death ordering the lose-slowly law demands. */
export interface CompanyDeathRecord {
  readonly cause: CompanyDeathCause;
  readonly atBusinessMinute: SimMinute;
  readonly warnedAtBusinessMin: SimMinute;
  readonly evidence: DeathEvidence;
}

/* ─────────────────────────── the sustained watch ──────────────────────── */

/** Spell trackers for the two sustained-threshold causes. The covenant path
 *  needs no watch — its clock is the breach record's own timestamp. */
export interface DeathWatch {
  /** Start of the current free-cash-at-zero spell; null when not at zero. */
  readonly floatZeroSinceBusinessMin: SimMinute | null;
  /** Refused settles observed DURING the current zero spell. */
  readonly refusedSettles: number;
  readonly refusedMicroUsd: MoneyUnit;
  /** Start of the current below-floor spell; null when at/above the floor. */
  readonly churnBelowFloorSinceBusinessMin: SimMinute | null;
}

export function emptyDeathWatch(): DeathWatch {
  return {
    floatZeroSinceBusinessMin: null,
    refusedSettles: 0,
    refusedMicroUsd: asMoney(0n),
    churnBelowFloorSinceBusinessMin: null,
  };
}

/** True when no spell is running — the watch then earns NO state key. */
export function isIdleDeathWatch(watch: DeathWatch): boolean {
  return (
    watch.floatZeroSinceBusinessMin === null &&
    watch.churnBelowFloorSinceBusinessMin === null &&
    watch.refusedSettles === 0 &&
    watch.refusedMicroUsd === 0n
  );
}

/** One fold's reading of the two sustained-watch gauges + this tick's
 *  refusals (the caller folds refusals only while the zero spell runs — the
 *  watch resets them at spell break, so a payment-success tick reports []). */
export interface DeathFoldSample {
  readonly now: SimMinute;
  readonly freeCash: MoneyUnit;
  readonly activeCustomers: number;
  readonly refusedSettlements: readonly RefusedSettlement[];
}

function requireRefusal(refusal: RefusedSettlement, position: number): void {
  if (typeof refusal.contractId !== "string" || refusal.contractId.length === 0) {
    throw new RangeError(`economy/death: refusedSettlements[${position}] needs a non-empty contractId`);
  }
  if (typeof refusal.amountMicroUsd !== "bigint") {
    throw new RangeError(`economy/death: refusedSettlements[${position}].amountMicroUsd must be a bigint, got ${typeof refusal.amountMicroUsd}`);
  }
  if (refusal.amountMicroUsd < 0n) {
    throw new RangeError(`economy/death: refusedSettlements[${position}].amountMicroUsd must be >= 0 (a refund is not a refusal): ${refusal.amountMicroUsd}`);
  }
}

/**
 * Pure spell advance: continue or start each watch on the fold's reading,
 * reset on break. Refusal counters accumulate ONLY inside a live zero spell —
 * the moment free cash returns the slate is wiped, which is exactly the
 * "bad day vs death" distinction §6.10 asks for.
 */
export function advanceDeathWatch(
  watch: DeathWatch,
  sample: DeathFoldSample,
  cfg: EconomyConfig,
): DeathWatch {
  for (const [position, refusal] of sample.refusedSettlements.entries()) {
    requireRefusal(refusal, position);
  }
  const refusedTotal = sample.refusedSettlements.reduce(
    (sum, refusal) => sum + refusal.amountMicroUsd,
    0n,
  );

  const floatContinues = sample.freeCash === 0n;
  const floatSince = floatContinues
    ? (watch.floatZeroSinceBusinessMin ?? sample.now)
    : null;
  const floatCarries = floatSince !== null && watch.floatZeroSinceBusinessMin === floatSince;
  const refusedSettles = floatSince === null ? 0 : (floatCarries ? watch.refusedSettles : 0) + sample.refusedSettlements.length;
  const refusedMicroUsd = floatSince === null
    ? asMoney(0n)
    : asMoney((floatCarries ? watch.refusedMicroUsd : 0n) + refusedTotal);

  const churnSince = sample.activeCustomers < cfg.death.churnFloor
    ? (watch.churnBelowFloorSinceBusinessMin ?? sample.now)
    : null;

  return {
    floatZeroSinceBusinessMin: floatSince,
    refusedSettles,
    refusedMicroUsd,
    churnBelowFloorSinceBusinessMin: churnSince,
  };
}

/* ─────────────────────────── gated evidence ───────────────────────────── */

/** Null at every unmet gate, top-down (Early Exit law) — a snapshot is only
 *  produced when the death condition holds THIS fold. */
export function floatInsolvencyEvidence(
  freeCash: MoneyUnit,
  watch: DeathWatch,
  now: SimMinute,
  cfg: EconomyConfig,
): FloatInsolvencyEvidence | null {
  const since = watch.floatZeroSinceBusinessMin;
  if (since === null) return null;
  if (freeCash !== 0n) return null;
  if (watch.refusedSettles < 1) return null;
  const sustained = now - since;
  if (sustained < daysToMinutes(cfg, cfg.death.floatInsolvencySustainedDays)) return null;
  return {
    cause: "float-insolvency",
    freeCash,
    refusedSettles: watch.refusedSettles,
    refusedMicroUsd: watch.refusedMicroUsd,
    watchSinceBusinessMin: since,
    sustainedBusinessMin: sustained,
  };
}

/** Structural read of `CovenantBreachRecord` (leaf law: the death module
 *  never imports the covenant evaluator's bookkeeping types). */
export interface CovenantBreachLike {
  readonly covenantId: string;
  readonly atBusinessMin: SimMinute;
  readonly causeId: CauseId;
}

/** The EARLIEST still-latched breach whose age reached the cure grace (scan
 *  is log-order independent — the minimum timestamp wins, so a host that
 *  restored a shuffled save cannot change the story). A recovered covenant
 *  left `breachedCovenantIds`, so its old log row can never arm this — the
 *  grace clock only runs on the live latch. */
export function covenantDefaultEvidence(
  breachedCovenantIds: readonly string[],
  breachLog: readonly CovenantBreachLike[],
  now: SimMinute,
  cfg: EconomyConfig,
): CovenantDefaultEvidence | null {
  if (breachedCovenantIds.length === 0) return null;
  const grace = daysToMinutes(cfg, cfg.death.covenantCureGraceDays);
  const latched = new Set<string>(breachedCovenantIds);
  let earliest: CovenantBreachLike | null = null;
  for (const record of breachLog) {
    if (!latched.has(record.covenantId)) continue;
    if (now - record.atBusinessMin < grace) continue;
    if (earliest === null || record.atBusinessMin < earliest.atBusinessMin) earliest = record;
  }
  if (earliest === null) return null;
  return {
    cause: "covenant-default",
    covenantId: earliest.covenantId,
    breachCauseId: earliest.causeId,
    breachAtBusinessMin: earliest.atBusinessMin,
    graceBusinessMin: grace,
  };
}

export function churnCollapseEvidence(
  activeCustomers: number,
  watch: DeathWatch,
  now: SimMinute,
  cfg: EconomyConfig,
): ChurnCollapseEvidence | null {
  const since = watch.churnBelowFloorSinceBusinessMin;
  if (since === null) return null;
  if (activeCustomers >= cfg.death.churnFloor) return null;
  const sustained = now - since;
  if (sustained < daysToMinutes(cfg, cfg.death.churnCollapseSustainedDays)) return null;
  return {
    cause: "churn-collapse",
    activeCustomers,
    churnFloor: cfg.death.churnFloor,
    watchSinceBusinessMin: since,
    sustainedBusinessMin: sustained,
  };
}

export interface DeathEvidenceInput {
  readonly now: SimMinute;
  readonly watch: DeathWatch;
  readonly freeCash: MoneyUnit;
  readonly activeCustomers: number;
  readonly breachedCovenantIds: readonly string[];
  readonly covenantBreachLog: readonly CovenantBreachLike[];
}

/** First armed cause in canonical order — never two records on one fold. */
export function deathEvidenceFor(input: DeathEvidenceInput, cfg: EconomyConfig): DeathEvidence | null {
  return (
    floatInsolvencyEvidence(input.freeCash, input.watch, input.now, cfg) ??
    covenantDefaultEvidence(input.breachedCovenantIds, input.covenantBreachLog, input.now, cfg) ??
    churnCollapseEvidence(input.activeCustomers, input.watch, input.now, cfg)
  );
}

/** The phase read for any state-shaped value (HUD/endings projection lane). */
export function deathPhaseOf(state: {
  readonly deathWarning?: DeathWarningRecord | undefined;
  readonly companyDeath?: CompanyDeathRecord | undefined;
}): DeathPhase {
  if (state.companyDeath !== undefined) return "dissolved";
  if (state.deathWarning !== undefined) return "notice";
  return "live";
}
