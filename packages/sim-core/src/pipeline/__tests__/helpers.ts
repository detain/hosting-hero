/**
 * Shared test fixtures for the pipeline suite: board builders, a default
 * run config, and a per-tick input assembler. Deterministic by construction
 * (fixed seeds, sorted insertion).
 */

import type {
  EntityId,
  Fixed,
  InspectionDepth,
  NodeRecord,
  QosClassDef,
  RetryPolicy,
  SimTimeUs,
  WaveEnvelope,
} from "../../types";
import { asEntityId, asRunSeed } from "../../types";
import { FIXED_ZERO, fromInt, fromRatio } from "../../kernel/fixed";
import { MICROS_PER_MIN, MICROS_PER_SEC, initialClocks } from "../../kernel/time";
import { makeSlots } from "../queue";
import type { DefaultPipelineConfig } from "../defaults";
import type { TickInputs } from "../driver";

export const MIN = MICROS_PER_MIN;
export const SEC = MICROS_PER_SEC;

export const IDS = {
  edge: asEntityId("edge"),
  origin: asEntityId("origin"),
  waf: asEntityId("waf"),
  dns: asEntityId("dns"),
} as const;

export function node(
  id: EntityId,
  opts: {
    slots?: number;
    serviceUs?: SimTimeUs;
    dep?: EntityId | null;
    discipline?: NodeRecord["discipline"];
    depth?: InspectionDepth;
    kind?: string;
  } = {},
): NodeRecord {
  return Object.freeze({
    id,
    kind: opts.kind ?? "generic",
    slots: makeSlots(opts.slots ?? 1),
    serviceTimeUs: opts.serviceUs ?? MIN,
    queueDepth: 0,
    queue: Object.freeze([]),
    shedOrder: "qos-weighted" as const,
    inspectionDepth: opts.depth ?? "pass-through",
    discipline: opts.discipline ?? ("hockey-stick" as const),
    utilizationRho: 0n,
    dependencyNodeId: opts.dep ?? null,
  });
}

export function envelope(
  tableId: string,
  ratePerMin: Fixed,
  family: WaveEnvelope["dominantFamily"] = "organic",
): WaveEnvelope {
  return Object.freeze({
    tableId,
    role: family === "organic" ? ("baseline" as const) : ("spike" as const),
    shape: "plateau" as const,
    ratePerMin,
    telegraphed: family !== "organic",
    dominantFamily: family,
  });
}

export const DEFAULT_CLASSES: readonly QosClassDef[] = Object.freeze([
  Object.freeze({
    id: "gold",
    label: "Gold",
    weight: fromRatio(6n, 10n),
    shedPriority: 0,
    budgetUs: 5n * MIN,
    inspectionDepth: "inspect" as const,
  }),
  Object.freeze({
    id: "bronze",
    label: "Bronze",
    weight: FIXED_ZERO, // every unit clears this gate
    shedPriority: 1,
    budgetUs: 30n * MIN,
    inspectionDepth: "pass-through" as const,
  }),
]);

export const NO_RETRY: RetryPolicy = Object.freeze({
  maxRetries: 0,
  backoffBaseUs: 0n,
  jitterPurchased: false,
});

export function retryPolicy(maxRetries: number, backoffBaseUs: SimTimeUs = 0n): RetryPolicy {
  return Object.freeze({ maxRetries, backoffBaseUs, jitterPurchased: false });
}

export const INSPECTION_COSTS: Readonly<Record<InspectionDepth, SimTimeUs>> = Object.freeze({
  "pass-through": 0n,
  "sample-1-in-20": 3n * SEC,
  inspect: 10n * SEC,
  challenge: 20n * SEC,
});

/** A coherent default config; override per test scenario. */
export function testConfig(overrides: Partial<DefaultPipelineConfig> = {}): DefaultPipelineConfig {
  return Object.freeze({
    runSeed: asRunSeed(42n),
    dnsNodeId: null,
    expressPath: Object.freeze([IDS.edge, IDS.origin]),
    deepPath: Object.freeze([IDS.waf, IDS.edge, IDS.origin]),
    defaultPatienceUs: 3n * MIN,
    defaultSizeCost: fromInt(1),
    patienceJitterPct: 0,
    inspectionCostUs: INSPECTION_COSTS,
    detectionRatio: fromRatio(9n, 10n),
    falsePositiveRatio: fromRatio(2n, 100n),
    referralProbability: FIXED_ZERO,
    returnProbability: FIXED_ZERO,
    ...overrides,
  });
}

/** Per-tick ambient inputs with static (non-evidence) fields. */
export function tickInputs(partial: Partial<TickInputs> & Pick<TickInputs, "envelopes">): TickInputs {
  return Object.freeze({
    evidence: [],
    classes: DEFAULT_CLASSES,
    dependencyEdges: Object.freeze([
      Object.freeze({
        upstreamNodeId: IDS.edge,
        downstreamNodeId: IDS.origin,
        correlation: "software" as const,
      }),
      Object.freeze({
        upstreamNodeId: IDS.waf,
        downstreamNodeId: IDS.edge,
        correlation: "software" as const,
      }),
    ]),
    retryPolicy: NO_RETRY,
    aggression: fromRatio(5n, 10n),
    expressMaxConfidence: fromRatio(8n, 10n),
    ...partial,
  });
}

export const freshClocks = initialClocks;
