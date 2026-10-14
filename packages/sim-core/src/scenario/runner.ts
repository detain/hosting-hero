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
  AttentionState,
  BoardEdgeRecord,
  CauseId,
  Contract,
  EntityId,
  ExternalIntent,
  GameState,
  PlayerIntent,
  PlayerVerbArgs,
  RunSeed,
  SimMinute,
  SimTick,
  WaveEnvelope,
} from "../types.ts";
import { asCauseId, asMoney } from "../types.ts";
import { FIXED_ZERO, fromInt, fromRatio } from "../kernel/fixed.ts";
import { MICROS_PER_MIN } from "../kernel/time.ts";
import { streamFor } from "../kernel/rng.ts";
import { resolveCorpusWindows } from "./corpus.ts";
import type { CorpusAuthority, CorpusWaveWindow } from "./corpus.ts";
import {
  attentionWindowEntry,
  createAttentionState,
  createDefaultSlots,
  createTickDriver,
  digestState,
  replenishAtBusinessMonth,
} from "../pipeline/index.ts";
import type {
  AdjustPriceQuery,
  DefaultPipelineConfig,
  IntentDoorConfig,
  PlaceDeviceQuery,
} from "../pipeline/index.ts";
import { createRulePhaseStep } from "../policy/index.ts";
import type {
  CompanyDeathCause,
  EconomyConfig,
  EconomyNoticeKind,
  EconomyState,
  PostMortemFiling,
  RefusedSettlement,
  RegisterContractInput,
  ReputationSignal,
} from "../economy/index.ts";
import {
  applyReputationSignals,
  COMPANY_DEATH_CAUSES,
  defaultEconomyConfig,
  emptyEconomyState,
  foldPostMortemFilings,
  postEntry,
  postMortemNoticeCauseId,
  postMortemReputationSignals,
  registerContractsEconomy,
  REPUTATION_INITIAL_BPS,
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
import type { ObjectivePredicate, ScenarioDoc, ScenarioIntent, ScenarioSignals } from "./doc.ts";
import { ScenarioError, scenarioIncidentCause, scenarioSeed, scenarioSignalsActive } from "./doc.ts";
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
  let family: WaveEnvelope["dominantFamily"] = segments[0]!.family ?? "organic";
  for (const segment of segments) {
    if (segment.fromMinute <= minute) {
      rate = segment.ratePerMin;
      family = segment.family ?? "organic";
    }
  }
  if (rate === 0) return Object.freeze([]);
  return Object.freeze([baselineEnvelope(doc.traffic.tableId, rate, family)]);
}

function baselineEnvelope(
  tableId: string,
  ratePerMin: number,
  family: WaveEnvelope["dominantFamily"] = "organic",
): WaveEnvelope {
  return Object.freeze({
    tableId,
    role: "baseline" as const,
    shape: "plateau" as const,
    ratePerMin: fromInt(ratePerMin),
    telegraphed: true,
    dominantFamily: family,
  });
}

/** Ladder rung 3: attribute one minted arrival to the family label of the
 *  envelope that minted it. The default arrival step stamps every event
 *  `arrival:<tableId>:<tick>:<envelopeIndex>`; the familyMix die is never
 *  configured on the scenario lane (buildPipelineConfig ships no family
 *  table), so the envelope's dominantFamily IS the minted unit's family —
 *  exact, not approximate. Cohort-bonus mints share their envelope index,
 *  so herded visitors are labeled diegetically too. */
function countArrivalFamily(
  causeId: string,
  envelopes: readonly WaveEnvelope[],
  sink: Map<string, number>,
): void {
  const tail = causeId.slice(causeId.lastIndexOf(":") + 1);
  const index = Number(tail);
  const envelope = Number.isInteger(index) && index >= 0 ? envelopes[index] : undefined;
  if (envelope === undefined) {
    throw new Error(
      `scenario[BAD_STATE] at 'runScenario': arrival event "${causeId}" names envelope ${tail} but this minute minted ${String(envelopes.length)} envelopes`,
    );
  }
  sink.set(envelope.dominantFamily, (sink.get(envelope.dominantFamily) ?? 0) + 1);
}

