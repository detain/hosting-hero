/**
 * SELL-OFFER — the 14th door verb (ADR-0015 door-mechanics ruling, tier verbs
 * 3/5 · Sell). The intent-door.test.ts "32-code refusal census" header gets
 * the scale precedent's honest amendment here: sell introduces exactly THREE
 * new refusal phrases — `bad-offer-price`, `bad-term-months`, `unknown-target`
 * (the canSellOffer seam's prefix, the `unknown-plan` twin). The census is a
 * comment-side enumeration, machine-pinned nowhere, so nothing reddens — this
 * header is the disclosure. The other three refusals reuse census entries
 * verbatim (`bad-target-kind`, `empty-target-id`, `bad-effective-minute`),
 * exactly as the adjust-price family.
 *
 * THE NO-NEW-FOLD VERB (the mission's shape): unlike shield/scale/maintain/
 * schedule, NOTHING in the sim reads `GameState.sell` in v0. OD-24(a)
 * part-1 posture VERBATIM: "the queued economy/HUD lanes reading this book,
 * not the door's job" (types.ts AdjustPrice docblock). The host consumes the
 * book between ticks and signs the sale through the EXISTING economy seam
 * (register/openContractEconomy + priceKey @5781335). The sales act is
 * deterministic player authority — an executed intent IS the close; no
 * acceptance dice in v0 (grounded §1.3 exchange-colo "The Microsecond
 * Cathedral", hosting_game.md:2361-2378: "microseconds are what you sell",
 * "you sell *equal* latency as a product"; the verb-shift line "Colo: sell
 * space and police power" :514); the refusal grammar is the counterparty.
 *
 * KEY-GRAMMAR DECISION (disclosed): the sell book REUSES `priceOverrideKey`
 * / `parsePriceOverrideKey` — identity, not duplication: a sell-book key IS
 * an economy priceKey, so the host feeds it straight into the pricing seam
 * with zero translation. The door↔economy kind-vocabulary mirror is pinned
 * below by reading BOTH sources (the elasticity.test.ts readFileSync
 * pattern) — the import-direction law (pipeline never imports economy and
 * vice versa) keeps the vocabularies twins, and this pin keeps them honest.
 *
 * Pins (the scale/shield contract, mirrored deliberately):
 *  - the ONLY state effect is one frozen entry in the OPTIONAL
 *    `GameState.sell` book — the cash-untouched pin is THIS verb's
 *    falsifiable core: an executed offer leaves freeCashMicroUsd identical
 *    armed-vs-unarmed on the same seed (money moves ONLY via the host
 *    reading the book — proven live below on the driver);
 *  - occupancy/hand cost: 1/1 desk decision (COMMIT class);
 *    RATIFIED 2026-10-17 (ADR-0016 #11), post-ratify, pinned red on drift;
 *  - M2 wire wall: all five arg keys are STRUCTURAL (missing/wrong type
 *    throws IntentDoorError); the bigint carrier refuses string/number
 *    garbage at parse; the explicit `null` sentinel is the only "now" form;
 *    termMonths float/0/negative REFUSE (value domain), never throw;
 *  - last-write-wins COW per composite key; distinct keys accumulate; the
 *    first-colon split is exact even for colon-carrying ids;
 *  - digest-switch law: absent ⇒ every golden byte-identical; present ⇒
 *    moves, insertion-order-independent; every absorbed field participates;
 *  - the live door pass casts ZERO dice and moves ZERO money: the same-seed
 *    armed-vs-unarmed engine ledger (units/slots/queues/cash) is identical.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type {
  EntityId,
  ExternalIntent,
  GameState,
  PlayerVerbArgs,
  SellBook,
  SellOffer,
  SellOfferArgs,
  SimTick,
  TickContext,
} from "../../types";
import { asEntityId, asMoney, asRunSeed, PlayerVerb } from "../../types";
import { fromInt } from "../../kernel/fixed";
import { initialClocks, MICROS_PER_MIN as MIN } from "../../kernel/time";
import { streamFor } from "../../kernel/rng";
import { createInitialState, createTickDriver, type TickDriverOptions, type TickInputs } from "../driver";
import { digestState } from "../digest";
import { createDefaultSlots } from "../index";
import {
  applyIntentDoor,
  createBoardState,
  createSellBook,
  parsePriceOverrideKey,
  priceOverrideKey,
  IntentDoorError,
  DEFAULT_INTENT_HAND_COST,
  DEFAULT_INTENT_OCCUPANCY_TICKS,
} from "../intent-door";
import { DEFAULT_CLASSES, IDS, NO_RETRY, envelope, freshClocks, node, testConfig, tickInputs } from "./helpers";

/* ═══════════════════════════════ fixtures (scale template) ═══════════════════════════════ */

