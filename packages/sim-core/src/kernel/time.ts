/**
 * Integer-µs time helpers + the three-clock model (MASTER_REPORT §4.1
 * R-20…R-31 "Three clocks model", §7.0 P0 "integer-µs event keys").
 *
 * One monotonic real-time driver feeds three clocks, all in the SAME integer
 * µs quantum, differing only by a scale factor applied to the elapsed real
 * delta:
 *  - `simUs`      — ops clock; 1 real second = 1 sim minute at 1×; speed
 *                   factors 1/2/4 gate OBSERVATION, never physics, so a run
 *                   stepped at 4× must equal the same run stepped at 1× with
 *                   4× the real deltas (G1 acceptance (a));
 *  - `businessUs` — macro clock, NEVER scaled or paused (dual-clock law);
 *                   default ratio = one 30-day month every 7 real minutes
 *                   (§7.13 — the Sheet-B 4-min contradiction is OD-2's to
 *                   settle; this constant refuses to silently choose it);
 *  - `wallUs`     — drama clock (fixed 1.5 s/hop cascade fuse, renderer
 *                   interpolation). Core never reads it from a host clock:
 *                   wall deltas are INJECTED by the driver (§3.4 — no
 *                   `Date.now` in core paths).
 *
 * Accumulation law (FIX-1): the ops/wall clocks accumulate per-delta floors
 * (their scales are integer multipliers — den = 1 — so the floor is exact and
 * any partition of a delta sums identically). The BUSINESS scale is
 * fractional (43200/7), and per-delta flooring there is NOT partition-safe:
 * floor(4e6·43200/7) = 24685714285 ≠ 4·floor(1e6·43200/7) = 24685714284.
 * Instead of dropping each delta's remainder on the floor, `advanceClocks`
 * takes business time as the DIFFERENCE of the scaled clock evaluated at the
 * absolute real-time marks: increments telescope to exactly
 * `floor(totalReal·43200/7)` whatever the split, because the remainders ride
 * in `realUs`, which accumulates losslessly. The per-clock state is still a
 * pure function of (initial clocks, ordered deltas, speeds), and a run
 * stepped at 4×/chunked at 1× now agrees to the µs (speed invariance law).
 */

import type { ClockState, SimMinute, SimTick, SimTimeUs } from "../types";

export const MICROS_PER_MS: SimTimeUs = 1_000n;
export const MICROS_PER_SEC: SimTimeUs = 1_000_000n;
export const MICROS_PER_MIN: SimTimeUs = 60_000_000n;
export const MICROS_PER_HOUR: SimTimeUs = 3_600_000_000n;
export const MICROS_PER_DAY: SimTimeUs = 86_400_000_000n;

/** Sim µs per sim minute (identity; named for pipeline readability). */
export const SIM_US_PER_SIM_MINUTE: SimTimeUs = MICROS_PER_MIN;

/** Default macro-tick = one sim minute. Tick boundaries are deterministic
 *  checkpoint boundaries (§4.1 hybrid clocking). */
export const DEFAULT_TICK_US: SimTimeUs = SIM_US_PER_SIM_MINUTE;

/** Ratios as exact integer fractions — scale factors may exceed Q16.16
 *  (60 µs sim per µs real at 1×), so they are NOT Fixed values. */
export interface ClockScale {
  readonly num: bigint;
  readonly den: bigint;
}

/** Game speed factors: 1×/2×/4× — gates observation detail, never physics. */
export type SpeedFactor = 1 | 2 | 4;

/** 1 real second = 1 sim minute at 1× ⇒ 60 sim µs per real µs. */
export function simScale(speed: SpeedFactor): ClockScale {
  return { num: 60n * BigInt(speed), den: 1n };
}

/** Incident clock: sim time may drop to 0.25× and stays there permanently
 *  for game / ad-tech / fin-colo types (§7.13, §7.8d). Composes with speed
 *  the same way — it is a scale, not a special mode. */
export function incidentScale(speed: SpeedFactor): ClockScale {
  return { num: 15n * BigInt(speed), den: 1n };
}

/** Business clock default: 30-day month every 7 real minutes
 *  = 2_592_000 s / 420 s = 43200/7 business µs per real µs.
 *  OD-2/D-1 pending — flip this ONE constant when the owner settles it. */
export const BUSINESS_SCALE_DEFAULT: ClockScale = { num: 43_200n, den: 7n };

/** Wall clock passes real time through unchanged (injected deltas). */
export const WALL_SCALE: ClockScale = { num: 1n, den: 1n };

