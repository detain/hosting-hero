/**
 * Kit build specs — the single data source every consumer reads:
 * the hand-emitted manifest, the generated vendor `.assetpack.mjs`
 * config, and the (vendor-CLI) build runner. Data-only, so it is testable
 * with no @assetpack/core install present; the generated config is emitted
 * FROM here, which is what keeps the vendor-CLI path drift-free.
 */
import type { FiveAssetSlot } from "./kit.ts";

export interface KitBuildSpec {
  readonly kit: string;
  readonly lineage: string;
  /** kit dir, relative to repo root */
  readonly kitDir: string;
  /** vendor build output dir, relative to repo root */
  readonly outputDir: string;
  /** committed HH manifest path, relative to repo root */
  readonly manifestPath: string;
  /** slot → manifest alias */
  readonly aliasFor: (slot: FiveAssetSlot) => string;
  /** texturePacker settings (AssetPack PackTexturesOptions subset) */
  readonly texturePacker: {
    readonly allowRotation: false;
    readonly shapePadding: number;
    readonly forceSquared: false;
  };
  /** AssetPack packer-side tags: tps packs, nomip encodes buildMipmaps=false */
  readonly assetTags: readonly ["tps", "nomip"];
}

export const SEED_SHARED_WEB: KitBuildSpec = {
  kit: "seed-shared-web",
  lineage: "shared-web",
  kitDir: "assets/skin-kits/seed-shared-web",
  outputDir: "assets/skin-kits/.build/seed-shared-web",
  manifestPath: "assets/skin-kits/seed-shared-web/manifest/hh-assetpack-manifest.json",
  aliasFor: (slot) => `shared-web.${slot}`,
  texturePacker: { allowRotation: false, shapePadding: 2, forceSquared: false },
  assetTags: ["tps", "nomip"],
};

export const KIT_SPECS: Readonly<Record<string, KitBuildSpec>> = Object.freeze({
  [SEED_SHARED_WEB.kit]: SEED_SHARED_WEB,
});

export function kitSpecOrThrow(kit: string): KitBuildSpec {
  const spec = KIT_SPECS[kit];
  if (!spec) {
    throw new RangeError(`no KitBuildSpec for "${kit}" — known kits: ${Object.keys(KIT_SPECS).join(", ")}`);
  }
  return spec;
}