/** Ladder rung 2: the windows THIS doc cites (win + lose lists, deduped by
 *  the shared key grammar). The runner pre-computes exactly these — the
 *  observation carries no uncited comparison the objectives never asked
 *  for (parse-don't-validate: the predicate list is the query). */
interface CitedWindow {
  readonly key: string;
  readonly metric: "arrivals" | "served" | "bounced" | "invoices-settled";
  readonly windowMinutes: number;
}

function collectCitedWindows(doc: ScenarioDoc): readonly CitedWindow[] {
  const byKey = new Map<string, CitedWindow>();
  for (const predicate of [...doc.objectives.win, ...doc.objectives.lose]) {
    if (predicate.kind !== "metric-delta-over-window") continue;
    const key = `${predicate.metric}:${predicate.windowMinutes}`;
    if (!byKey.has(key)) {
      byKey.set(key, { key, metric: predicate.metric, windowMinutes: predicate.windowMinutes });
    }
  }
  return Object.freeze([...byKey.values()]);
}

/** One minute of service truth, recorded for the window comparisons. */
interface MinuteRow {
  readonly arrivals: number;
  readonly served: number;
  readonly bounced: number;
  readonly settled: number;
}

function minuteValue(row: MinuteRow, metric: CitedWindow["metric"]): number {
  switch (metric) {
    case "arrivals":
      return row.arrivals;
    case "served":
      return row.served;
    case "bounced":
      return row.bounced;
    case "invoices-settled":
      return row.settled;
  }
}

function sumWindow(ledger: readonly MinuteRow[], metric: CitedWindow["metric"], from: number, to: number): number {
  let total = 0;
  for (let i = Math.max(0, from); i < Math.min(ledger.length, to); i++) total += minuteValue(ledger[i]!, metric);
  return total;
}

function windowSumsAt(
  ledger: readonly MinuteRow[],
  elapsedMin: number,
  cited: readonly CitedWindow[],
): Readonly<Record<string, { readonly current: number; readonly baseline: number; readonly complete: boolean }>> {
  if (cited.length === 0) return EMPTY_WINDOW_SUMS;
  const out: Record<string, { current: number; baseline: number; complete: boolean }> = {};
  for (const window of cited) {
    const w = window.windowMinutes;
    out[window.key] = Object.freeze({
      current: sumWindow(ledger, window.metric, elapsedMin - w, elapsedMin),
      baseline: sumWindow(ledger, window.metric, elapsedMin - 2 * w, elapsedMin - w),
      complete: elapsedMin >= 2 * w,
    });
  }
  return Object.freeze(out);
}

const EMPTY_WINDOW_SUMS: ScenarioObservation["windowSums"] = Object.freeze({});

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
  /** Rung 3: envelope-label census, counted at mint (see countArrivalFamily). */
  arrivalsByFamily: Map<string, number>;
  /** Channels ladder: cumulative door-receipt census + posted chargeback
   *  fees. All zero while the doc names no channel (byte shape preserved). */
  intentsExecuted: number;
  intentsRefused: number;
  chargebacksApplied: number;
  /** Wave five: cumulative CorruptOutcomes from the driver's side channel
   *  (result.corruptions) — 0 while no `limits.corrupts` arm exists. */
  corruptions: number;
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

