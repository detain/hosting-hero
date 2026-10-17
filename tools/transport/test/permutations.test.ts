/**
 * test/permutations.test.ts — hostile delivery order must NOT reach the sim.
 *
 * Two clients + independent spike runners over the port, driven under several
 * permutation seeds: every seat's door feed (post-normalization) and every
 * runner frame digestState must agree with the unhostile baseline, the
 * coopTimeline digests must agree with the authority, a ×100 rebuild must
 * collapse to ONE terminal digest, and the seed-33 control proves the
 * comparison has teeth (a different runSeed really does move the digest).
 * The log-budget arm rides the same machinery: cap fires, standing log stays
 * byte-stable across the refusal storm.
 */

import { describe, expect, it } from "vitest";
import { asRunSeed } from "@hh/sim-core/types";
import { digestCoopTimeline } from "@hh/sim-core/replay";
import { createSpikeRunner } from "relay-tools";
import { makeInMemoryWiring, talkAction } from "./conformance.ts";
import type { TransportWiring } from "./conformance.ts";

const SEEDS = [1n, 7n, 42n, 1234n] as const;
const TICKS = 14; // submits land on ticks 1..12; runners cover the window

function drive(w: TransportWiring): void {
  w.alice.join();
  w.bob.join();
  w.settle();
  for (let t = 1; t <= 12; t += 1) {
    w.relay.advanceTo(BigInt(t));
    (t % 2 === 0 ? w.bob : w.alice).submit("action", talkAction(`beat-${t}`));
    w.settle();
  }
}

function runnerFrames(feed: ReturnType<TransportWiring["alice"]["feedToDoor"]>, runSeed: bigint): readonly string[] {
  const runner = createSpikeRunner({ runSeed: asRunSeed(runSeed) });
  runner.runTicks(feed, TICKS);
  return runner.frames();
}

describe("permutation-hardened convergence", () => {
  it("every seat's door feed normalizes to the relay-stamped order under all four seeds", () => {
    for (const seed of SEEDS) {
      const w = makeInMemoryWiring({ net: { permutationSeed: seed } });
      drive(w);
      const expected = w.relay.sharedLog().filter((r) => r.kind === "action").map((r) => `${r.tick}:${r.seq}`);
      expect(w.alice.feedToDoor().map((i) => `${i.tick}:${i.intent.seq}`), `seed ${seed}`).toEqual(expected);
      expect(w.bob.feedToDoor().map((i) => `${i.tick}:${i.intent.seq}`), `seed ${seed}`).toEqual(expected);
    }
  });

  it("per-frame digestState equality across seats — and vs the unhostile baseline", () => {
    const baseline = makeInMemoryWiring();
    drive(baseline);
    const baselineFrames = runnerFrames(baseline.alice.feedToDoor(), 904n);
    for (const seed of SEEDS) {
      const w = makeInMemoryWiring({ net: { permutationSeed: seed } });
      drive(w);
      const framesA = runnerFrames(w.alice.feedToDoor(), 904n);
      const framesB = runnerFrames(w.bob.feedToDoor(), 904n);
      expect(framesB, `seed ${seed}`).toStrictEqual(framesA);
      expect(framesA, `seed ${seed}`).toStrictEqual(baselineFrames);
    }
  });

  it("digestCoopTimeline: both seats and the authority agree under permutation", () => {
    for (const seed of SEEDS) {
      const w = makeInMemoryWiring({ net: { permutationSeed: seed } });
      drive(w);
      const authority = w.relay.timelineDigest();
      expect(digestCoopTimeline(w.alice.records())).toBe(authority);
      expect(digestCoopTimeline(w.bob.records())).toBe(authority);
    }
  });

  it("×100 rebuild at seed 42 collapses to ONE terminal digest (determinism gate)", () => {
    const finals = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      const w = makeInMemoryWiring({ net: { permutationSeed: 42n } });
      drive(w);
      const frames = runnerFrames(w.alice.feedToDoor(), 904n);
      finals.add(frames[TICKS - 1] as string);
    }
    expect(finals.size).toBe(1);
  });

  it("seed-33 control: a different runSeed moves the digest (the comparison has teeth)", () => {
    const w = makeInMemoryWiring({ net: { permutationSeed: 7n } });
    drive(w);
    const feed = w.alice.feedToDoor();
    const ninety = runnerFrames(feed, 904n);
    const thirtyThree = runnerFrames(feed, 33n);
    expect(thirtyThree[TICKS - 1]).not.toBe(ninety[TICKS - 1]);
  });

  it("log-budget cap fires through the wire; the standing log stays byte-stable across the storm", () => {
    const w = makeInMemoryWiring({ logBudget: 5, net: { permutationSeed: 99n } });
    w.alice.join();
    w.bob.join();
    w.settle();
    for (let t = 1; t <= 5; t += 1) {
      w.relay.advanceTo(BigInt(t));
      w.bob.submit("action", talkAction(`within-${t}`));
      w.settle();
    }
    const digestBefore = w.relay.timelineDigest();
    const stampsBefore = w.relay.sharedLog().map((r) => `${r.tick}:${r.seq}`).join("|");
    for (let t = 6; t <= 15; t += 1) {
      w.relay.advanceTo(BigInt(t));
      w.bob.submit("action", talkAction(`over-${t}`));
      w.settle();
    }
    expect(w.relay.sharedLog()).toHaveLength(5);
    expect(w.relay.timelineDigest()).toBe(digestBefore);
    expect(w.relay.sharedLog().map((r) => `${r.tick}:${r.seq}`).join("|")).toBe(stampsBefore);
    const budgetFaults = w.bob.faults().filter((f) => /transport\[log-budget\]/.test(f.cause));
    expect(budgetFaults).toHaveLength(10); // every over-cap submit answered with a verdict
    expect(w.alice.faults()).toHaveLength(0); // the room watched nothing
  });
});
