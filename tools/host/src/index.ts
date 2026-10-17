/**
 * `tools/host/src/index.ts` — explicit public barrel (house law: no
 * export-star; the relay-tools R-E1 precedent @88f9c30 — a workspace member
 * consumed by package NAME needs `exports` + a barrel, and the barrel is the
 * only public surface).
 *
 * The dev carrier's story in five names: `createWsHubPort` (byte mover),
 * `createHostRelay` (welder), `startHost` (the door with a clock),
 * `createTokenGate` (the OPT-IN auth knob — default off is the ruling), and
 * — since the wave-23 ruling 3b — `createHostSim` (the topology-(a) world
 * the door can own).
 */

export { AUTH_FAILURE_REASONS, createTokenGate, parseTokenParam, verifyToken } from "./auth.ts";
export type { AuthFailureReason, TokenParam } from "./auth.ts";
export { createWsHubPort } from "./wsHubPort.ts";
export type { WsHubPort, WsHubPortOptions } from "./wsHubPort.ts";
export { createHostRelay } from "./relay.ts";
export type { HostRelay, HostRelayOptions } from "./relay.ts";
export { createHostSim, HOST_SIM_BOOT_SEED } from "./simLoop.ts";
export type { HostSimDeps, HostSimHandle, HostSimOptions, HostSimScopes, HostStepReport } from "./simLoop.ts";
export { startHost } from "./server.ts";
export type { HostHandle, StartHostOptions } from "./server.ts";
