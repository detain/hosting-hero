/**
 * Difficulty Director slot — "the honest face" (hosting_game.md L27998-28007,
 * MASTER_REPORT §4.1 R-31).
 *
 * Legitimate reach, by construction:
 *  - sawtooth TROUGH DEPTH only (peaks/floors never move)
 *  - ENTROPY BUDGET only (how much entropy traffic, never which threats)
 *  - NEVER while an incident is running
 *  - NEVER composition — no threat type is reachable from this module's
 *    outputs; the telegraphed wave stays exactly as authored.
 *
 * Every nudge is a DirectorDraw logged into the replay bundle, drawn from
 * the "director" rng domain — so replays see the same "randomness".
 */
import type { DirectorDraw, Fixed, RngStream, SimTick } from "../types.ts";
import { FIXED_ONE, FIXED_ZERO, add, fromRatio, mul } from "../kernel/fixed.ts";

export const DIRECTOR_RNG_DOMAIN = "director";

export interface DirectorState {
  /** Multiplier on trough entries of the sawtooth (1.0 = authored depth). */
  readonly troughDepthFactor: Fixed;
  /** Multiplier on entropy-band budget (1.0 = authored budget). */
  readonly entropyBudgetFactor: Fixed;
  /** Set by the incident lifecycle (owner of the slot) around incidents. */
  readonly incidentActive: boolean;
}

export const INITIAL_DIRECTOR_STATE: DirectorState = {
  troughDepthFactor: FIXED_ONE,
  entropyBudgetFactor: FIXED_ONE,
  incidentActive: false,
};

export interface DirectorConfig {
  readonly minFactor: Fixed;
  readonly maxFactor: Fixed;
  /** Max |nudge| per draw, in basis points of the current factor. */
  readonly maxNudgeBps: number;
  /** Probability (integer 0..99) that a healthy tick even rolls a nudge. */
  readonly nudgeChancePct: number;
}

export const DEFAULT_DIRECTOR_CONFIG: DirectorConfig = {
  minFactor: fromRatio(75n, 100n), // 0.75×
  maxFactor: fromRatio(125n, 100n), // 1.25×
  maxNudgeBps: 150,
  nudgeChancePct: 20,
};

export type DirectorRefusal = "incident-active" | null;

export interface DirectorOutcome {
  readonly next: DirectorState;
  readonly draw: DirectorDraw | null;
  readonly refused: DirectorRefusal;
}

/** The subjects the director may legally touch — closed set mirrors
 *  DirectorDraw["subject"]; nothing else exists in this namespace. */
const SUBJECTS: readonly DirectorDraw["subject"][] = ["sawtooth-trough-depth", "entropy-budget"];

function clampFactor(value: Fixed, cfg: DirectorConfig): Fixed {
  if (value < cfg.minFactor) return cfg.minFactor;
  if (value > cfg.maxFactor) return cfg.maxFactor;
  return value;
}

function currentFactor(state: DirectorState, subject: DirectorDraw["subject"]): Fixed {
  return subject === "sawtooth-trough-depth" ? state.troughDepthFactor : state.entropyBudgetFactor;
}

/**
 * One director decision. INCIDENT ⇒ hard early-exit that consumes NO rng —
 * the stream position is part of the replay contract, so a refused tick
 * must be indistinguishable from a skipped tick.
 */
export function directorPropose(
  state: DirectorState,
  atTick: SimTick,
  rng: RngStream,
  cfg: DirectorConfig = DEFAULT_DIRECTOR_CONFIG,
): DirectorOutcome {
  if (atTick < 0n) throw new Error(`directorPropose: negative tick ${atTick}`);
  if (cfg.minFactor > cfg.maxFactor) throw new Error("directorPropose: minFactor > maxFactor");
  if (state.incidentActive) {
    return { next: state, draw: null, refused: "incident-active" };
  }
  const gateRoll = rng.range(100);
  if (gateRoll >= cfg.nudgeChancePct) {
    return { next: state, draw: null, refused: null };
  }
  const subject = SUBJECTS[rng.range(SUBJECTS.length)]!;
  // Integer basis-point offset in [-maxNudgeBps, +maxNudgeBps].
  const offsetBps = rng.range(2 * cfg.maxNudgeBps + 1) - cfg.maxNudgeBps;
  const current = currentFactor(state, subject);
  const nudged = add(current, mul(current, fromRatio(BigInt(offsetBps), 10_000n)));
  const nextFactor = clampFactor(nudged, cfg);
  const draw: DirectorDraw = { atTick, subject, value: nextFactor };
  const next =
    subject === "sawtooth-trough-depth"
      ? { ...state, troughDepthFactor: nextFactor }
      : { ...state, entropyBudgetFactor: nextFactor };
  return { next, draw, refused: null };
}

/** Flip the incident latch (pure). */
export function setIncidentActive(state: DirectorState, active: boolean): DirectorState {
  return { ...state, incidentActive: active };
}

export const SAWTOOTH_FLOOR_MICRO: bigint = 1_000_000n; // authored "1.0" reference

/**
 * Apply the trough-depth factor to a sawtooth series: only entries BELOW
 * the 1.0 floor (true troughs) scale; crests and the floor are untouched.
 * Exact bigint math, round-half-up. Returns a NEW array (Law 3).
 */
export function applyTroughDepthFactor(
  sawtoothMicro: readonly bigint[],
  factor: Fixed,
): readonly bigint[] {
  if (factor < FIXED_ZERO) throw new Error(`director: negative trough factor ${factor}`);
  return sawtoothMicro.map((v) => {
    if (v >= SAWTOOTH_FLOOR_MICRO) return v;
    return (v * factor + 32_768n) / 65_536n;
  });
}

/** Apply the entropy-budget factor to an integer unit count (round-half-up). */
export function applyEntropyBudgetFactor(unitCount: number, factor: Fixed): number {
  if (!Number.isSafeInteger(unitCount) || unitCount < 0) {
    throw new Error(`director: bad unit count ${String(unitCount)}`);
  }
  const scaled = (BigInt(unitCount) * factor + 32_768n) / 65_536n;
  return Number(scaled);
}
