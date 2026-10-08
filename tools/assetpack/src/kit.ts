/**
 * Five-Asset Skin Kit (hosting_game.md §0.2 / §8.10): per business line the
 * team authors EXACTLY five bespoke assets — signature meter (first: "if you
 * cannot name the meter, the type has a costume not a ruleset" ⇒ the schema
 * FORCES a meter name + authoredFirst flag), visitor form, hero buildable,
 * palette (dominant + accents, also emitted as a swatch-card texture so the
 * count is provable in pixels), and the signature catastrophe FX.
 *
 * Everything else in the game is a parameter of shared systems — a kit that
 * grows a sixth bespoke file has drifted into per-type bespoke code, and the
 * layout validator below is what catches that at build time.
 *
 * Folder layout (this lane's concretization of the spec):
 *   <kit>/kit.json            metadata + accent hues (hh-skin-kit@1)
 *   <kit>/meter/signature-meter.png
 *   <kit>/visitor/visitor-form.png
 *   <kit>/hero/hero-buildable.png
 *   <kit>/fx/catastrophe-fx.png
 *   <kit>/palette.png         swatch card (the palette asset, at kit root)
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { decodePng, encodePng, hexToRgba, paintRect, pixelAt, solidRgba, type RgbaImage } from "./png.ts";
import { HH_KIT_SCHEMA_ID } from "./manifest.ts";

export type FiveAssetSlot = "meter" | "visitor" | "hero" | "palette" | "fx";
export const FIVE_ASSET_SLOTS: readonly FiveAssetSlot[] = ["meter", "visitor", "hero", "palette", "fx"];

export const PLACEHOLDER_SIZE_PX = 64;

/** Fixed corner markers: if any of these colors appears OUTSIDE the corner
 *  squares after packing/resampling, frames are bleeding into each other. */
export const BLEED_CORNERS = {
  topLeft: "#ff00ff",
  topRight: "#00ffff",
  bottomLeft: "#ffff00",
  bottomRight: "#000000",
} as const;

export const BLEED_CORNER_SIZE_PX = 4;

export interface HhSkinKit {
  readonly schema: typeof HH_KIT_SCHEMA_ID;
  readonly name: string;
  readonly lineage: string;
  readonly status: "PLACEHOLDER" | "AUTHORED";
  readonly note: string;
  readonly assets: Readonly<FiveAssetMap>;
}

interface KitAssetBase {
  readonly file: string;
}
export interface MeterAsset extends KitAssetBase {
  readonly meterName: string;
  readonly authoredFirst: true;
  readonly fill: string;
}
export interface FilledAsset extends KitAssetBase {
  readonly fill: string;
}
export interface PaletteAsset extends KitAssetBase {
  readonly dominant: string;
  readonly accents: readonly string[];
}
export type KitAsset = MeterAsset | FilledAsset | PaletteAsset;

/** The five slots with their exact payload types — closed by construction
 *  (§8.10), so consumers read kit.assets.meter.meterName type-safely. */
export interface FiveAssetMap {
  readonly meter: MeterAsset;
  readonly visitor: FilledAsset;
  readonly hero: FilledAsset;
  readonly palette: PaletteAsset;
  readonly fx: FilledAsset;
}

export class SkinKitError extends Error {
  constructor(path: string, message: string) {
    super(`hh-skin-kit invalid at '${path}': ${message}`);
    this.name = "SkinKitError";
  }
}

function req(value: unknown, path: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new SkinKitError(path, `expected a non-empty string, got ${JSON.stringify(value)}`);
  }
  return value;
}

function reqHex(value: unknown, path: string): string {
  const raw = req(value, path);
  try {
    hexToRgba(raw);
  } catch {
    throw new SkinKitError(path, `expected #rrggbb, got "${raw}"`);
  }
  return raw.toLowerCase();
}

