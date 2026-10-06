// @vitest-environment jsdom
/**
 * Chrome SFC mount tests — the lab end-to-end on the REAL SimCoreRunner
 * stream plus targeted mounts for the clock ribbon, the panic klaxon swap,
 * the pin buttons, and the status chip. Everything reads the observed-store
 * singletons; the sanctioned write path is ingestProjection, cleared between
 * tests with fault(). Mounts are unmounted to release BudgetManager claims.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { asEntityId, observedKey } from "@hh/sim-core";
import { fault, ingestProjection } from "../../state/observedStore";
import { MockSimRunner } from "../../runner/mockSimRunner";
import TopBar from "../TopBar.vue";
import ClockRibbon from "../ClockRibbon.vue";
import PanicLayout from "../PanicLayout.vue";
import StatusChip from "../StatusChip.vue";
import HudLabPanel from "../HudLabPanel.vue";
import { GATE_MOUNTS } from "../index";
import type { MetricCandidate } from "../promotion";
import type { RibbonEntry } from "../clockRibbon";
import type { SimProjection } from "../../shared/protocol";

const MIN = 60_000_000n;
const DAY = 86_400_000_000n;

function warmProjection(seed = 404): SimProjection {
  const runner = new MockSimRunner(seed);
  let p = runner.headlessStep(100);
  for (let i = 0; i < 30; i++) p = runner.headlessStep(100);
  return p;
}

/** Entries anchored to a REAL projection's clocks — the mock's elapsed
 *  minutes are its own business; the ribbon test must not assume them. */
function entriesAround(p: SimProjection): readonly RibbonEntry[] {
  return [
    { id: "patience", label: "visitor patience", track: "ops", dueUs: p.clocks.simUs + 10n * MIN, consequence: 0.9 },
    { id: "wave", label: "next wave", track: "ops", dueUs: p.clocks.simUs + 60n * MIN, consequence: 0.7 },
    { id: "payroll", label: "payroll", track: "business", dueUs: p.clocks.businessUs + 6n * DAY, consequence: 1 },
    { id: "audit", label: "quarter audit", track: "business", dueUs: p.clocks.businessUs + 10n * DAY, consequence: 0.4 },
  ];
}

beforeEach(() => {
  fault("reset"); // clear the singleton store between tests
});

describe("ClockRibbon.vue", () => {
  it("boots honest: no projection → no pips, no crash, heads show '?'", () => {
    const wrapper = mount(ClockRibbon, { props: { entries: [] as readonly RibbonEntry[] } });
    expect(wrapper.find('[data-test="clock-head-none"]').exists()).toBe(true);
    expect(wrapper.findAll(".pip").length).toBe(0);
    wrapper.unmount();
  });

  it("three heads + two tracks + at most three labelled pips (§7.9)", () => {
    const p = warmProjection();
    ingestProjection(p);
    const wrapper = mount(ClockRibbon, { props: { entries: entriesAround(p) } });
    for (const kind of ["ops", "business", "wall"]) {
      expect(wrapper.find(`[data-test="clock-head-${kind}"]`).exists()).toBe(true);
    }
    expect(wrapper.find('[data-test="ribbon-track-ops"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="ribbon-track-business"]').exists()).toBe(true);
    const enlarged = wrapper.findAll(".pip--enlarged");
    expect(enlarged.length).toBeLessThanOrEqual(3);
    expect(enlarged.length).toBeGreaterThan(0);
    expect(wrapper.findAll(".pip--tick").length).toBeGreaterThan(0); // the rest stay grey ticks
    wrapper.unmount(); // frees the promotedClock claims for later mounts
  });

  it("scrubbing is a control, not decoration: offsets change, reset returns", async () => {
    const p = warmProjection();
    ingestProjection(p);
    const wrapper = mount(ClockRibbon, { props: { entries: entriesAround(p) } });
    const leftBefore = wrapper.find('[data-test="ribbon-pip-patience"]').attributes("style");
    expect(leftBefore).toBeDefined();
    await wrapper.find('[data-test="ribbon-scrub-right"]').trigger("click");
    expect(wrapper.find('[data-test="ribbon-pip-patience"]').attributes("style")).not.toBe(leftBefore);
    await wrapper.find('[data-test="ribbon-reset"]').trigger("click");
    expect(wrapper.find('[data-test="ribbon-pip-patience"]').attributes("style")).toBe(leftBefore);
    wrapper.unmount();
  });
});

