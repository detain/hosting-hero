/**
 * internal/tickFold.ts — the SHARED per-tick host fold, the single home for
 * the sequence every tick-boundary host performs around the driver:
 * scheduled-opex posting (plus the ADR-0016 mechanic C derived
 * scale-warmth draft at every business-month roll) with the ledger-
 * refusal bounce, the economy tick with the insolvent-settle boundary
 * (review F4), the OD-25(a) refuse-
 * settlements witness stream feeding the float-death watch (review F5),
 * the notary cash mirror, and the closed-vocab guardrail sampling.
 *
 * WHY THIS FILE EXISTS (MODULE-STATUS "scenario-runner-consolidation",
 * ADR-0011 noted duplicate): `unattended/fastForward.ts` and
 * `scenario/runner.ts` each carried a copy of this fold — the settle-refusal
 * regex was literally duplicated and kept honest only by a source-pinned
 * mirror test. This home merges the two byte-identical bodies into ONE;
 * the anti-goal is a third copy, so the law is:
 *
 *  - NO THIRD COPY. Any host threading economy around the driver calls
 *    `foldMoneyLaneTick` / `collectFacts` / `buildSample` here. The
 *    scenario suite's single-home source pin fails if the regex text ever
 *    reappears in a host file.
 *  - MECHANISM HERE, POLICY THERE. What stays deliberately per-host:
 *      • traffic envelope minting (doc segments vs waves/baseline/surge);
 *      • the ObservedStore gauge + observedWrites forwarding (fastForward
 *        only — the scenario runner has no store and its report never
 *        reads observed cells);
 *      • the cash-mirror AFTER a voided fold (fastForward mirrors only on
 *        success — a voided tick must not move the digested state; the
 *        scenario lane mirrors unconditionally — pinned divergence, each
 *        host applies `withCashMirror` itself);
 *      • notice census, warns, hourly buckets, checkpoints, attention
 *        month-roll, objectives, terminal ordering — all report law, not
 *        fold law;
 *      • the ledger topic prefix ("unattended" | "scenario") — cause ids
 *        like `unattended:opex:3:payroll` vs `scenario:opex:3:payroll`
 *        are each lane's digest-visible identity and ride the `topic`
 *        parameter verbatim.
 *  - DETERMINISM: same law as every consumer — bigint/Fixed math only,
 *    no wall clock, no unseeded randomness, frozen outputs.
 *
 * Dependency law: runtime imports are ../types.ts, ../kernel/*,
 * ../economy/index.ts and ./canonical.ts only — this file must never
 * import unattended/ or scenario/ at runtime (the GuardrailSample/GuardMetric
 * names are borrowed TYPE-ONLY from unattended/guardrails.ts, which itself
 * reaches nothing but types/kernel/canonical — no cycle, no runtime edge).
 *
 * This module is INTERNAL: not re-exported from the package barrels, not
 * reachable through the package.json exports map (src/internal/canonical.ts
 * precedent @34acf18). The two hosts import it by relative path; public
 * surface is unchanged (api-verify sees zero new names).
 */

import type {
  ClockState,
  Contract,
  DependencyEdge,
  EntityId,
  Fixed,
  GameState,
  NodeRecord,
  RunSeed,
  ScaleEntry,
  SimEvent,
  SimMinute,
  SimTick,
} from "../types.ts";
import { asCauseId, asEntityId, asMoney } from "../types.ts";
import { FIXED_ONE, FIXED_ZERO, compare, fromRatio } from "../kernel/fixed.ts";
import { MICROS_PER_MIN } from "../kernel/time.ts";
import type { EconomyConfig, EconomyState, EntryDraft, RevenueColourTags } from "../economy/index.ts";
import type { RefusedSettlement } from "../economy/index.ts";
import { DEFAULT_WARMTH_CONFIG, postEntry, remainingSec, runEconomyTick } from "../economy/index.ts";
import { compareCodeUnits } from "./canonical.ts";
import type { GuardMetric, GuardrailSample } from "../unattended/guardrails.ts";

/* ═══════════════════════════ shared tunables (host barrels re-export) ══════════════ */

