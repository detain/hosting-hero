/**
 * Tile-field materializer tests (ADR-0008 step-3 spike).
 *
 * The vendor probe that shaped this file: @pixi/tilemap 5.0.2 constructs and
 * accepts tile writes in a PURE NODE environment — Container/TextureSource/
 * CompositeTilemap need no DOM until a renderer attaches. So unlike
 * post/writer.jsdom.test.ts, this file runs node-native and the measurement
 * seams (batches, quads held) are read off the vendor's own buffers. Real
 * GPU draw calls still need the @pixi/node CI arm (deferred, ADR step 5) —
 * see README.md for the measurement gap stated honestly.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { CompositeTilemap, settings } from "@pixi/tilemap";
import { Container, TextureSource, TextureStyle } from "pixi.js";
import { describe, expect, it, vi } from "vitest";
import {
  SEED_SHARED_WEB_PALETTE,
  parseSubstrateRegion,
  slotOf,
  type SubstrateRegionInput,
} from "../substrate/substrateField";
import {
  SUBSTRATE_MAP_LABEL_PREFIX,
  SUBSTRATE_MOUNT_LABEL,
  assertPaletteSamplerLaw,
  assertSubstrateMount,
  materializeRegion,
  mountRegion,
  redrawRegion,
  substrateBatches,
  substrateQuadsHeld,
  unmountRegion,
  writeRegionTiles,
} from "../substrate/tileField";

/* ────────────────────────────── helpers ────────────────────────────── */

function nearestPaletteSource(widthPx = 64, heightPx = 64): TextureSource {
  const source = new TextureSource({ width: widthPx, height: heightPx });
  source.style = new TextureStyle({ scaleMode: "nearest" });
  return source;
}

function region(input: Partial<SubstrateRegionInput> = {}) {
  return parseSubstrateRegion({
    regionId: "north-hall",
    mountLayer: "substrate",
    cells: [
      [0, 0, 1, null],
      [5, null, 1, 15],
    ],
    ...input,
  });
}

/** A fully-authored rows×cols field cycling the palette slots — the fixture
 *  for cap-sized measurement (never breaks the tile-index law: cycling). */
function fullField(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => (row * cols + col) % 16),
  );
}

/* ─────────────────────────────── guards ─────────────────────────────── */

describe("assertPaletteSamplerLaw — the sampler law guards where it actually bites", () => {
  it("a fresh pixi TextureSource really is linear (the trap the guard names)", () => {
    // If pixi ever flips its default this pin goes red with the law — good.
    const fresh = new TextureSource({ width: 8, height: 8 });
    expect(fresh.style.scaleMode).toBe("linear");
    expect(() => assertPaletteSamplerLaw(fresh)).toThrowError(/substrate\[not-nearest\]/);
  });

  it("a nearest-styled source passes", () => {
    expect(() => assertPaletteSamplerLaw(nearestPaletteSource())).not.toThrow();
  });

  it("SPIKE FINDING (phantom pinned falsifiably): TEXTILE_SCALE_MODE has ZERO consumers in 5.0.2", () => {
    // The docs make it sound load-bearing ("do not change after init") and
    // it DEFAULTS to 'linear' — but a scan of the shipped lib shows the
    // string lives only in settings (lane-2's NoiseFilter mirage, same
    // family). materializeRegion therefore guards the source's real
    // TextureStyle instead. If a future @pixi/tilemap STARTS consuming it,
    // this pin goes red and the seam must set nearest BEFORE renderer init.
    expect(settings.TEXTILE_SCALE_MODE).toBe("linear");
    // pnpm layout: the direct dep symlinks into apps/proto/node_modules.
    // The existsSync pin is the honest failure if that ever changes — the
    // scan must never silently walk nothing.
    const libDir = join(process.cwd(), "node_modules", "@pixi", "tilemap", "lib");
    expect(existsSync(libDir), `vendor layout moved: ${libDir}`).toBe(true);
    const shipped = readdirSync(libDir).filter(
      (name) => /\.(mjs|js)$/.test(name) && !name.startsWith("settings."),
    );
    expect(shipped.length).toBeGreaterThan(5); // the scan really walked the package
    const consumers = shipped.filter((name) =>
      readFileSync(join(libDir, name), "utf8").includes("TEXTILE_SCALE_MODE"),
    );
    expect(consumers).toEqual([]);
  });
});

describe("assertSubstrateMount — substrate-only container factory gate", () => {
  it("the labeled substrate layer container is accepted", () => {
    const layer = new Container();
    layer.label = SUBSTRATE_MOUNT_LABEL; // exactly what compositor.ts builds
    expect(() => assertSubstrateMount(layer)).not.toThrow();
  });

  it("every other stratum is refused by name, quoting the two-layers law", () => {
    for (const label of ["layer:intent", "layer:attachment", "layer:annotation", "layer:flow", ""]) {
      const wrong = new Container();
      wrong.label = label;
      expect(() => assertSubstrateMount(wrong)).toThrowError(/substrate\[mount-target\]/);
      try {
        assertSubstrateMount(wrong);
      } catch (error) {
        expect((error as Error).message).toMatch(/Intent, Attachment, or Annotation/);
      }
    }
  });
});

/* ───────────────────────────── writing ───────────────────────────── */

