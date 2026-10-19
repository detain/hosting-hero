/**
 * lab/ — the browser bench for the SIM-CORE SERVICES that have no live tick:
 * the unattended weekend engine (@hh/sim-core/unattended), the coverage
 * grid (@hh/sim-core/coverage), and the campaign epilogue bench
 * (@hh/sim-core/campaign — wave-31 ask (i)). One rail entry ("Sim Lab"),
 * internal tabs.
 *
 * Not gates (the §9.13 six are frozen in gates/index.ts); the sandbox
 * mechanic is the precedent — a view the shell mounts outside ALL_GATE_MOUNTS.
 *
 * Explicit barrel (replay/coverage discipline): names only.
 */
export { default as SimLabPanel } from "./SimLabPanel.vue";
export { default as UnattendedLabPanel } from "./UnattendedLabPanel.vue";
export { default as CoverageGridPanel } from "./CoverageGridPanel.vue";
export { default as CampaignEpiloguePanel } from "./CampaignEpiloguePanel.vue";

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
  ratifiedNote,
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

export {
  EPILOGUE_ARMS,
  EPILOGUE_MAX_OFFSET,
  EPILOGUE_MIN_OFFSET,
  epilogueFixtureState,
  epilogueProseFor,
  epilogueViewFor,
  runEpilogue,
  runEpilogueArm,
  runEpilogueDoc,
} from "./campaignLab";
export type {
  EpilogueAdjustmentRow,
  EpilogueArm,
  EpilogueEvidenceRow,
  EpilogueExitLedger,
  EpiloguePanelState,
  EpilogueProse,
  EpilogueRunRecord,
  EpilogueStage,
  EpilogueView,
} from "./campaignLab";
