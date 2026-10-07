/**
 * FIX-8 pin — the queue-ghost bug (rec#6 lane, measured 99.1% ghost entries
 * on a congested bench).
 *
 * Mechanism (pre-fix): `defaultServeStep` excluded slot HOLDERS from the
 * per-tick join list but NOT units already riding a node's queue, so every
 * waiter re-appended a duplicate of itself each surviving tick. Consequences
 * pinned away by the tests below:
 *  - digest-visible queueDepth inflation (the observed cell counted ghosts),
 *  - capacity theft (a ghost copy got admitted while the real unit still
 *    held its slot elsewhere — one unit occupying two nodes' slots),
 *  - false newly-admitted inspection rolls (the ghost admission re-visited
 *    an already-inspected hop).
 *
 * The fix (defaults.ts join guard): a unit already queued anywhere must not
 * re-join. A waiter's position in the queue is preserved — the join list
 * only ever APPENDS, so FIFO discipline is untouched.
 */

import { describe, expect, it } from "vitest";
import { asEntityId, asRunSeed, observedKey } from "../../types";
import type { EntityId, GameState, NodeRecord } from "../../types";
import { FIXED_ZERO, fromInt, fromRatio } from "../../kernel/fixed";
import { initialClocks, MICROS_PER_MIN } from "../../kernel/time";
import { streamFor } from "../../kernel/rng";
import { createDefaultSlots, defaultServeStep } from "../defaults";
import { createInitialState, createTickDriver } from "../driver";
import type { DefaultPipelineConfig } from "../defaults";
import type { TickInputs } from "../driver";
import { utilization } from "../queue";
import { IDS, MIN, envelope, node, retryPolicy, testConfig, tickInputs } from "./helpers";

/** Patience so deep nothing can bounce — isolates the queue mechanics from
 *  the patience curve (the brief's "control bounce off"). */
const NEVER_BOUNCE_US: bigint = 1_000_000n * MIN;

interface Harness {
  state: () => GameState;
  step: (inputs?: Partial<TickInputs>) => GameState;
  frames: () => readonly GameState[];
}

function harness(board: readonly NodeRecord[], overrides: Partial<DefaultPipelineConfig> = {}): Harness {
  const config = testConfig({ defaultPatienceUs: NEVER_BOUNCE_US, ...overrides });
  const slots = createDefaultSlots(config);
  let state = createInitialState({
    runSeed: config.runSeed,
    engineVersion: "test-fix8",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
    clocks: initialClocks(),
    nodes: board,
  });
  const frames: GameState[] = [state];
  const driver = createTickDriver(slots, streamFor(config.runSeed, "root", 0), state.context.clocks);
  const step = (inputs: Partial<TickInputs> = {}): GameState => {
    state = driver.advance(
      state,
      tickInputs({ envelopes: [], dependencyEdges: [], retryPolicy: retryPolicy(0, 0n), ...inputs }),
    ).state;
    frames.push(state);
    return state;
  };
  return { state: () => state, step, frames: () => frames };
}

/** Duplicate unitIds inside any node queue of a frame (the ghost signature). */
function duplicateCount(state: GameState): number {
  let duplicates = 0;
  for (const n of state.nodes.values()) {
    duplicates += n.queue.length - new Set(n.queue).size;
  }
  return duplicates;
}

/** Total slot reservations a single unit holds across the whole board. */
function slotsHeldBy(state: GameState, unitId: ReturnType<typeof asEntityId>): number {
  let held = 0;
  for (const n of state.nodes.values()) {
    for (const slot of n.slots) if (slot.occupied && slot.unitId === unitId) held += 1;
  }
  return held;
}

const TWO_ARRIVALS = Object.freeze([envelope("g8", fromInt(2))]);

/** Single-hop board: every unit's only hop is the one node under test. */
const ONE_HOP = Object.freeze({
  expressPath: Object.freeze([IDS.edge]),
  deepPath: Object.freeze([IDS.edge]),
});

