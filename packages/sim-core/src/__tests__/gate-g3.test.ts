/**
 * GATE G3 — "the suspicion dial" (hosting_game.md §9.13 gate #3).
 *
 * Headless proof that two-lane routing is a LEGIBLE, deterministic game
 * mechanic, not decoration:
 *
 *  S1 DIAL MOVES THE SPLIT — identical traffic and seed, two dial settings
 *     (expressMaxConfidence): the adversarial cohort re-lands from the deep
 *     lane to the express lane; neutralization totals stay IDENTICAL (the
 *     dial moves attention, never detection power).
 *
 *  S2 MID-PATH DEMOTION — a unit that already cleared the meter hop, standing
 *     "on the wire" between express hops, is yanked onto the deep lane the
 *     tick its evidence lifts confidence over the dial — proven end-to-end
 *     via the engine's own Attribution Ledger (terminal-event nodeId).
 *
 *  S3 CANONICAL EVIDENCE FOLD — three contributions fed in two input orders
 *     yield byte-identical confidence for every unit, and that value equals
 *     the hand-folded Π(1−cᵢ) in canonical (unitId, metric) order (FIX-3:
 *     Q16.16 mul is non-associative, so the canonical order IS the law).
 *
 *  S4 STICKY SUSPICION, DECAYED HORIZON — the gate owns the suspicion ledger
 *     the engine defers (§7.6): a false positive spikes its lineage root at
 *     0.1, decayed ×0.9 per tick. Same traffic: a 4-minute retry backoff
 *     re-enters inside the sticky horizon (≥ 0.05 ⇒ demoted); an 8-minute
 *     backoff re-enters decayed below the threshold (⇒ express again). The
 *     decay law is pinned on per-identity observed cells.
 *
 *  S5 ROC SHIFT, FIXED DAMAGE — upgrading the WAF inspect→challenge (same
 *     seed, same traffic): the false-positive arm appears (curve MOVES)
 *     while every adversarial terminal stays byte-identical (damage doesn't).
 *
 *  ×100 REPLAY — the richest composite (S4a: ledger + demotions + storm)
 *     re-sims through the harness to a single canonical digest.
 *
 * Slot swaps (route, outcome) are gate-assembly-legal per
 * docs/API-REFERENCE.md §"How to build a gate slice"; every signal is a pure
 * function of (initial state, ambient inputs), so replays match.
 */

import { describe, expect, it } from "vitest";
import {
  asCauseId,
  asEntityId,
  asMetricId,
  asRunSeed,
  canonicalDigest,
  clampUnit,
  createDefaultSlots,
  createHarness,
  createInitialState,
  createRouteStep,
  createTickDriver,
  defaultOutcomeStep,
  FIXED_UNIT,
  FIXED_ZERO,
  fromInt,
  fromRatio,
  initialClocks,
  MICROS_PER_MIN,
  mul,
  observedKey,
  ObservedStore,
  streamFor,
  sub,
  type ConfidenceContribution,
  type DirectorDraw,
  type EntityId,
  type Fixed,
  type GameState,
  type LaneStats,
  type NodeRecord,
  type ObservedCell,
  type Outcome,
  type QosClassDef,
  type ResolutionBand,
  type RetryPolicy,
  type RouteIn,
  type RunSeed,
  type SimEvent,
  type SimTick,
  type SimTimeUs,
  type TickStep,
  type Unit,
  type WaveEnvelope,
} from "../index.ts";

/* ═══════════════════════ scenario constants ═══════════════════════ */

const GATE_ENGINE = "gate-g3";
const REPLAYS = 100;

const IDS = {
  meter: asEntityId("meter-1"),
  waf: asEntityId("waf-1"),
  deep: asEntityId("deep-1"),
  laneExpress: asEntityId("lane/express"),
  laneDeep: asEntityId("lane/deep"),
} as const;

/** Whole-number rates ⇒ unit ids (`${tableId}@${tick}#${e}.${i}`) are known
 *  when the scenario is authored — threat-intel evidence can be addressed
 *  exactly, no future-sight needed at runtime. */
function envelope(tableId: string, family: "organic" | "malicious", rate: number): WaveEnvelope {
  return Object.freeze({
    tableId,
    role: family === "organic" ? ("baseline" as const) : ("spike" as const),
    shape: "plateau" as const,
    ratePerMin: fromInt(rate),
    telegraphed: true,
    dominantFamily: family,
  });
}

const CLASSES: readonly QosClassDef[] = Object.freeze([
  Object.freeze({
    id: "bronze",
    label: "Bronze",
    weight: FIXED_ZERO,
    shedPriority: 1,
    budgetUs: 30n * MICROS_PER_MIN,
    inspectionDepth: "pass-through" as const,
  }),
]);

