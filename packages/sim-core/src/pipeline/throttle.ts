/**
 * §1.3 dbaas THROTTLE — the player-authored partial capacity cut on NEW
 * admissions (v0, ADR-0016 successor program, lane L-TR).
 *
 * Home of the twelfth type's OWN second verb (hosting_game.md §1.3 "The
 * Managed Database", ~:2253: "**Verb: isolate and throttle.**"). Isolate
 * landed the total fence (`pipeline/isolation.ts`, ADR-0015 @86cff89);
 * this module lands the PARTIAL sibling — the deliberate, legible
 * capacity trade the card promises: "throttle everything (lose capacity)"
 * as a soft degrade visible as reduced capacity, not a dead node. The
 * legibility law is the card's own (§1.3 rider ~:2247: "CPUs throttle by
 * visibly *shrinking the maximum* of their utilization donut — a
 * beautifully legible way to show 'your ceiling dropped'"): the SIM
 * witnesses the dropped ceiling by discounting ADMISSIONS, and the HUD
 * draws the shrink from the book — the authored roster stays ground
 * truth because materializing the shrink was REJECTED: writing a smaller
 * roster into the view poisons `throttleServeNodes`' `fullSlots` capture
 * (recovery would record the cut-inflated ceiling as the node's authored
 * capacity and the throttle would become PERMANENT through a restoration
 * window — the exact opposite of a soft degrade). The bps-probability
 * form was REJECTED too: step 5 is dice-FREE and its digests depend on
 * it; a probabilistic admit would fork replay under the same seed.
 *
 * THE LAW, in one sentence: while a cut is in force the node admits new
 * work only up to `slots.length(view) − cut` OCCUPIED slots — the
 * discount is applied at the admissions read (`defaults.ts`
 * `defaultServeStep` §(c), `ServeInExt.throttleCuts`) — while joins,
 * releases, patience ageing, and hard-ceiling shed all run untouched,
 * the roster is NEVER written, occupied arms are NEVER evicted, and an
 * over-cap node simply admits nothing until work walks off. The fence
 * stays the TOTAL case: the door refuses `cut >= roster` pointing at
 * `isolate-node`, so every throttle booked through the door is a PARTIAL
 * cut; precedence at the admissions read is code position (the fenced
 * skip-branch is the FIRST branch, the ceiling guard the SECOND — fence
 * beats throttle by construction, pinned falsifiably).
 *
 * The cut is the player-authored SIBLING of the engine's automatic
 * recovery clamp (`recovery.ts` `throttleServeNodes`) and composes with
 * it MIN-OF-CLAMPS on the throttled view: the clamp already discounted
 * the roster this module discounts further, neither authority writes the
 * other's surface, and the `recovery[board-drift]` throw is structurally
 * unreachable from here (this fold writes no roster either — the
 * isolation posture verbatim). Scale warmth is ADDITIVE under the cut:
 * booked reserved arms RAISE the base the cut discounts (both are read
 * -time views over the same authored roster; the cut never cancels
 * warmth's promise, it spends against the widened ceiling).
 *
 * THE RELEASE WINDOW: the cut window is the fence's half-open `[effective,
 * release)` VERBATIM (no new grammar — one as-of discipline across the
 * minute-window books; the deliberate twin, not an import, per the
 * maintain/schedule precedent @5987ef1). A null release is indefinite
 * until explicitly replaced (last-write-wins; the cut-0 amendment IS the
 * lift). Expired rows are KEPT as history witness, inert at read, and
 * the digest encodes them raw — the maintain/schedule/isolate read-time
 * expiry law; nothing is pruned.
 *
 * Default-off law: with no `GameState.throttle` book — or an idle one —
 * the driver never calls `throttleCuts`, the cut map never reaches the
 * serve input, and every shipped digest is byte-identical (pinned in
 * `__tests__/throttle-consume.test.ts`).
 */

import type { EntityId, ReclaimEntry, SimMinute, ThrottleBook } from "../types.ts";
import { voidedByTombstone } from "./reclaim.ts";

