/**
 * §7.7 RECOVERY HALF v0 — second failure window · gradual restoration ·
 * safe mode (pipeline/recovery.ts; audit g21's nine consecutive MISSING
 * recovery headings, the engine-defensible subset).
 *
 * Pins, per the lane contract:
 *  - PRESENCE-GATE (sacred): an unwired driver never materializes the
 *    slice, never throttles, and digests byte-identically across a 30-tick
 *    bounce-storm board (the same board that DOES open windows when
 *    wired — the pair is the falsification witness);
 *  - the same struggle INSIDE a window costs a lock, OUTSIDE costs only an
 *    episode mark — divergence pinned minute-exact;
 *  - gradual restoration is pure minute math (one arm per rampMinutes,
 *    monotone, no RNG); the struggle witness is bounced events naming the
 *    node (R-06 sheds / R-10 patience bounces);
 *  - an occupied arm is NEVER evicted — the shrink defers (fail-safe law);
 *  - digest-switch law: the slice absorbs ONLY when present, windows sort
 *    code-unit (insertion order never read).
 */

import { describe, expect, it } from "vitest";
import type { EntityId, GameState, NodeRecord, RecoveryState, RecoveryWindowRecord } from "../../types";
import { asEntityId, asRunSeed } from "../../types";
import { fromInt } from "../../kernel/fixed";
import { streamFor } from "../../kernel/rng";
import { createInitialState, createTickDriver, type TickInputs } from "../driver";
import { digestState } from "../digest";
import { createDefaultSlots } from "../defaults";
import type { DefaultPipelineConfig } from "../defaults";
import {
  countStrugglesByNode,
  defaultRecoveryConfig,
  emptyRecoveryState,
  foldRecoveryTick,
  parseRecoveryConfig,
  RecoveryError,
  RECOVERY_NOTICE_KINDS,
  throttleServeNodes,
  type RecoveryConfig,
} from "../recovery";
import { IDS, MIN, envelope, freshClocks, node, testConfig, tickInputs } from "./helpers";

/* ═══════════════════════════ parse (Laws 2+4) ═══════════════════════════ */

describe("parseRecoveryConfig — fail-loud boundary", () => {
  it("accepts the shipped default book and freezes the copy", () => {
    const cfg = parseRecoveryConfig({ ...defaultRecoveryConfig() });
    expect(cfg).toEqual(defaultRecoveryConfig());
    expect(Object.isFrozen(cfg)).toBe(true);
  });

  it("refuses unknown keys, non-integers, zero, negatives, and non-objects — naming the path", () => {
    const good = { ...defaultRecoveryConfig() };
    expect(() => parseRecoveryConfig({ ...good, bonusKnob: 3 })).toThrow(RecoveryError);
    expect(() => parseRecoveryConfig({ ...good, bonusKnob: 3 })).toThrow(/unknown-key.*recovery\.bonusKnob/);
    expect(() => parseRecoveryConfig({ ...good, windowMinutes: 0 })).toThrow(/bad-value.*recovery\.windowMinutes/);
    expect(() => parseRecoveryConfig({ ...good, rampMinutes: 2.5 })).toThrow(RecoveryError);
    expect(() => parseRecoveryConfig({ ...good, floorSlots: -1 })).toThrow(RecoveryError);
    expect(() => parseRecoveryConfig(null)).toThrow(/bad-shape/);
    expect(() => parseRecoveryConfig("nope")).toThrow(RecoveryError);
    // missing key = undefined value → same wall (parse, never default-silent)
    const { quietMinutes: _gone, ...rest } = good;
    expect(() => parseRecoveryConfig(rest)).toThrow(/recovery\.quietMinutes/);
  });

  it("the config key vocabulary is closed and total", () => {
    expect(Object.keys(defaultRecoveryConfig()).sort()).toEqual(
      ["floorSlots", "quietMinutes", "rampMinutes", "struggleBounceThreshold", "windowMinutes"],
    );
  });

  it("createTickDriver parses options.recovery AT CREATION (purge-knob shape)", () => {
    expect(() =>
      createTickDriver(
        createDefaultSlots(testConfig()),
        streamFor(asRunSeed(1n), "root", 0),
        freshClocks(),
        { recovery: { ...defaultRecoveryConfig(), windowMinutes: 0 } },
      ),
    ).toThrow(RecoveryError);
  });
});

