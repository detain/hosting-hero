/**
 * CONTRAST AUDIT gate (§8.14 Two-Channel enforcement, PHASE1-PLAN:165
 * harness row "greyscale-dump/Contrast Audit"). Acceptance-gate roster row
 * "greyscale-pass" — this file is what makes that row honestly `live`.
 *
 * The walk is red-on-drift: era tokens are parsed from the REAL era-tokens.css,
 * the census lives in chrome/a11y/contrastAudit.ts, and completeness scans
 * prove no `color:` in shipped chrome styling escaped the ledger of pairings.
 * Armed probes (hueLaw/filtersLaw pattern) keep every scan falsifiable.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildChromeInventory,
  CHROME_CONTRAST_SPECS,
  ContrastAuditError,
  contrastRatio,
  findAaViolations,
  formatPairFailure,
  mixSrgb,
  parseContrastPairSpec,
  parseEraTokens,
  parseHexColor,
  relativeLuminance,
  resolvePair,
  toHex,
} from "../a11y/contrastAudit";
import type { ContrastPairSpec, EraTokens, ResolvedPair } from "../a11y/contrastAudit";

// vitest roots at apps/proto (same law as hueLaw.test.ts).
const CHROME_DIR = join(process.cwd(), "src", "chrome");

/* ------------------------------------------------------------ parsed input */

function parseEras(css: string): EraTokens[] {
  const eras: EraTokens[] = [];
  for (const m of css.matchAll(/html\[data-era="([^"]+)"\]\s*\{([\s\S]*?)\}/g)) {
    const body = m[2] ?? "";
    const surface = /--hh-surface:\s*(#[0-9a-fA-F]{6})\s*;/.exec(body)?.[1];
    const accent = /--hh-accent:\s*(#[0-9a-fA-F]{6})\s*;/.exec(body)?.[1];
    if (surface === undefined || accent === undefined) {
      throw new Error(`era "${m[1]}" is missing a parseable --hh-surface/--hh-accent hex`);
    }
    eras.push({ era: m[1] ?? "", surface, accent });
  }
  return eras;
}

const REAL_ERAS: readonly EraTokens[] = Object.freeze(parseEras(readFileSync(join(CHROME_DIR, "styles", "era-tokens.css"), "utf8")));

function walkStyling(dir: string): string[] {
  const found: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (name === "__tests__" || name === "a11y") continue; // a11y holds the census, not the pairings
    if (statSync(full).isDirectory()) found.push(...walkStyling(full));
    else if (name.endsWith(".vue") || name.endsWith(".css")) found.push(full);
  }
  return found.sort();
}

function styleCssOf(file: string): string {
  const raw = readFileSync(file, "utf8");
  return file.endsWith(".vue") ? [...raw.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1] ?? "").join("\n") : raw;
}

/* ------------------------------------------------------------ the AA gate */

describe("contrast audit — the shipped chrome census meets WCAG AA", () => {
  it("era-tokens.css parses to exactly the two demo eras (drift tripwire)", () => {
    expect(REAL_ERAS.map((e) => e.era)).toEqual(["1998", "2026"]);
    for (const era of REAL_ERAS) expect(() => parseEraTokens(era)).not.toThrow();
  });

  it("the census size is pinned — additions/removals must be a decision", () => {
    expect(CHROME_CONTRAST_SPECS).toHaveLength(40);
  });

  it("EVERY pairing passes its role floor, in BOTH eras (the gate)", () => {
    const grid = buildChromeInventory(REAL_ERAS);
    expect(grid).toHaveLength(CHROME_CONTRAST_SPECS.length * REAL_ERAS.length);
    const violations = findAaViolations(grid).map(formatPairFailure);
    expect(violations).toStrictEqual([]);
  });

  it("every pairing sits comfortably above its floor (no razor-thin holds)", () => {
    for (const pair of buildChromeInventory(REAL_ERAS)) {
      if (pair.minRatio === null) continue;
      expect(pair.ratio, pair.id).toBeGreaterThanOrEqual(pair.minRatio);
    }
    // the tightest text pair is the alarm klaxon headline on the accent wash —
    // pin the actual number so a hue tweak cannot drift it under 4.5 unnoticed.
    const tightest = buildChromeInventory(REAL_ERAS)
      .filter((p) => p.role === "text")
      .reduce((a, b) => (a.ratio / (a.minRatio ?? 1) <= b.ratio / (b.minRatio ?? 1) ? a : b));
    expect(tightest.ratio).toBeGreaterThanOrEqual(4.5);
  });
});

/* ------------------------------------------------------ completeness scans */

