/**
 * §7.16 RESTART — the player-authored BOUNDED reboot with an optional queue
 * flush (v0, ADR-0016 successor program, lane L-RS).
 *
 * Home of the LAST unbuilt Act-row verb (hosting_game.md ~:28825: "every
 * object's inspector has an 'Act' row of at most four one-click emergency
 * verbs… drain, restart, isolate, shed"). Drain rides `disconnect-drain`,
 * shed rides `shed-load`, isolate became `isolate-node` (ADR-0015
 * @86cff89), throttle followed (ADR-0016 @81b0589) — this module lands
 * restart and closes the row. §7.5's reference durations (~:26741:
 * "restart a service **20s**") price it as a desk tap, and the card it
 * serves is operational truth everywhere (§2's memory-leak law ~:20211:
 * "Auto-restarting a service that leaks memory means you never diagnose" —
 * the flush is why a restart CLEARS, the bounded window is why you still
 * have to).
 *
 * THE LAW, in one sentence: while a reboot window is in force the node
 * admits NO new work (the fence leg — §(c) skips the whole admissions
 * channel, exactly the isolate posture), and with `dropQueued` the node's
 * ENTIRE waiting queue, including this tick's §(a) joins, is walked through
 * the EXISTED hard-ceiling shed channel every in-window tick (`defaults.ts`
 * §(c′), byte-for-byte the §(d) shape) — the reboot kills the BACKLOG,
 * never the RUNNING work. Occupied arms are untouched: §(b) releases run
 * BEFORE the flush leg, so work finishing at the reboot minute is SERVED,
 * not a casualty (completion-before-purge). At `release` the node admits
 * again, queue-empty. The shed walk rolls ZERO dice: flushed units resolve
 * through the R8 F-2 terminal PRESET branch (cause `outcome:<unitId>`,
 * event kind "bounced" naming the restarting node) — the same observable
 * shape a hard ceiling already produces under identical arithmetic, so
 * conservation is mechanical: every purged unit arrives as bounced, none
 * vanishes.
 *
 * WHY A DEFERRED WEDGE-STATE NOTE: a TRUE process kill would also evict
 * in-flight work — the running request dies mid-service. v0 deliberately
 * does NOT model that: evicting an occupied slot without a release leaves
 * `memberNodeOf` attributions and `UNIT_HOLD` entries pointing at a unit
 * the node no longer carries (a board-vs-attribution wedge the rec#5
 * ladder is designed to THROW on, not absorb), and inventing a silent
 * forced-release path would move ground truth the shed channel already
 * owns. The bounded window + queue flush gives the player the whole
 * operational promise ("clear the backlog, stop taking work, come back
 * clean") with zero new ledger shapes. The kill-in-flight arm stays
 * DEFERRED until the owner rules the forced-release semantics.
 *
 * THE RELEASE WINDOW: the reboot window is the fence's half-open
 * `[effective, release)` VERBATIM (no new grammar — one as-of discipline
 * across the minute-window books) — EXCEPT the release leg is REQUIRED:
 * a restart that never ends is structurally indistinguishable from
 * `isolate-node`, so the wire carries a plain `number` and null release is
 * STRUCTURAL garbage (M2 throws). The door refuses to fork the fence under
 * another name. Expired rows are KEPT as history witness, inert at read,
 * and the digest encodes them raw — the maintain/schedule/isolate/throttle
 * read-time expiry law; nothing is pruned.
 *
 * Default-off law: with no `GameState.restart` book — or an idle one — the
 * driver never calls `restartSets`, the two sets never reach the serve
 * input, and every shipped digest is byte-identical (pinned in
 * `__tests__/restart-consume.test.ts`).
 */

import type { EntityId, ReclaimEntry, RestartBook, RestartEntry, SimMinute } from "../types.ts";
import { voidedByTombstone } from "./reclaim.ts";

