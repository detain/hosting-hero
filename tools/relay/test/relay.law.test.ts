/**
 * RELAY LAW TESTS (ADR-0014 #D6 spike) — the seat ledger, the stamping door,
 * and the ADR-0013 ruling-2 attribution guard, all exercised THROUGH the relay
 * exactly as a Node host would drive them.
 */

import { describe, expect, it } from "vitest";
import { asCauseId, asEntityId, asRunSeed, PlayerVerb } from "@hh/sim-core/types";
import type { MuseumExhibitRecord, ScarRecord } from "@hh/sim-core/save";
import {
  commitCoopAttribution,
  guardCoopAttributionBatch,
  newCompanyNode,
  withMuseumAttribution,
  withScarAttribution,
  COOP_MAX_SEAT_WRITERS,
  COOP_MIN_SEAT_WRITERS,
} from "@hh/sim-core/save";
import { assertCoopTimelineAppendOrder, digestCoopTimeline, orderCoopTimeline } from "@hh/sim-core/replay";
import type { CoopTimelineRecord } from "@hh/sim-core/replay";
import type { PlayerVerbPayload } from "@hh/sim-core/types";
import {
  assertRelayAppendStep,
  createCoopRelay,
  pageCoopLog,
  RELAY_ACTION_BUILDERS,
  RelayError,
} from "../src/relay.ts";

const ALICE = "alice";
const BOB = "bob";

function twoSeatRelay(): ReturnType<typeof createCoopRelay> {
  const relay = createCoopRelay();
  relay.joinSeat(ALICE); // tick 0
  relay.advanceTo(1n);
  relay.joinSeat(BOB); // staggered by script choice — same-tick is legal since L-RH law 1
  return relay;
}

function placeAction(nodeId: string): { args: Record<string, unknown> } {
  return { args: { verb: PlayerVerb.PlaceDevice, nodeId, deviceKind: "server", template: null } };
}

function scarFor(id: string, author: string): ScarRecord {
  const base: ScarRecord = {
    id: asEntityId(id),
    originEventRef: asCauseId(`incident:spike:${id}`),
    acquiredAtTick: 8n,
    modifierPayload: {},
    clearance: { rule: "90_clean_days", progress: 0 },
    disclosure: "disclosed",
    payoffGrant: null,
    mapPosition: null,
  };
  return withScarAttribution(base, asEntityId(author));
}

function exhibitFor(id: string, author: string): MuseumExhibitRecord {
  const base: MuseumExhibitRecord = {
    id: asEntityId(id),
    sourceFacet: "incident",
    sourceRef: `spike:${id}`,
    title: `Spike exhibit ${id}`,
    runId: asEntityId("run-spike-1"),
    runSeed: asRunSeed(904n),
    acquiredAtTick: 8n,
    deprecated: false,
    memorialNote: null,
  };
  return withMuseumAttribution(base, asEntityId(author));
}

function record(participantId: string, tick: bigint, seq: number, kind: "action" | "sightline" | "note"): CoopTimelineRecord {
  return {
    participantId: asEntityId(participantId),
    tick,
    seq,
    kind,
    payload: { note: `${participantId}@${tick}:${seq}:${kind}` },
  };
}

