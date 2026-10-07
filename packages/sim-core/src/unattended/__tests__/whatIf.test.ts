/**
 * unattended/whatIf.ts — the What-Would-Break forward sim (§9.2: "kill any
 * object, watch the consequence, rewind" — a THOUGHT EXPERIMENT: both
 * worlds mint fresh from data, the committed weekend is never touched).
 *
 * Divergence pins are honest about what the engine can promise: a structural
 * patch shows up in the state digest AT the first tick (the board itself is
 * hashed), so the ORDER tests are framed around CONSEQUENCE (halt vs.
 * survive), not tick order, whenever raw topology already differs — and the
 * trafficSurge delta (pure traffic DATA, identical boards) is the pin that
 * proves the bisection names the EXACT minute a change bites.
 */
import { describe, expect, it } from "vitest";
import { fromInt } from "../../kernel/fixed.ts";
import { encodeTaggedTree } from "../../internal/canonical.ts";
import {
  DEFAULT_WHATIF_CHECKPOINT_EVERY,
  WHATIF_DELTA_KINDS,
  UnattendedError,
  applyWhatIfDelta,
  guardsInConfig,
  runUnattended,
  runWhatIf,
} from "../index.ts";
import type { RunUnattendedConfig } from "../index.ts";
import { CALM_BOARD, UA_SEED, uaConfig } from "./fixtures.ts";

const CHAIN_BOARD = Object.freeze({
  nodes: Object.freeze([
    Object.freeze({ id: "edge", slots: 400, serviceTimeUs: 2_000_000n }),
    Object.freeze({ id: "origin", slots: 400, serviceTimeUs: 2_000_000n, dependencyNodeId: "edge" }),
  ]),
  edges: Object.freeze([
    Object.freeze({ id: "e1", relation: "data" as const, from: "edge", to: "origin" }),
  ]),
});

function chainConfig(over: Partial<RunUnattendedConfig> = {}): RunUnattendedConfig {
  return uaConfig({
    ticks: 30n,
    board: CHAIN_BOARD,
    expressPath: ["edge", "origin"],
    deepPath: ["edge", "origin"],
    ...over,
  });
}

function resultIdentity(r: ReturnType<typeof runWhatIf>): string {
  const plain = {
    divergent: r.divergent,
    first: r.firstDivergentTick,
    window: r.divergentWindow,
    applied: r.deltaSummary.applied,
    base: r.baseline.finalDigest,
    var: r.variant.finalDigest,
    bt: r.deltaSummary.baselineTicksRun,
    vt: r.deltaSummary.variantTicksRun,
  };
  return JSON.stringify(encodeTaggedTree(plain, (problem) => {
    throw new Error(`whatIf identity not canonical: ${String(problem.kind)}`);
  }), (_k, v) => (typeof v === "bigint" ? `${String(v)}n` : v));
}

describe("the closed delta vocabulary", () => {
  it("lists exactly the three v0 deltas", () => {
    expect([...WHATIF_DELTA_KINDS]).toEqual(["removeNode", "disableDefense", "trafficSurge"]);
    expect(DEFAULT_WHATIF_CHECKPOINT_EVERY).toBe(60);
  });

  it("unknown delta types throw WHATIF_PATCH by name", () => {
    expect(() => applyWhatIfDelta(chainConfig(), { type: "detonateDatacenter" } as never)).toThrow(/unknown what-if delta/);
    expect(() => applyWhatIfDelta(chainConfig(), null as never)).toThrow(UnattendedError);
  });
});

describe("removeNode — structural patch, zero mutation", () => {
  it("drops the node, its edges, cuts dependents to null, filters routing", () => {
    const { config, applied } = applyWhatIfDelta(chainConfig(), { type: "removeNode", id: "edge" });
    expect(config.board.nodes.map((n) => n.id)).toEqual(["origin"]);
    expect(config.board.nodes[0]?.dependencyNodeId).toBeNull();
    expect(config.board.edges ?? []).toHaveLength(0);
    expect(config.expressPath).toEqual(["origin"]);
    expect(config.deepPath).toEqual(["origin"]);
    expect(applied).toContain("node:edge removed");
    expect(applied.some((a) => a.startsWith("dependency:origin→null"))).toBe(true);
    expect(applied.some((a) => a.startsWith("edges dropped"))).toBe(true);
  });

  it("the ORIGINAL config is never touched (thought-experiment law)", () => {
    const original = chainConfig();
    applyWhatIfDelta(original, { type: "removeNode", id: "edge" });
    expect(original.board.nodes).toHaveLength(2);
    expect(original.board.edges ?? []).toHaveLength(1);
  });

  it("unknown node ids throw at the door", () => {
    expect(() => applyWhatIfDelta(chainConfig(), { type: "removeNode", id: "moon" })).toThrow(/not on the board/);
    expect(() => applyWhatIfDelta(chainConfig(), { type: "disableDefense", id: "moon" })).toThrow(UnattendedError);
  });
});

