/**
 * Shared frame forge for decision-lane tests. Mirrors the trusted internal
 * shape exactly (parse-don't-validate: producers of SimProjection have their
 * own boundary tests; here we build the PARSED form directly).
 */
import { asEntityId, type EntityId, type Fixed, type LaneStats, type ObservedKey } from "@hh/sim-core";
import type { EventNotice, OutcomeCounters, SimProjection } from "../../shared/protocol";
import { displayToFixed } from "../../shared/protocol";

export const MIN_US = 60_000_000n;
export const LANE: EntityId = asEntityId("lane/ingress-1");

export interface FrameSpec {
  readonly seq?: number;
  readonly tick?: bigint;
  readonly simUs?: bigint;
  readonly counters?: Partial<OutcomeCounters>;
  readonly notices?: readonly EventNotice[];
  readonly freeCashMicroUsd?: bigint;
  /** Lane health as a display number (0.05 dead floor law lives in the deriver). */
  readonly health?: number;
  readonly ratePerMin?: number;
}

export function forgeFrame(spec: FrameSpec): SimProjection {
  const simUs = spec.simUs ?? 1_000_000_000n;
  const lane: LaneStats = {
    laneId: LANE,
    ratePerMin: displayToFixed(spec.ratePerMin ?? 400),
    latencyDistributionRef: "hist/app-1/p50-p95-p99",
    classMix: { standard: displayToFixed(0.7), express: displayToFixed(0.3) },
    health: displayToFixed(spec.health ?? 0.8),
  };
  return {
    seq: spec.seq ?? 1,
    tick: spec.tick ?? 1n,
    minute: 1,
    clocks: { realUs: simUs, simUs, businessUs: simUs, wallUs: simUs },
    lanes: [lane],
    observed: new Map<ObservedKey, never>(),
    notices: spec.notices ?? [],
    counters: {
      served: 0,
      bounced: 0,
      blockedFalsePositive: 0,
      landed: 0,
      ...spec.counters,
    },
    freeCashMicroUsd: spec.freeCashMicroUsd ?? 50_000_000n,
  };
}

export function notice(kind: EventNotice["kind"], atUs: bigint, detail?: string): EventNotice {
  return {
    kind,
    laneId: LANE,
    atUs,
    ...(detail === undefined ? {} : { detail }),
  };
}

/** Fixed→display inverse helper kept typed; mirrors annotate.ts's reads. */
export function fixed(n: number): Fixed {
  return displayToFixed(n);
}
