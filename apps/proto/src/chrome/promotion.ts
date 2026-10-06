/**
 * Threshold-promotion planning for the top bar (§1.4 HUD law):
 * "cash/MRR/reputation/clock permanent; 2 slots promote nearest-threshold
 * metrics; per-line gauge slot pinned; manual override."
 *
 * Pure decision function — the Vue TopBar renders whatever plan comes back,
 * and BudgetManager's promotedClock cap is enforced by the CALLER asking the
 * budget before mounting each promoted instrument (renderers ask, chrome too).
 */

export type MetricKind = "permanent" | "promotable";
export type BreachDirection = "up" | "down"; // which side breaches

export interface MetricCandidate {
  readonly id: string;
  readonly label: string;
  readonly kind: MetricKind;
  /** Current display value; null = NO DATA — an unmeasured metric never
   *  earns a promoted slot (it gets "?", not the dial). */
  readonly value: number | null;
  /** Breach threshold; null = informational, not promotable by proximity. */
  readonly threshold: number | null;
  readonly direction: BreachDirection;
  /** Scale hint for normalizing distance (e.g. 100 for percents). */
  readonly span: number;
  /** Manual override: user pinned this into a slot (counts toward capacity). */
  readonly userPinned?: boolean;
}

export interface PromotionPlan {
  readonly permanent: readonly MetricCandidate[];
  readonly promoted: readonly MetricCandidate[];
  /** Promotable candidates that wanted a slot but didn't get one — the UI
   *  shows them as a "+N" collapse, never silently dropped. */
  readonly collapsedCount: number;
}

export interface PromotionOptions {
  /** Promoted slots available in the top bar (law: 2). */
  readonly promotedSlots: number;
}

/** Normalized distance-to-breach: 0 = on the knife edge, 1 = comfortably far.
 *  Negative (already breached) clamps to 0 — a breach is maximally near. */
export function distanceToBreach(metric: MetricCandidate): number {
  if (metric.value === null || metric.threshold === null) return Infinity;
  const signed =
    metric.direction === "up"
      ? metric.threshold - metric.value
      : metric.value - metric.threshold;
  const normalized = signed / Math.abs(metric.span || 1);
  return Math.max(0, Math.min(1, normalized));
}

/** Deterministic plan: permanents pass through untouched; user pins take
 *  slots first; the rest fill by nearest-threshold, ties broken by candidate
 *  order (stable — never by object identity or map iteration luck). */
export function planPromotion(
  candidates: readonly MetricCandidate[],
  options: PromotionOptions,
): PromotionPlan {
  if (options.promotedSlots < 0) {
    throw new Error(`planPromotion: promotedSlots must be ≥0, got ${options.promotedSlots}`);
  }
  const permanent = candidates.filter((c) => c.kind === "permanent");
  const promotable = candidates.filter((c) => c.kind === "promotable");

  const pinned = promotable.filter((c) => c.userPinned === true);
  const freeSlots = Math.max(0, options.promotedSlots - pinned.length);

  const byProximity = promotable
    .filter((c) => c.userPinned !== true)
    .map((metric, order) => ({ metric, order, distance: distanceToBreach(metric) }))
    .filter((entry) => Number.isFinite(entry.distance))
    .sort((a, b) => a.distance - b.distance || a.order - b.order)
    .map((entry) => entry.metric);

  const promoted = [...pinned, ...byProximity].slice(0, options.promotedSlots);
  const wanted = pinned.length + byProximity.length;
  return {
    permanent,
    promoted,
    collapsedCount: Math.max(0, wanted - promoted.length),
  };
}

export type PinOutcome = "pinned" | "unpinned" | "capacity-refused";

export interface PinResult {
  readonly candidates: readonly MetricCandidate[];
  readonly outcome: PinOutcome;
}

/**
 * Manual override (§1.4), pure: flip `userPinned` on one promotable.
 * A pin is REFUSED when the slots are already full of other users' pins —
 * the law pins first, so a fifth pin past capacity would silently evict
 * someone else's choice, which is the player's decision to make, not ours.
 * Permanents and unknown ids fail loudly.
 */
export function toggleUserPin(
  candidates: readonly MetricCandidate[],
  id: string,
  options: PromotionOptions,
): PinResult {
  const target = candidates.find((c) => c.id === id);
  if (target === undefined) throw new Error(`toggleUserPin: unknown metric "${id}"`);
  if (target.kind !== "promotable") {
    throw new Error(`toggleUserPin: "${id}" is ${target.kind} — permanents cannot be unpinned`);
  }
  if (target.userPinned === true) {
    return {
      candidates: candidates.map((c) => (c.id === id ? { ...c, userPinned: false } : c)),
      outcome: "unpinned",
    };
  }
  const pinsElsewhere = candidates.filter((c) => c.userPinned === true && c.id !== id).length;
  if (pinsElsewhere >= options.promotedSlots) {
    return { candidates, outcome: "capacity-refused" };
  }
  return {
    candidates: candidates.map((c) => (c.id === id ? { ...c, userPinned: true } : c)),
    outcome: "pinned",
  };
}
