/**
 * Wave generator — turns an authored WaveTable + ledger state + director
 * state into concrete arrivals.
 *
 * The one law (§4.1 R-16): randomness decides TIMING and TARGET, never
 * EXISTENCE. Everything about WHAT exists — which threats, how many units,
 * which fronts — derives from the table, the pressure sheet, the ledger
 * gate and the director's budget factors, all deterministic. Two seeds over
 * one table produce an IDENTICAL multiset of (threatId → unit count); they
 * differ only in minute offsets and target picks.
 *
 * RNG domains (forks of the caller's per-wave stream — forks consume nothing
 * from the parent, so domains can't perturb each other):
 *   "placement" — envelope start slot in the window (timing)
 *   "arrival"   — per-unit minute inside the envelope (timing)
 *   "target"    — per-unit target pick (target)
 */
import type {
  RngStream,
  RunSeed,
  SimEvent,
  SimMinute,
  SimTick,
  SimTimeUs,
  ThreatFamily,
  WaveEnvelope,
} from "../types.ts";
import { asCauseId, asEntityId } from "../types.ts";
import { MICROS_PER_MIN } from "../kernel/time.ts";
import { streamFor } from "../kernel/rng.ts";
import type { EventEnvelope, EnvelopeCompositionEntry } from "./envelope.ts";
import { drawPlacementMinute, minuteWeights, toWaveEnvelope } from "./envelope.ts";
import { contentionProbabilityMicro, type OversellPressure } from "./contention.ts";
import type { LedgerSnapshot, ThreatInvitations } from "./ledger.ts";
import { bandAfterMastery, gateComposition } from "./ledger.ts";
import type { DirectorState } from "./director.ts";
import { applyEntropyBudgetFactor, applyTroughDepthFactor } from "./director.ts";
import type { PressureParams } from "./pressure.ts";
import { TUNING_SHEETS, mulDivRound, parPressureMicro } from "./pressure.ts";
import type { WaveDefinition, WaveRules, WaveTable } from "./table.ts";

export interface PlannedArrival {
  readonly minute: SimMinute;
  readonly atUs: SimTimeUs;
  readonly threatId: string;
  readonly targetId: string;
  /** 1-based order within this threat for this wave (stable identity). */
  readonly unitOrdinal: number;
}

export interface WavePlan {
  readonly tableId: string;
  readonly waveN: number;
  /** Absolute sim-minute the envelope starts (placement draw result). */
  readonly startMinute: SimMinute;
  readonly envelope: EventEnvelope;
  /** This wave's pressure budget after par% and director trough depth. */
  readonly pressureMicro: bigint;
  /** Sorted by (atUs, threatId, unitOrdinal) — deterministic replay order. */
  readonly arrivals: readonly PlannedArrival[];
  /** threatId → authored unit count (existence record, for invariance CI). */
  readonly unitsByThreat: Readonly<Record<string, number>>;
  /** Authored threats withheld by the ledger gate (deterministic, not RNG). */
  readonly deferredThreatIds: readonly string[];
  readonly waveEnvelope: WaveEnvelope;
  readonly events: readonly SimEvent[];
}

