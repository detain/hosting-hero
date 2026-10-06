/**
 * Number Law (§8.15) unit tests — the laws ARE the assertions: money's $10k
 * floor, decimals only below 10%, latency never seconds, nines WITH minutes,
 * and "?" for fog at every door.
 */
import { describe, expect, it } from "vitest";
import {
  NO_DATA,
  formatLatencyFromUs,
  formatLatencyMs,
  formatMoney,
  formatMoneyOrNull,
  formatPercent,
  formatRatioAsPercent,
  ninesWithMinutes,
  tabularNumber,
} from "../numberLaw";

describe("money — never abbreviated below $10k", () => {
  it("matches the pinned formatMicroUsd goldens byte-identically", () => {
    expect(formatMoney(12_500_000_000n)).toBe("$12.5k");
    expect(formatMoney(9_990_000_000n)).toBe("$9,990.00"); // $9,990 < $10k → full cents
    expect(formatMoney(-5_000_000n)).toBe("−$5.00");
    expect(formatMoney(0n)).toBe("$0.00");
    expect(formatMoney(9_999_999_999n)).toBe("$9,999.99");
    expect(formatMoney(10_000_000_000n)).toBe("$10.0k");
  });

  it("null money is '?' never $0.00 (§4.1 R-66)", () => {
    expect(formatMoneyOrNull(null)).toBe(NO_DATA);
  });
});

describe("tabular figures", () => {
  it("groups thousands and pads fixed digits", () => {
    expect(tabularNumber(1234567)).toBe("1,234,567");
    expect(tabularNumber(3.14, 2)).toBe("3.14");
    expect(tabularNumber(null)).toBe("?");
    expect(tabularNumber(Number.NaN)).toBe("?");
  });
});

describe("percent — one decimal ONLY below 10", () => {
  it("rounds at or above ten, shows a decimal below", () => {
    expect(formatPercent(89.3)).toBe("89%");
    expect(formatPercent(9.46)).toBe("9.5%");
    expect(formatPercent(10)).toBe("10%");
    expect(formatPercent(9.99)).toBe("10.0%");
    expect(formatPercent(null)).toBe("?");
  });

  it("ratio form scales 0–1 into the same law", () => {
    expect(formatRatioAsPercent(0.893)).toBe("89%");
    expect(formatRatioAsPercent(0.0512)).toBe("5.1%");
  });

  it("out-of-domain values fail loudly, not silently", () => {
    expect(() => formatPercent(101)).toThrow(RangeError);
  });
});

describe("latency — always ms, never s", () => {
  it("stamps ms at every magnitude, even absurd ones", () => {
    expect(formatLatencyMs(4.25)).toEqual({ value: "4.3", unit: "ms" });
    expect(formatLatencyMs(300_000)).toEqual({ value: "300,000", unit: "ms" });
    expect(formatLatencyFromUs(1_500n)).toEqual({ value: "1.5", unit: "ms" });
    expect(formatLatencyFromUs(null)).toEqual({ value: "?", unit: "" });
  });

  it("negative latency is a producer bug", () => {
    expect(() => formatLatencyMs(-1)).toThrow(RangeError);
  });
});

describe("nines-with-minutes — ALWAYS both (§8.15)", () => {
  it("renders the canonical golden", () => {
    expect(ninesWithMinutes(0.999)).toBe("three nines (43m/mo)");
  });

  it("counts nines and prices them in outage minutes", () => {
    expect(ninesWithMinutes(0.9)).toBe("one nine (4320m/mo)");
    expect(ninesWithMinutes(0.99)).toBe("two nines (432m/mo)");
    expect(ninesWithMinutes(0.9999)).toBe("four nines (4m/mo)");
    expect(ninesWithMinutes(0.999999)).toBe("five+ nines (0m/mo)");
    expect(ninesWithMinutes(1)).toBe("five nines (0m/mo)");
  });

  it("falls back to plain percent when there are no nines to speak of", () => {
    expect(ninesWithMinutes(0.5)).toBe("50% (21600m/mo)");
  });

  it("null is '?' and out-of-range throws", () => {
    expect(ninesWithMinutes(null)).toBe("?");
    expect(() => ninesWithMinutes(1.5)).toThrow(RangeError);
  });
});
