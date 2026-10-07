/**
 * unattended/guardrails.ts evaluateGuardrail — the pure sustain fold.
 * (guard, sample, priorRun) → verdict + next counter. Every kind must be
 * non-trivial: armed BEFORE triggered, cleared by a single good minute,
 * and HONEST about unobservable metrics (never fires on ignorance).
 */
import { describe, expect, it } from "vitest";
import type { ClockState } from "../../types.ts";
import { fromInt } from "../../kernel/fixed.ts";
import { evaluateGuardrail, guardFixedFromInt, parseGuardList, percentToFixed } from "../index.ts";
import type { GuardrailSample, ParsedGuard } from "../index.ts";

const CLOCKS: ClockState = Object.freeze({
  realUs: 0n,
  simUs: 0n,
  businessUs: 0n,
  wallUs: 0n,
});

/** Money rides raw µ$ × 65536 in the Fixed carrier (exact, sign-preserving). */
function cashFixed(microUsd: bigint): bigint {
  return microUsd * 65536n;
}

function sampleAt(
  minute: number,
  metrics: Readonly<Partial<Record<string, bigint>>>,
  opts: { economyAvailable?: boolean; errorBudgetAvailable?: boolean } = {},
): GuardrailSample {
  const map = new Map<string, bigint>();
  for (const [k, v] of Object.entries(metrics)) {
    if (v !== undefined) map.set(k, v);
  }
  return Object.freeze({
    tick: BigInt(minute),
    minute,
    clocks: CLOCKS,
    businessMinute: minute,
    metrics: map,
    economyAvailable: opts.economyAvailable ?? true,
    errorBudgetAvailable: opts.errorBudgetAvailable ?? true,
  }) as GuardrailSample;
}

function guard(def: unknown): ParsedGuard {
  return parseGuardList([def])[0] as ParsedGuard;
}

/** Feed samples one at a time through the fold, threading the run counter. */
function feed(g: ParsedGuard, samples: readonly GuardrailSample[]) {
  let run = 0;
  let last: ReturnType<typeof evaluateGuardrail>["evaluation"] | null = null;
  const verdicts: string[] = [];
  for (const s of samples) {
    const step = evaluateGuardrail(g, s, run);
    run = step.nextRun;
    last = step.evaluation;
    verdicts.push(step.evaluation.verdict);
  }
  return { last: { evaluation: last as NonNullable<typeof last> }, verdicts };
}

describe("sustain ladder — armed before triggered, for EVERY kind", () => {
  const ladders: readonly { name: string; def: unknown; breach: Readonly<Record<string, bigint>>; clear: Readonly<Record<string, bigint>> }[] = [
    {
      name: "freeCashDepleted",
      def: { type: "freeCashDepleted", sustainedMin: 3 },
      breach: { "cash.free": cashFixed(0n) },
      clear: { "cash.free": cashFixed(1n) },
    },
    {
      name: "totalOutage",
      def: { type: "totalOutage", sustainedMin: 3 },
      breach: { servedRate: 0n },
      clear: { servedRate: fromInt(1) },
    },
    {
      name: "cascadeCollapse",
      def: { type: "cascadeCollapse", degradedPctGt: 50, sustainedMin: 3 },
      breach: { nodesDegradedPct: percentToFixed(90) },
      clear: { nodesDegradedPct: percentToFixed(10) },
    },
    {
      name: "ruleRunaway",
      def: { type: "ruleRunaway", firingsPerMinGt: guardFixedFromInt(30), sustainedMin: 3 },
      breach: { ruleFiringsPerMin: guardFixedFromInt(60) },
      clear: { ruleFiringsPerMin: guardFixedFromInt(1) },
    },
    {
      name: "errorBudgetGone",
      def: { type: "errorBudgetGone", remainingSecLte: guardFixedFromInt(0), sustainedMin: 3 },
      breach: { errorBudgetSec: guardFixedFromInt(-5) },
      clear: { errorBudgetSec: guardFixedFromInt(5) },
    },
  ];

  for (const ladder of ladders) {
    it(`${ladder.name}: ok → armed → armed → triggered at the 3rd consecutive minute`, () => {
      const g = guard(ladder.def);
      const run = feed(g, [sampleAt(1, ladder.breach), sampleAt(2, ladder.breach)]);
      expect(run.verdicts).toEqual(["armed", "armed"]);
      expect(run.last.evaluation.runMin).toBe(2);
      const fired = feed(g, [
        sampleAt(1, ladder.breach),
        sampleAt(2, ladder.breach),
        sampleAt(3, ladder.breach),
      ]);
      expect(fired.last.evaluation.verdict).toBe("triggered");
      expect(fired.last.evaluation.runMin).toBe(3);
    });

    it(`${ladder.name}: a clear minute breaks the chain back to zero`, () => {
      const g = guard(ladder.def);
      const broke = feed(g, [
        sampleAt(1, ladder.breach),
        sampleAt(2, ladder.breach),
        sampleAt(3, ladder.clear),
        sampleAt(4, ladder.breach),
      ]);
      expect(broke.verdicts).toEqual(["armed", "armed", "ok", "armed"]);
      expect(broke.last.evaluation.runMin).toBe(1);
    });

    it(`${ladder.name}: missing metric = unavailable, and it resets the chain`, () => {
      const g = guard(ladder.def);
      const blank = feed(g, [sampleAt(1, ladder.breach), sampleAt(2, {})]);
      expect(blank.verdicts).toEqual(["armed", "unavailable"]);
      // banking resumes from zero — never from the forgotten breach minute
      const resumed = evaluateGuardrail(g, sampleAt(3, ladder.breach), blank.last.evaluation.runMin);
      expect(resumed.evaluation.verdict).toBe("armed");
    });
  }
});

