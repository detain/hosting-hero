/** sellCatalog.test.ts — L-SMR (wave-27, ADR-0016 mechanic B host leg): the
 *  sellMarketRates CATALOG crosses the scenario boundary as RUN-CONFIG world
 *  fact (era posture, ADR-0019 program 4) and never as doc data — the runner's
 *  self-grading refusal law survives the leg precisely because the feed is the
 *  host's market reading, not a scenario-authored wish.
 *
 *  What this suite pins at SCENARIO ALTITUDE (the money-grade proofs already
 *  live in unattended/host-forwarding.test.ts and economy/sell-accept.test.ts):
 *   - the flip is real and key-scoped: a catalog rate ABOVE the offer buys
 *     acceptance, BELOW it buys refusal (anchor-relative dice — direction
 *     probe-pinned on this build, NOT guessed);
 *   - verdicts are market OPINION, not money: cashEnd, economyRounds and even
 *     the state digest are byte-identical across every arm — acceptance moves
 *     ONLY the sparse `observation.sellVerdicts` key and the trace's
 *     sell-notice census (the report needs no echo: SellVerdict rides the
 *     EconomyState the digest fold owns separately);
 *   - key-free absence: an EMPTY map byte-stands the bare run at the seam;
 *   - zero rates are legal and shadow the installed base into
 *     unadjudicated-nothing (no denominator, no dice — economy/sell.ts law);
 *   - the seam wall throws BAD_MONEY before tick 1 (config-side, unlike the
 *     engine's adjudication-time refusal);
 *   - all 31 shipped wires — none of which carries a sell rail — digest
 *     byte-ident armed with a full catalog (extend of sellVerdicts.test.ts:224
 *     posture WITHOUT touching that file). */
import { describe, expect, it } from "vitest";

import {
  SHIPPED_SCENARIO_IDS,
  parseScenarioDoc,
  runScenario,
  shippedScenario,
} from "../index.ts";
import type { ScenarioReport } from "../index.ts";
import type { MoneyUnit } from "../../types.ts";
import { asMoney, asRunSeed } from "../../types.ts";
import { corpusAuthority } from "./corpusFixtures.ts";

const BASE_SEED = asRunSeed(904n);

/* ───────────────────────────── fixtures ─────────────────────────────
 * The rail is the sellVerdicts.test.ts `sellWire` shape (two offers, two
 * signed anchor contracts, 60-tick clock) with one deliberate difference:
 * the win line sits at count 10 so no arm short-circuits at the first
 * verdict — every run reaches timeout@60 and the FULL census is on the
 * report before any stop law can intervene. */

function catalogWire(priceKeyless: boolean): Record<string, unknown> {
  return JSON.parse(
    JSON.stringify({
      schema: "hh-scenario@1",
      id: "smr-catalog-drill",
      name: "Catalog Drill",
      brief: "Two offers; the host catalog decides the anchor.",
      specRef: "§1.5 exit-chapter verdict grammar",
      specLine: 4014,
      board: { nodes: [{ id: "web-1", slots: 40, serviceTimeUs: 2000000 }], edges: [] },
      contracts: [
        {
          id: "anchor-basic",
          mrcMicroUsd: "10000000",
          termEndMin: 5760,
          billingCycle: "monthly",
          ...(priceKeyless ? {} : { priceKey: "plan:basic" }),
        },
        {
          id: "anchor-premium",
          mrcMicroUsd: "40000000",
          termEndMin: 5760,
          billingCycle: "monthly",
          ...(priceKeyless ? {} : { priceKey: "plan:premium" }),
        },
      ],
      traffic: { tableId: "drill", segments: [{ fromMinute: 0, ratePerMin: 1 }] },
      intents: [
        {
          atTick: 3,
          verb: "sell-offer",
          args: {
            targetKind: "plan",
            targetId: "basic",
            offerPriceMicroUsd: "1000",
            termMonths: 12,
            effectiveAtBusinessMinute: null,
          },
        },
        {
          atTick: 4,
          verb: "sell-offer",
          args: {
            targetKind: "plan",
            targetId: "premium",
            offerPriceMicroUsd: "400000000000",
            termMonths: 12,
            effectiveAtBusinessMinute: null,
          },
        },
      ],
      objectives: {
        win: [
          { kind: "sell-accepted-above", count: 10 },
          { kind: "sell-refused-above", count: 10 },
        ],
        lose: [],
      },
      limits: { maxSimMinutes: 60, initialFreeMicroUsd: 0, opex: [] },
    }),
  ) as Record<string, unknown>;
}

