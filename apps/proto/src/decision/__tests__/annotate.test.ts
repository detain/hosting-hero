/**
 * annotate.ts — the §7.6 selection loop under test. Everything is a pure
 * function of (prev, next), so every assertion below is a golden on
 * deterministic inputs: ranking order, score folds, window expiry, evidence
 * gates (crisis-is-not-a-fork), fail-loud producer bugs, and the not-a-hint
 * law (options carry no endorsement).
 */
import { describe, expect, it } from "vitest";
import {
  DECISION_GATES,
  DECISION_SCORE_WEIGHTS,
  DECISION_WINDOWS,
  DecisionError,
  deriveDecisionCandidates,
  parseRefusalDetail,
} from "../annotate";
import { LANE, forgeFrame, notice } from "./fixtures";

const SURGE_AT = 800_000_000n; // 200 ms of sim before "now" → slight decay

function surgeFrame() {
  const prev = forgeFrame({ seq: 1, counters: { served: 10 } });
  const next = forgeFrame({
    seq: 2,
    counters: { served: 12 },
    notices: [notice("arrival-surge", SURGE_AT)],
  });
  return { prev, next };
}

describe("guard clauses", () => {
  it("a re-delivered frame (same seq) is not news → zero candidates", () => {
    const { prev, next } = surgeFrame();
    expect(deriveDecisionCandidates({ prev, next: { ...next, seq: prev.seq } })).toStrictEqual([]);
  });

  it("first frame (prev null) can only fire event-driven kinds", () => {
    const { next } = surgeFrame();
    const found = deriveDecisionCandidates({ prev: null, next });
    expect(found.map((c) => c.kind)).toStrictEqual(["surge-fork"]);
  });

  it("counters running backwards is a producer bug — fail loud by name", () => {
    const prev = forgeFrame({ seq: 1, counters: { served: 10 } });
    const next = forgeFrame({ seq: 2, counters: { served: 9 } });
    expect(() => deriveDecisionCandidates({ prev, next })).toThrowError(
      /decision\[counters-went-backwards\]: served decreased by 1/,
    );
  });
});

describe("surge-fork (§7.6)", () => {
  it("evidenced surge → one frozen annotation with two neutral options", () => {
    const found = deriveDecisionCandidates(surgeFrame());
    expect(found).toHaveLength(1);
    const a = found[0]!;
    expect(a.kind).toBe("surge-fork");
    expect(a.id).toBe(`surge-fork:${LANE}:${SURGE_AT}`);
    expect(a.rank).toBe(0);
    expect(a.options.map((o) => o.id)).toStrictEqual(["hold-posture", "pre-shed"]);
    expect(Object.isFrozen(a)).toBe(true);
    expect(a.window.closesAtUs).toBe(SURGE_AT + DECISION_WINDOWS["surge-fork"]);
    expect(a.explain.inputs.length).toBeGreaterThan(0);
  });

  it("a dead lane is an incident, not a fork (viability gate a)", () => {
    const prev = forgeFrame({ seq: 1 });
    // 0.049, not 0.05: Q16.16 round-trips 0.05 to 0.050003…, which is > the
    // dead floor — the gate reads the PARSED fixed value, faithfully.
    const next = forgeFrame({
      seq: 2,
      health: 0.049,
      notices: [notice("arrival-surge", SURGE_AT)],
    });
    expect(deriveDecisionCandidates({ prev, next })).toStrictEqual([]);
  });

  it("an expired window drops the candidate entirely (rule b)", () => {
    const prev = forgeFrame({ seq: 1 });
    const next = forgeFrame({
      seq: 2,
      simUs: SURGE_AT + DECISION_WINDOWS["surge-fork"], // exactly closed
      notices: [notice("arrival-surge", SURGE_AT)],
    });
    expect(deriveDecisionCandidates({ prev, next })).toStrictEqual([]);
  });
});

