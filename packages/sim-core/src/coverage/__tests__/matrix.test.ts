/** Cell law: the Fixed ladder, MAX-combine, and the profile boundary parser. */
import { describe, expect, it } from "vitest";
import { FIXED_ONE, FIXED_ZERO, fromRatio } from "../../kernel/fixed.js";
import {
  COVERAGE_LADDER,
  CoverageError,
  DEFAULT_UNCALIBRATED_STRENGTH,
  combineCoverageStrength,
  coverageCellState,
  deriveCoverageCell,
  resolveCoverageProfile,
} from "../matrix.js";
import type { BuildableCoverage, CoverageProfile } from "../matrix.js";
import { DEFENSE_ROLE_IDS } from "../defenseRoles.js";

function expectCoverage(code: string, run: () => unknown, pathFragment: string): void {
  try {
    run();
  } catch (error) {
    expect(error).toBeInstanceOf(CoverageError);
    expect((error as CoverageError).code).toBe(code);
    expect((error as Error).message).toContain(pathFragment);
    return;
  }
  throw new Error(`expected CoverageError ${code}, nothing was thrown`);
}

describe("COVERAGE_LADDER — Fixed-exact rungs, pinned raw", () => {
  it("0.1 / 0.4 / 0.85 land on their Q16.16 rounded raw values", () => {
    expect(COVERAGE_LADDER.darkBelow).toBe(6554n); // 6553.6 → half-away
    expect(COVERAGE_LADDER.thinBelow).toBe(26214n); // 26214.4 → down
    expect(COVERAGE_LADDER.okBelow).toBe(55706n); // 55705.6 → half-away
  });

  it("ladder boundaries at the EXACT rung values (strict-below rungs)", () => {
    expect(coverageCellState(FIXED_ZERO)).toBe("dark");
    expect(coverageCellState(6553n)).toBe("dark");
    expect(coverageCellState(6554n)).toBe("thin"); // == darkBelow ⇒ left dark
    expect(coverageCellState(26213n)).toBe("thin");
    expect(coverageCellState(26214n)).toBe("ok"); // == thinBelow ⇒ left thin
    expect(coverageCellState(55705n)).toBe("ok");
    expect(coverageCellState(55706n)).toBe("strong"); // == okBelow ⇒ strong
    expect(coverageCellState(FIXED_ONE)).toBe("strong");
  });

  it("DEFAULT_UNCALIBRATED_STRENGTH is exactly 0.5 (mid-band 'ok')", () => {
    expect(DEFAULT_UNCALIBRATED_STRENGTH).toBe(32768n);
    expect(coverageCellState(DEFAULT_UNCALIBRATED_STRENGTH)).toBe("ok");
  });

  it("non-bigint strength fails loud", () => {
    expectCoverage("BAD_STRENGTH", () => coverageCellState(0.5 as unknown as bigint), "coverageCellState");
  });
});

describe("combineCoverageStrength — MAX, never sum", () => {
  it("two identical contributions do not stack", () => {
    const half = fromRatio(1n, 2n);
    expect(combineCoverageStrength(half, half)).toBe(half);
  });
  it("the stronger contribution wins", () => {
    expect(combineCoverageStrength(FIXED_ZERO, 7n)).toBe(7n);
    expect(combineCoverageStrength(9n, 3n)).toBe(9n);
  });
});

