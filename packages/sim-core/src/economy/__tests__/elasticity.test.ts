/**
 * OD-24(a) part 2 — price-override consumption + elasticity (PROVISIONAL
 * constants, ratify-on-playtest). Two families:
 *
 *  A. Unit laws (elasticity.ts pure math + key grammar + as-of resolution).
 *  B. Tick integration, including the NO-ROLL DISCIPLINE proofs: runs with
 *     no book / unkeyed contracts / dead-band overrides are digest-identical
 *     to baseline across state, notices, events AND journal entries; a hike
 *     can only ADD churn (monotone draws on the same streams), a cut can
 *     only remove it — the roll COUNT never changes, only the bps compared.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  asEntityId,
  asMoney,
  type Contract,
  type EntityId,
  type PriceOverrideRecord,
  type RunSeed,
} from "../../types.js";
import {
  PRICE_KEY_KINDS,
  activePriceOverride,
  applyFactorBps,
  assertValidPriceKey,
  churnPressureFactorBps,
  paymentRecoveryFactorBps,
  priceDeviationBps,
  priceElasticityFor,
  priceKeyFor,
  retentionFactorBps,
} from "../elasticity.js";
import { type EconomyConfig, defaultEconomyConfig } from "../config.js";
import { BPS_DEN } from "../money.js";
import { billedMrc, openContractEconomy } from "../contract.js";
import { registerContractEconomy } from "../state.js";
import { runEconomyTick, type EconomyTickOut } from "../tick.js";
import { DAY, MONTH, SEED, TAGS, contractOf, ctxAt, digest, stateWithCash } from "./helpers.js";

const pricing = defaultEconomyConfig().pricing;

function rec(priceUsd: bigint, effective: number | null = null, setAt = 1n): PriceOverrideRecord {
  return Object.freeze({
    targetKind: "plan" as const,
    targetId: asEntityId("pro"),
    newPriceMicroUsd: asMoney(priceUsd * 1_000_000n),
    effectiveAtBusinessMinute: effective,
    setAtTick: setAt,
  });
}

/* ══════════════════════════ A. unit laws ══════════════════════════════════ */

describe("priceKey grammar (boundary parse)", () => {
  it("accepts the closed kinds with colon-bearing ids", () => {
    for (const kind of PRICE_KEY_KINDS) expect(() => assertValidPriceKey(`${kind}:a:b`, "t")).not.toThrow();
    expect(priceKeyFor("plan", asEntityId("web/basic"))).toBe("plan:web/basic");
  });

  it("rejects unknown kinds and empty segments, naming the closed set", () => {
    expect(() => assertValidPriceKey("tier:pro", "t")).toThrow(/economy\/elasticity.*tier.*plan, contract-class, sku/);
    expect(() => assertValidPriceKey("plan:", "t")).toThrow(/non-empty/);
    expect(() => assertValidPriceKey(":pro", "t")).toThrow(/non-empty/);
    expect(() => assertValidPriceKey("plan", "t")).toThrow(/non-empty/);
  });

  it("drift pin: the mirror matches the door's private PRICE_TARGET_KINDS literal", () => {
    const source = readFileSync(
      fileURLToPath(new URL("../../pipeline/intent-door.ts", import.meta.url)),
      "utf8",
    );
    const match = source.match(/const PRICE_TARGET_KINDS\b[\s\S]*?\(\[([^\]]*)\]\)/);
    expect(match).not.toBeNull();
    const doorKinds = [...match![1]!.matchAll(/"([^"]+)"/g)].map((m) => m[1]!);
    expect(PRICE_KEY_KINDS).toEqual(doorKinds);
  });
});

describe("activePriceOverride (as-of resolution)", () => {
  const book = new Map([["plan:pro", rec(120n, 500)]]);
  it("no book / no key / no entry ⇒ null", () => {
    expect(activePriceOverride(undefined, "plan:pro", 900)).toBeNull();
    expect(activePriceOverride(book, undefined, 900)).toBeNull();
    expect(activePriceOverride(book, "plan:other", 900)).toBeNull();
  });
  it("future effectiveAtBusinessMinute is not yet law; past or null is", () => {
    expect(activePriceOverride(book, "plan:pro", 499)).toBeNull();
    expect(activePriceOverride(book, "plan:pro", 500)!.newPriceMicroUsd).toBe(asMoney(120_000_000n));
    const nowBook = new Map([["plan:pro", rec(120n, null)]]);
    expect(activePriceOverride(nowBook, "plan:pro", 0)).not.toBeNull();
  });
});

