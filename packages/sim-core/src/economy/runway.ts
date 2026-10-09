/**
 * Runway bar + death-spiral detector (MASTER_REPORT §6.4 "Runway Tone Shift"
 * / §6.13 credit-line utilization flag / §9.6 lose-slowly gate).
 *
 * The bar reads FREE cash only (§6.13: "death happens on free"), divided by
 * the trailing net burn per business month. Tone: shift under 6 months,
 * number-promotion under 3 (LIVE, §6.4). The UI's real-minute presentation
 * is the renderer's problem; here everything is business-calendar.
 *
 * Death spiral (LIVE concept, PROVISIONAL streaks, §6.13): repeated
 * credit-line borrowing while runway is already critical is a RECOGNIZABLE
 * STATE, not a hidden flag — the detector surfaces it as data the HUD and
 * rules can read.
 *
 * Lose-slowly guard (LIVE ≥ 3 real minutes of warning before an unavoidable
 * loss, §9.6): conversion between clocks uses the kernel's BUSINESS_SCALE
 * rational ({43200, 7} per µs) by cross-multiplication — integer math, no
 * float ever touches the comparison (docs/CONVENTIONS.md).
 */

import { FIXED_RAW_MAX, fromRatio, inRange, compare } from "../kernel/fixed.ts";
import { BUSINESS_SCALE_DEFAULT, type ClockScale } from "../kernel/time.ts";
import type { CauseId, Fixed, MoneyUnit, SimMinute } from "../types.ts";
import { type EconomyConfig } from "./config.ts";

export type RunwayTone = "normal" | "caution" | "critical";

/** Months of free-cash runway at `netBurnPerMonth` (µ$/business-month,
 *  positive = burning). null = not burning (guard: no meaningless ∞ ratio).
 *  Clamps at FIXED_RAW_MAX whole-months rather than throwing — a huge runway
 *  is a legitimate state, unlike an overflow inside pricing math. */
export function runwayMonths(
  freeCash: MoneyUnit,
  netBurnPerMonth: MoneyUnit,
): Fixed | null {
  if (freeCash < 0n) throw new RangeError(`economy/runway: negative free cash ${freeCash}`);
  if (netBurnPerMonth <= 0n) return null;
  const raw = (freeCash * 65_536n) / netBurnPerMonth;
  return inRange(raw) && raw <= FIXED_RAW_MAX ? raw : FIXED_RAW_MAX;
}

export function runwayTone(months: Fixed | null, cfg: EconomyConfig): RunwayTone {
  if (months === null) return "normal";
  const critical = fromRatio(BigInt(cfg.runway.criticalMonths), 1n);
  const caution = fromRatio(BigInt(cfg.runway.cautionMonths), 1n);
  if (compare(months, critical) < 0) return "critical";
  if (compare(months, caution) < 0) return "caution";
  return "normal";
}

/* ────────────────────────── death-spiral detector ─────────────────────── */

export interface RunwayMetrics {
  readonly freeCash: MoneyUnit;
  /** Trailing month net burn, µ$/business-month (≤0 = net positive). */
  readonly netBurnPerMonth: MoneyUnit;
  /** Credit line drawn during the month just closed (§6.13 utilization). */
  readonly creditDrawnThisMonth: boolean;
}

export interface DeathSpiralState {
  readonly consecutiveBorrowMonths: number;
  readonly spiralFlagged: boolean;
  readonly tone: RunwayTone;
  readonly runwayMonths: Fixed | null;
}

export const initialDeathSpiralState: DeathSpiralState = {
  consecutiveBorrowMonths: 0,
  spiralFlagged: false,
  tone: "normal",
  runwayMonths: null,
};

/** One observation per month close (pure; returns the new detector state). */
export function observeRunway(
  state: DeathSpiralState,
  metrics: RunwayMetrics,
  cfg: EconomyConfig,
): DeathSpiralState {
  const months = runwayMonths(metrics.freeCash, metrics.netBurnPerMonth);
  const tone = runwayTone(months, cfg);
  const streak = metrics.creditDrawnThisMonth ? state.consecutiveBorrowMonths + 1 : 0;
  const ceiling = fromRatio(BigInt(cfg.runway.spiralRunwayCeilingMonths), 1n);
  const runwayCritical = months !== null && compare(months, ceiling) < 0;
  const spiral = streak >= cfg.runway.spiralBorrowStreakMonths && runwayCritical;
  return {
    consecutiveBorrowMonths: streak,
    spiralFlagged: spiral,
    tone,
    runwayMonths: months,
  };
}

/* ─────────────────────── covenant data refs (§6.13) ───────────────────── */

export interface Covenant {
  readonly id: string;
  /** Metric whose bps reading must stay ≥ floor (min EBITDA, min uptime...)
   *  or ≤ floor for max-style covenants — direction encoded in sign of
   *  floorBps is NOT clever-cute: explicit below. */
  readonly metricId: string;
  readonly floorBps: bigint;
  readonly direction: "min" | "max";
}

/** The canonical metric names the economy can read out on its own, so a
 *  host-authored covenant (the bank's card) can reference them without
 *  inventing a producer. */
export const COVENANT_METRIC_RUNWAY_MONTHS_BPS = "runwayMonthsBps";
export const COVENANT_METRIC_ERROR_BUDGET_HEALTH_BPS = "errorBudgetHealthBps";

/** "Not burning" has no month count — a min-runway covenant is then
 *  comfortably MET, so the readout is a sentinel far above any floor a
 *  bank would write (1,000,000 months). A max-style covenant on this metric
 *  would fire — which is honest: promising to BURN less cash is not a
 *  runway covenant's shape. */
