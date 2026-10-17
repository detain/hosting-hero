/**
 * transport-tools — explicit public barrel (house law: no export-star).
 *
 * hh-coop-transport@1 in-repo layer (ADR-0016 owner ruling 2026-10-17,
 * design lane I-T): frames + codec + port contract + deterministic in-memory
 * carrier + relay hub/client endpoints + per-seat fog serialization + the
 * replica re-hosting witness. Transport TO THE FRAME — the wire itself
 * (sockets, rooms, auth, MySQL notary) is the out-of-repo PHP/Workerman
 * carrier, which re-runs this package's conformance law body over its own
 * port (`runTransportConformance` in the test suite is exported-shaped for
 * exactly that future twin).
 */

export {
  TRANSPORT_FRAME_KINDS,
  TRANSPORT_PROTOCOL,
  TRANSPORT_PROTOCOL_VERSION,
  isClientToHubKind,
  isHubToClientKind,
  MAX_FRAME_BYTES,
} from "./envelope.ts";
export type {
  BroadcastFrame,
  CatchUpPageFrame,
  CatchUpRequestFrame,
  CellEncoding,
  CoopRecordWire,
  FaultFrame,
  JoinFrame,
  LeaveFrame,
  SeatHolderWire,
  SeatLedgerWire,
  SeatStateFrame,
  SeatViewWire,
  StampWire,
  SubmitFrame,
  TransportCellWire,
  TransportFrame,
  TransportFrameKind,
  WireUs,
} from "./envelope.ts";

export {
  decodeFrame,
  decodeRecordWire,
  decodeStampWire,
  encodeFrame,
  encodeRecordWire,
  encodeStampWire,
  ledgerToWire,
  payloadIdentity,
  TRANSPORT_ERROR_CODES,
  TransportError,
} from "./codec.ts";
export type { TransportErrorCode } from "./codec.ts";

export type { DeliveryPolicy, TransportEndpoint, TransportPort, TransportSchedule } from "./port.ts";

export { createInMemoryTransport } from "./inMemory.ts";
export type { DeliveryTraceEntry, InMemoryTransport, InMemoryTransportStats } from "./inMemory.ts";

export { attachRelayHub, createReplica } from "./server.ts";
export type { AttachRelayHubOptions, HubFaultRecord, RelayHubHandle, TransportReplica } from "./server.ts";

export {
  createTransportClient,
  reviveHubArgs,
  TRANSPORT_BIGINT_ARG_FIELDS,
  TRANSPORT_NULLABLE_BIGINT_ARG_FIELDS,
} from "./client.ts";
export type { TransportClient } from "./client.ts";

export { decodeScopedView, encodeScopedView, transportViewForStore } from "./fog.ts";
