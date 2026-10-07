/**
 * i18n grammar-pack boundary (R46; §9.3/§9.11): JSON → frozen `LoadedI18nPack`.
 *
 * Sibling discipline to bundle.ts: parse-don't-validate (Law 2) — this is THE
 * point where the authoring wire JSON becomes trusted, deep-frozen, keyed in
 * pinned order; downstream resolution never re-checks shapes. Packs carry no
 * numerics (pure human strings + 4-digit era years), so there are no
 * Fixed/SimTimeUs conversions here — the boundary job is SHAPE, the
 * decision/flavour ROOT WALL, global key uniqueness, era-object form and
 * {slot} token syntax.
 *
 * Scope law: only what a CONSUMER must trust is enforced here. Authoring
 * quality gates (README §Key literals verbatim sync, the §9.11 technique
 * ban-list, dead-slot detection, template length floors) stay in
 * packages/content/script/validate.mjs — that validator is the LAW SOURCE
 * the content-CI keeps; this parser can never reject a pack CI accepted.
 *
 * Error codes: every failure is an existing `LoaderError` code (the enum
 * lives in boundary.ts and is not extended from this file):
 *   root-wall violation      → BAD_ENUM      (root not in the namespace vocabulary)
 *   duplicate / extra field  → UNKNOWN_FIELD (key in BOTH namespaces; undeclared field)
 *   absent required field    → MISSING_FIELD (also: fillTemplate missing slots)
 *   shape / type failure     → WRONG_TYPE    (template neither string nor era object)
 *   identifier failure       → BAD_PATTERN   (packId, locale, key, era year, slot token)
 *   count outside a floor    → OUT_OF_RANGE  (empty namespace, zero era entries)
 *
 * Determinism laws: no Math.random, no Date, no Intl, no localeCompare.
 * Every dynamic-key map is built from code-unit-SORTED entries (era maps by
 * numeric year) and exposed as a sealed read-only view; iteration is therefore
 * pinned. `compareCodeUnits` comes from src/internal/canonical.ts — the
 * shared home that retired the former byte-fork (the one-liner used to be
 * duplicated here to honor the loader's ../types+../kernel-only isolation
 * note; the refactor task supersedes that with the internal primitive, which
 * keeps the sort byte-identical while deleting the drift surface).
 */

import { compareCodeUnits } from "../internal/canonical.ts";
import { LoaderError } from "./boundary.ts";

/* ═════════════════════ vocabularies (law source cited) ═════════════════════ */

/**
 * §9.3 separation law, machine shape: every namespace root is EITHER
 * decision-surface (read while deciding or losing — written SOBER, never
 * funny at the moment of loss) OR flavour (quiet surfaces — recognition
 * comedy). LAW SOURCE: packages/content/script/validate.mjs `DECISION_ROOTS`
 * / `FLAVOUR_ROOTS` (§9.3-closed sets; keep in sync — the content validator
 * is authoritative, this copy exists only because cross-package imports are
 * forbidden for the interpreter subset). A root outside BOTH sets is
 * undeclared vocabulary and fails loud at parse.
 */
const DECISION_ROOTS: readonly string[] = [
  "type",
  "visitor",
  "goal",
  "scarce",
  "skin",
  "economy",
  "cac",
  "verbs",
  "relations",
  "scenarios",
  "handover",
  "rosetta",
  "terms",
  "refusal",
  "alert",
  "status",
  "wave",
];
const FLAVOUR_ROOTS: readonly string[] = [
  "ticket",
  "press",
  "forum",
  "chatter",
  "loading",
  "abuse",
  "canary",
  "intern",
  "sticky",
  "vendor",
  "achievement",
  "codex",
];

const SLOT_KINDS: readonly I18nSlotKind[] = [
  "entity",
  "number",
  "money",
  "duration",
  "tick",
  "pct",
  "time",
  "text",
];

/* Patterns mirrored from the pack schema + validator (same law, same regex). */
const PACK_ID_RE = /^pack:[a-z0-9][a-z0-9.-]*$/;
const APPLIES_TO_RE = /^[a-z0-9][a-z0-9-]*:[a-z0-9][a-z0-9-]*$/;
const LOCALE_RE = /^[a-z]{2}(-[A-Z]{2})?$/;
const PACK_KEY_RE = /^[a-z][a-z0-9]*(\.[a-z0-9][a-z0-9-]*)+$/;
const ERA_YEAR_RE = /^\d{4}$/;
const SLOT_NAME_RE = /^[a-z][A-Za-z0-9]*$/;

