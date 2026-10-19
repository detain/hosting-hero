/**
 * versus/deck.ts — the day-1 async-Versus artifact (ADR-0004): threat decks
 * and defense decks as STRICT, PURE-DATA documents with boundary parsers in
 * the loader/boundary.ts style (dotted paths, machine codes, fail loud).
 *
 * The format law (§9.x versus, hosting_game.md): an attacker drafts a
 * THREAT DECK (which threats, how heavy, which affixes, under an exact
 * budget); a defender commits a DEFENSE DECK (buildable set resolved
 * against a caller-supplied palette universe — the door's `canPlaceDevice`
 * decoupling pattern — plus policy-card REFS by hash only, a doctrine ref,
 * and a hand capacity). Cards are never embedded; hashes bind them — and
 * since owner ruling 2026-10-19 the binding law for shipped content-deck
 * cards is the shared `deckCardHash` (see `DefenseDeck`).
 *
 * Determinism: every number in a deck is an integer (safe-int bps — the
 * same "no floats in state-visible math" law as kernel Fixed). Parsers are
 * pure functions; output documents are deep-frozen.
 */
import type { ThreatFamily } from "../types.ts";
import type { DamageDenomination, ThreatRole } from "../waves/table.ts";
import { DAMAGE_DENOMINATIONS, THREAT_ROLES } from "../waves/table.ts";
import { isTelegraphBand } from "../waves/bands.ts";
import type { TelegraphBand } from "../waves/bands.ts";
import { compareCodeUnits } from "../internal/canonical.ts";

/* ═══════════════════════════ VersusError (boundary style) ═══════════════════════════ */

export type VersusErrorCode =
  | "MISSING_FIELD"
  | "UNKNOWN_FIELD"
  | "WRONG_TYPE"
  | "BAD_ENUM"
  | "OUT_OF_RANGE"
  | "NOT_A_SAFE_INTEGER"
  | "BUDGET_MISMATCH"
  | "DUPLICATE_THREAT"
  | "DUPLICATE_ENTRY"
  | "UNKNOWN_THREAT"
  | "UNKNOWN_BUILDABLE"
  | "COMMIT_MISMATCH"
  | "DECK_ILLEGAL"
  | "DECK_UNPACKABLE"
  | "AFFIX_COST_UNFEASIBLE";

/** Mirror of LoaderError, kept LOCAL (loader/boundary.ts is not touched):
 *  same shape, same message grammar, versus[...] prefix. */
export class VersusError extends Error {
  readonly code: VersusErrorCode;
  readonly path: string;

  constructor(code: VersusErrorCode, path: string, message: string) {
    super(`versus[${code}] at '${path}': ${message}`);
    this.name = "VersusError";
    this.code = code;
    this.path = path;
  }
}

function fail(code: VersusErrorCode, path: string, message: string): never {
  throw new VersusError(code, path, message);
}

/* ═══════════════════════════ shared constants ═══════════════════════════ */

/** §2.13 affix mix-ins (16): core eight + the second eight. Slug form. */
export const AFFIX_VOCABULARY = Object.freeze([
  "low-slow",
  "distributed",
  "encrypted",
  "adaptive",
  "timed",
  "piggyback",
  "mimic",
  "persistent",
  "off-hours-only",
  "ramped",
  "targeted-at-one-customer",
  "piggybacked-on-a-maintenance-window",
  "two-stage",
  "rate-shaped",
  "diurnal",
  "bounded",
] as const);
export type ThreatAffix = (typeof AFFIX_VOCABULARY)[number];

const AFFIX_SET: ReadonlySet<string> = new Set<string>(AFFIX_VOCABULARY);

