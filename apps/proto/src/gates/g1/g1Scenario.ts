/**
 * gates/g1 · scenario — the SAME board the headless acceptance slice proves
 * (packages/sim-core/src/__tests__/gate-g1.test.ts), rebuilt exclusively on
 * `@hh/sim-core` SUBPATH exports. One lane, one WAF node, two envelopes:
 * organic traffic (8/min) and a malicious spike (4/min). The aggression slider
 * is the one legal pre-door control; the defense toggle is a real intent-door
 * verb (configure-node pass-through ⇄ challenge).
 *
 * Pure data + pure functions — zero Vue, zero timers, fully node-testable.
 */
import {
  PlayerVerb,
  asEntityId,
  asMoney,
  ResolutionBand,
  type Contract,
  type EntityId,
  type ExternalIntent,
  type LaneStats,
  type NodeRecord,
  type ObservedCell,
  type Outcome,
  type QosClassDef,
  type RetryPolicy,
  type SimTick,
  type WaveEnvelope,
} from "@hh/sim-core/types";
import {
  FIXED_UNIT,
  FIXED_ZERO,
  MICROS_PER_MIN,
  clampUnit,
  fromInt,
  fromRatio,
  sub,
} from "@hh/sim-core/kernel";
import type { DefaultPipelineConfig } from "@hh/sim-core/pipeline";

export const G1_ENGINE_VERSION = "gate-g1/proto v0";

export const G1_IDS = Object.freeze({
  waf: asEntityId("waf-1"),
  lane: asEntityId("lane/g1-ingress"),
} as const);

/** Whole-per-minute rates keep unit ids (`${tableId}@${tick}#${e}.${i}`)
 *  deterministic, so attribution never needs future-sight. */
export const G1_ENVELOPES: readonly WaveEnvelope[] = Object.freeze([
  Object.freeze({
    tableId: "g1-organic",
    role: "baseline",
    shape: "plateau",
    ratePerMin: fromInt(8),
    telegraphed: true,
    dominantFamily: "organic",
  }),
  Object.freeze({
    tableId: "g1-malicious",
    role: "spike",
    shape: "plateau",
    ratePerMin: fromInt(4),
    telegraphed: true,
    dominantFamily: "malicious",
  }),
]);

export const G1_CHALLENGE_FEE_US = 20n * 1_000_000n;

/** Config minus runSeed — the runner freezes it per instance. */
export const G1_PIPELINE_CONFIG: Omit<DefaultPipelineConfig, "runSeed"> = Object.freeze({
  dnsNodeId: null,
  expressPath: Object.freeze([G1_IDS.waf]),
  deepPath: Object.freeze([G1_IDS.waf]), // ONE lane, ONE node: no routing story here
  defaultPatienceUs: 4n * MICROS_PER_MIN,
  defaultSizeCost: fromInt(1),
  patienceJitterPct: 0,
  inspectionCostUs: Object.freeze({
    "pass-through": 0n,
    "sample-1-in-20": 3n * 1_000_000n,
    inspect: 10n * 1_000_000n,
    challenge: G1_CHALLENGE_FEE_US,
  }),
  // R-52: the slider moves THESE, never a damage number. A fat
  // false-positiveRatio is the authored posture — paranoia has a price.
  detectionRatio: fromRatio(9n, 10n),
  falsePositiveRatio: fromRatio(15n, 100n),
  referralProbability: FIXED_ZERO,
  returnProbability: FIXED_ZERO,
});

