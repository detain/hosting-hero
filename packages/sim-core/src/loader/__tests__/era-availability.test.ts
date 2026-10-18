/**
 * era-availability.test.ts — L-EM (ADR-0019 program 4): the per-tech leg of
 * the §0.4 grid. `resolveTechAvailability` is the SINGLE resolution
 * authority: row → its window; absent → the bundle-level dates gate the
 * whole line; neither dated it → "undocumented" = neither grant nor deny.
 * The four statuses mirror resolveEraAvailability VERBATIM — including the
 * exclusive `to` bound ([from, to)) and the null-start-never-invents rule.
 *
 * The parse wall is pinned falsifiably: a bad year shape, an unknown field
 * inside a row, and the absent-key default (frozen `{}` — every shipped
 * bundle rides it today; R66 dates ZERO new content beyond the colo row).
 *
 * Real-corpus probes read the disk: shared-web ships NO availability file
 * (its availableFrom:"2009" fallback ALONE is the §0.4 exemplar); colo's one
 * grounded row ("cross-connect-faucet", from 2001 — derived from the dated
 * line L-DATES landed @f5faced) resolves through the row path.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadTypeBundle } from "../bundle";
import { resolveEraAvailability, resolveTechAvailability } from "../eras";
import { ALPHA, cloneJson, fixtureRaw } from "./helpers";

// vitest roots at packages/sim-core (era-dating.test.ts law).
const CONTENT = join(process.cwd(), "..", "content");

function readTypeWire(name: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(CONTENT, "types", `${name}.json`), "utf8")) as Record<string, unknown>;
}

/** ALPHA forged with eras.availability rows (in-memory only — R66: no test
 *  plant ever lands on the content disk). */
function forgedAlpha(rows: Record<string, Record<string, unknown>>): ReturnType<typeof loadTypeBundle> {
  const raw = cloneJson(fixtureRaw("minimal-alpha.json"));
  (raw.eras as Record<string, unknown>).availability = rows;
  return loadTypeBundle(raw);
}

describe("resolveTechAvailability — the row path", () => {
  const bundle = forgedAlpha({
    "faucet-new": { from: "2001" },
    "modem-bank": { from: "1994", to: "2008" },
    "undated-thing": { to: "2008" },
    "pure-dressing": {},
  });

  it("from-window mirrors the bundle law: [from, ∞) available, < from pre-introduction", () => {
    expect(resolveTechAvailability(bundle, "faucet-new", 1998)).toMatchObject({
      status: "pre-introduction",
      source: "row",
      availableFrom: "2001",
      obsoleteBy: null,
    });
    expect(resolveTechAvailability(bundle, "faucet-new", 2001).status).toBe("available"); // inclusive lower bound
    expect(resolveTechAvailability(bundle, "faucet-new", 2026).status).toBe("available");
  });

  it("to-window retires at the EXCLUSIVE end (the §1.6 modem-bank leg)", () => {
    expect(resolveTechAvailability(bundle, "modem-bank", 2007).status).toBe("available");
    expect(resolveTechAvailability(bundle, "modem-bank", 2008)).toMatchObject({
      status: "obsolete",
      source: "row",
      obsoleteBy: "2008",
    });
    expect(resolveTechAvailability(bundle, "modem-bank", 2026).status).toBe("obsolete");
  });

  it("an undated START never invents an introduction: undocumented, neither grant nor deny", () => {
    // The from-less row is read EXACTLY like a null availableFrom is read by
    // resolveEraAvailability — the check runs BEFORE the to-window, so even
    // a retirement leg cannot deny an era without a dated introduction.
    const verdict = resolveTechAvailability(bundle, "undated-thing", 2016);
    expect(verdict.status).toBe("undocumented");
    expect(verdict.source).toBe("row");
    expect(verdict.availableFrom).toBeNull();
  });

  it("a row with no dates at all is set-dressing: undocumented (and the row is still the source)", () => {
    expect(resolveTechAvailability(bundle, "pure-dressing", 1998)).toMatchObject({
      status: "undocumented",
      source: "row",
    });
  });

  it("results are frozen (deep-frozen loaded state rides the verdict)", () => {
    const verdict = resolveTechAvailability(bundle, "faucet-new", 1998);
    expect(Object.isFrozen(verdict)).toBe(true);
  });
});

describe("resolveTechAvailability — the bundle-level fallback", () => {
  it("no row: the line's OWN date gates whatever tech id is asked (never-invents lives in the composer, not the resolver)", () => {
    const alpha = ALPHA(); // availableFrom 1996, no availability block → {}
    expect(alpha.eras.availability).toEqual({});
    for (const techId of ["comb-gantry", "anything-at-all"]) {
      expect(resolveTechAvailability(alpha, techId, 1990)).toMatchObject({
        status: "pre-introduction",
        source: "bundle",
        availableFrom: "1996",
        techId,
      });
      expect(resolveTechAvailability(alpha, techId, 2020).status).toBe("available");
    }
  });

  it("an UNDOCUMENTED bundle stays undocumented for every tech — no era is ever invented", () => {
    const raw = cloneJson(fixtureRaw("minimal-alpha.json"));
    raw.eras = { availableFrom: null, obsoleteBy: null, eraOverrides: {} };
    const bundle = loadTypeBundle(raw);
    expect(resolveTechAvailability(bundle, "comb-gantry", 1998)).toMatchObject({
      status: "undocumented",
      source: "undocumented",
    });
  });

  it("a bundle-level obsolescence retires the whole line", () => {
    const raw = cloneJson(fixtureRaw("minimal-alpha.json"));
    raw.eras = { availableFrom: "1996", obsoleteBy: "2008", eraOverrides: {} };
    const bundle = loadTypeBundle(raw);
    expect(resolveEraAvailability(bundle, 2010).status).toBe("obsolete");
    expect(resolveTechAvailability(bundle, "comb-gantry", 2010)).toMatchObject({
      status: "obsolete",
      source: "bundle",
      obsoleteBy: "2008",
    });
  });
});

