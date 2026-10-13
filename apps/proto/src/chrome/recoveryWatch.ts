/**
 * Recovery watch (chrome consumer, v0) — renders the §7.7 ENGINE slice
 * (`GameState.recovery`, ADR-0012 canonical) that the runner exposes through
 * `recoveryState()` / `recoveryNotices()`. Nothing here moves ground truth:
 * the panel is a pure read of the engine's windows, strikes, locks and the
 * ramp fraction the serve clamp actually applies (`effectiveSlots /
 * fullSlots`).
 *
 * Advisory-OUT ledger (honest v0 gap): the demoted OBSERVER
 * (`pipeline/recovery/tracker.ts`) still computes `recoveryCapacityBps`,
 * `acceptsFailback`, the `degradedMinutes` lifetime meter and the crew/
 * priority queue — but composing those needs the raw per-tick SimEvent stream
 * and the full GameState, neither of which the runner exposes. They stay
 * UNSURFACED until a host seam carries them; the "minutes in window" number
 * below is derived from the engine's own `openedAtMinute` anchor, NOT the
 * observer's lifetime meter, and is labelled so.
 *
 * Voice law (noticeSurface pattern): every headline/line first asks the pack
 * (`alert.recovery-<kind>`, zero-slot) and falls back to the PROVISIONAL
 * table below. No such keys exist in the shipped packs today — the drift-pin
 * test proves the provisional genuinely answers, so when an author adds the
 * key the fallback retires itself without touching this file.
 */
import type { RecoveryNotice } from "@hh/sim-core/pipeline";
import type { RecoveryState, RecoveryWindowPhase, RecoveryWindowRecord } from "@hh/sim-core/types";
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
