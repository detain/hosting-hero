/**
 * FIX-5 pin: step-6 wait prediction reads through queue.effectiveRho, so the
 * downstream node's queue depth casts a shadow on the upstream ρ — a unit
 * waiting behind a below-knee node whose dependency is congested must see
 * the hockey stick bend EARLY (HUD foreshadowing rule, R-07 corollary).
 * Also pins FIX-6: one shared ρ helper — serve-time and purge-time writers
 * agree exactly (round-half-away fromRatio + RHO_CEILING clamp).
 */

import { describe, expect, it } from "vitest";
import type { EntityId, NodeRecord } from "../../types";
import { asEntityId } from "../../types";
import { FIXED_UNIT, FIXED_ZERO, fromInt, fromRatio } from "../../kernel/fixed";
import { initialClocks } from "../../kernel/time";
import { streamFor } from "../../kernel/rng";
import { DEFAULT_KNEE_RHO, RHO_CEILING, effectiveRho, makeSlots, utilization } from "../queue";
import { createDefaultSlots, defaultQueueWaitStep, defaultServeStep } from "../defaults";
import { createInitialState, createTickDriver } from "../driver";
import { MIN, IDS, envelope, node, testConfig, tickInputs } from "./helpers";

const WAITER = asEntityId("u-wait");

function upstreamWith(occupiedCount: number, depQueueDepth: number, dep: EntityId | null): NodeRecord {
  const slots = makeSlots(4).map((slot, i) =>
    i < occupiedCount
      ? Object.freeze({ occupied: true, unitId: asEntityId(`holder-${String(i)}`), waitingOn: null, releasedAtUs: 10n ** 15n })
      : slot,
  );
  return Object.freeze({
    id: IDS.edge,
    kind: "edge",
    slots,
    serviceTimeUs: MIN,
    queueDepth: 1,
    queue: Object.freeze([WAITER]),
    shedOrder: "qos-weighted" as const,
    inspectionDepth: "pass-through" as const,
    discipline: "hockey-stick" as const,
    utilizationRho: utilization({ id: IDS.edge, kind: "edge", slots, serviceTimeUs: MIN, queueDepth: 1, queue: [], shedOrder: "qos-weighted", inspectionDepth: "pass-through", discipline: "hockey-stick", utilizationRho: 0n, dependencyNodeId: dep }),
    dependencyNodeId: dep,
  });
}

function downstreamWithQueue(depth: number): NodeRecord {
  return Object.freeze({
    id: IDS.origin,
    kind: "origin",
    slots: makeSlots(2),
    serviceTimeUs: MIN,
    queueDepth: depth,
    queue: Object.freeze(Array.from({ length: depth }, (_, i) => asEntityId(`q-${String(i)}`))),
    shedOrder: "qos-weighted" as const,
    inspectionDepth: "pass-through" as const,
    discipline: "hockey-stick" as const,
    utilizationRho: 0n,
    dependencyNodeId: null,
  });
}

function predictedWait(upstreamRhoNode: NodeRecord, downstreamDepth: number): bigint {
  const nodes = new Map<EntityId, NodeRecord>([
    [upstreamRhoNode.id, upstreamRhoNode],
    [IDS.origin, downstreamWithQueue(downstreamDepth)],
  ]);
  const out = defaultQueueWaitStep({
    context: Object.freeze({ tick: 1n, minute: 1, clocks: initialClocks() }),
    waiting: Object.freeze([WAITER]),
    nodes,
    kneeRho: DEFAULT_KNEE_RHO,
  });
  return out.waits[0]?.queueWaitUs ?? 0n;
}

describe("downstream shadow in step-6 wait (FIX-5)", () => {
  it("a congested dependency bends the stick: 0 µs predicted → positive, strictly greater", () => {
    // upstream ρ = 2/4 = 0.5 → at/below the 0.7 knee → old law: wait = 0.
    const upstream = upstreamWith(2, 4, IDS.origin);
    expect(predictedWait(upstream, 0)).toBe(0n); // dependency idle: still zero
    const shadowed = predictedWait(upstream, 4); // dependency queue 4 ⇒ shadow 4/4
    expect(shadowed).toBeGreaterThan(0n);
    expect(shadowed).toBeGreaterThan(predictedWait(upstream, 1));
  });

  it("monotone in downstream depth, capped by RHO_CEILING behaviour", () => {
    const upstream = upstreamWith(1, 0, IDS.origin); // own ρ 0.25 — far below knee
    let previous = -1n;
    for (let depth = 0; depth <= 6; depth += 1) {
      const wait = predictedWait(upstream, depth);
      expect(wait >= previous).toBe(true);
      previous = wait;
    }
    expect(previous).toBeGreaterThan(0n);
  });

  it("no dependency edge ⇒ the STEP never applies a shadow (depth is gated upstream)", () => {
    const lone = upstreamWith(2, 0, null); // dependencyNodeId null
    // The step passes depth 0 when there is no dependencyNodeId, so ρ stays 0.5 ≤ knee:
    expect(predictedWait(lone, 4)).toBe(0n);
    // The helper itself is order-agnostic (pure math, not a graph reader):
    expect(effectiveRho(lone, 0)).toBe(utilization(lone));
  });

  it("effectiveRho itself: adds depth/S, clamps at RHO_CEILING, guards capacity 0", () => {
    const base = upstreamWith(2, 0, IDS.origin); // ρ 0.5
    expect(effectiveRho(base, 2)).toBe(RHO_CEILING); // 0.5 + 2/4 → 1.0 → clamp 0.99
    const full = upstreamWith(4, 0, IDS.origin);
    expect(effectiveRho(full, 1)).toBe(RHO_CEILING);
    const capacity0 = { ...base, slots: [] as never };
    expect(effectiveRho(capacity0 as unknown as NodeRecord, 3)).toBe(utilization(capacity0 as unknown as NodeRecord));
  });
});

