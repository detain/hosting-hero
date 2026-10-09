/**
 * STROBE / MOTION AUDIT gate (§8.14 "The Strobe Budget" + "Reduced Motion
 * mode", PHASE1-PLAN:165 harness row "strobe-clamp"). Acceptance-gate roster
 * row "strobe-budget-check" — this file makes that row honestly `live`.
 *
 * Three scans, all armed (a scanner that cannot fail is decoration):
 *  1. the live motion-selector walk over every chrome <style> — every
 *     animation/transition must have a prefers-reduced-motion arm IN THE SAME
 *     FILE (the .still Readout arm is a separate mechanism, not a substitute);
 *  2. the strobe math over the shipped motion census (§8.14: >3 Hz AND >25%
 *     screen coverage is the forbidden conjunction);
 *  3. planted synthetic CSS + planted loop specs proving detection.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { HEARTBEAT_HZ } from "../../render/heartbeat";
import {
  CHROME_MOTION_SPECS,
  findReducedMotionGaps,
  findStrobeViolations,
  formatMotionGap,
  heartbeatTransitionsPerSecond,
  isStrobeViolation,
  MotionAuditError,
  parseMotionSpec,
  scanStyleMotion,
  STROBE_LIMIT_COVERAGE_FRACTION,
  STROBE_LIMIT_TRANSITIONS_PER_SEC,
  stripCssComments,
  transitionsPerSecond,
} from "../a11y/motionAudit";
import type { MotionSpec } from "../a11y/motionAudit";

// vitest roots at apps/proto (hueLaw resolution law).
const CHROME_DIR = join(process.cwd(), "src", "chrome");

function stylingFiles(dir: string): string[] {
  const found: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (name === "__tests__" || name === "a11y") continue; // the scanner lives here, not the motion
    if (statSync(full).isDirectory()) found.push(...stylingFiles(full));
    else if (name.endsWith(".vue") || name.endsWith(".css")) found.push(full);
  }
  return found.sort();
}

function styleCssOf(file: string): string {
  const raw = readFileSync(file, "utf8");
  return file.endsWith(".vue")
    ? [...raw.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1] ?? "").join("\n")
    : raw;
}

/* ------------------------------------------------ the live guard-law walk */

describe("motion audit — every shipped chrome animation honours prefers-reduced-motion", () => {
  const files = stylingFiles(CHROME_DIR).map((f) => ({ file: f.replace(`${CHROME_DIR}/`, ""), css: styleCssOf(f) }));
  const gaps = files.flatMap(({ file, css }) => findReducedMotionGaps(file, css));

  it("scans a non-trivial roster (the walk cannot silently vacate)", () => {
    expect(files.length).toBeGreaterThanOrEqual(14); // hueLaw floor twin
    const motionSites = files.reduce((n, { css }) => n + scanStyleMotion(css).motionSelectors.length, 0);
    expect(motionSites).toBeGreaterThanOrEqual(8); // census below carries 8+ sites
  });

  it("ZERO unguarded motion selectors across chrome (§8.14 guard law)", () => {
    expect(gaps.map(formatMotionGap)).toStrictEqual([]);
  });

  it("the guarded selectors are exactly the shipped motion ones (no guard orphans)", () => {
    // every media-guard arm must neutralise a REAL declared selector — a
    // guard for a renamed animation is a lying comment, not a fallback.
    const orphans: string[] = [];
    for (const { file, css } of files) {
      const scan = scanStyleMotion(css);
      const declared = new Set(scan.motionSelectors);
      for (const guarded of scan.guardedSelectors) {
        if (!declared.has(guarded)) orphans.push(`${file}: ${guarded}`);
      }
    }
    expect(orphans).toStrictEqual([]);
  });
});

/* --------------------------------------------------------- the strobe math */

describe("motion audit — the strobe budget (§8.14 hard numbers)", () => {
  it("the legal constants are the spec's own numbers", () => {
    expect(STROBE_LIMIT_TRANSITIONS_PER_SEC).toBe(3);
    expect(STROBE_LIMIT_COVERAGE_FRACTION).toBe(0.25);
  });

  it("no shipped chrome motion violates the budget", () => {
    expect(findStrobeViolations(CHROME_MOTION_SPECS)).toStrictEqual([]);
  });

  it("the breathing loops are pinned to their exact rates", () => {
    const rate = (id: string): number => {
      const spec = CHROME_MOTION_SPECS.find((s) => s.id === id);
      if (spec === undefined) throw new Error(`motion census lost "${id}"`);
      return transitionsPerSecond(spec);
    };
    expect(rate("bezel-pressure-lip")).toBe(1); // 2 crossings / 2 s
    expect(rate("panic-klaxon-wash")).toBe(1.25); // 2 crossings / 1.6 s
    expect(rate("heartbeat-breathe")).toBe(HEARTBEAT_HZ * 2);
    expect(heartbeatTransitionsPerSecond()).toBe(1); // 0.5 Hz breathe = 1 crossing/s
  });

  it("non-loop kinds contribute zero sustained rate", () => {
    const oneShot = CHROME_MOTION_SPECS.filter((s) => s.kind !== "loop");
    expect(oneShot.length).toBeGreaterThanOrEqual(5);
    for (const spec of oneShot) expect(transitionsPerSecond(spec)).toBe(0);
  });
});