/** As-of law for ONE node's cut — the `nodeIsolated` twin, widened by the
 *  value leg. In force at business minute `atBusinessMinute` iff:
 *
 *  - the book exists AND carries an entry for `nodeId` with `cutSlots >= 1`
 *    (a booked cut of 0 is the explicit LIFT amendment: it reads null —
 *    inert to the fold — while the row stays in the book as history and in
 *    the digest raw); and
 *  - the cut is ARMED: `effectiveAtBusinessMinute === null` (law from the
 *    executing tick — same-tick pre-arm honored, the shield/isolate
 *    semantics VERBATIM) OR `atBusinessMinute >= effective` (a future stamp
 *    is armed but NOT yet law — the `PriceOverrideRecord` discipline); and
 *  - the cut has NOT EXPIRED: `releaseAtBusinessMinute === null`
 *    (indefinite) OR `atBusinessMinute < release` — the half-open `[eff,
 *    rel)` boundary VERBATIM, so at exactly `release` the full ceiling is
 *    back, strictly; and
 *  - the cut is NOT RECLAIMED (ADR-0017 #3): when a live reclaim index is
 *    threaded and the cut shipped AT OR BEFORE its node's tombstone, the
 *    destroy-and-rebuild cycle collected it — the ceiling answers restored
 *    (null) at read while the book keeps the row raw (history-witness
 *    posture VERBATIM). Omitted/null index ⇒ zero void checks, the
 *    pre-reclaim law exact.
 *
 *  Expired rows answer null here while remaining in the book (history
 *  witness, digest raw). Returns the LIVE cutSlots. Pure; zero RNG. */
export function nodeThrottleCut(
  throttle: ThrottleBook | undefined,
  nodeId: EntityId,
  atBusinessMinute: SimMinute,
  reclaims: ReadonlyMap<EntityId, ReclaimEntry> | null = null,
): number | null {
  if (throttle === undefined) return null;
  const entry = throttle.entries.get(nodeId);
  if (entry === undefined || entry.cutSlots < 1) return null;
  const armed =
    entry.effectiveAtBusinessMinute === null ||
    atBusinessMinute >= entry.effectiveAtBusinessMinute;
  if (!armed) return null;
  if (entry.releaseAtBusinessMinute !== null && atBusinessMinute >= entry.releaseAtBusinessMinute) return null;
  if (voidedByTombstone(entry.shippedAtTick, reclaims?.get(nodeId))) return null;
  return entry.cutSlots;
}

/** The LIVE cut map at business minute `atBusinessMinute`, for the step-5
 *  serve input — node id → discounted admission slots (every entry with
 *  `nodeThrottleCut` non-null). Returns `null` (NOT an empty map) when
 *  there is nothing to enforce — no book, an empty book, every row
 *  armed-not-yet/expired/cut-0, or every live row RECLAIMED (ADR-0017 #3
 *  — the void reads the full ceiling, so a collected cut costs the serve
 *  input nothing) — so the driver can OMIT the `ServeInExt.throttleCuts`
 *  key entirely and the serve input stays byte-identical to the unarmed
 *  run (idle book costs ZERO). Otherwise a
 *  frozen Map; insertion order is the book's key order and never leaks
 *  into semantics (the consumption site reads by node id only). Pure;
 *  zero RNG. */
export function throttleCuts(
  throttle: ThrottleBook | undefined,
  atBusinessMinute: SimMinute,
  reclaims: ReadonlyMap<EntityId, ReclaimEntry> | null = null,
): ReadonlyMap<EntityId, number> | null {
  if (throttle === undefined || throttle.entries.size === 0) return null;
  let live: Map<EntityId, number> | null = null;
  for (const [nodeId, entry] of throttle.entries) {
    if (nodeThrottleCut(throttle, nodeId, atBusinessMinute, reclaims) === null) continue;
    if (live === null) live = new Map<EntityId, number>();
    live.set(nodeId, entry.cutSlots);
  }
  if (live === null) return null;
  return Object.freeze(live);
}
