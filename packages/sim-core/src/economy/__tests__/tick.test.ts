import { describe, expect, it } from "vitest";

import {
  asCauseId,
  asEntityId,
  asMoney,
  asRunSeed,
  type BucketId,
  type Contract,
  type EntityId,
  type RunSeed,
  type SimMinute,
} from "../../types.js";
import { BUCKET_IDS } from "../buckets.js";
import type { InvoiceTerms } from "../billing.js";
import { defaultEconomyConfig, type EconomyConfig } from "../config.js";
import { runEconomyTick, type EconomyTickIn, type EconomyTickOut } from "../tick.js";
import { emptyEconomyState, registerContractEconomy, type EconomyState } from "../state.js";
import { DAY, digest, MONTH, SEED, TAGS, contractOf, ctxAt, stateWithCash } from "./helpers.js";

/* ───────────────────────────── harness ────────────────────────────────── */

function tickCfg(patch: (cfg: EconomyConfig) => EconomyConfig = (c) => c): EconomyConfig {
  // deterministic money paths by default: no voluntary churn, always-pay
  // cards — individual tests re-enable what they probe, so the patch runs
  // AFTER these defaults (patch wins).
  const deterministic: EconomyConfig = {
    ...defaultEconomyConfig(),
    churn: { ...defaultEconomyConfig().churn, monthlyLogoChurnBpsByBundle: {}, fallbackMonthlyBps: 0n },
    dunning: { ...defaultEconomyConfig().dunning, cardFailureBps: 0n },
  };
  return patch(deterministic);
}

function harness(contracts: readonly Contract[], cfg: EconomyConfig, freeStart = 500_000_000n): EconomyState {
  let s = stateWithCash(freeStart);
  for (const c of contracts) {
    s = registerContractEconomy(
      s,
      {
        contract: c,
        atBusinessMin: 0,
        clauseRefs: c.sla.autoRenew ? ["auto-renew"] : [],
        grandfather: null,
        revenueTags: TAGS,
        commitmentBps: 9990n,
      },
      cfg,
    );
  }
  return s;
}

function tick(
  prior: EconomyState,
  minute: SimMinute,
  contracts: ReadonlyMap<EntityId, Contract>,
  cfg: EconomyConfig,
  seed: RunSeed = SEED,
  over: Partial<Pick<EconomyTickIn, "outageSecs" | "spends" | "renewalDecisions" | "mfnTriggers" | "churnSignals" | "churnInterventions" | "creditLineDrawn" | "dunningEngineOwned" | "invoiceTerms">> = {},
): EconomyTickOut {
  return runEconomyTick({
    context: ctxAt(minute, BigInt(Math.floor(minute / 60))),
    runSeed: seed,
    contracts,
    prior,
    cfg,
    ...over,
  });
}

const company = asEntityId("company");

describe("gate-5 slice: billing one contract for real (§9.13)", () => {
  const A = contractOf("A", { termEndMin: 6 * MONTH });
  const map = new Map<EntityId, Contract>([[A.id, A]]);
  const cfg = tickCfg();

  const t0 = tick(harness([A], cfg), 0, map, cfg);

  it("issues the cycle-0 invoice to AR and settles it net-of-fees same tick", () => {
    const kinds = t0.notices.map((n) => n.kind);
    expect(kinds).toContain("invoice-issued");
    expect(kinds).toContain("invoice-paid");
    // gross $100 → fee 2.9%+$0.30 → net $96.80 → 10% rolling reserve $9.68 parked
    expect(t0.state.cash.free).toBe(asMoney(500_000_000n + 96_800_000n - 9_680_000n));
    expect(t0.state.cash.restricted).toBe(asMoney(9_680_000n));
    expect(t0.state.cash.accountsReceivable).toBe(asMoney(0n));
    expect(t0.events.length).toBe(1);
    expect(t0.events[0]!.kind).toBe("invoice-settled");
  });

  it("EVERY entry is cause-stamped, sequenced, and colored (P10 audit)", () => {
    for (const entry of t0.entries) {
      expect(typeof entry.causeId).toBe("string");
      expect(entry.causeId.startsWith("economy:")).toBe(true);
      expect(entry.moneyColour).toMatch(/gold|green|blue|amber|red/);
      for (const v of Object.values(entry.delta)) expect(typeof v).toBe("bigint");
    }
    expect(t0.entries.map((e) => e.seq)).toEqual([...t0.entries.keys()]);
    const totals = new Map<BucketId, bigint>(BUCKET_IDS.map((b) => [b, 0n]));
    for (const e of t0.entries) {
      for (const [b, v] of Object.entries(e.delta) as [BucketId, bigint][]) totals.set(b, (totals.get(b) ?? 0n) + v);
    }
    const start = stateWithCash(500_000_000n).cash;
    for (const b of BUCKET_IDS) expect(t0.state.cash[b]).toBe(asMoney(start[b] + (totals.get(b) ?? 0n)));
  });

  it("monthly calendar keeps billing on the grid, reserve releases after 180 d", () => {
    const A12 = contractOf("A12", { termEndMin: 12 * MONTH });
    const m12 = new Map<EntityId, Contract>([[A12.id, A12]]);
    let s = tick(harness([A12], cfg), 0, m12, cfg).state; // cycle 0 on the grid
    for (const mo of [1, 2, 3]) {
      const r = tick(s, mo * MONTH, m12, cfg);
      expect(r.notices.filter((n) => n.kind === "invoice-issued").length).toBe(1);
      s = r.state;
    }
    expect(s.invoices.length).toBe(4);
    // 180-day reserve on the FIRST invoice releases at minute 180×1440 = 259200
    // — which is also 6 business months, so cycles 4–6 issue and park there too.
    const later = tick(s, 180 * DAY, m12, cfg);
    const released = later.entries.find((e) => e.causeId.startsWith("economy:unlock:"));
    expect(released).toBeDefined();
    expect(released!.delta.restricted).toBe(asMoney(-9_680_000n));
    expect(later.state.cash.restricted).toBe(asMoney(6n * 9_680_000n)); // 7 parked − 1 released
  });
});