/* ═══════════════════════════ the fold (pure minute math) ═══════════════ */

const CFG: RecoveryConfig = Object.freeze({
  windowMinutes: 6,
  rampMinutes: 2,
  floorSlots: 1,
  struggleBounceThreshold: 2,
  quietMinutes: 1,
});

function foldTick(input: {
  readonly prior: RecoveryState | undefined;
  readonly minute: number;
  readonly struggles?: readonly [EntityId, number][];
  readonly arms?: readonly [EntityId, number][];
  readonly cfg?: RecoveryConfig;
}) {
  return foldRecoveryTick({
    prior: input.prior,
    minute: input.minute,
    struggles: new Map(input.struggles ?? []),
    nodeSlotCounts: new Map(input.arms ?? [[IDS.edge, 4]]),
    cfg: input.cfg ?? CFG,
  });
}

describe("foldRecoveryTick — episode → window → strike → restore", () => {
  it("an empty board of news returns the IDLE-ABSENT slice (byte-identity switch)", () => {
    const folded = foldTick({ prior: undefined, minute: 0 });
    expect(folded.state).toBeUndefined();
    expect(folded.notices).toEqual([]);
  });

  it("struggle marks the episode with ONE notice — below threshold it is weather", () => {
    const one = foldTick({ prior: undefined, minute: 3, struggles: [[IDS.edge, 1]] });
    expect(one.state?.lastStruggleMinute.get(IDS.edge)).toBeUndefined();
    expect(one.notices.map((n) => n.kind)).toEqual([]);
    const two = foldTick({ prior: one.state, minute: 4, struggles: [[IDS.edge, 2]] });
    expect(two.state?.lastStruggleMinute.get(IDS.edge)).toBe(4);
    expect(two.notices.map((n) => n.kind)).toEqual(["episode"]);
    expect(two.notices[0]?.causeId).toBe("recovery:episode:edge:4");
  });

  it("the window opens at the exact quiet boundary — not a minute early", () => {
    const struggling = foldTick({ prior: undefined, minute: 5, struggles: [[IDS.edge, 3]] });
    const sameMinute = foldTick({ prior: struggling.state, minute: 5 });
    expect(sameMinute.state?.windows.size ?? 0).toBe(0); // minute−episode = 0 < quietMinutes
    const opened = foldTick({ prior: struggling.state, minute: 6 });
    expect(opened.state?.windows.get(IDS.edge)?.phase).toBe("window");
    const rec = opened.state?.windows.get(IDS.edge);
    expect(rec?.fullSlots).toBe(4); // captured from the arms book at open
    expect(rec?.effectiveSlots).toBe(1); // floor posture at open — gradual, never a snap
    // closesAt = open + max(windowMinutes, rampSpan=2×(4−1)) = 6+6 = 12 —
    // the countdown NEVER ends before the climb can finish (close ⇒ whole):
    expect(rec?.closesAtMinute).toBe(12);
    expect(opened.notices.map((n) => n.kind)).toEqual(["window-opened"]);
  });

  it("the climb adds exactly one arm per rampMinutes — monotone, pure minute math", () => {
    let prior = foldTick({ prior: undefined, minute: 0, struggles: [[IDS.edge, 2]] }).state;
    prior = foldTick({ prior, minute: 1 }).state; // opens: effective 1
    const eff = (m: number): number | undefined => {
      prior = foldTick({ prior, minute: m }).state;
      return prior?.windows.get(IDS.edge)?.effectiveSlots;
    };
    expect(eff(2)).toBe(1); // floor + floor(1/2) = 1
    expect(eff(3)).toBe(2); // floor + floor(2/2) = 2
    expect(eff(5)).toBe(3);
    expect(eff(7)).toBe(4); // full arms
  });

  it("THE SECOND FAILURE: a strike inside the window locks to the floor and restarts — the SAME struggle outside the window only marks an episode", () => {
    // inside: episode → open → struggle mid-window
    let prior = foldTick({ prior: undefined, minute: 0, struggles: [[IDS.edge, 2]] }).state;
    prior = foldTick({ prior, minute: 1 }).state; // window open (closesAt 7)
    const struck = foldTick({ prior, minute: 4, struggles: [[IDS.edge, 2]] });
    const locked = struck.state?.windows.get(IDS.edge);
    expect(locked?.phase).toBe("locked");
    expect(locked?.strikes).toBe(1);
    expect(locked?.effectiveSlots).toBe(1); // safe-mode floor — the lock IS the cost
    expect(locked?.lockUntilMinute).toBe(4 + CFG.windowMinutes);
    expect(struck.notices.map((n) => n.kind)).toEqual(["second-failure", "lock-engaged"]);
    // outside: the identical bounce count with no window earns NO strike, NO lock
    const atPeace = foldTick({ prior: undefined, minute: 4, struggles: [[IDS.edge, 2]] });
    expect(atPeace.state?.windows.size ?? 0).toBe(0);
    expect(atPeace.notices.map((n) => n.kind)).toEqual(["episode"]);
    // the divergence itself is the falsifiable claim:
    expect(struck.notices.length).toBe(2);
    expect(atPeace.notices.length).toBe(1);
  });

  it("consecutive locked struggles do NOT stack strikes — one strike per lock", () => {
    let prior = foldTick({ prior: undefined, minute: 0, struggles: [[IDS.edge, 2]] }).state;
    prior = foldTick({ prior, minute: 1 }).state;
    prior = foldTick({ prior, minute: 4, struggles: [[IDS.edge, 2]] }).state; // strike 1
    const again = foldTick({ prior, minute: 5, struggles: [[IDS.edge, 3]] });
    expect(again.state?.windows.get(IDS.edge)?.strikes).toBe(1);
    expect(again.notices).toEqual([]);
    // after the hold expires the window RESUMES at the floor, re-anchored:
    const resumed = foldTick({ prior: again.state, minute: 10 });
    const rec = resumed.state?.windows.get(IDS.edge);
    expect(rec?.phase).toBe("window");
    expect(rec?.openedAtMinute).toBe(10);
    expect(rec?.effectiveSlots).toBe(1);
    // and a fresh struggle in the resumed window strikes AGAIN (2 lifetime):
    const second = foldTick({ prior: resumed.state, minute: 11, struggles: [[IDS.edge, 2]] });
    expect(second.state?.windows.get(IDS.edge)?.strikes).toBe(2);
  });

  it("the zero hour closes only on a STRICTLY later quiet minute; a struggle at the boundary strikes instead (safety wins)", () => {
    let prior = foldTick({ prior: undefined, minute: 0, struggles: [[IDS.edge, 2]] }).state;
    prior = foldTick({ prior, minute: 1 }).state; // closesAt = 1+6 = 7
    for (const m of [2, 3, 4, 5, 6, 7]) prior = foldTick({ prior, minute: m }).state;
    expect(prior?.windows.get(IDS.edge)?.effectiveSlots).toBe(4); // full by minute 7
    // struggle at closesAt+1: the clear is blocked, the strike lands:
    const strikeLate = foldTick({ prior, minute: 8, struggles: [[IDS.edge, 2]] });
    expect(strikeLate.state?.windows.get(IDS.edge)?.phase).toBe("locked");
    // quiet at closesAt+1: restored, record leaves, slice goes idle-ABSENT:
    const cleared = foldTick({ prior, minute: 8 });
    expect(cleared.notices.map((n) => n.kind)).toEqual(["window-cleared"]);
    expect(cleared.state).toBeUndefined();
  });

  it("a window whose node LEFT the board mid-countdown fails loud (adjudicate, never swallow)", () => {
    let prior = foldTick({ prior: undefined, minute: 0, struggles: [[IDS.edge, 2]] }).state;
    prior = foldTick({ prior, minute: 1 }).state;
    expect(() => foldTick({ prior, minute: 2, arms: [] })).toThrow(RecoveryError);
    expect(() => foldTick({ prior, minute: 2, arms: [] })).toThrow(/board-drift/);
  });

  it("the notice vocabulary is CLOSED and exactly the declared five", () => {
    expect([...RECOVERY_NOTICE_KINDS].sort()).toEqual(
      ["episode", "lock-engaged", "second-failure", "window-cleared", "window-opened"],
    );
  });

  it("node iteration is sorted code-unit — Map insertion order can never leak", () => {
    const a = asEntityId("aaa");
    const z = asEntityId("zzz");
    const prior = foldTick({ prior: undefined, minute: 0, struggles: [[z, 2]] }).state;
    const both = foldTick({
      prior,
      minute: 1,
      struggles: [[a, 2]],
      arms: [
        [z, 4],
        [a, 4],
      ],
    });
    void both;
    // episode-only tick on two nodes: notice order follows STRUGGLE order here
    // (both new), so pin the windows-map ordering law through two opens instead:
    let live = foldTick({ prior: undefined, minute: 0, struggles: [[z, 2], [a, 2]] }).state;
    live = foldTick({ prior: live, minute: 1, arms: [[a, 4], [z, 4]] }).state;
    expect([...(live?.windows.keys() ?? [])]).toEqual([a, z]); // sorted, insertion-proof
  });
});

