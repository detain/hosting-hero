/**
 * SCHEDULE-WINDOW — the 13th door verb (ADR-0015 door-mechanics ruling: tier
 * verbs get real door mechanics; Schedule ↔ the job-window deadline, second
 * half of 2/5, sibling of maintain-node). The intent-door.test.ts "32-code
 * refusal census" header needs its SECOND honest amendment: schedule adds
 * exactly ONE new refusal phrase — `bad-window-band` (the same band-shape
 * law, own name because the two books own different games: a refused
 * maintenance booking and a refused calendar booking are different player
 * stories). Its other two refusals reuse census entries verbatim
 * (empty-node-id, unknown-node).
 *
 * Pins (the maintain contract, mirrored deliberately):
 *  - the ONLY state effect is one frozen band in the OPTIONAL
 *    `GameState.schedule` book — `JobWindowBook`, named for the jobs, NOT
 *    after §7.7 recovery windows (`GameState.recovery` is a DIFFERENT book
 *    owned by pipeline/recovery.ts — the separation is pinned below:
 *    planting a job band never materializes or mutates `recovery`);
 *  - occupancy class: 1 hand / 1 TICK — the calendar tap. The 26-hour-
 *    disaster law (hosting_game.md:1964) says a mis-set window must be CHEAP
 *    to correct; a taste drift to attendance-grade time is a red test;
 *  - M2 wire wall: all three arg keys STRUCTURAL (missing/wrong type throws
 *    IntentDoorError); value domain — `bad-window-band` refuses close <=
 *    open and non-safe-integer edges; open=null close=0 EXECUTES (expired-
 *    at-booking is inert at read, honest history);
 *  - last-write-wins COW: same node twice ⇒ version 2 with ONE entry
 *    (the amendment door — "the window that moved" is re-armed, never
 *    stacked); expired bands are NEVER pruned;
 *  - digest-switch law: absent book ⇒ byte-identical; present ⇒ moves,
 *    insertion-order-independent; null open takes the -1 sentinel and
 *    PARTICIPATES; the two books digest INDEPENDENTLY (maintain and
 *    schedule rows with identical numbers are different orders — the
 *    block labels differ).
 */

