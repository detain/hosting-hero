/**
 * unattended/__tests__/review-probes.test.ts — the SHIP-WITH-FIXES review
 * probes, reproduced as tests BEFORE each fix (finding numbers match the
 * reviewer's report). Each `it` is the reviewer's probe turned into a pin:
 * pre-fix the marked ones run RED (that is their purpose on landing);
 * post-fix they are the regression fence.
 *
 *  F1  sum-sites hitting the Q16.16 wall (trailingRate + closeHour)
 *  F2  totalOutage idle-as-outage (demand gate, both directions)
 *  F3  empty-roster deafness (error-budget guards with no contracts)
 *  F4  insolvent settle must halt/warn, never crash
 *  F5  pennies-stuck: refusals counted + chain-arming
 *  F6  opex boundary (gift burns, duplicate (minute,memo))
 *  F7  whatIf explicit horizon beats config maxSimMinutes
 *  F8  error grammar `unattended[CODE] at 'path': detail`
 *  F10 BOARD_EMPTY rename of NO_TRAFFIC
 */
import { describe, expect, it } from "vitest";
import { FIXED_ONE, FIXED_ZERO, fromInt, fromRatio } from "../../kernel/fixed.ts";
import { encodeTaggedTree } from "../../internal/canonical.ts";
import {
  UnattendedError,
  applyWhatIfDelta,
  evaluateGuardrail,
  parseCatastropheDef,
  parseGuardList,
  runUnattended,
  runWhatIf,
} from "../index.ts";
import { runUnattendedWithSurge } from "../fastForward.ts";
import type { GuardrailSample, ParsedGuard, RunUnattendedConfig, UnattendedReport } from "../index.ts";
import type { ClockState } from "../../types.ts";
import {
  CALM_BOARD,
  SATURATED_ONLY_BOARD,
  UA_SEED,
  smallContract,
  uaConfig,
} from "./fixtures.ts";

const CLOCKS: ClockState = Object.freeze({
  realUs: 0n,
  simUs: 0n,
  businessUs: 0n,
  wallUs: 0n,
});

/** Eval-level sample with the review's new demand/refusal fields (F2/F5). */
function esample(
  minute: number,
  metrics: Readonly<Record<string, bigint>>,
  over: { windowArrivals?: number; refusedBurns?: number; economyAvailable?: boolean } = {},
): GuardrailSample {
  return Object.freeze({
    tick: BigInt(minute),
    minute,
    clocks: CLOCKS,
    businessMinute: minute,
    metrics: new Map(Object.entries(metrics)),
    economyAvailable: over.economyAvailable ?? true,
    errorBudgetAvailable: false,
    windowArrivals: over.windowArrivals ?? 1,
    refusedBurns: over.refusedBurns ?? 0,
  }) as unknown as GuardrailSample;
}

function evalFeed(g: ParsedGuard, samples: readonly GuardrailSample[]): string[] {
  let run = 0;
  const verdicts: string[] = [];
  for (const s of samples) {
    const step = evaluateGuardrail(g, s, run);
    run = step.nextRun;
    verdicts.push(step.evaluation.verdict);
  }
  return verdicts;
}

function guardOf(def: unknown): ParsedGuard {
  return parseGuardList([def])[0] as ParsedGuard;
}

/* ═══════════════════ F1 — sums must not ride guardFixedFromInt ═══════════════════ */

