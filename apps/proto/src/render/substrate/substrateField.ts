/**
 * Substrate field law — ADR-0008 step 3 spike: what a tilemap region may BE
 * before anything decides how it DRAWS.
 *
 * This module is pure TypeScript — no pixi import, node-testable, the
 * budget.ts/postChain.ts pattern. Materialising CompositeTilemaps is
 * tileField.ts's job (the repo's only @pixi/tilemap import site); this file
 * never touches the vendor.
 *
 * The laws encoded here (each pinned by tests in __tests__/):
 *
 * 1. SUBSTRATE-ONLY MOUNT. A region mounts on the `substrate` layer and
 *    nothing else. The mount-target vocabulary is CLOSED: `flow`, `intent`,
 *    `attachment` and `annotation` are rejected by name, quoting the
 *    one-concept-per-layer law ("tiles never carry Intent, Attachment, or
 *    Annotation concepts" — ADR-0008 hard condition; ARCHITECTURE.md §2.1).
 *
 * 2. ONE WHOLE-LAYER HOLDER PER REGION. A region is admitted as a single
 *    budget holder with the ADR's id shape `tilemap:substrate:<region>` —
 *    never per-tile admission. Region ids may therefore never contain ':'.
 *
 * 3. THE CATEGORY SEAM (owner question, not a silent cap-widening).
 *    budget.ts has no `substrate` category, and adding one picks a cap — a
 *    taste call this lane must not make. SUBSTRATE_CATEGORY names the
 *    candidate; the seam PROBE is `substrateCategoryMetered(budget)`, which
 *    asks the wired BudgetManager's own caps table whether the category
 *    exists. Until the owner widens BUDGET_CAPS the probe is false and the
 *    ledger REFUSES every claim with `substrate[category-pending]` — even a
 *    ledger wired straight to globalBudget — because wrapper law 3 is "an
 *    unmetered draw is a law breach, regardless of which package draws it"
 *    (and today's manager admits unknown categories UNMETERED at runtime, a
 *    fail-open hole substrateLaw pins as a spike finding). The moment
 *    budget.ts grows the category the seam self-activates: no flag to flip,
 *    no silent widening anywhere.
 *
 * 4. QUAD CAPS METER TO THE LABEL BUDGET. "Metered against the zoom-stage
 *    label/draw budgets" (ADR-0008) is modelled as: every label slot an
 *    altitude earns buys SUBSTRATE_QUADS_PER_LABEL_SLOT substrate quads, so
 *    the substrate follows the same aggregate-don't-shrink curve as the
 *    labels (Z1 earns most, Z4 least). The anchor Z3 = 30 × 40 = 1200 is the
 *    spike target; the multiplier is PROVISIONAL taste, owner-ratifiable.
 *
 * 5. HUE HONESTY BY CONSTRUCTION. Cells carry PALETTE INDICES into the seed
 *    kit's authored sheet (assets/skin-kits/seed-shared-web/palette.png —
 *    64×64 px, sliced 16×16 → 4×4 = 16 slots). No color literal may appear
 *    in this file at all (substrateLaw.test.ts scans it): the pixels belong
 *    to the skin kit, the hues to the kit's authors — never to this code.
 *
 * 6. PARSE, DON'T VALIDATE. parseSubstrateRegion turns wire-shaped input
 *    into a deep-frozen, trusted region with its quad count precomputed;
 *    every downstream check consumes only parsed shapes.
 */
import { LABEL_CAP_BY_ALTITUDE } from "../budget";
import { ALTITUDES, type Altitude } from "../camera";
import { LAYER_ORDER, type LayerName } from "../layerSpec";

// ── error ───────────────────────────────────────────────────────────────────

export class SubstrateFieldError extends Error {
  constructor(code: string, detail: string) {
    super(`substrate[${code}]: ${detail}`);
    this.name = "SubstrateFieldError";
  }
}

// ── the category seam (law 3) ───────────────────────────────────────────────

