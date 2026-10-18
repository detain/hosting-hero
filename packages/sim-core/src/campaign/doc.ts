/**
 * campaign/doc.ts — the CampaignDoc wire contract (ADR-0018 program 1b).
 *
 * A campaign is an ORDERED chain of chapters; each chapter names an existing
 * ScenarioDoc by id and is played against ONE CompanyNode through the
 * settlement executor (save/settle.ts). The doc is pure authored data:
 * the state-freeze law of scenario/doc.ts rides untouched — a campaign adds
 * NOTHING to GameState/EconomyState/CompanyNode.
 *
 * Carry rules (§2.5 "carry-over thin") are declarative bounds the chain
 * executor obeys mechanically: a cash-floor bridge, cast caps, and the
 * non-negotiable scar cap (the engine's addScar law — opting out is a lie,
 * so `scarCapRide: true` is the ONLY legal value).
 *
 * `perspective` is an OPTIONAL-FORWARD slot reserved for L-CP2: present in
 * v0 wire = refused by name, never silently ignored.
 *
 * L-V2 → L-V3 (money-at-the-end): a chapter may declare its §1.6 exit kind
 * (`exitKind`). L-V2 landed this as FINAL-chapter-only; the §E commission
 * (L-V3) SUPERSEDES the position wall — a declaration is legal at any
 * position because the tour can now PLAY ON the heir (§1.6 prestige: the
 * exit is the moment, not the end). Placement is free; truth is observed:
 * endings.ts refuses a declared chapter whose simulation contradicts the
 * claim (DOC_LIE), the scenario runner pays sell-family closes, and the
 * chain spawns the paid heir — declaration validated against the engine's
 * OWN sell observation, never against a position in the list.
 *
 * Import law: ../types + ../kernel + ../save (+ scenario TYPES only).
 * The economy is NOT importable here (module law) — the CAMPAIGN_EXIT_KINDS ↔
 * VALUATION_EXIT_KINDS bridge is a literal mirror, drift-pinned by test.
 */

import type { RunSeed } from "../types.ts";
import type { CampaignRunOutcome } from "../save/index.ts";

export const CAMPAIGN_SCHEMA = "hh-campaign@1" as const;

/** MATRIX-adjacent carry bounds: staff facts ride thin, named cast capped. */
export const CARRY_STAFF_CAP = 3;
export const CARRY_CAST_CAP = 12;

const ID_SHAPE = /^[a-z0-9][a-z0-9-]*$/;
const NAME_MAX_CHARS = 120;
const MAX_CHAPTERS = 64;
const TICK_CAP_CEILING = 1_000_000;

/**
 * THE §1.6 EXIT VOCABULARY (money-at-the-end 2/3, L-V2). The seven exit
 * types of hg:4500 "Exit types, each with a different meta-currency profile
 * and epilogue", slugified from the doc's OWN words (verified by text):
 *   ipo                    — hg:4501 "IPO — most currency"
 *   strategic-acquisition  — hg:4503 "Strategic acquisition (a bigger host buys you for your customers)"
 *   pe-platform            — hg:4505 "PE platform acquisition (they buy you as a platform to roll up others)"
 *   pe-bolt-on             — hg:4507 "PE bolt-on (absorbed into an existing platform)"
 *   asset-sale             — hg:4509 "Asset sale (they buy the book, not the company)"
 *   management-buyout      — hg:4510 "Management buyout / employee ownership" — the doc's
 *                              words are "Management buyout"; the acronym "mbo" appears
 *                              NOWHERE in the doc, so the slug follows the doc.
 *   wind-down              — hg:4512 "Wind-down — sell the book, sell the hardware…"
 *
 * The slugs and their ORDER are byte-identical to `VALUATION_EXIT_KINDS`
 * (economy/valuation.ts, money-at-the-end 1/3) — the declaration feeds that
 * leaf's `exitCashSliceMicroUsd`, and two vocabularies that drift would make
 * the bridge a lie. The economy import law of THIS file forbids taking the
 * dependency, so this is a literal mirror with a machine pin: doc.test.ts
 * asserts exact array equality (order included) against the economy barrel.
 */
export const CAMPAIGN_EXIT_KINDS = Object.freeze([
  "ipo",
  "strategic-acquisition",
  "pe-platform",
  "pe-bolt-on",
  "asset-sale",
  "management-buyout",
  "wind-down",
] as const);
export type CampaignExitKind = (typeof CAMPAIGN_EXIT_KINDS)[number];

