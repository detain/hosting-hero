/**
 * ADR-0016 mechanic A — the PER-TENANT RELATIONSHIP LEDGER (economy/
 * relationship.ts) + its cliff consumption through negotiate.ts's trust leg.
 * The card law (§1.3 "Amps and Aisles", hosting_game.md:1637): "a ticket/
 * conversation system with a tenant, with tone options and a relationship
 * meter. **This is the level's combat.**" ADR-0015 booked the TALK at the
 * cliff; this suite pins the MEMORY: encounters, renewals, lapses, dunning
 * steps, recoveries, payments and losses accrue signed trust on the
 * tenant's own priceKey row, that trust composes into the retention bump
 * (still clamped ≤ 1.0 — the clamp SURVIVES the refactor), and the meter
 * casts no dice (the zero-streamFor source pin).
 *
 * Witness numerics (defaults shipped in DEFAULT_RELATIONSHIP_CONFIG):
 * rapport +25 / firm +10 / legal −15 / renewed +50 / lapsed −80 /
 * dunning-stage −100 / suspended −100 / dunning-recovered +50 /
 * invoice-paid-after-stage +50 / churned-voluntary −200 / written-off −400,
 * clamped to [−1_000, +1_000] — ALL PROVISIONAL taste numerics.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import {
  asEntityId,
  asMoney,
  type Contract,
  type EntityId,
  type NegotiationTerm,
  type PriceOverrideRecord,
} from "../../types.js";
import { BPS_DEN } from "../money.js";
import { DEFAULT_RELATIONSHIP_CONFIG, type EconomyConfig, defaultEconomyConfig } from "../config.js";
import { registerContractEconomy } from "../state.js";
import { runEconomyTick, type EconomyTickOut } from "../tick.js";
import { negotiationRetentionFactorBps, negotiationToneBumpBps } from "../negotiate.js";
import {
  applyRelationshipEncounters,
  relationshipDeltaBps,
  relationshipTrustBps,
  type RelationshipEvent,
  type RelationshipLedger,
} from "../relationship.js";
import { DAY, MONTH, SEED, TAGS, contractOf, ctxAt, digest, stateWithCash } from "./helpers.js";

const cfg = defaultEconomyConfig();
const R = cfg.relationships ?? DEFAULT_RELATIONSHIP_CONFIG;

function enc(priceKey: string, tone: NegotiationTerm["tone"], shippedAtTick: bigint): RelationshipEvent {
  return { kind: "negotiation-encounter", priceKey, tone, shippedAtTick };
}
function fact(kind: RelationshipEvent["kind"], priceKey = "plan:pro"): RelationshipEvent {
  return { kind, priceKey };
}
function trustOf(ledger: RelationshipLedger | null, key = "plan:pro"): bigint {
  if (ledger === null) throw new Error("ledger not materialized");
  return ledger.trustByKey.get(key)?.trustBps ?? 0n;
}

/* ══════════════════ A. the pure ledger laws ══════════════════ */

describe("applyRelationshipEncounters — identity-when-empty (the reputation law verbatim)", () => {
  it("empty events return the input ledger BY IDENTITY — null included, never a {} materialization", () => {
    expect(applyRelationshipEncounters(null, [], cfg)).toBeNull();
    const booked = applyRelationshipEncounters(null, [enc("plan:pro", "rapport", 0n)], cfg)!;
    expect(applyRelationshipEncounters(booked, [], cfg)).toBe(booked);
  });
  it("a fold where EVERY event dedupes on the cursor also returns the input by identity (a standing book re-forwarded weekly talks ONCE)", () => {
    const first = applyRelationshipEncounters(null, [enc("plan:pro", "rapport", 0n)], cfg)!;
    for (let week = 1; week <= 5; week += 1) {
      const again = applyRelationshipEncounters(first, [enc("plan:pro", "rapport", 0n)], cfg);
      expect(again).toBe(first); // reference identity — no re-sort, no re-accrual
    }
    expect(trustOf(first)).toBe(25n);
    expect(first.trustByKey.get("plan:pro")!.encounters).toBe(1);
  });
});