/** Candidate budget-category name for whole-layer tilemap holders. NOT in
 *  BUDGET_CAPS yet — adding it (and choosing its cap) is the owner question
 *  this spike documents rather than decides. `substrateCategoryMetered`
 *  below turns that question into a live probe, so no flag can rot. */
export const SUBSTRATE_CATEGORY = "substrate" as const;

/** Background nicety — §budget vocabulary ("0 = background nicety"). The
 *  substrate is the bottom stratum: it must be the FIRST thing refused when
 *  a klaxon needs its slot and the LAST thing anyone preempts. Deliberately
 *  below KLAXON_PRIORITY (90), pinned by tests. */
export const SUBSTRATE_PRIORITY = 0;

/** Holder id per the ADR: `tilemap:substrate:<region>`. */
export function substrateHolderId(regionId: string): string {
  return `tilemap:substrate:${regionId}`;
}

// ── mount-target law (law 1) ────────────────────────────────────────────────

/** The ONLY legal tilemap mount layer. The ADR's hard condition is an
 *  allowlist, so the allowed set — not the rejected set — is the source of
 *  truth; the rejection notes below only name the law more precisely. */
export const SUBSTRATE_MOUNT_TARGETS = ["substrate"] as const;
export type SubstrateMountTarget = (typeof SUBSTRATE_MOUNT_TARGETS)[number];

const MOUNT_REJECTION_NOTE: Readonly<Record<LayerName, string>> = Object.freeze({
  substrate: "legal mount target",
  flow: "flow is the additive-emissive signal stratum — substrate material is never signal",
  intent: "tiles never carry Intent concepts (white-only intent ink lives in the intent layer)",
  attachment: "tiles never carry Attachment concepts (zoom-compensated children live in the attachment layer)",
  annotation: "tiles never carry Annotation concepts (screen-pinned labels live in the annotation layer)",
});

function isLayerName(value: string): value is LayerName {
  return (LAYER_ORDER as readonly string[]).includes(value);
}

/** Closed-enum gate: returns "substrate" or throws naming the layer law. */
export function assertSubstrateMountTarget(layer: string): SubstrateMountTarget {
  if ((SUBSTRATE_MOUNT_TARGETS as readonly string[]).includes(layer)) return "substrate";
  const note = isLayerName(layer)
    ? MOUNT_REJECTION_NOTE[layer]
    : `'${layer}' is not a layer of the five-layer stack (${LAYER_ORDER.join(" → ")})`;
  throw new SubstrateFieldError(
    "mount-target",
    `layer '${layer}' is not a legal tilemap mount. ${note} — never let a concept ` +
      "live in two layers (ADR-0008 hard condition; ARCHITECTURE.md §2.1). " +
      "Substrate regions mount on the 'substrate' layer only.",
  );
}

// ── altitude quad caps (law 4) ──────────────────────────────────────────────

/** PROVISIONAL taste row (owner question): substrate quads bought per label
 *  slot at each altitude. 40 keeps the spike's anchor exact —
 *  Z3: LABEL_CAP 30 × 40 = 1200 quads ("Z3 ≤ 1200 target"). */
export const SUBSTRATE_QUADS_PER_LABEL_SLOT = 40;

export const QUAD_CAP_BY_ALTITUDE: Readonly<Record<Altitude, number>> = Object.freeze(
  Object.fromEntries(
    ALTITUDES.map((altitude) => [
      altitude,
      LABEL_CAP_BY_ALTITUDE[altitude] * SUBSTRATE_QUADS_PER_LABEL_SLOT,
    ]),
  ) as Record<Altitude, number>,
);

function requireAltitude(value: unknown): Altitude {
  if (typeof value !== "string" || !(ALTITUDES as readonly string[]).includes(value)) {
    throw new SubstrateFieldError(
      "bad-altitude",
      `'${String(value)}' is not an altitude of the camera ladder (${ALTITUDES.join(", ")})`,
    );
  }
  return value as Altitude;
}

// ── palette law (law 5) ─────────────────────────────────────────────────────

