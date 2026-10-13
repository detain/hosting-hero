/**
 * Recovery watch (chrome consumer, v0) — renders the §7.7 ENGINE slice
 * (`GameState.recovery`, ADR-0012 canonical) that the runner exposes through
 * `recoveryState()` / `recoveryNotices()`. Nothing here moves ground truth:
 * the panel is a pure read of the engine's windows, strikes, locks and the
 * ramp fraction the serve clamp actually applies (`effectiveSlots /
 * fullSlots`).
 *
 * Advisory-OUT ledger (CLOSED by the tick-facts seam): the demoted OBSERVER
 * (`pipeline/recovery/tracker.ts`) computes `recoveryCapacityBps`,
 * `acceptsFailback`, the `degradedMinutes` lifetime meter and the crew/
 * priority queue from the raw per-tick SimEvent stream + full GameState —
 * which `SimCoreRunner.lastTickFacts()` now carries. The ADVISORY arm below
 * composes that observer per button-step; ADR-0012 rules, so every advisory
 * reading is labelled presentation-only: the ENGINE clamp stays authoritative.
 *
 * Voice law (noticeSurface pattern): every headline/line first asks the pack
 * (`alert.recovery-<kind>`, zero-slot) and falls back to the PROVISIONAL
 * table below. No such keys exist in the shipped packs today — the drift-pin
 * test proves the provisional genuinely answers, so when an author adds the
 * key the fallback retires itself without touching this file.
 */
import {
  acceptsFailback,
  defaultRecoveryTuning,
  observeRecoveryTick,
  recoveryCapacityBps,
} from "@hh/sim-core/pipeline";
import type {
  ObserveResult,
  RecoveryObservation,
  RecoveryPhase,
  RecoveryTrackerState,
  RecoveryTuning,
} from "@hh/sim-core/pipeline";
import type { RecoveryNotice } from "@hh/sim-core/pipeline";
import type { EntityId, RecoveryState, RecoveryWindowPhase, RecoveryWindowRecord } from "@hh/sim-core/types";
import { hasKey, t } from "../i18n/packStore";
import { compareCodeUnits } from "./textLaw";

/* ───────────────────── engine mirror (drift-pinned in tests) ───────────────────── */

/** The five engine notice kinds (pipeline/recovery.ts RECOVERY_NOTICE_KINDS).
 *  This is a MIRROR — the drift-pin test greps the engine source; chrome must
 *  never invent a sixth recovery story. */
export const RECOVERY_WATCH_KINDS: readonly string[] = Object.freeze([
  "episode",
  "window-opened",
  "second-failure",
  "lock-engaged",
  "window-cleared",
] as const);

/** The two engine phases (types.ts RecoveryWindowPhase). Mirror, drift-pinned. */
export const RECOVERY_WATCH_PHASES: readonly RecoveryWindowPhase[] = Object.freeze([
  "window",
  "locked",
] as const);

/* ─────────────────────────── cause-id parsing ─────────────────────────── */

export interface RecoveryCause {
  readonly kind: string;
  readonly nodeId: string;
  readonly minute: number;
}

/**
 * Parse the engine's `recovery:<kind>:<nodeId>:<minute>` wire at the boundary.
 * Returns null for anything off-grammar — an off-vocabulary kind is null too,
 * so an engine drift surfaces as an UNRECOGNISED tape row (visible), never a
 * crash or a silent drop. Node ids never contain ':' in this sim; the strict
 * four-segment split keeps that assumption falsifiable.
 */
export function parseRecoveryCause(causeId: string): RecoveryCause | null {
  const segments = causeId.split(":");
  if (segments.length !== 4) return null;
  const [prefix, kind, nodeId, minuteText] = segments as [string, string, string, string];
  if (prefix !== "recovery") return null;
  if (!RECOVERY_WATCH_KINDS.includes(kind)) return null;
  if (nodeId.length === 0) return null;
  if (!/^\d+$/.test(minuteText)) return null;
  return Object.freeze({ kind, nodeId, minute: Number(minuteText) });
}

/* ──────────────────────────── ramp arithmetic ─────────────────────────── */