describe("the accrual table — one config-cited delta per kind (directions are card law)", () => {
  const table: ReadonlyArray<readonly [RelationshipEvent, bigint]> = [
    [enc("plan:pro", "rapport", 0n), 25n], // rapport talks up
    [enc("plan:pro", "firm", 0n), 10n], // firm half-works
    [enc("plan:pro", "legal", 0n), -15n], // legal HURTS — "a legal and reputational cost"
    [fact("renewed"), 50n],
    [fact("lapsed"), -80n],
    [fact("dunning-stage"), -100n],
    [fact("suspended"), -100n], // rides dunningStageBps (the slash-group)
    [fact("dunning-recovered"), 50n],
    [fact("invoice-paid"), 50n], // rides dunningRecoveredBps (the slash-group)
    [fact("churned-voluntary"), -200n],
    [fact("written-off"), -400n],
  ];
  for (const [event, expected] of table) {
    it(`${event.kind === "negotiation-encounter" ? `encounter(${event.tone})` : event.kind} accrues ${expected} bps`, () => {
      expect(relationshipDeltaBps(event, cfg)).toBe(expected);
      const ledger = applyRelationshipEncounters(null, [event], cfg)!;
      expect(trustOf(ledger)).toBe(expected);
    });
  }
  it("counters: an encounter moves BOTH encounters and lifetimeEvents; every other kind only lifetimeEvents", () => {
    const ledger = applyRelationshipEncounters(null, [enc("plan:pro", "rapport", 0n), fact("renewed")], cfg)!;
    const row = ledger.trustByKey.get("plan:pro")!;
    expect(row.encounters).toBe(1);
    expect(row.lifetimeEvents).toBe(2);
  });
  it("the shipped DEFAULT book IS the table (config drift reddens the pins above)", () => {
    expect(R).toBe(DEFAULT_RELATIONSHIP_CONFIG);
    expect(DEFAULT_RELATIONSHIP_CONFIG).toEqual({
      toneRapportBps: 25n,
      toneFirmBps: 10n,
      toneLegalBps: 15n,
      renewedBps: 50n,
      lapsedBps: 80n,
      dunningStageBps: 100n,
      dunningRecoveredBps: 50n,
      writtenOffBps: 400n,
      voluntaryChurnBps: 200n,
      trustFloorBps: -1_000n,
      trustCeilingBps: 1_000n,
    });
  });
});

describe("the fingerprint cursor — the shippedAtTick-change IS the amendment signal", () => {
  it("same term (same stamp) never re-accrues; an LWW amendment (higher stamp) re-accrues; a regressing stamp is ignored", () => {
    let ledger = applyRelationshipEncounters(null, [enc("plan:pro", "rapport", 0n)], cfg);
    ledger = applyRelationshipEncounters(ledger, [enc("plan:pro", "rapport", 5n)], cfg);
    ledger = applyRelationshipEncounters(ledger, [enc("plan:pro", "legal", 5n)], cfg); // regresses — skipped
    const row = ledger!.trustByKey.get("plan:pro")!;
    expect(row.trustBps).toBe(50n); // +25 (0n) then +25 (5n); the second 5n legal skipped
    expect(row.encounters).toBe(2);
    expect(row.lastEncounterAtTick).toBe(5n);
  });
  it("a booked 0n-concession is a STANCE and still accrues (the door already made null-vs-0n distinct; here both TALKED, money-absent)", () => {
    const stance = applyRelationshipEncounters(null, [enc("plan:pro", "rapport", 0n)], cfg);
    expect(trustOf(stance!)).toBe(25n); // applyRelationshipEncounters never sees the concession — the talk is the fact
  });
  it("outcomes have NO cursor — three dunning stages burn three times", () => {
    const ledger = applyRelationshipEncounters(null, [fact("dunning-stage"), fact("dunning-stage"), fact("dunning-stage")], cfg)!;
    expect(trustOf(ledger)).toBe(-300n);
    expect(ledger.trustByKey.get("plan:pro")!.lifetimeEvents).toBe(3);
  });
});

