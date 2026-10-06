/**
 * Instrumentation model for the observed layer (MASTER_REPORT §4.1 R-66…R-72,
 * hosting_game.md §7.6, §4.5 R42/R43/R44).
 *
 * One structural decision does all the fog: an `InstrumentBinding` routes one
 * ground property (`source`) through one `InstrumentClass` (latency, staleness
 * horizon, resolution band, certainty ceiling) onto one observed property
 * (`target`). Consumers never see ground values — only `ObservedCell`s derived
 * here, so "degradation is a property of the binding layer, not of 200
 * components" (§3.1 law 3).
 *
 * The wrongness channel falls out of the same shape (§7.6: "a health check
 * that checks the wrong thing reports healthy forever"): `source ≠ target`
 * means the probe faithfully reports the WRONG fact — green while ground is
 * failing — and the `misBound` flag records that authoring lie for audit and
 * postmortem tooling without changing the (correct-by-construction) mechanics.
 *
 * Determinism: pure functions over integer µs and Fixed only; the rings are
 * insertion-ordered and flushed by window index, so history content is a pure
 * function of the (value, tickUs) sequences fed to step 12. No wall clock.
 */

import type { CauseId, Fixed, ObservedCell, ObservedKey, SimTimeUs } from "../types.ts";
import { ResolutionBand } from "../types.ts";
import { FIXED_ONE, FIXED_ZERO, clampUnit, fromRatio, mul } from "../kernel/fixed.ts";
import { MICROS_PER_MIN, MICROS_PER_SEC } from "../kernel/time.ts";

/* ═══════════════════ Instrument classes (§7.6 latency corollary) ═══════════════════
 * "graphs are 30–60 s behind by default; tracing is faster; a customer ticket
 * is minutes behind that." A class is closed data — purchasable upgrades swap
 * the binding's class, never the widget (§4.7: "a binding upgrade, not a new
 * widget"). `staleAfterUs` bounds how long the LAST sample still reads live. */

export interface InstrumentClass {
  readonly id: string;
  /** Report delay: the newest ground sample the class can surface is
   *  `tick − lagUs` old. */
  readonly lagUs: SimTimeUs;
  /** Age past which a kept last-value flips to fog grade `stale`. */
  readonly staleAfterUs: SimTimeUs;
  /** Resolution band this class writes into the ladder (§7.6 Telemetry
   *  Resolution: "the interval determines what is true"). */
  readonly band: ResolutionBand;
  /** Certainty ceiling before coverage discount (Fixed 0..1). */
  readonly baseCertainty: Fixed;
}

/** Default graph stack: 5-minute rollups, 45 s behind (mid of the spec's
 *  30–60 s band), readings older than 3 min go stale. */
export const CLASS_GRAPHS_5MIN: InstrumentClass = {
  id: "graphs-5min",
  lagUs: 45n * MICROS_PER_SEC,
  staleAfterUs: 3n * MICROS_PER_MIN,
  band: ResolutionBand.Coarse,
  baseCertainty: 49152n, // 0.75
};

/** 30-second graphs: faster band, same default 30 s latency floor. */
export const CLASS_GRAPHS_30S: InstrumentClass = {
  id: "graphs-30s",
  lagUs: 30n * MICROS_PER_SEC,
  staleAfterUs: 2n * MICROS_PER_MIN,
  band: ResolutionBand.Medium,
  baseCertainty: 55706n, // 0.85
};

/** Distributed tracing: seconds behind, fine phenomena. */
export const CLASS_TRACING: InstrumentClass = {
  id: "tracing",
  lagUs: 5n * MICROS_PER_SEC,
  staleAfterUs: 30n * MICROS_PER_SEC,
  band: ResolutionBand.Fine,
  baseCertainty: 58982n, // 0.90
};

/** Per-packet tap: the top of the ladder, 1 s behind live. */
export const CLASS_PACKET_TAP: InstrumentClass = {
  id: "packet-tap",
  lagUs: 1_000_000n,
  staleAfterUs: 10n * MICROS_PER_SEC,
  band: ResolutionBand.Exact,
  baseCertainty: FIXED_ONE,
};

/** Synthetic health check: a binary probe. Reports the fact IT measures —
 *  bind it to the wrong source and it stays green forever (§7.6 wrongness). */
