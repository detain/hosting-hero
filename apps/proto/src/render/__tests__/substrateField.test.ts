/**
 * Substrate field law — pure-shape tests (ADR-0008 step-3 spike, node env).
 * No pixi import anywhere in this file: substrateField.ts must stay testable
 * with zero renderer, exactly like budget.ts and postChain.ts.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  BUDGET_CAPS,
  BudgetManager,
  KLAXON_PRIORITY,
  LABEL_CAP_BY_ALTITUDE,
  type BudgetCategory,
} from "../budget";
import { ALTITUDES, type Altitude } from "../camera";
import {
  QUAD_CAP_BY_ALTITUDE,
  SEED_SHARED_WEB_PALETTE,
  SUBSTRATE_CATEGORY,
  SUBSTRATE_MOUNT_TARGETS,
  SUBSTRATE_PRIORITY,
  SUBSTRATE_QUADS_PER_LABEL_SLOT,
  SubstrateFieldError,
  SubstrateLedger,
  assertSubstrateMountTarget,
  paletteSlotCount,
  parseSubstratePalette,
  parseSubstrateRegion,
  slotOf,
  substrateCategoryMetered,
  substrateHolderId,
  type SubstrateAcquireResult,
  type SubstrateAdmitRequest,
  type SubstrateAdmitResult,
  type SubstrateBudgetPort,
  type SubstrateRegionInput,
} from "../substrate/substrateField";

/* ────────────────────────────── helpers ────────────────────────────── */

function regionCells(rows: number, cols: number, index: number | null = 0): (number | null)[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => index));
}

function regionInput(overrides: Partial<SubstrateRegionInput> = {}): SubstrateRegionInput {
  return {
    regionId: "north-hall",
    mountLayer: "substrate",
    cells: regionCells(4, 4),
    ...overrides,
  };
}

/** A BudgetManager-shaped fake standing in for the POST-DECISION world:
 *  caps carry `substrate: N`, admit/release mirror the real logic the same
 *  way the real one does. The seam's probe flips true exactly when a port
 *  like this is wired — which is what budget.ts gains when the owner rules. */
function postDecisionBudget(substrateCap = 4): SubstrateBudgetPort & {
  readonly admits: SubstrateAdmitRequest[];
  readonly releases: string[];
} {
  const claims = new Map<string, SubstrateAdmitRequest>();
  const admits: SubstrateAdmitRequest[] = [];
  const releases: string[] = [];
  return {
    admits,
    releases,
    admit(request: SubstrateAdmitRequest): SubstrateAdmitResult {
      admits.push(request);
      if (claims.has(request.id)) return { admitted: true, evicted: [] }; // refresh law
      const sameCategory = [...claims.values()].filter((c) => c.category === request.category);
      if (request.category !== SUBSTRATE_CATEGORY) {
        claims.set(request.id, request);
        return { admitted: true, evicted: [] };
      }
      if (sameCategory.length >= substrateCap) {
        return {
          admitted: false,
          reason: "category-budget",
          clusterId: `${SUBSTRATE_CATEGORY}:${request.region ?? "global"}`,
        };
      }
      claims.set(request.id, request);
      return { admitted: true, evicted: [] };
    },
    release(id: string): void {
      releases.push(id);
      claims.delete(id);
    },
    snapshot() {
      return {
        caps: { ...BUDGET_CAPS, [SUBSTRATE_CATEGORY]: substrateCap } as Record<string, number>,
      };
    },
  };
}

/* ────────────────────────────── parse law ────────────────────────────── */