/* ═══════════════════════ the serve throttle ═══════════════════════════ */

function windowedRecord(over: Partial<RecoveryWindowRecord> = {}): RecoveryWindowRecord {
  return Object.freeze({
    nodeId: IDS.edge,
    phase: "window",
    openedAtMinute: 0,
    closesAtMinute: 6,
    lockUntilMinute: 0,
    strikes: 0,
    fullSlots: 4,
    effectiveSlots: 2,
    ...over,
  });
}

function sliceWith(...records: readonly RecoveryWindowRecord[]): RecoveryState {
  const windows = new Map<EntityId, RecoveryWindowRecord>();
  for (const rec of records) windows.set(rec.nodeId, rec);
  return Object.freeze({ windows, lastStruggleMinute: Object.freeze(new Map()) });
}

describe("throttleServeNodes — the arms the node actually serves with", () => {
  it("idle inputs pass the SAME Map object (identity — zero copies, zero cost)", () => {
    const nodes = new Map<EntityId, NodeRecord>([[IDS.edge, node(IDS.edge, { slots: 4 })]]);
    expect(throttleServeNodes(nodes, undefined)).toBe(nodes);
    expect(throttleServeNodes(nodes, emptyRecoveryState())).toBe(nodes);
  });

  it("truncates to a prefix, expands with blank arms, and never touches windowless nodes", () => {
    const edge = node(IDS.edge, { slots: 4 });
    const origin = node(IDS.origin, { slots: 2 });
    const nodes = new Map<EntityId, NodeRecord>([
      [IDS.edge, edge],
      [IDS.origin, origin],
    ]);
    const shrunk = throttleServeNodes(nodes, sliceWith(windowedRecord({ effectiveSlots: 2 })));
    expect(shrunk.get(IDS.edge)?.slots.length).toBe(2);
    expect(shrunk.get(IDS.origin)).toBe(origin); // identity ride
    // the slot PREFIX is preserved (positions are the contract):
    expect(shrunk.get(IDS.edge)?.slots).toEqual(edge.slots.slice(0, 2));
    const grown = throttleServeNodes(nodes, sliceWith(windowedRecord({ effectiveSlots: 5, fullSlots: 5 })));
    expect(grown.get(IDS.edge)?.slots.length).toBe(5);
    const extra = grown.get(IDS.edge)?.slots[4];
    expect(extra).toEqual({ occupied: false, unitId: null, waitingOn: null, releasedAtUs: null });
  });

  it("AN OCCUPIED ARM IS NEVER EVICTED — the shrink defers to the occupied floor", () => {
    const busySlots = [
      { occupied: false, unitId: null, waitingOn: null, releasedAtUs: null },
      { occupied: true, unitId: "u7" as never, waitingOn: null, releasedAtUs: 123n },
      { occupied: false, unitId: null, waitingOn: null, releasedAtUs: null },
      { occupied: false, unitId: null, waitingOn: null, releasedAtUs: null },
    ] as never;
    const edge = Object.freeze({ ...node(IDS.edge, { slots: 1 }), slots: busySlots });
    const nodes = new Map<EntityId, NodeRecord>([[IDS.edge, edge]]);
    const throttled = throttleServeNodes(nodes, sliceWith(windowedRecord({ effectiveSlots: 1 })));
    expect(throttled.get(IDS.edge)?.slots.length).toBe(2); // floor = last occupied + 1
    expect(throttled.get(IDS.edge)?.slots[1]?.occupied).toBe(true); // the unit survives
  });

  it("stored arms ABOVE the captured fullSlots is board drift — thrown, named", () => {
    const nodes = new Map<EntityId, NodeRecord>([[IDS.edge, node(IDS.edge, { slots: 6 })]]);
    expect(() => throttleServeNodes(nodes, sliceWith(windowedRecord({ fullSlots: 4 })))).toThrow(
      /board-drift.*edge/,
    );
  });
});

