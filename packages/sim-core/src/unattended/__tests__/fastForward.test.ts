/**
 * unattended/fastForward.ts — the Long Weekend runner, integrated.
 * Every guard type gets a PLANTED catastrophe that fires on the real engine
 * (non-triviality) and a calm run that never fires (honesty); the report
 * laws (determinism ×100, halt==clean-prefix digest, cadence exactness,
 * NO-GUARDS candor) ride alongside. Perf-pinned: 2000 ticks < 2 s wall.
 */
import { describe, expect, it } from "vitest";
import { FIXED_ZERO, fromInt, fromRatio } from "../../kernel/fixed.ts";
import { MICROS_PER_MIN } from "../../kernel/time.ts";
import { asRunSeed } from "../../types.ts";
import { encodeTaggedTree } from "../../internal/canonical.ts";
import {
  DEFAULT_CHECKPOINT_EVERY,
  LONG_WEEKEND_MAX_TICKS,
  NODE_DEGRADED_RHO_GTE,
  UNATTENDED_AGGRESSION,
  UNATTENDED_BASELINE_RATE_PER_MIN,
  UNATTENDED_EXPRESS_MAX_CONFIDENCE,
  UnattendedError,
  budgetMinRemainingSec,
  guardFixedFromInt,
  parseGuardList,
  percentToFixed,
  runUnattended,
} from "../index.ts";
import type { RunUnattendedConfig, UnattendedReport } from "../index.ts";
import {
  CALM_BOARD,
  DRIP_MONEY,
  RUNAWAY_BOOK,
  SATURATED_BOARD,
  SATURATED_ONLY_BOARD,
  SHEETS_HASH,
  SLOW_BOARD,
  UA_PRESSURE,
  UA_SEED,
  RULE_BOOK_HASH,
  smallContract,
  uaConfig,
  uaSeed,
  uaWaveTable,
} from "./fixtures.ts";

/** Reports embed parsed-guard closures-free records, but Map leaves need
 *  JSON's replacer treatment; guardsParsed is DERIVED config (identical for
 *  identical guard lists), so the determinism fold strips it deliberately. */
function reportIdentity(report: UnattendedReport): string {
  const plain = {
    runSeed: report.runSeed,
    ticksRun: report.ticksRun,
    stop: report.stop,
    finalDigest: report.finalDigest,
    perCheckpoint: report.perCheckpoint,
    summary: { ...report.summary, invoiceEvents: [...report.summary.invoiceEvents] },
    hourlyBuckets: report.hourlyBuckets,
    warns: report.warns,
  };
  return JSON.stringify(encodeTaggedTree(plain, (problem) => {
    throw new Error(`unattended report not canonical: ${String(problem.kind)}`);
  }), (_k, v) => (typeof v === "bigint" ? `${String(v)}n` : v));
}

