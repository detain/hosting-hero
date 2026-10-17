/**
 * §1.3 dbaas ISOLATION — the player-authored fence against NEW work (v0).
 *
 * Home of the twelfth type's own card verb (hosting_game.md §1.3 "The
 * Managed Database", ~:2243: "**Verb: isolate and throttle.** **The boss
 * is a split brain.**") and the §7.16 Act-row law finally catching the
 * spec (~:28825: "every object's inspector has an 'Act' row of at most
 * four one-click emergency verbs… drain, restart, isolate, shed" — drain
 * is the door's `disconnect-drain` and shed is `shed-load` today;
 * `isolate-node` is the named Act verb this module arms). §7.5 Incident
 * Mode (~:26759, "the available actions become…") names isolate in the
 * incident verb set — cited, not implemented: the SET is host choreography.
 *
 * THE LAW, in one sentence: while a node is fenced it assigns NO NEW units
 * — its free arms answer zero to arrivals — while in-flight and queued
 * work completes or bounces under the EXISTING patience law. Edges stay
 * intact, the queue is never truncated, occupied slots are never evicted,
 * the roster is never written. Shield (§3.1 pre-arm veto) protects what a
 * node SERVES — the step-9 corruption die. Isolate stops what a node
 * RECEIVES — the step-5 admissions.
 *
 * The fence is the player-authored SIBLING of the engine's automatic
 * recovery clamp (`recovery.ts` `throttleServeNodes`): the authorities
 * stay separate (the engine clamps a struggling node's roster; the player
 * fences a node the boss has split-brained), and precedence at the step-5
 * serve input is min-of-clamps — a fenced node admits zero new work even
 * while recovery holds arms open, and even while `scale-node` warmth has
 * booked reserved arms (FENCE BEATS WARMTH: the booked arms sit warm and
 * unused until the window lifts, then serve immediately). The consumption
 * gate lives in `defaults.ts` `defaultServeStep` §(c) via the presence-only
 * `ServeInExt.isolationFence`; this module owns ONLY the as-of reading,
 * pure and RNG-free, importing nothing but the shared contract.
 *
 * THE RELEASE WINDOW (§1.4 CI/build-farm line ~:2679, "Verb: isolate,
 * expire, reclaim"): unlike Shield's no-un-shield, a fence EXPIRES —
 * isolation is a burden, not a blessing. The window is HALF-OPEN
 * `[effective, release)`: at `release` the node admits again, strictly.
 * A null release is indefinite until explicitly replaced (last-write-wins;
 * the amendment IS the lift). Expired rows are KEPT as history witness,
 * inert at read, and the digest encodes them raw — the maintain/schedule
 * read-time expiry law (ADR-0015 lane L-DM2 @5987ef1); nothing is pruned.
 *
 * Default-off law: with no `GameState.isolate` book the driver never calls
 * `isolatedNodeIds`, the fence set never reaches the serve input, and every
 * shipped digest is byte-identical (pinned in
 * `__tests__/isolation-consume.test.ts`).
 */

import type { EntityId, IsolateBook, SimMinute } from "../types.ts";

/** As-of law for ONE node's fence — the `nodeShielded` twin, widened by
 *  the release leg. In force at business minute `atBusinessMinute` iff:
 *
 *  - the book exists AND carries an entry for `nodeId`; and
 *  - the fence is ARMED: `effectiveAtBusinessMinute === null` (law from
 *    the executing tick — the shield semantics VERBATIM, same-tick
 *    pre-arm honored) OR `atBusinessMinute >= effective` (a future stamp
 *    is armed but NOT yet law — the `PriceOverrideRecord` discipline); and
 *  - the fence has NOT EXPIRED: `releaseAtBusinessMinute === null`
 *    (indefinite) OR `atBusinessMinute < release` — the half-open `[eff,
 *    rel)` boundary, so at exactly `release` the node admits again.
 *
 *  Expired rows answer false here while remaining in the book (history
 *  witness, digest raw). Pure; zero RNG. */
export function nodeIsolated(
  isolate: IsolateBook | undefined,
  nodeId: EntityId,
  atBusinessMinute: SimMinute,
): boolean {
  if (isolate === undefined) return false;
  const entry = isolate.entries.get(nodeId);
  if (entry === undefined) return false;
  const armed =
    entry.effectiveAtBusinessMinute === null ||
    atBusinessMinute >= entry.effectiveAtBusinessMinute;
  if (!armed) return false;
  return entry.releaseAtBusinessMinute === null || atBusinessMinute < entry.releaseAtBusinessMinute;
}

/** The LIVE fence set at business minute `atBusinessMinute`, for the step-5
 *  serve input. Returns `null` (NOT an empty set) when there is nothing to
 *  enforce — no book, an empty book, or every row armed-not-yet/expired —
 *  so the driver can omit `ServeInExt.isolationFence` entirely and the serve
 *  input stays byte-identical to the unarmed run (idle book costs ZERO).
 *  Otherwise a frozen Set of fenced node ids. Pure; deterministic iteration
 *  over insertion order (the set's membership is order-independent at the
 *  consumption site); zero RNG. */
export function isolatedNodeIds(
  isolate: IsolateBook | undefined,
  atBusinessMinute: SimMinute,
): ReadonlySet<EntityId> | null {
  if (isolate === undefined || isolate.entries.size === 0) return null;
  let fenced: Set<EntityId> | null = null;
  for (const nodeId of isolate.entries.keys()) {
    if (!nodeIsolated(isolate, nodeId, atBusinessMinute)) continue;
    if (fenced === null) fenced = new Set<EntityId>();
    fenced.add(nodeId);
  }
  if (fenced === null) return null;
  return Object.freeze(fenced);
}
