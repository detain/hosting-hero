/**
 * THE INTENT DOOR — contract tests for the external-intent gate (proto
 * friction #1 closure). Pins, per MASTER_REPORT §4.2/§7.5/§7.13:
 *  - canonical position: applied BEFORE step 1, sorted by (tick, seq);
 *  - execute-or-refuse: every verb executes its named handler and every
 *    semantic bad-payload case emits a deterministic refusal event;
 *  - hands are physics: capacity exhaustion blocks the next concurrent
 *    action with a refusal, tokens come back at the occupancy boundary;
 *  - pause-with-orders: intents stamped while paused apply on the resume
 *    tick in order; future stamps refuse;
 *  - scope audit: the door NEVER mutates units/lanes/observed/cash/contracts
 *    (reference identity is the assertion); `context` is STAMPED with this
 *    pass's TickContext (W1 single fresh source), never mutated;
 *  - determinism ×100: identical seed + identical intent schedule ⇒
 *    identical per-tick digest chains (§8 RISK-1);
 *  - boundary law (M2/M4): a primitive TYPE mismatch anywhere on the feed
 *    (stamp fields, per-verb arg shapes, missing keys) and a repeated
 *    (tick, seq) stamp are STRUCTURAL garbage → IntentDoorError; only
 *    well-typed values ever reach the 32-code refusal census.
 */

import { describe, expect, it } from "vitest";
import type {
  BoardEdgeRecord,
  BoardRelation,
  BoardState,
  CauseId,
  EntityId,
  ExternalIntent,
  GameState,
  HandState,
  PlaceDeviceArgs,
  PolicyCard,
  PlayerVerbArgs,
  SimTick,
  TickContext,
} from "../../types";
import { asCauseId, asEntityId, asMetricId, asMoney, asRuleId, asRunSeed, PlayerVerb } from "../../types";
import { fromInt } from "../../kernel/fixed";
import { initialClocks, MICROS_PER_MIN } from "../../kernel/time";
import { streamFor } from "../../kernel/rng";
import { createDefaultSlots } from "../defaults";
import { createInitialState, createTickDriver } from "../driver";
import { digestState } from "../digest";
import {
  applyIntentDoor,
  createBoardState,
  IntentDoorError,
  mintHandState,
  DEFAULT_INTENT_OCCUPANCY_TICKS,
  type IntentDoorConfig,
  type PlaceDeviceQuery,
} from "../intent-door";
import { IDS, envelope, node, retryPolicy, testConfig, tickInputs } from "./helpers";

const MIN = MICROS_PER_MIN;

/* ═══════════════════════════ fixtures ═══════════════════════════ */

function ctx(tick: SimTick): TickContext {
  return Object.freeze({ tick, minute: Number(tick), clocks: initialClocks() });
}

/** One door-fed, tick-stamped player intent. */
function ext(tick: SimTick, seq: number, args: PlayerVerbArgs, origin: "player" | "rule" = "player"): ExternalIntent {
  return Object.freeze({
    tick,
    intent: Object.freeze({
      seq,
      clock: "sim" as const,
      atUs: tick * MIN,
      origin,
      payload: Object.freeze({ kind: "player-verb" as const, args }),
    }),
  });
}

function baseState(handCapacity = 2): GameState {
  return createInitialState({
    runSeed: asRunSeed(7n),
    engineVersion: "test-door",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
    clocks: initialClocks(),
    nodes: [
      node(IDS.dns, { slots: 2, serviceUs: 0n, kind: "dns" }),
      node(IDS.edge, { slots: 2, serviceUs: MIN }),
      node(IDS.origin, { slots: 1, serviceUs: MIN }),
    ],
    handCapacity,
    board: createBoardState(),
  });
}

const CARD: PolicyCard = {
  id: asRuleId("rule-page-on-hot"),
  scope: { kind: "estate", ref: null },
  when: [
    {
      metric: asMetricId("rho-edge"),
      comparator: ">",
      threshold: { kind: "value", amount: 55706n, unit: "percent" },
    },
  ],
  then: [{ id: "page", runbookName: null, value: null }],
  band: "inform",
  upkeepMicroUsd: asMoney(50n),
};
const CARD_HASH = "ab12cd34";
/** M3 — the whole-book FNV-1a-64 fold over [CARD] (code-unit-sorted id +
 *  digest-mirrored per-card fingerprint). Derived INDEPENDENTLY of the door
 *  implementation by re-transcribing digest.ts's absorb walk (see the
 *  "ruleBookHash is a whole-book fold (M3)" describe for the relational
 *  pins that make hardcoding this safe). Pre-M3 the door stored the last
 *  committed payload hash here — wrong semantics for a field save/ persists
 *  as the book's identity. */
const SINGLE_CARD_FOLD = "c5261fb2f19e7417";

const OPEN_ARGS: PlaceDeviceArgs = {
  verb: PlayerVerb.PlaceDevice,
  nodeId: asEntityId("cache-1"),
  deviceKind: "cache",
  template: null,
};

function refused(result: ReturnType<typeof applyIntentDoor>, seq: number): string {
  const receipt = result.receipts.find((r) => r.seq === seq);
  if (receipt === undefined || receipt.outcome !== "refused" || receipt.reason === null) {
    throw new Error(`expected a refusal for seq ${seq}`);
  }
  return receipt.reason;
}

function outcomeOf(result: ReturnType<typeof applyIntentDoor>, seq: number): string {
  const receipt = result.receipts.find((r) => r.seq === seq);
  if (receipt === undefined) throw new Error(`no receipt for seq ${seq}`);
  return receipt.outcome;
}

/* ═══════════════════════════ verb → handler executions ═══════════════════════════ */

