/**
 * The seed kit definition (PLACEHOLDER — pending real pixel art). This module
 * is the single source: `cli.ts make-kit` renders it to
 * assets/skin-kits/seed-shared-web/, so kit.json and the PNGs on disk are
 * always regenerable facts, never hand-maintained ones.
 */
import { HH_KIT_SCHEMA_ID } from "./manifest.ts";

export const SEED_SHARED_WEB_KIT: unknown = {
  schema: HH_KIT_SCHEMA_ID,
  name: "seed-shared-web",
  lineage: "shared-web",
  status: "PLACEHOLDER",
  note:
    "PLACEHOLDER textures pending real pixel art (media/prompts/* are concept renders for " +
    "external generation, not sprite sheets). Solid 64x64 fills with four fixed corner " +
    "markers (#ff00ff TL, #00ffff TR, #ffff00 BL, #000000 BR): any marker color showing " +
    "up away from its corner after packing proves frame bleed. Hues are provisional " +
    "artwork values, NOT Hue Ledger entries.",
  fiveAsset: {
    meter: {
      file: "meter/signature-meter.png",
      meterName: "Requests in flight",
      authoredFirst: true,
      fill: "#4c7a99",
    },
    visitor: { file: "visitor/visitor-form.png", fill: "#8a6f4c" },
    hero: { file: "hero/hero-buildable.png", fill: "#5d8a4c" },
    palette: { file: "palette.png", dominant: "#39424d", accents: ["#7fb2d9", "#c9a24b"] },
    fx: { file: "fx/catastrophe-fx.png", fill: "#994c5e" },
  },
  bleed: {
    cornerSizePx: 4,
    topLeft: "#ff00ff",
    topRight: "#00ffff",
    bottomLeft: "#ffff00",
    bottomRight: "#000000",
  },
};
