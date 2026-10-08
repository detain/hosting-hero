/**
 * The determinism hard gate (§8 RISK-1, CONVENTIONS §3): the same seed +
 * the same ordered inputs MUST produce byte-identical state digests, ×100,
 * across the whole 13-slot order — the CI tripwire for every later
 * float/wall-clock/iteration-order poison class.
 *
 * Also pins: the canonical TICK_STEP_ORDER is the driver's actual call
 * order, and rule-phase intents are renumbered by the driver's seq counter
 * (append-only input-log law, §3.3).
 */

import { describe, expect, it } from "vitest";
import type {
  GameState,
  PipelineSlots,
  RulePhaseIn,
  RulePhaseOut,
  SimEvent,
} from "../../types";
import { asEntityId, asMetricId, asRunSeed, TICK_STEP_ORDER } from "../../types";
import { fromInt, fromRatio } from "../../kernel/fixed";
import { initialClocks } from "../../kernel/time";
import { streamFor } from "../../kernel/rng";
import { createDefaultSlots } from "../defaults";
import { createInitialState, createTickDriver } from "../driver";
import { digestState } from "../digest";
import { DEFAULT_CLASSES, IDS, envelope, node, retryPolicy, testConfig, tickInputs } from "./helpers";

const MIN = 60_000_000n;
const REPLAYS = 100;
const TICKS = 40;

/** A synthetic classifier's metric id (evidence catalog producer stand-in). */
const METRIC = asMetricId("source-reputation");
const C_MID = fromRatio(5n, 10n); // 0.5 → express lane, bronze class
const C_HOT = fromRatio(9n, 10n); // 0.9 → deep lane, gold class

/**
 * The scenario exercises: DNS pre-board hop, dual envelopes (organic +
 * malicious), confidence-driven express/deep split, QoS ladder, challenge
 * inspection with seeded block rolls, sample-1-in-20, dependency holds
 * edge→origin, hockey-stick saturation bounces, retry backoff re-entries,
 * referral/return drafts, bounce-LUT draws, observed writes, waf→edge→origin
 * multi-hop service.
 */
function runScenario(seed: bigint): { digests: readonly string[]; final: GameState; events: readonly SimEvent[] } {
  const config = testConfig({
    runSeed: asRunSeed(seed),
    dnsNodeId: IDS.dns, // pre-board first hop is LIVE in this run
    defaultPatienceUs: 5n * MIN,
    patienceJitterPct: 20,
    referralProbability: fromRatio(3n, 10n),
    returnProbability: fromRatio(2n, 100n),
  });
  const slots = createDefaultSlots(config);
  let state = createInitialState({
    runSeed: config.runSeed,
    engineVersion: "test-determinism",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
    clocks: initialClocks(),
    nodes: [
      node(IDS.dns, { slots: 4, serviceUs: 0n, kind: "dns" }),
      node(IDS.edge, { slots: 2, serviceUs: 2n * MIN, dep: IDS.origin, depth: "sample-1-in-20" }),
      node(IDS.origin, { slots: 1, serviceUs: 1n * MIN }),
      node(IDS.waf, { slots: 1, serviceUs: 1n * MIN, depth: "challenge" }),
    ],
  });
  const driver = createTickDriver(slots, streamFor(config.runSeed, "root", 0), state.context.clocks);
  const digests: string[] = [];
  const events: SimEvent[] = [];
  for (let t = 1; t <= TICKS; t += 1) {
    // Arrival ids are a deterministic mint scheme (`table@tick#env.unit`),
    // so the evidence catalog can name this tick's arrivals up front.
    const result = driver.advance(
      state,
      tickInputs({
        envelopes: [envelope("base", fromInt(3), "organic"), envelope("spike", fromInt(2), "malicious")],
        evidence: [
          ...[0, 1, 2].map((i) => ({
            unitId: asEntityId(`base@${t}#0.${i}`),
            metric: METRIC,
            value: C_MID,
          })),
          ...[0, 1].map((i) => ({
            unitId: asEntityId(`spike@${t}#1.${i}`),
            metric: METRIC,
            value: C_HOT,
          })),
        ],
        dependencyEdges: [
          { upstreamNodeId: IDS.edge, downstreamNodeId: IDS.origin, correlation: "software" },
        ],
        retryPolicy: retryPolicy(4, 2n * MIN),
      }),
    );
    state = result.state;
    digests.push(digestState(state));
    events.push(...result.events);
  }
  return { digests, final: state, events };
}

