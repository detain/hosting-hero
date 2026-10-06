/**
 * FIX-2 pin: a multi-slot unit (R-32 "size ≠ 1") completes with ONE slot
 * assignment per held slot, all sharing `releasedAtUs`. The driver must
 * advance hop progress once per (unitId, nodeId, tick) — otherwise a route
 * that visits the same node twice (routeHops [edge, edge]) double-pops the
 * route and double-charges the service latency in a single tick.
 */

import { describe, expect, it } from "vitest";
import { asEntityId, asRunSeed } from "../../types";
import { fromInt } from "../../kernel/fixed";
import { initialClocks } from "../../kernel/time";
import { streamFor } from "../../kernel/rng";
import { createDefaultSlots } from "../defaults";
import { createInitialState, createTickDriver } from "../driver";
import { IDS, MIN, envelope, node, retryPolicy, testConfig, tickInputs } from "./helpers";

const UNIT_ID = asEntityId("base@1#0.0");

function runFix2Scenario(ticks: number) {
  const config = testConfig({
    runSeed: asRunSeed(7n),
    expressPath: Object.freeze([IDS.edge, IDS.edge]), // visit edge TWICE
    deepPath: Object.freeze([IDS.edge, IDS.edge]),
    defaultSizeCost: fromInt(2), // holds 2 slots ⇒ 2 completion assignments
    defaultPatienceUs: 100n * MIN,
  });
  const slots = createDefaultSlots(config);
  let state = createInitialState({
    runSeed: config.runSeed,
    engineVersion: "test-fix2",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
    clocks: initialClocks(),
    nodes: [node(IDS.edge, { slots: 4, serviceUs: MIN })],
  });
  const driver = createTickDriver(slots, streamFor(config.runSeed, "root", 0), state.context.clocks);
  const states = [state];
  const outcomes = [];
  for (let t = 1; t <= ticks; t += 1) {
    const result = driver.advance(
      state,
      tickInputs({
        envelopes: t === 1 ? [envelope("base", fromInt(1))] : [],
        dependencyEdges: [],
        retryPolicy: retryPolicy(0, 0n),
      }),
    );
    state = result.state;
    outcomes.push(...result.outcomes);
    states.push(state);
  }
  return { states, outcomes };
}

describe("multi-slot completion dedupe (FIX-2)", () => {
  it("tick-2 completion pops exactly one hop and charges edge's service time exactly once", () => {
    const { states } = runFix2Scenario(4);
    const afterAdmission = states[1]!.units.get(UNIT_ID);
    expect(afterAdmission?.routeHops.length).toBe(2); // [edge, edge] in service
    expect(afterAdmission?.accumulatedLatencyUs).toBe(0n);

    const afterFirstVisit = states[2]!.units.get(UNIT_ID);
    expect(afterFirstVisit).toBeDefined(); // NOT prematurely terminal
    expect(afterFirstVisit?.routeHops.length).toBe(1); // one pop, not two
    expect(afterFirstVisit?.accumulatedLatencyUs).toBe(MIN); // one charge, not 2×MIN
  });

  it("the second edge visit completes normally: served with exactly 2×MIN of service latency", () => {
    const { states, outcomes } = runFix2Scenario(4);
    // Third tick: re-admitted on its second hop.
    const reAdmitted = states[3]!.units.get(UNIT_ID);
    expect(reAdmitted?.routeHops.length).toBe(1);
    expect(reAdmitted?.accumulatedLatencyUs).toBe(MIN);

    // Fourth tick: the second visit completes ⇒ served terminal.
    const served = outcomes.filter((o) => o.unitId === UNIT_ID && o.terminal === "served");
    expect(served.length).toBe(1);
    expect(states[4]!.units.has(UNIT_ID)).toBe(false);
  });
});
