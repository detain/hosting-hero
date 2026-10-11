/**
 * §7.7 BLAMELESS POSTMORTEM — the engine-side filing card (audit g21: the
 * post-mortem heading rows were PARTIAL — §5.8's causality machinery exists
 * in replay/, but nothing in the economy CONSUMED incident evidence into a
 * gated reputation/hint path).
 *
 * What already shipped and what this formalizes:
 *  - @57ea80e: `EconomyTickIn.honestPostmortems` — an UNCONDITIONAL host
 *    assertion. One line per cause, instant credit, no adjudication.
 *  - THIS file: `EconomyTickIn.postMortems` — formal filings. Each card is
 *    ADJUDICATED against §7.7's attribution law before anything moves:
 *
 *    1. "If two changes were in-flight, the post-mortem cannot attribute a
 *       cause" → `ambiguous`: notice `postmortem-unattributed`, ZERO
 *       credit, zero floor. The log row records the attempt
 *       (creditedBps 0n) so a RE-file after the ambiguity clears can still
 *       earn credit — a card is creditable exactly once per incident.
 *    2. `style: "blame"` → the values-with-mechanical-consequences branch
 *       (§7.7 "Blame vs Blameless choice — see §5.4"): filed and logged,
 *       but NO credit and NO honestHostFloor. Blame buys nothing.
 *    3. `style: "blameless"`, attributable, first filing of that incident →
 *       folds as the existing `honest-postmortem` reputation signal: +bps
 *       AND the PERMANENT transparency floor (§5.10) — the ledger math is
 *       SHARED with the host-assert path, never forked.
 *
 * The "no unlock" consequence stays host-side BY DESIGN: the engine emits
 * the `postmortem-unattributed` NOTICE and the unlocks observer (@71b8960,
 * fed via `UnlockDriverWiring.noticesOf`) is the only thing that may turn
 * notice kinds into progression — this lane does NOT touch unlocks/.
 *
 * Presence-gated twice over: `input.postMortems` absent ⇒ zero signals,
 * zero notices, `postMortemLog` key stays OUT of EconomyState (absent-
 * while-idle, the OD-25 death-key law) ⇒ every shipped golden byte-
 * identical. Filing order is normalized by incident cause (code-unit) so
 * host list order can never leak into the notice stream.
 */

import type { CauseId, EntityId, SimMinute } from "../types.ts";
import { asCauseId } from "../types.ts";
import type { EconomyConfig } from "./config.ts";
import { DEFAULT_POST_MORTEM_CONFIG } from "./config.ts";
import type { ReputationSignal } from "./reputation.ts";

/** Closed vocabulary (§7.7): the two cultures, exactly. Anything else is a
 *  parse error, not a third style. */
export type PostMortemStyle = "blameless" | "blame";

export const POST_MORTEM_STYLES: readonly PostMortemStyle[] = Object.freeze([
  "blameless",
  "blame",
]);

/** One filed card. `changesInFlight` is the §7.7 ambiguity witness: the
 *  count of simultaneous changes the incident could hide behind. */
export interface PostMortemFiling {
  readonly incidentCauseId: CauseId;
  readonly style: PostMortemStyle;
  readonly changesInFlight: number;
}

/** The permanent adjudication row (EconomyState.postMortemLog, append-only,
 *  ABSENT-while-idle). `creditedBps` 0n = the attempt earned nothing —
 *  ambiguous, blameful, or a re-file of an already-credited incident. */
export interface PostMortemRecord {
  readonly atBusinessMin: SimMinute;
  readonly incidentCauseId: CauseId;
  readonly style: PostMortemStyle;
  readonly changesInFlight: number;
  readonly creditedBps: bigint;
}

/** One adjudicated filing — the tick turns these into notices (the notice
 *  vocabulary is tick.ts-owned; this module imports NOTHING from it, the
 *  economy/death.ts layering law). */
export interface PostMortemOutcome {
  readonly record: PostMortemRecord;
  /** §7.7 "cannot attribute a cause": changes in flight above the limit. */
  readonly ambiguous: boolean;
  /** Credit actually moved this fold (blameless + attributable + first). */
  readonly credited: boolean;
}

/** Boundary parse (Laws 2+4): the whole list, fail-loud, naming the exact
 *  index and field. Returns a NEW list sorted by incident cause (code-unit)
 *  so host ordering never leaks; duplicates in the list are REAL re-files
 *  and adjudicate in that sorted order. */
