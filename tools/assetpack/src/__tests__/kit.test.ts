import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  BLEED_CORNERS,
  FIVE_ASSET_SLOTS,
  PLACEHOLDER_SIZE_PX,
  SkinKitError,
  loadKitJson,
  parseHhSkinKit,
  validateKitLayout,
  writePlaceholderKit,
} from "../kit.ts";
import { decodePng, encodePng, hexToRgba, pixelAt, solidRgba } from "../png.ts";
import { SEED_SHARED_WEB_KIT } from "../seed.ts";

const KIT_DIR = fileURLToPath(new URL("../../../../assets/skin-kits/seed-shared-web", import.meta.url));

function sameColor(a: ReturnType<typeof hexToRgba>, b: ReturnType<typeof pixelAt>): boolean {
  return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
}

describe("committed seed kit — Five-Asset layout conformance", () => {
  const kit = loadKitJson(KIT_DIR);
  const problems = validateKitLayout(KIT_DIR, kit);

  it("passes layout validation (declared files only, no sixth bespoke asset)", () => {
    expect(problems).toEqual([]);
  });

  it("is clearly labeled PLACEHOLDER pending real art", () => {
    expect(kit.status).toBe("PLACEHOLDER");
    expect(kit.note).toMatch(/placeholder/i);
    expect(kit.note).toMatch(/pending real pixel art/i);
  });

  it("names the meter and marks it authored-first (§8.10)", () => {
    const meter = kit.assets.meter;
    expect(meter.meterName.length).toBeGreaterThan(0);
    expect(meter.authoredFirst).toBe(true);
  });

  it("ships all five textures as 64x64 RGBA with the bleed corner markers", () => {
    for (const slot of FIVE_ASSET_SLOTS) {
      const image = decodePng(new Uint8Array(readFileSync(join(KIT_DIR, kit.assets[slot].file))));
      expect([image.width, image.height], slot).toEqual([PLACEHOLDER_SIZE_PX, PLACEHOLDER_SIZE_PX]);
      const size = PLACEHOLDER_SIZE_PX;
      const last = size - 1;
      expect(sameColor(hexToRgba(BLEED_CORNERS.topLeft), pixelAt(image, 0, 0)), `${slot} tl`).toBe(true);
      expect(sameColor(hexToRgba(BLEED_CORNERS.topRight), pixelAt(image, last, 0)), `${slot} tr`).toBe(true);
      expect(sameColor(hexToRgba(BLEED_CORNERS.bottomLeft), pixelAt(image, 0, last)), `${slot} bl`).toBe(true);
      expect(sameColor(hexToRgba(BLEED_CORNERS.bottomRight), pixelAt(image, last, last)), `${slot} br`).toBe(true);
    }
  });

  it("palette card carries dominant + accents as quadrants", () => {
    const palette = kit.assets.palette;
    const image = decodePng(new Uint8Array(readFileSync(join(KIT_DIR, palette.file))));
    const half = PLACEHOLDER_SIZE_PX / 2;
    expect(sameColor(hexToRgba(palette.dominant), pixelAt(image, 10, 10)), "TL quadrant").toBe(true);
    expect(sameColor(hexToRgba(palette.accents[0] as string), pixelAt(image, half + 10, 10)), "TR quadrant").toBe(true);
    expect(sameColor(hexToRgba(palette.accents[1] as string), pixelAt(image, 10, half + 10)), "BL quadrant").toBe(true);
  });
});

describe("parseHhSkinKit — fail-loud law", () => {
  it("refuses a sixth bespoke asset", () => {
    const doc = structuredClone(SEED_SHARED_WEB_KIT) as { fiveAsset: Record<string, unknown> };
    doc.fiveAsset["turret"] = { file: "turret/turret.png", fill: "#111111" };
    expect(() => parseHhSkinKit(doc)).toThrow(/sixth bespoke asset/);
  });

  it("refuses a kit that is missing any of the five", () => {
    const doc = structuredClone(SEED_SHARED_WEB_KIT) as { fiveAsset: Record<string, unknown> };
    delete doc.fiveAsset["fx"];
    expect(() => parseHhSkinKit(doc)).toThrow(/missing slot/);
  });

  it("refuses an unnamed meter and an un-first-authored meter", () => {
    const noName = structuredClone(SEED_SHARED_WEB_KIT) as { fiveAsset: { meter: Record<string, unknown> } };
    delete noName.fiveAsset.meter["meterName"];
    expect(() => parseHhSkinKit(noName)).toThrow(SkinKitError);

    const notFirst = structuredClone(SEED_SHARED_WEB_KIT) as { fiveAsset: { meter: Record<string, unknown> } };
    notFirst.fiveAsset.meter["authoredFirst"] = false;
    expect(() => parseHhSkinKit(notFirst)).toThrow(/authored FIRST/);
  });

  it("refuses a non-PLACEHOLDER status invention", () => {
    const doc = structuredClone(SEED_SHARED_WEB_KIT) as { status: string };
    doc.status = "PROBABLY_FINE";
    expect(() => parseHhSkinKit(doc)).toThrow(/PLACEHOLDER/);
  });
});

describe("writePlaceholderKit — determinism + drift tripwires", () => {
  it("regenerating into a temp dir reproduces byte-identical PNGs to the committed kit", () => {
    const tmp = mkdtempSync(join(tmpdir(), "hh-kit-"));
    const kit = parseHhSkinKit(structuredClone(SEED_SHARED_WEB_KIT));
    writePlaceholderKit(tmp, kit);
    for (const slot of FIVE_ASSET_SLOTS) {
      const file = kit.assets[slot].file;
      expect(Buffer.compare(readFileSync(join(tmp, file)), readFileSync(join(KIT_DIR, file))), file).toBe(0);
    }
  });

  it("stays red on drift: undeclared file, broken corner; manifest/ stays out of scope", () => {
    const tmp = mkdtempSync(join(tmpdir(), "hh-kit-drift-"));
    const kit = parseHhSkinKit(structuredClone(SEED_SHARED_WEB_KIT));
    writePlaceholderKit(tmp, kit);
    expect(validateKitLayout(tmp, kit)).toEqual([]);

    mkdirSync(join(tmp, "manifest"), { recursive: true });
    writeFileSync(join(tmp, "manifest", "hh-assetpack-manifest.json"), "{}");
    expect(validateKitLayout(tmp, kit), "manifest/ is pipeline metadata, never a bespoke asset").toEqual([]);

    writeFileSync(join(tmp, "sixth.png"), "not a sprite");
    const undeclared = validateKitLayout(tmp, kit);
    expect(undeclared.some((p) => p.includes("undeclared file in kit: sixth.png"))).toBe(true);

    const meter = kit.assets.meter;
    const flatPng = encodePng(solidRgba(PLACEHOLDER_SIZE_PX, PLACEHOLDER_SIZE_PX, hexToRgba(meter.fill)));
    writeFileSync(join(tmp, meter.file), Buffer.from(flatPng));
    const cornerProblems = validateKitLayout(tmp, kit).filter((p) => p.includes("bleed marker"));
    expect(cornerProblems.length).toBe(4); // one per corner on the meter texture
  });
});