const INSPECTION_FEES = Object.freeze({
  "pass-through": 0n,
  "sample-1-in-20": 3n * 1_000_000n,
  inspect: 10n * 1_000_000n,
  challenge: 20n * 1_000_000n,
});

/* GATE-OWNED suspicion-ledger law (§7.6 stickiness/decay deferral):
 * a false positive spikes its lineage root; suspicion decays ×0.9/tick; a
 * revisit whose decayed suspicion still clears the threshold is demoted.
 * SUSPICION_SPIKE mirrors the engine's own suspicionOf(benign, a≥0.5):
 * clamp(mul(fromRatio(1,10), clamp(a+0.5))) = exactly 6554n = 0.1. */
const SUSPICION_SPIKE: Fixed = fromRatio(1n, 10n);
const SUSPICION_DECAY: Fixed = fromRatio(9n, 10n);
const SUSPICION_THRESHOLD: Fixed = fromRatio(5n, 100n);
const LEDGER_HORIZON_TICKS: SimTick = 12n;

type Depth = NodeRecord["inspectionDepth"];

function mkNode(id: EntityId, slots: number, serviceUs: SimTimeUs, depth: Depth): NodeRecord {
  return Object.freeze({
    id,
    kind: "generic",
    slots: Object.freeze(
      Array.from({ length: slots }, () =>
        Object.freeze({ occupied: false, unitId: null, waitingOn: null, releasedAtUs: null }),
      ),
    ),
    serviceTimeUs: serviceUs,
    queueDepth: 0,
    queue: Object.freeze([]),
    shedOrder: "qos-weighted" as const,
    inspectionDepth: depth,
    discipline: "hockey-stick" as const,
    utilizationRho: 0n,
    dependencyNodeId: null,
  });
}

function exactCell(value: number | bigint | string): ObservedCell<unknown> {
  return Object.freeze({
    value,
    fidelity: 4 as ResolutionBand,
    freshnessUs: 0n,
    coverage: FIXED_UNIT,
    certainty: FIXED_UNIT,
    status: "live" as const,
  });
}

/* ═══════════════════════ gate-owned mechanics ═══════════════════════ */

interface SuspicionLedger {
  readonly spikes: Map<string, { readonly value: Fixed; readonly atTick: SimTick }>;
  /** Ledger-driven demotions of RETRY visits (sticky-window counter). */
  demotions: number;
  /** Evidence-driven demotions of in-flight express units. */
  midPathDemotions: number;
  /** Fresh-visit routing tally per terminal hop-0 node (lane split). */
  readonly routedByNode: Map<string, number>;
  readonly demotedUnitIds: Set<string>;
}

function lineageStem(identity: string): string {
  const cut = identity.indexOf("#r");
  return cut === -1 ? identity : identity.slice(0, cut);
}

/** value = SPIKE × 0.9^age (Fixed mul chain — the pinned decay law). */
function decayedSuspicion(ledger: SuspicionLedger, identity: string, tick: SimTick): Fixed {
  const hit = ledger.spikes.get(lineageStem(identity));
  if (hit === undefined) return FIXED_ZERO;
  const age = tick - hit.atTick;
  if (age <= 0n) return hit.value;
  if (age > LEDGER_HORIZON_TICKS) return FIXED_ZERO;
  let value = hit.value;
  for (let i = 0n; i < age; i += 1n) value = mul(value, SUSPICION_DECAY);
  return clampUnit(value);
}

/** Route slot + the two G3 laws, each guarded to a race-free boundary:
 *  · fresh visits — a hot lineage stem (sticky-window retry) routes deep
 *    straight off the dial decision;
 *  · in-flight units — demotion ONLY while "on the wire": hop-0 is the
 *    express terminal node yet the unit sits in neither its queue nor a
 *    service slot, i.e. between hops (the single tick where rewriting the
 *    remainder cannot strand a hop-completion in the driver).
 *  Lane split = the fresh-visit routing tally. */
