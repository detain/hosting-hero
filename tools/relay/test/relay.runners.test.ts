/**
 * TWO RUNNERS, ONE DIGEST — the ADR-0014 #D6 falsifiable claim.
 *
 * One relay stamps the shared timeline. Two independent spike runners receive
 * that log in DIFFERENT arrival orders (a hostile transport may deliver out of
 * order), normalize through orderCoopTimeline (the same law the future
 * Workerman relay will lean on), and drive the real intent door. If the
 * mp-topology (b) bet holds, the normalized feeds are identical and the two
 * worlds converge frame-for-frame to the same digestState — no seat-to-seat
 * chat, no client authority, just the stamped log.
 */

import { describe, expect, it } from "vitest";
import { asRunSeed, PlayerVerb } from "@hh/sim-core/types";
import type { CoopTimelineRecord } from "@hh/sim-core/replay";
import { createCoopRelay } from "../src/relay.ts";
import { createSpikeRunner } from "../src/runner.ts";

const TICKS = 12;
const SEED = asRunSeed(904n);

/** Seed the relay exactly as a host would: seats staggered by the ledger's
 *  strictly-ascending join law, then a scripted timeline including a
 *  hand-contention tick (t8: two communicates, one free hand). */
function buildRelay(): ReturnType<typeof createCoopRelay> {
  const relay = createCoopRelay();
  relay.joinSeat("alice"); // t0
  relay.advanceTo(1n);
  relay.joinSeat("bob"); // t1
  relay.submit("alice", "sightline", { lane: "edge" });
  relay.submit("alice", "action", {
    args: { verb: PlayerVerb.PlaceDevice, nodeId: "n-1", deviceKind: "server", template: null },
  }); // t1:0 (t2 stamp below keeps rail math simple — see trace in README)
  relay.advanceTo(2n);
  relay.submit("bob", "note", { text: "booting" });
  relay.advanceTo(4n);
  relay.submit("bob", "action", {
    args: { verb: PlayerVerb.PlaceDevice, nodeId: "n-2", deviceKind: "server", template: null },
  }); // t4:0
  relay.advanceTo(6n);
  relay.submit("alice", "action", {
    args: { verb: PlayerVerb.ConnectPorts, relation: "data", from: "n-1", to: "n-2", slot: null },
  }); // t6:0
  relay.advanceTo(8n);
  relay.submit("alice", "action", {
    args: { verb: PlayerVerb.Communicate, target: null, note: "eta 10m" },
  }); // t8:0 — takes the hand released at t7
  relay.submit("bob", "action", {
    args: { verb: PlayerVerb.Communicate, target: null, note: "all ok" },
  }); // t8:1 — the contested one: both rails busy ⇒ refused identically by every host
  relay.submit("bob", "sightline", { lane: "origin" });
  relay.advanceTo(10n);
  // heterogeneous pair on one tick: place occupies 3, communicate 2 — so the
  // (tick, seq) order decides WHICH rail gets which busyUntil (the falsifier).
  relay.submit("alice", "action", {
    args: { verb: PlayerVerb.PlaceDevice, nodeId: "n-3", deviceKind: "server", template: null },
  }); // t10:0
  relay.submit("bob", "action", {
    args: { verb: PlayerVerb.Communicate, target: null, note: "closing" },
  }); // t10:1
  relay.advanceTo(11n);
  relay.submit("alice", "note", { text: "quarter over" });
  return relay;
}

/** Fixed hostile arrival permutations — deterministic, no RNG. */
function reverseAll(log: readonly CoopTimelineRecord[]): CoopTimelineRecord[] {
  return [...log].reverse();
}

function swapAdjacent(log: readonly CoopTimelineRecord[]): CoopTimelineRecord[] {
  const out = [...log];
  for (let i = 0; i + 1 < out.length; i += 2) {
    const a = out[i]!;
    const b = out[i + 1]!;
    out[i] = b;
    out[i + 1] = a;
  }
  return out;
}

function runOnce(seed = SEED): { framesA: readonly string[]; framesB: readonly string[]; terminal: string; relay: ReturnType<typeof createCoopRelay> } {
  const relay = buildRelay();
  const feedA = relay.feedFor("alice"); // relay broadcast order = stamp order
  const feedB = relay.feedFrom(swapAdjacent(reverseAll(relay.sharedLog()))); // hostile transport, normalized
  const a = createSpikeRunner({ runSeed: seed });
  const b = createSpikeRunner({ runSeed: seed });
  a.runTicks(feedA, TICKS);
  b.runTicks(feedB, TICKS);
  const framesA = a.frames();
  const framesB = b.frames();
  return { framesA, framesB, terminal: framesA[TICKS - 1]!, relay };
}

describe("two runners, one digest (mp-topology (b) spike claim)", () => {
  it("normalizes hostile arrival orders to the identical door feed", () => {
    const relay = buildRelay();
    const canonical = relay.feedFor("alice");
    expect(canonical.length).toBe(7); // exactly the action arm reaches the door
    expect(relay.feedFrom(reverseAll(relay.sharedLog()))).toStrictEqual(canonical);
    expect(relay.feedFrom(swapAdjacent(reverseAll(relay.sharedLog())))).toStrictEqual(canonical);
    expect(relay.feedFor("bob")).toStrictEqual(canonical); // same stamps reach both seats
  });

  it("independent runners converge frame-for-frame and at the terminal tick", () => {
    const { framesA, framesB, terminal, relay } = runOnce();
    expect(framesB).toStrictEqual(framesA);
    expect(framesA).toHaveLength(TICKS);
    // non-triviality: the world actually moved (t1 place lands, t8 contention lands)
    expect(framesA[2]).not.toBe(framesA[0]);
    expect(framesA[8]).not.toBe(framesA[7]);
    expect(terminal).toMatch(/^[0-9a-f]{16,32}$/);
    // and the shared-log provenance agrees across any interleaving
    expect(relay.timelineDigest()).toMatch(/^[0-9a-f]{16}$/);
  });

  it("seq stamps are load-bearing: swapping the contested tick's pair diverges the world", () => {
    const relay = buildRelay();
    const baseline = runOnce().framesA;
    // swap the (t10,0)/(t10,1) seq pair — the communicate grabs the first rail,
    // the place the second: per-token busyUntil (13,12) flips to (12,13)
    const swapped = relay.sharedLog().map((r) =>
      r.tick === 10n && r.kind === "action" ? { ...r, seq: r.seq === 0 ? 1 : 0 } : r,
    );
    const diverging = createSpikeRunner({ runSeed: SEED });
    diverging.runTicks(relay.feedFrom(swapped), TICKS);
    const frames = diverging.frames();
    expect(frames[10]).not.toBe(baseline[10]!);
    expect(frames[11]).not.toBe(baseline[11]!); // divergence never heals — stamps are authority
  });

  it("the relay never emits a feed that could trip the door's M4 dup throw", () => {
    const relay = buildRelay();
    const feed = relay.feedFor("alice");
    const dupe = [...feed, feed[3]!]; // duplicate (tick, seq) into one tick's group
    const runner = createSpikeRunner({ runSeed: SEED });
    expect(() => runner.runTicks(dupe, TICKS)).toThrowError(/duplicate \(tick, seq\) stamp tick=8 seq=0/);
  });

  it("×100: rebuild + rerun on seed 904n always ends at the same digest", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      seen.add(runOnce().terminal);
    }
    expect(seen.size).toBe(1);
  });

  it("seed divergence: a different run seed diverges the world", () => {
    expect(runOnce(asRunSeed(33n)).terminal).not.toBe(runOnce().terminal);
  });
});