export const CLASS_HEALTHCHECK: InstrumentClass = {
  id: "healthcheck",
  lagUs: 30n * MICROS_PER_SEC,
  staleAfterUs: 90n * MICROS_PER_SEC,
  band: ResolutionBand.Medium,
  baseCertainty: 62259n, // 0.95
};

/* ═══════════════════ Property→source binding (wrongness channel) ═══════════════════ */

export interface InstrumentBinding {
  readonly instrumentId: string;
  /** The property the player is shown a reading FOR. */
  readonly target: ObservedKey;
  /** The ground property the probe actually READS. Equals target for an
   *  honest instrument. */
  readonly source: ObservedKey;
  readonly cls: InstrumentClass;
  /** Fraction of the property actually sampled, 0..1 (Fixed). A 1-in-20
   *  sampler carries 0.05 — coverage is NOT existence: 0 means the
   *  instrument reports nothing, not zero (§4.1 R-66…R-72). */
  readonly coverage: Fixed;
  /** Authoring flag: the probe checks the wrong thing (auditable lie —
   *  postmortem tooling names it; the cell stream never leaks it). */
  readonly misBound: boolean;
}

/** True when the binding reports a source that is not its target — either
 *  structurally (different key) or by authoring admission (`misBound`). */
export function reportsWrongThing(binding: InstrumentBinding): boolean {
  return binding.misBound || binding.source !== binding.target;
}

/** Validate once at the boundary (Law 2); trusted everywhere after. */
export function validateBinding(binding: InstrumentBinding): void {
  if (binding.instrumentId.length === 0) {
    throw new Error("observed: binding.instrumentId must be non-empty");
  }
  if (binding.coverage < FIXED_ZERO || binding.coverage > FIXED_ONE) {
    throw new Error(`observed: binding ${binding.instrumentId} coverage ${binding.coverage} outside 0..1`);
  }
  if (binding.cls.lagUs < 0n || binding.cls.staleAfterUs <= 0n) {
    throw new Error(`observed: instrument class ${binding.cls.id} needs lagUs ≥ 0 and staleAfterUs > 0`);
  }
  if (binding.cls.baseCertainty < FIXED_ZERO || binding.cls.baseCertainty > FIXED_ONE) {
    throw new Error(`observed: instrument class ${binding.cls.id} baseCertainty outside 0..1`);
  }
}

/* ═══════════════════ Fog grades (§4.5 R42) ═══════════════════
 * Three grades per property: unknown ("?": never observed), stale (a kept
 * last-value past its watermark), live. The grade is computed, never stored
 * twice: `statusFor` is the single source of truth behind ObservedCell.status. */

export function statusFor(opts: {
  readonly hasValue: boolean;
  readonly ageUs: SimTimeUs;
  readonly staleAfterUs: SimTimeUs;
}): "live" | "stale" | "unknown" {
  if (!opts.hasValue) return "unknown";
  return opts.ageUs > opts.staleAfterUs ? "stale" : "live";
}

/** The one canonical "nothing, not zero" cell (§4.1 R-66…R-72): null value,
 *  zero coverage, zero certainty, band None. Renderers draw the "?" face;
 *  existence stays visible because the KEY still projects. */
export function unknownCell(): ObservedCell<unknown> {
  // FIX-8: cells are immutable the moment they exist — a consumer that
  // scribbles on a shared envelope corrupts twin state in place.
  return Object.freeze({
    value: null,
    fidelity: ResolutionBand.None,
    freshnessUs: 0n,
    coverage: FIXED_ZERO,
    certainty: FIXED_ZERO,
    status: "unknown" as const,
  });
}

/** A known-unknown cell for an instrument with partial-but-zero effective
 *  sight: same fog semantics, but keeps the declared coverage so the HUD can
 *  budget against the blind spot ("instrumented: 64% of nodes"). */
export function unknownCellWithCoverage(coverage: Fixed): ObservedCell<unknown> {
  return Object.freeze({ ...unknownCell(), coverage });
}

/* ═══════════════════ Deriving a cell from a ground sample ═══════════════════ */

export interface GroundSample {
  readonly atUs: SimTimeUs;
  readonly value: unknown;
}