/* ═══════════════════ driver integration + byte-identity ═══════════════ */

const ARRIVALS_PER_MIN = 6;

function recCfg(overrides: Partial<DefaultPipelineConfig> = {}): DefaultPipelineConfig {
  return testConfig({ runSeed: asRunSeed(77n), ...overrides });
}

function stormInputs(): TickInputs {
  return tickInputs({
    envelopes: Object.freeze([envelope("recovery:probe", fromInt(ARRIVALS_PER_MIN))]),
    dependencyEdges: Object.freeze([]),
  });
}

function quietInputs(): TickInputs {
  return tickInputs({ envelopes: Object.freeze([]), dependencyEdges: Object.freeze([]) });
}

interface DriveRun {
  readonly chain: readonly string[];
  readonly states: readonly GameState[];
  readonly notices: readonly string[];
  final: GameState;
}

function drive(nodes: readonly NodeRecord[], recovery: RecoveryConfig | undefined, ticks: { storm: number; quiet: number }): DriveRun {
  const config = recCfg();
  const driver = createTickDriver(createDefaultSlots(config), streamFor(config.runSeed, "root", 0), freshClocks(), {
    ...(recovery !== undefined ? { recovery } : {}),
  });
  let state = createInitialState({
    runSeed: config.runSeed,
    engineVersion: "recovery-test",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "recovery-test", ruleBookHash: "" },
    clocks: freshClocks(),
    nodes,
  });
  const chain: string[] = [];
  const states: GameState[] = [];
  const notices: string[] = [];
  const feed = (inputs: TickInputs): void => {
    const result = driver.advance(state, inputs);
    state = result.state;
    states.push(state);
    chain.push(digestState(state));
    for (const n of result.recoveryNotices ?? []) notices.push(`${n.kind}@${n.atMinute}:${n.nodeId}`);
  };
  for (let t = 0; t < ticks.storm; t += 1) feed(stormInputs());
  for (let t = 0; t < ticks.quiet; t += 1) feed(quietInputs());
  return { chain, states, notices, final: state };
}

