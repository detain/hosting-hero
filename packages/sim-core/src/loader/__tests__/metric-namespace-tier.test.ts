/**
 * metricNamespaceTier — the ratified FUTURE bundle field, now shipped
 * (OD-4b residual: ADR-0009 §1 4b made it law; ADR-0014 #D9 queued the
 * schema + loader parse + lint fold into this lane).
 *
 * Laws pinned here:
 *  1. ABSENT BY DEFAULT — no shipped bundle nor fixture carries the key, and
 *     loaded state omits it (byte-identity vs pre-D9 parses; determinism
 *     corpus findings=[] must not move).
 *  2. CLOSED ENUM — the rungs ARE the ratified §1.7 telegraph band ladder
 *     (weather | storm | hunter | entropy); off-ladder fails loud BAD_ENUM.
 *  3. DRIFT PINS — bundle.ts's private METRIC_NAMESPACE_TIERS mirror,
 *     wavestruct.ts WAVE_BAND_VOCAB, and the engine authority
 *     waves/bands.ts TELEGRAPH_BANDS can never silently diverge
 *     (source-read pattern, per the elasticity PRICE_KEY_KINDS precedent).
 *
 * LINT LEG RULING (ADR-0014 #D9 "lint fold"): none ships — the tier→namespace
 * membership map is the future WS-3/WS-6 authoring contract (no on-disk data
 * associates metric ids with bands), so any bundle-level cross-check would
 * invent semantics the ratification does not carry. Boundary parse is the
 * honest fence.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { loadTypeBundle, stableSerialize, type LoadedTypeBundle } from "../bundle";
import { LoaderError } from "../boundary";
import { WAVE_BAND_VOCAB } from "../wavestruct";
import { fixtureRaw } from "./helpers";

function alphaWith(tier: unknown): LoadedTypeBundle {
  const raw = fixtureRaw("minimal-alpha.json");
  raw["metricNamespaceTier"] = tier;
  return loadTypeBundle(raw);
}

describe("metricNamespaceTier — absent in every shipped doc (byte-identity law)", () => {
  test("fixtures omit the key entirely", () => {
    for (const name of ["minimal-alpha.json", "minimal-beta.json"]) {
      const loaded = loadTypeBundle(fixtureRaw(name));
      expect(Object.prototype.hasOwnProperty.call(loaded, "metricNamespaceTier")).toBe(false);
    }
  });

  test("stable serialization never speaks the key while it is absent", () => {
    const serialized = stableSerialize(loadTypeBundle(fixtureRaw("minimal-alpha.json")));
    expect(serialized.includes("metricNamespaceTier")).toBe(false);
  });

  test("all thirteen shipped bundles on disk are pre-D9 — zero author the field", () => {
    const typesDir = join(process.cwd(), "..", "content", "types");
    const ids = [
      "backup-archival",
      "colo",
      "dbaas",
      "dedicated",
      "dns-hosting",
      "exchange-colo",
      "game-servers",
      "mail-hosting",
      "object-storage",
      "observability",
      "serverless",
      "shared-web",
      "trunk-group-voip",
    ];
    for (const id of ids) {
      const raw = JSON.parse(readFileSync(join(typesDir, `${id}.json`), "utf8")) as Record<string, unknown>;
      expect("metricNamespaceTier" in raw, `${id} must not author the field yet`).toBe(false);
    }
  });
});

describe("metricNamespaceTier — closed enum at the boundary (parse, don't validate)", () => {
  test("each ratified band rung parses verbatim and rides the frozen bundle", () => {
    for (const rung of WAVE_BAND_VOCAB) {
      const loaded = alphaWith(rung);
      expect(loaded.metricNamespaceTier).toBe(rung);
      expect(Object.isFrozen(loaded)).toBe(true);
    }
  });

  test("off-ladder rung fails loud BAD_ENUM naming the path and the vocabulary", () => {
    const err = (() => {
      try {
        alphaWith("forecast");
      } catch (e) {
        return e as LoaderError;
      }
      throw new Error("expected a LoaderError");
    })();
    expect(err.code).toBe("BAD_ENUM");
    expect(err.path).toBe("metricNamespaceTier");
    expect(err.message).toMatch(/weather, storm, hunter, entropy/);
  });

  test("wrong wire types fail loud WRONG_TYPE (arrays, numbers, objects, null)", () => {
    for (const value of [7, ["weather"], { tier: "storm" }, null]) {
      const err = (() => {
        try {
          alphaWith(value);
        } catch (e) {
          return e as LoaderError;
        }
        throw new Error("expected a LoaderError");
      })();
      expect(err.code, `value ${JSON.stringify(value)}`).toBe("WRONG_TYPE");
      expect(err.path).toBe("metricNamespaceTier");
    }
  });

  test("the UNKNOWN_FIELD wall is NOT weakened — near-miss siblings still refuse", () => {
    const raw = fixtureRaw("minimal-alpha.json");
    raw["metricNamespaceTiers"] = ["weather"];
    expect(() => loadTypeBundle(raw)).toThrow(/UNKNOWN_FIELD.*metricNamespaceTiers/);
  });
});

describe("metricNamespaceTier — drift pins across the three band literals", () => {
  const rungsOf = (source: string, marker: string): string[] => {
    const at = source.indexOf(marker);
    expect(at, marker).toBeGreaterThan(-1);
    // anchor past the '=' — '[' inside a type annotation (readonly
    // TelegraphBand[]) must not be mistaken for the array literal.
    const open = source.indexOf("[", source.indexOf("=", at));
    const bracket = source.slice(open, source.indexOf("]", open));
    return [...bracket.matchAll(/"([^"]+)"/g)].map((m) => m[1] as string);
  };

  test("bundle.ts private mirror === wavestruct WAVE_BAND_VOCAB", () => {
    const mirror = rungsOf(
      readFileSync(join(process.cwd(), "src", "loader", "bundle.ts"), "utf8"),
      "const METRIC_NAMESPACE_TIERS",
    );
    expect(mirror).toEqual([...WAVE_BAND_VOCAB]);
  });

  test("engine authority waves/bands.ts TELEGRAPH_BANDS === the same ladder", () => {
    const bands = rungsOf(
      readFileSync(join(process.cwd(), "src", "waves", "bands.ts"), "utf8"),
      "export const TELEGRAPH_BANDS",
    );
    expect(bands).toEqual([...WAVE_BAND_VOCAB]);
  });
});
