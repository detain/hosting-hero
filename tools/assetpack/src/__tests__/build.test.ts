import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildHhManifest, renderVendorConfig } from "../emit.ts";
import { SEED_SHARED_WEB } from "../kits.ts";
import { parseHhSkinKit } from "../kit.ts";
import { parseHhAssetManifest, serializeHhAssetManifest } from "../manifest.ts";
import { buildKit, resolveVendorCore, wrapVendorPixiManifest } from "../build.ts";
import { SEED_SHARED_WEB_KIT } from "../seed.ts";

const KIT_DIR = fileURLToPath(new URL("../../../../assets/skin-kits/seed-shared-web", import.meta.url));
const REPO_ROOT = fileURLToPath(new URL("../../../../", import.meta.url));

describe("hand-emitted PASSAGE", () => {
  it("builds a manifest that satisfies the parser and matches the committed file byte-for-byte", () => {
    const kit = parseHhSkinKit(structuredClone(SEED_SHARED_WEB_KIT));
    const built = serializeHhAssetManifest(buildHhManifest(SEED_SHARED_WEB, kit));
    const committed = readFileSync(join(REPO_ROOT, SEED_SHARED_WEB.manifestPath), "utf8");
    expect(built).toBe(committed); // committed artifact is exactly what the code emits
  });

  it("emitter field is honest: hand-emitted says so", () => {
    const kit = parseHhSkinKit(structuredClone(SEED_SHARED_WEB_KIT));
    expect(buildHhManifest(SEED_SHARED_WEB, kit).emitter).toBe("hand-emitted");
  });
});

describe("vendor wrap path (works with or without @assetpack/core installed)", () => {
  it("wrapVendorPixiManifest rebuilds the law layer around arbitrary vendor pixi output", () => {
    // Fixture below is VERBATIM live output from `@assetpack/core@1.7.0`
    // running pixiPipes over this exact kit (webp fallbacks, shortcut alias
    // arrays, metaData tags as a boolean record) — captured 2026-10-08. The
    // parser must keep accepting real vendor shapes, not just our mirror.
    const vendorPixi = {
      bundles: [
        {
          name: "default",
          assets: [
            {
              alias: ["fx/catastrophe-fx.png", "catastrophe-fx.png"],
              src: ["fx/catastrophe-fx.webp", "fx/catastrophe-fx.png"],
              data: { tags: { tps: true, nomip: true } },
            },
            {
              alias: ["palette.png"],
              src: [{ src: "palette.webp", progressSize: 155 }, "palette.png"],
              data: { tags: { tps: true, nomip: false } },
            },
          ],
        },
      ],
    };
    const kit = parseHhSkinKit(structuredClone(SEED_SHARED_WEB_KIT));
    const wrapped = wrapVendorPixiManifest(SEED_SHARED_WEB, kit, vendorPixi);
    expect(wrapped.emitter).toBe("assetpack-core");
    expect(wrapped.pixiManifest[0]?.name).toBe("default");
    expect(wrapped.pixiManifest[0]?.assets[0]?.alias).toBe("fx/catastrophe-fx.png"); // array alias → headline
    expect(wrapped.pixiManifest[0]?.assets[0]?.srcs).toEqual(["fx/catastrophe-fx.webp", "fx/catastrophe-fx.png"]);
    expect(wrapped.pixiManifest[0]?.assets[0]?.tags).toEqual(["tps", "nomip"]);
    expect(wrapped.pixiManifest[0]?.assets[1]?.tags).toEqual(["tps"]); // nomip:false drops out
    expect(wrapped.pixiManifest[0]?.assets[1]?.src).toBe("palette.webp"); // {src,progressSize} unwrapped
    expect(wrapped.textures.length).toBe(5); // law layer comes from the kit, not vendor generosity
    expect(wrapped.defaults).toEqual(parseHhSkinKitDefaultsOfCommitted());
  });

  it("wrapVendorPixiManifest refuses garbage pixi output (off-law tags, missing src)", () => {
    const kit = parseHhSkinKit(structuredClone(SEED_SHARED_WEB_KIT));
    expect(() => wrapVendorPixiManifest(SEED_SHARED_WEB, kit, { bundles: [{ name: "b", assets: [] }], extra: 1 })).toThrow(
      /unknown key/,
    );
    expect(() =>
      wrapVendorPixiManifest(SEED_SHARED_WEB, kit, {
        bundles: [{ name: "b", assets: [{ alias: "a", src: "a.png", data: { tags: ["mip-me"] } }] }],
      }),
    ).toThrow(/unknown AssetPack tag/);
  });

  it("resolveVendorCore never throws — it answers null or a usable core", async () => {
    const core = await resolveVendorCore();
    if (core !== null) {
      expect(typeof core.AssetPack).toBe("function");
      expect(typeof core.pixiPipes).toBe("function");
    }
  });

  it("buildKit falls back to the passage (or runs vendor) and always lands a parseable manifest", async () => {
    const tmp = mkdtempSync(join(tmpdir(), "hh-build-"));
    const tmpKitDir = join(tmp, "assets/skin-kits/seed-shared-web");
    for (const file of ["kit.json", "palette.png", "meter/signature-meter.png", "visitor/visitor-form.png", "hero/hero-buildable.png", "fx/catastrophe-fx.png"]) {
      const target = join(tmpKitDir, file);
      mkdirSync(join(target, ".."), { recursive: true });
      writeFileSync(target, readFileSync(join(KIT_DIR, file)));
    }
    const outcome = await buildKit(tmp, SEED_SHARED_WEB);
    expect(["vendor-cli", "hand-emitted-passage"]).toContain(outcome.via);
    const manifest = parseHhAssetManifest(JSON.parse(readFileSync(outcome.manifestPath, "utf8")) as unknown);
    expect(manifest.kit).toBe("seed-shared-web");
  });
});

