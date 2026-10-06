/**
 * gates/g3 · scenario — the suspicion-dial board, rebuilt from the headless
 * acceptance slice (packages/sim-core/src/__tests__/gate-g3.test.ts) on
 * `@hh/sim-core` SUBPATH exports only.
 *
 * Topology: meter-1 (congested front door, pass-through) fans out to the two
 * lanes: waf-1 (EXPRESS terminal hop) vs deep-1 (DEEP inspection). The dial
 * (expressMaxConfidence) decides which lane fresh traffic takes; the gate's
 * OWN suspicion ledger + route-slot wrapper yank high-confidence retries and
 * mid-path units off the express lane. Evidence arrives as wire signals:
 * units sitting between meter and waf accrue Π(1−cᵢ) folds in canonical
 * (unitId, metric) order — the FIX-3 law made visible.
 *
 * Pure data + factories; the runner owns the mutable per-run instances.
 */
import {
  PlayerVerb,
  ResolutionBand,
  asEntityId,
  asMetricId,
  type ConfidenceContribution,
  type EntityId,
  type ExternalIntent,
  type Fixed,
  type GameState,
  type LaneStats,
  type NodeRecord,
  type ObservedCell,
  type Outcome,
  type QosClassDef,
  type RetryPolicy,
  type RouteIn,
  type SimEvent,
  type SimTick,
  type TickStep,
  type Unit,
  type WaveEnvelope,
} from "@hh/sim-core/types";
import {
  FIXED_UNIT,
  FIXED_ZERO,
  MICROS_PER_MIN,
  clampUnit,
  fromInt,
  fromRatio,
  mul,
  sub,
} from "@hh/sim-core/kernel";
import type { DefaultPipelineConfig } from "@hh/sim-core/pipeline";
import { createRouteStep, defaultOutcomeStep } from "@hh/sim-core/pipeline";

export const G3_ENGINE_VERSION = "gate-g3/proto v0";

export const G3_IDS = Object.freeze({
  meter: asEntityId("meter-1"),
  waf: asEntityId("waf-1"),
  deep: asEntityId("deep-1"),
  laneExpress: asEntityId("lane/express"),
  laneDeep: asEntityId("lane/deep"),
} as const);

export type G3Depth = NodeRecord["inspectionDepth"];
export type G3LaneId = typeof G3_IDS.laneExpress | typeof G3_IDS.laneDeep;

export const G3_ORGANIC: WaveEnvelope = Object.freeze({
  tableId: "g3-organic",
  role: "baseline",
  shape: "plateau",
  ratePerMin: fromInt(6),
  telegraphed: true,
  dominantFamily: "organic",
});
export const G3_MALICIOUS: WaveEnvelope = Object.freeze({
  tableId: "g3-malicious",
  role: "spike",
  shape: "plateau",
  ratePerMin: fromInt(4),
  telegraphed: true,
  dominantFamily: "malicious",
});
export const G3_ENVELOPES: readonly WaveEnvelope[] = Object.freeze([G3_ORGANIC, G3_MALICIOUS]);

/** Bronze-only ladder: in G3 the dial is about ROUTING, not class QoS. */
export const G3_CLASSES: readonly QosClassDef[] = Object.freeze([
  Object.freeze({
    id: "bronze",
    label: "Bronze",
    weight: FIXED_ZERO,
    shedPriority: 1,
    budgetUs: 30n * MICROS_PER_MIN,
    inspectionDepth: "pass-through" as const,
  }),
]);

export const G3_RETRY: RetryPolicy = Object.freeze({
  maxRetries: 2,
  backoffBaseUs: 3n * MICROS_PER_MIN, // first retry at +6 ticks — inside the horizon
  jitterPurchased: false,
});