export interface SubstratePalette {
  /** Kit-relative sheet; the color authority. Never opened by this file. */
  readonly sheet: string;
  readonly widthPx: number;
  readonly heightPx: number;
  readonly tileWidthPx: number;
  readonly tileHeightPx: number;
  readonly cols: number;
  readonly rows: number;
}

/** The seed kit's authored palette: palette.png is a 64×64 px card
 *  (kit.json: dominant + two accent quadrants). Sliced at 16 px this yields
 *  exactly 16 slots — and 16 is @pixi/tilemap's TEXTURES_PER_TILEMAP default,
 *  so a palette's worth of authored tiles stays inside ONE batched tilemap
 *  child per region (spike finding, see README). The hues themselves are
 *  deliberately NOT restated here: kit.json + the PNG are the authority, and
 *  tileField.ts draws sub-rects of the loaded texture, never a color. */
export const SEED_SHARED_WEB_PALETTE: SubstratePalette = Object.freeze({
  sheet: "assets/skin-kits/seed-shared-web/palette.png",
  widthPx: 64,
  heightPx: 64,
  tileWidthPx: 16,
  tileHeightPx: 16,
  cols: 4,
  rows: 4,
});

function requirePositiveInt(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new SubstrateFieldError(
      "bad-value",
      `${label} must be a positive integer, got ${String(value)}`,
    );
  }
  return value;
}

/** Parse (and geometry-prove) a palette. A sheet whose grid does not tile
 *  exactly is an authoring error, not something to silently floor. */
export function parseSubstratePalette(input: Partial<SubstratePalette> | undefined): SubstratePalette {
  const merged: SubstratePalette = { ...SEED_SHARED_WEB_PALETTE, ...input };
  const widthPx = requirePositiveInt(merged.widthPx, "palette.widthPx");
  const heightPx = requirePositiveInt(merged.heightPx, "palette.heightPx");
  const tileWidthPx = requirePositiveInt(merged.tileWidthPx, "palette.tileWidthPx");
  const tileHeightPx = requirePositiveInt(merged.tileHeightPx, "palette.tileHeightPx");
  if (widthPx % tileWidthPx !== 0 || heightPx % tileHeightPx !== 0) {
    throw new SubstrateFieldError(
      "bad-palette",
      `sheet ${widthPx}×${heightPx} does not tile exactly at ${tileWidthPx}×${tileHeightPx} — ` +
        `remainder is frame bleed, not a tile slot (kit bleed law: 'any marker color away from ` +
        `its corner proves bleed; any half-slot proves a wrong grid')`,
    );
  }
  const palette: SubstratePalette = Object.freeze({
    sheet: typeof merged.sheet === "string" && merged.sheet.length > 0 ? merged.sheet : SEED_SHARED_WEB_PALETTE.sheet,
    widthPx,
    heightPx,
    tileWidthPx,
    tileHeightPx,
    cols: widthPx / tileWidthPx,
    rows: heightPx / tileHeightPx,
  });
  return palette;
}

export function paletteSlotCount(palette: SubstratePalette): number {
  return palette.cols * palette.rows;
}

/** Slot index → sub-rect of the sheet (row-major, origin top-left). */
export function slotOf(
  tileIndex: number,
  palette: SubstratePalette,
): { readonly u: number; readonly v: number; readonly tileWidth: number; readonly tileHeight: number } {
  const slots = paletteSlotCount(palette);
  if (!Number.isInteger(tileIndex) || tileIndex < 0 || tileIndex >= slots) {
    // The same wall parseSubstrateRegion raises at authoring time — kept here
    // so the materializer can trust indices without re-validating grids.
    throw new SubstrateFieldError(
      "tile-index",
      `slot ${String(tileIndex)} escapes the palette '${palette.sheet}' ` +
        `(${palette.cols}×${palette.rows} = ${slots} slots, indices 0..${slots - 1})`,
    );
  }
  return {
    u: (tileIndex % palette.cols) * palette.tileWidthPx,
    v: Math.floor(tileIndex / palette.cols) * palette.tileHeightPx,
    tileWidth: palette.tileWidthPx,
    tileHeight: palette.tileHeightPx,
  };
}