function snapshotObservation(
  facts: TickFacts,
  elapsedMin: number,
  acc: Accumulator,
  windowSums: ScenarioObservation["windowSums"],
  econ: EconomyState | null,
): ScenarioObservation {
  return Object.freeze({
    elapsedMin,
    cashFreeMicroUsd: facts.cashFreeMicroUsd,
    settledInvoices: acc.settledInvoices,
    churnedCustomers: acc.churnedCustomers,
    writtenOffCustomers: acc.writtenOffCustomers,
    bounces: acc.bounces,
    deaths: Object.freeze([...acc.deaths]),
    // Rung 4: the bank's own ledger (state, not notice-counting — the
    // breach row and its notice are minted together per edge, tick.ts).
    covenantBreaches: econ?.covenantBreachLog.length ?? 0,
    // Rung 5: the §2.10 score straight off the lane; pre-money reads the
    // opening 5,000 bps the fresh ledger always carries.
    reputationBps: econ?.reputation.overallBps ?? REPUTATION_INITIAL_BPS,
    // Channels ladder: door-rail receipts + posted chargeback fees, both
    // cumulative; the credit sum re-folds the adjudication log itself
    // (single authority: EconomyState.postMortemLog, economy/postmortem.ts).
    intentsExecuted: acc.intentsExecuted,
    intentsRefused: acc.intentsRefused,
    chargebacksApplied: acc.chargebacksApplied,
    postmortemCreditsBps: postmortemCreditsSum(econ),
    corruptions: acc.corruptions,
    arrivalsByFamily: sortedCensus(acc.arrivalsByFamily),
    windowSums,
  });
}

/** Σ creditedBps of the adjudicated post-mortem log (0n when the lane is
 *  off or nothing has ever been credited — absent-while-idle law). */
function postmortemCreditsSum(econ: EconomyState | null): bigint {
  const log = econ?.postMortemLog;
  if (log === undefined || log.length === 0) return 0n;
  let credits = 0n;
  for (const row of log) credits += row.creditedBps;
  return credits;
}

/* ── Channels ladder — economy host-signals composition ─────────────────
 *
 *  runEconomyTick owns steps 8.5/12.45/12.5 for INPUTS the fold forwards
 *  (outages, price overrides, refused settlements); the scenario wire's
 *  `signals` have no pass-through there yet (tickFold is shared with
 *  fastForward — a forward would be the engine-lanes' call, reported as
 *  owed). So the scenario composes the SAME effects with the SAME exported
 *  primitives, in the SAME step order, between the fold and the cash
 *  mirror — the rung-4 covenant-seeding precedent one level deeper:
 *  - chargebacks   = the step-8.5 trio verbatim: sorted-visit priming
 *    guard, red post of −cfg.fees.chargebackFeeMicroUsd under the engine
 *    cause grammar, `chargeback-posted` notice into the census, and the
 *    `chargeback` reputation signal the 12.5 notice-scan would have made.
 *  - postmortems   = the step-12.45 adjudication: foldPostMortemFilings
 *    onto the live log, filed/unattributed notices, credited-blameless
 *    signals spliced exactly as the engine splices them.
 *  - majorIncidents/honestPostmortems = the 12.5 input vocabularies.
 *  ONE applyReputationSignals call carries all of a minute's composed
 *  signals in engine order [chargeback, major, honest, filed-credit]; an
 *  empty minute never reaches this function (the schedule map holds only
 *  minutes with rows), so every channel-off run stays byte-identical.
 *
 *  Deviation from the wave-5 brief, disclosed: chargeback rows carry NO
 *  author amount — the fee is cfg-owned (cfg.fees.chargebackFeeMicroUsd),
 *  exactly as in the engine, and an authored number would be dead weight
 *  on the wire.
 */

interface MutableSignalRows {
  majorIncidents: { atMinute: number; count: number }[];
  honestPostmortems: { atMinute: number; cause: string }[];
  postmortems: ScenarioSignals["postmortems"][number][];
  chargebacks: { atMinute: number; contractId: EntityId }[];
}

/** Group the doc's signal rows by sim-minute. Only minutes WITH rows get
 *  an entry — the composer's no-rows-by-construction law. */
