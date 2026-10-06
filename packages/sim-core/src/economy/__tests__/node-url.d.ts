/**
 * Minimal ambient types for the economy tests that resolve fixture paths off
 * `import.meta.url`. The workspace ships no @types/node (tsconfig.base
 * types: []) — this stub covers ONLY `fileURLToPath`, the one node:url export
 * contract.test.ts needs (same pattern as src/loader/__tests__/node-fs.d.ts
 * and src/waves/__tests__/node-fs.d.ts).
 */
declare module "node:url" {
  export function fileURLToPath(url: URL | string): string;
}
