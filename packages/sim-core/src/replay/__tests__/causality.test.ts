/**
 * Causality trace tests (§4.1 R-14…R-19 "losing run explicable in one
 * sentence", §7.0 cause-stamped-at-creation attribution): ancestor-chain
 * walk, red-herring lane separation, and fail-loud index guards.
 */

import { describe, expect, it } from "vitest";
import type { ArrivalEvent, BouncedEvent, RetryEvent, SimEvent } from "../../types";
import { asCauseId, asEntityId } from "../../types";
import { ReplayError } from "../canonical";
import {
  buildCauseIndex,
  causeRecordsFromEvents,
  oneSentenceExplanation,
  redHerringLane,
  traceContributingFactors,
  type CauseRecord,
} from "../causality";

const C = asCauseId;
const E = asEntityId;

/** Fixture: a retry storm lands one bounce.
 *  arrival(c1) → backoff-retry(c2 ← c1) → re-queue pressure bounce(c3 ← c2)
 *  Two red herrings: an unrelated arrival at the SAME tick as the effect,
 *  and an earlier served event about the SAME unit. */
function stormChain(): CauseRecord[] {
  return [
    { causeId: C("c1"), parentCauseId: null, tick: 3n, kind: "arrival", summary: "spike wave arrives", subject: E("u9") },
    { causeId: C("c2"), parentCauseId: C("c1"), tick: 5n, kind: "retry", summary: "u9 retries after 403", subject: E("u9") },
    { causeId: C("c3"), parentCauseId: C("c2"), tick: 9n, kind: "bounced", summary: "u9 bounces at patience cliff", subject: E("u9") },
    // red herring — same tick as effect, different subject
    { causeId: C("x1"), parentCauseId: null, tick: 9n, kind: "arrival", summary: "unrelated crawler arrives", subject: E("u40") },
    // red herring — same subject, off-chain (served, not an ancestor)
    { causeId: C("x2"), parentCauseId: null, tick: 4n, kind: "served", summary: "u9 served earlier", subject: E("u9") },
  ];
}

describe("traceContributingFactors", () => {
  it("walks causeId links root → effect", () => {
    const index = buildCauseIndex(stormChain());
    const trace = traceContributingFactors(index, C("c3"));
    expect(trace.factors.map((f) => f.causeId)).toEqual([C("c1"), C("c2"), C("c3")]);
    expect(trace.effect.kind).toBe("bounced");
  });

  it("one sentence explains the loss", () => {
    const index = buildCauseIndex(stormChain());
    const trace = traceContributingFactors(index, C("c3"));
    expect(oneSentenceExplanation(trace)).toBe("spike wave arrives → u9 retries after 403 → u9 bounces at patience cliff");
  });

  it("root cause traces to a one-factor chain", () => {
    const index = buildCauseIndex(stormChain());
    const trace = traceContributingFactors(index, C("c1"));
    expect(trace.factors).toHaveLength(1);
  });

  it("red-herring lane stays separate from the explanation", () => {
    const index = buildCauseIndex(stormChain());
    const trace = traceContributingFactors(index, C("c3"));
    const lane = redHerringLane(trace);
    expect(lane.some((l) => l.includes("unrelated crawler") && l.startsWith("[same-tick]"))).toBe(true);
    expect(lane.some((l) => l.includes("served earlier") && l.startsWith("[same-subject]"))).toBe(true);
    // chain members NEVER appear in the red-herring lane
    for (const factor of trace.factors) {
      expect(lane.some((l) => l.includes(`cause ${factor.causeId}`))).toBe(false);
    }
    // and the sentence has no red herring in it
    expect(oneSentenceExplanation(trace)).not.toContain("crawler");
  });

  it("window option sweeps co-tick neighborhood into the lane", () => {
    const index = buildCauseIndex(stormChain());
    const wide = traceContributingFactors(index, C("c3"), { redHerringWindowTicks: 2n });
    const narrow = traceContributingFactors(index, C("c3"));
    expect(wide.redHerrings.length).toBe(narrow.redHerrings.length); // x1 already at tick 9; x2 is subject-lane
    const none = traceContributingFactors(index, C("c1"));
    expect(none.redHerrings.some((r) => r.record.causeId === C("x2"))).toBe(true); // same-subject u9
  });
});

describe("buildCauseIndex guards", () => {
  it("unknown cause fails loud", () => {
    const index = buildCauseIndex(stormChain());
    expect(() => index.get(C("nope"))).toThrow(ReplayError);
  });

  it("conflicting duplicate stamps fail loud (attribution is stamped ONCE)", () => {
    expect(() =>
      buildCauseIndex([
        { causeId: C("d"), parentCauseId: null, tick: 1n, kind: "arrival", summary: "a" },
        { causeId: C("d"), parentCauseId: C("z"), tick: 1n, kind: "arrival", summary: "a" },
      ]),
    ).toThrow(/conflicting records/);
    // identical re-registration is a no-op
    expect(buildCauseIndex([stormChain()[0] as CauseRecord, stormChain()[0] as CauseRecord]).size).toBe(1);
  });

  it("cause cycles are caught, not looped forever", () => {
    const index = buildCauseIndex([
      { causeId: C("a"), parentCauseId: C("b"), tick: 1n, kind: "k", summary: "a" },
      { causeId: C("b"), parentCauseId: C("a"), tick: 2n, kind: "k", summary: "b" },
    ]);
    expect(() => traceContributingFactors(index, C("a"))).toThrow(/cause cycle/);
  });

  it("missing parent reference fails loud", () => {
    const index = buildCauseIndex([{ causeId: C("a"), parentCauseId: C("ghost"), tick: 1n, kind: "k", summary: "a" }]);
    expect(() => traceContributingFactors(index, C("a"))).toThrow(/unknown cause ghost/);
  });
});

describe("causeRecordsFromEvents — the free SimEvent baseline", () => {
  it("adapts events, threads explicit parent links, and separates lanes", () => {
    const arrival: ArrivalEvent = { kind: "arrival", atUs: 0n, tick: 1n, causeId: C("e1"), unitId: E("u1"), envelopeTableId: "spike" };
    const retry: RetryEvent = { kind: "retry", atUs: 0n, tick: 2n, causeId: C("e2"), unitId: E("u1"), retryOf: E("u0") };
    const bounce: BouncedEvent = { kind: "bounced", atUs: 0n, tick: 3n, causeId: C("e3"), unitId: E("u1"), nodeId: E("edge") };
    const decoy: SimEvent = { kind: "checkpoint", atUs: 0n, tick: 3n, causeId: C("e9"), stateHash: "ff" };
    const events = [arrival, retry, bounce, decoy];
    const parents = new Map([
      [C("e2"), C("e1")],
      [C("e3"), C("e2")],
    ]);
    const index = buildCauseIndex(causeRecordsFromEvents(events, parents));
    const trace = traceContributingFactors(index, C("e3"));
    expect(trace.factors.map((f) => f.causeId)).toEqual([C("e1"), C("e2"), C("e3")]);
    expect(redHerringLane(trace).join("\n")).toContain("checkpoint");
    expect(oneSentenceExplanation(trace)).toBe("arrival@1 → retry@2 → bounced@3");
  });
});