/**
 * The engine-authoritative restore fraction, 0–100: what the serve clamp
 * actually grants over what the node had when the window opened. Throws on a
 * zero/negative `fullSlots` record — the engine captures live arms at open,
 * so a zero there is corrupt state, not a calm one.
 */
export function rampFloorPct(record: RecoveryWindowRecord): number {
  if (!(record.fullSlots > 0)) {
    throw new RangeError(
      `recovery-watch[bad-record] node '${record.nodeId}' fullSlots=${record.fullSlots} — the engine captures live arms at window open`,
    );
  }
  const pct = Math.round((record.effectiveSlots / record.fullSlots) * 100);
  return Math.min(100, Math.max(0, pct));
}

/** Minutes since the window opened (engine anchor, never negative). NOT the
 *  observer's `degradedMinutes` lifetime meter — see the advisory ledger in
 *  the header. */
export function minutesInWindow(record: RecoveryWindowRecord, minute: number): number {
  return Math.max(0, minute - record.openedAtMinute);
}

/* ────────────────────────── phase display views ───────────────────────── */

export interface RecoveryPhaseView {
  readonly label: string;
  /** Hue LEDGER name the chip wears (alarm/amber — both audited text hues). */
  readonly tone: "amber" | "alarm";
  readonly narrative: string;
}

/** Closed map over the two engine phases; an unknown phase THROWS — chrome
 *  renders what the engine says, never a guess. */
export const RECOVERY_PHASE_VIEWS: Readonly<Record<RecoveryWindowPhase, RecoveryPhaseView>> =
  Object.freeze({
    window: Object.freeze({
      label: "Shadow window",
      tone: "amber" as const,
      narrative: "quiet long enough — arms climbing back one per ramp step; a bounce now is a SECOND FAILURE",
    }),
    locked: Object.freeze({
      label: "Locked · safe mode",
      tone: "alarm" as const,
      narrative: "failed inside the window — floor posture held for the full window again",
    }),
  });

export function phaseView(phase: RecoveryWindowPhase): RecoveryPhaseView {
  const view = RECOVERY_PHASE_VIEWS[phase];
  if (view === undefined) {
    throw new RangeError(`recovery-watch[bad-phase] '${String(phase)}' is not an engine phase`);
  }
  return view;
}

/* ──────────────────────────── row projection ──────────────────────────── */

export interface RecoveryRow {
  readonly nodeId: string;
  readonly phase: RecoveryWindowPhase;
  readonly phaseLabel: string;
  readonly tone: "amber" | "alarm";
  readonly narrative: string;
  readonly strikes: number;
  readonly arms: string; // "effective/full"
  readonly rampPct: number;
  readonly minutesInWindow: number;
  readonly minutesToClose: number; // 0 once past the countdown
  readonly lockUntilMinute: number;
}

/**
 * Per-node rows from the engine slice, sorted code-unit by node id. An
 * undefined slice (unarmed runner OR every window closed — the key is
 * absent-while-idle) yields no rows; the caller distinguishes the two honest
 * off-states by arming knowledge, never by guessing here.
 */
export function buildRecoveryRows(
  state: RecoveryState | undefined,
  minute: number,
): readonly RecoveryRow[] {
  if (state === undefined) return Object.freeze([]);
  const rows = [...state.windows.values()]
    .sort((a, b) => compareCodeUnits(a.nodeId, b.nodeId))
    .map((record) => {
      const view = phaseView(record.phase);
      return Object.freeze({
        nodeId: record.nodeId,
        phase: record.phase,
        phaseLabel: view.label,
        tone: view.tone,
        narrative: view.narrative,
        strikes: record.strikes,
        arms: `${record.effectiveSlots}/${record.fullSlots}`,
        rampPct: rampFloorPct(record),
        minutesInWindow: minutesInWindow(record, minute),
        minutesToClose: Math.max(0, record.closesAtMinute - minute),
        lockUntilMinute: record.lockUntilMinute,
      });
    });
  return Object.freeze(rows);
}

/* ─────────────────────────── provisional voices ───────────────────────── */

