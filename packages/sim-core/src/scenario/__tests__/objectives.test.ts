/** objectives.test.ts — truth table for the closed predicate vocabulary,
 *  including every boundary where below/above strictness matters. */
import { describe, expect, it } from "vitest";

import { FIXED_ONE, FIXED_ZERO, fromInt } from "../../kernel/fixed.ts";
import { PlayerVerb } from "../../types.ts";
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

describe("objectiveHolds — the twenty-seven predicates at their boundaries", () => {
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
    // rung 4 — the covenant pair mirrors the written-off pair exactly; the
    // count is EconomyState.covenantBreachLog rows (one per breach EDGE,
    // relatches count again — the latch lifecycle of 57ea80e).
    [{ kind: "covenant-breached-count-below", count: 1 }, obs({ covenantBreaches: 0 }), true],
    [{ kind: "covenant-breached-count-below", count: 1 }, obs({ covenantBreaches: 1 }), false],
    [{ kind: "covenant-breached-count-above", count: 0 }, obs({ covenantBreaches: 0 }), false],
    [{ kind: "covenant-breached-count-above", count: 0 }, obs({ covenantBreaches: 1 }), true],
    // rung 5 — the reputation pair rides overallBps. ASYMMETRIC by law:
    // reputation-above is a balance (cash-above shape, >= holds ON the
    // line), reputation-below is a danger gauge (cash-below shape, < holds
    // strictly under). Same B is a strict complement: exactly one holds.
    [{ kind: "reputation-above", bps: 1500 }, obs({ reputationBps: 1499n }), false],
    [{ kind: "reputation-above", bps: 1500 }, obs({ reputationBps: 1500n }), true],
    [{ kind: "reputation-below", bps: 1500 }, obs({ reputationBps: 1500n }), false],
    [{ kind: "reputation-below", bps: 1500 }, obs({ reputationBps: 1499n }), true],
    [
      { kind: "reputation-above", bps: 5000 },
      obs({}), // EMPTY_OBSERVATION starts at the economy's opening 5,000 bps
      true,
    ],
    // channels ladder — the door pair: counts of receipts, plain counting
    // law (above is STRICT, below is STRICT — the churn family, not the
    // balance family).
    [{ kind: "intents-executed-above", count: 17 }, obs({ intentsExecuted: 17 }), false],
    [{ kind: "intents-executed-above", count: 17 }, obs({ intentsExecuted: 18 }), true],
    [{ kind: "intents-refused-below", count: 1 }, obs({ intentsRefused: 0 }), true],
    [{ kind: "intents-refused-below", count: 1 }, obs({ intentsRefused: 1 }), false],
    [{ kind: "intents-refused-above", count: 6 }, obs({ intentsRefused: 6 }), false],
    [{ kind: "intents-refused-above", count: 6 }, obs({ intentsRefused: 7 }), true],
    [{ kind: "intents-executed-below", count: 2 }, obs({ intentsExecuted: 1 }), true],
    // Rung 9 — the verb dim reads its own census; absent verb reads total.
    [
      { kind: "intents-executed-above", verb: PlayerVerb.ConfigureNode, count: 2 },
      obs({ intentsExecuted: 4, intentsExecutedByVerb: { "configure-node": 3, communicate: 1 } }),
      true,
    ],
    [
      { kind: "intents-executed-above", verb: PlayerVerb.Communicate, count: 1 },
      obs({ intentsExecuted: 4, intentsExecutedByVerb: { "configure-node": 3, communicate: 1 } }),
      false,
    ],
    [
      { kind: "intents-refused-above", verb: PlayerVerb.ConfigureNode, count: 0 },
      obs({ intentsRefused: 1, intentsRefusedByVerb: { "configure-node": 1 } }),
      true,
    ],
    [
      { kind: "intents-refused-above", verb: PlayerVerb.Communicate, count: 0 },
      obs({ intentsRefused: 1, intentsRefusedByVerb: { "configure-node": 1 } }),
      false,
    ],
    [
      { kind: "intents-refused-below", verb: PlayerVerb.ShedLoad, count: 1 },
      obs({ intentsRefused: 5, intentsRefusedByVerb: { "configure-node": 5 } }),
      true,
    ],
    // channels ladder — the dispute counter is the same counting law.
    [{ kind: "chargebacks-above", count: 3 }, obs({ chargebacksApplied: 4 }), true],
    [{ kind: "chargebacks-above", count: 3 }, obs({ chargebacksApplied: 3 }), false],
    [{ kind: "chargebacks-below", count: 5 }, obs({ chargebacksApplied: 5 }), false],
    [{ kind: "chargebacks-below", count: 5 }, obs({ chargebacksApplied: 4 }), true],
    // channels ladder — the credit balance rides the bps pair ASYMMETRIC
    // like reputation: above is a balance (>=), below is a danger (<).
    [{ kind: "postmortem-credits-above", bps: 250 }, obs({ postmortemCreditsBps: 250n }), true],
    [{ kind: "postmortem-credits-above", bps: 250 }, obs({ postmortemCreditsBps: 0n }), false],
    [{ kind: "postmortem-credits-below", bps: 250 }, obs({ postmortemCreditsBps: 250n }), false],
    [{ kind: "postmortem-credits-below", bps: 250 }, obs({ postmortemCreditsBps: 0n }), true],
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

  it("rung 4–5: the breach pair counts like the others; the rating rides both laws", () => {
    // safety headroom, churn shape: one of two allowed breaches spent.
    expect(
      objectiveProgress(obs({ covenantBreaches: 1 }), { kind: "covenant-breached-count-below", count: 2 }).progress,
    ).toBe(32768n);
    // balance headroom, cash-above shape: half the floor still stands.
    expect(objectiveProgress(obs({ reputationBps: 1500n }), { kind: "reputation-above", bps: 3000 }).progress).toBe(
      32768n,
    );
    // danger attainment, cash-below shape: a quarter of the fall to the floor.
    expect(objectiveProgress(obs({ reputationBps: 1500n }), { kind: "reputation-below", bps: 2000 }).progress).toBe(
      16384n,
    );
    // above the danger line the shortfall is negative → zero, never a wedge.
    const safe = objectiveProgress(obs({ reputationBps: 2500n }), { kind: "reputation-below", bps: 2000 });
    expect(safe.progress).toBe(FIXED_ZERO);
    expect(safe.holds).toBe(false);
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
    expect(objectiveLine({ kind: "covenant-breached-count-above", count: 0 })).toBe(
      "covenant-breached-count-above:0",
    );
    expect(objectiveLine({ kind: "reputation-below", bps: 1500 })).toBe("reputation-below:1500");
  });
});

