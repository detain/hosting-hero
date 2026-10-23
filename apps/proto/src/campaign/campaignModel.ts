/**
 * campaign/campaignModel — the PLAYABLE campaign: pure engine consumer,
 * zero invented rules.
 *
 * The roster (docs §1.6 CAMPAIGN_ROSTER, @hh/sim-core/campaign/chapters) is
 * six arcs / 35 chapters; the engine's chain runner (`runCampaign`) is
 * CHAPTER-ATOMIC — carry injection at index 0, the isLast death-break, and
 * runId indexing mean slicing a single chapter out of the chain would
 * CHANGE outcomes, so the honest play unit is the ARC: one career, run
 * through the real synchronous chain, chapter rows and the terminal line
 * (objective-fold stopReason verbatim) reported per chapter afterwards.
 *
 * Arc-to-arc THREADING (feeding arc N's heir into arc N+1) is REFUSED by an
 * engine law, not by this module: spawnChildFromParent refuses a founding
 * tick that precedes the parent's (lineage.ts:130), and the Exit arc's heir
 * is founded at x-1's payout minute — earlier than an Act-Three death's
 * founding tick. sim-core's own witnesses therefore run every arc from a
 * fresh founder; THIS panel mirrors that posture exactly: each arc opens as
 * a new career (`career:<arcId>`, founding 0n) inside the ONE carried
 * lineage graph, with the host-testimony unlock seed campaignLab.ts proves
 * legal for the campaign posture (succession manifests need >=3 distinct
 * unlocked nodes; a bare founder has zero).
 *
 * The mission asked for a per-chapter LIVE worker session. That boot is a
 * sim-core seam that does not exist: chapter docs carry synthetic traffic
 * tables and off-mainline boards outside the boot.corpus / boot.build wire
 * (shipped slices + the door's four seedable nodes only). Engine FROZEN —
 * seam refused, reported to the orchestrator. The chapter terminal here is
 * the SAME objective fold the live door drives, just synchronous (Sim Lab's
 * epilogue bench already runs this exact machinery in-browser).
 */
import { CAMPAIGN_CHAPTER_META, CAMPAIGN_ROSTER, CHAPTER_AUTHORED_DOCS } from "@hh/sim-core/campaign/chapters";
import type { CampaignChapterRecord, CampaignDoc, CampaignEnding, CampaignEndingKind } from "@hh/sim-core/campaign";
import { ENDING_KINDS, endCampaign, runCampaign } from "@hh/sim-core/campaign";
import type { CampaignAuthority, CampaignReport } from "@hh/sim-core/campaign";
import type { LineageGraph, MuseumExhibitRecord, Succession } from "@hh/sim-core/save";
import { emptyLineageGraph, foundCompany, getNode, parseRunInstance, settleRun } from "@hh/sim-core/save";
import { runScenario, shippedScenario } from "@hh/sim-core/scenario";
import type { EntityId, MoneyUnit, RunSeed } from "@hh/sim-core/types";
import { asEntityId, asMoney, asRunSeed } from "@hh/sim-core/types";
import { digestCampaignSave, restoreCampaignSave, serializeCampaignSave } from "../storage/longSave";
import type { CampaignEndingSnapshot, CampaignRunMark } from "../storage/longSave";
import { arcsFromMarks } from "../storage/saveSlots";

/** The App-owned rail id (never collides with a "G<n>" gateId or the other
 *  product views' ids). */
export const CAMPAIGN_ID = "campaign";

export class CampaignModelError extends Error {
  constructor(code: string, detail: string) {
    super(`campaign-play[${code}]: ${detail}`);
    this.name = "CampaignModelError";
  }
}

/* ─────────────────────────── roster view data ─────────────────────────── */

export interface CampaignChapterView {
  readonly chapterId: string;
  readonly scenarioId: string;
  readonly archetype: string;
  readonly tier: string;
}

export interface CampaignArcView {
  readonly id: string;
  readonly name: string;
  readonly chapters: readonly CampaignChapterView[];
}

