/**
 * Incident Room LAW test — the pure coopRoom.ts state machine over the two
 * ratified engine contracts (save/coop seat ledger + replay/coopTimeline
 * shared log). Every refusal asserted here is the ENGINE's own sentence
 * re-thrown, never chrome's paraphrase; the panel is a witness (Law 4).
 */
import { describe, expect, it } from "vitest";
import { digestCoopTimeline } from "@hh/sim-core/replay";
import { seatParticipant } from "@hh/sim-core/save";
import { asEntityId } from "@hh/sim-core/types";
import type { EntityId } from "@hh/sim-core/types";
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

  it("two joins sharing one tick are refused — the ledger is append-only history", () => {
    const joined = joinSeat(advanceClock(createCoopRoom()), A); // t=1
    expect(() => joinSeat(joined, B)).toThrowError(/not after .*append-only history/);
  });

  it("re-join lands a NEW tenure row in history; the engine ledger sees the projection — the ban is the ENGINE's", () => {
    let s = joinSeat(advanceClock(createCoopRoom()), A); // A [1, ?)
    s = advanceClock(s); // t=2
    s = vacateSeatInRoom(s, A); // A [1,2) closed
    s = advanceClock(s); // t=3
    s = joinSeat(s, A); // re-join: NEW row [3, ?)
    expect(s.tenures.filter((r) => r.participantId === A)).toHaveLength(2);
    const ledger = coopRoomLedger(s);
    expect(ledger.seatHolders).toHaveLength(1); // the v0 one-row projection
    expect(ledger.seatHolders[0]?.joinedAtTick).toBe(3n);
    expect(
      attributionPreview(s, { participantId: A, tick: 3n, seq: 1, kind: "note", payload: {} }).seated,
    ).toBe(true); // the new window restores attribution
    // the raw two-row history is exactly what save/coop v0 refuses — the
    // projection is forced by the engine, not invented by chrome:
    const closed = s.tenures.find((r) => r.participantId === A && r.leftAtTick !== undefined);
    const open = s.tenures.find((r) => r.participantId === A && r.leftAtTick === undefined);
    expect(closed).toBeDefined();
    expect(open).toBeDefined();
    expect(() => seatParticipant(seatParticipant(undefined, closed!), open!)).toThrowError(
      /one tenure row per participant/,
    );
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
