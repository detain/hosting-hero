/**
 * decision/ — the Decision Highlight lane (§7.6). Explicit barrel, no star:
 * every name here is a shipped surface (repo barrel law).
 *
 *  - annotate.ts — PURE fork derivation + ranking (no Vue, no budget, no
 *    timers): the five v0 kinds and their §7.6(a/b/c) signals.
 *  - tracker.ts  — the repo's first `markedDecision` budget producer:
 *    claim/supersede/consume choreography against any BudgetManager port.
 *  - DecisionRail.vue — the thin "Now list" (§7.6) with the white corner
 *    bracket, "+N" overflow honesty, and Explain-This-Number registration.
 */
export {
  DECISION_GATES,
  DECISION_KINDS,
  DECISION_SCORE_WEIGHTS,
  DECISION_WINDOWS,
  DecisionError,
  deriveDecisionCandidates,
  parseRefusalDetail,
  type DecisionAnnotation,
  type DecisionFrame,
  type DecisionKind,
  type DecisionSignals,
  type DecisionWindow,
  type ForkOption,
} from "./annotate";
export {
  DECISION_CLUSTER_REGION,
  DECISION_PRIORITY_BASE,
  DECISION_PRIORITY_FLOOR,
  DECISION_PRIORITY_STEP,
  DecisionTracker,
  decisionClaimId,
  priorityForRank,
  type DecisionFrameResult,
} from "./tracker";
export { default as DecisionRail } from "./DecisionRail.vue";
