/**
 * test/inMemory.test.ts — the deterministic carrier adapter.
 *
 * The headliners: same-seed-same-ops byte-trace equality across two
 * independent constructions, the delivery permutation drawn from the kernel
 * stream (never Math.random), every knob observed firing, and the vi-spy
 * trio proving the package touches ZERO timers / wall-clock even when the
 * whole transport stack runs a scenario through it.
 */

import { describe, expect, it, vi } from "vitest";
import { createCoopRelay } from "relay-tools";
import { attachRelayHub } from "../src/server.ts";
import { createTransportClient } from "../src/client.ts";
import {
  TRANSPORT_PROTOCOL,
  TRANSPORT_PROTOCOL_VERSION,
} from "../src/envelope.ts";
import type { TransportFrame } from "../src/envelope.ts";
import { createInMemoryTransport } from "../src/inMemory.ts";
import { encodeFrame } from "../src/codec.ts";

const HEAD = { protocol: TRANSPORT_PROTOCOL, version: TRANSPORT_PROTOCOL_VERSION } as const;

function submitFrame(note: string): TransportFrame {
  return { ...HEAD, kind: "submit", participantId: "probe", recordKind: "note", payload: { note } };
}

function scenario(make: () => ReturnType<typeof createInMemoryTransport>): readonly string[] {
  const net = make();
  for (let i = 0; i < 5; i += 1) {
    net.port.hub.send(submitFrame(`n${i}`));
    net.port.client("alice").send({ ...HEAD, kind: "broadcast", record: { participantId: "alice" as never, tick: BigInt(i), seq: 0, kind: "note", payload: {} } });
    net.port.client("bob").send({ ...HEAD, kind: "seat-state", sentAtTick: `${i}`, ledger: { seatHolders: [] }, lastStamp: null });
    net.schedule.step();
  }
  net.schedule.pump(8);
  const trace = net.trace().map((e) => `${e.sendId}|${e.target}|${e.kind}|${e.raw}`);
  return Object.freeze([...trace, JSON.stringify(net.stats())]);
}

