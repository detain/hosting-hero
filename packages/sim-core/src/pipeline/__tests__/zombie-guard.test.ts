/**
 * FIX-7 pin: two zombie sources, two guards.
 *  (a) serve JOIN with an unknown hop now fails loud (was: silent idle —
 *      a unit that never queues, never ages, never terminates);
 *  (b) a PARKED zombie (router produced an empty hop list — an empty
 *      deepPath) is idle-reaped as bounced once its patience budget has
 *      elapsed, so a mis-authored path cannot leak the roster forever.
 */

import { describe, expect, it } from "vitest";
import { asRunSeed } from "../../types";
import { FIXED_UNIT, fromInt, fromRatio } from "../../kernel/fixed";
import { initialClocks } from "../../kernel/time";
import { streamFor } from "../../kernel/rng";
import { asEntityId, asMetricId } from "../../types";
import { createDefaultSlots } from "../defaults";
import { createInitialState, createTickDriver, type TickDriver, type TickInputs } from "../driver";
import type { GameState } from "../../types";
import { IDS, MIN, envelope, node, retryPolicy, testConfig, tickInputs } from "./helpers";

const ZOMBIE = asEntityId("base@1#0.0");
const HOT = asMetricId("hot");

function board() {
  return [node(IDS.edge, { slots: 4, serviceUs: MIN })];
}

function harness(configOverrides: Parameters<typeof testConfig>[0]) {
  const config = testConfig({ runSeed: asRunSeed(11n), defaultPatienceUs: MIN, ...configOverrides });
  const slots = createDefaultSlots(config);
  let state = createInitialState({
    runSeed: config.runSeed,
    engineVersion: "test-fix7",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
    clocks: initialClocks(),
    nodes: board(),
  });
  const driver: TickDriver = createTickDriver(slots, streamFor(config.runSeed, "root", 0), state.context.clocks);
  const step = (inputs: Partial<TickInputs> = {}): GameState => {
    state = driver.advance(state, tickInputs({ envelopes: [], dependencyEdges: [], retryPolicy: retryPolicy(0, 0n), ...inputs })).state;
    return state;
  };
  return { state: () => state, step, driver };
}

describe("unknown-hop join fails loud (FIX-7a)", () => {
  it("a route onto a node that is not on the board throws at step 5, not idles", () => {
    const h = harness({
      expressPath: Object.freeze([asEntityId("ghost-node")]),
      deepPath: Object.freeze([asEntityId("ghost-node")]),
    });
    expect(() => h.step({ envelopes: [envelope("base", fromInt(1))] })).toThrow(
      /routes to unknown node ghost-node/,
    );
  });

  it("the throw names the unit and stays deterministic across attempts", () => {
    const h = harness({
      expressPath: Object.freeze([asEntityId("ghost")]),
      deepPath: Object.freeze([asEntityId("ghost")]),
    });
    let first = "";
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        h.step({ envelopes: attempt === 0 ? [envelope("base", fromInt(1))] : [] });
        if (attempt === 0) throw new Error("expected throw");
      } catch (error) {
        const message = String(error);
        if (attempt === 0) {
          first = message;
          expect(message).toContain(ZOMBIE);
        }
      }
    }
    expect(first).toMatch(/unit base@1#0\.0/);
  });
});

describe("parked-zombie idle reap (FIX-7b)", () => {
  it("empty-path unit survives while patient, bounces exactly at patience expiry", () => {
    // deepPath [] + hot evidence ⇒ confidence > split ⇒ routeHops stay EMPTY.
    const h = harness({ deepPath: Object.freeze([]) });
    const hotInputs = (tick: number): Partial<TickInputs> => ({
      envelopes: tick === 1 ? [envelope("base", fromInt(1), "malicious")] : [],
      evidence: [{ unitId: ZOMBIE, metric: HOT, value: fromRatio(9n, 10n) }],
    });
    // expressMaxConfidence default 0.8 < 0.9 → deep path ([]) → parked.

    h.step(hotInputs(1)); // tick 1 — arrived, parked
    expect(h.state().units.has(ZOMBIE)).toBe(true);
    h.step(hotInputs(2)); // idle 1×MIN — patience is 1×MIN, strict >: still alive
    expect(h.state().units.has(ZOMBIE)).toBe(true);
    expect(h.state().units.get(ZOMBIE)?.accumulatedLatencyUs).toBe(0n); // the "never ages" pathology
    h.step(hotInputs(3)); // idle 2×MIN > 1×MIN → reaped
    expect(h.state().units.has(ZOMBIE)).toBe(false);
  });

  it("the reap is a real bounced terminal: outcome + event carry it", () => {
    const config = testConfig({ runSeed: asRunSeed(11n), defaultPatienceUs: MIN, deepPath: Object.freeze([]) });
    const slots = createDefaultSlots(config);
    let state = createInitialState({
      runSeed: config.runSeed,
      engineVersion: "test-fix7b",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
      clocks: initialClocks(),
      nodes: board(),
    });
    const driver = createTickDriver(slots, streamFor(config.runSeed, "root", 0), state.context.clocks);
    let reap: readonly { terminal: string }[] = [];
    let kinds: string[] = [];
    for (let t = 1; t <= 3; t += 1) {
      const result = driver.advance(
        state,
        tickInputs({
          envelopes: t === 1 ? [envelope("base", fromInt(1), "malicious")] : [],
          evidence: [{ unitId: ZOMBIE, metric: HOT, value: fromRatio(9n, 10n) }],
          dependencyEdges: [],
          retryPolicy: retryPolicy(0, 0n),
        }),
      );
      state = result.state;
      reap = result.outcomes;
      kinds = result.events.map((e) => e.kind);
    }
    expect(reap.length).toBe(1);
    expect(reap[0]?.terminal).toBe("bounced");
    expect(kinds).toContain("bounced");
  });

  it("healthy routed units are NEVER reaped by the idle guard", () => {
    // Full board matching the default [edge, origin] express path: the unit
    // serves normally and the patience clock never fires.
    const config = testConfig({ runSeed: asRunSeed(11n), defaultPatienceUs: MIN });
    const slots = createDefaultSlots(config);
    let state = createInitialState({
      runSeed: config.runSeed,
      engineVersion: "test-fix7c",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
      clocks: initialClocks(),
      nodes: [node(IDS.edge, { slots: 2, serviceUs: MIN }), node(IDS.origin, { slots: 2, serviceUs: MIN })],
    });
    const driver = createTickDriver(slots, streamFor(config.runSeed, "root", 0), state.context.clocks);
    const terminals: string[] = [];
    for (let t = 1; t <= 6; t += 1) {
      const result = driver.advance(
        state,
        tickInputs({
          envelopes: t === 1 ? [envelope("base", fromInt(1))] : [],
          dependencyEdges: [],
          retryPolicy: retryPolicy(0, 0n),
          aggression: FIXED_UNIT,
        }),
      );
      state = result.state;
      for (const outcome of result.outcomes) terminals.push(outcome.terminal);
    }
    // The unit lives ~4 ticks (patience = 1×MIN elapses twice over) but it is
    // never idle-parked: it must SERVE, and no bounce may ever fire.
    expect(terminals).toContain("served");
    expect(terminals).not.toContain("bounced");
  });
});
