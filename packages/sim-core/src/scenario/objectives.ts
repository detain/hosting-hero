/** Objective evaluation — pure functions of an accumulated observation.
 *
 *  The runner folds every tick's engine outputs into ONE frozen
 *  ScenarioObservation (counters + money + death census); every objective
 *  predicate reads that snapshot alone (Law of Atomic Predictability: no
 *  hidden state, no re-run, no engine access). Progress values ride the
 *  house Q16.16 Fixed carrier, clamped to [0, 1] — 1.0 means the condition
 *  is met, 0 means untouched; safety predicates count DOWN toward their
 *  violation so the HUD can render "how close am I to losing".
 */

import type { Fixed } from "../types.ts";
import type { CompanyDeathCause } from "../economy/index.ts";
import { FIXED_ONE, FIXED_ZERO, fromRatio } from "../kernel/fixed.ts";
import type { ObjectivePredicate, ScenarioDeathCause } from "./doc.ts";

/** Everything an objective can legally know — output-side, accumulated by
 *  the runner from TickResults + EconomyTickOuts. Nothing in GameState is
 *  consulted here. */
export interface ScenarioObservation {
  /** Sim-minutes elapsed at the observation point (= ticks run at default
   *  cadence). */
  readonly elapsedMin: number;
  /** Free-cash bucket in µ$ (economy-mirrored once the money lane is on). */
  readonly cashFreeMicroUsd: bigint;
  /** Cumulative `invoice-paid` economy notices (settled revenue). */
  readonly settledInvoices: number;
  /** Contracts lost: `churned-voluntary` + `cliff-lapsed` notices. */
  readonly churnedCustomers: number;
  /** Customers written off the books entirely (`written-off` notices). */
  readonly writtenOffCustomers: number;
  /** Cumulative terminal `bounced` outcomes (capacity demand refused). */
  readonly bounces: number;
  /** Canonical company deaths seen (OD-25(a)), first-seen order, deduped. */
  readonly deaths: readonly CompanyDeathCause[];
}

/** A fresh, honest zero-observation (used before the first tick). */
export const EMPTY_OBSERVATION: ScenarioObservation = Object.freeze({
  elapsedMin: 0,
  cashFreeMicroUsd: 0n,
  settledInvoices: 0,
  churnedCustomers: 0,
  writtenOffCustomers: 0,
  bounces: 0,
  deaths: Object.freeze([]),
});

function deathsInclude(deaths: readonly CompanyDeathCause[], cause: ScenarioDeathCause): boolean {
  return cause === "any" ? deaths.length > 0 : deaths.includes(cause);
}

/** Does the predicate hold on this observation? (Closed switch — the doc
 *  wall already refused every other kind.) */
export function objectiveHolds(obs: ScenarioObservation, predicate: ObjectivePredicate): boolean {
  switch (predicate.kind) {
    case "survive-minutes":
      return obs.elapsedMin >= predicate.minutes;
    case "cash-above":
      return obs.cashFreeMicroUsd >= predicate.microUsd;
    case "cash-below":
      return obs.cashFreeMicroUsd < predicate.microUsd;
    case "churn-below":
      return obs.churnedCustomers < predicate.count;
    case "churn-above":
      return obs.churnedCustomers > predicate.count;
    case "invoices-settled":
      return obs.settledInvoices >= predicate.count;
    case "bounces-below":
      return obs.bounces < predicate.count;
    case "bounces-above":
      return obs.bounces > predicate.count;
    case "no-death-cause":
      return !deathsInclude(obs.deaths, predicate.cause);
    case "death-by-cause":
      return deathsInclude(obs.deaths, predicate.cause);
  }
}

/** clamp(raw/bigintDenom → Fixed) into [0, FIXED_ONE] via one bigint fold —
 *  the fromRatio discipline (no Q16.16 input wall on the numerator). */
