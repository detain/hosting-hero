/**
 * unattended/fastForward.ts — the Long Weekend engine (§9.2).
 *
 * "The company runs on YOUR policies" for up to 48 offline hours: a lot may
 * drift, NOTHING catastrophic may happen. This runner composes the exact
 * tick loop versus/match.ts proved — wave plans → createTickDriver with the
 * Policy-Book rule phase wired → ObservedStore gauge cells — and adds the
 * two things a weekend needs:
 *
 *  1. GUARD EVALUATION AT TICK BOUNDARIES ONLY. A catastrophe halt never
 *     lands mid-tick: the stop's snapshotDigest is digestState of the full
 *     post-advance state at the stop tick, so every prefix of an unattended
 *     run is itself a legal terminal state (pinned by test: stopping at
 *     tick N yields the same digest a clean run of N ticks produces).
 *     Sustain law: `sustainedMin` counts SAMPLES and one sample is minted
 *     per tick — at the default cadence 1 tick ≡ 1 sim-minute the counts
 *     coincide. A host that re-cadences ticks-per-minute re-scales every
 *     guard's minute threshold with it; the fold never silently reinterprets.
 *  2. THE REPORT. Hourly aggregates + checkpoint digests at a cadence
 *     (default 60 ticks = hourly at the 1 tick/sim-minute default; the
 *     perf lane made digestState limb-fast — fat state 32.7→4.3 ms @
 *     3466bdc — but a digest on every tick of 2880 is still 12 s of pure
 *     hashing, so checkpoints ride the cadence and whatIf bisects over
 *     them, the replay/verify.ts pattern).
 *
 * Money threading: unlike versus (which deliberately never touches the
 * scorecard, OD-1), the weekend MUST see money — a company can go broke
 * offline. When `money` is configured the runner registers the contracts,
 * steps runEconomyTick every tick on the driver's business clock, mirrors
 * cash + ledgerSeq into GameState (the notary contract g5 proved), and
 * posts host opex drafts at their scheduled sim-minutes. The default
 * pipeline's step-12 PASSES cash through untouched (defaults.ts:878), so
 * without this host-threading the money guards would observe zeros. The
 * ledger's bucket non-negativity law means free cash never goes BELOW zero:
 * a burn the ledger would refuse is recorded as a counted `OPEX-REFUSED
 * ×N from mK` warning (an invoice settle that would do the same is
 * `INVOICE-UNCOVERABLE`) instead of crashing the weekend — and every
 * refusal tick ARMS the freeCashDepleted sustain chain, because a burn you
 * could not pay IS inability to pay even while stray cash rides above
 * zero (review F4/F5; see the boundary doc at the runEconomyTick call).
 *
 * Honesty, not enforcement: running with `guards: []` is legal; the report
 * then carries warn `NO-GUARDS`. The guard list IS the nothing-catastrophic
 * law's enforcement — this module refuses to pretend it enforces what
 * nobody configured.
 *
 * Determinism: no Date, no Math.random, no Intl, no floats. Bigint/Fixed
 * math, sorted iteration in every aggregate, counter-RNG only, versus's
 * mint-everything-inside purity law. Same config ⇒ byte-identical report
 * (pinned ×100 via encodeTaggedTree in tests).
 */
import type {
  BoardRelation,
  ClockState,
  Contract,
  DependencyEdge,
  EntityId,
  Fixed,
  GameState,
  NodeRecord,
  ObservedCell,
  ObservedKey,
  PolicyCard,
  QosClassDef,
  RetryPolicy,
  RunSeed,
  SimEvent,
  SimMinute,
  SimTick,
  SimTimeUs,
  WaveEnvelope,
} from "../types.ts";
import { asCauseId, asEntityId, asMetricId, asMoney, observedKey, ResolutionBand } from "../types.ts";
import type { BoardEdgeRecord } from "../types.ts";
import { FIXED_ONE, FIXED_ZERO, compare, fromInt, fromRatio, mul } from "../kernel/fixed.ts";
import { MICROS_PER_MIN, initialClocks } from "../kernel/time.ts";
import { streamFor } from "../kernel/rng.ts";
import type { PressureParams } from "../waves/pressure.ts";
import type { WaveTable } from "../waves/table.ts";
import { parseWaveTable } from "../waves/table.ts";
import { planWave, waveStream } from "../waves/generate.ts";
import { buildInvitations, ledgerSnapshot } from "../waves/ledger.ts";
import { directorPropose, INITIAL_DIRECTOR_STATE, type DirectorState } from "../waves/director.ts";
import {
  createBoardState,
  createDefaultSlots,
  createInitialState,
  createTickDriver,
  digestState,
  makeSlots,
  mintHandState,
} from "../pipeline/index.ts";
import type { DefaultPipelineConfig, IntentDoorConfig, IntentReceipt } from "../pipeline/index.ts";
import { createRulePhaseStep } from "../policy/index.ts";
import { ObservedStore } from "../observed/index.ts";
import type { EconomyState, EntryDraft, EconomyConfig, EconomyNoticeKind, RevenueColourTags } from "../economy/index.ts";
import {
  defaultEconomyConfig,
  emptyEconomyState,
  postEntry,
  registerContractEconomy,
  remainingSec,
  runEconomyTick,
} from "../economy/index.ts";
import { compareCodeUnits } from "../internal/canonical.ts";
import {
  UnattendedError,
  evaluateGuardrail,
  parseGuardList,
  type GuardEvaluation,
  type GuardMetric,
  type GuardrailSample,
  type ParsedGuard,
} from "./guardrails.ts";

/* ═══════════════════════════ tunables (exported, frozen) ═══════════════════════════ */

/** Default checkpoint cadence: every 60 ticks = every sim-hour at the
 *  1 tick/sim-minute default cadence. */
export const DEFAULT_CHECKPOINT_EVERY = 60;

/** §9.2 ceiling: the weekend promise covers the first 2880 ticks (48h at
 *  1 tick/sim-minute). Beyond it the report WARNS (a Succession 90-day arc
 *  is a legitimate longer run) rather than refusing. */
export const LONG_WEEKEND_MAX_TICKS = 2880;

/** The economy's negative-bucket law signature (economy/buckets.ts +
 *  economy/money.ts share the "(had … µ$) would go negative" message
 *  family). The insolvent-settle boundary (review F4) catches ONLY
 *  RangeErrors whose message matches — everything else rethrows. */
