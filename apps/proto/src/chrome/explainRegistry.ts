/**
 * Explain-This-Number (§8.8) — the generic mechanism, chrome-owned.
 *
 * "Every figure on screen is clickable and opens a card showing its formula,
 * its inputs, and their provenance — and the INPUTS THEMSELVES are clickable,
 * recursively, until you hit a raw sim fact."
 *
 * The payload shape is g5's `ExplainPayload` (gates/g5/projection.ts),
 * imported TYPE-ONLY so nothing in chrome depends on gate code at runtime.
 * DEDUP CANDIDATE: this type wants a shared home (e.g.
 * `packages/sim-core/src/types.ts` or a `shared/explain.ts`) so g5's
 * projection adapter and chrome's registry stop cross-importing shapes —
 * noted for the orchestrator, not acted on (gates/** is off-limits here).
 *
 * Recursion wiring lives in `inputRefs`: an entry maps its payload's input
 * NAMES to child entry ids. A numeric display registers itself by id each
 * frame (upsert — values change), the popover steps in through the map, and
 * the trail guard stops cycles and runaway depth.
 */
import type { ExplainPayload } from "../gates/g5/projection";

export type { ExplainPayload, ExplainInput } from "../gates/g5/projection";

export interface ExplainEntry {
  readonly id: string;
  readonly payload: ExplainPayload;
  /** input name → child entry id, enabling recursive drill-down (§8.8). */
  readonly inputRefs?: Readonly<Record<string, string>>;
}

/** Hard ceiling on drill-down depth; beyond it the popover says so honestly. */
export const MAX_EXPLAIN_DEPTH = 6;

export class ExplainRegistry {
  private readonly entries = new Map<string, ExplainEntry>();

  /** Upsert: live figures re-register every frame with fresh inputs, so a
   *  collision is normal — the newest payload wins for the same id. */
  register(entry: ExplainEntry): void {
    if (entry.id.length === 0) {
      throw new Error("ExplainRegistry: entry with empty id");
    }
    this.entries.set(entry.id, entry);
  }

  lookup(id: string): ExplainEntry | undefined {
    return this.entries.get(id);
  }

  childIdFor(id: string, inputName: string): string | undefined {
    return this.entries.get(id)?.inputRefs?.[inputName];
  }

  unregister(id: string): void {
    this.entries.delete(id);
  }

  get size(): number {
    return this.entries.size;
  }

  clear(): void {
    this.entries.clear();
  }
}

/** One shared registry for the app; components register/unregister by id. */
export const globalExplain = new ExplainRegistry();

/* ═══════════════════════ recursion trail logic ═══════════════════════ */

export type TrailResult = { readonly ok: true; readonly trail: readonly string[] } | { readonly ok: false; readonly reason: "cycle" | "depth" };

/** Push a child onto the drill trail, refusing cycles (already-visited id)
 *  and depths past MAX_EXPLAIN_DEPTH. Pure: returns a NEW trail. */
export function stepIntoTrail(trail: readonly string[], childId: string): TrailResult {
  if (trail.includes(childId)) return { ok: false, reason: "cycle" };
  if (trail.length >= MAX_EXPLAIN_DEPTH) return { ok: false, reason: "depth" };
  return { ok: true, trail: [...trail, childId] };
}

/** Pop the last hop (the "back" control). Empty trail stays empty. */
export function stepBackTrail(trail: readonly string[]): readonly string[] {
  return trail.slice(0, -1);
}
