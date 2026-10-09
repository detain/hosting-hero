/**
 * populationEffect consumer — the Empty Server Spiral repel loop at the
 * arrival step (audit g09 TOP-PROBLEM #2: "populationEffect is a lying
 * field: loader requires+stores it with ZERO pipeline consumers"; spec
 * §2.13 "The Population Effect" + Herding: "a full server attracts
 * players, an empty one repels them").
 *
 * v0 implements the REPULSE half of the positive-feedback curve — the
 * death spiral the spec names as the mechanic — presence-gated per unit
 * type exactly like the batch-B rules and the familyMix die: absent/empty
 * ⇒ zero draws, byte-identical arrivals (pinned).
 */

import { describe, expect, it } from "vitest";
import type { ArrivalIn, SimEvent, WaveEnvelope } from "../../types";
import { asEntityId, asRunSeed } from "../../types";
import { FIXED_UNIT, FIXED_ZERO, fromInt, fromRatio } from "../../kernel/fixed";
import { MICROS_PER_MIN as MIN } from "../../kernel/time";
import { streamFor } from "../../kernel/rng";
import type { DefaultPipelineConfig } from "../defaults";
import { type ArrivalInExt, createArrivalStep } from "../defaults";
import type { TickInputs } from "../driver";
import { createInitialState, createTickDriver } from "../driver";
import { createDefaultSlots, digestState } from "../index";
import { DEFAULT_CLASSES, IDS, NO_RETRY, envelope, freshClocks, node, testConfig, tickInputs } from "./helpers";

/* ═══════════════════════════ step-level (direct feed) ═══════════════════════════ */

const TABLE = "spiral:probe";

function arrivalContext(tick: bigint) {
  return Object.freeze({ tick, minute: Number(tick), clocks: freshClocks() });
}

function envelopeRow(rate: number): WaveEnvelope {
  return envelope(TABLE, fromInt(rate));
}

function mint(
  populationEffects: DefaultPipelineConfig["populationEffects"],
  inFlightUnits: number | undefined,
  rate = 8,
  seed = 5n,
  tick = 1n,
): { readonly units: number; readonly events: number } {
  const step = createArrivalStep({
    defaultPatienceUs: 10n * MIN,
    defaultSizeCost: fromInt(1),
    patienceJitterPct: 0,
    ...(populationEffects !== undefined ? { populationEffects } : {}),
  });
  const rng = streamFor(asRunSeed(seed), "arrival", Number(tick));
  const input: ArrivalInExt = {
    context: arrivalContext(tick),
    envelopes: Object.freeze([envelopeRow(rate)]),
    rng: rng as ArrivalIn["rng"],
    ...(inFlightUnits !== undefined ? { inFlightUnits } : {}),
  };
  const out = step(input);
  return { units: out.units.length, events: out.events.length };
}

describe("repel draw (per-candidate skip before mint)", () => {
  it("coefficient 1.0 on an EMPTY server ⇒ every candidate stays home (full spiral)", () => {
    const out = mint({ [TABLE]: { coefficient: FIXED_UNIT, floor: 8 } }, 0);
    expect(out).toStrictEqual({ units: 0, events: 0 });
  });

  it("population at/above the floor ⇒ zero draws, every candidate visits", () => {
    const at = mint({ [TABLE]: { coefficient: FIXED_UNIT, floor: 8 } }, 8);
    expect(at).toStrictEqual({ units: 8, events: 8 });
    const above = mint({ [TABLE]: { coefficient: FIXED_UNIT, floor: 8 } }, 99);
    expect(above).toStrictEqual({ units: 8, events: 8 });
  });

  it("coefficient 0 (herding authored off) ⇒ byte-identical to NO config (zero rolls)", () => {
    const zero = mint({ [TABLE]: { coefficient: FIXED_ZERO, floor: 8 } }, 0);
    const none = mint(undefined, undefined);
    expect(zero).toStrictEqual(none);
    expect(zero.units).toBe(8);
  });

  it("half-empty (floor 8, inFlight 0, coefficient 0.5) ⇒ ~half the herd stays home, n=200", () => {
    const out = mint({ [TABLE]: { coefficient: fromRatio(5n, 10n), floor: 8 } }, 0, 200);
    expect(out.units).toBeGreaterThan(60); // ±4σ band around 100
    expect(out.units).toBeLessThan(140);
    expect(out.units + 0).toBe(out.events); // unit/event pairs never split
  });

  it("spiral monotonicity: emptier server ⇒ strictly fewer visits (same seed, same rolls)", () => {
    const table = { [TABLE]: { coefficient: fromRatio(5n, 10n), floor: 8 } };
    const empty = mint(table, 0, 100, 9n, 3n).units; // p(0) = 0.5 ⇒ ~half stay home
    const nearlyFull = mint(table, 7, 100, 9n, 3n).units; // p(7) = 0.0625 ⇒ almost none repelled
    expect(nearlyFull).toBeGreaterThan(empty);
    expect(empty).toBeLessThan(70);
    expect(nearlyFull).toBeGreaterThan(80);
  });

  it("presence gate: absent config never READS inFlightUnits — a bare pre-fix input still mints", () => {
    const out = mint(undefined, undefined); // no inFlightUnits, no effects: legacy shape
    expect(out.units).toBe(8);
  });

  it("effect configured WITHOUT the driver-stamped population channel fails loud", () => {
    expect(() => mint({ [TABLE]: { coefficient: FIXED_UNIT, floor: 8 } }, undefined)).toThrow(
      /inFlightUnits/,
    );
  });

  it("boundary parse: bad coefficient and bad floor reject at step build, naming the type", () => {
    expect(() =>
      createArrivalStep({
        defaultPatienceUs: MIN,
        defaultSizeCost: fromInt(1),
        patienceJitterPct: 0,
        populationEffects: { [TABLE]: { coefficient: 2n * FIXED_UNIT, floor: 4 } },
      }),
    ).toThrow(/coefficient must be a 0\.\.1 Fixed/);
    expect(() =>
      createArrivalStep({
        defaultPatienceUs: MIN,
        defaultSizeCost: fromInt(1),
        patienceJitterPct: 0,
        populationEffects: { [TABLE]: { coefficient: FIXED_UNIT, floor: 0 } },
      }),
    ).toThrow(/floor must be a positive safe integer/);
  });
});

