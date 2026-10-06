/**
 * `@hh/sim-core/kernel` entry — aggregates the kernel/ directory WITHOUT
 * living inside it (that directory is owned by the kernel workstream, which
 * has not shipped its own barrel). If kernel/ ever grows an index.ts, repoint
 * the "./kernel" export there and delete this file.
 *
 * Specifiers carry explicit `.ts` so plain Node (`--experimental-transform-
 * types`) can resolve them; `allowImportingTsExtensions` covers tsc and
 * Vite/vitest resolve explicit extensions natively.
 */

export * from "./kernel/fixed.ts";
export * from "./kernel/time.ts";
export * from "./kernel/rng.ts";
