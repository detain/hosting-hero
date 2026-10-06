import { describe, expect, it } from "vitest";

import type { ClockState } from "../../types";
import {
  BUSINESS_SCALE_DEFAULT,
  DEFAULT_TICK_US,
  MICROS_PER_DAY,
  MICROS_PER_SEC,
  addUs,
  advanceClocks,
  incidentScale,
  initialClocks,
  minutesToSimUs,
  scaleUs,
  simMinuteOf,
  simScale,
  subUs,
  tickOf,
  us,
} from "../time";

describe("time: integer-µs helpers", () => {
  it("parses boundary literals and rejects float/non-monotonic input", () => {
    expect(us(1_000n)).toBe(1_000n);
    expect(us(500)).toBe(500n);
    expect(() => us(1.5)).toThrow(/safe integer/);
    expect(() => us(-1n)).toThrow(/monotonic/);
  });

  it("adds/subtracts with fail-loud guards", () => {
    expect(addUs(10n, 5n)).toBe(15n);
    expect(() => addUs(10n, -1n)).toThrow(/negative delta/);
    expect(subUs(10n, 4n)).toBe(6n);
    expect(() => subUs(4n, 10n)).toThrow(/would go negative/);
  });

  it("converts minutes ↔ sim µs", () => {
    expect(minutesToSimUs(1)).toBe(60_000_000n);
    expect(minutesToSimUs(90n)).toBe(5_400_000_000n);
    expect(() => minutesToSimUs(-2)).toThrow(/negative minutes/);
  });
});

describe("time: three-clock scales (§4.1 R-20…R-31)", () => {
  it("sim clock: 1 real second = 1 sim minute at 1×", () => {
    expect(scaleUs(MICROS_PER_SEC, simScale(1))).toBe(60_000_000n);
  });

  it("speed factors 2×/4× multiply sim time only (physics identical per input trace)", () => {
    expect(scaleUs(MICROS_PER_SEC, simScale(2))).toBe(120_000_000n);
    expect(scaleUs(MICROS_PER_SEC, simScale(4))).toBe(240_000_000n);
  });

  it("incident clock runs at 0.25× and composes with speed", () => {
    expect(scaleUs(MICROS_PER_SEC, incidentScale(1))).toBe(15_000_000n);
    expect(scaleUs(MICROS_PER_SEC, incidentScale(4))).toBe(60_000_000n);
  });

  it("business default: one 30-day month per 7 real minutes (OD-2/D-1 constant)", () => {
    const sevenMinutes = 420n * MICROS_PER_SEC;
    expect(scaleUs(sevenMinutes, BUSINESS_SCALE_DEFAULT)).toBe(30n * MICROS_PER_DAY);
  });

  it("scaleUs fails loud on negative duration or bad denominator", () => {
    expect(() => scaleUs(-1n, simScale(1))).toThrow(/negative duration/);
    expect(() => scaleUs(10n, { num: 1n, den: 0n })).toThrow(/non-positive denominator/);
  });
});

describe("time: advanceClocks (pure, monotonic, dual-clock law)", () => {
  it("keeps business & wall clocks indifferent to speed and incident mode", () => {
    let fast: ClockState = initialClocks();
    let slow: ClockState = initialClocks();
    for (let step = 0; step < 30; step += 1) {
      fast = advanceClocks(fast, { realElapsedUs: MICROS_PER_SEC, speed: 4, incident: true });
      slow = advanceClocks(slow, { realElapsedUs: MICROS_PER_SEC, speed: 1, incident: false });
    }
    expect(fast.businessUs).toBe(slow.businessUs);
    expect(fast.wallUs).toBe(slow.wallUs);
    expect(fast.realUs).toBe(slow.realUs);
    // incident-0.25× at 4× composes to exactly the baseline 1× rate
    // (15n×4 == 60n×1): the ops scale is a pure multiplier, never a mode.
    expect(fast.simUs).toBe(slow.simUs);
  });

  it("reproduces exactly for the same ordered delta sequence (replay equality)", () => {
    const sequence = [512_337n, 1_000_000n, 33_333n, 8_000_001n, 999_999n];
    const run = (incident: boolean): ClockState =>
      sequence.reduce<ClockState>(
        (clocks, realElapsedUs) => advanceClocks(clocks, { realElapsedUs, speed: 2, incident }),
        initialClocks(),
      );
    expect(run(false)).toEqual(run(false));
    expect(run(true)).toEqual(run(true));
    expect(run(false).simUs).not.toBe(run(true).simUs);
  });

  it("accumulates identically across any split of a whole-second step at den=1 scales", () => {
    // Floor-division error can only appear on fractional scales; sim/incident
    // scales are integer multipliers, so G1's 1×-vs-4× speed-equality
    // acceptance stays exact regardless of driver chunking.
    const whole = advanceClocks(initialClocks(), { realElapsedUs: 60n * MICROS_PER_SEC, speed: 1, incident: false });
    let chunked: ClockState = initialClocks();
    for (let i = 0; i < 60; i += 1) {
      chunked = advanceClocks(chunked, { realElapsedUs: MICROS_PER_SEC, speed: 1, incident: false });
    }
    expect(chunked.simUs).toBe(whole.simUs);
    expect(chunked.simUs).toBe(60n * 60_000_000n);
  });

  it("rejects negative real deltas", () => {
    expect(() =>
      advanceClocks(initialClocks(), { realElapsedUs: -1n, speed: 1, incident: false }),
    ).toThrow(/negative real delta/);
  });
});