/** Derive the observed cell one binding reports at `tickUs`, given the ground
 *  sample its SOURCE had when the class's latency window opened. Pure (§ Law
 *  3). An uninstrumented (coverage 0) or never-yet-sampled binding yields
 *  unknown; a stale binding KEEPS the last value — status says don't trust it. */
export function deriveCell(
  binding: InstrumentBinding,
  sample: GroundSample | null,
  tickUs: SimTimeUs,
): ObservedCell<unknown> {
  if (binding.coverage === FIXED_ZERO) return unknownCellWithCoverage(FIXED_ZERO);
  if (sample === null) return unknownCellWithCoverage(binding.coverage);

  const ageUs = tickUs >= sample.atUs ? tickUs - sample.atUs : 0n;
  const status = statusFor({
    hasValue: true,
    ageUs,
    staleAfterUs: binding.cls.staleAfterUs,
  });
  // Certainty = ceiling × sampled fraction. A mis-bound probe keeps FULL
  // certainty about the wrong fact — confidently, usefully, structurally
  // wrong (§7.6); there is no mechanic that could warn the player, by design.
  const certainty = clampUnit(mul(binding.cls.baseCertainty, binding.coverage));
  return Object.freeze({
    value: sample.value,
    fidelity: binding.cls.band,
    freshnessUs: ageUs,
    coverage: binding.coverage,
    certainty,
    status,
  });
}

/* ═══════════════════ Resolution ladder: rings + downsampled histories ═══════════════════
 * "multiple downsampled histories per graph" (§4.7); "you can keep a year at
 * 5 minutes or a week at one second, not both" (§7.6) — the trade is encoded
 * mechanically: each band keeps `capacity` points over its own window, so
 * span = capacity × window and finer bands retain proportionally less time. */

export interface BandSpec {
  readonly band: ResolutionBand;
  /** Rollup window; 0n = store every sample verbatim (per-packet). */
  readonly windowUs: SimTimeUs;
  /** Points retained (the retention half of the trade). */
  readonly capacity: number;
}

export const RESOLUTION_LADDER: readonly BandSpec[] = [
  { band: ResolutionBand.Coarse, windowUs: 5n * MICROS_PER_MIN, capacity: 4_032 }, // ≈14 sim-days
  { band: ResolutionBand.Medium, windowUs: 30n * MICROS_PER_SEC, capacity: 2_880 }, // ≈24 sim-hours
  { band: ResolutionBand.Fine, windowUs: MICROS_PER_SEC, capacity: 3_600 }, // ≈1 sim-hour
  { band: ResolutionBand.Exact, windowUs: 0n, capacity: 512 }, // last 512 packets
] as const;

/** One retained point. `sampleCount` > 1 marks a downsampled aggregate — the
 *  flat-green-line-over-dropping-packets artifact §7.6 promises: a TRUE
 *  average of a situation that is not average. */
export interface LadderPoint {
  readonly atUs: SimTimeUs;
  readonly value: unknown;
  readonly sampleCount: number;
}

/** Fixed-capacity FIFO of points, chronological. Insertion order is the only
 *  iteration order (§3.4 runtime-neutral discipline). */
export class PointRing {
  readonly capacity: number;
  #points: LadderPoint[] = [];

  constructor(capacity: number) {
    if (!Number.isSafeInteger(capacity) || capacity < 1) {
      throw new Error(`PointRing: capacity must be an integer ≥ 1, got ${capacity}`);
    }
    this.capacity = capacity;
  }

  push(point: LadderPoint): void {
    this.#points.push(point);
    if (this.#points.length > this.capacity) {
      this.#points = this.#points.slice(this.#points.length - this.capacity);
    }
  }

  get length(): number {
    return this.#points.length;
  }

  /** Oldest kept → newest kept. Caller must not mutate the elements
   *  (LadderPoint is all-readonly). */
  points(): readonly LadderPoint[] {
    return this.#points;
  }
}

/** Pending downsample accumulator for one (key × band) pair. */
interface RollupState {
  windowIndex: bigint | null;
  sum: bigint | null; // only when every value folded was bigint (Fixed/counts)
  count: number;
  lastValue: unknown;
}

function freshRollup(): RollupState {
  return { windowIndex: null, sum: null, count: 0, lastValue: null };
}