/* ═══════════════════════ driver-level: spiral + digest gate ═══════════════════════ */

function drive(
  populationEffects: DefaultPipelineConfig["populationEffects"],
  ticks: number,
): { readonly chain: string[]; readonly arrivals: number; readonly finalUnits: number } {
  const config = testConfig({
    runSeed: asRunSeed(606n),
    defaultPatienceUs: 1_000_000n * MIN, // patience never fires: the spiral is the only delta
    expressPath: Object.freeze([IDS.edge, IDS.origin]),
    deepPath: Object.freeze([IDS.edge, IDS.origin]),
    ...(populationEffects !== undefined ? { populationEffects } : {}),
  });
  const driver = createTickDriver(createDefaultSlots(config), streamFor(config.runSeed, "root", 0), freshClocks(), {
    purgeTargetedMinNodes: 0,
  });
  let state = createInitialState({
    runSeed: config.runSeed,
    engineVersion: "spiral",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "spiral", ruleBookHash: "" },
    clocks: freshClocks(),
    nodes: Object.freeze([
      node(IDS.edge, { slots: 2, serviceUs: 60n * MIN }), // slow service: population accumulates SLOWLY
      node(IDS.origin, { slots: 8, serviceUs: MIN }),
    ]),
  });
  const chain: string[] = [];
  const events: SimEvent[] = [];
  for (let t = 0; t < ticks; t += 1) {
    const inputs: TickInputs = tickInputs({
      envelopes: Object.freeze([envelope("spiral:drive", fromInt(4))]),
      dependencyEdges: Object.freeze([]),
      retryPolicy: NO_RETRY,
      classes: DEFAULT_CLASSES,
    });
    const r = driver.advance(state, inputs);
    state = r.state;
    events.push(...r.events);
    chain.push(digestState(state));
  }
  return { chain, arrivals: events.filter((e) => e.kind === "arrival").length, finalUnits: state.units.size };
}

describe("driver integration (presence gate + observable spiral)", () => {
  it("absent / empty populationEffects digest byte-identically (every golden is a default-config run)", () => {
    const bare = drive(undefined, 6);
    const empty = drive({}, 6);
    expect(empty.chain).toStrictEqual(bare.chain);
    expect(bare.arrivals).toBe(24); // non-vacuity: 4/min × 6 ticks all visit without effects
  });

  it("the spiral bites: an authored repel loop cuts arrivals on a below-floor board", () => {
    const bare = drive(undefined, 6);
    const spiral = drive({ "spiral:drive": { coefficient: FIXED_UNIT, floor: 40 } }, 6);
    // coefficient 1 + floor 40 vs a 2-slot/60-min board that never reaches 40
    // in-flight ⇒ nothing visits at all: the full empty-server outcome.
    expect(spiral.arrivals).toBe(0);
    expect(spiral.finalUnits).toBe(0);
    expect(spiral.chain).not.toStrictEqual(bare.chain); // disclosed: config-gated change only
  });

  it("partial coefficient lands between the extremes (0.5 on the same board)", () => {
    const half = drive({ "spiral:drive": { coefficient: fromRatio(5n, 10n), floor: 40 } }, 6);
    expect(half.arrivals).toBeGreaterThan(0);
    expect(half.arrivals).toBeLessThan(24);
  });

  it("per-type keying: effects authored for ANOTHER table repel nobody", () => {
    const other = drive({ "spiral:unrelated": { coefficient: FIXED_UNIT, floor: 40 } }, 6);
    const bare = drive(undefined, 6);
    expect(other.arrivals).toBe(bare.arrivals);
    expect(other.chain).toStrictEqual(bare.chain); // zero rolls consumed for unlisted types
  });
});
