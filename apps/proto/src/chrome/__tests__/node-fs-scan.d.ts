/**
 * Ambient stub MERGE (same law as gates/g2/__tests__/node-fs.d.ts — proto has
 * no @types/node): the two extra node:fs members the hueLaw directory walk
 * needs. Distinct members, so the ambient module declarations merge; do NOT
 * redeclare anything g2's stub already owns.
 */
declare module "node:fs" {
  export function readdirSync(path: string): string[];
  export function statSync(path: string): { isDirectory(): boolean };
}
