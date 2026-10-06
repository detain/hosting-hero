/** Content-CI gate: each authoring law must fire EXACTLY its named code on a
 *  crafted bad table, and stay silent on the clean one. */
import { describe, expect, it } from "vitest";
import { enforceWaveTable } from "../enforcer.js";
import type { ViolationCode } from "../enforcer.js";
import type { WaveTable } from "../table.js";
import { cleanTable, entry, mutableClone } from "./fixtures.js";
import type { DeepMutable } from "./fixtures.js";

function codes(table: WaveTable): ViolationCode[] {
  return enforceWaveTable(table).map((v) => v.code);
}
function clone(): DeepMutable<WaveTable> {
  return mutableClone(cleanTable());
}
function has(table: WaveTable, code: ViolationCode): boolean {
  return codes(table).includes(code);
}

describe("clean table", () => {
  it("passes every law", () => {
    expect(enforceWaveTable(cleanTable())).toEqual([]);
  });
});

describe("crafted violations", () => {
  it("MAX_THREAT_ENTRIES_EXCEEDED at 5 entries", () => {
    const t = clone();
    t.waves[1]!.entries = ["a", "b", "c", "d", "e"].map((id, i) =>
      entry({ threatId: id, role: (["tank", "siege", "sapper", "stealth", "swarm"] as const)[i]!, family: "malicious", band: "storm", sharePct: 20, denominations: i < 2 ? ["concurrency"] : ["cash"] }),
    );
    t.waves[1]!.parPct = 100;
    expect(has(t, "MAX_THREAT_ENTRIES_EXCEEDED")).toBe(true);
  });

  it("FIRST_WAVE_OVER_40PCT_PAR at 41%", () => {
    const t = clone();
    t.waves[0]!.parPct = 41;
    expect(has(t, "FIRST_WAVE_OVER_40PCT_PAR")).toBe(true);
    t.waves[0]!.parPct = 40;
    expect(has(t, "FIRST_WAVE_OVER_40PCT_PAR")).toBe(false);
  });

  it("TROUGH_NOT_DEEP_ENOUGH: shallow 30% dip flags, honest 50% dip passes", () => {
    const t = clone();
    t.waves.length = 3;
    t.waves[2]!.parPct = 70; // peak was 100 → only 30% below
    expect(has(t, "TROUGH_NOT_DEEP_ENOUGH")).toBe(true);
    t.waves[2]!.parPct = 55; // 45% below → exactly enough
    expect(has(t, "TROUGH_NOT_DEEP_ENOUGH")).toBe(false);
  });

  it("ROLE_QUOTA_EXCEEDED: three roles above 30%", () => {
    const t = clone();
    t.waves[1]!.entries = [
      entry({ threatId: "r1", role: "tank", family: "malicious", band: "storm", sharePct: 34, denominations: ["concurrency", "cash"] }),
      entry({ threatId: "r2", role: "siege", family: "systemic", band: "entropy", sharePct: 33, denominations: ["concurrency", "cash"] }),
      entry({ threatId: "r3", role: "sapper", family: "entropic", band: "storm", sharePct: 33, denominations: ["concurrency", "cash"] }),
    ];
    expect(has(t, "ROLE_QUOTA_EXCEEDED")).toBe(true);
  });

  it("MISSING_NEW_ROLE_EVERY_4TH: wave 4 recycles roles 1–3", () => {
    const t = clone();
    t.waves[3]!.entries = [
      entry({ threatId: "sapper-comeback", role: "sapper", family: "entropic", band: "storm", sharePct: 55, denominations: ["bandwidth"] }),
      entry({ threatId: "swarm-again", role: "swarm", family: "human", band: "weather", sharePct: 45, denominations: ["bandwidth"] }),
    ];
    expect(has(t, "MISSING_NEW_ROLE_EVERY_4TH")).toBe(true);
    // clean table introduces "mimic" there and passes:
    expect(has(clone(), "MISSING_NEW_ROLE_EVERY_4TH")).toBe(false);
  });

  it("TWO_FRONT_DENOMINATIONS_EXCEEDED: three denominations in one wave", () => {
    const t = clone();
    t.waves[1]!.entries = [
      entry({ threatId: "d1", role: "tank", family: "malicious", band: "storm", sharePct: 40, denominations: ["concurrency"] }),
      entry({ threatId: "d2", role: "siege", family: "systemic", band: "storm", sharePct: 30, denominations: ["cash"] }),
      entry({ threatId: "d3", role: "sapper", family: "entropic", band: "entropy", sharePct: 30, denominations: ["hands"] }),
    ];
    expect(has(t, "TWO_FRONT_DENOMINATIONS_EXCEEDED")).toBe(true);
  });

  it("HARD_WAVE_SINGLE_FRONT: hard wave collapsed to one denomination", () => {
    const t = clone();
    (t.waves[1]!.entries[1] as { denominations: readonly string[] }).denominations = ["concurrency"];
    expect(has(t, "HARD_WAVE_SINGLE_FRONT")).toBe(true);
    expect(has(t, "TWO_FRONT_DENOMINATIONS_EXCEEDED")).toBe(false);
  });

  it("DENOMINATION_QUOTA_PER_LEVEL_EXCEEDED: 5 distinct threats share a denomination across the level", () => {
    const t = clone();
    // bandwidth already carries trial-swarm, layer7-mimic, bot-farm (3).
    // Pull two more onto it → 5 > 4, while every wave keeps ≤2 denominations.
    (t.waves[1]!.entries[0] as { denominations: readonly string[] }).denominations = ["bandwidth", "cash"];
    (t.waves[2]!.entries[0] as { denominations: readonly string[] }).denominations = ["bandwidth", "hands"];
    expect(has(t, "DENOMINATION_QUOTA_PER_LEVEL_EXCEEDED")).toBe(true);
    const flags = enforceWaveTable(t).filter((v) => v.code === "DENOMINATION_QUOTA_PER_LEVEL_EXCEEDED");
    expect(flags[0]!.detail).toContain("bandwidth");
  });

  it("violations sort by (waveN, code)", () => {
    const t = clone();
    t.waves[0]!.parPct = 99; // first-wave flag (n=1)
    t.waves[0]!.entries.push(entry({ threatId: "extra", role: "boss", family: "malicious", band: "storm", sharePct: 1, denominations: ["concurrency"] }));
    t.waves[0]!.entries[0]!.sharePct = 59; // keep sum 100: 60+40 → 59+1+40
    const vs = enforceWaveTable(t);
    for (let i = 1; i < vs.length; i += 1) {
      const a = vs[i - 1]!;
      const b = vs[i]!;
      expect(a.waveN < b.waveN || (a.waveN === b.waveN && a.code <= b.code)).toBe(true);
    }
  });
});