describe("resolveTechAvailability — input wall (fail fast, descriptive)", () => {
  const alpha = ALPHA();
  it("rejects a non-integer or negative era year with OUT_OF_RANGE", () => {
    expect(() => resolveTechAvailability(alpha, "comb-gantry", 19.5)).toThrow(/eraYear/);
    expect(() => resolveTechAvailability(alpha, "comb-gantry", -1)).toThrow(/eraYear/);
  });
  it("rejects an empty tech id with WRONG_TYPE", () => {
    expect(() => resolveTechAvailability(alpha, "", 1998)).toThrow(/techId/);
  });
});

describe("the availability parse wall (loader/bundle.ts ERAS_PLAN)", () => {
  it("a malformed year leg is refused at the boundary", () => {
    for (const bad of ["20", "19988", "abcd"]) {
      const raw = cloneJson(fixtureRaw("minimal-alpha.json"));
      (raw.eras as Record<string, unknown>).availability = { "x-tech": { from: bad } };
      expect(() => loadTypeBundle(raw), bad).toThrow(/4-digit era year/);
    }
  });
  it("an unknown field inside a row fails UNKNOWN_FIELD (parseObject wall)", () => {
    const raw = cloneJson(fixtureRaw("minimal-alpha.json"));
    (raw.eras as Record<string, unknown>).availability = { "x-tech": { since: "1998" } };
    expect(() => loadTypeBundle(raw)).toThrow(/UNKNOWN_FIELD|not declared/);
  });
  it("row keys sort code-unit and _todo is stripped from loaded state", () => {
    const bundle = forgedAlpha({
      "z-tech": { from: "2001", _todo: "cite me" },
      "a-tech": { to: "2008" },
    });
    expect(Object.keys(bundle.eras.availability)).toEqual(["a-tech", "z-tech"]);
    expect(bundle.eras.availability["z-tech"]).toEqual({ from: "2001", to: null });
    expect(Object.isFrozen(bundle.eras.availability)).toBe(true);
    expect(Object.isFrozen(bundle.eras.availability["z-tech"])).toBe(true);
  });
});

describe("the shipped corpus (R66 zero-new-dates law)", () => {
  it("shared-web ships NO availability file — the dated LINE alone is the §0.4 exemplar", () => {
    const bundle = loadTypeBundle(readTypeWire("shared-web"));
    expect(bundle.eras.availability).toEqual({});
    expect(bundle.eras.availableFrom).toBe("2009");
    // Fallback exemplar: a 1998 run refuses the cPanel-era line…
    expect(resolveTechAvailability(bundle, "shared-web", 1998)).toMatchObject({
      status: "pre-introduction",
      source: "bundle",
      availableFrom: "2009",
    });
    // …and the 2026 run lets the whole line live.
    expect(resolveTechAvailability(bundle, "shared-web", 2026).status).toBe("available");
    expect(resolveTechAvailability(bundle, "status-page", 1998).status).toBe("pre-introduction");
  });

  it("colo carries EXACTLY one grounded row: cross-connect-faucet from the dated line", () => {
    const bundle = loadTypeBundle(readTypeWire("colo"));
    expect(bundle.eras.availableFrom).toBe("2001");
    expect(Object.keys(bundle.eras.availability)).toEqual(["cross-connect-faucet"]);
    const row = bundle.eras.availability["cross-connect-faucet"];
    expect(row).toEqual({ from: "2001", to: null });
    expect(resolveTechAvailability(bundle, "cross-connect-faucet", 2000)).toMatchObject({
      status: "pre-introduction",
      source: "row",
      availableFrom: "2001",
    });
    expect(resolveTechAvailability(bundle, "cross-connect-faucet", 2001).status).toBe("available");
  });

  it("no shipped bundle carries a retirement (`to`) leg — obsolete machinery stays fixture-only", () => {
    for (const name of ["backup-archival", "ci-build-farm", "colo", "dbaas", "dedicated", "dns-hosting",
      "exchange-colo", "game-servers", "mail-hosting", "object-storage", "observability", "serverless",
      "shared-web", "trunk-group-voip"]) {
      const bundle = loadTypeBundle(readTypeWire(name));
      for (const [techId, window] of Object.entries(bundle.eras.availability)) {
        expect(window.to, `${name}.${techId}`).toBeNull();
      }
    }
  });
});
