/**
 * Mock runner: the toy model breathes on the canonical clock ratios, the
 * observed cells carry the fake-fog trio, and identical seeds produce
 * identical series (parity discipline, even for a placeholder).
 */
import { describe, expect, it } from "vitest";
import { MockSimRunner } from "../runner/mockSimRunner";
import { observedKey, asEntityId } from "@hh/sim-core";

const LANE = asEntityId("lane/ingress-1");
const NODE = asEntityId("node/app-1");

function run(seed: number, steps: number, dtMs = 100) {
  const runner = new MockSimRunner(seed);
  let last = runner.headlessStep(dtMs);
  for (let i = 1; i < steps; i++) last = runner.headlessStep(dtMs);
  return { runner, last };
}

describe("clock discipline", () => {
  it("1 real s = 1 sim min at 1× (100 ms step → 6 sim s)", () => {
    const { last } = run(1, 10);
    // headlessStep is called 10× without setSpeed → speed 1×.
    expect(last.clocks.simUs).toBe(60_000_000n);
  });

  it("speed scales observation tempo, not the model per sim-time", () => {
    const slow = new MockSimRunner(7);
    const fast = new MockSimRunner(7);
    fast.setSpeed(4);
    slow.headlessStep(100);
    fast.headlessStep(100);
    expect(Number(fast.projection().clocks.simUs)).toBeGreaterThan(Number(slow.projection().clocks.simUs));
  });
});

describe("observed-layer contents", () => {
  it("carries live rho + health as Q16.16 bigint cells", () => {
    const { last } = run(3, 5);
    const rho = last.observed.get(observedKey(NODE, "utilizationRho"));
    expect(typeof rho?.value).toBe("bigint");
    expect(rho?.status).toBe("live");
  });

  it("ships the fake-fog trio: live, stale, and NO-DATA-unknown", () => {
    const { last } = run(3, 1);
    const p50 = last.observed.get(observedKey(NODE, "p50LatencyUs"));
    const p99 = last.observed.get(observedKey(NODE, "p99LatencyUs"));
    expect(p50?.status).toBe("stale");
    expect(p50?.value).not.toBeNull(); // stale keeps its last value
    expect(p99?.value).toBeNull();
    expect(p99?.coverage).toBe(0n);
  });

  it("lane stats carry classMix and a histogram ref — stats not entities", () => {
    const { last } = run(3, 1);
    const lane = last.lanes.find((l) => l.laneId === LANE);
    expect(lane?.classMix["express"]).toBeDefined();
    expect(lane?.latencyDistributionRef).toContain("p95");
    // No per-unit field can exist on LaneStats by construction; this guards
    // the LAW by asserting the aggregate carries what motes need:
    expect(lane?.ratePerMin).toBeTypeOf("bigint");
    expect(lane?.health).toBeTypeOf("bigint");
  });
});

describe("toy queueing behavior", () => {
  it("counters are monotonic and start moving", () => {
    const { runner } = run(11, 1);
    let prev = { served: 0, bounced: 0 };
    for (let i = 0; i < 60; i++) {
      const p = runner.headlessStep(100);
      expect(p.counters.served).toBeGreaterThanOrEqual(prev.served);
      expect(p.counters.bounced).toBeGreaterThanOrEqual(prev.bounced);
      prev = { served: p.counters.served, bounced: p.counters.bounced };
    }
    expect(prev.served + prev.bounced).toBeGreaterThan(0);
  });

  it("aggression slider raises amber-403s (the G3 teaser works on the mock)", () => {
    const chill = run(21, 80);
    const hot = new MockSimRunner(21);
    hot.submit({
      seq: 1,
      clock: "sim",
      atUs: 0n,
      origin: "player",
      payload: { kind: "slider", control: "defense.aggression", value: 65536n },
    });
    let hotLast = hot.headlessStep(100);
    for (let i = 1; i < 80; i++) hotLast = hot.headlessStep(100);
    expect(hotLast.counters.blockedFalsePositive).toBeGreaterThan(
      chill.last.counters.blockedFalsePositive,
    );
  });

  it("same seed + same steps → identical counters (placeholder parity)", () => {
    const a = run(99, 30).last;
    const b = run(99, 30).last;
    expect(a.counters).toEqual(b.counters);
    expect(a.lanes[0]?.health).toBe(b.lanes[0]?.health);
  });
});