describe("renewal cliff — fires exactly at the term-end business tick", () => {
  const A = contractOf("R", { termEndMin: 6 * MONTH });
  const map = new Map<EntityId, Contract>([[A.id, A]]);
  const cfg = tickCfg();

  it("90-day pulse opens at termEnd−90d; cliff resolves lapse vs renew once", () => {
    const before = tick(harness([A], cfg), 6 * MONTH - 90 * DAY - 1, map, cfg);
    expect(before.notices.some((n) => n.kind === "renewal-pulse")).toBe(false);
    const pulse = tick(before.state, 6 * MONTH - 90 * DAY, map, cfg);
    expect(pulse.notices.some((n) => n.kind === "renewal-pulse")).toBe(true);

    const cliff = tick(pulse.state, 6 * MONTH, map, cfg, SEED, {
      renewalDecisions: [{ contractId: A.id, decision: { choice: "lapse", causeId: asCauseId("test:lapse"), escalatedMrc: null } }],
    });
    const lapsed = cliff.notices.find((n) => n.kind === "cliff-lapsed");
    expect(lapsed?.atBusinessMin).toBe(6 * MONTH);
    expect(cliff.state.contractEconomy.get(A.id)?.phase).toBe("terminated");

    const after = tick(cliff.state, 7 * MONTH, map, cfg);
    expect(after.notices.some((n) => n.kind === "invoice-issued")).toBe(false); // lapse-by-default: no zombie billing
    expect(after.notices.some((n) => n.kind === "cliff-lapsed")).toBe(false); // fired exactly once
  });

  it("renew restarts the cycle grid at the new anchor and extends the term", () => {
    const base = tick(harness([A], cfg), 0, map, cfg);
    let s = base.state;
    for (const m of [1, 2, 3, 4, 5]) s = tick(s, m * MONTH, map, cfg).state;
    const renew = tick(s, 6 * MONTH, map, cfg, SEED, {
      renewalDecisions: [{ contractId: A.id, decision: { choice: "escalate-and-renew", causeId: asCauseId("test:esc"), escalatedMrc: asMoney(110_000_000n) } }],
    });
    const econ = renew.state.contractEconomy.get(A.id)!;
    expect(renew.notices.some((n) => n.kind === "cliff-renewed")).toBe(true);
    expect(econ.cycleAnchorMin).toBe(6 * MONTH);
    expect(econ.termEndMin).toBe(12 * MONTH);
    // cliff resolves BEFORE the calendar, so the renewed cycle-0 already
    // issued on this very tick (renewal = the next invoice, §6.12)
    expect(econ.invoicedCycles).toBe(1);
    const nextMonth = tick(renew.state, 7 * MONTH, map, cfg);
    expect(nextMonth.notices.filter((n) => n.kind === "invoice-issued").length).toBe(1);
  });

  it("auto-renew default re-clocks without a rules decision (evergreen)", () => {
    const B = contractOf("E", { termEndMin: 2 * MONTH, sla: { ...contractOf("x").sla, autoRenew: true } });
    const bMap = new Map<EntityId, Contract>([[B.id, B]]);
    const fired = tick(harness([B], cfg), 2 * MONTH, bMap, cfg);
    expect(fired.notices.some((n) => n.kind === "cliff-renewed")).toBe(true);
    expect(fired.state.contractEconomy.get(B.id)!.termEndMin).toBe(2 * MONTH + 2 * MONTH);
  });
});

