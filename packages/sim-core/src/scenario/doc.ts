/** §1.5 scenario documents — the boundary wall (parse, don't validate).
 *
 *  A ScenarioDoc is DECLARATIVE DATA: a strict-JSON record describing one
 *  authored one-off mission (board cast, contract roster, traffic profile,
 *  win/lose objectives, limits) that drives the EXISTING engine. Nothing
 *  here executes anything — `parseScenarioDoc` turns untrusted wire JSON
 *  into a deep-frozen, fully-trusted record, and every illegal shape dies
 *  at the wall with a `scenario[CODE] at 'path': detail` error (the house
 *  grammar, versus/unlocks/unattended family).
 *
 *  Closed-vocabulary law (loader-guard precedent): an unknown objective
 *  predicate kind, an unknown billing cycle, an unknown death cause, or an
 *  unexpected key throws at PARSE time. The runner downstream never
 *  re-checks — it reads trusted fields only.
 *
 *  State-freeze law: the doc adds NOTHING to GameState. Objectives are
 *  evaluated against an output-side observation accumulated by the runner;
 *  the digest of a scenario run is the digest of the same engine run the
 *  unattended lane would produce.
 */

import type { Contract, EntityId, RunSeed, SlaTerms } from "../types.ts";
import { asEntityId, asMoney, asRunSeed } from "../types.ts";
import { FIXED_ZERO, fromInt } from "../kernel/fixed.ts";
import { MICROS_PER_MIN } from "../kernel/time.ts";
import type {
  UnattendedBoardCast,
  UnattendedEdgeSpec,
  UnattendedNodeSpec,
  UnattendedOpexDraft,
} from "../unattended/index.ts";
import { parseGuardList, type ParsedGuard } from "../unattended/index.ts";
import type { CompanyDeathCause } from "../economy/index.ts";
import { COMPANY_DEATH_CAUSES } from "../economy/index.ts";

/** Wire schema version stamped on every scenario document. */
export const SCENARIO_SCHEMA = "hh-scenario@1" as const;

/** Upper bound on the one-line mission brief (§1.5 blurb discipline). */
export const SCENARIO_BRIEF_MAX_CHARS = 280;

/** Long-weekend ceiling (§9.2 48 h) — the same cap the unattended lane
 *  warns past; here it is a hard parse wall because a scenario is a
 *  CLOSED authored mission, not an open-ended weekend. */
export const SCENARIO_MAX_MINUTES_CAP = 2880;

/** The ten legal objective predicates (§1.5 mission verbs, mapped onto
 *  observables that EXIST today — see objectives.ts for each reading). */
export const SCENARIO_PREDICATE_KINDS = Object.freeze([
  "survive-minutes",
  "cash-above",
  "cash-below",
  "churn-below",
  "churn-above",
  "invoices-settled",
  "bounces-below",
  "bounces-above",
  "no-death-cause",
  "death-by-cause",
] as const);

export type ScenarioPredicateKind = (typeof SCENARIO_PREDICATE_KINDS)[number];

/** A death predicate may name one canonical cause (OD-25(a)) or "any". */
export type ScenarioDeathCause = CompanyDeathCause | "any";

/* ─────────────────────── trusted (parsed) shapes ─────────────────────── */

/** One closed objective condition, parsed + frozen. */
export type ObjectivePredicate =
  | { readonly kind: "survive-minutes"; readonly minutes: number }
  | { readonly kind: "cash-above" | "cash-below"; readonly microUsd: bigint }
  | { readonly kind: "churn-below" | "churn-above"; readonly count: number }
  | { readonly kind: "invoices-settled"; readonly count: number }
  | { readonly kind: "bounces-below" | "bounces-above"; readonly count: number }
  | { readonly kind: "no-death-cause" | "death-by-cause"; readonly cause: ScenarioDeathCause };

/** One signed contract of the mission: the wire fields the author names
 *  plus the fully-minted Contract record the economy registers verbatim
 *  (tcv/acv/SLA minted to the proven unattended fixture shape — derived,
 *  never author-editable, until the content lane owns contract copy). */
export interface ScenarioContractSpec {
  readonly id: string;
  readonly contract: Contract;
  /** Renewal-retention matrix index for a false-autoRenew cliff. */
  readonly termMonths: number;
  /** SLA commitment bps at registration (author-visible, digest-relevant). */
  readonly commitmentBps: bigint;
}

