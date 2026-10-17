/**
 * versus/draft.ts — the deterministic 1-of-3 draft picker (ADR-0004's
 * drafting round) plus the drafted-deck validator.
 *
 * Randomness law (§2.24-as-validator, honored verbatim from the waves
 * discipline): the RNG decides WHICH cards and affixes a presentation
 * offers and which slot the drafter takes — NEVER whether the resulting
 * deck is legal. Every presented candidate carries the exact slot weight
 * and its affix-priced cost; slot weights sum to the budget by construction
 * (last slot absorbs the remainder), the affordability-downgrade law keeps
 * every taken cost at or below its slot plus the discount banked by earlier
 * picks, and the exact-sum compensation walk tunes the committed costs to
 * ΣcostBps == budgetBps — so any sequence of picks produces a budget-clean
 * deck; the remaining §2.24 laws (pool cap, denomination quota, role
 * cadence floor, Second-Answer counter presence) are checked as DATA by
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
  AFFIX_COST_MULTIPLIER_BPS,
  AFFIX_VOCABULARY,
  deckLegalityViolations,
  MAX_DECK_THREATS,
  VersusError,
  type DeckLegalityCode,
  type ThreatAffix,
  type ThreatCensusEntry,
  type ThreatDeck,
  type ThreatDeckEntry,
} from "./deck.ts";
import { AFFIX_WAVE_DELTAS } from "./affixes.ts";

/* ═══════════════════════════ presentation model ═══════════════════════════ */

/** One offered card. affix is present only when the dice rolled one AND
 *  the affordability law let it stand; a rolled-but-unaffordable affix is
 *  presented as its plain twin (same roll, weaker card — the dice cadence
 *  never changes). costBps is the budget cost AS PRESENTED (pre-walk; the
 *  committed deck's costs are the walked values). */
export interface DraftCandidate {
  readonly threatId: string;
  readonly weightBps: number;
  readonly costBps: number;
  readonly affix?: ThreatAffix;
}

/** One 1-of-3 stop in the draft: what was offered, what index was taken.
 *  The offer/pick record is PRE-walk material (what the drafter saw);
 *  DraftOutcome.deck carries the post-walk exact-sum accounting. */
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
  /** Nominal weight per pick; the FINAL pick absorbs the exact remainder so
   *  the weight budget law holds without exceptions. The v2 COST law
   *  (ΣcostBps == budgetBps) is held by the affordability-downgrade law
   *  plus the exact-sum compensation walk, not by the slots. */
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

/** §2.24 pool band, lower reading (I-P decision 3): 8–10 is the DRAFTABLE
 *  POOL band. Falling below it is an authoring ADVISORY (POOL_BAND_NARROW,
 *  reported never thrown) — the deck ceiling stays MAX_DECK_THREATS. */
const POOL_BAND_MIN_DISTINCT_THREATS = 8;

/* ═══════════════════ affix cost math (hh-versus-deck-v2) ═══════════════════ */

/** Presenting cost of one candidate: slot weight × the affix multiplier
 *  (plain ≡ identity, cost == weight), ceil'd — an affix never costs less
 *  through rounding than its bps factor says. BigInt-exact: deck budgets
 *  reach MAX_SAFE-adjacent values (the census tests prove the parse law
 *  there), and weight × 20_000 overflows float53 long before that. */
function affixCostBps(weightBps: number, affix: ThreatAffix | null): number {
  const multiplierBps = AFFIX_COST_MULTIPLIER_BPS[affix ?? "plain"];
  const ceiled = (BigInt(weightBps) * BigInt(multiplierBps) + 9_999n) / 10_000n;
  if (ceiled > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new VersusError("OUT_OF_RANGE", "draft.cost", `cost of a ${weightBps}-bps slot under a ${multiplierBps} bps affix exceeds the safe integer range`);
  }
  return Number(ceiled);
}

/**
 * EXACT-SUM COMPENSATION WALK (hh-versus-deck-v2). delta = budget − Σcosts;
 * walk the entries weight-desc (code-unit threatId tie), adjusting every
 * not-clamped entry ∓1 bps per lap — down when over budget, up when under —
 * each entry clamped to [max(1, ⌊weight/2⌋), presented cost × 2]. The clamps
 * cannot absorb the delta ⇒ the draft would book an illegal deck: fail loud
 * with AFFIX_COST_UNFEASIBLE at draft.cost, never emit one.
 *
 * Plain-only (v1-defaulted) drafts enter with cost ≡ weight: delta is zero
 * and the walk is the IDENTITY — the input candidates ride out as the deck
 * entries unchanged, pick sequences byte-comparable with v1.
 *
 * On public drafts the walk can only ADD: the affordability-downgrade law
 * caps every taken cost at slot + banked discount, so Σcosts ≤ budget.
 * A subtraction leg (or an unfeasible delta) requires forged costs —
 * which is exactly why this seam is exported: the law is falsifiable
 * directly (draft.test.ts drives it), without the draft API growing a
 * test-only knob. It is NOT in the public barrel (internal law seam;
 * pipeline/internal.ts precedent).
 */