describe("clamps — trust is bounded, per-accrual not sticky", () => {
  it("40 rapport encounters hit EXACTLY the +1_000 ceiling (25×40 — the band is reachable by sustained talking), and goodwill above it is a no-op", () => {
    let ledger: RelationshipLedger | null = null;
    for (let i = 0n; i < 40n; i += 1n) ledger = applyRelationshipEncounters(ledger, [enc("plan:pro", "rapport", i)], cfg);
    expect(trustOf(ledger!)).toBe(R.trustCeilingBps);
    expect(trustOf(applyRelationshipEncounters(ledger, [fact("renewed")], cfg)!)).toBe(1_000n);
  });
  it("three write-offs clamp at the −1_000 floor (−1_200 raw), and repair still lifts off it", () => {
    const burned = applyRelationshipEncounters(null, [fact("written-off"), fact("written-off"), fact("written-off")], cfg)!;
    expect(trustOf(burned)).toBe(R.trustFloorBps);
    expect(trustOf(applyRelationshipEncounters(burned, [fact("renewed")], cfg)!)).toBe(-950n);
  });
  it("relationshipTrustBps re-clamps defensively on READ (a hand-forged prior cannot smuggle trust out of the band)", () => {
    const forged: RelationshipLedger = {
      trustByKey: new Map([["plan:pro", { trustBps: 9_999n, encounters: 1, lifetimeEvents: 1, lastEncounterAtTick: 0n }]]),
    };
    expect(relationshipTrustBps(forged, "plan:pro", cfg)).toBe(1_000n);
  });
});

describe("relationshipTrustBps — the cliff's read (0n is the byte-identity leg)", () => {
  it("null / undefined ledger, undefined key, or no row ⇒ exactly 0n; a row reads its trust", () => {
    expect(relationshipTrustBps(null, "plan:pro", cfg)).toBe(0n);
    expect(relationshipTrustBps(undefined, "plan:pro", cfg)).toBe(0n);
    const ledger = applyRelationshipEncounters(null, [fact("renewed")], cfg)!;
    expect(relationshipTrustBps(ledger, undefined, cfg)).toBe(0n);
    expect(relationshipTrustBps(ledger, "sku:absent", cfg)).toBe(0n);
    expect(relationshipTrustBps(ledger, "plan:pro", cfg)).toBe(50n);
  });
});

describe("fail-loud guards (Law 4)", () => {
  it("a priceKey outside the '<kind>:<id>' grammar THROWS naming the module", () => {
    for (const key of ["nocolon", ":x", "x:"]) {
      expect(() => applyRelationshipEncounters(null, [fact("renewed", key)], cfg)).toThrow(/economy\/relationship/);
    }
  });
  it("an encounter without tone or without shippedAtTick is authoring poison", () => {
    expect(() => applyRelationshipEncounters(null, [{ kind: "negotiation-encounter", priceKey: "plan:pro", shippedAtTick: 0n }], cfg)).toThrow(/no tone/);
    expect(() => applyRelationshipEncounters(null, [{ kind: "negotiation-encounter", priceKey: "plan:pro", tone: "rapport" }], cfg)).toThrow(/no shippedAtTick/);
  });
});

describe("the meter casts no dice (zero-RNG source pin)", () => {
  const source = readFileSync(fileURLToPath(new URL("../relationship.ts", import.meta.url)), "utf8");
  it("relationship.ts never mentions streamFor or Math.random — trust moves only through booked facts", () => {
    expect(source).not.toMatch(/streamFor/);
    expect(source).not.toMatch(/Math\.random/);
  });
});

describe("ledger ordering (digest determinism)", () => {
  it("trustByKey is rebuilt code-unit-ascending regardless of booking order", () => {
    const ledger = applyRelationshipEncounters(
      null,
      [fact("renewed", "sku:b"), fact("lapsed", "plan:a"), fact("renewed", "contract-class:c")],
      cfg,
    )!;
    expect([...ledger.trustByKey.keys()]).toEqual(["contract-class:c", "plan:a", "sku:b"]);
  });
});

/* ══════════════════ B. negotiate.ts composition ══════════════════ */

function term(
  tone: NegotiationTerm["tone"],
  concession: bigint | null = null,
  shippedAtTick: bigint = 0n,
): NegotiationTerm {
  return Object.freeze({
    targetKind: "plan" as const,
    targetId: asEntityId("pro"),
    tone,
    concessionMicroUsd: concession === null ? null : asMoney(concession),
    termMonthsExtension: null,
    shippedAtTick,
    effectiveAtBusinessMinute: null,
  });
}