/* ═════════════════════ loaded (trusted) shapes ═════════════════════ */

export type I18nSlotKind = "entity" | "number" | "money" | "duration" | "tick" | "pct" | "time" | "text";
export type I18nNamespace = "decision" | "flavour";

/** One entry of the pack slot glossary (`slots`). */
export interface LoadedI18nSlot {
  readonly kind: I18nSlotKind;
  readonly desc: string | null;
}

interface I18nTemplateBase {
  /** Namespace the key was parsed out of — self-describing for consumers. */
  readonly namespace: I18nNamespace;
  /** The dotted pack key this template was parsed under. */
  readonly key: string;
  /** Distinct {slot} names the template requires, code-unit sorted. */
  readonly slots: readonly string[];
}

export interface PlainI18nTemplate extends I18nTemplateBase {
  readonly kind: "plain";
  readonly body: string;
}

export interface EraVariantI18nTemplate extends I18nTemplateBase {
  readonly kind: "era-variant";
  /** Declared era code (plain number year) → variant body, ascending. */
  readonly eras: ReadonlyMap<number, string>;
  readonly fallback: string;
}

export type I18nTemplate = PlainI18nTemplate | EraVariantI18nTemplate;

/** The TRUSTED, frozen pack. Every map iterates in pinned order (keys sorted
 *  at parse; era maps by numeric year). Deep-frozen like LoadedTypeBundle. */
export interface LoadedI18nPack {
  readonly schemaVersion: 1;
  readonly packId: string;
  readonly appliesTo: string;
  readonly locale: string;
  readonly note: string | null;
  /** Declared era axis: year → meaning, ascending by year. */
  readonly eraCodes: ReadonlyMap<number, string>;
  /** Slot glossary: slot name → entry, code-unit sorted. */
  readonly slots: ReadonlyMap<string, LoadedI18nSlot>;
  readonly decision: ReadonlyMap<string, I18nTemplate>;
  readonly flavour: ReadonlyMap<string, I18nTemplate>;
  /** Template key → §-cite (null = authored voice, no doc line). Carries the
   *  pack's `_todo` note under the literal key "_todo" when authored. */
  readonly provenance: ReadonlyMap<string, string | null>;
  readonly todo: string | null;
}

/* ═════════════════════ parsing machinery ═════════════════════ */

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

function patternLeaf(re: RegExp, describe: string) {
  return (value: unknown, path: string): string => {
    const text = nonEmptyString(value, path);
    if (!re.test(text)) {
      throw new LoaderError("BAD_PATTERN", path, `'${text}' fails ${describe}`);
    }
    return text;
  };
}

/** Reject keys the plan does not declare (same UNKNOWN_FIELD discipline as
 *  bundle.ts, which checks against its Plan). */
function assertKnownKeys(source: JsonRecord, allowed: readonly string[], path: string): void {
  for (const key of Object.keys(source)) {
    if (allowed.includes(key)) continue;
    const where = path.length === 0 ? key : `${path}.${key}`;
    throw new LoaderError("UNKNOWN_FIELD", where, `field '${key}' is not declared by the i18n pack schema`);
  }
}

/** Immutable read-only Map view over privately-held insertion-ordered data.
 *  Object.freeze(map) alone still allows .set (entries live in internal
 *  slots), so consumers get a sealed facade with the read API only. */
function sealedMap<K, V>(entries: readonly (readonly [K, V])[]): ReadonlyMap<K, V> {
  const map = new Map<K, V>(entries);
  return Object.freeze({
    get size() {
      return map.size;
    },
    get: (key: K): V | undefined => map.get(key),
    has: (key: K): boolean => map.has(key),
    keys: (): IterableIterator<K> => map.keys(),
    values: (): IterableIterator<V> => map.values(),
    entries: (): IterableIterator<[K, V]> => map.entries(),
    forEach: (
      callback: (value: V, key: K, map: ReadonlyMap<K, V>) => void,
      thisArg?: unknown,
    ): void => {
      map.forEach((value, key) => callback.call(thisArg, value, key, map));
    },
    [Symbol.iterator]: (): IterableIterator<[K, V]> => map.entries(),
  });
}

