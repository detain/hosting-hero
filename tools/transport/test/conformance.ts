/**
 * test/conformance.ts — the transport conformance law body (I-T §10).
 *
 * `runTransportConformance(name, makeWiring)` builds ONE describe block over a
 * wiring factory returning the small `TransportWiring` contract. The
 * in-memory carrier runs it today; the day the PHP/Workerman carrier grows a
 * TypeScript twin (or a loopback socket port lands here), it passes its own
 * factory to the SAME law body — that is the "one protocol, two carriers"
 * promise turned into an executable gate. Nothing in here may assume mailbox
 * internals: everything rides TransportPort + the public hub/client handles.
 */

import { describe, expect, it } from "vitest";
import { asEntityId, asRunSeed } from "@hh/sim-core/types";
import type { CoopTimelineRecord } from "@hh/sim-core/replay";
import type { HashHex } from "@hh/sim-core/types";
import { digestCoopTimeline } from "@hh/sim-core/replay";
import { createCoopRelay, RELAY_ACTION_BUILDERS } from "relay-tools";
import type { CoopRelay } from "relay-tools";
import { attachRelayHub, createReplica } from "../src/server.ts";
import type { RelayHubHandle, TransportReplica } from "../src/server.ts";
import { createTransportClient } from "../src/client.ts";
import type { TransportClient } from "../src/client.ts";
import { createInMemoryTransport } from "../src/inMemory.ts";
import type { InMemoryTransport } from "../src/inMemory.ts";
import { decodeFrame, encodeFrame, TransportError } from "../src/codec.ts";
import {
  TRANSPORT_PROTOCOL,
  TRANSPORT_PROTOCOL_VERSION,
} from "../src/envelope.ts";
import type { SeatStateFrame, SeatViewWire, TransportCellWire } from "../src/envelope.ts";

export const HEAD = { protocol: TRANSPORT_PROTOCOL, version: TRANSPORT_PROTOCOL_VERSION } as const;

/** Door-shaped action payload — the relay carries it opaque, the client
 *  feed turns it into an ExternalIntent. Built through the relay's own
 *  builders so the two hosts can never disagree on arg shape. */
export function talkAction(note: string): Readonly<Record<string, unknown>> {
  return { args: { verb: "communicate", target: null, note } };
}

export interface TransportWiringOptions {
  readonly pageSize?: number;
  readonly maxPageSize?: number;
  readonly logBudget?: number;
  readonly projectionSource?: (seat: string) => SeatViewWire | undefined;
  readonly net?: Parameters<typeof createInMemoryTransport>[0];
}

export interface TransportWiring {
  readonly relay: CoopRelay;
  readonly net: InMemoryTransport;
  readonly hub: RelayHubHandle;
  readonly alice: TransportClient;
  readonly bob: TransportClient;
  readonly carol: TransportClient;
  readonly replica: TransportReplica;
  /** step + drain everything until the channel is quiescent. Throws if it
   *  never settles — a livelock is a red test, not a hang. */
  settle(maxSteps?: number): void;
  /** Bob submits one communicate action through the full wire path. */
  submitViaBob(note: string): void;
  /** Every raw frame the carrier posted toward one target, in send order. */
  framesTo(seat: string | null): readonly string[];
}