// ── the region (law 2 + law 6) ──────────────────────────────────────────────

/** A cell is an authored palette slot, or null = no quad drawn there.
 *  Null is how the field STAYS substrate: an authored tile index can carry
 *  no more meaning than material — which is exactly the point. */
export type SubstrateCell = number | null;

export interface SubstrateRegionInput {
  readonly regionId: string;
  /** Wire-shaped on purpose: parsed against the closed mount enum. */
  readonly mountLayer: string;
  /** Row-major grid of authored tile indices (null = empty). */
  readonly cells: readonly (readonly SubstrateCell[])[];
  /** World units per tile edge. Default 16 (1 texel : 1 world unit at 1:1). */
  readonly tileWorldSize?: number;
  readonly palette?: Partial<SubstratePalette>;
}

export interface ParsedSubstrateRegion {
  readonly regionId: string;
  readonly mountLayer: SubstrateMountTarget;
  readonly palette: SubstratePalette;
  readonly tileWorldSize: number;
  readonly cells: readonly (readonly SubstrateCell[])[];
  readonly cols: number;
  readonly rows: number;
  /** Non-null cells = quads the materializer will write. Precomputed at
   *  parse (law 6) so admission is arithmetic, never a re-walk. */
  readonly quads: number;
}

const REGION_ID = /^[a-z][a-z0-9-]*$/;

/** Parse a region request into trusted, frozen form. Throws
 *  SubstrateFieldError naming the broken law on ANY deviation. */
export function parseSubstrateRegion(input: SubstrateRegionInput): ParsedSubstrateRegion {
  const { regionId } = input;
  if (typeof regionId !== "string" || !REGION_ID.test(regionId)) {
    throw new SubstrateFieldError(
      "bad-region-id",
      `region id '${String(regionId)}' must match ${REGION_ID.source} — a colon would ` +
        "break the holder id 'tilemap:substrate:<region>' addressing (law 2)",
    );
  }
  const mountLayer = assertSubstrateMountTarget(String(input.mountLayer));
  const palette = parseSubstratePalette(input.palette);
  const tileWorldSize =
    input.tileWorldSize === undefined ? 16 : requirePositiveInt(input.tileWorldSize, "tileWorldSize");

  const cells = input.cells;
  if (!Array.isArray(cells) || cells.length === 0) {
    throw new SubstrateFieldError("bad-grid", `region '${regionId}' carries no cell grid`);
  }
  const cols = cells[0]?.length ?? 0;
  if (cols === 0) {
    throw new SubstrateFieldError("bad-grid", `region '${regionId}' grid row 0 is empty`);
  }
  const slots = paletteSlotCount(palette);
  let quads = 0;
  for (const [rowIndex, row] of cells.entries()) {
    if (row.length !== cols) {
      throw new SubstrateFieldError(
        "bad-grid",
        `region '${regionId}' row ${rowIndex} has ${row.length} cells, row 0 has ${cols} — ragged grids are authoring errors`,
      );
    }
    for (const [colIndex, cell] of row.entries()) {
      if (cell === null) continue;
      if (!Number.isInteger(cell) || cell < 0 || cell >= slots) {
        throw new SubstrateFieldError(
          "tile-index",
          `region '${regionId}' cell (${colIndex},${rowIndex}) = ${String(cell)} escapes the palette ` +
            `'${palette.sheet}' (${palette.cols}×${palette.rows} = ${slots} slots, indices 0..${slots - 1})`,
        );
      }
      quads += 1;
    }
  }
  if (quads === 0) {
    throw new SubstrateFieldError(
      "bad-grid",
      `region '${regionId}' is all-empty — a holder with zero quads is an unmetered nothing, author at least one tile`,
    );
  }

  return Object.freeze({
    regionId,
    mountLayer,
    palette,
    tileWorldSize,
    cells: Object.freeze(cells.map((row) => Object.freeze([...row]))),
    cols,
    rows: cells.length,
    quads,
  });
}

