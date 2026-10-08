import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AssetManifestError,
  HH_MANIFEST_SCHEMA_ID,
  parseHhAssetManifest,
  serializeHhAssetManifest,
} from "../manifest.ts";
import { defaultSamplerLaw } from "../sampler.ts";

const COMMITTED_MANIFEST = fileURLToPath(new URL("../../../../assets/skin-kits/seed-shared-web/manifest/hh-assetpack-manifest.json", import.meta.url));

function minimalDoc(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    schema: HH_MANIFEST_SCHEMA_ID,
    kit: "seed-shared-web",
    emitter: "hand-emitted",
    defaults: { ...defaultSamplerLaw() },
    textures: [{ alias: "shared-web.meter", src: "meter/signature-meter.png", sampler: {} }],
    pixiManifest: { bundles: [{ name: "shared-web", assets: [{ alias: "shared-web.meter", src: "meter/signature-meter.png", data: { tags: ["tps", "nomip"] } }] }] },
    ...overrides,
  };
}

describe("parseHhAssetManifest — the committed artifact", () => {
  it("parses the hand-emitted seed manifest through the real boundary", () => {
    const manifest = parseHhAssetManifest(JSON.parse(readFileSync(COMMITTED_MANIFEST, "utf8")) as unknown);
    expect(manifest.emitter).toBe("hand-emitted");
    expect(manifest.textures.map((t) => t.alias)).toEqual([
      "shared-web.meter", // meter FIRST — §8.10 authoring law visible in data
      "shared-web.visitor",
      "shared-web.hero",
      "shared-web.palette",
      "shared-web.fx",
    ]);
    for (const texture of manifest.textures) {
      expect(texture.sampler).toEqual(defaultSamplerLaw());
    }
    expect(manifest.pixiManifest[0]?.assets.every((a) => a.tags.includes("tps") && a.tags.includes("nomip"))).toBe(true);
  });

  it("is deep-frozen: consumers cannot smuggle mutations", () => {
    const manifest = parseHhAssetManifest(JSON.parse(readFileSync(COMMITTED_MANIFEST, "utf8")) as unknown);
    expect(Object.isFrozen(manifest)).toBe(true);
    expect(Object.isFrozen(manifest.textures)).toBe(true);
    expect(Object.isFrozen(manifest.textures[0]?.sampler)).toBe(true);
    const first = manifest.textures[0];
    if (!first) throw new Error("committed manifest lost its first texture");
    try {
      (first as { alias: string }).alias = "tampered"; // strict mode throws, sloppy mode no-ops
    } catch {
      /* expected on strict transforms */
    }
    expect(first.alias).toBe("shared-web.meter");
  });
});

describe("parseHhAssetManifest — fail-loud rejections", () => {
  it("rejects an off-law scaleMode ('linear' never enters this codebase)", () => {
    const doc = minimalDoc({ defaults: { ...defaultSamplerLaw(), scaleMode: "linear" } });
    expect(() => parseHhAssetManifest(doc)).toThrow(/scaleMode/);
  });

  it("rejects the noip-with-mip-chain contradiction", () => {
    const doc = minimalDoc({ defaults: { ...defaultSamplerLaw(), buildMipmaps: true } });
    expect(() => parseHhAssetManifest(doc)).toThrow(/AssetManifestError|contradiction/);
  });

  it("rejects the roundPixels-false downgrade (crispness core is not relaxable)", () => {
    // The law says roundPixels TRUE; a manifest opting out is the same class
    // of heresy as scaleMode 'linear' and must not parse.
    const doc = minimalDoc({ defaults: { ...defaultSamplerLaw(), roundPixels: false } });
    expect(() => parseHhAssetManifest(doc)).toThrow(AssetManifestError);
  });

  it("rejects duplicate aliases", () => {
    const doc = minimalDoc({
      textures: [
        { alias: "shared-web.meter", src: "a.png", sampler: {} },
        { alias: "shared-web.meter", src: "b.png", sampler: {} },
      ],
    });
    expect(() => parseHhAssetManifest(doc)).toThrow(/duplicate alias/);
  });

  it("rejects unknown keys at both levels (typos fail, never shrug)", () => {
    expect(() => parseHhAssetManifest(minimalDoc({ extraTop: 1 }))).toThrow(/unknown key "extraTop"/);
    expect(() => parseHhAssetManifest(minimalDoc({ defaults: { ...defaultSamplerLaw(), scaleModeExtra: "nearest" } }))).toThrow(
      /unknown key/,
    );
  });

  it("rejects src traversal and absolute paths", () => {
    for (const src of ["../etc/passwd", "/abs/path.png", ""]) {
      const doc = minimalDoc({ textures: [{ alias: "shared-web.meter", src, sampler: {} }] });
      expect(() => parseHhAssetManifest(doc)).toThrow(/src/);
    }
  });

  it("rejects a wrong schema id and a malformed kit name", () => {
    expect(() => parseHhAssetManifest(minimalDoc({ schema: "hh-assetpack-manifest@0" }))).toThrow(/schema/);
    expect(() => parseHhAssetManifest(minimalDoc({ kit: "Seed Shared Web" }))).toThrow(/kit/);
  });

  it("rejects an empty textures array (a kit with zero textures is not a kit)", () => {
    expect(() => parseHhAssetManifest(minimalDoc({ textures: [] }))).toThrow(/non-empty/);
  });

  it("rejects invented AssetPack tags in the pixi layer", () => {
    const doc = minimalDoc();
    const bundles = (doc["pixiManifest"] as { bundles: { assets: { data: { tags: string[] } }[] }[] }).bundles;
    (bundles[0]?.assets[0] as { data: { tags: string[] } }).data.tags = ["tps", "bilinear-please"];
    expect(() => parseHhAssetManifest(doc)).toThrow(/unknown AssetPack tag/);
  });
});

describe("parseHhAssetManifest — per-texture overrides", () => {
  it("merges an override over the defaults and re-checks coherence", () => {
    const doc = minimalDoc({
      textures: [{ alias: "shared-web.meter", src: "meter/signature-meter.png", sampler: { addressMode: "repeat" } }],
    });
    const manifest = parseHhAssetManifest(doc);
    expect(manifest.textures[0]?.sampler.addressMode).toBe("repeat");
    expect(manifest.textures[0]?.sampler.scaleMode).toBe("nearest");
  });

  it("refuses an override that contradicts the law (noip + built mips)", () => {
    const doc = minimalDoc({
      textures: [{ alias: "shared-web.meter", src: "meter/signature-meter.png", sampler: { buildMipmaps: true } }],
    });
    expect(() => parseHhAssetManifest(doc)).toThrow(/contradiction/);
  });
});

describe("serializeHhAssetManifest", () => {
  it("round-trips byte-identically (parse → serialize → parse → serialize)", () => {
    const original = readFileSync(COMMITTED_MANIFEST, "utf8");
    const once = serializeHhAssetManifest(parseHhAssetManifest(JSON.parse(original) as unknown));
    const twice = serializeHhAssetManifest(parseHhAssetManifest(JSON.parse(once) as unknown));
    expect(once).toBe(original);
    expect(twice).toBe(original);
  });
});
