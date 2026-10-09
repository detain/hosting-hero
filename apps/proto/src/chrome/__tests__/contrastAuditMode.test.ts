// @vitest-environment jsdom
/**
 * CONTRAST AUDIT MODE v0 (§8.14 "Contrast Audit Mode" runtime half) — the
 * test the greyscale-pass roster row's "runtime render still unbuilt" clause
 * needed before it could die, and the mechanism the greyscale-motion row
 * flips on. Four honesty groups:
 *
 *  1. the compositing math (pure functions — parse, stack, opacity, floors);
 *  2. mount behaviour: fail-plant IS marked and reported, pass-plant is not,
 *     unresolved pairings are COUNTED not hidden, the strip self-declares
 *     era + census + DOM totals;
 *  3. the toggle API (App.vue's 'a' key surface) + fail-loud guards;
 *  4. the mode obeys its own laws: MODE_STYLE_CSS survives motionAudit's
 *     guard scanner, its hue vars are real ledger entries, its hexes are
 *     the hueLaw allowlist neutral — and an armed twin proves each scan.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { HUE_LEDGER } from "../../render/hues";
import { findReducedMotionGaps, parseMotionSpec, isStrobeViolation } from "../a11y/motionAudit";
import { CHROME_CONTRAST_SPECS } from "../a11y/contrastAudit";
import {
  AUDIT_EXEMPT_ATTR,
  AUDIT_FAIL_ATTR,
  CONTRAST_AUDIT_REPORT_ID,
  CONTRAST_AUDIT_SCREEN_ID,
  CONTRAST_AUDIT_STYLE_ID,
  ContrastAuditModeError,
  auditDomPairings,
  buildReportNodes,
  compositeOver,
  isContrastAuditModeActive,
  modeStyleHueVars,
  mountContrastAuditMode,
  ownVisibleText,
  parseComputedColor,
  pairVerdict,
  readEraTokens,
  readReducedMotion,
  resolvePaintStack,
  textFloorFor,
  toggleContrastAuditMode,
  MODE_STYLE_CSS,
} from "../a11y/contrastAuditMode";
import type { ParsedColor } from "../a11y/contrastAuditMode";

const SURFACE_2026 = "#0d131c";
const ACCENT_2026 = "#35e0e6";

/** Live rgb triple as jsdom/browsers spell computed colours. */
const rgb = (r: number, g: number, b: number): string => `rgb(${r}, ${g}, ${b})`;

function setEraTokens(era = "2026"): void {
  document.documentElement.style.setProperty("--hh-surface", SURFACE_2026);
  document.documentElement.style.setProperty("--hh-accent", ACCENT_2026);
  document.documentElement.dataset["era"] = era;
}

function clearEraTokens(): void {
  document.documentElement.style.removeProperty("--hh-surface");
  document.documentElement.style.removeProperty("--hh-accent");
  delete document.documentElement.dataset["era"];
}

interface Stage {
  readonly el: HTMLElement;
  readonly dispose: () => void;
}

/** A painted container mounted into body — the audit root for most tests. */
function makeStage(bg = SURFACE_2026): Stage {
  const el = document.createElement("div");
  el.setAttribute("data-test-id", "audit-stage");
  el.style.backgroundColor = bg;
  document.body.appendChild(el);
  return { el, dispose: () => el.remove() };
}

function paint(el: HTMLElement, styles: Readonly<Record<string, string>>, text?: string): HTMLElement {
  for (const [k, v] of Object.entries(styles)) el.style.setProperty(k, v);
  if (text !== undefined) el.textContent = text;
  return el;
}

const flushMicrotasks = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

const handles: { dispose: () => void }[] = [];
const stages: Stage[] = [];

afterEach(() => {
  while (handles.length > 0) handles.pop()?.dispose();
  while (stages.length > 0) stages.pop()?.dispose();
  clearEraTokens();
  // belt and braces: the mode's own DOM must not leak across tests
  document.getElementById(CONTRAST_AUDIT_SCREEN_ID)?.remove();
  document.getElementById(CONTRAST_AUDIT_REPORT_ID)?.remove();
  document.getElementById(CONTRAST_AUDIT_STYLE_ID)?.remove();
  Reflect.deleteProperty(window, "matchMedia");
});

/* ------------------------------------------------------- 1. compositing math */