describe("resolveCoverageProfile + deriveCoverageCell", () => {
  const genericWaf: CoverageProfile = new Map([["waf-basic", { roles: ["classify"] as const }]]);

  it("a generic buildable lifts EXACTLY its declared column, all 12 rows to 'ok'", () => {
    const resolved = resolveCoverageProfile(genericWaf);
    for (const threatRole of ["swarm", "boss"] as const) {
      for (const defenseRole of DEFENSE_ROLE_IDS) {
        const cell = deriveCoverageCell(resolved, threatRole, defenseRole);
        if (defenseRole === "classify") {
          expect(cell.state).toBe("ok");
          expect(cell.strength).toBe(DEFAULT_UNCALIBRATED_STRENGTH);
          expect(cell.contributors).toEqual(["waf-basic"]);
        } else {
          expect(cell.state).toBe("dark");
          expect(cell.strength).toBe(FIXED_ZERO);
          expect(cell.contributors).toEqual([]);
        }
      }
    }
  });

  it("MAX-combine proof: two buildables in one role → max, NOT sum", () => {
    const twoWafs: CoverageProfile = new Map([
      ["waf-a", { roles: ["classify"] as const }],
      ["waf-b", { roles: ["classify"] as const, strengths: { swarm: fromRatio(1n, 4n) } }],
    ]);
    const resolved = resolveCoverageProfile(twoWafs);
    const swarm = deriveCoverageCell(resolved, "swarm", "classify");
    // waf-b calibrates swarm to 0.25, waf-a is generic 0.5 → max = 0.5 (NOT 0.75).
    expect(swarm.strength).toBe(DEFAULT_UNCALIBRATED_STRENGTH);
    expect(swarm.contributors).toEqual(["waf-a", "waf-b"]);
    // A calibration ABOVE the generic default wins.
    const strong: CoverageProfile = new Map([
      ["waf-a", { roles: ["classify"] as const, strengths: { tank: fromRatio(9n, 10n) } }],
      ["waf-b", { roles: ["classify"] as const }],
    ]);
    expect(deriveCoverageCell(resolveCoverageProfile(strong), "tank", "classify").strength).toBe(
      fromRatio(9n, 10n),
    );
  });

  it("empty board: every cell dark, zero contributors", () => {
    const resolved = resolveCoverageProfile(new Map());
    const cell = deriveCoverageCell(resolved, "mimic", "divert");
    expect(cell.strength).toBe(FIXED_ZERO);
    expect(cell.state).toBe("dark");
    expect(cell.contributors).toEqual([]);
  });

  it("boundary failures (Law 4)", () => {
    expectCoverage("EMPTY_ROLES", () => resolveCoverageProfile(new Map([["", { roles: ["absorb"] as const }]])), "non-empty");
    expectCoverage(
      "EMPTY_ROLES",
      () => resolveCoverageProfile(new Map([["x", { roles: [] as const }]])),
      "buildable 'x'",
    );
    expectCoverage(
      "BAD_DEFENSE_ROLE",
      () => resolveCoverageProfile(new Map([["x", { roles: ["firewall"] as unknown as ["absorb"] }]])),
      "buildable 'x'",
    );
    expectCoverage(
      "BAD_THREAT_ROLE",
      () =>
        resolveCoverageProfile(
          new Map([
            [
              "x",
              {
                roles: ["absorb"] as const,
                // Intentionally-invalid wire data: key outside the 12 roles.
                strengths: { giant: FIXED_ONE } as unknown as NonNullable<BuildableCoverage["strengths"]>,
              },
            ],
          ]),
        ),
      "strengths",
    );
    expectCoverage(
      "BAD_STRENGTH",
      () =>
        resolveCoverageProfile(
          new Map([["x", { roles: ["absorb"] as const, strengths: { swarm: 0.5 as unknown as bigint } }]]),
        ),
      "strengths.swarm",
    );
    expectCoverage(
      "OUT_OF_RANGE",
      () =>
        resolveCoverageProfile(
          new Map([["x", { roles: ["absorb"] as const, strengths: { swarm: -1n } }]]),
        ),
      "negative",
    );
    expectCoverage(
      "OUT_OF_RANGE",
      () =>
        resolveCoverageProfile(
          new Map([["x", { roles: ["absorb"] as const, strengths: { swarm: FIXED_ONE + 1n } }]]),
        ),
      "exceeds FIXED_ONE",
    );
    expectCoverage("BAD_THREAT_ROLE", () => deriveCoverageCell([], "nope" as never, "absorb"), "deriveCoverageCell.threatRole");
    expectCoverage("BAD_DEFENSE_ROLE", () => deriveCoverageCell([], "swarm", "nope" as never), "deriveCoverageCell.defenseRole");
  });

  it("resolved profile is sorted by buildable id, code-unit", () => {
    const profile: CoverageProfile = new Map([
      ["zeta", { roles: ["absorb"] as const }],
      ["Alpha", { roles: ["meter"] as const }],
      ["beta", { roles: ["detect"] as const }],
    ]);
    const resolved = resolveCoverageProfile(profile);
    expect(resolved.map((b) => b.buildableId)).toEqual(["Alpha", "beta", "zeta"]);
  });
});