function deepFreeze<T>(value: T): T {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const inner of Object.values(value as Record<string, unknown>)) deepFreeze(inner);
  }
  return value;
}

/* ═════════════════════ slot-token syntax ═════════════════════ */

/** One fresh /g regex per call — shared lastIndex state would be a hidden
 *  dependency; determinism first. */
function slotTokenRe(): RegExp {
  return /\{([^{}]*)\}/g;
}

/** Fail loud on any brace that is not part of a well-formed {slotName}.
 *  Returns the DISTINCT slot names the body requires, code-unit sorted.
 *  Same law as validate.mjs checkTemplate: slot syntax is {name} only,
 *  lowerCamel identifier, no nesting. */
function parseSlotSyntax(body: string, path: string): readonly string[] {
  const tokens = [...body.matchAll(slotTokenRe())];
  const opens = (body.match(/\{/g) ?? []).length;
  const closes = (body.match(/\}/g) ?? []).length;
  if (opens !== tokens.length || closes !== tokens.length) {
    throw new LoaderError("BAD_PATTERN", path, "unbalanced braces — slot syntax is {name} only");
  }
  const names = new Set<string>();
  for (const token of tokens) {
    const name = token[1] ?? "";
    if (!SLOT_NAME_RE.test(name)) {
      throw new LoaderError("BAD_PATTERN", path, `bad slot token '{${name}}' (lowerCamel identifier, no nesting)`);
    }
    names.add(name);
  }
  return Object.freeze([...names].sort(compareCodeUnits));
}

/* ═════════════════════ template parse ═════════════════════ */

const ERA_OBJECT_KEYS: readonly string[] = ["eras", "fallback"];

function parseTemplate(key: string, mapName: I18nNamespace, value: unknown, eraYears: ReadonlySet<number>): I18nTemplate {
  const path = `${mapName}.${key}`;
  const base = { namespace: mapName, key } as const;

  if (typeof value === "string") {
    return Object.freeze({ ...base, kind: "plain", body: value, slots: parseSlotSyntax(value, path) });
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    wrongType(value, path, "string or {eras, fallback} era-variant object");
  }

  const source = value as JsonRecord;
  assertKnownKeys(source, ERA_OBJECT_KEYS, path);
  const fallback = nonEmptyString(getRequired(source, "fallback", path), `${path}.fallback`);
  const fallbackSlots = parseSlotSyntax(fallback, `${path}.fallback`);

  const erasSource = asRecord(getRequired(source, "eras", path), `${path}.eras`);
  const eraKeys = Object.keys(erasSource);
  if (eraKeys.length === 0) {
    throw new LoaderError(
      "OUT_OF_RANGE",
      `${path}.eras`,
      "era-variant object needs >=1 era entry and a fallback",
    );
  }
  const sortedEraKeys = [...eraKeys].sort(compareCodeUnits);
  const entries: (readonly [number, string])[] = [];
  for (const eraKey of sortedEraKeys) {
    const eraPath = `${path}.eras.${eraKey}`;
    if (!ERA_YEAR_RE.test(eraKey)) {
      throw new LoaderError("BAD_PATTERN", eraPath, "era code must be a 4-digit year");
    }
    const year = Number(eraKey);
    if (!eraYears.has(year)) {
      throw new LoaderError(
        "BAD_ENUM",
        eraPath,
        `era '${eraKey}' not declared in pack eraCodes [${[...eraYears].sort((a, b) => a - b).join(", ")}]`,
      );
    }
    const eraBody = nonEmptyString(erasSource[eraKey], eraPath);
    const eraSlots = parseSlotSyntax(eraBody, eraPath);
    if (eraSlots.join("\u0000") !== fallbackSlots.join("\u0000")) {
      throw new LoaderError(
        "WRONG_TYPE",
        eraPath,
        `era variant slot set [${eraSlots.join(", ")}] differs from fallback [${fallbackSlots.join(", ")}] — every variant takes the same {slots}`,
      );
    }
    entries.push([year, eraBody]);
  }
  return Object.freeze({ ...base, kind: "era-variant", eras: sealedMap(entries), fallback, slots: fallbackSlots });
}

/* ═════════════════════ namespace parse (the root wall) ═════════════════════ */

