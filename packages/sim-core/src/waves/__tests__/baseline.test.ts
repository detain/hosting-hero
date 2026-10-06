/** Diurnal baselines as authored DATA (§1.7: continuous, never zero). */
import { describe, expect, it } from "vitest";
import { FLAT_BASELINE, parseDiurnalCurve, sampleCurveMicro } from "../baseline.js";
import { MICROS_PER_DAY, MICROS_PER_HOUR, minutesToSimUs } from "../../kernel/time.js";

const CURVE = {
  id: "web-midday",
  periodUs: MICROS_PER_DAY,
  points: [
    { atUs: 0n, valueMicro: 400_000n }, // midnight
    { atUs: MICROS_PER_HOUR * 12n, valueMicro: 1_600_000n }, // noon
    { atUs: MICROS_PER_HOUR * 20n, valueMicro: 900_000n }, // evening
  ],
};

describe("parseDiurnalCurve — boundary validation", () => {
  it("accepts authored data", () => {
    expect(parseDiurnalCurve(CURVE).points.length).toBe(3);
  });
  it("rejects a zero-value point (never-zero law)", () => {
    expect(() =>
      parseDiurnalCurve({ ...CURVE, points: [{ atUs: 0n, valueMicro: 0n }, { atUs: 5n, valueMicro: 1n }] }),
    ).toThrow(/never zero|valueMicro/);
  });
  it("rejects non-ascending times", () => {
    expect(() =>
      parseDiurnalCurve({ ...CURVE, points: [{ atUs: 10n, valueMicro: 1n }, { atUs: 5n, valueMicro: 1n }, { atUs: 20n, valueMicro: 1n }] }),
    ).toThrow(/ascend|ascending/);
  });
  it("rejects fewer than two points", () => {
    expect(() => parseDiurnalCurve({ ...CURVE, points: [{ atUs: 0n, valueMicro: 1n }] })).toThrow(/at least two|two points|points/);
  });
  it("rejects junk input", () => {
    expect(() => parseDiurnalCurve("nope")).toThrow();
  });
});

describe("sampleCurveMicro — exact integer interpolation", () => {
  const curve = parseDiurnalCurve(CURVE);
  it("hits authored anchors exactly", () => {
    expect(sampleCurveMicro(curve, 0n)).toBe(400_000n);
    expect(sampleCurveMicro(curve, MICROS_PER_HOUR * 12n)).toBe(1_600_000n);
    expect(sampleCurveMicro(curve, MICROS_PER_HOUR * 20n)).toBe(900_000n);
  });
  it("midpoint of a rising leg is the integer mean", () => {
    expect(sampleCurveMicro(curve, MICROS_PER_HOUR * 6n)).toBe((400_000n + 1_600_000n) / 2n);
  });
  it("wraps the period (24h reads like 0h)", () => {
    expect(sampleCurveMicro(curve, MICROS_PER_DAY)).toBe(sampleCurveMicro(curve, 0n));
    expect(sampleCurveMicro(curve, MICROS_PER_DAY + MICROS_PER_HOUR)).toBe(sampleCurveMicro(curve, MICROS_PER_HOUR));
  });
  it("wrap leg interpolates evening→midnight", () => {
    const at = MICROS_PER_HOUR * 22n; // halfway 20h→24h(→0h)
    expect(sampleCurveMicro(curve, at)).toBe((900_000n + 400_000n) / 2n);
  });
  it("flat baseline is constant", () => {
    expect(sampleCurveMicro(FLAT_BASELINE, 0n)).toBe(sampleCurveMicro(FLAT_BASELINE, minutesToSimUs(777)));
  });
});