// ── admission model (law 2 + law 3) ────────────────────────────────────────

/** The slice of BudgetManager this ledger speaks to — shaped so the REAL
 *  BudgetManager structurally satisfies it the moment budget.ts widens
 *  BudgetCategory with 'substrate' (method bivariance does the typing; this
 *  lane adds no fields the manager cannot carry). */
export interface SubstrateAdmitRequest {
  readonly id: string;
  readonly category: string;
  readonly priority: number;
  readonly region?: string;
}

export type SubstrateAdmitResult =
  | { readonly admitted: true; readonly evicted?: readonly string[] }
  | { readonly admitted: false; readonly reason: string; readonly clusterId: string };

export interface SubstrateBudgetPort {
  admit(request: SubstrateAdmitRequest): SubstrateAdmitResult;
  release(id: string): void;
  /** Live view of the caps table — the ONLY honest way to ask whether a
   *  manager meters a category: BudgetSnapshot.caps mirrors BUDGET_CAPS. */
  snapshot(): { readonly caps: Readonly<Record<string, number | undefined>> };
}

/** The seam's live probe: does this budget manager actually have a cap for
 *  `substrate`? Today budget.ts says NO — so wiring globalBudget here throws
 *  `category-pending` instead of riding its unknown-category fail-open (see
 *  substrateField.test.ts, "fail-open hazard"). The day budget.ts adds
 *  `substrate: N` to BUDGET_CAPS, admit() meters correctly by its own
 *  existing logic and this probe flips true on its own — nothing to rename,
 *  nothing to re-wire, no flag to flip. */
export function substrateCategoryMetered(budget: SubstrateBudgetPort): boolean {
  return SUBSTRATE_CATEGORY in budget.snapshot().caps;
}

export type SubstrateAcquireResult =
  | {
      readonly acquired: true;
      readonly refreshed: boolean;
      readonly holderId: string;
      readonly evicted: readonly string[];
    }
  | {
      readonly acquired: false;
      readonly reason: "quad-budget" | "category-budget";
      readonly holderId: string;
      readonly quads: number;
      readonly cap: number;
      readonly altitude: Altitude;
      readonly refusal?: string;
      readonly clusterId?: string;
      readonly kept: readonly string[];
    };

export interface SubstrateHolderView {
  readonly holderId: string;
  readonly regionId: string;
  readonly quads: number;
  readonly altitude: Altitude;
}

export interface SubstrateLedgerSnapshot {
  readonly holders: readonly SubstrateHolderView[];
  readonly totalQuads: number;
  readonly quadsByRegion: Readonly<Record<string, number>>;
}

interface LiveRegion {
  readonly region: ParsedSubstrateRegion;
  readonly altitude: Altitude;
}

/**
 * The region ledger: parse → meter (quad cap) → probe (seam live?) → claim
 * (whole-layer holder).
 *
 * A ledger with NO port, or a port whose caps table lacks `substrate`,
 * refuses claims with `substrate[category-pending]` — never a silent local
 * counter: wrapper law 3 forbids unmetered draws, and the fail-open shape of
 * today's BudgetManager on unknown categories (spike finding) is exactly
 * what the probe fences. The first-mount commit wires the real manager the
 * day budget.ts carries the owner's cap.
 */
export class SubstrateLedger {
  private readonly budget: SubstrateBudgetPort | null;
  private readonly live = new Map<string, LiveRegion>();
  private disposed = false;

  constructor(deps: { readonly budget?: SubstrateBudgetPort | null } = {}) {
    this.budget = deps.budget ?? null;
  }

  /** Live region ids, parse order (regions are independent draws; order is
   *  the substrate layer's child order, not a z-decision — the stack owns z). */
  liveRegions(): readonly string[] {
    return [...this.live.keys()];
  }

