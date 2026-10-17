/**
 * MAINTAIN-NODE — the 12th door verb (ADR-0015 door-mechanics ruling: tier
 * verbs get real door mechanics; Maintain ↔ attendance, first half of 2/5).
 * The intent-door.test.ts "32-code refusal census" header needs TWO honest
 * amendments disclosed here (this lane + its schedule sibling): maintain
 * introduces exactly ONE new refusal phrase — `bad-maintenance-window` (the
 * band-shape law the census never had a number for; the census is a
 * comment-side enumeration, machine-pinned nowhere, so nothing reddens).
 * Its other two refusals reuse census entries verbatim (empty-node-id,
 * unknown-node), exactly as shield/scale did.
 *
 * Pins (the scale contract, mirrored deliberately — intent-door-scale.test.ts
 * is the shape template):
 *  - the ONLY state effect is one frozen band in the OPTIONAL
 *    `GameState.maintain` book — the door never touches units, dice, or RNG
 *    (the veto lands at step 9, proven live in patience-maintain-schedule.test.ts);
 *  - occupancy class: ATTENDANCE (1 hand / 2 ticks — the communicate/
 *    disconnect cohort: manning a switchboard is an on-site task, not a
 *    desk tap; a taste drift is a red test);
 *  - M2 wire wall: all three arg keys are STRUCTURAL (missing/wrong type
 *    throws IntentDoorError); the explicit `null` sentinel is the only
 *    "opens now" form; floats PASS the number type and hit the value
 *    domain — `bad-maintenance-window` refuses close <= open and
 *    non-safe-integer edges; open=null with close=0 EXECUTES (an already-
 *    expired band is inert at read, honest history — the door compares
 *    numbers, never the clock);
 *  - last-write-wins COW: same node twice ⇒ version 2 with ONE entry;
 *    distinct nodes accumulate; expired bands are NEVER pruned;
 *  - digest-switch law: absent book ⇒ every digest byte-identical; present
 *    book ⇒ digest moves, insertion-order-independent; the null open edge
 *    takes the -1 sentinel slot and PARTICIPATES (open=now vs open=0 are
 *    different bookings — falsifiable twins).
 */

