/** Determinism + purity + decoupling pins for the coverage lane:
 *  ×100 canonical re-encode byte-identity, input-shuffle invariance, and
 *  the grep-pin that no source in src/coverage imports a sibling domain. */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { FIXED_ONE, fromRatio } from "../../kernel/fixed.js";
import { encodeTaggedTree } from "../../internal/canonical.js";
import type { CanonicalProblem } from "../../internal/canonical.js";
import { buildCoverageGrid } from "../grid.js";
import { darkCellReport } from "../invitations.js";
import type { ThreatRoleCensus } from "../invitations.js";
import type { CoverageProfile } from "../matrix.js";
import type { ThreatRole } from "../../waves/table.ts";

function encodeGrid(value: unknown): string {
  const report = (problem: CanonicalProblem): never => {
    throw new Error(`coverage determinism: not canonical-encodable: ${problem.kind}`);
  };
  return JSON.stringify(encodeTaggedTree(value, report));
}

const RICH_PROFILE: CoverageProfile = new Map([
  ["waf", { roles: ["classify"], strengths: { mimic: FIXED_ONE, swarm: fromRatio(3n, 4n) } }],
  ["scrub", { roles: ["absorb", "divert"], strengths: { tank: fromRatio(7n, 10n) } }],
  ["rate-limiter", { roles: ["meter"] }],
  ["backups", { roles: ["recover"], strengths: { boss: fromRatio(1n, 10n) } }],
]);

const CENSUS: ThreatRoleCensus = new Map<string, readonly ThreatRole[]>([
  ["t-swarm", ["swarm"]],
  ["t-mimic", ["mimic", "stealth"]],
  ["t-boss", ["boss"]],
  ["t-tank", ["tank"]],
  ["t-parasite", ["parasite"]],
]);

function freshProfile(): CoverageProfile {
  return new Map(RICH_PROFILE);
}

describe("×100 digest stability (encodeTaggedTree, pipeline-absorbable)", () => {
  const seedWire = encodeGrid(buildCoverageGrid({ profile: freshProfile() }));

  it("rebuilding the grid 100× yields byte-identical canonical text", () => {
    for (let i = 0; i < 100; i += 1) {
      expect(encodeGrid(buildCoverageGrid({ profile: freshProfile() }))).toBe(seedWire);
    }
  });

  it("the grid wire survives the tagged walk as pure data (no $-tagged data collisions)", () => {
    // Cells keys contain "|"; strengths are $i bigints; nothing else exotic.
    expect(seedWire).toContain('"$i"');
    expect(seedWire).toContain("boss|absorb");
  });
});

describe("input-shuffle invariance (no-rng purity pin)", () => {
  it("shuffled profile insertion + threat arrays → identical grid + report", () => {
    const reversedProfile: CoverageProfile = new Map([...RICH_PROFILE].reverse());
    expect(encodeGrid(buildCoverageGrid({ profile: reversedProfile }))).toBe(
      encodeGrid(buildCoverageGrid({ profile: freshProfile() })),
    );

    const ids = [...CENSUS.keys()];
    const shuffledIds = [ids[3] as string, ids[0] as string, ids[4] as string, ids[1] as string, ids[2] as string];
    const a = darkCellReport(new Map(), shuffledIds, CENSUS);
    const b = darkCellReport(new Map(), [...ids].sort(), CENSUS);
    expect(encodeGrid(a)).toBe(encodeGrid(b));
  });

  it("recentInvites order cannot change the report", () => {
    const forwards = darkCellReport(new Map(), ["t-swarm", "t-mimic"], CENSUS, ["t-swarm", "t-mimic"]);
    const backwards = darkCellReport(new Map(), ["t-mimic", "t-swarm"], CENSUS, ["t-mimic", "t-swarm"]);
    expect(encodeGrid(forwards)).toBe(encodeGrid(backwards));
  });
});

describe("grep-pin — data-input decoupling + determinism hygiene", () => {
  const sources = [
    "defenseRoles.ts",
    "matrix.ts",
    "grid.ts",
    "invitations.ts",
    "index.ts",
  ].map((name) => ({ name, text: readFileSync(join(process.cwd(), "src", "coverage", name), "utf8") }));

  it.each(sources)("$name imports no sibling domain module", ({ name, text }) => {
    for (const forbidden of ["../economy", "../policy", "../topology", "../observed", "../save"]) {
      expect(text, name).not.toContain(`from "${forbidden}`);
    }
  });

  it.each(sources)("$name stays free of clock/locale/random/compare-time errors", ({ name, text }) => {
    for (const forbidden of ["Math.random", "new Date", "Date.now", "Intl.", "localeCompare", "toLocaleString"]) {
      expect(text, name).not.toContain(forbidden);
    }
  });
});
