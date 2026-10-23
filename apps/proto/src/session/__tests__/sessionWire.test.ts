/**
 * sessionWire — the slice-(d) SESSION riders driven END TO END through the
 * real codec, the in-process worker twin (FakeWorkerLike) and the money +
 * attribution folds they earn.
 *
 * What is pinned (laws, not numbers — the deck's upkeep ladder is PROVISIONAL
 * so no digest literals ride here):
 *  · the session boot survives the wire (ready, zero faults, five-wave colo
 *    corpusPlan on the live runner — the riders are REAL, not decoration);
 *  · TWIN determinism: two identical boots are byte-identical per frame
 *    (canonicalDigest(encodeProjection) per @ref{simCoreRunner.test.ts});
 *    a seed-divergence control proves the witness is not vacuous;
 *  · PER-NODE ATTRIBUTION (the lane-blind gap fix): every per-node cell
 *    publishes on a corpus boot, Σoutcome cells == projection counters
 *    EXACTLY every frame, Σentry >= Σoutcomes (in-flight honesty), and the
 *    lane/ingress-1 aggregates keep their keys (additive law — nothing moved);
 *  · the MONEY lane is live: cash leaves the opening draft, dunning/invoice
 *    economy-notice riders fill the tape, company::reputation carries a REAL
 *    Fixed value (the mission's "not '?'" demand);
 *  · the door is open from tick 1 on a hands-3 rail: four communicate verbs in
 *    one drain pay 3 and refuse the 4th hands-exhausted (§7.5 as authored);
 *    the seeded board proves itself twice over — a connect verb collides on
 *    edge-exists when replayed, and the seeded trust edge disconnects once
 *    then answers unknown-edge (it really was there, really is gone);
 *  · the maze dial flips through the door (mazeArmed 1 → pass-through 0 →
 *    inspect 1);
 *  · halt is law: after client.halt() the pump delivers nothing and the
 *    runner witness is gone; a semantic board fault (off-roster endpoint)
 *    faults the boot through the shared channel instead of crashing.
 */
// @vitest-environment node
import { describe, expect, it } from "vitest";
import { canonicalDigest } from "@hh/sim-core/replay";
import { asEntityId, observedKey } from "@hh/sim-core/types";
import { encodeProjection, type SimProjection } from "../../shared/protocol";
import { FakeWorkerLike } from "../../bridge/fakeWorker";
import { SimClient } from "../../bridge/simClient";
import { SimCoreRunner } from "../../runner/index";
import { productionBootRules } from "../../runner/productionRules";
import { workerCorpusAuthority } from "../../shared/corpusHost";
import {
  SESSION_BUILD,
  SESSION_CORPUS,
  SESSION_DOOR_VERBS,
  SESSION_SEED,
  entryAttributionSum,
  outcomeAttributionSum,
  parseMoneyTape,
  readBoardHealth,
  type MoneyTape,
} from "../sessionModel";

const OPENING_FREE = 25_000_000_000n;

function harness(withDeck = true) {
  const fake = new FakeWorkerLike();
  const received: SimProjection[] = [];
  const faults: string[] = [];
  let ready = false;
  const client = new SimClient(fake, {
    onReady: () => {
      ready = true;
    },
    onProjection: (p) => received.push(p),
    onFault: (m) => faults.push(m),
  });
  // withDeck=false keeps the watch-the-door book OUT of the drain, so rule
  // firings can never compete for hands in the door-law witnesses.
  client.boot(SESSION_SEED, 1, "sim-core", SESSION_CORPUS, SESSION_BUILD, withDeck ? productionBootRules() : undefined);
  return { fake, client, received, faults, isReady: () => ready };
}

const verb = (id: string) => SESSION_DOOR_VERBS.find((v) => v.id === id)!;

function countersSum(frame: SimProjection): number {
  return frame.counters.served + frame.counters.bounced + frame.counters.blockedFalsePositive + frame.counters.landed;
}

function digestFrames(frames: readonly SimProjection[]): string[] {
  return frames.map((f) => canonicalDigest(encodeProjection(f)));
}