describe("negotiationToneBumpBps + the trust leg (the ADR-0016 refactor)", () => {
  it("the extraction reproduces the pre-A bump exactly (tone + concession-presence)", () => {
    expect(negotiationToneBumpBps(term("rapport"), cfg)).toBe(300n);
    expect(negotiationToneBumpBps(term("firm"), cfg)).toBe(100n);
    expect(negotiationToneBumpBps(term("legal"), cfg)).toBe(0n);
    expect(negotiationToneBumpBps(term("rapport", 25_000_000n), cfg)).toBe(600n);
    expect(negotiationToneBumpBps(term("legal", 25_000_000n), cfg)).toBe(300n);
    expect(negotiationToneBumpBps(term("rapport", 0n), cfg)).toBe(300n); // stance ≠ sweetener
  });
  it("3-arg behavior is EXACT: trustBps defaults to 0n for every tone/price pair", () => {
    for (const t of [null, term("rapport"), term("firm", 25_000_000n), term("legal", 0n)]) {
      for (const f of [BPS_DEN, 5_500n, 7_176n, 123n]) {
        expect(negotiationRetentionFactorBps(t, f, cfg)).toBe(negotiationRetentionFactorBps(t, f, cfg, 0n));
      }
    }
  });
  it("a NULL term ignores trust too (the identity tripwire: no negotiation, no bump — the meter never moves a bare cliff)", () => {
    expect(negotiationRetentionFactorBps(null, 5_500n, cfg, 1_000n)).toBe(5_500n);
    expect(negotiationRetentionFactorBps(null, 5_500n, cfg, -1_000n)).toBe(5_500n);
  });
  it("the DOWNWARD leg exists: negative trust sinks the factor strictly below the bare arm; positive lifts it", () => {
    const bare = negotiationRetentionFactorBps(term("rapport"), 5_500n, cfg);
    expect(negotiationRetentionFactorBps(term("rapport"), 5_500n, cfg, -200n)).toBeLessThan(bare);
    expect(negotiationRetentionFactorBps(term("rapport"), 5_500n, cfg, 200n)).toBeGreaterThan(bare);
  });
  it("the ≤1.0 CLAMP SURVIVES the composition: max-green trust + rapport + money on 9_434n ⇒ exactly BPS_DEN", () => {
    expect(negotiationRetentionFactorBps(term("rapport", 25_000_000n), 9_434n, cfg, 1_000n)).toBe(BPS_DEN);
  });
  it("the clamp applies AFTER the sum (no pre-trust clamp smuggled in): +600 trust on 9_434 crosses, +299 lands 9_999", () => {
    expect(negotiationRetentionFactorBps(term("rapport"), 9_434n, cfg, 600n)).toBe(BPS_DEN); // ×1.09 = 10_283 would cross
    expect(negotiationRetentionFactorBps(term("rapport"), 9_434n, cfg, 299n)).toBe(9_999n); // ×1.0599 = 9_999.10 → 9_999
  });
});

/* ══════════════════ C. tick integration ══════════════════ */

type Run = ReturnType<typeof runEconomyTick>;
type State = ReturnType<typeof scenario>["state"];

function fullDigest(r: Run): string {
  return digest([r.state, r.notices, r.events, r.entries]);
}

function scenario(contracts: readonly Contract[], scfg: EconomyConfig, priceKeys?: ReadonlyMap<string, string>) {
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
      scfg,
    );
  }
  return { cfg: scfg, map, state: s };
}

function runFolds(
  sc: ReturnType<typeof scenario>,
  ticks: readonly number[],
  opts: {
    negotiations?: ReadonlyMap<string, NegotiationTerm> | undefined;
    overrides?: ReadonlyMap<string, PriceOverrideRecord> | undefined;
    prior?: State | undefined;
  } = {},
): Run & { final: State } {
  let prior = structuredClone(opts.prior ?? sc.state);
  let last: Run | null = null;
  const notices: Array<EconomyTickOut["notices"][number]> = [];
  const events: Array<EconomyTickOut["events"][number]> = [];
  const entries: Array<EconomyTickOut["entries"][number]> = [];
  for (const minute of ticks) {
    last = runEconomyTick({
      context: ctxAt(minute, BigInt(Math.floor(minute / 60))),
      runSeed: SEED,
      contracts: sc.map,
      prior,
      cfg: sc.cfg,
      ...(opts.negotiations === undefined ? {} : { negotiations: opts.negotiations }),
      ...(opts.overrides === undefined ? {} : { priceOverrides: opts.overrides }),
    });
    prior = last.state;
    notices.push(...last.notices);
    events.push(...last.events);
    entries.push(...last.entries);
  }
  return { ...last!, notices, events, entries, final: prior };
}