  /**
   * Acquire one region at one altitude. The input is PARSED first (illegal
   * shapes throw naming their law — before any claim is touched), then the
   * quad cap meters the field, then the holder claims its slot. A refusal
   * never touches the live set and is always reported, never silent.
   */
  acquire(input: SubstrateRegionInput, altitude: Altitude): SubstrateAcquireResult {
    if (this.disposed) {
      throw new SubstrateFieldError("disposed", "this SubstrateLedger has been disposed");
    }
    const region = parseSubstrateRegion(input);
    const altitudeNow = requireAltitude(altitude);
    const holderId = substrateHolderId(region.regionId);

    const existing = this.live.get(region.regionId);

    // Law 2: one holder per region — re-acquiring replaces the FIELD
    // (author re-edit), never the holder. The new content meters at the
    // requested altitude first; a breach keeps the previous field live.
    const cap = QUAD_CAP_BY_ALTITUDE[altitudeNow];
    if (region.quads > cap) {
      return {
        acquired: false,
        reason: "quad-budget",
        holderId,
        quads: region.quads,
        cap,
        altitude: altitudeNow,
        kept: this.liveRegions(),
      };
    }

    if (this.budget === null || !substrateCategoryMetered(this.budget)) {
      throw new SubstrateFieldError(
        "category-pending",
        `'${region.regionId}' (${region.quads} quads) would be an UNMETERED draw: the wired budget ` +
          `manager has no '${SUBSTRATE_CATEGORY}' cap in BUDGET_CAPS yet. Adding the category + cap ` +
          "is the owner decision this seam waits on (ADR-0008 wrapper law 3: an unmetered draw is a " +
          "law breach). The quad cap above was still checked — the arithmetic is real even while the " +
          "claim is parked — and the claim self-activates the moment the caps table carries 'substrate'.",
      );
    }

    const admission = this.budget.admit(this.admitRequest(region, altitudeNow));
    if (!admission.admitted) {
      return {
        acquired: false,
        reason: "category-budget",
        holderId,
        quads: region.quads,
        cap,
        altitude: altitudeNow,
        refusal: admission.reason,
        clusterId: admission.clusterId,
        kept: this.liveRegions(),
      };
    }

    this.live.set(region.regionId, { region, altitude: altitudeNow });
    return {
      acquired: true,
      refreshed: existing !== undefined,
      holderId,
      evicted: admission.evicted ?? [],
    };
  }

  /** Release one region's holder. Returns whether it was live — teardown
   *  races get a boolean, not a throw (atomic predictability). */
  release(regionId: string): boolean {
    if (this.disposed) return false;
    const wasLive = this.live.delete(regionId);
    if (wasLive && this.budget !== null) {
      this.budget.release(substrateHolderId(regionId));
    }
    return wasLive;
  }

  /** The ledger's view for the ChromaMeter-adjacent instruments. */
  snapshot(): SubstrateLedgerSnapshot {
    const holders: SubstrateHolderView[] = [];
    const quadsByRegion: Record<string, number> = {};
    let totalQuads = 0;
    for (const { region, altitude } of this.live.values()) {
      holders.push({
        holderId: substrateHolderId(region.regionId),
        regionId: region.regionId,
        quads: region.quads,
        altitude,
      });
      quadsByRegion[region.regionId] = region.quads;
      totalQuads += region.quads;
    }
    return Object.freeze({
      holders: Object.freeze(holders),
      totalQuads,
      quadsByRegion: Object.freeze(quadsByRegion),
    });
  }

  /** Release every holder. Idempotent. */
  dispose(): void {
    if (this.disposed) return;
    for (const regionId of this.live.keys()) {
      if (this.budget !== null) this.budget.release(substrateHolderId(regionId));
    }
    this.live.clear();
    this.disposed = true;
  }

  private admitRequest(region: ParsedSubstrateRegion, altitude: Altitude): SubstrateAdmitRequest {
    return {
      id: substrateHolderId(region.regionId),
      category: SUBSTRATE_CATEGORY,
      priority: SUBSTRATE_PRIORITY,
      region: altitude, // cluster addressing by stage: refusals fold per zoom-stage
    };
  }
}
