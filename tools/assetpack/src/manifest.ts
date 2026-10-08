/**
 * HH AssetPack manifest (`hh-assetpack-manifest@1`) — the contract our runtime
 * loader consumes. AssetPack 1.7.0's pixi manifest (`{bundles:[{name,assets:
 * [{alias,src,data}]}]}`) carries NO sampler law, so this wrapper IS the law
 * carrier (ADR-0008): it embeds a pixi-format manifest verbatim and adds the
 * per-kit sampler defaults + per-texture overrides on top.
 *
 * Parse at the boundary, trust internally: `parseHhAssetManifest` returns a
 * deep-frozen, closed-vocabulary structure; every function downstream of it
 * takes `HhAssetManifest`, never `unknown`.
 */
import {
  SAMPLER_OVERRIDE_KEYS,
  assertSamplerLawCoherent,
  defaultSamplerLaw,
  resolveSamplerLaw,
  type AddressModeLaw,
  type MipmapFilterLaw,
  type SamplerLaw,
  type SamplerOverride,
  type ScaleModeLaw,
} from "./sampler.ts";

export const HH_MANIFEST_SCHEMA_ID = "hh-assetpack-manifest@1";
export const HH_KIT_SCHEMA_ID = "hh-skin-kit@1";

export type ManifestEmitter = "assetpack-core" | "hand-emitted";

export interface HhTextureEntry {
  readonly alias: string;
  /** Pack-relative source path ("meter/signature-meter.png") or, for compiled
   *  atlases, a pixi bundle frame reference ("atlas/kit.json#alias"). */
  readonly src: string;
  /** Fully-resolved per-texture law (defaults already merged at parse time). */
  readonly sampler: SamplerLaw;
}

/** A pixi-format bundle manifest entry, trimmed to what we vouch for. */
export interface PixiBundleAsset {
  readonly alias: string;
  readonly src: string;
  /** ALL srcs the asset offers (webp+png fallbacks survive the boundary). */
  readonly srcs: readonly string[];
  readonly tags: readonly string[];
}

export interface PixiBundle {
  readonly name: string;
  readonly assets: readonly PixiBundleAsset[];
}

export interface HhAssetManifest {
  readonly schema: typeof HH_MANIFEST_SCHEMA_ID;
  readonly kit: string;
  readonly emitter: ManifestEmitter;
  readonly defaults: SamplerLaw;
  readonly textures: readonly HhTextureEntry[];
  readonly pixiManifest: readonly PixiBundle[];
}

export class AssetManifestError extends Error {
  constructor(path: string, message: string) {
    super(`hh-assetpack-manifest invalid at '${path}': ${message}`);
    this.name = "AssetManifestError";
  }
}

/* ────────────────────────── primitive guards ────────────────────────── */

function asRecord(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new AssetManifestError(path, `expected an object, got ${describe(value)}`);
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown, path: string): string {
  if (typeof value !== "string") {
    throw new AssetManifestError(path, `expected a string, got ${describe(value)}`);
  }
  return value;
}

function asBoolean(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") {
    throw new AssetManifestError(path, `expected a boolean, got ${describe(value)}`);
  }
  return value;
}

function describe(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], path: string): T {
  const raw = asString(value, path);
  for (const candidate of allowed) {
    if (raw === candidate) return candidate;
  }
  throw new AssetManifestError(path, `expected one of ${allowed.map((a) => `"${a}"`).join(", ")}, got "${raw}"`);
}

function requireKeys(keys: readonly string[], provided: Record<string, unknown>, path: string): void {
  for (const key of Object.keys(provided)) {
    if (!keys.includes(key)) {
      throw new AssetManifestError(`${path}.${key}`, `unknown key "${key}" (legal: ${keys.join(", ")})`);
    }
  }
}

/* ──────────────────────────── law parsing ───────────────────────────── */

