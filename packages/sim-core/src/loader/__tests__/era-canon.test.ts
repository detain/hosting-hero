/**
 * ERA CANON gate — OD-22 option (c), ratified 2026-10-09b, landed by the
 * ADR-0018 program 1a build wave. The era axis is a CLOSED canon of exactly
 * {1998, 2008, 2016, 2026} (the §8.10 four-phase campaign plan: terminal
 * steel → glossy → flat → modern). Packs may author era years ONLY inside
 * that set; a fifth, unsanctioned rung is a data error at the content
 * boundary, not a feature.
 *
 * The canon is re-declared here, not imported: the sim-core ↔ proto
 * dependency direction is one-way (proto consumes sim-core), so the roster's
 * two homes — this file (data side) and apps/proto/src/i18n/eraState.ts
 * `ERA_YEARS` (shell side, whose eraState.test.ts pins the same four) — are
 * kept in lockstep BY their paired pins, the same double-declaration pattern
 * the loader's DECISION_ROOTS borrow from validate.mjs (closed sets
 * re-declared with the law source cited).
 *
 * Scope discipline: this file reads the packs as RAW JSON and polices ONLY
 * the era-year axis. Template shape, root vocabularies, slot laws and the
 * {eras, fallback} structure are loadI18nPack's law (packs.test.ts) — the
 * one file, one authority. Falsifiability rides an in-memory forged pack
 * (no disk plant): the same collector that passes the real corpus MUST
 * report 2031/2044 off the forged object.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// vitest roots at packages/sim-core (same law as real-content.test.ts).
const CONTENT = join(process.cwd(), "..", "content");

/** The ratified OD-22(c) canon, ascending. */
const ERA_CANON: readonly number[] = Object.freeze([1998, 2008, 2016, 2026]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Every era-year number this pack JSON names: the top-level eraCodes map
 *  plus every nested {eras: {...}} variant object, wherever it sits. Non-
 *  numeric keys are collected as NaN and reported (they CANNOT be canon). */
function collectEraYears(pack: unknown): number[] {
  const years: number[] = [];
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    if (!isRecord(node)) return;
    for (const [key, value] of Object.entries(node)) {
      if ((key === "eraCodes" || key === "eras") && isRecord(value)) {
        for (const yearKey of Object.keys(value)) {
          years.push(Number.parseInt(yearKey, 10));
        }
        // era bodies are plain prose — do not descend (nothing to find, no false scope)
        continue;
      }
      walk(value);
    }
  };
  walk(pack);
  return years;
}

function offCanonYears(pack: unknown): number[] {
  return [...new Set(collectEraYears(pack))].filter((y) => !ERA_CANON.includes(y)).sort((a, b) => a - b);
}

/** How many template keys in this pack actually carry a {eras, ...} variant
 *  object (decision + flavour namespaces). The year-axis census above can be
 *  satisfied by eraCodes alone; this count proves the pack SPEAKS the axis,
 *  not just declares it. Key identity/shape law stays in packs.test.ts —
 *  this file counts, never parses. */
function countEraVariantKeys(pack: unknown): number {
  if (!isRecord(pack)) return 0;
  let count = 0;
  for (const root of ["decision", "flavour"]) {
    const map = pack[root];
    if (!isRecord(map)) continue;
    for (const value of Object.values(map)) {
      if (isRecord(value) && "eras" in value) count += 1;
    }
  }
  return count;
}

const PACK_FILES: readonly string[] = readdirSync(join(CONTENT, "packs"))
  .filter((name) => name.endsWith(".i18n.json"))
  .sort();

function parsePack(name: string): unknown {
  return JSON.parse(readFileSync(join(CONTENT, "packs", name), "utf8")) as unknown;
}

describe("era canon — packs stay inside the ratified four-era axis (OD-22(c))", () => {
  it("the roster itself is exactly the ratified plan, ascending", () => {
    expect([...ERA_CANON]).toEqual([1998, 2008, 2016, 2026]);
  });

  it("the packs dir is scanned, not vacuous (anti-dead-gate)", () => {
    expect(PACK_FILES.length).toBeGreaterThanOrEqual(14);
    expect(PACK_FILES).toContain("shared-web.i18n.json");
  });

  it("EVERY shipped pack: eraCodes ∪ era-object years ⊆ {1998, 2008, 2016, 2026}", () => {
    for (const name of PACK_FILES) {
      const offenders = offCanonYears(parsePack(name));
      expect(offenders, `${name} authors era years outside the ratified canon`).toStrictEqual([]);
    }
  });

  it("at authoring time: ALL FOURTEEN packs speak the full four-rung canon — the era axis is corpus-wide, 42 variant keys deep", () => {
    // Census of the CURRENT copy axis — L-ER-B landed the quad-rung copy on
    // shared-web (4 era keys) and game (2); the L-ER-C..F fan waves then put
    // THREE era keys in every one of the twelve type packs (36) — 42 keys total.
    // The ⊆canon assertion above NEVER bends; only this census moves, and the
    // era-pin collector (L-ER-G) re-derives it from disk, pack by pack.
    const authored = PACK_FILES.map((name) => [name, [...new Set(collectEraYears(parsePack(name)))].sort((a, b) => a - b)] as const);
    for (const [name, years] of authored) {
      expect(years, name).toEqual([1998, 2008, 2016, 2026]);
    }
    // Year presence alone is cheap (eraCodes); the variant-key counts prove
    // every pack authors real era bodies. Re-derived from disk 2026-10-17.
    const counts = authored.map(([name]) => [name, countEraVariantKeys(parsePack(name))] as const);
    const EXPECTED: Record<string, number> = {
      "shared-web.i18n.json": 4, // slashdot, dev-left, cron, cold-aisle (all quad-rung)
      "game.i18n.json": 2, // griefed + quiet.naming (pack-unique flavour, quad-rung)
      "backup-archival.i18n.json": 3,
      "ci-build-farm.i18n.json": 3,
      "colo.i18n.json": 3,
      "dbaas.i18n.json": 3,
      "dedicated.i18n.json": 3,
      "dns-hosting.i18n.json": 3,
      "exchange-colo.i18n.json": 3,
      "mail-hosting.i18n.json": 3,
      "object-storage.i18n.json": 3,
      "observability.i18n.json": 3,
      "serverless.i18n.json": 3,
      "trunk-group-voip.i18n.json": 3,
    };
    for (const [name, count] of counts) {
      expect(count, name).toBe(EXPECTED[name]);
    }
    expect(counts.reduce((n, [, c]) => n + c, 0)).toBe(42);
  });

  it("ARMED in-memory probe: a forged pack naming 2031/2044 IS reddened", () => {
    const forged = {
      packId: "forged",
      eraCodes: { "1998": "legal", "2031": "unsanctioned fifth rung" },
      decision: {
        ticket: {
          "forged.key": { eras: { "2026": "legal", "2044": "unsanctioned" }, fallback: "x" },
        },
      },
    };
    // the legal years are collected too — proving the walk reaches both seams:
    expect([...new Set(collectEraYears(forged))].sort((a, b) => a - b)).toEqual([1998, 2026, 2031, 2044]);
    expect(offCanonYears(forged)).toEqual([2031, 2044]);
    // and the real corpus stays clean beside it (the probe is not a tautology):
    expect(offCanonYears(parsePack("shared-web.i18n.json"))).toEqual([]);
  });
});
