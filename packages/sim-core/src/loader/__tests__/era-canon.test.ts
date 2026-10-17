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

  it("at authoring time: shared-web carries the demo pair {1998, 2026}; all other packs carry zero era years", () => {
    // Census of the CURRENT copy axis — the 2008/2016 copy rungs land with the
    // campaign content wave (L-ER-B/C). When that wave adds them, RE-PIN this
    // row honestly; do not widen the canon to make it pass.
    const authored = PACK_FILES.map((name) => [name, [...new Set(collectEraYears(parsePack(name)))].sort((a, b) => a - b)] as const);
    for (const [name, years] of authored) {
      if (name === "shared-web.i18n.json") {
        expect(years, name).toEqual([1998, 2026]);
      } else {
        expect(years, name).toEqual([]);
      }
    }
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
