/** sellVerdicts.test.ts — the Act III rung (wave twenty-six): the scenario
 *  vocabulary grows `sell-accepted-above` / `sell-refused-above`, counting the
 *  money lane's sell-book ADJUDICATION notices (`economy/sell.ts` step 5.5).
 *  The law the whole file guards is ACCEPTANCE ≠ EXECUTION: a `sell-offer`
 *  intent the door books only earns a verdict once the fold weighs it against
 *  an installed-base anchor (a registered contract's price-key MRC), so the
 *  observation key is sparse (absent while no verdict has landed), the pair
 *  rides the strict `>` counting law (a `count: N` arm fires at N+1), and an
 *  executed-but-unadjudicated offer provably never moves it. */
import { describe, expect, it } from "vitest";

import {
  EMPTY_OBSERVATION,
  SCENARIO_PREDICATE_KINDS,
  SHIPPED_SCENARIO_IDS,
  ScenarioError,
  objectiveHolds,
  objectiveLine,
  objectiveProgress,
  parseScenarioDoc,
  runScenario,
  shippedScenario,
} from "../index.ts";
import type { ObjectivePredicate, ScenarioObservation } from "../index.ts";
import { FIXED_ONE, FIXED_ZERO } from "../../kernel/fixed.ts";
import { asRunSeed } from "../../types.ts";
import { corpusAuthority } from "./corpusFixtures.ts";

const BASE_SEED = asRunSeed(904n);

function acceptedAbove(count: number): ObjectivePredicate {
  return Object.freeze({ kind: "sell-accepted-above", count });
}

function refusedAbove(count: number): ObjectivePredicate {
  return Object.freeze({ kind: "sell-refused-above", count });
}

/** An observation carrying a planted verdict census — the exact frozen shape
 *  the runner's snapshotObservation mints (key conditional, never undefined). */
function obsWith(sellVerdicts: { readonly accepted: number; readonly refused: number }): ScenarioObservation {
  return Object.freeze({ ...EMPTY_OBSERVATION, sellVerdicts });
}

/** Surgery-friendly mirror (doc.test.ts shape): tests mutate PLAIN JSON, then
 *  re-cross the wall. */
type MutableWire = {
  objectives: { win: unknown[]; lose: unknown[] };
  [key: string]: unknown;
};

function drillWire(win: unknown[]): MutableWire {
  return JSON.parse(
    JSON.stringify({
      schema: "hh-scenario@1",
      id: "sell-drill",
      name: "Sell Drill",
      brief: "A board-only drill for the sell pair's parse walls.",
      specRef: "§1.5 exit-chapter verdict grammar",
      specLine: 4014,
      board: { nodes: [{ id: "web-1", slots: 40, serviceTimeUs: 2000000 }], edges: [] },
      contracts: [],
      traffic: { tableId: "drill", segments: [{ fromMinute: 0, ratePerMin: 10 }] },
      objectives: { win, lose: [] },
      limits: { maxSimMinutes: 120, initialFreeMicroUsd: 0, opex: [] },
    }),
  ) as MutableWire;
}

function wall(code: string, fn: () => unknown): ScenarioError {
  try {
    fn();
  } catch (e) {
    expect(e).toBeInstanceOf(ScenarioError);
    const err = e as ScenarioError;
    expect(err.code).toBe(code);
    return err;
  }
  throw new Error(`expected a throw with code ${code}`);
}

/** The LIVE sell rail: two signed contracts anchor price keys `plan:basic`
 *  ($10 MRC) and `plan:premium` ($40 MRC); the rail books one deep-below-market
 *  offer (µ$0.001 against the $10 anchor ⇒ acceptance ceiling 95%) and one
 *  deep-above offer (µ$400,000 against the $40 anchor ⇒ refusal floor 90%) —
 *  which die lands which side is seed-owned, honestly pinned per offset below. */
