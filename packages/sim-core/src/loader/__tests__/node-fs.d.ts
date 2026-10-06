/**
 * Minimal ambient types for loader tests that read fixtures/content from
 * disk. The workspace ships no @types/node (tsconfig.base types: []) — this
 * stub covers ONLY what the loader's node-side tests touch (same pattern as
 * src/waves/__tests__/node-fs.d.ts).
 */
declare module "node:fs" {
  export function readFileSync(path: string, encoding: "utf8"): string;
  export function existsSync(path: string): boolean;
  export function readdirSync(path: string): string[];
}

declare module "node:path" {
  export function join(...parts: string[]): string;
}

declare const process: { cwd(): string };
