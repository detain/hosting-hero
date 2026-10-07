/**
 * `@hh/sim-core` package barrel — the full engine surface: the shared
 * contract (`types.ts`), the deterministic kernel, and every module barrel
 * (pipeline, policy, economy, observed, topology, waves, replay, loader,
 * save).
 *
 * Resolution law (integrator, 2026-10-06): every re-export here uses an
 * EXPLICIT `.ts` specifier so the SAME sources load under vitest/Vite
 * (bundler resolution), tsc (`allowImportingTsExtensions` in
 * tsconfig.base.json), and plain Node `--experimental-transform-types`
 * (which resolves only literal `.ts` paths for runtime imports).
 *
 * Fine-grained consumers should prefer the subpath exports
 * (`@hh/sim-core/pipeline`, `@hh/sim-core/economy`, …) over this barrel.
 */

export * from "./types.ts";
export * from "./kernel.ts";

export * from "./pipeline/index.ts";
export * from "./policy/index.ts";
export * from "./economy/index.ts";
export * from "./observed/index.ts";
export * from "./topology/index.ts";
export * from "./waves/index.ts";
export * from "./replay/index.ts";
export * from "./loader/index.ts";
export * from "./save/index.ts";
/* versus (2026-10-07): explicit-named barrel; the star ride is proven
 * collision-free by tsc — all 69 versus names stay native on the root. */
export * from "./versus/index.ts";
/* coverage (2026-10-07): explicit-named barrel; the star ride is proven
 * collision-free by tsc — all 28 coverage names stay native on the root
 * (grid summary type is CoverageGridSummary, avoiding observed's
 * CoverageSummary by naming, not aliasing). */
export * from "./coverage/index.ts";
/* unattended (2026-10-07): explicit-named barrel (WS-8 Long Weekend); the
 * star ride is proven collision-free by tsc — all names stay native on the
 * root. */
export * from "./unattended/index.ts";

/**
 * Disambiguation (integrator): `stableSerialize` exists in BOTH observed
 * (requires a depth arg, guards the step-12 digest gate) and loader
 * (1-arg, content-bundle hashing). Explicit re-exports beat star-export
 * ambiguity deterministically in tsc and Node; subpath imports of
 * `@hh/sim-core/observed` / `@hh/sim-core/loader` keep their native names.
 */
export { stableSerialize } from "./loader/index.ts";
export { stableSerialize as observedStableSerialize } from "./observed/index.ts";

/**
 * Disambiguation (integrator, save landing): save/ ships its own private
 * canonical-codec fork, clashing with replay's exported family. Flat names
 * stay with replay (established root surface + the replay lane is THE digest
 * authority); save's copies ride `save*` aliases here and keep their native
 * names via `@hh/sim-core/save`. FOLLOW-UP for both owners: one shared
 * canonical codec would retire all four aliases (save's fork digests its own
 * wire shapes, so unifying is a save-agent design call, not mechanical).
 */
export {
  compareCodeUnits,
  fail,
  fnv1a64Hex,
  requireDefined,
} from "./replay/index.ts";
export {
  compareCodeUnits as saveCompareCodeUnits,
  fail as saveFail,
  fnv1a64Hex as saveFnv1a64Hex,
  requireDefined as saveRequireDefined,
} from "./save/index.ts";

/**
 * Disambiguation (integrator): `TuningSheet` clashes — economy's is the
 * `"A"|"B"|"C"` selector union (waves names the same shape `TuningSheetId`),
 * waves' is the sheet data interface. Root keeps the flat name for the data
 * structure; the union rides as `EconomyTuningSheetId`. FOLLOW-UP for the
 * economy owner: rename its type to `TuningSheetId` and this alias dies.
 */
export type { TuningSheet } from "./waves/index.ts";
export type { TuningSheet as EconomyTuningSheetId } from "./economy/index.ts";
