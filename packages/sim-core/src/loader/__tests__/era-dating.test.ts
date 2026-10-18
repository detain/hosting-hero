/**
 * ERA-DATING gate — the ADR-0019 program 8 dating table and its resolver
 * coherence law. This file is the REAL consumer of loader/eras.ts over the
 * shipped corpus: before it, resolveEraAvailability had only crafted-fixture
 * units (eras.test.ts) and one roster pin (real-content.test.ts); here the
 * machinery walks all fourteen bundles against the ratified canon {1998,
 * 2008, 2016, 2026} (OD-22(c), era-canon.test.ts) and pins what the doc
 * actually dates.
 *
 * Three laws, each falsifiable:
 *
 * 1. ANTI-FORGERY (R66 machine gate). A bundle may carry a non-null
 *    availableFrom ONLY if its eras._todo quotes hosting_game.md and that
 *    quote is present VERBATIM (whitespace-normalized — the doc hard-wraps)
 *    in the doc on disk. Today exactly two lines are dated: colo 2001 and
 *    shared-web 2009, both from the §0.4 grid sentence (:653). Re-grading the
 *    doc's grid or the quotes reddens here, never silently.
 *
 * 2. COHERENCE (the negative direction). Where a pack's era copy DECLARED the
 *    line absent in a canon rung ("pre-era", "nothing on this shelf", "not a
 *    tier you buy"), the resolver must never return "available" for that
 *    rung. Each declaration carries a verbatim cite checked against the pack
 *    on disk — if the copy stops saying it, the pin fails and forces
 *    re-adjudication instead of drifting.
 *
 * 3. SPEAKING IS NOT GRANTING (the 2026 ≡ fallback boundary). Copy that
 *    SPEAKS a rung (shared-web's living 1998 voice) does not force
 *    availability, and absence-of-grant is honest: undated lines stay
 *    "undocumented" — never granted, never denied — unless declared absent.
 *    Only direction 2 binds; this file pins that asymmetry with a witness.
 *
 * Falsifiability rides in-memory forgeries (era-canon.test.ts precedent —
 * no disk plants): a forged "1998" shelf date must light the coherence law
 * up; a forged "2010" must leave it silent; a cite that exists nowhere must
 * fail the cite check. Era never touches GameState/wire/digests (ADR-0018
 * 1a) — this gate reads content JSON and the spec doc, nothing else.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadTypeBundle, type LoadedTypeBundle } from "../bundle";
import { bundlesLiveInEra, resolveEraAvailability } from "../eras";

// vitest roots at packages/sim-core (same law as real-content.test.ts).
const CONTENT = join(process.cwd(), "..", "content");
const DOC_PATH = join(process.cwd(), "..", "..", "hosting_game.md");

/** The ratified OD-22(c) canon — same closed set era-canon.test.ts polices. */
const ERA_CANON = [1998, 2008, 2016, 2026] as const;

/** Markdown hard-wrapping splits doc sentences across lines; a verbatim
 *  quote check must normalize whitespace runs to single spaces. Both sides
 *  of every comparison below go through this. */
function normalize(text: string): string {
  return text.replace(/\s+/g, " ");
}

const DOC_TEXT = normalize(readFileSync(DOC_PATH, "utf8"));

function readTypeWire(name: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(CONTENT, "types", `${name}.json`), "utf8")) as Record<string, unknown>;
}

