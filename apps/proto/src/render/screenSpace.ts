/**
 * Screen-space math — the Attachment layer's px-constancy law, pure and
 * WebGL-free (§4.7 item 1.1: "Attachment rides units at screen-space scale,
 * SAME PX THICKNESS EVERY ZOOM"; multi-pass list: "screen-space line thickness
 * in shaders (px-constancy laws)").
 *
 * The trick, stated once: the world layer carries a similarity transform
 * W = {scale, panX, panY}. Attachments must LOOK un-transformed, so their
 * container carries W⁻¹ relative to world coordinates (positions still follow
 * their unit — position = W·p, but geometry is authored at screen px via the
 * inverse on the layer). These are the functions the compositor calls; the
 * tests below are the law.
 *
 * All floats — display math that cannot touch replay (§3.4 escape hatch).
 */

/** Axis-aligned similarity transform: screen = world·scale + pan.
 *  (Iso yaw, when it lands, is an extra rotation matrix composed in front.) */
export interface WorldTransform {
  readonly scale: number; // zoom: px-per-world-unit
  readonly panX: number; // screen px
  readonly panY: number;
}

export interface ScreenPoint {
  readonly x: number;
  readonly y: number;
}

export function worldToScreen(world: WorldTransform, point: ScreenPoint): ScreenPoint {
  return {
    x: point.x * world.scale + world.panX,
    y: point.y * world.scale + world.panY,
  };
}

export function screenToWorld(world: WorldTransform, point: ScreenPoint): ScreenPoint {
  assertFiniteTransform(world);
  return {
    x: (point.x - world.panX) / world.scale,
    y: (point.y - world.panY) / world.scale,
  };
}

/** The zoom-compensation matrix for the Attachment layer, expressed as the
 *  inverse similarity: apply after W and the net transform is identity —
 *  geometry keeps world *position* (it follows its unit) but screen *scale*.
 *  Returned as {scale, panX, panY} in the compositor's layer terms. */
export function zoomCompensation(world: WorldTransform): WorldTransform {
  assertFiniteTransform(world);
  const inv = 1 / world.scale;
  return {
    scale: inv,
    panX: -world.panX * inv,
    panY: -world.panY * inv,
  };
}

/** Author an attachment of `constantPx` screen px: how wide to draw it in
 *  WORLD units so that after the layer composition it lands at exactly
 *  `constantPx` on screen. This is the one-liner every Attachment renderer
 *  asks before drawing (§3.1 refusal discipline applies to sizes too). */
export function authoredWorldWidth(constantPx: number, world: WorldTransform): number {
  if (!Number.isFinite(constantPx) || constantPx < 0) {
    throw new Error(`authoredWorldWidth: constantPx must be a finite ≥0 number, got ${constantPx}`);
  }
  assertFiniteTransform(world);
  return constantPx / world.scale;
}

/** Dot radius helper: a 3 px mote at any zoom. */
export function authoredRadius(constantPx: number, world: WorldTransform): number {
  return authoredWorldWidth(constantPx, world) / 2;
}

/** Per-anchor compensation, the pattern the compositor actually applies: an
 *  attachment child lives INSIDE the world layer at its unit's world position
 *  but scales itself by 1/zoom. Composition proof:
 *      W ∘ T(P) ∘ S(1/z) : q ↦ (P + q/z)·z + pan = W(P) + q
 *  — the anchor lands exactly where the unit is on screen, and the authored
 *  px offsets `q` arrive as px. Position follows the world; size does not. */
export function attachmentChildTransform(
  worldPos: ScreenPoint,
  world: WorldTransform,
): { readonly x: number; readonly y: number; readonly scale: number } {
  assertFiniteTransform(world);
  return { x: worldPos.x, y: worldPos.y, scale: 1 / world.scale };
}

/** Round-trip law, testable: compensation composed over the world transform
 *  is the identity on screen-space deltas (positions unchanged, size unchanged). */
export function isIdentity(compensation: WorldTransform, world: WorldTransform): boolean {
  const netScale = world.scale * compensation.scale;
  const netPanX = compensation.scale * world.panX + compensation.panX;
  const netPanY = compensation.scale * world.panY + compensation.panY;
  const epsilon = 1e-9;
  return (
    Math.abs(netScale - 1) < epsilon &&
    Math.abs(netPanX) < epsilon &&
    Math.abs(netPanY) < epsilon
  );
}

function assertFiniteTransform(world: WorldTransform): void {
  if (!Number.isFinite(world.scale) || world.scale <= 0) {
    throw new Error(`zoom compensation needs finite positive scale, got ${world.scale}`);
  }
  if (!Number.isFinite(world.panX) || !Number.isFinite(world.panY)) {
    throw new Error("zoom compensation needs finite pan");
  }
}