function ctx(tick: SimTick): TickContext {
  return Object.freeze({ tick, minute: Number(tick), clocks: initialClocks() });
}

function ext(tick: SimTick, seq: number, args: PlayerVerbArgs): ExternalIntent {
  return Object.freeze({
    tick,
    intent: Object.freeze({
      seq,
      clock: "sim" as const,
      atUs: tick * MIN,
      origin: "player" as const,
      payload: Object.freeze({ kind: "player-verb" as const, args }),
    }),
  });
}

function baseState(handCapacity = 2): GameState {
  return createInitialState({
    runSeed: asRunSeed(7n),
    engineVersion: "test-sell",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
    clocks: initialClocks(),
    nodes: [
      node(IDS.edge, { slots: 2, serviceUs: MIN }),
      node(IDS.origin, { slots: 1, serviceUs: MIN }),
    ],
    handCapacity,
    board: createBoardState(),
  });
}

const ARM: SellOfferArgs = {
  verb: PlayerVerb.SellOffer,
  targetKind: "plan",
  targetId: asEntityId("cathedral-1u"),
  offerPriceMicroUsd: asMoney(250_000_000n),
  termMonths: 12,
  effectiveAtBusinessMinute: null,
};

function sellBook(entries: ReadonlyMap<string, SellOffer>, version = 1): SellBook {
  return Object.freeze({ version, entries: Object.freeze(new Map(entries)) });
}

function seedOffer(
  targetKind: SellOffer["targetKind"],
  targetId: string,
  offerPriceMicroUsd: bigint,
  termMonths: number,
  shippedAtTick: bigint,
  effectiveAtBusinessMinute: number | null,
): SellOffer {
  return Object.freeze({
    targetKind,
    targetId: asEntityId(targetId),
    offerPriceMicroUsd: asMoney(offerPriceMicroUsd),
    termMonths,
    shippedAtTick,
    effectiveAtBusinessMinute,
  });
}

function refused(result: ReturnType<typeof applyIntentDoor>, seq: number): string {
  const receipt = result.receipts.find((r) => r.seq === seq);
  if (receipt === undefined || receipt.outcome !== "refused" || receipt.reason === null) {
    throw new Error(`expected a refusal for seq ${seq}`);
  }
  return receipt.reason;
}

function outcomeOf(result: ReturnType<typeof applyIntentDoor>, seq: number): string {
  const receipt = result.receipts.find((r) => r.seq === seq);
  if (receipt === undefined) throw new Error(`no receipt for seq ${seq}`);
  return receipt.outcome;
}

/* ═══════════════════════ happy path — the offer book writes ═══════════════════════ */

