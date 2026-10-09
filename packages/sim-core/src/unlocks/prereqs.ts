/**
 * unlocks/prereqs.ts — THE prereqSets CONSUMER (hg §5.6 "The prerequisite
 * lattice", audit g16 TOP-PROBLEMS #1: loader/bundle.ts parses
 * `relations.unlocks.prereqSets` from both shipped type bundles and
 * types.ts:1090 types it — but NO engine consumes it. This is that
 * consumer).
 *
 * INPUT CONTRACT — structural mirror, no import: loader/bundle.ts:262
 * `LoadedPrereqSet` is the trusted parse result of the wire shape; this
 * file re-declares the same three fields (`PrereqSetLike`) so unlocks/
 * stays a leaf. A `LoadedTypeBundle`'s `relations.prereqSets` array
 * feeds `parsePrereqSets` DIRECTLY — the shapes are mutually assignable.
 *
 * SEMANTICS (the interpretation this lane commits to, stated for the
 * record because the g1 content is silent on it):
 *  - the array is ALTERNATIVE ROUTES, not an accumulation — per §5.6
 *    "Alternative prerequisite sets (two or three routes into every
 *    line)": the line opens when ANY set is fully satisfied;
 *  - ONE set is satisfied when EVERY declared channel it names is
 *    satisfied (tech ∧ commercial — an omitted channel requires
 *    nothing), OR its single `alt` route id is satisfied — the
 *    inline third route;
 *  - an EMPTY array (no declared lattice) opens trivially — authored-
 *    ungated, the same honest default waves/ledger.ts:107 documents.
 *  Both shipped bundles carry exactly one {tech, commercial} set, so
 *  today the reading collapses to "tech AND commercial" either way.
 *
 * FAIL LOUD (Law 4): unknown prereq ids throw when the caller supplies
 * a known-id universe (`knownIds`) — a lattice naming a route nobody can
 * ever satisfy is an authoring bug, not a locked door.
 */

import { UnlocksError } from "./triggers.ts";

/** Structural mirror of loader/bundle.ts `LoadedPrereqSet` (:262-266). */
export interface PrereqSetLike {
  readonly tech?: readonly string[] | null;
  readonly commercial?: readonly string[] | null;
  readonly alt?: string | null;
}

/** Trusted, deep-frozen parse result (internal code reads only these). */
export interface ParsedPrereqSet {
  readonly tech: readonly string[];
  readonly commercial: readonly string[];
  readonly alt: string | null;
}

/** What one unsatisfied route is missing — `whatBlocks` row (hg §5.6
 *  "The visible lattice, with readable locks": the explanation IS the
 *  lock label; UI/Phase-2 renders these verbatim). */
export interface PrereqBlocker {
  readonly setIndex: number;
  readonly missingTech: readonly string[];
  readonly missingCommercial: readonly string[];
  readonly missingAlt: string | null;
}

/** Caller-supplied evidence: every prereq/tech id ALREADY satisfied
 *  (unlocked nodes, granted credentials, learned routes). */
export type SatisfiedSet = ReadonlySet<string>;

function parseIdList(value: readonly string[] | null | undefined, where: string): string[] {
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new UnlocksError("bad-value", where, "must be an array of ids or null");
  }
  const out: string[] = [];
  const seen = new Set<string>();
  for (const [index, id] of value.entries()) {
    if (typeof id !== "string" || id.length === 0) {
      throw new UnlocksError("bad-value", `${where}[${index}]`, "prereq id must be a non-empty string");
    }
    if (seen.has(id)) throw new UnlocksError("bad-value", `${where}[${index}]`, `duplicate prereq id "${id}" within one route`);
    seen.add(id);
    out.push(id);
  }
  return out;
}

/** Boundary parse (Laws 2/4): wire array → trusted frozen sets. Rejects
 *  an all-null route (a set that requires nothing AND offers no alt is a
 *  vacuous lock — author with no entry instead). */
