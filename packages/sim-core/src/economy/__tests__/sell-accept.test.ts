/**
 * ADR-0016 mechanic B — sell acceptance dice (economy/sell.ts + the
 * step-5.5 fold in economy/tick.ts).
 *
 * Arms: the elasticity-mirror curve, the two-domain "never certain" law,
 * anchor resolution (catalog > installed base > unadjudicated), the
 * fingerprint re-roll law, the zero-money guard, the dead-band twin,
 * reputation neutrality of the two new notice kinds, the 29→31
 * notice-kind census, and the door key-grammar drift pin.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  asCauseId,
  asEntityId,
  asMoney,
  asRunSeed,
  type Contract,
  type EntityId,
  type MoneyUnit,
  type RunSeed,
  type SellOffer,
} from "../../types.js";
import { defaultEconomyConfig, DEFAULT_SELL_CONFIG, type EconomyConfig } from "../config.js";
import { registerContractEconomy, type EconomyState } from "../state.js";
import { runEconomyTick, type EconomyNotice } from "../tick.js";
import {
  adjudicateSellOffers,
  sellAcceptanceBps,
  sellAnchorFromContracts,
  type SellVerdict,
} from "../sell.js";
import { BPS_DEN } from "../money.js";
import {
  ctxAt,
  contractOf,
  digest,
  MONTH,
  stateWithCash,
  TAGS,
} from "./helpers.js";

const ANCHOR = asMoney(100_000_000n); // $100 — the helpers' default MRC

function offer(
  targetId: string,
  offerPriceMicroUsd: bigint,
  over: Partial<Pick<SellOffer, "termMonths" | "shippedAtTick" | "effectiveAtBusinessMinute">> = {},
  targetKind: SellOffer["targetKind"] = "plan",
): SellOffer {
  return Object.freeze({
    targetKind,
    targetId: asEntityId(targetId),
    offerPriceMicroUsd: asMoney(offerPriceMicroUsd),
    termMonths: over.termMonths ?? 12,
    shippedAtTick: over.shippedAtTick ?? 5n,
    effectiveAtBusinessMinute:
      over.effectiveAtBusinessMinute === undefined ? null : over.effectiveAtBusinessMinute,
  });
}

function book(entries: ReadonlyArray<readonly [string, SellOffer]>): ReadonlyMap<string, SellOffer> {
  return new Map(entries);
}

/* ═══════════════════ A. the curve — elasticity's mirror ═══════════════════ */

