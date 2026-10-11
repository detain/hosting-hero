/**
 * Ambient stub MERGE (same law as node-fs-scan.d.ts next door — proto ships no
 * @types/node, tsconfig.base types: []): only the node:url member the
 * deathWatch drift-pin needs to resolve the ENGINE source path. Distinct
 * members only, so the ambient module declarations merge with g2's node:fs /
 * node:path stubs; do NOT redeclare anything they already own.
 */
declare module "node:url" {
  export function fileURLToPath(url: string | URL): string;
}