describe("contrast audit mode — computed-colour parsing", () => {
  it("parses every shape getComputedStyle actually emits", () => {
    expect(parseComputedColor(rgb(13, 19, 28))).toEqual({ r: 13, g: 19, b: 28, a: 1 });
    expect(parseComputedColor("rgba(119, 119, 119, 0.5)")).toEqual({ r: 119, g: 119, b: 119, a: 0.5 });
    expect(parseComputedColor("rgb(13 19 28 / 40%)")).toEqual({ r: 13, g: 19, b: 28, a: 0.4 });
    expect(parseComputedColor("#0d131c")).toEqual({ r: 13, g: 19, b: 28, a: 1 });
  });

  it("returns null for non-paints and shapes the walk must not guess", () => {
    expect(parseComputedColor("transparent")).toBeNull();
    expect(parseComputedColor("none")).toBeNull();
    expect(parseComputedColor("")).toBeNull();
    expect(parseComputedColor("color-mix(in srgb, #0d131c 88%, #000)")).toBeNull();
    expect(parseComputedColor("rebeccapurple")).toBeNull();
  });

  it("compositeOver matches the browser source-over blend", () => {
    const grey = parseComputedColor("rgba(128, 128, 128, 0.5)") as ParsedColor;
    expect(compositeOver(grey, { r: 0, g: 0, b: 0 })).toEqual({ r: 64, g: 64, b: 64 });
    const solid = parseComputedColor(rgb(215, 227, 234)) as ParsedColor;
    expect(compositeOver(solid, { r: 0, g: 0, b: 0 })).toEqual({ r: 215, g: 227, b: 234 });
  });

  it("resolvePaintStack composites nearest-first and stops at the opaque floor", () => {
    const wash = parseComputedColor("rgba(53, 224, 230, 0.1)") as ParsedColor; // accent 10%
    const base = parseComputedColor(rgb(13, 19, 28)) as ParsedColor;
    const stacked = resolvePaintStack([wash, base]);
    expect(stacked).not.toBeNull();
    expect(stacked!.r).toBeGreaterThan(13); // the wash brightened the base
    expect(resolvePaintStack([wash])).toBeNull(); // never reaches opaque → unresolved
    expect(resolvePaintStack([])).toBeNull();
  });

  it("WCAG floors: normal 4.5, large (≥24px / ≥18.66px bold) 3.0", () => {
    expect(textFloorFor(16, false)).toBe(4.5);
    expect(textFloorFor(24, false)).toBe(3);
    expect(textFloorFor(19, true)).toBe(3);
    expect(textFloorFor(19, false)).toBe(4.5);
  });

  it("pairVerdict folds element opacity exactly like CSS compositing does", () => {
    const ink = parseComputedColor(rgb(215, 227, 234)) as ParsedColor; // chrome ink
    const base = parseComputedColor(rgb(13, 19, 28)) as ParsedColor;
    const full = pairVerdict(ink, [base], 1, 4.5);
    expect(full?.passes).toBe(true);
    // the AlertStack .suppressed case: the same ink at .65 opacity is a FADED
    // colour against the panel — re-checked, not waved through on the raw hex.
    const faded = pairVerdict(ink, [base], 0.25, 4.5);
    expect(faded?.passes).toBe(false);
    expect(faded!.ratio).toBeLessThan(full!.ratio);
  });

  it("ownVisibleText sees only DIRECT text (a wrapper delegates to its children)", () => {
    const stage = makeStage();
    const outer = paint(document.createElement("p"), {}, "");
    outer.append("lead ");
    const inner = document.createElement("span");
    inner.textContent = "kid text";
    outer.appendChild(inner);
    stage.el.appendChild(outer);
    expect(ownVisibleText(outer)).toBe("lead");
    expect(ownVisibleText(inner)).toBe("kid text");
  });
});

/* ------------------------------------------------------- 2. the live walk */