export function parseHhSkinKit(json: unknown): HhSkinKit {
  const root = asObj(json, "<root>");
  const schema = req(root["schema"], "schema");
  if (schema !== HH_KIT_SCHEMA_ID) {
    throw new SkinKitError("schema", `expected "${HH_KIT_SCHEMA_ID}", got "${schema}"`);
  }
  const name = req(root["name"], "name");
  const lineage = req(root["lineage"], "lineage");
  const statusRaw = req(root["status"], "status");
  if (statusRaw !== "PLACEHOLDER" && statusRaw !== "AUTHORED") {
    throw new SkinKitError("status", `expected "PLACEHOLDER" or "AUTHORED", got "${statusRaw}"`);
  }
  const note = req(root["note"], "note");
  const assetsRaw = asObj(root["fiveAsset"], "fiveAsset");
  const missing = FIVE_ASSET_SLOTS.filter((slot) => assetsRaw[slot] === undefined);
  if (missing.length > 0) {
    throw new SkinKitError("fiveAsset", `missing slot(s): ${missing.join(", ")} — a kit ships EXACTLY the five assets (§8.10)`);
  }
  const extra = Object.keys(assetsRaw).filter((slot) => !FIVE_ASSET_SLOTS.includes(slot as FiveAssetSlot));
  if (extra.length > 0) {
    throw new SkinKitError("fiveAsset", `sixth bespoke asset "${extra.join(", ")}" is the wrong shape of game — the five are closed`);
  }
  const assets: FiveAssetMap = {
    meter: parseMeter(asObj(assetsRaw["meter"], "fiveAsset.meter"), fileFor(assetsRaw, "meter")),
    visitor: parseFilled(asObj(assetsRaw["visitor"], "fiveAsset.visitor"), "visitor"),
    hero: parseFilled(asObj(assetsRaw["hero"], "fiveAsset.hero"), "hero"),
    palette: parsePalette(asObj(assetsRaw["palette"], "fiveAsset.palette"), fileFor(assetsRaw, "palette")),
    fx: parseFilled(asObj(assetsRaw["fx"], "fiveAsset.fx"), "fx"),
  };
  return Object.freeze({
    schema: HH_KIT_SCHEMA_ID,
    name,
    lineage,
    status: statusRaw,
    note,
    assets: Object.freeze(assets) as Readonly<FiveAssetMap>,
  });
}

function fileFor(assetsRaw: Record<string, unknown>, slot: FiveAssetSlot): string {
  const asset = asObj(assetsRaw[slot], `fiveAsset.${slot}`);
  const file = req(asset["file"], `fiveAsset.${slot}.file`);
  if (file.startsWith("/") || file.includes("..")) {
    throw new SkinKitError(`fiveAsset.${slot}.file`, `must be kit-relative without traversal, got "${file}"`);
  }
  return file;
}

function parseFilled(asset: Record<string, unknown>, slot: FiveAssetSlot): FilledAsset {
  return { file: fileFor({ [slot]: asset } as Record<string, unknown>, slot), fill: reqHex(asset["fill"], `fiveAsset.${slot}.fill`) };
}

function parseMeter(asset: Record<string, unknown>, file: string): MeterAsset {
  const meterName = req(asset["meterName"], "fiveAsset.meter.meterName");
  if (asset["authoredFirst"] !== true) {
    throw new SkinKitError(
      "fiveAsset.meter.authoredFirst",
      `the signature meter is authored FIRST — "${meterName}" must carry authoredFirst: true (§8.10)`,
    );
  }
  return { file, meterName, authoredFirst: true, fill: reqHex(asset["fill"], "fiveAsset.meter.fill") };
}

function parsePalette(asset: Record<string, unknown>, file: string): PaletteAsset {
  const accentsRaw = asset["accents"];
  if (!Array.isArray(accentsRaw) || accentsRaw.length < 1) {
    throw new SkinKitError("fiveAsset.palette.accents", "expected at least one accent hex");
  }
  const accents = accentsRaw.map((accent, index) => reqHex(accent, `fiveAsset.palette.accents[${index}]`));
  return { file, dominant: reqHex(asset["dominant"], "fiveAsset.palette.dominant"), accents };
}

function asObj(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new SkinKitError(path, "expected an object");
  }
  return value as Record<string, unknown>;
}

/* ─────────────────────────── placeholder pixels ──────────────────────── */

/** The five placeholder textures, derived purely from kit.json: solid fills
 *  (quadrants for the palette card) with the four BLEED_CORNERS painted in. */
export function buildPlaceholderImages(kit: HhSkinKit): ReadonlyMap<FiveAssetSlot, Uint8Array> {
  const images = new Map<FiveAssetSlot, Uint8Array>();
  for (const slot of FIVE_ASSET_SLOTS) {
    images.set(slot, encodePng(withBleedCorners(placeholderBase(kit, slot))));
  }
  return images;
}

function placeholderBase(kit: HhSkinKit, slot: FiveAssetSlot): RgbaImage {
  const size = PLACEHOLDER_SIZE_PX;
  if (slot === "palette") {
    const palette = kit.assets.palette;
    const quadrants: [string, number, number][] = [
      [palette.dominant, 0, 0],
      [palette.accents[0] as string, size / 2, 0],
      [palette.accents[1] ?? (palette.accents[0] as string), 0, size / 2],
      [palette.dominant, size / 2, size / 2],
    ];
    let image = solidRgba(size, size, hexToRgba(palette.dominant));
    for (const [hex, x, y] of quadrants) {
      image = paintRect(image, x, y, size / 2, size / 2, hexToRgba(hex));
    }
    return image;
  }
  // every non-palette slot carries a `fill` (meter's extra fields ride along)
  return solidRgba(size, size, hexToRgba(kit.assets[slot as Exclude<FiveAssetSlot, "palette">].fill));
}

