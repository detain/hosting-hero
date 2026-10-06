import { describe, expect, it } from "vitest";

import { asCauseId, asEntityId, type EntityId } from "../../types.js";
import { fromRatio, toNumber } from "../../kernel/fixed.js";
import {
  budgetMinutesFixed,
  budgetSecondsFor,
  BUSINESS_MONTH_MINUTES,
  commitmentBpsOf,
  drainOutage,
  exhaustionLockActive,
  initBudget,
  remainingSec,
  RiskyActionLockedError,
  rollMonth,
  rollWeek,
  slaCreditOwedSec,
  spend,
  weekIndexOf,
} from "../errorBudget.js";
import { defaultEconomyConfig } from "../config.js";
import { DAY, MONTH } from "./helpers.js";

const cfg = defaultEconomyConfig();
const C: EntityId = asEntityId("eb-1");
const CAUSE = asCauseId("test:eb");

describe("budget arithmetic — the §6.16 derived table (99.9% = 43 min/mo exact)", () => {
  it("table rows compute from (1 − commitment) × 30 days in whole seconds", () => {
    const rows: readonly (readonly [bigint, bigint, string])[] = [
      [9900n, 25_920n, "99% → 7h12m (30-day month; doc's 7h18m used 30.42d — noted PROVISIONAL)"],
      [9950n, 12_960n, "99.5% → 3h36m (doc 3h39m same rounding note)"],
      [9990n, 2_592n, "99.9% → 43m floor match — task-mandated exact check"],
      [9995n, 1_296n, "99.95% → 21m36s doc-exact"],
      [9999n, 259n, "99.99% → 4m19s doc-exact"],
    ];
    for (const [bps, secs, why] of rows) {
      expect(budgetSecondsFor(bps, cfg), why).toBe(secs);
    }
    expect(Number(budgetSecondsFor(9990n, cfg) / 60n)).toBe(43); // "43 m" as the doc prints it
  });

  it("Fixed minutes view agrees with the seconds accounting", () => {
    // Q16.16 cannot hold 43.2 exactly — raw = round(43.2×65536) = 2831155,
    // i.e. 43.199996948… Assert the exact Fixed point + display to 4 dp.
    expect(budgetMinutesFixed(9990n, cfg)).toBe(fromRatio(216n, 5n));
    expect(toNumber(budgetMinutesFixed(9990n, cfg))).toBeCloseTo(43.2, 4);
    // 99.99%: the minutes VIEW is exact (4.32) while the SECONDS ledger
    // floors (259 s = "4 m 19 s", §6.16) — the two differ by <0.2 s.
    expect(toNumber(budgetMinutesFixed(9999n, cfg))).toBeCloseTo(4.32, 3);
    expect(budgetSecondsFor(9999n, cfg)).toBe(259n);
  });

  it("rejects commitments outside [0, 10000] bps", () => {
    expect(() => budgetSecondsFor(10_001n, cfg)).toThrow(/outside/);
    expect(() => budgetSecondsFor(-1n, cfg)).toThrow(/outside/);
  });

  it("uptime Fixed → bps round-trip honors the sold SLA (§6.12 commitments)", () => {
    expect(commitmentBpsOf(fromRatio(999n, 1000n))).toBe(9990n);
    expect(commitmentBpsOf(fromRatio(9999n, 10000n))).toBe(9999n);
    expect(() => commitmentBpsOf(-1000n)).toThrow(/out of/);
    expect(() => commitmentBpsOf(131_072n)).toThrow(/out of/); // 2.0
  });

  it("BUSINESS_MONTH_MINUTES is the single 30-day constant (OD-2 discipline)", () => {
    expect(BUSINESS_MONTH_MINUTES).toBe(cfg.calendar.minutesPerMonth);
  });
});