describe("elasticity math (exact bigint bps)", () => {
  it("priceDeviationBps: signed half-away ratios; free reference throws", () => {
    expect(priceDeviationBps(asMoney(150n), asMoney(100n))).toBe(5_000n);
    expect(priceDeviationBps(asMoney(75n), asMoney(100n))).toBe(-2_500n);
    expect(priceDeviationBps(asMoney(100n), asMoney(300n))).toBe(-6_667n); // −66.666… half-AWAY
    expect(() => priceDeviationBps(asMoney(10n), asMoney(0n))).toThrow(/reference > 0/);
  });

  it("dead band is INCLUSIVE inertia: ±10% stays exactly 1.0, 1bp outside moves", () => {
    for (const dev of [1_000n, -1_000n, 0n]) {
      expect(churnPressureFactorBps(dev, pricing)).toBe(BPS_DEN);
      expect(retentionFactorBps(dev, pricing)).toBe(BPS_DEN);
      expect(paymentRecoveryFactorBps(dev, pricing)).toBe(BPS_DEN);
    }
    expect(churnPressureFactorBps(1_001n, pricing)).toBe(10_002n); // 15_000×1 half-away → 2
  });

  it("+50% hike: churn 1.6×, retention 0.68×, recovery 0.8× (PROVISIONAL goldens)", () => {
    expect(churnPressureFactorBps(5_000n, pricing)).toBe(16_000n);
    expect(retentionFactorBps(5_000n, pricing)).toBe(6_800n);
    expect(paymentRecoveryFactorBps(5_000n, pricing)).toBe(8_000n);
  });

  it("saturation clamps: ×3 churn ceiling, ×0.5 floors, mirrors cap at 1.0", () => {
    expect(churnPressureFactorBps(190_000n, pricing)).toBe(30_000n);
    expect(churnPressureFactorBps(-190_000n, pricing)).toBe(5_000n);
    expect(retentionFactorBps(190_000n, pricing)).toBe(1_000n);
    expect(retentionFactorBps(-190_000n, pricing)).toBe(BPS_DEN); // cuts buy NO certainty
    expect(paymentRecoveryFactorBps(190_000n, pricing)).toBe(5_000n);
    expect(paymentRecoveryFactorBps(-190_000n, pricing)).toBe(BPS_DEN);
  });

  it("applyFactorBps: identity exit is EXACT; otherwise half-away", () => {
    expect(applyFactorBps(450n, BPS_DEN)).toBe(450n);
    expect(applyFactorBps(450n, 16_000n)).toBe(720n);
    expect(applyFactorBps(3n, 5_000n)).toBe(2n); // 1.5 → away from zero
  });

  it("priceElasticityFor: no override ⇒ null; free-tier authored ⇒ billing only", () => {
    const book = new Map([["plan:pro", rec(2_000n)]]);
    const c = contractOf("p1");
    const econ = openContractEconomy(
      { contract: c, atBusinessMin: 0, clauseRefs: [], grandfather: null, revenueTags: TAGS, priceKey: "plan:pro" },
      defaultEconomyConfig(),
    );
    expect(priceElasticityFor(c, econ, undefined, 0, defaultEconomyConfig())).toBeNull();
    expect(priceElasticityFor(c, econ, book, 0, defaultEconomyConfig())!.churnBpsFactor).toBe(30_000n);
    const free = contractOf("p0", { mrcMicroUsd: asMoney(0n) });
    const freeEcon = openContractEconomy(
      { contract: free, atBusinessMin: 0, clauseRefs: [], grandfather: null, revenueTags: TAGS, priceKey: "plan:pro" },
      defaultEconomyConfig(),
    );
    const factors = priceElasticityFor(free, freeEcon, book, 0, defaultEconomyConfig())!;
    expect(factors.effectiveBaseMicroUsd).toBe(asMoney(2_000_000_000n));
    expect(factors.churnBpsFactor).toBe(BPS_DEN); // no ratio to speak of — inert, not a throw
  });
});