/** v0 OBSERVABILITY WALL: kinds the engine cannot yet see CLOSE. An IPO, a
 *  management buyout and a wind-down have no close mechanic — nothing in the
 *  simulation can produce their verdict — so a declaration would be authored
 *  fiction the ending could never confirm. The FOUR sale-family kinds ride
 *  because their observation IS the sell-accepted grammar (`win:sell-accepted-
 *  above:` — AC-S @c6b69a4), which endings.ts selects and runner.ts pays.
 *  Refused BY NAME, the optional-forward `perspective` precedent below. */
const CAMPAIGN_RESERVED_EXIT_KINDS: readonly CampaignExitKind[] = Object.freeze([
  "ipo",
  "management-buyout",
  "wind-down",
]);

export type CampaignErrorCode =
  | "BAD_RECORD"
  | "BAD_ID"
  | "BAD_NAME"
  | "BAD_ENUM"
  | "BAD_INT"
  | "BAD_MONEY"
  | "BAD_RANGE"
  | "EMPTY"
  | "DUPLICATE"
  | "RESERVED"
  | "BAD_REF"
  /** L-V2: an authored EXIT kind the observed close contradicts — raised by
   *  endings.ts, never by the parse wall (the parse cannot see the future;
   *  only the finished simulation can be caught lying about it). */
  | "DOC_LIE";

export class CampaignError extends Error {
  constructor(message: string) {
    super(`campaign: ${message}`);
    this.name = "CampaignError";
  }
}

function fail(code: CampaignErrorCode, path: string, detail: string): never {
  throw new CampaignError(`${code} at '${path}': ${detail}`);
}

function asRecord(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return fail("BAD_RECORD", path, "expected an object");
  }
  return value as Record<string, unknown>;
}

function takeKeys(raw: Record<string, unknown>, required: readonly string[], optional: readonly string[], path: string): void {
  for (const key of required) {
    if (!(key in raw)) fail("BAD_RECORD", path, `missing key "${key}"`);
  }
  for (const key of Object.keys(raw)) {
    if (!required.includes(key) && !optional.includes(key)) {
      fail("BAD_RECORD", path, `unknown key "${key}"`);
    }
  }
}

function asId(value: unknown, path: string): string {
  if (typeof value !== "string" || !ID_SHAPE.test(value)) {
    return fail("BAD_ID", path, `expected slug ^[a-z0-9][a-z0-9-]*$, got ${JSON.stringify(value)}`);
  }
  return value;
}

function asNonEmptyString(value: unknown, path: string, code: CampaignErrorCode): string {
  if (typeof value !== "string" || value.length === 0) return fail(code, path, "expected a non-empty string");
  return value;
}

function asName(value: unknown, path: string): string {
  const name = asNonEmptyString(value, path, "BAD_NAME");
  if (name.length > NAME_MAX_CHARS) fail("BAD_NAME", path, `name exceeds ${NAME_MAX_CHARS} chars`);
  return name;
}

function asInt(value: unknown, path: string, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value)) {
    return fail("BAD_INT", path, `expected safe integer, got ${JSON.stringify(value)}`);
  }
  if (value < min || value > max) fail("BAD_RANGE", path, `expected ${min}..${max}, got ${value}`);
  return value;
}

/** Money wire: real bigint or plain decimal string only — no float, no double. */
export function parseCampaignMoney(value: unknown, path: string): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "string" && /^-?\d+$/.test(value)) return BigInt(value);
  return fail("BAD_MONEY", path, `expected bigint or decimal string, got ${JSON.stringify(value)}`);
}

/** Cash-floor bridge law bounds (§2.5): failure is poorer, not paid. */
export interface CampaignCarryCashFloor {
  readonly thresholdMicroUsd: bigint;
  readonly bridgeMicroUsd: bigint;
}

/** Declarative carry bounds; scarCapRide is engine law and cannot be false. */
export interface CampaignCarryRules {
  readonly cashFloor: CampaignCarryCashFloor;
  readonly staffCap: number;
  readonly castCap: number;
  readonly scarCapRide: true;
}

