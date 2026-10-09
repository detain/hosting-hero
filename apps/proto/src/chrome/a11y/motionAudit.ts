/**
 * Strobe / Motion Audit (§8.14 "The Strobe Budget" + "Reduced Motion mode")
 * — the CI half of the strobe-clamp acceptance row (PHASE1-PLAN:165).
 *
 * Two laws, two mechanisms:
 *
 *  1. STROBE BUDGET (§8.14): "no more than 3 luminance transitions per second
 *     across more than 25% of the screen, ever." A repeating loop is measured
 *     as crossingsPerCycle ÷ periodSeconds; a violation needs BOTH the rate
 *     over 3 Hz AND coverage over 25% of screen area (the spec's conjunction).
 *     One-shots and hover transitions cannot strobe — they are exempt from
 *     the rate law but NOT from the guard law below.
 *
 *  2. REDUCED-MOTION GUARD (§8.14): "every animation has a static or
 *     minimal-motion fallback". Enforced as: every chrome <style> block that
 *     declares `animation:` or `transition:` on a selector must have that
 *     same selector neutralised inside an
 *     `@media (prefers-reduced-motion: reduce)` block in the same file. The
 *     `.still` class (Readout Mode's static instrument arm) is a separate,
 *     additional mechanism — it does NOT satisfy the media-query law, because
 *     the OS-level preference must work without any user toggle.
 *
 * The scanner is pure string work (no DOM, no CSSOM): parseCssBlocks() is a
 * depth-aware top-level splitter, comments are stripped BEFORE scanning so a
 * commented-out `animation:` can never fake a guard (armed-probe law shared
 * with hueLaw/filtersLaw).
 */
import { HEARTBEAT_HZ } from "../../render/heartbeat";

/* ------------------------------------------------------------------ errors */

export class MotionAuditError extends Error {
  constructor(code: string, detail: string) {
    super(`motion[${code}]: ${detail}`);
    this.name = "MotionAuditError";
  }
}

/* -------------------------------------------------------------- strobe law */

/** §8.14 hard numbers: ≤3 transitions/sec … across >25% of the screen. */
export const STROBE_LIMIT_TRANSITIONS_PER_SEC = 3;
export const STROBE_LIMIT_COVERAGE_FRACTION = 0.25;

export type MotionKind = "loop" | "once" | "transition";
const MOTION_KINDS: readonly string[] = ["loop", "once", "transition"];

export interface MotionSpec {
  readonly id: string;
  readonly where: string;
  readonly kind: MotionKind;
  /** REQUIRED for loops: one full cycle length in ms. */
  readonly periodMs?: number;
  /** REQUIRED for loops: luminance direction reversals per cycle (a
   *  peak-and-trough breathe = 2 crossings). */
  readonly crossingsPerCycle?: number;
  /** Estimated share of screen area the effect can flash, 0..1. PROVISIONAL
   *  taste figures until real atlases measure pixels — every entry earns a
   *  doc note in the inventory below. */
  readonly coverage: number;
  /** The shipped static fallback (what reduced-motion users get). */
  readonly reducedMotionFallback: string;
}

export function parseMotionSpec(spec: MotionSpec): MotionSpec {
  if (!MOTION_KINDS.includes(spec.kind)) {
    throw new MotionAuditError("bad-kind", `"${spec.kind}" is not one of ${MOTION_KINDS.join("|")} (${spec.id})`);
  }
  if (!(spec.coverage >= 0 && spec.coverage <= 1)) {
    throw new MotionAuditError("bad-value", `coverage ${spec.coverage} outside [0,1] (${spec.id})`);
  }
  if (spec.reducedMotionFallback.trim() === "") {
    throw new MotionAuditError("no-fallback", `${spec.id} declares no static fallback (§8.14 Reduced Motion)`);
  }
  if (spec.kind !== "loop") {
    return Object.freeze(spec);
  }
  const period = spec.periodMs;
  const crossings = spec.crossingsPerCycle;
  if (period === undefined || !(period > 0) || !Number.isFinite(period)) {
    throw new MotionAuditError("bad-period", `${spec.id} is a loop without a positive periodMs`);
  }
  if (crossings === undefined || !(crossings >= 1) || !Number.isFinite(crossings)) {
    throw new MotionAuditError("bad-crossings", `${spec.id} is a loop without crossingsPerCycle ≥ 1`);
  }
  return Object.freeze(spec);
}

