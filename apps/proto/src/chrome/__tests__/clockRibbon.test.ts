/**
 * Clock Ribbon model (§7.9, §8.8) — pure geometry + the three-pip
 * promotion guarantee + honest off-window accounting.
 */
import { describe, expect, it } from "vitest";
import type { ClockState } from "@hh/sim-core/types";
import {
  buildRibbonModel,
  businessDaysUntil,
  clockHeads,
  formatBusinessDate,
  formatWallClock,
  type RibbonEntry,
} from "../clockRibbon";

const MIN = 60_000_000n;
const HOUR = 60n * MIN;
const DAY = 24n * HOUR;

const clocks: ClockState = {
  realUs: 3n * HOUR,
  simUs: 100n * MIN,
  businessUs: 10n * DAY,
  wallUs: 3n * HOUR + 90_000_000n,
};

const WINDOWS = { ops: 120n * MIN, business: 30n * DAY };

function entry(over: Partial<RibbonEntry> & { id: string }): RibbonEntry {
  return {
    label: over.id,
    track: "ops",
    dueUs: clocks.simUs + 10n * MIN,
    consequence: 0.5,
    ...over,
  };
}

describe("buildRibbonModel — layout law (§8.8)", () => {
  it("splits entries by sign of delta: past LEFT, future RIGHT", () => {
    const model = buildRibbonModel(
      [entry({ id: "due", dueUs: clocks.simUs + 30n * MIN }), entry({ id: "ago", dueUs: clocks.simUs - 30n * MIN })],
      clocks,
      { windows: WINDOWS },
    );
    const sides = Object.fromEntries(model.positions.map((p) => [p.entry.id, p.side]));
    expect(sides).toEqual({ due: "future", ago: "past" });
  });

  it("offset is 0 at now-line, 1 at strip edge — linear, clamped", () => {
    const model = buildRibbonModel(
      [entry({ id: "mid", dueUs: clocks.simUs + 60n * MIN }), entry({ id: "beyond", dueUs: clocks.simUs + 121n * MIN })],
      clocks,
      { windows: WINDOWS },
    );
    const mid = model.positions.find((p) => p.entry.id === "mid");
    expect(mid?.offset).toBeCloseTo(0.5);
    expect(model.offscreenCount).toBe(1); // "beyond" counted, never hidden
  });

  it("history entries land on the past side even when due-in-future", () => {
    const model = buildRibbonModel(
      [entry({ id: "marker", dueUs: clocks.simUs + 5n * MIN, history: true, tone: "bad" })],
      clocks,
      { windows: WINDOWS },
    );
    expect(model.positions.find((p) => p.entry.id === "marker")?.side).toBe("past");
  });
});

describe("buildRibbonModel — three-pip promotion law (§7.9)", () => {
  const six = [
    entry({ id: "a", dueUs: clocks.simUs + 10n * MIN, consequence: 0.2 }),
    entry({ id: "b", dueUs: clocks.simUs + 5n * MIN, consequence: 0.9 }),
    entry({ id: "c", dueUs: clocks.simUs + 20n * MIN, consequence: 1 }),
    entry({ id: "d", dueUs: clocks.simUs + 90n * MIN, consequence: 1 }),
    entry({ id: "e", dueUs: clocks.businessUs + 2n * DAY, track: "business", consequence: 0.8 }),
    entry({ id: "f", dueUs: clocks.simUs - 10n * MIN, consequence: 1, history: true }),
  ];

  it("promotes EXACTLY three, by urgency × consequence, history ineligible", () => {
    const model = buildRibbonModel(six, clocks, { windows: WINDOWS });
    expect(model.enlarged.length).toBe(3);
    // scores: b ≈ .958×.9, c ≈ .833×1, e ≈ .933×.8 — the near-and-deadly trio
    expect(model.enlarged).toEqual(["b", "c", "e"]);
    expect(model.enlarged).not.toContain("f"); // past is pips, not promises
    expect(model.greyTicks).toEqual(expect.arrayContaining(["a", "d", "f"]));
  });

  it("enlargedMax is honored down to zero (never negative)", () => {
    const model = buildRibbonModel(six, clocks, { windows: WINDOWS, enlargedMax: 0 });
    expect(model.enlarged).toEqual([]);
    expect(() => buildRibbonModel(six, clocks, { windows: WINDOWS, enlargedMax: -1 })).toThrow(/enlargedMax/);
  });
});

describe("buildRibbonModel — scrub + validation", () => {
  it("scrubbing forward re-centers: an entry leaves as the window moves past it", () => {
    const e = [entry({ id: "soon", dueUs: clocks.simUs + 130n * MIN })];
    const ahead = buildRibbonModel(e, clocks, { windows: WINDOWS });
    expect(ahead.offscreenCount).toBe(1);
    const scrubbed = buildRibbonModel(e, clocks, { windows: WINDOWS, scrubUs: { ops: 60n * MIN } });
    const placement = scrubbed.positions.find((p) => p.entry.id === "soon");
    expect(placement?.side).toBe("future");
    expect(placement?.offset).toBeCloseTo(70 / 120); // due 130m − scrub 60m = 70m into a 120m half-window
  });

  it("fail-loud programmer guards: duplicate id, empty id, bad consequence, negative due", () => {
    expect(() => buildRibbonModel([entry({ id: "x" }), entry({ id: "x" })], clocks, { windows: WINDOWS })).toThrow(/duplicate/);
    expect(() => buildRibbonModel([entry({ id: "" })], clocks, { windows: WINDOWS })).toThrow(/empty id/);
    expect(() => buildRibbonModel([entry({ id: "y", consequence: 2 })], clocks, { windows: WINDOWS })).toThrow(/consequence/);
    expect(() => buildRibbonModel([entry({ id: "z", dueUs: -1n })], clocks, { windows: WINDOWS })).toThrow(/negative/);
  });
});

describe("clock heads (§7.9 three clocks, one ribbon)", () => {
  it("ops / business / wall heads always come back — three, in order", () => {
    const heads = clockHeads(clocks);
    expect(heads.map((h) => h.kind)).toEqual(["ops", "business", "wall"]);
    expect(heads[0]?.display).toBe("T+1h40m");
    expect(heads[1]?.display).toBe("Month 1 · Day 11");
    expect(heads[2]?.display).toBe("03:01:30");
  });

  it("business calendar rolls months at the 30-day line", () => {
    expect(formatBusinessDate(0n)).toBe("Month 1 · Day 1");
    expect(formatBusinessDate(30n * DAY)).toBe("Month 2 · Day 1");
    expect(formatBusinessDate(59n * DAY + 1n)).toBe("Month 2 · Day 30");
  });

  it("wall clock is hh:mm:ss tabular", () => {
    expect(formatWallClock(0n)).toBe("00:00:00");
    expect(formatWallClock(3_661_000_000n)).toBe("01:01:01");
  });

  it("businessDaysUntil counts whole days up, negative when overdue", () => {
    expect(businessDaysUntil(clocks.businessUs, clocks.businessUs + 6n * DAY)).toBe(6);
    expect(businessDaysUntil(clocks.businessUs, clocks.businessUs + 6n * DAY + 1n)).toBe(7); // whole days UP
    expect(businessDaysUntil(clocks.businessUs, clocks.businessUs - 2n * DAY)).toBe(-2);
    expect(businessDaysUntil(clocks.businessUs, clocks.businessUs)).toBe(0);
  });
});