describe("F1: busy-weekend aggregates clear the Q16.16 input wall", () => {
  /** Reviewer probe 1: 1000 units/min over 61 ticks is a legal busy
   *  weekend; hourly arrival sums (≈60k/min·count) blew the ±32767
   *  guardFixedFromInt wall and surfaced as a MISLABELED GUARD_PARSE. */
  it("1000/min × 61 ticks runs clean with exact hourly Fixed means", { timeout: 25_000 }, () => {
    const busyBoard = Object.freeze({
      nodes: Object.freeze([Object.freeze({ id: "web-1", slots: 1200, serviceTimeUs: 2_000_000n })]),
    });
    const config = uaConfig({
      ticks: 61n,
      board: busyBoard,
      traffic: { baselineRatePerMin: 1000n * FIXED_ONE },
      guards: [{ type: "totalOutage", sustainedMin: 999 }],
    });
    // pre-fix: throws UnattendedError GUARD_PARSE at assemble (closeHour —
    // the first hour banks ~59 000 arrivals past the 32 767 wall). ONE run
    // only — a busy weekend's digest-per-tick makes double runs rude.
    let captured: UnattendedReport | null = null;
    expect(() => {
      captured = runUnattended(config);
    }).not.toThrow();
    // widened re-read: the assignment happens inside a closure, so TS still
    // types `captured` null at this point (never-narrowing on the guard).
    const report = captured as UnattendedReport | null;
    if (report === null) throw new Error("probe: no report after a clean run");
    expect(report.hourlyBuckets).toHaveLength(2);
    const [bucket0, bucket1] = report.hourlyBuckets as [
      UnattendedReport["hourlyBuckets"][number],
      UnattendedReport["hourlyBuckets"][number],
    ];
    // The hourly mean arrives EXACT: 1000 units × 65536 = 65 536 000 raw.
    expect(bucket0.meanArrivalRatePerMin).toBe(1000n * FIXED_ONE);
    expect(bucket1.meanArrivalRatePerMin).toBe(1000n * FIXED_ONE);
  });

  /** Reviewer probe 1b: the trailingRate site (mid-run, per tick). A
   *  5-minute window summing >32767 served units used to throw from
   *  buildSample — a parse error minted from DATA too big for the carrier. */
  it("servedRate trailing window over 8000/min never raises GUARD_PARSE", { timeout: 25_000 }, () => {
    const busyBoard = { nodes: [{ id: "web-1", slots: 9000, serviceTimeUs: 2_000_000n }] };
    const config = uaConfig({
      ticks: 8n,
      board: busyBoard,
      traffic: { baselineRatePerMin: 8000n * FIXED_ONE },
      guards: [{ type: "totalOutage", sustainedMin: 999 }],
    });
    let captured: UnattendedReport | null = null;
    expect(() => {
      captured = runUnattended(config);
    }).not.toThrow();
    const report = captured as UnattendedReport | null;
    if (report === null) throw new Error("probe: no report after a clean run");
    expect(report.stop).toBeNull();
  });

  it("half-away rounding is preserved at the fold (7 units ÷ 2 ticks = 3.5)", () => {
    // fromRatio(total,len) is the same divideRoundHalfAway the old
    // div(guardFixedFromInt(a),guardFixedFromInt(b)) path used — algebraic
    // identity for in-range inputs, pinned by the calm baseline values.
    expect(fromRatio(7n, 2n)).toBe(3n * FIXED_ONE + 32768n);
    expect(fromRatio(1n, 2n)).toBe(32768n); // rounds away from zero at .5
  });
});

/* ═══════════════════ F2 — idle ≠ dead ≠ ignorant ═══════════════════ */

describe("F2: totalOutage gates on demand, quiet worlds never halt", () => {
  /** Reviewer probe 2: baseline OFF, no waves, builtin totalOutage (sustain
   *  30) → pre-fix halted at tick 30 ("idle-as-outage"). */
  it("an empty pipe with ZERO arrivals sustains no outage breach", () => {
    const report = runUnattended(
      uaConfig({ ticks: 40n, traffic: { baselineRatePerMin: FIXED_ZERO }, guards: [{ type: "totalOutage" }] }),
    );
    expect(report.stop).toBeNull();
    expect(report.warns.some((w) => w.startsWith("NO-TRAFFIC"))).toBe(true);
  });

  it("dead-under-load STILL halts: the saturated sole node with baseline traffic", () => {
    const report = runUnattended(
      uaConfig({ ticks: 20n, board: SATURATED_ONLY_BOARD, guards: [{ type: "totalOutage", sustainedMin: 5 }] }),
    );
    expect(report.stop?.reason).toBe("guard:totalOutage");
    expect(report.stop?.atTick).toBe(5n);
  });

  it("eval fold: zero-arrival window CLEARS the chain; demand returns re-arms from zero", () => {
    const g = guardOf({ type: "totalOutage", sustainedMin: 3 });
    const breach = esample(1, { servedRate: FIXED_ZERO }, { windowArrivals: 40 });
    const idle = esample(2, { servedRate: FIXED_ZERO }, { windowArrivals: 0 });
    expect(evalFeed(g, [breach, breach])).toEqual(["armed", "armed"]);
    const verdicts = evalFeed(g, [breach, breach, idle, breach]);
    expect(verdicts).toEqual(["armed", "armed", "ok", "armed"]);
  });

  it("eval fold: threshold guards on servedRate stay literal (demand gate is totalOutage's law)", () => {
    const g = guardOf({ type: "threshold", metric: "servedRate", comparator: "lt", value: fromInt(1), sustainedMin: 1 });
    // A custom row means what it says: zero served with zero demand still trips it.
    expect(evalFeed(g, [esample(1, { servedRate: FIXED_ZERO }, { windowArrivals: 0 })])).toEqual(["triggered"]);
  });
});

