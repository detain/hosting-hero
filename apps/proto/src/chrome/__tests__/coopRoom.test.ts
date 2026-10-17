/**
 * Incident Room LAW test — the pure coopRoom.ts state machine over the two
 * ratified engine contracts (save/coop seat ledger + replay/coopTimeline
 * shared log). Every refusal asserted here is the ENGINE's own sentence
 * re-thrown, never chrome's paraphrase; the panel is a witness (Law 4).
 */
import { describe, expect, it } from "vitest";
import { digestCoopTimeline } from "@hh/sim-core/replay";
import {
  guardCoopAttributionBatch,
  participantSeatedAt,
  seatParticipant,
  withMuseumAttribution,
} from "@hh/sim-core/save";
import type { CoopAttributionBatch, MuseumExhibitRecord } from "@hh/sim-core/save";
import { asEntityId, asRunSeed } from "@hh/sim-core/types";
import type { EntityId, SimTick } from "@hh/sim-core/types";
import {
  advanceClock,
  attributionGuardStatus,
  attributionPreview,
  buildTape,
  coopRoomLedger,
  createCoopRoom,
  digestEquivalenceProbe,
  joinSeat,
  mergeFeeds,
  participantLabel,
  pendingFeedOf,
  replayLastRelay,
  roomDigest,
  stageRecord,
  vacateSeatInRoom,
  type CoopRoomState,
} from "../coopRoom";

const A = asEntityId("a");
const B = asEntityId("b");
const C = asEntityId("c");
const D = asEntityId("d");
const E = asEntityId("e");
const STRANGER = asEntityId("zz");

/** Both demo seats, one per relay tick: A seated at t1, B seated at t2. */
function seatedRoom(): CoopRoomState {
  let s = joinSeat(advanceClock(createCoopRoom()), A); // t=1
  s = joinSeat(advanceClock(s), B); // t=2
  return s;
}

describe("coopRoom — relay merge & the shared-log ordering laws", () => {
  it("drain merges per-seat feeds into one strict (tick, seq) total order", () => {
    let s = seatedRoom();
    s = advanceClock(s); // t=3
    s = stageRecord(s, B, "note"); // (3,1)
    s = advanceClock(s); // t=4
    s = stageRecord(s, A, "sightline"); // (4,1) — seat A's pid sorts FIRST in the flat feed
    const merged = mergeFeeds(s);
    expect(merged.log.map((r) => `${r.tick}:${r.seq}`)).toEqual(["3:1", "4:1"]); // re-ordered despite feed order
    expect(merged.pending.size).toBe(0);
    const tape = buildTape(merged, 10);
    expect(tape.map((row) => row.key)).toEqual(["4:1", "3:1"]); // newest first
    expect(tape[0]?.label).toBe("Seat A");
    expect(tape[1]?.label).toBe("Seat B");
  });

  it("a double-send is refused LOUD by the append law, naming BOTH positions — the log is never mutated", () => {
    let s = seatedRoom();
    s = stageRecord(s, A, "note"); // (2,1)
    s = advanceClock(s); // t=3
    s = stageRecord(s, B, "note"); // (3,1)
    const merged = mergeFeeds(s);
    const dupped = replayLastRelay(merged); // clone of (3,1) re-enters B's feed
    expect(() => mergeFeeds(dupped)).toThrowError(
      /\(3, 1\) appears at both positions 1 and 2/,
    );
    // the failed drain left nothing behind — pure law, no half-merged state:
    expect(dupped.log.map((r) => `${r.tick}:${r.seq}`)).toEqual(["2:1", "3:1"]);
    expect(dupped.pending.size).toBe(1);
  });

  it("an empty log has nothing to double-send — coop-room[nothing-relayed]", () => {
    expect(() => replayLastRelay(seatedRoom())).toThrowError(/coop-room\[nothing-relayed\]/);
  });

  it("the interleave probe: 4 arrival shuffles of one logical set → ONE digest; the tamper control differs", () => {
    let s = seatedRoom();
    s = advanceClock(s); // t=3
    s = stageRecord(s, A, "note"); // (3,1)
    s = advanceClock(s); // t=4
    s = stageRecord(s, B, "note"); // (4,1)
    s = stageRecord(s, A, "action", "escalate"); // (4,2)
    const probe = digestEquivalenceProbe(s);
    expect(probe.records).toBe(3);
    expect(probe.arms).toHaveLength(4);
    expect(probe.invariantsHold).toBe(true);
    expect(new Set(probe.arms.map((arm) => arm.digest)).size).toBe(1);
    expect(probe.controlDiffers).toBe(true);
    expect(probe.collision).toBeNull();
    // draining MOVES the records but cannot MOVE the hash:
    expect(probe.arms[0]?.digest).toBe(roomDigest(mergeFeeds(s)));
  });

  it("a staged duplicate holds the probe with the engine's ambiguity wording (surfaced, never swallowed)", () => {
    let s = seatedRoom();
    s = stageRecord(s, A, "note");
    const merged = mergeFeeds(s);
    const dupped = replayLastRelay(merged);
    const probe = digestEquivalenceProbe(dupped);
    expect(probe.collision).toMatch(/claimed by two records/);
    expect(probe.invariantsHold).toBe(false);
    expect(probe.arms).toEqual([]);
    // the merged-log digest stays honest while the probe is held:
    expect(probe.digest).toBe(roomDigest(merged));
  });

  it("empty-room honesty: zero seats, zero records, the SAME digest machinery answers", () => {
    const s = createCoopRoom();
    expect(s.tick).toBe(0n);
    expect(buildTape(s, 10)).toEqual([]);
    expect(roomDigest(s)).toBe(digestCoopTimeline([]));
    const probe = digestEquivalenceProbe(s);
    expect(probe.records).toBe(0);
    expect(probe.invariantsHold).toBe(true); // one (empty-set) digest across all arms
    expect(probe.controlDiffers).toBeNull(); // nothing to tamper — no fake green
    expect(probe.collision).toBeNull();
  });
});