function parseNamespace(
  mapName: I18nNamespace,
  value: unknown,
  roots: readonly string[],
  eraYears: ReadonlySet<number>,
  seen: Set<string>,
): Map<string, I18nTemplate> {
  const source = asRecord(value, mapName);
  const keys = Object.keys(source).sort(compareCodeUnits);
  if (keys.length === 0) {
    throw new LoaderError("OUT_OF_RANGE", mapName, `the ${mapName} namespace is empty — every pack carries both surfaces`);
  }
  const templates = new Map<string, I18nTemplate>();
  for (const key of keys) {
    const path = `${mapName}.${key}`;
    if (!PACK_KEY_RE.test(key)) {
      throw new LoaderError("BAD_PATTERN", path, `'${key}' is not a dotted lower-case pack key`);
    }
    // Global key uniqueness asserted AT PARSE (checked before the wall so a
    // duplicated key reports the real problem, not its root's vocabulary).
    if (seen.has(key)) {
      throw new LoaderError("UNKNOWN_FIELD", path, `key present in BOTH decision and flavour — pack keys are globally unique`);
    }
    const root = key.split(".")[0] ?? "";
    if (!roots.includes(root)) {
      throw new LoaderError(
        "BAD_ENUM",
        path,
        `root '${root}' is not in the ${mapName} vocabulary — decision/flavour namespaces are partitioned by root (§9.3 separation law); decision roots [${DECISION_ROOTS.join(", ")}], flavour roots [${FLAVOUR_ROOTS.join(", ")}]`,
      );
    }
    templates.set(key, parseTemplate(key, mapName, source[key], eraYears));
    seen.add(key);
  }
  return templates;
}

/* ═════════════════════ section parses ═════════════════════ */

function parseEraCodes(value: unknown): { readonly map: ReadonlyMap<number, string>; readonly years: Set<number> } {
  const source = asRecord(value, "eraCodes");
  const years = new Set<number>();
  const entries: (readonly [number, string])[] = [];
  for (const key of Object.keys(source).sort(compareCodeUnits)) {
    const path = `eraCodes.${key}`;
    if (!ERA_YEAR_RE.test(key)) {
      throw new LoaderError("BAD_PATTERN", path, "era code must be a 4-digit year");
    }
    const year = Number(key);
    entries.push([year, nonEmptyString(source[key], path)]);
    years.add(year);
  }
  return { map: sealedMap(entries), years };
}

function parseSlotGlossary(value: unknown): ReadonlyMap<string, LoadedI18nSlot> {
  const source = asRecord(value, "slots");
  const out: (readonly [string, LoadedI18nSlot])[] = [];
  for (const key of Object.keys(source).sort(compareCodeUnits)) {
    const path = `slots.${key}`;
    if (!SLOT_NAME_RE.test(key)) {
      throw new LoaderError("BAD_PATTERN", path, `'${key}' is not a lowerCamel slot identifier`);
    }
    const entry = asRecord(source[key], path);
    assertKnownKeys(entry, ["kind", "desc"], path);
    const kind = nonEmptyString(getRequired(entry, "kind", path), `${path}.kind`);
    if (!SLOT_KINDS.includes(kind as I18nSlotKind)) {
      throw new LoaderError("BAD_ENUM", `${path}.kind`, `'${kind}' is not a slot kind [${SLOT_KINDS.join(", ")}]`);
    }
    const descRaw = getOptional(entry, "desc");
    out.push([
      key,
      Object.freeze({
        kind: kind as I18nSlotKind,
        desc: descRaw === undefined || descRaw === null ? null : nonEmptyString(descRaw, `${path}.desc`),
      }),
    ]);
  }
  if (out.length === 0) {
    throw new LoaderError("OUT_OF_RANGE", "slots", "the slot glossary is empty — templates reference {slots} by name");
  }
  return sealedMap(out);
}