describe("queue-ghost guard (FIX-8): no waiter ever duplicates itself in a queue", () => {
  // 1-slot node, 2 arrivals, 30-minute service → one holder + one waiter
  // surviving ≥ 3 ticks at low ρ, bounce control off.
  const singleSlotHarness = harness([node(IDS.edge, { slots: 1, serviceUs: 30n * MIN })], ONE_HOP);

  for (let tick = 1; tick <= 5; tick += 1) {
    it(`tick ${tick}: the queue holds each waiter at most once`, () => {
      const state = singleSlotHarness.step({ envelopes: tick === 1 ? TWO_ARRIVALS : [] });
      expect(duplicateCount(state)).toBe(0);
    });
  }

  it("the waiter set is exactly the one non-admitted unit, every tick", () => {
    for (let tick = 6; tick <= 8; tick += 1) singleSlotHarness.step({ envelopes: [] });
    for (const frame of singleSlotHarness.frames().slice(1)) {
      const edge = frame.nodes.get(IDS.edge) as NodeRecord;
      expect(edge.queue.length).toBe(1); // held + 1 waiter, no ghost copies
    }
  });

  it("the observed queueDepth cell equals the honest waiter count", () => {
    // The economics step publishes node.queueDepth verbatim — after the fix
    // that number is distinct waiters, pre-fix it counted ghosts per tick.
    for (const frame of singleSlotHarness.frames().slice(1)) {
      const edge = frame.nodes.get(IDS.edge) as NodeRecord;
      const cell = frame.observed.get(observedKey(IDS.edge, "queueDepth"));
      expect(cell).toBeDefined();
      expect(cell?.value).toBe(edge.queue.length);
      expect(edge.queueDepth).toBe(new Set(edge.queue).size);
    }
  });

  it("a waiter keeps its FIFO position — the guard never re-sorts or re-appends", () => {
    const h = harness([node(IDS.edge, { slots: 1, serviceUs: 30n * MIN })], ONE_HOP);
    // arrival order a then b: a takes the slot, b waits at the head.
    const first = h.step({ envelopes: TWO_ARRIVALS });
    const queued = (first.nodes.get(IDS.edge) as NodeRecord).queue;
    expect(queued).toEqual([asEntityId("g8@1#0.1")]);
    for (let tick = 2; tick <= 6; tick += 1) {
      const state = h.step({ envelopes: [] });
      expect((state.nodes.get(IDS.edge) as NodeRecord).queue).toEqual(queued);
    }
  });
});

describe("queue-ghost guard (FIX-8): ghosts cannot steal capacity across hops", () => {
  // 2-slot edge (service 2 min) → 1-slot origin (service 60 min), 4 arrivals.
  // Pre-fix trace: t1 admits A,B while C,D queue; t2–t3 C,D re-join as ghosts;
  // t3 the edge slots free and C,D move on, leaving their edge-queue ghosts
  // behind — the ghosts are then RE-ADMITTED at the edge, so C and D occupy
  // an edge slot AND an origin slot at once, plus a false newly-admitted
  // inspection roll at a hop they already served.
  it("one unit never holds slots on two nodes at the same time", () => {
    const h = harness(
      [node(IDS.edge, { slots: 2, serviceUs: 2n * MIN }), node(IDS.origin, { slots: 1, serviceUs: 60n * MIN })],
      {
        expressPath: Object.freeze([IDS.edge, IDS.origin]),
        deepPath: Object.freeze([IDS.edge, IDS.origin]),
      },
    );
    for (let tick = 1; tick <= 6; tick += 1) {
      const state = h.step({ envelopes: tick === 1 ? Object.freeze([envelope("g8", fromInt(4))]) : [] });
      expect(duplicateCount(state)).toBe(0);
      for (const unitId of state.units.keys()) {
        // sizeCost is exactly 1 ⇒ legal reservation ceiling is one slot total.
        expect(slotsHeldBy(state, unitId)).toBeLessThanOrEqual(1);
      }
    }
  });

  it("the queue carries no unit that is not waiting for its current hop", () => {
    const h = harness(
      [node(IDS.edge, { slots: 2, serviceUs: 2n * MIN }), node(IDS.origin, { slots: 1, serviceUs: 60n * MIN })],
      {
        expressPath: Object.freeze([IDS.edge, IDS.origin]),
        deepPath: Object.freeze([IDS.edge, IDS.origin]),
      },
    );
    for (let tick = 1; tick <= 6; tick += 1) {
      const state = h.step({ envelopes: tick === 1 ? Object.freeze([envelope("g8", fromInt(4))]) : [] });
      for (const n of state.nodes.values()) {
        for (const unitId of n.queue) {
          const unit = state.units.get(unitId);
          // a purged terminal would be a leak; a queued unit must be queued
          // AT the hop it is currently trying to serve.
          expect(unit, `queued unit ${unitId} still in roster at tick ${tick}`).toBeDefined();
          expect(unit?.routeHops[0]).toBe(n.id);
        }
      }
    }
  });
});

