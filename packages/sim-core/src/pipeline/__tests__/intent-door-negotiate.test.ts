/**
 * NEGOTIATE-TERMS — the 15th door verb (ADR-0015 door-mechanics ruling,
 * tier verbs 5/5 · Negotiate), the money-lane leg of the colo card
 * "Amps and Aisles" (hosting_game.md:1632 "**Dominant verb: Negotiate.**";
 * :1637 "a ticket/conversation system with a tenant, with tone options and
 * a relationship meter. **This is the level's combat.**").
 *
 * The intent-door.test.ts "32-code refusal census" header gets the sell
 * precedent's honest amendment here: negotiate introduces exactly THREE
 * new refusal phrases — `bad-tone`, `bad-concession`, `bad-term-extension`
 * — taking the census 39 → 42 (verified by grep of the reason: strings,
 * not by guessing). The census is a comment-side enumeration, machine-
 * pinned nowhere, so nothing reddens — this header is the disclosure. The
 * other reused codes ride the census VERBATIM (`bad-target-kind`,
 * `empty-target-id`, `bad-effective-minute`, `unknown-target` — the
 * canNegotiateTerms seam's prefix, the `unknown-plan`/`unknown-target`
 * twin shared with sell-offer).
 *
 * UNLIKE SELL (the no-new-fold verb), the book HAS an engine reader:
 * economy/negotiate.ts consumes the HOST-FORWARDED term map at the renewal
 * cliff (EconomyTickIn.negotiations — tone/concession tilt the retention
 * factor before the EXISTING single draw, zero new rolls; the concession
 * discounts the billing base at the override-chain HEAD). That money leg
 * is tested in economy/__tests__/negotiate-cliff.test.ts. THIS suite pins
 * the door side: the door still never pays, never rolls, never touches
 * cash — the executed intent only BOOKS the talk.
 *
 * KEY-GRAMMAR LAW (the sell precedent @a760771, kept by identity): a
 * negotiate-book key IS an economy priceKey — `priceOverrideKey` /
 * `parsePriceOverrideKey` REUSED, zero second codec. The tone vocabulary
 * is mirrored THREE ways (door-private NEGOTIATE_TONES, economy
 * NEGOTIATION_TONES, types.ts NegotiationTone union) — the import law
 * forbids cross-module reach, so the drift pin below reads ALL THREE
 * sources from the TEST side (the elasticity.test.ts precedent).
 *
 * Pins:
 *  - the ONLY state effect is one frozen entry in the OPTIONAL
 *    `GameState.negotiate` book; cash/units/nodes/lanes NEVER move;
 *  - occupancy/hand cost: 1 hand, 2 ticks (ATTENDANCE class — a
 *    conversation costs time, the communicate sibling);
 *    RATIFIED 2026-10-17 (ADR-0016 #11), post-ratify, pinned red on drift;
 *  - M2 wire wall: all six arg keys are STRUCTURAL (missing/wrong type
 *    throws IntentDoorError); the `bigint-or-null` carrier refuses
 *    string/number garbage but takes the EXPLICIT null sentinel;
 *    0n is a booked stance, negatives REFUSE;
 *  - last-write-wins COW per composite key; distinct keys accumulate;
 *  - digest-switch law: absent ⇒ every golden byte-identical; present ⇒
 *    moves, insertion-order-independent; every absorbed field
 *    participates — INCLUDING the 0n-vs-null concession distinction;
 *  - the live door pass casts ZERO dice and moves ZERO money.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type {
  EntityId,
  ExternalIntent,
  GameState,
  NegotiateBook,
  NegotiationTerm,
  NegotiateTermsArgs,
  PlayerVerbArgs,
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
  createNegotiateBook,
  parsePriceOverrideKey,
  priceOverrideKey,
  IntentDoorError,
  DEFAULT_INTENT_HAND_COST,
  DEFAULT_INTENT_OCCUPANCY_TICKS,
} from "../intent-door";
import { DEFAULT_CLASSES, IDS, NO_RETRY, envelope, freshClocks, node, testConfig, tickInputs } from "./helpers";

/* ═══════════════════════════════ fixtures (sell template) ═══════════════════════════════ */

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
    engineVersion: "test-negotiate",
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

