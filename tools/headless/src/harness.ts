/**
 * Dual-runtime parity harness — the RISK-1 gate (MASTER_REPORT §3.4;
 * docs/ARCHITECTURE.md §6).
 *
 * `runParityFixture()` is a PURE, side-effect-free scripted exercise of the
 * sim-core kernel over a fixed number of ticks. It touches every runtime-
 * sensitive surface where a V8/Node build could diverge from the browser-
 * worker build:
 *   A. fixed-point arithmetic   (Q16.16 mul/div round-half-away, overflow
 *      throws, clampUnit, compare — the exact kernels behind the knee curve)
 *   B. multi-domain RNG streams (splitmix64+FNV1a keying, rejection-sampled
 *      range, fork paths — the counter-based streams of §4.1 R-16)
 *   C. clock scales             (advanceClocks under speed 1/2/4 + incident
 *      flips, scaleUs floors on the business/wall rational scales)
 *   D. the composed tick loop (full 13-step threading + canonical state
 *      digests + chain digest) — real-v1 (pipeline/defaults createDefaultSlots)
 *      by default, stub-v1 selectable for regression comparison
 *
 * Every arm is reduced to a canonical digest via canonical.ts (bigint-safe,
 * insertion-order-preserving, no platform crypto). Byte-identical digests
 * across plain Node (`--experimental-transform-types`, i.e. V8 type-STIPPING)
 * and the vitest/esbuild pipeline = parity proven for the kernel surface
 * TODAY; the same harness stays the gate as real modules land.
 *
 * No file I/O, no env reads, no wall time inside this module — the fixture
 * is a function of (seed, ticks) alone.
 */

import { asEntityId, asRunSeed, clocks, fx, streams, type ClockState, type RunSeed } from "./sim-core.ts";
import { canonicalize, digestOfCanonical, fnv1a64Hex, serializeCanonical } from "./canonical.ts";
import { HARNESS_BUNDLE, PARITY_CLOCK, bundleContentHash, runEngine } from "./engine.ts";
import { parseBundleValue } from "./bundle.ts";
import type { ParsedBundle } from "./bundle.ts";
import { ACTIVE_COMPOSITION, createSlots, type CompositionFlavor } from "./slots.ts";

/** v2: Arm D flipped stub-v1 → real-v1 (createDefaultSlots) and the report
 *  gained `arms.engineRun.slotsFlavor`. v1 combined digests are the stub-era
 *  goldens, pinned in test/parity.test.ts as the regression arm. */
export const PARITY_FIXTURE = "hh-parity-v2";

export interface ParityReport {
  readonly fixture: string;
  readonly seed: string; // decimal string of the 64-bit run seed
  readonly ticks: number;
  readonly arms: {
    readonly fixedArithmetic: string;
    readonly rngStreams: string;
    readonly clockScales: string;
    readonly engineRun: EngineArmReport;
  };
  readonly combined: string;
}

/* ─────────────── Arm A: fixed-point arithmetic workout ─────────────── */

const MASK64 = 0xffffffffffffffffn;