/** Traffic: a piecewise plateau over sim-minutes. `segments` is total —
 *  the first starts at minute 0, each later one opens where its
 *  predecessor closed; rate 0 is silence (no envelope that minute).
 *  WAVE-TABLE SEAM (v0): a scenario cannot yet name a waves-corpus
 *  tableId — the ramp/storm shapes of §1.5 arrive with that seam. */
export interface ScenarioTraffic {
  readonly tableId: string;
  readonly segments: readonly { readonly fromMinute: number; readonly ratePerMin: number }[];
}

/** Everything the run is bounded by. */
export interface ScenarioLimits {
  readonly maxSimMinutes: number;
  /** Free-cash opening balance posted once at minute 0. */
  readonly initialFreeMicroUsd: bigint;
  /** Scheduled burns (payroll-like), sorted by (atMinute, memo). */
  readonly opex: readonly UnattendedOpexDraft[];
  readonly dunningEngineOwned: boolean;
  readonly handCapacity: number;
  /** Parsed catastrophe guards (CLOSED unattended vocabulary, passthrough). */
  readonly guards: readonly ParsedGuard[];
}

/** The trusted, deep-frozen scenario document. */
export interface ScenarioDoc {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly name: string;
  readonly brief: string;
  /** Verbatim §1.5 heading anchor, e.g. "§1.5 The Long Weekend / …". */
  readonly specRef: string;
  /** Informational hosting_game.md line of the heading (never load-bearing). */
  readonly specLine: number | null;
  readonly board: UnattendedBoardCast;
  readonly contracts: readonly ScenarioContractSpec[];
  readonly traffic: ScenarioTraffic;
  readonly objectives: {
    readonly win: readonly ObjectivePredicate[];
    readonly lose: readonly ObjectivePredicate[];
  };
  readonly limits: ScenarioLimits;
}

/* ─────────────────────────── the error family ─────────────────────────── */

export type ScenarioErrorCode =
  | "BAD_RECORD"
  | "BAD_VERSION"
  | "BAD_ID"
  | "BAD_NAME"
  | "BAD_BRIEF"
  | "BAD_SPEC"
  | "BAD_BOARD"
  | "BAD_CONTRACT"
  | "BAD_TRAFFIC"
  | "BAD_OBJECTIVES"
  | "BAD_PREDICATE"
  | "UNKNOWN_KIND"
  | "BAD_LIMITS"
  | "BAD_MONEY"
  | "BAD_INT"
  | "BAD_ENUM"
  | "BAD_GUARDRAIL"
  | "DUPLICATE";

export class ScenarioError extends Error {
  readonly code: ScenarioErrorCode;
  readonly path: string;

  constructor(code: ScenarioErrorCode, path: string, message: string) {
    super(`scenario[${code}] at '${path}': ${message}`);
    this.name = "ScenarioError";
    this.code = code;
    this.path = path;
  }
}

function bad(code: ScenarioErrorCode, path: string, message: string): never {
  throw new ScenarioError(code, path, message);
}

/* ─────────────────────────── wire readers ─────────────────────────── */

function asRecord(value: unknown, path: string, code: ScenarioErrorCode): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    bad(code, path, `expected an object, got ${Array.isArray(value) ? "array" : typeof value}`);
  }
  return value as Record<string, unknown>;
}

function readString(src: Record<string, unknown>, key: string, path: string, code: ScenarioErrorCode): string {
  const raw = src[key];
  if (typeof raw !== "string" || raw.length === 0) {
    bad(code, `${path}.${key}`, `expected a non-empty string, got ${typeof raw}`);
  }
  return raw;
}

function readInt(
  src: Record<string, unknown>,
  key: string,
  path: string,
  code: ScenarioErrorCode,
  min: number,
  max: number,
): number {
  const raw = src[key];
  if (typeof raw !== "number" || !Number.isSafeInteger(raw) || raw < min || raw > max) {
    bad(code, `${path}.${key}`, `expected a safe integer in [${min},${max}], got ${String(raw)}`);
  }
  return raw;
}

function optInt(
  src: Record<string, unknown>,
  key: string,
  path: string,
  code: ScenarioErrorCode,
  min: number,
  max: number,
  fallback: number,
): number {
  if (src[key] === undefined) return fallback;
  return readInt(src, key, path, code, min, max);
}

