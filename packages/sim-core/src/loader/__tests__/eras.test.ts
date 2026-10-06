/**
 * Era-availability resolution over the fixture pair (alpha 1996→, beta 2004→).
 */

import { describe, expect, test } from "vitest";
import { loadTypeBundle } from "../bundle";
import { bundlesLiveInEra, eraOverrideFor, resolveEraAvailability } from "../eras";
import { ALPHA, BETA, cloneJson, fixtureRaw } from "./helpers";

describe("resolveEraAvailability", () => {
  test("pre-introduction before availableFrom, available after", () => {
    const alpha = ALPHA();
    expect(resolveEraAvailability(alpha, 1990).status).toBe("pre-introduction");
    expect(resolveEraAvailability(alpha, 1996).status).toBe("available"); // inclusive lower bound
    expect(resolveEraAvailability(alpha, 2026).status).toBe("available"); // open-ended (obsoleteBy null)
  });

  test("obsolete from obsoleteBy (exclusive upper bound)", () => {
    const raw = cloneJson(fixtureRaw("minimal-beta.json"));
    raw.eras = { availableFrom: "2004", obsoleteBy: "2014", eraOverrides: {} };
    const beta = loadTypeBundle(raw);
    expect(resolveEraAvailability(beta, 2013).status).toBe("available");
    expect(resolveEraAvailability(beta, 2014).status).toBe("obsolete");
  });

  test("undocumented when availableFrom is null — never invents an era", () => {
    const raw = cloneJson(fixtureRaw("minimal-alpha.json"));
    raw.eras = { availableFrom: null, obsoleteBy: null, eraOverrides: {} };
    const bundle = loadTypeBundle(raw);
    expect(resolveEraAvailability(bundle, 2000).status).toBe("undocumented");
    expect(bundlesLiveInEra([bundle], 2000)).toEqual([]);
    expect(bundlesLiveInEra([bundle], 2000, { includeUndocumented: true })).toEqual([bundle.id]);
  });

  test("era roster lists sorted bundle ids per year", () => {
    const bundles = [ALPHA(), BETA()];
    expect(bundlesLiveInEra(bundles, 1999)).toEqual(["test:min-alpha"]);
    expect(bundlesLiveInEra(bundles, 2010)).toEqual(["test:min-alpha", "test:min-beta"]);
    expect(bundlesLiveInEra(bundles, 1980)).toEqual([]);
  });

  test("era overrides surface opaquely by key", () => {
    const alpha = ALPHA();
    const override = eraOverrideFor(alpha, "1999");
    expect(override?.["chrome"]).toBe("dial-up-beige");
    expect(override?.["visitorSpeedCapPct"]).toBe(56);
    expect(eraOverrideFor(alpha, "1984")).toBeUndefined();
  });

  test("negative / fractional era years fail fast", () => {
    expect(() => resolveEraAvailability(ALPHA(), -5)).toThrow(/OUT_OF_RANGE|non-negative/);
    expect(() => resolveEraAvailability(ALPHA(), 1999.5)).toThrow(/integer/);
  });
});
