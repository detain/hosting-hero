/**
 * unattended/guardrails.ts — the closed-vocabulary laws.
 * Rows-not-code: every deviation from the vocabularies (and every function
 * masquerading as a rule) throws GUARD_PARSE at the door.
 */
import { describe, expect, it } from "vitest";
import { FIXED_ONE, FIXED_ZERO, fromRatio } from "../../kernel/fixed.ts";
import {
  BUILTIN_CATASTROPHE_DEFS,
  GUARD_COMPARATORS,
  GUARD_KINDS,
  GUARD_METRICS,
  UnattendedError,
  guardFixedFromInt,
  guardKindCensus,
  guardReasonCode,
  parseCatastropheDef,
  parseGuardList,
  percentToFixed,
  ruleRunawayDefaultPerMin,
} from "../index.ts";
import { encodeTaggedGuard } from "../guardrails.ts";

function expectParseFail(raw: unknown, contains: string): void {
  let err: unknown = null;
  try {
    parseCatastropheDef(raw);
  } catch (e) {
    err = e;
  }
  const shown = JSON.stringify(raw, (_k, v) =>
    typeof v === "function" ? "fn" : typeof v === "bigint" ? `${String(v)}n` : v,
  );
  expect(err, `expected throw for ${String(shown)}`).toBeInstanceOf(UnattendedError);
  const ua = err as UnattendedError;
  expect(ua.code).toBe("GUARD_PARSE");
  expect(ua.message).toContain(contains);
}

describe("vocabularies are closed and frozen", () => {
  it("lists the five catastrophes + the threshold escape hatch", () => {
    expect([...GUARD_KINDS]).toEqual([
      "freeCashDepleted",
      "totalOutage",
      "cascadeCollapse",
      "ruleRunaway",
      "errorBudgetGone",
      "threshold",
    ]);
    expect(Object.isFrozen(GUARD_KINDS)).toBe(true);
    expect([...GUARD_METRICS]).toEqual([
      "cash.free",
      "servedRate",
      "nodesDegradedPct",
      "ruleFiringsPerMin",
      "errorBudgetSec",
    ]);
    expect([...GUARD_COMPARATORS]).toEqual(["lt", "lte", "gt", "gte"]);
  });

  it("every builtin def parses as-is and reports its kind", () => {
    for (const raw of Object.values(BUILTIN_CATASTROPHE_DEFS)) {
      expect(() => parseCatastropheDef(raw)).not.toThrow();
      const g = parseCatastropheDef(raw);
      expect(g.kind).toBe(raw.type);
      expect(g.reason).toBe(guardReasonCode(raw.type));
      expect(g.sustainedMin).toBe(raw.sustainedMin);
    }
  });
});

describe("builtin defaults (PROVISIONAL owner numbers) are complete guards", () => {
  it("bare {type} fills from the builtin table", () => {
    const outage = parseCatastropheDef({ type: "totalOutage" });
    expect(outage.def).toEqual(BUILTIN_CATASTROPHE_DEFS.totalOutage);
    const runaway = parseCatastropheDef({ type: "ruleRunaway" });
    expect(runaway.def).toEqual(BUILTIN_CATASTROPHE_DEFS.ruleRunaway);
    const cascade = parseCatastropheDef({ type: "cascadeCollapse" });
    expect(cascade.def).toEqual(BUILTIN_CATASTROPHE_DEFS.cascadeCollapse);
    expect(runawayDefaultIs30());
  });

  it("explicit fields override the builtin", () => {
    const g = parseCatastropheDef({ type: "totalOutage", sustainedMin: 5 });
    expect(g.sustainedMin).toBe(5);
    expect(g.def).toEqual({ type: "totalOutage", sustainedMin: 5 });
    const thr = parseCatastropheDef({
      type: "threshold",
      metric: "servedRate",
      comparator: "lt",
      value: guardFixedFromInt(100),
    });
    expect(thr.sustainedMin).toBe(1); // threshold default = one-tick breach
  });
});

