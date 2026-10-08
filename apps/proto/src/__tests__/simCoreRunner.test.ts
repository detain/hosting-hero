/**
 * WAVE-2 INTEGRATION GATE — the real @hh/sim-core runner behind OUR protocol.
 *
 * Headline law proven here: two FRESH SimCoreRunner instances on one seed
 * emit byte-identical projection digests for 100 ticks, measured entirely
 * through the wire surface (encodeProjection → canonicalDigest). If any
 * wall-clock, Math.random, or hidden instance state leaked into projections,
 * this test goes red.
 */
import { describe, expect, it } from "vitest";
import { canonicalDigest } from "@hh/sim-core/replay";
import { type PlayerIntent, type PlayerVerbArgs } from "@hh/sim-core";
import {
  asEntityId,
  observedKey,
  type EntityId,
  type ObservedKey,
} from "@hh/sim-core/types";
import { fromInt } from "@hh/sim-core/kernel";
import { decodeProjection, encodeProjection, type SimProjection } from "../shared/protocol";
import { createRunner, SimCoreRunner } from "../runner/index";
import { partitionLaneEntries } from "../runner/simCoreRunner";

const TICKS = 100;

/** Drive a fresh runner and return the digest of every projected frame. */
function frameDigests(seed: number): string[] {
  const runner = new SimCoreRunner({ seed });
  const digests: string[] = [];
  for (let i = 0; i < TICKS; i += 1) {
    const projection = runner.headlessStep(10);
    digests.push(canonicalDigest(encodeProjection(projection)));
  }
  runner.stop();
  return digests;
}

function lastProjection(seed: number): SimProjection {
  const runner = new SimCoreRunner({ seed });
  let projection: SimProjection | null = null;
  for (let i = 0; i < TICKS; i += 1) projection = runner.headlessStep(10);
  runner.stop();
  if (projection === null) throw new Error("no projection produced");
  return projection;
}

describe("sim-core runner determinism (100 ticks through the protocol)", () => {
  it("two fresh instances produce byte-identical projection digests", () => {
    const a = frameDigests(42);
    const b = frameDigests(42);
    expect(a).toHaveLength(TICKS);
    expect(b).toHaveLength(TICKS);
    // Every frame must match, not just the final one:
    expect(a).toEqual(b);
    // Sanity: the run actually moved (frames are not all identical).
    expect(new Set(a).size).toBeGreaterThan(1);
  });

  it("a different seed diverges (digests are seed-sensitive, not constant)", () => {
    expect(frameDigests(43)[TICKS - 1]).not.toBe(frameDigests(42)[TICKS - 1]);
  });
});

/* ------------------------------------------------------------------ *
 * J2 — the intent door is wired (contract #10). Verbs submitted via
 * `submit` are stamped for the NEXT tick and fed through
 * TickInputs.externalIntents exactly once; verdicts return as
 * intent-executed / intent-refused notices. Tests upgraded, not
 * weakened: the pre-door claim "no legal door exists" is dead.
 * ------------------------------------------------------------------ */

/** Flat-scalar door payload builder — exactly what crosses the wire. The
 *  codec (protocol.test) proves scalar-ness; here we enter post-parse, so the
 *  args record is cast to the door's discriminated union like the worker does. */
function verbIntent(
  seq: number,
  args: Readonly<Record<string, string | number | null>>,
): PlayerIntent {
  return {
    seq,
    clock: "sim",
    atUs: 0n,
    origin: "player",
    payload: { kind: "player-verb", args: args as unknown as PlayerVerbArgs },
  };
}

function intentNotices(projection: SimProjection) {
  return projection.notices.filter((n) => n.kind === "intent-executed" || n.kind === "intent-refused");
}

