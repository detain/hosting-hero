/** §2.13 coverage-strength leg: the invalidates table (mirror law), the
 *  boundary parser, and the cell/grid/report fold. Ladder + profile pins
 *  live in matrix.test.ts and run UNAIDED — byte-identity when unaffixed
 *  is claimed here, never assumed.
 *
 *  TEST-SIDE cross-module imports (versus/deck, versus/affixes) are the
 *  sanctioned drift-pin pattern (elasticity vs intent-door precedent):
 *  coverage SRC keeps zero ../versus edges — pinned by determinism.test.ts. */
import { describe, expect, it } from "vitest";
import { FIXED_ONE, fromRatio } from "../../kernel/fixed.js";
import { encodeTaggedTree } from "../../internal/canonical.js";
import type { CanonicalProblem } from "../../internal/canonical.js";
import { AFFIX_VOCABULARY } from "../../versus/deck.js";
import { AFFIX_WAVE_DELTAS } from "../../versus/affixes.js";
import { DEFENSE_ROLE_IDS } from "../defenseRoles.js";
import {
  AFFIX_COVERAGE_NULLIFIES,
  affixCoverageNullifier,
  deriveCoverageCellForAffix,
} from "../affixLegs.js";
import { buildCoverageGrid, coverageCellKey, secondAnswerGaps } from "../grid.js";
import { darkCellReport } from "../invitations.js";
import type { ThreatRoleCensus } from "../invitations.js";
import { CoverageError, deriveCoverageCell, resolveCoverageProfile } from "../matrix.js";
import type { CoverageProfile } from "../matrix.js";
import { THREAT_ROLES } from "../../waves/table.js";
import type { ThreatRole } from "../../waves/table.js";

function encode(value: unknown): string {
  const report = (problem: CanonicalProblem): never => {
    throw new Error(`affixLegs determinism: not canonical-encodable: ${problem.kind}`);
  };
  return JSON.stringify(encodeTaggedTree(value, report));
}

/** Every column the five doc-named slugs invalidate, plus spare columns. */
const PROFILE: CoverageProfile = new Map([
  ["waf", { roles: ["classify"] as const, strengths: { boss: FIXED_ONE } }],
  ["scrub", { roles: ["absorb"] as const }],
  ["rate-limiter", { roles: ["meter"] as const }],
  ["watch", { roles: ["detect"] as const }],
  ["bounty", { roles: ["deter"] as const }],
]);

const NULLIFIED: readonly [string, string][] = [
  ["low-slow", "detect"],
  ["distributed", "meter"],
  ["encrypted", "classify"],
  ["adaptive", "deter"],
  ["piggyback", "absorb"],
];
const COLUMNLESS: readonly string[] = [
  "timed",
  "mimic",
  "persistent",
  "off-hours-only",
  "ramped",
  "targeted-at-one-customer",
  "piggybacked-on-a-maintenance-window",
  "two-stage",
  "rate-shaped",
  "diurnal",
  "bounded",
];

/* ══════════════════════════ table law ══════════════════════════ */

describe("AFFIX_COVERAGE_NULLIFIES — table law", () => {
  it("drift pin: keys equal versus AFFIX_VOCABULARY, exactly and in order", () => {
    expect(Object.keys(AFFIX_COVERAGE_NULLIFIES)).toEqual([...AFFIX_VOCABULARY]);
  });

  it("exactly five slugs nullify a column; all five columns distinct, all in the nine", () => {
    const legs = Object.entries(AFFIX_COVERAGE_NULLIFIES).filter(([, role]) => role !== null);
    expect(legs.length).toBe(5);
    const roles = legs.map(([, role]) => role as string);
    expect(new Set(roles).size).toBe(5);
    for (const role of roles) expect(DEFENSE_ROLE_IDS).toContain(role);
  });

  it.each(NULLIFIED)("doc line: %s invalidates %s (hg §2.13 invalidates table, verbatim)", (slug, role) => {
    expect(AFFIX_COVERAGE_NULLIFIES[slug]).toBe(role);
  });

  it.each(COLUMNLESS)("%s has no coverage leg (doc names no column — see table row comment)", (slug) => {
    expect(AFFIX_COVERAGE_NULLIFIES[slug]).toBeNull();
  });

  it("coherence pin: every nullifying slug is live:true in the wave-delta table", () => {
    for (const [slug] of NULLIFIED) {
      expect(AFFIX_WAVE_DELTAS[slug as keyof typeof AFFIX_WAVE_DELTAS].live, slug).toBe(true);
    }
  });
});

