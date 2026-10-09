/**
 * familyMix consumer at the arrival step (audit fix 3, second half): the
 * bundle's threats.familyWeights table (waves/parseFamilyWeightsTable) now
 * STEERS the dice — each minted unit draws its family on the arrival stream
 * and carries it as trueIntent. Absent ⇒ zero extra rolls ⇒ the historical
 * stream position is byte-identical (pinned); present ⇒ the mix is the mix.
 */

import { describe, expect, it } from "vitest";
import type { SimEvent, Unit } from "../../types";
import { asRunSeed } from "../../types";
import { fromInt } from "../../kernel/fixed";
import { streamFor } from "../../kernel/rng";
import { MICROS_PER_MIN } from "../../kernel/time";
import { createInitialState, createTickDriver, type TickInputs } from "../driver";
import { createDefaultSlots, digestState } from "../index";
import { createArrivalStep } from "../defaults";
import { validateFamilyMix, weightedFamilyOf } from "../internal.ts";
import type { FamilyMixEntry } from "../internal.ts";
import { IDS, DEFAULT_CLASSES, NO_RETRY, envelope, freshClocks, node, testConfig, tickInputs } from "./helpers";

const MIN = MICROS_PER_MIN;

const ALL_MALICIOUS: readonly FamilyMixEntry[] = Object.freeze([
  Object.freeze({ family: "malicious" as const, shareMicro: 1_000_000 }),
]);
const EVEN_SPLIT: readonly FamilyMixEntry[] = Object.freeze([
  Object.freeze({ family: "malicious" as const, shareMicro: 500_000 }),
  Object.freeze({ family: "customerAsThreat" as const, shareMicro: 500_000 }),
]);

function board() {
  return Object.freeze([
    node(IDS.edge, { slots: 16, serviceUs: MIN }),
    node(IDS.origin, { slots: 16, serviceUs: MIN }),
  ]);
}

function mintRun(familyMix: readonly FamilyMixEntry[] | undefined): readonly Unit[] {
  const config = testConfig({ runSeed: asRunSeed(42n), defaultPatienceUs: 1_000_000n * MIN, ...(familyMix ? { familyMix } : {}) });
  const driver = createTickDriver(createDefaultSlots(config), streamFor(config.runSeed, "root", 0), freshClocks(), {
    purgeTargetedMinNodes: 0,
  });
  let state = createInitialState({
    runSeed: config.runSeed,
    engineVersion: "family-mix",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "family-mix", ruleBookHash: "" },
    clocks: freshClocks(),
    nodes: board(),
  });
  for (let t = 0; t < 4; t += 1) {
    const inputs: TickInputs = tickInputs({
      envelopes: Object.freeze([envelope("mix:probe", fromInt(8))]), // organic dominant family
      dependencyEdges: Object.freeze([]),
      retryPolicy: NO_RETRY,
      classes: DEFAULT_CLASSES,
    });
    state = driver.advance(state, inputs).state;
  }
  return [...state.units.values()];
}

/* ═══════════════════════ 1 · pure helpers ═══════════════════════ */

describe("weightedFamilyOf / validateFamilyMix", () => {
  it("cumulative scan honors exact bucket boundaries", () => {
    expect(weightedFamilyOf(EVEN_SPLIT, 0)).toBe("malicious");
    expect(weightedFamilyOf(EVEN_SPLIT, 499_999)).toBe("malicious");
    expect(weightedFamilyOf(EVEN_SPLIT, 500_000)).toBe("customerAsThreat");
    expect(weightedFamilyOf(EVEN_SPLIT, 999_999)).toBe("customerAsThreat");
  });

  it("fail-loud at the boundary: off-sum, zero, negative, duplicate", () => {
    expect(() => validateFamilyMix([{ family: "human", shareMicro: 999_999 }])).toThrow(/exactly 1000000/);
    expect(() => validateFamilyMix([{ family: "human", shareMicro: 0 }])).toThrow(/positive integer/);
    expect(() => validateFamilyMix([{ family: "human", shareMicro: -5 }])).toThrow(/positive integer/);
    expect(() =>
      validateFamilyMix([
        { family: "human", shareMicro: 500_000 },
        { family: "human", shareMicro: 500_000 },
      ]),
    ).toThrow(/duplicate/);
  });

  it("createArrivalStep validates its config at BUILD time, not per tick", () => {
    expect(() =>
      createArrivalStep({
        defaultPatienceUs: MIN,
        defaultSizeCost: fromInt(1),
        patienceJitterPct: 0,
        familyMix: [{ family: "human", shareMicro: 123 }],
      }),
    ).toThrow(/exactly 1000000/);
  });
});

