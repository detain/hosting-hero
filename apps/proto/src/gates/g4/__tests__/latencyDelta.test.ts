/**
 * latencyDelta — pure hockey-stick ladder math (service ÷ (1−ρ), §9.13 #4).
 * The law under test: the price tag is always a readable number, monotone
 * in load, and integer-exact in µs (bigint end to end, no float drift).
 */
import { describe, expect, it } from "vitest";
import { fromRatio, FIXED_UNIT } from "@hh/sim-core/kernel";
import type { Fixed } from "@hh/sim-core/types";
import {
  RHO_SATURATION,
  effectiveHopUs,
  latencyDeltaUs,
  latencyLadderRows,
  pathLatencyUs,
  type HopLoad,
} from "../latencyDelta.ts";

const hop = (label: string, serviceUs: bigint, rho: Fixed): HopLoad => Object.freeze({ label, serviceTimeUs: serviceUs, rho });

describe("effectiveHopUs · the queue price", () => {
  it("idle hop costs exactly its service time", () => {
    expect(effectiveHopUs(hop("x", 45_000n, 0n))).toBe(45_000n);
  });

  it("half-loaded hop doubles (integer-exact Q16 math)", () => {
    expect(effectiveHopUs(hop("x", 45_000n, fromRatio(1n, 2n)))).toBe((45_000n * FIXED_UNIT) / (FIXED_UNIT - fromRatio(1n, 2n)));
    expect(effectiveHopUs(hop("x", 40_000n, 32768n))).toBeGreaterThanOrEqual(79_999n);
  });

  it("saturates at the cap instead of exploding: ρ=1 is readable, not ∞", () => {
    const atCap = effectiveHopUs(hop("x", 1_000n, FIXED_UNIT));
    const pinned = effectiveHopUs(hop("x", 1_000n, RHO_SATURATION));
    expect(atCap).toBe(pinned);
    expect(atCap).toBeGreaterThan(40_000n); // ≈49.99×
    expect(atCap).toBeLessThan(1_000_000n); // and finite
  });

  it("monotone: more load never lowers the price", () => {
    let last = 0n;
    for (let pct = 0n; pct <= 120n; pct += 10n) {
      const value = effectiveHopUs(hop("x", 30_000n, fromRatio(pct, 100n)));
      expect(value).toBeGreaterThanOrEqual(last);
      last = value;
    }
  });

  it("negative service time is a parse bug and throws (fail loud)", () => {
    expect(() => effectiveHopUs(hop("bad", -1n, 0n))).toThrow(RangeError);
  });
});

describe("pathLatencyUs + latencyDeltaUs · the commit price tag", () => {
  const server = hop("web-1 service", 45_000n, fromRatio(2n, 10n));
  const switchHop = hop("sw-1 service", 20_000n, fromRatio(5n, 100n));

  it("empty path costs zero — a cable never cut has no price", () => {
    expect(pathLatencyUs([])).toBe(0n);
  });

  it("delta = after − before, bigint-exact, ms display agrees", () => {
    const d = latencyDeltaUs([server], [server, switchHop]);
    expect(d.deltaUs).toBe(d.afterUs - d.beforeUs);
    expect(d.beforeUs).toBe(effectiveHopUs(server));
    expect(d.afterUs).toBe(effectiveHopUs(server) + effectiveHopUs(switchHop));
    expect(d.deltaMs).toBeCloseTo(Number(d.deltaUs) / 1000, 6);
    expect(d.saturatedLabels).toStrictEqual([]);
  });

  it("no-op delta is exactly zero", () => {
    const d = latencyDeltaUs([server], [server]);
    expect(d.deltaUs).toBe(0n);
    expect(d.deltaMs).toBe(0);
  });

  it("heavier provider ⇒ bigger price tag (monotone)", () => {
    const light = latencyDeltaUs([server], [server, switchHop]).deltaUs;
    const loaded = latencyDeltaUs([server], [
      server,
      hop("sw-1 service", 20_000n, fromRatio(9n, 10n)),
    ]).deltaUs;
    expect(loaded).toBeGreaterThan(light);
  });

  it("saturated hops are named, so the ladder can flag 'at capacity'", () => {
    const d = latencyDeltaUs([], [hop("melting", 10_000n, FIXED_UNIT)]);
    expect(d.saturatedLabels).toStrictEqual(["melting"]);
  });
});

describe("latencyLadderRows · the display", () => {
  it("one row per hop with base vs effective ms and ρ percent", () => {
    const rows = latencyLadderRows([
      hop("web-1 service", 45_000n, fromRatio(1n, 2n)),
      hop("cable", 0n, 0n),
    ]);
    expect(rows).toHaveLength(2);
    expect(rows[0]?.label).toBe("web-1 service");
    expect(rows[0]?.baseMs).toBe(45);
    expect(rows[0]?.effectiveMs).toBeGreaterThanOrEqual(89.9);
    expect(rows[0]?.rhoPct).toBe(50);
    expect(rows[1]?.effectiveMs).toBe(0);
    expect(rows[0]?.saturated).toBe(false);
  });
});