function runawayDefaultIs30(): boolean {
  expect(ruleRunawayDefaultPerMin()).toBe(30);
  expect(BUILTIN_CATASTROPHE_DEFS.ruleRunaway.firingsPerMinGt).toBe(guardFixedFromInt(30));
  return true;
}

describe("fail-loud parse law", () => {
  it("refuses unknown guard kinds by name", () => {
    expectParseFail({ type: "meltdown", sustainedMin: 3 }, "unknown guard kind meltdown");
    expectParseFail({ type: "TotalOutage", sustainedMin: 3 }, "closed vocabulary");
    expectParseFail({}, "unknown guard kind undefined");
  });

  it("refuses unknown metrics and comparators on threshold guards", () => {
    expectParseFail(
      { type: "threshold", metric: "cpu.pwned", comparator: "lt", value: 1n },
      "unknown metric cpu.pwned",
    );
    expectParseFail(
      { type: "threshold", metric: "servedRate", comparator: "~=", value: 1n },
      "unknown comparator ~=",
    );
    expectParseFail(
      { type: "threshold", metric: "servedRate", comparator: "lt" },
      "needs an explicit value",
    );
  });

  it("refuses functions in config — rows-not-code law", () => {
    expectParseFail(
      { type: "threshold", metric: "servedRate", comparator: "lt", value: 1n, onFire: () => true },
      "functions are illegal",
    );
    // A callable THRESHOLD is a function wearing a value's clothes.
    const fnThreshold = (() => 42n) as unknown as bigint;
    expectParseFail(
      { type: "threshold", metric: "servedRate", comparator: "lt", value: fnThreshold },
      "functions are illegal",
    );
  });

  it("refuses non-object and array guards", () => {
    expectParseFail("totalOutage", "expected a guard object");
    expectParseFail(null, "expected a guard object");
    expectParseFail(["totalOutage"], "expected a guard object");
  });

  it("refuses broken sustainedMin / percent / number values", () => {
    expectParseFail({ type: "totalOutage", sustainedMin: 0 }, "sustainedMin");
    expectParseFail({ type: "totalOutage", sustainedMin: 2.5 }, "sustainedMin");
    expectParseFail({ type: "cascadeCollapse", degradedPctGt: 0 }, "degradedPctGt");
    expectParseFail({ type: "cascadeCollapse", degradedPctGt: 100 }, "degradedPctGt");
    expectParseFail({ type: "ruleRunaway", firingsPerMinGt: Number.NaN }, "firingsPerMinGt");
    expectParseFail(
      { type: "threshold", metric: "servedRate", comparator: "lt", value: "10" },
      "value",
    );
  });

  it("the 32767 wall: big money never rides guardFixedFromInt", () => {
    expect(() => guardFixedFromInt(32768)).toThrow(UnattendedError);
    expect(() => guardFixedFromInt(1_000_000)).toThrow(/overflows the Q16.16 raw range/);
    expect(guardFixedFromInt(32767)).toBe(32767n * FIXED_ONE);
    expect(guardFixedFromInt(-32768)).toBe(-32768n * FIXED_ONE);
    expect(() => guardFixedFromInt(1.5)).toThrow(UnattendedError);
  });
});

describe("parseGuardList", () => {
  it("keeps CALLER ORDER (first-listed wins the shared-tick race)", () => {
    const guards = parseGuardList([
      { type: "ruleRunaway", sustainedMin: 1 },
      { type: "totalOutage" },
      { type: "freeCashDepleted" },
    ]);
    expect(guards.map((g) => g.kind)).toEqual(["ruleRunaway", "totalOutage", "freeCashDepleted"]);
    expect(Object.isFrozen(guards)).toBe(true);
  });

  it("refuses exact-duplicate guards, tolerates field variants", () => {
    expect(() => parseGuardList([{ type: "totalOutage" }, { type: "totalOutage" }])).toThrow(/duplicate guard/);
    expect(() =>
      parseGuardList([
        { type: "totalOutage" },
        { type: "totalOutage", sustainedMin: 30 }, // same identity after defaults
      ]),
    ).toThrow(UnattendedError);
    expect(parseGuardList([
      { type: "totalOutage" },
      { type: "totalOutage", sustainedMin: 5 }, // variant = distinct row
    ])).toHaveLength(2);
  });

  it("an empty list parses to an empty frozen list (NO-GUARDS is legal)", () => {
    const guards = parseGuardList([]);
    expect(guards).toHaveLength(0);
    expect(Object.isFrozen(guards)).toBe(true);
  });
});