/** Fallback voice per kind — §9.9 sober, mechanism-accurate, owner-ratify
 *  batch. The pack line (`alert.recovery-<kind>`) wins wherever it resolves;
 *  no such key ships today, which the falsifiable pin proves. */
export const RECOVERY_WATCH_VOICES: Readonly<Record<string, { headline: string; line: string }>> =
  Object.freeze({
    episode: Object.freeze({
      headline: "First struggle",
      line: "a bounce at the limit — degraded weather, not yet a pattern; the shadow clock starts on quiet",
    }),
    "window-opened": Object.freeze({
      headline: "Shadow window open",
      line: "quiet held — the node serves with reduced arms and climbs back one step at a time",
    }),
    "second-failure": Object.freeze({
      headline: "Second failure",
      line: "it bounced inside its own recovery window — strikes count, the story is a pattern now",
    }),
    "lock-engaged": Object.freeze({
      headline: "Safe mode engaged",
      line: "capacity pinned at the floor for the full window; one occupied arm is never evicted",
    }),
    "window-cleared": Object.freeze({
      headline: "Window cleared",
      line: "the countdown reached zero at full arms — restored posture, the episode memory fades",
    }),
  });

const UNRECOGNISED_VOICE = Object.freeze({
  headline: "Unrecognised recovery event",
  line: "the engine emitted a kind this panel has no mirror for — surface it, do not narrate it",
});

/** Pack-first voice; provisional table behind it; unknown kind gets the
 *  visible UNRECOGNISED row (fail-soft like StatusChip's UNVERIFIED, so an
 *  engine drift can never blank the HUD). */
export function recoveryVoice(
  kind: string,
  eraYear: number | undefined = undefined,
): { headline: string; line: string } {
  const key = `alert.recovery-${kind}`;
  if (hasKey("shared-web", key)) {
    const packLine = eraYear === undefined ? t("shared-web", key) : t("shared-web", key, {}, eraYear);
    return Object.freeze({ headline: kind, line: packLine });
  }
  return RECOVERY_WATCH_VOICES[kind] ?? UNRECOGNISED_VOICE;
}

/* ───────────────────────────── notice tape ───────────────────────────── */

export interface RecoveryTapeRow {
  readonly causeId: string;
  readonly kind: string;
  readonly nodeId: string;
  readonly minute: number;
  readonly strikes: number;
  readonly effectiveSlots: number;
  readonly recognised: boolean;
  readonly headline: string;
  readonly line: string;
}

/**
 * The last `limit` recovery stories, newest first. The channel is already the
 * engine's own log; the causeId is re-parsed so the wire format stays the
 * boundary authority — a notice whose causeId drifted from `recovery:<kind>:
 * <node>:<minute>` surfaces unrecognised rather than trusting payload twins.
 */
export function buildRecoveryTape(
  notices: readonly RecoveryNotice[],
  limit: number,
): readonly RecoveryTapeRow[] {
  const rows = notices
    .slice(-limit)
    .reverse()
    .map((notice) => {
      const cause = parseRecoveryCause(notice.causeId);
      const recognised = cause !== null && cause.kind === notice.kind;
      const voice = recognised ? recoveryVoice(notice.kind) : UNRECOGNISED_VOICE;
      return Object.freeze({
        causeId: notice.causeId,
        kind: notice.kind,
        nodeId: cause?.nodeId ?? notice.nodeId,
        minute: cause?.minute ?? notice.atMinute,
        strikes: notice.strikes,
        effectiveSlots: notice.effectiveSlots,
        recognised,
        headline: voice.headline,
        line: voice.line,
      });
    });
  return Object.freeze(rows);
}

/* ═══════════════════════════ ADVISORY arm (observer half) ═══════════════════════════
 * The second arm the panel wears: the ADR-0012 DEMOTED observer
 * (`pipeline/recovery/tracker.ts`) composed from the runner's `lastTickFacts()`
 * seam — raw per-tick SimEvent stream + the post-advance GameState authority.
 * Everything below is PRESENTATION: the engine's serve clamp is the only
 * authority on capacity, and the drift-pins keep the mirror honest.
 */