describe("door executes every verb through its named handler", () => {
  it("place-device mints a NodeRecord from the device defaults", () => {
    const result = applyIntentDoor(baseState(), ctx(1n), [ext(1n, 1, OPEN_ARGS)]);
    const placed = result.state.nodes.get(asEntityId("cache-1"));
    expect(placed?.kind).toBe("cache");
    expect(placed?.slots.length).toBe(1);
    expect(placed?.serviceTimeUs).toBe(MIN);
    expect(outcomeOf(result, 1)).toBe("executed");
    const event = result.events[0];
    if (event?.kind !== "intent-executed") throw new Error("expected an executed event");
    expect(event.verb).toBe(PlayerVerb.PlaceDevice);
    expect(event.handIndexes).toEqual([0]);
    expect(event.busyUntilTick).toBe(1n + BigInt(DEFAULT_INTENT_OCCUPANCY_TICKS[PlayerVerb.PlaceDevice]));
    expect(event.causeId).toBe("intent:1"); // §7.0 attribution on every state change
  });

  it("connect-ports records the edge and bumps board version", () => {
    const args: PlayerVerbArgs = {
      verb: PlayerVerb.ConnectPorts,
      relation: "data",
      from: IDS.edge,
      to: IDS.origin,
      slot: null,
    };
    const result = applyIntentDoor(baseState(), ctx(1n), [ext(1n, 1, args)]);
    const edge: BoardEdgeRecord | undefined = result.state.board?.edges.get(
      asEntityId("edge:data:edge->origin"),
    );
    expect(edge?.relation).toBe("data");
    expect(result.state.board?.version).toBe(1);
  });

  it("connect-ports power feeds occupy a named socket", () => {
    const args: PlayerVerbArgs = {
      verb: PlayerVerb.ConnectPorts,
      relation: "power",
      from: IDS.edge,
      to: IDS.origin,
      slot: "psu1",
    };
    const result = applyIntentDoor(baseState(), ctx(1n), [ext(1n, 1, args)]);
    expect(result.state.board?.edges.get(asEntityId("edge:power:edge->origin:psu1"))?.slot).toBe("psu1");
  });

  it("disconnect-drain pulls the edge (version 2)", () => {
    const connect: PlayerVerbArgs = {
      verb: PlayerVerb.ConnectPorts,
      relation: "control",
      from: IDS.edge,
      to: IDS.origin,
      slot: null,
    };
    const state = applyIntentDoor(baseState(), ctx(1n), [ext(1n, 1, connect)]).state;
    const result = applyIntentDoor(state, ctx(2n), [
      ext(2n, 2, { verb: PlayerVerb.DisconnectDrain, edgeId: asEntityId("edge:control:edge->origin") }),
    ]);
    expect(result.state.board?.edges.size).toBe(0);
    expect(result.state.board?.version).toBe(2);
  });

  it("configure-node mutates NodeRecord fields copy-on-write", () => {
    const state = baseState();
    const args: PlayerVerbArgs = {
      verb: PlayerVerb.ConfigureNode,
      nodeId: IDS.edge,
      inspectionDepth: "challenge",
      shedOrder: null,
    };
    const result = applyIntentDoor(state, ctx(1n), [ext(1n, 1, args)]);
    expect(result.state.nodes.get(IDS.edge)?.inspectionDepth).toBe("challenge");
    expect(result.state.nodes.get(IDS.edge)).not.toBe(state.nodes.get(IDS.edge));
  });

  it("policy-card-commit appends the hash-resolved card and folds the book hash (M3)", () => {
    const config: IntentDoorConfig = { lookupPolicyCard: (h) => (h === CARD_HASH ? CARD : null) };
    const args: PlayerVerbArgs = { verb: PlayerVerb.PolicyCardCommit, cardHash: CARD_HASH };
    const result = applyIntentDoor(baseState(), ctx(1n), [ext(1n, 1, args)], config);
    expect(result.state.ruleBook.length).toBe(1);
    expect(result.state.ruleBookHash).toBe(SINGLE_CARD_FOLD);
  });

  it("shed-load is directive-only: event emitted, nodes untouched by reference", () => {
    const state = baseState();
    const args: PlayerVerbArgs = { verb: PlayerVerb.ShedLoad, nodeId: IDS.edge, qosClassId: "bronze" };
    const result = applyIntentDoor(state, ctx(1n), [ext(1n, 1, args)]);
    expect(outcomeOf(result, 1)).toBe("executed");
    expect(result.state.nodes).toBe(state.nodes); // zero structural mutation for directive verbs
    const event = result.events[0];
    if (event?.kind !== "intent-executed") throw new Error("expected executed event");
    expect(event.detail).toBe(`node=${IDS.edge},qos=bronze`);
  });

  it("communicate emits with a note and spends a hand", () => {
    const args: PlayerVerbArgs = { verb: PlayerVerb.Communicate, target: null, note: "degraded — investigating" };
    const result = applyIntentDoor(baseState(), ctx(1n), [ext(1n, 1, args)]);
    expect(outcomeOf(result, 1)).toBe("executed");
    expect(result.state.hands?.tokens[0]?.busyCauseId).not.toBeNull();
  });

  it("toggle-speed costs nothing and materializes no hands", () => {
    const state = createInitialState({
      runSeed: asRunSeed(7n),
      engineVersion: "test-door",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
      clocks: initialClocks(),
      nodes: [node(IDS.edge, { slots: 1 })],
    });
    expect(state.hands).toBeUndefined();
    const result = applyIntentDoor(state, ctx(1n), [
      ext(1n, 1, { verb: PlayerVerb.ToggleSpeed, speedX: 2 }),
    ]);
    expect(outcomeOf(result, 1)).toBe("executed");
    expect(result.state).toBe(state); // zero-mutation verb on an unchanged rail
    expect(result.state.hands).toBeUndefined();
  });
});

/* ═══════════════════════════ refusals (each verb, loud) ═══════════════════════════ */

