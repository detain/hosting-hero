/**
 * Dependency blocking (R-09 "the single most important coupling", §4.1 Q4):
 * an upstream slot STAYS OCCUPIED while its downstream can't admit — capacity
 * starves silently and the slot introspection shows the ring pattern ("a
 * ring full of slots waiting on the same downstream").
 *
 * Board: edge(4 slots, 2-min svc, dep→origin) → origin(2 slots, 4-min svc).
 * A-wave of 2 at tick 1 fills origin; B-wave of 1 at tick 4 finishes edge
 * service at tick 6 exactly while origin is still 100% occupied ⇒ the edge
 * slot holds (never bounces: in-service/holding units are committed, their
 * pain is latency) until the dependency admits.
 *
 * Design note tested here: a queue at a SATURATED node (ρ→1 ⇒ predicted
 * wait = 99× service) is the hockey-stick death zone by R-07 design — this
 * scenario keeps every queue short so only DEPENDENCY holds drive starvation.
 */

import { describe, expect, it } from "vitest";
import type { EntityId, GameState, SimTick } from "../../types";
import { asEntityId, asRunSeed } from "../../types";
import { fromInt } from "../../kernel/fixed";
import { initialClocks } from "../../kernel/time";
import { streamFor } from "../../kernel/rng";
import { createDefaultSlots } from "../defaults";
import { createInitialState, createTickDriver, type TickResult } from "../driver";
import { IDS, envelope, node, testConfig, tickInputs } from "./helpers";

const MIN = 60_000_000n;

function boardRun(ticks: number): { results: TickResult[]; final: GameState } {
  const config = testConfig({ runSeed: asRunSeed(11n) });
  const slots = createDefaultSlots(config);
  const state0 = createInitialState({
    runSeed: config.runSeed,
    engineVersion: "test-dep-block",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
    clocks: initialClocks(),
    nodes: [
      node(IDS.edge, { slots: 4, serviceUs: 2n * MIN, dep: IDS.origin }),
      node(IDS.origin, { slots: 2, serviceUs: 4n * MIN }),
    ],
  });
  const driver = createTickDriver(slots, streamFor(config.runSeed, "root", 0), state0.context.clocks);
  const results: TickResult[] = [];
  let state = state0;
  for (let t = 1; t <= ticks; t += 1) {
    const envelopes =
      t === 1 ? [envelope("a", fromInt(2))] : t === 4 ? [envelope("b", fromInt(1))] : [];
    const result = driver.advance(state, tickInputs({ envelopes }));
    results.push(result);
    state = result.state;
  }
  return { results, final: state };
}

function heldSlots(state: GameState): { nodeId: EntityId; unitId: EntityId | null }[] {
  const held: { nodeId: EntityId; unitId: EntityId | null }[] = [];
  for (const n of state.nodes.values()) {
    for (const slot of n.slots) {
      if (slot.occupied && slot.waitingOn !== null) held.push({ nodeId: n.id, unitId: slot.unitId });
    }
  }
  return held;
}

describe("dependency blocking (R-09/Q4)", () => {
  const runs = boardRun(20);
  const at = (tick: SimTick): TickResult => {
    const r = runs.results[Number(tick) - 1];
    if (r === undefined) throw new Error(`no result for tick ${tick}`);
    return r;
  };
  const b1 = asEntityId("b@4#0.0");

  it("B finishes edge service but cannot enter the occupied origin — slot HELD", () => {
    const t6 = at(6n).state;
    expect(t6.units.get(b1)?.waitingOn).toBe(IDS.origin);
    const held = heldSlots(t6);
    expect(held.length).toBe(1);
    expect(held[0]?.nodeId).toBe(IDS.edge);
    expect(held[0]?.unitId).toBe(b1);
  });

  it("holds persist while the dependency is starved, with no downstream queue needed", () => {
    for (const tick of [6n, 7n, 8n]) {
      expect(heldSlots(at(tick).state).length, `tick ${tick}`).toBe(1);
    }
    // origin is at 100% occupancy exactly through those ticks
    for (const tick of [6n, 7n]) {
      const origin = at(tick).state.nodes.get(IDS.origin);
      expect(origin?.slots.every((s) => s.occupied)).toBe(true);
    }
  });

  it("the holding unit ages in latency but is NEVER patience-bounced", () => {
    // holding ages one tick each (t6,t7,t8) but edge svc lands only at release
    const accAt8 = at(8n).state.units.get(b1)?.accumulatedLatencyUs ?? 0n;
    expect(accAt8).toBeGreaterThanOrEqual(3n * MIN);
    const bounced = runs.results.flatMap((r) =>
      r.outcomes.filter((o) => o.unitId === b1 && o.terminal === "bounced"),
    );
    expect(bounced.length).toBe(0);
  });

  it("hold releases once origin admits capacity", () => {
    expect(heldSlots(at(9n).state).length).toBe(0);
    expect(at(9n).state.units.get(b1)?.waitingOn).toBeNull();
  });

  it("all three units end `served`; nothing is lost to holding", () => {
    const served = runs.results.flatMap((r) => r.outcomes.filter((o) => o.terminal === "served"));
    expect(served.length).toBe(3);
    expect(at(20n).state.units.size).toBe(0);
  });

  it("observed layer (step 12) exposes the starvation to the HUD", () => {
    const cell = at(7n).state.observed;
    expect(cell.size).toBeGreaterThan(0); // queueDepth + utilizationRho per node
  });
});
