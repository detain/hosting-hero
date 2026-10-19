// @vitest-environment jsdom
/**
 * campaignEpilogue.dom.test.ts — the epilogue bench SFC answers (jsdom).
 *
 * Proves: zero timers at mount (the breathe() legs only start AFTER a click),
 * the exit-declared run renders the engine's title/epitaph/ledger/prose
 * through the data-test hooks, the exit-arc run narrates the quiet handoff
 * honestly while keeping the exit-edge slice visible, the FORGED obituary
 * fixture renders (the renderer is total over the closed union) labeled as a
 * test fixture, the era flip keeps era-flat prose byte-ident, and the bench
 * lives as SimLabPanel's third v-show tab with state surviving a flip.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { asEntityId, asMoney, asRunSeed } from "@hh/sim-core/types";
import type { CampaignChapterRecord, CampaignReport } from "@hh/sim-core/campaign";
import { endCampaign } from "@hh/sim-core/campaign";
import { emptyLineageGraph, newCompanyNode } from "@hh/sim-core/save";
import { DEFAULT_ERA_YEAR, getEra, setEra } from "../../i18n/eraState";
import CampaignEpiloguePanel from "../CampaignEpiloguePanel.vue";
import SimLabPanel from "../SimLabPanel.vue";
import { epilogueFixtureState, epilogueProseFor } from "../campaignLab";
import type { EpiloguePanelState } from "../campaignLab";

async function untilPresent(
  wrapper: ReturnType<typeof mount>,
  selector: string,
  maxPokes = 2_000,
): Promise<boolean> {
  for (let i = 0; i < maxPokes; i += 1) {
    if (wrapper.find(selector).exists()) return true;
    await new Promise((resolve) => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
  }
  return wrapper.find(selector).exists();
}

/* ── the FORGED obituary: endings.test.ts fixture idiom, bench-side ──────
   No live campaign content reaches an obituary (the terminal beat wins
   everywhere); the renderer's coverage of the third union member stands on
   a forged CampaignReport, labeled test-fixture — never a chip. */
const DEATH_STOP = "lose:death-by-cause:any@73";

function forgedObituaryState(): EpiloguePanelState {
  const rec: CampaignChapterRecord = {
    chapterId: "c-9", scenarioId: "the-negotiation", runId: "forged:c-9", nodeId: "co",
    runSeed: asRunSeed(904n), outcome: "lost", stopReason: DEATH_STOP,
    endTick: 73n, endMinute: 73, endDigest: "0".repeat(32),
    cashStartMicroUsd: asMoney(1_000n), cashEndMicroUsd: asMoney(0n),
    settledFacets: [], bootstrapped: false,
  };
  const report: CampaignReport = {
    campaignId: "forged-arc", baseRunSeed: asRunSeed(904n), finalNodeId: asEntityId("co"),
    chapterRecords: [rec], edgesSpawned: [], finalGraph: emptyLineageGraph(),
  };
  const node = newCompanyNode({ id: "co", parentId: null, name: "Co", eraOrigin: "2026", foundedAtTick: 0n, successionType: "found" });
  return epilogueFixtureState(endCampaign(report, node));
}

describe("CampaignEpiloguePanel — mount discipline", () => {
  let timers: {
    interval: ReturnType<typeof vi.spyOn>;
    timeout: ReturnType<typeof vi.spyOn>;
    frame: ReturnType<typeof vi.spyOn>;
  } | null = null;

  beforeEach(() => {
    setEra(DEFAULT_ERA_YEAR);
    const interval = vi.spyOn(globalThis, "setInterval");
    const timeout = vi.spyOn(globalThis, "setTimeout");
    const frame = vi.spyOn(globalThis, "requestAnimationFrame");
    timers = { interval, timeout, frame };
  });

  afterEach(() => {
    const t = timers;
    expect(t, "spy roster lost").not.toBeNull();
    expect(t!.interval).not.toHaveBeenCalled();
    expect(t!.timeout).not.toHaveBeenCalled();
    expect(t!.frame).not.toHaveBeenCalled();
    vi.restoreAllMocks();
    setEra(DEFAULT_ERA_YEAR);
  });

  it("mounts with ZERO timers and the honest control surface", () => {
    const w = mount(CampaignEpiloguePanel);
    expect(w.find('[data-test="epilogue-bench"]').exists()).toBe(true);
    expect(w.find('[data-test="epilogue-arm-exit-declared"]').exists()).toBe(true);
    expect(w.find('[data-test="epilogue-arm-exit-arc"]').exists()).toBe(true);
    // No live obituary chip; no chip for a parse-RESERVED kind. (Assert the
    // chip ELEMENTS: the honest header prose names ipo/management-buyout/
    // wind-down precisely to explain why they have no chip.)
    expect(w.find('[data-test="epilogue-arm-obituary"]').exists()).toBe(false);
    expect(w.find('[data-test="epilogue-arm-ipo"]').exists()).toBe(false);
    expect(w.find('[data-test="epilogue-arm-management-buyout"]').exists()).toBe(false);
    expect(w.find('[data-test="epilogue-arm-wind-down"]').exists()).toBe(false);
    expect(w.find('[data-test="epilogue-stage"]').text()).toContain("idle");
  });
});