describe("intent-door wiring (contract #10: execute-or-refuse, never silence)", () => {
  it("a player-verb executes on the next tick and posts an intent-executed receipt", () => {
    const runner = new SimCoreRunner({ seed: 5 });
    runner.submit(verbIntent(1, { verb: "communicate", note: "drill", target: null }));
    const projection = runner.headlessStep(10);
    const receipts = intentNotices(projection);
    expect(receipts).toHaveLength(1);
    expect(receipts[0]?.kind).toBe("intent-executed");
    expect(receipts[0]?.detail).toBe("communicate");
    runner.stop();
  });

  it("a refusal names its reason in the receipt detail", () => {
    const runner = new SimCoreRunner({ seed: 5 });
    runner.submit(verbIntent(1, { verb: "toggle-speed", speedX: 3 })); // SpeedX is {1,2,4}
    const receipts = intentNotices(runner.headlessStep(10));
    expect(receipts).toHaveLength(1);
    expect(receipts[0]?.kind).toBe("intent-refused");
    expect(receipts[0]?.detail).toMatch(/^toggle-speed: bad-speed/);
    runner.stop();
  });

  it("two hands (§7.5): the third same-tick verb is refused hands-exhausted", () => {
    const runner = new SimCoreRunner({ seed: 5 });
    runner.submit(verbIntent(1, { verb: "communicate", note: "a", target: null }));
    runner.submit(verbIntent(2, { verb: "communicate", note: "b", target: null }));
    runner.submit(verbIntent(3, { verb: "communicate", note: "c", target: null }));
    const receipts = intentNotices(runner.headlessStep(10));
    expect(receipts.filter((r) => r.kind === "intent-executed")).toHaveLength(2);
    const refused = receipts.filter((r) => r.kind === "intent-refused");
    expect(refused).toHaveLength(1);
    expect(refused[0]?.detail).toMatch(/^communicate: hands-exhausted/); // reason carries "need/free of capacity"
    runner.stop();
  });

  it("the legacy verb carrier is logged but never fed to the door", () => {
    const runner = new SimCoreRunner({ seed: 5 });
    runner.submit({
      seq: 1,
      clock: "sim",
      atUs: 0n,
      origin: "player",
      payload: { kind: "verb", verb: "scale-out", target: null, value: null },
    });
    const projection = runner.headlessStep(10);
    expect(intentNotices(projection)).toHaveLength(0); // refused-carrier never even reached the door
    expect(runner.submittedIntents()).toHaveLength(1); // input log still records it
    runner.stop();
  });

  it("scripted door traffic stays byte-identical across two fresh instances", () => {
    const run = (): { digests: string[]; receipts: number } => {
      const runner = new SimCoreRunner({ seed: 42 });
      const digests: string[] = [];
      let receipts = 0;
      for (let i = 0; i < TICKS; i += 1) {
        if (i % 10 === 0) {
          runner.submit(verbIntent(i + 1, { verb: "communicate", note: `beat-${i}`, target: null }));
          runner.submit(verbIntent(i + 1000, { verb: "toggle-speed", speedX: 3 })); // guaranteed refusal
        }
        const projection = runner.headlessStep(10);
        receipts += intentNotices(projection).length;
        digests.push(canonicalDigest(encodeProjection(projection)));
      }
      runner.stop();
      return { digests, receipts };
    };
    const a = run();
    const b = run();
    expect(a.digests).toEqual(b.digests);
    expect(a.receipts).toBeGreaterThan(0); // the door actually ran in both arms
    expect(new Set(a.digests).size).toBeGreaterThan(1);
  });
});

describe("sim-core runner projection is real sim output", () => {
  const projection = lastProjection(42);

  it("ticks advance exactly one macro-tick per step, clocks move forward", () => {
    expect(projection.tick).toBe(BigInt(TICKS));
    expect(projection.minute).toBe(TICKS);
    expect(projection.clocks.simUs).toBeGreaterThan(0n);
    expect(projection.seq).toBe(TICKS);
  });

  it("carries observed-layer LaneStats derived from the driver", () => {
    expect(projection.lanes.length).toBeGreaterThan(0);
    const lane = projection.lanes[0];
    expect(lane?.laneId).toBe("lane/ingress-1");
    expect(typeof lane?.ratePerMin).toBe("bigint"); // Fixed on the wire
    expect(lane?.latencyDistributionRef).toBe("g1-smoke-lag-v0");
  });

  it("outcome counters only ever count real terminals", () => {
    const { served, bounced, blockedFalsePositive, landed } = projection.counters;
    for (const value of [served, bounced, blockedFalsePositive, landed]) {
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
    }
    // Over 100 ticks of a storm-band wave the lane is not dead:
    expect(served + bounced + blockedFalsePositive + landed).toBeGreaterThan(0);
  });

  it("observed cells carry fog fidelity/coverage fields the renderer reads", () => {
    const cells = [...projection.observed.values()];
    expect(cells.length).toBeGreaterThan(0);
    for (const cell of cells) {
      expect(["live", "stale", "unknown"]).toContain(cell.status);
      expect(typeof cell.fidelity).toBe("number");
    }
  });

  it("projections survive the full wire round-trip losslessly (JSON+bigint)", () => {
    const decoded = JSON.parse(JSON.stringify(encodeProjection(projection)));
    // Round-trip is exercised exhaustively in protocol.test; here we only pin
    // that a sim-core frame encodes to the wire contract (no raw bigint leak).
    const walk = (value: unknown): void => {
      if (typeof value === "bigint") throw new Error("raw bigint leaked into wire");
      if (Array.isArray(value)) for (const item of value) walk(item);
      else if (value !== null && typeof value === "object") for (const inner of Object.values(value)) walk(inner);
    };
    walk(decoded);
  });
});

