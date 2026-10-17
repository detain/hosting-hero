/**
 * test/publish.test.ts — publish() end-to-end against the REAL fog stack.
 *
 * The conformance law body proves publish()'s WIRE laws with hand-authored
 * SeatViewWire riders; this file proves the seam the host-sim-authoritative
 * topology (I-TA variant (a)) actually uses: a live ObservedStore read
 * through projectSeat per seat (transportViewForStore), fanned on the host's
 * own clock — and that the whole transcript is a PURE FUNCTION of the script:
 * ×100 fresh runs of the identical sequence produce ONE byte-equal transcript
 * (the Set.size-1 gate every determinism lane in this repo holds sacred).
 *
 * A falsifier arm runs the SAME script with a DIFFERENT scope table (carol
 * scoped where bob was not) — proving the transcript genuinely carries the
 * per-seat projections, not a broadcast store dump.
 */

import { describe, expect, it } from "vitest";
import { ObservedStore, asSeatId, entityScope } from "@hh/sim-core/observed";
import { asCauseId, asEntityId, observedKey, ResolutionBand } from "@hh/sim-core/types";
import type { ObservedCell } from "@hh/sim-core/types";
import { createCoopRelay } from "relay-tools";
import { attachRelayHub } from "../src/server.ts";
import { createTransportClient } from "../src/client.ts";
import { createInMemoryTransport } from "../src/inMemory.ts";
import { transportViewForStore } from "../src/fog.ts";

const EDGE = asEntityId("edge");
const ORIGIN = asEntityId("origin");

const cell = (value: bigint): ObservedCell<unknown> =>
  Object.freeze({
    value,
    fidelity: ResolutionBand.Fine,
    freshnessUs: 0n,
    coverage: 65536n,
    certainty: 65536n,
    status: "live" as const,
  });

/** One scripted host-sim session: joins, a submit, a clock step, a store
 *  write, three publishes. Returns the FULL outbound transcript (raw frames
 *  in send order, every target) — the byte string the determinism gate sets
 *  on. `wideScopeThird` is the falsifier knob: carol joins last, and when
 *  false she gets no rider (undefined), when true the ORIGIN-scoped one. */
function runScript(wideScopeThird: boolean): string {
  const relay = createCoopRelay({ autoCatchUpOnJoin: false });
  const net = createInMemoryTransport({});
  const store = new ObservedStore();
  const scopes = new Map<string, ReturnType<typeof entityScope>>([
    ["alice", entityScope(asSeatId("alice"), [EDGE])],
    ["bob", entityScope(asSeatId("bob"), [EDGE, ORIGIN])],
  ]);
  const hub = attachRelayHub(relay, net.port, {
    projectionSource: (seat) => {
      if (seat === "carol") {
        return wideScopeThird ? transportViewForStore(store, entityScope(asSeatId("carol"), [ORIGIN])) : undefined;
      }
      const scope = scopes.get(seat);
      return scope === undefined ? undefined : transportViewForStore(store, scope);
    },
  });
  const alice = createTransportClient(net.port, "alice");
  const bob = createTransportClient(net.port, "bob");
  const carol = createTransportClient(net.port, "carol");
  const settle = (): void => {
    for (let i = 0; i < 200; i += 1) {
      const advanced = net.schedule.step();
      hub.drain();
      alice.drain();
      bob.drain();
      carol.drain();
      if (!advanced && net.pending() === 0) return;
    }
    throw new Error("publish determinism: channel never quiesced (livelock?)");
  };

  store.applyObservedWrites(
    Object.freeze([
      Object.freeze({ key: observedKey(EDGE, "rho"), cell: cell(3277n), causeId: asCauseId("hostsim:edge:0") }),
      Object.freeze({ key: observedKey(ORIGIN, "rho"), cell: cell(1024n), causeId: asCauseId("hostsim:origin:0") }),
    ]),
    0n,
  );
  alice.join();
  bob.join();
  settle();
  hub.publish();

  bob.submit("action", { args: { verb: "communicate", target: null, note: "load climbing" } });
  settle();
  relay.advanceTo(1n);
  store.applyObservedWrites(
    Object.freeze([
      Object.freeze({ key: observedKey(EDGE, "rho"), cell: cell(4915n), causeId: asCauseId("hostsim:edge:1") }),
    ]),
    60_000_000n,
  );
  hub.publish();

  carol.join();
  settle();
  hub.publish();
  hub.publish(); // idempotent repeat on an unchanged clock

  return net.trace().map((entry) => `${String(entry.target)}\u0000${entry.raw}`).join("\n");
}