describe("queue-ghost guard (FIX-8): benign quiet board is untouched", () => {
  it("an empty board ticks with zero joins and zero queues", () => {
    const h = harness([node(IDS.edge, { slots: 1, serviceUs: MIN })]);
    for (let tick = 1; tick <= 3; tick += 1) {
      const state = h.step({ envelopes: [] });
      expect(state.units.size).toBe(0);
      expect((state.nodes.get(IDS.edge) as NodeRecord).queue.length).toBe(0);
    }
  });

  it("a free-flowing board never queues, so the guard never fires", () => {
    const h = harness([node(IDS.edge, { slots: 8, serviceUs: MIN })], ONE_HOP);
    for (let tick = 1; tick <= 3; tick += 1) {
      const state = h.step({ envelopes: Object.freeze([envelope("g8", fromInt(2))]) });
      expect((state.nodes.get(IDS.edge) as NodeRecord).queue.length).toBe(0);
    }
  });
});

describe("legit re-join on a loop route (edge→origin→edge): the guard kills ghosts, not revisits", () => {
  // R7-F3: the FIX-8 set is MEMBERSHIP-only — a unit that left a node's
  // queue is a fresh joiner when its route brings it back. A "sticky"
  // dedup (remembering every unit the node ever saw) would suppress the
  // return trip entirely: the unit would idle outside every queue, never
  // re-admit, and silently leak.
  const A = asEntityId("g8@1#0.0");
  const B = asEntityId("g8@2#0.0");
  const C = asEntityId("g8@3#0.0");
  const ONE_PER_MIN = Object.freeze([envelope("g8", fromInt(1))]);
  const LOOP = Object.freeze({
    expressPath: Object.freeze([IDS.edge, IDS.origin, IDS.edge]),
    deepPath: Object.freeze([IDS.edge, IDS.origin, IDS.edge]),
  });

  it("a unit that completed edge, served origin, and returns joins the edge queue again — behind the sitting waiter", () => {
    // 1-slot edge (9-minute service) + 1-slot origin (1 minute): A holds
    // edge t1–t9, B and C queue; A advances t10–t12, and must RE-QUEUE at
    // edge on t13 — appended behind C, who has been waiting since t3.
    const h = harness(
      [node(IDS.edge, { slots: 1, serviceUs: 9n * MIN }), node(IDS.origin, { slots: 1, serviceUs: 1n * MIN })],
      LOOP,
    );
    const edgeQueue = (state: GameState): readonly EntityId[] =>
      (state.nodes.get(IDS.edge) as NodeRecord).queue;

    for (let tick = 1; tick <= 3; tick += 1) {
      const state = h.step({ envelopes: ONE_PER_MIN });
      expect(duplicateCount(state)).toBe(0);
    }
    expect(edgeQueue(h.state())).toEqual([B, C]);

    // A's long service keeps the waiters in place while A advances toward
    // its final edge hop (release t10, origin t11, released t12).
    for (let tick = 4; tick <= 12; tick += 1) {
      const state = h.step({ envelopes: [] });
      expect(duplicateCount(state)).toBe(0);
    }
    // Away from every queue (B was admitted when A left edge), C still
    // waiting — A is absent, not a ghost, not a member:
    expect(edgeQueue(h.state())).toEqual([C]);

    // The return tick: A joins edge's queue AGAIN (not suppressed), and the
    // append lands AFTER the sitting waiter — FIFO order by join time.
    const rejoin = h.step({ envelopes: [] });
    expect(edgeQueue(rejoin)).toEqual([C, A]);
    expect(duplicateCount(rejoin)).toBe(0);
    let boardWide = 0;
    for (const n of rejoin.nodes.values()) {
      for (const id of n.queue) if (id === A) boardWide += 1;
    }
    expect(boardWide).toBe(1); // exactly one copy: a sticky dedup gives 0, a ghost 2+
    // every queued unit waits AT its current hop — even the second-visit one
    for (const n of rejoin.nodes.values()) {
      for (const unitId of n.queue) {
        expect(rejoin.units.get(unitId)?.routeHops[0], `queued ${unitId}`).toBe(n.id);
      }
    }

    // The waiter rides on honestly — no per-tick self-append for the
    // returning unit either (the original ghost signature).
    for (let tick = 14; tick <= 15; tick += 1) {
      const state = h.step({ envelopes: [] });
      expect(edgeQueue(state)).toEqual([C, A]);
      expect(duplicateCount(state)).toBe(0);
    }
  });
});