/** A catalog with NO rail to feed: the fold's 5.5 gate never even opens. */
function booklessWire(): Record<string, unknown> {
  const wire = catalogWire(false);
  delete wire.intents;
  return wire;
}

/* Probe-pinned rates (this engine build, BASE_SEED 904): plan:basic's 1µ$
 * rate turns the 1000µ$ offer into a ~10^5-percent premium (refusal floor);
 * plan:premium's 800B rate turns the 400B offer into a 2× bargain (acceptance
 * ceiling). Direction is PINNED below from the probe run, per lane law. */
const FLIP_EVERYTHING: ReadonlyMap<string, MoneyUnit> = Object.freeze(
  new Map<string, MoneyUnit>([
    ["plan:basic", asMoney(1n)],
    ["plan:premium", asMoney(800_000_000_000n)],
  ]),
);
const BASIC_PREMIUM_MARKET: ReadonlyMap<string, MoneyUnit> = Object.freeze(
  new Map<string, MoneyUnit>([["plan:basic", asMoney(1n)]]),
);
const FREE_MARKET_ZEROS: ReadonlyMap<string, MoneyUnit> = Object.freeze(
  new Map<string, MoneyUnit>([
    ["plan:basic", asMoney(0n)],
    ["plan:premium", asMoney(0n)],
  ]),
);

const bareRun = (doc: ReturnType<typeof parseScenarioDoc>, seedOffset = 0): ScenarioReport =>
  runScenario(doc, BASE_SEED, { seedOffset });
const armedRun = (
  doc: ReturnType<typeof parseScenarioDoc>,
  catalog: ReadonlyMap<string, MoneyUnit>,
  seedOffset = 0,
): ScenarioReport => runScenario(doc, BASE_SEED, { seedOffset, sellMarketRates: catalog });

/** The money-grade identity of a report: everything the verdict census must
 *  NEVER touch, folded to one comparable string. */
function moneyIdentity(report: ScenarioReport): string {
  return [
    report.endDigest,
    String(report.cashStartMicroUsd),
    String(report.cashEndMicroUsd),
    String(report.trace.economyRounds),
    String(report.trace.economyRefusals),
  ].join("|");
}