import { describe, expect, it } from "vitest";
import type {
  EntityId,
  ExternalIntent,
  GameState,
  MaintainArgs,
  MaintainBook,
  MaintainWindow,
  PlayerVerbArgs,
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
  createMaintainBook,
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
    engineVersion: "test-maintain",
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

const ARM: MaintainArgs = {
  verb: PlayerVerb.MaintainNode,
  targetNodeId: IDS.edge,
  openAtBusinessMinute: null,
  closeAtBusinessMinute: 60,
};

function maintainBook(
  entries: ReadonlyMap<EntityId, MaintainWindow>,
  version = 1,
): MaintainBook {
  return Object.freeze({ version, entries: Object.freeze(new Map(entries)) });
}

function seedBand(openAtBusinessMinute: number | null, closeAtBusinessMinute: number, shippedAtTick: bigint): MaintainWindow {
  return Object.freeze({ openAtBusinessMinute, closeAtBusinessMinute, shippedAtTick });
}

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

/* ═══════════════════ happy path — the attendance book writes ═══════════════════ */

describe("maintain-node — execution and the attendance book", () => {
  it("executes: one frozen band, canonical detail, lazy materialization", () => {
    const before = baseState();
    expect(before.maintain).toBeUndefined();
    const result = applyIntentDoor(before, ctx(3n), [ext(3n, 1, ARM)]);
    expect(outcomeOf(result, 1)).toBe("executed");
    const book = result.state.maintain;
    expect(book).toBeDefined();
    expect(book?.version).toBe(1);
    expect(book?.entries.size).toBe(1);
    const entry = book?.entries.get(IDS.edge);
    expect(entry).toEqual({
      openAtBusinessMinute: null,
      closeAtBusinessMinute: 60,
      shippedAtTick: 3n,
    });
    expect(Object.isFrozen(entry)).toBe(true);
    expect(Object.isFrozen(book)).toBe(true);
    const event = result.events[0];
    expect(event?.kind).toBe("intent-executed");
    expect(event?.kind === "intent-executed" && event.detail).toBe("node=edge,open=now,close=60");
  });

  it("a future open edge rides the entry verbatim and spells the detail", () => {
    const result = applyIntentDoor(baseState(), ctx(1n), [
      ext(1n, 1, { ...ARM, openAtBusinessMinute: 43_200, closeAtBusinessMinute: 57_600 }),
    ]);
    expect(result.state.maintain?.entries.get(IDS.edge)).toEqual({
      openAtBusinessMinute: 43_200,
      closeAtBusinessMinute: 57_600,
      shippedAtTick: 1n,
    });
    expect(result.events[0]?.kind === "intent-executed" && result.events[0].detail).toBe(
      "node=edge,open=43200,close=57600",
    );
  });

  it("attendance-class occupancy ladder: 1 hand, 2 ticks, busyUntil = tick + 2 (pinned taste)", () => {
    expect(DEFAULT_INTENT_HAND_COST[PlayerVerb.MaintainNode]).toBe(1);
    expect(DEFAULT_INTENT_OCCUPANCY_TICKS[PlayerVerb.MaintainNode]).toBe(2);
    const result = applyIntentDoor(baseState(1), ctx(5n), [ext(5n, 1, ARM)]);
    const event = result.events[0];
    expect(event?.kind === "intent-executed" && event.handIndexes).toEqual([0]);
    expect(event?.kind === "intent-executed" && event.busyUntilTick).toBe(7n);
  });

  it("re-booking the SAME node is last-write-wins COW: version 2, one entry, first book untouched", () => {
    const first = applyIntentDoor(baseState(), ctx(1n), [ext(1n, 1, ARM)]);
    const book1 = first.state.maintain as MaintainBook;
    const second = applyIntentDoor(first.state, ctx(2n), [
      ext(2n, 2, { ...ARM, openAtBusinessMinute: 500, closeAtBusinessMinute: 900 }),
    ]);
    const book2 = second.state.maintain as MaintainBook;
    expect(book2.version).toBe(2);
    expect(book2.entries.size).toBe(1);
    expect(book2.entries.get(IDS.edge)).toEqual({
      openAtBusinessMinute: 500,
      closeAtBusinessMinute: 900,
      shippedAtTick: 2n,
    });
    expect(book1.version).toBe(1);
    expect(book1.entries.get(IDS.edge)?.closeAtBusinessMinute).toBe(60);
    expect(book2.entries).not.toBe(book1.entries);
  });

  it("distinct nodes accumulate (two entries, version 2); scope audit keeps origin slices identical", () => {
    const before = baseState();
    const first = applyIntentDoor(before, ctx(1n), [ext(1n, 1, ARM)]);
    const second = applyIntentDoor(first.state, ctx(1n), [
      ext(1n, 2, { ...ARM, targetNodeId: IDS.origin }),
    ]);
    expect(second.state.maintain?.version).toBe(2);
    expect(second.state.maintain?.entries.size).toBe(2);
    expect(second.state.nodes).toBe(before.nodes); // the door never moves a node
    expect(second.state.lanes).toBe(before.lanes);
    expect(second.state.observed).toBe(before.observed);
    expect(second.state.cash).toBe(before.cash);
    expect(second.state.shield).toBe(before.shield); // nor does it shield
    expect(second.state.scale).toBe(before.scale); // nor does it warm
  });
});

/* ═══════════════════ refusals — two reused codes + one honest new phrase ═══════════════════ */

describe("maintain-node — refusals (bad-maintenance-window is the one new phrase; header discloses)", () => {
  const feed = (args: unknown) =>
    applyIntentDoor(baseState(5), ctx(1n), [ext(1n, 1, args as PlayerVerbArgs)]);

  it("empty-node-id is the bare-code guard (place-device family, reused verbatim)", () => {
    // forged WIRE (bypasses asEntityId's boundary law): refusal, not a throw.
    expect(refused(feed({ ...ARM, targetNodeId: "" as EntityId }), 1)).toBe("empty-node-id");
  });

  it("bad-maintenance-window refuses close<=open / negative / fractional edges", () => {
    expect(refused(feed({ ...ARM, closeAtBusinessMinute: -5 }), 1)).toMatch(
      /^bad-maintenance-window: open=null must be null or a safe integer >= 0, close=-5 a safe integer >= 0 strictly after open$/,
    );
    expect(refused(feed({ ...ARM, openAtBusinessMinute: 60, closeAtBusinessMinute: 60 }), 1)).toMatch(
      /^bad-maintenance-window: open=60 .* close=60/,
    );
    expect(refused(feed({ ...ARM, openAtBusinessMinute: 100, closeAtBusinessMinute: 99 }), 1)).toMatch(
      /^bad-maintenance-window: open=100 .* close=99/,
    );
    expect(refused(feed({ ...ARM, openAtBusinessMinute: -3 }), 1)).toMatch(
      /^bad-maintenance-window: open=-3/,
    );
    expect(refused(feed({ ...ARM, closeAtBusinessMinute: 60.5 }), 1)).toMatch(
      /^bad-maintenance-window: .* close=60\.5/,
    );
  });

  it("open=null with close=0 EXECUTES — an already-expired band is inert at read, not a malformed order", () => {
    // the door compares numbers, never the clock: a null-open band cannot be
    // ordered against "now" at the desk; maintainInForce answers it inert.
    expect(outcomeOf(feed({ ...ARM, openAtBusinessMinute: null, closeAtBusinessMinute: 0 }), 1)).toBe("executed");
    expect(outcomeOf(feed({ ...ARM, openAtBusinessMinute: 0, closeAtBusinessMinute: 1 }), 1)).toBe("executed");
  });

  it('unknown-node: "ghost" reuses the shed/configure phrase exactly', () => {
    expect(refused(feed({ ...ARM, targetNodeId: asEntityId("ghost") }), 1)).toBe(
      'unknown-node: "ghost"',
    );
  });

  it("a refusal after a live book leaves the book UNTOUCHED (identity) and spends no hand", () => {
    const seeded = applyIntentDoor(baseState(2), ctx(1n), [ext(1n, 1, ARM)]);
    const book = seeded.state.maintain as MaintainBook;
    const next = applyIntentDoor(seeded.state, ctx(4n), [
      ext(4n, 2, { ...ARM, targetNodeId: asEntityId("ghost") }),
    ]);
    expect(next.state.maintain).toBe(book);
    expect(next.state.maintain?.entries.size).toBe(1);
    const busy = (next.state.hands?.tokens ?? []).filter((t) => t.busyUntilTick !== null && t.busyUntilTick > 4n);
    expect(busy.length).toBe(0);
  });
});

/* ═══════════════════════════ M2 wire wall ═══════════════════════════ */

describe("maintain-node — M2 structural wall (throws, never refuses)", () => {
  const forge = (args: Record<string, unknown>) =>
    applyIntentDoor(baseState(2), ctx(1n), [ext(1n, 1, args as unknown as PlayerVerbArgs)]);

  it("a missing arg key is structural garbage — the door THROWS (all three keys pinned)", () => {
    expect(() => forge({ verb: PlayerVerb.MaintainNode, targetNodeId: "edge", closeAtBusinessMinute: 60 })).toThrow(IntentDoorError);
    expect(() => forge({ verb: PlayerVerb.MaintainNode, targetNodeId: "edge", openAtBusinessMinute: null })).toThrow(IntentDoorError);
    expect(() => forge({ verb: PlayerVerb.MaintainNode, openAtBusinessMinute: null, closeAtBusinessMinute: 60 })).toThrow(IntentDoorError);
  });

  it("wrong wire TYPES throw: number node id, string close, string open, undefined-as-null", () => {
    expect(() => forge({ ...ARM, targetNodeId: 42 })).toThrow(IntentDoorError);
    expect(() => forge({ ...ARM, closeAtBusinessMinute: "60" })).toThrow(IntentDoorError);
    expect(() => forge({ ...ARM, openAtBusinessMinute: "5" })).toThrow(IntentDoorError);
    // exactOptionalPropertyTypes: an OMITTED key already threw above; an
    // explicit `undefined` is the same garbage:
    expect(() => forge({ ...ARM, openAtBusinessMinute: undefined })).toThrow(IntentDoorError);
  });

  it("the explicit null sentinel is the ONLY 'opens now' form", () => {
    expect(outcomeOf(forge({ ...ARM, openAtBusinessMinute: null }), 1)).toBe("executed");
  });
});

/* ═══════════════════════════ digest-switch law ═══════════════════════════ */

describe("maintain-node — the digest switch", () => {
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
    const emptyBook: GameState = Object.freeze({ ...before, maintain: createMaintainBook() });
    expect(digestState(emptyBook)).not.toBe(digestState(before));
    expect(digestState(emptyBook)).not.toBe(digestState(planted.state));
  });

  it("insertion-order-independent: same bands, different Map order, SAME digest", () => {
    const forward: MaintainBook = maintainBook(
      new Map([[IDS.edge, seedBand(null, 60, 1n)], [IDS.origin, seedBand(10, 90, 1n)]]),
    );
    const reverse: MaintainBook = maintainBook(
      new Map([[IDS.origin, seedBand(10, 90, 1n)], [IDS.edge, seedBand(null, 60, 1n)]]),
    );
    const before = baseState();
    expect(digestState(Object.freeze({ ...before, maintain: forward }))).toBe(
      digestState(Object.freeze({ ...before, maintain: reverse })),
    );
  });

  it("every absorbed field PARTICIPATES — falsifiable twins per column", () => {
    const before = baseState();
    const digests = [
      seedBand(null, 60, 1n),
      seedBand(0, 60, 1n), // open: null sentinel (-1) vs real minute 0 are DIFFERENT bookings
      seedBand(5, 60, 1n), // open edge moves it
      seedBand(null, 61, 1n), // close edge moves it
      seedBand(null, 60, 2n), // shippedAtTick moves it
    ].map((entry) => digestState(Object.freeze({ ...before, maintain: maintainBook(new Map([[IDS.edge, entry]])) })));
    expect(new Set(digests).size).toBe(digests.length);
  });
});
