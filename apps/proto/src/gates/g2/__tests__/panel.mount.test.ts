// @vitest-environment jsdom
/**
 * G2 panel mount smoke (jsdom) — proves the SFC COMPILES and the three
 * columns answer interaction: build → log grows + pool grows; retire →
 * haunting countdown appears; five counterances → Mastered badge.
 * The deterministic contract lives in deriveInvitations.test.ts + the
 * sim-core gate; this file only proves the window dressings hang together.
 */

import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import G2GatePanel from "../G2GatePanel.vue";

describe("G2GatePanel mounts and answers clicks", () => {
  it("palette previews surface, build logs it, retire haunts it, mastery badges it", async () => {
    const wrapper = mount(G2GatePanel);
    const tiles = wrapper.findAll('[data-test="palette-tile"]');
    expect(tiles).toHaveLength(3);

    // purchase-time surface preview: the cPanel tile advertises +2 before purchase
    const cpanel = tiles[1]!;
    expect(cpanel.text()).toContain("Homogeneous cPanel image");
    expect(cpanel.find('[data-test="surface-cost"]').text()).toBe("+2 surface");
    expect(cpanel.findAll('[data-test="invite-chip"]')).toHaveLength(2);

    // build it → construction log grows, deck grows
    await cpanel.find('[data-test="build-btn"]').trigger("click");
    expect(wrapper.findAll('[data-test="log-row"]')).toHaveLength(1);
    const rowsBefore = wrapper.findAll('[data-test="pool-row"]').length;
    expect(rowsBefore).toBe(6); // 4 ungated floor + 2 invited

    // five counterances on the plugin row → Mastered badge appears
    const pluginRow = wrapper
      .findAll('[data-test="pool-row"]')
      .find((r) => r.text().includes("Vulnerable-plugin compromise"))!;
    const counterBtn = pluginRow.find('[data-test="counter-btn"]');
    for (let i = 0; i < 5; i += 1) await counterBtn.trigger("click");
    expect(
      wrapper
        .findAll('[data-test="pool-row"]')
        .find((r) => r.text().includes("Vulnerable-plugin compromise"))!
        .find('[data-test="mastered-badge"]')
        .exists(),
    ).toBe(true);

    // retire → haunting ghost with the memo countdown
    await wrapper.findAll('[data-test="palette-tile"]')[1]!.find('[data-test="retire-btn"]').trigger("click");
    const haunting = wrapper.find('[data-test="haunting"]');
    expect(haunting.exists()).toBe(true);
    expect(haunting.text()).toContain("memo");
  });

  it("bundle tabs swap the estate", async () => {
    const wrapper = mount(G2GatePanel);
    const gameTab = wrapper.findAll(".bundle-tab").find((t) => t.text() === "Game Servers")!;
    await gameTab.trigger("click");
    const tiles = wrapper.findAll('[data-test="palette-tile"]');
    expect(tiles[0]!.text()).toContain("Public server browser listing");
  });
});