describe("sell-offer — execution and the offer book", () => {
  it("executes: one frozen entry under the priceKey-shaped key, canonical detail, lazy materialization", () => {
    const before = baseState();
    expect(before.sell).toBeUndefined();
    const result = applyIntentDoor(before, ctx(3n), [ext(3n, 1, ARM)]);
    expect(outcomeOf(result, 1)).toBe("executed");
    const book = result.state.sell;
    expect(book).toBeDefined();
    expect(book?.version).toBe(1);
    expect(book?.entries.size).toBe(1);
    // THE key law: a sell-book key IS an economy priceKey — the SAME codec:
    const key = priceOverrideKey("plan", asEntityId("cathedral-1u"));
    expect(key).toBe("plan:cathedral-1u");
    const entry = book?.entries.get(key);
    expect(entry).toEqual({
      targetKind: "plan",
      targetId: "cathedral-1u",
      offerPriceMicroUsd: asMoney(250_000_000n),
      termMonths: 12,
      shippedAtTick: 3n,
      effectiveAtBusinessMinute: null,
    });
    expect(Object.isFrozen(entry)).toBe(true);
    expect(Object.isFrozen(book)).toBe(true);
    const event = result.events[0];
    expect(event?.kind).toBe("intent-executed");
    expect(event?.kind === "intent-executed" && event.detail).toBe(
      "target=plan:cathedral-1u,price=250000000,term=12",
    );
  });

  it("a future business-minute stamp rides the entry verbatim and extends the detail", () => {
    const result = applyIntentDoor(baseState(), ctx(1n), [
      ext(1n, 1, { ...ARM, effectiveAtBusinessMinute: 43_200 }),
    ]);
    expect(result.state.sell?.entries.get("plan:cathedral-1u")).toEqual({
      targetKind: "plan",
      targetId: "cathedral-1u",
      offerPriceMicroUsd: asMoney(250_000_000n),
      termMonths: 12,
      shippedAtTick: 1n,
      effectiveAtBusinessMinute: 43_200,
    });
    expect(result.events[0]?.kind === "intent-executed" && result.events[0].detail).toBe(
      "target=plan:cathedral-1u,price=250000000,term=12,at=43200",
    );
  });

  it("commit-class occupancy ladder: 1 hand, 1 tick, busyUntil = tick + 1 (RATIFIED 2026-10-17 (ADR-0016 #11), pinned)", () => {
    expect(DEFAULT_INTENT_HAND_COST[PlayerVerb.SellOffer]).toBe(1);
    expect(DEFAULT_INTENT_OCCUPANCY_TICKS[PlayerVerb.SellOffer]).toBe(1);
    const result = applyIntentDoor(baseState(1), ctx(5n), [ext(5n, 1, ARM)]);
    const event = result.events[0];
    expect(event?.kind === "intent-executed" && event.handIndexes).toEqual([0]);
    expect(event?.kind === "intent-executed" && event.busyUntilTick).toBe(6n);
  });

  it("same (kind,id), different price = REPLACE: last-write-wins COW, version 2, first book untouched", () => {
    const first = applyIntentDoor(baseState(), ctx(1n), [ext(1n, 1, ARM)]);
    const book1 = first.state.sell as SellBook;
    const second = applyIntentDoor(first.state, ctx(2n), [
      ext(2n, 2, { ...ARM, offerPriceMicroUsd: asMoney(300_000_000n), termMonths: 6, effectiveAtBusinessMinute: 500 }),
    ]);
    const book2 = second.state.sell as SellBook;
    expect(book2.version).toBe(2);
    expect(book2.entries.size).toBe(1); // one key, ONE entry — the amendment replaced it
    expect(book2.entries.get("plan:cathedral-1u")).toEqual({
      targetKind: "plan",
      targetId: "cathedral-1u",
      offerPriceMicroUsd: asMoney(300_000_000n),
      termMonths: 6,
      shippedAtTick: 2n,
      effectiveAtBusinessMinute: 500,
    });
    expect(book1.version).toBe(1);
    expect(book1.entries.get("plan:cathedral-1u")?.offerPriceMicroUsd).toBe(250_000_000n);
    expect(book2.entries).not.toBe(book1.entries);
  });

  it("distinct keys accumulate (two offers, version 2); scope audit keeps origin slices by identity", () => {
    const before = baseState();
    const first = applyIntentDoor(before, ctx(1n), [ext(1n, 1, ARM)]);
    const second = applyIntentDoor(first.state, ctx(1n), [
      ext(1n, 2, { ...ARM, targetKind: "sku", targetId: asEntityId("cb:bandwidth") }),
    ]);
    expect(second.state.sell?.version).toBe(2);
    expect(second.state.sell?.entries.size).toBe(2);
    // THE first-colon-split edge: a namespaced id lives in ONE key —
    // "sku:cb:bandwidth" parses back kind=sku, id=cb:bandwidth (the pricing
    // law, reused by identity):
    const parsed = parsePriceOverrideKey("sku:cb:bandwidth");
    expect(parsed).not.toBeNull();
    expect(parsed?.targetKind).toBe("sku");
    expect(parsed?.targetId).toBe("cb:bandwidth");
    expect(second.state.sell?.entries.has("sku:cb:bandwidth")).toBe(true);
    // the audit — units/lanes/observed/CASH/contracts/nodes NEVER move:
    expect(second.state.nodes).toBe(before.nodes);
    expect(second.state.lanes).toBe(before.lanes);
    expect(second.state.observed).toBe(before.observed);
    expect(second.state.cash).toBe(before.cash);
    expect(second.state.contracts).toBe(before.contracts);
    expect(second.state.units).toBe(before.units);
    expect(second.state.schedule).toBe(before.schedule); // nor does it book windows
  });
});

