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
  NodeRecord,
  QosClassDef,
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

/* ═══════════════ R-06b · bundle familyWeights arrival mix (audit fix 3) ═══════════════ */

/** One bucket of the authored family-mix table (waves.parseFamilyWeightsTable
 *  produces exactly this shape; shareMicro is an integer, shares sum to
 *  1_000_000). Lives here (barrel-invisible) because the mix is consumed by
 *  the arrival step's CONFIG, not by the runtime contract types. */
export interface FamilyMixEntry {
  readonly family: ThreatFamily;
  readonly shareMicro: number;
}

/** Cumulative-scan roll over a validated mix (total exactly 1_000_000). */
export function weightedFamilyOf(mix: readonly FamilyMixEntry[], rollMicro: number): ThreatFamily {
  let acc = 0;
  for (const bucket of mix) {
    acc += bucket.shareMicro;
    if (rollMicro < acc) return bucket.family;
  }
  return mix[mix.length - 1]!.family; // unreachable: rollMicro < 1e6 === sum
}

/** Fail-fast validation at the step's BOUNDARY (parse-don't-validate): the
 *  roll loop can then trust the table completely. */
export function validateFamilyMix(mix: readonly FamilyMixEntry[]): void {
  const seen = new Set<ThreatFamily>();
  let total = 0;
  for (const bucket of mix) {
    if (!Number.isSafeInteger(bucket.shareMicro) || bucket.shareMicro <= 0) {
      throw new Error(`arrival familyMix: ${bucket.family} shareMicro must be a positive integer, got ${String(bucket.shareMicro)}`);
    }
    if (seen.has(bucket.family)) {
      throw new Error(`arrival familyMix: duplicate family "${bucket.family}"`);
    }
    seen.add(bucket.family);
    total += bucket.shareMicro;
  }
  if (total !== 1_000_000) {
    throw new Error(`arrival familyMix: shares sum to ${total}, must equal exactly 1000000 (use waves.parseFamilyWeightsTable to renormalise)`);
  }
}

/* ═══════════════════ R-06 · class-aware shed ordering ═══════════════════ */

/**
 * Rank of a shed candidate at ONE node (lower = dies earlier in the terminal
 * ledger). §7.11 "sold classes cannot be shed" binds the ORDER: the cheap
 * classes walk off first, the sold ones go last, and an UNCLASSIFIED unit —
 * no contract, no seat to defend — heads the list. The WS-5 R57 "unclassified
 * sheds at random" flavour is deliberately replaced by the deterministic
 * unitId tie-break: the ladder is the same ladder, only its ORDER moves, and
 * a coin flip would perturb the streams of every other roll for zero law.
 */
function shedBucket(unit: Unit | undefined, def: QosClassDef | undefined, metric: "priority" | "value"): number {
  if (unit === undefined) return -2; // ghost (foreign list): earliest, id-ordered
  if (def === undefined) return -1; // unclassified / stale class id: no contract to defend
  return metric === "priority" ? def.shedPriority : Number(def.weight);
}

/** One node's shed list, ordered by its authored `shedOrder` law (R-06, §7.11).
 *  The hard-ceiling discipline sheds the WHOLE residual queue every tick, so
 *  "selection" is the ORDER in which units enter the terminal ledger — the
 *  order the outcome step iterates candidates in, the order the bounce events
 *  ride, the order a postmortem reads its triage ladder in:
 *  - "first-in-first-out"  → queue order (the pre-fix behaviour, pinned);
 *  - "last-in-first-out"   → reversed queue order;
 *  - "qos-weighted"        → unclassified first, then class `shedPriority`
 *    ascending ("lower number = shed earlier"), unitId tie-break;
 *  - "lowest-value-first"  → unclassified first, then class `weight`
 *    ascending (capacity share = value proxy; a class's `weight` is the sold
 *    promise), unitId tie-break.
 */
export function orderShedForNode(
  node: NodeRecord,
  queueOrder: readonly EntityId[],
  unitById: ReadonlyMap<EntityId, Unit>,
  classes: readonly QosClassDef[],
): readonly EntityId[] {
  switch (node.shedOrder) {
    case "first-in-first-out":
      return [...queueOrder];
    case "last-in-first-out":
      return [...queueOrder].reverse();
    case "qos-weighted":
    case "lowest-value-first": {
      const byClass = new Map(classes.map((def) => [def.id, def]));
      const metric = node.shedOrder === "qos-weighted" ? "priority" : "value";
      const bucket = (unitId: EntityId): number =>
        shedBucket(unitById.get(unitId), byClass.get(unitById.get(unitId)?.qosClassId ?? ""), metric);
      return [...queueOrder].sort((a, b) => bucket(a) - bucket(b) || compareEntityId(a, b));
    }
  }
}

/**
 * Re-order the serve step's flat `shed` channel by each shedding node's law.
 * The queue is cleared inside the step, so the unit→node link is read from
 * `routeHops[0]` — the FIX-8 invariant (a queued unit's hop IS its queue
 * node) makes this exact for every default-authored board. Units whose hop
 * names no known node pass through in their original relative position:
 * foreign steps may forge anything, and a forged entry must never be silently
 * dropped. Contiguous same-node runs are ordered independently, so a
 * multi-node shed list keeps its per-node segments.
 */
export function orderShedForTick(
  shed: readonly EntityId[],
  nodes: ReadonlyMap<EntityId, NodeRecord>,
  unitById: ReadonlyMap<EntityId, Unit>,
  classes: readonly QosClassDef[],
): readonly EntityId[] {
  if (shed.length === 0) return shed;
  const runs: { readonly nodeId: EntityId | null; readonly ids: EntityId[] }[] = [];
  for (const unitId of shed) {
    const hop = unitById.get(unitId)?.routeHops[0] ?? null;
    const nodeId = hop !== null && nodes.has(hop) ? hop : null;
    const last = runs[runs.length - 1];
    if (last !== undefined && last.nodeId === nodeId) last.ids.push(unitId);
    else runs.push({ nodeId, ids: [unitId] });
  }
  const out: EntityId[] = [];
  for (const run of runs) {
    if (run.nodeId === null) {
      out.push(...run.ids); // unknown node (ghost/foreign): keep as authored
      continue;
    }
    const node = nodes.get(run.nodeId)!;
    out.push(...orderShedForNode(node, run.ids, unitById, classes));
  }
  return Object.freeze(out);
}

export { FIXED_UNIT, FIXED_ZERO, FIXED_SCALE };