/** Trailing window (sim-minutes) for the servedRate / ruleFiringsPerMin
 *  metrics — one empty tick is a hiccup, five is a catastrophe
 *  (owner taste RATIFIED 2026-10-16, ADR-0015 #1). */
export const GUARD_TRAILING_WINDOW_MIN = 5;

/** §6.13 degraded reading for the cascadeCollapse census: ρ at/above this
 *  marks a node degraded (owner taste RATIFIED 2026-10-16, ADR-0015 #1 —
 *  the ρ/(1−ρ) knee R-07 lives lower; 0.9 reads "dying", not "busy"). */
export const NODE_DEGRADED_RHO_GTE: Fixed = fromRatio(9n, 10n);

/** Neutral revenue-colour census for registered contracts (RATIFIED
 *  2026-10-16, ADR-0015 #1: the five-axis RevenueColourTags default —
 *  mid-band "blue" everywhere;
 *  hosts with real tags override via their own money config). */
export const DEFAULT_REVENUE_TAGS: RevenueColourTags = Object.freeze({
  margin: "blue",
  churnRisk: "blue",
  term: "blue",
  concentration: "blue",
  abuse: "blue",
} as const);

/* ═══════════════════════════ refusal-witness law (F4/F5) ══════════════════════════ */

/** The economy's negative-bucket law signature (economy/buckets.ts +
 *  economy/money.ts share the "(had … µ$) would go negative" message
 *  family). The insolvent-settle boundary (review F4) catches ONLY
 *  RangeErrors whose message matches — everything else rethrows. */
const NEGATIVE_BUCKET_LAW = /would go negative/;

/* ─── OD-25(a) refuse-settlements witness lane ───────────────────────────
   The economy's float-insolvency death watch reads `EconomyTickIn.
   refusedSettlements` — evidence the ledger said NO. Every refusal THIS
   fold already counts (the F4/F5 census) is folded into that witness
   stream; nothing new is invented. Two shapes:
   • opex bounce: identity + amount are KNOWN at the bounce site (the host
     minted the draft) → exact record, contractId `<topic>:opex:<memo>`.
   • voided settle: the refusal surfaces as the buckets-law throw, whose
     text embeds `settle <invoiceId>: -<amount> µ$ on '<bucket>'` — the
     attempted movement's magnitude is PARSED, never guessed. An
     unparseable message (money.ts-family wording) rides count-only:
     amount 0n under the neutral id `ledger:unattributed`. Honest best
     effort: death.ts advanceDeathWatch persists only COUNT + SUM of the
     evidence, so a coarse identity costs nothing downstream.
   • For a voided settle the INVOICE id rides `RefusedSettlement.contractId`
     (harmless by the count+sum law above — nothing resolves it as a contract).
   • `refusedMicroUsd` sums per-fold retries of the same invoice: the total
     reads as evidence magnitude, not outstanding debt — duration, not sum,
     gates the float death. */
const SETTLE_REFUSAL_SHAPE = /settle (\S+): -(\d+) µ\$ on '/;

function invoiceRefusalWitness(message: string): RefusedSettlement {
  const shape = SETTLE_REFUSAL_SHAPE.exec(message);
  if (shape === null) {
    return Object.freeze({
      contractId: asEntityId("ledger:unattributed"),
      amountMicroUsd: asMoney(0n),
    });
  }
  return Object.freeze({
    contractId: asEntityId(shape[1] as string),
    amountMicroUsd: asMoney(BigInt(shape[2] as string)),
  });
}

/* ═══════════════════════════ ledger drafts by topic ═══════════════════════════════ */

/** One host-scheduled burn, the shape BOTH lanes already share
 *  (unattended's `UnattendedOpexDraft` satisfies it structurally). */
export interface TickFoldOpexDraft {
  readonly atMinute: SimMinute;
  readonly amountMicroUsd: bigint;
  readonly memo: string;
}

