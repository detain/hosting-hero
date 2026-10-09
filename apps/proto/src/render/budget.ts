/**
 * BudgetManager — the renderer's admission gate (§3.1, §4.7 item 1.9):
 * "Readability Budget as engine-enforced runtime caps … enforced by the
 * renderer, not by authoring discipline." Every renderer must ASK before
 * drawing; a refusal collapses into an aggregate "+N" cluster rather than
 * silently dropping information.
 *
 * Caps (WS-7 roster): ≤3 alert hues · 1 overlay · 5 event FX · 1 modal ·
 * ≤3 promoted clocks · ≤3 marked decisions · ≤3 inbox cards · labels capped
 * per altitude (30 at Z3 per §1.3), pinned exempt · ≤1200 whole-layer
 * substrate regions (ratified 2026-10-09, see `BUDGET_CAPS.substrate`).
 *
 * Pure TypeScript: no DOM, no Pixi — this whole file is unit-testable and the
 * ChromaMeter is just a viewer over `snapshot()`.
 */
import { isAlertHue, type AlertHue } from "./hues";

export type BudgetCategory =
  | "alertHue"
  | "overlay"
  | "eventFx"
  | "modal"
  | "promotedClock"
  | "markedDecision"
  | "inboxCard"
  | "label"
  | "substrate"; // whole-layer tilemap regions — plain metered, no special logic

export const BUDGET_CAPS: Readonly<Record<BudgetCategory, number>> = {
  alertHue: 3,
  overlay: 1,
  eventFx: 5,
  modal: 1,
  promotedClock: 3,
  markedDecision: 3,
  inboxCard: 3,
  label: 30, // fallback; the altitude table usually supplies the real cap
  /**
   * Substrate: max CONCURRENTLY LIVE whole-layer regions (one claim per
   * region, never per tile — render/substrate law 2). RATIFIED 2026-10-09
   * (calibration rec #16, docs/adr/0009-owner-ratifications-calibration.md
   * §3 "Substrate" row). The value mirrors the spike's QUAD_CAP_BY_ALTITUDE
   * .Z3 ceiling (30 label slots × 40 quads = 1200, pinned equal in
   * substrateField.test.ts): the spike measured a Z3 paint-fill at ≈46k
   * quads against the 1200 ceiling, which is exactly why the ratified row
   * carries the AUTHORED-PATCHES LAW — substrate arrives as authored patches
   * (per-rack idioms), never procedural flood-fill. See
   * apps/proto/src/render/substrate/README.md for the arithmetic.
   */
  substrate: 1200,
};

/** Label budget by camera altitude (§1.3: "30-label budget at Z3"; Z1 detail
 *  earns more, Z4 world-map earns fewer). */
export const LABEL_CAP_BY_ALTITUDE: Readonly<Record<"Z1" | "Z2" | "Z3" | "Z4", number>> = {
  Z1: 48,
  Z2: 36,
  Z3: 30,
  Z4: 12,
};

export interface AdmitRequest {
  /** Stable identity of the would-be draw (alert id, fx instance, label key). */
  readonly id: string;
  readonly category: BudgetCategory;
  /** 0 = background nicety, 100 = klaxon. Ties break by insertion order. */
  readonly priority: number;
  /** Required for `alertHue`; must be in the ledger's alert pool. */
  readonly hue?: string;
  /** Pinned draws are exempt from label caps and cannot be preempted. */
  readonly pinned?: boolean;
  /** Region for "+N" cluster addressing (screen zone / district id). */
  readonly region?: string;
  /** Altitude for label caps. */
  readonly altitude?: "Z1" | "Z2" | "Z3" | "Z4";
}

export type AdmitResult =
  | { readonly admitted: true; readonly evicted: readonly string[] }
  | { readonly admitted: false; readonly reason: RefusalReason; readonly clusterId: string };

export type RefusalReason =
  | "hue-budget" // new distinct alert hue beyond ≤3
  | "category-budget" // count cap reached (fx/overlay/clock/modal/…)
  | "label-budget" // altitude label cap reached
  | "no-preemption"; // refused and nothing evictable (pinned floor)

/** Admission-law violations — the render family's error shape
 *  (`family[CODE]: detail`, cf. PostChainError, SubstrateFieldError). */
export class BudgetError extends Error {
  constructor(code: string, detail: string) {
    super(`budget[${code}]: ${detail}`);
    this.name = "BudgetError";
  }
}

interface Claim {
  readonly request: AdmitRequest;
  readonly insertion: number;
}

/** The bar a newcomer must clear to preempt an existing draw. */
export const KLAXON_PRIORITY = 90;

export interface BudgetSnapshot {
  readonly used: Readonly<Record<BudgetCategory, number>>;
  readonly caps: Readonly<Partial<Record<BudgetCategory, number>>>;
  readonly activeHues: readonly AlertHue[];
  readonly clusters: Readonly<Record<string, number>>;
  readonly breach: boolean;
  readonly holders: readonly { readonly id: string; readonly category: BudgetCategory; readonly priority: number }[];
}

export class BudgetManager {
  private readonly claims = new Map<string, Claim>();
  private readonly clusters = new Map<string, number>();
  private insertion = 0;