export const COVENANT_UNBOUNDED_RUNWAY_BPS: bigint = 1_000_000_000_000n;

/** A fleet with no uptime commitments, or a whole budget still unspent,
 *  reads as fully healthy. */
export const COVENANT_FULL_HEALTH_BPS: bigint = 10_000n;

/** One contract's remaining error budget as a bps ratio of its grant
 *  (overrun clamps to 0 — the covenant reads "nothing left", not negative
 *  theatre). */
export function errorBudgetHealthBps(remainingSec: bigint, budgetSec: bigint): bigint {
  if (budgetSec <= 0n) return COVENANT_FULL_HEALTH_BPS;
  const bps = (remainingSec * 10_000n) / budgetSec;
  return bps < 0n ? 0n : bps;
}

/** Assemble the readout map `covenantBreaches` consumes for the two
 *  economy-produced metrics (Law 2: the evaluator keeps refusing to invent
 *  values — this is the sanctioned assembler next to it). `runwayMonthsBps`
 *  is bps OF MONTHS (a "min 6 months" covenant writes floorBps 60_000n).
 *  Structural params keep runway.ts dependency-free of errorBudget.ts. */
export function buildCovenantReadoutsBps(
  spiralRunwayMonths: Fixed | null,
  budgetHealthBps: readonly bigint[],
): Map<string, bigint> {
  const monthsBps =
    spiralRunwayMonths === null
      ? COVENANT_UNBOUNDED_RUNWAY_BPS
      : (spiralRunwayMonths * 10_000n) / 65_536n;
  let health = COVENANT_FULL_HEALTH_BPS;
  for (const bps of budgetHealthBps) {
    if (bps < health) health = bps;
  }
  return new Map([
    [COVENANT_METRIC_RUNWAY_MONTHS_BPS, monthsBps],
    [COVENANT_METRIC_ERROR_BUDGET_HEALTH_BPS, health],
  ]);
}

/** One latched breach (audit g19 #2: the evaluator existed; the RECORD did
 *  not). Edge-triggered per month roll: a covenant that recovers leaves the
 *  active set and a later relapse logs again. OD-25 (insolvency posture) is
 *  OWNER-OPEN: breaches are observable data only — nothing here ends the
 *  game. */
export interface CovenantBreachRecord {
  readonly covenantId: string;
  readonly atBusinessMin: SimMinute;
  readonly monthIndex: number;
  readonly causeId: CauseId;
}

/** Covenants are DATA (the bank's card, P13-style): evaluate against bps
 *  readouts the caller assembles. Breach ids are the rules layer's cue. */
export function covenantBreaches(
  covenants: readonly Covenant[],
  readoutsBps: ReadonlyMap<string, bigint>,
): readonly string[] {
  const breaches: string[] = [];
  for (const c of covenants) {
    const value = readoutsBps.get(c.metricId);
    if (value === undefined) {
      throw new RangeError(`economy/runway: covenant '${c.id}' metric '${c.metricId}' has no readout`);
    }
    const violated = c.direction === "min" ? value < c.floorBps : value > c.floorBps;
    if (violated) breaches.push(c.id);
  }
  return breaches;
}

/* ──────────────────────── lose-slowly guard (§9.6) ────────────────────── */

export interface LoseSlowlyVerdict {
  readonly ok: boolean;
  /** Warning lead the player actually got, business minutes. */
  readonly leadBusinessMin: number;
  /** Minimum lead required, converted to business minutes (ceiling). */
  readonly requiredBusinessMin: number;
}

/** Business minutes in `realMinutes`, ceiling, via exact rational scale. */
export function businessMinutesForReal(
  realMinutes: number,
  scale: ClockScale = BUSINESS_SCALE_DEFAULT,
): number {
  if (!Number.isInteger(realMinutes) || realMinutes < 0) {
    throw new RangeError(`economy/runway: realMinutes ${realMinutes} must be a non-negative integer`);
  }
  const microReal = BigInt(realMinutes) * 60_000_000n;
  const businessUs = (microReal * scale.num) / scale.den;
  const ceilMin = (businessUs + 59_999_999n) / 60_000_000n;
  return Number(ceilMin);
}

/**
 * The ≥3-real-minute warning guard HOOK (§9.6 "lose slowly"): a projected
 * unavoidable-loss moment must be at least `cfg.runway.minWarningRealMinutes`
 * of REAL time after the moment the danger became visible. Enforcement is
 * scenario-side; this verdict is the tripwire the gates check.
 */
export function meetsLoseSlowlyGuard(
  warnedAtBusinessMin: number,
  projectedDeathAtBusinessMin: number,
  cfg: EconomyConfig,
  scale: ClockScale = BUSINESS_SCALE_DEFAULT,
): LoseSlowlyVerdict {
  if (projectedDeathAtBusinessMin < warnedAtBusinessMin) {
    throw new RangeError("economy/runway: death projected before the warning");
  }
  const lead = projectedDeathAtBusinessMin - warnedAtBusinessMin;
  const required = businessMinutesForReal(cfg.runway.minWarningRealMinutes, scale);
  return { ok: lead >= required, leadBusinessMin: lead, requiredBusinessMin: required };
}

/** Helper for display adapters: is runway strictly beyond N whole months? */
export function isBeyondRunway(months: Fixed | null, wholeMonths: number): boolean {
  if (months === null) return false;
  return compare(months, fromRatio(BigInt(wholeMonths), 1n)) > 0;
}
