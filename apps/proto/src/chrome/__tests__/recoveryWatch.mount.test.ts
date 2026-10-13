// @vitest-environment jsdom
/**
 * RecoveryWatch mount proof: the panel boots on the DEFAULT-OFF arm and says
 * "recovery offline" no matter how long the unarmed run steps; arming rebuilds
 * the private runner with the engine fold and the five-kind episode plays into
 * the rows and the tape; the global observed store never hears from it.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import RecoveryWatch from "../RecoveryWatch.vue";
import { fault, projection } from "../../state/observedStore";

beforeEach(() => {
  fault("reset");
});

describe("RecoveryWatch.vue", () => {
  it("boots honest-offline: unarmed memory, no rows, no tape, story buttons locked", () => {
    const w = mount(RecoveryWatch);
    expect(w.find('[data-test="recovery-offline"]').exists()).toBe(true);
    expect(w.get('[data-test="recovery-status"]').attributes("data-status")).toBe("offline");
    expect(w.find('[data-test="recovery-rows"]').exists()).toBe(false);
    expect(w.find('[data-test="recovery-tape"]').exists()).toBe(false);
    expect(w.get('[data-test="recovery-run-first"]').attributes("disabled")).toBeDefined();
    expect(w.get('[data-test="recovery-run-cleared"]').attributes("disabled")).toBeDefined();
    w.unmount();
  });

  it("stepping an unarmed run for an hour keeps the offline line — default-off rendered", async () => {
    const w = mount(RecoveryWatch);
    for (let i = 0; i < 60; i++) await w.get('[data-test="recovery-step"]').trigger("click");
    expect(w.get('[data-test="recovery-minute"]').text()).toContain("m60");
    expect(w.get('[data-test="recovery-status"]').attributes("data-status")).toBe("offline");
    expect(w.find('[data-test="recovery-tape"]').exists()).toBe(false);
    w.unmount();
  });

  it("arming + run-to-first-story starts the tape with the episode voice", async () => {
    const w = mount(RecoveryWatch);
    await w.get('[data-test="recovery-arm"]').trigger("click");
    expect(w.get('[data-test="recovery-status"]').attributes("data-status")).toBe("armed-quiet");
    await w.get('[data-test="recovery-run-first"]').trigger("click");
    expect(w.get('[data-test="recovery-tape"]').text()).toContain("First struggle");
    // episode memory alone is NOT a window — the panel says "watching", not "cleared"
    expect(w.get('[data-test="recovery-status"]').attributes("data-status")).toBe("watching");
    w.unmount();
  });

  it("the full arc renders rows mid-window and clears them at the end (live episode)", async () => {
    const w = mount(RecoveryWatch);
    await w.get('[data-test="recovery-arm"]').trigger("click");
    await w.get('[data-test="recovery-run-first"]').trigger("click");
    let guard = 0;
    while (!w.find('[data-test="recovery-row-edge"]').exists() && guard < 120) {
      await w.get('[data-test="recovery-step"]').trigger("click");
      guard += 1;
    }
    expect(w.find('[data-test="recovery-row-edge"]').exists()).toBe(true);
    expect(w.get('[data-test="recovery-status"]').attributes("data-status")).toBe("live");
    expect(w.get('[data-test="recovery-phase"]').text()).toContain("Shadow window");
    expect(w.get('[data-test="recovery-ramp-pct"]').text()).toMatch(/^\d{1,3}%$/);
    await w.get('[data-test="recovery-run-cleared"]').trigger("click");
    expect(w.find('[data-test="recovery-rows"]').exists()).toBe(false);
    expect(w.get('[data-test="recovery-status"]').attributes("data-status")).toBe("cleared");
    expect(w.get('[data-test="recovery-tape"]').text()).toContain("Window cleared");
    expect(w.get('[data-test="recovery-census"]').text()).toContain("lock-engaged 1");
    w.unmount();
  });

  it("disarming rebuilds to the offline truth (no memory carries across arms)", async () => {
    const w = mount(RecoveryWatch);
    await w.get('[data-test="recovery-arm"]').trigger("click");
    await w.get('[data-test="recovery-run-cleared"]').trigger("click");
    expect(w.find('[data-test="recovery-tape"]').exists()).toBe(true);
    await w.get('[data-test="recovery-arm"]').trigger("click"); // disarm
    expect(w.find('[data-test="recovery-offline"]').exists()).toBe(true);
    expect(w.find('[data-test="recovery-tape"]').exists()).toBe(false);
    expect(w.get('[data-test="recovery-minute"]').text()).toContain("m0");
    w.unmount();
  });

  it("the honesty footer names the advisory arm and its non-authority (gap CLOSED)", () => {
    const w = mount(RecoveryWatch);
    const text = w.get('[data-test="recovery-honesty"]').text();
    expect(text).toContain("recoveryCapacityBps");
    expect(text).toContain("degradedMinutes");
    expect(text).toContain("lastTickFacts");
    expect(text).toContain("serve clamp stays authoritative");
    expect(text).not.toContain("stay unsurfaced"); // the old gap line is gone, pinned gone
    w.unmount();
  });

  it("the advisory arm is honest-offline: unrendered while the fold is unarmed", async () => {
    const w = mount(RecoveryWatch);
    expect(w.find('[data-test="recovery-advisory"]').exists()).toBe(false);
    for (let i = 0; i < 60; i++) await w.get('[data-test="recovery-step"]').trigger("click");
    expect(w.find('[data-test="recovery-advisory"]').exists()).toBe(false);
    w.unmount();
  });

  it("the live advisory arc: edge surfaces at the episode, capacity dips, failback flips after clear", async () => {
    const w = mount(RecoveryWatch);
    await w.get('[data-test="recovery-arm"]').trigger("click");
    expect(w.get('[data-test="recovery-advisory-authority"]').text()).toContain("engine clamp authoritative");
    expect(w.find('[data-test="recovery-advisory-quiet"]').exists()).toBe(true);
    await w.get('[data-test="recovery-run-first"]').trigger("click");
    // advisory threshold 2 opens edge the SAME minute the engine speaks its episode (m45)
    expect(w.get('[data-test="recovery-minute"]').text()).toContain("m45");
    const row = w.get('[data-test="advisory-row-edge"]');
    expect(row.find('[data-test="advisory-phase"]').text()).toContain("Down");
    expect(row.find('[data-test="advisory-capacity-pct"]').text()).toBe("0%");
    expect(row.find('[data-test="advisory-failback"]').text()).toBe("hold");
    // step to the engine's lock minute (53): advisory is mid-crew-delay/ramp — below full
    let guard = 0;
    while (w.get('[data-test="recovery-minute"]').text().indexOf("m53") === -1 && guard < 20) {
      await w.get('[data-test="recovery-step"]').trigger("click");
      guard += 1;
    }
    const mid = w.get('[data-test="advisory-row-edge"]');
    expect(mid.find('[data-test="advisory-capacity-pct"]').text()).toBe("33%"); // 3250 bps ramping
    expect(mid.find('[data-test="advisory-degraded"]').text()).toBe("8m");
    expect(mid.find('[data-test="advisory-crew"]').text()).toContain("ramping #1");
    // run past the advisory's own story: completed @80, failback hold, ready @95
    await w.get('[data-test="recovery-run-cleared"]').trigger("click"); // engine clears @78
    let steps = 0;
    while (
      !w.findAll('[data-test="advisory-failback"]').some((f) => f.text() === "ready") &&
      steps < 40
    ) {
      await w.get('[data-test="recovery-step"]').trigger("click");
      steps += 1;
    }
    const done = w.get('[data-test="advisory-row-edge"]');
    expect(done.find('[data-test="advisory-phase"]').text()).toContain("Recovered");
    expect(done.find('[data-test="advisory-capacity-pct"]').text()).toBe("100%");
    expect(w.get('[data-test="recovery-minute"]').text()).toContain("m95");
    expect(done.find('[data-test="advisory-failback"]').text()).toBe("ready");
    // rows linger after recovery — the observer MEMORY, not a live outage
    expect(w.get('[data-test="recovery-advisory-meter"]').text()).toContain("open 0");
    expect(w.get('[data-test="recovery-advisory-meter"]').text()).toContain("degraded-minutes 35");
    w.unmount();
  });

  it("writes nothing to the shell's global store (self-containment law)", async () => {
    const w = mount(RecoveryWatch);
    await w.get('[data-test="recovery-arm"]').trigger("click");
    await w.get('[data-test="recovery-run-cleared"]').trigger("click");
    expect(projection.value).toBeNull();
    w.unmount();
  });
});