/** Sustained luminance crossings per second (0 for non-repeating motion). */
export function transitionsPerSecond(spec: MotionSpec): number {
  if (spec.kind !== "loop") return 0;
  return (spec.crossingsPerCycle ?? 0) / ((spec.periodMs ?? Infinity) / 1000);
}

/** A strobe violation needs BOTH halves of the §8.14 conjunction. */
export function isStrobeViolation(spec: MotionSpec): boolean {
  if (spec.kind !== "loop") return false;
  return (
    transitionsPerSecond(spec) > STROBE_LIMIT_TRANSITIONS_PER_SEC &&
    spec.coverage > STROBE_LIMIT_COVERAGE_FRACTION
  );
}

export function findStrobeViolations(specs: readonly MotionSpec[]): readonly MotionSpec[] {
  return Object.freeze(specs.map(parseMotionSpec).filter(isStrobeViolation));
}

/* ------------------------------------------- the shipped chrome motion census */

/**
 * Every motion site in chrome/ (+ the canvas heartbeat, whose 0.5 Hz breathe
 * the whole house syncs to). `where` names the selector; the guard LAW is
 * verified by the scanner in the test — this census carries the STROBE MATH.
 * Coverage figures are PROVISIONAL programmer-art estimates: bezel strips and
 * wash bands are small; nothing here approaches 25% of screen.
 */
const MOTION_SPECS: readonly MotionSpec[] = [
  {
    id: "bezel-pressure-lip",
      where: "chrome/BezelHud.vue .spiking::after — animation: lip 2s infinite",
      kind: "loop",
      periodMs: 2000,
      crossingsPerCycle: 2, // .35 → .9 → .35 = one trough + one peak per cycle
      coverage: 0.03, // 10px inset ring on ONE instrument bezel
      reducedMotionFallback: "@media (prefers-reduced-motion: reduce) sets animation:none, opacity .6 steady",
    },
    {
      id: "panic-klaxon-wash",
      where: "chrome/PanicLayout.vue .level-panic — animation: klaxon 1.6s infinite",
      kind: "loop",
      periodMs: 1600,
      crossingsPerCycle: 2, // transparent → alarm-5% wash → transparent
      coverage: 0.12, // headline band only, 5% alpha wash — far below a flash
      reducedMotionFallback: "@media (prefers-reduced-motion: reduce) sets animation:none",
    },
    {
      id: "heartbeat-breathe",
      where: "render/heartbeat.ts HEARTBEAT_HZ — canvas motes + post-film grain phase",
      kind: "loop",
      periodMs: 1000 / HEARTBEAT_HZ,
      crossingsPerCycle: 2, // sinusoid: peak + trough per cycle
      coverage: 0.15, // mote theatre is ÷8-scaled screen-space area (PROVISIONAL)
      reducedMotionFallback: "heartbeat is the house sync; FX translation table (§8.12) governs its reduced arm",
    },
    {
      id: "counter-roll",
      where: "chrome/instruments/CounterFace.vue .digit[data-rolling] — roll 320ms once",
      kind: "once",
      coverage: 0.01,
      reducedMotionFallback: "media guard (additive 2026-10-09) + .still static arm",
    },
    {
      id: "snr-fill-slide",
      where: "chrome/AlertStack.vue .snr-fill — transition width .3s",
      kind: "transition",
      coverage: 0.01,
      reducedMotionFallback: "media guard sets transition:none",
    },
    {
      id: "bar-needle-waterline",
      where: "chrome/instruments/{Bar,Needle,Waterline}Face.vue — transitions 140-200ms",
      kind: "transition",
      coverage: 0.02,
      reducedMotionFallback: "media guards (additive 2026-10-09) + .still static arms",
    },
    {
      id: "gaterail-item-hover",
      where: "chrome/GateRail.vue .gate-rail__item — transition 140ms",
      kind: "transition",
      coverage: 0.01,
      reducedMotionFallback: "media guard (additive 2026-10-09) sets transition:none",
    },
    {
      id: "panic-optional-dim",
      where: "chrome/PanicLayout.vue .content :slotted([data-hud-optional]) — opacity .4s",
      kind: "transition",
      coverage: 0.05,
      reducedMotionFallback: "media guard sets transition:none (dim itself still applies, instantly)",
    },
];