describe("one shared ρ helper (FIX-6)", () => {
  it("serve-step writes agree with queue.utilization for identical slot states", () => {
    // Drive the REAL serve step: 2 of 3 slots occupied at end of tick.
    const board = new Map<EntityId, NodeRecord>([
      [IDS.edge, Object.freeze({ ...upstreamWith(0, 0, null), queueDepth: 0, queue: Object.freeze([]), utilizationRho: 0n })],
    ]);
    const slotsIn = makeSlots(3).map((s, i) =>
      i < 2 ? Object.freeze({ occupied: true, unitId: asEntityId(`h-${String(i)}`), waitingOn: null, releasedAtUs: 10n ** 15n }) : s,
    );
    board.set(IDS.edge, Object.freeze({ ...board.get(IDS.edge)!, slots: slotsIn }));
    const out = defaultServeStep({
      context: Object.freeze({ tick: 5n, minute: 5, clocks: Object.freeze({ ...initialClocks(), simUs: 5n * MIN }) }),
      units: Object.freeze([]),
      nodes: board,
    });
    const written = out.nodes.get(IDS.edge)!.utilizationRho;
    // NOT the old driver-floor (2<<16)/3 = 43690: it is the round-half-away
    // shared helper value — and byte-equal to queue.utilization of the node.
    expect(written).toBe(fromRatio(2n, 3n));
    expect(written).not.toBe((2n << 16n) / 3n);
    expect(written).toBe(utilization(out.nodes.get(IDS.edge)!));
  });

  it("full node: both former writers' ceilings unified at RHO_CEILING, never 1.0", () => {
    const full = upstreamWith(4, 0, null);
    expect(utilization(full)).toBe(RHO_CEILING);
    expect(RHO_CEILING < FIXED_UNIT).toBe(true);
  });

  it("driver PURGE path writes the same ρ (3-slot waf, inspection neutralizes one ⇒ ρ = 2/3 round-half-away)", () => {
    // Behavioural kill-switch for the old driver-local refreshRho, which
    // floor-divided ((2<<16)/3 = 43690) and ceilinged at 1.0.
    const waf = Object.freeze({
      ...node(IDS.waf, { slots: 3, serviceUs: MIN, depth: "challenge" }),
    });
    const config = testConfig({
      expressPath: Object.freeze([IDS.waf]),
      deepPath: Object.freeze([IDS.waf]),
      detectionRatio: FIXED_UNIT,
      falsePositiveRatio: FIXED_ZERO,
      defaultPatienceUs: 100n * MIN,
    });
    const slots = createDefaultSlots({ ...config });
    let state = createInitialState({
      runSeed: config.runSeed,
      engineVersion: "test-fix6-purge",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
      clocks: initialClocks(),
      nodes: [waf],
    });
    const driver = createTickDriver(slots, streamFor(config.runSeed, "root", 0), state.context.clocks);
    const result = driver.advance(
      state,
      Object.freeze({
        ...tickInputs({
          envelopes: [envelope("base", fromInt(2)), envelope("spike", fromInt(1), "malicious")],
          dependencyEdges: [],
          retryPolicy: { maxRetries: 0, backoffBaseUs: 0n, jitterPurchased: false },
          aggression: FIXED_UNIT,
        }),
      }),
    );
    // One adversarial neutralized (challenge × detection 1.0 = certain block),
    // two benign served-on… they stay in service; purge freed the blocked one's
    // slot ⇒ exactly two of three occupied ⇒ shared-helper ρ.
    expect(result.outcomes.map((o) => o.terminal)).toEqual(["bounced"]);
    const rho = result.state.nodes.get(IDS.waf)!.utilizationRho;
    expect(rho).toBe(fromRatio(2n, 3n)); // 43691 — the round-half-away helper
    expect(rho).not.toBe((2n << 16n) / 3n); // NOT the retired floor writer
  });
});


