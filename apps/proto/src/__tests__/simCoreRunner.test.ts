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
import { FIXED_UNIT, fromInt, fromRatio } from "@hh/sim-core/kernel";
import { decodeProjection, encodeProjection, type SimProjection } from "../shared/protocol";
import { createRunner, SimCoreRunner } from "../runner/index";
import {
  FAMILY_MIX,
  arrivalSuspicion,
  partitionLaneEntries,
} from "../runner/simCoreRunner";
import { SimCoreRunner as LegacySimCoreRunner } from "./legacyRunner.fixture";

const TICKS = 100;

/** The fix-economy @57ea80e reputation publisher's exact cell key, branded
 *  at this boundary like the producer does (economy/reputation.ts). */
const REPUTATION_KEY: ObservedKey = observedKey(asEntityId("company"), "reputation");

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

/* B4 RECAPTURE (disclosed): the runner plans the SHIPPED g1 slice lazily per
 * window, so the stream moved — wave-1 is PLACED at minute 6 (not 2), the five
 * authored windows run to ~minute 62, and the real family mix (customerAsThreat
 * 20% / malicious 35% / human 20% / entropic 5% / systemic 20%) mints benign
 * traffic that lands where the old all-malicious placeholder only bounced.
 * Every pin below is a FRESH probe-derived value on the new stream. */

