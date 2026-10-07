/**
 * coverage/ — the Coverage Grid (hg §2.1 "The Nine Defense Roles and the
 * Coverage Grid", P17): 12 threat roles (waves/THREAT_ROLES, reused) × 9
 * defense roles, teaching DARK CELLS — capabilities you lack are visible
 * as holes before they hurt you.
 *
 * Barrel discipline: EXPLICIT named exports only (versus/replay-style) so
 * the root re-export collision census is auditable.
 *
 *   defenseRoles.ts — the nine defense roles (§2.1 table, verbatim)
 *   matrix.ts       — cells, the Fixed ladder, MAX-combine, profile parser
 *   grid.ts         — render-agnostic whole-grid projection + Second Answer gaps
 *   invitations.ts  — darkCellReport: spawnable threats × dark rows (G2/P2 bridge)
 *
 * Import rule: this dir reads ../types, ../kernel, ../waves (THREAT_ROLES
 * vocabulary only), ../internal (code-unit compare) — and NEVER economy,
 * policy, or topology (grep-pinned by test): buildables, spawnable pools,
 * and role censuses enter as PLAIN DATA, door-canPlaceDevice style.
 */

/* defenseRoles.ts */
export { DEFENSE_ROLES, DEFENSE_ROLE_IDS, isDefenseRoleId } from "./defenseRoles.ts";
export type { DefenseRole, DefenseRoleId } from "./defenseRoles.ts";

/* matrix.ts */
export {
  COVERAGE_CELL_COUNT,
  COVERAGE_LADDER,
  DEFAULT_UNCALIBRATED_STRENGTH,
  CoverageError,
  combineCoverageStrength,
  coverageCellState,
  deriveCoverageCell,
  resolveCoverageProfile,
} from "./matrix.ts";
export type {
  BuildableCoverage,
  CoverageCell,
  CoverageCellState,
  CoverageErrorCode,
  CoverageProfile,
  ResolvedBuildable,
} from "./matrix.ts";

/* grid.ts */
export { buildCoverageGrid, coverageCellKey, secondAnswerGaps } from "./grid.ts";
export type { CoverageGrid, CoverageGridInput, CoverageGridSummary } from "./grid.ts";

/* invitations.ts */
export { darkCellReport } from "./invitations.ts";
export type { DarkCellRow, ThreatRoleCensus } from "./invitations.ts";
