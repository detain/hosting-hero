/**
 * chapters.test.ts — the authored campaign content (L-CP3 + ADR-0019 program 3).
 *
 * Five halves:
 * 1. The §1.9 AUTHORING lint loop over the whole five-arc tour (archetypes
 *    non-consecutive, Endure under 30%, perspective cap + every-5 cadence,
 *    the Act II T3→T4 and Act III T5→T6 tier rhythms, unique ids, meta↔doc
 *    specLine agreement, hosting_game.md text anchors, the bridge-never-poorer
 *    cash-floor law with its FOUR named thin-ride exceptions — every one of
 *    them Act II (the b-7 rehabilitation beat plus the three wave-27 siege
 *    re-rides); Act III adds ZERO: every c-doc opens at or below the bridge).
 * 2. The RUNTIME truth: prologue + Act I keep their probe-confirmed win-through
 *    ledgers untouched; ACT II ships the headline — the first authored chapter
 *    that DIES IN THE SHAPE, so chain.ts succession fires through a real
 *    ledger (failure_restart edge, null cash slice, one-spend bootstrap,
 *    obituary museum row) — plus the falsifier that proves the death is
 *    shape-driven: raise the bridge and the same doc wins with zero edges.
 *    Wave-27 grows the act to TWELVE beats: three §1.5 money-ledger re-rides,
 *    the campaign's first perspective REUSE (b-11 wears the noc-shift seat a
 *    second time, resolving the §1.9 per-act seat floor), and a certificate-
 *    cliff finale that opens ON the scripted bridge with no exception.
 * 3. The THREE-ARC CHAIN (prologue → Act I → testimony → Act II) on one real
 *    lineage graph, where the parent carries fifteen settled chapters and the
 *    child boots the closing beats. Kept SEPARATE from the four-arc test on
 *    purpose: its three digests are the byte-stand proof that Act III's
 *    content addition moved no earlier arc (re-asserted identically there too).
 * 4. The ACT THREE chain — nine beats, all won, zero edges: the ratchet audit
 *    played with empty hands (c-2), the two §1.2 seats LIVE at the campaign
 *    door (c-4's first-ever datacenter-tech seat — 15 bans biting; c-9's
 *    zero-mechanics inversion), the scale/reclaim portfolio beat, the c-7
 *    exit-carrier stopReason end-to-end, and the run-up-prefix EXIT witness
 *    (the tour that plays all nine hands off; the tour that SELLS ends in
 *    `exit` — §1.5 :4023's split made literal).
 * 5. The FOUR-ARC CHAIN — 32 beats on one real lineage graph: the Act II
 *    child inherits the whole Act III tour, and every earlier digest is
 *    re-checked UNMOVED on the same construction.
 * 6. The EXIT ARC (L-V3, §E) — the two-beat money-at-the-end sibling: c-7's
 *    doc DECLARED and host-catalog-armed, the sale PAID, the exit edge rides
 *    the chain with its cash slice (gift forced null), the heir opens ON THE
 *    PROCEEDS (exitFunded law — never the bridge), and the tour's OWN
 *    four-arc digests stand re-checked with the arm absent.
 *
 * Every pinned outcome below was produced by running the chain (probes
 * 2026-10-17 / 2026-10-18) — the lane's law is probe-don't-fake, and these
 * literals are the honest witness of what the shipped corpus does under the
 * carry rules.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { asEntityId, asMoney, asRunSeed } from "../../types";
import type { EntityId, MoneyUnit, RunSeed } from "../../types";
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
  endCampaign,
  parseCampaignDoc,
  runCampaign,
  spendInheritanceOnChild,
} from "../index";
import type { CampaignAuthority, CampaignDoc, CampaignReport } from "../index";
import {
  ACT_ONE_META,
  ACT_THREE_META,
  ACT_TWO_META,
  ACT_TWO_THIN_RIDE_EXCEPTIONS,
  CAMPAIGN_ACT_ONE,
  CAMPAIGN_ACT_THREE,
  CAMPAIGN_ACT_TWO,
  CAMPAIGN_ARCHETYPES,
  CAMPAIGN_CHAPTER_META,
  CAMPAIGN_EXIT,
  CAMPAIGN_EXIT_META,
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
function runUnlocked(campaign: CampaignDoc, seedOffset = 0): CampaignReport {
  const { graph, nodeId } = founder();
  return runCampaign(campaign, BASE_SEED, { graph: seedTestimony(graph, nodeId), nodeId, authority, seedOffset });
}

/** One shared Act-I traversal (≈2,075 engine ticks) — collected once,
 *  asserted from three angles. A campaign chapter never mutates the doc
 *  registry, so cross-test sharing is pure. */
const SHARED_ACT_ONE = run(CAMPAIGN_ACT_ONE);
/** One shared Act-II traversal (≈1,483 ticks incl. the t73 dissolution). */
const SHARED_ACT_TWO = runUnlocked(CAMPAIGN_ACT_TWO);
const CHILD_ID = "successor:act-two-process-to-prevention:0";
/** One shared Act-III traversal (≈1,245 ticks, nine beats, zero deaths — the
 *  plain founder needs NO unlock testimony here: Act III never dies, which is
 *  exactly what "prevention into boredom" means at the ledger). */
