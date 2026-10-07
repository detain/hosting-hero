/** Defense-role vocabulary pins — the §2.1 table is LAW; this test fails
 *  the day someone edits the taxonomy without editing the design bible. */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DEFENSE_ROLES, DEFENSE_ROLE_IDS, isDefenseRoleId } from "../defenseRoles.js";

describe("DEFENSE_ROLES — nine roles, §2.1 table order", () => {
  it("holds exactly nine roles with the ratified slugs in table order", () => {
    expect(DEFENSE_ROLE_IDS).toEqual([
      "absorb",
      "classify",
      "meter",
      "contain",
      "detect",
      "recover",
      "deter",
      "divert",
      "negotiate",
    ]);
  });

  it("every role carries a label, an actsOn line, and examples", () => {
    for (const role of DEFENSE_ROLES) {
      expect(role.label.length).toBeGreaterThan(0);
      expect(role.actsOn.length).toBeGreaterThan(0);
      expect(role.examples.length).toBeGreaterThan(0);
    }
  });

  it("is deep-frozen (§2.1 vocabulary is not runtime data)", () => {
    expect(Object.isFrozen(DEFENSE_ROLES)).toBe(true);
    for (const role of DEFENSE_ROLES) {
      expect(Object.isFrozen(role)).toBe(true);
      expect(Object.isFrozen(role.examples)).toBe(true);
    }
  });

  it("matches the registry-core.json defenseRolesVocabulary (display labels)", () => {
    const raw = JSON.parse(
      readFileSync(join(process.cwd(), "..", "content", "threats", "registry-core.json"), "utf8"),
    ) as { defenseRolesVocabulary: string[] };
    expect(DEFENSE_ROLES.map((r) => r.label)).toEqual(raw.defenseRolesVocabulary);
  });

  it("isDefenseRoleId accepts only the nine slugs", () => {
    expect(isDefenseRoleId("negotiate")).toBe(true);
    expect(isDefenseRoleId("Negotiate")).toBe(false);
    expect(isDefenseRoleId("wall")).toBe(false);
    expect(isDefenseRoleId("")).toBe(false);
  });

  it("grid size law: 12 × 9 = 108 cells exactly", async () => {
    const { COVERAGE_CELL_COUNT } = await import("../matrix.js");
    expect(COVERAGE_CELL_COUNT).toBe(108);
  });
});
