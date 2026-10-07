/**
 * Hue CSS vars — the ledger's DOM projection (round-4 hue-law fix).
 *
 * `render/hues.ts` is the ONLY place a semantic hue may be spelled; DOM
 * chrome consumed that law by RE-SPELLING hexes inline, which is exactly the
 * drift the ledger exists to prevent. This module renders every ledger entry
 * as a `--hh-hue-<name>` custom property so every chrome style reads
 * `var(--hh-hue-*)` — generated from the single source, never hand-maintained.
 *
 * Applied ONCE from main.ts before the app mounts. The pin test
 * (__tests__/hueLaw.test.ts) fails if any chrome style hard-codes a 6-digit
 * hex outside the tiny neutral allowlist, or references a var the ledger does
 * not define — "a violation is a compile error, not a QA find".
 */
import { HUE_LEDGER, type LedgerHue } from "../render/hues";
import { compareCodeUnits } from "./textLaw";

export const HUE_VARS_STYLE_ID = "hh-hue-vars";

/** 0xRRGGBB → "#rrggbb" (deterministic lowercase, locale-free). */
export function ledgerHexToCss(hex: number): string {
  return `#${hex.toString(16).padStart(6, "0")}`;
}

/** The generated :root block — keys sorted by code unit so the text is a
 *  stable fingerprint of the ledger (two calls ⇒ byte-identical). */
export function hueVarsCss(): string {
  const names = (Object.keys(HUE_LEDGER) as LedgerHue[]).sort(compareCodeUnits);
  const lines = names.map((name) => `  --hh-hue-${name}: ${ledgerHexToCss(HUE_LEDGER[name].hex)};`);
  return `:root {\n${lines.join("\n")}\n}`;
}

/** Idempotent single-point install: injects (or refreshes in place is NOT
 *  done — one ledger per page load) the vars into the document head. */
export function installHueVars(doc: Document): void {
  if (doc.getElementById(HUE_VARS_STYLE_ID) !== null) return;
  const style = doc.createElement("style");
  style.id = HUE_VARS_STYLE_ID;
  style.textContent = hueVarsCss();
  doc.head.appendChild(style);
}