describe("writeRegionTiles — rect-tile writes from the pure field", () => {
  it("each authored cell becomes one .tile write at its slot sub-rect and world position", () => {
    const writes: [number, number, number, Record<string, number>][] = [];
    const fake = {
      tile(index: number, x: number, y: number, options: Record<string, number>) {
        writes.push([index, x, y, options]);
        return fake;
      },
    } as unknown as CompositeTilemap;

    const parsed = region();
    const written = writeRegionTiles(fake, parsed);

    expect(written).toBe(6);
    expect(written).toBe(parsed.quads);
    // Row-major, nulls skipped; 16 world units per tile edge:
    // row 0: (0,0)→slot 0, (16,0)→slot 0, (32,0)→slot 1   [(48,0) null]
    // row 1: (0,16)→slot 5, (32,16)→slot 1                 [(16,16) null, (48,16)→slot 15]
    expect(writes.map(([index, x, y]) => [index, x, y])).toEqual([
      [0, 0, 0],
      [0, 16, 0],
      [0, 32, 0],
      [0, 0, 16],
      [0, 32, 16],
      [0, 48, 16],
    ]);
    // Single-source tileset: the texture index is always 0; the authored slot
    // travels as the (u,v) sub-rect of the palette sheet.
    for (const [, , , options] of writes) {
      expect(options.tileWidth).toBe(16);
      expect(options.tileHeight).toBe(16);
    }
    expect(writes[0]?.[3]).toEqual(slotOf(0, SEED_SHARED_WEB_PALETTE));
    expect(writes[2]?.[3]).toEqual(slotOf(1, SEED_SHARED_WEB_PALETTE));
    expect(writes[3]?.[3]).toEqual(slotOf(5, SEED_SHARED_WEB_PALETTE));
    expect(writes[5]?.[3]).toEqual(slotOf(15, SEED_SHARED_WEB_PALETTE));
  });

  it("nulls carry no quad: an all-null field can't exist (parse law) and nulls write nothing", () => {
    const tile = vi.fn();
    const fake = { tile } as unknown as CompositeTilemap;
    const parsed = region({ cells: [[null, 3], [null, null]] });
    expect(writeRegionTiles(fake, parsed)).toBe(1);
    expect(tile).toHaveBeenCalledTimes(1);
  });
});

/* ─────────────────────────── materialization ─────────────────────────── */

describe("materializeRegion — vendor truth behind the law seams", () => {
  it("a 6-quad region becomes ONE batched tilemap holding exactly 6 quads", () => {
    const map = materializeRegion(region(), nearestPaletteSource());
    expect(map.map.label).toBe(`${SUBSTRATE_MAP_LABEL_PREFIX}north-hall`);
    expect(substrateBatches(map)).toBe(1); // 1 source ≤ TEXTURES_PER_TILEMAP 16
    expect(substrateQuadsHeld(map)).toBe(6); // pointsBuf / POINT_STRUCT_SIZE
  });

  it("the full seed palette (16 slots) still batches to ONE tilemap child", () => {
    // Spike arithmetic: 64×64 ÷ 16×16 = 16 slots = TEXTURES_PER_TILEMAP.
    // A whole palette's worth of authored variety stays one draw instruction.
    expect(settings.TEXTURES_PER_TILEMAP).toBe(16);
    const cells = fullField(4, 4);
    const map = materializeRegion(region({ regionId: "full-palette", cells }), nearestPaletteSource());
    expect(substrateBatches(map)).toBe(1);
    expect(substrateQuadsHeld(map)).toBe(16);
  });

  it("a 1200-quad Z3-capped field materializes in ONE batch and the vendor holds every quad", () => {
    const parsed = region({ regionId: "estate-floor", cells: fullField(30, 40) });
    expect(parsed.quads).toBe(1200);
    const map = materializeRegion(parsed, nearestPaletteSource());
    expect(substrateBatches(map)).toBe(1);
    expect(substrateQuadsHeld(map)).toBe(1200);
  });

  it("non-nearest sources are refused before a single tile is written", () => {
    const linear = new TextureSource({ width: 64, height: 64 });
    expect(() => materializeRegion(region(), linear)).toThrowError(/substrate\[not-nearest\]/);
  });
});

/* ─────────────────────────── lifecycle ─────────────────────────── */

describe("mount / redraw / unmount — region lifecycle behind the seams", () => {
  it("mountRegion attaches to the substrate layer only", () => {
    const layer = new Container();
    layer.label = SUBSTRATE_MOUNT_LABEL;
    const wrong = new Container();
    wrong.label = "layer:attachment";
    const map = materializeRegion(region(), nearestPaletteSource());
    expect(() => mountRegion(wrong, map)).toThrowError(/substrate\[mount-target\]/);
    expect(mountRegion(layer, map)).toBe(map);
    expect(layer.children).toEqual([map.map]);
  });

  it("redrawRegion replaces the field in place: one map, fresh quad count", () => {
    const map = materializeRegion(region(), nearestPaletteSource());
    expect(substrateQuadsHeld(map)).toBe(6);
    const bigger = region({ cells: [[0, 0], [0, 0]] });
    expect(redrawRegion(map, bigger)).toBe(4);
    expect(substrateQuadsHeld(map)).toBe(4); // cleared, not appended
    expect(substrateBatches(map)).toBe(1);
  });

  it("redraw across regions throws by name — holders are per-region", () => {
    const map = materializeRegion(region(), nearestPaletteSource());
    expect(() => redrawRegion(map, region({ regionId: "other-hall" }))).toThrowError(
      /substrate\[wrong-region\]/,
    );
  });

  it("unmountRegion removes + destroys once, and is a quiet false after", () => {
    const layer = new Container();
    layer.label = SUBSTRATE_MOUNT_LABEL;
    const map = mountRegion(layer, materializeRegion(region(), nearestPaletteSource()));
    expect(unmountRegion(layer, map)).toBe(true);
    expect(layer.children).toHaveLength(0);
    expect(unmountRegion(layer, map)).toBe(false);
  });
});
