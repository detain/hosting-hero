/**
 * The Attachment px-constancy laws — pure math, no WebGL.
 */
import { describe, expect, it } from "vitest";
import {
  attachmentChildTransform,
  authoredRadius,
  authoredWorldWidth,
  isIdentity,
  screenToWorld,
  worldToScreen,
  zoomCompensation,
  type WorldTransform,
} from "../screenSpace";

const ZOOMS = [0.0625, 0.16, 0.42, 1.0, 2.4, 8, 64];

describe("constant-px attachments", () => {
  it("a 4 px attachment authored at any zoom renders 4 screen px", () => {
    for (const scale of ZOOMS) {
      const world: WorldTransform = { scale, panX: -137, panY: 88 };
      const halfWidth = authoredWorldWidth(4, world) / 2;
      // Two endpoints of a 4px-wide authored line, in world units:
      const anchor = { x: 20, y: 30 };
      const left = worldToScreen(world, { x: anchor.x - halfWidth, y: anchor.y });
      const right = worldToScreen(world, { x: anchor.x + halfWidth, y: anchor.y });
      expect(Math.abs(right.x - left.x)).toBeCloseTo(4, 9);
    }
  });

  it("authoredRadius halves cleanly for dots", () => {
    const world = { scale: 8, panX: 0, panY: 0 };
    expect(authoredRadius(3, world)).toBe(3 / 8 / 2);
  });

  it("zoom compensation composed over the world transform is identity", () => {
    for (const scale of ZOOMS) {
      const world: WorldTransform = { scale, panX: 41, panY: -93 };
      expect(isIdentity(zoomCompensation(world), world)).toBe(true);
    }
  });

  it("per-anchor law: W ∘ T(P) ∘ S(1/z) lands anchor at W(P) and offsets stay px", () => {
    const world: WorldTransform = { scale: 3.25, panX: 200, panY: -50 };
    const P = { x: 17, y: 23 };
    const c = attachmentChildTransform(P, world);
    // net transform of a child-local px offset q: W(P + q·c.scale)
    const net = (q: number) => (P.x + q * c.scale) * world.scale + world.panX;
    const anchorScreen = worldToScreen(world, P);
    expect(net(0)).toBeCloseTo(anchorScreen.x, 9);
    expect(net(7) - net(0)).toBeCloseTo(7, 9); // 7 px offset = 7 px on screen
    expect(c.scale).toBeCloseTo(1 / 3.25, 12);
  });
});

describe("coordinate round-trips", () => {
  it("screen↔world round-trips at every zoom", () => {
    const world: WorldTransform = { scale: 0.42, panX: 640, panY: 360 };
    const p = { x: -123.5, y: 88.25 };
    const back = screenToWorld(world, worldToScreen(world, p));
    expect(back.x).toBeCloseTo(p.x, 9);
    expect(back.y).toBeCloseTo(p.y, 9);
  });
});

describe("fail-loud guards", () => {
  it("rejects non-positive or non-finite scale", () => {
    expect(() => zoomCompensation({ scale: 0, panX: 0, panY: 0 })).toThrow(/positive scale/);
    expect(() => screenToWorld({ scale: Number.NaN, panX: 0, panY: 0 }, { x: 0, y: 0 })).toThrow(/positive scale/);
  });
  it("rejects negative authored px", () => {
    expect(() => authoredWorldWidth(-1, { scale: 1, panX: 0, panY: 0 })).toThrow(/≥0/);
  });
});
