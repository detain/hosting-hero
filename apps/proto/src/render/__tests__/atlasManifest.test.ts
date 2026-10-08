/**
 * ADR-0008 lane 1 — consumer integration (WebGL-free, node env per proto
 * pattern): the committed hh-assetpack-manifest@1 parses through the real
 * @hh/assetpack boundary, maps through atlas.ts to the pixi shapes, and the
 * compositor source shows the options ACTUALLY land at init (the retired
 * `void options` wart stays retired). No Renderer is constructed here.
 */
import { parseHhAssetManifest } from "@hh/assetpack/manifest";
import { describe, expect, it } from "vitest";
import manifestRaw from "../../../../../assets/skin-kits/seed-shared-web/manifest/hh-assetpack-manifest.json?raw";
import compositorSource from "../compositor.ts?raw";
import {
  applyNearestFilter,
  atlasOptionsFromManifest,
  atlasRendererInitExtras,
  installSamplerLaw,
  pixelPerfectAtlasOptions,
  samplerLawFromAtlasOptions,
  textureStyleOptionsFor,
} from "../atlas";

describe("manifest → renderer (AssetPack law layer lands at init)", () => {
  const manifest = parseHhAssetManifest(JSON.parse(manifestRaw) as unknown);

  it("the committed manifest is the seed kit's law wrapper", () => {
    expect(manifest.kit).toBe("seed-shared-web");
    expect(manifest.textures.map((t) => t.alias)).toEqual([
      "shared-web.meter",
      "shared-web.visitor",
      "shared-web.hero",
      "shared-web.palette",
      "shared-web.fx",
    ]);
  });

  it("manifest defaults and the headless factory agree byte-for-byte", () => {
    expect(atlasOptionsFromManifest(manifest)).toEqual(pixelPerfectAtlasOptions());
  });

  it("textureStyleOptionsFor materializes the noip label to pixi 'nearest' on every filter", () => {
    expect(textureStyleOptionsFor(pixelPerfectAtlasOptions())).toEqual({
      scaleMode: "nearest",
      mipmapFilter: "nearest",
      minFilter: "nearest",
      magFilter: "nearest",
      addressMode: "clamp-to-edge",
    });
  });

  it("installSamplerLaw writes exactly the law keys into a defaults target", () => {
    const target: Record<string, string> = {};
    installSamplerLaw(target, pixelPerfectAtlasOptions());
    expect(target).toEqual({
      addressMode: "clamp-to-edge",
      scaleMode: "nearest",
      mipmapFilter: "nearest",
      minFilter: "nearest",
      magFilter: "nearest",
    });
    installSamplerLaw(target, pixelPerfectAtlasOptions()); // idempotent
    expect(Object.keys(target).length).toBe(5);
  });

  it("roundPixels rides the renderer init extras, never the style args", () => {
    expect(atlasRendererInitExtras(pixelPerfectAtlasOptions())).toEqual({ roundPixels: true });
    expect("roundPixels" in textureStyleOptionsFor(pixelPerfectAtlasOptions())).toBe(false);
  });

  it("a crispness relaxation dies at the manifest boundary, before any mapper runs", () => {
    const doc = JSON.parse(manifestRaw) as Record<string, unknown>;
    const defaults = doc["defaults"] as Record<string, unknown>;
    defaults["mipmapFilter"] = "nearest"; // legal enum, illegal CRISPNESS RELAXATION (noip dropped)
    expect(() => parseHhAssetManifest(doc)).toThrow(/pixel-perfect law/);
  });

  it("atlasOptionsFromManifest still refuses a disagreeing law (defense-in-depth pin)", () => {
    // Not producible via parseHhAssetManifest today — this pins the mapper's
    // own guard for future schema revisions that might relax the defaults law.
    const rogue = {
      ...manifest,
      defaults: { ...manifest.defaults, mipmapFilter: "nearest" as const },
    };
    expect(() => atlasOptionsFromManifest(rogue)).toThrow(RangeError);
  });

  it("applyNearestFilter keeps its legacy structural behavior", () => {
    const texture: { scaleMode?: string } = {};
    applyNearestFilter(texture);
    expect(texture.scaleMode).toBe("nearest");
  });
});

describe("compositor wiring (source tripwire for the retired wart)", () => {
  it("no longer voids the atlas options", () => {
    expect(compositorSource).not.toMatch(/void options/);
  });

  it("installs the law into TextureStyle.defaultOptions before app.init", () => {
    const installAt = compositorSource.indexOf("installSamplerLaw(TextureStyle.defaultOptions");
    const initAt = compositorSource.indexOf("await app.init(");
    expect(installAt).toBeGreaterThan(-1);
    expect(initAt).toBeGreaterThan(-1);
    expect(installAt).toBeLessThan(initAt); // defaults must be set before any TextureStyle is built
  });

  it("spreads the renderer init extras (roundPixels) into app.init", () => {
    expect(compositorSource).toMatch(/\.\.\.atlasRendererInitExtras\(atlas\)/);
  });

  it("samplerLawFromAtlasOptions carries the two law halves the manifest keeps distinct", () => {
    const law = samplerLawFromAtlasOptions(pixelPerfectAtlasOptions());
    expect(law.buildMipmaps).toBe(false); // packer-side half: the 'nomip' tag
    expect(law.mipmapFilter).toBe("nearest-noip");
  });
});
