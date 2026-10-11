/** runScenario — the §1.5 mission runner (composition, not duplication).
 *
 *  Assembles the EXISTING engine the way the unattended lane proves it
 *  should be assembled — mint helpers from unattended, driver from
 *  pipeline, the money lane from economy — then wraps the loop in the one
 *  thing a weekend does not have: OBJECTIVE CHECKING. A scenario ends the
 *  moment its lose conditions bite, the moment every win condition holds,
 *  or when its declared clock runs out.
 *
 *  Laws this file lives by:
 *  - PURE AT THE BOUNDARY: driver, rule-phase closure, economy state and
 *    every counter are minted inside the call. Same (doc, seed, config)
 *    ⇒ byte-identical ScenarioReport (pinned ×100 in the test suite).
 *  - OUTPUT-SIDE ONLY: GameState is never widened for scenarios. The
 *    report is a fold over TickResults + EconomyTickOuts; endDigest is
 *    the house digestState of the tick-final state.
 *  - TERMINAL ORDER: guard trigger → lose predicate → win predicate, all
 *    evaluated at tick boundaries (never mid-tick, the unattended law).
 *    A lose that lands on the same tick as a full win set is a LOSE —
 *    the mission's failure conditions outrank its success conditions by
 *    authoring contract.
 *  - REFUSAL HONESTY: the ledger's negative-bucket throws (F4) and the
 *    opex bounces (F5) are forwarded as the float-death witness stream
 *    exactly as fastForward does; the regexes are pinned against the
 *    unattended source by test so the mirrored law can never drift quiet.
 */

import type {
  BoardEdgeRecord,
  ClockState,
  Contract,
  DependencyEdge,
  EntityId,
  Fixed,
  GameState,
  NodeRecord,
  RunSeed,
  SimEvent,
  SimMinute,
  SimTick,
  WaveEnvelope,
} from "../types.ts";
import { asCauseId, asEntityId, asMoney } from "../types.ts";
import { FIXED_ONE, FIXED_ZERO, compare, fromInt, fromRatio } from "../kernel/fixed.ts";
import { MICROS_PER_MIN } from "../kernel/time.ts";
import { streamFor } from "../kernel/rng.ts";
import { createDefaultSlots, createTickDriver, digestState } from "../pipeline/index.ts";
import type { DefaultPipelineConfig } from "../pipeline/index.ts";
import { createRulePhaseStep } from "../policy/index.ts";
import type {
  CompanyDeathCause,
  EconomyConfig,
  RevenueColourTags,
  EconomyNoticeKind,
  EconomyState,
  EntryDraft,
  RegisterContractInput,
  RefusedSettlement,
} from "../economy/index.ts";
import {
  COMPANY_DEATH_CAUSES,
  defaultEconomyConfig,
  emptyEconomyState,
  postEntry,
  registerContractsEconomy,
  runEconomyTick,
} from "../economy/index.ts";
import {
  GUARD_TRAILING_WINDOW_MIN,
  NODE_DEGRADED_RHO_GTE,
  UNATTENDED_AGGRESSION,
  UNATTENDED_CLASSES,
  UNATTENDED_EXPRESS_MAX_CONFIDENCE,
  UNATTENDED_RETRY,
  budgetMinRemainingSec,
  buildPipelineConfig,
  evaluateGuardrail,
  mintBoardEdges,
  mintInitialState,
  mintNodeRecords,
} from "../unattended/index.ts";
import type {
  GuardEvaluation,
  GuardMetric,
  GuardrailSample,
  ParsedGuard,
  RunUnattendedConfig,
  UnattendedOpexDraft,
} from "../unattended/index.ts";
import type { ObjectivePredicate, ScenarioDoc } from "./doc.ts";
import { scenarioSeed } from "./doc.ts";
import type { ObjectiveProgress, ScenarioObservation } from "./objectives.ts";
import { objectiveHolds, objectiveLine, progressAll } from "./objectives.ts";

/** The three honest endings of a mission. */
export const SCENARIO_OUTCOMES = Object.freeze(["won", "lost", "timeout"] as const);
export type ScenarioOutcome = (typeof SCENARIO_OUTCOMES)[number];

/** Caller-side run knobs. `tickCap` exists for cheap probe arms (win/lose
 *  tests re-run the SAME doc with less patience); it can only shorten the
 *  doc's declared clock, never extend it. */
export interface ScenarioRunConfig {
  /** Added to the base seed (deterministic seed policy, author-visible). */
  readonly seedOffset?: number;
  /** Hard shorten of limits.maxSimMinutes (≥ 1). */
  readonly tickCap?: number;
}