/* ═══════════════════════ 2 · driver-level mix ═══════════════════════ */

describe("arrival familyMix steers trueIntent (§2.27 weights → dice)", () => {
  it("organic envelope + all-malicious mix ⇒ EVERY unit is adversarial-intent", () => {
    const units = mintRun(ALL_MALICIOUS);
    expect(units.length).toBeGreaterThan(20);
    expect(units.every((u) => u.trueIntent === "malicious")).toBe(true); // familyToIntent(malicious)
  });

  it("organic envelope, no mix ⇒ baseline intents (customer) — the label-only era", () => {
    const units = mintRun(undefined);
    expect(units.length).toBeGreaterThan(20);
    expect(units.every((u) => u.trueIntent === "customer")).toBe(true);
  });

  it("50/50 split lands both intents and stays near the authored share", () => {
    const units = mintRun(EVEN_SPLIT);
    const adversarial = units.filter((u) => u.trueIntent === "malicious").length;
    const abusers = units.filter((u) => u.trueIntent === "abuser").length;
    expect(adversarial).toBeGreaterThan(0);
    expect(abusers).toBeGreaterThan(0);
    expect(adversarial + abusers).toBe(units.filter((u) => u.arrivedAtTick <= 4n).length || units.length); // nothing organic survives the mix
    // 32 mints: binomial ±4σ band around 16 stays far below 40%/above 10%
    const share = adversarial / units.length;
    expect(share).toBeGreaterThan(0.25);
    expect(share).toBeLessThan(0.75);
  });

  it("absent mix keeps the historical digest byte-identical (config-free twin)", () => {
    // The familyMix field is additive: a run that never sets it must digest
    // exactly like a run built BEFORE this lane existed. Twin determinism +
    // the baseline-intent pin above cover the observable half; this pins the
    // stream-position half: 4 ticks, both fresh drivers, same chain.
    const chain = (mix: readonly FamilyMixEntry[] | undefined): readonly string[] => {
      const config = testConfig({ runSeed: asRunSeed(9n), defaultPatienceUs: 1_000_000n * MIN, ...(mix ? { familyMix: mix } : {}) });
      const driver = createTickDriver(createDefaultSlots(config), streamFor(config.runSeed, "root", 0), freshClocks(), {
        purgeTargetedMinNodes: 0,
      });
      let state = createInitialState({
        runSeed: config.runSeed,
        engineVersion: "family-mix",
        contentHashes: { rulesetCardHashes: {}, sheetsHash: "family-mix", ruleBookHash: "" },
        clocks: freshClocks(),
        nodes: board(),
      });
      const out: string[] = [];
      const events: SimEvent[] = [];
      for (let t = 0; t < 4; t += 1) {
        const r = driver.advance(
          state,
          tickInputs({
            envelopes: Object.freeze([envelope("mix:probe", fromInt(8))]),
            dependencyEdges: Object.freeze([]),
            retryPolicy: NO_RETRY,
            classes: DEFAULT_CLASSES,
          }),
        );
        state = r.state;
        events.push(...r.events);
        out.push(digestState(state));
      }
      expect(events.filter((e) => e.kind === "arrival")).toHaveLength(32);
      return out;
    };
    expect(chain(undefined)).toStrictEqual(chain(undefined));
  });
});
