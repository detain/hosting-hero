/** objectives.test.ts — truth table for the closed predicate vocabulary,
 *  including every boundary where below/above strictness matters. */
import { describe, expect, it } from "vitest";

import { FIXED_ONE, FIXED_ZERO, fromInt } from "../../kernel/fixed.ts";
import {
  EMPTY_OBSERVATION,
  objectiveHolds,
  objectiveLine,
  objectiveProgress,
  progressAll,
} from "../index.ts";
import type { ObjectivePredicate, ScenarioObservation } from "../index.ts";

function obs(patch: Partial<ScenarioObservation>): ScenarioObservation {
  return Object.freeze({ ...EMPTY_OBSERVATION, ...patch });
}

describe("objectiveHolds — the ten predicates at their boundaries", () => {
  const table: readonly [ObjectivePredicate, ScenarioObservation, boolean][] = [
    [{ kind: "survive-minutes", minutes: 60 }, obs({ elapsedMin: 59 }), false],
    [{ kind: "survive-minutes", minutes: 60 }, obs({ elapsedMin: 60 }), true],
    [{ kind: "cash-above", microUsd: 1000n }, obs({ cashFreeMicroUsd: 999n }), false],
    [{ kind: "cash-above", microUsd: 1000n }, obs({ cashFreeMicroUsd: 1000n }), true],
    [{ kind: "cash-below", microUsd: 1000n }, obs({ cashFreeMicroUsd: 1000n }), false],
    [{ kind: "cash-below", microUsd: 1000n }, obs({ cashFreeMicroUsd: 999n }), true],
    [{ kind: "churn-below", count: 2 }, obs({ churnedCustomers: 1 }), true],
    [{ kind: "churn-below", count: 2 }, obs({ churnedCustomers: 2 }), false],
    [{ kind: "churn-above", count: 0 }, obs({ churnedCustomers: 0 }), false],
    [{ kind: "churn-above", count: 0 }, obs({ churnedCustomers: 1 }), true],
    [{ kind: "invoices-settled", count: 3 }, obs({ settledInvoices: 3 }), true],
    [{ kind: "invoices-settled", count: 3 }, obs({ settledInvoices: 2 }), false],
    [{ kind: "bounces-below", count: 5 }, obs({ bounces: 4 }), true],
    [{ kind: "bounces-below", count: 5 }, obs({ bounces: 5 }), false],
    [{ kind: "bounces-above", count: 2 }, obs({ bounces: 3 }), true],
    [{ kind: "no-death-cause", cause: "any" }, obs({ deaths: ["float-insolvency"] }), false],
    [
      { kind: "no-death-cause", cause: "churn-collapse" },
      obs({ deaths: ["float-insolvency"] }),
      true, // only the NAMED death poisons a named safety row
    ],
    [
      { kind: "death-by-cause", cause: "float-insolvency" },
      obs({ deaths: ["churn-collapse", "float-insolvency"] }),
      true,
    ],
    [{ kind: "death-by-cause", cause: "any" }, obs({}), false],
  ];
  for (const [predicate, observation, expected] of table) {
    it(`${objectiveLine(predicate)} ⇒ ${String(expected)}`, () => {
      expect(objectiveHolds(observation, predicate)).toBe(expected);
    });
  }
});

describe("objectiveProgress — Q16.16 in [0,1] under both counting laws", () => {
  it("attainment counts up toward the line", () => {
    const half = objectiveProgress(obs({ elapsedMin: 30 }), { kind: "survive-minutes", minutes: 60 });
    expect(half.progress).toBe(fromInt(0) + 32768n); // exactly 0.5
    const over = objectiveProgress(obs({ elapsedMin: 400 }), { kind: "survive-minutes", minutes: 60 });
    expect(over.progress).toBe(FIXED_ONE); // clamped, never past the wall
    expect(over.holds).toBe(true);
  });

  it("safety counts its headroom down toward the violation", () => {
    const safe = objectiveProgress(obs({}), { kind: "churn-below", count: 4 });
    expect(safe.progress).toBe(FIXED_ONE);
    const wobbling = objectiveProgress(obs({ churnedCustomers: 3 }), { kind: "churn-below", count: 4 });
    expect(wobbling.progress).toBe(16384n); // one customer of headroom left
    const breached = objectiveProgress(obs({ churnedCustomers: 4 }), { kind: "churn-below", count: 4 });
    expect(breached.progress).toBe(FIXED_ZERO);
    expect(breached.holds).toBe(false);
  });

  it("cash-below measures the shortfall, death-by-cause latches", () => {
    expect(objectiveProgress(obs({ cashFreeMicroUsd: 250n }), { kind: "cash-below", microUsd: 1000n }).progress).toBe(
      49152n,
    ); // 0.75 of the danger reached
    expect(objectiveProgress(obs({}), { kind: "death-by-cause", cause: "any" }).progress).toBe(FIXED_ZERO);
    expect(
      objectiveProgress(obs({ deaths: ["covenant-default"] }), { kind: "death-by-cause", cause: "any" }).progress,
    ).toBe(FIXED_ONE);
  });

  it("progressAll keeps author order (narrative emphasis, never sorted)", () => {
    const rows = progressAll(obs({ elapsedMin: 12 }), [
      { kind: "invoices-settled", count: 2 },
      { kind: "survive-minutes", minutes: 24 },
    ]);
    expect(rows.map((r) => r.predicate.kind)).toEqual(["invoices-settled", "survive-minutes"]);
    expect(rows[1]?.progress).toBe(32768n);
  });

  it("objectiveLine renders stable cause-id style lines", () => {
    expect(objectiveLine({ kind: "death-by-cause", cause: "float-insolvency" })).toBe(
      "death-by-cause:float-insolvency",
    );
    expect(objectiveLine({ kind: "cash-above", microUsd: 42n })).toBe("cash-above:42");
  });
});
