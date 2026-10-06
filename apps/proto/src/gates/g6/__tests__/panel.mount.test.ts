// @vitest-environment jsdom
/**
 * G6 panel mount smoke (jsdom) — proves the SFC compiles and the WINDOW
 * DRESSINGS answer: single mode shows one loaded side, the type toggle
 * hot-swaps the label without touching any other code path, dual mode puts
 * two skins on stage with one transport, and Step advances the shared minute
 * while the counters move. The engine contract lives in g6Runner.test.ts and
 * the sim-core gate.
 */
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import G6GatePanel from "../G6GatePanel.vue";

describe("G6GatePanel mounts and answers clicks", () => {
  it("single mode steps the loaded side and hot-swaps type on the same path", async () => {
    const wrapper = mount(G6GatePanel);
    expect(wrapper.find('[data-test="g6-title"]').text()).toContain("Two Types");
    expect(wrapper.findAll('[data-test^="g6-side-"]')).toHaveLength(1);

    const webSide = wrapper.find('[data-test="g6-side-shared-web"]');
    expect(webSide.exists()).toBe(true);
    expect(webSide.text()).toContain("density-comb");

    await wrapper.find('[data-test="g6-step"]').trigger("click");
    await wrapper.find('[data-test="g6-step"]').trigger("click");
    expect(wrapper.find('[data-test="g6-minute"]').text()).toContain("2");

    // Hot swap: same components, new loaded profile — meter name changes.
    await wrapper.find('[data-test="g6-type-game-servers"]').trigger("click");
    const gameSide = wrapper.find('[data-test="g6-side-game-servers"]');
    expect(gameSide.exists()).toBe(true);
    expect(gameSide.text()).toContain("tick-rate-metronome");
    expect(wrapper.find('[data-test^="g6-tempo-badge"]').exists()).toBe(true);
  });

  it("dual mode runs both loaded types side-by-side on one transport", async () => {
    const wrapper = mount(G6GatePanel);
    await wrapper.find('[data-test="g6-mode-dual"]').trigger("click");
    expect(wrapper.findAll('[data-test^="g6-side-"]')).toHaveLength(2);

    await wrapper.find('[data-test="g6-step"]').trigger("click");
    const webServed = Number(wrapper.find('[data-test="g6-served-shared-web"]').text());
    const gameServed = Number(wrapper.find('[data-test="g6-served-game-servers"]').text());
    expect(Number.isFinite(webServed + gameServed)).toBe(true);
    expect(wrapper.find('[data-test="g6-minute"]').text()).toContain("1");

    // Switching back to single restores one side without residue.
    await wrapper.find('[data-test="g6-mode-single"]').trigger("click");
    expect(wrapper.findAll('[data-test^="g6-side-"]')).toHaveLength(1);
  });
});
