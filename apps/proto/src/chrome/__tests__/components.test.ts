// @vitest-environment jsdom
/**
 * Mount-level proof that the DOM Chrome tier renders the laws: promotion
 * slots with "+N", the five faces resolving inside bezels, Readout Mode
 * replacing face with honest text, and NO DATA drawing "?" (never 0).
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import TopBar from "../TopBar.vue";
import CounterFace from "../instruments/CounterFace.vue";
import InstrumentBezel from "../instruments/InstrumentBezel.vue";
import ChromaMeter from "../ChromaMeter.vue";
import { G1_INSTRUMENTS } from "../instruments/registry";
import { BudgetManager } from "../../render/budget";
import { fault, ingestProjection } from "../../state/observedStore";
import { MockSimRunner } from "../../runner/mockSimRunner";
import type { MetricCandidate } from "../promotion";

const candidate = (over: Partial<MetricCandidate> & { id: string }): MetricCandidate => ({
  label: over.id,
  kind: "promotable",
  value: 50,
  threshold: 100,
  direction: "up",
  span: 100,
  ...over,
});

beforeEach(() => {
  fault("reset"); // clear the singleton store between tests
});

describe("TopBar", () => {
  it("renders permanents + exactly 2 promoted + +N collapse", () => {
    const wrapper = mount(TopBar, {
      props: {
        cashLabel: "Cash $12.5k",
        clockLabel: "Run T+0h04m",
        candidates: [
          candidate({ id: "cash", kind: "permanent" }),
          candidate({ id: "near", value: 98 }),
          candidate({ id: "nearer", value: 99 }),
          candidate({ id: "far", value: 3 }),
        ],
      },
    });
    expect(wrapper.text()).toContain("Cash $12.5k");
    expect(wrapper.findAll(".promoted-chip").length).toBe(2);
    expect(wrapper.find('[data-collapse]').text()).toBe("+1");
  });

  it("no overflow → no cluster chip", () => {
    const wrapper = mount(TopBar, {
      props: { cashLabel: "c", clockLabel: "t", candidates: [candidate({ id: "a", value: 99 })] },
    });
    expect(wrapper.find('[data-collapse]').exists()).toBe(false);
  });
});

describe("faces inside bezels", () => {
  it("CounterFace shows '?' for no-data — the nothing-not-zero contract", () => {
    const wrapper = mount(CounterFace, {
      props: { ratio: null, thresholdRatio: 0.5, state: "no-data", isStill: true },
    });
    expect(wrapper.text()).toBe("?");
  });

  it("InstrumentBezel binds a live mock cell into a needle reading", () => {
    ingestProjection(new MockSimRunner(55).headlessStep(100));
    const def = G1_INSTRUMENTS.find((d) => d.id === "inst-rho")!;
    const wrapper = mount(InstrumentBezel, { props: { def, readout: false } });
    expect(wrapper.find("svg").exists()).toBe(true);
    expect(wrapper.text()).toContain("Load ρ");
    expect(wrapper.text()).toContain("nominal 0–0.7 ρ");
  });

  it("Readout Mode swaps the diegetic face for the honest text", () => {
    ingestProjection(new MockSimRunner(55).headlessStep(100));
    const def = G1_INSTRUMENTS.find((d) => d.id === "inst-fp")!;
    const wrapper = mount(InstrumentBezel, { props: { def, readout: true } });
    expect(wrapper.find(".readout").exists()).toBe(true);
    expect(wrapper.find(".counter").exists()).toBe(false);
  });

  it("a fogged instrument (p99 unknown) explains itself in the footer", () => {
    ingestProjection(new MockSimRunner(55).headlessStep(100));
    const def = {
      ...G1_INSTRUMENTS.find((d) => d.id === "inst-rho")!,
      property: "p99LatencyUs",
      id: "inst-fog",
      scale: "raw" as const,
    };
    const wrapper = mount(InstrumentBezel, { props: { def, readout: false } });
    expect(wrapper.text()).toContain("?");
    expect(wrapper.text()).toContain("fog: not instrumented");
  });
});

describe("ChromaMeter", () => {
  it("views the budget manager on its sample tick and turns red on breach", async () => {
    vi.useFakeTimers();
    try {
      const budget = new BudgetManager();
      budget.admit({ id: "o1", category: "overlay", priority: 1 });
      budget.admit({ id: "o2", category: "overlay", priority: 1 }); // refused → cluster
      const wrapper = mount(ChromaMeter, { props: { budget, visible: true } });
      await vi.advanceTimersByTimeAsync(600); // past one 500 ms sample
      expect(wrapper.text()).toContain("CHROMA METER");
      expect(wrapper.find(".chroma").classes()).toContain("breach");
      expect(wrapper.text()).toContain("1/1"); // overlay used/cap
    } finally {
      vi.useRealTimers();
    }
  });
});