/** Opening-balance draft, topic-stamped (`unattended` | `scenario`). */
export function openingDraftFor(topic: string, amountMicroUsd: bigint): EntryDraft {
  return Object.freeze({
    causeId: asCauseId(`${topic}:opening-balance`),
    atBusinessMin: 0,
    moneyColour: "gold" as const,
    delta: Object.freeze({ free: asMoney(amountMicroUsd) }),
    context: `${topic} opening balance`,
  });
}

function opexLedgerDraftFor(topic: string, draft: TickFoldOpexDraft, minute: SimMinute, clocks: ClockState): EntryDraft {
  return Object.freeze({
    causeId: asCauseId(`${topic}:opex:${minute}:${draft.memo}`),
    atBusinessMin: Number(clocks.businessUs / MICROS_PER_MIN),
    moneyColour: "red" as const,
    delta: Object.freeze({ free: asMoney(-draft.amountMicroUsd) }),
    context: `${topic} opex ${draft.memo}`,
  });
}

function opexWitnessFor(topic: string, draft: TickFoldOpexDraft): RefusedSettlement {
  return Object.freeze({
    contractId: asEntityId(`${topic}:opex:${draft.memo}`),
    amountMicroUsd: asMoney(draft.amountMicroUsd),
  });
}

/* ═══════════════════════ scale warmth — the month-roll derived draft (ADR-0016 mechanic C) ══════════ */

/** The business-calendar month the warmth cursor rolls on — the SAME
 *  43,200-minute grid `attentionMonthOf` (unattended/fastForward.ts
 *  @eff5694) copies from economy's rollBusinessMonth: the law is COPIED,
 *  not imported — internal/ must not reach unattended/ or pipeline/ at
 *  runtime (header dependency law), and the mint helper carries no cfg to
 *  derive it from `cfg.calendar.minutesPerMonth`. The clock is monotonic,
 *  so plain floor division is the exact twin of economy's floorDiv. */
const WARMTH_MONTH_MINUTES = 43_200;

function warmthMonthOf(game: GameState): number {
  return Math.floor(Number(game.context.clocks.businessUs / MICROS_PER_MIN) / WARMTH_MONTH_MINUTES);
}

/** The host-carried month identity for the warmth leg — the witness-array
 *  posture verbatim (plain mutable object, minted by the host, advanced IN
 *  PLACE by the fold). The cursor holds MONTH IDENTITY, never an amount: a
 *  month charges exactly once across the run, and a mid-month `scale-node`
 *  last-write-wins amendment re-prices only at the NEXT roll (the card's
 *  rhythm — reserve for the rush, withdraw after it). */
export interface MoneyLaneWarmthCursor {
  monthCursor: number;
}

/** Mint the run's warmth cursor from the state the host STARTS on. A run
 *  with no Scale book returns `undefined` — the zero-path switch, the same
 *  absent-means-inert law as every door-book forward (@984759b empty⇒
 *  omitted). A run that carries the book seeds the CURRENT month, so the
 *  first charge lands on the first roll INTO the next month: rent for the
 *  coming period, the payroll-g5 rhythm (`gate5:opex:payroll:mN`). */
export function createWarmthCursor(game: GameState): MoneyLaneWarmthCursor | undefined {
  return game.scale === undefined ? undefined : { monthCursor: warmthMonthOf(game) };
}

/** AS-OF twin of pipeline/defaults.ts `scaleWarmInForce` (the entry half —
 *  the caller has already looked the entry up): a null effective stamp is
 *  law, a future stamp is ARMED BUT NOT CHARGEABLE. The condition line is
 *  a private verbatim copy (import direction forbids reaching pipeline/);
 *  `__tests__/warmth-cost.test.ts` source-pins the two bodies against each
 *  other — the elasticity.ts PRICE_KEY_KINDS `readFileSync` mirror law. */
function warmthInForceAt(entry: ScaleEntry, atBusinessMinute: SimMinute): ScaleEntry | null {
  return entry.effectiveAtBusinessMinute === null || atBusinessMinute >= entry.effectiveAtBusinessMinute
    ? entry
    : null;
}

