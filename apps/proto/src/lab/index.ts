/**
 * lab/ — the browser bench for the SIM-CORE SERVICES that have no live tick:
 * the unattended weekend engine (@hh/sim-core/unattended) and the coverage
 * grid (@hh/sim-core/coverage). One rail entry ("Sim Lab"), internal tabs.
 *
 * Not gates (the §9.13 six are frozen in gates/index.ts); the sandbox
 * mechanic is the precedent — a view the shell mounts outside ALL_GATE_MOUNTS.
 *
 * Explicit barrel (replay/coverage discipline): names only.
 */
export { default as SimLabPanel } from "./SimLabPanel.vue";
export { default as UnattendedLabPanel } from "./UnattendedLabPanel.vue";
export { default as CoverageGridPanel } from "./CoverageGridPanel.vue";

export {
  BOARD_PRESETS,
  GUARD_COMPARATORS,
  GUARD_KINDS,
  GUARD_METRICS,
  LAB_RULE_BOOK,
  LAB_RULE_BOOK_HASH,
  boardPresetById,
  bucketRows,
  buildDelta,
  buildRunConfig,
  defaultForm,
  defaultGuardRows,
  explainWeekend,
  explainWhatIf,
  guardRowFields,
  guardRowsToRecords,
  parseOpexRows,
  provisionalNote,
  runWeekend,
  runWeekendWhatIf,
  shortDigest,
} from "./unattendedLab";
export type {
  BoardPreset,
  BucketRow,
  GuardRowDraft,
  LabRunOutcome,
  LabStage,
  OpexRowDraft,
  UnattendedLabForm,
  WhatIfDeltaKind,
  WhatIfOutcome,
} from "./unattendedLab";

export {
  DEFENSE_ROLE_IDS,
  THREAT_ROLES,
  buildPalette,
  cellTip,
  coverageProfileFor,
  ladderStyle,
  rosterView,
  slugThreatRole,
  strengthRatio,
} from "./coverageGridModel";
export type { CellTip, CoverageRosterView, LabPalette, LadderStyle, PaletteItem, PaletteKind } from "./coverageGridModel";
