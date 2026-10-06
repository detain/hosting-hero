/**
 * Event-envelope model (§1.7 wave/envelope law; MASTER_REPORT §4.1 R-24).
 *
 * Traffic = a continuous diurnal baseline + shaped event envelopes layered
 * on top. An envelope is authored data: {ramp, plateau, decay, composition,
 * telegraphBand}. RNG touches ONLY where the envelope is placed in time
 * (drawPlacementMinute) — the shape and its composition are table truth.
 *
 * All phase arithmetic is exact integer SimTimeUs + Q16.16 Fixed; it is
 * clock-scale invariant because every input is already in SIM µs.
 */
import type { Fixed, SimTimeUs, WaveEnvelope } from "../types.ts";
import { FIXED_ONE, FIXED_ZERO, fromRatio, toNumber } from "../kernel/fixed.ts";
import { MICROS_PER_MIN, addUs } from "../kernel/time.ts";
import type { TelegraphBand } from "./bands.ts";
import { telegraphVisible } from "./bands.ts";

export type EnvelopePhase = "pre" | "ramp" | "plateau" | "decay" | "post";

/** One authored line of a wave's composition (imported here to keep the
 *  envelope self-describing without a cycle — table.ts re-exports it). */
export interface EnvelopeCompositionEntry {
  readonly threatId: string;
  readonly sharePct: number;
  readonly band: TelegraphBand;
}

/** Authored event envelope, positioned in absolute sim time. */
export interface EventEnvelope {
  readonly id: string;
  readonly tableId: string;
  readonly startUs: SimTimeUs;
  readonly rampUs: SimTimeUs;
  readonly plateauUs: SimTimeUs;
  readonly decayUs: SimTimeUs;
  /** Shares sum to 100; order is authored order (never shuffled). */
  readonly composition: readonly EnvelopeCompositionEntry[];
  /** Band of the dominant-share entry (per-entry bands live in composition). */
  readonly telegraphBand: TelegraphBand;
}

export interface EnvelopeState {
  readonly phase: EnvelopePhase;
  /** Progress THROUGH the current phase, 0..1 (Fixed). pre→0, post→1. */
  readonly progress: Fixed;
}

function assertSpan(name: string, value: SimTimeUs): void {
  if (value < 0n) throw new Error(`envelope ${name}: negative span ${value}us`);
}

export function envelopeEndUs(env: EventEnvelope): SimTimeUs {
  return addUs(addUs(addUs(env.startUs, env.rampUs), env.plateauUs), env.decayUs);
}

export function envelopeLengthUs(env: EventEnvelope): SimTimeUs {
  return addUs(addUs(env.rampUs, env.plateauUs), env.decayUs);
}

/**
 * Exact phase lookup at an absolute sim time.
 * Boundaries are half-open: [start, start+ramp) is ramp, etc.
 * Zero-length spans are skipped (ramp 0 → never reports "ramp").
 */
export function phaseAt(env: EventEnvelope, atUs: SimTimeUs): EnvelopeState {
  if (atUs < env.startUs) return { phase: "pre", progress: FIXED_ZERO };
  const rampEnd = addUs(env.startUs, env.rampUs);
  const plateauEnd = addUs(rampEnd, env.plateauUs);
  const end = envelopeEndUs(env);
  if (atUs >= end) return { phase: "post", progress: FIXED_ONE };
  if (env.rampUs > 0n && atUs < rampEnd) {
    return { phase: "ramp", progress: progressFloor(atUs - env.startUs, env.rampUs) };
  }
  if (env.plateauUs > 0n && atUs < plateauEnd) {
    return { phase: "plateau", progress: progressFloor(atUs - rampEnd, env.plateauUs) };
  }
  if (env.decayUs > 0n && atUs < end) {
    return { phase: "decay", progress: progressFloor(atUs - plateauEnd, env.decayUs) };
  }
  // Degenerate zero-length envelope sitting exactly on its point.
  return { phase: "post", progress: FIXED_ONE };
}

/** Strictly-interior progress, FLOOR-rounded: inside a span the value stays
 *  < FIXED_ONE (half-up would saturate a microsecond early). */
function progressFloor(elapsedUs: SimTimeUs, spanUs: SimTimeUs): Fixed {
  return (elapsedUs << 16n) / spanUs;
}