/** The fold's per-tick warmth question: has the business calendar entered
 *  a NEW month, and if so what is the bill? Returns ONE derived draft or
 *  null — and ALWAYS consumes the month identity when the cursor rolls: a
 *  zero-amount month still passed (scale-to-zero withdraws the line, not
 *  the calendar). Σ over the book's IN-FORCE entries × the warmth rate
 *  (`cfg.warmth ?? DEFAULT_WARMTH_CONFIG` — single source, never inlined).
 *  The draft then rides the ORDINARY opex loop below: it POSTS when the
 *  bankroll covers it and BOUNCES when it doesn't (witness identity
 *  `<topic>:opex:scale-warmth:mN` carries the memo through the
 *  OPEX-REFUSED ×N census) — the fold invents no second refusal law. */
function deriveWarmthDraft(p: MoneyLaneTickParams): TickFoldOpexDraft | null {
  const cursor = p.warmth;
  if (cursor === undefined) return null;
  const month = warmthMonthOf(p.game);
  if (month <= cursor.monthCursor) return null;
  cursor.monthCursor = month;
  const businessMinute = Number(p.game.context.clocks.businessUs / MICROS_PER_MIN);
  let slots = 0;
  if (p.game.scale !== undefined) {
    for (const entry of p.game.scale.entries.values()) {
      if (warmthInForceAt(entry, businessMinute) !== null) slots += entry.reservedSlots;
    }
  }
  if (slots === 0) return null;
  const amountMicroUsd = BigInt(slots) * (p.cfg.warmth ?? DEFAULT_WARMTH_CONFIG).rateMicroUsdPerSlotMonth;
  if (amountMicroUsd < 1n) return null;
  return Object.freeze({ atMinute: p.minute, amountMicroUsd, memo: `scale-warmth:m${month}` });
}

/* ═══════════════════════════ notary mirror + outage fan-out ═══════════════════════ */

/** Mirror the ledger's cash + journal seq into GameState (the notary
 *  contract g5 proved). Whether to call this after a VOIDED fold is each
 *  host's pinned law — see the docblock at `foldMoneyLaneTick`. */
export function withCashMirror(game: GameState, econ: EconomyState | null): GameState {
  if (econ === null) return game;
  return Object.freeze({ ...game, cash: econ.cash, ledgerSeq: econ.journal.nextSeq });
}

/** Landed breaches burn EVERY contract's SLA budget (company-wide reading;
 *  per-contract target attribution is an OD open item — RATIFIED
 *  2026-10-16, ADR-0015 #1). One landed unit = one sim-minute = 60 s of
 *  outage seconds. */
function outageSecondsFromLanded(
  outcomes: readonly { readonly terminal: string | null }[],
  contracts: ReadonlyMap<EntityId, Contract>,
): ReadonlyMap<EntityId, bigint> | null {
  if (contracts.size === 0) return null;
  let landedSec = 0n;
  for (const o of outcomes) if (o.terminal === "landed") landedSec += 60n;
  if (landedSec === 0n) return null;
  const map = new Map<EntityId, bigint>();
  for (const id of contracts.keys()) map.set(id, landedSec);
  return map;
}

/** Union of the two outage fans keyed by contract (audit minor @16c6add):
 *  landed violations and data corruptions burn the SAME error-budget
 *  minutes, so their seconds ADD per contract. Either side absent returns
 *  the other BY IDENTITY; two empties stay null — an unarmed run's
 *  EconomyTickIn carries no `outageSecs` key at all, which is what keeps
 *  every no-corruption digest byte-identical. The corruption side arrives
 *  as a plain map (the host ran the pipeline adapter) because internal/
 *  must not import the pipeline at runtime (dependency law). */
function mergeOutageFans(
  landed: ReadonlyMap<EntityId, bigint> | null,
  corruption: ReadonlyMap<EntityId, bigint> | null,
): ReadonlyMap<EntityId, bigint> | null {
  if (corruption === null || corruption.size === 0) return landed;
  if (landed === null) return corruption;
  const merged = new Map<EntityId, bigint>(landed);
  for (const [id, seconds] of corruption) {
    merged.set(id, (merged.get(id) ?? 0n) + seconds);
  }
  return merged;
}

