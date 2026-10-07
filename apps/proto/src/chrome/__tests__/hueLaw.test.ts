// @vitest-environment jsdom
/**
 * HUE LAW pin (§4.7 "each one job", hues.ts header: the ledger is the ONLY
 * place a semantic hue may be spelled). Round-4 review found chrome SFCs
 * inventing off-ledger hexes and re-spelling ledger values inline; the fix
 * routed every chrome style through var(--hh-hue-*) generated from
 * HUE_LEDGER (chrome/hueVars.ts). This file locks the law so the drift
 * cannot return:
 *
 *  1. no raw 6-digit hex inside any chrome <style> block — with one tiny,
 *     EXPLICIT neutrals allowlist (colors that carry no semantic job);
 *  2. every var(--hh-hue-<name>) referenced in chrome styles is a real
 *     ledger entry (no invented var names either);
 *  3. the generated :root block is the ledger verbatim — byte-stable,
 *     code-unit-sorted, and installHueVars is idempotent.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { HUE_LEDGER } from "../../render/hues";
import { HUE_VARS_STYLE_ID, hueVarsCss, installHueVars } from "../hueVars";

// vitest roots at apps/proto (same resolution law as gates/g2 corpus tests;
// import.meta.url is NOT file:-sourced under the jsdom environment).
const CHROME_DIR = join(process.cwd(), "src", "chrome");

/** Hexes with NO semantic job (pure display neutrals). Grow this list only
 *  by decision — every entry must earn its row here or it belongs in the
 *  ledger. */
const NEUTRAL_ALLOWLIST: ReadonlySet<string> = new Set([
  "#d7e3ea", // chrome ink — body text on dark surface (styles/chrome.css twin)
  "#05080c", // ScopeFace CRT screen black
]);

/** Walk chrome/ sources, skipping __tests__ (this file quotes hexes itself). */
function chromeSources(dir: string): string[] {
  const found: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (name === "__tests__") continue;
    if (statSync(full).isDirectory()) found.push(...chromeSources(full));
    else if (name.endsWith(".vue")) found.push(full);
  }
  return found.sort();
}

function styleCss(source: string): string {
  return [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1] ?? "").join("\n");
}

describe("hue law — chrome styles consume the ledger, never a spelled hex", () => {
  const files = chromeSources(CHROME_DIR);

  it("scans a non-trivial chrome roster (test cannot silently vacate)", () => {
    expect(files.length).toBeGreaterThanOrEqual(14);
  });

  it("no raw 6-digit hex in any chrome <style> block outside the neutral allowlist", () => {
    const violations: string[] = [];
    for (const file of files) {
      const hexes = styleCss(readFileSync(file, "utf8")).match(/#[0-9a-fA-F]{6}(?![0-9a-fA-F])/g) ?? [];
      for (const hex of hexes) {
        if (!NEUTRAL_ALLOWLIST.has(hex.toLowerCase())) {
          violations.push(`${file.replace(CHROME_DIR, "chrome/")}: ${hex}`);
        }
      }
    }
    expect(violations).toStrictEqual([]);
  });

  it("every var(--hh-hue-*) used in chrome is a real ledger entry", () => {
    const ledgerNames = new Set(Object.keys(HUE_LEDGER));
    const unknown: string[] = [];
    for (const file of files) {
      for (const name of styleCss(readFileSync(file, "utf8")).match(/var\(--hh-hue-([a-z0-9-]+)\)/g) ?? []) {
        const hue = name.slice("--hh-hue-".length + "var(".length, -1);
        if (!ledgerNames.has(hue)) unknown.push(`${file.replace(CHROME_DIR, "chrome/")}: ${name}`);
      }
    }
    expect(unknown).toStrictEqual([]);
  });
});

describe("hueVars — the ledger's DOM projection", () => {
  it("the generated :root block carries EVERY ledger entry, hex verbatim, sorted", () => {
    const css = hueVarsCss();
    for (const [name, { hex }] of Object.entries(HUE_LEDGER)) {
      expect(css).toContain(`--hh-hue-${name}: #${hex.toString(16).padStart(6, "0")};`);
    }
    // one line per entry + :root braces, no strays
    expect(css.split("\n")).toHaveLength(Object.keys(HUE_LEDGER).length + 2);
    const names = [...css.matchAll(/--hh-hue-([a-z0-9-]+)/g)].map((m) => m[1] as string);
    expect(names).toStrictEqual([...names].sort());
  });

  it("is a stable fingerprint: two calls byte-identical", () => {
    expect(hueVarsCss()).toBe(hueVarsCss());
  });

  it("installHueVars applies once — idempotent, no duplicate style tags", () => {
    document.head.querySelectorAll(`style#${HUE_VARS_STYLE_ID}`).forEach((n) => n.remove());
    installHueVars(document);
    installHueVars(document);
    expect(document.head.querySelectorAll(`style#${HUE_VARS_STYLE_ID}`)).toHaveLength(1);
    expect(document.getElementById(HUE_VARS_STYLE_ID)?.textContent).toBe(hueVarsCss());
  });
});
