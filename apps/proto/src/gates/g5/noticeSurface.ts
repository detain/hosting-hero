/**
 * GATE-G5 · notice-surface contributions — the VOICE seam for the three
 * economy notice kinds fix-economy minted (2026-10-09 handoff): until the
 * i18n packs grow real keys (batch-E: `decision.*` entries + a
 * `noticeCopy.ts` widening), the wire must not go mute on brand-new events.
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
});

/** Voice a fresh economy notice kind, or null for every kind this seam does
 *  not own (chrome keeps its silence). The row's own detail column already
 *  carries the money/seconds payload — the voice adds only the human frame. */
export function voiceEconomyNotice(kind: string): string | null {
  return (PROVISIONAL_NOTICE_VOICES as Record<string, string | undefined>)[kind] ?? null;
}
