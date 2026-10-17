/**
 * TUNING-SHEET WIRE STAMP — semantics proof for the owner re-author sweep.
 *
 * ADR-0009 (OD-2, 2026-10-09) ratified sheet B as the ACTIVE tuning sheet;
 * the 2026-10-17 re-author (closing the ADR-0015 #1 NOT-in-set ledger) flipped
 * the twelve type bundles' `"tuningSheet"` wire stamps PROVISIONAL-B →
 * RATIFIED-B. This file pins the SEMANTICS that made the sweep safe:
 *
 *  1. The engine's sheet selection NEVER reads the stamp — resolveActiveSheet()
 *     keys on its own ACTIVE_TUNING_SHEET const and returns sheet B exactly as
 *     before the sweep (same frozen params object, not a deep-equal twin).
 *  2. The stamp's LETTER is the only decodable part, and both ratification
 *     forms of letter B resolve to the same sheet (legacy tolerance law).
 *  3. The validator grammar accepts (PROVISIONAL|RATIFIED)-[ABC] and refuses
 *     anything else — drift-pinned by reading script/validate.mjs source, the
 *     house source-read mirror pattern (cf. elasticity's PRICE_TARGET_KINDS).
 *  4. At the loader boundary the SHIPPED bundle parses with the new stamp, the
 *     stamp is STRIPPED (convention key), and the loaded record is
 *     serialization-identical to the legacy-stamped text — the sweep cannot
 *     move any digest because the value never lands in loaded state.
 *
 * Import law: tests-only crosses into loader/; src/waves itself imports
 * neither content JSON nor the loader (unchanged).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadTypeBundle, stableSerialize } from "../../loader/bundle";
import { ACTIVE_TUNING_SHEET, resolveActiveSheet, TUNING_SHEETS, type TuningSheetId } from "../pressure";

const CONTENT_DIR = join(process.cwd(), "..", "content");

/** The single decodable law of the stamp string: RATIFIED|PROVISIONAL, then
 *  "-", then the sheet letter. Mirrors validate.mjs's TUNING_RE exactly. */
function stampLetter(stamp: string): TuningSheetId | null {
  const match = /^(?:PROVISIONAL|RATIFIED)-([ABC])$/.exec(stamp);
  return match ? (match[1] as TuningSheetId) : null;
}

describe("tuning-sheet wire stamps (ADR-0009 ratified sheet · ADR-0015 #1 residue closed)", () => {
  it("the engine resolves sheet B from its OWN const — the stamp string is never consulted", () => {
    expect(ACTIVE_TUNING_SHEET).toBe("B");
    const sheet = resolveActiveSheet();
    expect(sheet.id).toBe("B");
    expect(sheet.status).toBe("RATIFIED");
    // Identity, not a copy: the sweep cannot have altered the frozen sheet.
    expect(sheet).toBe(TUNING_SHEETS.B);
  });

  it("both stamp forms of letter B resolve to the same ratified sheet; an A stamp keeps its PROVISIONAL status", () => {
    expect(stampLetter("RATIFIED-B")).toBe("B");
    expect(stampLetter("PROVISIONAL-B")).toBe("B");
    expect(TUNING_SHEETS[stampLetter("RATIFIED-B")!]).toBe(resolveActiveSheet());
    expect(TUNING_SHEETS[stampLetter("PROVISIONAL-B")!]).toBe(resolveActiveSheet());
    // OD-2 honesty: only B was ratified — sheet A stays a PROVISIONAL alternate.
    expect(stampLetter("PROVISIONAL-A")).toBe("A");
    expect(TUNING_SHEETS.A.status).toBe("PROVISIONAL");
    expect(TUNING_SHEETS.A.params).not.toBe(TUNING_SHEETS.B.params);
  });

  it("validate.mjs grammar accepts (PROVISIONAL|RATIFIED)-[ABC] and refuses unknown suffixes (source-read drift pin)", () => {
    const source = readFileSync(join(CONTENT_DIR, "script", "validate.mjs"), "utf8");
    const literal = /const TUNING_RE = (\/.*\/);/.exec(source)?.[1];
    if (literal === undefined) throw new Error("stamp drift: validate.mjs no longer declares `const TUNING_RE = /…/;`");
    // Permanent grammar pin: a future grammar change must re-author this line too.
    expect(literal).toBe("/^(PROVISIONAL|RATIFIED)-[ABC]$/");
    const grammar = new RegExp(literal.slice(1, -1));
    for (const legal of ["PROVISIONAL-A", "PROVISIONAL-B", "PROVISIONAL-C", "RATIFIED-B"]) {
      expect(grammar.test(legal)).toBe(true);
    }
    for (const refused of ["RATIFIED-D", "PROVISIONAL-D", "B", "RATIFIED", "", "ratified-b", "RATIFIED-BB"]) {
      expect(grammar.test(refused)).toBe(false);
    }
  });

  it("the shipped shared-web bundle carries RATIFIED-B, parses, and the stamp is stripped at the loader boundary", () => {
    const raw = readFileSync(join(CONTENT_DIR, "types", "shared-web.json"), "utf8");
    const wire = JSON.parse(raw) as { economy: { tuningSheet: string } };
    expect(wire.economy.tuningSheet).toBe("RATIFIED-B");
    const bundle = loadTypeBundle(JSON.parse(raw) as unknown);
    expect(stableSerialize(bundle)).not.toContain("RATIFIED-B");
    expect(stableSerialize(bundle)).not.toContain("tuningSheet");
  });

  it("legacy PROVISIONAL-B text loads serialization-IDENTICAL to the swept bundle (tolerance law — digest-immune by construction)", () => {
    const raw = readFileSync(join(CONTENT_DIR, "types", "shared-web.json"), "utf8");
    const legacy = raw.replaceAll('"tuningSheet": "RATIFIED-B"', '"tuningSheet": "PROVISIONAL-B"');
    expect(legacy).not.toBe(raw); // the replace actually bit (falsifiable)
    const swept = stableSerialize(loadTypeBundle(JSON.parse(raw) as unknown));
    const legacyLoaded = stableSerialize(loadTypeBundle(JSON.parse(legacy) as unknown));
    expect(legacyLoaded).toBe(swept);
  });

  it("all twelve shipped bundles carry RATIFIED-B at every stamped site (sweep census)", () => {
    const files = [
      "backup-archival", "colo", "dbaas", "dedicated", "dns-hosting", "exchange-colo",
      "game-servers", "mail-hosting", "object-storage", "serverless", "shared-web", "trunk-group-voip",
    ];
    let sites = 0;
    for (const name of files) {
      const raw = readFileSync(join(CONTENT_DIR, "types", `${name}.json`), "utf8");
      const stamped = raw.match(/"tuningSheet": "[^"]*"/g) ?? [];
      expect(stamped.length, `${name} has stamped sites`).toBeGreaterThan(0);
      for (const site of stamped) expect(site, `${name} site`).toBe('"tuningSheet": "RATIFIED-B"');
      sites += stamped.length;
    }
    expect(sites).toBe(39); // 2026-10-17 disk recount (ADR-0015 #1 NOT-in-set ledger figure)
  });
});