/* ═══════════════════════════ the money-lane tick fold ═════════════════════════════ */

/** The successful fold's output (economy's own record — hosts read
 *  notices/observedWrites/state from it; null ⇒ the F4 void happened). */
export type EconomyFoldOut = ReturnType<typeof runEconomyTick>;

export interface MoneyLaneTickParams {
  /** Post-advance state: supplies the fold's context, the draft clocks,
   *  and the embedded pricing book (absent ⇒ the key is OMITTED — the
   *  empty⇒omitted byte-identity law @984759b). */
  readonly game: GameState;
  readonly econ: EconomyState;
  /** The tick's sim-minute (the opex slot key). */
  readonly minute: SimMinute;
  readonly runSeed: RunSeed;
  readonly cfg: EconomyConfig;
  /** The live contracts book — registration order is the outage fan-out
   *  order (both lanes register in their roster order; iteration matches
   *  each host's pre-consolidation shape). */
  readonly contracts: ReadonlyMap<EntityId, Contract>;
  /** Drafts scheduled at THIS minute (host groups them; the per-draft
   *  boundary laws — ≥1 µ$ and (atMinute,memo) uniqueness — are the
   *  host's ingestion concern and stay there, review F6). */
  readonly opexDrafts: readonly TickFoldOpexDraft[];
  /** ADR-0016 mechanic C warmth cursor (host-carried, minted ONCE per run
   *  via `createWarmthCursor`): PRESENT ⇒ the fold derives at most one
   *  `scale-warmth:mN` draft per business-month roll and PREPENDS it to
   *  `opexDrafts` (the derived line posts before authored lines sharing
   *  the minute — deterministic ledger order). ABSENT/undefined ⇒ the
   *  loop iterates `opexDrafts` BY IDENTITY — every scale-absent run
   *  byte-ident (the zero-golden law's load-bearing arm). */
  readonly warmth?: MoneyLaneWarmthCursor | undefined;
  /** Ledger identity prefix: "unattended" | "scenario". */
  readonly topic: string;
  readonly dunningEngineOwned: boolean;
  /** The cross-tick witness buffer, host-owned: pushed on every refusal,
   *  cleared when a fold consumes it. Empty ⇒ key omitted. */
  readonly witness: RefusedSettlement[];
  readonly outcomes: readonly { readonly terminal: string | null }[];
  /** §1.7 corruption outage fan (16c6add adapter, review-recorded debt):
   *  the pipeline's `corruptionOutageSecs(corruptions, contracts)` output
   *  handed over by the host. ABSENT or null ⇒ the fan stays exactly the
   *  landed fan it was before this seam existed — the default-off
   *  byte-identity law the corruption-forwarding tests pin. */
  readonly corruptionOutageSecs?: ReadonlyMap<EntityId, bigint> | null;
}

export interface MoneyLaneTickResult {
  /** Ledger AFTER opex posting + (on success) the economy fold. On a void
   *  this still carries this tick's SUCCESSFUL opex posts — whether that
   *  reaches GameState is the host's mirror law (`withCashMirror`). */
  readonly econ: EconomyState;
  /** null ⇔ the F4 void happened this tick. */
  readonly fold: EconomyFoldOut | null;
  /** THIS tick's ledger refusals (opex bounces + voided settle) — the
   *  freeCashDepleted chain evidence the sample carries (review F5: one
   *  chain step per refusal, both kinds fold into one counter). */
  readonly refusedBurnsThisTick: number;
  /** Opex drafts that bounced this tick (host census). */
  readonly opexBounces: number;
  /** True ⇔ an invoice settle was voided this tick (host census). */
  readonly invoiceVoided: boolean;
}

