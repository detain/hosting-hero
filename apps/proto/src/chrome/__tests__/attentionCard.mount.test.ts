// @vitest-environment jsdom
/**
 * AttentionCard mount proof: the wire AttentionSummary (@0b35b15) renders,
 * borrow opens loans LIVE mid-run through the runner's `enterAttentionWindow`
 * seam (E2a seam (a) closed — the clock never resets; the old proof pinned a
 * rebuild-at-minute-0), the bounded refusal surfaces the pipeline's verbatim
 * text while the run keeps its state, and the runner's forwarded month roll
 * services the oldest LIVE-borrowed row. The global observed store stays
 * untouched (self-containment law).
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
  it("starts with an EMPTY planted pool — wire mirror renders, no ledger rows", () => {
    const w = mount(AttentionCard);
    expect(rowText(w, "capacity")).toContain("2");
    expect(rowText(w, "debt")).toContain("0");
    expect(rowText(w, "window")).toContain("0");
    // every loan now opens live: nothing is planted, so the ledger is hidden
    expect(w.find('[data-test="attention-ledger"]').exists()).toBe(false);
    expect(w.get('[data-test="attention-clock"]').text()).toContain("m0 · seq 0");
    expect(projection.value).toBeNull();
  });

  it("a step lands the WIRE roll-up and the clock moves", async () => {
    const w = mount(AttentionCard);
    await w.get('[data-test="attention-step"]').trigger("click");
    expect(w.get('[data-test="attention-clock"]').text()).toContain("m1 · seq 1");
    expect(rowText(w, "debt")).toContain("0");
  });

  it("borrow opens a triage-window loan MID-RUN — the clock keeps running", async () => {
    const w = mount(AttentionCard);
    await w.get('[data-test="attention-step"]').trigger("click");
    await w.get('[data-test="attention-step"]').trigger("click");
    await w.get('[data-test="attention-borrow"]').trigger("click");
    // seam (a) proof: minute/seq UNMOVED (the pre-seam card reset to m0 · seq 0)
    expect(w.get('[data-test="attention-clock"]').text()).toContain("m2 · seq 2");
    expect(rowText(w, "debt")).toContain("1");
    expect(rowText(w, "window")).toContain("1");
    const row = w.get('[data-test="attention-loan-0"]').text();
    expect(row).toContain("triage-window");
    expect(row).toContain("outstanding");
    expect(row).toContain("205"); // host business-minute at tick 2, not minute 0
  });

  it("the grace button opens a grace-kind row — both vocabularies live", async () => {
    const w = mount(AttentionCard);
    await w.get('[data-test="attention-borrow-grace"]').trigger("click");
    expect(w.get('[data-test="attention-loan-0"]').text()).toContain("grace");
    expect(rowText(w, "debt")).toContain("1");
  });

  it("the third borrow hits the bounded refusal verbatim; no row is forged", async () => {
    const w = mount(AttentionCard);
    await w.get('[data-test="attention-borrow"]').trigger("click"); // debt 1
    await w.get('[data-test="attention-borrow-grace"]').trigger("click"); // debt 2
    await w.get('[data-test="attention-borrow"]').trigger("click"); // 3rd refused
    const refusal = w.get('[data-test="attention-borrow-refusal"]').text();
    expect(refusal).toContain("attention-debt: 2 unrepaid focus-hand loan(s) of capacity 2");
    expect(refusal).toContain("the replenish seam must service a row");
    expect(rowText(w, "debt")).toContain("2"); // never 3
    expect(rowText(w, "window")).toContain("2"); // no forged window either
    expect(w.find('[data-test="attention-loan-2"]').exists()).toBe(false);
    // the bound is the LAW, not a disabled button: the attempt was real
    expect(w.get('[data-test="attention-borrow"]').attributes("disabled")).toBeUndefined();
  });

  it("the month roll services the oldest LIVE-borrowed loan — 0→1→serviced, one run", async () => {
    const w = mount(AttentionCard);
    await w.get('[data-test="attention-step"]').trigger("click");
    await w.get('[data-test="attention-borrow"]').trigger("click"); // debt 0→1 mid-run
    expect(rowText(w, "debt")).toContain("1");
    await w.get('[data-test="attention-roll"]').trigger("click"); // ≤430 steps to tick 420
    expect(rowText(w, "debt")).toContain("0");
    expect(w.get('[data-test="attention-loan-0"]').text()).toContain("repaid");
    expect(w.get('[data-test="attention-clock"]').text()).toContain("m420");
    expect(w.get('[data-test="attention-serviced"]').text()).toContain("serviced by month rolls: 1 of 1");
    expect(rowText(w, "replenish")).toContain("43200");
    // the run was CONTINUOUS: seq equals the minute (no rebuild cut the log)
    expect(w.get('[data-test="attention-clock"]').text()).toContain("seq 420");
  }, 30_000);

  it("honesty footer names the closed seam AND the remaining door gap", () => {
    const w = mount(AttentionCard);
    const text = w.get('[data-test="attention-honesty"]').text();
    expect(text).toContain("enterAttentionWindow");
    expect(text).toContain("no borrowing verb"); // the door gap REMAINS stated
    expect(text).not.toContain("rebuilds this private runner at minute 0");
    // the runner-less bound probe line renders while no live refusal stands
    expect(w.get('[data-test="attention-probe"]').text()).toContain("replenish seam must service a row");
  });
});
