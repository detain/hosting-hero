/**
 * ADR-0015 5/5 NEGOTIATE — the money-lane leg: economy/negotiate.ts + the
 * renewal-cliff and invoice-calendar consumption in economy/tick.ts.
 * The door books the TALK (pipeline/__tests__/intent-door-negotiate.test.ts);
 * the HOST forwards the term map as `EconomyTickIn.negotiations` (mirroring
 * the priceOverrides seam @5781335 EXACTLY — tickFold/single-home law) and
 * the fold reads it. Two families, elasticity.test.ts's shape:
 *
 *  A. Unit laws: as-of resolution, the retention tilt (tone bumps +
 *     concession gating + the ≤1.0 clamp — a rapport buys leverage, never
 *     certainty, the elasticity ceiling mirrored), and the billing-base
 *     move (0n/null ride-through, floor 0n).
 *  B. Tick integration: the NO-ROLL DISCIPLINE proof (absent book, empty
 *     book, unkeyed contracts and not-yet-law stamps are digest-identical
 *     across state, notices, events AND entries; since ADR-0016 mechanic A
 *     the in-force legal STANCES instead materialize their relationship
 *     meter — equal to each other, different from bare, pinned below);
 *     the FALSIFIER (a 20% price hike cut the goodwill the cliff's single
 *     draw is compared against; the same ONE draw flips lapse→renew only
 *     when the money shows up — rapport WITHOUT concession loses, rapport
 *     WITH one wins, legal WITH one loses where rapport wins — the card's
 *     escalation ladder made arithmetic. THE HIKE IS LOAD-BEARING: the
 *     ≤1.0 clamp means the talk restores goodwill YOUR OWN PRICING took
 *     (retention factor 0.92 → 0.9476/0.9752 — #N1-era pin: under ADR-0016
 *     mechanic A every BOOKED arm also reads its own accrued trust BEFORE
 *     the draw — rapport-no-money 0.9499, legal-with-money 0.9463,
 *     rapport-with-money 0.9775 — the brute-search below self-heals), it
 *     never lifts retention above the authored ceiling — the design law in
 *     negotiate.ts); the billed line (concession
 *     discounts the override-chain HEAD, grandfather still WINS —
 *     ADR-0014 #D4 order); and the term roll-forward.
 *
 * Taste numerics pinned here (PROVISIONAL, ADR-0015 mechanics — the card
 * names tones, not numbers): rapport +300bps, firm +100bps, legal 0bps,
 * concession presence +300bps, clamped ≤ 1.0.
 */

import { describe, expect, it } from "vitest";

import {
  asEntityId,
  asMoney,
  type Contract,
  type EntityId,
  type NegotiationTerm,
  type PriceOverrideRecord,
  type RunSeed,
} from "../../types.js";
import { BPS_DEN } from "../money.js";
import { type EconomyConfig, defaultEconomyConfig } from "../config.js";
import { registerContractEconomy } from "../state.js";
import { runEconomyTick, type EconomyTickOut } from "../tick.js";
import {
  NEGOTIATION_TONES,
  activeNegotiation,
  negotiationRetentionFactorBps,
  negotiatedBillingBase,
} from "../negotiate.js";
import { MONTH, SEED, TAGS, contractOf, ctxAt, digest, stateWithCash } from "./helpers.js";

const cfg = defaultEconomyConfig();

function term(
  tone: NegotiationTerm["tone"],
  concessionMicroUsd: bigint | null = null,
  termMonthsExtension: number | null = null,
  effectiveAtBusinessMinute: number | null = null,
): NegotiationTerm {
  return Object.freeze({
    targetKind: "plan" as const,
    targetId: asEntityId("pro"),
    tone,
    concessionMicroUsd: concessionMicroUsd === null ? null : asMoney(concessionMicroUsd),
    termMonthsExtension,
    shippedAtTick: 0n,
    effectiveAtBusinessMinute,
  });
}

