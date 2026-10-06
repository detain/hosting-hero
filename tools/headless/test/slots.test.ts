/**
 * Slot-adapter (swap point #2) unit tests — composition selection, the
 * synthetic-envelope wrapper contract, and fail-loud config guards. The
 * byte-level end-to-end story is the parity gate (test/parity.test.ts);
 * this file pins the ADAPTER's own rules.
 */

import { describe, expect, it } from "vitest";

import {
  ACTIVE_COMPOSITION,
  createSlots,
  isCompositionFlavor,
  type AdapterConfig,
} from "../src/slots.ts";
import { TICK_STEP_ORDER, asRunSeed, clocks, fx, streams } from "../src/sim-core.ts";
import type { ArrivalIn, RunSeed } from "../src/sim-core.ts";

const SEED: RunSeed = asRunSeed(4242n);

function baseConfig(overrides: Partial<AdapterConfig> = {}): AdapterConfig {
  return {
    bundleId: "test:slots",
    seed: SEED,
    ...overrides,
  };
}

function arrivalIn(envelopes: ArrivalIn["envelopes"]): ArrivalIn {
  return {
    context: { tick: 0n, minute: 0, clocks: clocks.initialClocks() },
    envelopes,
    rng: streams.streamFor(SEED, "arrival", 0),
  };
}

describe("composition selection", () => {
  it("ACTIVE_COMPOSITION is the real pipeline after the 2026-10-06 swap", () => {
    expect(ACTIVE_COMPOSITION).toBe("real-v1");
  });

  it("both flavors build a complete PipelineSlots (all 13 step keys)", () => {
    for (const flavor of ["stub-v1", "real-v1"] as const) {
      const { slots, flavor: used } = createSlots(baseConfig({ flavor }));
      expect(used).toBe(flavor);
      for (const step of TICK_STEP_ORDER) {
        expect(typeof slots[step]).toBe("function");
      }
    }
  });

  it("default (no flavor) is the ACTIVE_COMPOSITION", () => {
    expect(createSlots(baseConfig()).flavor).toBe(ACTIVE_COMPOSITION);
  });

  it("isCompositionFlavor narrows only the closed union", () => {
    expect(isCompositionFlavor("stub-v1")).toBe(true);
    expect(isCompositionFlavor("real-v1")).toBe(true);
    expect(isCompositionFlavor("real")).toBe(false);
    expect(isCompositionFlavor(undefined)).toBe(false);
  });
});

describe("real-v1 synthetic-envelope wrapper", () => {
  it("empty envelopes mint the world baseline: 3 organic + 1 probe at rate 4/min", () => {
    // Integer rate → integer organic share → deterministic whole counts:
    // 4 × 75 % = 3 exact, remainder 1 exact; no fraction rolls are taken.
    const { slots } = createSlots(
      baseConfig({ flavor: "real-v1", baselineRatePerMin: fx.fromRatio(4n, 1n), unitTerm: "tester" }),
    );
    const out = slots.arrival(arrivalIn([]));
    const byType = new Map<string, number>();
    for (const unit of out.units) byType.set(unit.type, (byType.get(unit.type) ?? 0) + 1);
    expect(byType.get("baseline:tester")).toBe(3);
    expect(byType.get("probe:malicious")).toBe(1);
    expect(out.units.length).toBe(4); // sums conserve — no rate rounding slack
  });

  it("wrapper is deterministic: same (seed, config) → identical unit ids", () => {
    const { slots } = createSlots(baseConfig({ flavor: "real-v1" }));
    const first = slots.arrival(arrivalIn([]));
    const second = slots.arrival(arrivalIn([]));
    expect(first.units.map((u) => u.id)).toEqual(second.units.map((u) => u.id));
  });

  it("external envelopes win verbatim — the wrapper never fires on non-empty", () => {
    const { slots } = createSlots(
      baseConfig({ flavor: "real-v1", baselineRatePerMin: fx.fromRatio(4n, 1n) }),
    );
    const custom = [{
      tableId: "custom:wave",
      role: "wave" as const,
      shape: "ramp" as const,
      ratePerMin: fx.fromRatio(2n, 1n),
      telegraphed: true,
      dominantFamily: "organic" as const,
    }];
    const out = slots.arrival(arrivalIn(custom));
    expect(out.units.length).toBe(2);
    for (const unit of out.units) expect(unit.type).toBe("custom:wave");
  });
});

describe("fail-loud config guards (Law 4)", () => {
  it("patienceUs 0 on the real flavor throws at composition time", () => {
    expect(() =>
      createSlots(baseConfig({ flavor: "real-v1", patienceUs: 0n })),
    ).toThrow(/defaultPatienceUs must be > 0/);
  });

  it("patienceJitterPct has no harness knob — the fixed 0 passes validation", () => {
    // Guards the honesty of realPipelineConfig: if a future knob ever sends a
    // jitter out of 0..50, construction (not the first tick) must explode.
    expect(() => createSlots(baseConfig({ flavor: "real-v1" }))).not.toThrow();
  });
});
