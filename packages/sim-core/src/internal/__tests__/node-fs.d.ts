/**
 * Minimal ambient types for internal/__tests__/warmth-cost.test.ts, which
 * source-pins pipeline/defaults.ts's as-of law against the tickFold twin
 * (the elasticity.test.ts readFileSync pattern — the workspace ships no
 * @types/node, tsconfig.base types: []). Surface matches
 * src/economy/__tests__/node-url.d.ts and src/loader/__tests__/node-fs.d.ts
 * declarations exactly, so package-wide tsc merges them as one overload
 * (no duplicate-const hazard).
 */
declare module "node:fs" {
  export function readFileSync(path: string, encoding: "utf8"): string;
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