/** Pipeline config minus runSeed (the dial is a TickInput, not config). */
export function g3Config(falsePositivePercent: number): Omit<DefaultPipelineConfig, "runSeed"> {
  return Object.freeze({
    dnsNodeId: null,
    // S2 board: everything enters through the meter, EXPRESS continues to the
    // waf terminal, demotions reroute the remainder to deep-1. The meter is
    // what puts units ON THE WIRE — the only state the mid-path law may touch.
    expressPath: Object.freeze([G3_IDS.meter, G3_IDS.waf]),
    deepPath: Object.freeze([G3_IDS.deep]),
    defaultPatienceUs: 30n * MICROS_PER_MIN,
    defaultSizeCost: fromInt(1),
    patienceJitterPct: 0,
    inspectionCostUs: Object.freeze({
      "pass-through": 0n,
      "sample-1-in-20": 3n * 1_000_000n,
      inspect: 10n * 1_000_000n,
      challenge: 20n * 1_000_000n,
    }),
    detectionRatio: fromRatio(9n, 10n),
    falsePositiveRatio: fromRatio(BigInt(falsePositivePercent), 100n),
    referralProbability: FIXED_ZERO,
    returnProbability: FIXED_ZERO,
  });
}

export function g3MkNode(id: EntityId, slots: number, serviceUs: bigint, depth: G3Depth): NodeRecord {
  return Object.freeze({
    id,
    kind: "generic",
    slots: Object.freeze(
      Array.from({ length: slots }, () =>
        Object.freeze({ occupied: false, unitId: null, waitingOn: null, releasedAtUs: null }),
      ),
    ),
    serviceTimeUs: serviceUs,
    queueDepth: 0,
    queue: Object.freeze([]),
    shedOrder: "qos-weighted" as const,
    inspectionDepth: depth,
    discipline: "hockey-stick" as const,
    utilizationRho: 0n,
    dependencyNodeId: null,
  });
}

export function g3ExactCell(value: number | bigint): ObservedCell<unknown> {
  return Object.freeze({
    value,
    fidelity: ResolutionBand.Exact,
    freshnessUs: 0n,
    coverage: FIXED_UNIT,
    certainty: FIXED_UNIT,
    status: "live" as const,
  });
}

export function g3TextCell(value: string): ObservedCell<unknown> {
  return Object.freeze({
    value,
    fidelity: ResolutionBand.Exact,
    freshnessUs: 0n,
    coverage: FIXED_UNIT,
    certainty: FIXED_UNIT,
    status: "live" as const,
  });
}

export function g3LaneStats(laneId: G3LaneId, arrivals: number, health: Fixed): LaneStats {
  return Object.freeze({
    laneId,
    ratePerMin: fromInt(arrivals),
    latencyDistributionRef: `gate-g3/hist/${String(laneId)}`,
    classMix: Object.freeze({ bronze: FIXED_UNIT }),
    health,
  });
}

/* ── the gate-owned suspicion ledger (§9.13 #3 stickiness + decay) ────── */

export const SUSPICION_SPIKE: Fixed = fromRatio(1n, 10n); // engine's benign ROC read
export const SUSPICION_DECAY: Fixed = fromRatio(9n, 10n); // ×0.9 per tick
export const SUSPICION_THRESHOLD: Fixed = fromRatio(5n, 100n);
export const LEDGER_HORIZON_TICKS: SimTick = 12n;

export interface SuspicionLedger {
  /** lineage stem → spike + tick it was stamped. */
  readonly spikes: Map<string, { readonly value: Fixed; readonly atTick: SimTick }>;
  demotions: number;
  midPathDemotions: number;
  readonly demotedUnitIds: Set<string>;
  readonly routedByNode: Map<string, number>;
}

export function createSuspicionLedger(): SuspicionLedger {
  return {
    spikes: new Map(),
    demotions: 0,
    midPathDemotions: 0,
    demotedUnitIds: new Set(),
    routedByNode: new Map(),
  };
}

/** lineageStem: strip the retry arm `#rN` — stickiness is per source identity. */
export function lineageStem(identity: string): string {
  const cut = identity.indexOf("#r");
  return cut === -1 ? identity : identity.slice(0, cut);
}

