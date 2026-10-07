/**
 * ObservedStore — the ground/observed twin store (MASTER_REPORT §3.1 laws
 * 1–3, §4.1 R-66…R-72, hosting_game.md §7.6 + §7.13 step 12).
 *
 * Per-PROPERTY dual state:
 *  - `#ground`  — the ground entity/property registry (values, change history
 *                 for lag sampling, authored fairness channel). HARD-private:
 *                 no public method returns a ground value except the two
 *                 fairness channels, which are the §7.6 bounded-fog exception
 *                 authored into the design ("the Pulse Strip and the Site
 *                 Preview Window are never lied to").
 *  - `#cells`   — the observed layer every consumer else reads.
 *  - `#bindings`/`#ladder` — instrumentation state: what reports what, at
 *                 what lag/band/coverage, plus the retained downsampled
 *                 histories per resolution band.
 *
 * THE ONLY WRITE PATH is `applyObservedWrites(records, tickUs)`, invoked at
 * pipeline step 12 ("steps 1–11 operate on ground truth; step 12 writes the
 * observed layer" — §7.13). The gate is machine-enforced three ways:
 *  1. No other public mutator exists on the class (parse-at-the-boundary:
 *     instrumentation state arrives as records INSIDE the step-12 batch);
 *  2. a batch stamped at a tick older than the watermark throws — the store
 *     refuses out-of-order truth edits from anywhere but the forward pipeline;
 *  3. ground values are only ever readable back as fog-filtered cells
 *     (`deriveCell`), so even the store's own output channels cannot be used
 *     to exfiltrate un-instrumented truth.
 *
 * Reading ground truth from the observed side is TYPE-IMPOSSIBLE: `#ground`
 * is an ECMAScript private field (not enumerable, not reachable via
 * `Object.*`, not on the prototype), `read()` returns `ObservedCell` — the
 * degraded envelope — and nothing in the public signature accepts or yields a
 * ground record. §3.1 law 1: "Ground truth has exactly one consumer in the
 * whole system: the 12-step pipeline itself" — this store gives the pipeline
 * its twin layer WITHOUT giving any consumer the truth.
 */

import type { CauseId, EntityId, Fixed, ObservedCell, ObservedKey, ObservedWrite, SimTimeUs } from "../types.ts";
import { ResolutionBand, asCauseId } from "../types.ts";
import { FIXED_ONE, FIXED_ZERO } from "../kernel/fixed.ts";
import { MICROS_PER_MIN } from "../kernel/time.ts";
import {
  GroundHistory,
  ResolutionLadder,
  coverageRatio,
  deriveCell,
  unknownCell,
  validateBinding,
  validateCell,
  type InstrumentBinding,
  type LadderPoint,
} from "./instrument.ts";
import { compareCodeUnits, fnv1a64OverCodePoints } from "../internal/canonical.ts";

/* ═══════════════════ Step-12 record shapes ═══════════════════
 * The contract type `ObservedWrite` (types.ts) is pre-Computed-cell traffic:
 * aggregates and producer-side observations that step 12 hands over ready.
 * Ground twin updates and instrument purchases arrive in the SAME batch as
 * discriminated records so there remains exactly ONE write gate. */

/** §7.6 bounded-fog rule 1: authored always-truth channels. A property bound
 *  to a channel is exempt from latency/coverage/certainty degradation — the
 *  fairness contract that keeps fog from becoming a guessing game. */
export type FairnessChannel = "site-preview" | "pulse-strip";

/** Ground twin patch: steps 1–11 established this true value at changedAtUs. */
export interface GroundPatch {
  readonly kind: "ground";
  readonly key: ObservedKey;
  readonly value: unknown;
  readonly changedAtUs: SimTimeUs;
  /** Declared once (at authoring/build time, carried on any patch): pins the
   *  property into a fairness channel. */
  readonly fairnessChannel?: FairnessChannel;
}

/** Instrument purchase/upgrade: later patches for the same target replace
 *  earlier ones — "telemetry resolution zoom is a binding upgrade, not a new
 *  widget" (§4.7). */
export interface InstrumentPatch {
  readonly kind: "instrument";
  readonly binding: InstrumentBinding;
}

export type ObservedRecord = ObservedWrite | GroundPatch | InstrumentPatch;

function isGroundPatch(record: ObservedRecord): record is GroundPatch {
  return "kind" in record && record.kind === "ground";
}