describe("session boot through the wire", () => {
  it("riders survive the codec and mint a five-wave colo corpus runner", () => {
    const h = harness();
    h.fake.pump(1);
    expect(h.isReady()).toBe(true);
    expect(h.faults).toEqual([]);
    const runner = h.fake.lastRunner as SimCoreRunner;
    expect(runner).toBeInstanceOf(SimCoreRunner);
    const plan = runner.corpusPlan();
    expect(plan).not.toBeNull();
    expect(plan!.map((row) => row.wave)).toEqual([1, 2, 3, 4, 5]);
    expect(h.received[0]!.tick).toBe(1n);
  });

  it("a semantic board fault (off-roster endpoint) boots to the fault channel, never a crash", () => {
    const fake = new FakeWorkerLike();
    const faults: string[] = [];
    const client = new SimClient(fake, { onFault: (m) => faults.push(m) });
    client.boot(SESSION_SEED, 1, "sim-core", SESSION_CORPUS, {
      hands: 2,
      board: [{ relation: "data", from: "edge", to: "ghost-node" }],
    });
    fake.pump(2);
    expect(faults).toHaveLength(1);
    expect(fake.lastRunner).toBeNull();
  });
});

describe("per-node attribution (the lane-blind gap, corpus-gated)", () => {
  it("every attribution cell publishes and the conservation laws hold EVERY frame", () => {
    const h = harness();
    h.fake.pump(120);
    expect(h.received).toHaveLength(120);
    for (const frame of h.received) {
      const rows = readBoardHealth(frame);
      expect(rows).toHaveLength(6);
      for (const row of rows.filter((r) => !r.id.includes("/"))) {
        expect(row.entryArrivalsTotal, `entry cell ${row.id}`).not.toBeNull();
        for (const out of [row.outcomeServedTotal, row.outcomeBouncedTotal, row.outcomeFalsePositiveTotal, row.outcomeLandedTotal]) {
          expect(out, `outcome cell ${row.id}`).not.toBeNull();
        }
      }
      // The two honest buckets carry exactly their one column each (22-cell
      // fixed roster — the writer law in simCoreRunner.attributionWrites):
      const entryUncertain = rows.find((r) => r.id === "entry/unattributed")!;
      const outcomeUncertain = rows.find((r) => r.id === "outcome/unattributed")!;
      expect(entryUncertain.entryArrivalsTotal).not.toBeNull();
      expect(entryUncertain.outcomeServedTotal).toBeNull();
      expect(outcomeUncertain.outcomeBouncedTotal).not.toBeNull();
      expect(outcomeUncertain.entryArrivalsTotal).toBeNull();
      // Σ outcomes == the wire counters, EXACTLY, every frame: same event
      // stream, two readings — the falsifiable core of the fix.
      expect(outcomeAttributionSum(rows)).toBe(countersSum(frame));
      // Σ entries >= Σ outcomes (units still in flight may not have terminated).
      expect(entryAttributionSum(rows)).toBeGreaterThanOrEqual(countersSum(frame));
      // the pre-existing lane aggregates keep their keys (additive law):
      expect(frame.observed.has(observedKey(asEntityId("lane/ingress-1"), "ratePerMin"))).toBe(true);
      expect(frame.observed.has(observedKey(asEntityId("lane/ingress-1"), "reentryRatePerMin"))).toBe(true);
      expect(frame.observed.has(observedKey(asEntityId("lane/ingress-1"), "health"))).toBe(true);
    }
    const last = h.received[119]!;
    expect(countersSum(last)).toBeGreaterThan(0); // non-vacuity
    expect(entryAttributionSum(readBoardHealth(last))).toBeGreaterThanOrEqual(countersSum(last));
  });

  it("twin boots are byte-identical per frame; a different seed is not (control)", () => {
    const a = harness();
    const b = harness();
    a.fake.pump(60);
    b.fake.pump(60);
    expect(digestFrames(a.received)).toEqual(digestFrames(b.received));
    // Seed-divergence control at the runner altitude (the fake pins seed 1):
    const authority = workerCorpusAuthority("colo");
    const corpus = { authority, waves: [1, 2, 3, 4, 5], tableId: "g1-colo-first-quarter" };
    const r904 = new SimCoreRunner({ seed: 904, corpus, build: SESSION_BUILD });
    const r33 = new SimCoreRunner({ seed: 33, corpus, build: SESSION_BUILD });
    const finals: SimProjection[] = [];
    for (let i = 0; i < 60; i += 1) {
      finals.push(r904.headlessStep(100), r33.headlessStep(100));
    }
    expect(canonicalDigest(encodeProjection(finals[118]!))).not.toBe(
      canonicalDigest(encodeProjection(finals[119]!)),
    );
  });
});