describe("door refuses bad payloads with deterministic events", () => {
  it("place-device: duplicate node id, empty kind, validator rejection", () => {
    const state = baseState();
    const dup = applyIntentDoor(state, ctx(1n), [ext(1n, 1, { ...OPEN_ARGS, nodeId: IDS.edge })]);
    expect(refused(dup, 1)).toMatch(/^node-exists:/);
    const emptyKind = applyIntentDoor(state, ctx(1n), [ext(1n, 2, { ...OPEN_ARGS, deviceKind: "" })]);
    expect(refused(emptyKind, 2)).toBe("empty-device-kind");
    const policed = applyIntentDoor(state, ctx(1n), [ext(1n, 3, OPEN_ARGS)], {
      canPlaceDevice: () => ({ reason: "no U-space in rack 3" }),
    });
    expect(refused(policed, 3)).toBe("placement-rejected: no U-space in rack 3");
  });

  it("the placement validator sees devices placed EARLIER the same tick", () => {
    const seenSizes: number[] = [];
    const config: IntentDoorConfig = {
      canPlaceDevice: (q) => {
        seenSizes.push(q.state.nodes.size);
        return null;
      },
    };
    applyIntentDoor(
      baseState(),
      ctx(1n),
      [ext(1n, 1, OPEN_ARGS), ext(1n, 2, { ...OPEN_ARGS, nodeId: asEntityId("cache-2") })],
      config,
    );
    expect(seenSizes).toEqual([3, 4]); // base board has 3; first place counts toward second
  });

  it("connect-ports: unknown nodes, self-edge, bad relation, slot rules", () => {
    const state = baseState();
    const r1 = applyIntentDoor(state, ctx(1n), [
      ext(1n, 1, { verb: PlayerVerb.ConnectPorts, relation: "data", from: IDS.edge, to: asEntityId("ghost"), slot: null }),
    ]);
    expect(refused(r1, 1)).toMatch(/^unknown-node:/);
    const r2 = applyIntentDoor(state, ctx(1n), [
      ext(1n, 2, { verb: PlayerVerb.ConnectPorts, relation: "data", from: IDS.edge, to: IDS.edge, slot: null }),
    ]);
    expect(refused(r2, 2)).toMatch(/^self-edge:/);
    const r3 = applyIntentDoor(state, ctx(1n), [
      ext(1n, 3, { verb: PlayerVerb.ConnectPorts, relation: "fiberglass" as never, from: IDS.edge, to: IDS.origin, slot: null }),
    ]);
    expect(refused(r3, 3)).toMatch(/^bad-relation:/);
    const r4 = applyIntentDoor(state, ctx(1n), [
      ext(1n, 4, { verb: PlayerVerb.ConnectPorts, relation: "power", from: IDS.edge, to: IDS.origin, slot: null }),
    ]);
    expect(refused(r4, 4)).toBe("power-needs-slot");
    const r5 = applyIntentDoor(state, ctx(1n), [
      ext(1n, 5, { verb: PlayerVerb.ConnectPorts, relation: "data", from: IDS.edge, to: IDS.origin, slot: "psu1" }),
    ]);
    expect(refused(r5, 5)).toMatch(/^slot-only-for-power:/);
  });

  it("connect-ports power: duplicate edge refused; fresh socket legal", () => {
    const feed: PlayerVerbArgs = { verb: PlayerVerb.ConnectPorts, relation: "power", from: IDS.edge, to: IDS.origin, slot: "psu1" };
    const first = applyIntentDoor(baseState(), ctx(1n), [ext(1n, 1, feed)]);
    expect(outcomeOf(first, 1)).toBe("executed");
    const again = applyIntentDoor(first.state, ctx(5n), [ext(5n, 2, feed)]); // same edge → edge-exists
    expect(refused(again, 2)).toMatch(/^edge-exists:/);
    const secondSlot = applyIntentDoor(first.state, ctx(5n), [
      ext(5n, 3, { verb: PlayerVerb.ConnectPorts, relation: "power", from: asEntityId("x"), to: IDS.origin, slot: "psu1" }),
    ]); // unknown supplier
    expect(refused(secondSlot, 3)).toMatch(/^unknown-node:/);
  });

  it("connect-ports power refuses cycles (to already feeds from) but not fan-out", () => {
    const mk = (from: EntityId, to: EntityId, slot: string): PlayerVerbArgs => ({
      verb: PlayerVerb.ConnectPorts,
      relation: "power",
      from,
      to,
      slot,
    });
    // Build the chain dns→edge→origin over three ticks (2 hands, occupancy 3).
    let state = baseState();
    state = applyIntentDoor(state, ctx(1n), [ext(1n, 1, mk(IDS.dns, IDS.edge, "out1"))]).state;
    state = applyIntentDoor(state, ctx(4n), [ext(4n, 2, mk(IDS.edge, IDS.origin, "psu1"))]).state;
    // origin→dns would close the loop: dns is upstream of origin.
    const cycle = applyIntentDoor(state, ctx(7n), [ext(7n, 3, mk(IDS.origin, IDS.dns, "in1"))]);
    expect(refused(cycle, 3)).toMatch(/^power-cycle:/);
    // dns→origin on a fresh socket reuses no chain (dns has no suppliers) —
    // legal redundancy, NOT a cycle.
    const fan = applyIntentDoor(state, ctx(7n), [ext(7n, 4, mk(IDS.dns, IDS.origin, "psu2"))]);
    expect(outcomeOf(fan, 4)).toBe("executed");
  });

  it("disconnect-drain refuses unknown edges; configure-node refuses junk fields", () => {
    const state = baseState();
    const r1 = applyIntentDoor(state, ctx(1n), [
      ext(1n, 1, { verb: PlayerVerb.DisconnectDrain, edgeId: asEntityId("edge:nope") }),
    ]);
    expect(refused(r1, 1)).toMatch(/^unknown-edge:/);
    const r2 = applyIntentDoor(state, ctx(1n), [
      ext(1n, 2, { verb: PlayerVerb.ConfigureNode, nodeId: IDS.edge, inspectionDepth: null, shedOrder: null }),
    ]);
    expect(refused(r2, 2)).toMatch(/^no-fields:/);
    const r3 = applyIntentDoor(state, ctx(1n), [
      ext(1n, 3, { verb: PlayerVerb.ConfigureNode, nodeId: IDS.edge, inspectionDepth: "laser-eyes" as never, shedOrder: null }),
    ]);
    expect(refused(r3, 3)).toMatch(/^bad-inspection-depth:/);
    const r4 = applyIntentDoor(state, ctx(1n), [
      ext(1n, 4, { verb: PlayerVerb.ConfigureNode, nodeId: asEntityId("ghost"), inspectionDepth: "inspect", shedOrder: null }),
    ]);
    expect(refused(r4, 4)).toMatch(/^unknown-node:/);
  });

  it("policy-card-commit: missing lookup, unknown hash, duplicate id", () => {
    const state = baseState();
    const noLookup = applyIntentDoor(state, ctx(1n), [
      ext(1n, 1, { verb: PlayerVerb.PolicyCardCommit, cardHash: CARD_HASH }),
    ]);
    expect(refused(noLookup, 1)).toMatch(/^no-card-lookup:/);
    const unknown = applyIntentDoor(state, ctx(1n), [
      ext(1n, 2, { verb: PlayerVerb.PolicyCardCommit, cardHash: "ff00" }),
    ], { lookupPolicyCard: () => null });
    expect(refused(unknown, 2)).toMatch(/^unknown-card-hash:/);
    const lookup: IntentDoorConfig = { lookupPolicyCard: (h) => (h === CARD_HASH ? CARD : null) };
    const committed = applyIntentDoor(state, ctx(1n), [
      ext(1n, 3, { verb: PlayerVerb.PolicyCardCommit, cardHash: CARD_HASH }),
    ], lookup).state;
    const again = applyIntentDoor(committed, ctx(5n), [
      ext(5n, 4, { verb: PlayerVerb.PolicyCardCommit, cardHash: CARD_HASH }),
    ], lookup);
    expect(refused(again, 4)).toMatch(/^card-id-collision:/);
  });

  it("shed-load / communicate / toggle-speed refuse semantic junk", () => {
    const state = baseState();
    const r1 = applyIntentDoor(state, ctx(1n), [
      ext(1n, 1, { verb: PlayerVerb.ShedLoad, nodeId: asEntityId("ghost"), qosClassId: null }),
    ]);
    expect(refused(r1, 1)).toMatch(/^unknown-node:/);
    const r2 = applyIntentDoor(state, ctx(1n), [
      ext(1n, 2, { verb: PlayerVerb.Communicate, target: null, note: "" }),
    ]);
    expect(refused(r2, 2)).toBe("empty-note");
    const r3 = applyIntentDoor(state, ctx(1n), [
      ext(1n, 3, { verb: PlayerVerb.Communicate, target: asEntityId("ghost"), note: "hello" }),
    ]);
    expect(refused(r3, 3)).toMatch(/^unknown-node:/);
    const r4 = applyIntentDoor(state, ctx(1n), [
      ext(1n, 4, { verb: PlayerVerb.ToggleSpeed, speedX: 3 as never }),
    ]);
    expect(refused(r4, 4)).toMatch(/^bad-speed:/);
  });

  it("legacy rule-verb and slider carriers are refused, never executed", () => {
    const legacyCarrier = {
      tick: 1n,
      intent: {
        seq: 10,
        clock: "sim" as const,
        atUs: MIN,
        origin: "rule" as const,
        payload: { kind: "verb" as const, verb: "scale-out", target: IDS.edge, value: null },
      },
    };
    const sliderCarrier = {
      tick: 1n,
      intent: {
        seq: 11,
        clock: "sim" as const,
        atUs: MIN,
        origin: "player" as const,
        payload: { kind: "slider" as const, control: "aggression", value: 1n },
      },
    };
    const result = applyIntentDoor(baseState(), ctx(1n), [
      legacyCarrier,
      sliderCarrier,
      ext(1n, 9, { verb: PlayerVerb.ConfigureNode, nodeId: IDS.edge, inspectionDepth: "inspect", shedOrder: null }),
    ]);
    expect(refused(result, 10)).toMatch(/^unsupported-verb-carrier:/);
    expect(result.receipts.find((r) => r.seq === 10)?.verb).toBe("verb:scale-out");
    expect(result.receipts.find((r) => r.seq === 11)?.verb).toBe("slider:aggression");
    // (tick,seq) sort put the door-arm entry (seq 9) FIRST:
    expect(result.receipts[0]?.seq).toBe(9);
    expect(result.receipts[0]?.outcome).toBe("executed");
  });

  it("structural wire garbage THROWS IntentDoorError (fail-fast boundary)", () => {
    const state = baseState();
    expect(() =>
      applyIntentDoor(state, ctx(1n), [
        { tick: 1, intent: { seq: 1, clock: "sim", atUs: MIN, origin: "player", payload: { kind: "player-verb", args: OPEN_ARGS } } } as never,
      ]),
    ).toThrow(IntentDoorError);
    expect(() =>
      applyIntentDoor(state, ctx(1n), [
        {
          tick: 1n,
          intent: { seq: 1, clock: "sim", atUs: MIN, origin: "player", payload: { kind: "player-verb", args: { verb: "teleport" } } },
        } as never,
      ]),
    ).toThrow(/not a PlayerVerb/);
  });

  it("a refused handler refunds its hand reservation", () => {
    const result = applyIntentDoor(baseState(), ctx(1n), [
      ext(1n, 1, { verb: PlayerVerb.ConfigureNode, nodeId: asEntityId("ghost"), inspectionDepth: "inspect", shedOrder: null }),
    ]);
    expect(refused(result, 1)).toMatch(/^unknown-node:/);
    for (const token of result.state.hands?.tokens ?? []) {
      expect(token.busyCauseId).toBeNull(); // nothing was spent
    }
  });

  it("all-refused with nothing due keeps GameState identity AND digest", () => {
    const state = baseState();
    const result = applyIntentDoor(state, ctx(1n), [
      ext(1n, 1, { verb: PlayerVerb.ShedLoad, nodeId: asEntityId("ghost"), qosClassId: null }),
    ]);
    expect(result.state).toBe(state);
    expect(digestState(result.state)).toBe(digestState(state));
  });

  // Round-3 review: contract #10's 26-code census had FOUR codes with no
  // execution-or-refusal pin anywhere. This test closes the census — the
  // six guard codes that emit BARE (no ": detail" rider) are asserted with
  // exact-match toBe so the census wording can stay machine-honest.
  it("census completeness — empty-node-id, empty-slot, bad-shed-order, empty-card-hash refuse", () => {
    const state = baseState();
    const emptyId = applyIntentDoor(state, ctx(1n), [
      // "" as EntityId BYPASSING the branded constructor — exactly what a raw
      // wire feed (JSON-replayed bundle) can carry: the door's parseEntry
      // checks the TYPE, the handler refuses the VALUE with a bare code.
      ext(1n, 1, { ...OPEN_ARGS, nodeId: "" as EntityId }),
    ]);
    expect(refused(emptyId, 1)).toBe("empty-node-id");
    const emptySlot = applyIntentDoor(state, ctx(1n), [
      ext(1n, 2, { verb: PlayerVerb.ConnectPorts, relation: "data", from: IDS.edge, to: IDS.origin, slot: "" }),
    ]);
    expect(refused(emptySlot, 2)).toBe("empty-slot"); // the empty check PRECEDES the slot-ownership rules
    const badShed = applyIntentDoor(state, ctx(1n), [
      ext(1n, 3, { verb: PlayerVerb.ConfigureNode, nodeId: IDS.edge, inspectionDepth: null, shedOrder: "random" as never }),
    ]);
    expect(refused(badShed, 3)).toBe('bad-shed-order: "random"');
    const emptyHash = applyIntentDoor(state, ctx(1n), [
      ext(1n, 4, { verb: PlayerVerb.PolicyCardCommit, cardHash: "" }),
    ]);
    expect(refused(emptyHash, 4)).toBe("empty-card-hash"); // guard runs BEFORE the host lookup
    // every refusal above spends nothing:
    for (const result of [emptyId, emptySlot, badShed, emptyHash]) {
      for (const token of result.state.hands?.tokens ?? []) {
        expect(token.busyCauseId).toBeNull();
      }
    }
  });
});

