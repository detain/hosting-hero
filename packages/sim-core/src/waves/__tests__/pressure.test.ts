/** Pressure law P(n)=100×1.115^n×S(n) — exact bigint micro domain, sheet B
 *  CANONICAL (OD-2 ratified 2026-10-09, ADR-0009), A|C PROVISIONAL
 *  alternates (§4.1 R-61). */
import { describe, expect, it } from "vitest";
import {
  ACTIVE_TUNING_SHEET,
  PRESSURE_MICRO,
  TUNING_SHEETS,
  parPressureMicro,
  resolveActiveSheet,
} from "../pressure.js";
import type { PressureParams } from "../pressure.js";

const NO_SAW: PressureParams = {
  baseMicro: 100n * PRESSURE_MICRO,
  growthNum: 223n,
  growthDen: 200n,
  sawtoothMicro: [1_000_000n],
};

describe("parPressureMicro", () => {
  it("P(0) = 100 points exactly", () => {
    expect(parPressureMicro(NO_SAW, 0)).toBe(100n * PRESSURE_MICRO);
  });
  it("P(1) = 100 × 223/200 exactly", () => {
    expect(parPressureMicro(NO_SAW, 1)).toBe((100n * PRESSURE_MICRO * 223n) / 200n);
  });
  it("applies the sawtooth multiplier", () => {
    const p: PressureParams = { ...NO_SAW, sawtoothMicro: [1_000_000n, 550_000n] };
    expect(parPressureMicro(p, 1)).toBe((100n * PRESSURE_MICRO * 223n * 550_000n) / (200n * 1_000_000n));
  });
  it("growth compounds without float drift at n=20 (exact round-half-up)", () => {
    // Mirrors the implementation's rational domain: base×223^n×1e6 ÷ (1e6×200^n).
    const num = 100n * PRESSURE_MICRO * 223n ** 20n * 1_000_000n;
    const den = PRESSURE_MICRO * 200n ** 20n;
    const halfUp = (2n * num + den) / (2n * den);
    expect(parPressureMicro(NO_SAW, 20)).toBe(halfUp);
  });
  it("rejects negative / fractional / oversized indices", () => {
    expect(() => parPressureMicro(NO_SAW, -1)).toThrow(/≥ 0/);
    expect(() => parPressureMicro(NO_SAW, 1.5)).toThrow(/≥ 0/);
    expect(() => parPressureMicro(NO_SAW, 5000)).toThrow(/4096/);
  });
});

describe("tuning sheets", () => {
  it("A and C stand PROVISIONAL; B carries the RATIFIED marker (OD-2, 2026-10-09)", () => {
    for (const id of ["A", "C"] as const) {
      expect(TUNING_SHEETS[id].status).toBe("PROVISIONAL");
      expect(TUNING_SHEETS[id].note).toContain("PROVISIONAL");
    }
    expect(TUNING_SHEETS.B.status).toBe("RATIFIED");
    expect(TUNING_SHEETS.B.note).toContain("RATIFIED");
    expect(TUNING_SHEETS.B.note).not.toContain("PROVISIONAL");
  });
  it("sheet B carries the documented series (L25564)", () => {
    expect(TUNING_SHEETS.B.params.sawtoothMicro.slice(0, 8)).toEqual([
      1_000_000n, 550_000n, 1_300_000n, 700_000n, 1_550_000n, 600_000n, 1_750_000n, 650_000n,
    ]);
  });
  it("sheet B is active — resolveActiveSheet() returns it (flip landed 2026-10-09)", () => {
    expect(ACTIVE_TUNING_SHEET).toBe("B");
    expect(resolveActiveSheet()).toBe(TUNING_SHEETS.B);
    expect(resolveActiveSheet().status).toBe("RATIFIED");
  });
});