/** One ordered chapter. `perspective` reserved for L-CP2 (present = refused).
 *  `exitKind` declares a §1.6 exit — legal at ANY position (§E supersedes
 *  L-V2's final-chapter wall): a mid-chain declaration PAID-heir-spawns when
 *  its close carries the sell-accepted grammar, and the tour plays on the
 *  heir. Truth is runtime-observed, not positional: endings.ts throws DOC_LIE
 *  for any declaring chapter whose simulation contradicts the claim. */
export interface CampaignChapterSpec {
  readonly chapterId: string;
  readonly scenarioId: string;
  readonly tickCap?: number;
  readonly exitKind?: CampaignExitKind;
}

export interface CampaignDoc {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly name: string;
  readonly chapters: readonly CampaignChapterSpec[];
  readonly carry: CampaignCarryRules;
}

/** Machine-pinned record of one played chapter (chain.ts writes these). */
export interface CampaignChapterRecord {
  readonly chapterId: string;
  readonly scenarioId: string;
  readonly runId: string;
  readonly nodeId: string;
  readonly runSeed: RunSeed;
  readonly outcome: CampaignRunOutcome;
  readonly stopReason: string;
  readonly endTick: bigint;
  readonly endMinute: number;
  readonly endDigest: string;
  readonly cashStartMicroUsd: bigint;
  readonly cashEndMicroUsd: bigint;
  readonly settledFacets: readonly string[];
  readonly bootstrapped: boolean;
  /** Sparse §1.6 declaration stamp — present ONLY when the chapter declared
   *  an exit kind (chain writes it from the spec). Digest-bearing: undeclared
   *  arcs key-absent ⇒ byte-stand by construction. */
  readonly exitKind?: CampaignExitKind;
}

function parseCashFloor(value: unknown, path: string): CampaignCarryCashFloor {
  const raw = asRecord(value, path);
  takeKeys(raw, ["thresholdMicroUsd", "bridgeMicroUsd"], [], path);
  const thresholdMicroUsd = parseCampaignMoney(raw.thresholdMicroUsd, `${path}.thresholdMicroUsd`);
  const bridgeMicroUsd = parseCampaignMoney(raw.bridgeMicroUsd, `${path}.bridgeMicroUsd`);
  if (thresholdMicroUsd < 0n) fail("BAD_RANGE", `${path}.thresholdMicroUsd`, "must be >= 0");
  if (bridgeMicroUsd < 0n) fail("BAD_RANGE", `${path}.bridgeMicroUsd`, "must be >= 0");
  if (bridgeMicroUsd >= thresholdMicroUsd) {
    fail("BAD_RANGE", `${path}.bridgeMicroUsd`, "bridge must be poorer than the floor — that is the point");
  }
  return { thresholdMicroUsd, bridgeMicroUsd };
}

function parseCarry(value: unknown, path: string): CampaignCarryRules {
  const raw = asRecord(value, path);
  takeKeys(raw, ["cashFloor", "scarCapRide"], ["staffCap", "castCap"], path);
  if (raw.scarCapRide !== true) {
    fail("BAD_ENUM", `${path}.scarCapRide`, "the scar cap is engine law (addScar retires at 3) — only true is honest");
  }
  const staffCap = raw.staffCap === undefined ? CARRY_STAFF_CAP : asInt(raw.staffCap, `${path}.staffCap`, 1, CARRY_STAFF_CAP);
  const castCap = raw.castCap === undefined ? CARRY_CAST_CAP : asInt(raw.castCap, `${path}.castCap`, 1, CARRY_CAST_CAP);
  return { cashFloor: parseCashFloor(raw.cashFloor, `${path}.cashFloor`), staffCap, castCap, scarCapRide: true };
}

/** The exit-kind wall (L-V2): closed vocabulary first, then the v0
 *  observability refusal BY NAME. Grammar before position — a broken value
 *  is broken wherever it sits; the position law is the doc loop's. */
function asExitKind(value: unknown, path: string): CampaignExitKind {
  if (typeof value !== "string" || !(CAMPAIGN_EXIT_KINDS as readonly string[]).includes(value)) {
    return fail(
      "BAD_ENUM",
      path,
      `expected one of ${CAMPAIGN_EXIT_KINDS.map((k) => `"${k}"`).join(", ")}, got ${JSON.stringify(value)}`,
    );
  }
  const kind = value as CampaignExitKind;
  if (CAMPAIGN_RESERVED_EXIT_KINDS.includes(kind)) {
    return fail("RESERVED", path, `no close mechanic observes "${kind}" in v0 — the tour may end only in a sale the engine can see`);
  }
  return kind;
}