/** Integer per-minute arrival weights for the envelope (piecewise-linear
 *  density: 1..rampMin rising, flat, decayMin..1 falling). Minute counts,
 *  never unit fractions — the generator samples units against these. */
export function minuteWeights(env: EventEnvelope): readonly number[] {
  assertSpan("rampUs", env.rampUs);
  assertSpan("plateauUs", env.plateauUs);
  assertSpan("decayUs", env.decayUs);
  const rampMin = toWholeMinutes(env.rampUs, "ramp");
  const plateauMin = toWholeMinutes(env.plateauUs, "plateau");
  const decayMin = toWholeMinutes(env.decayUs, "decay");
  const weights: number[] = [];
  const plateauWeight = Math.max(rampMin, 1);
  for (let i = 0; i < rampMin; i += 1) weights.push(i + 1);
  for (let i = 0; i < plateauMin; i += 1) weights.push(plateauWeight);
  // Decay continues the plateau level downward, bottoming out at 1.
  for (let i = 0; i < decayMin; i += 1) weights.push(Math.max(plateauWeight - i, 1));
  if (weights.length === 0) weights.push(1); // degenerate point envelope
  return weights;
}

function toWholeMinutes(spanUs: SimTimeUs, name: string): number {
  if (spanUs % MICROS_PER_MIN !== 0n) {
    throw new Error(`envelope ${name}: ${spanUs}us is not a whole-minute span`);
  }
  return Number(spanUs / MICROS_PER_MIN);
}

/**
 * Draw the envelope's start offset inside a placement window. RNG decides
 * TIMING ONLY — the envelope content came from the authored table (R-16).
 * Returns a minute offset in [0, windowMinutes - envelopeMinutes].
 */
export function drawPlacementMinute(
  rng: { range(n: number): number },
  windowMinutes: number,
  envelopeMinutes: number,
): number {
  if (windowMinutes <= 0 || envelopeMinutes <= 0) {
    throw new Error(`drawPlacementMinute: window ${windowMinutes} / envelope ${envelopeMinutes} must be positive`);
  }
  const slack = windowMinutes - envelopeMinutes;
  if (slack < 0) {
    throw new Error(`drawPlacementMinute: envelope ${envelopeMinutes}min exceeds window ${windowMinutes}min`);
  }
  // +1 candidate slots so a zero-slack window still returns slot 0.
  return rng.range(slack + 1);
}

/** Project into the kernel's WaveEnvelope arrival-channel contract. */
export function toWaveEnvelope(
  env: EventEnvelope,
  opts: {
    readonly role: "baseline" | "spike" | "wave";
    readonly unitsTotal: number;
    readonly dominantFamily: WaveEnvelope["dominantFamily"];
    readonly entropyForecastPurchased: boolean;
    readonly atUs: SimTimeUs;
  },
): WaveEnvelope {
  const state = phaseAt(env, opts.atUs);
  // N6: projecting an envelope whose span has ALREADY ended used to fall
  // through to "ramp" — a finished envelope cannot describe an arrival
  // stream, so fail loud instead of lying. ("pre" still projects as "ramp":
  // the wave is simply not underway yet.)
  if (state.phase === "post") {
    throw new Error(
      `toWaveEnvelope: atUs ${opts.atUs} is at/after envelope ${env.id} end ${envelopeEndUs(env)}us — a finished envelope cannot be projected onto the arrival channel`,
    );
  }
  const shape: WaveEnvelope["shape"] =
    state.phase === "decay" ? "decay" : state.phase === "plateau" ? "plateau" : "ramp";
  const lengthMin = toWholeMinutes(envelopeLengthUs(env), "length");
  const ratePerMin = lengthMin === 0 ? FIXED_ZERO : fromRatio(BigInt(opts.unitsTotal), BigInt(lengthMin));
  return {
    tableId: env.tableId,
    role: opts.role,
    shape,
    ratePerMin,
    telegraphed: telegraphVisible(env.telegraphBand, opts.entropyForecastPurchased),
    dominantFamily: opts.dominantFamily,
  };
}

/** Display-only helper (never used in logic paths). */
export function phaseProgressNumber(state: EnvelopeState): number {
  return toNumber(state.progress);
}
