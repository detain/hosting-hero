/**
 * versus/ — async Red-vs-Blue deck law (ADR-0004, ratified): drafted
 * decks, blind commits, deterministic 1-of-3 drafts, deck→WaveTable
 * conversion, and offline match resolution against a committed defender.
 *
 * Barrel discipline: EXPLICIT named exports only (replay-style, no bare
 * export *) so the root re-export collision census is auditable.
 *
 *   deck.ts    — ThreatDeck/DefenseDeck documents + strict boundary parsers
 *   draft.ts   — seeded 1-of-3 draft picker + drafted-deck validator
 *   commit.ts  — blind-commit envelope (canonical fold, reveal-verify)
 *   match.ts   — deck→WaveTable conversion + composed async resolution
 *
 * Import rule: this dir reads ../types, ../kernel, ../waves, ../pipeline,
 * ../policy, ../observed, ../replay, ../internal — and NEVER economy
 * (OD-1/OD-2 unchosen: score = caller-supplied weights as data).
 */

/* deck.ts */
export {
  AFFIX_VOCABULARY,
  DECK_LEGALITY_CODES,
  MAX_DECK_ENTRIES,
  MAX_DECK_THREATS,
  MAX_THREATS_PER_DENOMINATION,
  MIN_DISTINCT_ROLES,
  VersusError,
  buildCounterMap,
  buildRegistryCensus,
  deckLegalityViolations,
  parseDefenseDeck,
  parseThreatDeck,
} from "./deck.ts";
export type {
  DeckLegalityCode,
  DeckLegalityViolation,
  DefenseDeck,
  DefenseDeckParseOptions,
  ThreatAffix,
  ThreatCensusEntry,
  ThreatDeck,
  ThreatDeckEntry,
  ThreatDeckParseOptions,
  VersusErrorCode,
} from "./deck.ts";

/* draft.ts */
export {
  DRAFT_VIOLATION_CODES,
  draftThreatDeck,
  validateDraftedDeck,
} from "./draft.ts";
export type {
  DraftCandidate,
  DraftOptions,
  DraftOutcome,
  DraftPresentation,
  DraftValidationInput,
  DraftViolation,
  DraftViolationCode,
} from "./draft.ts";

/* commit.ts */
export {
  VERSUS_HASH_DOMAIN,
  commitDeck,
  deckCanonicalJson,
  revealAndVerify,
} from "./commit.ts";
export type {
  CommittableDeck,
  DeckCommitment,
  RevealVerdict,
} from "./commit.ts";

/* match.ts */
export {
  DEFAULT_MATCH_WEIGHTS,
  VERSUS_DEFAULT_DECAY_MINUTES,
  VERSUS_DEFAULT_PLATEAU_MINUTES,
  VERSUS_DEFAULT_RAMP_MINUTES,
  VERSUS_DEFAULT_WINDOW_MINUTES,
  VERSUS_PAR_LADDER_PCT,
  VERSUS_SHARE_LADDERS,
  VERSUS_WAVE_COUNT,
  createVersusRunner,
  initialVersusRunState,
  deckToWaveTable,
  resolveVersusMatch,
  scoreVersusMatch,
  stampReserveIntents,
  versusRuleBookHash,
} from "./match.ts";
export type {
  DeckSchedule,
  DeckScheduleOptions,
  DefenderCommit,
  MatchResult,
  MatchScoringWeights,
  OutcomeCounters,
  OutcomeTotals,
  PerWaveOutcome,
  ReserveIntentCommit,
  ScheduledWaveRow,
  VersusEdgeCommit,
  VersusMatchConfig,
  VersusNodeCommit,
  VersusReserveIntent,
  VersusRunState,
} from "./match.ts";
