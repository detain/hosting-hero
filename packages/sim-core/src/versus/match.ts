/**
 * versus/match.ts — async match resolution (ADR-0004 B″): the attacker's
 * committed ThreatDeck is CONVERTED into a law-clean 8-wave WaveTable and
 * run OFFLINE against the defender's committed board + doctrine, with the
 * defender's live reserve played through small hands on the REAL intent
 * door and the Policy-Book autopilot (rule phase) — the same composed tick
 * loop the gate suites run, no invented physics.
 *
 * Wave conversion laws honored BY CONSTRUCTION (then self-checked against
 * waves/enforcer — a non-empty enforcement result throws, never ships):
 *   • ≤4 entries per wave, ≤2 denominations per wave, no dup threat in a
 *     wave, every deck threat appears in ≥1 wave (empty waves fill by
 *     cycling the sorted order);
 *   • fresh role at waves 4 and 8 — anchors are FORCED first (heaviest
 *     threat at wave 1, the first ρ1-player at wave 4, the first ρ2-player
 *     at wave 8) and the forbidden-label law keeps ρ1 out of waves 1–3 and
 *     ρ2 out of waves 5–7;
 *   • the sawtooth: fixed par ladder [40,22,52,28,62,34,70,38] — every
 *     trough sits ≥45% below its running peak (integer-exact), the opener
 *     sits at the 40% ceiling, the closer peaks;
 *   • role quotas: fixed share ladders ([40,30,20,10] family) make more
 *     than two >30% roles arithmetically impossible inside one wave.
 * Weight→placement: deck weights ORDER the threats (heaviest takes the
 * fattest share slot first); weights do NOT scale unit counts — the waves
 * pressure machinery owns volume exactly like singleplayer (OWNER-QUESTION
 * in the lane report).
 *
 * Determinism: no clocks, no Math.random, no floats. The harness contract
 * is met by construction — createVersusRunner mints EVERY mutable object
 * (driver, rule-phase closure, observed store, maps) inside one resumable
 * VersusEngine per runner instance, so same-request ⇒ same-answer and
 * replayDigests(×100) of digestState lands on one byte-identical value.
 * The default runner MEMOIZES: a single monotone forward pass with dense
 * per-tick state snapshots replaces the per-probe re-simulation (capture
 * was O(n²) in requested ticks; it is now O(total ticks + requests)). The
 * purity contract survives because GameState is an immutable-by-convention
 * VALUE at every tick (law cited on createVersusEngine) and the late-intent
 * guard rebuilds the engine instead of answering from a poisoned cursor.
 * `{ memoize: false }` opts back into the monolithic per-request re-sim.
 *
 * Scoring law (OD-1/OD-2 UNCHOSEN): match score folds ONLY the explicit
 * MatchScoringWeights record handed in as data. This file never calls the
 * economy scorecard/sheet resolvers — their literal names are pinned
 * absent from every lane source file by test (grep gate).
 */
import type {
  BoardRelation,
  RngStream,
  CauseId,
  EntityId,
  ExternalIntent,
  Fixed,
  GameState,
  InspectionDepth,
  NodeRecord,
  ObservedCell,
  OutcomeTerminal,
  PolicyCard,
  QosClassDef,
  ResolutionBand,
  RetryPolicy,
  RunSeed,
  ShedOrder,
  SimEvent,
  WaveEnvelope,
} from "../types.ts";
import {
  asCauseId,
  asEntityId,
  asMetricId,
  observedKey,
  PlayerVerb,
} from "../types.ts";
import { FIXED_ZERO, fromInt, fromRatio } from "../kernel/fixed.ts";
import { MICROS_PER_MIN, initialClocks } from "../kernel/time.ts";
import { streamFor } from "../kernel/rng.ts";
import type { PressureParams, TuningSheetId } from "../waves/pressure.ts";
import type { ThreatRole, WaveTable } from "../waves/table.ts";
import { parseWaveTable } from "../waves/table.ts";
import { enforceWaveTable, AUTHORING_LAWS, type WaveViolation } from "../waves/enforcer.ts";
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
import type { IntentDoorConfig, PlaceDeviceQuery } from "../pipeline/index.ts";
import type { BoardEdgeRecord, PlayerVerbPayload } from "../types.ts";
import { createRulePhaseStep } from "../policy/index.ts";
import { ObservedStore } from "../observed/index.ts";
import { compareCodeUnits, encodeTaggedTree, fnv1a64OverBytes, utf8Bytes } from "../internal/canonical.ts";
import type { SimRunner, SimRunnerRequest } from "../replay/verify.ts";
import {
  buildCauseIndex,
  causeRecordsFromEvents,
  oneSentenceExplanation,
  traceContributingFactors,
} from "../replay/causality.ts";
import {
  deckLegalityViolations,
  VersusError,
  type ThreatCensusEntry,
  type ThreatDeck,
  type ThreatDeckEntry,
} from "./deck.ts";

/* ═══════════════════════════ conversion constants ═══════════════════════════ */

/** §9.x versus round: eight timed waves, nothing else. */
export const VERSUS_WAVE_COUNT = 8;

/** Sawtooth par ladder (integer %): opener at the 40 ceiling, deep
 *  breathers at waves 2/4/6/8, the peak at 7. Trough law verified
 *  integer-exact: (40−22)×100 ≥ 45×40, (52−28)×100 ≥ 45×52,
 *  (62−34)×100 ≥ 45×62, (70−38)×100 ≥ 45×70. */
export const VERSUS_PAR_LADDER_PCT = Object.freeze([40, 22, 52, 28, 62, 34, 70, 38] as const);

/** Share ladders by wave size. Sums hit 100 exactly and the shape makes
 *  ROLE_QUOTA_EXCEEDED arithmetically unreachable: with four slots at most
 *  two disjoint subsets can exceed 30 (40 is hot; 30+20 merges to a second
 *  hot at worst), and three-slot [50,30,20] tops out at two. */
export const VERSUS_SHARE_LADDERS = Object.freeze({
  1: Object.freeze([100] as const),
  2: Object.freeze([60, 40] as const),
  3: Object.freeze([50, 30, 20] as const),
  4: Object.freeze([40, 30, 20, 10] as const),
} as const);

export const VERSUS_DEFAULT_WINDOW_MINUTES = 12;
export const VERSUS_DEFAULT_RAMP_MINUTES = 4;
export const VERSUS_DEFAULT_PLATEAU_MINUTES = 4;
export const VERSUS_DEFAULT_DECAY_MINUTES = 4;

const UNATTRIBUTED = "unattributed";
const BASELINE_LABEL = "baseline";

/* ═══════════════════════════ deck → WaveTable ═══════════════════════════ */

export interface DeckScheduleOptions {
  readonly census: ReadonlyMap<string, ThreatCensusEntry>;
  /** Colon-free table id (it rides every wave unitId/causeId). */
  readonly tableId: string;
  readonly typeBundleId: string;
  readonly tuningSheet?: TuningSheetId;
  readonly unitsPerPressurePoint?: number;
  readonly windowMinutes?: number;
  readonly rampMinutes?: number;
  readonly plateauMinutes?: number;
  readonly decayMinutes?: number;
  /** Target metadata stamped on every composition entry. */
  readonly targets?: readonly string[];
}

export interface ScheduledWaveRow {
  readonly n: number;
  readonly threatIds: readonly string[];
  readonly roles: readonly ThreatRole[];
}

export interface DeckSchedule {
  readonly table: WaveTable;
  /** Per-wave placement record (converter order preserved). */
  readonly waves: readonly ScheduledWaveRow[];
}

interface PlacementSlot {
  readonly threatId: string;
  readonly role: ThreatRole;
}

interface WaveBin {
  readonly n: number;
  readonly slots: PlacementSlot[];
  readonly denominations: Set<string>;
}

/** Heaviest first, code-unit tiebreak — the RNG never touches placement
 *  (randomness decides drafts, legality decides schedules). */
function sortedDeckOrder(deck: ThreatDeck): readonly ThreatDeckEntry[] {
  return [...deck.entries].sort((a, b) => (a.weightBps !== b.weightBps
    ? b.weightBps - a.weightBps
    : compareCodeUnits(a.threatId, b.threatId)));
}

function forbiddenRoleFor(waveN: number, rho1: ThreatRole, rho2: ThreatRole): ThreatRole | null {
  if (waveN <= 3) return rho1; // wave 4's fresh role must stay unseen in 1..3
  if (waveN >= 5 && waveN <= 7) return rho2; // wave 8's fresh role unseen in 5..7
  return null;
}

