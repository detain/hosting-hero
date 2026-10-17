/**
 * test/fog.test.ts — observed_view(seat) through the wire.
 *
 * docblock-honest headline: A SEAT RECEIVES A PROJECTION, NEVER THE STORE.
 * projectSeat is the engine's fog authority (observed/view.ts); this layer
 * only serializes what it projected — fairness-channel readings come through
 * TRUTH-but-scope-filtered (the view.ts law restated at wire level), and an
 * out-of-scope key is absent INCLUDING its existence.
 *
 * The planted store below is the test's own fixture (explicit ObservedWrites)
 * — no engine imports of test internals, no timing.
 */

import { describe, expect, it } from "vitest";
import { ObservedStore, asSeatId, entityScope, propertyScope } from "@hh/sim-core/observed";
import { asCauseId, asEntityId, observedKey, ResolutionBand } from "@hh/sim-core/types";
import type { ObservedCell, ObservedKey } from "@hh/sim-core/types";
import { decodeFrame, encodeFrame } from "../src/codec.ts";
import {
  TRANSPORT_PROTOCOL,
  TRANSPORT_PROTOCOL_VERSION,
} from "../src/envelope.ts";
import type { SeatStateFrame, SeatViewWire } from "../src/envelope.ts";
import { decodeScopedView, encodeScopedView, transportViewForStore } from "../src/fog.ts";
import { createInMemoryTransport } from "../src/inMemory.ts";
import { createTransportClient } from "../src/client.ts";

const HEAD = { protocol: TRANSPORT_PROTOCOL, version: TRANSPORT_PROTOCOL_VERSION } as const;

const SEAT_APP = asSeatId("seat:app");
const SEAT_ANALYST = asSeatId("seat:analyst");
const APP = asEntityId("app-1");
const DB = asEntityId("db-1");
const CAUSE = asCauseId("fog:test");

const APP_CPU: ObservedCell<unknown> = Object.freeze({
  value: 3277n,
  fidelity: ResolutionBand.Fine,
  freshnessUs: 60_000_000n,
  coverage: 45875n,
  certainty: 39322n,
  status: "live" as const,
});
const APP_MEM: ObservedCell<unknown> = Object.freeze({
  value: null, // "nothing, not zero" (R-66)
  fidelity: ResolutionBand.None,
  freshnessUs: 0n,
  coverage: 0n,
  certainty: 0n,
  status: "unknown" as const,
});
const DB_CPU: ObservedCell<unknown> = Object.freeze({
  value: 2621n,
  fidelity: ResolutionBand.Coarse,
  freshnessUs: 120_000_000n,
  coverage: 32768n,
  certainty: 19661n,
  status: "stale" as const,
});
const DB_TEXT: ObservedCell<unknown> = Object.freeze({
  value: "hh-canon-v1:fold", // composite text rides the text encoding
  fidelity: ResolutionBand.Exact,
  freshnessUs: 5_000_000n,
  coverage: 65536n,
  certainty: 65536n,
  status: "live" as const,
});

function buildStore(): ObservedStore {
  const store = new ObservedStore();
  store.applyObservedWrites(
    [
      { key: observedKey(APP, "cpu"), cell: APP_CPU, causeId: CAUSE },
      { key: observedKey(APP, "mem"), cell: APP_MEM, causeId: CAUSE },
      { key: observedKey(DB, "cpu"), cell: DB_CPU, causeId: CAUSE },
      { key: observedKey(DB, "state"), cell: DB_TEXT, causeId: CAUSE },
    ],
    0n,
  );
  return store;
}

function seatStateFrame(view?: SeatViewWire): SeatStateFrame {
  return {
    ...HEAD,
    kind: "seat-state",
    sentAtTick: "1",
    ledger: { seatHolders: [] },
    lastStamp: null,
    ...(view === undefined ? {} : { view }),
  };
}

