/**
 * `test/autoLeave.host.test.ts` — the carrier's synthesized-leave cure
 * (lane L-AUTH), over REAL loopback sockets with hard TCP kills.
 *
 * Every leg rides the frame channel the cure actually uses: the hub sees a
 * leave FRAME it never received from a browser — exactly the fault-frame
 * precedent (the hub authors what it didn't get; here the carrier authors a
 * client-protocol frame on a client's behalf because the carrier witnessed
 * the client dying, the only fact it can legitimately know).
 *
 * TICK DISCIPLINE (save/coop strict-after law, wsHubPort header): a leave
 * must stamp at a relay tick STRICTLY after its join's. The host rituals
 * (pump/pumpTo/interval/step) advance-then-drain, so they guarantee it;
 * these tests therefore pump BEFORE draining a synthesized leave, never raw
 * settle it into the join's own tick. No fake timers; awaited callbacks +
 * port-counter waitUntil loops only; loopback port-0.
 */

import { once } from "node:events";
import { afterEach, describe, expect, it } from "vitest";
import { encodeFrame, TRANSPORT_PROTOCOL, TRANSPORT_PROTOCOL_VERSION } from "transport-tools";
import type { CoopTimelineRecord } from "@hh/sim-core/replay";
import { WebSocket } from "ws";
import { closeSeat, hardKill, hostUrl, macrotask, openSeat, settle, startTestHost, waitUntil } from "./hostHarness.ts";
import type { HostHandle, TestSeat } from "./hostHarness.ts";

const HEAD = { protocol: TRANSPORT_PROTOCOL, version: TRANSPORT_PROTOCOL_VERSION } as const;

function talkAction(note: string): Readonly<Record<string, unknown>> {
  return { args: { verb: "communicate", target: null, note } };
}

function openTenures(h: HostHandle): readonly string[] {
  return h.relay.ledger().seatHolders.filter((s) => s.leftAtTick === undefined).map((s) => s.participantId as string);
}

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

