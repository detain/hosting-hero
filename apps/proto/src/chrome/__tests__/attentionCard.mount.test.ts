// @vitest-environment jsdom
/**
 * AttentionCard mount proof: the wire AttentionSummary (@0b35b15) renders,
 * borrow REBUILDS at minute 0 with one more planted loan (construction-only
 * seam, pinned by the clock reset), the bounded refusal shows past capacity,
 * and the runner's forwarded month roll actually services the oldest row.
 * The global observed store stays untouched (self-containment law).
 */
import { beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import AttentionCard from "../AttentionCard.vue";
import { fault, projection } from "../../state/observedStore";

beforeEach(() => {
  fault("reset");
});

function rowText(w: ReturnType<typeof mount>, id: string): string {
  return w.get(`[data-test="attention-row-${id}"]`).text();
}

describe("AttentionCard", () => {
  it("starts planted with one triage-window loan — wire mirror renders", () => {
    const w = mount(AttentionCard);
    expect(rowText(w, "capacity")).toContain("2");
    expect(rowText(w, "debt")).toContain("1");
    expect(rowText(w, "window")).toContain("1");
    expect(w.get('[data-test="attention-loan-0"]').text()).toContain("triage-window");
    expect(w.get('[data-test="attention-loan-0"]').text()).toContain("outstanding");
    // honest pre-first-step state: the render is the pure mirror, clock at 0
    expect(w.get('[data-test="attention-clock"]').text()).toContain("m0 · seq 0");
    expect(projection.value).toBeNull();
  });

  it("a step lands the WIRE roll-up and the clock moves", async () => {
    const w = mount(AttentionCard);
    await w.get('[data-test="attention-step"]').trigger("click");
    expect(w.get('[data-test="attention-clock"]').text()).toContain("m1 · seq 1");
    expect(rowText(w, "debt")).toContain("1");
  });

  it("borrow rebuilds at minute 0 with debt 2 — the entry seam is construction-only", async () => {
    const w = mount(AttentionCard);
    await w.get('[data-test="attention-step"]').trigger("click");
    await w.get('[data-test="attention-step"]').trigger("click");
    await w.get('[data-test="attention-borrow"]').trigger("click");
    expect(w.get('[data-test="attention-clock"]').text()).toContain("m0 · seq 0");
    expect(rowText(w, "debt")).toContain("2");
    expect(w.get('[data-test="attention-loan-1"]').text()).toContain("outstanding");
  });

  it("a third borrow hits the bounded refusal, shown verbatim; more is disabled", async () => {
    const w = mount(AttentionCard);
    await w.get('[data-test="attention-borrow"]').trigger("click"); // 2 loans
    await w.get('[data-test="attention-borrow"]').trigger("click"); // 3rd attempt refused
    const refusal = w.get('[data-test="attention-borrow-refusal"]').text();
    expect(refusal).toContain("attention-debt: 2 unrepaid focus-hand loan(s) of capacity 2");
    expect(rowText(w, "debt")).toContain("2"); // never 3
    expect(w.get('[data-test="attention-borrow"]').attributes("disabled")).toBeDefined();
  });

  it("the month roll services the oldest loan — runner-forwarded, watched not faked", async () => {
    const w = mount(AttentionCard);
    await w.get('[data-test="attention-roll"]').trigger("click");
    // 43200-minute business grid crosses at tick 420; debt 1 -> 0, repaid chip lands
    expect(rowText(w, "debt")).toContain("0");
    expect(w.get('[data-test="attention-loan-0"]').text()).toContain("repaid");
    expect(w.get('[data-test="attention-clock"]').text()).toContain("m420");
    expect(w.get('[data-test="attention-serviced"]').text()).toContain("serviced by month rolls: 1 of 1");
    // the replenish stamp comes from the local accessor read
    expect(rowText(w, "replenish")).toContain("43200");
  }, 30_000);

  it("honesty footer names the missing seams instead of hiding them", () => {
    const w = mount(AttentionCard);
    const text = w.get('[data-test="attention-honesty"]').text();
    expect(text).toContain("no borrowing verb");
    expect(text).toContain("rebuilds this private runner at minute 0");
    // the runner-less bound probe line always renders its refusal text
    expect(w.get('[data-test="attention-probe"]').text()).toContain("replenish seam must service a row");
  });
});
