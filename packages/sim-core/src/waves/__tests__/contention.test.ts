/**
 * Oversell → contention consumer (audit fix 2, heading 22992).
 * P(contention) = ((ratio − 1)/29)^2.2 × homogeneity, micro-unit bigint.
 * Pin discipline: ratio ≤ 1.0 must be PROVBLY inert (exact 0n, die never
 * rolled, plan byte-identical to the no-input arm); saturation (30:1 ×
 * homogeneity 1) must clump every arrival onto the envelope peak.
 */
import { describe, expect, it } from "vitest";
import { contentionProbabilityMicro, fifthRootNearest } from "../contention.js";
import { planWave, waveStream } from "../generate.js";
import type { WavePlanInput } from "../generate.js";
import { minuteWeights } from "../envelope.js";
import { INITIAL_DIRECTOR_STATE } from "../director.js";
import { ledgerSnapshot } from "../ledger.js";
import { buildInvitations } from "../ledger.js";
import { cleanTable } from "./fixtures.js";
import { asRunSeed } from "../../types.js";

const M = 1_000_000n;
const TABLE = cleanTable();
const EMPTY_LEDGER = ledgerSnapshot([], 0n);

function input(seed: bigint, extra: Partial<WavePlanInput> = {}): WavePlanInput {
  return {
    startMinute: 100,
    tick: 100n,
    rng: waveStream(asRunSeed(seed), 1, 100),
    director: INITIAL_DIRECTOR_STATE,
    ledger: EMPTY_LEDGER,
    invitations: buildInvitations({}),
    entropyForecastPurchased: false,
    ...extra,
  };
}

/* ═══════════════════════ 1 · curve math (pure bigint) ═══════════════════════ */

describe("contentionProbabilityMicro — the normalized 2.2-power curve", () => {
  it("ratio ≤ 1.0 is provably zero (digest-neutral default)", () => {
    for (const ratio of [0n, 1n, 999_999n, M]) {
      expect(contentionProbabilityMicro({ ratioMicro: ratio, homogeneityMicro: M })).toBe(0n);
    }
  });

  it("saturation: 30:1 × full homogeneity = exactly 1.0; beyond clamps", () => {
    expect(contentionProbabilityMicro({ ratioMicro: 30_000_000n, homogeneityMicro: M })).toBe(M);
    expect(contentionProbabilityMicro({ ratioMicro: 99_000_000n, homogeneityMicro: M })).toBe(M);
  });

  it("ratified detents land on the documented ramp (±0.2pp)", () => {
    const detents: [bigint, number][] = [
      [5_000_000n, 1.28],
      [12_000_000n, 11.85],
      [20_000_000n, 39.44],
    ];
    for (const [ratio, percent] of detents) {
      const p = Number(contentionProbabilityMicro({ ratioMicro: ratio, homogeneityMicro: M })) / 1e4;
      expect(Math.abs(p - percent)).toBeLessThan(0.2);
    }
  });

  it("monotone in both factors", () => {
    let prev = -1n;
    for (let r = 1_000_001n; r <= 30_000_000n; r += 977_771n) {
      const p = contentionProbabilityMicro({ ratioMicro: r, homogeneityMicro: M });
      expect(p >= prev).toBe(true);
      prev = p;
    }
    prev = -1n;
    for (let h = 0n; h <= M; h += 111_111n) {
      const p = contentionProbabilityMicro({ ratioMicro: 12_000_000n, homogeneityMicro: h });
      expect(p >= prev).toBe(true);
      prev = p;
    }
  });

  it("homogeneity discounts linearly; zero ⇒ zero (die never rolled)", () => {
    const full = contentionProbabilityMicro({ ratioMicro: 12_000_000n, homogeneityMicro: M });
    const half = contentionProbabilityMicro({ ratioMicro: 12_000_000n, homogeneityMicro: M / 2n });
    expect(Math.abs(Number(half) - Number(full) / 2)).toBeLessThanOrEqual(1);
    expect(contentionProbabilityMicro({ ratioMicro: 12_000_000n, homogeneityMicro: 0n })).toBe(0n);
  });

  it("fail-loud on garbage input", () => {
    expect(() => contentionProbabilityMicro({ ratioMicro: -1n, homogeneityMicro: M })).toThrow(RangeError);
    expect(() => contentionProbabilityMicro({ ratioMicro: 2_000_000n, homogeneityMicro: -5n })).toThrow(RangeError);
    expect(() => contentionProbabilityMicro({ ratioMicro: 2_000_000n, homogeneityMicro: 2n * M })).not.toThrow(); // clamps
  });
});