/** Cumulative trace census — the report's "what happened" roll-up. */
export interface ScenarioTrace {
  readonly arrivals: number;
  readonly served: number;
  readonly bounced: number;
  readonly landed: number;
  readonly falsePositives: number;
  /** Successful economy folds (a voided F4 tick does NOT count). */
  readonly economyRounds: number;
  /** F4 voids + F5 opex bounces combined — the refusal census. */
  readonly economyRefusals: number;
  /** SimEvent kind → count, keys sorted by code-unit. */
  readonly eventsByKind: Readonly<Record<string, number>>;
  /** EconomyNotice kind → count, keys sorted by code-unit. */
  readonly noticesByKind: Readonly<Record<string, number>>;
}

/** The mission verdict record. Frozen; embeds bigints (hosts serialize
 *  with the house canonical codec, same as UnattendedReport). */
export interface ScenarioReport {
  readonly scenarioId: string;
  readonly runSeed: RunSeed;
  readonly outcome: ScenarioOutcome;
  /** `win@240` / `lose:<predicate-line>@<minute>` /
   *  `guard:<reason>@<minute>` / `timeout@<minute>`. */
  readonly stopReason: string;
  readonly endTick: SimTick;
  readonly endMinute: SimMinute;
  /** digestState of the tick-final state at the stop boundary. */
  readonly endDigest: string;
  readonly observation: ScenarioObservation;
  readonly objectives: {
    readonly win: readonly ObjectiveProgress[];
    readonly lose: readonly ObjectiveProgress[];
  };
  readonly trace: ScenarioTrace;
  readonly cashStartMicroUsd: bigint;
  readonly cashEndMicroUsd: bigint;
}

/* Ledger-refusal + death-witness mirrors of the unattended lane, pinned to
   fastForward.ts's private constants by the scenario-laws source-scan test. */
const NEGATIVE_BUCKET_LAW = /would go negative/;
const SETTLE_REFUSAL_SHAPE = /settle (\S+): -(\d+) µ\$ on '/;
const DISSOLVED_CAUSE_SHAPE = /economy:death:dissolved:([a-z-]+):/;

const DEFAULT_REVENUE_TAGS: RevenueColourTags = Object.freeze({
  margin: "blue",
  churnRisk: "blue",
  term: "blue",
  concentration: "blue",
  abuse: "blue",
} as const);

/** The engine stamp inside every scenario-minted state (digest-visible). */
export const SCENARIO_ENGINE_VERSION = "scenario-v0" as const;
const SCENARIO_RULE_BOOK_HASH = "scenario-empty-v0" as const;

function openingDraft(amountMicroUsd: bigint): EntryDraft {
  return Object.freeze({
    causeId: asCauseId("scenario:opening-balance"),
    atBusinessMin: 0,
    moneyColour: "gold" as const,
    delta: Object.freeze({ free: asMoney(amountMicroUsd) }),
    context: "scenario opening balance",
  });
}

function opexLedgerDraft(draft: UnattendedOpexDraft, minute: SimMinute, clocks: ClockState): EntryDraft {
  return Object.freeze({
    causeId: asCauseId(`scenario:opex:${minute}:${draft.memo}`),
    atBusinessMin: Number(clocks.businessUs / MICROS_PER_MIN),
    moneyColour: "red" as const,
    delta: Object.freeze({ free: asMoney(-draft.amountMicroUsd) }),
    context: `scenario opex ${draft.memo}`,
  });
}

function opexWitness(draft: UnattendedOpexDraft): RefusedSettlement {
  return Object.freeze({
    contractId: asEntityId(`scenario:opex:${draft.memo}`),
    amountMicroUsd: asMoney(draft.amountMicroUsd),
  });
}

function invoiceRefusalWitness(message: string): RefusedSettlement {
  const shape = SETTLE_REFUSAL_SHAPE.exec(message);
  if (shape === null) {
    return Object.freeze({ contractId: asEntityId("ledger:unattributed"), amountMicroUsd: asMoney(0n) });
  }
  return Object.freeze({
    contractId: asEntityId(shape[1] as string),
    amountMicroUsd: asMoney(BigInt(shape[2] as string)),
  });
}

function parseDeathCause(causeId: string): CompanyDeathCause | null {
  const shape = DISSOLVED_CAUSE_SHAPE.exec(causeId);
  if (shape === null) return null;
  const cause = shape[1] as string;
  return (COMPANY_DEATH_CAUSES as readonly string[]).includes(cause) ? (cause as CompanyDeathCause) : null;
}

