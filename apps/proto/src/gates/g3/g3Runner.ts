/**
 * gates/g3 · runner — the suspicion dial behind the protocol door.
 *
 * Composition law mirrors runner/simCoreRunner.ts (subpath exports only, every
 * mutable minted per instance, protocol SimProjection out), with the exact
 * gate mechanics certified headless in packages/sim-core gate-g3.test.ts:
 *
 *  · DIAL = TickInputs.expressMaxConfidence (fresh units at or under it take
 *    the express path; the wire-fold 0.688 vs the dial decides every yank).
 *  · WIRE SIGNALS — host evidence for units on the wire between the meter and
 *    the express terminal; Π(1−cᵢ) folds in canonical (unitId, metric) order
 *    (FIX-3), so the demotion decision is submission-permutation invisible.
 *  · DEFENSE UPGRADE — a real intent-door verb (configure-node on waf-1,
 *    pass-through ⇄ challenge): moves the benign ROC arm (false positives →
 *    suspicion spikes → sticky demotions) WITHOUT touching adversarial damage.
 *
 * Renderer law: per-unit confidence + lane cells ride ObservedCells (terminal
 * units' cells are pruned so the pip strip stays live), lane split numbers are
 * aggregates. No ground-truth reads, no unit entities in notices.
 */
import {
  asCauseId,
  asEntityId,
  asRunSeed,
  observedKey,
  type EntityId,
  type ExternalIntent,
  type Fixed,
  type GameState,
  type LaneStats,
  type ObservedCell,
  type ObservedKey,
  type Outcome,
  type PlayerIntent,
  type RunSeed,
  type SimTick,
} from "@hh/sim-core/types";
import {
  FIXED_UNIT,
  clampUnit,
  fromRatio,
  initialClocks,
  streamFor,
  sub,
} from "@hh/sim-core/kernel";
import {
  createDefaultSlots,
  createInitialState,
  createRouteStep,
  createTickDriver,
  type TickDriver,
  type TickInputs,
} from "@hh/sim-core/pipeline";
import { ObservedStore } from "@hh/sim-core/observed";
import type { CellValue, EventNotice, ProtoCell, SimProjection } from "../../shared/protocol.ts";
import {
  G3_CLASSES,
  G3_ENVELOPES,
  G3_ENGINE_VERSION,
  G3_IDS,
  G3_RETRY,
  SUSPICION_THRESHOLD,
  createGateOutcomeStep,
  createGateRouteStep,
  createSuspicionLedger,
  decayedSuspicion,
  g3Config,
  g3ExactCell,
  g3LaneStats,
  g3MkNode,
  g3TextCell,
  g3ToggleIntent,
  wireSignalEvidence,
  type G3Depth,
  type SuspicionLedger,
} from "./g3Scenario.ts";

/* ── protocol-boundary narrowing (fail-loud, same door as the adapter) ── */