describe("tick determinism (×100 hard gate)", () => {
  const first = runScenario(42n);

  it(`${REPLAYS} replays of seed 42 produce byte-identical per-tick digest chains`, () => {
    const chain = first.digests.join("|");
    for (let run = 0; run < REPLAYS; run += 1) {
      expect(runScenario(42n).digests.join("|")).toBe(chain);
    }
  }, 120_000);

  it("a different seed diverges", () => {
    expect(runScenario(43n).digests.join("|")).not.toBe(first.digests.join("|"));
  });

  it("each tick's digest differs from the last (state actually moves)", () => {
    for (let i = 1; i < first.digests.length; i += 1) {
      expect(first.digests[i]).not.toBe(first.digests[i - 1]);
    }
  });

  it("the run was not trivial: served, bounced AND retried all happened", () => {
    const kinds = new Set(first.events.map((e) => e.kind));
    expect(kinds.has("served")).toBe(true);
    expect(kinds.has("bounced")).toBe(true);
    expect(kinds.has("retry")).toBe(true);
  });

  it("pending re-entry schedule + mint counter replay identically", () => {
    // fresh drivers over the same run: exportPending is pure run history
    const collectPending = (seed: bigint) => {
      const config = testConfig({
        runSeed: asRunSeed(seed),
        dnsNodeId: IDS.dns,
        defaultPatienceUs: 5n * MIN,
        patienceJitterPct: 20,
        referralProbability: fromRatio(3n, 10n),
        returnProbability: fromRatio(2n, 100n),
      });
      const slots = createDefaultSlots(config);
      let state = createInitialState({
        runSeed: config.runSeed,
        engineVersion: "test-determinism",
        contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
        clocks: initialClocks(),
        nodes: [
          node(IDS.dns, { slots: 4, serviceUs: 0n, kind: "dns" }),
          node(IDS.edge, { slots: 2, serviceUs: 2n * MIN, dep: IDS.origin, depth: "sample-1-in-20" }),
          node(IDS.origin, { slots: 1, serviceUs: 1n * MIN }),
          node(IDS.waf, { slots: 1, serviceUs: 1n * MIN, depth: "challenge" }),
        ],
      });
      const driver = createTickDriver(slots, streamFor(config.runSeed, "root", 0), state.context.clocks);
      for (let t = 1; t <= TICKS; t += 1) {
        state = driver.advance(
          state,
          tickInputs({
            envelopes: [envelope("base", fromInt(3), "organic"), envelope("spike", fromInt(2), "malicious")],
            evidence: [
              ...[0, 1, 2].map((i) => ({ unitId: asEntityId(`base@${t}#0.${i}`), metric: METRIC, value: C_MID })),
              ...[0, 1].map((i) => ({ unitId: asEntityId(`spike@${t}#1.${i}`), metric: METRIC, value: C_HOT })),
            ],
            dependencyEdges: [{ upstreamNodeId: IDS.edge, downstreamNodeId: IDS.origin, correlation: "software" }],
            retryPolicy: retryPolicy(4, 2n * MIN),
          }),
        ).state;
      }
      return { pending: driver.exportPending(), mint: driver.currentMintCounter() };
    };
    const a = collectPending(42n);
    const b = collectPending(42n);
    expect(a.mint).toBe(b.mint);
    // F6 shape: the export is a checkpoint PAIR — both arms pinned
    expect(a.pending.pending.length).toBe(b.pending.pending.length);
    expect(a.pending.depths.length).toBe(b.pending.depths.length);
    const ser = (v: unknown) =>
      JSON.stringify(v, (_k, val) => (typeof val === "bigint" ? `${val}n` : val));
    expect(ser(a.pending)).toBe(ser(b.pending));
  });
});

