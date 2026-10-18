/**
 * SimCoreRunner — the REAL @hh/sim-core pipeline behind the same SimRunner
 * seam the mock fills (wave-2 swap: `createRunner("sim-core")`).
 *
 * Authority contract (ARCHITECTURE.md §3.1): this file runs in the worker (or
 * a headless test) and is the ONLY ground-truth writer in the app. It composes
 * the public sim-core surface EXCLUSIVELY through package subpath exports
 * (`@hh/sim-core/pipeline`, `/observed`, `/waves`, `/kernel`, `/types`) — zero
 * deep relative imports into packages/sim-core, zero edits to it.
 *
 * Composition per tick (mirrors the sanctioned example in
 * sim-core src/__tests__/integration-smoke.test.ts):
 *   waves.planWave            → WaveEnvelope fed to the real arrival slot
 *   pipeline.createTickDriver → 12-step deterministic tick (ground truth);
 *                               its pre-step-1 intent door receives the player
 *                               verbs stamped by `submit` (contract #10)
 *   observed.ObservedStore    → step-12 gate: renderer-facing cells derived
 *                               from REAL driver outputs, sealed via the
 *                               store, merged into GameState.observed
 *   economy.runEconomyTick    → money lane (REST-PROTO-FINAL): the tick's
 *                               observedWrites (company::reputation publisher)
 *                               forward through the SAME store; cash +
 *                               ledgerSeq mirror into GameState like the
 *                               sanctioned fastForward example
 *
 * MAINLINE MAZING (§7.10, audit g21 #2): the board is a real fork —
 * `edge` is the shared front door; cold traffic (score ≤ dial) walks the
 * EXPRESS lane edge→waf→origin (short, shallow, cheap); hot traffic is
 * scored at arrival and routed into the DEEP lane edge→deep (slow, high
 * inspection depth, terminal — "the only route you are allowed to lengthen
 * is the deep lane"). The score is `1 − source.reputation` (the §7.10
 * scoring vocabulary's first input, already minted on the arrival stream —
 * zero new RNG), and it is consulted ONLY while the front door is authored
 * to actually look: a door-set `ConfigureNode edge pass-through` stops the
 * intel and every unit rides express (§7.10's bargain — inspection is what
 * makes routing a choice). The dial is a `slider` arm ("dial", Fixed
 * 0…FIXED_UNIT = expressMaxConfidence); node depths move through the REAL
 * intent door (`player-verb` configure). The bundle's authored
 * threats.familyWeights (batch-B handoff, audit fix 3) now steers the
 * arrival dice via waves.parseFamilyWeightsTable → arrival config.familyMix.
 * v0 honesty: mid-path demotion (G3's wire-yank) is NOT mainlined — the
 * lane is decided at arrival and re-decided on each retry re-entry (the
 * re-mint carries the same source identity, so stickiness rides reputation).
 * The projection that leaves through the protocol carries ONLY observed-layer
 * data: LaneStats aggregates, ObservedCells, counters, notices, clocks.
 *
 * WAVE RULES LIVE (§2.24, B4): the traffic is the SHIPPED g1 shared-web slice
 * (five par-scaled waves via the canonical foreign adapter @c9c0433), planned
 * lazily at each window entry with the three host inputs wired in
 * `runner/waveRules.ts` — OD-24's 8:1 oversell ratio, RATIFIED 2026-10-16
 * (ADR-0014 #D4) (gated on the bundle declaring the slider), a bounce/land
 * incident clock (fires wave-4's
 * secondIncident marker), and the deep lane's engaged-family census (copycat).
 * The incident-clock and census thresholds are RATIFIED 2026-10-16
 * (ADR-0015 #1) scenario rows; witnesses via wavePlan(n) /
 * incidentState() / dominantDefenseFamily().
 *
 * CORPUS DRIVE MODE (§1.5 seam, the runner leg of @5df5586/@bc11697): an
 * optional `corpus: {authority, waves}` option replaces the internal
 * schedule with `resolveCorpusWindows` — cited storms from shipped slice
 * content, invitation law riding the authority, excluded storms leaving no
 * cursor hole. Witness via corpusPlan() / corpusTraffic() (local accessors;
 * the wire is untouched either way). ABSENT ⇒ byte-identical runner.
 *
 * RULES LIVE (ADR-0019 program 5 — owner ruling: the gate-g7 host-loop
 * mechanics are ADOPTED into the mainline runner behind an opt-in): an
 * optional `rules: {lookupPolicyCard}` option arms the step-12.5 rule phase
 * (`policy.createRulePhaseStep`), the door's rule-carrier map
 * (`ruleCarriers: "mapped"` — the Book plays itself through the SAME two
 * hands, ADR-0018), and the re-feed of each tick's `TickResult.intents`
 * into the NEXT tick's door exactly like g7Runner (M4 stamping law: with
 * the Book armed, door-scheduled player copies re-stamp above a sequence
 * floor so driver rule seqs and host seqs can never collide in one feed).
 * Firings ride the EXISTING `rule-fired` notice path with the card's id as
 * detail — zero new NoticeKinds, zero wire change. ABSENT means no rulePhase
 * slot, no rule door keys, no re-feed, no re-stamping — every shipped
 * golden (money 25_005_307_300n / 25_109_732_500n, boot digests
 * ca8863849cb3db32 / 780b1cbc61dff760) is the byte-identity proof. v0
 * honesty: the Shadow Dial and the Kill Switch stay gate-g7-exclusive —
 * mainline runs the live config only and feeds no `suppressedRuleIds`
 * (gap row owed at closeout).
 *
 * Purity law: every per-run mutable object (driver, store, plan, counters) is
 * minted inside the constructor, so two fresh instances on one seed replay
 * byte-identically through the wire (see __tests__/simCoreRunner.test.ts).
 *
 * Determinism note: `headlessStep(dtRealMs)` advances EXACTLY one macro-tick
 * (1 sim-minute via the driver clock chain) and ignores `dtRealMs` — real time
 * gates EMISSION cadence in `start()`, never physics (§4.1: speed gates
 * observation detail, not the sim).
 */
import {
  ResolutionBand,
  asCauseId,
  asEntityId,
  asMoney,
  asRunSeed,
  observedKey,
  type AttentionLoanKind,
  type AttentionState,
  type BoardEdgeRecord,
  type BoardState,
  type ClockState,
  type Contract,
  type DependencyEdge,
  type EntityId,
  type ExternalIntent,
  type Fixed,
  type LaneStats,
  type MoneyUnit,
  type NodeRecord,
  type ObservedCell,
  type ObservedKey,
  type GameState,
  type NegotiateBook,
  type Outcome,
  type PatienceMode,
  type PlayerIntent,
  type PolicyCard,
  type PriceOverrideBook,
  type QosClassDef,
  type RecoveryState,
  type RetryPolicy,
  type RouteIn,
  type RouteOut,
  type RunSeed,
  type SimEvent,
  type SimTick,
  type ThreatFamily,
  type TickStep,
  type WaveEnvelope,
} from "@hh/sim-core/types";
import {
  FIXED_UNIT,
  FIXED_ZERO,
  MICROS_PER_MIN,
  fromInt,
  fromRatio,
  initialClocks,
  streamFor,
  sub,
} from "@hh/sim-core/kernel";
import {
  ATTENTION_DEFAULT_COSTS,
  attentionWindowEntry,
  corruptionOutageSecs,
  createAttentionState,
  createBoardState,
  createDefaultSlots,
  createInitialState,
  createTickDriver,
  makeSlots,
  replenishAtBusinessMonth,
  type AttentionWindowResult,
  type DefaultPipelineConfig,
  type RecoveryConfig,
  type RecoveryNotice,
  type TickDriver,
  type TickInputs,
} from "@hh/sim-core/pipeline";
import { createRulePhaseStep } from "@hh/sim-core/policy";
import { ObservedStore } from "@hh/sim-core/observed";
import {
  defaultEconomyConfig,
  emptyEconomyState,
  postEntry,
  registerContractEconomy,
  remainingSec,
  runEconomyTick,
  type EconomyConfig,
  type EconomyNotice,
  type EconomyState,
  type EntryDraft,
  type RefusedSettlement,
  type RevenueColourTags,
} from "@hh/sim-core/economy";
import {
  INITIAL_DIRECTOR_STATE,
  buildInvitations,
  directorPropose,
  ledgerSnapshot,
  parseFamilyWeightsTable,
  planWave,
  waveStream,
  type DirectorState,
  type PressureParams,
  type WavePlan,
  type WaveTable,
} from "@hh/sim-core/waves";
import {
  DEFAULT_CORPUS_GEOMETRY,
  gateCorpusWave,
  resolveCorpusWindows,
  type CorpusAuthority,
  type CorpusWaveWindow,
  type ScenarioCorpusTraffic,
} from "@hh/sim-core/scenario";
import {
  INCIDENT_ACTIVE_MINUTES,
  INITIAL_INCIDENT_CLOCK,
  OVERSELL_RATIO_MICRO,
  SHARED_WEB_G1_TABLE,
  bundleDeclaresOversellSlider,
  dominantFamilyOfCensus,
  homogeneityMicroFromClassMix,
  incidentStateOf,
  planWaveWindowSchedule,
  stepIncidentClock,
  threatFamilyOfIntent,
  type IncidentClock,
  type IncidentState,
  type WaveWindowSpec,
} from "./waveRules";
// SSOT law: the traffic mix comes from the authored bundle, never a copied
// number (precedent: lab/coverageGridModel.ts, gates/g5, gates/g6).
import sharedWebBundleRaw from "../../../../packages/content/types/shared-web.json?raw";
import type {
  BootBoardEdgeWire,
  BootBuildWire,
  SimProjection,
  EventNotice,
  ProtoCell,
  CellValue,
} from "../shared/protocol";
import type { SimRunner } from "./simRunner";

/* ═══════════════════════════ scenario (G1 maze board) ═══════════════════════════
 * Local constants, not sim-core internals: a two-lane maze board whose
 * base numbers come from the sanctioned integration example, forked per
 * §7.10. Placeholder-content grade — the content wave replaces this with
 * loaded ruleset bundles.
 *
 *        cold (score ≤ dial)                service target
 *  edge ────────────────────► waf ─────────► origin
 *       ╲                                      ▲
 *        ╲ hot (score > dial), terminal        │ deep lane never
 *         ╲─────────────────────────────► deep─╯ reaches origin —
 *                                              the maze IS the containment.
 */

const LANE_ID = asEntityId("lane/ingress-1");
const NODE_EDGE = asEntityId("edge");
const NODE_WAF = asEntityId("waf");
const NODE_DEEP = asEntityId("deep");
const NODE_ORIGIN = asEntityId("origin");
const LAG_TABLE_REF = "g1-smoke-lag-v0";
const WAVE_START_MINUTE = 2;

/** Demo-cheap pressure override — same legal shape the smoke uses, kept so a
 *  100-tick test run stays cheap without losing bounce physics. The REAL
 *  shipped g1 slice rides on top of it: each wave's parPct (25/60/30/75/100)
 *  scales the draw, so the quarter builds instead of one flat placeholder. */
const PRESSURE: PressureParams = Object.freeze({
  baseMicro: 6n * 1_000_000n,
  growthNum: 223n,
  growthDen: 200n,
  sawtoothMicro: Object.freeze([1_000_000n]),
});

