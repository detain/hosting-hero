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
 *    seat's socket. The seat→socket map is LEARNED by peeking the
 *    `participantId` (identity) and `kind` (carrier bookkeeping for the
 *    auto-leave law below) on inbound frames: decode-just-to-route is the
 *    documented carrier duty, so the peek reads those two top-level
 *    discriminant fields and nothing else — no payload touching, and the
 *    hub's own codec remains the sole parse authority (undecodable bytes
 *    still ride into `hubInbox` so `attachRelayHub` can fault them);
 *  - send-to-unknown-or-closed seat = CARRIER LOSS: counted, never thrown
 *    (the inMemory carrier's drop semantics — `stats().dropped`).
 *
 * Last-claim routing: if two sockets claim one participantId, the newest
 * inbound frame's socket owns the mailbox. Token auth below is a gate on the
 * CONNECTION, not an identity binding — seat-name ownership ("who may hold
 * seat alice") stays the PHP/Workerman room layer's deferred rung
 * (tools/transport README); this is a localhost dev carrier and invents none.
 *
 * AUTO-LEAVE ON DISCONNECT (lane L-AUTH; default ON, knob
 * `autoLeaveOnDisconnect: false` restores the v0 open-forever posture):
 * a socket that dies without a `leave` frame left its tenure OPEN in the
 * ledger forever — poisoning re-join (the coopRoomWire honest gap, v0 bug).
 * The cure speaks the carrier's ONLY authority channel: it queues a `leave`
 * FRAME into the hub inbox (`hub.send` — the documented seam whose bytes are
 * indistinguishable from a socket delivering them; handleLeave already
 * stamps it through the SAME relay.leaveSeat path, and the hub already
 * authors frames it never received, the fault kind). Gated by three carrier-
 * local facts, no law invented:
 *   - LAST-CLAIM: only pids whose route still points at THIS socket
 *     (a newer claimant owns the seat — the live seat is never vacated);
 *   - JOIN-VISIBLE: this socket delivered that pid's `join` (a silent or
 *     ghost-submitting socket holds no tenure claim to cancel — and a
 *     never-joined socket close stays zero-frames-zero-faults);
 *   - SUPPRESSION: this socket already delivered that pid's own `leave`
 *     (double vacate would be a ledger refusal — exactly one vacate rides).
 * FIFO ⇒ submits already queued in the inbox stamp BEFORE the synthesized
 * leave (pinned in test). TICK LAW (disclosed, not hidden): the ledger
 * requires `leftAtTick > joinedAtTick` (save/coop strict-after), so a leave
 * drained WITHOUT a clock advance after its join is a named ledger refusal —
 * the host's advance-then-drain ritual (`pump()`/`pumpTo()`, the interval,
 * and simLoop.step()) guarantees the synthesized leave always stamps at a
 * tick > the join's. A host that raw-drains twice between advances rides the
 * same pre-existing law an explicit wire leave rides.
 * `shutdown()` (host stop) ceases synthesis: a carrier being torn down
 * leaves nobody to answer.
 *
 * OPT-IN TOKEN AUTH (`authorize`, default absent = the standing localhost-
 * no-auth posture byte-for-byte): checked on the HTTP-upgrade request URL
 * inside the connection handler BEFORE any listener attaches, so the hub
 * never sees unauthenticated bytes; refusal closes 1008 "policy violation"
 * (ws sends server-close codes verbatim — the same channel the 1009 oversize
 * and 1001 stopped closes already prove).
 *
 * `client(seat).poll()` returns empty BY CONTRACT here: the host never
 * drains a seat mailbox — the browser half (lane L-WS-B) drains its own
 * socket. On the client side of the wire the same `TransportPort` shape is
 * implemented with the inbound queue flipped; see test/hostHarness.ts for
 * the loopback twin with the exact resolved shapes.
 */

import { encodeFrame, TRANSPORT_PROTOCOL, TRANSPORT_PROTOCOL_VERSION } from "transport-tools";
import type { TransportEndpoint, TransportFrame, TransportPort } from "transport-tools";
import type { IncomingMessage } from "node:http";
import type { RawData, WebSocket, WebSocketServer } from "ws";
import type { AuthFailureReason } from "./auth.ts";

/** WebSocket.OPEN readyState — numeric literal kept (erasable-syntax law:
 *  no value import of the WebSocket class just for one constant). */
const WS_OPEN = 1;

/** RFC 6455 Policy Violation — the ws-side verdict for a failed gate. */
const WS_POLICY_VIOLATION = 1008;

const HEAD = { protocol: TRANSPORT_PROTOCOL, version: TRANSPORT_PROTOCOL_VERSION } as const;

export interface WsHubPortOptions {
  /** Synthesize a `leave` frame for every open-tenure route a dying socket
   *  still holds (see header AUTO-LEAVE). Default TRUE; FALSE restores the
   *  v0 open-forever posture exactly. */
  readonly autoLeaveOnDisconnect?: boolean;
  /** Closed verdict on the request URL; `null` accepts. Absent = open door
   *  (the standing localhost-no-auth ruling). */
  readonly authorize?: (requestUrl: string) => AuthFailureReason | null;
}