describe("fp-fork / bounce-fork / cash-burn delta gates", () => {
  it("fp needs both the premium AND live serving (a)", () => {
    const prev = forgeFrame({ seq: 1, counters: { served: 10, blockedFalsePositive: 0 } });
    const withServing = forgeFrame({
      seq: 2,
      counters: { served: 11, blockedFalsePositive: 1 },
    });
    expect(deriveDecisionCandidates({ prev, next: withServing }).map((c) => c.kind)).toContain(
      "fp-fork",
    );
    const zeroServed = forgeFrame({
      seq: 2,
      counters: { served: 10, blockedFalsePositive: 1 },
    });
    expect(deriveDecisionCandidates({ prev, next: zeroServed })).toStrictEqual([]);
  });

  it("bounce needs the pattern gate (≥3) and a breathing lane", () => {
    const prev = forgeFrame({ seq: 1, counters: { served: 5 } });
    const two = forgeFrame({ seq: 2, counters: { served: 6, bounced: 2 } });
    expect(deriveDecisionCandidates({ prev, next: two })).toStrictEqual([]);
    const storm = forgeFrame({ seq: 2, counters: { served: 6, bounced: 3 } });
    const found = deriveDecisionCandidates({ prev, next: storm });
    expect(found.map((c) => c.kind)).toStrictEqual(["bounce-fork"]);
    expect(found[0]!.title).toContain("buy headroom");
    const collapsed = forgeFrame({
      seq: 2,
      health: 0.04,
      counters: { served: 6, bounced: 4 },
    });
    expect(deriveDecisionCandidates({ prev, next: collapsed })).toStrictEqual([]);
  });

  it("quiet-collapse variant retitles when served is zero", () => {
    const prev = forgeFrame({ seq: 1 });
    const next = forgeFrame({ seq: 2, counters: { bounced: 9 } });
    const [a] = deriveDecisionCandidates({ prev, next });
    expect(a!.title).toContain("Everything is bouncing");
  });

  it("cash burn is a fork only WITH landings; below the $1 gate it is noise", () => {
    const prev = forgeFrame({ seq: 1, freeCashMicroUsd: 50_000_000n });
    const small = forgeFrame({
      seq: 2,
      freeCashMicroUsd: 50_000_000n - (DECISION_GATES.cashBurnMinMicroUsd - 1n),
      counters: { landed: 1 },
    });
    expect(deriveDecisionCandidates({ prev, next: small })).toStrictEqual([]);
    const leak = forgeFrame({ seq: 2, freeCashMicroUsd: 40_000_000n }); // no landings
    expect(deriveDecisionCandidates({ prev, next: leak })).toStrictEqual([]);
    const trade = forgeFrame({
      seq: 2,
      freeCashMicroUsd: 40_000_000n,
      counters: { landed: 2 },
    });
    const found = deriveDecisionCandidates({ prev, next: trade });
    expect(found.map((c) => c.kind)).toStrictEqual(["cash-burn"]);
  });
});

describe("door-refusal fork", () => {
  it("parses the receipt grammar and forks wait-vs-replan", () => {
    const prev = forgeFrame({ seq: 1 });
    const next = forgeFrame({
      seq: 2,
      simUs: SURGE_AT,
      notices: [{ kind: "intent-refused", laneId: null, atUs: SURGE_AT, detail: "connect: slot-occupied" }],
    });
    const [a] = deriveDecisionCandidates({ prev, next });
    expect(a!.kind).toBe("door-refusal");
    expect(a!.subjectId).toBe("board");
    expect(a!.id).toBe("door-refusal:board:800000000");
    expect(a!.signals.resourceReady).toBe(1);
  });

  it("hands-exhausted discounts the resource signal (rule c, observed proxy)", () => {
    const prev = forgeFrame({ seq: 1 });
    const next = forgeFrame({
      seq: 2,
      notices: [{ kind: "intent-refused", laneId: null, atUs: 990_000_000n, detail: "place: hands-exhausted" }],
    });
    const [a] = deriveDecisionCandidates({ prev, next });
    expect(a!.signals.resourceReady).toBe(DECISION_GATES.resourceDiscount);
  });

  it("stamped-in-future resolves itself — the seam says nothing", () => {
    const prev = forgeFrame({ seq: 1 });
    const next = forgeFrame({
      seq: 2,
      notices: [{ kind: "intent-refused", laneId: null, atUs: 990_000_000n, detail: "shed: stamped-in-future" }],
    });
    expect(deriveDecisionCandidates({ prev, next })).toStrictEqual([]);
  });

  it("a malformed receipt throws the decision family, naming the string", () => {
    expect(() => parseRefusalDetail("garbage")).toThrowError(
      /decision\[bad-refusal-detail\]: "garbage" is not "<verb>: <reason>"/,
    );
    expect(() => parseRefusalDetail("place: ")).toThrowError(/empty verb or reason/);
    expect(parseRefusalDetail("toggle-speed: bad-speed")).toStrictEqual({
      verb: "toggle-speed",
      reason: "bad-speed",
    });
  });

  it("hands-blocked discounts EVERY kind in the frame, not just the refusal", () => {
    const prev = forgeFrame({ seq: 1 });
    const next = forgeFrame({
      seq: 2,
      notices: [
        notice("arrival-surge", 990_000_000n),
        { kind: "intent-refused", laneId: null, atUs: 990_000_000n, detail: "place: hands-exhausted" },
      ],
    });
    const surge = deriveDecisionCandidates({ prev, next }).find((c) => c.kind === "surge-fork");
    expect(surge!.signals.resourceReady).toBe(DECISION_GATES.resourceDiscount);
  });
});

