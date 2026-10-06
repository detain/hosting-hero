/**
 * Stub PipelineSlots composition — the deterministic placeholder world the
 * headless harness runs until the real modules are wired in.
 *
 * SWAP POINT #2 of 2 (see README): `slots.ts` is the ONLY file importing this
 * (and, later, `pipeline/defaults.ts#createDefaultSlots`). When the real
 * modules land, change one import + one call there — nothing else moves.
 *
 * Stub semantics are deliberately SIMPLE but deliberately exercise the whole
 * determinism surface: every fixed-point op, every keyed rng domain, integer
 * µs math, Map-insertion-order threading, cause-stamped events. Step outputs
 * are returned, never mutated (Law 3). Each stub step is pure given inputs.
 *
 * Known stub omissions (the real modules own these): no dependency blocking,
 * no shed, no retry re-entries (BackpressureIn carries no unit bodies to
 * draft from), empty rule interpreter (a legal implementation per types.ts).
 */

import {
  asCauseId,
  asEntityId,
  asMoney,
  clocks,
  emptyMoneyBuckets,
  fx,
  observedKey,
  ResolutionBand,
  type CauseId,
  type EntityId,
  type Fixed,
  type InspectionDepth,
  type LaneStats,
  type LedgerEntry,
  type MoneyBuckets,
  type NodeRecord,
  type NodeSlotRecord,
  type ObservedWrite,
  type Outcome,
  type PipelineSlots,
  type QosClassDef,
  type QueueWait,
  type RevenueQualityBand,
  type RngStream,
  type SimEvent,
  type SimTick,
  type SimTimeUs,
  type SlotAssignment,
  type Unit,
  type UnitDraft,
  type UnitIntent,
  type WaveEnvelope,
} from "./sim-core.ts";

/* ─────────────────────────── shared helpers ─────────────────────────── */

/** Integer µs × Fixed factor, round-half-away — mirrors fixed.ts's rounding
 *  stance so µs-scaled math stays bit-reproducible. */
export function scaleUsByFixed(valueUs: SimTimeUs, factor: Fixed): SimTimeUs {
  const product = valueUs * factor;
  return (product + fx.FIXED_SCALE / 2n) / fx.FIXED_SCALE;
}

const INTENTS: readonly UnitIntent[] = [
  "customer",
  "prospect",
  "automaton",
  "abuser",
  "malicious",
  "human-error",
  "entropic",
  "systemic",
];

const HOSTILE: ReadonlySet<UnitIntent> = new Set<UnitIntent>(["malicious", "abuser"]);

function pickIntent(rng: RngStream): UnitIntent {
  return INTENTS[rng.range(INTENTS.length)] ?? "customer";
}

/** rate-per-min (Fixed) → units this tick (1 tick = 1 sim-minute); the
 *  fractional remainder is drawn from the minute-keyed stream. */
function sampleArrivals(ratePerMin: Fixed, rng: RngStream): number {
  const whole = ratePerMin >> 16n;
  const frac = ratePerMin & 0xffffn;
  const extra = rng.range(65_536) < Number(frac) ? 1 : 0;
  return Number(whole) + extra;
}

function occupancyRho(slots: readonly NodeSlotRecord[], queueDepth: number): Fixed {
  const occupied = slots.reduce((acc: number, slot) => (slot.occupied ? acc + 1 : acc), 0);
  const demand = BigInt(occupied * 1_000 + queueDepth * 100);
  const capacity = BigInt(slots.length * 1_000);
  return fx.fromRatio(demand, capacity);
}

/* ─────────────────────────── configuration ─────────────────────────── */

export interface StubSlotsConfig {
  readonly patienceUsBase: SimTimeUs;
  readonly unitTerm: string;
  readonly baselineRatePerMin: Fixed;
  readonly classes: readonly QosClassDef[];
  readonly depths: ReadonlyMap<EntityId, InspectionDepth>;
  readonly kneeRho: Fixed;
  readonly aggression: Fixed;
  readonly upkeepMicroUsd: bigint;
  readonly revenuePerServedMicroUsd: bigint;
}

/** Canonical stub config; `run` replaces patience/unitTerm/rate with the
 *  bundle-parsed values (floats→Fixed at the boundary, Law 2). */
