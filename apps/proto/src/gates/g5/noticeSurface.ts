/**
 * GATE-G5 · notice-surface contributions — the VOICE seam for the economy
 * notice kinds fix-economy minted (2026-10-09 handoff) plus the OD-25(a)
 * canonical-death pair (lane L4): the wire must not go mute on brand-new
 * events, and where the i18n packs carry no fitting key (covenant-breached)
 * or the pack fails to load, these lines are the graceful fallback voice.
 *
 * LAWS:
 *  - This file is DATA + copy only — no state, no imports from economy
 *    internals; the ticker calls it with the row's `kind` alone.
 *  - Pack prose (i18n/noticeCopy.ts) ALWAYS wins: `voiceEconomyNotice` is a
 *    fallback behind `noticeWireCopy(...) ?? …`, so shipping a pack key
 *    retires the line here without touching the ticker.
 *  - Every string here is marked PROVISIONAL-taste (like the bps deltas
 *    that produced the events); nothing in the packs corpus is implied.
 *  - `company::reputation` OBSERVATION voicing is NOT here — it rides the
 *    frame's `reputation` pane (projection.ts), the cell channel, not the
 *    notice channel.
 */

export const PROVISIONAL_NOTICE_VOICES: Readonly<Record<string, string>> = Object.freeze({
  "contract-activated":
    "PROVISIONAL: pending contract went LIVE — backlog drain starts billing now",
  "covenant-breached":
    "PROVISIONAL: a bank covenant broke — runway / evidence readouts latched; the bank may act",
  "chargeback-posted":
    "PROVISIONAL: a settled payment was reversed after the fact — fee charged, reputation docked",
  /* OD-25(a): the pack keys (alert.death-imminent / alert.company-dissolved)
     ship ZERO-SLOT and win via `noticeWireCopy(...) ?? …` — these lines stay
     only as the hand-authored safety net for a pack-less host. */
  "death-imminent":
    "PROVISIONAL: death watch armed — an empty register plus refused settlement has held for days; the next fold dissolves the company",
  "company-dissolved":
    "PROVISIONAL: the company is dissolved — the ledger stops at its last entry; no settle, no accrual, no new notice",
});

/** Voice a fresh economy notice kind, or null for every kind this seam does
 *  not own (chrome keeps its silence). The row's own detail column already
 *  carries the money/seconds payload — the voice adds only the human frame. */
export function voiceEconomyNotice(kind: string): string | null {
  return (PROVISIONAL_NOTICE_VOICES as Record<string, string | undefined>)[kind] ?? null;
}