/* ══════════════════════════ boundary parser ══════════════════════════ */

describe("affixCoverageNullifier — boundary parse", () => {
  it("null and undefined (unaffixed threat) parse to null", () => {
    expect(affixCoverageNullifier(null)).toBeNull();
    expect(affixCoverageNullifier(undefined)).toBeNull();
  });

  it("known slugs return their column (or the honest null)", () => {
    expect(affixCoverageNullifier("encrypted")).toBe("classify");
    expect(affixCoverageNullifier("two-stage")).toBeNull();
  });

  it("unknown slugs die BAD_AFFIX naming §2.13", () => {
    expect(() => affixCoverageNullifier("phantom-spice")).toThrow(CoverageError);
    try {
      affixCoverageNullifier("phantom-spice");
    } catch (error) {
      expect((error as CoverageError).code).toBe("BAD_AFFIX");
      expect((error as Error).message).toContain("§2.13 AFFIX_VOCABULARY");
    }
  });

  it("prototype keys are fenced (hasOwn law, BudgetManager precedent)", () => {
    for (const key of ["toString", "constructor", "__proto__"]) {
      expect(() => affixCoverageNullifier(key)).toThrow(/BAD_AFFIX/);
    }
  });
});

/* ══════════════════════════ cell law ══════════════════════════ */

describe("deriveCoverageCellForAffix — cell law", () => {
  const resolved = resolveCoverageProfile(PROFILE);

  it("absent and null affix are the identity twin of deriveCoverageCell (full 12×9 sweep)", () => {
    for (const threatRole of THREAT_ROLES) {
      for (const defenseRole of DEFENSE_ROLE_IDS) {
        const plain = deriveCoverageCell(resolved, threatRole, defenseRole);
        expect(deriveCoverageCellForAffix(resolved, threatRole, defenseRole, undefined)).toEqual(plain);
        expect(deriveCoverageCellForAffix(resolved, threatRole, defenseRole, null)).toEqual(plain);
      }
    }
  });

  it("a non-nullified column is identity even under an affix", () => {
    for (const threatRole of THREAT_ROLES) {
      const plain = deriveCoverageCell(resolved, threatRole, "meter");
      expect(deriveCoverageCellForAffix(resolved, threatRole, "meter", "encrypted")).toEqual(plain);
    }
  });

  it("the nullified column reads dark in EVERY row, contributors kept, calibration no shield", () => {
    for (const threatRole of THREAT_ROLES) {
      const cell = deriveCoverageCellForAffix(resolved, threatRole, "classify", "encrypted");
      expect(cell.strength).toBe(0n);
      expect(cell.state).toBe("dark");
      expect(cell.contributors).toEqual(["waf"]); // you own it; it does not answer THIS threat
      expect(cell.threatRole).toBe(threatRole);
      expect(cell.defenseRole).toBe("classify");
    }
    // The sharpest witness: boss|classify is calibrated to FIXED_ONE/"strong"
    // unaffixed — invalidation is categorical, not a discount.
    expect(deriveCoverageCell(resolved, "boss", "classify").state).toBe("strong");
  });

  it("a nullified column nobody owns stays an empty dark cell (no phantom contributors)", () => {
    const bare = resolveCoverageProfile(new Map([["only-waf", { roles: ["classify"] as const }]]));
    const cell = deriveCoverageCellForAffix(bare, "swarm", "meter", "distributed");
    expect(cell.strength).toBe(0n);
    expect(cell.state).toBe("dark");
    expect(cell.contributors).toEqual([]);
  });

  it("garbage affix slugs fail loud at the cell boundary too", () => {
    expect(() => deriveCoverageCellForAffix(resolved, "swarm", "classify", "nope")).toThrow(/BAD_AFFIX/);
  });

  it("invalid roles still die their own codes under an affix (validation rides the base derivation)", () => {
    expect(() =>
      deriveCoverageCellForAffix(resolved, "giant" as ThreatRole, "classify", "encrypted"),
    ).toThrow(/BAD_THREAT_ROLE/);
  });
});

