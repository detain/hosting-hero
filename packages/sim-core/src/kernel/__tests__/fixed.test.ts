import { describe, expect, it } from "vitest";

import type { Fixed } from "../../types";
import {
  FIXED_ONE,
  FIXED_RAW_MAX,
  FIXED_RAW_MIN,
  FIXED_SCALE,
  FIXED_ZERO,
  add,
  clampUnit,
  compare,
  div,
  fromInt,
  fromRatio,
  inRange,
  mul,
  sub,
  toNumber,
} from "../fixed";

describe("fixed: representation & boundaries", () => {
  it("uses a 2^16 scale over the signed 32-bit raw domain", () => {
    expect(FIXED_SCALE).toBe(65536n);
    expect(FIXED_RAW_MAX).toBe((1n << 31n) - 1n);
    expect(FIXED_RAW_MIN).toBe(-(1n << 31n));
    expect(inRange(FIXED_RAW_MAX)).toBe(true);
    expect(inRange(FIXED_RAW_MAX + 1n)).toBe(false);
    expect(inRange(FIXED_RAW_MIN - 1n)).toBe(false);
  });

  it("round-trips every representable whole number exactly", () => {
    for (let whole = -32768; whole <= 32767; whole += 1) {
      expect(toNumber(fromInt(whole))).toBe(whole);
    }
  });

  it("rejects non-integers and out-of-range whole values at the boundary", () => {
    expect(() => fromInt(1.5)).toThrow(/not a safe integer/);
    expect(() => fromInt(32768)).toThrow(/overflows Q16.16/);
    expect(() => fromInt(-32769)).toThrow(/overflows Q16.16/);
    expect(() => fromInt(Number.MAX_SAFE_INTEGER)).toThrow(/overflows Q16.16/);
  });
});

describe("fixed: fromRatio", () => {
  it("converts exact ratios with half-away-from-zero rounding", () => {
    expect(fromRatio(1n, 3n)).toBe(21845n); // 0.33333… truncated side
    expect(fromRatio(2n, 3n)).toBe(43691n); // 0.66666… rounds up
    expect(fromRatio(-1n, 2n)).toBe(-32768n);
    expect(fromRatio(1n, 2n)).toBe(32768n);
    expect(fromRatio(2n, 1n)).toBe(FIXED_ONE + FIXED_ONE);
    expect(fromRatio(0n, 7n)).toBe(FIXED_ZERO);
  });

  it("fails loud on a zero denominator", () => {
    expect(() => fromRatio(1n, 0n)).toThrow(/zero denominator/);
  });

  it("fails loud when the ratio exceeds the Q16.16 domain", () => {
    expect(() => fromRatio(40000n, 1n)).toThrow(/overflows Q16.16/);
  });
});

describe("fixed: arithmetic", () => {
  it("adds and subtracts exactly within range", () => {
    expect(add(fromInt(10), fromInt(20))).toBe(fromInt(30));
    expect(sub(fromInt(10), fromInt(20))).toBe(fromInt(-10));
    expect(add(fromRatio(1n, 2n), fromRatio(1n, 2n))).toBe(FIXED_ONE);
  });

  it("fails loud on add/sub overflow instead of wrapping", () => {
    expect(() => add(FIXED_RAW_MAX as Fixed, 1n)).toThrow(/fixed\.add.*overflows/);
    expect(() => sub(FIXED_RAW_MIN as Fixed, 1n)).toThrow(/fixed\.sub.*overflows/);
  });

  it("multiplies with one exact 16-bit downshift", () => {
    const half = fromRatio(1n, 2n);
    expect(mul(fromInt(2), fromInt(3))).toBe(fromInt(6));
    expect(mul(half, half)).toBe(16384n); // 0.25
    expect(mul(-half, half)).toBe(-16384n);
    expect(mul(half, FIXED_ONE)).toBe(half);
  });

  it("rounds products half away from zero", () => {
    // 1 raw unit × 1 raw unit = 2^-32 → half-away rounds to 0, stays 0-signed.
    expect(mul(1n as Fixed, 1n as Fixed)).toBe(0n);
    // (2^15 + tiny) × same ≈ 0.5·2^16/2^16… exact check against integer math:
    const a = 40000n as Fixed;
    const b = 40000n as Fixed;
    const product = a * b; // 1.6e9 raw^2
    const floorShift = product >> 16n;
    const remainder = product & 0xffffn;
    const expected = remainder * 2n >= FIXED_SCALE ? floorShift + 1n : floorShift;
    expect(mul(a, b)).toBe(expected);
  });

  it("fails loud when a product leaves the domain", () => {
    expect(() => mul(fromInt(200), fromInt(200))).toThrow(/fixed\.mul.*overflows/);
  });

  it("divides exactly and consistently with fromRatio", () => {
    expect(div(FIXED_ONE, fromInt(3))).toBe(fromRatio(1n, 3n));
    expect(div(fromInt(6), fromInt(3))).toBe(fromInt(2));
    expect(div(fromInt(-6), fromInt(3))).toBe(fromInt(-2));
    expect(div(fromRatio(1n, 4n), fromRatio(1n, 2n))).toBe(fromRatio(1n, 2n));
  });

  it("fails loud on divide-by-zero and quotient overflow", () => {
    expect(() => div(FIXED_ONE, FIXED_ZERO)).toThrow(/division by zero/);
    expect(() => div(fromInt(30000), fromRatio(1n, 2n))).toThrow(/fixed\.div.*overflows/);
  });
});

describe("fixed: order, clamping, display", () => {
  it("orders values with -1 | 0 | 1 (safe for sorting, never subtraction)", () => {
    expect(compare(fromInt(-5), fromInt(5))).toBe(-1);
    expect(compare(FIXED_ONE, FIXED_ONE)).toBe(0);
    expect(compare(1n as Fixed, FIXED_ZERO)).toBe(1);
  });

  it("clamps probabilities into [0, 1]", () => {
    expect(clampUnit(-999n as Fixed)).toBe(FIXED_ZERO);
    expect(clampUnit(FIXED_ONE)).toBe(FIXED_ONE);
    expect(clampUnit(999_999n as Fixed)).toBe(FIXED_ONE);
    expect(clampUnit(fromRatio(1n, 3n))).toBe(fromRatio(1n, 3n));
  });

  it("toNumber resolves to unit-precision floats for whole values only", () => {
    expect(toNumber(FIXED_ONE)).toBe(1);
    expect(toNumber(1n as Fixed)).toBeCloseTo(1 / 65536, 12);
  });
});
