/**
 * Heartbeat: one grid, 0.5 Hz, pure function of wall time — offsets shift
 * phase but can never introduce drift, because there is no accumulator to drift.
 */
import { describe, expect, it } from "vitest";
import { HEARTBEAT_HZ, HEARTBEAT_PERIOD_MS, heartbeatCount, heartbeatPhase, heartbeatPulse } from "../heartbeat";

describe("the shared pulse", () => {
  it("runs at 0.5 Hz — 2000 ms period", () => {
    expect(HEARTBEAT_HZ).toBe(0.5);
    expect(HEARTBEAT_PERIOD_MS).toBe(2000);
    expect(heartbeatPhase(0)).toBe(0);
    expect(heartbeatPhase(1000)).toBeCloseTo(0.5, 12);
    expect(heartbeatPhase(2000)).toBeCloseTo(0, 12);
    expect(heartbeatPhase(4000)).toBeCloseTo(0, 12);
  });

  it("a fixed offset shifts phase — never frequency (desync is authored, not drift)", () => {
    const a = heartbeatPhase(1234, 0);
    const b = heartbeatPhase(1234, 0.25);
    expect(b).toBeCloseTo((a + 0.25) % 1, 12);
    // Over hours of runtime the pair keeps the SAME phase difference:
    const lateA = heartbeatPhase(60 * 60 * 1000 * 4, 0);
    const lateB = heartbeatPhase(60 * 60 * 1000 * 4, 0.25);
    expect(((lateB - lateA + 1) % 1)).toBeCloseTo(0.25, 12);
  });

  it("pulse is smooth, bounded, and shares the grid", () => {
    for (const t of [0, 250, 500, 999, 1000, 1999, 2000, 314159]) {
      const v = heartbeatPulse(t);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
    expect(heartbeatPulse(0)).toBeCloseTo(0, 9); // trough at phase 0
    expect(heartbeatPulse(1000)).toBeCloseTo(1, 9); // crest at half period
  });

  it("heartbeatCount is the shared blink clock for fleet sync", () => {
    expect(heartbeatCount(1999)).toBe(0);
    expect(heartbeatCount(2000)).toBe(1);
    expect(heartbeatCount(9500)).toBe(4);
  });

  it("rejects nonsense inputs loudly", () => {
    expect(() => heartbeatPhase(-5)).toThrow(/finite ≥0/);
    expect(() => heartbeatPhase(0, 1)).toThrow(/phaseOffset/);
  });
});
