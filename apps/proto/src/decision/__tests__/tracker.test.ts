/**
 * tracker.ts — the repo's first markedDecision budget producer, tested against
 * a FRESH BudgetManager (the port design in action). The headlines: the ≤3 cap
 * holds, refusals surface as an honest overflow while the manager's cluster
 * ledger accumulates, consumption releases + blacklists, supersession releases
 * before admit (no self-jam), and no decision priority can ever preempt.
 */
import { describe, expect, it } from "vitest";
import { BudgetManager, KLAXON_PRIORITY, BUDGET_CAPS } from "../../render/budget";
import {
  DECISION_CLUSTER_REGION,
  DecisionTracker,
  decisionClaimId,
  priorityForRank,
} from "../tracker";
import { forgeFrame, notice } from "./fixtures";

const SURGE_AT = 900_000_000n;

/** One frame that evidences FIVE forks at once (cap is 3 — contest forced). */
function crowdedPair() {
  const prev = forgeFrame({ seq: 1, counters: { served: 5, blockedFalsePositive: 0 } });
  const next = forgeFrame({
    seq: 2,
    tick: 42n,
    counters: { served: 6, bounced: 4, blockedFalsePositive: 1, landed: 3 },
    freeCashMicroUsd: 40_000_000n,
    notices: [
      notice("arrival-surge", SURGE_AT),
      { kind: "intent-refused", laneId: null, atUs: SURGE_AT, detail: "connect: slot-occupied" },
    ],
  });
  return { prev, next };
}

describe("priority law", () => {
  it("every rank maps below KLAXON — refusal-keeps-previous is the only contention outcome", () => {
    for (let rank = 0; rank <= 20; rank++) {
      expect(priorityForRank(rank)).toBeLessThan(KLAXON_PRIORITY);
    }
    expect([priorityForRank(0), priorityForRank(1), priorityForRank(2), priorityForRank(9)]).toStrictEqual([60, 50, 40, 30]);
  });

  it("rank is a parse-fenced non-negative integer", () => {
    expect(() => priorityForRank(-1)).toThrowError(RangeError);
    expect(() => priorityForRank(1.5)).toThrowError(RangeError);
  });
});

describe("claim / refuse / overflow", () => {
  it("five forks contest three slots: top-ranked win, the tail counts honestly", () => {
    const budget = new BudgetManager();
    const tracker = new DecisionTracker(budget);
    const result = tracker.onFrame(crowdedPair());
    expect(result.held).toHaveLength(BUDGET_CAPS.markedDecision);
    expect(result.overflow).toBe(2);
    expect(budget.snapshot().used.markedDecision).toBe(3);
    // held order == ranked order (the rail never re-sorts)
    expect(result.held.map((a) => a.rank)).toStrictEqual([0, 1, 2]);
  });

  it("the refused candidate still grows the +N cluster (budget-side ledger)", () => {
    const budget = new BudgetManager();
    const tracker = new DecisionTracker(budget);
    tracker.onFrame(crowdedPair());
    expect(budget.clusterCount(`markedDecision:${DECISION_CLUSTER_REGION}`)).toBe(2);
  });

  it("claims carry the decision: namespace and per-rank priorities", () => {
    const budget = new BudgetManager();
    const tracker = new DecisionTracker(budget);
    const { held } = tracker.onFrame(crowdedPair());
    const claims = budget.snapshot().holders.filter((h) => h.category === "markedDecision");
    expect(claims.map((c) => c.id)).toStrictEqual(held.map((a) => decisionClaimId(a.id)));
    expect(claims.map((c) => c.priority)).toStrictEqual([60, 50, 40]);
  });

  it("an empty frame holds nothing and overflows nothing", () => {
    const tracker = new DecisionTracker(new BudgetManager());
    const result = tracker.onFrame({
      prev: forgeFrame({ seq: 1 }),
      next: forgeFrame({ seq: 2 }),
    });
    expect(result).toStrictEqual({ held: [], overflow: 0, released: [] });
  });

  it("a re-delivered frame (same seq) is a no-op, not a mass supersession", () => {
    const budget = new BudgetManager();
    const tracker = new DecisionTracker(budget);
    const { prev, next } = crowdedPair();
    const first = tracker.onFrame({ prev, next });
    const again = tracker.onFrame({ prev: next, next });
    expect(again.held).toBe(first.held); // identity: standing view returned
    expect(budget.snapshot().used.markedDecision).toBe(3);
  });
});

