/**
 * `tools/host/src/server.ts` — startHost: the localhost dev carrier's door.
 *
 * TWO topologies, one file, side by side (I-TA, wave-23 ruling 3b):
 *
 *  - (b) RELAY-ONLY — the shipped default (@96bd238): portable-lib. Browser
 *    seats hold their local sims and feed them from the relay-stamped log;
 *    a tick here advances the RELAY CLOCK only, never a world. The two
 *    existing-browser demo depends on this posture and stays unbroken.
 *  - (a) HOST-SIM — pass `sim: {...}` and the host owns the engine
 *    (simLoop.ts): the door has exactly one feeder, projections are fogged
 *    per seat host-side, and `hub.publish()` fans fresh seat-state riders on
 *    the host's clock.
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
import type { AttachRelayHubOptions } from "transport-tools";
import { WebSocketServer } from "ws";
import { createHostRelay } from "./relay.ts";
import type { HostRelay } from "./relay.ts";
import { createHostSim } from "./simLoop.ts";
import type { HostSimHandle, HostSimOptions, HostStepReport } from "./simLoop.ts";

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
  /** TOPOLOGY (a) — host-sim-authoritative (I-TA variant (a), wave-23 ruling
   *  3b): when set, the host OWNS the engine (simLoop.ts): every tick steps
   *  the relay clock, drains + stamps client intents through the ONE door
   *  (the host is the only door feeder), advances the driver, derives the
   *  observed merge, and `hub.publish()`-fans fresh per-seat fogged
   *  projections. UNSET (default) keeps topology (b): the relay-only dev
   *  carrier both-browser local-sim demo shipped @96bd238 — BOTH topologies
   *  can run side by side on different ports. */
  readonly sim?: HostSimOptions;
}

export interface HostHandle extends HostRelay {
  /** The actual bound TCP port (meaningful with `port: 0`). */
  readonly boundPort: number;
  /** The host-owned sim when topology (a) is engaged; null in relay-only
   *  mode (b). */
  readonly sim: HostSimHandle | null;
  /** One deterministic dev tick: in mode (b) advance the relay clock by one
   *  and drain the hub (returns frames consumed); in mode (a) run the full
   *  sim ritual and return this tick's inbound frames consumed. */
  pump(): number;
  /** Same ritual as pump(), exposed for mode (a) telemetry asserts. */
  pumpSim(): HostStepReport;
  /** Advance the relay clock to `tick` (monotonic — the relay refuses a
   *  rewind), stepping the full ritual each tick. */
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

  // Late-bound projectionSource adapter: the hub is constructed BEFORE the
  // sim (the sim needs the hub), so the fog callback reads through a binding
  // the sim fills in below. In mode (b) nothing is ever assigned and the
  // callback stays permanently undefined — the omit-when-unset seat-state
  // shape, unchanged.
  let simHandle: HostSimHandle | null = null;
  const hubOptions: AttachRelayHubOptions = {
    ...(options.pageSize === undefined ? {} : { pageSize: options.pageSize }),
    ...(options.maxPageSize === undefined ? {} : { maxPageSize: options.maxPageSize }),
    ...(options.logBudget === undefined ? {} : { logBudget: options.logBudget }),
    projectionSource: (seat: string) => simHandle?.viewFor(seat),
  };
  const { relay, hub, port } = createHostRelay(server, hubOptions);
  if (options.sim !== undefined) {
    simHandle = createHostSim({ relay, hub, options: options.sim });
  }
  const sim = simHandle;

  function pumpRelayOnly(): number {
    relay.advanceTo(relay.tick() + 1n);
    return hub.drain();
  }

  const timer =
    tickMs === 0
      ? null
      : setInterval(() => {
          // ONE ritual per tick, whichever topology: (a) delegates to the
          // sim step (which advances the relay itself), (b) is the two-liner.
          if (sim !== null) void sim.step();
          else {
            relay.advanceTo(relay.tick() + 1n);
            hub.drain();
          }
        }, tickMs);

  let stopped = false;
  return {
    relay,
    hub,
    port,
    sim,
    boundPort: (server.address() as AddressInfo).port,
    pump(): number {
      return sim === null ? pumpRelayOnly() : sim.step().drained;
    },
    pumpSim(): HostStepReport {
      if (sim === null) throw new Error("host[pumpSim]: no sim — startHost({sim}) was not passed (topology (b) has no host-owned world)");
      return sim.step();
    },
    pumpTo(tick: bigint): void {
      while (relay.tick() < tick) {
        if (sim !== null) void sim.step();
        else pumpRelayOnly();
      }
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
