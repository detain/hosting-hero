/**
 * Hockey-stick queue curve (R-07 "the most important curve in the game"):
 * queue_wait = serviceTime × ρ/(1−ρ), flat-zero at/below the 70% knee,
 * strictly monotone above it, ceiling-capped — all in exact Fixed.
 */

import { describe, expect, it } from "vitest";
import { fromRatio, toNumber } from "../../kernel/fixed";
import { MICROS_PER_MIN } from "../../kernel/time";
import {
  DEFAULT_KNEE_RHO,
  MAX_WAIT_MULTIPLIER,
  RHO_CEILING,
  hockeyStickMultiplier,
  hockeyStickWaitUs,
} from "../queue";

const MIN = MICROS_PER_MIN;

function rho(percent: number) {
  return fromRatio(BigInt(percent), 100n);
}

describe("hockey-stick curve", () => {
  it("is zero at and below the knee", () => {
    for (let p = 0; p <= 70; p += 5) {
      expect(hockeyStickMultiplier(rho(p), DEFAULT_KNEE_RHO)).toBe(0n);
      expect(hockeyStickWaitUs(MIN, rho(p), DEFAULT_KNEE_RHO)).toBe(0n);
    }
  });

  it("is strictly monotone above the knee", () => {
    let previous = 0n;
    for (let p = 75; p <= 98; p += 1) {
      const m = hockeyStickMultiplier(rho(p), DEFAULT_KNEE_RHO);
      expect(m > previous).toBe(true);
      previous = m;
    }
  });

  it("hits the closed-form values just above the knee and at 95%", () => {
    // 0.75/(1−0.75) = 3 ; 0.95/0.05 = 19 — Fixed rounding tolerance ±0.01
    expect(Math.abs(toNumber(hockeyStickMultiplier(rho(75), DEFAULT_KNEE_RHO)) - 3)).toBeLessThan(0.01);
    expect(Math.abs(toNumber(hockeyStickMultiplier(rho(95), DEFAULT_KNEE_RHO)) - 19)).toBeLessThan(0.01);
  });

  it("caps the wait multiplier at ρ_ceiling/(1−ρ_ceiling)", () => {
    expect(hockeyStickMultiplier(RHO_CEILING, DEFAULT_KNEE_RHO)).toBe(MAX_WAIT_MULTIPLIER);
    // even a (clamped) ρ of 1.0 can never exceed the cap — no division blowup
    expect(hockeyStickMultiplier(fromRatio(1n, 1n), DEFAULT_KNEE_RHO)).toBe(MAX_WAIT_MULTIPLIER);
  });

  it("scales linearly with service time", () => {
    const m = hockeyStickMultiplier(rho(90), DEFAULT_KNEE_RHO);
    const w1 = hockeyStickWaitUs(MIN, rho(90), DEFAULT_KNEE_RHO);
    const w5 = hockeyStickWaitUs(5n * MIN, rho(90), DEFAULT_KNEE_RHO);
    expect(w5).toBeGreaterThanOrEqual(w1 * 5n - 5n); // rounding slack
    expect(w1).toBeGreaterThanOrEqual(MIN * m / 65536n - 1n);
  });

  it("wait is monotone in ρ for a fixed service time", () => {
    let previous = 0n;
    for (let p = 71; p <= 99; p += 1) {
      const w = hockeyStickWaitUs(MIN, rho(p), DEFAULT_KNEE_RHO);
      expect(w >= previous).toBe(true);
      previous = w;
    }
    expect(previous).toBeGreaterThan(90n * MIN); // ~99× at the ceiling
  });
});