describe("parseSubstrateRegion — parse, don't validate (law 6)", () => {
  it("a seed-palette region parses to a frozen, quad-counted form", () => {
    const region = parseSubstrateRegion(regionInput({ cells: [[0, null, 5], [15, null, 2]] }));
    expect(region.regionId).toBe("north-hall");
    expect(region.mountLayer).toBe("substrate");
    expect(region.quads).toBe(4);
    expect(region.cols).toBe(3);
    expect(region.rows).toBe(2);
    expect(Object.isFrozen(region)).toBe(true);
    expect(Object.isFrozen(region.cells)).toBe(true);
    expect(Object.isFrozen(region.cells[0])).toBe(true);
  });

  it("empty ids, capitals and colons throw bad-region-id (holder id stays unambiguous)", () => {
    for (const bad of ["", "North", "a:b", "-x", "x y", "r\u00e9gion"]) {
      expect(() => parseSubstrateRegion(regionInput({ regionId: bad }))).toThrowError(
        /substrate\[bad-region-id\]/,
      );
    }
    expect(substrateHolderId("north-hall")).toBe("tilemap:substrate:north-hall");
  });

  it("tile indices outside the 4×4 seed palette throw by slot count and position", () => {
    expect(() => parseSubstrateRegion(regionInput({ cells: [[16]] }))).toThrowError(
      /substrate\[tile-index\].*16 slots, indices 0\.\.15/,
    );
    expect(() => parseSubstrateRegion(regionInput({ cells: [[-1]] }))).toThrowError(/substrate\[tile-index\]/);
    expect(() => parseSubstrateRegion(regionInput({ cells: [[1.5]] }))).toThrowError(/substrate\[tile-index\]/);
    expect(() => parseSubstrateRegion(regionInput({ cells: [[0, 0], [0, 99]] }))).toThrowError(
      /substrate\[tile-index\].*cell \(1,1\)/,
    );
  });

  it("ragged grids, empty grids and all-null fields are authoring errors", () => {
    expect(() => parseSubstrateRegion(regionInput({ cells: [] }))).toThrowError(/substrate\[bad-grid\]/);
    expect(() => parseSubstrateRegion(regionInput({ cells: [[]] }))).toThrowError(/substrate\[bad-grid\]/);
    expect(() => parseSubstrateRegion(regionInput({ cells: [[0], [0, 1]] }))).toThrowError(
      /substrate\[bad-grid\].*ragged/,
    );
    expect(() => parseSubstrateRegion(regionInput({ cells: [[null, null], [null, null]] }))).toThrowError(
      /substrate\[bad-grid\].*all-empty/,
    );
  });

  it("tileWorldSize must be a positive integer", () => {
    expect(() => parseSubstrateRegion(regionInput({ tileWorldSize: 0 }))).toThrowError(/substrate\[bad-value\]/);
    expect(() => parseSubstrateRegion(regionInput({ tileWorldSize: 2.5 }))).toThrowError(/substrate\[bad-value\]/);
    expect(parseSubstrateRegion(regionInput({ tileWorldSize: 8 })).tileWorldSize).toBe(8);
  });
});

/* ────────────────────────────── mount law ────────────────────────────── */

describe("mount-target law — substrate-only, closed enum (law 1)", () => {
  it("only 'substrate' is admitted", () => {
    expect(SUBSTRATE_MOUNT_TARGETS).toEqual(["substrate"]);
    expect(assertSubstrateMountTarget("substrate")).toBe("substrate");
  });

  it("intent/attachment/annotation/flow each throw naming the concept law", () => {
    const cases: readonly (readonly [string, RegExp])[] = [
      ["intent", /Intent concepts/],
      ["attachment", /Attachment concepts/],
      ["annotation", /Annotation concepts/],
      ["flow", /never signal/],
    ];
    for (const [layer, lawNote] of cases) {
      expect(() => assertSubstrateMountTarget(layer)).toThrowError(/substrate\[mount-target\]/);
      try {
        assertSubstrateMountTarget(layer);
      } catch (error) {
        expect((error as Error).message).toMatch(lawNote);
        expect((error as Error).message).toMatch(/never let a concept live in two layers/);
      }
    }
  });

  it("a string that is not a layer at all is still refused", () => {
    expect(() => assertSubstrateMountTarget("roof")).toThrowError(/not a layer of the five-layer stack/);
    expect(() => parseSubstrateRegion(regionInput({ mountLayer: "annotation" }))).toThrowError(
      /substrate\[mount-target\]/,
    );
  });
});

/* ────────────────────────────── palette law ────────────────────────────── */

