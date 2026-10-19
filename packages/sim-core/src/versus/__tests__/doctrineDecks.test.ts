/**
 * VERSUS DOCTRINE VIA DECKS (owner ruling 2026-10-19 — "Versus doctrine via
 * decks — yes; kills the three-local-hash-laws drift risk permanently").
 *
 * This file is the LIVE WITNESS that `deckCardHash` (loader/decks.ts
 * @2cdf014, domain `hh-deck-card-hash-v1`) is the ONE hash law binding
 * shipped content-deck cards into a versus `DefenseDeck`: parse the shipped
 * watch-the-door deck → carry its six deckCardHash keys as the doctrine →
 * commit (hh-versus-deck-v2 envelope; the v2 tag is the 2026-10-17
 * affix-cost ruling, not a wave-29 change) → boot the SAME deck with
 * `bootRulesFromDeck` and resolve every doctrine hash through the booted
 * index → execute a `policy-card-commit` at the door with that lookup.
 *
 * Scope honesty (the drift cure, not a feature):
 *  • NO digest goldens belong here. The `cd1296c54df0e9c6` fingerprint
 *    golden is owned by match.test.ts and stays untouched — this wave moves
 *    ZERO goldens, and the byte-stand is proven by the gates, not re-pinned.
 *  • The deckCardHash hash LITERALS for watch-the-door are loader-side
 *    authority (shipDecks.test.ts goldens); the no-embedded-hash content
 *    walk is loader-side too. Nothing here re-pins either — hashes are
 *    DERIVED dynamically; this file owns the VERSUS-ALTITUDE consequences.
 *  • Cross-module import law: this test imports ../../loader/decks and
 *    ../../pipeline at sim-core altitude. Versus tests already reach
 *    pipeline/replay/waves/internal (precedent: match-memo.test.ts,
 *    draft.test.ts → ../match deckToWaveTable); no source file takes a new
 *    edge — loader/ never imports versus and versus/ never imports loader in
 *    src. The pin is test-only, so the module graph is unmoved.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import type {
  ExternalIntent,
  GameState,
  PolicyCard,
  PlayerVerbArgs,
  SimTick,
  TickContext,
} from "../../types.ts";
import { asRunSeed, PlayerVerb } from "../../types.ts";
import { initialClocks, MICROS_PER_MIN } from "../../kernel/time.ts";
import { createInitialState } from "../../pipeline/driver.ts";
import { applyIntentDoor, createBoardState, type IntentDoorConfig, type IntentReceipt } from "../../pipeline/intent-door.ts";
import { bootRulesFromDeck, deckCardHash, parsePolicyDeck, type LoadedPolicyDeck } from "../../loader/decks.ts";
import { VersusError, parseDefenseDeck, type DefenseDeck, type DefenseDeckParseOptions } from "../deck.ts";
import { commitDeck, revealAndVerify, VERSUS_HASH_DOMAIN } from "../commit.ts";
import { draftThreatDeck, type DraftOptions } from "../draft.ts";
import { cardContentFingerprint, defaultPolicyCardIndex } from "../match.ts";

/* ═══════════════════════════ the shipped doctrine ═══════════════════════════ */

type Wire = Record<string, unknown>;

function readDeckWire(): Wire {
  // process.cwd() = packages/sim-core under vitest — same fixture pattern as
  // ./fixtures.ts (join(process.cwd(), "..", "content", ...)).
  return JSON.parse(readFileSync(join(process.cwd(), "..", "content", "decks", "watch-the-door.json"), "utf8")) as Wire;
}

const DECK_WIRE = readDeckWire();
const DECK: LoadedPolicyDeck = parsePolicyDeck(DECK_WIRE);
const CARDS: readonly PolicyCard[] = DECK.cards;

/** The doctrine set: one deckCardHash key per shipped card, authoring order. */
const DOCTRINE_HASHES: readonly string[] = CARDS.map((card) => deckCardHash(card));

const UNIVERSE = new Set(["waf", "cache", "failover-router"]);
const PARSE_OPTIONS: DefenseDeckParseOptions = { buildableUniverse: UNIVERSE };

