/**
 * gates/g6 — the ONE engine class behind both types.
 *
 * `G6Runner` composes the real pipeline exactly like the headless gate does:
 * identical board, identical law, identical class. The type identity exists
 * ONLY as the `G6Profile` data handed to the constructor (patience budget,
 * wave slice, curve, tempo flag, meter name). The type toggle hot-swaps the
 * profile — never the code path.
 *
 * Tempo comes straight through the clock chain: a bundle with
 * `permanentIncidentClock` advances the driver's tick with a 4 M µs real
 * stamp under the 15/60 incident ops scale — the 0.25× drama rate — while
 * sim minutes (hence physics) stay one-per-tick, byte-for-byte.
 */
import {
  asCauseId,
  asEntityId,
  asMoney,
  asRunSeed,
  observedKey,
  ResolutionBand,
  type Contract,
  type EntityId,
  type Fixed,
  type GameState,
  type LaneStats,
  type NodeRecord,
  type ObservedCell,
  type ObservedKey,
  type QosClassDef,
  type RetryPolicy,
  type RunSeed,
  type SimTimeUs,
  type WaveEnvelope,
} from "@hh/sim-core/types";
import {
  FIXED_UNIT,
  FIXED_ZERO,
  MICROS_PER_MIN,
  MICROS_PER_SEC,
  clampUnit,
  fromInt,
  fromRatio,
  initialClocks,
  streamFor,
  sub,
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
  buildInvitations,
  INITIAL_DIRECTOR_STATE,
  ledgerSnapshot,
  planWave,
  sampleCurveMicro,
  waveStream,
  type ThreatInvitations,
  type WavePlan,
} from "@hh/sim-core/waves";
import type { CellValue, EventNotice, ProtoCell, SimProjection } from "../../shared/protocol.ts";
import type { G6Profile } from "./g6Data.ts";

/* ═══════════════════════ the shared board (law, not type) ═════════════════ */

export const G6_LANE_ID = asEntityId("lane/g6-ingress");
export const G6_NODE_EDGE = asEntityId("node/g6-edge");
export const G6_NODE_ORIGIN = asEntityId("node/g6-origin");
export const EDGE_SLOTS = 8;
export const HOP_SERVICE_US: SimTimeUs = 20_000n;
export const WAVE_WINDOW_MINUTES = 12;
export const TOTAL_TICKS = 90;

function mkNode(id: EntityId, dependency: EntityId | null): NodeRecord {
  return Object.freeze({
    id,
    kind: "generic",
    slots: makeSlots(EDGE_SLOTS),
    serviceTimeUs: HOP_SERVICE_US,
    queueDepth: 0,
    queue: Object.freeze([]),
    shedOrder: "qos-weighted" as const,
    inspectionDepth: "pass-through" as const,
    discipline: "hockey-stick" as const,
    utilizationRho: 0n,
    dependencyNodeId: dependency,
  });
}

const CLASSES: readonly QosClassDef[] = Object.freeze([
  Object.freeze({
    id: "standard",
    label: "Standard",
    weight: FIXED_UNIT,
    shedPriority: 0,
    budgetUs: 30n * MICROS_PER_MIN,
    inspectionDepth: "pass-through" as const,
  }),
]);

const RETRY: RetryPolicy = Object.freeze({
  maxRetries: 2,
  backoffBaseUs: 2n * MICROS_PER_MIN,
  jitterPurchased: false,
});

function g6Contract(): Contract {
  return Object.freeze({
    id: asEntityId("ctr-g6-gold"),
    customerEntityId: asEntityId("cust-g6"),
    bundleId: "g6-audit-board",
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
    shedImmunityClassId: null,
    allocations: Object.freeze([]),
  });
}

function zeroLane(): LaneStats {
  return Object.freeze({
    laneId: G6_LANE_ID,
    ratePerMin: FIXED_ZERO,
    latencyDistributionRef: "gate-g6/hist/express",
    classMix: Object.freeze({}),
    health: FIXED_UNIT,
  });
}

/* ═══════════════════════ observed-layer bridges (fail loud) ═══════════════ */

