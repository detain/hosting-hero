/**
 * The headless tick engine — threads GameState through the 13 pipeline steps.
 *
 * This is the composition root the CLI (`run`, `replay-verify`) and the
 * parity harness share. It owns everything the pure steps must not:
 *  - the scripted clock advance (deterministic function of the tick index —
 *    NEVER wall-clock; RISK-1 law);
 *  - per-step RNG stream construction via kernel `streamFor` (domain-per-step,
 *    minute-keyed, §4.1 R-16);
 *  - Map threading with insertion-order discipline;
 *  - checkpoints (canonical state digest every `snapshotEveryTicks`);
 *  - the rolling per-tick chain digest (cheap divergence detector between
 *    engines, independent of full-state hashing).
 *
 * Step call order follows TICK_STEP_ORDER (types.ts) exactly; each call
 * consumes the previous outputs per the contract's In/Out pairings.
 */

import {
  asEntityId,
  asRunSeed,
  clocks,
  fx,
  streams,
  type Checkpoint,
  type ClockState,
  type EntityId,
  type Fixed,
  type GameState,
  type OutcomeCandidate,
  type PipelineSlots,
  type ReplayContentHashes,
  type RetryPolicy,
  type RunSeed,
  type SimEvent,
  type TickContext,
  type TypeBundle,
  type Unit,
  type UnitDraft,
} from "./sim-core.ts";
import { canonicalize, digestOfCanonical, fnv1a64Hex } from "./canonical.ts";
import { startingCash, startingLanes, startingNodes, stubConfigFromBundle, type StubSlotsConfig } from "./stub-slots.ts";
import { createSlots } from "./slots.ts";
import type { ParsedBundle } from "./bundle.ts";

export const HEADLESS_ENGINE_VERSION = "0.0.0-headless.1";
export const SLOTS_COMPOSITION = "stub-v1";

/** Speed 1|2|4 — defined in kernel/time.ts, re-exported under `clocks`. */
type SpeedFactor = clocks.SpeedFactor;

/* ─────────────────────────── scripted clocks ─────────────────────────── */

export interface ClockScript {
  /** Real µs fed per tick (1_000_000n = 1 real second per sim-minute at 1×). */
  readonly realUsPerTick: bigint;
  /** Deterministic speed pattern evaluated at each tick index. */
  readonly speedAt: (tick: bigint) => SpeedFactor;
  readonly incidentAt: (tick: bigint) => boolean;
}

export const FLAT_CLOCK: ClockScript = {
  realUsPerTick: 1_000_000n,
  speedAt: () => 1,
  incidentAt: () => false,
};

/** The parity fixture's clock workout: cycling speeds + periodic incidents. */
export const PARITY_CLOCK: ClockScript = {
  realUsPerTick: 1_000_000n,
  speedAt: (tick) => {
    const table: readonly SpeedFactor[] = [1, 2, 4];
    return table[Number(tick % 3n)] ?? 1;
  },
  incidentAt: (tick) => tick > 0n && tick % 97n === 0n,
};

function advance(clock: ClockState, tick: bigint, script: ClockScript): ClockState {
  return clocks.advanceClocks(clock, {
    realElapsedUs: script.realUsPerTick,
    speed: script.speedAt(tick),
    incident: script.incidentAt(tick),
  });
}

/* ─────────────────────────── stub-world inputs ─────────────────────────── */

/** Tuning-sheet stand-ins: classes/depths/knee live OUTSIDE GameState in v0
 *  (content-hash-pinned via contentHashes.sheetsHash in a real run). */
export const STUB_CONFIG: StubSlotsConfig = stubConfigFromBundle({});

const STUB_EXPRESS_MAX: Fixed = fx.fromRatio(5n, 10n);

const STUB_RETRY_POLICY: RetryPolicy = {
  maxRetries: 3,
  backoffBaseUs: 5_000_000n,
  jitterPurchased: true,
};

const STUB_STORM_FACTOR: Fixed = fx.FIXED_ONE;

/* ─────────────────────────── run parameters ─────────────────────────── */

export interface RunParams {
  readonly seed: RunSeed;
  readonly ticks: number;
  readonly snapshotEveryTicks: number;
  readonly contentHashes: ReplayContentHashes;
  readonly slots: PipelineSlots;
  readonly clockScript: ClockScript;
  readonly bundleId: string;
  readonly config?: StubSlotsConfig;
}

