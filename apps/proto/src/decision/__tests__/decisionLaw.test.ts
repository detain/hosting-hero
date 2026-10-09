/**
 * Decision-lane law pins (node env, fs scan — the filtersLaw/audioLaw family):
 *
 *  1. roster: decision/ ships EXACTLY the four v0 files (vacant dir = red);
 *  2. timer law: no setTimeout/setInterval/Date.now/animation frames — the
 *     rail breathes on projection frames, nothing else (§4.7 heartbeat law);
 *  3. terminal law: no runner/** imports — data enters only through the
 *     observed store (renderer-is-terminal, CONVENTIONS §1.2);
 *  4. budget law: no `new BudgetManager(` inside decision/ — the manager is
 *     injected (the ClockRibbon "chrome asks like the renderers do" pattern);
 *  5. hue law: DecisionRail's <style> uses era tokens + var(--hh-hue-*) from
 *     the ledger + the two allowlisted chrome neutrals — no invented hex;
 *  6. wiring pin: App.vue imports AND mounts <DecisionRail> (the additive
 *     seam; App.vue cannot be component-mounted in jsdom, so the mount point
 *     is pinned on source, repo convention);
 *  7. KLAXON census across the full rank ladder (tracker never preempts).
 *
 * Scanner self-probes (in-memory armed strings) keep each regex falsifiable.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { HUE_LEDGER } from "../../render/hues";
import { KLAXON_PRIORITY } from "../../render/budget";
import { priorityForRank } from "../tracker";

// vitest roots at apps/proto (chrome/lab law-test convention).
const DECISION_DIR = join(process.cwd(), "src", "decision");
const APP_VUE = join(process.cwd(), "src", "App.vue");

const NEUTRAL_ALLOWLIST: ReadonlySet<string> = new Set([
  "#d7e3ea", // chrome ink (shared with chrome/hueLaw.test.ts)
  "#05080c", // ScopeFace CRT black
]);

/** Newline-keeping comment strip (A1 family law, cf. substrateLaw/filtersLaw):
 *  docblocks legitimately NAME the banned idioms they avoid — the header of
 *  annotate.ts says "no timers, no Date.now"; scanning raw source would make
 *  honest documentation a false positive. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ""))
    .replace(/\/\/[^\n]*/g, "");
}

function laneSources(): string[] {
  const found: string[] = [];
  for (const name of readdirSync(DECISION_DIR)) {
    const full = join(DECISION_DIR, name);
    if (name === "__tests__") continue;
    if (statSync(full).isDirectory()) {
      for (const inner of readdirSync(full)) found.push(join(full, inner));
    } else found.push(full);
  }
  return found.filter((f) => /\.(ts|vue)$/.test(f)).sort();
}

function stripStyleBlocksToCss(source: string): string {
  return [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1] ?? "").join("\n");
}

function hexes(css: string): string[] {
  return (css.match(/#[0-9a-fA-F]{6}(?![0-9a-fA-F])/g) ?? []).map((h) => h.toLowerCase());
}

function hueVars(css: string): string[] {
  return [...css.matchAll(/var\(--hh-hue-([A-Za-z0-9-]+)\)/g)].map((m) => m[1] ?? "");
}

describe("decision roster", () => {
  it("ships exactly the four v0 files (the lane cannot silently vacate)", () => {
    expect(laneSources().map((f) => f.replace(`${DECISION_DIR}/`, ""))).toStrictEqual([
      "DecisionRail.vue",
      "annotate.ts",
      "index.ts",
      "tracker.ts",
    ]);
  });
});

describe("decision law scans", () => {
  const files = laneSources();

  it("timer-free: no setTimeout/setInterval/Date.now/raf in the lane", () => {
    const banned = /setTimeout|setInterval|Date\.now|requestAnimationFrame/;
    for (const file of files) {
      expect(banned.test(stripComments(readFileSync(file, "utf8"))), file).toBe(false);
    }
  });

  it("terminal-only: nothing in decision/ imports the runner", () => {
    const banned = /from\s+"[^"]*runner\//;
    for (const file of files) {
      expect(banned.test(stripComments(readFileSync(file, "utf8"))), file).toBe(false);
    }
  });

  it("budget arrives as a port — no BudgetManager constructed in the lane", () => {
    const banned = /new BudgetManager\(/;
    for (const file of files) {
      expect(banned.test(stripComments(readFileSync(file, "utf8"))), file).toBe(false);
    }
  });

  it("hue law: rail styles are era tokens + ledger vars + allowlisted neutrals", () => {
    const rail = readFileSync(join(DECISION_DIR, "DecisionRail.vue"), "utf8");
    const css = stripComments(stripStyleBlocksToCss(rail));
    for (const hex of hexes(css)) {
      expect(NEUTRAL_ALLOWLIST.has(hex), `spelled hex ${hex}`).toBe(true);
    }
    const ledger = new Set<string>(Object.keys(HUE_LEDGER));
    for (const hue of hueVars(css)) {
      expect(ledger.has(hue), `off-ledger var --hh-hue-${hue}`).toBe(true);
    }
    // the spec's white bracket + money gold must actually ride the ledger
    expect(hueVars(css)).toEqual(expect.arrayContaining(["white", "gold"]));
  });
});

describe("scanner self-probes (each law regex is falsifiable)", () => {
  it("armed decoys are caught", () => {
    expect(/setTimeout|Date\.now/.test("const t = Date.now();")).toBe(true);
    expect(stripComments("/* Date.now is banned */ const t = setInterval();").includes("setInterval")).toBe(true);
    expect(stripComments("// mention of setTimeout\nconst clean = 1;").includes("setTimeout")).toBe(false);
    expect(/from\s+"[^"]*runner\//.test('import x from "../../runner/mockSimRunner";')).toBe(true);
    expect(/new BudgetManager\(/.test("const b = new BudgetManager();")).toBe(true);
    expect(hexes("color: #ef6a5a;")).toStrictEqual(["#ef6a5a"]);
    expect(hueVars("var(--hh-hue-red-light)")).toStrictEqual(["red-light"]);
  });

  it("benign samples pass", () => {
    expect(hexes("color: #d7e3ea;")).toStrictEqual(["#d7e3ea"]);
    expect(hueVars("var(--hh-accent)")).toStrictEqual([]);
  });
});

describe("App.vue wiring pin (additive seam, source-scanned)", () => {
  const app = readFileSync(APP_VUE, "utf8");

  it("imports and mounts the rail exactly once", () => {
    expect(app).toMatch(/import DecisionRail from "\.\/decision\/DecisionRail\.vue"/);
    expect(app.match(/<DecisionRail\s*\/>/g)).toHaveLength(1);
  });
});

describe("KLAXON census", () => {
  it("the whole rank ladder stays non-preempting", () => {
    for (let rank = 0; rank < 100; rank++) {
      expect(priorityForRank(rank)).toBeLessThan(KLAXON_PRIORITY);
    }
  });
});
