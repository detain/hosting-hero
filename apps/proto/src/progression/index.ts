/**
 * progression/ — the between-levels and after-the-end surfaces §1.6 asked
 * for, as pure mount-ready components for a later weld lane to place.
 * L-G lane (unlocks-consumer + epilogue-in-play): two projections, two
 * cards, zero engine authority. Nothing imports stores; every prop is
 * plain engine-typed data a host already holds.
 */
export { buildUnlockLedger } from "./unlockModel";
export type {
  UnlockLedgerBand,
  UnlockLedgerCard,
  UnlockLedgerInput,
  UnlockLedgerLine,
  UnlockLedgerRow,
  UnlockLedgerView,
} from "./unlockModel";
export { default as UnlockLedger } from "./UnlockLedger.vue";

export { buildEpilogueView } from "./epilogueModel";
export type {
  EpilogueExplain,
  EpilogueFact,
  EpilogueInput,
  EpilogueMoney,
  EpilogueMuseumRow,
  EpilogueView,
} from "./epilogueModel";
export { default as EpilogueCard } from "./EpilogueCard.vue";
