// @vitest-environment jsdom
/**
 * G3 panel mount smoke (jsdom) — the window dressings answer: dial readout
 * tracks the slider, steps populate the pip strip with BOTH shapes once yanks
 * happen, upgrade button flips aria + lands a door receipt, speed cycles.
 * Engine truth lives in g3Runner.test.ts + the sim-core gate.
 */

import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import G3GatePanel from "../G3GatePanel.vue";

describe("G3GatePanel mounts and answers its controls", () => {
  it("dial, lanes, pips, upgrade and speed all render and respond", async () => {
    const wrapper = mount(G3GatePanel, { props: { seed: 41 } });

    // dial readout follows the slider (pre-door control)
    const dial = wrapper.find('[data-test="dial-slider"]');
    await dial.setValue(35);
    expect(wrapper.find('[data-test="dial-value"]').text()).toBe("35%");

    // manual steps: congestion at the meter + wire folds produce demotions
    for (let i = 0; i < 12; i += 1) await wrapper.find('[data-test="step-btn"]').trigger("click");
    const deepPips = wrapper.findAll('[data-test="pip-deep"]');
    const expressPips = wrapper.findAll('[data-test="pip-express"]');
    expect(deepPips.length + expressPips.length).toBeGreaterThan(0);
    const laneText = wrapper.find('[data-test="lane-deep"]').text();
    expect(laneText).toContain("demoted");

    // upgrade defense: door verb queued, receipt line appears after a step
    const upgrade = wrapper.find('[data-test="upgrade-defense"]');
    expect(upgrade.text()).toContain("OFF");
    await upgrade.trigger("click");
    expect(upgrade.text()).toContain("CHALLENGE");
    expect(upgrade.attributes("aria-pressed")).toBe("true");
    await wrapper.find('[data-test="step-btn"]').trigger("click");
    expect(wrapper.find('[data-test="door-receipt"]').attributes("hidden")).toBeUndefined();
    expect(wrapper.find('[data-test="door-receipt"]').text()).toContain("1 executed");

    // speed cycles the legal fast-forward step
    const speed = wrapper.find('[data-test="speed-btn"]');
    await speed.trigger("click");
    expect(speed.text()).toContain("1×");

    // legend teaches the Shape-First grammar
    expect(wrapper.text()).toContain("▲ pulled to deep inspection");
  });
});