describe("contrast audit mode — DOM pairing walk", () => {
  it("audits text pairings, skips non-text, hidden, and EXEMPT elements", () => {
    setEraTokens();
    const stage = makeStage();
    stages.push(stage);
    stage.el.appendChild(paint(document.createElement("p"), { color: rgb(215, 227, 234) }, "clean ink"));
    stage.el.appendChild(paint(document.createElement("p"), { color: rgb(102, 102, 102) }, "grey failure"));
    stage.el.appendChild(paint(document.createElement("div"), { color: rgb(102, 102, 102), display: "none" }, "hidden fail"));
    stage.el.appendChild(paint(document.createElement("p"), { color: rgb(102, 102, 102) }, ""));
    const exempt = paint(document.createElement("p"), { color: rgb(102, 102, 102) }, "exempt fail");
    exempt.setAttribute(AUDIT_EXEMPT_ATTR, "true");
    stage.el.appendChild(exempt);

    const report = auditDomPairings(stage.el);
    expect(report.audited).toHaveLength(2); // clean + grey; hidden/empty/exempt out
    expect(report.failures).toHaveLength(1);
    expect(report.failures[0]?.label).toContain("grey failure");
  });

  it("text with NO painted background above it is counted unresolved, never faked", () => {
    setEraTokens();
    const bare = document.createElement("div");
    document.body.appendChild(bare);
    try {
      bare.appendChild(paint(document.createElement("p"), { color: rgb(102, 102, 102) }, "on gradient page"));
      const report = auditDomPairings(bare);
      expect(report.audited).toHaveLength(0);
      expect(report.unresolved).toHaveLength(1);
      expect(report.unresolved[0]?.reason).toContain("census half");
    } finally {
      bare.remove();
    }
  });

  it("large text is measured against the 3.0 floor, not the 4.5 one", () => {
    setEraTokens();
    const stage = makeStage();
    stages.push(stage);
    // #6c6c6c on #0d131c ≈ 3.5:1 — sits BETWEEN the floors, so the test can
    // only go green if the large-text arm really chose 3.0.
    stage.el.appendChild(
      paint(document.createElement("h1"), { color: rgb(108, 108, 108), "font-size": "26px" }, "large heading"),
    );
    const report = auditDomPairings(stage.el);
    expect(report.audited[0]?.minRatio).toBe(3);
    expect(report.audited[0]!.ratio).toBeGreaterThan(3);
    expect(report.audited[0]!.ratio).toBeLessThan(4.5);
    expect(report.failures).toHaveLength(0);
  });
});

/* --------------------------------------------------------- 3. mount + strip */

describe("contrast audit mode — mount marks failures ON SCREEN", () => {
  it("fail-plant gets the marker attribute AND a report row; pass-plant gets neither", () => {
    setEraTokens();
    const stage = makeStage();
    stages.push(stage);
    const failing = paint(document.createElement("p"), { color: rgb(102, 102, 102) }, "grey on dark");
    const clean = paint(document.createElement("p"), { color: rgb(215, 227, 234) }, "ink on dark");
    stage.el.append(failing, clean);

    const handle = mountContrastAuditMode(stage.el);
    handles.push(handle);

    // ON-SCREEN MARK: the outline hook attribute, with the measured ratio as value
    expect(failing.getAttribute(AUDIT_FAIL_ATTR)).toMatch(/^\d+\.\d\d$/);
    expect(clean.hasAttribute(AUDIT_FAIL_ATTR)).toBe(false);

    // ON-SCREEN REPORT: strip + overlay + rows
    const strip = document.getElementById(CONTRAST_AUDIT_REPORT_ID) as HTMLElement;
    const overlay = document.getElementById(CONTRAST_AUDIT_SCREEN_ID);
    expect(overlay).not.toBeNull();
    expect(strip.getAttribute("data-test-id")).toBe("hh-audit-report");
    const rows = strip.querySelectorAll('[data-test-id="hh-audit-fail-row"]');
    expect(rows).toHaveLength(1);
    expect(rows[0]?.textContent).toContain("grey on dark");
    expect((strip.querySelector('[data-test-id="hh-audit-status"]')?.textContent ?? "")).toContain("1 failure");
    expect(strip.querySelector(".hh-audit-dirty")).not.toBeNull();

    // the census half runs LIVE off the same era tokens: 40 rows × 1 era, clean
    const report = handle.lastReport();
    expect(report.census).toHaveLength(CHROME_CONTRAST_SPECS.length);
    expect(report.censusFailures).toStrictEqual([]);
    expect(strip.querySelector('[data-test-id="hh-audit-census"]')?.textContent).toContain("AA clean");
    expect(strip.querySelector('[data-test-id="hh-audit-era"]')?.textContent).toContain("2026");
  });

  it("a pass-only stage reports AA-clean and plants NO markers", () => {
    setEraTokens();
    const stage = makeStage();
    stages.push(stage);
    stage.el.appendChild(paint(document.createElement("p"), { color: rgb(215, 227, 234) }, "ink"));
    const handle = mountContrastAuditMode(stage.el);
    handles.push(handle);
    expect(stage.el.querySelectorAll(`[${AUDIT_FAIL_ATTR}]`)).toHaveLength(0);
    const strip = document.getElementById(CONTRAST_AUDIT_REPORT_ID) as HTMLElement;
    expect(strip.querySelector('[data-test-id="hh-audit-status"]')?.textContent).toContain("cleared its floor");
    expect(strip.querySelectorAll('[data-test-id="hh-audit-fail-row"]')).toHaveLength(0);
    expect(handle.lastReport().dom.audited.length).toBeGreaterThan(0); // anti-vacuity
  });

  it("the audit UI never audits or marks itself (exempt subtree)", () => {
    setEraTokens();
    const stage = makeStage();
    stages.push(stage);
    stage.el.appendChild(paint(document.createElement("p"), { color: rgb(102, 102, 102) }, "bad"));
    const handle = mountContrastAuditMode(stage.el);
    handles.push(handle);
    void handle;
    const strip = document.getElementById(CONTRAST_AUDIT_REPORT_ID) as HTMLElement;
    expect(strip.querySelectorAll(`[${AUDIT_FAIL_ATTR}]`)).toHaveLength(0);
    expect(strip.getAttribute(AUDIT_EXEMPT_ATTR)).toBe("true");
  });

  it("live re-audit: planted AFTER mount, marked on the next microtask; fixed, unmarked", () => {
    setEraTokens();
    const stage = makeStage();
    stages.push(stage);
    const handle = mountContrastAuditMode(stage.el);
    handles.push(handle);

    const late = paint(document.createElement("p"), { color: rgb(102, 102, 102) }, "late failure");
    stage.el.appendChild(late); // childList mutation → observer → queueMicrotask repaint
    return flushMicrotasks().then(() => {
      expect(late.hasAttribute(AUDIT_FAIL_ATTR)).toBe(true);
      late.style.color = rgb(215, 227, 234); // style mutation → re-audit
      return flushMicrotasks();
    }).then(() => {
      expect(late.hasAttribute(AUDIT_FAIL_ATTR)).toBe(false);
      expect(handle.lastReport().dom.failures).toHaveLength(0);
    });
  });

  it("dispose clears markers and every piece of mode DOM", () => {
    setEraTokens();
    const stage = makeStage();
    stages.push(stage);
    const failing = paint(document.createElement("p"), { color: rgb(102, 102, 102) }, "grey");
    stage.el.appendChild(failing);
    const handle = mountContrastAuditMode(stage.el);
    expect(failing.hasAttribute(AUDIT_FAIL_ATTR)).toBe(true);
    handle.dispose();
    handle.dispose(); // idempotent
    expect(failing.hasAttribute(AUDIT_FAIL_ATTR)).toBe(false);
    expect(document.getElementById(CONTRAST_AUDIT_SCREEN_ID)).toBeNull();
    expect(document.getElementById(CONTRAST_AUDIT_REPORT_ID)).toBeNull();
    expect(document.getElementById(CONTRAST_AUDIT_STYLE_ID)).toBeNull();
  });
});

