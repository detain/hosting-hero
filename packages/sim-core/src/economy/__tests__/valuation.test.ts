/**
 * L-V1 valuation leg (wave-28 money-at-the-end 1/3) — economy/valuation.ts.
 *
 * Arms: the whole-month term reads (contractRemainingTerm floor boundaries),
 * the WARCT family (weighted mean, contracted-share strict >12 law, empty-
 * book absence = 0 bps/months), the closed-kind band table (drift-pinned
 * against elasticity PRICE_KEY_KINDS AND the door's private
 * PRICE_TARGET_KINDS source — the sell lane's mirror pair), the per-tenant
 * lease value (band floor, term slope capped at the band top, the signed
 * trust factor with the goodwill ceiling and the sub-bps rounding silence),
 * the exit cash-slice composition (never-above-headline, the concentration
 * strictly-above boundary, the split floor law with wind-down landing on
 * EXACT zero, code-unit ordered frozen adjustments), and the three purity
 * pins: zero rolls, the fold byte-identity twin (the money lane must not
 * notice this module EXISTS), and the PROVISIONAL census of the shipped
 * valuation book (20 markers, zero RATIFIED — ADR-0016 #10 posture).
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { asEntityId, asMoney, type Contract, type EntityId, type MoneyUnit } from "../../types.js";
import { defaultEconomyConfig, DEFAULT_VALUATION_CONFIG, type EconomyConfig } from "../config.js";
import { registerContractEconomy, type EconomyState } from "../state.js";
import { runEconomyTick } from "../tick.js";
import { PRICE_KEY_KINDS } from "../elasticity.js";
import {
  CONTRACTED_REVENUE_MIN_MONTHS,
  VALUATION_ADJUSTMENT_BASES,
  VALUATION_EXIT_KINDS,
  VALUATION_MULTIPLE_BANDS_BPS,
  contractRemainingTerm,
  contractedRevenueShareBps,
  exitCashSliceMicroUsd,
  tenantWholeLeaseValueMicroUsd,
  warctMonths,
  type ValuationExitKind,
  type ValuationRevenueRow,
} from "../valuation.js";
import { MONTH, SEED, TAGS, ctxAt, stateWithCash } from "./helpers.js";

const row = (mrc: bigint, months: number): ValuationRevenueRow => ({
  mrcMicroUsd: asMoney(mrc),
  remainingMonths: months,
});
const M100 = 100_000_000n; // $100/mo in micro-USD

/* ═══════════════ contractRemainingTerm — the business-month floor ══════════ */

describe("contractRemainingTerm (whole months, floor, never negative)", () => {
  it("two months out reads 2; one minute into the term still reads 1 after the boundary", () => {
    expect(contractRemainingTerm({ termEndMin: 2 * MONTH }, 0)).toBe(2);
    expect(contractRemainingTerm({ termEndMin: 2 * MONTH }, 1)).toBe(1);
  });
  it("the month boundary floors DOWN (86,399 minutes left is still 1 whole month)", () => {
    expect(contractRemainingTerm({ termEndMin: 2 * MONTH }, MONTH - 1)).toBe(1);
    expect(contractRemainingTerm({ termEndMin: 86_399 }, 0)).toBe(1);
    expect(contractRemainingTerm({ termEndMin: 86_400 }, 1)).toBe(1);
  });
  it("lapse-boundary equals and past terms floor to ZERO — ribbons run out, they never go behind you", () => {
    expect(contractRemainingTerm({ termEndMin: MONTH }, MONTH)).toBe(0);
    expect(contractRemainingTerm({ termEndMin: MONTH }, MONTH + 1)).toBe(0);
    expect(contractRemainingTerm({ termEndMin: 0 }, 9_999_999)).toBe(0);
  });
  it("non-safe-integer arithmetic throws (poison clock, not a silent NaN term)", () => {
    expect(() => contractRemainingTerm({ termEndMin: Number.NaN }, 0)).toThrow(/economy\/valuation/);
    expect(() => contractRemainingTerm({ termEndMin: 2 ** 53 }, -10)).toThrow(/economy\/valuation/);
  });
});