const NEGATIVE_BUCKET_LAW = /would go negative/;

/** Trailing window (sim-minutes) for the servedRate / ruleFiringsPerMin
 *  metrics — one empty tick is a hiccup, five is a catastrophe
 *  (PROVISIONAL owner taste). */
export const GUARD_TRAILING_WINDOW_MIN = 5;

/** QoS cast for the weekend — versus's proven two-class shape. Real sold
 *  per-board classes ride in through hosts later (OD seam). */
export const UNATTENDED_CLASSES: readonly QosClassDef[] = Object.freeze([
  Object.freeze({
    id: "gold",
    label: "Gold",
    weight: fromRatio(6n, 10n),
    shedPriority: 0,
    budgetUs: 5n * MICROS_PER_MIN,
    inspectionDepth: "inspect" as const,
  }),
  Object.freeze({
    id: "bronze",
    label: "Bronze",
    weight: FIXED_ZERO,
    shedPriority: 1,
    budgetUs: 30n * MICROS_PER_MIN,
    inspectionDepth: "pass-through" as const,
  }),
]);

/** Retry posture identical to versus's proven shape. */
export const UNATTENDED_RETRY: RetryPolicy = Object.freeze({
  maxRetries: 2,
  backoffBaseUs: 2n * MICROS_PER_MIN,
  jitterPurchased: false,
});

/** Default weekend traffic: one flat organic plateau of 40 units/sim-minute
 *  (§9.2 drift under NORMAL load, not drama; scripted pressure arrives as
 *  waves DATA through traffic.table). 0 disables the baseline. */
export const UNATTENDED_BASELINE_RATE_PER_MIN = 40;

/** Inspection ROC posture — versus's tested defaults (aggression 0.7,
 *  express split at ρ 0.6). The autopilot does not move the sliders
 *  offline; the host's last settings ride in via config. */
export const UNATTENDED_AGGRESSION: Fixed = fromRatio(7n, 10n);
export const UNATTENDED_EXPRESS_MAX_CONFIDENCE: Fixed = fromRatio(6n, 10n);

/** §6.13 degraded reading for the cascadeCollapse census: ρ at/above this
 *  marks a node degraded (PROVISIONAL owner taste — the ρ/(1−ρ) knee R-07
 *  lives lower; 0.9 reads "dying", not "busy"). */
export const NODE_DEGRADED_RHO_GTE: Fixed = fromRatio(9n, 10n);

/** Neutral revenue-colour census for registered contracts (PROVISIONAL:
 *  the five-axis RevenueColourTags default — mid-band "blue" everywhere;
 *  hosts with real tags override via money.revenueTags). */
const DEFAULT_REVENUE_TAGS: RevenueColourTags = Object.freeze({
  margin: "blue",
  churnRisk: "blue",
  term: "blue",
  concentration: "blue",
  abuse: "blue",
} as const);

/** Patience budget for weekend traffic (PROVISIONAL: 120 sim-minutes,
 *  gate-fixture shape; real per-population patience is the bundle's). */
export const UNATTENDED_DEFAULT_PATIENCE_MIN = 120;

/* ═══════════════════════════ the config record ═══════════════════════════ */

/** Traffic: flat baseline plateau by default; legal waves data (parsed +
 *  law-enforced at parse time like versus) when supplied. */
export interface UnattendedTrafficConfig {
  /** Envelope table id (default "unattended-baseline"). */
  readonly tableId?: string;
  /** Flat plateau rate (units/sim-minute). fromInt(0) disables it. */
  readonly baselineRatePerMin?: Fixed;
  /** Waves corpus for parseWaveTable — scheduled back-to-back from
   *  waveStartMinute through planWave + directorPropose (the versus
   *  offline recipe, placement draws included). */
  readonly table?: unknown;
  /** First wave's window start (default 2, like versus). */
  readonly waveStartMinute?: SimMinute;
  /** Forwarded to planWave (default the table's own sheet). */
  readonly pressureParams?: PressureParams;
}

/** One host-scheduled burn posted through the ledger at its sim-minute
 *  (payroll-like). DATA, never code — g5's scripted-opex pattern. */
export interface UnattendedOpexDraft {
  readonly atMinute: SimMinute;
  readonly amountMicroUsd: bigint;
  /** Stable tag inside the cause id (unique per (minute,memo) pair). */
  readonly memo: string;
}

/** Money for the weekend. Absent ⇒ cash stays mint-zero; money guards
 *  observe nothing and never fire ("unavailable", honesty law). */
export interface UnattendedMoneyConfig {
  /** Contracts registered at business minute 0. */
  readonly contracts: readonly Contract[];
  /** Opening free-cash balance, posted once at minute 0 as a ledger entry
   *  (cause "unattended:opening-balance"). Default 0. */
  readonly initialFreeMicroUsd?: bigint;
  /** Recurring burns posted at their exact sim-minutes. */
  readonly opex?: readonly UnattendedOpexDraft[];
  /** Economy config override (default defaultEconomyConfig()). */
  readonly cfg?: EconomyConfig;
  /** SLA commitment bps at registration (default 9_990n = 99.9%, g5). */
  readonly commitmentBps?: bigint;
  /** Dunning Engine buildable owned (default false). */
  readonly dunningEngineOwned?: boolean;
  /** Revenue-colour census applied to every registered contract (default:
   *  neutral "blue" on all five axes — PROVISIONAL; per-contract tags are
   *  a save/bundle concern the loader lane owns). */
  readonly revenueTags?: RevenueColourTags;
}

/** The board cast — plain structural records (hosts and tests hand data;
 *  NodeRecords are minted from these, versus's mkNode shape). */
export interface UnattendedNodeSpec {
  readonly id: string;
  readonly kind?: string;
  /** SLOTS, not HP (R-32). */
  readonly slots: number;
  readonly serviceTimeUs: bigint;
  readonly dependencyNodeId?: string | null;
  /** Defense posture (default "inspect"); the disableDefense what-if delta
   *  patches this to "pass-through" — the driver's per-node depth read. */
  readonly inspectionDepth?: "pass-through" | "sample-1-in-20" | "inspect" | "challenge";
}

export interface UnattendedEdgeSpec {
  readonly id: string;
  readonly relation: BoardRelation;
  readonly from: string;
  readonly to: string;
  readonly slot?: string | null;
}

export interface UnattendedBoardCast {
  readonly nodes: readonly UnattendedNodeSpec[];
  readonly edges?: readonly UnattendedEdgeSpec[];
}

