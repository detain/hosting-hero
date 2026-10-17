/**
 * SCALE-NODE — the 11th door verb (ADR-0015 door-mechanics ruling: tier verbs
 * get real door mechanics; Scale ↔ reserved warmth first of five). The
 * intent-door.test.ts "32-code refusal census" header needs ONE honest
 * amendment here: scale introduces exactly ONE new refusal phrase —
 * `bad-reserved-slots` (the value-domain law the census never had a number
 * for; the census is a comment-side enumeration, machine-pinned nowhere, so
 * nothing reddens — this header is the disclosure). Its other three refusals
 * reuse census entries verbatim (empty-node-id, bad-effective-minute,
 * unknown-node), exactly as shield did.
 *
 * Pins (the shield contract, mirrored deliberately — intent-door-shield.test.ts
 * is the shape template):
 *  - the ONLY state effect is one frozen entry in the OPTIONAL
 *    `GameState.scale` book — the door never touches nodes, units, or RNG
 *    (the warmth lands at the step-5/6 capacity read, proven live in
 *    slots-scale.test.ts);
 *  - the entry carries `baseRosterSlots` — the authored-roster anchor —
 *    CHAIN-INHERITED across amendments: the door stamps the live roster
 *    length on the FIRST booking and carries the prior entry's anchor on
 *    every re-booking (falsified below with a planted book whose anchor
 *    exceeds the live roster: 5 ≠ 2, the re-arm keeps 5);
 *  - occupancy class: COMMIT (1 hand / 1 tick) — a taste drift is a red test;
 *  - M2 wire wall: all three arg keys are STRUCTURAL (missing/wrong type
 *    throws IntentDoorError); the explicit `null` sentinel is the only "now"
 *    form for the minute; floats PASS the number type and hit the value
 *    domain — `bad-reserved-slots` refuses 1.5/NaN/-3, `reservedSlots: 0`
 *    EXECUTES (the card's "scale to zero" amendment is a legal order);
 *  - last-write-wins COW: same node twice ⇒ version 2 with ONE entry;
 *    distinct nodes accumulate;
 *  - digest-switch law: absent book ⇒ every digest byte-identical; present
 *    book ⇒ digest moves, insertion-order-independent; `baseRosterSlots`
 *    PARTICIPATES (two bookings of equal reservedSlots over different
 *    anchors are different orders — falsifiable).
 */