function pickAllowedRole(roles: readonly ThreatRole[], forbidden: ThreatRole | null): ThreatRole | null {
  for (const role of roles) {
    if (role !== forbidden) return role;
  }
  return null;
}

/**
 * Convert a parsed ThreatDeck into a law-clean 8-wave WaveTable.
 * Throws VersusError DECK_ILLEGAL on an illegal deck (pool cap, per-
 * denomination quota, role floor) and DECK_UNPACKABLE when the packer
 * cannot honor the fronts/entry-cap laws or when the freshly-built table
 * fails waves/enforcer (self-check — the enforcer verdict is embedded in
 * the error detail, so a silent law break is impossible).
 */
export function deckToWaveTable(deck: ThreatDeck, options: DeckScheduleOptions): DeckSchedule {
  const legality = deckLegalityViolations(deck, options.census);
  if (legality.length > 0) {
    const first = legality[0] as { readonly code: string; readonly detail: string };
    throw new VersusError("DECK_ILLEGAL", `schedule.${first.code}`, first.detail);
  }

  // The id rides BOTH grammars: '~' delimits the wave unitId
  // (`tableId~n~threatId~ordinal`) and ':' delimits the arrival causeId
  // (`arrival:<tableId>:<tick>:<idx>`, read by splitting on ':' and taking
  // the LAST segment as the envelope index) — so it must be free of both.
  if (options.tableId.indexOf("~") !== -1 || options.tableId.indexOf(":") !== -1) {
    throw new VersusError("OUT_OF_RANGE", "schedule.tableId", `table id "${options.tableId}" must not contain '~' or ':' (they delimit the wave unitId and arrival causeId grammars)`);
  }

  const order = sortedDeckOrder(deck);
  const censusOf = (threatId: string): ThreatCensusEntry => {
    const meta = options.census.get(threatId);
    if (meta === undefined) {
      throw new VersusError("UNKNOWN_THREAT", "schedule.census", `"${threatId}" vanished from the census mid-conversion`);
    }
    return meta;
  };

  // Role anchors: ρ0 first-seen, ρ1 first role ≠ ρ0, ρ2 first role outside
  // both — scanned in deck-weight order so anchors are the heaviest
  // available faces of each fresh role. Deck legality guaranteed ≥3 roles.
  const roleSequence: ThreatRole[] = [];
  for (const entry of order) {
    for (const role of censusOf(entry.threatId).roles) {
      if (!roleSequence.includes(role)) roleSequence.push(role);
    }
  }
  const rho0 = roleSequence[0] as ThreatRole;
  const rho1 = roleSequence.find((role) => role !== rho0) as ThreatRole | undefined;
  const rho2 = roleSequence.find((role) => role !== rho0 && role !== rho1) as ThreatRole | undefined;
  if (rho1 === undefined || rho2 === undefined) {
    throw new VersusError("DECK_ILLEGAL", "schedule.anchors", "role scan lost its fresh-role anchors — census inconsistency");
  }

  const bins: WaveBin[] = [];
  for (let n = 1; n <= VERSUS_WAVE_COUNT; n += 1) {
    bins.push({ n, slots: [], denominations: new Set<string>() });
  }

  const tryPlace = (threatId: string, waveN: number, forcedRole: ThreatRole | null): boolean => {
    const bin = bins[waveN - 1] as WaveBin;
    if (bin.slots.length >= AUTHORING_LAWS.maxThreatEntriesPerWave) return false;
    if (bin.slots.some((slot) => slot.threatId === threatId)) return false;
    const meta = censusOf(threatId);
    if (bin.denominations.size + (bin.denominations.has(meta.denomination) ? 0 : 1) > AUTHORING_LAWS.maxDenominationsPerWave) return false;
    const role = forcedRole ?? pickAllowedRole(meta.roles, forbiddenRoleFor(waveN, rho1, rho2));
    if (role === null || !meta.roles.includes(role)) return false;
    bin.slots.push({ threatId, role });
    bin.denominations.add(meta.denomination);
    return true;
  };

  // Forced anchors first (the fresh-role cadence is non-negotiable).
  const anchor1 = order[0] as ThreatDeckEntry;
  const anchor4 = order.find((entry) => censusOf(entry.threatId).roles.includes(rho1));
  const anchor8 = order.find((entry) => censusOf(entry.threatId).roles.includes(rho2));
  if (anchor4 === undefined || anchor8 === undefined) {
    throw new VersusError("DECK_ILLEGAL", "schedule.anchors", "no deck threat plays the fresh anchor roles");
  }
  if (!tryPlace(anchor1.threatId, 1, rho0)
    || !tryPlace(anchor4.threatId, 4, rho1)
    || !tryPlace(anchor8.threatId, 8, rho2)) {
    throw new VersusError("DECK_UNPACKABLE", "schedule.anchors", "a single-entry wave refused its anchor — census/role desync");
  }

  // First-fit the rest, in sorted order, waves 1..8.
  const placed = new Set<string>([anchor1.threatId, anchor4.threatId, anchor8.threatId]);
  for (const entry of order) {
    if (placed.has(entry.threatId)) continue;
    let accepted = false;
    for (const bin of bins) {
      if (tryPlace(entry.threatId, bin.n, null)) {
        accepted = true;
        break;
      }
    }
    if (!accepted) {
      throw new VersusError("DECK_UNPACKABLE", "schedule.entries", `"${entry.threatId}" fits no wave under the ≤${AUTHORING_LAWS.maxThreatEntriesPerWave}-entry / ≤${AUTHORING_LAWS.maxDenominationsPerWave}-denomination fronts law (denomination "${censusOf(entry.threatId).denomination}") — split the deck or widen the schedule`);
    }
    placed.add(entry.threatId);
  }

  // Fill empty waves by cycling the sorted order (every wave needs ≥1
  // entry; repeats ACROSS waves are legal, within a wave guarded).
  for (const bin of bins) {
    if (bin.slots.length > 0) continue;
    let filled = false;
    for (let stride = 0; stride < order.length && !filled; stride += 1) {
      const candidate = order[(bin.n + stride) % order.length] as ThreatDeckEntry;
      filled = tryPlace(candidate.threatId, bin.n, null);
    }
    if (!filled) {
      throw new VersusError("DECK_UNPACKABLE", `schedule.waves[${bin.n}]`, "empty wave could not be filled from the deck");
    }
  }

  const targets: readonly string[] = options.targets ?? Object.freeze(["origin"]);
  const raw = {
    id: options.tableId,
    typeBundleId: options.typeBundleId,
    tuningSheet: options.tuningSheet ?? "B",
    unitsPerPressurePoint: options.unitsPerPressurePoint ?? 1,
    waves: bins.map((bin) => {
      const shares = VERSUS_SHARE_LADDERS[bin.slots.length as keyof typeof VERSUS_SHARE_LADDERS];
      return {
        n: bin.n,
        windowMinutes: options.windowMinutes ?? VERSUS_DEFAULT_WINDOW_MINUTES,
        rampMin: options.rampMinutes ?? VERSUS_DEFAULT_RAMP_MINUTES,
        plateauMin: options.plateauMinutes ?? VERSUS_DEFAULT_PLATEAU_MINUTES,
        decayMin: options.decayMinutes ?? VERSUS_DEFAULT_DECAY_MINUTES,
        parPct: VERSUS_PAR_LADDER_PCT[bin.n - 1] as number,
        hard: false,
        entries: bin.slots.map((slot, index) => {
          const meta = censusOf(slot.threatId);
          return {
            threatId: slot.threatId,
            role: slot.role,
            family: meta.family,
            band: meta.band,
            sharePct: shares[index] as number,
            denominations: [meta.denomination],
            targets,
          };
        }),
      };
    }),
  };

  const table = parseWaveTable(raw);
  const violations: readonly WaveViolation[] = enforceWaveTable(table);
  if (violations.length > 0) {
    const detail = violations.map((violation) => `${violation.code}@wave${violation.waveN}`).join(", ");
    throw new VersusError("DECK_UNPACKABLE", "schedule.enforcement", `converted table violates the authoring laws: ${detail}`);
  }

  return Object.freeze({
    table,
    waves: Object.freeze(bins.map((bin) => Object.freeze({
      n: bin.n,
      threatIds: Object.freeze(bin.slots.map((slot) => slot.threatId)),
      roles: Object.freeze(bin.slots.map((slot) => slot.role)),
    }))),
  });
}

