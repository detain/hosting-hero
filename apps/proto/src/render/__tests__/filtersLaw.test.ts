/**
 * ADR-0008 wrapper-law scan (lane 2 enforcement twin).
 *
 * The headless canary's scope law keeps it on packages/sim-core (chrome
 * textLaw precedent), so the proto-side pin lives here: a source scan that
 * fails RED if any `.filters =` assignment appears outside render/post/ —
 * the post-chain must stay the ONLY writer (compositor-side filters bypass
 * admit() and the budget; the ADR refuses that in code).
 *
 * Law surfaces pinned by this file:
 *  1. Zero `.filters =` writes anywhere in src/ except src/render/post/.
 *  2. Positive control: render/post/ itself contains EXACTLY one live write
 *     (writer.ts) — the law has a real carrier, not a vacuous pass.
 *  3. render/post/ is closed: postChain.ts, writer.ts, index.ts — nothing else.
 *  4. No `ticker.add` inside render/post/ — the chain is driven from OUR
 *     frame loop only (wrapper law 1; the addons never self-subscribe).
 *  5. Armed probe: a planted violation in synthetic sources MUST be caught,
 *     with comment-form decoys correctly ignored.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/** Code-form filter write: assignment, never comparison (`==`/`===`). */
const FILTERS_WRITE = /\.filters\s*=(?!=)/;
const TICKER_SUBSCRIBE = /ticker\.add\b/;

/** Strip comments so the scan judges CODE, not prose (our own docblocks
 *  name the patterns they forbid; the armed probe covers both forms). */
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

/** file:line report of code-form `.filters =` writes in one source. */
function filtersWrites(path: string): string[] {
  const code = stripComments(readFileSync(path, "utf8"));
  return code
    .split("\n")
    .map((line, i) => (FILTERS_WRITE.test(line) ? `${path}:${i + 1}` : null))
    .filter((hit): hit is string => hit !== null);
}

function relative(path: string): string {
  return path.slice(process.cwd().length + 1);
}

const SRC = join(process.cwd(), "src");
const POST_DIR = join(SRC, "render", "post");

describe("filters write law — render/post/ is the only .filters= writer (ADR-0008)", () => {
  const allSources = listSources(SRC);
  const postSources = listSources(POST_DIR).sort();
  const outsidePost = allSources.filter((path) => !path.startsWith(POST_DIR + "/"));

  it("roster is non-vacuous (the scan really walks a substantial tree)", () => {
    // Floor, not exact: lanes add files every wave; 100 guards against a
    // silently-empty walk (the hueLaw floor precedent).
    expect(allSources.length).toBeGreaterThanOrEqual(100);
    expect(postSources.length).toBe(3);
  });

  it("render/post/ is exactly {index.ts, postChain.ts, writer.ts}", () => {
    expect(postSources.map((path) => relative(path).split("/").pop())).toEqual([
      "index.ts",
      "postChain.ts",
      "writer.ts",
    ]);
  });

  it("zero code-form .filters= writes anywhere in src/ outside render/post/", () => {
    const violations = outsidePost.flatMap(filtersWrites).map(relative);
    expect(violations).toEqual([]);
  });

  it("positive control: render/post/ carries EXACTLY one live .filters= write (writer.ts)", () => {
    const writes = postSources.flatMap(filtersWrites).map(relative);
    expect(writes).toHaveLength(1);
    expect(writes[0]).toMatch(/writer\.ts:/);
  });

  it("no ticker.add in render/post/ — the compositor frame loop is the only clock", () => {
    const offenders = postSources
      .filter((path) => TICKER_SUBSCRIBE.test(stripComments(readFileSync(path, "utf8"))))
      .map(relative);
    expect(offenders).toEqual([]);
  });
});

describe("armed probe — the scanner bites", () => {
  const scan = (source: string): boolean => {
    const lines = stripComments(source).split("\n");
    return lines.some((line) => FILTERS_WRITE.test(line));
  };

  it("planted per-object filter pass is caught", () => {
    expect(scan('unitSprite.filters = [new BlurFilter({ strength: 4 })];')).toBe(true);
    expect(scan("annotationLayer.filters=newColorOverlay;")).toBe(true);
  });

  it("comparisons are not writes (no false positive on the getter side)", () => {
    expect(scan("if (container.filters === null) return;")).toBe(false);
    expect(scan("expect(root.filters).toEqual([]);")).toBe(false);
  });

  it("comment-form decoys are ignored, code-form under a comment is not", () => {
    expect(scan("// unit.filters = was the old wart")).toBe(false);
    expect(scan("/* stage.filters = bypassed admit() */")).toBe(false);
    expect(scan("stage.filters = chain; // restored previous chain")).toBe(true);
  });
});