describe("boundary semantics are strict where the doc says strict", () => {
  it("freeCashDepleted: exactly 0 breaches, +1 µ$ clears, negatives breach", () => {
    const g = guard({ type: "freeCashDepleted", sustainedMin: 1 });
    expect(evaluateGuardrail(g, sampleAt(1, { "cash.free": cashFixed(0n) }), 0).evaluation.verdict).toBe("triggered");
    expect(evaluateGuardrail(g, sampleAt(1, { "cash.free": cashFixed(-42n) }), 0).evaluation.verdict).toBe("triggered");
    expect(evaluateGuardrail(g, sampleAt(1, { "cash.free": cashFixed(1n) }), 0).evaluation.verdict).toBe("ok");
  });

  it("totalOutage: servedRate must be EXACTLY zero", () => {
    const g = guard({ type: "totalOutage", sustainedMin: 1 });
    expect(evaluateGuardrail(g, sampleAt(1, { servedRate: 0n }), 0).evaluation.verdict).toBe("triggered");
    expect(evaluateGuardrail(g, sampleAt(1, { servedRate: 1n }), 0).evaluation.verdict).toBe("ok"); // 1/65536 per min still serves
  });

  it("cascadeCollapse is strictly greater than the threshold", () => {
    const g = guard({ type: "cascadeCollapse", degradedPctGt: 50, sustainedMin: 1 });
    expect(evaluateGuardrail(g, sampleAt(1, { nodesDegradedPct: percentToFixed(50) }), 0).evaluation.verdict).toBe("ok");
    expect(evaluateGuardrail(g, sampleAt(1, { nodesDegradedPct: percentToFixed(50.5) }), 0).evaluation.verdict).toBe("triggered");
  });

  it("ruleRunaway is strictly greater than the firings/min threshold", () => {
    const g = guard({ type: "ruleRunaway", firingsPerMinGt: guardFixedFromInt(30), sustainedMin: 1 });
    expect(evaluateGuardrail(g, sampleAt(1, { ruleFiringsPerMin: guardFixedFromInt(30) }), 0).evaluation.verdict).toBe("ok");
    expect(evaluateGuardrail(g, sampleAt(1, { ruleFiringsPerMin: guardFixedFromInt(31) }), 0).evaluation.verdict).toBe("triggered");
  });

  it("errorBudgetGone is ≤ the remaining-seconds threshold", () => {
    const g = guard({ type: "errorBudgetGone", remainingSecLte: guardFixedFromInt(3_600), sustainedMin: 1 });
    expect(evaluateGuardrail(g, sampleAt(1, { errorBudgetSec: guardFixedFromInt(3_600) }), 0).evaluation.verdict).toBe("triggered");
    expect(evaluateGuardrail(g, sampleAt(1, { errorBudgetSec: guardFixedFromInt(3_601) }), 0).evaluation.verdict).toBe("ok");
  });
});

describe("errorBudgetGone refuses to fire on an economy it cannot see", () => {
  it("errorBudgetAvailable:false ⇒ unavailable even with a zero metric present", () => {
    const g = guard({ type: "errorBudgetGone", sustainedMin: 1 });
    const s = sampleAt(1, { errorBudgetSec: 0n }, { errorBudgetAvailable: false });
    expect(evaluateGuardrail(g, s, 0).evaluation.verdict).toBe("unavailable");
  });
});

describe("threshold guard — the closed-vocab escape hatch", () => {
  it("all four comparators decide at equality exactly as named", () => {
    const at = fromInt(10);
    const mk = (comparator: string) =>
      guard({ type: "threshold", metric: "servedRate", comparator, value: at, sustainedMin: 1 });
    const s10 = sampleAt(1, { servedRate: fromInt(10) });
    expect(evaluateGuardrail(mk("lt"), s10, 0).evaluation.verdict).toBe("ok");
    expect(evaluateGuardrail(mk("lte"), s10, 0).evaluation.verdict).toBe("triggered");
    expect(evaluateGuardrail(mk("gt"), s10, 0).evaluation.verdict).toBe("ok");
    expect(evaluateGuardrail(mk("gte"), s10, 0).evaluation.verdict).toBe("triggered");
  });

  it("cash.free threshold reads the raw-µ$ carrier with exact sign", () => {
    const g = guard({ type: "threshold", metric: "cash.free", comparator: "lte", value: cashFixed(1_000_000n), sustainedMin: 1 });
    expect(evaluateGuardrail(g, sampleAt(1, { "cash.free": cashFixed(999_999n) }), 0).evaluation.verdict).toBe("triggered");
    expect(evaluateGuardrail(g, sampleAt(1, { "cash.free": cashFixed(1_000_001n) }), 0).evaluation.verdict).toBe("ok");
  });

  it("a threshold on errorBudgetSec obeys the same unavailable law", () => {
    const g = guard({ type: "threshold", metric: "errorBudgetSec", comparator: "lt", value: guardFixedFromInt(1), sustainedMin: 1 });
    expect(evaluateGuardrail(g, sampleAt(1, {}, { errorBudgetAvailable: false }), 0).evaluation.verdict).toBe("unavailable");
  });

  it("sustainedMin defaults to 1 at parse: a threshold breach is immediate", () => {
    const g = guard({ type: "threshold", metric: "servedRate", comparator: "lt", value: fromInt(5) });
    expect(g.sustainedMin).toBe(1);
    expect(evaluateGuardrail(g, sampleAt(1, { servedRate: fromInt(4) }), 0).evaluation.verdict).toBe("triggered");
  });
});