describe("runner factory returns the wired real driver", () => {
  it('createRunner("sim-core") yields a working SimCoreRunner', () => {
    const runner = createRunner("sim-core", 7);
    expect(runner.runnerId).toBe("sim-core");
    expect(runner).toBeInstanceOf(SimCoreRunner);
    const projection = runner.headlessStep(10);
    expect(projection.seq).toBe(1);
    runner.stop();
  });
});

/* ------------------------------------------------------------------ *
 * F2 — LANE ARRIVAL HONESTY. The driver mints retry/re-entry units
 * (`re<n>@<tick>`) BETWEEN steps: no arrival envelope, no arrival event
 * (pipeline/defaults.ts createArrivalStep ⚠ consumer note). Counting
 * step-1 events alone read a retry storm as a calm lane. The adapter now
 * partitions every tick into organic + re-entered entries, sums both into
 * the lane aggregate, and exposes the split as its own observed cell.
 * ------------------------------------------------------------------ */

const LANE = asEntityId("lane/ingress-1");
const KEY_RATE = observedKey(LANE, "ratePerMin");
const KEY_REENTRY = observedKey(LANE, "reentryRatePerMin");

/** The placeholder wave admits arrivals for WAVE_WINDOW minutes from
 *  WAVE_START_MINUTE (simCoreRunner scenario consts) — after this minute the
 *  envelope array is empty, so any lane entry is by construction a re-entry. */
const WAVE_END_MINUTE = 2 + 12;

function fixedCell(projection: SimProjection, key: ObservedKey): bigint {
  const value = projection.observed.get(key)?.value;
  if (typeof value !== "bigint") {
    throw new Error(`observed cell "${key}" missing or not a fixed value`);
  }
  return value;
}

/** Drive a fresh (optionally overridden-family) runner, return every frame. */
function driveFrames(seed: number, familyOverride?: "organic", ticks = 40): SimProjection[] {
  const runner = new SimCoreRunner(
    familyOverride === undefined ? { seed } : { seed, familyOverride },
  );
  const frames: SimProjection[] = [];
  for (let i = 0; i < ticks; i += 1) frames.push(runner.headlessStep(10));
  runner.stop();
  return frames;
}

