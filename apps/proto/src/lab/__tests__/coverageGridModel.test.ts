/**
 * Coverage-grid model pins. Pure layer only: the corpus is the fixture
 * (read-only law), and the 108-cell ladder, roster toggles, invitation
 * gating, and the dark-row invite flags are the contract the panel renders.
 */
import { describe, expect, it } from "vitest";
import {
  DEFENSE_ROLE_IDS,
  THREAT_ROLES,
  buildPalette,
  cellTip,
  coverageProfileFor,
  ladderStyle,
  rosterView,
  slugThreatRole,
  strengthRatio,
} from "../coverageGridModel";

const palette = buildPalette();

describe("palette — shared-web roster parsed from the shipped corpus", () => {
  it("15 defense tiles + 3 practice openers", () => {
    const defense = palette.items.filter((i) => i.kind === "defense");
    const practices = palette.items.filter((i) => i.kind === "practice");
    expect(defense).toHaveLength(15);
    expect(practices.map((p) => p.id).sort()).toEqual([
      "homogeneous-cpanel-image",
      "public-whois-listing",
      "unmetered-wordpress-default",
    ]);
  });

  it("exactly the three known untagged buildables fill no column (content census)", () => {
    const untagged = palette.items
      .filter((i) => i.kind === "defense" && i.defenseRoles.length === 0)
      .map((i) => i.id)
      .sort();
    expect(untagged).toEqual(["per-account-cgroup-caging", "slow-query-log-accounting", "upsell-desk-to-vps"]);
  });

  it("waf-virtual-patching is credited Contain by the registry counters", () => {
    const waf = palette.items.find((i) => i.id === "waf-virtual-patching");
    expect(waf?.defenseRoles).toContain("contain");
  });

  it("the census covers all 16 registry threats with vocabulary roles", () => {
    expect(palette.allThreatIds).toHaveLength(16);
    expect(palette.threatCensus.get("scanner-drizzle")).toEqual(["stealth"]);
    for (const roles of palette.threatCensus.values()) {
      for (const role of roles) expect(THREAT_ROLES).toContain(role);
    }
  });

  it("role slug law: 'Bypass/Flyer' → bypass, junk throws", () => {
    expect(slugThreatRole("Bypass/Flyer")).toBe("bypass");
    expect(slugThreatRole("Healer/Spawner")).toBe("healer");
    expect(() => slugThreatRole("Wizard")).toThrow(/THREAT_ROLES/);
  });
});

describe("grid — 108 cells, the ladder, roster toggles", () => {
  it("an un-built world is 108 dark cells", () => {
    const view = rosterView(palette, []);
    expect(view.grid.cells.size).toBe(108);
    expect(view.grid.summary.darkCount).toBe(108);
    expect(view.grid.summary.okCount + view.grid.summary.thinCount + view.grid.summary.strongCount).toBe(0);
    expect(view.grid.summary.bestCoverage).toBe(0n);
  });

  it("toggling one Contain buildable paints its column ok (uncalibrated 0.5)", () => {
    const before = rosterView(palette, []);
    const after = rosterView(palette, ["waf-virtual-patching"]);
    expect(after.grid.summary.darkCount).toBeLessThan(before.grid.summary.darkCount);
    for (const role of THREAT_ROLES) {
      const cell = after.grid.cells.get(`${role}|contain`);
      expect(cell?.contributors).toContain("waf-virtual-patching");
      expect(cell?.state).toBe("ok");
    }
    // a column nobody declares stays dark
    expect(after.grid.cells.get(`${THREAT_ROLES[0] as string}|absorb`)?.state).toBe("dark");
  });

  it("untagged selections never enter the profile (EMPTY_ROLES law)", () => {
    const profile = coverageProfileFor(palette, ["per-account-cgroup-caging", "fail2ban"]);
    expect(profile.has("per-account-cgroup-caging")).toBe(false);
    expect(profile.has("fail2ban")).toBe(true);
  });

  it("builds are deterministic: same roster twice, identical darkRows", () => {
    const roster = ["fail2ban", "attack-surface-scanner"];
    const a = rosterView(palette, roster);
    const b = rosterView(palette, roster);
    expect(JSON.stringify(a.darkRows)).toBe(JSON.stringify(b.darkRows));
    expect(JSON.stringify([...a.grid.summary.holePairs])).toBe(JSON.stringify([...b.grid.summary.holePairs]));
  });
});

describe("invitations — practices open the spawnable pool, the report says so", () => {
  it("five gated threats stay unspawnable until their practice is built", () => {
    const view = rosterView(palette, []);
    expect(view.spawnable).toHaveLength(11);
    expect(view.spawnable).not.toContain("scanner-drizzle");
    expect(view.recentInvites).toEqual([]);
  });

  it("building public-whois-listing invites scanner-drizzle and flags it on its dark row", () => {
    const view = rosterView(palette, ["public-whois-listing"]);
    expect(view.spawnable).toContain("scanner-drizzle");
    expect(view.recentInvites).toEqual(["scanner-drizzle"]);
    const stealthRow = view.darkRows.find((row) => row.threatRole === "stealth");
    expect(stealthRow).toBeDefined();
    expect(stealthRow?.sampleThreatIds).toContain("scanner-drizzle");
    expect(stealthRow?.invitedThreatIds).toContain("scanner-drizzle");
  });

  it("cPanel practice double-invites", () => {
    const view = rosterView(palette, ["homogeneous-cpanel-image"]);
    expect(view.recentInvites).toEqual(["vulnerable-plugin-compromise", "wp-login-brute-squad"]);
    for (const invite of view.recentInvites) {
      expect(view.spawnable).toContain(invite); // invites ⊆ spawnable (report law)
    }
  });

  it("secondAnswerGaps speaks on the empty world (every row single-answer at best)", () => {
    expect(rosterView(palette, []).gaps).toEqual([...THREAT_ROLES]);
  });
});

describe("ladder → chrome vocabulary", () => {
  it("the documented status mapping is pinned", () => {
    expect(ladderStyle("dark").status).toBe("DOWN");
    expect(ladderStyle("thin").status).toBe("AT RISK");
    expect(ladderStyle("ok").status).toBe("DEGRADED");
    expect(ladderStyle("strong").status).toBe("HEALTHY");
    expect(ladderStyle("dark").hole).toBe(true);
    expect(ladderStyle("dark").hueVar).toBeNull();
    expect(ladderStyle("thin").hueVar).toBe("var(--hh-hue-amber)");
    expect(ladderStyle("ok").wash).toBeLessThan(1);
  });

  it("strength ratio + tip render plain display values", () => {
    expect(strengthRatio(32768n)).toBeCloseTo(0.5, 10);
    const view = rosterView(palette, ["status-page"]);
    const cell = view.grid.cells.get(`swarm|negotiate`);
    expect(cell).toBeDefined();
    if (cell !== undefined) {
      const tip = cellTip(cell);
      expect(tip.strengthPct).toBe("50%");
      expect(tip.contributors).toContain("status-page");
    }
    expect(DEFENSE_ROLE_IDS).toHaveLength(9);
  });
});
