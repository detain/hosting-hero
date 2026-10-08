/**
 * render/substrate/ — the ADR-0008 step-3 tilemap spike seam.
 *
 * Two homes, one law:
 *  - substrateField.ts: the pure region law (mount allowlist, whole-layer
 *    holder accounting, quad caps metered to the label budget, palette-slot
 *    addressing, parse-don't-validate). Pixi-free, node-testable.
 *  - tileField.ts: the repo's ONLY @pixi/tilemap import — CompositeTilemap
 *    materialisation with the sampler-law guard and headless measurement
 *    seams. Vendor-heavy.
 *
 * SPIKE STATUS (README.md in this dir carries the verdict): law-first,
 * NOTHING mounts. No consumer imports this directory yet — substrateLaw
 * scans for that. The first-mount commit owns three things this spike
 * deliberately does not decide: the BUDGET_CAPS 'substrate' category + cap
 * (owner question), region authoring in the skin kits, and the
 * LAYER_ORDER/container wiring.
 */
export {
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
  type ParsedSubstrateRegion,
  type SubstrateAcquireResult,
  type SubstrateAdmitRequest,
  type SubstrateAdmitResult,
  type SubstrateBudgetPort,
  type SubstrateCell,
  type SubstrateHolderView,
  type SubstrateLedgerSnapshot,
  type SubstrateMountTarget,
  type SubstratePalette,
  type SubstrateRegionInput,
} from "./substrateField";
export {
  SUBSTRATE_MAP_LABEL_PREFIX,
  SUBSTRATE_MOUNT_LABEL,
  assertSubstrateMount,
  assertPaletteSamplerLaw,
  materializeRegion,
  mountRegion,
  redrawRegion,
  substrateBatches,
  substrateQuadsHeld,
  unmountRegion,
  writeRegionTiles,
  type SubstrateTilemap,
} from "./tileField";