function rec(priceUsd: bigint, effective: number | null = null): PriceOverrideRecord {
  return Object.freeze({
    targetKind: "plan" as const,
    targetId: asEntityId("pro"),
    newPriceMicroUsd: asMoney(priceUsd * 1_000_000n),
    effectiveAtBusinessMinute: effective,
    setAtTick: 1n,
  });
}

/* ══════════════════════════ A. unit laws ══════════════════════════════════ */

describe("activeNegotiation (as-of resolution — the activePriceOverride twin)", () => {
  const book = new Map([["plan:pro", term("rapport", 25_000_000n, null, 500)]]);
  it("no book / no key / no entry ⇒ null", () => {
    expect(activeNegotiation(undefined, "plan:pro", 900)).toBeNull();
    expect(activeNegotiation(book, undefined, 900)).toBeNull();
    expect(activeNegotiation(book, "plan:other", 900)).toBeNull();
  });
  it("future effectiveAtBusinessMinute is not yet law; past or null is", () => {
    expect(activeNegotiation(book, "plan:pro", 499)).toBeNull();
    expect(activeNegotiation(book, "plan:pro", 500)?.tone).toBe("rapport");
    expect(activeNegotiation(book, "plan:pro", 900)?.tone).toBe("rapport");
    const nowBook = new Map([["plan:pro", term("firm")]]);
    expect(activeNegotiation(nowBook, "plan:pro", 0)?.tone).toBe("firm");
  });
  it("there is no expiry leg — last-write-wins replaces, the standing term is law forever (the pricing book's discipline)", () => {
    const ancient = new Map([["plan:pro", term("legal", null, null, 0)]]);
    expect(activeNegotiation(ancient, "plan:pro", 100 * MONTH)?.tone).toBe("legal");
  });
});

describe("negotiationRetentionFactorBps (the tilt before the EXISTING draw)", () => {
  it("term null ⇒ the price factor rides through UNTOUCHED (identity tripwire, byte-identity leg)", () => {
    for (const f of [BPS_DEN, 6_800n, 123n]) {
      expect(negotiationRetentionFactorBps(null, f, cfg)).toBe(f);
    }
  });
  it("tone bumps: rapport +300 > firm +100 > legal 0 (PROVISIONAL numerics pinned red on drift)", () => {
    expect(cfg.negotiation.retentionBumpBpsByTone).toEqual({ rapport: 300n, firm: 100n, legal: 0n });
    expect(cfg.negotiation.concessionPresenceBps).toBe(300n);
    // 5500 baseline: ×1.03 = 5665, ×1.01 = 5555, ×1.00 = EXACT identity:
    expect(negotiationRetentionFactorBps(term("rapport"), 5_500n, cfg)).toBe(5_665n);
    expect(negotiationRetentionFactorBps(term("firm"), 5_500n, cfg)).toBe(5_555n);
    expect(negotiationRetentionFactorBps(term("legal"), 5_500n, cfg)).toBe(5_500n);
  });
  it("money talks in every tone; the card's ladder: rapport+concession > firm+concession > legal+concession", () => {
    // +25M booked ⇒ +300 presence bps on top of the tone bump:
    expect(negotiationRetentionFactorBps(term("rapport", 25_000_000n), 5_500n, cfg)).toBe(5_830n); // ×1.06
    expect(negotiationRetentionFactorBps(term("firm", 25_000_000n), 5_500n, cfg)).toBe(5_720n); // ×1.04
    expect(negotiationRetentionFactorBps(term("legal", 25_000_000n), 5_500n, cfg)).toBe(5_665n); // ×1.03
    // rapport WITHOUT money == legal WITH money == +300 (the ordering law
    // the card names, made arithmetic — and the reason both arms are legal):
    expect(negotiationRetentionFactorBps(term("rapport"), 5_500n, cfg)).toBe(
      negotiationRetentionFactorBps(term("legal", 25_000_000n), 5_500n, cfg),
    );
  });
  it("a booked 0n concession is a STANCE, not a sweetener: no presence bump, yet digest-distinct from null (door suite pins the digest leg)", () => {
    expect(negotiationRetentionFactorBps(term("rapport", 0n), 5_500n, cfg)).toBe(
      negotiationRetentionFactorBps(term("rapport", null), 5_500n, cfg),
    );
  });
  it("clamped ≤ 1.0: a rapport buys leverage, never certainty (the elasticity ceiling mirrored)", () => {
    expect(negotiationRetentionFactorBps(term("rapport", 25_000_000n), 9_900n, cfg)).toBe(BPS_DEN);
    // 9900 × 1.06 = 10_494 would cross — the clamp says no:
    expect(negotiationRetentionFactorBps(term("rapport", 25_000_000n), 9_434n, cfg)).toBe(BPS_DEN);
    expect(negotiationRetentionFactorBps(term("rapport", 25_000_000n), 9_433n, cfg)).toBe(9_999n);
  });
  it("NEGOTIATION_TONES is the economy side of the three-way vocab mirror (drift-pinned door-side)", () => {
    expect([...NEGOTIATION_TONES]).toEqual(["rapport", "firm", "legal"]);
    expect(Object.keys(cfg.negotiation.retentionBumpBpsByTone)).toEqual([...NEGOTIATION_TONES]);
  });
});

