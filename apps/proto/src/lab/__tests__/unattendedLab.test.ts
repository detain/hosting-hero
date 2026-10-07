/**
 * Unattended-lab model pins. Everything here is the pure layer: no Vue, no
 * jsdom. The weekend legs run REAL sim-core (guards armed ⇒ per-tick digest,
 * so ticks stay small); determinism, forced halts, and the deterministic
 * explanation strings are the contract the panel renders.
 */
import { describe, expect, it } from "vitest";
import {
  BOARD_PRESETS,
  bucketRows,
  buildDelta,
  buildRunConfig,
  defaultForm,
  defaultGuardRows,
  explainWeekend,
  explainWhatIf,
  guardRowFields,
  guardRowsToRecords,
  parseOpexRows,
  runWeekend,
  runWeekendWhatIf,
  shortDigest,
} from "../unattendedLab";
import type { OpexRowDraft, UnattendedLabForm } from "../unattendedLab";

function formWith(overrides: Partial<UnattendedLabForm>): UnattendedLabForm {
  return { ...defaultForm(), ...overrides };
}

/** All guards off except one kind at the given sustained floor. */
function onlyGuard(kind: string, sustainedMin: number) {
  return defaultGuardRows().map((row) => ({
    ...row,
    enabled: row.kind === kind,
    sustainedMin,
  }));
}

const NO_MONEY: Partial<UnattendedLabForm> = { openingDollars: 0, opexRows: [], withContract: false };

describe("buildRunConfig — named complaints at the boundary", () => {
  it("assembles the default form into a legal config", () => {
    const config = buildRunConfig(defaultForm());
    expect(String(config.ticks)).toBe("240");
    expect(config.board.nodes.length).toBeGreaterThan(0);
    expect(config.ruleBook).toStrictEqual([]);
    expect(config.money).toBeDefined();
    expect(config.guards.length).toBe(2); // freeCashDepleted + totalOutage armed
  });

  it("refuses out-of-cap ticks, negative seeds, and Q16.16-overflow rates", () => {
    expect(() => buildRunConfig(formWith({ ticks: 3000 }))).toThrow(/2880/);
    expect(() => buildRunConfig(formWith({ ticks: 0 }))).toThrow(/ticks/);
    expect(() => buildRunConfig(formWith({ seed: -1 }))).toThrow(/seed/);
    expect(() => buildRunConfig(formWith({ baselineRatePerMin: 40000 }))).toThrow(/Q16\.16/);
    expect(() => buildRunConfig(formWith({ checkpointEvery: 0 }))).toThrow(/checkpointEvery/);
  });

  it("omits money entirely when the player armed nothing financial", () => {
    const config = buildRunConfig(formWith({ ...NO_MONEY }));
    expect(config.money).toBeUndefined();
  });

  it("boardPresetById fails loud on an invented id", () => {
    expect(() => buildRunConfig(formWith({ boardPresetId: "moon-base" }))).toThrow(/moon-base/);
    expect(BOARD_PRESETS.map((p) => p.id)).toContain("tight-lane");
  });
});

describe("guard rows + opex parsing", () => {
  it("disabled rows never reach the record list; threshold carries its vocab", () => {
    const rows = defaultGuardRows().map((row) => ({ ...row, enabled: false }));
    const threshold = rows.find((row) => row.kind === "threshold");
    expect(threshold).toBeDefined();
    if (threshold !== undefined) {
      threshold.enabled = true;
      threshold.metric = "servedRate";
      threshold.comparator = "lt";
      threshold.value = 1;
    }
    const records = guardRowsToRecords(rows) as readonly Record<string, unknown>[];
    expect(records).toHaveLength(1);
    expect(records[0]?.["type"]).toBe("threshold");
    expect(records[0]?.["metric"]).toBe("servedRate");
  });

  it("guardRowFields exposes exactly the editable surface per kind", () => {
    expect(guardRowFields("freeCashDepleted")).toContain("sustainedMin");
    expect(guardRowFields("threshold")).toEqual(["metric", "comparator", "value", "sustainedMin"]);
    expect(guardRowFields("cascadeCollapse")).toContain("degradedPctGt");
  });

  it("parseOpexRows: $→µ$ exact once, memo auto-tags, junk refuses", () => {
    const rows: OpexRowDraft[] = [
      { atMinute: 0, dollars: 1.5, memo: "  " },
      { atMinute: 30, dollars: 0.25, memo: "custom-tag" },
    ];
    const parsed = parseOpexRows(rows);
    expect(parsed[0]?.amountMicroUsd).toBe(1_500_000n);
    expect(parsed[0]?.memo).toBe("opex-1");
    expect(parsed[1]?.memo).toBe("custom-tag");
    expect(() => parseOpexRows([{ atMinute: -1, dollars: 1, memo: "" }])).toThrow(/atMinute/);
    expect(() => parseOpexRows([{ atMinute: 0, dollars: 0, memo: "" }])).toThrow(/dollars/);
    expect(() => parseOpexRows([{ atMinute: 0, dollars: 0.0000004, memo: "" }])).toThrow(/micro-dollar/);
  });
});

