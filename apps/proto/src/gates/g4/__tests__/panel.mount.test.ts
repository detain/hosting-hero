// @vitest-environment jsdom
/**
 * G4 panel mount proof (jsdom) — the ACCESSIBILITY LAW in the DOM itself:
 * ports are focusable (tabindex + role=button), Enter arms a source, Enter
 * on a target opens the SAME terms card a pointer drop would, Escape
 * abandons with nothing minted, and confirm lands a real door receipt.
 * Engine truth lives in g4Session.test.ts + the sim-core gate file.
 */

import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import G4GatePanel from "../G4GatePanel.vue";

const ETH0 = '[data-test="port-web-1:data:eth0"]';
const PANEL_IN = '[data-test="port-sw-1:data:panel-in"]';
const PSU1 = '[data-test="port-sw-1:power:psu1"]';

async function bootPlaced() {
  const wrapper = mount(G4GatePanel, { props: { seed: 904 } });
  await wrapper.find('[data-test-id="palette-web-1"]').trigger("click");
  await wrapper.find('[data-test-id="palette-sw-1"]').trigger("click");
  return wrapper;
}

/** Advance the clock so the place-occupancy windows (3 ticks) release. */
async function settle(wrapper: Awaited<ReturnType<typeof bootPlaced>>, ticks: number) {
  for (let i = 0; i < ticks; i += 1) await wrapper.find('[data-test="g4-step"]').trigger("click");
}