function scheduleSignals(signals: ScenarioSignals): Map<SimMinute, MutableSignalRows> {
  const byMinute = new Map<SimMinute, MutableSignalRows>();
  const bucket = (minute: number): MutableSignalRows => {
    const existing = byMinute.get(minute);
    if (existing !== undefined) return existing;
    const fresh: MutableSignalRows = { majorIncidents: [], honestPostmortems: [], postmortems: [], chargebacks: [] };
    byMinute.set(minute, fresh);
    return fresh;
  };
  for (const row of signals.majorIncidents) bucket(row.atMinute).majorIncidents.push(row);
  for (const row of signals.honestPostmortems) bucket(row.atMinute).honestPostmortems.push(row);
  for (const row of signals.postmortems) bucket(row.atMinute).postmortems.push(row);
  for (const row of signals.chargebacks) bucket(row.atMinute).chargebacks.push(row);
  return byMinute;
}

/** Compose one minute's signal rows into the lane state (see the section
 *  law above). Pure over (econ, rows) — acc/noticesByKind are the honest
 *  census side-effects the mission report reads. */
function composeSignalRows(input: {
  econ: EconomyState;
  rows: MutableSignalRows;
  businessNow: SimMinute;
  cfg: EconomyConfig;
  acc: Accumulator;
  noticesByKind: Map<string, number>;
}): EconomyState {
  const { rows, businessNow: now, cfg, acc, noticesByKind } = input;
  let econ = input.econ;
  const repSignals: ReputationSignal[] = [];

  /* step 8.5 mirror — sorted-visit determinism, per-row fee post. */
  if (rows.chargebacks.length > 0) {
    const ordered = [...rows.chargebacks].sort((a, b) =>
      a.contractId < b.contractId ? -1 : a.contractId > b.contractId ? 1 : 0,
    );
    for (const row of ordered) {
      if (!econ.contractEconomy.has(row.contractId)) {
        throw new ScenarioError(
          "BAD_SIGNAL",
          "signals.chargebacks",
          `chargeback on un-primed contract '${row.contractId}' — the wall only admits signed contracts; the lane lost it`,
        );
      }
      const causeId = asCauseId(`economy:chargeback:${row.contractId}:${now}`);
      const posted = postEntry(econ.journal, econ.cash, {
        causeId,
        atBusinessMin: now,
        moneyColour: "red",
        delta: { free: asMoney(-cfg.fees.chargebackFeeMicroUsd) },
        context: `chargeback ${row.contractId}`,
      });
      econ = Object.freeze({ ...econ, journal: posted.journal, cash: posted.cash });
      foldNoticeCensus([{ kind: "chargeback-posted", causeId }], acc, noticesByKind);
      repSignals.push({ kind: "chargeback", causeId, contractId: row.contractId });
      acc.chargebacksApplied += 1;
    }
  }

  /* step 12.45 mirror — adjudicate filings onto the live log. */
  if (rows.postmortems.length > 0) {
    const filings: readonly PostMortemFiling[] = Object.freeze(
      rows.postmortems.map((row) =>
        Object.freeze({
          incidentCauseId: asCauseId(row.cause),
          style: row.style,
          changesInFlight: row.changesInFlight,
        }),
      ),
    );
    const priorLog = econ.postMortemLog ?? [];
    const outcomes = foldPostMortemFilings({ priorLog, filings, now, cfg });
    if (outcomes.length > 0) {
      econ = Object.freeze({
        ...econ,
        postMortemLog: Object.freeze([...priorLog, ...outcomes.map((outcome) => outcome.record)]),
      });
      for (const outcome of outcomes) {
        foldNoticeCensus(
          [
            {
              kind: (outcome.ambiguous ? "postmortem-unattributed" : "postmortem-filed") as EconomyNoticeKind,
              causeId: postMortemNoticeCauseId(outcome.ambiguous ? "unattributed" : "filed", outcome.record.incidentCauseId, now),
            },
          ],
          acc,
          noticesByKind,
        );
      }
      repSignals.push(...postMortemReputationSignals(outcomes, (incident) => postMortemNoticeCauseId("filed", incident, now)));
    }
  }

  /* step 12.5 input vocabularies — majors mint through the wall's shared
     cause grammar, honest assertions carry their declared slug. */
  for (const row of rows.majorIncidents) {
    for (let i = 0; i < row.count; i += 1) {
      repSignals.push({ kind: "major-incident", causeId: asCauseId(scenarioIncidentCause(row.atMinute, i)) });
    }
  }
  for (const row of rows.honestPostmortems) {
    repSignals.push({ kind: "honest-postmortem", causeId: asCauseId(row.cause) });
  }

  if (repSignals.length > 0) {
    econ = Object.freeze({ ...econ, reputation: applyReputationSignals(econ.reputation, repSignals, cfg) });
  }
  return econ;
}

