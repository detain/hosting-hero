/**
 * Minimal ambient types for the read-only registry tests.
 * The workspace deliberately ships no @types/node (tsconfig.base types: [])
 * — this stub covers ONLY what src/coverage/__tests__/*.test.ts touches
 * (waves/__tests__/node-fs.d.ts pattern).
 */
declare module "node:fs" {
  export function readFileSync(path: string, encoding: "utf8"): string;
  export function existsSync(path: string): boolean;
}

declare module "node:path" {
  export function join(...parts: string[]): string;
}

declare const process: { cwd(): string };