export interface RunStats {
  readonly arrived: number;
  readonly served: number;
  readonly bounced: number;
  readonly blocked: number;
  readonly events: number;
}

export interface RunOutput {
  readonly finalState: GameState;
  readonly checkpoints: readonly Checkpoint[];
  /** Rolling per-tick chain hash (32 hex) — divergence tripwire. */
  readonly chainDigest: string;
  readonly stats: RunStats;
}

export function initialState(seed: RunSeed, contentHashes: ReplayContentHashes, bundleId: string): GameState {
  const context: TickContext = { tick: 0n, minute: 0, clocks: clocks.initialClocks() };
  return {
    runSeed: seed,
    engineVersion: HEADLESS_ENGINE_VERSION,
    contentHashes,
    context,
    units: new Map(),
    nodes: startingNodes(),
    lanes: startingLanes(),
    observed: new Map(),
    cash: startingCash(),
    ledgerSeq: 1,
    contracts: new Map(),
    ruleBook: [],
    ruleBookHash: fnv1a64Hex(`rulebook:empty:${bundleId}`),
  };
}

/* ─────────────────────────── the tick loop ─────────────────────────── */

export function runEngine(params: RunParams): RunOutput {
  if (!Number.isSafeInteger(params.ticks) || params.ticks < 0) {
    throw new Error(`runEngine: ticks must be a non-negative safe integer, got ${String(params.ticks)}`);
  }
  if (!Number.isSafeInteger(params.snapshotEveryTicks) || params.snapshotEveryTicks < 1) {
    throw new Error(`runEngine: snapshotEveryTicks must be ≥ 1, got ${String(params.snapshotEveryTicks)}`);
  }

  const slots = params.slots;
  const config = params.config ?? STUB_CONFIG;
  let state = initialState(params.seed, params.contentHashes, params.bundleId);
  const checkpoints: Checkpoint[] = [];
  let chain = "0".repeat(32);
  const stats = { arrived: 0, served: 0, bounced: 0, blocked: 0, events: 0 };

  for (let t = 0; t < params.ticks; t += 1) {
    const context = state.context;
    const rngFor = (domain: string) => streams.streamFor(params.seed, domain, context.minute);

    /* Occupancy BEFORE serve → completions derived after (stub-slots). */
    const occupiedBefore = new Set<EntityId>();
    for (const node of state.nodes.values()) {
      for (const slot of node.slots) {
        if (slot.occupied && slot.unitId !== null) occupiedBefore.add(slot.unitId);
      }
    }

    const arrivalOut = slots.arrival({ context, envelopes: [], rng: rngFor("arrival") });

    const unitsMap = new Map<EntityId, Unit>(state.units);
    for (const unit of arrivalOut.units) unitsMap.set(unit.id, unit);
    stats.arrived += arrivalOut.units.length;

    const inFlight = [...unitsMap.values()];

    const scoringOut = slots.scoring({ context, units: inFlight, evidence: [] });
    const qosOut = slots.qosClassify({ context, units: scoringOut.units, classes: config.classes });
    const routeOut = slots.route({
      context,
      units: qosOut.units,
      nodes: state.nodes,
      routingLocks: [],
      expressMaxConfidence: STUB_EXPRESS_MAX,
      rng: rngFor("route"),
    });
    const serveOut = slots.serve({ context, units: routeOut.units, nodes: state.nodes });
    const queueOut = slots.queueWait({ context, waiting: serveOut.waiting, nodes: serveOut.nodes, kneeRho: config.kneeRho });
    const inspectOut = slots.inspect({
      context,
      units: routeOut.units,
      depths: config.depths,
      aggression: config.aggression,
      rng: rngFor("inspect"),
    });
    const dependencyOut = slots.dependencyBlock({ context, assignments: serveOut.assignments, edges: [] });
    void dependencyOut; // stub emits no blocks; the call keeps the step live
    const patienceOut = slots.patienceCheck({ context, units: routeOut.units, waits: queueOut.waits });

    const occupiedAfter = new Set<EntityId>();
    for (const node of serveOut.nodes.values()) {
      for (const slot of node.slots) {
        if (slot.occupied && slot.unitId !== null) occupiedAfter.add(slot.unitId);
      }
    }
    const completed = [...occupiedBefore].filter((id) => !occupiedAfter.has(id) && !serveOut.shed.includes(id));

    const candidates: OutcomeCandidate[] = [];
    for (const unit of routeOut.units) {
      const head = unit.routeHops[0] ?? null;
      const tail = unit.routeHops[unit.routeHops.length - 1] ?? null;
      candidates.push({ unitId: unit.id, nodeId: head, targetId: tail, terminal: null });
    }
    const outcomeOut = slots.outcome({
      context,
      candidates,
      inspections: inspectOut.verdicts,
      bounced: patienceOut.bounced,
      completed,
      valueByUnit: new Map<EntityId, Fixed>(),
      rng: rngFor("outcome"),
    });
    const backpressureOut = slots.backpressure({
      context,
      outcomes: outcomeOut.outcomes,
      policy: STUB_RETRY_POLICY,
      stormFactor: STUB_STORM_FACTOR,
      rng: rngFor("backpressure"),
    });
    const economicsOut = slots.stateEconomics({
      context,
      prior: state,
      outcomes: outcomeOut.outcomes,
      reentries: backpressureOut.reentries,
      nodes: serveOut.nodes,
      lanes: state.lanes,
    });

    const observedNext = new Map(state.observed);
    for (const write of economicsOut.observedWrites) observedNext.set(write.key, write.cell);

    /* Engine-owned ground-truth threading: this tick's service + inspection
     * costs accumulate onto each unit (steps stay pure; ids keep position —
     * Map.set on an existing key preserves insertion order). */
    for (const verdict of inspectOut.verdicts) {
      const unit = unitsMap.get(verdict.unitId);
      if (unit === undefined) continue;
      unitsMap.set(unit.id, {
        ...unit,
        inspectionCostUs: clocks.addUs(unit.inspectionCostUs, verdict.costUs),
        accumulatedLatencyUs: clocks.addUs(unit.accumulatedLatencyUs, verdict.costUs),
      });
    }
    for (const assignment of serveOut.assignments) {
      const unit = unitsMap.get(assignment.unitId);
      if (unit === undefined) continue;
      unitsMap.set(unit.id, {
        ...unit,
        accumulatedLatencyUs: clocks.addUs(unit.accumulatedLatencyUs, assignment.serviceEndUs - assignment.serviceStartUs),
      });
    }

    const ruleOut = slots.rulePhase({
      context,
      observed: observedNext,
      book: state.ruleBook,
      suppressed: [],
      rng: rngFor("rules"),
    });

    /* Merge: resolved units leave the in-flight map (stub marks terminals by
     * removal; real modules own richer retention). Re-entries arrive next. */
    const resolved = new Set<EntityId>();
    for (const outcome of outcomeOut.outcomes) resolved.add(outcome.unitId);
    for (const id of patienceOut.bounced) resolved.add(id);
    const nextUnits = new Map<EntityId, Unit>();
    for (const [id, unit] of unitsMap) {
      if (!resolved.has(id)) nextUnits.set(id, unit);
    }
    for (const [i, draft] of backpressureOut.reentries.entries()) {
      const id = asEntityId(`r${context.tick.toString()}-${i.toString()}`);
      nextUnits.set(id, materializeDraft(draft, context, id));
    }

    const lanesNext = new Map(state.lanes);
    for (const lane of economicsOut.laneStats) lanesNext.set(lane.laneId, lane);

    const nextClocks = advance(context.clocks, context.tick, params.clockScript);
    const tickEvents: readonly SimEvent[] = [
      ...arrivalOut.events,
      ...outcomeOut.events,
      ...backpressureOut.events,
      ...economicsOut.events,
    ];
    stats.events += tickEvents.length;
    for (const outcome of outcomeOut.outcomes) {
      if (outcome.terminal === "served") stats.served += 1;
      if (outcome.terminal === "bounced") stats.bounced += 1;
      if (outcome.terminal === "blocked-false-positive") stats.blocked += 1;
    }

    state = {
      ...state,
      context: { tick: context.tick + 1n, minute: clocks.simMinuteOf(nextClocks), clocks: nextClocks },
      units: nextUnits,
      nodes: serveOut.nodes,
      lanes: lanesNext,
      observed: observedNext,
      cash: economicsOut.cash,
      ledgerSeq: economicsOut.ledgerEntry === null ? state.ledgerSeq : state.ledgerSeq + 1,
    };
    void ruleOut.firings.length; // rule intents enter the input log; stub is empty

    /* Rolling chain digest — cheap per-tick divergence signal. Inputs are
     * all integers/bigints whose toString() is spec-stable, so the fold runs
     * on raw concatenation (≈2 µs); full canonical-JSON digests stay on the
     * checkpoint path where the whole state must be certified. */
    const tickInner =
      fnv1a64Hex(
        `${arrivalOut.units.length}|${serveOut.assignments.length}|${serveOut.waiting.length}|` +
          `${patienceOut.bounced.length}|${outcomeOut.outcomes.length}|${backpressureOut.reentries.length}|` +
          `${ruleOut.firings.length}|${economicsOut.cash.free}|${nextUnits.size}|${observedNext.size}`,
      ) + fnv1a64Hex(`${chain}|e`);
    chain = fnv1a64Hex(`${chain}|${tickInner}`) + fnv1a64Hex(`${tickInner}|${chain}`);

    const elapsed = t + 1;
    if (elapsed % params.snapshotEveryTicks === 0) {
      checkpoints.push({ tick: state.context.tick, stateHash: digestOfCanonical(canonicalize(state, "$")) });
    }
  }

  return { finalState: state, checkpoints, chainDigest: chain, stats: { ...stats } };
}