describe("sellAcceptanceBps — the mirrored elasticity curve", () => {
  it("at-market offers sit on the base rate", () => {
    expect(sellAcceptanceBps(ANCHOR, ANCHOR)).toBe(DEFAULT_SELL_CONFIG.acceptBaseBps);
  });
  it("dead band is INCLUSIVE at both edges (elasticity twin): ±1,000 bps moves nothing", () => {
    expect(sellAcceptanceBps(asMoney(101_000_000n), ANCHOR)).toBe(DEFAULT_SELL_CONFIG.acceptBaseBps);
    expect(sellAcceptanceBps(asMoney(99_000_000n), ANCHOR)).toBe(DEFAULT_SELL_CONFIG.acceptBaseBps);
  });
  it("out-of-band leverage is coefficient × deviation / 10,000, half-away — up and down", () => {
    // 20% above: deviation 2000, out-of-band 1000, adjustment 1500 ⇒ 6000.
    expect(sellAcceptanceBps(asMoney(120_000_000n), ANCHOR)).toBe(6_000n);
    // 20% below: mirrored lift ⇒ 9000.
    expect(sellAcceptanceBps(asMoney(80_000_000n), ANCHOR)).toBe(9_000n);
  });
  it("clamps BOTH ways: deep premium hits the floor, deep bargain hits the ceiling", () => {
    expect(sellAcceptanceBps(asMoney(1_000_000_000n), ANCHOR)).toBe(DEFAULT_SELL_CONFIG.acceptFloorBps);
    expect(sellAcceptanceBps(asMoney(1n), ANCHOR)).toBe(DEFAULT_SELL_CONFIG.acceptCeilingBps);
  });
  it("NEVER CERTAIN (ADR-0014 #D4 two-domain law): ceiling under one, floor above zero", () => {
    expect(DEFAULT_SELL_CONFIG.acceptCeilingBps).toBeLessThan(BPS_DEN);
    expect(DEFAULT_SELL_CONFIG.acceptFloorBps).toBeGreaterThan(0n);
    // No price, however sweet or dire, escapes the clamps:
    for (const bargain of [1n, 1_000n, 1_000_000n]) {
      expect(sellAcceptanceBps(asMoney(bargain), ANCHOR)).toBeLessThan(BPS_DEN);
    }
    for (const premium of [10n, 1_000n, ANCHOR * 100n]) {
      expect(sellAcceptanceBps(asMoney(premium), ANCHOR)).toBeGreaterThan(0n);
    }
  });
  it("monotone non-increasing in price", () => {
    let previous = sellAcceptanceBps(asMoney(1n), ANCHOR);
    for (let step = 2n; step <= 300_000_000n; step += 3_000_000n) {
      const next = sellAcceptanceBps(asMoney(step), ANCHOR);
      expect(next <= previous).toBe(true);
      previous = next;
    }
  });
  it("fails loud on a zero/negative anchor — no-anchor is resolved by the CALLER as unadjudicated", () => {
    expect(() => sellAcceptanceBps(ANCHOR, asMoney(0n))).toThrow(RangeError);
    expect(() => sellAcceptanceBps(ANCHOR, asMoney(-1n))).toThrow(/unadjudicated/);
  });
  it("pure: same input, same output (Atomic Predictability)", () => {
    const a = sellAcceptanceBps(asMoney(64_000_000n), ANCHOR);
    const b = sellAcceptanceBps(asMoney(64_000_000n), ANCHOR);
    expect(a).toBe(b);
  });
});

/* ══════════════ B. adjudicateSellOffers — anchors, as-of, fingerprints ══════════════ */

const SEED_A: RunSeed = asRunSeed(904n);