import { describe, expect, it } from "vitest";
import type {
  EntityId,
  ExternalIntent,
  GameState,
  JobWindow,
  JobWindowBook,
  MaintainBook,
  PlayerVerbArgs,
  ScheduleArgs,
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
  createJobWindowBook,
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
    engineVersion: "test-schedule",
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

const ARM: ScheduleArgs = {
  verb: PlayerVerb.ScheduleWindow,
  targetNodeId: IDS.edge,
  openAtBusinessMinute: null,
  closeAtBusinessMinute: 480, // the 06:00 edge, made of business minutes
};

function jobBook(entries: ReadonlyMap<EntityId, JobWindow>, version = 1): JobWindowBook {
  return Object.freeze({ version, entries: Object.freeze(new Map(entries)) });
}

function seedBand(openAtBusinessMinute: number | null, closeAtBusinessMinute: number, shippedAtTick: bigint): JobWindow {
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

/* ═══════════════════ happy path — the job-window book writes ═══════════════════ */

describe("schedule-window — execution and the job-window book", () => {
  it("executes: one frozen band, canonical detail, lazy materialization", () => {
    const before = baseState();
    expect(before.schedule).toBeUndefined();
    const result = applyIntentDoor(before, ctx(3n), [ext(3n, 1, ARM)]);
    expect(outcomeOf(result, 1)).toBe("executed");
    const book = result.state.schedule;
    expect(book).toBeDefined();
    expect(book?.version).toBe(1);
    expect(book?.entries.size).toBe(1);
    const entry = book?.entries.get(IDS.edge);
    expect(entry).toEqual({
      openAtBusinessMinute: null,
      closeAtBusinessMinute: 480,
      shippedAtTick: 3n,
    });
    expect(Object.isFrozen(entry)).toBe(true);
    expect(Object.isFrozen(book)).toBe(true);
    const event = result.events[0];
    expect(event?.kind).toBe("intent-executed");
    expect(event?.kind === "intent-executed" && event.detail).toBe("node=edge,open=now,close=480");
  });

  it("a future open edge rides the entry verbatim and spells the detail", () => {
    const result = applyIntentDoor(baseState(), ctx(1n), [
      ext(1n, 1, { ...ARM, openAtBusinessMinute: 43_200, closeAtBusinessMinute: 57_600 }),
    ]);
    expect(result.state.schedule?.entries.get(IDS.edge)).toEqual({
      openAtBusinessMinute: 43_200,
      closeAtBusinessMinute: 57_600,
      shippedAtTick: 1n,
    });
    expect(result.events[0]?.kind === "intent-executed" && result.events[0].detail).toBe(
      "node=edge,open=43200,close=57600",
    );
  });

  it("calendar-tap occupancy ladder: 1 hand, 1 tick, busyUntil = tick + 1 (the 26-hour law — cheap re-arm)", () => {
    expect(DEFAULT_INTENT_HAND_COST[PlayerVerb.ScheduleWindow]).toBe(1);
    expect(DEFAULT_INTENT_OCCUPANCY_TICKS[PlayerVerb.ScheduleWindow]).toBe(1);
    const result = applyIntentDoor(baseState(1), ctx(5n), [ext(5n, 1, ARM)]);
    const event = result.events[0];
    expect(event?.kind === "intent-executed" && event.handIndexes).toEqual([0]);
    expect(event?.kind === "intent-executed" && event.busyUntilTick).toBe(6n);
  });

  it("re-arming the SAME window is last-write-wins COW: version 2, one entry (the window that MOVED)", () => {
    const first = applyIntentDoor(baseState(), ctx(1n), [ext(1n, 1, ARM)]);
    const book1 = first.state.schedule as JobWindowBook;
    const second = applyIntentDoor(first.state, ctx(2n), [
      ext(2n, 2, { ...ARM, closeAtBusinessMinute: 504 }), // 06:00 slides to 06:24
    ]);
    const book2 = second.state.schedule as JobWindowBook;
    expect(book2.version).toBe(2);
    expect(book2.entries.size).toBe(1);
    expect(book2.entries.get(IDS.edge)).toEqual({
      openAtBusinessMinute: null,
      closeAtBusinessMinute: 504,
      shippedAtTick: 2n,
    });
    expect(book1.entries.get(IDS.edge)?.closeAtBusinessMinute).toBe(480);
    expect(book2.entries).not.toBe(book1.entries);
  });

  it("distinct nodes accumulate (two entries, version 2); scope audit keeps origin slices identical", () => {
    const before = baseState();
    const first = applyIntentDoor(before, ctx(1n), [ext(1n, 1, ARM)]);
    const second = applyIntentDoor(first.state, ctx(1n), [
      ext(1n, 2, { ...ARM, targetNodeId: IDS.origin }),
    ]);
    expect(second.state.schedule?.version).toBe(2);
    expect(second.state.schedule?.entries.size).toBe(2);
    expect(second.state.nodes).toBe(before.nodes);
    expect(second.state.lanes).toBe(before.lanes);
    expect(second.state.observed).toBe(before.observed);
    expect(second.state.cash).toBe(before.cash);
    // the §7.7 separation: a booked DEADLINE is not a damage record — the
    // recovery slice is neither read nor written by this door path:
    expect(second.state.recovery).toBeUndefined();
  });
});

/* ═══════════════════ refusals — two reused codes + one honest new phrase ═══════════════════ */

describe("schedule-window — refusals (bad-window-band is the one new phrase; header discloses)", () => {
  const feed = (args: unknown) =>
    applyIntentDoor(baseState(5), ctx(1n), [ext(1n, 1, args as PlayerVerbArgs)]);

  it("empty-node-id is the bare-code guard (place-device family, reused verbatim)", () => {
    expect(refused(feed({ ...ARM, targetNodeId: "" as EntityId }), 1)).toBe("empty-node-id");
  });

  it("bad-window-band refuses close<=open / negative / fractional edges", () => {
    expect(refused(feed({ ...ARM, closeAtBusinessMinute: -5 }), 1)).toMatch(
      /^bad-window-band: open=null must be null or a safe integer >= 0, close=-5 a safe integer >= 0 strictly after open$/,
    );
    expect(refused(feed({ ...ARM, openAtBusinessMinute: 480, closeAtBusinessMinute: 480 }), 1)).toMatch(
      /^bad-window-band: open=480 .* close=480/,
    );
    expect(refused(feed({ ...ARM, openAtBusinessMinute: 500, closeAtBusinessMinute: 499 }), 1)).toMatch(
      /^bad-window-band: open=500 .* close=499/,
    );
    expect(refused(feed({ ...ARM, openAtBusinessMinute: -1 }), 1)).toMatch(
      /^bad-window-band: open=-1/,
    );
    expect(refused(feed({ ...ARM, closeAtBusinessMinute: Number.NaN }), 1)).toMatch(
      /^bad-window-band: .* close=NaN/,
    );
    expect(refused(feed({ ...ARM, closeAtBusinessMinute: Number.MAX_SAFE_INTEGER + 2 }), 1)).toMatch(
      // 2^53 lands EXACTLY (MAX_SAFE_INTEGER + 1 rounds to it): beyond the
      // safe-int wall the door refuses the number it actually received.
      /^bad-window-band: .* close=9007199254740992/,
    );
  });

  it("open=null with close=0 EXECUTES — expired-at-booking is inert at read, not malformed", () => {
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
    const book = seeded.state.schedule as JobWindowBook;
    const next = applyIntentDoor(seeded.state, ctx(4n), [
      ext(4n, 2, { ...ARM, openAtBusinessMinute: 900, closeAtBusinessMinute: 100 }),
    ]);
    expect(next.state.schedule).toBe(book);
    expect(next.state.schedule?.entries.size).toBe(1);
    const busy = (next.state.hands?.tokens ?? []).filter((t) => t.busyUntilTick !== null && t.busyUntilTick > 4n);
    expect(busy.length).toBe(0);
  });
});

/* ═══════════════════════════ M2 wire wall ═══════════════════════════ */

describe("schedule-window — M2 structural wall (throws, never refuses)", () => {
  const forge = (args: Record<string, unknown>) =>
    applyIntentDoor(baseState(2), ctx(1n), [ext(1n, 1, args as unknown as PlayerVerbArgs)]);

  it("a missing arg key is structural garbage — the door THROWS (all three keys pinned)", () => {
    expect(() => forge({ verb: PlayerVerb.ScheduleWindow, targetNodeId: "edge", closeAtBusinessMinute: 480 })).toThrow(IntentDoorError);
    expect(() => forge({ verb: PlayerVerb.ScheduleWindow, targetNodeId: "edge", openAtBusinessMinute: null })).toThrow(IntentDoorError);
    expect(() => forge({ verb: PlayerVerb.ScheduleWindow, openAtBusinessMinute: null, closeAtBusinessMinute: 480 })).toThrow(IntentDoorError);
  });

  it("wrong wire TYPES throw: number node id, string close, bigint minute, undefined-as-null", () => {
    expect(() => forge({ ...ARM, targetNodeId: 42 })).toThrow(IntentDoorError);
    expect(() => forge({ ...ARM, closeAtBusinessMinute: "480" })).toThrow(IntentDoorError);
    expect(() => forge({ ...ARM, openAtBusinessMinute: 480n })).toThrow(IntentDoorError);
    expect(() => forge({ ...ARM, openAtBusinessMinute: undefined })).toThrow(IntentDoorError);
  });

  it("the explicit null sentinel is the ONLY 'opens now' form", () => {
    expect(outcomeOf(forge({ ...ARM, openAtBusinessMinute: null }), 1)).toBe("executed");
  });
});

/* ═══════════════════════════ digest-switch law ═══════════════════════════ */

describe("schedule-window — the digest switch", () => {
  it("absent book ⇒ digest byte-identical to the untouched state (zero movement)", () => {
    const before = baseState();
    expect(digestState(before)).toBe(digestState(baseState()));
    const result = applyIntentDoor(before, ctx(1n), [
      ext(1n, 1, { ...ARM, targetNodeId: asEntityId("ghost") }),
    ]);
    expect(digestState(result.state)).toBe(digestState(before));
  });

  it("present book moves the digest; empty book counts as present (embed law)", () => {
    const before = baseState();
    const planted = applyIntentDoor(before, ctx(1n), [ext(1n, 1, ARM)]);
    expect(digestState(planted.state)).not.toBe(digestState(before));
    const emptyBook: GameState = Object.freeze({ ...before, schedule: createJobWindowBook() });
    expect(digestState(emptyBook)).not.toBe(digestState(before));
    expect(digestState(emptyBook)).not.toBe(digestState(planted.state));
  });

  it("insertion-order-independent: same bands, different Map order, SAME digest", () => {
    const forward: JobWindowBook = jobBook(
      new Map([[IDS.edge, seedBand(null, 480, 1n)], [IDS.origin, seedBand(10, 900, 1n)]]),
    );
    const reverse: JobWindowBook = jobBook(
      new Map([[IDS.origin, seedBand(10, 900, 1n)], [IDS.edge, seedBand(null, 480, 1n)]]),
    );
    const before = baseState();
    expect(digestState(Object.freeze({ ...before, schedule: forward }))).toBe(
      digestState(Object.freeze({ ...before, schedule: reverse })),
    );
  });

  it("every absorbed field PARTICIPATES — falsifiable twins per column", () => {
    const before = baseState();
    const digests = [
      seedBand(null, 480, 1n),
      seedBand(0, 480, 1n), // open: null sentinel (-1) vs real minute 0 are DIFFERENT bookings
      seedBand(5, 480, 1n), // open edge moves it
      seedBand(null, 481, 1n), // close edge moves it (one minute is the whole disaster)
      seedBand(null, 480, 2n), // shippedAtTick moves it
    ].map((entry) => digestState(Object.freeze({ ...before, schedule: jobBook(new Map([[IDS.edge, entry]])) })));
    expect(new Set(digests).size).toBe(digests.length);
  });

  it("the two books digest INDEPENDENTLY — identical numbers in maintain vs schedule are different orders", () => {
    // block labels differ, so the same band in the wrong book is a DIFFERENT
    // state (no cross-book aliasing in the digest):
    const before = baseState();
    const band = seedBand(null, 60, 1n);
    // JobWindow and MaintainWindow are STRUCTURALLY identical by design (the
    // shared band law) — the same row in different books is different state:
    const maintainTwin: MaintainBook = { version: 1, entries: Object.freeze(new Map([[IDS.edge, band]])) };
    const inMaintain = digestState(Object.freeze({ ...before, maintain: maintainTwin }));
    const inSchedule = digestState(Object.freeze({ ...before, schedule: jobBook(new Map([[IDS.edge, band]])) }));
    expect(inMaintain).not.toBe(inSchedule);
    // and an EMPTY sibling book rides presence, not shape: empty maintain +
    // live schedule ≠ live schedule alone (two absorbed blocks vs one):
    const withEmptyMaintain = digestState(
      Object.freeze({ ...before, maintain: createMaintainBook(), schedule: jobBook(new Map([[IDS.edge, band]])) }),
    );
    expect(withEmptyMaintain).not.toBe(inSchedule);
  });
});