/** As-of law for ONE node's reboot — the `nodeIsolated`/`nodeThrottleCut`
 *  twin, widened by the value leg (the row itself, not a cut). In force at
 *  business minute `atBusinessMinute` iff:
 *
 *  - the book exists AND carries an entry for `nodeId`; and
 *  - the reboot is ARMED: `effectiveAtBusinessMinute === null` (law from the
 *    executing tick — same-tick pre-arm honored, the shield/isolate
 *    semantics VERBATIM) OR `atBusinessMinute >= effective` (a future stamp
 *    is armed but NOT yet law — the `PriceOverrideRecord` discipline); and
 *  - the reboot has NOT EXPIRED: `atBusinessMinute < releaseAtBusinessMinute`
 *    — the half-open `[eff, rel)` boundary, release STRICT (the null leg
 *    cannot exist: the door's wire type makes release REQUIRED, so a row
 *    that never ends is unrepresentable and this reader trusts its parse); and
 *  - the reboot is NOT RECLAIMED (ADR-0017 #3): when a live reclaim index is
 *    threaded and the window shipped AT OR BEFORE its node's tombstone, the
 *    destroy-and-rebuild cycle collected it — the scheduled reboot never
 *    fires (null at read) while the book keeps the row raw (history-witness
 *    posture VERBATIM). Omitted/null index ⇒ zero void checks, the
 *    pre-reclaim law exact.
 *
 *  Expired rows answer null here while remaining in the book (history
 *  witness, digest raw). Returns the LIVE entry — `dropQueued` is the
 *  flush-mode read. Pure; zero RNG. */
export function nodeRestartWindow(
  restart: RestartBook | undefined,
  nodeId: EntityId,
  atBusinessMinute: SimMinute,
  reclaims: ReadonlyMap<EntityId, ReclaimEntry> | null = null,
): RestartEntry | null {
  if (restart === undefined) return null;
  const entry = restart.entries.get(nodeId);
  if (entry === undefined) return null;
  const armed =
    entry.effectiveAtBusinessMinute === null ||
    atBusinessMinute >= entry.effectiveAtBusinessMinute;
  if (!armed) return null;
  if (atBusinessMinute >= entry.releaseAtBusinessMinute) return null;
  if (voidedByTombstone(entry.shippedAtTick, reclaims?.get(nodeId))) return null;
  return entry;
}

/** The two LIVE restart views at business minute `atBusinessMinute`, for
 *  the step-5 serve input:
 *
 *  - `fence` — EVERY live reboot node (drop and keep alike): the fence leg
 *    zeroes admissions; and
 *  - `drop` — the live reboot nodes whose mode is "drop": §(c′) flushes
 *    their queue through the shed channel each tick.
 *
 *  Either leg is `null` (NOT an empty set) when it has nothing to enforce —
 *  no book, an empty book, every row armed-not-yet/expired, every live row
 *  RECLAIMED (ADR-0017 #3 — a collected reboot never fires, costing the
 *  serve input nothing), or (for the drop leg) no live drop row — so the
 *  driver omits the corresponding
 *  `ServeInExt` key entirely and the serve input stays byte-identical to
 *  the unarmed run (idle book costs ZERO). `drop ⊆ fence` always. Frozen
 *  sets; insertion order is the book's key order and never leaks into
 *  semantics (consumption reads membership by id only). Pure; zero RNG. */
export function restartSets(
  restart: RestartBook | undefined,
  atBusinessMinute: SimMinute,
  reclaims: ReadonlyMap<EntityId, ReclaimEntry> | null = null,
): { readonly fence: ReadonlySet<EntityId> | null; readonly drop: ReadonlySet<EntityId> | null } {
  let fence: Set<EntityId> | null = null;
  let drop: Set<EntityId> | null = null;
  if (restart !== undefined) {
    for (const [nodeId, entry] of restart.entries) {
      if (nodeRestartWindow(restart, nodeId, atBusinessMinute, reclaims) === null) continue;
      if (fence === null) fence = new Set<EntityId>();
      fence.add(nodeId);
      if (!entry.dropQueued) continue;
      if (drop === null) drop = new Set<EntityId>();
      drop.add(nodeId);
    }
  }
  return Object.freeze({
    fence: fence === null ? null : Object.freeze(fence),
    drop: drop === null ? null : Object.freeze(drop),
  });
}
