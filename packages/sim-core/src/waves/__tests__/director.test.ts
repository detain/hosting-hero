/** Difficulty Director (§2.24 honest face): trough depth + entropy budget
 *  ONLY; never composition; never during an incident; draws replay-logged. */
import { describe, expect, it } from "vitest";
import {
  DEFAULT_DIRECTOR_CONFIG,
  INITIAL_DIRECTOR_STATE,
  SAWTOOTH_FLOOR_MICRO,
  applyEntropyBudgetFactor,
  applyTroughDepthFactor,
  directorPropose,
  setIncidentActive,
} from "../director.js";
import { FIXED_ONE, FIXED_ZERO, compare, fromRatio } from "../../kernel/fixed.js";
import { openStream } from "../../kernel/rng.js";
import { asRunSeed } from "../../types.js";
import type { DirectorState } from "../director.js";

function stream(seed: bigint, minute = 0) {
  return openStream({ runSeed: asRunSeed(seed), domain: "director", simMinute: minute, entityId: null });
}

describe("incident lockdown (R-31)", () => {
  it("mid-incident proposal is a total no-op and consumes NO rng", () => {
    const locked = setIncidentActive(INITIAL_DIRECTOR_STATE, true);
    const a = stream(1n);
    const b = stream(1n);
    const out = directorPropose(locked, 500n, a, DEFAULT_DIRECTOR_CONFIG);
    expect(out.refused).toBe("incident-active");
    expect(out.draw).toBeNull();
    expect(out.next).toBe(locked); // identity — literally unchanged
    // No rng consumed: a's next draw equals b's (fresh counter) next draw.
    expect(a.range(1_000_000)).toBe(b.range(1_000_000));
  });
});

describe("proposals outside incidents", () => {
  it("every draw is a DirectorDraw on an allowed subject only", () => {
    let state: DirectorState = INITIAL_DIRECTOR_STATE;
    const rng = stream(99n);
    const subjects = new Set<string>();
    for (let tick = 1n; tick < 400n; tick += 1n) {
      const out = directorPropose(state, tick, rng, DEFAULT_DIRECTOR_CONFIG);
      expect(out.refused).toBeNull();
      state = out.next;
      if (out.draw !== null) {
        subjects.add(out.draw.subject);
        expect(["sawtooth-trough-depth", "entropy-budget"]).toContain(out.draw.subject);
        expect(out.draw.atTick).toBe(tick);
        // Clamped within configured bounds:
        expect(compare(out.draw.value, DEFAULT_DIRECTOR_CONFIG.minFactor)).toBeGreaterThanOrEqual(0);
        expect(compare(out.draw.value, DEFAULT_DIRECTOR_CONFIG.maxFactor)).toBeLessThanOrEqual(0);
      }
    }
    expect(subjects.size).toBe(2); // both knobs seen over 400 ticks
  });

  it("same seed → same draw sequence (replay determinism)", () => {
    const run = (seed: bigint) => {
      let state = INITIAL_DIRECTOR_STATE;
      const rng = stream(seed);
      const draws: string[] = [];
      for (let tick = 0n; tick < 200n; tick += 1n) {
        const out = directorPropose(state, tick, rng, DEFAULT_DIRECTOR_CONFIG);
        state = out.next;
        if (out.draw !== null) draws.push(`${out.draw.subject}@${out.draw.value}`);
      }
      return draws;
    };
    expect(run(7n)).toEqual(run(7n));
    expect(run(7n).length).toBeGreaterThan(0);
  });

  it("extreme nudges still clamp to configured ceiling/floor", () => {
    const cfg = { ...DEFAULT_DIRECTOR_CONFIG, nudgeChancePct: 100, maxNudgeBps: 10_000, minFactor: fromRatio(1n, 2n), maxFactor: fromRatio(3n, 2n) };
    let state: DirectorState = INITIAL_DIRECTOR_STATE;
    const rng = stream(5n);
    for (let tick = 0n; tick < 300n; tick += 1n) {
      state = directorPropose(state, tick, rng, cfg).next;
      expect(compare(state.troughDepthFactor, cfg.minFactor)).toBeGreaterThanOrEqual(0);
      expect(compare(state.troughDepthFactor, cfg.maxFactor)).toBeLessThanOrEqual(0);
      expect(compare(state.entropyBudgetFactor, cfg.minFactor)).toBeGreaterThanOrEqual(0);
      expect(compare(state.entropyBudgetFactor, cfg.maxFactor)).toBeLessThanOrEqual(0);
    }
  });
});

describe("applyTroughDepthFactor", () => {
  const saw = [1_000_000n, 550_000n, 1_300_000n, 700_000n];
  it("factor 1.0 is identity", () => {
    expect(applyTroughDepthFactor(saw, FIXED_ONE)).toEqual(saw);
  });
  it("only sub-floor entries scale; peaks/floors untouched", () => {
    const halved = applyTroughDepthFactor(saw, fromRatio(1n, 2n));
    expect(halved[0]).toBe(1_000_000n);
    expect(halved[2]).toBe(1_300_000n);
    expect(halved[1]).toBe((550_000n + 1n) / 2n); // round-half-up ×0.5
    expect(halved[3]).toBe(350_000n);
  });
  it("returns a NEW array (purity)", () => {
    const out = applyTroughDepthFactor(saw, FIXED_ONE);
    expect(out).not.toBe(saw);
  });
  it("rejects negative factor", () => {
    expect(() => applyTroughDepthFactor(saw, FIXED_ZERO - 1n)).toThrow(/negative/);
  });
  it("floor constant matches pressure unit", () => {
    expect(SAWTOOTH_FLOOR_MICRO).toBe(1_000_000n);
  });
});

describe("applyEntropyBudgetFactor", () => {
  it("factor 1.0 identity; 0.5 rounds half-up", () => {
    expect(applyEntropyBudgetFactor(10, FIXED_ONE)).toBe(10);
    expect(applyEntropyBudgetFactor(3, fromRatio(1n, 2n))).toBe(2); // 1.5 → half-up 2
    expect(applyEntropyBudgetFactor(0, fromRatio(3n, 2n))).toBe(0);
  });
});
