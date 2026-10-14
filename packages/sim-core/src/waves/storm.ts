/**
 * D-7 storm-cap arithmetic (ADR-0013 ruling 6): the single home for the
 * math both enforcement doors share, so the parse-time ceiling and the
 * plan-time clamp measure a wave with EXACTLY the same half-up micro
 * arithmetic the generator mints with.
 *
 * Two doors, one number:
 *  - `authoredWaveStormBudget` — table.ts refuses a wave whose AUTHORED
 *    worst-minute load (body, or its second-incident follow-on copy) exceeds
 *    STORM_CAP.rateUnitsPerMinute. Fail-loud at parse, naming the wave.
 *  - `stormPlanBudget` + `scaleStormCounts` — generate.ts clamps the
 *    EMERGENT count sum (director entropy band ×1.25, custom pressureParams,
 *    copycat share rounding can all push a legal table past the ceiling at
 *    plan time). Pure function of inputs, zero RNG: director draws are
 *    replay-logged, so the clamp must be deterministic.
 *
 * Worst-minute model (honest bounds, not a minute-by-minute re-sim):
 *  - oversell contention at the 30:1 detent clumps a whole entry onto the
 *    peak minute, so the body bound is the SUM of all entry counts.
 *  - the second-incident copy mirrors each original's minute offset AFTER
 *    the envelope, so it rides DIFFERENT minutes than the body — the bound
 *    is max(body, follow-on), never their sum.
 *  - feints re-park a quarter of each entry's ordinals onto the opening
 *    beat; that is a subset of the body, so the body bound covers it.
 */
import { STORM_CAP } from "./bands.ts";
import type { PressureParams } from "./pressure.ts";
import { mulDivRound, parPressureMicro } from "./pressure.ts";
import type { WaveDefinition, WaveRules } from "./table.ts";

const SHARE_SCALE = 10_000n; // sharePct (int %) → micro (×1e4 keeps ÷100 exact)
const MICRO = 1_000_000n;

/** Units = pressureMicro × shareMicro × unitsPerPoint ÷ 1e12, exact integer
 *  round-half-up in the micro domain (no floats touch logic). The authored
 *  integer-percent path passes shareMicro = sharePct × 10_000n, which
 *  reproduces the legacy ÷(100 × 1e6) formula EXACTLY (both terms scale
 *  by 1e4 — same half-up quotient). */
export function entryUnitCountMicro(
  pressureMicro: bigint,
  shareMicro: bigint,
  unitsPerPressurePoint: number,
): number {
  return Number(mulDivRound(pressureMicro * shareMicro * BigInt(unitsPerPressurePoint), MICRO * MICRO));
}

/** A wave's mintable load, measured with the generator's own arithmetic. */
export interface WaveStormBudget {
  /** Σ units across all composition lines (peak-minute worst case: the
   *  contention die can clump the entire body onto one minute). */
  readonly bodyUnits: number;
  /** Σ follow-on copy units the SECOND-INCIDENT rule would mint at the
   *  strongest authored multiplier (0 unless the wave is flagged). */
  readonly followOnUnits: number;
  /** max(body, follow-on) — the copy rides minutes AFTER the envelope. */
  readonly worstMinuteUnits: number;
}

/**
 * Author-time storm budget of one wave. Uses the table's OWN tuning sheet
 * at NEUTRAL (1.0) director state — the honest caveat: the director clamps
 * BOTH subjects (sawtooth-trough-depth and entropy-budget) to
 * [0.75, 1.25], so a trough minute can measure up to ~25% ABOVE neutral,
 * not only below it. Any such emergent excess over the parse-time ceiling
 * is caught by the plan-time clamp (scaleStormCounts) — that is the second
 * door's job, exactly as for the ×1.25 entropy uplift.
 * Copycat share re-scales move at most ±1 unit per entry against this sum
 * (shares still total exactly 1e6) — any emergent excess is clamped at plan
 * time, which is the second door's job.
 */
