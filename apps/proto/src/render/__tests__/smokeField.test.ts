/**
 * G1 mote field: motes are cosmetic interpolants of LaneStats — spawn density
 * follows rate, bounce geometry follows pressure, nothing per-unit crosses in.
 */
import { describe, expect, it } from "vitest";
import { SmokeField } from "../g1/smokeField";
import { displayToFixed } from "../../shared/protocol";
import { asEntityId, type LaneStats } from "@hh/sim-core";

const lane = (ratePerMin: number, health: number): LaneStats => ({
  laneId: asEntityId("lane/ingress-1"),
  ratePerMin: displayToFixed(ratePerMin),
  latencyDistributionRef: "hist/test",
  classMix: { standard: displayToFixed(0.7), express: displayToFixed(0.3) },
  health: displayToFixed(health),
});

describe("spawn from statistics", () => {
  it("a busier lane paints a denser field", () => {
    const calm = new SmokeField(1);
    const busy = new SmokeField(1);
    for (let i = 0; i < 40; i++) {
      calm.step(16, lane(120, 0.95), 0.02);
      busy.step(16, lane(2400, 0.95), 0.02);
    }
    expect(busy.step(0, lane(2400, 0.95), 0).motes.length).toBeGreaterThan(
      calm.step(0, lane(120, 0.95), 0).motes.length,
    );
  });

  it("spawn count tracks rate within a sane band over one second", () => {
    const field = new SmokeField(5);
    let spawned = 0;
    for (let i = 0; i < 60; i++) spawned += field.step(16.67, lane(960, 0.9), 0).spawned;
    // 960/min ÷ 8 (theatre divisor) = 120 motes/min → ~2/s over simulated 1 s
    expect(spawned).toBeGreaterThan(1);
    expect(spawned).toBeLessThan(10);
  });

  it("class-mix from stats shows up as express share of motes", () => {
    const field = new SmokeField(9);
    const seen = new Set<string>();
    for (let i = 0; i < 500; i++) {
      for (const m of field.step(50, lane(6000, 0.9), 0).motes) seen.add(m.classOf);
      field.step(0, lane(0, 0.9), 0);
    }
    expect(seen.has("express")).toBe(true);
    expect(seen.has("standard")).toBe(true);
  });
});

describe("bounce geometry", () => {
  it("full pressure sends motes back out (state bouncing → walk t down)", () => {
    const field = new SmokeField(3);
    let sawBouncing = false;
    for (let i = 0; i < 400; i++) {
      const frame = field.step(50, lane(3000, 0.2), 1);
      if (frame.motes.some((m) => m.state === "bouncing")) sawBouncing = true;
    }
    expect(sawBouncing).toBe(true);
  });

  it("zero pressure never bounces anyone", () => {
    const field = new SmokeField(4);
    for (let i = 0; i < 400; i++) {
      const frame = field.step(50, lane(3000, 1), 0);
      expect(frame.motes.every((m) => m.state === "flowing")).toBe(true);
    }
  });

  it("the field caps itself (maxMotes honored at absurd rates)", () => {
    const field = new SmokeField(6, 30);
    for (let i = 0; i < 200; i++) field.step(100, lane(1_000_000, 0.9), 0);
    expect(field.step(0, lane(0, 0.9), 0).motes.length).toBeLessThanOrEqual(30);
  });

  it("positions stay finite — no NaN leaks into geometry", () => {
    const field = new SmokeField(8);
    for (let i = 0; i < 300; i++) {
      for (const m of field.step(33, lane(1500, 0.5), 0.5).motes) {
        expect(Number.isFinite(m.t)).toBe(true);
        expect(Number.isFinite(m.band)).toBe(true);
      }
    }
  });

  it("rejects nonsense dt loudly", () => {
    const field = new SmokeField(2);
    expect(() => field.step(-1, lane(60, 1), 0)).toThrow(/bad dtMs/);
  });
});
