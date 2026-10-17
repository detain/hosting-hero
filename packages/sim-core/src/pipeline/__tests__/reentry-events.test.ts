/**
 * ADR-0017 · reentry attribution events (I-RA Option D, owner max-feature
 * ruling 2026-10-17). The driver mints matured re-entries BETWEEN ticks;
 * step 1 never sees them and a mint-tick terminal is pruned before any
 * consumer sweep. The fix is pure event-stream attribution: one ReentryEvent
 * per maturation, carrying (unitId, retryOf, lineageRoot, retryDepth) —
 * zero GameState bytes, zero digest participation, zero wire.
 *
 * The headline immunity proof is the FULL SIM-CORE SERIAL PASSING UNAIDED
 * (every digest literal green without a single re-pin); THIS file pins the
 * positive law: emission timing, canonical order, grammar, viral honesty,
 * the NO_RETRY zero-delta guard (the byte-identity fence for every
 * storm-free golden), the F6 checkpoint twin, and ×100 determinism.
 */

import { describe, expect, it } from "vitest";
import type { ExternalIntent, SimEvent, SimTick } from "../../types";
import { PlayerVerb, asEntityId, asRunSeed, type PlayerVerbArgs } from "../../types";
import { FIXED_UNIT, fromInt } from "../../kernel/fixed";
import { initialClocks } from "../../kernel/time";
import { streamFor } from "../../kernel/rng";
import { createDefaultSlots } from "../defaults";
import { createInitialState, createTickDriver, type TickDriver, type TickResult } from "../driver";
import { encodeCanonicalJson } from "../../replay/canonical";
import { IDS, NO_RETRY, envelope, node, retryPolicy, testConfig, tickInputs } from "./helpers";

const MIN = 60_000_000n;

interface RunSpec {
  readonly maxRetries: number;
  readonly backoffBaseUs?: bigint;
  readonly ticks: number;
  readonly triggerTicks?: number;
  readonly arrivalsPerMin?: number;
  readonly patienceUs?: bigint;
  readonly returnProbability?: bigint;
  /** External intents fed on the given tick (1-based). */
  readonly intentsAt?: Partial<Record<number, readonly ExternalIntent[]>>;
}

interface Run {
  readonly results: TickResult[];
  readonly driver: TickDriver;
  readonly state0: ReturnType<typeof createInitialState>;
}

function ext(tick: SimTick, seq: number, args: PlayerVerbArgs): ExternalIntent {
  return Object.freeze({
    tick,
    intent: Object.freeze({
      seq,
      clock: "sim" as const,
      atUs: tick * MIN,
      origin: "player" as const,
      payload: Object.freeze({ kind: "player-verb" as const, args }),
    }),
  });
}

/** Saturated 1-slot board (retry-storm shape, seed 7): bounces begin while
 *  the trigger runs; every scheduled child matures one tick later because
 *  backoff 0n ⇒ readyAtTick = schedule tick ⇒ next-advance maturity. */
function makeRun(spec: RunSpec): Run {
  const config = testConfig({
    runSeed: asRunSeed(7n),
    expressPath: Object.freeze([IDS.waf]),
    deepPath: Object.freeze([IDS.waf]),
    defaultPatienceUs: spec.patienceUs ?? MIN,
    ...(spec.returnProbability === undefined ? {} : { returnProbability: spec.returnProbability }),
  });
  const slots = createDefaultSlots(config);
  const state0 = createInitialState({
    runSeed: config.runSeed,
    engineVersion: "test-reentry",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
    clocks: initialClocks(),
    nodes: [node(IDS.waf, { slots: 1, serviceUs: MIN })],
  });
  const driver = createTickDriver(slots, streamFor(config.runSeed, "root", 0), state0.context.clocks);
  const results: TickResult[] = [];
  let state = state0;
  for (let t = 1; t <= spec.ticks; t += 1) {
    const envelopes = t <= (spec.triggerTicks ?? 6) ? [envelope("flood", fromInt(spec.arrivalsPerMin ?? 3))] : [];
    const intents = spec.intentsAt?.[t];
    const result = driver.advance(
      state,
      tickInputs({
        envelopes,
        dependencyEdges: [],
        retryPolicy:
          spec.maxRetries === 0 && spec.backoffBaseUs === undefined
            ? NO_RETRY
            : retryPolicy(spec.maxRetries, spec.backoffBaseUs ?? 0n),
        ...(intents === undefined ? {} : { externalIntents: intents }),
      }),
    );
    results.push(result);
    state = result.state;
  }
  return { results, driver, state0 };
}

