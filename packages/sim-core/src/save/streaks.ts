/**
 * Uptime streaks — ONE shared cross-mode counter set (L9, Appendix C
 * `streaks_shared`). The streak is the meta-economy's spine: financing rates,
 * enterprise eligibility, insurance premiums and hiring all read it — as
 * DATA REFS, never by reaching into mode-local state (WS-6 R5: streak rows
 * are hash-chained server-side because they are shared; locally they are one
 * object with many readers).
 *
 * Law encoded here:
 *  - the counter lives at the SAVE ROOT, not per node, not per mode;
 *  - consumers receive a `StreakDataRef` (a structural data pointer) so no
 *    hook can hold a mutable copy — every read goes through `readStreak`;
 *  - breaking a streak is an EVENT: current resets, longest survives,
 *    `lastEraseAtTick` stamps the whiteboard's erase-animation moment (L9).
 */

import type { CauseId, SimTick } from "../types.ts";
import { fail } from "./errors.ts";

export type StreakKind = "uptime" | "no_data_loss" | "no_security" | "no_missed_backup";

export const STREAK_KINDS: readonly StreakKind[] = ["uptime", "no_data_loss", "no_security", "no_missed_backup"];

export interface StreakCounter {
  readonly current: number;
  readonly longest: number;
  /** Tick of the last erase ("Days Since Last Outage" whiteboard anchor). */
  readonly lastEraseAtTick: SimTick | null;
}

export interface SharedStreaks {
  readonly uptime: StreakCounter;
  readonly noDataLoss: StreakCounter;
  readonly noSecurity: StreakCounter;
  readonly noMissedBackup: StreakCounter;
}

/* ═══════════════════════ construction & access ═══════════════════════ */

function zeroCounter(): StreakCounter {
  return { current: 0, longest: 0, lastEraseAtTick: null };
}

export function emptyStreaks(): SharedStreaks {
  return { uptime: zeroCounter(), noDataLoss: zeroCounter(), noSecurity: zeroCounter(), noMissedBackup: zeroCounter() };
}

const STREAK_FIELD: Readonly<Record<StreakKind, keyof SharedStreaks>> = {
  uptime: "uptime",
  no_data_loss: "noDataLoss",
  no_security: "noSecurity",
  no_missed_backup: "noMissedBackup",
};

/** THE single reader: every consumer (financing, eligibility, insurance,
 *  hiring, HUD) resolves through here, so there is exactly one truth. */
export function readStreak(streaks: SharedStreaks, ref: StreakDataRef): StreakCounter {
  if (ref.facet !== "streaks_shared") fail(`readStreak: ref targets facet "${ref.facet}", not the shared streak set`);
  return streaks[STREAK_FIELD[ref.kind]];
}

/* ═══════════════════════ DATA REFS (hook contract) ═══════════════════════ */

/** A pointer, not a value — financing/eligibility hooks are configured with
 *  refs and resolve them at evaluation time against the root counters. */
export interface StreakDataRef {
  readonly facet: "streaks_shared";
  readonly kind: StreakKind;
}

export function streakDataRef(kind: StreakKind): StreakDataRef {
  return { facet: "streaks_shared", kind };
}

/** Declarative consumer: "financing wants ≥ N of streak X". Data all the way
 *  down — a serializable row an economy module evaluates without importing
 *  save logic (the ref resolves via readStreak). */
export interface StreakEligibilityHook {
  readonly hookId: string; // e.g. "financing:series-b-terms"
  readonly requires: StreakDataRef;
  readonly minCurrent: number;
}

export function hookSatisfied(streaks: SharedStreaks, hook: StreakEligibilityHook): boolean {
  return readStreak(streaks, hook.requires).current >= hook.minCurrent;
}

/* ═══════════════════════ mutation (pure replacements) ═══════════════════════ */

/** One clean tick/unit landed: current grows, longest tracks the max. */
export function advanceStreak(streaks: SharedStreaks, kind: StreakKind): SharedStreaks {
  const field = STREAK_FIELD[kind];
  const counter = streaks[field];
  const current = counter.current + 1;
  return { ...streaks, [field]: { ...counter, current, longest: Math.max(current, counter.longest) } };
}

/** A breach ends the run — the counter resets, history does not (Law: the
 *  longest value and the erase stamp are immortal). */
export function breakStreak(streaks: SharedStreaks, kind: StreakKind, atTick: SimTick, _cause: CauseId): SharedStreaks {
  const field = STREAK_FIELD[kind];
  return { ...streaks, [field]: { ...streaks[field], current: 0, lastEraseAtTick: atTick } };
}