/**
 * hh-versus-deck-v2 (§2.13 affix cost multipliers, owner ruling 2026-10-17):
 * the bps factor a draft applies to a slot's weight when it PRESENTS an
 * affixed candidate — `costBps = ceil(weightBps × multiplier / 10_000)`.
 * "plain" is the unaffixed twin and is the identity (10_000), so a v1-
 * defaulted (plain-only) draft keeps cost ≡ weight and its compensation
 * walk is the identity. The KEY SET is law: exactly the 16 §2.13 slugs plus
 * "plain" — renaming a key or adding one is a v3 format change. The VALUES
 * are taste, and the taste is now law: every entry is
 * RATIFIED 2026-10-17 (ADR-0017 #6) — the wave-23 game-feel batch-ratify
 * (owner ruling 4a; the engineering caps are dispositioned elsewhere).
 */
export const AFFIX_COST_MULTIPLIER_BPS: Readonly<Record<"plain" | ThreatAffix, number>> = Object.freeze({
  "plain": 10_000, // RATIFIED 2026-10-17 (ADR-0017 #6) — identity: cost ≡ weight
  "low-slow": 13_000, // RATIFIED 2026-10-17 (ADR-0017 #6)
  "distributed": 10_000, // RATIFIED 2026-10-17 (ADR-0017 #6) — free spice, no cost
  "encrypted": 16_000, // RATIFIED 2026-10-17 (ADR-0017 #6)
  "adaptive": 18_000, // RATIFIED 2026-10-17 (ADR-0017 #6)
  "timed": 12_000, // RATIFIED 2026-10-17 (ADR-0017 #6)
  "piggyback": 10_000, // RATIFIED 2026-10-17 (ADR-0017 #6)
  "mimic": 16_000, // RATIFIED 2026-10-17 (ADR-0017 #6)
  "persistent": 18_000, // RATIFIED 2026-10-17 (ADR-0017 #6)
  "off-hours-only": 12_000, // RATIFIED 2026-10-17 (ADR-0017 #6)
  "ramped": 10_000, // RATIFIED 2026-10-17 (ADR-0017 #6)
  "targeted-at-one-customer": 12_000, // RATIFIED 2026-10-17 (ADR-0017 #6)
  "piggybacked-on-a-maintenance-window": 20_000, // RATIFIED 2026-10-17 (ADR-0017 #6) — the priciest mix-in
  "two-stage": 20_000, // RATIFIED 2026-10-17 (ADR-0017 #6)
  "rate-shaped": 14_000, // RATIFIED 2026-10-17 (ADR-0017 #6)
  "diurnal": 12_000, // RATIFIED 2026-10-17 (ADR-0017 #6)
  "bounded": 8_000, // RATIFIED 2026-10-17 (ADR-0017 #6) — DISCOUNT affix: the table minimum; drafts fund splurges out of bounded savings
});

/** §2.24 active-family pool cap ("8–10"): hard ceiling for v0 decks. */
export const MAX_DECK_THREATS = 10;
/** Structural cap on entries per deck (wire-garbage guard). */
export const MAX_DECK_ENTRIES = 32;
/** Converter legality floor: under this many distinct roles the 8-wave
 *  cadence law (fresh role at waves 4 and 8) cannot be honored. */
export const MIN_DISTINCT_ROLES = 3;

/* ═══════════════════════════ census (supplied as DATA, never fs-read) ═══════════════════════════ */

/** What the deck machinery needs to know about one threat id: its role set
 *  (waves-vocabulary normalized), single denomination (registry-core shape),
 *  family, and telegraph band. Callers build it from a content registry via
 *  buildRegistryCensus() or hand-forge it in tests. */
export interface ThreatCensusEntry {
  readonly roles: readonly ThreatRole[];
  readonly denomination: DamageDenomination;
  readonly family: ThreatFamily;
  readonly band: TelegraphBand;
}

/** Registry role labels are display-cased, and two of them fold onto
 *  waves/THREAT_ROLES ids (§2.1 entries carry role = registry roles[0]). */
const REGISTRY_ROLE_ALIASES: ReadonlyMap<string, string> = new Map([
  ["Healer/Spawner", "healer"],
  ["Bypass/Flyer", "bypass"],
]);

const REGISTRY_FAMILY_SET: ReadonlySet<string> = new Set<ThreatFamily>([
  "malicious",
  "entropic",
  "human",
  "systemic",
  "customerAsThreat",
]);

