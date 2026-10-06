/**
 * The global 0.5 Hz heartbeat (§4.7 item 1.2):
 * "global ~0.5 Hz heartbeat sync for all ambient pulses — desynchronization
 * IS the alarm channel. Fixed per-unit phase offset allowed, DRIFT is not."
 *
 * Implementation law: phase is a PURE function of absolute wall time, never an
 * accumulator. Accumulators drift; pure functions cannot. A unit's "personality"
 * enters only as a constant phase offset — the moment a unit's effective
 * frequency differs from the grid, that IS the alarm signal, and it can only
 * happen if the caller passes a different clock, never from arithmetic decay.
 *
 * Wall clock here is presentation-side (CONVENTIONS §4 renderer carve-out).
 */

export const HEARTBEAT_HZ = 0.5;
export const HEARTBEAT_PERIOD_MS = 1000 / HEARTBEAT_HZ; // 2000 ms

/** 0..1 ramp position within the shared heartbeat at `wallMs`, with a fixed
 *  per-unit `phaseOffset` (0..1). Never accumulates state. */
export function heartbeatPhase(wallMs: number, phaseOffset = 0): number {
  if (!Number.isFinite(wallMs) || wallMs < 0) {
    throw new Error(`heartbeatPhase: wallMs must be finite ≥0, got ${wallMs}`);
  }
  if (!(phaseOffset >= 0 && phaseOffset < 1)) {
    throw new Error(`heartbeatPhase: phaseOffset must be in [0,1), got ${phaseOffset}`);
  }
  return (wallMs / HEARTBEAT_PERIOD_MS + phaseOffset) % 1;
}

/** Smooth 0..1→0 pulse shape for ambient breathing (sinusoid, no sharp flash —
 *  flash language is separate and one-frame per §1.2). */
export function heartbeatPulse(wallMs: number, phaseOffset = 0): number {
  const phase = heartbeatPhase(wallMs, phaseOffset);
  return 0.5 - 0.5 * Math.cos(phase * Math.PI * 2);
}

/** How many heartbeats have fully elapsed (for blink-rhythm LED grammar,
 *  §1.5 — sync-blink = fleet op: all units share this count). */
export function heartbeatCount(wallMs: number): number {
  return Math.floor(wallMs / HEARTBEAT_PERIOD_MS);
}
