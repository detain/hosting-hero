/**
 * coverage/invitations.ts — the grid ↔ attack-surface-ledger bridge:
 * `darkCellReport` is THE teaching payload (hg §2.1 / P17): for each threat
 * ROLE the player can currently face (spawnable pool), where is my answer
 * weakest? "Without this, a player facing a Sapper buys more walls and dies
 * confused."
 *
 * Data-input decoupling (the door's `canPlaceDevice` pattern): this module
 * does NOT import waves/ledger machinery. The caller folds the ledger —
 * `spawnableThreatIds` from ledger.ts, roles from the content census,
 * `recentInvites` from the G2 preview — and hands plain data here.
 *
 * P2 law tie-in (hg §9.13 gate G2 law): threats a build just made spawnable
 * MUST appear in the report — pass them as `recentInvites` and every row
 * carrying one lists its ids in `invitedThreatIds`.
 *
 * Determinism: pure · rows and id lists sorted code-unit · weakest-first by
 * Fixed strength then code-unit · no rng/clock/locale. Fail-loud on
 * threats without a declared role (an unplaceable threat is authored
 * garbage, Law 4).
 */
import type { Fixed } from "../types.ts";
import type { ThreatRole } from "../waves/table.ts";
import { THREAT_ROLES } from "../waves/table.ts";
import type { DefenseRoleId } from "./defenseRoles.ts";
import { DEFENSE_ROLE_IDS } from "./defenseRoles.ts";
import type { CoverageCellState, CoverageProfile } from "./matrix.ts";
import type { ResolvedBuildable } from "./matrix.ts";
import { CoverageError, coverageCellState, deriveCoverageCell, resolveCoverageProfile } from "./matrix.ts";
import { compareCodeUnits } from "../internal/canonical.ts";

/** threatId → the threat roles it occupies. VALUES ARE ARRAYS because the
 *  real registry is multi-role (ticket-avalanche-hydra = swarm + debuffer):
 *  one threat teaches about every role it plays. */
export type ThreatRoleCensus = ReadonlyMap<string, readonly ThreatRole[]>;

/** One row of the teaching payload: a threat role the player is exposed on. */
export interface DarkCellRow {
  readonly threatRole: ThreatRole;
  /** State of the row's BEST defense column — how exposed the role is. */
  readonly state: CoverageCellState;
  /** Defense columns below "ok" for this row, weakest-first (Fixed strength,
   *  ties code-unit) — the plain-language hole list ("Nothing you own
   *  changes an attacker's economics"). */
  readonly weakestDefenses: readonly DefenseRoleId[];
  /** Spawnable threats carrying this role, sorted code-unit. */
  readonly sampleThreatIds: readonly string[];
  /** P2 law: subset of `recentInvites` that rides this row, sorted code-unit. */
  readonly invitedThreatIds: readonly string[];
}

/** The nine cells of one threat-role row, in §2.1 column order. */
function rowCells(resolved: readonly ResolvedBuildable[], threatRole: ThreatRole) {
  return DEFENSE_ROLE_IDS.map((defenseRole) => deriveCoverageCell(resolved, threatRole, defenseRole));
}

/**
 * Which unblocked threats exploit which dark (or thin) cells?
 *
 * Rows are included when the role's best coverage is "dark" or "thin" AND at
 * least one spawnable threat plays that role — a hole nobody can poke is not
 * yet a lesson, and a covered row needs no nagging.
 *
 * @param profile             player buildables (buildableId → coverage data)
 * @param spawnableThreatIds  the ledger's current spawnable pool
 * @param threatRoleOf        threatId → roles census (plain data from content)
 * @param recentInvites       optional: threats the latest build just unlocked (P2)
 */
export function darkCellReport(
  profile: CoverageProfile,
  spawnableThreatIds: readonly string[],
  threatRoleOf: ThreatRoleCensus,
  recentInvites: readonly string[] = [],
): readonly DarkCellRow[] {
  const spawnable = new Set<string>(spawnableThreatIds);
  const invited = new Set<string>(recentInvites);

  // Fail loud BEFORE computing: every spawnable threat must be placeable on
  // the role axis, every invite must already ride the spawnable pool.
  for (const threatId of [...spawnable].sort(compareCodeUnits)) {
    const roles = threatRoleOf.get(threatId);
    if (roles === undefined) {
      throw new CoverageError("UNKNOWN_THREAT", `spawnable '${threatId}'`, "no declared threat roles in the census");
    }
    for (const role of roles) {
      if (!(THREAT_ROLES as readonly string[]).includes(role)) {
        throw new CoverageError("BAD_THREAT_ROLE", `threat '${threatId}'`, `"${String(role)}" is not one of the 12 waves THREAT_ROLES`);
      }
    }
  }
  for (const threatId of invited) {
    if (!spawnable.has(threatId)) {
      throw new CoverageError("UNKNOWN_THREAT", `recentInvite '${threatId}'`, "an invite must already be in the spawnable pool");
    }
  }

  // Bucket threats per role.
  const threatsByRole = new Map<ThreatRole, string[]>();
  for (const threatId of spawnable) {
    for (const role of threatRoleOf.get(threatId) as readonly ThreatRole[]) {
      const bucket = threatsByRole.get(role) ?? [];
      bucket.push(threatId);
      threatsByRole.set(role, bucket);
    }
  }

  const resolved = resolveCoverageProfile(profile);
  const rows: DarkCellRow[] = [];
  for (const [threatRole, threatIds] of [...threatsByRole].sort((a, b) => compareCodeUnits(a[0], b[0]))) {
    const cells = rowCells(resolved, threatRole);
    let best: Fixed = cells[0]?.strength ?? 0n;
    for (const cell of cells) if (cell.strength > best) best = cell.strength;
    const state: CoverageCellState = coverageCellState(best);
    if (state !== "dark" && state !== "thin") continue;

    const weakest = cells
      .filter((cell) => cell.state === "dark" || cell.state === "thin")
      .sort((a, b) => (a.strength !== b.strength ? (a.strength < b.strength ? -1 : 1) : compareCodeUnits(a.defenseRole, b.defenseRole)))
      .map((cell) => cell.defenseRole);
    const sortedThreats = [...threatIds].sort(compareCodeUnits);

    rows.push(
      Object.freeze({
        threatRole,
        state,
        weakestDefenses: Object.freeze(weakest),
        sampleThreatIds: Object.freeze(sortedThreats),
        invitedThreatIds: Object.freeze(sortedThreats.filter((t) => invited.has(t))),
      }),
    );
  }
  return Object.freeze(rows);
}