describe("negotiatedBillingBase (the discount at the override-chain head)", () => {
  const c = contractOf("t1"); // mrc 100_000_000n
  it("no term / null / 0n concession ⇒ the effective base rides through UNTOUCHED (incl null = bill the authored MRC)", () => {
    expect(negotiatedBillingBase(c, null, null)).toBeNull();
    expect(negotiatedBillingBase(c, term("rapport"), null)).toBeNull();
    expect(negotiatedBillingBase(c, term("rapport", 0n), asMoney(150_000_000n))).toBe(asMoney(150_000_000n));
  });
  it("a positive concession discounts the EFFECTIVE base (the override, when the host passed one)", () => {
    expect(negotiatedBillingBase(c, term("rapport", 25_000_000n), asMoney(120_000_000n))).toBe(asMoney(95_000_000n));
    // null effective base ⇒ the authored MRC is the base (75M of the 100M):
    expect(negotiatedBillingBase(c, term("rapport", 25_000_000n), null)).toBe(asMoney(75_000_000n));
  });
  it("floor 0n: a concession deeper than the rent gives the cycle away, it never bills the tenant money", () => {
    expect(negotiatedBillingBase(c, term("legal", 500_000_000n), null)).toBe(asMoney(0n));
  });
});

/* ═══════════════════════ B. tick integration ═══════════════════════════════ */

type Run = ReturnType<typeof runEconomyTick>;

function fullDigest(r: Run): string {
  return digest([r.state, r.notices, r.events, r.entries]);
}

interface Scenario {
  readonly cfg: EconomyConfig;
  readonly map: ReadonlyMap<EntityId, Contract>;
  readonly state: ReturnType<typeof stateWithCash>;
}

function scenario(
  contracts: readonly Contract[],
  scfg: EconomyConfig,
  priceKeys?: ReadonlyMap<string, string>,
  grandfathered?: ReadonlySet<string>,
): Scenario {
  const map = new Map<EntityId, Contract>(contracts.map((c) => [c.id, c]));
  let s = stateWithCash(5_000_000_000n);
  for (const c of contracts) {
    s = registerContractEconomy(
      s,
      {
        contract: c,
        atBusinessMin: 0,
        clauseRefs: c.sla.autoRenew ? ["auto-renew"] : [],
        grandfather:
          grandfathered?.has(c.id) === true
            ? { lockedMrc: asMoney(90_000_000n), lockedThroughMin: 10 * MONTH }
            : null,
        revenueTags: TAGS,
        commitmentBps: 9_990n,
        ...(priceKeys?.has(c.id) === true ? { priceKey: priceKeys.get(c.id)! } : {}),
      },
      scfg,
    );
  }
  return { cfg: scfg, map, state: s };
}