describe("palette law — the sheet is the color authority (law 5)", () => {
  it("the seed palette is 64×64 sliced to 4×4 = 16 slots", () => {
    const palette = parseSubstratePalette(undefined);
    expect(palette).toEqual(SEED_SHARED_WEB_PALETTE);
    expect(paletteSlotCount(palette)).toBe(16);
    expect(palette.sheet).toBe("assets/skin-kits/seed-shared-web/palette.png");
  });

  it("the PNG on disk really is 64×64 (IHDR) — the constant cannot drift from the kit", () => {
    // latin1 read = one char per byte (node-fs-bytes.d.ts overload); IHDR
    // width/height live at byte offsets 16-19 / 20-23 of a PNG.
    const png = readFileSync(
      join(process.cwd(), "..", "..", "assets", "skin-kits", "seed-shared-web", "palette.png"),
      "latin1",
    );
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    expect([...png.slice(0, 8)].map((ch) => ch.charCodeAt(0))).toEqual(signature);
    const be32 = (offset: number): number =>
      ((png.charCodeAt(offset) << 24) |
        (png.charCodeAt(offset + 1) << 16) |
        (png.charCodeAt(offset + 2) << 8) |
        png.charCodeAt(offset + 3)) >>>
      0;
    expect(be32(16)).toBe(SEED_SHARED_WEB_PALETTE.widthPx);
    expect(be32(20)).toBe(SEED_SHARED_WEB_PALETTE.heightPx);
  });

  it("a sheet that does not tile exactly is refused — no silent half slots", () => {
    expect(() => parseSubstratePalette({ widthPx: 70, heightPx: 64 })).toThrowError(
      /substrate\[bad-palette\].*does not tile exactly/,
    );
    expect(() => parseSubstratePalette({ tileWidthPx: 0 })).toThrowError(/substrate\[bad-value\]/);
  });

  it("slotOf maps row-major indices to sheet sub-rects", () => {
    const p = SEED_SHARED_WEB_PALETTE;
    expect(slotOf(0, p)).toEqual({ u: 0, v: 0, tileWidth: 16, tileHeight: 16 });
    expect(slotOf(1, p)).toEqual({ u: 16, v: 0, tileWidth: 16, tileHeight: 16 });
    expect(slotOf(4, p)).toEqual({ u: 0, v: 16, tileWidth: 16, tileHeight: 16 });
    expect(slotOf(15, p)).toEqual({ u: 48, v: 48, tileWidth: 16, tileHeight: 16 });
    expect(() => slotOf(16, p)).toThrowError(/substrate\[tile-index\]/);
  });
});

/* ────────────────────────────── quad caps ────────────────────────────── */

describe("quad caps — metered to the label budget (law 4)", () => {
  it("every altitude cap is exactly its label cap × the quad-per-slot multiplier", () => {
    for (const altitude of ALTITUDES) {
      expect(QUAD_CAP_BY_ALTITUDE[altitude]).toBe(LABEL_CAP_BY_ALTITUDE[altitude] * SUBSTRATE_QUADS_PER_LABEL_SLOT);
    }
  });

  it("the spike anchor is exact: Z3 = 30 labels × 40 = 1200 quads", () => {
    expect(QUAD_CAP_BY_ALTITUDE.Z3).toBe(1200);
    expect(QUAD_CAP_BY_ALTITUDE).toEqual({ Z1: 1920, Z2: 1440, Z3: 1200, Z4: 480 });
  });

  it("an over-cap field (1240 > 1200) refuses at Z3 and admits at Z1 (cap 1920)", () => {
    const budget = postDecisionBudget();
    const ledger = new SubstrateLedger({ budget });
    const breach = ledger.acquire(regionInput({ cells: regionCells(40, 31, 3) }), "Z3"); // 1240
    expect(breach.acquired).toBe(false);
    if (breach.acquired === false) {
      expect(breach.reason).toBe("quad-budget");
      expect(breach.cap).toBe(1200);
      expect(breach.quads).toBe(1240);
      expect(breach.kept).toEqual([]);
    }
    expect(budget.admits).toHaveLength(0); // refused BEFORE any claim was touched
    const ok = ledger.acquire(regionInput({ regionId: "detail-pocket", cells: regionCells(40, 31, 3) }), "Z1");
    expect(ok.acquired).toBe(true);
  });

  it("an unknown altitude throws bad-altitude before arithmetic", () => {
    const ledger = new SubstrateLedger({ budget: postDecisionBudget() });
    expect(() => ledger.acquire(regionInput(), "Z9" as Altitude)).toThrowError(/substrate\[bad-altitude\]/);
  });
});

