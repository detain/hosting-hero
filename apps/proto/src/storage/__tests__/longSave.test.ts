/**
 * The long-save codec seam: serialize → restore → RE-SERIALIZE identity on a
 * REAL engine-shaped fixture (a played prologue career through the model's
 * own chain), digest equality across the round-trip, strict mark parsing at
 * the boundary, and honest rejections of forged marks. NO hex goldens — the
 * law is roundtrip equality, never a pinned literal.
 */
import { describe, expect, it } from "vitest";
import { createCampaignState, playArc } from "../../campaign/campaignModel";
import {
  CampaignSaveError,
  digestCampaignSave,
  parseCampaignRunMark,
  restoreCampaignSave,
  serializeCampaignSave,
} from "../longSave";

function playedPrologueFixture() {
  const state = createCampaignState();
  return playArc(state, "prologue-first-light").state;
}

describe("longSave — canonical round-trip (engine codec, equality law)", () => {
  it("serialize → restore → re-serialize is TEXT-IDENTICAL and digest-equal", () => {
    const played = playedPrologueFixture();
    const text = serializeCampaignSave(played.graph, played.marks);
    const back = restoreCampaignSave(text);
    expect(back.marks).toEqual(played.marks);
    const again = serializeCampaignSave(back.graph, back.marks);
    expect(again).toBe(text);
    expect(digestCampaignSave(again)).toBe(digestCampaignSave(text));
  });

  it("marks revive bigint committedAtTick (canonical $i) — the round-trip is not string-lossy", () => {
    const played = playedPrologueFixture();
    const text = serializeCampaignSave(played.graph, played.marks);
    const back = restoreCampaignSave(text);
    expect(typeof back.marks[0]?.committedAtTick).toBe("bigint");
    expect(back.marks.map((m) => m.committedAtTick)).toEqual(played.marks.map((m) => m.committedAtTick));
  });

  it("the carried graph survives the wire: node count and roots match after restore", () => {
    const played = playedPrologueFixture();
    const text = serializeCampaignSave(played.graph, played.marks);
    const { graph } = restoreCampaignSave(text);
    expect(graph.nodes.size).toBe(played.graph.nodes.size);
    expect(graph.roots).toEqual(played.graph.roots);
  });

  it("an empty carried state still round-trips (composeLongSave allows zero runs)", () => {
    const fresh = createCampaignState();
    const text = serializeCampaignSave(fresh.graph, fresh.marks);
    const back = restoreCampaignSave(text);
    expect(back.marks).toEqual([]);
    expect(back.graph.nodes.size).toBe(0);
  });

  it("garbage text fails LOUD (engine SaveError or CampaignSaveError, never a silent null)", () => {
    expect(() => restoreCampaignSave("not-json")).toThrow();
    expect(() => restoreCampaignSave('{"schemaVersion":1}')).toThrow();
  });
});

describe("longSave — strict mark wall (the opaque-bundle guard)", () => {
  const honest = () => {
    const played = playedPrologueFixture();
    return { ...played.marks[0]! };
  };

  it("a mark with an unknown key is refused by name", () => {
    const forged = { ...honest(), smuggled: true };
    expect(() => parseCampaignRunMark(forged, "test")).toThrow(CampaignSaveError);
    expect(() => parseCampaignRunMark(forged, "test")).toThrow(/unknown key "smuggled"/);
  });

  it("an outcome off-vocab is refused", () => {
    const forged = { ...honest(), outcome: "ascended" };
    expect(() => parseCampaignRunMark(forged, "test")).toThrow(/outcome "ascended" off-vocab/);
  });

  it("a committedAtTick that did not arrive as bigint is refused", () => {
    const forged = { ...honest(), committedAtTick: "17" };
    expect(() => parseCampaignRunMark(forged, "test")).toThrow(/committedAtTick/);
  });

  it("an ending snapshot with an off-vocab kind is refused", () => {
    const base = honest();
    const forged = {
      ...base,
      ending: {
        kind: "retirement-cruise",
        title: "x",
        epitaph: "y",
        deathStopReason: null,
        medals: 0,
        scars: 0,
        chapterOutcomes: [],
      },
    };
    expect(() => parseCampaignRunMark(forged, "test")).toThrow(/kind/);
  });

  it("the arc's LAST mark carries the ending snapshot; the earlier ones never do", () => {
    const played = playedPrologueFixture();
    const last = played.marks[played.marks.length - 1];
    expect(last?.ending?.kind).toBe("quiet-handoff");
    expect(played.marks.slice(0, -1).every((m) => m.ending === undefined)).toBe(true);
  });
});
