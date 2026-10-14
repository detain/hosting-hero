/**
 * apps/proto/src/runner/simCoreRunner.ts — the corruption outage fan,
 * proto side (mirrors unattended/corruption-forwarding.test.ts on
 * fastForward): the §1.7 `corrupts` patience mode maps every corrupted
 * completed response to 60 SLA seconds via the pipeline's public
 * `corruptionOutageSecs`, and the runner folds that fan into the SAME
 * EconomyTickIn.outageSecs channel as the landed fan (audit minor @16c6add
 * host wiring).
 *
 * Pin philosophy:
 *   1. PLANTED arm — a storm-boosted table × patienceModeByType drives real
 *      queue exhaustion; corrupted cells appear AND the burned error-budget
 *      seconds equal exactly 60 × (corruptions + landings) across ALL three
 *      money contracts (the fan hits every key; min-remaining witnesses it).
 *   2. UNPLANTED twin — same storm table, seam omitted vs explicitly
 *      undefined: every frame digest pairwise-identical (the default-off
 *      byte-identity law), zero cells, and the budget moved ONLY by the
 *      landed fan (identity stated, not a lucky zero).
 *
 * Why `familyOverride: "organic"` on the planted arm: the corruption fold
 * only attaches to a `served` terminal (a response that completed WRONG);
 * every shipped g1 family is adversarial and terminates as `landed`, which
 * would witness zero corruption no matter how long the queue runs. The
 * override rewrites the envelope's dominant family (runner seam @71b8960-
 * era) so the storm is CUSTOMER traffic: it congests the same board,
 * completes as `served`, and exhaustion under `corrupts` corrupts it.
 *
 * Clock safety: 60 steps ≈ 6,171 business minutes — well under the first
 * week roll (10,080) and month roll (43,200 at tick 420), so no refund or
 * month machinery can touch the burned-seconds identity.
 */
import { describe, expect, it } from "vitest";
import { canonicalDigest } from "@hh/sim-core/replay";
import { encodeProjection, type SimProjection } from "../shared/protocol";
import { SimCoreRunner } from "../runner/index";
import { SHARED_WEB_G1_TABLE } from "../runner/waveRules";

/* Pristine budget at the runner's 9,990 bps commitment (2592 s), and the
   per-outage seconds BOTH fans burn. Frozen arithmetic, not taste. */
const PRISTINE_SEC = 2592n;
const OUTAGE_SEC = 60n;

/* Storm arm: the shipped g1 table with 8× the pressure-to-units ladder, so
   the 1-slot origin and 2-slot edge saturate inside 60 steps and queue
   exhaustion (patience 3 min) corrupts under the armed mode. */
const STORM_TABLE = Object.freeze({
  ...SHARED_WEB_G1_TABLE,
  unitsPerPressurePoint: SHARED_WEB_G1_TABLE.unitsPerPressurePoint * 8,
});

const STEPS = 60;

function runFrames(
  options: ConstructorParameters<typeof SimCoreRunner>[0],
): SimProjection[] {
  const runner = new SimCoreRunner(options);
  const frames: SimProjection[] = [];
  for (let i = 0; i < STEPS; i += 1) frames.push(runner.headlessStep(10));
  runner.stop();
  return frames;
}

/** Corrupted-unit truth cells published by the driver (one per corrupted
 *  COMPLETED response — unit ids are unique per response). */
function corruptedCellCount(runner: SimCoreRunner): number {
  let cells = 0;
  for (const key of runner.lastTickFacts().game.observed.keys()) {
    if (key.endsWith("::corruptedCount")) cells += 1;
  }
  return cells;
}

function frame(projection: SimProjection): string {
  return canonicalDigest(encodeProjection(projection));
}

