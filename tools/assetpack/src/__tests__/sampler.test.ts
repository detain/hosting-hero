import { describe, expect, it } from "vitest";
import {
  assetDataFor,
  assertSamplerLawCoherent,
  defaultSamplerLaw,
  rendererInitExtrasFor,
  resolveSamplerLaw,
  textureStyleArgsFor,
} from "../sampler.ts";

describe("sampler law — materialization", () => {
  it("maps both law labels to pixi SCALE_MODE 'nearest' everywhere", () => {
    for (const filter of ["nearest-noip", "nearest"] as const) {
      const style = textureStyleArgsFor({ ...defaultSamplerLaw(), mipmapFilter: filter });
      expect(style).toEqual({
        scaleMode: "nearest",
        mipmapFilter: "nearest",
        minFilter: "nearest",
        magFilter: "nearest",
        addressMode: "clamp-to-edge",
      });
    }
  });

  it("carries addressMode through untouched", () => {
    expect(textureStyleArgsFor({ ...defaultSamplerLaw(), addressMode: "repeat" }).addressMode).toBe("repeat");
  });

  it("puts roundPixels at the renderer, not the texture", () => {
    expect(rendererInitExtrasFor(defaultSamplerLaw())).toEqual({ roundPixels: true });
    expect(rendererInitExtrasFor({ ...defaultSamplerLaw(), buildMipmaps: true, mipmapFilter: "nearest" })).toEqual({
      roundPixels: true,
    });
    const style = textureStyleArgsFor(defaultSamplerLaw()) as unknown as Record<string, unknown>;
    expect("roundPixels" in style).toBe(false);
  });

  it("emits per-asset data identical to the style args (Assets.add passthrough)", () => {
    expect(assetDataFor(defaultSamplerLaw())).toEqual(textureStyleArgsFor(defaultSamplerLaw()));
  });
});

describe("sampler law — coherence", () => {
  it("refuses nearest-noip with a built mip chain", () => {
    expect(() => assertSamplerLawCoherent({ ...defaultSamplerLaw(), buildMipmaps: true })).toThrow(RangeError);
  });

  it("allows a mip chain when the filter says 'nearest'", () => {
    const law = { ...defaultSamplerLaw(), mipmapFilter: "nearest" as const, buildMipmaps: true };
    expect(() => assertSamplerLawCoherent(law)).not.toThrow();
  });

  it("resolveSamplerLaw merges overrides over defaults", () => {
    const merged = resolveSamplerLaw(defaultSamplerLaw(), { addressMode: "mirror-repeat" });
    expect(merged.addressMode).toBe("mirror-repeat");
    expect(merged.mipmapFilter).toBe("nearest-noip");
  });

  it("resolveSamplerLaw re-checks coherence after merge", () => {
    expect(() => resolveSamplerLaw(defaultSamplerLaw(), { buildMipmaps: true })).toThrow(RangeError);
  });
});
