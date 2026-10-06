/**
 * Pixel-perfect atlas config (§4.7: "pixel-perfect crispness under arbitrary
 * ortho zoom … a 2D engine treats as the default case"). Pure factory — the
 * Pixi application consumes it; the test asserts the law without WebGL.
 */

export interface AtlasTextureOptions {
  readonly scaleMode: "nearest";
  readonly mipmapFilter: "nearest-noip" | "nearest";
  /** Integer zoom keeps texel↔pixel 1:1; fractional zoom with nearest still
   *  stays crisp, but this flag tells the compositor to snap to whole px. */
  readonly roundPixels: true;
}

/** The whole law in one object: nearest filtering everywhere, no smooth
 *  upsampling, no mipmap blur — iso pixel art stays crisp at every altitude. */
export function pixelPerfectAtlasOptions(): AtlasTextureOptions {
  return { scaleMode: "nearest", mipmapFilter: "nearest-noip", roundPixels: true };
}

/** Structural (WebGL-free) shape of "something texture-like" so the adapter
 *  call-site is testable with plain objects. */
export interface FilterableLike {
  scaleMode?: string;
}

export function applyNearestFilter(texture: FilterableLike): void {
  texture.scaleMode = "nearest";
}