const ARM: NegotiateTermsArgs = {
  verb: PlayerVerb.NegotiateTerms,
  targetKind: "plan",
  targetId: asEntityId("cage-7"),
  tone: "rapport",
  concessionMicroUsd: asMoney(250_000_000n),
  termMonthsExtension: null,
  effectiveAtBusinessMinute: null,
};

function negotiateBook(entries: ReadonlyMap<string, NegotiationTerm>, version = 1): NegotiateBook {
  return Object.freeze({ version, entries: Object.freeze(new Map(entries)) });
}

function seedTerm(
  targetKind: NegotiationTerm["targetKind"],
  targetId: string,
  tone: NegotiationTerm["tone"],
  concessionMicroUsd: bigint | null,
  termMonthsExtension: number | null,
  shippedAtTick: bigint,
  effectiveAtBusinessMinute: number | null,
): NegotiationTerm {
  return Object.freeze({
    targetKind,
    targetId: asEntityId(targetId),
    tone,
    concessionMicroUsd: concessionMicroUsd === null ? null : asMoney(concessionMicroUsd),
    termMonthsExtension,
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

/* ═══════════════════════ happy path — the term book writes ═══════════════════════ */

describe("negotiate-terms — execution and the term book", () => {
  it("executes: one frozen entry under the priceKey-shaped key, canonical detail, lazy materialization", () => {
    const before = baseState();
    expect(before.negotiate).toBeUndefined();
    const result = applyIntentDoor(before, ctx(3n), [ext(3n, 1, ARM)]);
    expect(outcomeOf(result, 1)).toBe("executed");
    const book = result.state.negotiate;
    expect(book).toBeDefined();
    expect(book?.version).toBe(1);
    expect(book?.entries.size).toBe(1);
    // THE key law: a negotiate-book key IS an economy priceKey — the SAME codec:
    const key = priceOverrideKey("plan", asEntityId("cage-7"));
    expect(key).toBe("plan:cage-7");
    const entry = book?.entries.get(key);
    expect(entry).toEqual({
      targetKind: "plan",
      targetId: "cage-7",
      tone: "rapport",
      concessionMicroUsd: asMoney(250_000_000n),
      termMonthsExtension: null,
      shippedAtTick: 3n,
      effectiveAtBusinessMinute: null,
    });
    expect(Object.isFrozen(entry)).toBe(true);
    expect(Object.isFrozen(book)).toBe(true);
    const event = result.events[0];
    expect(event?.kind).toBe("intent-executed");
    expect(event?.kind === "intent-executed" && event.detail).toBe(
      "target=plan:cage-7,tone=rapport,concession=250000000,ext=none",
    );
  });

  it("a future business-minute stamp rides the entry verbatim and extends the detail (HUD never implies instant effect)", () => {
    const result = applyIntentDoor(baseState(), ctx(1n), [
      ext(1n, 1, { ...ARM, termMonthsExtension: 12, effectiveAtBusinessMinute: 43_200 }),
    ]);
    expect(result.state.negotiate?.entries.get("plan:cage-7")).toEqual({
      targetKind: "plan",
      targetId: "cage-7",
      tone: "rapport",
      concessionMicroUsd: asMoney(250_000_000n),
      termMonthsExtension: 12,
      shippedAtTick: 1n,
      effectiveAtBusinessMinute: 43_200,
    });
    expect(result.events[0]?.kind === "intent-executed" && result.events[0].detail).toBe(
      "target=plan:cage-7,tone=rapport,concession=250000000,ext=12,at=43200",
    );
  });

  it("attendance-class occupancy ladder: 1 hand, 2 ticks, busyUntil = tick + 2 (RATIFIED 2026-10-17 (ADR-0016 #11), pinned)", () => {
    expect(DEFAULT_INTENT_HAND_COST[PlayerVerb.NegotiateTerms]).toBe(1);
    expect(DEFAULT_INTENT_OCCUPANCY_TICKS[PlayerVerb.NegotiateTerms]).toBe(2);
    const result = applyIntentDoor(baseState(1), ctx(5n), [ext(5n, 1, ARM)]);
    const event = result.events[0];
    expect(event?.kind === "intent-executed" && event.handIndexes).toEqual([0]);
    expect(event?.kind === "intent-executed" && event.busyUntilTick).toBe(7n);
  });

  it("same (kind,id), different terms = REPLACE: last-write-wins COW, version 2, first book untouched", () => {
    const first = applyIntentDoor(baseState(), ctx(1n), [ext(1n, 1, ARM)]);
    const book1 = first.state.negotiate as NegotiateBook;
    const second = applyIntentDoor(first.state, ctx(2n), [
      ext(2n, 2, { ...ARM, tone: "firm", concessionMicroUsd: null, termMonthsExtension: 6, effectiveAtBusinessMinute: 500 }),
    ]);
    const book2 = second.state.negotiate as NegotiateBook;
    expect(book2.version).toBe(2);
    expect(book2.entries.size).toBe(1); // one key, ONE entry — the amendment replaced it
    expect(book2.entries.get("plan:cage-7")).toEqual({
      targetKind: "plan",
      targetId: "cage-7",
      tone: "firm",
      concessionMicroUsd: null,
      termMonthsExtension: 6,
      shippedAtTick: 2n,
      effectiveAtBusinessMinute: 500,
    });
    expect(book1.version).toBe(1);
    expect(book1.entries.get("plan:cage-7")?.tone).toBe("rapport");
    expect(book2.entries).not.toBe(book1.entries);
  });

  it("distinct keys accumulate (two terms, version 2); first-colon split exact; scope audit keeps origin slices by identity", () => {
    const before = baseState();
    const first = applyIntentDoor(before, ctx(1n), [ext(1n, 1, ARM)]);
    const second = applyIntentDoor(first.state, ctx(1n), [
      ext(1n, 2, { ...ARM, targetKind: "sku", targetId: asEntityId("cb:amps") }),
    ]);
    expect(second.state.negotiate?.version).toBe(2);
    expect(second.state.negotiate?.entries.size).toBe(2);
    // THE first-colon-split edge: a namespaced id lives in ONE key —
    // "sku:cb:amps" parses back kind=sku, id=cb:amps (the pricing law):
    const parsed = parsePriceOverrideKey("sku:cb:amps");
    expect(parsed).not.toBeNull();
    expect(parsed?.targetKind).toBe("sku");
    expect(parsed?.targetId).toBe("cb:amps");
    expect(second.state.negotiate?.entries.has("sku:cb:amps")).toBe(true);
    // the audit — units/lanes/observed/CASH/contracts/nodes NEVER move,
    // and neither do the sibling books the conversation did not hold:
    expect(second.state.nodes).toBe(before.nodes);
    expect(second.state.lanes).toBe(before.lanes);
    expect(second.state.observed).toBe(before.observed);
    expect(second.state.cash).toBe(before.cash);
    expect(second.state.contracts).toBe(before.contracts);
    expect(second.state.units).toBe(before.units);
    expect(second.state.sell).toBe(before.sell);
    expect(second.state.schedule).toBe(before.schedule);
  });
});

/* ═══════════ reused codes + three honest new phrases (census 39→42) ═══════════ */

describe("negotiate-terms — refusals (bad-tone/bad-concession/bad-term-extension are the new phrases; header discloses the 42)", () => {
  const feed = (args: unknown, config = {}) =>
    applyIntentDoor(baseState(5), ctx(1n), [ext(1n, 1, args as PlayerVerbArgs)], config);

  it("bad-target-kind is the adjust-price/sell phrase VERBATIM (same vocab, same words)", () => {
    expect(refused(feed({ ...ARM, targetKind: "bundle" }), 1)).toBe(
      'bad-target-kind: "bundle" not in {plan,contract-class,sku}',
    );
  });

  it("empty-target-id is the bare-code guard (reused verbatim; forged WIRE bypasses asEntityId)", () => {
    expect(refused(feed({ ...ARM, targetId: "" as EntityId }), 1)).toBe("empty-target-id");
  });

  it("bad-tone: the closed vocabulary is the card's escalation ladder — off-vocab refuses with the set spelled out", () => {
    expect(refused(feed({ ...ARM, tone: "plead" as NegotiateTermsArgs["tone"] }), 1)).toBe(
      'bad-tone: "plead" not in {rapport,firm,legal}',
    );
    for (const tone of ["rapport", "firm", "legal"] as const) {
      expect(outcomeOf(feed({ ...ARM, tone }), 1)).toBe("executed");
    }
  });

  it("bad-concession: negatives refuse; 0n is a booked STANCE (legal, distinct from null); 1 µ$ executes", () => {
    expect(refused(feed({ ...ARM, concessionMicroUsd: asMoney(-5n) }), 1)).toBe(
      "bad-concession: -5 µ$ must be >= 0 (or null = no money in the talk; a price RIDE rides adjust-price)",
    );
    const stance = feed({ ...ARM, concessionMicroUsd: asMoney(0n) });
    expect(outcomeOf(stance, 1)).toBe("executed");
    expect(stance.state.negotiate?.entries.get("plan:cage-7")?.concessionMicroUsd).toBe(0n);
    // null = no money in the talk — also legal, and the entry stores null:
    const talk = feed({ ...ARM, concessionMicroUsd: null });
    expect(outcomeOf(talk, 1)).toBe("executed");
    expect(talk.state.negotiate?.entries.get("plan:cage-7")?.concessionMicroUsd).toBeNull();
    expect(outcomeOf(feed({ ...ARM, concessionMicroUsd: asMoney(1n) }), 1)).toBe("executed");
  });

  it("bad-term-extension: 0/negative/fractional/NaN refuse; 1 month executes; null (no extension) executes", () => {
    expect(refused(feed({ ...ARM, termMonthsExtension: 0 }), 1)).toBe(
      "bad-term-extension: 0 must be a safe integer >= 1 (or null = no extension)",
    );
    expect(refused(feed({ ...ARM, termMonthsExtension: -3 }), 1)).toBe(
      "bad-term-extension: -3 must be a safe integer >= 1 (or null = no extension)",
    );
    expect(refused(feed({ ...ARM, termMonthsExtension: 1.5 }), 1)).toBe(
      "bad-term-extension: 1.5 must be a safe integer >= 1 (or null = no extension)",
    );
    expect(refused(feed({ ...ARM, termMonthsExtension: NaN }), 1)).toBe(
      "bad-term-extension: NaN must be a safe integer >= 1 (or null = no extension)",
    );
    expect(outcomeOf(feed({ ...ARM, termMonthsExtension: 1 }), 1)).toBe("executed");
    expect(outcomeOf(feed({ ...ARM, termMonthsExtension: null }), 1)).toBe("executed");
  });

  it("bad-effective-minute keeps the adjust-price/shield phrasing verbatim; 0 is legal", () => {
    expect(refused(feed({ ...ARM, effectiveAtBusinessMinute: -3 }), 1)).toBe(
      "bad-effective-minute: -3 must be a safe integer >= 0 (or null = now)",
    );
    expect(outcomeOf(feed({ ...ARM, effectiveAtBusinessMinute: 0 }), 1)).toBe("executed");
  });

  it("canNegotiateTerms (absent = structural sanity only): null/undefined accept, a reason lands verbatim under unknown-target; a host bug THROWS", () => {
    expect(outcomeOf(feed(ARM, { canNegotiateTerms: () => null }), 1)).toBe("executed");
    expect(feed(ARM, { canNegotiateTerms: () => undefined }).receipts.find((r) => r.seq === 1)?.outcome).toBe(
      "executed",
    );
    expect(
      refused(feed(ARM, { canNegotiateTerms: () => ({ reason: "tenant is month-30 dark" }) }), 1),
    ).toBe("unknown-target: tenant is month-30 dark");
    expect(() => feed(ARM, { canNegotiateTerms: () => ({ reason: 42 }) })).toThrow(IntentDoorError);
  });

  it("the query sees the parsed args (incl the bigint concession) and this pass's context (decoupling-law witness)", () => {
    let seenConcession: bigint | null = null;
    let seenTick: SimTick | null = null;
    const result = applyIntentDoor(baseState(5), ctx(9n), [ext(9n, 1, ARM)], {
      canNegotiateTerms: (query: { args: NegotiateTermsArgs; context: TickContext }) => {
        seenConcession = query.args.concessionMicroUsd;
        seenTick = query.context.tick;
        return null;
      },
    });
    expect(outcomeOf(result, 1)).toBe("executed");
    expect(seenConcession).toBe(250_000_000n);
    expect(seenTick).toBe(9n);
  });

  it("a refusal after a live book leaves the book UNTOUCHED (identity) and spends no hand", () => {
    const seeded = applyIntentDoor(baseState(2), ctx(1n), [ext(1n, 1, ARM)]);
    const book = seeded.state.negotiate as NegotiateBook;
    const next = applyIntentDoor(seeded.state, ctx(4n), [
      ext(4n, 2, { ...ARM, tone: "shout" as NegotiateTermsArgs["tone"] }),
    ]);
    expect(next.state.negotiate).toBe(book);
    expect(next.state.negotiate?.entries.size).toBe(1);
    const busy = (next.state.hands?.tokens ?? []).filter(
      (t) => t.busyUntilTick !== null && t.busyUntilTick > 4n,
    );
    expect(busy.length).toBe(0);
  });
});

/* ═══════════════════════════ M2 structural wall ═══════════════════════════ */

describe("negotiate-terms — M2 structural wall (throws, never refuses)", () => {
  const forge = (args: Record<string, unknown>) =>
    applyIntentDoor(baseState(2), ctx(1n), [ext(1n, 1, args as unknown as PlayerVerbArgs)]);

  it("every missing arg key is structural garbage — the door THROWS (all six keys pinned)", () => {
    expect(() => forge({ verb: PlayerVerb.NegotiateTerms, targetId: "x", tone: "firm", concessionMicroUsd: asMoney(1n), termMonthsExtension: null, effectiveAtBusinessMinute: null })).toThrow(IntentDoorError);
    expect(() => forge({ verb: PlayerVerb.NegotiateTerms, targetKind: "plan", tone: "firm", concessionMicroUsd: asMoney(1n), termMonthsExtension: null, effectiveAtBusinessMinute: null })).toThrow(IntentDoorError);
    expect(() => forge({ verb: PlayerVerb.NegotiateTerms, targetKind: "plan", targetId: "x", concessionMicroUsd: asMoney(1n), termMonthsExtension: null, effectiveAtBusinessMinute: null })).toThrow(IntentDoorError);
    expect(() => forge({ verb: PlayerVerb.NegotiateTerms, targetKind: "plan", targetId: "x", tone: "firm", termMonthsExtension: null, effectiveAtBusinessMinute: null })).toThrow(IntentDoorError);
    expect(() => forge({ verb: PlayerVerb.NegotiateTerms, targetKind: "plan", targetId: "x", tone: "firm", concessionMicroUsd: asMoney(1n), effectiveAtBusinessMinute: null })).toThrow(IntentDoorError);
    expect(() => forge({ verb: PlayerVerb.NegotiateTerms, targetKind: "plan", targetId: "x", tone: "firm", concessionMicroUsd: asMoney(1n), termMonthsExtension: null })).toThrow(IntentDoorError);
  });

  it("the bigint-or-null carrier is type-strict: number, float, or raw decimal STRING THROW; explicit null PASSES (the proto revives before the door)", () => {
    expect(() => forge({ ...ARM, concessionMicroUsd: 19_800_000 })).toThrow(IntentDoorError); // number, not bigint
    expect(() => forge({ ...ARM, concessionMicroUsd: 9.25 })).toThrow(IntentDoorError); // float
    expect(() => forge({ ...ARM, concessionMicroUsd: "19800000" })).toThrow(IntentDoorError); // string IS the proto wire shape; the door demands the revived bigint
    expect(outcomeOf(forge({ ...ARM, concessionMicroUsd: null }), 1)).toBe("executed"); // the sentinel is wire-able
  });

  it("wrong wire TYPES throw: number kind, number id, number tone, string extension, string minute, undefined-as-null", () => {
    expect(() => forge({ ...ARM, targetKind: 7 })).toThrow(IntentDoorError);
    expect(() => forge({ ...ARM, targetId: 42 })).toThrow(IntentDoorError);
    expect(() => forge({ ...ARM, tone: 3 })).toThrow(IntentDoorError);
    expect(() => forge({ ...ARM, termMonthsExtension: "12" })).toThrow(IntentDoorError);
    expect(() => forge({ ...ARM, effectiveAtBusinessMinute: "5" })).toThrow(IntentDoorError);
    // exactOptionalPropertyTypes: an OMITTED key already threw above; an
    // explicit `undefined` is the same garbage:
    expect(() => forge({ ...ARM, effectiveAtBusinessMinute: undefined })).toThrow(IntentDoorError);
    // null is NOT legal for the two non-nullable scalars either:
    expect(() => forge({ ...ARM, targetKind: null })).toThrow(IntentDoorError);
    expect(() => forge({ ...ARM, tone: null })).toThrow(IntentDoorError);
  });
});

/* ═══ tone vocab + key grammar drift pins (readFileSync twin — import law honored from the TEST side) ═══ */

describe("negotiate-terms — one vocabulary across door, economy, and the wire contract (drift pins)", () => {
  const door = readFileSync(
    fileURLToPath(new URL("../intent-door.ts", import.meta.url)),
    "utf8",
  );
  const economy = readFileSync(
    fileURLToPath(new URL("../../economy/negotiate.ts", import.meta.url)),
    "utf8",
  );
  const types = readFileSync(
    fileURLToPath(new URL("../../types.ts", import.meta.url)),
    "utf8",
  );

  it("the door's private NEGOTIATE_TONES, economy's NEGOTIATION_TONES, and types.ts NegotiationTone are the SAME closed vocabulary", () => {
    const doorRow = /const NEGOTIATE_TONES[^\n]*=\s*Object\.freeze\(\[([^\]]*)\]\)/.exec(door);
    const econRow = /const NEGOTIATION_TONES[\s\S]{0,120}?=\s*Object\.freeze\(\[([^\]]*)\]\)/.exec(economy);
    const typeRow = /export type NegotiationTone = ([^;]+);/.exec(types);
    expect(doorRow, "door NEGOTIATE_TONES literal not found — the extractor is stale").not.toBeNull();
    expect(econRow, "economy NEGOTIATION_TONES literal not found — the extractor is stale").not.toBeNull();
    expect(typeRow, "types.ts NegotiationTone union not found — the extractor is stale").not.toBeNull();
    const lits = (raw: string): string[] =>
      (raw.match(/"([^"]+)"/g) ?? []).map((s) => s.slice(1, -1));
    // Declaration order IS the escalation ladder (rapport → firm → legal):
    expect(lits(doorRow![1]!)).toEqual(["rapport", "firm", "legal"]);
    expect(lits(econRow![1]!)).toEqual(["rapport", "firm", "legal"]);
    expect(lits(typeRow![1]!)).toEqual(["rapport", "firm", "legal"]);
  });

  it("a negotiate-book key parses through the pricing codec (the seam the host feeds into the cliff fold)", () => {
    const result = applyIntentDoor(baseState(), ctx(1n), [
      ext(1n, 1, { ...ARM, targetKind: "contract-class", targetId: asEntityId("smb:legacy") }),
    ]);
    const keys = [...(result.state.negotiate?.entries.keys() ?? [])];
    expect(keys).toEqual(["contract-class:smb:legacy"]);
    const parsed = parsePriceOverrideKey(keys[0]!);
    expect(parsed?.targetKind).toBe("contract-class");
    expect(parsed?.targetId).toBe("smb:legacy");
  });
});

/* ═══════════════════════════ digest-switch law ═══════════════════════════ */

describe("negotiate-terms — the digest switch", () => {
  it("absent book ⇒ digest byte-identical to the untouched state (zero movement)", () => {
    const before = baseState();
    expect(digestState(before)).toBe(digestState(baseState()));
    // and a refusal keeps the ORIGINAL digest (state identity):
    const result = applyIntentDoor(before, ctx(1n), [ext(1n, 1, { ...ARM, tone: "plead" as NegotiateTermsArgs["tone"] })]);
    expect(digestState(result.state)).toBe(digestState(before));
  });

  it("present book moves the digest; empty book counts as present (embed law)", () => {
    const before = baseState();
    const planted = applyIntentDoor(before, ctx(1n), [ext(1n, 1, ARM)]);
    expect(digestState(planted.state)).not.toBe(digestState(before));
    const emptyBook: GameState = Object.freeze({ ...before, negotiate: createNegotiateBook() });
    expect(digestState(emptyBook)).not.toBe(digestState(before));
    expect(digestState(emptyBook)).not.toBe(digestState(planted.state));
  });

  it("insertion-order-independent: same entries, different Map order, SAME digest", () => {
    const forward: NegotiateBook = negotiateBook(
      new Map([
        ["plan:a", seedTerm("plan", "a", "rapport", 100n, null, 1n, null)],
        ["sku:b", seedTerm("sku", "b", "firm", 200n, 1, 1n, null)],
      ]),
    );
    const reverse: NegotiateBook = negotiateBook(
      new Map([
        ["sku:b", seedTerm("sku", "b", "firm", 200n, 1, 1n, null)],
        ["plan:a", seedTerm("plan", "a", "rapport", 100n, null, 1n, null)],
      ]),
    );
    const before = baseState();
    expect(digestState(Object.freeze({ ...before, negotiate: forward }))).toBe(
      digestState(Object.freeze({ ...before, negotiate: reverse })),
    );
  });

  it("every absorbed field PARTICIPATES — falsifiable twins per column (kind, id, tone, concession, extension, shipped, at), incl the 0n-vs-null stance distinction", () => {
    const before = baseState();
    const digests = [
      seedTerm("plan", "a", "rapport", 100n, null, 1n, null),
      seedTerm("sku", "a", "rapport", 100n, null, 1n, null), // kind moves it
      seedTerm("plan", "b", "rapport", 100n, null, 1n, null), // id moves it
      seedTerm("plan", "a", "firm", 100n, null, 1n, null), // tone moves it — the combat choice
      seedTerm("plan", "a", "rapport", 101n, null, 1n, null), // the concession amount moves it — money is NO decoration
      seedTerm("plan", "a", "rapport", null, null, 1n, null), // 0n-vs-NULL: the stance distinction
      seedTerm("plan", "a", "rapport", 100n, 1, 1n, null), // the extension moves it
      seedTerm("plan", "a", "rapport", 100n, null, 2n, null), // shippedAtTick moves it
      seedTerm("plan", "a", "rapport", 100n, null, 1n, 500), // the as-of stamp moves it
    ].map((term) =>
      digestState(
        Object.freeze({
          ...before,
          negotiate: negotiateBook(new Map([[priceOverrideKey(term.targetKind, term.targetId), term]])),
        }),
      ),
    );
    expect(new Set(digests).size).toBe(digests.length);
  });

  it("×100 byte-identity: the booked digest is stable across fresh builds (the sink is pure)", () => {
    const booked = Object.freeze({
      ...baseState(),
      negotiate: negotiateBook(new Map([["plan:a", seedTerm("plan", "a", "rapport", 100n, null, 1n, null)]])),
    });
    const first = digestState(booked);
    for (let run = 0; run < 100; run += 1) {
      expect(
        digestState(
          Object.freeze({
            ...baseState(),
            negotiate: negotiateBook(new Map([["plan:a", seedTerm("plan", "a", "rapport", 100n, null, 1n, null)]])),
          }),
        ),
      ).toBe(first);
    }
  });
});

/* ═══════════ LIVE witness — the door books; the money lane folds elsewhere ═══════════ */

/** The slots-scale board shape (sell precedent): congested 1-slot edge,
 *  6/min plateau arrivals, seed 31n. Money is NOT part of the pipeline
 *  lane at all — the negotiation's engine reader lives in the ECONOMY
 *  fold's forwarded leg (negotiate-cliff.test.ts witnesses it) — so the
 *  honest falsifiable core here is: the same-seed armed-vs-unarmed
 *  engine STATE (units/nodes/lanes/cash) differs ONLY by hands + the
 *  negotiate slice. */
function negotiateTestConfig() {
  return testConfig({
    runSeed: asRunSeed(31n),
    defaultPatienceUs: 3n * MIN,
    expressPath: Object.freeze([IDS.edge, IDS.origin]),
    deepPath: Object.freeze([IDS.edge, IDS.origin]),
  });
}

function live(opts: { arm?: { tick: number } } = {}): GameState {
  const config = negotiateTestConfig();
  const driverOptions: TickDriverOptions = { purgeTargetedMinNodes: 0 };
  const driver = createTickDriver(
    createDefaultSlots(config),
    streamFor(config.runSeed, "root", 0),
    freshClocks(),
    driverOptions,
  );
  let state: GameState = createInitialState({
    runSeed: config.runSeed,
    engineVersion: "negotiate-live",
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
      envelopes: Object.freeze([envelope("negotiate:probe", fromInt(6))]),
      dependencyEdges: Object.freeze([]),
      retryPolicy: NO_RETRY,
      classes: DEFAULT_CLASSES,
    };
    if (opts.arm?.tick === t + 1) {
      partial.externalIntents = Object.freeze([
        ext(BigInt(t + 1), 1, {
          verb: PlayerVerb.NegotiateTerms,
          targetKind: "plan",
          targetId: asEntityId("live-plan"),
          tone: "rapport",
          concessionMicroUsd: asMoney(250_000_000n),
          termMonthsExtension: null,
          effectiveAtBusinessMinute: null,
        }),
      ]);
    }
    state = driver.advance(state, tickInputs(partial)).state;
  }
  return state;
}

describe("negotiate-terms — LIVE: the booked talk changes NOTHING but the book (pipeline-side)", () => {
  it("the cash-untouched pin: freeCashMicroUsd identical armed-vs-unarmed, same seed", () => {
    const unarmed = live();
    const armed = live({ arm: { tick: 5 } });
    expect(armed.cash.free).toBe(unarmed.cash.free); // the door books; the money lane sleeps
    expect(armed.cash).toEqual(unarmed.cash); // every bucket, not just free
  });

  it("the book exists live while units/slots/queues stay identical (the pipeline-never-reads law)", () => {
    const unarmed = live();
    const armed = live({ arm: { tick: 5 } });
    expect(armed.negotiate?.version).toBe(1);
    expect(armed.negotiate?.entries.size).toBe(1);
    // units/nodes/lanes identical: NO pipeline step reads the book — only
    // the economy fold does, and only what the HOST forwarded it. The ONLY
    // engine deltas here are hands, the negotiate slice, and the event log.
    expect(armed.units).toEqual(unarmed.units);
    expect(armed.nodes).toEqual(unarmed.nodes);
    expect(armed.lanes).toEqual(unarmed.lanes);
    expect(armed.hands).toBeDefined(); // the intent DID pay its hand
    expect(digestState(armed)).not.toBe(digestState(unarmed)); // the BOOK rides the digest (presence law)
  });

  it("the congested board really congested (witness honesty: the queue exists live, untouched by the talk)", () => {
    const unarmed = live();
    const armed = live({ arm: { tick: 5 } });
    const queueDepth = (s: GameState): number =>
      [...s.nodes.values()].reduce((n, node) => n + node.queue.length, 0);
    expect(queueDepth(armed)).toBe(queueDepth(unarmed)); // same seed, same dice, same backlog
  });

  it("a REFUSED live negotiation (bad-tone) never materializes the book", () => {
    const config = negotiateTestConfig();
    const driver = createTickDriver(
      createDefaultSlots(config),
      streamFor(config.runSeed, "root", 0),
      freshClocks(),
      {},
    );
    const start = createInitialState({
      runSeed: config.runSeed,
      engineVersion: "negotiate-live",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "" },
      clocks: freshClocks(),
      nodes: [node(IDS.edge, { slots: 1, serviceUs: MIN }), node(IDS.origin, { slots: 4, serviceUs: MIN })],
      handCapacity: 2,
    });
    const result = driver.advance(start, tickInputs({
      envelopes: Object.freeze([envelope("negotiate:probe", fromInt(6))]),
      externalIntents: Object.freeze([ext(1n, 1, { ...ARM, tone: "shout" as NegotiateTermsArgs["tone"] })]),
    }));
    expect(result.state.negotiate).toBeUndefined(); // refusal never books anything
  });

  it("determinism of the live armed run across fresh closures: digest stable (Set.size 1)", () => {
    const seen = new Set<string>();
    for (let run = 0; run < 10; run += 1) {
      seen.add(digestState(live({ arm: { tick: 5 } })));
    }
    expect(seen.size).toBe(1);
  });
});