describe("runner corruption fan → error budget (host wiring @16c6add)", () => {
  it("planted `corrupts`: cells burn the budget exactly 60 × (C + L)", () => {
    const runner = new SimCoreRunner({
      seed: 42,
      table: STORM_TABLE,
      familyOverride: "organic",
      patienceModeByType: { [STORM_TABLE.id]: "corrupts" },
    });
    let last: SimProjection | null = null;
    for (let i = 0; i < STEPS; i += 1) last = runner.headlessStep(10);
    const cells = corruptedCellCount(runner);
    expect(cells).toBeGreaterThan(0);
    const landed = BigInt(last?.counters.landed ?? 0);
    expect(runner.errorBudgetMinSec()).toBe(
      PRISTINE_SEC - OUTAGE_SEC * (BigInt(cells) + landed),
    );
    runner.stop();
  });

  it("unplanted twin: omitted vs explicit-undefined mint identical frames", () => {
    const twinAbsent = runFrames({ seed: 42, table: STORM_TABLE });
    const twinUndefined = runFrames({
      seed: 42,
      table: STORM_TABLE,
      patienceModeByType: undefined,
    });
    expect(twinAbsent).toHaveLength(STEPS);
    for (let i = 0; i < STEPS; i += 1) {
      expect(frame(twinAbsent[i] as SimProjection)).toBe(
        frame(twinUndefined[i] as SimProjection),
      );
    }
  });

  it("unplanted twin: zero cells, budget moved only by the landed fan", () => {
    const runner = new SimCoreRunner({ seed: 42, table: STORM_TABLE });
    let last: SimProjection | null = null;
    for (let i = 0; i < STEPS; i += 1) last = runner.headlessStep(10);
    expect(corruptedCellCount(runner)).toBe(0);
    const landed = BigInt(last?.counters.landed ?? 0);
    expect(runner.errorBudgetMinSec()).toBe(PRISTINE_SEC - OUTAGE_SEC * landed);
    runner.stop();
  });

  it("the seam is inert when it names no arriving type", () => {
    const armed = runFrames({
      seed: 42,
      table: STORM_TABLE,
      patienceModeByType: { "no-such-type": "corrupts" },
    });
    const bare = runFrames({ seed: 42, table: STORM_TABLE });
    expect(armed).toHaveLength(STEPS);
    for (let i = 0; i < STEPS; i += 1) {
      expect(frame(armed[i] as SimProjection)).toBe(frame(bare[i] as SimProjection));
    }
  });
});

/* Lane E1 severity dial: the same storm arms, one extra config key. The
   dial burns more SLA seconds per corrupted response — 120 s keeps the
   planted burn clear of the 2592 s clamp, and 60 s (explicit) must mint
   the byte-identical frames of omitting it (default-off law). */
describe("runner corruption dial (lane E1)", () => {
  const plantedOptions: ConstructorParameters<typeof SimCoreRunner>[0] = {
    seed: 42,
    table: STORM_TABLE,
    familyOverride: "organic",
    patienceModeByType: { [STORM_TABLE.id]: "corrupts" },
  };

  it("dial 120n: cells burn 120 s each while the landed fan stays 60 s", () => {
    const runner = new SimCoreRunner({
      ...plantedOptions,
      corruptionOutageSecPerCorruption: 120n,
    });
    let last: SimProjection | null = null;
    for (let i = 0; i < STEPS; i += 1) last = runner.headlessStep(10);
    const cells = corruptedCellCount(runner);
    expect(cells).toBeGreaterThan(0);
    const landed = BigInt(last?.counters.landed ?? 0);
    expect(runner.errorBudgetMinSec()).toBe(
      PRISTINE_SEC - 120n * BigInt(cells) - OUTAGE_SEC * landed,
    );
    runner.stop();
  });

  it("explicit default 60n mints frames identical to omitting the dial", () => {
    const explicit = runFrames({ ...plantedOptions, corruptionOutageSecPerCorruption: 60n });
    const defaulted = runFrames({ ...plantedOptions });
    expect(explicit).toHaveLength(STEPS);
    for (let i = 0; i < STEPS; i += 1) {
      expect(frame(explicit[i] as SimProjection)).toBe(frame(defaulted[i] as SimProjection));
    }
  });

  it("a mis-dial throws `corruption[bad-value]` on the first step", () => {
    const runner = new SimCoreRunner({
      seed: 42,
      table: STORM_TABLE,
      corruptionOutageSecPerCorruption: 0n,
    });
    expect(() => runner.headlessStep(10)).toThrow(/corruption\[bad-value\]/);
    runner.stop();
  });
});