export function compensateExactCostSum(
  taken: readonly DraftCandidate[],
  budgetBps: number,
): readonly ThreatDeckEntry[] {
  let sumBps = 0n;
  for (const candidate of taken) sumBps += BigInt(candidate.costBps);
  let delta = BigInt(budgetBps) - sumBps;
  if (delta === 0n) {
    return taken; // identity — zero-drift path for plain-only drafts
  }

  const order = [...taken].sort((a, b) => (a.weightBps !== b.weightBps
    ? b.weightBps - a.weightBps
    : compareCodeUnits(a.threatId, b.threatId)));
  const costs = order.map((entry) => entry.costBps);
  const floors = order.map((entry) => Math.max(1, Math.floor(entry.weightBps / 2)));
  const caps = order.map((entry) => (entry.costBps > Number.MAX_SAFE_INTEGER / 2
    ? Number.MAX_SAFE_INTEGER
    : entry.costBps * 2));

  while (delta !== 0n) {
    const grow = delta > 0n;
    const mobile: number[] = [];
    for (const [index] of order.entries()) {
      const room = grow
        ? (caps[index] as number) - (costs[index] as number)
        : (costs[index] as number) - (floors[index] as number);
      if (room > 0) mobile.push(index);
    }
    if (mobile.length === 0) {
      throw new VersusError("AFFIX_COST_UNFEASIBLE", "draft.cost",
        `cost compensation cannot converge: budget ${budgetBps} bps, residual ${delta.toString()} bps unabsorbable — every entry is pinned inside [max(1, ⌊weight/2⌋), presented cost × 2]`);
    }
    const magnitude = grow ? delta : -delta;
    const bulkLaps = magnitude / BigInt(mobile.length);
    if (bulkLaps >= 1n) {
      const lap = bulkLaps > BigInt(Number.MAX_SAFE_INTEGER) ? Number.MAX_SAFE_INTEGER : Number(bulkLaps);
      for (const index of mobile) {
        const room = grow
          ? (caps[index] as number) - (costs[index] as number)
          : (costs[index] as number) - (floors[index] as number);
        const applied = Math.min(lap, room);
        costs[index] = (costs[index] as number) + (grow ? applied : -applied);
        delta = grow ? delta - BigInt(applied) : delta + BigInt(applied);
      }
      continue;
    }
    // Partial lap (0 < |delta| < mobile.length): one bps per entry in walk
    // order until the delta is absorbed — the last entries of the lap keep
    // one bps more (or less) than the first, and that asymmetry is the
    // observable fingerprint of the walk.
    for (const index of mobile) {
      if (delta === 0n) break;
      costs[index] = (costs[index] as number) + (grow ? 1 : -1);
      delta = grow ? delta - 1n : delta + 1n;
    }
  }

  const walked = new Map<DraftCandidate, number>();
  for (const [index, candidate] of order.entries()) walked.set(candidate, costs[index] as number);
  return Object.freeze(taken.map((candidate) => (candidate.affix === undefined
    ? Object.freeze({
      threatId: candidate.threatId,
      weightBps: candidate.weightBps,
      costBps: walked.get(candidate) as number,
    })
    : Object.freeze({
      threatId: candidate.threatId,
      weightBps: candidate.weightBps,
      costBps: walked.get(candidate) as number,
      affix: candidate.affix,
    }))));
}

function rollAffix(rng: RngStream, affixPool: readonly ThreatAffix[], affixChanceBps: number): ThreatAffix | null {
  if (affixPool.length === 0 || affixChanceBps <= 0) return null;
  if (rng.range(10000) >= affixChanceBps) return null;
  return affixPool[rng.range(affixPool.length)] ?? null;
}

