/**
 * THE SINGLE SIM-CORE IMPORT FUNNEL — swap point #1 of 2 (see README).
 *
 * Every headless module imports sim-core exclusively through this file.
 *
 * WHY relative `.ts` paths instead of `@hh/sim-core`?
 *  - The package's `exports` map currently exposes only `"."` → `src/index.ts`,
 *    and `index.ts` re-exports with *extensionless* relative specifiers, which
 *    Node's ESM resolver rejects at runtime (`ERR_MODULE_NOT_FOUND`). Deep
 *    subpath imports are blocked by the `exports` field.
 *  - `types.ts`, `kernel/fixed.ts`, `kernel/rng.ts`, `kernel/time.ts` have no
 *    runtime imports of their own (`import type` only, erased by Node), so
 *    loading them directly by path is safe in BOTH parity arms.
 *  - `types.ts` contains `export enum`, so the plain-Node arm runs with
 *    `--experimental-transform-types` (documented in README).
 *
 * The same argument holds for `pipeline/defaults.ts` (swap point #2's real
 * composition): it and its siblings (`internal.ts`, `bounce.ts`, `queue.ts`)
 * import each other exclusively with explicit `.ts` specifiers and type-only
 * imports — plain-Node-safe in BOTH parity arms.
 *
 * WHEN sim-core adds subpath exports (`"./types"`, `"./kernel/*"`,
 * `"./pipeline/defaults"`): change the five lines below to bare specifiers
 * and delete this comment. No other file in tools/headless touches sim-core
 * paths.
 */

export * from "../../../packages/sim-core/src/types.ts";

export * as fx from "../../../packages/sim-core/src/kernel/fixed.ts";
export * as streams from "../../../packages/sim-core/src/kernel/rng.ts";
export * as clocks from "../../../packages/sim-core/src/kernel/time.ts";
export * as pipeline from "../../../packages/sim-core/src/pipeline/defaults.ts";