describe("encodeTaggedGuard fingerprints", () => {
  it("stably separates variants", () => {
    const a = parseCatastropheDef({ type: "totalOutage" }).def;
    const b = parseCatastropheDef({ type: "totalOutage", sustainedMin: 5 }).def;
    expect(encodeTaggedGuard(a)).not.toBe(encodeTaggedGuard(b));
    expect(encodeTaggedGuard(a)).toBe(encodeTaggedGuard(parseCatastropheDef({ type: "totalOutage" }).def));
  });

  it("threshold identity carries metric+comparator+value", () => {
    const t1 = parseCatastropheDef({ type: "threshold", metric: "servedRate", comparator: "lt", value: 10n });
    const t2 = parseCatastropheDef({ type: "threshold", metric: "servedRate", comparator: "lte", value: 10n });
    const t3 = parseCatastropheDef({ type: "threshold", metric: "cash.free", comparator: "lt", value: 10n });
    expect(encodeTaggedGuard(t1.def)).not.toBe(encodeTaggedGuard(t2.def));
    expect(encodeTaggedGuard(t1.def)).not.toBe(encodeTaggedGuard(t3.def));
  });
});

describe("percentToFixed (Q16.16 percent carrier)", () => {
  it("rides the PERCENT value in Q16.16 (the nodesDegradedPct carrier's unit)", () => {
    // The metric is a percent-as-Fixed observation (0…100.0), so the
    // comparison constant must be percent-as-Fixed too — apples to apples.
    expect(percentToFixed(0)).toBe(FIXED_ZERO);
    expect(percentToFixed(1)).toBe(65536n);
    expect(percentToFixed(50)).toBe(3276800n);
    expect(percentToFixed(100)).toBe(6553600n);
    expect(percentToFixed(25)).toBe(1638400n);
  });
  it("rounds the hundredths then truncates the fixed fold", () => {
    expect(percentToFixed(0.1)).toBe(6553n); // 10 hundredths × 65536 ÷ 100
  });
  it("preserves sign", () => {
    expect(percentToFixed(-50)).toBe(-3276800n);
  });
});

describe("parse is frozen and pure", () => {
  it("freezes the def, refuses caller mutation, and never shares mutable state", () => {
    const g = parseCatastropheDef({ type: "threshold", metric: "servedRate", comparator: "gte", value: 0n });
    expect(Object.isFrozen(g.def)).toBe(true);
    expect(() => {
      (g.def as { value: bigint }).value = 1n;
    }).toThrow();
  });

  it("accepts a bigint Fixed directly", () => {
    const g = parseCatastropheDef({
      type: "threshold",
      metric: "ruleFiringsPerMin",
      comparator: "gt",
      value: fromRatio(3n, 2n),
      sustainedMin: 2,
    });
    expect(g.def).toEqual({
      type: "threshold",
      metric: "ruleFiringsPerMin",
      comparator: "gt",
      value: 98304n,
      sustainedMin: 2,
    });
  });
});

describe("reason codes + census are stable", () => {
  it("guardReasonCode prefixes guard:", () => {
    for (const kind of GUARD_KINDS) expect(guardReasonCode(kind)).toBe(`guard:${kind}`);
  });

  it("guardKindCensus counts sorted kinds", () => {
    const guards = parseGuardList([
      { type: "totalOutage" },
      { type: "threshold", metric: "servedRate", comparator: "lt", value: 1n },
      { type: "threshold", metric: "cash.free", comparator: "lte", value: 0n },
    ]);
    const census = guardKindCensus(guards);
    expect([...census.keys()]).toEqual(["threshold", "totalOutage"]);
    expect(census.get("threshold")).toBe(2);
    expect(census.get("totalOutage")).toBe(1);
  });
});
