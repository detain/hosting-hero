/**
 * Minimal ambient types for the scenario tests that read content JSON off
 * disk (eraAvailability.test.ts — era-dating.test.ts's path law). The
 * workspace ships no @types/node (tsconfig.base types: []); `node:fs` +
 * the URL surface already ride ../economy/__tests__/node-url.d.ts — this
 * stub adds ONLY `join` + `process.cwd`, declared with the EXACT same
 * signatures as src/loader/__tests__/node-fs.d.ts and
 * src/waves/__tests__/node-fs.d.ts so the package-wide program merges
 * them as one overload (no duplicate-const hazard).
 */
declare module "node:path" {
  export function join(...parts: string[]): string;
}

declare const process: { cwd(): string };