const CLASSES: readonly QosClassDef[] = Object.freeze([
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

const RETRY: RetryPolicy = Object.freeze({
  maxRetries: 2,
  backoffBaseUs: 2n * MICROS_PER_MIN,
  jitterPurchased: false,
});

const DEPENDENCY_EDGES: readonly DependencyEdge[] = Object.freeze([
  Object.freeze({ upstreamNodeId: NODE_EDGE, downstreamNodeId: NODE_ORIGIN, correlation: "software" as const }),
]);

function mkNode(id: EntityId, slots: number, serviceUs: bigint, depth: NodeRecord["inspectionDepth"], dep: EntityId | null): NodeRecord {
  return Object.freeze({
    id,
    kind: "generic",
    slots: makeSlots(slots),
    serviceTimeUs: serviceUs,
    queueDepth: 0,
    queue: Object.freeze([]),
    shedOrder: "qos-weighted" as const,
    inspectionDepth: depth,
    discipline: "hockey-stick" as const,
    utilizationRho: 0n,
    dependencyNodeId: dep,
  });
}

/* ─────────── D7 build rider — seedable board roster (ADR-0014 #D7) ───────────
 * `boot.build.board` (wire half in shared/protocol.ts) seeds the door's
 * BoardState slice: structural edges BETWEEN the maze nodes below. NODES are
 * not seedable — the roster is code-defined (the maze above with its lanes and
 * dependency edges), and a rider naming fresh nodes would mint a board the
 * route step and the observed fold do not know. The door's own unknown-node
 * law therefore SPEAKS THROUGH the seed: endpoints off this set throw at
 * construction — a boot fault through the hosts' shared try/catch, mirroring
 * the citation-domain walls. */
const BUILD_SEEDABLE_NODE_IDS: ReadonlySet<string> = Object.freeze(
  new Set<string>([String(NODE_EDGE), String(NODE_WAF), String(NODE_DEEP), String(NODE_ORIGIN)]),
);

/** Mirror of the door's PRIVATE `defaultEdgeId` convention
 *  (pipeline/intent-door.ts:716): `edge:<relation>:<from>-><to>`, power edges
 *  carry `:<slot>`. A rider that omits `id` gets exactly this form, so a
 *  connect-verb on the same endpoints mints the SAME key — the seeded edge
 *  then proves itself LIVE through the door's own `edge-exists` refusal
 *  (witnessed in simWorker.build.test.ts; nothing engine-side exported to drift). */
function deriveBoardEdgeId(
  relation: string,
  from: string,
  to: string,
  slot: string | null | undefined,
): string {
  const base = `edge:${relation}:${from}->${to}`;
  return relation === "power" && slot != null ? `${base}:${slot}` : base;
}

/** Parse-don't-validate: the codec trusted the SHAPE (closed relation vocab,
 *  the door's socket laws, scalar ids). What stays HERE is the runner's
 *  semantic domain: id resolution, duplicate refusal (createBoardState
 *  overwrites silently — a rider must not), and off-roster endpoints. Every
 *  throw surfaces as a boot fault (never a crash, never a silent drop). */
function mintBuildBoard(
  board: readonly BootBoardEdgeWire[] | undefined,
): BoardState | undefined {
  if (board === undefined) return undefined;
  const seen = new Set<string>();
  const records: BoardEdgeRecord[] = board.map((edge, index) => {
    const id = edge.id ?? deriveBoardEdgeId(edge.relation, edge.from, edge.to, edge.slot);
    if (seen.has(id)) {
      throw new Error(`SimCoreRunner: build.board edge[${index}] duplicates id "${id}"`);
    }
    seen.add(id);
    for (const endpoint of [edge.from, edge.to] as const) {
      if (!BUILD_SEEDABLE_NODE_IDS.has(endpoint)) {
        throw new Error(
          `SimCoreRunner: build.board edge "${id}" names unknown node "${endpoint}" — nodes are the runner's code-defined maze, not wire-seedable`,
        );
      }
    }
    return Object.freeze({
      id: asEntityId(id),
      relation: edge.relation,
      from: asEntityId(edge.from),
      to: asEntityId(edge.to),
      // Codec-parsed records always carry the key; direct ctor callers may
      // omit it — null is the record's own idle spelling.
      slot: edge.slot ?? null,
    });
  });
  return createBoardState(records);
}

/** One paid contract so GameState.contracts is a real (non-degenerate) map. */
const CONTRACT: Contract = Object.freeze({
  id: asEntityId("ctr-gold-1"),
  customerEntityId: asEntityId("cust-1"),
  bundleId: "shared-web",
  mrcMicroUsd: asMoney(5_000_000n),
  tcvMicroUsd: asMoney(60_000_000n),
  acvMicroUsd: asMoney(60_000_000n),
  termStartMin: 0,
  termEndMin: 43_200,
  billingCycle: "monthly" as const,
  sla: Object.freeze({
    uptimeTarget: fromRatio(999n, 1000n),
    responseBudgetUs: 3_600n * MICROS_PER_MIN,
    creditRate: fromRatio(5n, 100n),
    creditCap: fromRatio(25n, 100n),
    claimWindowUs: 30n * 24n * 3_600n * MICROS_PER_MIN,
    autoRenew: false,
    noticePeriodMin: 1_440,
    threeBreachExitRight: false,
  }),
  routingLocks: Object.freeze([]),
  shedImmunityClassId: "gold",
  allocations: Object.freeze([]),
});

/* ───────────────────────── money-lane roster ─────────────────────────
 * REST-PROTO-FINAL (audit 45f0edf handoff #1): the product runner advances
 * the REAL economy engine alongside the pipeline and forwards the tick's
 * `EconomyTickOut.observedWrites` into the same ObservedStore the lanes use
 * — so `company::reputation` (fix-economy @57ea80e publisher) and the money
 * notices flow live instead of reading '?'. Composition mirrors the
 * sanctioned money lane in sim-core src/unattended/fastForward.ts.
 * HOST-COMPAT (rung-9 closeout): the scenario `runScenario` report's
 * `observation` is an APPEND-ONLY record — rungs grow its key set (the
 * per-verb census maps landed @e30b75b); hosts read by name, never pin
 * the whole shape.
 *
 * The book is deliberately THREE-shaped so every v0 money surface is a
 * witness, not a placeholder:
 *  · ctr-gold-1  — the monthly contract already on GameState.contracts
 *                  ($5 MRC; the ~420-tick monthly cycle stays quiet in a
 *                  100-tick run, which is itself the honest baseline).
 *  · ctr-hourly-1 — hourly cycle at mrc 720_000_000 µ$ ($720/mo, $1 per
 *                  60-business-minute cycle — exact-÷720 so scaleMoney
 *                  never rounds): issues AND settles inside the test window.
 *  · ctr-pending-1 — signed-not-started (termStartMin 300 business-min ≈
 *                  tick 3 on the driver clock): exercises the 57ea80e
 *                  pending→activate phase with a real `contract-activated`
 *                  witness.
 *
 * GameState.contracts keeps ONLY the monthly record — the money book is the
 * runner's private contractsBook (fastForward's separation law: pipeline
 * physics never reads it; digest sees cash/ledgerSeq, which the mirror moves
 * honestly). */

/** Hourly-metered SMB ticket — the fast money heartbeat of the demo board. */
const CONTRACT_HOURLY: Contract = Object.freeze({
  id: asEntityId("ctr-hourly-1"),
  customerEntityId: asEntityId("cust-2"),
  bundleId: "shared-web",
  mrcMicroUsd: asMoney(720_000_000n),
  tcvMicroUsd: asMoney(720_000_000n),
  acvMicroUsd: asMoney(720_000_000n),
  termStartMin: 0,
  termEndMin: 43_200,
  billingCycle: "hourly" as const,
  sla: CONTRACT.sla,
  routingLocks: Object.freeze([]),
  shedImmunityClassId: "bronze",
  allocations: Object.freeze([]),
});

/** Signed deal with a future service start: prime pending → the engine
 *  flips it live at termStartMin with a `contract-activated` notice. */
const CONTRACT_PENDING: Contract = Object.freeze({
  id: asEntityId("ctr-pending-1"),
  customerEntityId: asEntityId("cust-3"),
  bundleId: "shared-web",
  mrcMicroUsd: asMoney(12_000_000n),
  tcvMicroUsd: asMoney(144_000_000n),
  acvMicroUsd: asMoney(144_000_000n),
  termStartMin: 300,
  termEndMin: 43_500,
  billingCycle: "monthly" as const,
  sla: CONTRACT.sla,
  routingLocks: Object.freeze([]),
  shedImmunityClassId: null,
  allocations: Object.freeze([]),
});

const MONEY_CONTRACTS: readonly Contract[] = Object.freeze([
  CONTRACT,
  CONTRACT_HOURLY,
  CONTRACT_PENDING,
]);

/** Opening float (scenario row RATIFIED 2026-10-16, ADR-0015 #1): $25,000
 *  of free cash so the settle lane is funded from tick one — an unfunded
 *  roster would only ever exercise the insolvent-settle boundary. */
const OPENING_FREE_MICRO_USD: bigint = 25_000_000_000n;

/** Neutral five-axis "blue" census — verbatim fastForward default (the
 *  tags are a content/finance decision the runner has no authority to invent). */
const DEFAULT_REVENUE_TAGS: RevenueColourTags = Object.freeze({
  margin: "blue",
  churnRisk: "blue",
  term: "blue",
  concentration: "blue",
  abuse: "blue",
} as const);

/** One landed breach = one sim-minute of company-wide outage (the
 *  fastForward RATIFIED reading (ADR-0015 #1) — per-contract target
 *  attribution is an open OD item; landed traffic must at least cost SLA
 *  budget, not nothing). */
const OUTAGE_SECONDS_PER_LANDED = 60n;

/** Business-calendar month grid (economy's default minutesPerMonth — the
 *  43,200-minute rollBusinessMonth law). The attention seam rolls on THIS
 *  grid read straight off the host clock, mirroring fastForward's
 *  ATTENTION_MONTH_MINUTES: calendar authority, not the ledger's counter
 *  (a dissolved/frozen monthIndex must not strand the pool). */
const ATTENTION_MONTH_MINUTES = 43_200;

/** Review-F4 boundary (mirrors fastForward): economy/ refuses negative
 *  buckets by throwing a raw RangeError deep inside settle. ONLY that family
 *  is converted into a counted refusal (prior econ kept — the same invoice
 *  retries next tick, deterministic livelock-by-design, never a crash and
 *  never a silent success). OWNER QUESTION (economy lane): canSettle() so
 *  this catch can retire. */
const NEGATIVE_BUCKET_LAW = /would go negative/;

/* OD-25(a) refuse-settlements witness lane (mirrors unattended/fastForward.ts
   SETTLE_REFUSAL_SHAPE — duplicated BY NECESSITY: the shared home would sit
   in unattended/index.ts, outside this package's import surface). The death
   fold persists only COUNT + SUM of the evidence (economy/death.ts
   advanceDeathWatch), so the buckets-law text is parsed for the attempted
   movement's magnitude, and an unparseable message rides count-only under
   the neutral `ledger:unattributed` id. The runner never drafts opex, so
   voided settles are its ONLY refusal family. */
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

function openingDraft(amountMicroUsd: bigint): EntryDraft {
  return Object.freeze({
    causeId: asCauseId("adapter:opening-balance"),
    atBusinessMin: 0,
    moneyColour: "gold" as const,
    delta: Object.freeze({ free: asMoney(amountMicroUsd) }),
    context: "runner opening float",
  });
}

/** Prime the money state: opening float + one registration per contract,
 *  exactly the fastForward money-lane fold (single-registration chaining —
 *  three contracts, no need for the batch API at this roster size). */
function primeEconomy(cfg: EconomyConfig, priceKeys?: ReadonlyMap<EntityId, string>): EconomyState {
  const posted = postEntry(
    emptyEconomyState().journal,
    emptyEconomyState().cash,
    openingDraft(OPENING_FREE_MICRO_USD),
  );
  let econ: EconomyState = Object.freeze({
    ...emptyEconomyState(),
    journal: posted.journal,
    cash: posted.cash,
  });
  for (const contract of MONEY_CONTRACTS) {
    /* Sparse price key (@5781335 host seam, mirrors fastForward's register
       fold): only the contracts the options name become price-classified;
       an undefined entry spreads NOTHING ⇒ byte-identical record. */
    const priceKey = priceKeys?.get(contract.id);
    econ = registerContractEconomy(
      econ,
      {
        contract,
        atBusinessMin: 0,
        clauseRefs: ["auto-renew"],
        grandfather: null,
        revenueTags: DEFAULT_REVENUE_TAGS,
        commitmentBps: 9_990n,
        ...(priceKey !== undefined ? { priceKey } : {}),
      },
      cfg,
    );
  }
  return econ;
}

/** AUDIT FIX 3 consumer wiring (batch-B handoff @4856a42): the bundle's
 *  authored five-family weights become the arrival dice's table. Parsed
 *  once at module load — a drift in the bundle text fails the boot LOUD
 *  (parseFamilyWeightsTable is fail-loud), never silently smooths over. */
function bundleFamilyMix(): NonNullable<DefaultPipelineConfig["familyMix"]> {
  const doc = JSON.parse(sharedWebBundleRaw) as {
    threats?: { familyWeights?: Record<string, unknown> };
  };
  const table = doc.threats?.familyWeights;
  if (table === undefined) {
    throw new Error(
      "SimCoreRunner: shared-web.json#threats.familyWeights missing — the authored traffic mix cannot be wired",
    );
  }
  return parseFamilyWeightsTable(table, "shared-web.json#threats.familyWeights");
}

export const FAMILY_MIX = bundleFamilyMix();

/* ═══════════════════════ mainline mazing law (§7.10) ═══════════════════════ */

/** Exactly the rule inputs handed to planWave when a window was minted
 *  (null-side semantics: oversell undefined ⇒ slider not declared by the
 *  bundle; dominantDefenseFamily undefined ⇒ deep lane never engaged). */
export interface WaveRuleInputs {
  readonly incidentState: IncidentState;
  readonly dominantDefenseFamily: ThreatFamily | undefined;
  readonly oversell: { readonly ratioMicro: bigint; readonly homogeneityMicro: bigint } | undefined;
}

/** Cumulative lane-split ledger — minted per runner instance (purity law),
 *  written ONLY by the maze route step, read into observed cells each frame.
 *  `deepByFamily` is the B4 copycat witness: the hidden true-intent family of
 *  every unit the DEEP lane engaged (host-side ground truth — it never rides
 *  the wire; only its derived dominant-family shows up inside wave plans). */
export interface MazeSplitLedger {
  express: number;
  deep: number;
  readonly deepByFamily?: Partial<Record<ThreatFamily, number>> | undefined;
}

/** Score a fresh visit at arrival (the §7.10 "scored on arrival, not
 *  judged" input): 1 − source.reputation, the first-named scoring input in
 *  the spec's vocabulary. The value is ALREADY minted on the arrival stream
 *  (defaults.ts `source.reputation`) — the score consults truth, it does
 *  not roll dice. */
export function arrivalSuspicion(unit: { readonly source: { readonly reputation: Fixed } }): Fixed {
  return sub(FIXED_UNIT, unit.source.reputation);
}

/**
 * The route-slot wrapper that puts mazing on the mainline board. The stock
 * createRouteStep splits `confidence <= dial` between expressPath and
 * deepPath, but every unit arrives (and re-enters) with confidence 0 and
 * the product runner feeds no per-tick evidence — so with paths equal the
 * dial was decorative. This wrapper applies the SAME engine predicate
 * (`score > expressMaxConfidence ⇒ deep`) to the arrival score, at the
 * engine's own routing boundary:
 *
 *  · intel is armed only while the FRONT DOOR (edge) is authored to look —
 *    `inspectionDepth !== "pass-through"` on that node. A door-set
 *    `ConfigureNode edge pass-through` stops classification cold: every
 *    unit rides express (cheap, exposed). That is the "route selection
 *    honors per-node inspection depth" lever, moved by the REAL intent door.
 *  · demoted units get the deep remainder verbatim; never the express lane
 *    (D-4: "you never maze the express lane").
 *  · every fresh assignment increments the split ledger — the numbers the
 *    renderer reads as "watch the ratio of motes taking each lane".
 *
 * Pure over (input, ledger): same seed + same intents ⇒ same frames.
 */
export function createMazeRouteStep(
  base: TickStep<RouteIn, RouteOut>,
  law: Readonly<{
    frontDoor: EntityId;
    deepPath: readonly EntityId[];
    split: MazeSplitLedger;
  }>,
): TickStep<RouteIn, RouteOut> {
  return (input) => {
    const preHops = new Map<string, number>();
    for (const unit of input.units) preHops.set(String(unit.id), unit.routeHops.length);

    const routed = base(input).units;
    const door = input.nodes.get(law.frontDoor);
    const armed = door !== undefined && door.inspectionDepth !== "pass-through";

    const units = routed.map((unit) => {
      if (preHops.get(String(unit.id)) !== 0) return unit; // in-flight: lane untouched
      if (armed && arrivalSuspicion(unit) > input.expressMaxConfidence) {
        law.split.deep += 1;
        // B4 copycat input: the deep lane's engaged-family census (hidden
        // truth read host-side; benign intents contribute nothing).
        const census = law.split.deepByFamily;
        const family = threatFamilyOfIntent(unit.trueIntent);
        if (census !== undefined && family !== null) {
          census[family] = (census[family] ?? 0) + 1;
        }
        return Object.freeze({ ...unit, routeHops: Object.freeze([...law.deepPath]) });
      }
      law.split.express += 1;
      return unit;
    });
    return Object.freeze({ units: Object.freeze(units) });
  };
}

/* ═══════════════════ corpus-cited drive mode (§1.5 seam) ═══════════════════
 * The MAINLINE runner leg of the waves-tableId corpus seam (@5df5586,
 * invitations authority @bc11697) — the leg `chrome/corpusMission.ts`
 * gap-noted as "not wired" and MODULE-STATUS recorded as
 * "runner/worker leg owed". When `options.corpus` is present the per-minute
 * envelope source becomes `resolveCorpusWindows(citation, runSeed,
 * authority)` — the SAME public scenario seam the mission card and the
 * sim-core suite drive — instead of the internal SHARED_WEB_G1 schedule:
 * rates, families, telegraphs and the invitation gate all come from the
 * cited slice, and the cursor law (an EXCLUDED storm leaves no hole: later
 * storms pack tight) rides for free because it lives in the seam.
 *
 * v0 boundaries (honest, host-side only):
 *  · NO wire fields (protocol-v1 law @0b35b15): the plan surfaces through
 *    `corpusPlan()` as a local accessor, like recoveryState()/lastTickFacts().
 *  · NO baseline trickle — scenario-runner's corpus branch stacks a
 *    `baselineRatePerMin` plateau under the storms; the mainline demo board
 *    reads quiet between cited windows (the internal table's back-to-back
 *    schedule is simply replaced, not floored).
 *  · B4 host signals (incident/copycat/oversell) stay on the INTERNAL
 *    schedule path only — in corpus mode the plans were minted INSIDE the
 *    seam with the authority's invitations law, so `wavePlan(n)` answers
 *    undefined there (never a borrowed lie); `waveEnvelopes()` still
 *    answers, and `familyOverride` still labels what actually drives.
 *  · A citation whose EVERY storm is gated throws CORPUS_UNRESOLVED at the
 *    constructor — never a quiet season by silence (the seam's own law).
 */

/** The shipped g1 slice stem — same file waveRules.ts adapts internally;
 *  the corpus citation names it by content identity, not by import. */
export const CORPUS_DRIVE_DEFAULT_TABLE_ID = "g1-shared-web-first-quarter";

/** Host-supplied corpus citation: which shipped slice, which waves, and the
 *  authority (slices + threatMeta; optionally the invitations law +
 *  buildLog — ABSENT invitations is the law-off default: every shipped
 *  threat spawnable, byte-ident to the pre-gate witnesses). */
export interface CorpusDriveOptions {
  readonly authority: CorpusAuthority;
  /** Shipped wave numbers to schedule — strictly ascending, each ≥ 1. */
  readonly waves: readonly number[];
  readonly tableId?: string;
  readonly waveStartMinute?: number;
}

/** One cited wave's placement witness (local accessor rows, protocol-v1:
 *  nothing here rides the wire). `excluded` names the gated-but-uninvited
 *  threat-ids at the judged minute; `scheduled:false` is the whole-storm
 *  exclusion (cursor law: it advanced nothing for the waves after it). */
export interface CorpusPlanRow {
  readonly wave: number;
  /** Packed-cursor minute the invitation gate judged this wave at. */
  readonly judgedAtMinute: number;
  readonly scheduled: boolean;
  /** Placement-drawn window start (null on an excluded storm). */
  readonly startMinute: number | null;
  readonly windowMinutes: number;
  /** Gated threat-ids with no inviter spawnable as-of `judgedAtMinute`. */
  readonly excluded: readonly string[];
}

interface CorpusDriveState {
  readonly traffic: ScenarioCorpusTraffic;
  readonly windows: readonly CorpusWaveWindow[];
  readonly rows: readonly CorpusPlanRow[];
}

/** The entry-word list of one cited wave, read off the authority's raw
 *  slice — the same threat-id join the invitation law is built on (the
 *  twin of corpusMission.sliceThreatIds; runner-side so the drive mode
 *  never imports chrome). */
function sliceThreatIdsOf(authority: CorpusAuthority, tableId: string, waveN: number): readonly string[] {
  const raw = authority.slices.get(tableId) as {
    waves?: { n: number; entries?: { threat?: string }[] }[];
  } | undefined;
  const wave = raw?.waves?.find((w) => w.n === waveN);
  if (wave === undefined) {
    throw new Error(`SimCoreRunner: corpus table "${tableId}" ships no wave ${waveN}`);
  }
  const ids = (wave.entries ?? []).map((entry) => entry.threat);
  if (ids.some((id) => typeof id !== "string")) {
    throw new Error(`SimCoreRunner: corpus table "${tableId}" wave ${waveN} has an entry without a threat id`);
  }
  return ids as string[];
}

/** Boundary parse (fail-fast, Law 2/4) + one seam call + the display walk.
 *  Pure over (corpus, runSeed): the same citation resolved twice schedules
 *  the same windows (the sim-core suite pins that ×100). */
function mintCorpusDrive(corpus: CorpusDriveOptions, runSeed: RunSeed): CorpusDriveState {
  const { authority } = corpus;
  if (corpus.waves.length === 0) {
    throw new Error("SimCoreRunner: corpus.waves must cite at least one shipped wave");
  }
  let previous = 0;
  for (const waveN of corpus.waves) {
    if (!Number.isInteger(waveN) || waveN < 1) {
      throw new Error(`SimCoreRunner: corpus.waves must be integers ≥ 1, got ${String(waveN)}`);
    }
    if (waveN <= previous) {
      throw new Error(`SimCoreRunner: corpus.waves must be strictly ascending — ${String(waveN)} follows ${String(previous)}`);
    }
    previous = waveN;
  }
  const tableId = corpus.tableId ?? CORPUS_DRIVE_DEFAULT_TABLE_ID;
  if (tableId.length === 0) {
    throw new Error("SimCoreRunner: corpus.tableId must be a non-empty slice stem");
  }
  const waveStartMinute = corpus.waveStartMinute ?? WAVE_START_MINUTE;
  if (!Number.isInteger(waveStartMinute) || waveStartMinute < 0) {
    throw new Error(`SimCoreRunner: corpus.waveStartMinute must be an integer ≥ 0, got ${String(waveStartMinute)}`);
  }
  const traffic: ScenarioCorpusTraffic = Object.freeze({
    profile: "corpus" as const,
    tableId,
    waves: Object.freeze([...corpus.waves]),
    waveStartMinute,
    // v0 boundary: the mainline corpus drive cites STORMS only — the
    // scenario runner's baseline plateau mint is not replicated here.
    baselineRatePerMin: 0,
  });
  // The seam's own fail-loud laws (missing slice, malformed wave, over-cap
  // composition, fully-starved citation) throw ScenarioError from here.
  const windows = resolveCorpusWindows(traffic, runSeed, authority);
  const invitations = authority.invitations ?? buildInvitations({});
  const buildLog = authority.buildLog ?? [];
  const houseWindowMinutes = (authority.geometry ?? DEFAULT_CORPUS_GEOMETRY).windowMinutes;
  const landedByWave = new Map(windows.map((w) => [w.waveN, w]));
  const rows: CorpusPlanRow[] = [];
  let cursor = traffic.waveStartMinute;
  for (const waveN of traffic.waves) {
    const landed = landedByWave.get(waveN);
    if (landed !== undefined) {
      const invited = new Set(landed.plan.invitedThreatIds);
      rows.push(
        Object.freeze({
          wave: waveN,
          judgedAtMinute: landed.plan.scheduledStartMinute,
          scheduled: true,
          startMinute: landed.startMinute,
          windowMinutes: landed.windowMinutes,
          excluded: Object.freeze(landed.plan.gatedThreatIds.filter((id) => !invited.has(id))),
        }),
      );
      cursor += landed.windowMinutes;
      continue;
    }
    const starved = gateCorpusWave(waveN, sliceThreatIdsOf(authority, tableId, waveN), cursor, invitations, buildLog);
    if (starved.spawns) {
      throw new Error(
        `SimCoreRunner: corpus drive disagrees with the seam — the cursor walk invites wave ${waveN} but resolveCorpusWindows excluded it`,
      );
    }
    rows.push(
      Object.freeze({
        wave: waveN,
        judgedAtMinute: cursor,
        scheduled: false,
        startMinute: null,
        windowMinutes: houseWindowMinutes,
        excluded: starved.gatedThreatIds,
      }),
    );
    // CURSOR LAW: an excluded storm advances nothing.
  }
  return Object.freeze({ traffic, windows, rows: Object.freeze(rows) });
}

const PIPELINE_CONFIG: Omit<DefaultPipelineConfig, "runSeed"> = Object.freeze({
  dnsNodeId: null,
  // §7.10 fork: express = front door → WAF tier → service; deep = front door
  // → slow inspection terminal (containment; hot traffic never pays for
  // reaching origin, benign FPs routed there cost conversion — the ache).
  expressPath: Object.freeze([NODE_EDGE, NODE_WAF, NODE_ORIGIN]),
  deepPath: Object.freeze([NODE_EDGE, NODE_DEEP]),
  defaultPatienceUs: 3n * MICROS_PER_MIN,
  defaultSizeCost: fromInt(1),
  patienceJitterPct: 0,
  inspectionCostUs: Object.freeze({
    "pass-through": 0n,
    "sample-1-in-20": 3n * 1_000_000n,
    inspect: 10n * 1_000_000n,
    challenge: 20n * 1_000_000n,
  }),
  detectionRatio: fromRatio(9n, 10n),
  falsePositiveRatio: fromRatio(2n, 100n),
  referralProbability: FIXED_ZERO,
  returnProbability: FIXED_ZERO,
});

/* ═══════════════════════════ adapter helpers ═══════════════════════════ */

function clampUnit(value: Fixed): Fixed {
  if (value < FIXED_ZERO) return FIXED_ZERO;
  if (value > FIXED_UNIT) return FIXED_UNIT;
  return value;
}

/** Fail-loud narrowing from the sim-core `ObservedCell<unknown>` union into
 *  the protocol's `CellValue` (bigint|number|string|null). Anything else is a
 *  contract breach at the boundary, not something to hide. */
function narrowCellValue(key: ObservedKey, value: unknown): CellValue | null {
  if (value === null) return null;
  const kind = typeof value;
  if (kind === "bigint" || kind === "number" || kind === "string") return value as CellValue;
  throw new Error(`SimCoreRunner: observed cell "${key}" carries non-wire value type "${kind}"`);
}

function toProtoCell(key: ObservedKey, cell: ObservedCell<unknown>): ProtoCell {
  return Object.freeze({
    value: narrowCellValue(key, cell.value),
    fidelity: cell.fidelity,
    freshnessUs: cell.freshnessUs,
    coverage: cell.coverage,
    certainty: cell.certainty,
    status: cell.status,
  });
}

/** Honest arrival accounting (F2): the driver mints retry/referral/return
 *  re-entries BETWEEN steps — they join the roster directly and mint NO
 *  arrival event, so counting step-1 events alone reads a retry storm as a
 *  calm lane. "Units that entered this tick" = arrival events (organic) plus
 *  every unit NEW to the roster without an arrival event (re-entered); the
 *  outcome stream is unioned in so a unit that enters and terminates within
 *  one tick is still seen. Pure over id sets — real ticks and synthetic
 *  fixtures alike flow through the same law. CAVEAT: this is a LANE-BLIND
 *  placeholder aggregate (the runner owns exactly one lane); multi-lane
 *  boards need per-node attribution before reuse. */
export function partitionLaneEntries(input: {
  readonly priorUnitIds: ReadonlySet<EntityId>;
  readonly arrivalUnitIds: ReadonlySet<EntityId>;
  readonly currentUnitIds: ReadonlySet<EntityId>;
  readonly outcomeUnitIds: ReadonlySet<EntityId>;
}): { readonly organic: number; readonly reentered: number } {
  let reentered = 0;
  for (const id of input.currentUnitIds) {
    if (input.priorUnitIds.has(id)) continue;
    if (input.arrivalUnitIds.has(id)) continue;
    reentered += 1;
  }
  for (const id of input.outcomeUnitIds) {
    if (input.priorUnitIds.has(id)) continue;
    if (input.arrivalUnitIds.has(id)) continue;
    if (input.currentUnitIds.has(id)) continue; // counted above
    reentered += 1;
  }
  return Object.freeze({ organic: input.arrivalUnitIds.size, reentered });
}

/** Exact integer counter cell (maze split totals) — the G3-exact shape:
 *  the renderer sees "metered-exact", not a derived 80%-coverage Fixed. */
function countCell(value: number): ObservedCell<unknown> {
  return Object.freeze({
    value,
    fidelity: ResolutionBand.Exact,
    freshnessUs: 0n,
    coverage: FIXED_UNIT,
    certainty: FIXED_UNIT,
    status: "live" as const,
  });
}

function derivedCell(value: Fixed): ObservedCell<Fixed> {
  // Derived (not metered) truth: Fine band, 80% coverage/certainty — the
  // renderer must be able to SEE that these are computed aggregates.
  return Object.freeze({
    value,
    fidelity: ResolutionBand.Fine,
    freshnessUs: 0n,
    coverage: fromRatio(4n, 5n),
    certainty: fromRatio(4n, 5n),
    status: "live" as const,
  });
}

const NOTICE_FOR_TERMINAL = Object.freeze({
  served: null, // at nominal, instruments are still
  bounced: "bounce",
  "blocked-false-positive": "false-positive",
  landed: "landed",
} as const) satisfies Record<Outcome["terminal"], EventNotice["kind"] | null>;

/* ═══════════════════════════ the runner ═══════════════════════════ */

/**
 * One completed tick's RAW ground truth for advisory observers (ADR-0012's
 * demoted half). `pipeline/recovery/tracker.ts` composes only from these:
 * the `degradedMinutes` meter needs the per-tick `bounced` events, and the
 * single-authority second-failure verdict needs the post-advance GameState
 * whose `recovery` slice the observer READS (never re-derives).
 *
 * This is a LOCAL accessor — like `recoveryState()`/`attentionState()` it
 * never touches the frozen `SimProjection` wire (protocol-v1 law, @0b35b15
 * precedent): zero protocol churn, zero golden churn, both armed and unarmed
 * frames encode byte-identically whether or not anyone reads the facts.
 */
export interface TickFacts {
  /** The driver's frozen per-tick event stream (door → arrival → outcome →
   *  backpressure → economics order; never mutated, never copied). */
  readonly events: readonly SimEvent[];
  /** The FULL post-advance GameState of that tick (observed merge, cash
   *  mirror and attention roll included). */
  readonly game: GameState;
}

const TICK_ZERO_EVENTS: readonly SimEvent[] = Object.freeze([]);

/* M4 coexistence law (ADR-0019 program 5, gate-g7 precedent): with the Book
 * armed, its re-fed intents carry driver-internal seqs from 1 upward — every
 * door-scheduled PLAYER copy is therefore re-stamped from this floor, so a
 * (tick,seq) pair can never collide inside one feed. Unarmed runners never
 * touch the counter: the host's own seq passes through exactly as before. */
const RUNNER_PLAYER_SEQ_FLOOR = 1000;

/**
 * ADR-0019 program 5 (mainline rule adoption, owner ruling): the runner-side
 * half of the gate-g7 mechanics brought behind one opt-in. The hash book is
 * HOST-owned — the same `lookupPolicyCard` seam g7Runner rides, NOT a
 * cross-import of the gate's deck (lane law: no gates/g7 coupling here).
 */
export interface SimCoreRulesOptions {
  /** policy-card-commit resolver, forwarded VERBATIM to the door config:
   *  hash → card, unknown hash → null (the ordinary `unknown-card-hash`
   *  refusal keeps the last word). The engine re-validates grammar on
   *  commit — a lie in the book dies at the door, never in the runner. */
  readonly lookupPolicyCard: (cardHash: string) => PolicyCard | null;
}

export interface SimCoreRunnerOptions {
  /** Deterministic run seed (whole number; the worker boot message carries it). */
  readonly seed: number;
  /** Emission cadence divisor at 1× — 100ms = 10Hz protocol cap (§7.0). */
  readonly tickRealMs?: number;
  /** TEST SEAM (F2 arrival honesty): force every wave envelope's label to one
   *  family so benign bounces can form real retry storms. Shipped g1 content
   *  is mostly adversarial — neutralized units never re-enter — so without
   *  this knob the driver's between-steps re-entry mint is unobservable in
   *  tests. The override also DISARMS the bundle familyMix dice (audit fix 3):
   *  the seam means "force one family", and with the mix table off the arrival
   *  stream is byte-identical to the pre-mix era (envelope label decides).
   *  Unset keeps the shipped dice; the wire itself gains one always-zero
   *  additive cell (`reentryRatePerMin`) from the F2 split, which every pre-F2
   *  consumer reads as absent-0. */
  readonly familyOverride?: WaveEnvelope["dominantFamily"];
  /** TEST SEAM (B4): swap the wave table the schedule is built from — the
   *  feint-liveness proof plants a marker in an otherwise-shipped slice.
   *  Absent ⇒ the shipped g1 shared-web slice (SHARED_WEB_G1_TABLE). */
  readonly table?: WaveTable;
  /** OD-6/OD-23(a) attention pool (lane @eff5694 host seam, mirrors
   *  fastForward's config.attention): embedded in the minted state and
   *  serviced once per business-month roll the economy fold advances.
   *  ABSENT ⇒ never minted — the state carries no attention key and
   *  digestState ignores the block (byte-identity law). */
  readonly attention?: AttentionState;
  /** L1 pricing book (door lane @0032a21): embedded post-mint and forwarded
   *  as `EconomyTickIn.priceOverrides` on every economy fold. ABSENT ⇒ the
   *  key is OMITTED per tick (empty⇒omitted law @984759b) — the shipped
   *  goldens (cash 25_109_732_500n etc.) are the byte-identity proof. */
  readonly pricing?: PriceOverrideBook;
  /** L1 pricing: contract id → price key at registration (pairs with
   *  `pricing`; a book without keyed contracts resolves to neutral, and
   *  keys without a book never see an override — both no-ops by the
   *  elasticity resolve law). */
  readonly priceKeys?: ReadonlyMap<EntityId, string>;
  /** ADR-0015 5/5 negotiation book (door lane): embedded post-mint and
   *  forwarded as `EconomyTickIn.negotiations` on every economy fold —
   *  mirrors `pricing` EXACTLY (fastForward.ts sibling). ABSENT ⇒ key
   *  OMITTED per tick (empty⇒omitted byte-identity law @984759b). */
  readonly negotiate?: NegotiateBook;
  /** L-SMR (ADR-0016 mechanic B, wave-27): the sell-market CATALOG —
   *  priceKey → host-authored market rate µ$, presence-spread into the money
   *  fold's `EconomyTickIn.sellMarketRates` where it OVERRIDES the installed-
   *  base anchor for the sell acceptance dice (economy/tick.ts step 5.5).
   *  Mirrors the scenario lane's run-config leg EXACTLY (world fact, era
   *  posture): a HOST fact about the market — the PANEL may never arm it, a
   *  UI-supplied feed would be sell fiction the player grades. ABSENT ⇒ the
   *  key is OMITTED per fold (@984759b law) ⇒ the boot goldens
   *  (ca8863849cb3db32 / 780b1cbc61dff760) and money goldens
   *  (25_005_307_300n / 25_109_732_500n) byte-stand. EMPTY⇒OMISSION rides
   *  the SAME law (wave-28 owner-ratified hygiene symmetry): the spread site
   *  drops the key on a size-0 Map — EXACTLY the scenario leg's sellCatalog
   *  collapse (@984759b, scenario/runner.ts), so empty ≡ absent is ONE input
   *  shape at the fold, not merely equal behaviour (pinned
   *  simCoreRunner.catalog.test.ts — empty-option 100-frame digests
   *  byte-equal to OFF + a source pin on the collapse guard). ZERO boot/protocol
   *  change: the catalog never crosses the worker wire v0 (PROTOCOL_VERSION
   *  stays 1) — a future `boot.catalog` rider is the candidate, NOT built
   *  here; construction-site hosts (fakeWorker tests) pass it directly. */
  readonly sellMarketRates?: ReadonlyMap<string, MoneyUnit>;
  /** §7.7 recovery engine (ADR-0012 wiring, mirrors fastForward.config.
   *  recovery): arms the driver's recovery fold — windows, strikes, locks
   *  and gradual-restoration throttling run inside the SIM. ABSENT ⇒ the
   *  driver never folds recovery and every frame stays byte-identical to
   *  the pre-recovery runner (the SimProjection wire is untouched either
   *  way; hosts read the story through recoveryState()/recoveryNotices()). */
  readonly recovery?: RecoveryConfig;
  /** TEST SEAM (§1.7, audit minor @16c6add closure, mirrors fastForward's
   *  config.patienceModeByType): unit type → patience mode forwarded to the
   *  pipeline door so a test can arm the `corrupts` class on the shipped
   *  g1 arrival labels (envelope tableId = table.id, so one row arms every
   *  wave). ABSENT ⇒ the config key is OMITTED and the corruption fan
   *  below stays always-empty — the shipped cash goldens
   *  (25_109_732_500n etc.) are the byte-identity proof. */
  readonly patienceModeByType?: Readonly<Record<string, PatienceMode>> | undefined;
  /** §1.7 SEVERITY DIAL (lane E1, mirrors fastForward's config key): outage
   *  seconds ONE corrupted response burns, forwarded to `corruptionOutageSecs`
   *  on every money fold. Owner taste lives here, not in the engine.
   *  ABSENT (or explicit `undefined`) ⇒ the adapter's default
   *  `CORRUPTION_OUTAGE_SEC` (60n) applies — the exact pre-dial math, so the
   *  shipped cash goldens stay the byte-identity proof. A non-bigint or
   *  non-positive value throws `corruption[bad-value]` on the first step. */
  readonly corruptionOutageSecPerCorruption?: bigint | undefined;
  /** CORPUS-CITED DRIVE MODE (§1.5 seam @5df5586, invitations @bc11697): the
   *  per-minute envelope source becomes `resolveCorpusWindows(citation,
   *  runSeed, authority)` instead of the internal SHARED_WEB_G1 schedule —
   *  see the corpus-drive section for the v0 boundaries. The invitations law
   *  rides the authority (host MAY pass `invitations`/`buildLog`; absent ⇒
   *  every shipped threat spawnable, the byte-ident pre-gate default).
   *  ABSENT ⇒ the runner never touches the scenario seam — every existing
   *  frame digest (money goldens 25_005_307_300n / 25_109_732_500n, mazing
   *  arms, recovery/advisory legs) is the byte-identity proof. */
  readonly corpus?: CorpusDriveOptions | undefined;
  /** D7 build rider (ADR-0014 #D7; wire half is `boot.build` in
   *  shared/protocol.ts): seeds the door's opening embeds at mint —
   *  `hands` reseeds the §7.5 rail capacity (default 2, the T2-staffing
   *  literal), `board` seeds the BoardState edges via `createBoardState`
   *  between the code-defined maze nodes. WHAT SEEDING DOES NOT WIRE (honest
   *  ledger): the node roster, lanes, contracts and wave schedule stay as-is;
   *  routing composition is UNAFFECTED — the route slot walks the
   *  code-defined express/deep node paths and node dependency edges, never
   *  the BoardState slice, so a seeded board changes only what the DOOR sees
   *  (its connect/disconnect/drain/power-cycle verdicts and the edge-exists
   *  refusals that prove the seed is live). ABSENT ⇒ `handCapacity: 2`, no
   *  board key ⇒ every shipped golden (money 25_005_307_300n /
   *  25_109_732_500n, legacy boot digests ca8863849cb3db32 / 780b1cbc61dff760)
   *  is the byte-identity proof. Construction-domain refusals (duplicate or
   *  dangling edge ids, `mintHandState`'s ≥1 rail wall) THROW at the ctor —
   *  the worker hosts' boot-fault channel turns them into a loud fault frame,
   *  never a crash and never a half-seeded run. */
  readonly build?: BootBuildWire | undefined;
  /** RULES LIVE (ADR-0019 program 5): arms the step-12.5 rule phase, the
   *  door's `ruleCarriers: "mapped"` translation, and the per-tick re-feed
   *  of `TickResult.intents` into the next tick's door — see the header
   *  ledger for the full law. Reached over the wire by `boot.rules`
   *  (shared/protocol.ts rider, ADR-0019 program 5 follow-on): PROTOCOL_VERSION
   *  stays 1, absent ⇒ byte-identity; the worker hosts build this option from
   *  the parsed book via the ONE `workerRulesLookup` builder (v0's
   *  "deliberately NOT taken" rider note @921ca7b is now taken).
   *  ABSENT ⇒ every shipped golden is the byte-identity proof. */
  readonly rules?: SimCoreRulesOptions | undefined;
}

export class SimCoreRunner implements SimRunner {
  readonly runnerId = "sim-core" as const;
  readonly engineVersion = "hh-sim-core-adapter v0 (pipeline+observed)";

  private readonly runSeed: RunSeed;
  private readonly driver: TickDriver;
  private readonly store: ObservedStore;
  /* ── B4 wave-rules host inputs (per-instance, purity law covers plans) ──
   *  The shipped g1 slice's waves are planned LAZILY at window entry, each
   *  with the host signals live AT THAT MINUTE (incident state, deep-lane
   *  family census, QoS homogeneity). RNG inputs (waveStream + director
   *  chain) are keyed only by (seed, n, cursor) and precomputed in the
   *  constructor, so deferral changes WHEN a draw happens, never WHAT. */
  private readonly table: WaveTable;
  private readonly windows: readonly WaveWindowSpec[];
  private readonly directorChain: readonly DirectorState[];
  /** Corpus-cited drive mode (null on every default runner): the resolved
   *  citation + the display walk. See `mintCorpusDrive` for the laws. */
  private readonly corpusDrive: CorpusDriveState | null;
  private readonly oversellDeclared: boolean;
  private readonly familyOverride: WaveEnvelope["dominantFamily"] | undefined;
  /** Lane E1 severity dial, forwarded verbatim to `corruptionOutageSecs`
   *  (undefined ⇒ the adapter's default 60n ⇒ pre-dial byte-identity). */
  private readonly corruptionOutageSecPerCorruption: bigint | undefined;
  /* ADR-0016 mechanic B host catalog leg (L-SMR, option above): undefined on
     every default runner — the fold spread below stays dead and the shipped
     goldens ride untouched. An EMPTY Map joins that dead spread: the collapse
     to key-free absence lives at the spread site (scenario-law symmetry,
     wave-28 hygiene), so the stored option stays the host's verbatim book. */
  private readonly sellMarketRates: ReadonlyMap<string, MoneyUnit> | undefined;
  private readonly plans = new Map<number, WavePlan>();
  private readonly envelopes = new Map<number, WaveEnvelope>();
  /** Witness of the rule inputs each lazy plan actually rode (B4 liveness). */
  private readonly ruleInputs = new Map<number, WaveRuleInputs>();
  private incidentClock: IncidentClock = INITIAL_INCIDENT_CLOCK;
  private game: GameState;
  /** Attention month authority (OD-6 host seam, mirrors fastForward): the
   *  roll grid is the business CALENDAR (economy's 43,200-minute month
   *  applied to the host clock), not `econ.monthIndex` — a voided F4 fold
   *  or a dissolved terminal no-op freezes the ledger's counter, but the
   *  calendar does not stop for a dead company. */
  private attentionMonthCursor = 0;
  private lanes: ReadonlyMap<EntityId, LaneStats>;
  private aggression: Fixed = fromRatio(5n, 10n);
  /** §7.10 suspicion dial = TickInputs.expressMaxConfidence (Fixed 0…1).
   *  Slider arm "dial" moves it; the maze route step compares every arrival
   *  score against it. Default 0.8 ⇒ roughly the hottest fifth of traffic
   *  (reputation < 0.2) walks the deep lane while the door is armed. */
  private dial: Fixed = fromRatio(8n, 10n);
  /** Lane-split totals (minted per instance — the purity law covers ledgers). */
  private readonly split: MazeSplitLedger = { express: 0, deep: 0, deepByFamily: {} };
  private readonly intentLog: PlayerIntent[] = [];
  /** Door schedule: intents stamped for the next headlessStep, fed EXACTLY once. */
  private pendingDoorIntents: ExternalIntent[] = [];
  /* ADR-0019 program 5: the frozen rule-door config when the Book is armed
     (null ⇒ every rule leg below is dead code for this instance, and the
     shipped empty/default door config rides untouched). */
  private readonly rules: (SimCoreRulesOptions & { readonly ruleCarriers: "mapped" }) | null;
  /** The Book's re-feed buffer: the last advance's `TickResult.intents`,
   *  stamped into the NEXT door pass exactly once (gate-g7 mirror law). */
  private pendingRuleIntents: readonly PlayerIntent[] = [];
  /** Door-copy seq counter above the M4 floor — instance-local, the purity
   *  law covers ledgers: two fresh armed runners re-stamp identically. */
  private doorSeq = RUNNER_PLAYER_SEQ_FLOOR;
  private counters = { served: 0, bounced: 0, blockedFalsePositive: 0, landed: 0 };
  /* ── money lane (per-instance, purity law covers the ledger) ── */
  private readonly ecoCfg: EconomyConfig;
  private readonly contractsBook: ReadonlyMap<EntityId, Contract>;
  private econ: EconomyState;
  /** Review-F4 refusal census (test-visible via economyInvoiceRefusals()). */
  private invoiceRefusals = 0;
  /* OD-25(a): voided settles buffered as death-watch evidence; a successful
     fold consumes the witness (clears), a void keeps it — the next call
     carries the retried refusal again, same as the money it never moved. */
  private readonly pendingRefusalWitness: RefusedSettlement[] = [];
  /* ADR-0012 host witness: recovery notices in emission order — stays empty
     on every unarmed runner (the driver only fills the channel when armed),
     read via recoveryNotices(). Deliberately NOT on the frozen
     SimProjection wire: zero protocol churn, zero golden churn. */
  private readonly recoveryNoticeLog: RecoveryNotice[] = [];
  /* Tick-facts seam for advisory observers (ADR-0012): a SINGLE-SLOT
     reference replaced on every completed headlessStep — the memory posture
     is one tick deep, never an unbounded log. The events array is the
     driver's own frozen per-tick stream (bounded by that tick's throughput)
     and the GameState is the SAME frozen object every other accessor reads;
     nothing accumulates across ticks here. Before the first step the slot
     answers the tick-0 world: zero events, the minted initial state. */
  private tickFacts: TickFacts;
  private seq = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private speedX: 1 | 2 | 4 = 1;
  private readonly baseTickMs: number;

  constructor(options: SimCoreRunnerOptions) {
    if (!Number.isInteger(options.seed) || options.seed < 0) {
      throw new Error(`SimCoreRunner: seed must be a non-negative integer, got ${options.seed}`);
    }
    this.runSeed = asRunSeed(BigInt(options.seed));
    this.baseTickMs = options.tickRealMs ?? 100;
    /* ADR-0019 program 5: ONE frozen door-config object decides every rule
       leg (null = unarmed). ruleCarriers is NOT host-selectable here — the
       mainline adoption ruling buys the mapped translation, and anything
       else would re-open the unsupported-verb-carrier wall by accident. */
    this.rules =
      options.rules === undefined
        ? null
        : Object.freeze({ ...options.rules, ruleCarriers: "mapped" as const });

    const clocks: ClockState = initialClocks();
    /* D7 board seed resolves BEFORE the mint (fail-loud: a bad rider throws
       here — at construction — never after a partial state exists). */
    const buildBoard = mintBuildBoard(options.build?.board);
    this.game = createInitialState({
      runSeed: this.runSeed,
      engineVersion: this.engineVersion,
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "adapter-sheets-v0", ruleBookHash: "" },
      clocks,
      nodes: [
        // Shared front door — its AUTHORED depth arms/disarms the arrival
        // classifier (see createMazeRouteStep); door-settable posture.
        mkNode(NODE_EDGE, 2, MICROS_PER_MIN, "sample-1-in-20", NODE_ORIGIN),
        // Express defense tier — pass-through at boot, the door can deepen
        // it (inspect/challenge) into a real ROC on the fast lane.
        mkNode(NODE_WAF, 2, 30_000_000n, "pass-through", null),
        // Deep lane — slow by law (§7.10 "the slow lane is made of depth"),
        // terminal: hot traffic is contained here, never reaches origin.
        mkNode(NODE_DEEP, 4, 90_000_000n, "inspect", null),
        mkNode(NODE_ORIGIN, 1, MICROS_PER_MIN, "pass-through", null),
      ],
      lanes: [this.zeroLane()],
      contracts: [CONTRACT],
      // §7.5 action economy: two hands (T2 staff) — the door pays verbs here.
      // D7 rider: `build.hands` reseeds the rail (?? keeps an explicit 0 on
      // its way to mintHandState's >=1 wall — the boot fault names the engine
      // law verbatim, the forwarded-domain-wall precedent).
      handCapacity: options.build?.hands ?? 2,
      /* Board embed rides createInitialState's own optional gate too
         (driver.ts:366, hands/attention precedent): absent ⇒ zero spread ⇒
         no key ⇒ the door materializes lazily exactly as before. */
      ...(buildBoard !== undefined ? { board: buildBoard } : {}),
      /* Attention rides createInitialState's own optional gate (mirrors
         fastForward.mintInitialState); absent ⇒ zero spread ⇒ no key. */
      ...(options.attention !== undefined ? { attention: options.attention } : {}),
    });
    /* The pricing + negotiation books embed post-mint (createInitialState
       accepts attention but not pricing/negotiate; the state record is
       frozen): absent ⇒ the SAME object flows on, zero digest churn. */
    if (options.pricing !== undefined || options.negotiate !== undefined) {
      this.game = Object.freeze({
        ...this.game,
        ...(options.pricing !== undefined ? { pricing: options.pricing } : {}),
        ...(options.negotiate !== undefined ? { negotiate: options.negotiate } : {}),
      });
    }
    this.lanes = this.game.lanes;

    const config: DefaultPipelineConfig = Object.freeze({
      ...PIPELINE_CONFIG,
      runSeed: this.runSeed,
      // Audit fix 3: the dice roll the bundle's mix — unless the test seam
      // forces a single family (then the stream stays pre-mix byte-identical).
      ...(options.familyOverride === undefined ? { familyMix: FAMILY_MIX } : {}),
      /* §1.7 seam (@16c6add closure): absent ⇒ key omitted ⇒ the shipped
         config shape byte-identical to every pre-corruption runner. */
      ...(options.patienceModeByType === undefined
        ? {}
        : { patienceModeByType: options.patienceModeByType }),
    });
    const baseSlots = createDefaultSlots(config);
    const slots = Object.freeze({
      ...baseSlots,
      /* ADR-0019 program 5: the rule phase slot arrives ONLY when armed —
         unarmed keeps `createDefaultSlots`' emptyRulePhaseStep (zero
         firings, zero intents) so the shipped digests never see the key.
         v0 runs the live evaluation config; the Shadow Dial getter g7 wires
         stays gate-exclusive (honest gap row). */
      ...(this.rules === null ? {} : { rulePhase: createRulePhaseStep().step }),
      // The sanctioned composition seam (mirrors gates/g3): swap ONE slot.
      route: createMazeRouteStep(baseSlots.route, {
        frontDoor: NODE_EDGE,
        deepPath: PIPELINE_CONFIG.deepPath,
        split: this.split,
      }),
    });
    this.driver = createTickDriver(slots, streamFor(this.runSeed, "root", 0), this.game.context.clocks,
      Object.freeze({
        /* ADR-0012: absent ⇒ no options key ⇒ the driver folds no recovery
           slice ⇒ frame-for-frame byte-identical to the pre-recovery runner. */
        ...(options.recovery !== undefined ? { recovery: options.recovery } : {}),
        /* ADR-0013 #12(v) host opt-in: a runner that PLANTED the attention
           denomination adopts the owner's opening verb tax (Communicate /
           PolicyCardCommit spend a focus hand). No pool ⇒ key never spread ⇒
           the door config stays the shipped empty default and every pre-
           attention golden run is frame-for-frame byte-identical (eff5694
           absent-pool law: costs only ever bite planted pools).
           ADR-0019 program 5 adds the Book rail: an armed runner spreads
           ruleCarriers "mapped" + lookupPolicyCard into the SAME intents
           object, and the two arms are independent — attention-only,
           rules-only, or both. Neither armed: the key is never spread and
           the shipped goldens stay the byte-identity proof. Rule carriers
           remain attention-EXEMPT (D4): no cost key is invented for them. */
        ...(options.attention === undefined && this.rules === null
          ? {}
          : {
              intents: Object.freeze({
                ...(options.attention === undefined
                  ? {}
                  : { attentionCost: ATTENTION_DEFAULT_COSTS }),
                ...(this.rules === null ? {} : this.rules),
              }),
            }),
      }),
    );
    this.store = new ObservedStore();

    // Money lane priming (mirrors fastForward's register-fold): opening float
    // + one ContractEconomy/error-budget record per book entry.
    this.ecoCfg = defaultEconomyConfig();
    this.contractsBook = Object.freeze(
      new Map<EntityId, Contract>(MONEY_CONTRACTS.map((contract) => [contract.id, contract])),
    );
    this.econ = primeEconomy(this.ecoCfg, options.priceKeys);
    this.attentionMonthCursor = this.attentionMonthOf(this.game);

    /* B4: shipped g1 slice on the wire. Director chain + window schedule are
     * precomputed exactly like fastForward.buildWaveWindows (logged-input law
     * R-31), so a lazy per-wave plan is bit-identical to an eager one. */
    this.table = options.table ?? SHARED_WEB_G1_TABLE;
    this.familyOverride = options.familyOverride;
    this.corruptionOutageSecPerCorruption = options.corruptionOutageSecPerCorruption;
    this.sellMarketRates = options.sellMarketRates;
    this.windows = planWaveWindowSchedule(this.table, WAVE_START_MINUTE);
    this.oversellDeclared = bundleDeclaresOversellSlider(JSON.parse(sharedWebBundleRaw));
    const chain: DirectorState[] = [];
    let director: DirectorState = INITIAL_DIRECTOR_STATE;
    for (const w of this.windows) {
      director = directorPropose(director, BigInt(w.cursor), streamFor(this.runSeed, "director", w.cursor)).next;
      chain.push(director);
    }
    this.directorChain = Object.freeze(chain);
    /* Corpus drive (options.corpus present): resolve the citation through
       the public seam ONCE, at construction — a starved-over citation
       throws before tick 1 (fail-loud law). The internal schedule above
       stays minted but unreferenced in this mode (pure directorPropose
       draws, zero shared dice state — streams are keyed per cursor), so
       the absent-option path is byte-for-byte the pre-corpus runner. */
    this.corpusDrive =
      options.corpus === undefined ? null : mintCorpusDrive(options.corpus, this.runSeed);
    if (this.corpusDrive !== null) {
      // Pre-mint the labeled envelopes so waveEnvelopes() answers from tick 0
      // in this mode; the familyOverride test seam labels here too.
      for (const w of this.corpusDrive.windows) {
        this.envelopes.set(
          w.waveN,
          this.familyOverride === undefined
            ? w.envelope
            : Object.freeze({ ...w.envelope, dominantFamily: this.familyOverride }),
        );
      }
    }
    /* Tick-0 facts: the minted state with an empty event stream — reading
       the seam before the first step answers the starting world, not a lie. */
    this.tickFacts = Object.freeze({ events: TICK_ZERO_EVENTS, game: this.game });
  }

  /** Lazily plan + label window `w` with the host signals LIVE AT ENTRY.
   *  Memoized per wave number — the first covering minute mints it once. */
  private envelopeFor(spec: WaveWindowSpec): WaveEnvelope {
    const cached = this.envelopes.get(spec.n);
    if (cached !== undefined) return cached;
    const plan = this.planMemo(spec);
    const envelope =
      this.familyOverride === undefined
        ? plan.waveEnvelope
        : Object.freeze({ ...plan.waveEnvelope, dominantFamily: this.familyOverride });
    this.envelopes.set(spec.n, envelope);
    return envelope;
  }

  /** The §2.24 wiring point: every host-derived rule input rides THIS call.
   *  incidentState "quiet" is engine-inert (absent ≙ quiet), dominantDefense-
   *  Family is omitted until the deep lane has engaged a family, and oversell
   *  is supplied only when the bundle declares the slider (OD-24). */
  private planWaveFor(spec: WaveWindowSpec): WavePlan {
    const lane = this.lanes.get(LANE_ID);
    const dominant = dominantFamilyOfCensus(this.split.deepByFamily ?? {});
    const oversell = this.oversellDeclared
      ? Object.freeze({
          ratioMicro: OVERSELL_RATIO_MICRO,
          homogeneityMicro: homogeneityMicroFromClassMix(lane?.classMix ?? {}),
        })
      : undefined;
    const incident = incidentStateOf(this.incidentClock);
    this.ruleInputs.set(
      spec.n,
      Object.freeze({ incidentState: incident, dominantDefenseFamily: dominant, oversell }),
    );
    return planWave(this.table, spec.n, {
      startMinute: spec.cursor,
      tick: BigInt(spec.cursor),
      rng: waveStream(this.runSeed, spec.n, spec.cursor),
      director: this.directorChain[spec.index] as DirectorState,
      ledger: ledgerSnapshot([], 0n),
      invitations: buildInvitations({}),
      entropyForecastPurchased: false,
      pressureParams: PRESSURE,
      incidentState: incident,
      ...(dominant === undefined ? {} : { dominantDefenseFamily: dominant }),
      ...(oversell === undefined ? {} : { oversell }),
    });
  }

  /** The fastForward envelope law (sim-core unattended): a window is active
   *  at `minute` iff minute ∈ [plan.startMinute, plan.startMinute + authored
   *  window) — plan.startMinute being the PLACEMENT-DRAW result, not the
   *  cursor. Minting triggers the first time the cursor minute is reached,
   *  so overlapping placements can legitimately feed two envelopes (the
   *  arrival step fans every active envelope; the quarter builds). */
  private envelopesAtMinute(minute: number): readonly WaveEnvelope[] {
    /* Corpus drive: the seam's own active-window law (minute ∈
       [startMinute, startMinute + window) — startMinute being the
       placement-drawn result, same reading the scenario runner applies). */
    if (this.corpusDrive !== null) {
      const active: WaveEnvelope[] = [];
      for (const w of this.corpusDrive.windows) {
        if (minute >= w.startMinute && minute < w.startMinute + w.windowMinutes) {
          const minted = this.envelopes.get(w.waveN);
          active.push(minted ?? w.envelope);
        }
      }
      return Object.freeze(active);
    }
    const active: WaveEnvelope[] = [];
    for (const w of this.windows) {
      if (minute < w.cursor) continue; // not entered yet — never mint early
      const plan = this.planMemo(w);
      if (minute >= plan.startMinute && minute < plan.startMinute + w.windowMinutes) {
        active.push(this.envelopeFor(w));
      }
    }
    return Object.freeze(active);
  }

  private planMemo(spec: WaveWindowSpec): WavePlan {
    const cached = this.plans.get(spec.n);
    if (cached !== undefined) return cached;
    const plan = this.planWaveFor(spec);
    this.plans.set(spec.n, plan);
    return plan;
  }

  /** B4 witnesses (tests / future HUD explain chains): plans mint LAZILY at
   *  window entry, so a wave not yet reached reads undefined — never a lie. */
  wavePlan(n: number): WavePlan | undefined {
    return this.plans.get(n);
  }

  waveEnvelopes(): ReadonlyMap<number, WaveEnvelope> {
    return this.envelopes;
  }

  incidentState(): IncidentState {
    return incidentStateOf(this.incidentClock);
  }

  dominantDefenseFamily(): ThreatFamily | undefined {
    return dominantFamilyOfCensus(this.split.deepByFamily ?? {});
  }

  /** The rule inputs each minted plan actually rode (B4 liveness witness —
   *  undefined until that window's entry minute has been stepped). */
  waveRuleInputs(n: number): WaveRuleInputs | undefined {
    return this.ruleInputs.get(n);
  }

  /** Corpus-cited drive-mode witness (LOCAL accessor, protocol-v1 law —
   *  never on the wire): one row per CITED wave, scheduled or excluded, in
   *  citation order. `judgedAtMinute` is the packed-cursor minute the
   *  invitation law judged it at (an excluded storm leaves no hole, so the
   *  rows after it prove the cursor law); `excluded` names the gated-but-
   *  uninvited threats deferred per wave. `null` on every non-corpus runner. */
  corpusPlan(): readonly CorpusPlanRow[] | null {
    return this.corpusDrive === null ? null : this.corpusDrive.rows;
  }

  /** The resolved traffic citation behind `corpusPlan()` (null off-mode) —
   *  tableId + waves + waveStartMinute the runner actually resolved. */
  corpusTraffic(): ScenarioCorpusTraffic | null {
    return this.corpusDrive === null ? null : this.corpusDrive.traffic;
  }

  start(emit: (projection: SimProjection) => void): void {
    if (this.timer !== null) return; // idempotent boot
    this.emitSink = emit;
    emit(this.headlessStep(this.baseTickMs));
    this.timer = setInterval(() => emit(this.headlessStep(this.baseTickMs)), this.baseTickMs / this.speedX);
  }

  /** THE intent door is open (contract #10, docs/API-REFERENCE.md §10): the
   *  driver runs `applyIntentDoor` before step 1 of every tick, so a
   *  `player-verb` intent is stamped for the NEXT macro-tick and fed EXACTLY
   *  ONCE through `TickInputs.externalIntents` — hands pay there, execute-or-
   *  refuse verdicts return as `doorReceipts` and surface on the projection
   *  as `intent-executed` / `intent-refused` notices. `configure` on a board
   *  node moves per-node inspection depth — which is what arms/disarms the
   *  §7.10 arrival classifier (front door) and sets each lane's ROC posture
   *  (waf/deep tiers). The slider arms keep direct pre-door bindings
   *  ("aggression" = ROC posture, "dial" = expressMaxConfidence). The legacy `verb`
   *  carrier stays INPUT-LOG ONLY by law: the door refuses that carrier
   *  (`unsupported-verb-carrier`), so it must never reach the schedule. */
  submit(intent: PlayerIntent): void {
    this.intentLog.push(intent);
    const payload = intent.payload;
    if (payload.kind === "slider") {
      if (payload.control === "aggression") this.aggression = clampUnit(payload.value);
      // §7.10 suspicion dial: Fixed 0…FIXED_UNIT straight into
      // expressMaxConfidence. 0 ⇒ maze everything hot; 1 ⇒ no mazing.
      else if (payload.control === "dial") this.dial = clampUnit(payload.value);
      return;
    }
    if (payload.kind === "player-verb") {
      /* The host's own intent rides the intentLog verbatim (replay evidence);
         only the DOOR copy re-stamps, and only when the Book is armed —
         driver rule seqs own the low band (M4). Unarmed: untouched pass-
         through, every shipped intent-door witness byte-stands. */
      const scheduled =
        this.rules === null
          ? intent
          : Object.freeze({ ...intent, seq: (this.doorSeq += 1) });
      this.pendingDoorIntents.push({ tick: this.game.context.tick + 1n, intent: scheduled });
    }
  }

  /** Speed gates OBSERVATION cadence, never physics: it re-times the emit
   *  interval; per-step tick advance is untouched either way. */
  setSpeed(speedX: 1 | 2 | 4): void {
    this.speedX = speedX;
    if (this.timer === null) return;
    clearInterval(this.timer);
    this.timer = null;
    if (this.emitSink !== null) this.start(this.emitSink);
  }

  stop(): void {
    if (this.timer === null) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  /** Intents recorded this run (read-only view for the bridge/tests). */
  submittedIntents(): readonly PlayerIntent[] {
    return Object.freeze([...this.intentLog]);
  }

  /** Review-F4 insolvent-settle refusal census (test/ops visibility — a
   *  growing count means the roster is underfunded, not that physics broke). */
  economyInvoiceRefusals(): number {
    return this.invoiceRefusals;
  }

  /** §1.7 audit witness (corruption-forwarding, mirrors fastForward's
   *  `report.finalErrorBudgetMinSec`): the money lane's minimum error-budget
   *  remaining seconds across the three demo contracts, using the same
   *  economy authority the guardrail sampler reads. A corruption plant moves
   *  it by exactly 60 s per corrupted unit; a default runner never moves it
   *  beyond the landed fan. Local accessor — zero new module exports. */
  errorBudgetMinSec(): bigint | null {
    let min: bigint | null = null;
    for (const budget of this.econ.errorBudgets.values()) {
      const remaining = remainingSec(budget);
      if (min === null || remaining < min) min = remaining;
    }
    return min;
  }

  /** The live attention pool (OD-6 host seam) — undefined on every default
   *  runner (never minted). Chrome/tests read the loan ledger here, like
   *  economyInvoiceRefusals() reads the F4 census. */
  attentionState(): AttentionState | undefined {
    return this.game.attention;
  }

  /** MID-RUN WINDOW ENTRY (closes the E2a seam (a) the AttentionCard
   *  gap-noted @5b19a04): the host-side action-on-state between ticks for
   *  `attentionWindowEntry` — the pipeline's ONLY hand-creation event. Same
   *  prerogative the month-roll forward already exercises: the roll is an
   *  ACTION on state between ticks, not a step input (frozen TickInputs
   *  contract, @eff5694 docblock). No door verb is involved — the door still
   *  has no borrowing verb; this seam is the host planting the loan, mint or
   *  refuse, strictly through the public pipeline functions:
   *
   *  · pool present → `attentionWindowEntry(pool, kind, businessMinute)`;
   *  · pool ABSENT  → mint the pipeline's own default pool
   *    (`createAttentionState()`, capacity `ATTENTION_CAPACITY_DEFAULT`) and
   *    plant the first entry on it — nothing is invented, the denomination
   *    simply comes into play at the call;
   *  · opened       → the new frozen pool is written onto `GameState.attention`
   *    (digest-switch law: frames from here on carry the wire AttentionSummary
   *    roll-up; the SHAPE is untouched — protocol-v1 law @0b35b15);
   *  · bounded      → `debt >= capacity` answers the pipeline's refusal text
   *    verbatim with the input state's IDENTITY and `this.game` untouched —
   *    the refusal never forges a state change (never-silent-loss law).
   *
   *  The minute stamped on the row is the host business clock at the call
   *  (same `businessUs / MICROS_PER_MIN` authority the month-roll block
   *  reads), so a mid-run loan visibly carries a mid-run timestamp. */
  enterAttentionWindow(kind: AttentionLoanKind): AttentionWindowResult {
    const pool = this.game.attention ?? createAttentionState();
    const businessMinute = Number(this.game.context.clocks.businessUs / MICROS_PER_MIN);
    const result = attentionWindowEntry(pool, kind, businessMinute);
    if (result.state !== this.game.attention) {
      this.game = Object.freeze({ ...this.game, attention: result.state });
    }
    return result;
  }

  /** The live recovery slice (ADR-0012 host seam) — undefined on every
   *  unarmed runner AND when every window has closed (the engine slice
   *  self-clears). Chrome/tests read window state here, same pattern as
   *  attentionState() reads the loan ledger. */
  recoveryState(): RecoveryState | undefined {
    return this.game.recovery;
  }

  /** Recovery notices emitted by the armed engine this run, in order —
   *  empty on every unarmed runner (the witness channel stays honest). */
  recoveryNotices(): readonly RecoveryNotice[] {
    return Object.freeze([...this.recoveryNoticeLog]);
  }

  /** The raw facts of the LATEST completed tick for advisory observers
   *  (ADR-0012's demoted half — `pipeline/recovery/tracker.ts` composes from
   *  exactly this). Single-slot reference, replaced every `headlessStep`:
   *  memory posture is ONE tick deep (see the `tickFacts` field docblock),
   *  never an unbounded log. LOCAL accessor only: the frozen SimProjection
   *  wire gains nothing (protocol-v1 law @0b35b15). Before the first step it
   *  answers the tick-0 world — zero events, the minted initial state. */
  lastTickFacts(): TickFacts {
    return this.tickFacts;
  }

  /** The business-calendar month a state's clock points INTO (economy's
   *  monthIndexOf law — floorDiv over the 43,200-minute month, tick.ts:152
 *    — applied straight to the host clock). Mirrors fastForward's
   *  attentionMonthOf: same grid, same arithmetic, two hosts. */
  private attentionMonthOf(state: GameState): number {
    return Math.floor(
      Number(state.context.clocks.businessUs / MICROS_PER_MIN) / ATTENTION_MONTH_MINUTES,
    );
  }

  headlessStep(_dtRealMs: number): SimProjection {
    const minute = this.game.context.minute + 1;
    /* placement-gated envelopes (fastForward law); lazily-planned waves mint
       their plan with the host signals LIVE AT WINDOW ENTRY. */
    const envelopes: readonly WaveEnvelope[] = this.envelopesAtMinute(minute);
    const due = this.pendingDoorIntents.splice(0, this.pendingDoorIntents.length);
    /* ADR-0019 program 5 (gate-g7 mirror): last tick's Book intents join THIS
       pass, scheduled for the same next tick the player submitted into. The
       door sorts the feed by (tick, seq), so array order is not authority —
       the M4 seq bands are (rule low, player above the floor). Unarmed: the
       buffer is permanently empty and never even read. */
    if (this.rules !== null) {
      const ruleTick = this.game.context.tick + 1n;
      for (const intent of this.pendingRuleIntents) {
        due.push(Object.freeze({ tick: ruleTick, intent }));
      }
      this.pendingRuleIntents = [];
    }

    const inputs: TickInputs = Object.freeze({
      envelopes,
      evidence: Object.freeze([]),
      classes: CLASSES,
      dependencyEdges: DEPENDENCY_EDGES,
      retryPolicy: RETRY,
      aggression: this.aggression,
      expressMaxConfidence: this.dial,
      lanes: this.lanes,
      ...(due.length > 0 ? { externalIntents: Object.freeze(due) } : {}),
    });

    const priorUnitIds = new Set<EntityId>(this.game.units.keys());
    const result = this.driver.advance(this.game, inputs);
    this.game = result.state;
    /* Recovery notices ride their own channel (TickResult.recoveryNotices,
       present only when the driver was armed) — witness, not wire. */
    if (result.recoveryNotices !== undefined) {
      this.recoveryNoticeLog.push(...result.recoveryNotices);
    }
    /* ADR-0019 program 5 re-feed handover: whatever this tick's rule phase
       produced waits in the buffer for the NEXT door pass (one-tick reaction
       lag, exactly the recovery channel's posture). Empty every tick when
       unarmed — the assignment itself is gated. */
    if (this.rules !== null) this.pendingRuleIntents = result.intents;

    /* step-12 observed layer: renderer-facing lane cells DERIVED FROM REAL
       driver outputs (honest entry accounting — arrival events PLUS the F2
       re-entries the driver mints between steps, worst node ρ, live QoS
       mix), sealed through the store's single-writer gate. */
    const arrivalUnitIds = new Set<EntityId>();
    for (const event of result.events) {
      if (event.kind === "arrival") arrivalUnitIds.add(event.unitId);
    }
    const entries = partitionLaneEntries({
      priorUnitIds,
      arrivalUnitIds,
      currentUnitIds: new Set<EntityId>(this.game.units.keys()),
      outcomeUnitIds: new Set<EntityId>(result.outcomes.map((outcome) => outcome.unitId)),
    });
    const ratePerMin = fromInt(entries.organic + entries.reentered);
    const health = this.laneHealthFromNodes(this.game);
    const tickUs = this.game.context.clocks.simUs;
    this.store.applyObservedWrites(
      Object.freeze([
        Object.freeze({
          key: observedKey(LANE_ID, "ratePerMin"),
          cell: derivedCell(ratePerMin),
          causeId: asCauseId(`adapter:lane-rate:${this.game.context.tick}`),
        }),
        Object.freeze({
          // Explicit organic-vs-retry split (§7.13 story): a retry storm must
          // READ differently from a traffic spike. ratePerMin above is the
          // honest total; this cell isolates the between-steps re-entry mint.
          key: observedKey(LANE_ID, "reentryRatePerMin"),
          cell: derivedCell(fromInt(entries.reentered)),
          causeId: asCauseId(`adapter:lane-reentry:${this.game.context.tick}`),
        }),
        Object.freeze({
          key: observedKey(LANE_ID, "health"),
          cell: derivedCell(health),
          causeId: asCauseId(`adapter:lane-health:${this.game.context.tick}`),
        }),
        /* §7.10 lane-split cells — "watch the ratio of motes taking each
           lane": cumulative arrival routings by lane + the classifier's
           armed flag (0/1), so a flat deep-count is READABLE as "the door
           stopped looking", not as "nobody is hot". */
        Object.freeze({
          key: observedKey(LANE_ID, "routedExpress"),
          cell: countCell(this.split.express),
          causeId: asCauseId(`adapter:maze:${this.game.context.tick}:exp`),
        }),
        Object.freeze({
          key: observedKey(LANE_ID, "routedDeep"),
          cell: countCell(this.split.deep),
          causeId: asCauseId(`adapter:maze:${this.game.context.tick}:deep`),
        }),
        Object.freeze({
          key: observedKey(LANE_ID, "mazeArmed"),
          cell: countCell(this.edgeIsArmed(this.game)),
          causeId: asCauseId(`adapter:maze:${this.game.context.tick}:armed`),
        }),
      ]),
      tickUs,
    );
    const merged = new Map(this.game.observed);
    for (const [key, cell] of this.store.toObservedMap()) merged.set(key, cell);
    this.game = Object.freeze({ ...this.game, observed: Object.freeze(merged) });

    /* ── money lane (REST-PROTO-FINAL, 45f0edf handoff #1) ──────────────
       runEconomyTick on the driver's business clock, seeded dunning rolls,
       company-wide outage reading of landed breaches. The tick's own
       observedWrites (fix-economy @57ea80e: today `company::reputation`,
       publish-on-change so quiet ticks ship an empty batch) go through the
       SAME single-writer store, then the observed map is re-merged this tick
       — without that second pass chrome would keep '?' reputation cells for
       the frame the score moved. Same-tick watermark is legal (store allows
       equal tickUs). Cash + ledger seq mirror into GameState exactly like
       fastForward's withCashMirror: the ledger becomes the money authority
       the projection reads (the pre-lane `cash.free` was a createInitialState
       placeholder that never moved). */
    /* Error-budget burn (audit minor @16c6add host wiring): landed
       violations AND data corruptions both burn SLA seconds. The pipeline's
       public `corruptionOutageSecs` fan rides the SAME EconomyTickIn
       .outageSecs channel as the landed fan, seconds ADDING per contract.
       Both empty ⇒ null ⇒ the key is omitted — every pre-corruption frame
       (and the shipped cash goldens) byte-identical. The lane E1 dial rides
       as the third arg: undefined ⇒ default 60n ⇒ the exact pre-dial math. */
    const landedThisTick = result.outcomes.reduce(
      (acc, outcome) => (outcome.terminal === "landed" ? acc + OUTAGE_SECONDS_PER_LANDED : acc),
      0n,
    );
    const corruptionFan = corruptionOutageSecs(
      result.corruptions ?? [],
      this.contractsBook,
      this.corruptionOutageSecPerCorruption,
    );
    let outage: Map<EntityId, bigint> | null = null;
    if (landedThisTick > 0n || corruptionFan !== null) {
      const merged = new Map<EntityId, bigint>();
      for (const id of this.contractsBook.keys()) {
        merged.set(id, landedThisTick + (corruptionFan?.get(id) ?? 0n));
      }
      outage = Object.freeze(merged);
    }
    const economyNotices: EconomyNotice[] = [];
    try {
      const out = runEconomyTick(
        Object.freeze({
          context: this.game.context,
          runSeed: this.runSeed,
          contracts: this.contractsBook,
          prior: this.econ,
          cfg: this.ecoCfg,
          dunningEngineOwned: false,
          ...(outage === null ? {} : { outageSecs: outage }),
          /* Pricing forward (@5781335 host seam, mirrors fastForward): the
             embedded book's map IS priceOverrides' type; absent book ⇒ key
             omitted ⇒ the golden-carrying input shape byte-identical. */
          ...(this.game.pricing !== undefined ? { priceOverrides: this.game.pricing.overrides } : {}),
          /* Negotiation forward (ADR-0015 5/5, mirrors the pricing leg):
             embedded book's term map IS negotiations' type; absent book ⇒
             key omitted ⇒ the golden-carrying input shape byte-identical. */
          ...(this.game.negotiate !== undefined ? { negotiations: this.game.negotiate.entries } : {}),
          /* Sell-offer forward (ADR-0016 mechanic B, mirrors the negotiate
             leg): embedded book's offer map IS sellOffers' type; absent
             book ⇒ key omitted ⇒ the money-golden-carrying input shape
             byte-identical. The catalog leg (L-SMR, wave-27): the host
             option — never a panel feed (world fact, era posture) — rides
             beside it with the collapse law (wave-28 hygiene symmetry, the
             scenario leg's sellCatalog EXACT mirror @984759b): absent OR
             size-0 ⇒ key omitted, so empty ≡ absent is ONE input shape;
             offers anchor on keyed contract MRCs (the priceKeys seam) or
             stay honestly unadjudicated. A non-empty catalog WITHOUT a book
             is inert by the fold's own gate (tick.ts 5.5), so the boot and
             money goldens byte-stand in every catalog-only arm. */
          ...(this.game.sell !== undefined ? { sellOffers: this.game.sell.entries } : {}),
          ...(this.sellMarketRates !== undefined && this.sellMarketRates.size > 0
            ? { sellMarketRates: this.sellMarketRates }
            : {}),
          /* Empty buffer ⇒ key omitted ⇒ the pre-death input shape (and the
             goldens riding it) byte-identical. */
          ...(this.pendingRefusalWitness.length > 0
            ? { refusedSettlements: Object.freeze([...this.pendingRefusalWitness]) }
            : {}),
        }),
      );
      this.econ = out.state;
      this.pendingRefusalWitness.length = 0; // the fold consumed the evidence
      economyNotices.push(...out.notices);
      if (out.observedWrites.length > 0) {
        this.store.applyObservedWrites(out.observedWrites, tickUs);
        const remerged = new Map(this.game.observed);
        for (const [key, cell] of this.store.toObservedMap()) remerged.set(key, cell);
        this.game = Object.freeze({ ...this.game, observed: Object.freeze(remerged) });
      }
    } catch (err) {
      if (!(err instanceof RangeError) || !NEGATIVE_BUCKET_LAW.test(err.message)) throw err;
      this.invoiceRefusals += 1; // prior econ kept; the invoice retries next tick
      this.pendingRefusalWitness.push(invoiceRefusalWitness(err.message));
    }
    this.game = Object.freeze({
      ...this.game,
      cash: this.econ.cash,
      ledgerSeq: this.econ.journal.nextSeq,
    });

    /* ── attention month-roll (OD-6 host seam @eff5694, mirrors fastForward) ──
       Roll authority is the business CALENDAR (43,200-minute grid on the
       host clock), independent of the economy fold's own counter — the
       clock keeps rolling through voided F4 folds and dissolved ledgers.
       replenishAtBusinessMonth services ONE oldest unrepaid loan per roll
       (discrete-event law), so a multi-roll catch-up loops the delta.
       Absent pool ⇒ never minted, lane reads the optional field and skips;
       off-roll frames ⇒ never called (allocation-free). */
    if (this.game.attention !== undefined) {
      const monthsNow = this.attentionMonthOf(this.game);
      const monthRolls = monthsNow - this.attentionMonthCursor;
      this.attentionMonthCursor = monthsNow;
      if (monthRolls > 0) {
        const businessMinute = Number(this.game.context.clocks.businessUs / MICROS_PER_MIN);
        let attention = this.game.attention;
        for (let roll = 0; roll < monthRolls; roll += 1) {
          attention = replenishAtBusinessMonth(attention, businessMinute, true);
        }
        this.game = Object.freeze({ ...this.game, attention });
      }
    }

    /* counters + notices from the REAL outcome stream. Surge reads the HONEST
       entry total (organic + re-entries): a retry storm flooding the lane IS a
       surge — that blindness was the F2 bug this fix retires. */
    const notices: EventNotice[] = [];
    const incidentLosses = { bounced: 0, landed: 0 };
    if (entries.organic + entries.reentered >= 3) {
      notices.push({ kind: "arrival-surge", laneId: LANE_ID, atUs: tickUs });
    }
    /* door verdicts ride the same seam (contract #10 receipts): one notice
       per fed intent. E2b: an EXECUTED receipt now carries the handler's
       detail when it has one — "<verb>: <target=…,price=…>" mirrors the
       refused "<verb>: <reason>" shape (the adjust-price confirmation line
       in PricingDial reads target+price off this wire). */
    for (const receipt of result.doorReceipts) {
      notices.push({
        kind: receipt.outcome === "executed" ? "intent-executed" : "intent-refused",
        laneId: null,
        atUs: tickUs,
        detail:
          receipt.reason !== null
            ? `${receipt.verb}: ${receipt.reason}`
            : receipt.detail === undefined
              ? receipt.verb
              : `${receipt.verb}: ${receipt.detail}`,
      });
    }
    for (const outcome of result.outcomes) {
      const terminal = outcome.terminal;
      if (terminal === "served") this.counters.served += 1;
      else if (terminal === "bounced") this.counters.bounced += 1;
      else if (terminal === "blocked-false-positive") this.counters.blockedFalsePositive += 1;
      else this.counters.landed += 1;
      /* B4 incident fold: losses THIS minute feed the rolling clock the next
         lazy wave plan reads (a landed breach is an incident on sight; two
         losses inside the window make one together). */
      if (terminal === "bounced") incidentLosses.bounced += 1;
      else if (terminal === "landed") incidentLosses.landed += 1;
      const noticeKind = NOTICE_FOR_TERMINAL[terminal];
      if (noticeKind !== null) {
        notices.push({ kind: noticeKind, laneId: LANE_ID, atUs: outcome.atUs });
      }
    }
    this.incidentClock = stepIncidentClock(this.incidentClock, incidentLosses);
    for (const firing of result.ruleFirings) {
      /* ADR-0019 program 5: the firing story rides the EXISTING wire shape —
         detail names the card that fired (the gate-g7 tape's rule id, same
         authority). Zero new NoticeKinds, zero protocol churn; unarmed
         runners fold zero firings, so every shipped digest stands. */
      notices.push({ kind: "rule-fired", laneId: null, atUs: tickUs, detail: String(firing.ruleId) });
    }
    /* Money-lane roll-up (protocol NoticeKind "economy-notice"): one wire
       notice per EconomyNotice the tick emitted, detail carrying the
       engine-kind + contract so chrome/i18n consumers split on the first
       colon without a 25-member union crossing the seam. Order = engine
       order (deterministic). E2b: the engine's OWN causeId rides as the
       structured `causeId` field (LossCard narrates the real death cause —
       `economy:death:dissolved:<cause>:<minute>` — without colon-guessing). */
    for (const notice of economyNotices) {
      notices.push({
        kind: "economy-notice",
        laneId: null,
        atUs: tickUs,
        detail: `${notice.kind}:${notice.contractId}`,
        causeId: notice.causeId,
      });
    }

    /* next tick's lane input: aggregates of THIS ground truth (the default
       state-economics step passes lanes through; derivation is the caller's
       observed-layer job, so it lives in this adapter). */
    this.lanes = Object.freeze(
      new Map<EntityId, LaneStats>([
        [
          LANE_ID,
          Object.freeze({
            laneId: LANE_ID,
            ratePerMin,
            latencyDistributionRef: LAG_TABLE_REF,
            classMix: this.classMixFromUnits(this.game),
            health,
          }),
        ],
      ]),
    );

    this.seq += 1;
    const observed = new Map<ObservedKey, ProtoCell>();
    for (const [key, cell] of this.game.observed) observed.set(key, toProtoCell(key, cell));

    /* Attention readback (E2b seam 3): the loan-pool roll-up crosses the wire
       ONLY when the host planted the pool (options.attention) — every default
       runner omits the key entirely, so legacy frames encode byte-identically.
       Aggregates only (capacity/debt/window/loanCount): the HandTokens and the
       ledger rows stay engine-side, the HUD sees what §7.5 makes observable. */
    const attention = this.game.attention;

    /* Tick-facts seam (ADR-0012 advisory observers): stamp the single slot
       with this tick's frozen driver events + the FINAL completed-tick
       state (post observed-merge, cash mirror and attention roll) — replaced
       next step, so the posture stays one tick deep. */
    this.tickFacts = Object.freeze({ events: result.events, game: this.game });

    return Object.freeze({
      seq: this.seq,
      tick: this.game.context.tick,
      minute: this.game.context.minute,
      clocks: this.game.context.clocks,
      lanes: Object.freeze([...this.lanes.values()]),
      observed,
      notices: Object.freeze(notices),
      counters: Object.freeze({ ...this.counters }),
      freeCashMicroUsd: this.game.cash.free,
      ...(attention === undefined
        ? {}
        : {
            attention: {
              capacity: attention.capacity,
              debt: attention.debt,
              window: attention.window,
              loanCount: attention.loanLedger.length,
            },
          }),
    });
  }

  /* ═══════════════════════ internals ═══════════════════════ */

  private emitSink: ((projection: SimProjection) => void) | null = null;

  private zeroLane(): LaneStats {
    return Object.freeze({
      laneId: LANE_ID,
      ratePerMin: FIXED_ZERO,
      latencyDistributionRef: LAG_TABLE_REF,
      classMix: Object.freeze({}),
      health: FIXED_UNIT,
    });
  }

  /** Classifier posture reader (0/1 for the wire): the front door sees
   *  traffic only while its (door-settable) inspection depth is not
   *  pass-through — the exact law createMazeRouteStep applies. */
  private edgeIsArmed(state: GameState): number {
    const door = state.nodes.get(NODE_EDGE);
    return door !== undefined && door.inspectionDepth !== "pass-through" ? 1 : 0;
  }

  /** Worst-node saturation → headroom: health = clamp(1 − max ρ). ρ is a
   *  ground-truth node stamp the state-economics step already observed. */
  private laneHealthFromNodes(state: GameState): Fixed {
    let worst = FIXED_ZERO;
    for (const node of state.nodes.values()) {
      if (node.utilizationRho > worst) worst = node.utilizationRho;
    }
    return clampUnit(FIXED_UNIT - worst);
  }

  /** Live-unit QoS mix (insertion order of units is part of the deterministic
   *  identity, and shares are ratios → Map-free plain record). */
  private classMixFromUnits(state: GameState): Readonly<Record<string, Fixed>> {
    const total = state.units.size;
    if (total === 0) return Object.freeze({});
    const byClass = new Map<string, number>();
    for (const unit of state.units.values()) {
      const cls = unit.qosClassId ?? "unclassified";
      byClass.set(cls, (byClass.get(cls) ?? 0) + 1);
    }
    const mix: Record<string, Fixed> = {};
    for (const key of [...byClass.keys()].sort()) {
      const count = byClass.get(key);
      if (count === undefined) continue;
      mix[key] = fromRatio(BigInt(count), BigInt(total));
    }
    return Object.freeze(mix);
  }
}