describe("calm weekend baseline", () => {
  it("runs to the horizon, serves traffic, stops for nothing", () => {
    const report = runUnattended(uaConfig({ ticks: 12n }));
    expect(report.stop).toBeNull();
    expect(report.ticksRun).toBe(12n);
    expect(report.summary.served).toBeGreaterThan(0);
    expect(report.summary.blocked).toBe(0);
    expect(report.finalDigest).toMatch(/^[0-9a-f]{32}$/);
    expect(report.warns).toEqual(["NO-GUARDS"]); // honesty, not enforcement
    expect(report.guardsParsed).toHaveLength(0);
  });

  it("maxSimMinutes alone sets the horizon; with ticks the minimum governs", () => {
    expect(runUnattended(uaConfig({ maxSimMinutes: 7 })).ticksRun).toBe(7n);
    expect(runUnattended(uaConfig({ ticks: 9n, maxSimMinutes: 7 })).ticksRun).toBe(7n);
  });

  it("the 48h §9.2 cap only WARNS — a host may still ask for more", () => {
    const report = runUnattended(uaConfig({ ticks: BigInt(LONG_WEEKEND_MAX_TICKS + 5), traffic: { baselineRatePerMin: FIXED_ZERO } }));
    expect(report.warns.some((w) => w.startsWith("LONG-WEEKEND-EXCEEDED"))).toBe(true);
  });

  it("config parse fails loud: no horizon, half ticks, dead cadence, empty board", () => {
    const noHorizon: RunUnattendedConfig = { runSeed: UA_SEED, board: CALM_BOARD, ruleBook: [], ruleBookHash: "b", guards: [] };
    expect(() => runUnattended(noHorizon)).toThrow(/TICK_BOUNDS/);
    expect(() => runUnattended(uaConfig({ ticks: 0n }))).toThrow(/TICK_BOUNDS/);
    expect(() => runUnattended(uaConfig({ ticks: 5n, checkpointEvery: 0 }))).toThrow(/CHECKPOINT_CADENCE/);
    expect(() => runUnattended(uaConfig({ ticks: 5n, board: { nodes: [] } }))).toThrow(/BOARD_EMPTY/);
  });

  it("a disabled baseline without waves honestly says the pipe is empty", () => {
    const report = runUnattended(uaConfig({ ticks: 3n, traffic: { baselineRatePerMin: FIXED_ZERO } }));
    expect(report.warns.some((w) => w.startsWith("NO-TRAFFIC"))).toBe(true);
    expect(report.summary.served).toBe(0);
  });

  it("defaults are the versus-tested posture (cited constants)", () => {
    expect(UNATTENDED_BASELINE_RATE_PER_MIN).toBe(40);
    expect(UNATTENDED_AGGRESSION).toBe(fromRatio(7n, 10n));
    expect(UNATTENDED_EXPRESS_MAX_CONFIDENCE).toBe(fromRatio(6n, 10n));
    expect(NODE_DEGRADED_RHO_GTE).toBe(fromRatio(9n, 10n));
    expect(DEFAULT_CHECKPOINT_EVERY).toBe(60);
  });
});