/** Host-side advisory tuning (PROVISIONAL, owner-ratify batch). The engine
 *  observer's own default `failureBounceThreshold: 4` is calibrated for a full
 *  session clock; on this 240-click demo weekend no single tick ever clusters
 *  four bounced units for one node (seed 905 probe: max 3/tick), so a
 *  default-tuned advisory would render an honest-but-empty panel. A PAIR of
 *  same-tick bounces is the smallest signal that reads as a pattern rather
 *  than one retrying unit — and one bounce alone would over-report solo
 *  retries as incidents. Every other knob stays at the observer default.
 *  The live-arc test pins this exact choice: engine default 4 stays in source
 *  (drift-pinned), advisory answers at 2. */
export const ADVISORY_TUNING: RecoveryTuning = Object.freeze({
  ...defaultRecoveryTuning(),
  failureBounceThreshold: 2,
});

/** The observer's four phases → chip vocabulary. Keys are pinned against the
 *  tracker source's RECOVERY_PHASES literal by the drift-pin test; an engine
 *  sixth phase would surface as a THROWS-at-render bug (loud), never a guess.
 *  Tones reuse ONLY census-audited text hues (grey/alarm/amber/green). */
export interface AdvisoryPhaseView {
  readonly label: string;
  readonly tone: "grey" | "alarm" | "amber" | "green";
  readonly narrative: string;
}

export const ADVISORY_PHASE_VIEWS: Readonly<Record<RecoveryPhase, AdvisoryPhaseView>> =
  Object.freeze({
    healthy: Object.freeze({
      label: "At peace",
      tone: "grey" as const,
      narrative: "tracked, no open incident — the observer remembers the failures, not a outage",
    }),
    failed: Object.freeze({
      label: "Down · crew queue",
      tone: "alarm" as const,
      narrative: "advisory: observer counts a thresholded bounce cluster — the ENGINE clamp, not this row, decides what the node serves",
    }),
    recovering: Object.freeze({
      label: "Restoring · safe mode",
      tone: "amber" as const,
      narrative: "advisory: crew ramp modelled floor→full — the engine's own restore ladder lives in the slice rows above",
    }),
    recovered: Object.freeze({
      label: "Recovered · failback hold",
      tone: "green" as const,
      narrative: "advisory: ramp closed; failback waits out the observer's hold — steering stays engine law",
    }),
  });

export function advisoryPhaseView(phase: RecoveryPhase): AdvisoryPhaseView {
  const view = ADVISORY_PHASE_VIEWS[phase];
  if (view === undefined) {
    throw new RangeError(`recovery-watch[bad-advisory-phase] '${String(phase)}' is not an observer phase`);
  }
  return view;
}

/** Where a tracked node stands in the advisory crew picture. A PRESENTATION
 *  mirror of the observer's private allocateCrew order law
 *  (priority desc, failedAt asc, nodeId asc) — re-implemented here at read
 *  time because the tracker state is a snapshot, not a queue object. The
 *  drift-pin test quotes the comparator source; if the engine order changes,
 *  this mirror must change in the same commit. */
export type AdvisoryCrewStatus = "ramping" | "waiting" | "standby";

export interface AdvisoryRow {
  readonly nodeId: string;
  readonly phase: RecoveryPhase;
  readonly phaseLabel: string;
  readonly tone: AdvisoryPhaseView["tone"];
  readonly narrative: string;
  readonly failures: number;
  readonly secondFailure: boolean;
  readonly postmortemCredit: boolean;
  readonly degradedMinutes: number;
  readonly priority: number;
  /** Observer-modelled capacity, 0–10_000 bps as a plain number. */
  readonly capacityBps: number;
  readonly capacityPct: number;
  readonly acceptsFailback: boolean;
  readonly crew: AdvisoryCrewStatus | null;
  readonly queuePosition: number | null;
  /** Minutes left of the dispatch delay while on standby (0 otherwise). */
  readonly minutesToDispatch: number;
}

