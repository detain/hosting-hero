import { describe, expect, it } from "vitest";

import { FIXED_ONE, FIXED_ZERO, fromRatio } from "../../kernel/fixed.js";
import {
  applyFifthAxis,
  AXIS,
  compositeScore,
  defaultScorecardConfig,
  getActiveScorecard,
  gradeFor,
  SCORECARD_CANDIDATES,
  type ScorecardConfig,
} from "../scoring.js";

/**
 * OD-1 IS OPEN. These tests pin the UNDECIDED state: three candidates
 * side-by-side, active null, and a getter that THROWS pointing at
 * MASTER_REPORT §6. When the owner picks, flip `active` (a different
 * config value — not a code default) and adjust the throw test.
 */

describe("scorecard stays undecided until the owner chooses (task-6)", () => {
  it("getActiveScorecard THROWS while active is null, citing MASTER_REPORT §6", () => {
    expect(defaultScorecardConfig.active).toBeNull();
    expect(() => getActiveScorecard(defaultScorecardConfig)).toThrow(/MASTER_REPORT/);
    expect(() => getActiveScorecard(defaultScorecardConfig)).toThrow(/OD-1/);
    expect(() => getActiveScorecard(defaultScorecardConfig)).toThrow(/§6/);
  });

  it("all three §6.16 candidates stand side by side, sheets A|B|C tagged", () => {
    expect(SCORECARD_CANDIDATES.map((c) => c.id)).toEqual([
      "uptime-first",
      "conversion-first",
      "commitment-convergence",
    ]);
    expect(new Set(SCORECARD_CANDIDATES.map((c) => c.tuningSheet))).toEqual(new Set(["A", "B", "C"]));
  });

  it("weight sets match the doc rows exactly (§6.9/§6.16:25639-25641)", () => {
    const uptime = SCORECARD_CANDIDATES[0]!;
    expect(uptime.weights[AXIS.UPTIME]).toBe(30);
    expect(uptime.weights[AXIS.PERFORMANCE]).toBe(20);
    expect(uptime.weights[AXIS.PROFITABILITY]).toBe(30);
    expect(uptime.weights[AXIS.GROWTH]).toBe(20);
    const conversion = SCORECARD_CANDIDATES[1]!;
    expect(conversion.weights[AXIS.CONVERSION]).toBe(35);
    expect(conversion.weights[AXIS.PROFITABILITY]).toBe(25);
    expect(conversion.weights[AXIS.RESILIENCE]).toBe(20);
    expect(conversion.weights[AXIS.GROWTH]).toBe(20);
    const convergence = SCORECARD_CANDIDATES[2]!;
    expect(convergence.weights[AXIS.AVAILABILITY_VS_COMMITMENT]).toBe(30); // semantics OD-1c, value PROVISIONAL mirror
  });

  it("an explicit owner choice resolves the getter; a bogus one fails loud", () => {
    const chosen: ScorecardConfig = { ...defaultScorecardConfig, active: "conversion-first" };
    expect(getActiveScorecard(chosen).id).toBe("conversion-first");
    expect(() => getActiveScorecard({ ...chosen, active: "vibes" })).toThrow(/not a known candidate/);
  });

  it("every candidate sums to exactly 100 (constructed, not hoped)", () => {
    for (const c of SCORECARD_CANDIDATES) {
      expect(Object.values(c.weights).reduce((a, b) => a + b, 0)).toBe(100);
    }
  });
});

