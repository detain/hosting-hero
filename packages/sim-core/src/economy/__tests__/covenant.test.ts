/**
 * Covenant consumer tests (audit g19 #2 — the orphan `covenantBreaches`
 * evaluator finally gets its month-roll consumer).
 *
 * OD-25 (insolvency posture) is OWNER-OPEN: these tests pin that a breach
 * is RECORD + NOTICE ONLY — observable data, never a game-over. If a future
 * batch wires consequences, they arrive as new assertions elsewhere; the
 * silence pinned here must stay.
 */

import { describe, expect, it } from "vitest";

import {
  asEntityId,
  type Contract,
  type EntityId,
} from "../../types.js";
import { defaultEconomyConfig, type EconomyConfig } from "../config.js";
import {
  COVENANT_FULL_HEALTH_BPS,
  COVENANT_METRIC_ERROR_BUDGET_HEALTH_BPS,
  COVENANT_METRIC_RUNWAY_MONTHS_BPS,
  COVENANT_UNBOUNDED_RUNWAY_BPS,
  buildCovenantReadoutsBps,
  errorBudgetHealthBps,
  type Covenant,
} from "../runway.js";
import { runEconomyTick, type EconomyTickIn, type EconomyTickOut } from "../tick.js";
import { registerContractEconomy, type EconomyState } from "../state.js";
import { DAY, MONTH, SEED, TAGS, contractOf, ctxAt, stateWithCash } from "./helpers.js";

const cfg = defaultEconomyConfig();

function harness(contracts: readonly Contract[]): { map: Map<EntityId, Contract>; state: EconomyState } {
  let s = stateWithCash(500_000_000n);
  for (const c of contracts) {
    s = registerContractEconomy(
      s,
      { contract: c, atBusinessMin: 0, clauseRefs: [], grandfather: null, revenueTags: TAGS, commitmentBps: 9990n },
      cfg,
    );
  }
  return { map: new Map(contracts.map((c) => [c.id, c])), state: s };
}

function tick(
  prior: EconomyState,
  minute: number,
  contracts: ReadonlyMap<EntityId, Contract>,
  over: Partial<Pick<EconomyTickIn, "outageSecs" | "covenants" | "creditLineDrawn" | "spends">> = {},
): EconomyTickOut {
  return runEconomyTick({
    context: ctxAt(minute, BigInt(Math.floor(minute / 60))),
    runSeed: SEED,
    contracts,
    prior,
    cfg,
    ...over,
  });
}

const minHealth: Covenant = {
  id: "min-eb-health",
  metricId: COVENANT_METRIC_ERROR_BUDGET_HEALTH_BPS,
  floorBps: 1n, // any overrun (health 0) breaches
  direction: "min",
};

describe("covenant readout assemblers (pure)", () => {
  it("health is a clamped bps ratio of the grant", () => {
    expect(errorBudgetHealthBps(500n, 1000n)).toBe(5_000n);
    expect(errorBudgetHealthBps(-400n, 1000n)).toBe(0n); // overrun = "nothing left"
    expect(errorBudgetHealthBps(999n, 0n)).toBe(COVENANT_FULL_HEALTH_BPS);
  });

  it("not-burning reads as comfortably met; worst contract sets fleet health", () => {
    const map = buildCovenantReadoutsBps(null, [10_000n, 42n, 9_000n]);
    expect(map.get(COVENANT_METRIC_RUNWAY_MONTHS_BPS)).toBe(COVENANT_UNBOUNDED_RUNWAY_BPS);
    expect(map.get(COVENANT_METRIC_ERROR_BUDGET_HEALTH_BPS)).toBe(42n);
    const months = buildCovenantReadoutsBps(393_216n, []); // 6.0 Fixed months
    expect(months.get(COVENANT_METRIC_RUNWAY_MONTHS_BPS)).toBe(60_000n); // bps OF months
    expect(months.get(COVENANT_METRIC_ERROR_BUDGET_HEALTH_BPS)).toBe(COVENANT_FULL_HEALTH_BPS);
  });
});

