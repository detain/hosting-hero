/**
 * `tools/host/src/relay.ts` — weld the three halves: the relay (sole stamp +
 * ledger authority, tools/relay), the hub adapter (frame laws, the
 * transport[CODE] grammar), and this package's WebSocket carrier.
 *
 * The `autoCatchUpOnJoin: false` posture is REQUIRED on a wire transport
 * (tools/transport README law 3 + server.ts `handleJoin`): the tenure opens
 * DRY and the client pumps `catchup-request` pages over its own latency
 * budget — a synchronous in-join page loop would invent history the socket
 * has not carried yet. The hub's pure-read `pageCoopLog` answers every page
 * at the CLIENT's cursor (R4), which is what makes a mid-page-set drop
 * resume to a byte-identical inbox.
 *
 * Zero laws live here: stamping/seq/dup-self-check belong to the relay,
 * codec/hub verdicts to transport-tools, byte-moving to wsHubPort.ts.
 */

import { attachRelayHub } from "transport-tools";
import type { AttachRelayHubOptions, RelayHubHandle } from "transport-tools";
import { createCoopRelay } from "relay-tools";
import type { CoopRelay } from "relay-tools";
import type { WebSocketServer } from "ws";
import { createWsHubPort } from "./wsHubPort.ts";
import type { WsHubPort, WsHubPortOptions } from "./wsHubPort.ts";

/** Hub knobs (parsed upstream by attachRelayHub) welded side by side with
 *  CARRIER knobs (owned by wsHubPort) — the welder splits them by identity,
 *  restating nothing. */
export interface HostRelayOptions extends AttachRelayHubOptions, WsHubPortOptions {}

export interface HostRelay {
  readonly relay: CoopRelay;
  readonly hub: RelayHubHandle;
  readonly port: WsHubPort;
}

export function createHostRelay(server: WebSocketServer, options: HostRelayOptions = {}): HostRelay {
  const port = createWsHubPort(server, {
    ...(options.autoLeaveOnDisconnect === undefined ? {} : { autoLeaveOnDisconnect: options.autoLeaveOnDisconnect }),
    ...(options.authorize === undefined ? {} : { authorize: options.authorize }),
  });
  const relay = createCoopRelay({ autoCatchUpOnJoin: false });
  const hub = attachRelayHub(relay, port, options);
  return { relay, hub, port };
}