describe("money lane legibility in-session", () => {
  it("cash leaves the opening draft, invoice+dunning riders fill the tape, reputation is REAL", () => {
    const h = harness();
    h.fake.pump(120);
    const last = h.received[119]!;
    expect(last.freeCashMicroUsd).not.toBe(OPENING_FREE);
    let tape: MoneyTape = parseMoneyTape([]);
    for (const frame of h.received) tape = parseMoneyTape(frame.notices, tape);
    expect(tape.counts["invoice-issued"] ?? 0).toBeGreaterThan(0);
    expect(tape.counts["dunning-stage"] ?? 0).toBeGreaterThan(0);
    const rep = last.observed.get(observedKey(asEntityId("company"), "reputation"));
    expect(typeof rep?.value).toBe("bigint"); // a real Fixed value crossed the wire — not "?"
  });
});

describe("the intent door is open from tick 1 (hands rail of 3)", () => {
  it("four communicate verbs in one drain: three pay, the fourth refuses hands-exhausted", () => {
    const h = harness(false);
    h.fake.pump(1);
    for (let i = 0; i < 4; i += 1) h.client.sendPlayerVerb(verb("communicate").args);
    h.fake.pump(3);
    const executed = h.received.flatMap((f) => f.notices).filter((nt) => nt.kind === "intent-executed" && nt.detail?.startsWith("communicate"));
    const refused = h.received.flatMap((f) => f.notices).filter((nt) => nt.kind === "intent-refused" && nt.detail?.includes("hands-exhausted"));
    expect(executed).toHaveLength(3);
    expect(refused).toHaveLength(1);
  });

  it("the seeded board answers verbs: connect-ports mints then collides; disconnect pulls then forgets", () => {
    const h = harness(false);
    h.fake.pump(1);
    h.client.sendPlayerVerb(verb("connect-deep").args);
    h.fake.pump(4);
    h.client.sendPlayerVerb(verb("connect-deep").args); // same derived id — the door's own grammar
    h.fake.pump(4);
    let refused = h.received.flatMap((f) => f.notices).filter((nt) => nt.kind === "intent-refused" && nt.detail?.includes("edge-exists"));
    expect(refused).toHaveLength(1);
    h.client.sendPlayerVerb(verb("disconnect-trust").args);
    h.fake.pump(4);
    h.client.sendPlayerVerb(verb("disconnect-trust").args); // already gone
    h.fake.pump(4);
    const notices = h.received.flatMap((f) => f.notices);
    refused = notices.filter((nt) => nt.kind === "intent-refused" && nt.detail?.includes("unknown-edge"));
    expect(refused).toHaveLength(1);
    const executedPulls = notices.filter((nt) => nt.kind === "intent-executed" && nt.detail?.startsWith("disconnect-drain"));
    expect(executedPulls.length).toBeGreaterThanOrEqual(1);
  });

  it("the maze dial flips through the door: armed at boot, pass-through disarms, inspect re-arms", () => {
    const h = harness(false);
    const armedOf = () => h.received[h.received.length - 1]!.observed.get(observedKey(asEntityId("lane/ingress-1"), "mazeArmed"))?.value;
    h.fake.pump(2);
    expect(armedOf()).toBe(1);
    h.client.sendPlayerVerb(verb("configure-passthrough").args);
    h.fake.pump(3);
    expect(armedOf()).toBe(0);
    h.client.sendPlayerVerb(verb("configure-inspect").args);
    h.fake.pump(3);
    expect(armedOf()).toBe(1);
  });
});

describe("terminal + halt discipline", () => {
  it("after client.halt the pump delivers nothing and the runner witness is gone", () => {
    const h = harness();
    h.fake.pump(5);
    expect(h.fake.lastRunner).not.toBeNull();
    h.client.halt();
    h.fake.pump(3);
    expect(h.received).toHaveLength(5);
    expect(h.fake.lastRunner).toBeNull();
  });
});