/** Parsed+validated on module load: an illegal motion row cannot ship. */
export const CHROME_MOTION_SPECS: readonly MotionSpec[] = Object.freeze(
  MOTION_SPECS.map(parseMotionSpec),
);

/** The heartbeat row must ride the REAL constant, not a copy of it. */
export function heartbeatTransitionsPerSecond(): number {
  return HEARTBEAT_HZ * 2;
}

/* ------------------------------------------------------------------ scanner */

export interface CssBlock {
  readonly prelude: string;
  readonly body: string;
}

/** Strip /* … *\/ comments (non-greedy, multi-line) before any scan. */
export function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, " ");
}

/** Depth-aware top-level block splitter: prelude text + balanced body. */
export function parseCssBlocks(css: string): readonly CssBlock[] {
  const blocks: CssBlock[] = [];
  let depth = 0;
  let preludeStart = 0;
  let bodyStart = -1;
  for (let i = 0; i < css.length; i += 1) {
    const ch = css[i];
    if (ch === "{") {
      if (depth === 0) bodyStart = i + 1;
      depth += 1;
    } else if (ch === "}") {
      depth -= 1;
      if (depth === 0 && bodyStart !== -1) {
        blocks.push({ prelude: css.slice(preludeStart, bodyStart - 1), body: css.slice(bodyStart, i) });
        preludeStart = i + 1;
        bodyStart = -1;
      }
    }
  }
  return blocks;
}

const MOTION_DECL = /(?:^|[;{\s])(animation|transition)\s*:/;
const MOTION_NONE = /^\s*(animation|transition)\s*:\s*(none|0)|\b(animation|transition)\s*:\s*none\b/;

function hasLiveMotion(body: string): boolean {
  for (const line of body.split(/[;\n]/)) {
    if (!MOTION_DECL.test(line)) continue;
    if (MOTION_NONE.test(line)) continue;
    return true;
  }
  return false;
}

export function normalizeSelector(prelude: string): string {
  return prelude.trim().replace(/\s+/g, " ");
}

export interface MotionScan {
  /** selectors declaring live animation/transition (non-media blocks). */
  readonly motionSelectors: readonly string[];
  /** selectors neutralised inside a prefers-reduced-motion block. */
  readonly guardedSelectors: readonly string[];
  /** selectors whose animation declaration repeats (`infinite`). */
  readonly infiniteLoopSelectors: readonly string[];
}

export function scanStyleMotion(css: string): MotionScan {
  const stripped = stripCssComments(css);
  const motionSelectors: string[] = [];
  const guardedSelectors: string[] = [];
  const infiniteLoopSelectors: string[] = [];
  for (const block of parseCssBlocks(stripped)) {
    const prelude = block.prelude.trim();
    if (prelude.startsWith("@media")) {
      if (!prelude.includes("prefers-reduced-motion")) continue;
      for (const inner of parseCssBlocks(block.body)) {
        if (/animation\s*:\s*none|transition\s*:\s*none|animation\s*:\s*0|transition\s*:\s*0/.test(inner.body)) {
          guardedSelectors.push(normalizeSelector(inner.prelude));
        }
      }
      continue;
    }
    if (prelude.startsWith("@")) continue; // @keyframes bodies are states, not components
    if (!hasLiveMotion(block.body)) continue;
    const selector = normalizeSelector(block.prelude);
    motionSelectors.push(selector);
    if (/animation\s*:[^;}]*\binfinite\b/.test(block.body)) infiniteLoopSelectors.push(selector);
  }
  return Object.freeze({
    motionSelectors: Object.freeze(motionSelectors),
    guardedSelectors: Object.freeze(guardedSelectors),
    infiniteLoopSelectors: Object.freeze(infiniteLoopSelectors),
  });
}

export interface MotionGap {
  readonly file: string;
  readonly selector: string;
}

/** Unguarded motion in one file: every motion selector lacking a
 *  prefers-reduced-motion arm. Empty list = the file honours §8.14. */
export function findReducedMotionGaps(file: string, css: string): readonly MotionGap[] {
  const scan = scanStyleMotion(css);
  const guarded = new Set(scan.guardedSelectors);
  return Object.freeze(
    scan.motionSelectors
      .filter((selector) => !guarded.has(selector))
      .map((selector) => Object.freeze({ file, selector })),
  );
}

export function formatMotionGap(gap: MotionGap): string {
  return `${gap.file}: ${gap.selector} animates without a prefers-reduced-motion arm (§8.14)`;
}
