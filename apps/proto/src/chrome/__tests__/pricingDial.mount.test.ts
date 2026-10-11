// @vitest-environment jsdom
/**
 * PricingDial mount proof: clicking SEND puts a real adjust-price order
 * through the real door on the panel's PRIVATE runner and renders the
 * verdict; the invalid-price probe renders the refusal. The global observed
 * store must stay untouched by the dial (self-containment law).
 */
import { beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import PricingDial from "../PricingDial.vue";
import { fault, projection } from "../../state/observedStore";
import { DEMO_PLANS, priceLadder } from "../pricingDial";

beforeEach(() => {
  fault("reset");
});

describe("PricingDial", () => {
  it("starts at the base rung of the first plan", () => {
    const w = mount(PricingDial);
    expect(w.find('[data-test="dial-rung-1"]').classes()).toContain("on");
    const base = priceLadder(DEMO_PLANS[0]!.baseMicroUsd)[1]!;
    expect(w.find('[data-test="dial-send"]').text()).toContain(String(Number(base) / 1_000_000));
  });

  it("submit lands an EXECUTED receipt line naming the verb", async () => {
    const w = mount(PricingDial);
    await w.get('[data-test="dial-send"]').trigger("click");
    const log = w.get('[data-test="dial-log"]').text();
    expect(log).toContain("adjust-price");
    expect(log).not.toContain(":"); // executed detail is the bare verb
    // the dial never writes the shell's store
    expect(projection.value).toBeNull();
  });

  it("the invalid-price probe shows the door refusing, reason and all", async () => {
    const w = mount(PricingDial);
    await w.get('[data-test="dial-refuse-probe"]').trigger("click");
    expect(w.get('[data-test="dial-log"]').text()).toContain("adjust-price: invalid-price");
  });

  it("plan switch moves the ladder; the double rung submits a bigger order", async () => {
    const w = mount(PricingDial);
    const second = DEMO_PLANS[1]!;
    await w.get(`[data-test="dial-plan-${second.id}"]`).trigger("click");
    await w.get('[data-test="dial-rung-2"]').trigger("click");
    await w.get('[data-test="dial-send"]').trigger("click");
    const doubled = priceLadder(second.baseMicroUsd)[2]!;
    expect(w.get('[data-test="dial-log"]').text()).toContain(String(Number(doubled) / 1_000_000));
    expect(w.get('[data-test="dial-tick"]').text()).toContain("door tick");
  });

  it("honesty footer is rendered — no claim that money moved", () => {
    const w = mount(PricingDial);
    expect(w.get('[data-test="dial-honesty"]').text()).toContain("host seam");
  });
});
