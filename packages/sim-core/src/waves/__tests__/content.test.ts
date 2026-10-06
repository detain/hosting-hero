/** Read-only validation of packages/content/waves/*.json (NOT our schema —
 *  cross-check against the ratified laws and REPORT, never edit). */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { inspectOfficialWaveJson } from "../contentInspector.js";

describe("inspectOfficialWaveJson — crafted fixtures", () => {
  it("flags >4 entries and >2 denominations", () => {
    const raw = {
      waves: [
        {
          n: 1,
          parPct: 10,
          hard: true,
          entries: [{ threat: "a" }, { threat: "b" }, { threat: "c" }, { threat: "d" }, { threat: "e" }],
          denominations: ["bandwidth", "cash", "hands"],
        },
      ],
    };
    const codes = inspectOfficialWaveJson(raw).map((f) => f.code);
    expect(codes).toContain("MAX_THREAT_ENTRIES_EXCEEDED");
    expect(codes).toContain("TWO_FRONT_DENOMINATIONS_EXCEEDED");
    expect(codes).toContain("CONTENT_ROLES_UNDECLARED");
  });
  it("flags hard wave with one denomination", () => {
    const raw = {
      waves: [{ n: 1, parPct: 10, hard: true, entries: [{ threat: "a", role: "swarm" }], denominations: ["cash"] }],
    };
    expect(inspectOfficialWaveJson(raw).map((f) => f.code)).toContain("HARD_WAVE_SINGLE_FRONT");
  });
  it("flags first wave over 40% par", () => {
    const raw = {
      waves: [{ n: 1, parPct: 55, hard: false, entries: [{ threat: "a", role: "swarm" }], denominations: ["cash"] }],
    };
    expect(inspectOfficialWaveJson(raw).map((f) => f.code)).toContain("FIRST_WAVE_OVER_40PCT_PAR");
  });
  it("reports malformed documents instead of throwing", () => {
    expect(inspectOfficialWaveJson("junk").map((f) => f.code)).toContain("CONTENT_MALFORMED");
    expect(inspectOfficialWaveJson({ waves: "nope" }).map((f) => f.code)).toContain("CONTENT_MALFORMED");
  });
});

describe("official content file(s) — read-only report", () => {
  const dir = join(process.cwd(), "..", "content", "waves");
  const names = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".json")).sort() : [];

  it("the directory exists and contains at least one wave file", () => {
    expect(names.length).toBeGreaterThan(0);
  });

  for (const name of names) {
    // T-upgrade: the g1 slices were remediated to fully clean authoring
    // (2026-10-06 content-agent pass: roles declared in the registry, the
    // three-denomination wave re-split). The pin is now EXACTLY zero
    // findings — any new inspector code or re-emerging violation trips CI.
    // (The known-codes allow-list survives implicitly: zero findings can
    // only shrink, so VIOLATION_CODES may never silently grow un-noticed.)
    it(`${name} inspects with EXACTLY zero findings`, () => {
      const parsed: unknown = JSON.parse(readFileSync(join(dir, name), "utf8"));
      const findings = inspectOfficialWaveJson(parsed);
      expect(findings).toEqual([]);
    });

    it(`${name} declares unique threats per wave (W1 identity mirror on foreign content)`, () => {
      const parsed = JSON.parse(readFileSync(join(dir, name), "utf8")) as {
        waves?: { entries?: { threat?: string; threatId?: string }[] }[];
      };
      for (const wave of parsed.waves ?? []) {
        const ids = (wave.entries ?? []).map((e) => e.threat ?? e.threatId ?? "");
        expect(new Set(ids).size).toBe(ids.length); // dup ids → existence clobber + ordinal collisions
      }
    });
  }
});
