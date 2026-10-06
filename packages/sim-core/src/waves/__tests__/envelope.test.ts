/**
 * Envelope phase arithmetic (§1.7 shape law, R-24).
 * All asserts are exact bigint/Fixed — clock-scale invariant by construction.
 */
import { describe, expect, it } from "vitest";
import type { EventEnvelope } from "../envelope.js";
import {
  drawPlacementMinute,
  envelopeEndUs,
  envelopeLengthUs,
  minuteWeights,
  phaseAt,
  toWaveEnvelope,
} from "../envelope.js";
import { FIXED_ONE, FIXED_ZERO, fromRatio } from "../../kernel/fixed.js";
import { minutesToSimUs, scaleUs, simScale } from "../../kernel/time.js";
import { openStream } from "../../kernel/rng.js";
import { asRunSeed } from "../../types.js";

function env(over: Partial<EventEnvelope> = {}): EventEnvelope {
  return {
    id: "e1",
    tableId: "t",
    startUs: minutesToSimUs(100),
    rampUs: minutesToSimUs(10),
    plateauUs: minutesToSimUs(20),
    decayUs: minutesToSimUs(5),
    composition: [{ threatId: "x", sharePct: 100, band: "storm" }],
    telegraphBand: "storm",
    ...over,
  };
}

describe("phaseAt — exact half-open boundaries", () => {
  it("pre before start", () => {
    expect(phaseAt(env(), minutesToSimUs(99) )).toEqual({ phase: "pre", progress: FIXED_ZERO });
  });
  it("ramp starts exactly at startUs with progress 0", () => {
    expect(phaseAt(env(), minutesToSimUs(100))).toEqual({ phase: "ramp", progress: FIXED_ZERO });
  });
  it("ramp midpoint is exactly 0.5 (Fixed 32768)", () => {
    expect(phaseAt(env(), minutesToSimUs(105))).toEqual({ phase: "ramp", progress: fromRatio(1n, 2n) });
  });
  it("last microsecond of ramp is just under 1", () => {
    const s = phaseAt(env(), minutesToSimUs(110) - 1n);
    expect(s.phase).toBe("ramp");
    expect(s.progress < FIXED_ONE).toBe(true);
  });
  it("plateau begins exactly at ramp end", () => {
    expect(phaseAt(env(), minutesToSimUs(110))).toEqual({ phase: "plateau", progress: FIXED_ZERO });
  });
  it("decay begins exactly at plateau end, quarter way is 0.25", () => {
    expect(phaseAt(env(), minutesToSimUs(130))).toEqual({ phase: "decay", progress: FIXED_ZERO });
    expect(phaseAt(env(), minutesToSimUs(130) + minutesToSimUs(5) / 4n)).toEqual({
      phase: "decay",
      progress: fromRatio(1n, 4n),
    });
  });
  it("post from envelope end onward, progress pinned to 1", () => {
    expect(phaseAt(env(), envelopeEndUs(env()))).toEqual({ phase: "post", progress: FIXED_ONE });
    expect(phaseAt(env(), envelopeEndUs(env()) + 12_345n)).toEqual({ phase: "post", progress: FIXED_ONE });
  });
  it("zero-length spans are skipped, never reported", () => {
    const e = env({ rampUs: 0n, plateauUs: 0n, decayUs: 0n });
    expect(phaseAt(e, minutesToSimUs(100)).phase).toBe("post");
    const e2 = env({ rampUs: 0n, plateauUs: minutesToSimUs(4), decayUs: 0n });
    expect(phaseAt(e2, minutesToSimUs(102)).phase).toBe("plateau");
  });
});

describe("length math", () => {
  it("length = ramp+plateau+decay in sim µs", () => {
    expect(envelopeLengthUs(env())).toBe(minutesToSimUs(35));
    expect(envelopeEndUs(env())).toBe(minutesToSimUs(135));
  });
});

describe("clock-scale invariance (R-24: envelopes live in SIM µs)", () => {
  for (const speed of [1, 2, 4] as const) {
    it(`5 sim-minutes into a 10-min ramp reads 0.5 at ${speed}× too`, () => {
      // 1 sim-minute = 1 real second at 1×; at speed× the REAL wall time
      // to cover 5 sim-minutes shrinks, but SIM elapsed (the envelope's
      // only input) is identical — so the phase read is identical.
      const realUs = minutesToSimUs(5) / BigInt(60 * speed);
      const simElapsed = scaleUs(realUs, simScale(speed));
      expect(simElapsed).toBe(minutesToSimUs(5));
      expect(phaseAt(env(), minutesToSimUs(100) + simElapsed)).toEqual({
        phase: "ramp",
        progress: fromRatio(1n, 2n),
      });
    });
  }
});

