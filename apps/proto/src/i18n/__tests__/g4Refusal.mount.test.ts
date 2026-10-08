// @vitest-environment jsdom
/**
 * G4 mount proof for the i18n consumer: a REAL door refusal (both hands
 * committed) renders the pack's prose in the bounce chip AND the receipt
 * log, tagged data-refusal-source="pack". The pre-door preview verdicts keep
 * rendering host copy tagged "preview" — the UI now shows its copy source.
 */
import { describe, expect, it } from "vitest";
import { effect, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import G4GatePanel from "../../gates/g4/G4GatePanel.vue";
import { DEFAULT_ERA_YEAR, setEra } from "../eraState.ts";

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

  it("era flip re-renders the pack prose without churning it (refusal keys are flat)", async () => {
    const wrapper = mount(G4GatePanel, { props: { seed: 904 } });
    await wrapper.find('[data-test-id="palette-web-1"]').trigger("click");
    await wrapper.find('[data-test-id="palette-sw-1"]').trigger("click");
    await wrapper.find('[data-test-id="palette-web-2"]').trigger("click");

    const logBefore = wrapper.find('[data-test="receipt-log"]').text();
    expect(logBefore).toContain("Both hands are committed.");

    // The render effect read getEra() through describeRefusal → the panel
    // depends on the shared toggle; a flip schedules a real re-render…
    setEra(1998);
    await nextTick();
    // …and the bytes survive it (no accidental coupling), still pack-spoken.
    expect(wrapper.find('[data-test="receipt-log"]').text()).toBe(logBefore);
    expect(wrapper.find('[data-refusal-source="pack"]').exists()).toBe(true);

    setEra(DEFAULT_ERA_YEAR);
    await nextTick();
    expect(wrapper.find('[data-test="receipt-log"]').text()).toBe(logBefore);
  });

  it("R9 F-1: the flash chip stores the RAW wire reason and voices it at read time (era-tracked)", async () => {
    const wrapper = mount(G4GatePanel, { props: { seed: 904 } });
    await wrapper.find('[data-test-id="palette-web-1"]').trigger("click");
    await wrapper.find('[data-test-id="palette-sw-1"]').trigger("click");
    await wrapper.find('[data-test-id="palette-web-2"]').trigger("click");

    // Storage shape (dev-mode setup access): the raw door wire + event-time
    // slot context — never the rendered sentence (an event-time snapshot
    // could not carry this shape).
    const vm = wrapper.vm as unknown as {
      readonly refusalFlash: { readonly kind: string; readonly reason?: string } | null;
      readonly refusalDisplay: { readonly text: string; readonly source: string | null } | null;
    };
    const stored = vm.refusalFlash;
    expect(stored).not.toBeNull();
    expect(stored?.kind).toBe("receipt");
    expect(stored?.reason).toContain("hands-exhausted");
    expect(stored?.reason).not.toContain("Both hands are committed.");
    // The DISPLAYED sentence is derived from that raw reason via describeRefusal.
    expect(vm.refusalDisplay?.text).toContain(PACK_PROSE);
    expect(wrapper.find('[data-test="refuse-flash"]').text()).toContain(PACK_PROSE);

    // Read-time voicing is inside a computed that ran getEra() during its
    // evaluation — flipping the shared era re-runs the voice (a bare sync
    // reactivity effect on the display proves the re-evaluation; a frozen
    // string could not depend on era at all). Flat refusal keys ⇒ the bytes
    // survive the flip.
    let voices = 0;
    const stop = effect(() => {
      const display = vm.refusalDisplay;
      if (display !== null) void display.text;
      voices += 1;
    });
    const before = voices;
    setEra(1998);
    expect(voices).toBeGreaterThan(before);
    await nextTick();
    const flash = wrapper.find('[data-test="refuse-flash"]');
    expect(flash.text()).toContain(PACK_PROSE);
    expect(flash.attributes("data-refusal-source")).toBe("pack");
    setEra(DEFAULT_ERA_YEAR);
    stop();
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
