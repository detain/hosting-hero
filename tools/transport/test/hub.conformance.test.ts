/**
 * test/hub.conformance.test.ts — the I-T §10 conformance law body, run
 * against the in-memory carrier. A future socket/Workerman twin imports
 * `runTransportConformance` from ./conformance.ts and passes its own wiring
 * factory: the law body is carrier-agnostic by construction (TransportPort +
 * public hub/client handles only), which is the executable form of
 * "one protocol, two carriers".
 */

import { makeInMemoryWiring, runTransportConformance } from "./conformance.ts";

runTransportConformance("in-memory carrier", makeInMemoryWiring);
