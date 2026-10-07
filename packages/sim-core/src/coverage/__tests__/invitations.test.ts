/** darkCellReport — the teaching payload, over the REAL registry corpus
 *  (packages/content/threats/registry-core.json, read-only) + crafted data. */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fromRatio } from "../../kernel/fixed.js";
import { THREAT_ROLES } from "../../waves/table.js";
import type { ThreatRole } from "../../waves/table.ts";
import { darkCellReport } from "../invitations.js";
import type { ThreatRoleCensus } from "../invitations.js";
import { CoverageError } from "../matrix.js";
import type { CoverageProfile } from "../matrix.js";

/* Registry labels are display-case with two slugs (§2.13 alias fold, same
 * normalization versus/deck.ts applies to the same file). */
const ROLE_ALIASES: ReadonlyMap<string, string> = new Map([
  ["Healer/Spawner", "healer"],
  ["Bypass/Flyer", "bypass"],
]);

function foldRole(value: string): ThreatRole {
  const slug = ROLE_ALIASES.get(value) ?? value.toLowerCase();
  if (!(THREAT_ROLES as readonly string[]).includes(slug)) {
    throw new Error(`test adapter: role "${value}" does not normalize into THREAT_ROLES`);
  }
  return slug as ThreatRole;
}

interface RegistryThreat {
  readonly id: string;
  readonly roles: readonly string[];
}

const registry = JSON.parse(
  readFileSync(join(process.cwd(), "..", "content", "threats", "registry-core.json"), "utf8"),
) as { threats: RegistryThreat[] };

const census: ThreatRoleCensus = new Map(
  registry.threats.map((t) => [t.id, Object.freeze(t.roles.map(foldRole))]),
);
const ALL_THREAT_IDS = registry.threats.map((t) => t.id);

describe("darkCellReport — real registry corpus (16 threats)", () => {
  it("the corpus has sixteen threats spanning all twelve roles", () => {
    expect(registry.threats.length).toBe(16);
    const roles = new Set<ThreatRole>([...census.values()].flat());
    expect(roles.size).toBe(12);
  });

  it("empty board: every role with a spawnable threat is a dark row", () => {
    const rows = darkCellReport(new Map(), ALL_THREAT_IDS, census);
    expect(rows.length).toBe(12);
    for (const row of rows) {
      expect(row.state).toBe("dark");
      expect(row.weakestDefenses.length).toBe(9); // nothing filled yet
      expect(row.sampleThreatIds.length).toBeGreaterThan(0);
      expect(row.invitedThreatIds).toEqual([]);
    }
    // Every threat appears under EVERY role it plays (multi-role teaching).
    const sightings = new Map<string, number>();
    for (const row of rows) for (const id of row.sampleThreatIds) sightings.set(id, (sightings.get(id) ?? 0) + 1);
    for (const threat of registry.threats) {
      expect(sightings.get(threat.id)).toBe(threat.roles.length);
    }
    // Rows sorted code-unit by role.
    expect(rows.map((r) => r.threatRole)).toEqual([...rows.map((r) => r.threatRole)].sort());
  });

  it("one generic buildable per column fills the holes → report empties", () => {
    const profile: CoverageProfile = new Map([["classify-gear", { roles: ["classify"] as const }]]);
    // A single classify column lifts EVERY row's best cell to "ok" — the
    // report is about exposure, the grid still shows the other 8 dark columns.
    expect(darkCellReport(profile, ALL_THREAT_IDS, census)).toEqual([]);
  });

  it("a thin calibration keeps the row alive and pins weakest-first order", () => {
    const profile: CoverageProfile = new Map([
      ["tuned-waf", { roles: ["classify"] as const, strengths: { swarm: fromRatio(1n, 5n) } }],
    ]);
    const rows = darkCellReport(profile, ["wp-login-brute-squad", "ticket-avalanche-hydra"], census);
    const swarm = rows.find((r) => r.threatRole === "swarm");
    expect(swarm).toBeDefined();
    expect(swarm?.state).toBe("thin"); // 0.2 best-in-row
    // Weakest-first: the eight zero-dark columns come BEFORE the 0.2 thin one,
    // ties among zeros ordered code-unit — classify (strength 0.2) is LAST.
    expect(swarm?.weakestDefenses[0]).toBe("absorb");
    expect(swarm?.weakestDefenses.at(-1)).toBe("classify");
    expect(swarm?.weakestDefenses.length).toBe(9);
  });

  it("fail loud: spawnable threat missing from the census", () => {
    expect(() => darkCellReport(new Map(), ["ghost-threat"], census)).toThrow(CoverageError);
    try {
      darkCellReport(new Map(), ["ghost-threat"], census);
    } catch (error) {
      expect((error as CoverageError).code).toBe("UNKNOWN_THREAT");
    }
  });

  it("fail loud: invite that is not spawnable (the P2 pipeline is broken)", () => {
    expect(() => darkCellReport(new Map(), ["layer7-mimic"], census, ["grudge-booter"])).toThrow(/recentInvite/);
  });

  it("fail loud: census role outside the twelve", () => {
    const bad: ThreatRoleCensus = new Map([["x", ["giant" as ThreatRole]]]);
    expect(() => darkCellReport(new Map(), ["x"], bad)).toThrow(/BAD_THREAT_ROLE|not one of the 12/);
  });
});

describe("darkCellReport — P2 law: fresh invites must appear", () => {
  const profile: CoverageProfile = new Map([["waf", { roles: ["classify"] as const }]]);

  it("newly-invited threats are flagged on their rows", () => {
    // Without the build that invites them the pool is bigger; here the
    // ledger already folded spawnable — we only mark which are NEW.
    const spawnable = ["layer7-mimic", "slowloris-sipper", "grudge-booter"];
    const rows = darkCellReport(new Map(), spawnable, census, ["layer7-mimic"]);
    const mimicRow = rows.find((r) => r.threatRole === "mimic");
    expect(mimicRow?.invitedThreatIds).toEqual(["layer7-mimic"]);
    const siegeRow = rows.find((r) => r.threatRole === "siege");
    expect(siegeRow?.invitedThreatIds).toEqual([]);
    // Every row still lists ALL its spawnable samples (nothing hidden).
    expect(mimicRow?.sampleThreatIds).toContain("layer7-mimic");
  });

  it("multi-role invite shows on BOTH rows (sapper+bypass threat)", () => {
    const rows = darkCellReport(new Map(), ["vulnerable-plugin-compromise"], census, ["vulnerable-plugin-compromise"]);
    const roles = rows.filter((r) => r.invitedThreatIds.includes("vulnerable-plugin-compromise")).map((r) => r.threatRole);
    expect(roles.sort()).toEqual(["bypass", "sapper"]);
  });

  it("covered roles produce no row even when invited", () => {
    const rows = darkCellReport(profile, ["layer7-mimic"], census, ["layer7-mimic"]);
    expect(rows).toEqual([]); // classify generic covers the mimic row at "ok"
  });
});
