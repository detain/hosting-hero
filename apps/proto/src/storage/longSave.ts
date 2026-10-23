/**
 * storage/longSave — the engine's canonical LONG SAVE codec, wrapped for the
 * browser's campaign slots.
 *
 * THE serialize/restore authority is the engine's own text pair from
 * @hh/sim-core/save (`serializeLongSave` / `parseLongSave`, envelope.ts): a
 * LongSaveDoc (SaveFile envelope carrying the LINEAGE GRAPH — the carried
 * company itself — plus the run refs) round-trips through canonical JSON
 * with bigints revived. This module NEVER hand-rolls a codec; it adds only
 * the campaign-facing strictness the engine deliberately leaves open: the
 * SaveStorePort trio (commitAtomicWrite/readSave) is filesystem-shaped
 * (tmp + rename), so browser slots store the canonical TEXT directly — and
 * `replayBundle` is an OPAQUE passthrough to the engine (canonical-JSON
 * validated, no field law), so a campaign slot's marks are strict-parsed
 * HERE, at the boundary, to fail loud on a forged or truncated slot rather
 * than resurrect a phantom roster.
 *
 * CampaignRunMark — one per played chapter, stored in the ref's opaque
 * replayBundle — records WHICH ARC the chapter belonged to (the engine's
 * runId already embeds it; the mark makes it typed data for the UI), the
 * career node the chapter ran on, the arc's terminal node (finalNodeId is
 * arc-wide law — it only becomes truthworthy after the run), the outcome,
 * and the stopReason (the REAL terminal line — objective-fold verdict
 * verbatim). The LAST mark of an arc additionally carries the ending
 * snapshot: `endCampaign` consumes the CampaignReport and the report is
 * deliberately NOT persisted, so a reloaded slot surfaces WHICH ENDING
 * HAPPENED (obituary or handoff) from the engine-authored snapshot stored
 * at settle time — never re-forged here.
 */
import { ENDING_KINDS } from "@hh/sim-core/campaign";
import type { CampaignChapterOutcome } from "@hh/sim-core/campaign";
import type { LineageGraph, LongSaveRunRef } from "@hh/sim-core/save";
import {
  composeLongSave,
  digestLongSave,
  newSaveFile,
  parseLongSave,
  serializeLongSave,
} from "@hh/sim-core/save";
import type { SimTick } from "@hh/sim-core/types";

/** Run outcomes the campaign chain emits (save/settle CAMPAIGN_RUN_OUTCOMES,
 *  re-declared as the parse wall for marks — closed vocab, fail loud). */
const RUN_OUTCOMES = Object.freeze(["won", "lost", "timeout"] as const);
export type CampaignRunOutcome = (typeof RUN_OUTCOMES)[number];

/** What a slot shows as "which ending happened" without the live report. */
export interface CampaignEndingSnapshot {
  readonly kind: string;
  readonly title: string;
  readonly epitaph: string;
  readonly deathStopReason: string | null;
  readonly medals: number;
  readonly scars: number;
  readonly reputationBps?: number;
  readonly chapterOutcomes: readonly CampaignChapterOutcome[];
}

/** One played chapter, opaque-embedded in the LongSave run ref. The mark is
 *  SELF-DESCRIBING (runId + committedAtTick ride inside it) so a reloaded
 *  slot re-serializes the identical canonical doc without the live report. */
export interface CampaignRunMark {
  readonly runId: string;
  readonly committedAtTick: SimTick;
  readonly arcId: string;
  readonly chapterId: string;
  readonly nodeId: string;
  readonly finalNodeId: string;
  readonly outcome: CampaignRunOutcome;
  readonly stopReason: string;
  readonly ending?: CampaignEndingSnapshot;
}

/** A campaign slot read back: the carried graph + its typed marks. */
export interface CampaignSave {
  readonly graph: LineageGraph;
  readonly marks: readonly CampaignRunMark[];
}

export class CampaignSaveError extends Error {
  constructor(code: string, detail: string) {
    super(`campaign-save[${code}]: ${detail}`);
    this.name = "CampaignSaveError";
  }
}

function asString(value: unknown, where: string): string {
  if (typeof value !== "string") {
    throw new CampaignSaveError("bad-mark", `${where}: expected string, got ${typeof value}`);
  }
  return value;
}

function asNumber(value: unknown, where: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new CampaignSaveError("bad-mark", `${where}: expected finite number, got ${String(value)}`);
  }
  return value;
}

function asOutcome(value: unknown, where: string): CampaignRunOutcome {
  const text = asString(value, where);
  if (!(RUN_OUTCOMES as readonly string[]).includes(text)) {
    throw new CampaignSaveError("bad-mark", `${where}: outcome "${text}" off-vocab ${RUN_OUTCOMES.join("|")}`);
  }
  return text as CampaignRunOutcome;
}

/** Strict key-set wall: every key the mark shape allows, nothing else. */
function requireKeys(obj: Record<string, unknown>, allowed: readonly string[], where: string): void {
  for (const key of Object.keys(obj)) {
    if (!allowed.includes(key)) {
      throw new CampaignSaveError("bad-mark", `${where}: unknown key "${key}"`);
    }
  }
}

function parseChapterOutcome(raw: unknown, where: string): CampaignChapterOutcome {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new CampaignSaveError("bad-ending", `${where}: expected object`);
  }
  const obj = raw as Record<string, unknown>;
  requireKeys(obj, ["chapterId", "outcome", "stopReason"], where);
  return {
    chapterId: asString(obj.chapterId, `${where}.chapterId`),
    outcome: asOutcome(obj.outcome, `${where}.outcome`),
    stopReason: asString(obj.stopReason, `${where}.stopReason`),
  };
}

