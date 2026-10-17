/**
 * `test/wsConformance.test.ts` — the transport port laws expressed over REAL
 * loopback WebSocket sockets (host ruling 2026-10-17: playable prototype on
 * the in-repo dev carrier).
 *
 * TIMERS, HONESTLY: the tools family (transport, relay) is timer-free by
 * law; this package is the ONE timer-bearing corner of it. No frame-law
 * assertion is timed: every test runs on the MANUAL host (tickMs 0) and
 * rides awaited socket callbacks + explicit hub drains (see hostHarness —
 * the settle loop awaits macrotasks for real 'message' events, it never
 * sleeps "long enough" per assertion). The auto-interval legs live in
 * test/relay.host.test.ts where the timer IS the subject.
 *
 * The full runTransportConformance body stays transport's (it drives the
 * inMemory carrier's dup/suspend/permutation knobs a real loopback socket
 * cannot deterministically express); this file runs the port-only subset a
 * real socket genuinely expresses — the carrier-swap acceptance gate in
 * miniature, on the wire.
 */

import { once } from "node:events";
import { afterEach, describe, expect, it } from "vitest";
import {
  encodeFrame,
  MAX_FRAME_BYTES,
  TRANSPORT_PROTOCOL,
  TRANSPORT_PROTOCOL_VERSION,
} from "transport-tools";
import type { TransportError } from "transport-tools";
import type { CoopTimelineRecord } from "@hh/sim-core/replay";
import { WebSocket } from "ws";
import { closeSeat, hostUrl, macrotask, openSeat, settle, startTestHost } from "./hostHarness.ts";
import type { HostHandle, TestSeat } from "./hostHarness.ts";

/** Mirrors test/conformance.ts talkAction (cross-package deep import stays
 *  out — the shape is three lines, the discipline is the point). */
function talkAction(note: string): Readonly<Record<string, unknown>> {
  return { args: { verb: "communicate", target: null, note } };
}

const HEAD = { protocol: TRANSPORT_PROTOCOL, version: TRANSPORT_PROTOCOL_VERSION } as const;

const live: { handle: HostHandle; seats: TestSeat[] }[] = [];

async function host(options: Parameters<typeof startTestHost>[0] = {}): Promise<HostHandle> {
  const handle = await startTestHost(options);
  live.push({ handle, seats: [] });
  return handle;
}

async function seat(handle: HostHandle, id: string): Promise<TestSeat> {
  const opened = await openSeat(handle, id);
  const entry = live.find((l) => l.handle === handle);
  entry?.seats.push(opened);
  return opened;
}

afterEach(async () => {
  for (const { handle, seats } of live) {
    for (const s of seats) await closeSeat(s);
    await handle.stop();
  }
  live.length = 0;
});