function parseSamplerFields(source: Record<string, unknown>, path: string): SamplerLaw {
  const scaleMode = oneOf<ScaleModeLaw>(source["scaleMode"], ["nearest"], `${path}.scaleMode`);
  const mipmapFilter = oneOf<MipmapFilterLaw>(source["mipmapFilter"], ["nearest-noip", "nearest"], `${path}.mipmapFilter`);
  const addressMode = oneOf<AddressModeLaw>(
    source["addressMode"],
    ["clamp-to-edge", "repeat", "mirror-repeat"],
    `${path}.addressMode`,
  );
  const roundPixels = asBoolean(source["roundPixels"], `${path}.roundPixels`);
  const buildMipmaps = asBoolean(source["buildMipmaps"], `${path}.buildMipmaps`);
  const law: SamplerLaw = { scaleMode, mipmapFilter, addressMode, roundPixels, buildMipmaps };
  assertSamplerLawCoherent(law);
  return law;
}

function parseDefaults(value: unknown): SamplerLaw {
  const source = asRecord(value, "defaults");
  requireKeys(SAMPLER_OVERRIDE_KEYS, source, "defaults");
  const law = parseSamplerFields(source, "defaults");
  const expected = defaultSamplerLaw();
  if (law.scaleMode !== expected.scaleMode || law.mipmapFilter !== expected.mipmapFilter || !law.roundPixels) {
    throw new AssetManifestError(
      "defaults",
      `the §4.7 pixel-perfect law requires scaleMode "nearest", mipmapFilter "nearest-noip" and roundPixels true — a manifest may relax addressMode/buildMipmaps, never the crispness core`,
    );
  }
  return law;
}

function parseOverride(value: unknown, path: string): SamplerOverride {
  const source = asRecord(value, path);
  requireKeys(SAMPLER_OVERRIDE_KEYS, source, path);
  const picked: Record<string, unknown> = {};
  for (const key of SAMPLER_OVERRIDE_KEYS) {
    const raw = source[key];
    if (raw !== undefined) picked[key] = raw;
  }
  // Fill whatever is absent with the whole-law defaults so parseSamplerFields
  // (which demands all five keys) can run; resolveSamplerLaw re-checks.
  const base = defaultSamplerLaw() as unknown as Record<string, unknown>;
  const filled = { ...base, ...picked };
  return parseSamplerFields(filled, path);
}

/* ──────────────────────────── src / alias ───────────────────────────── */

const ALIASE_PATTERN = /^[a-z0-9][a-z0-9._-]*$/;

function parseAlias(value: unknown, path: string): string {
  const raw = asString(value, path);
  if (!ALIASE_PATTERN.test(raw)) {
    throw new AssetManifestError(path, `alias must match ${ALIASE_PATTERN} (lowercase, dotted namespace), got "${raw}"`);
  }
  return raw;
}

function parseSrc(value: unknown, path: string): string {
  const raw = asString(value, path);
  if (raw.length === 0) {
    throw new AssetManifestError(path, "src must not be empty");
  }
  if (raw.startsWith("/") || raw.startsWith("\\") || raw.includes("..")) {
    throw new AssetManifestError(path, `src must be a pack-relative path without traversal, got "${raw}"`);
  }
  return raw;
}

/* ─────────────────────────── pixi passthrough ───────────────────────── */

/** AssetPack 'pixi' exporter tags (verified against @assetpack/core 1.7.0
 *  typings): 'manifest' = this file, 'mIgnore', plus texturePacker tags
 *  'tps' | 'fix' | 'jpg' | 'nomip'. Anything else is an invention — reject. */
const KNOWN_PIXI_TAGS: readonly string[] = ["manifest", "mIgnore", "tps", "fix", "jpg", "nomip"];