export function defaultStubConfig(): StubSlotsConfig {
  const edgeId = asEntityId("edge-1");
  const originId = asEntityId("origin-1");
  return {
    patienceUsBase: 800_000n,
    unitTerm: "visitor",
    baselineRatePerMin: fx.fromRatio(6n, 1n),
    classes: [
      { id: "gold", label: "Sold priority", weight: fx.fromRatio(10n, 1n), shedPriority: 3, budgetUs: 500_000n, inspectionDepth: "inspect" },
      { id: "bronze", label: "Best effort", weight: fx.FIXED_ONE, shedPriority: 2, budgetUs: 2_000_000n, inspectionDepth: "sample-1-in-20" },
      { id: "bulk", label: "Background", weight: fx.fromRatio(1n, 2n), shedPriority: 1, budgetUs: 30_000_000n, inspectionDepth: "pass-through" },
    ],
    depths: new Map<EntityId, InspectionDepth>([
      [edgeId, "inspect"],
      [originId, "sample-1-in-20"],
    ]),
    kneeRho: fx.fromRatio(7n, 10n),
    aggression: fx.fromRatio(3n, 10n),
    upkeepMicroUsd: -50_000n,
    revenuePerServedMicroUsd: 250_000n,
  };
}

/** Overlay bundle-parsed visitor parameters onto the default config. */
export function stubConfigFromBundle(
  overrides: { readonly patienceUs?: SimTimeUs; readonly unitTerm?: string; readonly baselineRatePerMin?: Fixed },
): StubSlotsConfig {
  const base = defaultStubConfig();
  return {
    ...base,
    ...(overrides.patienceUs === undefined ? {} : { patienceUsBase: overrides.patienceUs }),
    ...(overrides.unitTerm === undefined ? {} : { unitTerm: overrides.unitTerm }),
    ...(overrides.baselineRatePerMin === undefined ? {} : { baselineRatePerMin: overrides.baselineRatePerMin }),
  };
}

/* ─────────────────────────── the 13 stub steps ─────────────────────────── */

