/** §1.5 scenario documents — the boundary wall (parse, don't validate).
 *
 *  A ScenarioDoc is DECLARATIVE DATA: a strict-JSON record describing one
 *  authored one-off mission (board cast, contract roster, traffic profile,
 *  win/lose objectives, limits) that drives the EXISTING engine. Nothing
 *  here executes anything — `parseScenarioDoc` turns untrusted wire JSON
 *  into a deep-frozen, fully-trusted record, and every illegal shape dies
 *  at the wall with a `scenario[CODE] at 'path': detail` error (the house
 *  grammar, versus/unlocks/unattended family).
 *
 *  Closed-vocabulary law (loader-guard precedent): an unknown objective
 *  predicate kind, an unknown billing cycle, an unknown death cause, or an
 *  unexpected key throws at PARSE time. The runner downstream never
 *  re-checks — it reads trusted fields only.
 *
 *  State-freeze law: the doc adds NOTHING to GameState. Objectives are
 *  evaluated against an output-side observation accumulated by the runner;
 *  the digest of a scenario run is the digest of the same engine run the
 *  unattended lane would produce.
 */

import type { Contract, EntityId, PlayerVerb, RunSeed, SlaTerms, ThreatFamily } from "../types.ts";
import { asEntityId, asMoney, asRunSeed, PLAYER_VERBS } from "../types.ts";
import { FIXED_ZERO, fromInt } from "../kernel/fixed.ts";
import { MICROS_PER_MIN } from "../kernel/time.ts";
import type {
  UnattendedBoardCast,
  UnattendedEdgeSpec,
  UnattendedNodeSpec,
  UnattendedOpexDraft,
} from "../unattended/index.ts";
import { parseGuardList, type ParsedGuard } from "../unattended/index.ts";
import type { CompanyDeathCause, Covenant } from "../economy/index.ts";
import { parseFamilyWeightsTable } from "../waves/families.ts";
import type { FamilyShare } from "../waves/families.ts";
import {
  COMPANY_DEATH_CAUSES,
  COVENANT_METRIC_ERROR_BUDGET_HEALTH_BPS,
  COVENANT_METRIC_RUNWAY_MONTHS_BPS,
} from "../economy/index.ts";

/** Wire schema version stamped on every scenario document. */
export const SCENARIO_SCHEMA = "hh-scenario@1" as const;

/** Upper bound on the one-line mission brief (§1.5 blurb discipline). */
export const SCENARIO_BRIEF_MAX_CHARS = 280;

/** Long-weekend ceiling (§9.2 48 h) — the same cap the unattended lane
 *  warns past; here it is a hard parse wall because a scenario is a
 *  CLOSED authored mission, not an open-ended weekend. */
export const SCENARIO_MAX_MINUTES_CAP = 2880;

/** The twenty-nine legal objective predicates (§1.5 mission verbs, mapped
 *  onto observables that EXIST today — see objectives.ts for each reading).
 *  Rungs 1–3 of the vocab ladder (runner.test.ts header) shipped here:
 *  written-off-count, metrics-delta-over-window, family-labeled arrivals.
 *  Rungs 4–5 (wave four): the covenant-breach count reads the economy's
 *  latched `covenantBreachLog`; the reputation pair reads the §2.10 ledger's
 *  overall bps — both straight off the tick-final EconomyState.
 *  Channels ladder (wave five): the intent pairs count the door receipts
 *  this doc's `intents` schedule produced (executed + refused over the whole
 *  run); `chargebacks-*` counts the `signals.chargebacks` rows whose fees the
 *  lane actually posted; `postmortem-credits-*` sums `creditedBps` over the
 *  adjudicated `postMortemLog` (economy/postmortem.ts). Every new reading
 *  is zero (or 0n) while its channel is absent — the pre-channel byte shape
 *  of every existing mission is untouched.
 *  Wave five (conversions): the `corruption-*` pair counts the silent
 *  corruption channel — `TickResult.corruptions` marks earned by units whose
 *  type is armed through `limits.corrupts` (pipeline corrupts-patience mode,
 *  16c6add). Zero while no row names a table — every pre-channel mission's
 *  observation byte-shape is untouched.
 *  Rung 9 (wave eight): the intent four gained an optional `verb` dimension —
 *  `intents-executed-above {verb: "configure-node", count: 2}` reads the
 *  per-verb receipt census the runner folds off `TickResult.doorReceipts`, so
 *  a mission can name WHICH verb survived, not only how many receipts came
 *  back. A predicate with no `verb` keeps its exact whole-rail total reading;
 *  the vocabulary stays twenty-nine kinds — this is a dimension, not a kind. */
export const SCENARIO_PREDICATE_KINDS = Object.freeze([
  "survive-minutes",
  "cash-above",
  "cash-below",
  "churn-below",
  "churn-above",
  "written-off-below",
  "written-off-above",
  "invoices-settled",
  "bounces-below",
  "bounces-above",
  "metric-delta-over-window",
  "family-arrivals-below",
  "family-arrivals-above",
  "no-death-cause",
  "death-by-cause",
  "covenant-breached-count-below",
  "covenant-breached-count-above",
  "reputation-below",
  "reputation-above",
  "intents-executed-above",
  "intents-executed-below",
  "intents-refused-above",
  "intents-refused-below",
  "chargebacks-above",
  "chargebacks-below",
  "postmortem-credits-above",
  "postmortem-credits-below",
  "corruption-above",
  "corruption-below",
] as const);

/** The closed metric vocab a `metric-delta-over-window` predicate may name
 *  (local constant by design — the barrel stays name-frozen). */
const DELTA_METRICS = Object.freeze(["arrivals", "served", "bounced", "invoices-settled"] as const);

/** The closed arrival-label vocab: the five threat families plus the
 *  benign "organic" label the envelope type carries (types.ts
 *  WaveEnvelope.dominantFamily). Segments mint under these labels; the
 *  corpus profile inherits its labels from the shipped wave content. */
const ARRIVAL_FAMILIES = Object.freeze([
  "organic",
  "malicious",
  "human",
  "entropic",
  "systemic",
  "customerAsThreat",
] as const);

/** The closed covenant-metric vocab a wire `limits.covenants` row may name:
 *  exactly the two readouts the economy produces on its own
 *  (economy/runway.ts `buildCovenantReadoutsBps`). EBITDA stays NON-
 *  EXPRESSIBLE until a producer exists — the doc wall refuses the invention. */
const COVENANT_METRICS = Object.freeze([
  COVENANT_METRIC_RUNWAY_MONTHS_BPS,
  COVENANT_METRIC_ERROR_BUDGET_HEALTH_BPS,
] as const);

/** floorBps ceiling: the unbounded-runway sentinel (1,000,000 months of
 *  bps) is the largest honest reading on the wire — nothing above it can
 *  ever be met, so the wall refuses it. */
const COVENANT_FLOOR_BPS_MAX = 1_000_000_000_000;

/** Channels-ladder ceiling for `postmortem-credits-*`: the summed
 *  `creditedBps` of the adjudication log. One honest card earns 250 bps
 *  (cfg.reputation.honestPostmortemBps, RATIFIED 2026-10-16 (ADR-0015 #1)),
 *  so even a hundred
 *  filings stay far below this — the wall only refuses nonsense scales. */
const POSTMORTEM_CREDITS_BPS_MAX = 1_000_000_000;

export type ScenarioPredicateKind = (typeof SCENARIO_PREDICATE_KINDS)[number];

/** A death predicate may name one canonical cause (OD-25(a)) or "any". */
export type ScenarioDeathCause = CompanyDeathCause | "any";

/* ─────────────────────── trusted (parsed) shapes ─────────────────────── */

/** One closed objective condition, parsed + frozen. */
export type ObjectivePredicate =
  | { readonly kind: "survive-minutes"; readonly minutes: number }
  | { readonly kind: "cash-above" | "cash-below"; readonly microUsd: bigint }
  | { readonly kind: "churn-below" | "churn-above"; readonly count: number }
  | { readonly kind: "written-off-below" | "written-off-above"; readonly count: number }
  | { readonly kind: "invoices-settled"; readonly count: number }
  | { readonly kind: "bounces-below" | "bounces-above"; readonly count: number }
  | {
      readonly kind: "metric-delta-over-window";
      /** What to compare across the two windows (closed DELTA_METRICS vocab). */
      readonly metric: "arrivals" | "served" | "bounced" | "invoices-settled";
      /** Width W of each window, in sim-minutes. The predicate needs 2W of
       *  history before it can judge anything — before that it never holds. */
      readonly windowMinutes: number;
      /** Required improvement, whole percent: current ≥ baseline×(1+P/100).
       *  A dead-zero baseline counts as beaten by ANY current > 0 (growth
       *  from silence is a visible improvement; 0 vs 0 never holds). */
      readonly minDeltaPct: number;
    }
  | {
      readonly kind: "family-arrivals-below" | "family-arrivals-above";
      /** The envelope family label arrivals were minted under (closed
       *  ARRIVAL_FAMILIES vocab — organic + the five threat families). */
      readonly family: "organic" | ThreatFamily;
      readonly count: number;
    }
  | { readonly kind: "no-death-cause" | "death-by-cause"; readonly cause: ScenarioDeathCause }
  | {
      readonly kind: "covenant-breached-count-below" | "covenant-breached-count-above";
      /** Rows in EconomyState.covenantBreachLog — the latched bank-review
       *  ledger (economy/runway.ts): one row per NEW breach edge at a month
       *  roll; recovery clears the latch, a relapse logs again. */
      readonly count: number;
    }
  | {
      readonly kind: "reputation-below" | "reputation-above";
      /** Threshold on the §2.10 reputation ledger's overallBps (0..10,000
       *  scale — EconomyState.reputation.overallBps, the same authority
       *  that publishes `company::reputation`). */
      readonly bps: number;
    }
  | {
      readonly kind: "intents-executed-above" | "intents-executed-below";
      /** Whole-run count of `intents` rows whose door receipt came back
       *  "executed" (pipeline/intent-door.ts — one receipt per fed intent). */
      readonly count: number;
      /** Rung-9 dimension: restrict the count to receipts whose verb matches
       *  (closed PLAYER_VERBS vocab, BAD_ENUM at the wall). Absent = total
       *  over the rail, exactly the pre-rung-9 reading. */
      readonly verb?: PlayerVerb;
    }
  | {
      readonly kind: "intents-refused-above" | "intents-refused-below";
      /** Whole-run count of `intents` rows refused by the door — for any
       *  reason (hands-exhausted is the Sunday story; the vocab stays a
       *  plain count because the wall already refuses mis-shaped verbs). */
      readonly count: number;
      /** Rung-9 dimension: which verb's refusals to count (see the executed
       *  pair — same wall, same absent-means-total law). */
      readonly verb?: PlayerVerb;
    }
  | {
      readonly kind: "chargebacks-above" | "chargebacks-below";
      /** `signals.chargebacks` rows whose $-fee the lane POSTED (the engine
       *  fee is cfg-owned — cfg.fees.chargebackFeeMicroUsd — the wire only
       *  names WHICH contract disputes, never the amount). */
      readonly count: number;
    }
  | {
      readonly kind: "postmortem-credits-above" | "postmortem-credits-below";
      /** Σ creditedBps over the adjudicated post-mortem log
       *  (EconomyState.postMortemLog — blameless + attributable + first-filed
       *  rows credit cfg.reputation.honestPostmortemBps; ambiguous or
       *  refiled rows credit 0). Bps scale, same carrier as the reputation
       *  pair but NOT clamped to 10,000 — credits accumulate per card. */
      readonly bps: number;
    }
  | {
      readonly kind: "corruption-above" | "corruption-below";
      /** Whole-run count of `CorruptOutcome`s the driver reported
       *  (TickResult.corruptions) — responses completed past patience and
       *  silently corrupted instead of bouncing. Non-zero only while the
       *  doc arms `limits.corrupts`; the corrupts mode never bounces, which
       *  IS the green-dashboard lie this pair scores through. */
      readonly count: number;
    };

