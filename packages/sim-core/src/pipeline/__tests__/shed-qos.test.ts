/**
 * R-06 class-aware shed (audit fix 1 — "QoS is a label, not a behavior").
 *
 * Before this lane the hard-ceiling discipline shed its whole residual queue
 * in raw FIFO emission order: `node.shedOrder` and every class's
 * `shedPriority` were parsed, digested… and consulted by nobody. §7.11 is
 * explicit — "a class you SOLD is a class you cannot shed": the cheap traffic
 * walks off the terminal ledger first, the sold traffic last, unclassified
 * (no contract to defend) before them all.
 *
 * Two layers of proof here:
 *  1. orderShedForNode / orderShedForTick unit laws (pure, forged units);
 *  2. a driver-level witness on a hard-ceiling board where a GOLD unit and a
 *     BRONZE unit are shed in the same tick — the bounce events must come out
 *     bronze-first under the node's qos-weighted law and gold-first under its
 *     FIFO twin. The CONTRAST between those two runs is the falsification
 *     pin: if the ordering were inert, both arms would agree.
 */

import { describe, expect, it } from "vitest";
import type { EntityId, NodeRecord, QosClassDef, SimEvent, Unit } from "../../types";
import { asEntityId, asMetricId, asRunSeed } from "../../types";
import { FIXED_ZERO, fromInt, fromRatio } from "../../kernel/fixed";
import { streamFor } from "../../kernel/rng";
import { orderShedForNode, orderShedForTick } from "../internal.ts";
import { createInitialState, createTickDriver, type TickInputs } from "../driver";
import { createDefaultSlots, digestState } from "../index";
import { IDS, MIN, envelope, freshClocks, node, testConfig, tickInputs } from "./helpers";
import { NO_RETRY } from "./helpers";

/* ═══════════════════ §7.11-shaped class table (authored) ═══════════════════ */

/** The ratified reading: bronze is the unsold tier (shedPriority 0 = "die
 *  first"), gold is SOLD (shedPriority 5 = "die last"). The engine obeys the
 *  numbers; who deserves which number is player authoring, not engine law. */
const SOLD_CLASSES: readonly QosClassDef[] = Object.freeze([
  Object.freeze({
    id: "bronze",
    label: "Bronze",
    weight: FIXED_ZERO,
    shedPriority: 0,
    budgetUs: 30n * MIN,
    inspectionDepth: "pass-through" as const,
  }),
  Object.freeze({
    id: "gold",
    label: "Gold",
    weight: fromRatio(6n, 10n),
    shedPriority: 5,
    budgetUs: 5n * MIN,
    inspectionDepth: "inspect" as const,
  }),
]);

function forgeUnit(id: EntityId, qosClassId: string | null, hops: readonly EntityId[] = [IDS.edge]): Unit {
  return Object.freeze({
    id,
    type: "probe",
    sizeCost: fromInt(1),
    patienceUs: 60n * MIN,
    trueIntent: "customer",
    source: { identity: "s", reputation: FIXED_ZERO },
    retryOf: null,
    arrivedAtTick: 1n,
    accumulatedLatencyUs: 0n,
    inspectionCostUs: 0n,
    confidence: qosClassId === "gold" ? fromRatio(7n, 10n) : FIXED_ZERO,
    qosClassId,
    routeHops: Object.freeze([...hops]),
    waitingOn: null,
  }) as unknown as Unit;
}

function unitMap(units: readonly Unit[]): ReadonlyMap<EntityId, Unit> {
  return new Map(units.map((u) => [u.id, u]));
}

function nodeWith(id: EntityId, shedOrder: NodeRecord["shedOrder"]): NodeRecord {
  return Object.freeze({ ...node(id), shedOrder });
}

/* ═══════════════════════ 1 · orderShedForNode unit laws ═══════════════════════ */

