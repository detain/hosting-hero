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

interface ImportMeta {
  readonly url: string;
}

declare class URL {
  constructor(url: string, base?: string);
}

/** Monotonic clock surface journal.test.ts's perf pins need (same no-@types
 *  reason as above; Node + browsers both provide it at runtime). */
declare const performance: { now(): number };