const calm = (base: EconomyConfig = defaultEconomyConfig()): EconomyConfig => ({
  ...base,
  churn: { ...base.churn, monthlyLogoChurnBpsByBundle: {}, fallbackMonthlyBps: 0n },
  dunning: { ...base.dunning, cardFailureBps: 0n },
});

function noticeKinds(r: Run): string[] {
  return r.notices.map((n) => n.kind);
}

const HIKE: ReadonlyMap<string, PriceOverrideRecord> = new Map([
  [
    "plan:pro",
    Object.freeze({
      targetKind: "plan" as const,
      targetId: asEntityId("pro"),
      newPriceMicroUsd: asMoney(120n * 1_000_000n),
      effectiveAtBusinessMinute: null,
      setAtTick: 1n,
    }),
  ],
]);

describe("idle byte-identity (the absent-while-idle, death-key law)", () => {
  const c = contractOf("rl1", { termEndMin: 12 * MONTH });
  const sc = scenario([c], calm(), new Map([[c.id, "plan:pro"]]));
  const ticks = [0, MONTH, 2 * MONTH, 3 * MONTH, 12 * MONTH];

  it("no book, empty book and an orphan-key book are digest-identical AND leave the relationships key ABSENT", () => {
    const base = runFolds(sc, ticks);
    expect("relationships" in base.final).toBe(false);
    const full = fullDigest(base);
    expect(fullDigest(runFolds(sc, ticks, { negotiations: undefined }))).toBe(full);
    expect(fullDigest(runFolds(sc, ticks, { negotiations: new Map() }))).toBe(full);
    expect(
      fullDigest(runFolds(sc, ticks, { negotiations: new Map([["sku:orphan", term("rapport", 25_000_000n)]]) })),
    ).toBe(full);
    expect("relationships" in runFolds(sc, ticks, { negotiations: new Map([["sku:orphan", term("rapport", 25_000_000n)]]) }).final).toBe(false);
  });

  it("a future-dated book is not-yet-law: digest-identical, key ABSENT (the as-of discipline covers the meter)", () => {
    const full = fullDigest(runFolds(sc, ticks));
    const future = runFolds(sc, ticks, {
      negotiations: new Map([["plan:pro", Object.freeze({ ...term("rapport", 25_000_000n), effectiveAtBusinessMinute: 99 * MONTH })]]),
    });
    expect(fullDigest(future)).toBe(full);
    expect("relationships" in future.final).toBe(false);
  });

  it("an un-keyed contract rides a LIVE book with zero meter movement (negotiates with nobody — the meter included)", () => {
    const u = contractOf("rlu", { termEndMin: 12 * MONTH });
    const usc = scenario([u], calm());
    const base = runFolds(usc, [0, 12 * MONTH]);
    const booked = runFolds(usc, [0, 12 * MONTH], { negotiations: new Map([["plan:pro", term("rapport", 25_000_000n)]]) });
    expect(fullDigest(booked)).toBe(fullDigest(base));
    expect("relationships" in booked.final).toBe(false);
  });
});

