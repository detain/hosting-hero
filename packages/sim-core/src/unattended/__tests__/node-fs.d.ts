/**
 * Minimal ambient types for unattended tests that read repo sources off
 * disk (upkeep-fold.test.ts — the import-direction law census). The
 * workspace ships no @types/node (tsconfig.base types: []); `readFileSync`
 * and `readdirSync` are declared with the EXACT same signatures as
 * src/loader/__tests__/node-fs.d.ts so the package-wide program merges
 * them as one overload (no duplicate-const hazard — the scenario stub's
 * precedent). Only the names-only readdirSync surface is needed: the walk
 * filters `.ts` suffixes and recurses only into dot-less entries.
 */
declare module "node:fs" {
  export function readFileSync(path: string, encoding: "utf8"): string;
  export function readdirSync(path: string): string[];
}

declare module "node:path" {
  export function join(...parts: string[]): string;
}

declare const process: { cwd(): string };
