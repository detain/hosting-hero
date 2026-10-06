/**
 * _todo placeholder reporting — warn, never throw; entries carry field,
 * nearest cite, criticality; README-declared exemptions classify "exempt".
 */

import { describe, expect, test } from "vitest";
import { loadTypeBundle } from "../bundle";
import { collectTodos } from "../todo";
import { cloneJson, fixtureRaw, readFixture } from "./helpers";

describe("collectTodos", () => {
  const raw = fixtureRaw("minimal-alpha.json");
  const report = collectTodos(raw, "minimal-alpha.json");

  test("gathers every null placeholder with its dotted path", () => {
    const fields = report.entries.map((entry) => entry.field);
    expect(fields).toContain("visitor.stats.loyalty");
    expect(fields).toContain("threats.familyWeights.human");
    expect(fields).toContain("visitor.party.size");
    expect(fields).toContain("visitor.herding.coefficient");
  });

  test("each entry carries the nearest enclosing _todo cite", () => {
    const loyalty = report.entries.find((e) => e.field === "visitor.stats.loyalty");
    expect(loyalty?.cite).toContain("§3.2");
    const human = report.entries.find((e) => e.field === "threats.familyWeights.human");
    expect(human?.cite).toContain("§2.24");
  });

  test("criticality: physics numerics critical, README exemptions exempt", () => {
    const byField = new Map(report.entries.map((e) => [e.field, e.criticality]));
    expect(byField.get("visitor.stats.loyalty")).toBe("critical");
    expect(byField.get("threats.familyWeights.human")).toBe("critical");
    // party.size null while allOrNothing=false + coefficient null while herding off
    expect(byField.get("visitor.party.size")).toBe("exempt");
    expect(byField.get("visitor.herding.coefficient")).toBe("exempt");
    expect(byField.get("visitor.patienceModel.params.budgetMs")).toBeUndefined(); // authored, not a todo
  });

  test("counts roll up per criticality", () => {
    const total = Object.values(report.counts).reduce((a, b) => a + b, 0);
    expect(total).toBe(report.entries.length);
    expect(report.counts.exempt).toBe(2);
    expect(report.counts.critical).toBe(5); // loyalty + 4 family weights
  });

  test("collection never throws and loading still succeeds (warn, not gate)", () => {
    expect(() => loadTypeBundle(raw)).not.toThrow();
    expect(() => collectTodos("a bare string", "weird")).not.toThrow();
    expect(collectTodos(null, "weird").entries).toEqual([]);
  });

  test("nulls without any cite are reported with cite null (content-CI debt)", () => {
    const mutated = cloneJson(raw);
    delete mutated["_todo"]; // no cite anywhere up the tree either
    const economy = mutated.economy as Record<string, unknown>;
    economy["ticketsPerCustomer"] = null; // no _todo added under economy
    const uncited = collectTodos(mutated, "mutant").entries.find(
      (e) => e.field === "economy.ticketsPerCustomer",
    );
    expect(uncited?.cite).toBeNull();
    expect(uncited?.criticality).toBe("critical");
  });

  test("cosmetic leg: skin nulls classify cosmetic", () => {
    const mutated = cloneJson(raw);
    const skin = mutated.skin as Record<string, unknown>;
    skin["homeAltitude"] = null;
    const entry = collectTodos(mutated, "mutant").entries.find((e) => e.field === "skin.homeAltitude");
    expect(entry?.criticality).toBe("cosmetic");
  });

  test("fixture wave docs carry no nulls to fake-collect, registries index cleanly", () => {
    expect(collectTodos(readFixture("waves-alpha.json"), "waves-alpha.json").entries).toEqual([]);
  });
});