const THREAT_ROLE_SET: ReadonlySet<string> = new Set<string>(THREAT_ROLES);
const DENOMINATION_SET: ReadonlySet<string> = new Set<string>(DAMAGE_DENOMINATIONS);

function normalizeRegistryRole(value: unknown, path: string): ThreatRole {
  if (typeof value !== "string" || value.length === 0) {
    fail("WRONG_TYPE", path, `role must be a non-empty string, got ${typeof value}`);
  }
  const aliased = REGISTRY_ROLE_ALIASES.get(value) ?? value.toLowerCase();
  if (!THREAT_ROLE_SET.has(aliased)) {
    fail("BAD_ENUM", path, `role "${value}" does not normalize into waves THREAT_ROLES`);
  }
  return aliased as ThreatRole;
}

/** Parse a threat-registry document (the packages/content/threats/
 *  registry-core.json shape: {threats: [{id, family, band, roles[],
 *  denomination, customerAsThreat, ...}]}) into a census map. Read-only
 *  input law: versus NEVER reads the file itself — the caller hands over
 *  the parsed JSON. customerAsThreat=true flips the FAMILY (§9.4: the
 *  customer's own traffic attacks you — intent abuser, not human-error). */
export function buildRegistryCensus(raw: unknown): Map<string, ThreatCensusEntry> {
  const doc = plainObject(raw, "census");
  const threats = doc["threats"];
  if (!Array.isArray(threats)) {
    fail("WRONG_TYPE", "census.threats", `expected array of threat records, got ${typeof threats}`);
  }
  const census = new Map<string, ThreatCensusEntry>();
  for (const [index, item] of threats.entries()) {
    const where = `census.threats[${index}]`;
    const record = plainObject(item, where);
    const id = parseColonFreeId(record["id"], `${where}.id`);
    const rolesValue = record["roles"];
    if (!Array.isArray(rolesValue) || rolesValue.length === 0) {
      fail("WRONG_TYPE", `${where}.roles`, "expected non-empty array of role labels");
    }
    const roles: ThreatRole[] = [];
    for (const [roleIndex, roleValue] of rolesValue.entries()) {
      const role = normalizeRegistryRole(roleValue, `${where}.roles[${roleIndex}]`);
      if (!roles.includes(role)) roles.push(role);
    }
    const familyValue = record["family"];
    if (typeof familyValue !== "string" || !REGISTRY_FAMILY_SET.has(familyValue)) {
      fail("BAD_ENUM", `${where}.family`, `unknown ThreatFamily "${String(familyValue)}"`);
    }
    const bandValue = record["band"];
    if (typeof bandValue !== "string" || !isTelegraphBand(bandValue)) {
      fail("BAD_ENUM", `${where}.band`, `unknown TelegraphBand "${String(bandValue)}"`);
    }
    const denominationValue = record["denomination"];
    if (typeof denominationValue !== "string" || !DENOMINATION_SET.has(denominationValue)) {
      fail("BAD_ENUM", `${where}.denomination`, `unknown DamageDenomination "${String(denominationValue)}"`);
    }
    if (census.has(id)) {
      fail("DUPLICATE_THREAT", `${where}.id`, `threat id "${id}" declared twice in the registry`);
    }
    const customerAsThreat = record["customerAsThreat"] === true;
    census.set(id, Object.freeze({
      roles: Object.freeze(roles),
      denomination: denominationValue as DamageDenomination,
      family: (customerAsThreat ? "customerAsThreat" : familyValue) as ThreatFamily,
      band: bandValue as TelegraphBand,
    }));
  }
  if (census.size === 0) {
    fail("OUT_OF_RANGE", "census.threats", "registry declares zero threats — nothing is draftable");
  }
  return census;
}

/** Extract the fairness counter map (R-15 analog input): threatId → counter
 *  names from the same registry document shape (counters: [{name,...}]). */
