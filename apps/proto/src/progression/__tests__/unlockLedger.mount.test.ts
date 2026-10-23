// @vitest-environment jsdom
/**
 * UnlockLedger mount law — the component lays out the model's view and
 * nothing else: bands render with their rows, census counts match, an
 * empty ledger states itself, and the whole mount touches ZERO timers
 * (the house determinism law, vi-spy pattern from flavourFeed).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import UnlockLedger from "../UnlockLedger.vue";
import type { UnlockLedgerCard, UnlockLedgerLine } from "../unlockModel";
import type { UnlockProposal } from "@hh/sim-core/unlocks";

const CARDS: readonly UnlockLedgerCard[] = [
  { id: "hydra", sightings: 0, counters: 0, label: "Hydra Attack" },
  { id: "booter", sightings: 2, counters: 0 },
  { id: "slow-query", sightings: 9, counters: 5 },
];

const LINES: readonly UnlockLedgerLine[] = [
  { id: "cdn", sets: [] },
  { id: "dbaas", sets: [{ tech: ["replicas", "backups"] }] },
];

const PROPOSALS = [
  { via: "scar", targetRef: "practice:postmortem", atTick: 42n, causeId: "economy:death:dissolved:churn:10" },
] as UnlockProposal[];

beforeEach(() => {
  vi.spyOn(globalThis, "setInterval");
  vi.spyOn(globalThis, "setTimeout");
  vi.spyOn(globalThis, "requestAnimationFrame");
});

afterEach(() => {
  expect(globalThis.setInterval).not.toHaveBeenCalled();
  expect(globalThis.setTimeout).not.toHaveBeenCalled();
  expect(globalThis.requestAnimationFrame).not.toHaveBeenCalled();
  vi.restoreAllMocks();
});

describe("UnlockLedger mount", () => {
  it("lays out earned / next / locked with the model's census", () => {
    const wrapper = mount(UnlockLedger, {
      props: { cards: CARDS, lines: LINES, satisfied: [], proposals: PROPOSALS },
    });
    expect(wrapper.find("[data-test='unlock-census']").text().replace(/\s+/g, " ")).toBe(
      "3 earned · 1 in play · 2 still locked",
    );
    expect(wrapper.findAll("[data-test='unlock-earned-row']")).toHaveLength(3);
    expect(wrapper.findAll("[data-test='unlock-next-row']")).toHaveLength(1);
    expect(wrapper.findAll("[data-test='unlock-locked-row']")).toHaveLength(2);
    expect(wrapper.text()).toContain("Hydra Attack");
    expect(wrapper.text()).toContain("mastered — the weather plays by itself now");
    expect(wrapper.text()).toContain("fired via scar at tick 42");
  });

  it("prints each blocked route as a readable lock line", () => {
    const wrapper = mount(UnlockLedger, { props: { lines: LINES, satisfied: [] } });
    const locks = wrapper.findAll("[data-test='unlock-lock-row']");
    expect(locks).toHaveLength(1);
    expect(locks[0]?.text().replace(/\s+/g, " ")).toBe("route 0 — tech: replicas, backups");
  });

  it("renders honest empty-state sentences for a bare mount", () => {
    const wrapper = mount(UnlockLedger, { props: {} });
    expect(wrapper.find("[data-test='unlock-earned-empty']").exists()).toBe(true);
    expect(wrapper.find("[data-test='unlock-next-empty']").exists()).toBe(true);
    expect(wrapper.find("[data-test='unlock-locked-empty']").exists()).toBe(true);
    expect(wrapper.find("[data-test='unlock-census']").text().replace(/\s+/g, " ")).toBe(
      "0 earned · 0 in play · 0 still locked",
    );
  });

  it("marks proposal rows with their trigger kind chip", () => {
    const wrapper = mount(UnlockLedger, { props: { proposals: PROPOSALS } });
    expect(wrapper.find(".row-via").text()).toBe("scar");
  });

  it("feeds satisfied facts through to the lattice verdicts", () => {
    const wrapper = mount(UnlockLedger, {
      props: { lines: [{ id: "dbaas", sets: [{ tech: ["replicas", "backups"] }] }], satisfied: ["replicas", "backups"] },
    });
    expect(wrapper.text()).toContain("a declared route is satisfied");
    expect(wrapper.find("[data-test='unlock-locked-empty']").exists()).toBe(true);
  });

  it("re-projects when props change — no frozen first-mount memory", async () => {
    const wrapper = mount(UnlockLedger, { props: { cards: [CARDS[0] as UnlockLedgerCard] } });
    expect(wrapper.findAll("[data-test='unlock-locked-row']")).toHaveLength(1);
    await wrapper.setProps({ cards: [CARDS[0] as UnlockLedgerCard, CARDS[1] as UnlockLedgerCard] });
    expect(wrapper.findAll("[data-test='unlock-locked-row']")).toHaveLength(1);
    expect(wrapper.findAll("[data-test='unlock-next-row']")).toHaveLength(1);
  });
});