function defenseDoc(policyCardHashes: readonly string[]): Wire {
  return {
    id: "doctrine-watch-the-door",
    buildables: ["waf", "cache", "failover-router"],
    policyCardHashes: [...policyCardHashes],
    doctrineRef: "deck:watch-the-door",
    handCapacity: 2,
  };
}

const DOCTRINE_DECK: DefenseDeck = parseDefenseDeck(defenseDoc(DOCTRINE_HASHES), PARSE_OPTIONS);
const DOCTRINE_COMMIT = commitDeck(DOCTRINE_DECK);

/** The booted book: exactly what a runner posts into `boot.rules`. */
const BOOTED_RULES = bootRulesFromDeck(DECK);
const HOST_INDEX = new Map<string, PolicyCard>(BOOTED_RULES.entries.map((entry) => [entry.hash, entry.card]));

/* ═══════════════════════════ door fixtures (intent-door.test.ts pattern) ═════ */

function ctx(tick: SimTick): TickContext {
  return Object.freeze({ tick, minute: Number(tick), clocks: initialClocks() });
}

function ext(tick: SimTick, seq: number, args: PlayerVerbArgs): ExternalIntent {
  return Object.freeze({
    tick,
    intent: Object.freeze({
      seq,
      clock: "sim" as const,
      atUs: tick * MICROS_PER_MIN,
      origin: "player" as const,
      payload: Object.freeze({ kind: "player-verb" as const, args }),
    }),
  });
}

function baseState(): GameState {
  return createInitialState({
    runSeed: asRunSeed(7n),
    engineVersion: "doctrine-decks",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
    clocks: initialClocks(),
    handCapacity: 2,
    board: createBoardState(),
  });
}

function receiptOf(result: { readonly receipts: readonly IntentReceipt[] }, seq: number): IntentReceipt {
  const found = result.receipts.find((receipt) => receipt.seq === seq);
  if (found === undefined) throw new Error(`no receipt for seq ${seq}`);
  return found;
}

function expectVersus(action: () => unknown, code: string, pathPart: string): void {
  try {
    action();
  } catch (thrown) {
    expect(thrown).toBeInstanceOf(VersusError);
    expect((thrown as VersusError).code).toBe(code);
    expect((thrown as VersusError).path).toContain(pathPart);
    return;
  }
  throw new Error(`expected VersusError ${code} at ${pathPart} — nothing threw`);
}

/* ═══════════════════════════ the binding seam ═══════════════════════════ */

describe("doctrine decks — shipped deck → DefenseDeck → commit", () => {
  test("the shipped watch-the-door deck parses to six trusted cards in authoring order", () => {
    expect(DECK.deckId).toBe("deck:watch-the-door");
    expect(CARDS).toHaveLength(6);
    expect(CARDS[0]?.id).toBe("watch-the-door:watch-the-door");
    expect(CARDS[5]?.id).toBe("watch-the-door:ask-the-senior");
    for (const card of CARDS) {
      expect(card.id.startsWith("watch-the-door:")).toBe(true);
    }
  });

  test("the six deckCardHash keys are distinct 16-hex strings and ride parseDefenseDeck untouched", () => {
    for (const hash of DOCTRINE_HASHES) {
      expect(/^[0-9a-f]{16}$/.test(hash)).toBe(true);
    }
    expect(new Set(DOCTRINE_HASHES).size).toBe(6);
    expect(DOCTRINE_DECK.policyCardHashes).toEqual([...DOCTRINE_HASHES]);
    expect(Object.isFrozen(DOCTRINE_DECK.policyCardHashes)).toBe(true);
  });

  test("the doctrine deck commits under the versus envelope and reveals byte-clean", () => {
    expect(DOCTRINE_COMMIT.kind).toBe("defense");
    expect(DOCTRINE_COMMIT.deckHash.startsWith(`${VERSUS_HASH_DOMAIN}:`)).toBe(true);
    const verdict = revealAndVerify(DOCTRINE_COMMIT, DOCTRINE_DECK);
    expect(verdict.ok).toBe(true);
    expect(verdict.deckHash).toBe(DOCTRINE_COMMIT.deckHash);
  });
});

/* ═══════════════════════ the booted book IS the doctrine ═══════════════════ */