describe("spend API + exhaustion lock (§6.1)", () => {
  const fresh = () => initBudget(C, 9990n, 0, 0, cfg); // 2592 s

  it("charges the config table per action", () => {
    let b = spend(fresh(), "risky-deploy", null, cfg, CAUSE);
    expect(remainingSec(b)).toBe(2592n - 180n); // −3 min LIVE §6.1
    b = spend(b, "reboot-not-diagnose", null, cfg, CAUSE);
    expect(remainingSec(b)).toBe(2592n - 180n - 90n); // −90 s LIVE §6.1
    b = spend(b, "shed", null, cfg, CAUSE);
    expect(remainingSec(b)).toBe(2592n - 180n - 90n - 120n);
  });

  it("computed override (sla-hit seconds) charges the caller's number", () => {
    const b = spend(fresh(), "sla-hit", 600n, cfg, CAUSE);
    expect(remainingSec(b)).toBe(2592n - 600n);
  });

  it("zero headroom locks RISKY verbs and allows defensive ones", () => {
    let b = spend(fresh(), "sla-hit", 3000n, cfg, CAUSE); // −408 s: red
    expect(exhaustionLockActive(b)).toBe(true);
    expect(() => spend(b, "risky-deploy", null, cfg, CAUSE)).toThrow(RiskyActionLockedError);
    expect(() => spend(b, "reboot-not-diagnose", null, cfg, CAUSE)).toThrow(/locked/);
    b = spend(b, "feature-off", null, cfg, CAUSE); // not on the risky list
    expect(remainingSec(b)).toBe(-408n - 300n);
  });

  it("outage drains are never permissioned and can tip the meter negative", () => {
    const b = drainOutage(fresh(), 5000n, CAUSE);
    expect(remainingSec(b)).toBe(2592n - 5000n);
    expect(slaCreditOwedSec(b)).toBe(5000n - 2592n); // credit pool the rules layer converts (§6.1)
    expect(slaCreditOwedSec(fresh())).toBe(0n);
    expect(() => drainOutage(fresh(), -1n, CAUSE)).toThrow(/negative/);
  });
});

describe("clean-week refund + month surplus carry (§6.1/§6.14)", () => {
  it("a zero-consumption week refunds the configured sliver", () => {
    const b = initBudget(C, 9990n, 0, 0, cfg);
    const week1 = weekIndexOf(7 * DAY, cfg);
    const rolled = rollWeek(b, week1, cfg);
    expect(rolled.refundGrantedSec).toBe(cfg.errorBudget.cleanWeekRefundSec);
    expect(remainingSec(rolled.state)).toBe(2592n + cfg.errorBudget.cleanWeekRefundSec);
    expect(rolled.refunds).toHaveLength(1);
    expect(rolled.refunds[0]!.closedWeekIndex).toBe(0);
    expect(rolled.refunds[0]!.causeId).toContain(":w0");
  });

  it("a dirty week refunds nothing; same-week re-roll is inert", () => {
    const spent = spend(initBudget(C, 9990n, 0, 0, cfg), "stale-cache", null, cfg, CAUSE);
    const rolled = rollWeek(spent, weekIndexOf(7 * DAY, cfg), cfg);
    expect(rolled.refundGrantedSec).toBe(0n);
    expect(rollWeek(rolled.state, rolled.state.weekIndex, cfg).refundGrantedSec).toBe(0n);
  });

  it("a k-week pause on a clean clock grants k refunds, one per closed week (E-9)", () => {
    const b = initBudget(C, 9990n, 0, 0, cfg);
    const rolled = rollWeek(b, 5, cfg); // weeks 0–4 all closed while paused
    expect(rolled.refunds.map((r) => r.closedWeekIndex)).toEqual([0, 1, 2, 3, 4]);
    expect(rolled.refundGrantedSec).toBe(cfg.errorBudget.cleanWeekRefundSec * 5n);
    expect(remainingSec(rolled.state)).toBe(2592n + cfg.errorBudget.cleanWeekRefundSec * 5n);
    // causeIds anchor the GRANT-time week and stay unique per refund.
    const causes = rolled.refunds.map((r) => r.causeId);
    expect(new Set(causes).size).toBe(5);
    expect(causes[4]).toBe("economy/error-budget:clean-week:eb-1:w4");
  });

  it("any consumption inside a multi-week window grants nothing (conservative)", () => {
    const spent = spend(initBudget(C, 9990n, 0, 0, cfg), "stale-cache", null, cfg, CAUSE);
    const rolled = rollWeek(spent, 4, cfg);
    expect(rolled.refundGrantedSec).toBe(0n);
    expect(rolled.refunds).toHaveLength(0);
    expect(rolled.state.weekIndex).toBe(4); // window still closes
  });

  it("month roll banks capped surplus into carryInSec and re-grants", () => {
    const drained = drainOutage(initBudget(C, 9990n, 0, 0, cfg), 992n, CAUSE); // 1600 left
    const { state, carryOutSec } = rollMonth(drained, 1, MONTH, cfg);
    expect(carryOutSec).toBe(1600n);
    expect(state.carryInSec).toBe(1600n);
    expect(remainingSec(state)).toBe(2592n + 1600n);
  });

  it("carry honors the bps cap and red months carry zero", () => {
    const capped = { ...cfg, errorBudget: { ...cfg.errorBudget, carryCapBps: 5000n } }; // 50%
    const { carryOutSec } = rollMonth(initBudget(C, 9990n, 0, 0, capped), 1, MONTH, capped);
    expect(carryOutSec).toBe(1296n); // floor(2592 × 0.50)
    const red = drainOutage(initBudget(C, 9990n, 0, 0, cfg), 3000n, CAUSE);
    expect(rollMonth(red, 1, MONTH, cfg).carryOutSec).toBe(0n);
  });
});