export interface WavePlanInput {
  /** Sim-minute from which this wave may be placed (window start). */
  readonly startMinute: SimMinute;
  readonly tick: SimTick;
  readonly rng: RngStream;
  readonly director: DirectorState;
  readonly ledger: LedgerSnapshot;
  readonly invitations: ThreatInvitations;
  readonly masteryCounts?: ReadonlyMap<string, number>;
  readonly entropyForecastPurchased: boolean;
  /** Override the tuning-sheet params — default: the table's own sheet
   *  (the active sheet is B — RATIFIED 2026-10-09, OD-2, ADR-0009). */
  readonly pressureParams?: PressureParams;
  /** AUDIT FIX 2 (§oversell-ratio, heading 22992): when the host oversells a
   *  scarce pool, each arrival rolls one contention die BEFORE its minute
   *  draw; a hit clumps the unit onto the envelope peak (correlated wake-ups
   *  of identical tenants). Absent — or ratio ≤ 1.0, where P is provably
   *  zero and the die is never rolled — the plan is byte-identical. */
  readonly oversell?: OversellPressure;
  /** AUDIT FIX 4b (§2.24 second incident): the host-reported incident
   *  window. A flagged wave's follow-on copy fires only while "active" or
   *  "recovering" (multipliers per state); absent ≙ "quiet" ≙ inert. */
  readonly incidentState?: "active" | "recovering" | "quiet";
  /** AUDIT FIX 4c (§2.24 copycat): the family the player's defenses
   *  concentrate on. When the table authors `rules.copycatReservePct`, that
   *  family's entries reserve the lower-bound share of the wave budget —
   *  threats copy what they copy. Absent ⇒ authored shares, byte-identical. */
  readonly dominantDefenseFamily?: ThreatFamily;
}

function cmpStr(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function buildEnvelope(
  wave: WaveDefinition,
  startUs: SimTimeUs,
  composition: readonly EnvelopeCompositionEntry[],
  telegraphBand: EventEnvelope["telegraphBand"],
  tableId: string,
): EventEnvelope {
  return {
    id: `${tableId}/wave-${wave.n}`,
    tableId,
    startUs,
    rampUs: BigInt(wave.rampMin) * MICROS_PER_MIN,
    plateauUs: BigInt(wave.plateauMin) * MICROS_PER_MIN,
    decayUs: BigInt(wave.decayMin) * MICROS_PER_MIN,
    composition,
    telegraphBand,
  };
}

/** Deterministic dominant family: highest summed share, tie → lexicographic. */
export function dominantFamilyOf(
  entries: readonly { readonly family: ThreatFamily; readonly sharePct: number }[],
): ThreatFamily | "organic" {
  if (entries.length === 0) return "organic";
  const totals = new Map<ThreatFamily, number>();
  for (const e of entries) totals.set(e.family, (totals.get(e.family) ?? 0) + e.sharePct);
  const ranked = [...totals.entries()].sort((a, b) => (b[1] !== a[1] ? b[1] - a[1] : cmpStr(a[0], b[0])));
  return ranked[0]![0];
}

/** Units = pressureMicro × shareMicro × unitsPerPoint ÷ 1e12, exact integer
 *  round-half-up in the micro domain (no floats touch logic). The authored
 *  integer-percent path passes shareMicro = sharePct × 10_000n, which
 *  reproduces the legacy ÷(100 × 1e6) formula EXACTLY (both terms scale
 *  by 1e4 — same half-up quotient). */
function entryUnitCountMicro(pressureMicro: bigint, shareMicro: bigint, unitsPerPressurePoint: number): number {
  const numerator = pressureMicro * shareMicro * BigInt(unitsPerPressurePoint);
  const denominator = 1_000_000n * 1_000_000n;
  return Number((2n * numerator + denominator) / (2n * denominator));
}

/* ─────────────── AUDIT FIX 4c · §2.24 copycat share rescale ─────────────── */

/**
 * When the table authors `rules.copycatReservePct` AND the host reports a
 * dominant defense family, the wave reserves the rule's LOWER bound of its
 * budget for every entry of that family — threats copy what defends them.
 * Returns threatId → shareMicro summing to exactly 1e6, or null when the
 * law is inert (no rule / no input family / zero reserve / nothing matches:
 * callers then fall back to the authored integer shares, byte-identical).
 * Determinism: non-matching entries floor-scale first, the remainder lands
 * on matching entries ∝ their base via largest-remainder (ties → bigger
 * remainder, then threatId code-unit).
 */
function copycatShareMicroByThreat(
  entries: readonly { readonly threatId: string; readonly family: ThreatFamily; readonly sharePct: number }[],
  rules: WaveRules | undefined,
  defenseFamily: ThreatFamily | undefined,
): ReadonlyMap<string, bigint> | null {
  const band = rules?.copycatReservePct;
  if (band === undefined || defenseFamily === undefined) return null;
  const reserveMicro = BigInt(Math.round(band[0] * 10_000));
  if (reserveMicro <= 0n) return null;
  const sorted = [...entries].sort((a, b) => cmpStr(a.threatId, b.threatId));
  const matched = sorted.filter((e) => e.family === defenseFamily);
  if (matched.length === 0) return null;
  const shares = new Map<string, bigint>();
  let nonMatchTotal = 0n;
  for (const e of sorted) {
    if (e.family === defenseFamily) continue;
    const scaled = (BigInt(e.sharePct) * 10_000n * (1_000_000n - reserveMicro)) / 1_000_000n;
    shares.set(e.threatId, scaled);
    nonMatchTotal += scaled;
  }
  const matchedBase = matched.reduce((s, e) => s + BigInt(e.sharePct) * 10_000n, 0n);
  if (matchedBase <= 0n) {
    throw new Error("planWave: copycat reserve matched only zero-share entries — authoring bug");
  }
  const pool = 1_000_000n - nonMatchTotal; // matched get AT LEAST the reserve: flooring only under-allocates non-matches
  const quotas = matched.map((e) => {
    const exact = (pool * BigInt(e.sharePct) * 10_000n) / matchedBase;
    return { threatId: e.threatId, floor: exact, rem: (pool * BigInt(e.sharePct) * 10_000n) % matchedBase };
  });
  let leftover = pool - quotas.reduce((s, q) => s + q.floor, 0n);
  const ranked = [...quotas].sort((a, b) => (a.rem !== b.rem ? (a.rem > b.rem ? -1 : 1) : cmpStr(a.threatId, b.threatId)));
  for (let i = 0; leftover > 0n; i += 1) {
    ranked[i % ranked.length]!.floor += 1n; // ranked holds the quota objects — mutation lands on quotas
    leftover -= 1n;
  }
  for (const q of quotas) shares.set(q.threatId, q.floor);
  return shares;
}

/** Sample a minute index against integer cumulative weights (timing draw). */
function sampleMinute(rng: RngStream, weights: readonly number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) throw new Error("generator: envelope weight profile is empty");
  if (total >= 2 ** 31) throw new Error(`generator: weight total ${total} exceeds rng range bound`);
  const roll = rng.range(total);
  let acc = 0;
  for (let i = 0; i < weights.length; i += 1) {
    acc += weights[i]!;
    if (roll < acc) return i;
  }
  return weights.length - 1; // unreachable: roll < total === sum(weights)
}

