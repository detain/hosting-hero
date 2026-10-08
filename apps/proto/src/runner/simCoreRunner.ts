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
 * The projection that leaves through the protocol carries ONLY observed-layer
 * data: LaneStats aggregates, ObservedCells, counters, notices, clocks.
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
  type ClockState,
  type Contract,
  type DependencyEdge,
  type EntityId,
  type ExternalIntent,
  type Fixed,
  type LaneStats,
  type NodeRecord,
  type ObservedCell,
  type ObservedKey,
  type GameState,
  type Outcome,
  type PlayerIntent,
  type QosClassDef,
  type RetryPolicy,
  type RunSeed,
  type SimTick,
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
} from "@hh/sim-core/kernel";
import {
  createDefaultSlots,
  createInitialState,
  createTickDriver,
  makeSlots,
  type DefaultPipelineConfig,
  type TickDriver,
  type TickInputs,
} from "@hh/sim-core/pipeline";
import { ObservedStore } from "@hh/sim-core/observed";
import {
  INITIAL_DIRECTOR_STATE,
  buildInvitations,
  directorPropose,
  ledgerSnapshot,
  parseWaveTable,
  planWave,
  waveStream,
  type DirectorState,
  type PressureParams,
  type WavePlan,
} from "@hh/sim-core/waves";
import type { SimProjection, EventNotice, ProtoCell, CellValue } from "../shared/protocol";
import type { SimRunner } from "./simRunner";

/* ═══════════════════════════ scenario (G1 smoke board) ═══════════════════════════
 * Local constants, not sim-core internals: a one-lane ingress board whose
 * numbers come from the sanctioned integration example. Placeholder-content
 * grade — the content wave replaces this with loaded ruleset bundles. */

const LANE_ID = asEntityId("lane/ingress-1");
const NODE_EDGE = asEntityId("edge");
const NODE_ORIGIN = asEntityId("origin");
const LAG_TABLE_REF = "g1-smoke-lag-v0";
const WAVE_WINDOW_MINUTES = 12;
const WAVE_START_MINUTE = 2;

/** Small opening budget (6 units) — same legal pressure override the smoke
 *  uses, so a 100-tick test run stays cheap without losing bounce physics. */
const PRESSURE: PressureParams = Object.freeze({
  baseMicro: 6n * 1_000_000n,
  growthNum: 223n,
  growthDen: 200n,
  sawtoothMicro: Object.freeze([1_000_000n]),
});

