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
  ArrivalIn,
  ArrivalOut,
  AttentionState,
  BoardEdgeRecord,
  CauseId,
  Contract,
  EntityId,
  ExternalIntent,
  GameState,
  MoneyUnit,
  ObservedKey,
  PlayerIntent,
  PlayerVerbArgs,
  PolicyCard,
  RuleId,
  RunSeed,
  SimMinute,
  SimTick,
  TickStep,
  UnitIntent,
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
import { createRulePhaseStep, validatePolicyCard } from "../policy/index.ts";
import type {
  CompanyDeathCause,
  EconomyConfig,
  EconomyNoticeKind,
  EconomyState,
  PostMortemFiling,
  RefusedSettlement,
  RegisterContractInput,
  ReputationSignal,
  ValuationAdjustment,
  ValuationExitKind,
  ValuationRevenueRow,
} from "../economy/index.ts";
import {
  applyReputationSignals,
  COMPANY_DEATH_CAUSES,
  contractRemainingTerm,
  contractedRevenueShareBps,
  defaultEconomyConfig,
  emptyEconomyState,
  exitCashSliceMicroUsd,
  foldPostMortemFilings,
  postEntry,
  postMortemNoticeCauseId,
  postMortemReputationSignals,
  registerContractsEconomy,
  REPUTATION_INITIAL_BPS,
  VALUATION_EXIT_KINDS,
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
  createUpkeepCursor,
  createWarmthCursor,
  dependencyEdgesFor,
  foldMoneyLaneTick,
  openingDraftFor,
  withCashMirror,
  type TickFacts,
} from "../internal/tickFold.ts";
import type { ObjectivePredicate, ScenarioDoc, ScenarioIntent, ScenarioSignals } from "./doc.ts";
import { ScenarioError, scenarioIncidentCause, scenarioSeed, scenarioSignalsActive } from "./doc.ts";
import type { PerspectiveSpec, ScenarioPerspectiveReport } from "./perspective.ts";
import { applyPerspectiveToDoorConfig, perspectiveReportFor, PERSPECTIVE_V0 } from "./perspective.ts";
import type { EraPlan, EraTransition } from "./eraAvailability.ts";
import { applyEraAvailabilityToDoorConfig, composeEraPlan } from "./eraAvailability.ts";
import type { LoadedTypeBundle } from "../loader/bundle.ts";
import type { LoadedBootRules } from "../loader/decks.ts";
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
  /** L-CP2 (§1.2): a host-supplied ScopedReadView-shaped cell map for the
   *  report's sight PROJECTION. The scenario lane mints no cells and the
   *  simulation never reads this — it only lets the report answer "what
   *  would this seat have not seen?". Ignored when the doc names no
   *  perspective (no perspective ⇒ no report key at all). */
  readonly perspectiveView?: ReadonlyMap<ObservedKey, unknown>;
  /** L-EM (§0.4, ADR-0019 program 4): the RUN-FROZEN play-era world year —
   *  the engine never reads the shell's reactive eraState; the host mints
   *  it with the run. Must be supplied TOGETHER with `eraBundle` (never
   *  invent availability from a bare year). Absent ⇒ zero change: the door
   *  config object is EXACTLY today's and every shipped wire byte-stands
   *  (all 31 shipped wires are eraless by construction; roster-pinned). */
  readonly eraYear?: number;
  /** L-EM: the type line whose `eras.availability` rows and line-level dates
   *  gate place-device deviceKinds this run (loaded, boundary-parsed — the
   *  host supplies it exactly like the corpus authority supplies slices). */
  readonly eraBundle?: LoadedTypeBundle;
  /** L-ER-T (wave-26 owner ruling): the era TRANSITION calendar — each step
   *  says "from this SIM BUSINESS minute, the world year becomes `eraYear`"
   *  (inclusive at the step; the opening `eraYear` owns minute 0, so steps
   *  are strictly ascending and start at minute ≥ 1 — the parse walls live
   *  in `composeEraPlan`/`parseEraTransitions`, the pairing wall here).
   *  Rides the eraYear+eraBundle pair (never a bare calendar — a bare year
   *  would invent availability). Absent or EMPTY ⇒ `eraYearAt` stays the
   *  EXACT run-frozen constant: every shipped wire and every frozen-era
   *  arm byte-stands (digest-pinned pre-edit at 0c2549e; the report grows
   *  the `transitions` echo INSIDE the sparse `era` key ONLY for a
   *  non-empty calendar). */
  readonly eraTransition?: readonly EraTransition[];
  /** L-SMR (ADR-0016 mechanic B, wave-27): the market-rates CATALOG — priceKey
   *  → host-authored market rate µ$, forwarded verbatim into the money fold's
   *  `EconomyTickIn.sellMarketRates` where it OVERRIDES the installed-base
   *  anchor for the sell acceptance dice (economy/tick.ts step 5.5). WORLD
   *  FACT, NOT DOC DATA (era posture, ADR-0019 program 4 — a fact about the
   *  world rides the run-config; the DOC may never carry a market feed, that
   *  would be sell fiction, not a read: the runner's self-grading refusal
   *  law). Keys
   *  ride the shared priceKey grammar `{plan,contract-class,sku}:id` — the
   *  closed set drift-pinned economy/elasticity.ts PRICE_KEY_KINDS ↔
   *  pipeline/intent-door.ts PRICE_TARGET_KINDS. ABSENT or EMPTY ⇒ the key is
   *  OMITTED at the fold (key-free absence, @984759b law) ⇒ every shipped
   *  wire byte-stands (all 31 carry no catalog by construction). Non-bigint
   *  or negative VALUES throw at the seam pre-tick-1 (BAD_MONEY wall below),
   *  never limping to the engine's adjudication-time RangeError (sell.ts). */
  readonly sellMarketRates?: ReadonlyMap<string, MoneyUnit>;
  /** L-V2 (money-at-the-end 2/3, §1.6): the campaign lane's DECLARED exit kind
   *  for this mission — an OPAQUE STRING on the scenario side (this module
   *  never imports the campaign vocabulary; the chain bridge L-V3 wires
   *  chapter.exitKind → here). The declaration is CONSUMED ONLY at a winning
   *  close on the sell-accepted grammar (the report's sparse `exitPayout`),
   *  but it is VALIDATED at the seam PRE-TICK-1 against `VALUATION_EXIT_KINDS`
   *  (the economy leg's closed seven): a bad kind must die at config time
   *  naming the vocabulary, never limp to the close and silently produce no
   *  payout (the sellMarketRates BAD_MONEY posture). ABSENT ⇒ the report never
   *  grows the key — every shipped wire byte-stands (all 31 registry wires and
   *  all tour chapters run bare; digest-equality pinned in exitPayout.test). */
  readonly exitDeclaration?: { readonly exitKind: string };
  /** L-U2 (ADR-0019 (iv), owner ruling 2026-10-19): the host-armed POLICY
   *  BOOK — loader-resolved `boot.rules` entries (`bootRulesFromDeck` output
   *  rides verbatim: `{entries:[{hash, card}]}`, DP:351-355 prescription).
   *  WORLD FACT, NOT DOC DATA (era/sellMarketRates posture): a doc may never
   *  select its own book — that would be self-grading, not a deck. Absent ⇒
   *  the door's `lookupPolicyCard` key is NEVER grown (conditional spread on
   *  the base door object) ⇒ every shipped wire byte-stands (all 31 registry
   *  wires and every tour chapter arm it bare; roster-pinned in
   *  deckRules.test). Armed, `policy-card-commit` resolves through the book:
   *  commit semantics unchanged (1 hand / 1 tick, door-maintained whole-book
   *  hash), and once a card is in `state.ruleBook` the L-U1 upkeep fold bills
   *  Σ upkeepMicroUsd per business-month roll — the seam where upkeep first
   *  bites. PRE-TICK-1 walls (plain-Error config grammar): EMPTY entries are
   *  a host bug (the loader itself legalizes armed-but-silent decks — this
   *  leg's presence must mean a book), a duplicate hash throws NAMING BOTH
   *  POSITIONS (L-BR1 codec posture), and every card passes the engine's own
   *  `validatePolicyCard` — all three speak `scenario[BAD_RULES]`.
   *  Composition over the other door layers is the standing chain, unchanged:
   *  perspective `lookupPolicyCards: false` STRIPS the armed book (seat beats
   *  host — pinned), and an era plan that greys a committed card's id answers
   *  `unknown-card-hash` for it (activation pinned — before this seam the
   *  grey path was dead in scenarios, see `eraPolicyCards`). */
  readonly rules?: LoadedBootRules;
  /** L-U2: the cardId → techId map the era gate greys policy cards through
   *  (`composeEraPlan`'s `opts.policyCards`, host-resolved content knowledge
   *  — the loader deck and the bundle's `eras.availability` rows are the two
   *  books the scenario never joins itself). Rides the eraYear+eraBundle pair
   *  exactly like `eraTransition` (a bare map has no world to grey against).
   *  HONEST DISCLOSURE: `applyEraAvailabilityToDoorConfig` only grows the
   *  greyed-lookup when `plan.greyedPolicyCardIds` is non-empty AND the door
   *  has a lookup — the runner never passed `policyCards`, so era grey-out of
   *  policy cards was DEAD at scenario altitude even with a book wired; this
   *  leg plus `rules` activates it end-to-end (the LIVE grey twin in
   *  deckRules.test is the activation proof). ABSENT ⇒ the compose opts
   *  object is byte-identical to today's (and with it every eraless run). */
  readonly eraPolicyCards?: ReadonlyMap<string, string>;
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
  /** L-CP2: present ONLY on perspective-armed docs (sparse-key law). A
   *  record of the seat — its sight namespaces, the verbs the tapes land
   *  on, and (when a view was supplied) the projected cell census. The
   *  `observation` above stays WHOLE TRUTH under every seat: seeing is not
   *  being, hide never reaches the fold (pinned by the whole-truth test). */
  readonly perspective?: ScenarioPerspectiveReport;
  /** L-EM (ADR-0019 program 4): present ONLY on era-armed runs (sparse-key
   *  law — every eraless wire, all 31 shipped, never grows the key). The
   *  play-era record: which world-year the run OPENS in, which type line
   *  authored the windows, and (L-ER-T, sparse WITHIN the sparse key) the
   *  frozen transition calendar when one was armed. */
  readonly era?: { readonly eraYear: number; readonly bundleId: string; readonly transitions?: readonly EraTransition[] };
  /** L-GUARD (ADR-0019 program 2): present ONLY when a signal-minute found
   *  `free` below the cfg-owned chargeback fee — the funding-honest record
   *  of every fee the ledger refused (sorted-visit order). Sparse-key law:
   *  funded docs never grow the key, their reports stay byte-ident. The
   *  disputes themselves stay on the trace regardless (observation +
   *  notices + rating — the wave is never dropped). */
  readonly chargebackFeeRefusals?: readonly {
    readonly atBusinessMinute: SimMinute;
    readonly contractId: EntityId;
    readonly feeMicroUsd: MoneyUnit;
    readonly freeMicroUsd: MoneyUnit;
  }[];
  /** L-V2 (money-at-the-end 2/3): the pure read-projection of a DECLARED exit
   *  onto the winning close — present ONLY when the run WON on a win-line
   *  carrying the sell-accepted grammar AND the config declared an exit kind.
   *  Every input is ALREADY-ROLLED engine truth at the stop boundary (the
   *  persisted sell verdicts, the notice-census counters, the reputation
   *  ledger, the contract book at the at-close business minute) pushed through
   *  the economy's own `exitCashSliceMicroUsd` — zero new dice, zero state,
   *  the endDigest byte-stands by construction (sparse-key law, era/
   *  perspective/chargeback precedent: all 31 registry wires and every tour
   *  chapter run without a declaration and never grow this key). */
  readonly exitPayout?: ScenarioExitPayout;
  /** L-U2 sparse-key law: present ONLY when the host armed a policy book
   *  (`config.rules`). The echo is the ARMED BOOK (host posture), not the
   *  committed subset — what the door could resolve, in host order, hash +
   *  card id verbatim. A perspective strip or era grey never edits the echo
   *  (it reports the seam, not the seat's verdict); an unarmed run never
   *  grows the key (all 31 registry wires and every tour chapter —
   *  falsifiable in deckRules.test via the dormant twin). */
  readonly rulesArmed?: readonly { readonly hash: string; readonly cardId: RuleId }[];
}