describe("contrast audit — nothing shipped escapes the census", () => {
  it("every var(--hh-hue-*) used as TEXT in chrome styling has an audited text pair", () => {
    const hueTexts = new Set<string>();
    for (const file of walkStyling(CHROME_DIR)) {
      for (const m of styleCssOf(file).matchAll(/color:\s*var\(--hh-hue-([a-z0-9-]+)\)/g)) {
        hueTexts.add(m[1] ?? "");
      }
    }
    expect(hueTexts.size).toBeGreaterThanOrEqual(7); // anti-vacuity: real chrome text hues
    const audited = new Set(
      CHROME_CONTRAST_SPECS.filter((s) => s.role === "text" && s.fg.kind === "hue").map((s) =>
        (s.fg as { name: string }).name,
      ),
    );
    const missing = [...hueTexts].filter((h) => !audited.has(h));
    expect(missing, `hue text used in chrome but absent from the census`).toStrictEqual([]);
  });

  it("era accent AND era surface appear as audited text fg (both directions)", () => {
    const eraFgs = new Set(
      CHROME_CONTRAST_SPECS.filter((s) => s.role === "text" && s.fg.kind === "era").map((s) =>
        (s.fg as { token: string }).token,
      ),
    );
    expect([...eraFgs].sort()).toEqual(["accent", "surface"]);
  });

  it("every hueLaw allowlist neutral is covered by the census (fg or bg)", () => {
    // single-source: read the allowlist from hueLaw.test.ts itself.
    const hueLaw = readFileSync(join(CHROME_DIR, "__tests__", "hueLaw.test.ts"), "utf8");
    const block = /NEUTRAL_ALLOWLIST[^=]*=\s*new Set\(\[([\s\S]*?)\]\)/.exec(hueLaw);
    expect(block, "hueLaw allowlist block must stay parseable").not.toBeNull();
    const allowed = [...(block?.[1] ?? "").matchAll(/"(#[0-9a-fA-F]{6})"/g)].map((m) => (m[1] ?? "").toLowerCase());
    expect(allowed.length).toBeGreaterThanOrEqual(2);
    const grid: readonly ResolvedPair[] = buildChromeInventory(REAL_ERAS);
    for (const hex of allowed) {
      const covered = grid.some((p) => p.fgHex.toLowerCase() === hex || p.bgHex.toLowerCase() === hex);
      expect(covered, `hueLaw allowlist hex ${hex} appears in no audited pairing`).toBe(true);
    }
  });
});

/* ------------------------------------------------------------- known math */

describe("contrast audit — the math is WCAG, not vibes", () => {
  it("black/white = 21, identity = 1, symmetry holds", () => {
    expect(contrastRatio(parseHexColor("#000000"), parseHexColor("#ffffff"))).toBeCloseTo(21, 1);
    expect(contrastRatio(parseHexColor("#123456"), parseHexColor("#123456"))).toBe(1);
    const a = parseHexColor("#d7e3ea");
    const b = parseHexColor("#0d131c");
    expect(contrastRatio(a, b)).toBe(contrastRatio(b, a));
  });

  it("the WCAG boundary grays land on the correct sides of 4.5", () => {
    const white = parseHexColor("#ffffff");
    expect(relativeLuminance(parseHexColor("#767676"))).toBeGreaterThan(0.17);
    expect(contrastRatio(parseHexColor("#767676"), white)).toBeGreaterThanOrEqual(4.5); // AA pass twin
    expect(contrastRatio(parseHexColor("#777777"), white)).toBeLessThan(4.5); // AA fail twin
  });

  it("mixSrgb is gamma-space like color-mix(in srgb): white/black .5 = #808080", () => {
    expect(toHex(mixSrgb(parseHexColor("#ffffff"), parseHexColor("#000000"), 0.5))).toBe("#808080");
    expect(() => mixSrgb(parseHexColor("#000000"), parseHexColor("#ffffff"), 1.5)).toThrowError(/contrast\[bad-weight\]/);
  });

  it("parse rejects malformed hex loudly", () => {
    expect(() => parseHexColor("rebeccapurple")).toThrowError(ContrastAuditError);
    expect(() => parseHexColor("#12345")).toThrowError(/contrast\[bad-hex\]/);
    expect(toHex(parseHexColor("#ABC"))).toBe("#aabbcc");
  });
});

/* ------------------------------------------------------------ armed probes */

describe("contrast audit — ARMED (the scanner can actually fail)", () => {
  const planted: ContrastPairSpec = {
    id: "planted-fail",
    where: "armed probe",
    role: "text",
    fg: { kind: "hex", value: "#777777" },
    bg: { kind: "hex", value: "#ffffff" },
  };

  it("a 4.48:1 text pairing IS reported — the gate is not decorative", () => {
    const resolved = resolvePair(planted, parseEraTokens({ era: "probe", surface: "#000000", accent: "#ffffff" }));
    expect(resolved.passes).toBe(false);
    expect(resolved.ratio).toBeLessThan(4.5);
    const report = findAaViolations([resolved, ...buildChromeInventory(REAL_ERAS)]);
    expect(report.map((p) => p.id)).toStrictEqual(["planted-fail"]);
  });

  it("an unknown role / unearned exemption / duplicate id / phantom hue all throw", () => {
    const era = parseEraTokens({ era: "probe", surface: "#000000", accent: "#ffffff" });
    expect(() => parseContrastPairSpec({ ...planted, role: "vibes" as ContrastPairSpec["role"] })).toThrowError(
      /contrast\[unknown-role\]/,
    );
    expect(() =>
      parseContrastPairSpec({ id: "x", where: "w", role: "decorative", fg: planted.fg, bg: planted.bg }),
    ).toThrowError(/contrast\[unearned-exemption\]/);
    expect(() => buildChromeInventory(REAL_ERAS, [planted, planted])).toThrowError(/contrast\[duplicate-id\]/);
    expect(() =>
      resolvePair({ id: "y", where: "w", role: "text", fg: { kind: "hue", name: "hot-pink" }, bg: planted.bg }, era),
    ).toThrowError(/contrast\[unknown-hue\]/);
  });

  it("a missing era or zero eras cannot silently empty the grid", () => {
    expect(() => buildChromeInventory([])).toThrowError(/contrast\[bad-era\]/);
    expect(() => parseEraTokens({ era: " ", surface: "#000000", accent: "#ffffff" })).toThrowError(/contrast\[bad-era\]/);
  });
});