describe("lane arrival honesty (F2: retry re-entries bypass step-1 events)", () => {
  it("partitionLaneEntries splits organic arrivals from silent re-entries", () => {
    // The red-first shape: NO arrival events this tick, yet a unit entered.
    expect(
      partitionLaneEntries({
        priorUnitIds: new Set<EntityId>([asEntityId("old-1")]),
        arrivalUnitIds: new Set<EntityId>(),
        currentUnitIds: new Set<EntityId>([asEntityId("old-1"), asEntityId("re3@16")]),
        outcomeUnitIds: new Set<EntityId>(),
      }),
    ).toEqual({ organic: 0, reentered: 1 });

    // Enter AND terminate within one tick: visible only through outcomes.
    expect(
      partitionLaneEntries({
        priorUnitIds: new Set<EntityId>(),
        arrivalUnitIds: new Set<EntityId>(),
        currentUnitIds: new Set<EntityId>(),
        outcomeUnitIds: new Set<EntityId>([asEntityId("re4@18")]),
      }),
    ).toEqual({ organic: 0, reentered: 1 });

    // Old units, arrivals, and same-tick exits of PRIOR units are not entries.
    expect(
      partitionLaneEntries({
        priorUnitIds: new Set<EntityId>([asEntityId("old-1")]),
        arrivalUnitIds: new Set<EntityId>([asEntityId("g1-adapter@40#0.0")]),
        currentUnitIds: new Set<EntityId>([asEntityId("g1-adapter@40#0.0")]),
        outcomeUnitIds: new Set<EntityId>([asEntityId("old-1")]),
      }),
    ).toEqual({ organic: 1, reentered: 0 });
  });

  it("a benign retry storm READS on the lane after the wave ends — event-counting saw zero", () => {
    // Placeholder content is 100% malicious (adversarial → never re-enters),
    // so the storm needs the familyOverride test seam: organic traffic that
    // bounces re-enters via the driver's between-steps mint.
    const frames = driveFrames(7, "organic");
    const stormFrames = frames.filter(
      (f) => Number(f.minute) > WAVE_END_MINUTE && fixedCell(f, KEY_REENTRY) > 0n,
    );
    expect(stormFrames.length).toBeGreaterThan(0); // probe-pinned: seeds 7/42/904 all storm
    for (const frame of stormFrames) {
      // Post-window there are NO arrival envelopes ⇒ organic is structurally 0.
      // The old arrivalsThisTick event count read 0 here while units entered.
      expect(fixedCell(frame, KEY_RATE)).toBe(fixedCell(frame, KEY_REENTRY));
      expect(fixedCell(frame, KEY_RATE)).toBeGreaterThan(0n);
      // LaneStats aggregate is honest too (what the HUD instruments consume).
      expect(frame.lanes[0]?.ratePerMin).toBe(fixedCell(frame, KEY_RATE));
    }
  });

  it("in-window frames carry the explicit split: total = organic + reentries", () => {
    // Seed 7, organic override: tick 13 mixes one organic arrival with one
    // re-entry (probe-pinned) — the (c) requirement: storms read DIFFERENTLY.
    const mixed = driveFrames(7, "organic").find((f) => f.tick === 13n);
    if (mixed === undefined) throw new Error("expected a tick-13 frame");
    const reentry = fixedCell(mixed, KEY_REENTRY);
    const total = fixedCell(mixed, KEY_RATE);
    expect(reentry).toBe(fromInt(1)); // one silent re-entry
    expect(total).toBe(fromInt(2)); // one organic arrival + that re-entry
    expect(total - reentry).toBe(fromInt(1)); // organic component stays visible by subtraction
  });

  it("the shipped malicious placeholder never re-enters: honest zeros on every frame", () => {
    const frames = driveFrames(42, undefined, TICKS);
    for (const frame of frames) {
      expect(fixedCell(frame, KEY_REENTRY)).toBe(0n); // cell present, value honest
    }
  });

  it("storm scenario is deterministic: two fresh instances replay byte-identically", () => {
    const digests = (): string[] => driveFrames(7, "organic").map((f) => canonicalDigest(encodeProjection(f)));
    const a = digests();
    const b = digests();
    expect(a).toHaveLength(40);
    expect(a).toEqual(b);
    expect(new Set(a).size).toBeGreaterThan(1);
  });

  it("wire back-compat: new cell round-trips; old 2-cell frames still decode", () => {
    const frame = driveFrames(7, "organic").find((f) => fixedCell(f, KEY_REENTRY) > 0n);
    if (frame === undefined) throw new Error("expected a storm frame");
    const decoded = decodeProjection(JSON.parse(JSON.stringify(encodeProjection(frame))));
    expect(decoded.observed.get(KEY_REENTRY)?.value).toBe(fixedCell(frame, KEY_REENTRY));

    // A legacy frame (observed array WITHOUT the new key) must decode unchanged.
    const legacyWire = encodeProjection(frame) as unknown as Record<string, unknown>;
    const observedRaw = legacyWire["observed"];
    if (!Array.isArray(observedRaw)) throw new Error("expected observed array");
    legacyWire["observed"] = observedRaw.filter(
      (cell) => (cell as { key: string }).key !== "lane/ingress-1::reentryRatePerMin",
    );
    const legacy = decodeProjection(legacyWire);
    expect(legacy.observed.has(KEY_REENTRY)).toBe(false);
    expect(legacy.observed.get(KEY_RATE)?.value).toBe(fixedCell(frame, KEY_RATE));
    expect(legacy.lanes[0]?.ratePerMin).toBe(frame.lanes[0]?.ratePerMin);
  });
});
