/**
 * Patience bounce curve (R-10 silent bounce, R-60 sigmoid anchors,
 * `hosting_game.md §7.11` / types.ts PatienceModelParams.bounceSigmoid).
 *
 * THE RATIFIED ANCHOR SET — "10% bounce at 0.6× patience, 50% at 1.0×,
 * 95% at 1.6×" (MASTER_REPORT §4.1 R-60; types.ts documents the same triple
 * as the official bundle value).
 *
 * IMPLEMENTATION: an INTEGER LOOK-UP TABLE (documented LUT — the contract
 * allows "LUT-allowed if documented"):
 *  - the x-axis is elapsed/patience ratio in BASIS POINTS, gridded every
 *    0.5 % of the budget (50 bps) from 0 to 25 000 bps (250 %);
 *  - P(ratio) is piecewise-LINEAR through the three anchors plus the forced
 *    origin point (0 bps → 0 probability) and a saturation anchor
 *    (20 000 bps → 1.0): [0, 0.10@6000, 0.50@10000, 0.95@16000, 1.0@20000];
 *    ratios above 20 000 bps clamp to 1 — exactly hitting 95% AT 1.6× means
 *    the ramp to certainty continues past the last official anchor;
 *  - every table value is a Q16.16 Fixed raw integer produced by exact
 *    bigint interpolation — no float is evaluated anywhere, at build time or
 *    run time, so the curve is bit-reproducible across runtimes (§3.4);
 *  - lookup is O(1), monotone non-decreasing by construction (tested), and
 *    ratios beyond the grid clamp to 1 (a unit at >250 % of patience always
 *    bounces).
 *
 * Linear-through-anchors is the deliberate v0 profile: the spec pins the
 * three percentile anchors, not the curve shape between them, and a linear
 * fit hits the anchors EXACTLY (a logistic fit could only approximate two of
 * the three). Any future smooth-sigmoid replacement must keep the anchor
 * test green.
 */

import type { Fixed, SimTimeUs } from "../types.ts";
import { FIXED_UNIT, FIXED_ZERO, fromRatio } from "../kernel/fixed.ts";

/** Grid resolution: one entry per 50 bps (0.5 % of the patience budget). */
export const BOUNCE_GRID_BPS = 50;

/** Table spans ratios 0 … 250 % of the patience budget. */
export const BOUNCE_MAX_RATIO_BPS = 25_000;

/** Anchor points in (ratio bps, probability Fixed-raw) — R-60 exactly. */
const ANCHOR_RATIOS_BPS = [0, 6_000, 10_000, 16_000, 20_000] as const;
const ANCHOR_PROBABILITIES: readonly Fixed[] = [
  FIXED_ZERO,
  fromRatio(1n, 10n), // 10 %
  fromRatio(1n, 2n), // 50 %
  fromRatio(19n, 20n), // 95 %
  FIXED_UNIT, // certainty at 2× the budget
];

/** Round-half-up integer linear interpolation (bigint-exact). */
function lerpRaw(y1: bigint, y2: bigint, x: bigint, x1: bigint, x2: bigint): Fixed {
  const span = x2 - x1;
  const delta = y2 - y1;
  const raw = delta * (x - x1);
  const rounded = (raw + span / 2n) / span;
  return y1 + rounded;
}

function probabilityAtRatioBps(ratioBps: number): Fixed {
  if (ratioBps <= 0) return FIXED_ZERO;
  if (ratioBps >= ANCHOR_RATIOS_BPS[ANCHOR_RATIOS_BPS.length - 1]!) return FIXED_UNIT;
  for (let i = 1; i < ANCHOR_RATIOS_BPS.length; i += 1) {
    const x1 = BigInt(ANCHOR_RATIOS_BPS[i - 1]!);
    const x2 = BigInt(ANCHOR_RATIOS_BPS[i]!);
    const x = BigInt(ratioBps);
    if (x <= x2) {
      return lerpRaw(ANCHOR_PROBABILITIES[i - 1]!, ANCHOR_PROBABILITIES[i]!, x, x1, x2);
    }
  }
  return FIXED_UNIT; // unreachable — kept for exhaustiveness clarity
}

const BOUNCE_LUT: readonly Fixed[] = buildLut();

function buildLut(): readonly Fixed[] {
  const table: Fixed[] = [];
  for (let bps = 0; bps <= BOUNCE_MAX_RATIO_BPS; bps += BOUNCE_GRID_BPS) {
    table.push(probabilityAtRatioBps(bps));
  }
  return Object.freeze(table);
}

/** Public read: bounce probability (Fixed 0..1) at a patience ratio given in
 *  basis points. Clamped both ends; monotone by construction. */
export function bounceProbability(ratioBps: number): Fixed {
  if (!Number.isFinite(ratioBps) || ratioBps <= 0) return FIXED_ZERO;
  if (ratioBps >= BOUNCE_MAX_RATIO_BPS) return FIXED_UNIT;
  const index = Math.floor(ratioBps / BOUNCE_GRID_BPS);
  return BOUNCE_LUT[index] ?? FIXED_UNIT;
}

/** Elapsed vs patience → ratio in basis points (pure bigint division; a
 *  zero/negative patience budget is instantly over the line). */
export function patienceRatioBps(elapsedUs: SimTimeUs, patienceUs: SimTimeUs): number {
  if (patienceUs <= 0n) return BOUNCE_MAX_RATIO_BPS + 1;
  const bps = (elapsedUs * 10_000n) / patienceUs;
  const asNumber = Number(bps);
  return asNumber > BOUNCE_MAX_RATIO_BPS + 1 ? BOUNCE_MAX_RATIO_BPS + 1 : asNumber;
}

/** Exported for the accuracy test — raw table access. */
export function bounceLutEntry(index: number): Fixed {
  const value = BOUNCE_LUT[index];
  if (value === undefined) {
    throw new Error(`bounceLutEntry: index ${index} out of range`);
  }
  return value;
}

export const BOUNCE_LUT_LENGTH = BOUNCE_LUT.length;
