/**
 * HUE LAW pin — app shell + gate styles (round-4 residue sweep).
 *
 * The chrome twin (chrome/__tests__/hueLaw.test.ts) forbids EVERY raw hex in
 * chrome/. This file extends the law to everything outside chrome/ with the
 * narrower, judgment-aware rule agreed in the round-4 review:
 *
 *  1. a hex whose VALUE equals a HUE_LEDGER entry is a re-spelled semantic and
 *     must not appear inline in any non-chrome <style> block — with one
 *     exception class: BUNDLE-SKIN DATA. Per the Five-Asset law a gate may
 *     carry the palette shipped inside a content bundle (g5's shared-web
 *     chord); such files opt in via a `hue-law:bundle-data` marker comment and
 *     a keyed entry in DATA_ALLOWLIST below (stale or marker-less allowances
 *     fail). Data chords that never collide with a ledger value (g1/g2/g3/g4
 *     gate-local inks, relation-glyph hues) need no allowance — they are not
 *     doing ledger jobs; the collision test is what keeps them honest.
 *  2. every var(--hh-hue-<name>) used outside chrome/ must name a real ledger
 *     entry — invented vars fail the build exactly like invented hexes.
 *  3. planted-violation self-checks keep the scanner red-on-drift.
 *
 * Vitest roots at apps/proto; process.cwd() law as in the chrome twin.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path"; // ambient stub (gates/g2/__tests__/node-fs.d.ts) ships join only
import { describe, expect, it } from "vitest";
import { HUE_LEDGER } from "../../render/hues";

const SRC_DIR = join(process.cwd(), "src");
const CHROME_DIR = join(SRC_DIR, "chrome"); // owned by the chrome law twin

/** lowercased "#rrggbb" → ledger hue name, derived from the single source. */
const LEDGER_HEXES: ReadonlyMap<string, string> = new Map(
  Object.entries(HUE_LEDGER).map(([name, entry]) => [
    `#${(entry.hex as number).toString(16).padStart(6, "0")}`,
    name,
  ]),
);

/** Marker a file must carry for any DATA_ALLOWLIST row to bind. */
const BUNDLE_MARKER = "hue-law:bundle-data";

/** Bundle-skin allowances keyed by src-relative path (POSIX separators).
 *  g5 only: the shared-web bundle's skin chord ships with the content slice;
 *  --g5-sodium coincides with ledger amber but is bundle DATA, not a job.
 *  g6's --g6-* skin is dynamic (:style from profile.palette — never a literal
 *  in <style>); its four static state-channel hexes were converted to vars
 *  (alarm/amber), so g6 needs no row. New rows require the marker AND the
 *  value actually present (checked in "allowlist hygiene"). */
const DATA_ALLOWLIST: Readonly<Record<string, readonly string[]>> = {
  "gates/g5/Gate5QuarterView.vue": ["#f2b133"],
};

/** Walk the vue tree under src, skipping __tests__ (this file quotes hexes
 *  itself) and chrome/ (owned by chrome/__tests__/hueLaw.test.ts — no double
 *  jurisdiction). */
function nonChromeSources(dir: string): string[] {
  const found: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (name === "__tests__") continue;
    if (statSync(full).isDirectory()) {
      if (full === CHROME_DIR) continue;
      found.push(...nonChromeSources(full));
    } else if (name.endsWith(".vue")) found.push(full);
  }
  return found.sort();
}