/* ═══════════ three reused codes + three honest new phrases ═══════════ */

describe("sell-offer — refusals (bad-offer-price/bad-term-months/unknown-target are the new phrases; header discloses)", () => {
  const feed = (args: unknown, config = {}) =>
    applyIntentDoor(baseState(5), ctx(1n), [ext(1n, 1, args as PlayerVerbArgs)], config);

  it("bad-target-kind is the adjust-price phrase VERBATIM (same vocab, same words)", () => {
    expect(refused(feed({ ...ARM, targetKind: "bundle" }), 1)).toBe(
      'bad-target-kind: "bundle" not in {plan,contract-class,sku}',
    );
  });

  it("empty-target-id is the bare-code guard (reused verbatim; forged WIRE bypasses asEntityId)", () => {
    expect(refused(feed({ ...ARM, targetId: "" as EntityId }), 1)).toBe("empty-target-id");
  });

  it("bad-offer-price: the bigint wire law leaves only the sign — 0 and negatives refuse, 1 µ$ executes", () => {
    expect(refused(feed({ ...ARM, offerPriceMicroUsd: asMoney(0n) }), 1)).toBe("bad-offer-price: 0 µ$ must be > 0");
    expect(refused(feed({ ...ARM, offerPriceMicroUsd: asMoney(-5n) }), 1)).toBe("bad-offer-price: -5 µ$ must be > 0");
    expect(outcomeOf(feed({ ...ARM, offerPriceMicroUsd: asMoney(1n) }), 1)).toBe("executed");
  });

  it("bad-term-months: 0/negative/fractional/NaN refuse; 1 month executes (whole business months, >= 1)", () => {
    expect(refused(feed({ ...ARM, termMonths: 0 }), 1)).toBe("bad-term-months: 0 must be a safe integer >= 1");
    expect(refused(feed({ ...ARM, termMonths: -3 }), 1)).toBe("bad-term-months: -3 must be a safe integer >= 1");
    expect(refused(feed({ ...ARM, termMonths: 1.5 }), 1)).toBe("bad-term-months: 1.5 must be a safe integer >= 1");
    expect(refused(feed({ ...ARM, termMonths: NaN }), 1)).toBe("bad-term-months: NaN must be a safe integer >= 1");
    expect(outcomeOf(feed({ ...ARM, termMonths: 1 }), 1)).toBe("executed");
  });

  it("bad-effective-minute keeps the adjust-price/shield phrasing verbatim; 0 is legal", () => {
    expect(refused(feed({ ...ARM, effectiveAtBusinessMinute: -3 }), 1)).toBe(
      "bad-effective-minute: -3 must be a safe integer >= 0 (or null = now)",
    );
    expect(outcomeOf(feed({ ...ARM, effectiveAtBusinessMinute: 0 }), 1)).toBe("executed");
  });

  it("canSellOffer (absent = structural sanity only): null/undefined accept, a reason lands verbatim under unknown-target", () => {
    expect(outcomeOf(feed(ARM, { canSellOffer: () => null }), 1)).toBe("executed");
    expect(refused(feed(ARM, { canSellOffer: () => ({ reason: "tenant already holds cabinet 7" }) }), 1)).toBe(
      "unknown-target: tenant already holds cabinet 7",
    );
  });

  it("a HOST BUG on the seam throws (callback output stays validated — canAdjustPrice law)", () => {
    expect(() => feed(ARM, { canSellOffer: () => ({ reason: 42 }) })).toThrow(IntentDoorError);
  });

  it("the query sees the parsed args and this pass's context (decoupling-law witness)", () => {
    let seenPrice: bigint | null = null;
    let seenTick: SimTick | null = null;
    const result = applyIntentDoor(baseState(5), ctx(9n), [ext(9n, 1, ARM)], {
      canSellOffer: (query: { args: SellOfferArgs; context: TickContext }) => {
        seenPrice = query.args.offerPriceMicroUsd;
        seenTick = query.context.tick;
        return null;
      },
    });
    expect(outcomeOf(result, 1)).toBe("executed");
    expect(seenPrice).toBe(250_000_000n);
    expect(seenTick).toBe(9n);
  });

  it("a refusal after a live book leaves the book UNTOUCHED (identity) and spends no hand", () => {
    const seeded = applyIntentDoor(baseState(2), ctx(1n), [ext(1n, 1, ARM)]);
    const book = seeded.state.sell as SellBook;
    const next = applyIntentDoor(seeded.state, ctx(4n), [
      ext(4n, 2, { ...ARM, offerPriceMicroUsd: asMoney(0n) }),
    ]);
    expect(next.state.sell).toBe(book);
    expect(next.state.sell?.entries.size).toBe(1);
    const busy = (next.state.hands?.tokens ?? []).filter(
      (t) => t.busyUntilTick !== null && t.busyUntilTick > 4n,
    );
    expect(busy.length).toBe(0);
  });
});

