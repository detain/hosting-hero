/**
 * ADR-0008 wrapper-law scan — substrate spike (lane-3 enforcement twin,
 * filtersLaw.ts pattern).
 *
 * This is a SPIKE: the seam exists unmounted. The laws below are what keeps
 * "law-first, nothing mounts yet" true as a machine-checked statement rather
 * than a README promise.
 *
 * Law surfaces pinned by this file:
 *  1. `@pixi/tilemap` is imported at EXACTLY one site — render/substrate/
 *     tileField.ts — and nowhere else in src/. The vendor registers three
 *     renderer extensions at import time; the sole-site law fences that
 *     blast radius (finding in tileField.ts header).
 *  2. Nothing outside render/substrate/ imports the substrate seam (the
 *     unmounted law: gates/chrome/runner/worker may not touch it until the
 *     first-mount commit lands with the owner's budget-category decision).
 *  3. No timers or ticker self-subscription inside substrate/ — compositor
 *     owns updates (wrapper law 1, ADR-0008).
 *  4. No color literals anywhere in substrate/ src — tiles address palette
 *     SLOTS; hues belong to the skin kit, never to this code (law 5 of
 *     substrateField.ts; the ADR's "no invented colors" made structural).
 *  5. render/substrate/ is closed: {index.ts, substrateField.ts, tileField.ts}.
 *  6. Mount-label coupling is REAL: compositor.ts stamps `layer:${name}` and
 *     tileField.ts asserts exactly 'layer:substrate' — if either drifts, the
 *     spike's mount law silently stops matching production labels, so both
 *     halves are pinned here.
 *  7. Armed probes: planted violations MUST be caught; comment decoys MUST
 *     be ignored (the scanner has teeth, not vibes).
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const TILEMAP_IMPORT = /\bfrom\s+["']@pixi\/tilemap["']|\bimport\s+["']@pixi\/tilemap["']/;
const SUBSTRATE_IMPORT = /\b(?:from|import)\s+["']([^"']+)["']/g;
const TIMER_OR_TICKER = /ticker\.add\b|\bsetTimeout\b|\bsetInterval\b|\brequestAnimationFrame\b/;
const COLOR_LITERAL = /#[0-9a-fA-F]{6}\b|\b0x[0-9a-fA-F]{6}\b/;

/** Strip comments so the scan judges CODE, not prose (our own docblocks name
 *  the patterns they forbid; the armed probe covers both forms). Block-comment
 *  text is blanked but its newlines are KEPT, so every file:line report stays
 *  file-accurate below multi-line comments. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ""))
    .replace(/\/\/[^\n]*/g, "");
}

function listSources(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      if (entry === "__tests__") continue; // test files quote the pattern to police it
      found.push(...listSources(path));
      continue;
    }
    if (entry.endsWith(".ts") || entry.endsWith(".vue")) found.push(path);
  }
  return found;
}

function relative(path: string): string {
  return path.slice(process.cwd().length + 1);
}

/** file:line report of code-form @pixi/tilemap imports in one source. */
function tilemapImports(path: string): string[] {
  const code = stripComments(readFileSync(path, "utf8"));
  return code
    .split("\n")
    .map((line, i) => (TILEMAP_IMPORT.test(line) ? `${relative(path)}:${i + 1}` : null))
    .filter((hit): hit is string => hit !== null);
}

/** Specifier names of any import whose path mentions `substrate`. */
function substrateSpecifiers(path: string): string[] {
  const code = stripComments(readFileSync(path, "utf8"));
  const hits: string[] = [];
  for (const match of code.matchAll(SUBSTRATE_IMPORT)) {
    const specifier = match[1] ?? "";
    if (specifier.includes("substrate")) hits.push(specifier);
  }
  return hits;
}

const SRC = join(process.cwd(), "src");
const SUBSTRATE_DIR = join(SRC, "render", "substrate");

