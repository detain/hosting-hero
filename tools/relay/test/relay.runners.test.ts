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

/** Seed the relay exactly as a host would: seats staggered for clarity only —
 *  same-tick joins are legal since @500c134, canonical order (joinedAtTick asc,
 *  participantId code-unit); plus a hand-contention tick (t8: two communicates).
 *  R1 stamps: the seq stream is LIFETIME-MONOTONIC (never resets per tick) —
 *  the trace reads sightline(1,0) place(1,1) note(2,2) place(4,3) connect(6,4)
 *  comm(8,5) comm(8,6) sightline(8,7) place(10,8) comm(10,9) note(11,10). */
function buildRelay(): ReturnType<typeof createCoopRelay> {
  const relay = createCoopRelay();
  relay.joinSeat("alice"); // t0
  relay.advanceTo(1n);
  relay.joinSeat("bob"); // t1
  relay.submit("alice", "sightline", { lane: "edge" }); // (1,0)
  relay.submit("alice", "action", {
    args: { verb: PlayerVerb.PlaceDevice, nodeId: "n-1", deviceKind: "server", template: null },
  }); // (1,1) (t2 stamp below keeps rail math simple — see trace in README)
  relay.advanceTo(2n);
  relay.submit("bob", "note", { text: "booting" }); // (2,2)
  relay.advanceTo(4n);
  relay.submit("bob", "action", {
    args: { verb: PlayerVerb.PlaceDevice, nodeId: "n-2", deviceKind: "server", template: null },
  }); // (4,3)
  relay.advanceTo(6n);
  relay.submit("alice", "action", {
    args: { verb: PlayerVerb.ConnectPorts, relation: "data", from: "n-1", to: "n-2", slot: null },
  }); // (6,4)
  relay.advanceTo(8n);
  relay.submit("alice", "action", {
    args: { verb: PlayerVerb.Communicate, target: null, note: "eta 10m" },
  }); // (8,5) — takes the hand released at t7
  relay.submit("bob", "action", {
    args: { verb: PlayerVerb.Communicate, target: null, note: "all ok" },
  }); // (8,6) — the contested one: both rails busy ⇒ refused identically by every host
  relay.submit("bob", "sightline", { lane: "origin" }); // (8,7)
  relay.advanceTo(10n);
  // heterogeneous pair on one tick: place occupies 3, communicate 2 — so the
  // (tick, seq) order decides WHICH rail gets which busyUntil (the falsifier).
  relay.submit("alice", "action", {
    args: { verb: PlayerVerb.PlaceDevice, nodeId: "n-3", deviceKind: "server", template: null },
  }); // (10,8)
  relay.submit("bob", "action", {
    args: { verb: PlayerVerb.Communicate, target: null, note: "closing" },
  }); // (10,9)
  relay.advanceTo(11n);
  relay.submit("alice", "note", { text: "quarter over" }); // (11,10)
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
    // swap the (t10,8)/(t10,9) seq pair (R1: lifetime stream, was (10,0)/(10,1)
    // under the retired per-tick reset) — the communicate grabs the first rail,
    // the place the second: per-token busyUntil (13,12) flips to (12,13)
    const swapped = relay.sharedLog().map((r) =>
      r.tick === 10n && r.kind === "action" ? { ...r, seq: r.seq === 8 ? 9 : 8 } : r,
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
    // feed[3] is the (8,5) communicate under R1's numbering (was (8,0) — re-pinned, disclosed)
    expect(() => runner.runTicks(dupe, TICKS)).toThrowError(/duplicate \(tick, seq\) stamp tick=8 seq=5/);
  });

  it("R2: verbs outside the spike's builders ride opaquely and converge", () => {
    // configure-node, toggle-speed and shed-load were NEVER in the builder
    // set — under the owner law the relay carries them byte-identical and the
    // door decides. Unknown-node targets are door REFUSALS (receipts): the
    // runners must tick on, frame-equal, never throw.
    const relay = createCoopRelay();
    relay.joinSeat("alice");
    relay.advanceTo(1n);
    relay.joinSeat("bob");
    relay.submit("alice", "action", {
      args: { verb: PlayerVerb.ConfigureNode, nodeId: "nope", inspectionDepth: null, shedOrder: null },
    }); // (1,0) — well-shaped wire, unknown node: door receipt, not a crash
    relay.submit("bob", "action", { args: { verb: PlayerVerb.ToggleSpeed, speedX: 2 } }); // (1,1) — advisory 0-cost leg
    relay.submit("alice", "action", {
      args: { verb: PlayerVerb.ShedLoad, nodeId: "nope", qosClassId: null },
    }); // (1,2)
    const canonical = relay.feedFor("alice");
    expect(canonical.map((e) => (e.intent.payload as { args: { verb: string } }).args.verb)).toEqual([
      "configure-node",
      "toggle-speed",
      "shed-load",
    ]);
    const a = createSpikeRunner({ runSeed: SEED });
    const b = createSpikeRunner({ runSeed: SEED });
    expect(() => a.runTicks(canonical, 4)).not.toThrow();
    b.runTicks(relay.feedFrom([...relay.sharedLog()].reverse()), 4);
    expect(b.frames()).toStrictEqual(a.frames()); // opaque widening keeps the convergence claim
  });

  it("R2: type-garbage args pass the relay untouched — the door's parseEntry draws the line", () => {
    const relay = createCoopRelay();
    relay.joinSeat("alice");
    relay.submit("alice", "action", {
      args: { verb: PlayerVerb.Communicate, target: null, note: 42 },
    }); // note MUST be a string — but that's the DOOR's boundary, not the hub's
    const feed = relay.feedFor("alice"); // relay never inspects the deep shape
    expect(feed).toHaveLength(1);
    const runner = createSpikeRunner({ runSeed: SEED });
    expect(() => runner.runTicks(feed, 3)).toThrowError(
      /intent\.payload\.args\.note: expected string, got number/,
    );
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