describe("doctrine decks — bootRulesFromDeck ⇄ policyCardHashes", () => {
  test("the booted entries carry EXACTLY the doctrine hash set", () => {
    expect(BOOTED_RULES.entries).toHaveLength(6);
    expect(BOOTED_RULES.entries.map((entry) => entry.hash).sort()).toEqual([...DOCTRINE_HASHES].sort());
  });

  test("every doctrine hash resolves to its card and every card resolves under its hash — identity, both directions", () => {
    for (const [index, entry] of BOOTED_RULES.entries.entries()) {
      // bootRulesFromDeck hands the card through BY REFERENCE (no re-mint):
      expect(entry.card).toBe(CARDS[index]);
      expect(HOST_INDEX.get(entry.hash)).toBe(entry.card);
    }
    for (const card of CARDS) {
      expect(HOST_INDEX.get(deckCardHash(card))).toBe(card);
    }
  });
});

/* ═══════════════════════════ the door seam ═══════════════════════════ */

describe("doctrine decks — the door arms from the booted book", () => {
  test("policy-card-commit executes a doctrine hash into the ruleBook via the deck-bound lookup", () => {
    const config: IntentDoorConfig = { lookupPolicyCard: (h) => HOST_INDEX.get(h) ?? null };
    const firstHash = DOCTRINE_HASHES[0] as string;
    const args: PlayerVerbArgs = { verb: PlayerVerb.PolicyCardCommit, cardHash: firstHash };
    const state = baseState();
    const result = applyIntentDoor(state, ctx(1n), [ext(1n, 1, args)], config);
    expect(receiptOf(result, 1).outcome).toBe("executed");
    expect(result.state.ruleBook.length).toBe(1);
    expect(result.state.ruleBook[0]?.id).toBe(CARDS[0]?.id);
    // The door stores an immutable COPY (`Object.freeze({...card})`,
    // intent-door.ts handlePolicyCardCommit) — deep-equal content is the law
    // at this altitude; BY-REFERENCE identity belongs to bootRulesFromDeck's
    // entries alone (pinned above).
    expect(result.state.ruleBook[0]).toStrictEqual(CARDS[0]);
  });

  test("the key spaces are DISJOINT — an hh-card-v1 fingerprint misses the deck-bound book and a deck hash misses the fingerprint index", () => {
    const firstCard = CARDS[0] as PolicyCard;
    const fingerprint = cardContentFingerprint(firstCard);
    expect(fingerprint.startsWith("hh-card-v1:")).toBe(true);
    const deckHash = DOCTRINE_HASHES[0] as string;

    // The legacy default index answers the fingerprint, never the deck hash:
    const legacyIndex = defaultPolicyCardIndex(CARDS);
    expect(legacyIndex.get(fingerprint)).toBe(firstCard);
    expect(legacyIndex.get(deckHash)).toBeUndefined();

    // The deck-bound book refuses the fingerprint at the door, verbatim census string:
    const config: IntentDoorConfig = { lookupPolicyCard: (h) => HOST_INDEX.get(h) ?? null };
    const args: PlayerVerbArgs = { verb: PlayerVerb.PolicyCardCommit, cardHash: fingerprint };
    const result = applyIntentDoor(baseState(), ctx(1n), [ext(1n, 1, args)], config);
    const receipt = receiptOf(result, 1);
    expect(receipt.outcome).toBe("refused");
    expect(receipt.reason).toBe(`unknown-card-hash: "${fingerprint}"`);
  });
});

/* ═══════════════════ wire-identity consequence (the minted pin) ═══════════════ */

describe("doctrine decks — wire identity binds the same either side of revival", () => {
  test("a DefenseDeck built from UN-REVIVED wire cards commits BYTE-IDENTICAL to the revived form", () => {
    // The wire form (bigints as decimal strings) is cast, not revived —
    // deckCardHash folds decimal TEXT, so parse timing cannot move a key
    // (loader-side law from decks.test.ts; the versus consequence is minted
    // here: a host may compute doctrine hashes straight off the wire file).
    const wireCards = (DECK_WIRE["cards"] as Wire[]) as unknown as readonly PolicyCard[];
    expect(wireCards).toHaveLength(6);
    const wireHashes = wireCards.map((card) => deckCardHash(card));
    expect(wireHashes).toEqual([...DOCTRINE_HASHES]);
    const wireCommit = commitDeck(parseDefenseDeck(defenseDoc(wireHashes), PARSE_OPTIONS));
    expect(wireCommit.canonicalJson).toBe(DOCTRINE_COMMIT.canonicalJson);
    expect(wireCommit.deckHash).toBe(DOCTRINE_COMMIT.deckHash);
  });
});

