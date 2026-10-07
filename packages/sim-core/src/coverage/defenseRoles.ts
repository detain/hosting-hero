/**
 * coverage/defenseRoles.ts — the Nine Defense Roles (hg §2.1 "The Nine
 * Defense Roles and the Coverage Grid", ratified verbatim against
 * packages/content/threats/registry-core.json `defenseRolesVocabulary`).
 *
 * P17 (hg §0.1): "§2.1 defines twelve threat roles. Without a matching
 * defense-role list and a coverage matrix, the player can never reason
 * 'I have no answer to the Sapper role.'" This file is the missing half of
 * the Threat Role Taxonomy; the threat axis already ships as
 * `THREAT_ROLES` in ../waves/table.ts and is REUSED, never re-invented.
 *
 * Closed vocabulary: nine slugs, exactly one primary role per buildable
 * (§2.1 — a buildable may carry coverage in several columns only through
 * explicit data, the taxonomy itself stays one-role-per-tag).
 */

/** The nine defense-role slugs (registry display labels lowercased). */
export type DefenseRoleId =
  | "absorb"
  | "classify"
  | "meter"
  | "contain"
  | "detect"
  | "recover"
  | "deter"
  | "divert"
  | "negotiate";

/** One defense role: what it acts on, in the §2.1 table's own words. */
export interface DefenseRole {
  readonly id: DefenseRoleId;
  /** Display label (the registry's `defenseRolesVocabulary` spelling). */
  readonly label: string;
  /** The §2.1 "What it does" line — the plain-language cell tooltip. */
  readonly actsOn: string;
  /** The §2.1 examples row (worldbuilding flavour, never logic input). */
  readonly examples: readonly string[];
}

/** §2.1 table, in table order. Frozen; this array defines column order. */
export const DEFENSE_ROLES: readonly DefenseRole[] = Object.freeze([
  Object.freeze({
    id: "absorb" as const,
    label: "Absorb",
    actsOn: "Adds raw capacity ahead of the thing being hit",
    examples: Object.freeze(["scrubbing", "anycast", "CDN", "edge cache", "extra nodes"]),
  }),
  Object.freeze({
    id: "classify" as const,
    label: "Classify",
    actsOn: "Decides good vs bad",
    examples: Object.freeze(["WAF", "fingerprinter", "IDS", "fraud scoring", "spam filter"]),
  }),
  Object.freeze({
    id: "meter" as const,
    label: "Meter",
    actsOn: "Caps consumption per identity",
    examples: Object.freeze(["rate limits", "quotas", "spend caps", "concurrency caps", "cgroups"]),
  }),
  Object.freeze({
    id: "contain" as const,
    label: "Contain",
    actsOn: "Limits how far a landed threat spreads",
    examples: Object.freeze(["VLANs", "least privilege", "circuit breakers", "blast domains", "WORM"]),
  }),
  Object.freeze({
    id: "detect" as const,
    label: "Detect",
    actsOn: "Tells you it happened",
    examples: Object.freeze(["monitoring", "tracing", "FIM", "log retention", "anomaly detection"]),
  }),
  Object.freeze({
    id: "recover" as const,
    label: "Recover",
    actsOn: "Undoes damage",
    examples: Object.freeze(["backups", "spares", "checkpoints", "runbooks", "rebuild"]),
  }),
  Object.freeze({
    id: "deter" as const,
    label: "Deter",
    actsOn: "Changes the attacker's economics",
    examples: Object.freeze(["MFA", "KYC", "deposits", "bug bounty", "reputation", "legal posture"]),
  }),
  Object.freeze({
    id: "divert" as const,
    label: "Divert",
    actsOn: "Sends it somewhere else",
    examples: Object.freeze(["honeypot", "decoy service", "null-route", "tarpit", "sacrificial IP"]),
  }),
  Object.freeze({
    id: "negotiate" as const,
    label: "Negotiate",
    actsOn: "Uses a relationship instead of a machine",
    examples: Object.freeze(["upstream retainer", "registrar lock", "insurance", "peering", "counsel"]),
  }),
] as const);

/** Column order for the grid: the nine slugs in §2.1 table order. */
export const DEFENSE_ROLE_IDS: readonly DefenseRoleId[] = Object.freeze(
  DEFENSE_ROLES.map((role) => role.id),
);

const DEFENSE_ROLE_ID_SET: ReadonlySet<string> = new Set<string>(DEFENSE_ROLE_IDS);

/** Boundary guard for parsing role tags out of content data. */
export function isDefenseRoleId(value: string): value is DefenseRoleId {
  return DEFENSE_ROLE_ID_SET.has(value);
}