const WAVE_TABLE_RAW = Object.freeze({
  id: "g1-adapter",
  typeBundleId: "shared-web",
  tuningSheet: "B",
  unitsPerPressurePoint: 1,
  waves: Object.freeze([
    Object.freeze({
      n: 1,
      windowMinutes: WAVE_WINDOW_MINUTES,
      rampMin: 3,
      plateauMin: 3,
      decayMin: 2,
      parPct: 100,
      hard: false,
      entries: Object.freeze([
        Object.freeze({
          threatId: "adapter-swarm",
          role: "swarm",
          family: "malicious",
          band: "storm",
          sharePct: 100,
          denominations: Object.freeze(["bandwidth"] as const),
          targets: Object.freeze(["origin"] as const),
        }),
      ]),
    }),
  ]),
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

const PIPELINE_CONFIG: Omit<DefaultPipelineConfig, "runSeed"> = Object.freeze({
  dnsNodeId: null,
  expressPath: Object.freeze([NODE_EDGE, NODE_ORIGIN]),
  deepPath: Object.freeze([NODE_EDGE, NODE_ORIGIN]),
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

export interface SimCoreRunnerOptions {
  /** Deterministic run seed (whole number; the worker boot message carries it). */
  readonly seed: number;
  /** Emission cadence divisor at 1× — 100ms = 10Hz protocol cap (§7.0). */
  readonly tickRealMs?: number;
  /** TEST SEAM (F2 arrival honesty): re-family the placeholder wave so benign
   *  bounces can form real retry storms. Shipped content is 100% malicious —
   *  adversarial units are neutralized, never re-entered — so without this
   *  knob the driver's between-steps re-entry mint is unobservable in tests.
   *  Unset keeps the sim numbers byte-identical to the shipped placeholder;
   *  the wire itself gains one always-zero additive cell (`reentryRatePerMin`)
   *  from the F2 split, which every pre-F2 consumer reads as absent-0. */
  readonly familyOverride?: WaveEnvelope["dominantFamily"];
}

export class SimCoreRunner implements SimRunner {
  readonly runnerId = "sim-core" as const;
  readonly engineVersion = "hh-sim-core-adapter v0 (pipeline+observed)";

  private readonly runSeed: RunSeed;
  private readonly driver: TickDriver;
  private readonly store: ObservedStore;
  private readonly plan: WavePlan;
  private readonly envelope: WaveEnvelope;
  private game: GameState;
  private lanes: ReadonlyMap<EntityId, LaneStats>;
  private aggression: Fixed = fromRatio(5n, 10n);
  private readonly intentLog: PlayerIntent[] = [];
  /** Door schedule: intents stamped for the next headlessStep, fed EXACTLY once. */
  private pendingDoorIntents: ExternalIntent[] = [];
  private counters = { served: 0, bounced: 0, blockedFalsePositive: 0, landed: 0 };
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

    const clocks: ClockState = initialClocks();
    this.game = createInitialState({
      runSeed: this.runSeed,
      engineVersion: this.engineVersion,
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "adapter-sheets-v0", ruleBookHash: "" },
      clocks,
      nodes: [
        mkNode(NODE_EDGE, 2, MICROS_PER_MIN, "sample-1-in-20", NODE_ORIGIN),
        mkNode(NODE_ORIGIN, 1, MICROS_PER_MIN, "pass-through", null),
      ],
      lanes: [this.zeroLane()],
      contracts: [CONTRACT],
      // §7.5 action economy: two hands (T2 staff) — the door pays verbs here.
      handCapacity: 2,
    });
    this.lanes = this.game.lanes;

    const config: DefaultPipelineConfig = Object.freeze({ ...PIPELINE_CONFIG, runSeed: this.runSeed });
    const slots = createDefaultSlots(config);
    this.driver = createTickDriver(slots, streamFor(this.runSeed, "root", 0), this.game.context.clocks);
    this.store = new ObservedStore();

    // Director nudge FIRST (logged input law R-31), then plan wave 1.
    const proposed = directorPropose(INITIAL_DIRECTOR_STATE, 0n, streamFor(this.runSeed, "director", 0));
    const director: DirectorState = proposed.next;
    this.plan = planWave(parseWaveTable(WAVE_TABLE_RAW), 1, {
      startMinute: WAVE_START_MINUTE,
      tick: 0n,
      rng: waveStream(this.runSeed, 1, WAVE_START_MINUTE),
      director,
      ledger: ledgerSnapshot([], 0n),
      invitations: buildInvitations({}),
      entropyForecastPurchased: false,
      pressureParams: PRESSURE,
    });
    this.envelope =
      options.familyOverride === undefined
        ? this.plan.waveEnvelope
        : Object.freeze({ ...this.plan.waveEnvelope, dominantFamily: options.familyOverride });
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
   *  as `intent-executed` / `intent-refused` notices. The slider arm keeps
   *  its direct ROC-posture binding (pre-door control). The legacy `verb`
   *  carrier stays INPUT-LOG ONLY by law: the door refuses that carrier
   *  (`unsupported-verb-carrier`), so it must never reach the schedule. */
  submit(intent: PlayerIntent): void {
    this.intentLog.push(intent);
    const payload = intent.payload;
    if (payload.kind === "slider") {
      if (payload.control === "aggression") this.aggression = clampUnit(payload.value);
      return;
    }
    if (payload.kind === "player-verb") {
      this.pendingDoorIntents.push({ tick: this.game.context.tick + 1n, intent });
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

  headlessStep(_dtRealMs: number): SimProjection {
    const minute = this.game.context.minute + 1;
    const inWave = minute >= this.plan.startMinute && minute < this.plan.startMinute + WAVE_WINDOW_MINUTES;
    const envelopes: readonly WaveEnvelope[] = inWave ? Object.freeze([this.envelope]) : Object.freeze([]);
    const due = this.pendingDoorIntents.splice(0, this.pendingDoorIntents.length);

    const inputs: TickInputs = Object.freeze({
      envelopes,
      evidence: Object.freeze([]),
      classes: CLASSES,
      dependencyEdges: DEPENDENCY_EDGES,
      retryPolicy: RETRY,
      aggression: this.aggression,
      expressMaxConfidence: fromRatio(8n, 10n),
      lanes: this.lanes,
      ...(due.length > 0 ? { externalIntents: Object.freeze(due) } : {}),
    });

    const priorUnitIds = new Set<EntityId>(this.game.units.keys());
    const result = this.driver.advance(this.game, inputs);
    this.game = result.state;

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
      ]),
      tickUs,
    );
    const merged = new Map(this.game.observed);
    for (const [key, cell] of this.store.toObservedMap()) merged.set(key, cell);
    this.game = Object.freeze({ ...this.game, observed: Object.freeze(merged) });

    /* counters + notices from the REAL outcome stream. Surge reads the HONEST
       entry total (organic + re-entries): a retry storm flooding the lane IS a
       surge — that blindness was the F2 bug this fix retires. */
    const notices: EventNotice[] = [];
    if (entries.organic + entries.reentered >= 3) {
      notices.push({ kind: "arrival-surge", laneId: LANE_ID, atUs: tickUs });
    }
    /* door verdicts ride the same seam (contract #10 receipts): one notice
       per fed intent, detail "<verb>" executed / "<verb>: <reason>" refused. */
    for (const receipt of result.doorReceipts) {
      notices.push({
        kind: receipt.outcome === "executed" ? "intent-executed" : "intent-refused",
        laneId: null,
        atUs: tickUs,
        detail: receipt.reason === null ? receipt.verb : `${receipt.verb}: ${receipt.reason}`,
      });
    }
    for (const outcome of result.outcomes) {
      const terminal = outcome.terminal;
      if (terminal === "served") this.counters.served += 1;
      else if (terminal === "bounced") this.counters.bounced += 1;
      else if (terminal === "blocked-false-positive") this.counters.blockedFalsePositive += 1;
      else this.counters.landed += 1;
      const noticeKind = NOTICE_FOR_TERMINAL[terminal];
      if (noticeKind !== null) {
        notices.push({ kind: noticeKind, laneId: LANE_ID, atUs: outcome.atUs });
      }
    }
    for (const firing of result.ruleFirings) {
      void firing;
      notices.push({ kind: "rule-fired", laneId: null, atUs: tickUs });
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
