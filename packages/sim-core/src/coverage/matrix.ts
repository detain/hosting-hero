/**
 * coverage/matrix.ts — one (threatRole × defenseRole) cell of the Coverage
 * Grid (hg §2.1, P17): the player's buildables projected onto the grid.
 *
 * COMBINE LAW — MAX, never sum. Two WAFs do not make you two× covered
 * against everything one WAF already answers; a second same-role buildable
 * adds resilience (depth, spares, counter-rotation) that this cell does NOT
 * model. Where to revisit: when capacity-vs-redundancy lands (topology
 * blast domains / economy spares), a second axis (how MANY answers) belongs
 * beside the grid, not inside the cell value — §2.1's "Second Answer" law
 * (every threat needs ≥2 counters from DIFFERENT roles) is modeled per-ROW
 * by `secondAnswerGaps`, per-cell max stays honest about capability depth.
 *
 * Determinism: strengths are kernel Fixed (Q16.16 bigint); the ladder is
 * Fixed-exact (pinned raw values); iteration is sorted or vocabulary-pinned.
 * No rng, no clock, no locale, no fs. Data-input decoupling: buildables
 * arrive as a plain CoverageProfile map, threat roles as plain data —
 * this module imports NOTHING from economy/policy/topology (grep-pinned).
 */
import type { Fixed } from "../types.ts";
import { compare, FIXED_ONE, FIXED_ZERO, fromRatio } from "../kernel/fixed.ts";
import type { ThreatRole } from "../waves/table.ts";
import { THREAT_ROLES } from "../waves/table.ts";
import type { DefenseRoleId } from "./defenseRoles.ts";
import { DEFENSE_ROLE_IDS, isDefenseRoleId } from "./defenseRoles.ts";
import { compareCodeUnits } from "../internal/canonical.ts";

/* ═══════════════════════════════ errors ═══════════════════════════════ */

export type CoverageErrorCode =
  | "BAD_THREAT_ROLE"
  | "BAD_DEFENSE_ROLE"
  | "BAD_STRENGTH"
  | "OUT_OF_RANGE"
  | "EMPTY_ROLES"
  | "UNKNOWN_THREAT";

/** Local boundary error (VersusError/LoaderError grammar, coverage prefix). */
export class CoverageError extends Error {
  readonly code: CoverageErrorCode;
  readonly path: string;

  constructor(code: CoverageErrorCode, path: string, message: string) {
    super(`coverage[${code}] at '${path}': ${message}`);
    this.name = "CoverageError";
    this.code = code;
    this.path = path;
  }
}

function fail(code: CoverageErrorCode, path: string, message: string): never {
  throw new CoverageError(code, path, message);
}

/* ═══════════════════════════ the cell-state ladder ═══════════════════════════ */

/** Four teaching states, worst-first (hg §2.1: "cells lit where you have an
 *  answer and conspicuously dark where you don't"). */
export type CoverageCellState = "dark" | "thin" | "ok" | "strong";

/** Ladder rungs as EXACT Fixed thresholds (a cell with strength s is in the
 *  first rung whose bound s is strictly below; s ≥ okBelow is "strong"):
 *    darkBelow  6554n  ≈ 0.1   (fromRatio(1,10), half-away rounding)
 *    thinBelow 26214n  ≈ 0.4   (fromRatio(2,5))
 *    okBelow   55706n  ≈ 0.85  (fromRatio(85,100))
 *  Pinned raw in tests — changing a rung changes the pedagogy, deliberately. */
export const COVERAGE_LADDER: Readonly<{ darkBelow: Fixed; thinBelow: Fixed; okBelow: Fixed }> =
  Object.freeze({
    darkBelow: fromRatio(1n, 10n),
    thinBelow: fromRatio(2n, 5n),
    okBelow: fromRatio(85n, 100n),
  });

/** State for one cell strength (§2.1 ladder, strict-below rungs). */
export function coverageCellState(strength: Fixed): CoverageCellState {
  if (typeof strength !== "bigint") {
    fail("BAD_STRENGTH", "coverageCellState", `strength must be Fixed (bigint), got ${typeof strength}`);
  }
  if (compare(strength, COVERAGE_LADDER.darkBelow) < 0) return "dark";
  if (compare(strength, COVERAGE_LADDER.thinBelow) < 0) return "thin";
  if (compare(strength, COVERAGE_LADDER.okBelow) < 0) return "ok";
  return "strong";
}

/* ═══════════════════════════ profile (data input) ═══════════════════════════ */

/** What ONE buildable brings to the grid.
 *  - `roles`: the defense-role columns it fills (≥1; §2.1 tags exactly one
 *    primary role, multi-role builds are representable but rarer).
 *  - `strengths`: optional per-threat-role calibration; a listed role pair
 *    uses that Fixed, an unlisted pair falls back to
 *    DEFAULT_UNCALIBRATED_STRENGTH. Calibration is how content says
 *    "this WAF answers Mimic fully but Tank only thinly." */
export interface BuildableCoverage {
  readonly roles: readonly DefenseRoleId[];
  readonly strengths?: Readonly<Partial<Record<ThreatRole, Fixed>>>;
}

/** buildableId → its coverage profile. Plain data, caller-sourced
 *  (content packs / versus DefenseDeck buildables — never read here). */
export type CoverageProfile = ReadonlyMap<string, BuildableCoverage>;

/** An uncalibrated (threatRole × declared column) cell sits at "ok" mid-band
 *  (0.5): building the right KIND of defense reads as a real answer, but
 *  never as a perfect one until content calibrates it. Taste call, OWNER. */