/** Six arcs, roster order — the picker's authority. Chapter meta rides the
 *  engine's merged CAMPAIGN_CHAPTER_META map (archetype + tier for display);
 *  a chapter the map omits renders honest em-dashes, never a guess. */
export const CAMPAIGN_ARCS: readonly CampaignArcView[] = Object.freeze(
  CAMPAIGN_ROSTER.map((arc) => Object.freeze({
    id: arc.id,
    name: arc.name,
    chapters: Object.freeze(
      arc.chapters.map((ch) => Object.freeze({
        chapterId: ch.chapterId,
        scenarioId: ch.scenarioId,
        archetype: CAMPAIGN_CHAPTER_META[ch.chapterId]?.archetype ?? "—",
        tier: String(CAMPAIGN_CHAPTER_META[ch.chapterId]?.tier ?? "—"),
      })),
    ),
  })),
);

/** Roster arc ids, in order — the sequential-play law's spine. */
export const ROSTER_ARC_IDS: readonly string[] = Object.freeze(CAMPAIGN_ARCS.map((a) => a.id));

/* ────────────────────────── engine recipe (campaignLab law) ────────────────────────── */

/** The seeded career base — campaignLab's BASE_SEED, same law. */
const BASE_SEED: RunSeed = asRunSeed(904n);

/** Host testimony: the unlock facts a founder "already knows". campaignLab's
 *  UNLOCK_TESTIMONY verbatim — succession's buildSuccessionManifest demands
 *  >=3 DISTINCT nodesUnlocked and a bare founder carries zero. */
const UNLOCK_TESTIMONY: readonly string[] = Object.freeze(["waf-tier", "rack-b", "cdn-edge", "rack-a"]);

/** The Exit arc's market catalog — campaignLab's EXIT_RATES verbatim (x-1's
 *  authored sale prices). Keyed by chapterId inside runCampaign, so passing
 *  it to every arc is byte-stand for all other arcs' chapters. */
const EXIT_RATES: ReadonlyMap<string, ReadonlyMap<string, MoneyUnit>> = new Map([
  ["x-1-armed-close", new Map<string, MoneyUnit>([
    ["plan:long-sale", asMoney(40_000_000n)],
    ["sku:long-sale-b", asMoney(24_000_000n)],
  ])],
]);

/** docOf: authored docs first, shipped scenario corpus second; run: the real
 *  synchronous scenario engine. campaignLab's AUTHORITY, byte-for-byte. */
const AUTHORITY: CampaignAuthority = {
  docOf: (id: string) => CHAPTER_AUTHORED_DOCS[id] ?? shippedScenario(id),
  run: (doc, seed, config) => runScenario(doc, seed, config),
};

function seedTestimony(graph: LineageGraph, nodeId: EntityId, runId: string): LineageGraph {
  const writes = UNLOCK_TESTIMONY.map((node) => ({
    facet: "nodesUnlocked" as const,
    payload: { node, via: "testimony", scarRef: null, incidentRef: null, stamp: null, stampAtTick: null, handwritingOwnerStaffId: null, faded: 0 },
  }));
  return settleRun(graph, nodeId, parseRunInstance({
    runId,
    mode: "campaign",
    runSeed: 1n,
    startedAtTick: 0n,
    endedAtTick: 1n,
    outcome: "won",
    batch: { runId, mode: "campaign", committedAtTick: 1n, writes },
  }));
}

/* ───────────────────────────── play state ───────────────────────────── */

export interface CampaignChapterRow {
  readonly chapterId: string;
  readonly outcome: string;
  readonly stopReason: string;
  readonly runId: string;
}

export interface CampaignState {
  /** The carried company: lineage graph with every career's nodes, faces,
   *  scars, museum, records (Matrix-B append posture, engine-settled). */
  readonly graph: LineageGraph;
  readonly marks: readonly CampaignRunMark[];
  readonly playedArcIds: readonly string[];
  /** Engine snapshot of the most recent arc's ending (null before the
   *  first career ends); the reload-survivable "which ending happened". */
  readonly lastEnding: CampaignEndingSnapshot | null;
}

export function createCampaignState(): CampaignState {
  return { graph: emptyLineageGraph(), marks: [], playedArcIds: [], lastEnding: null };
}

