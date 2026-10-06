/**
 * Dunning pipeline state machine (MASTER_REPORT §6.4:
 * "failed → retry → reminder → warning → suspend → terminate; each stage has
 * a recovery rate and a churn/PR cost").
 *
 * Reconciliation (E-18, doc→code; §6.4 + §7.10 "each stage has a recovery
 * rate"): the source doc's prose — "cards decline over days 1–4; dunning
 * recovers over days 5–20" — reads as if the recovery challenge only starts
 * at reminder/warning depth. The CODE is right: every stage ENTRY from retry
 * through terminate draws exactly one seeded recovery roll (retry's roll IS
 * the card-retry schedule the doc describes on days 1–4). Doc wording is
 * updated to the code, not the other way around.
 *
 * Shape from the doc — declines on days 1–4, dunning window days 5–20,
 * suspension Policy Dial rung (3 | 10 | 30) is a PLAYER choice surfaced as
 * config.dunning.suspensionDay; terminating guarantees non-payment but stops
 * the bleeding. The FSM here is decision-free and pure: it reports the stage
 * transition and the seeded recovery roll; the tick performs the money
 * postings (collect → free, or write-off → AR out) and phase changes.
 *
 * RNG discipline (§4.1 R-16): one counter-based stream per
 * (seed, "economy/dunning/<stage>", invoice due minute, contract id) — the
 * same run replays byte-identical, and stage domains can't perturb each
 * other.
 */

import { streamFor } from "../kernel/rng.ts";
import { type RunSeed } from "../types.ts";
import { daysPastDue, type Invoice } from "./billing.ts";
import type { EconomyConfig } from "./config.ts";

export type DunningStage = "failed" | "retry" | "reminder" | "warning" | "suspend" | "terminate";

export const DUNNING_STAGE_ORDER: readonly DunningStage[] = [
  "failed",
  "retry",
  "reminder",
  "warning",
  "suspend",
  "terminate",
] as const;

/** Day boundaries (from due date) that open each stage — §6.4 skeleton,
 *  exact stops in config. Fails loud on a mis-ordered dial. */
export function assertDunningLadder(cfg: EconomyConfig): void {
  const d = cfg.dunning;
  const ladder: readonly (readonly [string, number])[] = [
    ["retryStartDay", d.retryStartDay],
    ["reminderStartDay", d.reminderStartDay],
    ["warningStartDay", d.warningStartDay],
    ["suspensionDay", d.suspensionDay],
  ];
  for (let i = 1; i < ladder.length; i += 1) {
    if (ladder[i]![1] < ladder[i - 1]![1]) {
      throw new RangeError(
        `economy/dunning: stage ladder out of order: ${ladder[i - 1]![0]}=${ladder[i - 1]![1]} > ${ladder[i]![0]}=${ladder[i]![1]}`,
      );
    }
  }
  if (d.terminationAfterSuspensionDays < 0) {
    throw new RangeError("economy/dunning: terminationAfterSuspensionDays must be >= 0");
  }
}

export function stageForDaysPastDue(days: number, cfg: EconomyConfig): DunningStage {
  const d = cfg.dunning;
  const terminationDay = d.suspensionDay + d.terminationAfterSuspensionDays;
  if (days >= terminationDay) return "terminate";
  if (days >= d.suspensionDay) return "suspend";
  if (days >= d.warningStartDay) return "warning";
  if (days >= d.reminderStartDay) return "reminder";
  if (days >= d.retryStartDay) return "retry";
  return "failed";
}

export interface DunningAdvance {
  readonly invoice: Invoice;
  /** No stage boundary crossed this tick. */
  readonly kind: "held" | "recovered" | "advanced" | "suspended" | "terminated";
  readonly stageBefore: DunningStage;
  readonly stageNow: DunningStage;
}

function recoveryBpsForStage(stage: DunningStage, cfg: EconomyConfig, engineBonusBps: bigint): bigint {
  const base =
    stage === "terminate"
      ? cfg.dunning.postSuspensionRecoveryBps // last-chance roll before the write-off
      : stage === "failed"
        ? 0n // the initial decline itself never "recovers"; only retries do
        : cfg.dunning.stageRecoveryBps[stage];
  const total = base + engineBonusBps; // Dunning Engine buildable, §6.4
  return total > 10_000n ? 10_000n : total;
}

/**
 * Attempt one stage advance for a FAILED invoice at `atBusinessMin`.
 * `engineBonusBps` = recovery bonus from built dunning tooling (0 = none;
 * pass cfg.dunning.dunningEngineBonusBps when owned).
 *
 * Recovery rolls happen ONCE per stage entry (the stage domain pins the
 * stream), so re-invoking inside the same stage never re-draws.
 */
export function advanceDunning(
  invoice: Invoice,
  atBusinessMin: number,
  runSeed: RunSeed,
  cfg: EconomyConfig,
  engineBonusBps: bigint,
): DunningAdvance {
  if (invoice.state !== "failed") {
    throw new Error(
      `economy/dunning: advanceDunning requires state 'failed', got '${invoice.state}' on '${invoice.id}'`,
    );
  }
  const current: DunningStage = invoice.dunningStage ?? "failed";
  if (current === "terminate") {
    return { invoice, kind: "held", stageBefore: current, stageNow: current };
  }
  const days = daysPastDue(invoice, atBusinessMin, cfg);
  const target = stageForDaysPastDue(days, cfg);
  if (target === current) {
    return { invoice, kind: "held", stageBefore: current, stageNow: current };
  }

  const bps = recoveryBpsForStage(target, cfg, engineBonusBps);
  const stream = streamFor(runSeed, `economy/dunning/${target}`, invoice.dueAtMin, invoice.contractId);
  const recovered = bps > 0n && stream.range(10_000) < Number(bps);

  if (recovered) {
    return { invoice, kind: "recovered", stageBefore: current, stageNow: target };
  }
  if (target === "terminate") {
    return { invoice, kind: "terminated", stageBefore: current, stageNow: target };
  }
  if (target === "suspend") {
    return { invoice, kind: "suspended", stageBefore: current, stageNow: target };
  }
  return { invoice, kind: "advanced", stageBefore: current, stageNow: target };
}
