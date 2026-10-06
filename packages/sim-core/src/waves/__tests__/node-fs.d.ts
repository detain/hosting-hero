/**
 * Minimal ambient types for the read-only content-validation test.
 * The workspace deliberately ships no @types/node (tsconfig.base types: [])
 * — this stub covers ONLY what src/waves/__tests__/content.test.ts touches.
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

/** Vitest 4 no longer leaks `lib.dom` via vite/client — declare the structured
 *  clone helper fixtures.ts/table.test.ts use to deep-copy parsed tables. */
declare function structuredClone<T>(value: T): T;