describe("StatusChip.vue", () => {
  it("renders label + notch; off-vocabulary degrades to UNVERIFIED", () => {
    const chip = mount(StatusChip, { props: { value: "COMPROMISED" } });
    expect(chip.text()).toContain("COMPROMISED");
    expect(chip.find("svg path").exists()).toBe(true);
    const fog = mount(StatusChip, { props: { value: "WHO-KNOWS" } });
    expect(fog.attributes("data-status")).toBe("UNVERIFIED");
  });
});

describe("PanicLayout.vue — the Big Number Rule swap", () => {
  /** Hand-built frame with every instrument nominal and zero notices — the
   *  mock's late frames drift into alarm on their own, and the calm fixture
   *  must not depend on where the script happens to be at step 30. */
  function quietProjection(): SimProjection {
    const cell = (value: bigint | number) => ({
      value,
      fidelity: 4 as const,
      freshnessUs: 0n,
      coverage: 65536n,
      certainty: 65536n,
      status: "live" as const,
    });
    return {
      seq: 1,
      tick: 1n,
      minute: 1,
      clocks: { realUs: 1_000_000n, simUs: MIN, businessUs: DAY, wallUs: 1_000_000n },
      lanes: [],
      observed: new Map([
        [observedKey(asEntityId("node/app-1"), "utilizationRho"), cell(6554n)], // 0.1
        [observedKey(asEntityId("node/app-1"), "queueDepth"), cell(4)],
        [observedKey(asEntityId("node/app-1"), "health"), cell(65536n)], // 1.0
        [observedKey(asEntityId("node/app-1"), "p50LatencyUs"), cell(80_000)],
        [observedKey(asEntityId("lane/ingress-1"), "falsePositives"), cell(3)],
      ]),
      notices: [],
      counters: { served: 10, bounced: 0, blockedFalsePositive: 0, landed: 0 },
      freeCashMicroUsd: 250_000_000_000n, // $250k — abbreviated, above the floor
    };
  }

  function withAlarm(p: SimProjection): SimProjection {
    const observed = new Map(p.observed);
    observed.set(observedKey(asEntityId("node/app-1"), "queueDepth"), {
      value: 79, // > inst-queue threshold 55 → alarm
      fidelity: 4,
      freshnessUs: 0n,
      coverage: 65536n,
      certainty: 65536n,
      status: "live",
    });
    return { ...p, observed, counters: { ...p.counters, blockedFalsePositive: 3, landed: 1 } };
  }

  it("no ground-truth alarm → no incident headline (cash world intact)", () => {
    vi.useFakeTimers();
    ingestProjection(quietProjection());
    const wrapper = mount(PanicLayout, { slots: { default: '<div data-hud-optional="true">chrome noise</div>' } });
    expect(wrapper.attributes("data-panic-level")).toBe("calm");
    expect(wrapper.find('[data-test="panic-headline"]').exists()).toBe(false);
    wrapper.unmount();
    vi.useRealTimers();
  });

  it("alarm: THE number becomes incident cost = fp × 20s fee, role=alert", () => {
    vi.useFakeTimers();
    ingestProjection(withAlarm(quietProjection()));
    const wrapper = mount(PanicLayout, { slots: { default: '<div data-hud-optional="true">chrome noise</div>' } });
    expect(wrapper.attributes("data-panic-level")).toBe("panic");
    const headline = wrapper.find('[data-test="panic-headline"]');
    expect(headline.exists()).toBe(true);
    expect(headline.attributes("role")).toBe("alert");
    expect(headline.text()).toContain("incident cost");
    expect(headline.find(".big").text()).toBe("$60.00"); // 3 × 20,000,000 µ$ = $60
    vi.advanceTimersByTime(600); // budget sampler ticks without throwing
    wrapper.unmount();
    vi.useRealTimers();
  });
});

