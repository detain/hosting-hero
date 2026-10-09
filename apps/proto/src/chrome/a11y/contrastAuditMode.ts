/**
 * Contrast Audit Mode v0 (§8.14 "Contrast Audit Mode", spec heading marked
 * ❌ until this file: "A mode that renders the screen as luminance only, to
 * verify everything is distinguishable without colour. Ship it as an
 * accessibility option too, because some players will prefer it.")
 *
 * contrastAudit.ts is the CI half — the shipped census + WCAG math, no DOM.
 * This module is the RUNTIME half the greyscale-pass roster row named as
 * unbuilt, and the colour-muted view the greyscale-motion row needs:
 *
 *  1. LUMINANCE-ONLY RENDER — a full-screen `backdrop-filter: grayscale(1)`
 *     overlay. Deliberately NOT a `filter` on an ancestor: a filtered
 *     ancestor becomes the containing block for every position:fixed
 *     descendant (TopBar, Drawer, bezels) and would tear the HUD layout
 *     apart. The overlay mutes what is BEHIND it and touches nothing.
 *  2. LIVE RE-CHECK — every element that paints its own text is paired with
 *     its effective background: the ancestor paint stack alpha-composited,
 *     the element's own colour alpha and the inherited CSS opacity folded
 *     in (the same sRGB compositing model contrastAudit's `mix` refs use).
 *     A pairing below its WCAG floor gets a marker attribute + a report row.
 *  3. CENSUS IN REAL TIME — the same 40-row CHROME_CONTRAST_SPECS census
 *     re-resolves against the era tokens the live document carries, so an
 *     era flip under audit re-runs the whole grid without a rebuild.
 *  4. THE MODE OBEYS THE LAW IT AUDITS — the failure-marker breathe has a
 *     `prefers-reduced-motion: reduce` arm IN THE SAME injected sheet,
 *     verified by motionAudit's own scanner (contrastAuditMode.test.ts),
 *     and the breathe is 2 crossings / 2s = 1 Hz — under the §8.14 strobe
 *     limit for any coverage (the conjunction needs BOTH >3 Hz AND >25%).
 *
 * Honest v0 limits (the strip prints the counts, it does not hide them):
 *  - text painted over gradient/canvas backgrounds is `unresolved` —
 *    background-image is not parsed; those exact pairings are the census
 *    half's job (body-wash, panel blends — all 40 rows);
 *  - only text-bearing elements are walked; border/glyph `ui` pairings ride
 *    the census's 3:1 rows, not this walk;
 *  - an era flip re-audits when the re-render mutates the DOM (the observer
 *    sees the copy swap); a pure CSS-var flip with zero DOM churn waits for
 *    the next refresh().
 *
 * Errors throw `contrast-mode[CODE]: detail`. No timers, no fetch, no
 * localStorage; mutation re-audits coalesce through one queueMicrotask.
 */
import {
  buildChromeInventory,
  contrastRatio,
  findAaViolations,
  mixSrgb,
  parseEraTokens,
  parseHexColor,
  toHex,
} from "./contrastAudit";
import type { EraTokens, ResolvedPair, Rgb } from "./contrastAudit";

/* ------------------------------------------------------------------ errors */

export class ContrastAuditModeError extends Error {
  constructor(code: string, detail: string) {
    super(`contrast-mode[${code}]: ${detail}`);
    this.name = "ContrastAuditModeError";
  }
}

/* ------------------------------------------------- computed-colour parsing */

/** A parsed sRGB paint with alpha in [0,1] — the boundary shape the walk trusts. */
export interface ParsedColor {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
}

const RGB_CLASSIC = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)(?:[\s,/]+([\d.]+%?))?\s*\)$/;
const RGB_SLASH = /^rgba?\(\s*(\d+)\s+(\d+)\s+(\d+)\s*\/\s*([\d.]+%?)\s*\)$/;

function parseAlphaComponent(raw: string | undefined): number {
  if (raw === undefined || raw === "") return 1;
  return raw.endsWith("%") ? Number.parseFloat(raw) / 100 : Number.parseFloat(raw);
}

/**
 * Parse a computed-style colour. Returns null for NON-PAINTS (empty,
 * `transparent`, `none`) and for shapes this v0 walk cannot model (named
 * colours, `color-mix()`, oklab — those pairings defer to the census half,
 * never to a guessed number).
 */
