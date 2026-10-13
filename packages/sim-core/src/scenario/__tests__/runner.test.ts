/** runner.test.ts — the mission loop proven on the five shipped §1.5
 *  scenarios: every doc wins as authored, every doc loses when exactly one
 *  wire input is flipped (same seed), timeout is honest, and a run is
 *  byte-identical ×100 by construction. */
import { describe, expect, it } from "vitest";

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { encodeTaggedTree } from "../../internal/canonical.ts";
import { asRunSeed } from "../../types.ts";
import {
  SHIPPED_SCENARIO_IDS,
  SHIPPED_SCENARIO_WIRES,
  runScenario,
  scenarioSeed,
  shippedScenario,
} from "../index.ts";
import { parseScenarioDoc } from "../doc.ts";
import type { ScenarioReport, ScenarioWire } from "../index.ts";

const BASE_SEED = asRunSeed(904n);

/** One-input wire surgery: deep-clone the shipped JSON, flip ONE field,
 *  re-parse through the wall. The flip is the probe — everything else is
 *  byte-identical to the shipped mission. */
/** Surgery mirror — mutate plain JSON, re-cross the wall (readonly by law). */
type MutableWire = {
  limits: { opex: unknown[]; initialFreeMicroUsd: unknown; guardrails?: unknown[] };
  contracts: Record<string, unknown>[];
  traffic: { tableId: string; segments: Record<string, unknown>[] };
};

function flip(id: string, mutate: (wire: MutableWire) => void): ReturnType<typeof shippedScenario> {
  const wire = JSON.parse(JSON.stringify(SHIPPED_SCENARIO_WIRES[id])) as MutableWire;
  mutate(wire);
  return parseScenarioDoc(wire as unknown as ScenarioWire);
}

/** Canonical, bigint-safe report identity (fastForward's stableReport law). */
function reportIdentity(report: ScenarioReport): string {
  return JSON.stringify(
    encodeTaggedTree(report as unknown as Record<string, unknown>, (problem) => {
      throw new Error(`scenario report not canonical: ${String(problem.kind)}`);
    }),
    (_k, v) => (typeof v === "bigint" ? `${String(v)}n` : v),
  );
}

describe("shipped missions — win side (as authored)", () => {
  for (const id of [...SHIPPED_SCENARIO_IDS]) {
    it(`${id} is won end-to-end on three seed offsets`, () => {
      for (const offset of [0, 1, 2]) {
        const report = runScenario(shippedScenario(id), BASE_SEED, { seedOffset: offset });
        expect(report.outcome, `${id}@${offset} → ${report.stopReason}`).toBe("won");
        expect(report.stopReason).toBe(`win@${report.endMinute}`);
        expect(report.endDigest).toMatch(/^[0-9a-f]{32}$/);
      }
    });
  }
});