function runWeeks(
  sc: Scenario,
  ticks: readonly number[],
  negotiations?: ReadonlyMap<string, NegotiationTerm>,
  overrides?: ReadonlyMap<string, PriceOverrideRecord>,
  seed: RunSeed = SEED,
): Run {
  // The elasticity accumulation contract: forked whole-run comparisons need
  // the FULL story per run, and prior state must never be shared.
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
      ...(negotiations === undefined ? {} : { negotiations }),
      ...(overrides === undefined ? {} : { priceOverrides: overrides }),
    });
    prior = last.state;
    notices.push(...last.notices);
    events.push(...last.events);
    entries.push(...last.entries);
  }
  return { ...last!, notices, events, entries };
}

const calm = (base: EconomyConfig = defaultEconomyConfig()): EconomyConfig => ({
  ...base,
  churn: { ...base.churn, monthlyLogoChurnBpsByBundle: {}, fallbackMonthlyBps: 0n },
  dunning: { ...base.dunning, cardFailureBps: 0n },
});

function noticeKinds(r: Run): string[] {
  return r.notices.map((n) => n.kind);
}

function econOf(r: Run, id: string): { phase: string; termEndMin: number } {
  const e = r.state.contractEconomy.get(asEntityId(id));
  if (e === undefined) throw new Error(`no contractEconomy for ${id}`);
  return { phase: e.phase, termEndMin: e.termEndMin };
}

/* Brute the id space like elasticity's cliff witness: find a contract whose
   SEED-pinned draw lands inside [hike+rap, hike+rap+C) bps — with a 20% price
   HIKE on the same priceKey the retention runs 7176 (bare) / 7391 (rapport-no-
   money == legal-with-money, the clamp-recovered 0.9476) / 7607 (rapport-with-
   money 0.9752). #N1-era pin: under ADR-0016 mechanic A the three BOOKED arms
   now read their own in-fold trust (rapport +25 ⇒ 7409; legal −15 ⇒ 7381;
   rapport+money +25 ⇒ 7625), so the live band is [7409, 7625) — the search
   self-heals by construction and may settle on a different id; re-run and
   re-pin these values VERBATIM whenever the taste numerics move.
   So the hiked baseline churns, goodwill alone loses, the talk
   WITH money wins, lawyers WITH money loses where rapport wins. One draw,
   several arms, the card's ladder made arithmetic — and the ≤1.0-clamp design
   law made visible: every arm below rides the SAME hike book, because a
   negotiation cannot lift an unbitten factor (1.0 × 1.06 clamps to 1.0).
   The same witness drives the inert-extension leg below (a legal book's only
   trust is its −15 bullying — DOWNWARD — so the baseline lapse holds while
   the extension field is PRESENT). */
const HIKE: ReadonlyMap<string, PriceOverrideRecord> = new Map([["plan:pro", rec(120n)]]);
const witness = (() => {
  for (let i = 1; i <= 400; i += 1) {
    const c = contractOf(`w${i}`, { termEndMin: 12 * MONTH });
    const sc = scenario([c], calm(), new Map([[c.id, "plan:pro"]]));
    const book = (t: NegotiationTerm) => new Map([["plan:pro", t]]);
    const bareLapsed = noticeKinds(runWeeks(sc, [12 * MONTH], undefined, HIKE)).includes("cliff-lapsed");
    const rapportNoMoney = runWeeks(sc, [12 * MONTH], book(term("rapport", null)), HIKE);
    const rapportMoney = runWeeks(sc, [12 * MONTH], book(term("rapport", 25_000_000n)), HIKE);
    const legalMoney = runWeeks(sc, [12 * MONTH], book(term("legal", 25_000_000n)), HIKE);
    if (
      bareLapsed && // the hiked baseline churns at the cliff (the talk has to earn it)
      noticeKinds(rapportNoMoney).includes("cliff-lapsed") && // goodwill alone loses
      noticeKinds(rapportMoney).includes("cliff-renewed") && // goodwill + money wins
      noticeKinds(legalMoney).includes("cliff-lapsed") // lawyers + money loses where rapport wins
    ) {
      return { id: `w${i}`, sc, rapportNoMoney, rapportMoney, legalMoney };
    }
  }
  throw new Error("no concession-gated cliff flip in 400 ids — the bump arithmetic is broken?");
})();

