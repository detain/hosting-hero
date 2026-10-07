/**
 * unattended/index.ts — explicit barrel for the unattended-sim engine
 * service (WS-8 "The Long Weekend", §9.2): declarative catastrophe guards,
 * the fast-forward runner, and the What-Would-Break forward sim.
 *
 * Explicit names only (versus/coverage precedent — the api-verify gate
 * reads this file and every row of docs/API-REFERENCE.md ## unattended).
 */

export {
  BUILTIN_CATASTROPHE_DEFS,
  GUARD_COMPARATORS,
  GUARD_KINDS,
  GUARD_METRICS,
  UnattendedError,
  evaluateGuardrail,
  guardFixedFromInt,
  guardKindCensus,
  guardReasonCode,
  parseCatastropheDef,
  parseGuardList,
  percentToFixed,
  ruleRunawayDefaultPerMin,
} from "./guardrails.ts";
export type {
  CascadeCollapseDef,
  CatastropheDef,
  ErrorBudgetGoneDef,
  FreeCashDepletedDef,
  GuardComparator,
  GuardEvaluation,
  GuardKind,
  GuardMetric,
  GuardVerdict,
  GuardrailSample,
  ParsedGuard,
  RuleRunawayDef,
  ThresholdGuardDef,
  TotalOutageDef,
  UnattendedErrorCode,
} from "./guardrails.ts";

export {
  DEFAULT_CHECKPOINT_EVERY,
  GUARD_TRAILING_WINDOW_MIN,
  LONG_WEEKEND_MAX_TICKS,
  NODE_DEGRADED_RHO_GTE,
  UNATTENDED_AGGRESSION,
  UNATTENDED_BASELINE_RATE_PER_MIN,
  UNATTENDED_CLASSES,
  UNATTENDED_DEFAULT_PATIENCE_MIN,
  UNATTENDED_EXPRESS_MAX_CONFIDENCE,
  UNATTENDED_RETRY,
  budgetMinRemainingSec,
  buildPipelineConfig,
  mintBoardEdges,
  mintInitialState,
  mintNodeRecords,
  runUnattended,
} from "./fastForward.ts";
export type {
  RunUnattendedConfig,
  UnattendedBoardCast,
  UnattendedCheckpoint,
  UnattendedEdgeSpec,
  UnattendedHourBucket,
  UnattendedMoneyConfig,
  UnattendedNodeSpec,
  UnattendedOpexDraft,
  UnattendedReport,
  UnattendedStop,
  UnattendedSummary,
  UnattendedTrafficConfig,
} from "./fastForward.ts";

export {
  DEFAULT_WHATIF_CHECKPOINT_EVERY,
  WHATIF_DELTA_KINDS,
  applyWhatIfDelta,
  guardsInConfig,
  runWhatIf,
} from "./whatIf.ts";
export type {
  DisableDefenseDelta,
  RemoveNodeDelta,
  RunWhatIfConfig,
  TrafficSurgeDelta,
  WhatIfDelta,
  WhatIfDeltaKind,
  WhatIfDeltaSummary,
  WhatIfResult,
} from "./whatIf.ts";