export interface WsHubPort extends TransportPort {
  /** Frames the carrier could not route (unknown seat or closed/closing
   *  socket) — the observable drop counter, never a throw. */
  dropped(): number;
  /** Bytes currently waiting in the multiplexed hub inbox (dev observability;
   *  the settle helper in tests uses it to detect quiescence). */
  queued(): number;
  /** Learned seat→socket routes (dev observability, not law). */
  routes(): number;
  /** Connections the `authorize` gate refused (dev observability — the
   *  counter that proves the gate actually fires). */
  rejectedSockets(): number;
  /** Host teardown: cease leave-synthesis and forget routes. Idempotent;
   *  a shutting-down carrier leaves nobody to answer a vacate. */
  shutdown(): void;
}

/** Per-socket carrier bookkeeping for the auto-leave gates (the SAME peeked
 *  `kind` discriminant, no deeper interpretation — sets, not counters: the
 *  laws below ask "did this socket ever join/leave pid", never how often). */
interface SocketSeatFlags {
  readonly joined: Set<string>;
  readonly left: Set<string>;
}

/** `ws` hands the message payload as Buffer | ArrayBuffer | Buffer[]; the
 *  carrier forwards TEXT bytes to the hub inbox untouched in content — only
 *  in representation (utf8 decode; the codec does the real parsing). */
function toText(data: RawData): string {
  if (Array.isArray(data)) return Buffer.concat(data).toString("utf8");
  if (data instanceof ArrayBuffer) return Buffer.from(new Uint8Array(data)).toString("utf8");
  return data.toString("utf8");
}

export function createWsHubPort(server: WebSocketServer, options: WsHubPortOptions = {}): WsHubPort {
  const autoLeave = options.autoLeaveOnDisconnect ?? true;
  const authorize = options.authorize;
  const hubInbox: string[] = [];
  const routes = new Map<string, WebSocket>();
  const seatFlags = new Map<WebSocket, SocketSeatFlags>();
  const drained: readonly string[] = Object.freeze([]);
  let droppedSends = 0;
  let rejected = 0;
  let synthesizing = true; // shutdown() trips it; close handlers read it live

  const flagsOf = (socket: WebSocket): SocketSeatFlags => {
    let flags = seatFlags.get(socket);
    if (flags === undefined) {
      flags = { joined: new Set(), left: new Set() };
      seatFlags.set(socket, flags);
    }
    return flags;
  };

  /** The routing peek — read `participantId` + `kind`, learn the route and
   *  the carrier-local join/leave flags, stop there. */
  function learnRoute(socket: WebSocket, raw: string): void {
    let peeked: unknown;
    try {
      peeked = JSON.parse(raw);
    } catch {
      return; // undecodable: nothing to route BY; the hub's codec owns the verdict
    }
    if (typeof peeked !== "object" || peeked === null || Array.isArray(peeked)) return;
    const entry = peeked as Record<string, unknown>;
    const pid = entry["participantId"];
    if (typeof pid !== "string" || pid.length === 0) return;
    routes.set(pid, socket);
    const kind = entry["kind"];
    const flags = flagsOf(socket);
    if (kind === "join") flags.joined.add(pid);
    else if (kind === "leave") flags.left.add(pid);
  }

  server.on("connection", (socket: WebSocket, request: IncomingMessage) => {
    if (authorize !== undefined) {
      const verdict = authorize(request.url ?? "");
      if (verdict !== null) {
        rejected += 1;
        // BEFORE route learning: no message listener is ever attached, so
        // not one unauthenticated byte can reach the hub inbox.
        socket.close(WS_POLICY_VIOLATION, "policy violation");
        return;
      }
    }
    socket.on("message", (data: RawData) => {
      const raw = toText(data);
      hubInbox.push(raw); // arrival order = the acceptance order the hub stamps
      learnRoute(socket, raw);
    });
    socket.on("close", () => {
      const flags = seatFlags.get(socket);
      seatFlags.delete(socket);
      for (const [seat, ws] of routes) {
        if (ws !== socket) continue; // last-claim: a newer socket owns this mailbox
        routes.delete(seat);
        if (!autoLeave || !synthesizing || flags === undefined) continue;
        if (!flags.joined.has(seat) || flags.left.has(seat)) continue;
        // The leave FRAME is the authority channel — handleLeave stamps it
        // through the same relay.leaveSeat path a client-authored leave does.
        hubInbox.push(encodeFrame({ ...HEAD, kind: "leave", participantId: seat }));
      }
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
     *  this mailbox; real traffic arrives through the connection handler —
     *  AND the auto-leave synthesis above (the carrier authors leave bytes
     *  here the same way the hub authors fault bytes: on the frame channel). */
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
    rejectedSockets: () => rejected,
    shutdown(): void {
      synthesizing = false;
      routes.clear();
      seatFlags.clear();
    },
  };
}