describe("in-memory carrier determinism", () => {
  it("same seed + same ops ⇒ identical byte-trace across two constructions", () => {
    const a = scenario(() => createInMemoryTransport({ permutationSeed: 7n }));
    const b = scenario(() => createInMemoryTransport({ permutationSeed: 7n }));
    expect(a).toEqual(b);
  });

  it("a permutation seed reorders a same-step batch WITHOUT changing its contents", () => {
    const net = createInMemoryTransport({ permutationSeed: 11n });
    const notes = Array.from({ length: 8 }, (_, i) => `p${i}`);
    for (const note of notes) net.port.client("x").send(submitFrame(note));
    net.schedule.pump(2);
    const delivered = net.port.client("x").poll().map((raw) => JSON.parse(raw).payload.note);
    expect([...delivered].sort()).toEqual([...notes].sort()); // same set
    const plain = createInMemoryTransport();
    for (const note of notes) plain.port.client("x").send(submitFrame(note));
    plain.schedule.pump(2);
    const fifo = plain.port.client("x").poll().map((raw) => JSON.parse(raw).payload.note);
    expect(fifo).toEqual(notes); // unseeded = pure FIFO intake
    expect(delivered).not.toEqual(notes); // seed 11 actually shuffles 8 items
  });

  it("delayByKind holds a frame in flight for its exact number of steps", () => {
    const net = createInMemoryTransport({ delayByKind: { submit: 3 } });
    net.port.hub.send(submitFrame("slow"));
    expect(net.schedule.step()).toBe(false); // due step 3 — in flight
    expect(net.port.hub.poll()).toHaveLength(0);
    expect(net.schedule.step()).toBe(false); // still in flight
    expect(net.port.hub.poll()).toHaveLength(0);
    expect(net.schedule.step()).toBe(true); // lands on exactly the third step
    expect(net.port.hub.poll()).toHaveLength(1);
  });

  it("the dup knob replays a send byte-identically and counts it", () => {
    const net = createInMemoryTransport({ duplicateFrameIds: [0] });
    net.port.client("y").send(submitFrame("twice"));
    net.schedule.pump(2);
    const got = net.port.client("y").poll();
    expect(got).toHaveLength(2);
    expect(got[0]).toBe(got[1]);
    expect(net.stats().duplicated).toBe(1);
  });

  it("a suspended seat drops toward it (counted); resume keeps flowing", () => {
    const net = createInMemoryTransport({ dropUntilResume: ["gone"] });
    net.port.client("gone").send(submitFrame("lost"));
    net.schedule.pump(2);
    expect(net.port.client("gone").poll()).toHaveLength(0);
    expect(net.stats().dropped).toBe(1);
    net.resumeSeat("gone");
    net.port.client("gone").send(submitFrame("kept"));
    net.schedule.pump(2);
    expect(net.port.client("gone").poll()).toHaveLength(1);
    expect(net.stats().dropped).toBe(1); // drops are drops — no resurrection
  });

  it("mailboxes demux: hub inbound is FIFO across senders; seats never see each other", () => {
    const net = createInMemoryTransport();
    net.port.hub.send(submitFrame("from-alice"));
    net.port.hub.send({ ...HEAD, kind: "join", participantId: "bob" });
    net.port.client("alice").send({ ...HEAD, kind: "broadcast", record: { participantId: "alice" as never, tick: 1n, seq: 0, kind: "note", payload: {} } });
    net.schedule.pump(2);
    const hubGot = net.port.hub.poll().map((raw) => JSON.parse(raw).kind);
    expect(hubGot).toEqual(["submit", "join"]); // hub inbox never permutes (acceptance-order law)
    expect(net.port.client("bob").poll()).toHaveLength(0); // bob's mail is bob's only
  });

  it("poll drains once — delivered-not-again per endpoint", () => {
    const net = createInMemoryTransport();
    net.port.client("z").send(submitFrame("once"));
    net.schedule.pump(2);
    expect(net.port.client("z").poll()).toHaveLength(1);
    expect(net.port.client("z").poll()).toHaveLength(0);
  });

  it("pump early-exits when idle and reports the slots it advanced", () => {
    const net = createInMemoryTransport();
    expect(net.schedule.pump(10)).toBe(0);
    net.port.hub.send(submitFrame("one"));
    expect(net.schedule.pump(10)).toBe(1); // one productive step, then idle-exit
    expect(net.pending()).toBe(0);
  });

  it("ZERO timers / wall-clock: the full stack runs with setTimeout/setInterval/rAF/Date.now/performance.now spied", () => {
    const raf = (globalThis as Record<string, unknown>).requestAnimationFrame;
    type Spy = { mock: { calls: readonly unknown[] }; mockRestore: () => void };
    const rafSpies: Spy[] =
      typeof raf === "function"
        ? [vi.spyOn(globalThis as unknown as { requestAnimationFrame: (...a: never[]) => number }, "requestAnimationFrame") as unknown as Spy]
        : [];
    const spies: Spy[] = [
      vi.spyOn(globalThis, "setTimeout") as unknown as Spy,
      vi.spyOn(globalThis, "setInterval") as unknown as Spy,
      ...rafSpies,
      vi.spyOn(Date, "now") as unknown as Spy,
      vi.spyOn(performance, "now") as unknown as Spy,
    ];
    try {
      const w = scenarioWithClients();
      expect(w.frames).toBeGreaterThan(0);
    } finally {
      for (const spy of spies) spy.mockRestore();
    }
    const calls = spies.flatMap((spy) => spy.mock.calls);
    expect(calls).toHaveLength(0);
  });
});

/** A miniature real-scenario (hub + two clients through the port) so the
 *  zero-timer spy covers encode/decode/hub/client, not just mailboxes. */
function scenarioWithClients(): { frames: number } {
  const relay = createCoopRelay({ autoCatchUpOnJoin: false });
  const net = createInMemoryTransport({ permutationSeed: 3n });
  const hub = attachRelayHub(relay, net.port, {});
  const a = createTransportClient(net.port, "a");
  const b = createTransportClient(net.port, "b");
  a.join();
  b.join();
  let worked = 0;
  for (let i = 0; i < 40; i += 1) {
    worked += net.schedule.step() ? 1 : 0;
    worked += hub.drain();
    worked += a.drain() + b.drain();
  }
  return { frames: worked };
}