describe("catalog flip — the host rate outranks the installed base, key by key", () => {
  /* Base anchors: plan:basic 10M (offer 1000 = bargain), plan:premium 40M
   * (offer 400B = premium). Offset 0 (probe-pinned): base accepts basic,
   * refuses premium; the FULL catalog flips BOTH keys per-key; naming only
   * basic flips only basic. */
  const doc = parseScenarioDoc(catalogWire(false));

  it("bare installed-base twin at offset 0: one acceptance, one refusal (direction pinned)", () => {
    const report = bareRun(doc);
    expect(report.stopReason).toBe("timeout@60");
    expect(report.observation.sellVerdicts).toEqual({ accepted: 1, refused: 1 });
    expect(report.trace.noticesByKind["sell-accepted"]).toBe(1);
    expect(report.trace.noticesByKind["sell-refused"]).toBe(1);
  });

  it("a catalog ABOVE the offer buys acceptance, BELOW it buys refusal — both keys flip", () => {
    /* Probe-pinned (never guessed): offset 5 rides the refusal-heavy base die
       {0,2}; the same run with the flipped-market catalog is {1,1}. This is
       the scenario-altitude mirror of host-forwarding's catalog-authority
       arm — dice anchor-relative, census exactly one verdict per key. */
    const bare = bareRun(doc, 5);
    expect(bare.observation.sellVerdicts).toEqual({ accepted: 0, refused: 2 });
    const armed = armedRun(doc, FLIP_EVERYTHING, 5);
    expect(armed.stopReason).toBe("timeout@60");
    expect(armed.observation.sellVerdicts).toEqual({ accepted: 1, refused: 1 });
    expect(armed.trace.noticesByKind["sell-accepted"]).toBe(1);
    expect(armed.trace.noticesByKind["sell-refused"]).toBe(1);
  });

  it("the catalog is KEY-SCOPED: naming only plan:basic flips only that key", () => {
    /* Offset 0 bare: basic accepted (10M anchor), premium refused (40M).
       Catalog names basic at 1µ$ → basic refused; premium keeps its base
       verdict (refused) → {0,2}. A miss-keyed catalog entry can never
       shadow a different key's anchor. */
    const armed = armedRun(doc, BASIC_PREMIUM_MARKET, 0);
    expect(armed.observation.sellVerdicts).toEqual({ accepted: 0, refused: 2 });
  });

  it("the verdicts the catalog MINTS exist only as sparse observation — a keyed-none arm proves the shadow", () => {
    /* Zero rates are LEGAL money (the wall admits them) and each one shadows
       its key's installed-base anchor into nothing: no denominator, no dice
       (economy/sell.ts). Base {1,1} → armed-with-zeros has NO verdict key at
       all, no notices — while the digest rides byte-identical (below). */
    const armed = armedRun(doc, FREE_MARKET_ZEROS, 0);
    expect(Object.hasOwn(armed.observation, "sellVerdicts")).toBe(false);
    expect(armed.trace.noticesByKind["sell-accepted"]).toBeUndefined();
    expect(armed.trace.noticesByKind["sell-refused"]).toBeUndefined();
    expect(armed.endDigest).toBe(bareRun(doc).endDigest);
  });
});

describe("verdicts are opinion — money, ledger rounds and the state digest never move", () => {
  const doc = parseScenarioDoc(catalogWire(false));

  it("cashEnd/economyRounds/endDigest byte-ident across every catalog arm at offset 0", () => {
    const bare = bareRun(doc);
    /* Probe-pinned at this build: the whole six-arm identity of a money-
       untouched run. If a verdict ever starts moving money this reddens. */
    expect(bare.cashEndMicroUsd).toBe(43_155_000n);
    expect(bare.endDigest).toBe("a2fe3719c79743da29a61ec5a52731eb");
    const arms: Array<[string, ReadonlyMap<string, MoneyUnit>]> = [
      ["flip-everything", FLIP_EVERYTHING],
      ["basic-only", BASIC_PREMIUM_MARKET],
      ["zeros", FREE_MARKET_ZEROS],
    ];
    for (const [name, catalog] of arms) {
      const armed = armedRun(doc, catalog);
      expect(moneyIdentity(armed), name).toBe(moneyIdentity(bare));
    }
  });

  it("the catalog is the ONLY anchor a book-less world never sees: priceKeyless rail adjudicates through the host leg alone", () => {
    /* The purest leg witness: unkeyed contracts mean the base anchor map is
       EMPTY — bare, the offers execute at the door yet stay honestly
       unadjudicated (anti-lie rung, wave 26). Arm the catalog and the SAME
       run mints exactly one verdict per key, cash byte-equal. */
    const doc = parseScenarioDoc(catalogWire(true));
    const bare = bareRun(doc);
    expect(Object.hasOwn(bare.observation, "sellVerdicts")).toBe(false);
    const armed = armedRun(doc, FLIP_EVERYTHING);
    expect(armed.observation.sellVerdicts).toEqual({ accepted: 1, refused: 1 });
    expect(armed.trace.noticesByKind["sell-accepted"]).toBe(1);
    expect(armed.trace.noticesByKind["sell-refused"]).toBe(1);
    expect(String(armed.cashEndMicroUsd)).toBe(String(bare.cashEndMicroUsd));
    expect(armed.endDigest).toBe(bare.endDigest); // opinion, not state
  });

  it("a catalog WITHOUT a book is inert by the fold's own gate: report identity untouched", () => {
    const doc = parseScenarioDoc(booklessWire());
    const bare = bareRun(doc);
    const armed = armedRun(doc, FLIP_EVERYTHING);
    expect(moneyIdentity(armed)).toBe(moneyIdentity(bare));
    expect(Object.hasOwn(armed.observation, "sellVerdicts")).toBe(false);
  });

  it("an EMPTY catalog omits the key at the seam — byte-ident to the bare run (key-free absence)", () => {
    const doc = parseScenarioDoc(catalogWire(false));
    const bare = bareRun(doc);
    const armed = runScenario(doc, BASE_SEED, { sellMarketRates: new Map<string, MoneyUnit>() });
    expect(armed.endDigest).toBe(bare.endDigest);
    expect(armed.observation.sellVerdicts).toEqual({ accepted: 1, refused: 1 }); // base anchors, no shadow
  });
});