/* ═══════════════════════════ M2 structural wall ═══════════════════════════ */

describe("sell-offer — M2 structural wall (throws, never refuses)", () => {
  const forge = (args: Record<string, unknown>) =>
    applyIntentDoor(baseState(2), ctx(1n), [ext(1n, 1, args as unknown as PlayerVerbArgs)]);

  it("every missing arg key is structural garbage — the door THROWS (all five keys pinned)", () => {
    expect(() => forge({ verb: PlayerVerb.SellOffer, targetId: "x", offerPriceMicroUsd: asMoney(1n), termMonths: 1, effectiveAtBusinessMinute: null })).toThrow(IntentDoorError);
    expect(() => forge({ verb: PlayerVerb.SellOffer, targetKind: "plan", offerPriceMicroUsd: asMoney(1n), termMonths: 1, effectiveAtBusinessMinute: null })).toThrow(IntentDoorError);
    expect(() => forge({ verb: PlayerVerb.SellOffer, targetKind: "plan", targetId: "x", termMonths: 1, effectiveAtBusinessMinute: null })).toThrow(IntentDoorError);
    expect(() => forge({ verb: PlayerVerb.SellOffer, targetKind: "plan", targetId: "x", offerPriceMicroUsd: asMoney(1n), effectiveAtBusinessMinute: null })).toThrow(IntentDoorError);
    expect(() => forge({ verb: PlayerVerb.SellOffer, targetKind: "plan", targetId: "x", offerPriceMicroUsd: asMoney(1n), termMonths: 1 })).toThrow(IntentDoorError);
  });

  it("the bigint carrier is type-strict: a JSON number, a float, or a raw decimal STRING all THROW (the proto revives before the door)", () => {
    expect(() => forge({ ...ARM, offerPriceMicroUsd: 19_800_000 })).toThrow(IntentDoorError); // number, not bigint
    expect(() => forge({ ...ARM, offerPriceMicroUsd: 9.25 })).toThrow(IntentDoorError); // float
    expect(() => forge({ ...ARM, offerPriceMicroUsd: "19800000" })).toThrow(IntentDoorError); // string IS the proto wire shape; the door demands the revived bigint
  });

  it("wrong wire TYPES throw: number kind, number id, string term, string minute, undefined-as-null", () => {
    expect(() => forge({ ...ARM, targetKind: 7 })).toThrow(IntentDoorError);
    expect(() => forge({ ...ARM, targetId: 42 })).toThrow(IntentDoorError);
    expect(() => forge({ ...ARM, termMonths: "12" })).toThrow(IntentDoorError);
    expect(() => forge({ ...ARM, effectiveAtBusinessMinute: "5" })).toThrow(IntentDoorError);
    // exactOptionalPropertyTypes: an OMITTED key already threw above; an
    // explicit `undefined` is the same garbage:
    expect(() => forge({ ...ARM, effectiveAtBusinessMinute: undefined })).toThrow(IntentDoorError);
  });

  it("the explicit null sentinel is the ONLY 'in force now' form", () => {
    expect(outcomeOf(forge({ ...ARM, effectiveAtBusinessMinute: null }), 1)).toBe("executed");
  });
});

