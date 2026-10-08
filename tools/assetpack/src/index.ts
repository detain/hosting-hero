/**
 * @hh/assetpack — ADR-0008 lane 1: the AssetPack pipeline contract for
 * Five-Asset skin kits. Barrel exports the pure law layer (manifest types +
 * parser + sampler materializer + kit layout); the fs-bound generator,
 * emitter, and vendor runner are reached through ./cli (keeps this entry
 * bundler-safe for the proto app to import TYPES from).
 */
export {
  HH_KIT_SCHEMA_ID,
  HH_MANIFEST_SCHEMA_ID,
  AssetManifestError,
  parseHhAssetManifest,
  serializeHhAssetManifest,
  type HhAssetManifest,
  type HhTextureEntry,
  type ManifestEmitter,
  type PixiBundle,
  type PixiBundleAsset,
} from "./manifest.ts";
export {
  SAMPLER_OVERRIDE_KEYS,
  assertSamplerLawCoherent,
  assetDataFor,
  defaultSamplerLaw,
  rendererInitExtrasFor,
  resolveSamplerLaw,
  textureStyleArgsFor,
  type AddressModeLaw,
  type MipmapFilterLaw,
  type SamplerLaw,
  type SamplerOverride,
  type ScaleModeLaw,
  type TextureStyleArgs,
} from "./sampler.ts";
export {
  BLEED_CORNER_SIZE_PX,
  BLEED_CORNERS,
  FIVE_ASSET_SLOTS,
  PLACEHOLDER_SIZE_PX,
  SkinKitError,
  loadKitJson,
  parseHhSkinKit,
  repoRoot,
  serializeKit,
  validateKitLayout,
  writePlaceholderKit,
  type FiveAssetSlot,
  type HhSkinKit,
  type KitAsset,
  type MeterAsset,
  type PaletteAsset,
} from "./kit.ts";