describe("adjudicateSellOffers — anchor resolution", () => {
  it("catalog authority WINS over the installed base when both exist", () => {
    const out = adjudicateSellOffers({
      offers: book([["plan:bridge", offer("bridge", 100_000_000n)]]),
      marketRates: new Map<string, MoneyUnit>([["plan:bridge", asMoney(200_000_000n)]]),
      contractAnchor: new Map<string, MoneyUnit>([["plan:bridge", ANCHOR]]),
      now: 100,
      runSeed: SEED_A,
      cfg: DEFAULT_SELL_CONFIG,
    });
    // Against a 200M catalog, a 100M offer is a deep bargain ⇒ ceiling stamp;
    // against the 100M MRC it would be at-market (base). The verdict records
    // WHICH anchor adjudicated — 9_500n proves the catalog was read.
    expect(out.fresh[0]?.verdict.anchorMicroUsd).toBe(asMoney(200_000_000n));
    expect(out.fresh[0]?.verdict.acceptanceBps).toBe(DEFAULT_SELL_CONFIG.acceptCeilingBps);
  });
  it("installed-base fallback: no catalog ⇒ keyed contract MRC anchors the offer", () => {
    const out = adjudicateSellOffers({
      offers: book([["plan:bridge", offer("bridge", 100_000_000n)]]),
      contractAnchor: new Map<string, MoneyUnit>([["plan:bridge", ANCHOR]]),
      now: 100,
      runSeed: SEED_A,
      cfg: DEFAULT_SELL_CONFIG,
    });
    expect(out.fresh[0]?.verdict.anchorMicroUsd).toBe(ANCHOR);
    expect(out.fresh[0]?.verdict.acceptanceBps).toBe(DEFAULT_SELL_CONFIG.acceptBaseBps);
  });
  it("UNADJUDICATED: no anchor at all ⇒ no verdict, no notice fuel, verdicts stay null", () => {
    const out = adjudicateSellOffers({
      offers: book([["plan:ghost", offer("ghost", 90_000_000n)]]),
      now: 100,
      runSeed: SEED_A,
      cfg: DEFAULT_SELL_CONFIG,
    });
    expect(out.fresh).toEqual([]);
    expect(out.verdicts).toBeNull();
  });
  it("a ZERO anchor is unadjudicated, never a rate (free-tier twin); a NEGATIVE catalog entry throws naming the key", () => {
    const zero = adjudicateSellOffers({
      offers: book([["plan:free", offer("free", 90_000_000n)]]),
      marketRates: new Map<string, MoneyUnit>([["plan:free", asMoney(0n)]]),
      now: 100,
      runSeed: SEED_A,
      cfg: DEFAULT_SELL_CONFIG,
    });
    expect(zero.fresh).toEqual([]);
    expect(() =>
      adjudicateSellOffers({
        offers: book([["plan:bad", offer("bad", 90_000_000n)]]),
        marketRates: new Map<string, MoneyUnit>([["plan:bad", asMoney(-5n)]]),
        now: 100,
        runSeed: SEED_A,
        cfg: DEFAULT_SELL_CONFIG,
      }),
    ).toThrow(/plan:bad/);
  });
  it("sellAnchorFromContracts is first-wins (caller feeds EntityId-sorted contracts)", () => {
    const anchor = sellAnchorFromContracts([
      { priceKey: "plan:x", mrcMicroUsd: asMoney(11n) },
      { priceKey: "plan:x", mrcMicroUsd: asMoney(22n) },
    ]);
    expect(anchor.get("plan:x")).toBe(asMoney(11n));
  });
});