/* ═══════════════════════════ the WARCT family ══════════════════════════════ */

describe("warctMonths (hg:24957 weighted average remaining contract term)", () => {
  it("equal-MRC 12 + 24 months averages to 18", () => {
    expect(warctMonths([row(M100, 12), row(M100, 24)])).toBe(18n);
  });
  it("MRC weights, not rows: one big short lease sinks the average", () => {
    expect(warctMonths([row(M100, 2), row(900_000_000n, 1)])).toBe(1n);
  });
  it("the weighted mean FLOORS (1.5 reads as 1 whole month — an annuity does not divide)", () => {
    expect(warctMonths([row(M100, 1), row(M100, 2)])).toBe(1n);
  });
  it("empty book and all-zero-MRC book both read 0n — the ABSENCE value, pinned as law", () => {
    expect(warctMonths([])).toBe(0n);
    expect(warctMonths([row(0n, 120), row(0n, 240)])).toBe(0n);
  });
  it("pure by construction: the same input twice deep-equals", () => {
    const rows = [row(M100, 13), row(250_000_000n, 6), row(50_000_000n, 121)];
    expect(warctMonths(rows)).toBe(warctMonths(rows));
  });
  it("negative inputs refuse (guard fail-fast, not a plausible wrong number)", () => {
    expect(() => warctMonths([{ mrcMicroUsd: asMoney(-1n), remainingMonths: 1 }])).toThrow(/economy\/valuation/);
    expect(() => warctMonths([{ mrcMicroUsd: asMoney(M100), remainingMonths: -3 }])).toThrow(/economy\/valuation/);
    expect(() => warctMonths([{ mrcMicroUsd: asMoney(M100), remainingMonths: 1.5 }])).toThrow(/economy\/valuation/);
  });
});

describe("contractedRevenueShareBps (hg:24958 fraction of MRR with >12 months left)", () => {
  it("CONTRACTED_REVENUE_MIN_MONTHS is the doc's twelve, named not dialed", () => {
    expect(CONTRACTED_REVENUE_MIN_MONTHS).toBe(12);
  });
  it("exactly-12 does NOT qualify — strictly more is the law (the doc writes '>12')", () => {
    expect(contractedRevenueShareBps([row(M100, 12)])).toBe(0n);
    expect(contractedRevenueShareBps([row(M100, 13)])).toBe(10_000n);
  });
  it("MRC-weighted: 100M of 13-month out of 400M total reads 2,500 bps", () => {
    expect(contractedRevenueShareBps([row(M100, 13), row(300_000_000n, 6)])).toBe(2_500n);
  });
  it("empty book reads 0 bps honestly (no fraction of nothing — the absence law)", () => {
    expect(contractedRevenueShareBps([])).toBe(0n);
    expect(contractedRevenueShareBps([row(0n, 24)])).toBe(0n);
  });
});

/* ═══════════════════════ the closed-kind band table ════════════════════════ */