/** Money on the wire: a non-negative safe integer, or its decimal string
 *  (JSON has no bigint — the loader-boundary convention). */
export function parseMoneyWire(value: unknown, path: string, code: ScenarioErrorCode): bigint {
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || value < 0) {
      bad("BAD_MONEY", path, `expected a non-negative safe integer µ$, got ${String(value)}`);
    }
    return BigInt(value);
  }
  if (typeof value === "string" && /^\d+$/.test(value)) return BigInt(value);
  bad("BAD_MONEY", path, `expected µ$ as a non-negative integer or digit string, got ${typeof value}`);
}

function readBool(src: Record<string, unknown>, key: string, path: string, code: ScenarioErrorCode, fallback: boolean): boolean {
  const raw = src[key] ?? fallback;
  if (typeof raw !== "boolean") bad(code, `${path}.${key}`, `expected a boolean, got ${typeof raw}`);
  return raw;
}

/** Closed-enemy of unexpected keys: every field of an authored record must
 *  be known, or the document is refused (typos are bugs, not defaults). */
function requireKeys(
  src: Record<string, unknown>,
  allowed: readonly string[],
  required: readonly string[],
  path: string,
  code: ScenarioErrorCode,
): void {
  for (const key of required) {
    if (src[key] === undefined) bad(code, `${path}.${key}`, "required field is missing");
  }
  for (const key of Object.keys(src)) {
    if (!allowed.includes(key)) bad(code, `${path}.${key}`, `unknown field — legal fields: ${allowed.join(", ")}`);
  }
}

/* ─────────────────────────── section parsers ─────────────────────────── */

const NODE_FIELDS = ["id", "kind", "slots", "serviceTimeUs", "dependencyNodeId", "inspectionDepth"] as const;
const INSPECTION_DEPTHS = ["pass-through", "sample-1-in-20", "inspect", "challenge"] as const;

function parseNode(raw: unknown, path: string): UnattendedNodeSpec {
  const src = asRecord(raw, path, "BAD_BOARD");
  requireKeys(src, NODE_FIELDS, ["id", "slots", "serviceTimeUs"], path, "BAD_BOARD");
  const kind = src.kind;
  if (kind !== undefined && typeof kind !== "string") bad("BAD_BOARD", `${path}.kind`, `expected a string, got ${typeof kind}`);
  const dependencyNodeId = src.dependencyNodeId;
  if (dependencyNodeId !== undefined && dependencyNodeId !== null && typeof dependencyNodeId !== "string") {
    bad("BAD_BOARD", `${path}.dependencyNodeId`, "expected a string or null");
  }
  const inspectionDepthRaw = src.inspectionDepth ?? "inspect";
  if (typeof inspectionDepthRaw !== "string" || !(INSPECTION_DEPTHS as readonly string[]).includes(inspectionDepthRaw)) {
    bad("BAD_ENUM", `${path}.inspectionDepth`, `expected one of ${INSPECTION_DEPTHS.join(", ")}, got ${String(src.inspectionDepth)}`);
  }
  const inspectionDepth = inspectionDepthRaw as NonNullable<UnattendedNodeSpec["inspectionDepth"]>;
  const serviceTimeUs = parseMoneyWire(src.serviceTimeUs, `${path}.serviceTimeUs`, "BAD_BOARD");
  if (serviceTimeUs < 1n) bad("BAD_BOARD", `${path}.serviceTimeUs`, "service time must be ≥ 1 µs");
  return Object.freeze({
    id: readString(src, "id", path, "BAD_BOARD"),
    ...(typeof kind === "string" ? { kind } : {}),
    slots: readInt(src, "slots", path, "BAD_BOARD", 1, 1_000_000),
    serviceTimeUs,
    ...(typeof dependencyNodeId === "string" ? { dependencyNodeId } : {}),
    inspectionDepth,
  });
}

const EDGE_FIELDS = ["id", "relation", "from", "to", "slot"] as const;
const BOARD_RELATIONS = ["data", "power", "control", "trust"] as const;

