/**
 * Policy-deck boundary (G7 content-decks program 2/4): JSON → frozen
 * `LoadedPolicyDeck` of trusted `PolicyCard`s, the canonical single-card
 * content hash `deckCardHash`, and `bootRulesFromDeck` — the TRUSTED
 * boot.rules book shape the runner's `lookupPolicyCard` seam consumes.
 *
 * Sibling discipline to packs.ts: parse-don't-validate (Law 2). This is THE
 * point where an authored deck document becomes trusted, deep-frozen,
 * branded interpreter input; downstream consumers never re-check shapes.
 * The card arm of the grammar is field-for-field `PolicyCardWire` (the
 * boot-rules rider @9653a96): decimal-string bigints, OneTwoThree 1..3
 * arity, omit-when-unset optionals — so a deck JSON card can cross a worker
 * hop unchanged and revive byte-ident.
 *
 * SCOPE LAW — shape here, meaning there. This parser proves the closed
 * vocabularies (re-declared below; packs.ts BAD_ENUM posture — the law
 * sources are types.ts §B unions + the content schema + protocol.ts wire
 * tables, drift-pinned by __tests__/deckVocab.test.ts: an enum change must
 * touch ALL FOUR sites), the 1..3 tuple arity, key-set discipline
 * (UNKNOWN_FIELD — `era`/`availableFrom` invitations on cards are refused,
 * the deck is content not a schedule), the decimal-string bigint law with
 * its resolution walls, and id-set uniqueness. The PAIRING walls the
 * protocol codec declined (comparator↔threshold-kind, ELSE `to: "band"` ↔
 * band-valued ref) stay the engine's fold-time authority —
 * policy/evaluator.ts re-runs `validatePolicyCard` over the whole book on
 * every fold, so a lie in a card faults the sim, never the codec. Two walls
 * are deliberately DOUBLED (loader-side, per the content contract the deck
 * schema authors): estate-ref-null and runbookName-on-run-runbook —
 * types.ts docblocks state them as field shape, and a deck that violates
 * them is a content bug best caught at load, not at play. The import law is
 * honored absolutely: this file reads ../types, ../kernel, ../internal and
 * ./boundary — NEVER ../policy/*.
 *
 * Error codes: every failure is an existing `LoaderError` code (the enum
 * lives in boundary.ts and is not extended from this file):
 *   vocabulary failure            → BAD_ENUM      (comparator/unit/action/band/scope/threshold/escalation)
 *   absent required field         → MISSING_FIELD
 *   undeclared field / dup id     → UNKNOWN_FIELD (era, availableFrom; duplicate card id naming both positions)
 *   shape / type failure          → WRONG_TYPE    (number where decimal-string rules; field-discipline walls)
 *   count outside a floor         → OUT_OF_RANGE  (empty deck; arity 0 or 4+; negative upkeep; zero FOR; Fixed domain)
 *   µ$ / µs / Fixed resolution    → SUB_MICROUSD_RESOLUTION / SUB_MICROSECOND_RESOLUTION / NOT_A_SAFE_INTEGER
 *   identifier pattern            → BAD_PATTERN   (deckId)
 *
 * `deckCardHash` is the ONE hash law new content decks may feed. Three older
 * local laws exist and stay local: g7Deck's `cardSummary → canonicalDigest`
 * (gates/g7 app-side), the mainline runner tests' private
 * `l-g7m-card|… → canonicalDigest`, and the door's file-local
 * `cardFingerprint` folded by `ruleBookHash` (intent-door.ts M3 — whole-book
 * identity, ␀-joined fixed-order walk omitting the optional for/unless/else
 * arms), and versus ADOPTS deckCardHash for its doctrine binding (owner
 * ruling 2026-10-19; witness versus/__tests__/doctrineDecks.test.ts), so the
 * only hashes that ever bind a content deck are this function's.
 * deckCardHash is the content-deck successor: the SAME kernel family
 * (`fnv1a64OverCodePoints`, no avalanche — a deterministic fingerprint, not
 * a cryptographic digest) and the SAME grammar furniture (␀/␁ separators,
 * the "\u2205" null sentinel, decimal bigint strings), but a COMPLETE
 * canonical walk — every leaf of the card at its dotted path, paths sorted
 * code-unit, a domain tag folded first. Structural equivalence to the door
 * fingerprint is deliberate; equality is NOT: a fuller walk plus a named
 * domain means the same card never claims two different hashes across
 * domains. LAW: the hash is a host-computed LOOKUP KEY, never a claim —
 * the door treats it as an opaque string (types.ts `PolicyCardCommitArgs`);
 * the engine re-validates the card itself.
 *
 * Determinism laws: no Math.random, no Date, no Intl, no localeCompare.
 * Sorts use `compareCodeUnits` from src/internal/canonical.ts (the shared
 * home packs.ts already rides).
 */