/** One signed contract of the mission: the wire fields the author names
 *  plus the fully-minted Contract record the economy registers verbatim
 *  (tcv/acv/SLA minted to the proven unattended fixture shape — derived,
 *  never author-editable, until the content lane owns contract copy). */
export interface ScenarioContractSpec {
  readonly id: string;
  readonly contract: Contract;
  /** Renewal-retention matrix index for a false-autoRenew cliff. */
  readonly termMonths: number;
  /** SLA commitment bps at registration (author-visible, digest-relevant). */
  readonly commitmentBps: bigint;
  /** Rung 7: `<kind>:<id>` slot in the Iron Board's price book. Absent (the
   *  shipped default) the contract bills at authored prices forever; present,
   *  an adjust-price intent on this key bends this contract's churn/cliff/
   *  dunning dice through the economy's elasticity lane. */
  readonly priceKey?: string;
}

/** Hand-authored traffic: a piecewise plateau over sim-minutes.
 *  `segments` is total — the first starts at minute 0, each later one
 *  opens where its predecessor closed; rate 0 is silence (no envelope
 *  that minute). `family` (rung-3 ladder vocab, default "organic") stamps
 *  the envelope's dominantFamily so the family-arrivals predicates can
 *  tell a flood's mix apart; absent keeps the pre-rung-3 byte shape. */
export interface ScenarioSegmentsTraffic {
  readonly profile: "segments";
  readonly tableId: string;
  readonly segments: readonly {
    readonly fromMinute: number;
    readonly ratePerMin: number;
    readonly family?: "organic" | ThreatFamily;
  }[];
}

/** Corpus traffic: a storm schedule that NAMES a shipped
 *  `packages/content/waves/` slice by tableId (the file stem, e.g.
 *  "g1-shared-web-first-quarter") and picks waves by number. The rates,
 *  families, and telegraphs are the content's, never re-typed here —
 *  `corpus.ts` resolves each wave through the shipped
 *  parseForeignWaveSlice → planWave pipeline (the same authority
 *  `fastForward.ts` uses), so engine content edits flow into scenarios.
 *  `baselineRatePerMin` is the calm under the storm (the scenario's own
 *  organic trickle, minted as one plateau envelope like segments do);
 *  `waveStartMinute` is where the wave schedule begins (default 2 —
 *  fastForward's cursor law). */
export interface ScenarioCorpusTraffic {
  readonly profile: "corpus";
  readonly tableId: string;
  /** Shipped wave numbers to schedule, strictly ascending, ≥ 1. */
  readonly waves: readonly number[];
  readonly waveStartMinute: number;
  readonly baselineRatePerMin: number;
}

/** Traffic is either hand-authored plateaus or a corpus citation —
 *  exactly one form on the wire (`segments` XOR `waves` present). */
export type ScenarioTraffic = ScenarioSegmentsTraffic | ScenarioCorpusTraffic;

/* ─────────────────── channels ladder — input channels ─────────────────── */

/** The wire grammar a scenario author must satisfy per verb: EXACTLY the
 *  door's own VERB_ARG_SHAPES (pipeline/intent-door.ts), copied here field
 *  for field, with the door's `bigint` money carrier widened to "money" so
 *  the wire stays JSON (digit strings parse to bigint at the wall). Every
 *  listed field is REQUIRED on the wire — the door rejects an absent field
 *  with a THROW (M2 law), so the wall refuses it too; "null|string"-style
 *  shapes demand an explicit null, never a silent omission.
 *
 *  This table is a MIRROR, pinned falsifiably:
 *  __tests__/intentGrammar.test.ts reads the door's source block with
 *  node:fs and refuses drift in either direction. If the door's grammar
 *  changes, that test goes red before any mission can drift. */
type IntentArgWire = "string" | "null|string" | "number" | "null|number" | "money" | "null|money";

/* Exported for the fs drift-pin in __tests__/intentGrammar.test.ts — the
   barrel stays shut (doc.ts-level export = api-verify-invisible by the
   runner.test.ts precedent). */
export const SCENARIO_INTENT_ARG_SHAPES: Readonly<Record<PlayerVerb, Readonly<Record<string, IntentArgWire>>>> = Object.freeze({
  "place-device": Object.freeze({ nodeId: "string", deviceKind: "string", template: "null|string" }),
  "connect-ports": Object.freeze({ relation: "string", from: "string", to: "string", slot: "null|string" }),
  "disconnect-drain": Object.freeze({ edgeId: "string" }),
  "configure-node": Object.freeze({ nodeId: "string", inspectionDepth: "null|string", shedOrder: "null|string" }),
  "policy-card-commit": Object.freeze({ cardHash: "string" }),
  "shed-load": Object.freeze({ nodeId: "string", qosClassId: "null|string" }),
  "communicate": Object.freeze({ target: "null|string", note: "string" }),
  "toggle-speed": Object.freeze({ speedX: "number" }),
  "adjust-price": Object.freeze({
    targetKind: "string",
    targetId: "string",
    newPriceMicroUsd: "money",
    effectiveAtBusinessMinute: "null|number",
  }),
  "shield-node": Object.freeze({
    targetNodeId: "string",
    effectiveAtBusinessMinute: "null|number",
  }),
  "scale-node": Object.freeze({
    targetNodeId: "string",
    reservedSlots: "number",
    effectiveAtBusinessMinute: "null|number",
  }),
  "maintain-node": Object.freeze({
    targetNodeId: "string",
    openAtBusinessMinute: "null|number",
    closeAtBusinessMinute: "number",
  }),
  "schedule-window": Object.freeze({
    targetNodeId: "string",
    openAtBusinessMinute: "null|number",
    closeAtBusinessMinute: "number",
  }),
  "sell-offer": Object.freeze({
    targetKind: "string",
    targetId: "string",
    offerPriceMicroUsd: "money",
    termMonths: "number",
    effectiveAtBusinessMinute: "null|number",
  }),
  "negotiate-terms": Object.freeze({
    targetKind: "string",
    targetId: "string",
    tone: "string",
    concessionMicroUsd: "null|money",
    termMonthsExtension: "null|number",
    effectiveAtBusinessMinute: "null|number",
  }),
  "isolate-node": Object.freeze({
    targetNodeId: "string",
    effectiveAtBusinessMinute: "null|number",
    releaseAtBusinessMinute: "null|number",
  }),
  "throttle-node": Object.freeze({
    targetNodeId: "string",
    cutSlots: "number",
    effectiveAtBusinessMinute: "null|number",
    releaseAtBusinessMinute: "null|number",
  }),
  "restart-node": Object.freeze({
    targetNodeId: "string",
    dropQueued: "string",
    effectiveAtBusinessMinute: "null|number",
    releaseAtBusinessMinute: "number",
  }),
  "reclaim-node": Object.freeze({
    targetNodeId: "string",
    effectiveAtBusinessMinute: "null|number",
  }),
});

/** One scheduled player verb on the door's rail. The runner stamps seq =
 *  the row's index in the doc (globally unique — the door's M4 duplicate
 *  (tick,seq) law can never bite an authored schedule) and feeds the row
 *  into TickInputs.externalIntents exactly once, at atTick. */
export interface ScenarioIntent {
  /** Macro tick of submission (1-based, ≤ limits.maxSimMinutes — the door
   *  numbers one tick per sim minute, same clock the opex rows ride). */
  readonly atTick: number;
  readonly verb: PlayerVerb;
  /** Door-shaped args, parsed + frozen (money fields already bigint). */
  readonly args: Readonly<Record<string, string | number | null | bigint>>;
}

/** A blameless/blame adjudication card: filed after an incident, credited
 *  only when attributable (changesInFlight ≤ cfg.postMortem's ceiling) and
 *  never refiled. `cause` is RESOLVED at the wall: either an explicit slug
 *  or derived from a declared `signals.majorIncidents` row. */
export interface ScenarioPostmortemRow {
  readonly atMinute: number;
  readonly cause: string;
  readonly style: "blameless" | "blame";
  readonly changesInFlight: number;
}

/** The host-reported economy signals this mission folds into the money
 *  lane (economy/tick.ts input fields that already exist — the scenario
 *  composes them per minute with the exported primitives; nothing here
 *  invents engine behavior):
 *  - majorIncidents  → EconomyTickIn.majorIncidents (step 12.5, −500 bps
 *    each; halved damage once the honest-host floor stands)
 *  - honestPostmortems → EconomyTickIn.honestPostmortems (raw assertion
 *    channel: signal only, never a log row)
 *  - postmortems     → EconomyTickIn.postMortems (adjudicated filings —
 *    the ONLY producer of postMortemLog rows the credits predicate reads)
 *  - chargebacks     → the step-8.5 fee composition (posted red entry +
 *    chargeback signal; fee amount is cfg-owned, wire names the victim). */
export interface ScenarioSignals {
  readonly majorIncidents: readonly { readonly atMinute: number; readonly count: number }[];
  readonly honestPostmortems: readonly { readonly atMinute: number; readonly cause: string }[];
  readonly postmortems: readonly ScenarioPostmortemRow[];
  readonly chargebacks: readonly { readonly atMinute: number; readonly contractId: EntityId }[];
}

/** The cause id a declared major incident carries on every engine channel
 *  (signals, filings, ledger rows) — one mint grammar, shared by the wall's
 *  reference check and the runner's fold. */
export function scenarioIncidentCause(atMinute: number, index: number): string {
  return `scenario:incident:${atMinute}:${index}`;
}