/** One band's history: raw ring (window 0) plus rollup bookkeeping. */
interface BandHistory {
  readonly spec: BandSpec;
  readonly ring: PointRing;
  rollup: RollupState;
}

/** Per-property ladder: `Map<ObservedKey, Map<bandOrdinal, BandHistory>>`.
 *  Iterated only through the explicit RESOLUTION_LADDER order below, so
 *  Map-insertion nondeterminism can never reach the digest. */
export class ResolutionLadder {
  #byKey: Map<ObservedKey, Map<number, BandHistory>> = new Map();

  /** Retain one observation. `band` is the fidelity of the reporting
   *  instrument: the reporting band's ring gets the raw point; every COARSER
   *  band folds it into its rolling window average; finer bands can never
   *  invent resolution they did not sample (upsampling is a lie we don't
   *  tell — §7.6: the interval determines what is true). */
  fold(key: ObservedKey, band: ResolutionBand, value: unknown, atUs: SimTimeUs): void {
    let byBand = this.#byKey.get(key);
    if (byBand === undefined) {
      byBand = new Map();
      this.#byKey.set(key, byBand);
    }
    for (const spec of RESOLUTION_LADDER) {
      if (spec.band > band) continue;
      const history = ensureBand(byBand, spec);
      if (spec.band === band) {
        history.ring.push({ atUs, value, sampleCount: 1 });
        continue;
      }
      // Strictly coarser than the reporting band: aggregate-only retention.
      foldIntoRollup(history, value, atUs);
    }
  }

  /** Chronological retained points for one (key × band); empty when nothing
   *  at that scale was ever observed — "no data", not a zero line. */
  history(key: ObservedKey, band: ResolutionBand): readonly LadderPoint[] {
    const byBand = this.#byKey.get(key);
    if (byBand === undefined) return [];
    const history = byBand.get(band);
    if (history === undefined) return [];
    return history.ring.points();
  }

  /** Keys ever folded (for digests). */
  keys(): IterableIterator<ObservedKey> {
    return this.#byKey.keys();
  }

  pointCount(key: ObservedKey, band: ResolutionBand): number {
    return this.history(key, band).length;
  }
}

function ensureBand(byBand: Map<number, BandHistory>, spec: BandSpec): BandHistory {
  const existing = byBand.get(spec.band);
  if (existing !== undefined) return existing;
  const created: BandHistory = { spec, ring: new PointRing(spec.capacity), rollup: freshRollup() };
  byBand.set(spec.band, created);
  return created;
}

/** Fold one value into the band's current window; flush the completed window
 *  as a single averaged point when the window index advances. Empty windows
 *  (no samples) flush NOTHING — silence stays silence (§7.6 alert-freedom
 *  from fabricating zero traffic). */
function foldIntoRollup(history: BandHistory, value: unknown, atUs: SimTimeUs): void {
  const windowUs = history.spec.windowUs;
  if (windowUs === 0n) return; // raw band — handled by the caller
  const rollup = history.rollup;
  const windowIndex = atUs / windowUs;
  if (rollup.windowIndex !== null && windowIndex > rollup.windowIndex) {
    flushRollup(history);
  }
  if (rollup.windowIndex === null) rollup.windowIndex = windowIndex;
  rollup.count += 1;
  rollup.lastValue = value;
  if (typeof value === "bigint") {
    rollup.sum = rollup.sum === null ? value : rollup.sum + value;
  } else {
    rollup.sum = null; // mixed/non-numeric series roll up to last-value (documented)
  }
}

function flushRollup(history: BandHistory): void {
  const rollup = history.rollup;
  if (rollup.windowIndex !== null && rollup.count > 0) {
    const windowStart = rollup.windowIndex * history.spec.windowUs;
    const value = rollup.sum !== null ? rollup.sum / BigInt(rollup.count) : rollup.lastValue;
    history.ring.push({ atUs: windowStart, value, sampleCount: rollup.count });
  }
  history.rollup = freshRollup();
}

/* ═══════════════════ Ground history (lag sampling source) ═══════════════════
 * Instruments read the past: "graphs are 30–60 s behind" means the value a
 * graph shows NOW is the ground value from NOW − lag. A per-key bounded
 * sample ring gives every class exact time-shifted reads without retaining
 * the whole save in RAM. */

