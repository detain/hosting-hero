/**
 * populationEffect consumer — the Population Effect feedback curve at the
 * arrival step (audit g09 TOP-PROBLEM #2: "populationEffect is a lying
 * field: loader requires+stores it with ZERO pipeline consumers"; spec
 * §2.13 "The Population Effect" + Herding: "a full server attracts
 * players, an empty one repels them").
 *
 * v0 implements BOTH halves of the positive-feedback curve — the repel half
 * is the death spiral the spec names, the attract half (this wave) is the
 * cohort pull above the floor: population attracts population, one bonus
 * mint per hit — presence-gated per unit type exactly like the batch-B rules
 * and the familyMix die: absent/empty ⇒ zero draws, byte-identical arrivals
 * (pinned). The coefficient is SIGNED: positive repels below the floor
 * (legacy behavior, every existing pin kept), negative attracts above it,
 * zero inert; the two halves are disjoint by construction (sign ×
 * side-of-floor) so neither can shift the other's stream position.
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

  it("boundary parse: out-of-domain coefficient (both signs) and bad floor reject at step build, naming the type", () => {
    expect(() =>
      createArrivalStep({
        defaultPatienceUs: MIN,
        defaultSizeCost: fromInt(1),
        patienceJitterPct: 0,
        populationEffects: { [TABLE]: { coefficient: 2n * FIXED_UNIT, floor: 4 } },
      }),
    ).toThrow(/coefficient must be a signed Fixed in -1\.\.1/);
    expect(() =>
      createArrivalStep({
        defaultPatienceUs: MIN,
        defaultSizeCost: fromInt(1),
        patienceJitterPct: 0,
        populationEffects: { [TABLE]: { coefficient: -2n * FIXED_UNIT, floor: 4 } },
      }),
    ).toThrow(/coefficient must be a signed Fixed in -1\.\.1/);
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

/* ═══════════════════════════ attract half (cohort gravity) ═══════════════════════════ */

/** Same feed as `mint`, but hands back the minted rows for id-grammar pins. */
function mintRows(
  populationEffects: DefaultPipelineConfig["populationEffects"],
  inFlightUnits: number | undefined,
  rate = 8,
  seed = 5n,
  tick = 1n,
): { readonly ids: readonly string[]; readonly units: number; readonly events: number } {
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
  return { ids: out.units.map((u) => u.id), units: out.units.length, events: out.events.length };
}

/** Negative Fixed via exact bigint math (no float literals in logic paths). */
const negFixed = (n: bigint, d: bigint): bigint => 0n - fromRatio(n, d);