describe("billedMrc chain with baseOverride (contract.ts)", () => {
  const cfg = defaultEconomyConfig();
  const c = contractOf("b1");
  const plain = openContractEconomy(
    { contract: c, atBusinessMin: 0, clauseRefs: [], grandfather: null, revenueTags: TAGS },
    cfg,
  );

  it("override replaces the authored base; null keeps it", () => {
    expect(billedMrc(c, plain, 0, null, 0n, cfg)).toBe(asMoney(100_000_000n));
    expect(billedMrc(c, plain, 0, null, 0n, cfg, asMoney(150_000_000n))).toBe(asMoney(150_000_000n));
  });

  it("escalator compounds ON the override; grandfather still WINS; MFN applies last", () => {
    const yearTwo = cfg.calendar.minutesPerMonth * cfg.calendar.monthsPerYear;
    const escalator = { annualBps: 300n, firstApplicationYear: 1 };
    expect(billedMrc(c, plain, yearTwo, escalator, 0n, cfg, asMoney(200_000_000n))).toBe(asMoney(206_000_000n));
    const locked = { ...plain, grandfather: { lockedMrc: asMoney(90_000_000n), lockedThroughMin: 10 * MONTH } };
    expect(billedMrc(c, locked, 0, null, 0n, cfg, asMoney(200_000_000n))).toBe(asMoney(90_000_000n));
    expect(billedMrc(c, plain, 0, null, 1_000n, cfg, asMoney(150_000_000n))).toBe(asMoney(135_000_000n)); // −10% MFN last
  });
});

describe("priceKey sparseness (byte-identity of the record itself)", () => {
  it("absent unless the host classifies at signing", () => {
    const cfg = defaultEconomyConfig();
    const c = contractOf("s1");
    const plain = openContractEconomy(
      { contract: c, atBusinessMin: 0, clauseRefs: [], grandfather: null, revenueTags: TAGS },
      cfg,
    );
    expect(Object.prototype.hasOwnProperty.call(plain, "priceKey")).toBe(false);
    const keyed = openContractEconomy(
      { contract: c, atBusinessMin: 0, clauseRefs: [], grandfather: null, revenueTags: TAGS, priceKey: "plan:pro" },
      cfg,
    );
    expect(keyed.priceKey).toBe("plan:pro");
    expect(() =>
      openContractEconomy(
        { contract: c, atBusinessMin: 0, clauseRefs: [], grandfather: null, revenueTags: TAGS, priceKey: "tier:x" },
        cfg,
      ),
    ).toThrow(/economy\/elasticity.*contract 's1'/);
  });
});

/* ═══════════════════════ B. tick integration ══════════════════════════════ */

type Run = ReturnType<typeof runEconomyTick>;

function fullDigest(r: Run): string {
  return digest([r.state, r.notices, r.events, r.entries]);
}

interface Scenario {
  readonly cfg: EconomyConfig;
  readonly map: ReadonlyMap<EntityId, Contract>;
  readonly state: ReturnType<typeof stateWithCash>;
}

function scenario(contracts: readonly Contract[], cfg: EconomyConfig, priceKeys?: ReadonlyMap<string, string>): Scenario {
  const map = new Map<EntityId, Contract>(contracts.map((c) => [c.id, c]));
  let s = stateWithCash(5_000_000_000n);
  for (const c of contracts) {
    s = registerContractEconomy(
      s,
      {
        contract: c,
        atBusinessMin: 0,
        clauseRefs: c.sla.autoRenew ? ["auto-renew"] : [],
        grandfather: null,
        revenueTags: TAGS,
        commitmentBps: 9_990n,
        ...(priceKeys?.has(c.id) === true ? { priceKey: priceKeys.get(c.id)! } : {}),
      },
      cfg,
    );
  }
  return { cfg, map, state: s };
}