/**
 * The ONE money-lane tick fold (warmth-derived + scheduled opex → economy
 * tick → refusal witnesses → seq-clear), byte-identical to the loops both
 * lanes ran before consolidation.
 *
 * INSOLVENT-SETTLE BOUNDARY (review F4): economy/ refuses negative buckets
 * by THROWING a raw RangeError from deep inside settle → draftEntry →
 * applyBucketDelta when a due invoice's NET would drive 'free' below zero
 * (credit-heavy settles included). A clean pre-check is not expressible
 * here without duplicating economy's accrual/catch-up/credit arithmetic —
 * that would fork the settle law into a second, drift-prone copy. So the
 * fold converts the ledger's own refusal into a typed, counted event HERE,
 * and nothing else is swallowed: ONLY `RangeError` whose message carries
 * the negative-bucket family is caught; every other error rethrows
 * untouched.
 *
 * Why catch-and-keep-prior is STATE-CONSISTENT: runEconomyTick copies
 * input.prior into a fresh working state before mutating (economy/tick.ts)
 * — a mid-tick throw leaves `prior` untouched, so retaining the pre-fold
 * `econ` forfeits exactly this tick's economy progress (its notices
 * included) and the SAME due invoice retries next tick with the SAME
 * refusal. That is deterministic livelock-by-design: the run neither
 * crashes nor silently "succeeds" — the host's warn census plus the
 * chain-armed money guard (a burn the ledger refused IS inability to pay)
 * is the answer.
 *
 * OWNER QUESTION (economy lane): expose a queryable `canSettle()` so this
 * boundary can retire to a pre-check at notice level. Until then it lives
 * HERE, documented loudly, for both lanes at once.
 */
export function foldMoneyLaneTick(p: MoneyLaneTickParams): MoneyLaneTickResult {
  const { witness } = p;
  const { game } = p;
  let econ = p.econ;
  let refusedBurnsThisTick = 0;
  let opexBounces = 0;

  const warmthDraft = deriveWarmthDraft(p);
  const drafts = warmthDraft === null ? p.opexDrafts : [warmthDraft, ...p.opexDrafts];

  for (const draft of drafts) {
    if (econ.cash.free < draft.amountMicroUsd) {
      opexBounces += 1;
      refusedBurnsThisTick += 1;
      witness.push(opexWitnessFor(p.topic, draft));
      continue;
    }
    const posted = postEntry(econ.journal, econ.cash, opexLedgerDraftFor(p.topic, draft, p.minute, game.context.clocks));
    econ = Object.freeze({ ...econ, journal: posted.journal, cash: posted.cash });
  }

  const outage = mergeOutageFans(
    outageSecondsFromLanded(p.outcomes, p.contracts),
    p.corruptionOutageSecs ?? null,
  );
  let invoiceVoided = false;
  let fold: EconomyFoldOut | null = null;
  try {
    fold = runEconomyTick(Object.freeze({
      context: game.context,
      runSeed: p.runSeed,
      contracts: p.contracts,
      prior: econ,
      cfg: p.cfg,
      dunningEngineOwned: p.dunningEngineOwned,
      ...(outage !== null ? { outageSecs: outage } : {}),
      /* Pricing forward (lane @5781335 host seam): the embedded book's
         override map IS EconomyTickIn.priceOverrides' type. Absent book
         ⇒ key omitted ⇒ empty⇒omitted byte-identity (@984759b law). */
      ...(game.pricing !== undefined ? { priceOverrides: game.pricing.overrides } : {}),
      /* Negotiation forward (ADR-0015 5/5, mirrors the priceOverrides seam
         EXACTLY): the embedded book's term map IS EconomyTickIn
         .negotiations' type. Absent book ⇒ key omitted ⇒ every shipped
         money digest byte-identical (@984759b law). */
      ...(game.negotiate !== undefined ? { negotiations: game.negotiate.entries } : {}),
      /* Empty buffer ⇒ key omitted ⇒ every pre-existing input shape
         (and every witness riding it) byte-identical. */
      ...(witness.length > 0 ? { refusedSettlements: Object.freeze([...witness]) } : {}),
    }));
    econ = fold.state;
    witness.length = 0; // the fold consumed the evidence
  } catch (err) {
    if (!(err instanceof RangeError) || !NEGATIVE_BUCKET_LAW.test(err.message)) throw err;
    invoiceVoided = true;
    refusedBurnsThisTick += 1;
    /* The voided fold consumed nothing — this refusal (plus whatever was
       already pending) rides the NEXT call's witness stream. */
    witness.push(invoiceRefusalWitness(err.message));
    fold = null;
  }

  return Object.freeze({ econ, fold, refusedBurnsThisTick, opexBounces, invoiceVoided });
}

