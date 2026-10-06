/**
 * pips.ts pure-logic tests (node env, budget-safe): synthetic projection
 * fixtures pin the shape derivation, the cap, and the wire-scale conversion
 * without running the engine.
 */
import { describe, expect, it } from "vitest";
import { ResolutionBand, asEntityId, observedKey, type EntityId, type LaneStats, type ObservedKey } from "@hh/sim-core/types";
import { FIXED_UNIT } from "@hh/sim-core/kernel";
import type { ProtoCell, SimProjection } from "../../../shared/protocol.ts";
import { deriveLaneSplit, derivePips, pipLabel } from "../pips.ts";

function cell(value: number | string): ProtoCell {
  return Object.freeze({
    value,
    fidelity: ResolutionBand.Exact,
    freshnessUs: 0n,
    coverage: FIXED_UNIT,
    certainty: FIXED_UNIT,
    status: "live" as const,
  });
}

function lane(id: string, perMin: number): LaneStats {
  return Object.freeze({
    laneId: id as EntityId,
    ratePerMin: BigInt(perMin) * 65536n,
    latencyDistributionRef: "gate-g3/hist",
    classMix: Object.freeze({}),
    health: FIXED_UNIT,
  });
}

function obs(entity: string, property: string): ObservedKey {
  return observedKey(asEntityId(entity), property);
}

function fixture(overrides: Partial<SimProjection> = {}): SimProjection {
  return {
    seq: 1,
    tick: 1n,
    minute: 1,
    clocks: { realUs: 0n, simUs: 0n, businessUs: 0n, wallUs: 0n },
    lanes: [
      lane("lane/express", 8),
      lane("lane/deep", 3),
    ],
    observed: new Map<ObservedKey, ProtoCell>([
      [obs("g3-organic@2#0.1", "confidence"), cell(0)],
      [obs("g3-organic@2#0.1", "lane"), cell("express")],
      [obs("g3-organic@2#0.1", "suspicion"), cell(0)],
      [obs("g3-organic@3#0.4", "confidence"), cell(45088)],
      [obs("g3-organic@3#0.4", "lane"), cell("deep")],
      [obs("g3-organic@3#0.4", "suspicion"), cell(6554)],
      [obs("lane/express", "routedFresh"), cell(9)],
      [obs("lane/deep", "routedFresh"), cell(1)],
      [obs("lane/deep", "demoted"), cell(2)],
    ]),
    notices: [],
    counters: { served: 0, bounced: 0, blockedFalsePositive: 0, landed: 0 },
    freeCashMicroUsd: 0n,
    ...overrides,
  };
}

describe("derivePips", () => {
  it("maps lane cells to shapes: circle=express, triangle=deep, dot=suspicious", () => {
    const pips = derivePips(fixture());
    expect(pips).toHaveLength(2);
    const [deep, express] = pips; // deep leads: the yanked are the story
    expect(express!.lane).toBe("express");
    expect(express!.suspicion).toBe(0);
    expect(deep!.lane).toBe("deep");
    expect(deep!.confidence).toBeCloseTo(45088 / 65536, 6);
    expect(deep!.suspicion).toBeGreaterThan(0.09);
    expect(deep!.suspicion).toBeLessThan(0.11);
  });

  it("caps to maxRows, deep-lane rows first (the yanked are the story)", () => {
    const pips = derivePips(fixture(), 1);
    expect(pips).toHaveLength(1);
    expect(pips[0]!.lane).toBe("deep"); // demoted units lead the strip
  });

  it("labels are wave positions, never raw entity ids", () => {
    expect(pipLabel("g3-organic@3#0.4")).toBe("t3·0.4");
    expect(pipLabel("g3-organic")).toBe("g3-organic");
  });
});

describe("deriveLaneSplit", () => {
  it("reads live counts from LaneStats and history from counter cells", () => {
    const split = deriveLaneSplit(fixture());
    expect(split.express).toBe(8);
    expect(split.deep).toBe(3);
    expect(split.demoted).toBe(2);
    expect(split.routedExpressFresh).toBe(9);
    expect(split.routedDeepFresh).toBe(1);
  });
});
