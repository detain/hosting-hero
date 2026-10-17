/**
 * `tools/transport/src/port.ts` — the TransportPort CONTRACT (types only).
 *
 * A TransportEndpoint is ONE MAILBOX: `send` posts a frame into it (what the
 * carrier delivers to THIS side), `poll` drains it in delivery order. The
 * client submits through `port.hub.send` and reads its own inbound through
 * `port.client(me)`; the hub drains `port.hub.poll` and answers a seat
 * through `port.client(seat).send`. The hub endpoint's
 * inbound channel is multiplexed (every client's frames share `port.hub`;
 * the participantId inside each frame is the demultiplexer — the v0 posture
 * the in-repo carrier takes; the PHP carrier authenticates per connection
 * instead, out of repo). A client uses `port.client(me)` for what the hub
 * sends IT and `port.hub` to submit; in a real deployment the two handles
 * live in separate processes, which is exactly why NOTHING here may assume
 * shared memory.
 *
 * PUMP LAW (I-T §3): zero self-scheduling, zero timers, zero wall-clock.
 * Time moves ONLY when the host calls step()/pump(). The in-repo carrier
 * (inMemory.ts) is a pure delay model; a Workerman carrier implements the
 * same port over real sockets and the hub/client halves are unchanged —
 * "one protocol, two carriers" (MASTER_REPORT §3).
 */

import type { TransportFrame } from "./envelope.ts";

/** One mailbox end. `seat` is the seat id this mailbox belongs to (null for
 *  the multiplexed hub side). */
export interface TransportEndpoint {
  readonly seat: string | null;
  /** Post a frame into this mailbox (honors the carrier's delay policy). */
  send(frame: TransportFrame): void;
  /** Drain everything delivered to this side, in delivery order, as bytes. */
  poll(): readonly string[];
}

export interface TransportPort {
  /** The hub side: send() → hub inbox, poll() → hub inbox drain. */
  readonly hub: TransportEndpoint;
  /** The channel of one seat (used by BOTH halves: the hub posts toward the
   *  client through it, the client drains its own inbound from it). */
  client(seat: string): TransportEndpoint;
}

/** Deterministic pump handle — the host's clock, never the package's. */
export interface TransportSchedule {
  /** Advance one delivery slot; true when at least one frame landed. */
  step(): boolean;
  /** Advance up to `steps` slots (default 1), stopping early when idle.
   *  Returns the number of slots actually advanced. */
  pump(steps?: number): number;
}

/** In-memory carrier tuning (all knobs deterministic):
 *  - `delayByKind`: slots a frame of that kind spends in flight (default 1).
 *  - `permutationSeed`: when set, each step's DUE batch toward every CLIENT
 *    channel is Fisher-Yates shuffled from `streamFor(seed,
 *    "transport/delivery", step)`. Hub inbound stays FIFO ON PURPOSE: the
 *    SERVER CONTRACT says carrier arrival order selects the acceptance tick
 *    and the HUB stamps (R1) — shuffling the hub's inbox would be inventing
 *    a different acceptance order, not delivering the same one hostilely.
 *  - `duplicateFrameIds`: send-ids (see InMemoryTransport.trace) replayed a
 *    SECOND time on their due step — the at-least-once leg the client
 *    idempotence law absorbs.
 *  - `dropUntilResume`: seats whose CLIENT-side channel starts suspended;
 *    frames toward them drop (counted) until resumeSeat(seat). This is the
 *    carrier's loss/freeze simulation the reconnect story rides through. */
export interface DeliveryPolicy {
  readonly delayByKind?: Readonly<Partial<Record<string, number>>>;
  readonly permutationSeed?: bigint;
  readonly duplicateFrameIds?: readonly number[];
  readonly dropUntilResume?: readonly string[];
}