function parseEdge(raw: unknown, path: string): UnattendedEdgeSpec {
  const src = asRecord(raw, path, "BAD_BOARD");
  requireKeys(src, EDGE_FIELDS, ["id", "relation", "from", "to"], path, "BAD_BOARD");
  const relation = readString(src, "relation", path, "BAD_BOARD");
  if (!(BOARD_RELATIONS as readonly string[]).includes(relation)) {
    bad("BAD_ENUM", `${path}.relation`, `expected one of ${BOARD_RELATIONS.join(", ")}, got ${relation}`);
  }
  const slot = src.slot;
  if (slot !== undefined && slot !== null && typeof slot !== "string") bad("BAD_BOARD", `${path}.slot`, "expected a string or null");
  return Object.freeze({
    id: readString(src, "id", path, "BAD_BOARD"),
    relation: relation as UnattendedEdgeSpec["relation"],
    from: readString(src, "from", path, "BAD_BOARD"),
    to: readString(src, "to", path, "BAD_BOARD"),
    ...(typeof slot === "string" ? { slot } : {}),
  });
}

function parseBoard(raw: unknown, path: string): UnattendedBoardCast {
  const src = asRecord(raw, path, "BAD_BOARD");
  requireKeys(src, ["nodes", "edges"], ["nodes"], path, "BAD_BOARD");
  if (!Array.isArray(src.nodes) || src.nodes.length === 0) bad("BAD_BOARD", `${path}.nodes`, "expected a non-empty array");
  if (src.edges !== undefined && !Array.isArray(src.edges)) bad("BAD_BOARD", `${path}.edges`, "expected an array");
  const nodes = Object.freeze((src.nodes as readonly unknown[]).map((n, i) => parseNode(n, `${path}.nodes[${i}]`)));
  const edges = Object.freeze(((src.edges ?? []) as readonly unknown[]).map((e, i) => parseEdge(e, `${path}.edges[${i}]`)));
  const seen = new Set<string>();
  for (const node of nodes) {
    if (seen.has(node.id)) bad("DUPLICATE", `${path}.nodes`, `duplicate node id "${node.id}"`);
    seen.add(node.id);
  }
  const edgeIds = new Set<string>();
  for (const edge of edges) {
    if (edgeIds.has(edge.id)) bad("DUPLICATE", `${path}.edges`, `duplicate edge id "${edge.id}"`);
    edgeIds.add(edge.id);
    if (!seen.has(edge.from) || !seen.has(edge.to)) {
      bad("BAD_BOARD", `${path}.edges`, `edge "${edge.id}" names an unknown endpoint (${edge.from} -> ${edge.to})`);
    }
  }
  for (const node of nodes) {
    if (node.dependencyNodeId !== undefined && node.dependencyNodeId !== null && !seen.has(node.dependencyNodeId)) {
      bad("BAD_BOARD", `${path}.nodes`, `node "${node.id}" depends on unknown node "${String(node.dependencyNodeId)}"`);
    }
  }
  return Object.freeze({ nodes, edges });
}

/* ── contracts ── */

const CONTRACT_FIELDS = [
  "id",
  "customer",
  "bundleId",
  "mrcMicroUsd",
  "termStartMin",
  "termEndMin",
  "termMonths",
  "billingCycle",
  "autoRenew",
  "commitmentBps",
] as const;

/** Contract's inline billing-cycle union narrowed to the three cycles the
 *  economy's billing lane actually meters (weekly/quarterly remain legal in
 *  the Contract type but unwired for authored missions until they exist). */
type ScenarioBillingCycle = Contract["billingCycle"];
const BILLING_CYCLES = Object.freeze(["hourly", "monthly", "annual"] as const);

const ID_SHAPE = /^[a-z0-9][a-z0-9-]*$/;

/** SLA mint — the proven unattended fixture shape (TEST_SLA): a full
 *  commitment with zero credits, so v0 scenarios measure churn/cash, not
 *  SLA payouts. autoRenew is the cliff lever and rides the author's word. */
function mintSla(autoRenew: boolean): SlaTerms {
  return Object.freeze({
    uptimeTarget: fromInt(1),
    responseBudgetUs: 1_000_000n,
    creditRate: FIXED_ZERO,
    creditCap: asMoney(0n),
    claimWindowUs: 60n * MICROS_PER_MIN,
    autoRenew,
    noticePeriodMin: 0,
    threeBreachExitRight: false,
  });
}

