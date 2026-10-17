/**
 * `wsClientPort` law tests (lane L-WS-B) — node env, scripted fake socket.
 * The fake IS the carrier's word: readyState moves only when the test moves
 * it, and every assertion below pins one of the seven interface truths the
 * adapter exists to honor (see file header docblock for the mapping).
 */
import { describe, expect, it } from "vitest";
import { encodeFrame } from "transport-tools";
import type { TransportFrame } from "transport-tools";
import { createWsClientPort } from "../wsClientPort";
import type { WsClientSocket } from "../wsClientPort";

class FakeSocket implements WsClientSocket {
  readyState = 0; // CONNECTING, exactly like a real browser construction
  readonly sent: string[] = [];
  closeCalls: Array<{ code: number | undefined; reason: string | undefined }> = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { readonly data: unknown }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;

  open(): void {
    this.readyState = 1;
    this.onopen?.();
  }
  /** Carrier writes toward the browser. */
  deliver(data: unknown): void {
    this.onmessage?.({ data });
  }
  carrierDies(): void {
    this.readyState = 3;
    this.onclose?.();
  }
  send(data: string): void {
    if (this.readyState !== 1) throw new Error("InvalidStateError: not open");
    this.sent.push(data);
  }
  close(code?: number, reason?: string): void {
    this.closeCalls.push({ code, reason });
  }
}

const joinFrame = (seat: string): TransportFrame => ({
  protocol: "hh-coop-transport",
  version: 1,
  kind: "join",
  participantId: seat,
});

const seatStateToward = (seat: string): TransportFrame => ({
  protocol: "hh-coop-transport",
  version: 1,
  kind: "seat-state",
  sentAtTick: "0",
  lastStamp: null,
  ledger: { seatHolders: [{ participantId: seat, joinedAtTick: "0" }] },
});

function rig(seat = "alice"): { port: ReturnType<typeof createWsClientPort>; socket: FakeSocket } {
  const socket = new FakeSocket();
  const port = createWsClientPort("ws://fake/1", seat, () => socket);
  return { port, socket };
}

describe("wsClientPort — the seven truths, one fake socket", () => {
  it("truth 1: hub.send encodes at the send site — byte twin of encodeFrame", () => {
    const { port, socket } = rig();
    socket.open();
    const frame = joinFrame("alice");
    port.hub.send(frame);
    expect(socket.sent).toEqual([encodeFrame(frame)]);
  });

  it("truths 3+2: inbound arrival order survives client(me).poll() verbatim as raw bytes", () => {
    const { port, socket } = rig();
    const a = encodeFrame(seatStateToward("alice"));
    const b = "not-a-frame-but-raw-bytes-still-trusted-to-the-decoder"; // poll returns BYTES; decode law is not ours
    socket.deliver(a);
    socket.deliver(b);
    socket.deliver(42); // non-text anomaly (v0 text-frame law): invisible, no throw
    const mine = port.client("alice");
    expect(mine.poll()).toEqual([a, b]);
    expect(mine.poll()).toEqual([]); // splice: a drained mailbox stays drained
    expect(port.hub.poll()).toEqual([]); // truth 3 flip: the client never drains the hub
    expect(port.client("bob").poll()).toEqual([]); // single-seat-per-browser v0
    expect(port.client("bob").send(seatStateToward("bob"))).toBeUndefined(); // posting toward others: silent, hostHarness law
    expect(mine.poll()).toEqual([]); // bob's send did not leak into alice's queue
  });

  it("outbox law: frames sent while CONNECTING queue and flush on open, in order", () => {
    const { port, socket } = rig();
    const first = joinFrame("alice");
    const second = { ...first, kind: "submit", recordKind: "note", payload: { text: "early" } } as TransportFrame;
    port.hub.send(first);
    port.hub.send(second);
    expect(socket.sent).toEqual([]); // construction-time send would have thrown InvalidStateError — it did not
    socket.open();
    expect(socket.sent).toEqual([encodeFrame(first), encodeFrame(second)]);
    expect(port.droppedSends()).toBe(0);
  });

  it("truth 6: dead carrier is counted, never thrown — CLOSED sends drop and queued outboxes settle as loss", () => {
    const { port, socket } = rig();
    const queued = joinFrame("alice");
    port.hub.send(queued); // CONNECTING → outbox
    socket.carrierDies(); // handshake never made it
    expect(port.droppedSends()).toBe(1); // the outbox settled as carrier loss
    expect(() => port.hub.send(joinFrame("alice"))).not.toThrow(); // CLOSING/CLOSED path
    expect(port.droppedSends()).toBe(2);
    socket.open(); // a resurrected fake must not flush a dead session
    expect(socket.sent).toEqual([]);
  });

  it("client(me).send loopbacks land in the same inbound FIFO; close() tears handlers and counts nothing", () => {
    const { port, socket } = rig();
    socket.open();
    const frame = seatStateToward("alice");
    port.client("alice").send(frame);
    expect(port.client("alice").poll()).toEqual([encodeFrame(frame)]);
    port.close();
    expect(socket.closeCalls).toEqual([{ code: 1000, reason: "seat leaving" }]);
    expect(socket.onopen).toBeNull();
    expect(socket.onmessage).toBeNull();
    expect(socket.onclose).toBeNull();
    expect(socket.onerror).toBeNull();
  });

  it("fail-loud guard: an empty seat name is illegal at construction — the hub routes by it", () => {
    const socket = new FakeSocket();
    expect(() => createWsClientPort("ws://fake/2", "", () => socket)).toThrow(/ws-client-port\[empty-seat\]/);
  });
});