const BUNDLE_NAMES = [
  "backup-archival",
  "ci-build-farm",
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

const WIRES = new Map(BUNDLE_NAMES.map((n) => [n, readTypeWire(n)]));
const BUNDLES: readonly LoadedTypeBundle[] = BUNDLE_NAMES.map((n) => loadTypeBundle(WIRES.get(n)));
const BUNDLE_IDS = BUNDLES.map((b) => b.id);
const bundleWireEras = (bundle: LoadedTypeBundle): { availableFrom: string | null; obsoleteBy: string | null; _todo?: unknown } =>
  (WIRES.get(bundle.id.replace("official:", "")) as { eras: { availableFrom: string | null; obsoleteBy: string | null; _todo?: unknown } }).eras;

/** i18n pack file backing a bundle id (game-servers' pack kept the historic
 *  short name game.i18n.json — same pairing the proto packStore uses). */
function packEraCodes(bundleId: string): Record<string, string> {
  const slug = bundleId.replace("official:", "");
  const packName = slug === "game-servers" ? "game" : slug;
  const pack = JSON.parse(readFileSync(join(CONTENT, "packs", `${packName}.i18n.json`), "utf8")) as { eraCodes?: Record<string, string> };
  return pack.eraCodes ?? {};
}

/* ───────────────────────── 1. the dating table ───────────────────────── */

describe("era dating table (ADR-0019 program 8)", () => {
  it("exactly two lines carry shelf dates; the other twelve stay undocumented", () => {
    const dated = BUNDLES.filter((b) => b.eras.availableFrom !== null).map((b) => [b.id, b.eras.availableFrom] as const);
    expect(dated).toEqual([
      ["official:colo", "2001"],
      ["official:shared-web", "2009"],
    ]);
    expect(BUNDLE_IDS.filter((id) => !["official:colo", "official:shared-web"].includes(id))).toHaveLength(12);
  });

  it("every dated bundle's _todo carries the pinned grid cite and the cite is verbatim in the doc", () => {
    // The census test above pins the EXACT set of dated lines, so a new date
    // cannot ride without updating this map — and an updated map must name a
    // phrase the doc actually contains (R66: sketch-grading allowed, forging
    // forbidden; the §0.4 grid sentence :653 is the sole shelf-date authority).
    const SHELF_CITES: Readonly<Record<string, string>> = {
      "official:colo": "2001 dot-com colo",
      "official:shared-web": "2009 shared-hosting-and-cPanel",
    };
    for (const bundle of BUNDLES) {
      if (bundle.eras.availableFrom === null) continue;
      const cite = SHELF_CITES[bundle.id];
      if (cite === undefined) throw new Error(`${bundle.id}: dated bundle has no pinned shelf cite — add the grid phrase HERE, and it must exist verbatim in the doc`);
      expect(bundle.eras.availableFrom, `${bundle.id}: shelf date must name the year the pinned cite carries`).toContain(cite.slice(0, 4));
      const todo = bundleWireEras(bundle)._todo;
      expect(typeof todo, `${bundle.id}: dated bundles must carry an _todo provenance string`).toBe("string");
      expect(todo as string, `${bundle.id}: _todo must carry its shelf cite verbatim`).toContain(cite);
      expect(DOC_TEXT, `${bundle.id}: shelf cite '${cite}' must exist verbatim in hosting_game.md (anti-forgery)`).toContain(normalize(cite));
    }
  });

  it("the two grid cells the dating pass graded stand verbatim in §0.4", () => {
    // colo 2001 and shared-web 2009 both hang on this one sentence (:653).
    expect(DOC_TEXT).toContain("2001 dot-com colo");
    expect(DOC_TEXT).toContain("2009 shared-hosting-and-cPanel");
    // Known doc-internal divergence, recorded not resolved (§9.1 retells
    // shared hosting at 2003; the grid remains the shelf authority). If the
    // owner ever harmonizes the prose, THIS pin is where the re-read starts.
    expect(DOC_TEXT).toContain("shared hosting (2003)");
  });
});

/* ───────────────────────── 2. resolver walk over the canon ───────────────────────── */

const UNDATED_TWELVE = [
  "official:backup-archival",
  "official:ci-build-farm",
  "official:dbaas",
  "official:dedicated",
  "official:dns-hosting",
  "official:exchange-colo",
  "official:game-servers",
  "official:mail-hosting",
  "official:object-storage",
  "official:observability",
  "official:serverless",
  "official:trunk-group-voip",
];

describe("resolver walk over the ratified rungs", () => {
  it("1998 grants nothing: both dated lines are pre-introduction, the twelve are undocumented", () => {
    expect(bundlesLiveInEra(BUNDLES, 1998)).toEqual([]);
    expect(bundlesLiveInEra(BUNDLES, 1998, { includeUndocumented: true })).toEqual(UNDATED_TWELVE);
    expect(resolveEraAvailability(BUNDLES.find((b) => b.id === "official:colo")!, 1998).status).toBe("pre-introduction");
  });

  it("2008 grants only colo (shared-web's shelf is 2009); 2016/2026 grant the dated pair", () => {
    // The walk speaks the asymmetry honestly: at 2008 the engine grants colo
    // (2001) but shared-web is still pre-introduction (2009) even while its
    // pack copy speaks the cPanel-boom middle — speaking is not granting.
    expect(bundlesLiveInEra(BUNDLES, 2008)).toEqual(["official:colo"]);
    expect(bundlesLiveInEra(BUNDLES, 2016)).toEqual(["official:colo", "official:shared-web"]);
    expect(bundlesLiveInEra(BUNDLES, 2026)).toEqual(["official:colo", "official:shared-web"]);
    expect(bundlesLiveInEra(BUNDLES, 2008, { includeUndocumented: true })).toEqual(BUNDLE_IDS.filter((id) => id !== "official:shared-web"));
    expect(bundlesLiveInEra(BUNDLES, 2016, { includeUndocumented: true })).toEqual([...BUNDLE_IDS].sort());
    expect(bundlesLiveInEra(BUNDLES, 2026, { includeUndocumented: true })).toEqual([...BUNDLE_IDS].sort());
  });

  it("undocumented never silently grants: every null line resolves 'undocumented' at all four rungs", () => {
    for (const bundle of BUNDLES.filter((b) => b.eras.availableFrom === null)) {
      for (const era of ERA_CANON) {
        expect(resolveEraAvailability(bundle, era).status, `${bundle.id} @${era}`).toBe("undocumented");
      }
    }
  });
});

/* ───────────────────────── 3. the coherence law ───────────────────────── */

interface AbsenceDeclaration {
  readonly era: number;
  /** Verbatim phrase from the pack's eraCodes copy declaring the line absent
   *  (search space: the whole eraCodes blob — the 2008 serverless absence is
   *  evidenced by the 2016 rung naming 2016 the line's true opening). */
  readonly cite: string;
}

/** What each pack's own copy DECLARES — every cite below was lifted from the
 *  pack JSON on disk by the 2026-10-18 dating pass. Lines whose 1998 rung
 *  SPEAKS the trade alive (dedicated, dns-hosting, mail-hosting, voip, game,
 *  backup-archival) declare nothing and stay absent-free: the law binds
 *  denials, not silences. */
const DECLARED_ABSENT: Readonly<Record<string, readonly AbsenceDeclaration[]>> = Object.freeze({
  "official:ci-build-farm": [
    { era: 1998, cite: "speaks as before-the-wall" },
  ],
  "official:colo": [
    { era: 1998, cite: "rather than claiming the line existed in canon" },
  ],
  "official:dbaas": [
    { era: 1998, cite: "not a tier you buy" },
    { era: 2008, cite: "not a product with an SLA" },
  ],
  "official:exchange-colo": [
    { era: 1998, cite: "pre-cathedral texture" },
  ],
  "official:object-storage": [
    { era: 1998, cite: "Pre-era for this line, declared honestly" },
  ],
  "official:observability": [
    { era: 1998, cite: "The pre-product years" },
  ],
  "official:serverless": [
    { era: 1998, cite: "Nothing on this shelf exists yet" },
    { era: 2008, cite: "true opening rung" },
  ],
});

function coherenceViolations(bundles: readonly LoadedTypeBundle[]): string[] {
  const byId = new Map(bundles.map((b) => [b.id, b]));
  const violations: string[] = [];
  for (const [bundleId, decls] of Object.entries(DECLARED_ABSENT)) {
    const bundle = byId.get(bundleId);
    if (bundle === undefined) continue;
    for (const decl of decls) {
      const { status } = resolveEraAvailability(bundle, decl.era);
      if (status === "available") {
        violations.push(`${bundleId} granted "available" in ${decl.era} despite its pack declaring '${decl.cite}'`);
      }
    }
  }
  return violations;
}

describe("coherence law: declared-absent rungs never resolve available", () => {
  it("the shipped corpus satisfies the law", () => {
    expect(coherenceViolations(BUNDLES)).toEqual([]);
  });

  it("every declaration cite stands verbatim in its pack on disk", () => {
    for (const [bundleId, decls] of Object.entries(DECLARED_ABSENT)) {
      const eraText = normalize(Object.values(packEraCodes(bundleId)).join(" "));
      for (const decl of decls) {
        expect(eraText, `${bundleId}: absence declaration '${decl.cite}' must still speak from the pack copy`).toContain(normalize(decl.cite));
      }
    }
  });

  it("a forged 1998 shelf date on a declared-absent line lights the law up; a forged 2010 stays silent", () => {
    const forge = (availableFrom: string): LoadedTypeBundle => {
      const wire = JSON.parse(readFileSync(join(CONTENT, "types", "object-storage.json"), "utf8")) as { eras: { availableFrom: string | null } };
      wire.eras.availableFrom = availableFrom;
      return loadTypeBundle(wire);
    };
    const others = BUNDLES.filter((b) => b.id !== "official:object-storage");
    // object-storage declares 1998 absent — grant it and the law must fire.
    expect(coherenceViolations([...others, forge("1998")])).toEqual([
      expect.stringContaining("official:object-storage"),
    ]);
    // 2010 is a rung the copy never denied — the law must NOT fire on it.
    expect(coherenceViolations([...others, forge("2010")])).toEqual([]);
  });

  it("the cite check is not vacuous: an invented declaration phrase fails it", () => {
    const eraText = normalize(Object.values(packEraCodes("official:object-storage")).join(" "));
    expect(eraText).not.toContain("declared born in 1998 with full canon backing");
  });
});

/* ───────────────────────── 4. speaking is not granting ───────────────────────── */

describe("the fallback boundary (speaking ≠ granting)", () => {
  it("shared-web's 1998 voice speaks the trade while the engine shelf date denies availability", () => {
    // The pack's own 1998 rung reconciles this in prose ("...is the engine
    // shelf date"); pin the reconciliation text and the verdict together.
    const eraText = normalize(Object.values(packEraCodes("official:shared-web")).join(" "));
    expect(eraText).toContain("the engine shelf date");
    expect(resolveEraAvailability(BUNDLES.find((b) => b.id === "official:shared-web")!, 1998).status).toBe("pre-introduction");
    expect(bundlesLiveInEra(BUNDLES, 1998)).not.toContain("official:shared-web");
  });

  it("colo now resolves available across every canon rung at or after 2001 — its 1998 denial holds", () => {
    const colo = BUNDLES.find((b) => b.id === "official:colo")!;
    expect(resolveEraAvailability(colo, 2001).status).toBe("available"); // inclusive lower bound
    for (const era of [2008, 2016, 2026] as const) expect(resolveEraAvailability(colo, era).status).toBe("available");
    expect(resolveEraAvailability(colo, 1998).status).toBe("pre-introduction");
  });
});
