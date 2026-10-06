/**
 * R-60 bounce-sigmoid LUT accuracy (§7.11 patience model): the official
 * anchors 10%@0.6× / 50%@1.0× / 95%@1.6× must hold to Fixed resolution, the
 * curve monotonic, and the elapsed/patience ratio mapping exact.
 */

import { describe, expect, it } from "vitest";
import { toNumber } from "../../kernel/fixed";
import {
  BOUNCE_GRID_BPS,
  BOUNCE_LUT_LENGTH,
  BOUNCE_MAX_RATIO_BPS,
  bounceLutEntry,
  bounceProbability,
  patienceRatioBps,
} from "../bounce";

const ANCHORS: readonly [number, number][] = [
  [0, 0],
  [6000, 0.1],
  [10000, 0.5],
  [16000, 0.95],
  [20000, 1.0],
];

describe("bounce LUT (R-60)", () => {
  it("hits the official anchors within Fixed resolution", () => {
    for (const [ratioBps, expected] of ANCHORS) {
      const p = toNumber(bounceProbability(ratioBps));
      expect(Math.abs(p - expected)).toBeLessThan(0.002);
    }
  });

  it("interpolates the documented 0.3 midpoint at 0.8×", () => {
    // linear 0.1→0.5 between 0.6× and 1.0× ⇒ 0.8× sits at 0.3
    expect(Math.abs(toNumber(bounceProbability(8000)) - 0.3)).toBeLessThan(0.002);
  });

  it("is monotone non-decreasing across the full grid", () => {
    let previous = 0n;
    for (let bps = 0; bps <= BOUNCE_MAX_RATIO_BPS; bps += 25) {
      const p = bounceProbability(bps);
      expect(p >= previous).toBe(true);
      previous = p;
    }
    expect(previous).toBe(65536n); // saturates at probability 1
  });

  it("off-grid queries return the pinned lower cell (no float lerp)", () => {
    const cell = bounceLutEntry(Math.floor(9950 / BOUNCE_GRID_BPS));
    expect(bounceProbability(9950)).toBe(cell);
    expect(bounceProbability(50)).toBe(bounceProbability(99));
  });

  it("patienceRatioBps maps exact ratios and clamps extremes", () => {
    expect(patienceRatioBps(6_000_000n, 10_000_000n)).toBe(6000);
    expect(patienceRatioBps(10_000_000n, 10_000_000n)).toBe(10000);
    expect(patienceRatioBps(0n, 10_000_000n)).toBe(0);
    expect(patienceRatioBps(10n ** 15n, 1n)).toBeGreaterThan(BOUNCE_MAX_RATIO_BPS);
    // non-positive budget ⇒ instantly maxed (Law 4 on degenerate patience)
    expect(patienceRatioBps(1n, 0n)).toBe(BOUNCE_MAX_RATIO_BPS + 1);
    expect(toNumber(bounceProbability(patienceRatioBps(1n, 0n)))).toBeCloseTo(1, 3);
  });

  it("LUT length matches the grid contract", () => {
    expect(BOUNCE_LUT_LENGTH).toBe(Math.floor(BOUNCE_MAX_RATIO_BPS / BOUNCE_GRID_BPS) + 1);
  });
});