describe("the seam wall — BAD_MONEY dies before tick 1, config-side", () => {
  const doc = parseScenarioDoc(catalogWire(false));

  it("a non-bigint rate throws scenario[BAD_MONEY] naming the key and the path", () => {
    const liar = new Map<string, MoneyUnit>([["plan:basic", 100 as unknown as MoneyUnit]]);
    expect(() => runScenario(doc, BASE_SEED, { sellMarketRates: liar })).toThrow(
      /scenario\[BAD_MONEY\] at 'runScenario\.sellMarketRates': market rate for 'plan:basic' must be a non-negative bigint of micro-USD, got 100/,
    );
  });

  it("a negative bigint rate throws the same wall (the engine's own refusal relocated to the seam)", () => {
    const liar = new Map<string, MoneyUnit>([["plan:premium", -1n as unknown as MoneyUnit]]);
    expect(() => runScenario(doc, BASE_SEED, { sellMarketRates: liar })).toThrow(
      /scenario\[BAD_MONEY\] at 'runScenario\.sellMarketRates': market rate for 'plan:premium' .* got -1/,
    );
  });

  it("the wall is CONFIG-SIDE: a bad catalog throws even on a rail-less world where adjudication would never fire", () => {
    /* The engine-side RangeError (economy/sell.ts) only meets a bad entry at
       adjudication — with no book it would NEVER fire, and the lie would sit
       in the config forever. The seam parses the map itself, book or no book. */
    const bookless = parseScenarioDoc(booklessWire());
    const liar = new Map<string, MoneyUnit>([["plan:basic", 1.5 as unknown as MoneyUnit]]);
    expect(() => runScenario(bookless, BASE_SEED, { sellMarketRates: liar })).toThrow(
      /scenario\[BAD_MONEY\] at 'runScenario\.sellMarketRates'/,
    );
  });
});

describe("determinism and the shipped roster — the leg changes nothing that does not arm it", () => {
  it("armed ×100: the flip-everything run is byte-one (digest|stop|census identity)", () => {
    const doc = parseScenarioDoc(catalogWire(false));
    const identities = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      const report = armedRun(doc, FLIP_EVERYTHING, 5);
      identities.add(`${report.endDigest}|${report.stopReason}|${JSON.stringify(report.observation.sellVerdicts)}`);
    }
    expect(identities.size).toBe(1);
    const [only] = [...identities];
    expect(only).toContain("timeout@60");
    expect(only).toContain('{"accepted":1,"refused":1}');
  });

  it("all 31 shipped wires digest byte-equal armed with a full catalog (extend of the sellVerdicts roster posture)", () => {
    for (const id of [...SHIPPED_SCENARIO_IDS]) {
      const doc = shippedScenario(id);
      const bare = runScenario(doc, BASE_SEED, { tickCap: 12, corpus: corpusAuthority() });
      const armed = runScenario(doc, BASE_SEED, { tickCap: 12, corpus: corpusAuthority(), sellMarketRates: FLIP_EVERYTHING });
      expect(armed.endDigest, id).toBe(bare.endDigest);
      expect(Object.hasOwn(armed.observation, "sellVerdicts"), id).toBe(false);
    }
    expect(SHIPPED_SCENARIO_IDS).toHaveLength(31);
  });
});