function createGateRouteStep(
  base: ReturnType<typeof createRouteStep>,
  ledger: SuspicionLedger,
  wireNode: EntityId,
  deepPath: readonly EntityId[],
): TickStep<RouteIn, { readonly units: readonly Unit[] }> {
  return (input: RouteIn) => {
    const preHops = new Map<string, number>();
    for (const unit of input.units) preHops.set(unit.id, unit.routeHops.length);

    const routed = base(input).units;
    const node = input.nodes.get(wireNode);
    const queuedHere = new Set<string>((node?.queue ?? []).map(String));
    const inServiceHere = new Set<string>(
      (node?.slots ?? []).flatMap((slot) => (slot.occupied && slot.unitId !== null ? [String(slot.unitId)] : [])),
    );

    const units = routed.map((unit) => {
      if (preHops.get(unit.id) === 0) {
        // gate law: stickiness rides RETRY lineages — a first visit is never
        // demoted by the ledger (recycled source buckets stay honest)
        const suspect =
          unit.retryOf !== null &&
          decayedSuspicion(ledger, unit.source.identity, input.context.tick) >= SUSPICION_THRESHOLD;
        if (suspect && unit.routeHops[0] !== deepPath[0]) {
          ledger.demotions += 1;
          ledger.demotedUnitIds.add(String(unit.id));
          return Object.freeze({ ...unit, routeHops: Object.freeze([...deepPath]) });
        }
        const hop0 = unit.routeHops[0];
        if (hop0 !== undefined) ledger.routedByNode.set(String(hop0), (ledger.routedByNode.get(String(hop0)) ?? 0) + 1);
        return unit;
      }
      // mid-path: on the wire in front of the express terminal hop
      if (
        unit.routeHops.length > 0 &&
        unit.routeHops[0] === wireNode &&
        !queuedHere.has(String(unit.id)) &&
        !inServiceHere.has(String(unit.id)) &&
        unit.confidence > input.expressMaxConfidence
      ) {
        ledger.midPathDemotions += 1;
        ledger.demotedUnitIds.add(String(unit.id));
        return Object.freeze({ ...unit, routeHops: Object.freeze([...deepPath]) });
      }
      return unit;
    });
    return Object.freeze({ units: Object.freeze(units) });
  };
}

/** Outcome slot + ledger write: every false positive spikes its lineage
 *  root at the engine's own suspicion reading. Terminal resolution is
 *  DELEGATED untouched — attribution stays engine law; the ledger only
 *  reads driver output. */
function createGateOutcomeStep(
  ledger: SuspicionLedger,
): TickStep<Parameters<typeof defaultOutcomeStep>[0], { readonly outcomes: readonly Outcome[]; readonly events: readonly SimEvent[] }> {
  return (input) => {
    const out = defaultOutcomeStep(input);
    const unitsById = (input as unknown as { readonly unitsById: ReadonlyMap<EntityId, Unit> }).unitsById;
    for (const outcome of out.outcomes) {
      if (outcome.terminal !== "blocked-false-positive") continue;
      const unit = unitsById.get(outcome.unitId);
      if (unit === undefined) continue;
      ledger.spikes.set(lineageStem(unit.source.identity), {
        value: SUSPICION_SPIKE,
        atTick: input.context.tick,
      });
    }
    return out;
  };
}

/* ═══════════════════════ evidence authoring ═══════════════════════ */

/** Contributions for units standing ON THE WIRE in front of waf-1 (roster +
 *  node scan from the PREVIOUS tick's final state — the same boundary the
 *  route step guards). */
function wireSignalEvidence(game: GameState, triple: boolean): readonly ConfidenceContribution[] {
  const waf = game.nodes.get(IDS.waf);
  const queued = new Set((waf?.queue ?? []).map(String));
  const inService = new Set(
    (waf?.slots ?? []).flatMap((slot) => (slot.occupied && slot.unitId !== null ? [String(slot.unitId)] : [])),
  );
  const out: ConfidenceContribution[] = [];
  for (const unit of game.units.values()) {
    if (unit.routeHops.length === 0 || unit.routeHops[0] !== IDS.waf) continue;
    if (queued.has(unit.id) || inService.has(unit.id)) continue;
    // half the wire cohort gets intel; the rest are the controls that must
    // still terminate on waf-1 (proves the yank is the SIGNAL's doing)
    const bucket = Number(unit.source.identity.slice(unit.source.identity.lastIndexOf(":s") + 2).split("#")[0]);
    if (bucket % 2 !== 0) continue;
    if (triple) {
      out.push(Object.freeze({ unitId: unit.id, metric: asMetricId("sig-a"), value: fromRatio(2n, 10n) }));
      out.push(Object.freeze({ unitId: unit.id, metric: asMetricId("sig-b"), value: fromRatio(35n, 100n) }));
      out.push(Object.freeze({ unitId: unit.id, metric: asMetricId("sig-c"), value: fromRatio(4n, 10n) }));
    } else {
      out.push(Object.freeze({ unitId: unit.id, metric: asMetricId("pattern-hit"), value: fromRatio(9n, 10n) }));
    }
  }
  return Object.freeze(out);
}

/** Fixed intel: every deterministic malicious id arriving THIS tick. */
function intelEvidence(tick: SimTick, malRate: number, value: Fixed): readonly ConfidenceContribution[] {
  const out: ConfidenceContribution[] = [];
  for (let i = 0; i < malRate; i += 1) {
    out.push(
      Object.freeze({
        unitId: asEntityId(`g3-mal@${tick}#1.${i}`),
        metric: asMetricId("threat-intel"),
        value,
      }),
    );
  }
  return Object.freeze(out);
}