describe("disableDefense — the data-level meaning of \"that WAF is off\"", () => {
  it("patches inspectionDepth to pass-through for exactly one node", () => {
    const board = Object.freeze({
      nodes: Object.freeze([
        Object.freeze({ id: "waf-1", slots: 20, serviceTimeUs: 5_000_000n, inspectionDepth: "inspect" as const }),
        Object.freeze({ id: "web-1", slots: 20, serviceTimeUs: 2_000_000n, inspectionDepth: "challenge" as const }),
      ]),
    });
    const { config, applied } = applyWhatIfDelta(chainConfig({ board }), { type: "disableDefense", id: "waf-1" });
    expect(config.board.nodes.map((n) => n.inspectionDepth)).toEqual(["pass-through", "challenge"]);
    expect(applied).toEqual(["node:waf-1 inspectionDepth→pass-through"]);
  });
});

describe("trafficSurge — parse laws on the multiplier DATA", () => {
  it("negative or non-Fixed multipliers, zero-length windows throw", () => {
    const bad = (delta: unknown) => expect(() => applyWhatIfDelta(chainConfig(), delta as never)).toThrow(UnattendedError);
    bad({ type: "trafficSurge", multiplier: -1n, minutes: 5 });
    bad({ type: "trafficSurge", multiplier: 2, minutes: 5 });
    bad({ type: "trafficSurge", multiplier: fromInt(3), minutes: 0 });
    bad({ type: "trafficSurge", multiplier: fromInt(3), minutes: 5, startMinute: 0 });
  });
});

describe("runWhatIf — bisection finds the minute a change bites", () => {
  it("a surge at minute 5 first diverges at EXACTLY tick 5 (coarse cp-60 pass + tick-exact refine)", () => {
    const config = uaConfig({ ticks: 120n, guards: [{ type: "totalOutage" }] });
    const r = runWhatIf({
      config,
      delta: { type: "trafficSurge", multiplier: fromInt(3), minutes: 4, startMinute: 5 },
    });
    expect(r.divergent).toBe(true);
    expect(r.firstDivergentTick).toBe(5n);
    expect(r.divergentWindow).toEqual({ afterTick: 0n, atTick: 60n });
    expect(r.deltaSummary.applied[0]).toContain("baseline surge");
  });

  it("a ×1 surge is truly a no-op: identical worlds, no divergence", () => {
    const config = uaConfig({ ticks: 70n });
    const r = runWhatIf({ config, delta: { type: "trafficSurge", multiplier: fromInt(1), minutes: 10 } });
    expect(r.divergent).toBe(false);
    expect(r.firstDivergentTick).toBeNull();
    expect(r.baseline.finalDigest).toBe(r.variant.finalDigest);
  });

  it("the baseline report equals a STANDALONE run of the same config", () => {
    const config = uaConfig({ ticks: 70n, checkpointEvery: 60, guards: [{ type: "totalOutage" }] });
    const r = runWhatIf({ config, delta: { type: "trafficSurge", multiplier: fromInt(2), minutes: 3, startMinute: 65 } });
    const solo = runUnattended(config);
    expect(r.baseline.finalDigest).toBe(solo.finalDigest);
    expect(r.baseline.perCheckpoint.map((c) => String(c.tick))).toEqual(solo.perCheckpoint.map((c) => String(c.tick)));
  });

  it("killing the load-bearing egress UNMAKEs the world; killing deadweight drifts on", () => {
    // Routing makes the consequence honest: organic baseline rides spare-1
    // (express) while web-1 waits on the deep lane. Remove the one node
    // every visitor actually crosses and the engine REFUSES the world
    // (empty express path ⇒ BOARD_EMPTY fail-fast) — the loudest possible
    // answer to "what would break?". Remove the idle one and both worlds
    // run out the horizon, differing only in what the state contains.
    const satBoard = Object.freeze({
      nodes: Object.freeze([
        Object.freeze({ id: "web-1", slots: 1, serviceTimeUs: 120_000_000_000n }),
        Object.freeze({ id: "spare-1", slots: 400, serviceTimeUs: 2_000_000n }),
      ]),
    });
    const config = uaConfig({
      ticks: 60n,
      board: satBoard,
      expressPath: ["spare-1"],
      deepPath: ["web-1"],
      guards: [{ type: "totalOutage", sustainedMin: 5 }],
    });
    expect(() => runWhatIf({ config, delta: { type: "removeNode", id: "spare-1" } })).toThrow(/BOARD_EMPTY|no express path/);
    const killDeadweight = runWhatIf({ config, delta: { type: "removeNode", id: "web-1" } });
    expect(killDeadweight.divergent).toBe(true); // board census is hashed from tick 1
    expect(killDeadweight.baseline.stop).toBeNull();
    expect(killDeadweight.variant.stop).toBeNull();
    expect(killDeadweight.variant.ticksRun).toBe(60n);
    expect(killDeadweight.firstDivergentTick).toBe(1n);
  });
});

