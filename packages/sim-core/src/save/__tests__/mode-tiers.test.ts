/**
 * OD-16(a) MODE TIERING LAW — the ~15-mode tiering adopted as law
 * (owner ruling 2026-10-09b; recorded source: reports/MASTER_REPORT.md
 * "Modes triage (§9.1)" consolidating hosting_game.md §9.1 heading
 * 33137→33149; ★ orphan marks included). These tests pin the census,
 * the ledger↔table consistency, the ratified endless override, the
 * deferred-nothing-buildable law, and wire back-compat (the tiering is
 * code-side law ONLY — no save bundle gains a field).
 */

import { describe, expect, it } from "vitest";
import {
  MODE_TIERING,
  SAVE_MODES,
  SAVE_MODE_TIER,
  WRITE_FACETS,
  liveRows,
  modeRowsIn,
  parseLongSaveWire,
  pendingOd8Rows,
  saveModeTier,
  serializeLongSave,
  composeLongSave,
  writeGuard,
  fromCanonicalJson,
  newSaveFile,
} from "../index";

const CORE_SLUGS = ["campaign", "incident", "sandbox"];
const DEFERRED_SLUGS = [
  "endless",
  "coop-noc",
  "coop-departments",
  "versus-live",
  "hardcore",
  "competitive-market",
  "franchise",
  "attack-my-network",
  "pager-simulator",
];

describe("OD-16(a) tiering — census (pinned)", () => {
  it("32 rows: core 3 · extended 20 · deferred 9, exact names in table order", () => {
    expect(MODE_TIERING.length).toBe(32);
    expect(modeRowsIn("core").map((r) => r.slug)).toEqual(CORE_SLUGS);
    expect(modeRowsIn("deferred").map((r) => r.slug)).toEqual(DEFERRED_SLUGS);
    const extended = modeRowsIn("extended").map((r) => r.slug);
    expect(extended.length).toBe(20);
    expect(new Set(extended).size).toBe(20);
    expect(new Set(MODE_TIERING.map((r) => r.slug)).size).toBe(32);
  });

  it("the ledger projection covers exactly the six SaveModes", () => {
    expect(Object.keys(SAVE_MODE_TIER).sort()).toEqual([...SAVE_MODES].sort());
    expect(saveModeTier("campaign")).toBe("core"); // L18 spine
    expect(saveModeTier("blitz")).toBe("core"); // Incident Mode's settlement door
    expect(saveModeTier("scenario")).toBe("extended");
    expect(saveModeTier("daily")).toBe("extended");
    expect(saveModeTier("consultant")).toBe("extended");
    expect(saveModeTier("endless")).toBe("deferred"); // ratified override
  });

  it("the recorded bands ride verbatim: SHIP-4 is five rows, four core + the endless override", () => {
    const ship4 = MODE_TIERING.filter((r) => r.band === "SHIP-4 v1").map((r) => r.slug);
    expect(ship4.sort()).toEqual(["campaign", "endless", "incident", "sandbox"]);
    expect(MODE_TIERING.filter((r) => r.band === "CHEAP v1.1").map((r) => r.slug).sort()).toEqual([
      "daily",
      "minimalist",
      "puzzle",
      "speedrun",
    ]);
    expect(MODE_TIERING.filter((r) => r.band === "CUT-CANDIDATES").length).toBe(4);
    expect(MODE_TIERING.filter((r) => r.band === "LATER-ENGINE/NETCODE").length).toBe(4);
    expect(MODE_TIERING.filter((r) => r.band === "DATA-LATER").length).toBe(16);
  });
});