function parsePixiManifest(value: unknown): readonly PixiBundle[] {
  const root = asRecord(value, "pixiManifest");
  const bundlesValue = root["bundles"];
  if (!Array.isArray(bundlesValue)) {
    throw new AssetManifestError("pixiManifest.bundles", `expected an array, got ${describe(bundlesValue)}`);
  }
  const extraKeys = Object.keys(root).filter((k) => k !== "bundles");
  if (extraKeys.length > 0) {
    throw new AssetManifestError("pixiManifest", `unknown key "${extraKeys.join(", ")}" (AssetPack pixi manifests carry only bundles)`);
  }
  return bundlesValue.map((bundleValue, index) => parsePixiBundle(bundleValue, `pixiManifest.bundles[${index}]`));
}

function parsePixiBundle(value: unknown, path: string): PixiBundle {
  const bundle = asRecord(value, path);
  const name = asString(bundle["name"], `${path}.name`);
  const assetsValue = bundle["assets"];
  if (!Array.isArray(assetsValue)) {
    throw new AssetManifestError(`${path}.assets`, `expected an array, got ${describe(assetsValue)}`);
  }
  const assets = assetsValue.map((assetValue, index) => parsePixiAsset(assetValue, `${path}.assets[${index}]`));
  return { name, assets };
}

function parsePixiAsset(value: unknown, path: string): PixiBundleAsset {
  const asset = asRecord(value, path);
  const aliasRaw = asset["alias"];
  const alias = Array.isArray(aliasRaw) ? asString(aliasRaw[0], `${path}.alias[0]`) : asString(aliasRaw, `${path}.alias`);
  const srcs = parsePixiSrcs(asset["src"], `${path}.src`);
  const tags = parsePixiTags(asset["data"], `${path}.data`);
  return { alias, src: srcs[0] as string, srcs, tags };
}

/** AssetPack emits src as string | (string | {src, progressSize})[] — real
 *  vendor output lists every delivered format (webp first, png fallback). */
function parsePixiSrcs(value: unknown, path: string): readonly string[] {
  const items = Array.isArray(value) ? value : [value];
  return items.map((item, index) => {
    const itemPath = Array.isArray(value) ? `${path}[${index}]` : path;
    if (typeof item === "string") return parseSrc(item, itemPath);
    const wrapped = asRecord(item, itemPath);
    return parseSrc(asString(wrapped["src"], `${itemPath}.src`), `${itemPath}.src`);
  });
}

/** Two legal tag shapes, both verified against live core 1.7.0 output:
 *  array form ["tps"] (our hand-emitted mirror) and metadata-object form
 *  {tps: true} (what assetSettings.metaData produces). */
function parsePixiTags(dataValue: unknown, path: string): readonly string[] {
  if (dataValue === undefined || dataValue === null) return [];
  const data = asRecord(dataValue, path);
  const tagsValue = data["tags"];
  if (tagsValue === undefined) return [];
  if (Array.isArray(tagsValue)) {
    return tagsValue.map((tagValue, index) => {
      const tag = asString(tagValue, `${path}.tags[${index}]`);
      assertKnownTag(tag, `${path}.tags`);
      return tag;
    });
  }
  const tags: string[] = [];
  for (const [tag, enabled] of Object.entries(asRecord(tagsValue, `${path}.tags`))) {
    assertKnownTag(tag, `${path}.tags`);
    if (typeof enabled !== "boolean") {
      throw new AssetManifestError(`${path}.tags.${tag}`, `expected a boolean, got ${describe(enabled)}`);
    }
    if (enabled) tags.push(tag);
  }
  return tags;
}

function assertKnownTag(tag: string, path: string): void {
  if (!KNOWN_PIXI_TAGS.includes(tag)) {
    throw new AssetManifestError(path, `unknown AssetPack tag "${tag}" (known: ${KNOWN_PIXI_TAGS.join(", ")})`);
  }
}

/* ────────────────────────────── top level ───────────────────────────── */

const TOP_LEVEL_KEYS: readonly string[] = ["schema", "kit", "emitter", "defaults", "textures", "pixiManifest"];

