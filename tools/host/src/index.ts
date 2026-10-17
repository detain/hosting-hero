/**
 * `tools/host/src/index.ts` — explicit public barrel (house law: no
 * export-star; the relay-tools R-E1 precedent @88f9c30 — a workspace member
 * consumed by package NAME needs `exports` + a barrel, and the barrel is the
 * only public surface).
 *
 * The dev carrier's whole story in three names: `createWsHubPort` (byte
 * mover), `createHostRelay` (welder), `startHost` (the door with a clock).
 */

export { createWsHubPort } from "./wsHubPort.ts";
export type { WsHubPort } from "./wsHubPort.ts";
export { createHostRelay } from "./relay.ts";
export type { HostRelay } from "./relay.ts";
export { startHost } from "./server.ts";
export type { HostHandle, StartHostOptions } from "./server.ts";