/** Apply an exact integer scale to a µs duration (floor; inputs validated). */
export function scaleUs(durationUs: SimTimeUs, scale: ClockScale): SimTimeUs {
  if (durationUs < 0n) {
    throw new Error(`scaleUs: negative duration ${durationUs}µs`);
  }
  if (scale.den <= 0n) {
    throw new Error(`scaleUs: non-positive denominator ${scale.den}`);
  }
  return (durationUs * scale.num) / scale.den;
}

/** Parse a host/number literal into a trusted SimTimeUs (boundary parse). */
export function us(value: bigint | number): SimTimeUs {
  if (typeof value === "number" && !Number.isSafeInteger(value)) {
    throw new Error(`us: ${value} is not a safe integer number of µs`);
  }
  const raw = BigInt(value);
  if (raw < 0n) {
    throw new Error(`us: negative time ${raw}µs — clocks are monotonic`);
  }
  return raw;
}

export function addUs(a: SimTimeUs, b: SimTimeUs): SimTimeUs {
  if (b < 0n) {
    throw new Error(`addUs: negative delta ${b}µs — subtract with subUs`);
  }
  return a + b;
}

export function subUs(a: SimTimeUs, b: SimTimeUs): SimTimeUs {
  const result = a - b;
  if (result < 0n) {
    throw new Error(`subUs: ${a}µs − ${b}µs would go negative`);
  }
  return result;
}

export function minUs(a: SimTimeUs, b: SimTimeUs): SimTimeUs {
  return a <= b ? a : b;
}

export function maxUs(a: SimTimeUs, b: SimTimeUs): SimTimeUs {
  return a >= b ? a : b;
}

/** Minutes ↔ sim µs (RNG keying, patience windows). */
export function minutesToSimUs(minutes: number | bigint): SimTimeUs {
  const whole = BigInt(minutes);
  if (whole < 0n) {
    throw new Error(`minutesToSimUs: negative minutes ${minutes}`);
  }
  return whole * SIM_US_PER_SIM_MINUTE;
}

export function simMinuteOf(clocks: ClockState): SimMinute {
  const minute = clocks.simUs / SIM_US_PER_SIM_MINUTE;
  const asNumber = Number(minute);
  if (!Number.isSafeInteger(asNumber)) {
    throw new Error(`simMinuteOf: minute ${minute} exceeds safe integer range`);
  }
  return asNumber;
}

export function tickOf(clocks: ClockState, tickUs: SimTimeUs = DEFAULT_TICK_US): SimTick {
  if (tickUs <= 0n) {
    throw new Error(`tickOf: non-positive tick length ${tickUs}µs`);
  }
  return clocks.simUs / tickUs;
}

export function initialClocks(): ClockState {
  return { realUs: 0n, simUs: 0n, businessUs: 0n, wallUs: 0n };
}

/** Driver settings for one advance step. `incident` selects the 0.25× ops
 *  scale (permanent for certain hosting types); speeds gate observation. */
export interface ClockAdvance {
  readonly realElapsedUs: SimTimeUs;
  readonly speed: SpeedFactor;
  readonly incident: boolean;
}

/** Pure step: returns the next ClockState for an ordered driver delta.
 *  businessUs and wallUs ignore `speed`/`incident` by law (dual-clock +
 *  drama-rate decoupling). */
export function advanceClocks(clocks: ClockState, advance: ClockAdvance): ClockState {
  const { realElapsedUs, speed, incident } = advance;
  if (realElapsedUs < 0n) {
    throw new Error(`advanceClocks: negative real delta ${realElapsedUs}µs`);
  }
  const opsScale = incident ? incidentScale(speed) : simScale(speed);
  const realUs = addUs(clocks.realUs, realElapsedUs);
  // Partition-invariant business accumulation (see module header, FIX-1):
  // the increment is the scaled clock evaluated at the two absolute real-time
  // marks, so any split of the elapsed total lands on the same businessUs.
  // `businessUs` keeps whatever base the caller brought (a calendar-anchored
  // restore is honored, never re-derived).
  const businessStep = subUs(
    scaleUs(realUs, BUSINESS_SCALE_DEFAULT),
    scaleUs(clocks.realUs, BUSINESS_SCALE_DEFAULT),
  );
  return {
    realUs,
    simUs: addUs(clocks.simUs, scaleUs(realElapsedUs, opsScale)),
    businessUs: addUs(clocks.businessUs, businessStep),
    wallUs: addUs(clocks.wallUs, scaleUs(realElapsedUs, WALL_SCALE)),
  };
}