describe("substrate import law — one vendor site, zero consumers yet (spike)", () => {
  const allSources = listSources(SRC);
  const substrateSources = listSources(SUBSTRATE_DIR).sort();
  const outsideSubstrate = allSources.filter((path) => !path.startsWith(SUBSTRATE_DIR + "/"));

  it("roster is non-vacuous (the scan really walks a substantial tree)", () => {
    // Floor, not exact: lanes add files every wave; 100 guards against a
    // silently-empty walk (the filtersLaw/hueLaw floor precedent).
    expect(allSources.length).toBeGreaterThanOrEqual(100);
    expect(substrateSources.length).toBe(3);
  });

  it("render/substrate/ is exactly {index.ts, substrateField.ts, tileField.ts}", () => {
    expect(substrateSources.map((path) => relative(path).split("/").pop())).toEqual([
      "index.ts",
      "substrateField.ts",
      "tileField.ts",
    ]);
  });

  it("zero @pixi/tilemap imports anywhere in src/ outside render/substrate/", () => {
    const violations = outsideSubstrate.flatMap(tilemapImports);
    expect(violations).toEqual([]);
  });

  it("positive control: tileField.ts carries EXACTLY one @pixi/tilemap import", () => {
    const writes = substrateSources.flatMap(tilemapImports);
    expect(writes).toHaveLength(1);
    expect(writes[0]).toMatch(/substrate\/tileField\.ts:/);
  });

  it("zero substrate imports from anywhere outside render/substrate/ (unmounted law)", () => {
    const offenders = outsideSubstrate
      .filter((path) => substrateSpecifiers(path).length > 0)
      .map((path) => `${relative(path)} → ${substrateSpecifiers(path).join(", ")}`);
    expect(offenders).toEqual([]);
  });
});

describe("substrate discipline — clocks and colors stay out (wrapper laws 1–2)", () => {
  const substrateSources = listSources(SUBSTRATE_DIR).sort();

  it("no ticker.add / setTimeout / setInterval / requestAnimationFrame in substrate/", () => {
    const offenders = substrateSources
      .filter((path) => TIMER_OR_TICKER.test(stripComments(readFileSync(path, "utf8"))))
      .map(relative);
    expect(offenders).toEqual([]);
  });

  it("no color literals in substrate/ — palette slots or nothing (law 5)", () => {
    const offenders = substrateSources
      .filter((path) => COLOR_LITERAL.test(stripComments(readFileSync(path, "utf8"))))
      .map(relative);
    expect(offenders).toEqual([]);
  });
});

describe("mount-label coupling — compositor's truth, asserted not assumed", () => {
  it("compositor.ts builds layer containers as `layer:${name}`", () => {
    const compositor = readFileSync(join(SRC, "render", "compositor.ts"), "utf8");
    expect(compositor).toMatch(/layer:\$\{name\}/);
  });

  it("tileField.ts asserts exactly that proof for the substrate stratum", () => {
    const tileField = readFileSync(join(SUBSTRATE_DIR, "tileField.ts"), "utf8");
    expect(tileField).toMatch(/SUBSTRATE_MOUNT_LABEL = "layer:substrate"/);
  });
});

describe("armed probe — the scanners bite", () => {
  const tilemapScan = (source: string): boolean =>
    stripComments(source)
      .split("\n")
      .some((line) => TILEMAP_IMPORT.test(line));

  const substrateScan = (source: string): string[] => {
    const hits: string[] = [];
    for (const match of stripComments(source).matchAll(SUBSTRATE_IMPORT)) {
      const specifier = match[1] ?? "";
      if (specifier.includes("substrate")) hits.push(specifier);
    }
    return hits;
  };

  it("planted tilemap import is caught; comment decoy is not", () => {
    expect(tilemapImportPlanted()).toBe(true);
    expect(tilemapScan('// import { CompositeTilemap } from "@pixi/tilemap" was removed')).toBe(false);
    expect(tilemapScan('/* from "@pixi/tilemap" */')).toBe(false);
    expect(tilemapScan('import type { Container } from "pixi.js";')).toBe(false);
  });

  it("planted consumer import of the seam is caught by specifier, not by prose", () => {
    expect(substrateScan('import { SubstrateLedger } from "../render/substrate/substrateField";')).toEqual([
      "../render/substrate/substrateField",
    ]);
    expect(substrateScan('import "./substrate/index";')).toEqual(["./substrate/index"]);
    // Layer-NAME strings are not imports — the LAYER_ORDER vocabulary stays legal.
    expect(substrateScan('const order = ["substrate", "flow"] as const;')).toEqual([]);
    expect(substrateScan('export { LAYER_ORDER } from "../layerSpec";')).toEqual([]);
  });

  it("planted hex/0x literal is caught; the word 'substrate' is not", () => {
    const colorScan = (source: string): boolean => COLOR_LITERAL.test(stripComments(source));
    expect(colorScan('const ink = "#0b0f16";')).toBe(true);
    expect(colorScan("const hue = 0x4fc46a;")).toBe(true);
    expect(colorScan('const label = "layer:substrate";')).toBe(false);
    expect(colorScan("// the kit's #39424d dominant is NOT restated here")).toBe(false);
  });

  function tilemapImportPlanted(): boolean {
    return tilemapScan('import { CompositeTilemap } from "@pixi/tilemap";\nmap.tile(0, 0, 0);');
  }
});
