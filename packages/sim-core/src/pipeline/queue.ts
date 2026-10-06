/**
 * The queueing core (MASTER_REPORT §4.1 R-06…R-09; hosting_game.md §7.13
 * steps 5–6). "Slots, not HP" (R-32): capacity is S discrete slots consumed
 * in integer multiples by weighted units; ρ (instantaneous utilization) is
 * measured in Fixed, and the hockey-stick wait is the ANALYTIC aggregate
 * closed form — units in queue are never individually simulated minute by
 * minute for their wait; the aggregate curve is the gameplay truth (R-07,
 * "the most important curve in the game"; final knee value is OD-2's tuning
 * sheet, default 0.7).
 *
 *   queue_wait(ρ) = serviceTime × ρ / (1 − ρ)   for ρ > knee
 *                 = 0                            for ρ ≤ knee
 *
 * ρ is clamped below 1 at RHO_CEILING so the closed form stays finite
 * (saturation wait = serviceTime × 99 ≈ the documented max); overflow of the
 * Fixed multiplier is clamped, never thrown — a pegged queue is a legal game
 * state, not a bug. All math is bigint/Q16.16; LUT-free (the closed form is
 * already O(1) integer arithmetic).
 */

import type { Fixed, NodeRecord, SimTimeUs } from "../types.ts";
import { FIXED_ONE, FIXED_UNIT, FIXED_ZERO, div, fromRatio, sub } from "../kernel/fixed.ts";
import { mulUsFixed } from "./internal.ts";

/** 70 % knee default (R-07; OD-2 tuning sheet may move it — pass `kneeRho`). */
export const DEFAULT_KNEE_RHO: Fixed = fromRatio(7n, 10n);

/** ρ clamp — saturation density for the closed form (0.99). */
export const RHO_CEILING: Fixed = fromRatio(99n, 100n);

/** Largest multiplier the hockey stick can produce at the clamp. */
export const MAX_WAIT_MULTIPLIER: Fixed = div(RHO_CEILING, sub(FIXED_ONE, RHO_CEILING));

/**
 * Occupied capacity of a node in Fixed slot-units, honoring weighted units:
 * each occupied slot contributes at most 1.0 but a unit of sizeCost > 1
 * holds `ceil(sizeCost)` slots (§internal.slotsNeeded) — occupancy is simply
 * the count of occupied slots weighted evenly across each holding unit.
 * v0 counts OCCUPIED SLOTS (weight is applied at admission time instead, so
 * ρ never double-counts a fat unit's empty-but-reserved slots).
 */
export function occupiedSlots(node: NodeRecord): number {
  let busy = 0;
  for (const slot of node.slots) {
    if (slot.occupied) busy += 1;
  }
  return busy;
}

/** ρ = occupied / S as Fixed (clamped to RHO_CEILING·4 headroom for queue
 *  pressure visibility; a hard-ceiling node pegs at the ceiling). */
export function utilization(node: NodeRecord): Fixed {
  const capacity = node.slots.length;
  if (capacity === 0) {
    // A zero-slot node is definitionally saturated (nothing can be served).
    return RHO_CEILING;
  }
  const rho = fromRatio(BigInt(occupiedSlots(node)), BigInt(capacity));
  return rho > RHO_CEILING ? RHO_CEILING : rho;
}

/**
 * Free (unoccupied) slot indices in ascending order — deterministic
 * admission picks the LOWEST free indices so replay across runtimes assigns
 * identical slot numbers.
 */
export function freeSlotIndices(node: NodeRecord): number[] {
  const free: number[] = [];
  for (let i = 0; i < node.slots.length; i += 1) {
    const slot = node.slots[i];
    if (slot !== undefined && !slot.occupied) free.push(i);
  }
  return free;
}

/** The ρ/(1−ρ) multiplier above the knee (Fixed); 0 at/below it. */
export function hockeyStickMultiplier(rho: Fixed, kneeRho: Fixed): Fixed {
  const effective = rho > RHO_CEILING ? RHO_CEILING : rho;
  if (effective <= kneeRho) return FIXED_ZERO;
  const oneMinus = sub(FIXED_ONE, effective); // ≥ 1/100 raw-scaled: never zero
  const multiplier = div(effective, oneMinus);
  return multiplier > MAX_WAIT_MULTIPLIER ? MAX_WAIT_MULTIPLIER : multiplier;
}

/**
 * Closed-form queue wait in integer µs: 0 below the knee,
 * serviceTime × ρ/(1−ρ) above it. `serviceTimeUs` is the node's base per-hop
 * service time; result is round-half-away via mulUsFixed.
 */
export function hockeyStickWaitUs(serviceTimeUs: SimTimeUs, rho: Fixed, kneeRho: Fixed): SimTimeUs {
  return mulUsFixed(serviceTimeUs, hockeyStickMultiplier(rho, kneeRho));
}

/** Queue depth above which upstream backpressure should propagate (v0: any
 *  nonzero depth propagates; the numeric threshold is a tuning knob owned by
 *  the sheet module, so this constant is deliberately conservative). */
export const BACKPRESSURE_QUEUE_DEPTH_TRIGGER = 1;

/**
 * Backpressure: a node whose dependency is congested has its OWN effective
 * ρ raised by the downstream queue shadow — "queue-depth propagation
 * upstream". Shadow adds depth/(S) worth of ρ (capped at RHO_CEILING), so an
 * upstream node's hockey stick bends before its own slots fill (the visible
 * foreshadowing players read on the HUD).
 */
export function effectiveRho(node: NodeRecord, downstreamQueueDepth: number): Fixed {
  const base = utilization(node);
  const capacity = node.slots.length;
  if (capacity === 0 || downstreamQueueDepth <= 0) return base;
  const shadow = fromRatio(BigInt(downstreamQueueDepth), BigInt(capacity));
  const combined = base + shadow;
  return combined > RHO_CEILING ? RHO_CEILING : combined;
}

/** A deterministic empty-node queue/slot scaffold used by board bootstraps. */
export function makeSlots(count: number): NodeRecord["slots"] {
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new Error(`makeSlots: bad slot count ${count}`);
  }
  const slots = [];
  for (let i = 0; i < count; i += 1) {
    slots.push(Object.freeze({ occupied: false, unitId: null, waitingOn: null, releasedAtUs: null }));
  }
  return Object.freeze(slots);
}

/** Fixed 1.0 alias for readable admission math. */
export const ONE_SLOT: Fixed = FIXED_UNIT;