/* ═══════════════════════════ ordering + hands + pause ═══════════════════════════ */

describe("canonical ordering, hands exhaustion, pause-with-orders", () => {
  it("due entries apply in (tick, seq) order regardless of feed order", () => {
    const result = applyIntentDoor(baseState(), ctx(2n), [
      ext(2n, 5, { verb: PlayerVerb.ToggleSpeed, speedX: 1 }),
      ext(1n, 2, { verb: PlayerVerb.ToggleSpeed, speedX: 2 }),
      ext(1n, 7, { verb: PlayerVerb.ToggleSpeed, speedX: 4 }),
    ]);
    expect(result.receipts.map((r) => `${r.submittedTick}/${r.seq}`)).toEqual(["1/2", "1/7", "2/5"]);
  });

  it("hands exhaustion blocks the third concurrent action; tokens return at the boundary", () => {
    const place = (id: string, seq: number): ExternalIntent =>
      ext(1n, seq, { verb: PlayerVerb.PlaceDevice, nodeId: asEntityId(id), deviceKind: "cache", template: null });
    const firstPass = applyIntentDoor(baseState(), ctx(1n), [place("a-1", 1), place("a-2", 2), place("a-3", 3)]);
    expect(outcomeOf(firstPass, 1)).toBe("executed");
    expect(outcomeOf(firstPass, 2)).toBe("executed");
    expect(refused(firstPass, 3)).toMatch(/^hands-exhausted: need 1, free 0 of 2/);
    // place-device occupancy = 3 ticks → busyUntil 4; still busy at tick 3.
    const configure = (tick: SimTick, seq: number): ExternalIntent =>
      ext(tick, seq, { verb: PlayerVerb.ConfigureNode, nodeId: IDS.edge, inspectionDepth: "inspect", shedOrder: null });
    const stillBusy = applyIntentDoor(firstPass.state, ctx(3n), [configure(3n, 4)]);
    expect(refused(stillBusy, 4)).toMatch(/^hands-exhausted:/);
    expect(stillBusy.state).toBe(firstPass.state); // exhausted refusal: zero state churn
    const released = applyIntentDoor(stillBusy.state, ctx(4n), [configure(4n, 5)]);
    expect(outcomeOf(released, 5)).toBe("executed"); // busyUntil 4n <= 4n → token returned
    const busy = released.state.hands?.tokens.filter((t) => t.busyCauseId !== null) ?? [];
    expect(busy.length).toBe(1); // exactly the fresh reservation
    expect(busy[0]?.busyUntilTick).toBe(5n); // 4 + configure occupancy (1)
  });

  it("pause-with-orders: paused-tick stamps apply on the resume tick, ordered", () => {
    const config = testConfig({});
    const slots = createDefaultSlots(config);
    let state = createInitialState({
      runSeed: config.runSeed,
      engineVersion: "test-pause",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
      clocks: initialClocks(),
      nodes: [node(IDS.edge, { slots: 2 }), node(IDS.origin, { slots: 1 })],
      handCapacity: 4,
      board: createBoardState(),
    });
    const driver = createTickDriver(slots, streamFor(config.runSeed, "root", 0), state.context.clocks);
    // two live ticks (advance #1 → tick 1n, #2 → tick 2n)…
    for (let t = 1; t <= 2; t += 1) {
      state = driver.advance(state, tickInputs({ envelopes: [], dependencyEdges: [], retryPolicy: retryPolicy(0, 0n) })).state;
    }
    // …PAUSE: orders are stamped 1 and 2 while frozen (submission ticks)…
    // …UNPAUSE at advance #3 (resume tick 3n): the whole queue is fed at once.
    const connect: PlayerVerbArgs = { verb: PlayerVerb.ConnectPorts, relation: "data", from: IDS.edge, to: IDS.origin, slot: null };
    const configure: PlayerVerbArgs = { verb: PlayerVerb.ConfigureNode, nodeId: IDS.origin, inspectionDepth: "inspect", shedOrder: null };
    const result = driver.advance(
      state,
      tickInputs({
        envelopes: [],
        dependencyEdges: [],
        retryPolicy: retryPolicy(0, 0n),
        externalIntents: [ext(2n, 2, configure), ext(1n, 1, connect)], // fed out of order
      }),
    );
    expect(result.doorReceipts.map((r) => r.outcome)).toEqual(["executed", "executed"]);
    expect(result.doorReceipts.map((r) => r.submittedTick)).toEqual([1n, 2n]);
    const executed = result.events.filter((e) => e.kind === "intent-executed");
    expect(executed.map((e) => (e.kind === "intent-executed" ? e.intentSeq : -1))).toEqual([1, 2]);
    expect(new Set(executed.map((e) => e.tick))).toEqual(new Set([3n])); // all at the RESUME tick
    expect(result.events[0]?.kind).toBe("intent-executed"); // door events LEAD (before step 1)
  });

  it("future-stamped entries refuse loudly instead of smearing across ticks", () => {
    const state = baseState();
    const result = applyIntentDoor(state, ctx(2n), [ext(9n, 1, { verb: PlayerVerb.ToggleSpeed, speedX: 2 })]);
    expect(refused(result, 1)).toMatch(/^stamped-in-future:/);
    expect(result.state).toBe(state);
  });

  it("accepts replay StampedIntent-shaped entries (extras sidecar ignored)", () => {
    const stampedLike = {
      tick: 1n,
      intent: { seq: 1, clock: "sim" as const, atUs: MIN, origin: "player" as const, payload: { kind: "player-verb" as const, args: OPEN_ARGS } },
      extras: { note: "from the replay bundle writer" },
    };
    const result = applyIntentDoor(baseState(), ctx(1n), [stampedLike]);
    expect(outcomeOf(result, 1)).toBe("executed");
  });
});