/* ────────────────────────────── admission ────────────────────────────── */

describe("admission model — one whole-layer holder per region (law 2)", () => {
  it("acquisition claims exactly one holder id under the substrate category at priority 0", () => {
    const budget = postDecisionBudget();
    const ledger = new SubstrateLedger({ budget });
    const result = ledger.acquire(regionInput({ cells: [[0, null], [null, 7]] }), "Z2");
    expect(result).toEqual({
      acquired: true,
      refreshed: false,
      holderId: "tilemap:substrate:north-hall",
      evicted: [],
    });
    expect(budget.admits).toHaveLength(1);
    expect(budget.admits[0]).toEqual({
      id: "tilemap:substrate:north-hall",
      category: SUBSTRATE_CATEGORY,
      priority: SUBSTRATE_PRIORITY,
      region: "Z2",
    });
    expect(SUBSTRATE_PRIORITY).toBeLessThan(KLAXON_PRIORITY);
  });

  it("re-acquiring the same region refreshes ITS OWN holder — never a second draw", () => {
    const budget = postDecisionBudget();
    const ledger = new SubstrateLedger({ budget });
    ledger.acquire(regionInput({ cells: regionCells(2, 2) }), "Z2");
    const again = ledger.acquire(regionInput({ cells: regionCells(2, 2, 1) }), "Z2");
    expect(again.acquired).toBe(true);
    if (again.acquired) expect(again.refreshed).toBe(true);
    expect(ledger.liveRegions()).toEqual(["north-hall"]); // still ONE live region
    expect(ledger.snapshot().holders).toHaveLength(1);
  });

  it("a re-acquire whose NEW field breaches the cap is refused and keeps the old field", () => {
    const budget = postDecisionBudget();
    const ledger = new SubstrateLedger({ budget });
    ledger.acquire(regionInput({ cells: regionCells(2, 2) }), "Z1");
    const refused = ledger.acquire(regionInput({ cells: regionCells(50, 40, 9) }), "Z3"); // 2000 > 1200
    expect(refused.acquired).toBe(false);
    expect(ledger.snapshot().holders[0]?.quads).toBe(4); // old field intact
  });

  it("category refusal from the port is reported, kept-list included, live set untouched", () => {
    const budget = postDecisionBudget(2); // cap 2 regions in the post-decision world
    const ledger = new SubstrateLedger({ budget });
    const a = ledger.acquire(regionInput({ regionId: "hall-a" }), "Z3");
    const b = ledger.acquire(regionInput({ regionId: "hall-b" }), "Z3");
    const c = ledger.acquire(regionInput({ regionId: "hall-c" }), "Z3");
    expect([a.acquired, b.acquired, c.acquired]).toEqual([true, true, false]);
    if (c.acquired === false) {
      expect(c.reason).toBe("category-budget");
      expect(c.refusal).toBe("category-budget");
      expect(c.clusterId).toBe(`${SUBSTRATE_CATEGORY}:Z3`);
      expect(c.kept).toEqual(["hall-a", "hall-b"]);
    }
  });

  it("release returns live-ness, frees the holder id, and re-acquire re-claims", () => {
    const budget = postDecisionBudget(1);
    const ledger = new SubstrateLedger({ budget });
    ledger.acquire(regionInput(), "Z3");
    expect(ledger.release("nope")).toBe(false);
    expect(ledger.release("north-hall")).toBe(true);
    expect(budget.releases).toEqual(["tilemap:substrate:north-hall"]);
    expect(ledger.acquire(regionInput(), "Z3").acquired).toBe(true); // slot free again
  });

  it("snapshot accounts quads per holder and in total", () => {
    const budget = postDecisionBudget();
    const ledger = new SubstrateLedger({ budget });
    ledger.acquire(regionInput({ regionId: "floor-1", cells: regionCells(4, 4) }), "Z2");
    ledger.acquire(regionInput({ regionId: "floor-2", cells: [[0, null], [null, null]] }), "Z4");
    const snap = ledger.snapshot();
    expect(snap.totalQuads).toBe(17);
    expect(snap.quadsByRegion).toEqual({ "floor-1": 16, "floor-2": 1 });
    expect(snap.holders.map((h) => h.holderId)).toEqual([
      "tilemap:substrate:floor-1",
      "tilemap:substrate:floor-2",
    ]);
  });

  it("dispose releases every holder and closes the ledger", () => {
    const budget = postDecisionBudget();
    const ledger = new SubstrateLedger({ budget });
    ledger.acquire(regionInput({ regionId: "x-1" }), "Z3");
    ledger.acquire(regionInput({ regionId: "x-2" }), "Z3");
    ledger.dispose();
    expect(budget.releases).toEqual(["tilemap:substrate:x-1", "tilemap:substrate:x-2"]);
    expect(ledger.snapshot().holders).toHaveLength(0);
    expect(() => ledger.acquire(regionInput({ regionId: "x-3" }), "Z3")).toThrowError(/substrate\[disposed\]/);
    ledger.dispose(); // idempotent
    expect(ledger.release("x-1")).toBe(false);
  });
});