describe("ranking goldens", () => {
  it("freshly-opened delta forks tie at score 0.5 and order by code-unit id", () => {
    const prev = forgeFrame({ seq: 1, counters: { served: 5, blockedFalsePositive: 0 } });
    const next = forgeFrame({
      seq: 2,
      tick: 77n,
      counters: { served: 6, bounced: 4, blockedFalsePositive: 2, landed: 3 },
      freeCashMicroUsd: 40_000_000n,
    });
    // prev cash: forgeFrame default 50M; next has fp, bounce and cash forks.
    const found = deriveDecisionCandidates({ prev, next });
    expect(found.map((c) => c.kind)).toStrictEqual(["bounce-fork", "cash-burn", "fp-fork"]);
    for (const c of found) expect(c.signals.score).toBeCloseTo(0.5, 12);
    expect(found.map((c) => c.rank)).toStrictEqual([0, 1, 2]);
  });

  it("closing pressure lifts an older event fork over fresh delta forks", () => {
    const prev = forgeFrame({ seq: 1, counters: { served: 5, blockedFalsePositive: 0 } });
    // surge window is 300 s; opened 150 s of sim ago → pressure exactly 0.5.
    const openedAgo = 850_000_000n;
    const next = forgeFrame({
      seq: 2,
      tick: 77n,
      simUs: 1_000_000_000n,
      counters: { served: 6, blockedFalsePositive: 1 },
      notices: [notice("arrival-surge", openedAgo)],
    });
    const found = deriveDecisionCandidates({ prev, next });
    const surge = found.find((c) => c.kind === "surge-fork")!;
    const fp = found.find((c) => c.kind === "fp-fork")!;
    expect(surge.signals.closingPressure).toBeCloseTo(0.5, 12);
    expect(surge.signals.score).toBeGreaterThan(fp.signals.score);
    expect(found[0]!.kind).toBe("surge-fork");
  });

  it("the score fold is exactly the weights (§7.6 a/b/c made arithmetic)", () => {
    const found = deriveDecisionCandidates(surgeFrame());
    const a = found[0]!;
    const expected =
      DECISION_SCORE_WEIGHTS.closing * a.signals.closingPressure +
      DECISION_SCORE_WEIGHTS.viability * a.signals.viabilityEvidence +
      DECISION_SCORE_WEIGHTS.resource * a.signals.resourceReady;
    expect(a.signals.score).toBeCloseTo(expected, 15);
  });
});

describe("not-a-hint law", () => {
  it("no option label reads as a recommendation", () => {
    const frames = [surgeFrame(), { prev: forgeFrame({ seq: 1 }), next: forgeFrame({ seq: 2, counters: { bounced: 5 } }) }];
    const banned = /\b(recommend|should|best|prefer|correct)\b/i;
    for (const frame of frames) {
      for (const a of deriveDecisionCandidates(frame)) {
        expect(a.options.length).toBeGreaterThanOrEqual(2);
        for (const option of a.options) expect(option.label).not.toMatch(banned);
      }
    }
  });
});
