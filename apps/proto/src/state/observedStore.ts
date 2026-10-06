/**
 * ObservedStore — the single source for BOTH canvas and DOM halves (§4.7
 * component architecture: "one ObservedStore is the sole source for both
 * canvas and DOM"; CONVENTIONS §1.2: "hot sim state never enters reactive()
 * proxies; step-12 snapshots feed shallow refs").
 *
 * Therefore: `shallowRef<SimProjection|null>` only. The projection object is
 * treated as immutable — replacing the ref value, never touching fields — so
 * Vue never deep-walks maps of bigint cells.
 *
 * P0 note: deliberately Pinia-free (one store, one module); when the real
 * driver lands and multiple consumers need slices, promote this file to a
 * Pinia store with the identical read surface.
 */
import { shallowRef, computed, type ComputedRef, type Ref } from "vue";
import type { EntityId, ObservedKey } from "@hh/sim-core";
import { observedKey } from "@hh/sim-core";
import type { ProtoCell, SimProjection } from "../shared/protocol";
import { fixedToDisplay } from "../shared/protocol";

export const projection: Ref<SimProjection | null> = shallowRef<SimProjection | null>(null);
export const connectionState: Ref<"booting" | "live" | "faulted"> = shallowRef("booting");
export const lastFault: Ref<string | null> = shallowRef<string | null>(null);

/** The ONLY write path — called by the bridge's onProjection. */
export function ingestProjection(next: SimProjection): void {
  projection.value = next;
  connectionState.value = "live";
}

export function fault(message: string): void {
  connectionState.value = "faulted";
  lastFault.value = message;
}

/* ═══════════════════════════ read surface ═══════════════════════════ */

export function cell(entity: EntityId, property: string): ProtoCell | undefined {
  const p = projection.value;
  if (p === undefined || p === null) return undefined;
  return p.observed.get(observedKey(entity, property) as ObservedKey);
}

/** Display number for a fixed-typed cell; `null` means NO DATA and renders
 *  "?" downstream, never 0 (§4.1 R-66). */
export function fixedDisplay(entity: EntityId, property: string): number | null {
  const c = cell(entity, property);
  if (c === undefined || c.value === null) return null;
  if (typeof c.value !== "bigint") return null;
  return fixedToDisplay(c.value);
}

export function intDisplay(entity: EntityId, property: string): number | null {
  const c = cell(entity, property);
  if (c === undefined || c.value === null) return null;
  return typeof c.value === "number" ? c.value : null;
}

export const laneStats: ComputedRef<readonly import("@hh/sim-core").LaneStats[]> = computed(
  () => projection.value?.lanes ?? [],
);