describe("orderShedForNode — the four shed orders are behaviors now (R-06)", () => {
  const gold = forgeUnit(asEntityId("g"), "gold");
  const bronzeA = forgeUnit(asEntityId("b1"), "bronze");
  const bronzeB = forgeUnit(asEntityId("b2"), "bronze");
  const stray = forgeUnit(asEntityId("z"), null); // unclassified
  const units = unitMap([gold, bronzeA, bronzeB, stray]);
  const nodes = new Map<EntityId, NodeRecord>(
    (["first-in-first-out", "last-in-first-out", "qos-weighted", "lowest-value-first"] as const).map((o) => [
      asEntityId(o),
      nodeWith(asEntityId(o), o),
    ]),
  );

  it("qos-weighted: unclassified first, then shedPriority ascending", () => {
    const q = [gold.id, bronzeA.id, stray.id, bronzeB.id];
    const out = orderShedForNode(nodes.get(asEntityId("qos-weighted"))!, q, units, SOLD_CLASSES);
    // stray (bucket -1) → bronze (0) → bronze → gold (5)
    expect(out).toStrictEqual([stray.id, bronzeA.id, bronzeB.id, gold.id]);
  });

  it("qos-weighted: equal class ties break on unitId, never queue position", () => {
    const out = orderShedForNode(
      nodes.get(asEntityId("qos-weighted"))!,
      [bronzeB.id, bronzeA.id],
      units,
      SOLD_CLASSES,
    );
    expect(out).toStrictEqual([bronzeA.id, bronzeB.id]); // "b1" < "b2" code-unit
  });

  it("qos-weighted: a stale class id (player deleted the class) ≙ unclassified", () => {
    const ghost = forgeUnit(asEntityId("a"), "platinum");
    const out = orderShedForNode(
      nodes.get(asEntityId("qos-weighted"))!,
      [gold.id, ghost.id],
      unitMap([gold, ghost]),
      SOLD_CLASSES,
    );
    expect(out).toStrictEqual([ghost.id, gold.id]);
  });

  it("lowest-value-first: capacity-share weight ascending (cheap tier dies first)", () => {
    const out = orderShedForNode(
      nodes.get(asEntityId("lowest-value-first"))!,
      [gold.id, bronzeA.id],
      units,
      SOLD_CLASSES,
    );
    expect(out).toStrictEqual([bronzeA.id, gold.id]); // weight 0 < 0.6
  });

  it("first-in-first-out / last-in-first-out: pre-fix order preserved / reversed", () => {
    const q = [gold.id, bronzeA.id, stray.id];
    expect(orderShedForNode(nodes.get(asEntityId("first-in-first-out"))!, q, units, SOLD_CLASSES)).toStrictEqual(q);
    expect(orderShedForNode(nodes.get(asEntityId("last-in-first-out"))!, q, units, SOLD_CLASSES)).toStrictEqual([
      ...q,
    ].reverse());
  });

  it("ghost ids (foreign lists) sort first, unitId-ordered, without throwing", () => {
    const out = orderShedForNode(nodes.get(asEntityId("qos-weighted"))!, [gold.id, asEntityId("nope2"), asEntityId("nope1")], units, SOLD_CLASSES);
    expect(out).toStrictEqual([asEntityId("nope1"), asEntityId("nope2"), gold.id]);
  });
});

describe("orderShedForTick — per-node segments", () => {
  it("orders each contiguous same-node run; unknown-node entries pass through in place", () => {
    const edgeGold = forgeUnit(asEntityId("eg"), "gold", [IDS.edge, IDS.origin]);
    const edgeBronze = forgeUnit(asEntityId("eb"), "bronze", [IDS.edge, IDS.origin]);
    const strayUnit = forgeUnit(asEntityId("sx"), "bronze", [asEntityId("nowhere")]);
    const units = unitMap([edgeGold, edgeBronze, strayUnit]);
    const nodes = new Map<EntityId, NodeRecord>([
      [IDS.edge, nodeWith(IDS.edge, "qos-weighted")],
      [IDS.origin, nodeWith(IDS.origin, "qos-weighted")],
    ]);
    const out = orderShedForTick(
      [edgeGold.id, edgeBronze.id, strayUnit.id],
      nodes,
      units,
      SOLD_CLASSES,
    );
    // edge run re-sorted bronze-first; the unknown-node run keeps its slot.
    expect(out).toStrictEqual([edgeBronze.id, edgeGold.id, strayUnit.id]);
  });

  it("empty channel is returned untouched (identity)", () => {
    const nodes = new Map<EntityId, NodeRecord>([[IDS.edge, nodeWith(IDS.edge, "qos-weighted")]]);
    expect(orderShedForTick(Object.freeze([]), nodes, new Map(), SOLD_CLASSES)).toHaveLength(0);
  });
});

/* ═══════════════════════ 2 · driver-level witness ═══════════════════════ */

/** NEVER_BOUNCE patience: patience rolls floor below one basis point over a
 *  3-tick run (same arithmetic as shed-terminal.test.ts) — every bounce in
 *  these runs is CEILING attribution, isolated. */