/* ═══════════ key + vocab drift pins (readFileSync twin — import-direction law honored from the TEST side) ═══════════ */

describe("sell-offer — the priceKey grammar is ONE law across door and economy (drift pin)", () => {
  const door = readFileSync(
    fileURLToPath(new URL("../intent-door.ts", import.meta.url)),
    "utf8",
  );
  const economy = readFileSync(
    fileURLToPath(new URL("../../economy/elasticity.ts", import.meta.url)),
    "utf8",
  );

  it("the door's private PRICE_TARGET_KINDS and economy's PRICE_KEY_KINDS are the SAME closed vocabulary", () => {
    const doorRow = /const PRICE_TARGET_KINDS[^=]+=\s*Object\.freeze\(\[([^\]]*)\]\)/.exec(door);
    const econRow = /PRICE_KEY_KINDS[^\n]*=\s*[^\n]*\[([^\]]*)\]/.exec(economy);
    expect(doorRow, "door PRICE_TARGET_KINDS literal not found — the extractor is stale").not.toBeNull();
    expect(econRow, "economy PRICE_KEY_KINDS literal not found — the extractor is stale").not.toBeNull();
    const sortLits = (raw: string): string[] =>
      (raw.match(/"([^"]+)"/g) ?? []).map((s) => s.slice(1, -1)).sort();
    expect(sortLits(doorRow![1]!)).toEqual(sortLits(econRow![1]!));
  });

  it("a sell-book key parses through the pricing codec (the seam the host feeds into the priceKey book)", () => {
    const result = applyIntentDoor(baseState(), ctx(1n), [
      ext(1n, 1, { ...ARM, targetKind: "contract-class", targetId: asEntityId("smb:legacy") }),
    ]);
    const keys = [...(result.state.sell?.entries.keys() ?? [])];
    expect(keys).toEqual(["contract-class:smb:legacy"]);
    const parsed = parsePriceOverrideKey(keys[0]!);
    expect(parsed?.targetKind).toBe("contract-class");
    expect(parsed?.targetId).toBe("smb:legacy");
  });
});

/* ═══════════════════════════ digest-switch law ═══════════════════════════ */