describe("G4GatePanel · the board answers gestures AND keystrokes", () => {
  it("palette places devices through the door; buttons retire once placed", async () => {
    const wrapper = await bootPlaced();
    expect(wrapper.text()).toContain("web-1");
    expect(wrapper.text()).toContain("sw-1");
    expect(wrapper.find('[data-test-id="palette-web-1"]').attributes("disabled")).toBeDefined();
    // one receipt per place, both executed
    const log = wrapper.find('[data-test="receipt-log"]').text();
    expect(log).toContain("place-device");
    expect(wrapper.find('[data-test="g4-meters"]').text()).toContain("tick");
  });

  it("ports are keyboard citizens: focusable, labeled by glyph shape (R32)", async () => {
    const wrapper = await bootPlaced();
    const eth0 = wrapper.find(ETH0);
    expect(eth0.attributes("tabindex")).toBe("0");
    expect(eth0.attributes("role")).toBe("button");
    expect(eth0.attributes("aria-label")).toContain("data port (RJ45 trapezoid)");
    expect(eth0.attributes("aria-label")).toContain("web-1");
    const kettle = wrapper.find('[data-test="port-web-1:power:psu1"]');
    expect(kettle.attributes("aria-label")).toContain("power inlet (kettle plug)");
  });

  it("click-to-link: Enter source, Enter target ⇒ terms card, Enter on card ⇒ real cable", async () => {
    const wrapper = await bootPlaced();
    await settle(wrapper, 3); // hands free again at tick 5
    await wrapper.find(ETH0).trigger("keydown", { key: "Enter" }); // arm source
    await wrapper.find(PANEL_IN).trigger("keydown", { key: "Enter" }); // open terms

    const card = wrapper.find('[data-test="terms-card"]');
    expect(card.exists()).toBe(true);
    expect(card.text()).toContain("Depend on sw-1");
    expect(card.find('[data-test="term-bandwidth"]').exists()).toBe(true);
    expect(card.find('[data-test="term-monthly-cost"]').text()).toContain("$4.00/mo");
    expect(wrapper.find('[data-test="ladder-panel"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="ladder-delta"]').text()).toContain("ms");
    expect(card.find('[data-test="terms-attack-surface"]').text()).toContain("network");

    await card.find('[data-test="terms-confirm"]').trigger("click");
    expect(wrapper.find('[data-test="terms-card"]').exists()).toBe(false);
    // the commit already stepped: a door receipt + version 1
    expect(wrapper.find('[data-test="receipt-log"]').text()).toContain("connect-ports");
    expect(wrapper.find('[data-test="g4-meters"]').text()).toContain("v1");
    expect(wrapper.findAll(".g4-edge").length).toBe(1);
  });

  it("Escape abandons the card: nothing is minted, the board never moves", async () => {
    const wrapper = await bootPlaced();
    await wrapper.find(ETH0).trigger("keydown", { key: "Enter" });
    await wrapper.find(PANEL_IN).trigger("keydown", { key: "Enter" });
    expect(wrapper.find('[data-test="terms-card"]').exists()).toBe(true);
    await wrapper.find('[data-test="terms-card"]').trigger("keydown", { key: "Escape" });
    expect(wrapper.find('[data-test="terms-card"]').exists()).toBe(false);
    await wrapper.find('[data-test="g4-step"]').trigger("click"); // flush any phantom queue
    expect(wrapper.find('[data-test="g4-meters"]').text()).toContain("v0");
    expect(wrapper.findAll(".g4-edge").length).toBe(0);
  });

  it("a shape-mismatched pair bounces a reason-naming refusal, card never opens", async () => {
    const wrapper = await bootPlaced();
    await wrapper.find(ETH0).trigger("keydown", { key: "Enter" });
    await wrapper.find(PSU1).trigger("keydown", { key: "Enter" });
    expect(wrapper.find('[data-test="terms-card"]').exists()).toBe(false);
    const flash = wrapper.find('[data-test="refuse-flash"]');
    expect(flash.exists()).toBe(true);
    expect(flash.text()).toContain("shape mismatch");
    expect(flash.attributes("role")).toBe("alert");
  });

  it("Enter twice on the same port just disarms (no self-cable, no card)", async () => {
    const wrapper = await bootPlaced();
    await wrapper.find(ETH0).trigger("keydown", { key: "Enter" });
    await wrapper.find(ETH0).trigger("keydown", { key: "Enter" });
    expect(wrapper.find('[data-test="terms-card"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="g4-meters"]').text()).toContain("v0");
  });

  it("wiring mode toggles via button and dims the world class", async () => {
    const wrapper = await bootPlaced();
    expect(wrapper.find('[data-test="g4-panel"]').classes()).not.toContain("g4--wiring");
    await wrapper.find('[data-test="g4-wiring-toggle"]').trigger("click");
    expect(wrapper.find('[data-test="g4-panel"]').classes()).toContain("g4--wiring");
    expect(wrapper.find(".g4-world").classes()).toContain("g4-world--dim");
  });

  it("hands rail shows the busy window while a cable is still being laid", async () => {
    const wrapper = mount(G4GatePanel, { props: { seed: 4242 } });
    await wrapper.find('[data-test-id="palette-web-1"]').trigger("click");
    // one place executed, one hand busy until tick 4
    const rail = wrapper.find('[data-test="hands-rail"]').text();
    expect(rail).toContain("free"); // the other hand
    expect(wrapper.findAll(".g4-hand").length).toBe(2);
  });

  it("a second identical cable is refused at preflight: 'already seated', no card", async () => {
    const wrapper = await bootPlaced();
    await settle(wrapper, 3);
    await wrapper.find(ETH0).trigger("keydown", { key: "Enter" });
    await wrapper.find(PANEL_IN).trigger("keydown", { key: "Enter" });
    await wrapper.find('[data-test="terms-confirm"]').trigger("click");
    // hands busy (connect pays 3 ticks) — walk the clock first
    for (let i = 0; i < 4; i += 1) await wrapper.find('[data-test="g4-step"]').trigger("click");
    await wrapper.find(ETH0).trigger("keydown", { key: "Enter" });
    await wrapper.find(PANEL_IN).trigger("keydown", { key: "Enter" });
    expect(wrapper.find('[data-test="terms-card"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="refuse-flash"]').text()).toContain("already seated");
  });
});
