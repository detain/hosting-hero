import { describe, expect, it } from "vitest";

import { FIXED_ONE, FIXED_ZERO, fromInt, fromRatio } from "../../kernel/fixed";
import { MICROS_PER_MIN, MICROS_PER_SEC } from "../../kernel/time";
import { asEntityId, observedKey, ResolutionBand } from "../../types";
import {
  PointRing,
  ResolutionLadder,
  byHandDiagnosisUs,
  coverageRatio,
  deriveCell,
  reportsWrongThing,
  statusFor,
  unknownCell,
  validateCell,
  CLASS_TRACING,
  CLASS_GRAPHS_5MIN,
} from "../instrument";
import { honestBinding, key, misBoundBinding, sec } from "./fixtures";

describe("instrument: fog grades (§4.5 R42 — unknown / stale / live)", () => {
  it("statusFor is the single source of the three-grade law", () => {
    expect(statusFor({ hasValue: false, ageUs: 0n, staleAfterUs: 60n })).toBe("unknown");
    expect(statusFor({ hasValue: true, ageUs: 10n, staleAfterUs: 60n })).toBe("live");
    expect(statusFor({ hasValue: true, ageUs: 61n, staleAfterUs: 60n })).toBe("stale");
  });

  it("unknown cell is 'nothing, not zero' (§4.1 R-66…R-72)", () => {
    const cell = unknownCell();
    expect(cell.value).toBeNull();
    expect(cell.coverage).toBe(FIXED_ZERO);
    expect(cell.certainty).toBe(FIXED_ZERO);
    expect(cell.fidelity).toBe(ResolutionBand.None);
    expect(cell.status).toBe("unknown");
  });
});

describe("instrument: deriveCell — the one degradation funnel", () => {
  const target = key("web-1", "cpu");
  const binding = honestBinding(target, CLASS_TRACING);

  it("zero-coverage instrument reports NOTHING (null), never zero", () => {
    const dark = { ...binding, coverage: FIXED_ZERO };
    const cell = deriveCell(dark, { atUs: 0n, value: 42n }, sec(10));
    expect(cell.value).toBeNull();
    expect(cell.status).toBe("unknown");
    expect(cell.fidelity).toBe(ResolutionBand.None);
  });

  it("never-yet-sampled key is unknown but keeps its declared coverage for HUD budgeting", () => {
    const half = honestBinding(target, CLASS_TRACING, fromRatio(1n, 2n));
    const cell = deriveCell(half, null, sec(10));
    expect(cell.value).toBeNull();
    expect(cell.status).toBe("unknown");
    expect(cell.coverage).toBe(fromRatio(1n, 2n));
  });

  it("fresh sample: latency shows up as age, certainty = ceiling × coverage", () => {
    const now = sec(120);
    const sampleAt = now - CLASS_TRACING.lagUs;
    const cell = deriveCell(binding, { atUs: sampleAt, value: 7n }, now);
    expect(cell.value).toBe(7n);
    expect(cell.status).toBe("live");
    expect(cell.freshnessUs).toBe(CLASS_TRACING.lagUs);
    expect(cell.certainty).toBe(fromRatio(90n, 100n));
  });

  it("sample older than the staleness horizon keeps its value but flips to stale", () => {
    const old = { atUs: 0n, value: 7n };
    const cell = deriveCell(binding, old, 10n * MICROS_PER_MIN);
    expect(cell.value).toBe(7n);
    expect(cell.status).toBe("stale");
    expect(cell.freshnessUs).toBe(10n * MICROS_PER_MIN);
  });

  it("mis-bound probe stays confidently wrong (no certainty discount for the lie)", () => {
    const wrong = misBoundBinding(key("db-1", "health"), key("db-1", "process-alive"), CLASS_GRAPHS_5MIN);
    const cell = deriveCell(wrong, { atUs: sec(100) - CLASS_GRAPHS_5MIN.lagUs, value: 1n }, sec(100));
    expect(cell.value).toBe(1n);
    expect(cell.status).toBe("live");
    expect(cell.certainty).toBe(CLASS_GRAPHS_5MIN.baseCertainty); // full ceiling — no lie penalty
    expect(reportsWrongThing(wrong)).toBe(true);
    expect(reportsWrongThing(binding)).toBe(false);
  });
});

describe("instrument: PointRing bounded FIFO", () => {
  it("evicts oldest beyond capacity, chronological order preserved", () => {
    const ring = new PointRing(3);
    for (let i = 1; i <= 5; i += 1) ring.push({ atUs: BigInt(i), value: BigInt(i), sampleCount: 1 });
    expect(ring.length).toBe(3);
    expect(ring.points().map((p) => p.value)).toEqual([3n, 4n, 5n]);
  });

  it("rejects absurd capacities at the boundary", () => {
    expect(() => new PointRing(0)).toThrow(/capacity/);
    expect(() => new PointRing(1.5)).toThrow(/capacity/);
  });
});

