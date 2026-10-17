/**
 * chapters.test.ts — L-CP3: the first authored campaign content.
 *
 * Two halves:
 * 1. The §1.9 AUTHORING lint loop over the chapter-meta ledger (archetypes
 *    non-consecutive, Endure under 30%, perspective cap + every-5 cadence,
 *    unique ids, meta↔doc specLine agreement, hosting_game.md text anchors,
 *    the bridge-never-poorer-than-authored-opening cash-floor law).
 * 2. The RUNTIME truth: both acts ride `runCampaign` end to end — prologue
 *    full-chain determinism (×100 digest + byte-equal twin), Act I the
 *    PROBE-CONFIRMED win-through ledger (medals/museum/finances per won
 *    chapter, final company cash), and the two perspective chapters as LIVE
 *    refusal witnesses (the L-CP2 tapes bite at the door while the chain
 *    stays deterministic).
 *
 * Every pinned outcome below was produced by running the chain (probe
 * 2026-10-17) — the lane's law is probe-don't-fake, and these literals are
 * the honest witness of what the shipped corpus does under the carry rules.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { asEntityId, asRunSeed } from "../../types";
import type { RunSeed } from "../../types";
import { emptyLineageGraph, foundCompany, getNode } from "../../save/index";
import { PERSPECTIVE_IDS, runScenario, shippedScenario } from "../../scenario/index";
import type { ScenarioDoc, ScenarioRunConfig } from "../../scenario/index";
import { digestCampaignReport, runCampaign } from "../index";
import type { CampaignAuthority, CampaignDoc, CampaignReport } from "../index";
import {
  ACT_ONE_META,
  CAMPAIGN_ACT_ONE,
  CAMPAIGN_ARCHETYPES,
  CAMPAIGN_CHAPTER_META,
  CAMPAIGN_PROLOGUE,
  CHAPTER_AUTHORED_DOCS,
  PROLOGUE_META,
} from "../chapters";

function resolveChapterDoc(scenarioId: string): ScenarioDoc {
  const authored = CHAPTER_AUTHORED_DOCS[scenarioId];
  return authored !== undefined ? authored : shippedScenario(scenarioId);
}

const BASE_SEED = asRunSeed(904n);

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

/** One shared Act-I traversal (≈2,075 engine ticks) — collected once,
 *  asserted from three angles. A campaign chapter never mutates the doc
 *  registry, so cross-test sharing is pure. */
const SHARED_ACT_ONE = run(CAMPAIGN_ACT_ONE);

/* ------------------------------------------------------------------ */
/* 1. §1.9 authoring lint loop                                          */
/* ------------------------------------------------------------------ */

describe("chapter meta — the §1.9 authoring law", () => {
  const acts: readonly [CampaignDoc, Readonly<Record<string, { archetype: string; specLine: number; perspectiveId?: string }>>][] = [
    [CAMPAIGN_PROLOGUE, PROLOGUE_META],
    [CAMPAIGN_ACT_ONE, ACT_ONE_META],
  ];

  it("every chapter id is unique across the whole content", () => {
    const ids = acts.flatMap(([doc]) => doc.chapters.map((c) => c.chapterId));
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
    expect(Object.keys(CAMPAIGN_CHAPTER_META).length).toBe(acts[0]![0].chapters.length + acts[1]![0].chapters.length);
  });

  it("no two consecutive chapters in an act share an archetype", () => {
    for (const [doc, meta] of acts) {
      for (let i = 1; i < doc.chapters.length; i += 1) {
        const prev = meta[doc.chapters[i - 1]!.chapterId]!.archetype;
        const here = meta[doc.chapters[i]!.chapterId]!.archetype;
        expect(`${doc.id}:${prev} vs ${here}`, prev).not.toBe(here);
      }
    }
    // Acts are separate chains v0, yet even the concatenated tour never
    // repeats across the seam (prologue tail Schedule, Act I opener
    // Build-to-Spec): one law, checked both ways, nothing to relearn later.
    expect(PROLOGUE_META["p-3-handover-queue"]!.archetype).not.toBe(ACT_ONE_META["a-1-launch-day"]!.archetype);
  });

  it("Endure stays under 30% of the whole campaign", () => {
    const all = Object.values(CAMPAIGN_CHAPTER_META);
    const enduring = all.filter((row) => row.archetype === "Endure").length;
    expect(enduring).toBe(1); // the-quiet-month, the OD-19 process carrier
    expect(enduring / all.length).toBeLessThan(0.3);
  });

  it("perspective levels: exactly two, cap 1/chapter, at least five beats apart, roster ids", () => {
    const seats = Object.entries(CAMPAIGN_CHAPTER_META).filter(([, row]) => row.perspectiveId !== undefined);
    expect(seats.map(([id]) => id)).toEqual(["a-2-apprentice-desk", "a-8-support-vigil"]);
    for (const [, row] of seats) {
      expect((PERSPECTIVE_IDS as readonly string[]).includes(row.perspectiveId!), row.perspectiveId).toBe(true);
    }
    const indices = CAMPAIGN_ACT_ONE.chapters.map((c) => c.chapterId);
    const first = indices.indexOf("a-2-apprentice-desk");
    const last = indices.indexOf("a-8-support-vigil");
    expect(last - first).toBeGreaterThanOrEqual(5); // the ~every-5 cadence floor
    // The seats live on the scenario docs (the L-CP2 join — the campaign
    // chapter wire still refuses a `perspective` key, RESERVED).
    expect(resolveChapterDoc("apprentice-desk-shift").perspective?.id).toBe("apprentice");
    expect(resolveChapterDoc("support-desk-vigil").perspective?.id).toBe("support-queue");
    for (const chapter of CAMPAIGN_PROLOGUE.chapters) {
      expect(resolveChapterDoc(chapter.scenarioId).perspective, chapter.chapterId).toBeUndefined();
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

  it("the perspective anchors are TEXT-true lines in hosting_game.md", () => {
    const book = readFileSync(fileURLToPath(new URL("../../../../../hosting_game.md", import.meta.url)), "utf8").split("\n");
    expect(book[1474 - 1]).toContain("The Apprentice");
    expect(book[1208 - 1]).toContain("The Support Queue");
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
    for (const doc of [CAMPAIGN_PROLOGUE, CAMPAIGN_ACT_ONE]) {
      for (const chapter of doc.chapters) {
        const opening = resolveChapterDoc(chapter.scenarioId).limits.initialFreeMicroUsd ?? 0n;
        expect(Number(bridge), chapter.chapterId).toBeGreaterThanOrEqual(Number(opening));
      }
    }
  });

  it("named-cast caps ride the §1.6 law (3 staff / 12 cast) in both acts", () => {
    for (const doc of [CAMPAIGN_PROLOGUE, CAMPAIGN_ACT_ONE]) {
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
/* 4. Perspective chapters — LIVE refusal witnesses                     */
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

  it("in-chain, the perspective beats keep the whole digest stable (seated determinism)", { timeout: 600_000 }, () => {
    // The two perspective chapters are a-2 and a-8 of the SHARED run above;
    // a fresh full re-run must land on the identical digest — the seats add
    // refusal rows to the tape, never noise to the chain.
    expect(digestCampaignReport(run(CAMPAIGN_ACT_ONE))).toBe(digestCampaignReport(SHARED_ACT_ONE));
  });
});
