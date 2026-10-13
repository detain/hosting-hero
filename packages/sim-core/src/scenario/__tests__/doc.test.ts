/** doc.test.ts — the document wall: every closed vocabulary must refuse
 *  illegal shapes loudly, with the `scenario[CODE] at 'path': detail`
 *  grammar, and accept the honest ones. */
import { describe, expect, it } from "vitest";

import {
  SCENARIO_BRIEF_MAX_CHARS,
  SCENARIO_MAX_MINUTES_CAP,
  SCENARIO_PREDICATE_KINDS,
  ScenarioError,
  parseMoneyWire,
  parseScenarioDoc,
  scenarioContractId,
  scenarioSeed,
} from "../index.ts";
import { asRunSeed } from "../../types.ts";

/** Surgery-friendly mirror of the wire record (the parsed ScenarioWire type
 *  is readonly by law; tests mutate PLAIN JSON then re-cross the wall). */
type MutableWire = {
  schema: string;
  id: string;
  name: string;
  brief: string;
  specRef: string;
  specLine?: number;
  board: unknown;
  contracts: unknown[];
  traffic: unknown;
  objectives: { win: unknown[]; lose: unknown[] };
  limits: {
    maxSimMinutes: number;
    initialFreeMicroUsd: unknown;
    opex: unknown[];
    guardrails?: unknown[];
  };
};