function rotate<T>(items: readonly T[]): readonly T[] {
  if (items.length < 2) return items;
  return Object.freeze([...items.slice(1), items[0] as T]);
}

/* ═══════════════════════ scenario assembly ═══════════════════════ */

interface G3Scenario {
  readonly ticks: SimTick;
  readonly envelopes: readonly WaveEnvelope[];
  readonly dial: Fixed;
  readonly aggression: Fixed;
  readonly nodeDepths: Readonly<{ meter: Depth; waf: Depth; deep: Depth }>;
  readonly expressPath: readonly EntityId[];
  readonly deepPath: readonly EntityId[];
  readonly retry: RetryPolicy;
  readonly patienceMin: bigint;
  readonly meterSlots: number;
  readonly wafSlots: number;
  readonly falsePositiveRatio: Fixed;
  readonly wireSignals: boolean;
  readonly tripleSignals: boolean;
  readonly malRate: number;
  readonly intelValue: Fixed | null;
  readonly shuffleEvidence: boolean;
}

interface G3RunState {
  readonly game: GameState;
  readonly observedDigest: string;
  readonly demotions: number;
  readonly midPathDemotions: number;
  readonly neutralized: number;
  readonly falsePositives: number;
  readonly threatsLanded: number;
  readonly benignServed: number;
  readonly routedExpress: number;
  readonly routedDeep: number;
  /** All terminals of ADVERSARIAL units, canonical order — the "damage"
   *  fingerprint compared across ROC-shift runs. */
  readonly adversarialTerminals: readonly string[];
  readonly servedByNode: ReadonlyMap<string, number>;
  readonly demotedUnitIds: readonly string[];
  readonly retryFalsePositives: number;
}

function defaultScenario(patch: Partial<G3Scenario>): G3Scenario {
  return Object.freeze({
    ticks: 10n,
    envelopes: Object.freeze([envelope("g3-organic", "organic", 6), envelope("g3-mal", "malicious", 4)]),
    dial: fromRatio(4n, 10n),
    aggression: fromRatio(5n, 10n),
    nodeDepths: Object.freeze({ meter: "pass-through" as Depth, waf: "inspect" as Depth, deep: "inspect" as Depth }),
    expressPath: Object.freeze([IDS.waf] as EntityId[]),
    deepPath: Object.freeze([IDS.deep] as EntityId[]),
    retry: Object.freeze({ maxRetries: 2, backoffBaseUs: 4n * MICROS_PER_MIN, jitterPurchased: false } as RetryPolicy),
    patienceMin: 30n,
    meterSlots: 1,
    wafSlots: 16,
    falsePositiveRatio: fromRatio(5n, 100n),
    wireSignals: false,
    tripleSignals: false,
    malRate: 4,
    intelValue: null,
    shuffleEvidence: false,
    ...patch,
  });
}