describe("relay seat ledger (save/coop law over a Node host)", () => {
  it("seats two writers and the ledger passes validation", () => {
    const relay = twoSeatRelay();
    expect(relay.ledger().seatHolders).toHaveLength(2);
    expect(relay.isSeated(ALICE)).toBe(true);
    expect(relay.isSeated(BOB, 0n)).toBe(false); // half-open [joined,left)
  });

  it("refuses a fifth concurrent writer with the branch-seat cap", () => {
    const relay = createCoopRelay();
    relay.joinSeat("w1");
    for (const [i, pid] of ["w2", "w3", "w4"].entries()) {
      relay.advanceTo(BigInt(i + 1));
      relay.joinSeat(pid);
    }
    relay.advanceTo(4n);
    expect(() => relay.joinSeat("w5")).toThrowError(
      new RegExp(`seats at most ${COOP_MAX_SEAT_WRITERS}`),
    );
  });

  it("same-tick joins land in canonical code-unit order regardless of submission order (L-RH law 1 — v0 refusal retired)", () => {
    const ab = createCoopRelay();
    ab.joinSeat(ALICE); // tick 0
    ab.joinSeat(BOB); // same tick 0 — legal since L-RH: the ledger sorts, not staggers
    expect(ab.ledger().seatHolders.map((s) => s.participantId)).toEqual([ALICE, BOB]);

    const ba = createCoopRelay();
    ba.joinSeat(BOB);
    ba.joinSeat(ALICE);
    // order-independence: the same tenure SET folds to the same ledger bytes
    expect(ba.ledger().seatHolders.map((s) => s.participantId)).toEqual([ALICE, BOB]);

    // falsifier: canonical order changes the sort, not the cap — a same-tick crowd of five refuses
    const crowd = createCoopRelay();
    for (const pid of ["w1", "w2", "w3", "w4"]) crowd.joinSeat(pid);
    expect(() => crowd.joinSeat("w5")).toThrowError(/seats at most 4/);
    expect(() => crowd.joinSeat("w5")).toThrowError(/simultaneous writers at tick 0/);
  });

  it("re-join after leave lands a NEW tenure row and restores the window (L-RH law 2 — v0 refusal retired)", () => {
    const relay = twoSeatRelay(); // alice [0,?), bob [1,?)
    relay.advanceTo(5n);
    relay.leaveSeat(ALICE); // tenure 1 closes [0,5)
    relay.advanceTo(6n);
    relay.joinSeat(ALICE); // tenure 2 opens [6,?) — ADR-0014 #D6 re-join-as-new-row
    expect(relay.ledger().seatHolders.filter((s) => s.participantId === ALICE)).toHaveLength(2);
    expect(relay.isSeated(ALICE, 4n)).toBe(true); // first window
    expect(relay.isSeated(ALICE, 5n)).toBe(false); // the gap
    expect(relay.isSeated(ALICE, 6n)).toBe(true); // second window
    relay.advanceTo(7n);
    expect(() => relay.submit(ALICE, "note", { text: "back at it" })).not.toThrow(); // ghost law per TENURE
    // falsifier: joining while a tenure is still open refuses LOUD
    expect(() => relay.joinSeat(ALICE)).toThrowError(/one tenure at a time/);
    // and vacate closes the OPEN row, not the participant's first row
    const after = relay.leaveSeat(ALICE);
    expect(after.seatHolders.filter((s) => s.participantId === ALICE && s.leftAtTick === undefined)).toHaveLength(0);
  });

  it("ghost-intent law survives the tenure cycle: the gap tick still refuses", () => {
    const relay = twoSeatRelay();
    relay.advanceTo(5n);
    relay.leaveSeat(ALICE); // [0,5) closed
    relay.submit(BOB, "note", { text: "gap" }); // (5,0)
    relay.advanceTo(6n);
    relay.joinSeat(ALICE); // [6,?) opens
    expect(() => relay.submit(ALICE, "note", { text: "late" })).not.toThrow(); // (6,1) — R1: the stream continues, no per-tick reset
    // bob's inbox saw every stamp; alice's frozen inbox caught up at re-join (law 3)
    expect(relay.inbox(BOB).map((r) => `${r.tick}:${r.seq}`)).toEqual(["5:0", "6:1"]);
  });

  it("broadcast fans out to current seats only — departed inbox freezes at vacate", () => {
    const relay = twoSeatRelay();
    relay.submit(ALICE, "note", { text: "seen while seated" }); // tick 1
    const frozenAt = relay.inbox(ALICE).length;
    relay.advanceTo(5n);
    relay.leaveSeat(ALICE);
    relay.submit(BOB, "note", { text: "after alice left" }); // tick 5
    relay.advanceTo(6n);
    relay.submit(BOB, "note", { text: "still after" }); // tick 6
    expect(relay.sharedLog()).toHaveLength(3); // the log grew regardless...
    expect(relay.inbox(BOB)).toHaveLength(3); // ...the seated inbox keeps growing...
    expect(relay.inbox(ALICE)).toHaveLength(frozenAt); // ...the departed one is history, frozen
    // and the frozen inbox is NOT retroactively fed while the seat stays closed —
    // catch-up (L-RH law 3) is a JOIN event, not a broadcast widening (@24426ec stands)
    expect(relay.inbox(ALICE).map((r) => `${r.tick}:${r.seq}`)).toEqual(["1:0"]);
  });
});

