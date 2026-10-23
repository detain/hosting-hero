/**
 * progression law scan — the house disciplines this lane promised:
 * exact file roster, zero timers / RNG / clock reads in any projection,
 * zero raw hex colors (hue-ledger vars and era tokens only), import
 * direction (the unlocks library arrives ONLY through unlockModel, and
 * epilogueModel keeps @hh/sim-core type-only), and the barrel's census.
 * Node env, fs-walked from process.cwd() (apps/proto), the g2/chrome
 * stub pattern reused — no new ambient declarations.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SRC_DIR = join(process.cwd(), "src", "progression");

const SOURCE_FILES = [
  "unlockModel.ts",
  "UnlockLedger.vue",
  "epilogueModel.ts",
  "EpilogueCard.vue",
  "index.ts",
] as const;

function source(file: string): string {
  return readFileSync(join(SRC_DIR, file), "utf8");
}

function stripComments(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

describe("progression roster law", () => {
  it("ships exactly the five declared source files", () => {
    const present = SOURCE_FILES.filter((file) => {
      try {
        readFileSync(join(SRC_DIR, file), "utf8");
        return true;
      } catch {
        return false;
      }
    });
    expect(present).toEqual([...SOURCE_FILES]);
  });
});

describe("progression determinism law", () => {
  it("no projection or component touches timers, RNG or the wall clock", () => {
    const forbidden = /\bsetInterval\(|\bsetTimeout\(|\brequestAnimationFrame\(|\bMath\.random\b|\bnew Date\(/;
    for (const file of SOURCE_FILES) {
      const code = stripComments(source(file));
      expect(forbidden.test(code), `${file} must be timer-free`).toBe(false);
    }
  });
});

describe("progression color law", () => {
  it("carries zero raw hex colors — hue-ledger and era tokens only", () => {
    const hex = /#[0-9a-fA-F]{3,8}\b/;
    for (const file of SOURCE_FILES) {
      expect(hex.test(source(file)), `${file} must not spell hexes`).toBe(false);
    }
  });

  it("every colored declaration in the cards names a --hh token", () => {
    for (const file of ["UnlockLedger.vue", "EpilogueCard.vue"]) {
      const styleBlock = source(file).replace(/^[\s\S]*?<style scoped>/, "").replace(/<\/style>[\s\S]*$/, "");
      const colored = styleBlock
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => /^\s*(color|background|border[\w-]*(-color)?|fill|stroke)\s*:/.test(line))
        .filter((line) => !/\b(none|transparent|currentColor|inherit)\b/.test(line));
      for (const line of colored) {
        expect(line, `${file}: ${line}`).toContain("var(--hh-");
      }
    }
  });
});

describe("progression import-direction law", () => {
  it("the unlocks library enters apps/proto only through unlockModel", () => {
    expect(stripComments(source("unlockModel.ts"))).toContain('"@hh/sim-core/unlocks"');
    for (const file of SOURCE_FILES.filter((name) => name !== "unlockModel.ts")) {
      expect(stripComments(source(file)), `${file} must stay unlocks-free`).not.toContain(
        "@hh/sim-core/unlocks",
      );
    }
  });

  it("epilogueModel keeps @hh/sim-core type-only — zero runtime engine calls", () => {
    const code = stripComments(source("epilogueModel.ts"));
    for (const line of code.split("\n")) {
      if (line.includes("@hh/sim-core")) {
        expect(line.trim(), `runtime import in epilogueModel: ${line}`).toMatch(/^import type\b/);
      }
    }
  });

  it("no progression file reaches into stores, runners or the registry", () => {
    for (const file of SOURCE_FILES) {
      const code = stripComments(source(file));
      expect(code, `${file} must not import stores`).not.toMatch(/\.\.\/state\//);
      expect(code, `${file} must not import runners`).not.toMatch(/\.\.\/runner\//);
      expect(code, `${file} must not import the explain registry`).not.toContain("explainRegistry");
    }
  });

  it("cross-package paths stay at the package subpath — no deep relatives", () => {
    for (const file of SOURCE_FILES) {
      expect(source(file)).not.toMatch(/\.\.\/\.\.\/\.\.\/packages/);
    }
  });
});

describe("progression barrel law", () => {
  it("index.ts re-exports both builders and both components", () => {
    const barrel = stripComments(source("index.ts"));
    for (const name of ["buildUnlockLedger", "UnlockLedger", "buildEpilogueView", "EpilogueCard"]) {
      expect(barrel).toContain(name);
    }
  });
});
