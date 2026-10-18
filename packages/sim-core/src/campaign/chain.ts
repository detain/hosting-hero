/**
 * campaign/chain.ts — the ordered chapter loop (ADR-0018 program 1b).
 *
 * runCampaign plays chapters of a CampaignDoc against ONE CompanyNode in a
 * LineageGraph. The engine is NOT imported here: chapters execute through an
 * injected CampaignAuthority (the caller wraps scenario/runScenario — same
 * host-composition posture as the unattended lane). After every run the
 * chapter's facts settle through save/settle.ts — the Long Save's writer —
 * so the next chapter's carry projection sees them.
 *
 * Succession (§9.9 + §1.6, L-V3 rides both edges of the money-at-end law):
 *  - a death-by-company-dissolution stopReason with chapters remaining spawns
 *    a `failure_restart` edge with a manifest built from ledger law: kept
 *    nodes = first 3 code-unit-sorted unlocks (the 3-node law — fewer is a
 *    fail-loud refusal, not a silent truncation), carried playbook ≤ 8,
 *    cashSliceMicroUsd = null (cash NEVER crosses a failure edge).
 *  - a WON chapter whose report carries the runner-paid `exitPayout` spawns an
 *    EXIT edge (succession "exit"): the SAME 3-node law and manifest shape,
 *    but cashSliceMicroUsd = the sale's cash slice and failureOnlyUnlock is
 *    FORCED null (lineage refuses a gift on an exit edge — the heir is paid,
 *    not gifted). The exit is the MOMENT, not the end (§1.6 prestige): the
 *    remaining chapters play on the heir, and the heir's FIRST carry opening
 *    rides its paid cash — never the bridge (the exitFunded law, carry.ts).
 *    A declaring chapter that is terminal halts with the heir in the graph.
 *  - the child's FIRST chapter spends that manifest exactly once through
 *    lineage.ts's applyInheritanceManifest — the named bootstrap seam. An
 *    un-bootstrapped child starts on ZERO inherited cash (spawnChildFromParent
 *    only records); the spend is marked by a museum exhibit and a re-spend
 *    refuses by name.
 *  - any other loss/timeout simply ends the campaign where it stands.
 *
 * Seeds: each chapter rolls on asRunSeed(digest of `${chapterId}::${seed}`) —
 * the SaveFile seededOrderCache grammar (envelope.ts U4) — so chapters are
 * pairwise-divergent yet identical across twin runs.
 */

import type { EntityId, MoneyUnit, RunSeed } from "../types.ts";
import { asEntityId, asRunSeed } from "../types.ts";
import { digestCanonicalValue } from "../replay/canonical.ts";
import type {
  CompanyNode,
  InheritanceEdge,
  InheritanceManifest,
  LineageGraph,
  MuseumExhibitRecord,
  SettlementWrite,
} from "../save/index.ts";
import {
  applyInheritanceManifest,
  CAMPAIGN_RUN_OUTCOMES,
  getNode,
  parseRunInstance,
  PLAYBOOK_CARRY_CAP,
  settleRun,
  spawnChildFromParent,
} from "../save/index.ts";
import type { CampaignRunOutcome } from "../save/index.ts";
import type { ScenarioDoc, ScenarioReport, ScenarioRunConfig } from "../scenario/index.ts";
import type { CampaignChapterRecord, CampaignDoc } from "./doc.ts";
import { CampaignError } from "./doc.ts";
import { applyCarryToDoc, projectChapterCarry } from "./carry.ts";

function fail(code: string, path: string, detail: string): never {
  throw new CampaignError(`${code} at '${path}': ${detail}`);
}

/** stopReason grammar for company dissolution (scenario runner witness). */
const DEATH_SHAPE = /^lose:death-by-cause:any@/;

/** How the chain executes chapters and resolves docs — host-injected. */
export interface CampaignAuthority {
  readonly run: (doc: ScenarioDoc, seed: RunSeed, config: ScenarioRunConfig) => ScenarioReport;
  readonly docOf: (scenarioId: string) => ScenarioDoc;
}

export interface CampaignRunOptions {
  readonly graph: LineageGraph;
  readonly nodeId: EntityId;
  readonly authority: CampaignAuthority;
  readonly seedOffset?: number;
  /** Nested HOST ARM (L-V3): chapterId -> priceKey -> market rate in µ$.
   *  The campaign lane forwards the whole host catalog to the chain and the
   *  chain hands each chapter only ITS flat slice, as ScenarioRunConfig
   *  .sellMarketRates (the runner's BAD_MONEY wall remains the money-parse
   *  authority). Absent, or no entry for a chapter ⇒ that chapter's config
   *  key is OMITTED — the tour's shipped chapters byte-stand. */
  readonly sellMarketRates?: ReadonlyMap<string, ReadonlyMap<string, MoneyUnit>>;
}