/** Everything the run is bounded by. */
export interface ScenarioLimits {
  readonly maxSimMinutes: number;
  /** Free-cash opening balance posted once at minute 0. */
  readonly initialFreeMicroUsd: bigint;
  /** Scheduled burns (payroll-like), sorted by (atMinute, memo). */
  readonly opex: readonly UnattendedOpexDraft[];
  readonly dunningEngineOwned: boolean;
  readonly handCapacity: number;
  /** Parsed catastrophe guards (CLOSED unattended vocabulary, passthrough). */
  readonly guards: readonly ParsedGuard[];
  /** Ladder rung 4: the bank's cards (economy/runway.ts Covenant records),
   *  seeded into the money lane's state once at mint. Empty = no covenant
   *  review ever runs (the pre-rung-4 byte shape). */
  readonly covenants: readonly Covenant[];
  /** Wave five: the silent corruption arm (pipeline corrupts-patience mode,
   *  16c6add). Null (the pre-channel byte shape) unless the wire names it;
   *  `tables` are unit TYPES — the arrival step stamps `type = tableId`, so
   *  a segments mission arms its own traffic tableId and a corpus mission
   *  arms `waves/<stem>`. `patienceMin` re-arms the lane's default patience
   *  (queue-age past which a completion is exhausted-and-corrupted, never
   *  bounced); `probabilityBps` is the engine's damage dial — 10,000 (the
   *  default) means certainty, which SKIPS the dice, so a corrupted census
   *  is pure arithmetic (seed-free witnesses). */
  readonly corrupts: {
    readonly tables: readonly string[];
    readonly patienceMin: number;
    readonly probabilityBps: number;
  } | null;
  /** Ladder rung 6: attention denominations (L2 lane @eff5694). A CLOSED
   *  row — `capacity` is the pool size the runner mints (tokens opened via
   *  triage-window entries at business minute 0: the handover queue IS the
   *  triage window), and `cost` passes verbatim into the door's
   *  `attentionCost` vocabulary (every listed verb 0|1; an absent verb is
   *  untaxed). The key never materializes when unarmed — every pre-rung-6
   *  doc object keeps its exact key set. */
  readonly attention?: {
    readonly capacity: number;
    readonly cost: Readonly<Partial<Record<PlayerVerb, 0 | 1>>>;
  };
  /** Ladder rung 8: the change-freeze band (spec :3625 hazard tape). Inside
   *  the INCLUSIVE window [fromMinute, toMinute] on the rail's tick clock,
   *  the runner answers the door's two host-validator seams (`canPlaceDevice`,
   *  `canAdjustPrice`) with a refusal — deploys and price moves die under the
   *  tape; configure/shed/communicate stay legal. Absent = no validators are
   *  wired at all (pre-rung-8 byte shape). */
  readonly freeze?: {
    readonly fromMinute: number;
    readonly toMinute: number;
  };
  /** Ladder rung 10: the traffic-composition dial — the bundle-side
   *  `threats.familyWeights` table (waves/families.ts authority) put on the
   *  scenario wire. CLOSED row `familyMix {weights}`: weights is the five-key
   *  table (customerAsThreat / entropic / human / malicious / systemic) in
   *  plain-INTEGER micro-shares (0..1,000,000 — the same domain as
   *  FamilyShare.shareMicro), sum within ±1% of 1,000,000. The wire carries
   *  NO floats (canary determinism law; the money rows are integer µ$ for the
   *  same reason): the wall hands each share to the authority as a Fixed
   *  Q16.16 bigint — the ±15.26 µ Fixed granularity is re-normalised by the
   *  authority's largest-remainder law and cannot move a census witness by
   *  more than one unit in a thousand. All five keys required, non-null,
   *  unknown keys refused — that grammar is the authority's, reused WHOLE
   *  (zero duplicate law). Zero buckets are honest absences and drop out.
   *  ENGINE TRUTH — the dial's honest v0 scope: all five families the table
   *  can name map to ADVERSARIAL intents (familyToIntent → malicious /
   *  human-error / entropic / systemic / abuser), so the dial controls WHICH
   *  adversarial flavor dominates the stream; it can never express benign
   *  traffic. The benign "organic" arm exists only on the unarmed path, as
   *  the envelope labels. Armed wires therefore count the family census at
   *  the ROLL (runner observes the arrival step's output units), not the
   *  label. Absent ⇒ no family die is ever rolled and every pre-rung-10 wire
   *  keeps its exact key set and byte shape. */
  readonly familyMix?: {
    readonly weights: readonly FamilyShare[];
  };
}

/** The trusted, deep-frozen scenario document. */
export interface ScenarioDoc {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly name: string;
  readonly brief: string;
  /** Verbatim §1.5 heading anchor, e.g. "§1.5 The Long Weekend / …". */
  readonly specRef: string;
  /** Informational hosting_game.md line of the heading (never load-bearing). */
  readonly specLine: number | null;
  readonly board: UnattendedBoardCast;
  readonly contracts: readonly ScenarioContractSpec[];
  readonly traffic: ScenarioTraffic;
  /** Channels ladder: the scheduled door rail (empty = the door never
   *  sees a fed intent — every existing mission's byte shape). */
  readonly intents: readonly ScenarioIntent[];
  /** Channels ladder: host-reported economy signals folded per minute
   *  (all rows empty = the lane composes nothing — byte shape untouched). */
  readonly signals: ScenarioSignals;
  readonly objectives: {
    readonly win: readonly ObjectivePredicate[];
    readonly lose: readonly ObjectivePredicate[];
  };
  readonly limits: ScenarioLimits;
}

/* ─────────────────────────── the error family ─────────────────────────── */

export type ScenarioErrorCode =
  | "BAD_RECORD"
  | "BAD_VERSION"
  | "BAD_ID"
  | "BAD_NAME"
  | "BAD_BRIEF"
  | "BAD_SPEC"
  | "BAD_BOARD"
  | "BAD_CONTRACT"
  | "BAD_TRAFFIC"
  | "BAD_OBJECTIVES"
  | "BAD_PREDICATE"
  | "UNKNOWN_KIND"
  | "BAD_LIMITS"
  | "BAD_MONEY"
  | "BAD_INT"
  | "BAD_ENUM"
  | "BAD_GUARDRAIL"
  | "BAD_INTENT"
  | "BAD_SIGNAL"
  | "CORPUS_UNRESOLVED"
  | "DUPLICATE";

export class ScenarioError extends Error {
  readonly code: ScenarioErrorCode;
  readonly path: string;

  constructor(code: ScenarioErrorCode, path: string, message: string) {
    super(`scenario[${code}] at '${path}': ${message}`);
    this.name = "ScenarioError";
    this.code = code;
    this.path = path;
  }
}

function bad(code: ScenarioErrorCode, path: string, message: string): never {
  throw new ScenarioError(code, path, message);
}

/* ─────────────────────────── wire readers ─────────────────────────── */

function asRecord(value: unknown, path: string, code: ScenarioErrorCode): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    bad(code, path, `expected an object, got ${Array.isArray(value) ? "array" : typeof value}`);
  }
  return value as Record<string, unknown>;
}

function readString(src: Record<string, unknown>, key: string, path: string, code: ScenarioErrorCode): string {
  const raw = src[key];
  if (typeof raw !== "string" || raw.length === 0) {
    bad(code, `${path}.${key}`, `expected a non-empty string, got ${typeof raw}`);
  }
  return raw;
}

function readInt(
  src: Record<string, unknown>,
  key: string,
  path: string,
  code: ScenarioErrorCode,
  min: number,
  max: number,
): number {
  const raw = src[key];
  if (typeof raw !== "number" || !Number.isSafeInteger(raw) || raw < min || raw > max) {
    bad(code, `${path}.${key}`, `expected a safe integer in [${min},${max}], got ${String(raw)}`);
  }
  return raw;
}

function optInt(
  src: Record<string, unknown>,
  key: string,
  path: string,
  code: ScenarioErrorCode,
  min: number,
  max: number,
  fallback: number,
): number {
  if (src[key] === undefined) return fallback;
  return readInt(src, key, path, code, min, max);
}

/** Money on the wire: a non-negative safe integer, or its decimal string
 *  (JSON has no bigint — the loader-boundary convention). */
export function parseMoneyWire(value: unknown, path: string, code: ScenarioErrorCode): bigint {
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || value < 0) {
      bad("BAD_MONEY", path, `expected a non-negative safe integer µ$, got ${String(value)}`);
    }
    return BigInt(value);
  }
  if (typeof value === "string" && /^\d+$/.test(value)) return BigInt(value);
  bad("BAD_MONEY", path, `expected µ$ as a non-negative integer or digit string, got ${typeof value}`);
}

function readBool(src: Record<string, unknown>, key: string, path: string, code: ScenarioErrorCode, fallback: boolean): boolean {
  const raw = src[key] ?? fallback;
  if (typeof raw !== "boolean") bad(code, `${path}.${key}`, `expected a boolean, got ${typeof raw}`);
  return raw;
}

/** Closed-enemy of unexpected keys: every field of an authored record must
 *  be known, or the document is refused (typos are bugs, not defaults). */
function requireKeys(
  src: Record<string, unknown>,
  allowed: readonly string[],
  required: readonly string[],
  path: string,
  code: ScenarioErrorCode,
): void {
  for (const key of required) {
    if (src[key] === undefined) bad(code, `${path}.${key}`, "required field is missing");
  }
  for (const key of Object.keys(src)) {
    if (!allowed.includes(key)) bad(code, `${path}.${key}`, `unknown field — legal fields: ${allowed.join(", ")}`);
  }
}

/* ─────────────────────────── section parsers ─────────────────────────── */

const NODE_FIELDS = ["id", "kind", "slots", "serviceTimeUs", "dependencyNodeId", "inspectionDepth"] as const;
const INSPECTION_DEPTHS = ["pass-through", "sample-1-in-20", "inspect", "challenge"] as const;

function parseNode(raw: unknown, path: string): UnattendedNodeSpec {
  const src = asRecord(raw, path, "BAD_BOARD");
  requireKeys(src, NODE_FIELDS, ["id", "slots", "serviceTimeUs"], path, "BAD_BOARD");
  const kind = src.kind;
  if (kind !== undefined && typeof kind !== "string") bad("BAD_BOARD", `${path}.kind`, `expected a string, got ${typeof kind}`);
  const dependencyNodeId = src.dependencyNodeId;
  if (dependencyNodeId !== undefined && dependencyNodeId !== null && typeof dependencyNodeId !== "string") {
    bad("BAD_BOARD", `${path}.dependencyNodeId`, "expected a string or null");
  }
  const inspectionDepthRaw = src.inspectionDepth ?? "inspect";
  if (typeof inspectionDepthRaw !== "string" || !(INSPECTION_DEPTHS as readonly string[]).includes(inspectionDepthRaw)) {
    bad("BAD_ENUM", `${path}.inspectionDepth`, `expected one of ${INSPECTION_DEPTHS.join(", ")}, got ${String(src.inspectionDepth)}`);
  }
  const inspectionDepth = inspectionDepthRaw as NonNullable<UnattendedNodeSpec["inspectionDepth"]>;
  const serviceTimeUs = parseMoneyWire(src.serviceTimeUs, `${path}.serviceTimeUs`, "BAD_BOARD");
  if (serviceTimeUs < 1n) bad("BAD_BOARD", `${path}.serviceTimeUs`, "service time must be ≥ 1 µs");
  return Object.freeze({
    id: readString(src, "id", path, "BAD_BOARD"),
    ...(typeof kind === "string" ? { kind } : {}),
    slots: readInt(src, "slots", path, "BAD_BOARD", 1, 1_000_000),
    serviceTimeUs,
    ...(typeof dependencyNodeId === "string" ? { dependencyNodeId } : {}),
    inspectionDepth,
  });
}

const EDGE_FIELDS = ["id", "relation", "from", "to", "slot"] as const;
const BOARD_RELATIONS = ["data", "power", "control", "trust"] as const;

