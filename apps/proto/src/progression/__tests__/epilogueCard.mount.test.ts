// @vitest-environment jsdom
/**
 * EpilogueCard mount law — the card renders every §1.6 ending kind from
 * plain-data props, keeps the money legs honest, and (house determinism
 * law) touches ZERO timers end-to-end. Fixtures mirror the unit-test
 * shapes: real engine types, zero fabricated fields.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import EpilogueCard from "../EpilogueCard.vue";
import type { CampaignEnding } from "@hh/sim-core/campaign";
import type { ScenarioExitPayout } from "@hh/sim-core/scenario";
import type { MuseumExhibitRecord, Succession } from "@hh/sim-core/save";

const OBITUARY = {
  kind: "obituary",
  title: "The Obituary",
  epitaph: 'The company died at "death-by-cause:churn".',
  evidence: {
    chapterOutcomes: [{ chapterId: "b-3", outcome: "lost", stopReason: "death-by-cause:churn" }],
    medals: 1,
    scars: 5,
    deathStopReason: "death-by-cause:churn",
  },
} as CampaignEnding;

const EXIT = {
  kind: "exit",
  title: "The Exit",
  epitaph: "The long sale closed.",
  evidence: {
    chapterOutcomes: [{ chapterId: "c-7", outcome: "won", stopReason: "win:sell-accepted-above:0@420" }],
    medals: 4,
    scars: 0,
    deathStopReason: null,
    declaredExitKind: "strategic-acquisition",
    exitObserved: true,
  },
} as CampaignEnding;

const QUIET = {
  kind: "quiet-handoff",
  title: "The Quiet Handoff",
  epitaph: "The company stood; the tour walked on.",
  evidence: {
    chapterOutcomes: [{ chapterId: "b-2", outcome: "won", stopReason: "survive@300" }],
    medals: 2,
    scars: 1,
    deathStopReason: null,
  },
} as CampaignEnding;

const PAYOUT = {
  exitKind: "strategic-acquisition",
  headlineOfferMicroUsd: 40_000_000_000n,
  cashSliceMicroUsd: 24_000_000_000n,
  adjustments: [{ basis: "churn", factorBps: 9_500n }],
} as unknown as ScenarioExitPayout;

const EXHIBIT = {
  id: "exhibit:hydra-first",
  sourceFacet: "codex",
  sourceRef: "codex:hydra",
  title: "First Hydra Neutralized",
  runId: "run-2",
  runSeed: 904n,
  acquiredAtTick: 118n,
  deprecated: false,
  memorialNote: null,
} as MuseumExhibitRecord;

beforeEach(() => {
  vi.spyOn(globalThis, "setInterval");
  vi.spyOn(globalThis, "setTimeout");
  vi.spyOn(globalThis, "requestAnimationFrame");
});

afterEach(() => {
  expect(globalThis.setInterval).not.toHaveBeenCalled();
  expect(globalThis.setTimeout).not.toHaveBeenCalled();
  expect(globalThis.requestAnimationFrame).not.toHaveBeenCalled();
  vi.restoreAllMocks();
});

describe("EpilogueCard mount", () => {
  it("renders the obituary band, epitaph and verbatim death cause", () => {
    const wrapper = mount(EpilogueCard, { props: { ending: OBITUARY } });
    expect(wrapper.find("[data-test='epilogue-card']").attributes("data-kind")).toBe("obituary");
    expect(wrapper.find("[data-test='epilogue-title']").text()).toBe("The Obituary");
    expect(wrapper.find("[data-test='epilogue-death']").text()).toContain("death-by-cause:churn");
    expect(wrapper.find("[data-test='epilogue-money-absent']").exists()).toBe(true);
  });

  it("renders the exit with headline, slice and one diligence leg", () => {
    const wrapper = mount(EpilogueCard, { props: { ending: EXIT, payout: PAYOUT } });
    expect(wrapper.attributes("data-kind")).toBe("exit");
    expect(wrapper.find("[data-test='epilogue-money']").exists()).toBe(true);
    expect(wrapper.findAll("[data-test='epilogue-leg']")).toHaveLength(1);
    expect(wrapper.find("[data-test='epilogue-declared']").text()).toContain(
      "observed — the sell-accepted verdict landed",
    );
    expect(wrapper.find("[data-test='epilogue-money-absent']").exists()).toBe(false);
  });

  it("renders the quiet handoff without death, payout or declaration noise", () => {
    const wrapper = mount(EpilogueCard, { props: { ending: QUIET } });
    expect(wrapper.attributes("data-kind")).toBe("quiet-handoff");
    expect(wrapper.find("[data-test='epilogue-death']").exists()).toBe(false);
    expect(wrapper.find("[data-test='epilogue-declared']").exists()).toBe(false);
    expect(wrapper.find("[data-test='epilogue-money-absent']").text()).toContain("No payout on this record");
  });

  it("lists seven evidence facts with explain disclosures", () => {
    const wrapper = mount(EpilogueCard, { props: { ending: QUIET } });
    expect(wrapper.findAll("[data-test='epilogue-fact']")).toHaveLength(7);
    expect(wrapper.findAll("[data-test='epilogue-explain']")).toHaveLength(7 + 1);
    expect(wrapper.text()).toContain("What the record stands on");
  });

  it("shows museum rows with provenance and states the empty shelf", () => {
    const withShelf = mount(EpilogueCard, { props: { ending: QUIET, museum: [EXHIBIT] } });
    expect(withShelf.findAll("[data-test='epilogue-museum-row']")).toHaveLength(1);
    expect(withShelf.text()).toContain("run run-2 · seed 904 · tick 118");

    const bare = mount(EpilogueCard, { props: { ending: QUIET } });
    expect(bare.find("[data-test='epilogue-museum-empty']").exists()).toBe(true);
  });

  it("prints the succession pair when the host hands the save's line", () => {
    const succession = { type: "exit", exitKind: "strategic-acquisition" } as Succession;
    const wrapper = mount(EpilogueCard, { props: { ending: EXIT, succession } });
    const rows = wrapper.findAll("[data-test='epilogue-succession-row']");
    expect(rows).toHaveLength(2);
    expect(rows[0]?.text()).toContain("c-7 — won");
    expect(rows[1]?.text()).toContain("exit · strategic-acquisition");
  });
});