import { compareCodeUnits, fnv1a64OverCodePoints } from "../internal/canonical.ts";
import { FIXED_RAW_MAX, FIXED_RAW_MIN } from "../kernel/fixed.ts";
import type {
  Comparator,
  DelegationBand,
  MetricUnit,
  OneTwoThree,
  PolicyAction,
  PolicyActionId,
  PolicyCard,
  PolicyEscalation,
  PolicyThreshold,
  Predicate,
  ScopeSelector,
} from "../types.ts";
import { asMetricId, asMoney, asRuleId } from "../types.ts";
import { LoaderError } from "./boundary.ts";

/* ═════════════════════ vocabularies (law sources cited; deckVocab.test.ts pins) ═════════════════════ */

/** types.ts `Comparator` (§B 2.2). Law sources: types.ts union ↔
 *  packages/content/schema/policy-deck.schema.json enum ↔ protocol.ts
 *  `POLICY_COMPARATOR_WIRE_IDS` — keep all four in lockstep. */
const COMPARATORS: readonly Comparator[] = [">", "<", "changed", "fails", "completes"];
/** types.ts `MetricUnit`. */
const METRIC_UNITS: readonly MetricUnit[] = [
  "percent",
  "us",
  "ms",
  "count",
  "micro-usd",
  "ratio",
  "minutes",
];
/** types.ts `PolicyActionId` (the §B 2.4 closed verb set). */
const ACTION_IDS: readonly PolicyActionId[] = [
  "scale-out",
  "shed-class",
  "page",
  "open-ticket",
  "dispatch-remote-hands",
  "raise-inspection-depth",
  "failover",
  "run-runbook",
  "drain",
  "queue-change",
];
/** types.ts `DelegationBand` (§7.14). */
const BANDS: readonly DelegationBand[] = ["inform", "consult", "execute"];
/** types.ts `ScopeSelector["kind"]`. */
const SCOPE_KINDS: readonly ScopeSelector["kind"][] = ["object", "role", "query", "class", "estate"];
/** types.ts `PolicyThreshold["kind"]`. */
const THRESHOLD_KINDS: readonly PolicyThreshold["kind"][] = ["value", "class-ref", "event-name"];
/** types.ts `PolicyEscalation["to"]`. */
const ESCALATION_TARGETS: readonly PolicyEscalation["to"][] = ["band", "role", "runbook"];

/* ═════════════════════ patterns ═════════════════════ */

/** House id shape, PACK_ID_RE sibling (schema/i18n-pack.schema.json law). */
const DECK_ID_RE = /^deck:[a-z0-9][a-z0-9.-]*$/;
/** `appliesTo` mirrors the namespaced bundle id the i18n pack carries. */
const APPLIES_TO_RE = /^[a-z0-9][a-z0-9-]*:[a-z0-9][a-z0-9-]*$/;
const DECIMAL_INT_RE = /^-?\d+$/;
const DECIMAL_FRACTION_RE = /^-?\d+\.\d*$/;

/* ═════════════════════ the hash domain ═════════════════════ */

/** The domain tag folded into every `deckCardHash` — bump ONLY with a
 *  disclosed law change (permanent re-pin of every issued key). */
export const DECK_CARD_HASH_DOMAIN = "hh-deck-card-hash-v1";

/* ═════════════════════ loaded (trusted) shapes ═════════════════════ */

/** The TRUSTED, frozen deck. `cards` preserves AUTHORING order (the book the
 *  player commits is the deck as written; ruleBookHash sorts by id itself). */
export interface LoadedPolicyDeck {
  readonly schemaVersion: 1;
  /** deckId (null when the author omits it — identity is content, not name). */
  readonly deckId: string | null;
  /** Namespaced bundle id the deck was authored for (null = unscoped). */
  readonly appliesTo: string | null;
  readonly note: string | null;
  readonly cards: readonly PolicyCard[];
  readonly todo: string | null;
}