function withBleedCorners(image: ReturnType<typeof solidRgba>) {
  const size = image.width;
  const c = BLEED_CORNER_SIZE_PX;
  let painted = paintRect(image, 0, 0, c, c, hexToRgba(BLEED_CORNERS.topLeft));
  painted = paintRect(painted, size - c, 0, c, c, hexToRgba(BLEED_CORNERS.topRight));
  painted = paintRect(painted, 0, size - c, c, c, hexToRgba(BLEED_CORNERS.bottomLeft));
  painted = paintRect(painted, size - c, size - c, c, c, hexToRgba(BLEED_CORNERS.bottomRight));
  return painted;
}

/* ─────────────────────────────── on disk ─────────────────────────────── */

export function writePlaceholderKit(kitDir: string, kit: HhSkinKit): string[] {
  const written: string[] = [];
  const images = buildPlaceholderImages(kit);
  for (const slot of FIVE_ASSET_SLOTS) {
    const target = join(kitDir, kit.assets[slot].file);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, Buffer.from(images.get(slot) as Uint8Array));
    written.push(relative(kitDir, target).split(sep).join("/"));
  }
  writeFileSync(join(kitDir, "kit.json"), `${JSON.stringify(serializeKit(kit), null, 2)}\n`);
  written.push("kit.json");
  return written.sort();
}

export function serializeKit(kit: HhSkinKit): Record<string, unknown> {
  return {
    schema: kit.schema,
    name: kit.name,
    lineage: kit.lineage,
    status: kit.status,
    note: kit.note,
    fiveAsset: {
      meter: kit.assets.meter,
      visitor: kit.assets.visitor,
      hero: kit.assets.hero,
      palette: kit.assets.palette,
      fx: kit.assets.fx,
    },
    bleed: { cornerSizePx: BLEED_CORNER_SIZE_PX, ...BLEED_CORNERS },
  };
}

export function loadKitJson(kitDir: string): HhSkinKit {
  const raw = readFileSync(join(kitDir, "kit.json"), "utf8");
  return parseHhSkinKit(JSON.parse(raw) as unknown);
}

/** Layout conformance: exactly the declared files (no sixth bespoke asset),
 *  every texture 64x64 RGBA, all four bleed corners present on every texture. */
export function validateKitLayout(kitDir: string, kit: HhSkinKit): string[] {
  const problems: string[] = [];
  const declared = new Set<string>([...FIVE_ASSET_SLOTS.map((slot) => kit.assets[slot].file), "kit.json"]);
  // manifest/ holds pipeline metadata this lane emits (hh-assetpack-manifest.json)
  // — it is contract output, never a sixth bespoke asset, so it is out of scope.
  const present = listFilesRecursive(kitDir, kitDir).filter((file) => !file.startsWith("manifest/"));
  for (const unexpected of present.filter((file) => !declared.has(file))) {
    problems.push(`undeclared file in kit: ${unexpected}`);
  }
  for (const slot of FIVE_ASSET_SLOTS) {
    const file = kit.assets[slot].file;
    const abs = join(kitDir, file);
    if (!existsSync(abs) || !statSync(abs).isFile()) {
      problems.push(`missing asset file for slot ${slot}: ${file}`);
      continue;
    }
    const image = decodePng(new Uint8Array(readFileSync(abs)));
    problems.push(...inspectPlaceholderTexture(slot, file, image));
  }
  return problems;
}

function inspectPlaceholderTexture(
  slot: FiveAssetSlot,
  file: string,
  image: ReturnType<typeof decodePng>,
): string[] {
  const problems: string[] = [];
  if (image.width !== PLACEHOLDER_SIZE_PX || image.height !== PLACEHOLDER_SIZE_PX) {
    problems.push(`${file}: expected ${PLACEHOLDER_SIZE_PX}x${PLACEHOLDER_SIZE_PX}, got ${image.width}x${image.height}`);
    return problems;
  }
  const corners: [keyof typeof BLEED_CORNERS, number, number][] = [
    ["topLeft", 0, 0],
    ["topRight", PLACEHOLDER_SIZE_PX - 1, 0],
    ["bottomLeft", 0, PLACEHOLDER_SIZE_PX - 1],
    ["bottomRight", PLACEHOLDER_SIZE_PX - 1, PLACEHOLDER_SIZE_PX - 1],
  ];
  for (const [name, x, y] of corners) {
    const expected = hexToRgba(BLEED_CORNERS[name]);
    const actual = pixelAt(image, x, y);
    if (actual.r !== expected.r || actual.g !== expected.g || actual.b !== expected.b || actual.a !== expected.a) {
      problems.push(`${file}: ${slot} corner ${name} is not the bleed marker`);
    }
  }
  return problems;
}

function listFilesRecursive(dir: string, base: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...listFilesRecursive(full, base));
    } else if (entry.isFile()) {
      found.push(relative(base, full).split(sep).join("/"));
    }
  }
  return found.sort();
}

/** Repo-root resolution for CLI defaults (this file lives at tools/assetpack/src). */
export function repoRoot(fromModuleUrl: string = import.meta.url): string {
  return fileURLToPath(new URL("../../../", fromModuleUrl));
}
