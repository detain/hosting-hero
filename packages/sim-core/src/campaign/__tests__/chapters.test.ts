/**
 * chapters.test.ts — the authored campaign content (L-CP3 + ADR-0019 program 3).
 *
 * Three halves:
 * 1. The §1.9 AUTHORING lint loop over the whole three-arc tour (archetypes
 *    non-consecutive, Endure under 30%, perspective cap + every-5 cadence,
 *    the Act II T3→T4 tier rhythm, unique ids, meta↔doc specLine agreement,
 *    hosting_game.md text anchors, the bridge-never-poorer cash-floor law
 *    with its ONE named thin-ride exception).
 * 2. The RUNTIME truth: prologue + Act I keep their probe-confirmed win-through
 *    ledgers untouched; ACT II ships the headline — the first authored chapter
 *    that DIES IN THE SHAPE, so chain.ts succession fires through a real
 *    ledger (failure_restart edge, null cash slice, one-spend bootstrap,
 *    obituary museum row) — plus the falsifier that proves the death is
 *    shape-driven: raise the bridge and the same doc wins with zero edges.
 * 3. The THREE-ARC CHAIN (prologue → Act I → testimony → Act II) on one real
 *    lineage graph, where the parent carries fifteen settled chapters and the
 *    child boots the closing beats.
 *
 * Every pinned outcome below was produced by running the chain (probes
 * 2026-10-17 / 2026-10-18) — the lane's law is probe-don't-fake, and these
 * literals are the honest witness of what the shipped corpus does under the
 * carry rules.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { asEntityId, asRunSeed } from "../../types";
import type { EntityId, RunSeed } from "../../types";
import {
  emptyLineageGraph,
  foundCompany,
  getNode,
  parseRunInstance,
  settleRun,
} from "../../save/index";
import type { LineageGraph, SettlementWrite } from "../../save/index";
import { PERSPECTIVE_IDS, runScenario, shippedScenario } from "../../scenario/index";
import type { ScenarioDoc, ScenarioRunConfig } from "../../scenario/index";
import {
  applyCarryToDoc,
  childManifestSpent,
  digestCampaignReport,
  parseCampaignDoc,
  runCampaign,
  spendInheritanceOnChild,
} from "../index";
import type { CampaignAuthority, CampaignDoc, CampaignReport } from "../index";
import {
  ACT_ONE_META,
  ACT_TWO_META,
  ACT_TWO_THIN_RIDE_EXCEPTIONS,
  CAMPAIGN_ACT_ONE,
  CAMPAIGN_ACT_TWO,
  CAMPAIGN_ARCHETYPES,
  CAMPAIGN_CHAPTER_META,
  CAMPAIGN_PROLOGUE,
  CAMPAIGN_ROSTER,
  CHAPTER_AUTHORED_DOCS,
  PROLOGUE_META,
} from "../chapters";

function resolveChapterDoc(scenarioId: string): ScenarioDoc {
  const authored = CHAPTER_AUTHORED_DOCS[scenarioId];
  return authored !== undefined ? authored : shippedScenario(scenarioId);
}

const BASE_SEED = asRunSeed(904n);

/** The unlock testimony the succession manifest needs (chain.ts 3-node law):
 *  no chapter batch ever writes nodesUnlocked, so the dying company's unlocked
 *  tech is pre-seeded as HOST ledger testimony (chain.test.ts founderGraph
 *  pattern verbatim). Four distinct ids: sorted kept-3 + the 4th becomes the
 *  failureOnlyUnlock the child earns through the obituary. */
const UNLOCK_TESTIMONY = ["waf-tier", "rack-b", "cdn-edge", "rack-a"];

function testimonyWrites(runId: string): SettlementWrite[] {
  return UNLOCK_TESTIMONY.map((node) => ({
    facet: "nodesUnlocked",
    payload: {
      node, via: "testimony", scarRef: null, incidentRef: null,
      stamp: null, stampAtTick: null, handwritingOwnerStaffId: null, faded: 0,
    },
  }));
}

function seedTestimony(graph: LineageGraph, nodeId: EntityId, runId = "pre-seed"): LineageGraph {
  return settleRun(graph, nodeId, parseRunInstance({
    runId, mode: "campaign", runSeed: 1n, startedAtTick: 0n, endedAtTick: 1n, outcome: "won",
    batch: { runId, mode: "campaign", committedAtTick: 1n, writes: testimonyWrites(runId) },
  }));
}

