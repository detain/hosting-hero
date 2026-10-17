/**
 * `tools/host/src/server.ts` — startHost: the localhost dev carrier's door.
 *
 * Topology (b) — portable-lib (MASTER_REPORT §2, MP-topology ruling): the
 * host STAMPS and RELAYS and runs NO SIM. Browser seats hold their local
 * sims and feed them from the relay-stamped log (the client side is lane
 * L-WS-B / apps/proto); a tick here advances the RELAY CLOCK only, never a
 * world.
 *
 * The `setInterval` below lives HERE, legitimately outside every transport
 * law-scan: `tools/transport/test/transportLaw.test.ts` walks
 * `tools/transport/src/` (plus the tools/relay reverse-edge check) and
 * nothing else — verified by reading its scope. The port PUMP LAW (zero
 * self-scheduling) binds the carrier and the hub, not the host process that
 * owns a wall clock; a Workerman carrier owns its timer the same way.
 * `tickMs: 0` runs fully MANUAL — `pump()`/`pumpTo()` are the deterministic
 * seam the conformance tests drive, so no frame law is ever timed.
 *
 * The frame cap is imported, never restated: `MAX_FRAME_BYTES` from
 * transport-tools is the single PROVISIONAL source. The carrier enforces it
 * on the wire (an oversize inbound CLOSES that connection — ws code 1009);
 * the codec's pre-parse check stays as defense-in-depth for carriers with a
 * larger ceiling. Loopback only, no auth (dev prototype — the README spells
 * the exposure rules).
 */

import { once } from "node:events";
import type { AddressInfo } from "node:net";
import { MAX_FRAME_BYTES } from "transport-tools";
import { WebSocketServer } from "ws";
import { createHostRelay } from "./relay.ts";
import type { HostRelay } from "./relay.ts";

export interface StartHostOptions {
  /** TCP port; 0 (default) = ephemeral, the bound port is reported. */
  readonly port?: number;
  /** Bind address; defaults to loopback — keep it that way. */
  readonly host?: string;
  /** Dev tick cadence in ms (default 250). 0 = MANUAL: no interval, the
   *  host drives `pump()`/`pumpTo()` (the deterministic test seam). */
  readonly tickMs?: number;
  /** Hub passthroughs (PROVISIONAL taste rows live upstream; these are the
   *  same optional knobs `attachRelayHub` already parses). */
  readonly pageSize?: number;
  readonly maxPageSize?: number;
  readonly logBudget?: number;
}

export interface HostHandle extends HostRelay {
  /** The actual bound TCP port (meaningful with `port: 0`). */
  readonly boundPort: number;
  /** One deterministic dev tick: advance the relay clock by one, drain the
   *  hub. Returns the number of frames consumed. */
  pump(): number;
  /** Advance the relay clock to `tick` (monotonic — the relay refuses a
   *  rewind) and drain the hub. */
  pumpTo(tick: bigint): void;
  /** Close every client socket, stop the tick, await the server's `close`.
   *  Idempotent; the suite's exit cleanliness rides this. */
  stop(): Promise<void>;
}

export async function startHost(options: StartHostOptions = {}): Promise<HostHandle> {
  const tickMs = options.tickMs ?? 250;
  if (!Number.isSafeInteger(tickMs) || tickMs < 0) {
    throw new RangeError(`host[tickMs]: expected a safe integer >= 0 (0 = manual), got ${String(tickMs)}`);
  }
  const server = new WebSocketServer({
    host: options.host ?? "127.0.0.1",
    port: options.port ?? 0,
    maxPayload: MAX_FRAME_BYTES, // single-source PROVISIONAL cap: carrier-enforced on the wire
  });
  await once(server, "listening");
  const { relay, hub, port } = createHostRelay(server, {
    ...(options.pageSize === undefined ? {} : { pageSize: options.pageSize }),
    ...(options.maxPageSize === undefined ? {} : { maxPageSize: options.maxPageSize }),
    ...(options.logBudget === undefined ? {} : { logBudget: options.logBudget }),
  });

  const timer =
    tickMs === 0
      ? null
      : setInterval(() => {
          relay.advanceTo(relay.tick() + 1n);
          hub.drain();
        }, tickMs);

  let stopped = false;
  return {
    relay,
    hub,
    port,
    boundPort: (server.address() as AddressInfo).port,
    pump(): number {
      relay.advanceTo(relay.tick() + 1n);
      return hub.drain();
    },
    pumpTo(tick: bigint): void {
      relay.advanceTo(tick);
      hub.drain();
    },
    async stop(): Promise<void> {
      if (stopped) return;
      stopped = true;
      if (timer !== null) clearInterval(timer);
      const closed = once(server, "close"); // subscribe BEFORE the verbs that trigger it
      for (const socket of server.clients) socket.close(1001, "host stopped");
      server.close(); // stops listening; 'close' fires once every connection is gone
      await closed;
    },
  };
}