describe("dunning through the tick — decline → suspend → write-off", () => {
  const A = contractOf("D", { termEndMin: 12 * MONTH });
  const map = new Map<EntityId, Contract>([[A.id, A]]);
  const failing = tickCfg((c) => ({
    ...c,
    dunning: {
      ...c.dunning,
      cardFailureBps: 10_000n, // always decline (deterministic full path)
      stageRecoveryBps: { retry: 0n, reminder: 0n, warning: 0n, suspend: 0n },
      postSuspensionRecoveryBps: 0n,
    },
  }));

  it("walks the ladder, suspends service at the dial, terminates at day 20", () => {
    let s = harness([A], failing);
    const stages: string[] = [];
    for (let day = 0; day <= 21; day += 1) {
      const r = tick(s, day * DAY, map, failing);
      for (const n of r.notices) if (n.kind === "dunning-stage" && n.stage) stages.push(n.stage);
      s = r.state;
    }
    expect(stages).toEqual(["retry", "reminder", "warning"]);
    const written = s.invoices.find((i) => i.state === "written-off");
    expect(written).toBeDefined();
    expect(s.contractEconomy.get(A.id)?.phase).toBe("terminated");
    expect(s.cash.accountsReceivable).toBe(asMoney(0n)); // the write-off cleared it
    // The suspension notice fired at the dial day (10) — collected mid-flight:
    const r2 = tick(s, 25 * DAY, map, failing);
    expect(r2.notices.filter((n) => n.kind === "suspended").length).toBe(0);
  });

  it("recovery branch settles the SAME invoice, AR-neutral, contract lives", () => {
    const saving = tickCfg((c) => ({
      ...c,
      dunning: { ...c.dunning, cardFailureBps: 10_000n, stageRecoveryBps: { retry: 10_000n, reminder: 0n, warning: 0n, suspend: 0n } },
    }));
    let s = harness([A], saving);
    s = tick(s, 0, map, saving).state; // decline day 0
    const rec = tick(s, DAY, map, saving);
    expect(rec.notices.some((n) => n.kind === "dunning-recovered")).toBe(true);
    expect(rec.state.contractEconomy.get(A.id)?.phase).toBe("active");
    expect(rec.state.invoices.find((i) => i.id === asEntityId("inv:D:0"))?.state).toBe("paid");
  });
});

describe("error budget through the tick — drain, spend, lock, refund", () => {
  const A = contractOf("B9", { termEndMin: 3 * MONTH });
  const map = new Map<EntityId, Contract>([[A.id, A]]);
  const cfg = tickCfg();

  it("outage + spends land on the meter; risky verb locks while red", () => {
    let s = harness([A], cfg);
    s = tick(s, 0, map, cfg, SEED, { outageSecs: new Map([[A.id, 3000n]]) }).state; // 2592−3000 → −408
    const locked = tick(s, DAY, map, cfg, SEED, {
      spends: [{ contractId: A.id, action: "risky-deploy", seconds: null }],
    });
    expect(locked.notices.some((n) => n.kind === "budget-locked")).toBe(true);
    expect(locked.notices.some((n) => n.kind === "sla-credit-due")).toBe(true);
    const defensive = tick(s, DAY, map, cfg, SEED, {
      spends: [{ contractId: A.id, action: "feature-off", seconds: null }],
    });
    expect(defensive.notices.some((n) => n.kind === "budget-locked")).toBe(false);
    expect(defensive.state.errorBudgets.get(A.id)!.spentSec).toBe(300n);
  });

  it("clean weeks refund; dirty weeks don't; month roll carries surplus", () => {
    let s = harness([A], cfg);
    const week1 = tick(s, 7 * DAY, map, cfg); // one week passed, nothing burned
    expect(week1.notices.filter((n) => n.kind === "clean-week-refund").length).toBe(1);
    const dirty = tick(week1.state, 14 * DAY, map, cfg, SEED, { outageSecs: new Map([[A.id, 5n]]) });
    expect(dirty.notices.some((n) => n.kind === "clean-week-refund")).toBe(false);
    const rolled = tick(dirty.state, MONTH, map, cfg); // month roll carries 2652−5−… surplus
    const budget = rolled.state.errorBudgets.get(A.id)!;
    expect(budget.monthIndex).toBe(1);
    expect(budget.carryInSec > 0n).toBe(true);
    expect(rolled.notices.some((n) => n.kind === "budget-carry")).toBe(true);
  });
});