/** First unplayed roster arc — the ONLY playable one (linear law, ratified
 *  branching-linear posture). null when the roster is complete. */
export function nextArcId(state: CampaignState): string | null {
  return ROSTER_ARC_IDS.find((id) => !state.playedArcIds.includes(id)) ?? null;
}

/** Why an arc's play button is disabled, or null when it is the next beat.
 *  Early-exit guards the panel renders as honest disabled states. */
export function arcLockReason(state: CampaignState, arcId: string): "played" | "locked" | null {
  if (state.playedArcIds.includes(arcId)) return "played";
  return arcId === nextArcId(state) ? null : "locked";
}

export function isRosterComplete(state: CampaignState): boolean {
  return nextArcId(state) === null;
}

function endingSnapshot(ending: CampaignEnding): CampaignEndingSnapshot {
  return {
    kind: ending.kind,
    title: ending.title,
    epitaph: ending.epitaph,
    deathStopReason: ending.evidence.deathStopReason,
    medals: ending.evidence.medals,
    scars: ending.evidence.scars,
    ...(ending.evidence.reputationBps === undefined
      ? {}
      : { reputationBps: ending.evidence.reputationBps }),
    chapterOutcomes: ending.evidence.chapterOutcomes.map((row) => ({
      chapterId: row.chapterId,
      outcome: row.outcome,
      stopReason: row.stopReason,
    })),
  };
}

export interface ArcPlayResult {
  readonly state: CampaignState;
  readonly ending: CampaignEnding;
  readonly chapters: readonly CampaignChapterRow[];
  readonly heirLines: number;
}

/** THE play step: run one career through the real chain, settle per engine
 *  law, close with the real ending readout. Synchronous (the whole roster
 *  measures ~2s); the panel yields frames around it, never fakes progress. */
export function playArc(state: CampaignState, arcId: string): ArcPlayResult {
  const reason = arcLockReason(state, arcId);
  if (reason !== null) {
    throw new CampaignModelError(reason, reason === "played" ? `arc "${arcId}" is already in the ledger` : `arc "${arcId}" is not the next beat`);
  }
  const arc = CAMPAIGN_ROSTER.find((a) => a.id === arcId);
  if (arc === undefined) {
    throw new CampaignModelError("unknown-arc", `arc "${arcId}" is off the roster`);
  }

  // A fresh career inside the ONE carried graph (sim-core's own per-arc
  // witness style — see the header for the founding-tick law).
  const careerNodeId = asEntityId(`career:${arc.id}`);
  const founded = foundCompany(state.graph, {
    id: careerNodeId,
    name: `${arc.name} (career)`,
    eraOrigin: "2026",
    foundedAtTick: 0n,
  });
  const opened = seedTestimony(founded.graph, careerNodeId, `testimony:${arc.id}`);

  const report = runCampaign(arc, BASE_SEED, {
    graph: opened,
    nodeId: careerNodeId,
    authority: AUTHORITY,
    sellMarketRates: EXIT_RATES,
  });
  const finalNode = getNode(report.finalGraph, report.finalNodeId);
  const ending = endCampaign(report, finalNode, arc);
  const snapshot = endingSnapshot(ending);

  const marks: CampaignRunMark[] = report.chapterRecords.map((rec, i) => ({
    runId: rec.runId,
    committedAtTick: rec.endTick,
    arcId: arc.id,
    chapterId: rec.chapterId,
    nodeId: rec.nodeId,
    finalNodeId: report.finalNodeId,
    outcome: rec.outcome,
    stopReason: rec.stopReason,
    ...(i === report.chapterRecords.length - 1 ? { ending: snapshot } : {}),
  }));

  return {
    state: {
      graph: report.finalGraph,
      marks: [...state.marks, ...marks],
      playedArcIds: [...state.playedArcIds, arc.id],
      lastEnding: snapshot,
    },
    ending,
    chapters: report.chapterRecords.map((rec) => ({
      chapterId: rec.chapterId,
      outcome: rec.outcome,
      stopReason: rec.stopReason,
      runId: rec.runId,
    })),
    heirLines: report.edgesSpawned.length,
  };
}

