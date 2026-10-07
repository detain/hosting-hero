/**
 * Alert Stack (§8.8 left rail) — pure grouping, triage, and fatigue math.
 *
 * "Newest top, grouped by object AND cause, sorted by severity… the fix is
 * ack / snooze / silence — with SILENCED ALERTS STILL VISIBLE, greyed: the
 * thing that killed you was silenced three weeks ago."
 *
 * Signal-to-noise bar = fraction of alerts the player has acted on (ack or
 * silence). As it FALLS below thresholds the whole stack renders DIMMER and
 * shows fewer rows — but never fewer than one, and every hidden row remains
 * reachable through the expandable "N suppressed by fatigue" count (the
 * fairness contract: suppression is visible, never silent).
 */
import type { EventNotice, NoticeKind } from "../shared/protocol";
import { compareCodeUnits } from "./textLaw";

export type AlertSeverity = 1 | 2 | 3; // 1 = stops the show
export type AlertStatus = "new" | "acked" | "snoozed" | "silenced";

/** Severity vocabulary — chrome's reading of the seven notice kinds. */
export const ALERT_SEVERITY: Readonly<Record<NoticeKind, AlertSeverity>> = Object.freeze({
  landed: 1,
  bounce: 2,
  "false-positive": 2,
  "intent-refused": 2, // your own command bouncing IS your business
  "arrival-surge": 3,
  "rule-fired": 3,
  "intent-executed": 3,
});

export interface StackAlert {
  /** Group key: kind + object (§8.8 "grouped by object and cause"). */
  readonly key: string;
  readonly kind: NoticeKind;
  readonly laneId: string | null;
  readonly severity: AlertSeverity;
  /** First/last occurrence — grouping folds repeats into one row. */
  readonly firstAtUs: bigint;
  readonly lastAtUs: bigint;
  readonly occurrences: number;
  readonly status: AlertStatus;
  /** Business-clock tick until which a snooze holds (status "snoozed"). */
  readonly snoozedUntilMinute: number | null;
  readonly sampleDetail?: string;
}

export interface AlertStackState {
  readonly alerts: readonly StackAlert[];
  /** Actionable alerts since the last triage pass, for the SNR denominator. */
  readonly totalRaised: number;
}

export const EMPTY_STACK: AlertStackState = { alerts: [], totalRaised: 0 };

export function alertKey(kind: NoticeKind, laneId: string | null): string {
  return `${kind}@${laneId ?? "global"}`;
}

/** Fold this frame's notices into the stack (pure; returns a NEW state).
 *  Re-ingesting the SAME projection is idempotent: a notice stamp already
 *  recorded as the group's lastAtUs folds to zero extra occurrences. */
export function ingestNotices(
  state: AlertStackState,
  notices: readonly EventNotice[],
): AlertStackState {
  if (notices.length === 0) return state;
  const byKey = new Map(state.alerts.map((a) => [a.key, a]));
  let totalRaised = state.totalRaised;
  for (const notice of notices) {
    const key = alertKey(notice.kind, notice.laneId);
    const existing = byKey.get(key);
    if (existing === undefined) {
      const alert: StackAlert = {
        key,
        kind: notice.kind,
        laneId: notice.laneId,
        severity: ALERT_SEVERITY[notice.kind],
        firstAtUs: notice.atUs,
        lastAtUs: notice.atUs,
        occurrences: 1,
        status: "new",
        snoozedUntilMinute: null,
        ...(notice.detail === undefined ? {} : { sampleDetail: notice.detail }),
      };
      byKey.set(key, alert);
      totalRaised += 1;
      continue;
    }
    if (notice.atUs === existing.lastAtUs) continue; // same frame re-ingested
    // Fold the repeat; a previously-triaged group that flares again is new news.
    const relapsed = existing.status !== "new";
    byKey.set(key, {
      ...existing,
      lastAtUs: notice.atUs > existing.lastAtUs ? notice.atUs : existing.lastAtUs,
      firstAtUs: notice.atUs < existing.firstAtUs ? notice.atUs : existing.firstAtUs,
      occurrences: existing.occurrences + 1,
      status: relapsed ? "new" : existing.status,
      snoozedUntilMinute: relapsed ? null : existing.snoozedUntilMinute,
    });
  }
  return { alerts: [...byKey.values()], totalRaised };
}