describe("time: business-clock partition invariance (FIX-1, speed-invariance law)", () => {
  const step = (clocks: ClockState, realElapsedUs: bigint, speed: 1 | 2 | 4 = 1): ClockState =>
    advanceClocks(clocks, { realElapsedUs, speed, incident: false });

  it("one 4 s delta lands identically to four 1 s deltas (remainder carried, not dropped)", () => {
    // Review evidence for the old per-delta law:
    //   floor(4e6·43200/7) = 24685714285 ≠ 4·floor(1e6·43200/7) = 24685714284
    const whole = step(initialClocks(), 4_000_000n);
    let split = initialClocks();
    for (let i = 0; i < 4; i += 1) split = step(split, 1_000_000n);
    expect(whole.businessUs).toBe((4_000_000n * 43_200n) / 7n); // 24685714285
    expect(4n * ((1_000_000n * 43_200n) / 7n)).toBe(24_685_714_284n); // the rejected law
    expect(split).toEqual(whole);
  });

  it("1× big-delta vs 4×-partitioned small deltas agree on businessUs across 10k ticks", () => {
    let whole = initialClocks();
    let split = initialClocks();
    for (let tick = 0; tick < 10_000; tick += 1) {
      whole = step(whole, 4_000_000n);
      for (let i = 0; i < 4; i += 1) split = step(split, 1_000_000n);
      expect(split.businessUs).toBe(whole.businessUs);
      expect(split).toEqual(whole); // every clock in lockstep, not just business
    }
    expect(whole.businessUs).toBe((40_000_000_000n * 43_200n) / 7n);
  });

  it("arbitrarily shaped partitions (2+3+5 …) telescope to the same businessUs", () => {
    const shapes: readonly bigint[][] = [
      [4_000_000n],
      [1_000_000n, 3_000_000n],
      [1_000_001n, 999_999n, 2_000_000n],
      Array.from({ length: 16 }, () => 250_000n),
    ];
    const finals = shapes.map((shape) => shape.reduce((c, us) => step(c, us), initialClocks()));
    for (const final of finals) {
      expect(final.businessUs).toBe(finals[0]!.businessUs);
      expect(final.wallUs).toBe(finals[0]!.wallUs);
      expect(final.realUs).toBe(finals[0]!.realUs);
    }
  });

  it("speed never moves the business clock at any partition shape (dual-clock law)", () => {
    const run = (speed: 1 | 2 | 4, parts: bigint[]): ClockState => {
      let clocks = initialClocks();
      for (const part of parts) clocks = step(clocks, part, speed);
      return clocks;
    };
    // Same REAL elapsed (4 s) delivered at three game speeds and two splits:
    expect(run(2, [1_000_000n, 1_000_000n, 2_000_000n]).businessUs).toBe(run(1, [4_000_000n]).businessUs);
    expect(run(4, [500_000n, 3_500_000n]).businessUs).toBe(run(1, [4_000_000n]).businessUs);
  });

  it("a calendar-anchored business base survives partitioning", () => {
    const anchored: ClockState = { realUs: 0n, simUs: 0n, businessUs: 1_000_000_000n, wallUs: 0n };
    const whole = step(anchored, 4_000_000n);
    const split = [1_000_000n, 1_000_000n, 2_000_000n].reduce((c, us) => step(c, us), anchored);
    expect(split.businessUs).toBe(whole.businessUs);
    expect(whole.businessUs).toBe(1_000_000_000n + (4_000_000n * 43_200n) / 7n); // base honored + exact step
  });
});

describe("time: derived tick identities", () => {
  it("derives whole sim-minutes and macro ticks from clock state", () => {
    const after90simMinutes = advanceClocks(initialClocks(), {
      realElapsedUs: 90n * MICROS_PER_SEC, // 1 real min = 1 sim min at 1×
      speed: 1,
      incident: false,
    });
    expect(simMinuteOf(after90simMinutes)).toBe(90);
    expect(tickOf(after90simMinutes)).toBe(90n);
    expect(DEFAULT_TICK_US).toBe(60_000_000n);
  });

  it("tickOf fails loud on a non-positive tick length", () => {
    expect(() => tickOf(initialClocks(), 0n)).toThrow(/non-positive tick length/);
  });
});
