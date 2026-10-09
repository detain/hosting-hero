/**
 * Minimal ambient types for unlocks tests that read shipped content from
 * disk. The workspace ships no @types/node (tsconfig.base types: []) —
 * this stub covers ONLY the surface prereqs.test.ts touches (same pattern
 * as src/loader/__tests__/node-fs.d.ts; signatures are byte-identical to
 * the loader's so ambient module merging stays conflict-free under the
 * package-wide tsc). Deliberately does NOT declare `URL` — the economy
 * stub owns that global (a second `declare class URL` would collide).
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