/* ────────────────────────────── the seam ────────────────────────────── */

describe("the category seam — RATIFIED 2026-10-09, live metering (law 3)", () => {
  it("BUDGET_CAPS.substrate is exactly the ratified 1200 (rec #16; pinned equal to the Z3 quad ceiling)", () => {
    // The spike tripwire ("no substrate entry today") flipped red the day the
    // owner signed, exactly as designed — this is its successor pin. Changing
    // the cap in budget.ts without an owner decision turns this red.
    expect(BUDGET_CAPS.substrate).toBe(1200);
    // The ratified row's stated anchor: cap = QUAD_CAP_BY_ALTITUDE.Z3.
    expect(BUDGET_CAPS.substrate).toBe(QUAD_CAP_BY_ALTITUDE.Z3);
  });

  it("a ledger with NO port throws category-pending — never a silent local count (mis-wiring)", () => {
    const ledger = new SubstrateLedger();
    expect(() => ledger.acquire(regionInput(), "Z3")).toThrowError(/substrate\[category-pending\]/);
    expect(ledger.liveRegions()).toEqual([]); // nothing half-admitted
  });

  it("a stub/forged port whose caps table LACKS 'substrate' still throws — the mis-wiring probe", () => {
    // Post-ratification the probe's false branch means BROKEN WIRING, not a
    // pending decision. Caps minus the key — DELETED, not set undefined:
    // the probe is an `in` check, so an undefined-valued key would still pass.
    const capsWithoutSubstrate: Record<string, number> = { ...BUDGET_CAPS };
    delete capsWithoutSubstrate[SUBSTRATE_CATEGORY];
    const forgedPort: SubstrateBudgetPort = {
      admit: () => ({ admitted: true, evicted: [] }),
      release: () => undefined,
      snapshot: () => ({ caps: capsWithoutSubstrate }),
    };
    expect(substrateCategoryMetered(forgedPort)).toBe(false);
    const ledger = new SubstrateLedger({ budget: forgedPort });
    expect(() => ledger.acquire(regionInput(), "Z3")).toThrowError(/substrate\[category-pending\]/);
    try {
      ledger.acquire(regionInput(), "Z3");
    } catch (error) {
      expect((error as Error).message).toMatch(/stub\/forged port/); // names MIS-WIRING
      expect((error as Error).message).toMatch(/BUDGET_CAPS gained the category 2026-10-09/);
    }
    expect(ledger.liveRegions()).toEqual([]);
  });

  it("the REAL BudgetManager now meters substrate — probe true, claims land, release frees", () => {
    // The self-activation promise, verified against the real manager rather
    // than a fake: nothing was renamed, re-wired, or flagged.
    const manager = new BudgetManager();
    expect(substrateCategoryMetered(manager)).toBe(true);
    const ledger = new SubstrateLedger({ budget: manager });
    const result = ledger.acquire(regionInput({ cells: [[0, null], [null, 7]] }), "Z3");
    expect(result.acquired).toBe(true);
    const snap = manager.snapshot();
    expect(snap.used.substrate).toBe(1);
    expect(snap.holders).toEqual([
      { id: "tilemap:substrate:north-hall", category: "substrate", priority: SUBSTRATE_PRIORITY },
    ]);
    ledger.release("north-hall");
    expect(manager.snapshot().used.substrate).toBe(0);
    expect(manager.snapshot().holders).toHaveLength(0);
  });

  it("at the ratified cap: the 1201st concurrent region refuses via category-budget, keeping holders", () => {
    // The consumption unit is ONE claim per live region (law 2), so the cap
    // meters concurrent REGIONS. End-to-end against the real manager.
    const manager = new BudgetManager();
    const ledger = new SubstrateLedger({ budget: manager });
    for (let i = 0; i < 1200; i++) {
      const ok = ledger.acquire(regionInput({ regionId: `r-${i}`, cells: [[0]] }), "Z3");
      if (!ok.acquired) throw new Error(`filler region ${i} unexpectedly refused`);
    }
    expect(manager.snapshot().used.substrate).toBe(1200);
    const overflow = ledger.acquire(regionInput({ regionId: "one-too-many", cells: [[0]] }), "Z3");
    expect(overflow.acquired).toBe(false);
    if (overflow.acquired === false) {
      expect(overflow.reason).toBe("category-budget");
      expect(overflow.refusal).toBe("category-budget");
      expect(overflow.clusterId).toBe(`${SUBSTRATE_CATEGORY}:Z3`); // folds per zoom-stage
      expect(overflow.kept).toHaveLength(1200);
    }
    expect(ledger.liveRegions()).toHaveLength(1200); // live set untouched
    expect(ledger.snapshot().holders).toHaveLength(1200);
  });

  it("FORMER SPIKE FINDING, SINCE HARDENED: BudgetManager.admit throws on unknown categories", () => {
    // The fail-open hole (BUDGET_CAPS[unknown] undefined → `count >= undefined`
    // false → admitted uncapped, snapshot().used growing a NaN slot) is CLOSED:
    // admit() now guards the caps table and throws `budget[unknown-category]`
    // naming the offender. 'substrate' itself rode this pin while pending;
    // after ratification the probe uses a STILL-unknown forged name so the
    // runtime twin of the closed TS union stays falsifiable.
    const manager = new BudgetManager();
    expect(() =>
      manager.admit({
        id: "forged",
        category: "glow" as BudgetCategory, // deliberate cast to expose the runtime shape
        priority: 0,
      }),
    ).toThrowError(/budget\[unknown-category\]: 'glow' not in BUDGET_CAPS/);
    expect(manager.snapshot().holders).toHaveLength(0); // nothing half-claimed
    const used = manager.snapshot().used as Readonly<Record<string, number | undefined>>;
    expect(used.glow).toBeUndefined(); // the NaN symptom cannot form
    // And the ratified path proves 'substrate' is NOT that offender anymore:
    expect(() =>
      manager.admit({ id: "real", category: "substrate", priority: 0 }),
    ).not.toThrow();
  });

  it("the seam self-activates when the caps table carries 'substrate' — no flag to flip", () => {
    const budget = postDecisionBudget();
    expect(substrateCategoryMetered(budget)).toBe(true);
    const ledger = new SubstrateLedger({ budget });
    expect(ledger.acquire(regionInput(), "Z3").acquired).toBe(true);
  });

  it("quad arithmetic precedes claims even on a live metered port", () => {
    const ledger = new SubstrateLedger({ budget: new BudgetManager() });
    const breach: SubstrateAcquireResult = ledger.acquire(regionInput({ cells: regionCells(50, 40) }), "Z3");
    expect(breach.acquired).toBe(false); // quad-budget refusal, BEFORE any budget claim
    if (breach.acquired === false) {
      expect(breach.reason).toBe("quad-budget");
      expect(breach.cap).toBe(1200);
    }
    expect(ledger.snapshot().holders).toHaveLength(0);
  });
});