function parseEdge(raw: unknown, path: string): UnattendedEdgeSpec {
  const src = asRecord(raw, path, "BAD_BOARD");
  requireKeys(src, EDGE_FIELDS, ["id", "relation", "from", "to"], path, "BAD_BOARD");
  const relation = readString(src, "relation", path, "BAD_BOARD");
  if (!(BOARD_RELATIONS as readonly string[]).includes(relation)) {
    bad("BAD_ENUM", `${path}.relation`, `expected one of ${BOARD_RELATIONS.join(", ")}, got ${relation}`);
  }
  const slot = src.slot;
  if (slot !== undefined && slot !== null && typeof slot !== "string") bad("BAD_BOARD", `${path}.slot`, "expected a string or null");
  return Object.freeze({
    id: readString(src, "id", path, "BAD_BOARD"),
    relation: relation as UnattendedEdgeSpec["relation"],
    from: readString(src, "from", path, "BAD_BOARD"),
    to: readString(src, "to", path, "BAD_BOARD"),
    ...(typeof slot === "string" ? { slot } : {}),
  });
}

function parseBoard(raw: unknown, path: string): UnattendedBoardCast {
  const src = asRecord(raw, path, "BAD_BOARD");
  requireKeys(src, ["nodes", "edges"], ["nodes"], path, "BAD_BOARD");
  if (!Array.isArray(src.nodes) || src.nodes.length === 0) bad("BAD_BOARD", `${path}.nodes`, "expected a non-empty array");
  if (src.edges !== undefined && !Array.isArray(src.edges)) bad("BAD_BOARD", `${path}.edges`, "expected an array");
  const nodes = Object.freeze((src.nodes as readonly unknown[]).map((n, i) => parseNode(n, `${path}.nodes[${i}]`)));
  const edges = Object.freeze(((src.edges ?? []) as readonly unknown[]).map((e, i) => parseEdge(e, `${path}.edges[${i}]`)));
  const seen = new Set<string>();
  for (const node of nodes) {
    if (seen.has(node.id)) bad("DUPLICATE", `${path}.nodes`, `duplicate node id "${node.id}"`);
    seen.add(node.id);
  }
  const edgeIds = new Set<string>();
  for (const edge of edges) {
    if (edgeIds.has(edge.id)) bad("DUPLICATE", `${path}.edges`, `duplicate edge id "${edge.id}"`);
    edgeIds.add(edge.id);
    if (!seen.has(edge.from) || !seen.has(edge.to)) {
      bad("BAD_BOARD", `${path}.edges`, `edge "${edge.id}" names an unknown endpoint (${edge.from} -> ${edge.to})`);
    }
  }
  for (const node of nodes) {
    if (node.dependencyNodeId !== undefined && node.dependencyNodeId !== null && !seen.has(node.dependencyNodeId)) {
      bad("BAD_BOARD", `${path}.nodes`, `node "${node.id}" depends on unknown node "${String(node.dependencyNodeId)}"`);
    }
  }
  return Object.freeze({ nodes, edges });
}

/* ── contracts ── */

const CONTRACT_FIELDS = [
  "id",
  "customer",
  "bundleId",
  "mrcMicroUsd",
  "termStartMin",
  "termEndMin",
  "termMonths",
  "billingCycle",
  "autoRenew",
  "commitmentBps",
  "priceKey",
] as const;

/** Price-key kinds a contract row may declare (rung 7). DRIFT PIN, not an
 *  import: scenario sits above the economy leaf and must not reach into
 *  elasticity.ts internals; this mirror is held honest by
 *  __tests__/pricingRung.test.ts reading `PRICE_KEY_KINDS` out of
 *  src/economy/elasticity.ts:60 by source, same law as the door-verb mirror
 *  in SCENARIO_INTENT_ARG_SHAPES (intentGrammar.test.ts). */
const PRICE_KEY_KINDS = Object.freeze(["plan", "contract-class", "sku"] as const);

/** Parse the rung-7 `<kind>:<id>` price-key shape exactly as the door's
 *  parsePriceOverrideKey does: split at the FIRST colon, closed kind vocab,
 *  non-empty id. Returns the wire string verbatim — registration hands it to
 *  RegisterContractInput.priceKey, where economy re-validates it anyway. */
function parsePriceKeyWire(raw: unknown, path: string): string {
  if (typeof raw !== "string") bad("BAD_CONTRACT", path, "priceKey must be a '<kind>:<id>' string");
  const colon = raw.indexOf(":");
  if (colon <= 0 || colon === raw.length - 1) {
    bad("BAD_CONTRACT", path, `"${raw}" is not a '<kind>:<id>' price key`);
  }
  const kind = raw.slice(0, colon);
  if (!(PRICE_KEY_KINDS as readonly string[]).includes(kind)) {
    bad("BAD_ENUM", path, `priceKey kind "${kind}" is not one of ${PRICE_KEY_KINDS.join(", ")}`);
  }
  return raw;
}

/** Contract's inline billing-cycle union narrowed to the three cycles the
 *  economy's billing lane actually meters (weekly/quarterly remain legal in
 *  the Contract type but unwired for authored missions until they exist). */
type ScenarioBillingCycle = Contract["billingCycle"];
const BILLING_CYCLES = Object.freeze(["hourly", "monthly", "annual"] as const);

const ID_SHAPE = /^[a-z0-9][a-z0-9-]*$/;

/** SLA mint — the proven unattended fixture shape (TEST_SLA): a full
 *  commitment with zero credits, so v0 scenarios measure churn/cash, not
 *  SLA payouts. autoRenew is the cliff lever and rides the author's word. */
function mintSla(autoRenew: boolean): SlaTerms {
  return Object.freeze({
    uptimeTarget: fromInt(1),
    responseBudgetUs: 1_000_000n,
    creditRate: FIXED_ZERO,
    creditCap: asMoney(0n),
    claimWindowUs: 60n * MICROS_PER_MIN,
    autoRenew,
    noticePeriodMin: 0,
    threeBreachExitRight: false,
  });
}

function parseContract(raw: unknown, path: string): ScenarioContractSpec {
  const src = asRecord(raw, path, "BAD_CONTRACT");
  requireKeys(src, CONTRACT_FIELDS, ["id", "mrcMicroUsd", "termEndMin", "billingCycle"], path, "BAD_CONTRACT");
  const id = readString(src, "id", path, "BAD_CONTRACT");
  if (!ID_SHAPE.test(id)) bad("BAD_CONTRACT", `${path}.id`, `"${id}" is not a [a-z0-9-] slug`);
  const customer = src.customer;
  if (customer !== undefined && typeof customer !== "string") bad("BAD_CONTRACT", `${path}.customer`, "expected a string");
  const bundleId = src.bundleId;
  if (bundleId !== undefined && (typeof bundleId !== "string" || bundleId.length === 0)) {
    bad("BAD_CONTRACT", `${path}.bundleId`, "expected a non-empty string");
  }
  const mrcMicroUsd = parseMoneyWire(src.mrcMicroUsd, `${path}.mrcMicroUsd`, "BAD_CONTRACT");
  const billingCycleRaw = readString(src, "billingCycle", path, "BAD_CONTRACT");
  if (!(BILLING_CYCLES as readonly string[]).includes(billingCycleRaw)) {
    bad("BAD_ENUM", `${path}.billingCycle`, `expected one of hourly, monthly, annual, got ${billingCycleRaw}`);
  }
  const termStartMin = optInt(src, "termStartMin", path, "BAD_CONTRACT", 0, 1_000_000, 0);
  const termEndMin = readInt(src, "termEndMin", path, "BAD_CONTRACT", 1, 1_000_000);
  if (termEndMin <= termStartMin) {
    bad("BAD_CONTRACT", `${path}.termEndMin`, `term end m${termEndMin} must be after term start m${termStartMin}`);
  }
  const termMonths = optInt(src, "termMonths", path, "BAD_CONTRACT", 1, 120, 12);
  const autoRenew = readBool(src, "autoRenew", path, "BAD_CONTRACT", false);
  const commitmentBpsRaw = src.commitmentBps;
  let commitmentBps = 9_990n;
  if (commitmentBpsRaw !== undefined) {
    const n = readInt(src, "commitmentBps", path, "BAD_CONTRACT", 0, 10_000);
    commitmentBps = BigInt(n);
  }
  const priceKeyRaw = src.priceKey;
  const priceKey =
    priceKeyRaw === undefined ? undefined : parsePriceKeyWire(priceKeyRaw, `${path}.priceKey`);
  const contract: Contract = Object.freeze({
    id: asEntityId(id),
    customerEntityId: asEntityId(typeof customer === "string" ? customer : `customer:${id}`),
    bundleId: typeof bundleId === "string" ? bundleId : "shared-web",
    mrcMicroUsd: asMoney(mrcMicroUsd),
    tcvMicroUsd: asMoney(mrcMicroUsd * 12n),
    acvMicroUsd: asMoney(mrcMicroUsd * 12n),
    termStartMin,
    termEndMin,
    billingCycle: billingCycleRaw as ScenarioBillingCycle,
    sla: mintSla(autoRenew),
    routingLocks: Object.freeze([]),
    shedImmunityClassId: null,
    allocations: Object.freeze([]),
  });
  // Sparse law (rung 7): an unarmed row never materializes the key — every
  // shipped wire parses to a byte-ident spec, and the register input below
  // stays key-free so contract records hash exactly as before.
  return Object.freeze({
    id,
    contract,
    termMonths,
    commitmentBps,
    ...(priceKey === undefined ? {} : { priceKey }),
  });
}

/* ── traffic ── */

const TRAFFIC_FIELDS = ["tableId", "segments", "waves", "waveStartMinute", "baselineRatePerMin"] as const;

function parseTraffic(raw: unknown, path: string): ScenarioTraffic {
  const src = asRecord(raw, path, "BAD_TRAFFIC");
  for (const key of Object.keys(src)) {
    if (!TRAFFIC_FIELDS.includes(key as (typeof TRAFFIC_FIELDS)[number])) {
      bad("BAD_TRAFFIC", `${path}.${key}`, `unknown field — legal fields: ${TRAFFIC_FIELDS.join(", ")}`);
    }
  }
  const tableId = readString(src, "tableId", path, "BAD_TRAFFIC");
  const hasSegments = src.segments !== undefined;
  const hasWaves = src.waves !== undefined;
  if (hasSegments && hasWaves) {
    bad("BAD_TRAFFIC", path, "traffic names both `segments` and `waves` — pick one profile: hand-authored plateaus OR a corpus citation");
  }
  if (hasWaves) return parseCorpusTraffic(src, tableId, path);
  if (!hasSegments) bad("BAD_TRAFFIC", `${path}.segments`, "required field is missing (or name `waves` for a corpus citation)");
  return parseSegmentsTraffic(src, tableId, path);
}

