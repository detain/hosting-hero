// @vitest-environment jsdom
/**
 * Sim Lab mount smoke (jsdom) — proves the SFCs compile, the internal tabs
 * keep BOTH benches mounted (v-show, not v-if: a ran weekend must survive a
 * tab flip), the run button reaches a report through the async breathe()
 * legs, and a roster toggle repaints the grid. Deterministic contracts live
 * in the model tests; this file proves the window dressings answer.
 */
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import SimLabPanel from "../SimLabPanel.vue";

/** Drain the model's setTimeout(0) breathes until a hook shows up. */
async function untilPresent(
  wrapper: ReturnType<typeof mount>,
  selector: string,
  maxPokes = 400,
): Promise<boolean> {
  for (let i = 0; i < maxPokes; i += 1) {
    if (wrapper.find(selector).exists()) return true;
    await new Promise((resolve) => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
  }
  return wrapper.find(selector).exists();
}

describe("SimLabPanel — tabs", () => {
  it("starts on the weekend tab with both benches mounted", () => {
    const wrapper = mount(SimLabPanel);
    expect(wrapper.find('[data-test="sim-lab"]').exists()).toBe(true);
    // v-show law: coverage DOM is PRESENT while hidden.
    expect(wrapper.find('[data-test="lab-coverage"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="lab-panel-coverage"]').attributes("style") ?? "").toContain("display: none");
    expect(wrapper.find('[data-test="lab-panel-weekend"]').attributes("style") ?? "").not.toContain("display: none");
    expect(wrapper.find('[data-test="lab-tab-weekend"]').attributes("aria-selected")).toBe("true");
  });

  it("the coverage tab selects and the weekend state survives the round trip", async () => {
    const wrapper = mount(SimLabPanel);
    await wrapper.find('[data-test="lab-tab-coverage"]').trigger("click");
    expect(wrapper.find('[data-test="lab-tab-coverage"]').attributes("aria-selected")).toBe("true");
    expect(wrapper.find('[data-test="lab-panel-weekend"]').attributes("style") ?? "").toContain("display: none");
    await wrapper.find('[data-test="lab-tab-weekend"]').trigger("click");
    expect(wrapper.find('[data-test="lab-idle"]').exists()).toBe(true);
  });
});

describe("Unattended bench through the rail mount", () => {
  it("Run Weekend (24 ticks) produces the report sections and the digest pin answers", async () => {
    const wrapper = mount(SimLabPanel);
    expect(wrapper.find('[data-test="lab-idle"]').exists()).toBe(true);

    await wrapper.find('[data-test="lab-input-ticks"]').setValue("24");
    await wrapper.find('[data-test="lab-input-checkpoint"]').setValue("12");
    await wrapper.find('[data-test="lab-run-weekend"]').trigger("click");
    expect(wrapper.find('[data-test="lab-stage"]').text()).toMatch(/weekend|building/);

    expect(await untilPresent(wrapper, '[data-test="lab-explanation"]')).toBe(true);
    expect(wrapper.find('[data-test="lab-explanation"]').text()).toMatch(/weekend/i);
    expect(wrapper.findAll('[data-test="lab-timeline"] .cp').length).toBeGreaterThanOrEqual(1);
    const buckets = wrapper.findAll('[data-test^="lab-bucket-"]');
    expect(buckets.length).toBeGreaterThanOrEqual(1);

    // determinism honesty: same inputs again → the pin reports ✓
    await wrapper.find('[data-test="lab-run-weekend"]').trigger("click");
    expect(await untilPresent(wrapper, '[data-test="lab-digest-pin"]')).toBe(true);
    expect(wrapper.find('[data-test="lab-digest-pin"]').text()).toContain("✓");
  }, 30_000);

  it("an illegal tick count renders the UnattendedError lane, not a crash", async () => {
    const wrapper = mount(SimLabPanel);
    await wrapper.find('[data-test="lab-input-ticks"]').setValue("5000");
    await wrapper.find('[data-test="lab-run-weekend"]').trigger("click");
    expect(await untilPresent(wrapper, '[data-test="lab-error"]')).toBe(true);
    expect(wrapper.find('[data-test="lab-error"]').text()).toMatch(/2880/);
  });
});

describe("Coverage bench through the rail mount", () => {
  it("the empty world is all-dark and a tile click repaints the counts", async () => {
    const wrapper = mount(SimLabPanel);
    await wrapper.find('[data-test="lab-tab-coverage"]').trigger("click");
    expect(wrapper.find('[data-test="lab-coverage"]').text()).toContain("108 cells");
    const darkBefore = wrapper.find('[data-test="lab-dark-count"]').text();
    expect(darkBefore).toContain("108");

    await wrapper.find('[data-test="lab-tile-waf-virtual-patching"] input').setValue(true);
    await wrapper.vm.$nextTick();
    const darkAfter = wrapper.find('[data-test="lab-dark-count"]').text();
    expect(darkAfter).not.toBe(darkBefore);
    expect(Number.parseInt(darkAfter.replace(/\D+/g, ""), 10)).toBeLessThan(108);
  }, 30_000);

  it("a practice tile opens the pool and its invite rides the dark row marked", async () => {
    // Fresh mount, PRACTICE only: with no defense built the stealth row stays
    // dark, so its sample chips render — and the roster-opened invite wears
    // the .invited mark (magenta ✦).
    const wrapper = mount(SimLabPanel);
    await wrapper.find('[data-test="lab-tab-coverage"]').trigger("click");
    await wrapper.find('[data-test="lab-tile-public-whois-listing"] input').setValue(true);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-test="lab-spawnable"]').text()).toMatch(/spawnable 12\/16/);
    expect(wrapper.find('[data-test="lab-threat-scanner-drizzle"]').classes()).toContain("invited");
  }, 30_000);
});