/* ═══════════════════════════ committed defender (pure data) ═══════════════════════════ */

/** Node blueprints — minted into NodeRecords inside every runner call. */
export interface VersusNodeCommit {
  readonly id: string;
  readonly slots: number;
  readonly serviceTimeUs: bigint;
  readonly inspectionDepth: InspectionDepth;
  readonly dependencyId: string | null;
}

/** Initial board edges committed by the defender (door-grammar ids are
 *  derived here; endpoints must stay colon-free). */
export interface VersusEdgeCommit {
  readonly relation: BoardRelation;
  readonly from: string;
  readonly to: string;
  readonly slot?: string | null;
}

export type ReserveIntentCommit =
  | { readonly verb: "place-device"; readonly nodeId: string; readonly deviceKind: string; readonly template?: string | null }
  | { readonly verb: "connect-ports"; readonly relation: BoardRelation; readonly from: string; readonly to: string; readonly slot?: string | null }
  | { readonly verb: "policy-card-commit"; readonly cardHash: string }
  | { readonly verb: "configure-node"; readonly nodeId: string; readonly inspectionDepth?: InspectionDepth | null; readonly shedOrder?: ShedOrder | null };

/** One queued defender order: executed (or refused) by the REAL door at
 *  its tick — pause-with-orders contract, every entry fed exactly once. */
export interface VersusReserveIntent {
  readonly tick: number;
  readonly intent: ReserveIntentCommit;
}

export interface DefenderCommit {
  readonly engineVersion: string;
  readonly sheetsHash: string;
  /** THE doctrine: Policy-Book cards evaluated by the rule phase every
   *  tick (the autopilot). Hash-bound into contentHashes via a canonical
   *  fold (same family as the deck commitment, `hh-versus-book-v1` tag). */
  readonly ruleBook: readonly PolicyCard[];
  /** Optional explicit hash→card binding for policy-card-commit verbs.
   *  Keys MUST be `hh-card-v1` content fingerprints (`cardContentFingerprint`)
   *  — owner-ratified 2026-10-09 flip: the default indexes ruleBook by
   *  CONTENT FINGERPRINT, never by card.id (which is display metadata only).
   *  The door treats the callback as opaque, so a host wiring its own map
   *  controls its own key space — fingerprint keys are the lane law. */
  readonly policyCardsByHash?: ReadonlyMap<string, PolicyCard>;
  readonly nodes: readonly VersusNodeCommit[];
  readonly edges?: readonly VersusEdgeCommit[];
  readonly routing: {
    readonly expressPath: readonly string[];
    readonly deepPath: readonly string[];
  };
  /** Defense-deck buildables: the canPlaceDevice universe. */
  readonly buildables: readonly string[];
  readonly handCapacity: number;
  readonly reserveIntents?: readonly VersusReserveIntent[];
  readonly detectionRatio?: Fixed;
  readonly falsePositiveRatio?: Fixed;
  /** Observed gauge the doctrine reads: one cell per tick carrying the
   *  real cumulative arrival count (the smoke-test interlock recipe). */
  readonly doctrineGauge?: { readonly nodeId: string; readonly metric: string };
}

/* ═══════════════════════════ scoring (weights as DATA) ═══════════════════════════ */

/** Every coefficient is caller-supplied bigint µ-units — the module NEVER
 *  resolves a scorecard or tuning sheet (OD-1/OD-2 unchosen). */
export interface MatchScoringWeights {
  readonly landedValue: bigint;
  readonly blockedValue: bigint;
  readonly servedValue: bigint;
  readonly falsePositivePenalty: bigint;
}

/** Neutral-money defaults (attacker pays per breach, defender banks
 *  blocks and served customers; FP stings hardest — §9.x versus scoring
 *  sketch). Pure data; callers pass their own record to re-price. */
export const DEFAULT_MATCH_WEIGHTS: MatchScoringWeights = Object.freeze({
  landedValue: -50_000_000n,
  blockedValue: 2_000_000n,
  servedValue: 1_000_000n,
  falsePositivePenalty: -20_000_000n,
});

/* ═══════════════════════════ outcomes / result shapes ═══════════════════════════ */

export interface OutcomeCounters {
  readonly served: number;
  readonly blocked: number;
  readonly falsePositive: number;
  readonly landed: number;
}

export interface PerWaveOutcome extends OutcomeCounters {
  /** "wave-<n>", "baseline", or "unattributed" (row present only when >0). */
  readonly label: string;
  readonly waveN: number | null;
}

export type OutcomeTotals = OutcomeCounters;

export interface MatchResult {
  readonly tableId: string;
  readonly deckId: string;
  readonly seed: RunSeed;
  readonly schedule: readonly ScheduledWaveRow[];
  readonly perWaveOutcomes: readonly PerWaveOutcome[];
  readonly totals: OutcomeTotals;
  readonly ruleFirings: number;
  /** digestState over the terminal GameState (pipeline double-FNV). */
  readonly finalDigest: string;
  /** Σ counters × weights, bigint µ-units (weights as data). */
  readonly matchScore: bigint;
  /** Heaviest landed wave (tie → most blocked → lowest n). */
  readonly decisiveWaveN: number;
  /** One-sentence causal story of the decisive wave's terminal cause,
   *  built by replay/causality over the REAL event stream. */
  readonly attribution: string;
  /** The effect causeId the attribution explains (null: no attributable
   *  terminal outcome in the decisive wave). */
  readonly attributionCauseId: string | null;
}

/** Pure score fold — exported so callers can re-price a result. */
export function scoreVersusMatch(totals: OutcomeTotals, weights: MatchScoringWeights): bigint {
  return BigInt(totals.landed) * weights.landedValue
    + BigInt(totals.blocked) * weights.blockedValue
    + BigInt(totals.served) * weights.servedValue
    + BigInt(totals.falsePositive) * weights.falsePositivePenalty;
}

/* ═══════════════════════════ match config ═══════════════════════════ */

export interface VersusMatchConfig {
  readonly seed: RunSeed;
  readonly deck: ThreatDeck;
  readonly census: ReadonlyMap<string, ThreatCensusEntry>;
  readonly tableId: string;
  readonly typeBundleId: string;
  readonly defender: DefenderCommit;
  readonly scoring?: MatchScoringWeights;
  readonly pressure: PressureParams;
  readonly unitsPerPressurePoint?: number;
  readonly tuningSheet?: TuningSheetId;
  /** Total sim-minutes to run (1 tick = 1 sim minute). Cover
   *  waveStartMinute + 8×window for every wave to spawn. */
  readonly matchTicks: number;
  readonly waveStartMinute?: number;
  readonly waveWindowMinutes?: number;
  /** Organic customer baseline (the defender's legitimate crowd): powers
   *  the served / false-positive arm. Omit for a pure zero-day run (then
   *  the served arm legitimately reads zero). */
  readonly customerBaseline?: { readonly tableId: string; readonly unitsPerMinute: number };
  readonly aggression?: Fixed;
  readonly expressMaxConfidence?: Fixed;
  /** Queue patience in sim-minutes (default 3 — a patient board lets some
   *  adversarial units complete INSPECTION and land; a tight one makes the
   *  landed arm flaky, which is a design choice, not a gate bug). */
  readonly patienceMinutes?: number;
}

/* ═══════════════════════════ run state (harness-visible) ═══════════════════════════ */

export interface VersusRunState {
  readonly game: GameState;
  readonly totals: OutcomeTotals;
  readonly ruleFirings: number;
}

/* ═══════════════════════════ shared fixtures ═══════════════════════════ */