function exerciseFixed(seedRaw: bigint, ticks: number): bigint {
  let acc = seedRaw & MASK64;
  const mix = (value: bigint): void => {
    acc = ((acc * 0x100000001b3n) ^ ((value << 13n) | (value >> 51n))) & MASK64;
    acc = (acc + (value & MASK64)) & MASK64;
  };

  for (let t = 0; t < ticks; t += 1) {
    // Deterministic pseudo-inputs (no rng arm cross-contamination).
    const n = BigInt((t * 7919 + 11) % 900);
    const rho = fx.fromRatio(n, 1_000n);
    mix(rho);

    const squared = fx.mul(rho, rho);
    mix(squared);

    // Knee multiplier ρ/(1−ρ) with the same 0.99 cap the queue stub uses.
    const capped = fx.compare(rho, fx.fromRatio(99n, 100n)) > 0 ? fx.fromRatio(99n, 100n) : rho;
    const denom = fx.sub(fx.FIXED_ONE, capped);
    if (denom > 0n) mix(fx.div(capped, denom));

    mix(fx.clampUnit(fx.add(squared, rho)));
    mix(BigInt(fx.compare(rho, fx.fromRatio(450n, 1_000n))));

    // Deliberate overflow probe: chain-mul must throw eventually; counting
    // throws (not catching values) is itself part of the parity surface.
    let runaway = fx.FIXED_ONE;
    let throwCount = 0;
    for (let k = 0; k < 24; k += 1) {
      try {
        runaway = fx.mul(runaway, fx.fromRatio(15n, 10n) + BigInt(t % 3));
      } catch {
        throwCount += 1;
      }
    }
    mix(BigInt(throwCount));
    mix(runaway);

    // inRange boundaries + fromInt negatives.
    mix(fx.inRange(fx.FIXED_RAW_MAX) ? 1n : 0n);
    mix(fx.fromInt(0 - (t % 300)));
  }
  return acc;
}

/* ─────────────── Arm B: multi-domain RNG stream workout ─────────────── */

const RNG_DOMAINS: readonly string[] = ["arrival", "route", "inspect", "outcome", "backpressure", "rules"];

function exerciseRng(seed: RunSeed, ticks: number): bigint {
  let acc = 0xcbf29ce484222325n;
  const mix = (value: bigint): void => {
    acc = (acc ^ value) & MASK64;
    acc = (acc * 0x100000001b3n) & MASK64;
  };

  for (let t = 0; t < ticks; t += 1) {
    const minute = t; // minute-keying doubles as tick iteration
    for (const [domainIndex, domain] of RNG_DOMAINS.entries()) {
      const stream = streams.streamFor(seed, domain, minute);
      mix(BigInt(stream.nextU32()));
      mix(BigInt(stream.range(1 + ((t * 31 + domainIndex * 7) % 997)))); // rejection path
      const child = stream.fork(`sub-${(t % 5).toString()}`);
      mix(BigInt(child.nextU32()));
      mix(BigInt(child.range(2)));
    }
    // Entity-keyed stream + counter-based re-open: position stability check.
    const entityKey = `node-${(t % 8).toString()}`;
    const entityStream = streams.streamFor(seed, "inspect", minute, asEntityId(entityKey));
    const first = BigInt(entityStream.nextU32());
    const reopened = BigInt(streams.streamFor(seed, "inspect", minute, asEntityId(entityKey)).nextU32());
    mix(first);
    mix(first === reopened ? 1n : 0n); // must be 1 in every runtime
  }
  return acc;
}

/* ─────────────── Arm C: clock-scale workout ─────────────── */

function exerciseClocks(ticks: number): bigint {
  let acc = 0x9e3779b97f4a7c15n;
  const mix = (value: bigint): void => {
    acc = ((acc << 7n) | (acc >> 57n)) & MASK64;
    acc = (acc ^ value) & MASK64;
  };

  let state: ClockState = clocks.initialClocks();
  for (let t = 0; t < ticks; t += 1) {
    state = advanceScripted(state, BigInt(t));
    mix(state.realUs);
    mix(state.simUs);
    mix(state.businessUs);
    mix(state.wallUs);

    // Rational scale floors on every scale the engine can produce.
    const probe = 123_456_789n + BigInt(t);
    mix(clocks.scaleUs(probe, clocks.simScale(2)));
    mix(clocks.scaleUs(probe, clocks.BUSINESS_SCALE_DEFAULT));
    mix(clocks.scaleUs(probe, clocks.WALL_SCALE));
    mix(clocks.minutesToSimUs(t % 1_000));
    mix(clocks.tickOf(state));
    mix(BigInt(clocks.simMinuteOf(state)));

    // Negative-time fail-fast count (behavioral, deterministic).
    let guardThrows = 0;
    try {
      clocks.subUs(state.simUs, state.simUs + 1n);
      guardThrows += 100; // should be unreachable
    } catch {
      guardThrows += 1;
    }
    mix(BigInt(guardThrows));
    mix(clocks.minUs(state.realUs, state.simUs));
    mix(clocks.maxUs(state.businessUs, state.wallUs));
  }
  return acc;
}

