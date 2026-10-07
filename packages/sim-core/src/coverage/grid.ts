/**
 * coverage/grid.ts — the render-agnostic Coverage Grid projection (hg §2.1,
 * P17): the whole 12×9 matrix as ONE deterministic, digest-stable object a
 * HUD panel (or a replay codec, later) can read without recomputing law.
 *
 * Shape law: rows = waves THREAT_ROLES (vocabulary order), cols = the nine
 * defense slugs (§2.1 table order), cells keyed `"threatRole|defenseRole"`
 * with INSERTION order sorted code-unit — so `encodeTaggedTree` (Map walk
 * is insertion-order significant, canonical.ts) digests byte-stably and
 * `../pipeline/digest.ts` could absorb the grid if wired later (pinned).
 *
 * Everything is primitives + Fixed bigints; deep-frozen at the boundary.
 */
import type { Fixed } from "../types.ts";
import { FIXED_ZERO } from "../kernel/fixed.ts";
import type { ThreatRole } from "../waves/table.ts";
import { THREAT_ROLES } from "../waves/table.ts";
import type { DefenseRoleId } from "./defenseRoles.ts";
import { DEFENSE_ROLE_IDS } from "./defenseRoles.ts";
import type { CoverageCell, CoverageProfile } from "./matrix.ts";
import { deriveCoverageCell, resolveCoverageProfile } from "./matrix.ts";
import { compareCodeUnits } from "../internal/canonical.ts";

/** Cell key grammar: `<threatRole>|defenseRole>` — one pipe, slugs are
 *  pipe-free by vocabulary construction. */
export function coverageCellKey(threatRole: ThreatRole, defenseRole: DefenseRoleId): string {
  return `${threatRole}|${defenseRole}`;
}

/** Aggregate read-out for the panel header (§2.1 "a row with no filled cell
 *  is a hole, and the game says so"). */
export interface CoverageGridSummary {
  readonly darkCount: number;
  readonly thinCount: number;
  readonly okCount: number;
  readonly strongCount: number;
  /** Max strength over all cells (FIXED_ZERO on an empty board). */
  readonly bestCoverage: Fixed;
  /** Keys of every DARK cell, sorted code-unit — the visible holes. */
  readonly holePairs: readonly string[];
}

/** The whole grid as one pure-data projection. */
export interface CoverageGrid {
  /** 12 threat roles, waves vocabulary order. */
  readonly rows: readonly ThreatRole[];
  /** 9 defense roles, §2.1 table order. */
  readonly cols: readonly DefenseRoleId[];
  /** 108 cells, inserted in code-unit-sorted key order (digest law). */
  readonly cells: ReadonlyMap<string, CoverageCell>;
  readonly summary: CoverageGridSummary;
}

export interface CoverageGridInput {
  readonly profile: CoverageProfile;
}

/** Build the full 12×9 grid from the player's buildables-as-data. */
export function buildCoverageGrid(input: CoverageGridInput): CoverageGrid {
  const resolved = resolveCoverageProfile(input.profile);
  const flat: CoverageCell[] = [];
  for (const threatRole of THREAT_ROLES) {
    for (const defenseRole of DEFENSE_ROLE_IDS) {
      flat.push(deriveCoverageCell(resolved, threatRole, defenseRole));
    }
  }
  // Sorted insertion so the canonical Map walk is order-independent of the
  // vocabulary declarations (rows/cols above keep their pedagogical order).
  flat.sort((a, b) => compareCodeUnits(coverageCellKey(a.threatRole, a.defenseRole), coverageCellKey(b.threatRole, b.defenseRole)));

  const cells = new Map<string, CoverageCell>();
  let darkCount = 0;
  let thinCount = 0;
  let okCount = 0;
  let strongCount = 0;
  let bestCoverage: Fixed = FIXED_ZERO;
  const holePairs: string[] = [];
  for (const cell of flat) {
    cells.set(coverageCellKey(cell.threatRole, cell.defenseRole), cell);
    if (cell.state === "dark") darkCount += 1;
    else if (cell.state === "thin") thinCount += 1;
    else if (cell.state === "ok") okCount += 1;
    else strongCount += 1;
    if (cell.strength > bestCoverage) bestCoverage = cell.strength;
    if (cell.state === "dark") holePairs.push(coverageCellKey(cell.threatRole, cell.defenseRole));
  }
  holePairs.sort(compareCodeUnits);

  // Frozen for property integrity; Map SET-semantics stay compile-time
  // law (ReadonlyMap view — BoardState precedent in types.ts).
  const frozenCells: ReadonlyMap<string, CoverageCell> = Object.freeze(cells);
  return Object.freeze({
    rows: THREAT_ROLES,
    cols: DEFENSE_ROLE_IDS,
    cells: frozenCells,
    summary: Object.freeze({
      darkCount,
      thinCount,
      okCount,
      strongCount,
      bestCoverage,
      holePairs: Object.freeze(holePairs),
    }),
  });
}

/** §2.1 Second Answer law: "Every threat needs at least two viable counters
 *  drawn from DIFFERENT defense roles." Rows with fewer than two cells at
 *  "ok" or better are single-answer (tax, not decision) — plain-language
 *  teaching rows for the panel. Vocabulary-ordered, deterministic. */
export function secondAnswerGaps(grid: CoverageGrid): readonly ThreatRole[] {
  const gaps: ThreatRole[] = [];
  for (const threatRole of grid.rows) {
    let answers = 0;
    for (const defenseRole of grid.cols) {
      const cell = grid.cells.get(coverageCellKey(threatRole, defenseRole));
      if (cell !== undefined && (cell.state === "ok" || cell.state === "strong")) answers += 1;
    }
    if (answers < 2) gaps.push(threatRole);
  }
  return Object.freeze(gaps);
}


