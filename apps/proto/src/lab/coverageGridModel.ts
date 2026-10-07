/**
 * coverageGridModel.ts — the PURE model behind CoverageGridPanel (§2.1 "The
 * Nine Defense Roles and the Coverage Grid", taught through the shipped
 * shared-web palette instead of invented data).
 *
 * Read-only consumer law (g6 precedent): the content corpus is PARSED, never
 * edited; drift surfaces as a loud throw at boot. Every number the grid
 * computes comes from @hh/sim-core/coverage — this file only turns content
 * JSON into the plain-data profile the coverage service demands, mirrors the
 * player's roster through the waves build-ledger (the same invitation
 * gating G2 teaches), and projects ladder states onto chrome vocabulary.
 *
 * Zero Vue here; the panel renders these records.
 */
import sharedWebRaw from "../../../../packages/content/types/shared-web.json?raw";
import threatRegistryRaw from "../../../../packages/content/threats/registry-core.json?raw";
import {
  DEFENSE_ROLE_IDS,
  buildCoverageGrid,
  darkCellReport,
  isDefenseRoleId,
  secondAnswerGaps,
} from "@hh/sim-core/coverage";
import type {
  CoverageCell,
  CoverageCellState,
  CoverageGrid,
  CoverageProfile,
  DarkCellRow,
  DefenseRoleId,
  ThreatRoleCensus,
} from "@hh/sim-core/coverage";
import {
  THREAT_ROLES,
  buildInvitations,
  ledgerSnapshot,
  spawnableThreatIds,
  type ThreatInvitations,
  type ThreatRole,
} from "@hh/sim-core/waves";
import type { StatusValue } from "../chrome/statusChip";

/* ═══════════════════════════ content parsing (boundary) ═══════════════════════════ */

interface SharedWebShape {
  readonly buildables: {
    readonly distinct: readonly string[];
    readonly nonPhysical: readonly string[];
  };
  readonly threats: {
    readonly signatureThreats: readonly { readonly id: string }[];
    readonly unlockedByBuildables: Readonly<Record<string, readonly string[]>>;
  };
}

interface RegistryShape {
  readonly threats: readonly {
    readonly id: string;
    readonly roles: readonly string[];
    readonly counters?: readonly { readonly name: string; readonly defenseRole: string }[];
  }[];
}

function parseSharedWeb(): SharedWebShape {
  return JSON.parse(sharedWebRaw) as SharedWebShape;
}

function parseRegistry(): RegistryShape {
  return JSON.parse(threatRegistryRaw) as RegistryShape;
}

/** Registry role label → the 12-value waves vocabulary (§2.15 slug law,
 *  g6/g2 precedent: 'Bypass/Flyer' → 'bypass', 'Healer/Spawner' → 'healer').
 *  Fail-loud: an unslug-able label is corpus drift, not a puzzle to solve. */
export function slugThreatRole(label: string): ThreatRole {
  const slug = label.split("/")[0]?.toLowerCase() ?? "";
  if (!(THREAT_ROLES as readonly string[]).includes(slug)) {
    throw new Error(`coverageGridModel: registry role '${label}' does not slug into the 12 THREAT_ROLES`);
  }
  return slug as ThreatRole;
}

/** Registry counter defenseRole label ('Contain') → DefenseRoleId ('contain'),
 *  validated against the coverage vocabulary. */
function slugDefenseRole(label: string): DefenseRoleId {
  const slug = label.toLowerCase();
  if (!isDefenseRoleId(slug)) {
    throw new Error(`coverageGridModel: counter defenseRole '${label}' is not one of the nine`);
  }
  return slug;
}

/* ═══════════════════════════ the palette ═══════════════════════════ */

export type PaletteKind = "defense" | "practice";

/**
 * One roster tile.
 *  - defense items: shared-web buildables. `defenseRoles` is the UNION of
 *    the roles their registry counters declare; an empty union means the
 *    corpus never tagged the item — it renders honest-untagged (no column
 *    in the grid; toggling changes only the invitation surface).
 *  - practice items: the unlockedByBuildables keys (homogeneous-cpanel-image
 *    etc.). They own no defense column; they OPEN the spawnable pool —
 *    that's their whole teaching job.
 */
export interface PaletteItem {
  readonly id: string;
  readonly kind: PaletteKind;
  readonly defenseRoles: readonly DefenseRoleId[];
  readonly invites: readonly string[];
}

export interface LabPalette {
  readonly items: readonly PaletteItem[];
  readonly threatCensus: ThreatRoleCensus;
  readonly allThreatIds: readonly string[];
  readonly invitations: ThreatInvitations;
}