export function buildCounterMap(raw: unknown): Map<string, readonly string[]> {
  const doc = plainObject(raw, "counters");
  const threats = doc["threats"];
  if (!Array.isArray(threats)) {
    fail("WRONG_TYPE", "counters.threats", `expected array, got ${typeof threats}`);
  }
  const counters = new Map<string, readonly string[]>();
  for (const [index, item] of threats.entries()) {
    const where = `counters.threats[${index}]`;
    const record = plainObject(item, where);
    const id = parseNonEmptyString(record["id"], `${where}.id`);
    const rawCounters = record["counters"];
    const names: string[] = [];
    if (Array.isArray(rawCounters)) {
      for (const [counterIndex, counterValue] of rawCounters.entries()) {
        if (!isRecord(counterValue)) continue;
        const name = counterValue["name"];
        if (typeof name === "string" && name.length > 0) names.push(name);
        else fail("WRONG_TYPE", `${where}.counters[${counterIndex}].name`, "counter needs a non-empty name");
      }
    }
    counters.set(id, Object.freeze(names));
  }
  return counters;
}

/* ═══════════════════════════ deck document types ═══════════════════════════ */

/** One deck slot (hh-versus-deck-v2): which threat, its DRAFT WEIGHT
 *  (placement order + role-quota share — the v1 role), its budget COST
 *  (costBps carries the exact-sum law: ΣcostBps == budgetBps at parse, the
 *  weight sum is unconstrained), and an optional §2.13 affix slug. Before
 *  v2 weightBps was both roles at once (the lane's OWNER-QUESTION); the
 *  owner ruling 2026-10-17 split them. */
export interface ThreatDeckEntry {
  readonly threatId: string;
  readonly weightBps: number;
  readonly costBps: number;
  readonly affix?: ThreatAffix;
}

export interface ThreatDeck {
  readonly kind: "threat";
  readonly id: string;
  /** Total budget; entries' costBps must sum EXACTLY to it (the cost law
   *  is exact, §9.x). weightBps is a placement share, not a budget claim. */
  readonly budgetBps: number;
  readonly entries: readonly ThreatDeckEntry[];
}

/** Defender's committed build of the match: what may be placed (ids
 *  resolved against a palette universe at PARSE time — the door's
 *  canPlaceDevice decoupling), policy cards by CONTENT FINGERPRINT only
 *  (the cards themselves ride the ruleBook, never the deck), a doctrine
 *  ref string, and the reserve hand capacity.
 *
 *  DOCTRINE BINDING LAW (owner ruling 2026-10-19 — "Versus doctrine via
 *  decks — yes; kills the three-local-hash-laws drift risk permanently",
 *  RATIFIED): entries binding a SHIPPED CONTENT-DECK card MUST be
 *  `deckCardHash` keys (loader/decks.ts @2cdf014, domain
 *  `hh-deck-card-hash-v1`) — the ONE hash law binding content-deck cards
 *  into a DefenseDeck, so a booted `bootRulesFromDeck` book resolves every
 *  doctrine hash through the same key the deck was hashed with. The other
 *  local laws keep their separate, narrower identities: the two proto-local
 *  summaries (g7Deck cardSummary, simCoreRunner.rules.test private fold)
 *  stay gate fictions per the G7B posture, the door's file-local
 *  `cardFingerprint` stays M3 whole-book identity, and versus's own
 *  `hh-card-v1` fingerprint (`cardContentFingerprint`, match.ts) stays the
 *  DEFAULT in-match ruleBook index key — a fourth doctrine-key law is never
 *  allowed to be minted again. The key spaces are DISJOINT by witness
 *  (__tests__/doctrineDecks.test.ts: a legacy fingerprint misses a
 *  deck-bound lookup as `unknown-card-hash`, and vice versa). The parser
 *  stays content-agnostic (opaque non-empty strings, dup-gated) — key
 *  validity is the door's question. This supersedes the deck-ref half of the
 *  2026-10-09 hh-card-v1 flip; the ruleBook-index half of that ratification
 *  stands. */
export interface DefenseDeck {
  readonly kind: "defense";
  readonly id: string;
  readonly buildables: readonly string[];
  /** `deckCardHash` keys (loader/decks.ts — the one doctrine hash law, owner
   *  ruling 2026-10-19) binding shipped content-deck cards; see DefenseDeck. */
  readonly policyCardHashes: readonly string[];
  readonly doctrineRef: string;
  readonly handCapacity: number;
}