describe("publish() determinism (I-TA variant (a) seam)", () => {
  it("×100 fresh runs of one script produce ONE byte-equal transcript", () => {
    const digests = new Set<string>();
    for (let run = 0; run < 100; run += 1) digests.add(runScript(false));
    expect(digests.size).toBe(1); // no timers, no wall-clock, no hidden state
    const transcript = [...digests][0] as string;
    // The transcript must be NON-TRIVIAL — publishes actually rode it:
    expect(transcript.split('"seat-state"').length - 1).toBeGreaterThanOrEqual(3 + 3 + 2); // alice+bob per fan, +carol late
    // …and per-seat scoped: alice's edge rider never carries the origin cell,
    // existence included (the fog law, re-proved over the fan path).
    for (const line of transcript.split("\n")) {
      const [target, raw] = line.split("\u0000") as [string, string];
      if (target === "alice" && raw.includes('"seat-state"') && raw.includes('"view"')) {
        expect(raw).not.toContain("origin");
      }
    }
  });

  it("falsifier: widening a seat's scope CHANGES the transcript (the rider is per-seat truth, not wallpaper)", () => {
    expect(runScript(true)).not.toBe(runScript(false));
  });

  it("the view rider survives the wire round-trip with values intact (decodeScopedView witness)", () => {
    // One run, inspect what BOB's client decodes after the load-climbing tick.
    const relay = createCoopRelay({ autoCatchUpOnJoin: false });
    const net = createInMemoryTransport({});
    const store = new ObservedStore();
    store.applyObservedWrites(
      Object.freeze([
        Object.freeze({ key: observedKey(EDGE, "rho"), cell: cell(4915n), causeId: asCauseId("hostsim:edge:1") }),
      ]),
      60_000_000n,
    );
    const hub = attachRelayHub(relay, net.port, {
      projectionSource: (seat) => transportViewForStore(store, entityScope(asSeatId(seat), seat === "bob" ? [EDGE] : [])),
    });
    const alice = createTransportClient(net.port, "alice");
    const bob = createTransportClient(net.port, "bob");
    alice.join();
    bob.join();
    for (let i = 0; i < 200; i += 1) {
      const advanced = net.schedule.step();
      hub.drain();
      alice.drain();
      bob.drain();
      if (!advanced && net.pending() === 0) break;
    }
    expect(hub.publish()).toBe(2);
    for (let i = 0; i < 200; i += 1) {
      const advanced = net.schedule.step();
      alice.drain();
      bob.drain();
      if (!advanced && net.pending() === 0) break;
    }
    const view = bob.observed();
    if (view === null) throw new Error("bob's seat must carry a decoded view after publish()"); // fail-fast, narrows
    const entries = [...view.entries()];
    expect(entries).toHaveLength(1);
    const [key, projected] = entries[0] as (typeof entries)[number];
    expect(key).toBe(observedKey(EDGE, "rho"));
    expect(projected.value).toBe(4915n); // bigint RE-ATTACHED through the wire
    expect(projected.fidelity).toBe(ResolutionBand.Fine);
    // Alice's scope is EMPTY — the rider still arrives, and it is EMPTY, not
    // absent-because-broken and never bob's cells: an empty scope is its own.
    expect(alice.view()).not.toBeNull();
    expect(alice.view()?.cells).toEqual([]);
    expect(alice.observed()?.size).toBe(0);
  });
});
