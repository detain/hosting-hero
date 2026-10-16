/**
 * SHIELD-NODE — the 10th door verb (ADR-0014 #D2: one new verb per paired
 * mechanic, Shield ↔ corruption pre-arm first). The intent-door.test.ts
 * "32-code refusal census" header stays HONEST: shield adds ZERO new codes —
 * all three of its refusals reuse census entries (empty-node-id,
 * bad-effective-minute, unknown-node); what is new is only which verbs can
 * raise them.
 *
 * Pins (the adjust-price contract-#10 pattern, mirrored deliberately):
 *  - the ONLY state effect is one frozen entry in the OPTIONAL
 *    `GameState.shield` book — the door never touches units, marks, or RNG
 *    (the veto itself lives at step 9, proven in corruption-shield.test.ts);
 *  - occupancy class: COMMIT (1 hand / 1 tick) — a taste drift is a red test;
 *    ATTENTION_DEFAULT_COSTS deliberately stays untouched (ADR-0013 #12(v)
 *    owner map; the generic attentionCost config seam still reaches it);
 *  - M2 wire wall: both arg keys are STRUCTURAL (missing/wrong type throws
 *    IntentDoorError); the explicit `null` sentinel is the only "now" form;
 *    the value domain (empty id, malformed minute, unknown node) is the
 *    three-code refusal space;
 *  - last-write-wins COW: same node twice ⇒ version 2 with ONE entry (second
 *    wins, first book untouched by identity); distinct nodes accumulate;
 *  - digest-switch law: absent book ⇒ every digest byte-identical (serial
 *    goldens); present book ⇒ digest moves, insertion-order-independent
 *    (entries sort by node-id code-unit before the sink).
 */

import { describe, expect, it } from "vitest";
import type {
  EntityId,
  ExternalIntent,
  GameState,
  PlayerVerbArgs,
  ShieldArgs,
  ShieldBook,
  SimTick,
  TickContext,
} from "../../types";
import { asEntityId, asRunSeed, PlayerVerb } from "../../types";
import { initialClocks, MICROS_PER_MIN } from "../../kernel/time";
import { createInitialState } from "../driver";
import { digestState } from "../digest";
import {
  applyIntentDoor,
  createBoardState,
  createShieldBook,
  IntentDoorError,
  DEFAULT_INTENT_HAND_COST,
  DEFAULT_INTENT_OCCUPANCY_TICKS,
} from "../intent-door";
import { IDS, node } from "./helpers";

const MIN = MICROS_PER_MIN;

/* ═══════════════════════════ fixtures (intent-door pattern) ═══════════════════════════ */

function ctx(tick: SimTick): TickContext {
  return Object.freeze({ tick, minute: Number(tick), clocks: initialClocks() });
}

function ext(tick: SimTick, seq: number, args: PlayerVerbArgs): ExternalIntent {
  return Object.freeze({
    tick,
    intent: Object.freeze({
      seq,
      clock: "sim" as const,
      atUs: tick * MIN,
      origin: "player" as const,
      payload: Object.freeze({ kind: "player-verb" as const, args }),
    }),
  });
}

function baseState(handCapacity = 2): GameState {
  return createInitialState({
    runSeed: asRunSeed(7n),
    engineVersion: "test-shield",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
    clocks: initialClocks(),
    nodes: [
      node(IDS.edge, { slots: 2, serviceUs: MIN }),
      node(IDS.origin, { slots: 1, serviceUs: MIN }),
    ],
    handCapacity,
    board: createBoardState(),
  });
}

