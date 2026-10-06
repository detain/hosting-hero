/**
 * `observed_view(seat)` — the per-consumer projection (MASTER_REPORT §3.1
 * laws 1–2, §2.2 R-4 co-op law, §4.7 "the observed layer is per-consumer,
 * not per-session").
 *
 *   observed_view(consumer) = project(ground_truth, instrumentation_state, consumer_scope)
 *
 * …implemented HERE, inside the core, as a pure function over ObservedStore
 * state — so it is replay-re-derivable (law 2) and leak-auditable by testing
 * the function itself, "not network filtering afterthought". Co-op NOC's hard
 * rule "no player may ever see the whole board" becomes a protocol invariant:
 * a seat's projection is a NEW map built only from in-scope keys; out-of-scope
 * properties are absent even as known-unknowns, so a seat cannot infer what
 * other seats hold. Ground truth is structurally unreachable from here too —
 * this module only ever touches the store's public fog-filtered API (law 1:
 * "everything visible is projection").
 *
 * Day-1 stub discipline (OD-5(b) portable-lib alignment): ONE code path for
 * every consumer kind — SP's local seat, renderer, policy interpreter and a
 * future MP Node host all call `observedView`. Per-seat salience/aggregate
 * pruning (the streaming wire-granularity decision §8 RISK-6) layers on top
 * later without changing this signature.
 */

import type { Branded, EntityId, ObservedCell, ObservedKey } from "../types.ts";
import { observedKey } from "../types.ts";
import type { ScopedReadView } from "./index.ts";
import {
  ObservedStore,
  parseKeyEntity,
  parseKeyProperty,
  type FairnessChannel,
} from "./store.ts";

/* ═══════════════════ Seats & scopes ═══════════════════ */

export type SeatId = Branded<string, "SeatId">;

export function asSeatId(raw: string): SeatId {
  if (raw.length === 0) throw new Error("asSeatId: empty seat id");
  return raw as SeatId;
}

/** Declarative, serializable scope (a function-typed scope would be
 *  replay-hostile and unauditable). `entities: "all"` = the whole estate
 *  (single-seat SP / renderer consumer); otherwise only the listed entities.
 *  `properties` narrows further within the entity selection. */
export interface SeatScope {
  readonly seat: SeatId;
  readonly entities: readonly EntityId[] | "all";
  readonly properties: readonly string[] | "all";
}

/** Whole-estate scope — the degenerate single-observer case SP runs today. */
export function estateScope(seat: SeatId): SeatScope {
  return { seat, entities: "all", properties: "all" };
}

/** Scope a seat to whole named machines (co-op NOC: network-seat owns the
 *  edge fleet, app-seat owns the DB tier). */
export function entityScope(seat: SeatId, entities: readonly EntityId[]): SeatScope {
  return { seat, entities, properties: "all" };
}

/** Scope a seat to named properties estate-wide (the Analyst: metrics of
 *  everything, topology of nothing). */
export function propertyScope(seat: SeatId, properties: readonly string[]): SeatScope {
  return { seat, entities: "all", properties };
}

export function isPropertyInScope(scope: SeatScope, entity: EntityId, property: string): boolean {
  if (scope.entities !== "all" && !scope.entities.includes(entity)) return false;
  if (scope.properties !== "all" && !scope.properties.includes(property)) return false;
  return true;
}

export function isKeyInScope(scope: SeatScope, key: ObservedKey): boolean {
  return isPropertyInScope(scope, parseKeyEntity(key), parseKeyProperty(key));
}

/* ═══════════════════ Consumers ═══════════════════ */

/** Who is looking (§3.1: consumer ∈ seats, local-player, renderer,
 *  policy-interpreter, headless-analyst — all through this one seam). */
export type ObserverKind =
  | "seat"
  | "local-player"
  | "renderer"
  | "policy-interpreter"
  | "headless-analyst";

export interface Consumer {
  readonly kind: ObserverKind;
  readonly scope: SeatScope;
}

/* ═══════════════════ Projection ═══════════════════ */

/** Build one consumer's visible map. Deterministic: the result is a pure
 *  function of (store state, scope) — same seed, same batches, same bytes.
 *
 *  Rules:
 *   - in-scope instrumented keys → their fog-filtered cells;
 *   - in-scope KNOWN-but-unseen keys → the canonical unknown cell (the
 *     known-unknown "?" that the HUD budgets against) — visible because fog
 *     is over state, never over existence WITHIN the seat's scope;
 *   - fairness-channel keys (Site Preview / Pulse Strip) → the always-truth
 *     reading, STILL scope-filtered: bounded fog exempts degradation, never
 *     scoping (co-op leak tests pin exactly this);
 *   - out-of-scope keys → ABSENT, in every form, including existence. */
export function projectSeat(store: ObservedStore, scope: SeatScope): ScopedReadView {
  const projected = new Map<ObservedKey, ObservedCell<unknown>>();

  for (const entity of store.knownEntities()) {
    if (!scopeIncludesEntity(scope, entity)) continue;
    for (const property of store.propertiesOf(entity)) {
      const key = observedKey(entity, property);
      if (!isPropertyInScope(scope, entity, property)) continue;
      const channel = store.fairnessChannelOf(key);
      if (channel !== null) {
        projected.set(key, truthReadingFor(store, key, channel));
        continue;
      }
      projected.set(key, store.read(key));
    }
  }
  return projected;
}

/** The single entry point every consumer takes (law 1: everything visible
 *  is projection — the renderer, the rules, and every remote seat). */
export function observedView(store: ObservedStore, consumer: Consumer): ScopedReadView {
  return projectSeat(store, consumer.scope);
}

/* ═══════════════════ Internals ═══════════════════ */

function scopeIncludesEntity(scope: SeatScope, entity: EntityId): boolean {
  return scope.entities === "all" || scope.entities.includes(entity);
}

// Keys are rebuilt through observedKey() — the contract's canonical builder —
// so "::"-containing properties round-trip safely (friction note: types.ts
// exports no parser; parseKeyEntity/parseKeyProperty in store.ts are the
// documented inverse pair).

const CHANNEL_METHODS: Record<FairnessChannel, (store: ObservedStore, key: ObservedKey) => ObservedCell<unknown>> = {
  "site-preview": (store, key) => store.sitePreview(key),
  "pulse-strip": (store, key) => store.pulseStrip(key),
};

function truthReadingFor(store: ObservedStore, key: ObservedKey, channel: FairnessChannel): ObservedCell<unknown> {
  return CHANNEL_METHODS[channel](store, key);
}