export function createStubSlots(cfg: StubSlotsConfig): PipelineSlots {
  return {
    /* Step 1 — Arrival: draw per-envelope counts, mint Units, emit events. */
    arrival({ context, envelopes, rng }) {
      const effective: readonly WaveEnvelope[] =
        envelopes.length > 0
          ? envelopes
          : [
              {
                tableId: "stub:baseline",
                role: "baseline",
                shape: "plateau",
                ratePerMin: cfg.baselineRatePerMin,
                telegraphed: false,
                dominantFamily: "organic",
              },
            ];
      const units: Unit[] = [];
      const events: SimEvent[] = [];
      for (const [envIndex, envelope] of effective.entries()) {
        const count = sampleArrivals(envelope.ratePerMin, rng);
        for (let i = 0; i < count; i += 1) {
          const id = asEntityId(`u${context.tick.toString()}-${envIndex.toString()}-${i.toString()}`);
          const jitterUs = BigInt(rng.range(256)) * 1_000n;
          units.push({
            id,
            type: envelope.dominantFamily === "organic" ? cfg.unitTerm : `threat:${envelope.dominantFamily}`,
            sizeCost: fx.FIXED_ONE,
            patienceUs: clocks.addUs(cfg.patienceUsBase, jitterUs),
            trueIntent: pickIntent(rng),
            source: {
              identity: `src-${rng.range(64).toString(16)}`,
              reputation: fx.fromRatio(BigInt(rng.range(1_000)), 1_000n),
            },
            retryOf: null,
            arrivedAtTick: context.tick,
            accumulatedLatencyUs: 0n,
            inspectionCostUs: 0n,
            confidence: fx.FIXED_ZERO,
            qosClassId: null,
            routeHops: [],
            waitingOn: null,
          });
          events.push({
            kind: "arrival",
            atUs: context.clocks.simUs,
            tick: context.tick,
            causeId: asCauseId(`arrival:${envelope.tableId}`),
            unitId: id,
            envelopeTableId: envelope.tableId,
          });
        }
      }
      return { units, events };
    },

    /* Step 2 — Scoring: compose C = 1 − Π(1 − cᵢ) in Fixed. */
    scoring({ units, evidence }) {
      if (evidence.length === 0) return { units };
      const contributions = new Map<EntityId, Fixed[]>();
      for (const item of evidence) {
        const list = contributions.get(item.unitId) ?? [];
        list.push(item.value);
        contributions.set(item.unitId, list);
      }
      const scored = units.map((unit) => {
        const values = contributions.get(unit.id);
        if (values === undefined || values.length === 0) return unit;
        let product = fx.FIXED_ONE;
        for (const c of values) product = fx.mul(product, fx.sub(fx.FIXED_ONE, c));
        return { ...unit, confidence: fx.clampUnit(fx.sub(fx.FIXED_ONE, product)) };
      });
      return { units: scored };
    },

    /* Step 3 — QoS classify: intent → class (stub mapping). */
    qosClassify({ units, classes }) {
      const classIdAt = (index: number): string | null => classes[index]?.id ?? null;
      const classified = units.map((unit) => {
        const qosClassId =
          unit.trueIntent === "customer" || unit.trueIntent === "prospect"
            ? classIdAt(0)
            : HOSTILE.has(unit.trueIntent)
              ? classIdAt(2)
              : classIdAt(1);
        return { ...unit, qosClassId };
      });
      return { units: classified };
    },

    /* Step 4 — Route: fixed full-path hop list (world insertion order). */
    route({ units, nodes }) {
      const hops: EntityId[] = [...nodes.keys()];
      return { units: units.map((unit) => (unit.routeHops.length > 0 ? unit : { ...unit, routeHops: hops })) };
    },

    /* Step 5 — Serve: mature finished slots, admit waiting units into free
     * slots. Nodes are returned as fresh records (Law 3). Completion is
     * derived by the engine from the occupancy-set delta across this step. */
    serve({ context, units, nodes }) {
      const simUs = context.clocks.simUs;
      const occupiedIds = new Set<EntityId>();
      const queuedIds = new Set<EntityId>();
      for (const node of nodes.values()) {
        for (const slot of node.slots) {
          if (slot.occupied && slot.unitId !== null) occupiedIds.add(slot.unitId);
        }
        for (const id of node.queue) queuedIds.add(id);
      }

      // Admission: freshly routed, not already resident → tail of head-node queue.
      const withQueues = new Map<EntityId, NodeRecord>();
      for (const unit of units) {
        if (unit.routeHops.length === 0) continue;
        if (occupiedIds.has(unit.id) || queuedIds.has(unit.id)) continue;
        const headId = unit.routeHops[0];
        if (headId === undefined) continue;
        const base = withQueues.get(headId) ?? nodes.get(headId);
        if (base === undefined) continue;
        withQueues.set(headId, { ...base, queue: [...base.queue, unit.id], queueDepth: base.queue.length + 1 });
      }

      const assignments: SlotAssignment[] = [];
      const waiting: EntityId[] = [];
      const result = new Map<EntityId, NodeRecord>();
      for (const [nodeId, original] of nodes) {
        const admitted = withQueues.get(nodeId) ?? original;
        // Maturity pass.
        const slots = admitted.slots.map((slot) => {
          if (!slot.occupied) return slot;
          if (slot.releasedAtUs !== null && slot.releasedAtUs <= simUs) {
            return { occupied: false, unitId: null, waitingOn: null, releasedAtUs: null };
          }
          return slot;
        });
        const freeSlots: number[] = [];
        for (const [i, slot] of slots.entries()) if (!slot.occupied) freeSlots.push(i);

        const queue = [...admitted.queue];
        const workingSlots = [...slots];
        while (freeSlots.length > 0 && queue.length > 0) {
          const slotIndex = freeSlots.shift();
          const unitId = queue.shift();
          if (slotIndex === undefined || unitId === undefined) break;
          const serviceEndUs = clocks.addUs(simUs, admitted.serviceTimeUs);
          workingSlots[slotIndex] = { occupied: true, unitId, waitingOn: null, releasedAtUs: serviceEndUs };
          assignments.push({
            unitId,
            nodeId,
            slotIndex,
            serviceStartUs: simUs,
            serviceEndUs,
            blocked: false,
          });
        }
        result.set(nodeId, {
          ...admitted,
          slots: workingSlots,
          queue,
          queueDepth: queue.length,
          utilizationRho: occupancyRho(workingSlots, queue.length),
        });
        for (const id of queue) waiting.push(id);
      }
      return { assignments, waiting, shed: [], nodes: result };
    },

    /* Step 6 — Queue wait: hockey-stick above the knee, closed form in Fixed
     * (ρ capped at 0.99 so the curve never divides by zero — fail-loud-safe). */
    queueWait({ waiting, nodes, kneeRho }) {
      const cap = fx.fromRatio(99n, 100n);
      const waits: QueueWait[] = [];
      for (const unitId of waiting) {
        for (const node of nodes.values()) {
          if (!node.queue.includes(unitId)) continue;
          if (fx.compare(node.utilizationRho, kneeRho) <= 0) {
            waits.push({ unitId, queueWaitUs: 0n });
            break;
          }
          const rho = fx.compare(node.utilizationRho, cap) > 0 ? cap : node.utilizationRho;
          const multiplier = fx.div(rho, fx.sub(fx.FIXED_ONE, rho));
          waits.push({ unitId, queueWaitUs: scaleUsByFixed(node.serviceTimeUs, multiplier) });
          break;
        }
      }
      return { waits };
    },

    /* Step 7 — Inspect: cost + suspicion at inspecting hops; the aggression
     * slider moves the ROC curve, never a damage number. */
    inspect({ units, depths, aggression, rng }) {
      const verdicts: import("./sim-core.ts").InspectionVerdict[] = [];
      const aggressionPct = Number((fx.clampUnit(aggression) * 100n) >> 16n);
      for (const unit of units) {
        const hopId = unit.routeHops[0];
        if (hopId === undefined) continue;
        const depth = depths.get(hopId);
        if (depth === undefined || depth === "pass-through") continue;
        if (depth === "sample-1-in-20" && rng.range(20) !== 0) continue;
        const costUs = 50_000n + BigInt(rng.range(50)) * 1_000n;
        const suspicionAfter = fx.clampUnit(fx.add(fx.fromRatio(BigInt(rng.range(400)), 1_000n), unit.confidence));
        const blocked = HOSTILE.has(unit.trueIntent) && rng.range(100) < aggressionPct;
        verdicts.push({ unitId: unit.id, nodeId: hopId, costUs, blocked, suspicionAfter });
      }
      return { verdicts };
    },

    /* Step 8 — Dependency block: stub estate has no blocking edges. */
    dependencyBlock() {
      return { blocks: [] };
    },

    /* Step 9 — Patience: R-10 in the stub's exact reading — the unit's
     * accumulated latency + this tick's predicted wait over its ms budget
     * (the patience analog) → silent bounce. Elapsed sim-minutes do NOT
     * count: at 1 tick = 1 sim-minute every unit would trivially expire. */
    patienceCheck({ units, waits }) {
      const waitByUnit = new Map<EntityId, SimTimeUs>();
      for (const w of waits) waitByUnit.set(w.unitId, w.queueWaitUs);
      const bounced: EntityId[] = [];
      for (const unit of units) {
        const predicted = waitByUnit.get(unit.id) ?? 0n;
        const projected = clocks.addUs(unit.accumulatedLatencyUs, predicted);
        if (projected > unit.patienceUs) bounced.push(unit.id);
      }
      return { bounced };
    },

    /* Step 10 — Outcome: resolve terminals from completed/bounced/blocked. */
    outcome({ context, candidates, inspections, bounced, completed }) {
      const bouncedSet = new Set(bounced);
      const completedSet = new Set(completed);
      const blockedSet = new Set(inspections.filter((v) => v.blocked).map((v) => v.unitId));
      const outcomes: Outcome[] = [];
      const events: SimEvent[] = [];
      for (const candidate of candidates) {
        const { unitId } = candidate;
        const atUs = context.clocks.simUs;
        const tick = context.tick;
        if (completedSet.has(unitId)) {
          const causeId = asCauseId(`outcome:served:${tick.toString()}`);
          outcomes.push({ unitId, terminal: "served", atUs, causeId });
          events.push({ kind: "served", atUs, tick, causeId, unitId, nodeId: candidate.nodeId ?? unitId });
          continue;
        }
        if (bouncedSet.has(unitId)) {
          const causeId = asCauseId(`outcome:bounced:${tick.toString()}`);
          outcomes.push({ unitId, terminal: "bounced", atUs, causeId });
          events.push({ kind: "bounced", atUs, tick, causeId, unitId, nodeId: candidate.nodeId });
          continue;
        }
        if (blockedSet.has(unitId)) {
          const causeId = asCauseId(`outcome:blocked:${tick.toString()}`);
          outcomes.push({ unitId, terminal: "blocked-false-positive", atUs, causeId });
          events.push({ kind: "blocked-false-positive", atUs, tick, causeId, unitId, nodeId: candidate.nodeId ?? unitId });
        }
      }
      return { outcomes, events };
    },

    /* Step 11 — Backpressure: stub measures pressure only (no re-entries;
     * the step's input carries no unit bodies to draft retries from). */
    backpressure({ outcomes, rng }) {
      const bounces = outcomes.filter((o) => o.terminal === "bounced").length;
      const blocked = outcomes.filter((o) => o.terminal === "blocked-false-positive").length;
      const probe = rng.nextU32(); // consume from the minute-keyed stream (exercises determinism)
      const pressure = fx.clampUnit(fx.fromRatio(BigInt(bounces + blocked + probe % 2), 20n));
      const reentries: readonly UnitDraft[] = [];
      return { reentries, pressure, events: [] as readonly SimEvent[] };
    },

    /* Step 12 — State & economics: the ledger tick + the ONLY observed writes. */
    stateEconomics({ context, prior, outcomes, nodes, lanes }) {
      const served = outcomes.filter((o) => o.terminal === "served").length;
      const revenue = BigInt(served) * cfg.revenuePerServedMicroUsd;
      const upkeep = cfg.upkeepMicroUsd - BigInt(nodes.size) * 10_000n;
      const netFree = revenue + upkeep;
      const cash: MoneyBuckets =
        netFree === 0n ? prior.cash : { ...prior.cash, free: asMoney(prior.cash.free + asMoney(netFree)) };
      const ledgerEntry: LedgerEntry | null =
        netFree === 0n
          ? null
          : {
              seq: prior.ledgerSeq,
              causeId: asCauseId(`economics:tick:${context.tick.toString()}`),
              atBusinessMin: context.minute,
              moneyColour: (netFree >= 0n ? "green" : "amber") as RevenueQualityBand,
              delta: { free: asMoney(netFree) },
            };
      const observedWrites: ObservedWrite[] = [];
      const cause = asCauseId(`step12:tick:${context.tick.toString()}`);
      for (const node of nodes.values()) {
        observedWrites.push({
          key: observedKey(node.id, "utilization"),
          cell: {
            value: node.utilizationRho,
            fidelity: ResolutionBand.Exact,
            freshnessUs: 0n,
            coverage: fx.FIXED_ONE,
            certainty: fx.FIXED_ONE,
            status: "live",
          },
          causeId: cause,
        });
      }
      observedWrites.push({
        key: observedKey(asEntityId("estate"), "cash.free"),
        cell: {
          value: cash.free,
          fidelity: ResolutionBand.Exact,
          freshnessUs: 0n,
          coverage: fx.FIXED_ONE,
          certainty: fx.FIXED_ONE,
          status: "live",
        },
        causeId: cause,
      });
      const laneStats: LaneStats[] = [...lanes.values()];
      return { cash, ledgerEntry, observedWrites, laneStats, events: [] as readonly SimEvent[] };
    },

    /* Step 12.5 — Rule phase: empty interpreter (legal per the contract). */
    rulePhase() {
      return { firings: [], intents: [] };
    },
  };
}