describe("relay joiner catch-up (L-RH law 3 — relay-side history delivery, zero save writes)", () => {
  it("a mid-run joiner receives the shared log as of the join tick, canonically ordered", () => {
    const relay = createCoopRelay();
    relay.joinSeat(ALICE); // t0
    relay.submit(ALICE, "note", { text: "before bob" }); // (0,0)
    relay.advanceTo(2n);
    relay.submit(ALICE, "action", placeAction("n-1")); // (2,1) — R1: one lifetime stream, never reset
    relay.advanceTo(3n);
    relay.joinSeat(BOB); // mid-run join — v0 delivered NOTHING here
    expect(relay.inbox(BOB).map((r) => `${r.tick}:${r.seq}`)).toEqual(["0:0", "2:1"]);
    // per-seat inbox semantics stay: the door feed filters to the action arm
    expect(relay.feedFor(BOB)).toHaveLength(1);
    expect(relay.feedFor(BOB)).toStrictEqual(relay.feedFor(ALICE).slice(-1));
    expect(relay.inbox(ALICE)).toHaveLength(2); // the seated writer holds the same two records
  });

  it("a re-joiner receives only the tail missed while departed — no record delivered twice", () => {
    const relay = createCoopRelay();
    relay.joinSeat(ALICE);
    relay.advanceTo(1n);
    relay.joinSeat(BOB); // empty-log catch-up — still a legal two-seat company
    relay.submit(BOB, "note", { text: "seen" }); // (1,0) — alice seated, receives
    relay.advanceTo(5n);
    relay.leaveSeat(ALICE); // her inbox freezes at (1,0)
    relay.submit(BOB, "note", { text: "missed-1" }); // (5,1)
    relay.advanceTo(6n);
    relay.submit(BOB, "note", { text: "missed-2" }); // (6,2)
    relay.advanceTo(7n);
    relay.joinSeat(ALICE); // re-join: tail-only delivery
    const stamps = relay.inbox(ALICE).map((r) => `${r.tick}:${r.seq}`);
    expect(stamps).toEqual(["1:0", "5:1", "6:2"]);
    // falsifiable no-double-delivery law: strict (tick,seq) ascent — feedFor
    // runs orderCoopTimeline, which THROWS on any duplicated stamp
    expect(() => relay.feedFor(ALICE)).not.toThrow();
    expect(relay.sharedLog()).toHaveLength(3); // delivery never grows the shared log
  });

  it("catch-up is join-scoped: a seat never re-opened stays frozen forever", () => {
    const relay = createCoopRelay();
    relay.joinSeat(ALICE);
    relay.submit(ALICE, "note", { text: "opening" }); // (0,0)
    relay.advanceTo(1n);
    relay.joinSeat(BOB); // catch-up gives bob (0,0) as well
    relay.submit(BOB, "note", { text: "together" }); // (1,0)
    relay.advanceTo(5n);
    relay.leaveSeat(ALICE); // her inbox freezes at [(0,0),(1,1)]
    for (let t = 5n; t < 9n; t += 1n) {
      relay.submit(BOB, "note", { text: `t${t}` });
    }
    expect(relay.inbox(ALICE).map((r) => `${r.tick}:${r.seq}`)).toEqual(["0:0", "1:1"]);
    relay.advanceTo(9n);
    relay.submit(BOB, "note", { text: "post" }); // (9,6) — R1: stream continues, never resets
    expect(relay.inbox(ALICE)).toHaveLength(2); // no join, no catch-up
    expect(relay.sharedLog()).toHaveLength(7);
  });
});