  /** THE question every renderer asks before drawing.
   *
   *  Fail-loud law: a category outside `BUDGET_CAPS` is an AUTHORING BUG,
   *  never a silent admission. The closed `BudgetCategory` union is the
   *  compile-time fence; the guard below is its runtime twin — forged JSON
   *  strings, deliberate casts, or a JS consumer must not slip an unmetered
   *  draw through. (Before the guard: `count >= undefined` refused nothing
   *  and `snapshot().used` grew a NaN slot — the substrate spike's
   *  finding #3, since hardened.) */
  admit(request: AdmitRequest): AdmitResult {
    // Object.hasOwn, not `in` — a prototype key like "constructor" is not a
    // metered category either.
    if (!Object.hasOwn(BUDGET_CAPS, request.category)) {
      throw new BudgetError(
        "unknown-category",
        `'${request.category}' not in BUDGET_CAPS — widen the closed union or use an existing category`,
      );
    }
    if (this.claims.has(request.id)) {
      // Re-admitting a live claim is a refresh, never a second draw.
      return { admitted: true, evicted: [] };
    }
    const refusal = this.whyRefused(request);
    if (refusal === null) {
      this.claim(request);
      return { admitted: true, evicted: [] };
    }
    const evicted = this.evictWorstFor(request);
    if (evicted.length > 0) {
      this.claim(request);
      return { admitted: true, evicted };
    }
    const clusterId = this.clusterIdFor(request);
    this.clusters.set(clusterId, (this.clusters.get(clusterId) ?? 0) + 1);
    return { admitted: false, reason: refusal, clusterId };
  }

  release(id: string): void {
    this.claims.delete(id);
  }

  clear(): void {
    this.claims.clear();
    this.clusters.clear();
  }

  /** "+N" read for a cluster — what the renderer paints where it was refused. */
  clusterCount(clusterId: string): number {
    return this.clusters.get(clusterId) ?? 0;
  }

  snapshot(): BudgetSnapshot {
    const used: Record<BudgetCategory, number> = {
      alertHue: 0,
      overlay: 0,
      eventFx: 0,
      modal: 0,
      promotedClock: 0,
      markedDecision: 0,
      inboxCard: 0,
      label: 0,
      substrate: 0,
    };
    const hues = new Set<AlertHue>();
    const holders: { id: string; category: BudgetCategory; priority: number }[] = [];
    for (const { request } of this.claims.values()) {
      used[request.category] += 1;
      const hue = request.hue;
      if (request.category === "alertHue" && hue !== undefined && isAlertHue(hue)) {
        hues.add(hue);
      }
      holders.push({ id: request.id, category: request.category, priority: request.priority });
    }
    const clusters: Record<string, number> = {};
    for (const [id, count] of this.clusters) clusters[id] = count;
    const capEntries = Object.entries(BUDGET_CAPS) as [BudgetCategory, number][];
    const atCap = capEntries.some(([category]) => category !== "label" && used[category] >= BUDGET_CAPS[category]);
    return {
      used,
      caps: BUDGET_CAPS,
      activeHues: [...hues],
      clusters,
      breach: Object.keys(clusters).length > 0 || atCap,
      holders,
    };
  }

  /* ═══════════════════════════ internals ═══════════════════════════ */

  private whyRefused(request: AdmitRequest): RefusalReason | null {
    if (request.category === "alertHue") {
      const hue = request.hue ?? "";
      if (!isAlertHue(hue)) {
        throw new BudgetError(
          "off-ledger-hue",
          `"${hue}" is not in the Hue Ledger's alert pool — pick a ledger hue`,
        );
      }
      const activeHues = this.activeAlertHues();
      if (activeHues.has(hue)) return null; // shares a hue slot
      return activeHues.size >= BUDGET_CAPS.alertHue ? "hue-budget" : null;
    }
    if (request.category === "label") {
      const cap = this.labelCap(request);
      if (request.pinned === true) return null; // §1.3: "pinned exempt"
      const liveLabels = this.countCategory("label");
      return liveLabels >= cap ? "label-budget" : null;
    }
    const cap = BUDGET_CAPS[request.category];
    return this.countCategory(request.category) >= cap ? "category-budget" : null;
  }

  private activeAlertHues(): Set<AlertHue> {
    const hues = new Set<AlertHue>();
    for (const { request } of this.claims.values()) {
      if (request.category === "alertHue" && isAlertHue(request.hue ?? "")) hues.add(request.hue as AlertHue);
    }
    return hues;
  }

  private labelCap(request: AdmitRequest): number {
    return request.altitude === undefined ? BUDGET_CAPS.label : LABEL_CAP_BY_ALTITUDE[request.altitude];
  }

  private countCategory(category: BudgetCategory): number {
    let count = 0;
    for (const { request } of this.claims.values()) {
      if (request.category === category) count += 1;
    }
    return count;
  }

  /** Salience-lite preemption — KLAXON-ONLY (priority ≥ 90): a klaxon can
   *  out-prioritize the weakest live claim and steal its slot; ordinary
   *  alerts aggregate to "+N" instead of fighting (pinned holders are
   *  untouchable either way). */
  private evictWorstFor(request: AdmitRequest): string[] {
    if (request.priority < KLAXON_PRIORITY) return [];
    let worstId: string | null = null;
    let worst: Claim | null = null;
    for (const [id, claim] of this.claims) {
      if (claim.request.pinned === true) continue;
      if (claim.request.category !== request.category) continue;
      if (worst === null || claim.request.priority < worst.request.priority) {
        worst = claim;
        worstId = id;
      }
    }
    if (worst === null || worstId === null || request.priority <= worst.request.priority) {
      return [];
    }
    this.claims.delete(worstId);
    const displaced = this.clusterIdFor(worst.request);
    this.clusters.set(displaced, (this.clusters.get(displaced) ?? 0) + 1);
    return [worstId];
  }

  private clusterIdFor(request: AdmitRequest): string {
    return `${request.category}:${request.region ?? "global"}`;
  }

  private claim(request: AdmitRequest): void {
    this.insertion += 1;
    this.claims.set(request.id, { request, insertion: this.insertion });
  }
}

/** A shared singleton is the shape the spec demands ("BudgetManager is the
 *  singleton admission authority") — but the class stays constructible for
 *  tests and per-scene isolation. */
export const globalBudget = new BudgetManager();