export function parseHhAssetManifest(json: unknown): HhAssetManifest {
  const root = asRecord(json, "<root>");
  requireKeys(TOP_LEVEL_KEYS, root, "<root>");

  const schema = oneOf(root["schema"], [HH_MANIFEST_SCHEMA_ID], "schema");
  const kit = asString(root["kit"], "kit");
  if (!/^[a-z0-9][a-z0-9-]*$/.test(kit)) {
    throw new AssetManifestError("kit", `kit name must be lowercase-dashed, got "${kit}"`);
  }
  const emitter = oneOf<ManifestEmitter>(root["emitter"], ["assetpack-core", "hand-emitted"], "emitter");
  const defaults = parseDefaults(root["defaults"]);

  const texturesValue = root["textures"];
  if (!Array.isArray(texturesValue) || texturesValue.length === 0) {
    throw new AssetManifestError("textures", `expected a non-empty array, got ${describe(texturesValue)}`);
  }
  const seenAliases = new Set<string>();
  const textures: HhTextureEntry[] = texturesValue.map((entryValue, index) => {
    const path = `textures[${index}]`;
    const entry = asRecord(entryValue, path);
    requireKeys(["alias", "src", "sampler"], entry, path);
    const alias = parseAlias(entry["alias"], `${path}.alias`);
    if (seenAliases.has(alias)) {
      throw new AssetManifestError(`${path}.alias`, `duplicate alias "${alias}"`);
    }
    seenAliases.add(alias);
    const src = parseSrc(entry["src"], `${path}.src`);
    const override: SamplerOverride =
      entry["sampler"] === undefined || entry["sampler"] === null ? {} : parseOverride(entry["sampler"], `${path}.sampler`);
    return { alias, src, sampler: resolveSamplerLaw(defaults, override) };
  });

  const pixiManifest = parsePixiManifest(root["pixiManifest"]);

  return deepFreezeManifest({ schema, kit, emitter, defaults, textures, pixiManifest });
}

function deepFreezeManifest(manifest: HhAssetManifest): HhAssetManifest {
  Object.freeze(manifest.defaults);
  for (const texture of manifest.textures) {
    Object.freeze(texture.sampler);
    Object.freeze(texture);
  }
  Object.freeze(manifest.textures);
  for (const bundle of manifest.pixiManifest) {
    for (const asset of bundle.assets) {
      Object.freeze(asset.tags);
      Object.freeze(asset.srcs);
      Object.freeze(asset);
    }
    Object.freeze(bundle.assets);
    Object.freeze(bundle);
  }
  Object.freeze(manifest.pixiManifest);
  return Object.freeze(manifest);
}

/** Stable key order for byte-identical re-emit (repo convention: parsers and
 *  emitters round-trip, so drift shows up as a diff, not as hash noise). */
export function serializeHhAssetManifest(manifest: HhAssetManifest): string {
  const doc = {
    schema: manifest.schema,
    kit: manifest.kit,
    emitter: manifest.emitter,
    defaults: lawToPlain(manifest.defaults),
    textures: manifest.textures.map((entry) => ({
      alias: entry.alias,
      src: entry.src,
      sampler: lawToPlain(entry.sampler),
    })),
    pixiManifest: {
      bundles: manifest.pixiManifest.map((bundle) => ({
        name: bundle.name,
        assets: bundle.assets.map((asset) => ({
          alias: asset.alias,
          src: asset.src,
          // multi-format fallbacks (webp+png) only when the vendor offered them
          ...(asset.srcs.length > 1 ? { srcs: [...asset.srcs] } : {}),
          data: { tags: [...asset.tags] },
        })),
      })),
    },
  };
  return `${JSON.stringify(doc, null, 2)}\n`;
}

function lawToPlain(law: SamplerLaw): Record<string, unknown> {
  return {
    scaleMode: law.scaleMode,
    mipmapFilter: law.mipmapFilter,
    addressMode: law.addressMode,
    roundPixels: law.roundPixels,
    buildMipmaps: law.buildMipmaps,
  };
}