function parseSegmentsTraffic(src: Record<string, unknown>, tableId: string, path: string): ScenarioSegmentsTraffic {
  if (!Array.isArray(src.segments) || src.segments.length === 0) bad("BAD_TRAFFIC", `${path}.segments`, "expected a non-empty array");
  const segments = (src.segments as readonly unknown[]).map((rawSegment, i) => {
    const segPath = `${path}.segments[${i}]`;
    const seg = asRecord(rawSegment, segPath, "BAD_TRAFFIC");
    requireKeys(seg, ["fromMinute", "ratePerMin", "family"], ["fromMinute", "ratePerMin"], segPath, "BAD_TRAFFIC");
    const familyRaw = seg.family;
    let family: "organic" | ThreatFamily | undefined;
    if (familyRaw !== undefined) {
      if (typeof familyRaw !== "string" || !(ARRIVAL_FAMILIES as readonly string[]).includes(familyRaw)) {
        bad("BAD_ENUM", `${segPath}.family`, `expected one of ${ARRIVAL_FAMILIES.join(", ")}, got ${String(familyRaw)}`);
      }
      family = familyRaw as "organic" | ThreatFamily;
    }
    return Object.freeze({
      fromMinute: readInt(seg, "fromMinute", segPath, "BAD_TRAFFIC", 0, 1_000_000),
      ratePerMin: readInt(seg, "ratePerMin", segPath, "BAD_TRAFFIC", 0, 32_767),
      ...(family === undefined ? {} : { family }),
    });
  });
  if (segments[0]?.fromMinute !== 0) {
    bad("BAD_TRAFFIC", `${path}.segments`, "the first segment must start at fromMinute 0 (traffic is a total profile)");
  }
  for (let i = 1; i < segments.length; i++) {
    const prior = segments[i - 1]!;
    const here = segments[i]!;
    if (here.fromMinute <= prior.fromMinute) {
      bad("BAD_TRAFFIC", `${path}.segments`, `segment ${i} opens at m${here.fromMinute} but segment ${i - 1} already opened at m${prior.fromMinute} — fromMinute must strictly increase`);
    }
  }
  return Object.freeze({ profile: "segments", tableId, segments: Object.freeze(segments) });
}

function parseCorpusTraffic(src: Record<string, unknown>, tableId: string, path: string): ScenarioCorpusTraffic {
  if (!Array.isArray(src.waves) || src.waves.length === 0) bad("BAD_TRAFFIC", `${path}.waves`, "expected a non-empty array of shipped wave numbers");
  const waves = (src.waves as readonly unknown[]).map((raw, i) =>
    readInt({ wave: raw } as Record<string, unknown>, "wave", `${path}.waves[${i}]`, "BAD_TRAFFIC", 1, 1_000)
  );
  for (let i = 1; i < waves.length; i++) {
    if (waves[i]! <= waves[i - 1]!) {
      bad("BAD_TRAFFIC", `${path}.waves`, `wave ${waves[i]} does not ascend after wave ${waves[i - 1]} — schedule waves in shipped order`);
    }
  }
  return Object.freeze({
    profile: "corpus",
    tableId,
    waves: Object.freeze(waves),
    waveStartMinute: optInt(src, "waveStartMinute", path, "BAD_TRAFFIC", 0, 1_000_000, 2),
    baselineRatePerMin: optInt(src, "baselineRatePerMin", path, "BAD_TRAFFIC", 0, 32_767, 0),
  });
}

/* ── objectives ── */

const PREDICATE_FIELDS: Readonly<Record<ScenarioPredicateKind, readonly string[]>> = Object.freeze({
  "survive-minutes": ["kind", "minutes"],
  "cash-above": ["kind", "microUsd"],
  "cash-below": ["kind", "microUsd"],
  "churn-below": ["kind", "count"],
  "churn-above": ["kind", "count"],
  "written-off-below": ["kind", "count"],
  "written-off-above": ["kind", "count"],
  "invoices-settled": ["kind", "count"],
  "bounces-below": ["kind", "count"],
  "bounces-above": ["kind", "count"],
  "metric-delta-over-window": ["kind", "metric", "windowMinutes", "minDeltaPct"],
  "family-arrivals-below": ["kind", "family", "count"],
  "family-arrivals-above": ["kind", "family", "count"],
  "no-death-cause": ["kind", "cause"],
  "death-by-cause": ["kind", "cause"],
  "covenant-breached-count-below": ["kind", "count"],
  "covenant-breached-count-above": ["kind", "count"],
  "reputation-below": ["kind", "bps"],
  "reputation-above": ["kind", "bps"],
  "intents-executed-above": ["kind", "count", "verb"],
  "intents-executed-below": ["kind", "count", "verb"],
  "intents-refused-above": ["kind", "count", "verb"],
  "intents-refused-below": ["kind", "count", "verb"],
  "chargebacks-above": ["kind", "count"],
  "chargebacks-below": ["kind", "count"],
  "postmortem-credits-above": ["kind", "bps"],
  "postmortem-credits-below": ["kind", "bps"],
  "corruption-above": ["kind", "count"],
  "corruption-below": ["kind", "count"],
});

/** Rung-9 optional per-verb dim on the intent four — parsed at the wall so
 *  every downstream reader trusts a PlayerVerb (or nothing) from here on. */
function parsePredicateVerb(
  src: Record<string, unknown>,
  path: string,
): PlayerVerb | undefined {
  if (src.verb === undefined) return undefined;
  const verb = readString(src, "verb", path, "BAD_PREDICATE");
  if (!(PLAYER_VERBS as readonly string[]).includes(verb)) {
    bad("BAD_ENUM", `${path}.verb`, `expected one of ${PLAYER_VERBS.join(", ")}, got ${verb}`);
  }
  return verb as PlayerVerb;
}

function parsePredicate(raw: unknown, path: string): ObjectivePredicate {
  const src = asRecord(raw, path, "BAD_PREDICATE");
  const kind = readString(src, "kind", path, "BAD_PREDICATE");
  if (!(SCENARIO_PREDICATE_KINDS as readonly string[]).includes(kind)) {
    bad("UNKNOWN_KIND", `${path}.kind`, `"${kind}" is not a scenario predicate — legal: ${SCENARIO_PREDICATE_KINDS.join(", ")}`);
  }
  const typedKind = kind as ScenarioPredicateKind;
  const allowed = PREDICATE_FIELDS[typedKind];
  for (const key of Object.keys(src)) {
    if (!allowed.includes(key)) bad("BAD_PREDICATE", `${path}.${key}`, `${typedKind} accepts only: ${allowed.join(", ")}`);
  }
  switch (typedKind) {
    case "survive-minutes":
      return Object.freeze({ kind: typedKind, minutes: readInt(src, "minutes", path, "BAD_PREDICATE", 1, SCENARIO_MAX_MINUTES_CAP) });
    case "cash-above":
    case "cash-below":
      return Object.freeze({ kind: typedKind, microUsd: parseMoneyWire(src.microUsd, `${path}.microUsd`, "BAD_PREDICATE") });
    case "invoices-settled":
      return Object.freeze({ kind: typedKind, count: readInt(src, "count", path, "BAD_PREDICATE", 1, 1_000_000) });
    case "churn-below":
    case "bounces-below":
    case "written-off-below":
    case "covenant-breached-count-below":
    case "chargebacks-below":
    case "corruption-below":
      // count 0 would be "hold the line at below zero" — vacuous by
      // construction; the honest spelling of that fear is churn-above:0.
      return Object.freeze({ kind: typedKind, count: readInt(src, "count", path, "BAD_PREDICATE", 1, 1_000_000) });
    case "intents-executed-below":
    case "intents-refused-below": {
      // Same below-zero wall as the shared family; the rung-9 verb dim only
      // narrows WHICH receipts the count reads, never how the count is bound.
      const verb = parsePredicateVerb(src, path);
      return Object.freeze({
        kind: typedKind,
        count: readInt(src, "count", path, "BAD_PREDICATE", 1, 1_000_000),
        ...(verb === undefined ? {} : { verb }),
      });
    }
    case "churn-above":
    case "bounces-above":
    case "written-off-above":
    case "covenant-breached-count-above":
    case "chargebacks-above":
    case "corruption-above":
      return Object.freeze({ kind: typedKind, count: readInt(src, "count", path, "BAD_PREDICATE", 0, 1_000_000) });
    case "intents-executed-above":
    case "intents-refused-above": {
      const verb = parsePredicateVerb(src, path);
      return Object.freeze({
        kind: typedKind,
        count: readInt(src, "count", path, "BAD_PREDICATE", 0, 1_000_000),
        ...(verb === undefined ? {} : { verb }),
      });
    }
    case "metric-delta-over-window": {
      const metric = readString(src, "metric", path, "BAD_PREDICATE");
      if (!(DELTA_METRICS as readonly string[]).includes(metric)) {
        bad("BAD_ENUM", `${path}.metric`, `expected one of ${DELTA_METRICS.join(", ")}, got ${metric}`);
      }
      return Object.freeze({
        kind: typedKind,
        metric: metric as (typeof DELTA_METRICS)[number],
        windowMinutes: readInt(src, "windowMinutes", path, "BAD_PREDICATE", 1, SCENARIO_MAX_MINUTES_CAP),
        // 0% would ask for "no regression", not "visible improvement" —
        // the improvement vocabulary starts at one whole percent.
        minDeltaPct: readInt(src, "minDeltaPct", path, "BAD_PREDICATE", 1, 10_000),
      });
    }
    case "family-arrivals-below":
    case "family-arrivals-above": {
      const family = readString(src, "family", path, "BAD_PREDICATE");
      if (!(ARRIVAL_FAMILIES as readonly string[]).includes(family)) {
        bad("BAD_ENUM", `${path}.family`, `expected one of ${ARRIVAL_FAMILIES.join(", ")}, got ${family}`);
      }
      // Same vacuity law as the churn pair: below-0 is a fear, not a goal.
      const min = typedKind === "family-arrivals-below" ? 1 : 0;
      return Object.freeze({
        kind: typedKind,
        family: family as "organic" | ThreatFamily,
        count: readInt(src, "count", path, "BAD_PREDICATE", min, 1_000_000),
      });
    }
    case "no-death-cause":
    case "death-by-cause": {
      const cause = readString(src, "cause", path, "BAD_PREDICATE");
      if (cause !== "any" && !(COMPANY_DEATH_CAUSES as readonly string[]).includes(cause)) {
        bad("BAD_ENUM", `${path}.cause`, `expected "any" or one of ${COMPANY_DEATH_CAUSES.join(", ")}, got ${cause}`);
      }
      return Object.freeze({ kind: typedKind, cause: cause as ScenarioDeathCause });
    }
    case "reputation-below":
    case "reputation-above":
      // Balance semantics, mirroring the cash pair (≥ for above, < for
      // below — the two are exact complements at the same line). The ledger
      // is clamped to [0, 10 000] by construction, so below-0 could never
      // hold: the honest spelling of that fear is reputation-below:1.
      // above:10_000 stays legal — it asks for the impossible-to-keep
      // PERFECT score, which the clamped ledger can genuinely show.
      return Object.freeze({
        kind: typedKind,
        bps: readInt(src, "bps", path, "BAD_PREDICATE", typedKind === "reputation-below" ? 1 : 0, 10_000),
      });
    case "postmortem-credits-above":
    case "postmortem-credits-below":
      // Cumulative adjudication credit, not a clamped balance — the pair
      // keeps the reputation family's exact-complement semantics (≥ for
      // above, < for below). below-0 could never hold; the honest fear is
      // postmortem-credits-below:1 (no card ever credited).
      return Object.freeze({
        kind: typedKind,
        bps: readInt(src, "bps", path, "BAD_PREDICATE", typedKind === "postmortem-credits-below" ? 1 : 0, POSTMORTEM_CREDITS_BPS_MAX),
      });
  }
}

function parsePredicateList(
  raw: unknown,
  path: string,
  code: ScenarioErrorCode,
  requireOne: boolean,
): readonly ObjectivePredicate[] {
  if (!Array.isArray(raw)) bad(code, path, "expected an array of predicates");
  if (requireOne && raw.length === 0) bad(code, path, "expected at least one predicate — a mission must be completable");
  return Object.freeze((raw as readonly unknown[]).map((p, i) => parsePredicate(p, `${path}[${i}]`)));
}