describe("consume (acknowledge)", () => {
  it("releases the slot and never re-marks the same fork id", () => {
    const budget = new BudgetManager();
    const tracker = new DecisionTracker(budget);
    const { prev, next } = crowdedPair();
    const first = tracker.onFrame({ prev, next });
    const target = first.held[0]!;
    expect(tracker.acknowledge(target.id)).toBe(true);
    expect(budget.snapshot().used.markedDecision).toBe(2);
    expect(tracker.current.held.map((a) => a.id)).not.toContain(target.id);
    // the overflowed 4th still waits — but the consumed id stays consumed
    const replay = tracker.onFrame({ prev: null, next });
    expect(replay.held.map((a) => a.id)).not.toContain(target.id);
  });

  it("double-ack and stale-ack report false without touching the budget", () => {
    const budget = new BudgetManager();
    const tracker = new DecisionTracker(budget);
    const { prev, next } = crowdedPair();
    const first = tracker.onFrame({ prev, next });
    const target = first.held[0]!;
    tracker.acknowledge(target.id);
    expect(tracker.acknowledge(target.id)).toBe(false);
    expect(tracker.acknowledge("never-existed")).toBe(false);
    expect(budget.snapshot().used.markedDecision).toBe(2);
  });
});

describe("supersede", () => {
  it("a condition that clears releases its claim by name", () => {
    const budget = new BudgetManager();
    const tracker = new DecisionTracker(budget);
    const held = tracker.onFrame(crowdedPair()).held;
    const quiet = tracker.onFrame({
      prev: forgeFrame({ seq: 2, tick: 42n, counters: { served: 6, bounced: 4, blockedFalsePositive: 1, landed: 3 } }),
      next: forgeFrame({ seq: 3, tick: 43n, counters: { served: 6, bounced: 4, blockedFalsePositive: 1, landed: 3 } }),
    });
    expect(quiet.held).toStrictEqual([]);
    expect(quiet.released.map((id) => id).sort()).toStrictEqual(held.map((a) => a.id).sort());
    expect(budget.snapshot().used.markedDecision).toBe(0);
  });

  it("a sustained delta fork re-stamps each frame WITHOUT jamming its own slot", () => {
    const budget = new BudgetManager();
    const tracker = new DecisionTracker(budget);
    let prev = forgeFrame({ seq: 1, counters: { served: 0 } });
    for (let i = 0; i < 5; i++) {
      const next = forgeFrame({
        seq: 2 + i,
        tick: BigInt(10 + i),
        counters: { served: 0 + i + 1, bounced: 3 * (i + 1) },
      });
      const result = tracker.onFrame({ prev, next });
      // exactly one bounce fork lives at a time, newest stamp only
      const bounces = result.held.filter((a) => a.kind === "bounce-fork");
      expect(bounces).toHaveLength(1);
      expect(budget.snapshot().used.markedDecision).toBe(1);
      prev = next;
    }
    // cluster stayed clean: self-supersession never refused anything
    expect(budget.clusterCount(`markedDecision:${DECISION_CLUSTER_REGION}`)).toBe(0);
  });
});

describe("dispose", () => {
  it("frees every claim of the session", () => {
    const budget = new BudgetManager();
    const tracker = new DecisionTracker(budget);
    tracker.onFrame(crowdedPair());
    tracker.dispose();
    expect(budget.snapshot().used.markedDecision).toBe(0);
  });
});