describe("sell-offer — the digest switch", () => {
  it("absent book ⇒ digest byte-identical to the untouched state (zero movement)", () => {
    const before = baseState();
    expect(digestState(before)).toBe(digestState(baseState()));
    // and a refusal keeps the ORIGINAL digest (state identity):
    const result = applyIntentDoor(before, ctx(1n), [ext(1n, 1, { ...ARM, offerPriceMicroUsd: asMoney(0n) })]);
    expect(digestState(result.state)).toBe(digestState(before));
  });

  it("present book moves the digest; empty book counts as present (embed law)", () => {
    const before = baseState();
    const planted = applyIntentDoor(before, ctx(1n), [ext(1n, 1, ARM)]);
    expect(digestState(planted.state)).not.toBe(digestState(before));
    const emptyBook: GameState = Object.freeze({ ...before, sell: createSellBook() });
    expect(digestState(emptyBook)).not.toBe(digestState(before));
    expect(digestState(emptyBook)).not.toBe(digestState(planted.state));
  });

  it("insertion-order-independent: same entries, different Map order, SAME digest", () => {
    const forward: SellBook = sellBook(
      new Map([
        ["plan:a", seedOffer("plan", "a", 100n, 1, 1n, null)],
        ["sku:b", seedOffer("sku", "b", 200n, 2, 1n, null)],
      ]),
    );
    const reverse: SellBook = sellBook(
      new Map([
        ["sku:b", seedOffer("sku", "b", 200n, 2, 1n, null)],
        ["plan:a", seedOffer("plan", "a", 100n, 1, 1n, null)],
      ]),
    );
    const before = baseState();
    expect(digestState(Object.freeze({ ...before, sell: forward }))).toBe(
      digestState(Object.freeze({ ...before, sell: reverse })),
    );
  });

  it("every absorbed field PARTICIPATES — falsifiable twins per column (kind, id, price, term, shipped, at)", () => {
    const before = baseState();
    const base = seedOffer("plan", "a", 100n, 1, 1n, null);
    const digests = [
      base,
      seedOffer("sku", "a", 100n, 1, 1n, null), // kind moves it
      seedOffer("plan", "b", 100n, 1, 1n, null), // id moves it
      seedOffer("plan", "a", 101n, 1, 1n, null), // the offer amount moves it — money-shaped data is NO decoration
      seedOffer("plan", "a", 100n, 2, 1n, null), // term moves it
      seedOffer("plan", "a", 100n, 1, 2n, null), // shippedAtTick moves it
      seedOffer("plan", "a", 100n, 1, 1n, 500), // the stamp moves it
    ].map((offer) =>
      digestState(
        Object.freeze({
          ...before,
          sell: sellBook(new Map([[priceOverrideKey(offer.targetKind, offer.targetId), offer]])),
        }),
      ),
    );
    expect(new Set(digests).size).toBe(digests.length);
  });

  it("×100 byte-identity: the booked digest is stable across fresh builds (the sink is pure)", () => {
    const booked = Object.freeze({
      ...baseState(),
      sell: sellBook(new Map([["plan:a", seedOffer("plan", "a", 100n, 1, 1n, null)]])),
    });
    const first = digestState(booked);
    for (let run = 0; run < 100; run += 1) {
      expect(
        digestState(
          Object.freeze({
            ...baseState(),
            sell: sellBook(new Map([["plan:a", seedOffer("plan", "a", 100n, 1, 1n, null)]])),
          }),
        ),
      ).toBe(first);
    }
  });
});

/* ═══════════ LIVE witness — the no-new-fold verb: book exists, money NEVER moves ═══════════ */

/** The slots-scale board shape: congested 1-slot edge, 6/min plateau arrivals,
 *  seed 31n — money is NOT part of the pipeline lane at all (the economy
 *  money lane is a separate fold the door never reaches), so the honest
 *  falsifiable core here is: the same-seed armed-vs-unarmed engine STATE
 *  (units/nodes/lanes/cash) differs ONLY by hands + the sell slice. */
function sellTestConfig() {
  return testConfig({
    runSeed: asRunSeed(31n),
    defaultPatienceUs: 3n * MIN,
    expressPath: Object.freeze([IDS.edge, IDS.origin]),
    deepPath: Object.freeze([IDS.edge, IDS.origin]),
  });
}

