/**
 * gates/g4 · latencyDelta — the LIVE Latency Ladder math (§9.13 gate #4,
 * §7.2 "the ms price tag DURING the drag, before the commit").
 *
 * One law, one module: a hop queues, so its cost is not its service time —
 * it is service/(1−ρ), the hockey stick (R-07). Pure over trusted inputs:
 * the caller parses board state into HopLoad at the boundary; nothing in
 * here reads a clock, mutates, or branches on identity.
 *
 * Saturation law: ρ is clamped to RHO_SATURATION (0.98) before the divide —
 * past the knee the ladder SHOWS "at capacity", it never returns ∞/NaN,
 * because a UI price tag must always be a number you can read.
 */
import { FIXED_UNIT } from "@hh/sim-core/kernel";
import type { Fixed } from "@hh/sim-core/types";

/** 0.98 in Q16.16 — the documented pre-∞ cap (floor of 65536·0.98). */
export const RHO_SATURATION: Fixed = 64225n as Fixed;

export interface HopLoad {
  /** Human line for the ladder ("web-1 service", "switch fabric"…). */
  readonly label: string;
  readonly serviceTimeUs: bigint;
  /** Q16.16 utilization at this hop (observed or profile-estimated). */
  readonly rho: Fixed;
}

export interface LatencyDelta {
  readonly beforeUs: bigint;
  readonly afterUs: bigint;
  readonly deltaUs: bigint;
  /** Display-space milliseconds, 3-decimal truncated (never the truth —
   *  bigint µs fields above are). */
  readonly deltaMs: number;
  /** Hops pinned at the saturation cap (ladder flags "at capacity"). */
  readonly saturatedLabels: readonly string[];
}

function clampRho(rho: Fixed): Fixed {
  if (rho <= 0n) return 0n;
  return rho > RHO_SATURATION ? RHO_SATURATION : rho;
}

/** One hop's queue-adjusted cost, µs. Negative service time is a parse bug
 *  upstream — fail loud, never silently zero it. */
export function effectiveHopUs(hop: HopLoad): bigint {
  if (hop.serviceTimeUs < 0n) {
    throw new RangeError(`effectiveHopUs: ${hop.label} carries negative serviceTimeUs ${hop.serviceTimeUs}`);
  }
  const rho = clampRho(hop.rho);
  const headroom = FIXED_UNIT - rho; // ∈ [1311, 65536] — never zero
  return (hop.serviceTimeUs * FIXED_UNIT) / headroom;
}

/** Sum of a path's effective hops (µs). Empty path = 0 (a dropped cable
 *  has no price tag, and that is a fact, not an error). */
export function pathLatencyUs(hops: readonly HopLoad[]): bigint {
  let total = 0n;
  for (const hop of hops) total += effectiveHopUs(hop);
  return total;
}

/**
 * The price tag: what does adding `added` hops to the served path cost,
 * versus the `before` path the traffic travels today? Both sides run
 * through the same hockey stick, so the delta is honest under load.
 */
export function latencyDeltaUs(
  before: readonly HopLoad[],
  after: readonly HopLoad[],
): LatencyDelta {
  const beforeUs = pathLatencyUs(before);
  const afterUs = pathLatencyUs(after);
  const saturatedLabels = after
    .filter((hop) => hop.rho > RHO_SATURATION || hop.rho === RHO_SATURATION)
    .map((hop) => hop.label);
  const deltaUs = afterUs - beforeUs;
  return Object.freeze({
    beforeUs,
    afterUs,
    deltaUs,
    deltaMs: Number(deltaUs) / 1000,
    saturatedLabels: Object.freeze(saturatedLabels),
  });
}

/** Ladder rows for the panel: one per hop on the candidate path, showing
 *  base vs queue-adjusted ms so the inflation is VISIBLE, not implied. */
export interface LadderRow {
  readonly label: string;
  readonly baseMs: number;
  readonly effectiveMs: number;
  readonly rhoPct: number;
  readonly saturated: boolean;
}

export function latencyLadderRows(after: readonly HopLoad[]): readonly LadderRow[] {
  return Object.freeze(
    after.map((hop) => {
      const rho = clampRho(hop.rho);
      return Object.freeze({
        label: hop.label,
        baseMs: Number(hop.serviceTimeUs) / 1000,
        effectiveMs: Number(effectiveHopUs(hop)) / 1000,
        rhoPct: Math.round((Number(rho) / Number(FIXED_UNIT)) * 1000) / 10,
        saturated: rho >= RHO_SATURATION,
      });
    }),
  );
}
