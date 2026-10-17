/**
 * `apps/proto/src/transport/wsClientPort.ts` — the BROWSER half of the
 * TransportPort over a real WebSocket: the client end of the hh-coop-transport@1
 * dev wire (lane L-WS-B, ADR-0017; mirror twin of tools/host's host-side
 * `wsHubPort.ts` @af55b61 and its loopback client shape in test/hostHarness.ts).
 *
 * The resolved port.ts contract (authority — the transport README prose sketch
 * is WRONG on these points, corrected by the L-HOST lane):
 *  1. `send(frame: TransportFrame)` takes a FRAME OBJECT — the encode happens
 *     at the send site (`socket.send(encodeFrame(frame))`), never upstream;
 *  2. `poll(): readonly string[]` returns RAW JSON byte-strings — decoding is
 *     the TransportClient's law (client.ts handleFrame/decodeFrame), not ours;
 *  3. all inbound rides ONE socket: every hub→seat frame (broadcast /
 *     catchup-page / seat-state / fault) arrives on THIS connection, so the
 *     onmessage handler pushes bytes into one inboundQueue and
 *     `client(me).poll()` splices it — the carrier-order FIFO mirror of the
 *     hub-side `client(seat).poll()`-empty-by-contract law;
 *  4. oversize frames are the CARRIER's verdict (the dev hub closes 1009 at
 *     MAX_FRAME_BYTES; the codec's cap behind it is defense-in-depth) — this
 *     adapter enforces nothing and recovers nothing;
 *  5. the hub learns seat→socket routing from the participantId ON OUR FRAMES
 *     — the controller's join (first frame out) binds this socket; nothing
 *     here routes;
 *  6. sends on a not-open socket are carrier loss: swallow-with-counter,
 *     NEVER throw into the caller (the wsHubPort.ts `droppedSends` twin);
 *  7. the client applies inbound ONLY on `drain()` — this module owns ZERO
 *     timers and ZERO scheduling. The pump cadence belongs to the caller
 *     (coopRoomWire.ts, user-gated).
 *
 * Outbox law: a browser WebSocket is CONNECTING when constructed; `send()`
 * would throw InvalidStateError, so frames while CONNECTING queue (already
 * encoded, order preserved) and flush on open — if the handshake dies, the
 * queued frames join the drop counter (truth 6 counts what the carrier lost).
 * A CLOSING/CLOSED socket drops counted, immediately.
 *
 * App-thread only: nothing under src/worker may import this file — the real
 * `new WebSocket(` lives here and must never enter the sim worker bundle
 * (build law pinned by lane test: worker chunks stay WebSocket-free).
 */
import { encodeFrame } from "transport-tools";
import type { TransportEndpoint, TransportFrame, TransportPort } from "transport-tools";

/** Numeric readyState literals (erasable-syntax law, verbatim from
 *  tools/host/src/wsHubPort.ts:41 — no value import of the class for a const). */
const WS_CONNECTING = 0;
const WS_OPEN = 1;
/** Normal-closure code, RFC 6455 — the seat is leaving, not the carrier dying. */
const WS_NORMAL_CLOSURE = 1000;

/** The socket members this adapter touches, structurally — the browser
 *  WebSocket satisfies it, and the test fake implements the same shape. */
export interface WsClientSocket {
  readonly readyState: number;
  send(data: string): void;
  close(code?: number, reason?: string): void;
  onopen: (() => void) | null;
  onmessage: ((event: { readonly data: unknown }) => void) | null;
  onclose: (() => void) | null;
  onerror: (() => void) | null;
}

export type WsSocketFactory = (url: string) => WsClientSocket;

function browserSocket(url: string): WsClientSocket {
  // The DOM WebSocket narrowed to exactly what the adapter uses; the cast is
  // the documented view-tightening, not a lie about the runtime shape.
  return new WebSocket(url) as unknown as WsClientSocket;
}

export interface WsClientPort extends TransportPort {
  /** True while the socket is OPEN (the carrier's word, not our wish). */
  isOpen(): boolean;
  /** Outbound frames the carrier could not take (truth 6's counter). */
  droppedSends(): number;
  /** Inbound frames still waiting to be drained by the client law. */
  queued(): number;
  /** Unmount teardown: detach every handler, close normally. Idempotent. */
  close(): void;
}

export function createWsClientPort(
  url: string,
  participantId: string,
  socketFactory: WsSocketFactory = browserSocket,
): WsClientPort {
  if (participantId.length === 0) {
    throw new RangeError("ws-client-port[empty-seat]: participantId must be a non-empty string — the hub routes by it");
  }
  const inbound: string[] = [];
  const outbox: string[] = [];
  const drainedEmpty: readonly string[] = Object.freeze([]);
  const socket: WsClientSocket = socketFactory(url);
  let carrierDrops = 0;

  function flushOutbox(): void {
    while (outbox.length > 0 && socket.readyState === WS_OPEN) {
      const bytes = outbox.shift() as string;
      try {
        socket.send(bytes);
      } catch {
        carrierDrops += 1; // raced out of OPEN between check and write — counted loss
      }
    }
  }

  socket.onopen = () => {
    flushOutbox();
  };
  socket.onmessage = (event) => {
    if (typeof event.data !== "string") return; // text-frame carrier law (v0): the hub writes strings; a binary anomaly is not a frame
    inbound.push(event.data); // raw bytes, arrival order — decode is the client's law (truth 2)
  };
  socket.onclose = () => {
    carrierDrops += outbox.length; // the carrier died with our queue — count the loss, never replay a dead session
    outbox.length = 0;
  };
  socket.onerror = () => {
    /* carrier loss is silent; the close event follows and owns the accounting */
  };

  const hub: TransportEndpoint = {
    seat: null,
    send(frame: TransportFrame): void {
      const bytes = encodeFrame(frame); // encode at the send site (truth 1)
      if (socket.readyState === WS_OPEN) {
        try {
          socket.send(bytes);
        } catch {
          carrierDrops += 1;
        }
        return;
      }
      if (socket.readyState === WS_CONNECTING) {
        outbox.push(bytes); // flush on open, counted on close (outbox law)
        return;
      }
      carrierDrops += 1; // CLOSING/CLOSED: swallow-with-counter, never throw (truth 6)
    },
    /** A client never drains the hub's multiplexed mailbox (truth 3's flip). */
    poll(): readonly string[] {
      return drainedEmpty;
    },
  };

  function client(seat: string): TransportEndpoint {
    return {
      seat,
      send(frame: TransportFrame): void {
        if (seat !== participantId) return; // the hub posts toward OTHER seats host-side; a browser client never does — silent loss, hostHarness law
        inbound.push(encodeFrame(frame)); // local loopback (mailbox law mirror)
      },
      poll(): readonly string[] {
        if (seat !== participantId) return drainedEmpty; // single-seat-per-browser v0
        return inbound.splice(0); // splice: drain leaves the queue empty (delivery-order FIFO)
      },
    };
  }

  return {
    hub,
    client,
    isOpen: () => socket.readyState === WS_OPEN,
    droppedSends: () => carrierDrops,
    queued: () => inbound.length,
    close(): void {
      socket.onopen = null;
      socket.onmessage = null;
      socket.onclose = null;
      socket.onerror = null;
      try {
        socket.close(WS_NORMAL_CLOSURE, "seat leaving");
      } catch {
        /* already gone — teardown is unconditional */
      }
    },
  };
}