const isReentry = (e: SimEvent): e is Extract<SimEvent, { kind: "reentry" }> => e.kind === "reentry";
const reentriesOf = (events: readonly SimEvent[]) => events.filter(isReentry);
const countKind = (events: readonly SimEvent[], kind: SimEvent["kind"]) =>
  events.reduce((n, e) => n + (e.kind === kind ? 1 : 0), 0);
const reentryTuple = (e: Extract<SimEvent, { kind: "reentry" }>) =>
  Object.freeze([Number(e.tick), String(e.unitId), String(e.retryOf), String(e.lineageRoot), e.retryDepth]);
function collectReentries(results: readonly TickResult[]): ReturnType<typeof reentryTuple>[] {
  return results.flatMap((r) => reentriesOf(r.events).map(reentryTuple));
}

describe("reentry events — emission timing (backoff 0 ⇒ exactly the next tick)", () => {
  const run = makeRun({ maxRetries: 1, ticks: 20 });

  it("the storm is real: retries are scheduled and children mature", () => {
    const retries = run.results.reduce((n, r) => n + countKind(r.events, "retry"), 0);
    const reentries = run.results.reduce((n, r) => n + reentriesOf(r.events).length, 0);
    expect(retries).toBeGreaterThan(0);
    expect(reentries).toBeGreaterThan(0);
  });

  it("every tick's reentry count is EXACTLY the previous tick's retry count", () => {
    // maxRetries 1 ⇒ every scheduled child is a depth-1 retry (children
    // never re-schedule), and backoff 0n ⇒ maturity is the next advance.
    // Nothing scheduled on the final tick can mature — the window below
    // excludes it. No re-entries before the first bounce, either.
    expect(reentriesOf(run.results[0]!.events)).toHaveLength(0);
    for (let t = 1; t < run.results.length; t += 1) {
      const matured = reentriesOf(run.results[t]!.events).length;
      const scheduled = countKind(run.results[t - 1]!.events, "retry");
      expect(matured, `tick ${t + 1}`).toBe(scheduled);
    }
  });
});

describe("reentry events — canonical order within one TickResult", () => {
  const DOOR_KINDS = new Set<SimEvent["kind"]>(["intent-executed", "intent-refused"]);
  const TERMINAL_KINDS = new Set<SimEvent["kind"]>([
    "served",
    "bounced",
    "blocked-false-positive",
    "landed",
  ]);
  const run = makeRun({
    maxRetries: 1,
    ticks: 10,
    // tick 4 carries all five groups: door (free toggle-speed), reentry,
    // arrival, outcome — the pin site is the concat itself.
    intentsAt: { 4: [ext(4n, 1, { verb: PlayerVerb.ToggleSpeed, speedX: 2 } satisfies PlayerVerbArgs)] },
  });

  const bounds = (events: readonly SimEvent[]) => ({
    lastDoor: lastIndexOf(events, (e) => DOOR_KINDS.has(e.kind)),
    firstReentry: indexOf(events, (e) => e.kind === "reentry", "first"),
    lastReentry: indexOf(events, (e) => e.kind === "reentry", "last"),
    firstArrival: indexOf(events, (e) => e.kind === "arrival", "first"),
    lastArrival: indexOf(events, (e) => e.kind === "arrival", "last"),
    firstTerminal: indexOf(events, (e) => TERMINAL_KINDS.has(e.kind), "first"),
  });

  it("door < reentry < arrival < outcome — in EVERY tick that carries both", () => {
    for (const [i, r] of run.results.entries()) {
      const b = bounds(r.events);
      if (b.lastDoor >= 0 && b.firstReentry >= 0) {
        expect(b.lastDoor, `tick ${i + 1}: door leads`).toBeLessThan(b.firstReentry);
      }
      if (b.lastReentry >= 0 && b.firstArrival >= 0) {
        expect(b.lastReentry, `tick ${i + 1}: reentry before arrival`).toBeLessThan(b.firstArrival);
      }
      if (b.lastArrival >= 0 && b.firstTerminal >= 0) {
        expect(b.lastArrival, `tick ${i + 1}: arrival before outcome`).toBeLessThan(b.firstTerminal);
      }
    }
  });

  it("tick 4 has all five groups present — the ordering above is non-vacuous", () => {
    const b = bounds(run.results[3]!.events);
    expect(b.lastDoor).toBeGreaterThanOrEqual(0); // intent-executed
    expect(b.firstReentry).toBeGreaterThanOrEqual(0);
    expect(b.firstArrival).toBeGreaterThanOrEqual(0);
    expect(b.firstTerminal).toBeGreaterThanOrEqual(0);
  });
});

