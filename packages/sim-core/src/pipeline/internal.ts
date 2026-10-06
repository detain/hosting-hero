/**
 * Shared internal helpers for the §7.13 pipeline (MASTER_REPORT §4.1).
 * Not part of the public API surface — only pipeline files import this.
 *
 * Determinism law (§3.4 / CONVENTIONS §4): integer/Fixed math only, stable
 * iteration orders, no wall clock, no unseeded randomness, no platform APIs.
 */

import type {
  EntityId,
  Fixed,
  SimTimeUs,
  ThreatFamily,
  Unit,
  UnitDraft,
  UnitIntent,
} from "../types.ts";
import { FIXED_SCALE, FIXED_UNIT, FIXED_ZERO, clampUnit } from "../kernel/fixed.ts";
import { MICROS_PER_MIN } from "../kernel/time.ts";

/** One macro tick of sim time = one sim minute (kernel/time DEFAULT_TICK_US). */
export const TICK_US: SimTimeUs = MICROS_PER_MIN;

/** Total order on opaque ids — locale-free, engine-independent (§3.4). */
export function compareEntityId(a: EntityId, b: EntityId): -1 | 0 | 1 {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/** Stable copy of an id iterable, sorted by the total order above. */
export function sortedIds(ids: Iterable<EntityId>): EntityId[] {
  return Array.from(ids).sort(compareEntityId);
}

/** Intents that the defense is supposed to catch (game-semantics mapping,
 *  NOT a business-type branch — CONVENTIONS §1.2 grep law is safe). */
export function isAdversarialIntent(intent: UnitIntent): boolean {
  return (
    intent === "malicious" ||
    intent === "abuser" ||
    intent === "human-error" ||
    intent === "entropic" ||
    intent === "systemic"
  );
}

/** Threat-family → UnitIntent mapping for the default arrival step. */
export function familyToIntent(family: ThreatFamily | "organic"): UnitIntent {
  switch (family) {
    case "organic":
      return "customer";
    case "malicious":
      return "malicious";
    case "human":
      return "human-error";
    case "entropic":
      return "entropic";
    case "systemic":
      return "systemic";
    case "customerAsThreat":
      return "abuser";
  }
}

/** Integer µs × Fixed factor, round-half-away-from-zero. No float. */
export function mulUsFixed(us: SimTimeUs, factor: Fixed): SimTimeUs {
  if (us < 0n) {
    throw new Error(`mulUsFixed: negative µs ${us}`);
  }
  if (factor < FIXED_ZERO) {
    throw new Error(`mulUsFixed: negative factor ${factor}`);
  }
  return (us * factor + FIXED_SCALE / 2n) / FIXED_SCALE;
}

/** Fractional part of a Fixed ≥ 0 as [0, 2^16) raw units. */
export function fracRawOfUnit(value: Fixed): bigint {
  return ((value % FIXED_SCALE) + FIXED_SCALE) % FIXED_SCALE;
}

/** Whole part of a Fixed ≥ 0 as a safe number. */
export function wholeOf(value: Fixed): number {
  const whole = value / FIXED_SCALE;
  const asNumber = Number(whole);
  if (!Number.isSafeInteger(asNumber)) {
    throw new Error(`wholeOf: ${value} exceeds safe integer whole part`);
  }
  return asNumber;
}

/** Bernoulli trial against a 0..1 Fixed probability, u32 draw ⇒ exact
 *  integer comparison (probability p hits iff draw < p × 2^32). */
export function rollUnder(p: Fixed, drawU32: number): boolean {
  const clamped = clampUnit(p);
  // clamped ≤ 2^16, draw < 2^32 ⇒ product fits comfortably in bigint.
  return BigInt(drawU32) < clamped * FIXED_SCALE;
}

/** Copy-on-write Unit patch (steps never mutate — §7.13 purity). */
export function withUnit(unit: Unit, patch: Partial<Omit<Unit, "id">>): Unit {
  return Object.freeze({ ...unit, ...patch });
}

/** Copy-on-write UnitDraft patch. */
export function withDraft(draft: UnitDraft, patch: Partial<Omit<UnitDraft, "type">>): UnitDraft {
  return Object.freeze({ ...draft, ...patch });
}

/** Slots a unit of `sizeCost` occupies: ceil(sizeCost) ≥ 1 ("size ≠ 1", R-32). */
export function slotsNeeded(sizeCost: Fixed): number {
  const slots = (sizeCost + FIXED_SCALE - 1n) / FIXED_SCALE;
  const asNumber = Number(slots);
  if (asNumber < 1 || !Number.isSafeInteger(asNumber)) {
    throw new Error(`slotsNeeded: bad sizeCost ${sizeCost}`);
  }
  return asNumber;
}

/** End of the current tick's sim minute (µs) — service deadlines are absolute. */
export function tickEndUs(simUs: SimTimeUs): SimTimeUs {
  return simUs + TICK_US;
}

export { FIXED_UNIT, FIXED_ZERO, FIXED_SCALE };
