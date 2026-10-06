/**
 * Promotion law: permanents pass through, the two nearest-threshold metrics
 * earn slots, fogged metrics never earn anything, overflow aggregates to +N.
 */
import { describe, expect, it } from "vitest";
import { distanceToBreach, planPromotion, type MetricCandidate } from "../promotion";

const m = (over: Partial<MetricCandidate> & { id: string }): MetricCandidate => ({
  label: over.id,
  kind: "promotable",
  value: 50,
  threshold: 100,
  direction: "up",
  span: 100,
  ...over,
});

describe("planPromotion", () => {
  it("permanents are never in the promoted set and never counted against slots", () => {
    const plan = planPromotion(
      [m({ id: "cash", kind: "permanent" }), m({ id: "a", value: 95 }), m({ id: "b", value: 20 })],
      { promotedSlots: 2 },
    );
    expect(plan.permanent.map((c) => c.id)).toEqual(["cash"]);
    expect(plan.promoted.map((c) => c.id)).toEqual(["a", "b"]);
  });

  it("nearest-threshold wins, exactly 2 slots, remainder collapses +N", () => {
    const plan = planPromotion(
      [
        m({ id: "far", value: 5 }),
        m({ id: "near", value: 97 }),
        m({ id: "mid", value: 60 }),
        m({ id: "nearer", value: 90 }),
      ],
      { promotedSlots: 2 },
    );
    expect(plan.promoted.map((c) => c.id)).toEqual(["near", "nearer"]);
    expect(plan.collapsedCount).toBe(2);
  });

  it("down-direction breach works the other way (health at 0.36 vs threshold 0.35)", () => {
    const plan = planPromotion(
      [
        m({ id: "health", value: 0.36, threshold: 0.35, direction: "down", span: 1 }),
        m({ id: "rho", value: 0.2, threshold: 0.9, direction: "up", span: 1 }),
      ],
      { promotedSlots: 1 },
    );
    expect(plan.promoted.map((c) => c.id)).toEqual(["health"]);
  });

  it("NO DATA never gets promoted — a fogged metric can't fake urgency", () => {
    const plan = planPromotion(
      [m({ id: "ghost", value: null }), m({ id: "real", value: 99 })],
      { promotedSlots: 2 },
    );
    expect(plan.promoted.map((c) => c.id)).toEqual(["real"]);
    expect(plan.collapsedCount).toBe(0);
  });

  it("user pins fill slots before proximity picks", () => {
    const plan = planPromotion(
      [
        m({ id: "pinned", value: 1, userPinned: true }),
        m({ id: "near", value: 99 }),
        m({ id: "nearer", value: 99.9 }),
      ],
      { promotedSlots: 2 },
    );
    expect(plan.promoted.map((c) => c.id)).toEqual(["pinned", "nearer"]);
  });

  it("breached (value past threshold) clamps to maximum urgency — top slot", () => {
    expect(distanceToBreach(m({ id: "x", value: 140 }))).toBe(0);
    const plan = planPromotion(
      [m({ id: "breached", value: 140 }), m({ id: "nearly", value: 99.5 })],
      { promotedSlots: 1 },
    );
    expect(plan.promoted.map((c) => c.id)).toEqual(["breached"]);
  });

  it("bad capacity throws instead of silently promoting nothing", () => {
    expect(() => planPromotion([], { promotedSlots: -1 })).toThrow(/≥0/);
  });
});