describe("fog serialization (observed_view(seat) over the wire)", () => {
  it("a seat gets PROJECTIONS, never the store — out-of-scope keys are absent INCLUDING existence", () => {
    const store = buildStore();
    const wire = transportViewForStore(store, entityScope(SEAT_APP, [APP]));
    expect([...wire.cells].map((c) => c.key).sort()).toEqual(
      [observedKey(APP, "cpu"), observedKey(APP, "mem")].sort(),
    );
    const decoded = decodeScopedView(wire);
    expect(decoded.get(observedKey(DB, "cpu"))).toBeUndefined();
    expect(decoded.get(observedKey(DB, "state"))).toBeUndefined();
  });

  it("A/B scope twins: the same store encodes different bytes per seat", () => {
    const store = buildStore();
    const appView = encodeFrame(seatStateFrame(transportViewForStore(store, entityScope(SEAT_APP, [APP]))));
    const analystView = encodeFrame(seatStateFrame(transportViewForStore(store, propertyScope(SEAT_ANALYST, ["cpu"]))));
    expect(appView).not.toBe(analystView);
    const decoded = decodeScopedView((decodeFrame(analystView) as SeatStateFrame).view as SeatViewWire);
    // The Analyst sees cpu across BOTH machines (scope is about keys) but
    // never mem/state:
    expect([...decoded.keys()].sort()).toEqual([observedKey(APP, "cpu"), observedKey(DB, "cpu")].sort());
  });

  it("cell fidelity survives the hop: value, fidelity, freshness, coverage, certainty, status", () => {
    const store = buildStore();
    const projected = transportViewForStore(store, propertyScope(SEAT_ANALYST, ["cpu"]));
    const decoded = decodeScopedView(projected);
    for (const cell of projected.cells) {
      const back = decoded.get(cell.key as ObservedKey) as ObservedCell<unknown>;
      if (cell.encoding === "fixed") {
        expect(typeof back.value).toBe("bigint");
        expect(back.value).toBe(BigInt(cell.value as string));
      }
      if (cell.encoding === "text" && typeof cell.value === "string") expect(back.value).toBe(cell.value);
      expect(back.fidelity).toBe(cell.fidelity);
      expect(back.freshnessUs).toBe(BigInt(cell.freshnessUs));
      expect(back.coverage).toBe(BigInt(cell.coverage));
      expect(back.certainty).toBe(BigInt(cell.certainty));
      expect(back.status).toBe(cell.status);
    }
  });

  it("the null cell ('nothing, not zero') round-trips as null on the text encoding", () => {
    const store = buildStore();
    const wire = transportViewForStore(store, entityScope(SEAT_APP, [APP]));
    const mem = wire.cells.find((c) => c.key === observedKey(APP, "mem"));
    expect(mem?.value).toBeNull();
    expect(mem?.encoding).toBe("text");
    const decoded = decodeScopedView(wire);
    expect(decoded.get(observedKey(APP, "mem"))?.value).toBeNull();
  });

  it("insertion order is not a wire fact: shuffled stores encode byte-equal views", () => {
    const a = new ObservedStore();
    const b = new ObservedStore();
    a.applyObservedWrites([{ key: observedKey(APP, "cpu"), cell: APP_CPU, causeId: CAUSE }], 0n);
    b.applyObservedWrites([{ key: observedKey(APP, "mem"), cell: APP_MEM, causeId: CAUSE }], 0n);
    a.applyObservedWrites([{ key: observedKey(APP, "mem"), cell: APP_MEM, causeId: CAUSE }], 0n);
    b.applyObservedWrites([{ key: observedKey(APP, "cpu"), cell: APP_CPU, causeId: CAUSE }], 0n);
    const scope = entityScope(SEAT_APP, [APP]);
    // decode→re-encode on the A side (proves BOTH directions are order-free):
    const left = encodeFrame(seatStateFrame(encodeScopedView(decodeScopedView(transportViewForStore(a, scope)))));
    const right = encodeFrame(seatStateFrame(transportViewForStore(b, scope)));
    expect(left).toBe(right);
  });

  it("fairness-channel law restated at wire level: readings that exist go through TRUTH-but-scope-filtered", () => {
    const store = buildStore();
    const projected = new Map(transportViewForStore(store, propertyScope(SEAT_ANALYST, ["cpu"])).cells.map((c) => [c.key, c]));
    // DB cpu is STALE at the source — the wire does not launder it back to live:
    expect(projected.get(observedKey(DB, "cpu"))?.status).toBe("stale");
    expect(projected.get(observedKey(DB, "cpu"))?.certainty).toBe("19661");
    // and the analyst's scope simply never receives DB's text cell — filtering
    // happens by SCOPE, never by rewriting a reading:
    expect(projected.has(observedKey(DB, "state"))).toBe(false);
  });

  it("view-absent legacy identity: a client on viewless frames keeps observed() null", () => {
    const net = createInMemoryTransport();
    const client = createTransportClient(net.port, "solo");
    net.port.client("solo").send({
      ...HEAD,
      kind: "seat-state",
      sentAtTick: "1",
      ledger: { seatHolders: [{ participantId: "solo", joinedAtTick: "0" }] },
      lastStamp: null,
    });
    net.schedule.pump(2);
    client.drain();
    expect(client.view()).toBeNull();
    expect(client.observed()).toBeNull();
    expect(client.ledger()?.seatHolders).toHaveLength(1);
  });

  it("an off-contract cell value type (boolean) is refused with transport[bad-field]", () => {
    const forged = new Map<string, ObservedCell<unknown>>([
      ["x::flag", Object.freeze({ ...APP_CPU, value: true })],
    ]);
    expect(() => encodeScopedView(forged as never)).toThrow(/transport\[bad-field\]/);
  });
});