export function parsePostMortemFilings(raw: readonly unknown[]): readonly PostMortemFiling[] {
  const filings: PostMortemFiling[] = [];
  raw.forEach((entry, index) => {
    const where = `postMortems[${index}]`;
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
      throw new TypeError(`economy/postmortem: ${where} must be a filing object`);
    }
    const card = entry as Record<string, unknown>;
    const incident = card.incidentCauseId;
    if (typeof incident !== "string" || incident.length === 0) {
      throw new TypeError(`economy/postmortem: ${where}.incidentCauseId must be a non-empty string`);
    }
    const style = card.style;
    if (style !== "blameless" && style !== "blame") {
      throw new TypeError(
        `economy/postmortem: ${where}.style must be ${POST_MORTEM_STYLES.join(" | ")}, got ${String(style)}`,
      );
    }
    const changes = card.changesInFlight;
    if (typeof changes !== "number" || !Number.isSafeInteger(changes) || changes < 1) {
      throw new TypeError(
        `economy/postmortem: ${where}.changesInFlight must be a safe integer >= 1, got ${String(changes)}`,
      );
    }
    filings.push({ incidentCauseId: asCauseId(incident), style, changesInFlight: changes });
  });
  filings.sort((a, b) =>
    a.incidentCauseId < b.incidentCauseId ? -1 : a.incidentCauseId > b.incidentCauseId ? 1 : 0,
  );
  return filings;
}

/** The entity filed post-mortems hang their notices off — the same company
 *  anchor the death notices use (contractId is REQUIRED on EconomyNotice;
 *  a post-mortem is company-scoped, not deal-scoped). */
export const POST_MORTEM_ENTITY: EntityId = "company" as EntityId;

/**
 * Fold filed cards against the prior log. Pure over (priorLog, filings,
 * cfg, minute) — Law 3. Empty filings return an EMPTY outcomes array (the
 * tick's spread then keeps `postMortemLog` absent — byte-identity).
 *
 * Order of operations per filing (each branch falsifiable by tests):
 *  1. `changesInFlight > cfg.postMortem.maxAttributableChanges` ⇒ AMBIGUOUS
 *     (§7.7: two changes in flight and the cause cannot be attributed) —
 *     no credit regardless of style;
 *  2. `style === "blame"` ⇒ filed, zero credit, zero floor (values have
 *     mechanical consequences; blame is not transparency);
 *  3. incident already credited (prior log OR an earlier card in this same
 *     sorted fold) ⇒ re-file, zero credit — the lifetime guard;
 *  4. else blameless + attributable + first ⇒ the honest-postmortem signal
 *     rides the SHARED ledger (@57ea80e): bps + permanent honestHostFloor.
 */
export function foldPostMortemFilings(input: {
  readonly priorLog: readonly PostMortemRecord[];
  readonly filings: readonly PostMortemFiling[];
  readonly now: SimMinute;
  readonly cfg: EconomyConfig;
}): readonly PostMortemOutcome[] {
  const { priorLog, filings, now, cfg } = input;
  if (filings.length === 0) return [];
  const limits = cfg.postMortem ?? DEFAULT_POST_MORTEM_CONFIG;
  const creditBps = cfg.reputation.honestPostmortemBps;

  // A cause credited in a PAST tick can never earn credit again — the log
  // IS the lifetime adjudication record.
  const credited = new Set<CauseId>();
  for (const row of priorLog) {
    if (row.creditedBps > 0n) credited.add(row.incidentCauseId);
  }

  const outcomes: PostMortemOutcome[] = [];
  for (const filing of filings) {
    const ambiguous = filing.changesInFlight > limits.maxAttributableChanges;
    const creditedNow =
      !ambiguous && filing.style === "blameless" && !credited.has(filing.incidentCauseId);
    if (creditedNow) credited.add(filing.incidentCauseId);
    outcomes.push(
      Object.freeze({
        record: Object.freeze({
          atBusinessMin: now,
          incidentCauseId: filing.incidentCauseId,
          style: filing.style,
          changesInFlight: filing.changesInFlight,
          creditedBps: creditedNow ? creditBps : 0n,
        }),
        ambiguous,
        credited: creditedNow,
      }),
    );
  }
  return Object.freeze(outcomes);
}

/** The reputation signals an outcome set earns, in fold order — spliced
 *  into the step-12.5 repSignals list BEFORE applyReputationSignals so the
 *  publish-on-change observed write covers them (single writer law). */
export function postMortemReputationSignals(
  outcomes: readonly PostMortemOutcome[],
  causeOf: (incidentCauseId: CauseId) => CauseId,
): readonly ReputationSignal[] {
  const signals: ReputationSignal[] = [];
  for (const outcome of outcomes) {
    if (!outcome.credited) continue;
    signals.push({ kind: "honest-postmortem", causeId: causeOf(outcome.record.incidentCauseId) });
  }
  return signals;
}

/** Cause grammar for the notice trail (house `economy:<domain>:...` family,
 *  OD-25 death-notice shape): `economy:postmortem:<filed|unattributed>:
 *  <incidentCause>:<minute>`. Exported so tests and hosts cite ONE string
 *  builder instead of re-splicing the idiom. */
export function postMortemNoticeCauseId(
  kind: "filed" | "unattributed",
  incidentCauseId: CauseId,
  now: SimMinute,
): CauseId {
  return asCauseId(`economy:postmortem:${kind}:${incidentCauseId}:${now}`);
}
