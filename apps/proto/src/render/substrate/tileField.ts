/**
 * The substrate MATERIALIZER — the only code in this repository that imports
 * `@pixi/tilemap` (pinned by render/__tests__/substrateLaw.test.ts: exactly
 * one import statement here, zero everywhere else). ADR-0008 step-3 spike.
 *
 * Why this file exists separately from substrateField.ts: the law module is
 * pure TypeScript and node-testable (the codebase pattern — postChain.ts vs
 * writer.ts); the vendor-heavy write surface gets its own honest home. The
 * import itself is a side effect the sole-site law exists to fence:
 * @pixi/tilemap@5.0.2 calls `extensions.add(TilemapPipe)`,
 * `extensions.add(GlTilemapAdaptor)` and `extensions.add(GpuTilemapAdaptor)`
 * at module scope — merely importing it registers three renderer pipes
 * globally (spike finding; see README).
 *
 * Wrapper law encoded here (ADR-0008):
 *  - No addon self-subscribes to `app.ticker`: this file never imports
 *    Application and never touches `.ticker` — a substrate region is written
 *    once and redrawn only when its field changes, driven by OUR code paths.
 *  - No invented colors: tiles are sub-rects (u,v) of the palette sheet
 *    produced by the seed-kit law in substrateField.ts; no hex/number color
 *    literal appears in this file either (substrateLaw.test.ts scans both).
 *  - Renderer-admission discipline: a CompositeTilemap is only ever built
 *    for a PARSED, ledger-admitted region; the ledger owns the holder
 *    (`tilemap:substrate:<region>`). This file cannot draw what the law
 *    refused.
 *
 * Spike findings that shaped this file (disk-verified against 5.0.2, full
 * receipts in README.md):
 *  - `settings.TEXTILE_SCALE_MODE` ("linear" by default, docs demand
 *    never-after-init) has ZERO consumers in the shipped JS — a phantom from
 *    the pre-texture-array era. The sampler law therefore guards WHERE it
 *    actually bites: the TextureStyle on the palette TextureSource handed in
 *    (fresh sources default to `linear`, which would mush every texel —
 *    materializeRegion refuses a non-nearest source by name).
 *  - The rect-tile write surface is `.tile(index, x, y, {u, v, tileWidth,
 *    tileHeight})`; the docs' `addRectTile` is deprecated and absent from
 *    `Tilemap` entirely (version mirage, ADR traps family).
 */
import { CompositeTilemap, POINT_STRUCT_SIZE } from "@pixi/tilemap";
import type { Container, TextureSource } from "pixi.js";
import {
  slotOf,
  type ParsedSubstrateRegion,
} from "./substrateField";

/** The compositor builds every layer container with label `layer:<name>`
 *  (compositor.ts). That label is the mount proof — same pattern as
 *  POST_ROOT_LABEL in post/writer.ts: visible in the pixi inspector, so an
 *  accidental graft onto another stratum is legible on screen, not only in
 *  a test run. */
export const SUBSTRATE_MOUNT_LABEL = "layer:substrate";

/** Per-map label prefix so a region's tilemap self-identifies in the tree. */
export const SUBSTRATE_MAP_LABEL_PREFIX = "hh:substrate:";

/** Wrapper-law gatekeeper: only the substrate layer container may host a
 *  tilemap. Anything else throws naming the class law (law: substrate-only,
 *  "never let a concept live in two layers"). */
export function assertSubstrateMount(target: Container): void {
  if (target.label === SUBSTRATE_MOUNT_LABEL) return;
  throw new Error(
    `substrate[mount-target]: container '${target.label || "(unlabelled)"}' is not the substrate ` +
      "layer. Tilemaps mount on layer:substrate ONLY (ADR-0008 hard condition) — tiles never " +
      "carry Intent, Attachment, or Annotation concepts, and flow is the emissive signal " +
      "stratum. Build the region against layers.substrate instead.",
  );
}