function runWeeks(sc: Scenario, ticks: readonly number[], overrides?: ReadonlyMap<string, PriceOverrideRecord>, seed: RunSeed = SEED): Run {
  // structuredClone + notice/event accumulation: forked whole-run comparisons
  // need the FULL story per run (churn at month 1 must be visible in a
  // run that ends at month 4), and prior state must never be shared.
  let prior = structuredClone(sc.state);
  let last: Run | null = null;
  const notices: Array<EconomyTickOut["notices"][number]> = [];
  const events: Array<EconomyTickOut["events"][number]> = [];
  const entries: Array<EconomyTickOut["entries"][number]> = [];
  for (const minute of ticks) {
    last = runEconomyTick({
      context: ctxAt(minute, BigInt(Math.floor(minute / 60))),
      runSeed: seed,
      contracts: sc.map,
      prior,
      cfg: sc.cfg,
      ...(overrides === undefined ? {} : { priceOverrides: overrides }),
    });
    prior = last.state;
    notices.push(...last.notices);
    events.push(...last.events);
    entries.push(...last.entries);
  }
  return { ...last!, notices, events, entries };
}

function noticeKinds(r: Run): string[] {
  return r.notices.map((n) => n.kind);
}

function churnedIds(r: Run): Set<string> {
  return new Set(r.notices.filter((n) => n.kind === "churned-voluntary").map((n) => String(n.contractId)));
}

function cfgPatched(patch: (cfg: EconomyConfig) => EconomyConfig): EconomyConfig {
  return patch(defaultEconomyConfig());
}

describe("no-roll discipline (default-OFF byte-identity)", () => {
  const quiet = cfgPatched((cfg) => ({
    ...cfg,
    dunning: { ...cfg.dunning, cardFailureBps: 0n },
  }));
  const contracts = [
    contractOf("n1", { termEndMin: 24 * MONTH }),
    contractOf("n2", { termEndMin: 24 * MONTH, billingCycle: "hourly" }),
    contractOf("n3", { termEndMin: 12 * MONTH }),
  ];
  const ticks = [0, MONTH, 2 * MONTH, 3 * MONTH];
  const keys = new Map([["n1", "plan:pro"], ["n3", "plan:pro"]]);

  it("no book, empty book, authored-price book, future-dated: digest-identical", () => {
    const sc = scenario(contracts, quiet, keys);
    const base = runWeeks(sc, ticks);
    const explicitUndefined = runWeeks(sc, ticks, undefined);
    expect(fullDigest(explicitUndefined)).toBe(fullDigest(base));
    const emptyBook = runWeeks(sc, ticks, new Map());
    expect(fullDigest(emptyBook)).toBe(fullDigest(base));
    // A book priced EXACTLY at authored ⇒ zero deviation AND zero billing
    // delta ⇒ every byte (state, notices, events, entries) is unchanged.
    const authored = runWeeks(sc, ticks, new Map([["plan:pro", rec(100n)]]));
    expect(fullDigest(authored)).toBe(fullDigest(base));
    // future-dated (as-of law) — inert TODAY:
    const future = runWeeks(sc, ticks, new Map([["plan:pro", rec(2_000n, 99 * MONTH)]]));
    expect(fullDigest(future)).toBe(fullDigest(base));
    // the churn dice were ROLLING in these runs (default shared 450bps):
    expect(ticks.length).toBe(4);
  });

  it("dead-band (+5%) moves the BILLED line but never the DICE (no-roll law)", () => {
    const sc = scenario(contracts, quiet, keys);
    const base = runWeeks(sc, ticks);
    const inBand = runWeeks(sc, ticks, new Map([["plan:pro", rec(105n)]]));
    // Factors are exactly 1.0 inside the ±10% band ⇒ the pre-existing
    // arithmetic runs verbatim: identical notice stream and identical
    // contract phases. Only the money bytes move — that is the POINT of
    // the band (odds inertia), not a leak (billing is deliberately NOT
    // dead-banded: the price line is law the moment it is effective).
    expect(noticeKinds(inBand)).toEqual(noticeKinds(base));
    expect([...inBand.state.contractEconomy.values()].map((e) => `${e.contractId}:${e.phase}`)).toEqual(
      [...base.state.contractEconomy.values()].map((e) => `${e.contractId}:${e.phase}`),
    );
    const baseIssued = base.notices.filter((n) => n.kind === "invoice-issued").map((n) => String(n.amount));
    const bandIssued = inBand.notices.filter((n) => n.kind === "invoice-issued").map((n) => String(n.amount));
    expect(bandIssued.join()).not.toBe(baseIssued.join()); // billing DID bite
  });

  it("book with NO keyed contracts is digest-identical", () => {
    const sc = scenario(contracts, quiet); // nobody classified
    const base = runWeeks(sc, ticks);
    const book = runWeeks(sc, ticks, new Map([["plan:pro", rec(2_000n)]]));
    expect(fullDigest(book)).toBe(fullDigest(base));
  });
});