/** L-V2: the shape of the report-only exit payout (see `ScenarioReport`'s
 *  `exitPayout` key). `headlineOfferMicroUsd` is the Σ of the ACCEPTED sell
 *  verdicts' offer prices at close — the notice-shape law says every
 *  `sell-accepted` notice carries its verdict's `offerPriceMicroUsd` as
 *  `amount` (economy/tick.ts step 5.5, pinned economy sell-accept.test "notice
 *  shape"); the persisted verdict map is the same truth post-amendment. The
 *  slice is the valuation leaf's output: never above the headline (hg:5621
 *  diligence posture), wind-down would slice to exactly 0 but the campaign
 *  parse wall refuses that kind before it can be declared here. */
export interface ScenarioExitPayout {
  readonly exitKind: ValuationExitKind;
  readonly headlineOfferMicroUsd: MoneyUnit;
  readonly cashSliceMicroUsd: MoneyUnit;
  readonly adjustments: readonly ValuationAdjustment[];
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
 *  `arrival:<tableId>:<tick>:<envelopeIndex>`; on an UNARMED wire (no
 *  `limits.familyMix`, rung 10) the family die is never rolled, so the
 *  envelope's dominantFamily IS the minted unit's family — exact, not
 *  approximate. Cohort-bonus mints share their envelope index, so herded
 *  visitors are labeled diegetically too. On an ARMED wire this path is
 *  skipped entirely — the label is cover story; observeMintedFamilies below
 *  counts the roll. */
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

/** Rung 10: the mint-time family observer — a pure pass-through wrapper
 *  over the arrival slot. The inner step rolls the armed mix per unit;
 *  this reads each returned unit's trueIntent and folds it into the census
 *  Map, then returns the inner output object UNTOUCHED (same reference,
 *  already frozen). No dice consumed, no state seen, no ordering imposed —
 *  the report stays a fold, and the ×100 determinism legs ride it like any
 *  other output-side counter. */
function observeMintedFamilies(
  inner: TickStep<ArrivalIn, ArrivalOut>,
  sink: Map<string, number>,
): TickStep<ArrivalIn, ArrivalOut> {
  return (input) => {
    const out = inner(input);
    for (const unit of out.units) {
      const family = intentToFamilyLabel(unit.trueIntent);
      sink.set(family, (sink.get(family) ?? 0) + 1);
    }
    return out;
  };
}

/** The census-label mirror of familyToIntent (pipeline/internal.ts): the
 *  five threat families fold back to their authored wire names — that is
 *  the whole point of the dial — while the benign intents (customer /
 *  prospect / automaton: funnel conversions, viral drafts, health-check
 *  bots — none of them ever minted through the arrival step under an armed
 *  mix) keep the "organic" label the unarmed census uses. */
function intentToFamilyLabel(intent: UnitIntent): string {
  switch (intent) {
    case "malicious":
      return "malicious";
    case "human-error":
      return "human";
    case "entropic":
      return "entropic";
    case "systemic":
      return "systemic";
    case "abuser":
      return "customerAsThreat";
    case "customer":
    case "prospect":
    case "automaton":
      return "organic";
  }
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

/** One fee the ledger refused while the dispute itself stayed on the
 *  trace (funding-honest law above). Module-private: the report field
 *  carries the shape inline, no new barrel names (internal-function
 *  posture — the guard is composition policy, not wire vocabulary). */
interface ChargebackFeeRefusal {
  /** Engine cause-grammar clock (the `economy:chargeback:<id>:<n>` minute —
   *  business time, NOT the row's sim-minute schedule key). */
  readonly atBusinessMinute: SimMinute;
  readonly contractId: EntityId;
  readonly feeMicroUsd: MoneyUnit;
  readonly freeMicroUsd: MoneyUnit;
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
  /** Rung 9: the same doorReceipts array, split per verb. No second pass,
   *  no dice — the total fold and this census read one receipt stream. */
  intentsExecutedByVerb: Map<string, number>;
  intentsRefusedByVerb: Map<string, number>;
  chargebacksApplied: number;
  /** Funding-honest law: fees the ledger refused (sorted-visit order, same
   *  stream the posts read). Empty while every signal minute can pay — the
   *  report key stays absent (sparse-key law, byte-shape preserved). */
  chargebackFeeRefusals: ChargebackFeeRefusal[];
  /** Wave five: cumulative CorruptOutcomes from the driver's side channel
   *  (result.corruptions) — 0 while no `limits.corrupts` arm exists. */
  corruptions: number;
  /** Act III rung: cumulative sell ADJUDICATION notices (foldNoticeCensus) —
   *  the door books offers; only the fold's verdict dice land here. Both 0
   *  while no offer ever reaches a verdict (the observation key stays absent
   *  — sparse-key law, pre-rung shape preserved). */
  sellAccepted: number;
  sellRefused: number;
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
    else if (notice.kind === "sell-accepted") acc.sellAccepted += 1;
    else if (notice.kind === "sell-refused") acc.sellRefused += 1;
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
    intentsExecutedByVerb: sortedCensus(acc.intentsExecutedByVerb),
    intentsRefusedByVerb: sortedCensus(acc.intentsRefusedByVerb),
    chargebacksApplied: acc.chargebacksApplied,
    postmortemCreditsBps: postmortemCreditsSum(econ),
    corruptions: acc.corruptions,
    arrivalsByFamily: sortedCensus(acc.arrivalsByFamily),
    windowSums,
    /* Act III rung (sparse-key law): the verdict pair appears ONLY once a
       verdict has landed — the mint snapshot and every verdict-free run keep
       the exact pre-rung observation shape. */
    ...(acc.sellAccepted + acc.sellRefused > 0
      ? { sellVerdicts: Object.freeze({ accepted: acc.sellAccepted, refused: acc.sellRefused }) }
      : {}),
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
 *
 *  FUNDING-HONEST LAW (ADR-0019 program 2, the L-CP3 shelf ticket): the
 *  step-8.5 trio sat OUTSIDE both money-lane insolvency guards — inside
 *  the fold a negative-bucket throw voids the whole tick (catch-and-void),
 *  and a scheduled opex burn the book cannot cover is REFUSED at the tick
 *  head; the composer's fee post had neither, so a doc re-based onto a
 *  thin carry opening (campaign bridge: 300_000_000 µ$) crashed the chain
 *  once the dunning dice wound `free` below the $20 fee. The guard reuses
 *  the refuse-not-overdraft law (tickFold's opex pre-check, same `<` —
 *  at free == fee the fee still pays, bottoming at zero): the CASH leg is
 *  refused with a report witness naming minute/contract/fee/free, while
 *  the EVENT legs stay verbatim — the dispute notice, the §2.10 rating
 *  signal, and the chargebacksApplied census. The wave is never dropped:
 *  a processor still assessed the chargeback; only the ledger says NO to
 *  moving money it does not have. Deliberate posture, NOT an engine drift:
 *  inside the fold the same insolvency would void the whole tick (losing
 *  that minute's notices with it); the composer keeps the authored event
 *  stream truthful because here the event is the doc's own wire, not a
 *  host-forwarded input. Fee refusals do NOT arm the guardrail refusal
 *  census (refusedBurnsThisTick is player-scheduled-burn semantics; the
 *  witness + the doc's own cash trajectory carry the funding story).
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
      const fee = cfg.fees.chargebackFeeMicroUsd;
      if (econ.cash.free < fee) {
        /* Funding-honest law (ADR-0019 program 2): the CASH leg refuses —
           same `<` as tickFold's opex pre-check, at free == fee the fee
           still pays and bottoms at zero — while the EVENT legs below run
           verbatim. The wave is never silently dropped. */
        acc.chargebackFeeRefusals.push(
          Object.freeze({
            atBusinessMinute: now,
            contractId: row.contractId,
            feeMicroUsd: fee,
            freeMicroUsd: econ.cash.free,
          }),
        );
      } else {
        const posted = postEntry(econ.journal, econ.cash, {
          causeId,
          atBusinessMin: now,
          moneyColour: "red",
          delta: { free: asMoney(-fee) },
          context: `chargeback ${row.contractId}`,
        });
        econ = Object.freeze({ ...econ, journal: posted.journal, cash: posted.cash });
      }
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

/* ─────────────── L-V2: money at the end — the report-only close read ─────────────── */

/** The pure close read for a DECLARED, OBSERVED exit. Every input is
 *  already-rolled engine truth at the terminal boundary:
 *  - headline  = Σ of the ACCEPTED persisted sell verdicts' offer prices. The
 *    notice-shape law (economy/tick.ts step 5.5, pinned economy sell-accept.test
 *    "notice shape") says every `sell-accepted` notice carries its verdict's
 *    `offerPriceMicroUsd` as `amount`; the verdict MAP is the same truth AFTER
 *    amendment (a re-offered key re-rolls and overwrites), so it is the
 *    at-close authority.
 *  - churn / written-off bps = the observation's cumulative notice census over
 *    the AUTHORED contract roster — the engine holds no point-in-time customer
 *    count, and lifetime churn against the authored book is the honest
 *    denominator (empty roster ⇒ 0n: nothing churned because nothing existed).
 *  - concentration = largest ACTIVE MRC over the active-book sum (phases
 *    pending/suspended/terminated are not closing revenue; MRC is authored on
 *    the Contract, the phase is the economy mirror's). Empty/zero book ⇒ null
 *    — ABSENCE BOOKS NO FINDING (valuation input law).
 *  - WARCT coverage = `contractedRevenueShareBps` over the same active rows,
 *    termEndMin read off the ECONOMY-OWNED mirror (advanced on renewal — the
 *    at-close truth, not the doc's original date) at the at-close business
 *    minute (the same `businessUs / MICROS_PER_MIN` reading :1391 uses).
 *  - reputation = `observation.reputationBps`, the very ledger the §2.10 score
 *    lane publishes.
 *  Trust honesty (disclosed): `EconomyState.relationships` exists but
 *  `exitCashSliceMicroUsd` takes NO trust input at all (trust rides the
 *  per-tenant lease-value read, which is not part of this close), so no row
 *  here consults it. ZERO streamFor calls, ZERO state writes: no new dice, and
 *  the endDigest byte-stands by construction (×100 pinned in exitPayout.test). */
function exitPayoutFor(
  doc: ScenarioDoc,
  econ: EconomyState | null,
  contractsBook: ReadonlyMap<EntityId, Contract>,
  game: GameState,
  finalObs: ScenarioObservation,
  exitKind: ValuationExitKind,
): ScenarioExitPayout {
  let headline = 0n;
  for (const verdict of econ?.sellVerdicts?.values() ?? []) {
    if (verdict.accepted) headline += verdict.offerPriceMicroUsd;
  }
  const roster = BigInt(doc.contracts.length);
  const churnBps = roster === 0n ? 0n : (BigInt(finalObs.churnedCustomers) * 10_000n) / roster;
  const writtenOffBps = roster === 0n ? 0n : (BigInt(finalObs.writtenOffCustomers) * 10_000n) / roster;
  const atBusinessMinute = Number(game.context.clocks.businessUs / MICROS_PER_MIN);
  let largestMrc = 0n;
  let bookSumMrc = 0n;
  const rows: ValuationRevenueRow[] = [];
  if (econ !== null) {
    for (const [contractId, ce] of econ.contractEconomy) {
      if (ce.phase !== "active") continue;
      const contract = contractsBook.get(contractId);
      if (contract === undefined) continue; // defensive: the book is registered from doc.contracts
      const mrc = contract.mrcMicroUsd;
      if (mrc <= 0n) continue;
      if (mrc > largestMrc) largestMrc = mrc;
      bookSumMrc += mrc;
      rows.push(Object.freeze({ mrcMicroUsd: mrc, remainingMonths: contractRemainingTerm(ce, atBusinessMinute) }));
    }
  }
  const concentrationBps = bookSumMrc > 0n ? (largestMrc * 10_000n) / bookSumMrc : null;
  const warctCoverageBps = rows.length > 0 ? contractedRevenueShareBps(rows) : null;
  const headlineOffer = asMoney(headline);
  const slice = exitCashSliceMicroUsd({
    headlineOfferMicroUsd: headlineOffer,
    churnBps,
    writtenOffBps,
    concentrationBps,
    warctCoverageBps,
    reputationBps: finalObs.reputationBps,
    exitKind,
  });
  return Object.freeze({
    exitKind,
    headlineOfferMicroUsd: headlineOffer,
    cashSliceMicroUsd: slice.cashSliceMicroUsd,
    adjustments: Object.freeze([...slice.adjustments]),
  });
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
  /* L-EM (ADR-0019 program 4): the era arm parses at the boundary — year and
     line MUST ride together (a bare year would invent availability the doc
     never dates; a bare line has no world to gate against). Absent pair ⇒
     `eraPlan` stays undefined and the door object below is EXACTLY today's,
     so all 31 shipped eraless wires byte-stand (falsifier: runner-level
     digest equality pinned in eraAvailability.test.ts). */
  if ((config.eraYear === undefined) !== (config.eraBundle === undefined)) {
    throw new Error(
      `scenario[BAD_ERA] at 'runScenario.eraYear': eraYear and eraBundle arm TOGETHER — got eraYear ${String(config.eraYear)}, eraBundle ${config.eraBundle === undefined ? "undefined" : config.eraBundle.id}`,
    );
  }
  let eraPlan: EraPlan | undefined;
  if (config.eraYear !== undefined && config.eraBundle !== undefined) {
    if (!Number.isSafeInteger(config.eraYear) || config.eraYear < 0) {
      throw new Error(`scenario[BAD_INT] at 'runScenario.eraYear': expected a safe integer ≥ 0, got ${String(config.eraYear)}`);
    }
    /* L-ER-T: the transition calendar rides the armed pair; every step
       wall (ascending / minute ≥ 1 / safe ints / entry shape) lives in
       parseEraTransitions — composeEraPlan is the authority BOTH this
       runner and tools/host call, so one set of walls guards both hosts. */
    eraPlan = composeEraPlan(
      config.eraBundle,
      config.eraYear,
      {
        ...(config.eraTransition === undefined ? {} : { transitions: config.eraTransition }),
        ...(config.eraPolicyCards === undefined ? {} : { policyCards: config.eraPolicyCards }),
      },
    );
  } else if (config.eraTransition !== undefined) {
    throw new Error(
      `scenario[BAD_ERA] at 'runScenario.eraTransition': eraTransition rides the eraYear+eraBundle pair — a bare calendar has no world to step (${String(config.eraTransition.length)} steps armed, eraYear ${String(config.eraYear)}, eraBundle ${config.eraBundle === undefined ? "undefined" : config.eraBundle.id})`,
    );
  } else if (config.eraPolicyCards !== undefined) {
    throw new Error(
      `scenario[BAD_ERA] at 'runScenario.eraPolicyCards': eraPolicyCards rides the eraYear+eraBundle pair — a bare card→tech map has no world year to grey against (${String(config.eraPolicyCards.size)} mappings armed, eraYear ${String(config.eraYear)}, eraBundle ${config.eraBundle === undefined ? "undefined" : config.eraBundle.id})`,
    );
  }
  /* L-SMR (ADR-0016 mechanic B): the sell catalog is money, so the seam
     parses it — the engine's own refusal (economy/sell.ts) only fires when a
     bad entry REACHES adjudication, i.e. possibly tick 50 into the run; a
     host misconfig must die before the first dice, mirroring the era pair-
     walls above. Non-negative bigint µ$ is the whole law (zero is legal and
     reads as no-denominator: the fold skips it exactly like a missing rate).
     EMPTY map ⇒ key-free absence downstream (the @984759b omission law), so
     the derivation collapses it to undefined rather than forwarding a
     present-but-empty key. */
  if (config.sellMarketRates !== undefined) {
    for (const [key, rate] of config.sellMarketRates) {
      if (typeof rate !== "bigint" || rate < 0n) {
        throw new Error(
          `scenario[BAD_MONEY] at 'runScenario.sellMarketRates': market rate for '${key}' must be a non-negative bigint of micro-USD, got ${String(rate)}`,
        );
      }
    }
  }
  const sellCatalog: ReadonlyMap<string, MoneyUnit> | undefined =
    config.sellMarketRates !== undefined && config.sellMarketRates.size > 0 ? config.sellMarketRates : undefined;
  /* L-V2 (money-at-the-end 2/3): the exit DECLARATION is seven-slug vocabulary
     owned by economy/valuation.ts (`VALUATION_EXIT_KINDS` — the campaign's
     CAMPAIGN_EXIT_KINDS mirrors it, drift-pinned campaign-side). The seam
     validates it NOW, before the first dice, even though only a winning
     sell-accepted close consumes it: a typo'd kind that reaches the close
     would silently pay nothing (the payout key just would not appear), and
     silence is the one answer a declaration never earns. Plain Error per the
     era/seedOffset/sellMarketRates precedent. The reserved-by-observability
     trio (ipo/management-buyout/wind-down) is refused EARLIER still — by the
     campaign parse wall (doc.ts RESERVED); by the time a string reaches this
     config it is one of the four sale-family kinds or a fresh lie about the
     vocabulary, and BOTH walls name all seven. */
  let declaredExitKind: ValuationExitKind | undefined;
  if (config.exitDeclaration !== undefined) {
    const kind = config.exitDeclaration.exitKind;
    if (!(VALUATION_EXIT_KINDS as readonly string[]).includes(kind)) {
      throw new Error(
        `scenario[BAD_ENUM] at 'runScenario.exitDeclaration': exitKind must be one of ${VALUATION_EXIT_KINDS.map((k) => `"${k}"`).join(", ")}, got ${JSON.stringify(kind)}`,
      );
    }
    declaredExitKind = kind as ValuationExitKind;
  }
  /* L-U2 (owner ruling 2026-10-19 (iv)): the policy BOOK is host config, so
     the seam parses it — the door's own refusals (unknown-card-hash) only
     fire at commit time; a mis-wired book must die BEFORE the first dice,
     the era/sellMarketRates/exitDeclaration wall posture. Three walls, all
     plain Error in the house `scenario[CODE] at 'path': detail` grammar
     (BAD_RULES joins the config-leg codes, NOT the doc-parse ScenarioError
     union — the wire never carries this leg). The loader already refuses
     dup hashes deck-side (bootRulesFromDeck); this wall guards the composed
     multi-deck book and mirrors the L-BR1 codec's both-positions naming.
     EMPTY entries REFUSE here even though `bootRulesFromDeck` legalizes an
     armed-but-silent deck: at THIS altitude passing `rules: {entries:[]}`
     can only be a host bug — the seam's presence must mean a book. */
  let rulesBook: Map<string, PolicyCard> | undefined;
  if (config.rules !== undefined) {
    const entries = config.rules.entries;
    if (entries.length === 0) {
      throw new Error(
        `scenario[BAD_RULES] at 'runScenario.rules': an empty book is a host bug — the loader legalizes armed-but-silent decks, but passing 'rules' with zero entries arms a door that can only refuse`,
      );
    }
    const seen = new Map<string, number>();
    const book = new Map<string, PolicyCard>();
    entries.forEach((entry, index) => {
      const first = seen.get(entry.hash);
      if (first !== undefined) {
        throw new Error(
          `scenario[BAD_RULES] at 'runScenario.rules.entries[${String(index)}]': duplicate card hash "${entry.hash}" at entries[${String(first)}] and entries[${String(index)}] — the book is a set keyed by hash`,
        );
      }
      seen.set(entry.hash, index);
      try {
        validatePolicyCard(entry.card);
      } catch (err) {
        throw new Error(
          `scenario[BAD_RULES] at 'runScenario.rules.entries[${String(index)}].card': ${err instanceof Error ? err.message : String(err)}`,
        );
      }
      book.set(entry.hash, entry.card);
    });
    rulesBook = book;
  }
  /* L-CP2: resolve the seat BEFORE the mint — noc-shift's three hands are a
   * minting fact (state.hands is the authority; the door's fallback mirrors
   * it, the pre-existing two-reading law at :845). Unarmed docs keep the
   * doc's own capacity byte-for-byte. PERSPECTIVE_V0 is exhaustive over the
   * parsed roster (doc.ts BAD_ENUM wall), so the lookup can never miss. */
  const perspectiveSpec: PerspectiveSpec | undefined =
    doc.perspective === undefined ? undefined : PERSPECTIVE_V0[doc.perspective.id];
  const effectiveHandCapacity = perspectiveSpec?.handCapacity ?? doc.limits.handCapacity;
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
    handCapacity: effectiveHandCapacity,
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
  const patienceArmed: DefaultPipelineConfig =
    corrupts === null
      ? pipelineConfig
      : Object.freeze({
          ...pipelineConfig,
          patienceModeByType: Object.freeze(
            Object.fromEntries(corrupts.tables.map((table) => [table, "corrupts" as const])),
          ),
          corruptionProbability: fromRatio(BigInt(corrupts.probabilityBps), 10_000n),
        });
  /* Rung 10: the composition dial. Unarmed (all pre-rung-10 wires) ⇒ the
   * config object is byte-the-same and createArrivalStep never rolls the
   * family die (defaults.ts:255 gates the roll on mix presence). */
  const familyMix = doc.limits.familyMix;
  const slotsConfig: DefaultPipelineConfig =
    familyMix === undefined
      ? patienceArmed
      : Object.freeze({ ...patienceArmed, familyMix: familyMix.weights });
  const dependencyEdges = dependencyEdgesFor(nodes);
  const rulePhase = createRulePhaseStep();
  /* Armed, the census moves from the LABEL path to the ROLL path: the
   * runner wraps the arrival slot (the sanctioned override — defaults.ts
   * :1354 "override any slot before handing the bundle to createTickDriver")
   * with a pure pass-through observer that counts each minted unit's rolled
   * family at the step's OUTPUT. Output-only is load-bearing: the same-tick
   * terminal sweep (driver.ts:957) purges completed units before the driver
   * ever returns state, so the arrival step's return value is the ONE place
   * the rolled identity is legible. The wrapper consumes no dice and returns
   * the inner step's frozen output untouched. */
  const arrivalsByFamily = new Map<string, number>();
  const baseSlots = createDefaultSlots(slotsConfig);
  const slots = Object.freeze({
    ...baseSlots,
    rulePhase: rulePhase.step,
    ...(familyMix === undefined
      ? {}
      : { arrival: observeMintedFamilies(baseSlots.arrival, arrivalsByFamily) }),
  });
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
  /* L-U2: the host-armed book resolves through a closure over the parsed
   * Map (a per-call binding, not the `let` — narrowing-safe and honest that
   * the door answers from the frozen-at-parse book). Unarmed, the door
   * object below is EXACTLY today's {handCapacity, attentionCost?, freeze?}
   * (byte-stand law), and the standing composition chain (perspective strip
   * → era grey, both spread AFTER this) layers over the key unchanged: a
   * stripping seat replaces the lookup with () => null (seat beats host),
   * an era plan greying a card id answers unknown-card-hash via the wrapper. */
  const rulesLookup =
    rulesBook === undefined
      ? undefined
      : ((book: Map<string, PolicyCard>) => (hash: string) => book.get(hash) ?? null)(rulesBook);
  const doorIntents: IntentDoorConfig = Object.freeze({
    handCapacity: Math.max(1, effectiveHandCapacity),
    ...(attentionLimit === undefined ? {} : { attentionCost: attentionLimit.cost }),
    ...(rulesLookup === undefined ? {} : { lookupPolicyCard: rulesLookup }),
    ...(freezeRow === undefined
      ? {}
      : {
          canPlaceDevice: (query: PlaceDeviceQuery) =>
            isUnderTheTape(freezeRow, query.context.tick) ? FREEZE_REJECTION : null,
          canAdjustPrice: (query: AdjustPriceQuery) =>
            isUnderTheTape(freezeRow, query.context.tick) ? FREEZE_REJECTION : null,
        }),
  });
  /* L-CP2 composition (the freeze pattern one rung further), FULL POWER per
   * L-PERS: an unarmed doc keeps the EXACT door object above; an armed doc
   * gets the perspective's general `canExecute` gate composed over it (all
   * nineteen verbs bannable — ADR-0019 program 1). A perspective ban
   * subsumes the freeze band STRUCTURALLY, not by tape replacement: the
   * gate fires before payment and before the per-verb validators, so a
   * banned verb's freeze validator is never even consulted; an unbanned
   * verb's freeze validator rides on untouched, by identity. */
  const perspectiveDoorIntents: IntentDoorConfig =
    perspectiveSpec === undefined ? doorIntents : applyPerspectiveToDoorConfig(doorIntents, perspectiveSpec);
  /* L-EM ERA-LAST stage (the perspective header's documented chain:
   * freeze tapes → perspective gate → era gate). Unarmed runs pass the
   * perspective object through BY IDENTITY — no clone, no re-freeze: eraless
   * is today's byte path. Armed, a plan that gates NO year grows no
   * canExecute key (the zero-ban rule), so an all-available era still
   * behaves identically; L-ER-T a stepping plan is armed from t0 and the
   * gate consults the as-of year per intent — the step is closure arithmetic
   * over the injected business clock, NOT state (door untouched). */
  const armedDoorIntents: IntentDoorConfig =
    eraPlan === undefined ? perspectiveDoorIntents : applyEraAvailabilityToDoorConfig(perspectiveDoorIntents, eraPlan);
  const driver = createTickDriver(
    slots,
    streamFor(runSeed, "root", 0),
    game0.context.clocks,
    doc.intents.length > 0 ? { intents: armedDoorIntents } : {},
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
            // Rung 7 sparse pass-through: absent keeps the input key-free
            // (registerContractEconomy writes ContractEconomy.priceKey only
            // when declared), so every shipped wire registers byte-ident.
            ...(spec.priceKey === undefined ? {} : { priceKey: spec.priceKey }),
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
    arrivalsByFamily, // rung 10: shared with the arrival-step observer
    intentsExecuted: 0,
    intentsRefused: 0,
    intentsExecutedByVerb: new Map(),
    intentsRefusedByVerb: new Map(),
    chargebacksApplied: 0,
    chargebackFeeRefusals: [],
    corruptions: 0,
    sellAccepted: 0,
    sellRefused: 0,
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
  /* ADR-0016 mechanic C (L-N3): mirror-mint of fastForward's cursor — the
     scenario lane's missions carry no Scale book at run start (v0 is
     hands-off autoplay; the door writes the book only in hosts feeding
     player intents), so this is `undefined` and the fold's opex path is
     IDENTITY — every shipped mission digest byte-ident. The seam exists
     so a scale-arming doc lights the charge without a third fold copy. */
  const warmthCursor = createWarmthCursor(game0);
  /* Owner-commissioned 2026-10-19: the rule-upkeep cursor — minted
     UNCONDITIONALLY (the ruleBook is required state; a mid-run door
     commit must find its meter already running). Shipped wires start an
     empty book and none schedule a `policy-card-commit` rail, so the fold
     derives null every roll and every mission digest byte-stands. */
  const upkeepCursor = createUpkeepCursor(game0);
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
      /* Rung 10: unarmed wires count the census by envelope LABEL (the
       * pre-rung path, byte-ident). Armed wires already counted at the ROLL
       * inside the observer — folding labels here too would double-count and
       * re-import the fiction the dial retires. */
      if (e.kind === "arrival" && familyMix === undefined) {
        countArrivalFamily(e.causeId, envelopes, acc.arrivalsByFamily);
      }
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
        /* ADR-0016 mechanic C: undefined cursor ⇒ identity opex path ⇒
           shipped mission digests byte-ident (see the mint above). */
        warmth: warmthCursor,
        /* The upkeep leg (owner-commissioned 2026-10-19): derived
           `rule-upkeep:mN` draft rides the same bounce census
           (`<topic>:opex:rule-upkeep:mN`), no new warn, no new refusal
           law — see the fold's upkeep section and the mint above. */
        upkeep: upkeepCursor,
        /* ADR-0016 mechanic B — the READ-LEG ships (Act III rung, wave 26): a
           `sell-offer` intent on the doc's rail books `game.sell` through the
           real door, tickFold's presence-gated spread feeds the fold's step-
           5.5 adjudication dice, and the verdict notices fold into
           observation.sellVerdicts — acceptance, the thing the door receipt
           never proved. Shipped wires carry no sell rail, so `game.sell`
           stays absent and every mission digest rides byte-identical. The
           sellMarketRates catalog leg (L-SMR, wave-27 review-minor #4) rides
           the HOST's run-config above — a world fact in the era posture. It
           may NEVER become doc data: the fold's anchor is either the host's
           honest market reading or the installed base (a registered
           contract's price-key MRC); a scenario-owned market feed would be
           sell fiction, not a read — the self-grading refusal law stands,
           relocated from the leg to its source. Absent/empty catalog ⇒ key
           omitted (key-free absence @984759b) ⇒ every shipped wire byte-stands. */
        ...(sellCatalog === undefined ? {} : { sellMarketRates: sellCatalog }),
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
    /* Rung 9: split the very same receipt stream per verb — the per-verb
       predicates read this census; totals above stay byte-identical. */
    for (const receipt of result.doorReceipts) {
      const verbCensus =
        receipt.outcome === "executed" ? acc.intentsExecutedByVerb : acc.intentsRefusedByVerb;
      verbCensus.set(receipt.verb, (verbCensus.get(receipt.verb) ?? 0) + 1);
    }
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
      // Verdict-observed exit grammar (I-AC3, wave-26): when the win line
      // carries a sell-accepted-above predicate, the terminal stopReason
      // NAMES it — `win:sell-accepted-above:<count>@<minute>` — because the
      // §9.9 exit ending selects on exactly that carrier
      // (campaign/endings.ts SELL_ACCEPTED_SHAPE @61a1c3b; the selection is
      // a pure read-projection, no new state). Every other doc keeps the
      // plain `win@<minute>` stamp byte-for-byte: no shipped wire in the
      // registry or the campaign carries the kind in its win line today,
      // so this branch is a no-op on all 31 missions and all prior arcs.
      const exitCarrier = doc.objectives.win.find((p) => p.kind === "sell-accepted-above");
      stopReason =
        exitCarrier === undefined
          ? `win@${game.context.minute}`
          : `win:${objectiveLine(exitCarrier)}@${game.context.minute}`;
      break;
    }
  }

  if (stopReason === "") stopReason = `timeout@${game.context.minute}`;
  const finalObs = lastObs;
  /* L-V2 (money-at-the-end 2/3) payout gate: the run WON, its win-line really
     carried the sell-accepted grammar (the OBSERVATION exists — the same
     static doc read that shaped `stopReason` above; outcome "won" already
     means every win predicate, carrier included, held at the boundary), AND
     the config DECLARED a kind. A declaration without the sale observation is
     narration (campaign/endings.ts), not payment; a sale observation without a
     declaration is an offer nobody promised to close — either way the report
     never grows the key. */
  const exitPayout =
    outcome === "won" &&
    declaredExitKind !== undefined &&
    doc.objectives.win.some((p) => p.kind === "sell-accepted-above")
      ? exitPayoutFor(doc, econ, contractsBook, game, finalObs, declaredExitKind)
      : undefined;

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
    // L-CP2 sparse-key law: unarmed docs never grow the `perspective` key.
    ...(perspectiveSpec === undefined
      ? {}
      : { perspective: perspectiveReportFor(perspectiveSpec, config.perspectiveView) }),
    // L-EM sparse-key law: eraless runs (all 31 shipped wires by default)
    // never grow the `era` key. L-ER-T: the `transitions` echo is sparse
    // WITHIN the era key — frozen-era arms keep the exact pilot record.
    ...(eraPlan === undefined
      ? {}
      : {
          era: Object.freeze({
            eraYear: eraPlan.eraYear,
            bundleId: eraPlan.bundleId,
            ...(eraPlan.transitions.length > 0 ? { transitions: eraPlan.transitions } : {}),
          }),
        }),
    // L-GUARD sparse-key law: funded runs never grow the `chargebackFeeRefusals` key.
    ...(acc.chargebackFeeRefusals.length > 0
      ? { chargebackFeeRefusals: Object.freeze([...acc.chargebackFeeRefusals]) }
      : {}),
    // L-V2 sparse-key law: undeclared runs (all 31 registry wires + every tour
    // chapter by construction) never grow the `exitPayout` key; the frozen
    // payout object rides ONLY on a declared, sell-observed win.
    ...(exitPayout === undefined ? {} : { exitPayout }),
    // L-U2 sparse-key law: an unarmed run (all 31 registry wires + every tour
    // chapter by construction) never grows the `rulesArmed` key; the echo is
    // the ARMED BOOK in host order (hash + card id), never the committed
    // subset — the seam reports what the door COULD resolve.
    ...(config.rules === undefined
      ? {}
      : {
          rulesArmed: Object.freeze(
            config.rules.entries.map((entry) =>
              Object.freeze({ hash: entry.hash, cardId: entry.card.id }),
            ),
          ),
        }),
  });
}