/** Crew status for one record at `minute` — pure read, no state touched. */
function crewStatusOf(
  record: { phase: RecoveryPhase; failedAtMinute: number | null },
  minute: number,
  cfg: RecoveryTuning,
): AdvisoryCrewStatus | null {
  if (record.phase === "recovering") return "ramping";
  if (record.phase !== "failed" || record.failedAtMinute === null) return null;
  return minute - record.failedAtMinute >= cfg.autoRecoverDelayMinutes ? "waiting" : "standby";
}

/**
 * Advisory rows for EVERY tracked node (the observer keeps its incident
 * memory after recovery — rows linger, phases cool), sorted code-unit by
 * node id. Queue positions are assigned over the crew-relevant set
 * (ramping + waiting + standby, so the ordering law is a single total
 * order the eye can follow): the engine would only start ramps from the
 * ELIGIBLE (waiting) head of that same order, so a standby row can never
 * out-queue a waiting one by accident — same comparator, wider window.
 */
export function buildAdvisoryRows(
  state: RecoveryTrackerState,
  minute: number,
  cfg: RecoveryTuning = ADVISORY_TUNING,
): readonly AdvisoryRow[] {
  const records = [...state.nodes.values()].sort((a, b) => compareCodeUnits(a.nodeId, b.nodeId));
  const queueOrder = records
    .filter((r) => r.phase === "failed" || r.phase === "recovering")
    .sort(
      (a, b) =>
        b.priority - a.priority ||
        (a.failedAtMinute ?? Number.MAX_SAFE_INTEGER) - (b.failedAtMinute ?? Number.MAX_SAFE_INTEGER) ||
        compareCodeUnits(a.nodeId, b.nodeId),
    );
  const positionById = new Map<EntityId, number>();
  queueOrder.forEach((r, i) => positionById.set(r.nodeId, i + 1));
  const rows = records.map((record) => {
    const view = advisoryPhaseView(record.phase);
    const bps = Number(recoveryCapacityBps(state, record.nodeId, minute, cfg));
    const crew = crewStatusOf(record, minute, cfg);
    return Object.freeze({
      nodeId: record.nodeId,
      phase: record.phase,
      phaseLabel: view.label,
      tone: view.tone,
      narrative: view.narrative,
      failures: record.failures,
      secondFailure: record.secondFailure,
      postmortemCredit: record.postmortemCredit,
      degradedMinutes: record.degradedMinutes,
      priority: record.priority,
      capacityBps: bps,
      capacityPct: Math.min(100, Math.max(0, Math.round(bps / 100))),
      acceptsFailback: acceptsFailback(state, record.nodeId, minute),
      crew,
      queuePosition: crew === null ? null : (positionById.get(record.nodeId) ?? null),
      minutesToDispatch:
        crew === "standby" && record.failedAtMinute !== null
          ? Math.max(0, cfg.autoRecoverDelayMinutes - (minute - record.failedAtMinute))
          : 0,
    });
  });
  return Object.freeze(rows);
}

/** Header meter over the advisory rows: tracked population, open incidents
 *  (failed + recovering), and the summed degraded-minutes lifetime debt. */
export interface AdvisoryTotals {
  readonly tracked: number;
  readonly openIncidents: number;
  readonly degradedMinutes: number;
}

export function advisoryTotals(
  rows: readonly AdvisoryRow[],
): AdvisoryTotals {
  let open = 0;
  let degraded = 0;
  for (const row of rows) {
    if (row.phase === "failed" || row.phase === "recovering") open += 1;
    degraded += row.degradedMinutes;
  }
  return Object.freeze({ tracked: rows.length, openIncidents: open, degradedMinutes: degraded });
}

/** One-step advisory advance over the runner's tick facts. Thin wrapper —
 *  the observer stays the single implementation; this exists so the component
 *  side reads as dataflow (facts in, new state out) and the host default
 *  tuning binds HERE, not at every call site. */
export function observeAdvisoryTick(
  state: RecoveryTrackerState,
  observation: RecoveryObservation,
  cfg: RecoveryTuning = ADVISORY_TUNING,
): ObserveResult {
  return observeRecoveryTick(state, observation, cfg);
}