/** Sampler-law guard: the palette source must carry nearest filtering before
 *  a single tile references it (§4.7 / lane-1 manifest law). Fresh pixi
 *  TextureSources default to `linear` — a substrate built from one would
 *  silently violate the pixel-perfect law the atlas lane just closed, so
 *  this fails loud at wiring time, not on first frame. */
export function assertPaletteSamplerLaw(source: TextureSource): void {
  const scaleMode = source.style?.scaleMode;
  if (scaleMode === "nearest") return;
  throw new Error(
    `substrate[not-nearest]: palette source style.scaleMode is '${String(scaleMode)}', ` +
      "not 'nearest' — §4.7 pixel-perfect law. Create sources after installSamplerLaw(" +
      "TextureStyle.defaultOptions, …) (compositor.ts) or pass an explicit nearest " +
      "TextureStyle; the tilemap vendor offers no per-tile escape and its " +
      "TEXTILE_SCALE_MODE setting is a phantom (no consumers in @pixi/tilemap 5.0.2).",
  );
}

/** A materialized region: the vendor object stays behind this seam — callers
 *  get the container (to mount) plus law-shaped measurements, never the
 *  internals. `map` is typed via the import so the barrel consumer still gets
 *  the real Container API (CompositeTilemap extends Container). */
export interface SubstrateTilemap {
  readonly map: CompositeTilemap;
  readonly regionId: string;
}

/** Write every authored cell of a parsed region as one rect-tile.
 *  Construction-only: the region arrived parsed and ledger-admitted
 *  (parse-don't-validate — nothing is re-checked beyond the slot arithmetic
 *  slotOf already centralizes). The final throw is the PARSE-side guard: it
 *  fires if this loop's own count ever disagrees with the parsed plan.
 *  Vendor-side truth (a `.tile()` call that silently stores nothing) is
 *  caught one level up, where a real CompositeTilemap exists: see
 *  verifyVendorHold, called by materializeRegion and redrawRegion. */
export function writeRegionTiles(
  map: CompositeTilemap,
  region: ParsedSubstrateRegion,
): number {
  let written = 0;
  for (const [rowIndex, row] of region.cells.entries()) {
    for (const [colIndex, cell] of row.entries()) {
      if (cell === null) continue;
      const { u, v, tileWidth, tileHeight } = slotOf(cell, region.palette);
      map.tile(0, colIndex * region.tileWorldSize, rowIndex * region.tileWorldSize, {
        // Single-source tileset: the slot lives in (u,v), the texture index
        // is always 0 — this is the modern rect-tile write (see the header:
        // `addRectTile` no longer exists on Tilemap).
        u,
        v,
        tileWidth,
        tileHeight,
      });
      written += 1;
    }
  }
  if (written !== region.quads) {
    throw new Error(
      `substrate[write-drift]: wrote ${written} tiles for a ${region.quads}-quad region '${region.regionId}' ` +
        "— the vendor dropped a write; do not render a partial substrate",
    );
  }
  return written;
}

/** Vendor-truth check: count the quads the tilemap actually stores in its own
 *  buffers after a write pass and refuse any disagreement. A `.tile()` call
 *  returns void — a silently-swallowed write would otherwise surface as a
 *  half-painted floor on screen. Called by BOTH real-map paths
 *  (materializeRegion, redrawRegion) before the map is handed to anyone. */
function verifyVendorHold(map: CompositeTilemap, expected: number, regionId: string): void {
  const held = quadsHeldIn(map);
  if (held === expected) return;
  throw new Error(
    `substrate[vendor-drop]: tilemap for region '${regionId}' holds ${held} quads after ` +
      `${expected} writes — do not hand out a half-painted floor`,
  );
}

/** Materialize an admitted region into one CompositeTilemap. The palette
 *  source is injected — this spike never loads assets; the first-mount
 *  consumer wires the skin-kit texture through the asset pipeline (README).
 *  Every write is verified against the vendor's own buffer before return:
 *  a dropped quad crashes here, never paints half a floor later. */