/** The pre-B4 placeholder window boundary (2 + 12). Kept as the "late minutes"
 *  gate: the live schedule runs to ~minute 62, so pure re-entry minutes past 14
 *  are still structurally mint-free windows of organic traffic. */
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
    // Organic override stays the storm seam: benign traffic that bounces
    // re-enters via the driver's between-steps mint. B4 RECAPTURE: the live
    // schedule runs to ~minute 62, so drive 100 ticks; the first PURE
    // (re-entry-only) minute is 62 — exactly when the last envelope closes
    // (probe: 10 pure frames, minutes 62-71, first rate 2/min).
    const frames = driveFrames(7, "organic", TICKS);
    const stormFrames = frames.filter(
      (f) =>
        Number(f.minute) > WAVE_END_MINUTE &&
        fixedCell(f, KEY_REENTRY) > 0n &&
        fixedCell(f, KEY_RATE) === fixedCell(f, KEY_REENTRY),
    );
    expect(stormFrames.length).toBe(10); // probe-pinned on the B4 stream
    expect(Number(stormFrames[0]?.minute)).toBe(62);
    for (const frame of stormFrames) {
      // Post-window there are NO arrival envelopes ⇒ organic is structurally 0.
      // The old arrivalsThisTick event count read 0 here while units entered.
      expect(fixedCell(frame, KEY_RATE)).toBe(fixedCell(frame, KEY_REENTRY));
      expect(fixedCell(frame, KEY_RATE)).toBeGreaterThan(0n);
      // LaneStats aggregate is honest too (what the HUD instruments consume).
      expect(frame.lanes[0]?.ratePerMin).toBe(fixedCell(frame, KEY_RATE));
    }
  });

  it("mid-schedule frames carry the explicit split: total = organic + reentries", () => {
    // B4 RECAPTURE: seed 33/organic no longer shows a mixed frame inside the
    // old 14-tick reach (the placement draw parks wave-1 at minute 6 and the
    // re-entry maturity moved); seed 7/organic mixes at minute 54 — inside
    // wave-5's window — one organic mint plus one silent re-entry
    // (probe-pinned: re 1.0, total 2.0).
    const mixed = driveFrames(7, "organic", TICKS).find((f) => {
      const re = fixedCell(f, KEY_REENTRY);
      return re > 0n && fixedCell(f, KEY_RATE) > re;
    });
    if (mixed === undefined) throw new Error("expected a mixed frame");
    expect(Number(mixed.minute)).toBe(54);
    const reentry = fixedCell(mixed, KEY_REENTRY);
    const total = fixedCell(mixed, KEY_RATE);
    expect(reentry).toBe(fromInt(1)); // one silent re-entry
    expect(total).toBe(fromInt(2)); // one organic arrival + that re-entry
    expect(total - reentry).toBe(fromInt(1)); // organic component stays visible by subtraction
  });

  it("seed 42's mainline mix never re-enters in 100 ticks: honest zeros on every frame", () => {
    // B4: the content is no longer an all-malicious placeholder — the shipped
    // g1 mix DOES mint benign families here, but on this seed they land or are
    // served rather than bouncing back into a storm (probe: re-entry census
    // stays 0 through minute 100). The cell is still published every frame.
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
    // B4 RECAPTURE: first storm frame moved to minute 54 → drive the full 100.
    const frame = driveFrames(7, "organic", TICKS).find((f) => fixedCell(f, KEY_REENTRY) > 0n);
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

/* ------------------------------------------------------------------ *
 * REST-MAZING (§7.10) — the strategic lane split on the MAINLINE
 * board. The audit finding (group-21 #2): mazing lived only inside
 * gate G3 because the product runner pinned expressPath == deepPath.
 * The board now forks — express = edge → waf → origin, deep = edge →
 * deep-terminal — classification is armed by the FRONT DOOR's own
 * inspectionDepth (movable only through the real intent door), the
 * dial slider sets the split threshold, and the familyWeights table
 * authored in packages/content rides the arrival dice.
 * ------------------------------------------------------------------ */

const KEY_EXPRESS = observedKey(LANE, "routedExpress");
const KEY_DEEP = observedKey(LANE, "routedDeep");
const KEY_ARMED = observedKey(LANE, "mazeArmed");

/** Count-cells are plain numbers (not Fixed) — fail loud on any drift. */
function intCell(projection: SimProjection, key: ObservedKey): number {
  const value = projection.observed.get(key)?.value;
  if (typeof value !== "number") {
    throw new Error(`observed cell "${key}" missing or not a number`);
  }
  return value;
}

function dialIntent(value: bigint): PlayerIntent {
  return {
    seq: 1,
    clock: "sim",
    atUs: 0n,
    origin: "player",
    payload: { kind: "slider", control: "dial", value },
  };
}

function disarmFrontDoorIntent(seq: number): PlayerIntent {
  return verbIntent(seq, {
    verb: "configure-node",
    nodeId: "edge",
    inspectionDepth: "pass-through",
    shedOrder: null,
  });
}

type RunnerOptions = ConstructorParameters<typeof SimCoreRunner>[0];
function drive(
  seed: number,
  opts?: {
    /** intents[i] is submitted BEFORE the (i+1)-th frame (null = quiet tick). */
    intents?: ReadonlyArray<PlayerIntent | null>;
    ticks?: number;
    familyOverride?: "organic";
  },
): SimProjection[] {
  const runner = new SimCoreRunner(
    (opts?.familyOverride === undefined
      ? { seed }
      : { seed, familyOverride: opts.familyOverride }) as RunnerOptions,
  );
  const frames: SimProjection[] = [];
  const ticks = opts?.ticks ?? 40;
  for (let i = 0; i < ticks; i += 1) {
    const intent = opts?.intents?.[i];
    if (intent !== undefined && intent !== null) runner.submit(intent);
    frames.push(runner.headlessStep(10));
  }
  runner.stop();
  return frames;
}

describe("mainline mazing (§7.10): two lanes, real door, authored traffic mix", () => {
  it("no intents needed: hot arrivals route deep, cold arrivals ride express", () => {
    // B4 RECAPTURE (disclosed): the live schedule places wave-1 at minute 6
    // and the first HOT units (deep-routed) only arrive with wave-4's marked
    // follow-ons — first deep tick 41 (was 7 on the placeholder stream).
    // After the full five windows at 100 ticks: 32 express / 8 deep.
    const frames = drive(42, { ticks: TICKS });
    const firstDeep = frames.find((f) => intCell(f, KEY_DEEP) >= 1);
    expect(firstDeep?.tick).toBe(41n);
    const last = frames[frames.length - 1];
    if (last === undefined) throw new Error("expected frames");
    expect(intCell(last, KEY_EXPRESS)).toBe(32);
    expect(intCell(last, KEY_DEEP)).toBe(8);
    expect(intCell(last, KEY_ARMED)).toBe(1); // front door boots armed (sample-1-in-20)
  });

  it("ConfigureNode on the front door (via the REAL intent door) stops classification", () => {
    // Submitted at tick 1, executed at tick 2 — before any arrival mints —
    // so EVERY unit rides express: deep stays 0, armed flips to 0, and the
    // express total matches the armed board's combined split (8 + 1 = 9).
    const frames = drive(42, {
      intents: [null, disarmFrontDoorIntent(2)], // index 1 = after frame 1
      ticks: TICKS,
    });
    const receipts = frames.flatMap((f) =>
      f.notices.filter(
        (n) => n.kind === "intent-executed" && (n.detail ?? "").startsWith("configure-node"),
      ),
    );
    expect(receipts).toHaveLength(1); // the door ran the verb, receipt posted
    const last = frames[frames.length - 1];
    if (last === undefined) throw new Error("expected frames");
    expect(intCell(last, KEY_ARMED)).toBe(0);
    expect(intCell(last, KEY_DEEP)).toBe(0);
    // B4 RECAPTURE: 44 lane entries at 100 ticks (was 9 pre-B4 at 40 ticks —
    // the armed/disarm arms no longer mint IDENTICAL totals: lane choice feeds
    // back into bounce→re-entry maturity, so pass-through serves shift the
    // queue. The conservation gate below re-pins Σrate == express + deep per arm.)
    expect(intCell(last, KEY_EXPRESS)).toBe(44);
  });

  it("the dial is the split threshold: max ⇒ all express, zero ⇒ all deep", () => {
    const lenient = drive(42, { intents: [dialIntent(FIXED_UNIT)], ticks: TICKS });
    const strict = drive(42, { intents: [dialIntent(0n)], ticks: TICKS });
    const lastOf = (frames: SimProjection[]): SimProjection => {
      const last = frames[frames.length - 1];
      if (last === undefined) throw new Error("expected frames");
      return last;
    };
    // score > dial ⇒ deep. dial=1.0: no score exceeds it (max score = 1.0,
    // and the comparison is strict). dial=0: every unit with reputation < 1
    // is demoted — seed 42's live schedule mints no perfect-reputation units.
    // B4 RECAPTURE (100 ticks): lenient 44/0, strict 0/41 — per-arm mint
    // totals differ for the same bounce-feedback reason as the disarm arm.
    expect(intCell(lastOf(lenient), KEY_DEEP)).toBe(0);
    expect(intCell(lastOf(lenient), KEY_EXPRESS)).toBe(44);
    expect(intCell(lastOf(strict), KEY_EXPRESS)).toBe(0);
    expect(intCell(lastOf(strict), KEY_DEEP)).toBe(41);
  });

  it("split ledger conserves lane entries: Σ ratePerMin == express + deep", () => {
    for (const seed of [42, 33]) {
      for (const arm of [{}, { familyOverride: "organic" as const }]) {
        const frames = drive(seed, arm);
        const entered = frames.reduce(
          (acc, f) => acc + Number(fixedCell(f, KEY_RATE) / FIXED_UNIT),
          0,
        );
        const last = frames[frames.length - 1];
        if (last === undefined) throw new Error("expected frames");
        expect(intCell(last, KEY_EXPRESS) + intCell(last, KEY_DEEP)).toBe(entered);
      }
    }
  });

  it("arrivalSuspicion is the exact Q16.16 complement of reputation", () => {
    expect(arrivalSuspicion({ source: { reputation: FIXED_UNIT } })).toBe(0n);
    expect(arrivalSuspicion({ source: { reputation: 0n } })).toBe(FIXED_UNIT);
    expect(arrivalSuspicion({ source: { reputation: fromRatio(3n, 4n) } })).toBe(
      FIXED_UNIT - fromRatio(3n, 4n),
    );
  });

  it("FAMILY_MIX carries the authored shared-web weights, renormalised to 1e6", () => {
    // Batch-B handoff (@4856a42): parseFamilyWeightsTable is the SSOT parse —
    // code-unit family order, exact 1_000_000 sum. If the bundle drifts, the
    // module-load parse throws; this pin shows WHAT the arrival dice now carry.
    expect([...FAMILY_MIX]).toEqual([
      { family: "customerAsThreat", shareMicro: 200_000 },
      { family: "entropic", shareMicro: 50_000 },
      { family: "human", shareMicro: 200_000 },
      { family: "malicious", shareMicro: 350_000 },
      { family: "systemic", shareMicro: 200_000 },
    ]);
    expect(FAMILY_MIX.reduce((acc, row) => acc + row.shareMicro, 0)).toBe(1_000_000);
  });

  it("mazed frames stay byte-identical across fresh instances (headline gate covers it)", () => {
    const digests = (): string[] =>
      drive(42, { ticks: 100, intents: [null, disarmFrontDoorIntent(2)] }).map((f) =>
        canonicalDigest(encodeProjection(f)),
      );
    expect(digests()).toEqual(digests());
  });

  it("pre-arrival frames are field-identical to the pre-mazing runner", () => {
    // (b)'s conservative form: the maze board may only differ from the old
    // single-lane board WHERE ROUTING LEGITIMATELY BECOMES VISIBLE — i.e.
    // once units exist. Ticks 1–2 have no units on either board, so every
    // shared field must match byte-for-byte (the three new count-cells are
    // additive surface the old frame simply lacks).
    //
    // MONEY-LANE EXTENSION (REST-PROTO-FINAL, disclosed): the economy lane
    // adds exactly two kinds of movement to these frames, both additive —
    //  · notices: every `economy-notice` is new surface (the legacy runner
    //    had no money lane at all); stripping them must leave the legacy
    //    notice list byte-identical, in order.
    //  · freeCashMicroUsd: the legacy value was the createInitialState
    //    PLACEHOLDER (0n, never mirrored); the modern value is the real
    //    ledger mirror. Equality here was never physics — it was two zeros —
    //    so the honest pin flips to "ledger-funded opening grew on tick 1",
    //    with the exact probe-derived figure.
    // Pipeline-owned fields (tick/minute/clocks/lanes/counters + shared
    // observed cells) keep their exact-equality contract untouched.
    const legacy = new LegacySimCoreRunner({ seed: 42 });
    const modern = new SimCoreRunner({ seed: 42 });
    const LEDGER_TICK1_FREE: bigint = 25_005_307_300n; // opening 25_000_000_000 + tick-1 settles
    for (let i = 0; i < 2; i += 1) {
      const a = legacy.headlessStep(10);
      const b = modern.headlessStep(10);
      expect(b.tick).toBe(a.tick);
      expect(b.minute).toBe(a.minute);
      expect(b.clocks).toEqual(a.clocks);
      expect(b.lanes).toEqual(a.lanes);
      expect(b.counters).toEqual(a.counters);
      expect(b.notices.filter((n) => n.kind !== "economy-notice")).toEqual(a.notices);
      for (const n of b.notices) {
        if (a.notices.includes(n)) continue;
        expect(n.kind).toBe("economy-notice"); // every extra is money, nothing else
      }
      if (i === 0) {
        expect(b.freeCashMicroUsd).toBe(LEDGER_TICK1_FREE); // ledger authority, exact
        expect(a.freeCashMicroUsd).toBe(0n); // legacy placeholder, on the record
      } else {
        expect(b.freeCashMicroUsd).toBeGreaterThan(a.freeCashMicroUsd);
      }
      for (const [key, cell] of a.observed) {
        expect(b.observed.get(key)).toEqual(cell); // shared cells agree exactly
      }
      // Reputation is publish-on-change: quiet ticks 1–2 must NOT have moved
      // it, so the modern frames carry no `company::reputation` cell yet.
      expect(b.observed.has(REPUTATION_KEY)).toBe(false);
    }
    legacy.stop();
    modern.stop();
  });
});

/* ------------------------------------------------------------------ *
 * MONEY LANE (REST-PROTO-FINAL, 45f0edf handoff #1) — the product
 * runner ticks the real economy, forwards its observedWrites, and lets
 * the ledger own `freeCashMicroUsd`. All figures probe-derived from a
 * 100-tick seed-42 run of THIS runner (deterministic by the headline
 * gate's own law), pinned as goldens below.
 * ------------------------------------------------------------------ */

describe("runner money lane (economy engine + observedWrites flow)", () => {
  /** Drive seed 42, return every frame. */
  function moneyFrames(seed = 42): SimProjection[] {
    const runner = new SimCoreRunner({ seed });
    const frames: SimProjection[] = [];
    for (let i = 0; i < TICKS; i += 1) frames.push(runner.headlessStep(10));
    runner.stop();
    return frames;
  }

  function economyDetails(frame: SimProjection): string[] {
    return frame.notices
      .filter((n) => n.kind === "economy-notice")
      .map((n) => n.detail ?? "?");
  }

  it("frame 1 carries the priming witnesses: renewal pulses, then the hourly heartbeat issue→paid", () => {
    // Engine order is deterministic: all three contracts pulse at term start,
    // then the monthly + the TWO hourly cycles the ~102.86-business-minute
    // first tick crosses issue and settle.
    expect(economyDetails(moneyFrames()[0] as SimProjection)).toEqual([
      "renewal-pulse:ctr-gold-1",
      "renewal-pulse:ctr-hourly-1",
      "renewal-pulse:ctr-pending-1",
      "invoice-issued:ctr-gold-1",
      "invoice-issued:ctr-hourly-1",
      "invoice-issued:ctr-hourly-1",
      "invoice-paid:ctr-gold-1",
      "invoice-paid:ctr-hourly-1",
      "invoice-paid:ctr-hourly-1",
    ]);
  });

  it("the pending deal ACTIVATES at tick 3 (termStartMin 300 crossed) — the 57ea80e phase witness", () => {
    const frames = moneyFrames();
    expect(economyDetails(frames[1] as SimProjection)).not.toContain("contract-activated:ctr-pending-1");
    expect(economyDetails(frames[2] as SimProjection)).toContain("contract-activated:ctr-pending-1");
  });

  it("freeCashMicroUsd is the ledger mirror, not the placeholder (exact 100-tick golden)", () => {
    const frames = moneyFrames();
    expect((frames[0] as SimProjection).freeCashMicroUsd).toBe(25_005_307_300n);
    const last = (frames[TICKS - 1] as SimProjection).freeCashMicroUsd;
    expect(last).toBe(25_109_732_500n);
    // Revenue-positive over the window, and never rewinds within a run at
    // this funding level (no opex lane; settles only add).
    let prev = 25_000_000_000n;
    for (const f of frames) {
      expect(f.freeCashMicroUsd).toBeGreaterThanOrEqual(prev);
      prev = f.freeCashMicroUsd;
    }
  });

  it("dunning drama on the hourly contract moves the reputation cell through the store (g17 #2 in the product)", () => {
    const frames = moneyFrames();
    // The engine's own census over the window (probe-derived goldens):
    const census = new Map<string, number>();
    for (const f of frames) {
      for (const d of economyDetails(f)) {
        const kind = d.split(":")[0] as string;
        census.set(kind, (census.get(kind) ?? 0) + 1);
      }
    }
    expect(census.get("invoice-failed")).toBe(16);
    expect(census.get("dunning-stage")).toBe(15);
    expect(census.get("dunning-recovered")).toBe(2);
    // 2 × +150 bps from initial 5000 ⇒ 5300 bps ⇒ Fixed 34734 (the ONLY
    // signal class that fired — no incident/write-off on this board).
    const rep = (frames[TICKS - 1] as SimProjection).observed.get(REPUTATION_KEY);
    expect(rep?.value).toBe(34_734n);
    expect(rep?.status).toBe("live");
    // Quiet early frames carry NO reputation cell (publish-on-change law):
    expect((frames[0] as SimProjection).observed.has(REPUTATION_KEY)).toBe(false);
  });

  it("no insolvent-settle refusals on a funded roster (F4 boundary stays silent)", () => {
    const runner = new SimCoreRunner({ seed: 42 });
    for (let i = 0; i < TICKS; i += 1) runner.headlessStep(10);
    expect(runner.economyInvoiceRefusals()).toBe(0);
    runner.stop();
  });

  it("the familyOverride test seam does NOT fork the money lane", () => {
    // Economy inputs are family-independent; only pipeline notices/cells may
    // differ — cash is the same ledger walk both arms.
    const plain = moneyFrames();
    const organic = moneyFrames();
    const runner = new SimCoreRunner({ seed: 42, familyOverride: "organic" });
    let last: SimProjection | null = null;
    for (let i = 0; i < TICKS; i += 1) last = runner.headlessStep(10);
    runner.stop();
    expect((last as SimProjection).freeCashMicroUsd).toBe((plain[TICKS - 1] as SimProjection).freeCashMicroUsd);
    expect(organic.length).toBe(TICKS);
  });
});