/** One boot.rules book entry — TRUSTED form (real branded PolicyCard),
 *  structurally identical to protocol.ts `BootRuleEntry`. No protocol
 *  import: the engine side defines its own shape; the apps side mirrors it. */
export interface LoadedBootRuleEntry {
  readonly hash: string;
  readonly card: PolicyCard;
}

/** The TRUSTED book `createRunner`/`lookupPolicyCard` consumes — structurally
 *  identical to protocol.ts `BootRules` (entries arm) and deep-frozen like
 *  `workerRulesLookup`'s output. */
export interface LoadedBootRules {
  readonly entries: readonly LoadedBootRuleEntry[];
}

/* ═════════════════════ parsing machinery (packs.ts house shape) ═════════════════════ */

type JsonRecord = Record<string, unknown>;

function wrongType(value: unknown, path: string, expected: string): never {
  const got = value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
  throw new LoaderError("WRONG_TYPE", path, `expected ${expected}, got ${got}`);
}

function asRecord(value: unknown, path: string): JsonRecord {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    wrongType(value, path, "object");
  }
  return value as JsonRecord;
}

function nonEmptyString(value: unknown, path: string): string {
  if (typeof value !== "string") wrongType(value, path, "non-empty string");
  if (value.length === 0) {
    throw new LoaderError("WRONG_TYPE", path, "empty string is not an authored value");
  }
  return value;
}

function stringOrNull(value: unknown, path: string): string | null {
  if (value === null) return null;
  return nonEmptyString(value, path);
}

function getRequired(source: JsonRecord, key: string, path: string): unknown {
  if (!Object.prototype.hasOwnProperty.call(source, key)) {
    const where = path.length === 0 ? key : `${path}.${key}`;
    throw new LoaderError("MISSING_FIELD", where, `required field '${key}' is absent`);
  }
  return source[key];
}

function getOptional(source: JsonRecord, key: string): unknown {
  return Object.prototype.hasOwnProperty.call(source, key) ? source[key] : undefined;
}

/** Reject keys the plan does not declare (UNKNOWN_FIELD discipline shared
 *  with bundle.ts / packs.ts — `era` and `availableFrom` invitations on deck
 *  content die here: a deck is a book of rules, not a schedule). */
function assertKnownKeys(source: JsonRecord, allowed: readonly string[], path: string, what: string): void {
  for (const key of Object.keys(source)) {
    if (allowed.includes(key)) continue;
    const where = path.length === 0 ? key : `${path}.${key}`;
    throw new LoaderError("UNKNOWN_FIELD", where, `field '${key}' is not declared by the ${what}`);
  }
}

function enumLeaf<T extends string>(allowed: readonly T[], value: unknown, path: string, what: string): T {
  const text = nonEmptyString(value, path);
  if (!(allowed as readonly string[]).includes(text)) {
    throw new LoaderError(
      "BAD_ENUM",
      path,
      `'${text}' is not a ${what} [${allowed.join(", ")}] (closed vocabulary — deckVocab.test.ts pins every site)`,
    );
  }
  return text as T;
}

function deepFreeze<T>(value: T): T {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const inner of Object.values(value as Record<string, unknown>)) deepFreeze(inner);
  }
  return value;
}

/* ═════════════════════ decimal-string bigint revival (boundary.ts law) ═════════════════════ */

/** One decimal integer, KEPT as text until the final branded revival —
 *  the wire never carries a JSON float into an exact domain (boundary.ts:
 *  "no floats in logic paths"). Fractions fail with the domain's resolution
 *  code; anything non-numeric fails WRONG_TYPE naming the decimal-string law. */
function decimalIntText(value: unknown, path: string): string {
  if (typeof value === "number") {
    throw new LoaderError(
      "WRONG_TYPE",
      path,
      `${String(value)} is a JSON number — exact values arrive as decimal STRINGS (wire bigint law)`,
    );
  }
  if (typeof value !== "string") wrongType(value, path, "decimal-string integer");
  if (DECIMAL_INT_RE.test(value)) return value;
  if (DECIMAL_FRACTION_RE.test(value)) return value; // caller owns the resolution verdict
  throw new LoaderError("WRONG_TYPE", path, `'${value}' is not a decimal integer literal`);
}