function parseObjectives(raw: unknown, path: string): ScenarioDoc["objectives"] {
  const src = asRecord(raw, path, "BAD_OBJECTIVES");
  requireKeys(src, ["win", "lose"], ["win"], path, "BAD_OBJECTIVES");
  return Object.freeze({
    win: parsePredicateList(src.win, `${path}.win`, "BAD_OBJECTIVES", true),
    lose:
      src.lose === undefined || (Array.isArray(src.lose) && src.lose.length === 0)
        ? Object.freeze([] as readonly ObjectivePredicate[])
        : parsePredicateList(src.lose, `${path}.lose`, "BAD_OBJECTIVES", false),
  });
}

/* ── limits ── */

const OPEX_FIELDS = ["atMinute", "amountMicroUsd", "memo"] as const;

const COVENANT_FIELDS = ["id", "metricId", "floorBps", "direction"] as const;
const COVENANT_DIRECTIONS = ["min", "max"] as const;

/** The bank's card on the wire (rung 4): a closed metric name, a bps floor,
 *  a direction. `floorBps` for runwayMonthsBps is bps OF MONTHS — the
 *  canonical "min 6 months" card writes 60 000 (economy/runway.ts). */
function parseCovenant(raw: unknown, path: string): Covenant {
  const src = asRecord(raw, path, "BAD_LIMITS");
  requireKeys(src, COVENANT_FIELDS, ["id", "metricId", "floorBps", "direction"], path, "BAD_LIMITS");
  const id = readString(src, "id", path, "BAD_LIMITS");
  if (!ID_SHAPE.test(id)) bad("BAD_LIMITS", `${path}.id`, `"${id}" is not a [a-z0-9-] slug`);
  const metricId = readString(src, "metricId", path, "BAD_LIMITS");
  if (!(COVENANT_METRICS as readonly string[]).includes(metricId)) {
    bad("BAD_ENUM", `${path}.metricId`, `expected one of ${COVENANT_METRICS.join(", ")}, got ${metricId}`);
  }
  const floorBps = readInt(src, "floorBps", path, "BAD_LIMITS", 0, COVENANT_FLOOR_BPS_MAX);
  const directionRaw = readString(src, "direction", path, "BAD_LIMITS");
  if (!(COVENANT_DIRECTIONS as readonly string[]).includes(directionRaw)) {
    bad("BAD_ENUM", `${path}.direction`, `expected one of ${COVENANT_DIRECTIONS.join(", ")}, got ${directionRaw}`);
  }
  return Object.freeze({
    id,
    metricId,
    floorBps: BigInt(floorBps),
    direction: directionRaw as Covenant["direction"],
  });
}

function parseOpex(raw: unknown, path: string): UnattendedOpexDraft {
  const src = asRecord(raw, path, "BAD_LIMITS");
  requireKeys(src, OPEX_FIELDS, ["atMinute", "amountMicroUsd", "memo"], path, "BAD_LIMITS");
  const amount = parseMoneyWire(src.amountMicroUsd, `${path}.amountMicroUsd`, "BAD_LIMITS");
  if (amount < 1n) bad("BAD_MONEY", `${path}.amountMicroUsd`, "a burn below 1 µ$ is a gift, not an expense (F6 law)");
  return Object.freeze({
    atMinute: readInt(src, "atMinute", path, "BAD_LIMITS", 1, 1_000_000),
    amountMicroUsd: amount,
    memo: readString(src, "memo", path, "BAD_LIMITS"),
  });
}

/** Wave five: one `limits.corrupts` arm record. `tables` are unit TYPES
 *  (traffic tableIds the arrival step stamps — segments carry the doc's
 *  own tableId, corpus waves carry `waves/<stem>` which is NOT slug-shaped,
 *  so the wall validates the slug only for the segments-style names it can
 *  legally see; a corpus tableId would ride `waves/...` — the slash is
 *  refused HERE and the honest authoring path is a segments tableId). */
function parseCorrupts(raw: unknown, path: string): ScenarioLimits["corrupts"] {
  if (raw === null || raw === undefined) return null;
  const src = asRecord(raw, path, "BAD_LIMITS");
  requireKeys(src, ["tables", "patienceMin", "probabilityBps"], ["tables", "patienceMin"], path, "BAD_LIMITS");
  const tablesRaw = src.tables;
  if (!Array.isArray(tablesRaw) || tablesRaw.length === 0) {
    bad("BAD_LIMITS", `${path}.tables`, "expected a non-empty array of traffic-table slugs to arm");
  }
  const tables = (tablesRaw as readonly unknown[]).map((entry, i) => {
    const p = `${path}.tables[${i}]`;
    if (typeof entry !== "string" || entry.length === 0) bad("BAD_LIMITS", p, `expected a non-empty string, got ${typeof entry}`);
    if (!ID_SHAPE.test(entry)) bad("BAD_LIMITS", p, `"${entry}" is not a [a-z0-9-] slug`);
    return entry;
  });
  const seen = new Set<string>();
  for (const table of tables) {
    if (seen.has(table)) bad("DUPLICATE", `${path}.tables`, `table "${table}" armed twice`);
    seen.add(table);
  }
  return Object.freeze({
    tables: Object.freeze(tables),
    patienceMin: readInt(src, "patienceMin", path, "BAD_LIMITS", 1, SCENARIO_MAX_MINUTES_CAP),
    // 0 is legal and means "never corrupt" (the engine behaves like
    // `resident` while still recording exhaustion) — refusing it would
    // forbid the honest probe arm "arm the channel, prove zero damage".
    probabilityBps: optInt(src, "probabilityBps", path, "BAD_LIMITS", 0, 10_000, 10_000),
  });
}

/** Rung-6 verb vocabulary: the door's PlayerVerb set, read from the one
 *  list doc.ts already mirrors (SCENARIO_INTENT_ARG_SHAPES) — a verb the
 *  intent rail cannot even schedule can never be taxed here either. */
const ATTENTION_TAXABLE_VERBS: readonly string[] = Object.freeze(
  Object.keys(SCENARIO_INTENT_ARG_SHAPES),
);

/** Ladder rung 6: `limits.attention {capacity, cost}` — CLOSED row.
 *  `cost` is the door's `attentionCost` map verbatim: keys must be verbs,
 *  values must be exactly 0 or 1 (the door's own resolveAttentionCost
 *  law, enforced at the wall so a bad wire dies at parse, not mid-run). */
function parseAttentionLimit(raw: unknown, path: string): ScenarioLimits["attention"] {
  if (raw === null || raw === undefined) return undefined;
  const src = asRecord(raw, path, "BAD_LIMITS");
  requireKeys(src, ["capacity", "cost"], ["capacity", "cost"], path, "BAD_LIMITS");
  const capacity = readInt(src, "capacity", path, "BAD_LIMITS", 1, 16);
  const costSrc = asRecord(src.cost, `${path}.cost`, "BAD_LIMITS");
  const cost: Record<string, 0 | 1> = {};
  for (const [verb, value] of Object.entries(costSrc)) {
    if (!ATTENTION_TAXABLE_VERBS.includes(verb)) {
      bad("BAD_ENUM", `${path}.cost.${verb}`, `expected one of ${ATTENTION_TAXABLE_VERBS.join(", ")}`);
    }
    if (value !== 0 && value !== 1) {
      bad("BAD_LIMITS", `${path}.cost.${verb}`, `attention cost must be 0 or 1, got ${String(value)}`);
    }
    cost[verb] = value as 0 | 1;
  }
  return Object.freeze({ capacity, cost: Object.freeze(cost) as Readonly<Partial<Record<PlayerVerb, 0 | 1>>> });
}

/** Ladder rung 8: `limits.freeze {fromMinute, toMinute}` — CLOSED row,
 *  both ends required, inclusive, and the band must have width
 *  (to > from — a one-minute tape is a typo, not a policy). */
function parseFreezeLimit(raw: unknown, path: string): ScenarioLimits["freeze"] {
  if (raw === null || raw === undefined) return undefined;
  const src = asRecord(raw, path, "BAD_LIMITS");
  requireKeys(src, ["fromMinute", "toMinute"], ["fromMinute", "toMinute"], path, "BAD_LIMITS");
  const fromMinute = readInt(src, "fromMinute", path, "BAD_LIMITS", 1, SCENARIO_MAX_MINUTES_CAP);
  const toMinute = readInt(src, "toMinute", path, "BAD_LIMITS", 1, SCENARIO_MAX_MINUTES_CAP);
  if (toMinute <= fromMinute) {
    bad("BAD_LIMITS", `${path}.toMinute`, `an inclusive freeze band needs toMinute > fromMinute, got ${fromMinute}..${toMinute}`);
  }
  return Object.freeze({ fromMinute, toMinute });
}

/** Ladder rung 10: `limits.familyMix {weights}` — the composition dial.
 *  The five-key / sum / renormalise law lives ONCE, in the waves authority
 *  the content bundles already pass through; this wall only (a) converts the
 *  wire's plain-INTEGER µ-share table into Fixed Q16.16 bigints (scenario
 *  wires never carry float literals — the canary determinism law, the same
 *  reason money rides integer µ$), and (b) wraps the authority's failures in
 *  the house `scenario[CODE] at 'path'` grammar and drops the zero buckets
 *  (a 0-share family is an authored absence, not a roll). The conversion is
 *  exact for every share that is a whole multiple of 1e6/65536 ≈ 15.26 µ and
 *  drifts by at most that elsewhere — far under the authority's own ±1%
 *  renormalisation band, and pinned falsifiable by the wall tests. One
 *  sub-granularity edge worth stating: an authored µ-share below the Fixed
 *  conversion granularity (<8 µ ⇒ Fixed 0) is dropped by the armed filter and
 *  silently leaves the roll — its sliver renormalises into the surviving
 *  buckets, so the census drift stays under one mint on any shipped wire. */
const FAMILY_MIX_MICRO = 1_000_000;
const FIXED_SCALE = 65_536;
const FAMILY_MIX_KEYS = ["customerAsThreat", "entropic", "human", "malicious", "systemic"] as const;

function parseFamilyMixLimit(raw: unknown, path: string): ScenarioLimits["familyMix"] {
  if (raw === null || raw === undefined) return undefined;
  const src = asRecord(raw, path, "BAD_LIMITS");
  requireKeys(src, ["weights"], ["weights"], path, "BAD_LIMITS");
  const weightsSrc = asRecord(src.weights, `${path}.weights`, "BAD_LIMITS");
  for (const key of Object.keys(weightsSrc)) {
    if (key === "_todo") continue; // the bundle convention survives the wire round-trip
    if (!(FAMILY_MIX_KEYS as readonly string[]).includes(key)) {
      bad("BAD_LIMITS", `${path}.weights.${key}`, `unknown family — closed set: ${FAMILY_MIX_KEYS.join(", ")}`);
    }
    const value = weightsSrc[key];
    if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0 || value > FAMILY_MIX_MICRO) {
      bad("BAD_LIMITS", `${path}.weights.${key}`, `family weights are integer micro-shares 0..1000000 (no floats on the wire), got ${String(value)}`);
    }
  }
  const fixed: Record<string, bigint> = {};
  for (const family of FAMILY_MIX_KEYS) {
    const micro = weightsSrc[family];
    if (typeof micro !== "number") {
      bad("BAD_LIMITS", `${path}.weights.${family}`, "required bucket is missing — a half-authored table is a lie the dice must not smooth over");
    }
    fixed[family] = (BigInt(micro) * BigInt(FIXED_SCALE) + BigInt(FAMILY_MIX_MICRO / 2)) / BigInt(FAMILY_MIX_MICRO);
  }
  let shares: readonly FamilyShare[];
  try {
    shares = parseFamilyWeightsTable(fixed, `${path}.weights`);
  } catch (err) {
    bad("BAD_LIMITS", `${path}.weights`, err instanceof Error ? err.message : String(err));
  }
  const armed = shares.filter((share) => share.shareMicro > 0);
  return Object.freeze({ weights: Object.freeze(armed) });
}

