/**
 * `@hh/sim-core/src/unlocks` barrel — the §5 unlock-trigger engine v0.
 * EXPLICIT name list (no star), the versus/coverage/unattended pattern:
 * every name here needs a row in docs/API-REFERENCE.md `## unlocks`
 * (docs/api-verify.test.mjs polices both directions by name).
 */

export type { UnlockTriggerKind, UnlockDeclaredKind } from "./triggers.ts";
export { UNLOCK_TRIGGER_KINDS, UNLOCK_DECLARED_KINDS } from "./triggers.ts";
export type { UnlockProposal, UnlocksErrorCode } from "./triggers.ts";
export { UnlocksError } from "./triggers.ts";
export type { MilestoneThreshold, UnlockObserverConfig } from "./triggers.ts";
export { DEFAULT_UNLOCK_OBSERVER_CONFIG, parseUnlockObserverConfig } from "./triggers.ts";
export type { UnlockNoticeLike, UnlockDeclaration, UnlockTickInput, UnlockCounters, UnlockObservation } from "./triggers.ts";
export { UNATTRIBUTED_NODE, observeUnlockWindow } from "./triggers.ts";
export { scarTrigger, milestoneTrigger, eraTrigger, declaredTrigger, evaluateUnlockTriggers } from "./triggers.ts";
export type { UnlockObserver } from "./triggers.ts";
export { createUnlockObserver } from "./triggers.ts";

export type { PrereqSetLike, ParsedPrereqSet, PrereqBlocker, SatisfiedSet } from "./prereqs.ts";
export { parsePrereqSets, canUnlock, whatBlocks } from "./prereqs.ts";

export type { CodexStage, WeatherDemotionBand, CodexCounters, CodexLadderConfig, CodexGap } from "./codexLadder.ts";
export { CODEX_STAGES, WEATHER_DEMOTION_BAND, CODEX_LADDER_DEFAULTS, codexStageFor, nextCodexGap, isDemotedToWeather } from "./codexLadder.ts";
