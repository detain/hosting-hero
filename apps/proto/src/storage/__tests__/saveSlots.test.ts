/**
 * saveSlots laws over a Map-backed double of the Storage port: names are
 * validated at the boundary, overwriting a live slot REFUSES without the
 * explicit overwrite flag (and leaves the stored bytes untouched), the list
 * is deterministic, corrupt slots are honest DATA (listed corrupt, load
 * disabled — never a thrown listing), and summaries read real campaign
 * marks produced by the model + codec.
 */
import { describe, expect, it } from "vitest";
import { createCampaignState, playArc, ROSTER_ARC_IDS, campaignSaveText } from "../../campaign/campaignModel";
import {
  SAVE_KEY_PREFIX,
  SaveSlotError,
  listSlotNames,
  listSlots,
  normalizeSlotName,
  readCampaignSave,
  writeCampaignSave,
} from "../saveSlots";
import type { SlotStorage } from "../saveSlots";

function mapStorage(): SlotStorage & { map: Map<string, string> } {
  const map = new Map<string, string>();
  return {
    map,
    get length() {
      return map.size;
    },
    key: (index: number) => [...map.keys()][index] ?? null,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
    removeItem: (k: string) => {
      map.delete(k);
    },
  };
}

describe("saveSlots — name wall", () => {
  it("trims, and refuses empty / over-long / control-character names fail-loud", () => {
    expect(normalizeSlotName("  The Long Save  ")).toBe("The Long Save");
    expect(() => normalizeSlotName("   ")).toThrow(SaveSlotError);
    expect(() => normalizeSlotName("x".repeat(41))).toThrow(/cap is 40/);
    // eslint-disable-next-line no-control-regex
    expect(() => normalizeSlotName("bad\u0001name")).toThrow(/control characters/);
  });
});

describe("saveSlots — write laws", () => {
  it("first write lands; a second write over a LIVE slot refuses without overwrite", () => {
    const storage = mapStorage();
    writeCampaignSave(storage, "alpha", "TEXT-A");
    expect(storage.map.get(SAVE_KEY_PREFIX + "alpha")).toBe("TEXT-A");
    expect(() => writeCampaignSave(storage, "alpha", "TEXT-B")).toThrow(/already holds a save/);
    // the refusal left the payload UNTOUCHED — the no-silent-overwrite law
    expect(storage.map.get(SAVE_KEY_PREFIX + "alpha")).toBe("TEXT-A");
    writeCampaignSave(storage, "alpha", "TEXT-B", { overwrite: true });
    expect(storage.map.get(SAVE_KEY_PREFIX + "alpha")).toBe("TEXT-B");
  });

  it("non-campaign keys in the same storage are invisible to the listing", () => {
    const storage = mapStorage();
    storage.setItem("some-other-app:key", "x");
    writeCampaignSave(storage, "only-slot", "TEXT");
    expect(listSlotNames(storage)).toEqual(["only-slot"]);
  });

  it("the listing is code-unit sorted", () => {
    const storage = mapStorage();
    writeCampaignSave(storage, "zeta", "1");
    writeCampaignSave(storage, "Alpha", "2");
    writeCampaignSave(storage, "mid", "3");
    expect(listSlotNames(storage)).toEqual(["Alpha", "mid", "zeta"]); // uppercase sorts first (code-unit)
  });
});

describe("saveSlots — summaries read REAL campaign saves", () => {
  it("a played prologue's text lists arcs, chapters, and the ending kind", () => {
    const storage = mapStorage();
    const played = playArc(createCampaignState(), ROSTER_ARC_IDS[0]!).state;
    writeCampaignSave(storage, "quarter-one", campaignSaveText(played));
    const [slot] = listSlots(storage, ROSTER_ARC_IDS);
    expect(slot).toMatchObject({
      name: "quarter-one",
      resumable: true,
      corrupt: false,
      playedArcIds: ["prologue-first-light"],
      chaptersPlayed: 3,
      lastEndingKind: "quiet-handoff",
    });
  });

  it("a corrupt slot is listed honestly (resumable=false), never thrown out of the list", () => {
    const storage = mapStorage();
    writeCampaignSave(storage, "torn", "{ this is not canonical long-save text");
    const slots = listSlots(storage, ROSTER_ARC_IDS);
    expect(slots).toHaveLength(1);
    expect(slots[0]).toMatchObject({ name: "torn", resumable: false, corrupt: true, chaptersPlayed: 0 });
  });

  it("a well-formed save with a forged mark key is corrupt FOR US", () => {
    const storage = mapStorage();
    const played = playArc(createCampaignState(), ROSTER_ARC_IDS[0]!).state;
    // canonical long-save TEXT (schema-valid end to end) with one mark key
    // renamed — the strict wall in restoreCampaignSave must catch it.
    const text = campaignSaveText(played).replace('"arcId"', '"arc_Id"');
    writeCampaignSave(storage, "forged", text);
    const [slot] = listSlots(storage, ROSTER_ARC_IDS);
    expect(slot?.corrupt).toBe(true);
  });

  it("read returns the raw canonical text and null for an absent slot", () => {
    const storage = mapStorage();
    expect(readCampaignSave(storage, "ghost")).toBeNull();
    writeCampaignSave(storage, "kept", "PAYLOAD");
    expect(readCampaignSave(storage, " kept ")).toBe("PAYLOAD"); // name normalization on read too
  });
});
