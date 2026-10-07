/** The whole-grid projection: shape, hole census, Second Answer gaps. */
import { describe, expect, it } from "vitest";
import { FIXED_ONE, fromRatio } from "../../kernel/fixed.js";
import { THREAT_ROLES } from "../../waves/table.js";
import { DEFENSE_ROLE_IDS } from "../defenseRoles.js";
import { buildCoverageGrid, coverageCellKey, secondAnswerGaps } from "../grid.js";
import { COVERAGE_CELL_COUNT, DEFAULT_UNCALIBRATED_STRENGTH } from "../matrix.js";
import type { CoverageProfile } from "../matrix.js";

describe("buildCoverageGrid — empty board is ALL dark (P17)", () => {
  const grid = buildCoverageGrid({ profile: new Map() });

  it("ships 12×9 = 108 cells exactly", () => {
    expect(grid.rows.length).toBe(12);
    expect(grid.cols.length).toBe(9);
    expect(grid.cells.size).toBe(COVERAGE_CELL_COUNT);
    expect(COVERAGE_CELL_COUNT).toBe(108);
  });

  it("rows/cols ride their ratified vocabularies", () => {
    expect([...grid.rows]).toEqual([...THREAT_ROLES]);
    expect([...grid.cols]).toEqual([...DEFENSE_ROLE_IDS]);
  });

  it("every cell dark; every key a hole; best coverage 0", () => {
    expect(grid.summary.darkCount).toBe(108);
    expect(grid.summary.thinCount).toBe(0);
    expect(grid.summary.holePairs.length).toBe(108);
    expect(grid.summary.bestCoverage).toBe(0n);
  });

  it("holePairs are sorted code-unit (digest-stable hole census)", () => {
    const sorted = [...grid.summary.holePairs].sort();
    expect(grid.summary.holePairs).toEqual(sorted);
  });

  it("cells are inserted in code-unit key order (canonical Map law)", () => {
    const keys = [...grid.cells.keys()];
    expect(keys).toEqual([...keys].sort());
    // Code-unit first pair: "boss" (earliest of the 12) × "absorb" (earliest of the 9).
    expect(keys[0]).toBe("boss|absorb");
    expect(keys[107]).toBe("tank|recover");
  });
});

describe("buildCoverageGrid — coverage math", () => {
  it("one generic buildable lifts exactly its declared columns", () => {
    const profile: CoverageProfile = new Map([["waf-basic", { roles: ["classify", "meter"] }]]);
    const grid = buildCoverageGrid({ profile });
    expect(grid.summary.okCount).toBe(24); // 2 columns × 12 rows
    expect(grid.summary.darkCount).toBe(84);
    expect(grid.summary.holePairs.every((k) => !(k.endsWith("|classify") || k.endsWith("|meter")))).toBe(true);
    expect(grid.summary.bestCoverage).toBe(DEFAULT_UNCALIBRATED_STRENGTH);
  });

  it("calibrated strength reaches 'strong' only at ≥0.85", () => {
    const profile: CoverageProfile = new Map([
      ["honeypot", { roles: ["divert"], strengths: { mimic: FIXED_ONE, tank: fromRatio(9n, 10n) } }],
      ["tarpit", { roles: ["divert"], strengths: { siege: fromRatio(4n, 5n) } }],
    ]);
    const grid = buildCoverageGrid({ profile });
    expect(grid.cells.get(coverageCellKey("mimic", "divert"))?.state).toBe("strong");
    expect(grid.cells.get(coverageCellKey("tank", "divert"))?.state).toBe("strong");
    // 4/5 = 0.8 sits just BELOW the 0.85 rung — 'ok', not 'strong'.
    expect(grid.cells.get(coverageCellKey("siege", "divert"))?.state).toBe("ok");
    expect(grid.cells.get(coverageCellKey("swarm", "divert"))?.state).toBe("ok");
    expect(grid.summary.strongCount).toBe(2);
  });

  it("cell key grammar is `<threatRole>|<defenseRole>`", () => {
    expect(coverageCellKey("swarm", "absorb")).toBe("swarm|absorb");
  });

  it("grid is deep-frozen at the boundary", () => {
    const grid = buildCoverageGrid({ profile: new Map() });
    expect(Object.isFrozen(grid)).toBe(true);
    expect(Object.isFrozen(grid.summary)).toBe(true);
    expect(Object.isFrozen(grid.summary.holePairs)).toBe(true);
    const first = grid.cells.get(coverageCellKey("swarm", "absorb")) as { contributors: readonly string[] };
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.contributors)).toBe(true);
    // Map mutation-guard law (BoardState/packs precedent): ReadonlyMap is the
    // COMPILE-TIME view; Object.freeze does not seal Map.set at runtime, so
    // writers must replace the grid, never mutate — never re-freeze-and-trust.
    expect(Object.isFrozen(grid.cells)).toBe(true);
  });
});

describe("secondAnswerGaps — §2.1 Second Answer law", () => {
  it("empty board: all twelve roles lack two answers", () => {
    const grid = buildCoverageGrid({ profile: new Map() });
    expect(secondAnswerGaps(grid)).toEqual([...THREAT_ROLES]);
  });

  it("one column filled leaves EVERY row single-answer", () => {
    const profile: CoverageProfile = new Map([["waf", { roles: ["classify"] }]]);
    expect(secondAnswerGaps(buildCoverageGrid({ profile }))).toEqual([...THREAT_ROLES]);
  });

  it("two columns clear the gap for every row", () => {
    const profile: CoverageProfile = new Map([
      ["waf", { roles: ["classify"] }],
      ["rate-limiter", { roles: ["meter"] }],
    ]);
    expect(secondAnswerGaps(buildCoverageGrid({ profile }))).toEqual([]);
  });

  it("a thin calibration does NOT count as an answer", () => {
    const profile: CoverageProfile = new Map([
      ["waf", { roles: ["classify"] }],
      ["weak-meter", { roles: ["meter"], strengths: { swarm: fromRatio(1n, 3n) } }],
    ]);
    // swarm row: classify generic 0.5 (ok) but meter calibrated DOWN to 0.333 (thin)
    // ⇒ only ONE ok-or-better column ⇒ gap.
    expect(secondAnswerGaps(buildCoverageGrid({ profile }))).toEqual(["swarm"]);
  });
});
