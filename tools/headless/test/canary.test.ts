import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { maskCode, scanDirectory, scanSource, simCoreSrcDir } from "../src/canary.ts";
import type { CanaryRuleName } from "../src/canary.ts";

const FIXTURES = fileURLToPath(new URL("./fixtures/canary/", import.meta.url));

describe("maskCode (comments + strings neutralized, offsets preserved)", () => {
  it("blanks line comments, block comments and string/template bodies", () => {
    const src = `const a = 1; // Math.random()\n/* Date.now()\nnew Date */ const s = "Intl"; const t = \`performance.now\`;`;
    const masked = maskCode(src, { maskStrings: true });
    expect(masked).not.toContain("Math.random");
    expect(masked).not.toContain("Date.now");
    expect(masked).not.toContain("Intl");
    expect(masked).not.toContain("performance.now");
    expect(masked.length).toBe(src.length); // column-preserving
    expect(masked.split("\n").length).toBe(src.split("\n").length); // line-preserving
    expect(masked).toContain("const a = 1;");
  });

  it("keeps strings when masking only comments (advisory pass)", () => {
    const src = `import x from "node:fs"; // gone`;
    const masked = maskCode(src, { maskStrings: false });
    expect(masked).toContain("node:fs");
    expect(masked).not.toContain("gone");
  });
});

describe("forbidden-API canary catches every planted violation", () => {
  const report = scanDirectory(FIXTURES);
  const rulesFound = new Set(report.violations.map((v) => v.rule));

  const expected: readonly CanaryRuleName[] = [
    "forbidden:Math.random",
    "forbidden:Date.now",
    "forbidden:new Date",
    "forbidden:Intl",
    "forbidden:performance.now",
    "forbidden:float-literal",
  ];

  it.each(expected)("planted %s is reported", (rule) => {
    expect(rulesFound.has(rule)).toBe(true);
  });

  it("reports precise locations for the planted file", () => {
    const hits = report.violations.filter((v) => v.file === "violations.ts");
    const byRule = new Map<string, number[]>();
    for (const hit of hits) byRule.set(hit.rule, [...(byRule.get(hit.rule) ?? []), hit.line]);
    expect(byRule.get("forbidden:Math.random")).toEqual([9]);
    expect(byRule.get("forbidden:Date.now")).toEqual([14]);
    expect(byRule.get("forbidden:new Date")).toEqual([15]);
    expect(byRule.get("forbidden:performance.now")).toEqual([21]);
    expect(byRule.get("forbidden:Intl")).toEqual([26]);
    expect(byRule.get("forbidden:float-literal")).toEqual([31]);
  });

  it("does NOT flag the forbidden names inside comments or strings", () => {
    // violations.ts carries decoys: "Math.random()" in a comment, quoted
    // names, a template literal. Any over-matching would show extra lines.
    const extra = report.violations.filter(
      (v) => v.file === "violations.ts" && ![9, 14, 15, 21, 26, 31].includes(v.line),
    );
    expect(extra).toEqual([]);
  });

  it("flags Node-only usage as advisory, not violation", () => {
    const clean = scanSource(`import fs from "node:fs";\nconst p = process.platform;\nexport const x = 1;`, "adv.ts");
    expect(clean.violations).toEqual([]);
    const advisoryRules = new Set(clean.advisories.map((a) => a.rule));
    expect(advisoryRules.has("node-only:node-import")).toBe(true);
    expect(advisoryRules.has("node-only:process")).toBe(true);
  });

  it("clean fixture contributes zero violations", () => {
    const report2 = scanSource(
      `const MASK = 0xffffffffffffffffn;\nexport function f(i: number): bigint { return (BigInt(i) * 1099511628211n) & MASK; }`,
      "pure.ts",
    );
    expect(report2.violations).toEqual([]);
  });
});

describe("canary on the CURRENT sim-core tree (the standing verdict)", () => {
  it("passes: zero forbidden-API violations across all sim-core sources", () => {
    const report = scanDirectory(simCoreSrcDir());
    // If a sibling agent lands a violation, this list names file:line exactly.
    expect(report.violations.map((v) => `${v.file}:${String(v.line)} ${v.rule}`)).toEqual([]);
    expect(report.filesScanned).toBeGreaterThan(20);
  }, 60_000);
});