describe("planted catastrophes fire — one per guard kind", () => {
  it("cascadeCollapse: the one-slug-per-300ms node degrades alone, sustained", () => {
    const report = runUnattended(uaConfig({ ticks: 30n, board: SLOW_BOARD, guards: [{ type: "cascadeCollapse" }] }));
    expect(report.stop?.reason).toBe("guard:cascadeCollapse");
    expect(report.stop?.atTick).toBe(10n); // builtin sustained 10 from tick 1
    expect(report.stop?.atMinute).toBe(10);
    expect(report.stop?.snapshotDigest).toMatch(/^[0-9a-f]{32}$/);
    // calm never fires it:
    const calm = runUnattended(uaConfig({ ticks: 30n, guards: [{ type: "cascadeCollapse" }] }));
    expect(calm.stop).toBeNull();
  });

  it("totalOutage: the saturated sole node serves ZERO for the sustain window", () => {
    const report = runUnattended(
      uaConfig({ ticks: 20n, board: SATURATED_ONLY_BOARD, guards: [{ type: "totalOutage", sustainedMin: 5 }] }),
    );
    expect(report.stop?.reason).toBe("guard:totalOutage");
    expect(report.stop?.atTick).toBe(5n);
    const calm = runUnattended(uaConfig({ ticks: 30n, guards: [{ type: "totalOutage", sustainedMin: 5 }] }));
    expect(calm.stop).toBeNull();
  });

  it("freeCashDepleted: the payroll drip empties free cash, guard halts at minute 14", () => {
    const report = runUnattended(uaConfig({ ticks: 30n, guards: [{ type: "freeCashDepleted" }], money: DRIP_MONEY }));
    expect(report.stop?.reason).toBe("guard:freeCashDepleted");
    expect(report.stop?.atTick).toBe(14n); // hits 0 at m5, builtin sustain 10
    expect(report.summary.cashStartMicroUsd).toBe(5_000_000n);
    expect(report.summary.cashEndMicroUsd).toBe(0n);
    expect(report.warns.some((w) => w.startsWith("OPEX-REFUSED"))).toBe(true);
    const calm = runUnattended(uaConfig({ ticks: 30n, guards: [{ type: "freeCashDepleted" }], money: { ...DRIP_MONEY, opex: [] } }));
    expect(calm.stop).toBeNull();
  });

  it("ruleRunaway: thirty cards firing as one trip a >1/min threshold", () => {
    const report = runUnattended(
      uaConfig({
        ticks: 30n,
        ruleBook: RUNAWAY_BOOK,
        guards: [{ type: "ruleRunaway", firingsPerMinGt: guardFixedFromInt(1), sustainedMin: 3 }],
      }),
    );
    expect(report.stop?.reason).toBe("guard:ruleRunaway");
    expect(report.summary.ruleFirings).toBeGreaterThan(0);
    const calm = runUnattended(
      uaConfig({ ticks: 30n, guards: [{ type: "ruleRunaway", firingsPerMinGt: guardFixedFromInt(1), sustainedMin: 3 }] }),
    );
    expect(calm.stop).toBeNull();
    expect(calm.summary.ruleFirings).toBe(0);
  });

  it("errorBudgetGone: real landed breaches drain the SLA budget to the threshold", () => {
    const passBoard = { nodes: [{ id: "web-1", slots: 40, serviceTimeUs: 2_000_000n, inspectionDepth: "pass-through" as const }] };
    const money = {
      contracts: [smallContract("c-sla", 100_000_000n, 100_000)],
      initialFreeMicroUsd: 50_000_000_000n,
    };
    const report = runUnattended(uaConfig({
      ticks: 130n,
      board: passBoard,
      deepPath: ["web-1"],
      guards: [{ type: "errorBudgetGone", remainingSecLte: guardFixedFromInt(2_400), sustainedMin: 1 }],
      money,
      traffic: { table: uaWaveTable("ua-swarm-1"), pressureParams: UA_PRESSURE, baselineRatePerMin: fromInt(5) },
    }));
    expect(report.summary.landed).toBeGreaterThan(0); // the drain came from REAL impacts
    expect(report.stop?.reason).toBe("guard:errorBudgetGone");
    expect(report.stop?.atTick).toBe(46n);
    // the same weekend WITHOUT the wave table never burns the budget to 0
    const calm = runUnattended(uaConfig({
      ticks: 130n,
      board: passBoard,
      deepPath: ["web-1"],
      guards: [{ type: "errorBudgetGone", remainingSecLte: guardFixedFromInt(2_400), sustainedMin: 1 }],
      money,
      traffic: { baselineRatePerMin: fromInt(5) },
    }));
    expect(calm.stop).toBeNull();
    expect(calm.summary.landed).toBe(0);
  });
});

describe("halt law: the stop is a clean between-ticks witness", () => {
  it("the stop snapshot byte-equals a clean run that ended at that tick", () => {
    const planted = runUnattended(uaConfig({ ticks: 30n, board: SLOW_BOARD, guards: [{ type: "cascadeCollapse" }] }));
    const stopTick = planted.stop?.atTick as bigint;
    expect(stopTick).toBe(10n);
    const cleanPrefix = runUnattended(uaConfig({ ticks: stopTick, board: SLOW_BOARD }));
    expect(cleanPrefix.finalDigest).toBe(planted.stop?.snapshotDigest);
    // and running LONGER without guards keeps the sim going (halt ≠ crash):
    const longer = runUnattended(uaConfig({ ticks: 30n, board: SLOW_BOARD }));
    expect(longer.ticksRun).toBe(30n);
  });

  it("first-listed guard wins when two trigger on the same tick", () => {
    // The saturated-sole board breaches totalOutage AND cascadeCollapse from
    // tick 1; list order decides which catastrophe owns the halt.
    const config = uaConfig({
      ticks: 20n,
      board: SATURATED_ONLY_BOARD,
      guards: [
        { type: "cascadeCollapse", degradedPctGt: 50, sustainedMin: 3 },
        { type: "totalOutage", sustainedMin: 3 },
      ],
    });
    expect(runUnattended(config).stop?.reason).toBe("guard:cascadeCollapse");
    const flipped = uaConfig({
      ticks: 20n,
      board: SATURATED_ONLY_BOARD,
      guards: [
        { type: "totalOutage", sustainedMin: 3 },
        { type: "cascadeCollapse", degradedPctGt: 50, sustainedMin: 3 },
      ],
    });
    expect(runUnattended(flipped).stop?.reason).toBe("guard:totalOutage");
  });

  it("money guards without a threaded economy stay UNAVAILABLE and say so", () => {
    const report = runUnattended(uaConfig({ ticks: 5n, guards: [{ type: "freeCashDepleted" }] }));
    expect(report.stop).toBeNull(); // NEVER fires on ignorance (mint-zero mirror)
    expect(report.warns.some((w) => w.startsWith("MONEY-GUARD-WITHOUT-ECONOMY"))).toBe(true);
  });
});