/* ═══════════════════════════ ground-truth audit ═══════════════════════════ */

describe("door scope audit — handlers touch ONLY their named slices", () => {
  it("execution never mutates units/lanes/observed/cash/contracts; context is stamped with this pass (W1)", () => {
    const state = baseState(5); // five hands: all five intents execute same-tick
    const connect: PlayerVerbArgs = { verb: PlayerVerb.ConnectPorts, relation: "trust", from: IDS.edge, to: IDS.origin, slot: null };
    const pass = ctx(1n);
    const result = applyIntentDoor(state, pass, [
      ext(1n, 1, OPEN_ARGS), // → nodes
      ext(1n, 2, connect), // → board
      ext(1n, 3, { verb: PlayerVerb.ConfigureNode, nodeId: IDS.edge, inspectionDepth: null, shedOrder: "lowest-value-first" }), // → nodes
      ext(1n, 4, { verb: PlayerVerb.PolicyCardCommit, cardHash: CARD_HASH }), // → ruleBook + hash
      ext(1n, 5, { verb: PlayerVerb.Communicate, target: null, note: "all clear" }), // → hands + event only
    ], { lookupPolicyCard: (h) => (h === CARD_HASH ? CARD : null) });
    expect(result.receipts.every((r) => r.outcome === "executed")).toBe(true);
    expect(result.state.units).toBe(state.units);
    expect(result.state.lanes).toBe(state.lanes);
    expect(result.state.observed).toBe(state.observed);
    expect(result.state.cash).toBe(state.cash);
    expect(result.state.contracts).toBe(state.contracts);
    // W1: context is NOT an owned slice — the door never mutates the ORIGIN's
    // object — but every state it returns is stamped with THIS pass's fresh
    // TickContext (single source shared with validator snapshots).
    expect(result.state.context).toBe(pass);
    expect(state.context.tick).toBe(0n); // origin context never rewritten
    expect(result.state.context).not.toBe(state.context);
    expect(result.state.ledgerSeq).toBe(state.ledgerSeq);
    expect(result.state.runSeed).toBe(state.runSeed);
    expect(result.state.engineVersion).toBe(state.engineVersion);
    expect(result.state.contentHashes).toBe(state.contentHashes);
    // …and the slices it DOES own actually changed:
    expect(result.state.nodes).not.toBe(state.nodes);
    expect(result.state.board).not.toBe(state.board);
    expect(result.state.hands).not.toBe(state.hands);
    expect(result.state.ruleBook).not.toBe(state.ruleBook);
    expect(result.state.ruleBookHash).toBe(SINGLE_CARD_FOLD);
  });

  it("untouched NodeRecords keep slot/queue identity (no queue tampering side doors)", () => {
    const state = baseState();
    const result = applyIntentDoor(state, ctx(1n), [ext(1n, 1, OPEN_ARGS)]);
    for (const [id, nodeRecord] of result.state.nodes) {
      if (id === asEntityId("cache-1")) continue;
      expect(nodeRecord.slots).toBe(state.nodes.get(id)?.slots);
      expect(nodeRecord.queue).toBe(state.nodes.get(id)?.queue);
    }
  });
});