export function makeInMemoryWiring(options: TransportWiringOptions = {}): TransportWiring {
  // The relay is constructed with autoCatchUpOnJoin:false — the WIRE posture:
  // tenure opens dry and the client pumps catchup-request pages itself.
  const relay = createCoopRelay({ autoCatchUpOnJoin: false });
  const net = createInMemoryTransport(options.net ?? {});
  const hub = attachRelayHub(relay, net.port, {
    ...(options.pageSize === undefined ? {} : { pageSize: options.pageSize }),
    ...(options.maxPageSize === undefined ? {} : { maxPageSize: options.maxPageSize }),
    ...(options.logBudget === undefined ? {} : { logBudget: options.logBudget }),
    ...(options.projectionSource === undefined ? {} : { projectionSource: options.projectionSource }),
  });
  const alice = createTransportClient(net.port, "alice");
  const bob = createTransportClient(net.port, "bob");
  const carol = createTransportClient(net.port, "carol");
  const replica = createReplica();

  function settle(maxSteps: number = 400): void {
    for (let i = 0; i < maxSteps; i += 1) {
      const advanced = net.schedule.step();
      hub.drain();
      alice.drain();
      bob.drain();
      carol.drain();
      if (!advanced && net.pending() === 0) return;
    }
    throw new Error("transport conformance: channel never quiesced (livelock?)");
  }

  function framesTo(seat: string | null): readonly string[] {
    return Object.freeze(net.trace().filter((entry) => entry.target === seat).map((entry) => entry.raw));
  }

  // Incremental mirror: the replica ingests each frame on bob's channel
  // EXACTLY once — re-feeding old broadcasts would collide the shadow by
  // design (the collision law throwing twice in one test is not a witness).
  let mirrored = 0;
  function mirrorBob(): void {
    const all = framesTo("bob");
    for (let i = mirrored; i < all.length; i += 1) replica.ingest(all[i] as string);
    mirrored = all.length;
  }

  function submitViaBob(note: string): void {
    bob.submit("action", talkAction(note));
    settle();
    mirrorBob();
  }

  return { relay, net, hub, alice, bob, carol, replica, settle, submitViaBob, framesTo };
}

/** Feed the door-shaped args through the relay's own builders so both hosts
 *  stamp byte-identical payloads (the client revives bigints the same way). */
export function builderArgs(verb: string, args: Readonly<Record<string, unknown>>): Readonly<Record<string, unknown>> {
  const build = RELAY_ACTION_BUILDERS[verb];
  if (build === undefined) throw new Error(`no relay builder for verb ${verb}`);
  return { args: build(args) };
}

/* ══════════════════════ THE law body ══════════════════════ */

