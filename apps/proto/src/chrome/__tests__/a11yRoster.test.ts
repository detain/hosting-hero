/**
 * ACCEPTANCE-ROSTER LEDGER pin (§8.16 "The acceptance-test roster", audit
 * finding 32505 — the roster was claimed but never collected).
 *
 * Three honesty laws, each enforced:
 *  1. the ledger is EXACTLY the spec table — row count and order are parsed
 *     live from hosting_game.md §8.16 (add a gate to the bible and this test
 *     goes red until the ledger answers for it);
 *  2. `live` rows point at REAL mechanisms (source-scanned, imported);
 *  3. `absent` rows stay absent-looking — every absent gate ships a grep
 *     probe; if anyone builds the gate without flipping the ledger, the probe
 *     fires. An armed planted probe proves the detector is not decoration.
 */
import { readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CHROME_CONTRAST_SPECS, buildChromeInventory, findAaViolations, parseEraTokens } from "../a11y/contrastAudit";
import { CHROME_MOTION_SPECS, findStrobeViolations } from "../a11y/motionAudit";
import {
  ABSENT_GATE_PROBES,
  ACCEPTANCE_ROSTER,
  liveGateCount,
  rosterRow,
  SHIPPED_A11Y_SURFACES,
} from "../a11y/roster";
import { STATUS_VALUES, statusChipFor } from "../statusChip";

const SRC_DIR = join(process.cwd(), "src");
const SPEC_MD = join(process.cwd(), "..", "..", "hosting_game.md");

/* ---------------------------------------------- 1. the ledger mirrors the spec */

/** §8.16 table order → ledger ids, positionally. */
const EXPECTED_ID_ORDER = [
  "quiet-frame",
  "loud-frame",
  "thumbnail",
  "two-screenshot",
  "silhouette-sheet",
  "silhouette-first-authoring",
  "greyscale-pass",
  "greyscale-motion",
  "two-second-rule",
  "chroma-meter",
  "strobe-budget-check",
] as const;

const EXPECTED_TITLE_PROBES = [
  /Quiet Frame/i,
  /Loud Frame/i,
  /Thumbnail/i,
  /Two-Screenshot/i,
  /Silhouette Sheet/i,
  /Silhouette-first/i,
  /greyscale pass/i,
  /greyscale-motion/i,
  /Two-Second Rule/i,
  /Chroma Meter/i,
  /Strobe Budget/i,
] as const;

function specTableRows(): string[] {
  const md = readFileSync(SPEC_MD, "utf8");
  const start = md.indexOf("### The acceptance-test roster");
  if (start === -1) throw new Error("§8.16 acceptance-test roster heading vanished from hosting_game.md");
  const rest = md.slice(start);
  const end = rest.indexOf("\n### ", 1);
  const section = end === -1 ? rest : rest.slice(0, end);
  return section
    .split("\n")
    .filter((line) => /^\|\s*\*\*/.test(line)) // data rows only (header row is not bolded)
    ;
}

describe("roster ledger — exactly the §8.16 table, honestly counted", () => {
  it("hosting_game.md §8.16 still lists 11 gates, mapping to these ids in order", () => {
    const rows = specTableRows();
    expect(rows).toHaveLength(11);
    rows.forEach((row, i) => {
      expect(new RegExp(EXPECTED_TITLE_PROBES[i] ?? "").test(row), `spec row ${i} drifted from the ledger`).toBe(true);
    });
    expect(ACCEPTANCE_ROSTER.map((r) => r.id)).toStrictEqual(EXPECTED_ID_ORDER);
    expect(ACCEPTANCE_ROSTER).toHaveLength(11);
  });

  it("the ledger is 4 of 11 live — shape-first pips and readout ride a SEPARATE surface ledger", () => {
    expect(liveGateCount()).toBe(4);
    expect(ACCEPTANCE_ROSTER.filter((r) => r.status === "live").map((r) => r.id)).toStrictEqual([
      "greyscale-pass",
      "greyscale-motion",
      "chroma-meter",
      "strobe-budget-check",
    ]);
    const surfaceIds = SHIPPED_A11Y_SURFACES.map((s) => s.id);
    for (const id of surfaceIds) {
      expect(EXPECTED_ID_ORDER).not.toContain(id); // inflation-proof: surfaces are never gates
    }
    expect(surfaceIds).toStrictEqual(["shape-first-notches", "readout-mode"]);
  });

  it("row shapes are legal: live names a mechanism, absent carries nothing", () => {
    for (const row of ACCEPTANCE_ROSTER) {
      if (row.status === "absent") expect(row.where).toBeNull();
      else expect((row.where ?? "").trim().length).toBeGreaterThan(10);
    }
    expect(() => rosterRow("no-such-gate")).toThrowError(/roster\[unknown-id\]/);
  });
});

