/**
 * gates/g1 · runner — the gate-local engine door.
 *
 * Same composition law as runner/simCoreRunner.ts (subpath exports only, every
 * mutable minted per instance, protocol SimProjection out), with the two G1
 * controls the headless slice certifies:
 *
 *  · AGGRESSION SLIDER — the one legal pre-door control (a `slider` PlayerIntent
 *    feeding TickInputs.aggression; R-52: it moves probabilities, never damage).
 *  · DEFENSE TOGGLE — a real intent-door verb: configure-node on waf-1
 *    pass-through ⇄ challenge, stamped for the NEXT tick and fed through
 *    TickInputs.externalIntents exactly once. Receipts land in the triad.
 *
 * The renderer never sees units: lane LaneStats aggregates + cumulative triad
 * ObservedCells + protocol counters are the whole surface (stats-not-entities).
 */
import {
  asCauseId,
  asRunSeed,
  observedKey,
  type EntityId,
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
  FIXED_ZERO,
  fromRatio,
  initialClocks,
  streamFor,
} from "@hh/sim-core/kernel";
import {
  createDefaultSlots,
  createInitialState,
  createTickDriver,
  type TickDriver,
  type TickInputs,
} from "@hh/sim-core/pipeline";
import { ObservedStore } from "@hh/sim-core/observed";
import type { CellValue, EventNotice, ProtoCell, SimProjection } from "../../shared/protocol.ts";
import {
  G1_CLASSES,
  G1_CONTRACT,
  G1_ENGINE_VERSION,
  G1_ENVELOPES,
  G1_IDS,
  G1_PIPELINE_CONFIG,
  G1_RETRY,
  G1_ZERO_TRIAD,
  g1AttributeOutcome,
  g1ExactCell,
  g1Lane,
  g1MkNode,
  g1ToggleIntent,
  type G1Triad,
} from "./g1Scenario.ts";

/* ── protocol-boundary narrowing (mirrors the adapter's fail-loud door) ── */

