/**
 * G7GatePanel hue laws — ADR-0019 program 6 (L-RATIFY).
 *
 * The wave-24 F-4 residue: two off-ledger literals lived in this gate —
 * #b49ce8 (Book-hold ghost violet) and #9aa7b8 (plate lift). This file is the
 * gate-local audit that ratification owes: the CHROME contrast census
 * (chrome/a11y/contrastAudit.ts) is chrome-only jurisdiction, so the panel's
 * pairings are pinned HERE with the exact WCAG math the chrome exports.
 *
 * Law of this file, inherited from the census: thresholds are NEVER edited to
 * make a pairing pass — when the grey swap and the ledger promotion moved
 * pixels, the PAIRINGS were adjusted instead (plate lift 82%→88%, the spare
 * plate's green fill-wash became a green frame, the ghost blink's trough rose
 * 0.62→0.68 because steps(2) renders {1.00, (1+trough)/2} and the old dip
 * landed 4.45 in 2008 — under the text floor). Every such tune is pinned
 * falsifiably below, alongside the armed probes that prove each scan can fail.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { ALERT_HUES, HUE_LEDGER, hueHex } from "../../../render/hues";
import {
  AA_MINIMUM_RATIO,
  contrastRatio,
  mixSrgb,
  parseHexColor,
} from "../../../chrome/a11y/contrastAudit";

// vitest roots at apps/proto (chrome/lab/gates law-test convention).
const PANEL = readFileSync(join(process.cwd(), "src", "gates", "g7", "G7GatePanel.vue"), "utf8");
const ERA_CSS = readFileSync(join(process.cwd(), "src", "chrome", "styles", "era-tokens.css"), "utf8");

/** Strip CSS comments so commented-out history can never satisfy a scan. */
function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

/** The <style> block only — template/script carry their own lint families. */
function styleBlock(source: string): string {
  const match = /<style[^>]*>([\s\S]*?)<\/style>/.exec(source);
  if (match === null || match[1] === undefined) {
    throw new Error("g7-hues: panel lost its <style> block");
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
      throw new Error(`g7-hues: era ${year} missing surface/accent token`);
    }
    eras[year] = { surface, accent };
  }
  return eras;
}

const ERAS = parseEras();
const RULE_INK = parseHexColor(`#${HUE_LEDGER["rule-ink"].hex.toString(16).padStart(6, "0")}`);
const GREEN = parseHexColor(`#${HUE_LEDGER.green.hex.toString(16).padStart(6, "0")}`);
const GREY = parseHexColor(`#${HUE_LEDGER.grey.hex.toString(16).padStart(6, "0")}`);

/** The census's own panel backdrop family: the body gradient's BRIGHTEST
 *  reachable stop (accent 9% over surface) is the conservative floor for
 *  anything that rides the transparent stage — rails and tape included. */
function bodyWash(era: { surface: string; accent: string }) {
  return mixSrgb(parseHexColor(era.accent), parseHexColor(era.surface), 0.09);
}

describe("rule-ink ledger entry (ADR-0019 program 6)", () => {
  it("carries the ratified job and the exact former ghost-violet pixel", () => {
    expect(HUE_LEDGER["rule-ink"]).toEqual({ job: "rule-ink", hex: 0xb49ce8 });
    expect(hueHex("rule-ink")).toBe(0xb49ce8);
  });

  it("stays OUT of ALERT_HUES — a DOM identity channel never draws the canvas triad", () => {
    expect(ALERT_HUES).not.toContain("rule-ink");
  });

  it("keeps one job per hue and one hue per job across the whole ledger", () => {
    const entries = Object.values(HUE_LEDGER);
    const jobs = new Set(entries.map((e) => e.job));
    const hexes = new Set(entries.map((e) => e.hex));
    expect(jobs.size).toBe(entries.length);
    expect(hexes.size).toBe(entries.length); // value-collision scan's premise
  });
});