function materializeDraft(draft: UnitDraft, context: TickContext, id: EntityId): Unit {
  return {
    id,
    type: draft.type,
    sizeCost: draft.sizeCost,
    patienceUs: draft.patienceUs,
    trueIntent: draft.trueIntent,
    source: draft.source,
    retryOf: draft.retryOf,
    arrivedAtTick: context.tick,
    accumulatedLatencyUs: 0n,
    inspectionCostUs: 0n,
    confidence: fx.FIXED_ZERO,
    qosClassId: null,
    routeHops: [],
    waitingOn: null,
  };
}

/* ─────────────────────────── public convenience ─────────────────────────── */

/** Canonical content hash of a bundle: hash the JSON TEXT, never the value
 *  tree — authored bundles legitimately carry floats (sigmoid anchors) that
 *  must never pass through the state canonicalizer (which rejects floats). */
export function bundleContentHash(bundle: TypeBundle): string {
  return digestOfCanonical(canonicalize(JSON.stringify(bundle), "$.bundle-json"));
}

/** Full run from a parsed bundle + seed (used by CLI, bench, parity). */
export function runFromBundle(
  parsed: ParsedBundle,
  seedValue: bigint,
  ticks: number,
  snapshotEveryTicks: number,
  clockScript: ClockScript = FLAT_CLOCK,
): RunOutput {
  const seed = asRunSeed(seedValue);
  const { slots } = createSlots({
    bundleId: parsed.bundle.id,
    ...(parsed.patienceUs === null ? {} : { patienceUs: parsed.patienceUs }),
    unitTerm: parsed.unitTerm,
    baselineRatePerMin: parsed.baselineRatePerMin,
  });
  const contentHashes: ReplayContentHashes = {
    rulesetCardHashes: { [parsed.bundle.id]: fnv1a64Hex(`bundle:${parsed.bundle.id}`) },
    sheetsHash: bundleContentHash(parsed.bundle),
    ruleBookHash: "0".repeat(32),
  };
  return runEngine({
    seed,
    ticks,
    snapshotEveryTicks,
    contentHashes,
    slots,
    clockScript,
    bundleId: parsed.bundle.id,
  });
}

/** Bundle object used when no file is supplied (parity fixture embeds this
 *  literal so BOTH arms hash identical content with zero file I/O). */
export const HARNESS_BUNDLE: TypeBundle = {
  schemaVersion: "3.0",
  id: "headless:parity-fixture",
  meta: { name: "Parity Fixture Estate", tone: "straight", official: false },
  visitor: {
    unitTerm: "request",
    stats: { weight: 40, patience: 8 },
    patienceModel: { mode: "sigmoid-budget", params: { budgetMs: 800 } },
  },
  threats: { waveTable: "fixture:wave-1" },
};