export interface CampaignReport {
  readonly campaignId: string;
  readonly baseRunSeed: RunSeed;
  readonly finalNodeId: EntityId;
  readonly chapterRecords: readonly CampaignChapterRecord[];
  readonly edgesSpawned: readonly InheritanceEdge[];
  readonly finalGraph: LineageGraph;
}

/**
 * Deterministic per-chapter seed via the SaveFile U4 grammar
 * `${levelId}::${runSeed}`: digest the key, fold the 16-hex into a RunSeed.
 */
export function seedForChapter(baseSeed: RunSeed, chapterId: string): RunSeed {
  const key = `${chapterId}::${baseSeed}`;
  return asRunSeed(BigInt(`0x${digestCanonicalValue(key)}`));
}

/** True once the child's inheritance manifest has been spent (museum mark). */
export function childManifestSpent(node: CompanyNode): boolean {
  return node.museum.some((row) => row.sourceFacet === "succession" && row.sourceRef === node.id);
}

/**
 * Spend the incoming edge's manifest on the child through the named lineage
 * seam, then mark it spent with a museum exhibit (company plumbing, not a
 * mode-write — this bypasses the settlement batch by design). Re-spend and
 * founder spend both refuse by name.
 */
export function spendInheritanceOnChild(graph: LineageGraph, nodeId: EntityId): { graph: LineageGraph; node: CompanyNode } {
  const current = getNode(graph, nodeId);
  if (current.parentId === null) fail("BAD_REF", nodeId, "a founder company has no inheritance manifest to spend");
  if (childManifestSpent(current)) fail("BAD_REF", nodeId, "manifest already spent for this node — inheritance is a one-time bootstrap");
  const edge = graph.edges.find((row) => row.childId === nodeId);
  if (edge === undefined) fail("BAD_REF", nodeId, "no inheritance edge into this node — bootstrap is unreachable");
  const spent = applyInheritanceManifest(current, edge.manifest);
  const marker: MuseumExhibitRecord = {
    id: asEntityId(`bootstrap:${nodeId}`),
    sourceFacet: "succession",
    sourceRef: nodeId,
    title: `Bootstrap of ${spent.identity.name}`,
    runId: asEntityId(`bootstrap:${nodeId}`),
    runSeed: asRunSeed(0n),
    acquiredAtTick: spent.identity.foundedAtTick,
    deprecated: false,
    memorialNote: null,
  };
  const marked = spendMarkerCheck(spent, marker, nodeId);
  return {
    graph: { roots: graph.roots, nodes: new Map(graph.nodes).set(nodeId, marked), edges: graph.edges },
    node: marked,
  };
}

function spendMarkerCheck(node: CompanyNode, marker: MuseumExhibitRecord, nodeId: EntityId): CompanyNode {
  if (node.museum.some((row) => row.id === marker.id)) fail("DUPLICATE", nodeId, `bootstrap marker "${marker.id}" already catalogued`);
  return { ...node, museum: [...node.museum, marker] };
}

function assertOutcome(value: string, path: string): CampaignRunOutcome {
  if (!(CAMPAIGN_RUN_OUTCOMES as readonly string[]).includes(value)) {
    return fail("BAD_ENUM", path, `authority returned foreign outcome "${value}" — expected ${CAMPAIGN_RUN_OUTCOMES.join("|")}`);
  }
  return value as CampaignRunOutcome;
}

function magnitudeOf(outcome: CampaignRunOutcome): bigint {
  if (outcome === "won") return 65536n;
  if (outcome === "lost") return -65536n;
  return 0n;
}

interface BatchParts {
  readonly writes: SettlementWrite[];
  readonly facets: string[];
}