describe("driver step discipline", () => {
  const board = () => [
    node(IDS.dns, { slots: 4, serviceUs: 0n, kind: "dns" }),
    node(IDS.edge, { slots: 2, serviceUs: 1n * MIN }),
    node(IDS.origin, { slots: 2, serviceUs: 1n * MIN }),
    node(IDS.waf, { slots: 1, serviceUs: 1n * MIN }),
  ];

  it("calls the 13 slots in canonical TICK_STEP_ORDER every tick", () => {
    const config = testConfig({});
    const real = createDefaultSlots(config);
    const calls: string[] = [];
    const wrap = <In, Out>(name: keyof PipelineSlots, inner: (input: In) => Out) => (input: In): Out => {
      calls.push(name);
      return inner(input);
    };
    const spySlots: PipelineSlots = {
      arrival: wrap("arrival", real.arrival),
      scoring: wrap("scoring", real.scoring),
      qosClassify: wrap("qosClassify", real.qosClassify),
      route: wrap("route", real.route),
      serve: wrap("serve", real.serve),
      queueWait: wrap("queueWait", real.queueWait),
      inspect: wrap("inspect", real.inspect),
      dependencyBlock: wrap("dependencyBlock", real.dependencyBlock),
      patienceCheck: wrap("patienceCheck", real.patienceCheck),
      outcome: wrap("outcome", real.outcome),
      backpressure: wrap("backpressure", real.backpressure),
      stateEconomics: wrap("stateEconomics", real.stateEconomics),
      rulePhase: wrap("rulePhase", real.rulePhase),
    };
    let state = createInitialState({
      runSeed: config.runSeed,
      engineVersion: "test-spy",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
      clocks: initialClocks(),
      nodes: board(),
    });
    const driver = createTickDriver(spySlots, streamFor(config.runSeed, "root", 0), state.context.clocks);
    for (let t = 1; t <= 3; t += 1) {
      state = driver.advance(
        state,
        tickInputs({ envelopes: [envelope("base", fromInt(2))], dependencyEdges: [], retryPolicy: retryPolicy(2, MIN) }),
      ).state;
    }
    expect(TICK_STEP_ORDER.length).toBe(13);
    expect(calls).toEqual([...TICK_STEP_ORDER, ...TICK_STEP_ORDER, ...TICK_STEP_ORDER]);
  });

  it("rule-phase intents are renumbered by the driver seq counter (§3.3 input-log law)", () => {
    const config = testConfig({});
    const real = createDefaultSlots(config);
    let fired = 0;
    const rulePhase = (input: RulePhaseIn): RulePhaseOut => {
      fired += 1;
      return {
        firings: [],
        intents: [
          {
            seq: 9_999, // garbage seq from the "interpreter" — driver must renumber
            clock: "sim",
            atUs: input.context.clocks.simUs,
            origin: "rule",
            payload: { kind: "verb", verb: "scale-out", target: IDS.edge, value: null },
          },
        ],
      };
    };
    const slots: PipelineSlots = { ...real, rulePhase };
    let state = createInitialState({
      runSeed: config.runSeed,
      engineVersion: "test-rulephase",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
      clocks: initialClocks(),
      nodes: board(),
    });
    const driver = createTickDriver(slots, streamFor(config.runSeed, "root", 0), state.context.clocks);
    const seqs: number[] = [];
    for (let t = 1; t <= 3; t += 1) {
      const r = driver.advance(
        state,
        tickInputs({ envelopes: [envelope("base", fromInt(1))], dependencyEdges: [], retryPolicy: retryPolicy(0, 0n) }),
      );
      state = r.state;
      for (const intent of r.intents) seqs.push(intent.seq);
    }
    expect(fired).toBe(3);
    expect(seqs.length).toBe(3);
    expect(seqs.every((s) => s !== 9_999)).toBe(true);
    for (let i = 1; i < seqs.length; i += 1) expect(seqs[i]! ).toBeGreaterThan(seqs[i - 1]!);
  });

  it("rejects a root rng stream whose seed mismatches the state (R-14 guard)", () => {
    const config = testConfig({});
    const slots = createDefaultSlots(config);
    const state = createInitialState({
      runSeed: config.runSeed,
      engineVersion: "test-mismatch",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
      clocks: initialClocks(),
      nodes: [node(IDS.edge, { slots: 1, serviceUs: MIN })],
    });
    const foreign = streamFor(asRunSeed(1234n), "root", 0);
    expect(() => createTickDriver(slots, foreign, state.context.clocks).advance(state, tickInputs({ envelopes: [] }))).toThrow();
  });

  it("QoS ladder: confidence picks the highest passing class; both tiers appear", () => {
    const config = testConfig({});
    const slots = createDefaultSlots(config);
    let state = createInitialState({
      runSeed: config.runSeed,
      engineVersion: "test-qos",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
      clocks: initialClocks(),
      nodes: board(),
    });
    const driver = createTickDriver(slots, streamFor(config.runSeed, "root", 0), state.context.clocks);
    for (let t = 1; t <= 4; t += 1) {
      state = driver.advance(
        state,
        tickInputs({
          envelopes: [envelope("base", fromInt(2))],
          classes: DEFAULT_CLASSES,
          evidence: [
            { unitId: asEntityId(`base@${t}#0.0`), metric: METRIC, value: C_MID }, // → bronze
            { unitId: asEntityId(`base@${t}#0.1`), metric: METRIC, value: C_HOT }, // → gold
          ],
          dependencyEdges: [],
          retryPolicy: retryPolicy(0, 0n),
        }),
      ).state;
    }
    const byClass = new Map<string, number>();
    for (const u of state.units.values()) {
      if (u.qosClassId !== null) byClass.set(u.qosClassId, (byClass.get(u.qosClassId) ?? 0) + 1);
    }
    expect(byClass.get("gold")).toBeGreaterThanOrEqual(1);
    expect(byClass.get("bronze")).toBeGreaterThanOrEqual(1);
  });
});