describe("deferred revenue + MFN lag through the tick (§6.13/§7.15)", () => {
  const P = contractOf("P", { billingCycle: "annual", termEndMin: 12 * MONTH });
  const map = new Map<EntityId, Contract>([[P.id, P]]);
  const cfg = tickCfg();

  it("prepay lands in DEFERRED, recognizes 1/12 monthly", () => {
    const issued = tick(harness([P], cfg), 0, map, cfg);
    expect(issued.state.cash.deferred).toBe(asMoney(0n));
    // due at 45d (net-30 + 15 slip); settles there
    const settled = tick(issued.state, 45 * DAY, map, cfg);
    // $1,020 gross → 2.9% fee → net $990.42 deferred (no reserve: invoiced deal)
    expect(settled.state.cash.deferred).toBe(asMoney(990_420_000n));
    expect(settled.state.cash.free).toBe(asMoney(500_000_000n));
    const recognized = tick(settled.state, 45 * DAY + MONTH, map, cfg);
    expect(recognized.state.cash.deferred).toBe(asMoney(990_420_000n - 82_535_000n));
    expect(recognized.state.cash.free).toBe(asMoney(500_000_000n + 82_535_000n));
    const unlockEntry = recognized.entries.find((e) => e.causeId.startsWith("economy:unlock:"));
    expect(unlockEntry?.delta.deferred).toBe(asMoney(-82_535_000n));
    expect(unlockEntry?.delta.free).toBe(asMoney(82_535_000n));
  });

  it("MFN reprices three levels later and cuts the NEXT invoice", () => {
    const A = contractOf("M", { termEndMin: 12 * MONTH });
    const m = new Map<EntityId, Contract>([[A.id, A]]);
    const q = tick(harness([A], cfg), 0, m, cfg, SEED, { mfnTriggers: [{ contractId: A.id, discountBps: 500n }] });
    expect(q.notices.some((n) => n.kind === "mfn-queued")).toBe(true);
    expect(q.notices.some((n) => n.kind === "mfn-repriced")).toBe(false);
    const fired = tick(q.state, 3 * MONTH, m, cfg);
    expect(fired.notices.some((n) => n.kind === "mfn-repriced")).toBe(true);
    const after = fired.notices.find((n) => n.kind === "invoice-issued" && n.contractId === A.id && n.atBusinessMin === 3 * MONTH);
    expect(after?.amount).toBe(asMoney(95_000_000n)); // $100 −5% (500 bps)
  });
});

describe("churn + runway + spiral through the tick", () => {
  it("voluntary churn fires on the month roll and stops billing", () => {
    const A = contractOf("C", { termEndMin: 12 * MONTH });
    const map = new Map<EntityId, Contract>([[A.id, A]]);
    const churny = tickCfg((c) => ({ ...c, churn: { ...c.churn, monthlyLogoChurnBpsByBundle: {}, fallbackMonthlyBps: 10_000n } }));
    const r = tick(harness([A], churny), MONTH, map, churny); // entering month 1: certain churn
    expect(r.notices.some((n) => n.kind === "churned-voluntary")).toBe(true);
    expect(r.state.contractEconomy.get(A.id)?.phase).toBe("terminated");
  });

  it("credit-drawn + short runway → spiral-flagged NOTICE and counter, both (E-18)", () => {
    const A = contractOf("S", { termEndMin: 12 * MONTH });
    const map = new Map<EntityId, Contract>([[A.id, A]]);
    const cfg = tickCfg();
    // Burn is engineered by draining free between month ticks — exactly what
    // the finance lane (capex/payroll, outside economy) does to GameState.cash.
    const drain = (s: EconomyState, to: bigint): EconomyState => ({
      ...s,
      cash: { ...s.cash, free: asMoney(to) },
    });
    const s0 = drain(harness([A], cfg, 100_000_000n), 100_000_000n);
    const m1 = tick(s0, MONTH, map, cfg, SEED, { creditLineDrawn: true }); // streak 1, no burn yet
    const m2 = tick(drain(m1.state, 10_000_000n), 2 * MONTH, map, cfg, SEED, { creditLineDrawn: true });
    expect(m2.state.spiral.tone).toBe("critical"); // burn 90M, runway ~0.11 mo
    expect(m2.state.spiral.consecutiveBorrowMonths).toBe(2);
    expect(m2.notices.some((n) => n.kind === "spiral-flagged")).toBe(false); // streak < 3
    const m3 = tick(drain(m2.state, 5_000_000n), 3 * MONTH, map, cfg, SEED, { creditLineDrawn: true });
    expect(m3.state.spiral.consecutiveBorrowMonths).toBe(3);
    expect(m3.state.spiral.spiralFlagged).toBe(true);
    expect(m3.notices.some((n) => n.kind === "spiral-flagged")).toBe(true); // E-18: BOTH asserted
  });
});

