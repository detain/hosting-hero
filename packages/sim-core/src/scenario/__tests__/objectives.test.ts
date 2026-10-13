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

describe("objectiveHolds — the fifteen predicates at their boundaries", () => {
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
    // rung 1 — the written-off pair mirrors the churn pair exactly.
    [{ kind: "written-off-below", count: 2 }, obs({ writtenOffCustomers: 1 }), true],
    [{ kind: "written-off-below", count: 2 }, obs({ writtenOffCustomers: 2 }), false],
    [{ kind: "written-off-above", count: 0 }, obs({ writtenOffCustomers: 0 }), false],
    [{ kind: "written-off-above", count: 0 }, obs({ writtenOffCustomers: 1 }), true],
    // rung 2 — the delta window: incomplete rows NEVER hold, and the
    // from-s silence case is a REAL rule (growth out of zero is visible).
    [
      { kind: "metric-delta-over-window", metric: "served", windowMinutes: 60, minDeltaPct: 25 },
      obs({
        windowSums: { "served:60": { current: 100, baseline: 100, complete: false } },
      }),
      false,
    ],
    [
      { kind: "metric-delta-over-window", metric: "served", windowMinutes: 60, minDeltaPct: 25 },
      obs({ windowSums: { "served:60": { current: 0, baseline: 0, complete: true } } }),
      false, // 0 vs 0 is silence, not improvement
    ],
    [
      { kind: "metric-delta-over-window", metric: "served", windowMinutes: 60, minDeltaPct: 25 },
      obs({ windowSums: { "served:60": { current: 1, baseline: 0, complete: true } } }),
      true, // growth out of nothing IS the improvement the player was asked for
    ],
    [
      { kind: "metric-delta-over-window", metric: "served", windowMinutes: 60, minDeltaPct: 25 },
      obs({ windowSums: { "served:60": { current: 124, baseline: 100, complete: true } } }),
      false, // 24% short of the promised 25%
    ],
    [
      { kind: "metric-delta-over-window", metric: "served", windowMinutes: 60, minDeltaPct: 25 },
      obs({ windowSums: { "served:60": { current: 125, baseline: 100, complete: true } } }),
      true, // exact +25% holds (>= law)
    ],
    [
      { kind: "metric-delta-over-window", metric: "bounced", windowMinutes: 30, minDeltaPct: 10 },
      obs({}), // cited but never computed → absent key → false, never a crash
      false,
    ],
    // rung 3 — family census: a missing family key is ZERO arrivals.
    [{ kind: "family-arrivals-below", family: "organic", count: 10 }, obs({}), true],
    [
      { kind: "family-arrivals-below", family: "malicious", count: 10 },
      obs({ arrivalsByFamily: { malicious: 10 } }),
      false,
    ],
    [
      { kind: "family-arrivals-above", family: "malicious", count: 0 },
      obs({ arrivalsByFamily: { organic: 5 } }),
      false, // other families never bleed into the probe's counter
    ],
    [
      { kind: "family-arrivals-above", family: "malicious", count: 0 },
      obs({ arrivalsByFamily: { malicious: 1 } }),
      true,
    ],
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

  it("delta attainment measures current against the demanded target", () => {
    const delta = { kind: "metric-delta-over-window", metric: "served", windowMinutes: 60, minDeltaPct: 100 } as const;
    // target = ceil(100 × 200 / 100) = 200; half the climb reads 0.5.
    const climbing = objectiveProgress(
      obs({ windowSums: { "served:60": { current: 100, baseline: 100, complete: true } } }),
      delta,
    );
    expect(climbing.progress).toBe(32768n);
    expect(climbing.holds).toBe(false);
    const done = objectiveProgress(
      obs({ windowSums: { "served:60": { current: 200, baseline: 100, complete: true } } }),
      delta,
    );
    expect(done.progress).toBe(FIXED_ONE);
    expect(done.holds).toBe(true);
    // a zero baseline demands exactly one visible unit…
    const fromSilence = objectiveProgress(
      obs({ windowSums: { "served:60": { current: 0, baseline: 0, complete: true } } }),
      delta,
    );
    expect(fromSilence.progress).toBe(FIXED_ZERO);
    // …and an absent (never-cited) window is flat zero, never a crash.
    expect(objectiveProgress(obs({}), delta).progress).toBe(FIXED_ZERO);
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
    expect(objectiveLine({ kind: "written-off-below", count: 7 })).toBe("written-off-below:7");
    expect(
      objectiveLine({ kind: "metric-delta-over-window", metric: "served", windowMinutes: 60, minDeltaPct: 25 }),
    ).toBe("metric-delta-over-window:served:60:25");
    expect(objectiveLine({ kind: "family-arrivals-above", family: "malicious", count: 3200 })).toBe(
      "family-arrivals-above:malicious:3200",
    );
  });
});
