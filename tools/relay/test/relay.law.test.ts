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
import { createCoopRelay, RelayError } from "../src/relay.ts";

const ALICE = "alice";
const BOB = "bob";

function twoSeatRelay(): ReturnType<typeof createCoopRelay> {
  const relay = createCoopRelay();
  relay.joinSeat(ALICE); // tick 0
  relay.advanceTo(1n);
  relay.joinSeat(BOB); // strictly-after join (ledger law — see same-tick test)
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

  it("refuses a same-tick join (ledger is strictly-ascending history) — pinned v0 friction", () => {
    const relay = createCoopRelay();
    relay.joinSeat(ALICE);
    // currentTick still 0 — BOB's join would duplicate the join instant ordering
    expect(() => relay.joinSeat(BOB)).toThrowError(/not after row 0 joinedAtTick/);
  });

  it("refuses re-join by a departed participant — v0 one-tenure-row law (transport gap)", () => {
    const relay = twoSeatRelay();
    relay.advanceTo(5n);
    relay.leaveSeat(ALICE);
    relay.advanceTo(6n);
    expect(() => relay.joinSeat(ALICE)).toThrowError(/one tenure row per participant/);
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

  it("stamps (tick, seq) unique within a tick and resets the seq on advance", () => {
    const relay = twoSeatRelay();
    const a = relay.submit(ALICE, "note", { text: "one" });
    const b = relay.submit(BOB, "note", { text: "two" });
    expect([a.tick, a.seq, b.tick, b.seq]).toEqual([1n, 0, 1n, 1]);
    relay.advanceTo(2n);
    const c = relay.submit(ALICE, "note", { text: "three" });
    expect([c.tick, c.seq]).toEqual([2n, 0]);
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
    // Departed rows still COUNT as recorded writers (guard reads the ledger's
    // distinct set, not current seating) — to reach the MIN_WRITERS refusal the
    // company must have literally one row ever:
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
});
