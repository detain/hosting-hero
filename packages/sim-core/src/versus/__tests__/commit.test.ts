/**
 * versus/commit tests: blind-commit envelope round-trip, key-order
 * invariance of the canonical fold, and the tamper red — a revealed doc
 * differing in ONE number must fail loud, naming the diverging path.
 */
import { describe, expect, test } from "vitest";
import {
  VERSUS_HASH_DOMAIN,
  commitDeck,
  deckCanonicalJson,
  revealAndVerify,
} from "../commit.ts";
import { VersusError, parseDefenseDeck, parseThreatDeck, type ThreatDeck } from "../deck.ts";
import { CENSUS, RAW_DECK_LEAN, RAW_DECK_MAIN, parseDeck } from "./fixtures.ts";

describe("commitDeck / revealAndVerify — round trip", () => {
  test("commit → reveal verifies and echoes the binding hash", () => {
    const deck = parseDeck(RAW_DECK_MAIN);
    const envelope = commitDeck(deck);
    expect(envelope.kind).toBe("threat");
    expect(envelope.deckHash.startsWith(`${VERSUS_HASH_DOMAIN}:`)).toBe(true);
    expect(envelope.deckHash).toMatch(/^hh-versus-deck-v1:[0-9a-f]{16}$/);
    const verdict = revealAndVerify(envelope, deck);
    expect(verdict.ok).toBe(true);
    expect(verdict.deckHash).toBe(envelope.deckHash);
  });

  test("defense decks commit in the same envelope family", () => {
    const deck = parseDefenseDeck(
      {
        id: "fortress",
        buildables: ["waf"],
        policyCardHashes: ["hh-card-1"],
        doctrineRef: "absorb-and-serve",
        handCapacity: 2,
      },
      { buildableUniverse: new Set(["waf", "cache"]) },
    );
    const envelope = commitDeck(deck);
    expect(envelope.kind).toBe("defense");
    expect(revealAndVerify(envelope, deck).ok).toBe(true);
  });

  test("the canonical fold ignores object key insertion order", () => {
    const a = parseDeck(RAW_DECK_LEAN);
    const b: ThreatDeck = Object.freeze({
      entries: a.entries.map((entry) => Object.freeze({ weightBps: entry.weightBps, threatId: entry.threatId })),
      budgetBps: a.budgetBps,
      id: a.id,
      kind: "threat" as const,
    });
    expect(commitDeck(b).deckHash).toBe(commitDeck(a).deckHash);
  });

  test("canonicalJson is deterministic across repeated folds", () => {
    const deck = parseDeck(RAW_DECK_MAIN);
    const first = deckCanonicalJson(deck);
    for (let run = 0; run < 25; run += 1) {
      expect(deckCanonicalJson(structuredClone(deck) as ThreatDeck)).toBe(first);
    }
  });
});

describe("commit / reveal — tamper reds", () => {
  test("one flipped number in the revealed doc fails loud and NAMES the path", () => {
    const deck = parseDeck(RAW_DECK_MAIN);
    const envelope = commitDeck(deck);
    const tampered = structuredClone(deck) as unknown as { entries: { weightBps: number }[] };
    (tampered.entries[0] as { weightBps: number }).weightBps += 1;
    let caught: unknown = null;
    try {
      revealAndVerify(envelope, tampered as unknown as ThreatDeck);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(VersusError);
    const versus = caught as VersusError;
    expect(versus.code).toBe("COMMIT_MISMATCH");
    expect(versus.message).toContain("entries[0].weightBps");
  });

  test("dropping one entry reports the array length divergence", () => {
    const deck = parseDeck(RAW_DECK_MAIN);
    const envelope = commitDeck(deck);
    const short = { ...structuredClone(deck), entries: deck.entries.slice(0, 5) };
    expect(() => revealAndVerify(envelope, short)).toThrowError(/entries\.length/);
  });

  test("revealing a defense deck against a threat commitment fails on kind", () => {
    const deck = parseDeck(RAW_DECK_MAIN);
    const envelope = commitDeck(deck);
    const other = parseDefenseDeck(
      { id: "fortress", buildables: [], policyCardHashes: [], doctrineRef: "x", handCapacity: 1 },
      { buildableUniverse: new Set<string>() },
    );
    expect(() => revealAndVerify(envelope, other)).toThrowError(/defense.*threat|threat.*defense/);
  });

  test("a corrupted envelope (hash re-stuck onto fresh bytes) still fails", () => {
    const deck = parseDeck(RAW_DECK_MAIN);
    const honest = commitDeck(deck);
    const other = parseDeck({
      id: "other-deck",
      budgetBps: 10_000,
      entries: [{ threatId: "grudge-booter", weightBps: 4000 }, { threatId: "udp-amplification-barrage", weightBps: 3000 }, { threatId: "scanner-drizzle", weightBps: 2000 }, { threatId: "layer7-mimic", weightBps: 1000 }],
    });
    const swapped = Object.freeze({ ...honest, deckHash: commitDeck(other).deckHash });
    expect(() => revealAndVerify(swapped, deck)).toThrowError(/corrupt envelope|differs/);
  });
});

describe("deckCanonicalJson boundary", () => {
  test("non-canonical values (functions, NaN) are refused fail-loud", () => {
    expect(() => deckCanonicalJson({ id: "x", junk: Number.NaN })).toThrowError(VersusError);
    expect(() => deckCanonicalJson(() => 1)).toThrowError(/unsupported-value/);
  });

  test("key-order-only wire differences hash equal (entry ORDER is semantic)", () => {
    const first = parseThreatDeck(
      { id: "same", budgetBps: 100, entries: [{ threatId: "scanner-drizzle", weightBps: 60 }, { threatId: "grudge-booter", weightBps: 40 }] },
      { census: CENSUS },
    );
    const second = parseThreatDeck(
      { entries: [{ weightBps: 60, threatId: "scanner-drizzle" }, { weightBps: 40, threatId: "grudge-booter" }], budgetBps: 100, id: "same" },
      { census: CENSUS },
    );
    expect(commitDeck(second).deckHash).toBe(commitDeck(first).deckHash);
  });
});