function chapterBatch(runId: string, chapterId: string, outcome: CampaignRunOutcome, node: CompanyNode, report: ScenarioReport, docName: string): BatchParts {
  const writes: SettlementWrite[] = [];
  const push = (facet: SettlementWrite["facet"], payload: unknown): void => {
    writes.push({ facet, payload });
  };
  push("attributionEvents", {
    effect: `campaign:chapter:${chapterId}:${outcome}`,
    magnitude: magnitudeOf(outcome),
    createdAtTick: report.endTick,
    causeEventRef: report.stopReason,
  });
  if (outcome === "won") push("finances", { ...node.finances, cashMicroUsd: report.cashEndMicroUsd });
  push("museum", {
    id: asEntityId(`chapter:${runId}`),
    sourceFacet: "scenario",
    sourceRef: report.scenarioId,
    title: docName,
    runId,
    runSeed: report.runSeed,
    acquiredAtTick: report.endTick,
    deprecated: false,
    memorialNote: outcome === "won" ? null : report.stopReason,
  });
  if (outcome === "won") push("medals", { kind: "chapter-won", levelRef: report.scenarioId, atTick: report.endTick });
  return { writes, facets: writes.map((row) => row.facet) };
}

/**
 * Manifest from ledger law. `paidCashSliceMicroUsd` (exit edges only, L-V3)
 * switches the two money/gift fields as a PAIR: the slice rides and the
 * failure-only gift is FORCED null — lineage law refuses a gift on an exit
 * edge (`succession !== "failure_restart" && failureOnlyUnlock !== null` is a
 * validation failure), and rightly so: an heir that was just PAID does not
 * also get the good datacenter handed to it.
 */
function buildSuccessionManifest(node: CompanyNode, campaignId: string, endTick: bigint, paidCashSliceMicroUsd?: MoneyUnit): InheritanceManifest {
  const distinct: string[] = [];
  for (const row of node.nodesUnlocked.map((unlock) => unlock.node).sort((a, b) => (a === b ? 0 : a < b ? -1 : 1))) {
    if (!distinct.includes(row)) distinct.push(row);
  }
  if (distinct.length < 3) {
    fail("BAD_REF", campaignId, `cannot form inheritance manifest: the 3-node law needs 3 distinct unlocked nodes, found ${distinct.length}`);
  }
  return {
    keptNodes: [asEntityId(distinct[0] as string), asEntityId(distinct[1] as string), asEntityId(distinct[2] as string)] as const as InheritanceManifest["keptNodes"],
    doctrine: node.doctrine.current ?? {
      id: asEntityId(`doctrine:unwritten:${campaignId}`),
      textRef: "doctrine:unwritten",
      adoptedAtTick: endTick,
    },
    playbook: node.playbook.filter((slot) => slot.carried).sort((a, b) => (a.runbookId === b.runbookId ? 0 : a.runbookId < b.runbookId ? -1 : 1)).slice(0, PLAYBOOK_CARRY_CAP),
    cashSliceMicroUsd: paidCashSliceMicroUsd ?? null,
    failureOnlyUnlock:
      paidCashSliceMicroUsd !== undefined
        ? null
        : distinct.length > 3 ? (asEntityId(distinct[3] as string)) : null,
    handwritingParent: node.id,
  };
}

/**
 * Play the whole campaign. Stops when chapters run out or a non-death
 * loss/timeout lands. Returns the final graph, per-chapter records, and the
 * inheritance edges it had to spawn.
 */