function sellWire(priceKeyless: boolean): Record<string, unknown> {
  return JSON.parse(
    JSON.stringify({
      schema: "hh-scenario@1",
      id: "sell-live",
      name: "Sell Live",
      brief: "Two offers against installed-base anchors.",
      specRef: "§1.5 exit-chapter verdict grammar",
      specLine: 4014,
      board: { nodes: [{ id: "web-1", slots: 40, serviceTimeUs: 2000000 }], edges: [] },
      contracts: [
        {
          id: "anchor-basic",
          mrcMicroUsd: "10000000",
          termEndMin: 5760,
          billingCycle: "monthly",
          ...(priceKeyless ? {} : { priceKey: "plan:basic" }),
        },
        {
          id: "anchor-premium",
          mrcMicroUsd: "40000000",
          termEndMin: 5760,
          billingCycle: "monthly",
          ...(priceKeyless ? {} : { priceKey: "plan:premium" }),
        },
      ],
      traffic: { tableId: "drill", segments: [{ fromMinute: 0, ratePerMin: 1 }] },
      intents: [
        {
          atTick: 3,
          verb: "sell-offer",
          args: {
            targetKind: "plan",
            targetId: "basic",
            offerPriceMicroUsd: "1000",
            termMonths: 12,
            effectiveAtBusinessMinute: null,
          },
        },
        {
          atTick: 4,
          verb: "sell-offer",
          args: {
            targetKind: "plan",
            targetId: "premium",
            offerPriceMicroUsd: "400000000000",
            termMonths: 12,
            effectiveAtBusinessMinute: null,
          },
        },
      ],
      objectives: {
        win: [acceptedAbove(0), refusedAbove(0)],
        lose: [],
      },
      limits: { maxSimMinutes: 60, initialFreeMicroUsd: 0, opex: [] },
    }),
  ) as Record<string, unknown>;
}

describe("the sell pair — objectiveHolds truth table", () => {
  it("an absent sellVerdicts key reads zero — never throws, never holds", () => {
    expect(EMPTY_OBSERVATION.sellVerdicts).toBeUndefined();
    expect(objectiveHolds(EMPTY_OBSERVATION, acceptedAbove(0))).toBe(false);
    expect(objectiveHolds(EMPTY_OBSERVATION, refusedAbove(0))).toBe(false);
  });

  it("above is STRICT — a count: N arm fires at N+1", () => {
    const obs = obsWith({ accepted: 1, refused: 2 });
    expect(objectiveHolds(obs, acceptedAbove(0))).toBe(true); // 1 > 0
    expect(objectiveHolds(obs, acceptedAbove(1))).toBe(false); // 1 > 1 FALSE
    expect(objectiveHolds(obs, refusedAbove(0))).toBe(true);
    expect(objectiveHolds(obs, refusedAbove(1))).toBe(true); // 2 > 1
    expect(objectiveHolds(obs, refusedAbove(2))).toBe(false); // 2 > 2 FALSE
  });

  it("a present all-zero census is still zero", () => {
    const obs = obsWith({ accepted: 0, refused: 0 });
    expect(objectiveHolds(obs, acceptedAbove(0))).toBe(false);
    expect(objectiveHolds(obs, refusedAbove(0))).toBe(false);
  });
});

describe("the sell pair — objectiveLine + progress", () => {
  it("the line renders the stable kind:count grammar (stopReason carrier)", () => {
    expect(objectiveLine(acceptedAbove(0))).toBe("sell-accepted-above:0");
    expect(objectiveLine(refusedAbove(3))).toBe("sell-refused-above:3");
  });

  it("progress counts verdicts up toward the line — Q16.16, never past", () => {
    expect(objectiveProgress(EMPTY_OBSERVATION, acceptedAbove(0)).progress).toBe(FIXED_ZERO);
    const first = objectiveProgress(obsWith({ accepted: 1, refused: 0 }), acceptedAbove(0));
    expect(first.holds).toBe(true);
    expect(first.progress).toBe(FIXED_ONE);
    const half = objectiveProgress(obsWith({ accepted: 1, refused: 0 }), acceptedAbove(1));
    expect(half.holds).toBe(false);
    expect(half.progress).toBe(32768n); // exactly half of FIXED_ONE (65536)
  });
});