export const DEFAULT_UNCALIBRATED_STRENGTH: Fixed = fromRatio(1n, 2n);

/** Grid size law: 12 threat roles (§2.1, waves/THREAT_ROLES) × 9 defense
 *  roles (§2.1) = 108 cells. Recomputed, never hard-typed. */
export const COVERAGE_CELL_COUNT: number = THREAT_ROLES.length * DEFENSE_ROLE_IDS.length;

function assertThreatRole(value: string, path: string): ThreatRole {
  if (!(THREAT_ROLES as readonly string[]).includes(value)) {
    fail("BAD_THREAT_ROLE", path, `"${value}" is not one of the 12 waves THREAT_ROLES`);
  }
  return value as ThreatRole;
}

function assertStrength(value: unknown, path: string): Fixed {
  if (typeof value !== "bigint") {
    fail("BAD_STRENGTH", path, `strength must be Fixed (bigint), got ${typeof value}`);
  }
  if (compare(value, FIXED_ZERO) < 0) {
    fail("OUT_OF_RANGE", path, `strength ${value} is negative`);
  }
  if (compare(value, FIXED_ONE) > 0) {
    fail("OUT_OF_RANGE", path, `strength ${value} exceeds FIXED_ONE (a cell cannot over-cover)`);
  }
  return value as Fixed;
}

/** Parsed, validated buildable entry (Law 2: parse at the boundary, then
 *  internal logic trusts the shapes). Exported as a TYPE only — the way to
 *  obtain one is `resolveCoverageProfile`; fields are read via
 *  `deriveCoverageCell` in practice. */
export interface ResolvedBuildable {
  readonly buildableId: string;
  readonly roles: readonly DefenseRoleId[];
  readonly strengths: ReadonlyMap<ThreatRole, Fixed>;
}

function resolveBuildable(buildableId: string, entry: BuildableCoverage): ResolvedBuildable {
  const where = `buildable '${buildableId}'`;
  if (buildableId.length === 0) fail("EMPTY_ROLES", "profile", "buildable id must be non-empty");
  if (!Array.isArray(entry.roles) || entry.roles.length === 0) {
    fail("EMPTY_ROLES", where, "a buildable must declare at least one defense role");
  }
  const roles = new Set<DefenseRoleId>();
  for (const role of entry.roles) {
    if (!isDefenseRoleId(role)) fail("BAD_DEFENSE_ROLE", where, `"${String(role)}" is not a defense role`);
    roles.add(role);
  }
  const strengths = new Map<ThreatRole, Fixed>();
  for (const [threatRole, raw] of Object.entries(entry.strengths ?? {})) {
    assertThreatRole(threatRole, `${where}.strengths`);
    strengths.set(threatRole as ThreatRole, assertStrength(raw, `${where}.strengths.${threatRole}`));
  }
  return {
    buildableId,
    roles: Object.freeze([...roles].sort(compareCodeUnits)),
    strengths: Object.freeze(strengths) as ReadonlyMap<ThreatRole, Fixed>,
  };
}

/** Sort buildables by id (code-unit) — combine is max so order cannot
 *  change values, but freezing a canonical walk keeps digests calm. */
export function resolveCoverageProfile(profile: CoverageProfile): readonly ResolvedBuildable[] {
  const out: ResolvedBuildable[] = [];
  for (const [buildableId, entry] of profile) out.push(resolveBuildable(buildableId, entry));
  out.sort((a, b) => compareCodeUnits(a.buildableId, b.buildableId));
  return Object.freeze(out);
}

/* ═══════════════════════════════ cells ═══════════════════════════════ */

/** One computed grid cell: the answer to "how much does what I built blunt
 *  threats of THIS role via THIS kind of defense?" */
export interface CoverageCell {
  readonly threatRole: ThreatRole;
  readonly defenseRole: DefenseRoleId;
  /** Max over contributors' contributions (0 when nobody declares the column). */
  readonly strength: Fixed;
  /** Ladder state of `strength`. */
  readonly state: CoverageCellState;
  /** Buildables declaring this defense column, sorted code-unit. */
  readonly contributors: readonly string[];
}

/** MAX combine (doc header states why not sum). */
export function combineCoverageStrength(current: Fixed, contribution: Fixed): Fixed {
  return compare(contribution, current) > 0 ? contribution : current;
}

/** Compute one (threatRole × defenseRole) cell from a resolved profile. */
export function deriveCoverageCell(
  resolved: readonly ResolvedBuildable[],
  threatRole: ThreatRole,
  defenseRole: DefenseRoleId,
): CoverageCell {
  assertThreatRole(threatRole, "deriveCoverageCell.threatRole");
  if (!isDefenseRoleId(defenseRole)) {
    fail("BAD_DEFENSE_ROLE", "deriveCoverageCell.defenseRole", `"${String(defenseRole)}" is not a defense role`);
  }
  let strength = FIXED_ZERO;
  const contributors: string[] = [];
  for (const buildable of resolved) {
    if (!buildable.roles.includes(defenseRole)) continue;
    contributors.push(buildable.buildableId);
    const contribution = buildable.strengths.get(threatRole) ?? DEFAULT_UNCALIBRATED_STRENGTH;
    strength = combineCoverageStrength(strength, contribution);
  }
  return Object.freeze({
    threatRole,
    defenseRole,
    strength,
    state: coverageCellState(strength),
    contributors: Object.freeze(contributors),
  });
}
