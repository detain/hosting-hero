/**
 * MRR backlog + committedOut writers (audit g15 #2 / g18 TP3 — the two
 * buckets netPosition honored while NOTHING wrote them are now LIVE).
 *
 * The conservation law pinned throughout is §6.13's: a signed deal's promise
 * enters `backlog` EXACTLY ONCE, MOVES to accountsReceivable at invoice issue
 * (never both sides of the same dollar at once), and the un-invoiced rest
 * UNWINDS at death. `committedOut` mirrors the vendor book as a declarative
 * target — re-declared, not event-replayed.
 */

import { describe, expect, it } from "vitest";

import {
  asCauseId,
  asMoney,
  type BucketId,
  type Contract,
  type EntityId,
  type MoneyBuckets,
} from "../../types.js";
import { BUCKET_IDS, netPosition } from "../buckets.js";
import { defaultEconomyConfig, type EconomyConfig } from "../config.js";
import { runEconomyTick, type EconomyTickIn, type EconomyTickOut, type VendorCommitment } from "../tick.js";
import { registerContractEconomy, type EconomyState } from "../state.js";
import { DAY, MONTH, SEED, TAGS, contractOf, ctxAt, stateWithCash } from "./helpers.js";

/* Deterministic money paths (house pattern from tick.test.ts): churn off,
 * cards always pay — this file owns lifecycle, not dice. */
function tickCfg(patch: (cfg: EconomyConfig) => EconomyConfig = (c) => c): EconomyConfig {
  const base: EconomyConfig = {
    ...defaultEconomyConfig(),
    churn: { ...defaultEconomyConfig().churn, monthlyLogoChurnBpsByBundle: {}, fallbackMonthlyBps: 0n },
    dunning: { ...defaultEconomyConfig().dunning, cardFailureBps: 0n },
  };
  return patch(base);
}

const cfg = tickCfg();

function harness(contracts: readonly Contract[]): { map: Map<EntityId, Contract>; state: EconomyState } {
  let s = stateWithCash(500_000_000n);
  for (const c of contracts) {
    s = registerContractEconomy(
      s,
      { contract: c, atBusinessMin: 0, clauseRefs: [], grandfather: null, revenueTags: TAGS, commitmentBps: 9990n },
      cfg,
    );
  }
  return { map: new Map(contracts.map((c) => [c.id, c])), state: s };
}

function tick(
  prior: EconomyState,
  minute: number,
  contracts: ReadonlyMap<EntityId, Contract>,
  over: Partial<Pick<EconomyTickIn, "renewalDecisions" | "vendorCommits">> = {},
): EconomyTickOut {
  return runEconomyTick({
    context: ctxAt(minute, BigInt(Math.floor(minute / 60))),
    runSeed: SEED,
    contracts,
    prior,
    cfg,
    ...over,
  });
}

const lapse = (id: EntityId) => [{
  contractId: id,
  decision: { choice: "lapse" as const, causeId: asCauseId(`test:lapse:${id}`), escalatedMrc: null },
}];

/** Entries must sum to the final cash, and promise buckets never go negative. */
function assertCashFollowsEntries(out: EconomyTickOut, start: MoneyBuckets): void {
  const totals = new Map<BucketId, bigint>(BUCKET_IDS.map((b) => [b, 0n]));
  for (const e of out.entries) {
    for (const [b, v] of Object.entries(e.delta) as [BucketId, bigint][]) {
      totals.set(b, (totals.get(b) ?? 0n) + v);
    }
  }
  for (const b of BUCKET_IDS) {
    expect(out.state.cash[b]).toBe(asMoney(start[b] + (totals.get(b) ?? 0n)));
    expect(out.state.cash[b]).toBeGreaterThanOrEqual(0n);
  }
}

