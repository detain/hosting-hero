/**
 * FIX-4 pin (observed side) + FIX-8 pin: the store's step-12 write gate folds
 * composite cell values to their canonical hash text (distinct composites →
 * distinct store digests; key-permuted equals → identical), AND every cell
 * the observed layer hands out is frozen at construction.
 */

import { describe, expect, it } from "vitest";
import type { ObservedCell } from "../../types";
import { ResolutionBand, asCauseId } from "../../types";
import { FIXED_ONE } from "../../kernel/fixed";
import {
  CLASS_TRACING,
  deriveCell,
  unknownCell,
  unknownCellWithCoverage,
  type InstrumentBinding,
} from "../instrument";
import { CANONICAL_CELL_PREFIX, ObservedStore, foldCompositeCellValue } from "../store";
import { ground, honestBinding, instrument, key, CAUSE } from "./fixtures";

const funnel = key("edge-1", "funnel");

function explicitWrite(value: unknown) {
  return {
    key: funnel,
    causeId: CAUSE,
    cell: {
      value,
      fidelity: ResolutionBand.Exact,
      freshnessUs: 0n,
      coverage: FIXED_ONE,
      certainty: FIXED_ONE,
      status: "live" as const,
    } satisfies ObservedCell<unknown>,
  };
}

describe("write-gate composite canonicalization (FIX-4)", () => {
  it("an explicit composite cell arrives at readers as distinct canonical hash text", () => {
    const store = new ObservedStore();
    store.applyObservedWrites([explicitWrite({ queue: 3n, shed: 1n })], 0n);
    const cell = store.read(funnel);
    expect(typeof cell.value).toBe("string");
    expect(String(cell.value).startsWith(CANONICAL_CELL_PREFIX)).toBe(true);
  });

  it("distinct composites → distinct store digests; key-shuffled equal composites → equal", () => {
    const a = new ObservedStore();
    a.applyObservedWrites([explicitWrite({ queue: 3n, shed: 1n })], 0n);
    const b = new ObservedStore();
    b.applyObservedWrites([explicitWrite({ queue: 3n, shed: 2n })], 0n);
    const c = new ObservedStore();
    c.applyObservedWrites([explicitWrite({ shed: 1n, queue: 3n })], 0n); // key order shuffled
    expect(a.digest()).not.toBe(b.digest());
    expect(a.digest()).toBe(c.digest());
  });

  it("ground→instrument derivation folds composites on the same gate", () => {
    const store = new ObservedStore();
    store.applyObservedWrites(
      [ground(funnel, { p50: 120n, p99: 4_000n }, 0n), instrument(honestBinding(funnel, CLASS_TRACING))],
      0n,
    );
    const cell = store.read(funnel);
    expect(String(cell.value).startsWith(CANONICAL_CELL_PREFIX)).toBe(true);
    expect(cell.value).toBe(foldCompositeCellValue({ p99: 4_000n, p50: 120n })); // order-proof
    // The ladder (history) stores the folded primitive, never the raw object:
    const points = store.history(funnel, ResolutionBand.Fine); // CLASS_TRACING bands Fine
    expect(points.length).toBeGreaterThan(0);
    expect(typeof points[0]!.value).toBe("string");
  });

  it("primitives and strings pass through untouched (fold is composite-only)", () => {
    expect(foldCompositeCellValue(7n)).toBe(7n);
    expect(foldCompositeCellValue("plain")).toBe("plain");
    expect(foldCompositeCellValue(null)).toBeNull();
    const folded = String(foldCompositeCellValue({ a: 1n }));
    expect(folded.startsWith(CANONICAL_CELL_PREFIX)).toBe(true);
    expect(foldCompositeCellValue({ a: 1n })).toBe(folded); // deterministic
    expect(foldCompositeCellValue({ a: 2n })).not.toBe(folded);
  });

  it("fairness channels keep the RAW value (never lie to the preview)", () => {
    const store = new ObservedStore();
    store.applyObservedWrites([{ ...ground(funnel, { up: 1n }, 0n), fairnessChannel: "pulse-strip" }], 0n);
    const truth = store.pulseStrip(funnel);
    expect(truth.value).toEqual({ up: 1n });
  });
});

describe("cells frozen at construction (FIX-8)", () => {
  const binding: InstrumentBinding = honestBinding(funnel, CLASS_TRACING);

  it("every constructed cell object refuses in-place mutation", () => {
    const cells: ObservedCell<unknown>[] = [
      unknownCell(),
      unknownCellWithCoverage(FIXED_ONE),
      deriveCell(binding, { atUs: 0n, value: 5n }, 0n),
    ];
    for (const cell of cells) {
      expect(Object.isFrozen(cell)).toBe(true);
      expect(() => {
        (cell as { value: unknown }).value = 999n;
      }).toThrow(TypeError);
    }
  });

  it("store reads, unknown defaults and fairness readings all come back frozen", () => {
    const store = new ObservedStore();
    store.applyObservedWrites([ground(funnel, 3n, 0n), instrument(binding)], 0n);
    expect(Object.isFrozen(store.read(funnel))).toBe(true);
    expect(Object.isFrozen(store.read(key("nobody", "cpu")))).toBe(true); // unknownCell escape
    store.applyObservedWrites([{ ...ground(funnel, { deep: 1n }, 0n), fairnessChannel: "site-preview" }], 0n);
    const preview = store.sitePreview(funnel);
    expect(Object.isFrozen(preview)).toBe(true);
    expect(() => {
      (preview as { status: string }).status = "live";
    }).toThrow(TypeError);
  });

  it("a producer's mutable cell object is never stored by reference", () => {
    const store = new ObservedStore();
    const loose = {
      value: 1n,
      fidelity: ResolutionBand.Exact,
      freshnessUs: 0n,
      coverage: FIXED_ONE,
      certainty: FIXED_ONE,
      status: "live" as const,
    };
    store.applyObservedWrites([{ key: funnel, causeId: asCauseId("c"), cell: loose }], 0n);
    loose.value = 2n; // producer scribbles AFTER the write
    expect(store.read(funnel).value).toBe(1n); // gate snapshot unaffected
    expect(Object.isFrozen(store.read(funnel))).toBe(true);
  });
});