/* ───────────────────────────── epilogue ───────────────────────────── */

/** Rebuild a full CampaignEnding from a persisted snapshot — the inverse of
 *  the private `endingSnapshot` above. The slot parse wall (storage/longSave)
 *  already enforced kind-on-vocab and typed rows, so this is a trusted
 *  re-shape, not a re-validation; the guard is the fail-loud backstop for a
 *  hand-built caller. DeclaredExit keys are NEVER fabricated: a snapshot
 *  carries no declaredExitKind/exitObserved, so the rebuilt evidence honestly
 *  omits them and the epilogue card's own NO_DATA lines answer for it. */
export function endingFromSnapshot(snapshot: CampaignEndingSnapshot): CampaignEnding {
  const kind = snapshot.kind;
  if (!(ENDING_KINDS as readonly string[]).includes(kind)) {
    throw new CampaignModelError("bad-ending", `snapshot kind "${kind}" off-vocab ${ENDING_KINDS.join("|")}`);
  }
  return {
    kind: kind as CampaignEndingKind,
    title: snapshot.title,
    epitaph: snapshot.epitaph,
    evidence: {
      chapterOutcomes: snapshot.chapterOutcomes,
      medals: snapshot.medals,
      scars: snapshot.scars,
      deathStopReason: snapshot.deathStopReason,
      ...(snapshot.reputationBps === undefined ? {} : { reputationBps: snapshot.reputationBps }),
    },
  };
}

/** The plain-data carriers EpilogueCard accepts besides the ending (L-G
 *  contract): the final node's museum shelf and succession record. null
 *  before any career closed, and null (never a throw inside a render path)
 *  if a mark points at a node the carried graph does not hold — the card
 *  then rides its honest-absence lines. */
export interface EpilogueCarriers {
  readonly museum: readonly MuseumExhibitRecord[];
  readonly succession: Succession;
}

export function epilogueCarriers(state: CampaignState): EpilogueCarriers | null {
  const last = state.marks[state.marks.length - 1];
  if (last === undefined) return null;
  const node = state.graph.nodes.get(asEntityId(last.finalNodeId));
  if (node === undefined) return null;
  return { museum: node.museum, succession: node.succession };
}

/* ─────────────────────────── persistence ─────────────────────────── */

/** Canonical long-save text for the carried state (the engine codec's own
 *  serialize pair — storage/longSave wraps it). */
export function campaignSaveText(state: CampaignState): string {
  return serializeCampaignSave(state.graph, state.marks);
}

/** Digest of the canonical text — the slot-UI roundtrip equality witness. */
export function campaignSaveDigest(state: CampaignState): string {
  return digestCampaignSave(campaignSaveText(state));
}

/** Restore a carried state from canonical text. Strict: an unparseable text
 *  throws (engine SaveError / CampaignSaveError), a marks-order that is not
 *  a roster prefix throws fail-loud — a slot never silently re-picks the
 *  campaign's shape. */
export function campaignStateFromSave(text: string): CampaignState {
  const { graph, marks } = restoreCampaignSave(text);
  const playedArcIds = arcsFromMarks(marks, ROSTER_ARC_IDS);
  const lastEnding = marks.length === 0 ? undefined : marks[marks.length - 1]?.ending;
  return { graph, marks, playedArcIds, lastEnding: lastEnding ?? null };
}

/** Carried-company facts the header shows (graph reads only, zero derived
 *  metrics): careers opened, chapters settled, heirs spawned. */
export interface CampaignLedgerView {
  readonly careers: number;
  readonly chaptersPlayed: number;
  readonly rosterDone: boolean;
}

export function campaignLedger(state: CampaignState): CampaignLedgerView {
  return {
    careers: ROSTER_ARC_IDS.filter((id) => state.playedArcIds.includes(id)).length,
    chaptersPlayed: state.marks.length,
    rosterDone: isRosterComplete(state),
  };
}

/* campaign chapter records re-export for the panel's typing convenience */
export type CampaignRecord = CampaignChapterRecord;
export type CampaignFullReport = CampaignReport;
