/**
 * `test/simLoop.host.test.ts` — topology (a) over REAL loopback sockets.
 *
 * The wave-23 ruling 3b witnesses, all through the host's own door:
 *  1. determinism — same boot seed, two fresh host sims, byte-equal
 *     digestState trails AND byte-equal seat-state frame transcripts;
 *  2. fog isolation end-to-end — a door intent (place-device) executed by
 *     the HOST's driver surfaces in the projections of scoped seats ONLY,
 *     asserted at the decodeFrame level on the wire-snooped raws (apps/proto
 *     is off-limits to this lane, so the consumer stand-in is the raw
 *     frame — the view rider's key set is the evidence);
 *  3. the departed-seat freeze survives publish() on the host clock;
 *  4. the dev interval drives the whole ritual (timer as subject, mode (a));
 *  5. pumpSim() fails loud in relay-only mode (b).
 */

import { afterEach, describe, expect, it } from "vitest";
import { asEntityId, observedKey } from "@hh/sim-core/types";
import { RELAY_ACTION_BUILDERS } from "relay-tools";
import { decodeFrame } from "transport-tools";
import type { SeatStateFrame } from "transport-tools";
import { closeSeat, openSeat, settle, startTestHost, waitUntil } from "./hostHarness.ts";
import type { HostHandle, TestSeat } from "./hostHarness.ts";
import type { HostSimHandle } from "../src/simLoop.ts";

function talkAction(note: string): Readonly<Record<string, unknown>> {
  return { args: { verb: "communicate", target: null, note } };
}

function placeDevice(nodeId: string): Readonly<Record<string, unknown>> {
  const build = RELAY_ACTION_BUILDERS["place-device"];
  if (build === undefined) throw new Error("test precondition: relay offers no place-device builder");
  return { args: build({ nodeId, deviceKind: "generic", template: null }) };
}

const live: { handle: HostHandle; seats: TestSeat[] }[] = [];

async function host(options: Parameters<typeof startTestHost>[0] = {}): Promise<HostHandle> {
  const handle = await startTestHost(options);
  live.push({ handle, seats: [] });
  return handle;
}

async function seat(handle: HostHandle, id: string): Promise<TestSeat> {
  const opened = await openSeat(handle, id);
  const entry = live.find((l) => l.handle === handle);
  entry?.seats.push(opened);
  return opened;
}

function requireSim(handle: HostHandle): HostSimHandle {
  if (handle.sim === null) throw new Error("test precondition: host was not started with { sim }");
  return handle.sim;
}

/** Every seat-state frame one seat received over the wire, DECODED. */
function seatStates(seat: TestSeat): SeatStateFrame[] {
  const out: SeatStateFrame[] = [];
  for (const raw of seat.wire) {
    const frame = decodeFrame(raw);
    if (frame.kind === "seat-state") out.push(frame);
  }
  return out;
}

function riderKeys(frame: SeatStateFrame): readonly string[] {
  return frame.view?.cells.map((c) => c.key) ?? [];
}

afterEach(async () => {
  for (const { handle, seats } of live) {
    for (const s of seats) await closeSeat(s);
    await handle.stop();
  }
  live.length = 0;
});