function founder(id = "co", name = "First Light Inc") {
  let graph = emptyLineageGraph();
  ({ graph } = foundCompany(graph, { id, name, eraOrigin: "2026", foundedAtTick: 0n }));
  return { graph, nodeId: asEntityId(id) };
}

/** The L-CP1 authority seam: authored docs first, shipped registry after.
 *  (runScenario needs NO scenarios.ts registration for the authored rows —
 *  that is the design fact this content exercises.) */
const authority: CampaignAuthority = {
  docOf: (scenarioId: string): ScenarioDoc => CHAPTER_AUTHORED_DOCS[scenarioId] ?? shippedScenario(scenarioId),
  run: (doc, seed: RunSeed, config: ScenarioRunConfig) => runScenario(doc, seed, config),
};

function run(campaign: CampaignDoc): CampaignReport {
  const { graph, nodeId } = founder();
  return runCampaign(campaign, BASE_SEED, { graph, nodeId, authority });
}

/** Act II runs on a testimony-seeded founder: b-4's death must find the 3-node
 *  minimum or chain.ts refuses the succession by law (BAD_REF). */
function runUnlocked(campaign: CampaignDoc): CampaignReport {
  const { graph, nodeId } = founder();
  return runCampaign(campaign, BASE_SEED, { graph: seedTestimony(graph, nodeId), nodeId, authority });
}

/** One shared Act-I traversal (≈2,075 engine ticks) — collected once,
 *  asserted from three angles. A campaign chapter never mutates the doc
 *  registry, so cross-test sharing is pure. */
const SHARED_ACT_ONE = run(CAMPAIGN_ACT_ONE);
/** One shared Act-II traversal (≈1,483 ticks incl. the t73 dissolution). */
const SHARED_ACT_TWO = runUnlocked(CAMPAIGN_ACT_TWO);
const CHILD_ID = "successor:act-two-process-to-prevention:0";

/** The whole-tour chapter list in play order (lint target). */
const TOUR: readonly { campaignId: string; chapterId: string }[] = CAMPAIGN_ROSTER.flatMap(
  (doc) => doc.chapters.map((c) => ({ campaignId: doc.id, chapterId: c.chapterId })),
);

/* ------------------------------------------------------------------ */
/* 1. §1.9 authoring lint loop                                          */
/* ------------------------------------------------------------------ */