function parseProvenance(
  value: unknown,
  templateKeys: ReadonlySet<string>,
): ReadonlyMap<string, string | null> {
  const source = asRecord(value, "_provenance");
  const keys = Object.keys(source).sort(compareCodeUnits);
  if (keys.length === 0) {
    throw new LoaderError("MISSING_FIELD", "_provenance", "no provenance entries — every template must carry a cite (or null + _provenance._todo)");
  }
  const entries: (readonly [string, string | null])[] = [];
  for (const key of keys) {
    const path = `_provenance.${key}`;
    if (key !== "_todo" && !templateKeys.has(key)) {
      throw new LoaderError("UNKNOWN_FIELD", path, `provenance entry with no matching template key '${key}'`);
    }
    const raw = source[key];
    entries.push([key, raw === null ? null : nonEmptyString(raw, path)]);
  }
  for (const key of [...templateKeys].sort(compareCodeUnits)) {
    if (!Object.prototype.hasOwnProperty.call(source, key)) {
      throw new LoaderError("MISSING_FIELD", `_provenance.${key}`, `no provenance entry for template key '${key}'`);
    }
  }
  return sealedMap(entries);
}

/* ═════════════════════ the boundary parse ═════════════════════ */

const PACK_TOP_LEVEL_KEYS: readonly string[] = [
  "schemaVersion",
  "packId",
  "appliesTo",
  "locale",
  "note",
  "eraCodes",
  "slots",
  "decision",
  "flavour",
  "_provenance",
  "_todo",
];

/**
 * THE boundary parse (Law 2). Input: JSON-parsed pack wire value
 * (packages/content/packs/*.i18n.json shape). Output: frozen LoadedI18nPack
 * with the §9.3 root wall enforced, globally unique keys, era objects reduced
 * to {eras ascending, fallback} sharing one slot set. Throws LoaderError
 * (existing code + dotted path) on any missing / unknown / mistyped /
 * wall-crossing field.
 */
export function loadI18nPack(raw: unknown): LoadedI18nPack {
  const source = asRecord(raw, "");
  assertKnownKeys(source, PACK_TOP_LEVEL_KEYS, "");

  const version = getRequired(source, "schemaVersion", "");
  if (version !== 1) {
    throw new LoaderError("BAD_ENUM", "schemaVersion", `only i18n pack schemaVersion 1 is consumed (got ${JSON.stringify(version)})`);
  }

  const packId = patternLeaf(PACK_ID_RE, "the pack id pattern (schema/i18n-pack.schema.json)")(
    getRequired(source, "packId", ""),
    "packId",
  );
  const appliesTo = patternLeaf(APPLIES_TO_RE, "the namespaced bundle id pattern (schema/i18n-pack.schema.json)")(
    getRequired(source, "appliesTo", ""),
    "appliesTo",
  );
  const locale = patternLeaf(LOCALE_RE, "the BCP-47-lite locale pattern (schema/i18n-pack.schema.json)")(
    getRequired(source, "locale", ""),
    "locale",
  );
  const noteRaw = getOptional(source, "note");
  const note = noteRaw === undefined ? null : nonEmptyString(noteRaw, "note");

  const eraCodesRaw = getOptional(source, "eraCodes");
  const eraCodes = eraCodesRaw === undefined ? parseEraCodes({}) : parseEraCodes(eraCodesRaw);

  const slots = parseSlotGlossary(getRequired(source, "slots", ""));

  // Shared `seen` set carries the global-uniqueness assertion across the wall.
  const templateKeys = new Set<string>();
  const decisionMap = parseNamespace("decision", getRequired(source, "decision", ""), DECISION_ROOTS, eraCodes.years, templateKeys);
  const flavourMap = parseNamespace("flavour", getRequired(source, "flavour", ""), FLAVOUR_ROOTS, eraCodes.years, templateKeys);

  const provenance = parseProvenance(getRequired(source, "_provenance", ""), templateKeys);
  const todoRaw = getOptional(source, "_todo");
  const todo = todoRaw === undefined ? null : nonEmptyString(todoRaw, "_todo");

  return deepFreeze({
    schemaVersion: 1,
    packId,
    appliesTo,
    locale,
    note,
    eraCodes: eraCodes.map,
    slots,
    decision: sealedMap([...decisionMap.entries()]),
    flavour: sealedMap([...flavourMap.entries()]),
    provenance,
    todo,
  } satisfies LoadedI18nPack);
}

/* ═════════════════════ resolution + filling ═════════════════════ */

/** Look a template up by its globally-unique key (both namespaces searched;
 *  parse-time uniqueness makes the answer unambiguous). Miss fails loud
 *  naming the key and the pack. */