describe("adjudicateSellOffers — as-of and fingerprint law", () => {
  const anchored = book([["plan:bridge", offer("bridge", 90_000_000n)]]);
  const rates = new Map<string, MoneyUnit>([["plan:bridge", ANCHOR]]);
  const base = {
    marketRates: rates,
    now: 500,
    runSeed: SEED_A,
    cfg: DEFAULT_SELL_CONFIG,
  } as const;

  it("future-effective offers are not yet law; the expiry minute IS (activePriceOverride twin)", () => {
    const future = adjudicateSellOffers({
      ...base,
      offers: book([["plan:bridge", offer("bridge", 90_000_000n, { effectiveAtBusinessMinute: 501 })]]),
    });
    expect(future.fresh).toEqual([]);
    const arriving = adjudicateSellOffers({
      ...base,
      offers: book([["plan:bridge", offer("bridge", 90_000_000n, { effectiveAtBusinessMinute: 500 })]]),
    });
    expect(arriving.fresh).toHaveLength(1);
  });
  it("verdicts PERSIST: same fingerprint ⇒ zero fresh, prior map rides BY IDENTITY (replays never re-roll)", () => {
    const first = adjudicateSellOffers({ ...base, prior: null, offers: anchored });
    const again = adjudicateSellOffers({ ...base, prior: first.verdicts, offers: anchored });
    expect(again.fresh).toEqual([]);
    expect(again.verdicts).toBe(first.verdicts);
  });
  it("every fingerprint leg re-rolls: price, term, and a re-booked shippedAtTick", () => {
    const first = adjudicateSellOffers({ ...base, prior: null, offers: anchored });
    const amended = adjudicateSellOffers({
      ...base,
      prior: first.verdicts,
      offers: book([["plan:bridge", offer("bridge", 85_000_000n)]]),
    });
    expect(amended.fresh).toHaveLength(1);
    const retermed = adjudicateSellOffers({
      ...base,
      prior: first.verdicts,
      offers: book([["plan:bridge", offer("bridge", 90_000_000n, { termMonths: 24 })]]),
    });
    expect(retermed.fresh).toHaveLength(1);
    const rebooked = adjudicateSellOffers({
      ...base,
      prior: first.verdicts,
      offers: book([["plan:bridge", offer("bridge", 90_000_000n, { shippedAtTick: 9n })]]),
    });
    expect(rebooked.fresh).toHaveLength(1);
    // Re-rolled verdicts land at the CURRENT slot minute, not the old one.
    expect(rebooked.fresh[0]?.verdict.adjudicatedAtBusinessMin).toBe(500);
  });
  it("idle book (absent/empty offers): prior verdicts ride by identity, nothing rolls", () => {
    const first = adjudicateSellOffers({ ...base, prior: null, offers: anchored });
    const absent = adjudicateSellOffers({ ...base, prior: first.verdicts });
    expect(absent.verdicts).toBe(first.verdicts);
    const empty = adjudicateSellOffers({ ...base, prior: first.verdicts, offers: new Map() });
    expect(empty.verdicts).toBe(first.verdicts);
    const never = adjudicateSellOffers({ ...base, offers: new Map() });
    expect(never.verdicts).toBeNull();
  });
  it("merged map is code-unit sorted, verdicts for vanished keys carry forward", () => {
    const two = adjudicateSellOffers({
      ...base,
      prior: null,
      offers: book([
        ["plan:zulu", offer("zulu", 90_000_000n)],
        ["plan:alpha", offer("alpha", 90_000_000n)],
      ]),
      marketRates: new Map<string, MoneyUnit>([
        ["plan:zulu", ANCHOR],
        ["plan:alpha", ANCHOR],
      ]),
    });
    expect([...(two.verdicts?.keys() ?? [])]).toEqual(["plan:alpha", "plan:zulu"]);
    const shrunk = adjudicateSellOffers({
      ...base,
      prior: two.verdicts,
      offers: book([["plan:zulu", offer("zulu", 90_000_000n)]]),
      marketRates: new Map<string, MoneyUnit>([["plan:zulu", ANCHOR]]),
    });
    // alpha vanished from the book; its history survives untouched.
    expect(shrunk.verdicts?.get("plan:alpha")).toBe(two.verdicts?.get("plan:alpha"));
  });
});

/* ═════════════════ C. the dice — determinism and distribution ═════════════════ */

