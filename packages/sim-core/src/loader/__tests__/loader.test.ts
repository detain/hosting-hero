/**
 * Boundary tests: float→Fixed exactness, µs/money exactness, unknown-field
 * rejection with path, enum/required/range failures, freeze, and a full
 * happy-path load of the fixture pair.
 */

import { describe, expect, test } from "vitest";
import { FIXED_ONE } from "../../kernel/fixed";
import {
  LoaderError,
  dollarsToMoney,
  msToUs,
  toFixed,
  toFixedUnit,
  toSafeInt,
} from "../boundary";
import { loadTypeBundle, stableSerialize } from "../bundle";
import { cloneJson, fixtureRaw, ALPHA, BETA } from "./helpers";

describe("numeric boundary — floats never enter loaded state", () => {
  test("JSON 0.1 becomes the exact Q16.16 Fixed 6554 (round-half-away of 6553.6)", () => {
    expect(toFixed(0.1, "x")).toBe(6554n);
  });

  test("whole + fraction round-trips: 3000 → 196608000, 1.5 → 98304, 0.999 → 65470", () => {
    expect(toFixed(3000, "x")).toBe(196_608_000n);
    expect(toFixed(1.5, "x")).toBe(98_304n);
    expect(toFixed(0.999, "x")).toBe(65_470n); // 65470.464 → half-AWAY, not to-even
  });

  test("toFixedUnit keeps [0,1], rejects 1.2 with the path named", () => {
    expect(toFixedUnit(0.5, "x")).toBe(32_768n);
    expect(() => toFixedUnit(1.2, "threats.familyWeights.human")).toThrow(LoaderError);
    try {
      toFixedUnit(1.2, "threats.familyWeights.human");
    } catch (error) {
      const e = error as LoaderError;
      expect(e.code).toBe("OUT_OF_RANGE");
      expect(e.path).toBe("threats.familyWeights.human");
    }
  });

  test("ms budgets land in integer µs exactly: 90ms → 90000µs; 0.0001ms fails SUB_MICROSECOND_RESOLUTION", () => {
    expect(msToUs(90, "x")).toBe(90_000n);
    expect(msToUs(0.5, "x")).toBe(500n);
    expect(() => msToUs(0.0001, "visitor.patienceModel.params.budgetMs")).toThrow(LoaderError);
    try {
      msToUs(0.0001, "b");
    } catch (error) {
      expect((error as LoaderError).code).toBe("SUB_MICROSECOND_RESOLUTION");
    }
  });

  test("money is bigint µ$: $1.50 → 1500000µ$, sub-µ$ fails loud", () => {
    expect(dollarsToMoney(1.5, "x")).toBe(1_500_000n);
    expect(dollarsToMoney(-40, "x")).toBe(-40_000_000n);
    try {
      dollarsToMoney(0.0000001, "price");
      expect.unreachable();
    } catch (error) {
      expect((error as LoaderError).code).toBe("SUB_MICROUSD_RESOLUTION");
    }
  });

  test("counts must be safe integers: 3.5 pips rejected, huge numbers rejected", () => {
    expect(toSafeInt(3, "x", 0, 7)).toBe(3);
    expect(() => toSafeInt(3.5, "visitor.cohortSpawn.tier", 0, 7)).toThrow(/integer/);
    expect(() => toSafeInt(2 ** 60, "n", 0, 7)).toThrow(LoaderError);
  });

  test("the loaded fixture holds bigints where the wire held numbers", () => {
    const bundle = ALPHA();
    expect(typeof bundle.visitor.stats.weight).toBe("bigint");
    expect(bundle.visitor.stats.weight).toBe(6554n);
    expect(bundle.visitor.patienceParams.budgetUs).toBe(90_000n);
    expect(bundle.visitor.patienceParams.bounceSigmoid).toEqual([39_322n, 65_536n, 104_858n]);
    expect(bundle.economy.ticketsPerCustomer).toBe(98_304n);
    expect(bundle.goal.winThreshold).toBe(65_470n);
    expect(bundle.economy.fifthAxisWeight).toBe(16_384n);
    expect(bundle.threats.familyWeights.malicious).toBe(FIXED_ONE / 2n);
    expect(stableSerialize(bundle.visitor.stats.weight)).toBe("6554n");
  });
});