export function parseComputedColor(input: string): ParsedColor | null {
  const value = input.trim().toLowerCase();
  if (value === "" || value === "none" || value === "transparent") return null;
  const match = RGB_SLASH.exec(value) ?? RGB_CLASSIC.exec(value);
  if (match !== null) {
    return Object.freeze({
      r: Number(match[1]),
      g: Number(match[2]),
      b: Number(match[3]),
      a: parseAlphaComponent(match[4]),
    });
  }
  if (value.startsWith("#")) {
    try {
      return Object.freeze({ ...parseHexColor(value), a: 1 });
    } catch {
      return null; // a shape the census parser also rejects is nobody's paint here
    }
  }
  return null;
}

/** Alpha-composite `fg` over an opaque `bg` (source-over, sRGB channels). */
export function compositeOver(fg: ParsedColor, bg: Rgb): Rgb {
  if (fg.a >= 1) return Object.freeze({ r: fg.r, g: fg.g, b: fg.b });
  return mixSrgb(Object.freeze({ r: fg.r, g: fg.g, b: fg.b }), bg, fg.a);
}

/* --------------------------------------------------------------- the walk */

/** WCAG AA floors: normal text 4.5, large text (≥24px, or ≥18.66px bold) 3.0. */
export const TEXT_FLOOR_RATIO = 4.5;
export const LARGE_TEXT_FLOOR_RATIO = 3.0;

export function textFloorFor(fontSizePx: number, bold: boolean): number {
  if (fontSizePx >= 24 || (fontSizePx >= 18.66 && bold)) return LARGE_TEXT_FLOOR_RATIO;
  return TEXT_FLOOR_RATIO;
}

/** Direct (non-descendant) trimmed text — what the element's own `color` paints. */
export function ownVisibleText(el: Element): string {
  let text = "";
  for (const child of Array.from(el.childNodes)) {
    if (child.nodeType === 3) text += child.textContent ?? "";
  }
  return text.trim();
}

/** The element's own background plus the ancestor paint stack, nearest-first,
 *  up to (and including) the audit root; truncated after the first fully
 *  opaque layer — nothing below it can reach the eye. */
function paintStack(el: Element, root: Element): ParsedColor[] {
  const stack: ParsedColor[] = [];
  for (let node: Element | null = el; node !== null; node = node.parentElement) {
    const parsed = parseComputedColor(getComputedStyle(node).backgroundColor);
    if (parsed !== null && parsed.a > 0) {
      stack.push(parsed);
      if (parsed.a >= 1) return stack;
    }
    if (node === root) return stack;
  }
  return stack;
}

/** Product of the element's own and ancestors' opacity up to the audit root. */
function inheritedOpacity(el: Element, root: Element): number {
  let product = 1;
  for (let node: Element | null = el; node !== null; node = node.parentElement) {
    const raw = Number.parseFloat(getComputedStyle(node).opacity);
    if (Number.isFinite(raw)) product *= Math.min(Math.max(raw, 0), 1);
    if (node === root) return product;
  }
  return product;
}

function isHidden(el: Element): boolean {
  const style = getComputedStyle(el);
  return style.display === "none" || style.visibility === "hidden";
}

function labelFor(el: Element, text: string): string {
  const snippet = text.length > 32 ? `${text.slice(0, 31)}…` : text;
  return `${el.tagName.toLowerCase()}-text "${snippet}"`;
}

/** Collapse the nearest-first paint stack to one opaque colour, or null when
 *  the stack never reaches an opaque layer (the page below is unknown). */
export function resolvePaintStack(stack: readonly ParsedColor[]): Rgb | null {
  const opaqueIndex = stack.findIndex((layer) => layer.a >= 1);
  if (opaqueIndex === -1) return null;
  let base: Rgb = compositeOver(stack[opaqueIndex] as ParsedColor, { r: 0, g: 0, b: 0 });
  for (let i = opaqueIndex - 1; i >= 0; i -= 1) {
    base = compositeOver(stack[i] as ParsedColor, base);
  }
  return base;
}

export interface PairVerdict {
  readonly fgHex: string;
  readonly bgHex: string;
  readonly ratio: number;
  readonly minRatio: number;
  readonly passes: boolean;
}

