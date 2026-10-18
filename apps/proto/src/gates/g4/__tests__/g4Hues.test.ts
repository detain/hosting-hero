/**
 * G4GatePanel hue laws — wave-26 plate unification (L-G4P, owner ruling
 * "zero bespoke plate hexes").
 *
 * Wave-25 @7fed0c4 retired G7's off-ledger plate grey #9aa7b8 onto
 * `var(--hh-hue-grey)` over `var(--hh-surface)` and DISCLOSED that this panel
 * kept its own copy as "gate-local material" (round-4 hue-law residue). The
 * owner ruled the pair unified: G4 now consumes the same ledger projection.
 *
 * G4's plate carries more ink than G7's — the device id (era accent), a faded
 * kind/meta pair (the same accent at CSS opacity), the NO-POWER-FEED alarm
 * line, and the four port-shape glyphs — and the chrome contrast census
 * (chrome/a11y/contrastAudit.ts) is chrome-only jurisdiction, so THIS file is
 * the gate-local AA audit the unification owes: every pairing lives-parsed
 * from source, checked against the house floors (text 4.5 / ui 3) in all four
 * canon eras. Falsifiable probes pin WHY each dial sits where it does.
 *
 * Law inherited from the census and g7Hues.test.ts: thresholds are NEVER
 * edited to make a pairing pass — the pairings move. Two moved here:
 *   • plate lift 82% + #9aa7b8 → 90% + ledger grey (the retired literal put
 *     the 2008 accent id at an unaudited 4.20 — falsified below);
 *   • kind/meta fade 0.7 → 0.95 (at 0.7 the composite cleared the text floor
 *     at NO lift: the 2008 blue tops out at 3.57 even on bare surface, so the
 *     fade, not the lift, was the binding constraint — falsified below).
 * 90% rather than G7's 88% because G4's plate also bears the alarm line; at
 * 88 that pairing passes 2008 by 0.002, which is a coincidence, not a tune.
 * The plate hairline stays decorative with its rationale earned, mirroring
 * the census's `accent-hairline-frame` row.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { HUE_LEDGER } from "../../../render/hues";
import {
  AA_MINIMUM_RATIO,
  contrastRatio,
  mixSrgb,
  parseHexColor,
} from "../../../chrome/a11y/contrastAudit";

// vitest roots at apps/proto (chrome/lab/gates law-test convention).
const PANEL = readFileSync(join(process.cwd(), "src", "gates", "g4", "G4GatePanel.vue"), "utf8");
const ERA_CSS = readFileSync(join(process.cwd(), "src", "chrome", "styles", "era-tokens.css"), "utf8");

/** Strip CSS comments so commented-out history can never satisfy a scan. */
function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

/** The <style> block only — template/script carry their own lint families. */
function styleBlock(source: string): string {
  const match = /<style[^>]*>([\s\S]*?)<\/style>/.exec(source);
  if (match === null || match[1] === undefined) {
    throw new Error("g4-hues: panel lost its <style> block");
  }
  return stripCssComments(match[1]);
}

/* The four canon eras, parsed live out of era-tokens.css — a re-authored era
 * fails the drift pin below and forces this audit to be re-read, never to be
 * silently inherited. */
