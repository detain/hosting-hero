/**
 * versus/draft.ts — the deterministic 1-of-3 draft picker (ADR-0004's
 * drafting round) plus the drafted-deck validator.
 *
 * Randomness law (§2.24-as-validator, honored verbatim from the waves
 * discipline): the RNG decides WHICH cards and affixes a presentation
 * offers and which slot the drafter takes — NEVER whether the resulting
 * deck is legal. Every presented candidate carries the exact slot weight,
 * slot weights sum to the budget by construction (last slot absorbs the
 * remainder), so any sequence of picks produces a budget-clean deck; the
 * remaining §2.24 laws (pool cap, denomination quota, role cadence floor,
 * Second-Answer counter presence) are checked as DATA by
 * validateDraftedDeck so a draft can be REJECTED and redrafted under a new
 * seed rather than silently reshaped.
 *
 * Determinism: all draws come from ONE kernel RNG stream
 * (streamFor(seed, "versus/draft", 0) with per-concern forks) — same seed
 * ⇒ byte-identical presentations and picks, across runs, processes, and
 * the replay harness. Pick selection is scripted (`scriptedPicks` supplied
 * — each entry must be a valid index for its presentation; the dice still
 * roll at the same stream positions, so scripting overrides the CHOICE,
 * never the cadence of the roll) or RNG-drawn (range(N)) — legality is
 * untouched either way.
 */
import type { RngStream, RunSeed } from "../types.ts";
import { streamFor } from "../kernel/rng.ts";
import { compareCodeUnits } from "../internal/canonical.ts";
import {
  AFFIX_VOCABULARY,
  deckLegalityViolations,
  VersusError,
  type DeckLegalityCode,
  type ThreatAffix,
  type ThreatCensusEntry,
  type ThreatDeck,
  type ThreatDeckEntry,
} from "./deck.ts";

/* ═══════════════════════════ presentation model ═══════════════════════════ */

/** One offered card. affix is present only when the dice rolled one. */
export interface DraftCandidate {
  readonly threatId: string;
  readonly weightBps: number;
  readonly affix?: ThreatAffix;
}

/** One 1-of-3 stop in the draft: what was offered, what index was taken. */
export interface DraftPresentation {
  readonly pickIndex: number;
  readonly slotWeightBps: number;
  readonly candidates: readonly DraftCandidate[];
  readonly taken: DraftCandidate;
}

export interface DraftOptions {
  readonly seed: RunSeed;
  /** Deck identity stamped on the result (colon-free id). */
  readonly deckId: string;
  readonly budgetBps: number;
  /** Draftable threat universe (registry ids). Presented pools are sorted
   *  copies — the caller's array is never mutated or reordered. */
  readonly pool: readonly string[];
  /** Nominal weight per pick; the FINAL pick absorbs the exact remainder
   *  so the budget sum law holds without exceptions. */
  readonly slotWeightBps: number;
  /** Affix slugs the dice may mix in (subset of AFFIX_VOCABULARY; pass []
   *  to draft affix-free). */
  readonly affixPool?: readonly ThreatAffix[];
  /** One-in-N chance (integer bps, 0..10000) a candidate carries an affix;
   *  default 2500 (§2.13 spice, not spice-on-everything). */
  readonly affixChanceBps?: number;
  /** How many cards per presentation (2..4, default 3). */
  readonly offerSize?: number;
  /** Threat universe: when supplied, every pool id must resolve here —
   *  unknown pool entries die at DRAFT time (UNKNOWN_THREAT) instead of
   *  surfacing only when the deck is later parsed or converted. */
  readonly census?: ReadonlyMap<string, ThreatCensusEntry>;
  /** Scripted picks: one offer index per presentation, length must equal
   *  the computed pick count and every entry must be a safe integer inside
   *  its presentation's offer (0..offer-1). The dice still roll — scripting
   *  replaces only the CHOICE and consumes no extra stream positions, so
   *  scripting a seed's own dice picks byte-reproduces its RNG draft;
   *  diverging choices legitimately reshape LATER offers via the pool. */
  readonly scriptedPicks?: readonly number[];
}

export interface DraftOutcome {
  readonly deck: ThreatDeck;
  readonly presentations: readonly DraftPresentation[];
}

const MAX_OFFER_SIZE = 4;