export function runCampaign(campaign: CampaignDoc, seed: RunSeed, options: CampaignRunOptions): CampaignReport {
  const offset = options.seedOffset ?? 0;
  const baseRunSeed = offset === 0 ? seed : asRunSeed(seed + BigInt(offset));
  let graph = options.graph;
  let nodeId = options.nodeId;
  const chapterRecords: CampaignChapterRecord[] = [];
  const edgesSpawned: InheritanceEdge[] = [];
  // Set the tick an EXIT edge is spawned; consumed by the heir's first carry
  // projection (exitFunded law, carry.ts) so the paid slice is never swamped
  // by the bridge. Death successions do NOT set it — "poorer, not paid" lives.
  let exitFunded = false;

  for (const [index, chapter] of campaign.chapters.entries()) {
    let node = getNode(graph, nodeId);
    let bootstrapped = false;
    if (node.parentId !== null && !childManifestSpent(node)) {
      const spent = spendInheritanceOnChild(graph, nodeId);
      graph = spent.graph;
      node = spent.node;
      bootstrapped = true;
    }

    const baseDoc = options.authority.docOf(chapter.scenarioId);
    const docForRun =
      index === 0
        ? baseDoc
        : applyCarryToDoc(baseDoc, projectChapterCarry(node, campaign.carry, exitFunded));
    exitFunded = false; // consumed exactly once — later chapters live on the ordinary bridge law
    const catalog = options.sellMarketRates?.get(chapter.chapterId);
    const config: ScenarioRunConfig = {
      ...(chapter.tickCap === undefined ? {} : { tickCap: chapter.tickCap }),
      // §E amendment: declaration is positional-free — ANY declaring chapter
      // forwards its kind to the runner's exit wall (BAD_ENUM there). Undeclared
      // chapters grow NO key: the {} / {tickCap} config shapes byte-stand.
      ...(chapter.exitKind === undefined ? {} : { exitDeclaration: { exitKind: chapter.exitKind } }),
      ...(catalog === undefined ? {} : { sellMarketRates: catalog }),
    };
    const runSeed = seedForChapter(baseRunSeed, chapter.chapterId);
    const report = options.authority.run(docForRun, runSeed, config);
    const outcome = assertOutcome(report.outcome, `campaign "${campaign.id}" chapter "${chapter.chapterId}"`);

    const runId = `${campaign.id}:${chapter.chapterId}:${index}`;
    const batch = chapterBatch(runId, chapter.chapterId, outcome, node, report, baseDoc.name);
    const instance = parseRunInstance({
      runId,
      mode: "campaign",
      runSeed: report.runSeed,
      startedAtTick: 0n,
      endedAtTick: report.endTick,
      outcome,
      batch: { runId, mode: "campaign", committedAtTick: report.endTick, writes: batch.writes },
    });
    graph = settleRun(graph, nodeId, instance);

    chapterRecords.push({
      chapterId: chapter.chapterId,
      scenarioId: report.scenarioId,
      runId,
      nodeId,
      runSeed: report.runSeed,
      outcome,
      stopReason: report.stopReason,
      endTick: report.endTick,
      endMinute: report.endMinute,
      endDigest: report.endDigest,
      cashStartMicroUsd: report.cashStartMicroUsd,
      cashEndMicroUsd: report.cashEndMicroUsd,
      settledFacets: batch.facets,
      bootstrapped,
      ...(chapter.exitKind === undefined ? {} : { exitKind: chapter.exitKind }),
    });

    if (outcome === "won") {
      // EXIT EDGE (L-V3): the runner PAID this close (sell-accepted grammar +
      // declaration ⇒ report.exitPayout). The tour's exit is a moment — spawn
      // the heir on the proceeds and play on. No payout ⇒ ordinary win.
      if (report.exitPayout !== undefined) {
        const manifest = buildSuccessionManifest(node, campaign.id, report.endTick, report.exitPayout.cashSliceMicroUsd);
        const spawn = spawnChildFromParent(graph, nodeId, {
          childId: `successor:${campaign.id}:${edgesSpawned.length}`,
          name: `Successor of ${node.identity.name}`,
          foundedAtTick: report.endTick,
          manifest,
          succession: "exit",
        });
        graph = spawn.graph;
        nodeId = spawn.child.id;
        edgesSpawned.push(spawn.edge);
        exitFunded = true;
      }
      continue;
    }
    const isLastChapter = index === campaign.chapters.length - 1;
    if (!isLastChapter && outcome === "lost" && DEATH_SHAPE.test(report.stopReason)) {
      const manifest = buildSuccessionManifest(node, campaign.id, report.endTick);
      const spawn = spawnChildFromParent(graph, nodeId, {
        childId: `successor:${campaign.id}:${edgesSpawned.length}`,
        name: `Successor of ${node.identity.name}`,
        foundedAtTick: report.endTick,
        manifest,
        succession: "failure_restart",
      });
      graph = spawn.graph;
      nodeId = spawn.child.id;
      edgesSpawned.push(spawn.edge);
      continue;
    }
    break;
  }

  return Object.freeze({
    campaignId: campaign.id,
    baseRunSeed,
    finalNodeId: nodeId,
    chapterRecords: Object.freeze(chapterRecords),
    edgesSpawned: Object.freeze(edgesSpawned),
    finalGraph: graph,
  });
}

/** Canonical digest over the full report (chapters, edges, final ledger). */
export function digestCampaignReport(report: CampaignReport): string {
  return digestCanonicalValue({
    campaignId: report.campaignId,
    baseRunSeed: report.baseRunSeed,
    finalNodeId: report.finalNodeId,
    chapterRecords: report.chapterRecords,
    edgesSpawned: report.edgesSpawned,
    finalGraph: {
      roots: report.finalGraph.roots,
      nodes: [...report.finalGraph.nodes.entries()],
      edges: report.finalGraph.edges,
    },
  });
}