/** Money µ$ (upkeep): whole micro-dollars, non-negative (grammar.ts upkeep
 *  law mirrored — a negative cost is arithmetically loud at load). */
function reviveMoney(value: unknown, path: string): PolicyCard["upkeepMicroUsd"] {
  const text = decimalIntText(value, path);
  if (!DECIMAL_INT_RE.test(text)) {
    throw new LoaderError(
      "SUB_MICROUSD_RESOLUTION",
      path,
      `'${text}' µ$ is not an integer number of micro-dollars`,
    );
  }
  const raw = BigInt(text);
  if (raw < 0n) {
    throw new LoaderError("OUT_OF_RANGE", path, `upkeep ${text} µ$ is negative — a rule costs, it never pays`);
  }
  return asMoney(raw);
}

/** SimTimeUs µs (FOR duration): whole microseconds, strictly positive. */
function reviveUs(value: unknown, path: string): bigint {
  const text = decimalIntText(value, path);
  if (!DECIMAL_INT_RE.test(text)) {
    throw new LoaderError(
      "SUB_MICROSECOND_RESOLUTION",
      path,
      `'${text}' µs is not an integer number of microseconds; integer-µs state cannot hold it`,
    );
  }
  const raw = BigInt(text);
  if (raw <= 0n) {
    throw new LoaderError("OUT_OF_RANGE", path, `FOR durationUs ${text} must be positive (grammar.ts sustained-window law)`);
  }
  return raw;
}

/** Q16.16 Fixed raw (threshold amount, action value): a whole count of
 *  1/65536 units inside the kernel domain; sign is the author's (a `<`-style
 *  threshold may be negative by grammar — the wire never reads meaning). */
function reviveFixed(value: unknown, path: string): bigint {
  const text = decimalIntText(value, path);
  if (!DECIMAL_INT_RE.test(text)) {
    throw new LoaderError(
      "NOT_A_SAFE_INTEGER",
      path,
      `Fixed raw '${text}' must be a whole 1/65536 count — fractional raws never enter loaded state`,
    );
  }
  const raw = BigInt(text);
  if (raw < FIXED_RAW_MIN || raw > FIXED_RAW_MAX) {
    throw new LoaderError(
      "OUT_OF_RANGE",
      path,
      `Fixed raw ${text} outside the Q16.16 domain [${FIXED_RAW_MIN}, ${FIXED_RAW_MAX}]`,
    );
  }
  return raw;
}

/* ═════════════════════ card-arm parses ═════════════════════ */

const THRESHOLD_KEYS: Readonly<Record<PolicyThreshold["kind"], readonly string[]>> = {
  value: ["kind", "amount", "unit"],
  "class-ref": ["kind", "classId"],
  "event-name": ["kind", "name"],
};

function parseThreshold(value: unknown, path: string): PolicyThreshold {
  const source = asRecord(value, path);
  const kind = enumLeaf(THRESHOLD_KINDS, getRequired(source, "kind", path), `${path}.kind`, "threshold kind");
  assertKnownKeys(source, THRESHOLD_KEYS[kind], path, "policy-deck threshold schema");
  if (kind === "value") {
    return Object.freeze({
      kind: "value",
      amount: reviveFixed(getRequired(source, "amount", path), `${path}.amount`),
      unit: enumLeaf(METRIC_UNITS, getRequired(source, "unit", path), `${path}.unit`, "metric unit"),
    });
  }
  if (kind === "class-ref") {
    return Object.freeze({
      kind: "class-ref",
      classId: nonEmptyString(getRequired(source, "classId", path), `${path}.classId`),
    });
  }
  return Object.freeze({
    kind: "event-name",
    name: nonEmptyString(getRequired(source, "name", path), `${path}.name`),
  });
}

const PREDICATE_KEYS: readonly string[] = ["metric", "comparator", "threshold"];

function parsePredicate(value: unknown, path: string): Predicate {
  const source = asRecord(value, path);
  assertKnownKeys(source, PREDICATE_KEYS, path, "policy-deck predicate schema");
  return Object.freeze({
    metric: asMetricId(nonEmptyString(getRequired(source, "metric", path), `${path}.metric`)),
    comparator: enumLeaf(COMPARATORS, getRequired(source, "comparator", path), `${path}.comparator`, "comparator"),
    threshold: parseThreshold(getRequired(source, "threshold", path), `${path}.threshold`),
  });
  // comparator↔threshold-kind pairing is the evaluator's fold-time wall —
  // deliberately NOT re-invented here (codec doctrine, protocol.ts).
}