function rollAffix(rng: RngStream, affixPool: readonly ThreatAffix[], affixChanceBps: number): ThreatAffix | null {
  if (affixPool.length === 0 || affixChanceBps <= 0) return null;
  if (rng.range(10000) >= affixChanceBps) return null;
  return affixPool[rng.range(affixPool.length)] ?? null;
}

/** Deterministic 1-of-3 draft. Throws VersusError (fail loud, boundary
 *  codes) on structurally impossible requests — the dice never rescue a
 *  bad draft. */
export function draftThreatDeck(options: DraftOptions): DraftOutcome {
  if (!Number.isSafeInteger(options.budgetBps) || options.budgetBps < 1) {
    throw new VersusError("OUT_OF_RANGE", "draft.budgetBps", `budget must be a positive safe integer, got ${String(options.budgetBps)}`);
  }
  if (!Number.isSafeInteger(options.slotWeightBps) || options.slotWeightBps < 1) {
    throw new VersusError("OUT_OF_RANGE", "draft.slotWeightBps", `slot weight must be a positive safe integer, got ${String(options.slotWeightBps)}`);
  }
  const offerSize = options.offerSize ?? 3;
  if (!Number.isSafeInteger(offerSize) || offerSize < 2 || offerSize > MAX_OFFER_SIZE) {
    throw new VersusError("OUT_OF_RANGE", "draft.offerSize", `offer size must be 2..${MAX_OFFER_SIZE}, got ${offerSize}`);
  }
  const affixChanceBps = options.affixChanceBps ?? 2500;
  if (!Number.isSafeInteger(affixChanceBps) || affixChanceBps < 0 || affixChanceBps > 10000) {
    throw new VersusError("OUT_OF_RANGE", "draft.affixChanceBps", `affix chance must be 0..10000 bps, got ${affixChanceBps}`);
  }
  for (const affix of options.affixPool ?? []) {
    if (!(AFFIX_VOCABULARY as readonly string[]).includes(affix)) {
      throw new VersusError("BAD_ENUM", "draft.affixPool", `"${affix}" is outside §2.13 AFFIX_VOCABULARY`);
    }
  }
  const poolSorted = [...new Set(options.pool)].sort(compareCodeUnits);
  if (poolSorted.length === 0) {
    throw new VersusError("OUT_OF_RANGE", "draft.pool", "an empty pool cannot produce a deck");
  }
  if (options.census !== undefined) {
    for (const threatId of poolSorted) {
      if (!options.census.has(threatId)) {
        throw new VersusError("UNKNOWN_THREAT", "draft.pool", `"${threatId}" is not in the supplied census universe`);
      }
    }
  }

  // How many picks does the budget need? ceil(budget/slot) — and the pool
  // must be able to fill that many DISTINCT threats (no repeats: parse
  // law forbids duplicate threatIds).
  const pickCount = Math.ceil(options.budgetBps / options.slotWeightBps);
  if (pickCount > poolSorted.length) {
    throw new VersusError("DECK_ILLEGAL", "draft.pool", `budget ${options.budgetBps} at slot ${options.slotWeightBps} needs ${pickCount} distinct picks but the pool holds ${poolSorted.length}`);
  }
  if (pickCount > 32) {
    throw new VersusError("OUT_OF_RANGE", "draft.budgetBps", `${pickCount} picks exceeds the 32-entry deck cap`);
  }

  const scriptedPicks = options.scriptedPicks;
  if (scriptedPicks !== undefined) {
    if (scriptedPicks.length !== pickCount) {
      throw new VersusError("OUT_OF_RANGE", "draft.scriptedPicks", `${scriptedPicks.length} scripted picks cannot serve ${pickCount} presentations (budget ${options.budgetBps} at slot ${options.slotWeightBps})`);
    }
    for (const [index, value] of scriptedPicks.entries()) {
      if (!Number.isSafeInteger(value)) {
        throw new VersusError("NOT_A_SAFE_INTEGER", `draft.scriptedPicks[${index}]`, `expected an integer offer index, got ${String(value)}`);
      }
    }
  }

  const root = streamFor(options.seed, "versus/draft", 0);
  const offerStream = root.fork("offers");
  // Affix dice ride their OWN fork: whether an affix lands can never
  // shift the offer/pick sequence (threat order is affix-invariant).
  const affixStream = root.fork("affixes");
  const affixPool = options.affixPool ?? [];

  const entries: ThreatDeckEntry[] = [];
  const presentations: DraftPresentation[] = [];
  const remaining = [...poolSorted];
  let left = options.budgetBps;

  for (let pick = 0; pick < pickCount; pick += 1) {
    const slotWeightBps = Math.min(options.slotWeightBps, left);
    const offerCount = Math.min(offerSize, remaining.length);
    const candidates: DraftCandidate[] = [];
    // Draw offerCount DISTINCT threats by repeatedly removing the rolled
    // index — over a copy, deterministic, no locale anywhere.
    const drawBag = [...remaining];
    for (let slot = 0; slot < offerCount; slot += 1) {
      const threatIndex = offerStream.range(drawBag.length);
      const threatId = drawBag.splice(threatIndex, 1)[0] as string;
      const affix = rollAffix(affixStream, affixPool, affixChanceBps);
      candidates.push(affix === null
        ? Object.freeze({ threatId, weightBps: slotWeightBps })
        : Object.freeze({ threatId, weightBps: slotWeightBps, affix }));
    }
    // The dice ALWAYS roll (stream position is pick-policy invariant);
    // a scripted entry overrides only the resulting choice.
    const rolled = offerStream.range(candidates.length);
    const scripted = scriptedPicks?.[pick];
    const pickIndex = scripted ?? rolled;
    if (pickIndex < 0 || pickIndex >= candidates.length) {
      throw new VersusError("OUT_OF_RANGE", `draft.scriptedPicks[${pick}]`, `index ${pickIndex} outside this presentation's 0..${candidates.length - 1} offer`);
    }
    const taken = candidates[pickIndex] as DraftCandidate;
    // The taken threat leaves the pool; offered-but-not-taken stay in play.
    const poolIndex = remaining.indexOf(taken.threatId);
    remaining.splice(poolIndex, 1);
    entries.push(taken);
    presentations.push(Object.freeze({
      pickIndex,
      slotWeightBps,
      candidates: Object.freeze(candidates),
      taken,
    }));
    left -= slotWeightBps;
  }

  const deck: ThreatDeck = Object.freeze({
    kind: "threat" as const,
    id: options.deckId,
    budgetBps: options.budgetBps,
    entries: Object.freeze(entries),
  });
  return Object.freeze({ deck, presentations: Object.freeze(presentations) });
}