/* ═══════════════════════════ per-tick facts + guardrail sampling ══════════════════ */

/** The closed-vocab facts one tick boundary produces. A SUPERSET of what
 *  either lane sampled pre-consolidation (meanRho + door-receipt counts
 *  are read only by fastForward's hourly/report folds; the scenario lane
 *  simply ignores the extras). */
export interface TickFacts {
  readonly minute: SimMinute;
  readonly served: number;
  readonly bounced: number;
  readonly falsePositive: number;
  readonly landed: number;
  readonly arrivals: number;
  readonly ruleFirings: number;
  readonly intentsExecuted: number;
  readonly intentsRefused: number;
  readonly cashFreeMicroUsd: bigint;
  readonly economyAvailable: boolean;
  readonly errorBudgetMinSec: bigint | null;
  readonly meanRho: Fixed;
  readonly degradedNodes: number;
  readonly nodeCount: number;
}

/** The tick-result shape the fold reads (the pipeline's TickResult
 *  satisfies it; hosts may pass their full result). */
export interface FoldTickResultLike {
  readonly outcomes: readonly { readonly terminal: string | null }[];
  readonly ruleFirings: readonly unknown[];
  readonly doorReceipts: readonly { readonly outcome: string }[];
  readonly events: readonly SimEvent[];
}

/** Min remaining SLA budget (whole seconds) across contracts — sorted walk
 *  so the scan order itself is total (future census reuse). */
export function budgetMinRemainingSec(econ: EconomyState): bigint {
  let min: bigint | null = null;
  const entries = [...econ.errorBudgets.entries()].sort((a, b) => compareCodeUnits(String(a[0]), String(b[0])));
  for (const [, budget] of entries) {
    const remaining = remainingSec(budget);
    if (min === null || remaining < min) min = remaining;
  }
  return min ?? 0n;
}

export function collectFacts(game: GameState, result: FoldTickResultLike, econ: EconomyState | null): TickFacts {
  let served = 0;
  let bounced = 0;
  let falsePositive = 0;
  let landed = 0;
  for (const o of result.outcomes) {
    if (o.terminal === "served") served += 1;
    else if (o.terminal === "bounced") bounced += 1;
    else if (o.terminal === "blocked-false-positive") falsePositive += 1;
    else if (o.terminal === "landed") landed += 1;
  }
  let arrivals = 0;
  let executed = 0;
  let refused = 0;
  for (const e of result.events) if (e.kind === "arrival") arrivals += 1;
  for (const r of result.doorReceipts) {
    if (r.outcome === "executed") executed += 1;
    else refused += 1;
  }
  let rhoSum = 0n;
  let degraded = 0;
  const nodeCount = game.nodes.size;
  for (const node of game.nodes.values()) {
    rhoSum += node.utilizationRho;
    if (compare(node.utilizationRho, NODE_DEGRADED_RHO_GTE) >= 0) degraded += 1;
  }
  const meanRho: Fixed = nodeCount === 0 ? FIXED_ZERO : rhoSum / BigInt(nodeCount);
  const errorBudgetMinSec = econ !== null && econ.errorBudgets.size > 0 ? budgetMinRemainingSec(econ) : null;
  const cashFree: bigint = econ !== null ? econ.cash.free : game.cash.free;
  return Object.freeze({
    minute: game.context.minute,
    served,
    bounced,
    falsePositive,
    landed,
    arrivals,
    ruleFirings: result.ruleFirings.length,
    intentsExecuted: executed,
    intentsRefused: refused,
    cashFreeMicroUsd: cashFree,
    economyAvailable: econ !== null,
    errorBudgetMinSec,
    meanRho,
    degradedNodes: degraded,
    nodeCount,
  });
}