const MATCH_CLASSES: readonly QosClassDef[] = Object.freeze([
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

const MATCH_RETRY: RetryPolicy = Object.freeze({
  maxRetries: 2,
  backoffBaseUs: 2n * MICROS_PER_MIN,
  jitterPurchased: false,
});

const INSPECTION_COST_US = Object.freeze({
  "pass-through": 0n,
  "sample-1-in-20": 3n * 1_000_000n,
  inspect: 10n * 1_000_000n,
  challenge: 20n * 1_000_000n,
});

const DEFAULT_AGGRESSION: Fixed = fromRatio(7n, 10n);
const DEFAULT_EXPRESS_MAX_CONFIDENCE: Fixed = fromRatio(6n, 10n);

function mkNode(commit: VersusNodeCommit): NodeRecord {
  return Object.freeze({
    id: asEntityId(commit.id),
    kind: "generic",
    slots: makeSlots(commit.slots),
    serviceTimeUs: commit.serviceTimeUs,
    queueDepth: 0,
    queue: Object.freeze([]),
    shedOrder: "qos-weighted" as const,
    inspectionDepth: commit.inspectionDepth,
    discipline: "hockey-stick" as const,
    utilizationRho: 0n,
    dependencyNodeId: commit.dependencyId === null ? null : asEntityId(commit.dependencyId),
  });
}

function edgeIdFor(edge: VersusEdgeCommit): EntityId {
  const base = `edge:${edge.relation}:${edge.from}->${edge.to}`;
  return asEntityId(edge.relation === "power" && (edge.slot ?? null) !== null ? `${base}:${edge.slot}` : base);
}

function boardEdgeRecords(edges: readonly VersusEdgeCommit[]): readonly BoardEdgeRecord[] {
  return edges.map((edge) => Object.freeze({
    id: edgeIdFor(edge),
    relation: edge.relation,
    from: asEntityId(edge.from),
    to: asEntityId(edge.to),
    slot: edge.slot ?? null,
  }));
}

/** Canonical fold of the doctrine — same family as the deck commitment
 *  (sorted-key tagged JSON + avalanche FNV), distinct domain tag. */
export function versusRuleBookHash(ruleBook: readonly PolicyCard[]): string {
  const json = JSON.stringify(encodeTaggedTree(ruleBook, (problem) => {
    throw new VersusError("WRONG_TYPE", "match.ruleBookHash", `canonical fold refused (${problem.kind})`);
  }));
  return `hh-versus-book-v1:${fnv1a64OverBytes(utf8Bytes(json))}`;
}

/**
 * THE card identity law (owner-ratified 2026-10-09, ADR-0009 versus row):
 * a versus policy-card reference is keyed by CONTENT FINGERPRINT, never by
 * `card.id`. Same family as the deck commitment and the doctrine fold:
 * canonical tagged-JSON (code-unit-sorted keys by construction, bigints
 * tagged) + FNV-1a-64 avalanche over UTF-8 bytes, domain tag `hh-card-v1`.
 *
 * IDENTITY = BYTES OF CONTENT: `card.id` is stripped before the fold — it
 * stays display metadata only (the door's `card-id-collision` refusal still
 * speaks ids, which is exactly the point: ids are labels, the fingerprint is
 * the thing). Consequences the tests pin:
 *  • same content under different ids → SAME fingerprint (keying is content);
 *  • re-authored content under the old id → DIFFERENT fingerprint, so an
 *    old commitment hash resolves to the old bytes or to nothing — a card
 *    cannot be swapped under its own name (the reveal-binds-bytes precedent
 *    of commit.ts, applied to per-card lookup);
 *  • `policyCardHashes` (defense deck) and the default `policyCardsByHash`
 *    index are `hh-card-v1` fingerprints from here on.
 *
 * Like every hash in this family this is a deterministic fingerprint, not a
 * cryptographic digest; the version tag means a future format change gets a
 * NEW tag rather than silently re-binding old references.
 */
export function cardContentFingerprint(card: PolicyCard): string {
  const { id: _displayIdOnly, ...content } = card;
  const json = JSON.stringify(encodeTaggedTree(content, (problem) => {
    throw new VersusError("WRONG_TYPE", "match.cardContentFingerprint", `canonical fold refused (${problem.kind})`);
  }));
  return `hh-card-v1:${fnv1a64OverBytes(utf8Bytes(json))}`;
}

/**
 * Build the DEFAULT `policyCardsByHash` index the door consults for
 * `policy-card-commit` verbs — keyed by CONTENT FINGERPRINT (`hh-card-v1`),
 * NEVER by `card.id` (owner-ratified 2026-10-09). `createVersusEngine` falls
 * back to this only when the host supplies no explicit map; the fingerprint
 * identity law (`cardContentFingerprint`) is what makes an id-shaped commit
 * hash resolve to nothing (→ `unknown-card-hash`). Extracted from the inline
 * Map literal so the key space is a NAMED, TESTABLE law: re-keying it back to
 * `card.id` is a one-line edit that the `defaultPolicyCardIndex` pin in
 * match.test.ts goes red on — the ONLY place the default map's key space is
 * exercised (every door-wiring test injects its own explicit map).
 *
 * Collision law (pinned by test): two content-identical cards under different
 * ids fold to the SAME fingerprint, so they collapse to ONE entry — the fold
 * drops `id`, therefore the later card wins the shared key slot (Map insert
 * order: last write overwrites).
 */
export function defaultPolicyCardIndex(cards: readonly PolicyCard[]): ReadonlyMap<string, PolicyCard> {
  return new Map<string, PolicyCard>(cards.map((card) => [cardContentFingerprint(card), card]));
}

const VERB_BY_COMMIT: Readonly<Record<ReserveIntentCommit["verb"], PlayerVerb>> = Object.freeze({
  "place-device": PlayerVerb.PlaceDevice,
  "connect-ports": PlayerVerb.ConnectPorts,
  "policy-card-commit": PlayerVerb.PolicyCardCommit,
  "configure-node": PlayerVerb.ConfigureNode,
});

/** Defender reserve → door wire format (stamped once; seq is queue order). */
export function stampReserveIntents(intents: readonly VersusReserveIntent[]): readonly ExternalIntent[] {
  return Object.freeze(intents.map((entry, index) => {
    const commit = entry.intent;
    // The door's VERB_ARG_SHAPES require every per-verb field on the wire
    // (string-or-null fields must be PRESENT) — fill declared defaults.
    const withDefaults: ReserveIntentCommit = commit.verb === "place-device"
      ? { ...commit, template: commit.template ?? null }
      : commit.verb === "connect-ports"
        ? { ...commit, slot: commit.slot ?? null }
        : commit.verb === "configure-node"
          ? { ...commit, inspectionDepth: commit.inspectionDepth ?? null, shedOrder: commit.shedOrder ?? null }
          : commit;
    const args = { ...withDefaults, verb: VERB_BY_COMMIT[commit.verb] } as PlayerVerbPayload["args"];
    return Object.freeze({
      tick: BigInt(entry.tick),
      intent: Object.freeze({
        seq: index + 1,
        clock: "sim" as const,
        atUs: BigInt(entry.tick) * MICROS_PER_MIN,
        origin: "player" as const,
        payload: Object.freeze({ kind: "player-verb" as const, args }),
      }),
    });
  }));
}

/* ═══════════════════════════ the composed run ═══════════════════════════ */

interface WaveWindow {
  readonly n: number;
  readonly startMinute: number;
  readonly windowMinutes: number;
  readonly envelope: WaveEnvelope;
}

interface MutableCounters {
  served: number;
  blocked: number;
  falsePositive: number;
  landed: number;
}

interface VersusRun {
  readonly state: VersusRunState;
  readonly events: readonly SimEvent[];
  readonly counters: ReadonlyMap<string, OutcomeCounters>;
  readonly unitLabel: ReadonlyMap<EntityId, string>;
  readonly arrivalCauseByUnit: ReadonlyMap<EntityId, CauseId>;
  readonly retryParent: ReadonlyMap<EntityId, EntityId>;
  readonly schedule: DeckSchedule;
}

/** exactOptionalPropertyTypes-safe option build (no undefined-valued keys). */
function scheduleOptionsFrom(config: VersusMatchConfig): DeckScheduleOptions {
  return {
    census: config.census,
    tableId: config.tableId,
    typeBundleId: config.typeBundleId,
    ...(config.tuningSheet === undefined ? {} : { tuningSheet: config.tuningSheet }),
    ...(config.unitsPerPressurePoint === undefined ? {} : { unitsPerPressurePoint: config.unitsPerPressurePoint }),
    ...(config.waveWindowMinutes === undefined ? {} : { windowMinutes: config.waveWindowMinutes }),
  };
}

/**
 * The canonical loop and every mutable object it closes over, in resumable
 * form. ONE engine per consumer: `advanceTo` replays the tick body verbatim
 * from the current cursor; `finish` seals the run into the full VersusRun.
 * `simulateVersus` is a thin monolithic wrapper (enqueue → advance → finish)
 * and the memoized runner drives the SAME methods — both paths execute one
 * shared line of sim code, so their byte-identity is structural, not a hope.
 *
 * SNAPSHOT SAFETY (why a stored per-tick state needs no clone) — the
 * pipeline's immutable-by-convention law:
 *  • driver.ts "rebuild GameState (immutable-by-convention)": every advance
 *    mints fresh frozen `units`/`nodes`/`lanes`/`observed` values, and
 *    pipeline/internal.ts `withUnit` is copy-on-write;
 *  • observed/store.ts `canonicalizeCellAtGate` freezes every cell at the
 *    write gate and later ticks REPLACE map entries (`#cells.set`) — stored
 *    cell objects are never mutated in place;
 *  • the intent door writes hands/board/ruleBook as fresh frozen slices and
 *    leaves the origin untouched on refusal — pinned by
 *    pipeline/__tests__/intent-door.test.ts:602 ("execution never mutates
 *    units/lanes/observed/cash/contracts") and :652 (edge-map identity).
 * A GameState observed at tick t is therefore an immutable value: the memo
 * stores the REFERENCE. The versus loop's own per-tick wrapper
 * (`Object.freeze({ ...game, observed })`) is likewise minted fresh per tick.
 *
 * Intent-log law (mirrors replay/verify.ts's runner licence — "a runner may
 * be a full re-sim ... or wrap an incremental engine — determinism only
 * requires that (initialState, seed, intents≤tick) → stateAtTick is a pure
 * function"): each request's `intentsUpToTick` must be the tick-filtered
 * prefix of ONE stamped log (the harness/capture filter a single stamped log
 * by tick, so every shorter request is a prefix of every longer one — by
 * object IDENTITY, which `filter` preserves). createVersusRunner validates
 * the law per request and degrades LOUDLY-CORRECT on breach: a late reveal
 * rebuilds the engine, a rival prefix turns memoization off for good — the
 * caller pays time, never a wrong answer. "Loudly" is literal since the
 * R6 watchlist fix: every breach is observable on `runner.memoStats()`
 * (`rebuilds` / `degraded` / `enabled`).
 */
interface VersusEngine {
  /** Highest tick the forward pass has completed (0 = the committed start). */
  cursorTick(): number;
  /** Queue every not-yet-seen intent (bucketed by tick, arrival order —
   *  structurally identical to the monolithic pre-loop queue build; identity
   *  dedup makes repeated prefixes of one log a no-op). */
  enqueueIntents(intents: readonly ExternalIntent[]): void;
  /** Run the tick body from cursor+1 through `targetTick`, calling
   *  `onTick(tick, snapshot)` after each completed tick. */
  advanceTo(
    targetTick: number,
    onTick?: (tick: number, state: VersusRunState) => void,
  ): void;
  /** Fresh frozen runner-visible state at the current cursor. */
  stateSnapshot(): VersusRunState;
  /** Seal the run (terminal: the event log freezes with it). */
  finish(): VersusRun;
}

/** Everything mutable is minted HERE — purity by construction (once per
 *  engine; the runner's memo reuses one engine across requests, which the
 *  VersusEngine docblock proves keeps same-request ⇒ same-answer exact). */
function createVersusEngine(config: VersusMatchConfig): VersusEngine {
  const schedule = deckToWaveTable(config.deck, scheduleOptionsFrom(config));

  const seed = config.seed;
  const defender = config.defender;
  const windowMinutes = config.waveWindowMinutes ?? VERSUS_DEFAULT_WINDOW_MINUTES;
  const waveStartMinute = config.waveStartMinute ?? 2;

  // Wave plans (offline, deterministic): director nudge → planWave, the
  // exact smoke recipe, once per wave across the eight timed slots.
  const windows: WaveWindow[] = [];
  let director: DirectorState = INITIAL_DIRECTOR_STATE;
  for (const wave of schedule.table.waves) {
    const startMinute = waveStartMinute + (wave.n - 1) * windowMinutes;
    const rng: RngStream = waveStream(seed, wave.n, startMinute);
    const proposed = directorPropose(director, BigInt(startMinute), streamFor(seed, "director", startMinute));
    director = proposed.next;
    const plan = planWave(schedule.table, wave.n, {
      startMinute,
      tick: BigInt(startMinute),
      rng,
      director,
      ledger: ledgerSnapshot([], 0n),
      invitations: buildInvitations({}),
      entropyForecastPurchased: false,
      pressureParams: config.pressure,
    });
    windows.push({ n: wave.n, startMinute: plan.startMinute, windowMinutes: wave.windowMinutes, envelope: plan.waveEnvelope });
  }

  const ruleBookHash = versusRuleBookHash(defender.ruleBook);
  const board = createBoardState(defender.edges === undefined ? [] : boardEdgeRecords(defender.edges));
  const game0 = createInitialState({
    runSeed: seed,
    engineVersion: defender.engineVersion,
    contentHashes: { rulesetCardHashes: {}, sheetsHash: defender.sheetsHash, ruleBookHash },
    clocks: initialClocks(),
    nodes: defender.nodes.map(mkNode),
    ruleBook: defender.ruleBook,
    ruleBookHash,
    board,
    hands: mintHandState(defender.handCapacity),
  });

  const buildableSet = new Set<string>(defender.buildables);
  // CONTENT-fingerprint keying (owner-ratified 2026-10-09): the default index
  // folds each ruleBook card through `defaultPolicyCardIndex` (fingerprint
  // keys, never card.id — see that function's law). A host wiring its own map
  // controls its own key space; the door treats the callback as opaque.
  const cardsByHash: ReadonlyMap<string, PolicyCard> = defender.policyCardsByHash
    ?? defaultPolicyCardIndex(defender.ruleBook);
  const doorConfig: IntentDoorConfig = Object.freeze({
    handCapacity: defender.handCapacity,
    canPlaceDevice: (query: PlaceDeviceQuery) => (buildableSet.has(query.args.deviceKind)
      ? null
      : { reason: `versus: buildable "${query.args.deviceKind}" is not in the committed defense deck` }),
    lookupPolicyCard: (hash: string) => cardsByHash.get(hash) ?? null,
    deviceSlots: 2,
    deviceServiceTimeUs: MICROS_PER_MIN,
  });

  const pipelineConfig = Object.freeze({
    runSeed: seed,
    dnsNodeId: null,
    expressPath: defender.routing.expressPath.map((id) => asEntityId(id)),
    deepPath: defender.routing.deepPath.map((id) => asEntityId(id)),
    defaultPatienceUs: BigInt(config.patienceMinutes ?? 3) * MICROS_PER_MIN,
    defaultSizeCost: fromInt(1),
    patienceJitterPct: 0,
    inspectionCostUs: INSPECTION_COST_US,
    detectionRatio: defender.detectionRatio ?? fromRatio(9n, 10n),
    falsePositiveRatio: defender.falsePositiveRatio ?? fromRatio(10n, 100n),
    referralProbability: FIXED_ZERO,
    returnProbability: FIXED_ZERO,
  });

  const baseline = config.customerBaseline;
  const baselineEnvelope: WaveEnvelope | null = baseline === undefined ? null : Object.freeze({
    tableId: baseline.tableId,
    role: "baseline" as const,
    shape: "plateau" as const,
    ratePerMin: fromInt(baseline.unitsPerMinute),
    telegraphed: true,
    dominantFamily: "organic" as const,
  });

  const dependencyEdges = Object.freeze(
    defender.routing.deepPath.slice(1).map((downstream, index) => Object.freeze({
      upstreamNodeId: asEntityId(defender.routing.deepPath[index] as string),
      downstreamNodeId: asEntityId(downstream),
      correlation: "software" as const,
    })),
  );

  const rulePhase = createRulePhaseStep();
  const slots = Object.freeze({ ...createDefaultSlots(pipelineConfig), rulePhase: rulePhase.step });
  const driver = createTickDriver(slots, streamFor(seed, "root", 0), game0.context.clocks, { intents: doorConfig });
  const store = new ObservedStore();

  const intentQueue = new Map<string, readonly ExternalIntent[]>();
  const seenIntents = new Set<ExternalIntent>();

  const counters = new Map<string, MutableCounters>();
  const bump = (label: string, terminal: OutcomeTerminal): void => {
    const row = counters.get(label) ?? { served: 0, blocked: 0, falsePositive: 0, landed: 0 };
    if (terminal === "served") row.served += 1;
    else if (terminal === "bounced") row.blocked += 1;
    else if (terminal === "blocked-false-positive") row.falsePositive += 1;
    else if (terminal === "landed") row.landed += 1;
    // Exhaustive by law: an unknown terminal must never fold silently into
    // the landed column — a future OutcomeTerminal member has to be priced
    // here deliberately (fail fast, fail loud).
    else throw new VersusError("WRONG_TYPE", "match.bump", `unknown terminal "${String(terminal)}" has no counter column`);
    counters.set(label, row);
  };

  const unitLabel = new Map<EntityId, string>();
  const arrivalCauseByUnit = new Map<EntityId, CauseId>();
  const retryParent = new Map<EntityId, EntityId>();

  let game = game0;
  let ruleFirings = 0;
  let arrivalsSeen = 0;
  let cursor = 0;
  let finished = false;
  const events: SimEvent[] = [];
  const gaugeNode = asEntityId(defender.doctrineGauge?.nodeId ?? (defender.nodes[0]?.id ?? "versus-gauge"));
  const gaugeMetric = asMetricId(defender.doctrineGauge?.metric ?? "incoming");

  const tickOnce = (): void => {
    const t = cursor + 1;
    const minute = game.context.minute + 1;
    const active: WaveEnvelope[] = [];
    const labels: string[] = [];
    for (const window of windows) {
      if (minute >= window.startMinute && minute < window.startMinute + window.windowMinutes) {
        active.push(window.envelope);
        labels.push(`wave-${window.n}`);
      }
    }
    if (baselineEnvelope !== null) {
      active.push(baselineEnvelope);
      labels.push(BASELINE_LABEL);
    }
    const due = intentQueue.get(String(BigInt(t)));

    const result = driver.advance(game, Object.freeze({
      envelopes: Object.freeze(active),
      evidence: Object.freeze([]),
      classes: MATCH_CLASSES,
      dependencyEdges,
      retryPolicy: MATCH_RETRY,
      aggression: config.aggression ?? DEFAULT_AGGRESSION,
      expressMaxConfidence: config.expressMaxConfidence ?? DEFAULT_EXPRESS_MAX_CONFIDENCE,
      ...(due === undefined ? {} : { externalIntents: due }),
    }));
    game = result.state;
    ruleFirings += result.ruleFirings.length;

    for (const event of result.events) {
      events.push(event);
      if (event.kind === "arrival") {
        arrivalsSeen += 1;
        // causeId grammar: arrival:<tableId>:<tick>:<envelopeIndex>
        const parts = event.causeId.split(":");
        const envelopeIndex = Number(parts[parts.length - 1]);
        const label = Number.isInteger(envelopeIndex) ? labels[envelopeIndex] ?? UNATTRIBUTED : UNATTRIBUTED;
        unitLabel.set(event.unitId, label);
      }
      // Retry events are SELF-REFERENTIAL at scheduling (the pipeline emits
      // RetryEvent{unitId: X, retryOf: X} for the BOUNCING unit — the child
      // id does not exist yet). Writing from them here could only plant a
      // premature UNATTRIBUTED that poison-blocks the sweep's `has` guard;
      // lineage belongs to propagateRetryLineage + resolveUnitLabel alone.
    }

    // Lineage sweep: matured re-entries arrive as fresh ids WITHOUT arrival
    // events (driver mints `re<counter>@<tick>`), so labels and root arrival
    // causes propagate through the unit.retryOf chain here, every tick.
    propagateRetryLineage(game, unitLabel, arrivalCauseByUnit, retryParent);

    for (const outcome of result.outcomes) {
      bump(resolveUnitLabel(outcome.unitId, unitLabel, retryParent), outcome.terminal);
    }

    store.applyObservedWrites(Object.freeze([
      Object.freeze({
        key: observedKey(gaugeNode, gaugeMetric),
        cell: doctrineCell(fromInt(arrivalsSeen)),
        causeId: asCauseId(`versus:gauge:${t}`),
      }),
    ]), game.context.clocks.simUs);
    const merged = new Map(game.observed);
    for (const [key, cell] of store.toObservedMap()) merged.set(key, cell);
    game = Object.freeze({ ...game, observed: Object.freeze(merged) });
  };

  const stateSnapshot = (): VersusRunState => Object.freeze({
    game,
    totals: totalsOf(counters),
    ruleFirings,
  });

  return {
    cursorTick: () => cursor,

    enqueueIntents: (intents: readonly ExternalIntent[]): void => {
      for (const intent of intents) {
        if (seenIntents.has(intent)) continue;
        seenIntents.add(intent);
        const key = String(intent.tick);
        const bucket = intentQueue.get(key);
        intentQueue.set(key, bucket === undefined ? [intent] : [...bucket, intent]);
      }
    },

    advanceTo: (
      targetTick: number,
      onTick?: (tick: number, state: VersusRunState) => void,
    ): void => {
      if (finished) {
        throw new VersusError("OUT_OF_RANGE", "match.advanceTo", "engine already finished — finish() seals the event log");
      }
      if (!Number.isSafeInteger(targetTick) || targetTick < cursor) {
        throw new VersusError("OUT_OF_RANGE", "match.advanceTo", `targetTick ${targetTick} is not a safe integer ≥ cursor ${cursor}`);
      }
      for (; cursor < targetTick; ) {
        tickOnce();
        cursor += 1;
        onTick?.(cursor, stateSnapshot());
      }
    },

    stateSnapshot,

    finish: (): VersusRun => {
      finished = true;
      const frozenCounters = new Map<string, OutcomeCounters>();
      for (const [label, row] of counters) frozenCounters.set(label, Object.freeze({ ...row }));

      return Object.freeze({
        state: Object.freeze({
          game,
          totals: totalsOf(frozenCounters),
          ruleFirings,
        }),
        events: Object.freeze(events),
        counters: Object.freeze(frozenCounters),
        unitLabel,
        arrivalCauseByUnit,
        retryParent,
        schedule,
      });
    },
  };
}

/** Monolithic re-simulation: one fresh engine, one forward pass, full
 *  VersusRun. This is the naive reference path — the memoized runner must
 *  answer byte-identically to `.state` here at every tick (proven by
 *  __tests__/match-memo.test.ts). */
function simulateVersus(
  config: VersusMatchConfig,
  targetTick: number,
  stampedIntents: readonly ExternalIntent[],
): VersusRun {
  const engine = createVersusEngine(config);
  engine.enqueueIntents(stampedIntents);
  engine.advanceTo(targetTick);
  return engine.finish();
}

/** Outcome-side resolution: terminal units may be pruned from state.units
 *  in the SAME advance that minted them (immediate bounce), so the retryParent
 *  map — fed by every sweep — is the durable ancestry to walk. */
function resolveUnitLabel(
  unitId: EntityId,
  unitLabel: ReadonlyMap<EntityId, string>,
  retryParent: ReadonlyMap<EntityId, EntityId>,
): string {
  const direct = unitLabel.get(unitId);
  if (direct !== undefined) return direct;
  let cursor: EntityId | undefined = retryParent.get(unitId);
  const seen = new Set<EntityId>([unitId]);
  while (cursor !== undefined && seen.size < 64) {
    if (seen.has(cursor)) break;
    seen.add(cursor);
    const label = unitLabel.get(cursor);
    if (label !== undefined) return label;
    cursor = retryParent.get(cursor);
  }
  return UNATTRIBUTED;
}

function resolveArrivalCause(
  unitId: EntityId,
  arrivalCauseByUnit: ReadonlyMap<EntityId, CauseId>,
  retryParent: ReadonlyMap<EntityId, EntityId>,
): CauseId | undefined {
  const direct = arrivalCauseByUnit.get(unitId);
  if (direct !== undefined) return direct;
  let cursor: EntityId | undefined = retryParent.get(unitId);
  const seen = new Set<EntityId>([unitId]);
  while (cursor !== undefined && seen.size < 64) {
    if (seen.has(cursor)) break;
    seen.add(cursor);
    const cause = arrivalCauseByUnit.get(cursor);
    if (cause !== undefined) return cause;
    cursor = retryParent.get(cursor);
  }
  return undefined;
}

/** Walk each re-entry's retryOf chain to the nearest labelled ancestor.
 *  Bounded walk (guard 64) mirrors driver.resolveRoot. */
function propagateRetryLineage(
  game: GameState,
  unitLabel: Map<EntityId, string>,
  arrivalCauseByUnit: Map<EntityId, CauseId>,
  retryParent: Map<EntityId, EntityId>,
): void {
  for (const unit of game.units.values()) {
    if (unit.retryOf !== null) retryParent.set(unit.id, unit.retryOf);
    if (unitLabel.has(unit.id)) continue;
    let cursor: EntityId | null = unit.retryOf;
    const seen = new Set<EntityId>();
    while (cursor !== null && seen.size < 64) {
      if (seen.has(cursor)) break;
      seen.add(cursor);
      const label = unitLabel.get(cursor);
      if (label !== undefined) {
        unitLabel.set(unit.id, label);
        const cause = arrivalCauseByUnit.get(cursor);
        if (cause !== undefined) arrivalCauseByUnit.set(unit.id, cause);
        break;
      }
      cursor = game.units.get(cursor)?.retryOf ?? null;
    }
  }
}

function doctrineCell(value: bigint): ObservedCell<unknown> {
  return Object.freeze({
    value,
    fidelity: 4 as ResolutionBand,
    freshnessUs: 0n,
    coverage: fromInt(1),
    certainty: fromInt(1),
    status: "live" as const,
  });
}

function totalsOf(counters: ReadonlyMap<string, OutcomeCounters>): OutcomeTotals {
  let served = 0;
  let blocked = 0;
  let falsePositive = 0;
  let landed = 0;
  for (const row of counters.values()) {
    served += row.served;
    blocked += row.blocked;
    falsePositive += row.falsePositive;
    landed += row.landed;
  }
  return Object.freeze({ served, blocked, falsePositive, landed });
}

function perWaveRows(
  counters: ReadonlyMap<string, OutcomeCounters>,
  baselineEnabled: boolean,
): readonly PerWaveOutcome[] {
  const rows: PerWaveOutcome[] = [];
  for (let n = 1; n <= VERSUS_WAVE_COUNT; n += 1) {
    const row = counters.get(`wave-${n}`) ?? { served: 0, blocked: 0, falsePositive: 0, landed: 0 };
    rows.push(Object.freeze({ label: `wave-${n}`, waveN: n, ...row }));
  }
  if (baselineEnabled) {
    const row = counters.get(BASELINE_LABEL) ?? { served: 0, blocked: 0, falsePositive: 0, landed: 0 };
    rows.push(Object.freeze({ label: BASELINE_LABEL, waveN: null, ...row }));
  }
  const stray = counters.get(UNATTRIBUTED);
  if (stray !== undefined) {
    rows.push(Object.freeze({ label: UNATTRIBUTED, waveN: null, ...stray }));
  }
  return Object.freeze(rows);
}

/* ═══════════════════════════ attribution ═══════════════════════════ */

function labelOf(unitId: EntityId, unitLabel: ReadonlyMap<EntityId, string>): string {
  return unitLabel.get(unitId) ?? UNATTRIBUTED;
}

/** `${tableId}~${n}~${threatId}~${ordinal}` — the waves/generate grammar. */
function threatFromWaveUnitId(unitId: string, tableId: string): string | null {
  if (!unitId.startsWith(`${tableId}~`)) return null;
  return unitId.split("~")[2] ?? null;
}

function summarizeVersusEvent(
  event: SimEvent,
  unitLabel: ReadonlyMap<EntityId, string>,
  tableId: string,
): string {
  const at = `tick ${event.tick}`;
  switch (event.kind) {
    case "arrival": {
      const threat = threatFromWaveUnitId(event.unitId, tableId);
      const label = labelOf(event.unitId, unitLabel);
      return threat === null ? `${label} arrival (${at})` : `${label}: ${threat} arrives (${at})`;
    }
    case "landed":
      return `${labelOf(event.unitId, unitLabel)} BREACHES ${event.targetId} (${at})`;
    case "bounced":
      return `${labelOf(event.unitId, unitLabel)} blocked${event.nodeId === null ? " by patience" : ` at ${event.nodeId}`} (${at})`;
    case "blocked-false-positive":
      return `${labelOf(event.unitId, unitLabel)} customer false-positive at ${event.nodeId} (${at})`;
    case "served":
      return `${labelOf(event.unitId, unitLabel)} customer served (${at})`;
    case "retry":
      return `${labelOf(event.unitId, unitLabel)} retries (${at})`;
    default:
      return `${event.kind}@${event.tick}`;
  }
}

/** Terminal events double as Outcome rows for the decisive-cause hunt —
 *  the outcome STREAM and the event STREAM carry the same causeIds. */
interface EventOutcome {
  readonly unitId: EntityId;
  readonly terminal: OutcomeTerminal;
  readonly atUs: bigint;
  readonly causeId: CauseId;
}

function outcomeFromEvent(event: SimEvent): EventOutcome | null {
  switch (event.kind) {
    case "landed":
    case "bounced":
    case "served":
    case "blocked-false-positive":
      return Object.freeze({ unitId: event.unitId, terminal: event.kind, atUs: event.atUs, causeId: event.causeId });
    default:
      return null;
  }
}

function pickEffectCause(
  run: VersusRun,
  decisiveLabel: string,
  preferred: readonly OutcomeTerminal[],
): EventOutcome | null {
  for (const terminal of preferred) {
    let best: EventOutcome | null = null;
    for (const event of run.events) {
      const outcome = outcomeFromEvent(event);
      if (outcome === null || outcome.terminal !== terminal) continue;
      // Same resolution the counters use — a decisive wave's terminal may
      // ride a re-entry id that only the retryParent walk can label.
      if (resolveUnitLabel(outcome.unitId, run.unitLabel, run.retryParent) !== decisiveLabel) continue;
      if (best === null
        || outcome.atUs > best.atUs
        || (outcome.atUs === best.atUs && outcome.causeId > best.causeId)) {
        best = outcome;
      }
    }
    if (best !== null) return best;
  }
  return null;
}

function explainDecisive(config: VersusMatchConfig, run: VersusRun, decisive: PerWaveOutcome): { sentence: string; causeId: string | null } {
  const decisiveLabel = decisive.waveN === null ? BASELINE_LABEL : `wave-${decisive.waveN}`;
  const effectCause = pickEffectCause(
    run,
    decisiveLabel,
    decisive.landed > 0 ? Object.freeze(["landed"] as const) : Object.freeze(["bounced", "blocked-false-positive", "served"] as const),
  );
  if (effectCause === null) {
    return { sentence: `Wave ${decisive.waveN ?? "?"} carried the pressure; no attributable terminal outcome was recorded.`, causeId: null };
  }
  // Outcome causes parent to their unit's arrival cause (retry lineages
  // inherit the ORIGINAL arrival stamp — arrivalCauseByUnit follows the
  // 'retry' events during the run).
  const parents = new Map<CauseId, CauseId>();
  for (const event of run.events) {
    const outcome = outcomeFromEvent(event);
    if (outcome === null) continue;
    const arrivalCause = resolveArrivalCause(outcome.unitId, run.arrivalCauseByUnit, run.retryParent);
    if (arrivalCause !== undefined) parents.set(outcome.causeId, arrivalCause);
  }
  const records = causeRecordsFromEvents(run.events, parents, (event) => summarizeVersusEvent(event, run.unitLabel, config.tableId));
  const index = buildCauseIndex(records);
  const trace = traceContributingFactors(index, effectCause.causeId, { redHerringWindowTicks: 2n });
  return { sentence: `Wave ${decisive.waveN ?? "?"}: ${oneSentenceExplanation(trace)}`, causeId: effectCause.causeId as string };
}

/* ═══════════════════════════ public entry points ═══════════════════════════ */

/**
 * Read-only memo observability (R6 watchlist: a degrade must never be
 * silent). Returned FRESH-FROZEN per call by `createVersusRunner(...)`
 * `.memoStats()` — a snapshot, never a live handle into the runner.
 *
 *  • `enabled` — false when `{ memoize: false }` was chosen up front OR
 *    after a permanent degrade flip (shared-head mismatch / rival prefix);
 *    a false here means the caller is paying naive per-request cost.
 *  • `ticksAdvanced` — total engine ticks executed on the memo path so
 *    far, INCLUDING ticks a late-reveal rebuild re-simulated from tick 0.
 *  • `snapshotCount` — per-tick snapshots currently retained (dense: the
 *    furthest served tick + 1; resets to 1 on each rebuild; frozen at the
 *    last retained size once degraded, since the map is no longer served).
 *  • `rebuilds` — late-reveal rebuilds (law check 2): each is ONE honest
 *    re-simulation and leaves the memo ENABLED.
 *  • `degraded` — the shared-head (check 1) or rival-prefix (check 3)
 *    flip fired: memoization is off for this runner's lifetime.
 */
export interface VersusMemoStats {
  readonly enabled: boolean;
  readonly ticksAdvanced: number;
  readonly snapshotCount: number;
  readonly rebuilds: number;
  readonly degraded: boolean;
}

/**
 * Harness-ready SimRunner over ONE resumable engine (see createVersusEngine
 * for the loop and the immutability law). The tick-0 state is a pure
 * function of the config, so `request.initialState` may be ANY legal tick-0
 * VersusRunState; the defender reserve travels as the replay bundle's
 * stamped wire values (StampedIntent is structurally the door's
 * ExternalIntent) — capture it with
 * `intents: stampReserveIntents(defender.reserveIntents ?? [])`.
 *
 * MEMOIZATION (perf lane, audit rec #4): a naive runner re-simulates from
 * tick 1 for every probe, so captureRun's ascending ring walk costs O(n²)
 * (reviewer: 44ms → 1370ms for 35 → 280 ticks). The default (`memoize`
 * unset or true) advances ONE engine monotonically to the furthest tick
 * ever requested and keeps a DENSE per-tick map of the frozen
 * VersusRunState snapshots: ascending requests amortize to O(total ticks),
 * and arbitrary-order probes (verify bisection hits ring ticks mid-range)
 * are O(1) snapshot reads. Snapshots store REFERENCES, never clones —
 * legal because every tick's GameState is an immutable-by-convention value
 * (full law citation on VersusEngine). Memory cost is therefore "the run
 * keeps every intermediate GameState alive": linear in ticks requested,
 * each state already exists as a fresh mint during the pass anyway (see
 * the bench test for the measured 280-tick figure).
 *
 * Purity is byte-identical to the naive path by construction: both drive
 * the same tick body; a per-tick snapshot taken at cursor t is the exact
 * value `simulateVersus(config, t, ·).state` returns, PROVIDED the request
 * stream respects the intent-log law on VersusEngine. The watermark check
 * below enforces it: a LATE REVEAL (new intent stamped at or before the
 * cursor — its tick can no longer fire) rebuilds the engine once; a RIVAL
 * PREFIX (the engine already consumed an intent the request denies, at or
 * before the requested tick) switches this runner to naive for its lifetime.
 * Either way the answer equals the naive re-sim; only the clock differs —
 * and the clock difference is now OBSERVABLE: the returned runner carries
 * a `memoStats()` probe (see VersusMemoStats) so `enabled:false`, a
 * `degraded` flip, and every `rebuilds` event are visible to the caller
 * without a behavior change to any simulated byte. Naive mode reports
 * `enabled: false` honestly (the memo was never on to lose).
 */
export function createVersusRunner(
  config: VersusMatchConfig,
  options?: { readonly memoize?: boolean },
): SimRunner<VersusRunState> & { readonly memoStats: () => VersusMemoStats } {
  const naive: SimRunner<VersusRunState> = (request) => simulateVersus(
    config,
    Number(request.targetTick),
    request.intentsUpToTick as readonly ExternalIntent[],
  ).state;

  if (options?.memoize === false) {
    // Opted out up front: nothing was ever memoized, so every counter
    // reads its honest zero and `enabled` is false from birth.
    return Object.assign(naive, {
      memoStats: (): VersusMemoStats => Object.freeze({
        enabled: false,
        ticksAdvanced: 0,
        snapshotCount: 0,
        rebuilds: 0,
        degraded: false,
      }),
    });
  }

  let engine = createVersusEngine(config);
  let watermark: readonly ExternalIntent[] = [];
  let snapshots = new Map<number, VersusRunState>();
  const primeSnapshots = (): void => {
    snapshots = new Map<number, VersusRunState>();
    snapshots.set(0, engine.stateSnapshot());
  };
  primeSnapshots();
  let memoEnabled = true;
  let ticksAdvanced = 0;
  let rebuilds = 0;
  let degraded = false;

  const runner = (request: SimRunnerRequest<VersusRunState>): VersusRunState => {
    if (!memoEnabled) return naive(request);
    const targetTick = Number(request.targetTick);
    const intents = request.intentsUpToTick as readonly ExternalIntent[];

    // Law check 1 — one log: the shared head must agree entry-for-entry
    // (identity is preserved by the harness's `filter`). A mismatch means
    // the caller swapped logs mid-run: memo can no longer tell which past
    // is the truth, so this runner goes naive for good.
    const shared = Math.min(intents.length, watermark.length);
    for (let i = 0; i < shared; i += 1) {
      if (intents[i] !== (watermark[i] as ExternalIntent)) {
        memoEnabled = false;
        degraded = true;
        return naive(request);
      }
    }

    if (intents.length > watermark.length) {
      // Law check 2 — late reveal: a newly visible intent stamped at or
      // before the cursor missed its tick in this engine's past. Rebuild
      // from tick 0 with the full truth (one honest re-sim, memo stays on).
      const cursor = engine.cursorTick();
      for (let i = shared; i < intents.length; i += 1) {
        if (Number((intents[i] as ExternalIntent).tick) <= cursor) {
          engine = createVersusEngine(config);
          primeSnapshots();
          rebuilds += 1;
          break;
        }
      }
      engine.enqueueIntents(intents);
      watermark = intents;
    } else if (intents.length < watermark.length) {
      // Law check 3 — rival prefix: the engine passed T already knowing an
      // intent this request denies (tick ≤ T). Snapshot(T) would answer a
      // different request than naive(T, intents) — same naive-for-life
      // degrade as check 1 (the caller is cycling contradictory prefixes).
      for (let i = intents.length; i < watermark.length; i += 1) {
        if (Number((watermark[i] as ExternalIntent).tick) <= targetTick) {
          memoEnabled = false;
          degraded = true;
          return naive(request);
        }
      }
    }

    if (targetTick > engine.cursorTick()) {
      const before = engine.cursorTick();
      engine.advanceTo(targetTick, (tick, state) => snapshots.set(tick, state));
      ticksAdvanced += engine.cursorTick() - before;
    }
    const served = snapshots.get(targetTick);
    // Dense capture makes every 0 ≤ targetTick ≤ cursor a hit; anything
    // else (a negative probe) is the contract's edge — answer it honestly.
    return served ?? naive(request);
  };

  return Object.assign(runner, {
    memoStats: (): VersusMemoStats => Object.freeze({
      enabled: memoEnabled,
      ticksAdvanced,
      snapshotCount: snapshots.size,
      rebuilds,
      degraded,
    }),
  });
}

/** Tick-0 run state — the harness `initialState` for capture. Pure
 *  function of the config (no reserve intents have fired yet). */
export function initialVersusRunState(config: VersusMatchConfig): VersusRunState {
  return simulateVersus(config, 0, []).state;
}

/** Full async resolution: run the committed match and produce the verdict. */
export function resolveVersusMatch(config: VersusMatchConfig): MatchResult {
  const run = simulateVersus(config, config.matchTicks, stampReserveIntents(config.defender.reserveIntents ?? []));
  const rows = perWaveRows(run.counters, config.customerBaseline !== undefined);
  const totals = run.state.totals;

  // Decisive wave: heaviest landed, tie → most blocked, tie → lowest n.
  let decisive = rows[0] as PerWaveOutcome;
  for (const row of rows) {
    if (row.waveN === null) continue;
    if (row.landed > decisive.landed
      || (row.landed === decisive.landed && row.blocked > decisive.blocked)) {
      decisive = row;
    }
  }

  const attribution = explainDecisive(config, run, decisive);
  return Object.freeze({
    tableId: config.tableId,
    deckId: config.deck.id,
    seed: config.seed,
    schedule: run.schedule.waves,
    perWaveOutcomes: rows,
    totals,
    ruleFirings: run.state.ruleFirings,
    finalDigest: digestState(run.state.game),
    matchScore: scoreVersusMatch(totals, config.scoring ?? DEFAULT_MATCH_WEIGHTS),
    decisiveWaveN: decisive.waveN ?? 1,
    attribution: attribution.sentence,
    attributionCauseId: attribution.causeId,
  });
}