/* ═══════════════════════════ drafted-deck validation ═══════════════════════════ */

export const DRAFT_VIOLATION_CODES = [
  "POOL_CAP_EXCEEDED",
  "DENOMINATION_QUOTA_EXCEEDED",
  "MINIMUM_ROLES_UNMET",
  "ROLE_QUOTA_EXCEEDED",
  "UNKNOWN_THREAT",
  "COUNTER_ABSENT",
] as const;
export type DraftViolationCode = (typeof DRAFT_VIOLATION_CODES)[number] | DeckLegalityCode;

export interface DraftViolation {
  readonly code: DraftViolationCode;
  readonly threatId?: string;
  readonly detail: string;
}

export interface DraftValidationInput {
  readonly census: ReadonlyMap<string, ThreatCensusEntry>;
  /** Fairness contract R-15 analog: threatId → known counters. A threat
   *  with NO entry (or an empty list) fails COUNTER_ABSENT — the "Second
   *  Answer" law: no threat ships with zero counters. */
  readonly counters: ReadonlyMap<string, readonly string[]>;
}

/** Validate a drafted deck as DATA (never throws): budget sum is already a
 *  parse law, so this covers the §2.24-style drafting laws + the counter
 *  fairness floor. Deterministic order: legality violations (deck-scoped,
 *  sorted code-unit inside), then per-threat counter rows in deck-entry
 *  order. */
export function validateDraftedDeck(
  deck: ThreatDeck,
  input: DraftValidationInput,
): readonly DraftViolation[] {
  const violations: DraftViolation[] = [...deckLegalityViolations(deck, input.census)];
  for (const entry of deck.entries) {
    const known = input.counters.get(entry.threatId);
    if (known === undefined || known.length === 0) {
      violations.push({
        threatId: entry.threatId,
        code: "COUNTER_ABSENT",
        detail: `"${entry.threatId}" ships no counter — the Second Answer law forbids uncounterable threats (R-15 analog)`,
      });
    }
  }
  return Object.freeze(violations);
}