describe("structure — unknown / missing / mistyped fields fail loud with paths", () => {
  test("unknown nested field rejected naming its full dotted path", () => {
    const raw = cloneJson(fixtureRaw("minimal-alpha.json"));
    (raw.visitor as Record<string, unknown>)["turboMode"] = true;
    try {
      loadTypeBundle(raw);
      expect.unreachable("must reject undeclared fields");
    } catch (error) {
      const e = error as LoaderError;
      expect(e.code).toBe("UNKNOWN_FIELD");
      expect(e.path).toBe("visitor.turboMode");
    }
  });

  test("unknown root field rejected too", () => {
    const raw = cloneJson(fixtureRaw("minimal-alpha.json"));
    raw["extraCredit"] = "nope";
    expect(() => loadTypeBundle(raw)).toThrow(/UNKNOWN_FIELD.*extraCredit/);
  });

  test("convention keys _todo / tuningSheet are stripped, not rejected", () => {
    const bundle = ALPHA(); // fixture carries a root _todo
    expect("_todo" in bundle).toBe(false);
    expect("tuningSheet" in bundle.visitor.stats).toBe(false);
  });

  test("missing required field names its path", () => {
    const raw = cloneJson(fixtureRaw("minimal-alpha.json"));
    delete raw["guardrails"];
    try {
      loadTypeBundle(raw);
      expect.unreachable();
    } catch (error) {
      const e = error as LoaderError;
      expect(e.code).toBe("MISSING_FIELD");
      expect(e.path).toBe("guardrails");
    }
  });

  test("bad enum value lists legal choices", () => {
    const raw = cloneJson(fixtureRaw("minimal-alpha.json"));
    raw.tempo = { ...(raw.tempo as object), simTimeScale: "fortnights" };
    try {
      loadTypeBundle(raw);
      expect.unreachable();
    } catch (error) {
      expect((error as LoaderError).code).toBe("BAD_ENUM");
      expect((error as Error).message).toMatch(/\[ms, µs, s, hours, years\]/);
    }
  });

  test("fractional number inside eraOverrides is refused (opaque surface stays float-free)", () => {
    const raw = cloneJson(fixtureRaw("minimal-alpha.json"));
    raw.eras = {
      availableFrom: "1996",
      obsoleteBy: null,
      eraOverrides: { "1999": { slip: 0.5 } },
    };
    try {
      loadTypeBundle(raw);
      expect.unreachable();
    } catch (error) {
      expect((error as LoaderError).code).toBe("NOT_A_SAFE_INTEGER");
      expect((error as LoaderError).path).toBe("eras.eraOverrides.1999.slip");
    }
  });

  test("malformed id pattern and non-4-digit era year rejected", () => {
    const badId = cloneJson(fixtureRaw("minimal-alpha.json"));
    badId["id"] = "Official:Bad Id";
    expect(() => loadTypeBundle(badId)).toThrow(/BAD_PATTERN/);
    const badEra = cloneJson(fixtureRaw("minimal-alpha.json"));
    badEra["eras"] = { availableFrom: "96", obsoleteBy: null, eraOverrides: {} };
    expect(() => loadTypeBundle(badEra)).toThrow(/BAD_PATTERN/);
  });
});

describe("loaded state is trusted and immutable", () => {
  test("deep freeze: assignment throws in strict mode", () => {
    const bundle = ALPHA();
    expect(Object.isFrozen(bundle)).toBe(true);
    expect(Object.isFrozen(bundle.skin.lodContract)).toBe(true);
    expect(() => {
      (bundle as { id: string }).id = "mutant";
    }).toThrow(TypeError);
  });

  test("optional surfaces normalize to explicit nulls / defaults", () => {
    const bundle = BETA();
    expect(bundle.goal.winMetric).toBeNull(); // winCondition.metric absent
    expect(bundle.goal.winThreshold).toBeNull();
    expect(bundle.relations.antagonisms[0]?.resource).toBe("ram-slot");
    expect(bundle.buildables.archetypeInstances[1]?.skin).toBeNull(); // skin absent in wire
    expect(bundle.economy.chargebackRate).toBeUndefined(); // extension not present
    expect(bundle.visitor.archetypeRefs).toEqual(["browser-guest", "latency-goblin"]);
  });
});