/** Build the whole palette once from the corpus. Deterministic: sorted by
 *  (kind, code-unit id) so the roster order never depends on JSON key order. */
export function buildPalette(): LabPalette {
  const sw = parseSharedWeb();
  const registry = parseRegistry();

  // threatId → defense roles it credits buildables with, from counters[].
  const rolesByBuildable = new Map<string, Set<DefenseRoleId>>();
  const threatCensus = new Map<string, readonly ThreatRole[]>();
  for (const threat of registry.threats) {
    threatCensus.set(threat.id, Object.freeze(threat.roles.map(slugThreatRole)));
    for (const counter of threat.counters ?? []) {
      if (counter.name.length === 0) continue;
      const bucket = rolesByBuildable.get(counter.name) ?? new Set<DefenseRoleId>();
      bucket.add(slugDefenseRole(counter.defenseRole));
      rolesByBuildable.set(counter.name, bucket);
    }
  }

  const invitations = buildInvitations(sw.threats.unlockedByBuildables);
  const inviteByBuildable = new Map<string, readonly string[]>();
  for (const [buildableId, threatIds] of Object.entries(sw.threats.unlockedByBuildables)) {
    inviteByBuildable.set(buildableId, Object.freeze([...threatIds].sort()));
  }

  const items: PaletteItem[] = [];
  const seen = new Set<string>();
  const push = (id: string, kind: PaletteKind): void => {
    if (seen.has(id)) return;
    seen.add(id);
    items.push(
      Object.freeze({
        id,
        kind,
        defenseRoles: Object.freeze([...(rolesByBuildable.get(id) ?? [])].sort()),
        invites: Object.freeze(inviteByBuildable.get(id) ?? []),
      }),
    );
  };
  for (const id of [...sw.buildables.distinct, ...sw.buildables.nonPhysical]) push(id, "defense");
  for (const id of Object.keys(sw.threats.unlockedByBuildables)) push(id, "practice");
  items.sort((a, b) => (a.kind === b.kind ? compareIds(a.id, b.id) : a.kind === "defense" ? -1 : 1));

  // Census law: every gated/unlocked id darkCellReport may meet must ride the
  // registry — surface corpus drift HERE (boot) rather than mid-render.
  for (const threatIds of Object.values(sw.threats.unlockedByBuildables)) {
    for (const threatId of threatIds) {
      if (!threatCensus.has(threatId)) {
        throw new Error(`coverageGridModel: unlocked threat '${threatId}' is absent from the registry census`);
      }
    }
  }

  const allThreatIds = Object.freeze(registry.threats.map((t) => t.id).sort());
  return Object.freeze({
    items: Object.freeze(items),
    threatCensus: Object.freeze(threatCensus) as ThreatRoleCensus,
    allThreatIds,
    invitations,
  });
}