describe("no-roll discipline (default-OFF byte-identity)", () => {
  const contracts = [
    contractOf("n1", { termEndMin: 24 * MONTH }),
    contractOf("n2", { termEndMin: 24 * MONTH, billingCycle: "hourly" }),
    contractOf("n3", { termEndMin: 12 * MONTH }),
  ];
  const ticks = [0, MONTH, 2 * MONTH, 3 * MONTH, 12 * MONTH];
  const keys = new Map([["n1", "plan:pro"], ["n3", "plan:pro"]]);

  it("no book, empty book, unkeyed book and future-dated are digest-identical; the inert legal STANCES accrue the meter, equal to EACH OTHER (#N1-era retitle)", () => {
    const sc = scenario(contracts, calm(), keys);
    const base = runWeeks(sc, ticks);
    // The cliff at 12*MONTH ROLLED in these runs (n3 keyed plan:pro): the
    // single draw happened in every arm — the book only ever changes the
    // bps it is compared against, never the number of rolls.
    expect(fullDigest(runWeeks(sc, ticks, undefined))).toBe(fullDigest(base));
    expect(fullDigest(runWeeks(sc, ticks, new Map()))).toBe(fullDigest(base));
    // book whose key NO contract carries — the contract negotiates with nobody:
    expect(fullDigest(runWeeks(sc, ticks, new Map([["sku:orphan", term("rapport", 25_000_000n)]])))).toBe(
      fullDigest(base),
    );
    // future-dated (as-of law): armed for month 99, inert through the cliff:
    expect(fullDigest(runWeeks(sc, ticks, new Map([["plan:pro", term("rapport", 25_000_000n, null, 99 * MONTH)]])))).toBe(
      fullDigest(base),
    );
    // #N1-era pin: legal TALKS, and talking is booked — the ADR-0016
    // relationship meter accrues its −15 bullying the moment the stance is
    // in force, so these arms are no longer digest-IDENTICAL to bare: they
    // open a file and move the cliff's bps. The identity that SURVIVES is
    // between the two inert-STANCE arms (null and 0n money are the same
    // conversation): bullying accrues BY DESIGN, equal-but-not-inert.
    const bulliedNull = runWeeks(sc, ticks, new Map([["plan:pro", term("legal", null)]]));
    const bulliedZero = runWeeks(sc, ticks, new Map([["plan:pro", term("legal", 0n)]]));
    expect(fullDigest(bulliedNull)).not.toBe(fullDigest(base));
    expect(fullDigest(bulliedZero)).not.toBe(fullDigest(base));
    expect(fullDigest(bulliedNull)).toBe(fullDigest(bulliedZero));
    expect("relationships" in bulliedNull.state).toBe(true);
  });

  it("an unkeyed contract rides through a LIVE book: digest-identical (the sparse-priceKey law)", () => {
    const c = contractOf("u1", { termEndMin: 12 * MONTH });
    const sc = scenario([c], calm()); // nobody classified
    const base = runWeeks(sc, [0, 12 * MONTH]);
    const booked = runWeeks(sc, [0, 12 * MONTH], new Map([["plan:pro", term("rapport", 25_000_000n)]]));
    expect(fullDigest(booked)).toBe(fullDigest(base));
  });
});

