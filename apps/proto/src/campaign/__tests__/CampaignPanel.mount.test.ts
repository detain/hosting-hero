/**
 * CampaignPanel mount laws (jsdom, real engine, stubbed storage): the roster
 * renders the six arcs with honest NEXT/LOCKED/PLAYED states; playing the
 * prologue through the REAL chain updates the ledger, chapter rows and the
 * ending banner; Save now writes a named slot, and a fresh panel instance
 * LOADING that slot resumes at Act One with the prologue's ledger and
 * ending intact; the overwrite law is a two-step confirm, never silent; a
 * corrupt slot lists honestly with a disabled Load.
 *
 * The prologue measures ~60ms of synchronous engine — cheap enough to play
 * for real in a mount test; nothing here mocks the chain.
 */
// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import CampaignPanel from "../CampaignPanel.vue";
import { SAVE_KEY_PREFIX } from "../../storage/saveSlots";
import { createCampaignState, playArc } from "../../campaign/campaignModel";
import { campaignSaveText } from "../../campaign/campaignModel";
import type { SlotStorage } from "../../storage/saveSlots";

function mapStorage(seed?: Map<string, string>): SlotStorage & { map: Map<string, string> } {
  const map = seed ?? new Map<string, string>();
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

/** Real-timers poll: the panel yields with setTimeout(0) around the sync
 *  chain; await-until-present is the established mount-test idiom. */
async function untilPresent(
  fn: () => boolean,
  budgetMs = 20_000,
): Promise<void> {
  const started = Date.now();
  for (;;) {
    if (fn()) return;
    if (Date.now() - started > budgetMs) throw new Error("poller budget exceeded");
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

beforeEach(() => {
  // the panel's OWN storage arrives via props; the environment's stays clean
  globalThis.localStorage?.clear();
});

describe("CampaignPanel — the roster renders", () => {
  it("six arc rows; the prologue is NEXT (playable), the rest LOCKED (disabled buttons)", () => {
    const w = mount(CampaignPanel, { props: { storage: mapStorage() } });
    expect(w.findAll('[data-test^="camp-arc-"]')).toHaveLength(6);
    expect(w.get('[data-test="camp-status-prologue-first-light"]').text()).toContain("NEXT");
    expect(w.get('[data-test="camp-status-finale-growth-death"]').text()).toContain("LOCKED");
    expect(w.get('[data-test="camp-play-act-one-panic-to-process"]').attributes("disabled")).toBeDefined();
    expect(w.get('[data-test="camp-play-prologue-first-light"]').attributes("disabled")).toBeUndefined();
  });

  it("Save is honest-disabled before a slot name exists, and slots start empty", () => {
    const w = mount(CampaignPanel, { props: { storage: mapStorage() } });
    expect(w.get('[data-test="camp-save"]').attributes("disabled")).toBeDefined();
    expect(w.find('[data-test="camp-slot-list"]').exists()).toBe(false);
    expect(w.find('[data-test="camp-slot-empty"]').exists()).toBe(true);
  });
});

describe("CampaignPanel — real play through the UI", () => {
  it("playing the prologue lands chapter rows, the Quiet Handoff banner, and Act One as the new NEXT", async () => {
    const w = mount(CampaignPanel, { props: { storage: mapStorage() } });
    await w.get('[data-test="camp-play-prologue-first-light"]').trigger("click");
    await untilPresent(() => w.find('[data-test="camp-ending"]').exists());

    expect(w.get('[data-test="camp-ending-kind"]').text()).toContain("quiet-handoff");
    expect(w.get('[data-test="camp-ending-title"]').text()).toContain("The Quiet Handoff");
    expect(w.findAll('[data-test^="camp-chapter-row-"]')).toHaveLength(3);
    expect(w.get('[data-test="camp-status-prologue-first-light"]').text()).toContain("PLAYED");
    expect(w.get('[data-test="camp-status-act-one-panic-to-process"]').text()).toContain("NEXT");
    expect(w.get('[data-test="camp-ledger"]').text()).toContain("1/6 careers carried");
    w.unmount();
  });

  it("Save now → slot listed with REAL summary; a fresh panel loads it and resumes at Act One", async () => {
    const storage = mapStorage();
    const w = mount(CampaignPanel, { props: { storage } });
    await w.get('[data-test="camp-play-prologue-first-light"]').trigger("click");
    await untilPresent(() => w.find('[data-test="camp-ending"]').exists());

    await w.get('[data-test="camp-slot-name"]').setValue("first-quarter");
    expect(w.find('[data-test="camp-save-confirm"]').exists()).toBe(false);
    await w.get('[data-test="camp-save"]').trigger("click");
    await untilPresent(() => w.find('[data-test="camp-slot-row-first-quarter"]').exists());
    expect(storage.map.has(SAVE_KEY_PREFIX + "first-quarter")).toBe(true);
    w.unmount();

    // a DIFFERENT panel over the same storage loads the carried company
    const w2 = mount(CampaignPanel, { props: { storage } });
    await w2.get('[data-test="camp-slot-load-first-quarter"]').trigger("click");
    await untilPresent(() => w2.get('[data-test="camp-ledger"]').text().includes("1/6"));
    expect(w2.get('[data-test="camp-status-prologue-first-light"]').text()).toContain("PLAYED");
    expect(w2.get('[data-test="camp-ending-kind"]').text()).toContain("quiet-handoff");
    expect(w2.get('[data-test="camp-slot-load-first-quarter"]').attributes("disabled")).toBeUndefined();
    w2.unmount();
  });

  it("overwrite is a two-step confirm and never silent", async () => {
    const storage = mapStorage();
    const playedText = campaignSaveText(playArc(createCampaignState(), "prologue-first-light").state);
    const emptyText = campaignSaveText(createCampaignState());
    storage.setItem(SAVE_KEY_PREFIX + "held", emptyText);
    const w = mount(CampaignPanel, { props: { storage } });
    await w.get('[data-test="camp-play-prologue-first-light"]').trigger("click");
    await untilPresent(() => w.find('[data-test="camp-ending"]').exists());

    await w.get('[data-test="camp-slot-name"]').setValue("held");
    await w.get('[data-test="camp-save"]').trigger("click");
    // first click: the confirm gesture surfaces, bytes UNTOUCHED
    expect(w.find('[data-test="camp-save-confirm"]').exists()).toBe(true);
    expect(storage.map.get(SAVE_KEY_PREFIX + "held")).toBe(emptyText);
    // second click (same name): the replace is the player's confirmed act
    await w.get('[data-test="camp-save-confirm"]').trigger("click");
    await untilPresent(() => storage.map.get(SAVE_KEY_PREFIX + "held") === playedText);
    expect(w.find('[data-test="camp-save-confirm"]').exists()).toBe(false);
    w.unmount();
  });

  it("a corrupt slot is listed with an honest disabled Load", async () => {
    const storage = mapStorage();
    storage.setItem(SAVE_KEY_PREFIX + "torn", "{ not long-save text");
    const w = mount(CampaignPanel, { props: { storage } });
    await untilPresent(() => w.find('[data-test="camp-slot-row-torn"]').exists());
    expect(w.get('[data-test="camp-slot-load-torn"]').attributes("disabled")).toBeDefined();
    expect(w.get('[data-test="camp-slot-row-torn"]').text()).toContain("unparseable");
    w.unmount();
  });
});