describe("rec#2 copy-on-write reuse — both branches, direct serve step", () => {
  it("foreign stale stamps are repaired; an honest untouched node returns identity-equal", () => {
    const honest = node(IDS.origin, { slots: 2 });
    const base = node(IDS.edge, { slots: 2 });
    const seed = createInitialState({
      runSeed: asRunSeed(7n),
      engineVersion: "test-fix8-cow",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
      clocks: initialClocks(),
      nodes: [honest, base],
    });
    // Same node, otherwise untouched: honest arrays, LYING derived stamps.
    // The ghost holder's deadline sits a far future minute out, so the
    // release walk touches nothing and the tick takes the unchanged-node
    // reuse branch — where the stamp re-verify (not trust) must fire.
    const stale = Object.freeze({
      ...base,
      slots: Object.freeze([
        Object.freeze({
          occupied: true,
          unitId: asEntityId("far-future-holder"),
          waitingOn: null,
          releasedAtUs: 1_000_000n * MIN,
        }),
        Object.freeze({ occupied: false, unitId: null, waitingOn: null, releasedAtUs: null }),
      ]),
      utilizationRho: FIXED_ZERO, // lie: one of two slots is occupied
      queueDepth: 7, // lie: the queue is empty
    });
    const out = defaultServeStep({
      context: seed.context,
      units: [],
      nodes: new Map([
        [stale.id, stale],
        [honest.id, honest],
      ]),
    });
    // Repaired branch: a fresh record whose stamps match the arrays again…
    const repaired = out.nodes.get(stale.id) as NodeRecord;
    expect(repaired).not.toBe(stale);
    expect(repaired.utilizationRho).toBe(utilization(stale)); // 1/2, not the 0n lie
    expect(repaired.utilizationRho).not.toBe(FIXED_ZERO);
    expect(repaired.queueDepth).toBe(stale.queue.length); // 7 → 0
    // …while the untouched frozen arrays ride along — the only saving is
    // allocation identity for the CONTENT, exactly as rec#2 promises.
    expect(repaired.slots).toBe(stale.slots);
    expect(repaired.queue).toBe(stale.queue);
    // Reuse branch: the honest node comes back as the SAME frozen object.
    expect(out.nodes.get(honest.id)).toBe(honest);
    // Quiet tick: the far-future holder released nothing.
    expect(out.assignments).toEqual([]);
    expect(out.waiting).toEqual([]);
    expect(out.shed).toEqual([]);
  });
});