describe("relay stamping (replay/coopTimeline law as the relay's own door)", () => {
  it("ghost seat cannot submit — refused at the relay", () => {
    const relay = twoSeatRelay();
    expect(() => relay.submit("mallory", "note", { text: "hi" })).toThrowError(RelayError);
    expect(() => relay.submit("mallory", "note", { text: "hi" })).toThrowError(/not-seated/);
  });

  it("departed seat cannot submit at or after its half-open cutoff", () => {
    const relay = twoSeatRelay();
    relay.advanceTo(5n);
    relay.leaveSeat(ALICE);
    relay.advanceTo(5n); // same tick is legal (not a rewind)
    expect(() => relay.submit(ALICE, "note", { text: "late" })).toThrowError(/not-seated/);
    expect(() => relay.submit(BOB, "note", { text: "fine" })).not.toThrow();
  });

  it("stamps (tick, seq) globally unique — the seq stream never resets (R1, re-pinned: old law reset per tick)", () => {
    const relay = twoSeatRelay();
    const a = relay.submit(ALICE, "note", { text: "one" });
    const b = relay.submit(BOB, "note", { text: "two" });
    expect([a.tick, a.seq, b.tick, b.seq]).toEqual([1n, 0, 1n, 1]);
    relay.advanceTo(2n);
    const c = relay.submit(ALICE, "note", { text: "three" });
    expect([c.tick, c.seq]).toEqual([2n, 2]); // was (2,0) under the retired per-tick reset
    expect(relay.sharedLog()).toHaveLength(3);
  });

  it("refuses to rewind its stamp clock", () => {
    const relay = twoSeatRelay();
    expect(() => relay.advanceTo(0n)).toThrowError(/clock-went-back/);
  });

  it("refuses an action envelope without args.verb", () => {
    const relay = twoSeatRelay();
    expect(() => relay.submit(ALICE, "action", { nope: true })).toThrowError(/bad-action/);
  });

  it("a duplicated (tick, seq) append throws naming BOTH positions (M4 precedent)", () => {
    const r = record(ALICE, 3n, 0, "note");
    const dup = record(BOB, 3n, 0, "note");
    expect(() => assertCoopTimelineAppendOrder([r, dup])).toThrowError(
      /\(3, 0\) appears at both positions 0 and 1/,
    );
  });

  it("orderCoopTimeline sorts any arrival interleaving and refuses slot collisions", () => {
    const shuffled = [
      record(BOB, 2n, 0, "sightline"),
      record(ALICE, 1n, 1, "action"),
      record(ALICE, 1n, 0, "note"),
      record(BOB, 2n, 1, "note"),
    ];
    const ordered = orderCoopTimeline(shuffled);
    expect(ordered.map((x) => `${x.tick}:${x.seq}`)).toEqual(["1:0", "1:1", "2:0", "2:1"]);
    // law: input untouched (it copies)
    expect(shuffled[1]?.participantId).toBe(ALICE);
    expect(() => orderCoopTimeline([record(ALICE, 1n, 0, "note"), record(BOB, 1n, 0, "action")])).toThrowError(
      /\(1, 0\) is claimed by two records/,
    );
  });

  it("digestCoopTimeline is interleaving-invariant across two seats and three kinds", () => {
    const relay = twoSeatRelay();
    relay.submit(ALICE, "action", placeAction("n-1"));
    relay.submit(BOB, "sightline", { lane: "edge" });
    relay.submit(BOB, "note", { text: "mood" });
    relay.advanceTo(2n);
    relay.submit(ALICE, "note", { text: "checked" });
    const log = relay.sharedLog();
    const reversed = [...log].reverse();
    expect(digestCoopTimeline(reversed)).toBe(relay.timelineDigest());
    expect(digestCoopTimeline([log[3]!, log[2]!, log[0]!, log[1]!])).toBe(relay.timelineDigest());
    // falsifier: a payload change moves the digest
    const altered = log.map((r, i) => (i === 0 ? { ...r, payload: { args: { verb: "other" } } } : r));
    expect(digestCoopTimeline(altered)).not.toBe(relay.timelineDigest());
  });
});

describe("relay seq streams (R1 — per-seat monotone streams over one lifetime numbering)", () => {
  it("one global numbering: seqs never repeat anywhere, each seat's projection strictly increases", () => {
    const relay = twoSeatRelay(); // alice t0, bob t1
    relay.submit(ALICE, "note", { text: "a1" }); // (1,0)
    relay.submit(BOB, "note", { text: "b1" }); // (1,1)
    relay.advanceTo(2n);
    relay.submit(BOB, "note", { text: "b2" }); // (2,2) — a new tick consumes the NEXT stamp, not 0
    relay.advanceTo(3n);
    relay.submit(ALICE, "note", { text: "a2" }); // (3,3)
    const log = relay.sharedLog();
    // composition law: seq is globally unique ⇒ (tick, seq) globally unique,
    // regardless of how many seats collide on a tick
    expect(new Set(log.map((r) => r.seq)).size).toBe(log.length);
    for (const pid of [ALICE, BOB]) {
      const stream = log.filter((r) => r.participantId === pid).map((r) => r.seq);
      for (let i = 1; i < stream.length; i += 1) {
        expect(stream[i]!).toBeGreaterThan(stream[i - 1]!);
      }
      expect(stream.length).toBe(2);
    }
    // the shared log satisfies the UPSTREAM whole-log law too — the R3 step
    // check and the O(n) audit agree (boundary equivalence pin)
    expect(() => assertCoopTimelineAppendOrder(log)).not.toThrow();
  });

  it("same-tick cross-seat submits get distinct seqs — the refuted alternative is exactly what upstream refuses", () => {
    const relay = twoSeatRelay();
    const a = relay.submit(ALICE, "action", placeAction("n-a"));
    const b = relay.submit(BOB, "action", placeAction("n-b")); // same tick — seat-independent counters would BOTH be (1,0)…
    expect([a.tick, b.tick, a.seq === b.seq]).toEqual([1n, 1n, false]);
    // …and this is the upstream law (orderCoopTimeline ignores participantId)
    // that R1 keeps: hand-built per-seat counters collide and throw.
    expect(() =>
      orderCoopTimeline([record(ALICE, 1n, 0, "note"), record(BOB, 1n, 0, "note")]),
    ).toThrowError(/\(1, 0\) is claimed by two records/);
    // within a tick, stamp order IS submission order — the door's due-sort
    // keeps a's claim on the rail before b's (hand-contention law unchanged)
    expect(relay.feedFrom([b, a]).map((e) => e.intent.seq)).toEqual([0, 1]);
  });
});