/* ═══════════════════════ digest sensitivity of the door slices ═══════════════════════
   Round-3 review pin: contract #10 promises digest.ts absorbs hands/board — and
   ONLY when present. The driver-visible ×100 chain above proves schedules move
   the digest; this proves the SINK ITSELF reads the two slices in every absorbed
   dimension (presence, token values, board content, version, sort-not-insertion)
   and that a pre-door host (no slices) stays byte-identical — both directions. */

describe("digestState absorbs hands/board ONLY when present (digest-switch law)", () => {
  function handsVariant(busyUntilTick: SimTick, busyCauseId: CauseId | null): HandState {
    return Object.freeze({
      capacity: 2,
      tokens: Object.freeze([
        Object.freeze({ index: 0, busyUntilTick: 0n, busyCauseId: null as CauseId | null }),
        Object.freeze({ index: 1, busyUntilTick, busyCauseId }),
      ]),
    });
  }

  function stateWith(hands: HandState, board: BoardState): GameState {
    return createInitialState({
      runSeed: asRunSeed(7n),
      engineVersion: "test-digest-slices",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
      clocks: initialClocks(),
      nodes: [node(IDS.edge, { slots: 1 })],
      hands,
      board,
    });
  }

  function edge(id: string, relation: BoardRelation, from: string, to: string, slot: string | null): BoardEdgeRecord {
    return { id: asEntityId(id), relation, from: asEntityId(from), to: asEntityId(to), slot };
  }

  it("mutating a hand token's busyUntilTick or busyCauseId changes the digest", () => {
    const quiet = digestState(stateWith(handsVariant(0n, null), createBoardState()));
    const busyLater = digestState(stateWith(handsVariant(9n, null), createBoardState()));
    const busyCaused = digestState(stateWith(handsVariant(0n, asCauseId("intent:1")), createBoardState()));
    expect(busyLater).not.toBe(quiet);
    expect(busyCaused).not.toBe(quiet);
    // stable identity across ×100 (the sink is a pure function of the state):
    for (let run = 0; run < 100; run += 1) {
      expect(digestState(stateWith(handsVariant(9n, null), createBoardState()))).toBe(busyLater);
    }
  });

  it("a board edge's presence, fields, and the version all move the digest; insertion order never leaks", () => {
    const bare = digestState(stateWith(handsVariant(0n, null), createBoardState()));
    const withEdge = digestState(
      stateWith(handsVariant(0n, null), createBoardState([edge("edge:data:web-1->sw-1", "data", "web-1", "sw-1", null)])),
    );
    expect(withEdge).not.toBe(bare);
    // same content, opposite seed order — createBoardState sorts by id:
    const ab = digestState(stateWith(handsVariant(0n, null), createBoardState([
      edge("edge:data:a->c", "data", "a", "c", null),
      edge("edge:data:b->c", "data", "b", "c", null),
    ])));
    const ba = digestState(stateWith(handsVariant(0n, null), createBoardState([
      edge("edge:data:b->c", "data", "b", "c", null),
      edge("edge:data:a->c", "data", "a", "c", null),
    ])));
    expect(ab).toBe(ba);
    // version bump alone (no content) is absorbed too:
    const quietBoard = createBoardState();
    const versioned = stateWith(handsVariant(0n, null), quietBoard);
    const bumped = Object.freeze({ ...versioned, board: Object.freeze({ version: 1, edges: quietBoard.edges }) });
    expect(digestState(bumped)).not.toBe(digestState(versioned));
    for (let run = 0; run < 100; run += 1) expect(digestState(bumped)).not.toBe(bare);
  });

  it("a state WITHOUT the slices digests byte-identically to the same shape stripped of them (both directions)", () => {
    const preDoor = createInitialState({
      runSeed: asRunSeed(7n),
      engineVersion: "test-digest-slices",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
      clocks: initialClocks(),
      nodes: [node(IDS.edge, { slots: 1 })],
    });
    expect(preDoor.hands).toBeUndefined();
    expect(preDoor.board).toBeUndefined();
    const withDoor = createInitialState({
      runSeed: asRunSeed(7n),
      engineVersion: "test-digest-slices",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
      clocks: initialClocks(),
      nodes: [node(IDS.edge, { slots: 1 })],
      handCapacity: 2,
      board: createBoardState(),
    });
    const stripped = Object.freeze(
      Object.fromEntries(Object.entries(withDoor).filter(([key]) => key !== "hands" && key !== "board")),
    ) as GameState;
    // direction 1 — presence-neutral when absent: the digest of a door-SLICED
    // state minus its slices equals the pre-door host's digest, byte-for-byte;
    // direction 2 — the slices are NOT invisible: keeping them diverges.
    expect(digestState(stripped)).toBe(digestState(preDoor));
    expect(digestState(withDoor)).not.toBe(digestState(preDoor));
    for (let run = 0; run < 100; run += 1) {
      expect(digestState(preDoor)).toBe(digestState(stripped));
    }
  });
});

/* ═══════════════════════════ ×100 determinism through the driver ═══════════════════════════ */

describe("intent door ×100 determinism (RISK-1 gate)", () => {
  const SCHEDULE: Readonly<Record<number, readonly ExternalIntent[]>> = {
    2: [
      ext(2n, 1, OPEN_ARGS), // executed (hand 0 → busyUntil 5)
      ext(2n, 2, { verb: PlayerVerb.ConnectPorts, relation: "data", from: asEntityId("cache-1"), to: IDS.origin, slot: null }), // executed (hand 1 → busyUntil 5)
      ext(2n, 3, { verb: PlayerVerb.DisconnectDrain, edgeId: asEntityId("edge:ghost") }), // refused hands-exhausted (capacity 2)
    ],
    3: [
      ext(3n, 4, { verb: PlayerVerb.ConfigureNode, nodeId: IDS.edge, inspectionDepth: "sample-1-in-20", shedOrder: null }), // refused hands-exhausted
    ],
    5: [
      ext(5n, 5, { verb: PlayerVerb.ToggleSpeed, speedX: 4 }), // free verb executes while… (tokens due at 5n — released first)
      ext(5n, 6, { verb: PlayerVerb.Communicate, target: null, note: "" }), // refused empty-note
    ],
    9: [
      ext(9n, 7, { verb: PlayerVerb.PolicyCardCommit, cardHash: "unknown-hash" }), // refused unknown-card-hash
    ],
  };

  function runWithIntents(seed: bigint, schedule: Record<number, readonly ExternalIntent[]>): readonly string[] {
    const config = testConfig({ runSeed: asRunSeed(seed) });
    const slots = createDefaultSlots(config);
    let state = createInitialState({
      runSeed: config.runSeed,
      engineVersion: "test-door-determinism",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
      clocks: initialClocks(),
      nodes: [
        node(IDS.edge, { slots: 2, serviceUs: 2n * MIN, dep: IDS.origin }),
        node(IDS.origin, { slots: 1 }),
      ],
      handCapacity: 2,
      board: createBoardState(),
    });
    const driver = createTickDriver(
      slots,
      streamFor(config.runSeed, "root", 0),
      state.context.clocks,
      { intents: { lookupPolicyCard: (h) => (h === CARD_HASH ? CARD : null) } },
    );
    const digests: string[] = [];
    for (let t = 1; t <= 12; t += 1) {
      state = driver.advance(
        state,
        tickInputs({
          envelopes: [envelope("base", fromInt(2), "organic")],
          evidence: [],
          dependencyEdges: [],
          retryPolicy: retryPolicy(0, 0n),
          externalIntents: schedule[t] ?? [],
        }),
      ).state;
      digests.push(digestState(state));
    }
    return digests;
  }

  it("100 replays of seed 7 + the same intent schedule produce identical digest chains", () => {
    const chain = runWithIntents(7n, SCHEDULE).join("|");
    for (let run = 0; run < 100; run += 1) {
      expect(runWithIntents(7n, SCHEDULE).join("|")).toBe(chain);
    }
  }, 120_000);

  it("a changed intent schedule changes the digests (the door is state-visible)", () => {
    const baseline = runWithIntents(7n, SCHEDULE).join("|");
    const emptied = runWithIntents(7n, {}).join("|");
    expect(emptied).not.toBe(baseline);
  });

  it("refusal-only schedules are state-neutral: same digests as no door feed at all", () => {
    const onlyRefusals: Record<number, readonly ExternalIntent[]> = {
      2: [ext(2n, 1, { verb: PlayerVerb.DisconnectDrain, edgeId: asEntityId("edge:ghost") })],
      4: [ext(4n, 2, { verb: PlayerVerb.ToggleSpeed, speedX: 8 as never })],
    };
    const chain = runWithIntents(7n, onlyRefusals).join("|");
    expect(chain).toBe(runWithIntents(7n, {}).join("|"));
    expect(chain).toBe(runWithIntents(7n, onlyRefusals).join("|"));
  });
});