/* ------------------------------------------------------------ 4. toggle API */

describe("contrast audit mode — the shell toggle surface", () => {
  it("toggle ON then OFF round-trips the body-rooted singleton", () => {
    setEraTokens();
    expect(isContrastAuditModeActive()).toBe(false);
    expect(toggleContrastAuditMode()).toBe(true);
    expect(isContrastAuditModeActive()).toBe(true);
    expect(document.getElementById(CONTRAST_AUDIT_SCREEN_ID)).not.toBeNull();
    expect(toggleContrastAuditMode()).toBe(false);
    expect(isContrastAuditModeActive()).toBe(false);
    expect(document.getElementById(CONTRAST_AUDIT_SCREEN_ID)).toBeNull();
  });

  it("a second mount on the same root fails loud", () => {
    setEraTokens();
    const stage = makeStage();
    stages.push(stage);
    const handle = mountContrastAuditMode(stage.el);
    handles.push(handle);
    expect(() => mountContrastAuditMode(stage.el)).toThrowError(ContrastAuditModeError);
    expect(() => mountContrastAuditMode(stage.el)).toThrowError(/contrast-mode\[already-mounted\]/);
  });

  it("era tokens missing → contrast-mode[era-tokens] BEFORE any DOM is touched", () => {
    clearEraTokens();
    expect(() => mountContrastAuditMode(document.body)).toThrowError(/contrast-mode\[era-tokens\]/);
    expect(document.getElementById(CONTRAST_AUDIT_SCREEN_ID)).toBeNull();
    expect(document.getElementById(CONTRAST_AUDIT_STYLE_ID)).toBeNull();
    expect(() => readEraTokens(document)).toThrowError(ContrastAuditModeError);
  });

  it("refresh() after dispose fails loud (no zombie audits)", () => {
    setEraTokens();
    const stage = makeStage();
    stages.push(stage);
    const handle = mountContrastAuditMode(stage.el);
    handle.dispose();
    expect(() => handle.refresh()).toThrowError(/contrast-mode\[disposed\]/);
  });

  it("App.vue carries the 'a' key on the same one-key law as chroma/readout", () => {
    const app = readFileSync(join(process.cwd(), "src", "App.vue"), "utf8");
    expect(app).toContain('event.key === "a"');
    expect(app).toContain("toggleContrastAuditMode");
  });
});