describe("the sell pair — parse walls", () => {
  it("the pair parses; count 0 is the legal open line for an above arm", () => {
    const doc = parseScenarioDoc(
      drillWire([{ kind: "sell-accepted-above", count: 0 }, { kind: "sell-refused-above", count: 5 }]),
    );
    expect(doc.objectives.win).toEqual([
      { kind: "sell-accepted-above", count: 0 },
      { kind: "sell-refused-above", count: 5 },
    ]);
    expect(Object.isFrozen(doc.objectives.win[0])).toBe(true);
  });

  it("bad counts refuse loudly at the count path", () => {
    for (const value of ["x", -1, 1_000_001, 3.5, null]) {
      const err = wall("BAD_PREDICATE", () => parseScenarioDoc(drillWire([{ kind: "sell-accepted-above", count: value }])));
      expect(err.message, JSON.stringify(value)).toContain("objectives.win[0].count");
    }
  });

  it("the pair accepts only kind and count — the rung-9 verb dim is not borrowed", () => {
    const err = wall("BAD_PREDICATE", () =>
      parseScenarioDoc(drillWire([{ kind: "sell-refused-above", count: 0, verb: "sell-offer" }])),
    );
    expect(err.message).toContain("accepts only");
    expect(err.message).toContain("objectives.win[0].verb");
  });

  it("the below twins DO NOT exist — UNKNOWN_KIND enumerates the closed set", () => {
    const err = wall("UNKNOWN_KIND", () => parseScenarioDoc(drillWire([{ kind: "sell-accepted-below", count: 0 }])));
    expect(err.message).toContain("sell-accepted-above");
    expect(err.message).toContain("sell-refused-above");
    expect(err.message).toContain(`legal: ${SCENARIO_PREDICATE_KINDS.join(", ")}`);
    expect(SCENARIO_PREDICATE_KINDS).toHaveLength(31);
  });
});

describe("the sparse law — the key is absent while no verdict lands", () => {
  it("every shipped wire's 12-minute arm carries NO sellVerdicts key", () => {
    for (const id of [...SHIPPED_SCENARIO_IDS]) {
      const report = runScenario(shippedScenario(id), BASE_SEED, { tickCap: 12, corpus: corpusAuthority() });
      expect(Object.hasOwn(report.observation, "sellVerdicts"), id).toBe(false);
    }
  });

  it("mint-time: a sell rail that never reached its ticks keeps the key absent", () => {
    const doc = parseScenarioDoc(sellWire(false));
    const report = runScenario(doc, BASE_SEED, { tickCap: 2 });
    expect(report.observation.intentsExecuted).toBe(0);
    expect(Object.hasOwn(report.observation, "sellVerdicts")).toBe(false);
  });
});

