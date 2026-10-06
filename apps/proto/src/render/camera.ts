/**
 * Camera — the altitude FSM (§4.7 item 1.3):
 * "four altitudes Z1–Z4 as verbs … transitions animated never cut, selection
 * persists, selected object's screen position may not change … semantic zoom
 * (detail replaced not shrunk) … aggregate, don't shrink."
 *
 * Pure math + a small state machine; the Pixi side just applies each frame.
 * Altitude is DISCRETE truth (which LOD set paints); `zoom` is the continuous
 * bridge between two altitudes mid-flight. The semantic swap happens at the
 * frame's dominant altitude — nothing shrinks into illegibility.
 */
import type { WorldTransform, ScreenPoint } from "./screenSpace";
import { worldToScreen } from "./screenSpace";

export type Altitude = "Z1" | "Z2" | "Z3" | "Z4";
export const ALTITUDES: readonly Altitude[] = ["Z1", "Z2", "Z3", "Z4"];

/** What each altitude means semantically (the verb/action set lands here per
 *  WS-2 "altitudes as verbs"; P0 declares the LOD contract only). */
export type LodLevel = "LOD0-units" | "LOD1-racks" | "LOD2-aggregates" | "LOD3-map";

export interface AltitudeSpec {
  readonly altitude: Altitude;
  readonly nominalZoom: number; // px per world unit
  readonly lod: LodLevel;
  /** Continuous-motion budget per §1.3 (Z1 ∞ · Z2 ≤3/rack · Z3 heartbeat-only
   *  · Z4 arcs+weather only). Infinity encoded as -1 for JSON-safety. */
  readonly motionBudget: number;
}

export const ALTITUDE_TABLE: Readonly<Record<Altitude, AltitudeSpec>> = {
  Z1: { altitude: "Z1", nominalZoom: 2.4, lod: "LOD0-units", motionBudget: -1 },
  Z2: { altitude: "Z2", nominalZoom: 1.0, lod: "LOD1-racks", motionBudget: 3 },
  Z3: { altitude: "Z3", nominalZoom: 0.42, lod: "LOD2-aggregates", motionBudget: 0 },
  Z4: { altitude: "Z4", nominalZoom: 0.16, lod: "LOD3-map", motionBudget: 0 },
};

export function isAltitude(value: string): value is Altitude {
  return (ALTITUDES as readonly string[]).includes(value);
}