describe("opaque payloads (R2 — the door is the sole parse authority)", () => {
  it("carries ANY door-shaped verb byte-identical — outside the builder set, extras included, the relay never touches args", () => {
    const relay = twoSeatRelay();
    const configureArgs = {
      verb: PlayerVerb.ConfigureNode,
      nodeId: "edge",
      inspectionDepth: null,
      shedOrder: null,
      seatNote: "opaque extras ride too — the door only reads its shape fields",
    };
    const speedArgs = { verb: PlayerVerb.ToggleSpeed, speedX: 2 };
    relay.submit(ALICE, "action", { args: configureArgs });
    relay.submit(BOB, "action", { args: speedArgs });
    const feed = relay.feedFor(ALICE);
    expect(feed).toHaveLength(2);
    const first = feed[0]!.intent.payload as PlayerVerbPayload;
    const second = feed[1]!.intent.payload as PlayerVerbPayload;
    // BYTE-IDENTICAL passthrough: the SAME reference, not a re-shaped copy
    expect(first.args).toBe(configureArgs as never);
    expect(second.args).toBe(speedArgs as never);
    // and the shared log holds it untouched
    expect(relay.sharedLog()[0]!.payload.args).toBe(configureArgs as never);
  });

  it("refuses structurally-invalid wire at the boundary, not deep shapes", () => {
    const relay = twoSeatRelay();
    expect(() => relay.submit(ALICE, "action", {})).toThrowError(RelayError);
    expect(() => relay.submit(ALICE, "action", {})).toThrowError(/needs an 'args' object/);
    expect(() => relay.submit(ALICE, "action", { args: [] })).toThrowError(/needs an 'args' object/);
    expect(() => relay.submit(ALICE, "action", { args: { verb: 42 } })).toThrowError(/not a PlayerVerb/);
    expect(() => relay.submit(ALICE, "action", { args: { verb: "launch-missiles" } })).toThrowError(/not a PlayerVerb/);
    // deep field garbage is NOT the relay's business (contrast with R2 feed
    // passthrough): wrong TYPES pass the hub and meet the door's parseEntry
    expect(() => relay.submit(ALICE, "action", { args: { verb: PlayerVerb.Communicate, target: null, note: 42 } })).not.toThrow();
  });

  it("the builder convenience API survives, decoupled from feed composition", () => {
    const built = RELAY_ACTION_BUILDERS[PlayerVerb.PlaceDevice]!({
      nodeId: "n-9",
      deviceKind: "server",
      template: null,
    });
    expect(built).toEqual({ verb: PlayerVerb.PlaceDevice, nodeId: "n-9", deviceKind: "server", template: null });
    expect(() => RELAY_ACTION_BUILDERS[PlayerVerb.PlaceDevice]!({ nodeId: "", deviceKind: "server", template: null })).toThrowError(
      /args\.nodeId must be a non-empty string/,
    );
    expect(() => RELAY_ACTION_BUILDERS[PlayerVerb.ConnectPorts]!({ relation: "banana", from: "a", to: "b", slot: null })).toThrowError(
      /outside board grammar/,
    );
  });
});

describe("one-pass append self-check (R3)", () => {
  it("accepts the ascending step at the append boundary", () => {
    const log = [record(ALICE, 1n, 0, "note"), record(BOB, 1n, 1, "note")];
    expect(() => assertRelayAppendStep(log, { tick: 1n, seq: 2 })).not.toThrow(); // same tick, higher seq
    expect(() => assertRelayAppendStep(log, { tick: 2n, seq: 0 })).not.toThrow(); // next tick
    expect(() => assertRelayAppendStep([], { tick: 0n, seq: 0 })).not.toThrow(); // empty log: any first record
  });

  it("refuses duplicates and backwards steps at the append boundary", () => {
    const log = [record(ALICE, 1n, 0, "note"), record(BOB, 1n, 1, "note")];
    // FALSIFIER: the prev-vs-next step check reddens on a dup stamp…
    expect(() => assertRelayAppendStep(log, { tick: 1n, seq: 1 })).toThrowError(
      /\(1, 1\) appears at both positions 1 and 2/,
    );
    // …and on a backwards stamp — a re-delivered OLD record (a cursor bug:
    // (0,5) sorts before the live tail (1,1)) reddens exactly like upstream's
    // whole-log scan would, at one comparison
    expect(() => assertRelayAppendStep(log, { tick: 0n, seq: 5 })).toThrowError(
      /record 2 \(0, 5\) sorts before record 1 \(1, 1\) — append order violated/,
    );
    // dup tick but LOWER seq than prev is the same backwards violation
    expect(() => assertRelayAppendStep(log, { tick: 1n, seq: 0 })).toThrowError(/sorts before/);
  });
});