/* ═══════════════════ F3 — empty-roster deafness ═══════════════════ */

describe("F3: error-budget guards without a contract roster warn loudly", () => {
  /** Reviewer probe 1e: money:{contracts:[]} + errorBudgetGone → permanently
   *  silent unavailability with NO warn pre-fix. */
  it("errorBudgetGone over an empty roster carries money BUT says budget-guard-no-contracts", () => {
    const report = runUnattended(
      uaConfig({
        ticks: 10n,
        guards: [{ type: "errorBudgetGone", sustainedMin: 1 }],
        money: { contracts: [], initialFreeMicroUsd: 5_000_000n },
      }),
    );
    expect(report.stop).toBeNull(); // still never fires on ignorance
    expect(report.warns.some((w) => w.startsWith("BUDGET-GUARD-NO-CONTRACTS"))).toBe(true);
  });

  it("the same deafness covers a threshold metric of errorBudgetSec", () => {
    const report = runUnattended(
      uaConfig({
        ticks: 10n,
        guards: [{ type: "threshold", metric: "errorBudgetSec", comparator: "lte", value: 0n, sustainedMin: 1 }],
        money: { contracts: [], initialFreeMicroUsd: 5_000_000n },
      }),
    );
    expect(report.stop).toBeNull();
    expect(report.warns.some((w) => w.startsWith("BUDGET-GUARD-NO-CONTRACTS"))).toBe(true);
  });

  it("a FUNDED roster keeps the guard honest and silent", () => {
    const report = runUnattended(
      uaConfig({
        ticks: 10n,
        guards: [{ type: "errorBudgetGone", sustainedMin: 1 }],
        money: { contracts: [smallContract("c-ok", 100_000_000n, 100_000)], initialFreeMicroUsd: 50_000_000_000n },
      }),
    );
    expect(report.stop).toBeNull();
    expect(report.warns.some((w) => w.startsWith("BUDGET-GUARD-NO-CONTRACTS"))).toBe(false);
  });
});

/* ═══════════════════ F4 — insolvent settle: halt-or-warn, never crash ═══════════════════ */

describe("F4: an insolvent invoice settle must not crash the weekend", () => {
  /** Reviewer probe 3 (both cash variants): economy negative settle threw a
   *  raw RangeError out of runUnattended. */
  const insolvent = (initialFreeMicroUsd: bigint) =>
    uaConfig({
      ticks: 40n,
      board: { nodes: [{ id: "web-1", slots: 40, serviceTimeUs: 2_000_000n, inspectionDepth: "pass-through" as const }] },
      money: { contracts: [smallContract("c-insolv", 100_000_000n, 100_000)], initialFreeMicroUsd },
    });

  it("unguarded: the run COMPLETES carrying an INVOICE-UNCOVERABLE warn", () => {
    expect(() => runUnattended(insolvent(0n))).not.toThrow();
    for (const cash of [0n, 10_000n]) {
      const report = runUnattended(insolvent(cash));
      expect(report.ticksRun).toBe(40n);
      expect(report.warns.some((w) => w.startsWith("INVOICE-UNCOVERABLE"))).toBe(true);
    }
  });

  it("guarded: the refusal arms the freeCashDepleted chain → typed halt, cash untouched", () => {
    const config = Object.freeze({
      ...insolvent(10_000n),
      guards: [{ type: "freeCashDepleted", sustainedMin: 1 }],
    });
    const report = runUnattended(config);
    // 10_000 µ$ is ABOVE zero — the halt can only come from inability-to-pay.
    expect(report.stop?.reason).toBe("guard:freeCashDepleted");
    expect(report.summary.cashEndMicroUsd).toBe(10_000n);
    expect(report.warns.some((w) => w.startsWith("INVOICE-UNCOVERABLE"))).toBe(true);
  });
});

/* ═══════════════════ F5 — pennies-stuck: counted + chain-arming ═══════════════════ */

