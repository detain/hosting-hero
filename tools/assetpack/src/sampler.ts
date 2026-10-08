/**
 * The sampler law, as data (§4.7 pixel-perfect crispness; ADR-0008 lane 1:
 * "an AssetPack-produced manifest is the natural place to carry per-texture
 * sampler flags" — AssetPack 1.7.0 carries NO such flags, so this module is
 * the law layer our HH manifest wrapper ships and the renderer installs).
 *
 * Pixi-free by design: the values below MIRROR pixi.js v8 literals
 * (SCALE_MODE 'nearest' | 'linear', WRAP_MODE 'clamp-to-edge' | 'repeat' |
 * 'mirror-repeat', TextureStyle.defaultOptions, RendererOptions.roundPixels)
 * but this package must typecheck and run without pixi installed. The proto
 * side (apps/proto/src/render/atlas.ts) is the compile-time proof that these
 * shapes land where pixi accepts them.
 */

/** Pixel art never bilinearly smooths: the enum is CLOSED at 'nearest'. */
export type ScaleModeLaw = "nearest";

/**
 * "nearest-noip" is the §4.7 law label: no interpolated filtering between
 * mipmap levels. In pixi v8 it MATERIALIZES as SCALE_MODE 'nearest' for the
 * mipmap filter; the "no mip chain at all" half of the law is enforced
 * packer-side (`buildMipmaps: false` ⇒ the 'nomip' tag), not sampler-side.
 * 'nearest' is admitted for assets that legitimately ship a mip chain.
 */
export type MipmapFilterLaw = "nearest-noip" | "nearest";

export type AddressModeLaw = "clamp-to-edge" | "repeat" | "mirror-repeat";

export interface SamplerLaw {
  readonly scaleMode: ScaleModeLaw;
  readonly mipmapFilter: MipmapFilterLaw;
  readonly addressMode: AddressModeLaw;
  /** Renderer-level integer snapping (app.init option, not a texture option). */
  readonly roundPixels: boolean;
  /** Packer-level: false ⇒ no mip chain is generated ('nomip'); pairs with
   *  mipmapFilter "nearest-noip" (contradictions are rejected at parse). */
  readonly buildMipmaps: boolean;
}

/** Whole law for this game: nearest everywhere, no mip blur, whole-pixel snaps. */
export function defaultSamplerLaw(): SamplerLaw {
  return {
    scaleMode: "nearest",
    mipmapFilter: "nearest-noip",
    addressMode: "clamp-to-edge",
    roundPixels: true,
    buildMipmaps: false,
  };
}

/** Per-texture partial override; absent keys inherit the manifest defaults. */
export type SamplerOverride = Partial<SamplerLaw>;

/** The keys a legal override may name — closed set, typos fail at parse. */
export const SAMPLER_OVERRIDE_KEYS: readonly (keyof SamplerLaw)[] = [
  "scaleMode",
  "mipmapFilter",
  "addressMode",
  "roundPixels",
  "buildMipmaps",
];

/** Combine defaults with an override and re-check the coherence laws. */
export function resolveSamplerLaw(defaults: SamplerLaw, override: SamplerOverride): SamplerLaw {
  const merged: SamplerLaw = { ...defaults, ...override };
  assertSamplerLawCoherent(merged);
  return merged;
}

/**
 * Law coherence (not schema-shape — the parser checks enums separately):
 * "nearest-noip" claims no interpolated mipmap blur, which is a LIE if a mip
 * chain was built with an interpolating filter path; keep the pair honest.
 */
export function assertSamplerLawCoherent(law: SamplerLaw): void {
  if (law.buildMipmaps && law.mipmapFilter === "nearest-noip") {
    throw new RangeError(
      `sampler law contradiction: mipmapFilter "nearest-noip" means no interpolated mipmap blur, ` +
        `but buildMipmaps=true generates a mip chain — use mipmapFilter "nearest" with a mip chain ` +
        `or set buildMipmaps=false (the 'nomip' packer tag).`,
    );
  }
}

/** pixi TextureStyle option args a law translates to (exact literals v8 takes). */
export interface TextureStyleArgs {
  readonly scaleMode: "nearest";
  /** both law labels materialize to SCALE_MODE 'nearest' — see MipmapFilterLaw. */
  readonly mipmapFilter: "nearest";
  readonly minFilter: "nearest";
  readonly magFilter: "nearest";
  readonly addressMode: AddressModeLaw;
}

/** Materialize a law into the options object pixi's TextureStyle accepts. */
export function textureStyleArgsFor(law: SamplerLaw): TextureStyleArgs {
  return {
    scaleMode: "nearest",
    mipmapFilter: "nearest",
    minFilter: "nearest",
    magFilter: "nearest",
    addressMode: law.addressMode,
  };
}

/** Renderer init extras a law demands (the roundPixels half of the law lives
 *  at app.init, NOT per-texture — AbstractRenderer options, pixi v8). */
export function rendererInitExtrasFor(law: SamplerLaw): { readonly roundPixels: true } | Record<string, never> {
  return law.roundPixels ? { roundPixels: true } : {};
}

/** Per-asset `data` payload for Assets.add/load — pixi v8 loadTextures spreads
 *  asset.data straight into the TextureSource ctor (→ TextureStyle). Carries
 *  the same materialized style args so manifest-loaded textures obey the law
 *  even if global defaults were installed late. */
export function assetDataFor(law: SamplerLaw): TextureStyleArgs {
  return textureStyleArgsFor(law);
}