function parseLimits(raw: unknown, path: string): ScenarioLimits {
  const src = asRecord(raw, path, "BAD_LIMITS");
  requireKeys(
    src,
    ["maxSimMinutes", "initialFreeMicroUsd", "opex", "dunningEngineOwned", "handCapacity", "guardrails", "covenants", "corrupts", "attention", "freeze", "familyMix"],
    ["maxSimMinutes"],
    path,
    "BAD_LIMITS",
  );
  const opexRaw = src.opex ?? [];
  if (!Array.isArray(opexRaw)) bad("BAD_LIMITS", `${path}.opex`, "expected an array");
  const opex = (opexRaw as readonly unknown[]).map((draft, i) => parseOpex(draft, `${path}.opex[${i}]`));
  const seenTwin = new Set<string>();
  for (const draft of opex) {
    const twin = `${draft.atMinute}\u0000${draft.memo}`;
    if (seenTwin.has(twin)) bad("DUPLICATE", `${path}.opex`, `duplicate (atMinute,memo) m${draft.atMinute}:${draft.memo}`);
    seenTwin.add(twin);
  }
  const guardrailsRaw = src.guardrails ?? [];
  if (!Array.isArray(guardrailsRaw)) bad("BAD_LIMITS", `${path}.guardrails`, "expected an array");
  let guards: readonly ParsedGuard[];
  try {
    guards = parseGuardList(guardrailsRaw as readonly unknown[]);
  } catch (err) {
    bad("BAD_GUARDRAIL", `${path}.guardrails`, err instanceof Error ? err.message : String(err));
  }
  const covenantsRaw = src.covenants ?? [];
  if (!Array.isArray(covenantsRaw)) bad("BAD_LIMITS", `${path}.covenants`, "expected an array");
  const covenants = (covenantsRaw as readonly unknown[]).map((draft, i) => parseCovenant(draft, `${path}.covenants[${i}]`));
  const covenantIds = new Set<string>();
  for (const covenant of covenants) {
    if (covenantIds.has(covenant.id)) bad("DUPLICATE", `${path}.covenants`, `duplicate covenant id "${covenant.id}"`);
    covenantIds.add(covenant.id);
  }
  const attention = parseAttentionLimit(src.attention, `${path}.attention`);
  const freeze = parseFreezeLimit(src.freeze, `${path}.freeze`);
  const familyMix = parseFamilyMixLimit(src.familyMix, `${path}.familyMix`);
  return Object.freeze({
    maxSimMinutes: readInt(src, "maxSimMinutes", path, "BAD_LIMITS", 1, SCENARIO_MAX_MINUTES_CAP),
    initialFreeMicroUsd: src.initialFreeMicroUsd === undefined ? 0n : parseMoneyWire(src.initialFreeMicroUsd, `${path}.initialFreeMicroUsd`, "BAD_LIMITS"),
    opex: Object.freeze(opex),
    dunningEngineOwned: readBool(src, "dunningEngineOwned", path, "BAD_LIMITS", true),
    handCapacity: optInt(src, "handCapacity", path, "BAD_LIMITS", 0, 16, 2),
    guards,
    covenants: Object.freeze(covenants),
    corrupts: parseCorrupts(src.corrupts, `${path}.corrupts`),
    // Rungs 6/8 ride as CONDITIONAL keys: unarmed docs never grow the key
    // (the "their doc objects gain no keys" zero-golden law of this lane).
    ...(attention === undefined ? {} : { attention }),
    ...(freeze === undefined ? {} : { freeze }),
    ...(familyMix === undefined ? {} : { familyMix }),
  });
}

/* ── channels ladder — intents + signals ── */

const INTENT_FIELDS = ["atTick", "verb", "args"] as const;

/** CAUSE-ID grammar for the signal channels: lowercase slug segments joined
 *  by colons (the house cause-id shape — `economy:...`, `scenario:...`).
 *  The wall refuses anything the engine could never print back. */
const CAUSE_SHAPE = /^[a-z0-9][a-z0-9:_-]*$/;

function parseIntentArg(value: unknown, wire: IntentArgWire, path: string): string | number | null | bigint {
  if (wire === "string") {
    if (typeof value !== "string" || value.length === 0) bad("BAD_INTENT", path, "expected a non-empty string");
    return value;
  }
  if (wire === "null|string") {
    if (value === null) return null;
    if (typeof value !== "string" || value.length === 0) bad("BAD_INTENT", path, "expected a non-empty string or an explicit null");
    return value;
  }
  if (wire === "number") {
    if (typeof value !== "number" || !Number.isFinite(value)) bad("BAD_INTENT", path, "expected a finite number");
    return value;
  }
  if (wire === "null|number") {
    if (value === null) return null;
    if (typeof value !== "number" || !Number.isFinite(value)) bad("BAD_INTENT", path, "expected a finite number or an explicit null");
    return value;
  }
  if (wire === "null|money") {
    if (value === null) return null;
    return parseMoneyWire(value, path, "BAD_INTENT");
  }
  return parseMoneyWire(value, path, "BAD_INTENT");
}

/** One rail row: verb from the closed PLAYER_VERBS vocab, args checked
 *  against the mirrored door grammar EXACTLY (all fields present, no
 *  extras). The wall never simulates the handler — value-domain verdicts
 *  (unknown-node, hands-exhausted) belong to the door and ride back as
 *  receipts the predicates count. */
function parseIntent(raw: unknown, path: string): ScenarioIntent {
  const src = asRecord(raw, path, "BAD_INTENT");
  requireKeys(src, INTENT_FIELDS, ["atTick", "verb", "args"], path, "BAD_INTENT");
  const atTick = readInt(src, "atTick", path, "BAD_INTENT", 1, 1_000_000);
  const verbRaw = readString(src, "verb", path, "BAD_INTENT");
  if (!(PLAYER_VERBS as readonly string[]).includes(verbRaw)) {
    bad("UNKNOWN_KIND", `${path}.verb`, `"${verbRaw}" is not a player verb — legal: ${PLAYER_VERBS.join(", ")}`);
  }
  const verb = verbRaw as PlayerVerb;
  const argsSrc = asRecord(src.args, `${path}.args`, "BAD_INTENT");
  const shape = SCENARIO_INTENT_ARG_SHAPES[verb];
  for (const field of Object.keys(shape)) {
    if (!(field in argsSrc)) bad("BAD_INTENT", `${path}.args.${field}`, `${verb} requires the door-shaped field "${field}" (an explicit null is the honest omission)`);
  }
  for (const key of Object.keys(argsSrc)) {
    if (!(key in shape)) bad("BAD_INTENT", `${path}.args.${key}`, `${verb} accepts only: ${Object.keys(shape).join(", ")}`);
  }
  const args: Record<string, string | number | null | bigint> = {};
  for (const [field, wire] of Object.entries(shape)) {
    args[field] = parseIntentArg(argsSrc[field], wire, `${path}.args.${field}`);
  }
  return Object.freeze({ atTick, verb, args: Object.freeze(args) });
}

const SIGNAL_FIELDS = ["majorIncidents", "honestPostmortems", "postmortems", "chargebacks"] as const;
const POSTMORTEM_FIELDS = ["atMinute", "cause", "incidentMinute", "incidentIndex", "style", "changesInFlight"] as const;
const POSTMORTEM_STYLES = ["blameless", "blame"] as const;
const SIGNAL_AT_MINUTE_MAX = 1_000_000;

function readSignalRows(raw: unknown, path: string): Record<string, unknown>[] {
  if (raw === undefined) return [];
  if (!Array.isArray(raw)) bad("BAD_SIGNAL", path, "expected an array");
  return raw as Record<string, unknown>[];
}

function readSignalAtMinute(src: Record<string, unknown>, path: string): number {
  return readInt(src, "atMinute", path, "BAD_SIGNAL", 1, SIGNAL_AT_MINUTE_MAX);
}

/** Fold the whole `signals` record. Incident refs resolve HERE (parse,
 *  don't validate): a filing naming `incidentMinute`/`incidentIndex` gets
 *  its cause minted through the shared `scenarioIncidentCause` grammar and
 *  must point at a declared major incident, so the runner downstream never
 *  re-checks and a filing can never orphan onto an unnamed catastrophe. */
