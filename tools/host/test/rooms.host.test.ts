/**
 * `test/rooms.host.test.ts` — the v0 room law, pinned over real sockets:
 *
 * **The ledger IS the room registry.** One relay per process, no second
 * room table: a seat collision (same participantId joins while its tenure
 * is open) is refused by the save/coop double-open-row law itself, and
 * presence is that ledger re-fanned as `seat-state` on every membership
 * event (join/leave/submit) and on `publish()` (@61efe31).
 *
 * DISK-VERIFIED SURFACE (corrects a v0 doc aspiration, reported not edited
 * — coopRoomWire's header belongs to its own lane): the refusal rides the
 * ledger's OWN error grammar — a named `SaveError` thrown through
 * `hub.drain()` at the pump boundary — NOT a fault frame. The refused
 * mutation is state-safe (the ledger never moved); the host lives. A
 * collision claimant that later dies CAN vacate the seat it failed to open
 * (last-claim routing has no identity binding — named in the README, the
 * deferred auth rung's deeper fix).
 */

import { once } from "node:events";
import { afterEach, describe, expect, it } from "vitest";
import { encodeFrame, TRANSPORT_PROTOCOL, TRANSPORT_PROTOCOL_VERSION } from "transport-tools";
import { WebSocket } from "ws";
import { closeSeat, hardKill, hostUrl, openSeat, settle, startTestHost, waitUntil } from "./hostHarness.ts";
import type { HostHandle, TestSeat } from "./hostHarness.ts";

const HEAD = { protocol: TRANSPORT_PROTOCOL, version: TRANSPORT_PROTOCOL_VERSION } as const;

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

describe("room = ledger (v0: one relay per process)", () => {
  it("seat collision over the wire: the ledger refuses LOUD, state-safe; the host survives", async () => {
    const h = await host();
    const alice = await seat(h, "alice");
    alice.client.join();
    await settle(h, alice); // tenure [0, open)
    h.pumpTo(2n);

    const impostor = new WebSocket(hostUrl(h));
    await once(impostor, "open");
    impostor.send(encodeFrame({ ...HEAD, kind: "join", participantId: "alice" })); // open tenure → second open row
    await waitUntil(() => h.port.queued() === 1); // let the byte reach the inbox before the verdict
    let thrown: unknown;
    try {
      h.hub.drain();
    } catch (error) {
      thrown = error;
    }
    // The ledger's OWN law rejects it — a named SaveError at the pump
    // boundary (NOT a fault frame; the brief's "double-open-row fault" reads
    // as fault-CHANNEL semantics, disk truth is the throw; reported).
    expect((thrown as Error).name).toBe("SaveError");
    expect((thrown as Error).message).toMatch(
      /opens a tenure at tick 2 while its earlier tenure from tick 0 is still open — a writer holds one tenure at a time/,
    );
    expect(h.relay.ledger().seatHolders).toHaveLength(1); // the refusal changed NOTHING
    expect(openTenures(h)).toEqual(["alice"]);
    expect(h.hub.faults()).toHaveLength(0); // no verdict frame — this is the throw arm

    // Host survives: the room still stamps. (The survivor's route is now the
    // claimant's — last-claim, no identity binding; the wire reply rides
    // there. The LOG truth is the witness; the claimant socket stays open
    // so stop()'s shutdown quiesces its close — the vacate edge the README
    // names is deliberately not walked further here.)
    alice.client.submit("action", { args: { verb: "communicate", target: null, note: "still-here" } });
    await waitUntil(() => h.port.queued() === 1);
    expect(h.pump()).toBe(1);
    expect(h.relay.sharedLog()).toHaveLength(1);
    expect(openTenures(h)).toEqual(["alice"]);
    impostor.close();
  });

  it("presence is ledger state re-fanned: 2 seats → 1 leaves → survivor sees exactly one open row", async () => {
    const h = await host();
    const alice = await seat(h, "alice");
    const bob = await seat(h, "bob");
    alice.client.join();
    bob.client.join();
    await settle(h, alice, bob);
    expect(alice.client.ledger()?.seatHolders.filter((s) => s.leftAtTick === undefined).map((s) => s.participantId))
      .toEqual(["alice", "bob"]); // the room, as the survivor sees it

    h.pumpTo(1n); // strict-after tenure law: the leave stamps after the join tick
    bob.client.leave();
    await settle(h, alice, bob);

    const rows = alice.client.ledger()?.seatHolders ?? [];
    expect(rows).toHaveLength(2); // history keeps BOTH tenures — the ledger is append-only
    expect(rows.filter((s) => s.leftAtTick === undefined).map((s) => s.participantId)).toEqual(["alice"]);
    expect(rows.find((s) => s.participantId === "bob")?.leftAtTick).toBe("1");
    expect(h.hub.faults()).toHaveLength(0);
  });

  it("the cure's headline: hard-kill → auto-leave → RE-JOIN AS NEW ROW is legal over the wire", async () => {
    // Pre-cure this sequence was IMPOSSIBLE: the dead socket's open tenure
    // made the re-join a double-open-row refusal (the coopRoomWire honest
    // gap, L-RH re-join-as-new-row @500c134 has no chance to apply).
    const h = await host();
    const first = await seat(h, "alice");
    first.client.join();
    await settle(h, first);
    await hardKill(first);
    await waitUntil(() => h.port.queued() === 1);
    h.pump(); // vacate@1 — synthesized through the leave-frame channel

    const second = await seat(h, "alice"); // a NEW socket, same participantId
    second.client.join();
    await settle(h, second); // drained at tick 1, NO advance between: boundary-touch [0,1)+[1,…) is the L-RH-legal shape
    h.pumpTo(3n);
    second.client.submit("action", { args: { verb: "communicate", target: null, note: "re-born" } });
    await settle(h, second);

    const rows = h.relay.ledger().seatHolders.filter((s) => s.participantId === "alice");
    expect(rows).toHaveLength(2); // re-join = NEW row (L-RH law 2), the cure made it reachable
    expect(rows[0]).toEqual({ participantId: "alice", joinedAtTick: 0n, leftAtTick: 1n });
    expect(rows[1]).toEqual({ participantId: "alice", joinedAtTick: 1n, leftAtTick: undefined });
    expect(h.relay.sharedLog()).toHaveLength(1);
    expect(h.hub.faults()).toHaveLength(0);
    expect(openTenures(h)).toEqual(["alice"]);
  });
});
