/**
 * Ambient stub MERGE (same law as chrome/__tests__/node-fs-scan.d.ts — proto
 * ships no @types/node): the ONE extra node:fs overload the substrate spike
 * needs to read a PNG's IHDR bytes without Buffer. A distinct signature, so
 * the merged module gains an overload; do NOT redeclare anything the g2 or
 * chrome stubs already own. ("latin1" is Node's one-byte-per-char encoding —
 * exactly what a byte scan needs from a string-typed return.)
 */
declare module "node:fs" {
  export function readFileSync(path: string, encoding: "latin1"): string;
}