describe("ws carrier conformance (loopback, manual tick)", () => {
  it("full loop join → submit → broadcast → client-side door feed over real sockets", async () => {
    const h = await host();
    const alice = await seat(h, "alice");
    const bob = await seat(h, "bob");
    alice.client.join();
    bob.client.join();
    await settle(h, alice, bob);
    h.relay.advanceTo(3n);
    bob.client.submit("action", talkAction("hello-from-bob"));
    await settle(h, alice, bob);
    const feed = alice.client.feedToDoor();
    expect(feed).toHaveLength(1);
    const intent = feed[0] as (typeof feed)[number];
    expect(intent.tick).toBe(3n);
    expect(intent.intent.clock).toBe("sim");
    expect(intent.intent.origin).toBe("player");
    expect(intent.intent.seq).toBe(0); // R1 lifetime-monotonic seq, hub-stamped
  });

  it("R1 through the wire: client tick hints are telemetry, the hub stamps", async () => {
    const h = await host();
    const alice = await seat(h, "alice");
    const bob = await seat(h, "bob");
    alice.client.join("999"); // advisory hint — the hub clock is 0n
    bob.client.join();
    await settle(h, alice, bob);
    h.relay.advanceTo(5n);
    bob.client.submit("action", talkAction("hinted"));
    await settle(h, alice, bob);
    const record = alice.client.records()[0] as CoopTimelineRecord;
    expect(record.tick).toBe(5n); // NOT 999 — acceptance tick is the hub's clock
    const tenure = alice.client.ledger()?.seatHolders.find((s) => s.participantId === "alice");
    expect(tenure?.joinedAtTick).toBe("0"); // join processed at tick 0; hint ignored entirely
  });

  it("IDENTICAL re-send delivered genuinely on the socket is absorbed: counter moves, inbox untouched", async () => {
    const h = await host();
    const alice = await seat(h, "alice");
    const bob = await seat(h, "bob");
    alice.client.join();
    bob.client.join();
    await settle(h, alice, bob);
    h.relay.advanceTo(2n);
    bob.client.submit("action", talkAction("dup-me"));
    await settle(h, alice, bob);
    const record = alice.client.records()[0] as CoopTimelineRecord;
    expect(alice.client.duplicatesDropped()).toBe(0);
    // Carrier redelivery, expressed on the real wire: the hub posts the same
    // frame toward alice's socket a second time (encodeFrame is
    // key-order-by-construction → byte-identical bytes cross the socket).
    h.port.client("alice").send({ ...HEAD, kind: "broadcast", record });
    await settle(h, alice, bob);
    expect(alice.client.duplicatesDropped()).toBe(1);
    expect(alice.client.records()).toHaveLength(1); // inbox untouched
    const before = alice.wire.length;
    expect(before).toBeGreaterThan(0); // the snoop really saw the traffic
  });

  it("same stamp, DIVERGENT payload is FATAL: transport[dup-conflict] at the client boundary", async () => {
    const h = await host();
    const alice = await seat(h, "alice");
    const bob = await seat(h, "bob");
    alice.client.join();
    bob.client.join();
    await settle(h, alice, bob);
    h.relay.advanceTo(2n);
    bob.client.submit("action", talkAction("original"));
    await settle(h, alice, bob);
    const record = alice.client.records()[0] as CoopTimelineRecord;
    const forged: CoopTimelineRecord = { ...record, payload: talkAction("DIVERGENT") };
    h.port.client("alice").send({ ...HEAD, kind: "broadcast", record: forged });
    await macrotask(); // let the forged frame cross the real socket…
    await macrotask();
    let caught: unknown = undefined;
    try {
      alice.client.drain(); // …and die at the idempotence gate, not silently
    } catch (error) {
      caught = error;
    }
    const name = (caught as { name?: string } | undefined)?.name;
    const code = (caught as TransportError | undefined)?.code;
    expect(name).toBe("TransportError");
    expect(code).toBe("dup-conflict");
    expect(alice.client.records()).toHaveLength(1); // the divergent payload never entered
    expect(alice.client.feedToDoor()).toHaveLength(1);
  });

  it("ghost submit from a connected-but-unseated socket faults relay[not-seated] back on HER socket", async () => {
    const h = await host();
    const alice = await seat(h, "alice");
    alice.client.join();
    await settle(h, alice);
    const carol = await seat(h, "carol"); // connected, never joined
    carol.client.submit("action", talkAction("ghost-intent"));
    await settle(h, alice, carol);
    const faults = carol.client.faults();
    expect(faults).toHaveLength(1);
    expect(faults[0]?.cause).toMatch(/^relay\[not-seated\]/);
    // The route was learned by the routing peek on her SUBMIT frame — no join
    // needed to answer her — and the hub lives to stamp another day:
    h.relay.advanceTo(2n);
    alice.client.submit("action", talkAction("still-here"));
    await settle(h, alice, carol);
    expect(alice.client.records().some((r) => r.tick === 2n)).toBe(true);
  });

  it("bad-json bytes fault against 'frame' (observable verdict); the hub survives", async () => {
    const h = await host();
    const alice = await seat(h, "alice");
    const bob = await seat(h, "bob");
    alice.client.join();
    bob.client.join();
    await settle(h, alice, bob);
    alice.socket.send("{not json at all"); // raw carrier noise on a real socket
    await settle(h, alice, bob);
    expect(h.hub.faults().some((f) => f.against === "frame" && f.cause.includes("bad-json"))).toBe(true);
    h.relay.advanceTo(4n);
    bob.client.submit("action", talkAction("post-junk"));
    await settle(h, alice, bob);
    expect(alice.client.records().some((r) => r.tick === 4n)).toBe(true);
  });

  it("oversize frame: the CARRIER enforces MAX_FRAME_BYTES by closing that connection (1009); hub + other seats survive", async () => {
    const h = await host();
    const alice = await seat(h, "alice");
    const bob = await seat(h, "bob");
    alice.client.join();
    bob.client.join();
    await settle(h, alice, bob);
    // Carrier-vs-codec resolution (documented for lane L-WS-B): maxPayload is
    // set to the codec's single-source cap, so an oversize write is a wire
    // CLOSE (code 1009), not a fault frame — the codec's oversize wall stays
    // as defense-in-depth behind any carrier with a larger ceiling.
    const loud = new WebSocket(hostUrl(h));
    await once(loud, "open");
    const closed = once(loud, "close");
    loud.send("x".repeat(MAX_FRAME_BYTES + 1024));
    const [code] = (await closed) as [number];
    expect(code).toBe(1009); // ws: Message too big
    h.relay.advanceTo(4n);
    bob.client.submit("action", talkAction("after-oversize"));
    await settle(h, alice, bob);
    expect(alice.client.records().some((r) => r.tick === 4n)).toBe(true);
  });

  it("log-budget refusal rides back as a fault verdict frame; the standing log stays capped", async () => {
    const h = await host({ logBudget: 2 });
    const alice = await seat(h, "alice");
    const bob = await seat(h, "bob");
    alice.client.join();
    bob.client.join();
    await settle(h, alice, bob);
    bob.client.submit("action", talkAction("within-0"));
    bob.client.submit("action", talkAction("within-1"));
    bob.client.submit("action", talkAction("over-cap"));
    await settle(h, alice, bob);
    expect(bob.client.faults().some((f) => /transport\[log-budget\]/.test(f.cause))).toBe(true);
    expect(h.relay.sharedLog()).toHaveLength(2);
    expect(alice.client.faults()).toHaveLength(0); // verdict to the submitter, not the room
    expect(alice.client.records()).toHaveLength(2); // the standing log reached the room intact
  });
});
