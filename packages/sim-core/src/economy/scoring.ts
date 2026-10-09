/**
 * Scorecard CONFIG (MASTER_REPORT §6.9 + §6.16; OD-1 RATIFIED 2026-10-09:
 * choice (c) "commitment-convergence" is ACTIVE — availability scored
 * against the SOLD SLA; the conversion-funnel axis is DISPLAYED LEADING in
 * presentation, but the active weight set is the C candidate. Recorded in
 * docs/adr/0009-owner-ratifications-calibration.md).
 *
 * Three candidate weight sets still live SIDE BY SIDE as comparison data —
 * G5's score screen grades BOTH forks over the same save — and
 * `defaultScorecardConfig.active` now resolves. `getActiveScorecard()`
 * THROWS only for configs that explicitly pass `active: null`: an
 * unresolved caller must fail loud (Law 4), never score by a guessed rubric.
 *
 * Provenance of the three candidates (hosting_game.md line cites):
 *  - "uptime-first" — §6.9 DEFAULT / §6.16:25639 Uptime 30 / Perf 20 /
 *    Profit 30 / Growth 20.
 *  - "conversion-first" — §6.9 ⚔️ CONVERSION-FIRST: Conversion 35 /
 *    Profit 25 / Resilience 20 / Growth 20 (uptime folded into conversion).
 *  - "commitment-convergence" — §6.9 SECOND REFRAMING ("both camps accept:
 *    availability scored against the COMMITMENT, not raw uptime"; OD-1c:
 *    "99.95% on a 99.9% contract beats 99.99% on a 99.99% contract").
 *    ACTIVE by owner decision 2026-10-09; the numbers MIRROR uptime-first —
 *    no new weights were ratified, so the values stay the §6.9 mirror while
 *    the axis SEMANTICS are law.
 *
 * Tuning-sheet A|B|C attribution: Appendix D lists the weight sets as SHARED
 * CONSTANTS across all three sheets, so the A/B/C tags here map each
 * candidate to its lens lineage (A generalist/physics, B game-designer,
 * C CEO/market) for bookkeeping and are AUTHOR-ATTRIBUTED (OD-2 ratified
 * sheet B canonical on 2026-10-09; these lens tags are unaffected).
 *
 * Fifth-axis law (§6.9): per-type bundles replace 20 pts proportionally
 * (30/20/30/20 → 24/16/24/16 + 20); the math requires every base weight
 * divisible by 5 — enforced, not assumed.
 */

import { FIXED_ONE, FIXED_ZERO, add, compare, fromRatio, mul } from "../kernel/fixed.ts";
import type { Fixed } from "../types.ts";
import type { TuningSheet } from "./config.ts";

/* Canonical axis ids (open strings allowed for per-type fifth axes). */
export const AXIS = {
  UPTIME: "uptime",
  /** Availability measured against the SOLD commitment (OD-1c semantics). */
  AVAILABILITY_VS_COMMITMENT: "availability-vs-commitment",
  PERFORMANCE: "performance",
  PROFITABILITY: "profitability",
  GROWTH: "growth",
  CONVERSION: "conversion",
  RESILIENCE: "resilience",
} as const;

export type ScoreAxisId = string;

/** Integer points, sum MUST be 100 (validated at construction). */
export type ScoreWeights = Readonly<Record<ScoreAxisId, number>>;

export interface ScorecardCandidate {
  readonly id: string;
  readonly tuningSheet: TuningSheet;
  readonly weights: ScoreWeights;
  /** Provenance cite for humans reading the config. */
  readonly source: string;
}

function assertWeightsSum100(id: string, weights: ScoreWeights): void {
  const entries = Object.entries(weights) as [ScoreAxisId, number][];
  if (entries.length < 3) {
    throw new RangeError(`economy/scoring: candidate '${id}' needs >= 3 axes`);
  }
  const sum = entries.reduce((acc, [, pts]) => acc + pts, 0);
  if (sum !== 100) {
    throw new RangeError(`economy/scoring: candidate '${id}' weights sum to ${sum}, must be exactly 100`);
  }
}

function candidate(
  id: string,
  tuningSheet: TuningSheet,
  weights: ScoreWeights,
  source: string,
): ScorecardCandidate {
  assertWeightsSum100(id, weights);
  return { id, tuningSheet, weights, source };
}

/** The three candidates, LIVE from §6.9/§6.16 (see header for cites). */
export const SCORECARD_CANDIDATES: readonly ScorecardCandidate[] = [
  candidate(
    "uptime-first",
    "A",
    { [AXIS.UPTIME]: 30, [AXIS.PERFORMANCE]: 20, [AXIS.PROFITABILITY]: 30, [AXIS.GROWTH]: 20 },
    "hosting_game.md §6.9 default / §6.16:25639",
  ),
  candidate(
    "conversion-first",
    "B",
    { [AXIS.CONVERSION]: 35, [AXIS.PROFITABILITY]: 25, [AXIS.RESILIENCE]: 20, [AXIS.GROWTH]: 20 },
    "hosting_game.md §6.9 conversion-first camp",
  ),
  candidate(
    "commitment-convergence",
    "C",
    { [AXIS.AVAILABILITY_VS_COMMITMENT]: 30, [AXIS.PERFORMANCE]: 20, [AXIS.PROFITABILITY]: 30, [AXIS.GROWTH]: 20 },
    "hosting_game.md §6.9 second reframing (OD-1c); ACTIVE by owner decision 2026-10-09 — weights remain the §6.9 mirror (no new numbers ratified)",
  ),
] as const;