describe("fifthRootNearest — exact bigint root", () => {
  it("exact roots and nearest-rounding", () => {
    expect(fifthRootNearest(0n)).toBe(0n);
    expect(fifthRootNearest(1n)).toBe(1n);
    expect(fifthRootNearest(32n)).toBe(2n);
    expect(fifthRootNearest(10n ** 30n)).toBe(1_000_000n);
    expect(fifthRootNearest(33n)).toBe(2n); // closer to 2^5 than 3^5
    expect(fifthRootNearest(200n)).toBe(3n);
    expect(() => fifthRootNearest(-1n)).toThrow(RangeError);
  });
});

/* ═══════════════════════ 2 · planWave consumer seam ═══════════════════════ */

describe("planWave oversell input — inert at P=0, clumping at P=1", () => {
  it("absent vs baseline-ratio(1.0) vs P=0-homogeneity: byte-identical", () => {
    const plain = planWave(TABLE, 1, input(7n));
    const baseline = planWave(TABLE, 1, input(7n, { oversell: { ratioMicro: M, homogeneityMicro: M } }));
    const deadMix = planWave(TABLE, 1, input(7n, { oversell: { ratioMicro: 25_000_000n, homogeneityMicro: 0n } }));
    expect(baseline).toEqual(plain);
    expect(deadMix).toEqual(plain);
  });

  it("saturation parks EVERY arrival on the envelope peak minute", () => {
    const saturated = planWave(TABLE, 1, input(7n, { oversell: { ratioMicro: 30_000_000n, homogeneityMicro: M } }));
    const weights = minuteWeights(saturated.envelope);
    let peak = 0;
    for (let i = 1; i < weights.length; i += 1) if (weights[i]! > weights[peak]!) peak = i;
    const expected = saturated.startMinute + peak;
    expect(saturated.arrivals.length).toBeGreaterThan(0);
    for (const a of saturated.arrivals) expect(a.minute).toBe(expected);
    // Existence invariance holds through the clump: same census as the plain arm.
    const plain = planWave(TABLE, 1, input(7n));
    expect(JSON.stringify(saturated.unitsByThreat)).toBe(JSON.stringify(plain.unitsByThreat));
  });

  it("mid-curve actually moves minutes and stays deterministic per seed", () => {
    const plain = planWave(TABLE, 1, input(11n));
    const pressed = planWave(TABLE, 1, input(11n, { oversell: { ratioMicro: 20_000_000n, homogeneityMicro: M } }));
    expect(pressed.arrivals.map((a) => a.minute).join(",")).not.toBe(
      plain.arrivals.map((a) => a.minute).join(","),
    );
    const again = planWave(TABLE, 1, input(11n, { oversell: { ratioMicro: 20_000_000n, homogeneityMicro: M } }));
    expect(again.arrivals.map((a) => a.minute).join(",")).toBe(
      pressed.arrivals.map((a) => a.minute).join(","),
    );
    // the clump pulls a MATERIAL share onto the peak (expectation ≈ 39% at
    // 20:1; 15% is the falsifiable floor — an inert consumer can never cross it)
    const weights = minuteWeights(pressed.envelope);
    let peak = 0;
    for (let i = 1; i < weights.length; i += 1) if (weights[i]! > weights[peak]!) peak = i;
    const peakMinute = pressed.startMinute + peak;
    const onPeak = pressed.arrivals.filter((a) => a.minute === peakMinute).length;
    expect(onPeak / pressed.arrivals.length).toBeGreaterThan(0.15);
  });

  it("targets and unit ids are untouched by the clump (only timing moves)", () => {
    const pressed = planWave(TABLE, 1, input(13n, { oversell: { ratioMicro: 30_000_000n, homogeneityMicro: M } }));
    const plain = planWave(TABLE, 1, input(13n));
    expect(pressed.arrivals.map((a) => `${a.threatId}/${a.targetId}/${a.unitOrdinal}`).sort()).toStrictEqual(
      plain.arrivals.map((a) => `${a.threatId}/${a.targetId}/${a.unitOrdinal}`).sort(),
    );
    expect(pressed.events.map((e) => String(e.causeId)).sort()).toStrictEqual(
      plain.events.map((e) => String(e.causeId)).sort(),
    );
  });
});
