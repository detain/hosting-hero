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
 *    through the SHARED tick fold (`internal/tickFold.ts`, one home with
 *    fastForward — the consolidation closing the scenario-runner gap row;
 *    the single-home source pin retires the old mirrored-regex drift test).
 */

import type {
  BoardEdgeRecord,
  Contract,
  EntityId,
  GameState,
  RunSeed,
  SimMinute,
  SimTick,
  WaveEnvelope,
} from "../types.ts";
import { FIXED_ZERO, fromInt } from "../kernel/fixed.ts";
import { streamFor } from "../kernel/rng.ts";
import { resolveCorpusWindows } from "./corpus.ts";
import type { CorpusAuthority, CorpusWaveWindow } from "./corpus.ts";
import { createDefaultSlots, createTickDriver, digestState } from "../pipeline/index.ts";
import type { DefaultPipelineConfig } from "../pipeline/index.ts";
import { createRulePhaseStep } from "../policy/index.ts";
import type {
  CompanyDeathCause,
  EconomyConfig,
  EconomyNoticeKind,
  EconomyState,
  RegisterContractInput,
  RefusedSettlement,
} from "../economy/index.ts";
import {
  COMPANY_DEATH_CAUSES,
  defaultEconomyConfig,
  emptyEconomyState,
  postEntry,
  registerContractsEconomy,
} from "../economy/index.ts";
import {
  UNATTENDED_AGGRESSION,
  UNATTENDED_CLASSES,
  UNATTENDED_EXPRESS_MAX_CONFIDENCE,
  UNATTENDED_RETRY,
  buildPipelineConfig,
  evaluateGuardrail,
  mintBoardEdges,
  mintInitialState,
  mintNodeRecords,
} from "../unattended/index.ts";
import type {
  GuardEvaluation,
  ParsedGuard,
  RunUnattendedConfig,
  UnattendedOpexDraft,
} from "../unattended/index.ts";
import {
  DEFAULT_REVENUE_TAGS,
  GUARD_TRAILING_WINDOW_MIN,
  buildSample,
  collectFacts,
  dependencyEdgesFor,
  foldMoneyLaneTick,
  openingDraftFor,
  withCashMirror,
  type TickFacts,
} from "../internal/tickFold.ts";
import type { ObjectivePredicate, ScenarioDoc } from "./doc.ts";
import { ScenarioError, scenarioSeed } from "./doc.ts";
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
  /** Required when traffic.profile === "corpus": the shipped wave-table
   *  slices + registry meta the citation resolves against (see corpus.ts
   *  — the browser-safe seam; sim-core never reads fs). */
  readonly corpus?: CorpusAuthority;
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

/* The F4/F5 refusal law (negative-bucket regex, settle-shape parse, opex
   and opening drafts, the notary mirror, facts + guardrail sampling) lives
   in ONE home: internal/tickFold.ts — imported above. What stays HERE is
   scenario-report policy only: the dissolved-cause parse below. */
const DISSOLVED_CAUSE_SHAPE = /economy:death:dissolved:([a-z-]+):/;

/** The engine stamp inside every scenario-minted state (digest-visible). */
export const SCENARIO_ENGINE_VERSION = "scenario-v0" as const;
const SCENARIO_RULE_BOOK_HASH = "scenario-empty-v0" as const;

function parseDeathCause(causeId: string): CompanyDeathCause | null {
  const shape = DISSOLVED_CAUSE_SHAPE.exec(causeId);
  if (shape === null) return null;
  const cause = shape[1] as string;
  return (COMPANY_DEATH_CAUSES as readonly string[]).includes(cause) ? (cause as CompanyDeathCause) : null;
}

const EMPTY_WINDOWS: readonly CorpusWaveWindow[] = Object.freeze([]);

function requireCorpusAuthority(tableId: string, authority: CorpusAuthority | undefined): CorpusAuthority {
  if (authority === undefined) {
    throw new ScenarioError(
      "CORPUS_UNRESOLVED",
      "config.corpus",
      `traffic cites corpus table "${tableId}" but no CorpusAuthority was injected — the host must pass config.corpus (slices + threatMeta); sim-core never reads the filesystem`,
    );
  }
  return authority;
}