/* ------------------------------------------------ 2. live rows are REAL now */

describe("roster ledger — the four live rows survive inspection", () => {
  it("chroma-meter: budget authority + player-visible view + shell mount all exist", () => {
    const budget = readFileSync(join(SRC_DIR, "render", "budget.ts"), "utf8");
    const meter = readFileSync(join(SRC_DIR, "chrome", "ChromaMeter.vue"), "utf8");
    const app = readFileSync(join(SRC_DIR, "App.vue"), "utf8");
    expect(budget).toContain("snapshot(): BudgetSnapshot");
    expect(meter).toContain("CHROMA METER");
    expect(meter).toContain("BudgetManager");
    expect(app).toContain("chromaVisible");
  });

  it("greyscale-pass: the contrast census genuinely audits the parsed eras clean", () => {
    expect(CHROME_CONTRAST_SPECS.length).toBeGreaterThanOrEqual(40);
    const eras = [
      parseEraTokens({ era: "1998", surface: "#171d24", accent: "#f2b133" }),
      parseEraTokens({ era: "2026", surface: "#0d131c", accent: "#35e0e6" }),
    ];
    expect(findAaViolations(buildChromeInventory(eras))).toStrictEqual([]);
  });

  it("greyscale-pass: the runtime half is REAL — mode file + shell key + both halves named", () => {
    const mode = readFileSync(join(SRC_DIR, "chrome", "a11y", "contrastAuditMode.ts"), "utf8");
    const app = readFileSync(join(SRC_DIR, "App.vue"), "utf8");
    expect(mode).toContain("backdrop-filter: grayscale(1)"); // luminance-only render
    expect(mode).toContain("export function toggleContrastAuditMode");
    expect(mode).toContain("prefers-reduced-motion"); // the mode obeys its own guard law
    expect(app).toContain('event.key === "a"');
    const row = rosterRow("greyscale-pass");
    expect(row.where ?? "").toContain("contrastAudit.ts");
    expect(row.where ?? "").toContain("contrastAuditMode.ts");
    expect(row.where ?? "").not.toMatch(/unbuilt/); // the old clause must stay dead
  });

  it("greyscale-motion: the colour-muted mechanism exists and the motion census stands under it", () => {
    const mode = readFileSync(join(SRC_DIR, "chrome", "a11y", "contrastAuditMode.ts"), "utf8");
    expect(mode).toContain("grayscale(1)");
    expect(findStrobeViolations(CHROME_MOTION_SPECS)).toStrictEqual([]); // motion half is law-audited
    const row = rosterRow("greyscale-motion");
    expect(row.status).toBe("live");
    expect(row.where ?? "").toContain("motionAudit.ts");
  });

  it("strobe-budget-check: the motion census is populated and violation-free", () => {
    expect(CHROME_MOTION_SPECS.length).toBeGreaterThanOrEqual(6);
    expect(findStrobeViolations(CHROME_MOTION_SPECS)).toStrictEqual([]);
  });

  it("the two SURFACES PHASE1-PLAN:165 credits are real in source", () => {
    // Shape-First: twelve status values, twelve DISTINCT notch glyphs.
    const notches = new Set(STATUS_VALUES.map((v) => statusChipFor(v).notch));
    expect(STATUS_VALUES).toHaveLength(12);
    expect(notches.size).toBe(12);
    // Readout Mode: bezel branch + App toggle.
    const bezel = readFileSync(join(SRC_DIR, "chrome", "instruments", "InstrumentBezel.vue"), "utf8");
    const app = readFileSync(join(SRC_DIR, "App.vue"), "utf8");
    expect(bezel).toContain('v-if="!readout"');
    expect(bezel).toContain("formatReadout");
    expect(app).toContain('event.key === "r"');
  });
});