describe("VALUATION_MULTIPLE_BANDS_BPS (hg:24377-24379 per-line bases)", () => {
  it("keyed EXACTLY by the elasticity kinds (closed set, no extras, no drift)", () => {
    expect(Object.keys(VALUATION_MULTIPLE_BANDS_BPS)).toEqual([...PRICE_KEY_KINDS]);
  });
  it("keyed EXACTLY by the door's private PRICE_TARGET_KINDS (source-read mirror — the sell lane's pattern)", () => {
    const doorSource = readFileSync(
      fileURLToPath(new URL("../../pipeline/intent-door.ts", import.meta.url)),
      "utf8",
    );
    const kinds = doorSource.match(/const PRICE_TARGET_KINDS\b[\s\S]*?\(\[([^\]]*)\]\)/);
    if (kinds === null) throw new Error("PRICE_TARGET_KINDS not found");
    const listed = [...(kinds[1] ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    expect(listed).toEqual(["plan", "contract-class", "sku"]);
  });
  it("the alias IS the shipped book (single source of truth, identity-pinned)", () => {
    expect(VALUATION_MULTIPLE_BANDS_BPS).toBe(DEFAULT_VALUATION_CONFIG.bandsBps);
  });
  it("the colo honest-partial: contract-class shares the band FLOOR, tops at 16x (NOI basis needs expense truth the engine lacks)", () => {
    expect(VALUATION_MULTIPLE_BANDS_BPS.plan.floorBps).toBe(100_000n);
    expect(VALUATION_MULTIPLE_BANDS_BPS.plan.topBps).toBe(180_000n);
    expect(VALUATION_MULTIPLE_BANDS_BPS["contract-class"].floorBps).toBe(VALUATION_MULTIPLE_BANDS_BPS.plan.floorBps);
    expect(VALUATION_MULTIPLE_BANDS_BPS["contract-class"].topBps).toBe(160_000n);
  });
  it("frozen all the way down (the book cannot be talked into different numbers)", () => {
    expect(Object.isFrozen(VALUATION_MULTIPLE_BANDS_BPS)).toBe(true);
    expect(Object.isFrozen(VALUATION_MULTIPLE_BANDS_BPS.plan)).toBe(true);
  });
});

/* ═══════════════ tenantWholeLeaseValueMicroUsd (band x slope x trust) ═══════ */

describe("tenantWholeLeaseValueMicroUsd (the per-tenant lease annuity read)", () => {
  const base = { mrcMicroUsd: asMoney(M100), priceKeyKind: "plan" as const, trustBps: null as bigint | null };
  it("month-to-month prices at the band FLOOR (10x monthly revenue — hg:24377 lower bound)", () => {
    expect(tenantWholeLeaseValueMicroUsd({ ...base, remainingMonths: 0 })).toBe(asMoney(1_000_000_000n));
    expect(tenantWholeLeaseValueMicroUsd({ ...base, remainingMonths: 3 })).toBe(asMoney(1_000_000_000n));
  });
  it("the doc's own witness: a five-year deal is worth ~15% more (hg:1671) — slope 3%/yr whole years", () => {
    expect(tenantWholeLeaseValueMicroUsd({ ...base, remainingMonths: 60 })).toBe(asMoney(1_150_000_000n));
    expect(tenantWholeLeaseValueMicroUsd({ ...base, remainingMonths: 71 })).toBe(asMoney(1_150_000_000n)); // floor(71/12)=5
    expect(tenantWholeLeaseValueMicroUsd({ ...base, remainingMonths: 72 })).toBe(asMoney(1_180_000_000n));
  });
  it("the slope WALKS the band, it does not escape it: capped at the top", () => {
    expect(tenantWholeLeaseValueMicroUsd({ ...base, remainingMonths: 400 })).toBe(asMoney(1_800_000_000n));
    expect(
      tenantWholeLeaseValueMicroUsd({ ...base, priceKeyKind: "contract-class", remainingMonths: 400 }),
    ).toBe(asMoney(1_600_000_000n));
  });
  it("trust null is the neutral reading; goodwill clamps at 1.0 (never above the band — negotiate.ts ceiling mirrored)", () => {
    const neutral = tenantWholeLeaseValueMicroUsd({ ...base, remainingMonths: 3 });
    expect(tenantWholeLeaseValueMicroUsd({ ...base, remainingMonths: 3, trustBps: 1_000n })).toBe(neutral);
    expect(tenantWholeLeaseValueMicroUsd({ ...base, remainingMonths: 3, trustBps: 9_999n })).toBe(neutral);
  });
  it("trust is SIGNED: burned tenants sink the price, honestly (-1000 bps x 500 leverage = -50 bps)", () => {
    expect(tenantWholeLeaseValueMicroUsd({ ...base, remainingMonths: 3, trustBps: -1_000n })).toBe(
      asMoney(995_000_000n),
    );
  });
  it("sub-bps trust rounds AWAY (the -9 bps meter twitch prices nothing — half-away at 500 leverage)", () => {
    expect(tenantWholeLeaseValueMicroUsd({ ...base, remainingMonths: 3, trustBps: -9n })).toBe(
      asMoney(1_000_000_000n),
    );
    expect(tenantWholeLeaseValueMicroUsd({ ...base, remainingMonths: 3, trustBps: -10n })).toBe(
      asMoney(999_900_000n),
    );
  });
  it("an off-set kind refuses the closed-set wall (forged wire cannot pick a band)", () => {
    expect(() =>
      tenantWholeLeaseValueMicroUsd({ ...base, remainingMonths: 3, priceKeyKind: "tier" as never }),
    ).toThrow(/economy\/valuation.*closed set \{plan, contract-class, sku\}/);
  });
  it("the dial surface is honest: a host can re-taste trust leverage without touching the leaf", () => {
    const loud = { ...DEFAULT_VALUATION_CONFIG, trustLeverageBps: 10_000n };
    expect(tenantWholeLeaseValueMicroUsd({ ...base, remainingMonths: 3, trustBps: -1_000n }, loud)).toBe(
      asMoney(900_000_000n),
    );
  });
});

/* ═══════════════════ VALUATION_ADJUSTMENT_BASES (the register) ═════════════ */

describe("VALUATION_ADJUSTMENT_BASES (frozen diligence register, hg-cited)", () => {
  it("exactly six bases, code-unit ordered (the product walk order is law, not chance)", () => {
    expect(VALUATION_ADJUSTMENT_BASES.map((b) => b.basis)).toEqual([
      "churn",
      "concentration",
      "exit-kind",
      "reputation",
      "term-coverage",
      "written-off",
    ]);
  });
  it("every basis cites its hosting_game.md line", () => {
    for (const basis of VALUATION_ADJUSTMENT_BASES) {
      expect(basis.cite.startsWith("hg:")).toBe(true);
    }
  });
  it("frozen array, frozen rows", () => {
    expect(Object.isFrozen(VALUATION_ADJUSTMENT_BASES)).toBe(true);
    for (const basis of VALUATION_ADJUSTMENT_BASES) expect(Object.isFrozen(basis)).toBe(true);
  });
});

/* ════════════════════ exitCashSliceMicroUsd (the composition) ══════════════ */

describe("exitCashSliceMicroUsd (headline x diligence product x kind)", () => {
  const HEAD = asMoney(1_000_000_000n); // $1,000 offer
  const clean = {
    headlineOfferMicroUsd: HEAD,
    churnBps: 0n,
    writtenOffBps: 0n,
    concentrationBps: null,
    warctCoverageBps: null,
    reputationBps: null,
    exitKind: "strategic-acquisition",
  } satisfies ExitCashSliceShape;
  type ExitCashSliceShape = Parameters<typeof exitCashSliceMicroUsd>[0];
  it("a clean strategic slice is the headline itself, with exactly one memo row (the deal shape)", () => {
    const res = exitCashSliceMicroUsd(clean);
    expect(res.cashSliceMicroUsd).toBe(HEAD);
    expect(res.adjustments).toEqual([{ basis: "exit-kind", factorBps: 10_000n }]);
  });
  it("the slice is NEVER above the headline (hg:5617: proceeds, not headline price)", () => {
    const res = exitCashSliceMicroUsd({
      ...clean,
      warctCoverageBps: 12_000n, // over-coverage buys NO bonus (clamped)
      reputationBps: 12_000n, // over-reputation buys NO bonus (clamped)
    });
    expect(res.cashSliceMicroUsd).toBe(HEAD);
    expect(res.adjustments.length).toBe(1); // no diligence legs booked at all
  });
  it("churn 500 bps knocks halfAway(500 x 200 / 10_000) = 10 bps (hg:24365 churn is a modifier)", () => {
    const res = exitCashSliceMicroUsd({ ...clean, churnBps: 500n });
    expect(res.adjustments).toContainEqual({ basis: "churn", factorBps: 9_990n });
    expect(res.cashSliceMicroUsd).toBe(asMoney(999_000_000n));
  });
  it("concentration is STRICTLY above the threshold: 4,000 books no hit, 4,001 costs 25% (hg:24436 exceeds, hg:24393 20-30%)", () => {
    expect(exitCashSliceMicroUsd({ ...clean, concentrationBps: 4_000n }).adjustments.length).toBe(1);
    const hit = exitCashSliceMicroUsd({ ...clean, concentrationBps: 4_001n });
    expect(hit.adjustments).toContainEqual({ basis: "concentration", factorBps: 7_500n });
    expect(hit.cashSliceMicroUsd).toBe(asMoney(750_000_000n));
  });
  it("absence books NO finding: null concentration/coverage/reputation rows stay silent", () => {
    const res = exitCashSliceMicroUsd({ ...clean, warctCoverageBps: null, reputationBps: null });
    expect(res.adjustments.map((a) => a.basis)).toEqual(["exit-kind"]);
  });
  it("reputation reads through its leverage: a zero-rep company loses 20% (10_000 gap x 2_000 bps)", () => {
    const res = exitCashSliceMicroUsd({ ...clean, reputationBps: 0n });
    expect(res.adjustments).toContainEqual({ basis: "reputation", factorBps: 8_000n });
    expect(res.cashSliceMicroUsd).toBe(asMoney(800_000_000n));
  });
  it("the split floor law: diligence alone cannot take more than half (hg:24415 escrow), pinned on a fully-toxic book", () => {
    const res = exitCashSliceMicroUsd({
      ...clean,
      churnBps: 10_000n,
      writtenOffBps: 10_000n,
      reputationBps: 0n,
      warctCoverageBps: 0n,
    });
    // legs: churn 9_800, reputation 8_000, term-coverage 5_000, written-off 9_950
    expect(res.adjustments.map((a) => a.basis)).toEqual([
      "churn",
      "exit-kind",
      "reputation",
      "term-coverage",
      "written-off",
    ]);
    expect(res.adjustments.map((a) => a.factorBps)).toEqual([9_800n, 10_000n, 8_000n, 5_000n, 9_950n]);
    expect(res.cashSliceMicroUsd).toBe(asMoney(500_000_000n)); // product 3_901 floored to sliceFloorBps 5_000
  });
  it("wind-down lands on EXACT zero — the floor guards diligence, the deal shape may erase (hg:4512)", () => {
    const res = exitCashSliceMicroUsd({
      ...clean,
      churnBps: 10_000n,
      reputationBps: 0n,
      exitKind: "wind-down",
    });
    expect(res.cashSliceMicroUsd).toBe(asMoney(0n));
    expect(res.adjustments.map((a) => a.basis)).toEqual(["churn", "exit-kind", "reputation"]);
    expect(res.adjustments.find((a) => a.basis === "exit-kind")?.factorBps).toBe(0n);
  });
  it("the seven kinds order the doc's cash profiles (hg:4499-4512)", () => {
    const cashFor = (kind: ValuationExitKind): MoneyUnit =>
      exitCashSliceMicroUsd({ ...clean, exitKind: kind }).cashSliceMicroUsd;
    expect(cashFor("ipo")).toBe(HEAD);
    expect(cashFor("strategic-acquisition")).toBe(HEAD);
    expect(cashFor("pe-platform")).toBe(asMoney(900_000_000n));
    expect(cashFor("pe-bolt-on")).toBe(asMoney(800_000_000n));
    expect(cashFor("asset-sale")).toBe(asMoney(700_000_000n));
    expect(cashFor("management-buyout")).toBe(asMoney(500_000_000n));
    expect(cashFor("wind-down")).toBe(asMoney(0n));
  });
  it("an unknown kind refuses the closed-seven wall (save-side ExitKind stays opaque BY DESIGN)", () => {
    expect(() =>
      exitCashSliceMicroUsd({ ...clean, exitKind: "hostile-takeover" as ValuationExitKind }),
    ).toThrow(/economy\/valuation.*closed seven/);
  });
  it("negative readings throw before any arithmetic (forged bps is authoring poison)", () => {
    expect(() => exitCashSliceMicroUsd({ ...clean, headlineOfferMicroUsd: asMoney(-1n) })).toThrow(
      /economy\/valuation/,
    );
    expect(() => exitCashSliceMicroUsd({ ...clean, churnBps: -1n })).toThrow(/economy\/valuation/);
    expect(() => exitCashSliceMicroUsd({ ...clean, writtenOffBps: -1n })).toThrow(/economy\/valuation/);
    expect(() => exitCashSliceMicroUsd({ ...clean, concentrationBps: -5n })).toThrow(/economy\/valuation/);
    expect(() => exitCashSliceMicroUsd({ ...clean, warctCoverageBps: -1n })).toThrow(/economy\/valuation/);
    expect(() => exitCashSliceMicroUsd({ ...clean, reputationBps: -1n })).toThrow(/economy\/valuation/);
  });
  it("zero headline stays zero under any book (no floor can mint money from an empty offer)", () => {
    const res = exitCashSliceMicroUsd({ ...clean, headlineOfferMicroUsd: asMoney(0n), churnBps: 10_000n });
    expect(res.cashSliceMicroUsd).toBe(asMoney(0n));
  });
  it("the result is frozen all the way down (a memo cannot be edited after it ships)", () => {
    const res = exitCashSliceMicroUsd({ ...clean, churnBps: 900n });
    expect(Object.isFrozen(res)).toBe(true);
    expect(Object.isFrozen(res.adjustments)).toBe(true);
    expect(Object.isFrozen(res.adjustments[0])).toBe(true);
  });
  it("pure by construction: identical inputs twice give byte-identical memos", () => {
    const a = exitCashSliceMicroUsd({ ...clean, churnBps: 123n, concentrationBps: 5_000n, exitKind: "pe-platform" });
    const b = exitCashSliceMicroUsd({ ...clean, churnBps: 123n, concentrationBps: 5_000n, exitKind: "pe-platform" });
    const ser = (v: unknown): string =>
      JSON.stringify(v, (_k, x: unknown) => (typeof x === "bigint" ? x + "n" : x))!;
    expect(ser(a)).toBe(ser(b));
  });
});

/* ══════════════════════════ the purity pins ════════════════════════════════ */

describe("purity (zero rolls, fold byte-identity, PROVISIONAL census)", () => {
  it("valuation.ts never mentions streamFor or Math.random — the leaf moves only booked facts", () => {
    const source = readFileSync(fileURLToPath(new URL("../valuation.ts", import.meta.url)), "utf8");
    expect(source).not.toMatch(/streamFor/);
    expect(source).not.toMatch(/Math\.random/);
  });

  // The money lane must not NOTICE this module exists. The golden below was
  // captured on the PRE-EDIT tree (detached worktree at a498a49, before
  // valuation.ts shipped) and RE-PRODUCED byte-for-byte in a separate Node
  // process on the post-edit tree — the same walk in-test now re-pins it
  // against any future fold drift (the negotiate-era fold-identity posture;
  // the a6d47cb... literal of the original scratch probe serialized a
  // different fixture shape and is superseded by THIS reproducible pair —
  // disclosed in the lane report).
  const FOLD_JSON_LEN = 72_223;
  const FOLD_FNV = "4cf033f0e8d27621";

  function foldFixtures(): {
    cfg: EconomyConfig;
    contracts: ReadonlyMap<EntityId, Contract>;
    state: EconomyState;
  } {
    const base = defaultEconomyConfig();
    const calm: EconomyConfig = {
      ...base,
      churn: { ...base.churn, monthlyLogoChurnBpsByBundle: {}, fallbackMonthlyBps: 0n },
      dunning: { ...base.dunning, cardFailureBps: 0n },
    };
    const mk = (id: string, mrc: MoneyUnit, months: number): Contract => ({
      id: asEntityId(id),
      customerEntityId: asEntityId("cust:" + id),
      bundleId: "shared",
      mrcMicroUsd: mrc,
      tcvMicroUsd: asMoney(0n),
      acvMicroUsd: asMoney(0n),
      termStartMin: 0,
      termEndMin: months * MONTH,
      billingCycle: "monthly",
      sla: {
        uptimeTarget: 65_472n, // the probe's literal, NOT fromRatio — this fixture is frozen, see golden note
        responseBudgetUs: 0n,
        creditRate: 0n,
        creditCap: 0n,
        claimWindowUs: 0n,
        autoRenew: false,
        noticePeriodMin: 0,
        threeBreachExitRight: false,
      },
      routingLocks: [],
      shedImmunityClassId: null,
      allocations: [],
    });
    const cA = mk("v1a", asMoney(M100), 24);
    const cB = mk("v1b", asMoney(250_000_000n), 6);
    let state = stateWithCash(5_000_000_000n);
    for (const contract of [cA, cB]) {
      state = registerContractEconomy(
        state,
        { contract, atBusinessMin: 0, clauseRefs: [], grandfather: null, revenueTags: TAGS, commitmentBps: 9_990n },
        calm,
      );
    }
    return { cfg: calm, contracts: new Map([[cA.id, cA], [cB.id, cB]]), state };
  }

  function foldWalk(): string {
    const { cfg, contracts, state } = foldFixtures();
    let prior = state;
    const trail: unknown[] = [];
    for (const [i, minute] of [0, MONTH, 2 * MONTH, 3 * MONTH, 6 * MONTH, 24 * MONTH].entries()) {
      const out = runEconomyTick({ context: ctxAt(minute, BigInt(i)), runSeed: SEED, contracts, prior, cfg });
      prior = out.state;
      trail.push([out.state, out.notices, out.events, out.entries]);
    }
    const serialized = JSON.stringify(trail, (_k, v: unknown) => {
      if (typeof v === "bigint") return v + "n";
      if (v instanceof Map) return [...v.entries()];
      return v;
    })!;
    let hash = 0xcbf29ce484222325n;
    for (let i = 0; i < serialized.length; i++) {
      hash ^= BigInt(serialized.charCodeAt(i));
      hash = (hash * 0x100000001b3n) & 0xffffffffffffffffn;
    }
    return serialized.length + ":" + hash.toString(16).padStart(16, "0");
  }

  it("importing and CALLING the valuation leg changes NOTHING in a six-fold — the twin re-runs equal and match the pre-edit golden", () => {
    // Call every valuation fn first: if any of them touched shared module
    // state, the fold digest would move against the captured literal.
    warctMonths([row(M100, 13)]);
    contractedRevenueShareBps([row(M100, 13)]);
    contractRemainingTerm({ termEndMin: MONTH }, 0);
    tenantWholeLeaseValueMicroUsd({
      mrcMicroUsd: asMoney(M100),
      remainingMonths: 60,
      priceKeyKind: "plan",
      trustBps: -250n,
    });
    exitCashSliceMicroUsd({
      headlineOfferMicroUsd: asMoney(1_000_000n),
      churnBps: 999n,
      writtenOffBps: 0n,
      concentrationBps: null,
      warctCoverageBps: 3_000n,
      reputationBps: null,
      exitKind: "pe-bolt-on",
    });
    const first = foldWalk();
    const second = foldWalk();
    expect(first).toBe(second);
    expect(first).toBe(FOLD_JSON_LEN + ":" + FOLD_FNV);
  });

  it("the shipped valuation book is 20 PROVISIONAL markers, zero RATIFIED (ADR-0016 #10 — ratify-on-playtest)", () => {
    const source = readFileSync(fileURLToPath(new URL("../config.ts", import.meta.url)), "utf8");
    const start = source.indexOf("export const DEFAULT_VALUATION_CONFIG");
    if (start < 0) throw new Error("DEFAULT_VALUATION_CONFIG not found in config.ts");
    const block = source.slice(start, source.indexOf("\n});", start));
    const provisional = (block.match(/PROVISIONAL/g) ?? []).length;
    expect(provisional).toBe(20);
    expect(block).not.toMatch(/RATIFIED/);
  });

  it("the exit vocabulary is the doc's seven, in doc order (hg:4501-4512)", () => {
    expect(VALUATION_EXIT_KINDS).toEqual([
      "ipo",
      "strategic-acquisition",
      "pe-platform",
      "pe-bolt-on",
      "asset-sale",
      "management-buyout",
      "wind-down",
    ]);
    expect(Object.isFrozen(VALUATION_EXIT_KINDS)).toBe(true);
  });
});