describe("CampaignEpiloguePanel — the exit-declared arm", () => {
  afterEach(() => setEra(DEFAULT_ERA_YEAR));

  it("run → The Exit: verbatim title/epitaph, evidence grid, 4-leg ledger, bank prose", async () => {
    const w = mount(CampaignEpiloguePanel);
    await w.find('[data-test="epilogue-run"]').trigger("click");
    expect(await untilPresent(w, '[data-test="epilogue-title"]')).toBe(true);

    const title = w.find('[data-test="epilogue-title"]').text();
    expect(title).toBe("The Exit");
    expect(w.find('[data-test="epilogue-epitaph"]').text()).toBe(
      "The company was sold. The run-up closed, and every boring decision the game taught held.",
    );
    expect(w.find('[data-test="epilogue-declared-kind"]').text()).toBe("strategic-acquisition");
    const rows = w.findAll('[data-test="epilogue-evidence"]');
    expect(rows.length).toBe(8); // medals scars reputation outage streak mrr mistake death-cause
    const death = rows.find((row) => row.attributes("data-label") === "Death cause");
    expect(death?.text()).toContain("—"); // a sold company did not die
    expect(w.findAll('[data-test="epilogue-tape-row"]').length).toBe(1);
    const adjustments = w.findAll('[data-test="epilogue-adjustment"]').map((row) => row.text());
    expect(adjustments).toHaveLength(4);
    expect(adjustments).toContain("concentration: 7,500 bps of 10,000");
    expect(w.find('[data-test="epilogue-slice"]').text()).toContain("$");

    // Prose comes from the bank, resolved through the era-tracking computed.
    const expected = epilogueProseFor("strategic-acquisition", getEra());
    expect(w.find('[data-test="epilogue-prose-headline"]').text()).toBe(expected.headline);
    expect(w.find('[data-test="epilogue-frame-three-cards"]').text()).toBe(expected.frameThreeCards);
    expect(w.find('[data-test="epilogue-frame-handwriting"]').text()).toBe(expected.frameHandwriting);

    // Era flip: the bank is era-flat, so every prose line is BYTE-STABLE.
    setEra(1998);
    await w.vm.$nextTick();
    expect(w.find('[data-test="epilogue-prose-headline"]').text()).toBe(expected.headline);
    expect(w.find('[data-test="epilogue-prose-body3"]').text()).toBe(expected.body3);
  }, 180_000);
});

describe("CampaignEpiloguePanel — the exit-arc arm", () => {
  it("quiet-handoff narrates honestly while the exit edge stays visible", async () => {
    const w = mount(CampaignEpiloguePanel);
    await w.find('[data-test="epilogue-arm-exit-arc"]').trigger("click");
    expect(w.find('[data-test="epilogue-arm-exit-arc"]').attributes("aria-selected")).toBe("true");
    await w.find('[data-test="epilogue-run"]').trigger("click");
    expect(await untilPresent(w, '[data-test="epilogue-title"]')).toBe(true);

    expect(w.find('[data-test="epilogue-kind"]').text()).toContain("quiet-handoff");
    expect(w.find('[data-test="epilogue-epitaph"]').text()).toContain("handed the company to your team");
    // The declaration-evidence rail: mid-chain note, 1 edge, the 24M slice —
    // but NO prose block: the terminal readout never declared, so the
    // declaredExitKind stays null and the bank stays silent.
    expect(w.find('[data-test="epilogue-narration"]').text()).toContain("mid-chain");
    expect(w.find('[data-test="epilogue-exit-ledger"]').text()).toContain("edges spawned: 1");
    expect(w.find('[data-test="epilogue-slice"]').text()).toContain("$");
    expect(w.find('[data-test="epilogue-declared-kind"]').text()).toBe("—");
    expect(w.find('[data-test="epilogue-prose"]').exists()).toBe(false);
    expect(w.findAll('[data-test="epilogue-tape-row"]').length).toBe(2);
  }, 300_000);
});