function parseContract(raw: unknown, path: string): ScenarioContractSpec {
  const src = asRecord(raw, path, "BAD_CONTRACT");
  requireKeys(src, CONTRACT_FIELDS, ["id", "mrcMicroUsd", "termEndMin", "billingCycle"], path, "BAD_CONTRACT");
  const id = readString(src, "id", path, "BAD_CONTRACT");
  if (!ID_SHAPE.test(id)) bad("BAD_CONTRACT", `${path}.id`, `"${id}" is not a [a-z0-9-] slug`);
  const customer = src.customer;
  if (customer !== undefined && typeof customer !== "string") bad("BAD_CONTRACT", `${path}.customer`, "expected a string");
  const bundleId = src.bundleId;
  if (bundleId !== undefined && (typeof bundleId !== "string" || bundleId.length === 0)) {
    bad("BAD_CONTRACT", `${path}.bundleId`, "expected a non-empty string");
  }
  const mrcMicroUsd = parseMoneyWire(src.mrcMicroUsd, `${path}.mrcMicroUsd`, "BAD_CONTRACT");
  const billingCycleRaw = readString(src, "billingCycle", path, "BAD_CONTRACT");
  if (!(BILLING_CYCLES as readonly string[]).includes(billingCycleRaw)) {
    bad("BAD_ENUM", `${path}.billingCycle`, `expected one of hourly, monthly, annual, got ${billingCycleRaw}`);
  }
  const termStartMin = optInt(src, "termStartMin", path, "BAD_CONTRACT", 0, 1_000_000, 0);
  const termEndMin = readInt(src, "termEndMin", path, "BAD_CONTRACT", 1, 1_000_000);
  if (termEndMin <= termStartMin) {
    bad("BAD_CONTRACT", `${path}.termEndMin`, `term end m${termEndMin} must be after term start m${termStartMin}`);
  }
  const termMonths = optInt(src, "termMonths", path, "BAD_CONTRACT", 1, 120, 12);
  const autoRenew = readBool(src, "autoRenew", path, "BAD_CONTRACT", false);
  const commitmentBpsRaw = src.commitmentBps;
  let commitmentBps = 9_990n;
  if (commitmentBpsRaw !== undefined) {
    const n = readInt(src, "commitmentBps", path, "BAD_CONTRACT", 0, 10_000);
    commitmentBps = BigInt(n);
  }
  const contract: Contract = Object.freeze({
    id: asEntityId(id),
    customerEntityId: asEntityId(typeof customer === "string" ? customer : `customer:${id}`),
    bundleId: typeof bundleId === "string" ? bundleId : "shared-web",
    mrcMicroUsd: asMoney(mrcMicroUsd),
    tcvMicroUsd: asMoney(mrcMicroUsd * 12n),
    acvMicroUsd: asMoney(mrcMicroUsd * 12n),
    termStartMin,
    termEndMin,
    billingCycle: billingCycleRaw as ScenarioBillingCycle,
    sla: mintSla(autoRenew),
    routingLocks: Object.freeze([]),
    shedImmunityClassId: null,
    allocations: Object.freeze([]),
  });
  return Object.freeze({ id, contract, termMonths, commitmentBps });
}

/* ── traffic ── */

function parseTraffic(raw: unknown, path: string): ScenarioTraffic {
  const src = asRecord(raw, path, "BAD_TRAFFIC");
  requireKeys(src, ["tableId", "segments"], ["tableId", "segments"], path, "BAD_TRAFFIC");
  const tableId = readString(src, "tableId", path, "BAD_TRAFFIC");
  if (!Array.isArray(src.segments) || src.segments.length === 0) bad("BAD_TRAFFIC", `${path}.segments`, "expected a non-empty array");
  const segments = (src.segments as readonly unknown[]).map((rawSegment, i) => {
    const segPath = `${path}.segments[${i}]`;
    const seg = asRecord(rawSegment, segPath, "BAD_TRAFFIC");
    requireKeys(seg, ["fromMinute", "ratePerMin"], ["fromMinute", "ratePerMin"], segPath, "BAD_TRAFFIC");
    return Object.freeze({
      fromMinute: readInt(seg, "fromMinute", segPath, "BAD_TRAFFIC", 0, 1_000_000),
      ratePerMin: readInt(seg, "ratePerMin", segPath, "BAD_TRAFFIC", 0, 32_767),
    });
  });
  if (segments[0]?.fromMinute !== 0) {
    bad("BAD_TRAFFIC", `${path}.segments`, "the first segment must start at fromMinute 0 (traffic is a total profile)");
  }
  for (let i = 1; i < segments.length; i++) {
    const prior = segments[i - 1]!;
    const here = segments[i]!;
    if (here.fromMinute <= prior.fromMinute) {
      bad("BAD_TRAFFIC", `${path}.segments`, `segment ${i} opens at m${here.fromMinute} but segment ${i - 1} already opened at m${prior.fromMinute} — fromMinute must strictly increase`);
    }
  }
  return Object.freeze({ tableId, segments: Object.freeze(segments) });
}

