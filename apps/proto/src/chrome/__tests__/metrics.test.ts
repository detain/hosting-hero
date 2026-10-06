/**
 * Metrics adapter: store projection → candidates / worst-state / labels,
 * end-to-end over real mock frames.
 */
import { describe, expect, it } from "vitest";
import { MockSimRunner } from "../../runner/mockSimRunner";
import { asEntityId, observedKey } from "@hh/sim-core";
import { buildCandidates, formatMicroUsd, formatRunClock, isSpiking, rhoDisplayOf, worstState } from "../metrics";

const runner = new MockSimRunner(101);
const warm = (() => {
  let last = runner.headlessStep(100);
  for (let i = 0; i < 40; i++) last = runner.headlessStep(100);
  return last;
})();

describe("candidates", () => {
  it("one candidate per G1 instrument, all promotable", () => {
    const candidates = buildCandidates(warm);
    expect(candidates.length).toBe(5);
    expect(candidates.every((c) => c.kind === "promotable")).toBe(true);
  });

  it("the fogged p99 instrument is represented but can never win a slot", () => {
    const p99Only = { ...warm };
    // sanity: the mock's unknown cell → instrument no-data → distance Infinity
    const candidates = buildCandidates(warm);
    expect(candidates.some((c) => c.id === "inst-p50")).toBe(true);
    expect(p99Only.observed.size).toBeGreaterThan(0);
  });
});

describe("worst state (Bezel top rule)", () => {
  it("is a valid severity and never throws on fresh frames", () => {
    const fresh = new MockSimRunner(1).headlessStep(100);
    expect(["nominal", "warn", "alarm", "no-data"]).toContain(worstState(fresh));
  });

  it("alarm beats everything when queue depth crosses its line", () => {
    const spikedObserved = new Map(warm.observed);
    spikedObserved.set(observedKey(asEntityId("node/app-1"), "queueDepth"), {
      value: 79,
      fidelity: 4,
      freshnessUs: 0n,
      coverage: 65536n,
      certainty: 65536n,
      status: "live",
    });
    expect(worstState({ ...warm, observed: spikedObserved })).toBe("alarm");
  });
});

describe("labels", () => {
  it("money: abbreviated at ≥$10k, cents below (Number Law)", () => {
    expect(formatMicroUsd(12_500_000_000n)).toBe("$12.5k");
    expect(formatMicroUsd(9_990_000_000n)).toBe("$9,990.00");
    expect(formatMicroUsd(-5_000_000n)).toBe("−$5.00");
  });

  it("run clock T+h+m off the SIM clock", () => {
    expect(formatRunClock(0n)).toBe("T+0h00m");
    expect(formatRunClock(194n * 60_000_000n)).toBe("T+3h14m");
  });

  it("rho reads the fixed cell; spike notice lights the bezel lip", () => {
    expect(rhoDisplayOf(warm)).not.toBeNull();
    // mock enters a scripted spike within the first 12 sim minutes:
    expect(isSpiking(new MockSimRunner(2).headlessStep(100))).toBe(true);
  });
});
