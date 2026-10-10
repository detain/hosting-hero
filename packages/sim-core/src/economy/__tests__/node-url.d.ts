/**
 * Minimal ambient types for the economy tests that resolve fixture paths off
 * `import.meta.url`. The workspace ships no @types/node (tsconfig.base
 * types: []) — this stub covers ONLY the `fileURLToPath` + WHATWG-URL-ctor +
 * `import.meta.url` surface contract.test.ts needs (same pattern as
 * src/loader/__tests__/node-fs.d.ts and src/waves/__tests__/node-fs.d.ts).
 * Vitest 3 leaked `lib.dom` into the program via a transitive `vite/client`
 * reference; vitest 4 dropped it, so these now declare explicitly.
 */
declare module "node:url" {
  export function fileURLToPath(url: URL | string): string;
}

/** elasticity.test.ts reads pipeline/intent-door.ts to pin the price-key
 *  kind vocabulary against its economy-side mirror. Signature matches
 *  src/loader/__tests__/node-fs.d.ts's declaration exactly, so the package-
 *  wide tsc merges them as one overload (no duplicate-const hazard). */
declare module "node:fs" {
  export function readFileSync(path: string, encoding: "utf8"): string;
}

interface ImportMeta {
  readonly url: string;
}

declare class URL {
  constructor(url: string, base?: string);
}

/** Same declaration waves/__tests__/node-fs.d.ts carries — vitest 4 no
 *  longer leaks lib.dom; elasticity.test.ts forks whole EconomyStates. */
declare function structuredClone<T>(value: T): T;

/** Monotonic clock surface journal.test.ts's perf pins need (same no-@types
 *  reason as above; Node + browsers both provide it at runtime). */
declare const performance: { now(): number };