describe("pending deals and the backlog bucket (§6.13)", () => {
  // Signed at minute 0, service starts at MONTH, 2-month term, no TCV stated.
  const BIG = contractOf("BIG", { termStartMin: MONTH, termEndMin: 3 * MONTH });

  it("signing early parks the deal in `pending` with a TCV-shaped backlog seed", () => {
    const { state } = harness([BIG]);
    const econ = state.contractEconomy.get(BIG.id)!;
    expect(econ.phase).toBe("pending");
    // tcv 0 ⇒ documented estimate mrc × whole term months = 100M × 2.
    expect(econ.backlogRemaining).toBe(asMoney(200_000_000n));
    expect(econ.backlogPostedAtMin).toBe(null);
  });

  it("a stated TCV is the backlog amount, full stop", () => {
    const GPU = contractOf("GPU", {
      termStartMin: MONTH,
      termEndMin: 13 * MONTH,
      tcvMicroUsd: asMoney(2_000_000_000n),
    });
    const { state } = harness([GPU]);
    expect(state.contractEconomy.get(GPU.id)!.backlogRemaining).toBe(asMoney(2_000_000_000n));
  });

  it("the first tick posts the sign-credit EXACTLY ONCE and lifts netPosition", () => {
    const { map, state } = harness([BIG]);
    const before = netPosition(state.cash);
    const t1 = tick(state, DAY, map);
    expect(t1.state.cash.backlog).toBe(asMoney(200_000_000n));
    expect(netPosition(t1.state.cash)).toBe(before + 200_000_000n);
    assertCashFollowsEntries(t1, state.cash);
    const sign = t1.entries.find((e) => e.causeId === "economy:backlog-sign:BIG");
    expect(sign).toBeDefined();
    expect(sign!.delta).toEqual({ backlog: 200_000_000n });

    // Second tick: stamped ⇒ no re-post (the once-law).
    const t2 = tick(t1.state, 2 * DAY, map);
    expect(t2.state.cash.backlog).toBe(asMoney(200_000_000n));
    expect(t2.entries.some((e) => e.causeId.startsWith("economy:backlog-sign"))).toBe(false);
    expect(t2.state.contractEconomy.get(BIG.id)!.backlogPostedAtMin).toBe(DAY);
  });

  it("pending bills nothing, and activates on service-start without moving money", () => {
    const { map, state } = harness([BIG]);
    const t1 = tick(state, DAY, map);
    expect(t1.notices.some((n) => n.kind === "invoice-issued")).toBe(false);
    expect(t1.state.contractEconomy.get(BIG.id)!.phase).toBe("pending");

    const t2 = tick(t1.state, MONTH, map);
    expect(t2.notices.some((n) => n.kind === "contract-activated")).toBe(true);
    // (cycle-0 invoice also fires THIS tick — the backlog→AR test below owns
    // that money; activation itself posts its own zero-money notice only.)
    expect(t2.state.contractEconomy.get(BIG.id)!.phase).toBe("active");
  });

  it("at issue, backlog MOVES into AR in one entry — never re-appears", () => {
    // TIN: 150M TCV seed can only cover 1.5 invoices — the partial drain and
    // the post-zero single-bucket shape both land inside one lifecycle.
    const TIN = contractOf("TIN", {
      termStartMin: MONTH,
      termEndMin: 5 * MONTH,
      tcvMicroUsd: asMoney(150_000_000n),
    });
    const { map, state } = harness([TIN]);
    let s = tick(state, DAY, map).state; // backlog 150M, pending
    expect(s.cash.backlog).toBe(asMoney(150_000_000n));

    const t2 = tick(s, MONTH, map); // activate + cycle 0
    const issue0 = t2.entries.find((e) => e.causeId === "economy:invoice:TIN:0")!;
    expect(issue0.delta).toEqual({ accountsReceivable: 100_000_000n, backlog: -100_000_000n });
    expect(t2.state.cash.backlog).toBe(asMoney(50_000_000n));
    assertCashFollowsEntries(t2, s.cash);
    s = t2.state;

    const t3 = tick(s, 2 * MONTH, map); // cycle 1: partial drain 50M only
    const issue1 = t3.entries.find((e) => e.causeId === "economy:invoice:TIN:1")!;
    expect(issue1.delta).toEqual({ accountsReceivable: 100_000_000n, backlog: -50_000_000n });
    expect(t3.state.cash.backlog).toBe(asMoney(0n));
    assertCashFollowsEntries(t3, s.cash);
    s = t3.state;

    const t4 = tick(s, 3 * MONTH, map); // cycle 2: backlog is empty ⇒ OLD shape
    const issue2 = t4.entries.find((e) => e.causeId === "economy:invoice:TIN:2")!;
    expect(Object.keys(issue2.delta)).toEqual(["accountsReceivable"]);
    assertCashFollowsEntries(t4, s.cash);
  });

  it("cliff lapse UNWINDS the un-invoiced remainder — the promise leaves with the deal", () => {
    const LONG = contractOf("LONG", {
      termStartMin: MONTH,
      termEndMin: 3 * MONTH,
      tcvMicroUsd: asMoney(1_000_000_000n),
    });
    const { map, state } = harness([LONG]);
    let s = tick(state, DAY, map).state; // backlog 1B
    s = tick(s, MONTH, map).state; // cycle 0: −100M ⇒ 900M
    expect(s.cash.backlog).toBe(asMoney(900_000_000n));
    s = tick(s, 2 * MONTH, map).state; // cycle 1: −100M ⇒ 800M
    expect(s.cash.backlog).toBe(asMoney(800_000_000n));

    const lapseTick = tick(s, 3 * MONTH, map, { renewalDecisions: lapse(LONG.id) });
    expect(lapseTick.notices.some((n) => n.kind === "cliff-lapsed")).toBe(true);
    expect(lapseTick.state.contractEconomy.get(LONG.id)!.phase).toBe("terminated");
    expect(lapseTick.state.cash.backlog).toBe(asMoney(0n));
    const unwind = lapseTick.entries.find((e) => e.causeId === "economy:backlog-unwind:LONG");
    expect(unwind).toBeDefined();
    expect(unwind!.delta).toEqual({ backlog: -800_000_000n });
    assertCashFollowsEntries(lapseTick, s.cash);
  });

  it("a dead deal's zero-remaining unwind posts NOTHING (byte-identity for ordinary churn)", () => {
    const A = contractOf("A", { termEndMin: MONTH }); // signed-and-starting, backlog 0
    const { map, state } = harness([A]);
    let s = tick(state, 0, map).state;
    s = tick(s, DAY, map).state;
    const lapseTick = tick(s, MONTH, map, { renewalDecisions: lapse(A.id) });
    expect(lapseTick.state.contractEconomy.get(A.id)!.phase).toBe("terminated");
    expect(lapseTick.entries.some((e) => e.causeId.startsWith("economy:backlog-unwind"))).toBe(false);
    expect(lapseTick.state.cash.backlog).toBe(asMoney(0n));
  });
});

