/**
 * `tools/host/src/wsHubPort.ts` — the hub-side TransportPort over a real `ws`
 * WebSocketServer: the localhost DEV carrier for hh-coop-transport@1.
 *
 * Carrier duties ONLY — every law stays upstream, zero duplication here:
 *  - every inbound frame from every connection pushes into ONE FIFO
 *    `hubInbox` in CARRIER ARRIVAL ORDER (the acceptance-tick law: arrival
 *    order selects, the hub stamps — R1, tools/relay owns the stamping);
 *  - `hub.poll()` drains that FIFO as RAW JSON byte-strings and `send`
 *    takes a frame OBJECT — the port.ts interface is the authority (the
 *    README PASSAGE prose says "encodeFrame then cross a port"; the actual
 *    contract is `send(frame: TransportFrame): void` / `poll(): readonly
 *    string[]`, and this adapter matches port.ts verbatim);
 *  - `client(seat).send(frame)` serializes through `encodeFrame` (key
 *    order by construction — byte-stable on the wire) and routes to the
 *    seat's socket. The seat→socket map is LEARNED by peeking
 *    `participantId` on inbound frames: decode-just-to-route is the
 *    documented carrier duty, so the peek reads that one field and nothing
 *    else — no TransportFrame interpretation, no payload touching, and the
 *    hub's own codec remains the sole parse authority (undecodable bytes
 *    still ride into `hubInbox` so `attachRelayHub` can fault them);
 *  - send-to-unknown-or-closed seat = CARRIER LOSS: counted, never thrown
 *    (the inMemory carrier's drop semantics — `stats().dropped`).
 *
 * Last-claim routing: if two sockets claim one participantId, the newest
 * inbound frame's socket owns the mailbox. Auth ("who may hold seat alice")
 * is the PHP/Workerman room layer's deferred rung (tools/transport README);
 * this is a localhost dev carrier and invents none.
 *
 * `client(seat).poll()` returns empty BY CONTRACT here: the host never
 * drains a seat mailbox — the browser half (lane L-WS-B) drains its own
 * socket. On the client side of the wire the same `TransportPort` shape is
 * implemented with the inbound queue flipped; see test/hostHarness.ts for
 * the loopback twin with the exact resolved shapes.
 */

import { encodeFrame } from "transport-tools";
import type { TransportEndpoint, TransportFrame, TransportPort } from "transport-tools";
import type { RawData, WebSocket, WebSocketServer } from "ws";

/** WebSocket.OPEN readyState — numeric literal kept (erasable-syntax law:
 *  no value import of the WebSocket class just for one constant). */
const WS_OPEN = 1;

export interface WsHubPort extends TransportPort {
  /** Frames the carrier could not route (unknown seat or closed/closing
   *  socket) — the observable drop counter, never a throw. */
  dropped(): number;
  /** Bytes currently waiting in the multiplexed hub inbox (dev observability;
   *  the settle helper in tests uses it to detect quiescence). */
  queued(): number;
  /** Learned seat→socket routes (dev observability, not law). */
  routes(): number;
}

/** `ws` hands the message payload as Buffer | ArrayBuffer | Buffer[]; the
 *  carrier forwards TEXT bytes to the hub inbox untouched in content — only
 *  in representation (utf8 decode; the codec does the real parsing). */
function toText(data: RawData): string {
  if (Array.isArray(data)) return Buffer.concat(data).toString("utf8");
  if (data instanceof ArrayBuffer) return Buffer.from(new Uint8Array(data)).toString("utf8");
  return data.toString("utf8");
}

export function createWsHubPort(server: WebSocketServer): WsHubPort {
  const hubInbox: string[] = [];
  const routes = new Map<string, WebSocket>();
  const drained: readonly string[] = Object.freeze([]);
  let droppedSends = 0;

  /** The routing peek — read `participantId`, learn the route, stop there. */
  function learnRoute(socket: WebSocket, raw: string): void {
    let peeked: unknown;
    try {
      peeked = JSON.parse(raw);
    } catch {
      return; // undecodable: nothing to route BY; the hub's codec owns the verdict
    }
    if (typeof peeked !== "object" || peeked === null || Array.isArray(peeked)) return;
    const pid = (peeked as Record<string, unknown>)["participantId"];
    if (typeof pid === "string" && pid.length > 0) routes.set(pid, socket);
  }

  server.on("connection", (socket: WebSocket) => {
    socket.on("message", (data: RawData) => {
      const raw = toText(data);
      hubInbox.push(raw); // arrival order = the acceptance order the hub stamps
      learnRoute(socket, raw);
    });
    socket.on("close", () => {
      for (const [seat, ws] of routes) if (ws === socket) routes.delete(seat);
    });
    socket.on("error", () => {
      /* carrier loss is silent; the close handler prunes the routes */
    });
  });

  const hub: TransportEndpoint = {
    seat: null,
    /** Host-local submit seam: posting toward the hub behaves EXACTLY like a
     *  socket delivering those bytes (encodeFrame gives the same
     *  key-order-by-construction bytes). attachRelayHub itself only drains
     *  this mailbox; real traffic arrives through the connection handler. */
    send(frame: TransportFrame): void {
      hubInbox.push(encodeFrame(frame));
    },
    poll(): readonly string[] {
      const out = hubInbox.slice();
      hubInbox.length = 0;
      return out;
    },
  };

  function client(seat: string): TransportEndpoint {
    return {
      seat,
      send(frame: TransportFrame): void {
        const socket = routes.get(seat);
        if (socket === undefined || socket.readyState !== WS_OPEN) {
          droppedSends += 1; // unknown/frozen seat: counted loss, law 5's fan-out is upstream's call
          return;
        }
        try {
          socket.send(encodeFrame(frame));
        } catch {
          droppedSends += 1; // socket raced into a non-writable state between check and write
        }
      },
      /** The host never reads a seat's mailbox — the browser half drains its
       *  own socket (see header; the loopback client twin lives in tests). */
      poll(): readonly string[] {
        return drained;
      },
    };
  }

  return {
    hub,
    client,
    dropped: () => droppedSends,
    queued: () => hubInbox.length,
    routes: () => routes.size,
  };
}