describe("covenant review on the month roll (edge-triggered, OD-25 silent)", () => {
  const A = contractOf("A", { termEndMin: 12 * MONTH });

  it("no covenants ⇒ the review is structural silence (existing hosts unmoved)", () => {
    const { map, state } = harness([A]);
    const out = tick(state, MONTH, map); // a whole month roll, no covenant book
    expect(out.notices.some((n) => n.kind === "covenant-breached")).toBe(false);
    expect(out.state.covenantBreachLog.length).toBe(0);
  });

  it("breach → record + notice once; latch holds through the roll; recovery clears; relapse re-notices", () => {
    const { map, state } = harness([A]);
    const storm = new Map<EntityId, bigint>([[A.id, 10n ** 12n]]);

    // Month 0 opens quiet with the book primed (state-owned after this tick).
    const t0 = tick(state, 0, map, { covenants: [minHealth] });
    expect(t0.state.covenants.length).toBe(1);
    expect(t0.state.breachedCovenantIds.length).toBe(0);

    // Month 0 burns the whole budget away...
    const t1 = tick(t0.state, DAY, map, { outageSecs: storm });
    expect(t1.state.breachedCovenantIds.length).toBe(0); // review runs at ROLLS only

    // ...the roll into month 1 reviews the CLOSED month: health 0 ⇒ breach.
    const t2 = tick(t1.state, MONTH, map);
    const breachNotices = t2.notices.filter((n) => n.kind === "covenant-breached");
    expect(breachNotices.length).toBe(1);
    expect(breachNotices[0]!.contractId).toBe(asEntityId("company"));
    expect(t2.state.breachedCovenantIds).toEqual(["min-eb-health"]);
    expect(t2.state.covenantBreachLog.length).toBe(1);
    const rec = t2.state.covenantBreachLog[0]!;
    expect(rec.covenantId).toBe("min-eb-health");
    expect(rec.atBusinessMin).toBe(MONTH);
    expect(rec.causeId).toBe("economy:covenant:min-eb-health:m1");

    // The budget RE-GRANTED with the roll: the m2 review sees a healthy
    // closed month ⇒ recovery clears the latch, no notice.
    const t3 = tick(t2.state, 2 * MONTH, map);
    expect(t3.notices.some((n) => n.kind === "covenant-breached")).toBe(false);
    expect(t3.state.breachedCovenantIds).toEqual([]);
    expect(t3.state.covenantBreachLog.length).toBe(1);

    // Relapse: another storm month ⇒ a SECOND record (edge-triggered).
    const t4 = tick(t3.state, 3 * MONTH - DAY, map, { outageSecs: storm });
    const t5 = tick(t4.state, 3 * MONTH, map);
    expect(t5.notices.filter((n) => n.kind === "covenant-breached").length).toBe(1);
    expect(t5.state.covenantBreachLog.length).toBe(2);
    expect(t5.state.covenantBreachLog[1]!.causeId).toBe("economy:covenant:min-eb-health:m3");
  });

  it("a still-breached covenant at the NEXT roll does NOT re-notice (latch)", () => {
    const { map, state } = harness([A]);
    const storm = new Map<EntityId, bigint>([[A.id, 10n ** 12n]]);
    const t0 = tick(state, 0, map, { covenants: [minHealth] });
    const t1 = tick(t0.state, DAY, map, { outageSecs: storm });
    const t2 = tick(t1.state, MONTH, map); // breach at m1
    // Storm AGAIN inside month 1, then roll: the covenant is STILL breached
    // at the m2 review — but it was latched at the m1 review, so the
    // continuous breach must NOT re-notice (that is the whole edge-trigger).
    const t3 = tick(t2.state, MONTH + DAY, map, { outageSecs: storm });
    const t4 = tick(t3.state, 2 * MONTH, map);
    expect(t4.notices.filter((n) => n.kind === "covenant-breached").length).toBe(0);
    expect(t4.state.breachedCovenantIds).toEqual(["min-eb-health"]); // still active
    expect(t4.state.covenantBreachLog.length).toBe(1); // still the single m1 record
  });

  it("the covenant book REPLACES on re-declaration and carries when absent", () => {
    const { map, state } = harness([A]);
    const strict: Covenant = { ...minHealth, id: "max-eb-health", direction: "max", floorBps: 1n };
    const t0 = tick(state, 0, map, { covenants: [minHealth] });
    // Absent input ⇒ prior book carried.
    expect(tick(t0.state, DAY, map).state.covenants[0]!.id).toBe("min-eb-health");
    // Present input ⇒ whole-book replace (like vendorCommits).
    const t1 = tick(t0.state, DAY, map, { covenants: [strict] });
    expect(t1.state.covenants[0]!.id).toBe("max-eb-health");
    // Full health (10_000) exceeds a max-1 floor ⇒ breach at the next roll.
    const t2 = tick(t1.state, MONTH, map);
    expect(t2.state.breachedCovenantIds).toEqual(["max-eb-health"]);
  });

  it("OD-25 pin — a breach ends NOTHING: same phases, contracts live", () => {
    const { map, state } = harness([A]);
    const storm = new Map<EntityId, bigint>([[A.id, 10n ** 12n]]);
    const t0 = tick(state, 0, map, { covenants: [minHealth] });
    const t1 = tick(t0.state, DAY, map, { outageSecs: storm });
    const t2 = tick(t1.state, MONTH, map);
    expect(t2.state.breachedCovenantIds.length).toBe(1);
    expect(t2.state.contractEconomy.get(A.id)!.phase).toBe("active"); // no game-over
    expect(t2.state.loseSlowlyViolated).toBe(false); // breach is NOT the loss guard
  });

  it("a covenant naming a metric nobody produces fails LOUD at the roll", () => {
    const { map, state } = harness([A]);
    const bogus: Covenant = { id: "bogus", metricId: "ebitdaMarginBps", floorBps: 1n, direction: "min" };
    const t0 = tick(state, 0, map, { covenants: [bogus] });
    expect(() => tick(t0.state, MONTH, map)).toThrow(/no readout/);
  });
});