/* ─────────────────────────── world seeders ─────────────────────────── */

/** Exposed for engine init: the demo estate's starting cash. */
export function startingCash(): MoneyBuckets {
  const buckets = emptyMoneyBuckets();
  return { ...buckets, free: asMoney(10_000_000_000n) }; // $10,000.00 in µ$
}

/** Exposed for engine init: the two-node demo estate (insertion-stable). */
export function startingNodes(): ReadonlyMap<EntityId, NodeRecord> {
  const edgeId = asEntityId("edge-1");
  const originId = asEntityId("origin-1");
  const openSlots = (count: number): NodeSlotRecord[] =>
    Array.from({ length: count }, () => ({ occupied: false, unitId: null, waitingOn: null, releasedAtUs: null }));
  return new Map<EntityId, NodeRecord>([
    [
      edgeId,
      {
        id: edgeId,
        kind: "edge",
        slots: openSlots(8),
        serviceTimeUs: 120_000n,
        queueDepth: 0,
        queue: [],
        shedOrder: "qos-weighted",
        inspectionDepth: "inspect",
        discipline: "hockey-stick",
        utilizationRho: fx.FIXED_ZERO,
        dependencyNodeId: originId,
      },
    ],
    [
      originId,
      {
        id: originId,
        kind: "origin",
        slots: openSlots(8),
        serviceTimeUs: 60_000n,
        queueDepth: 0,
        queue: [],
        shedOrder: "first-in-first-out",
        inspectionDepth: "sample-1-in-20",
        discipline: "hockey-stick",
        utilizationRho: fx.FIXED_ZERO,
        dependencyNodeId: null,
      },
    ],
  ]);
}

/** Exposed for engine init: one ingress lane aggregate. */
export function startingLanes(): ReadonlyMap<EntityId, LaneStats> {
  const laneId = asEntityId("lane-ingress");
  return new Map<EntityId, LaneStats>([
    [
      laneId,
      {
        laneId,
        ratePerMin: fx.fromRatio(6n, 1n),
        latencyDistributionRef: "hist:lane-ingress",
        classMix: { gold: fx.fromRatio(6n, 10n), bronze: fx.fromRatio(3n, 10n), bulk: fx.fromRatio(1n, 10n) },
        health: fx.FIXED_ONE,
      },
    ],
  ]);
}

/** Monotonic cause id helper (attribution end-to-end). */
export function tickCause(tick: SimTick, what: string): CauseId {
  return asCauseId(`${what}:tick:${tick.toString()}`);
}
