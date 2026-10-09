/**
 * Ambient declaration for the Vite `?raw` JSON import consumed by
 * simCoreRunner.ts (the authored shared-web bundle's familyWeights table).
 * The MAIN tsconfig gets this wildcard from `vite/client`, but the worker
 * tsconfig runs with `types: []` (WebWorker lib only) and includes
 * src/runner/** — so the module would otherwise fail to resolve there.
 * Shape mirrors vite/client's `*?raw` contract exactly: default-exported
 * source string. (Precedent: g2's node-fs.d.ts, chrome's node-fs-scan.d.ts.)
 */
declare module "*.json?raw" {
  const source: string;
  export default source;
}