describe("whatIf report faces the catastrophe", () => {
  it("a surge that saturates the pipe halts the VARIANT (guard fires there, not in baseline)", () => {
    const config = uaConfig({
      ticks: 12n,
      board: { nodes: Object.freeze([Object.freeze({ id: "web-1", slots: 40, serviceTimeUs: 2_000_000n })]) },
      traffic: { baselineRatePerMin: fromInt(20) },
      guards: [{ type: "cascadeCollapse", sustainedMin: 3 }],
    });
    const r = runWhatIf({ config, delta: { type: "trafficSurge", multiplier: fromInt(100), minutes: 60, startMinute: 2 } });
    expect(r.deltaSummary.baselineStop).toBeNull();
    expect(r.deltaSummary.variantStop?.reason).toBe("guard:cascadeCollapse");
    expect(r.divergent).toBe(true);
    expect((r.firstDivergentTick as bigint)).toBeGreaterThanOrEqual(2n);
    expect((r.firstDivergentTick as bigint)).toBeLessThanOrEqual(r.deltaSummary.variantStop?.atTick as bigint);
  });
});

describe("determinism + horizon plumbing", () => {
  it("the same (config, delta) replays byte-identical", () => {
    const input = {
      config: chainConfig({ ticks: 90n, guards: [{ type: "totalOutage" }] }),
      delta: { type: "trafficSurge", multiplier: fromInt(7), minutes: 5, startMinute: 10 } as const,
    };
    const a = resultIdentity(runWhatIf(input));
    const b = resultIdentity(runWhatIf(input));
    expect(a).toBe(b);
  });

  it("explicit horizon overrides the config ticks; missing horizon throws", () => {
    const r = runWhatIf({ config: chainConfig({ ticks: 200n }), delta: { type: "disableDefense", id: "edge" }, horizon: 10n });
    expect(r.deltaSummary.horizon).toBe(10n);
    expect(r.baseline.ticksRun).toBe(10n);
    const noHorizon: RunUnattendedConfig = { runSeed: UA_SEED, board: CALM_BOARD, ruleBook: [], ruleBookHash: "b", guards: [] };
    expect(() =>
      runWhatIf({
        config: noHorizon,
        delta: { type: "disableDefense", id: "web-1" },
      }),
    ).toThrow(/horizon/);
  });

  it("guardsInConfig parses through the runner's own parser (bad guard = fails at the door)", () => {
    expect(guardsInConfig(uaConfig({ guards: [{ type: "totalOutage" }] }))).toHaveLength(1);
    expect(() => guardsInConfig(uaConfig({ guards: [{ type: "vibes" }] }))).toThrow(/unknown guard kind/);
  });

  it("seed is carried in both worlds' reports (the fold is seed-sensitive)", () => {
    const config = uaConfig({ ticks: 20n, runSeed: UA_SEED });
    const r = runWhatIf({ config, delta: { type: "trafficSurge", multiplier: fromInt(3), minutes: 4, startMinute: 5 } });
    expect(r.baseline.runSeed).toBe(UA_SEED);
    expect(r.variant.runSeed).toBe(UA_SEED);
  });
});
