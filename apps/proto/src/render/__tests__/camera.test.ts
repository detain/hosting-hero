/**
 * Camera laws (§1.3): animated never cut, selection-preserved (the selected
 * object's screen position may not change across the flight), semantic zoom
 * swaps LOD rather than shrinking.
 */
import { describe, expect, it } from "vitest";
import {
  ALTITUDE_FLIGHT_MS,
  ALTITUDE_TABLE,
  CameraRig,
  easeInOutCubic,
  isAltitude,
  lodForFrame,
  panToKeepSelectionOnScreen,
  transitionFrame,
} from "../camera";
import { worldToScreen } from "../screenSpace";

const viewport = { width: 1280, height: 720 };
const selection = { x: 40, y: -12 };

function rigWithSelection() {
  const rig = new CameraRig(viewport);
  rig.select(selection);
  return rig;
}

describe("altitude FSM", () => {
  it("starts parked at Z2 (the estate default)", () => {
    const rig = new CameraRig(viewport);
    expect(rig.currentAltitude()).toBe("Z2");
    expect(rig.frame.transform.scale).toBe(ALTITUDE_TABLE.Z2.nominalZoom);
  });

  it("accepts only the four named altitudes", () => {
    expect(isAltitude("Z3")).toBe(true);
    expect(isAltitude("Z7")).toBe(false);
    expect(() => new CameraRig(viewport).go("Z9" as never, 0)).toThrow(/unknown altitude/);
  });

  it("same-altitude request is a no-op (no flight restart)", () => {
    const rig = rigWithSelection();
    const before = rig.frame;
    rig.go("Z2", 1_000);
    expect(rig.tick(1_500)).toBe(before);
  });
});

describe("animated transitions — never cut", () => {
  it("mid-flight frames exist between the two altitudes' zooms", () => {
    const rig = rigWithSelection();
    rig.go("Z4", 0);
    const mid = rig.tick(ALTITUDE_FLIGHT_MS / 2);
    expect(mid.transform.scale).toBeGreaterThan(ALTITUDE_TABLE.Z4.nominalZoom);
    expect(mid.transform.scale).toBeLessThan(ALTITUDE_TABLE.Z2.nominalZoom);
    expect(mid.transitioning).toBe(true);
  });

  it("flight lands exactly on the target nominal zoom and reports the new altitude", () => {
    const rig = rigWithSelection();
    rig.go("Z1", 0);
    const end = rig.tick(ALTITUDE_FLIGHT_MS);
    expect(end.transform.scale).toBeCloseTo(ALTITUDE_TABLE.Z1.nominalZoom, 6);
    expect(end.transitioning).toBe(false);
    expect(rig.currentAltitude()).toBe("Z1");
  });

  it("the DOMINANT altitude swaps mid-flight — semantic swap, not gradual shrink", () => {
    const from = ALTITUDE_TABLE.Z2;
    const to = ALTITUDE_TABLE.Z4;
    const rig = new CameraRig(viewport);
    const early = transitionFrame(from, to, 0.4, { x: 0, y: 0 }, rig.frame);
    const late = transitionFrame(from, to, 0.6, { x: 0, y: 0 }, rig.frame);
    expect(early.altitude).toBe("Z2");
    expect(late.altitude).toBe("Z4");
    expect(lodForFrame(early)).toBe("LOD1-racks");
    expect(lodForFrame(late)).toBe("LOD3-map");
  });

  it("selection's SCREEN POSITION is invariant for the whole flight", () => {
    const rig = rigWithSelection();
    rig.go("Z4", 0);
    const anchorScreen = worldToScreen(rig.frame.transform, selection);
    for (const t of [0, 0.17, 0.5, 0.83, 1]) {
      const frame = rig.tick(Math.round(t * ALTITUDE_FLIGHT_MS));
      const p = worldToScreen(frame.transform, selection);
      expect(p.x).toBeCloseTo(anchorScreen.x, 6);
      expect(p.y).toBeCloseTo(anchorScreen.y, 6);
    }
  });

  it("pan solve: screen = world·z' + pan keeps the given screen point", () => {
    const world = { scale: 1.0, panX: 640, panY: 360 };
    const screenPt = worldToScreen(world, selection);
    const pan = panToKeepSelectionOnScreen(selection, screenPt, 0.16);
    const moved = worldToScreen({ scale: 0.16, panX: pan.panX, panY: pan.panY }, selection);
    expect(moved.x).toBeCloseTo(screenPt.x, 9);
    expect(moved.y).toBeCloseTo(screenPt.y, 9);
  });
});

describe("easing", () => {
  it("pins 0→0 and 1→1, monotonic in between", () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
    let prev = -1;
    for (let t = 0; t <= 1.0001; t += 0.1) {
      const v = easeInOutCubic(Math.min(1, t));
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
    expect(() => easeInOutCubic(1.2)).toThrow(/\[0,1\]/);
  });
});