/** The OneTwoThree arity wall (§B 2.3.5 "one rule = one story"): the parse
 *  proves 1..3 so the tuple type never lies; ordering is data, untouched. */
function parseOneTwoThree<T>(value: unknown, path: string, what: string, parse: (v: unknown, p: string) => T): OneTwoThree<T> {
  if (!Array.isArray(value)) wrongType(value, path, `1..3 ${what}`);
  if (value.length < 1 || value.length > 3) {
    throw new LoaderError("OUT_OF_RANGE", path, `${value.length} ${what} — one rule carries 1..3 (arity wall, §B 2.3.5)`);
  }
  const list = value.map((entry, index) => parse(entry, `${path}[${index}]`));
  if (list.length === 1) return Object.freeze([list[0] as T]) as OneTwoThree<T>;
  if (list.length === 2) return Object.freeze([list[0] as T, list[1] as T]) as OneTwoThree<T>;
  return Object.freeze([list[0] as T, list[1] as T, list[2] as T]) as OneTwoThree<T>;
}

const ACTION_KEYS: readonly string[] = ["id", "runbookName", "value"];

function parseAction(value: unknown, path: string): PolicyAction {
  const source = asRecord(value, path);
  assertKnownKeys(source, ACTION_KEYS, path, "policy-deck action schema");
  const id = enumLeaf(ACTION_IDS, getRequired(source, "id", path), `${path}.id`, "policy action");
  const runbookRaw = getRequired(source, "runbookName", path);
  const runbookName = stringOrNull(runbookRaw, `${path}.runbookName`);
  const valueRaw = getRequired(source, "value", path);
  // Doubled wall (see header): types.ts states the runbookName shape law
  // ("null for other verbs"); catch the content bug at load, the engine
  // re-says it at fold.
  if (id === "run-runbook" && runbookName === null) {
    throw new LoaderError("WRONG_TYPE", path, "run-runbook requires a non-empty runbookName");
  }
  if (id !== "run-runbook" && runbookName !== null) {
    throw new LoaderError("WRONG_TYPE", path, `runbookName is only legal on run-runbook (action '${id}' must carry null)`);
  }
  return Object.freeze({
    id,
    runbookName: id === "run-runbook" ? runbookName : null,
    value: valueRaw === null ? null : reviveFixed(valueRaw, `${path}.value`),
  });
}

const SCOPE_KEYS: readonly string[] = ["kind", "ref"];

function parseScope(value: unknown, path: string): ScopeSelector {
  const source = asRecord(value, path);
  assertKnownKeys(source, SCOPE_KEYS, path, "policy-deck scope schema");
  const kind = enumLeaf(SCOPE_KINDS, getRequired(source, "kind", path), `${path}.kind`, "scope kind");
  const refRaw = getRequired(source, "ref", path);
  const ref = stringOrNull(refRaw, `${path}.ref`);
  // Doubled walls (see header): the ScopeSelector docblock states the
  // null-for-estate law as field shape; the shape parse proves it.
  if (kind === "estate") {
    if (ref !== null) {
      throw new LoaderError("WRONG_TYPE", `${path}.ref`, "estate scope ref must be null (ScopeSelector docblock law)");
    }
  } else if (ref === null) {
    throw new LoaderError("WRONG_TYPE", `${path}.ref`, `non-estate scope '${kind}' requires a non-empty ref`);
  }
  return Object.freeze({ kind, ref });
}

const ELSE_KEYS: readonly string[] = ["to", "ref"];

function parseElse(value: unknown, path: string): PolicyEscalation {
  const source = asRecord(value, path);
  assertKnownKeys(source, ELSE_KEYS, path, "policy-deck ELSE schema");
  const to = enumLeaf(ESCALATION_TARGETS, getRequired(source, "to", path), `${path}.to`, "escalation target");
  const ref = nonEmptyString(getRequired(source, "ref", path), `${path}.ref`);
  // The to=band ⇒ band-valued ref pairing is the evaluator's wall — the
  // boundary cast is the honest shape, never a re-invention (revive-ident).
  return Object.freeze({ to, ref }) as PolicyEscalation;
}

const FOR_KEYS: readonly string[] = ["durationUs"];