/** One text-pairing verdict from trusted parsed paints — pure math, no DOM:
 *  fg (own alpha) composited over the resolved stack, then faded toward that
 *  same base by the inherited opacity (CSS opacity's rendering model). */
export function pairVerdict(fg: ParsedColor, stack: readonly ParsedColor[], opacity: number, floorRatio: number): PairVerdict | null {
  const base = resolvePaintStack(stack);
  if (base === null) return null;
  const faded = mixSrgb(compositeOver(fg, base), base, opacity);
  const ratio = Math.round(contrastRatio(faded, base) * 100) / 100;
  return Object.freeze({
    fgHex: toHex(faded),
    bgHex: toHex(base),
    ratio,
    minRatio: floorRatio,
    passes: ratio >= floorRatio,
  });
}

export interface DomPairing {
  readonly element: Element;
  readonly label: string;
  readonly fgHex: string;
  readonly bgHex: string;
  readonly ratio: number;
  readonly minRatio: number;
  readonly passes: boolean;
}

export interface UnresolvedPairing {
  readonly label: string;
  readonly reason: string;
}

export interface DomAuditReport {
  readonly audited: readonly DomPairing[];
  readonly failures: readonly DomPairing[];
  readonly unresolved: readonly UnresolvedPairing[];
}

/**
 * Walk `root` and pair every self-painted text element with its effective
 * background. Read-only apart from dropping STALE markers of a previous pass;
 * new markers are applied by {@link applyDomMarkers}, so the math stays
 * testable without DOM side effects.
 */
export function auditDomPairings(root: Element): DomAuditReport {
  const audited: DomPairing[] = [];
  const unresolved: UnresolvedPairing[] = [];
  for (const el of Array.from(root.querySelectorAll(`[${AUDIT_FAIL_ATTR}]`))) {
    el.removeAttribute(AUDIT_FAIL_ATTR); // stale markers die with their audit pass
  }
  for (const el of Array.from(root.querySelectorAll("*"))) {
    if (el.closest(`[${AUDIT_EXEMPT_ATTR}]`) !== null) continue;
    const text = ownVisibleText(el);
    if (text === "") continue;
    if (isHidden(el)) continue;
    const fg = parseComputedColor(getComputedStyle(el).color);
    if (fg === null) continue;
    const label = labelFor(el, text);
    const stack = paintStack(el, root);
    if (stack.length === 0) {
      unresolved.push(Object.freeze({ label, reason: "no painted background under this text (gradient/canvas page) — census half covers it" }));
      continue;
    }
    const style = getComputedStyle(el);
    const floor = textFloorFor(Number.parseFloat(style.fontSize) || 16, /^(bold|[6-9]00)$/.test(style.fontWeight));
    const verdict = pairVerdict(fg, stack, inheritedOpacity(el, root), floor);
    if (verdict === null) {
      unresolved.push(Object.freeze({ label, reason: "translucent paint stack never reaches an opaque layer" }));
      continue;
    }
    audited.push(
      Object.freeze({
        element: el,
        label,
        fgHex: verdict.fgHex,
        bgHex: verdict.bgHex,
        ratio: verdict.ratio,
        minRatio: verdict.minRatio,
        passes: verdict.passes,
      }),
    );
  }
  const failures = audited.filter((p) => !p.passes);
  return Object.freeze({
    audited: Object.freeze(audited),
    failures: Object.freeze(failures),
    unresolved: Object.freeze(unresolved),
  });
}

/** Paint the failure markers the runtime mode is known for (the ONLY DOM writer). */
export function applyDomMarkers(report: DomAuditReport): void {
  for (const pairing of report.failures) {
    pairing.element.setAttribute(AUDIT_FAIL_ATTR, pairing.ratio.toFixed(2));
  }
}

/* --------------------------------------------------------------- era tokens */

/** Read --hh-surface / --hh-accent from the live document (computed style,
 *  inline-style fallback for engines without a custom-property cascade, e.g.
 *  jsdom), plus the era label App.vue stamps on <html data-era>. */