describe("the falsifier — the concession gates the save on the SAME single draw", () => {
  it(`witness ${witness.id}: hiked baseline + rapport-no-money + legal-with-money all LAPSE on the one draw`, () => {
    const bare = runWeeks(witness.sc, [12 * MONTH], undefined, HIKE);
    expect(noticeKinds(bare)).toContain("cliff-lapsed");
    expect(noticeKinds(witness.rapportNoMoney)).toContain("cliff-lapsed");
    expect(noticeKinds(witness.legalMoney)).toContain("cliff-lapsed");
    // and NO new rolls: each arm emits the same single cliff decision —
    // one draw, three books, one die:
    for (const r of [bare, witness.rapportNoMoney, witness.legalMoney]) {
      expect(r.notices.filter((n) => n.kind === "cliff-lapsed" || n.kind === "cliff-renewed")).toHaveLength(1);
    }
  });

  it(`witness ${witness.id}: rapport-WITH-concession renews on that SAME id (the save is the money, booked in the same book)`, () => {
    expect(noticeKinds(witness.rapportMoney)).toContain("cliff-renewed");
    // the renewed term rolled on its existing geometry (no extension booked):
    expect(econOf(witness.rapportMoney, witness.id).phase).toBe("active");
  });

  it("booked AFTER the cliff minute does not retroactively save (as-of at the fold)", () => {
    const sc = witness.sc;
    const late = runWeeks(sc, [12 * MONTH], new Map([["plan:pro", term("rapport", 25_000_000n, null, 12 * MONTH + 1)]]), HIKE);
    expect(noticeKinds(late)).toContain("cliff-lapsed"); // too late — the talk missed the pulse
    // one minute EARLIER (== the cliff minute) is IN force (>= law twin):
    const atEdge = runWeeks(sc, [12 * MONTH], new Map([["plan:pro", term("rapport", 25_000_000n, null, 12 * MONTH)]]), HIKE);
    expect(noticeKinds(atEdge)).toContain("cliff-renewed");
  });
});

describe("billing consumption (the invoice calendar reads the concession)", () => {
  const a = contractOf("g1c", { termEndMin: 24 * MONTH });
  const sc = scenario([a], calm(), new Map([[a.id, "plan:pro"]]));

  it("an in-force concession discounts the billed base: 100M − 25M = 75M", () => {
    const base = runWeeks(sc, [0]);
    const talked = runWeeks(sc, [0], new Map([["plan:pro", term("rapport", 25_000_000n)]]));
    expect(base.notices.find((n) => n.kind === "invoice-issued")!.amount).toBe(asMoney(100_000_000n));
    expect(talked.notices.find((n) => n.kind === "invoice-issued")!.amount).toBe(asMoney(75_000_000n));
  });

  it("a stance (0n) and a talk (null) bill authored — the discount leg needs money", () => {
    for (const t of [term("rapport", 0n), term("rapport", null)]) {
      const r = runWeeks(sc, [0], new Map([["plan:pro", t]]));
      expect(r.notices.find((n) => n.kind === "invoice-issued")!.amount).toBe(asMoney(100_000_000n));
    }
  });

  it("precedence pinned: a price override AND a concession COMPOSE at the chain head (120M − 25M = 95M)", () => {
    const hiked = runWeeks(sc, [0], undefined, new Map([["plan:pro", rec(120n)]]));
    expect(hiked.notices.find((n) => n.kind === "invoice-issued")!.amount).toBe(asMoney(120_000_000n));
    const both = runWeeks(sc, [0], new Map([["plan:pro", term("rapport", 25_000_000n)]]), new Map([["plan:pro", rec(120n)]]));
    expect(both.notices.find((n) => n.kind === "invoice-issued")!.amount).toBe(asMoney(95_000_000n));
  });

  it("grandfather still WINS over the concession (ADR-0014 #D4 order: the lock outranks the talk)", () => {
    const g = contractOf("gf1", { termEndMin: 24 * MONTH });
    const scg = scenario([g], calm(), new Map([[g.id, "plan:pro"]]), new Set([g.id]));
    const locked = runWeeks(scg, [0], new Map([["plan:pro", term("rapport", 25_000_000n)]]));
    // locked at 90M — the concession NEVER reaches the ledger while the
    // grandfather lock holds (billedMrc chain untouched):
    expect(locked.notices.find((n) => n.kind === "invoice-issued")!.amount).toBe(asMoney(90_000_000n));
  });

  it("a concession deeper than the rent gives the cycle away: no invoice, no notice, the calendar still advances", () => {
    const deep = runWeeks(sc, [0], new Map([["plan:pro", term("firm", 500_000_000n)]]));
    expect(deep.notices.some((n) => n.kind === "invoice-issued")).toBe(false);
    expect(deep.entries.some((e) => e.causeId.includes("economy:invoice"))).toBe(false);
    // the ledger law (an entry must touch a bucket) makes a 0-µ$ invoice
    // UNPOSTABLE — the fold skips it rather than crashing the money lane on
    // player-booked data; the cycle still COUNTS (calendar honesty):
    const econ = deep.state.contractEconomy.get(asEntityId("g1c"))!;
    expect(econ.invoicedCycles).toBe(1);
    // and a later cycle WITHOUT the give-away bills authored MRC again:
    const later = runEconomyTick({
      context: ctxAt(MONTH, BigInt(Math.floor(MONTH / 60))),
      runSeed: SEED,
      contracts: sc.map,
      prior: deep.state,
      cfg: sc.cfg,
    });
    expect(later.notices.find((n) => n.kind === "invoice-issued")!.amount).toBe(asMoney(100_000_000n));
  });
});