describe("adjudicateSellOffers — the economy/sell stream", () => {
  it("×100 replays of the same minute sequence are byte-identical (pure helper)", () => {
    const seen = new Set<string>();
    for (let pass = 0; pass < 100; pass += 1) {
      let prior: ReadonlyMap<string, SellVerdict> | null = null;
      for (const minute of [10, 60, 120, 1_440]) {
        const out = adjudicateSellOffers({
          prior,
          offers: book([
            ["plan:cheap", offer("cheap", 60_000_000n)],
            ["plan:dear", offer("dear", 160_000_000n)],
          ]),
          marketRates: new Map<string, MoneyUnit>([
            ["plan:cheap", ANCHOR],
            ["plan:dear", ANCHOR],
          ]),
          now: minute,
          runSeed: SEED_A,
          cfg: DEFAULT_SELL_CONFIG,
        });
        prior = out.verdicts;
      }
      seen.add(digest(prior));
    }
    expect(seen.size).toBe(1);
  });
  it("100-seed sweep: deep-below-market accepts STRICTLY more often than deep-above", () => {
    let bargainAccepts = 0;
    let premiumAccepts = 0;
    for (let s = 1n; s <= 100n; s += 1n) {
      const seed = asRunSeed(s);
      const bargain = adjudicateSellOffers({
        offers: book([["plan:row", offer("row", 60_000_000n)]]),
        marketRates: new Map<string, MoneyUnit>([["plan:row", ANCHOR]]),
        now: 42,
        runSeed: seed,
        cfg: DEFAULT_SELL_CONFIG,
      });
      const premium = adjudicateSellOffers({
        offers: book([["plan:row", offer("row", 160_000_000n)]]),
        marketRates: new Map<string, MoneyUnit>([["plan:row", ANCHOR]]),
        now: 42,
        runSeed: seed,
        cfg: DEFAULT_SELL_CONFIG,
      });
      if (bargain.fresh[0]?.verdict.accepted === true) bargainAccepts += 1;
      if (premium.fresh[0]?.verdict.accepted === true) premiumAccepts += 1;
    }
    expect(bargainAccepts).toBeGreaterThan(premiumAccepts);
  });
  it("at the ceiling a sale is STILL never certain: 200 seeds, at least one refusal at 9,500 bps", () => {
    let refuses = 0;
    for (let s = 1n; s <= 200n; s += 1n) {
      const out = adjudicateSellOffers({
        offers: book([["plan:row", offer("row", 1n)]]), // clamped to the ceiling
        marketRates: new Map<string, MoneyUnit>([["plan:row", ANCHOR]]),
        now: 7,
        runSeed: asRunSeed(s),
        cfg: DEFAULT_SELL_CONFIG,
      });
      if (out.fresh[0]?.verdict.accepted === false) refuses += 1;
    }
    expect(refuses).toBeGreaterThan(0);
  });
  it("dead-band twin: offers differing only INSIDE the band ⇒ identical bps ⇒ identical verdicts (no price-sensitive roll)", () => {
    const arms = [100_000_000n, 100_500_000n, 99_500_000n].map((price) =>
      adjudicateSellOffers({
        offers: book([["plan:row", offer("row", price)]]),
        marketRates: new Map<string, MoneyUnit>([["plan:row", ANCHOR]]),
        now: 77,
        runSeed: SEED_A,
        cfg: DEFAULT_SELL_CONFIG,
      }),
    );
    // In-band prices share ONE bps stamp, and the roll is keyed by
    // (seed, domain, minute, key) — never by price — so the VERDICTS agree
    // even though the fingerprints differ. (The recorded price naturally
    // differs per arm; acceptance semantics must not.)
    const digests = new Set(
      arms.map((a) => digest([a.fresh[0]?.verdict.accepted, a.fresh[0]?.verdict.acceptanceBps])),
    );
    expect(digests.size).toBe(1);
    expect(arms[0]?.fresh[0]?.verdict.acceptanceBps).toBe(DEFAULT_SELL_CONFIG.acceptBaseBps);
  });
});

/* ══════════════════════════ D. the fold — step 5.5 ══════════════════════════ */

type Run = ReturnType<typeof runEconomyTick>;

interface SellLegs {
  readonly sellOffers?: ReadonlyMap<string, SellOffer>;
  readonly sellMarketRates?: ReadonlyMap<string, MoneyUnit>;
}

function foldInput(
  state: EconomyState,
  map: ReadonlyMap<EntityId, Contract>,
  cfg: EconomyConfig,
  minute: number,
  legs: SellLegs = {},
): Run {
  return runEconomyTick({
    context: ctxAt(minute, BigInt(Math.floor(minute / 60))),
    runSeed: SEED_A,
    contracts: map,
    prior: state,
    cfg,
    dunningEngineOwned: false,
    ...legs,
  });
}

function keyedScenario(priceKey: string): {
  state: EconomyState;
  map: Map<EntityId, Contract>;
  cfg: EconomyConfig;
} {
  const cfg = defaultEconomyConfig();
  const contract = contractOf("ctr-sell-1"); // mrc 100_000_000n
  const map = new Map<EntityId, Contract>([[contract.id, contract]]);
  const state = registerContractEconomy(
    stateWithCash(5_000_000_000n),
    {
      contract,
      atBusinessMin: 0,
      clauseRefs: [],
      grandfather: null,
      revenueTags: TAGS,
      commitmentBps: 9_990n,
      priceKey,
    },
    cfg,
  );
  return { state, map, cfg };
}