describe("F5: burned-by-refusal pennies arm the insolvency chain and count in the warn", () => {
  /** Reviewer probe 2b: cash pinned 20 µ$, every burn refused — pre-fix ONE
   *  deduped warn, 20 refusals invisible, run 'healthy'. */
  const stuckBoard = { nodes: [{ id: "web-1", slots: 400, serviceTimeUs: 2_000_000n }] };
  const stuckMoney = (guardOver: Record<string, unknown> = {}) =>
    uaConfig({
      ticks: 30n,
      board: stuckBoard,
      guards: [{ type: "freeCashDepleted", ...guardOver }],
      money: {
        contracts: [],
        initialFreeMicroUsd: 20n,
        opex: Array.from({ length: 20 }, (_unused, m) => ({
          atMinute: m + 1,
          amountMicroUsd: 1_000_000n,
          memo: `stuck-${String(m + 1).padStart(2, "0")}`,
        })),
      },
    });

  it("twenty refused burns HALT at the sustain window even though cash > 0", () => {
    const report = runUnattended(stuckMoney({ sustainedMin: 5 }));
    expect(report.stop?.reason).toBe("guard:freeCashDepleted");
    expect(report.stop?.atTick).toBe(5n); // armed from m1 by refusals, 5 ticks
    expect(report.summary.cashEndMicroUsd).toBe(20n);
  });

  it("the warn counts refusals: `OPEX-REFUSED ×N from mK`", () => {
    const report = runUnattended(stuckMoney({ sustainedMin: 999 }));
    expect(report.stop).toBeNull();
    expect(report.warns.some((w) => w.startsWith("OPEX-REFUSED ×20 from m1:"))).toBe(true);
  });

  it("eval fold: a refusal sample arms the chain; clear cash after resets", () => {
    const g = guardOf({ type: "freeCashDepleted", sustainedMin: 3 });
    const refused = esample(1, { "cash.free": 20n * FIXED_ONE }, { refusedBurns: 2 });
    const paid = esample(2, { "cash.free": 20n * FIXED_ONE });
    expect(evalFeed(g, [refused, refused, paid])).toEqual(["armed", "armed", "ok"]);
    expect(evalFeed(g, [refused, refused, refused])).toEqual(["armed", "armed", "triggered"]);
  });

  it("F4×F5 no double-fire: refusal-armed ticks count ONE chain step per tick", () => {
    // Both refusal sources feed one per-tick counter — the DRIP plant keeps
    // its ratified halt tick (metric breach m5, then refusal-armed m6+).
    const report = runUnattended(
      uaConfig({
        ticks: 30n,
        guards: [{ type: "freeCashDepleted" }],
        money: {
          contracts: [],
          initialFreeMicroUsd: 5_000_000n,
          opex: Array.from({ length: 30 }, (_unused, m) => ({
            atMinute: m + 1,
            amountMicroUsd: 1_000_000n,
            memo: `drip-${String(m + 1).padStart(2, "0")}`,
          })),
          dunningEngineOwned: true,
        },
      }),
    );
    expect(report.stop?.reason).toBe("guard:freeCashDepleted");
    expect(report.stop?.atTick).toBe(14n); // hits 0 at m5, builtin sustain 10
  });
});

/* ═══════════════════ F6 — opex boundary laws ═══════════════════ */

describe("F6: opex drafts refuse gifts and duplicate (minute,memo) twins", () => {
  const withOpex = (opex: readonly unknown[]) =>
    uaConfig({
      ticks: 3n,
      money: { contracts: [], initialFreeMicroUsd: 1_000_000n, opex } as NonNullable<RunUnattendedConfig["money"]>,
    });

  it("amountMicroUsd < 1 throws CONFIG_PARSE (negative burn = gift)", () => {
    expect(() => runUnattended(withOpex([{ atMinute: 1, amountMicroUsd: 0n, memo: "zero" }]))).toThrow(UnattendedError);
    expect(() => runUnattended(withOpex([{ atMinute: 1, amountMicroUsd: -5n, memo: "gift" }]))).toThrow(/amountMicroUsd/);
  });

  it("duplicate (atMinute,memo) throws — the cause-id uniqueness the docstring promises", () => {
    const twin = { atMinute: 2, amountMicroUsd: 10n, memo: "payroll" };
    expect(() => runUnattended(withOpex([twin, twin]))).toThrow(/duplicate|twin|same/i);
    // same minute, different memo stays legal
    expect(() =>
      runUnattended(withOpex([twin, { atMinute: 2, amountMicroUsd: 11n, memo: "rent" }])),
    ).not.toThrow();
  });
});

/* ═══════════════════ F7 — whatIf explicit horizon wins ═══════════════════ */

describe("F7: an explicit whatIf horizon overrides config.maxSimMinutes", () => {
  /** Reviewer probe 2d: horizon 20 with maxSimMinutes 10 got 10 ticks. */
  it("horizon 20 gets 20 ticks even under a 10-minute config cap", () => {
    const config = uaConfig({ ticks: 500n, maxSimMinutes: 10 });
    expect(runUnattended(config).ticksRun).toBe(10n); // min() still governs the runner
    const r = runWhatIf({ config, delta: { type: "disableDefense", id: "web-1" }, horizon: 20n });
    expect(r.deltaSummary.horizon).toBe(20n);
    expect(r.baseline.ticksRun).toBe(20n);
    expect(r.variant.ticksRun).toBe(20n);
    expect(r.baseline.summary.served).toBeGreaterThan(0);
  });
});