/* ----------------------------------------------- 5. reduced-motion + laws */

describe("contrast audit mode — reduced motion and self-obeyed laws", () => {
  it("prefers-reduced-motion is READ and SHOWN (true stub / false stub / both labels)", () => {
    setEraTokens();
    const stage = makeStage();
    stages.push(stage);
    stage.el.appendChild(paint(document.createElement("p"), { color: rgb(215, 227, 234) }, "ink"));

    (window as unknown as Record<string, unknown>)["matchMedia"] = (query: string) => ({
      matches: query.includes("reduce"),
    });
    const reduced = mountContrastAuditMode(stage.el);
    handles.push(reduced);
    expect(reduced.lastReport().reducedMotion).toBe(true);
    const strip = document.getElementById(CONTRAST_AUDIT_REPORT_ID) as HTMLElement;
    expect(strip.querySelector('[data-test-id="hh-audit-era"]')?.textContent).toContain("static arm active");
    reduced.dispose();
    handles.pop();
    (window as unknown as Record<string, unknown>)["matchMedia"] = () => ({ matches: false }); // user without the OS preference

    const normal = mountContrastAuditMode(stage.el);
    handles.push(normal);
    expect(normal.lastReport().reducedMotion).toBe(false);
    expect(document.getElementById(CONTRAST_AUDIT_REPORT_ID)?.textContent).toContain("breathe arm active");
    Reflect.deleteProperty(window, "matchMedia");
  });

  it("readReducedMotion: null when the engine cannot answer (no view / no matchMedia)", () => {
    expect(readReducedMotion({ defaultView: null } as unknown as Document)).toBeNull();
    expect(readReducedMotion({ defaultView: {} } as unknown as Document)).toBeNull();
  });

  it("MODE_STYLE_CSS passes the very guard scanner it enforces on chrome", () => {
    const gaps = findReducedMotionGaps("chrome/a11y/contrastAuditMode.ts (injected sheet)", MODE_STYLE_CSS);
    expect(gaps).toStrictEqual([]);
  });

  it("ARMED — the same scanner catches an unguarded breathe (guard is not decoration)", () => {
    const planted = MODE_STYLE_CSS.replace("@media (prefers-reduced-motion: reduce) { [data-hh-audit-fail] { animation: none; } }", "");
    const gaps = findReducedMotionGaps("armed", planted);
    expect(gaps.map((g) => g.selector)).toStrictEqual([`[${AUDIT_FAIL_ATTR}]`]);
  });

  it("the breathe obeys the §8.14 strobe conjunction even at full-screen coverage", () => {
    const breathe = parseMotionSpec({
      id: "audit-breathe",
      where: "MODE_STYLE_CSS [data-hh-audit-fail]",
      kind: "loop",
      periodMs: 2000,
      crossingsPerCycle: 2,
      coverage: 1, // worst case: every text node on screen marked
      reducedMotionFallback: "@media arm sets animation:none",
    });
    expect(isStrobeViolation(breathe)).toBe(false); // 1 Hz ≤ 3 Hz — rate alone saves it
  });

  it("every hue var the sheet consumes is a real ledger job; one allowlist hex only", () => {
    const ledger = new Set(Object.keys(HUE_LEDGER));
    const used = modeStyleHueVars();
    expect(used.length).toBeGreaterThanOrEqual(4);
    expect(used.filter((n) => !ledger.has(n))).toStrictEqual([]);
    const hexes = MODE_STYLE_CSS.match(/#[0-9a-fA-F]{6}(?![0-9a-fA-F])/g) ?? [];
    expect([...new Set(hexes.map((h) => h.toLowerCase()))].sort()).toStrictEqual(["#d7e3ea"]);
  });

  it("buildReportNodes: the zero-text case calls itself out instead of passing silently", () => {
    setEraTokens();
    const era = readEraTokens(document);
    const nodes = buildReportNodes(document, {
      era,
      reducedMotion: null,
      census: [],
      censusFailures: [],
      dom: { audited: [], failures: [], unresolved: [] },
    });
    const all = nodes.map((n) => n.textContent ?? "").join("|");
    expect(all).toContain("nothing was actually checked");
  });
});