/* ══════════════════════════ grid projection ══════════════════════════ */

describe("buildCoverageGrid({affix}) — projection law", () => {
  const profiles: readonly [string, CoverageProfile][] = [
    ["empty", new Map()],
    ["fixture", PROFILE],
    ["single-column", new Map([["waf", { roles: ["classify"] as const }]])],
  ];

  it.each(profiles)("%s: absent and explicit-null affix grids are wire-identical twins", (_name, profile) => {
    const plain = encode(buildCoverageGrid({ profile }));
    expect(encode(buildCoverageGrid({ profile, affix: null }))).toBe(plain);
  });

  it("encrypted view: classify goes dark across all 12 rows, summary counts move exactly", () => {
    const plain = buildCoverageGrid({ profile: PROFILE });
    const seen = buildCoverageGrid({ profile: PROFILE, affix: "encrypted" });
    for (const threatRole of THREAT_ROLES) {
      const cell = seen.cells.get(coverageCellKey(threatRole, "classify"));
      expect(cell?.strength).toBe(0n);
      expect(cell?.state).toBe("dark");
      expect(cell?.contributors).toEqual(["waf"]);
    }
    // Unaffixed fixture: 1 strong + 11 ok + 48 dark (classify column).
    expect([plain.summary.darkCount, plain.summary.okCount, plain.summary.strongCount]).toEqual([48, 59, 1]);
    // Affixed: the 12 classify cells all join dark — 12 dark, 11 ok lost, 1 strong lost.
    expect([seen.summary.darkCount, seen.summary.okCount, seen.summary.strongCount]).toEqual([60, 48, 0]);
    for (const threatRole of THREAT_ROLES) {
      expect(seen.summary.holePairs).toContain(`${threatRole}|classify`);
    }
    // Other columns byte-unchanged in the view.
    expect(seen.cells.get(coverageCellKey("boss", "absorb"))).toEqual(
      plain.cells.get(coverageCellKey("boss", "absorb")),
    );
  });

  it.each(COLUMNLESS)("%s view is byte-identical to the unaffixed grid (honest no-op, with evidence)", (slug) => {
    expect(encode(buildCoverageGrid({ profile: PROFILE, affix: slug }))).toBe(
      encode(buildCoverageGrid({ profile: PROFILE })),
    );
  });

  it("§2.1 Second Answer law rides the affix: one column eaten ⇒ every row single-answer again", () => {
    const twoColumns: CoverageProfile = new Map([
      ["waf", { roles: ["classify"] as const }],
      ["rate-limiter", { roles: ["meter"] as const }],
    ]);
    expect(secondAnswerGaps(buildCoverageGrid({ profile: twoColumns }))).toEqual([]);
    expect(secondAnswerGaps(buildCoverageGrid({ profile: twoColumns, affix: "encrypted" }))).toEqual([
      ...THREAT_ROLES,
    ]);
  });

  it("the affixed grid keeps the deep-frozen + code-unit-insertion boundary laws", () => {
    const seen = buildCoverageGrid({ profile: PROFILE, affix: "adaptive" });
    expect(Object.isFrozen(seen)).toBe(true);
    expect(Object.isFrozen(seen.summary)).toBe(true);
    const keys = [...seen.cells.keys()];
    expect(keys).toEqual([...keys].sort());
  });

  it("×100 affixed-view rebuilds are byte-identical (two nullifying slugs)", () => {
    for (const slug of ["encrypted", "distributed"]) {
      const seedWire = encode(buildCoverageGrid({ profile: PROFILE, affix: slug }));
      for (let i = 0; i < 100; i += 1) {
        expect(encode(buildCoverageGrid({ profile: PROFILE, affix: slug }))).toBe(seedWire);
      }
    }
  });
});