/* ── objectives ── */

const PREDICATE_FIELDS: Readonly<Record<ScenarioPredicateKind, readonly string[]>> = Object.freeze({
  "survive-minutes": ["kind", "minutes"],
  "cash-above": ["kind", "microUsd"],
  "cash-below": ["kind", "microUsd"],
  "churn-below": ["kind", "count"],
  "churn-above": ["kind", "count"],
  "invoices-settled": ["kind", "count"],
  "bounces-below": ["kind", "count"],
  "bounces-above": ["kind", "count"],
  "no-death-cause": ["kind", "cause"],
  "death-by-cause": ["kind", "cause"],
});

function parsePredicate(raw: unknown, path: string): ObjectivePredicate {
  const src = asRecord(raw, path, "BAD_PREDICATE");
  const kind = readString(src, "kind", path, "BAD_PREDICATE");
  if (!(SCENARIO_PREDICATE_KINDS as readonly string[]).includes(kind)) {
    bad("UNKNOWN_KIND", `${path}.kind`, `"${kind}" is not a scenario predicate — legal: ${SCENARIO_PREDICATE_KINDS.join(", ")}`);
  }
  const typedKind = kind as ScenarioPredicateKind;
  const allowed = PREDICATE_FIELDS[typedKind];
  for (const key of Object.keys(src)) {
    if (!allowed.includes(key)) bad("BAD_PREDICATE", `${path}.${key}`, `${typedKind} accepts only: ${allowed.join(", ")}`);
  }
  switch (typedKind) {
    case "survive-minutes":
      return Object.freeze({ kind: typedKind, minutes: readInt(src, "minutes", path, "BAD_PREDICATE", 1, SCENARIO_MAX_MINUTES_CAP) });
    case "cash-above":
    case "cash-below":
      return Object.freeze({ kind: typedKind, microUsd: parseMoneyWire(src.microUsd, `${path}.microUsd`, "BAD_PREDICATE") });
    case "invoices-settled":
      return Object.freeze({ kind: typedKind, count: readInt(src, "count", path, "BAD_PREDICATE", 1, 1_000_000) });
    case "churn-below":
    case "bounces-below":
      // count 0 would be "hold the line at below zero" — vacuous by
      // construction; the honest spelling of that fear is churn-above:0.
      return Object.freeze({ kind: typedKind, count: readInt(src, "count", path, "BAD_PREDICATE", 1, 1_000_000) });
    case "churn-above":
    case "bounces-above":
      return Object.freeze({ kind: typedKind, count: readInt(src, "count", path, "BAD_PREDICATE", 0, 1_000_000) });
    case "no-death-cause":
    case "death-by-cause": {
      const cause = readString(src, "cause", path, "BAD_PREDICATE");
      if (cause !== "any" && !(COMPANY_DEATH_CAUSES as readonly string[]).includes(cause)) {
        bad("BAD_ENUM", `${path}.cause`, `expected "any" or one of ${COMPANY_DEATH_CAUSES.join(", ")}, got ${cause}`);
      }
      return Object.freeze({ kind: typedKind, cause: cause as ScenarioDeathCause });
    }
  }
}

function parsePredicateList(
  raw: unknown,
  path: string,
  code: ScenarioErrorCode,
  requireOne: boolean,
): readonly ObjectivePredicate[] {
  if (!Array.isArray(raw)) bad(code, path, "expected an array of predicates");
  if (requireOne && raw.length === 0) bad(code, path, "expected at least one predicate — a mission must be completable");
  return Object.freeze((raw as readonly unknown[]).map((p, i) => parsePredicate(p, `${path}[${i}]`)));
}