/* ---------------------------------------- 3. absent rows stay absent-looking */

interface ScannedFile {
  readonly rel: string;
  readonly text: string;
}

function walkSrc(): ScannedFile[] {
  const out: ScannedFile[] = [];
  const walk = (dir: string, prefix: string): void => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (name === "__tests__" || name === "node_modules") continue;
      if (statSync(full).isDirectory()) {
        walk(full, `${prefix}${name}/`);
        continue;
      }
      // The a11y ledger itself legitimately QUOTES the absent probes — data,
      // not implementation. Everything else under src/ is fair game.
      if (name.endsWith(".ts") || name.endsWith(".vue") || name.endsWith(".css")) {
        out.push({ rel: `${prefix}${name}`, text: readFileSync(full, "utf8") });
      }
    }
  };
  walk(SRC_DIR, "");
  return out;
}

function probeHits(probe: string, files: readonly ScannedFile[]): string[] {
  const re = new RegExp(probe, "i");
  const hits: string[] = [];
  for (const f of files) {
    if (f.rel.startsWith("chrome/a11y/")) continue; // the ledger is allowed to name what it denies
    const lines = f.text.split("\n");
    lines.forEach((line, i) => {
      if (re.test(line)) hits.push(`${f.rel}:${i + 1}`);
    });
  }
  return hits;
}

describe("roster ledger — absent gates cannot be silently built", () => {
  it("every absent row has a probe, and every probe is currently quiet", () => {
    const absent = ACCEPTANCE_ROSTER.filter((r) => r.status === "absent").map((r) => r.id);
    expect(absent).toHaveLength(7);
    expect(Object.keys(ABSENT_GATE_PROBES).sort()).toStrictEqual([...absent].sort());
    const files = walkSrc();
    expect(files.length).toBeGreaterThanOrEqual(100); // anti-vacuity: the walk really walks
    const violations: string[] = [];
    for (const id of absent) {
      const probe = ABSENT_GATE_PROBES[id];
      if (probe === undefined) throw new Error(`absent gate "${id}" lost its grep probe`);
      for (const hit of probeHits(probe, files)) violations.push(`${id} claimed without a ledger flip: ${hit}`);
    }
    expect(violations).toStrictEqual([]);
  });

  it("ARMED — a planted quiet-frame harness IS detected by the guard", () => {
    const probeFile = join(SRC_DIR, "__a11y_scan_probe_tmp.ts");
    try {
      writeFileSync(probeFile, "export const QuietFrameTestHarness = 1; // planted\n", "utf8");
      const hits = probeHits(ABSENT_GATE_PROBES["quiet-frame"] ?? "", walkSrc());
      expect(hits.some((h) => h.startsWith("__a11y_scan_probe_tmp.ts"))).toBe(true);
    } finally {
      rmSync(probeFile, { force: true });
    }
    // and after removal the guard is quiet again (falsifiable in both directions)
    expect(probeHits(ABSENT_GATE_PROBES["quiet-frame"] ?? "", walkSrc())).toStrictEqual([]);
  });

  it("the ledger's own probes cannot accidentally cover a live gate", () => {
    for (const row of ACCEPTANCE_ROSTER.filter((r) => r.status === "live")) {
      expect(ABSENT_GATE_PROBES[row.id]).toBeUndefined();
    }
  });
});