/** Patience bounce STORM: 4-slot hockey-stick edge under 6/min with 1min
 *  service — the queue grows ~2/tick, units age past the 3min patience and
 *  bounce NAME the edge (R-10). Arms CYCLE fast (1min), so by the quiet
 *  minute the occupied floor clears and the floor-1 truncation is VISIBLE
 *  in the stored record, then the climb walks 1→4 by pure minute math. No
 *  hard ceiling (the shed path is pinned in shed-terminal.test.ts). */
const STORM_NODES = Object.freeze([
  node(IDS.edge, { slots: 4, serviceUs: MIN }),
  node(IDS.origin, { slots: 8, serviceUs: MIN }),
]);

describe("recovery-wired driver — the observable half of §7.7", () => {
  const RECOVERY: RecoveryConfig = Object.freeze({ ...defaultRecoveryConfig(), struggleBounceThreshold: 1, windowMinutes: 8, rampMinutes: 2, quietMinutes: 1 });

  it("the unwired twin of a recovering board NEVER materializes the slice and reports no notices", () => {
    const unwired = drive(STORM_NODES, undefined, { storm: 8, quiet: 8 });
    expect(unwired.notices).toEqual([]);
    for (const state of unwired.states) expect(state.recovery).toBeUndefined();
  });

  it("byte-identity: unwired digests the SAME chain with recovery CONFIG wired but nothing struggling (quiet board)", () => {
    const off = drive([node(IDS.edge, { slots: 2 }), node(IDS.origin, { slots: 8 })], undefined, { storm: 0, quiet: 12 });
    const on = drive([node(IDS.edge, { slots: 2 }), node(IDS.origin, { slots: 8 })], RECOVERY, { storm: 0, quiet: 12 });
    expect(on.chain).toEqual(off.chain); // no bounce ≥ threshold ⇒ slice never appears
    for (const state of on.states) expect(state.recovery).toBeUndefined();
  });

  it("wired + struggling: episode → window-opened; the STORED node serves the ramped arms, not the full board", () => {
    const run = drive(STORM_NODES, RECOVERY, { storm: 6, quiet: 10 });
    expect(run.notices.some((n) => n.startsWith("episode@"))).toBe(true);
    expect(run.notices.some((n) => n.startsWith("window-opened@"))).toBe(true);
    // while a window lives, the stored edge record NEVER exceeds its captured
    // full board — and at least once it serves strictly fewer arms (gradual
    // restoration moved REAL state, not just a notice log):
    let sawTruncated = false;
    for (const state of run.states) {
      const win = state.recovery?.windows.get(IDS.edge);
      const stored = state.nodes.get(IDS.edge)?.slots.length ?? 0;
      if (win !== undefined) {
        expect(stored).toBeLessThanOrEqual(win.fullSlots);
        if (stored < win.fullSlots) sawTruncated = true;
      }
    }
    expect(sawTruncated).toBe(true);
  });

  it("the wired chain DIGESTS DIFFERENTLY from the unwired chain (recovery is not cosmetic)", () => {
    const off = drive(STORM_NODES, undefined, { storm: 6, quiet: 10 });
    const on = drive(STORM_NODES, RECOVERY, { storm: 6, quiet: 10 });
    expect(on.chain).not.toEqual(off.chain);
  });

  it("replay byte-identity: two wired runs of the same script digest the same chain and notices", () => {
    const a = drive(STORM_NODES, RECOVERY, { storm: 6, quiet: 10 });
    const b = drive(STORM_NODES, RECOVERY, { storm: 6, quiet: 10 });
    expect(a.chain).toEqual(b.chain);
    expect(a.notices).toEqual(b.notices);
  });

  it("the slice retires: after a full quiet tail with no new struggle, windows clear and the key LEAVES GameState", () => {
    const run = drive(STORM_NODES, RECOVERY, { storm: 4, quiet: 40 });
    expect(run.notices.some((n) => n.startsWith("window-cleared@"))).toBe(true);
    expect(run.final.recovery).toBeUndefined(); // absent-while-idle
  });
});