function parseObjectives(raw: unknown, path: string): ScenarioDoc["objectives"] {
  const src = asRecord(raw, path, "BAD_OBJECTIVES");
  requireKeys(src, ["win", "lose"], ["win"], path, "BAD_OBJECTIVES");
  return Object.freeze({
    win: parsePredicateList(src.win, `${path}.win`, "BAD_OBJECTIVES", true),
    lose:
      src.lose === undefined || (Array.isArray(src.lose) && src.lose.length === 0)
        ? Object.freeze([] as readonly ObjectivePredicate[])
        : parsePredicateList(src.lose, `${path}.lose`, "BAD_OBJECTIVES", false),
  });
}

/* ── limits ── */

const OPEX_FIELDS = ["atMinute", "amountMicroUsd", "memo"] as const;

function parseOpex(raw: unknown, path: string): UnattendedOpexDraft {
  const src = asRecord(raw, path, "BAD_LIMITS");
  requireKeys(src, OPEX_FIELDS, ["atMinute", "amountMicroUsd", "memo"], path, "BAD_LIMITS");
  const amount = parseMoneyWire(src.amountMicroUsd, `${path}.amountMicroUsd`, "BAD_LIMITS");
  if (amount < 1n) bad("BAD_MONEY", `${path}.amountMicroUsd`, "a burn below 1 µ$ is a gift, not an expense (F6 law)");
  return Object.freeze({
    atMinute: readInt(src, "atMinute", path, "BAD_LIMITS", 1, 1_000_000),
    amountMicroUsd: amount,
    memo: readString(src, "memo", path, "BAD_LIMITS"),
  });
}

function parseLimits(raw: unknown, path: string): ScenarioLimits {
  const src = asRecord(raw, path, "BAD_LIMITS");
  requireKeys(
    src,
    ["maxSimMinutes", "initialFreeMicroUsd", "opex", "dunningEngineOwned", "handCapacity", "guardrails"],
    ["maxSimMinutes"],
    path,
    "BAD_LIMITS",
  );
  const opexRaw = src.opex ?? [];
  if (!Array.isArray(opexRaw)) bad("BAD_LIMITS", `${path}.opex`, "expected an array");
  const opex = (opexRaw as readonly unknown[]).map((draft, i) => parseOpex(draft, `${path}.opex[${i}]`));
  const seenTwin = new Set<string>();
  for (const draft of opex) {
    const twin = `${draft.atMinute}\u0000${draft.memo}`;
    if (seenTwin.has(twin)) bad("DUPLICATE", `${path}.opex`, `duplicate (atMinute,memo) m${draft.atMinute}:${draft.memo}`);
    seenTwin.add(twin);
  }
  const guardrailsRaw = src.guardrails ?? [];
  if (!Array.isArray(guardrailsRaw)) bad("BAD_LIMITS", `${path}.guardrails`, "expected an array");
  let guards: readonly ParsedGuard[];
  try {
    guards = parseGuardList(guardrailsRaw as readonly unknown[]);
  } catch (err) {
    bad("BAD_GUARDRAIL", `${path}.guardrails`, err instanceof Error ? err.message : String(err));
  }
  return Object.freeze({
    maxSimMinutes: readInt(src, "maxSimMinutes", path, "BAD_LIMITS", 1, SCENARIO_MAX_MINUTES_CAP),
    initialFreeMicroUsd: src.initialFreeMicroUsd === undefined ? 0n : parseMoneyWire(src.initialFreeMicroUsd, `${path}.initialFreeMicroUsd`, "BAD_LIMITS"),
    opex: Object.freeze(opex),
    dunningEngineOwned: readBool(src, "dunningEngineOwned", path, "BAD_LIMITS", true),
    handCapacity: optInt(src, "handCapacity", path, "BAD_LIMITS", 0, 16, 2),
    guards,
  });
}

/* ─────────────────────────── the document wall ─────────────────────────── */

const DOC_FIELDS = [
  "schema",
  "id",
  "name",
  "brief",
  "specRef",
  "specLine",
  "board",
  "contracts",
  "traffic",
  "objectives",
  "limits",
] as const;

/** Parse untrusted wire JSON into a deep-frozen ScenarioDoc. The ONLY
 *  sanctioned entry point to the type — internal code trusts the result. */
