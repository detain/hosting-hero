/**
 * familyWeights table parser (audit fix 3, heading 11385). The bundles now
 * carry REAL numbers (Sheet-B canon, OD-2 ratified); this parser is the
 * boundary that turns either authoring shape (bundle JSON numbers, loader
 * Fixed bigints) into the exact-1e6 micro-share table the arrival familyMix
 * consumes. Fail-loud on everything else — a null in a five-key table is a
 * lie the dice must not smooth over.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseFamilyWeightsTable, THREAT_FAMILIES } from "../families.js";
import { fromRatio } from "../../kernel/fixed.js";

const SHELL: Record<string, unknown> = {
  malicious: 0.35,
  human: 0.2,
  entropic: 0.05,
  systemic: 0.2,
  customerAsThreat: 0.2,
};

describe("parseFamilyWeightsTable — the boundary into the dice", () => {
  it("numbers domain: sums to exactly 1_000_000, code-unit sorted", () => {
    const shares = parseFamilyWeightsTable(SHELL);
    expect(shares.map((s) => s.family)).toStrictEqual([...THREAT_FAMILIES]);
    expect(shares.reduce((a, s) => a + s.shareMicro, 0)).toBe(1_000_000);
    expect(shares.find((s) => s.family === "malicious")!.shareMicro).toBe(350_000);
    expect(shares.find((s) => s.family === "customerAsThreat")!.shareMicro).toBe(200_000);
  });

  it("Fixed (loader) domain agrees with the JSON-number domain", () => {
    const fixed: Record<string, unknown> = {
      malicious: fromRatio(35n, 100n),
      human: fromRatio(2n, 10n),
      entropic: fromRatio(5n, 100n),
      systemic: fromRatio(2n, 10n),
      customerAsThreat: fromRatio(2n, 10n),
    };
    const a = parseFamilyWeightsTable(fixed);
    const b = parseFamilyWeightsTable(SHELL);
    expect(a.map((x) => x.family)).toStrictEqual(b.map((x) => x.family));
    // Q16.16 quantization is ~15.26 micro per tick of Fixed — the two
    // authoring domains must agree WITHIN one Fixed step per family.
    for (let i = 0; i < a.length; i += 1) {
      expect(Math.abs(a[i]!.shareMicro - b[i]!.shareMicro)).toBeLessThanOrEqual(16);
    }
    expect(a.reduce((x, s2) => x + s2.shareMicro, 0)).toBe(1_000_000);
  });

  it("_todo is metadata, not a family key", () => {
    expect(() => parseFamilyWeightsTable({ ...SHELL, _todo: "x" })).not.toThrow();
  });

  it("largest-remainder ties bump in code-unit order (deterministic renorm)", () => {
    const thirds = parseFamilyWeightsTable({
      malicious: 1 / 3,
      human: 1 / 3,
      entropic: 1 / 3,
      systemic: 0,
      customerAsThreat: 0,
    });
    expect(thirds.reduce((a, s) => a + s.shareMicro, 0)).toBe(1_000_000);
    // three equal thirds leave one micro unassigned; the code-unit-first
    // family among the tied remainders earns it (entropic < human < malicious)
    const byId = Object.fromEntries(thirds.map((s) => [s.family, s.shareMicro]));
    expect(byId.entropic).toBe(333_334);
    expect(byId.human).toBe(333_333);
    expect(byId.malicious).toBe(333_333);
  });

  it("fail-loud: null weight, unknown key, off-sum table, all-zero table", () => {
    expect(() => parseFamilyWeightsTable({ ...SHELL, entropic: null })).toThrow(/unresolved/);
    expect(() => parseFamilyWeightsTable({ ...SHELL, ddos: 0.1 })).toThrow(/unknown family/);
    expect(() => parseFamilyWeightsTable({ ...SHELL, systemic: 0.9 })).toThrow(/>1% off/);
    expect(() =>
      parseFamilyWeightsTable({ malicious: 0, human: 0, entropic: 0, systemic: 0, customerAsThreat: 0 }),
    ).toThrow(/every weight is zero/);
    expect(() => parseFamilyWeightsTable({ ...SHELL, human: -1 })).toThrow(/finite number/);
    expect(() => parseFamilyWeightsTable({ ...SHELL, human: -5n })).toThrow(/non-negative/);
  });

  it("SHIPPED BUNDLES: both g1 type bundles parse to live tables (regression vs the null era)", () => {
    for (const file of ["shared-web.json", "game-servers.json"]) {
      const path = join(process.cwd(), "..", "content", "types", file);
      const doc = JSON.parse(readFileSync(path, "utf8")) as { threats: { familyWeights: Record<string, unknown> } };
      const shares = parseFamilyWeightsTable(doc.threats.familyWeights, `content/types/${file}`);
      expect(shares.reduce((a, s) => a + s.shareMicro, 0)).toBe(1_000_000);
      expect(shares.every((s) => s.shareMicro > 0)).toBe(true);
    }
  });
});
