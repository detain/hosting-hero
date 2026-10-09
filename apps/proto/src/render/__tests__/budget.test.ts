/**
 * The admission gate — "enforced by the renderer, not by authoring discipline".
 * Every cap from the §1.9 roster, refusal → "+N" cluster, preemption, pins.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { BudgetError, BudgetManager, LABEL_CAP_BY_ALTITUDE, type AdmitRequest, type BudgetCategory } from "../budget";

let budget: BudgetManager;
beforeEach(() => {
  budget = new BudgetManager();
});

const req = (over: Partial<AdmitRequest> & { id: string }): AdmitRequest => ({
  category: "alertHue",
  hue: "red",
  priority: 50,
  ...over,
});

describe("alert hue triad (≤3 active hues)", () => {
  it("admits three distinct hues, refuses the fourth into a cluster", () => {
    expect(budget.admit(req({ id: "a", hue: "red" })).admitted).toBe(true);
    expect(budget.admit(req({ id: "b", hue: "amber" })).admitted).toBe(true);
    expect(budget.admit(req({ id: "c", hue: "cyan" })).admitted).toBe(true);
    const verdict = budget.admit(req({ id: "d", hue: "magenta", region: "rack-4" }));
    expect(verdict.admitted).toBe(false);
    if (verdict.admitted) return;
    expect(verdict.reason).toBe("hue-budget");
    expect(verdict.clusterId).toBe("alertHue:rack-4");
    expect(budget.clusterCount("alertHue:rack-4")).toBe(1);
  });

  it("same-hue alerts SHARE the hue slot (budget counts hues, not alerts)", () => {
    budget.admit(req({ id: "a", hue: "red" }));
    expect(budget.admit(req({ id: "b", hue: "red" })).admitted).toBe(true);
    expect(budget.admit(req({ id: "c", hue: "amber" })).admitted).toBe(true);
    expect(budget.admit(req({ id: "d", hue: "cyan" })).admitted).toBe(true);
    expect(budget.snapshot().used.alertHue).toBe(4); // four alerts, three hues
  });

  it("release frees the hue for a new one", () => {
    budget.admit(req({ id: "a", hue: "red" }));
    budget.admit(req({ id: "b", hue: "amber" }));
    budget.admit(req({ id: "c", hue: "cyan" }));
    budget.release("a");
    expect(budget.admit(req({ id: "d", hue: "magenta" })).admitted).toBe(true);
  });

  it("a higher-priority newcomer preempts the weakest hue-holder (3rd+ aggregates)", () => {
    budget.admit(req({ id: "a", hue: "red", priority: 10 }));
    budget.admit(req({ id: "b", hue: "amber", priority: 20 }));
    budget.admit(req({ id: "c", hue: "cyan", priority: 30 }));
    const verdict = budget.admit(req({ id: "klaxon", hue: "magenta", priority: 90 }));
    expect(verdict.admitted).toBe(true);
    if (!verdict.admitted) return;
    expect(verdict.evicted).toEqual(["a"]);
    expect(budget.clusterCount("alertHue:global")).toBe(1); // the evicted one clusters
  });

  it("pinned holders cannot be preempted — the klaxon aggregates instead", () => {
    budget.admit(req({ id: "pinned", hue: "red", priority: 1, pinned: true }));
    budget.admit(req({ id: "pinned2", hue: "amber", priority: 1, pinned: true }));
    budget.admit(req({ id: "pinned3", hue: "cyan", priority: 1, pinned: true }));
    const verdict = budget.admit(req({ id: "klaxon", hue: "magenta", priority: 100 }));
    expect(verdict.admitted).toBe(false);
    expect(budget.snapshot().holders.every((h) => h.id.startsWith("pinned"))).toBe(true);
  });

  it("sub-klaxon newcomers never evict — 4th hue aggregates to +N", () => {
    budget.admit(req({ id: "a", hue: "red", priority: 10 }));
    budget.admit(req({ id: "b", hue: "amber", priority: 20 }));
    budget.admit(req({ id: "c", hue: "cyan", priority: 30 }));
    expect(budget.admit(req({ id: "loud", hue: "magenta", priority: 89 })).admitted).toBe(false);
    expect(budget.snapshot().holders.length).toBe(3);
  });

  it("klaxon preemption also works on count-capped categories (event FX)", () => {
    for (let i = 0; i < 5; i++) budget.admit({ id: `fx${i}`, category: "eventFx", priority: 10 });
    const verdict = budget.admit({ id: "big-one", category: "eventFx", priority: 95 });
    expect(verdict.admitted).toBe(true);
    if (!verdict.admitted) return;
    expect(verdict.evicted.length).toBe(1);
  });

  it("off-ledger alert hues are an authoring bug, not a refusal", () => {
    expect(() => budget.admit(req({ id: "x", hue: "chartreuse" })).admitted).toThrow(BudgetError);
    expect(() => budget.admit(req({ id: "x", hue: "chartreuse" })).admitted).toThrow(
      /budget\[off-ledger-hue\].*Hue Ledger/,
    );
  });

  it("re-admitting a live claim refreshes, never double-draws", () => {
    budget.admit(req({ id: "a", hue: "red" }));
    const again = budget.admit(req({ id: "a", hue: "red" }));
    expect(again.admitted).toBe(true);
    expect(budget.snapshot().used.alertHue).toBe(1);
  });
});

describe("count caps", () => {
  it("1 overlay", () => {
    expect(budget.admit({ id: "o1", category: "overlay", priority: 5 }).admitted).toBe(true);
    expect(budget.admit({ id: "o2", category: "overlay", priority: 5 }).admitted).toBe(false);
  });

  it("5 event FX, 6th clusters", () => {
    for (let i = 0; i < 5; i++) {
      expect(budget.admit({ id: `fx${i}`, category: "eventFx", priority: 40 }).admitted).toBe(true);
    }
    const sixth = budget.admit({ id: "fx6", category: "eventFx", priority: 40, region: "lane-1" });
    expect(sixth.admitted).toBe(false);
    if (sixth.admitted) return;
    expect(budget.clusterCount(sixth.clusterId)).toBe(1);
  });

  it("≤3 promoted clocks, ≤3 marked decisions, ≤3 inbox cards, 1 modal", () => {
    for (const [category, cap] of [
      ["promotedClock", 3],
      ["markedDecision", 3],
      ["inboxCard", 3],
      ["modal", 1],
    ] as const) {
      for (let i = 0; i < cap; i++) {
        expect(budget.admit({ id: `${category}${i}`, category, priority: 30 }).admitted).toBe(true);
      }
      expect(budget.admit({ id: `${category}overflow`, category, priority: 30 }).admitted).toBe(false);
    }
  });
});

describe("label budgets per altitude", () => {
  it("caps at the altitude table (30 at Z3), pinned labels exempt", () => {
    const cap = LABEL_CAP_BY_ALTITUDE.Z3;
    for (let i = 0; i < cap; i++) {
      expect(budget.admit({ id: `l${i}`, category: "label", priority: 10, altitude: "Z3" }).admitted).toBe(true);
    }
    expect(budget.admit({ id: "late", category: "label", priority: 10, altitude: "Z3" }).admitted).toBe(false);
    expect(budget.admit({ id: "pin", category: "label", priority: 0, altitude: "Z3", pinned: true }).admitted).toBe(true);
  });

  it("Z4 earns fewer labels than Z1", () => {
    expect(LABEL_CAP_BY_ALTITUDE.Z4).toBeLessThan(LABEL_CAP_BY_ALTITUDE.Z1);
  });
});

describe("snapshot for the ChromaMeter", () => {
  it("counts active hues, used per category, clusters, and flags breach on refusal", () => {
    budget.admit(req({ id: "a", hue: "red" }));
    budget.admit({ id: "o", category: "overlay", priority: 1 });
    budget.admit({ id: "o2", category: "overlay", priority: 1 });
    const snap = budget.snapshot();
    expect(snap.activeHues).toEqual(["red"]);
    expect(snap.used.overlay).toBe(1);
    expect(snap.clusters["overlay:global"]).toBe(1);
    expect(snap.breach).toBe(true);
  });

  it("clean room: no breach", () => {
    const snap = budget.snapshot();
    expect(snap.breach).toBe(false);
    expect(snap.holders).toEqual([]);
  });
});

describe("unknown-category law — fail loud, never a silent admission", () => {
  it("admit() throws budget[unknown-category] naming the forged category", () => {
    const forged = () =>
      budget.admit({ id: "forged", category: "substrate" as BudgetCategory, priority: 50 });
    expect(forged).toThrow(BudgetError);
    expect(forged).toThrowError(
      /budget\[unknown-category\]: 'substrate' not in BUDGET_CAPS — widen the closed union or use an existing category/,
    );
    // The throw is atomic: the request never reaches the ledger.
    expect(budget.snapshot().holders).toEqual([]);
    const used = budget.snapshot().used as Readonly<Record<string, number | undefined>>;
    expect(used.substrate).toBeUndefined(); // the old NaN slot can no longer form
    expect(budget.clusterCount("substrate:global")).toBe(0); // refusal clustering never engages
  });

  it("the guard stands at the door, before every other check", () => {
    // A forged category with an off-ledger hue names the CATEGORY as the
    // offence — the guard precedes hue validation and the refresh shortcut.
    expect(() =>
      budget.admit({ id: "x", category: "glow" as BudgetCategory, priority: 0, hue: "chartreuse" }),
    ).toThrowError(/budget\[unknown-category\]: 'glow'/);
  });

  it("a prototype key is not a category either — hasOwn, not `in`", () => {
    // `"constructor" in BUDGET_CAPS` is true for ANY object; the guard uses
    // Object.hasOwn so inherited-prototype names cannot sneak an unmetered
    // claim through the runtime fence.
    expect(() =>
      budget.admit({ id: "proto", category: "constructor" as BudgetCategory, priority: 50 }),
    ).toThrowError(/budget\[unknown-category\]: 'constructor' not in BUDGET_CAPS/);
    expect(budget.snapshot().holders).toEqual([]);
  });

  it("known categories keep refresh/refuse behaviour (no regression)", () => {
    // Fresh claim earns the single overlay slot…
    expect(budget.admit({ id: "o1", category: "overlay", priority: 5 }).admitted).toBe(true);
    // …so the identical re-admit below is provably the REFRESH path, not a second draw.
    expect(budget.admit({ id: "o1", category: "overlay", priority: 5 })).toEqual({
      admitted: true,
      evicted: [],
    });
    const overflow = budget.admit({ id: "o2", category: "overlay", priority: 5 });
    expect(overflow.admitted).toBe(false); // cap 1 still enforced
    if (overflow.admitted) return;
    expect(overflow.reason).toBe("category-budget");
    expect(budget.clusterCount(overflow.clusterId)).toBe(1);
  });
});