describe("termMonthsExtension rolls the renewed term forward", () => {
  /* autoRenew skips the dice — the extension leg is then the ONLY mover,
     so the witness is arithmetic, not chance (the dice leg is pinned by
     the falsifier above). */
  const a = contractOf("x1", {
    termEndMin: 12 * MONTH,
    sla: { ...contractOf("x1").sla, autoRenew: true },
  });
  const sc = scenario([a], calm(), new Map([[a.id, "plan:pro"]]));

  it("no extension: the renewal lands the base geometry (12M → 24M)", () => {
    const r = runWeeks(sc, [12 * MONTH]);
    expect(noticeKinds(r)).toContain("cliff-renewed");
    expect(econOf(r, "x1").termEndMin).toBe(24 * MONTH);
  });

  it("+12 months: the next cliff is 12 months LATER (no cliff at the old edge)", () => {
    const r = runWeeks(sc, [12 * MONTH], new Map([["plan:pro", term("firm", null, 12)]]));
    expect(noticeKinds(r)).toContain("cliff-renewed");
    expect(econOf(r, "x1").termEndMin).toBe(36 * MONTH);
    const atOldEdge = runWeeks(sc, [12 * MONTH, 24 * MONTH], new Map([["plan:pro", term("firm", null, 12)]]));
    expect(noticeKinds(atOldEdge)).not.toContain("cliff-lapsed");
    // and the FURTHER cliff does fire — the term moved, it did not vanish:
    const atNewEdge = runWeeks(sc, [12 * MONTH, 24 * MONTH, 36 * MONTH], new Map([["plan:pro", term("firm", null, 12)]]));
    expect(atNewEdge.notices.filter((n) => n.kind === "cliff-renewed").length).toBeGreaterThanOrEqual(2);
  });

  it("an extension on a LAPSED cliff is inert (lapse ignores the roll-forward — the fold only touches the renew leg)", () => {
    // The falsifier's witness churns on the hiked baseline. A legal tone with
    // NO money is a zero-bump book on the recovery ladder (legal recovers
    // nothing): the decision stays the hiked lapse WHILE the extension field
    // is PRESENT — the roll-forward must not resurrect it.
    const r = runWeeks(witness.sc, [12 * MONTH], new Map([["plan:pro", term("legal", null, 12)]]), HIKE);
    expect(noticeKinds(r)).toContain("cliff-lapsed");
    expect(econOf(r, witness.id).phase).toBe("terminated");
    expect(econOf(r, witness.id).termEndMin).toBe(12 * MONTH); // never rolled
  });
});