/** The traffic envelope for one sim-minute: the piecewise plateau from the
 *  doc, minted the way fastForward mints its baseline (same five fields). */
function envelopesAtMinute(doc: ScenarioDoc, minute: SimMinute): readonly WaveEnvelope[] {
  const segments = doc.traffic.segments;
  let rate = segments[0]!.ratePerMin;
  for (const segment of segments) {
    if (segment.fromMinute <= minute) rate = segment.ratePerMin;
  }
  if (rate === 0) return Object.freeze([]);
  return Object.freeze([
    Object.freeze({
      tableId: doc.traffic.tableId,
      role: "baseline" as const,
      shape: "plateau" as const,
      ratePerMin: fromInt(rate),
      telegraphed: true,
      dominantFamily: "organic" as const,
    }),
  ]);
}

/** Same shape as fastForward's private dependencyEdgesFor, minus the
 *  deepPath chain (scenarios route express-only until the maze seam). */
function dependencyEdgesFor(nodes: readonly NodeRecord[]): readonly DependencyEdge[] {
  const out: DependencyEdge[] = [];
  for (const node of nodes) {
    if (node.dependencyNodeId === null) continue;
    out.push(
      Object.freeze({
        upstreamNodeId: node.dependencyNodeId,
        downstreamNodeId: node.id,
        correlation: "software" as const,
      }),
    );
  }
  return Object.freeze(out);
}

interface TickFacts {
  readonly minute: SimMinute;
  readonly arrivals: number;
  readonly served: number;
  readonly bounced: number;
  readonly landed: number;
  readonly falsePositive: number;
  readonly ruleFirings: number;
  readonly cashFreeMicroUsd: bigint;
  readonly economyAvailable: boolean;
  readonly errorBudgetMinSec: bigint | null;
  readonly degradedNodes: number;
  readonly nodeCount: number;
}

interface TickResultLike {
  readonly outcomes: readonly { readonly terminal: string | null }[];
  readonly events: readonly SimEvent[];
  readonly ruleFirings: readonly unknown[];
}

function collectFacts(game: GameState, result: TickResultLike, econ: EconomyState | null): TickFacts {
  let served = 0;
  let bounced = 0;
  let landed = 0;
  let falsePositive = 0;
  for (const o of result.outcomes) {
    if (o.terminal === "served") served += 1;
    else if (o.terminal === "bounced") bounced += 1;
    else if (o.terminal === "landed") landed += 1;
    else if (o.terminal === "blocked-false-positive") falsePositive += 1;
  }
  let arrivals = 0;
  for (const e of result.events) if (e.kind === "arrival") arrivals += 1;
  let degraded = 0;
  const nodeCount = game.nodes.size;
  for (const node of game.nodes.values()) {
    if (compare(node.utilizationRho, NODE_DEGRADED_RHO_GTE) >= 0) degraded += 1;
  }
  return Object.freeze({
    minute: game.context.minute,
    arrivals,
    served,
    bounced,
    landed,
    falsePositive,
    ruleFirings: result.ruleFirings.length,
    cashFreeMicroUsd: econ !== null ? econ.cash.free : game.cash.free,
    economyAvailable: econ !== null,
    errorBudgetMinSec: econ !== null && econ.errorBudgets.size > 0 ? budgetMinRemainingSec(econ) : null,
    degradedNodes: degraded,
    nodeCount,
  });
}

/* ── guardrail sampling: the closed unattended vocabulary, fed from THIS
   loop's facts (buildSample mirror of fastForward, pinned by test) ── */

function trailingRate(window: readonly TickFacts[], pick: (f: TickFacts) => number): Fixed {
  if (window.length === 0) return FIXED_ZERO;
  let total = 0n;
  for (const f of window) total += BigInt(pick(f));
  return fromRatio(total, BigInt(window.length));
}

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
  let windowArrivals = 0;
  for (const f of window) windowArrivals += f.arrivals;
  return Object.freeze({
    tick,
    minute: facts.minute,
    clocks,
    businessMinute: Number(clocks.businessUs / MICROS_PER_MIN),
    metrics,
    economyAvailable: facts.economyAvailable,
    errorBudgetAvailable: facts.errorBudgetMinSec !== null,
    windowArrivals,
    refusedBurns,
  });
}