describe("attract draw (cohort gravity above the floor, signed coefficient)", () => {
  it("negative coefficient at/below the floor ⇒ zero draws, exact envelope mint (halves disjoint)", () => {
    const at = mint({ [TABLE]: { coefficient: -FIXED_UNIT, floor: 8 } }, 8);
    expect(at).toStrictEqual({ units: 8, events: 8 });
    const below = mint({ [TABLE]: { coefficient: -FIXED_UNIT, floor: 8 } }, 0);
    expect(below).toStrictEqual({ units: 8, events: 8 });
  });

  it("saturation: p ≥ 1 (|coef| × surplus / floor) makes every candidate bring exactly one bonus", () => {
    // floor 1, inFlight 8 ⇒ surplus 7, coefficient -1 ⇒ p = 7 ⇒ clamped certain.
    const out = mint({ [TABLE]: { coefficient: -FIXED_UNIT, floor: 1 } }, 8, 5);
    expect(out).toStrictEqual({ units: 10, events: 10 }); // 5 authored + 5 cohort
  });

  it("bonus ids continue the unit-index numbering past the authored count — same grammar, unique", () => {
    const rows = mintRows({ [TABLE]: { coefficient: -FIXED_UNIT, floor: 1 } }, 8, 3);
    expect(rows.ids).toStrictEqual([
      `${TABLE}@1#0.0`,
      `${TABLE}@1#0.3`, // bonus for candidate 0
      `${TABLE}@1#0.1`,
      `${TABLE}@1#0.4`, // bonus for candidate 1
      `${TABLE}@1#0.2`,
      `${TABLE}@1#0.5`, // bonus for candidate 2
    ]);
    expect(new Set(rows.ids).size).toBe(6);
  });

  it("planted census: coefficient -0.5, floor 8, inFlight 12 (p=0.25), rate 200, seed 5 ⇒ 248 mints", () => {
    // 200 authored + 48 bonuses; exact deterministic draw, re-proven every run.
    const out = mint({ [TABLE]: { coefficient: negFixed(5n, 10n), floor: 8 } }, 12, 200);
    expect(out).toStrictEqual({ units: 248, events: 248 });
  });

  it("positive rows never feel the attract branch: the shipped repel pins are byte-stable under sign", () => {
    // coefficient +0.5 below floor repels (existing pin); the SAME magnitude
    // negative BELOW floor must attract nothing and roll nothing.
    const inertBelow = mint({ [TABLE]: { coefficient: negFixed(5n, 10n), floor: 8 } }, 0, 200);
    const bare = mint(undefined, undefined, 200, 5n, 1n);
    expect(inertBelow).toStrictEqual(bare); // zero stream-position shift
  });

  it("attract row WITHOUT the driver-stamped population channel fails loud", () => {
    expect(() => mint({ [TABLE]: { coefficient: -FIXED_UNIT, floor: 8 } }, undefined)).toThrow(
      /inFlightUnits/,
    );
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

  /* CONSERVATION CENSUS (the attract half's honesty pins): the envelope-rate
     law is approximate once a row is configured — repel cuts mints, attract
     ADDS them. These pins are the disclosed ± skew; bare/absent arms keep
     every serial golden byte-identical (constraint 3). Numbers probed on
     2026-10-13, pure bigint seeded math — platform-stable. */
  it("conservation census: strong attract adds ≥1 mint over 100 ticks (planted config, exact pins)", () => {
    const bare = drive(undefined, 100); // 4/min × 100 = 400 authored arrivals
    expect(bare.arrivals).toBe(400);
    const pull = drive({ "spiral:drive": { coefficient: -FIXED_UNIT, floor: 2 } }, 100);
    expect(pull.arrivals).toBe(796); // +396 cohort bonuses — the well compounds
    expect(pull.arrivals).toBeGreaterThan(bare.arrivals);
    // compounding witness: the bonus population raises NEXT tick's inFlight,
    // deepening the surplus, saturating p — growth beats one-generation bonus.
    expect(pull.finalUnits).toBe(752);
    expect(pull.finalUnits).toBeGreaterThan(bare.finalUnits); // 377 bare
  });

  it("attenuated pull census: coefficient -0.25 still compounds on this board (792/748)", () => {
    const quarter = drive({ "spiral:drive": { coefficient: 0n - FIXED_UNIT / 4n, floor: 2 } }, 100);
    expect(quarter.arrivals).toBe(792);
    expect(quarter.finalUnits).toBe(748);
  });

  it("attract bites only above the floor: tick 0 (empty board) is byte-ident to bare, tick 1 diverges", () => {
    const bare = drive(undefined, 6);
    const pull = drive({ "spiral:drive": { coefficient: -FIXED_UNIT, floor: 2 } }, 6);
    expect(pull.chain[0]).toBe(bare.chain[0]); // inFlight 0 ≤ floor 2 ⇒ zero rolls
    expect(pull.chain[1]).not.toBe(bare.chain[1]); // inFlight 4 > floor ⇒ gravity engaged
  });

  it("per-type keying (attract side): rows authored for ANOTHER table attract nobody", () => {
    const other = drive({ "spiral:unrelated": { coefficient: -FIXED_UNIT, floor: 2 } }, 6);
    const bare = drive(undefined, 6);
    expect(other.arrivals).toBe(bare.arrivals);
    expect(other.chain).toStrictEqual(bare.chain); // zero rolls consumed for unlisted types
  });
});
