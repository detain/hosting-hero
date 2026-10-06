/**
 * G1 proto runner — gate-local determinism + control door proofs (node env).
 * The heavy acceptance ladder (5-seed sweep, conservation, ×100 harness
 * replay) lives in sim-core's gate-g1.test.ts; THIS file proves the proto
 * door itself: same seed ⇒ identical wire frames, slider + defense toggle
 * change the REAL curves through the protocol surface only.
 */
import { describe, expect, it } from "vitest";
import { encodeProjection } from "../../../shared/protocol.ts";
import { createG1Runner } from "../g1Runner.ts";
import { explainTriad, microUsToSeconds } from "../explain.ts";
import { G1_ZERO_TRIAD } from "../g1Scenario.ts";

function run(runner: ReturnType<typeof createG1Runner>, ticks: number): void {
  for (let i = 0; i < ticks; i += 1) runner.headlessStep(100);
}

describe("G1Runner determinism (protocol frame level)", () => {
  it("two fresh runners on one seed emit byte-identical frames", () => {
    const a = createG1Runner({ seed: 7, aggressionPercent: 40 });
    const b = createG1Runner({ seed: 7, aggressionPercent: 40 });
    for (let i = 0; i < 25; i += 1) {
      expect(encodeProjection(a.headlessStep(100))).toStrictEqual(encodeProjection(b.headlessStep(100)));
    }
  });

  it("a different seed diverges", () => {
    const a = createG1Runner({ seed: 7, aggressionPercent: 40 });
    const b = createG1Runner({ seed: 8, aggressionPercent: 40 });
    let diverged = false;
    for (let i = 0; i < 25 && !diverged; i += 1) {
      diverged = JSON.stringify(encodeProjection(a.headlessStep(100))) !== JSON.stringify(encodeProjection(b.headlessStep(100)));
    }
    expect(diverged).toBe(true);
  });
});

describe("G1Runner controls move the curves (through observed cells only)", () => {
  const cell = (frame: ReturnType<typeof encodeProjection>, property: string): number => {
    const hit = frame.observed.find((c) => c.key.endsWith(`::${property}`));
    if (hit === undefined) return 0;
    return Number(hit.value ?? 0);
  };

  it("slider 0 vs 100: defenseBlocks and falsePositives rise, benignServed dips", () => {
    const chill = createG1Runner({ seed: 21, aggressionPercent: 0, startDepth: "challenge" });
    const paranoid = createG1Runner({ seed: 21, aggressionPercent: 100, startDepth: "challenge" });
    run(chill, 15);
    run(paranoid, 15);
    const low = encodeProjection(chill.headlessStep(100));
    const high = encodeProjection(paranoid.headlessStep(100));
    expect(cell(high, "defenseBlocks")).toBeGreaterThan(cell(low, "defenseBlocks"));
    expect(cell(high, "falsePositives")).toBeGreaterThan(cell(low, "falsePositives"));
    expect(cell(high, "fpWasteUs")).toBe(cell(high, "falsePositives") * 20_000_000);
    expect(cell(high, "benignServed")).toBeLessThan(cell(low, "benignServed"));
  });

  it("defense toggle travels the intent door and stops attribution when OFF", () => {
    const runner = createG1Runner({ seed: 22, aggressionPercent: 80, startDepth: "challenge" });
    run(runner, 6);
    expect(runner.stats().triad.neutralized).toBeGreaterThan(0);
    runner.toggleDefense(); // queues configure-node pass-through for next tick
    run(runner, 1);
    expect(runner.stats().triad.doorExecuted).toBe(1);
    expect(runner.stats().triad.doorRefused).toBe(0);
    const before = runner.stats().triad.neutralized;
    run(runner, 8);
    expect(runner.stats().triad.neutralized).toBe(before); // depth OFF ⇒ zero blocks
    expect(runner.stats().triad.threatsLanded).toBeGreaterThan(0); // and leaks appear
  });
});

describe("explain.ts — causal strings are generated from counters", () => {
  it("zero triad at defense OFF explains the OFF state", () => {
    const out = explainTriad(G1_ZERO_TRIAD, 0, "pass-through");
    expect(out.neutralized).toContain("Defense is OFF");
    expect(out.falsePositives).toContain("Paranoia is still free");
  });

  it("live numbers appear verbatim in the sentences", () =>
    {
    const triad = { ...G1_ZERO_TRIAD, neutralized: 17, falsePositives: 5, threatsLanded: 2, benignServed: 90 };
    const out = explainTriad(triad, 62, "challenge");
    expect(out.neutralized).toContain("17");
    expect(out.falsePositives).toContain("5 legitimate customers");
    expect(out.threatsLanded).toContain("2 malicious");
    expect(out.waste).toContain("62%");
  });

  it("microUsToSeconds formats µs with one decimal", () => {
    expect(microUsToSeconds(2_400_000n)).toBe("2.4s");
    expect(microUsToSeconds(0n)).toBe("0.0s");
  });
});
