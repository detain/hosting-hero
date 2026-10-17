/**
 * coverage/affixLegs.ts — the §2.13 affix COVERAGE-STRENGTH leg (owner
 * ruling 2026-10-17, max feature): "Each mix-in invalidates exactly one
 * defense role" (hg §2.13) applied to the Coverage Grid (hg §2.1, whose own
 * row says "Interacts with: §2.13 mix-ins (each mix-in invalidates exactly
 * one defense role)").
 *
 * The doc law is COLUMN-specific: a mix-in does not move which threat-role
 * rows matter — it turns the one defense role it names into a non-answer
 * against threats wearing the mix-in ("Encrypted beats Classify without
 * termination"). So the leg NULLIFIES A GRID COLUMN in the affixed view:
 * every one of the 12 rows reads dark in the nullified column regardless of
 * calibration, while `contributors` is KEPT — the honest tooltip is "you own
 * these here; this threat ignores them."
 *
 * Scope honesty (measurement-before-claim): only the five slugs whose §2.13
 * mapping line names one of the nine columns carry a leg —
 *   distributed → meter · encrypted → classify · low-slow → detect
 *   adaptive → deter · piggyback → absorb
 * The other eleven are null with per-row reasons. Three doc lines name
 * NON-columns ("staffed response", "any fixed threshold", "Hands" are
 * §7.5 attention / threshold-class mechanics, not §2.1 defense roles), and
 * eight slugs have no mapping line at all. Inventing legs for the sake of
 * symmetry is exactly the fake the grid cannot see — refused.
 *
 * Relationship to the wave-semantics leg: versus/affixes.ts is the single
 * authority for what a slug does to a converted WAVE (band/shape/window/
 * feint…); THIS table is the authority for what it does to COVERAGE. They
 * are separate legs of the same doc law, joined only by tests: a coherence
 * pin proves every nullifying slug is `live: true` in AFFIX_WAVE_DELTAS
 * (a data-only affix cannot invalidate anything). Cross-check for readers:
 * the three bandOverride slugs (encrypted→hunter, adaptive→entropy,
 * piggyback→weather) all nullify a column too — the invisibility band and
 * the defeated answer tell one story.
 *
 * Mirror discipline: the 16-key slug set + order is drift-pinned against
 * versus/deck.ts `AFFIX_VOCABULARY` by the test suite (elasticity's
 * PRICE_KEY_KINDS-vs-intent-door precedent). Coverage's import law forbids
 * a ../versus edge in src — the pins import cross-module TEST-side only.
 *
 * Determinism: pure · no rng / clock / locale · the nullified cell pins
 * strength to FIXED_ZERO (no new Fixed arithmetic) · an absent/null affix
 * is the byte-identity twin of the unaffixed computation (pinned).
 */
import { FIXED_ZERO } from "../kernel/fixed.ts";
import type { ThreatRole } from "../waves/table.ts";
import type { DefenseRoleId } from "./defenseRoles.ts";
import type { CoverageCell, CoverageCellState, ResolvedBuildable } from "./matrix.ts";
import { CoverageError, coverageCellState, deriveCoverageCell } from "./matrix.ts";

/**
 * §2.13 slug → the defense column it invalidates (null = no coverage leg).
 * Keys mirror versus AFFIX_VOCABULARY 1:1 in declaration order — pinned.
 * Each row cites its doc line; the nulls record WHY nothing was invented.
 */
export const AFFIX_COVERAGE_NULLIFIES: Readonly<Record<string, DefenseRoleId | null>> = Object.freeze({
  /* "Low & Slow beats Detect thresholds." (hg §2.13 invalidates table) */
  "low-slow": "detect",
  /* "Distributed beats per-IP Meter." */
  "distributed": "meter",
  /* "Encrypted beats Classify without termination." */
  "encrypted": "classify",
  /* "Adaptive beats static Deter." */
  "adaptive": "deter",
  /* "Timed beats staffed response" — staffed response is the §7.5 hands /
   * org-chart mechanic, not one of the nine defense columns: no grid leg. */
  "timed": null,
  /* "Piggyback beats blanket Absorb." */
  "piggyback": "absorb",
  /* No line in the §2.13 invalidates table names a role for it. */
  "mimic": null,
  /* "Punishes half-fixes" — persistence is an attrition law, not a column. */
  "persistent": null,
  /* Timed's roster extension (§4.7 unbuilt) — names no column. */
  "off-hours-only": null,
  /* Threshold-crossing ramp — the doc names no column. */
  "ramped": null,
  /* Every mitigation is a customer-relations decision (§2.26 Designator)
   * — a money/reputation leg, not a coverage column. */
  "targeted-at-one-customer": null,
  /* Data-only slug (live:false in the wave table too) — no leg anywhere. */
  "piggybacked-on-a-maintenance-window": null,
  /* "Two-stage beats Hands" — Hands is §7.5 attention, explicitly NOT one
   * of the nine defense roles: the doc row lives outside the grid by name. */
  "two-stage": null,
  /* "Rate-shaped beats any fixed threshold" — a threshold CLASS spanning
   * meter and detect; the "exactly one role" law and this row are in
   * tension (doc debt, reported). Picking one column would invent. */
  "rate-shaped": null,
  /* Peak-hour revenue pressure — names no column. */
  "diurnal": null,
  /* "Punishes overreaction" — a scoring law on spend, not a column. */
  "bounded": null,
});

/** Boundary parse (Law 2/4): the §2.13 slug whose coverage leg applies.
 *  `null`/`undefined` (unaffixed threat) → `null`. An off-vocabulary slug
 *  is authored garbage and dies `BAD_AFFIX`; prototype keys are fenced by
 *  `Object.hasOwn` (BudgetManager hardening precedent, 28d8b6b). */
export function affixCoverageNullifier(affix: string | null | undefined): DefenseRoleId | null {
  if (affix === null || affix === undefined) return null;
  if (!Object.hasOwn(AFFIX_COVERAGE_NULLIFIES, affix)) {
    throw new CoverageError(
      "BAD_AFFIX",
      "affixCoverageNullifier",
      `"${affix}" is not one of the 16 §2.13 AFFIX_VOCABULARY slugs`,
    );
  }
  return AFFIX_COVERAGE_NULLIFIES[affix] ?? null;
}

/** One cell AS SEEN BY a threat wearing `affix` (§2.13 invalidates law):
 *  identical to `deriveCoverageCell` except when `defenseRole` is the
 *  column the affix nullifies — that cell pins to strength 0 / its ladder
 *  state, keeping `contributors` visible ("you own it; it does not answer
 *  THIS threat"). No new math: the value is FIXED_ZERO, the state comes
 *  from the one ladder classifier (never a literal). */
export function deriveCoverageCellForAffix(
  resolved: readonly ResolvedBuildable[],
  threatRole: ThreatRole,
  defenseRole: DefenseRoleId,
  affix: string | null | undefined,
): CoverageCell {
  const nullified = affixCoverageNullifier(affix);
  const cell = deriveCoverageCell(resolved, threatRole, defenseRole);
  if (nullified === null || nullified !== defenseRole) return cell;
  const strength = FIXED_ZERO;
  return Object.freeze({
    threatRole,
    defenseRole,
    strength,
    state: coverageCellState(strength) as CoverageCellState,
    contributors: cell.contributors,
  });
}
