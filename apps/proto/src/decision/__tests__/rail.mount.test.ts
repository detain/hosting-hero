// @vitest-environment jsdom
/**
 * DecisionRail.vue mount tests — the thin view on the REAL budget singleton
 * and a fresh ExplainRegistry, driven through the sanctioned observed-store
 * write path (ingestProjection), exactly like the chrome mount suite.
 * The App.vue-level wiring is pinned by decisionLaw.test.ts's source scan
 * (this repo mounts the rail through App.vue; no test harness component-
 * mounts App.vue itself — Worker boot makes that unmountable in jsdom).
 */
import { beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { fault, ingestProjection } from "../../state/observedStore";
import { globalBudget } from "../../render/budget";
import { ExplainRegistry } from "../../chrome/explainRegistry";
import DecisionRail from "../DecisionRail.vue";
import { forgeFrame, notice } from "./fixtures";

const SURGE_AT = 900_000_000n;

function surgeFrame(seq: number) {
  return forgeFrame({
    seq,
    counters: { served: 5 },
    notices: [notice("arrival-surge", SURGE_AT)],
  });
}

beforeEach(() => {
  fault("reset"); // clear the singleton store
  globalBudget.clear(); // the rail claims against the app global — start clean
});

describe("DecisionRail.vue", () => {
  it("boots honest: no frames → the empty-state line, no claims", () => {
    const wrapper = mount(DecisionRail, { props: { explain: new ExplainRegistry() } });
    expect(wrapper.find('[data-test="decision-none"]').exists()).toBe(true);
    expect(wrapper.findAll('[data-test="decision-row"]').length).toBe(0);
    expect(globalBudget.snapshot().used.markedDecision).toBe(0);
    wrapper.unmount();
  });

  it("a surge frame marks the fork: row + budget claim + explain entry", async () => {
    const explain = new ExplainRegistry();
    const wrapper = mount(DecisionRail, { props: { explain } });
    ingestProjection(forgeFrame({ seq: 1 }));
    ingestProjection(surgeFrame(2));
    await wrapper.vm.$nextTick();
    const rows = wrapper.findAll('[data-test="decision-row"]');
    expect(rows).toHaveLength(1);
    expect(rows[0]!.attributes("data-kind")).toBe("surge-fork");
    expect(rows[0]!.text()).toContain("Surge on the lane");
    expect(globalBudget.snapshot().used.markedDecision).toBe(1);
    const heldId = `surge-fork:lane/ingress-1:${SURGE_AT}`;
    expect(explain.lookup(`decision:${heldId}`)?.payload.formula).toContain("lane health");
    wrapper.unmount();
    // teardown releases BOTH authorities — two authorities, one truth
    expect(globalBudget.snapshot().used.markedDecision).toBe(0);
    expect(explain.size).toBe(0);
  });

  it('"decided" consumes: row vanishes, slot frees, id never comes back', async () => {
    const explain = new ExplainRegistry();
    const wrapper = mount(DecisionRail, { props: { explain } });
    const first = forgeFrame({ seq: 1 });
    const second = surgeFrame(2);
    ingestProjection(first);
    ingestProjection(second);
    await wrapper.vm.$nextTick();
    const heldId = `surge-fork:lane/ingress-1:${SURGE_AT}`;
    await wrapper.find(`[data-test="decision-ack-${heldId}"]`).trigger("click");
    expect(wrapper.findAll('[data-test="decision-row"]').length).toBe(0);
    expect(globalBudget.snapshot().used.markedDecision).toBe(0);
    expect(explain.lookup(`decision:${heldId}`)).toBeUndefined();
    // a third frame (delta-free) must NOT resurrect the consumed fork
    ingestProjection(forgeFrame({ seq: 3, counters: { served: 5 }, notices: second.notices }));
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('[data-test="decision-row"]').length).toBe(0);
    wrapper.unmount();
  });

  it("crowded frames cap at three rows with an honest +N", async () => {
    const wrapper = mount(DecisionRail, { props: { explain: new ExplainRegistry() } });
    const prev = forgeFrame({ seq: 1, counters: { served: 5, blockedFalsePositive: 0 } });
    const next = forgeFrame({
      seq: 2,
      tick: 42n,
      counters: { served: 6, bounced: 4, blockedFalsePositive: 1, landed: 3 },
      freeCashMicroUsd: 40_000_000n,
      notices: [
        notice("arrival-surge", SURGE_AT),
        { kind: "intent-refused", laneId: null, atUs: SURGE_AT, detail: "connect: slot-occupied" },
      ],
    });
    ingestProjection(prev);
    ingestProjection(next);
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('[data-test="decision-row"]').length).toBe(3);
    const overflow = wrapper.find('[data-test="decision-overflow"]');
    expect(overflow.exists()).toBe(true);
    expect(overflow.text()).toBe("+2");
    expect(globalBudget.snapshot().used.markedDecision).toBe(3);
    expect(globalBudget.clusterCount(`markedDecision:decision-rail`)).toBeGreaterThanOrEqual(2);
    wrapper.unmount();
  });
});