export const G1_CLASSES: readonly QosClassDef[] = Object.freeze([
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

export const G1_RETRY: RetryPolicy = Object.freeze({
  maxRetries: 2,
  backoffBaseUs: 2n * MICROS_PER_MIN,
  jitterPurchased: false,
});

export const G1_CONTRACT: Contract = Object.freeze({
  id: asEntityId("ctr-g1-gold"),
  customerEntityId: asEntityId("cust-g1"),
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

export function g1MkNode(depth: NodeRecord["inspectionDepth"]): NodeRecord {
  return Object.freeze({
    id: G1_IDS.waf,
    kind: "generic",
    // 16 slots vs 12 arrivals/min keeps ρ far below the knee: the curves
    // stay pure defense-attribution, not queue-noise artifacts.
    slots: Object.freeze(
      Array.from({ length: 16 }, () =>
        Object.freeze({ occupied: false, unitId: null, waitingOn: null, releasedAtUs: null }),
      ),
    ),
    serviceTimeUs: 6_000_000n,
    queueDepth: 0,
    queue: Object.freeze([]),
    shedOrder: "qos-weighted" as const,
    inspectionDepth: depth,
    discipline: "hockey-stick" as const,
    utilizationRho: 0n,
    dependencyNodeId: null,
  });
}

export function g1ExactCell(value: number | bigint): ObservedCell<unknown> {
  return Object.freeze({
    value,
    fidelity: ResolutionBand.Exact,
    freshnessUs: 0n,
    coverage: FIXED_UNIT,
    certainty: FIXED_UNIT,
    status: "live" as const,
  });
}

/* ── the triad ledger ──────────────────────────────────────────────────── */

export interface G1Triad {
  readonly neutralized: number;
  readonly falsePositives: number;
  readonly threatsLanded: number;
  readonly benignServed: number;
  /** Wasted challenge-lane compute (µs) paid by every false positive. */
  readonly fpWasteUs: bigint;
  /** Patience expiries: friction that is NOT defense — kept out of the triad. */
  readonly patienceBounces: number;
  readonly doorExecuted: number;
  readonly doorRefused: number;
}

export const G1_ZERO_TRIAD: G1Triad = Object.freeze({
  neutralized: 0,
  falsePositives: 0,
  threatsLanded: 0,
  benignServed: 0,
  fpWasteUs: 0n,
  patienceBounces: 0,
  doorExecuted: 0,
  doorRefused: 0,
});

/** Engine-cause attribution (§7.0): `defense:<node>:<unit>` neutralized,
 *  `false-positive:<node>:…`, `breach:…` landed, `served:…` benign served.
 *  Pure: returns the next triad, never mutates. */
export function g1AttributeOutcome(triad: G1Triad, outcome: Outcome): G1Triad {
  const cause = String(outcome.causeId);
  if (outcome.terminal === "bounced" && cause.startsWith("defense:")) {
    return Object.freeze({ ...triad, neutralized: triad.neutralized + 1 });
  }
  if (outcome.terminal === "bounced") {
    return Object.freeze({ ...triad, patienceBounces: triad.patienceBounces + 1 });
  }
  if (outcome.terminal === "blocked-false-positive") {
    return Object.freeze({
      ...triad,
      falsePositives: triad.falsePositives + 1,
      fpWasteUs: triad.fpWasteUs + G1_CHALLENGE_FEE_US,
    });
  }
  if (outcome.terminal === "landed") {
    return Object.freeze({ ...triad, threatsLanded: triad.threatsLanded + 1 });
  }
  return Object.freeze({ ...triad, benignServed: triad.benignServed + 1 });
}

/** Stats-not-entities law: the renderer gets AGGREGATES only, derived from
 *  this tick's real driver output (arrival events + the triad ledger). */
export function g1Lane(arrivalsThisTick: number, triad: G1Triad): LaneStats {
  const benignDecisions = triad.benignServed + triad.falsePositives;
  const fpShare = benignDecisions === 0
    ? FIXED_ZERO
    : fromRatio(BigInt(triad.falsePositives), BigInt(benignDecisions));
  return Object.freeze({
    laneId: G1_IDS.lane,
    ratePerMin: fromInt(arrivalsThisTick),
    latencyDistributionRef: "gate-g1/hist/express",
    classMix: Object.freeze({ gold: FIXED_ZERO, bronze: FIXED_UNIT }),
    health: clampUnit(sub(FIXED_UNIT, fpShare)),
  });
}

/** The defense toggle, expressed as the ONE door verb G1 owns. */
export function g1ToggleIntent(tick: SimTick, depth: "pass-through" | "challenge"): ExternalIntent {
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
          nodeId: G1_IDS.waf,
          inspectionDepth: depth,
          shedOrder: null,
        }),
      }),
    }),
  });
}
