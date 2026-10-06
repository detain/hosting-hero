/**
 * G3 proto runner — gate-local determinism + dial/ROC proofs (node env).
 * Mirrors the headless acceptance claims at PROJECTION level: same seed ⇒
 * identical frames, dial moves the lane split, the triple fold is the
 * canonical Π value, defense upgrade moves the FP arm not the damage, and
 * terminal pip cells are pruned (strip stays live).
 */
import { describe, expect, it } from "vitest";
import { encodeProjection, type SimProjection } from "../../../shared/protocol.ts";
import { createG3Runner } from "../g3Runner.ts";
import { deriveLaneSplit, derivePips, FIXED_SCALE } from "../pips.ts";
import { G3_TRIPLE_FOLD } from "../g3Scenario.ts";

type Runner = ReturnType<typeof createG3Runner>;

function steps(runner: Runner, ticks: number): SimProjection[] {
  const out: SimProjection[] = [];
  for (let i = 0; i < ticks; i += 1) out.push(runner.headlessStep(100));
  return out;
}

function cellValue(frame: SimProjection, suffix: string): number | string | bigint | null {
  for (const [key, cell] of frame.observed) {
    if (String(key).endsWith(suffix)) return cell.value;
  }
  return null;
}

describe("G3Runner determinism (protocol frame level)", () => {
  it("two fresh runners on one seed emit byte-identical frames", () => {
    const a = steps(createG3Runner({ seed: 5, dialPercent: 40 }), 20).map(encodeProjection);
    const b = steps(createG3Runner({ seed: 5, dialPercent: 40 }), 20).map(encodeProjection);
    expect(a).toStrictEqual(b);
  });

  it("a different seed diverges", () => {
    const a = JSON.stringify(steps(createG3Runner({ seed: 5, dialPercent: 40 }), 15).map(encodeProjection));
    const b = JSON.stringify(steps(createG3Runner({ seed: 6, dialPercent: 40 }), 15).map(encodeProjection));
    expect(a).not.toBe(b);
  });
});

describe("G3Runner dial splits the same traffic", () => {
  it("dial 40 vs 90: lenient dial tolerates the 0.688 fold — no yanks", () => {
    const strict = steps(createG3Runner({ seed: 11, dialPercent: 40 }), 16).at(-1)!;
    const lenient = steps(createG3Runner({ seed: 11, dialPercent: 90 }), 16).at(-1)!;
    const s = deriveLaneSplit(strict);
    const l = deriveLaneSplit(lenient);
    expect(s.demoted).toBeGreaterThan(0); // wire folds > 0.40 ⇒ yanked deep
    expect(l.demoted).toBe(0); // 0.688 ≤ 0.90 ⇒ express keeps them

    // the canonical Π(1−cᵢ) triple appears VERBATIM as a unit confidence
    const confidences = [...strict.observed]
      .filter(([key]) => String(key).endsWith("::confidence"))
      .map(([, cell]) => Number(cell.value ?? -1));
    expect(confidences).toContain(Number(G3_TRIPLE_FOLD));
  });

  it("per-unit lane cells agree with the pip shapes (renderer contract)", () => {
    const last = steps(createG3Runner({ seed: 12, dialPercent: 30 }), 14).at(-1)!;
    const pips = derivePips(last);
    expect(pips.some((p) => p.lane === "deep")).toBe(true);
    expect(pips.some((p) => p.lane === "express")).toBe(true);
    expect(pips.every((p) => p.confidence >= 0 && p.confidence <= 1)).toBe(true);
    const deepPip = pips.find((p) => p.lane === "deep");
    expect(deepPip!.confidence).toBeGreaterThanOrEqual(Number(G3_TRIPLE_FOLD) / FIXED_SCALE - 1e-9);
  });

  it("terminal units are pruned from the pip strip (live truth only)", () => {
    const last = steps(createG3Runner({ seed: 13, dialPercent: 40 }), 18).at(-1)!;
    const terminated =
      last.counters.served + last.counters.blockedFalsePositive + last.counters.landed + last.counters.bounced;
    expect(terminated).toBeGreaterThan(0);
    const liveConfidences = [...last.observed.keys()].filter((k) => String(k).endsWith("::confidence")).length;
    expect(liveConfidences).toBe(derivePips(last, 9999).length);
    expect(liveConfidences).toBeLessThan(terminated + liveConfidences);
  });
});

describe("G3Runner defense upgrade moves the curve, not the damage", () => {
  it("door verb flips the benign arm; FP counters answer, door answers once", () => {
    const chill = createG3Runner({ seed: 14, dialPercent: 40, falsePositivePercent: 40 });
    const armed = createG3Runner({ seed: 14, dialPercent: 40, falsePositivePercent: 40 });
    const c = steps(chill, 14).at(-1)!;
    armed.upgradeDefense(); // pass-through → challenge at the next tick
    const a = steps(armed, 14).at(-1)!;

    // waf-1 boots PASS-THROUGH: no challenge verdicts, zero false positives
    expect(Number(cellValue(c, "waf-1::falsePositives") ?? 0)).toBe(0);
    // upgrade ⇒ same traffic, benign FP arm now live (curve moved)
    expect(Number(cellValue(a, "waf-1::falsePositives") ?? 0)).toBeGreaterThan(0);
    expect(a.counters.blockedFalsePositive).toBeGreaterThan(c.counters.blockedFalsePositive);
    // the upgrade travelled the door exactly once, no refusals
    expect(armed.stats().doorExecuted).toBe(1);
    expect(armed.stats().doorRefused).toBe(0);
    // and the sticky ledger now has spikes to feed demotions (suspicion story)
    expect(a.counters.served).toBeGreaterThan(0);
  });
});