export interface ScorecardConfig {
  readonly candidates: readonly ScorecardCandidate[];
  /** The OD-1 choice — ratified default "commitment-convergence" (2026-10-09).
   *  null still means UNRESOLVED for any other config: getActiveScorecard fails loud. */
  readonly active: string | null;
}

/** OD-1 RATIFIED 2026-10-09 (docs/adr/0009-owner-ratifications-calibration.md):
 *  choice (c) commitment-convergence is ACTIVE — availability scored against
 *  the SOLD SLA. The conversion-funnel axis is DISPLAYED LEADING (presentation
 *  layer); the active weight set is the C candidate. */
export const defaultScorecardConfig: ScorecardConfig = {
  candidates: SCORECARD_CANDIDATES,
  active: "commitment-convergence",
};

export function getActiveScorecard(config: ScorecardConfig): ScorecardCandidate {
  if (config.active === null) {
    throw new Error(
      "economy/scoring: scorecard explicitly null in this config — OD-1 is RATIFIED " +
        "(choice (c) commitment-convergence, owner decision 2026-10-09, " +
        "docs/adr/0009-owner-ratifications-calibration.md; candidates catalogued in " +
        "MASTER_REPORT.md §6.9/§6.16); a null here means the caller deliberately " +
        "left it unresolved. Set ScorecardConfig.active to one of: " +
        `${config.candidates.map((c) => `'${c.id}'`).join(", ")}.`,
    );
  }
  const found = config.candidates.find((c) => c.id === config.active);
  if (found === undefined) {
    throw new RangeError(
      `economy/scoring: active '${config.active}' is not a known candidate (${config.candidates
        .map((c) => c.id)
        .join(", ")})`,
    );
  }
  return found;
}

/* ───────────────────────── fifth-axis displacement ────────────────────── */

/** Doc-standard fifth-axis worth — LIVE 20 (§6.9 "a fifth axis worth 20"). */
export const FIFTH_AXIS_POINTS = 20;

/**
 * "A per-type fifth axis worth 20 displacing the others proportionally"
 * (§6.9). Requires every base weight divisible by 5 so the ×(100−w)/100
 * displacement stays integral — fail loud otherwise (Law 4); no silent
 * rounding of a scoring rubric.
 */
export function applyFifthAxis(
  base: ScorecardCandidate,
  fifthAxisId: ScoreAxisId,
  fifthPoints: number = FIFTH_AXIS_POINTS,
): ScoreWeights {
  const keep = 100 - fifthPoints;
  if (fifthPoints <= 0 || fifthPoints >= 100) {
    throw new RangeError(`economy/scoring: fifth axis points ${fifthPoints} outside (0,100)`);
  }
  const next: Record<ScoreAxisId, number> = {};
  for (const [axis, pts] of Object.entries(base.weights) as [ScoreAxisId, number][]) {
    const displaced = (pts * keep) / 100;
    if (!Number.isInteger(displaced)) {
      throw new RangeError(
        `economy/scoring: '${base.id}' axis '${axis}'=${pts} not divisible for ×${keep}/100 fifth-axis displacement (§6.9)`,
      );
    }
    next[axis] = displaced;
  }
  next[fifthAxisId] = fifthPoints;
  assertWeightsSum100(`${base.id}+${fifthAxisId}`, next);
  return next;
}

/* ───────────────────────────── composite score ────────────────────────── */

/** Each axis score is a Fixed in [0,1] (observed vs target ratios are the
 *  caller's business); composite = Σ weight×axis, returned as Fixed [0,1]. */
export function compositeScore(
  weights: ScoreWeights,
  axisScores: ReadonlyMap<ScoreAxisId, Fixed>,
): Fixed {
  let total: Fixed = FIXED_ZERO;
  for (const [axis, pts] of Object.entries(weights) as [ScoreAxisId, number][]) {
    const axisScore = axisScores.get(axis);
    if (axisScore === undefined) {
      throw new RangeError(`economy/scoring: missing axis score '${axis}' for composite`);
    }
    if (compare(axisScore, FIXED_ZERO) < 0 || compare(axisScore, FIXED_ONE) > 0) {
      throw new RangeError(`economy/scoring: axis '${axis}' score ${axisScore} outside [0,1] Fixed`);
    }
    total = add(total, mul(fromRatio(BigInt(pts), 100n), axisScore));
  }
  return total;
}

/* ────────────────────────────── grade bands ───────────────────────────── */

export type Grade = "S" | "A" | "B" | "C" | "D" | "F";

/** S≥92 A≥82 B≥70 C≥58 D≥45 F — LIVE §6.16:25638 (bands sourced from sheet B
 *  per Appendix D). Stored as bps of 100 so comparison stays integer. */
export const GRADE_BANDS_BPS: readonly (readonly [Grade, bigint])[] = [
  ["S", 9200n],
  ["A", 8200n],
  ["B", 7000n],
  ["C", 5800n],
  ["D", 4500n],
] as const;

/** composite [0,1] Fixed → letter grade. bps conversion rounds half-away
 *  (same kernel discipline) so exact doc bands like 0.82 land on "A". */
export function gradeFor(composite: Fixed): Grade {
  const bps = (composite * 10_000n * 2n + 65_536n) / (65_536n * 2n);
  for (const [grade, floorBps] of GRADE_BANDS_BPS) {
    if (bps >= floorBps) return grade;
  }
  return "F";
}