/* ═══════════════════════════ boundary parse helpers ═══════════════════════════ */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function plainObject(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) {
    fail("WRONG_TYPE", path, `expected an object, got ${Array.isArray(value) ? "array" : typeof value}`);
  }
  return value;
}

function parseNonEmptyString(value: unknown, path: string): string {
  if (typeof value !== "string") {
    fail("WRONG_TYPE", path, `expected a string, got ${typeof value}`);
  }
  if (value.length === 0) {
    fail("OUT_OF_RANGE", path, "expected a non-empty string");
  }
  return value;
}

/** Ids that ride the event-grammar channels (table ids inside causeIds,
 *  threat ids inside unitIds) must stay colon-free — the arrival-cause
 *  parser splits on ':' and a colon-bearing id would corrupt attribution. */
function parseColonFreeId(value: unknown, path: string): string {
  const text = parseNonEmptyString(value, path);
  if (text.indexOf(":") !== -1) {
    fail("OUT_OF_RANGE", path, `expected an id without ':' (colons break cause-id grammar), got "${text}"`);
  }
  return text;
}

/** Integer law at the boundary: booleans, strings, and FLOATS all die here
 *  (30.5 → NOT_A_SAFE_INTEGER — the deck wire never carries fractions;
 *  kernel Fixed owns all fractional math downstream). */
function parseBoundedInt(value: unknown, path: string, minimum: number, maximum: number): number {
  if (typeof value !== "number") {
    fail("WRONG_TYPE", path, `expected an integer number, got ${typeof value}`);
  }
  if (!Number.isFinite(value)) {
    fail("NOT_A_SAFE_INTEGER", path, `expected a finite integer, got ${String(value)}`);
  }
  if (!Number.isInteger(value)) {
    fail("NOT_A_SAFE_INTEGER", path, `floats are illegal in deck math — got ${String(value)}`);
  }
  if (!Number.isSafeInteger(value)) {
    fail("NOT_A_SAFE_INTEGER", path, `integer exceeds the safe range — got ${String(value)}`);
  }
  if (value < minimum || value > maximum) {
    fail("OUT_OF_RANGE", path, `expected ${minimum}..${maximum}, got ${value}`);
  }
  return value;
}

function rejectUnknownFields(record: Record<string, unknown>, allowed: readonly string[], path: string): void {
  for (const key of Object.keys(record)) {
    if (!allowed.includes(key)) {
      fail("UNKNOWN_FIELD", `${path}.${key}`, `unknown field "${key}" (allowed: ${allowed.join(", ")})`);
    }
  }
}

/* ═══════════════════════════ parseThreatDeck ═══════════════════════════ */

export interface ThreatDeckParseOptions {
  /** Threat universe: every entry's threatId must resolve here. */
  readonly census: ReadonlyMap<string, ThreatCensusEntry>;
}

/** Strict boundary parse: wire garbage throws VersusError with a dotted
 *  path; SEMANTIC deck-law failures (budget sum) also throw here — a parsed
 *  ThreatDeck is trusted data downstream (parse-don't-validate). */