function parseEras(): Record<string, { surface: string; accent: string }> {
  const eras: Record<string, { surface: string; accent: string }> = {};
  for (const m of ERA_CSS.matchAll(
    /html\[data-era="(\d{4})"\]\s*\{([\s\S]*?)\}/g,
  )) {
    const year = m[1] ?? "";
    const body = m[2] ?? "";
    const surface = /--hh-surface:\s*(#[0-9a-fA-F]{6})/.exec(body)?.[1];
    const accent = /--hh-accent:\s*(#[0-9a-fA-F]{6})/.exec(body)?.[1];
    if (surface === undefined || accent === undefined) {
      throw new Error(`g4-hues: era ${year} missing surface/accent token`);
    }
    eras[year] = { surface, accent };
  }
  return eras;
}

const CSS = styleBlock(PANEL);
const ERAS = parseEras();

/** Fail-loud live parse at the module boundary: a regex miss means the panel
 *  was re-authored and this audit must be re-read, not quietly inherited. */
function requireGroup(re: RegExp, label: string): string {
  const raw = re.exec(CSS)?.[1];
  if (raw === undefined) {
    throw new Error(`g4-hues: source no longer carries ${label} — re-read this audit`);
  }
  return raw;
}

const GREY = parseHexColor(`#${HUE_LEDGER.grey.hex.toString(16).padStart(6, "0")}`);
const ALARM = parseHexColor(`#${HUE_LEDGER.alarm.hex.toString(16).padStart(6, "0")}`);
const BLACK = parseHexColor("#000000");

/* The live dials. The LAW is the floor; every number here is history the
 * audit is entitled to demand re-justification of. */
const PLATE_PCT = Number(requireGroup(/--g4-plate:\s*color-mix\(in srgb,\s*var\(--hh-surface\)\s+(\d+)%/, "the --g4-plate lift percentage"));
const META_FADE = Number(requireGroup(/\.g4-device-kind,\s*\.g4-device-meta\s*\{[^}]*?opacity:\s*([\d.]+)/, "the kind/meta fade"));
const POWER_GLYPH = parseHexColor(requireGroup(/--g4-hue-power:\s*(#[0-9a-fA-F]{6})/, "the --g4-hue-power glyph hex"));
const CONTROL_GLYPH = parseHexColor(requireGroup(/--g4-hue-control:\s*(#[0-9a-fA-F]{6})/, "the --g4-hue-control glyph hex"));
const TRUST_GLYPH = parseHexColor(requireGroup(/--g4-hue-trust:\s*(#[0-9a-fA-F]{6})/, "the --g4-hue-trust glyph hex"));
const STROKE_PCT = Number(requireGroup(/\.g4-device-plate\s*\{[^}]*?var\(--g4-ink\)\s+(\d+)%,\s*transparent/, "the plate hairline strength"));
const CIRCLE_PCT = Number(requireGroup(/\.g4-edge-pull circle\s*\{[^}]*?var\(--hh-hue-alarm\)\s+(\d+)%,\s*black/, "the pull-circle tint strength"));

function plateFor(era: { readonly surface: string }): ReturnType<typeof parseHexColor> {
  return mixSrgb(parseHexColor(era.surface), GREY, PLATE_PCT / 100);
}

const ERA_2008 = ERAS["2008"];
if (ERA_2008 === undefined) {
  throw new Error("g4-hues: the 2008 era block vanished from era-tokens.css");
}

describe("G4 style block — the bespoke plate hex is retired onto the ledger", () => {
  it("no longer spells #9aa7b8 in code (comments may remember it)", () => {
    // Falsifiable: before this lane the literal was live at --g4-plate; the
    // comment block MENTIONS it, the code must not. styleBlock() strips
    // comments for exactly that distinction.
    expect(CSS).not.toMatch(/#9aa7b8/i);
    const armed = CSS.replace("var(--hh-hue-grey)", "#9aa7b8");
    expect(armed).toMatch(/#9aa7b8/i); // the scan CAN fail — probe, not vacuity
  });

  it("consumes the ledger-grey projection over the era surface (the G7 recipe)", () => {
    expect(CSS).toMatch(/--g4-plate:\s*color-mix\(in srgb,\s*var\(--hh-surface\)\s+\d+%,\s*var\(--hh-hue-grey\)\)/);
    expect(CSS).toMatch(/\.g4-device-plate\s*\{\s*fill:\s*var\(--g4-plate\)/);
  });

  it("keeps the ride-chains honest: id/meta on the era accent, alarm on the ledger klaxon", () => {
    expect(CSS).toMatch(/--g4-ink:\s*var\(--hh-accent\)/);
    expect(CSS).toMatch(/\.g4-device-id\s*\{\s*fill:\s*var\(--g4-ink\)/);
    expect(CSS).toMatch(/\.g4-device-kind,\s*\.g4-device-meta\s*\{\s*fill:\s*var\(--g4-ink\)/);
    expect(CSS).toMatch(/\.g4-device-alarm\s*\{\s*fill:\s*var\(--hh-hue-alarm\)/);
    expect(CSS).toMatch(/--g4-hue-data:\s*var\(--hh-accent\)/); // data glyph rides the accent too
  });
});

describe("era-tokens drift pin — the audited palette is still the shipped one", () => {
  it("carries the quad-canon tokens exactly", () => {
    expect(ERAS).toEqual({
      "1998": { surface: "#171d24", accent: "#f2b133" },
      "2008": { surface: "#10222e", accent: "#3b9eff" },
      "2016": { surface: "#1b1e22", accent: "#1abc9c" },
      "2026": { surface: "#0d131c", accent: "#35e0e6" },
    });
  });
});

describe("G4 pairing audit — AA floors in all four canon eras", () => {
  for (const [eraName, era] of Object.entries(ERAS)) {
    describe(eraName, () => {
      const accent = parseHexColor(era.accent);
      const plate = plateFor(era);

      it("device id + faded kind/meta + alarm line hold the 4.5 text floor on the plate", () => {
        expect(contrastRatio(accent, plate)).toBeGreaterThanOrEqual(AA_MINIMUM_RATIO.text);
        // CSS opacity composites the text toward its backdrop (house model).
        expect(contrastRatio(mixSrgb(accent, plate, META_FADE), plate)).toBeGreaterThanOrEqual(AA_MINIMUM_RATIO.text);
        expect(contrastRatio(ALARM, plate)).toBeGreaterThanOrEqual(AA_MINIMUM_RATIO.text);
      });

      it("port-shape glyphs (the R32 material chord) hold the 3.0 UI floor on the plate", () => {
        expect(contrastRatio(POWER_GLYPH, plate)).toBeGreaterThanOrEqual(AA_MINIMUM_RATIO.ui);
        expect(contrastRatio(CONTROL_GLYPH, plate)).toBeGreaterThanOrEqual(AA_MINIMUM_RATIO.ui);
        expect(contrastRatio(TRUST_GLYPH, plate)).toBeGreaterThanOrEqual(AA_MINIMUM_RATIO.ui);
        expect(contrastRatio(accent, plate)).toBeGreaterThanOrEqual(AA_MINIMUM_RATIO.ui); // data glyph = accent
      });
    });
  }

  it("the pull-× rides its own near-black circle, so it never depends on the plate", () => {
    // .g4-edge-pull circle fill = color-mix(alarm CIRCLE_PCT%, black) — opaque
    // and era-independent; the × glyph is the alarm klaxon on top of it.
    const circle = mixSrgb(ALARM, BLACK, CIRCLE_PCT / 100);
    expect(contrastRatio(ALARM, circle)).toBeGreaterThanOrEqual(AA_MINIMUM_RATIO.text);
  });

  it("the plate hairline is DECORATIVE — its rationale stays earned", () => {
    // Census precedent (accent-hairline-frame): a framing hairline is exempt
    // ONLY because the framed component's identity rides AA text elsewhere —
    // here the id/meta/alarm rows and the port glyphs audited above, never
    // the border. The hairline sits BELOW the UI floor in the 2008 pairing
    // (2.77 at 60% ink on plate); this pin keeps the number honest — if it
    // ever clears 3 the exemption was unearned, and if the passing rows above
    // ever sink the rationale rots. Either way a human re-reads this file.
    const accent = parseHexColor(ERA_2008.accent);
    const plate = plateFor(ERA_2008);
    expect(contrastRatio(mixSrgb(accent, plate, STROKE_PCT / 100), plate)).toBeLessThan(AA_MINIMUM_RATIO.ui);
  });
});

describe("why the pairings moved — falsifiable history", () => {
  it("the retired #9aa7b8 at the old 82% lift failed the 2008 id at 4.20 (shipped unaudited)", () => {
    const legacyPlate = mixSrgb(parseHexColor(ERA_2008.surface), parseHexColor("#9aa7b8"), 0.82);
    const ratio = contrastRatio(parseHexColor(ERA_2008.accent), legacyPlate);
    expect(ratio).toBeLessThan(AA_MINIMUM_RATIO.text);
    expect(ratio).toBeCloseTo(4.2, 1); // the number the wave-25 disclosure named
  });

  it("the retired 0.7 fade cleared the text floor at NO lift — the fade had to move, not the plate", () => {
    const accent = parseHexColor(ERA_2008.accent);
    for (const pct of [82, 88, 94, 100]) {
      const plate = mixSrgb(parseHexColor(ERA_2008.surface), GREY, pct / 100);
      expect(contrastRatio(mixSrgb(accent, plate, 0.7), plate)).toBeLessThan(AA_MINIMUM_RATIO.text);
    }
  });
});