export function runTransportConformance(name: string, makeWiring: (options?: TransportWiringOptions) => TransportWiring): void {
  describe(`${name}: transport conformance (I-T §10 law body)`, () => {
    it("full loop join → submit → broadcast → door feed", () => {
      const w = makeWiring();
      w.alice.join();
      w.bob.join();
      w.settle();
      w.relay.advanceTo(3n);
      w.submitViaBob("hello-from-bob");
      const feed = w.alice.feedToDoor();
      expect(feed).toHaveLength(1);
      const intent = feed[0] as (typeof feed)[number];
      expect(intent.tick).toBe(3n);
      expect(intent.intent.clock).toBe("sim");
      expect(intent.intent.origin).toBe("player");
      const relayFeed = w.relay.feedFor("alice");
      expect(feed).toStrictEqual(relayFeed); // door feed twin of relay.feedFrom — THROUGH FRAMES
      expect(intent.intent.seq).toBe(0); // R1 lifetime-monotonic seq, hub-stamped
    });

    it("R1 through the wire: client hints are telemetry, the hub stamps", () => {
      const w = makeWiring();
      w.alice.join("999");
      w.bob.join();
      w.settle();
      w.relay.advanceTo(5n);
      w.bob.submit("action", talkAction("hinted"));
      w.settle();
      const record = w.alice.records()[0] as CoopTimelineRecord;
      expect(record.tick).toBe(5n); // NOT 999 — acceptance tick is the hub's clock
      const aliceTenure = w.alice.ledger()?.seatHolders.find((s) => s.participantId === "alice");
      expect(aliceTenure?.joinedAtTick).toBe("0"); // join processed at tick 0; hint ignored entirely
    });

    it("resume-paging twin: a mid-page-set drop resumes to a byte-equal inbox", () => {
      const w = makeWiring({ pageSize: 3 });
      w.bob.join();
      w.settle();
      for (let i = 0; i < 10; i += 1) w.submitViaBob(`flood-${i}`);
      const authority = w.relay.timelineDigest();

      w.alice.join();
      w.settle();
      w.alice.runCatchUp();
      // Deliver exactly one page, then FREEZE alice's channel mid-page-set.
      w.net.schedule.step(); // request lands at the hub
      w.hub.drain(); // hub composes the page, posts toward alice
      w.net.schedule.step(); // the page crosses the (still-open) channel
      w.alice.drain();
      expect(w.alice.records().length).toBeGreaterThan(0);
      expect(w.alice.isCaughtUp()).toBe(false); // chain still outstanding
      w.net.suspendSeat("alice");
      w.settle(); // every further page drops
      expect(w.alice.isCaughtUp()).toBe(false);
      expect(w.net.stats().dropped).toBeGreaterThan(0); // the drop really happened

      w.net.resumeSeat("alice");
      w.alice.resume(); // THE whole reconnect story is one frame type
      w.settle();
      expect(w.alice.isCaughtUp()).toBe(true);

      expect(w.alice.records().map((r) => `${r.tick}:${r.seq}`)).toEqual(
        w.bob.records().map((r) => `${r.tick}:${r.seq}`),
      );
      expect(digestCoopTimeline(w.alice.records())).toBe(authority);
      expect(w.alice.feedToDoor()).toStrictEqual(w.bob.feedToDoor());
    });

    it("late joiner through the port: cold client after:null gets the full log", () => {
      const w = makeWiring();
      w.bob.join();
      w.settle();
      for (let i = 0; i < 5; i += 1) w.submitViaBob(`pre-${i}`);
      w.alice.join();
      w.settle();
      expect(w.alice.records()).toHaveLength(0); // wire posture: tenure opens DRY
      expect(w.alice.isCaughtUp()).toBe(true); // no catch-up story has been asked for
      w.alice.runCatchUp();
      w.settle();
      expect(w.alice.records()).toHaveLength(5);
      expect(digestCoopTimeline(w.alice.records())).toBe(w.relay.timelineDigest());
    });

    it("ghost submit faults relay[not-seated] verbatim; the hub survives", () => {
      const w = makeWiring();
      w.alice.join();
      w.bob.join();
      w.settle();
      w.carol.submit("action", talkAction("ghost-intent")); // carol never joined
      w.settle();
      expect(w.carol.faults().length).toBe(1);
      expect(w.carol.faults()[0]?.cause).toMatch(/^relay\[not-seated\]/);
      // Hub is alive: alice's normal path still works after the verdict.
      w.relay.advanceTo(2n);
      w.submitViaBob("still-here");
      expect(w.alice.records().some((r) => r.tick === 2n)).toBe(true);
    });

    it("undecodable bytes fault against 'frame'; the hub survives", () => {
      const w = makeWiring();
      w.alice.join();
      w.bob.join();
      w.settle();
      w.net.postRaw(null, "{not json at all");
      w.settle();
      expect(w.hub.faults().some((f) => f.against === "frame" && f.cause.includes("bad-json"))).toBe(true);
      w.relay.advanceTo(4n);
      w.submitViaBob("post-junk");
      expect(w.alice.records().some((r) => r.tick === 4n)).toBe(true);
    });

    it("a hub-to-client kind on the hub channel faults transport[bad-frame]", () => {
      const w = makeWiring();
      w.alice.join();
      w.settle();
      w.net.port.hub.send({ ...HEAD, kind: "broadcast", record: { participantId: asEntityId("alice"), tick: 1n, seq: 0, kind: "action", payload: {} } });
      w.settle();
      expect(w.hub.faults().some((f) => f.cause.includes("bad-frame"))).toBe(true);
    });

    it("a departed seat's page request faults the relay's own not-seated grammar", () => {
      const w = makeWiring();
      w.alice.join();
      w.bob.join();
      w.settle();
      w.submitViaBob("before-departure");
      w.relay.advanceTo(1n); // the ledger demands leftAtTick AFTER joinedAtTick
      w.alice.leave();
      w.settle();
      w.alice.runCatchUp(); // departed — pages flow only while a tenure is open
      w.settle();
      expect(w.alice.faults().some((f) => /relay\[not-seated\]/.test(f.cause))).toBe(true);
    });

    it("a never-seated participant's page request faults transport[unknown-participant]", () => {
      const w = makeWiring();
      w.carol.runCatchUp(); // no tenure row at all
      w.settle();
      expect(w.carol.faults().some((f) => /transport\[unknown-participant\]/.test(f.cause))).toBe(true);
    });

    it("identical re-send is absorbed with an observable counter (at-least-once)", () => {
      const w = makeWiring();
      w.alice.join();
      w.bob.join();
      w.settle();
      w.relay.advanceTo(2n);
      w.submitViaBob("dup-me");
      const record = w.alice.records()[0] as CoopTimelineRecord;
      const before = w.alice.duplicatesDropped();
      w.net.postRaw("alice", encodeFrame({ ...HEAD, kind: "broadcast", record }));
      w.settle();
      expect(w.alice.duplicatesDropped()).toBe(before + 1);
      expect(w.alice.records()).toHaveLength(1); // inbox untouched
      expect(digestCoopTimeline(w.alice.records())).toBe(w.relay.timelineDigest());
    });

    it("same stamp, different payload is FATAL: transport[dup-conflict]", () => {
      const w = makeWiring();
      w.alice.join();
      w.bob.join();
      w.settle();
      w.relay.advanceTo(2n);
      w.submitViaBob("original");
      const record = w.alice.records()[0] as CoopTimelineRecord;
      const forged: CoopTimelineRecord = {
        ...record,
        payload: talkAction("DIVERGENT"),
      };
      w.net.postRaw("alice", encodeFrame({ ...HEAD, kind: "broadcast", record: forged }));
      w.net.schedule.step(); // the forged frame crosses the wire — nothing else drains
      let caught: unknown = undefined;
      try {
        w.alice.drain();
      } catch (error) {
        caught = error;
      }
      expect(caught).toBeInstanceOf(TransportError);
      expect((caught as TransportError).code).toBe("dup-conflict");
      // The gate stands between the wire and the collision law: the divergent
      // payload never enters the inbox, so orderCoopTimeline stays
      // unreachable-by-wire-dup — the client faulted FIRST.
      expect(w.alice.records()).toHaveLength(1);
      expect(w.alice.feedToDoor()).toHaveLength(1);
    });

    it("broadcast fans to LIVE seats only; departed inboxes stay frozen", () => {
      const w = makeWiring();
      w.alice.join();
      w.bob.join();
      w.carol.join();
      w.settle();
      w.submitViaBob("round-one");
      const carolCount = w.carol.records().length;
      w.relay.advanceTo(1n); // departure must land on a later tick than the join
      w.carol.leave();
      w.settle();
      w.relay.advanceTo(7n);
      w.submitViaBob("after-carol-left");
      expect(w.carol.records()).toHaveLength(carolCount); // frozen at departure
      expect(w.alice.records().some((r) => r.tick === 7n)).toBe(true);
    });

    it("seat-state carries the ledger; the view rider is per-seat and omit-when-unset", () => {
      const plain = makeWiring();
      plain.alice.join();
      plain.settle();
      expect(plain.alice.ledger()?.seatHolders.map((s) => s.participantId)).toEqual(["alice"]);
      expect(plain.alice.view()).toBeNull(); // no projectionSource → key never posted
      const left = plain.alice.ledger()?.seatHolders.find((s) => s.participantId === "alice");
      expect(left && "leftAtTick" in left).toBe(false); // absent-while-seated, never a null key

      const aliView: SeatViewWire = { cells: [] };
      const wired = makeWiring({ projectionSource: (seat) => (seat === "alice" ? aliView : undefined) });
      wired.alice.join();
      wired.bob.join();
      wired.settle();
      expect(wired.alice.view()).not.toBeNull(); // the rider reached its addressee
      expect(wired.bob.view()).toBeNull(); // …and ONLY its addressee
    });

    it("replica witness: digest equals the authority after every pump-set; writes fault", () => {
      const w = makeWiring();
      w.bob.join();
      w.settle();
      expect(w.replica.digest()).toBe(w.relay.timelineDigest()); // empty == empty
      for (let i = 0; i < 4; i += 1) {
        w.submitViaBob(`witness-${i}`);
        expect(w.replica.digest()).toBe(w.relay.timelineDigest());
      }
      const first = w.replica.shadowLog()[0] as CoopTimelineRecord;
      const authorityFirst = w.relay.sharedLog()[0] as CoopTimelineRecord;
      expect(first.tick).toBe(authorityFirst.tick); // stamps COPIED, never re-derived
      expect(first.seq).toBe(authorityFirst.seq);
      const refusalRaw = w.replica.ingest(encodeFrame({ ...HEAD, kind: "submit", participantId: "x", recordKind: "action", payload: talkAction("sneak") }));
      expect(refusalRaw).not.toBeNull();
      expect(refusalRaw).toContain("relay[replica-authority]");
      // The ledger copy rode seat-state frames:
      expect(w.replica.ledger()?.seatHolders.length).toBeGreaterThanOrEqual(1);
    });

    it("log budget refuses new submits and the standing log stays byte-stable", () => {
      const w = makeWiring({ logBudget: 4 });
      w.alice.join();
      w.bob.join();
      w.settle();
      for (let i = 0; i < 4; i += 1) w.submitViaBob(`within-${i}`);
      const digestBefore = w.relay.timelineDigest();
      const logBefore = w.relay.sharedLog().map((r) => `${r.tick}:${r.seq}`).join("|");
      w.bob.submit("action", talkAction("over-cap"));
      w.settle();
      expect(w.bob.faults().some((f) => /transport\[log-budget\]/.test(f.cause))).toBe(true);
      expect(w.relay.timelineDigest()).toBe(digestBefore);
      expect(w.relay.sharedLog().map((r) => `${r.tick}:${r.seq}`).join("|")).toBe(logBefore);
      expect(w.alice.faults()).toHaveLength(0); // the verdict went to the submitter, not the room
    });

    it("no save writes: the hub path only mutates the relay ledger via join/leave", () => {
      const w = makeWiring();
      w.alice.join();
      w.bob.join();
      w.settle();
      w.submitViaBob("x");
      w.relay.advanceTo(1n); // strict tenure law: leave on a later tick
      w.alice.leave();
      w.settle();
      const holders = w.relay.ledger().seatHolders;
      expect(holders.map((h) => h.participantId)).toEqual(["alice", "bob"]);
      const alice = holders[0];
      const bob = holders[1];
      expect(alice?.leftAtTick).toBeDefined();
      expect(bob?.leftAtTick).toBeUndefined(); // bob still seated
    });

    /* ════════ publish() — the host-sim-authoritative seam (I-TA (a)) ═══════ */

    const fixedCell = (key: string, value: string): TransportCellWire => Object.freeze({
      key,
      encoding: "fixed" as const,
      value,
      fidelity: 4,
      freshnessUs: "0",
      coverage: "65536",
      certainty: "65536",
      status: "live" as const,
    });

    it("publish() re-fans the rider per seat — scope A never sees B's cells, existence included", () => {
      const edgeView: SeatViewWire = { cells: Object.freeze([fixedCell("edge::rho", "3277")]) };
      const originView: SeatViewWire = { cells: Object.freeze([fixedCell("origin::rho", "655")]) };
      const w = makeWiring({ projectionSource: (seat) => (seat === "alice" ? edgeView : originView) });
      w.alice.join();
      w.bob.join();
      w.settle();
      const beforeAlice = w.framesTo("alice").length;
      const beforeBob = w.framesTo("bob").length;
      expect(w.hub.publish()).toBe(2); // both seats live → both fanned
      const aliceRaws = w.framesTo("alice").slice(beforeAlice);
      expect(aliceRaws).toHaveLength(1);
      const aliceFrame = decodeFrame(aliceRaws[0] as string) as SeatStateFrame;
      expect(aliceFrame.view?.cells.map((c) => c.key)).toEqual(["edge::rho"]);
      // Existence isolation: bob's scoped key appears NOWHERE in alice's rider —
      // not as a cell, not as a value, not as a mention. (Raw-substring probes
      // are unsafe here: "ledger" itself spells "edge" — the law is about the
      // DECODED rider keys.)
      expect(aliceFrame.view?.cells.some((c) => c.key.includes("origin"))).toBe(false);
      expect(aliceRaws[0]).not.toContain("origin");
      const bobRaws = w.framesTo("bob").slice(beforeBob);
      expect(bobRaws[0]).toContain("origin::rho");
      const bobFrame = decodeFrame(bobRaws[0] as string) as SeatStateFrame;
      expect(bobFrame.view?.cells.map((c) => c.key)).toEqual(["origin::rho"]);
    });

    it("publish() fans live seats only — the departed inbox stays frozen (@24426ec)", () => {
      let tick = 0;
      const w = makeWiring({ projectionSource: () => ({ cells: Object.freeze([fixedCell("x::rho", String((tick += 1)))]) }) });
      w.alice.join();
      w.carol.join();
      w.settle();
      w.relay.advanceTo(1n); // strict tenure law: leave on a later tick
      w.carol.leave();
      w.settle();
      const carolFrozen = w.framesTo("carol").length;
      const aliceBefore = w.framesTo("alice").length;
      expect(w.hub.publish()).toBe(1); // carol is gone from the fan-out
      expect(w.framesTo("carol")).toHaveLength(carolFrozen); // frozen across publish
      const aliceNew = w.framesTo("alice").slice(aliceBefore);
      expect(aliceNew).toHaveLength(1);
      const aliceFrame = decodeFrame(aliceNew[0] as string) as SeatStateFrame;
      const carolLedger = aliceFrame.ledger.seatHolders.find((s) => s.participantId === "carol");
      expect(carolLedger?.leftAtTick).toBeDefined(); // alice's ledger witness stays truthful
    });

    it("publish() without a projectionSource posts the PRE-SEAM seat-state shape — omit-when-unset", () => {
      const w = makeWiring(); // no projectionSource at all
      w.alice.join();
      w.settle();
      const joinRaws = w.framesTo("alice");
      expect(w.hub.publish()).toBe(1);
      const published = decodeFrame(w.framesTo("alice").at(-1) as string);
      expect(published.kind).toBe("seat-state");
      // Byte-posture law: the JSON KEY SET of a published seat-state equals the
      // join-time seat-state's — `view` never appears when unset.
      const keySet = (raw: string): readonly string[] => Object.keys(JSON.parse(raw) as Record<string, unknown>).sort();
      const joinFrame = JSON.parse(joinRaws.at(-1) as string) as Record<string, unknown>;
      expect(joinFrame["kind"]).toBe("seat-state");
      expect(keySet(w.framesTo("alice").at(-1) as string)).toEqual(keySet(joinRaws.at(-1) as string));
      expect("view" in (JSON.parse(w.framesTo("alice").at(-1) as string) as Record<string, unknown>)).toBe(false);
    });

    it("publish() is idempotent per call — repeats are byte-equal and stamp nothing", () => {
      const w = makeWiring({ projectionSource: () => ({ cells: Object.freeze([fixedCell("edge::rho", "42")]) }) });
      w.alice.join();
      w.bob.join();
      w.settle();
      const digestBefore = w.relay.timelineDigest();
      const logBefore = w.relay.sharedLog().length;
      const first = w.hub.publish();
      const aliceMid = w.framesTo("alice").length;
      const second = w.hub.publish();
      expect(second).toBe(first); // same live count — a pure read, no state drift
      const aliceRaws = w.framesTo("alice");
      expect(aliceRaws[aliceMid]).toBe(aliceRaws.at(-1)); // byte-identical frames
      expect(w.relay.timelineDigest()).toBe(digestBefore); // publish stamps nothing
      expect(w.relay.sharedLog()).toHaveLength(logBefore); // publish appends nothing
    });
  });
}

export { digestCoopTimeline, asRunSeed };
export type { HashHex };