/* ═══════════════════════════ door state constructors ═══════════════════════════ */

describe("door state constructors", () => {
  it("mintHandState pins capacity/indices; rejects junk", () => {
    const hands = mintHandState(3);
    expect(hands.tokens.map((t) => t.index)).toEqual([0, 1, 2]);
    expect(hands.tokens.every((t) => t.busyCauseId === null)).toBe(true);
    expect(() => mintHandState(0)).toThrow(IntentDoorError);
    expect(() => mintHandState(1.5)).toThrow(IntentDoorError);
  });

  it("createBoardState sorts seed edges by id (insertion order never leaks)", () => {
    const b = asEntityId("edge:data:b->c");
    const a = asEntityId("edge:data:a->c");
    const board = createBoardState([
      { id: b, relation: "data", from: asEntityId("b"), to: asEntityId("c"), slot: null },
      { id: a, relation: "data", from: asEntityId("a"), to: asEntityId("c"), slot: null },
    ]);
    expect([...board.edges.keys()]).toEqual([a, b]);
  });
});

/* ═══════════ M2 — type-vs-domain split-brain resolved at the boundary ═══════════
 * Round-3 review: pre-M2, `place-device` with nodeId:42 THREW while
 * toggle-speed with speedX:"2" REFUSED `bad-speed`, and communicate with
 * note:[] refused `empty-note` (the .length read preceded the type check).
 * One law now: primitive TYPE mismatch (stamp fields, per-verb arg shapes,
 * missing keys) is structural wire garbage → IntentDoorError parsed in
 * parseEntry; the VALUE domain (out-of-set numbers, empty strings, unknown
 *  ids) stays the handlers' 32-code refusal space, census untouched. */

describe("M2 — wire arg types parse at the boundary (throw); values refuse", () => {
  const feed = (args: unknown) =>
    applyIntentDoor(baseState(5), ctx(1n), [ext(1n, 1, args as PlayerVerbArgs)]);

  function expectStructural(args: unknown, messagePart: string): void {
    expect(() => feed(args)).toThrow(IntentDoorError);
    expect(() => feed(args)).toThrow(messagePart);
  }

  it("string-typed arg fields reject numbers, per verb", () => {
    expectStructural({ verb: PlayerVerb.PlaceDevice, nodeId: 42, deviceKind: "cache", template: null }, "args.nodeId: expected string, got number");
    expectStructural({ verb: PlayerVerb.ConnectPorts, relation: "data", from: 5, to: IDS.origin, slot: null }, "args.from: expected string, got number");
    expectStructural({ verb: PlayerVerb.DisconnectDrain, edgeId: 1 }, "args.edgeId: expected string, got number");
    expectStructural({ verb: PlayerVerb.ConfigureNode, nodeId: {}, inspectionDepth: "inspect", shedOrder: null }, "args.nodeId: expected string, got object");
    expectStructural({ verb: PlayerVerb.PolicyCardCommit, cardHash: 99 }, "args.cardHash: expected string, got number");
    expectStructural({ verb: PlayerVerb.ShedLoad, nodeId: IDS.edge, qosClassId: 5 }, "args.qosClassId: expected string, got number");
    expectStructural({ verb: PlayerVerb.Communicate, target: 5, note: "ok" }, "args.target: expected string, got number");
  });

  it("speedX flips from refusal to throw when the WIRE TYPE is wrong (headline M2 case)", () => {
    // "2" would be a legal speed were it a number — coercion is NOT the door's job.
    expectStructural({ verb: PlayerVerb.ToggleSpeed, speedX: "2" }, "args.speedX: expected number, got string");
    expect(outcomeOf(feed({ verb: PlayerVerb.ToggleSpeed, speedX: 2 }), 1)).toBe("executed");
  });

  it("array-vs-string garbage throws BEFORE any .length semantics (communicate note case)", () => {
    expectStructural({ verb: PlayerVerb.Communicate, target: null, note: [] }, "args.note: expected string, got object");
    expectStructural({ verb: PlayerVerb.PlaceDevice, nodeId: "cache-9", deviceKind: ["cache"], template: null }, "args.deviceKind: expected string, got object");
  });

  it("missing key is structural garbage too, distinct in message from wrong type; declared nulls stay legal", () => {
    expectStructural({ verb: PlayerVerb.PlaceDevice, deviceKind: "cache", template: null }, "args.nodeId: expected string, got undefined");
    expectStructural({ verb: PlayerVerb.ToggleSpeed }, "args.speedX: expected number, got undefined");
    // null is legal ONLY in declared-nullable fields:
    expectStructural({ verb: PlayerVerb.ToggleSpeed, speedX: null }, "args.speedX: expected number, got object");
    expectStructural({ verb: PlayerVerb.PlaceDevice, nodeId: null, deviceKind: "cache", template: null }, "args.nodeId: expected string, got object");
    expect(outcomeOf(feed(OPEN_ARGS), 1)).toBe("executed"); // template: null sentinel parses fine
    expect(outcomeOf(feed({ verb: PlayerVerb.ConfigureNode, nodeId: IDS.edge, inspectionDepth: "inspect", shedOrder: null }), 1)).toBe("executed");
  });

  it("value-domain junk still REFUSES — the 32-code census is untouched by M2", () => {
    expect(refused(feed({ verb: PlayerVerb.ToggleSpeed, speedX: 2.5 }), 1)).toBe("bad-speed: 2.5 not in {1,2,4}");
    expect(refused(feed({ verb: PlayerVerb.ToggleSpeed, speedX: NaN }), 1)).toBe("bad-speed: NaN not in {1,2,4}");
    expect(refused(feed({ verb: PlayerVerb.ToggleSpeed, speedX: 0 }), 1)).toMatch(/^bad-speed:/);
    expect(refused(feed({ verb: PlayerVerb.Communicate, target: null, note: "" }), 1)).toBe("empty-note");
    expect(refused(feed({ verb: PlayerVerb.PolicyCardCommit, cardHash: "" }), 1)).toBe("empty-card-hash");
    expect(refused(feed({ verb: PlayerVerb.DisconnectDrain, edgeId: "nope" }), 1)).toMatch(/^unknown-edge:/);
  });
});

