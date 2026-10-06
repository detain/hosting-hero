/**
 * Load-determinism gate: the SAME wire JSON loaded 100× must produce
 * byte-identical stable serializations (plan-ordered keys, bigint-exact
 * values) — and the linter over it must be equally reproducible.
 * (Replay-grade canonical hashing belongs to src/replay; this proves the
 * LOADER itself adds no entropy: no iteration-order luck, no float drift.)
 *
 * Two arms: the crafted fixture twins, and the REAL shipped corpus in
 * packages/content (both type-bundles + both registries + every wave doc), so
 * the gate covers the bytes that actually ship — not only the happy shapes.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { loadTypeBundle, stableSerialize } from "../bundle";
import { lintRulesetCorpus, type RulesetCorpus } from "../lint";
import { parseThreatRegistry, parseVisitorArchetypeRegistry } from "../registries";
import { FIXTURES, miniCorpus, readFixture } from "./helpers";

const RUNS = 100;
const CONTENT = join(process.cwd(), "..", "content");

describe("loader determinism ×100", () => {
  for (const name of ["minimal-alpha.json", "minimal-beta.json"]) {
    test(`${name}: 100 loads serialize identically`, () => {
      const raw = readFixture(name);
      const first = stableSerialize(loadTypeBundle(raw));
      for (let run = 1; run < RUNS; run += 1) {
        // re-parse the wire JSON each round: parse-order must not leak through
        const reparsed = JSON.parse(
          JSON.stringify(raw, (_k, v: unknown) => (typeof v === "bigint" ? String(v) : v)),
        ) as unknown;
        expect(stableSerialize(loadTypeBundle(reparsed))).toBe(first);
      }
      expect(first.length).toBeGreaterThan(1000); // sanity: real payload
    });
  }

  test("stableSerialize is bigint-safe and rejects escaped floats", () => {
    expect(stableSerialize({ a: [1n, "x", true, null, 42] })).toBe(
      '{"a":[1n,"x",true,null,42]}',
    );
    expect(() => stableSerialize(0.5)).toThrow(/float escaped/);
  });

  test("lint verdict identical across 100 fresh corpus builds", () => {
    const baseline = stableSerialize(lintRulesetCorpus(miniCorpus()));
    for (let run = 0; run < RUNS; run += 1) {
      expect(stableSerialize(lintRulesetCorpus(miniCorpus()))).toBe(baseline);
    }
    expect(baseline).toContain('"pass":true');
  });

  test("fixture files exist at expected cwd-relative paths (vitest runs from packages/sim-core)", () => {
    expect(FIXTURES).toMatch(/src\/loader\/__tests__\/fixtures$/);
  });
});

/* ───────────────────────── the shipped corpus arm ───────────────────────── */

/** Wire text captured once; every round re-parses it from scratch. */
interface CorpusTexts {
  readonly types: readonly string[];
  readonly threats: string;
  readonly visitors: string;
  readonly waves: readonly (readonly [string, string])[];
}

function readContent(...parts: string[]): string {
  return readFileSync(join(CONTENT, ...parts), "utf8");
}

function shippedCorpusTexts(): CorpusTexts {
  const types = readdirSync(join(CONTENT, "types"))
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => readContent("types", name));
  const waves = readdirSync(join(CONTENT, "waves"))
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => [`waves/${name}`, readContent("waves", name)] as const);
  return {
    types,
    threats: readContent("threats", "registry-core.json"),
    visitors: readContent("visitors", "archetypes-core.json"),
    waves,
  };
}

function reloadCorpus(texts: CorpusTexts): RulesetCorpus {
  return {
    bundles: texts.types.map((text) => loadTypeBundle(JSON.parse(text) as unknown)),
    threats: parseThreatRegistry(JSON.parse(texts.threats) as unknown),
    visitors: parseVisitorArchetypeRegistry(JSON.parse(texts.visitors) as unknown),
    waves: new Map(texts.waves.map(([key, text]) => [key, JSON.parse(text) as unknown])),
  };
}

describe("shipped packages/content determinism ×100", () => {
  const texts = shippedCorpusTexts();

  test("both shipped type-bundles + both registries load identically 100×", () => {
    expect(texts.types.length).toBe(2);
    const first = reloadCorpus(texts);
    const firstSerialized = first.bundles.map((bundle) => stableSerialize(bundle));
    expect(firstSerialized.every((line) => line.length > 1000)).toBe(true);
    expect(stableSerialize(first.threats)).toBe(stableSerialize(reloadCorpus(texts).threats));
    expect(stableSerialize(first.visitors)).toBe(stableSerialize(reloadCorpus(texts).visitors));
    for (let run = 1; run < RUNS; run += 1) {
      const again = reloadCorpus(texts);
      again.bundles.forEach((bundle, index) => {
        expect(stableSerialize(bundle)).toBe(firstSerialized[index]);
      });
    }
  });

  test("registry indexes are stable and non-trivial across reloads", () => {
    const first = reloadCorpus(texts);
    expect(first.threats.threatCount).toBeGreaterThan(0);
    expect(first.visitors.archetypeCount).toBeGreaterThan(0);
    for (let run = 1; run < RUNS; run += 1) {
      const again = reloadCorpus(texts);
      expect(stableSerialize(again.threats)).toBe(stableSerialize(first.threats));
      expect(stableSerialize(again.visitors)).toBe(stableSerialize(first.visitors));
    }
  });

  test("real-corpus lint verdict identical across 100 fresh builds, and it passes", () => {
    const baseline = stableSerialize(lintRulesetCorpus(reloadCorpus(texts)));
    for (let run = 1; run < RUNS; run += 1) {
      expect(stableSerialize(lintRulesetCorpus(reloadCorpus(texts)))).toBe(baseline);
    }
    expect(baseline).toContain('"pass":true');
    expect(baseline).toContain('"findings":[]');
  });
});
