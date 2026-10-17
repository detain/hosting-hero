/**
 * relay-tools — explicit public barrel (lane L-TP rider, ADR-0016 transport
 * ruling). The relay kept zero barrels through the spike + wire-mechanics
 * waves because its tests import `../src/relay.ts` / `../src/runner.ts`
 * directly; the in-repo transport (tools/transport) is the first EXTERNAL
 * consumer, and the house law is subpath/barrel imports, never deep source
 * paths. This file re-exports the relay's public surface verbatim — zero
 * behavior, zero churn: the 42 tests keep riding the direct imports.
 *
 * Cycle law: the relay NEVER imports transport-tools (direction is strictly
 * transport → relay); pinned by tools/transport/test/transportLaw.test.ts.
 */

export {
  DEFAULT_CATCH_UP_PAGE_SIZE,
  RELAY_ACTION_BUILDERS,
  RelayError,
  assertRelayAppendStep,
  compareRelayStamps,
  createCoopRelay,
  isStampAfter,
  pageCoopLog,
} from "./relay.ts";
export type {
  CoopRelay,
  CoopRelayOptions,
  RelayActionPayload,
  RelaySeatSpec,
  RelayStamp,
} from "./relay.ts";
export { createSpikeRunner } from "./runner.ts";
export type { SpikeRunner, SpikeRunnerOptions } from "./runner.ts";
