/**
 * `@hh/sim-core/src/observed` — ground/observed twins, the step-12 single
 * writer store, the instrumentation model, and the per-consumer
 * `observed_view(seat)` projection (MASTER_REPORT §3.1, §4.1 R-66…R-72,
 * hosting_game.md §7.6 / §7.13 step 12).
 *
 * Import law for this directory: `../types` + `../kernel/*` only.
 *
 * ─── THE PROJECTION LAW (design §7.6 "the map is not the territory",
 * ratified as §3.1 laws 1–2) ─────────────────────────────────────────────
 *
 *   Seats get PROJECTIONS, never the store.
 *
 * `ObservedStore` (store.ts) is an ENGINE-INTERNAL object: it holds the
 * ground twin, the watermark, and the only write path
 * (`applyObservedWrites`). Nothing outside the 12-step pipeline may hold
 * one — a seat, a renderer, a policy interpreter or a remote co-op player
 * receives a `ScopedReadView`: an already-fog-filtered, already
 * scope-projected, read-only snapshot produced by `projectSeat`/
 * `observedView` (view.ts). The distinction is load-bearing, not
 * stylistic:
 *
 *  1. The store's public reads are key-addressed — a consumer that could
 *     enumerate it could probe for out-of-scope EXISTENCE, breaking the
 *     co-op NOC rule "no player may ever see the whole board". The view
 *     has pre-filtered keys; out-of-scope properties are absent there.
 *  2. The store mutates with every step-12 batch; a view is a frozen
 *     point-in-time value, safe to ship over a wire, cache in a UI atom,
 *     or hand to replay-adjacent tooling without aliasing live state.
 *  3. Ground truth is structurally unreachable from a view (it is a Map
 *     of cells), and unreachable from outside the store's twin (private
 *     `#ground`); the two together are why "everything visible is
 *     projection" is an invariant, not a convention.
 *
 * If your code is reaching for `new ObservedStore()` outside the pipeline
 * host or step 12, the correct object is `ScopedReadView` instead.
 */

import type { ObservedCell, ObservedKey } from "../types.ts";

/** A seat's ENTIRE world: the fog-filtered, scope-projected cell snapshot
 *  returned by `projectSeat`/`observedView`. Type-level documentation of
 *  the projection law — consumers accept this, never `ObservedStore`. */
export type ScopedReadView = ReadonlyMap<ObservedKey, ObservedCell<unknown>>;

export * from "./instrument.ts";
export * from "./store.ts";
export * from "./view.ts";
