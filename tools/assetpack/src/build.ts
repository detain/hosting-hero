/**
 * Vendor build runner — tries the REAL @assetpack/core pipeline; when the
 * package (or its native toolchain) is not installed, it fails LOUD with the
 * documented PASSAGE instead of pretending (ADR-0008: this lane ships the
 * pipeline contract; the packer only matters once real art exists).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { FIVE_ASSET_SLOTS, loadKitJson, type HhSkinKit } from "./kit.ts";
import {
  HH_MANIFEST_SCHEMA_ID,
  parseHhAssetManifest,
  serializeHhAssetManifest,
  type HhAssetManifest,
  type ManifestEmitter,
} from "./manifest.ts";
import { defaultSamplerLaw } from "./sampler.ts";
import type { KitBuildSpec } from "./kits.ts";

export const VENDOR_PASSAGE =
  "AssetPack core is not installed/resolvable here. Pipeline passage (ADR-0008 lane 1): " +
  "1) `pnpm add -D @assetpack/core@^1.7.0` in tools/assetpack (postinstall binaries may need " +
  "`pnpm approve-builds` — this repo's allowBuilds trusts esbuild only); " +
  "2) re-run `pnpm -F @hh/assetpack build-kit --kit <name>`; " +
  "3) if the native toolchain stays unhappy, the hand-emitted path is first-class: " +
  "`pnpm -F @hh/assetpack emit` writes the same schema, and the consumer cannot tell the " +
  "difference except through the `emitter` field.";

interface VendorCore {
  readonly AssetPack: new (config: Record<string, unknown>) => { run(): Promise<void> };
  readonly pixiPipes: (config: Record<string, unknown>) => unknown;
}

/** Dynamic, cached by the module loader; returns null when @assetpack/core is
 *  absent (never throws — absence is a documented state, not an accident).
 *  Variable specifiers keep TS from demanding the vendor types at build time:
 *  the package is OPTIONAL here by design (hand-emitted PASSAGE covers it). */
const CORE_MODULE = "@assetpack/core";
const CORE_PIXI_MODULE = "@assetpack/core/pixi";

/** Plain function indirection: TS never statically resolves this specifier,
 *  so the vendor types stay OPTIONAL at typecheck time as well as runtime. */
function importLoose(specifier: string): Promise<unknown> {
  return import(/* @vite-ignore */ specifier);
}

export async function resolveVendorCore(): Promise<VendorCore | null> {
  try {
    const [core, pixi] = await Promise.all([importLoose(CORE_MODULE), importLoose(CORE_PIXI_MODULE)]);
    const AssetPack = (core as { AssetPack?: VendorCore["AssetPack"] }).AssetPack;
    const pixiPipes = (pixi as { pixiPipes?: VendorCore["pixiPipes"] }).pixiPipes;
    if (!AssetPack || !pixiPipes) return null;
    return { AssetPack, pixiPipes };
  } catch {
    return null;
  }
}

export interface KitBuildOutcome {
  readonly kit: string;
  readonly via: "vendor-cli" | "hand-emitted-passage";
  readonly manifestPath: string;
  readonly detail: string;
}

/** Take AssetPack's pixi manifest verbatim into the pixiManifest layer and
 *  rebuild the HH law layer around it: textures/aliases derive from the kit
 *  itself (the law never depends on vendor generosity), the pixi bundles from
 *  the packer. Parse goes through the same boundary the runtime uses. */
export function wrapVendorPixiManifest(spec: KitBuildSpec, kit: HhSkinKit, pixiJson: unknown): HhAssetManifest {
  const doc: unknown = {
    schema: HH_MANIFEST_SCHEMA_ID,
    kit: kit.name,
    emitter: "assetpack-core" satisfies ManifestEmitter,
    defaults: { ...defaultSamplerLaw() },
    textures: FIVE_ASSET_SLOTS.map((slot) => ({
      alias: spec.aliasFor(slot),
      src: kit.assets[slot].file,
      sampler: {},
    })),
    pixiManifest: pixiJson,
  };
  return parseHhAssetManifest(doc);
}

/** Build one kit: vendor run → law-wrap; no vendor → hand-emitted PASSAGE.
 *  `outManifestPath` overrides where the HH manifest lands — use it to probe a
 *  vendor build without clobbering the committed manifest (then `emit` again). */
export async function buildKit(
  repoRootDir: string,
  spec: KitBuildSpec,
  outManifestPath?: string,
): Promise<KitBuildOutcome> {
  const kit = loadKitJson(join(repoRootDir, spec.kitDir));
  const vendor = await resolveVendorCore();
  if (vendor === null) {
    const { buildHhManifest } = await import("./emit.ts");
    const handTarget = outManifestPath ?? join(repoRootDir, spec.manifestPath);
    mkdirSync(dirname(handTarget), { recursive: true });
    writeFileSync(handTarget, serializeHhAssetManifest(buildHhManifest(spec, kit)));
    return {
      kit: spec.kit,
      via: "hand-emitted-passage",
      manifestPath: handTarget,
      detail: VENDOR_PASSAGE,
    };
  }
  await new vendor.AssetPack({
    entry: join(repoRootDir, spec.kitDir),
    output: join(repoRootDir, spec.outputDir),
    strict: true,
    ignore: ["kit.json", "manifest/**"],
    pipes: [
      vendor.pixiPipes({
        cacheBust: false,
        resolutions: { default: 1 },
        compression: false,
        texturePacker: { ...spec.texturePacker },
        manifest: { output: "hh-pixi-manifest.json", includeMetaData: true },
      }),
    ],
    // AssetSettings shape verified against core 1.7.0 dist typings:
    // {files: glob[], metaData: Record<Tag, boolean>} — tags ride metaData.
    assetSettings: [
      {
        files: ["**/*.png"],
        metaData: Object.fromEntries(spec.assetTags.map((tag) => [tag, true])),
      },
    ],
  }).run();
  const packerManifestPath = join(repoRootDir, spec.outputDir, "hh-pixi-manifest.json");
  if (!existsSync(packerManifestPath)) {
    throw new Error(`vendor build produced no manifest at ${packerManifestPath} (strict run should have thrown instead)`);
  }
  const wrapped = wrapVendorPixiManifest(spec, kit, JSON.parse(readFileSync(packerManifestPath, "utf8")) as unknown);
  const manifestTarget = outManifestPath ?? join(repoRootDir, spec.manifestPath);
  mkdirSync(dirname(manifestTarget), { recursive: true });
  writeFileSync(manifestTarget, serializeHhAssetManifest(wrapped));
  return {
    kit: spec.kit,
    via: "vendor-cli",
    manifestPath: manifestTarget,
    detail: `packed via @assetpack/core; pixi manifest at ${spec.outputDir}/hh-pixi-manifest.json, law-wrapped to ${manifestTarget}`,
  };
}
