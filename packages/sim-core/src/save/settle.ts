/**
 * save/settle.ts — the campaign settlement executor (ADR-0018 program 1b,
 * L-CP1 "the Long Save gets its writer").
 *
 * A finished chapter run becomes a {@link RunInstance}: a mode-frozen
 * {@link SettlementBatch} plus the run window that produced it. settleRun()
 * commits that batch onto ONE CompanyNode inside a LineageGraph, pairing the
 * standing §2.4 batch guard (guardBatch aborts-everything on any deny row or
 * empty batch — this module NEVER re-implements it) with the per-facet
 * {@link FacetApplier} registry that carries MATRIX B full-carry law: every
 * one of the 32 campaign WRITE_FACETS rows has exactly one applier, and each
 * applier re-uses node.ts's own parsers/writers (via a minimal probe node) so
 * no cap, enum, or seq law is duplicated here.
 *
 * Two laws the executor makes mechanical:
 *  - Carry-over thin (§2.5): what crosses from chapter to chapter is ledger
 *    facts appended/instanced through these facets; physical build state is
 *    NOT here because it was never in CompanyNode to begin with (state-freeze
 *    law — zero new node fields).
 *  - Root/node split: `streaksShared` lives at the SaveFile root (streaks.ts
 *    law), not on the node. settleRun REFUSES it by name and points at
 *    settleRoot(), which folds the same batch vocabulary onto SharedStreaks.
 *
 * Import law: ../types + ../kernel + this directory only.
 */

import type { RunSeed } from "../types.ts";
import { asCauseId } from "../types.ts";
import type { CauseId, EntityId } from "../types.ts";
import { fail, requireDefined } from "./errors.ts";
import { guardBatch, WRITE_FACETS, writeGuard } from "./modes.ts";
import type { SettlementBatch, SettlementWrite, WriteFacet } from "./modes.ts";
import {
  addScar,
  appendAttribution,
  newCompanyNode,
  parseCompanyNode,
} from "./node.ts";
import type {
  CompanyNode,
  CustomerBookRecord,
  HardwareBiography,
  MuseumExhibitRecord,
  NodeRecords,
  NodeUnlockRecord,
  SpineCastRecord,
  TreatmentEvent,
} from "./node.ts";
import type { LineageGraph } from "./lineage.ts";
import { advanceStreak, breakStreak, STREAK_KINDS } from "./streaks.ts";
import type { SharedStreaks, StreakKind } from "./streaks.ts";

/** Closed outcome vocabulary for a settled chapter run (scenario-runner twin). */
export const CAMPAIGN_RUN_OUTCOMES = ["won", "lost", "timeout"] as const;
export type CampaignRunOutcome = (typeof CAMPAIGN_RUN_OUTCOMES)[number];

/** One finished campaign run: identity, window, outcome, and its facts. */
export interface RunInstance {
  readonly runId: string;
  readonly mode: "campaign";
  readonly runSeed: RunSeed;
  readonly startedAtTick: bigint;
  readonly endedAtTick: bigint;
  readonly outcome: CampaignRunOutcome;
  readonly batch: SettlementBatch;
}

/**
 * Root-scope settlement row payload (§ streaks.ts): a streak event on the
 * shared ledger. `outcome: "clean"` advances, `"breach"` breaks.
 */
export interface SettleStreakWrite {
  readonly kind: StreakKind;
  readonly outcome: "clean" | "breach";
  readonly atTick: bigint;
  readonly cause: CauseId;
}

/** Applies one facet's rows; `kind` mirrors writeGuard("campaign", facet). */
export interface FacetApplier {
  readonly facet: WriteFacet;
  readonly kind: "append" | "instance";
  readonly scope: "node" | "root";
  /** Node-scope folds only; root-scope rows never reach this (settleRun refuses). */
  readonly apply: (node: CompanyNode, payload: unknown, where: string) => CompanyNode;
}

// ---------------------------------------------------------------------------
// boundary wall
// ---------------------------------------------------------------------------

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asNonEmptyString(value: unknown, what: string): string {
  if (typeof value !== "string" || value.length === 0) fail(`${what} must be a non-empty string`);
  return value;
}

function asBig(value: unknown, what: string): bigint {
  if (typeof value !== "bigint") fail(`${what} must be bigint`);
  return value;
}

function exactKeys(raw: Record<string, unknown>, keys: readonly string[], what: string): void {
  for (const key of Object.keys(raw)) {
    if (!keys.includes(key)) fail(`${what} has unknown key "${key}"`);
  }
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(raw, key)) fail(`${what} is missing key "${key}"`);
  }
}