describe("host-sim-authoritative topology (a) over the wire", () => {
  it("determinism: same boot seed → byte-equal digest trails AND seat-state transcripts", async () => {
    const simOptions = { scopes: { alice: ["edge"], bob: ["edge", "origin"] } } as const;
    const h1 = await host({ sim: simOptions });
    const h2 = await host({ sim: simOptions });
    const alice1 = await seat(h1, "alice");
    const bob1 = await seat(h1, "bob");
    const alice2 = await seat(h2, "alice");
    const bob2 = await seat(h2, "bob");
    for (const s of [alice1, bob1, alice2, bob2]) s.client.join();
    await settle(h1, alice1, bob1);
    await settle(h2, alice2, bob2);

    // The scripted sequence, run in lockstep on both handles:
    const sim1 = requireSim(h1);
    const sim2 = requireSim(h2);
    const reports1 = sim1.runTo(3n);
    const reports2 = sim2.runTo(3n);
    bob1.client.submit("action", talkAction("climbing"));
    bob2.client.submit("action", talkAction("climbing"));
    await settle(h1, alice1, bob1);
    await settle(h2, alice2, bob2);
    sim1.runTo(5n);
    sim2.runTo(5n);
    await settle(h1, alice1, bob1);
    await settle(h2, alice2, bob2);

    expect(reports1.length).toBe(3);
    expect(reports2.length).toBe(3);
    expect(sim1.digests()).toEqual(sim2.digests()); // the engine trail — byte-equal
    expect(sim1.digests().length).toBe(5);
    // publish() rode every step: the WIRE transcripts too, not just the world.
    for (const [s1, s2] of [[alice1, alice2], [bob1, bob2]] as [TestSeat, TestSeat][]) {
      const t1 = seatStates(s1);
      const t2 = seatStates(s2);
      expect(t1.length).toBeGreaterThan(2);
      expect(JSON.stringify(t1)).toBe(JSON.stringify(t2));
    }
    // Non-vacuity: traffic happened — rho moved off zero somewhere.
    const finalView = sim1.state().observed;
    expect([...finalView.keys()].some((k) => k.includes("utilizationRho"))).toBe(true);
  });

  it("fog isolation end-to-end: a host-executed door intent surfaces ONLY for scoped seats", async () => {
    const h = await host({ sim: { scopes: { alice: ["edge"], bob: "all" } } });
    const alice = await seat(h, "alice");
    const bob = await seat(h, "bob");
    alice.client.join();
    bob.client.join();
    await settle(h, alice, bob);
    const sim = requireSim(h);
    sim.runTo(1n);
    await settle(h, alice, bob);

    bob.client.submit("action", placeDevice("gadget-1"));
    await settle(h, alice, bob); // the hub stamps at the CURRENT relay tick…
    const report = sim.step(); // …and THIS step feeds it to the door — host is the ONLY feeder
    await settle(h, alice, bob);
    expect(report.intentsFed).toBe(1);
    expect(report.published).toBe(2);

    const gadgetRho = observedKey(asEntityId("gadget-1"), "utilizationRho");
    const originRho = observedKey(asEntityId("origin"), "utilizationRho");

    // BOB (estate scope): the placed device EXISTS in his projection — the
    // host driver executed the door and the fog surfaced it for his scope.
    const bobStates = seatStates(bob);
    const bobLatest = bobStates[bobStates.length - 1];
    if (bobLatest === undefined) throw new Error("bob must receive seat-state frames");
    expect(riderKeys(bobLatest)).toContain(gadgetRho);
    expect(riderKeys(bobLatest)).toContain(originRho);

    // ALICE (edge scope): NO seat-state rider of hers ever mentions the
    // placed device or the origin node — absent INCLUDING existence. (The
    // shared-log broadcast frames may carry the public action; the PROJECTION
    // never leaks.)
    expect(seatStates(alice).length).toBeGreaterThan(0);
    for (const frame of seatStates(alice)) {
      for (const key of riderKeys(frame)) {
        expect(key.startsWith("gadget-1::")).toBe(false);
        expect(key.startsWith("origin::")).toBe(false);
      }
      expect(riderKeys(frame).every((k) => k.startsWith("edge::"))).toBe(true);
    }
    // Non-vacuity: alice's scope is REAL — her latest rider carries BOTH
    // edge cells (a scope that merely happened to be empty would pass the
    // loop above too).
    const edgeRho = observedKey(asEntityId("edge"), "utilizationRho");
    const aliceLatestForReal = seatStates(alice).at(-1);
    if (aliceLatestForReal === undefined) throw new Error("alice must receive seat-state frames");
    expect(riderKeys(aliceLatestForReal)).toEqual([observedKey(asEntityId("edge"), "inspectionDepth"), edgeRho]);

    // The public SKELETON is identical though — same ledger, same lastStamp:
    // fog narrows the view, never the shared truth.
    const aliceLatest = seatStates(alice).at(-1);
    if (aliceLatest === undefined) throw new Error("alice must receive seat-state frames");
    expect(aliceLatest.ledger).toEqual(bobLatest.ledger);
    expect(aliceLatest.lastStamp).toEqual(bobLatest.lastStamp);
    expect(aliceLatest.view).toBeDefined();
    expect(bobLatest.view).not.toEqual(aliceLatest.view);
  });

  it("the departed-seat freeze rides the host clock: publish fans live seats only", async () => {
    const h = await host({ sim: { scopes: { alice: "all", carol: ["edge"] } } });
    const alice = await seat(h, "alice");
    const carol = await seat(h, "carol");
    alice.client.join();
    carol.client.join();
    await settle(h, alice, carol);
    const sim = requireSim(h);
    sim.runTo(1n);
    await settle(h, alice, carol);

    alice.client.leave();
    await settle(h, alice, carol);
    const carolFrozen = carol.wire.length;
    const aliceFrames = alice.wire.length;
    const report = sim.step();
    await settle(h, alice, carol);
    expect(report.published).toBe(1); // carol only — alice left the fan-out
    expect(alice.wire.length).toBe(aliceFrames); // her inbox froze mid-run
    expect(carol.wire.length).toBeGreaterThan(carolFrozen);
    const carolStates = seatStates(carol);
    const latest = carolStates[carolStates.length - 1];
    if (latest === undefined) throw new Error("carol must receive seat-state frames");
    const aliceLedger = latest.ledger.seatHolders.find((s) => s.participantId === "alice");
    expect(aliceLedger?.leftAtTick).toBeDefined(); // truthful ledger for the living
  });

  it("the dev interval drives the whole (a) ritual — no manual pump anywhere", async () => {
    const h = await host({ tickMs: 25, sim: { scopes: { bob: "all" } } });
    const bob = await seat(h, "bob");
    bob.client.join();
    await settle(h, bob);
    const sim = requireSim(h);
    await waitUntil(() => sim.digests().length >= 3, () => {
      void bob.client.drain();
    });
    // Frames arrived (seat-state with riders) with ZERO manual pumping:
    await waitUntil(() => seatStates(bob).some((f) => f.view !== undefined), () => {
      void bob.client.drain();
    });
    expect(sim.tick()).toBeGreaterThanOrEqual(3n);
  });

  it("pumpSim() fails loud in relay-only mode (b)", async () => {
    const h = await host(); // no sim — topology (b), the shipped default
    expect(h.sim).toBeNull();
    expect(() => h.pumpSim()).toThrow(/host\[pumpSim\]/);
    // …and the mode-(b) posture still omits the rider (omit-when-unset):
    const bob = await seat(h, "bob");
    bob.client.join();
    await settle(h, bob);
    h.pump();
    await settle(h, bob);
    for (const frame of seatStates(bob)) expect(frame.view).toBeUndefined();
  });
});
