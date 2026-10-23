/**
 * campaignModel laws: the roster view is the engine roster (6 arcs, 35
 * chapters, exact per-arc counts), sequential-linear play is enforced
 * fail-loud at the seam, each arc REAL play produces chapter rows whose
 * stopReasons are the objective-fold terminal lines, the finale career
 * reaches the LIVE obituary (CAMPAIGN_FINALE @becf2a2 — the whole point of
 * the wave), and the carried state survives serialize → restore and keeps
 * PLAYING from the loaded company (resumption is not decoration).
 *
 * No hex goldens anywhere: digests are compared to each other across
 * round-trips, never to pinned literals.
 */
import { describe, expect, it } from "vitest";
import {
  CAMPAIGN_ARCS,
  ROSTER_ARC_IDS,
  arcLockReason,
  campaignSaveText,
  campaignStateFromSave,
  createCampaignState,
  isRosterComplete,
  nextArcId,
  playArc,
} from "../campaignModel";

describe("campaignModel — roster view", () => {
  it("six arcs, thirty-five chapters, roster order", () => {
    expect(ROSTER_ARC_IDS).toHaveLength(6);
    expect(CAMPAIGN_ARCS.map((a) => a.chapters.length)).toEqual([3, 8, 12, 9, 2, 1]);
    expect(CAMPAIGN_ARCS.reduce((sum, a) => sum + a.chapters.length, 0)).toBe(35);
  });

  it("every chapter view carries its scenarioId + archetype (engine meta map)", () => {
    for (const arc of CAMPAIGN_ARCS) {
      for (const ch of arc.chapters) {
        expect(ch.scenarioId.length).toBeGreaterThan(0);
        expect(ch.archetype).not.toBe("—"); // the merged meta map covers all 35
      }
    }
  });
});

describe("campaignModel — the linear law", () => {
  it("a fresh campaign opens at the prologue; everything else is locked", () => {
    const state = createCampaignState();
    expect(nextArcId(state)).toBe("prologue-first-light");
    expect(arcLockReason(state, "prologue-first-light")).toBeNull();
    expect(arcLockReason(state, "act-one-panic-to-process")).toBe("locked");
    expect(arcLockReason(state, "finale-growth-death")).toBe("locked");
    expect(isRosterComplete(state)).toBe(false);
  });

  it("playing an off-next arc THROWS fail-loud at the seam (no silent skip)", () => {
    const state = createCampaignState();
    expect(() => playArc(state, "finale-growth-death")).toThrow(/campaign-play\[locked\]/);
    expect(() => playArc(state, "not-an-arc")).toThrow(/campaign-play\[locked\]|unknown-arc/);
  });

  it("a played arc never replays: it reports PLAYED and refuses at the seam", async () => {
    const result = playArc(createCampaignState(), "prologue-first-light");
    expect(arcLockReason(result.state, "prologue-first-light")).toBe("played");
    expect(() => playArc(result.state, "prologue-first-light")).toThrow(/already in the ledger/);
  }, 30_000);
});

describe("campaignModel — one REAL career", () => {
  const played = playArc(createCampaignState(), "prologue-first-light");

  it("three chapter rows, all WON, each with the verbatim terminal line", () => {
    expect(played.chapters.map((c) => c.outcome)).toEqual(["won", "won", "won"]);
    for (const row of played.chapters) {
      expect(row.stopReason.length).toBeGreaterThan(0);
    }
    // the arc's terminal line is the objective-fold win grammar
    expect(played.chapters[played.chapters.length - 1]?.stopReason).toMatch(/^win@/);
  });

  it("a won-without-payout arc spawns no heir lines and ends The Quiet Handoff", () => {
    expect(played.heirLines).toBe(0); // chain law: edges spawn on payout/death only
    expect(played.ending.kind).toBe("quiet-handoff");
    expect(played.ending.title).toBe("The Quiet Handoff");
  });

  it("the state advances: prologue ledgered, Act One is the new NEXT", () => {
    expect(played.state.playedArcIds).toEqual(["prologue-first-light"]);
    expect(nextArcId(played.state)).toBe("act-one-panic-to-process");
    expect(played.state.marks).toHaveLength(3);
    expect(played.state.lastEnding?.kind).toBe("quiet-handoff");
    // one career founder node carried inside the graph (the company itself)
    expect(played.state.graph.nodes.size).toBe(1);
  });
});

describe("campaignModel — save resumes PLAY, not just the ledger", () => {
  it("serialize → restore re-serializes identical text and keeps the exact marks", () => {
    const played = playArc(createCampaignState(), "prologue-first-light").state;
    const text = campaignSaveText(played);
    const loaded = campaignStateFromSave(text);
    expect(loaded.playedArcIds).toEqual(played.playedArcIds);
    expect(loaded.marks).toEqual(played.marks);
    expect(loaded.lastEnding).toEqual(played.lastEnding);
    expect(campaignSaveText(loaded)).toBe(text);
  });

  it("the loaded company plays its NEXT arc (resumption is real)", async () => {
    const played = playArc(createCampaignState(), "prologue-first-light").state;
    const loaded = campaignStateFromSave(campaignSaveText(played));
    const second = playArc(loaded, "act-one-panic-to-process");
    expect(second.state.playedArcIds).toEqual(["prologue-first-light", "act-one-panic-to-process"]);
    expect(second.state.graph.nodes.size).toBeGreaterThanOrEqual(2); // two careers carried
  }, 30_000);

  it(
    "a forged mark ORDER (arcs out of roster sequence) is refused fail-loud on load",
    async () => {
      const twoArcs = playArc(
        playArc(createCampaignState(), "prologue-first-light").state,
        "act-one-panic-to-process",
      ).state;
      const swapped = [...twoArcs.marks].reverse(); // Act One refs now lead
      const text = campaignSaveText({ ...twoArcs, marks: swapped });
      expect(() => campaignStateFromSave(text)).toThrow(/not-sequential/);
    },
    30_000,
  );
});

describe("campaignModel — the full roster to the OBITUARY", () => {
  it(
    "all six careers play in order; the finale career loses by construction and endCampaign reads OBITUARY LIVE; the loaded roster survives with it",
    async () => {
      let state = createCampaignState();
      for (const arcId of ROSTER_ARC_IDS.slice(0, -1)) {
        state = playArc(state, arcId).state;
      }
      expect(nextArcId(state)).toBe("finale-growth-death");
      const finale = playArc(state, "finale-growth-death");
      // engine law: f-1-growth-death dies by construction (float-insolvent
      // dissolution as the LAST chapter of the LAST arc → no heir → terminal)
      expect(finale.chapters.map((c) => c.outcome)).toEqual(["lost"]);
      expect(finale.chapters[0]?.stopReason).toMatch(/^lose:death-by-cause:any@/);
      expect(finale.ending.kind).toBe("obituary");
      expect(finale.ending.title).toBe("The Obituary");
      expect(finale.ending.evidence.deathStopReason).toMatch(/^lose:death-by-cause:any@/);
      state = finale.state;
      expect(isRosterComplete(state)).toBe(true);
      expect(nextArcId(state)).toBeNull();

      // and the OBITUARY is persistence-truth: save → load keeps it (the
      // ending snapshot rode the last mark, not a re-forged report)
      const loaded = campaignStateFromSave(campaignSaveText(state));
      expect(loaded.lastEnding?.kind).toBe("obituary");
      expect(loaded.lastEnding?.deathStopReason).toBe(finale.ending.evidence.deathStopReason);
      expect(campaignSaveText(loaded)).toBe(campaignSaveText(state));
    },
    120_000,
  );
});