/* ═══════════════════════ no smuggling at the boundary ═══════════════════════ */

describe("doctrine decks — hashes ride, cards never do", () => {
  test("a defense doc embedding cards is refused UNKNOWN_FIELD — the versus-boundary mirror of the loader no-hash walk", () => {
    // shipDecks.test.ts owns the content-side structural walk; this is the
    // other half: the versus parser refuses a doc that smuggles card bytes.
    expectVersus(
      () => parseDefenseDeck({ ...defenseDoc(DOCTRINE_HASHES), cards: [...CARDS] }, PARSE_OPTIONS),
      "UNKNOWN_FIELD",
      "defense.cards",
    );
    expectVersus(
      () => parseDefenseDeck({ ...defenseDoc(DOCTRINE_HASHES), policyCards: [...CARDS] }, PARSE_OPTIONS),
      "UNKNOWN_FIELD",
      "defense.policyCards",
    );
  });

  test("the doctrine commitment carries the hash set and the ref — none of the card bytes", () => {
    for (const hash of DOCTRINE_HASHES) {
      expect(DOCTRINE_COMMIT.canonicalJson.includes(hash)).toBe(true);
    }
    expect(DOCTRINE_COMMIT.canonicalJson.includes("deck:watch-the-door")).toBe(true);
    for (const smuggled of ["upkeepMicroUsd", "runbookName", "threshold", "escalation"]) {
      expect(DOCTRINE_COMMIT.canonicalJson.includes(smuggled)).toBe(false);
    }
  });
});

/* ═══════════════════════ the drift cure, made permanent ═══════════════════════ */

describe("doctrine decks — the law is named in the source", () => {
  test("versus/deck.ts names deckCardHash as the doctrine binding law (falsifiable source-read pin)", () => {
    const source = readFileSync(join(process.cwd(), "src", "versus", "deck.ts"), "utf8");
    expect(source).toContain("DOCTRINE BINDING LAW");
    expect(source).toContain("deckCardHash");
    expect(source).toContain("hh-deck-card-hash-v1");
    expect(source).toContain("2026-10-19");
    // Delete the law from the docblock and this file goes red — the whole
    // point: the three-local-hash-laws drift risk stays dead by pin, not memory.
  });
});

/* ═══════════════════════ scripted draft twin ═══════════════════════ */

const DRAFT_POOL: readonly string[] = Object.freeze([
  "scanner-drizzle",
  "wp-login-brute-squad",
  "slowloris-sipper",
  "xmlrpc-pingback-amplifier",
  "grudge-booter",
  "mod-update-day",
]);

function draftOptions(overrides: Partial<DraftOptions> = {}): DraftOptions {
  return {
    seed: asRunSeed(9n),
    deckId: "doctrine-sparring-partner",
    budgetBps: 10_000,
    pool: DRAFT_POOL,
    slotWeightBps: 2500,
    ...overrides,
  };
}

function exchangeJson(scriptedPicks: readonly number[]): string {
  const { deck } = draftThreatDeck(draftOptions({ scriptedPicks }));
  return JSON.stringify({ threat: commitDeck(deck), defense: DOCTRINE_COMMIT });
}

describe("doctrine decks — scripted draft stays byte-reproducible", () => {
  test("the threat-draft ⇄ doctrine-defense exchange commits byte-identically across reruns", () => {
    expect(exchangeJson([2, 0, 1, 0])).toBe(exchangeJson([2, 0, 1, 0]));
  });

  test("scripting the dice's own picks byte-reproduces the dice exchange (choice-preserving across the doctrine leg)", () => {
    const dice = draftThreatDeck(draftOptions());
    const diceExchange = JSON.stringify({ threat: commitDeck(dice.deck), defense: DOCTRINE_COMMIT });
    const echoed = exchangeJson(dice.presentations.map((presentation) => presentation.pickIndex));
    expect(echoed).toBe(diceExchange);
  });
});