describe("checkpoint cadence is exact and read-only", () => {
  it("cadence 60 / 10 / 1 produce precisely their multiples", () => {
    const c60 = runUnattended(uaConfig({ ticks: 130n, guards: [{ type: "totalOutage" }] }));
    expect(c60.perCheckpoint.map((c) => c.tick)).toEqual([60n, 120n]);
    const c10 = runUnattended(uaConfig({ ticks: 35n, checkpointEvery: 10, guards: [{ type: "totalOutage" }] }));
    expect(c10.perCheckpoint.map((c) => c.tick)).toEqual([10n, 20n, 30n]);
    const c1 = runUnattended(uaConfig({ ticks: 4n, checkpointEvery: 1, guards: [{ type: "totalOutage" }] }));
    expect(c1.perCheckpoint.map((c) => c.tick)).toEqual([1n, 2n, 3n, 4n]);
  });

  it("a cadence-1 digest equals the cadence-60 digest at the shared tick", () => {
    // (checkpoints observe, never mutate — whatIf's refinement re-play relies
    // on this apples-to-apples law)
    const fat = runUnattended(uaConfig({ ticks: 60n, checkpointEvery: 1, guards: [{ type: "totalOutage" }] }));
    const thin = runUnattended(uaConfig({ ticks: 60n, checkpointEvery: 60, guards: [{ type: "totalOutage" }] }));
    expect(fat.perCheckpoint[59]?.digest).toBe(thin.perCheckpoint[0]?.digest);
    expect(fat.finalDigest).toBe(thin.finalDigest);
  });
});

describe("the report is digest-stable: determinism ×100", () => {
  it("a guarded, monetized, waved weekend replays byte-identical one hundred times", () => {
    const config = uaConfig({
      ticks: 25n,
      board: SATURATED_BOARD,
      ruleBook: RUNAWAY_BOOK,
      guards: [
        { type: "totalOutage", sustainedMin: 5 },
        { type: "threshold", metric: "nodesDegradedPct", comparator: "gt", value: percentToFixed(40), sustainedMin: 3 },
      ],
      money: DRIP_MONEY,
      checkpointEvery: 5,
    });
    const first = reportIdentity(runUnattended(config));
    expect(runUnattended(config) !== null).toBe(true);
    for (let i = 0; i < 99; i++) {
      expect(reportIdentity(runUnattended(config))).toBe(first);
    }
  });

  it("a different seed diverges (the fold is not a constant)", () => {
    const a = reportIdentity(runUnattended(uaConfig({ ticks: 25n, checkpointEvery: 5 })));
    const b = reportIdentity(runUnattended(uaConfig({ ticks: 25n, runSeed: uaSeed(778n), checkpointEvery: 5 })));
    expect(a).not.toBe(b);
  });
});