export interface RunUnattendedConfig {
  readonly runSeed: RunSeed;
  /** Provide at least one; when both, the minimum governs. */
  readonly ticks?: SimTick;
  readonly maxSimMinutes?: SimMinute;
  readonly board: UnattendedBoardCast;
  readonly ruleBook: readonly PolicyCard[];
  readonly ruleBookHash: string;
  readonly guards: readonly unknown[];
  readonly traffic?: UnattendedTrafficConfig;
  readonly money?: UnattendedMoneyConfig;
  /** Digest cadence in ticks (default 60; ≥1). */
  readonly checkpointEvery?: number;
  /** Intent-door wiring for hosts keeping hands live (versus recipe);
   *  default: driver's door defaults — a pure autopilot weekend feeds the
   *  door NOTHING (advisory-only rule intents, versus friction #2). */
  readonly door?: IntentDoorConfig;
  readonly handCapacity?: number;
  /** Routing lanes (defaults: express = every node, deep = []). */
  readonly expressPath?: readonly string[];
  readonly deepPath?: readonly string[];
  readonly expressMaxConfidence?: Fixed;
  readonly aggression?: Fixed;
  readonly defaultPatienceMin?: number;
  /** Autopilot gauge cell: observed property on the FIRST board node,
   *  cumulative arrivals (versus doctrineGauge). Default
   *  "unattended-arrivals". */
  readonly gaugeMetric?: string;
  /** Engine version stamp inside minted state (digest-visible). */
  readonly engineVersion?: string;
}

/* ═══════════════════════════ the report records ═══════════════════════════ */

/** Halt record: the stop IS the end-state witness. `snapshotDigest` is
 *  digestState of the post-advance state at the stop tick — byte-equal to
 *  the digest of a clean run that simply ENDED at that tick (never-mid-tick
 *  law, pinned by test). */
export interface UnattendedStop {
  readonly reason: string;
  readonly atTick: SimTick;
  readonly atMinute: SimMinute;
  readonly snapshotDigest: string;
  /** Every triggered verdict on the stop tick (list-order winner rides
   *  `reason`). */
  readonly triggered: readonly GuardEvaluation[];
}

export interface UnattendedCheckpoint {
  readonly tick: SimTick;
  readonly digest: string;
}

export interface UnattendedSummary {
  readonly served: number;
  /** bounced ≡ blocked-at-gate (OutcomeTerminal closed union). */
  readonly blocked: number;
  readonly falsePositive: number;
  readonly landed: number;
  readonly ruleFirings: number;
  readonly intentsExecuted: number;
  readonly intentsRefused: number;
  /** Free-cash movement across the session, plain µ$ (bigint domain). */
  readonly cashDeltaMicroUsd: bigint;
  readonly cashStartMicroUsd: bigint;
  readonly cashEndMicroUsd: bigint;
  /** Economy notice census by kind, sorted by kind code-unit. */
  readonly invoiceEvents: ReadonlyMap<EconomyNoticeKind, number>;
}

export interface UnattendedHourBucket {
  readonly hour: number;
  readonly startMinute: SimMinute;
  readonly endMinuteExclusive: SimMinute;
  readonly served: number;
  readonly blocked: number;
  readonly landed: number;
  readonly falsePositive: number;
  readonly ruleFirings: number;
  readonly arrivals: number;
  /** Fixed units/sim-minute: raw-bigint arrival sum ÷ covered ticks,
   *  round-half-away (the fromRatio fold — no Q16.16 INPUT wall, review F1). */
  readonly meanArrivalRatePerMin: Fixed;
  /** Fixed mean of per-tick mean ρ (truncated bigint mean). */
  readonly meanRho: Fixed;
  /** Fixed max per-tick mean ρ observed in the hour. */
  readonly peakRho: Fixed;
  /** Ticks in the hour with ≥1 degraded node (ρ ≥ NODE_DEGRADED_RHO_GTE). */
  readonly degradedTicks: number;
  /** Plain µ$ truncated mean of tick-end free cash. */
  readonly meanFreeCashMicroUsd: bigint;
}

export interface UnattendedReport {
  readonly runSeed: RunSeed;
  readonly ticksRun: SimTick;
  readonly stop: UnattendedStop | null;
  readonly finalDigest: string;
  readonly perCheckpoint: readonly UnattendedCheckpoint[];
  readonly summary: UnattendedSummary;
  readonly hourlyBuckets: readonly UnattendedHourBucket[];
  /** Honest advisory lines (deduped, code-unit sorted). */
  readonly warns: readonly string[];
  readonly guardsParsed: readonly ParsedGuard[];
}

/* ═══════════════════════════ per-tick facts + sampling ═══════════════════════════ */

