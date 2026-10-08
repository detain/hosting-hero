/**
 * ADR-0008 lane-3 enforcement twin — the audio law scan (2026-10-08).
 *
 * Same shape as render/__tests__/filtersLaw.test.ts (the lane-2 precedent):
 * a comment-stripped, repo-wide walk that fails RED when a law surface is
 * touched outside its one legal home, plus armed synthetic probes and a
 * LIVE red-tree proof that the scanner actually bites.
 *
 * Law surfaces pinned by this file:
 *  1. `@pixi/sound` imports: ZERO outside src/audio/ (the façade quarantine)
 *     AND zero inside it today — the lane-3 no-dep decision, stated as a
 *     pin, not a vibe. A future vendor backing flips exactly this one line.
 *  2. `new AudioContext(`: EXACTLY one site in the whole repo — audioBus.ts
 *     (the positive control: the law has a live carrier, not a vacuous
 *     pass; createBrowserAudioContext is the browser door).
 *  3. `new Audio(`: ZERO everywhere — HTMLAudioElement is not a legal
 *     transport in a graph-owned world; buffer playback only.
 *  4. src/audio/ allocates NO timers (setTimeout/setInterval/
 *     requestAnimationFrame): ducking rides ctx.currentTime automation.
 *  5. src/audio/ imports NOTHING from @hh/sim-core or packages/** — the
 *     one-way presentation law as an import wall (audio goes to pixels and
 *     speakers; nothing flows back toward the sim through this lane).
 *  6. Nothing OUTSIDE src/audio/ imports audio at all — law-first: zero
 *     calls from existing screens (the lane-2 "nothing mounts yet" pin).
 *  7. src/audio/ roster is closed: audioBus, busGraph, index, packs.
 *
 * stripComments is line-count-approximate: violations spanning block-comment
 * boundaries are reported with file-accurate NAMES but approximate LINE
 * numbers — detection itself is unaffected (the match always fires).
 */
import { existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const SRC = join(process.cwd(), "src");
const AUDIO_DIR = join(SRC, "audio");

/** Law regexes — CODE form only (every scan runs on comment-stripped text,
 *  because our own docblocks must be allowed to NAME what they forbid). */
const VENDOR_IMPORT = /["']@pixi\/sound/;
const AUDIOCONTEXT_CONSTRUCT = /new\s+AudioContext\s*\(/;
const HTML_AUDIO_CONSTRUCT = /new\s+Audio\s*\(/;
const TIMER_CALL = /\b(setTimeout|setInterval|requestAnimationFrame)\b/;

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

function listSources(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      if (entry === "__tests__") continue; // test files quote the patterns to police them
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

/** file:line report for a pattern over a set of sources (comment-stripped). */
function hits(pattern: RegExp, paths: readonly string[]): string[] {
  const reports: string[] = [];
  for (const path of paths) {
    const lines = stripComments(readFileSync(path, "utf8")).split("\n");
    lines.forEach((line, i) => {
      if (pattern.test(line)) reports.push(`${relative(path)}:${i + 1}`);
    });
  }
  return reports;
}

/** Static import specifiers of one source (comment-stripped code). */
function importSpecifiers(path: string): string[] {
  const code = stripComments(readFileSync(path, "utf8"));
  return [...code.matchAll(/(?:from|import)\s*["']([^"']+)["']/g)].map((m) => m[1] as string);
}

const allSources = listSources(SRC);
const audioSources = listSources(AUDIO_DIR).sort();
const outsideAudio = allSources.filter((p) => !p.startsWith(AUDIO_DIR + "/"));

describe("audio quarantine law — src/audio/ is the only audio surface (ADR-0008 lane 3)", () => {
  it("roster is non-vacuous (the scan really walks a substantial tree)", () => {
    // Floor, not exact (the filtersLaw/hueLaw precedent): lanes add files.
    expect(allSources.length).toBeGreaterThanOrEqual(100);
    expect(audioSources.length).toBe(4);
  });

  it("src/audio/ is exactly {audioBus.ts, busGraph.ts, index.ts, packs.ts}", () => {
    expect(audioSources.map((p) => relative(p).split("/").pop())).toEqual([
      "audioBus.ts",
      "busGraph.ts",
      "index.ts",
      "packs.ts",
    ]);
  });

  it("zero @pixi/sound imports anywhere in src/ outside audio/", () => {
    expect(hits(VENDOR_IMPORT, outsideAudio)).toEqual([]);
  });

  it("DECISION PIN: zero @pixi/sound imports INSIDE audio/ too — lane 3 shipped zero-dep", () => {
    // The @pixi/sound no-dep ruling (2026-10-08): the loader saves no code
    // without samples, and the ADR's own step-4 wording permits "skipped
    // entirely". If a future lane backs the façade with the vendor, that
    // wiring lands in audioBus.ts and MUST flip THIS pin (and only this
    // pin) — never law pins 1, 2 or 3.
    expect(hits(VENDOR_IMPORT, audioSources)).toEqual([]);
  });

  it("POSITIVE CONTROL: exactly ONE `new AudioContext(` site in the repo — audioBus.ts", () => {
    const constructs = hits(AUDIOCONTEXT_CONSTRUCT, allSources);
    expect(constructs).toHaveLength(1);
    expect(constructs[0]).toMatch(/src\/audio\/audioBus\.ts:/);
  });

  it("zero direct AudioContext construction outside the WebAudio impl file", () => {
    expect(
      hits(AUDIOCONTEXT_CONSTRUCT, allSources.filter((p) => !p.endsWith(join("audio", "audioBus.ts")))),
    ).toEqual([]);
  });

  it("zero `new Audio(` — HTMLAudioElement is not a legal transport anywhere", () => {
    expect(hits(HTML_AUDIO_CONSTRUCT, allSources)).toEqual([]);
  });

  it("no timers in src/audio/ — ducking is ctx.currentTime automation, nothing may keep running", () => {
    expect(hits(TIMER_CALL, audioSources)).toEqual([]);
  });

  it("one-way law: src/audio/ imports no sim-core, no packages/** — presentation never couples back", () => {
    const offenders = audioSources
      .filter((p) =>
        importSpecifiers(p).some((spec) => spec.startsWith("@hh/sim-core") || spec.includes("packages/")),
      )
      .map(relative);
    expect(offenders).toEqual([]);
  });

  it("law-first: NOTHING outside src/audio/ imports the audio lane (zero calls from existing screens)", () => {
    const consumers = allSources
      .filter((p) => !p.startsWith(AUDIO_DIR + "/"))
      .filter((p) =>
        importSpecifiers(p).some((spec) => spec.split("/").includes("audio")),
      )
      .map(relative);
    expect(consumers).toEqual([]);
  });
});

describe("armed probes — the scanners bite (synthetic sources)", () => {
  const scan = (pattern: RegExp, source: string): boolean =>
    stripComments(source)
      .split("\n")
      .some((line) => pattern.test(line));

  it("planted vendor import is caught in both spellings", () => {
    expect(scan(VENDOR_IMPORT, 'import { Sound } from "@pixi/sound";')).toBe(true);
    expect(scan(VENDOR_IMPORT, 'await import("@pixi/sound-filters-thing");')).toBe(true);
    expect(scan(VENDOR_IMPORT, 'import "pixi-sound";')).toBe(false); // not the scoped vendor
  });

  it("AudioContext construction is caught; look-alikes are not", () => {
    expect(scan(AUDIOCONTEXT_CONSTRUCT, "const ctx = new AudioContext();")).toBe(true);
    expect(scan(AUDIOCONTEXT_CONSTRUCT, "const c2 = new AudioContext({ latencyHint: \"balanced\" });")).toBe(true);
    expect(scan(AUDIOCONTEXT_CONSTRUCT, "function make(x: AudioContextLike) {}")).toBe(false);
    expect(scan(AUDIOCONTEXT_CONSTRUCT, "const clone = new AudioContextLike()")).toBe(false);
  });

  it("new Audio( is caught but new AudioContext( is NOT an HTMLAudio hit", () => {
    expect(scan(HTML_AUDIO_CONSTRUCT, 'el = new Audio("hum.mp3");')).toBe(true);
    expect(scan(HTML_AUDIO_CONSTRUCT, "const other = new AudioContext();")).toBe(false);
  });

  it("comment-form decoys are ignored, code-form under a comment is not", () => {
    expect(scan(AUDIOCONTEXT_CONSTRUCT, "// const boot = new AudioContext() — retired")).toBe(false);
    expect(scan(AUDIOCONTEXT_CONSTRUCT, "/* new AudioContext() was the old door */")).toBe(false);
    expect(scan(AUDIOCONTEXT_CONSTRUCT, "const boot = new AudioContext(); // the ONLY door")).toBe(true);
  });

  it("timer spellings are caught; automation scheduling is not", () => {
    expect(scan(TIMER_CALL, 'setTimeout(() => duck.release(), 300);')).toBe(true);
    expect(scan(TIMER_CALL, "app.ticker.add(frame => tick())")).toBe(false); // ticker ≠ timer
    expect(scan(TIMER_CALL, "param.linearRampToValueAtTime(0.25, now + 0.05);")).toBe(false);
  });
});

describe("LIVE red-tree proof — a planted file is caught in the real walk", () => {
  const probePath = join(SRC, "chrome", "__audio_scan_probe_tmp.ts");

  afterAll(() => {
    rmSync(probePath, { force: true }); // belt and braces — never leave a planted file
    expect(existsSync(probePath)).toBe(false);
  });

  it("planted @pixi/sound import + AudioContext construction both surface with file:line", () => {
    expect(existsSync(probePath)).toBe(false); // clean tree before planting
    writeFileSync(
      probePath,
      'export const planted = 1;\nimport "@pixi/sound";\nconst probeCtx = new AudioContext();\n',
      "utf8",
    );
    try {
      const fresh = listSources(SRC); // re-walk WITH the violation present
      const vendor = hits(VENDOR_IMPORT, outsideAudioFor(fresh));
      const contexts = hits(AUDIOCONTEXT_CONSTRUCT, fresh);
      expect(vendor).toContain(`src/chrome/__audio_scan_probe_tmp.ts:2`);
      expect(contexts).toHaveLength(2); // the real one + the planted one
      expect(contexts.some((h) => h.includes("__audio_scan_probe_tmp.ts:3"))).toBe(true);
    } finally {
      rmSync(probePath, { force: true });
    }
    // and the tree is clean again — the walk re-proves it
    expect(listSources(SRC)).toHaveLength(allSources.length);
  });
});

function outsideAudioFor(paths: readonly string[]): string[] {
  return paths.filter((p) => !p.startsWith(AUDIO_DIR + "/"));
}