describe("committedOut mirrors the vendor book (§6.12)", () => {
  const commits: readonly VendorCommitment[] = [
    { id: "transit", monthlyMicroUsd: asMoney(50_000_000n), termEndMin: 3 * MONTH },
    { id: "colo", monthlyMicroUsd: asMoney(80_000_000n), termEndMin: Math.floor(1.5 * MONTH) },
  ];

  it("undefined input ⇒ ZERO writes; the bucket stays exactly where it was", () => {
    const { map, state } = harness([]);
    const out = tick(state, DAY, map);
    expect(out.state.cash.committedOut).toBe(asMoney(0n));
    expect(out.state.committedOutTarget).toBe(asMoney(0n));
    expect(out.entries.length).toBe(0);
  });

  it("first declaration posts Σ monthly × whole months left (ceiling)", () => {
    const { map, state } = harness([]);
    const t = tick(state, 0, map, { vendorCommits: commits });
    // transit: 3 × 50M = 150M; colo: 1.5 months ⇒ ceil 2 × 80M = 160M.
    expect(t.state.cash.committedOut).toBe(asMoney(310_000_000n));
    expect(t.state.committedOutTarget).toBe(asMoney(310_000_000n));
    expect(netPosition(t.state.cash)).toBe(netPosition(state.cash) - 310_000_000n);
    assertCashFollowsEntries(t, state.cash);
  });

  it("time burns the promise down: re-declaring the SAME book posts the delta", () => {
    const { map, state } = harness([]);
    let s = tick(state, 0, map, { vendorCommits: commits }).state;
    s = tick(s, MONTH, map, { vendorCommits: commits }).state;
    // at MONTH: transit 2 × 50 = 100M; colo left 0.5 month ⇒ ceil 1 × 80 = 80M.
    expect(s.cash.committedOut).toBe(asMoney(180_000_000n));
    expect(s.committedOutTarget).toBe(asMoney(180_000_000n));
    // Absent input thereafter ⇒ frozen target, no writes.
    const quiet = tick(s, 2 * MONTH, map);
    expect(quiet.state.cash.committedOut).toBe(asMoney(180_000_000n));
    expect(quiet.entries.length).toBe(0);
  });

  it("an expired book posts DOWN to exactly zero — never negative", () => {
    const { map, state } = harness([]);
    let s = tick(state, 0, map, { vendorCommits: commits }).state;
    s = tick(s, 3 * MONTH, map, { vendorCommits: commits }).state;
    expect(s.cash.committedOut).toBe(asMoney(0n)); // both terms ended
    expect(s.committedOutTarget).toBe(asMoney(0n));
  });

  it("poison commitments fail loud at the parse boundary", () => {
    const { map, state } = harness([]);
    expect(() => tick(state, 0, map, { vendorCommits: [{ id: "", monthlyMicroUsd: asMoney(0n), termEndMin: 0 }] })).toThrow(/non-empty string/);
    expect(() => tick(state, 0, map, { vendorCommits: [{ id: "x", monthlyMicroUsd: asMoney(-1n), termEndMin: 0 }] })).toThrow(/>= 0/);
    expect(() => tick(state, 0, map, { vendorCommits: [{ id: "x", monthlyMicroUsd: asMoney(0n), termEndMin: -5 }] })).toThrow(/non-negative integer/);
  });
});

describe("byte-identity belt for hosts that never use the new inputs", () => {
  it("an ordinary signed-and-starting contract posts the old single-bucket AR entries", () => {
    const A = contractOf("A", { termEndMin: 3 * MONTH });
    const { map, state } = harness([A]); // termStart 0 at registration 0 ⇒ active
    expect(state.contractEconomy.get(A.id)!.phase).toBe("active");
    expect(state.contractEconomy.get(A.id)!.backlogRemaining).toBe(asMoney(0n));
    const out = tick(state, 0, map);
    const issued = out.entries.filter((e) => e.causeId.startsWith("economy:invoice:"));
    expect(issued.length).toBe(1);
    expect(Object.keys(issued[0]!.delta)).toEqual(["accountsReceivable"]); // old shape
    expect(out.state.cash.backlog).toBe(asMoney(0n));
    expect(out.state.cash.committedOut).toBe(asMoney(0n));
    assertCashFollowsEntries(out, state.cash);
  });
});