describe("shipped missions — lose side (ONE flipped wire input, same seed)", () => {
  it("Long Weekend starves under a brutal burn drip → guard halt", () => {
    const starved = flip("the-long-weekend", (wire) => {
      wire.limits.opex = Array.from({ length: 239 }, (_unused, i) => ({
        atMinute: i + 1,
        amountMicroUsd: 6_000_000,
        memo: `x-${String(i + 1).padStart(3, "0")}`,
      }));
    });
    const report = runScenario(starved, BASE_SEED);
    expect(report.outcome).toBe("lost");
    expect(report.stopReason).toBe("guard:freeCashDepleted@3");
    expect(report.trace.economyRefusals).toBeGreaterThan(0);
  });

  it("Deadbeat Quarter with no customers and no cash → canonical death", () => {
    const hollow = flip("deadbeat-quarter", (wire) => {
      wire.contracts = [];
      wire.limits.initialFreeMicroUsd = 0;
      wire.limits.opex = [{ atMinute: 1, amountMicroUsd: 1, memo: "dust" }];
    });
    const report = runScenario(hollow, BASE_SEED);
    expect(report.outcome).toBe("lost");
    expect(report.observation.deaths.length).toBe(1);
    expect(report.stopReason).toMatch(/^lose:death-by-cause:any@\d+$/);
    // the collapse lands mid-quarter, never at the clock edge
    expect(Number(report.endMinute)).toBeLessThan(120);
  });

  it("The Angry Whale with auto-renew off → the whale walks at its cliff", () => {
    const unkept = flip("the-angry-whale", (wire) => {
      const whale = wire.contracts[0];
      if (whale !== undefined) whale.autoRenew = false;
    });
    const report = runScenario(unkept, BASE_SEED);
    expect(report.outcome).toBe("lost");
    expect(report.stopReason).toBe("lose:churn-above:0@111");
    expect(report.observation.churnedCustomers).toBe(1);
    // the loss lands exactly at the cliff, before the survive line completes
    expect(Number(report.endMinute)).toBeLessThan(shippedScenario("the-angry-whale").limits.maxSimMinutes);
    const keep = report.objectives.win.find((row) => row.predicate.kind === "churn-below");
    expect(keep?.holds ?? true).toBe(false); // the "keep them" row is broken
  });

  it("Collections Week with an empty book → churn-collapse at the sustain wall", () => {
    // The seed design died at the tick-252 cliffs; the committed engine's
    // cliff dice cannot be forced to walk the whole book out (best ~45 %),
    // so the one-flip loss is the honest collapse: no contracts arms the
    // churn floor immediately — clock-bound, so identical on every offset.
    const hollow = flip("collections-week", (wire) => {
      wire.contracts = [];
    });
    for (const offset of [0, 1, 2]) {
      const report = runScenario(hollow, BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("lost");
      expect(report.stopReason).toBe("lose:death-by-cause:churn-collapse@44");
      expect(report.observation.deaths).toEqual(["churn-collapse"]);
    }
  });

  it("Metastable surge running three minutes longer locks the node → guard halt", () => {
    // ONE field: the surge's closing segment starts at 36 instead of 33.
    // Backlog + retries hold every slot past the 10-minute degraded wall —
    // on every seed offset, because the locked state is self-sustaining.
    const locked = flip("metastable", (wire) => {
      wire.traffic.segments[2] = { fromMinute: 36, ratePerMin: 4 };
    });
    for (const offset of [0, 1, 2]) {
      const report = runScenario(locked, BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("lost");
      expect(report.stopReason).toBe("guard:cascadeCollapse@39");
    }
    // §1.5's premise is retries SUSTAINING the overload: the locked arm
    // accumulates bounce/retry traffic, the win arm drains almost none —
    // the pair is the discriminating pin (calm full-run ≤ 5 bounces vs
    // locked-by-t39 ≥ 10).
    const calm = runScenario(shippedScenario("metastable"), BASE_SEED);
    expect(calm.stopReason).toBe("win@240");
    expect(calm.trace.eventsByKind["bounced"] ?? 0).toBeLessThanOrEqual(5);
    const lockedProbe = runScenario(locked, BASE_SEED);
    expect(lockedProbe.trace.eventsByKind["bounced"] ?? 0).toBeGreaterThanOrEqual(10);
    expect(lockedProbe.trace.eventsByKind["retry"] ?? 0).toBeGreaterThanOrEqual(10);
  });
});

describe("salvage missions — engine truth (ADR-0011)", () => {
  it("Collections Week: hourly invoices land from the first hour, anchors renew, dice thin the small book", () => {
    // settledInvoices >= 1000 falsifies the pre-salvage assumption that
    // hourly billing resembles monthly (first settle near t214 — it does not).
    // churnedCustomers is dice-bound per seed: the exact walk-out counts are
    // deterministic for (doc, seed+0..2) and pinned here.
    const churnByOffset: number[] = [];
    for (const offset of [0, 1, 2]) {
      const report = runScenario(shippedScenario("collections-week"), BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("won");
      expect(report.stopReason).toBe("win@240");
      expect(report.observation.settledInvoices).toBeGreaterThanOrEqual(1000);
      // six accounts, two anchors renewing — at most the four dice can leave
      expect(report.observation.churnedCustomers).toBeLessThanOrEqual(4);
      churnByOffset.push(report.observation.churnedCustomers);
    }
    expect(churnByOffset).toEqual([0, 2, 1]); // seed 904/905/906 walk-outs
  });

  it("Metastable: the intermediate trigger IS the metastable band — some seeds drain, some cascade", () => {
    // The spec's whole premise: identical inputs, divergent fates by dice.
    // The shipped win arm and the flipped lose arm sit OUTSIDE the band
    // (deterministic on every offset); this middle arm sits inside it.
    const middle = parseScenarioDoc({
      ...(JSON.parse(JSON.stringify(SHIPPED_SCENARIO_WIRES.metastable)) as ScenarioWire),
      traffic: {
        tableId: "metastable-storm",
        segments: [
          { fromMinute: 0, ratePerMin: 5 },
          { fromMinute: 30, ratePerMin: 10 },
          { fromMinute: 36, ratePerMin: 5 },
        ],
      },
    });
    const outcomes = new Set<string>();
    for (let offset = 0; offset < 15; offset += 1) {
      const report = runScenario(middle, BASE_SEED, { seedOffset: offset });
      outcomes.add(report.outcome);
      expect(["won", "lost"]).toContain(report.outcome);
      if (report.outcome === "lost") expect(report.stopReason).toMatch(/^guard:cascadeCollapse@\d+$/);
      else expect(report.stopReason).toBe("win@240");
    }
    expect(outcomes.size).toBe(2); // both fates occur — metastability, pinned
  });
});

describe("timeout and caps", () => {
  it("tickCap cuts the clock and the outcome says timeout", () => {
    const report = runScenario(shippedScenario("the-long-weekend"), BASE_SEED, { tickCap: 40 });
    expect(report.outcome).toBe("timeout");
    expect(report.stopReason).toBe("timeout@40");
    expect(report.endTick).toBe(40n);
  });

  it("tickCap never exceeds the declared clock", () => {
    const report = runScenario(shippedScenario("the-angry-whale"), BASE_SEED, { tickCap: 9999 });
    expect(Number(report.endMinute)).toBeLessThanOrEqual(200);
  });

  it("a negative seed offset is refused loudly", () => {
    expect(() => runScenario(shippedScenario("the-long-weekend"), BASE_SEED, { seedOffset: -1 })).toThrow(
      /seedOffset/,
    );
  });

  it("scenarioSeed is the documented walk", () => {
    const report = runScenario(shippedScenario("deadbeat-quarter"), BASE_SEED, { seedOffset: 2 });
    expect(report.runSeed).toBe(scenarioSeed(BASE_SEED, 2));
  });
});

describe("determinism", () => {
  it("a 12-minute arm is byte-identical ×100", () => {
    const doc = shippedScenario("the-long-weekend");
    const digests = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      digests.add(reportIdentity(runScenario(doc, BASE_SEED, { tickCap: 12 })));
    }
    expect(digests.size).toBe(1);
  });

  it("full-length shipped runs agree across fresh calls and fresh parses", () => {
    for (const id of ["the-long-weekend", "the-angry-whale"] as const) {
      const wire = JSON.parse(JSON.stringify(SHIPPED_SCENARIO_WIRES[id]));
      const a = runScenario(parseScenarioDoc(wire), BASE_SEED, { tickCap: 60 });
      const b = runScenario(shippedScenario(id), BASE_SEED, { tickCap: 60 });
      expect(reportIdentity(a)).toBe(reportIdentity(b));
      expect(a.endDigest).toBe(b.endDigest);
    }
  });

  it("the whale churn cliff holds its drama across five seed offsets", () => {
    const unkept = flip("the-angry-whale", (wire) => {
      const whale = wire.contracts[0];
      if (whale !== undefined) whale.autoRenew = false;
    });
    const churnTicks = new Set<number>();
    for (const offset of [0, 1, 2, 3, 4]) {
      churnTicks.add(Number(runScenario(unkept, BASE_SEED, { seedOffset: offset }).endMinute));
    }
    expect(churnTicks.has(111)).toBe(true); // every offset churns AT the cliff — timing is clock-bound, dice-bound
    const full = runScenario(unkept, BASE_SEED, { seedOffset: 0 });
    expect(full.outcome).toBe("lost");
  });
});

describe("mirrored refusal law (pinned against the unattended source)", () => {
  it("runner.ts and fastForward.ts carry the identical settle-refusal regex", () => {
    const here = readFileSync(fileURLToPath(new URL("../runner.ts", import.meta.url)), "utf8");
    const there = readFileSync(fileURLToPath(new URL("../../unattended/fastForward.ts", import.meta.url)), "utf8");
    const shape = `settle (\\S+): -(\\d+) µ\\$ on '`;
    expect(here).toContain(shape);
    expect(there).toContain(shape);
  });
});
