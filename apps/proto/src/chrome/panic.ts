/**
 * Panic Layout (§8.15 Big Number Rule, §8.8 klaxon furniture) — pure.
 *
 * "There is exactly ONE large number on screen. In calm play it is cash.
 * During an outage it is the INCIDENT COST." Panic Layout is the HUD
 * simplifier that reconfigures which number that is, and dims everything
 * the player cannot act on while the klaxon runs.
 *
 * It CONSUMES existing alert state — BudgetManager's breach/clusters from
 * ChromaMeter's snapshot, and the instrument worst-state — it never keeps a
 * rival tally (no divergent duplication).
 */
import type { InstrumentReading } from "./instruments/registry";
import type { BudgetSnapshot } from "../render/budget";

export type PanicLevel = "calm" | "elevated" | "panic";

export interface PanicInput {
  /** metrics.worstState(projection) — the bezel top rule (§1.3). */
  readonly worst: InstrumentReading["state"];
  /** metrics.isSpiking(projection) — an arrival-surge notice this frame. */
  readonly spiking: boolean;
  /** ChromaMeter's budget snapshot; `breach` = klaxon-adjacent pressure. */
  readonly budget: BudgetSnapshot | null;
}

/**
 * Escalation order is deliberate: a budget breach ALONE (the render layer
 * saturating) is elevated, not panic — panic needs GROUND TRUTH (an alarm
 * reading). De-escalation is symmetric; nothing latches.
 */
export function derivePanic(input: PanicInput): PanicLevel {
  if (input.worst === "alarm") return "panic";
  if (input.spiking || input.budget?.breach === true || input.worst === "warn") return "elevated";
  return "calm";
}

/**
 * Incident cost law (g1): every false positive burns a 20-second WAF
 * challenge fee per visitor — 20 s = 20,000,000 µ$ at 1 µ$/µs. Waste is
 * exactly fp × fee (the sim's conservation identity; chrome only displays
 * it). Landed requests are shown as context, not money — their damage runs
 * through SLA/billing rails chrome can't see.
 */
export const FP_CHALLENGE_FEE_MICRO_USD: bigint = 20_000_000n;

export interface IncidentCost {
  readonly microUsd: bigint;
  readonly falsePositives: number;
  readonly landed: number;
}

export function incidentCost(counters: { blockedFalsePositive: number; landed: number }): IncidentCost {
  if (counters.blockedFalsePositive < 0 || counters.landed < 0) {
    throw new RangeError("incidentCost: counters cannot be negative");
  }
  return {
    microUsd: BigInt(counters.blockedFalsePositive) * FP_CHALLENGE_FEE_MICRO_USD,
    falsePositives: counters.blockedFalsePositive,
    landed: counters.landed,
  };
}

/** The Big Number Rule, decided: who owns the one large number right now. */
export type BigNumberOwner = "cash" | "incident-cost";

export function bigNumberDecision(level: PanicLevel): BigNumberOwner {
  return level === "panic" ? "incident-cost" : "cash";
}

/** HUD sections that KEEP full presence during panic — "nothing on the HUD
 *  the player cannot act on" (§8.8); everything else dims to a whisper. */
export const PANIC_ESSENTIAL_SECTIONS: ReadonlySet<string> = Object.freeze(
  new Set(["cash", "clock-ribbon", "alert-stack", "incident-cost", "world-stage"]),
);

export function isEssentialDuringPanic(sectionId: string): boolean {
  return PANIC_ESSENTIAL_SECTIONS.has(sectionId);
}

/** Convenience: does the panic layout need to dim anything at this level? */
export function dimsNonEssential(level: PanicLevel): boolean {
  return level === "panic";
}