/* ══════════════════════════ report fold ══════════════════════════ */

describe("darkCellReport — affix parameter", () => {
  const CENSUS: ThreatRoleCensus = new Map<string, readonly ThreatRole[]>([
    ["t-swarm", ["swarm"]],
    ["t-mimic", ["mimic"]],
  ]);
  const ONLY_METER: CoverageProfile = new Map([["rate-limiter", { roles: ["meter"] as const }]]);

  it("absent / null / explicit-undefined calls are wire-identical", () => {
    const a = darkCellReport(ONLY_METER, ["t-swarm", "t-mimic"], CENSUS);
    const b = darkCellReport(ONLY_METER, ["t-swarm", "t-mimic"], CENSUS, [], null);
    const c = darkCellReport(ONLY_METER, ["t-swarm", "t-mimic"], CENSUS, [], undefined);
    expect(encode(b)).toBe(encode(a));
    expect(encode(c)).toBe(encode(a));
  });

  it("distributed exposes the meter-answered rows it beats", () => {
    // Unaffixed: the generic 0.5 meter cell covers every row at "ok" — no rows.
    expect(darkCellReport(ONLY_METER, ["t-swarm", "t-mimic"], CENSUS)).toEqual([]);
    // Distributed view: meter is a non-answer ⇒ rows fall to all-dark.
    const rows = darkCellReport(ONLY_METER, ["t-swarm", "t-mimic"], CENSUS, [], "distributed");
    expect(rows.map((r) => r.threatRole)).toEqual(["mimic", "swarm"]);
    for (const row of rows) {
      expect(row.state).toBe("dark");
      expect(row.weakestDefenses).toContain("meter");
      expect(row.weakestDefenses.length).toBe(DEFENSE_ROLE_IDS.length);
    }
  });

  it("a columnless affix changes nothing (report twin)", () => {
    const plain = darkCellReport(new Map(), ["t-swarm"], CENSUS);
    expect(encode(darkCellReport(new Map(), ["t-swarm"], CENSUS, [], "two-stage"))).toBe(encode(plain));
  });

  it("garbage affix dies BAD_AFFIX BEFORE the census validation", () => {
    expect(() => darkCellReport(new Map(), ["ghost"], CENSUS, [], "phantom")).toThrow(/BAD_AFFIX/);
  });

  it("a calibrated answer survives only where the affix does not name it", () => {
    // waf answers mimic-row via classify at 0.5; encrypted eats it, adaptive does not.
    const waf: CoverageProfile = new Map([["waf", { roles: ["classify"] as const }]]);
    const eaten = darkCellReport(waf, ["t-mimic"], CENSUS, [], "encrypted");
    expect(eaten.map((r) => r.threatRole)).toEqual(["mimic"]);
    expect(eaten[0]?.state).toBe("dark");
    const spared = darkCellReport(waf, ["t-mimic"], CENSUS, [], "adaptive");
    expect(spared).toEqual([]);
  });

  it("the nullify is categorical for the view, not a discount: FIXED_ONE calibration still dark", () => {
    const sharp: CoverageProfile = new Map([
      ["waf", { roles: ["classify"] as const, strengths: { mimic: FIXED_ONE } }],
    ]);
    const rows = darkCellReport(sharp, ["t-mimic"], CENSUS, [], "encrypted");
    expect(rows[0]?.state).toBe("dark");
    // And WITHOUT the affix the same cell reads strong — the differential is
    // exactly the named column, never the ladder.
    const unaffixed = buildCoverageGrid({ profile: sharp }).cells.get(coverageCellKey("mimic", "classify"));
    expect(unaffixed?.state).toBe("strong");
    expect(fromRatio(85n, 100n)).toBe(55706n); // ladder rung pin re-ridden here unchanged
  });
});