describe("CampaignEpiloguePanel — the forged obituary fixture", () => {
  it("renders the third union member, labeled test-fixture", () => {
    const w = mount(CampaignEpiloguePanel, { props: { fixture: forgedObituaryState() } });
    expect(w.find('[data-test="epilogue-title"]').text()).toBe("The Obituary");
    expect(w.find('[data-test="epilogue-epitaph"]').text()).toContain(DEATH_STOP);
    expect(w.find('[data-test="epilogue-source"]').text()).toContain("test fixture");
    const death = w.findAll('[data-test="epilogue-evidence"]')
      .find((row) => row.attributes("data-label") === "Death cause");
    expect(death?.text()).toContain(DEATH_STOP);
    expect(w.find('[data-test="epilogue-exit-ledger"]').exists()).toBe(false);
    expect(w.find('[data-test="epilogue-prose"]').exists()).toBe(false);
  });
});

describe("CampaignEpiloguePanel — forged states through the fixture seam", () => {
  it("a DOC_LIE error state renders visibly in the error lane, never swallowed", () => {
    // The lane render: exactly what the click handler stores when
    // runEpilogueDoc catches the sim-core refutation (pure-side proof that
    // it catches lives in campaignLab.test.ts).
    const w = mount(CampaignEpiloguePanel, {
      props: {
        fixture: {
          stage: "error",
          view: null,
          error: 'campaign: DOC_LIE at \'campaign "epilogue-halt-dom" chapter "x-1-armed-close"\' — endings are observed, not authored',
        },
      },
    });
    const lane = w.find('[data-test="epilogue-error"]');
    expect(lane.exists()).toBe(true);
    expect(lane.attributes("role")).toBe("alert");
    expect(lane.text()).toContain("DOC_LIE");
    expect(lane.text()).toContain("endings are observed, not authored");
    expect(w.find('[data-test="epilogue-ending"]').exists()).toBe(false);
  });

  it("an idle panel shows no error lane (the lane is run-scoped)", () => {
    const w = mount(CampaignEpiloguePanel);
    expect(w.find('[data-test="epilogue-error"]').exists()).toBe(false);
  });
});

describe("SimLabPanel — the epilogue tab", () => {
  it("third v-show tab: mounts with the bench present and survives the round trip", async () => {
    const w = mount(SimLabPanel);
    expect(w.find('[data-test="lab-tab-epilogue"]').exists()).toBe(true);
    expect(w.find('[data-test="lab-panel-epilogue"]').exists()).toBe(true); // v-show: present while hidden
    expect(w.find('[data-test="lab-panel-epilogue"]').attributes("style") ?? "").toContain("display: none");
    await w.find('[data-test="lab-tab-epilogue"]').trigger("click");
    expect(w.find('[data-test="lab-tab-epilogue"]').attributes("aria-selected")).toBe("true");
    expect(w.find('[data-test="lab-panel-weekend"]').attributes("style") ?? "").toContain("display: none");
    expect(w.find('[data-test="epilogue-bench"]').exists()).toBe(true);
    await w.find('[data-test="lab-tab-weekend"]').trigger("click");
    expect(w.find('[data-test="lab-idle"]').exists()).toBe(true);
  });

  it("a ran epilogue survives the tab round trip (v-show law)", async () => {
    const w = mount(SimLabPanel);
    await w.find('[data-test="lab-tab-epilogue"]').trigger("click");
    await w.find('[data-test="epilogue-run"]').trigger("click");
    expect(await untilPresent(w, '[data-test="epilogue-title"]')).toBe(true);
    await w.find('[data-test="lab-tab-weekend"]').trigger("click");
    await w.find('[data-test="lab-tab-epilogue"]').trigger("click");
    expect(w.find('[data-test="epilogue-title"]').text()).toBe("The Exit");
    expect(w.find('[data-test="epilogue-prose"]').exists()).toBe(true);
  }, 180_000);
});