describe("minuteWeights", () => {
  it("ramp rises 1..rampMin, plateau flat, decay falls", () => {
    const w = minuteWeights(env({ rampUs: minutesToSimUs(3), plateauUs: minutesToSimUs(2), decayUs: minutesToSimUs(3) }));
    expect(w).toEqual([1, 2, 3, 3, 3, 3, 2, 1]);
  });
  it("degenerate point envelope still emits one weight", () => {
    expect(minuteWeights(env({ rampUs: 0n, plateauUs: 0n, decayUs: 0n }))).toEqual([1]);
  });
  it("rejects fractional-minute spans (authored law: whole minutes)", () => {
    expect(() => minuteWeights(env({ rampUs: 61_000_000n }))).toThrow(/whole-minute/);
  });
});

describe("drawPlacementMinute — timing-only rng", () => {
  it("stays inside window minus envelope", () => {
    const rng = openStream({ runSeed: asRunSeed(42n), domain: "test", simMinute: 0, entityId: null });
    for (let i = 0; i < 50; i += 1) {
      const m = drawPlacementMinute(rng.fork(`p${i}`), 30, 20);
      expect(m).toBeGreaterThanOrEqual(0);
      expect(m).toBeLessThanOrEqual(10);
    }
  });
  it("zero-slack window returns slot 0 deterministically", () => {
    const rng = openStream({ runSeed: asRunSeed(7n), domain: "test", simMinute: 0, entityId: null });
    expect(drawPlacementMinute(rng, 12, 12)).toBe(0);
  });
  it("envelope bigger than window fails loud", () => {
    const rng = openStream({ runSeed: asRunSeed(7n), domain: "test", simMinute: 0, entityId: null });
    expect(() => drawPlacementMinute(rng, 5, 9)).toThrow(/exceeds window/);
  });
});

describe("toWaveEnvelope projection (types.ts contract)", () => {
  it("maps storm band → telegraphed true, ratePerMin exact", () => {
    const w = toWaveEnvelope(env(), {
      role: "wave",
      unitsTotal: 70,
      dominantFamily: "malicious",
      entropyForecastPurchased: false,
      atUs: minutesToSimUs(105),
    });
    expect(w.tableId).toBe("t");
    expect(w.role).toBe("wave");
    expect(w.shape).toBe("ramp");
    expect(w.telegraphed).toBe(true);
    expect(w.ratePerMin).toBe(fromRatio(70n, 35n)); // 2.0 Fixed
    expect(w.dominantFamily).toBe("malicious");
  });
  it("hunter band is never telegraphed, entropy obeys the purchase", () => {
    const base = { role: "wave" as const, unitsTotal: 1, dominantFamily: "entropic" as const, atUs: minutesToSimUs(105) };
    const hunter = env({ telegraphBand: "hunter" });
    expect(toWaveEnvelope(hunter, { ...base, entropyForecastPurchased: true }).telegraphed).toBe(false);
    const entropy = env({ telegraphBand: "entropy" });
    expect(toWaveEnvelope(entropy, { ...base, entropyForecastPurchased: false }).telegraphed).toBe(false);
    expect(toWaveEnvelope(entropy, { ...base, entropyForecastPurchased: true }).telegraphed).toBe(true);
  });
});

describe("toWaveEnvelope post-guard (N6: a finished envelope cannot be projected)", () => {
  const base = {
    role: "wave" as const,
    unitsTotal: 1,
    dominantFamily: "malicious" as const,
    entropyForecastPurchased: false,
  };

  it("throws when atUs is exactly the end or past it (used to fall through to ramp)", () => {
    expect(() => toWaveEnvelope(env(), { ...base, atUs: envelopeEndUs(env()) })).toThrow(/at\/after envelope/);
    expect(() => toWaveEnvelope(env(), { ...base, atUs: envelopeEndUs(env()) + 12_345n })).toThrow(/at\/after envelope/);
  });

  it("a zero-length envelope cannot project even at its own start point", () => {
    const point = env({ rampUs: 0n, plateauUs: 0n, decayUs: 0n });
    expect(() => toWaveEnvelope(point, { ...base, atUs: minutesToSimUs(100) })).toThrow(/at\/after envelope/);
  });

  it("pre-start still projects as ramp (placement headroom is NOT post)", () => {
    expect(toWaveEnvelope(env(), { ...base, atUs: minutesToSimUs(99) }).shape).toBe("ramp");
  });

  it("phase → shape mapping stays exact inside the span", () => {
    expect(toWaveEnvelope(env(), { ...base, atUs: minutesToSimUs(100) }).shape).toBe("ramp"); // start boundary
    expect(toWaveEnvelope(env(), { ...base, atUs: minutesToSimUs(110) }).shape).toBe("plateau"); // ramp end
    expect(toWaveEnvelope(env(), { ...base, atUs: minutesToSimUs(130) }).shape).toBe("decay"); // plateau end
    expect(toWaveEnvelope(env(), { ...base, atUs: envelopeEndUs(env()) - 1n }).shape).toBe("decay"); // last micro
  });
});