export function readEraTokens(doc: Document): EraTokens {
  const html = doc.documentElement;
  const computed = doc.defaultView?.getComputedStyle(html);
  const token = (name: string): string => {
    const live = (computed?.getPropertyValue(name) ?? "").trim();
    if (live !== "") return live;
    return html.style.getPropertyValue(name).trim();
  };
  const surface = token("--hh-surface");
  const accent = token("--hh-accent");
  if (surface === "" || accent === "") {
    throw new ContrastAuditModeError(
      "era-tokens",
      "--hh-surface/--hh-accent unreadable on <html> — install era-tokens.css (or set the tokens) before auditing",
    );
  }
  const era = html.dataset["era"] ?? "unset";
  try {
    return parseEraTokens({ era, surface, accent });
  } catch (error) {
    throw new ContrastAuditModeError("era-tokens", `${(error as Error).message} (era "${era}")`);
  }
}

/** OS reduced-motion preference: true/false when the engine answers, null when not. */
export function readReducedMotion(doc: Document): boolean | null {
  const view = doc.defaultView;
  if (view === null || typeof view.matchMedia !== "function") return null;
  return view.matchMedia("(prefers-reduced-motion: reduce)").matches === true;
}

/* ------------------------------------------------------------ injected CSS */

export const CONTRAST_AUDIT_STYLE_ID = "hh-contrast-audit-style";
export const CONTRAST_AUDIT_SCREEN_ID = "hh-contrast-audit-screen";
export const CONTRAST_AUDIT_REPORT_ID = "hh-contrast-audit-report";
export const AUDIT_FAIL_ATTR = "data-hh-audit-fail";
export const AUDIT_EXEMPT_ATTR = "data-hh-audit-exempt";

/**
 * The mode's whole stylesheet. Colour discipline (hueLaw twin, pinned by
 * test): the only raw 6-digit hex is the allowlist neutral #d7e3ea — the
 * strip backdrop is the CRT-black twin spelled as rgba() so the sheet
 * carries exactly one hex token; every semantic stroke is a
 * var(--hh-hue-*) ledger projection. The breathe + reduce arm is the
 * motionAudit guard law applied to ourselves.
 */
export const MODE_STYLE_CSS = [
  `#${CONTRAST_AUDIT_SCREEN_ID} { position: fixed; inset: 0; z-index: 2147483000; pointer-events: none; backdrop-filter: grayscale(1); }`,
  `#${CONTRAST_AUDIT_REPORT_ID} { position: fixed; left: 12px; bottom: 12px; z-index: 2147483001; max-width: 520px; padding: 10px 12px; font: 12px/1.5 var(--hh-typeface, monospace); color: #d7e3ea; background: rgba(5, 8, 12, 0.94); border: 1px solid var(--hh-hue-white); }`,
  `#${CONTRAST_AUDIT_REPORT_ID} h3 { margin: 0 0 4px; font-size: 12px; letter-spacing: 0.08em; color: var(--hh-hue-gold); }`,
  `#${CONTRAST_AUDIT_REPORT_ID} ul { margin: 4px 0 0; padding-left: 18px; }`,
  `#${CONTRAST_AUDIT_REPORT_ID} .hh-audit-metric { margin: 2px 0; font-variant-numeric: tabular-nums; }`,
  `#${CONTRAST_AUDIT_REPORT_ID} .hh-audit-clean { color: var(--hh-hue-green); }`,
  `#${CONTRAST_AUDIT_REPORT_ID} .hh-audit-dirty { color: var(--hh-hue-alarm); }`,
  `[${AUDIT_FAIL_ATTR}] { outline: 2px solid var(--hh-hue-white); outline-offset: 2px; animation: hh-audit-breathe 2s ease-in-out infinite; }`,
  `@keyframes hh-audit-breathe { 0%, 100% { outline-color: var(--hh-hue-white); } 50% { outline-color: transparent; } }`,
  `@media (prefers-reduced-motion: reduce) { [${AUDIT_FAIL_ATTR}] { animation: none; } }`,
].join("\n");

/** Every var(--hh-hue-*) MODE_STYLE_CSS consumes — the test proves each is a
 *  real HUE_LEDGER name (hueLaw only walks .vue <style> blocks; this sheet
 *  ships from TS, so it self-declares its ledger surface). */
export function modeStyleHueVars(): string[] {
  return [...MODE_STYLE_CSS.matchAll(/var\(--hh-hue-([A-Za-z0-9-]+)\)/g)].map((m) => m[1] as string);
}