/**
 * Plan wave `waveN` (1-based) of a parsed table. Pure given
 * (table, rng stream, ledger, director) — no hidden mutation, no
 * Math.random, no Date.now.
 */
export function planWave(table: WaveTable, waveN: number, input: WavePlanInput): WavePlan {
  const wave = table.waves.find((w) => w.n === waveN);
  if (wave === undefined) throw new Error(`planWave: table ${table.id} has no wave n=${waveN}`);
  if (!Number.isSafeInteger(input.startMinute) || input.startMinute < 0) {
    throw new Error(`planWave: bad startMinute ${String(input.startMinute)}`);
  }

  // 1. Ledger gate FIRST — a threat exists only if its invitation exists (G2).
  const gated = gateComposition(wave.entries, input.ledger, input.invitations);

  // 2. Placement — RNG decides WHEN, never WHETHER (R-16).
  const envelopeMinutes = Math.max(wave.rampMin + wave.plateauMin + wave.decayMin, 1);
  const placementOffset = drawPlacementMinute(input.rng.fork("placement"), wave.windowMinutes, envelopeMinutes);
  const startMinute = input.startMinute + placementOffset;
  const startUs = BigInt(startMinute) * MICROS_PER_MIN;

  // 3. Mastery demotion — telegraph dimmer only; composition stays authored.
  const mastery = input.masteryCounts ?? new Map<string, number>();
  const composition: EnvelopeCompositionEntry[] = gated.spawnable.map((e) => ({
    threatId: e.threatId,
    sharePct: e.sharePct,
    band: bandAfterMastery(e.threatId, e.band, mastery),
  }));
  const dominantEntry = [...composition].sort((a, b) => b.sharePct - a.sharePct || cmpStr(a.threatId, b.threatId))[0];
  const envelope = buildEnvelope(wave, startUs, composition, dominantEntry?.band ?? "weather", table.id);

  // 4. Pressure budget — the table's sheet (active sheet B — RATIFIED
  //    2026-10-09, OD-2, ADR-0009); director may deepen troughs only.
  const baseParams = input.pressureParams ?? TUNING_SHEETS[table.tuningSheet].params;
  const params: PressureParams = {
    ...baseParams,
    sawtoothMicro: applyTroughDepthFactor(baseParams.sawtoothMicro, input.director.troughDepthFactor),
  };
  // N5: par% spend in the module's round-half-up convention — the old
  // truncating `/` biased every non-exact wave budget up to one micro low.
  const wavePressureMicro = mulDivRound(parPressureMicro(params, waveN - 1) * BigInt(wave.parPct), 100n);

  // 5. Unit counts — EXISTENCE = table × ledger × director budget (never RNG).
  const weights = minuteWeights(envelope);
  const targetStream = input.rng.fork("target");
  const arrivalStream = input.rng.fork("arrival");
  // Oversell contention (audit fix 2): probability in micro-units, peak
  // minute = first arg-max of the authored profile (code-unit-free, pure).
  const contentionMicro = input.oversell === undefined ? 0n : contentionProbabilityMicro(input.oversell);
  let peakIndex = 0;
  if (contentionMicro > 0n) {
    for (let i = 1; i < weights.length; i += 1) if (weights[i]! > weights[peakIndex]!) peakIndex = i;
  }
  const arrivals: PlannedArrival[] = [];
  const units: Record<string, number> = {};

  // Copycat (§2.24, audit fix 4c): null ⇒ authored shares → byte-identical.
  const copycatShares = copycatShareMicroByThreat(gated.spawnable, table.rules, input.dominantDefenseFamily);

  for (const entry of gated.spawnable) {
    const shareMicro = copycatShares?.get(entry.threatId) ?? BigInt(entry.sharePct) * 10_000n;
    let count = entryUnitCountMicro(wavePressureMicro, shareMicro, table.unitsPerPressurePoint);
    const band = bandAfterMastery(entry.threatId, entry.band, mastery);
    if (band === "entropy") count = applyEntropyBudgetFactor(count, input.director.entropyBudgetFactor);
    // threatIds are unique per wave (parseWave rejects duplicates), so this
    // write can never clobber an earlier threat's existence record (W1).
    units[entry.threatId] = count;
    for (let u = 0; u < count; u += 1) {
      const offset =
        contentionMicro > 0n && arrivalStream.range(1_000_000) < Number(contentionMicro)
          ? peakIndex
          : sampleMinute(arrivalStream, weights);
      const minute = startMinute + offset;
      const pool: readonly string[] = entry.targets;
      const targetId = pool.length === 1 ? pool[0]! : pool[targetStream.range(pool.length)]!;
      arrivals.push({ minute, atUs: BigInt(minute) * MICROS_PER_MIN, threatId: entry.threatId, targetId, unitOrdinal: u + 1 });
    }
  }

  // Feint (§2.24, audit fix 4a): the first quarter (min 1) of every entry's
  // ordinals re-parks on the envelope's opening beat — a decoy clump BEFORE
  // the real body. Timing-only split: zero existence change, zero RNG cost,
  // so two seeds still produce the same multiset.
  if (wave.feint === true && table.rules?.feints !== undefined) {
    for (let i = 0; i < arrivals.length; i += 1) {
      const a = arrivals[i]!;
      const count = units[a.threatId] ?? 0;
      const decoys = Math.max(1, Math.floor(count / 4));
      if (a.unitOrdinal <= decoys) arrivals[i] = { ...a, minute: startMinute, atUs: startUs };
    }
  }

  // Second incident (§2.24, audit fix 4b): while an incident window is open,
  // a flagged wave's traffic is followed by a scaled copy AFTER the envelope
  // — the outage that keeps arriving. Ordinals continue past the authored
  // count so unitIds stay unique under the existing `table~N~threat~ord`
  // grammar; the follow-on mirrors each original's minute offset and target.
  const incident = input.incidentState ?? "quiet";
  const siMultiplier =
    wave.secondIncident === true
      ? incident === "active"
        ? table.rules?.secondIncidentMultiplierDuringIncident
        : incident === "recovering"
          ? table.rules?.secondIncidentMultiplierDuringRecovery
          : undefined
      : undefined;
  if (siMultiplier !== undefined) {
    const extraMicro = BigInt(Math.round((siMultiplier - 1) * 1_000_000));
    const originalsByThreat = new Map<string, PlannedArrival[]>();
    for (const a of arrivals) {
      const list = originalsByThreat.get(a.threatId);
      if (list === undefined) originalsByThreat.set(a.threatId, [a]);
      else list.push(a);
    }
    for (const [threatId, originals] of [...originalsByThreat].sort((a, b) => cmpStr(a[0], b[0]))) {
      const count = originals.length;
      if (count === 0) continue;
      const extra = Number(mulDivRound(BigInt(count) * extraMicro, 1_000_000n));
      for (let j = 0; j < extra; j += 1) {
        const src = originals[j % count]!;
        const minute = startMinute + envelopeMinutes + (src.minute - startMinute);
        arrivals.push({ minute, atUs: BigInt(minute) * MICROS_PER_MIN, threatId, targetId: src.targetId, unitOrdinal: count + j + 1 });
      }
    }
  }

  arrivals.sort((x, y) =>
    x.atUs !== y.atUs ? (x.atUs < y.atUs ? -1 : 1) : cmpStr(x.threatId, y.threatId) || x.unitOrdinal - y.unitOrdinal,
  );

  // 6. Arrival events for the SimEvent channel (cause pinned, replay-stable).
  // All arrivals were planned AT this tick — arrival TIME lives in `atUs`
  // (N4: the old `+ i` ordinal ramp masqueraded as per-arrival ticks).
  const events: SimEvent[] = arrivals.map((a) => ({
    kind: "arrival" as const,
    atUs: a.atUs,
    tick: input.tick,
    causeId: asCauseId(`${table.id}#wave-${waveN}#${a.threatId}#${a.unitOrdinal}`),
    unitId: asEntityId(`${table.id}~${waveN}~${a.threatId}~${a.unitOrdinal}`),
    envelopeTableId: envelope.id,
  }));

  const waveEnvelope = toWaveEnvelope(envelope, {
    role: "wave",
    unitsTotal: arrivals.length,
    dominantFamily: dominantFamilyOf(gated.spawnable),
    entropyForecastPurchased: input.entropyForecastPurchased,
    atUs: startUs,
  });

  return {
    tableId: table.id,
    waveN,
    startMinute,
    envelope,
    pressureMicro: wavePressureMicro,
    arrivals,
    unitsByThreat: units,
    deferredThreatIds: gated.deferred,
    waveEnvelope,
    events,
  };
}

/** Open the per-wave rng domain stream for a run seed. */
export function waveStream(runSeed: RunSeed, waveN: number, simMinute: SimMinute): RngStream {
  if (waveN < 1) throw new Error(`waveStream: waveN must be ≥ 1, got ${waveN}`);
  return streamFor(runSeed, `wave/${waveN}`, simMinute);
}
