/**
 * `test/relay.host.test.ts` — the two-runners-one-digest claim of the relay
 * spike, re-proven through the HOST over real loopback sockets: two browser
 * seats (here: raw ws clients riding the L-WS-B-shaped client port) converge
 * on identical stamped logs, the ledger broadcasts its seat-state, departed
 * inboxes freeze, catch-up pages a mid-run joiner to byte-equality, and the
 * dev interval + stop() behave (the timer IS the subject in those two legs —
 * see the header note in test/wsConformance.test.ts).
 */

import { once } from "node:events";
import { afterEach, describe, expect, it } from "vitest";
import { digestCoopTimeline } from "@hh/sim-core/replay";
import type { CoopTimelineRecord } from "@hh/sim-core/replay";
import { closeSeat, openSeat, settle, startTestHost, waitUntil } from "./hostHarness.ts";
import type { HostHandle, TestSeat } from "./hostHarness.ts";

function talkAction(note: string): Readonly<Record<string, unknown>> {
  return { args: { verb: "communicate", target: null, note } };
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

describe("host relay over the wire", () => {
  it("two real clients converge identical stamped logs — digest equality after N pumps", async () => {
    const h = await host();
    const alice = await seat(h, "alice");
    const bob = await seat(h, "bob");
    alice.client.join();
    bob.client.join();
    await settle(h, alice, bob);
    for (let i = 0; i < 4; i += 1) {
      const submitter = i % 2 === 0 ? alice : bob;
      submitter.client.submit("action", talkAction(`pump-${i}`));
      await settle(h, alice, bob);
    }
    expect(h.relay.sharedLog()).toHaveLength(4);
    const stamps = (seat_: TestSeat) => seat_.client.records().map((r) => `${r.tick}:${r.seq}`);
    expect(stamps(alice)).toEqual(stamps(bob));
    expect(stamps(alice)).toEqual(["0:0", "0:1", "0:2", "0:3"]); // manual clock: every stamp at tick 0, R1 seq stream
    expect(digestCoopTimeline(alice.client.records())).toBe(h.relay.timelineDigest());
    expect(digestCoopTimeline(bob.client.records())).toBe(h.relay.timelineDigest());
  });

  it("seat-state ledger broadcast: canonical order, absent-while-seated", async () => {
    const h = await host();
    const alice = await seat(h, "alice");
    const bob = await seat(h, "bob");
    alice.client.join();
    bob.client.join();
    await settle(h, alice, bob);
    const ledger = alice.client.ledger();
    expect(ledger?.seatHolders.map((s) => s.participantId)).toEqual(["alice", "bob"]); // canonical same-tick order
    for (const holder of ledger?.seatHolders ?? []) {
      expect("leftAtTick" in holder).toBe(false); // never a null key — absence is the seated sentinel
    }
  });

  it("departed-seat inbox freeze (@24426ec law) over the wire", async () => {
    const h = await host();
    const alice = await seat(h, "alice");
    const bob = await seat(h, "bob");
    const carol = await seat(h, "carol");
    alice.client.join();
    bob.client.join();
    carol.client.join();
    await settle(h, alice, bob, carol);
    bob.client.submit("action", talkAction("round-one"));
    await settle(h, alice, bob, carol);
    const carolCount = carol.client.records().length;
    h.pumpTo(1n); // strict tenure law: departure lands on a later tick than the join
    carol.client.leave();
    await settle(h, alice, bob, carol);
    h.pumpTo(7n);
    bob.client.submit("action", talkAction("after-carol-left"));
    await settle(h, alice, bob, carol);
    expect(carol.client.records()).toHaveLength(carolCount); // frozen at departure — fan-out is LIVE seats only
    expect(alice.client.records().some((r) => r.tick === 7n)).toBe(true); // and the room moved on
    expect(h.hub.faults()).toHaveLength(0);
  });

  it("catch-up pages drive a mid-run joiner to a byte-equal inbox (pageSize 3 over real sockets)", async () => {
    const h = await host({ pageSize: 3 });
    const alice = await seat(h, "alice");
    const bob = await seat(h, "bob");
    alice.client.join();
    bob.client.join();
    await settle(h, alice, bob);
    for (let i = 0; i < 7; i += 1) {
      (i % 2 === 0 ? bob : alice).client.submit("action", talkAction(`pre-${i}`));
      await settle(h, alice, bob);
    }
    const authority = h.relay.timelineDigest();
    const carol = await seat(h, "carol");
    carol.client.join();
    await settle(h, alice, bob, carol);
    expect(carol.client.records()).toHaveLength(0); // WIRE posture: autoCatchUpOnJoin:false — tenure opens DRY
    carol.client.runCatchUp(); // one frame type; pages chain while hasMore holds
    await settle(h, alice, bob, carol);
    expect(carol.client.isCaughtUp()).toBe(true);
    expect(carol.client.records()).toHaveLength(7);
    expect(carol.client.records().map((r) => `${r.tick}:${r.seq}`)).toEqual(
      alice.client.records().map((r) => `${r.tick}:${r.seq}`),
    );
    expect(digestCoopTimeline(carol.client.records())).toBe(authority);
    const first = carol.client.records()[0] as CoopTimelineRecord;
    expect(first.kind).toBe("action"); // revived through the strict parser, byte-true stamps
  });

  it("auto-tick dev mode: the interval advances the relay clock AND pumps the hub — no manual drain anywhere", async () => {
    const h = await host({ tickMs: 5 });
    const bob = await seat(h, "bob");
    bob.client.join(); // rides the interval: 'message' → hubInbox → interval drain at tick >= 1
    // pump = the seat-side drain duty a real browser app runs on its frame loop
    await waitUntil(
      () => bob.client.ledger() !== null && h.relay.tick() >= 2n,
      () => void bob.client.drain(),
    );
    expect(h.relay.tick() >= 2n).toBe(true);
    const alice = await seat(h, "alice");
    alice.client.join();
    await waitUntil(
      () => alice.client.ledger() !== null, // the interval seated her — no manual hub drain
      () => void (alice.client.drain(), bob.client.drain()),
    );
    expect(alice.client.records()).toHaveLength(0); // wire posture: tenure opens DRY
    bob.client.submit("action", talkAction("interval-flow"));
    await waitUntil(
      () => alice.client.records().length === 1, // live fan-out, on its own clock
      () => void (alice.client.drain(), bob.client.drain()),
    );
    expect(alice.client.records()[0]?.payload).toEqual({ args: { verb: "communicate", target: null, note: "interval-flow" } });
  });

  it("stop() is quiescent: interval cleared, every socket closed, zero handles left dangling", async () => {
    const h = await host({ tickMs: 10 });
    const alice = await seat(h, "alice");
    const bob = await seat(h, "bob");
    alice.client.join();
    bob.client.join();
    await settle(h, alice, bob);
    const closed = Promise.all([once(alice.socket, "close"), once(bob.socket, "close")]);
    await h.stop();
    await closed; // the host's 1001 close reached both real sockets
    expect(alice.socket.readyState).toBe(3); // CLOSED
    expect(bob.socket.readyState).toBe(3);
    const frozen = h.relay.tick();
    await new Promise((resolve) => setTimeout(resolve, 40)); // > one tick window
    expect(h.relay.tick()).toBe(frozen); // the interval is gone — clock moved for no one
    expect(h.hub.drain()).toBe(0); // quiescent carrier: nothing pending, nothing arriving
    await h.stop(); // idempotent — a second stop must not throw nor hang
  });
});