describe("instrument: resolution ladder (§7.6 — interval determines truth)", () => {
  const k = key("web-1", "cpu");

  it("reporting band keeps raw points; coarser bands keep window averages", () => {
    const ladder = new ResolutionLadder();
    // Fine-band reporter at 0 s / 10 s, then a 30 s sample closes the first
    // Medium (30 s) window: average (10+20)/2 = 15.
    ladder.fold(k, ResolutionBand.Fine, 10n, 0n);
    ladder.fold(k, ResolutionBand.Fine, 20n, sec(10));
    ladder.fold(k, ResolutionBand.Fine, 40n, sec(30));
    expect(ladder.history(k, ResolutionBand.Fine).map((p) => p.value)).toEqual([10n, 20n, 40n]);
    expect(ladder.history(k, ResolutionBand.Medium).map((p) => [p.value, p.sampleCount])).toEqual([[15n, 2]]);
    expect(ladder.history(k, ResolutionBand.Exact)).toEqual([]);
  });

  it("empty windows retain NOTHING — silence is never drawn as zero traffic", () => {
    const ladder = new ResolutionLadder();
    ladder.fold(k, ResolutionBand.Fine, 100n, 0n);
    ladder.fold(k, ResolutionBand.Fine, 100n, sec(400)); // crosses 30-s AND 5-min windows
    const medium = ladder.history(k, ResolutionBand.Medium);
    // only the first window (count 1) flushed when the 400 s sample arrived;
    // the intervening empty windows produced no points.
    expect(medium.length).toBe(1);
    expect(medium[0]?.sampleCount).toBe(1);
  });

  it("a 1-s microburst is invisible in the 5-min rollup but present at its own band", () => {
    const ladder = new ResolutionLadder();
    for (let t = 0; t < 600; t += 1) {
      const burst = t === 137 || t === 138 || t === 139;
      ladder.fold(k, ResolutionBand.Exact, burst ? 900n : 100n, sec(t));
    }
    const exact = ladder.history(k, ResolutionBand.Exact).map((p) => p.value);
    const fine = ladder.history(k, ResolutionBand.Fine).map((p) => p.value);
    const coarse = ladder.history(k, ResolutionBand.Coarse).map((p) => p.value);
    expect(exact).toContain(900n);
    expect(fine).toContain(900n);
    expect(coarse.length).toBeGreaterThanOrEqual(1);
    for (const avg of coarse) {
      expect(avg).toBeLessThan(200n); // flat green line over a real burst — §7.6 verbatim
    }
  });

  it("non-numeric series roll up to last-value, bigint series to mean", () => {
    const ladder = new ResolutionLadder();
    ladder.fold(k, ResolutionBand.Exact, "green", 0n);
    ladder.fold(k, ResolutionBand.Exact, "amber", sec(5));
    ladder.fold(k, ResolutionBand.Exact, "green", sec(31));
    expect(ladder.history(k, ResolutionBand.Medium).map((p) => p.value)).toEqual(["amber"]);
  });
});

describe("instrument: fairness + validation helpers", () => {
  it("byHandDiagnosisUs applies the 4–8× fog-toll (time, never certainty)", () => {
    expect(byHandDiagnosisUs(MICROS_PER_MIN, 4)).toBe(4n * MICROS_PER_MIN);
    expect(byHandDiagnosisUs(MICROS_PER_MIN, 8)).toBe(8n * MICROS_PER_MIN);
    expect(() => byHandDiagnosisUs(0n, 4)).toThrow(/positive/);
  });

  it("coverageRatio is Fixed arithmetic over counts", () => {
    expect(coverageRatio(64, 100)).toBe(fromRatio(64n, 100n));
    expect(coverageRatio(0, 0)).toBe(FIXED_ZERO);
  });

  it("validateCell fails loud on poison (out-of-range, float freshness, lied status)", () => {
    const ok = { value: null, fidelity: ResolutionBand.None, freshnessUs: 0n, coverage: FIXED_ZERO, certainty: FIXED_ZERO, status: "unknown" } as const;
    expect(() => validateCell(ok, "t")).not.toThrow();
    expect(() => validateCell({ ...ok, coverage: FIXED_ONE + 1n }, "t")).toThrow(/coverage/);
    expect(() => validateCell({ ...ok, freshnessUs: -1n }, "t")).toThrow(/negative/);
    expect(() => validateCell({ ...ok, value: 3n }, "t")).toThrow(/nothing, not zero/);
    expect(() => validateCell({ ...ok, status: "dead" as "live" }, "t")).toThrow(/fog grade/);
  });

  it("ladder keys and derived bindings use stable key strings (no locale anywhere)", () => {
    const ladder = new ResolutionLadder();
    const k2 = observedKey(asEntityId("node"), "temp");
    ladder.fold(k2, ResolutionBand.Fine, 1n, 0n);
    expect(ladder.pointCount(k2, ResolutionBand.Fine)).toBe(1);
  });
});