export function decayedSuspicion(ledger: SuspicionLedger, identity: string, nowTick: SimTick): Fixed {
  const spike = ledger.spikes.get(lineageStem(identity));
  if (spike === undefined) return FIXED_ZERO;
  const age = nowTick - spike.atTick;
  if (age <= 0n) return spike.value;
  if (age > LEDGER_HORIZON_TICKS) return FIXED_ZERO;
  let value = spike.value;
  for (let i = 0n; i < age; i += 1n) value = mul(value, SUSPICION_DECAY);
  return clampUnit(value);
}

/* ── slot wrappers: the legal gate-assembly seam (swap any single slot) ── */

type OutcomeInput = Parameters<typeof defaultOutcomeStep>[0];

/** Route slot + the two G3 laws, each guarded to a race-free boundary
 *  (mirrored from the headless acceptance slice):
 *  · fresh visits — a hot lineage stem (sticky-window retry) routes deep;
 *  · in-flight units — demotion ONLY while "on the wire": hop-0 is the
 *    express terminal yet the unit sits in neither its queue nor a service
 *    slot — rewriting the remainder cannot strand a hop-completion. */
export function createGateRouteStep(
  base: ReturnType<typeof createRouteStep>,
  ledger: SuspicionLedger,
  wireNode: EntityId,
  deepPath: readonly EntityId[],
): TickStep<RouteIn, { readonly units: readonly Unit[] }> {
  return (input) => {
    const preHops = new Map<string, number>();
    for (const unit of input.units) preHops.set(String(unit.id), unit.routeHops.length);

    const routed = base(input).units;
    const node = input.nodes.get(wireNode);
    const queuedHere = new Set<string>((node?.queue ?? []).map(String));
    const inServiceHere = new Set<string>(
      (node?.slots ?? []).flatMap((slot) => (slot.occupied && slot.unitId !== null ? [String(slot.unitId)] : [])),
    );

    const units = routed.map((unit) => {
      if (preHops.get(String(unit.id)) === 0) {
        // gate law: stickiness rides RETRY lineages — a first visit is never
        // demoted by the ledger (recycled source buckets stay honest)
        const suspect =
          unit.retryOf !== null &&
          decayedSuspicion(ledger, unit.source.identity, input.context.tick) >= SUSPICION_THRESHOLD;
        if (suspect && unit.routeHops[0] !== deepPath[0]) {
          ledger.demotions += 1;
          ledger.demotedUnitIds.add(String(unit.id));
          return Object.freeze({ ...unit, routeHops: Object.freeze([...deepPath]) });
        }
        const hops = unit.routeHops;
        const terminal = hops.length === 0 ? undefined : hops[hops.length - 1];
        if (terminal !== undefined) {
          const k = String(terminal);
          ledger.routedByNode.set(k, (ledger.routedByNode.get(k) ?? 0) + 1);
        }
        return unit;
      }
      // mid-path: on the wire in front of the express terminal hop
      if (
        unit.routeHops.length > 0 &&
        unit.routeHops[0] === wireNode &&
        !queuedHere.has(String(unit.id)) &&
        !inServiceHere.has(String(unit.id)) &&
        unit.confidence > input.expressMaxConfidence
      ) {
        ledger.midPathDemotions += 1;
        ledger.demotedUnitIds.add(String(unit.id));
        return Object.freeze({ ...unit, routeHops: Object.freeze([...deepPath]) });
      }
      return unit;
    });
    return Object.freeze({ units: Object.freeze(units) });
  };
}

/** Outcome slot + ledger write: every false positive spikes its lineage
 *  root. Terminal resolution stays ENGINE law — this only reads. */