const OFFERS_MID = book([["plan:bridge", offer("bridge", 100_000_000n)]]);

describe("runEconomyTick step 5.5 — the fold books verdicts, never money", () => {
  it("absent-while-idle: no sellOffers leg ⇒ NO sellVerdicts key (every shipped digest byte-ident)", () => {
    const sc = keyedScenario("plan:bridge");
    const plain = foldInput(sc.state, sc.map, sc.cfg, 100);
    expect(plain.state.sellVerdicts).toBeUndefined();
    expect(Object.hasOwn(plain.state, "sellVerdicts")).toBe(false);
    const twice = foldInput(plain.state, sc.map, sc.cfg, 200);
    expect(twice.state.sellVerdicts).toBeUndefined();
  });
  it("installed-base anchor: a booked offer fires EXACTLY one verdict notice, and moves NO money", () => {
    const sc = keyedScenario("plan:bridge");
    const baseline = foldInput(sc.state, sc.map, sc.cfg, 100);
    const run = foldInput(sc.state, sc.map, sc.cfg, 100, { sellOffers: OFFERS_MID });
    const sellNotices = run.notices.filter(
      (n) => n.kind === "sell-accepted" || n.kind === "sell-refused",
    );
    expect(sellNotices).toHaveLength(1);
    expect(run.state.sellVerdicts?.size).toBe(1);
    // THE zero-money guard: the ONLY differences vs the no-book arm are the
    // verdict key + its notice — every bucket, journal row, event and
    // observed write is byte-identical.
    expect(digest(run.state.cash)).toBe(digest(baseline.state.cash));
    expect(run.entries).toEqual(baseline.entries);
    expect(run.events).toEqual(baseline.events);
    expect(run.observedWrites).toEqual(baseline.observedWrites);
    expect(digest(run.state.journal)).toBe(digest(baseline.state.journal));
    expect(digest(run.state.contractEconomy)).toBe(digest(baseline.state.contractEconomy));
  });
  it("notice shape: contractId is the offer key as an entity id, amount is the offer price, cause is economy:sell-prefixed", () => {
    const sc = keyedScenario("plan:bridge");
    const run = foldInput(sc.state, sc.map, sc.cfg, 100, { sellOffers: OFFERS_MID });
    const notice = run.notices.find((n) => n.kind.startsWith("sell-")) as EconomyNotice;
    expect(notice.contractId).toBe(asEntityId("plan:bridge"));
    expect(notice.amount).toBe(asMoney(100_000_000n));
    expect(notice.atBusinessMin).toBe(100);
    expect(notice.causeId).toBe(asCauseId("economy:sell:plan:bridge:100"));
  });
  it("sell verdicts never touch the company reputation pool (explicit null arms in noticeReputationKind)", () => {
    const sc = keyedScenario("plan:bridge");
    const baseline = foldInput(sc.state, sc.map, sc.cfg, 100);
    const run = foldInput(sc.state, sc.map, sc.cfg, 100, {
      // 1 µ$ against the 100M anchor = clamped ceiling; seed 904 decides the
      // side — either way the pool must not move.
      sellOffers: book([["plan:bridge", offer("bridge", 1n)]]),
    });
    expect(run.notices.some((n) => n.kind.startsWith("sell-"))).toBe(true);
    expect(digest(run.state.reputation)).toBe(digest(baseline.state.reputation));
    expect(run.observedWrites).toHaveLength(0); // reputation publishes on change
  });
  it("persistence: next tick with the same book re-rolls NOTHING; an amended offer re-rolls at the new minute", () => {
    const sc = keyedScenario("plan:bridge");
    const one = foldInput(sc.state, sc.map, sc.cfg, 100, { sellOffers: OFFERS_MID });
    const two = foldInput(one.state, sc.map, sc.cfg, 140, { sellOffers: OFFERS_MID });
    expect(two.notices.filter((n) => n.kind.startsWith("sell-"))).toHaveLength(0);
    expect(two.state.sellVerdicts).toBe(one.state.sellVerdicts); // identity — nothing rebuilt
    const amended = book([["plan:bridge", offer("bridge", 95_000_000n)]]);
    const three = foldInput(two.state, sc.map, sc.cfg, 200, { sellOffers: amended });
    expect(three.notices.filter((n) => n.kind.startsWith("sell-"))).toHaveLength(1);
    expect(three.state.sellVerdicts?.get("plan:bridge")?.offerPriceMicroUsd).toBe(asMoney(95_000_000n));
  });
  it("unadjudicated twin: an offer with no anchor anywhere leaves the FULL fold digest byte-equal to the no-book arm", () => {
    const sc = keyedScenario("plan:other"); // contract keyed elsewhere
    const baseline = foldInput(sc.state, sc.map, sc.cfg, 100);
    const orphan = foldInput(sc.state, sc.map, sc.cfg, 100, {
      sellOffers: book([["plan:bridge", offer("bridge", 90_000_000n)]]),
    });
    expect(digest([orphan.state, orphan.notices, orphan.events, orphan.entries])).toBe(
      digest([baseline.state, baseline.notices, baseline.events, baseline.entries]),
    );
  });
  it("catalog authority flows through EconomyTickIn.sellMarketRates (host leg)", () => {
    const sc = keyedScenario("plan:bridge");
    const run = foldInput(sc.state, sc.map, sc.cfg, 100, {
      sellOffers: OFFERS_MID,
      sellMarketRates: new Map<string, MoneyUnit>([["plan:bridge", asMoney(400_000_000n)]]),
    });
    // 100M against a 400M catalog = deep bargain ⇒ ceiling-stamped verdict.
    expect(run.state.sellVerdicts?.get("plan:bridge")?.acceptanceBps).toBe(
      DEFAULT_SELL_CONFIG.acceptCeilingBps,
    );
    expect(run.state.sellVerdicts?.get("plan:bridge")?.anchorMicroUsd).toBe(asMoney(400_000_000n));
  });
  it("×100 determinism on a booked multi-week run (verdict chain + cash, Set.size 1)", () => {
    const seen = new Set<string>();
    for (let pass = 0; pass < 100; pass += 1) {
      const sc = keyedScenario("plan:bridge");
      let prior = sc.state;
      for (const minute of [60, 1_440, 2_880, MONTH, MONTH + 60]) {
        // The offer is amended exactly once, at MONTH (new shippedAtTick ⇒
        // one re-roll); the rest of the chain adjudicates nothing new.
        const offers =
          minute >= MONTH
            ? book([["plan:bridge", offer("bridge", 90_000_000n, { shippedAtTick: 9n })]])
            : OFFERS_MID;
        const run = foldInput(prior, sc.map, sc.cfg, minute, { sellOffers: offers });
        prior = run.state;
      }
      seen.add(digest([prior.sellVerdicts ?? null, prior.cash, prior.journal.nextSeq]));
    }
    expect(seen.size).toBe(1);
    // Falsifiable shape check: the chain really holds TWO stamps (original + amendment).
    const probe = (() => {
      const sc = keyedScenario("plan:bridge");
      let prior = sc.state;
      for (const minute of [60, 1_440, 2_880, MONTH, MONTH + 60]) {
        const offers =
          minute >= MONTH
            ? book([["plan:bridge", offer("bridge", 90_000_000n, { shippedAtTick: 9n })]])
            : OFFERS_MID;
        prior = foldInput(prior, sc.map, sc.cfg, minute, { sellOffers: offers }).state;
      }
      return prior.sellVerdicts?.get("plan:bridge");
    })();
    expect(probe?.adjudicatedAtBusinessMin).toBe(MONTH);
    expect(probe?.shippedAtTick).toBe(9n);
  });
});

