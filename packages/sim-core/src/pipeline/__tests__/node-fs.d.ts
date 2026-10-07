/**
 * Minimal ambient types for pipeline tests that read/write the digest golden
 * fixture from disk. The workspace ships no @types/node (tsconfig.base
 * types: []) — this stub covers ONLY the surface digest-golden.test.ts
 * touches (same pattern as src/loader/__tests__/node-fs.d.ts and
 * src/economy/__tests__/node-url.d.ts).
 */
declare module "node:fs" {
  export function readFileSync(path: string, encoding: "utf8"): string;
  export function writeFileSync(path: string, data: string, encoding?: "utf8"): void;
}

declare module "node:url" {
  export function fileURLToPath(url: URL | string): string;
}

interface ImportMeta {
  readonly url: string;
}

declare class URL {
  constructor(url: string, base?: string);
}