export function createGateOutcomeStep(ledger: SuspicionLedger) {
  return (input: OutcomeInput): { readonly outcomes: readonly Outcome[]; readonly events: readonly SimEvent[] } => {
    const out = defaultOutcomeStep(input);
    const unitsById = (input as unknown as { readonly unitsById: ReadonlyMap<EntityId, Unit> }).unitsById;
    for (const outcome of out.outcomes) {
      if (outcome.terminal !== "blocked-false-positive") continue;
      const unit = unitsById.get(outcome.unitId);
      if (unit === undefined) continue;
      ledger.spikes.set(lineageStem(unit.source.identity), {
        value: SUSPICION_SPIKE,
        atTick: input.context.tick,
      });
    }
    return out;
  };
}

/* ── host-side evidence: wire signals in canonical contribution form ──── */

export const SIG_A = fromRatio(2n, 10n);
export const SIG_B = fromRatio(35n, 100n);
export const SIG_C = fromRatio(4n, 10n);

/** Analytic triple fold Π(1−cᵢ) in canonical order — the value the engine
 *  MUST produce regardless of submission permutation. */
export const G3_TRIPLE_FOLD: Fixed = clampUnit(
  sub(FIXED_UNIT, mul(mul(sub(FIXED_UNIT, SIG_A), sub(FIXED_UNIT, SIG_B)), sub(FIXED_UNIT, SIG_C))),
);

/** Units sitting ON THE WIRE (between meter and waf: hop-0 is waf, not queued
 *  or served at waf) get triple evidence ⇒ fold > dial ⇒ mid-path demotion.
 *  Even-bucket units get the triple, odd-bucket units stay controls. */
export function wireSignalEvidence(state: GameState, triple: boolean): readonly ConfidenceContribution[] {
  const wireNode = G3_IDS.waf;
  const node = state.nodes.get(wireNode);
  const queued = new Set<string>((node?.queue ?? []).map(String));
  const serving = new Set<string>(
    (node?.slots ?? []).flatMap((slot) => (slot.occupied && slot.unitId !== null ? [String(slot.unitId)] : [])),
  );
  const out: ConfidenceContribution[] = [];
  for (const unit of state.units.values()) {
    if (unit.routeHops.length === 0 || unit.routeHops[0] !== wireNode) continue;
    if (queued.has(String(unit.id)) || serving.has(String(unit.id))) continue;
    // half the wire cohort gets intel; the rest are the CONTROLS that must
    // still terminate at waf-1 (proves the yank is the signal's doing).
    // Source ids are authored `${tableId}:s${bucket}` — bucket parity is the
    // deterministic cohort coin (never RNG: the budget belongs to the engine).
    const identity = unit.source.identity;
    const bucket = Number(identity.slice(identity.lastIndexOf(":s") + 2).split("#")[0]);
    if (bucket % 2 !== 0) continue;
    if (triple) {
      out.push(
        Object.freeze({ unitId: unit.id, metric: asMetricId("sig-a"), value: SIG_A }),
        Object.freeze({ unitId: unit.id, metric: asMetricId("sig-b"), value: SIG_B }),
        Object.freeze({ unitId: unit.id, metric: asMetricId("sig-c"), value: SIG_C }),
      );
    } else {
      out.push(
        Object.freeze({ unitId: unit.id, metric: asMetricId("pattern-hit"), value: fromRatio(9n, 10n) }),
      );
    }
  }
  return Object.freeze(out);
}

/** Defense upgrade door verb (waf-1 pass-through ⇄ challenge). */
export function g3ToggleIntent(tick: SimTick, depth: G3Depth): ExternalIntent {
  return Object.freeze({
    tick,
    intent: Object.freeze({
      seq: 1,
      clock: "sim" as const,
      atUs: tick * MICROS_PER_MIN,
      origin: "player" as const,
      payload: Object.freeze({
        kind: "player-verb" as const,
        args: Object.freeze({
          verb: PlayerVerb.ConfigureNode,
          nodeId: G3_IDS.waf,
          inspectionDepth: depth,
          shedOrder: null,
        }),
      }),
    }),
  });
}