function live(opts: { arm?: { tick: number } } = {}): GameState {
  const config = sellTestConfig();
  const driverOptions: TickDriverOptions = { purgeTargetedMinNodes: 0 };
  const driver = createTickDriver(
    createDefaultSlots(config),
    streamFor(config.runSeed, "root", 0),
    freshClocks(),
    driverOptions,
  );
  let state: GameState = createInitialState({
    runSeed: config.runSeed,
    engineVersion: "sell-live",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "" },
    clocks: freshClocks(),
    nodes: [
      node(IDS.edge, { slots: 1, serviceUs: MIN }), // congested: queues build
      node(IDS.origin, { slots: 4, serviceUs: MIN }),
    ],
    handCapacity: 2,
  });
  for (let t = 0; t < 20; t += 1) {
    const partial: Omit<Partial<TickInputs>, "externalIntents"> &
      Pick<TickInputs, "envelopes"> & {
        externalIntents?: readonly ExternalIntent[];
      } = {
      envelopes: Object.freeze([envelope("sell:probe", fromInt(6))]),
      dependencyEdges: Object.freeze([]),
      retryPolicy: NO_RETRY,
      classes: DEFAULT_CLASSES,
    };
    if (opts.arm?.tick === t + 1) {
      partial.externalIntents = Object.freeze([
        ext(BigInt(t + 1), 1, {
          verb: PlayerVerb.SellOffer,
          targetKind: "plan",
          targetId: asEntityId("live-plan"),
          offerPriceMicroUsd: asMoney(250_000_000n),
          termMonths: 12,
          effectiveAtBusinessMinute: null,
        }),
      ]);
    }
    state = driver.advance(state, tickInputs(partial)).state;
  }
  return state;
}

describe("sell-offer — LIVE: the booked sale changes NOTHING but the book (no-new-fold falsifiable core)", () => {
  it("the cash-untouched pin: freeCashMicroUsd identical armed-vs-unarmed, same seed", () => {
    const unarmed = live();
    const armed = live({ arm: { tick: 5 } });
    expect(armed.cash.free).toBe(unarmed.cash.free); // the door books; the money lane sleeps
    expect(armed.cash).toEqual(unarmed.cash); // every bucket, not just free
  });

  it("the book exists live while units/slots/queues stay identical (the no-fold law)", () => {
    const unarmed = live();
    const armed = live({ arm: { tick: 5 } });
    expect(armed.sell?.version).toBe(1);
    expect(armed.sell?.entries.size).toBe(1);
    // units/nodes/lanes identical: the fold that would consume the book does
    // not exist — the ONLY engine deltas are hands, the sell slice, events.
    expect(armed.units).toEqual(unarmed.units);
    expect(armed.nodes).toEqual(unarmed.nodes);
    expect(armed.lanes).toEqual(unarmed.lanes);
    expect(armed.hands).toBeDefined(); // the intent DID pay its hand
    expect(digestState(armed)).not.toBe(digestState(unarmed)); // the BOOK rides the digest (presence law)
  });

  it("the congested board really congested (witness honesty: the queue or bounces exist live, untouched by the offer)", () => {
    const unarmed = live();
    const armed = live({ arm: { tick: 5 } });
    const queueDepth = (s: GameState): number =>
      [...s.nodes.values()].reduce((n, node) => n + node.queue.length, 0);
    expect(queueDepth(armed)).toBe(queueDepth(unarmed)); // same seed, same dice, same backlog
  });

  it("a REFUSED live offer (bad-term-months) never materializes the book", () => {
    const config = sellTestConfig();
    const driver = createTickDriver(
      createDefaultSlots(config),
      streamFor(config.runSeed, "root", 0),
      freshClocks(),
      {},
    );
    const start = createInitialState({
      runSeed: config.runSeed,
      engineVersion: "sell-live",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "" },
      clocks: freshClocks(),
      nodes: [node(IDS.edge, { slots: 1, serviceUs: MIN }), node(IDS.origin, { slots: 4, serviceUs: MIN })],
      handCapacity: 2,
    });
    const result = driver.advance(start, tickInputs({
      envelopes: Object.freeze([envelope("sell:probe", fromInt(6))]),
      externalIntents: Object.freeze([ext(1n, 1, { ...ARM, termMonths: 0 })]),
    }));
    expect(result.state.sell).toBeUndefined(); // refusal never books anything
  });

  it("determinism of the live armed run across fresh closures: digest stable (Set.size 1)", () => {
    const seen = new Set<string>();
    for (let run = 0; run < 10; run += 1) {
      seen.add(digestState(live({ arm: { tick: 5 } })));
    }
    expect(seen.size).toBe(1);
  });
});