function isInstrumentPatch(record: ObservedRecord): record is InstrumentPatch {
  return "kind" in record && record.kind === "instrument";
}

/* ═══════════════════ Store ═══════════════════ */

interface GroundRecord {
  readonly history: GroundHistory;
  channel: FairnessChannel | null;
  lastChangedUs: SimTimeUs;
}

export interface CoverageSummary {
  /** Properties the estate knows exist (ground registry ∪ observed cells) —
   *  "the fog is over the state, never the existence". */
  readonly totalProperties: number;
  readonly instrumentedProperties: number;
  readonly liveProperties: number;
  readonly staleProperties: number;
  readonly unknownProperties: number;
  /** Fixed ratio for the HUD "instrumented: N%" counter (§7.6 refinement 2). */
  readonly coverageRatio: Fixed;
}

export class ObservedStore {
  #ground: Map<ObservedKey, GroundRecord> = new Map();
  #cells: Map<ObservedKey, ObservedCell<unknown>> = new Map();
  #bindings: Map<ObservedKey, InstrumentBinding> = new Map();
  #causes: Map<ObservedKey, CauseId> = new Map();
  #ladder: ResolutionLadder = new ResolutionLadder();
  #watermarkUs: SimTimeUs = 0n;
  #appliedBatches = 0;

  /** Advance the observed layer. THE ONLY MUTATOR. `tickUs` is the step-12
   *  stamp; batches must be monotonic (one forward pass per tick, replays
   *  re-derive identical cells because every branch here is a pure function
   *  of (records, tickUs, prior state)). */
  applyObservedWrites(writes: readonly ObservedRecord[], tickUs: SimTimeUs): void {
    if (typeof tickUs !== "bigint" || tickUs < 0n) {
      throw new Error(`observed: applyObservedWrites needs a non-negative bigint tickUs, got ${String(tickUs)}`);
    }
    if (tickUs < this.#watermarkUs) {
      throw new Error(
        `observed: step-12 batch at ${tickUs}µs is older than watermark ${this.#watermarkUs}µs — ` +
          "the observed layer only advances with the pipeline",
      );
    }

    // Parse the whole batch before touching state (Law 2 + atomic batch: a
    // poison record leaves the store exactly as it was).
    const ground: GroundPatch[] = [];
    const instruments: InstrumentPatch[] = [];
    const explicit: ObservedWrite[] = [];
    for (const record of writes) {
      if (isGroundPatch(record)) {
        if (record.changedAtUs < 0n || record.changedAtUs > tickUs) {
          throw new Error(
            `observed: ground patch at ${record.changedAtUs}µs is outside [0, ${tickUs}]µs — truth cannot change in the future`,
          );
        }
        if (record.fairnessChannel !== undefined && !isFairnessChannel(record.fairnessChannel)) {
          throw new Error(`observed: unknown fairness channel "${record.fairnessChannel}"`);
        }
        stableSerialize(record.value, 0); // values enter state only if digestible
        ground.push(record);
        continue;
      }
      if (isInstrumentPatch(record)) {
        validateBinding(record.binding);
        instruments.push(record);
        continue;
      }
      if ("cell" in record) {
        validateCell(record.cell, record.causeId);
        stableSerialize(record.cell.value, 0);
        explicit.push(record);
        continue;
      }
      throw new Error("observed: unrecognised step-12 record (expected ObservedWrite, GroundPatch or InstrumentPatch)");
    }

    for (const patch of ground) this.#applyGround(patch);
    for (const patch of instruments) this.#bindings.set(patch.binding.target, patch.binding);

    // Derive through every binding that step 12 did NOT override explicitly
    // this tick (explicit pre-computed cells win: the producer knows best).
    const overridden = new Set<ObservedKey>(explicit.map((w) => w.key));
    const touched = new Set<ObservedKey>();
    for (const [target, binding] of this.#bindings) {
      if (overridden.has(target)) continue;
      const asOfUs = tickUs >= binding.cls.lagUs ? tickUs - binding.cls.lagUs : 0n;
      const source = this.#ground.get(binding.source);
      const sample = source === undefined ? null : source.history.sampleAt(asOfUs);
      this.#cells.set(target, canonicalizeCellAtGate(deriveCell(binding, sample, tickUs)));
      this.#causes.set(target, asCauseId(`step12/instrument/${binding.instrumentId}`));
      touched.add(target);
    }
    for (const write of explicit) {
      this.#cells.set(write.key, canonicalizeCellAtGate(write.cell));
      this.#causes.set(write.key, write.causeId);
      touched.add(write.key);
    }

    // Retain the observation at its sampled band (multi-resolution histories).
    for (const key of touched) {
      const cell = this.#cells.get(key);
      if (cell === undefined || cell.value === null || cell.coverage === FIXED_ZERO) continue;
      if (cell.fidelity === ResolutionBand.None) continue;
      this.#ladder.fold(key, cell.fidelity, cell.value, tickUs);
    }

    this.#watermarkUs = tickUs;
    this.#appliedBatches += 1;
  }