describe("coopRoom — seat ledger laws (save/coop, driven through the projection)", () => {
  it("half-open window: a record AT leftAtTick is a ghost, a record BEFORE it is valid", () => {
    let s = seatedRoom(); // A seated since t1, B since t2
    s = stageRecord(s, A, "note"); // (2,1) — inside A's window [1, ?)
    s = advanceClock(s); // t=3
    s = vacateSeatInRoom(s, A); // A closes [1,3)
    s = stageRecord(s, A, "note"); // (3,1) — staged post-vacate: a ghost author
    const merged = mergeFeeds(s);
    const tape = buildTape(merged, 10);
    const ghost = tape.find((row) => row.tick === "3");
    const valid = tape.find((row) => row.tick === "2");
    expect(ghost?.seated).toBe(false);
    expect(valid?.seated).toBe(true);
    const ghostRecord = merged.log.find((r) => r.tick === 3n);
    expect(ghostRecord).toBeDefined();
    const preview = attributionPreview(merged, ghostRecord!);
    expect(preview.recorded).toBe(true); // the tenure is history, the author is recorded
    expect(preview.reasons.join(" ")).toMatch(/not seated at tick 3 \(half-open \[joined, left\)\)/);
  });

  it("never-recorded authors are refused with the guard's not-in-ledger wording", () => {
    const staged = stageRecord(seatedRoom(), C, "note"); // C never joined
    const merged = mergeFeeds(staged);
    const record = merged.log.find((r) => r.participantId === C);
    expect(record).toBeDefined();
    const preview = attributionPreview(merged, record!);
    expect(preview.recorded).toBe(false);
    expect(preview.seated).toBe(false);
    expect(preview.reasons.join(" ")).toMatch(/not recorded in the seat ledger/);
  });

  it("MAX_SEAT_WRITERS: four fit, the fifth join is refused by the engine's sentence", () => {
    let s = joinSeat(advanceClock(createCoopRoom()), A); // t=1
    for (const seat of [B, C, D]) s = joinSeat(advanceClock(s), seat); // t=2,3,4
    expect(coopRoomLedger(s).seatHolders).toHaveLength(4);
    expect(() => joinSeat(advanceClock(s), E)).toThrowError(/5 simultaneous writers at tick 5/);
    expect(() => joinSeat(advanceClock(s), E)).toThrowError(/seats at most 4/);
  });

  it("two joins sharing one tick are ACCEPTED, canonically ordered by participantId (L-RH law 1 — v0 refusal retired)", () => {
    const ab = joinSeat(joinSeat(advanceClock(createCoopRoom()), A), B); // both join at t=1
    const ba = joinSeat(joinSeat(advanceClock(createCoopRoom()), B), A); // same set, flipped submission order
    // the room's display history keeps what was submitted first ...
    expect(ab.tenures.map((r) => r.participantId)).toEqual([A, B]);
    expect(ba.tenures.map((r) => r.participantId)).toEqual([B, A]);
    // ... but the engine ledger is a FUNCTION OF THE ROW SET: same-tick seats
    // ascend by participantId code-unit, so both submission orders converge to
    // the identical ledger (mirror of tools/relay's bob-then-alice ==
    // alice-then-bob equality pin @6d0bc1e). The 5-writer cap still refuses —
    // canonical order changes the sort, not the cap (pinned in the MAX test).
    expect(coopRoomLedger(ab).seatHolders.map((r) => r.participantId)).toEqual([A, B]);
    expect(coopRoomLedger(ba).seatHolders.map((r) => r.participantId)).toEqual([A, B]);
    expect(coopRoomLedger(ba).seatHolders.map((r) => r.joinedAtTick)).toEqual([1n, 1n]);
  });

  it("re-join is ACCEPTED as a new tenure row — attribution resolves per tenure, the gap stays a ghost (L-RH law 2)", () => {
    let s = seatedRoom(); // A [1,?), B [2,?)
    s = vacateSeatInRoom(s, A); // t=2 — A closes tenure one [1,2)
    s = advanceClock(s); // t=3
    s = joinSeat(s, A); // re-join: NEW row [3,?) — room AND engine both accept it
    expect(s.tenures.filter((r) => r.participantId === A)).toHaveLength(2);
    expect(coopRoomLedger(s).seatHolders).toHaveLength(2); // the room's latest-row-per-participant authority
    expect(
      attributionPreview(s, { participantId: A, tick: 3n, seq: 1, kind: "note", payload: {} }).seated,
    ).toBe(true); // the new window restores attribution through the room's mouth
    // The raw two-row history is what the retired v0 ban refused ("one tenure
    // row per participant"); L-RH law 2 accepts disjoint, chronologically
    // ordered tenures — pinned as ACCEPTANCE on the raw fold:
    const closed = s.tenures.find((r) => r.participantId === A && r.leftAtTick !== undefined);
    const open = s.tenures.find((r) => r.participantId === A && r.leftAtTick === undefined);
    const bRow = s.tenures.find((r) => r.participantId === B);
    expect(closed).toBeDefined();
    expect(open).toBeDefined();
    expect(bRow).toBeDefined();
    const raw = seatParticipant(seatParticipant(seatParticipant(undefined, closed!), bRow!), open!);
    expect(raw.seatHolders.map((r) => [r.participantId, r.joinedAtTick])).toEqual([
      [A, 1n],
      [B, 2n],
      [A, 3n],
    ]);
    // per-tenure resolution: seated inside EITHER enclosing window, never in
    // the gap — participantSeatedAt's own half-open law, not a projection trick:
    expect(participantSeatedAt(raw, A, 1n)).toBe(true);
    expect(participantSeatedAt(raw, A, 2n)).toBe(false); // the gap [2,3) stays unseated
    expect(participantSeatedAt(raw, A, 3n)).toBe(true);
    // falsifier with the guard's OWN sentence (save/coop.ts
    // guardCoopAttributionBatch): a write stamped inside the gap is refused,
    // the same write inside tenure two passes — the re-join restores the
    // author's attribution WITHOUT erasing the ghost between tenures.
    const exhibit = withMuseumAttribution(
      {
        id: asEntityId("ex-gap"),
        sourceFacet: "postmortems",
        sourceRef: "pm-gap",
        title: "Gap witness",
        runId: asEntityId("run-cooproom"),
        runSeed: asRunSeed(904n),
        acquiredAtTick: 3n,
        deprecated: false,
        memorialNote: null,
      } satisfies MuseumExhibitRecord,
      A,
    );
    const writeAt = (tick: SimTick): CoopAttributionBatch => ({
      runId: asEntityId("run-cooproom"),
      committedAtTick: tick,
      writes: [{ facet: "museum", participantId: A, record: exhibit }],
    });
    expect(() => guardCoopAttributionBatch(writeAt(2n), raw)).toThrowError(/author "a" is not seated at tick 2/);
    expect(() => guardCoopAttributionBatch(writeAt(3n), raw)).not.toThrow();
  });

  it("vacate is the engine's sentence: unknown seat / double-vacate both refuse LOUD", () => {
    const s = seatedRoom();
    expect(() => vacateSeatInRoom(s, C)).toThrowError(/no seat row to leave/);
    const left = vacateSeatInRoom(s, A);
    expect(() => vacateSeatInRoom(left, A)).toThrowError(/already left at tick/);
  });

  it("guard arms at COOP_MIN_SEAT_WRITERS, with the 2–4 law in its note", () => {
    const solo = joinSeat(advanceClock(createCoopRoom()), A);
    const idle = attributionGuardStatus(solo);
    expect(idle.armed).toBe(false);
    expect(idle.note).toMatch(/1 of 2 minimum writers/);
    const two = joinSeat(advanceClock(solo), B);
    const armed = attributionGuardStatus(two);
    expect(armed.armed).toBe(true);
    expect(armed.note).toMatch(/law: 2–4/);
  });

  it("closed cast & boundary parse: strangers, off-vocab kinds and re-seats all throw coop-room codes", () => {
    const s = seatedRoom();
    expect(() => joinSeat(s, STRANGER)).toThrowError(/coop-room\[unknown-participant\]/);
    expect(() => stageRecord(s, STRANGER, "note")).toThrowError(/coop-room\[unknown-participant\]/);
    expect(() => joinSeat(s, A)).toThrowError(/coop-room\[already-seated\]/);
    expect(() => stageRecord(s, A, "hack" as never)).toThrowError(/not in \{action\|sightline\|note\}/);
    expect(() => stageRecord(s, A, "action", "detonate")).toThrowError(/coop-room\[bad-verb\]/);
  });

  it("pending feeds are per-seat and newest-first in the column view", () => {
    let s = seatedRoom();
    s = stageRecord(s, A, "note"); // (2,1)
    s = stageRecord(s, A, "sightline"); // (2,2)
    s = stageRecord(s, B, "note"); // (2,3)
    expect(pendingFeedOf(s, A).map((row) => row.seq)).toEqual([2, 1]);
    expect(pendingFeedOf(s, B).map((row) => row.seq)).toEqual([3]);
    expect(pendingFeedOf(s, C)).toEqual([]);
    expect(participantLabel(A)).toBe("Seat A");
  });
});