const CARD_KEYS: readonly string[] = [
  "id",
  "scope",
  "when",
  "for",
  "then",
  "unless",
  "else",
  "band",
  "upkeepMicroUsd",
];

function parseCard(value: unknown, path: string): PolicyCard {
  const source = asRecord(value, path);
  assertKnownKeys(source, CARD_KEYS, path, "policy-deck card schema");
  const card: {
    id: PolicyCard["id"];
    scope: ScopeSelector;
    when: OneTwoThree<Predicate>;
    for?: NonNullable<PolicyCard["for"]>;
    then: OneTwoThree<PolicyAction>;
    unless?: OneTwoThree<Predicate>;
    else?: PolicyEscalation;
    band: DelegationBand;
    upkeepMicroUsd: PolicyCard["upkeepMicroUsd"];
  } = {
    id: asRuleId(nonEmptyString(getRequired(source, "id", path), `${path}.id`)),
    scope: parseScope(getRequired(source, "scope", path), `${path}.scope`),
    when: parseOneTwoThree(getRequired(source, "when", path), `${path}.when`, "predicates", parsePredicate),
    then: parseOneTwoThree(getRequired(source, "then", path), `${path}.then`, "actions", parseAction),
    band: enumLeaf(BANDS, getRequired(source, "band", path), `${path}.band`, "delegation band"),
    upkeepMicroUsd: reviveMoney(getRequired(source, "upkeepMicroUsd", path), `${path}.upkeepMicroUsd`),
  };
  const forRaw = getOptional(source, "for");
  if (forRaw !== undefined) {
    const forSource = asRecord(forRaw, `${path}.for`);
    assertKnownKeys(forSource, FOR_KEYS, `${path}.for`, "policy-deck FOR schema");
    card.for = Object.freeze({
      durationUs: reviveUs(getRequired(forSource, "durationUs", `${path}.for`), `${path}.for.durationUs`),
    });
  }
  const unlessRaw = getOptional(source, "unless");
  if (unlessRaw !== undefined) {
    card.unless = parseOneTwoThree(unlessRaw, `${path}.unless`, "predicates", parsePredicate);
  }
  const elseRaw = getOptional(source, "else");
  if (elseRaw !== undefined) {
    card.else = parseElse(elseRaw, `${path}.else`);
  }
  return Object.freeze(card);
}

/* ═════════════════════ the boundary parse ═════════════════════ */

const DECK_TOP_LEVEL_KEYS: readonly string[] = [
  "schemaVersion",
  "deckId",
  "appliesTo",
  "note",
  "cards",
  "_todo",
];

/**
 * THE boundary parse (Law 2). Input: JSON-parsed deck document (the shape
 * packages/content/schema/policy-deck.schema.json describes; cards are
 * field-for-field `PolicyCardWire`, bigints as decimal strings). Output:
 * frozen `LoadedPolicyDeck` of trusted, branded, deep-frozen `PolicyCard`s
 * in authoring order. Every failure is a LoaderError (existing code + dotted
 * path). Duplicate card ids are refused naming both positions — the deck is
 * a SET keyed by id (the door's `card-id-collision` law pre-armed).
 */