function advanceScripted(clock: ClockState, tick: bigint): ClockState {
  return clocks.advanceClocks(clock, {
    realElapsedUs: 1_000_000n,
    speed: PARITY_CLOCK.speedAt(tick),
    incident: PARITY_CLOCK.incidentAt(tick),
  });
}

/* ─────────────── Arm D: composed engine run (real-v1 default) ─────────────── */

export interface EngineArmReport {
  readonly chainDigest: string;
  readonly finalStateHash: string;
  readonly checkpointCount: number;
  readonly slotsFlavor: CompositionFlavor;
}

function exerciseEngine(seed: RunSeed, ticks: number, flavor: CompositionFlavor): EngineArmReport {
  const parsed: ParsedBundle = parseBundleValue(HARNESS_BUNDLE, "harness:embedded");
  const composition = createSlots({
    seed,
    bundleId: parsed.bundle.id,
    flavor,
    ...(parsed.patienceUs === null ? {} : { patienceUs: parsed.patienceUs }),
    unitTerm: parsed.unitTerm,
    baselineRatePerMin: parsed.baselineRatePerMin,
  });
  const run = runEngine({
    seed,
    ticks,
    snapshotEveryTicks: 100,
    contentHashes: {
      rulesetCardHashes: { [parsed.bundle.id]: fnv1a64Hex(`bundle:${parsed.bundle.id}`) },
      sheetsHash: bundleContentHash(parsed.bundle),
      ruleBookHash: "0".repeat(32),
    },
    slots: composition.slots,
    slotsFlavor: composition.flavor,
    clockScript: PARITY_CLOCK,
    bundleId: parsed.bundle.id,
  });
  return {
    chainDigest: run.chainDigest,
    finalStateHash: digestOfCanonical(canonicalize(run.finalState, "$")),
    checkpointCount: run.checkpoints.length,
    slotsFlavor: run.slotsFlavor,
  };
}

/* ─────────────── arm reduction ─────────────── */

/** 64-bit accumulator → 32-hex digest, same double-FNV shape as state hashes. */
function doubleHex(value: bigint): string {
  const inner = fnv1a64Hex(value.toString(16));
  return inner + fnv1a64Hex(inner);
}

/* ─────────────── fixture assembly ─────────────── */

export function runParityFixture(
  seedValue: bigint,
  ticks = 1_000,
  flavor: CompositionFlavor = ACTIVE_COMPOSITION,
): ParityReport {
  if (!Number.isSafeInteger(ticks) || ticks < 1) {
    throw new Error(`runParityFixture: ticks must be ≥ 1, got ${String(ticks)}`);
  }
  const seed = asRunSeed(seedValue);
  const arms = {
    fixedArithmetic: doubleHex(exerciseFixed(seedValue, ticks)),
    rngStreams: doubleHex(exerciseRng(seed, ticks)),
    clockScales: doubleHex(exerciseClocks(ticks)),
    engineRun: exerciseEngine(seed, ticks, flavor),
  };
  const report: ParityReport = {
    fixture: PARITY_FIXTURE,
    seed: seedValue.toString(),
    ticks,
    arms,
    combined: "",
  };
  const body: Omit<ParityReport, "combined"> = { ...report };
  return { ...report, combined: digestOfCanonical(canonicalize(body, "$")) };
}

/** The fixture as a single canonical string — what both arms must print
 *  byte-identically (test/parity.test.ts asserts exactly this). */
export function parityFixtureCanonical(
  seedValue: bigint,
  ticks?: number,
  flavor: CompositionFlavor = ACTIVE_COMPOSITION,
): string {
  return serializeCanonical(canonicalize(runParityFixture(seedValue, ticks, flavor), "$"));
}

export { ACTIVE_COMPOSITION, createSlots };