const ARM: ShieldArgs = {
  verb: PlayerVerb.Shield,
  targetNodeId: IDS.edge,
  effectiveAtBusinessMinute: null,
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

/* ═══════════════════════ happy path — the pre-arm book writes ═══════════════════════ */

describe("shield-node — execution and the pre-arm book", () => {
  it("executes: one frozen entry, canonical detail, book materialized lazily", () => {
    const before = baseState();
    expect(before.shield).toBeUndefined();
    const result = applyIntentDoor(before, ctx(3n), [ext(3n, 1, ARM)]);
    expect(outcomeOf(result, 1)).toBe("executed");
    const book = result.state.shield;
    expect(book).toBeDefined();
    expect(book?.version).toBe(1);
    expect(book?.entries.size).toBe(1);
    const entry = book?.entries.get(IDS.edge);
    expect(entry).toEqual({ shippedAtTick: 3n, effectiveAtBusinessMinute: null });
    expect(Object.isFrozen(entry)).toBe(true);
    expect(Object.isFrozen(book)).toBe(true);
    const event = result.events[0];
    expect(event?.kind).toBe("intent-executed");
    expect(event?.kind === "intent-executed" && event.detail).toBe("node=edge");
  });

  it("a future business-minute stamp rides the entry verbatim and extends the detail", () => {
    const result = applyIntentDoor(baseState(), ctx(1n), [
      ext(1n, 1, { ...ARM, effectiveAtBusinessMinute: 43_200 }),
    ]);
    expect(result.state.shield?.entries.get(IDS.edge)).toEqual({
      shippedAtTick: 1n,
      effectiveAtBusinessMinute: 43_200,
    });
    expect(result.events[0]?.kind === "intent-executed" && result.events[0].detail).toBe(
      "node=edge,at=43200",
    );
  });

  it("commit-class occupancy ladder: 1 hand, 1 tick, busyUntil = tick + 1 (pinned taste)", () => {
    expect(DEFAULT_INTENT_HAND_COST[PlayerVerb.Shield]).toBe(1);
    expect(DEFAULT_INTENT_OCCUPANCY_TICKS[PlayerVerb.Shield]).toBe(1);
    const result = applyIntentDoor(baseState(1), ctx(5n), [ext(5n, 1, ARM)]);
    const event = result.events[0];
    expect(event?.kind === "intent-executed" && event.handIndexes).toEqual([0]);
    expect(event?.kind === "intent-executed" && event.busyUntilTick).toBe(6n);
  });

  it("re-arming the SAME node is last-write-wins COW: version 2, one entry, first book untouched", () => {
    const first = applyIntentDoor(baseState(), ctx(1n), [ext(1n, 1, ARM)]);
    const book1 = first.state.shield as ShieldBook;
    const second = applyIntentDoor(first.state, ctx(2n), [
      ext(2n, 2, { ...ARM, effectiveAtBusinessMinute: 500 }),
    ]);
    const book2 = second.state.shield as ShieldBook;
    expect(book2.version).toBe(2);
    expect(book2.entries.size).toBe(1);
    expect(book2.entries.get(IDS.edge)).toEqual({ shippedAtTick: 2n, effectiveAtBusinessMinute: 500 });
    // the earlier book is a frozen snapshot — identity AND shape intact:
    expect(book1.version).toBe(1);
    expect(book1.entries.get(IDS.edge)?.effectiveAtBusinessMinute).toBeNull();
    expect(book2.entries).not.toBe(book1.entries);
  });

  it("distinct nodes accumulate (two entries, version 2); scope audit keeps origin slices identical", () => {
    const before = baseState();
    const first = applyIntentDoor(before, ctx(1n), [ext(1n, 1, ARM)]);
    const second = applyIntentDoor(first.state, ctx(1n), [
      ext(1n, 2, { ...ARM, targetNodeId: IDS.origin }),
    ]);
    expect(second.state.shield?.version).toBe(2);
    expect(second.state.shield?.entries.size).toBe(2);
    expect(second.state.nodes).toBe(before.nodes);
    expect(second.state.lanes).toBe(before.lanes);
    expect(second.state.observed).toBe(before.observed);
    expect(second.state.cash).toBe(before.cash);
    expect(second.state.corruption).toBe(before.corruption); // the door never marks
  });
});

/* ═══════════════════ refusals — the THREE reused census codes ═══════════════════ */

describe("shield-node — refusals (census 32 stays 32: zero new codes)", () => {
  const feed = (args: unknown) =>
    applyIntentDoor(baseState(5), ctx(1n), [ext(1n, 1, args as PlayerVerbArgs)]);

  it("empty-node-id is the bare-code guard (place-device family, reused verbatim)", () => {
    // forged WIRE (bypasses asEntityId's boundary law): refusal, not a throw.
    expect(refused(feed({ ...ARM, targetNodeId: "" as EntityId }), 1)).toBe("empty-node-id");
  });

  it("bad-effective-minute keeps the adjust-price phrasing verbatim; 0 is legal", () => {
    expect(refused(feed({ ...ARM, effectiveAtBusinessMinute: -3 }), 1)).toMatch(
      /^bad-effective-minute: -3 must be a safe integer >= 0 \(or null = now\)$/,
    );
    expect(refused(feed({ ...ARM, effectiveAtBusinessMinute: 1.5 }), 1)).toMatch(
      /^bad-effective-minute: 1\.5/,
    );
    expect(refused(feed({ ...ARM, effectiveAtBusinessMinute: NaN }), 1)).toMatch(
      /^bad-effective-minute: NaN/,
    );
    expect(outcomeOf(feed({ ...ARM, effectiveAtBusinessMinute: 0 }), 1)).toBe("executed");
  });

  it('unknown-node: "ghost" reuses the shed/configure phrase exactly', () => {
    expect(refused(feed({ ...ARM, targetNodeId: asEntityId("ghost") }), 1)).toBe(
      'unknown-node: "ghost"',
    );
  });

  it("a refusal after a live book leaves the book UNTOUCHED (identity) and spends no hand", () => {
    const seeded = applyIntentDoor(baseState(2), ctx(1n), [ext(1n, 1, ARM)]);
    const book = seeded.state.shield as ShieldBook;
    const next = applyIntentDoor(seeded.state, ctx(4n), [
      ext(4n, 2, { ...ARM, targetNodeId: asEntityId("ghost") }),
    ]);
    expect(next.state.shield).toBe(book);
    expect(next.state.shield?.entries.size).toBe(1);
    // undo law: the refused entry's hand refund leaves BOTH tokens free again:
    const busy = (next.state.hands?.tokens ?? []).filter((t) => t.busyUntilTick !== null && t.busyUntilTick > 4n);
    expect(busy.length).toBe(0);
  });
});

/* ═══════════════════════════ M2 wire wall ═══════════════════════════ */

describe("shield-node — M2 structural wall (throws, never refuses)", () => {
  const forge = (args: Record<string, unknown>) =>
    applyIntentDoor(baseState(2), ctx(1n), [ext(1n, 1, args as unknown as PlayerVerbArgs)]);

  it("a missing arg key is structural garbage — the door THROWS", () => {
    expect(() => forge({ verb: PlayerVerb.Shield, targetNodeId: "edge" })).toThrow(IntentDoorError);
    expect(() => forge({ verb: PlayerVerb.Shield, effectiveAtBusinessMinute: null })).toThrow(IntentDoorError);
  });

  it("wrong wire TYPES throw: number node id, string minute, undefined-as-null", () => {
    expect(() => forge({ ...ARM, targetNodeId: 42 })).toThrow(IntentDoorError);
    expect(() => forge({ ...ARM, effectiveAtBusinessMinute: "5" })).toThrow(IntentDoorError);
    // exactOptionalPropertyTypes: an OMITTED key already threw above; an
    // explicit `undefined` is the same garbage:
    expect(() => forge({ ...ARM, effectiveAtBusinessMinute: undefined })).toThrow(IntentDoorError);
  });

  it("the explicit null sentinel is the ONLY 'in force now' form", () => {
    expect(outcomeOf(forge({ ...ARM, effectiveAtBusinessMinute: null }), 1)).toBe("executed");
  });
});

/* ═══════════════════════════ digest-switch law ═══════════════════════════ */

describe("shield-node — the digest switch", () => {
  it("absent book ⇒ digest byte-identical to the untouched state (zero movement)", () => {
    const before = baseState();
    expect(digestState(before)).toBe(digestState(baseState()));
    // and a refusal keeps the ORIGINAL digest (state identity):
    const result = applyIntentDoor(before, ctx(1n), [
      ext(1n, 1, { ...ARM, targetNodeId: asEntityId("ghost") }),
    ]);
    expect(digestState(result.state)).toBe(digestState(before));
  });

  it("present book moves the digest; empty book counts as present (embed law)", () => {
    const before = baseState();
    const planted = applyIntentDoor(before, ctx(1n), [ext(1n, 1, ARM)]);
    expect(digestState(planted.state)).not.toBe(digestState(before));
    const emptyBook: GameState = Object.freeze({ ...before, shield: createShieldBook() });
    expect(digestState(emptyBook)).not.toBe(digestState(before));
    expect(digestState(emptyBook)).not.toBe(digestState(planted.state));
  });

  it("insertion-order-independent: same entries, different Map order, SAME digest", () => {
    const entry = (at: bigint): { shippedAtTick: bigint; effectiveAtBusinessMinute: number | null } =>
      Object.freeze({ shippedAtTick: at, effectiveAtBusinessMinute: null });
    const forward: ShieldBook = Object.freeze({
      version: 2,
      entries: Object.freeze(new Map<EntityId, ReturnType<typeof entry>>([[IDS.edge, entry(1n)], [IDS.origin, entry(1n)]])),
    });
    const reverse: ShieldBook = Object.freeze({
      version: 2,
      entries: Object.freeze(new Map<EntityId, ReturnType<typeof entry>>([[IDS.origin, entry(1n)], [IDS.edge, entry(1n)]])),
    });
    const before = baseState();
    const a = Object.freeze({ ...before, shield: forward });
    const b = Object.freeze({ ...before, shield: reverse });
    expect(digestState(a)).toBe(digestState(b));
  });
});