describe("auto-leave on disconnect (default ON)", () => {
  it("hard-killed socket vacates its open tenure — the v0 open-forever bug is cured", async () => {
    const h = await host();
    const alice = await seat(h, "alice");
    alice.client.join();
    await settle(h, alice);
    expect(openTenures(h)).toEqual(["alice"]); // the v0 posture: this row would stay open forever

    await hardKill(alice);
    await waitUntil(() => h.port.queued() === 1); // carrier saw the death, queued the leave frame
    expect(h.pump()).toBe(1); // advance-then-drain: the stamp law holds (0 join → 1 leave)
    expect(openTenures(h)).toEqual([]);
    expect(h.relay.ledger().seatHolders[0]?.leftAtTick).toBe(1n);
    expect(h.hub.faults()).toHaveLength(0); // the vacate is legitimate, not a refused ghost-leave
  });

  it("FIFO: a submit queued before the kill stamps FIRST; the leave follows it", async () => {
    const h = await host();
    const alice = await seat(h, "alice");
    alice.client.join();
    await settle(h, alice);
    h.pumpTo(5n);
    alice.client.submit("action", talkAction("last-words"));
    await waitUntil(() => h.port.queued() === 1); // the carrier holds the submit…
    expect(h.relay.sharedLog()).toHaveLength(0); // …undrained: the stamp has not happened
    await hardKill(alice);
    await waitUntil(() => h.port.queued() === 2); // …and the synthesized leave queued BEHIND it
    expect(h.pump()).toBe(2);
    const record = h.relay.sharedLog()[0] as CoopTimelineRecord;
    expect(record.participantId).toBe("alice"); // an inverted order would have faulted not-seated
    expect(record.tick).toBe(6n);
    expect(openTenures(h)).toEqual([]);
    expect(h.relay.ledger().seatHolders[0]?.leftAtTick).toBe(6n);
    expect(h.hub.faults()).toHaveLength(0);
  });

  it("last-claim guard: a dead predecessor's close never vacates a live seat", async () => {
    const h = await host();
    const aliceA = await seat(h, "alice");
    aliceA.client.join();
    await settle(h, aliceA);

    // A second socket speaks AS alice. The relay cannot tell sockets apart in
    // v0 (identity binding is the deferred room rung), so with alice's
    // tenure open her submit STAMPS as a genuine record — what matters here
    // is that it STEALS THE CARRIER ROUTE (learnRoute follows frames).
    const claimant = new WebSocket(hostUrl(h));
    await once(claimant, "open");
    claimant.send(encodeFrame({ ...HEAD, kind: "submit", participantId: "alice", recordKind: "action", payload: talkAction("stolen-route") }));
    await settle(h, aliceA);
    expect(h.relay.sharedLog()).toHaveLength(1); // accepted, not faulted — the v0 seat-agnostic stamp
    expect(h.port.routes()).toBe(1); // alice → claimant now

    await hardKill(aliceA); // the JOINED socket dies, but no longer holds the route
    await macrotask();
    await macrotask();
    expect(h.port.queued()).toBe(0); // last-claim guard: nothing synthesized for a seat it doesn't own
    expect(h.pump()).toBe(0);
    expect(openTenures(h)).toEqual(["alice"]); // the live tenure survives its predecessor's death

    claimant.close(); // the never-joined route holder dies too: still zero synthesis (join-visible gate)
    await once(claimant, "close");
    await macrotask();
    expect(h.port.queued()).toBe(0);
    expect(h.pump()).toBe(0);
    expect(openTenures(h)).toEqual(["alice"]);
    expect(h.hub.faults()).toHaveLength(0);
  });

  it("suppression: own leave delivered, then close — exactly ONE vacate, zero faults", async () => {
    const h = await host();
    const alice = await seat(h, "alice");
    alice.client.join();
    await settle(h, alice);
    h.pumpTo(1n); // strict-after: the explicit leave must stamp after its join's tick anyway
    alice.client.leave();
    await settle(h, alice);
    expect(openTenures(h)).toEqual([]);

    await hardKill(alice);
    await macrotask();
    await macrotask();
    expect(h.port.queued()).toBe(0); // the carrier-local flag suppressed the synthesis
    expect(h.pump()).toBe(0); // (unsuppressed, this drain would crash on already-left)
    expect(h.relay.ledger().seatHolders).toHaveLength(1); // exactly one vacate rode the ledger
    expect(h.relay.ledger().seatHolders[0]?.leftAtTick).toBe(1n);
    expect(h.hub.faults()).toHaveLength(0);
  });

  it("opt-out knob restores the legacy open-forever posture (falsifiable BY RULING default)", async () => {
    const h = await host({ autoLeaveOnDisconnect: false });
    const alice = await seat(h, "alice");
    alice.client.join();
    await settle(h, alice);
    await hardKill(alice);
    await waitUntil(() => h.port.routes() === 0);
    expect(h.port.queued()).toBe(0); // no byte synthesized at all
    expect(h.pump()).toBe(0);
    expect(openTenures(h)).toEqual(["alice"]); // the v0 bug, preserved by explicit opt-out
    expect(h.hub.faults()).toHaveLength(0);
  });

  it("silent never-joined socket close: zero frames, zero faults", async () => {
    const h = await host();
    const lurker = new WebSocket(hostUrl(h)); // connects, sends NOTHING, leaves
    await once(lurker, "open");
    lurker.close();
    await once(lurker, "close");
    await macrotask();
    await macrotask();
    expect(h.port.queued()).toBe(0);
    expect(h.hub.drain()).toBe(0);
    expect(h.hub.faults()).toHaveLength(0);
    expect(h.relay.sharedLog()).toHaveLength(0);
  });

  it("stop() quiesces synthesis: in-teardown closes queue no verdicts", async () => {
    const h = await host();
    const alice = await seat(h, "alice");
    alice.client.join();
    await settle(h, alice);
    await h.stop(); // closes every socket — the 1001 path must NOT leave undrainable synthesis in the inbox
    expect(h.port.queued()).toBe(0);
    expect(h.hub.drain()).toBe(0); // the standing "stop() is quiescent" guarantee, now against synthesis too
  });
});