function parseSignals(raw: unknown, contractIds: ReadonlySet<string>, path: string): ScenarioSignals {
  const src = asRecord(raw, path, "BAD_SIGNAL");
  requireKeys(src, SIGNAL_FIELDS, [], path, "BAD_SIGNAL");

  const majorRaw = readSignalRows(src.majorIncidents, `${path}.majorIncidents`);
  const majorIncidents = majorRaw.map((row, i) => {
    const p = `${path}.majorIncidents[${i}]`;
    const rowSrc = asRecord(row, p, "BAD_SIGNAL");
    requireKeys(rowSrc, ["atMinute", "count"], ["atMinute", "count"], p, "BAD_SIGNAL");
    return Object.freeze({ atMinute: readSignalAtMinute(rowSrc, p), count: readInt(rowSrc, "count", p, "BAD_SIGNAL", 1, 1000) });
  });
  const majorByMinute = new Map<number, number>();
  for (const row of majorIncidents) {
    if (majorByMinute.has(row.atMinute)) bad("DUPLICATE", `${path}.majorIncidents`, `two incident rows at m${row.atMinute} — say it once with the summed count`);
    majorByMinute.set(row.atMinute, row.count);
  }

  const honestRaw = readSignalRows(src.honestPostmortems, `${path}.honestPostmortems`);
  const honestPostmortems = honestRaw.map((row, i) => {
    const p = `${path}.honestPostmortems[${i}]`;
    const rowSrc = asRecord(row, p, "BAD_SIGNAL");
    requireKeys(rowSrc, ["atMinute", "cause"], ["atMinute", "cause"], p, "BAD_SIGNAL");
    const cause = readString(rowSrc, "cause", p, "BAD_SIGNAL");
    if (!CAUSE_SHAPE.test(cause)) bad("BAD_SIGNAL", `${p}.cause`, `"${cause}" is not a cause id ([a-z0-9][a-z0-9:_-]*)`);
    return Object.freeze({ atMinute: readSignalAtMinute(rowSrc, p), cause });
  });
  const honestCauses = new Set<string>();
  for (const row of honestPostmortems) {
    if (honestCauses.has(row.cause)) bad("DUPLICATE", `${path}.honestPostmortems`, `cause "${row.cause}" asserted twice — one honest claim per incident`);
    honestCauses.add(row.cause);
  }

  const filingRaw = readSignalRows(src.postmortems, `${path}.postmortems`);
  const postmortems = filingRaw.map((row, i) => {
    const p = `${path}.postmortems[${i}]`;
    const rowSrc = asRecord(row, p, "BAD_SIGNAL");
    requireKeys(rowSrc, POSTMORTEM_FIELDS, ["atMinute"], p, "BAD_SIGNAL");
    const atMinute = readSignalAtMinute(rowSrc, p);
    const hasCause = rowSrc.cause !== undefined;
    const hasIncident = rowSrc.incidentMinute !== undefined;
    if (hasCause === hasIncident) {
      bad("BAD_SIGNAL", p, "a filing names EXACTLY one of `cause` (free slug) or `incidentMinute` (a declared major incident)");
    }
    let cause: string;
    if (hasIncident) {
      const incidentMinute = readInt(rowSrc, "incidentMinute", p, "BAD_SIGNAL", 1, SIGNAL_AT_MINUTE_MAX);
      const count = majorByMinute.get(incidentMinute);
      if (count === undefined) bad("BAD_SIGNAL", `${p}.incidentMinute`, `m${incidentMinute} declares no major incident to write up`);
      const incidentIndex = optInt(rowSrc, "incidentIndex", p, "BAD_SIGNAL", 0, 999, 0);
      if (incidentIndex >= count) bad("BAD_SIGNAL", `${p}.incidentIndex`, `m${incidentMinute} declared ${count} incident(s) — index ${incidentIndex} is out of range`);
      cause = scenarioIncidentCause(incidentMinute, incidentIndex);
    } else {
      cause = readString(rowSrc, "cause", p, "BAD_SIGNAL");
      if (!CAUSE_SHAPE.test(cause)) bad("BAD_SIGNAL", `${p}.cause`, `"${cause}" is not a cause id ([a-z0-9][a-z0-9:_-]*)`);
    }
    const styleRaw = rowSrc.style === undefined ? "blameless" : readString(rowSrc, "style", p, "BAD_SIGNAL");
    if (!(POSTMORTEM_STYLES as readonly string[]).includes(styleRaw)) {
      bad("BAD_ENUM", `${p}.style`, `expected one of ${POSTMORTEM_STYLES.join(", ")}, got ${styleRaw}`);
    }
    return Object.freeze({
      atMinute,
      cause,
      style: styleRaw as "blameless" | "blame",
      changesInFlight: optInt(rowSrc, "changesInFlight", p, "BAD_SIGNAL", 0, 1000, 0),
    });
  });
  const filingSeen = new Set<string>();
  for (const row of postmortems) {
    const twin = `${row.atMinute}\u0000${row.cause}`;
    if (filingSeen.has(twin)) bad("DUPLICATE", `${path}.postmortems`, `duplicate (atMinute,cause) filing m${row.atMinute}:${row.cause}`);
    filingSeen.add(twin);
  }
  /* Double-credit mirror (economy/tick.ts step 12.45 throws when one cause
     rides BOTH the raw-assertion channel and a filing): the wall refuses
     the whole-run version — one channel per cause, farm nothing. */
  for (const row of postmortems) {
    if (honestCauses.has(row.cause)) {
      bad("BAD_SIGNAL", `${path}.postmortems`, `cause "${row.cause}" rides both honestPostmortems and postmortems — the engine throws on double-credit; pick one channel`);
    }
  }

  const cbRaw = readSignalRows(src.chargebacks, `${path}.chargebacks`);
  const chargebacks = cbRaw.map((row, i) => {
    const p = `${path}.chargebacks[${i}]`;
    const rowSrc = asRecord(row, p, "BAD_SIGNAL");
    requireKeys(rowSrc, ["atMinute", "contractId"], ["atMinute", "contractId"], p, "BAD_SIGNAL");
    const contractId = readString(rowSrc, "contractId", p, "BAD_SIGNAL");
    if (!contractIds.has(contractId)) bad("BAD_SIGNAL", `${p}.contractId`, `"${contractId}" is not a contract this mission signed — the lane would throw on an un-primed chargeback`);
    return Object.freeze({ atMinute: readSignalAtMinute(rowSrc, p), contractId: asEntityId(contractId) });
  });

  return Object.freeze({
    majorIncidents: Object.freeze(majorIncidents),
    honestPostmortems: Object.freeze(honestPostmortems),
    postmortems: Object.freeze(postmortems),
    chargebacks: Object.freeze(chargebacks),
  });
}

/** True when the doc carries any economy signal row — the lane must be ON
 *  for the composition to have anywhere to fold into. */
export function scenarioSignalsActive(signals: ScenarioSignals): boolean {
  return (
    signals.majorIncidents.length > 0 ||
    signals.honestPostmortems.length > 0 ||
    signals.postmortems.length > 0 ||
    signals.chargebacks.length > 0
  );
}

/* ─────────────────────────── the document wall ─────────────────────────── */

const DOC_FIELDS = [
  "schema",
  "id",
  "name",
  "brief",
  "specRef",
  "specLine",
  "board",
  "contracts",
  "traffic",
  "intents",
  "signals",
  "objectives",
  "limits",
] as const;

/** Parse untrusted wire JSON into a deep-frozen ScenarioDoc. The ONLY
 *  sanctioned entry point to the type — internal code trusts the result. */
export function parseScenarioDoc(raw: unknown): ScenarioDoc {
  const path = typeof (raw as Record<string, unknown> | null)?.id === "string" ? `scenario:${(raw as { id: string }).id}` : "scenario";
  const src = asRecord(raw, path, "BAD_RECORD");
  requireKeys(src, DOC_FIELDS, ["schema", "id", "name", "brief", "specRef", "board", "contracts", "traffic", "objectives", "limits"], path, "BAD_RECORD");

  const schema = readString(src, "schema", path, "BAD_RECORD");
  if (schema !== SCENARIO_SCHEMA) bad("BAD_VERSION", `${path}.schema`, `expected "${SCENARIO_SCHEMA}", got "${schema}"`);

  const id = readString(src, "id", path, "BAD_ID");
  if (!ID_SHAPE.test(id)) bad("BAD_ID", `${path}.id`, `"${id}" is not a [a-z0-9-] slug`);

  const name = readString(src, "name", path, "BAD_NAME");
  const brief = readString(src, "brief", path, "BAD_BRIEF");
  if (brief.length > SCENARIO_BRIEF_MAX_CHARS) {
    bad("BAD_BRIEF", `${path}.brief`, `${brief.length} chars exceeds the ${SCENARIO_BRIEF_MAX_CHARS}-char mission-blurb wall`);
  }

  const specRef = readString(src, "specRef", path, "BAD_SPEC");
  if (!specRef.startsWith("§1.5")) bad("BAD_SPEC", `${path}.specRef`, `a scenario must cite its §1.5 heading, got "${specRef}"`);
  let specLine: number | null = null;
  if (src.specLine !== undefined) specLine = readInt(src, "specLine", path, "BAD_SPEC", 1, 10_000_000);

  const board = parseBoard(src.board, `${path}.board`);

  if (!Array.isArray(src.contracts)) bad("BAD_CONTRACT", `${path}.contracts`, "expected an array (empty is legal — a board-only drill)");
  const contracts = (src.contracts as readonly unknown[]).map((c, i) => parseContract(c, `${path}.contracts[${i}]`));
  const contractIds = new Set<string>();
  for (const spec of contracts) {
    if (contractIds.has(spec.id)) bad("DUPLICATE", `${path}.contracts`, `duplicate contract id "${spec.id}"`);
    contractIds.add(spec.id);
  }

  const traffic = parseTraffic(src.traffic, `${path}.traffic`);
  const intentsRaw = src.intents ?? [];
  if (!Array.isArray(intentsRaw)) bad("BAD_INTENT", `${path}.intents`, "expected an array");
  const intents = Object.freeze((intentsRaw as readonly unknown[]).map((row, i) => parseIntent(row, `${path}.intents[${i}]`)));
  const signals = parseSignals(src.signals ?? {}, new Set(contracts.map((spec) => spec.id)), `${path}.signals`);
  const objectives = parseObjectives(src.objectives, `${path}.objectives`);
  const limits = parseLimits(src.limits, `${path}.limits`);

  /* Cross-section law: burns and cliffs scheduled beyond the clock cap are
     dead authoring bugs — refuse them instead of silently never firing. */
  for (const draft of limits.opex) {
    if (draft.atMinute > limits.maxSimMinutes) {
      bad("BAD_LIMITS", `${path}.limits.opex`, `burn m${draft.atMinute} (${draft.memo}) lands after the clock stops at m${limits.maxSimMinutes}`);
    }
  }
  /* Channels-ladder clock law (same shape as the opex rule): a verb or a
     signal scheduled after the clock stops can never play — refuse the
     dead row instead of silently never firing it. */
  for (const intent of intents) {
    if (intent.atTick > limits.maxSimMinutes) {
      bad("BAD_INTENT", `${path}.intents`, `${intent.verb} at tick ${intent.atTick} lands after the clock stops at m${limits.maxSimMinutes}`);
    }
  }
  for (const row of [...signals.majorIncidents, ...signals.honestPostmortems, ...signals.postmortems, ...signals.chargebacks]) {
    if (row.atMinute > limits.maxSimMinutes) {
      bad("BAD_SIGNAL", `${path}.signals`, `signal m${row.atMinute} lands after the clock stops at m${limits.maxSimMinutes}`);
    }
  }
  for (const spec of contracts) {
    /* Clock law: 43 200 biz-minutes = 420 sim-minutes ⇒ sim = biz × 7/720. */
    const cliffMinute = Math.ceil((spec.contract.termEndMin * 7) / 720);
    if (cliffMinute > limits.maxSimMinutes) {
      bad(
        "BAD_CONTRACT",
        `${path}.contracts`,
        `contract "${spec.id}" cliffs at biz-minute ${spec.contract.termEndMin} ≈ sim-minute ${cliffMinute}, past the clock cap m${limits.maxSimMinutes} — the renewal drama can never play`,
      );
    }
  }

  return Object.freeze({
    schemaVersion: 1,
    id,
    name,
    brief,
    specRef,
    specLine,
    board,
    contracts: Object.freeze(contracts),
    traffic,
    intents,
    signals,
    objectives,
    limits,
  });
}

/** Re-derive the RunSeed a scenario run uses: base seed plus the author-
 *  visible offset (seed policy lives with the doc, not the caller's mood). */
export function scenarioSeed(base: RunSeed, offset: number): RunSeed {
  if (!Number.isSafeInteger(offset) || offset < 0) {
    bad("BAD_INT", "scenarioSeed.offset", `expected a safe integer ≥ 0, got ${String(offset)}`);
  }
  return asRunSeed(base + BigInt(offset));
}

/** EntityId of a contract, exposed for hosts reading the report. */
export function scenarioContractId(doc: ScenarioDoc, index: number): EntityId {
  const spec = doc.contracts[index];
  if (spec === undefined) bad("BAD_INT", "scenarioContractId.index", `doc has ${doc.contracts.length} contracts, got index ${index}`);
  return spec.contract.id;
}