export function parseThreatDeck(raw: unknown, options: ThreatDeckParseOptions): ThreatDeck {
  const doc = plainObject(raw, "deck");
  rejectUnknownFields(doc, ["id", "budgetBps", "entries"], "deck");

  const id = parseColonFreeId(doc["id"], "deck.id");
  if (doc["budgetBps"] === undefined) fail("MISSING_FIELD", "deck.budgetBps", "budget is mandatory (§9.x attacker budget)");
  const budgetBps = parseBoundedInt(doc["budgetBps"], "deck.budgetBps", 1, Number.MAX_SAFE_INTEGER);

  const rawEntries = doc["entries"];
  if (rawEntries === undefined) fail("MISSING_FIELD", "deck.entries", "entries are mandatory");
  if (!Array.isArray(rawEntries)) {
    fail("WRONG_TYPE", "deck.entries", `expected an array, got ${typeof rawEntries}`);
  }
  if (rawEntries.length === 0) fail("OUT_OF_RANGE", "deck.entries", "a threat deck needs at least one entry");
  if (rawEntries.length > MAX_DECK_ENTRIES) {
    fail("OUT_OF_RANGE", "deck.entries", `${rawEntries.length} entries exceeds the cap ${MAX_DECK_ENTRIES}`);
  }

  const entries: ThreatDeckEntry[] = [];
  const seenThreats = new Set<string>();
  let sumCostBps = 0;
  for (const [index, item] of rawEntries.entries()) {
    const where = `deck.entries[${index}]`;
    const record = plainObject(item, where);
    rejectUnknownFields(record, ["threatId", "weightBps", "costBps", "affix"], where);
    if (record["threatId"] === undefined) fail("MISSING_FIELD", `${where}.threatId`, "threatId is mandatory");
    const threatId = parseColonFreeId(record["threatId"], `${where}.threatId`);
    if (!options.census.has(threatId)) {
      fail("UNKNOWN_THREAT", `${where}.threatId`, `"${threatId}" is not in the supplied census universe`);
    }
    if (seenThreats.has(threatId)) {
      fail("DUPLICATE_THREAT", `${where}.threatId`, `"${threatId}" appears twice — merge the weights into one entry`);
    }
    seenThreats.add(threatId);
    if (record["weightBps"] === undefined) fail("MISSING_FIELD", `${where}.weightBps`, "weightBps is mandatory");
    const weightBps = parseBoundedInt(record["weightBps"], `${where}.weightBps`, 1, budgetBps);
    // hh-versus-deck-v2: cost is a REQUIRED field (parse-don't-validate —
    // no silent default, v1 decks are not a shape this parser speaks).
    if (record["costBps"] === undefined) {
      fail("MISSING_FIELD", `${where}.costBps`, "costBps is mandatory (hh-versus-deck-v2 splits the budget law off weightBps)");
    }
    const costBps = parseBoundedInt(record["costBps"], `${where}.costBps`, 1, budgetBps);
    const affixValue = record["affix"];
    if (affixValue !== undefined && (typeof affixValue !== "string" || !AFFIX_SET.has(affixValue))) {
      fail("BAD_ENUM", `${where}.affix`, `"${String(affixValue)}" is outside §2.13 AFFIX_VOCABULARY`);
    }
    sumCostBps += costBps;
    entries.push(affixValue === undefined
      ? Object.freeze({ threatId, weightBps, costBps })
      : Object.freeze({ threatId, weightBps, costBps, affix: affixValue as ThreatAffix }));
  }

  // The v2 budget law rides cost, not weight: an entry's weightBps is a
  // placement share (order + role quota); its costBps is what the budget
  // is spent against. ΣweightBps is unconstrained (the draft's slots keep
  // it budget-shaped; an authored deck may decouple the two freely).
  if (sumCostBps !== budgetBps) {
    fail("BUDGET_MISMATCH", "deck.budgetBps", `entries' costs sum to ${sumCostBps} bps but the declared budget is ${budgetBps} bps — the cost law is exact (§9.x)`);
  }

  return Object.freeze({ kind: "threat" as const, id, budgetBps, entries: Object.freeze(entries) });
}

/* ═══════════════════════════ parseDefenseDeck ═══════════════════════════ */

export interface DefenseDeckParseOptions {
  /** Buildable palette universe (type-bundle ids) — the door's
   *  canPlaceDevice decoupling pattern: versus never imports topology or
   *  reads content, it validates against THIS set. */
  readonly buildableUniverse: ReadonlySet<string>;
}