function styleCss(source: string): string {
  return [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
    .map((m) => m[1] ?? "")
    .join("\n");
}

/** Comments may QUOTE hexes lawfully (decision notes name the old values);
 *  only live declarations are scanned. */
function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Core scan: ledger-valued hexes present in `css` minus `allowed`. */
function scanLedgerHexes(css: string, allowed: ReadonlySet<string> = new Set()): string[] {
  const hits: string[] = [];
  for (const m of stripCssComments(css).matchAll(/#[0-9a-fA-F]{6}\b/g)) {
    const hex = (m[0] ?? "").toLowerCase();
    if (LEDGER_HEXES.has(hex) && !allowed.has(hex)) hits.push(hex);
  }
  return hits;
}

function allowedHexesFor(relPath: string): ReadonlySet<string> {
  return new Set(DATA_ALLOWLIST[relPath] ?? []);
}

function hueVarNames(css: string): string[] {
  return [...stripCssComments(css).matchAll(/var\(--hh-hue-([a-z0-9-]+)[,)]/g)].map(
    (m) => m[1] ?? "",
  );
}

describe("hue law — non-chrome styles never re-spell a ledger hue inline", () => {
  const files = nonChromeSources(SRC_DIR);

  it("scans a non-trivial roster (test cannot silently vacate)", () => {
    // App.vue + 6 gate roots + g5's 8 children + g6 side = 16 today; the
    // floor guards against a broken walk, not against refactors.
    expect(files.length).toBeGreaterThanOrEqual(16);
  });

  it("no ledger-valued hex inline in any non-chrome <style> block", () => {
    const violations: string[] = [];
    for (const file of files) {
      const rel = file.slice(SRC_DIR.length + 1);
      const css = styleCss(readFileSync(file, "utf8"));
      for (const hex of scanLedgerHexes(css, allowedHexesFor(rel))) {
        violations.push(`${rel}: ${hex} (ledger "${LEDGER_HEXES.get(hex)}") — use var(--hh-hue-${LEDGER_HEXES.get(hex)})`);
      }
    }
    expect(violations).toEqual([]);
  });

  it("every --hh-hue-* var used outside chrome/ names a real ledger entry", () => {
    const invented: string[] = [];
    for (const file of files) {
      const rel = file.slice(SRC_DIR.length + 1);
      for (const name of hueVarNames(styleCss(readFileSync(file, "utf8")))) {
        if (!(name in HUE_LEDGER)) invented.push(`${rel}: --hh-hue-${name}`);
      }
    }
    expect(invented).toEqual([]);
  });

  it("allowlist hygiene — each row needs its marker AND its hex present; no stale rows", () => {
    for (const [rel, hexes] of Object.entries(DATA_ALLOWLIST)) {
      const file = join(SRC_DIR, rel);
      const source = readFileSync(file, "utf8");
      expect(source, `${rel} must carry the ${BUNDLE_MARKER} marker to hold allowances`).toContain(
        BUNDLE_MARKER,
      );
      const live = new Set(scanLedgerHexes(styleCss(source)).map((h) => h));
      for (const hex of hexes) {
        expect(live.has(hex), `${rel}: allowance ${hex} is stale (hex not inline anymore)`).toBe(
          true,
        );
      }
    }
  });
});

describe("hue law gates — planted violations prove the scanner is red-on-drift", () => {
  it("flags alarm and red re-spelled inline in a hypothetical gate", () => {
    const planted = styleCss(
      `<style scoped>.g9-x { color: #ef6a5a; border: 1px solid #E23B3B; }</style>`,
    );
    const hits = scanLedgerHexes(planted).sort();
    expect(hits).toEqual(["#e23b3b", "#ef6a5a"]); // case-normalized
  });

  it("accepts the var() route and gate-local non-ledger data hexes", () => {
    const clean = styleCss(
      `<style scoped>.g9-y { --g9-ink: #e8ecf1; color: var(--hh-hue-alarm); border-color: var(--g9-ink); }</style>`,
    );
    expect(scanLedgerHexes(clean)).toEqual([]);
    expect(hueVarNames(clean)).toEqual(["alarm"]);
  });

  it("g5's bundle-skin sodium rides the allowance only where the marker binds it", () => {
    const sodium = "#f2b133";
    expect(LEDGER_HEXES.get(sodium)).toBe("amber");
    // Unallowlisted, the very same hex is a violation:
    expect(scanLedgerHexes(`.z { color: ${sodium}; }`)).toEqual([sodium]);
    // Allowlisted (as the real g5 file is), it passes:
    expect(scanLedgerHexes(`.z { color: ${sodium}; }`, allowedHexesFor("gates/g5/Gate5QuarterView.vue"))).toEqual([]);
    // And a DIFFERENT file never inherits the allowance:
    expect(scanLedgerHexes(`.z { color: ${sodium}; }`, allowedHexesFor("gates/g9/Other.vue"))).toEqual([sodium]);
  });
});
