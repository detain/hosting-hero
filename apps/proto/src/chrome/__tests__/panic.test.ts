/**
 * Panic Layout logic (§8.15 Big Number Rule) — levels, incident-cost math,
 * and the one-large-number decision. Uses REAL BudgetManagers so the
 * "consumes existing alert state, mints no rival tally" claim is tested.
 */
import { describe, expect, it } from "vitest";
import { BudgetManager } from "../../render/budget";
import {
  FP_CHALLENGE_FEE_MICRO_USD,
  PANIC_ESSENTIAL_SECTIONS,
  bigNumberDecision,
  derivePanic,
  dimsNonEssential,
  incidentCost,
  isEssentialDuringPanic,
} from "../panic";

const calmBudget = new BudgetManager().snapshot();
const breachBudget = (() => {
  const b = new BudgetManager();
  for (let i = 0; i < 5; i++) b.admit({ id: `fx-${i}`, category: "eventFx", priority: 50 });
  const snap = b.snapshot();
  expect(snap.breach).toBe(true); // pin the fixture itself
  return snap;
})();

describe("derivePanic — klaxon escalation", () => {
  it("ground truth alarm = panic; a budget breach alone is only elevated", () => {
    expect(derivePanic({ worst: "alarm", spiking: false, budget: calmBudget })).toBe("panic");
    expect(derivePanic({ worst: "nominal", spiking: false, budget: breachBudget })).toBe("elevated");
    expect(derivePanic({ worst: "nominal", spiking: true, budget: calmBudget })).toBe("elevated");
    expect(derivePanic({ worst: "warn", spiking: false, budget: calmBudget })).toBe("elevated");
  });

  it("all quiet = calm; no-data is NOT panic (fog ≠ fire)", () => {
    expect(derivePanic({ worst: "nominal", spiking: false, budget: calmBudget })).toBe("calm");
    expect(derivePanic({ worst: "no-data", spiking: false, budget: null })).toBe("calm");
  });
});

describe("incident cost — the g1 waste law", () => {
  it("waste = blocked_false_positive × 20 s challenge fee, exactly", () => {
    const cost = incidentCost({ blockedFalsePositive: 7, landed: 2 });
    expect(cost.microUsd).toBe(7n * FP_CHALLENGE_FEE_MICRO_USD);
    expect(cost.landed).toBe(2);
    expect(incidentCost({ blockedFalsePositive: 0, landed: 0 }).microUsd).toBe(0n);
  });

  it("negative counters are impossible states and said so", () => {
    expect(() => incidentCost({ blockedFalsePositive: -1, landed: 0 })).toThrow(RangeError);
  });
});

describe("Big Number Rule — exactly one owner", () => {
  it("panic hands the big number to incident cost; calm keeps cash", () => {
    expect(bigNumberDecision("panic")).toBe("incident-cost");
    expect(bigNumberDecision("elevated")).toBe("cash");
    expect(bigNumberDecision("calm")).toBe("cash");
  });

  it("panic dims the untouchable, spares the actionable (§8.8)", () => {
    expect(dimsNonEssential("panic")).toBe(true);
    expect(dimsNonEssential("elevated")).toBe(false);
    expect(isEssentialDuringPanic("alert-stack")).toBe(true);
    expect(isEssentialDuringPanic("chroma-meter")).toBe(false);
    expect(PANIC_ESSENTIAL_SECTIONS.size).toBe(5);
  });
});