describe("reentry events — grammar", () => {
  const run = makeRun({ maxRetries: 2, ticks: 16 });

  it("causeId is `reentry:<childId>` and the child id embeds its maturity tick", () => {
    const all = run.results.flatMap((r) => reentriesOf(r.events));
    expect(all.length).toBeGreaterThan(0);
    for (const e of all) {
      expect(String(e.causeId)).toBe(`reentry:${String(e.unitId)}`);
      const match = /^re(\d+)@(\d+)$/.exec(String(e.unitId));
      expect(match, `mint grammar on ${String(e.unitId)}`).not.toBeNull();
      expect(Number(match?.[2])).toBe(Number(e.tick)); // minted in THIS tick
    }
  });
});

describe("reentry events — viral drafts carry retryOf null and are STILL emitted", () => {
  // Calm board, one customer/min at tick 1, returnProbability certainty:
  // the served customer (t2) schedules a return draft (retryOf null, backoff
  // 0 by the driver's own rule) which matures at t3 with a reentry event.
  // The run ENDS at t4 before the grandchild return can roll — the child
  // would itself be served at t4 and schedule another maturity at t5.
  const run = makeRun({
    maxRetries: 0,
    ticks: 4,
    triggerTicks: 1,
    arrivalsPerMin: 1,
    patienceUs: 3n * MIN,
    returnProbability: FIXED_UNIT,
  });

  it("exactly one null-parent reentry at t3; no retry-kind events anywhere", () => {
    const all = run.results.flatMap((r) => reentriesOf(r.events));
    expect(all).toHaveLength(1);
    const child = all[0]!;
    expect(child.retryOf).toBeNull();
    expect(child.retryDepth).toBe(0);
    // lineageRoot falls back to the draft type (the driver's existing root
    // grammar for parentless re-entries) — the event rides it verbatim.
    expect(String(child.lineageRoot)).toBe("flood");
    expect(Number(child.tick)).toBe(3);
    expect(run.results.reduce((n, r) => n + countKind(r.events, "retry"), 0)).toBe(0);
  });

  it("a null-parent child is NOT labelled by versus consumption — by design", () => {
    // (structural witness, no versus import: the only lineage field that
    // could point at a bounced parent is null, and a referral/return IS a
    // new customer. Versus disables this channel outright — referral/return
    // FIXED_ZERO — so no versus traffic ever rides it.)
    const child = run.results.flatMap((r) => reentriesOf(r.events))[0]!;
    expect(child.retryOf).toBeNull();
    expect(child.unitId).not.toBe(child.lineageRoot);
  });
});

describe("reentry events — lineageRoot and retryDepth ride the draft truth", () => {
  it("depth-1 children: retryDepth 1 and lineageRoot === retryOf (the bounced original)", () => {
    const run = makeRun({ maxRetries: 1, ticks: 16 });
    const all = run.results.flatMap((r) => reentriesOf(r.events));
    expect(all.length).toBeGreaterThan(3);
    for (const e of all) {
      expect(e.retryDepth).toBe(1);
      expect(e.retryOf).not.toBeNull();
      expect(String(e.lineageRoot)).toBe(String(e.retryOf));
    }
  });

  it("grandchildren: depth 2 points at a parent whose own reentry leg exists", () => {
    const run = makeRun({ maxRetries: 2, ticks: 20 });
    const all = run.results.flatMap((r) => reentriesOf(r.events));
    const byChild = new Map(all.map((e) => [String(e.unitId), e] as const));
    const depth2 = all.filter((e) => e.retryDepth === 2);
    expect(depth2.length).toBeGreaterThan(0); // the storm must reach generation 2
    for (const grand of depth2) {
      const parent = byChild.get(String(grand.retryOf));
      expect(parent, "parent minted its own reentry leg").toBeDefined();
      expect(parent!.retryDepth).toBe(1);
      expect(String(grand.lineageRoot)).toBe(String(parent!.lineageRoot)); // same root
    }
  });
});