function deepFreeze<T>(value: T): T {
  if (typeof value === "object" && value !== null) {
    for (const child of Array.isArray(value) ? value : Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

function parseWrite(value: unknown, where: string): SettlementWrite {
  if (!isPlainObject(value)) fail(`${where} must be an object`);
  exactKeys(value, ["facet", "payload"], where);
  const facet = value.facet;
  if (typeof facet !== "string" || !(WRITE_FACETS as readonly string[]).includes(facet)) {
    fail(`${where}.facet must be one of the ${WRITE_FACETS.length} WRITE_FACETS`);
  }
  if (value.payload === undefined) fail(`${where}.payload is required`);
  return { facet: facet as WriteFacet, payload: value.payload };
}

function parseBatch(value: unknown, where: string): SettlementBatch {
  if (!isPlainObject(value)) fail(`${where} must be an object`);
  exactKeys(value, ["runId", "mode", "committedAtTick", "writes"], where);
  const runId = asNonEmptyString(value.runId, `${where}.runId`);
  if (value.mode !== "campaign") fail(`${where}.mode must be "campaign" (settle is the campaign executor)`);
  const committedAtTick = asBig(value.committedAtTick, `${where}.committedAtTick`);
  if (!Array.isArray(value.writes) || value.writes.length === 0) {
    fail(`${where}.writes must be a non-empty array`);
  }
  const writes = value.writes.map((row, i) => parseWrite(row, `${where}.writes[${i}]`));
  return { runId, mode: "campaign", committedAtTick, writes };
}

/**
 * Boundary parse for a finished-run record (parse-don't-validate: everything
 * downstream of this wall is trusted and deep-frozen).
 */
export function parseRunInstance(value: unknown, where = "runInstance"): RunInstance {
  if (!isPlainObject(value)) fail(`${where} must be an object`);
  exactKeys(
    value,
    ["runId", "mode", "runSeed", "startedAtTick", "endedAtTick", "outcome", "batch"],
    where,
  );
  const runId = asNonEmptyString(value.runId, `${where}.runId`);
  if (value.mode !== "campaign") fail(`${where}.mode must be "campaign"`);
  const runSeed = asBig(value.runSeed, `${where}.runSeed`) as RunSeed;
  const startedAtTick = asBig(value.startedAtTick, `${where}.startedAtTick`);
  const endedAtTick = asBig(value.endedAtTick, `${where}.endedAtTick`);
  if (endedAtTick < startedAtTick) fail(`${where}.endedAtTick is before startedAtTick`);
  const outcome = value.outcome;
  if (typeof outcome !== "string" || !(CAMPAIGN_RUN_OUTCOMES as readonly string[]).includes(outcome)) {
    fail(`${where}.outcome must be one of ${CAMPAIGN_RUN_OUTCOMES.join("|")}`);
  }
  const batch = parseBatch(value.batch, `${where}.batch`);
  if (batch.runId !== runId) fail(`${where}.batch.runId "${batch.runId}" disagrees with runId "${runId}"`);
  if (batch.committedAtTick < startedAtTick || batch.committedAtTick > endedAtTick) {
    fail(`${where}.batch.committedAtTick is outside [startedAtTick, endedAtTick]`);
  }
  return deepFreeze({
    runId,
    mode: "campaign",
    runSeed,
    startedAtTick,
    endedAtTick,
    outcome: outcome as CampaignRunOutcome,
    batch,
  });
}

// ---------------------------------------------------------------------------
// facet appliers — every fold parses through node.ts's own law via a probe
// ---------------------------------------------------------------------------

const PROBE_BASE: CompanyNode = newCompanyNode({
  id: "settle-probe",
  parentId: null,
  name: "Settle Probe",
  eraOrigin: "2026",
  foundedAtTick: 0n,
  successionType: "found",
});

/**
 * Validate one payload by threading it through parseCompanyNode on a probe
 * node carrying ONLY this facet — zero duplicated law: every enum/cap/seq
 * guard in node.ts fires with its own message, and `where` names the facet.
 */
function probeFacet<T>(facet: Exclude<WriteFacet, "streaksShared">, raw: unknown, where: string): T {
  const parsed = parseCompanyNode({ ...PROBE_BASE, [facet]: raw }, where) as unknown as Record<string, T>;
  return requireDefined(parsed[facet], `${where} → "${facet}"`);
}

/** Row payloads for record-shaped facets are ONE record: probe as a 1-item array. */
function probeOne<T>(facet: Exclude<WriteFacet, "streaksShared">, payload: unknown, where: string): T {
  return requireDefined(probeFacet<readonly T[]>(facet, [payload], where)[0], `${where} → "${facet}"`);
}

/** Push one parsed record onto an existing readonly array field. */
function pushed<T>(node: CompanyNode, facet: string, existing: readonly T[], rec: T): CompanyNode {
  return { ...node, [facet]: [...existing, rec] } as CompanyNode;
}

function uniqueByIdentity<T>(rows: readonly T[], key: (row: T) => string, what: string): void {
  const seen = new Set<string>();
  for (const row of rows) {
    const id = key(row);
    if (seen.has(id)) fail(`${what} already contains "${id}"`);
    seen.add(id);
  }
}

function rebaseTreatmentLog(existing: readonly TreatmentEvent[], incoming: readonly TreatmentEvent[]): TreatmentEvent[] {
  if (incoming.length === 0) return [...existing];
  const lastSeq = existing.length > 0 ? (existing[existing.length - 1] as TreatmentEvent).seq : -1;
  return [...existing, ...incoming.map((ev, i) => ({ ...ev, seq: lastSeq + 1 + i }))];
}

function maxMoney(a: bigint, b: bigint): bigint {
  return a > b ? a : b;
}

const nodeAppend = (facet: Exclude<WriteFacet, "streaksShared">, list: (node: CompanyNode) => readonly unknown[]) =>
  (node: CompanyNode, payload: unknown, where: string): CompanyNode =>
    pushed(node, facet, list(node), probeOne<unknown>(facet, payload, where));

const nodeInstance = (facet: Exclude<WriteFacet, "streaksShared">) =>
  (node: CompanyNode, payload: unknown, where: string): CompanyNode =>
    ({ ...node, [facet]: probeFacet<unknown>(facet, payload, where) }) as CompanyNode;

export const FACET_APPLIERS: Readonly<Record<WriteFacet, FacetApplier>> = buildAppliers();

function applier(
  facet: WriteFacet,
  scope: FacetApplier["scope"],
  apply: FacetApplier["apply"],
): FacetApplier {
  const kind = writeGuard("campaign", facet);
  if (kind === "deny") fail(`settle: campaign mode denies "${facet}" — registry law is stale`);
  return { facet, kind, scope, apply };
}

function buildAppliers(): Readonly<Record<WriteFacet, FacetApplier>> {
  const rows: readonly FacetApplier[] = [
    // --- append facets (MATRIX B campaign) ---------------------------------
    applier("staff", "node", nodeAppend("staff", (n) => n.staff)),
    applier("alumni", "node", nodeAppend("alumni", (n) => n.alumni)),
    applier(
      "spineCast",
      "node",
      (node, payload, where) => {
        const rec = probeOne<SpineCastRecord>("spineCast", payload, where);
        const existing = node.spineCast.find((row) => row.npcKind === rec.npcKind);
        if (existing === undefined) return { ...node, spineCast: [...node.spineCast, rec] };
        const merged = {
          ...existing,
          ...rec,
          accumulatorState: { ...existing.accumulatorState, ...rec.accumulatorState },
        };
        return { ...node, spineCast: node.spineCast.map((row) => (row === existing ? merged : row)) };
      },
    ),
    applier(
      "scars",
      "node",
      (node, payload, where) => addScar(node, probeOne<Parameters<typeof addScar>[1]>("scars", payload, where)),
    ),
    applier("scarsRetired", "node", nodeAppend("scarsRetired", (n) => n.scarsRetired)),
    applier("postmortems", "node", nodeAppend("postmortems", (n) => n.postmortems)),
    applier("ghosts", "node", nodeAppend("ghosts", (n) => n.ghosts)),
    applier("deadDrives", "node", nodeAppend("deadDrives", (n) => n.deadDrives)),
    applier(
      "hardware",
      "node",
      (node, payload, where) => {
        const rec = probeOne<HardwareBiography>("hardware", payload, where);
        const existing = node.hardware.find((row) => row.id === rec.id);
        if (existing === undefined) return { ...node, hardware: [...node.hardware, rec] };
        const merged = { ...existing, ...rec, events: [...existing.events, ...rec.events] };
        return { ...node, hardware: node.hardware.map((row) => (row === existing ? merged : row)) };
      },
    ),
    applier("unlockDraftsPassed", "node", nodeAppend("unlockDraftsPassed", (n) => n.unlockDraftsPassed)),
    applier(
      "nodesUnlocked",
      "node",
      (node, payload, where) => {
        const rec = probeOne<NodeUnlockRecord>("nodesUnlocked", payload, where);
        const has = node.nodesUnlocked.some((row) => row.node === rec.node);
        return {
          ...node,
          nodesUnlocked: has
            ? node.nodesUnlocked.map((row) => (row.node === rec.node ? rec : row))
            : [...node.nodesUnlocked, rec],
        };
      },
    ),
    applier("credentials", "node", nodeAppend("credentials", (n) => n.credentials)),
    applier("medals", "node", nodeAppend("medals", (n) => n.medals)),
    applier("linesEverRun", "node", nodeAppend("linesEverRun", (n) => n.linesEverRun)),
    applier(
      "customerBooks",
      "node",
      (node, payload, where) => {
        const rec = probeOne<CustomerBookRecord>("customerBooks", payload, where);
        const existing = node.customerBooks.find((row) => row.id === rec.id);
        if (existing === undefined) {
          uniqueByIdentity([rec], (row) => row.id, where);
          return { ...node, customerBooks: [...node.customerBooks, rec] };
        }
        const merged: CustomerBookRecord = {
          ...existing,
          ...rec,
          treatmentLog: rebaseTreatmentLog(existing.treatmentLog, rec.treatmentLog),
        };
        return { ...node, customerBooks: node.customerBooks.map((row) => (row === existing ? merged : row)) };
      },
    ),
    applier(
      "attributionEvents",
      "node",
      (node, payload, where) => {
        // Payload omits seq: node.ts's appendAttribution owns seq stamping.
        if (!isPlainObject(payload) || "seq" in payload) fail(`${where} payload carries its own seq — the writer stamps it`);
        const rec = probeOne<{ effect: string; magnitude: bigint; createdAtTick: bigint; causeEventRef: string }>(
          "attributionEvents",
          { seq: node.attributionEvents.length, ...payload },
          where,
        );
        return appendAttribution(node, rec.effect, rec.magnitude, rec.createdAtTick, rec.causeEventRef);
      },
    ),
    applier(
      "records",
      "node",
      (node, payload, where) => {
        const rec = probeFacet<NodeRecords>("records", payload, where);
        const merged: NodeRecords = {
          worstOutageSeconds: Math.max(node.records.worstOutageSeconds, rec.worstOutageSeconds),
          longestPerfectStreak: Math.max(node.records.longestPerfectStreak, rec.longestPerfectStreak),
          biggestCustomerMrrMicroUsd: maxMoney(
            node.records.biggestCustomerMrrMicroUsd,
            rec.biggestCustomerMrrMicroUsd,
          ) as NodeRecords["biggestCustomerMrrMicroUsd"],
          costliestMistakeMicroUsd: maxMoney(
            node.records.costliestMistakeMicroUsd,
            rec.costliestMistakeMicroUsd,
          ) as NodeRecords["costliestMistakeMicroUsd"],
        };
        return { ...node, records: merged };
      },
    ),
    applier(
      "annualReports",
      "node",
      (node, payload, where) => {
        const rec = probeOne<{ year: number; artifactRef: string }>("annualReports", payload, where);
        if (node.annualReports.some((row) => row.year === rec.year)) {
          fail(`${where} year ${rec.year} already reported`);
        }
        return { ...node, annualReports: [...node.annualReports, rec] };
      },
    ),
    applier(
      "museum",
      "node",
      (node, payload, where) => {
        const rec = probeOne<MuseumExhibitRecord>("museum", payload, where);
        if (node.museum.some((row) => row.id === rec.id)) fail(`${where} exhibit "${rec.id}" already catalogued`);
        return { ...node, museum: [...node.museum, rec] };
      },
    ),
    // --- instance facets (MATRIX B campaign) --------------------------------
    applier("culture", "node", (node, payload, where) => ({ ...node, culture: probeFacet<bigint>("culture", payload, where) })),
    applier("habits", "node", nodeInstance("habits")),
    applier("codex", "node", nodeInstance("codex")),
    applier("reputation", "node", nodeInstance("reputation")),
    applier("creditGrade", "node", nodeInstance("creditGrade")),
    applier("theMultiple", "node", nodeInstance("theMultiple")),
    applier("finances", "node", nodeInstance("finances")),
    applier("playbook", "node", nodeInstance("playbook")),
    applier("wiki", "node", nodeInstance("wiki")),
    applier("anticipation", "node", nodeInstance("anticipation")),
    applier("researchQueue", "node", nodeInstance("researchQueue")),
    applier("constraintCards", "node", nodeInstance("constraintCards")),
    // --- root scope ----------------------------------------------------------
    applier("streaksShared", "root", (_node, _payload, where) =>
      fail(`${where}: streaksShared is the SaveFile root ledger — fold it with settleRoot()`),
    ),
  ];
  const table = new Map<WriteFacet, FacetApplier>();
  for (const row of rows) {
    if (table.has(row.facet)) fail(`settle: duplicate applier for "${row.facet}"`);
    table.set(row.facet, row);
  }
  for (const facet of WRITE_FACETS) {
    if (!table.has(facet)) fail(`settle: campaign facet "${facet}" has no applier (MATRIX B full-carry law broken)`);
  }
  if (table.size !== WRITE_FACETS.length) fail(`settle: applier roster ${table.size} ≠ ${WRITE_FACETS.length} campaign facets`);
  const obj = Object.fromEntries(table) as Record<WriteFacet, FacetApplier>;
  return Object.freeze(obj);
}

// ---------------------------------------------------------------------------
// executors
// ---------------------------------------------------------------------------

/**
 * Commit one finished campaign run onto its CompanyNode.
 *
 * Order of law: guardBatch FIRST (paired, never duplicated) so an invalid or
 * denied batch aborts with the INPUT graph untouched; then the root-scope
 * pre-scan (streaksShared rows are refused BY NAME, graph identity preserved);
 * then folds in BATCH ORDER (batch order is the determinism law); then a final
 * whole-node parse so cross-row caps (scars ≤ 3, named customers ≤ 12,
 * playbook ≤ 8) hold on the settled result, not just per row.
 */
export function settleRun(graph: LineageGraph, nodeId: EntityId, run: RunInstance): LineageGraph {
  const batch = run.batch;
  guardBatch(batch);
  if (batch.mode !== "campaign") fail(`settle: run batch mode "${batch.mode}" — settleRun is the campaign executor`);
  if (batch.runId !== run.runId) fail(`settle: batch runId "${batch.runId}" disagrees with run "${run.runId}"`);
  if (batch.committedAtTick < run.startedAtTick || batch.committedAtTick > run.endedAtTick) {
    fail("settle: batch committedAtTick outside the run window");
  }
  const current = requireDefined(graph.nodes.get(nodeId), `settle: no node "${nodeId}" in graph`);
  const rootRow = batch.writes.find((row) => FACET_APPLIERS[row.facet].scope === "root");
  if (rootRow !== undefined) {
    fail(
      `settle: batch "${batch.runId}" carries root-scope facet "${rootRow.facet}" — ` +
        `node and root ledgers are split; fold streaksShared with settleRoot()`,
    );
  }
  let node: CompanyNode = current;
  for (const [i, row] of batch.writes.entries()) {
    node = FACET_APPLIERS[row.facet].apply(node, row.payload, `settle "${row.facet}" at row ${i} of batch "${batch.runId}"`);
  }
  const settled = parseCompanyNode({ ...node, id: nodeId }, `settle final for node "${nodeId}"`);
  return { roots: graph.roots, nodes: new Map(graph.nodes).set(nodeId, settled), edges: graph.edges };
}

function parseStreakWrite(payload: unknown, where: string): SettleStreakWrite {
  if (!isPlainObject(payload)) fail(`${where} must be an object`);
  const kind = payload.kind;
  if (typeof kind !== "string" || !(STREAK_KINDS as readonly string[]).includes(kind)) {
    fail(`${where}.kind must be one of ${STREAK_KINDS.join("|")}`);
  }
  const outcome = payload.outcome;
  if (outcome !== "clean" && outcome !== "breach") fail(`${where}.outcome must be "clean" or "breach"`);
  // advanceStreak ignores time; breach must carry it. Normalize both to a stamp.
  const atTick = outcome === "clean" && payload.atTick === undefined ? 0n : asBig(payload.atTick, `${where}.atTick`);
  const cause = payload.cause === undefined ? asCauseId("settle:streaks") : asCauseId(asNonEmptyString(payload.cause, `${where}.cause`));
  return { kind: kind as StreakKind, outcome, atTick, cause };
}

/**
 * Fold a batch's streaksShared rows onto the SaveFile-root SharedStreaks
 * ledger (paired with settleRun — hosts split writes by scope).
 */
export function settleRoot(streaks: SharedStreaks, batch: SettlementBatch): SharedStreaks {
  guardBatch(batch);
  let out = streaks;
  for (const [i, row] of batch.writes.entries()) {
    const where = `settleRoot "${row.facet}" at row ${i} of batch "${batch.runId}"`;
    if (row.facet !== "streaksShared") fail(`${where}: settleRoot folds streaksShared rows only`);
    const ev = parseStreakWrite(row.payload, where);
    out = ev.outcome === "clean" ? advanceStreak(out, ev.kind) : breakStreak(out, ev.kind, ev.atTick, ev.cause);
  }
  return out;
}