function setStatus(state: AlertStackState, key: string, status: AlertStatus, untilMinute: number | null = null): AlertStackState {
  const found = state.alerts.some((a) => a.key === key);
  if (!found) throw new Error(`alert triage: unknown key "${key}"`);
  return {
    ...state,
    alerts: state.alerts.map((a) =>
      a.key === key ? { ...a, status, snoozedUntilMinute: status === "snoozed" ? untilMinute : null } : a,
    ),
  };
}

export const ackAlert = (state: AlertStackState, key: string): AlertStackState => setStatus(state, key, "acked");
export const silenceAlert = (state: AlertStackState, key: string): AlertStackState => setStatus(state, key, "silenced");
export const reopenAlert = (state: AlertStackState, key: string): AlertStackState => setStatus(state, key, "new");
export const snoozeAlert = (state: AlertStackState, key: string, untilMinute: number): AlertStackState =>
  setStatus(state, key, "snoozed", untilMinute);

/** Snooze expiry: a pure pass the caller runs each frame; expired snoozes
 *  return to "new" (a snoozed alert that came back unhandled is loud again). */
export function releaseExpiredSnoozes(state: AlertStackState, minute: number): AlertStackState {
  let changed = false;
  const alerts = state.alerts.map((a) => {
    if (a.status !== "snoozed" || a.snoozedUntilMinute === null || a.snoozedUntilMinute > minute) return a;
    changed = true;
    return { ...a, status: "new" as AlertStatus, snoozedUntilMinute: null };
  });
  return changed ? { ...state, alerts } : state;
}

/* ═══════════════════════ signal-to-noise & layout ═══════════════════════ */

/** Fraction of raised alert GROUPS the player has acted on (ack/silence).
 *  An empty stack is 1 — nothing is crying unheard. */
export function signalToNoise(state: AlertStackState): number {
  if (state.totalRaised === 0) return 1;
  const actioned = state.alerts.filter((a) => a.status === "acked" || a.status === "silenced").length;
  return actioned / state.totalRaised;
}

/** Screen-budget cap (§8.8 max 4 visible, then +N). */
export const MAX_VISIBLE_ALERTS = 4;

const SNR_THRESHOLDS: readonly [number, number][] = [
  [0.7, 4],
  [0.4, 3],
  [0.2, 2],
];

/** Fatigue law: healthy SNR shows the full 4; as the player ignores the
 *  stack, it shrinks to 3/2/1 — dimmer, smaller, never invisible. */
export function effectiveVisibleCount(snr: number): number {
  if (!(snr >= 0) || snr > 1) throw new RangeError(`effectiveVisibleCount: snr out of 0–1: ${snr}`);
  for (const [floorValue, cap] of SNR_THRESHOLDS) {
    if (snr >= floorValue) return cap;
  }
  return 1;
}

export interface AlertStackLayout {
  /** Rows to render, newest first (§8.8 "newest top"), severity then recency. */
  readonly rows: readonly StackAlert[];
  /** Visible rows carrying a triaged status → rendered greyed, still present. */
  readonly greyedCount: number;
  /** Rows the cap or an active snooze is holding back — expandable, listed. */
  readonly suppressed: readonly StackAlert[];
  /** Below this SNR the whole stack gets the grey wash. */
  readonly dimmed: boolean;
  readonly snr: number;
  readonly maxVisible: number;
}

export const FATIGUE_DIM_THRESHOLD = 0.4;

/** §8.8 order: severity ascending (1 first), then recency descending,
 *  then key — deterministic, no map-iteration luck, no locale collation
 *  (code-unit tiebreak, the same order the sim canonical sort uses). */
export function sortAlerts(alerts: readonly StackAlert[]): readonly StackAlert[] {
  return [...alerts].sort(
    (a, b) => a.severity - b.severity || (b.lastAtUs < a.lastAtUs ? -1 : b.lastAtUs > a.lastAtUs ? 1 : 0) || compareCodeUnits(a.key, b.key),
  );
}

export function layoutStack(state: AlertStackState): AlertStackLayout {
  const snr = signalToNoise(state);
  const maxVisible = effectiveVisibleCount(snr);
  const sorted = sortAlerts(state.alerts);
  const active = sorted.filter((a) => a.status !== "snoozed");
  const snoozed = sorted.filter((a) => a.status === "snoozed");
  const rows = active.slice(0, maxVisible);
  const capped = active.slice(maxVisible);
  return {
    rows,
    greyedCount: rows.filter((a) => a.status !== "new").length,
    suppressed: [...snoozed, ...capped],
    dimmed: snr < FATIGUE_DIM_THRESHOLD && state.alerts.length > 0,
    snr,
    maxVisible,
  };
}