describe("encounters and outcomes through the fold", () => {
  it("an in-force rapport books +25 ONCE and stays booked across five re-forwarded ticks (cursor through the tick)", () => {
    const c = contractOf("rl2", { termEndMin: 24 * MONTH });
    const sc = scenario([c], calm(), new Map([[c.id, "plan:pro"]]));
    const r = runFolds(sc, [0, MONTH, 2 * MONTH, 3 * MONTH, 4 * MONTH], {
      negotiations: new Map([["plan:pro", term("rapport")]]),
    });
    const row = r.final.relationships!.trustByKey.get("plan:pro")!;
    expect(row.trustBps).toBe(25n);
    expect(row.encounters).toBe(1);
    expect(row.lifetimeEvents).toBe(1);
  });

  it("an amendment mid-run (shippedAtTick 7 > cursor 0) re-accrues: rapport +25 then legal −15 = +10", () => {
    const c = contractOf("rl3", { termEndMin: 24 * MONTH });
    const sc = scenario([c], calm(), new Map([[c.id, "plan:pro"]]));
    const first = runFolds(sc, [0, MONTH], { negotiations: new Map([["plan:pro", term("rapport")]]) });
    const amended = runFolds(sc, [2 * MONTH, 3 * MONTH], {
      prior: first.final,
      negotiations: new Map([["plan:pro", Object.freeze({ ...term("legal"), shippedAtTick: 7n })]]),
    });
    const row = amended.final.relationships!.trustByKey.get("plan:pro")!;
    expect(row.trustBps).toBe(10n);
    expect(row.encounters).toBe(2);
    expect(row.lastEncounterAtTick).toBe(7n);
  });

  it("the cliff outcome accrues on its own row — but ONLY once the table opened it (table-first law): auto-renew + rapport talk ⇒ 25 then renewed +50 = 75; a never-talked renewal materializes NOTHING", () => {
    const a = contractOf("rlr", { termEndMin: 12 * MONTH, sla: { ...contractOf("rlr").sla, autoRenew: true } });
    const asc = scenario([a], calm(), new Map([[a.id, "plan:pro"]]));
    const silent = runFolds(asc, [12 * MONTH]); // no book at all — the file never opens
    expect(noticeKinds(silent)).toContain("cliff-renewed");
    expect("relationships" in silent.final).toBe(false);
    const renewer = runFolds(asc, [12 * MONTH], { negotiations: new Map([["plan:pro", term("rapport")]]) });
    expect(noticeKinds(renewer)).toContain("cliff-renewed");
    expect(trustOf(renewer.final.relationships!)).toBe(75n); // +25 read pre-draw, +50 renewed lands post-decision
    expect(renewer.final.relationships!.trustByKey.get("plan:pro")!.lifetimeEvents).toBe(2);

    const blank = calm();
    const lapseCfg: EconomyConfig = {
      ...blank,
      churn: { ...blank.churn, renewalRetentionBpsByTermMonths: {}, renewalRetentionFallbackBps: 0n },
    };
    const l = contractOf("rll", { termEndMin: 12 * MONTH });
    const lsc = scenario([l], lapseCfg, new Map([[l.id, "plan:pro"]]));
    const lapse = runFolds(lsc, [12 * MONTH], { negotiations: new Map([["plan:pro", term("firm")]]) });
    expect(noticeKinds(lapse)).toContain("cliff-lapsed");
    expect(trustOf(lapse.final.relationships!)).toBe(10n - 80n); // firm +10 opened, lapse −80
  });

  it("a clean on-time payment is METER-NEUTRAL even on an OPEN file (no dunning history ⇒ no repair; and with no book, no file at all)", () => {
    const c = contractOf("rlc", { termEndMin: 24 * MONTH });
    const sc = scenario([c], calm(), new Map([[c.id, "plan:pro"]]));
    const bare = runFolds(sc, [0]); // due day-0, card never fails (calm) — clean settle
    expect(noticeKinds(bare)).toContain("invoice-paid");
    expect("relationships" in bare.final).toBe(false);
    const talked = runFolds(sc, [0], { negotiations: new Map([["plan:pro", term("rapport")]]) });
    expect(noticeKinds(talked)).toContain("invoice-paid");
    expect(trustOf(talked.final.relationships!)).toBe(25n); // the encounter only — payment-after-stage did NOT fire
  });
});

