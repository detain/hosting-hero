// @vitest-environment jsdom
/**
 * GATE-G5 · DOM smoke — The Book slice renders from the real content wires,
 * the scrubber re-projects, and Explain-This-Number answers clicks with the
 * ledger law behind the number. (Deep behavior is certified headlessly by
 * packages/sim-core/src/__tests__/gate-g5.test.ts + projection.test.ts.)
 */
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import Gate5QuarterView from "../Gate5QuarterView.vue";
import { GATE_MOUNTS } from "../index.ts";

describe("Gate5QuarterView mounted", () => {
  it("renders the quarter verdict, scrubs back to day zero, and explains numbers", async () => {
    const wrapper = mount(Gate5QuarterView);
    await flushPromises();

    expect(wrapper.find('[data-test="g5-root"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="g5-loading"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="g5-error"]').exists()).toBe(false);

    // opens on the quarter's verdict: whale + two write-offs in the closed book
    const offbook = wrapper.find('[data-test="g5-kanban-col-offbook"]');
    expect(offbook.exists()).toBe(true);
    expect(offbook.find('[data-test="g5-card-c01"]').exists()).toBe(true);
    expect(offbook.find('[data-test="g5-card-c05"]').exists()).toBe(true);
    expect(offbook.find('[data-test="g5-card-c06"]').exists()).toBe(true);

    // the dunning widget tells the E-2 resurrection
    expect(wrapper.find('[data-test="g5-dunning-row-c07"]').text()).toContain("RESURRECTED");

    // cash-vs-profit lesson pane is on screen
    const cashPane = wrapper.find('[data-test="g5-cash-Month2"]');
    expect(cashPane.exists()).toBe(true);
    expect(cashPane.classes()).toContain("g5-crater");

    // Explain-This-Number: click the free-cash bucket, read its law
    await wrapper.find('[data-test="g5-bucket-row-free"]').trigger("click");
    const dock = wrapper.find('[data-test="g5-explain-panel"]');
    expect(dock.exists()).toBe(true);
    expect(wrapper.find('[data-test="g5-explain-formula"]').text()).toContain("ledger");
    expect(wrapper.findAll('[data-test="g5-explain-input-row"]').length).toBeGreaterThanOrEqual(2);
    await wrapper.find('[data-test="g5-close-explain"]').trigger("click");
    expect(wrapper.find('[data-test="g5-explain-panel"]').exists()).toBe(false);

    // scrub to minute zero: everyone but the whale is still a Lead
    const scrubber = wrapper.find('[data-test="g5-scrubber"]');
    await scrubber.setValue("0");
    expect(wrapper.find('[data-test="g5-kanban-col-offbook"]').text()).not.toContain("c01");
    expect(wrapper.find('[data-test="g5-kanban-col-lead"]').findAll(".g5-card").length).toBe(11);

    // and no deferred/AR money exists yet at minute zero
    expect(wrapper.find('[data-test="g5-bucket-row-deferred"]').text()).toContain("$0.00");
    expect(wrapper.find('[data-test="g5-bucket-row-accountsReceivable"]').text()).toContain("$0.00");
    wrapper.unmount();
  }, 30_000);

  it("exposes the gate mount manifest for the shell integrator", () => {
    expect(GATE_MOUNTS).toHaveLength(1);
    const mount5 = GATE_MOUNTS[0]!;
    expect(mount5.gateId).toBe("G5");
    expect(mount5.mountId).toBe("gate-g5-panel");
    expect(mount5.slot).toBe("stage");
    expect(mount5.component).toBe(Gate5QuarterView);
  });
});
