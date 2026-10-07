/**
 * Minimal ambient types for the versus lane tests (the workspace ships no
 * @types/node — tsconfig.base types: []). Same shape as
 * src/waves/__tests__/node-fs.d.ts; only readFileSync/JSON fixtures here.
 */
declare module "node:fs" {
  export function readFileSync(path: string, encoding: "utf8"): string;
}

declare module "node:path" {
  export function join(...parts: string[]): string;
}

declare const process: { cwd(): string; memoryUsage(): { heapUsed: number } };

declare function structuredClone<T>(value: T): T;