function clampRatio(numerator: bigint, denominator: bigint): Fixed {
  if (denominator <= 0n) return FIXED_ONE;
  if (numerator <= 0n) return FIXED_ZERO;
  const ratio = fromRatio(numerator, denominator);
  return ratio > FIXED_ONE ? FIXED_ONE : ratio;
}

/** One predicate's report row. */
export interface ObjectiveProgress {
  readonly predicate: ObjectivePredicate;
  readonly holds: boolean;
  /** Q16.16 in [0,1]: 1.0 ⇔ predicate satisfied. Safety predicates count
   *  their HEADROOM down toward violation (1.0 = perfectly safe, 0.0 =
   *  threshold reached); attainment predicates count their PROGRESS up
   *  toward it. death-by-cause latches 1.0 the moment the notice lands. */
  readonly progress: Fixed;
}

/** Stable one-line rendering (report-facing, cause-ids style). */
export function objectiveLine(predicate: ObjectivePredicate): string {
  switch (predicate.kind) {
    case "survive-minutes":
      return `survive-minutes:${predicate.minutes}`;
    case "cash-above":
    case "cash-below":
      return `${predicate.kind}:${predicate.microUsd.toString()}`;
    case "churn-below":
    case "churn-above":
    case "invoices-settled":
    case "bounces-below":
    case "bounces-above":
      return `${predicate.kind}:${predicate.count}`;
    case "no-death-cause":
    case "death-by-cause":
      return `${predicate.kind}:${predicate.cause}`;
  }
}

/** Evaluate progress + hold for one predicate. */
export function objectiveProgress(obs: ScenarioObservation, predicate: ObjectivePredicate): ObjectiveProgress {
  const holds = objectiveHolds(obs, predicate);
  return Object.freeze({ predicate, holds, progress: progressOf(obs, predicate) });
}

function progressOf(obs: ScenarioObservation, predicate: ObjectivePredicate): Fixed {
  switch (predicate.kind) {
    case "survive-minutes":
      return clampRatio(BigInt(obs.elapsedMin), BigInt(predicate.minutes));
    case "cash-above":
      return clampRatio(obs.cashFreeMicroUsd, predicate.microUsd);
    case "cash-below":
      // attainment of the danger: the SHORTFALL below the line, as a share.
      return clampRatio(predicate.microUsd - obs.cashFreeMicroUsd, predicate.microUsd);
    case "churn-below":
      // safety headroom: how many customers may still leave.
      return clampRatio(BigInt(predicate.count - obs.churnedCustomers), BigInt(predicate.count));
    case "churn-above":
      return clampRatio(BigInt(obs.churnedCustomers), BigInt(predicate.count + 1));
    case "invoices-settled":
      return clampRatio(BigInt(obs.settledInvoices), BigInt(predicate.count));
    case "bounces-below":
      return clampRatio(BigInt(predicate.count - obs.bounces), BigInt(predicate.count));
    case "bounces-above":
      return clampRatio(BigInt(obs.bounces), BigInt(predicate.count + 1));
    case "no-death-cause":
      return holds0(obs, predicate) ? FIXED_ONE : FIXED_ZERO;
    case "death-by-cause":
      return deathsInclude(obs.deaths, predicate.cause) ? FIXED_ONE : FIXED_ZERO;
  }
}

/** no-death-cause is safety by latching: 1.0 while no named death exists. */
function holds0(obs: ScenarioObservation, predicate: ObjectivePredicate): boolean {
  return predicate.kind === "no-death-cause" && !deathsInclude(obs.deaths, predicate.cause);
}

/** Evaluate a whole list, in author order (report-facing, never sorted —
 *  the order is the mission's narrative emphasis). */
export function progressAll(
  obs: ScenarioObservation,
  predicates: readonly ObjectivePredicate[],
): readonly ObjectiveProgress[] {
  return Object.freeze(predicates.map((p) => objectiveProgress(obs, p)));
}
