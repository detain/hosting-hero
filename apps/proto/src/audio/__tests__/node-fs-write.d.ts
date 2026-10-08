/**
 * Ambient MERGE of the "node:fs" module stub for proto's DOM-lib tsconfig
 * (no @types/node in this package). Sibling law-test stubs own
 * readFileSync/readdirSync/existsSync/statSync (g2 + chrome twins) — this
 * file adds ONLY the two write members audioLaw.test.ts needs to plant and
 * remove its LIVE red-tree probe. NEVER re-declare a member another stub
 * already owns (the ambient merge collides on duplicates).
 */
declare module "node:fs" {
  export function writeFileSync(path: string, data: string, encoding: "utf8"): void;
  export function rmSync(path: string, options?: { force?: boolean }): void;
}