function minimalWire(): MutableWire {
  return JSON.parse(
    JSON.stringify({
      schema: "hh-scenario@1",
      id: "drill-one",
      name: "Drill One",
      brief: "A board-only drill with no contracts.",
      specRef: "§1.5 The Long Weekend",
      specLine: 3646,
      board: { nodes: [{ id: "web-1", slots: 40, serviceTimeUs: 2000000 }], edges: [] },
      contracts: [],
      traffic: { tableId: "drill", segments: [{ fromMinute: 0, ratePerMin: 10 }] },
      objectives: { win: [{ kind: "survive-minutes", minutes: 60 }], lose: [] },
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

describe("parseScenarioDoc — the happy path", () => {
  it("parses, freezes and reports the trusted shape", () => {
    const doc = parseScenarioDoc(minimalWire());
    expect(doc.schemaVersion).toBe(1);
    expect(doc.id).toBe("drill-one");
    expect(Object.isFrozen(doc)).toBe(true);
    expect(doc.board.nodes.length).toBe(1);
    expect(doc.limits.dunningEngineOwned).toBe(true); // the documented default
    expect(doc.limits.handCapacity).toBe(2);
    expect(doc.specLine).toBe(3646);
  });

  it("round-trips through JSON untouched (wire is plain-JSON by law)", () => {
    const wire = minimalWire();
    expect(JSON.parse(JSON.stringify(wire))).toEqual(wire);
    expect(() => parseScenarioDoc(JSON.parse(JSON.stringify(wire)))).not.toThrow();
  });

  it("accepts bigint-mirror money as decimal strings", () => {
    const wire = minimalWire();
    wire.limits.initialFreeMicroUsd = "12345678901234567890123" as never;
    const doc = parseScenarioDoc(wire);
    expect(doc.limits.initialFreeMicroUsd).toBe(12345678901234567890123n);
  });
});

describe("parseScenarioDoc — the wall refuses", () => {
  it("a foreign schema version", () => {
    const wire = minimalWire();
    wire.schema = "hh-scenario@2";
    expect(wall("BAD_VERSION", () => parseScenarioDoc(wire)).message).toContain("hh-scenario@1");
  });

  it("a missing required section", () => {
    const wire = minimalWire() as unknown as Record<string, unknown>;
    delete wire.traffic;
    expect(wall("BAD_RECORD", () => parseScenarioDoc(wire)).message).toContain("traffic");
  });

  it("an unknown top-level key (closed record)", () => {
    const wire = minimalWire() as unknown as Record<string, unknown>;
    wire.difficulty = "nightmare";
    expect(wall("BAD_RECORD", () => parseScenarioDoc(wire)).message).toContain("difficulty");
  });

  it("a non-slug id", () => {
    const wire = minimalWire();
    wire.id = "Drill One!";
    expect(wall("BAD_ID", () => parseScenarioDoc(wire)).path).toContain(".id");
  });

  it("a brief over the mission-blurb wall", () => {
    const wire = minimalWire();
    wire.brief = "x".repeat(SCENARIO_BRIEF_MAX_CHARS + 1);
    expect(wall("BAD_BRIEF", () => parseScenarioDoc(wire)).message).toContain(`${SCENARIO_BRIEF_MAX_CHARS}`);
  });

  it("a specRef that does not cite §1.5", () => {
    const wire = minimalWire();
    wire.specRef = "§9.13 gate five";
    expect(wall("BAD_SPEC", () => parseScenarioDoc(wire)).message).toContain("§1.5");
  });

  it("a duplicate contract id", () => {
    const wire = minimalWire();
    const contract = {
      id: "dup",
      mrcMicroUsd: 288_000_000,
      billingCycle: "monthly" as const,
      termMonths: 12,
      termEndMin: 43_200,
    };
    wire.contracts = [contract, { ...contract }];
    wire.limits.maxSimMinutes = 420;
    expect(wall("DUPLICATE", () => parseScenarioDoc(wire)).message).toContain("dup");
  });

  it("an unknown predicate kind (the loader guard the mission demands)", () => {
    const wire = minimalWire();
    (wire.objectives.win[0] as Record<string, unknown>).kind = "moonshots-above";
    (wire.objectives.win[0] as Record<string, unknown>).count = 3;
    const err = wall("UNKNOWN_KIND", () => parseScenarioDoc(wire));
    expect(err.message).toContain("moonshots-above");
    for (const kind of SCENARIO_PREDICATE_KINDS) expect(err.message).toContain(kind);
  });

  it("a predicate with a stray field", () => {
    const wire = minimalWire();
    (wire.objectives.win[0] as Record<string, unknown>).tolerance = 0.5;
    expect(wall("BAD_PREDICATE", () => parseScenarioDoc(wire)).path).toContain("tolerance");
  });

  it("a death cause outside the closed OD-25(a) enum", () => {
    const wire = minimalWire();
    wire.objectives.lose = [{ kind: "death-by-cause", cause: "audacity" } as never];
    expect(wall("BAD_ENUM", () => parseScenarioDoc(wire)).message).toContain("float-insolvency");
  });

  it("a burn scheduled after the clock stops", () => {
    const wire = minimalWire();
    wire.limits.opex = [{ atMinute: 121, amountMicroUsd: 1, memo: "late" }];
    expect(wall("BAD_LIMITS", () => parseScenarioDoc(wire)).message).toContain("m121");
  });

  it("a cliff that can never play inside the clock", () => {
    const wire = minimalWire();
    wire.contracts = [
      {
        id: "far",
        mrcMicroUsd: 288_000_000,
        billingCycle: "monthly",
        termMonths: 12,
        termEndMin: 86_400,
      } as never,
    ];
    wire.limits.maxSimMinutes = 120;
    expect(wall("BAD_CONTRACT", () => parseScenarioDoc(wire)).message).toContain("never play");
  });

  it("a negative burn", () => {
    const wire = minimalWire();
    wire.limits.opex = [{ atMinute: 5, amountMicroUsd: -1, memo: "gift" }];
    expect(wall("BAD_MONEY", () => parseScenarioDoc(wire)).message).toContain("non-negative");
  });

  it("a maxSimMinutes past the module cap", () => {
    const wire = minimalWire();
    wire.limits.maxSimMinutes = SCENARIO_MAX_MINUTES_CAP + 1;
    expect(wall("BAD_LIMITS", () => parseScenarioDoc(wire)).path).toContain("maxSimMinutes");
  });

  it("a zero-minute survive (vacuous win)", () => {
    const wire = minimalWire();
    wire.objectives.win = [{ kind: "survive-minutes", minutes: 0 }];
    expect(wall("BAD_PREDICATE", () => parseScenarioDoc(wire)).path).toContain("minutes");
  });

  it("an empty win set (a mission you cannot complete)", () => {
    const wire = minimalWire();
    wire.objectives.win = [];
    expect(wall("BAD_OBJECTIVES", () => parseScenarioDoc(wire)).path).toContain(".win");
  });
});

describe("wave-three predicates — rungs 1–3 keep the closed-vocab wall", () => {
  function win(wire: MutableWire, predicate: unknown): void {
    wire.objectives.win = [predicate];
  }

  it("a written-off-below of zero (vacuous ceiling, same law as churn)", () => {
    const wire = minimalWire();
    win(wire, { kind: "written-off-below", count: 0 });
    expect(wall("BAD_PREDICATE", () => parseScenarioDoc(wire)).path).toContain("count");
  });

  it("a written-off-above of minus one", () => {
    const wire = minimalWire();
    win(wire, { kind: "written-off-above", count: -1 });
    expect(wall("BAD_PREDICATE", () => parseScenarioDoc(wire)).path).toContain("count");
  });

  it("a delta window naming a metric that is not on the trusted record", () => {
    const wire = minimalWire();
    win(wire, { kind: "metric-delta-over-window", metric: "revenue", windowMinutes: 60, minDeltaPct: 25 });
    expect(wall("BAD_ENUM", () => parseScenarioDoc(wire)).message).toContain("arrivals");
  });

  it("a delta window of zero minutes", () => {
    const wire = minimalWire();
    win(wire, { kind: "metric-delta-over-window", metric: "served", windowMinutes: 0, minDeltaPct: 25 });
    expect(wall("BAD_PREDICATE", () => parseScenarioDoc(wire)).path).toContain("windowMinutes");
  });

  it("a delta window wider than the module cap", () => {
    const wire = minimalWire();
    win(wire, {
      kind: "metric-delta-over-window",
      metric: "served",
      windowMinutes: SCENARIO_MAX_MINUTES_CAP + 1,
      minDeltaPct: 25,
    });
    expect(wall("BAD_PREDICATE", () => parseScenarioDoc(wire)).path).toContain("windowMinutes");
  });

  it("a delta that demands zero improvement (an always-true objective)", () => {
    const wire = minimalWire();
    win(wire, { kind: "metric-delta-over-window", metric: "served", windowMinutes: 60, minDeltaPct: 0 });
    expect(wall("BAD_PREDICATE", () => parseScenarioDoc(wire)).path).toContain("minDeltaPct");
  });

  it("a delta past ten thousand percent", () => {
    const wire = minimalWire();
    win(wire, { kind: "metric-delta-over-window", metric: "served", windowMinutes: 60, minDeltaPct: 10_001 });
    expect(wall("BAD_PREDICATE", () => parseScenarioDoc(wire)).path).toContain("minDeltaPct");
  });

  it("a family predicate with an off-registry family", () => {
    const wire = minimalWire();
    win(wire, { kind: "family-arrivals-below", family: "extraterrestrial", count: 10 });
    expect(wall("BAD_ENUM", () => parseScenarioDoc(wire)).message).toContain("customerAsThreat");
  });

  it("a family-arrivals-below of zero (vacuous, same law)", () => {
    const wire = minimalWire();
    win(wire, { kind: "family-arrivals-below", family: "organic", count: 0 });
    expect(wall("BAD_PREDICATE", () => parseScenarioDoc(wire)).path).toContain("count");
  });

  it("a stray field on a delta row (the wall covers the new shapes too)", () => {
    const wire = minimalWire();
    win(wire, {
      kind: "metric-delta-over-window",
      metric: "served",
      windowMinutes: 60,
      minDeltaPct: 25,
      smoothing: "ewma",
    });
    expect(wall("BAD_PREDICATE", () => parseScenarioDoc(wire)).path).toContain("smoothing");
  });

  it("a traffic segment with an unknown family label", () => {
    const wire = minimalWire();
    wire.traffic = {
      tableId: "drill",
      segments: [{ fromMinute: 0, ratePerMin: 10, family: "chaos" }],
    };
    expect(wall("BAD_ENUM", () => parseScenarioDoc(wire)).message).toContain("malicious");
  });

  it("accepts the honest shapes and defaults the segment family to organic", () => {
    const wire = minimalWire();
    wire.traffic = {
      tableId: "drill",
      segments: [
        { fromMinute: 0, ratePerMin: 10 },
        { fromMinute: 30, ratePerMin: 20, family: "malicious" },
      ],
    };
    win(wire, { kind: "metric-delta-over-window", metric: "invoices-settled", windowMinutes: 45, minDeltaPct: 500 });
    wire.objectives.lose = [
      { kind: "written-off-above", count: 6 },
      { kind: "family-arrivals-above", family: "malicious", count: 3200 },
    ];
    const doc = parseScenarioDoc(wire);
    if (doc.traffic.profile !== "segments") throw new Error("expected segments");
    expect(doc.traffic.segments[0]?.family).toBeUndefined(); // absent means organic at the envelope
    expect(doc.traffic.segments[1]?.family).toBe("malicious");
  });
});

describe("wave-four walls — rungs 4–5 (covenant terms, reputation lines)", () => {
  function win(wire: MutableWire, predicate: unknown): void {
    wire.objectives.win = [predicate];
  }

  function withCovenant(wire: MutableWire, covenant: unknown): void {
    (wire.limits as unknown as { covenants: unknown[] }).covenants = [covenant];
  }

  it("a covenant-breached-count-below of zero (vacuous ceiling, same law)", () => {
    const wire = minimalWire();
    win(wire, { kind: "covenant-breached-count-below", count: 0 });
    expect(wall("BAD_PREDICATE", () => parseScenarioDoc(wire)).path).toContain("count");
  });

  it("a covenant-breached-count-above of minus one", () => {
    const wire = minimalWire();
    win(wire, { kind: "covenant-breached-count-above", count: -1 });
    expect(wall("BAD_PREDICATE", () => parseScenarioDoc(wire)).path).toContain("count");
  });

  it("a reputation-below of zero (an always-false floor is fear without a line)", () => {
    const wire = minimalWire();
    win(wire, { kind: "reputation-below", bps: 0 });
    expect(wall("BAD_PREDICATE", () => parseScenarioDoc(wire)).path).toContain("bps");
  });

  it("a reputation line past the ten-thousand-bps wall", () => {
    const wire = minimalWire();
    win(wire, { kind: "reputation-above", bps: 10_001 });
    expect(wall("BAD_PREDICATE", () => parseScenarioDoc(wire)).path).toContain("bps");
  });

  it("a covenant naming a metric the engine cannot read out", () => {
    const wire = minimalWire();
    withCovenant(wire, { id: "min-ebitda", metricId: "ebitdaBps", floorBps: 1, direction: "min" });
    expect(wall("BAD_ENUM", () => parseScenarioDoc(wire)).message).toContain("runwayMonthsBps");
  });

  it("a covenant whose direction is neither min nor max", () => {
    const wire = minimalWire();
    withCovenant(wire, { id: "min-runway", metricId: "runwayMonthsBps", floorBps: 60_000, direction: "sideways" });
    expect(wall("BAD_ENUM", () => parseScenarioDoc(wire)).path).toContain("direction");
  });

  it("two covenants sharing an id", () => {
    const wire = minimalWire();
    const row = { id: "min-runway", metricId: "runwayMonthsBps", floorBps: 60_000, direction: "min" };
    (wire.limits as unknown as { covenants: unknown[] }).covenants = [row, { ...row }];
    expect(wall("DUPLICATE", () => parseScenarioDoc(wire)).message).toContain("min-runway");
  });

  it("a covenant floor past the sentinel ceiling (1e12 bps is the unbounded mark)", () => {
    const wire = minimalWire();
    withCovenant(wire, { id: "min-runway", metricId: "runwayMonthsBps", floorBps: 1_000_000_000_001, direction: "min" });
    expect(wall("BAD_LIMITS", () => parseScenarioDoc(wire)).path).toContain("floorBps");
  });

  it("a covenant missing its direction (all four fields are load-bearing)", () => {
    const wire = minimalWire();
    withCovenant(wire, { id: "min-runway", metricId: "runwayMonthsBps", floorBps: 60_000 });
    expect(wall("BAD_LIMITS", () => parseScenarioDoc(wire)).message).toContain("direction");
  });

  it("a covenant with a stray field (closed record)", () => {
    const wire = minimalWire();
    withCovenant(wire, { id: "min-runway", metricId: "runwayMonthsBps", floorBps: 60_000, direction: "min", grace: 3 });
    expect(wall("BAD_LIMITS", () => parseScenarioDoc(wire)).path).toContain("grace");
  });

  it("the honest covenant wire parses to a frozen BigInt floor, and defaults to none", () => {
    const wire = minimalWire();
    withCovenant(wire, { id: "min-runway", metricId: "runwayMonthsBps", floorBps: 60_000, direction: "min" });
    win(wire, { kind: "covenant-breached-count-below", count: 1 });
    const doc = parseScenarioDoc(wire);
    expect(doc.limits.covenants).toHaveLength(1);
    expect(doc.limits.covenants[0]?.floorBps).toBe(60_000n);
    expect(Object.isFrozen(doc.limits.covenants[0])).toBe(true);
    expect(parseScenarioDoc(minimalWire()).limits.covenants).toEqual([]); // absent means the bank is silent
  });
});

describe("parseMoneyWire", () => {
  it("accepts safe ints and digit strings, rejects the rest", () => {
    expect(parseMoneyWire(0, "p", "BAD_MONEY")).toBe(0n);
    expect(parseMoneyWire(42, "p", "BAD_MONEY")).toBe(42n);
    expect(parseMoneyWire("420000000000000000000", "p", "BAD_MONEY")).toBe(420000000000000000000n);
    expect(() => parseMoneyWire(1.5, "p", "BAD_MONEY")).toThrow(ScenarioError);
    expect(() => parseMoneyWire(-1, "p", "BAD_MONEY")).toThrow(ScenarioError);
    expect(() => parseMoneyWire("42.0", "p", "BAD_MONEY")).toThrow(ScenarioError);
    expect(() => parseMoneyWire(true as never, "p", "BAD_MONEY")).toThrow(ScenarioError);
  });
});

describe("seed & id derivations", () => {
  it("scenarioSeed walks the run seed by the offset", () => {
    expect(scenarioSeed(asRunSeed(904n), 0)).toBe(asRunSeed(904n));
    expect(scenarioSeed(asRunSeed(904n), 3)).toBe(asRunSeed(907n));
  });

  it("scenarioContractId reads the parsed contract by index, loudly on drift", () => {
    const doc = parseScenarioDoc(minimalWire());
    expect(() => scenarioContractId(doc, 0)).toThrow(/has 0 contracts/);
    const withOne = minimalWire();
    withOne.contracts = [
      { id: "a-1", mrcMicroUsd: 288_000_000, billingCycle: "monthly", termMonths: 12, termEndMin: 43_200 } as never,
    ];
    withOne.limits.maxSimMinutes = 420;
    const parsed = parseScenarioDoc(withOne);
    expect(scenarioContractId(parsed, 0)).toBe("a-1");
  });
});