function parseChapter(value: unknown, path: string): CampaignChapterSpec {
  const raw = asRecord(value, path);
  takeKeys(raw, ["chapterId", "scenarioId"], ["tickCap", "perspective", "exitKind"], path);
  if ("perspective" in raw) {
    fail("RESERVED", `${path}.perspective`, "optional-forward slot for L-CP2; absent-only until that lane lands");
  }
  const chapterId = asId(raw.chapterId, `${path}.chapterId`);
  const scenarioId = asNonEmptyString(raw.scenarioId, `${path}.scenarioId`, "BAD_REF");
  if (raw.tickCap === undefined && raw.exitKind === undefined) return { chapterId, scenarioId };
  return {
    chapterId,
    scenarioId,
    ...(raw.tickCap === undefined ? {} : { tickCap: asInt(raw.tickCap, `${path}.tickCap`, 1, TICK_CAP_CEILING) }),
    ...(raw.exitKind === undefined ? {} : { exitKind: asExitKind(raw.exitKind, `${path}.exitKind`) }),
  };
}

/** Strict boundary parse: closed vocab, exact keys, unique chapter ids, frozen. */
export function parseCampaignDoc(value: unknown, where = "campaign"): CampaignDoc {
  const raw = asRecord(value, where);
  takeKeys(raw, ["schema", "id", "name", "chapters", "carry"], [], where);
  if (raw.schema !== CAMPAIGN_SCHEMA) {
    fail("BAD_ENUM", `${where}.schema`, `expected "${CAMPAIGN_SCHEMA}", got ${JSON.stringify(raw.schema)}`);
  }
  if (!Array.isArray(raw.chapters) || raw.chapters.length === 0) {
    return fail("EMPTY", `${where}.chapters`, "a campaign needs at least one chapter");
  }
  if (raw.chapters.length > MAX_CHAPTERS) fail("BAD_RANGE", `${where}.chapters`, `at most ${MAX_CHAPTERS} chapters`);
  const seen = new Set<string>();
  const chapters = raw.chapters.map((row, i) => {
    const ch = parseChapter(row, `${where}.chapters[${i}]`);
    if (seen.has(ch.chapterId)) fail("DUPLICATE", `${where}.chapters[${i}].chapterId`, `"${ch.chapterId}" already used`);
    seen.add(ch.chapterId);
    // POSITION LAW SUPERSEDED (§E, L-V3): L-V2 refused non-final declarations
    // ("the tour ends where the company does"). §E's CAMPAIGN_EXIT arc proves
    // that premise false — the tour PLAYS ON the heir, so a mid-chain exit is
    // the flagship use. Grammar (enum + RESERVED trio) still passes inside
    // parseChapter BEFORE anything else; placement is now free and the real
    // guard is runtime truth: endings.ts DOC_LIE per declaring chapter.
    return ch;
  });
  const doc: CampaignDoc = {
    schemaVersion: 1,
    id: asId(raw.id, `${where}.id`),
    name: asName(raw.name, `${where}.name`),
    chapters,
    carry: parseCarry(raw.carry, `${where}.carry`),
  };
  return Object.freeze({ ...doc, chapters: Object.freeze([...chapters]) });
}

/** Pure wire projection (round-trips through parseCampaignDoc). Sparse keys
 *  round-trip SPARSE: an undeclared chapter emits NO `exitKind` key (and no
 *  `tickCap` key), per the :227 conditional-spread discipline. */
export function toCampaignWire(doc: CampaignDoc): Record<string, unknown> {
  return {
    schema: CAMPAIGN_SCHEMA,
    id: doc.id,
    name: doc.name,
    chapters: doc.chapters.map((ch) => ({
      chapterId: ch.chapterId,
      scenarioId: ch.scenarioId,
      ...(ch.tickCap === undefined ? {} : { tickCap: ch.tickCap }),
      ...(ch.exitKind === undefined ? {} : { exitKind: ch.exitKind }),
    })),
    carry: {
      cashFloor: { thresholdMicroUsd: doc.carry.cashFloor.thresholdMicroUsd, bridgeMicroUsd: doc.carry.cashFloor.bridgeMicroUsd },
      staffCap: doc.carry.staffCap,
      castCap: doc.carry.castCap,
      scarCapRide: true,
    },
  };
}
