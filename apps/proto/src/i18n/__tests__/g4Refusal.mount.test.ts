// @vitest-environment jsdom
/**
 * G4 mount proof for the i18n consumer: a REAL door refusal (both hands
 * committed) renders the pack's prose in the bounce chip AND the receipt
 * log, tagged data-refusal-source="pack". The pre-door preview verdicts keep
 * rendering host copy tagged "preview" — the UI now shows its copy source.
 */
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import G4GatePanel from "../../gates/g4/G4GatePanel.vue";

const PACK_PROSE =
  "Both hands are committed. The place-device intent is queued and presents when a hand frees at tick 4.";

describe("i18n × G4 mount · a door bounce speaks in pack prose", () => {
  it("third place while both hands are busy → churned from refusal.hands-exhausted", async () => {
    const wrapper = mount(G4GatePanel, { props: { seed: 904 } });
    // open() semantics via the palette: two places consume both hands (busy 3).
    await wrapper.find('[data-test-id="palette-web-1"]').trigger("click");
    await wrapper.find('[data-test-id="palette-sw-1"]').trigger("click");
    // third place lands while every hand is committed → the DOOR refuses.
    await wrapper.find('[data-test-id="palette-web-2"]').trigger("click");

    const flash = wrapper.find('[data-test="refuse-flash"]');
    expect(flash.attributes("data-refusal-source")).toBe("pack");
    expect(flash.text()).toContain(PACK_PROSE);

    const log = wrapper.find('[data-test="receipt-log"]').text();
    expect(log).toContain("Both hands are committed.");
    expect(wrapper.find('[data-refusal-source="pack"]').exists()).toBe(true);
  });

  it("pre-door preview bounce stays host copy, honestly tagged 'preview'", async () => {
    const wrapper = mount(G4GatePanel, { props: { seed: 904 } });
    await wrapper.find('[data-test-id="palette-web-1"]').trigger("click");
    await wrapper.find('[data-test-id="palette-sw-1"]').trigger("click");
    // arm a DATA trapezoid, target a POWER kettle → previewCable declines on
    // shape BEFORE any door intent exists: host verdict, not pack prose.
    await wrapper.find('[data-test="port-web-1:data:eth0"]').trigger("keydown", { key: "Enter" });
    await wrapper.find('[data-test="port-sw-1:power:psu1"]').trigger("keydown", { key: "Enter" });
    const flash = wrapper.find('[data-test="refuse-flash"]');
    expect(flash.attributes("data-refusal-source")).toBe("preview");
    expect(flash.text()).not.toContain("Both hands are committed.");
  });
});