describe("runWeekend legs — determinism, forced halts, honest errors", () => {
  it("the same form twice yields byte-identical digests (determinism honesty)", async () => {
    const form = formWith({ ticks: 24, checkpointEvery: 8, ...NO_MONEY, guardRows: onlyGuard("totalOutage", 5), boardPresetId: "tight-lane" });
    const a = await runWeekend(form);
    const b = await runWeekend(form);
    expect(a.stage).toBe("done");
    expect(b.stage).toBe("done");
    expect(a.report?.finalDigest).toBe(b.report?.finalDigest);
    expect(a.report?.perCheckpoint.length).toBe(b.report?.perCheckpoint.length);
    expect(explainWeekend(a.report as NonNullable<typeof a.report>)).toBe(
      explainWeekend(b.report as NonNullable<typeof b.report>),
    );
  });

  it("totalOutage HALTS a saturated lane under real demand (forced, deterministic)", async () => {
    const form = formWith({
      boardPresetId: "tight-lane",
      ticks: 24,
      checkpointEvery: 12,
      baselineRatePerMin: 40,
      guardRows: onlyGuard("totalOutage", 5),
      ...NO_MONEY,
    });
    const outcome = await runWeekend(form);
    expect(outcome.stage).toBe("done");
    const stop = outcome.report?.stop;
    expect(stop?.reason).toBe("guard:totalOutage");
    expect(Number(stop?.atTick)).toBeLessThanOrEqual(24);
    expect(explainWeekend(outcome.report as NonNullable<typeof outcome.report>)).toMatch(/totalOutage/);
  });

  it("a DRIP opex schedule drains the bank and freeCashDepleted stops the weekend", async () => {
    const form = formWith({
      boardPresetId: "g1-lane",
      ticks: 40,
      checkpointEvery: 20,
      guardRows: onlyGuard("freeCashDepleted", 5),
      openingDollars: 5,
      opexRows: Array.from({ length: 20 }, (_, i) => ({ atMinute: i + 1, dollars: 1, memo: "" })),
      withContract: false,
    });
    const outcome = await runWeekend(form);
    expect(outcome.report?.stop?.reason).toBe("guard:freeCashDepleted");
    expect(outcome.report?.warns.some((w) => w.startsWith("OPEX-REFUSED")) ?? false).toBe(true);
    expect(explainWeekend(outcome.report as NonNullable<typeof outcome.report>)).toMatch(/insolvency|free cash/i);
  });

  it("a malformed guard surfaces the UnattendedError grammar verbatim", async () => {
    const rows = defaultGuardRows().map((row) => ({ ...row, enabled: false }));
    const cascade = rows.find((row) => row.kind === "cascadeCollapse");
    if (cascade !== undefined) {
      cascade.enabled = true;
      cascade.degradedPctGt = 150; // outside the (0,100) law
    }
    const outcome = await runWeekend(formWith({ guardRows: rows, ticks: 8 }));
    expect(outcome.stage).toBe("error");
    expect(outcome.error).toMatch(/unattended\[GUARD_PARSE\]/);
    expect(outcome.error).toMatch(/code GUARD_PARSE/);
  });

  it("bucketRows renders every hour with display strings", async () => {
    const form = formWith({ ticks: 130, checkpointEvery: 60, ...NO_MONEY, guardRows: onlyGuard("totalOutage", 999) });
    const outcome = await runWeekend(form);
    const buckets = bucketRows(outcome.report?.hourlyBuckets ?? []);
    expect(buckets.length).toBeGreaterThanOrEqual(2);
    for (const row of buckets) {
      expect(row.meanCash).toMatch(/\$/u);
      expect(row.meanRho).toMatch(/^\d+\.\d{2}$/u);
      expect(row.ratePerMin).toMatch(/^\d+\.\d{2}$/u);
    }
  });
});

describe("what-if mini-mode", () => {
  it("removeNode diverges and names the tick", async () => {
    const form = formWith({ ticks: 24, checkpointEvery: 6, ...NO_MONEY, guardRows: onlyGuard("totalOutage", 999) });
    const outcome = await runWeekendWhatIf(form, buildDelta({ kind: "removeNode", nodeId: "origin" }));
    expect(outcome.stage).toBe("done");
    const result = outcome.result;
    expect(result?.divergent).toBe(true);
    expect(result?.firstDivergentTick).not.toBeNull();
    expect(explainWhatIf(result as NonNullable<typeof result>)).toMatch(/removeNode/);
  });

  it("trafficSurge builds a Fixed multiplier delta", () => {
    const delta = buildDelta({ kind: "trafficSurge", surgeMultiplier: 2.5, surgeMinutes: 10 });
    expect(delta.type).toBe("trafficSurge");
    if (delta.type === "trafficSurge") {
      expect(delta.multiplier).toBe((250n * 65536n) / 100n);
      expect(delta.minutes).toBe(10);
    }
  });

  it("buildDelta refuses junk at the boundary", () => {
    expect(() => buildDelta({ kind: "removeNode", nodeId: "  " })).toThrow(/node id/);
    expect(() => buildDelta({ kind: "trafficSurge", surgeMultiplier: 3, surgeMinutes: 0 })).toThrow(/minutes/);
    expect(() => buildDelta({ kind: "trafficSurge", surgeMultiplier: Number.NaN, surgeMinutes: 5 })).toThrow(/multiplier/);
    expect(() => buildDelta({ kind: "trafficSurge", surgeMultiplier: 40000, surgeMinutes: 5 })).toThrow(/Q16\.16/);
  });
});

describe("shortDigest", () => {
  it("elides long digests, passes short ones through", () => {
    expect(shortDigest("abcdefghijklmnop")).toBe("abcdefgh…mnop");
    expect(shortDigest("abc123")).toBe("abc123");
  });
});