/* ─────────────────────── E-series review-fix pins ─────────────────────── */

describe("E-2 post-suspension recovery lifts the suspension (§6.4)", () => {
  const rescue = (postBps: bigint) =>
    tickCfg((c) => ({
      ...c,
      dunning: {
        ...c.dunning,
        cardFailureBps: 10_000n, // always decline
        stageRecoveryBps: { retry: 0n, reminder: 0n, warning: 0n, suspend: 0n },
        postSuspensionRecoveryBps: postBps,
      },
    }));

  function walkLadder(id: string, cfg: EconomyConfig, seed: RunSeed) {
    const A = contractOf(id, { termEndMin: 12 * MONTH });
    const map = new Map<EntityId, Contract>([[A.id, A]]);
    let s = harness([A], cfg);
    const notices = { suspended: false, lifted: false, recoveredStage: null as string | null };
    for (let day = 0; day <= 21; day += 1) {
      const r = tick(s, day * DAY, map, cfg, seed);
      for (const n of r.notices) {
        if (n.kind === "suspended") notices.suspended = true;
        if (n.kind === "suspension-lifted") notices.lifted = true;
        if (n.kind === "dunning-recovered") notices.recoveredStage = n.stage ?? null;
      }
      s = r.state;
    }
    return { s, notices, A, map, cfg };
  }

  it("forced recover-while-suspended: phase back to active, invoice paid, 'suspension-lifted' fires", () => {
    const { s, notices } = walkLadder("L2", rescue(10_000n), SEED);
    expect(notices.suspended).toBe(true); // suspended at the dial (day 10)
    expect(notices.lifted).toBe(true); // recovered at terminate entry (day 20)
    expect(notices.recoveredStage).toBe("terminate");
    expect(s.contractEconomy.get(asEntityId("L2"))?.phase).toBe("active"); // NOT stranded
    expect(s.contractEconomy.get(asEntityId("L2"))?.suspendedAtMin).toBeNull();
    expect(s.invoices.find((i) => i.id === asEntityId("inv:L2:0"))?.state).toBe("paid");
  });

  it("LIVE default 200 bps post-suspension path CAN lift (bounded deterministic seed probe)", () => {
    const live = rescue(cfgDefaultPostSuspension()); // ← default 200n
    let liftedSeed: RunSeed | null = null;
    for (let probe = 0n; probe < 250n && liftedSeed === null; probe += 1n) {
      const seed = asRunSeed(BigInt(7_000) + probe);
      const { notices } = walkLadder("L3", live, seed);
      if (notices.lifted) liftedSeed = seed;
    }
    expect(liftedSeed, "expected a ~2% recovery inside 250 seeds").not.toBeNull();
  });
});

function cfgDefaultPostSuspension(): bigint {
  return defaultEconomyConfig().dunning.postSuspensionRecoveryBps; // LIVE 200 (§6.4)
}

describe("E-10 rolling-reserve park rounds half-away like every other rate (money.ts)", () => {
  const oddFees = tickCfg((c) => ({
    ...c,
    fees: { ...c.fees, cardRateBps: 0n, cardFixedMicroUsd: asMoney(0n), rollingReserveBps: 5_000n },
  }));

  it("odd µ$ nets park the HALF-UP amount, not the truncated one", () => {
    for (const [net, expected] of [
      [101n, 51n], // 50.5 → 51 (old truncating `/` gave 50)
      [99n, 50n], // 49.5 → 50 (old gave 49)
      [100n, 50n], // exact — unchanged
      [109n, 55n], // 54.5 → 55
      [108n, 54n], // 54.0 — unchanged
    ] as const) {
      const A = contractOf(`RP${net}`, { mrcMicroUsd: asMoney(net), termEndMin: MONTH });
      const map = new Map<EntityId, Contract>([[A.id, A]]);
      const r = tick(harness([A], oddFees, 1_000n), 0, map, oddFees);
      expect(r.state.cash.restricted, `net ${net}µ$ park`).toBe(asMoney(expected));
      expect(r.state.cash.free).toBe(asMoney(1_000n + net - expected));
    }
  });
});

