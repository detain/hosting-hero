import { describe, expect, it } from "vitest";

import { asMoney } from "../../types.js";
import { fromRatio, toNumber } from "../../kernel/fixed.js";
import {
  businessMinutesForReal,
  covenantBreaches,
  initialDeathSpiralState,
  isBeyondRunway,
  meetsLoseSlowlyGuard,
  observeRunway,
  runwayMonths,
  runwayTone,
} from "../runway.js";
import { defaultEconomyConfig } from "../config.js";

const cfg = defaultEconomyConfig();

describe("runway bar (cash ÷ net burn, §6.4)", () => {
  it("computes whole months exactly and flags not-burning as null", () => {
    // $600 free at $100/mo burn = 6.00 months
    expect(runwayMonths(asMoney(600_000_000n), asMoney(100_000_000n))).toBe(fromRatio(6n, 1n));
    expect(runwayMonths(asMoney(600_000_000n), asMoney(0n))).toBeNull(); // net positive
    expect(runwayMonths(asMoney(600_000_000n), asMoney(-50_000_000n))).toBeNull();
    expect(() => runwayMonths(asMoney(-1n), asMoney(1n))).toThrow(/negative free cash/);
  });

  it("clamps absurd runway at the Q16.16 ceiling instead of throwing", () => {
    const huge = runwayMonths(asMoney(10n ** 18n), asMoney(1n));
    expect(huge).not.toBeNull();
    expect(huge!).toBeLessThanOrEqual((1n << 31n) - 1n);
    expect(isBeyondRunway(huge, 12_000)).toBe(true);
  });

  it("tone shifts <6 mo and promotes numbers <3 mo (LIVE §6.4)", () => {
    // boundaries are STRICT ("<6", "<3" per §6.4): exactly 6 reads normal,
    // exactly 3 reads caution; one second inside flips.
    expect(runwayTone(fromRatio(7n, 1n), cfg)).toBe("normal");
    expect(runwayTone(fromRatio(6n, 1n), cfg)).toBe("normal");
    expect(runwayTone(fromRatio(599n, 100n), cfg)).toBe("caution");
    expect(runwayTone(fromRatio(3n, 1n), cfg)).toBe("caution");
    expect(runwayTone(fromRatio(299n, 100n), cfg)).toBe("critical");
    expect(runwayTone(fromRatio(2n, 1n), cfg)).toBe("critical");
    expect(runwayTone(null, cfg)).toBe("normal");
  });
});

describe("death-spiral detector (credit utilization, §6.13)", () => {
  const burning = { freeCash: asMoney(300_000_000n), netBurnPerMonth: asMoney(100_000_000n) }; // 3 mo → critical edge

  it("three consecutive borrow months under the ceiling flag the spiral", () => {
    let s = initialDeathSpiralState;
    s = observeRunway(s, { ...burning, creditDrawnThisMonth: true }, cfg);
    expect(s.consecutiveBorrowMonths).toBe(1);
    expect(s.spiralFlagged).toBe(false);
    s = observeRunway(s, { ...burning, creditDrawnThisMonth: true }, cfg);
    s = observeRunway(s, { ...burning, creditDrawnThisMonth: true }, cfg);
    // runway EXACTLY 3.00 is NOT < ceiling(3) → not flagged until deeper
    expect(s.spiralFlagged).toBe(false);
    s = observeRunway(s, { freeCash: asMoney(250_000_000n), netBurnPerMonth: asMoney(100_000_000n), creditDrawnThisMonth: true }, cfg);
    expect(s.spiralFlagged).toBe(true);
  });

  it("paying down the line resets the streak", () => {
    let s = { ...initialDeathSpiralState, consecutiveBorrowMonths: 2 };
    s = observeRunway(s, { ...burning, creditDrawnThisMonth: false }, cfg);
    expect(s.consecutiveBorrowMonths).toBe(0);
  });

  it("covenant data-refs evaluate against bps readouts (min/max both directions)", () => {
    const readouts = new Map([["ebitda-bps", 5_000n], ["uptime-bps", 99_000n], ["leverage-bps", 70_000n]]);
    expect(
      covenantBreaches(
        [
          { id: "min-ebitda", metricId: "ebitda-bps", floorBps: 8_000n, direction: "min" },
          { id: "max-leverage", metricId: "leverage-bps", floorBps: 60_000n, direction: "max" },
          { id: "min-uptime", metricId: "uptime-bps", floorBps: 99_900n, direction: "min" },
        ],
        readouts,
      ),
    ).toEqual(["min-ebitda", "max-leverage", "min-uptime"]);
    expect(() => covenantBreaches([{ id: "x", metricId: "nope", floorBps: 0n, direction: "min" }], readouts)).toThrow(/no readout/);
  });
});

describe("lose-slowly guard — ≥3 REAL minutes of warning (§9.6)", () => {
  it("business-minute conversion uses the kernel scale rational (no floats)", () => {
    // 3 real min = 180e6 real µs × 43200/7 business-µs per real-µs = 1.1109e12
    // business µs ÷ 60e6 = 18,514.2857 business minutes → ceil 18,515.
    expect(businessMinutesForReal(3)).toBe(18_515);
    expect(businessMinutesForReal(0)).toBe(0);
    expect(() => businessMinutesForReal(-1)).toThrow();
    expect(() => businessMinutesForReal(1.5)).toThrow(/integer/);
  });

  it("exact required lead passes; one minute short fails", () => {
    const required = businessMinutesForReal(cfg.runway.minWarningRealMinutes);
    expect(meetsLoseSlowlyGuard(1_000, 1_000 + required, cfg).ok).toBe(true);
    expect(meetsLoseSlowlyGuard(1_000, 1_000 + required - 1, cfg).ok).toBe(false);
    expect(() => meetsLoseSlowlyGuard(1_000, 999, cfg)).toThrow(/before the warning/);
  });

  it("verdict reports both leads for the HUD", () => {
    const v = meetsLoseSlowlyGuard(0, 43_200, cfg); // one business month of lead
    expect(v.ok).toBe(true);
    expect(v.leadBusinessMin).toBe(43_200);
    expect(v.requiredBusinessMin).toBe(businessMinutesForReal(3)); // 18,515
    // display sanity: the 3-real-min guard is under half a business month
    expect(toNumber(fromRatio(BigInt(v.requiredBusinessMin), 43_200n))).toBeLessThan(0.5);
  });
});