function simulateG3(seedValue: bigint, scenario: G3Scenario): G3RunState {
  const seed = asRunSeed(seedValue);
  const ledger: SuspicionLedger = {
    spikes: new Map(),
    demotions: 0,
    midPathDemotions: 0,
    routedByNode: new Map(),
    demotedUnitIds: new Set(),
  };

  const config = Object.freeze({
    runSeed: seed,
    dnsNodeId: null,
    expressPath: scenario.expressPath,
    deepPath: scenario.deepPath,
    defaultPatienceUs: scenario.patienceMin * MICROS_PER_MIN,
    defaultSizeCost: fromInt(1),
    patienceJitterPct: 0,
    inspectionCostUs: INSPECTION_FEES,
    detectionRatio: fromRatio(9n, 10n),
    falsePositiveRatio: scenario.falsePositiveRatio,
    referralProbability: FIXED_ZERO,
    returnProbability: FIXED_ZERO,
  });

  const slots = Object.freeze({
    ...createDefaultSlots(config),
    route: createGateRouteStep(
      createRouteStep({ dnsNodeId: null, expressPath: scenario.expressPath, deepPath: scenario.deepPath }),
      ledger,
      IDS.waf,
      scenario.deepPath,
    ),
    outcome: createGateOutcomeStep(ledger),
  });
  const clocks = initialClocks();
  const driver = createTickDriver(slots, streamFor(seed, "root", 0), clocks);

  let game = createInitialState({
    runSeed: seed,
    engineVersion: GATE_ENGINE,
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "sha-g3", ruleBookHash: "sha-g3" },
    clocks,
    nodes: [
      mkNode(IDS.meter, scenario.meterSlots, 5_000_000n, scenario.nodeDepths.meter),
      mkNode(IDS.waf, scenario.wafSlots, 3_000_000n, scenario.nodeDepths.waf),
      mkNode(IDS.deep, 16, 3_000_000n, scenario.nodeDepths.deep),
    ],
    lanes: [],
    contracts: [],
  });

  let neutralized = 0;
  let falsePositives = 0;
  let threatsLanded = 0;
  let benignServed = 0;
  let retryFalsePositives = 0;
  const servedByNode = new Map<string, number>();
  const adversarialTerminals: string[] = [];
  const store = new ObservedStore();

  for (let t = 1; t <= Number(scenario.ticks); t += 1) {
    const tick = BigInt(t);

    let evidence: readonly ConfidenceContribution[] = Object.freeze([]);
    if (scenario.wireSignals) evidence = wireSignalEvidence(game, scenario.tripleSignals);
    if (scenario.intelValue !== null) {
      evidence = Object.freeze([...evidence, ...intelEvidence(tick, scenario.malRate, scenario.intelValue)]);
    }
    if (scenario.shuffleEvidence) evidence = rotate(evidence);

    const result = driver.advance(game, Object.freeze({
      envelopes: scenario.envelopes,
      evidence,
      classes: CLASSES,
      dependencyEdges: Object.freeze([]),
      retryPolicy: scenario.retry,
      aggression: scenario.aggression,
      expressMaxConfidence: scenario.dial,
    }));
    game = result.state;

    for (const outcome of result.outcomes) {
      const cause = String(outcome.causeId);
      if (outcome.terminal === "bounced" && cause.startsWith("defense:")) {
        neutralized += 1;
        adversarialTerminals.push(cause);
      } else if (outcome.terminal === "blocked-false-positive") {
        falsePositives += 1;
        if (String(outcome.unitId).startsWith("re")) retryFalsePositives += 1;
      } else if (outcome.terminal === "landed") {
        threatsLanded += 1;
        adversarialTerminals.push(cause);
      } else if (outcome.terminal === "served") {
        benignServed += 1;
      }
    }
    adversarialTerminals.sort();

    for (const event of result.events) {
      if ((event.kind === "served" || event.kind === "blocked-false-positive") && event.nodeId !== undefined) {
        const n = String(event.nodeId);
        servedByNode.set(n, (servedByNode.get(n) ?? 0) + 1);
      }
    }

    const routedExpress = ledger.routedByNode.get(String(IDS.waf)) ?? 0;
    const routedDeep = ledger.routedByNode.get(String(IDS.deep)) ?? 0;

    // Observed layer: per-identity suspicion + per-unit confidence cells
    // from the LIVE roster — the renderer's canonical truth for pips/dials.
    const writes: { key: ReturnType<typeof observedKey>; cell: ObservedCell<unknown>; causeId: ReturnType<typeof asCauseId> }[] = [];
    for (const unit of game.units.values()) {
      writes.push(
        Object.freeze({
          key: observedKey(unit.id, "confidence"),
          cell: exactCell(unit.confidence),
          causeId: asCauseId(`g3:conf:${t}:${unit.id}`),
        }),
      );
    }
    for (const [stem, hit] of [...ledger.spikes.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
      const value = decayedSuspicion(ledger, stem, tick);
      writes.push(
        Object.freeze({ key: observedKey(asEntityId(`sus:${stem}`), "suspicion"), cell: exactCell(value), causeId: asCauseId(`g3:sus:${t}`) }),
        Object.freeze({ key: observedKey(asEntityId(`sus:${stem}`), "suspicionAt"), cell: exactCell(Number(hit.atTick)), causeId: asCauseId(`g3:susat:${t}`) }),
      );
    }
    store.applyObservedWrites(Object.freeze(writes), game.context.clocks.simUs);
    const merged = new Map(game.observed);
    for (const [key, cell] of store.toObservedMap()) merged.set(key, cell);

    const lanes = new Map<EntityId, LaneStats>([
      [IDS.laneExpress, laneStats(IDS.laneExpress, routedExpress, falsePositives, benignServed)],
      [IDS.laneDeep, laneStats(IDS.laneDeep, routedDeep, 0, 0)],
    ]);

    game = Object.freeze({ ...game, observed: Object.freeze(merged), lanes: Object.freeze(lanes) });
  }

  return Object.freeze({
    game,
    observedDigest: store.digest(),
    demotions: ledger.demotions,
    midPathDemotions: ledger.midPathDemotions,
    neutralized,
    falsePositives,
    threatsLanded,
    benignServed,
    routedExpress: ledger.routedByNode.get(String(IDS.waf)) ?? 0,
    routedDeep: ledger.routedByNode.get(String(IDS.deep)) ?? 0,
    adversarialTerminals: Object.freeze(adversarialTerminals),
    servedByNode: Object.freeze(servedByNode),
    demotedUnitIds: Object.freeze([...ledger.demotedUnitIds].sort()),
    retryFalsePositives,
  });
}

