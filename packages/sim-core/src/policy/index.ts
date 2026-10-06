/**
 * `policy/` — the closed-enum Policy-Card interpreter (Appendix B grammar)
 * for pipeline slot 12.5: pure, deterministic, enqueue-only
 * (MASTER_REPORT §4.5, CONVENTIONS §1.1).
 *
 * Import surface for sibling modules:
 *  - pipeline: `runRulePhase` / `createRulePhaseStep` + config types
 *  - economy/step-12: nothing (this module only READS the observed map)
 *  - save/replay: `serializeState` / `restoreState` / `serializeFireLog`
 *  - editor/UI hosts: store + `detectConflicts` + routing table
 */

export * from "./grammar.ts";
export * from "./store.ts";
export * from "./graph.ts";
export * from "./evaluator.ts";
export * from "./conflicts.ts";
export * from "./routing.ts";
