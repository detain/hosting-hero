import { describe, expect, it } from "vitest";

import { asMoney, type MoneyUnit } from "../../types.js";
import { streamFor } from "../../kernel/rng.js";
import {
  addMoney,
  bpsOf,
  isBigintMoney,
  MICRO_USD_PER_USD,
  ratioFromBps,
  requireNonNegative,
  requirePositive,
  scaleMoney,
  subMoney,
  sumMoney,
  usd,
} from "../money.js";
import { SEED } from "./helpers.js";

describe("money integer law — fuzz (task: integer money never floats)", () => {
  const stream = streamFor(SEED, "test/money-fuzz", 0);
  const draws: bigint[] = [];
  for (let i = 0; i < 400; i += 1) {
    const magnitude = BigInt(stream.range(1_000_000)) * BigInt(10 ** stream.range(13));
    draws.push(stream.range(2) === 0 ? magnitude : -magnitude);
  }

  it("scaleMoney always returns a bigint, incl. pathological ratios", () => {
    for (const raw of draws) {
      const amount = asMoney(raw);
      for (const [num, den] of [
        [1n, 1n],
        [290n, 10_000n],
        [3333n, 7n],
        [0n, 1n],
        [10_000n, 3n],
      ] as const) {
        const out = scaleMoney(amount, { num, den }, "fuzz");
        expect(typeof out).toBe("bigint");
      }
    }
  });

  it("rounding agrees with exact bigint rational bounds (no silent drift)", () => {
    for (const raw of draws) {
      const amount = asMoney(raw);
      const out = bpsOf(amount, 290n, "fuzz");
      const lower = (amount * 290n) / 10_000n; // truncated
      expect(out === lower || out === lower + (amount >= 0n ? 1n : -1n)).toBe(true);
    }
  });

  it("add/sub stay integral and exact", () => {
    for (let i = 1; i < draws.length; i += 1) {
      const a = asMoney(draws[i - 1]!);
      const b = asMoney(draws[i]!);
      expect(subMoney(addMoney(a, b), b)).toBe(a);
    }
  });

  it("rejects zero-denominator ratios loudly", () => {
    expect(() => scaleMoney(asMoney(5n), { num: 1n, den: 0n }, "boom")).toThrow(/den must be >= 1/);
    expect(() => ratioFromBps(-1n)).toThrow(/negative bps/);
  });

  it("guards fail loud on bad balance arithmetic", () => {
    expect(() => requirePositive(asMoney(0n), "spend")).toThrow(/amount > 0/);
    expect(() => requireNonNegative(asMoney(-1n), "bucket")).toThrow(/negative/);
  });

  it("isBigintMoney refuses float masquerades", () => {
    expect(isBigintMoney(3.5)).toBe(false);
    expect(isBigintMoney(3)).toBe(false); // ES number, not bigint
    expect(isBigintMoney(3n)).toBe(true);
  });

  it("usd/micro conversions are exact at scale", () => {
    expect(usd(5n)).toBe(asMoney(5n * MICRO_USD_PER_USD));
    expect(sumMoney([usd(1n), usd(2n), asMoney(999n)])).toBe(asMoney(3_000_999n));
    expect(sumMoney([])).toBe(asMoney(0n));
  });

  it("half-away-from-zero rounding, both signs", () => {
    expect(scaleMoney(asMoney(1n), { num: 1n, den: 2n }, "r")).toBe(asMoney(1n)); // 0.5 → 1
    expect(scaleMoney(asMoney(3n), { num: 1n, den: 2n }, "r")).toBe(asMoney(2n)); // 1.5 → 2
    expect(scaleMoney(asMoney(1n), { num: 1n, den: 4n }, "r")).toBe(asMoney(0n)); // 0.25 → 0
    expect(scaleMoney(asMoney(-1n), { num: 1n, den: 2n }, "r")).toBe(asMoney(-1n)); // −0.5 → −1
    const typed: MoneyUnit = asMoney(0n);
    expect(typed).toBe(asMoney(0n));
  });
});