describe("generated vendor config", () => {
  it("is importable ESM whose data matches the spec it was generated from", async () => {
    const tmp = mkdtempSync(join(tmpdir(), "hh-config-"));
    // The config resolves entry/output relative to ITSELF (import.meta.url),
    // so emulate the repo depth: <tmp>/tools/assetpack/configs/x.mjs.
    const configDir = join(tmp, "tools", "assetpack", "configs");
    mkdirSync(configDir, { recursive: true });
    const target = join(configDir, "seed-shared-web.assetpack.mjs");
    // strip the vendor import line so the config parses without @assetpack/core
    const source = renderVendorConfig(SEED_SHARED_WEB).replace('import { pixiPipes } from "@assetpack/core/pixi";', "const pixiPipes = (c) => ({ pixi: c });");
    writeFileSync(target, source);
    const mod = (await import(`file://${target}`)) as {
      default: { entry: string; output: string; pipes: { pixi: Record<string, unknown> }[]; assetSettings: { files: string[]; metaData: Record<string, boolean> }[] };
    };
    expect(mod.default.entry).toBe(join(tmp, "assets", "skin-kits", "seed-shared-web"));
    expect(mod.default.output).toBe(join(tmp, "assets", "skin-kits", ".build", "seed-shared-web"));
    expect(mod.default.assetSettings[0]?.files).toEqual(["**/*.png"]);
    expect(mod.default.assetSettings[0]?.metaData).toEqual({ tps: true, nomip: true });
    const pixiConfig = mod.default.pipes[0]?.pixi as {
      compression: boolean;
      texturePacker: Record<string, unknown>;
    };
    expect(pixiConfig.compression).toBe(false);
    expect(pixiConfig.texturePacker).toEqual({ ...SEED_SHARED_WEB.texturePacker });
  });

  it("the committed generated config equals a fresh render (drift tripwire)", () => {
    const committed = readFileSync(join(REPO_ROOT, "tools/assetpack/configs/seed-shared-web.assetpack.mjs"), "utf8");
    expect(committed).toBe(renderVendorConfig(SEED_SHARED_WEB));
  });
});

function parseHhSkinKitDefaultsOfCommitted() {
  const committed = readFileSync(join(REPO_ROOT, SEED_SHARED_WEB.manifestPath), "utf8");
  return parseHhAssetManifest(JSON.parse(committed) as unknown).defaults;
}