describe("the dunning ladder burns and repairs the TENANT row", () => {
  it("THE DOUBLE-CHARGE IS LAW, NOT ACCIDENT (R9): for a tenant the table opened, one write-off costs the COMPANY reputation (−600, step 12.5) AND the TENANT trust (talk +25, three stage burns, a suspension, the write-off −400 ⇒ −775, step 12.55) — the meters never net off", () => {
    const base = calm();
    const failing: EconomyConfig = {
      ...base,
      dunning: {
        ...base.dunning,
        cardFailureBps: 10_000n, // always decline (the deterministic full path, tick.test.ts:186)
        stageRecoveryBps: { retry: 0n, reminder: 0n, warning: 0n, suspend: 0n },
        postSuspensionRecoveryBps: 0n,
      },
    };
    const c = contractOf("rld", { termEndMin: 12 * MONTH });
    const sc = scenario([c], failing, new Map([[c.id, "plan:pro"]]));
    const books = new Map([["plan:pro", term("rapport")]]); // opens the file day 0
    const r = runFolds(sc, Array.from({ length: 22 }, (_, day) => day * DAY), { negotiations: books });
    expect(noticeKinds(r)).toContain("written-off");
    // Company pool: exactly the one written-off signal (−600) — the stage
    // and suspension notices are reputation-neutral there:
    expect(r.final.reputation.overallBps).toBe(5_000n - 600n);
    // Tenant row: +25 (encounter) −300 (retry/reminder/warning) −100
    // (suspension) −400 (write-off) = −775, six booked facts.
    const row = r.final.relationships!.trustByKey.get("plan:pro")!;
    expect(row.trustBps).toBe(-775n);
    expect(row.lifetimeEvents).toBe(6);
    expect(row.encounters).toBe(1);
  });

  it("a dunning recovery books its repair EXACTLY ONCE (the same-fold invoice-paid twin never double-books)", () => {
    const base = calm();
    const saving: EconomyConfig = {
      ...base,
      dunning: { ...base.dunning, cardFailureBps: 10_000n, stageRecoveryBps: { retry: 10_000n, reminder: 0n, warning: 0n, suspend: 0n } },
    };
    const c = contractOf("rls", { termEndMin: 12 * MONTH });
    const sc = scenario([c], saving, new Map([[c.id, "plan:pro"]]));
    const r = runFolds(sc, [0, DAY], { negotiations: new Map([["plan:pro", term("rapport")]]) }); // decline at 0, retry-entry recovery at DAY
    expect(noticeKinds(r)).toContain("dunning-recovered");
    expect(noticeKinds(r)).toContain("invoice-paid"); // the same-fold twin
    const row = r.final.relationships!.trustByKey.get("plan:pro")!;
    expect(row.trustBps).toBe(25n + 50n); // encounter opened +25, ONE repair +50 — NEVER +100 of repairs
    expect(row.lifetimeEvents).toBe(2); // retry-entry recovered directly (no separate stage burn)
  });
});

/* ══════════════════ D. dice-level consumption witnesses ══════════════════ */

/* Burned prior: 40 legal encounters (−15 × 40 = −600), one per door tick
 * 0..39 — the LWW amendment history of a tenant that was bullied into the
 * conversation it finally has at the cliff. Its cursor (39n) is ABOVE the
 * fresh rapport term's stamp (0n), so the talk cannot re-accrue: the burn
 * is already booked and the term only moves the bump. */
const burnedPrior = (() => {
  const events: RelationshipEvent[] = [];
  for (let i = 0n; i < 40n; i += 1n) events.push(enc("plan:pro", "legal", i));
  return applyRelationshipEncounters(null, events, cfg)!;
})();

/* Brute the id space like negotiate-cliff.test.ts's witness. On the HIKE
 * book the bare cliff runs 7176 bps; the SAME single draw per (seed, cliff
 * minute, id) is then compared against:
 *   green  = rapport-no-money with a fresh row: its own encounter books
 *            +25 at step 3.5 BEFORE the read ⇒ 7409 bps, and
 *   burned = rapport-no-money on a −600 history (cursor 39n dedupes the
 *            talk — no re-accrual): bump 300−600 = −300 ⇒ 6_961 bps (the
 *            downward leg — the proxy posture could never reach). The draw
 *            must land in [7176, 7409): bare lapses, green renews, and
 *            burned lapses automatically (6961 < draw). ~2.3% per id,
 *            comfortable inside 400. #N1-era pattern: the DOWNWARD-LEG
 *            falsifier made dice. */
const w1_400 = (() => {
  for (let i = 1; i <= 400; i += 1) {
    const c = contractOf(`v${i}`, { termEndMin: 12 * MONTH });
    const sc = scenario([c], calm(), new Map([[c.id, "plan:pro"]]));
    const bare = noticeKinds(runFolds(sc, [12 * MONTH], { overrides: HIKE })).includes("cliff-lapsed");
    const green = noticeKinds(
      runFolds(sc, [12 * MONTH], { negotiations: new Map([["plan:pro", term("rapport")]]), overrides: HIKE }),
    ).includes("cliff-renewed");
    const burned = noticeKinds(
      runFolds(sc, [12 * MONTH], {
        negotiations: new Map([["plan:pro", term("rapport")]]),
        overrides: HIKE,
        prior: { ...sc.state, relationships: burnedPrior },
      }),
    ).includes("cliff-lapsed");
    if (bare && green && burned) return { id: `v${i}`, sc };
  }
  return null;
})();