describe("E-11 cancellation settles deferred prepay (§6.13 'refund punishes')", () => {
  const lapseDecision = (id: EntityId) => ({
    renewalDecisions: [{ contractId: id, decision: { choice: "lapse" as const, causeId: asCauseId("test:lapse"), escalatedMrc: null } }],
  });

  it("cliff lapse mid-deferred earns out the due slice, refunds the rest from deferred, closes the schedule", () => {
    const P = contractOf("X9", { billingCycle: "annual", termEndMin: 3 * MONTH });
    const map = new Map<EntityId, Contract>([[P.id, P]]);
    const cfg = tickCfg();
    let s = tick(harness([P], cfg), 0, map, cfg).state; // issued, due 45d
    s = tick(s, 45 * DAY, map, cfg).state; // settles → deferred + recognition schedule
    expect(s.cash.deferred).toBe(asMoney(990_420_000n));
    // Jump straight to the cliff: the 45d+1m recognition boundary is DUE but
    // unprocessed (release step 11 never ran for it) — settlement must earn
    // it out BEFORE refunding, or the company under-collects delivered time.
    const lapse = tick(s, 3 * MONTH, map, cfg, SEED, lapseDecision(P.id));
    const refund = lapse.notices.find((n) => n.kind === "prepaid-refunded");
    expect(refund?.amount).toBe(asMoney(990_420_000n - 82_535_000n));
    expect(lapse.entries.some((e) => e.causeId.startsWith("economy:cancel-earn:"))).toBe(true);
    expect(lapse.state.cash.deferred).toBe(asMoney(0n)); // nothing dribbles on a dead contract
    expect(lapse.state.cash.free).toBe(asMoney(500_000_000n + 82_535_000n)); // earned slice stays
    expect(lapse.state.unlockSchedules).toHaveLength(0);
  });

  it("voluntary churn mid-deferred refunds the unrecognized net (churn path)", () => {
    const M = contractOf("V3", { termEndMin: 12 * MONTH });
    const map = new Map<EntityId, Contract>([[M.id, M]]);
    const churny = tickCfg((c) => ({ ...c, churn: { ...c.churn, monthlyLogoChurnBpsByBundle: {}, fallbackMonthlyBps: 10_000n } }));
    // Prepay elected on a monthly deal = a full YEAR billed up front (§6.13
    // financing instrument), due at issue + net-10 + slip-15 = day 25.
    const terms: InvoiceTerms = { netTermsDays: 10, annualPrepay: true };
    const withTerms = new Map([[M.id, terms]]);
    let s = tick(harness([M], churny), 0, map, churny, SEED, { invoiceTerms: withTerms }).state; // gross 1.02G, due 36000
    s = tick(s, 26 * DAY, map, churny, SEED, { invoiceTerms: withTerms }).state; // settles → deferred
    expect(s.cash.deferred).toBe(asMoney(990_420_000n)); // 12×100M×0.85 − 2.9% card
    const churned = tick(s, MONTH, map, churny, SEED, { invoiceTerms: withTerms });
    expect(churned.notices.some((n) => n.kind === "churned-voluntary")).toBe(true);
    // Recognition boundary (26d + month) not yet crossed — the WHOLE prepay is
    // unrecognized deferred and must flow back out, none of it dribbles on.
    expect(churned.notices.find((n) => n.kind === "prepaid-refunded")?.amount).toBe(asMoney(990_420_000n));
    expect(churned.state.cash.deferred).toBe(asMoney(0n));
    expect(churned.state.cash.free).toBe(asMoney(500_000_000n));
    expect(churned.state.unlockSchedules).toHaveLength(0);
  });

  it("dunning write-off settles the open deferred schedule of a once-paying customer (terminate path)", () => {
    const W = contractOf("W4", { termEndMin: 12 * MONTH });
    const map = new Map<EntityId, Contract>([[W.id, W]]);
    const terms: InvoiceTerms = { netTermsDays: 15, annualPrepay: true };
    const withTerms = new Map([[W.id, terms]]);
    const clean = tickCfg(); // cycle 0 pays…
    const failing = tickCfg((c) => ({
      ...c,
      dunning: {
        ...c.dunning,
        cardFailureBps: 10_000n, // …then the card dies for good
        stageRecoveryBps: { retry: 0n, reminder: 0n, warning: 0n, suspend: 0n },
        postSuspensionRecoveryBps: 0n,
      },
    }));
    // net-15 + slip-15 → cycle 0 is DUE at day 30; it must settle clean
    // BEFORE the card dies, so there is real deferred prepay on the books.
    let s = tick(harness([W], clean), 0, map, clean, SEED, { invoiceTerms: withTerms }).state; // issued, due 43_200
    s = tick(s, MONTH, map, clean, SEED, { invoiceTerms: withTerms }).state; // cycle 0 settles → deferred; cycle 1 issued (due 86_400)
    expect(s.cash.deferred).toBe(asMoney(990_420_000n));
    // Cycle-1 walks the ladder from due 86_400; the recognition boundary
    // (settle 43_200 + month) also falls at 86_400 and earns out normally
    // via step 11 at the first failing tick.
    let finalOut: EconomyTickOut = { state: s, entries: [], events: [], notices: [], observedWrites: [] };
    for (const min of [86_400, 87_840, 93_600, 97_920, 100_800, 115_200]) {
      finalOut = tick(s, min, map, failing, SEED, { invoiceTerms: withTerms });
      s = finalOut.state;
    }
    expect(s.contractEconomy.get(W.id)?.phase).toBe("terminated");
    const writtenOff = s.invoices.find((i) => i.state === "written-off");
    expect(writtenOff).toBeDefined();
    // The cycle-0 deferred prepay must not dribble on a written-off customer:
    // one 1/12 slice earned out at the boundary, the rest refunds from deferred.
    const earnedSlice = asMoney(82_535_000n); // 990,420,000/12 exact
    expect(s.cash.deferred).toBe(asMoney(0n));
    expect(s.unlockSchedules.filter((x) => x.contractId === W.id)).toHaveLength(0);
    expect(s.cash.free).toBe(asMoney(500_000_000n + earnedSlice));
    const refund = finalOut.notices.find((n) => n.kind === "prepaid-refunded");
    expect(refund?.amount).toBe(asMoney(990_420_000n - 82_535_000n));
  });

  it("no zombie prepay: an invoice due after cancellation never settles (step-7 guard)", () => {
    const Z = contractOf("Z7", { billingCycle: "annual", termEndMin: 12 * MONTH });
    const map = new Map<EntityId, Contract>([[Z.id, Z]]);
    const churny = tickCfg((c) => ({ ...c, churn: { ...c.churn, monthlyLogoChurnBpsByBundle: {}, fallbackMonthlyBps: 10_000n } }));
    const issued = tick(harness([Z], churny), 0, map, churny).state; // due 45d, unsettled
    const churned = tick(issued, MONTH, map, churny); // dies BEFORE the due date
    expect(churned.notices.some((n) => n.kind === "churned-voluntary")).toBe(true);
    const later = tick(churned.state, 45 * DAY, map, churny);
    expect(later.notices.some((n) => n.kind === "invoice-paid")).toBe(false);
    expect(later.state.cash.deferred).toBe(asMoney(0n));
    expect(later.state.unlockSchedules).toHaveLength(0);
  });
});