export function parseDefenseDeck(raw: unknown, options: DefenseDeckParseOptions): DefenseDeck {
  const doc = plainObject(raw, "defense");
  rejectUnknownFields(doc, ["id", "buildables", "policyCardHashes", "doctrineRef", "handCapacity"], "defense");

  const id = parseColonFreeId(doc["id"], "defense.id");
  if (doc["buildables"] === undefined) fail("MISSING_FIELD", "defense.buildables", "buildables are mandatory (empty array allowed for pure-doctrine defenses)");
  if (!Array.isArray(doc["buildables"])) {
    fail("WRONG_TYPE", "defense.buildables", `expected an array, got ${typeof doc["buildables"]}`);
  }
  const buildables: string[] = [];
  for (const [index, item] of (doc["buildables"] as unknown[]).entries()) {
    const where = `defense.buildables[${index}]`;
    const buildable = parseNonEmptyString(item, where);
    if (!options.buildableUniverse.has(buildable)) {
      fail("UNKNOWN_BUILDABLE", where, `"${buildable}" is not in the supplied palette universe`);
    }
    if (buildables.includes(buildable)) {
      fail("DUPLICATE_ENTRY", where, `buildable "${buildable}" listed twice`);
    }
    buildables.push(buildable);
  }

  const hashesValue = doc["policyCardHashes"];
  if (hashesValue === undefined) fail("MISSING_FIELD", "defense.policyCardHashes", "hash list is mandatory (empty allowed)");
  if (!Array.isArray(hashesValue)) {
    fail("WRONG_TYPE", "defense.policyCardHashes", `expected an array, got ${typeof hashesValue}`);
  }
  const policyCardHashes: string[] = [];
  for (const [index, item] of (hashesValue as unknown[]).entries()) {
    const where = `defense.policyCardHashes[${index}]`;
    const cardHash = parseNonEmptyString(item, where);
    if (policyCardHashes.includes(cardHash)) {
      fail("DUPLICATE_ENTRY", where, `policy-card hash "${cardHash}" listed twice`);
    }
    policyCardHashes.push(cardHash);
  }

  if (doc["doctrineRef"] === undefined) fail("MISSING_FIELD", "defense.doctrineRef", "doctrine ref is mandatory (§9.x named doctrine string)");
  const doctrineRef = parseNonEmptyString(doc["doctrineRef"], "defense.doctrineRef");
  if (doc["handCapacity"] === undefined) fail("MISSING_FIELD", "defense.handCapacity", "hand capacity is mandatory (§7.5 executive attention)");
  const handCapacity = parseBoundedInt(doc["handCapacity"], "defense.handCapacity", 1, 8);

  return Object.freeze({
    kind: "defense" as const,
    id,
    buildables: Object.freeze(buildables),
    policyCardHashes: Object.freeze(policyCardHashes),
    doctrineRef,
    handCapacity,
  });
}

/* ═══════════════════════════ deck legality (shared by draft + converter) ═══════════════════════════ */

export const DECK_LEGALITY_CODES = [
  "POOL_CAP_EXCEEDED",
  "DENOMINATION_QUOTA_EXCEEDED",
  "MINIMUM_ROLES_UNMET",
  "ROLE_QUOTA_EXCEEDED",
  "UNKNOWN_THREAT",
  "FEINT_BUDGET_EXCEEDED",
] as const;
export type DeckLegalityCode = (typeof DECK_LEGALITY_CODES)[number];

export interface DeckLegalityViolation {
  readonly code: DeckLegalityCode;
  readonly detail: string;
}

/** Denomination quota ceiling — re-anchored to the waves/authoring law so
 *  deck legality and table enforcement can never disagree. */
export const MAX_THREATS_PER_DENOMINATION = 4;

/** Pure legality census over a parsed deck (budget sum already enforced at
 *  parse). Returns violations as DATA in deterministic order — callers
 *  decide whether that is a throw (converter) or a report (validator).
 *  Role quota follows the waves/enforcer semantics ("≤2 roles >30%"): the
 *  drafted mix may keep at most two roles above the share ceiling, where a
 *  role's share is the summed weightBps of the deck threats that can play
 *  it, over budgetBps, compared with the strict-> law (integer cross-mult). */