/* ═══════════════════════ digest-switch law ═══════════════════════════ */

describe("digest absorption — the recovery block", () => {
  const base = createInitialState({
    runSeed: asRunSeed(5n),
    engineVersion: "digest-recovery",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "x", ruleBookHash: "" },
    clocks: freshClocks(),
    nodes: [node(IDS.edge, { slots: 2 })],
  });

  it("an absent slice absorbs NOTHING — seeding it changes the digest; different windows differ", () => {
    const bare = digestState(base);
    const seeded = createInitialState({
      runSeed: asRunSeed(5n),
      engineVersion: "digest-recovery",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "x", ruleBookHash: "" },
      clocks: freshClocks(),
      nodes: [node(IDS.edge, { slots: 2 })],
      recovery: emptyRecoveryState(),
    });
    expect(digestState(seeded)).not.toBe(bare); // digest-switch (key present ⇒ absorbed)
    const openA = createInitialState({
      runSeed: asRunSeed(5n),
      engineVersion: "digest-recovery",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "x", ruleBookHash: "" },
      clocks: freshClocks(),
      nodes: [node(IDS.edge, { slots: 2 })],
      recovery: sliceWith(windowedRecord({ effectiveSlots: 1 })),
    });
    const openB = createInitialState({
      runSeed: asRunSeed(5n),
      engineVersion: "digest-recovery",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "x", ruleBookHash: "" },
      clocks: freshClocks(),
      nodes: [node(IDS.edge, { slots: 2 })],
      recovery: sliceWith(windowedRecord({ effectiveSlots: 2 })),
    });
    expect(digestState(openA)).not.toBe(digestState(openB)); // fields are absorbed
    expect(digestState(openA)).not.toBe(bare);
  });
});

/* ═══════════════════════ the struggle witness ═══════════════════════ */

describe("countStrugglesByNode", () => {
  it("counts bounced events with a node; null-node bounces are unowned weather", () => {
    const counts = countStrugglesByNode([
      { kind: "bounced", atUs: 0n, tick: 0n, causeId: "x" as never, unitId: "u1" as never, nodeId: IDS.edge },
      { kind: "bounced", atUs: 0n, tick: 0n, causeId: "x" as never, unitId: "u2" as never, nodeId: IDS.edge },
      { kind: "bounced", atUs: 0n, tick: 0n, causeId: "x" as never, unitId: "u3" as never, nodeId: null },
      { kind: "served", atUs: 0n, tick: 0n, causeId: "x" as never, unitId: "u4" as never, nodeId: IDS.edge },
    ] as never);
    expect(counts.get(IDS.edge)).toBe(2);
    expect(counts.size).toBe(1);
  });
});