export function parsePolicyDeck(raw: unknown): LoadedPolicyDeck {
  const source = asRecord(raw, "");
  assertKnownKeys(source, DECK_TOP_LEVEL_KEYS, "", "policy-deck schema");

  const version = getRequired(source, "schemaVersion", "");
  if (version !== 1) {
    throw new LoaderError("BAD_ENUM", "schemaVersion", `only policy-deck schemaVersion 1 is consumed (got ${JSON.stringify(version)})`);
  }

  const deckIdRaw = getOptional(source, "deckId");
  const deckId = deckIdRaw === undefined ? null : patternLeaf(DECK_ID_RE, "the deck id pattern (deck:<lower-case slug>)")(deckIdRaw, "deckId");
  const appliesToRaw = getOptional(source, "appliesTo");
  const appliesTo =
    appliesToRaw === undefined
      ? null
      : patternLeaf(APPLIES_TO_RE, "the namespaced bundle id pattern (i18n-pack law shared)")(appliesToRaw, "appliesTo");
  const noteRaw = getOptional(source, "note");
  const note = noteRaw === undefined ? null : nonEmptyString(noteRaw, "note");
  const todoRaw = getOptional(source, "_todo");
  const todo = todoRaw === undefined ? null : nonEmptyString(todoRaw, "_todo");

  const cardsRaw = getRequired(source, "cards", "");
  if (!Array.isArray(cardsRaw)) wrongType(cardsRaw, "cards", "array of policy cards");
  if (cardsRaw.length === 0) {
    throw new LoaderError("OUT_OF_RANGE", "cards", "the deck is empty — a book of zero rules is not content, it is a mistake");
  }
  const ids = new Map<string, number>();
  const cards: PolicyCard[] = [];
  cardsRaw.forEach((entry, index) => {
    const path = `cards[${index}]`;
    const card = parseCard(entry, path);
    const first = ids.get(String(card.id));
    if (first !== undefined) {
      throw new LoaderError(
        "UNKNOWN_FIELD",
        `${path}.id`,
        `card id '${String(card.id)}' is not unique — the book is a set keyed by id (duplicates cards[${first}] and cards[${index}])`,
      );
    }
    ids.set(String(card.id), index);
    cards.push(card);
  });

  return deepFreeze({
    schemaVersion: 1,
    deckId,
    appliesTo,
    note,
    cards: Object.freeze(cards) as readonly PolicyCard[],
    todo,
  } satisfies LoadedPolicyDeck);
}

function patternLeaf(re: RegExp, describe: string) {
  return (value: unknown, path: string): string => {
    const text = nonEmptyString(value, path);
    if (!re.test(text)) {
      throw new LoaderError("BAD_PATTERN", path, `'${text}' fails ${describe}`);
    }
    return text;
  };
}

/* ═════════════════════ deckCardHash — canonical content-deck hash v1 ═════════════════════ */

const NULL_SENTINEL = "∅"; // "\u2205" — the door's sentinel, same grammar furniture
const LEAF_SEP = "\u0000"; // ␀ — path/value within a segment (door fingerprint joiner)
const SEG_SEP = "\u0001"; // ␁ — between segments (door whole-book joiner)

function hashLeaf(value: unknown, path: string, sink: Map<string, string>): void {
  if (value === null) {
    sink.set(path, NULL_SENTINEL);
    return;
  }
  if (typeof value === "bigint") {
    sink.set(path, value.toString(10)); // decimal string, the house wire form
    return;
  }
  if (typeof value === "string") {
    sink.set(path, value);
    return;
  }
  wrongType(value, path, "string | bigint | null leaf");
}

function hashPredicate(predicate: Predicate, path: string, sink: Map<string, string>): void {
  hashLeaf(predicate.metric, `${path}.metric`, sink);
  hashLeaf(predicate.comparator, `${path}.comparator`, sink);
  const t = predicate.threshold;
  hashLeaf(t.kind, `${path}.threshold.kind`, sink);
  if (t.kind === "value") {
    hashLeaf(t.amount, `${path}.threshold.amount`, sink);
    hashLeaf(t.unit, `${path}.threshold.unit`, sink);
  } else if (t.kind === "class-ref") {
    hashLeaf(t.classId, `${path}.threshold.classId`, sink);
  } else {
    hashLeaf(t.name, `${path}.threshold.name`, sink);
  }
}

function hashAction(action: PolicyAction, path: string, sink: Map<string, string>): void {
  hashLeaf(action.id, `${path}.id`, sink);
  hashLeaf(action.runbookName, `${path}.runbookName`, sink); // null → ∅ sentinel
  hashLeaf(action.value, `${path}.value`, sink); // null → ∅ sentinel
}

/** Flatten one TRUSTED card into `dotted path → canonical text` leaves.
 *  Absent optionals leave NO leaf (absence is the marker); nulls take the
 *  sentinel; bigints take their decimal strings. Extra keys anywhere fail
 *  loud — a card that is not exactly PolicyCard shape is not trusted input,
 *  whoever built it. */