describe("TopBar.vue pin UI", () => {
  const cands: readonly MetricCandidate[] = [
    { id: "cash", label: "cash", kind: "permanent", value: 1, threshold: null, direction: "up", span: 1 },
    { id: "rho", label: "ρ", kind: "promotable", value: 98, threshold: 100, direction: "up", span: 100 },
    { id: "q", label: "queue", kind: "promotable", value: 97, threshold: 100, direction: "up", span: 100 },
    { id: "far", label: "far", kind: "promotable", value: 1, threshold: 100, direction: "up", span: 100 },
  ];

  it("emits toggle-pin with the metric id; extra permanent rows render", async () => {
    const wrapper = mount(TopBar, {
      props: {
        cashLabel: "Cash $9.99",
        clockLabel: "Run T+0h30m",
        candidates: cands,
        permanentRows: [
          { id: "cash", label: "cash", value: "$9.99", numeric: 9.99, state: "live" },
          { id: "mrr", label: "MRR", value: "$50.00", numeric: 50, state: "live" },
          { id: "reputation", label: "reputation", value: "?", numeric: null, state: "no-data" },
          { id: "clock", label: "run clock", value: "T+0h30m", numeric: null, state: "live" },
        ],
        pins: { rho: true },
      },
    });
    expect(wrapper.findAll('[data-test="hud-permanent"]').length).toBe(2); // MRR + reputation only
    expect(wrapper.find('[data-metric="mrr"]').text()).toContain("$50.00");
    expect(wrapper.find('[data-metric="reputation"]').classes()).toContain("is-no-data");
    const pins = wrapper.findAll('[data-test="pin-toggle"]');
    expect(pins.length).toBe(2); // exactly the two promoted chips wear pin buttons
    expect(wrapper.find('[data-metric="rho"]').attributes("data-pinned")).toBe("true");
    await pins[0]!.trigger("click");
    expect(wrapper.emitted("toggle-pin")?.[0]).toEqual(["rho"]);
  });
});

describe("HudLabPanel.vue — the whole kit on the live engine", () => {
  it("steps the real SimCoreRunner into the store and every law shows up", async () => {
    const wrapper = mount(HudLabPanel, { props: { seed: 904 } });
    expect(wrapper.find('[data-test="hud-lab"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="alert-empty"]').text()).toContain("quiet");

    await wrapper.find('[data-test="lab-step"]').trigger("click");
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-test="lab-seq"]').text()).toContain("seq");
    expect(wrapper.find('[data-test="hud-ribbon"]').exists()).toBe(true);
    expect(wrapper.findAll('[data-test^="clock-head-"]').length).toBe(3);
    expect(wrapper.findAll('[data-test="hud-permanent"]').length).toBe(2); // MRR + reputation ride-alongs
    expect(wrapper.findAll('[data-test="status-chip"]').length).toBe(12);
    expect(wrapper.find('[data-test="panic-layout"]').exists()).toBe(true);

    // Explain-This-Number: click → popover → click an input → child → back.
    await wrapper.find('[data-test="explain-value"] button').trigger("click");
    const popover = wrapper.find('[data-test="explain-popover"]');
    expect(popover.exists()).toBe(true);
    expect(popover.text()).toContain("ρ = arrivals × service time / capacity");
    await wrapper.find('[data-test="explain-input-bounced"]').trigger("click");
    expect(popover.text()).toContain("bounces = queue overflow + patience expiry");
    await wrapper.find('[data-test="explain-back"]').trigger("click");
    expect(popover.text()).toContain("utilization ρ");
    await wrapper.find('[data-test="explain-close"]').trigger("click");
    expect(wrapper.find('[data-test="explain-popover"]').exists()).toBe(false);

    // Ribbon pips exist on the strip against the live clock, ≤3 labelled.
    const pips = wrapper.findAll(".pip");
    expect(pips.length).toBeGreaterThan(0);
    expect(wrapper.findAll(".pip--enlarged").length).toBeLessThanOrEqual(3);

    await wrapper.find('[data-test="lab-step"]').trigger("click"); // keep stepping: no crash
    expect(wrapper.find('[data-test="hud-lab"]').exists()).toBe(true);
    wrapper.unmount();
  });
});

describe("HUD-LAB mount manifest (integrator contract)", () => {
  it("is frozen in the exact GATE_MOUNTS shape", () => {
    expect(Object.isFrozen(GATE_MOUNTS)).toBe(true);
    expect(GATE_MOUNTS.length).toBe(1);
    const entry = GATE_MOUNTS[0]!;
    expect(Object.isFrozen(entry)).toBe(true);
    expect(entry.gateId).toBe("HUD-LAB");
    expect(entry.mountId).toBe("hud-lab-panel");
    expect(entry.slot).toBe("stage");
    expect(entry.component).toBe(HudLabPanel);
    expect(typeof entry.title).toBe("string");
    expect(typeof entry.description).toBe("string");
  });
});
