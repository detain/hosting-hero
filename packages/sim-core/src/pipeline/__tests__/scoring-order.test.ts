/**
 * FIX-3 pin: `mul` on Q16.16 Fixed is NOT associative under round-half-away,
 * so folding C = 1 − Π(1 − cᵢ) in host-supplied evidence order made the
 * "commutative" claim false. The scoring step now folds in the canonical
 * (unitId, metric) total order ⇒ every input permutation lands on the exact
 * same confidence.
 */

import { describe, expect, it } from "vitest";
import type { ConfidenceContribution, Fixed, Unit } from "../../types";
import { asEntityId, asMetricId } from "../../types";
import { FIXED_UNIT, fromRatio, mul, sub } from "../../kernel/fixed";
import { initialClocks } from "../../kernel/time";
import { defaultScoringStep } from "../defaults";

const UNIT_A = asEntityId("unit-a");
const UNIT_B = asEntityId("unit-b");

function unit(id: Unit["id"]): Unit {
  return Object.freeze({
    id,
    type: "web",
    sizeCost: 65536n,
    patienceUs: 60_000_000n,
    trueIntent: "customer" as const,
    source: Object.freeze({ identity: "s", reputation: 0n }),
    retryOf: null,
    arrivedAtTick: 0n,
    accumulatedLatencyUs: 0n,
    inspectionCostUs: 0n,
    confidence: 0n,
    qosClassId: null,
    routeHops: Object.freeze([]) as readonly Unit["id"][],
    waitingOn: null,
  });
}

// Contributions chosen so the RAW fold is order-sensitive: folding
// (0.05, 0.05, 0.15) vs its reverse gives products 50274 vs 50275 — the
// negative control below asserts this difference still exists at the Fixed
// layer, i.e. the step's permutation-identity can only come from the sort.
const CONTRIB_LOW = fromRatio(5n, 100n);
const CONTRIB_MID = fromRatio(5n, 100n);
const CONTRIB_HIGH = fromRatio(15n, 100n);

const EVIDENCE_A: readonly ConfidenceContribution[] = [
  { unitId: UNIT_A, metric: asMetricId("m-low"), value: CONTRIB_LOW },
  { unitId: UNIT_A, metric: asMetricId("m-mid"), value: CONTRIB_MID },
  { unitId: UNIT_A, metric: asMetricId("m-high"), value: CONTRIB_HIGH },
];

function permutations<T>(items: readonly T[]): T[][] {
  if (items.length <= 1) return [[...items]];
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += 1) {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)];
    for (const tail of permutations(rest)) out.push([items[i] as T, ...tail]);
  }
  return out;
}

function confidenceOf(input: readonly ConfidenceContribution[], target: Unit["id"]): Fixed {
  const out = defaultScoringStep({
    context: Object.freeze({ tick: 0n, minute: 0, clocks: initialClocks() }),
    units: Object.freeze([unit(UNIT_A), unit(UNIT_B)]),
    evidence: Object.freeze([...input]),
  });
  return out.units.find((u) => u.id === target)!.confidence;
}

describe("scoring fold order (FIX-3)", () => {
  it("negative control: the raw Fixed product IS order-sensitive for these values", () => {
    const naive = (list: readonly ConfidenceContribution[]): Fixed =>
      list.reduce<Fixed>((acc, e) => mul(acc, sub(FIXED_UNIT, e.value)), FIXED_UNIT);
    const forward = naive(EVIDENCE_A);
    const reverse = naive([...EVIDENCE_A].reverse());
    expect(forward).not.toBe(reverse); // 50274 vs 50275 — rounding really bites
  });

  it("all 6 evidence permutations yield byte-identical confidence (canonical fold order)", () => {
    const confidences = permutations(EVIDENCE_A).map((perm) => confidenceOf(perm, UNIT_A));
    for (const c of confidences) expect(c).toBe(confidences[0]);
    // The pinned known-answer: metric-sorted fold (m-high, m-low, m-mid by id?
    // no — by (unitId, metric) code-unit): m-high < m-low < m-mid.
    expect(confidences[0]).toBe(65_536n - 50_275n);
  });

  it("interleaved multi-unit evidence: each unit's product is permutation-identity too", () => {
    const mixed: ConfidenceContribution[] = [
      { unitId: UNIT_B, metric: asMetricId("m-high"), value: CONTRIB_HIGH },
      { unitId: UNIT_A, metric: asMetricId("m-low"), value: CONTRIB_LOW },
      { unitId: UNIT_B, metric: asMetricId("m-low"), value: CONTRIB_LOW },
      { unitId: UNIT_A, metric: asMetricId("m-mid"), value: CONTRIB_MID },
      { unitId: UNIT_A, metric: asMetricId("m-high"), value: CONTRIB_HIGH },
      { unitId: UNIT_B, metric: asMetricId("m-mid"), value: CONTRIB_MID },
    ];
    const shuffled: ConfidenceContribution[] = [
      ...mixed.slice(3),
      ...mixed.slice(0, 3),
    ];
    expect(confidenceOf(mixed, UNIT_A)).toBe(confidenceOf(shuffled, UNIT_A));
    expect(confidenceOf(mixed, UNIT_B)).toBe(confidenceOf(shuffled, UNIT_B));
    expect(confidenceOf(mixed, UNIT_A)).toBe(65_536n - 50_275n);
  });
});