export function materializeRegion(
  region: ParsedSubstrateRegion,
  paletteSource: TextureSource,
): SubstrateTilemap {
  assertPaletteSamplerLaw(paletteSource);
  const map = new CompositeTilemap([paletteSource]);
  map.label = `${SUBSTRATE_MAP_LABEL_PREFIX}${region.regionId}`;
  const written = writeRegionTiles(map, region);
  verifyVendorHold(map, written, region.regionId);
  return { map, regionId: region.regionId };
}

/** Replace a region's field in place (author edit path): clear, rewrite,
 *  re-verify vendor truth. The holder and the mounted map identity survive —
 *  no re-admission, because the ledger already owns the one whole-layer
 *  holder this map draws with. */
export function redrawRegion(
  tilemap: SubstrateTilemap,
  region: ParsedSubstrateRegion,
): number {
  if (region.regionId !== tilemap.regionId) {
    throw new Error(
      `substrate[wrong-region]: redraw got region '${region.regionId}' for a map of ` +
        `'${tilemap.regionId}' — holders are per-region, never cross-mounted`,
    );
  }
  tilemap.map.clear();
  const written = writeRegionTiles(tilemap.map, region);
  verifyVendorHold(tilemap.map, written, region.regionId);
  return written;
}

/** Mount proof + the actual attach step. Refuses any non-substrate layer by
 *  name (assertSubstrateMount), then stacks the region's map into the layer.
 *  Returns the tilemap for the caller to keep behind the ledger seam. */
export function mountRegion(layer: Container, tilemap: SubstrateTilemap): SubstrateTilemap {
  assertSubstrateMount(layer);
  layer.addChild(tilemap.map);
  return tilemap;
}

/** Unmount + destroy one region's map. Returns whether the layer lost a
 *  child (idempotent teardown races get a boolean, not a throw). */
export function unmountRegion(layer: Container, tilemap: SubstrateTilemap): boolean {
  assertSubstrateMount(layer);
  if (!layer.children.includes(tilemap.map)) return false;
  layer.removeChild(tilemap.map);
  tilemap.map.destroy({ children: true });
  return true;
}

/* ───────────────────────── headless measurement seams ─────────────────────────
   Real draw calls need a GPU (the @pixi/node CI arm — ADR step 5, deferred).
   What IS measurable without a renderer is the batching STRUCTURE the draw
   calls fall out of: each internal Tilemap child is one render instruction
   (renderPipeId "tilemap"), and each written tile is POINT_STRUCT_SIZE
   floats in its pointsBuf. These two are the spike's receipts. */

/** Tilemaps the composite is actually batching across (1 while the region's
 *  distinct sources fit TEXTURES_PER_TILEMAP = 16). Draw-call surrogate: one
 *  render instruction per batch, per frame. */
export function substrateBatches(tilemap: SubstrateTilemap): number {
  return tilemap.map.children.length;
}

/** Quads the vendor's own buffers hold for one composite (pointsBuf floats ÷
 *  POINT_STRUCT_SIZE, summed over its internal Tilemap children). Shared by
 *  the write-path verifier and the public measurement seam. */
function quadsHeldIn(map: CompositeTilemap): number {
  let quads = 0;
  for (const child of map.children) {
    const buf = (child as unknown as { pointsBuf?: number[] | Float32Array }).pointsBuf;
    quads += buf ? buf.length / POINT_STRUCT_SIZE : 0;
  }
  return quads;
}

/** Quads the vendor currently holds — read off its own buffer math, the
 *  falsifiable twin of writeRegionTiles's return count. materializeRegion and
 *  redrawRegion run this very check internally before handing the map out. */
export function substrateQuadsHeld(tilemap: SubstrateTilemap): number {
  return quadsHeldIn(tilemap.map);
}