interface TickFacts {
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

/** Closed-vocab metric fold for one tick-boundary sample. Money rides raw
 *  µ$ in the Fixed carrier (`µ$ × 65536` — plain bigint math, no range
 *  ceiling; sign and threshold comparison are exact). `refusedBurns` is the
 *  ledger-refusal count for THIS tick (opex bounces + voided settles);
 *  `windowArrivals` carries the trailing window's demand evidence (F2). */
function buildSample(
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

interface TickOutcomeLike {
  readonly outcomes: readonly { readonly terminal: string | null }[];
  readonly ruleFirings: readonly unknown[];
  readonly doorReceipts: readonly IntentReceipt[];
  readonly events: readonly SimEvent[];
}

function collectFacts(game: GameState, result: TickOutcomeLike, econ: EconomyState | null): TickFacts {
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

/* ═══════════════════════════ minting (exported for whatIf + hosts) ═══════════════════════════ */

/** NodeRecords from the board cast — versus's mkNode shape verbatim. */
export function mintNodeRecords(cast: readonly UnattendedNodeSpec[]): readonly NodeRecord[] {
  return Object.freeze(
    cast.map((n) =>
      Object.freeze({
        id: asEntityId(n.id),
        kind: n.kind ?? "generic",
        slots: makeSlots(n.slots),
        serviceTimeUs: n.serviceTimeUs as SimTimeUs,
        queueDepth: 0,
        queue: Object.freeze([]) as readonly EntityId[],
        shedOrder: "qos-weighted" as const,
        inspectionDepth: n.inspectionDepth ?? ("inspect" as const),
        discipline: "hockey-stick" as const,
        utilizationRho: FIXED_ZERO,
        dependencyNodeId: n.dependencyNodeId == null ? null : asEntityId(n.dependencyNodeId),
      }),
    ),
  );
}

export function mintBoardEdges(edges: readonly UnattendedEdgeSpec[] | undefined): readonly BoardEdgeRecord[] {
  return Object.freeze(
    (edges ?? []).map((e) =>
      Object.freeze({
        id: asEntityId(e.id),
        relation: e.relation,
        from: asEntityId(e.from),
        to: asEntityId(e.to),
        slot: e.slot ?? null,
      }),
    ),
  );
}

export function mintInitialState(
  config: RunUnattendedConfig,
  nodes: readonly NodeRecord[],
  edges: readonly BoardEdgeRecord[],
): GameState {
  return createInitialState({
    runSeed: config.runSeed,
    engineVersion: config.engineVersion ?? "unattended-v0",
    contentHashes: {
      rulesetCardHashes: {},
      sheetsHash: "unattended-sheets-v0",
      ruleBookHash: config.ruleBookHash,
    },
    clocks: initialClocks(),
    nodes,
    ruleBook: config.ruleBook,
    ruleBookHash: config.ruleBookHash,
    board: createBoardState(edges),
    hands: mintHandState(config.handCapacity ?? 2),
  });
}

/** The versus pipeline posture expressed from the config (exported so
 *  whatIf and hosts re-derive identically). */
export function buildPipelineConfig(config: RunUnattendedConfig, nodes: readonly NodeRecord[]): DefaultPipelineConfig {
  const express = config.expressPath ?? nodes.map((n) => String(n.id));
  if (express.length === 0) {
    // BOARD_EMPTY (review F10): this refusal is about a board with no
    // topology to route on — traffic emptiness is the NO-TRAFFIC warn's
    // domain, and naming both "traffic" conflated two different fixes.
    throw new UnattendedError("BOARD_EMPTY", "buildPipelineConfig", "empty board: no express path and no dnsNodeId");
  }
  return Object.freeze({
    runSeed: config.runSeed,
    dnsNodeId: null,
    expressPath: Object.freeze(express.map((id) => asEntityId(id))),
    deepPath: Object.freeze((config.deepPath ?? []).map((id) => asEntityId(id))),
    defaultPatienceUs: BigInt(config.defaultPatienceMin ?? UNATTENDED_DEFAULT_PATIENCE_MIN) * MICROS_PER_MIN,
    defaultSizeCost: fromInt(1),
    patienceJitterPct: 0,
    inspectionCostUs: Object.freeze({
      "pass-through": 0n,
      "sample-1-in-20": 3_000_000n,
      inspect: 10_000_000n,
      challenge: 20_000_000n,
    }),
    detectionRatio: fromRatio(9n, 10n),
    falsePositiveRatio: fromRatio(10n, 100n),
    referralProbability: FIXED_ZERO,
    returnProbability: FIXED_ZERO,
  });
}

function dependencyEdgesFor(nodes: readonly NodeRecord[], deepPath: readonly string[] | undefined): readonly DependencyEdge[] {
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

function baselineEnvelope(config: RunUnattendedConfig): WaveEnvelope | null {
  const rate = config.traffic?.baselineRatePerMin;
  if (rate !== undefined && compare(rate, FIXED_ZERO) === 0) return null;
  return Object.freeze({
    tableId: config.traffic?.tableId ?? "unattended-baseline",
    role: "baseline" as const,
    shape: "plateau" as const,
    ratePerMin: rate ?? fromInt(UNATTENDED_BASELINE_RATE_PER_MIN),
    telegraphed: true,
    dominantFamily: "organic" as const,
  });
}

/** Wave windows: back-to-back from waveStartMinute; plan.startMinute is the
 *  placement-draw result (versus law), envelope is plan.waveEnvelope. */
interface WaveWindow {
  readonly n: number;
  readonly startMinute: SimMinute;
  readonly windowMinutes: number;
  readonly envelope: WaveEnvelope;
}

function buildWaveWindows(seed: RunSeed, config: RunUnattendedConfig, table: WaveTable): readonly WaveWindow[] {
  const windows: WaveWindow[] = [];
  let director: DirectorState = INITIAL_DIRECTOR_STATE;
  let cursor = config.traffic?.waveStartMinute ?? 2;
  for (const wave of table.waves) {
    const rng = waveStream(seed, wave.n, cursor);
    const proposed = directorPropose(director, BigInt(cursor), streamFor(seed, "director", cursor));
    director = proposed.next;
    const plan = planWave(table, wave.n, {
      startMinute: cursor,
      tick: BigInt(cursor),
      rng,
      director,
      ledger: ledgerSnapshot([], 0n),
      invitations: buildInvitations({}),
      entropyForecastPurchased: false,
      ...(config.traffic?.pressureParams !== undefined ? { pressureParams: config.traffic.pressureParams } : {}),
    });
    windows.push({ n: wave.n, startMinute: plan.startMinute, windowMinutes: wave.windowMinutes, envelope: plan.waveEnvelope });
    cursor += wave.windowMinutes;
  }
  return Object.freeze(windows);
}

function envelopesAtMinute(
  windows: readonly WaveWindow[],
  baseline: WaveEnvelope | null,
  minute: SimMinute,
  surge: SurgeWindow | null,
): readonly WaveEnvelope[] {
  const active: WaveEnvelope[] = [];
  for (const w of windows) {
    if (minute >= w.startMinute && minute < w.startMinute + w.windowMinutes) active.push(w.envelope);
  }
  if (baseline !== null) {
    active.push(surge !== null && surge.covers(minute) ? surge.scaled(baseline) : baseline);
  }
  return Object.freeze(active);
}

/** A trafficSurge applied to the baseline plateau (whatIf delta data). */
interface SurgeWindow {
  readonly fromMinute: SimMinute;
  readonly toMinuteExclusive: SimMinute;
  readonly multiplier: Fixed;
  covers(minute: SimMinute): boolean;
  scaled(env: WaveEnvelope): WaveEnvelope;
}

function makeSurge(multiplier: Fixed, fromMinute: SimMinute, minutes: SimMinute): SurgeWindow {
  return Object.freeze({
    multiplier,
    fromMinute,
    toMinuteExclusive: fromMinute + minutes,
    covers(minute: SimMinute): boolean {
      return minute >= fromMinute && minute < fromMinute + minutes;
    },
    scaled(env: WaveEnvelope): WaveEnvelope {
      return Object.freeze({ ...env, ratePerMin: mul(env.ratePerMin, multiplier) });
    },
  });
}

/** Cumulative-arrival gauge value, saturating at the Q16.16 raw ceiling a
 *  doctrine threshold can name (32767.0). Past saturation every "greater"
 *  card is simply ON — exact weekend totals live in the summary. */
function gaugeValue(cumulativeArrivals: number): Fixed {
  return BigInt(Math.min(cumulativeArrivals, 32767)) * FIXED_ONE;
}

function gaugeCell(value: Fixed): ObservedCell<unknown> {
  return Object.freeze({
    value,
    fidelity: ResolutionBand.Exact,
    freshnessUs: 0n,
    coverage: fromInt(1),
    certainty: fromInt(1),
    status: "live" as const,
  });
}

/* ═══════════════════════════ the runner ═══════════════════════════ */

interface HourAcc {
  hour: number;
  served: number;
  blocked: number;
  landed: number;
  falsePositive: number;
  ruleFirings: number;
  arrivals: number;
  ticks: number;
  rhoSum: bigint;
  peakRho: Fixed;
  degradedTicks: number;
  cashSum: bigint;
}

function foldHour(acc: HourAcc, f: TickFacts): void {
  acc.served += f.served;
  acc.blocked += f.bounced;
  acc.landed += f.landed;
  acc.falsePositive += f.falsePositive;
  acc.ruleFirings += f.ruleFirings;
  acc.arrivals += f.arrivals;
  acc.ticks += 1;
  acc.rhoSum += f.meanRho;
  if (compare(f.meanRho, acc.peakRho) > 0) acc.peakRho = f.meanRho;
  if (f.degradedNodes > 0) acc.degradedTicks += 1;
  acc.cashSum += f.cashFreeMicroUsd;
}

function closeHour(acc: HourAcc): UnattendedHourBucket {
  const covered = Math.max(1, acc.ticks);
  return Object.freeze({
    hour: acc.hour,
    startMinute: acc.hour * 60,
    endMinuteExclusive: (acc.hour + 1) * 60,
    served: acc.served,
    blocked: acc.blocked,
    landed: acc.landed,
    falsePositive: acc.falsePositive,
    ruleFirings: acc.ruleFirings,
    arrivals: acc.arrivals,
    // Raw-bigint fold (review F1): hourly arrival counts sail past 32 767
    // on any busy hour — carry the sum in bigint and divide once,
    // round-half-away, exactly like trailingRate.
    meanArrivalRatePerMin: fromRatio(BigInt(acc.arrivals), BigInt(covered)),
    meanRho: acc.rhoSum / BigInt(covered),
    peakRho: acc.peakRho,
    degradedTicks: acc.degradedTicks,
    meanFreeCashMicroUsd: acc.cashSum / BigInt(covered),
  });
}

/**
 * Run the Long Weekend. PURE at the API boundary: every mutable (driver,
 * rule-phase closure, observed store, economy state) is minted inside the
 * call; same config ⇒ byte-identical report. The weekend is a REPORT
 * service (§9.2 — you return to a report and queued decisions): the final
 * GameState is exposed through digest + aggregates, never as a handle.
 */
export function runUnattended(config: RunUnattendedConfig): UnattendedReport {
  return runUnattendedInner(config, null);
}

/** whatIf hook: same law, plus a baseline-envelope surge window. Internal
 *  signature kept module-private (the public surface is runUnattended). */
function runUnattendedInner(config: RunUnattendedConfig, surge: SurgeWindow | null): UnattendedReport {
  const seed = config.runSeed;
  const totalTicks = resolveTicks(config);
  const checkpointEvery = resolveCheckpointEvery(config.checkpointEvery);
  const guards = parseGuardList(config.guards);
  const warns = new Set<string>();
  if (guards.length === 0) warns.add("NO-GUARDS");
  if (totalTicks > LONG_WEEKEND_MAX_TICKS) {
    warns.add(`LONG-WEEKEND-EXCEEDED: ${totalTicks} ticks beyond the §9.2 48h cap of ${LONG_WEEKEND_MAX_TICKS}`);
  }
  if (config.money === undefined && guards.some(guardRidesMoney)) {
    warns.add("MONEY-GUARD-WITHOUT-ECONOMY: cash observations stay unavailable and money guards can never fire");
  }
  // Review F3 (empty-roster deafness): a THREADING economy with contracts:
  // [] mints no error budgets — errorBudgetGone and errorBudgetSec
  // thresholds are permanently "unavailable" with nobody ever saying so.
  // The money-absent case already rides the warn above; this closes the
  // funded-but-rosterless hole. Cash guards stay legal here (opex-only
  // weekends are the DRIP shape the tests ratify) — the warn is scoped to
  // the budget-riding rows only.
  if (config.money !== undefined && config.money.contracts.length === 0 && guards.some(guardRidesErrorBudget)) {
    warns.add("BUDGET-GUARD-NO-CONTRACTS: money.contracts is empty — errorBudget observations stay unavailable and errorBudgetGone/errorBudgetSec guards can never fire");
  }

  /* ── mint the world (versus purity law: everything inside) ── */
  const nodes = mintNodeRecords(config.board.nodes);
  const edges = mintBoardEdges(config.board.edges);
  const pipelineConfig = buildPipelineConfig(config, nodes);
  const baseline = baselineEnvelope(config);
  const trafficTable = config.traffic?.table !== undefined ? parseWaveTable(config.traffic.table) : null;
  if (trafficTable === null && baseline === null) {
    warns.add("NO-TRAFFIC: baseline disabled and no waves table — the weekend observes an empty pipe");
  }
  const windows = trafficTable !== null ? buildWaveWindows(seed, config, trafficTable) : [];

  const rulePhase = createRulePhaseStep();
  const slots = Object.freeze({ ...createDefaultSlots(pipelineConfig), rulePhase: rulePhase.step });
  const game0 = mintInitialState(config, nodes, edges);
  const driver = createTickDriver(slots, streamFor(seed, "root", 0), game0.context.clocks, {
    ...(config.door !== undefined ? { intents: config.door } : {}),
  });
  const store = new ObservedStore();
  const gaugeNode = nodes[0]?.id ?? asEntityId("unattended-gauge");
  const gaugeKey = observedKey(gaugeNode, asMetricId(config.gaugeMetric ?? "unattended-arrivals"));

  /* ── money lane ── */
  const ecoCfg = config.money?.cfg ?? defaultEconomyConfig();
  let econ: EconomyState | null = null;
  const contractsBook = new Map<EntityId, Contract>();
  if (config.money !== undefined) {
    econ = emptyEconomyState();
    const opening = config.money.initialFreeMicroUsd ?? 0n;
    if (opening !== 0n) {
      const posted = postEntry(econ.journal, econ.cash, openingDraft(opening));
      econ = Object.freeze({ ...econ, journal: posted.journal, cash: posted.cash });
    }
    for (const contract of config.money.contracts) {
      contractsBook.set(contract.id, contract);
      econ = registerContractEconomy(
        econ,
        {
          contract,
          atBusinessMin: 0,
          clauseRefs: ["auto-renew"],
          grandfather: null,
          revenueTags: config.money.revenueTags ?? DEFAULT_REVENUE_TAGS,
          commitmentBps: config.money.commitmentBps ?? 9_990n,
        },
        ecoCfg,
      );
    }
  }
  const opexByMinute = new Map<SimMinute, readonly UnattendedOpexDraft[]>();
  // Review F6: the opex record's boundary laws, enforced where the data
  // enters. A negative burn is a GIFT wearing an expense's clothes (the
  // ledger would credit free cash on a weekend nobody approved), and two
  // drafts sharing (atMinute,memo) would mint the SAME cause id — the
  // docstring promised uniqueness, so enforce rather than document harder.
  const opexDraftSeen = new Set<string>();
  for (const [i, draft] of (config.money?.opex ?? []).entries()) {
    const at = `runUnattended.money.opex[${i}]`;
    if (typeof draft.amountMicroUsd !== "bigint" || draft.amountMicroUsd < 1n) {
      throw new UnattendedError("CONFIG_PARSE", `${at}.amountMicroUsd`, `needs a bigint ≥ 1 µ$, got ${String(draft.amountMicroUsd)} — a burn below one penny is a gift, not an expense`);
    }
    const twinKey = `${draft.atMinute}\u0000${draft.memo}`;
    if (opexDraftSeen.has(twinKey)) {
      throw new UnattendedError("CONFIG_PARSE", at, `duplicate (atMinute,memo) m${draft.atMinute}:${draft.memo} — both drafts would mint the same cause id`);
    }
    opexDraftSeen.add(twinKey);
    const prior = opexByMinute.get(draft.atMinute) ?? [];
    opexByMinute.set(draft.atMinute, Object.freeze([...prior, draft]));
  }

  /* ── accumulators ── */
  const summary = {
    served: 0,
    blocked: 0,
    falsePositive: 0,
    landed: 0,
    ruleFirings: 0,
    intentsExecuted: 0,
    intentsRefused: 0,
    notices: new Map<EconomyNoticeKind, number>(),
  };
  const hours = new Map<number, HourAcc>();
  const checkpoints: UnattendedCheckpoint[] = [];
  const sustainRuns = new Map<string, number>();
  const window: TickFacts[] = [];

  /* Ledger-refusal census (review F5): refusals COUNT (warn carries ×N from
     mK — one deduped, honest, counting line instead of a silent singleton)
     and every refusal tick feeds the freeCashDepleted sustain chain via the
     sample's `refusedBurns` field — one chain step per tick no matter how
     many bounces (no F4×F5 double-fire: both refusal kinds fold into the
     same per-tick counter the evaluator reads once). */
  const refusals = {
    opexCount: 0,
    opexFirstMinute: -1,
    invoiceCount: 0,
    invoiceFirstMinute: -1,
  };

  let game = withCashMirror(game0, econ);
  const cashStart: bigint = game.cash.free;
  let arrivalsSeen = 0;
  let stop: UnattendedStop | null = null;

  for (let t = 1; t <= totalTicks; t++) {
    const minute = game.context.minute + 1;
    const result = driver.advance(game, Object.freeze({
      envelopes: envelopesAtMinute(windows, baseline, minute, surge),
      evidence: Object.freeze([]),
      classes: UNATTENDED_CLASSES,
      dependencyEdges: dependencyEdgesFor(nodes, config.deepPath),
      retryPolicy: UNATTENDED_RETRY,
      aggression: config.aggression ?? UNATTENDED_AGGRESSION,
      expressMaxConfidence: config.expressMaxConfidence ?? UNATTENDED_EXPRESS_MAX_CONFIDENCE,
    }));
    game = result.state;

    /* gauge: cumulative arrivals folded into an observed cell so the
       Policy Book fires on traffic (versus doctrineGauge). The cell value
       SATURATES at 32767.0 — the Q16.16 raw ceiling a doctrine threshold
       can name (§7.8d meter-rescale reading: past a weekend's worth of
       arrivals every >-threshold card is simply ON; exact counts stay in
       the summary). (OWNER QUESTION: log-scaled gauge for mega-weekends.) */
    for (const e of result.events) if (e.kind === "arrival") arrivalsSeen += 1;
    store.applyObservedWrites(
      Object.freeze([Object.freeze({ key: gaugeKey, cell: gaugeCell(gaugeValue(arrivalsSeen)), causeId: asCauseId(`unattended:gauge:${t}`) })]),
      game.context.clocks.simUs,
    );
    game = Object.freeze({ ...game, observed: mergeObserved(game.observed, store) });

    /* money lane: opex at exact sim-minutes, economy tick, notary mirror.
       `refusedBurnsThisTick` counts THIS tick's ledger refusals (opex
       bounces + voided settles) for the guard sample — inability-to-pay
       evidence (review F5). */
    let refusedBurnsThisTick = 0;
    if (econ !== null) {
      for (const draft of opexByMinute.get(minute) ?? []) {
        if (econ.cash.free < draft.amountMicroUsd) {
          refusals.opexCount += 1;
          if (refusals.opexFirstMinute < 0) refusals.opexFirstMinute = minute;
          refusedBurnsThisTick += 1;
          continue;
        }
        const posted = postEntry(econ.journal, econ.cash, opexLedgerDraft(draft, minute, game.context.clocks));
        econ = Object.freeze({ ...econ, journal: posted.journal, cash: posted.cash });
      }
      const outage = outageSecondsFromLanded(result.outcomes, config);
      /* ─── INSOLVENT-SETTLE BOUNDARY (review F4) ────────────────────────
         economy/ refuses negative buckets by THROWING a raw RangeError
         from deep inside settle → draftEntry → applyBucketDelta when a
         due invoice's NET would drive 'free' below zero (credit-heavy
         settles included). A clean pre-check is not expressible here
         without duplicating economy's accrual/catch-up/credit arithmetic
         — that would fork the settle law into a second, drift-prone copy.
         So the weekend converts the ledger's own refusal into a typed,
         counted event at THIS call site, and nothing else is swallowed:
         ONLY `RangeError` whose message carries the negative-bucket
         family ("(had … µ$) would go negative" — buckets.ts + money.ts
         law text) is caught; every other error rethrows untouched.

         Why catch-and-keep-prior is STATE-CONSISTENT: runEconomyTick
         copies input.prior into a fresh working state before mutating
         (economy/tick.ts) — a mid-tick throw leaves `prior` untouched,
         so retaining `econ` forfeits exactly this tick's economy
         progress (its notices included) and the SAME due invoice retries
         next tick with the SAME refusal. That is deterministic
         livelock-by-design: the run neither crashes nor silently
         "succeeds" — the warn census plus the chain-armed money guard
         (a burn the ledger refused IS inability to pay) is the answer.

         OWNER QUESTION (economy lane): expose a queryable `canSettle()`
         so this lane can pre-check at notice level and this catch can
         retire. Until then the boundary lives HERE, documented loudly. */
      let econAdvanced = false;
      try {
        const out = runEconomyTick(Object.freeze({
          context: game.context,
          runSeed: seed,
          contracts: contractsBook,
          prior: econ,
          cfg: ecoCfg,
          dunningEngineOwned: config.money?.dunningEngineOwned ?? false,
          ...(outage !== null ? { outageSecs: outage } : {}),
        }));
        econ = out.state;
        for (const notice of out.notices) summary.notices.set(notice.kind, (summary.notices.get(notice.kind) ?? 0) + 1);
        econAdvanced = true;
      } catch (err) {
        if (!(err instanceof RangeError) || !NEGATIVE_BUCKET_LAW.test(err.message)) throw err;
        refusals.invoiceCount += 1;
        if (refusals.invoiceFirstMinute < 0) refusals.invoiceFirstMinute = minute;
        refusedBurnsThisTick += 1;
      }
      if (econAdvanced) game = withCashMirror(game, econ);
    }

    /* facts → guards at the tick boundary (NEVER mid-tick) */
    const facts = collectFacts(game, result, econ);
    summary.served += facts.served;
    summary.blocked += facts.bounced;
    summary.falsePositive += facts.falsePositive;
    summary.landed += facts.landed;
    summary.ruleFirings += facts.ruleFirings;
    summary.intentsExecuted += facts.intentsExecuted;
    summary.intentsRefused += facts.intentsRefused;

    const hourKey = Math.floor(facts.minute / 60);
    let hour = hours.get(hourKey);
    if (hour === undefined) {
      hour = { hour: hourKey, served: 0, blocked: 0, landed: 0, falsePositive: 0, ruleFirings: 0, arrivals: 0, ticks: 0, rhoSum: 0n, peakRho: FIXED_ZERO, degradedTicks: 0, cashSum: 0n };
      hours.set(hourKey, hour);
    }
    foldHour(hour, facts);

    window.push(facts);
    if (window.length > GUARD_TRAILING_WINDOW_MIN) window.shift();

    const atCadence = Number(game.context.tick % BigInt(checkpointEvery)) === 0;
    let tickDigest: string | null = null;
    if (atCadence || guards.length > 0) {
      tickDigest = digestState(game);
      if (atCadence) checkpoints.push(Object.freeze({ tick: game.context.tick, digest: tickDigest }));
    }

    if (guards.length > 0) {
      const sample = buildSample(facts, window, game.context.tick, game.context.clocks, refusedBurnsThisTick);
      let firstReason: string | null = null;
      const triggered: GuardEvaluation[] = [];
      for (let gi = 0; gi < guards.length; gi++) {
        const guard = guards[gi] as ParsedGuard;
        const key = `${gi}|${guard.reason}`;
        const stepped = evaluateGuardrail(guard, sample, sustainRuns.get(key) ?? 0);
        sustainRuns.set(key, stepped.nextRun);
        if (stepped.evaluation.verdict === "triggered") {
          triggered.push(stepped.evaluation);
          if (firstReason === null) firstReason = guard.reason; // list-order wins the shared-tick race
        }
      }
      if (firstReason !== null) {
        const snapshot = tickDigest ?? digestState(game);
        stop = Object.freeze({
          reason: firstReason,
          atTick: game.context.tick,
          atMinute: game.context.minute,
          snapshotDigest: snapshot,
          triggered: Object.freeze(triggered),
        });
        break;
      }
    }
  }

  /* One deduped, COUNTING census line per refusal kind (review F5):
     `×N from mK` answers "how deaf was I?" without 20 identical warns. */
  if (refusals.opexCount > 0) {
    warns.add(`OPEX-REFUSED ×${refusals.opexCount} from m${refusals.opexFirstMinute}: the ledger refuses negative buckets — a scheduled burn could not be covered`);
  }
  if (refusals.invoiceCount > 0) {
    warns.add(`INVOICE-UNCOVERABLE ×${refusals.invoiceCount} from m${refusals.invoiceFirstMinute}: an invoice settle would have driven a bucket negative — the tick's economy progress was voided and will retry; host must fund the roster (see OWNER QUESTION: economy canSettle())`);
  }

  return assembleReport(seed, totalTicks, game, cashStart, stop, checkpoints, summary, hours, warns, guards, econ);
}

/* ═══════════════════════════ report plumbing ═══════════════════════════ */

function withCashMirror(game: GameState, econ: EconomyState | null): GameState {
  if (econ === null) return game;
  return Object.freeze({ ...game, cash: econ.cash, ledgerSeq: econ.journal.nextSeq });
}

function mergeObserved(existing: GameState["observed"], store: ObservedStore): ReadonlyMap<ObservedKey, ObservedCell<unknown>> {
  const merged = new Map<ObservedKey, ObservedCell<unknown>>(existing);
  for (const [key, cell] of store.toObservedMap()) merged.set(key, cell);
  return Object.freeze(merged);
}

function openingDraft(amountMicroUsd: bigint): EntryDraft {
  return Object.freeze({
    causeId: asCauseId("unattended:opening-balance"),
    atBusinessMin: 0,
    moneyColour: "gold" as const,
    delta: Object.freeze({ free: asMoney(amountMicroUsd) }),
    context: "unattended opening balance",
  });
}

function opexLedgerDraft(draft: UnattendedOpexDraft, minute: SimMinute, clocks: ClockState): EntryDraft {
  return Object.freeze({
    causeId: asCauseId(`unattended:opex:${minute}:${draft.memo}`),
    atBusinessMin: Number(clocks.businessUs / MICROS_PER_MIN),
    moneyColour: "red" as const,
    delta: Object.freeze({ free: asMoney(-draft.amountMicroUsd) }),
    context: `unattended opex ${draft.memo}`,
  });
}

/** Landed breaches burn EVERY contract's SLA budget (company-wide reading;
 *  per-contract target attribution is an OD open item — PROVISIONAL).
 *  One landed unit = one sim-minute = 60 s of outage seconds. */
function outageSecondsFromLanded(
  outcomes: readonly { readonly terminal: string | null }[],
  config: RunUnattendedConfig,
): ReadonlyMap<EntityId, bigint> | null {
  if (config.money === undefined || config.money.contracts.length === 0) return null;
  let landedSec = 0n;
  for (const o of outcomes) if (o.terminal === "landed") landedSec += 60n;
  if (landedSec === 0n) return null;
  const map = new Map<EntityId, bigint>();
  for (const contract of config.money.contracts) map.set(contract.id, landedSec);
  return map;
}

function guardRidesMoney(guard: ParsedGuard): boolean {
  if (guard.def.type === "freeCashDepleted" || guard.def.type === "errorBudgetGone") return true;
  return guard.def.type === "threshold" && (guard.def.metric === "cash.free" || guard.def.metric === "errorBudgetSec");
}

/** Rows whose observation lives in the CONTRACT error budgets (not cash):
 *  empty roster ⇒ permanently unavailable (review F3's BUDGET warn scope). */
function guardRidesErrorBudget(guard: ParsedGuard): boolean {
  if (guard.def.type === "errorBudgetGone") return true;
  return guard.def.type === "threshold" && guard.def.metric === "errorBudgetSec";
}

function assembleReport(
  seed: RunSeed,
  totalTicks: number,
  finalGame: GameState,
  cashStart: bigint,
  stop: UnattendedStop | null,
  checkpoints: readonly UnattendedCheckpoint[],
  summary: {
    served: number; blocked: number; falsePositive: number; landed: number;
    ruleFirings: number; intentsExecuted: number; intentsRefused: number;
    notices: Map<EconomyNoticeKind, number>;
  },
  hours: Map<number, HourAcc>,
  warns: Set<string>,
  guards: readonly ParsedGuard[],
  econ: EconomyState | null,
): UnattendedReport {
  const cashEnd: bigint = econ !== null ? econ.cash.free : finalGame.cash.free;
  const sortedNotices = [...summary.notices.entries()].sort((a, b) => compareCodeUnits(a[0], b[0]));
  const buckets: UnattendedHourBucket[] = [];
  for (const hourKey of [...hours.keys()].sort((a, b) => a - b)) {
    buckets.push(closeHour(hours.get(hourKey) as HourAcc));
  }
  return Object.freeze({
    runSeed: seed,
    ticksRun: stop !== null ? stop.atTick : BigInt(totalTicks),
    stop,
    finalDigest: stop !== null ? stop.snapshotDigest : digestState(finalGame),
    perCheckpoint: Object.freeze([...checkpoints]),
    summary: Object.freeze({
      served: summary.served,
      blocked: summary.blocked,
      falsePositive: summary.falsePositive,
      landed: summary.landed,
      ruleFirings: summary.ruleFirings,
      intentsExecuted: summary.intentsExecuted,
      intentsRefused: summary.intentsRefused,
      cashDeltaMicroUsd: cashEnd - cashStart,
      cashStartMicroUsd: cashStart,
      cashEndMicroUsd: cashEnd,
      invoiceEvents: Object.freeze(new Map<EconomyNoticeKind, number>(sortedNotices)),
    }),
    hourlyBuckets: Object.freeze(buckets),
    warns: Object.freeze([...warns].sort(compareCodeUnits)),
    guardsParsed: guards,
  });
}

function resolveTicks(config: RunUnattendedConfig): number {
  const fromTicks = config.ticks !== undefined ? Number(config.ticks) : null;
  const fromMinutes = config.maxSimMinutes ?? null;
  if (fromTicks === null && fromMinutes === null) {
    throw new UnattendedError("TICK_BOUNDS", "runUnattended", "provide ticks or maxSimMinutes");
  }
  if (fromTicks !== null && (!Number.isSafeInteger(fromTicks) || fromTicks < 1)) {
    throw new UnattendedError("TICK_BOUNDS", "runUnattended.ticks", `needs a safe integer ≥ 1, got ${String(config.ticks)}`);
  }
  if (fromMinutes !== null && (!Number.isSafeInteger(fromMinutes) || fromMinutes < 1)) {
    throw new UnattendedError("TICK_BOUNDS", "runUnattended.maxSimMinutes", `needs a safe integer ≥ 1, got ${String(fromMinutes)}`);
  }
  if (fromTicks !== null && fromMinutes !== null) return Math.min(fromTicks, fromMinutes);
  return (fromTicks ?? fromMinutes) as number;
}

function resolveCheckpointEvery(raw: number | undefined): number {
  const every = raw ?? DEFAULT_CHECKPOINT_EVERY;
  if (!Number.isSafeInteger(every) || every < 1) {
    throw new UnattendedError("CHECKPOINT_CADENCE", "runUnattended.checkpointEvery", `needs a safe integer ≥ 1, got ${String(raw)}`);
  }
  return every;
}

/** Surge window factory for whatIf (module-internal surface — not barrel). */
export function makeSurgeWindow(multiplier: Fixed, fromMinute: SimMinute, minutes: SimMinute): SurgeWindow {
  return makeSurge(multiplier, fromMinute, minutes);
}

/** whatIf's entry: the SAME runner law with a baseline-surge window
 *  attached. Module-internal surface (not barrel-exported) — the public
 *  weekend entry is runUnattended. */
export function runUnattendedWithSurge(config: RunUnattendedConfig, surge: SurgeWindow | null): UnattendedReport {
  return runUnattendedInner(config, surge);
}

export type { SurgeWindow };