describe("paged catch-up (R4 — deterministic stamp-range pages, byte-stable re-pages)", () => {
  /** Six ALICE records over ticks 0/2/4/6 (a frozen backlog): the classic
   *  catch-up scenario — a second seat joins AFTER the traffic, so every
   *  delivered record is backlog (no live-broadcast interference). */
  function pageRelay(
    opts: { readonly pageSize?: number; readonly autoCatchUp?: boolean } = {},
  ): ReturnType<typeof createCoopRelay> {
    const relay = createCoopRelay({
      ...(opts.pageSize === undefined ? {} : { catchUpPageSize: opts.pageSize }),
      ...(opts.autoCatchUp === undefined ? {} : { autoCatchUpOnJoin: opts.autoCatchUp }),
    });
    relay.joinSeat(ALICE); // t0
    relay.submit(ALICE, "note", { text: "0" }); // (0,0)
    relay.advanceTo(2n);
    relay.submit(ALICE, "action", placeAction("n-1")); // (2,1)
    relay.submit(ALICE, "note", { text: "1" }); // (2,2)
    relay.advanceTo(4n);
    relay.submit(ALICE, "note", { text: "2" }); // (4,3)
    relay.submit(ALICE, "action", placeAction("n-2")); // (4,4)
    relay.advanceTo(6n);
    relay.submit(ALICE, "note", { text: "3" }); // (6,5)
    return relay;
  }
  const BACKLOG = ["0:0", "2:1", "2:2", "4:3", "4:4", "6:5"];

  it("pageCoopLog is pure: a delivered window cannot change when the log later grows", () => {
    const relay = pageRelay();
    const snapshot = relay.sharedLog();
    const first = pageCoopLog(snapshot, { tick: 2n, seq: 1 }, 2);
    expect(first.map((r) => `${r.tick}:${r.seq}`)).toEqual(["2:2", "4:3"]);
    relay.advanceTo(8n);
    relay.submit(ALICE, "note", { text: "later" }); // (8,6) — grows AFTER the window
    // re-page against the GROWN log: byte-stable, because R1's never-repeating
    // seq can only sort new records after an already-delivered window
    const again = pageCoopLog(relay.sharedLog(), { tick: 2n, seq: 1 }, 2);
    expect(again.map((r) => `${r.tick}:${r.seq}`)).toEqual(["2:2", "4:3"]);
    // from=undefined delivers the whole canonical log; the tail law is strict
    expect(pageCoopLog(snapshot, undefined, 100).length).toBe(snapshot.length);
    expect(pageCoopLog(snapshot, { tick: 6n, seq: 5 }, 4)).toEqual([]);
    // the page limit parses at the boundary (Fail Fast)
    expect(() => pageCoopLog(snapshot, undefined, 0)).toThrowError(/bad-page-size/);
  });

  it("catchUpPage walks the backlog strictly-after lastSeen — pendingCatchUp counts, dup-never-twice holds", () => {
    // BOB joins AFTER the traffic (live tenure, pure backlog, zero future
    // submits so broadcast never interferes) with auto-catchup OFF.
    const relay = pageRelay({ autoCatchUp: false });
    relay.joinSeat(BOB); // opens (6,?) — auto-catchup off → inbox empty
    expect(relay.inbox(BOB)).toHaveLength(0);
    expect(relay.pendingCatchUp(BOB)).toBe(6);
    const p1 = relay.catchUpPage(BOB, 2);
    expect(p1.map((r) => `${r.tick}:${r.seq}`)).toEqual(["0:0", "2:1"]);
    expect(relay.pendingCatchUp(BOB)).toBe(4);
    const p2 = relay.catchUpPage(BOB, 2);
    expect(p2.map((r) => `${r.tick}:${r.seq}`)).toEqual(["2:2", "4:3"]);
    const p3 = relay.catchUpPage(BOB, 10);
    expect(p3.map((r) => `${r.tick}:${r.seq}`)).toEqual(["4:4", "6:5"]);
    expect(relay.catchUpPage(BOB, 3)).toEqual([]); // exhausted — the cursor is the inbox
    expect(relay.pendingCatchUp(BOB)).toBe(0);
    const stamps = relay.inbox(BOB).map((r) => `${r.tick}:${r.seq}`);
    expect(stamps).toEqual(BACKLOG);
    expect(new Set(stamps).size).toBe(stamps.length); // nothing delivered twice
    expect(() => relay.feedFor(BOB)).not.toThrow(); // orderCoopTimeline would throw on a dup
  });

  it("FALSIFIER: catchUpPage refuses a departed tenure — the @24426ec freeze holds on the page path", () => {
    const relay = pageRelay();
    relay.joinSeat(BOB); // auto-catchup ON fills the backlog
    relay.advanceTo(7n);
    relay.leaveSeat(BOB); // tenure [6,7) closes — half-open law needs left > joined
    expect(() => relay.catchUpPage(BOB, 2)).toThrowError(/no seat at tick/);
  });

  it("resuming a page set mid-way ends with the identical inbox as a single-shot catch-up", () => {
    // `single` auto-catches-up on join (page loop to completion inside
    // joinSeat); `paged` defers (auto OFF), the transport pumps 2-at-a-time
    // and DROPS the connection after two pages, then resumes — the pure page
    // window makes the final inboxes byte-equal, and the door feeds identical.
    const single = pageRelay();
    single.joinSeat(BOB);
    const whole = single.inbox(BOB).map((r) => `${r.tick}:${r.seq}`);
    expect(whole).toEqual(BACKLOG);

    const paged = pageRelay({ autoCatchUp: false });
    paged.joinSeat(BOB);
    paged.catchUpPage(BOB, 2); // ["0:0","2:1"]
    paged.catchUpPage(BOB, 2); // ["2:2","4:3"]
    expect(paged.pendingCatchUp(BOB)).toBe(2); // connection DROPS here (mid-page-set)
    // ... reconnect, resume from the seat's own lastSeen — byte-stable, no gaps
    while (paged.catchUpPage(BOB, 2).length > 0) {
      /* pump to exhaustion */
    }
    expect(paged.inbox(BOB).map((r) => `${r.tick}:${r.seq}`)).toEqual(whole);
    expect(paged.feedFor(BOB)).toStrictEqual(single.feedFor(BOB));
  });

  it("joinSeat delivers through the SAME page loop (small pages still fill the inbox at join)", () => {
    const relay = pageRelay({ pageSize: 2 }); // catchUpPageSize=2, backlog 6 = 3 pages
    relay.joinSeat(BOB); // auto-catchup ON: deliverCatchUp loops pages of 2 to completion
    expect(relay.inbox(BOB).map((r) => `${r.tick}:${r.seq}`)).toEqual(BACKLOG);
    expect(relay.pendingCatchUp(BOB)).toBe(0);
  });

  it("page sizes parse at construction and at the call", () => {
    expect(() => createCoopRelay({ catchUpPageSize: 0 })).toThrowError(/bad-page-size/);
    expect(() => createCoopRelay({ catchUpPageSize: 2.5 })).toThrowError(/bad-page-size/);
    const relay = pageRelay();
    expect(() => relay.catchUpPage(ALICE, -1)).toThrowError(/bad-page-size/);
    expect(() => relay.catchUpPage(ALICE, Number.NaN)).toThrowError(/bad-page-size/);
  });
});