function trailingRate(window: readonly TickFacts[], pick: (f: TickFacts) => number): Fixed {
  if (window.length === 0) return FIXED_ZERO;
  // The SUM rides raw bigint through one divideRoundHalfAway (fromRatio).
  // Review F1: feeding a busy weekend's 5-minute total through
  // guardFixedFromInt hit the ±32767 INPUT wall and surfaced as a
  // mislabeled GUARD_PARSE. Algebra for in-range totals is unchanged (the
  // old div(guardFixedFromInt(t), guardFixedFromInt(n)) folds to the same
  // round-half-away quotient), so every pre-existing Fixed value rides on
  // byte-ident. The RESULT still obeys the kernel's Q16.16 range law — a
  // mean too large to represent is a genuine fail-loud, not a carrier
  // conversion artifact.
  let total = 0n;
  for (const f of window) total += BigInt(pick(f));
  return fromRatio(total, BigInt(window.length));
}

function windowArrivalsOf(window: readonly TickFacts[]): number {
  let arrivals = 0;
  for (const f of window) arrivals += f.arrivals;
  return arrivals;
}

/** Closed-vocab metric fold for one tick-boundary sample. Money rides raw
 *  µ$ in the Fixed carrier (`µ$ × 65536` — plain bigint math, no range
 *  ceiling; sign and threshold comparison are exact). `refusedBurns` is
 *  the ledger-refusal count for THIS tick (from
 *  `MoneyLaneTickResult.refusedBurnsThisTick`); `windowArrivals` carries
 *  the trailing window's demand evidence (F2). */
export function buildSample(
  facts: TickFacts,
  window: readonly TickFacts[],
  tick: SimTick,
  clocks: ClockState,
  refusedBurns: number,
): GuardrailSample {
  const metrics = new Map<GuardMetric, Fixed>();
  metrics.set("cash.free", facts.cashFreeMicroUsd * FIXED_ONE);
  metrics.set("servedRate", trailingRate(window, (f) => f.served));
  metrics.set("ruleFiringsPerMin", trailingRate(window, (f) => f.ruleFirings));
  metrics.set(
    "nodesDegradedPct",
    facts.nodeCount === 0 ? FIXED_ZERO : (BigInt(facts.degradedNodes) * 100n * FIXED_ONE) / BigInt(facts.nodeCount),
  );
  if (facts.errorBudgetMinSec !== null) metrics.set("errorBudgetSec", facts.errorBudgetMinSec * FIXED_ONE);
  return Object.freeze({
    tick,
    minute: facts.minute,
    clocks,
    businessMinute: Number(clocks.businessUs / MICROS_PER_MIN),
    metrics,
    economyAvailable: facts.economyAvailable,
    errorBudgetAvailable: facts.errorBudgetMinSec !== null,
    windowArrivals: windowArrivalsOf(window),
    refusedBurns,
  });
}

/* ═══════════════════════════ board wiring ═════════════════════════════════════════ */

/** Dependency edges from the node cast plus an optional deep-path chain
 *  (the maze lanes' upstream→downstream software edges; the scenario lane
 *  passes no chain — express-only until the maze seam). */
export function dependencyEdgesFor(
  nodes: readonly NodeRecord[],
  deepPath?: readonly string[],
): readonly DependencyEdge[] {
  const out: DependencyEdge[] = [];
  const chain = deepPath ?? [];
  for (let i = 1; i < chain.length; i++) {
    const upstream = chain[i - 1];
    const downstream = chain[i];
    if (upstream === undefined || downstream === undefined) continue;
    out.push(Object.freeze({
      upstreamNodeId: asEntityId(upstream),
      downstreamNodeId: asEntityId(downstream),
      correlation: "software" as const,
    }));
  }
  for (const node of nodes) {
    if (node.dependencyNodeId === null) continue;
    if (out.some((e) => String(e.downstreamNodeId) === String(node.id))) continue;
    out.push(Object.freeze({
      upstreamNodeId: node.dependencyNodeId,
      downstreamNodeId: node.id,
      correlation: "software" as const,
    }));
  }
  return Object.freeze(out);
}
