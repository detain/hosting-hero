/**
 * `coopRoomWire` law tests (lane L-WS-B) — jsdom (the file ends with a mount
 * toggle check). The rig IS the dev carrier without sockets: a REAL
 * createCoopRelay + attachRelayHub (transport's server.ts law, zero mocks of
 * hub semantics) joined to fake browser sockets whose send() lands bytes in
 * the hub's FIFO inbox and whose deliver() is the carrier writing toward the
 * tab. Everything the seven interface truths promise is exercised on the real
 * client law: encode/decode, drain-gating, seat-state ledger, faults.
 *
 * THE ZERO-TIMER LAW IS FILE-WIDE HERE: the trio is spied before every test
 * and asserted untouched after it — construction, pump, submits, mount.
 */
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { attachRelayHub, encodeFrame } from "transport-tools";
import type { TransportFrame, TransportPort } from "transport-tools";
import { createCoopRelay } from "relay-tools";
import type { CoopRelay } from "relay-tools";
import { PlayerVerb } from "@hh/sim-core/types";
import { createCoopRoomWire } from "../coopRoomWire";
import type { CoopRoomWire } from "../coopRoomWire";
import CoopRoom from "../CoopRoom.vue";

class FakeSocket {
  readyState = 0;
  onopen: (() => void) | null = null;
  onmessage: ((event: { readonly data: unknown }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(private readonly toHub: (bytes: string) => void) {}
  open(): void {
    this.readyState = 1;
    this.onopen?.();
  }
  deliver(data: unknown): void {
    this.onmessage?.({ data });
  }
  send(data: string): void {
    if (this.readyState !== 1) throw new Error("InvalidStateError: not open");
    this.toHub(data);
  }
  close(): void {
    /* carrier teardown witness lives in wsClientPort.test — here the socket
     * stays deliverable so dispose() remains observable via handlers=null */
  }
}

function rig(): {
  relay: CoopRelay;
  /** Connect a seat; open (default) mirrors a warm page, {open:false} keeps
   *  the first frames queued in the adapter's CONNECTING outbox. */
  connect(seat: string, opts?: { open?: boolean }): CoopRoomWire;
  socket(seat: string): FakeSocket;
  pumpHub(): number;
} {
  const hubInbox: string[] = [];
  const sockets = new Map<string, FakeSocket>();
  const relay = createCoopRelay({ autoCatchUpOnJoin: false });
  const port: TransportPort = {
    hub: {
      seat: null,
      send(): void {
        throw new RangeError("test rig: nothing posts toward the hub through its own endpoint");
      },
      poll: () => hubInbox.splice(0),
    },
    client: (seat: string) => ({
      seat,
      send: (frame: TransportFrame) => sockets.get(seat)?.deliver(encodeFrame(frame)),
      poll: () => [],
    }),
  };
  const hub = attachRelayHub(relay, port);
  return {
    relay,
    connect(seat, opts = {}) {
      const socket = new FakeSocket((bytes) => void hubInbox.push(bytes));
      sockets.set(seat, socket);
      if (opts.open !== false) socket.open();
      return createCoopRoomWire({ url: "ws://fake.local/room", seat, socketFactory: () => socket });
    },
    socket: (seat) => {
      const found = sockets.get(seat);
      if (found === undefined) throw new RangeError(`test rig: no socket for seat "${seat}"`);
      return found;
    },
    pumpHub: () => hub.drain(),
  };
}

type TimerSpy = ReturnType<typeof vi.spyOn>;
let spies: TimerSpy[];

beforeEach(() => {
  spies = [
    vi.spyOn(globalThis, "setTimeout"),
    vi.spyOn(globalThis, "setInterval"),
    vi.spyOn(globalThis, "requestAnimationFrame"),
  ];
});

afterEach(() => {
  for (const spy of spies) {
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  }
});

describe("coopRoomWire — a playable browser seat over the real hub law", () => {
  it("the first frame binds the route (truth 5); frames before OPEN flush through the outbox", () => {
    const r = rig();
    const alice = r.connect("alice", { open: false }); // handshake still in flight at construction
    expect(r.pumpHub()).toBe(0); // the hub has seen NOTHING — join sits in the CONNECTING outbox
    expect(alice.ledgerRows()).toEqual([]);
    r.socket("alice").open(); // handshake completes → outbox flushes in order
    expect(r.pumpHub()).toBe(2); // join + catchup-request both rode the first bytes out
    expect(r.relay.isSeated("alice")).toBe(true);
    alice.pump(1); // truth 7: the ledger appears ONLY on the pump's drain
    expect(alice.ledgerRows().some((row) => row.participantId === "alice" && row.open)).toBe(true);
  });

  it("a note crosses the wire into the tape — and stays invisible until the local pump drains", () => {
    const r = rig();
    const alice = r.connect("alice");
    const bob = r.connect("bob");
    r.pumpHub();
    alice.pump(1);
    bob.pump(1);
    bob.submitNote("from bob");
    expect(r.pumpHub()).toBe(1); // one submit processed → broadcast + seat-state fan rode straight out to both sockets
    // truth 7 falsifier: the bytes sit in alice's inbound queue — the client has applied NOTHING:
    expect(alice.tapeRows(10)).toEqual([]);
    alice.pump(1);
    bob.pump(1);
    const rows = alice.tapeRows(10);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ kind: "note", participantId: "bob", payloadText: "from bob", seated: true });
    expect(bob.tapeRows(10)[0]?.participantId).toBe("bob"); // the fan reaches the author too — shared log, not inbox
    expect(alice.localDigest()).not.toBeNull(); // the pump ticked the LOCAL sim on the boot seed
  });

  it("a door-shaped action runs through the REAL intent door in the local runner", () => {
    const r = rig();
    const alice = r.connect("alice");
    r.pumpHub();
    alice.submitAction(PlayerVerb.Communicate, { target: null, note: "yo" });
    r.pumpHub();
    expect(alice.runnerTick()).toBe(0n);
    expect(alice.pump(1)).toBe(1);
    expect(alice.runnerTick()).toBe(1n);
    const row = alice.tapeRows(10)[0];
    expect(row?.kind).toBe("action");
    expect(row?.payloadText).toBe("verb=communicate");
    const busy = (alice.runnerState().hands?.tokens ?? []).map((t) => ({
      busyCauseId: t.busyCauseId as string | null,
      busyUntilTick: t.busyUntilTick,
    }));
    expect(busy).toContainEqual({ busyCauseId: "intent:0", busyUntilTick: 2n }); // communicate occupancy = 2 ticks
  });

  it("catchUp pumps the local clock to the newest HUB stamp (pause-with-orders over the wire)", () => {
    const r = rig();
    const alice = r.connect("alice");
    r.relay.advanceTo(5n); // the dev host's clock (in production: the PHP carrier)
    const bob = r.connect("bob");
    r.pumpHub();
    bob.submitNote("late on tick 5");
    r.pumpHub();
    expect(alice.hubTick()).toBeNull(); // not even drained yet — hub truth is invisible until pump (truth 7)
    const stepped = alice.catchUp();
    expect(stepped).toBe(6); // ticks 0..5 inclusive
    expect(alice.runnerTick()).toBe(6n);
    expect(alice.hubTick()).toBe(5n);
    expect(alice.tapeRows(10)[0]).toMatchObject({
      kind: "note",
      participantId: "bob",
      tick: "5",
      payloadText: "late on tick 5",
    });
  });

  it("leave() ends the tenure as witnessed by the SURVIVING seats (L-RH half-open ledger; the carrier never pushes to a departed seat)", () => {
    const r = rig();
    const alice = r.connect("alice");
    const bob = r.connect("bob");
    r.pumpHub();
    alice.pump(1);
    bob.pump(1);
    expect(bob.ledgerRows().find((row) => row.participantId === "alice")?.open).toBe(true);
    r.relay.advanceTo(1n); // a real host ticks; leave lands AFTER join for a non-degenerate [joined,left)
    alice.leave();
    r.pumpHub();
    bob.pump(1);
    expect(bob.ledgerRows().find((holder) => holder.participantId === "alice")).toMatchObject({
      open: false,
      joinedAtTick: "0",
      leftAtTick: "1",
    });
    expect(r.relay.isSeated("alice", 1n)).toBe(false);
    // honest v0 law of the carrier (server.ts sendSeatStates → liveSeats only): the GONE seat
    // keeps its last live view — it left of its own accord, so its stale-open row is truthful.
    alice.pump(1);
    expect(alice.ledgerRows().find((holder) => holder.participantId === "alice")?.open).toBe(true);
  });

  it("an unbuilt verb fails loud at the controller; a forged action shape fails at the relay builder", () => {
    const r = rig();
    const alice = r.connect("alice");
    r.pumpHub();
    expect(() => alice.submitAction("reboot-server" as unknown as PlayerVerb, {})).toThrow(/coop-wire\[unbuilt-action\]/);
    expect(() => alice.submitAction(PlayerVerb.Communicate, { target: null })).toThrow(/relay\[bad-action\]/);
    expect(r.pumpHub()).toBe(0); // nothing left the tab on either failure
  });

  it("CoopRoom mounts in LOCAL mode untouched and toggles to the Wire form without opening a socket", async () => {
    const wrapper = mount(CoopRoom);
    expect(wrapper.find('[data-test="coop-advance"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="coop-wire-connect"]').exists()).toBe(false);
    await wrapper.find('[data-test="coop-mode-wire"]').trigger("click");
    expect(wrapper.find('[data-test="coop-wire-connect"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="coop-advance"]').exists()).toBe(false);
    // disabled until a seat id is typed — the hub routes by it, a blank seat is illegal
    expect(wrapper.find('[data-test="coop-wire-connect"]').attributes("disabled")).toBeDefined();
    await wrapper.find('[data-test="coop-wire-seat"]').setValue("zoe");
    expect(wrapper.find('[data-test="coop-wire-connect"]').attributes("disabled")).toBeUndefined();
    await wrapper.find('[data-test="coop-mode-local"]').trigger("click");
    expect(wrapper.find('[data-test="coop-advance"]').exists()).toBe(true);
  });
});