function narrowCellValue(key: ObservedKey, value: unknown): CellValue | null {
  if (value === null) return null;
  const kind = typeof value;
  if (kind === "bigint" || kind === "number" || kind === "string") return value as CellValue;
  throw new Error(`G6Runner: observed cell "${key}" carries non-wire value type "${kind}"`);
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

function meterCell(value: bigint): ObservedCell<unknown> {
  return Object.freeze({
    value,
    fidelity: ResolutionBand.Fine,
    freshnessUs: 0n,
    coverage: FIXED_UNIT,
    certainty: FIXED_UNIT,
    status: "live" as const,
  });
}

const NOTICE_FOR_TERMINAL = Object.freeze({
  served: null,
  bounced: "bounce",
  "blocked-false-positive": "false-positive",
  landed: "landed",
} as const) satisfies Record<string, EventNotice["kind"] | null>;

/* ═══════════════════════════ the runner ══════════════════════════════════
 * Purity law (simCoreRunner precedent): every mutable per-run object is
 * minted in the constructor — two fresh runners on one profile+seed replay
 * byte-identically (pinned in __tests__). */

export interface G6RunnerOptions {
  readonly profile: G6Profile;
  /** Deterministic run seed; dual mode gives BOTH runners the same one. */
  readonly seed?: number | undefined;
}

export class G6Runner {
  readonly typeId: string;
  readonly seed: number;
  readonly profile: G6Profile;

  private readonly runSeed: RunSeed;
  private readonly driver: TickDriver;
  private readonly store: ObservedStore;
  private readonly plans: readonly { plan: WavePlan; windowEndMinute: number }[];
  private game: GameState;
  private lanes: ReadonlyMap<EntityId, LaneStats>;
  private seq = 0;
  private tickCount = 0;
  private counters = { served: 0, bounced: 0, blockedFalsePositive: 0, landed: 0 };

  constructor(options: G6RunnerOptions) {
    const seed = options.seed ?? 42;
    if (!Number.isInteger(seed) || seed < 0) {
      throw new Error(`G6Runner: seed must be a non-negative integer, got ${seed}`);
    }
    const profile = options.profile;
    this.profile = profile;
    this.typeId = profile.typeId;
    this.seed = seed;
    this.runSeed = asRunSeed(BigInt(seed));

    const config: DefaultPipelineConfig = Object.freeze({
      runSeed: this.runSeed,
      dnsNodeId: null,
      expressPath: Object.freeze([G6_NODE_EDGE, G6_NODE_ORIGIN]),
      deepPath: Object.freeze([G6_NODE_EDGE, G6_NODE_ORIGIN]),
      defaultPatienceUs: profile.patienceUs,
      defaultSizeCost: fromInt(1),
      patienceJitterPct: 0,
      inspectionCostUs: Object.freeze({
        "pass-through": 0n,
        "sample-1-in-20": 3n * 1_000_000n,
        inspect: 10n * 1_000_000n,
        challenge: 20n * 1_000_000n,
      }),
      detectionRatio: FIXED_UNIT,
      falsePositiveRatio: FIXED_ZERO,
      referralProbability: FIXED_ZERO,
      returnProbability: FIXED_ZERO,
    });

    const slots = createDefaultSlots(config);
    // Tempo from the bundle flag — the ONLY clock difference in the app.
    this.driver = createTickDriver(slots, streamFor(this.runSeed, "root", 0), initialClocks(), {
      tickAdvance: Object.freeze({
        realElapsedUs: profile.incident ? 4n * MICROS_PER_SEC : MICROS_PER_SEC,
        speed: 1 as const,
        incident: profile.incident,
      }),
    });
    this.store = new ObservedStore();
    this.plans = Object.freeze(
      profile.table.waves.map((wave, i) => {
        const windowStart = 2 + i * WAVE_WINDOW_MINUTES;
        const plan = planWave(profile.table, wave.n, {
          startMinute: windowStart,
          tick: 0n,
          rng: waveStream(this.runSeed, wave.n, windowStart),
          director: INITIAL_DIRECTOR_STATE,
          ledger: ledgerSnapshot([], 0n),
          invitations: invitationsOf(profile),
          entropyForecastPurchased: false,
        });
        return Object.freeze({ plan, windowEndMinute: windowStart + WAVE_WINDOW_MINUTES });
      }),
    );

    this.game = createInitialState({
      runSeed: this.runSeed,
      engineVersion: "gate-g6",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "gate-g6/sheets", ruleBookHash: "gate-g6/book" },
      clocks: initialClocks(),
      nodes: [mkNode(G6_NODE_EDGE, G6_NODE_ORIGIN), mkNode(G6_NODE_ORIGIN, null)],
      lanes: [zeroLane()],
      contracts: [g6Contract()],
    });
    this.lanes = this.game.lanes;
  }

  get tick(): number {
    return this.tickCount;
  }

  done(): boolean {
    return this.tickCount >= TOTAL_TICKS;
  }

  /** Advance exactly one sim-minute and emit the observed-layer projection. */
  step(): SimProjection {
    if (this.tickCount >= TOTAL_TICKS) {
      throw new Error(`G6Runner: the G6 day is over (${TOTAL_TICKS} sim-minutes) — reset or stop`);
    }
    this.tickCount += 1;
    const profile = this.profile;
    const minute = this.game.context.minute + 1;
    const simUsNow = BigInt(minute) * MICROS_PER_MIN;

    const envelopes: WaveEnvelope[] = [
      Object.freeze({
        tableId: `${profile.table.id}/organic`,
        role: "baseline" as const,
        shape: "plateau" as const,
        ratePerMin: fromRatio(sampleCurveMicro(profile.curve, simUsNow), 1_000_000n),
        telegraphed: false,
        dominantFamily: "organic" as const,
      }),
    ];
    for (const { plan, windowEndMinute } of this.plans) {
      if (minute >= plan.startMinute && minute < windowEndMinute) envelopes.push(plan.waveEnvelope);
    }

    const inputs: TickInputs = Object.freeze({
      envelopes: Object.freeze(envelopes),
      evidence: Object.freeze([]),
      classes: CLASSES,
      dependencyEdges: Object.freeze([]),
      retryPolicy: RETRY,
      aggression: FIXED_ZERO,
      expressMaxConfidence: FIXED_UNIT,
      lanes: this.lanes,
    });

    const result = this.driver.advance(this.game, inputs);

    let arrivalsThisTick = 0;
    const notices: EventNotice[] = [];
    for (const event of result.events) {
      if (event.kind === "arrival") arrivalsThisTick += 1;
    }
    for (const outcome of result.outcomes) {
      const terminal = outcome.terminal;
      if (terminal === "served") this.counters.served += 1;
      else if (terminal === "bounced") this.counters.bounced += 1;
      else if (terminal === "blocked-false-positive") this.counters.blockedFalsePositive += 1;
      else this.counters.landed += 1;
      const noticeKind = NOTICE_FOR_TERMINAL[terminal];
      if (noticeKind !== null) {
        notices.push(Object.freeze({ kind: noticeKind, laneId: G6_LANE_ID, atUs: outcome.atUs }));
      }
    }
    if (arrivalsThisTick >= 10) {
      notices.unshift(Object.freeze({ kind: "arrival-surge", laneId: G6_LANE_ID, atUs: this.game.context.clocks.simUs }));
    }

    let worstRho: Fixed = FIXED_ZERO;
    for (const node of result.state.nodes.values()) {
      if (node.utilizationRho > worstRho) worstRho = node.utilizationRho;
    }
    const health = clampUnit(sub(FIXED_UNIT, worstRho));
    this.game = Object.freeze({
      ...result.state,
      lanes: Object.freeze(
        new Map<EntityId, LaneStats>([
          [
            G6_LANE_ID,
            Object.freeze({
              laneId: G6_LANE_ID,
              ratePerMin: fromInt(arrivalsThisTick),
              latencyDistributionRef: "gate-g6/hist/express",
              classMix: Object.freeze({}),
              health,
            }),
          ],
        ]),
      ),
    });
    this.lanes = this.game.lanes;

    /* step-12 seal: the meter cells the gauge binds to are derived from the
     * ground-truth node stamp — single-writer store, same law as every gate. */
    const edge = this.game.nodes.get(G6_NODE_EDGE);
    if (edge === undefined) throw new Error(`G6Runner: edge node vanished at tick ${this.tickCount}`);
    this.store.applyObservedWrites(
      Object.freeze([
        Object.freeze({
          key: observedKey(G6_NODE_EDGE, "utilizationRho"),
          cell: meterCell(edge.utilizationRho),
          causeId: asCauseId(`g6:rho:${this.tickCount}`),
        }),
        Object.freeze({
          key: observedKey(G6_NODE_EDGE, "queueDepth"),
          cell: meterCell(BigInt(edge.queueDepth)),
          causeId: asCauseId(`g6:queue:${this.tickCount}`),
        }),
      ]),
      this.game.context.clocks.simUs,
    );
    const merged = new Map(this.game.observed);
    for (const [key, cell] of this.store.toObservedMap()) merged.set(key, cell);
    this.game = Object.freeze({ ...this.game, observed: Object.freeze(merged) });

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
}

/** The construction door: keeps runner creation a one-liner for the panel
 *  and the tests identical to the class call itself. */
export function createG6Runner(profile: G6Profile, seed?: number): G6Runner {
  return new G6Runner({ profile, seed });
}

function invitationsOf(profile: G6Profile): ThreatInvitations {
  // The loader already parsed the invitation record; rebuild through the
  // public wave helper so the waves module owns the closure semantics.
  return buildInvitations(profile.bundle.threats.unlockedByBuildables);
}