export function parseScenarioDoc(raw: unknown): ScenarioDoc {
  const path = typeof (raw as Record<string, unknown> | null)?.id === "string" ? `scenario:${(raw as { id: string }).id}` : "scenario";
  const src = asRecord(raw, path, "BAD_RECORD");
  requireKeys(src, DOC_FIELDS, ["schema", "id", "name", "brief", "specRef", "board", "contracts", "traffic", "objectives", "limits"], path, "BAD_RECORD");

  const schema = readString(src, "schema", path, "BAD_RECORD");
  if (schema !== SCENARIO_SCHEMA) bad("BAD_VERSION", `${path}.schema`, `expected "${SCENARIO_SCHEMA}", got "${schema}"`);

  const id = readString(src, "id", path, "BAD_ID");
  if (!ID_SHAPE.test(id)) bad("BAD_ID", `${path}.id`, `"${id}" is not a [a-z0-9-] slug`);

  const name = readString(src, "name", path, "BAD_NAME");
  const brief = readString(src, "brief", path, "BAD_BRIEF");
  if (brief.length > SCENARIO_BRIEF_MAX_CHARS) {
    bad("BAD_BRIEF", `${path}.brief`, `${brief.length} chars exceeds the ${SCENARIO_BRIEF_MAX_CHARS}-char mission-blurb wall`);
  }

  const specRef = readString(src, "specRef", path, "BAD_SPEC");
  if (!specRef.startsWith("§1.5")) bad("BAD_SPEC", `${path}.specRef`, `a scenario must cite its §1.5 heading, got "${specRef}"`);
  let specLine: number | null = null;
  if (src.specLine !== undefined) specLine = readInt(src, "specLine", path, "BAD_SPEC", 1, 10_000_000);

  const board = parseBoard(src.board, `${path}.board`);

  if (!Array.isArray(src.contracts)) bad("BAD_CONTRACT", `${path}.contracts`, "expected an array (empty is legal — a board-only drill)");
  const contracts = (src.contracts as readonly unknown[]).map((c, i) => parseContract(c, `${path}.contracts[${i}]`));
  const contractIds = new Set<string>();
  for (const spec of contracts) {
    if (contractIds.has(spec.id)) bad("DUPLICATE", `${path}.contracts`, `duplicate contract id "${spec.id}"`);
    contractIds.add(spec.id);
  }

  const traffic = parseTraffic(src.traffic, `${path}.traffic`);
  const objectives = parseObjectives(src.objectives, `${path}.objectives`);
  const limits = parseLimits(src.limits, `${path}.limits`);

  /* Cross-section law: burns and cliffs scheduled beyond the clock cap are
     dead authoring bugs — refuse them instead of silently never firing. */
  for (const draft of limits.opex) {
    if (draft.atMinute > limits.maxSimMinutes) {
      bad("BAD_LIMITS", `${path}.limits.opex`, `burn m${draft.atMinute} (${draft.memo}) lands after the clock stops at m${limits.maxSimMinutes}`);
    }
  }
  for (const spec of contracts) {
    /* Clock law: 43 200 biz-minutes = 420 sim-minutes ⇒ sim = biz × 7/720. */
    const cliffMinute = Math.ceil((spec.contract.termEndMin * 7) / 720);
    if (cliffMinute > limits.maxSimMinutes) {
      bad(
        "BAD_CONTRACT",
        `${path}.contracts`,
        `contract "${spec.id}" cliffs at biz-minute ${spec.contract.termEndMin} ≈ sim-minute ${cliffMinute}, past the clock cap m${limits.maxSimMinutes} — the renewal drama can never play`,
      );
    }
  }

  return Object.freeze({
    schemaVersion: 1,
    id,
    name,
    brief,
    specRef,
    specLine,
    board,
    contracts: Object.freeze(contracts),
    traffic,
    objectives,
    limits,
  });
}

/** Re-derive the RunSeed a scenario run uses: base seed plus the author-
 *  visible offset (seed policy lives with the doc, not the caller's mood). */
export function scenarioSeed(base: RunSeed, offset: number): RunSeed {
  if (!Number.isSafeInteger(offset) || offset < 0) {
    bad("BAD_INT", "scenarioSeed.offset", `expected a safe integer ≥ 0, got ${String(offset)}`);
  }
  return asRunSeed(base + BigInt(offset));
}

/** EntityId of a contract, exposed for hosts reading the report. */
export function scenarioContractId(doc: ScenarioDoc, index: number): EntityId {
  const spec = doc.contracts[index];
  if (spec === undefined) bad("BAD_INT", "scenarioContractId.index", `doc has ${doc.contracts.length} contracts, got index ${index}`);
  return spec.contract.id;
}