function cardLeaves(card: PolicyCard): Map<string, string> {
  const source = card as unknown as JsonRecord;
  const sink = new Map<string, string>();
  assertKnownKeys(source, CARD_KEYS, "", "PolicyCard contract");
  hashLeaf(card.id, "id", sink);
  const scope = card.scope as unknown as JsonRecord;
  assertKnownKeys(scope, SCOPE_KEYS, "scope", "ScopeSelector contract");
  hashLeaf(scope.kind, "scope.kind", sink);
  hashLeaf(scope.ref, "scope.ref", sink);
  hashLeaf(card.band, "band", sink);
  hashLeaf(card.upkeepMicroUsd, "upkeepMicroUsd", sink);
  card.when.forEach((predicate, index) => hashPredicate(predicate, `when.${index}`, sink));
  card.then.forEach((action, index) => hashAction(action, `then.${index}`, sink));
  if (card.for !== undefined) {
    const forSource = card.for as unknown as JsonRecord;
    assertKnownKeys(forSource, FOR_KEYS, "for", "SustainedWindow contract");
    hashLeaf(card.for.durationUs, "for.durationUs", sink);
  }
  if (card.unless !== undefined) {
    card.unless.forEach((predicate, index) => hashPredicate(predicate, `unless.${index}`, sink));
  }
  if (card.else !== undefined) {
    const elseSource = card.else as unknown as JsonRecord;
    assertKnownKeys(elseSource, ELSE_KEYS, "else", "PolicyEscalation contract");
    hashLeaf(card.else.to, "else.to", sink);
    hashLeaf(card.else.ref, "else.ref", sink);
  }
  return sink;
}

/**
 * THE canonical content-deck hash law v1 — `hh-deck-card-hash-v1`.
 * `fnv1a64OverCodePoints` over: the domain tag, then EVERY card leaf at its
 * dotted path, paths sorted code-unit, `path␀value` segments joined by ␁ —
 * the door's `cardFingerprint` grammar (same kernel family, same separators,
 * same null sentinel, decimal bigints) completed to the FULL card: the
 * door's walk omits for/unless/else because ruleBookHash describes
 * *digested* book content; a content-deck key must move whenever ANY
 * clause moves. Relationship documented, equality not claimed: this fold
 * also hashes the domain tag first and sorts by path. Wire-identity:
 * because revived bigints fold to their decimal text, a string-valued
 * `upkeepMicroUsd: "12500"` (the UN-revived wire form) folds identically
 * to the bigint `12500n` — a host may key a book from raw JSON before
 * revival; anything neither text nor null (a raw JSON NUMBER) is a shape
 * lie and fails loud. The result is a
 * host-computed LOOKUP KEY (16 lowercase hex), never a claim — the door
 * treats it as opaque; `validatePolicyCard` re-runs over the card itself on
 * every fold. New content decks may feed ONLY this function.
 */
export function deckCardHash(card: PolicyCard): string {
  const leaves = cardLeaves(card);
  const parts: string[] = [DECK_CARD_HASH_DOMAIN];
  for (const path of [...leaves.keys()].sort(compareCodeUnits)) {
    const value = leaves.get(path) as string;
    parts.push(`${path}${LEAF_SEP}${value}`);
  }
  return fnv1a64OverCodePoints(parts.join(SEG_SEP));
}

/* ═════════════════════ bootRulesFromDeck ═════════════════════ */

/**
 * Deck → the TRUSTED boot.rules book (structurally protocol.ts `BootRules`
 * minus the protocol import: the runner seam is hash → PolicyCard and this
 * is that shape, deep-frozen). Ids are unique by parse wall, so duplicate
 * hashes are impossible through the front door — the guard stays because
 * `LoadedPolicyDeck` is a public interface a host could hand-build: a
 * duplicate hash (fnv1a64 is a 64-bit tripwire, not a cryptographic digest
 * — two DIFFERENT cards can collide) is refused naming BOTH positions, the
 * `parseBootRules` dup-hash posture restated loader-side. Empty decks are
 * legal armed-but-silent books.
 */
export function bootRulesFromDeck(deck: LoadedPolicyDeck): LoadedBootRules {
  const seen = new Map<string, number>();
  const entries: LoadedBootRuleEntry[] = [];
  deck.cards.forEach((card, index) => {
    const hash = deckCardHash(card);
    const first = seen.get(hash);
    if (first !== undefined) {
      throw new LoaderError(
        "UNKNOWN_FIELD",
        `cards[${index}]`,
        `deckCardHash collision between cards[${first}] (id '${String(deck.cards[first]?.id)}') and cards[${index}] (id '${String(card.id)}') — the book is a set keyed by hash`,
      );
    }
    seen.set(hash, index);
    entries.push(Object.freeze({ hash, card }));
  });
  return deepFreeze({ entries: Object.freeze(entries) as readonly LoadedBootRuleEntry[] });
}
