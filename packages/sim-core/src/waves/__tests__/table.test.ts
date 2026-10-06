/** parseWaveTable = structural boundary only; authoring laws live in the
 *  enforcer, so a law-breaking-but-well-formed table must PARSE fine. */
import { describe, expect, it } from "vitest";
import { parseWaveTable } from "../table.js";
import { cleanTable } from "./fixtures.js";

function mutate(fn: (t: Record<string, unknown>) => void): unknown {
  const clone = structuredClone(cleanTable());
  fn(clone as unknown as Record<string, unknown>);
  return clone;
}

describe("parseWaveTable", () => {
  it("accepts the crafted clean table", () => {
    expect(parseWaveTable(structuredClone(cleanTable()))).toEqual(cleanTable());
  });
  it("rejects an empty waves array", () => {
    expect(() => parseWaveTable(mutate((t) => { (t.waves as unknown[]).length = 0; }))).toThrow(/non-empty array/);
  });
  it("rejects non-sequential wave numbers", () => {
    expect(() =>
      parseWaveTable(mutate((t) => { ((t.waves as Record<string, unknown>[])[1] as { n: number }).n = 7; })),
    ).toThrow(/sequential/);
  });
  it("rejects shares that don't sum to 100", () => {
    expect(() =>
      parseWaveTable(
        mutate((t) => {
          const entries = (t.waves as Record<string, unknown>[])[0]!.entries as { sharePct: number }[];
          entries[0]!.sharePct = 90;
        }),
      ),
    ).toThrow(/sum to 100/);
  });
  it("rejects an envelope longer than its window", () => {
    expect(() =>
      parseWaveTable(
        mutate((t) => {
          const w = (t.waves as Record<string, unknown>[])[0]!;
          w.windowMinutes = 8;
        }),
      ),
    ).toThrow(/exceeds window/);
  });
  it("rejects a closed-set violation (role, band, family, denomination)", () => {
    const bad = (field: string, value: unknown) =>
      mutate((t) => {
        const e = (t.waves as Record<string, unknown>[])[0]!.entries as Record<string, unknown>[];
        e[0]![field] = value;
      });
    expect(() => parseWaveTable(bad("role", "god-slaying"))).toThrow(/unknown role/);
    expect(() => parseWaveTable(bad("band", "thunder"))).toThrow(/weather\|storm\|hunter\|entropy/);
    expect(() => parseWaveTable(bad("family", "alien"))).toThrow(/unknown family/);
    expect(() => parseWaveTable(bad("denominations", ["feelings"]))).toThrow(/unknown denomination/);
  });
  it("rejects an empty target pool", () => {
    expect(() =>
      parseWaveTable(
        mutate((t) => {
          const e = (t.waves as Record<string, unknown>[])[0]!.entries as Record<string, unknown>[];
          e[0]!.targets = [];
        }),
      ),
    ).toThrow(/targets pool/);
  });
  it("W1: rejects a duplicate threatId within one wave (existence + ordinal identity law)", () => {
    const dup = mutate((t) => {
      const entries = (t.waves as Record<string, unknown>[])[0]!.entries as { threatId: string }[];
      entries[1]!.threatId = entries[0]!.threatId;
    });
    expect(() => parseWaveTable(dup)).toThrow(/duplicate threatId "scanner-drizzle" within one wave/);
  });
  it("W1: the same threatId in DIFFERENT waves stays legal (uniqueness is per wave)", () => {
    const reuse = mutate((t) => {
      const w2 = (t.waves as Record<string, unknown>[])[1]!.entries as { threatId: string }[];
      w2[0]!.threatId = "scanner-drizzle"; // already used in wave 1
    });
    expect(() => parseWaveTable(reuse)).not.toThrow();
  });
  it("rejects fractional integers", () => {
    expect(() =>
      parseWaveTable(
        mutate((t) => {
          (t.waves as Record<string, unknown>[])[0]!.parPct = 12.5;
        }),
      ),
    ).toThrow(/integer/);
  });
  it("PARSES (does not throw) a law-breaking table — that's the enforcer's job", () => {
    const fiveEntries = mutate((t) => {
      const w = (t.waves as Record<string, unknown>[])[0]!;
      w.entries = ["a", "b", "c", "d", "e"].map((id) => ({
        threatId: id,
        role: id === "a" ? "stealth" : id === "b" ? "tank" : id === "c" ? "sapper" : "swarm",
        family: "human",
        band: "weather",
        sharePct: 20,
        denominations: ["bandwidth"],
        targets: ["t"],
      }));
    });
    expect(() => parseWaveTable(fiveEntries)).not.toThrow();
  });
});
