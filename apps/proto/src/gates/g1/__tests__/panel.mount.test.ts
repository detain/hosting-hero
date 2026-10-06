// @vitest-environment jsdom
/**
 * G1 panel mount smoke (jsdom) — proves the SFC compiles and every control
 * answers: slider moves the ROC readout value, defense toggle flips aria and
 * queues the door verb (receipt line appears after a step), step button
 * advances the minute counter, speed button cycles. The engine contract lives
 * in g1Runner.test.ts + the sim-core gate; this only hangs the dressings.
 */

import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import G1GatePanel from "../G1GatePanel.vue";

describe("G1GatePanel mounts and answers its controls", () => {
  it("slider, toggle, step, speed and the triad all render and respond", async () => {
    const wrapper = mount(G1GatePanel, { props: { seed: 31 } });

    // triad starts at zeros, tooltips exist
    expect(wrapper.find('[data-test="triad"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="explain-neutralized"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="door-receipt"]').attributes("hidden")).toBeDefined();

    // slider updates the aggression readout (pre-door control)
    const slider = wrapper.find('[data-test="aggression-slider"]');
    await slider.setValue(75);
    expect(wrapper.find('[data-test="aggression-value"]').text()).toBe("75%");

    // manual steps drive the loop without wall-clock timers (the mount-time
    // auto-start already emitted tick 1, so 10 clicks land at tick ≥ 10)
    for (let i = 0; i < 10; i += 1) await wrapper.find('[data-test="step-btn"]').trigger("click");
    expect(Number(wrapper.find('[data-test="tick-readout"]').text().replace(/\D+/g, ""))).toBeGreaterThanOrEqual(10);
    const stopped = Number(wrapper.find('[data-test="triad-neutralized"]').find("dd").text());
    const bounced = Number(wrapper.find('[data-test="triad-false-positives"]').find("dd").text());
    expect(stopped + bounced).toBeGreaterThan(0); // tension is visible at 75 %

    // defense toggle flips posture + travels the door (receipt line appears)
    const toggle = wrapper.find('[data-test="defense-toggle"]');
    expect(toggle.text()).toContain("ON");
    await toggle.trigger("click");
    expect(toggle.text()).toContain("OFF");
    expect(toggle.attributes("aria-pressed")).toBe("false");
    await wrapper.find('[data-test="step-btn"]').trigger("click");
    expect(wrapper.find('[data-test="door-receipt"]').attributes("hidden")).toBeUndefined();
    expect(wrapper.find('[data-test="door-receipt"]').text()).toContain("1 executed");

    // speed button cycles to the closest legal fast-forward (4×, no 3× in SpeedX)
    const speed = wrapper.find('[data-test="speed-btn"]');
    expect(speed.text()).toContain("4×");
    await speed.trigger("click");
    expect(speed.text()).toContain("1×");

    // beads are aggregate-driven: lane caption shows arrivals/min
    expect(wrapper.find('[data-test="lane-caption"]').text()).toContain("arrivals/min");
  });
});