/* ═══════════════════ F8 — error grammar ═══════════════════ */

describe("F8: UnattendedError speaks the documented grammar", () => {
  it("message === unattended[CODE] at 'path': detail", () => {
    let err: UnattendedError | null = null;
    try {
      parseCatastropheDef({ type: "meltdown" });
    } catch (e) {
      err = e as UnattendedError;
    }
    expect(err).toBeInstanceOf(UnattendedError);
    expect((err as unknown as UnattendedError).message).toMatch(
      /^unattended\[GUARD_PARSE\] at 'guard\.type': unknown guard kind meltdown/,
    );

    let bounds: UnattendedError | null = null;
    try {
      runUnattended({ runSeed: UA_SEED, board: CALM_BOARD, ruleBook: [], ruleBookHash: "b", guards: [] });
    } catch (e) {
      bounds = e as UnattendedError;
    }
    expect((bounds as unknown as UnattendedError).message).toBe(
      "unattended[TICK_BOUNDS] at 'runUnattended': provide ticks or maxSimMinutes",
    );
  });
});

/* ═══════════════════ F10 — BOARD_EMPTY rename ═══════════════════ */

describe("F10: the empty-board refusal speaks BOARD_EMPTY", () => {
  it("zero-node board throws BOARD_EMPTY, not NO_TRAFFIC (traffic was never the issue)", () => {
    let err: unknown = null;
    try {
      runUnattended(uaConfig({ ticks: 5n, board: { nodes: [] } }));
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(UnattendedError);
    expect((err as UnattendedError).code).toBe("BOARD_EMPTY");
    expect((err as UnattendedError).message).toContain("no express path");
  });
});

/* ═══════════════════ F11 — whatIf determinism DEPTH ═══════════════════ */

function fullReportIdentity(report: UnattendedReport): string {
  const plain = {
    runSeed: String(report.runSeed),
    ticksRun: String(report.ticksRun),
    stop: report.stop,
    finalDigest: report.finalDigest,
    perCheckpoint: report.perCheckpoint,
    summary: { ...report.summary, invoiceEvents: [...report.summary.invoiceEvents] },
    hourlyBuckets: report.hourlyBuckets,
    warns: report.warns,
  };
  return JSON.stringify(encodeTaggedTree(plain, (problem) => {
    throw new Error(`whatIf full-report identity not canonical: ${String(problem.kind)}`);
  }), (_k, v) => (typeof v === "bigint" ? `${String(v)}n` : v));
}

describe("F11: whatIf determinism at FULL-REPORT depth", () => {
  it("one representative delta pair: baseline and variant reports replay byte-identical (×25)", { timeout: 60_000 }, () => {
    // Reviewer: the old pin compared a scalar subset across TWO runs —
    // below the module's byte-identity bar. Cost law honored: ONE baseline
    // run + ONE variant run per iteration (NOT the 4-run whatIf per
    // iteration); the bisect plumbing keeps its own scalar pins in
    // whatIf.test.ts. HONEST ADAPTIVE CHOICE (reviewer time-box): ×100
    // measured ~15 s on this box — beyond the 10 s budget — so the depth
    // pin rides ×25 (~4 s) rather than thinning the report to scalars.
    const ITERATIONS = 25;
    const config = uaConfig({ ticks: 30n, guards: [{ type: "totalOutage" }] });
    const delta = { type: "trafficSurge", multiplier: fromInt(3), minutes: 4, startMinute: 5 } as const;
    const { config: patched, surge } = applyWhatIfDelta(config, delta);
    const scopedBase: RunUnattendedConfig = Object.freeze({ ...config, ticks: 30n, checkpointEvery: 60 });
    const scopedVar: RunUnattendedConfig = Object.freeze({ ...patched, ticks: 30n, checkpointEvery: 60 });
    const baseId = fullReportIdentity(runUnattended(scopedBase));
    const varId = fullReportIdentity(runUnattendedWithSurge(scopedVar, surge));
    expect(baseId).not.toBe(varId); // the pair genuinely differs (non-trivial)
    for (let i = 0; i < ITERATIONS - 1; i++) {
      expect(fullReportIdentity(runUnattended(scopedBase))).toBe(baseId);
      expect(fullReportIdentity(runUnattendedWithSurge(scopedVar, surge))).toBe(varId);
    }
  });
});