describe("billing consumption (invoice calendar reads the book)", () => {
  it("an active override replaces the billed base as-of the tick", () => {
    const quiet = cfgPatched((cfg) => ({
      ...cfg,
      churn: { ...cfg.churn, monthlyLogoChurnBpsByBundle: {}, fallbackMonthlyBps: 0n },
      dunning: { ...cfg.dunning, cardFailureBps: 0n },
    }));
    const a = contractOf("g1c", { termEndMin: 24 * MONTH });
    const sc = scenario([a], quiet, new Map([[a.id, "plan:pro"]]));
    const base = runWeeks(sc, [0]);
    const hike = runWeeks(sc, [0], new Map([["plan:pro", rec(150n)]]));
    const baseGross = base.notices.find((n) => n.kind === "invoice-issued")!.amount!;
    const hikeGross = hike.notices.find((n) => n.kind === "invoice-issued")!.amount!;
    expect(baseGross).toBe(asMoney(100_000_000n));
    expect(hikeGross).toBe(asMoney(150_000_000n));
    // as-of: the same book only bites once its minute arrives — a single
    // tick-0 run bills authored, the forked two-tick run's SECOND tick
    // (the returned one) bills the override.
    const atZero = runWeeks(sc, [0], new Map([["plan:pro", rec(150n, MONTH)]]));
    expect(atZero.notices.find((n) => n.kind === "invoice-issued")!.amount).toBe(asMoney(100_000_000n));
    const atMonth = runWeeks(sc, [0, MONTH], new Map([["plan:pro", rec(150n, MONTH)]]));
    const issued = atMonth.notices.filter((n) => n.kind === "invoice-issued").map((n) => n.amount);
    expect(issued[0]).toBe(asMoney(100_000_000n)); // tick 0: authored (not yet effective)
    expect(issued[issued.length - 1]).toBe(asMoney(150_000_000n)); // MONTH tick: the book bites
  });
});

describe("churn direction (monotone draws, scaling only)", () => {
  const loud = cfgPatched((cfg) => ({
    ...cfg,
    churn: { ...cfg.churn, monthlyLogoChurnBpsByBundle: { shared: 3_400n }, fallbackMonthlyBps: 3_400n },
    dunning: { ...cfg.dunning, cardFailureBps: 0n },
  }));
  const roster = ["k1", "k2", "k3", "k4", "k5", "k6"].map((id) => contractOf(id, { termEndMin: 24 * MONTH }));
  const keyed = new Map(roster.map((c) => [c.id, "plan:pro"]));
  const sc = scenario(roster, loud, keyed);
  const ticks = [MONTH, 2 * MONTH, 3 * MONTH, 4 * MONTH];

  it("hike ×20 churns EVERY active contract at the first roll (bps ≥ 10_000 law)", () => {
    const hike = runWeeks(sc, ticks, new Map([["plan:pro", rec(2_000n)]]));
    expect(churnedIds(hike)).toEqual(new Set(roster.map((c) => String(c.id))));
  });

  it("hike churn-set ⊇ baseline ⊇ cut churn-set on identical draws", () => {
    // ONE roll per contract: draws are per-(seed, domain, month, id), so the
    // three runs share EXACTLY the same six dice. ×20 hike clamps bps to
    // 10_000 ⇒ churn is CERTAIN for every contract; 3400bps baseline and the
    // ×20-cut (500bps, clamped from 3400×0.147≈500) churn strict subsets.
    const one = [MONTH];
    const base = churnedIds(runWeeks(sc, one));
    const hike = churnedIds(runWeeks(sc, one, new Map([["plan:pro", rec(2_000n)]])));
    const cut = churnedIds(runWeeks(sc, one, new Map([["plan:pro", rec(20n)]])));
    expect(hike.size).toBe(6); // saturation law: bps ≥ 10_000 forces ALL six
    for (const id of base) expect(hike.has(id)).toBe(true);
    for (const id of cut) expect(base.has(id)).toBe(true);
    expect(hike.size).toBeGreaterThan(base.size); // the ×20 hike MUST move odds
    expect(base.size).toBeGreaterThanOrEqual(cut.size);
  });
});