describe("ruling-2 attribution guard driven from the relay's ledger", () => {
  const nodeLedger = twoSeatRelay().ledger();
  const node = () =>
    newCompanyNode({
      id: "branch-spike",
      parentId: null,
      name: "Spike Branch",
      eraOrigin: "2026",
      foundedAtTick: 0n,
      successionType: "found",
      coop: nodeLedger,
    });

  it("commits a scar+museum batch from two seated authors", () => {
    const batch = {
      runId: asEntityId("run-spike-1"),
      committedAtTick: 8n,
      writes: [
        { facet: "scars" as const, participantId: asEntityId(ALICE), record: scarFor("scar-1", ALICE) },
        { facet: "museum" as const, participantId: asEntityId(BOB), record: exhibitFor("ex-1", BOB) },
      ],
    };
    const next = commitCoopAttribution(node(), batch);
    expect(next.scars.some((s) => s.id === "scar-1" && s.attributedParticipantId === ALICE)).toBe(true);
    expect(next.museum.some((m) => m.id === "ex-1" && m.attributedParticipantId === BOB)).toBe(true);
  });

  it("refuses empty batches, off-roster facets, solo writers, ghosts, and forgeries", () => {
    const at = 8n;
    expect(() => guardCoopAttributionBatch({ runId: asEntityId("r"), committedAtTick: at, writes: [] }, nodeLedger)).toThrowError(
      /commits facts or nothing/,
    );
    expect(() =>
      guardCoopAttributionBatch(
        // the guard checks the RUNTIME facet (batches may arrive parsed from
        // an untrusted seat wire), so the type wall is deliberately bypassed:
        { runId: asEntityId("r"), committedAtTick: at, writes: [{ facet: "finances" as unknown as "scars", participantId: asEntityId(ALICE), record: scarFor("scar-x", ALICE) }] },
        nodeLedger,
      ),
    ).toThrowError(/customers\/cash stay company-level/);
    expect(() =>
      guardCoopAttributionBatch(
        { runId: asEntityId("r"), committedAtTick: at, writes: [{ facet: "scars", participantId: asEntityId("ghost"), record: scarFor("scar-g", "ghost") }] },
        nodeLedger,
      ),
    ).toThrowError(/not recorded in the seat ledger/);
    expect(() =>
      guardCoopAttributionBatch(
        { runId: asEntityId("r"), committedAtTick: at, writes: [{ facet: "scars", participantId: asEntityId(ALICE), record: scarFor("scar-f", BOB) }] },
        nodeLedger,
      ),
    ).toThrowError(/attribution forgery is refused/);
    // RATIFIED history law (L-RH, owner delegation 2026-10-16): the MIN_WRITERS
    // check reads the ledger's distinct RECORDED writers, not current seating —
    // a 2-seat company where one left still passes as "multi-writer" because
    // the ledger is append-only history. Pinned as its own test below.
    const solo = createCoopRelay();
    solo.joinSeat(ALICE);
    expect(COOP_MIN_SEAT_WRITERS).toBe(2);
    expect(() =>
      guardCoopAttributionBatch(
        { runId: asEntityId("r"), committedAtTick: at, writes: [{ facet: "scars", participantId: asEntityId(ALICE), record: scarFor("scar-s", ALICE) }] },
        solo.ledger(),
      ),
    ).toThrowError(/at least 2 recorded writers/);
    // ledger undefined = single-authored node, not the co-op contract at all
    expect(() =>
      guardCoopAttributionBatch({ runId: asEntityId("r"), committedAtTick: at, writes: [] }, undefined),
    ).toThrowError(/no seat ledger/);
    // unseated author: seated earlier, gone by the commit tick
    const relay = twoSeatRelay();
    relay.advanceTo(5n);
    relay.leaveSeat(ALICE);
    expect(() =>
      guardCoopAttributionBatch(
        { runId: asEntityId("r"), committedAtTick: at, writes: [{ facet: "scars", participantId: asEntityId(ALICE), record: scarFor("scar-u", ALICE) }] },
        relay.ledger(),
      ),
    ).toThrowError(/not seated at tick 8/);
  });

  it("a departed author's own commit tick is refused via the relay ledger", () => {
    const relay = twoSeatRelay();
    relay.advanceTo(3n);
    relay.leaveSeat(BOB);
    relay.advanceTo(4n);
    expect(() =>
      guardCoopAttributionBatch(
        { runId: asEntityId("r"), committedAtTick: relay.tick(), writes: [{ facet: "museum", participantId: asEntityId(BOB), record: exhibitFor("ex-late", BOB) }] },
        relay.ledger(),
      ),
    ).toThrowError(/not seated at tick 4/);
  });

  it("RATIFIED history law (L-RH): 2-recorded/1-live still arms MIN_WRITERS while the seated author commits", () => {
    const relay = twoSeatRelay();
    relay.advanceTo(5n);
    relay.leaveSeat(ALICE); // one LIVE seat remains, TWO recorded writers in history
    expect(() =>
      guardCoopAttributionBatch(
        { runId: asEntityId("r"), committedAtTick: 8n, writes: [{ facet: "scars", participantId: asEntityId(BOB), record: scarFor("scar-h", BOB) }] },
        relay.ledger(),
      ),
    ).not.toThrow();
    // the live/dead asymmetry stays honest: the DEPARTED author's own write refuses
    expect(() =>
      guardCoopAttributionBatch(
        { runId: asEntityId("r"), committedAtTick: 8n, writes: [{ facet: "scars", participantId: asEntityId(ALICE), record: scarFor("scar-g", ALICE) }] },
        relay.ledger(),
      ),
    ).toThrowError(/not seated at tick 8/);
  });
});