const SHARED_ACT_THREE = run(CAMPAIGN_ACT_THREE);

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
    [CAMPAIGN_ACT_THREE, ACT_THREE_META],
    [CAMPAIGN_EXIT, CAMPAIGN_EXIT_META],
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
    // wave-26 re-pin 2→4 (c-2 + c-6), wave-27 DISCLOSED re-pin 4→5: b-8
    // collections-week is an Endure beat — the accounts arrive on their own
    // calendar and the act endures the ledger. 5/32 = 15.6%.
    // WAVE-28: the tour grows to 34 beats and the count HOLDS at five — the
    // exit arc wears Negotiate (x-1) + Inherit (x-2), no Endure. 5/34 = 14.7%.
    expect(enduring).toBe(5); // a-6 + b-2 + b-8 + c-2 + c-6, under §1.9's 30% cap
    expect(enduring / all.length).toBeLessThan(0.3);
  });

  it("perspective levels: six seat rows on five distinct roster ids, cap 1/chapter, five-beat cadence", () => {
    const seatIds = Object.entries(CAMPAIGN_CHAPTER_META)
      .filter(([, row]) => row.perspectiveId !== undefined)
      .map(([id]) => id);
    expect(seatIds).toEqual([
      "a-2-apprentice-desk",
      "a-8-support-vigil",
      "b-6-oncall-desk",
      "b-11-prevention-shift",
      "c-4-floor-and-aisle",
      "c-9-red-team-friday",
    ]);
    for (const id of seatIds) {
      const row = CAMPAIGN_CHAPTER_META[id]!;
      expect((PERSPECTIVE_IDS as readonly string[]).includes(row.perspectiveId!), row.perspectiveId).toBe(true);
    }
    // The ~every-5 cadence over the WHOLE tour (L-CP3's per-act gap law,
    // globalized the day a second act joined the roster).
    // WAVE-26: Act III restored the per-act floor of two WITHOUT touching the
    // global cadence (c-4/c-9 at 21/26, gaps 5 and 5).
    // WAVE-27 FULL RESOLUTION: Act II grows to twelve beats and seats its
    // SECOND desk — b-11 wears the noc-shift roster row a second time, the
    // campaign's first perspective REUSE. No lint law forbids it: the §1.9
    // laws are roster membership + cadence + cap-1-per-chapter, and
    // PERSPECTIVE_EXPRESSIBILITY is per-perspective (noc-shift's rails are
    // already witnessed lawful at b-6). The 27-beat tour never reused a
    // seat; the 32-beat tour does it once, and every act of the campaign
    // finally sits at §1.9's own per-act floor of two. Seats at tour indices
    // {4,10,16,21,26,31} — gaps {6,6,5,5,5}.
    const positions = seatIds.map((id) => TOUR.findIndex((row) => row.chapterId === id));
    for (let i = 1; i < positions.length; i += 1) {
      expect(positions[i]! - positions[i - 1]!).toBeGreaterThanOrEqual(5);
    }
    // The wave-27 exact-shape pin: the cadence is not merely lawful, it is
    // the arithmetic the resolution was built on — every gap six, six, five,
    // five, five across thirty-two beats.
    expect(positions).toEqual([4, 10, 16, 21, 26, 31]);
    expect(positions.slice(1).map((pos, i) => pos - positions[i]!)).toEqual([6, 6, 5, 5, 5]);
    // The seats live on the scenario docs (the L-CP2 join — the campaign
    // chapter wire still refuses a `perspective` key, RESERVED).
    expect(resolveChapterDoc("apprentice-desk-shift").perspective?.id).toBe("apprentice");
    expect(resolveChapterDoc("support-desk-vigil").perspective?.id).toBe("support-queue");
    expect(resolveChapterDoc("noc-oncall-desk").perspective?.id).toBe("noc-shift");
    // b-11 rides the SAME roster row through a different scenario doc — the
    // join is per-doc, so reuse costs the law nothing.
    expect(resolveChapterDoc("noc-prevention-shift").perspective?.id).toBe("noc-shift");
    // Wave-26's two Act-III seats ride the same join — the scenario doc owns
    // the perspective row, the campaign wire never does.
    expect(resolveChapterDoc("the-floor-and-aisle").perspective?.id).toBe("datacenter-tech");
    expect(resolveChapterDoc("red-team-friday").perspective?.id).toBe("red-team-friday");
    for (const chapter of CAMPAIGN_PROLOGUE.chapters) {
      expect(resolveChapterDoc(chapter.scenarioId).perspective, chapter.chapterId).toBeUndefined();
    }
  });

  it("tier rhythm: Act II rises T3→T4, Act III rises T5→T6, earlier acts declare none", () => {
    for (const id of [...Object.keys(PROLOGUE_META), ...Object.keys(ACT_ONE_META)]) {
      expect(CAMPAIGN_CHAPTER_META[id]!.tier, id).toBeUndefined(); // OD-19 T0–3 by fiat
    }
    const tiers = CAMPAIGN_ACT_TWO.chapters.map((c) => CAMPAIGN_CHAPTER_META[c.chapterId]!.tier);
    for (const tier of tiers) expect(tier === 3 || tier === 4, String(tier)).toBe(true);
    for (let i = 1; i < tiers.length; i += 1) {
      expect(tiers[i]!).toBeGreaterThanOrEqual(tiers[i - 1]!); // the rise, never a drop
    }
    // Act III (§1.9 :5136 "Act III (Tiers 5–6)"): the same non-decreasing law
    // over the {5,6} band, plus the act-boundary rise — b-12's T4 hands the
    // tour to c-1's T5, the tier never falls anywhere on the thirty-two.
    // Wave-27's b-8..b-12 rows are all T4: the act rides its ceiling.
    const tiers3 = CAMPAIGN_ACT_THREE.chapters.map((c) => CAMPAIGN_CHAPTER_META[c.chapterId]!.tier);
    for (const tier of tiers3) expect(tier === 5 || tier === 6, String(tier)).toBe(true);
    for (let i = 1; i < tiers3.length; i += 1) {
      expect(tiers3[i]!).toBeGreaterThanOrEqual(tiers3[i - 1]!);
    }
    expect(tiers3[0]!).toBeGreaterThan(tiers[tiers.length - 1]!); // 5 > 4 at the seam
    // The Exit arc (§E, L-V3): money-at-the-end's two beats ride the TOP rung
    // — T6 at both posts, the tour never falls anywhere on the thirty-four.
    // The seam law here is >= (NOT the strict > of the 4->5 act seam): the
    // exit is not a new act rising, it is the same tour's last rung extended
    // — c-9's T6 hands to x-1's T6 as the company changes hands, not bands.
    const tiersX = CAMPAIGN_EXIT.chapters.map((c) => CAMPAIGN_CHAPTER_META[c.chapterId]!.tier);
    for (const tier of tiersX) expect(tier === 6, String(tier)).toBe(true);
    expect(tiersX[0]!).toBeGreaterThanOrEqual(tiers3[tiers3.length - 1]!); // 6 >= 6 at the seam
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
    expect(book[1488 - 1]).toContain("The Apprentice");
    expect(book[1220 - 1]).toContain("The Support Queue");
    expect(book[1277 - 1]).toContain("no building allowed"); // the NOC seat's ban, verbatim
    expect(book[1276 - 1]).toContain("NOC Shift"); // the seat heading b-11 cites (wave-27)
    expect(book[3277 - 1]).toContain("Certificate Expired"); // §1.5 cert cliff — b-12's heading
    expect(book[35196 - 1]).toContain("obituary page"); // §9.9 — the Hardest Lesson's anchor
    expect(book[5143 - 1]).toContain("Act II (Tiers 3–4)"); // the act law itself
    // Wave-26 Act III anchors (design authority I-AC3; substring truth on the
    // quoted line, verified by reading the lines as authored):
    expect(book[5144 - 1]).toContain("Act III (Tiers 5–6)"); // the act law, same sentence
    expect(book[5144 - 1]).toContain("8 levels"); // the design figure the cadence supersedes to nine
    expect(book[5375 - 1]).toContain("do nothing and watch"); // §1.11 Ratchet Audit — c-2's law sentence
    expect(book[1219 - 1]).toContain("Place/Connect only"); // §1.2 datacenter-tech — c-4's seat
    expect(book[1221 - 1]).toContain("goal node inverted"); // §1.2 red-team-friday — c-9's seat
    expect(book[4027 - 1]).toContain("the run-up"); // §1.5 Sell the Company split — c-7's level
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
    // or dies honestly under it), and it inherits the never-poorer law with FOUR named
    // exceptions (b-7 + the wave-27 siege re-rides), each a probe-witnessed
    // thin-ride. b-11/b-12 need NONE: both open ON the bridge (see below).
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

  it("named-cast caps ride the §1.6 law (3 staff / 12 cast) in all five arcs", () => {
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

  it("twelve beats: eleven won, b-4 dies float-insolvent under the lawful bridge", () => {
    expect(report.campaignId).toBe("act-two-process-to-prevention");
    expect(report.chapterRecords.map((r) => [r.nodeId, r.chapterId, r.outcome, r.stopReason])).toEqual([
      ["co", "b-1-money-works", "won", "win@240"],
      ["co", "b-2-slow-week", "won", "win@100"],
      ["co", "b-3-skeleton-weekend", "won", "win@240"],
      ["co", "b-4-hardest-lesson", "lost", "lose:death-by-cause:any@73"],
      [CHILD_ID, "b-5-fogged-board", "won", "win@600"],
      [CHILD_ID, "b-6-oncall-desk", "won", "win@30"],
      [CHILD_ID, "b-7-chargeback-shift", "won", "win@200"],
      [CHILD_ID, "b-8-collections-week", "won", "win@240"],
      [CHILD_ID, "b-9-post-breach", "won", "win@320"],
      [CHILD_ID, "b-10-sev-0", "won", "win@240"],
      [CHILD_ID, "b-11-prevention-shift", "won", "win@30"],
      [CHILD_ID, "b-12-cert-cliff", "won", "win@240"],
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
    // The child runs the closing EIGHT beats from the manifested ledger:
    // fogged board, taxed phone, the prevention shift it survived broke, the
    // money-ledger sieges (b-8/b-9/b-10), the prevention seat worn twice, and
    // the certificate cliff the act ends on — its settled cash is b-12's.
    expect(child.finances.cashMicroUsd).toBe(316_398_000n);
    expect(child.medals.filter((m) => m.kind === "chapter-won")).toHaveLength(8);
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
      // wave-27: the re-rides win at 600M too; b-12's churn dice are cash-
      // invariant (the cliff is a calendar), b-11 is zero-economy — its cash
      // simply IS the bridge, the purest bridge-scaling witness in the act.
      "win@240", "win@320", "win@240", "win@30", "win@240",
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

  it("five campaign seeds: the wave-27 back half holds its win lines on every offset", { timeout: 900_000 }, () => {
    // b-8/b-9 ride dice — hourly collections and write-off paths shift the
    // cashEnd every seed. b-10 is dice-free at the bridge, b-11 is zero-
    // economy (its cash IS the bridge), and b-12's cliff is a CALENDAR: the
    // retention dice decide WHICH certificates lapse, never the board read.
    // b-4's death line does not flicker on any of the five.
    const BACK_HALF: readonly (readonly [string, string, string])[][] = [
      [["b-8-collections-week", "win@240", "10055709"], ["b-9-post-breach", "win@320", "942845"], ["b-10-sev-0", "win@240", "509196000"], ["b-11-prevention-shift", "win@30", "300000000"], ["b-12-cert-cliff", "win@240", "316398000"]],
      [["b-8-collections-week", "win@240", "28233829"], ["b-9-post-breach", "win@320", "90782"], ["b-10-sev-0", "win@240", "509196000"], ["b-11-prevention-shift", "win@30", "300000000"], ["b-12-cert-cliff", "win@240", "316398000"]],
      [["b-8-collections-week", "win@240", "192338"], ["b-9-post-breach", "win@320", "58420"], ["b-10-sev-0", "win@240", "509196000"], ["b-11-prevention-shift", "win@30", "300000000"], ["b-12-cert-cliff", "win@240", "316398000"]],
      [["b-8-collections-week", "win@240", "29372054"], ["b-9-post-breach", "win@320", "1771"], ["b-10-sev-0", "win@240", "509196000"], ["b-11-prevention-shift", "win@30", "300000000"], ["b-12-cert-cliff", "win@240", "316398000"]],
      [["b-8-collections-week", "win@240", "29206105"], ["b-9-post-breach", "win@320", "1380402"], ["b-10-sev-0", "win@240", "509196000"], ["b-11-prevention-shift", "win@30", "300000000"], ["b-12-cert-cliff", "win@240", "316398000"]],
    ];
    for (let off = 0; off < 5; off += 1) {
      const alt = runUnlocked(CAMPAIGN_ACT_TWO, off);
      expect(alt.chapterRecords[3]!.stopReason, `offset ${off}`).toBe("lose:death-by-cause:any@73");
      expect(alt.chapterRecords.slice(7).map((r) => [r.chapterId, r.stopReason, `${r.cashEndMicroUsd}`]), `offset ${off}`).toEqual(BACK_HALF[off]);
    }
  });

  it("b-11 wears the noc-shift seat a SECOND time: the b-6 rail's prevention twin, dice-free ×5", () => {
    const rebased = applyCarryToDoc(CHAPTER_AUTHORED_DOCS["noc-prevention-shift"]!, {
      openingCashMicroUsd: 300_000_000n, contractCasts: [], staffCast: [], scarCount: 0,
    });
    expect(rebased.limits.initialFreeMicroUsd).toBe(300_000_000n);
    for (let off = 0; off < 5; off += 1) {
      const r = runScenario(rebased, BASE_SEED, { seedOffset: off });
      expect(r.outcome, `offset ${off}`).toBe("won");
      expect(r.stopReason, `offset ${off}`).toBe("win@30");
      expect(r.perspective?.id, `offset ${off}`).toBe("noc-shift");
      expect(r.observation.intentsExecuted, `offset ${off}`).toBe(6);
      expect(r.observation.intentsExecutedByVerb?.communicate ?? 0, `offset ${off}`).toBe(6);
      // The twin of b-6's refusal shape: the phone taxed at capacity one,
      // build AND cable both dead at the tape — the SAME seat, the same
      // bite, one act of lessons later.
      expect(r.observation.intentsRefusedByVerb, `offset ${off}`).toEqual({ communicate: 1, "connect-ports": 1, "place-device": 1 });
      expect(r.cashEndMicroUsd, `offset ${off}`).toBe(300_000_000n); // zero-economy: the cash IS the bridge
    }
  });

  it("b-12 opens ON the bridge (no exception) and grades the cliff dice honestly ×5", () => {
    const rebased = applyCarryToDoc(CHAPTER_AUTHORED_DOCS["the-cert-cliff"]!, {
      openingCashMicroUsd: 300_000_000n, contractCasts: [], staffCast: [], scarCount: 0,
    });
    // The doc's initialFree is UNSET — the carry rebase lands it verbatim ON
    // the scripted bridge: equality satisfies the never-poorer law, so this
    // finale needs no thin-ride exception (unlike its three siege siblings).
    expect(rebased.limits.initialFreeMicroUsd).toBe(300_000_000n);
    const churn: number[] = [];
    const settled: number[] = [];
    const cash: string[] = [];
    for (let off = 0; off < 5; off += 1) {
      const r = runScenario(rebased, BASE_SEED, { seedOffset: off });
      expect(r.stopReason, `offset ${off}`).toBe("win@240");
      expect(r.observation.bounces, `offset ${off}`).toBe(0); // 400 slots — the scar never bounces
      expect(r.observation.reputationBps, `offset ${off}`).toBe(5_000n); // no dunning story — the flat book holds
      churn.push(r.observation.churnedCustomers);
      settled.push(r.observation.settledInvoices);
      cash.push(`${r.cashEndMicroUsd}`);
    }
    // The retention dice lapse a shifting 1–3 of the four certificates at
    // the t234 cliff — the act closes on prevention MEASURED in churn, and
    // the grade only fails if the whole calendar lapses (churn-above:3, never
    // observed on the five probed seeds).
    expect(churn).toEqual([3, 2, 1, 1, 1]);
    expect(settled).toEqual([4, 3, 3, 4, 4]);
    expect(cash).toEqual(["316398000", "312298500", "312298500", "316398000", "316398000"]);
  });

  it("digest ×100 Set.size 1 + byte-equal twin over the twelve-beat succession graph", { timeout: 600_000 }, () => {
    const digests = new Set<string>();
    for (let i = 0; i < 100; i += 1) digests.add(digestCampaignReport(report));
    expect(digests.size).toBe(1);
    expect(digestCampaignReport(runUnlocked(CAMPAIGN_ACT_TWO))).toBe(digestCampaignReport(SHARED_ACT_TWO));
    expect(digestCampaignReport(report)).toBe("cd82b8b88a125e66"); // run-captured 2026-10-18, WAVE-27 twelve-beat re-pin (testimony-seeded "First Light Inc")
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
    expect(digestCampaignReport(third)).toBe("5f79eb776a0bafaf"); // Act II on the full parent ledger — wave-27 twelve-beat re-pin (run-captured 2026-10-18)

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

/* ------------------------------------------------------------------ */
/* 7. ACT III — prevention into boredom: the exit grammar rides          */
/* ------------------------------------------------------------------ */

describe("act three chain — prevention into boredom (wave-26 full tour)", () => {
  const report = SHARED_ACT_THREE; // collected once — nine beats, zero deaths

  it("nine beats, all won, zero edges — nobody has to die in the boredom act", () => {
    expect(report.campaignId).toBe("act-three-prevention-to-boredom");
    expect(report.chapterRecords.map((r) => [r.chapterId, r.outcome, r.stopReason])).toEqual([
      ["c-1-storm-window", "won", "win@240"],
      ["c-2-quarter-that-ran-itself", "won", "win@60"],
      ["c-3-understaffed-sunday", "won", "win@40"],
      ["c-4-floor-and-aisle", "won", "win@40"],
      ["c-5-growth-that-shrank", "won", "win@60"],
      ["c-6-long-gradient", "won", "win@240"],
      ["c-7-long-sale", "won", "win:sell-accepted-above:0@60"],
      ["c-8-institution-watch", "won", "win@240"],
      ["c-9-red-team-friday", "won", "win@25"],
    ]);
    // c-1 is index 0: the BASE doc untouched — its authored opening rides its
    // own $0 book (the monthly floor clause keeps the churn watch silent; the
    // 8.2M landing is the invoice-free quiet of a 240-minute clock).
    expect(report.chapterRecords[0]!.cashStartMicroUsd).toBe(0n);
    expect(report.chapterRecords[0]!.cashEndMicroUsd).toBe(8_199_000n);
    for (const record of report.chapterRecords.slice(1)) {
      expect(record.cashStartMicroUsd, record.chapterId).toBe(300_000_000n);
    }
    for (const record of report.chapterRecords) {
      expect(record.settledFacets, record.chapterId).toEqual([
        "attributionEvents", "finances", "museum", "medals",
      ]);
    }
    expect(report.edgesSpawned).toHaveLength(0); // prevention: no death to succeed
    expect(report.finalNodeId).toBe("co");
  });

  it("the run-up SELLS: a seven-beat prefix ending c-7 selects the `exit` ending — verdict-observed end-to-end", { timeout: 600_000 }, () => {
    // §1.5 :4023's own split made literal: THE CAMPAIGN THAT SELLS ends at the
    // sale. The prefix is a data replay of the same chapter wires — per-chapter
    // seeds ride chapterId, so the c-7 record here is the SAME beat the full
    // tour plays (identical stopReason, identical cash witnesses).
    const prefix = parseCampaignDoc({
      schema: "hh-campaign@1",
      id: "act-three-the-run-up",
      name: "Act Three — The Run-Up (prefix)",
      chapters: CAMPAIGN_ACT_THREE.chapters.slice(0, 7).map((c) => ({ chapterId: c.chapterId, scenarioId: c.scenarioId })),
      carry: CAMPAIGN_ACT_THREE.carry,
    });
    const sold = run(prefix);
    expect(sold.chapterRecords.every((r) => r.outcome === "won")).toBe(true);
    const terminal = sold.chapterRecords[6]!;
    expect(terminal.stopReason).toBe("win:sell-accepted-above:0@60"); // the AC-B carrier grammar AC-E awaits
    expect(terminal.cashEndMicroUsd).toBe(369_372_000n);
    const ending = endCampaign(sold, getNode(sold.finalGraph, sold.finalNodeId));
    expect(ending.kind).toBe("exit"); // @61a1c3b SELL_ACCEPTED_SHAPE on the REAL string
    expect(ending.title).toBe("The Exit");
    expect(ending.evidence.deathStopReason).toBeNull();
    expect(ending.evidence.medals).toBe(7);
  });

  it("but the FULL nine-beat tour hands off instead: quiet-handoff — the anti-lie of the exit grammar", () => {
    // Playing past the sale into the red-team inversion means you DID NOT
    // SELL: surviving is not selling, and endCampaign reads only the
    // terminal beat — c-9's plain `win@25` selects the handoff. The exit
    // ending cannot be reached by merely outlasting Act III.
    const ending = endCampaign(report, getNode(report.finalGraph, report.finalNodeId));
    expect(ending.kind).toBe("quiet-handoff");
    expect(ending.title).toBe("The Quiet Handoff");
    expect(ending.evidence.medals).toBe(9);
    expect(ending.evidence.scars).toBe(0); // nine clean wins, no death testimony
    expect(ending.evidence.deathStopReason).toBeNull();
  });

  it("five campaign seeds: every beat wins on every offset, the exit carrier never flickers", { timeout: 600_000 }, () => {
    for (let off = 0; off < 5; off += 1) {
      const { graph, nodeId } = founder();
      const alt = runCampaign(CAMPAIGN_ACT_THREE, BASE_SEED, { graph, nodeId, authority, seedOffset: off });
      expect(alt.chapterRecords.map((r) => r.stopReason), `offset ${off}`).toEqual([
        "win@240", "win@60", "win@40", "win@40", "win@60", "win@240",
        "win:sell-accepted-above:0@60", "win@240", "win@25",
      ]);
    }
  });

  it("c-2 ratchet audit at the bridge: the do-nothing proof — zero hands, zero bounces, won on the clock", () => {
    const rebased = applyCarryToDoc(CHAPTER_AUTHORED_DOCS["the-quarter-that-ran-itself"]!, {
      openingCashMicroUsd: 300_000_000n, contractCasts: [], staffCast: [], scarCount: 0,
    });
    const r = runScenario(rebased, BASE_SEED, {});
    expect(r.outcome).toBe("won");
    expect(r.stopReason).toBe("win@60");
    expect(r.observation.intentsExecuted).toBe(0); // the win line GATES idleness
    expect(r.observation.bounces).toBe(0);
    expect(r.observation.deaths).toEqual([]);
  });

  it("c-7 acceptance census at the bridge ×5 seeds: [4,4,4,3,4] accepted — the win rides ≥1, never certainty", () => {
    // 9,500 bps is the ceiling, NOT 10,000 (ADR-0016 #11: acceptance is never
    // certain). Offset 3's single refusal is the dice honestly disagreeing —
    // and the count:0 win line still carries it. Recorded, never re-rolled.
    const rebased = applyCarryToDoc(CHAPTER_AUTHORED_DOCS["the-long-sale"]!, {
      openingCashMicroUsd: 300_000_000n, contractCasts: [], staffCast: [], scarCount: 0,
    });
    const census: [number, number][] = [];
    for (let off = 0; off < 5; off += 1) {
      const r = runScenario(rebased, BASE_SEED, { seedOffset: off });
      expect(r.stopReason, `offset ${off}`).toBe("win:sell-accepted-above:0@60");
      census.push([r.observation.sellVerdicts!.accepted, r.observation.sellVerdicts!.refused]);
    }
    expect(census).toEqual([[4, 0], [4, 0], [4, 0], [3, 1], [4, 0]]);
  });

  it("c-4 the floor-tech seat is LIVE: first campaign datacenter-tech — metal moves, the phone refuses", () => {
    const r = runScenario(CHAPTER_AUTHORED_DOCS["the-floor-and-aisle"]!, BASE_SEED, {});
    expect(r.outcome).toBe("won");
    expect(r.stopReason).toBe("win@40");
    expect(r.perspective?.id).toBe("datacenter-tech"); // armed via the seat row
    expect(r.observation.intentsExecutedByVerb).toEqual({ "connect-ports": 2, "place-device": 2 });
    expect(r.observation.intentsRefusedByVerb).toEqual({ communicate: 1 }); // LIVE perspective-forbids
    expect(r.observation.deaths).toEqual([]);
  });

  it("c-9 the inversion seat: zero bans armed, target breaks by design — 95 bounces graded as wins", () => {
    const r = runScenario(CHAPTER_AUTHORED_DOCS["red-team-friday"]!, BASE_SEED, {});
    expect(r.outcome).toBe("won");
    expect(r.stopReason).toBe("win@25");
    expect(r.perspective?.id).toBe("red-team-friday"); // the row is alive with NOTHING withheld
    expect(r.observation.bounces).toBe(95); // bounces-above:24 is strictly-greater — pinned per probe
    expect(r.observation.intentsExecuted).toBe(1); // the taunt lands; the seat never forbids
  });

  it("the homages never grade a corpse: deaths [] at the bridge (the §1.6 floor clause heals them)", () => {
    // The registry twins (metastable/ddos/free-tier-flood) churn-die cash-
    // independently at ~t44 with an empty book and no death lose-line; the
    // homages re-author the SAME fiction with two monthly accounts and pin
    // deaths [] — the corpse audit's roster law, executed as content.
    for (const id of ["the-metastable-window", "the-long-gradient", "the-institution-watch"]) {
      const rebased = applyCarryToDoc(CHAPTER_AUTHORED_DOCS[id]!, {
        openingCashMicroUsd: 300_000_000n, contractCasts: [], staffCast: [], scarCount: 0,
      });
      const r = runScenario(rebased, BASE_SEED, {});
      expect(r.outcome, id).toBe("won");
      expect(r.stopReason, id).toBe("win@240");
      expect(r.observation.deaths, id).toEqual([]);
      expect(r.cashEndMicroUsd, id).toBe(308_199_000n); // 300M bridge + two 5M invoices, dunning-quiet
    }
  });

  it("digest ×100 Set.size 1 + byte-equal twin over the nine-beat tour", { timeout: 600_000 }, () => {
    const digests = new Set<string>();
    for (let i = 0; i < 100; i += 1) digests.add(digestCampaignReport(report));
    expect(digests.size).toBe(1);
    expect(digestCampaignReport(run(CAMPAIGN_ACT_THREE))).toBe(digestCampaignReport(SHARED_ACT_THREE));
    expect(digestCampaignReport(report)).toBe("7f0853575030d719"); // run-captured 2026-10-18 (plain founder; self-derived, disclosed in commit body)
  });
});

/* ------------------------------------------------------------------ */
/* 8. FOUR-ARC CHAIN — the full tour on one real lineage graph          */
/* ------------------------------------------------------------------ */

describe("four-arc chain — thirty-two beats, one real lineage graph", () => {
  it("the Act II child walks all of Act III; every earlier digest byte-stands UNMOVED", { timeout: 900_000 }, () => {
    const first = run(CAMPAIGN_PROLOGUE);
    const second = runCampaign(CAMPAIGN_ACT_ONE, BASE_SEED, {
      graph: first.finalGraph, nodeId: first.finalNodeId, authority,
    });
    const graph = seedTestimony(second.finalGraph, second.finalNodeId, "pre-seed-arc2");
    const third = runCampaign(CAMPAIGN_ACT_TWO, BASE_SEED, { graph, nodeId: second.finalNodeId, authority });
    const fourth = runCampaign(CAMPAIGN_ACT_THREE, BASE_SEED, {
      graph: third.finalGraph, nodeId: third.finalNodeId, authority,
    });

    expect(digestCampaignReport(first)).toBe("28df3ca4e6c90977"); // UNMOVED by two acts of content
    expect(digestCampaignReport(second)).toBe("86595ae9b21853b3"); // UNMOVED
    expect(digestCampaignReport(third)).toBe("5f79eb776a0bafaf"); // wave-27 re-pin (identical construction to the three-arc test's third digest — per-arc digest scoping holds;
    // and the runner's exit-grammar edit moves NOTHING here: no beat before
    // Act III carries a sell-accepted-above win line, so every plain
    // `win@<minute>` stamp is byte-for-byte the string it always was.
    expect(digestCampaignReport(fourth)).toBe("739d411cd5329eb1"); // run-captured 2026-10-18, WAVE-27 tour re-pin (child node, self-derived)

    // The successor's full career: eight Act-II beats (wave-27), nine Act-III beats,
    // zero further edges — the tour never dies twice.
    expect(fourth.chapterRecords.map((r) => [r.nodeId, r.outcome, r.stopReason])).toEqual([
      [CHILD_ID, "won", "win@240"],
      [CHILD_ID, "won", "win@60"],
      [CHILD_ID, "won", "win@40"],
      [CHILD_ID, "won", "win@40"],
      [CHILD_ID, "won", "win@60"],
      [CHILD_ID, "won", "win@240"],
      [CHILD_ID, "won", "win:sell-accepted-above:0@60"],
      [CHILD_ID, "won", "win@240"],
      [CHILD_ID, "won", "win@25"],
    ]);
    expect(fourth.edgesSpawned).toHaveLength(0);
    expect(fourth.finalNodeId).toBe(CHILD_ID);
    // The parent's career is FROZEN at the obituary — Act III adds nothing.
    const parent = getNode(fourth.finalGraph, asEntityId("co"));
    expect(parent.museum).toHaveLength(15);
    expect(parent.medals.filter((m) => m.kind === "chapter-won")).toHaveLength(14);
    // The child closes the tour unsold: the handoff ending reads the SAME
    // terminal beat it always would (the exit still needs the carrier).
    const ending = endCampaign(fourth, getNode(fourth.finalGraph, fourth.finalNodeId));
    expect(ending.kind).toBe("quiet-handoff");
    expect(ending.evidence.medals).toBe(17); // b-5..b-12 + c-1..c-9
  });
});

/* ------------------------------------------------------------------ */
/* 6. THE EXIT ARC (L-V3, §E) — money at the end rides the chain        */
/* ------------------------------------------------------------------ */

describe("exit arc — money at the end rides the chain (§E, L-V3)", () => {
  // The HOST ARM the arc is designed for: a market catalog strictly ABOVE the
  // doc's own asks (plan 30M ask vs 40M market; sku 18M ask vs 24M). The
  // deviation math clamps to the 9_500 bps accept ceiling (RATIFIED ADR-0016
  // #11) — near-certain, never certain: the sale is still dice.
  const RATES: ReadonlyMap<string, ReadonlyMap<string, MoneyUnit>> = new Map([
    ["x-1-armed-close", new Map<string, MoneyUnit>([
      ["plan:long-sale", asMoney(40_000_000n)],
      ["sku:long-sale-b", asMoney(24_000_000n)],
    ])],
  ]);
  function runArc(seedOffset: number, armed: boolean = true): CampaignReport {
    const { graph, nodeId } = founder();
    return runCampaign(CAMPAIGN_EXIT, BASE_SEED, {
      graph: seedTestimony(graph, nodeId),
      nodeId,
      authority,
      seedOffset,
      ...(armed ? { sellMarketRates: RATES } : {}),
    });
  }
  /** One shared armed traversal (≈150 engine ticks across both beats). */
  const SHARED_EXIT = runArc(0);

  it("roster shape: the Exit is the fifth arc; the c-7 shipped row stays key-absent", () => {
    expect(CAMPAIGN_ROSTER).toHaveLength(5);
    expect(CAMPAIGN_ROSTER[4]!.id).toBe("exit-the-heir-opens");
    expect(CAMPAIGN_EXIT.chapters.map((c) => [c.chapterId, c.scenarioId, c.exitKind ?? null])).toEqual([
      ["x-1-armed-close", "the-long-sale", "strategic-acquisition"],
      ["x-2-heir-opens", "the-quarter-that-ran-itself", null],
    ]);
    // c-7 — the sibling beat whose doc x-1 re-uses — must NOT grow the key:
    // the declaration lives on the CAMPAIGN row, the scenario doc is untouched.
    const c7 = CAMPAIGN_ACT_THREE.chapters.find((c) => c.chapterId === "c-7-long-sale")!;
    expect("exitKind" in c7).toBe(false);
  });

  it("the PAID close: exit edge with slice, gift FORCED null, heir plays on", { timeout: 600_000 }, () => {
    const r = SHARED_EXIT;
    expect(r.campaignId).toBe("exit-the-heir-opens");
    expect(r.chapterRecords.map((x) => [x.nodeId, x.chapterId, x.outcome, x.stopReason])).toEqual([
      ["co", "x-1-armed-close", "won", "win:sell-accepted-above:0@60"],
      ["successor:exit-the-heir-opens:0", "x-2-heir-opens", "won", "win@60"],
    ]);
    // The declaring record carries the sparse stamp; the heir's stays absent.
    expect(r.chapterRecords[0]!.exitKind).toBe("strategic-acquisition");
    expect("exitKind" in r.chapterRecords[1]!).toBe(false);
    expect(r.edgesSpawned).toHaveLength(1);
    const edge = r.edgesSpawned[0]!;
    expect(edge.type).toBe("exit");
    // Money at the end, machine-pinned (run-captured 2026-10-18): the edge
    // carries a 24M µ$ cash slice — headline 48M (both books accepted at
    // their final offers) × diligence product floored at 5_000 bps
    // (concentration 7500 / reputation 9000 / term-coverage 5000 legs) ×
    // strategic-acquisition's kind factor 10_000.
    expect(edge.manifest.cashSliceMicroUsd).toBe(24_000_000n);
    // A PAID heir takes no gift: lineage refuses a failure-only unlock on an
    // exit edge, so the 4th testimony node n-4-style milestone NEVER rides.
    expect(edge.manifest.failureOnlyUnlock).toBeNull();
    expect(edge.manifest.keptNodes).toEqual([asEntityId("cdn-edge"), asEntityId("rack-a"), asEntityId("rack-b")]);
    expect(edge.manifest.doctrine.id).toBe(asEntityId("doctrine:unwritten:exit-the-heir-opens"));
    expect(edge.preservedMuseumExhibitIds).toEqual(["chapter:exit-the-heir-opens:x-1-armed-close:0"]);
    // Play-on: x-2 runs on the HEIR node and bootstraps the manifest exactly
    // once — the 3-node law applies to exit spawns (testimony founder).
    const heir = getNode(r.finalGraph, r.finalNodeId);
    expect(heir.identity.name).toBe("Successor of First Light Inc");
    expect(heir.parentId).toBe(asEntityId("co"));
    expect(heir.nodesUnlocked.map((u) => `${u.node}:${u.via}`)).toEqual([
      "cdn-edge:testimony", "rack-a:testimony", "rack-b:testimony",
    ]);
    expect(r.chapterRecords[1]!.bootstrapped).toBe(true);
    expect(childManifestSpent(heir)).toBe(true);
  });

  it("the exitFunded law at arc scale: the heir opens on the PROCEEDS, never the bridge", { timeout: 600_000 }, () => {
    const r = SHARED_EXIT;
    const slice = r.edgesSpawned[0]!.manifest.cashSliceMicroUsd!;
    const x2 = r.chapterRecords[1]!;
    // The discovered trap, made falsifiable: the slice (24M) sits FAR below
    // the bridge (300M) and far below the threshold — under the pre-§E carry
    // law x-2 opened RICHER than the sale paid, on a 300M phantom, and the
    // exit heir was indistinguishable from a failure heir. The law now
    // exempts the paid heir: cashStart is the slice VERBATIM.
    expect(x2.cashStartMicroUsd).toBe(slice);
    expect(x2.cashStartMicroUsd).toBe(24_000_000n);
    expect(Number(x2.cashStartMicroUsd)).toBeLessThan(Number(CAMPAIGN_EXIT.carry.cashFloor.bridgeMicroUsd));
    // The heir's settled career money is x-2's OWN cashEnd — it ran its
    // chapter on the proceeds, and the ledger closes on them (not on bridge
    // scale: 28,099,500 µ$ is nowhere near 300M arithmetic).
    expect(getNode(r.finalGraph, r.finalNodeId).finances.cashMicroUsd).toBe(x2.cashEndMicroUsd);
    expect(x2.cashEndMicroUsd).toBe(28_099_500n);
  });

  it("x-1 census x5 (armed): the sale is dice — offset 2 books one refusal and a PAID 15M", { timeout: 900_000 }, () => {
    // Run-captured 2026-10-18 witnesses. Per offset: exit edge slice (the
    // ONLY sale number the chain record surfaces), the heir's opening (law:
    // it EQUALS the slice on every seed), x-2's settled close, and the arc
    // digest. Offset 2 is the honest scar: the sku's SECOND offer refuses,
    // the headline shrinks to 30M and the slice to 15M — the heir opens
    // smaller, still PAID, and x-2 still wins.
    const LEDGER: readonly (readonly [string, string, string, string])[] = [
      ["24000000", "24000000", "28099500", "b4f7777519ebc0a8"],
      ["24000000", "24000000", "32199000", "41109fcf67c40ec3"],
      ["15000000", "15000000", "23199000", "fb7ab9bd3bfac7ca"],
      ["24000000", "24000000", "32199000", "6598a67ebcf6cb9d"],
      ["24000000", "24000000", "28099500", "88dbd147c1d13d41"],
    ];
    for (let off = 0; off < 5; off += 1) {
      const r = runArc(off);
      expect(r.chapterRecords[0]!.stopReason, `offset ${off}`).toBe("win:sell-accepted-above:0@60");
      expect(r.chapterRecords[0]!.cashEndMicroUsd, `offset ${off}`).toBe(69_372_000n);
      expect(r.edgesSpawned[0]!.manifest.cashSliceMicroUsd, `offset ${off}`).toBe(BigInt(LEDGER[off]![0]));
      expect(r.chapterRecords[1]!.cashStartMicroUsd, `offset ${off}`).toBe(BigInt(LEDGER[off]![1]));
      expect(r.chapterRecords[1]!.stopReason, `offset ${off}`).toBe("win@60");
      expect(r.chapterRecords[1]!.cashEndMicroUsd, `offset ${off}`).toBe(BigInt(LEDGER[off]![2]));
      expect(digestCampaignReport(r), `offset ${off}`).toBe(LEDGER[off]![3]);
    }
    // The verdict censuses themselves ride the observation rail (a direct
    // scenario repro at each chapter seed — the chain record is the
    // digest-bearing surface; the census is the disclosure).
    const CENSUS: readonly (readonly [number, number])[] = [[4, 0], [4, 0], [3, 1], [4, 0], [4, 0]];
    const heads: readonly string[] = ["48000000", "48000000", "30000000", "48000000", "48000000"];
    for (let off = 0; off < 5; off += 1) {
      const r = runArc(off);
      const repro = runScenario(resolveChapterDoc("the-long-sale"), r.chapterRecords[0]!.runSeed, {
        sellMarketRates: RATES.get("x-1-armed-close")!,
        exitDeclaration: { exitKind: "strategic-acquisition" },
      });
      expect(repro.observation.sellVerdicts, `offset ${off}`).toEqual({ accepted: CENSUS[off]![0], refused: CENSUS[off]![1] });
      expect(`${repro.exitPayout!.headlineOfferMicroUsd}`, `offset ${off}`).toBe(heads[off]);
    }
  });

  it("the arm at THESE rates is digest-identical to unarmed x5 — disclosed honestly", { timeout: 900_000 }, () => {
    // At 30M/18M asks both anchors (50M/30M authored, 40M/24M catalog) put
    // the deviation past the 9_500 bps ceiling clamp, and the sell roll
    // stream does not read the anchor — so the armed and unarmed censuses
    // coincide on every one of the five offsets. The host arm's bite is at
    // the CONFIG and ANCHOR level (chain.test.ts pins the config spread; the
    // catalog overrides the mrc anchor the verdict is priced against); a
    // catalog WITHIN the ladder band would move the census. This pin exists
    // so a future lane cannot claim this witness proves more than it does.
    for (let off = 0; off < 5; off += 1) {
      expect(digestCampaignReport(runArc(off, false)), `offset ${off}`).toBe(digestCampaignReport(runArc(off, true)));
    }
  });

  it("digest x100 Set.size 1 + byte-equal twin + the pinned arc digest", { timeout: 900_000 }, () => {
    const digests = new Set<string>();
    for (let i = 0; i < 100; i += 1) digests.add(digestCampaignReport(SHARED_EXIT));
    expect(digests.size).toBe(1);
    expect(digestCampaignReport(runArc(0))).toBe(digestCampaignReport(SHARED_EXIT));
    expect(digestCampaignReport(SHARED_EXIT)).toBe("b4f7777519ebc0a8"); // run-captured 2026-10-18 (self-derived, armed posture)
  });

  it("endCampaign answers for the whole arc: the paid mid-chain declaration is TRUTH", { timeout: 600_000 }, () => {
    // The §E walk sees x-1's declared close — won on the sell-accepted
    // grammar — and passes it as the paid-heir truth. The TERMINAL (x-2)
    // never declared, so the readout narrates the ordinary handoff and the
    // exit evidence keys stay ABSENT: a mid-chain declaration validates,
    // it does not narrate (the ending is still the tour's last word).
    const ending = endCampaign(SHARED_EXIT, getNode(SHARED_EXIT.finalGraph, SHARED_EXIT.finalNodeId), CAMPAIGN_EXIT);
    expect(ending.kind).toBe("quiet-handoff");
    expect("declaredExitKind" in ending.evidence).toBe(false);
    expect("exitObserved" in ending.evidence).toBe(false);
  });

  it("LIVE falsifier: a declaring chapter that never reaches its sale answers for itself (early-halt walk)", { timeout: 600_000 }, () => {
    // Tick-cap the declaring chapter below its sale clock: x-1 TIMES OUT at
    // t30, the tour halts there (a timeout is an ending, not a death — no
    // edge), and the doc's FINAL chapter never played. The terminal check
    // looks at x-2 (undeclared) and stays silent — the per-chapter walk
    // judges the terminal record of a MID-chain declaration and throws,
    // NAMING the chapter. Pre-§E this exact hole was the slice(0,-1) trim.
    const haltDoc = parseCampaignDoc({
      schema: "hh-campaign@1",
      id: "exit-arc-halt-test",
      name: "The Exit That Was Not",
      chapters: [
        { chapterId: "x-1-armed-close", scenarioId: "the-long-sale", tickCap: 30, exitKind: "strategic-acquisition" },
        { chapterId: "x-2-heir-opens", scenarioId: "the-quarter-that-ran-itself" },
      ],
      carry: CAMPAIGN_EXIT.carry,
    });
    const { graph, nodeId } = founder();
    const r = runCampaign(haltDoc, BASE_SEED, { graph: seedTestimony(graph, nodeId), nodeId, authority, sellMarketRates: RATES });
    expect(r.chapterRecords).toHaveLength(1);
    expect(r.chapterRecords[0]!.stopReason).toBe("timeout@30");
    expect(r.edgesSpawned).toHaveLength(0); // a timeout is not a paid close — no exit edge
    expect(() => endCampaign(r, getNode(r.finalGraph, r.finalNodeId), haltDoc)).toThrow(
      /^campaign: DOC_LIE at 'campaign "exit-arc-halt-test" chapter "x-1-armed-close"': the doc declares "strategic-acquisition" but the simulation closed on "timeout@30" — endings are observed, not authored$/,
    );
  });
});