describe("fifth-axis displacement — 'worth 20, proportionally' (§6.9)", () => {
  it("uptime-first + durability → 24/16/24/16 + durability 20", () => {
    const w = applyFifthAxis(SCORECARD_CANDIDATES[0]!, "durability");
    expect(w).toEqual({
      [AXIS.UPTIME]: 24,
      [AXIS.PERFORMANCE]: 16,
      [AXIS.PROFITABILITY]: 24,
      [AXIS.GROWTH]: 16,
      durability: 20,
    });
  });

  it("conversion-first + inbox-placement → 28/20/16/16 + 20", () => {
    const w = applyFifthAxis(SCORECARD_CANDIDATES[1]!, "inbox-placement");
    expect(w[AXIS.CONVERSION]).toBe(28);
    expect(w[AXIS.PROFITABILITY]).toBe(20);
    expect(w["inbox-placement"]).toBe(20);
    expect(Object.values(w).reduce((a, b) => a + b, 0)).toBe(100);
  });

  it("weights indivisible by 5 are rejected rather than rounded (§ backups 40/30/20/10 style is fine; 33 is not)", () => {
    const odd: ScorecardConfig = {
      ...defaultScorecardConfig,
      candidates: [
        { id: "odd", tuningSheet: "A", weights: { a: 33, b: 33, c: 34 }, source: "test" },
        ...SCORECARD_CANDIDATES,
      ],
    };
    expect(() => applyFifthAxis(odd.candidates[0]!, "x")).toThrow(/not divisible/);
  });

  it("backup-style 40/30/20/10 displaces cleanly (§6.9 per-type examples)", () => {
    const backup = { id: "bk", tuningSheet: "C" as const, weights: { durability: 40, restore: 30, profit: 20, growth: 10 }, source: "§6.9" };
    const w = applyFifthAxis(backup, "extra");
    expect(w).toEqual({ durability: 32, restore: 24, profit: 16, growth: 8, extra: 20 });
  });
});

describe("composite scoring + grade bands (S≥92 A≥82 B≥70 C≥58 D≥45 F §6.16:25638)", () => {
  const axes = (v: bigint) =>
    new Map([
      [AXIS.UPTIME, v],
      [AXIS.PERFORMANCE, v],
      [AXIS.PROFITABILITY, v],
      [AXIS.GROWTH, v],
    ]);

  it("perfect run scores 1.0 and grades S", () => {
    const composite = compositeScore(SCORECARD_CANDIDATES[0]!.weights, axes(FIXED_ONE));
    expect(composite).toBe(FIXED_ONE);
    expect(gradeFor(composite)).toBe("S");
  });

  it("zero run grades F; mid run lands B-or-better monotonic", () => {
    expect(compositeScore(SCORECARD_CANDIDATES[0]!.weights, axes(FIXED_ZERO))).toBe(FIXED_ZERO);
    expect(gradeFor(FIXED_ZERO)).toBe("F");
    const mid = compositeScore(SCORECARD_CANDIDATES[0]!.weights, axes(fromRatio(82n, 100n)));
    expect(gradeFor(mid)).toBe("A"); // 0.82 exactly on the A floor
  });

  it("missing axis fails loud; out-of-range axis fails loud", () => {
    expect(() => compositeScore(SCORECARD_CANDIDATES[0]!.weights, new Map([[AXIS.UPTIME, FIXED_ONE]]))).toThrow(/missing axis/);
    expect(() =>
      compositeScore(SCORECARD_CANDIDATES[0]!.weights, new Map([
        [AXIS.UPTIME, FIXED_ONE],
        [AXIS.PERFORMANCE, fromRatio(2n, 1n)],
        [AXIS.PROFITABILITY, FIXED_ONE],
        [AXIS.GROWTH, FIXED_ONE],
      ])),
    ).toThrow(/outside \[0,1\]/);
  });

  it("band edges map to the documented letters", () => {
    // axis/composite Fixed lives in [0,1] — 92% is fromRatio(92,100), not 92.
    const pct = (n: number) => fromRatio(BigInt(n), 100n);
    expect(gradeFor(pct(92))).toBe("S");
    expect(gradeFor(pct(91))).toBe("A");
    expect(gradeFor(pct(82))).toBe("A");
    expect(gradeFor(pct(81))).toBe("B");
    expect(gradeFor(pct(70))).toBe("B");
    expect(gradeFor(pct(69))).toBe("C");
    expect(gradeFor(pct(58))).toBe("C");
    expect(gradeFor(pct(57))).toBe("D");
    expect(gradeFor(pct(45))).toBe("D");
    expect(gradeFor(pct(44))).toBe("F");
  });
});