  #applyGround(patch: GroundPatch): void {
    let record = this.#ground.get(patch.key);
    if (record === undefined) {
      record = { history: new GroundHistory(), channel: null, lastChangedUs: 0n };
      this.#ground.set(patch.key, record);
    }
    if (patch.fairnessChannel !== undefined) {
      if (record.channel !== null && record.channel !== patch.fairnessChannel) {
        throw new Error(
          `observed: ${patch.key} already authored into channel "${record.channel}", refused "${patch.fairnessChannel}"`,
        );
      }
      record.channel = patch.fairnessChannel;
    }
    record.history.push({ atUs: patch.changedAtUs, value: patch.value });
    record.lastChangedUs = patch.changedAtUs;
  }

  /* ─────────── Typed read API (fog-filtered only) ───────────
   * There is deliberately NO method whose return type or runtime value can
   * carry an un-instrumented ground value. `read` hands back the degraded
   * envelope; a key with no observation yields the canonical unknown cell —
   * "nothing, not zero" is structurally the default, so forgetting to check
   * coverage can never accidentally show a true value. */

  /** The player-visible cell for one property. Unregistered/uninstrumented
   *  keys read as unknown — never zero, never an error (existence is public;
   *  state is not). */
  read<T = unknown>(key: ObservedKey): ObservedCell<T> {
    const cell = this.#cells.get(key) ?? unknownCell();
    return cell as ObservedCell<T>;
  }

  /** Existence check only (§7.6: fog is over state, never over existence). */
  hasKey(key: ObservedKey): boolean {
    return this.#ground.has(key) || this.#cells.has(key);
  }

  /** Every entity the estate knows about — sorted by code unit (locale-free). */
  knownEntities(): readonly EntityId[] {
    const entities = new Set<EntityId>();
    for (const key of this.#allKeys()) entities.add(parseKeyEntity(key));
    return [...entities].sort(compareCodeUnits);
  }

  /** Properties known for one entity — the known-unknowns list the HUD draws
   *  with "?" badges. Sorted for determinism. */
  propertiesOf(entity: EntityId): readonly string[] {
    const properties: string[] = [];
    for (const key of this.#allKeys()) {
      if (parseKeyEntity(key) === entity) properties.push(parseKeyProperty(key));
    }
    return [...new Set(properties)].sort(compareCodeUnits);
  }

  /** Keys that are KNOWN but not currently seen (status unknown) — the
   *  budgetable blind spots ("instrumented: 64% of nodes"). */
  unknownKeys(): readonly ObservedKey[] {
    const out: ObservedKey[] = [];
    for (const key of this.#allKeys()) {
      const cell = this.#cells.get(key);
      if (cell === undefined || cell.status === "unknown") out.push(key);
    }
    return out.sort(compareCodeUnits);
  }

  coverageSummary(): CoverageSummary {
    let instrumented = 0;
    let live = 0;
    let stale = 0;
    let unknown = 0;
    for (const key of this.#allKeys()) {
      const cell = this.#cells.get(key);
      if (cell !== undefined && cell.coverage > FIXED_ZERO) instrumented += 1;
      if (cell === undefined || cell.status === "unknown") unknown += 1;
      else if (cell.status === "stale") stale += 1;
      else live += 1;
    }
    const total = this.#allKeys().size;
    return {
      totalProperties: total,
      instrumentedProperties: instrumented,
      liveProperties: live,
      staleProperties: stale,
      unknownProperties: unknown,
      coverageRatio: coverageRatio(instrumented, total),
    };
  }

  /** Retained history for one (property × resolution band), oldest first.
   *  Empty array = "no data" (distinct from a zero line, §4.7). */
  history(key: ObservedKey, band: ResolutionBand): readonly LadderPoint[] {
    return this.#ladder.history(key, band);
  }

  /** Instrument binding currently reporting a target (null = uninstrumented). */
  bindingFor(target: ObservedKey): InstrumentBinding | null {
    return this.#bindings.get(target) ?? null;
  }

  /** Last cause stamped on a key's cell (attribution end-to-end, §7.0). */
  causeOf(key: ObservedKey): CauseId | null {
    return this.#causes.get(key) ?? null;
  }

  /** The authored fairness channel of a property, if any (public metadata —
   *  declaring WHICH channels exist is part of the fairness contract). */
  fairnessChannelOf(key: ObservedKey): FairnessChannel | null {
    return this.#ground.get(key)?.channel ?? null;
  }

  /* ─────────── Bounded-fog fairness channels (§7.6 rule 1) ───────────
   * The ONLY sanctioned truth reads, and only per-key, per-authored-channel:
   * "You can always find out WHETHER you have a problem, even with zero
   * monitoring." They are lookup methods, not enumeration — a seat still has
   * to know the key to ask, and `observed_view(seat)` (§3.1) keeps routing
   * every projected reading through them so co-op scoping still applies.
   * Fail loud on a channel mismatch: asking the Pulse Strip for a
   * Site-Preview-only property is an authoring bug, not a gameplay fallback. */

  sitePreview(key: ObservedKey): ObservedCell<unknown> {
    return this.#truthReading(key, "site-preview");
  }

  pulseStrip(key: ObservedKey): ObservedCell<unknown> {
    return this.#truthReading(key, "pulse-strip");
  }

  #truthReading(key: ObservedKey, channel: FairnessChannel): ObservedCell<unknown> {
    const record = this.#ground.get(key);
    if (record?.channel !== channel) {
      throw new Error(`observed: ${key} is not authored into the "${channel}" channel (never lie, but never leak)`);
    }
    const sample = record.history.latest();
    if (sample === null) return unknownCell();
    // Fairness readings carry the RAW value on purpose (never lie to the
    // preview) — they are fresh, frozen per-call copies and never enter
    // #cells, so the write-gate fold (FIX-4) does not apply here.
    return Object.freeze({
      value: sample.value,
      fidelity: ResolutionBand.Exact,
      freshnessUs: 0n, // "always tell the truth": zero degradation by contract
      coverage: FIXED_ONE,
      certainty: FIXED_ONE,
      status: "live" as const,
    });
  }

  /** Snapshot for embedding in `GameState.observed` (copy — the host may keep
   *  it across steps without seeing later mutations). */
  toObservedMap(): ReadonlyMap<ObservedKey, ObservedCell<unknown>> {
    return new Map(this.#cells);
  }

  get tickWatermarkUs(): SimTimeUs {
    return this.#watermarkUs;
  }

  get appliedBatches(): number {
    return this.#appliedBatches;
  }

  #allKeys(): Set<ObservedKey> {
    const keys = new Set<ObservedKey>(this.#ground.keys());
    for (const key of this.#cells.keys()) keys.add(key);
    return keys;
  }

  /** Canonical digest of the whole twin store (cells + instrument state +
   *  ground watermarks + ladder counts). Keys sorted by code unit; bands in
   *  ladder order; no locale, no float, no insertion order — the CI ×100
   *  determinism tripwire hashes THIS, like GameState.stateHash for the
   *  replay ring (CONVENTIONS §3). */
  digest(): string {
    const parts: string[] = [
      `w=${this.#watermarkUs}`,
      `b=${this.#appliedBatches}`,
    ];
    for (const key of [...this.#allKeys()].sort(compareCodeUnits)) {
      const cell = this.#cells.get(key);
      const cellPart =
        cell === undefined
          ? "-"
          : [
              cell.status,
              cell.fidelity,
              cell.freshnessUs,
              cell.coverage,
              cell.certainty,
              stableSerialize(cell.value, 0),
              this.#causes.get(key) ?? "-",
            ].join(";");
      const ground = this.#ground.get(key);
      const groundPart =
        ground === undefined
          ? "-"
          : [ground.history.version, ground.history.length, ground.lastChangedUs, ground.channel ?? "-"].join(";");
      const binding = this.#bindings.get(key);
      const bindingPart =
        binding === undefined
          ? "-"
          : [binding.instrumentId, binding.source, binding.cls.id, binding.coverage, binding.misBound].join(";");
      const ladderPart = [
        ResolutionBand.Coarse,
        ResolutionBand.Medium,
        ResolutionBand.Fine,
        ResolutionBand.Exact,
      ]
        .map((band) => this.#ladder.pointCount(key, band))
        .join(",");
      parts.push(`${key}|${cellPart}|${groundPart}|${bindingPart}|${ladderPart}`);
    }
    return fnv1a64OverCodePoints(parts.join("\n"));
  }
}

/* ═══════════════════ Key parsing ═══════════════════
 * observedKey(entity, property) = `${entity}::${property}` (types.ts). We
 * split on the FIRST separator, so properties may contain "::" freely; an
 * EntityId containing "::" would be ambiguous — contract assumption recorded
 * in the friction notes (v0 ids are separator-free by builder culture). */

const KEY_SEPARATOR = "::";

export function parseKeyEntity(key: ObservedKey): EntityId {
  return key.slice(0, key.indexOf(KEY_SEPARATOR)) as EntityId;
}

export function parseKeyProperty(key: ObservedKey): string {
  const idx = key.indexOf(KEY_SEPARATOR);
  if (idx < 0) throw new Error(`observed: malformed ObservedKey "${key}" (missing "::")`);
  return key.slice(idx + KEY_SEPARATOR.length);
}

/* ═══════════════════ Shared internals ═══════════════════ */

function isFairnessChannel(value: string): value is FairnessChannel {
  return value === "site-preview" || value === "pulse-strip";
}

/** Prefix marking a composite cell value that was folded to its canonical
 *  hash text at the write gate (FIX-4). */
export const CANONICAL_CELL_PREFIX = "hh-canon-v1:";

/** Plain objects and arrays are "composite" cell values. */
export function isCompositeCellValue(value: unknown): boolean {
  return typeof value === "object" && value !== null;
}

/**
 * FIX-4 canonicalization (the duty digest.ts's comment always promised to the
 * observed module): a composite cell value — within the shallow ≤8 budget the
 * gate already enforces — is folded to `hh-canon-v1:<fnv1a>` of its
 * stableSerialize text BEFORE entering store state. Distinct composites fold
 * to distinct primitives; key-permuted equals fold identical (stableSerialize
 * sorts keys), so no digest consumer (store digest, ladder rollups, the
 * GameState digest downstream) can go "unsupported"-blind on aggregate cells.
 */
export function foldCompositeCellValue(value: unknown): unknown {
  if (!isCompositeCellValue(value)) return value;
  return `${CANONICAL_CELL_PREFIX}${fnv1a64OverCodePoints(stableSerialize(value, 0))}`;
}

/** Gate normalization: fold composites and guarantee the stored cell object
 *  is frozen (FIX-8) — readers can never scribble on twin state in place. */
function canonicalizeCellAtGate(cell: ObservedCell<unknown>): ObservedCell<unknown> {
  const value = foldCompositeCellValue(cell.value);
  return Object.isFrozen(cell) && value === cell.value
    ? cell
    : Object.freeze({ ...cell, value });
}

/** Depth-bounded deterministic serialization of cell/ground values:
 *  primitives plus plain arrays/objects with SORTED keys (insertion order
 *  can never reach the digest). Cycles and depth > 8 fail loud — aggregate
 *  objects in observed cells must stay shallow (§4.7 aggregate cells). */
export function stableSerialize(value: unknown, depth: number): string {
  if (depth > 8) {
    throw new Error("observed: cell value nesting exceeds depth 8 — keep aggregate cells shallow");
  }
  if (typeof value === "bigint") return `${value}n`;
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "boolean" || value === null) return String(value);
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value)) {
      throw new Error(`observed: non-safe-integer number ${value} in state — floats never enter replay`);
    }
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item, depth + 1)).join(",")}]`;
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort(compareCodeUnits);
    const body = keys.map((k) => `${JSON.stringify(k)}:${stableSerialize(record[k], depth + 1)}`).join(",");
    return `{${body}}`;
  }
  throw new Error(`observed: unsupported cell value type ${typeof value}`);
}

/** Default by-hand probe cadence when a fogged property has no instrument to
 *  borrow a lag budget from: one sim minute per manual check. Paired with
 *  instrument.byHandDiagnosisUs(factor 4|8) for the §7.6 rule-3 timer. */
export const DEFAULT_HAND_PROBE_US: SimTimeUs = MICROS_PER_MIN;