export function installModeStyle(doc: Document): void {
  if (doc.getElementById(CONTRAST_AUDIT_STYLE_ID) !== null) return;
  const style = doc.createElement("style");
  style.id = CONTRAST_AUDIT_STYLE_ID;
  style.textContent = MODE_STYLE_CSS;
  doc.head.appendChild(style);
}

/* ------------------------------------------------------------------- mount */

export interface ModeReport {
  readonly era: EraTokens;
  readonly reducedMotion: boolean | null;
  readonly census: readonly ResolvedPair[];
  readonly censusFailures: readonly ResolvedPair[];
  readonly dom: DomAuditReport;
}

export interface ContrastAuditModeHandle {
  readonly root: Element;
  /** Re-run census + DOM walk and repaint the strip. Called automatically on
   *  DOM mutations inside the root (style/class/childList/characterData). */
  refresh(): ModeReport;
  /** The last computed report (mount audits before returning). */
  lastReport(): ModeReport;
  dispose(): void;
}

const mountedModes = new WeakMap<Element, ContrastAuditModeHandle>();
let mountedCount = 0;

const MAX_REPORT_ROWS = 12;

function reducedMotionLabel(value: boolean | null): string {
  if (value === null) return "unknown (no matchMedia)";
  return value ? "reduce (static arm active)" : "no-preference (breathe arm active)";
}

function metricLine(doc: Document, testId: string, content: string, tone?: "clean" | "dirty"): HTMLElement {
  const p = doc.createElement("p");
  p.className = tone === undefined ? "hh-audit-metric" : `hh-audit-metric hh-audit-${tone}`;
  p.setAttribute("data-test-id", testId);
  p.textContent = content;
  return p;
}

/** Build the strip's content nodes from a report (pure builder — exported so
 *  tests assert the copy without driving the whole mount). */
export function buildReportNodes(doc: Document, report: ModeReport): readonly HTMLElement[] {
  const censusClean = report.censusFailures.length === 0;
  const domTotal = report.dom.audited.length + report.dom.unresolved.length;
  const clean = censusClean && report.dom.failures.length === 0;
  const nodes: HTMLElement[] = [
    metricLine(
      doc,
      "hh-audit-era",
      `era ${report.era.era} · surface ${report.era.surface} accent ${report.era.accent} · reduced-motion: ${reducedMotionLabel(report.reducedMotion)}`,
    ),
    metricLine(
      doc,
      "hh-audit-census",
      `census ${report.census.length} pairings × era — ${censusClean ? "AA clean" : `${report.censusFailures.length} AA FAILURES: ${report.censusFailures.map((p) => p.id).join(", ")}`}`,
    ),
    metricLine(
      doc,
      "hh-audit-dom",
      `DOM ${report.dom.audited.length} audited · ${report.dom.failures.length} failed · ${report.dom.unresolved.length} unresolved (gradient pages are the census half's job)`,
    ),
    metricLine(
      doc,
      "hh-audit-status",
      clean
        ? "CONTRAST: every checked pairing cleared its floor."
        : `CONTRAST: ${report.censusFailures.length + report.dom.failures.length} failure(s) marked with white outlines.`,
      clean ? "clean" : "dirty",
    ),
  ];
  if (domTotal === 0) {
    nodes.push(metricLine(doc, "hh-audit-empty", "no painted text found under this root — nothing was actually checked"));
  }
  nodes.push(failureList(doc, report));
  return nodes;
}

/** The failure rows (census ids first, then DOM pairings), capped honestly. */
function failureList(doc: Document, report: ModeReport): HTMLUListElement {
  const list = doc.createElement("ul");
  list.setAttribute("data-test-id", "hh-audit-failures");
  const rows: string[] = [
    ...report.censusFailures.map((p) => `census ${p.id} (${p.era}) ${p.fgHex}/${p.bgHex} = ${p.ratio.toFixed(2)} < ${p.minRatio} — ${p.where}`),
    ...report.dom.failures.map((p) => `DOM ${p.label} ${p.fgHex}/${p.bgHex} = ${p.ratio.toFixed(2)} < ${p.minRatio}`),
  ];
  for (const row of rows.slice(0, MAX_REPORT_ROWS)) {
    const li = doc.createElement("li");
    li.setAttribute("data-test-id", "hh-audit-fail-row");
    li.textContent = row;
    list.appendChild(li);
  }
  if (rows.length > MAX_REPORT_ROWS) {
    const li = doc.createElement("li");
    li.textContent = `+${rows.length - MAX_REPORT_ROWS} more (see lastReport())`;
    list.appendChild(li);
  }
  return list;
}