function narrowCellValue(key: ObservedKey, value: unknown): CellValue | null {
  if (value === null) return null;
  const kind = typeof value;
  if (kind === "bigint" || kind === "number" || kind === "string") return value as CellValue;
  throw new Error(`G1Runner: observed cell "${key}" carries non-wire value type "${kind}"`);
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

export interface G1RunnerOptions {
  readonly seed: number;
  /** Emission cadence divisor at 1× — protocol cap is 10 Hz (§7.0). */
  readonly tickRealMs?: number;
  /** Slider position at boot (0–100). */
  readonly aggressionPercent?: number;
  /** Defense posture at boot. */
  readonly startDepth?: "pass-through" | "challenge";
}

export interface G1RunnerStats {
  readonly triad: G1Triad;
  readonly aggressionPercent: number;
  readonly depth: "pass-through" | "challenge";
}

export class G1Runner {
  readonly runnerId = "gate-g1" as const;
  readonly engineVersion = G1_ENGINE_VERSION;

  private readonly runSeed: RunSeed;
  private readonly baseTickMs: number;
  private readonly driver: TickDriver;
  private readonly store: ObservedStore;
  private game: GameState;
  private lanes: ReadonlyMap<EntityId, LaneStats>;
  private triad: G1Triad = G1_ZERO_TRIAD;
  private counters = { served: 0, bounced: 0, blockedFalsePositive: 0, landed: 0 };
  private aggressionPercent: number;
  private depth: "pass-through" | "challenge";
  /** Door queue: intents stamped for the next headlessStep, fed EXACTLY once. */
  private pendingDoorIntents: ReturnType<typeof g1ToggleIntent>[] = [];
  private doorSeq = 0;
  private seq = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private emitSink: ((projection: SimProjection) => void) | null = null;
  private speedX: 1 | 2 | 4 = 1;

  constructor(options: G1RunnerOptions) {
    if (!Number.isInteger(options.seed) || options.seed < 0) {
      throw new Error(`G1Runner: seed must be a non-negative integer, got ${options.seed}`);
    }
    this.aggressionPercent = clampPercent(options.aggressionPercent ?? 0);
    this.depth = options.startDepth ?? "challenge";
    this.runSeed = asRunSeed(BigInt(options.seed));
    this.baseTickMs = options.tickRealMs ?? 100;

    this.game = createInitialState({
      runSeed: this.runSeed,
      engineVersion: this.engineVersion,
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "gate-g1-sheets", ruleBookHash: "" },
      clocks: initialClocks(),
      nodes: [g1MkNode(this.depth)],
      lanes: [g1Lane(0, G1_ZERO_TRIAD)],
      contracts: [G1_CONTRACT],
      handCapacity: 2,
    });
    this.lanes = this.game.lanes;

    const slots = createDefaultSlots(Object.freeze({ ...G1_PIPELINE_CONFIG, runSeed: this.runSeed }));
    this.driver = createTickDriver(slots, streamFor(this.runSeed, "root", 0), this.game.context.clocks);
    this.store = new ObservedStore();
  }

  /* ═══════════════════════════ controls ═══════════════════════════ */

  /** Slider PlayerIntents move the ROC posture; verb intents queue at the door. */
  submit(intent: PlayerIntent): void {
    if (intent.payload.kind === "slider" && intent.payload.control === "aggression") {
      this.aggressionPercent = clampPercent(fixedToPercent(intent.payload.value));
      return;
    }
    // PlayerIntents the runner doesn't interpret ride the intent log only.
  }

  /** Defense toggle: queues the configure-node door verb for the NEXT tick. */
  toggleDefense(): void {
    const next: SimTick = this.game.context.tick + 1n;
    this.depth = this.depth === "challenge" ? "pass-through" : "challenge";
    this.doorSeq += 1;
    this.pendingDoorIntents.push(g1ToggleIntent(next, this.depth));
  }

  start(emit: (projection: SimProjection) => void): void {
    if (this.timer !== null) return; // idempotent boot
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

  stats(): G1RunnerStats {
    return Object.freeze({
      triad: this.triad,
      aggressionPercent: this.aggressionPercent,
      depth: this.depth,
    });
  }

  /* ═══════════════════════════ the tick ═══════════════════════════ */

  /** Speed gates OBSERVATION cadence, never physics: dtRealMs is ignored;
   *  one call = one macro-tick (1 sim-minute through the clock chain). */
  headlessStep(_dtRealMs: number): SimProjection {
    const due = this.pendingDoorIntents.splice(0, this.pendingDoorIntents.length);

    const inputs: TickInputs = Object.freeze({
      envelopes: G1_ENVELOPES,
      evidence: Object.freeze([]),
      classes: G1_CLASSES,
      dependencyEdges: Object.freeze([]),
      retryPolicy: G1_RETRY,
      aggression: fromRatio(BigInt(this.aggressionPercent), 100n),
      expressMaxConfidence: FIXED_UNIT, // single lane — the dial is inert in G1
      lanes: this.lanes,
      ...(due.length > 0 ? { externalIntents: Object.freeze(due) } : {}),
    });

    const result = this.driver.advance(this.game, inputs);

    for (const outcome of result.outcomes) this.triad = g1AttributeOutcome(this.triad, outcome);
    for (const receipt of result.doorReceipts) {
      this.triad = Object.freeze({
        ...this.triad,
        doorExecuted: this.triad.doorExecuted + (receipt.outcome === "executed" ? 1 : 0),
        doorRefused: this.triad.doorRefused + (receipt.outcome === "executed" ? 0 : 1),
      });
    }

    let arrivalsThisTick = 0;
    for (const event of result.events) if (event.kind === "arrival") arrivalsThisTick += 1;

    this.game = Object.freeze({
      ...result.state,
      lanes: Object.freeze(new Map([[G1_IDS.lane, g1Lane(arrivalsThisTick, this.triad)]])),
    });
    this.lanes = this.game.lanes;

    // Observed layer: cumulative TRIAD cells from real driver output (§step-12).
    const tick = this.game.context.tick;
    this.store.applyObservedWrites(
      Object.freeze([
        Object.freeze({ key: observedKey(G1_IDS.waf, "defenseBlocks"), cell: g1ExactCell(this.triad.neutralized), causeId: asCauseId(`g1:triad:${tick}:blocks`) }),
        Object.freeze({ key: observedKey(G1_IDS.waf, "falsePositives"), cell: g1ExactCell(this.triad.falsePositives), causeId: asCauseId(`g1:triad:${tick}:fps`) }),
        Object.freeze({ key: observedKey(G1_IDS.waf, "threatsLanded"), cell: g1ExactCell(this.triad.threatsLanded), causeId: asCauseId(`g1:triad:${tick}:landed`) }),
        Object.freeze({ key: observedKey(G1_IDS.waf, "benignServed"), cell: g1ExactCell(this.triad.benignServed), causeId: asCauseId(`g1:triad:${tick}:served`) }),
        Object.freeze({ key: observedKey(G1_IDS.waf, "fpWasteUs"), cell: g1ExactCell(this.triad.fpWasteUs), causeId: asCauseId(`g1:triad:${tick}:waste`) }),
        Object.freeze({ key: observedKey(G1_IDS.waf, "patienceBounces"), cell: g1ExactCell(this.triad.patienceBounces), causeId: asCauseId(`g1:triad:${tick}:patience`) }),
        Object.freeze({ key: observedKey(G1_IDS.waf, "aggressionPercent"), cell: g1ExactCell(this.aggressionPercent), causeId: asCauseId(`g1:control:${tick}`) }),
        Object.freeze({ key: observedKey(G1_IDS.waf, "doorExecuted"), cell: g1ExactCell(this.triad.doorExecuted), causeId: asCauseId(`g1:door:${tick}:executed`) }),
        Object.freeze({ key: observedKey(G1_IDS.waf, "doorRefused"), cell: g1ExactCell(this.triad.doorRefused), causeId: asCauseId(`g1:door:${tick}:refused`) }),
      ]),
      this.game.context.clocks.simUs,
    );
    const merged = new Map(this.game.observed);
    for (const [key, cell] of this.store.toObservedMap()) merged.set(key, cell);
    this.game = Object.freeze({ ...this.game, observed: Object.freeze(merged) });

    // Protocol counters + notices.
    const notices: EventNotice[] = [];
    if (arrivalsThisTick >= 3) {
      notices.push({ kind: "arrival-surge", laneId: G1_IDS.lane, atUs: this.game.context.clocks.simUs });
    }
    for (const outcome of result.outcomes) {
      const terminal = outcome.terminal;
      if (terminal === "served") this.counters.served += 1;
      else if (terminal === "bounced") this.counters.bounced += 1;
      else if (terminal === "blocked-false-positive") this.counters.blockedFalsePositive += 1;
      else this.counters.landed += 1;
      const noticeKind = NOTICE_FOR_TERMINAL[terminal];
      if (noticeKind !== null) notices.push({ kind: noticeKind, laneId: G1_IDS.lane, atUs: outcome.atUs });
    }

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

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return Math.round(value);
}

function fixedToPercent(value: Fixed): number {
  // Fixed 0..65536 → 0..100 (the slider's display domain).
  if (value <= FIXED_ZERO) return 0;
  return (Number(value) * 100) / 65536;
}

/** Factory form for the panel/tests (class kept internal on purpose). */
export function createG1Runner(options: G1RunnerOptions): G1Runner {
  return new G1Runner(options);
}