/* ══════════════════════════ E. census + drift pins ══════════════════════════ */

describe("mechanic B contracts pinned in source", () => {
  const tickSource = readFileSync(fileURLToPath(new URL("../tick.ts", import.meta.url)), "utf8");

  it("EconomyNoticeKind census: 29 pre-mechanic-B kinds + sell-accepted + sell-refused = 31", () => {
    const union = tickSource.match(/export type EconomyNoticeKind =([\s\S]*?);\n/);
    if (union === null) throw new Error("EconomyNoticeKind union not found — pin the shape");
    const members = [...(union[1] ?? "").matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]);
    expect(members).toHaveLength(31);
    expect(members).toContain("sell-accepted");
    expect(members).toContain("sell-refused");
  });
  it("the dice roll on the NEW domain string only — 'economy/sell' is the sole streamFor domain in sell.ts", () => {
    const sellSource = readFileSync(fileURLToPath(new URL("../sell.ts", import.meta.url)), "utf8");
    const domains = [...sellSource.matchAll(/streamFor\([^,]+,\s*"([^"]+)"/g)].map((m) => m[1]);
    expect(domains).toEqual(["economy/sell"]);
    // No existing domain may leak in — the zero-golden load-bearing wall.
    for (const borrowed of ["economy/renewal", "economy/churn", "economy/payment"]) {
      expect(sellSource).not.toContain(`"${borrowed}"`);
    }
  });
  it("door key-grammar drift pin: the sell handler keys entries through priceOverrideKey — the codec the fold resolves", () => {
    const doorSource = readFileSync(
      fileURLToPath(new URL("../../pipeline/intent-door.ts", import.meta.url)),
      "utf8",
    );
    const handler = doorSource.match(/function handleSellOffer([\s\S]*?)\n\}/);
    if (handler === null) throw new Error("handleSellOffer not found — the fold's key grammar lost its authority");
    expect(handler[1]).toContain("priceOverrideKey");
    // The offer price stays > 0 at the door (bad-offer-price), so the fold
    // never divides by a player-supplied zero — the only zero the fold must
    // defend is the ANCHOR's.
    expect(handler[1]).toContain("bad-offer-price");
  });
  it("catalog key space = the door's PRICE_TARGET_KINDS (mirror pair stays byte-closed)", () => {
    const doorSource = readFileSync(
      fileURLToPath(new URL("../../pipeline/intent-door.ts", import.meta.url)),
      "utf8",
    );
    const kinds = doorSource.match(/const PRICE_TARGET_KINDS\b[\s\S]*?\(\[([^\]]*)\]\)/);
    if (kinds === null) throw new Error("PRICE_TARGET_KINDS not found");
    const listed = [...(kinds[1] ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    expect(listed).toEqual(["plan", "contract-class", "sku"]);
    // The fold treats keys opaquely (string map) — the kinds above are the
    // ONLY grammar an offer key can carry, pinned here so a fourth kind
    // forces this file to be read.
    const sellSource = readFileSync(fileURLToPath(new URL("../sell.ts", import.meta.url)), "utf8");
    expect(sellSource).toContain("priceKey");
  });
  it("defaultEconomyConfig ships the sell book; all five ratified labels (ADR-0016 #11) intact", () => {
    const cfg = defaultEconomyConfig();
    expect(cfg.sell).toBe(DEFAULT_SELL_CONFIG); // shared frozen default (postMortem pattern)
    const configSource = readFileSync(fileURLToPath(new URL("../config.ts", import.meta.url)), "utf8");
    const labels = [
      ...configSource.matchAll(/accept\w+: .*RATIFIED 2026-10-17 \(ADR-0016 #11\)/g),
    ];
    expect(labels).toHaveLength(5);
  });
});
