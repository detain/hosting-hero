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
import type { LedgerSnapshot, ThreatInvitations } from "./ledger.ts";
import { bandAfterMastery, gateComposition } from "./ledger.ts";
import type { DirectorState } from "./director.ts";
import { applyEntropyBudgetFactor, applyTroughDepthFactor } from "./director.ts";
import type { PressureParams } from "./pressure.ts";
import { TUNING_SHEETS, mulDivRound, parPressureMicro } from "./pressure.ts";
import type { WaveDefinition, WaveTable } from "./table.ts";

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

/** Units = pressureMicro × sharePct × unitsPerPoint ÷ (100 × 1e6), exact
 *  integer round-half-up in the micro domain (no floats touch logic). */
function entryUnitCount(pressureMicro: bigint, sharePct: number, unitsPerPressurePoint: number): number {
  const numerator = pressureMicro * BigInt(sharePct) * BigInt(unitsPerPressurePoint);
  const denominator = 100n * 1_000_000n;
  return Number((2n * numerator + denominator) / (2n * denominator));
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
  const arrivals: PlannedArrival[] = [];
  const units: Record<string, number> = {};

  for (const entry of gated.spawnable) {
    let count = entryUnitCount(wavePressureMicro, entry.sharePct, table.unitsPerPressurePoint);
    const band = bandAfterMastery(entry.threatId, entry.band, mastery);
    if (band === "entropy") count = applyEntropyBudgetFactor(count, input.director.entropyBudgetFactor);
    // threatIds are unique per wave (parseWave rejects duplicates), so this
    // write can never clobber an earlier threat's existence record (W1).
    units[entry.threatId] = count;
    for (let u = 0; u < count; u += 1) {
      const minute = startMinute + sampleMinute(arrivalStream, weights);
      const pool: readonly string[] = entry.targets;
      const targetId = pool.length === 1 ? pool[0]! : pool[targetStream.range(pool.length)]!;
      arrivals.push({ minute, atUs: BigInt(minute) * MICROS_PER_MIN, threatId: entry.threatId, targetId, unitOrdinal: u + 1 });
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
