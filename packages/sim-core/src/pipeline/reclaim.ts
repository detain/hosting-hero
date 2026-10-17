/**
 * RECLAIM — the engine-side reader for the 19th door verb (ADR-0017 #3;
 * §1.4 CI/build-farm card, hosting_game.md :2677, verb line ~:2679
 * "Verb: isolate, expire, reclaim." — the named successor that closes the
 * card's three-verb row; the spot economics ground "reclaimable at any
 * moment" ~:24851).
 *
 * THE VOID LAW, one sentence: while a reclaim is in force for a node, every
 * PLAYER booking that node carried — scale warmth, isolate fence, throttle
 * cut, restart window, maintain band, schedule job window — answers INERT at
 * read, returning the node to its AUTHORED clean capacity; the reclaim voids
 * only bookings SHIPPED BEFORE IT (`entry.shippedAtTick <=
 * tombstone.shippedAtTick`) — later bookings stand (the rebuild half of the
 * destroy-and-rebuild cycle). It writes no roster, evicts no occupied arm,
 * touches no unit/queue/board/cash/RNG.
 *
 * EXCLUSIONS are load-bearing, not oversights:
 *  - `shield` (corruption.ts `nodeShielded`) is NEVER voided — a pre-arm is
 *    protection, not capacity; stripping protection at a reclaim would
 *    silently HARM the tenant the shield guards (pinned exclusion test);
 *  - §7.7 recovery windows/clamps (`throttleServeNodes`) are ENGINE
 *    authority — the separation law isolation.ts:22-31 states for the fence
 *    applies verbatim here: the player authors bookings, the engine owns
 *    damage records, a reclaim collects PLAYER promises and never erases
 *    engine history;
 *  - the priceKey-space books (`pricing`/`sell`/`negotiate`) are EXCLUDED
 *    v0: their consumers are the host/economy lane (contract signing,
 *    billing), not node capacity, and the keys are not node ids. The
 *    corpus card's spot-EVICTION of live contracts is the named FUTURE half
 *    of this mechanic, requiring a contract→capacity bridge nobody has
 *    designed — do NOT "complete" the void by forcing these books through.
 *
 * DEFAULT-OFF LAW: with no book the driver never calls `reclaimIndex`, the
 * index never reaches any of the six reads, every shipped digest is
 * byte-identical (pinned in `__tests__/reclaim-consume.test.ts`); an idle or
 * nothing-armed book answers `null` — the zero-call posture, never an empty
 * map (`isolatedNodeIds` precedent).
 *
 * Like isolation.ts/throttle.ts/restart.ts this module owns ONLY the as-of
 * reading, pure and RNG-free: zero streams, zero events, zero clock reads
 * (the caller threads the minute through the shared `shieldBusinessMinuteOf`
 * fold). Imports stay contract-level (`../types.ts`).
 */

import type { EntityId, ReclaimBook, ReclaimEntry, SimMinute, SimTick } from "../types.ts";

/**
 * The VOID BOUNDARY predicate — one home, six consumers (scale warmth,
 * isolate fence, throttle cut, restart window, maintain band, schedule job
 * window). A booking is voided when a tombstone exists for its node AND the
 * booking shipped AT OR BEFORE it: `bookingShippedAtTick <=
 * tombstone.shippedAtTick`.
 *
 * The `<=` boundary is PINNED LAW both directions: a booking and a tombstone
 * shipped in the SAME tick — possible only because they ride DIFFERENT books
 * (the door's LWW law cannot express ordering between two books on one
 * tick) — is voided: the reclaim collects everything the player shipped up
 * to and including this tick's desk work. A strictly LATER booking stands:
 * that is the rebuild, and it is what keeps the tombstone from becoming a
 * permanent booking ban.
 */
export function voidedByTombstone(
  bookingShippedAtTick: SimTick,
  tombstone: ReclaimEntry | undefined,
): boolean {
  return tombstone !== undefined && bookingShippedAtTick <= tombstone.shippedAtTick;
}

/** ADR-0017 #3 — the AS-OF law of the tombstone book, the flat twin of
 *  `nodeIsolated`'s armed leg minus the release (the tombstone never
 *  expires): an absent entry collects nothing; `effectiveAtBusinessMinute
 *  === null` is law from the executing tick; a future stamp is armed but NOT
 *  yet law. Accepting the optional book keeps the caller's guard flat
 *  (Law 1): `undefined` book ⇒ null for every node — the byte-identity
 *  switch. VALUE-leg'd: the ENTRY answers (callers compare their booking's
 *  `shippedAtTick` against it through `voidedByTombstone`), never
 *  re-validated downstream. */
export function reclaimInForce(
  reclaim: ReclaimBook | undefined,
  nodeId: EntityId,
  atBusinessMinute: SimMinute,
): ReclaimEntry | null {
  if (reclaim === undefined) return null;
  const entry = reclaim.entries.get(nodeId);
  if (entry === undefined) return null;
  return entry.effectiveAtBusinessMinute === null || atBusinessMinute >= entry.effectiveAtBusinessMinute
    ? entry
    : null;
}

/** The per-tick VOID INDEX: every node whose tombstone is armed at the
 *  minute, as a FROZEN map — null (NOT an empty map) when the book is
 *  absent, empty, or holds ZERO armed tombstones, the `isolatedNodeIds`
 *  zero-call posture verbatim: an idle book costs the six reads nothing and
 *  null tells the driver to thread nothing at all (byte-identity switch).
 *  Insertion order never leaks — consumers read membership by node id. */
export function reclaimIndex(
  reclaim: ReclaimBook | undefined,
  atBusinessMinute: SimMinute,
): ReadonlyMap<EntityId, ReclaimEntry> | null {
  if (reclaim === undefined || reclaim.entries.size === 0) return null;
  let live: Map<EntityId, ReclaimEntry> | null = null;
  for (const [nodeId, entry] of reclaim.entries) {
    if (entry.effectiveAtBusinessMinute !== null && atBusinessMinute < entry.effectiveAtBusinessMinute) {
      continue;
    }
    if (live === null) live = new Map<EntityId, ReclaimEntry>();
    live.set(nodeId, entry);
  }
  return live === null ? null : Object.freeze(live);
}