function laneStats(laneId: EntityId, share: number, fps: number, served: number): LaneStats {
  const decisions = fps + served;
  const fpShare = decisions === 0 ? FIXED_ZERO : fromRatio(BigInt(fps), BigInt(decisions));
  return Object.freeze({
    laneId,
    ratePerMin: fromInt(share),
    latencyDistributionRef: `gate-g3/hist/${String(laneId)}`,
    classMix: Object.freeze({ bronze: FIXED_UNIT }),
    health: clampUnit(sub(FIXED_UNIT, laneId === IDS.laneExpress ? fpShare : FIXED_ZERO)),
  });
}

/* ═══════════════════════ the gate ═══════════════════════ */

describe("gate G3 · the suspicion dial: two-lane routing is deterministic and legible", () => {
  /* ── S1: two dial settings, same traffic → different lane split ── */
  const S1_STRICT = defaultScenario({ malRate: 4, intelValue: fromRatio(6n, 10n) }); // dial 0.4
  const S1_LENIENT = defaultScenario({ dial: fromRatio(9n, 10n), malRate: 4, intelValue: fromRatio(6n, 10n) });

  const s1Strict = simulateG3(101n, S1_STRICT);
  const s1Lenient = simulateG3(101n, S1_LENIENT);

  it("S1 · the dial moves the lane split, not the threat stream", () => {
    // same seed + same envelopes ⇒ identical arrival workload in both runs
    expect(s1Strict.neutralized + s1Strict.threatsLanded).toBe(s1Lenient.neutralized + s1Lenient.threatsLanded);
    expect(s1Strict.neutralized).toBeGreaterThan(0);
    // strict dial (0.4 < intel 0.6): the adversarial cohort routes DEEP…
    expect(s1Strict.routedDeep).toBeGreaterThanOrEqual(4 * Number(S1_STRICT.ticks));
    expect(s1Lenient.routedDeep).toBe(0); // lenient dial (0.9): everything stays express
    // …and the express tally absorbs exactly what the deep lane lost
    expect(s1Lenient.routedExpress - s1Strict.routedExpress).toBe(s1Strict.routedDeep);
    // the detection POWER is dial-invariant: identical neutralization totals
    expect(s1Strict.neutralized).toBe(s1Lenient.neutralized);
  });

  it("S1 · neutralized attribution follows the lane: defense:deep-1 ⇄ defense:waf-1", () => {
    const deep = s1Strict.adversarialTerminals.filter((c) => c.startsWith("defense:deep-1:")).length;
    const express = s1Lenient.adversarialTerminals.filter((c) => c.startsWith("defense:waf-1:")).length;
    expect(deep).toBe(s1Strict.neutralized);
    expect(express).toBe(s1Lenient.neutralized);
  });

  /* ── S2: mid-path demotion on the wire ── */
  it("S2 · evidence crossing the dial yanks in-flight units off the express chain", () => {
    const run = simulateG3(202n, defaultScenario({
      ticks: 12n,
      envelopes: Object.freeze([envelope("g3-organic", "organic", 6)]),
      malRate: 0,
      nodeDepths: Object.freeze({ meter: "pass-through" as Depth, waf: "pass-through" as Depth, deep: "inspect" as Depth }),
      expressPath: Object.freeze([IDS.meter, IDS.waf] as EntityId[]),
      wireSignals: true,
    }));
    expect(run.midPathDemotions).toBeGreaterThan(0);
    // The engine's own terminal attribution proves the yank: demoted units
    // SERVE on the deep lane, controls still serve at waf-1.
    expect(run.servedByNode.get(String(IDS.deep)) ?? 0).toBeGreaterThan(0);
    expect(run.servedByNode.get(String(IDS.waf)) ?? 0).toBeGreaterThan(0);
    expect(run.benignServed).toBe((run.servedByNode.get(String(IDS.deep)) ?? 0) + (run.servedByNode.get(String(IDS.waf)) ?? 0));
  });

  /* ── S3: canonical evidence order is the fold law ── */
  it("S3 · Π(1−cᵢ) folds in canonical order — input permutation is invisible", () => {
    const scenario = defaultScenario({
      ticks: 12n,
      envelopes: Object.freeze([envelope("g3-organic", "organic", 6)]),
      malRate: 0,
      nodeDepths: Object.freeze({ meter: "pass-through" as Depth, waf: "pass-through" as Depth, deep: "inspect" as Depth }),
      expressPath: Object.freeze([IDS.meter, IDS.waf] as EntityId[]),
      wireSignals: true,
      tripleSignals: true,
      // patience wide open: this scenario proves the FOLD, not congestion —
      // every demoted unit must survive long enough to publish its cell
      patienceMin: 120n,
    });
    const ordered = simulateG3(303n, scenario);
    const shuffled = simulateG3(303n, Object.freeze({ ...scenario, shuffleEvidence: true }));
    // whole-run identity: permutation changed NOTHING (digest over composite)
    expect(canonicalDigest(shuffled)).toBe(canonicalDigest(ordered));
    expect(ordered.midPathDemotions).toBeGreaterThan(0);

    // analytic Π law: 1 − (1−0.2)(1−0.35)(1−0.4) folded in canonical
    // (unitId, metric) order = sig-a → sig-b → sig-c — pinned on the live
    // per-unit confidence cells of demoted units.
    const expected = clampUnit(
      sub(
        FIXED_UNIT,
        mul(
          mul(sub(FIXED_UNIT, fromRatio(2n, 10n)), sub(FIXED_UNIT, fromRatio(35n, 100n))),
          sub(FIXED_UNIT, fromRatio(4n, 10n)),
        ),
      ),
    );
    expect(expected).toBeGreaterThan(S1_STRICT.dial); // 0.688 > 0.4 — demotion material
    expect(ordered.demotedUnitIds.length).toBe(ordered.midPathDemotions);
    let pinned = 0;
    for (const id of ordered.demotedUnitIds) {
      const cell = ordered.game.observed.get(observedKey(asEntityId(id), "confidence"));
      if (cell !== undefined && cell.value === expected) pinned += 1;
    }
    // cells survive purge; every demoted unit's LAST-written confidence is
    // the canonical fold — permutation-invariant (shuffled run digested equal).
    // With generous patience every demoted unit survives to write its cell,
    // so the pin must cover ALL of them (not merely "some").
    expect(pinned).toBe(ordered.demotedUnitIds.length);
    expect(pinned).toBeGreaterThan(0);
  });

  /* ── S4: sticky suspicion with a decayed horizon ── */
  it("S4 · a retry inside the sticky horizon re-enters demoted; after decay, express", () => {
    const base = defaultScenario({
      ticks: 14n,
      envelopes: Object.freeze([envelope("g3-organic", "organic", 8)]),
      malRate: 0,
      aggression: fromRatio(6n, 10n),
      falsePositiveRatio: fromRatio(5n, 10n),
      nodeDepths: Object.freeze({ meter: "pass-through" as Depth, waf: "challenge" as Depth, deep: "inspect" as Depth }),
      patienceMin: 30n,
    });
    // driver backoff = base × 2^depth ⇒ first retry lands at +2×base ticks:
    // 3-min base ⇒ +6 ticks (age 6: SPIKE×0.9^6 = 3482n ≥ 3277n sticky);
    // 4-min base ⇒ +8 ticks (age 8: 2820n < 3277n decayed below threshold).
    const sticky = simulateG3(404n, Object.freeze({
      ...base,
      retry: Object.freeze({ maxRetries: 2, backoffBaseUs: 3n * MICROS_PER_MIN, jitterPurchased: false }),
    }));
    const decayed = simulateG3(404n, Object.freeze({
      ...base,
      retry: Object.freeze({ maxRetries: 2, backoffBaseUs: 4n * MICROS_PER_MIN, jitterPurchased: false }),
    }));

    // first-wave FPs are identical across the two runs (same units, same
    // per-unit forks — the backoff knob changes only RE-entry scheduling)
    expect(sticky.falsePositives).toBeGreaterThan(0);
    expect(sticky.falsePositives - sticky.retryFalsePositives)
      .toBe(decayed.falsePositives - decayed.retryFalsePositives);

    // sticky horizon: retry #1 at +6 ticks still clears the threshold ⇒ demoted
    expect(sticky.demotions).toBeGreaterThan(0);
    // decayed horizon: the same wave of retries lands at +8 ticks, under the
    // threshold ⇒ demotions collapse. (Non-zero here is the law WORKING:
    // coincident source identities re-spike shared stems — same customer,
    // fresh suspicion — never a scheduling artifact of the backoff.)
    expect(decayed.demotions).toBeLessThan(sticky.demotions / 2);

    // the decay law, pinned THROUGH the observed layer: for every spiked
    // lineage, final cell == SPIKE×0.9^age (age = ticks − spikeTick, zeroed
    // beyond the horizon) — recomputed here, byte-compared there.
    let checked = 0;
    for (const [key, cell] of sticky.game.observed) {
      const k = String(key);
      if (!k.endsWith("::suspicion")) continue;
      const stem = k.slice("sus:".length, k.lastIndexOf("::suspicion"));
      const at = sticky.game.observed.get(observedKey(asEntityId(`sus:${stem}`), "suspicionAt"));
      if (at === undefined || typeof cell.value !== "bigint" || typeof at.value !== "number") continue;
      const age = Number(base.ticks) - at.value;
      let expectedValue: bigint = SUSPICION_SPIKE;
      if (age > Number(LEDGER_HORIZON_TICKS)) expectedValue = FIXED_ZERO;
      else for (let i = 0; i < age; i += 1) expectedValue = mul(expectedValue, SUSPICION_DECAY);
      expect(cell.value).toBe(expectedValue);
      checked += 1;
    }
    expect(checked).toBeGreaterThan(0);
    // exact arithmetic of the horizon (independent of Map plumbing):
    const at = (ageTicks: number): Fixed => {
      let v = SUSPICION_SPIKE;
      for (let i = 0; i < ageTicks; i += 1) v = mul(v, SUSPICION_DECAY);
      return v;
    };
    expect(at(6)).toBeGreaterThanOrEqual(SUSPICION_THRESHOLD); // 3482n
    expect(at(7)).toBeLessThan(SUSPICION_THRESHOLD); // horizon boundary
    expect(at(8)).toBeLessThan(SUSPICION_THRESHOLD);
  });

  /* ── S5: ROC shift, fixed damage ── */
  it("S5 · inspect→challenge moves the ROC curve, never the damage", () => {
    const scenarioBase = defaultScenario({
      ticks: 12n,
      aggression: fromRatio(6n, 10n),
      falsePositiveRatio: fromRatio(15n, 100n),
    });
    const inspect = simulateG3(505n, Object.freeze({
      ...scenarioBase,
      nodeDepths: Object.freeze({ meter: "pass-through" as Depth, waf: "inspect" as Depth, deep: "inspect" as Depth }),
    }));
    const challenge = simulateG3(505n, Object.freeze({
      ...scenarioBase,
      nodeDepths: Object.freeze({ meter: "pass-through" as Depth, waf: "challenge" as Depth, deep: "inspect" as Depth }),
    }));

    // curve MOVES: the false-positive arm switches on…
    expect(inspect.falsePositives).toBe(0);
    expect(challenge.falsePositives).toBeGreaterThan(0);
    // …DAMAGE FIXED: every adversarial terminal — same units, same cause
    // lines, same ticks — byte-identical across the upgrade
    expect(challenge.adversarialTerminals).toEqual(inspect.adversarialTerminals);
    expect(challenge.neutralized).toBe(inspect.neutralized);
    expect(challenge.threatsLanded).toBe(inspect.threatsLanded);
  });

  /* ── determinism ×100 ── */
  it(`S6 · the ledger composite replays ×${REPLAYS} byte-identically`, () => {
    const seed = 606n;
    const scenario = defaultScenario({
      ticks: 14n,
      envelopes: Object.freeze([envelope("g3-organic", "organic", 8), envelope("g3-mal", "malicious", 2)]),
      malRate: 2,
      intelValue: fromRatio(6n, 10n),
      aggression: fromRatio(6n, 10n),
      falsePositiveRatio: fromRatio(5n, 10n),
      nodeDepths: Object.freeze({ meter: "pass-through" as Depth, waf: "challenge" as Depth, deep: "inspect" as Depth }),
    });
    const reference = simulateG3(seed, scenario);
    expect(reference.falsePositives).toBeGreaterThan(0);

    const runner = (request: {
      readonly initialState: G3RunState;
      readonly runSeed: RunSeed;
      readonly targetTick: SimTick;
      readonly intentsUpToTick: readonly unknown[];
    }): G3RunState =>
      simulateG3(request.runSeed, Object.freeze({ ...scenario, ticks: request.targetTick }));

    const harnessOptions = {
      runner,
      initialState: reference,
      runSeed: asRunSeed(seed),
      engineVersion: GATE_ENGINE,
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "sha-g3", ruleBookHash: "sha-g3" },
      totalTicks: scenario.ticks,
      snapshotEveryTicks: 4n,
      checkpointEveryTicks: 2n,
      directorDraws: [] as readonly DirectorDraw[],
    };
    const harness = createHarness(harnessOptions);
    const verdict = harness.verify();
    expect(verdict.ok).toBe(true);
    expect(verdict.failures).toHaveLength(0);

    const digests = new Set<string>(harness.replayDigests(REPLAYS));
    expect(digests.size).toBe(1);
    expect([...digests][0]).toBe(canonicalDigest(reference));
    expect(createHarness({ ...harnessOptions }).replayFinalDigest()).toBe([...digests][0]);
    expect(canonicalDigest(simulateG3(607n, scenario))).not.toBe(canonicalDigest(reference));
  });
});