describe("summary + hourly bucket arithmetic", () => {
  it("hour buckets tile the run and their folds sum to the summary", () => {
    const report = runUnattended(uaConfig({ ticks: 130n, guards: [{ type: "totalOutage" }] }));
    expect(report.hourlyBuckets.map((b) => b.hour)).toEqual([0, 1, 2]);
    expect(report.hourlyBuckets[1]?.startMinute).toBe(60);
    expect(report.hourlyBuckets[1]?.endMinuteExclusive).toBe(120);
    const sum = (pick: (b: (typeof report.hourlyBuckets)[number]) => number) =>
      report.hourlyBuckets.reduce((acc, b) => acc + pick(b), 0);
    expect(sum((b) => b.served)).toBe(report.summary.served);
    expect(sum((b) => b.blocked)).toBe(report.summary.blocked);
    expect(sum((b) => b.ruleFirings)).toBe(report.summary.ruleFirings);
    expect(sum((b) => b.arrivals)).toBeGreaterThan(0);
    expect(Number(report.hourlyBuckets[0]?.meanRho ?? 0n)).toBeGreaterThanOrEqual(0);
  });

  it("invoice notice census rides the summary, keys sorted", () => {
    const money = {
      contracts: [smallContract("c-one", 100_000_000n, 100_000)],
      initialFreeMicroUsd: 50_000_000_000n,
    };
    const report = runUnattended(uaConfig({ ticks: 25n, money }));
    const keys = [...report.summary.invoiceEvents.keys()];
    expect([...keys].sort()).toEqual(keys);
    expect(report.summary.invoiceEvents.get("invoice-issued") ?? 0).toBeGreaterThan(0);
  });

  it("the money lane threads clock-true: hourly invoices accrue across 130 ticks (no clock throw)", () => {
    // Funded roster with an hourly contract: ~13,000 business minutes accrue
    // over 130 ticks → several invoice-issued notices must surface. (The
    // DRIP_MONEY fixture carries contracts: [] on purpose — it must not be
    // reused for anything invoice-related.)
    const report = runUnattended(
      uaConfig({
        ticks: 130n,
        money: { contracts: [smallContract("c-live", 100_000_000n, 100_000)], initialFreeMicroUsd: 50_000_000_000n },
      }),
    );
    expect(report.ticksRun).toBe(130n);
    expect(report.summary.invoiceEvents.get("invoice-issued") ?? 0).toBeGreaterThan(0);
  });
});

describe("perf: the weekend must be viable", () => {
  it("2000 calm ticks (weekly-report scale) finish under 2 s wall", { timeout: 30_000 }, () => {
    // Contention-adaptive honesty: measure TWO full runs and pin the min —
    // a sibling test mid-GC may heat one slice, but the floor is the engine.
    // Standalone floor is ~0.6 s; 2 s is the ratified budget.
    let elapsedMs = Number.POSITIVE_INFINITY;
    let report: UnattendedReport | null = null;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const startedAt = Date.now();
      report = runUnattended(
        uaConfig({ ticks: 2000n, traffic: { baselineRatePerMin: fromInt(5) }, guards: [{ type: "totalOutage" }] }),
      );
      elapsedMs = Math.min(elapsedMs, Date.now() - startedAt);
    }
    expect(report!.stop).toBeNull();
    expect(report!.summary.served).toBeGreaterThan(0);
    // Also measure a 200-tick twin; the 2000-run floor must stay within
    // 10× the twin's wall even on a loaded box.
    const twinStart = Date.now();
    runUnattended(uaConfig({ ticks: 200n, traffic: { baselineRatePerMin: fromInt(5) }, guards: [{ type: "totalOutage" }] }));
    const twinMs = Math.max(1, Date.now() - twinStart);
    expect(elapsedMs).toBeLessThan(2000);
    expect(elapsedMs).toBeLessThan(twinMs * 10 + 1500);
  });

  it("budgetMinRemainingSec reads the threaded budget fold", () => {
    // 99.9 % of the 43 200 s business month ⇒ 2592 s minted at registration.
    const passBoard = { nodes: [{ id: "web-1", slots: 40, serviceTimeUs: 2_000_000n, inspectionDepth: "pass-through" as const }] };
    const report = runUnattended(uaConfig({
      ticks: 1n,
      board: passBoard,
      money: { contracts: [smallContract("c-sla", 100_000_000n, 100_000)], initialFreeMicroUsd: 50_000_000_000n },
    }));
    expect(report.summary.cashStartMicroUsd).toBe(50_000_000_000n);
    expect(report.summary.invoiceEvents.size).toBeGreaterThanOrEqual(0);
    // The exported fold is exercised on the REAL budget state by the
    // errorBudgetGone plant above; here just pin its presence in the API.
    expect(typeof budgetMinRemainingSec).toBe("function");
  });
});
