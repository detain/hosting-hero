// @vitest-environment jsdom
/**
 * L-ADP adoption proof (owner ruling 2026-10-17, wave-23): the chrome surfaces
 * are no longer "test-mount-only" — a PLAYER reaches them through the real
 * App shell. This file mounts App.vue itself and walks the rail:
 *
 *   G4 (drag-a-cable)  → §7.16 Act row live on the board, full click→door→
 *                        book→chip loop witnessed end to end
 *   HUD-LAB            → flavour feed + act row + co-op cards on the stage
 *   COOP               → §9.1 incident room stage, Local-demo default posture
 *
 * plus the timer discipline the ADR-0017 #4 posture demands app-wide: the
 * Act-row board and the co-op room mount schedule-free on their default
 * paths, and the lab's ONE interval is PanicLayout's pre-existing §8.15
 * budget sampler — named on the record, not smuggled in by adoption.
 *
 * jsdom has no Worker, so App's documented fallback boots the in-process
 * fakeWorker (no timers there); the gate panels below never touch it — each
 * stage carries its own local runner, and that is exactly what is proven.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import App from "../App.vue";
import { DEFAULT_ERA_YEAR, setEra } from "../i18n/eraState.ts";

const wrappers: ReturnType<typeof mount>[] = [];

function mountApp() {
  const w = mount(App, { attachTo: document.body });
  wrappers.push(w);
  return w;
}

afterEach(() => {
  while (wrappers.length > 0) wrappers.pop()!.unmount();
  setEra(DEFAULT_ERA_YEAR);
  document.body.innerHTML = "";
});

async function gotoStage(w: ReturnType<typeof mount>, gateId: string) {
  await w.find(`[data-test-id="gate-rail-${gateId}"]`).trigger("click");
  await nextTick();
  return w.find(`[data-test-id="gate-stage-${gateId}"]`);
}

describe("App rail · the chrome is registered, not just exported", () => {
  it("the six gates, the chrome stages, sandbox and Sim Lab all enumerate", () => {
    const w = mountApp();
    for (const id of ["G1", "G2", "G3", "G4", "G5", "G6"]) {
      expect(w.find(`[data-test-id="gate-rail-${id}"]`).exists()).toBe(true);
    }
    // The adoption itself: these two entries exist ONLY because
    // gates/index.ts now spreads CHROME into ALL_GATE_MOUNTS.
    expect(w.find('[data-test-id="gate-rail-HUD-LAB"]').exists()).toBe(true);
    expect(w.find('[data-test-id="gate-rail-COOP"]').exists()).toBe(true);
  });
});

describe("G4 stage · the §7.16 Act row lives on the cable board", () => {
  it("renders with the panel and runs the full click→door→book→chip loop", async () => {
    const w = mountApp();
    const stage = await gotoStage(w, "G4");
    expect(stage.exists()).toBe(true);
    expect(stage.find('[data-test="g4-panel"]').exists()).toBe(true);
    expect(stage.find('[data-test="g4-act-row"]').exists()).toBe(true);
    expect(stage.find('[data-test="act-row"]').exists()).toBe(true);

    // Place a node through the panel's OWN palette (the pre-existing cable
    // path), then isolate it through the chrome Act row — the intent mints in
    // chrome/actRow.ts, the SESSION stamps, the DOOR executes, the engine
    // book lands, and the desk chip reads it back: one witness, four layers.
    await stage.find('[data-test-id="palette-web-1"]').trigger("click");
    await nextTick();
    const chip = stage.find('[data-test="act-node-web-1"]');
    expect(chip.exists()).toBe(true); // the Act row sees the placed node
    await chip.trigger("click");
    await stage.find('[data-test="act-isolate"]').trigger("click");
    await nextTick();

    const receipt = stage.find('[data-test="act-receipt"]');
    expect(receipt.attributes("data-source")).not.toBe("none"); // a door fact exists
    expect(stage.find('[data-test="receipt-log"]').text()).toContain("isolate");
    // Hands are free after one place (capacity 2), so the fence must EXECUTE
    // — source "wire" is the executed receipt, and the status chip goes live.
    expect(receipt.attributes("data-source")).toBe("wire");
    expect(receipt.text()).toContain("isolate");
    expect(stage.find('[data-test="act-status-isolate"]').attributes("data-live")).toBe("true");
  }, 20_000);
});

describe("HUD-LAB stage · the chrome law suite is a reachable place", () => {
  it("mounts the lab with its adopted cards (act row · flavour · co-op)", async () => {
    const w = mountApp();
    const stage = await gotoStage(w, "HUD-LAB");
    expect(stage.find('[data-test="hud-lab"]').exists()).toBe(true);
    expect(stage.find('[data-test="lab-act-row"]').exists()).toBe(true);
    expect(stage.find('[data-test="lab-flavour"]').exists()).toBe(true);
    expect(stage.find('[data-test="lab-coop"]').exists()).toBe(true);
    // FlavourFeed renders its own root inside the card (feed-panel hook):
    expect(stage.find('[data-test="lab-flavour"] [data-test="feed-panel"]').exists()).toBe(true);
  }, 20_000);
});

describe("COOP stage · the incident room is a stage, still default-local", () => {
  it("renders the room with the Local-demo posture active and Wire untouched", async () => {
    const w = mountApp();
    const stage = await gotoStage(w, "COOP");
    expect(stage.find('[data-test="coop-room"]').exists()).toBe(true);
    expect(stage.find('[data-test="coop-mode-bar"]').exists()).toBe(true);
    expect(stage.find('[data-test="coop-mode-local"]').attributes("data-active")).toBe("true");
    expect(stage.find('[data-test="coop-mode-wire"]').attributes("data-active")).toBe("false");
  }, 20_000);
});

describe("timer discipline on the adopted stages · nothing new breathes", () => {
  it("G4/COOP mount schedule-free; HUD-LAB's only clock is the pre-existing PanicLayout sampler", async () => {
    const w = mountApp();
    await nextTick(); // let the fakeWorker fallback boot settle first

    const intervals = vi.spyOn(window, "setInterval");
    const timeouts = vi.spyOn(window, "setTimeout");
    const rafs = vi.spyOn(window, "requestAnimationFrame");
    const clears = vi.spyOn(window, "clearInterval");
    try {
      // G4 (the Act-row host): the panel's auto-run is TOGGLE-gated
      // (window.setInterval only inside startAuto), so the default mount path
      // schedules nothing. Zero-timer law as briefed.
      let before = [intervals.mock.calls.length, timeouts.mock.calls.length, rafs.mock.calls.length];
      await gotoStage(w, "G4");
      await nextTick();
      expect([intervals.mock.calls.length, timeouts.mock.calls.length, rafs.mock.calls.length], "G4 mount").toEqual(before);

      // HUD-LAB: EXACTLY one interval may appear, and its identity is on the
      // record: PanicLayout's §8.15 500ms budget sampler starts in onMounted
      // (chrome/PanicLayout.vue:24-29 — pre-existing ratified chrome design,
      // NOT introduced by this adoption; the lab wraps its cards in the
      // layout to demo the panic dims). Anything beyond this one is new.
      before = [intervals.mock.calls.length, timeouts.mock.calls.length, rafs.mock.calls.length];
      await gotoStage(w, "HUD-LAB");
      await nextTick();
      expect(intervals.mock.calls.length - before[0]!, "HUD-LAB intervals").toBe(1);
      expect(timeouts.mock.calls.length, "HUD-LAB timeouts").toBe(before[1]!);
      expect(rafs.mock.calls.length, "HUD-LAB rAFs").toBe(before[2]!);

      // COOP (the Wire-mode zero-timer law, app-level): the room mounts
      // default-local AND the lab departure tears its sampler down — the
      // interval count net-moves by -0 starts and ≥1 clear. No orphan clocks.
      before = [intervals.mock.calls.length, timeouts.mock.calls.length, rafs.mock.calls.length];
      const clearBefore = clears.mock.calls.length;
      await gotoStage(w, "COOP");
      await nextTick();
      expect([intervals.mock.calls.length, timeouts.mock.calls.length, rafs.mock.calls.length], "COOP mount").toEqual(before);
      expect(clears.mock.calls.length, "lab sampler torn down on unmount").toBeGreaterThan(clearBefore);
    } finally {
      intervals.mockRestore();
      timeouts.mockRestore();
      rafs.mockRestore();
      clears.mockRestore();
    }
  }, 30_000);
});