/* ── Channels ladder — door rail stamping ───────────────────────────────
 *
 *  The doc wall already checked verb + arg grammar against the door's own
 *  VERB_ARG_SHAPES mirror (drift-pinned in __tests__/intentGrammar.test.ts).
 *  Stamping rules: seq = the row's GLOBAL doc index (unique per run, so
 *  the door's M4 duplicate-(tick,seq) throw can never bite authored data),
 *  tick = atTick (the driver advances one sim minute per tick — same
 *  numbering the door stamps receipts with), atUs = the sim-minute grid.
 *  The door runs every tick regardless; feeding nothing keeps the exact
 *  pre-channel byte shape (result.doorReceipts stays empty).
 */
function scheduleIntents(intents: readonly ScenarioIntent[]): Map<number, readonly ExternalIntent[]> {
  const byTick = new Map<number, ExternalIntent[]>();
  intents.forEach((row, index) => {
    const bucket = byTick.get(row.atTick) ?? [];
    bucket.push(
      Object.freeze({
        tick: BigInt(row.atTick),
        intent: Object.freeze({
          seq: index,
          clock: "sim" as const,
          atUs: BigInt(row.atTick) * MICROS_PER_MIN,
          origin: "player" as const,
          payload: Object.freeze({
            kind: "player-verb" as const,
            args: Object.freeze({ ...row.args, verb: row.verb }) as PlayerVerbArgs,
          }),
        }) satisfies PlayerIntent,
      }),
    );
    byTick.set(row.atTick, bucket);
  });
  const frozen = new Map<number, readonly ExternalIntent[]>();
  for (const [tick, rows] of byTick) frozen.set(tick, Object.freeze(rows));
  return frozen;
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

/* ─────────────── rung 6: attention denominations (host side) ─────────────── */

/* The business-minute month constant mirrors fastForward.ts:1157 by intent,
 * not by import. The CALENDAR is the roll authority, never the folded month
 * index — cite the host-forwarding lane's dead-ledger pin @9ca31c3: a
 * calendar-driven roll keeps servicing attention loans past terminal company
 * death, which a monthIndex-coupled design provably misses. The roll block
 * below therefore sits OUTSIDE the money fold, exactly like the weekend's. */
const ATTENTION_MONTH_MINUTES = 43_200;

function attentionMonthOf(state: GameState): number {
  return Math.floor(Number(state.context.clocks.businessUs / MICROS_PER_MIN) / ATTENTION_MONTH_MINUTES);
}

/** Rung-6 mint law: the resignation note IS the triage window. The pipeline
 *  pool starts EMPTY (attention.ts: a window entry is the only hand-creation
 *  event), so the runner opens `capacity` triage-window entries at business
 *  minute 0 — capacity hands in play, each carrying one un-repaid loan
 *  (debt = capacity), which the month rolls then service one loan at a time. */
function mintAttentionPool(capacity: number): AttentionState {
  let pool = createAttentionState(capacity);
  for (let opened = 0; opened < capacity; opened += 1) {
    pool = attentionWindowEntry(pool, "triage-window", 0).state;
  }
  return pool;
}

/* ─────────────── rung 8: the change-freeze validators ─────────────── */

/* One shared refusal answer for both door host-validator seams — the door
 * supplies the prefix (`placement-rejected:` / `unknown-plan:`, its
 * requireString law). The band is INCLUSIVE on both ends and read on the
 * rail's tick clock, the same number every intent row stamps `atTick` with. */
const FREEZE_REJECTION: { readonly reason: string } = Object.freeze({ reason: "change-freeze" });

function isUnderTheTape(freeze: { readonly fromMinute: number; readonly toMinute: number }, atTick: SimTick): boolean {
  return atTick >= freeze.fromMinute && atTick <= freeze.toMinute;
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
  const corrupts = doc.limits.corrupts;
  /* Rung 6: the pool is minted ONLY when the wire names it. Absent ⇒ the
   * `attention` key never materializes in the frozen initial state (the
   * digest absorbs it only when present), so all 23 pre-rung-6 wires ride
   * their exact byte shape. */
  const attentionLimit = doc.limits.attention;
  const attentionPool = attentionLimit === undefined ? null : mintAttentionPool(attentionLimit.capacity);
  const uaConfig: RunUnattendedConfig = Object.freeze({
    runSeed,
    board: doc.board,
    ruleBook: Object.freeze([]),
    ruleBookHash: SCENARIO_RULE_BOOK_HASH,
    guards: Object.freeze([]),
    handCapacity: doc.limits.handCapacity,
    engineVersion: SCENARIO_ENGINE_VERSION,
    /* Wave five: the corrupts arm re-tunes the patience budget (queued
     * units past patience corrupt instead of bouncing). Applied ONLY when
     * the wire names it — every pre-channel mission keeps the lane's
     * 120-minute default byte-for-byte. */
    ...(corrupts === null ? {} : { defaultPatienceMin: corrupts.patienceMin }),
    /* Rung 6: the minted pool rides the initial-state spread; absent when
     * unarmed (mintInitialState gates the key the same way). */
    ...(attentionPool === null ? {} : { attention: attentionPool }),
  });
  const nodes = mintNodeRecords(doc.board.nodes);
  const edges: readonly BoardEdgeRecord[] = mintBoardEdges(doc.board.edges);
  const pipelineConfig: DefaultPipelineConfig = buildPipelineConfig(uaConfig, nodes);
  /* Wave five: silent corruption arming. Unit TYPES are the arrival step's
   * tableId (defaults.ts `type: envelope.tableId`), so the wire names its
   * own traffic table(s); certainty (10,000 bps — the parsed default)
   * SKIPS the dice, making the corrupted census pure arithmetic. Absent ⇒
   * the shipped patience path untouched, byte-ident. */
  const slotsConfig: DefaultPipelineConfig =
    corrupts === null
      ? pipelineConfig
      : Object.freeze({
          ...pipelineConfig,
          patienceModeByType: Object.freeze(
            Object.fromEntries(corrupts.tables.map((table) => [table, "corrupts" as const])),
          ),
          corruptionProbability: fromRatio(BigInt(corrupts.probabilityBps), 10_000n),
        });
  const dependencyEdges = dependencyEdgesFor(nodes);
  const rulePhase = createRulePhaseStep();
  const slots = Object.freeze({ ...createDefaultSlots(slotsConfig), rulePhase: rulePhase.step });
  const game0 = mintInitialState(uaConfig, nodes, edges);
  /* Channels ladder: the door is wired only when the doc names a rail —
   * an empty options object keeps today's exact driver construction.
   * handCapacity mirrors the minted hands (the door's fallback path never
   * fires on scenario states; naming it keeps the two readings honest). */
  const intentSchedule = scheduleIntents(doc.intents);
  /* Rungs 6/8 ride the door config as CONDITIONAL keys: an unarmed wire
   * produces exactly the pre-rung {handCapacity} object, so every shipped
   * mission's door behavior (and digest) is byte-stand. Taxed verbs pay the
   * normal hand FIRST, then occupy a free attention token (door law); the
   * freeze validators answer only under the tape, both inclusive ends. */
  const freezeRow = doc.limits.freeze;
  const doorIntents: IntentDoorConfig = Object.freeze({
    handCapacity: Math.max(1, doc.limits.handCapacity),
    ...(attentionLimit === undefined ? {} : { attentionCost: attentionLimit.cost }),
    ...(freezeRow === undefined
      ? {}
      : {
          canPlaceDevice: (query: PlaceDeviceQuery) =>
            isUnderTheTape(freezeRow, query.context.tick) ? FREEZE_REJECTION : null,
          canAdjustPrice: (query: AdjustPriceQuery) =>
            isUnderTheTape(freezeRow, query.context.tick) ? FREEZE_REJECTION : null,
        }),
  });
  const driver = createTickDriver(
    slots,
    streamFor(runSeed, "root", 0),
    game0.context.clocks,
    doc.intents.length > 0 ? { intents: doorIntents } : {},
  );

  /* ── money lane (the roster registers ONCE through the batch API) ── */
  const ecoCfg: EconomyConfig = defaultEconomyConfig();
  let econ: EconomyState | null = null;
  const contractsBook = new Map<EntityId, Contract>();
  const moneyOn =
    doc.contracts.length > 0 ||
    doc.limits.opex.length > 0 ||
    doc.limits.initialFreeMicroUsd !== 0n ||
    doc.limits.covenants.length > 0 ||
    scenarioSignalsActive(doc.signals);
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
    /* Rung 4 wire: seed the bank's cards into the lane's state ONCE. The
       month roll carries them forward (`input.covenants ?? prior.covenants`)
       and reviews them every business month; an empty list means the
       review never runs at all (pre-rung-4 byte shape, kept exact).
       The paired `freeAtMonthStart` re-anchor is why the seed is scoped:
       the lane's pre-existing month-1 burn closes against the 0-cash empty
       state (probe-discovered engine fact — first-month runway always reads
       unbounded). Existing missions are authored and pinned on that exact
       calendar, so it stays untouched; but a bank CANNOT review a company
       whose opening balance sheet starts at the credit it actually drew —
       when the wire names covenants, month 1 burns from the minted cash. */
    if (doc.limits.covenants.length > 0) {
      econ = Object.freeze({
        ...econ,
        covenants: doc.limits.covenants,
        freeAtMonthStart: econ.cash.free,
      });
    }
  }
  const opexByMinute = new Map<SimMinute, readonly UnattendedOpexDraft[]>();
  for (const draft of doc.limits.opex) {
    const prior = opexByMinute.get(draft.atMinute) ?? [];
    opexByMinute.set(draft.atMinute, Object.freeze([...prior, draft]));
  }
  const signalSchedule = scheduleSignals(doc.signals);

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
    arrivalsByFamily: new Map(),
    intentsExecuted: 0,
    intentsRefused: 0,
    chargebacksApplied: 0,
    corruptions: 0,
  };
  const eventsByKind = new Map<string, number>();
  const noticesByKind = new Map<string, number>();
  const sustainRuns = new Map<string, number>();
  const window: TickFacts[] = [];
  /* Rung 2 bookkeeping: the per-minute service ledger + the window keys the
     doc actually cites (pre-computed at every boundary, nothing else). */
  const citedWindows = collectCitedWindows(doc);
  const minuteLedger: MinuteRow[] = [];
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
  let lastObs = snapshotObservation(mintFacts, 0, acc, windowSumsAt(minuteLedger, 0, citedWindows), econ);
  /* Rung 6 calendar cursor (fastForward.ts:1142 law mirrored): the BUSINESS
   * clock owns month rolls, not the economy's folded monthIndex. */
  let attentionMonthCursor = attentionMonthOf(game);

  for (let t = 1; t <= totalTicks; t++) {
    const minute = game.context.minute + 1;
    const envelopes = envelopesAtMinute(doc, minute, corpusWindows);
    const scheduledIntents = intentSchedule.get(t);
    const result = driver.advance(
      game,
      Object.freeze({
        envelopes,
        evidence: Object.freeze([]),
        classes: UNATTENDED_CLASSES,
        dependencyEdges,
        retryPolicy: UNATTENDED_RETRY,
        aggression: UNATTENDED_AGGRESSION,
        expressMaxConfidence: UNATTENDED_EXPRESS_MAX_CONFIDENCE,
        ...(scheduledIntents === undefined ? {} : { externalIntents: scheduledIntents }),
      }),
    );
    game = result.state;

    for (const e of result.events) {
      eventsByKind.set(e.kind, (eventsByKind.get(e.kind) ?? 0) + 1);
      if (e.kind === "arrival") countArrivalFamily(e.causeId, envelopes, acc.arrivalsByFamily);
    }

    /* Wave five: the silent corruption side channel. `TickResult.corruptions`
       is the per-tick batch of patience-exhausted responses that completed
       WRONG (CorruptOutcome); absent until a `limits.corrupts` arm marks a
       unit, so every pre-channel run adds 0 and keeps the byte shape. We
       accumulate the batch length — the same per-tick-to-cumulative law as
       the door receipts and posted chargebacks above. */
    acc.corruptions += result.corruptions?.length ?? 0;

    /* money lane: the shared tick fold (internal/tickFold.ts, one home
       with fastForward) runs opex → economy fold → refusal witnesses with
       topic "scenario" — the `scenario:opex:<minute>:<memo>` cause ids the
       shipped missions digest are minted verbatim there. The mission lane
       keeps its own census + mirror policy: `economyRounds` counts ONLY
       successful folds, and the cash mirror rides UNCONDITIONALLY (every
       host that reaches this block mirrors — the pinned divergence from
       fastForward's mirror-only-on-success law, see the fold docblock). */
    let refusedBurnsThisTick = 0;
    let settledThisTick = 0;
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
        const settledBefore = acc.settledInvoices;
        foldNoticeCensus(out.notices, acc, noticesByKind);
        settledThisTick = acc.settledInvoices - settledBefore;
      }
      /* Channels ladder: the doc's minute rows compose into the lane with
         the exported economy primitives (section law above) BEFORE the
         cash mirror — a posted chargeback fee must ride the same-tick
         mirror like any fold-minted money move. */
      const signalRows = signalSchedule.get(minute);
      if (signalRows !== undefined) {
        econ = composeSignalRows({
          econ,
          rows: signalRows,
          businessNow: Number(game.context.clocks.businessUs / MICROS_PER_MIN),
          cfg: ecoCfg,
          acc,
          noticesByKind,
        });
      }
      game = withCashMirror(game, econ);
    }

    /* Rung 6 host month-roll — the calendar block deliberately sits OUTSIDE
     * the money fold above: voided settles and terminal company death never
     * defer the clock (fastForward.ts:1033 mirror; the dead-ledger witness
     * pin @9ca31c3 is the falsifier that proved a money-coupled roll misses
     * service past death). One loan serviced per roll, oldest first. */
    if (game.attention !== undefined) {
      const monthsNow = attentionMonthOf(game);
      const monthRolls = monthsNow - attentionMonthCursor;
      attentionMonthCursor = monthsNow;
      if (monthRolls > 0) {
        const businessMinute = Number(game.context.clocks.businessUs / MICROS_PER_MIN);
        let attention: AttentionState = game.attention;
        for (let roll = 0; roll < monthRolls; roll += 1) {
          attention = replenishAtBusinessMonth(attention, businessMinute, true);
        }
        game = Object.freeze({ ...game, attention });
      }
    }

    /* tick-final observation (the ONLY thing objectives read). */
    const facts = collectFacts(game, result, econ);
    acc.bounces += facts.bounced;
    acc.served += facts.served;
    acc.landed += facts.landed;
    acc.falsePositives += facts.falsePositive;
    acc.arrivals += facts.arrivals;
    /* Channels ladder: the door stamped a receipt for every fed intent —
       collectFacts already split them by outcome for this tick. */
    acc.intentsExecuted += facts.intentsExecuted;
    acc.intentsRefused += facts.intentsRefused;
    minuteLedger.push({
      arrivals: facts.arrivals,
      served: facts.served,
      bounced: facts.bounced,
      settled: settledThisTick,
    });
    const obs = snapshotObservation(
      facts,
      Number(game.context.minute),
      acc,
      windowSumsAt(minuteLedger, Number(game.context.minute), citedWindows),
      econ,
    );
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