/* ------------------------------------------------------------ armed probes */

describe("motion audit — ARMED (both detectors can actually fire)", () => {
  it("planted loop: 8 Hz across 60% of screen IS a violation; the conjunction halves are not", () => {
    const base = {
      id: "planted",
      where: "armed probe",
      kind: "loop" as const,
      periodMs: 250,
      crossingsPerCycle: 2, // 8 Hz
      reducedMotionFallback: "n/a",
    };
    const fullScreen: MotionSpec = { ...base, coverage: 0.6 };
    const localized: MotionSpec = { ...base, coverage: 0.2 };
    const slowWide: MotionSpec = { ...base, periodMs: 2000, coverage: 0.9 };
    expect(isStrobeViolation(fullScreen)).toBe(true);
    expect(isStrobeViolation(localized)).toBe(false); // >3 Hz but under coverage — legal
    expect(isStrobeViolation(slowWide)).toBe(false); // >25% but 1 Hz — legal
    const report = findStrobeViolations([localized, slowWide, fullScreen]);
    expect(report.map((s) => s.id)).toStrictEqual(["planted"]);
  });

  it("malformed loop specs fail loud at parse, never silently zero-rate", () => {
    expect(() => parseMotionSpec({ id: "a", where: "w", kind: "loop", coverage: 0.1, reducedMotionFallback: "x" })).toThrowError(
      MotionAuditError,
    );
    expect(() => parseMotionSpec({ id: "a", where: "w", kind: "loop", periodMs: 0, crossingsPerCycle: 2, coverage: 0.1, reducedMotionFallback: "x" })).toThrowError(
      /motion\[bad-period\]/,
    );
    expect(() => parseMotionSpec({ id: "a", where: "w", kind: "loop", periodMs: 100, coverage: 2, reducedMotionFallback: "x" })).toThrowError(
      /motion\[bad-value\]/,
    );
    expect(() => parseMotionSpec({ id: "a", where: "w", kind: "loop", periodMs: 100, crossingsPerCycle: 0, coverage: 0.2, reducedMotionFallback: "x" })).toThrowError(
      /motion\[bad-crossings\]/,
    );
    expect(() => parseMotionSpec({ id: "a", where: "w", kind: "loop", periodMs: 100, crossingsPerCycle: 1, coverage: 0.2, reducedMotionFallback: "  " })).toThrowError(
      /motion\[no-fallback\]/,
    );
  });

  it("planted unguarded CSS IS caught; a guarded twin is not; comments cannot fake either", () => {
    const unguarded = `.blink { animation: klaxon-evil .2s infinite; }\n@keyframes klaxon-evil { 0% { opacity: 1 } 50% { opacity: 0 } 100% { opacity: 1 } }`;
    const scan1 = scanStyleMotion(unguarded);
    expect(scan1.motionSelectors).toStrictEqual([".blink"]);
    expect(scan1.guardedSelectors).toStrictEqual([]);
    expect(scan1.infiniteLoopSelectors).toStrictEqual([".blink"]);
    expect(findReducedMotionGaps("probe.css", unguarded)).toStrictEqual([{ file: "probe.css", selector: ".blink" }]);

    const guarded = `${unguarded}\n@media (prefers-reduced-motion: reduce) {\n  .blink { animation: none; }\n}`;
    expect(findReducedMotionGaps("probe.css", guarded)).toStrictEqual([]);

    const decoy = `/* .fake { animation: x 1s infinite; } */\n/* @media (prefers-reduced-motion: reduce) { .fake { animation: none } } */`;
    expect(scanStyleMotion(decoy).motionSelectors).toStrictEqual([]);
    expect(scanStyleMotion(decoy).guardedSelectors).toStrictEqual([]);

    const instantOnly = `.x { transition: none; animation: none; }`;
    expect(scanStyleMotion(instantOnly).motionSelectors).toStrictEqual([]);
  });

  it("stripCssComments is newline-keeping-safe on straddling blocks", () => {
    expect(stripCssComments("a { /* multi\nline */ color: red }")).toBe("a {   color: red }");
  });
});
