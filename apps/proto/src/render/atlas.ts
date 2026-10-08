/**
 * Pixel-perfect atlas config (§4.7: "pixel-perfect crispness under arbitrary
 * ortho zoom … a 2D engine treats as the default case"). Pure factory — the
 * Pixi application consumes it; the test asserts the law without WebGL.
 *
 * ADR-0008 lane 1 (AssetPack skeleton): the SAME law now also ships as DATA —
 * the hh-assetpack-manifest@1 `defaults` block emitted by @hh/assetpack — and
 * lands at renderer init through the install helpers below (retiring the old
 * `void options` assertion-only wart in compositor.ts). "nearest-noip" is the
 * law label for "no interpolated mipmap blur"; in pixi v8 it MATERIALIZES as
 * SCALE_MODE 'nearest' on all three filters, with the no-mip-chain half
 * enforced packer-side (the manifest's buildMipmaps:false ⇒ 'nomip' tag).
 */
import {
  rendererInitExtrasFor,
  textureStyleArgsFor,
  type SamplerLaw,
  type TextureStyleArgs,
} from "@hh/assetpack/sampler";
import type { HhAssetManifest } from "@hh/assetpack/manifest";

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

/* ───────────────── manifest → renderer (ADR-0008 lane 1) ───────────────── */

/** Read the kit's law layer off a parsed AssetPack manifest. The manifest is
 *  the build-time fact; this narrows it back to the in-app options shape and
 *  fails loud if a manifest ever disagrees with the §4.7 crispness core. */
export function atlasOptionsFromManifest(manifest: HhAssetManifest): AtlasTextureOptions {
  const law = manifest.defaults;
  if (law.scaleMode !== "nearest" || law.mipmapFilter !== "nearest-noip" || !law.roundPixels) {
    throw new RangeError(
      "atlas law disagreement: manifest defaults must keep scaleMode 'nearest', mipmapFilter 'nearest-noip' and roundPixels true (§4.7)",
    );
  }
  return pixelPerfectAtlasOptions();
}

/** Bridge for the factory path (no manifest loaded yet at compositor init). */
export function samplerLawFromAtlasOptions(options: AtlasTextureOptions): SamplerLaw {
  return {
    scaleMode: options.scaleMode,
    mipmapFilter: options.mipmapFilter,
    addressMode: "clamp-to-edge",
    roundPixels: options.roundPixels,
    buildMipmaps: false,
  };
}

/** The exact TextureStyle option subset pixi v8 consumes (structural copy of
 *  TextureStyleArgs — kept pixi-import-free so this module stays unit-test
 *  pure; compositor.ts feeds it to Object.assign(TextureStyle.defaultOptions,
 *  …) where the real typed sink lives). */
export type SamplerDefaults = Partial<Record<"addressMode" | "scaleMode" | "minFilter" | "magFilter" | "mipmapFilter", string>>;

/** Materialize the law into TextureStyle.defaultOptions-shaped args. */
export function textureStyleOptionsFor(options: AtlasTextureOptions): TextureStyleArgs {
  return textureStyleArgsFor(samplerLawFromAtlasOptions(options));
}

/** Install the law into a defaults target (explicit target = no hidden
 *  global write inside this module; the compositor passes the real
 *  TextureStyle.defaultOptions). Returns the target for chaining. */
export function installSamplerLaw(target: SamplerDefaults, options: AtlasTextureOptions): SamplerDefaults {
  return Object.assign(target, textureStyleOptionsFor(options));
}

/** app.init extras the law demands (roundPixels lives on the RENDERER in v8,
 *  not per-texture). */
export function atlasRendererInitExtras(options: AtlasTextureOptions): { roundPixels?: true } {
  return rendererInitExtrasFor(samplerLawFromAtlasOptions(options));
}