const NEVER_BOUNCE_US = 1_000_000n * MIN;
/** One slot, ten-minute service: tick 1 occupies it; from tick 2 on nothing
 *  is admitted and every arrival of the tick is shed in full. */
function ceilingNodes(shedOrder: NodeRecord["shedOrder"]): readonly NodeRecord[] {
  return Object.freeze([
    Object.freeze({ ...node(IDS.edge, { slots: 1, serviceUs: 10n * MIN, discipline: "hard-ceiling" }), shedOrder }),
    node(IDS.origin, { slots: 8, serviceUs: MIN }),
  ]);
}

/** Two arrivals per tick; on tick 2 evidence promotes unit `…#0.0` to GOLD
 *  while `…#0.1` stays bronze (confidence 0 clears the weight-0 gate). */
type BounceEvent = Extract<SimEvent, { kind: "bounced" }>;

function qosRun(shedOrder: NodeRecord["shedOrder"]): { readonly bounces: readonly BounceEvent[]; readonly chain: readonly string[] } {
  const config = testConfig({
    runSeed: asRunSeed(42n),
    defaultPatienceUs: NEVER_BOUNCE_US,
  });
  const driver = createTickDriver(createDefaultSlots(config), streamFor(config.runSeed, "root", 0), freshClocks(), {
    purgeTargetedMinNodes: 0,
  });
  let state = createInitialState({
    runSeed: config.runSeed,
    engineVersion: "shed-qos",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "shed-qos", ruleBookHash: "" },
    clocks: freshClocks(),
    nodes: ceilingNodes(shedOrder),
  });
  const bounces: BounceEvent[] = [];
  const chain: string[] = [];
  for (let t = 0; t < 3; t += 1) {
    const inputs: TickInputs = tickInputs({
      envelopes: Object.freeze([envelope("qos:probe", fromInt(2))]),
      dependencyEdges: Object.freeze([]),
      retryPolicy: NO_RETRY,
      classes: SOLD_CLASSES,
      evidence:
        t === 1
          ? Object.freeze([
              Object.freeze({ unitId: asEntityId("qos:probe@2#0.0"), metric: asMetricId("probe"), value: fromRatio(7n, 10n) }),
            ])
          : Object.freeze([]),
    });
    const result = driver.advance(state, inputs);
    state = result.state;
    bounces.push(...result.events.filter((event) => event.kind === "bounced"));
    chain.push(digestState(state));
  }
  return { bounces, chain };
}

describe("hard-ceiling shed honors class at the terminal ledger (witness)", () => {
  it("qos-weighted board: the BRONZE shed bounces before the GOLD one", () => {
    const { bounces } = qosRun("qos-weighted");
    expect(bounces.filter((e) => e.tick === 2n).map((event) => event.unitId)).toStrictEqual([
      asEntityId("qos:probe@2#0.1"), // bronze — sold class is NOT first out
      asEntityId("qos:probe@2#0.0"), // gold — dies last
    ]);
  });

  it("FIFO twin (pre-fix law): the GOLD unit goes first — the contrast is real", () => {
    const { bounces } = qosRun("first-in-first-out");
    // Falsification pair: with an inert ordering law the arm above would emit
    // THIS order too. The two orders differing is the proof the label drives
    // behavior now.
    expect(bounces.filter((e) => e.tick === 2n).map((event) => event.unitId)).toStrictEqual([
      asEntityId("qos:probe@2#0.0"),
      asEntityId("qos:probe@2#0.1"),
    ]);
  });

  it("the shed ORDER is digest-visible (qos ≠ fifo chains, each twin-stable)", () => {
    const qos = qosRun("qos-weighted");
    const fifo = qosRun("first-in-first-out");
    expect(qos.chain).not.toStrictEqual(fifo.chain);
    expect(qos.chain).toStrictEqual(qosRun("qos-weighted").chain);
    expect(fifo.chain).toStrictEqual(qosRun("first-in-first-out").chain);
  });

  it("sold classes under identical timing differ ONLY in event order — same census", () => {
    const qos = qosRun("qos-weighted");
    const fifo = qosRun("first-in-first-out");
    // 2/min × 3 ticks: tick-1 head admitted, tick-1 second shed, ticks 2–3
    // both shed → 5 bounces, identical sets, differing sequences.
    expect(qos.bounces).toHaveLength(5);
    expect(fifo.bounces).toHaveLength(5);
    expect([...qos.bounces].map((e) => e.unitId).sort()).toStrictEqual(
      [...fifo.bounces].map((e) => e.unitId).sort(),
    );
  });
});