function compareIds(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/* ═══════════════════════════ roster → grid ═══════════════════════════ */

/** The player's roster: selected palette ids (defense AND practice tiles).
 *  Nothing else — the model re-derives everything from the palette on each
 *  change so toggles can never leave stale state behind. */
export interface CoverageRosterView {
  readonly grid: CoverageGrid;
  readonly gaps: readonly ThreatRole[];
  readonly darkRows: readonly DarkCellRow[];
  readonly spawnable: readonly string[];
  readonly recentInvites: readonly string[];
  /** Selected defense tiles the corpus never tagged with a role — shown as
   *  honest "no column" rows, excluded from the profile (EMPTY_ROLES law). */
  readonly untaggedSelected: readonly string[];
}

export function coverageProfileFor(palette: LabPalette, selected: readonly string[]): CoverageProfile {
  const chosen = new Set(selected);
  const profile = new Map<string, { roles: readonly DefenseRoleId[] }>();
  for (const item of palette.items) {
    if (item.kind !== "defense" || item.defenseRoles.length === 0) continue;
    if (!chosen.has(item.id)) continue;
    profile.set(item.id, { roles: item.defenseRoles });
  }
  return profile;
}

export function rosterView(palette: LabPalette, selected: readonly string[]): CoverageRosterView {
  const chosen = new Set(selected);
  const profile = coverageProfileFor(palette, selected);
  const grid = buildCoverageGrid({ profile });

  // Same ledger mechanics G2 runs: a selection is "everything built at tick
  // 0"; invitation gating is the waves law, not a local re-implementation.
  const ops = [...chosen].sort().map((buildableId) => ({ atTick: 0n, buildableId, op: "build" as const }));
  const snapshot = ledgerSnapshot(ops, 0n);
  const spawnable = spawnableThreatIds(palette.allThreatIds, snapshot, palette.invitations);

  // P2 honesty: an invite is "recent" when a SELECTED practice opened it.
  const recentInvites: string[] = [];
  for (const item of palette.items) {
    if (!chosen.has(item.id)) continue;
    for (const threatId of item.invites) {
      if (!recentInvites.includes(threatId)) recentInvites.push(threatId);
    }
  }
  recentInvites.sort();

  const darkRows = darkCellReport(profile, spawnable, palette.threatCensus, recentInvites);
  const untaggedSelected = palette.items
    .filter((item) => item.kind === "defense" && item.defenseRoles.length === 0 && chosen.has(item.id))
    .map((item) => item.id)
    .sort();

  return Object.freeze({
    grid,
    gaps: secondAnswerGaps(grid),
    darkRows,
    spawnable: Object.freeze([...spawnable]),
    recentInvites: Object.freeze(recentInvites),
    untaggedSelected: Object.freeze(untaggedSelected),
  });
}

/* ═══════════════════════════ ladder → chrome vocabulary ═══════════════════════════
 * Semantic mapping is the lab's own call (the coverage service ships plain
 * states; the hue ledger owns every colour). Each rung, with its reason:
 *
 *  dark   → NO hue var. A dark cell is ABSENCE — absence has no job to paint.
 *           It renders as a hole: surface-black fill with a dashed grey
 *           outline. grey's ledger job is "neutral-aggregate"; a hole is a
 *           counted neutral fact, not an alert (the alarm job belongs to
 *           LIVE klaxons — screaming on every unexplored cell would burn
 *           the one job chrome-alarm-klaxon holds).
 *  thin   → var(--hh-hue-amber)  — amber's job is alert-fill: a thin answer
 *           is exactly the pre-breach warning shade that job paints.
 *  ok     → var(--hh-hue-green) washed to ~55% — green's job is served-ok;
 *           the partial wash says "serving, not ironclad", mirroring the
 *           ok rung sitting under the 0.85 strong line.
 *  strong → var(--hh-hue-green) solid — fully served-ok. */

export interface LadderStyle {
  /** CSS custom-property reference, or null for the hole treatment. */
  readonly hueVar: string | null;
  /** true ⇒ render dashed-grey (the hole), false ⇒ fill the hue. */
  readonly hole: boolean;
  /** Alpha for the fill (1 = solid). */
  readonly wash: number;
  readonly status: StatusValue;
  readonly label: string;
}

const LADDER_STYLES: Readonly<Record<CoverageCellState, LadderStyle>> = Object.freeze({
  dark: Object.freeze({ hueVar: null, hole: true, wash: 0, status: "DOWN" as StatusValue, label: "dark" }),
  thin: Object.freeze({ hueVar: "var(--hh-hue-amber)", hole: false, wash: 1, status: "AT RISK" as StatusValue, label: "thin" }),
  ok: Object.freeze({ hueVar: "var(--hh-hue-green)", hole: false, wash: 0.55, status: "DEGRADED" as StatusValue, label: "ok" }),
  strong: Object.freeze({ hueVar: "var(--hh-hue-green)", hole: false, wash: 1, status: "HEALTHY" as StatusValue, label: "strong" }),
});

/** StatusChip mapping rationale (pinned in tests so the words can't drift
 *  from the ladder): DOWN = "not serving at all" fits a zero-answer cell;
 *  AT RISK = "projected breach if nothing changes" is the thin rung's whole
 *  pedagogy; DEGRADED = "serving, but off its nominals" is an ok-but-<0.85
 *  cell; HEALTHY = "everything it promises" is the strong rung. */
export function ladderStyle(state: CoverageCellState): LadderStyle {
  return LADDER_STYLES[state];
}

/** Fixed Q16.16 → 0..1 display ratio (the LAST-mile read; the model never
 *  does math in the float domain — this is presentation division only). */
export function strengthRatio(strength: bigint): number {
  return Number(strength) / 65_536;
}

export interface CellTip {
  readonly threatRole: string;
  readonly defenseRole: string;
  readonly state: CoverageCellState;
  readonly strengthPct: string;
  readonly contributors: readonly string[];
}

export function cellTip(cell: CoverageCell): CellTip {
  return Object.freeze({
    threatRole: cell.threatRole,
    defenseRole: cell.defenseRole,
    state: cell.state,
    strengthPct: `${Math.round(strengthRatio(cell.strength) * 100)}%`,
    contributors: cell.contributors,
  });
}

export { DEFENSE_ROLE_IDS, THREAT_ROLES };