export function resolveTemplate(pack: LoadedI18nPack, key: string): I18nTemplate {
  const found = pack.decision.get(key) ?? pack.flavour.get(key);
  if (found === undefined) {
    throw new LoaderError(
      "MISSING_FIELD",
      key,
      `no template '${key}' in pack '${pack.packId}' (searched decision [${pack.decision.size} keys] + flavour [${pack.flavour.size} keys])`,
    );
  }
  return found;
}

/** Era selection on plain-number years ONLY (no Date, no Intl):
 *  exact-year entry > nearest EARLIER year > fallback. A later era's copy
 *  never leaks into the past; before the first declared era the fallback
 *  speaks. Plain templates return their body (eraYear inert). */
export function pickEraText(pack: LoadedI18nPack, key: string, eraYear: number): string {
  if (!Number.isSafeInteger(eraYear)) {
    throw new LoaderError("NOT_A_SAFE_INTEGER", key, `era year ${eraYear} is not a plain integer year`);
  }
  const template = resolveTemplate(pack, key);
  if (template.kind === "plain") return template.body;

  let best: number | null = null;
  for (const year of template.eras.keys()) {
    if (year === eraYear) return template.eras.get(year) ?? template.fallback; // exact hit, first look
    if (year < eraYear) best = year;
  }
  return best === null ? template.fallback : (template.eras.get(best) ?? template.fallback);
}

/** Fill a PLAIN template by key. Era-variant keys fail loud pointing at the
 *  two-step composition (pickEraText → fillTemplateBody) — fillTemplate
 *  never guesses an era silently (Law 4: no patched-over states). */
export function fillTemplate(
  pack: LoadedI18nPack,
  key: string,
  slots: Readonly<Record<string, string | number>>,
): string {
  const template = resolveTemplate(pack, key);
  if (template.kind === "era-variant") {
    throw new LoaderError(
      "WRONG_TYPE",
      key,
      `'${key}' is an era-variant template — choose the era body with pickEraText(pack, '${key}', eraYear), then fill it with fillTemplateBody(body, slots); fillTemplate never guesses an era`,
    );
  }
  return fillTemplateBody(template.body, slots, key);
}

/** Deterministic literal slot substitution over any (already slot-syntax
 *  validated) body. Exact-set law: EVERY {slot} the body names must be
 *  provided (missing → MISSING_FIELD listing them, sorted) and NOTHING else
 *  (extra → UNKNOWN_FIELD listing them, sorted). Substitution is single-pass
 *  left-to-right: a substituted value containing braces stays inert — slot
 *  syntax never expands recursively. */
export function fillTemplateBody(
  body: string,
  slots: Readonly<Record<string, string | number>>,
  where: string = "body",
): string {
  const required = parseSlotSyntax(body, where);
  const providedNames = Object.keys(slots).sort(compareCodeUnits);
  for (const name of providedNames) {
    if (!SLOT_NAME_RE.test(name)) {
      throw new LoaderError("BAD_PATTERN", `${where}.${name}`, `'${name}' is not a slot identifier`);
    }
  }
  const missing = required.filter((name) => !Object.prototype.hasOwnProperty.call(slots, name));
  if (missing.length > 0) {
    throw new LoaderError("MISSING_FIELD", where, `slots [${missing.join(", ")}] are required but were not provided`);
  }
  const extra = providedNames.filter((name) => !required.includes(name));
  if (extra.length > 0) {
    throw new LoaderError("UNKNOWN_FIELD", where, `slots [${extra.join(", ")}] are not used by this template — exact-set fill takes no extras`);
  }
  const rendered = new Map<string, string>();
  for (const name of required) {
    const value = slots[name];
    if (typeof value === "string") {
      rendered.set(name, value);
      continue;
    }
    if (typeof value === "number" && Number.isSafeInteger(value)) {
      rendered.set(name, String(value));
      continue;
    }
    throw new LoaderError("WRONG_TYPE", `${where}.${name}`, `slot value ${JSON.stringify(value)} is neither a string nor a safe integer`);
  }
  return body.replace(slotTokenRe(), (_match: string, name: string) => rendered.get(name) ?? "");
}

/** Every template key in the pack, code-unit sorted — the stable key list
 *  for content hashing / corpus diffing. */
export function stableSerializePackKeys(pack: LoadedI18nPack): string[] {
  const keys = [...pack.decision.keys(), ...pack.flavour.keys()];
  return keys.sort(compareCodeUnits);
}