describe("E-17 same-tick MFN double-fire prices at the MAX (order-independent)", () => {
  const A = contractOf("F7", { termEndMin: 12 * MONTH });
  const map = new Map<EntityId, Contract>([[A.id, A]]);
  const cfg = tickCfg();

  function fireBothOrders(first: bigint, second: bigint): bigint | undefined {
    const q = tick(harness([A], cfg), 0, map, cfg, SEED, {
      mfnTriggers: [
        { contractId: A.id, discountBps: first },
        { contractId: A.id, discountBps: second },
      ],
    });
    const fired = tick(q.state, 3 * MONTH, map, cfg, SEED); // both lag due on the SAME tick
    return fired.notices.find((n) => n.kind === "invoice-issued" && n.atBusinessMin === 3 * MONTH)?.amount;
  }

  it("best-ever discount wins regardless of queue order (MFN is a floor, §7.15)", () => {
    expect(fireBothOrders(500n, 300n)).toBe(asMoney(95_000_000n)); // old last-wins gave 97M
    expect(fireBothOrders(300n, 500n)).toBe(asMoney(95_000_000n));
  });
});

describe("E-9/E-18 through the tick", () => {
  const A = contractOf("K9", { termEndMin: 12 * MONTH });
  const map = new Map<EntityId, Contract>([[A.id, A]]);
  const cfg = tickCfg();

  it("a 21-day pause refunds every closed clean week, each with its own cause (E-9)", () => {
    const resumed = tick(harness([A], cfg), 21 * DAY, map, cfg); // weeks 0,1,2 closed unseen
    const refunds = resumed.notices.filter((n) => n.kind === "clean-week-refund");
    expect(refunds).toHaveLength(3);
    expect(refunds.map((n) => n.causeId)).toEqual([
      "economy/error-budget:clean-week:K9:w0",
      "economy/error-budget:clean-week:K9:w1",
      "economy/error-budget:clean-week:K9:w2",
    ]);
    const budget = resumed.state.errorBudgets.get(A.id)!;
    expect(budget.refundedSec).toBe(cfg.errorBudget.cleanWeekRefundSec * 3n);
  });

  it("an out-of-order dunning dial halts the tick before any draw (E-18 validator)", () => {
    const broken = tickCfg((c) => ({ ...c, dunning: { ...c.dunning, warningStartDay: 2 } })); // reminder 5 > warning 2
    expect(() => tick(harness([A], broken), 0, map, broken)).toThrow(/ladder out of order/);
  });
});