import { describe, expect, it } from "vitest";
import type {
  EntityId,
  ExternalIntent,
  GameState,
  PlayerVerbArgs,
  ScaleArgs,
  ScaleBook,
  ScaleEntry,
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
  createScaleBook,
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
    engineVersion: "test-scale",
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

const ARM: ScaleArgs = {
  verb: PlayerVerb.ScaleNode,
  targetNodeId: IDS.edge,
  reservedSlots: 2,
  effectiveAtBusinessMinute: null,
};

function scaleBook(
  entries: ReadonlyMap<EntityId, ScaleEntry>,
  version = 1,
): ScaleBook {
  return Object.freeze({ version, entries: Object.freeze(new Map(entries)) });
}

function seedEntry(reservedSlots: number, baseRosterSlots: number, shippedAtTick: bigint, effectiveAtBusinessMinute: number | null): ScaleEntry {
  return Object.freeze({ reservedSlots, baseRosterSlots, shippedAtTick, effectiveAtBusinessMinute });
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

/* ═══════════════════ happy path — the reserved-warmth book writes ═══════════════════ */

describe("scale-node — execution and the reserved-warmth book", () => {
  it("executes: one frozen entry, canonical detail, anchor from the live roster, lazy materialization", () => {
    const before = baseState();
    expect(before.scale).toBeUndefined();
    const result = applyIntentDoor(before, ctx(3n), [ext(3n, 1, ARM)]);
    expect(outcomeOf(result, 1)).toBe("executed");
    const book = result.state.scale;
    expect(book).toBeDefined();
    expect(book?.version).toBe(1);
    expect(book?.entries.size).toBe(1);
    const entry = book?.entries.get(IDS.edge);
    expect(entry).toEqual({
      reservedSlots: 2,
      baseRosterSlots: 2, // the edge fixture's authored roster
      shippedAtTick: 3n,
      effectiveAtBusinessMinute: null,
    });
    expect(Object.isFrozen(entry)).toBe(true);
    expect(Object.isFrozen(book)).toBe(true);
    const event = result.events[0];
    expect(event?.kind).toBe("intent-executed");
    expect(event?.kind === "intent-executed" && event.detail).toBe("node=edge,slots=2");
  });

  it("a future business-minute stamp rides the entry verbatim and extends the detail", () => {
    const result = applyIntentDoor(baseState(), ctx(1n), [
      ext(1n, 1, { ...ARM, effectiveAtBusinessMinute: 43_200 }),
    ]);
    expect(result.state.scale?.entries.get(IDS.edge)).toEqual({
      reservedSlots: 2,
      baseRosterSlots: 2,
      shippedAtTick: 1n,
      effectiveAtBusinessMinute: 43_200,
    });
    expect(result.events[0]?.kind === "intent-executed" && result.events[0].detail).toBe(
      "node=edge,slots=2,at=43200",
    );
  });

  it("commit-class occupancy ladder: 1 hand, 1 tick, busyUntil = tick + 1 (pinned taste)", () => {
    expect(DEFAULT_INTENT_HAND_COST[PlayerVerb.ScaleNode]).toBe(1);
    expect(DEFAULT_INTENT_OCCUPANCY_TICKS[PlayerVerb.ScaleNode]).toBe(1);
    const result = applyIntentDoor(baseState(1), ctx(5n), [ext(5n, 1, ARM)]);
    const event = result.events[0];
    expect(event?.kind === "intent-executed" && event.handIndexes).toEqual([0]);
    expect(event?.kind === "intent-executed" && event.busyUntilTick).toBe(6n);
  });

  it("re-booking the SAME node is last-write-wins COW: version 2, one entry, first book untouched", () => {
    const first = applyIntentDoor(baseState(), ctx(1n), [ext(1n, 1, ARM)]);
    const book1 = first.state.scale as ScaleBook;
    const second = applyIntentDoor(first.state, ctx(2n), [
      ext(2n, 2, { ...ARM, reservedSlots: 5, effectiveAtBusinessMinute: 500 }),
    ]);
    const book2 = second.state.scale as ScaleBook;
    expect(book2.version).toBe(2);
    expect(book2.entries.size).toBe(1);
    expect(book2.entries.get(IDS.edge)).toEqual({
      reservedSlots: 5,
      baseRosterSlots: 2,
      shippedAtTick: 2n,
      effectiveAtBusinessMinute: 500,
    });
    expect(book1.version).toBe(1);
    expect(book1.entries.get(IDS.edge)?.reservedSlots).toBe(2);
    expect(book2.entries).not.toBe(book1.entries);
  });

  it("the roster anchor CHAIN-INHERITS: a re-booking keeps the prior entry's anchor, never re-stamps the live roster", () => {
    // planted book claims the node was authored at 5 slots; the live fixture
    // roster is 2. A naive `slots.length` stamp would write 2 — the chain law
    // must carry 5 forward so withdrawal still returns to the authored size.
    const planted: GameState = Object.freeze({
      ...baseState(),
      scale: scaleBook(new Map([[IDS.edge, seedEntry(3, 5, 0n, null)]])),
    });
    const result = applyIntentDoor(planted, ctx(1n), [ext(1n, 1, { ...ARM, reservedSlots: 0 })]);
    const entry = result.state.scale?.entries.get(IDS.edge);
    expect(entry).toEqual({
      reservedSlots: 0,
      baseRosterSlots: 5, // inherited, NOT the live roster's 2
      shippedAtTick: 1n,
      effectiveAtBusinessMinute: null,
    });
  });

  it("distinct nodes accumulate (two entries, version 2); scope audit keeps origin slices identical", () => {
    const before = baseState();
    const first = applyIntentDoor(before, ctx(1n), [ext(1n, 1, ARM)]);
    const second = applyIntentDoor(first.state, ctx(1n), [
      ext(1n, 2, { ...ARM, targetNodeId: IDS.origin }),
    ]);
    expect(second.state.scale?.version).toBe(2);
    expect(second.state.scale?.entries.size).toBe(2);
    // each anchor is ITS OWN roster: edge 2, origin 1
    expect(second.state.scale?.entries.get(IDS.origin)?.baseRosterSlots).toBe(1);
    expect(second.state.nodes).toBe(before.nodes); // the door never pads
    expect(second.state.lanes).toBe(before.lanes);
    expect(second.state.observed).toBe(before.observed);
    expect(second.state.cash).toBe(before.cash);
    expect(second.state.shield).toBe(before.shield); // nor does it shield
  });
});

/* ═══════════════════ refusals — three reused codes + one honest new phrase ═══════════════════ */

describe("scale-node — refusals (bad-reserved-slots is the one new phrase; header discloses)", () => {
  const feed = (args: unknown) =>
    applyIntentDoor(baseState(5), ctx(1n), [ext(1n, 1, args as PlayerVerbArgs)]);

  it("empty-node-id is the bare-code guard (place-device family, reused verbatim)", () => {
    // forged WIRE (bypasses asEntityId's boundary law): refusal, not a throw.
    expect(refused(feed({ ...ARM, targetNodeId: "" as EntityId }), 1)).toBe("empty-node-id");
  });

  it("bad-reserved-slots refuses negative/fractional/NaN warmth; 0 EXECUTES (scale-to-zero amendment)", () => {
    expect(refused(feed({ ...ARM, reservedSlots: -3 }), 1)).toMatch(
      /^bad-reserved-slots: -3 must be a safe integer >= 0$/,
    );
    expect(refused(feed({ ...ARM, reservedSlots: 1.5 }), 1)).toMatch(
      /^bad-reserved-slots: 1\.5 must be a safe integer >= 0$/,
    );
    expect(refused(feed({ ...ARM, reservedSlots: NaN }), 1)).toMatch(
      /^bad-reserved-slots: NaN must be a safe integer >= 0$/,
    );
    // the card's "scale to zero" (§1.3 serverless): 0 is a LEGAL booking —
    // withdrawal is an amendment, never a malformed order:
    expect(outcomeOf(feed({ ...ARM, reservedSlots: 0 }), 1)).toBe("executed");
  });

  it("bad-effective-minute keeps the shield/adjust-price phrasing verbatim; 0 is legal", () => {
    expect(refused(feed({ ...ARM, effectiveAtBusinessMinute: -3 }), 1)).toMatch(
      /^bad-effective-minute: -3 must be a safe integer >= 0 \(or null = now\)$/,
    );
    expect(refused(feed({ ...ARM, effectiveAtBusinessMinute: 1.5 }), 1)).toMatch(
      /^bad-effective-minute: 1\.5/,
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
    const book = seeded.state.scale as ScaleBook;
    const next = applyIntentDoor(seeded.state, ctx(4n), [
      ext(4n, 2, { ...ARM, targetNodeId: asEntityId("ghost") }),
    ]);
    expect(next.state.scale).toBe(book);
    expect(next.state.scale?.entries.size).toBe(1);
    const busy = (next.state.hands?.tokens ?? []).filter((t) => t.busyUntilTick !== null && t.busyUntilTick > 4n);
    expect(busy.length).toBe(0);
  });
});

/* ═══════════════════════════ M2 wire wall ═══════════════════════════ */

describe("scale-node — M2 structural wall (throws, never refuses)", () => {
  const forge = (args: Record<string, unknown>) =>
    applyIntentDoor(baseState(2), ctx(1n), [ext(1n, 1, args as unknown as PlayerVerbArgs)]);

  it("a missing arg key is structural garbage — the door THROWS (all three keys pinned)", () => {
    expect(() => forge({ verb: PlayerVerb.ScaleNode, targetNodeId: "edge", effectiveAtBusinessMinute: null })).toThrow(IntentDoorError);
    expect(() => forge({ verb: PlayerVerb.ScaleNode, targetNodeId: "edge", reservedSlots: 2 })).toThrow(IntentDoorError);
    expect(() => forge({ verb: PlayerVerb.ScaleNode, reservedSlots: 2, effectiveAtBusinessMinute: null })).toThrow(IntentDoorError);
  });

  it("wrong wire TYPES throw: number node id, string slots, string minute, undefined-as-null", () => {
    expect(() => forge({ ...ARM, targetNodeId: 42 })).toThrow(IntentDoorError);
    expect(() => forge({ ...ARM, reservedSlots: "2" })).toThrow(IntentDoorError);
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

describe("scale-node — the digest switch", () => {
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
    const emptyBook: GameState = Object.freeze({ ...before, scale: createScaleBook() });
    expect(digestState(emptyBook)).not.toBe(digestState(before));
    expect(digestState(emptyBook)).not.toBe(digestState(planted.state));
  });

  it("insertion-order-independent: same entries, different Map order, SAME digest", () => {
    const forward: ScaleBook = scaleBook(
      new Map([[IDS.edge, seedEntry(1, 2, 1n, null)], [IDS.origin, seedEntry(1, 1, 1n, null)]]),
    );
    const reverse: ScaleBook = scaleBook(
      new Map([[IDS.origin, seedEntry(1, 1, 1n, null)], [IDS.edge, seedEntry(1, 2, 1n, null)]]),
    );
    const before = baseState();
    expect(digestState(Object.freeze({ ...before, scale: forward }))).toBe(
      digestState(Object.freeze({ ...before, scale: reverse })),
    );
  });

  it("every absorbed field PARTICIPATES — falsifiable twins per column", () => {
    const before = baseState();
    const base = seedEntry(2, 2, 1n, null);
    const digests = [
      base,
      seedEntry(3, 2, 1n, null), // reservedSlots moves it
      seedEntry(2, 5, 1n, null), // baseRosterSlots moves it (the anchor is no decoration)
      seedEntry(2, 2, 2n, null), // shippedAtTick moves it
      seedEntry(2, 2, 1n, 43_200), // the stamp moves it
    ].map((entry) => digestState(Object.freeze({ ...before, scale: scaleBook(new Map([[IDS.edge, entry]])) })));
    expect(new Set(digests).size).toBe(digests.length);
  });
});