describe("G7 style block — literals retired, projections consumed", () => {
  const css = styleBlock(PANEL);

  it("no longer spells the ratified violet or the retired plate grey", () => {
    // Falsifiable: before this lane both were live; the comments MENTION them,
      // the code must not. styleBlock() strips comments for exactly that.
    expect(css).not.toMatch(/#b49ce8/i);
    expect(css).not.toMatch(/#9aa7b8/i);
    const armed = css.replace("var(--hh-hue-rule-ink)", "#b49ce8");
    expect(armed).toMatch(/#b49ce8/i); // the scan CAN fail — probe, not vacuity
  });

  it("consumes the ledger projections for rule-ink and the plate grey", () => {
    expect(css).toContain("var(--hh-hue-rule-ink)");
    expect(css).toMatch(/--g7-hand-rule:\s*var\(--hh-hue-rule-ink\)/);
    expect(css).toMatch(/--g7-plate:\s*color-mix\(in srgb,\s*var\(--hh-surface\)\s+\d+%,\s*var\(--hh-hue-grey\)\)/);
  });

  it("keeps the player ink a spelled allowlist neutral (a neutral has no job)", () => {
    expect(css).toMatch(/--g7-hand-player:\s*#d7e3ea/);
    expect(HUE_LEDGER.white.hex).toBe(0xffffff); // #d7e3ea is NOT a ledger value
  });

  it("spares the plate a green FRAME, never a green fill wash", () => {
    expect(css).toMatch(/\.g7-plate--spare\s*\{\s*stroke:\s*var\(--hh-hue-green\)/);
    expect(css).not.toMatch(/g7-plate\)\s*80%/); // the sunk-label wash is gone
  });

  it("guards the ghost blink behind prefers-reduced-motion", () => {
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
    expect(css).toMatch(/\.g7-hand--rule\s*\{\s*animation:\s*none/);
  });
});

describe("G7 pairing audit — AA floors in all four canon eras", () => {
  it("era-tokens drift pin: the audited palette is still the shipped one", () => {
    expect(ERAS).toEqual({
      "1998": { surface: "#171d24", accent: "#f2b133" },
      "2008": { surface: "#10222e", accent: "#3b9eff" },
      "2016": { surface: "#1b1e22", accent: "#1abc9c" },
      "2026": { surface: "#0d131c", accent: "#35e0e6" },
    });
  });

  /* The plate lift is read from the LIVE source, not restated: whatever pct
   * the panel ships must keep accent text AA on the resulting plate. 88 was
   * the least lift (most grey) that cleared the 2008 blue at 4.92 — the law
   * is the floor, the number is history. */
  const platePct = /--g7-plate:\s*color-mix\(in srgb,\s*var\(--hh-surface\)\s+(\d+)%/.exec(styleBlock(PANEL))?.[1];

  it("parses the plate lift percentage from source", () => {
    expect(platePct).toBeDefined();
    expect(Number(platePct)).toBeGreaterThanOrEqual(88);
  });

  for (const [eraName, era] of Object.entries(ERAS)) {
    describe(eraName, () => {
      const surface = parseHexColor(era.surface);
      const accent = parseHexColor(era.accent);
      const wash = bodyWash(era);
      const plate = mixSrgb(surface, GREY, Number(platePct) / 100);

      it("rule-ink text holds AA at rest on wash and board (rails, tape)", () => {
        expect(contrastRatio(RULE_INK, wash)).toBeGreaterThanOrEqual(AA_MINIMUM_RATIO.text);
        expect(contrastRatio(RULE_INK, surface)).toBeGreaterThanOrEqual(AA_MINIMUM_RATIO.text);
      });

      it("the tape container dim (.92, pre-existing device) keeps rule-ink AA", () => {
        const tapeDim = /\.g7-tape\s*\{[^}]*opacity:\s*([\d.]+)/.exec(styleBlock(PANEL))?.[1];
        expect(tapeDim).toBeDefined();
        const faded = mixSrgb(RULE_INK, wash, Number(tapeDim));
        expect(contrastRatio(faded, wash)).toBeGreaterThanOrEqual(AA_MINIMUM_RATIO.text);
      });

      it("accent plate labels + green depth/frame hold their floors on the plate", () => {
        expect(contrastRatio(accent, plate)).toBeGreaterThanOrEqual(AA_MINIMUM_RATIO.text);
        // green doubles as plate-depth TEXT and the spare-frame UI element.
        expect(contrastRatio(GREEN, plate)).toBeGreaterThanOrEqual(AA_MINIMUM_RATIO.text);
      });
    });
  }

  /* steps(2, end) renders the pair {1.00, (1+trough)/2}: the 0.62 endpoint was
   * never displayed, but its midpoint 0.81 put rule-ink on the 2008 body wash
   * at 4.45 — a transient under the text floor. 0.68 renders 0.84 ≥ 4.65 in
   * every era. Falsified both ways below. */
  it("the ghost blink's rendered dip stays AA — and proves why 0.62 could not", () => {
    const trough = /@keyframes g7-ghost\s*\{\s*to\s*\{\s*opacity:\s*([\d.]+)/.exec(styleBlock(PANEL))?.[1];
    expect(trough).toBeDefined();
    const rendered = (1 + Number(trough)) / 2;
    const legacyRatios: number[] = [];
    for (const era of Object.values(ERAS)) {
      const wash = bodyWash(era);
      expect(contrastRatio(mixSrgb(RULE_INK, wash, rendered), wash)).toBeGreaterThanOrEqual(AA_MINIMUM_RATIO.text);
      legacyRatios.push(contrastRatio(mixSrgb(RULE_INK, wash, (1 + 0.62) / 2), wash));
    }
    // The retired trough dipped below the floor in at least one era — that is
    // WHY 0.68 ships. If the era palette changes and 0.62 would have passed,
    // this probe goes red and the tune is re-justified, not silently dropped.
    expect(Math.min(...legacyRatios)).toBeLessThan(AA_MINIMUM_RATIO.text);
  });
});
