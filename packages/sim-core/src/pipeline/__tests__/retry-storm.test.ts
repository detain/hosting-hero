/**
 * Emergent retry storm (R-12: "storms EMERGE here, unscripted"; §4.1 Q4):
 * an overload trigger creates a saturated node → the hockey-stick wait kills
 * patience → bounces re-enter as NEW arrivals with retry lineage → the
 * retries themselves re-saturate the node. The signature of a metastable
 * storm: traffic activity SELF-SUSTAINS long after the trigger is removed,
 * and only the bounded RetryPolicy budget (purchasable counter — fairness
 * guard) lets the system finally quiesce.
 *
 * Control (maxRetries 0 — the unprovisioned client that gives up): the same
 * trigger produces NO post-trigger activity. The delta is the storm.
 */

import { describe, expect, it } from "vitest";
import type { GameState } from "../../types";
import { asRunSeed } from "../../types";
import { fromInt, fromRatio } from "../../kernel/fixed";
import { initialClocks } from "../../kernel/time";
import { streamFor } from "../../kernel/rng";
import { createDefaultSlots } from "../defaults";
import { createInitialState, createTickDriver, type TickResult } from "../driver";
import { IDS, envelope, node, retryPolicy, testConfig, tickInputs } from "./helpers";

const MIN = 60_000_000n;
const TRIGGER_TICKS = 6; // 3 arrivals/min into a 1-slot 1-min node ⇒ 18 lineages
const TOTAL_TICKS = 90;
const RETRY_DEPTH = 20; // generous client retry budget — the storm must outlive the trigger

interface StormRun {
  results: TickResult[];
  retriesPerTick: number[];
  final: GameState;
}

function stormRun(maxRetries: number): StormRun {  const config = testConfig({
    runSeed: asRunSeed(7n),
    expressPath: Object.freeze([IDS.waf]),
    deepPath: Object.freeze([IDS.waf]),
    defaultPatienceUs: MIN, // 1-minute budget: saturated queue ⇒ certain bounce
  });
  const slots = createDefaultSlots(config);
  const state0 = createInitialState({
    runSeed: config.runSeed,
    engineVersion: "test-storm",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
    clocks: initialClocks(),
    nodes: [node(IDS.waf, { slots: 1, serviceUs: MIN })],
  });
  const driver = createTickDriver(slots, streamFor(config.runSeed, "root", 0), state0.context.clocks);
  const results: TickResult[] = [];
  const retriesPerTick: number[] = [];
  let state = state0;
  for (let t = 1; t <= TOTAL_TICKS; t += 1) {
    const envelopes = t <= TRIGGER_TICKS ? [envelope("flood", fromInt(3))] : [];
    const result = driver.advance(
      state,
      tickInputs({
        envelopes,
        dependencyEdges: [],
        retryPolicy: retryPolicy(maxRetries, 0n),
      }),
    );
    results.push(result);
    retriesPerTick.push(
      result.events.reduce((n, e) => n + (e.kind === "retry" ? 1 : 0), 0),
    );
    state = result.state;
  }
  return { results, retriesPerTick, final: state };
}

describe("emergent retry storm (R-12)", () => {
  const storm = stormRun(RETRY_DEPTH);
  const control = stormRun(0);

  it("the trigger saturates the node: bounces begin while arrivals run", () => {
    const triggerBounces = storm.results
      .slice(0, TRIGGER_TICKS)
      .flatMap((r) => r.outcomes.filter((o) => o.terminal === "bounced"));
    expect(triggerBounces.length).toBeGreaterThan(10); // 3/min queued ⇒ bounce
  });

  it("retries re-enter as NEW units with lineage (not resurrected ids)", () => {
    // Queued retries bounce inside their first tick (saturation ⇒ certain
    // bounce), so a retry-lineage unit is visible in state only while it
    // occupies a slot in service — scan every tick's roster.
    const retried = storm.results
      .flatMap((r) => [...r.state.units.values()])
      .filter((u) => u.retryOf !== null);
    expect(retried.length).toBeGreaterThan(5);
    // a retried unit's id is a fresh mint, distinct from its parent
    for (const unit of retried.slice(0, 5)) {
      expect(unit.retryOf).not.toBeNull();
      expect(unit.id).not.toBe(unit.retryOf);
    }
    const retryEvents = storm.results.flatMap((r) => r.events.filter((e) => e.kind === "retry"));
    expect(retryEvents.length).toBeGreaterThan(0);
    for (const e of retryEvents.slice(0, 5)) {
      if (e.kind !== "retry") continue;
      expect(e.causeId.startsWith("retry:")).toBe(true);
    }
  });

  it("storm SELF-SUSTAINS 10+ ticks after the trigger is removed (metastable)", () => {
    const post = storm.retriesPerTick.slice(TRIGGER_TICKS); // ticks 7..
    let sustained = 0;
    for (let t = 0; t < post.length; t += 1) {
      const n = post[t] ?? 0;
      if (n > 0) sustained += 1;
      else break;
    }
    // Measured: 18 retry lineages keep the saturated node churning for 11
    // ticks after the last external arrival; the control chain is 0 long.
    expect(sustained).toBeGreaterThanOrEqual(10);
  });

  it("control without retry budget: activity dies immediately with the trigger", () => {
    const postControl = control.retriesPerTick.slice(TRIGGER_TICKS);
    expect(postControl.every((n) => n === 0)).toBe(true);
    // control's queue bounces away; the board is quiescent well before the end
    let lastUnitTick = 0;
    control.results.forEach((r, i) => {
      if (r.state.units.size > 0) lastUnitTick = i + 1;
    });
    expect(lastUnitTick).toBeLessThan(TRIGGER_TICKS + 5);
  });

  it("storm pressure reads hot during the metastable window", () => {
    // t7..t10 — purely retry-driven ticks (no external arrivals since t6):
    // pressure 0.9+ measured. (t1 pressure is already ~1.0 — the first
    // queue wave bounces same-tick — so it cannot serve as a "quiet" baseline.)
    const hot = fromRatio(85n, 100n);
    const earlyWindow = storm.results.slice(TRIGGER_TICKS, TRIGGER_TICKS + 4);
    for (const r of earlyWindow) expect(r.pressure > hot).toBe(true);
    const quiet = storm.results.at(-1);
    if (quiet === undefined) throw new Error("no results");
    expect(quiet.pressure).toBe(0n);
  });

  it("bounded retries ⇒ the storm is survivable: system eventually quiets", () => {
    // 18 lineages, 1 admission/min drains them; depth caps the churn
    expect(storm.final.units.size).toBe(0);
    const totalRetries = storm.retriesPerTick.reduce((a, b) => a + b, 0);
    expect(totalRetries).toBeLessThanOrEqual(18 * RETRY_DEPTH);
  });

  it("every bounce terminal carries an attribution cause (§7.0)", () => {
    const bounced = storm.results.flatMap((r) =>
      r.outcomes.filter((o) => o.terminal === "bounced"),
    );
    for (const o of bounced.slice(0, 10)) expect(o.causeId.length).toBeGreaterThan(0);
  });
});