export function mountContrastAuditMode(root?: Element | null): ContrastAuditModeHandle {
  const target = root ?? document.body;
  if (mountedModes.has(target)) {
    throw new ContrastAuditModeError("already-mounted", "this root already runs Contrast Audit Mode — dispose it first");
  }
  const doc = target.ownerDocument;
  if (doc === null) {
    throw new ContrastAuditModeError("bad-root", "audit root is detached from a document");
  }
  readEraTokens(doc); // fail loud BEFORE touching anything

  installModeStyle(doc);

  const screen = doc.createElement("div");
  screen.id = CONTRAST_AUDIT_SCREEN_ID;
  screen.setAttribute("data-test-id", "hh-audit-screen");
  screen.setAttribute("aria-hidden", "true");

  const strip = doc.createElement("aside");
  strip.id = CONTRAST_AUDIT_REPORT_ID;
  strip.setAttribute("data-test-id", "hh-audit-report");
  strip.setAttribute("role", "status");
  strip.setAttribute("aria-label", "Contrast audit report");
  strip.setAttribute(AUDIT_EXEMPT_ATTR, "true");

  doc.body.appendChild(screen);
  doc.body.appendChild(strip);
  mountedCount += 1;

  let last: ModeReport | null = null;
  let disposed = false;
  let queued = false;

  function observe(): void {
    observer.observe(target, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });
  }

  function paint(): ModeReport {
    if (disposed) throw new ContrastAuditModeError("disposed", "this mode handle was disposed");
    // The strip itself lives inside the observed subtree (root = body is the
    // normal case): its rebuild would feed the observer forever. Stop, write,
    // restart — our own DOM traffic is never an audit trigger.
    observer.disconnect();
    try {
      const era = readEraTokens(doc);
      const census = buildChromeInventory([era]);
      const dom = auditDomPairings(target);
      applyDomMarkers(dom);
      last = Object.freeze({
        era,
        reducedMotion: readReducedMotion(doc),
        census,
        censusFailures: findAaViolations(census),
        dom,
      });
      while (strip.firstChild !== null) strip.removeChild(strip.firstChild);
      const heading = doc.createElement("h3");
      heading.textContent = "CONTRAST AUDIT MODE";
      strip.appendChild(heading);
      for (const node of buildReportNodes(doc, last)) strip.appendChild(node);
    } finally {
      if (!disposed) observe();
    }
    return last;
  }

  const observer = new MutationObserver(() => {
    if (queued || disposed) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      if (disposed) return;
      paint();
    });
  });
  // first paint() (below) starts the observation via observe().

  const handle: ContrastAuditModeHandle = Object.freeze({
    root: target,
    refresh: paint,
    lastReport: () => {
      if (last === null) throw new ContrastAuditModeError("no-report", "audit has not computed yet");
      return last;
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      observer.disconnect();
      for (const el of Array.from(target.querySelectorAll(`[${AUDIT_FAIL_ATTR}]`))) el.removeAttribute(AUDIT_FAIL_ATTR);
      screen.remove();
      strip.remove();
      mountedModes.delete(target);
      mountedCount -= 1;
      if (mountedCount === 0) doc.getElementById(CONTRAST_AUDIT_STYLE_ID)?.remove();
    },
  });
  mountedModes.set(target, handle);
  paint();
  return handle;
}

/**
 * The shell-facing toggle (App.vue's 'a' key rides the same one-key law as 'c'
 * chroma and 'r' readout): mount on the given root (default body), or dispose
 * the live mode. Returns the NEW active state.
 */
export function toggleContrastAuditMode(root?: Element | null): boolean {
  const target = root ?? document.body;
  const live = mountedModes.get(target);
  if (live !== undefined) {
    live.dispose();
    return false;
  }
  mountContrastAuditMode(target);
  return true;
}

export function isContrastAuditModeActive(root?: Element | null): boolean {
  return mountedModes.has(root ?? document.body);
}
