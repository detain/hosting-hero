// g7Deck — the shelf: six authored PolicyCards against the REAL grammar.
// Every assertion is a law the panel's story depends on; the fail-loud load
// (validatePolicyCard inside card()) means this file cannot even be IMPORTED
// with a malformed card — the tests below pin the census around that wall.
import { describe, expect, it } from "vitest";
import {
  G7_CARDS,
  G7_CABLE,
  G7_CARD_BLURB,
  G7_DB,
  G7_EDGE,
  G7_ORIGIN,
  G7_WALL_CARD_ID,
  g7CardHash,
  g7LookupPolicyCard,
} from "../g7Deck.ts";

describe("g7Deck — roster and wall", () => {
  it("ships exactly six cards, ids pinned in authored order", () => {
    expect(G7_CARDS.map((c) => String(c.id))).toEqual([
      "watch-the-door",
      "page-the-founder",
      "shed-the-small",
      "escape-hatch",
      "the-underwriter",
      "ask-the-senior",
    ]);
  });

  it("bands: three execute (mapped carriers), one execute WALL, one inform, one consult", () => {
    const bands = Object.fromEntries(G7_CARDS.map((c) => [String(c.id), c.band]));
    expect(bands).toEqual({
      "watch-the-door": "execute",
      "page-the-founder": "execute",
      "shed-the-small": "execute",
      "escape-hatch": "execute",
      "the-underwriter": "inform",
      "ask-the-senior": "consult",
    });
  });

  it("the bought-verb wall card is named and carries the one unmapped action", () => {
    expect(G7_WALL_CARD_ID).toBe("escape-hatch");
    const wall = G7_CARDS.find((c) => String(c.id) === G7_WALL_CARD_ID);
    expect(wall?.then.map((a) => a.id)).toEqual(["failover"]);
    // Every OTHER execute card's action must be in the door's mapped set.
    const mapped = new Set([
      "raise-inspection-depth",
      "drain",
      "shed-class",
      "scale-out",
      "page",
      "open-ticket",
    ]);
    for (const card of G7_CARDS) {
      if (card.id === G7_WALL_CARD_ID || card.band !== "execute") continue;
      expect(mapped.has(card.then[0]?.id ?? "")).toBe(true);
    }
  });

  it("scope refs ride the world ids the runner builds (edge/origin, db only appears via play)", () => {
    const refs = new Set(G7_CARDS.map((c) => String(c.scope.ref)));
    expect([...refs].sort()).toEqual([G7_EDGE, G7_ORIGIN].sort());
    // The db and the cable are PLAYABLE surfaces, never card scopes:
    expect(refs.has(G7_DB)).toBe(false);
    expect(G7_CABLE).toBe("edge:data:node/edge->node/origin");
  });

  it("every card carries a blurb — the panel narrates the book, not the ids", () => {
    for (const c of G7_CARDS) {
      expect(G7_CARD_BLURB[String(c.id)]?.length).toBeGreaterThan(10);
    }
  });
});

describe("g7Deck — hashes ride the door's lookupPolicyCard seam", () => {
  it("hashes are deterministic across recomputation", () => {
    for (const c of G7_CARDS) {
      expect(g7CardHash(c.id)).toBe(g7CardHash(c.id));
    }
  });

  it("all six hashes are distinct", () => {
    const hashes = new Set(G7_CARDS.map((c) => g7CardHash(c.id)));
    expect(hashes.size).toBe(G7_CARDS.length);
  });

  it("lookupPolicyCard answers the exact committed hash with the parsed card", () => {
    for (const c of G7_CARDS) {
      const found = g7LookupPolicyCard(g7CardHash(c.id));
      expect(String(found?.id)).toBe(String(c.id));
    }
  });

  it("lookupPolicyCard answers junk with null — the door refuses unknown-card-hash", () => {
    expect(g7LookupPolicyCard("")).toBeNull();
    expect(g7LookupPolicyCard("0".repeat(16))).toBeNull();
    expect(g7LookupPolicyCard(g7CardHash(G7_CARDS[0]!.id).slice(0, -1))).toBeNull();
  });

  it("g7CardHash fails loud on an unknown rule id (host-side guard before the door)", () => {
    expect(() => g7CardHash("not-a-card" as never)).toThrow(/g7Deck: no card/);
  });

  it("the depth card's value encodes the rung the door's climbDepth reads (2 → inspect)", () => {
    const depth = G7_CARDS.find((c) => String(c.id) === "watch-the-door");
    expect(depth?.then[0]?.value).toBe(2n * 65536n); // FIXED_ONE × 2 = rung index "inspect"
  });
});
