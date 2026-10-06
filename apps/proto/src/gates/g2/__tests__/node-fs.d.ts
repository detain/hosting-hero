/**
 * Minimal ambient types for the corpus drift-pin test ONLY.
 * The workspace ships no @types/node (tsconfig.base types: []) — same
 * stub pattern as packages/sim-core/src/waves/__tests__/node-fs.d.ts.
 * (If a sibling proto lane adds its own node:fs stub, deduplicate here.)
 */
declare module "node:fs" {
  export function readFileSync(path: string, encoding: "utf8"): string;
  export function existsSync(path: string): boolean;
}

declare module "node:path" {
  export function join(...parts: string[]): string;
}

declare const process: { cwd(): string };
