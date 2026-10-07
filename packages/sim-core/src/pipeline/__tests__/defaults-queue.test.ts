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
import type { GameState, NodeRecord } from "../../types";
import { FIXED_ZERO, fromInt, fromRatio } from "../../kernel/fixed";
import { initialClocks, MICROS_PER_MIN } from "../../kernel/time";
import { streamFor } from "../../kernel/rng";
import { createDefaultSlots } from "../defaults";
import { createInitialState, createTickDriver } from "../driver";
import type { DefaultPipelineConfig } from "../defaults";
import type { TickInputs } from "../driver";
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