describe("chapter meta — the §1.9 authoring law", () => {
  const acts: readonly [CampaignDoc, Readonly<Record<string, { archetype: string; specLine: number; perspectiveId?: string; tier?: number }>>][] = [
    [CAMPAIGN_PROLOGUE, PROLOGUE_META],
    [CAMPAIGN_ACT_ONE, ACT_ONE_META],
    [CAMPAIGN_ACT_TWO, ACT_TWO_META],
  ];

  it("every chapter id is unique across the whole content", () => {
    const ids = TOUR.map((row) => row.chapterId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("the meta ledger covers EXACTLY the chapter ids, archetypes from the closed eleven", () => {
    for (const [doc, meta] of acts) {
      expect(Object.keys(meta).sort(), doc.id).toEqual(doc.chapters.map((c) => c.chapterId).sort());
      for (const chapter of doc.chapters) {
        const row = meta[chapter.chapterId];
        expect(row, `${doc.id}/${chapter.chapterId}`).toBeDefined();
        expect((CAMPAIGN_ARCHETYPES as readonly string[]).includes(row!.archetype), chapter.chapterId).toBe(true);
      }
    }
    expect(Object.keys(CAMPAIGN_CHAPTER_META).length).toBe(TOUR.length);
  });

  it("no two consecutive chapters on the whole tour share an archetype", () => {
    // One law over the concatenated three-arc tour: per-act pairs AND the
    // p-3→a-1 / a-8→b-1 seams all ride the same loop (L-CP3 checked the
    // prologue seam by hand; Act II makes the tour a first-class object).
    for (let i = 1; i < TOUR.length; i += 1) {
      const prev = CAMPAIGN_CHAPTER_META[TOUR[i - 1]!.chapterId]!.archetype;
      const here = CAMPAIGN_CHAPTER_META[TOUR[i]!.chapterId]!.archetype;
      expect(`${TOUR[i - 1]!.chapterId} vs ${TOUR[i]!.chapterId}`, prev).not.toBe(here);
    }
  });

  it("Endure stays under 30% of the whole campaign", () => {
    const all = Object.values(CAMPAIGN_CHAPTER_META);
    const enduring = all.filter((row) => row.archetype === "Endure").length;
    expect(enduring).toBe(2); // a-6 the-quiet-month + b-2 the-slow-week-after
    expect(enduring / all.length).toBeLessThan(0.3);
  });

  it("perspective levels: exactly three, cap 1/chapter, five-beat cadence, roster ids", () => {
    const seatIds = Object.entries(CAMPAIGN_CHAPTER_META)
      .filter(([, row]) => row.perspectiveId !== undefined)
      .map(([id]) => id);
    expect(seatIds).toEqual(["a-2-apprentice-desk", "a-8-support-vigil", "b-6-oncall-desk"]);
    for (const id of seatIds) {
      const row = CAMPAIGN_CHAPTER_META[id]!;
      expect((PERSPECTIVE_IDS as readonly string[]).includes(row.perspectiveId!), row.perspectiveId).toBe(true);
    }
    // The ~every-5 cadence over the WHOLE tour (L-CP3's per-act gap law,
    // globalized the day a second act joined the roster). Act II shipping
    // ONE seat is the honest resolution of §1.9's per-act floor of two vs
    // this cadence: a 7-beat act cannot hold two seats ≥5 apart after the
    // vigil at tour index 10 (16 and 21 — 21 is outside the act). Tension
    // recorded in the ACT_TWO docblock; full-12 expansion owns it.
    const positions = seatIds.map((id) => TOUR.findIndex((row) => row.chapterId === id));
    for (let i = 1; i < positions.length; i += 1) {
      expect(positions[i]! - positions[i - 1]!).toBeGreaterThanOrEqual(5);
    }
    // The seats live on the scenario docs (the L-CP2 join — the campaign
    // chapter wire still refuses a `perspective` key, RESERVED).
    expect(resolveChapterDoc("apprentice-desk-shift").perspective?.id).toBe("apprentice");
    expect(resolveChapterDoc("support-desk-vigil").perspective?.id).toBe("support-queue");
    expect(resolveChapterDoc("noc-oncall-desk").perspective?.id).toBe("noc-shift");
    for (const chapter of CAMPAIGN_PROLOGUE.chapters) {
      expect(resolveChapterDoc(chapter.scenarioId).perspective, chapter.chapterId).toBeUndefined();
    }
  });

  it("tier rhythm: Act II declares §1.9's Tiers 3–4 rising, earlier acts declare none", () => {
    for (const id of [...Object.keys(PROLOGUE_META), ...Object.keys(ACT_ONE_META)]) {
      expect(CAMPAIGN_CHAPTER_META[id]!.tier, id).toBeUndefined(); // OD-19 T0–3 by fiat
    }
    const tiers = CAMPAIGN_ACT_TWO.chapters.map((c) => CAMPAIGN_CHAPTER_META[c.chapterId]!.tier);
    for (const tier of tiers) expect(tier === 3 || tier === 4, String(tier)).toBe(true);
    for (let i = 1; i < tiers.length; i += 1) {
      expect(tiers[i]!).toBeGreaterThanOrEqual(tiers[i - 1]!); // the rise, never a drop
    }
  });

  it("every scenarioId resolves through the authority; every chapter meta rides its doc", () => {
    for (const [doc] of acts) {
      for (const chapter of doc.chapters) {
        const resolved = resolveChapterDoc(chapter.scenarioId);
        expect(resolved.id, chapter.chapterId).toBe(chapter.scenarioId);
      }
    }
    // the meta ledger cites the SAME hosting_game.md line the doc itself
    // cites — the authoring ledger can never drift from the wire it labels.
    for (const [doc, meta] of acts) {
      for (const chapter of doc.chapters) {
        const resolved = resolveChapterDoc(chapter.scenarioId);
        expect(meta[chapter.chapterId]!.specLine, chapter.chapterId).toBe(resolved.specLine);
      }
    }
  });

  it("the authored anchors are TEXT-true lines in hosting_game.md", () => {
    const book = readFileSync(fileURLToPath(new URL("../../../../../hosting_game.md", import.meta.url)), "utf8").split("\n");
    expect(book[1478 - 1]).toContain("The Apprentice");
    expect(book[1212 - 1]).toContain("The Support Queue");
    expect(book[1267 - 1]).toContain("no building allowed"); // the NOC seat's ban, verbatim
    expect(book[35140 - 1]).toContain("obituary page"); // §9.9 — the Hardest Lesson's anchor
    expect(book[5117 - 1]).toContain("Act II (Tiers 3–4)"); // the act law itself
    // Shipped-mission specLines ride each doc's OWN citation (the meta↔doc
    // equality law above) — the book's heading lines drift as sibling lanes
    // insert content, and this lane never re-pins another doc's anchor.
  });

  it("cash-floor law: the scripted bridge never opens a chapter poorer than its authored opening", () => {
    const bridge = CAMPAIGN_ACT_ONE.carry.cashFloor.bridgeMicroUsd;
    const threshold = CAMPAIGN_ACT_ONE.carry.cashFloor.thresholdMicroUsd;
    expect(bridge).toBe(300_000_000n);
    expect(threshold).toBe(1_000_000_000_000_000n);
    expect(bridge).toBeLessThan(threshold);
    // Act II rides the SAME bridge (probe-grounded: every Act-II chapter wins
    // or dies honestly under it — the act inherits the number, never re-tunes
    // it), and it inherits the never-poorer law with EXACTLY one named
    // exception, each exception a probe-witnessed thin-ride (see below).
    expect(CAMPAIGN_ACT_TWO.carry.cashFloor.bridgeMicroUsd).toBe(bridge);
    for (const doc of CAMPAIGN_ROSTER) {
      expect(doc.carry.cashFloor.thresholdMicroUsd).toBe(threshold);
      for (const chapter of doc.chapters) {
        const opening = resolveChapterDoc(chapter.scenarioId).limits.initialFreeMicroUsd ?? 0n;
        const excepted = Object.prototype.hasOwnProperty.call(ACT_TWO_THIN_RIDE_EXCEPTIONS, chapter.scenarioId);
        if (excepted) {
          // Only Act II may except, and only for a doc it actually runs.
          expect(doc.id, chapter.chapterId).toBe(CAMPAIGN_ACT_TWO.id);
          expect(ACT_TWO_THIN_RIDE_EXCEPTIONS[chapter.scenarioId]!.length).toBeGreaterThan(0);
        } else {
          expect(Number(bridge), chapter.chapterId).toBeGreaterThanOrEqual(Number(opening));
        }
      }
    }
    // No dead exceptions: every exception names a scenario Act II really runs.
    const played = new Set(CAMPAIGN_ACT_TWO.chapters.map((c) => c.scenarioId));
    for (const scenarioId of Object.keys(ACT_TWO_THIN_RIDE_EXCEPTIONS)) {
      expect(played.has(scenarioId), scenarioId).toBe(true);
    }
  });

  it("named-cast caps ride the §1.6 law (3 staff / 12 cast) in all three arcs", () => {
    for (const doc of CAMPAIGN_ROSTER) {
      expect(doc.carry.staffCap).toBe(3);
      expect(doc.carry.castCap).toBe(12);
      expect(doc.carry.scarCapRide).toBe(true);
    }
  });
});

/* ------------------------------------------------------------------ */
/* 2. PROLOGUE — full-chain determinism (first mastery inside three min) */
/* ------------------------------------------------------------------ */

describe("prologue chain — OD-19 first light", () => {
  it("three beats, all won, chapter 0 unmodified, mastery at t12", { timeout: 300_000 }, () => {
    const report = run(CAMPAIGN_PROLOGUE);
    expect(report.campaignId).toBe("prologue-first-light");
    expect(report.chapterRecords.map((r) => [r.chapterId, r.outcome, r.stopReason])).toEqual([
      ["p-1-triage-desk", "won", "win@12"],
      ["p-2-borrowed-thunder", "won", "win@60"],
      ["p-3-handover-queue", "won", "win@40"],
    ]);
    // The first-mastery-inside-3-minutes beat: twelve ticks to a medal.
    expect(report.chapterRecords[0]!.endTick).toBe(12n);
    // Chapter 0 runs the BASE doc — the bridge may not touch it.
    expect(report.chapterRecords[0]!.cashStartMicroUsd).toBe(0n);
    // From chapter 1 the scripted bridge IS the opening (every shipped end
    // cash in this act sits under the threshold).
    expect(report.chapterRecords[1]!.cashStartMicroUsd).toBe(300_000_000n);
    expect(report.edgesSpawned).toHaveLength(0);
  });

  it("digest ×100 Set.size 1 + byte-equal twin (the L-CP1 gate, content edition)", { timeout: 600_000 }, () => {
    const report = run(CAMPAIGN_PROLOGUE);
    const digests = new Set<string>();
    for (let i = 0; i < 100; i += 1) digests.add(digestCampaignReport(report));
    expect(digests.size).toBe(1);
    const twin = run(CAMPAIGN_PROLOGUE);
    expect(digestCampaignReport(twin)).toBe(digestCampaignReport(report));
    expect(digestCampaignReport(report)).toBe("28df3ca4e6c90977"); // run-captured 2026-10-17 (founder "First Light Inc")
  });
});

/* ------------------------------------------------------------------ */
/* 3. ACT I — the probe-confirmed win-through ledger                    */
/* ------------------------------------------------------------------ */

describe("act one chain — panic into process", () => {
  const report = SHARED_ACT_ONE; // collected once — every beat won

  it("eight chapters ride to the vigil — no wall, no succession", () => {
    expect(report.campaignId).toBe("act-one-panic-to-process");
    expect(report.chapterRecords).toHaveLength(8);
    expect(report.chapterRecords.map((r) => r.outcome)).toEqual([
      "won", "won", "won", "won", "won", "won", "won", "won",
    ]);
    expect(report.chapterRecords.map((r) => r.stopReason)).toEqual([
      "win@240", "win@25", "win@200", "win@300", "win@480", "win@480", "win@100", "win@30",
    ]);
    expect(report.edgesSpawned).toHaveLength(0); // no death → no succession edge
    expect(report.finalNodeId).toBe(report.chapterRecords[0]!.nodeId);
  });

  it("win-through ledger: every won chapter settles the four §9.1 facets", () => {
    for (const record of report.chapterRecords) {
      expect(record.settledFacets, record.chapterId).toEqual([
        "attributionEvents", "finances", "museum", "medals",
      ]);
    }
    const node = getNode(report.finalGraph, report.finalNodeId);
    expect(node.medals.filter((m) => m.kind === "chapter-won")).toHaveLength(8);
    expect(node.museum).toHaveLength(8);
    expect(node.attributionEvents).toHaveLength(8);
    // The chapter that won richest keeps its name: the RFO's credit lifts
    // the book to 352,164,000 µ$, and the zero-economy vigil closes the act
    // opening-on-bridge unchanged (its win rides no dice).
    expect(node.finances.cashMicroUsd).toBe(300_000_000n);
    expect(report.chapterRecords[6]!.cashEndMicroUsd).toBe(352_164_000n);
  });

  it("digest ×100 Set.size 1 + byte-equal twin over the whole eight-beat graph", { timeout: 600_000 }, () => {
    const digests = new Set<string>();
    for (let i = 0; i < 100; i += 1) digests.add(digestCampaignReport(report));
    expect(digests.size).toBe(1);
    expect(digestCampaignReport(run(CAMPAIGN_ACT_ONE))).toBe(digestCampaignReport(SHARED_ACT_ONE));
    expect(digestCampaignReport(report)).toBe("6df9dedc702c2657"); // run-captured 2026-10-17 (founder "First Light Inc")
  });
});

/* ------------------------------------------------------------------ */
/* 4. ACT II — process into prevention: THE DEATH, the SUCCESSION       */
/* ------------------------------------------------------------------ */

describe("act two chain — process into prevention (ADR-0019 program 3)", () => {
  const report = SHARED_ACT_TWO; // collected once — six won, one LOST IN THE SHAPE

  it("seven beats: six won, b-4 dies float-insolvent under the lawful bridge", () => {
    expect(report.campaignId).toBe("act-two-process-to-prevention");
    expect(report.chapterRecords.map((r) => [r.nodeId, r.chapterId, r.outcome, r.stopReason])).toEqual([
      ["co", "b-1-money-works", "won", "win@240"],
      ["co", "b-2-slow-week", "won", "win@100"],
      ["co", "b-3-skeleton-weekend", "won", "win@240"],
      ["co", "b-4-hardest-lesson", "lost", "lose:death-by-cause:any@73"],
      [CHILD_ID, "b-5-fogged-board", "won", "win@600"],
      [CHILD_ID, "b-6-oncall-desk", "won", "win@30"],
      [CHILD_ID, "b-7-chargeback-shift", "won", "win@200"],
    ]);
    // b-1 is index 0: the BASE doc untouched — and its authored opening IS
    // the bridge (300M verbatim), the one re-ride that opens on its own words.
    expect(report.chapterRecords[0]!.cashStartMicroUsd).toBe(300_000_000n);
    for (const record of report.chapterRecords.slice(1)) {
      expect(record.cashStartMicroUsd, record.chapterId).toBe(300_000_000n);
    }
    // The death lands on EXACTLY zero cash — the float-insolvency signature
    // (refused settlements t31–t88 into a bank the rail emptied at t30).
    expect(report.chapterRecords[3]!.cashEndMicroUsd).toBe(0n);
    expect(report.chapterRecords[3]!.endTick).toBe(73n);
  });

  it("failure is narrated, not PAID: the lost chapter settles 2 facets, no cash", () => {
    for (const [i, record] of report.chapterRecords.entries()) {
      const lost = i === 3;
      expect(record.settledFacets, record.chapterId).toEqual(
        lost ? ["attributionEvents", "museum"] : ["attributionEvents", "finances", "museum", "medals"],
      );
    }
    // §9.9 obituary with the REAL sim-derived cause, written to the parent's
    // museum row as the memorial note.
    const parent = getNode(report.finalGraph, asEntityId("co"));
    const obituary = parent.museum.find((row) => row.id === "chapter:act-two-process-to-prevention:b-4-hardest-lesson:3");
    expect(obituary).toBeDefined();
    expect(obituary!.memorialNote).toBe("lose:death-by-cause:any@73");
    expect(obituary!.sourceFacet).toBe("scenario");
    expect(parent.medals.filter((m) => m.kind === "chapter-won")).toHaveLength(3); // b-4 earns none
    expect(parent.attributionEvents).toHaveLength(4); // losses attribute too
    // The parent's ledger FREEZES at the last settled win: b-4's loss settles
    // no finances facet, and the manifest below carries a null cash slice —
    // the heir inherits the obituary and the unlocks, never the bankroll.
    expect(parent.finances.cashMicroUsd).toBe(408_889_051n); // b-3's settled cashEnd
  });

  it("succession fires for REAL: the failure_restart edge and its manifest", () => {
    expect(report.edgesSpawned).toHaveLength(1);
    const edge = report.edgesSpawned[0]!;
    expect(edge.type).toBe("failure_restart");
    expect(edge.parentId).toBe("co");
    expect(edge.childId).toBe(CHILD_ID);
    // The 3-node law over the testimony roster: sorted kept-3, 4th = the
    // failure-only unlock (D12 "one small permanent unlock").
    expect(edge.manifest.keptNodes).toEqual(["cdn-edge", "rack-a", "rack-b"]);
    expect(edge.manifest.failureOnlyUnlock).toBe("waf-tier");
    // "Poorer, not paid": a failure_restart carries NO cash slice (§9.9/§1.6
    // — the child opens on the scripted bridge, never the parent's war chest).
    expect(edge.manifest.cashSliceMicroUsd).toBeNull();
    expect(edge.manifest.playbook).toHaveLength(0); // chapter batches mint no playbook rows
    expect(edge.manifest.doctrine.id).toBe("doctrine:unwritten:act-two-process-to-prevention");
    expect(edge.manifest.handwritingParent).toBe("co");
    // Museum preservation: the parent's four settled exhibits ride the edge.
    expect(edge.preservedMuseumExhibitIds).toEqual([
      "chapter:act-two-process-to-prevention:b-1-money-works:0",
      "chapter:act-two-process-to-prevention:b-2-slow-week:1",
      "chapter:act-two-process-to-prevention:b-3-skeleton-weekend:2",
      "chapter:act-two-process-to-prevention:b-4-hardest-lesson:3",
    ]);
  });

  it("the child bootstraps through the manifest EXACTLY ONCE", () => {
    // b-5's record carries the bootstrapped flag; its opening is the BRIDGE,
    // because a failure_restart child starts at zero cash (null slice).
    const fogged = report.chapterRecords[4]!;
    expect(fogged.bootstrapped).toBe(true);
    expect(fogged.nodeId).toBe(CHILD_ID);
    expect(fogged.cashStartMicroUsd).toBe(300_000_000n);
    for (const record of report.chapterRecords.slice(5)) expect(record.bootstrapped, record.chapterId).toBe(false);

    const child = getNode(report.finalGraph, asEntityId(CHILD_ID));
    expect(child.parentId).toBe("co");
    expect(child.identity.name).toBe("Successor of First Light Inc");
    expect(child.nodesUnlocked.map((u) => `${u.node}:${u.via}`)).toEqual([
      "cdn-edge:testimony", "rack-a:testimony", "rack-b:testimony", "waf-tier:milestone",
    ]);
    // The museum marker proves the spend; a second spend refuses BY NAME.
    expect(childManifestSpent(child)).toBe(true);
    expect(child.museum.some((row) => row.id === `bootstrap:${CHILD_ID}` && row.sourceFacet === "succession")).toBe(true);
    expect(() => spendInheritanceOnChild(report.finalGraph, asEntityId(CHILD_ID))).toThrow(/manifest already spent/);
    // The child runs the closing three beats from the manifested ledger:
    // fogged board, taxed phone, the prevention shift it survived broke.
    expect(child.finances.cashMicroUsd).toBe(1_819_644n);
    expect(child.medals.filter((m) => m.kind === "chapter-won")).toHaveLength(3);
  });

  it("the death is SHAPE-driven, not rigged: bridge 600M ⇒ same doc wins, zero edges", { timeout: 600_000 }, () => {
    const forged = parseCampaignDoc({
      schema: "hh-campaign@1",
      id: "act-two-falsifier-600m",
      name: "Act Two falsifier — one bridge-size more survives",
      chapters: CAMPAIGN_ACT_TWO.chapters.map((c) => ({ chapterId: c.chapterId, scenarioId: c.scenarioId })),
      carry: {
        cashFloor: { thresholdMicroUsd: 1_000_000_000_000_000n, bridgeMicroUsd: 600_000_000n },
        staffCap: 3, castCap: 12, scarCapRide: true,
      },
    });
    const { graph, nodeId } = founder();
    const alt = runCampaign(forged, BASE_SEED, { graph: seedTestimony(graph, nodeId), nodeId, authority });
    // Doubling the bridge delays the zero-crossing from t30 to t60: the
    // refuse-window is too short to sustain the three-day float spell before
    // the ninety-minute clock — the company that died at t73 rides to t90.
    expect(alt.chapterRecords.map((r) => r.stopReason)).toEqual([
      "win@240", "win@100", "win@240", "win@90", "win@600", "win@30", "win@200",
    ]);
    expect(alt.edgesSpawned).toHaveLength(0);
    expect(alt.chapterRecords.every((r) => r.nodeId === "co")).toBe(true);
  });

  it("b-7's thin-ride exception is a LIVE funding-honest witness at the bridge", () => {
    // The exact rebase b-7 plays under (300M scripted vs 100B authored): the
    // composeSignalRows guard (@075a840) turns the unfundable chargeback fee
    // into a RECORDED refusal (the sparse chargebackFeeRefusals row — the
    // chain's ChapterRecord does not surface it, so the witness rides the
    // same rebased doc the chapter ran: the L-GUARD ticket discharged in
    // campaign content).
    const rebased = applyCarryToDoc(shippedScenario("chargeback-wave"), {
      openingCashMicroUsd: CAMPAIGN_ACT_TWO.carry.cashFloor.bridgeMicroUsd,
      contractCasts: [],
      staffCast: [],
      scarCount: 0,
    });
    expect(rebased.limits.initialFreeMicroUsd).toBe(300_000_000n);
    const r = runScenario(rebased, BASE_SEED, {});
    expect(r.outcome).toBe("won");
    expect(r.stopReason).toBe("win@200");
    expect(r.chargebackFeeRefusals).toBeDefined();
    expect(r.chargebackFeeRefusals!.length).toBe(1);
    expect(r.cashEndMicroUsd).toBe(993_070n);
  });

  it("digest ×100 Set.size 1 + byte-equal twin over the seven-beat succession graph", { timeout: 600_000 }, () => {
    const digests = new Set<string>();
    for (let i = 0; i < 100; i += 1) digests.add(digestCampaignReport(report));
    expect(digests.size).toBe(1);
    expect(digestCampaignReport(runUnlocked(CAMPAIGN_ACT_TWO))).toBe(digestCampaignReport(SHARED_ACT_TWO));
    expect(digestCampaignReport(report)).toBe("d31af220a83033ce"); // run-captured 2026-10-18 (testimony-seeded "First Light Inc")
  });
});

/* ------------------------------------------------------------------ */
/* 5. THREE-ARC CHAIN — the succession rides a FULL campaign history    */
/* ------------------------------------------------------------------ */

describe("three-arc chain — prologue into Act I into Act II, one real ledger", () => {
  it("fifteen parent beats, the obituary lands last, the child closes the arc", { timeout: 900_000 }, () => {
    const first = run(CAMPAIGN_PROLOGUE);
    const second = runCampaign(CAMPAIGN_ACT_ONE, BASE_SEED, {
      graph: first.finalGraph, nodeId: first.finalNodeId, authority,
    });
    const graph = seedTestimony(second.finalGraph, second.finalNodeId, "pre-seed-arc2");
    const third = runCampaign(CAMPAIGN_ACT_TWO, BASE_SEED, { graph, nodeId: second.finalNodeId, authority });

    expect(digestCampaignReport(first)).toBe("28df3ca4e6c90977"); // prologue truth UNMOVED by Act II
    expect(digestCampaignReport(second)).toBe("86595ae9b21853b3"); // Act I on the prologue's graph
    expect(digestCampaignReport(third)).toBe("18ef1b5675d0ea27"); // Act II on the full parent ledger

    // The parent node carries the WHOLE career: 3+8+4 museum beats (the last
    // one an obituary), fourteen medals, fifteen attributions — and the death
    // still fires succession exactly once, at the campaign boundary.
    const parent = getNode(third.finalGraph, asEntityId("co"));
    expect(parent.museum).toHaveLength(15);
    expect(parent.museum[14]!.memorialNote).toBe("lose:death-by-cause:any@73");
    expect(parent.medals.filter((m) => m.kind === "chapter-won")).toHaveLength(14);
    expect(parent.attributionEvents).toHaveLength(15);
    expect(third.edgesSpawned).toHaveLength(1);
    expect(third.edgesSpawned[0]!.childId).toBe(CHILD_ID);
    expect(third.finalNodeId).toBe(CHILD_ID);
    const child = getNode(third.finalGraph, asEntityId(CHILD_ID));
    expect(child.nodesUnlocked.map((u) => `${u.node}:${u.via}`)).toEqual([
      "cdn-edge:testimony", "rack-a:testimony", "rack-b:testimony", "waf-tier:milestone",
    ]);
    expect(childManifestSpent(child)).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/* 6. Perspective chapters — LIVE refusal witnesses                     */
/* ------------------------------------------------------------------ */

describe("perspective chapters — the tapes bite (L-CP2 law, in-content)", () => {
  it("the apprentice desk: build thoughts refuse, replies execute, seat rides the report", () => {
    const doc = CHAPTER_AUTHORED_DOCS["apprentice-desk-shift"]!;
    const report = runScenario(doc, BASE_SEED, {});
    expect(report.outcome).toBe("won");
    expect(report.perspective?.id).toBe("apprentice");
    expect(report.observation.intentsRefusedByVerb?.["place-device"] ?? 0).toBe(1);
    expect(report.observation.intentsExecutedByVerb?.communicate ?? 0).toBe(6);
  });

  it("the support vigil: place AND price die at the tape while the queue moves", () => {
    const doc = CHAPTER_AUTHORED_DOCS["support-desk-vigil"]!;
    const report = runScenario(doc, BASE_SEED, {});
    expect(report.outcome).toBe("won");
    expect(report.perspective?.id).toBe("support-queue");
    expect(report.observation.intentsRefusedByVerb?.["place-device"] ?? 0).toBe(1);
    expect(report.observation.intentsRefusedByVerb?.["adjust-price"] ?? 0).toBe(1);
    expect(report.observation.intentsExecutedByVerb?.communicate ?? 0).toBe(6);
    expect(report.observation.intentsExecuted).toBe(6);
  });

  it("the on-call desk: the phone is TAXED (rung 6) while place AND connect die at the tape", () => {
    const doc = CHAPTER_AUTHORED_DOCS["noc-oncall-desk"]!;
    const report = runScenario(doc, BASE_SEED, {});
    expect(report.outcome).toBe("won");
    expect(report.stopReason).toBe("win@30");
    expect(report.perspective?.id).toBe("noc-shift");
    // Two escalations in one tick, attention capacity one: the second refuses
    // through the loan law — :1271's phone, priced by rung 6.
    expect(report.observation.intentsRefusedByVerb?.communicate ?? 0).toBe(1);
    expect(report.observation.intentsRefusedByVerb?.["place-device"] ?? 0).toBe(1);
    expect(report.observation.intentsRefusedByVerb?.["connect-ports"] ?? 0).toBe(1);
    expect(report.observation.intentsExecutedByVerb?.communicate ?? 0).toBe(6);
    expect(report.observation.intentsExecuted).toBe(6);
  });

  it("in-chain, the perspective beats keep the whole digest stable (seated determinism)", { timeout: 600_000 }, () => {
    // The two Act-I perspective chapters are a-2 and a-8 of the SHARED run,
    // and the NOC desk is b-6 of the SHARED Act-II run: fresh full re-runs
    // land on the identical digests — seats add refusal rows to the tape,
    // never noise to the chain.
    expect(digestCampaignReport(run(CAMPAIGN_ACT_ONE))).toBe(digestCampaignReport(SHARED_ACT_ONE));
    expect(digestCampaignReport(runUnlocked(CAMPAIGN_ACT_TWO))).toBe(digestCampaignReport(SHARED_ACT_TWO));
  });
});