describe("renewal-cliff (win/loss pulse) direction", () => {
  const calm = cfgPatched((cfg) => ({
    ...cfg,
    churn: { ...cfg.churn, monthlyLogoChurnBpsByBundle: {}, fallbackMonthlyBps: 0n },
    dunning: { ...cfg.dunning, cardFailureBps: 0n },
  }));

  it("brute-force witness: a hike flips renew→lapse on the SAME single draw", () => {
    let flipped = 0;
    for (let i = 1; i <= 30 && flipped === 0; i += 1) {
      const c = contractOf(`r${i}`, { termEndMin: 12 * MONTH });
      const sc = scenario([c], calm, new Map([[c.id, "plan:pro"]]));
      const base = runWeeks(sc, [12 * MONTH]);
      const hike = runWeeks(sc, [12 * MONTH], new Map([["plan:pro", rec(2_000n)]]));
      const baseRenewed = base.notices.some((n) => n.kind === "cliff-renewed");
      const hikeLapsed = hike.notices.some((n) => n.kind === "cliff-lapsed");
      if (baseRenewed && hikeLapsed) flipped += 1;
      if (i === 30) throw new Error("no renewal→lapse flip in 30 ids — monotonicity broken?");
    }
    expect(flipped).toBe(1);
  });
});

describe("dunning recovery direction", () => {
  // Every payment attempt declines (cardFailure 100%), so at DAY every
  // failed invoice crosses into `retry` and draws ONE recovery roll keyed
  // (seed, "economy/dunning/retry", dueAtMin, contractId). Authored-price
  // book ⇒ factor 1.0 ⇒ recovery iff draw < 1200; ×20 hike ⇒ factor 0.5 ⇒
  // iff draw < 600. Same stream ⇒ flip exactly when 600 ≤ draw < 1200.
  const doomed = cfgPatched((cfg) => ({
    ...cfg,
    churn: { ...cfg.churn, monthlyLogoChurnBpsByBundle: {}, fallbackMonthlyBps: 0n },
    dunning: { ...cfg.dunning, cardFailureBps: 10_000n },
  }));
  const authoredBook = new Map<string, PriceOverrideRecord>([["plan:pro", rec(100n)]]);
  const hikeBook = new Map<string, PriceOverrideRecord>([["plan:pro", rec(2_000n)]]);

  it("brute-force witness: a hike flips recovered→advanced on the SAME single draw", () => {
    for (let i = 1; i <= 60; i += 1) {
      const c = contractOf(`d${i}`, { termEndMin: 24 * MONTH });
      const sc = scenario([c], doomed, new Map([[c.id, "plan:pro"]]));
      const flat = runWeeks(sc, [0, DAY], authoredBook);
      const hike = runWeeks(sc, [0, DAY], hikeBook);
      const recoveredFlat = flat.notices.some((n) => n.kind === "dunning-recovered");
      const recoveredHike = hike.notices.some((n) => n.kind === "dunning-recovered");
      if (recoveredFlat && !recoveredHike) {
        expect(hike.notices.some((n) => n.kind === "dunning-stage")).toBe(true);
        return;
      }
      if (i === 60) throw new Error("no recovered→advanced flip in 60 ids — monotonicity broken?");
    }
  });
});