function parseEndingSnapshot(raw: unknown, where: string): CampaignEndingSnapshot {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new CampaignSaveError("bad-ending", `${where}: expected object`);
  }
  const obj = raw as Record<string, unknown>;
  requireKeys(
    obj,
    ["kind", "title", "epitaph", "deathStopReason", "medals", "scars", "reputationBps", "chapterOutcomes"],
    where,
  );
  const kind = asString(obj.kind, `${where}.kind`);
  if (!(ENDING_KINDS as readonly string[]).includes(kind)) {
    throw new CampaignSaveError("bad-ending", `${where}.kind: "${kind}" off-vocab ${ENDING_KINDS.join("|")}`);
  }
  const death = obj.deathStopReason;
  if (typeof death !== "string" && death !== null) {
    throw new CampaignSaveError("bad-ending", `${where}.deathStopReason: expected string-or-null`);
  }
  if (!Array.isArray(obj.chapterOutcomes)) {
    throw new CampaignSaveError("bad-ending", `${where}.chapterOutcomes: expected array`);
  }
  return {
    kind,
    title: asString(obj.title, `${where}.title`),
    epitaph: asString(obj.epitaph, `${where}.epitaph`),
    deathStopReason: death,
    medals: asNumber(obj.medals, `${where}.medals`),
    scars: asNumber(obj.scars, `${where}.scars`),
    ...(obj.reputationBps === undefined
      ? {}
      : { reputationBps: asNumber(obj.reputationBps, `${where}.reputationBps`) }),
    chapterOutcomes: obj.chapterOutcomes.map((row, i) =>
      parseChapterOutcome(row, `${where}.chapterOutcomes[${i}]`),
    ),
  };
}

/** Strict parse of one ref's opaque bundle into a typed mark. */
export function parseCampaignRunMark(raw: unknown, where: string): CampaignRunMark {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new CampaignSaveError("bad-mark", `${where}: expected object bundle, got ${Array.isArray(raw) ? "array" : typeof raw}`);
  }
  const obj = raw as Record<string, unknown>;
  requireKeys(
    obj,
    ["runId", "committedAtTick", "arcId", "chapterId", "nodeId", "finalNodeId", "outcome", "stopReason", "ending"],
    where,
  );
  if (typeof obj.committedAtTick !== "bigint") {
    throw new CampaignSaveError("bad-mark", `${where}.committedAtTick: expected bigint (canonical $i revival), got ${typeof obj.committedAtTick}`);
  }
  return {
    runId: asString(obj.runId, `${where}.runId`),
    committedAtTick: obj.committedAtTick,
    arcId: asString(obj.arcId, `${where}.arcId`),
    chapterId: asString(obj.chapterId, `${where}.chapterId`),
    nodeId: asString(obj.nodeId, `${where}.nodeId`),
    finalNodeId: asString(obj.finalNodeId, `${where}.finalNodeId`),
    outcome: asOutcome(obj.outcome, `${where}.outcome`),
    stopReason: asString(obj.stopReason, `${where}.stopReason`),
    ...(obj.ending === undefined ? {} : { ending: parseEndingSnapshot(obj.ending, `${where}.ending`) }),
  };
}

/** Envelope identity the slots wear (browser campaign storage — the engine
 *  checks only the file-schema integer, never these label strings). */
const SAVE_ENGINE_VERSION = "hh-proto-campaign-v0";
const SAVE_SIM_CONTRACT = "rng-v1";

function campaignEnvelope(graph: LineageGraph): ReturnType<typeof newSaveFile> {
  return { ...newSaveFile({
    saveId: "campaign",
    engineVersion: SAVE_ENGINE_VERSION,
    simContract: SAVE_SIM_CONTRACT,
    createdAtTick: 0n,
  }), lineage: graph };
}

/** Marks are the storage truth; the run refs they ride in are derived here,
 *  so a reloaded slot re-serializes byte-identically (self-describing marks). */
export function runRefsFromMarks(marks: readonly CampaignRunMark[]): readonly LongSaveRunRef[] {
  return marks.map((mark) => ({
    runId: mark.runId,
    mode: "campaign" as const,
    committedAtTick: mark.committedAtTick,
    replayBundleRef: "",
    replayBundle: mark,
  }));
}

/** Build the canonical LongSaveDoc for a carried graph + its marks. */
export function buildCampaignSave(graph: LineageGraph, marks: readonly CampaignRunMark[]): ReturnType<typeof composeLongSave> {
  return composeLongSave(campaignEnvelope(graph), runRefsFromMarks(marks));
}

/** THE serialize half: canonical engine text (parse-identical on read-back). */
export function serializeCampaignSave(graph: LineageGraph, marks: readonly CampaignRunMark[]): string {
  return serializeLongSave(buildCampaignSave(graph, marks));
}

/** THE restore half: strict text parse + strict mark parse, fail loud. */
export function restoreCampaignSave(text: string): CampaignSave {
  const doc = parseLongSave(text); // engine SaveError on malformed text
  const marks = doc.runs.map((ref, i) => {
    if (ref.mode !== "campaign") {
      throw new CampaignSaveError("bad-mark", `runs[${i}]: mode "${ref.mode}" — campaign slots carry campaign refs only`);
    }
    if (ref.replayBundle === undefined) {
      throw new CampaignSaveError("bad-mark", `runs[${i}]: replayBundle absent — slot was not written by this codec`);
    }
    return parseCampaignRunMark(ref.replayBundle, `runs[${i}].replayBundle`);
  });
  return { graph: doc.envelope.lineage, marks };
}

/** Digest of the canonical text — round-trip equality witness (no hex pins). */
export function digestCampaignSave(text: string): string {
  return digestLongSave(parseLongSave(text));
}