export function authoredWaveStormBudget(
  wave: WaveDefinition,
  params: PressureParams,
  unitsPerPressurePoint: number,
  rules: WaveRules | undefined,
): WaveStormBudget {
  const pressureMicro = mulDivRound(
    parPressureMicro(params, wave.n - 1) * BigInt(wave.parPct),
    100n,
  );
  let bodyUnits = 0;
  for (const entry of wave.entries) {
    bodyUnits += entryUnitCountMicro(pressureMicro, BigInt(entry.sharePct) * SHARE_SCALE, unitsPerPressurePoint);
  }
  // Strongest authored follow-on multiplier (§2.24): parse guarantees > 1.
  const maxMultiplier = Math.max(
    rules?.secondIncidentMultiplierDuringIncident ?? 0,
    rules?.secondIncidentMultiplierDuringRecovery ?? 0,
  );
  let followOnUnits = 0;
  if (wave.secondIncident === true && maxMultiplier > 1) {
    const extraMicro = BigInt(Math.round((maxMultiplier - 1) * 1_000_000));
    for (const entry of wave.entries) {
      const count = entryUnitCountMicro(pressureMicro, BigInt(entry.sharePct) * SHARE_SCALE, unitsPerPressurePoint);
      followOnUnits += Number(mulDivRound(BigInt(count) * extraMicro, MICRO));
    }
  }
  return {
    bodyUnits,
    followOnUnits,
    worstMinuteUnits: Math.max(bodyUnits, followOnUnits),
  };
}

/**
 * Stack factor of the follow-on door: the worst simultaneous mint multiple a
 * wave can reach while its incident window is open. The plan-time clamp
 * divides the ceiling by this so original + copy EACH stay under the
 * ceiling — a 2.5× follow-on (extraMicro = 1.5e6) means the body may use at
 * most ceiling/1.5 so the copied minute tops out at ceiling.
 * Undefined/inert multiplier ⇒ 1.0 (no clamping headroom needed).
 */
export function stormStackFactorMicro(siMultiplier: number | undefined): bigint {
  if (siMultiplier === undefined) return MICRO;
  const extraMicro = BigInt(Math.round((siMultiplier - 1) * 1_000_000));
  return extraMicro > MICRO ? extraMicro : MICRO;
}

/** Unit budget the plan-time clamp must hold the ORIGINAL mint sum to, so
 *  neither the body minute nor the follow-on minute can exceed `ceiling`. */
export function stormPlanBudgetUnits(ceiling: number, siMultiplier: number | undefined): number {
  const stackFactor = stormStackFactorMicro(siMultiplier);
  return Number((BigInt(ceiling) * MICRO) / stackFactor);
}

export interface StormCountScaling<T> {
  readonly counts: readonly T[];
  /** True only when the ceiling actually cut the mint — the caller stamps
   *  the plan presence-only (`stormClamped`) and the census stays honest. */
  readonly clamped: boolean;
}

/**
 * Deterministic proportional shrink (floor, no redistribution — conservative
 * under-mint, never a rounding lottery): scale every entry count so the sum
 * fits `budgetUnits`. Identity when already within budget.
 */
export function scaleStormCounts<T extends { readonly count: number }>(
  counts: readonly T[],
  budgetUnits: number,
): StormCountScaling<T> {
  if (!Number.isSafeInteger(budgetUnits) || budgetUnits < 0) {
    throw new Error(`storm clamp: bad budgetUnits ${String(budgetUnits)}`);
  }
  const total = counts.reduce((s, c) => s + c.count, 0);
  if (total <= budgetUnits || total === 0) return { counts, clamped: false };
  const budget = BigInt(budgetUnits);
  const totalB = BigInt(total);
  const scaled = counts.map((c) => ({ ...c, count: Number((BigInt(c.count) * budget) / totalB) }));
  return { counts: scaled, clamped: true };
}

/** Fail-loud validation of a host-supplied ceiling override. */
export function parseStormCeilingOverride(value: number | undefined, where: string): number {
  if (value === undefined) return STORM_CAP.rateUnitsPerMinute;
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error(`${where}: stormCeilingUnitsPerMinute must be an integer ≥ 1, got ${String(value)}`);
  }
  return value;
}
