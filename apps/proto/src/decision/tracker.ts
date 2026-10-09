/**
 * DecisionTracker — the markedDecision budget CONSUMER (§7.6 × §3.1).
 *
 * BudgetManager ships `markedDecision: 3` ("at most three things marked as
 * decisions"). This class is the seam between the pure ranking in annotate.ts
 * and that cap: every frame it (1) releases superseded claims BEFORE admitting
 * so a re-stamped twin never jams its own slot, (2) asks `admit()` for each
 * candidate best-first, (3) reports the refused tail as an honest overflow
 * count — the "+N" of the readability-budget law, never a silent drop.
 *
 * Because every priority here stays BELOW `KLAXON_PRIORITY` (90), the
 * preemption path can never fire for decisions: contention resolves to
 * refusal + cluster, the same law the post-chain adopted (post[category-
 * budget] keeps the previous holder; here the rail shows "+N").
 *
 * Lifecycle:
 *  - CLAIM    — `onFrame` admits the ranked candidates (cap 3).
 *  - SUPERSEDE — a claim id absent from the frame's wanted-set is released
 *                (window closed, condition cleared, or the delta re-stamped).
 *  - CONSUME  — `acknowledge(id)` releases the slot AND blacklists the id:
 *                the player answered "what am I being asked" for that fork;
 *                re-marking it next frame would be nagging, not legibility.
 *
 * No timers, no Vue, no singleton — the BudgetManager arrives as a port so
 * tests run on a fresh manager and the app wires `globalBudget`.
 */
import type { AdmitResult, BudgetManager } from "../render/budget";
import { KLAXON_PRIORITY } from "../render/budget";
import {
  deriveDecisionCandidates,
  type DecisionAnnotation,
  type DecisionFrame,
} from "./annotate";

/** Region tag for "+N" cluster addressing (ChromaMeter reads the cluster). */
export const DECISION_CLUSTER_REGION = "decision-rail";

/** Base claim priority. Under klaxon (90), over post-chain effects (≤50):
 *  decisions are chrome-voice, not scream-voice. */
export const DECISION_PRIORITY_BASE = 60;
export const DECISION_PRIORITY_STEP = 10;
export const DECISION_PRIORITY_FLOOR = 30;

/** rank 0 → 60, rank 1 → 50, … clamped at 30; always < KLAXON_PRIORITY. */
export function priorityForRank(rank: number): number {
  if (!Number.isInteger(rank) || rank < 0) {
    throw new RangeError(`priorityForRank: rank must be a non-negative integer, got ${rank}`);
  }
  return Math.max(DECISION_PRIORITY_FLOOR, DECISION_PRIORITY_BASE - rank * DECISION_PRIORITY_STEP);
}

/** Claim-id namespace so a decision can never collide with another surface's
 *  id in the flat BudgetManager claims map. */
export function decisionClaimId(annotationId: string): string {
  return `decision:${annotationId}`;
}

export interface DecisionFrameResult {
  /** Admitted annotations, best-first (≤ BUDGET_CAPS.markedDecision). */
  readonly held: readonly DecisionAnnotation[];
  /** This frame's candidates that wanted a slot and did not get one — the
   *  rail renders "+N" from THIS number (current truth), while the manager's
   *  cluster keeps its cumulative ledger for the ChromaMeter. */
  readonly overflow: number;
  /** Ids released because this frame no longer wants them (supersession). */
  readonly released: readonly string[];
}

export class DecisionTracker {
  private readonly budget: BudgetManager;
  private heldIds = new Set<string>();
  private readonly consumed = new Set<string>();
  private last: DecisionFrameResult;

  constructor(budget: BudgetManager) {
    this.budget = budget;
    this.last = Object.freeze({ held: [], overflow: 0, released: [] });
  }

  /** Feed one frame transition. Idempotent per (prev,next) pair is NOT
   *  promised — callers advance prev monotonically, like the runner does. */
  onFrame(frame: DecisionFrame): DecisionFrameResult {
    // A re-delivered frame is NOT news: re-running it would supersede every
    // held claim (the deriver returns no candidates for a same-seq pair),
    // which is the opposite of legibility. Return the standing view.
    if (frame.prev !== null && frame.prev.seq === frame.next.seq) return this.last;
    const candidates = deriveDecisionCandidates(frame).filter(
      (c) => !this.consumed.has(c.id),
    );
    const wanted = new Set(candidates.map((c) => c.id));

    // Supersede first: a re-stamped twin must not fight its own predecessor
    // for the slot it is about to take.
    const released: string[] = [];
    for (const id of this.heldIds) {
      if (wanted.has(id)) continue;
      this.budget.release(decisionClaimId(id));
      released.push(id);
    }

    const held: DecisionAnnotation[] = [];
    let overflow = 0;
    for (const candidate of candidates) {
      const result: AdmitResult = this.budget.admit({
        id: decisionClaimId(candidate.id),
        category: "markedDecision",
        priority: priorityForRank(candidate.rank),
        region: DECISION_CLUSTER_REGION,
      });
      if (result.admitted) held.push(candidate);
      else overflow += 1;
    }

    this.heldIds = new Set(held.map((c) => c.id));
    this.last = Object.freeze({
      held: Object.freeze(held),
      overflow,
      released: Object.freeze(released),
    });
    return this.last;
  }

  /** The player answered the fork: release the slot, never re-mark this id.
   *  Returns false for ids the rail is not currently holding (double-ack,
   *  stale click after supersession) — refusal is silent-but-reported, the
   *  way toggleUserPin reports capacity-refused. */
  acknowledge(id: string): boolean {
    if (!this.heldIds.has(id)) return false;
    this.budget.release(decisionClaimId(id));
    this.heldIds.delete(id);
    this.consumed.add(id);
    this.last = Object.freeze({
      ...this.last,
      held: Object.freeze(this.last.held.filter((c) => c.id !== id)),
    });
    return true;
  }

  /** Latest frame view without re-running the budget (renderers read this). */
  get current(): DecisionFrameResult {
    return this.last;
  }

  /** All-tracker teardown: free every claim this session made. Consumed ids
   *  survive — the point of consuming is that the same fork does not come
   *  back to claw the slot later in the session. */
  dispose(): void {
    for (const id of this.heldIds) this.budget.release(decisionClaimId(id));
    this.heldIds = new Set();
    this.last = Object.freeze({ held: [], overflow: 0, released: [] });
  }
}