describe("OD-16(a) tiering — ledger law", () => {
  it("every core ledger mode holds a FULL live Matrix B write row set (32 facets, no throw)", () => {
    const coreModes = SAVE_MODES.filter((m) => saveModeTier(m) === "core");
    expect(coreModes).toEqual(["campaign", "blitz"]);
    for (const mode of coreModes) {
      expect(liveRows(mode).length).toBe(WRITE_FACETS.length);
      for (const facet of WRITE_FACETS) {
        expect(() => writeGuard(mode, facet)).not.toThrow();
        expect(["append", "instance", "deny"]).toContain(writeGuard(mode, facet));
      }
    }
  });

  it("sandbox is the ONE core row without a settlement door — the shell-problem pin (triage: Company write API day one, not per-mode saves)", () => {
    const unmappedCore = modeRowsIn("core").filter((r) => r.saveMode === null);
    expect(unmappedCore.map((r) => r.slug)).toEqual(["sandbox"]);
  });

  it("deferred rows are schema-only — no deferred mode except the ratified endless override may hold a ledger door, and endless writes NOTHING", () => {
    for (const row of modeRowsIn("deferred")) {
      if (row.slug === "endless") continue;
      expect(row.saveMode).toBeNull();
    }
    // The deferred door that exists is padlocked exactly as OD-8 held it:
    for (const facet of WRITE_FACETS) {
      expect(() => writeGuard("endless", facet)).toThrow(/OD-8/);
    }
    // And the padlock is still the ONLY pending machinery (PENDING_OD8 untouched):
    expect(pendingOd8Rows().length).toBe(WRITE_FACETS.length);
    expect(pendingOd8Rows().every((r) => r.mode === "endless")).toBe(true);
  });

  it("the band→tier fold is total: every row matches BAND_TIER_LAW or is the named override (load-time assertModeTiering already throws otherwise — this proves it is not vacuous)", () => {
    const fold = { "SHIP-4 v1": "core", "CHEAP v1.1": "extended", "DATA-LATER": "extended", "LATER-ENGINE/NETCODE": "deferred", "CUT-CANDIDATES": "deferred" } as const;
    const violators = MODE_TIERING.filter((r) => fold[r.band] !== r.tier);
    expect(violators.map((r) => r.slug)).toEqual(["endless"]); // exactly one, ratified
  });

  it("each SaveMode is claimed by exactly one table row, at its projected tier", () => {
    for (const mode of SAVE_MODES) {
      const claims = MODE_TIERING.filter((r) => r.saveMode === mode);
      expect(claims.length).toBe(1);
      expect(claims[0]?.tier).toBe(SAVE_MODE_TIER[mode]);
    }
  });

  it("the registry is frozen data (mutation attempts throw or silently fail — deep)", () => {
    expect(Object.isFrozen(MODE_TIERING)).toBe(true);
    expect(Object.isFrozen(MODE_TIERING[0])).toBe(true);
    expect(Object.isFrozen(SAVE_MODE_TIER)).toBe(true);
  });
});

describe("OD-16(a) tiering — wire back-compat (additive-only proof)", () => {
  it("a legacy long-save doc (pre-tiering format) serializes, parses and re-serializes byte-identical", () => {
    const base = newSaveFile({ saveId: "longsave-tier", engineVersion: "0.1.0", simContract: "rng-v1", createdAtTick: 0n });
    const doc = composeLongSave(base, [
      { runId: "run-a", mode: "campaign", committedAtTick: 10n, replayBundleRef: "b/run-a" },
      { runId: "run-b", mode: "endless", committedAtTick: 20n, replayBundleRef: "b/run-b" },
      { runId: "run-c", mode: "blitz", committedAtTick: 30n, replayBundleRef: "b/run-c", replayBundle: { schemaVersion: 1, note: "opaque" } },
    ]);
    const text = serializeLongSave(doc);
    const revived = parseLongSaveWire(fromCanonicalJson(text));
    expect(serializeLongSave(revived)).toBe(text);
  });

  it("the tier NEVER rides the wire: no serialized save carries a tier/tiering field, and the mode cell stays a bare SAVE_MODES string", () => {
    const base = newSaveFile({ saveId: "longsave-tier2", engineVersion: "0.1.0", simContract: "rng-v1", createdAtTick: 0n });
    const text = serializeLongSave(composeLongSave(base, [{ runId: "r", mode: "daily", committedAtTick: 1n, replayBundleRef: "b" }]));
    expect(text).not.toMatch(/"(tier|modeTier|tiering|gameModeBand)":/); // "tierReached" is lineage data, not ours
    const wire = fromCanonicalJson(text) as { runs: { mode: unknown }[] };
    expect(wire.runs[0]?.mode).toBe("daily");
    expect(SAVE_MODES).toEqual(["campaign", "scenario", "endless", "daily", "consultant", "blitz"]); // enum untouched — old decoders legal
  });
});