describe("tick determinism ×100 + integer-money audit (task gates)", () => {
  const A = contractOf("T1", { termEndMin: 2 * MONTH, bundleId: "vps" });
  const B = contractOf("T2", { billingCycle: "annual", termEndMin: 24 * MONTH, bundleId: "shared" });
  const map = new Map<EntityId, Contract>([[A.id, A], [B.id, B]]);

  function script(seed: RunSeed): string {
    const cfg = defaultEconomyConfig(); // REAL rates — exercises every roll
    let s = harness([A, B], cfg);
    const minutes: SimMinute[] = [
      0, DAY, 2 * DAY, 8 * DAY, 10 * DAY, 20 * DAY, MONTH, MONTH + DAY, 2 * MONTH,
      3 * MONTH, 45 * DAY + 2 * MONTH, 48 * DAY + 2 * MONTH, 4 * MONTH, 6 * MONTH, 6 * MONTH + 1, 7 * MONTH,
    ];
    const out: string[] = [];
    for (const [i, minute] of minutes.entries()) {
      const r = tick(s, minute, map, cfg, seed, {
        outageSecs: i % 3 === 0 ? new Map([[A.id, 300n]]) : undefined,
        spends: i % 4 === 0 ? [{ contractId: A.id, action: "reboot-not-diagnose" as const, seconds: null }] : undefined,
        churnSignals: i === 2 ? [A.id] : undefined,
        churnInterventions: i === 8 ? [A.id] : undefined,
        mfnTriggers: i === 1 ? [{ contractId: A.id, discountBps: 250n }] : undefined,
        creditLineDrawn: i % 2 === 0,
        ...(i === 16 ? { renewalDecisions: [{ contractId: A.id, decision: { choice: "renew" as const, causeId: asCauseId("test:renew"), escalatedMrc: null } }] } : {}),
      });
      // per-tick invariants — money never floats, causes never missing
      for (const e of r.entries) {
        if (typeof e.causeId !== "string" || e.causeId === "") throw new Error("entry without cause");
        for (const v of Object.values(e.delta)) {
          if (typeof v !== "bigint") throw new Error("float money leaked into the journal");
        }
      }
      for (const b of BUCKET_IDS) if (r.state.cash[b] < 0n) throw new Error(`negative bucket ${b}`);
      s = r.state;
      out.push(digest({ entries: r.entries, events: r.events, notices: r.notices }));
    }
    out.push(digest(s));
    return out.join("#");
  }

  it("100 replays of the same seed are byte-identical", () => {
    const first = script(SEED);
    for (let i = 0; i < 100; i += 1) expect(script(SEED)).toBe(first);
  });

  it("another seed diverges (the draws actually happen)", () => {
    expect(script(asRunSeed(99n))).not.toBe(script(SEED));
  });

  it("a backwards business clock is replay corruption — fail loud", () => {
    const s = tick(harness([A], tickCfg()), MONTH, map, tickCfg()).state;
    expect(() => tick(s, MONTH - 1, map, tickCfg())).toThrow(/went backwards/);
  });

  it("un-primed contracts auto-prime with a loud notice instead of crashing", () => {
    const C = contractOf("fresh", { termEndMin: MONTH });
    const out = tick(emptyEconomyState(), 0, new Map([[C.id, C]]), tickCfg());
    expect(out.notices.some((n) => n.kind === "contract-unprimed")).toBe(true);
    expect(out.notices.some((n) => n.kind === "invoice-issued")).toBe(true);
    void company;
  });
});