export function parsePrereqSets(
  raw: readonly unknown[],
  where = "prereqSets",
): readonly ParsedPrereqSet[] {
  if (!Array.isArray(raw)) {
    throw new UnlocksError("bad-value", where, "prereqSets must be an array");
  }
  const out: ParsedPrereqSet[] = [];
  for (const [index, entry] of raw.entries()) {
    const path = `${where}[${index}]`;
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
      throw new UnlocksError("bad-value", path, "prereq set must be an object");
    }
    const record = entry as PrereqSetLike;
    const tech = parseIdList(record.tech ?? null, `${path}.tech`);
    const commercial = parseIdList(record.commercial ?? null, `${path}.commercial`);
    const alt = record.alt ?? null;
    if (alt !== undefined && alt !== null && typeof alt !== "string") {
      throw new UnlocksError("bad-value", `${path}.alt`, "alt must be a string or null");
    }
    if (tech.length === 0 && commercial.length === 0 && alt === null) {
      throw new UnlocksError("bad-value", path, "prereq set declares no channel and no alt — vacuous lock");
    }
    out.push(
      Object.freeze({
        tech: Object.freeze(tech),
        commercial: Object.freeze(commercial),
        alt,
      }),
    );
  }
  return Object.freeze(out);
}

function assertKnown(sets: readonly ParsedPrereqSet[], knownIds?: SatisfiedSet): void {
  if (knownIds === undefined) return;
  for (const [index, set] of sets.entries()) {
    for (const id of [...set.tech, ...set.commercial, ...(set.alt === null ? [] : [set.alt])]) {
      if (!knownIds.has(id)) {
        throw new UnlocksError(
          "unknown-prereq",
          `prereqSets[${index}]`,
          `prereq "${id}" is not in the known-id universe — a route nobody can satisfy is an authoring bug (§5.6)`,
        );
      }
    }
  }
}

function missingFrom(declared: readonly string[], satisfied: SatisfiedSet): string[] {
  return declared.filter((id) => !satisfied.has(id));
}

/** One route is open ⇔ every channel id it NAMES is satisfied (a route
 *  naming no tech/commercial channel requires none of them — but see the
 *  vacuous-lock wall in parsePrereqSets: an alt-only route demands its
 *  alt), OR its alt route id is satisfied. */
function routeIsOpen(set: ParsedPrereqSet, satisfied: SatisfiedSet): boolean {
  const hasGroups = set.tech.length > 0 || set.commercial.length > 0;
  const groupsMet =
    hasGroups && missingFrom(set.tech, satisfied).length === 0 && missingFrom(set.commercial, satisfied).length === 0;
  const altMet = set.alt !== null && satisfied.has(set.alt);
  return groupsMet || altMet;
}

/** ANY-route law (§5.6 alternative routes): the line opens when at
 *  least one declared set is satisfied; an empty lattice opens
 *  trivially (authored-ungated). */
export function canUnlock(
  sets: readonly ParsedPrereqSet[],
  satisfied: SatisfiedSet,
  knownIds?: SatisfiedSet,
): boolean {
  if (sets.length === 0) return true;
  assertKnown(sets, knownIds);
  return sets.some((set) => routeIsOpen(set, satisfied));
}

/** The readable lock: one row per blocked route — EMPTY whenever the
 *  lattice ADMITS the line (a lock nobody is standing behind reads as
 *  noise; call canUnlock for the boolean). Same fail-loud universe
 *  check as canUnlock. */
export function whatBlocks(
  sets: readonly ParsedPrereqSet[],
  satisfied: SatisfiedSet,
  knownIds?: SatisfiedSet,
): readonly PrereqBlocker[] {
  assertKnown(sets, knownIds);
  if (canUnlock(sets, satisfied)) return Object.freeze([]);
  const blockers: PrereqBlocker[] = [];
  for (const [index, set] of sets.entries()) {
    if (routeIsOpen(set, satisfied)) continue; // an open route never prints as a lock
    const missingTech = missingFrom(set.tech, satisfied);
    const missingCommercial = missingFrom(set.commercial, satisfied);
    const missingAlt = set.alt !== null && !satisfied.has(set.alt) ? set.alt : null;
    blockers.push(
      Object.freeze({
        setIndex: index,
        missingTech: Object.freeze(missingTech),
        missingCommercial: Object.freeze(missingCommercial),
        missingAlt,
      }),
    );
  }
  return Object.freeze(blockers);
}
