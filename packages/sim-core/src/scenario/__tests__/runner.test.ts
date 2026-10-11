/** runner.test.ts — the mission loop proven on the three shipped §1.5
 *  scenarios: every doc wins as authored, every doc loses when exactly one
 *  wire input is flipped (same seed), timeout is honest, and a run is
 *  byte-identical ×100 by construction. */
import { describe, expect, it } from "vitest";

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { encodeTaggedTree } from "../../internal/canonical.ts";
import { asRunSeed } from "../../types.ts";
import { SHIPPED_SCENARIO_WIRES, runScenario, scenarioSeed, shippedScenario } from "../index.ts";
import { parseScenarioDoc } from "../doc.ts";
import type { ScenarioReport, ScenarioWire } from "../index.ts";

const BASE_SEED = asRunSeed(904n);

/** One-input wire surgery: deep-clone the shipped JSON, flip ONE field,
 *  re-parse through the wall. The flip is the probe — everything else is
 *  byte-identical to the shipped mission. */
/** Surgery mirror — mutate plain JSON, re-cross the wall (readonly by law). */
type MutableWire = {
  limits: { opex: unknown[]; initialFreeMicroUsd: unknown };
  contracts: Record<string, unknown>[];
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
  for (const id of ["the-long-weekend", "deadbeat-quarter", "the-angry-whale"] as const) {
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