/** The traffic envelopes for one sim-minute.
 *  - segments profile: the piecewise plateau from the doc, minted the way
 *    fastForward mints its baseline (same five fields). UNMOVED law.
 *  - corpus profile: the shipped-citation windows from resolveCorpusWindows
 *    (active by [start, start+window)) stacked on the scenario's own
 *    baseline trickle (minted like a segments plateau). Both ride the SAME
 *    driver arrival-mint path — the seam adds data, not machinery. */
function envelopesAtMinute(
  doc: ScenarioDoc,
  minute: SimMinute,
  corpusWindows: readonly CorpusWaveWindow[],
): readonly WaveEnvelope[] {
  if (doc.traffic.profile === "corpus") {
    const active: WaveEnvelope[] = [];
    for (const w of corpusWindows) {
      if (minute >= w.startMinute && minute < w.startMinute + w.windowMinutes) active.push(w.envelope);
    }
    if (doc.traffic.baselineRatePerMin > 0) {
      active.push(baselineEnvelope(doc.traffic.tableId, doc.traffic.baselineRatePerMin));
    }
    return Object.freeze(active);
  }
  const segments = doc.traffic.segments;
  let rate = segments[0]!.ratePerMin;
  for (const segment of segments) {
    if (segment.fromMinute <= minute) rate = segment.ratePerMin;
  }
  if (rate === 0) return Object.freeze([]);
  return Object.freeze([baselineEnvelope(doc.traffic.tableId, rate)]);
}

function baselineEnvelope(tableId: string, ratePerMin: number): WaveEnvelope {
  return Object.freeze({
    tableId,
    role: "baseline" as const,
    shape: "plateau" as const,
    ratePerMin: fromInt(ratePerMin),
    telegraphed: true,
    dominantFamily: "organic" as const,
  });
}

/* dependencyEdgesFor / TickFacts / collectFacts / buildSample /
   withCashMirror all live in internal/tickFold.ts (imported above) — the
   scenario lane reads the express board with no deepPath chain, so it
   calls the shared home with one argument. */

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
  /* Corpus citations resolve through the shipped waves pipeline against
     the host-injected slices, on THIS run's seed (the same (seed, waveN,
     cursor) dice fastForward rolls). Fail-loud if the wire cites without
     supplying the authority. */
  const corpusWindows =
    doc.traffic.profile === "corpus"
      ? resolveCorpusWindows(doc.traffic, runSeed, requireCorpusAuthority(doc.traffic.tableId, config.corpus))
      : EMPTY_WINDOWS;

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
      const posted = postEntry(econ.journal, econ.cash, openingDraftFor("scenario", doc.limits.initialFreeMicroUsd));
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
    intentsExecuted: 0,
    intentsRefused: 0,
    cashFreeMicroUsd: cashStart,
    economyAvailable: econ !== null,
    errorBudgetMinSec: null,
    meanRho: FIXED_ZERO,
    degradedNodes: 0,
    nodeCount: game.nodes.size,
  });
  let lastObs = snapshotObservation(mintFacts, 0, acc);

  for (let t = 1; t <= totalTicks; t++) {
    const minute = game.context.minute + 1;
    const result = driver.advance(
      game,
      Object.freeze({
        envelopes: envelopesAtMinute(doc, minute, corpusWindows),
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

    /* money lane: the shared tick fold (internal/tickFold.ts, one home
       with fastForward) runs opex → economy fold → refusal witnesses with
       topic "scenario" — the `scenario:opex:<minute>:<memo>` cause ids the
       shipped missions digest are minted verbatim there. The mission lane
       keeps its own census + mirror policy: `economyRounds` counts ONLY
       successful folds, and the cash mirror rides UNCONDITIONALLY (every
       host that reaches this block mirrors — the pinned divergence from
       fastForward's mirror-only-on-success law, see the fold docblock). */
    let refusedBurnsThisTick = 0;
    if (econ !== null) {
      const lane = foldMoneyLaneTick({
        game,
        econ,
        minute,
        runSeed,
        cfg: ecoCfg,
        contracts: contractsBook,
        opexDrafts: opexByMinute.get(minute) ?? [],
        topic: "scenario",
        dunningEngineOwned: doc.limits.dunningEngineOwned,
        witness: refusalWitness,
        outcomes: result.outcomes,
      });
      econ = lane.econ;
      refusedBurnsThisTick = lane.refusedBurnsThisTick;
      economyRefusals += lane.opexBounces + (lane.invoiceVoided ? 1 : 0);
      const out = lane.fold;
      if (out !== null) {
        economyRounds += 1;
        foldNoticeCensus(out.notices, acc, noticesByKind);
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