function narrowCellValue(key: ObservedKey, value: unknown): CellValue | null {
  if (value === null) return null;
  const kind = typeof value;
  if (kind === "bigint" || kind === "number" || kind === "string") return value as CellValue;
  throw new Error(`G3Runner: observed cell "${key}" carries non-wire value type "${kind}"`);
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

const NOTICE_FOR_TERMINAL: Readonly<Record<Outcome["terminal"], EventNotice["kind"] | null>> =
  Object.freeze({
    served: null,
    bounced: "bounce",
    "blocked-false-positive": "false-positive",
    landed: "landed",
  });

export interface G3RunnerOptions {
  readonly seed: number;
  readonly tickRealMs?: number;
  /** Dial position at boot (0–100 → expressMaxConfidence). */
  readonly dialPercent?: number;
  /** Aggression (0–100) for the inspection ROC arms. */
  readonly aggressionPercent?: number;
  /** False-positive price of the challenge posture (% of benign blocked). */
  readonly falsePositivePercent?: number;
  /** waf-1 posture at boot (G3 authors it OFF — the upgrade is the story). */
  readonly wafDepth?: G3Depth;
}

export interface G3RunnerStats {
  readonly dialPercent: number;
  readonly wafDepth: G3Depth;
  readonly routedExpress: number;
  readonly routedDeep: number;
  readonly midPathDemotions: number;
  readonly stickyDemotions: number;
  readonly neutralized: number;
  readonly falsePositives: number;
  readonly threatsLanded: number;
  readonly benignServed: number;
  readonly doorExecuted: number;
  readonly doorRefused: number;
}

/** Terminal hop that marks a unit's lane THIS tick (renderer-facing word). */
function laneWordFor(hops: readonly EntityId[]): "express" | "deep" {
  return hops.includes(G3_IDS.deep) ? "deep" : "express";
}

export class G3Runner {
  readonly runnerId = "gate-g3" as const;
  readonly engineVersion = G3_ENGINE_VERSION;

  private readonly runSeed: RunSeed;
  private readonly baseTickMs: number;
  private readonly driver: TickDriver;
  private readonly store: ObservedStore;
  private readonly ledger: SuspicionLedger;
  private game: GameState;
  private lanes: ReadonlyMap<EntityId, LaneStats>;
  private dialPercent: number;
  private readonly aggression: Fixed;
  private wafDepth: G3Depth;
  private counters = { served: 0, bounced: 0, blockedFalsePositive: 0, landed: 0 };
  private triad = { neutralized: 0, falsePositives: 0, threatsLanded: 0, benignServed: 0, doorExecuted: 0, doorRefused: 0 };
  private readonly terminalIds = new Map<string, SimTick>();
  /** Glance window: a terminated unit's pips stay readable a few more ticks
   *  (renderer grace, NOT engine truth), then the strip trims. */
  private static readonly PIP_GRACE_TICKS = 4n;
  private pendingDoorIntents: ExternalIntent[] = [];
  private seq = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private emitSink: ((projection: SimProjection) => void) | null = null;
  private speedX: 1 | 2 | 4 = 1;

  constructor(options: G3RunnerOptions) {
    if (!Number.isInteger(options.seed) || options.seed < 0) {
      throw new Error(`G3Runner: seed must be a non-negative integer, got ${options.seed}`);
    }
    this.runSeed = asRunSeed(BigInt(options.seed));
    this.baseTickMs = options.tickRealMs ?? 100;
    this.dialPercent = clampPercent(options.dialPercent ?? 40);
    this.aggression = fromRatio(BigInt(clampPercent(options.aggressionPercent ?? 50)), 100n);
    this.wafDepth = options.wafDepth ?? "pass-through";
    this.ledger = createSuspicionLedger();

    const config = Object.freeze({
      ...g3Config(options.falsePositivePercent ?? 5),
      runSeed: this.runSeed,
    });
    const slots = Object.freeze({
      ...createDefaultSlots(config),
      route: createGateRouteStep(
        createRouteStep({ dnsNodeId: null, expressPath: config.expressPath, deepPath: config.deepPath }),
        this.ledger,
        G3_IDS.waf,
        config.deepPath,
      ),
      outcome: createGateOutcomeStep(this.ledger),
    });
    const clocks = initialClocks();
    this.driver = createTickDriver(slots, streamFor(this.runSeed, "root", 0), clocks);
    this.store = new ObservedStore();

    this.game = createInitialState({
      runSeed: this.runSeed,
      engineVersion: this.engineVersion,
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "gate-g3-sheets", ruleBookHash: "" },
      clocks,
      nodes: [
        g3MkNode(G3_IDS.meter, 1, 5_000_000n, "pass-through"),
        // 90M µs (> one 60M tick) so the WAF HOLDS a unit across a frame:
        // folds and verdicts stay visible instead of terminating unseen.
        g3MkNode(G3_IDS.waf, 16, 90_000_000n, this.wafDepth),
        // Deep inspection is SLOW by law — the lane is visually thicker.
        g3MkNode(G3_IDS.deep, 16, 90_000_000n, "inspect"),
      ],
      lanes: [g3LaneStats(G3_IDS.laneExpress, 0, FIXED_UNIT), g3LaneStats(G3_IDS.laneDeep, 0, FIXED_UNIT)],
      contracts: [],
      handCapacity: 2,
    });
    this.lanes = this.game.lanes;
  }

  /* ═══════════════════════════ controls ═══════════════════════════ */

  submit(intent: PlayerIntent): void {
    if (intent.payload.kind === "slider" && intent.payload.control === "dial") {
      this.dialPercent = clampPercent((Number(intent.payload.value) * 100) / 65536);
    }
  }

  /** Defense upgrade: queues configure-node waf-1 for the NEXT tick. */
  upgradeDefense(): void {
    const next: SimTick = this.game.context.tick + 1n;
    this.wafDepth = this.wafDepth === "pass-through" ? "challenge" : "pass-through";
    this.pendingDoorIntents.push(g3ToggleIntent(next, this.wafDepth));
  }

  start(emit: (projection: SimProjection) => void): void {
    if (this.timer !== null) return;
    this.emitSink = emit;
    emit(this.headlessStep(this.baseTickMs));
    this.timer = setInterval(() => emit(this.headlessStep(this.baseTickMs)), this.baseTickMs / this.speedX);
  }

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

  stats(): G3RunnerStats {
    const routedDeepFresh = this.ledger.routedByNode.get(String(G3_IDS.deep)) ?? 0;
    return Object.freeze({
      dialPercent: this.dialPercent,
      wafDepth: this.wafDepth,
      routedExpress: this.ledger.routedByNode.get(String(G3_IDS.waf)) ?? 0,
      routedDeep: routedDeepFresh,
      midPathDemotions: this.ledger.midPathDemotions,
      stickyDemotions: this.ledger.demotions,
      neutralized: this.triad.neutralized,
      falsePositives: this.triad.falsePositives,
      threatsLanded: this.triad.threatsLanded,
      benignServed: this.triad.benignServed,
      doorExecuted: this.triad.doorExecuted,
      doorRefused: this.triad.doorRefused,
    });
  }

  /* ═══════════════════════════ the tick ═══════════════════════════ */

  headlessStep(_dtRealMs: number): SimProjection {
    const due = this.pendingDoorIntents.splice(0, this.pendingDoorIntents.length);
    const dial = fromRatio(BigInt(this.dialPercent), 100n);

    const inputs: TickInputs = Object.freeze({
      envelopes: G3_ENVELOPES,
      evidence: wireSignalEvidence(this.game, true),
      classes: G3_CLASSES,
      dependencyEdges: Object.freeze([]),
      retryPolicy: G3_RETRY,
      aggression: this.aggression,
      expressMaxConfidence: dial,
      lanes: this.lanes,
      ...(due.length > 0 ? { externalIntents: Object.freeze(due) } : {}),
    });

    const result = this.driver.advance(this.game, inputs);
    this.game = result.state;

    for (const outcome of result.outcomes) {
      this.terminalIds.set(String(outcome.unitId), this.game.context.tick);
      const cause = String(outcome.causeId);
      if (outcome.terminal === "blocked-false-positive") {
        this.triad.falsePositives += 1;
      } else if (outcome.terminal === "bounced" && cause.startsWith("defense:")) {
        this.triad.neutralized += 1;
      } else if (outcome.terminal === "landed") {
        this.triad.threatsLanded += 1;
      } else if (outcome.terminal === "served") {
        this.triad.benignServed += 1;
      }
    }
    for (const receipt of result.doorReceipts) {
      if (receipt.outcome === "executed") this.triad.doorExecuted += 1;
      else this.triad.doorRefused += 1;
    }

    /* lane aggregates from the live roster (stats-not-entities). */
    let liveExpress = 0;
    let liveDeep = 0;
    for (const unit of this.game.units.values()) {
      if (laneWordFor(unit.routeHops) === "deep") liveDeep += 1;
      else liveExpress += 1;
    }
    const demotions = this.ledger.midPathDemotions + this.ledger.demotions;
    const expressPressure = liveExpress + liveDeep;
    const expressHealth = expressPressure === 0
      ? FIXED_UNIT
      : clampUnit(sub(FIXED_UNIT, fromRatio(BigInt(demotions), BigInt(expressPressure + demotions))));
    const laneStats: readonly LaneStats[] = Object.freeze([
      g3LaneStats(G3_IDS.laneExpress, liveExpress, expressHealth),
      g3LaneStats(G3_IDS.laneDeep, liveDeep, FIXED_UNIT),
    ]);
    this.lanes = Object.freeze(
      new Map<EntityId, LaneStats>(laneStats.map((s) => [s.laneId, s] as const)),
    );
    this.game = Object.freeze({ ...this.game, lanes: this.lanes });

    /* observed layer: per-live-unit confidence + lane cells, suspicion stems,
       lane split counters, triad. Terminal units' cells are PRUNED (pip strip
       = live truth), sus: stems survive the horizon on purpose. */
    const tick = this.game.context.tick;
    const writes: { key: ObservedKey; cell: ObservedCell<unknown>; causeId: ReturnType<typeof asCauseId> }[] = [];
    for (const unit of this.game.units.values()) {
      writes.push(
        Object.freeze({
          key: observedKey(unit.id, "confidence"),
          cell: g3ExactCell(unit.confidence),
          causeId: asCauseId(`g3:conf:${tick}:${unit.id}`),
        }),
        Object.freeze({
          key: observedKey(unit.id, "lane"),
          cell: g3TextCell(laneWordFor(unit.routeHops)),
          causeId: asCauseId(`g3:lane:${tick}:${unit.id}`),
        }),
        Object.freeze({
          key: observedKey(unit.id, "suspicion"),
          cell: g3ExactCell(decayedSuspicion(this.ledger, unit.source.identity, tick)),
          causeId: asCauseId(`g3:susp:${tick}:${unit.id}`),
        }),
      );
    }
    for (const [stem, spike] of this.ledger.spikes) {
      writes.push(
        Object.freeze({
          key: observedKey(asEntityId(`sus:${stem}`), "suspicion"),
          cell: g3ExactCell(decayedSuspicion(this.ledger, stem, tick)),
          causeId: asCauseId(`g3:sus:${tick}:${stem}`),
        }),
        Object.freeze({
          key: observedKey(asEntityId(`sus:${stem}`), "spikeDepth"),
          cell: g3ExactCell(spike.value),
          causeId: asCauseId(`g3:susdepth:${tick}:${stem}`),
        }),
      );
    }
    writes.push(
      Object.freeze({ key: observedKey(G3_IDS.laneExpress, "routedFresh"), cell: g3ExactCell(this.ledger.routedByNode.get(String(G3_IDS.waf)) ?? 0), causeId: asCauseId(`g3:split:${tick}:exp`) }),
      Object.freeze({ key: observedKey(G3_IDS.laneDeep, "routedFresh"), cell: g3ExactCell(this.ledger.routedByNode.get(String(G3_IDS.deep)) ?? 0), causeId: asCauseId(`g3:split:${tick}:deep`) }),
      Object.freeze({ key: observedKey(G3_IDS.laneDeep, "demoted"), cell: g3ExactCell(demotions), causeId: asCauseId(`g3:split:${tick}:demoted`) }),
      Object.freeze({ key: observedKey(G3_IDS.waf, "defenseBlocks"), cell: g3ExactCell(this.triad.neutralized), causeId: asCauseId(`g3:triad:${tick}:blocks`) }),
      Object.freeze({ key: observedKey(G3_IDS.waf, "falsePositives"), cell: g3ExactCell(this.triad.falsePositives), causeId: asCauseId(`g3:triad:${tick}:fps`) }),
      Object.freeze({ key: observedKey(G3_IDS.waf, "dialPercent"), cell: g3ExactCell(this.dialPercent), causeId: asCauseId(`g3:control:${tick}:dial`) }),
    );
    this.store.applyObservedWrites(Object.freeze(writes), this.game.context.clocks.simUs);

    const merged = new Map<ObservedKey, ProtoCell>();
    // Pip-strip cells keep LIVE units plus a glance-grace for the recently
    // terminated; sus: stems persist — the decay story needs its history.
    const now = this.game.context.tick;
    for (const [id, at] of this.terminalIds) {
      if (now - at > G3Runner.PIP_GRACE_TICKS) this.terminalIds.delete(id);
    }
    const keep = (key: ObservedKey): boolean => {
      const k = String(key);
      const cut = k.indexOf("::");
      const entity = cut === -1 ? k : k.slice(0, cut);
      const property = cut === -1 ? "" : k.slice(cut + 2);
      if (entity.startsWith("g3-") && (property === "confidence" || property === "lane" || property === "suspicion")) {
        const terminatedAt = this.terminalIds.get(entity);
        return terminatedAt === undefined || now - terminatedAt <= G3Runner.PIP_GRACE_TICKS;
      }
      return true;
    };
    for (const [key, cell] of this.game.observed) if (keep(key)) merged.set(key, toProtoCell(key, cell));
    for (const [key, cell] of this.store.toObservedMap()) if (keep(key)) merged.set(key, toProtoCell(key, cell));
    this.game = Object.freeze({ ...this.game, observed: Object.freeze(new Map(merged)) });

    /* protocol notices + counters */
    const notices: EventNotice[] = [];
    if (liveExpress + liveDeep >= 8) {
      notices.push({ kind: "arrival-surge", laneId: G3_IDS.laneExpress, atUs: this.game.context.clocks.simUs });
    }
    for (const outcome of result.outcomes) {
      const terminal = outcome.terminal;
      if (terminal === "served") this.counters.served += 1;
      else if (terminal === "bounced") this.counters.bounced += 1;
      else if (terminal === "blocked-false-positive") this.counters.blockedFalsePositive += 1;
      else this.counters.landed += 1;
      const noticeKind = NOTICE_FOR_TERMINAL[terminal];
      if (noticeKind !== null) {
        notices.push({
          kind: noticeKind,
          laneId: this.terminalLaneAt(outcome.unitId) === "deep" ? G3_IDS.laneDeep : G3_IDS.laneExpress,
          atUs: outcome.atUs,
        });
      }
    }

    this.seq += 1;
    return Object.freeze({
      seq: this.seq,
      tick: this.game.context.tick,
      minute: this.game.context.minute,
      clocks: this.game.context.clocks,
      lanes: Object.freeze([...this.lanes.values()]),
      observed: Object.freeze(merged),
      notices: Object.freeze(notices),
      counters: Object.freeze({ ...this.counters }),
      freeCashMicroUsd: this.game.cash.free,
    });
  }

  /** Lane attribution at termination: demoted ids are ledger truth. */
  private terminalLaneAt(unitId: EntityId): "express" | "deep" {
    return this.ledger.demotedUnitIds.has(String(unitId)) ? "deep" : "express";
  }
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return Math.round(value);
}

export function createG3Runner(options: G3RunnerOptions): G3Runner {
  return new G3Runner(options);
}

/** Re-export so the panel can threshold pips without deep-imports. */
export const G3_PIP_THRESHOLD = SUSPICION_THRESHOLD;