describe("reentry events — the NO_RETRY zero-delta guard (byte-identity fence)", () => {
  const serialize = (results: readonly TickResult[]) =>
    encodeCanonicalJson(results.map((r) => r.events));

  it("a NO_RETRY, viral-free board emits ZERO reentry events", () => {
    const run = makeRun({ maxRetries: 0, ticks: 12 });
    const all = run.results.flatMap((r) => reentriesOf(r.events));
    expect(all).toHaveLength(0);
    // and the kind census holds NO new kind — arrivals/terminals only
    const kinds = new Set(run.results.flatMap((r) => r.events.map((e) => e.kind)));
    expect(kinds.has("reentry")).toBe(false);
    expect(kinds.has("arrival")).toBe(true);
  });

  it("two fresh NO_RETRY drivers serialize byte-identically (HEAD-behavior fence)", () => {
    const a = serialize(makeRun({ maxRetries: 0, ticks: 12 }).results);
    const b = serialize(makeRun({ maxRetries: 0, ticks: 12 }).results);
    expect(a).toBe(b);
    expect(a.length).toBeGreaterThan(100); // the stream is real
  });
});

describe("reentry events — F6 checkpoint twin (restore reproduces the mint stream)", () => {
  const SNAP = 8;
  const TOTAL = 16;

  function advanceRange(
    driver: TickDriver,
    from: number,
    to: number,
    seedState: ReturnType<typeof createInitialState>,
    prior: TickResult[] = [],
  ): TickResult[] {
    const results: TickResult[] = [];
    let state = prior.length > 0 ? (prior[prior.length - 1]!.state as ReturnType<typeof createInitialState>) : seedState;
    for (let t = from + 1; t <= to; t += 1) {
      const envelopes = t <= 6 ? [envelope("flood", fromInt(3))] : [];
      const result = driver.advance(
        state,
        tickInputs({ envelopes, dependencyEdges: [], retryPolicy: retryPolicy(2, 0n) }),
      );
      results.push(result);
      state = result.state;
    }
    return results;
  }

  it("continuous vs export/import-restored produce IDENTICAL reentry streams", () => {
    const cont = makeRun({ maxRetries: 2, ticks: 0 });
    const through = advanceRange(cont.driver, 0, TOTAL, cont.state0);
    const fullStream = collectReentries(through);
    expect(fullStream.length).toBeGreaterThan(0); // the storm is real

    const warm = makeRun({ maxRetries: 2, ticks: 0 });
    const pre = advanceRange(warm.driver, 0, SNAP, warm.state0);
    const checkpoint = warm.driver.exportPending();
    const mint = warm.driver.currentMintCounter();

    const cold = makeRun({ maxRetries: 2, ticks: 0 });
    cold.driver.importPending(checkpoint, mint);
    const post = advanceRange(cold.driver, SNAP, TOTAL, cold.state0);
    expect(collectReentries(post)).toEqual(fullStream.slice(collectReentries(pre).length));
    // mintCounter restored ⇒ the SAME child ids continue the sequence:
    const contIds = new Set(fullStream.map((t) => t[1]));
    for (const tuple of collectReentries(post)) expect(contIds.has(tuple[1])).toBe(true);
  });
});

describe("reentry events — ×100 determinism (event stream is a pure function of inputs)", () => {
  it("101 fresh runs serialize the full event stream byte-identically", () => {
    const digests = new Set<string>();
    for (let i = 0; i < 101; i += 1) {
      const run = makeRun({ maxRetries: 2, ticks: 12 });
      digests.add(
        encodeCanonicalJson(run.results.map((r) => r.events.map((e) => [e.kind, Number(e.tick), String(e.causeId)]))),
      );
    }
    expect(digests.size).toBe(1);
  });
});

/* Order helpers live outside the describe so the closure above stays small. */
function indexOf(events: readonly SimEvent[], pred: (e: SimEvent) => boolean, where: "first" | "last"): number {
  if (where === "first") return events.findIndex(pred);
  for (let i = events.length - 1; i >= 0; i -= 1) if (pred(events[i]!)) return i;
  return -1;
}
function lastIndexOf(events: readonly SimEvent[], pred: (e: SimEvent) => boolean): number {
  return indexOf(events, pred, "last");
}
