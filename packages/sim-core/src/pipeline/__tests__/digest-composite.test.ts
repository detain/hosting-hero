/**
 * FIX-4 pin (pipeline side): composite observed cells must never digest to
 * the constant "unsupported" again — digestState folds them through the
 * store module's stableSerialize, so distinct composites yield distinct
 * digests and key-permuted equals yield identical digests.
 */

import { describe, expect, it } from "vitest";
import type { GameState, ObservedCell, ObservedKey } from "../../types";
import { ResolutionBand, asEntityId, asRunSeed, observedKey } from "../../types";
import { FIXED_ONE } from "../../kernel/fixed";
import { initialClocks } from "../../kernel/time";
import { createInitialState } from "../driver";
import { digestState } from "../digest";

const KEY = observedKey(asEntityId("edge"), "funnel") as ObservedKey;

function cell(value: unknown): ObservedCell<unknown> {
  return Object.freeze({
    value,
    fidelity: ResolutionBand.Exact,
    freshnessUs: 0n,
    coverage: FIXED_ONE,
    certainty: FIXED_ONE,
    status: "live" as const,
  });
}

function stateWith(cells: ReadonlyMap<ObservedKey, ObservedCell<unknown>>): GameState {
  const base = createInitialState({
    runSeed: asRunSeed(9n),
    engineVersion: "test-fix4",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
    clocks: initialClocks(),
    nodes: [],
  });
  return Object.freeze({ ...base, observed: Object.freeze(new Map(cells)) });
}

describe("digestState composite cells (FIX-4)", () => {
  it("distinct composite values produce DISTINCT digests (old law: both 'unsupported')", () => {
    const a = stateWith(new Map([[KEY, cell({ queue: 3n, shed: 1n })]]));
    const b = stateWith(new Map([[KEY, cell({ queue: 3n, shed: 2n })]]));
    const c = stateWith(new Map([[KEY, cell([1n, 2n, 3n])]]));
    const d = stateWith(new Map([[KEY, cell([1n, 2n, 4n])]]));
    const digests = [a, b, c, d].map(digestState);
    expect(new Set(digests).size).toBe(4);
  });

  it("key-shuffled composites digest IDENTICALLY (canonical sorted-key fold)", () => {
    const shuffled = stateWith(new Map([[KEY, cell({ shed: 1n, queue: 3n })]]));
    const original = stateWith(new Map([[KEY, cell({ queue: 3n, shed: 1n })]]));
    expect(digestState(shuffled)).toBe(digestState(original));
  });

  it("nested composites within the shallow budget fold, and primitive cells are unaffected", () => {
    const nested = stateWith(new Map([[KEY, cell({ byClass: { gold: 2n, bronze: 5n }, total: 7n })]]));
    const nestedSame = stateWith(new Map([[KEY, cell({ total: 7n, byClass: { bronze: 5n, gold: 2n } })]]));
    expect(digestState(nested)).toBe(digestState(nestedSame));
    const prim = stateWith(new Map([[KEY, cell(7n)]]));
    expect(digestState(prim)).not.toBe(digestState(nested));
    // Array vs object are distinct folds (no cross-shape collision on same leaves):
    const arr = stateWith(new Map([[KEY, cell([7n])]]));
    expect(digestState(arr)).not.toBe(digestState(prim));
  });
});