describe("the ledger makes the story REACHABLE — green renews where the burned tenant lapses (same seed, same single draw)", () => {
  it("a v in 1..400 exists with bare-lapses ∧ green-renews ∧ burned-lapses", () => {
    expect(w1_400, "no green-vs-burned cliff crossing in 400 ids — the trust leg is dead arithmetic?").not.toBeNull();
  });
  it("witness green row: +25 read BEFORE the draw, renewed +50 lands AFTER it (75 final) — one die, no retrocausality", () => {
    if (w1_400 === null) return;
    const green = runFolds(w1_400.sc, [12 * MONTH], { negotiations: new Map([["plan:pro", term("rapport")]]), overrides: HIKE });
    const row = green.final.relationships!.trustByKey.get("plan:pro")!;
    expect(row.trustBps).toBe(75n); // +25 (pre-draw read) + 50 (post-draw renewed outcome)
    expect(row.lifetimeEvents).toBe(2);
  });
  it("the clamp survives the DICE too: a max-trust (+1_000) rapport-WITH-money talk can at most restore the AUTHORED 7800 — on an id whose draw clears even that, the tenant still walks (uncalamped trust would renew ANY draw)", () => {
    // Without the sum-then-clamp, bump 1_625 would put retention at
    // 7176×2.625 = 18_837 bps — a certainty the ≤1.0 ceiling forbids. The
    // clamp pins the ceiling at BPS_DEN ⇒ exactly the unhiked authored
    // value, so a draw ≥ 7800 still lapses. Brute for such an id:
    let clampId: string | null = null;
    let clampRun: ReturnType<typeof runFolds> | null = null;
    for (let i = 1; i <= 400 && clampRun === null; i += 1) {
      const c = contractOf(`k${i}`, { termEndMin: 12 * MONTH });
      const sc = scenario([c], calm(), new Map([[c.id, "plan:pro"]]));
      const atCeiling: RelationshipLedger = {
        trustByKey: new Map([["plan:pro", { trustBps: 1_000n, encounters: 40, lifetimeEvents: 40, lastEncounterAtTick: 0n }]]),
      };
      const r = runFolds(sc, [12 * MONTH], {
        negotiations: new Map([["plan:pro", term("rapport", 25_000_000n)]]), // shippedAtTick 0n == cursor ⇒ no re-accrual
        overrides: HIKE,
        prior: { ...sc.state, relationships: atCeiling },
      });
      if (noticeKinds(r).includes("cliff-lapsed")) {
        clampId = `k${i}`;
        clampRun = r;
      }
    }
    expect(clampId, "no draw ≥ authored 7800 among 400 ids — the clamp claim is unfalsifiable here?").not.toBeNull();
    expect(trustOf(clampRun!.final.relationships!)).toBe(920n); // 1_000 + lapsed −80 (the meter keeps telling the truth)
    expect(clampRun!.final.relationships!.trustByKey.get("plan:pro")!.lifetimeEvents).toBe(41);
  });
});

describe("×100 determinism of a booked multi-week life", () => {
  it("encounters, amendments, a concession-discounted quarter and a cliff replay byte-identical 100 times", () => {
    const c = contractOf("life", { termEndMin: 6 * MONTH });
    const sc = scenario([c], calm(), new Map([[c.id, "plan:pro"]]));
    const script = [0, MONTH, 2 * MONTH, 6 * MONTH, 7 * MONTH, 8 * MONTH, 9 * MONTH];
    const books: Array<ReadonlyMap<string, NegotiationTerm> | undefined> = [
      undefined,
      new Map([["plan:pro", term("rapport")]]), // +25 @0
      new Map([["plan:pro", Object.freeze({ ...term("legal"), shippedAtTick: 3n })]]), // −15 @3 → +10
      new Map([["plan:pro", Object.freeze({ ...term("rapport", 25_000_000n), shippedAtTick: 9n })]]), // +25 @9 → +35; cliff this fold reads +35
      undefined,
      undefined,
      undefined,
    ];
    const digests = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      let prior = structuredClone(sc.state);
      const parts: unknown[] = [];
      for (let step = 0; step < script.length; step += 1) {
        const r = runEconomyTick({
          context: ctxAt(script[step]!, BigInt(Math.floor(script[step]! / 60))),
          runSeed: SEED,
          contracts: sc.map,
          prior,
          cfg: sc.cfg,
          ...(books[step] === undefined ? {} : { negotiations: books[step]! }),
        });
        parts.push([r.state, r.notices, r.events, r.entries]);
        prior = r.state;
      }
      digests.add(digest(parts));
    }
    expect(digests.size).toBe(1);
  });
});