describe("channels ladder — observation defaults, lines and progress", () => {
  it("EMPTY_OBSERVATION is silent on every channel", () => {
    expect(EMPTY_OBSERVATION.intentsExecuted).toBe(0);
    expect(EMPTY_OBSERVATION.intentsRefused).toBe(0);
    expect(EMPTY_OBSERVATION.chargebacksApplied).toBe(0);
    expect(EMPTY_OBSERVATION.postmortemCreditsBps).toBe(0n);
  });

  it("stop-reason lines carry their threshold", () => {
    expect(objectiveLine({ kind: "intents-executed-above", count: 16 })).toBe("intents-executed-above:16");
    expect(objectiveLine({ kind: "intents-refused-above", count: 6 })).toBe("intents-refused-above:6");
    expect(objectiveLine({ kind: "chargebacks-below", count: 5 })).toBe("chargebacks-below:5");
    expect(objectiveLine({ kind: "postmortem-credits-above", bps: 250 })).toBe("postmortem-credits-above:250");
  });

  it("rung 9: the verb dim names the verb in the line and reads its own census", () => {
    expect(objectiveLine({ kind: "intents-refused-above", verb: PlayerVerb.ConfigureNode, count: 0 })).toBe(
      "intents-refused-above:configure-node:0",
    );
    // Separation at the unit level — one observation, two verdicts. The
    // refused TOTAL is 1 (both arms of the triage twin read the same "no");
    // only the census knows whether the dropped promise was a call or a
    // runbook. Same-shaped predicates, opposite answers.
    const droppedCall = obs({
      intentsRefused: 1,
      intentsRefusedByVerb: { communicate: 1 },
    });
    const droppedRunbook = obs({
      intentsRefused: 1,
      intentsRefusedByVerb: { "configure-node": 1 },
    });
    const totalLine = { kind: "intents-refused-above", count: 0 } as const;
    expect(objectiveHolds(droppedCall, totalLine)).toBe(objectiveHolds(droppedRunbook, totalLine));
    const verbLine = { kind: "intents-refused-above", verb: PlayerVerb.ConfigureNode, count: 0 } as const;
    expect(objectiveHolds(droppedCall, verbLine)).toBe(false);
    expect(objectiveHolds(droppedRunbook, verbLine)).toBe(true);
    // progress rides the same census (3 of 4 needed to clear above:3).
    const rung = objectiveProgress(obs({ intentsExecutedByVerb: { "configure-node": 3 } }), {
      kind: "intents-executed-above",
      verb: PlayerVerb.ConfigureNode,
      count: 3,
    });
    expect(rung.progress).toBe(49152n); // 3/4 of FIXED_ONE
    expect(rung.holds).toBe(false);
  });

  it("channel progress reads under both counting laws", () => {
    // attainment: 17 of the 18 needed to clear intents-executed-above:17.
    const near = objectiveProgress(obs({ intentsExecuted: 17 }), { kind: "intents-executed-above", count: 17 });
    expect(near.progress).toBe(17n * 65536n / 18n); // 61895n — Q16.16
    expect(near.holds).toBe(false);
    // headroom: the last refusal before the ceiling snaps shut.
    const wobbling = objectiveProgress(obs({ intentsRefused: 0 }), { kind: "intents-refused-below", count: 1 });
    expect(wobbling.progress).toBe(FIXED_ONE);
    const breached = objectiveProgress(obs({ intentsRefused: 1 }), { kind: "intents-refused-below", count: 1 });
    expect(breached.progress).toBe(FIXED_ZERO);
    // balance: half a credit line of the way to a 500-bps filing floor.
    const credit = objectiveProgress(obs({ postmortemCreditsBps: 250n }), {
      kind: "postmortem-credits-above",
      bps: 500,
    });
    expect(credit.progress).toBe(32768n); // exactly half of FIXED_ONE (65536)
  });
});