/**
 * The affix pool a spice-enabled draft SHOULD pass as `options.affixPool`:
 * exactly the LIVE §2.13 slugs, derived from AFFIX_WAVE_DELTAS so the
 * dice can never offer spice the engine can't deliver — slug 12
 * ("piggybacked-on-a-maintenance-window") is data-only in v0 (I-P V-2).
 * DERIVED, not hand-authored: when slug 12 grows a live delta, this pool
 * follows automatically and the V1 byte-comparison law keeps plain-only
 * DEFAULT drafts (options.affixPool ?? []) untouched either way.
 * A host FORCING slug 12 into its own affixPool stays legal: the wire
 * byte, the 2.0× cost premium, and zero sim delta (pinned by test).
 */
export const DRAFT_AFFIX_DEFAULT_POOL: readonly ThreatAffix[] = Object.freeze(
  AFFIX_VOCABULARY.filter((affix) => AFFIX_WAVE_DELTAS[affix].live),
);

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

  const entries: DraftCandidate[] = [];
  const presentations: DraftPresentation[] = [];
  const remaining = [...poolSorted];
  let left = options.budgetBps;
  // Discount banked by earlier takes: Σ_{j<pick} (slot_j − cost_j). Plain
  // costs ≡ slot (bank unchanged); a bounded affix banks slack that an
  // expensive affix may later spend. The affordability-downgrade law caps a
  // presented affix at slot + bank, which keeps the bank never-negative —
  // so Σcosts ≤ budget and the compensation walk only ever has to ADD.
  let bankedBps = 0;

  for (let pick = 0; pick < pickCount; pick += 1) {
    const slotWeightBps = Math.min(options.slotWeightBps, left);
    const offerCount = Math.min(offerSize, remaining.length);
    const affordableBps = slotWeightBps + bankedBps;
    const candidates: DraftCandidate[] = [];
    // Draw offerCount DISTINCT threats by repeatedly removing the rolled
    // index — over a copy, deterministic, no locale anywhere.
    const drawBag = [...remaining];
    for (let slot = 0; slot < offerCount; slot += 1) {
      const threatIndex = offerStream.range(drawBag.length);
      const threatId = drawBag.splice(threatIndex, 1)[0] as string;
      const rolledAffix = rollAffix(affixStream, affixPool, affixChanceBps);
      // AFFORDABILITY-DOWNGRADE LAW (hh-versus-deck-v2): the dice have
      // already rolled at their pinned positions; an affixed candidate the
      // remaining budget cannot carry (even with later slots paying plain)
      // is shown as its plain twin. Same roll, weaker card — the dice
      // decide WHICH, never whether the deck is legal.
      const affix = rolledAffix !== null && affixCostBps(slotWeightBps, rolledAffix) > affordableBps ? null : rolledAffix;
      candidates.push(affix === null
        ? Object.freeze({ threatId, weightBps: slotWeightBps, costBps: slotWeightBps })
        : Object.freeze({ threatId, weightBps: slotWeightBps, costBps: affixCostBps(slotWeightBps, affix), affix }));
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
    bankedBps += slotWeightBps - taken.costBps;
    presentations.push(Object.freeze({
      pickIndex,
      slotWeightBps,
      candidates: Object.freeze(candidates),
      taken,
    }));
    left -= slotWeightBps;
  }

  // The exact-sum compensation walk tunes the committed deck's costs to the
  // budget (identity when plain-only — every v1-defaulted draft lands on
  // it untouched). Presentations above stay pre-walk offer-of-record.
  const deck: ThreatDeck = Object.freeze({
    kind: "threat" as const,
    id: options.deckId,
    budgetBps: options.budgetBps,
    entries: compensateExactCostSum(entries, options.budgetBps),
  });
  return Object.freeze({ deck, presentations: Object.freeze(presentations) });
}

/* ═══════════════════════════ drafted-deck validation ═══════════════════════════ */

export const DRAFT_VIOLATION_CODES = [
  "POOL_CAP_EXCEEDED",
  "POOL_BAND_NARROW",
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
  // §2.24 pool-band reading (I-P decision 3): "8–10" is the DRAFTABLE POOL
  // band — the deck CEILING stays MAX_DECK_THREATS (10). The lower bound is
  // an authoring ADVISORY, reported never thrown: a deck of fewer than 8
  // distinct threats drains the pool band. Deck-scoped row (no threatId).
  const distinctThreats = new Set(deck.entries.map((entry) => entry.threatId)).size;
  if (distinctThreats < POOL_BAND_MIN_DISTINCT_THREATS) {
    violations.push({
      code: "POOL_BAND_NARROW",
      detail: `deck spans ${distinctThreats} distinct threats; §2.24's 8–10 pool band asks for at least ${POOL_BAND_MIN_DISTINCT_THREATS} (advisory — deck ceiling ${MAX_DECK_THREATS} stands)`,
    });
  }
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