describe("LIVE falsifier — verdicts through the real sell book", () => {
  it("offset 0: one accepted + one refused adjudicate — and the NEW predicates drive the win stop", () => {
    const doc = parseScenarioDoc(sellWire(false));
    const report = runScenario(doc, BASE_SEED, { seedOffset: 0 });
    // Both arms win ONLY once the pair exists — the stop law read the verdicts.
    expect(report.outcome).toBe("won");
    // Wave-26 AC-B: the win line carries sell-accepted-above, so the
    // verdict-observed exit grammar names it (runner.ts; the §9.9 exit
    // ending's carrier — disclosed re-pin of the plain "win@4" stamp).
    expect(report.stopReason).toBe("win:sell-accepted-above:0@4");
    expect(report.endTick).toBe(4n);
    expect(report.observation.sellVerdicts).toEqual({ accepted: 1, refused: 1 });
    expect(report.observation.intentsExecuted).toBe(2);
    expect(report.observation.intentsRefused).toBe(0);
    expect(report.trace.noticesByKind["sell-accepted"]).toBe(1);
    expect(report.trace.noticesByKind["sell-refused"]).toBe(1);
    // The strict-> law on the LIVE observation, both kinds:
    expect(objectiveHolds(report.observation, acceptedAbove(0))).toBe(true);
    expect(objectiveHolds(report.observation, acceptedAbove(1))).toBe(false);
    expect(objectiveHolds(report.observation, refusedAbove(0))).toBe(true);
    expect(objectiveHolds(report.observation, refusedAbove(1))).toBe(false);
  });

  it("offset 5: the refusal-heavy die — accepted stays zero, refused twin counts two", () => {
    const doc = parseScenarioDoc(sellWire(false));
    const report = runScenario(doc, BASE_SEED, { seedOffset: 5 });
    expect(report.outcome).toBe("timeout");
    expect(report.stopReason).toBe("timeout@60");
    expect(report.observation.sellVerdicts).toEqual({ accepted: 0, refused: 2 });
    expect(objectiveHolds(report.observation, acceptedAbove(0))).toBe(false);
    expect(objectiveHolds(report.observation, refusedAbove(1))).toBe(true); // 2 > 1
    expect(objectiveHolds(report.observation, refusedAbove(2))).toBe(false);
  });

  it("offset 7: the acceptance-heavy die — mirrored arms", () => {
    const doc = parseScenarioDoc(sellWire(false));
    const report = runScenario(doc, BASE_SEED, { seedOffset: 7 });
    expect(report.outcome).toBe("timeout");
    expect(report.stopReason).toBe("timeout@60");
    expect(report.observation.sellVerdicts).toEqual({ accepted: 2, refused: 0 });
    expect(objectiveHolds(report.observation, acceptedAbove(1))).toBe(true); // 2 > 1
    expect(objectiveHolds(report.observation, acceptedAbove(2))).toBe(false);
    expect(objectiveHolds(report.observation, refusedAbove(0))).toBe(false);
  });

  it("ANTI-LIE: an executed sell-offer with no anchor NEVER reads as acceptance", () => {
    // The priceKeyless contracts leave the offers unadjudicated: the door
    // books them (receipts rise) but the fold mints no verdict, no notice.
    const doc = parseScenarioDoc(sellWire(true));
    const report = runScenario(doc, BASE_SEED, {});
    expect(report.outcome).toBe("timeout");
    expect(report.stopReason).toBe("timeout@60");
    expect(report.observation.intentsExecuted).toBe(2);
    expect(objectiveHolds(report.observation, Object.freeze({ kind: "intents-executed-above", count: 0 }))).toBe(true);
    // …while the acceptance predicates stay stone dead, key absent entirely:
    expect(Object.hasOwn(report.observation, "sellVerdicts")).toBe(false);
    expect(objectiveHolds(report.observation, acceptedAbove(0))).toBe(false);
    expect(objectiveHolds(report.observation, refusedAbove(0))).toBe(false);
    expect(report.trace.noticesByKind["sell-accepted"]).toBeUndefined();
    expect(report.trace.noticesByKind["sell-refused"]).toBeUndefined();
  });
});

describe("determinism ×100 — the verdict-fed report", () => {
  it("offset 0 replays byte-identically, sellVerdicts included", () => {
    const doc = parseScenarioDoc(sellWire(false));
    const identities = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      const report = runScenario(doc, BASE_SEED, { seedOffset: 0 });
      identities.add(`${report.endDigest}|${report.stopReason}|${JSON.stringify(report.observation.sellVerdicts)}`);
      expect(report.observation.sellVerdicts).toEqual({ accepted: 1, refused: 1 });
    }
    expect(identities.size).toBe(1);
  });
});