function withCashMirror(game: GameState, econ: EconomyState | null): GameState {
  if (econ === null) return game;
  return Object.freeze({ ...game, cash: econ.cash, ledgerSeq: econ.journal.nextSeq });
}

function sortedCensus(counts: Map<string, number>): Readonly<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const key of [...counts.keys()].sort()) out[key] = counts.get(key)!;
  return Object.freeze(out);
}

/** List-order winner: first guard triggered on the stop tick. */
function firstTriggered(evaluations: readonly (GuardEvaluation | null)[], guards: readonly ParsedGuard[]): string | null {
  for (let i = 0; i < evaluations.length; i++) {
    const evaluation = evaluations[i];
    if (evaluation != null && evaluation.verdict === "triggered") return guards[i]!.reason;
  }
  return null;
}

/** Everything the report counts, folded per tick from notices + outcomes. */
interface Accumulator {
  settledInvoices: number;
  churnedCustomers: number;
  writtenOffCustomers: number;
  bounces: number;
  served: number;
  landed: number;
  falsePositives: number;
  arrivals: number;
  deaths: CompanyDeathCause[];
}

function foldNoticeCensus(
  notices: readonly { readonly kind: EconomyNoticeKind; readonly causeId: string }[],
  acc: Accumulator,
  noticesByKind: Map<string, number>,
): void {
  for (const notice of notices) {
    noticesByKind.set(notice.kind, (noticesByKind.get(notice.kind) ?? 0) + 1);
    if (notice.kind === "invoice-paid") acc.settledInvoices += 1;
    else if (notice.kind === "churned-voluntary" || notice.kind === "cliff-lapsed") acc.churnedCustomers += 1;
    else if (notice.kind === "written-off") acc.writtenOffCustomers += 1;
    else if (notice.kind === "company-dissolved") {
      const cause = parseDeathCause(notice.causeId);
      if (cause !== null && !acc.deaths.includes(cause)) acc.deaths.push(cause);
    }
  }
}

function snapshotObservation(facts: TickFacts, elapsedMin: number, acc: Accumulator): ScenarioObservation {
  return Object.freeze({
    elapsedMin,
    cashFreeMicroUsd: facts.cashFreeMicroUsd,
    settledInvoices: acc.settledInvoices,
    churnedCustomers: acc.churnedCustomers,
    writtenOffCustomers: acc.writtenOffCustomers,
    bounces: acc.bounces,
    deaths: Object.freeze([...acc.deaths]),
  });
}

function anyHolds(obs: ScenarioObservation, predicates: readonly ObjectivePredicate[]): ObjectivePredicate | null {
  for (const predicate of predicates) if (objectiveHolds(obs, predicate)) return predicate;
  return null;
}

function allHold(obs: ScenarioObservation, predicates: readonly ObjectivePredicate[]): boolean {
  for (const predicate of predicates) {
    if (!objectiveHolds(obs, predicate)) return false;
  }
  return true;
}

/** Run one authored mission. Deterministic by construction: every random
 *  draw rides streamFor(seed, …) from the doc's engine, every mutable is
 *  minted inside, and the report is a pure fold of the run. */