export function easeInOutCubic(t: number): number {
  if (!(t >= 0 && t <= 1)) throw new Error(`ease: t must be in [0,1], got ${t}`);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/* ═══════════════════════ transition frame math ═══════════════════════ */

export interface CameraFrame {
  readonly transform: WorldTransform;
  readonly altitude: Altitude; // dominant LOD for this frame
  readonly transitioning: boolean;
}

/** Selection-preservation law, as a pure solve: given the world point under
 *  the selection and the screen point it currently occupies, return the pan
 *  that keeps that screen point exact at a new zoom. */
export function panToKeepSelectionOnScreen(
  selectionWorld: ScreenPoint,
  itsCurrentScreenPoint: ScreenPoint,
  nextZoom: number,
): { panX: number; panY: number } {
  if (!(nextZoom > 0) || !Number.isFinite(nextZoom)) {
    throw new Error(`panToKeepSelection: bad zoom ${nextZoom}`);
  }
  return {
    panX: itsCurrentScreenPoint.x - selectionWorld.x * nextZoom,
    panY: itsCurrentScreenPoint.y - selectionWorld.y * nextZoom,
  };
}

/** One interpolated frame of an animated altitude flight. `from`/`to` are the
 *  endpoint frames; `t` is raw linear progress 0..1. Zoom interpolates on a
 *  log scale (perceptually even); pan interpolates so the anchor (the
 *  selection, or the viewport center when nothing is selected) holds its
 *  screen position the entire flight. */
export function transitionFrame(
  from: AltitudeSpec,
  to: AltitudeSpec,
  t: number,
  anchorWorld: ScreenPoint,
  currentFrom: CameraFrame,
): CameraFrame {
  const eased = easeInOutCubic(t);
  const zoom = Math.exp(Math.log(from.nominalZoom) * (1 - eased) + Math.log(to.nominalZoom) * eased);
  const anchorScreen = worldToScreen(currentFrom.transform, anchorWorld);
  const pan = panToKeepSelectionOnScreen(anchorWorld, anchorScreen, zoom);
  const dominantAltitude = eased < 0.5 ? from.altitude : to.altitude;
  return {
    transform: { scale: zoom, panX: pan.panX, panY: pan.panY },
    altitude: dominantAltitude,
    transitioning: t > 0 && t < 1,
  };
}

/* ═══════════════════════ the rig (state machine) ═══════════════════════ */

export const ALTITUDE_FLIGHT_MS = 600; // §1.1 Fold-time cadence for camera moves

export class CameraRig {
  private altitude: Altitude = "Z2";
  private flight: {
    readonly from: AltitudeSpec;
    readonly to: AltitudeSpec;
    readonly startWallMs: number;
    readonly anchorWorld: ScreenPoint;
    readonly baseFrame: CameraFrame;
  } | null = null;
  private selectionWorld: ScreenPoint | null = null;

  constructor(private readonly viewport: { width: number; height: number }) {
    // Start parked at the estate default altitude, selection anchor = center.
    const spec = ALTITUDE_TABLE[this.altitude];
    this.frame = {
      transform: {
        scale: spec.nominalZoom,
        panX: viewport.width / 2,
        panY: viewport.height / 2,
      },
      altitude: this.altitude,
      transitioning: false,
    };
  }

  frame: CameraFrame;

  currentAltitude(): Altitude {
    return this.flight === null ? this.altitude : this.frame.altitude;
  }

  select(worldPoint: ScreenPoint | null): void {
    this.selectionWorld = worldPoint;
  }

  /** Request an altitude change — ANIMATES, never cuts. Same-altitude request
   *  is a no-op (guards re-entrant clicks from restarting the flight). */
  go(altitude: Altitude, nowWallMs: number): void {
    if (!isAltitude(altitude)) {
      throw new Error(`CameraRig.go: unknown altitude "${altitude}"`);
    }
    const target = ALTITUDE_TABLE[altitude];
    if (this.flight === null && this.altitude === altitude) return;
    this.flight = {
      from: ALTITUDE_TABLE[this.frame.altitude],
      to: target,
      startWallMs: nowWallMs,
      anchorWorld: this.selectionWorld ?? this.viewportCenterWorld(),
      baseFrame: this.frame,
    };
    this.altitude = altitude;
  }

  /** Drive the machine each rAF; returns the frame to apply. */
  tick(nowWallMs: number): CameraFrame {
    if (this.flight === null) return this.frame;
    const t = Math.min(1, (nowWallMs - this.flight.startWallMs) / ALTITUDE_FLIGHT_MS);
    this.frame = transitionFrame(
      this.flight.from,
      this.flight.to,
      t,
      this.flight.anchorWorld,
      this.flight.baseFrame,
    );
    if (t >= 1) this.flight = null;
    return this.frame;
  }

  private viewportCenterWorld(): ScreenPoint {
    const inverse = this.frame.transform;
    return {
      x: (this.viewport.width / 2 - inverse.panX) / inverse.scale,
      y: (this.viewport.height / 2 - inverse.panY) / inverse.scale,
    };
  }
}

/** Semantic zoom decision for the scene graph: given the current frame, which
 *  LOD set paints? (Swap, never shrink — the compositor consults this and
 *  toggles layer content, not layer scale.) */
export function lodForFrame(frame: CameraFrame): LodLevel {
  return ALTITUDE_TABLE[frame.altitude].lod;
}