/* ═══════════════════ M4 — feed uniqueness of (tick, seq) stamps ═══════════════════ */

describe("M4 — one (tick, seq) stamp may appear EXACTLY ONCE per feed", () => {
  it("a repeated stamp in one schedule throws naming both offending positions", () => {
    expect(() =>
      applyIntentDoor(baseState(5), ctx(1n), [
        ext(1n, 1, OPEN_ARGS),
        ext(1n, 1, { verb: PlayerVerb.ToggleSpeed, speedX: 2 }),
      ]),
    ).toThrow(/duplicate \(tick, seq\) stamp tick=1 seq=1: externalIntents\[0\] and externalIntents\[1\]/);
  });

  it("the identical entry object fed twice is garbage too (no dedup, no double-fire)", () => {
    const dup = ext(1n, 7, { verb: PlayerVerb.Communicate, target: null, note: "once" });
    expect(() => applyIntentDoor(baseState(5), ctx(1n), [dup, dup])).toThrow(IntentDoorError);
  });

  it("the same seq on DIFFERENT ticks is a legal schedule", () => {
    const first = applyIntentDoor(baseState(5), ctx(1n), [ext(1n, 1, OPEN_ARGS)]);
    const second = applyIntentDoor(first.state, ctx(2n), [
      ext(2n, 1, { verb: PlayerVerb.Communicate, target: null, note: "next tick" }),
    ]);
    expect(outcomeOf(second, 1)).toBe("executed");
  });
});

/* ═══════════════════ M3 — ruleBookHash describes the whole book ═══════════════════ */

describe("M3 — ruleBookHash is a whole-book FNV-1a-64 fold", () => {
  const CARD2: PolicyCard = { ...CARD, id: asRuleId("rule-shed-on-spike"), band: "execute", upkeepMicroUsd: asMoney(80n) };
  const CARD2_HASH = "ff00ff00";
  const lookup: IntentDoorConfig = { lookupPolicyCard: (h) => (h === CARD_HASH ? CARD : h === CARD2_HASH ? CARD2 : null) };
  const commitA: PlayerVerbArgs = { verb: PlayerVerb.PolicyCardCommit, cardHash: CARD_HASH };
  const commitB: PlayerVerbArgs = { verb: PlayerVerb.PolicyCardCommit, cardHash: CARD2_HASH };

  it("single-card fold differs from the payload hash — the field describes the BOOK, not the last payment", () => {
    const result = applyIntentDoor(baseState(3), ctx(1n), [ext(1n, 1, commitA)], lookup);
    expect(result.state.ruleBookHash).toBe(SINGLE_CARD_FOLD);
    expect(result.state.ruleBookHash).not.toBe(CARD_HASH);
  });

  it("the two-commit book hash equals NEITHER single-card fold", () => {
    const onlyA = applyIntentDoor(baseState(3), ctx(1n), [ext(1n, 1, commitA)], lookup).state.ruleBookHash;
    const onlyB = applyIntentDoor(baseState(3), ctx(1n), [ext(1n, 1, commitB)], lookup).state.ruleBookHash;
    const both = applyIntentDoor(baseState(3), ctx(1n), [ext(1n, 1, commitA), ext(1n, 2, commitB)], lookup);
    expect(both.state.ruleBook.length).toBe(2);
    expect(onlyA).toBe(SINGLE_CARD_FOLD);
    expect(onlyB).not.toBe(onlyA);
    expect(both.state.ruleBookHash).not.toBe(onlyA);
    expect(both.state.ruleBookHash).not.toBe(onlyB);
  });

  it("the same book committed in opposite order folds to the SAME hash (id-sorted fold)", () => {
    const ab = applyIntentDoor(baseState(3), ctx(1n), [ext(1n, 1, commitA), ext(1n, 2, commitB)], lookup).state;
    const ba = applyIntentDoor(baseState(3), ctx(1n), [ext(1n, 1, commitB), ext(1n, 2, commitA)], lookup).state;
    expect(ab.ruleBookHash).toBe(ba.ruleBookHash);
    // the book itself keeps commit order; only the hash is order-free:
    expect(ab.ruleBook.map((c) => c.id)).not.toEqual(ba.ruleBook.map((c) => c.id));
  });
});

/* ═══════════════ W1 — validator snapshot shares ONE fresh context ═══════════════ */

describe("W1 — canPlaceDevice sees one fresh TickContext in state and query", () => {
  it("query.state.context.tick === query.context.tick (pre-W1: PRIOR tick's state vs fresh query)", () => {
    let seen: PlaceDeviceQuery | null = null;
    const config: IntentDoorConfig = {
      canPlaceDevice: (q) => {
        seen = q;
        return null;
      },
    };
    const pass = ctx(7n); // baseState's own context is tick 0 — the stale-pair case
    const result = applyIntentDoor(baseState(3), pass, [ext(7n, 1, OPEN_ARGS)], config);
    expect(seen).not.toBeNull();
    const query = seen as unknown as PlaceDeviceQuery;
    expect(query.state.context.tick).toBe(query.context.tick);
    expect(query.state.context).toBe(pass);
    expect(query.context).toBe(pass);
    expect(result.state.context).toBe(pass); // the final door state is stamped too
  });

  it("snapshot after an EARLIER same-tick execution stays drafted AND freshly contextualized", () => {
    const queries: PlaceDeviceQuery[] = [];
    const config: IntentDoorConfig = {
      canPlaceDevice: (q) => {
        queries.push(q);
        return null;
      },
    };
    const pass = ctx(4n);
    const second: PlaceDeviceArgs = {
      verb: PlayerVerb.PlaceDevice,
      nodeId: asEntityId("cache-2"),
      deviceKind: "cache",
      template: null,
    };
    applyIntentDoor(baseState(3), pass, [ext(4n, 1, OPEN_ARGS), ext(4n, 2, second)], config);
    expect(queries.length).toBe(2);
    const [firstQuery, secondQuery] = queries as [PlaceDeviceQuery, PlaceDeviceQuery];
    expect(secondQuery.state.nodes.has(asEntityId("cache-1"))).toBe(true); // draft visible
    expect(secondQuery.state.context.tick).toBe(4n); // never the origin's 0n
    expect(firstQuery.state.context).toBe(pass);
  });
});