export function runScenario(doc: ScenarioDoc, seed: RunSeed, config: ScenarioRunConfig = {}): ScenarioReport {
  const offset = config.seedOffset ?? 0;
  if (offset < 0 || !Number.isSafeInteger(offset)) {
    throw new Error(`scenario[BAD_INT] at 'runScenario.seedOffset': expected a safe integer ≥ 0, got ${String(offset)}`);
  }
  const cap = config.tickCap ?? doc.limits.maxSimMinutes;
  if (cap < 1 || !Number.isSafeInteger(cap)) {
    throw new Error(`scenario[BAD_INT] at 'runScenario.tickCap': expected a safe integer ≥ 1, got ${String(cap)}`);
  }
  const runSeed = scenarioSeed(seed, offset);
  const totalTicks = Math.min(cap, doc.limits.maxSimMinutes);

  /* ── mint the world (the unattended assembly, from doc data) ── */
  const uaConfig: RunUnattendedConfig = Object.freeze({
    runSeed,
    board: doc.board,
    ruleBook: Object.freeze([]),
    ruleBookHash: SCENARIO_RULE_BOOK_HASH,
    guards: Object.freeze([]),
    handCapacity: doc.limits.handCapacity,
    engineVersion: SCENARIO_ENGINE_VERSION,
  });
  const nodes = mintNodeRecords(doc.board.nodes);
  const edges: readonly BoardEdgeRecord[] = mintBoardEdges(doc.board.edges);
  const pipelineConfig: DefaultPipelineConfig = buildPipelineConfig(uaConfig, nodes);
  const dependencyEdges = dependencyEdgesFor(nodes);
  const rulePhase = createRulePhaseStep();
  const slots = Object.freeze({ ...createDefaultSlots(pipelineConfig), rulePhase: rulePhase.step });
  const game0 = mintInitialState(uaConfig, nodes, edges);
  const driver = createTickDriver(slots, streamFor(runSeed, "root", 0), game0.context.clocks);

  /* ── money lane (the roster registers ONCE through the batch API) ── */
  const ecoCfg: EconomyConfig = defaultEconomyConfig();
  let econ: EconomyState | null = null;
  const contractsBook = new Map<EntityId, Contract>();
  const moneyOn = doc.contracts.length > 0 || doc.limits.opex.length > 0 || doc.limits.initialFreeMicroUsd !== 0n;
  if (moneyOn) {
    econ = emptyEconomyState();
    if (doc.limits.initialFreeMicroUsd !== 0n) {
      const posted = postEntry(econ.journal, econ.cash, openingDraft(doc.limits.initialFreeMicroUsd));
      econ = Object.freeze({ ...econ, journal: posted.journal, cash: posted.cash });
    }
    if (doc.contracts.length > 0) {
      const inputs: readonly RegisterContractInput[] = Object.freeze(
        doc.contracts.map((spec) =>
          Object.freeze({
            contract: spec.contract,
            atBusinessMin: spec.contract.termStartMin,
            clauseRefs: Object.freeze(["auto-renew"]) as readonly string[],
            grandfather: null,
            revenueTags: DEFAULT_REVENUE_TAGS,
            commitmentBps: spec.commitmentBps,
          }),
        ),
      );
      econ = registerContractsEconomy(econ, inputs, ecoCfg);
      for (const spec of doc.contracts) contractsBook.set(spec.contract.id, spec.contract);
    }
  }
  const opexByMinute = new Map<SimMinute, readonly UnattendedOpexDraft[]>();
  for (const draft of doc.limits.opex) {
    const prior = opexByMinute.get(draft.atMinute) ?? [];
    opexByMinute.set(draft.atMinute, Object.freeze([...prior, draft]));
  }

  /* ── accumulators ── */
  const acc: Accumulator = {
    settledInvoices: 0,
    churnedCustomers: 0,
    writtenOffCustomers: 0,
    bounces: 0,
    served: 0,
    landed: 0,
    falsePositives: 0,
    arrivals: 0,
    deaths: [],
  };
  const eventsByKind = new Map<string, number>();
  const noticesByKind = new Map<string, number>();
  const sustainRuns = new Map<string, number>();
  const window: TickFacts[] = [];
  const refusalWitness: RefusedSettlement[] = [];
  let economyRounds = 0;
  let economyRefusals = 0;
  let outcome: ScenarioOutcome = "timeout";
  let stopReason = "";
  let game = withCashMirror(game0, econ);
  const cashStart = game.cash.free;
  const mintFacts: TickFacts = Object.freeze({
    minute: game.context.minute,
    arrivals: 0,
    served: 0,
    bounced: 0,
    landed: 0,
    falsePositive: 0,
    ruleFirings: 0,
    cashFreeMicroUsd: cashStart,
    economyAvailable: econ !== null,
    errorBudgetMinSec: null,
    degradedNodes: 0,
    nodeCount: game.nodes.size,
  });
  let lastObs = snapshotObservation(mintFacts, 0, acc);

  for (let t = 1; t <= totalTicks; t++) {
    const minute = game.context.minute + 1;
    const result = driver.advance(
      game,
      Object.freeze({
        envelopes: envelopesAtMinute(doc, minute),
        evidence: Object.freeze([]),
        classes: UNATTENDED_CLASSES,
        dependencyEdges,
        retryPolicy: UNATTENDED_RETRY,
        aggression: UNATTENDED_AGGRESSION,
        expressMaxConfidence: UNATTENDED_EXPRESS_MAX_CONFIDENCE,
      }),
    );
    game = result.state;

    for (const e of result.events) eventsByKind.set(e.kind, (eventsByKind.get(e.kind) ?? 0) + 1);

    /* money lane: opex → economy fold → refusal witnesses (the F4/F5 law,
       mirrored from fastForward; a voided fold keeps its witness pending). */
    let refusedBurnsThisTick = 0;
    if (econ !== null) {
      for (const draft of opexByMinute.get(minute) ?? []) {
        if (econ.cash.free < draft.amountMicroUsd) {
          economyRefusals += 1;
          refusedBurnsThisTick += 1;
          refusalWitness.push(opexWitness(draft));
          continue;
        }
        const posted = postEntry(econ.journal, econ.cash, opexLedgerDraft(draft, minute, game.context.clocks));
        econ = Object.freeze({ ...econ, journal: posted.journal, cash: posted.cash });
      }
      let landedSec = 0n;
      for (const o of result.outcomes) if (o.terminal === "landed") landedSec += 60n;
      let outage: ReadonlyMap<EntityId, bigint> | null = null;
      if (landedSec !== 0n && contractsBook.size > 0) {
        const map = new Map<EntityId, bigint>();
        for (const id of contractsBook.keys()) map.set(id, landedSec);
        outage = map;
      }
      try {
        const out = runEconomyTick(
          Object.freeze({
            context: game.context,
            runSeed,
            contracts: contractsBook,
            prior: econ,
            cfg: ecoCfg,
            dunningEngineOwned: doc.limits.dunningEngineOwned,
            ...(outage !== null ? { outageSecs: outage } : {}),
            ...(refusalWitness.length > 0 ? { refusedSettlements: Object.freeze([...refusalWitness]) } : {}),
          }),
        );
        econ = out.state;
        refusalWitness.length = 0;
        economyRounds += 1;
        foldNoticeCensus(out.notices, acc, noticesByKind);
      } catch (err) {
        if (!(err instanceof RangeError) || !NEGATIVE_BUCKET_LAW.test(err.message)) throw err;
        economyRefusals += 1;
        refusedBurnsThisTick += 1;
        refusalWitness.push(invoiceRefusalWitness(err.message));
      }
      game = withCashMirror(game, econ);
    }

    /* tick-final observation (the ONLY thing objectives read). */
    const facts = collectFacts(game, result, econ);
    acc.bounces += facts.bounced;
    acc.served += facts.served;
    acc.landed += facts.landed;
    acc.falsePositives += facts.falsePositive;
    acc.arrivals += facts.arrivals;
    const obs = snapshotObservation(facts, Number(game.context.minute), acc);
    lastObs = obs;

    /* terminal order: guards → lose → win (all at the boundary). */
    window.push(facts);
    if (window.length > GUARD_TRAILING_WINDOW_MIN) window.shift();

    if (doc.limits.guards.length > 0) {
      const sample = buildSample(facts, window, game.context.tick, game.context.clocks, refusedBurnsThisTick);
      const evaluations: (GuardEvaluation | null)[] = doc.limits.guards.map((guard, gi) => {
        const key = `${gi}|${guard.reason}`;
        const stepped = evaluateGuardrail(guard, sample, sustainRuns.get(key) ?? 0);
        sustainRuns.set(key, stepped.nextRun);
        return stepped.evaluation;
      });
      const reason = firstTriggered(evaluations, doc.limits.guards);
      if (reason !== null) {
        outcome = "lost";
        stopReason = `${reason}@${game.context.minute}`;
        break;
      }
    }

    const loseFired = anyHolds(obs, doc.objectives.lose);
    if (loseFired !== null) {
      outcome = "lost";
      stopReason = `lose:${objectiveLine(loseFired)}@${game.context.minute}`;
      break;
    }
    if (allHold(obs, doc.objectives.win)) {
      outcome = "won";
      stopReason = `win@${game.context.minute}`;
      break;
    }
  }

  if (stopReason === "") stopReason = `timeout@${game.context.minute}`;
  const finalObs = lastObs;

  return Object.freeze({
    scenarioId: doc.id,
    runSeed,
    outcome,
    stopReason,
    endTick: game.context.tick,
    endMinute: game.context.minute,
    endDigest: digestState(game),
    observation: finalObs,
    objectives: Object.freeze({
      win: progressAll(finalObs, doc.objectives.win),
      lose: progressAll(finalObs, doc.objectives.lose),
    }),
    trace: Object.freeze({
      arrivals: acc.arrivals,
      served: acc.served,
      bounced: acc.bounces,
      landed: acc.landed,
      falsePositives: acc.falsePositives,
      economyRounds,
      economyRefusals,
      eventsByKind: sortedCensus(eventsByKind),
      noticesByKind: sortedCensus(noticesByKind),
    }),
    cashStartMicroUsd: cashStart,
    cashEndMicroUsd: finalObs.cashFreeMicroUsd,
  });
}
