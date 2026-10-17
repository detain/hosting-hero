/**
 * `test/hostHarness.ts` — shared loopback plumbing (NOT a test file; the
 * vitest include pattern only matches *.test.ts).
 *
 * The CLIENT-side port shape lives here verbatim — lane L-WS-B (browser
 * WebSocketTransport) should mirror it exactly:
 *  - `hub.send(frame)`  → `encodeFrame(frame)` bytes onto the socket (the
 *    port takes a frame OBJECT — port.ts is authority, not the README
 *    prose); `hub.poll()` → empty (a client never drains the hub mailbox);
 *  - `client(me).poll()` → this socket's inbound raw byte-strings in
 *    arrival order; `client(me).send(frame)` → local loopback into the same
 *    queue (mailbox law mirror); other seats: loss, counted nowhere (the
 *    client half never posts toward other seats — the hub does, host-side);
 *  - seat identity demultiplexing is trivial here: one socket = one seat.
 *
 * Delivery is verified through awaited socket callbacks + explicit hub
 * drains — the settle() loop awaits macrotasks so the real 'message' events
 * fire; nothing here guesses arrival with fixed sleeps per assertion.
 */

import { once } from "node:events";
import { createTransportClient, encodeFrame } from "transport-tools";
import type { TransportClient, TransportPort } from "transport-tools";
import type { RawData, WebSocket } from "ws";
import { WebSocket as WsClass } from "ws";
import { startHost } from "../src/server.ts";
import type { HostHandle, StartHostOptions } from "../src/server.ts";

export type { HostHandle, StartHostOptions };

export interface TestSeat {
  readonly id: string;
  readonly socket: WebSocket;
  readonly client: TransportClient;
  /** Every raw frame this side RECEIVED over the real socket, in arrival
   *  order — the wire snoop a carrier-swap test reads (dup re-sends). */
  readonly wire: readonly string[];
}

function toText(data: RawData): string {
  if (Array.isArray(data)) return Buffer.concat(data).toString("utf8");
  if (data instanceof ArrayBuffer) return Buffer.from(new Uint8Array(data)).toString("utf8");
  return data.toString("utf8");
}

export async function startTestHost(options: StartHostOptions = {}): Promise<HostHandle> {
  // MANUAL tick by default: tests advance the relay clock explicitly; the
  // auto-interval leg rides its own test with an explicit tickMs.
  return startHost({ tickMs: 0, ...options });
}

export function hostUrl(handle: HostHandle): string {
  return `ws://127.0.0.1:${handle.boundPort}`;
}

export async function openSeat(handle: HostHandle, id: string): Promise<TestSeat> {
  const socket = new WsClass(hostUrl(handle));
  await once(socket, "open");
  const inbound: string[] = [];
  const wire: string[] = [];
  socket.on("message", (data: RawData) => {
    const raw = toText(data);
    inbound.push(raw);
    wire.push(raw);
  });
  const port: TransportPort = {
    hub: {
      seat: null,
      send(frame) {
        socket.send(encodeFrame(frame));
      },
      poll: () => [],
    },
    client(seat: string) {
      return {
        seat,
        send(frame) {
          if (seat === id) inbound.push(encodeFrame(frame)); // local loopback (mailbox law mirror)
        },
        poll(): readonly string[] {
          const out = inbound.slice();
          inbound.length = 0;
          return out;
        },
      };
    },
  };
  return { id, socket, client: createTransportClient(port, id), wire };
}

/** Await real socket deliveries, let the hub process, let replies arrive,
 *  drain every seat — loop until a whole round moves zero frames. Throws on
 *  a livelock (a hang is a red test, not a wait). */
export async function settle(handle: HostHandle, ...seats: TestSeat[]): Promise<void> {
  for (let round = 0; round < 32; round += 1) {
    await macrotask();
    await macrotask();
    const hubFrames = handle.hub.drain();
    await macrotask();
    await macrotask();
    let seatFrames = 0;
    for (const seat of seats) seatFrames += seat.client.drain();
    if (hubFrames === 0 && seatFrames === 0 && handle.port.queued() === 0) return;
  }
  throw new Error("host harness: channel never quiesced (livelock?)");
}

export function macrotask(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/** Poll-until for the auto-interval legs ONLY (the host timer there is the
 *  subject under test, not a delivery crutch). `pump` mirrors the seat-side
 *  duty a real browser app discharges on its own frame loop: the transport
 *  client processes inbound only when drained (client law: zero timers), so
 *  an interval-delivered frame becomes visible only after a drain. */
export async function waitUntil(
  condition: () => boolean,
  pump?: () => void,
  timeoutMs = 2_000,
): Promise<void> {
  const started = Date.now();
  pump?.();
  while (!condition()) {
    if (Date.now() - started > timeoutMs) throw new Error("host harness: waitUntil timed out");
    await new Promise((resolve) => setTimeout(resolve, 5));
    pump?.();
  }
}

export async function closeSeat(seat: TestSeat): Promise<void> {
  if (seat.socket.readyState === 1 /* OPEN */ || seat.socket.readyState === 2 /* CLOSING */) {
    const closed = once(seat.socket, "close");
    seat.socket.close(1000, "test done");
    await closed;
  }
}