export class GroundHistory {
  readonly capacity: number;
  #samples: GroundSample[] = [];
  /** Monotonic write counter — a pure digest input (catches same-value churn
   *  and same-µs double patches that atUs alone would hide). */
  version = 0;

  constructor(capacity = 512) {
    if (!Number.isSafeInteger(capacity) || capacity < 2) {
      throw new Error(`GroundHistory: capacity must be an integer ≥ 2, got ${capacity}`);
    }
    this.capacity = capacity;
  }

  push(sample: GroundSample): void {
    const newest = this.#samples[this.#samples.length - 1];
    if (newest !== undefined && sample.atUs < newest.atUs) {
      throw new Error(
        `GroundHistory: sample at ${sample.atUs}µs precedes newest ${newest.atUs}µs — step 12 batches must be monotonic`,
      );
    }
    this.#samples.push(sample);
    if (this.#samples.length > this.capacity) {
      this.#samples = this.#samples.slice(this.#samples.length - this.capacity);
    }
    this.version += 1;
  }

  /** Newest sample at-or-before `asOfUs`, or null when the property did not
   *  exist yet at that moment. Binary search over an insertion-sorted ring —
   *  deterministic, locale-free. */
  sampleAt(asOfUs: SimTimeUs): GroundSample | null {
    let low = 0;
    let high = this.#samples.length - 1;
    let found: GroundSample | null = null;
    while (low <= high) {
      const mid = (low + high) >> 1;
      const candidate = this.#samples[mid];
      if (candidate === undefined) break;
      if (candidate.atUs <= asOfUs) {
        found = candidate;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return found;
  }

  latest(): GroundSample | null {
    return this.#samples[this.#samples.length - 1] ?? null;
  }

  get length(): number {
    return this.#samples.length;
  }
}

/* ═══════════════════ Bounded-fog fairness helpers (§7.6 rule 3) ═══════════════════
 * "Fog costs time, never certainty. An uninstrumented system can always be
 *  diagnosed by hand — it just takes 4–8× as long." The helper is pure
 *  arithmetic for the by-hand-diagnosis timer: the clock side of a diagnosis
 *  action. It touches NO cell — retrying by hand cannot mint certainty; only
 *  instrumentation writes can (structurally: this module has no setter). */

export type HandDiagnosisFactor = 4 | 8;

export function byHandDiagnosisUs(baseProbeUs: SimTimeUs, factor: HandDiagnosisFactor): SimTimeUs {
  if (baseProbeUs <= 0n) {
    throw new Error(`byHandDiagnosisUs: base probe must be positive, got ${baseProbeUs}µs`);
  }
  return baseProbeUs * BigInt(factor);
}

/* ═══════════════════ Cell validation (boundary parse, Law 2) ═══════════════════ */

const VALID_STATUSES: readonly string[] = ["live", "stale", "unknown"];

/** Fail loud on a poison cell before it can enter replay state — a probability
 *  outside 0..1 or a float freshness is the replay-poison class of bug. */
export function validateCell(cell: ObservedCell<unknown>, context: CauseId | string): void {
  if (cell.coverage < FIXED_ZERO || cell.coverage > FIXED_ONE) {
    throw new Error(`observed: cell coverage ${cell.coverage} outside 0..1 (${context})`);
  }
  if (cell.certainty < FIXED_ZERO || cell.certainty > FIXED_ONE) {
    throw new Error(`observed: cell certainty ${cell.certainty} outside 0..1 (${context})`);
  }
  if (cell.freshnessUs < 0n) {
    throw new Error(`observed: cell freshnessUs ${cell.freshnessUs} negative (${context})`);
  }
  if (!VALID_STATUSES.includes(cell.status)) {
    throw new Error(`observed: cell status "${cell.status}" not a fog grade (${context})`);
  }
  if (cell.status === "unknown" && cell.value !== null) {
    throw new Error(`observed: unknown-grade cell must carry null value — nothing, not zero (${context})`);
  }
}

/** Ratio helper for HUD coverage counters (Fixed, from integer counts —
 *  never a float percentage). */
export function coverageRatio(instrumented: number, total: number): Fixed {
  if (total === 0) return FIXED_ZERO;
  return fromRatio(BigInt(instrumented), BigInt(total));
}