export function deckLegalityViolations(
  deck: ThreatDeck,
  census: ReadonlyMap<string, ThreatCensusEntry>,
): readonly DeckLegalityViolation[] {
  const violations: DeckLegalityViolation[] = [];

  const denominations = new Map<DamageDenomination, number>();
  const roleWeights = new Map<ThreatRole, number>();
  const allRoles = new Set<ThreatRole>();
  for (const entry of deck.entries) {
    const meta = census.get(entry.threatId);
    if (meta === undefined) {
      violations.push({ code: "UNKNOWN_THREAT", detail: `threat "${entry.threatId}" is not in the census` });
      continue;
    }
    denominations.set(meta.denomination, (denominations.get(meta.denomination) ?? 0) + 1);
    for (const role of meta.roles) {
      allRoles.add(role);
      roleWeights.set(role, (roleWeights.get(role) ?? 0) + entry.weightBps);
    }
  }

  if (deck.entries.length > MAX_DECK_THREATS) {
    violations.push({
      code: "POOL_CAP_EXCEEDED",
      detail: `${deck.entries.length} distinct threats exceeds the §2.24 pool cap ${MAX_DECK_THREATS}`,
    });
  }

  for (const denomination of [...denominations.keys()].sort(compareCodeUnits)) {
    const count = denominations.get(denomination) ?? 0;
    if (count > MAX_THREATS_PER_DENOMINATION) {
      violations.push({
        code: "DENOMINATION_QUOTA_EXCEEDED",
        detail: `${count} deck threats share denomination "${denomination}" (max ${MAX_THREATS_PER_DENOMINATION}, §2.24 — a WaveTable could never place them either)`,
      });
    }
  }

  if (allRoles.size < MIN_DISTINCT_ROLES) {
    violations.push({
      code: "MINIMUM_ROLES_UNMET",
      detail: `deck spans ${allRoles.size} distinct roles; the 8-wave fresh-role cadence needs at least ${MIN_DISTINCT_ROLES}`,
    });
  }

  // share > 30 % ⇔ weight × 100 > 30 × budget (strict >, integer-exact).
  // BigInt, not number: with budgets near MAX_SAFE_INTEGER the products
  // (weight×100 up to ~9e17) exceed 2^53 and float rounding can flip the
  // comparison exactly at the 30% boundary (e.g. weight 675, budget 6000×1e12).
  const hotRoles = [...roleWeights.entries()]
    .filter(([, weight]) => BigInt(weight) * 100n > 30n * BigInt(deck.budgetBps))
    .map(([role]) => role)
    .sort(compareCodeUnits);
  if (hotRoles.length > 2) {
    violations.push({
      code: "ROLE_QUOTA_EXCEEDED",
      detail: `${hotRoles.length} roles carry above 30% of the deck budget [${hotRoles.join(", ")}] (max 2, waves/enforcer analog)`,
    });
  }

  return violations;
}

/** Feint cap (deck law): how many distinct waves a single deck may arm
 *  with a live two-stage decoy. */
export const MAX_FEINT_WAVES_PER_DECK = 1;

/** The §2.13 two-stage affix arms a wave with a decoy (the rules.feints
 *  block the converter authors caps maxPerLevel at 1). A deck whose live
 *  two-stage entries land on TWO DIFFERENT waves schedules two feint
 *  levels — the waves/parse adjacency door would refuse the table anyway,
 *  so the deck law refuses it as data first (legality-as-Data precedent;
 *  the converter surfaces the same code as schedule.feint-budget).
 *  Same-wave pairs are LEGAL: one wave, one flag. Pure and data-only —
 *  callers decide throw vs report. */
export function feintBudgetViolations(
  feintWaveNs: readonly number[],
): readonly DeckLegalityViolation[] {
  const distinct = [...new Set(feintWaveNs)].sort((a, b) => a - b);
  if (distinct.length <= MAX_FEINT_WAVES_PER_DECK) return Object.freeze([]);
  return Object.freeze([{
    code: "FEINT_BUDGET_EXCEEDED",
    detail: `two-stage affixes feint ${distinct.length} waves [${distinct.join(", ")}] — the feint budget is ${MAX_FEINT_WAVES_PER_DECK} wave per deck (§2.13 two-stage; same-wave pair is legal, one flag)`,
  }]);
}
