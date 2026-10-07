/**
 * versus/draft tests: determinism (same seed ×100 byte-identical,
 * cross-seed divergence), the budget-sum law holding for ANY pick
 * sequence, pool-exhaustion guards, and validateDraftedDeck as DATA
 * (violations reported, never thrown).
 */
import { describe, expect, test } from "vitest";
import type { RunSeed } from "../../types.ts";
import { asRunSeed } from "../../types.ts";
import {
  VersusError,
  parseThreatDeck,
} from "../deck.ts";
import {
  DRAFT_VIOLATION_CODES,
  draftThreatDeck,
  validateDraftedDeck,
  type DraftOptions,
} from "../draft.ts";
import { commitDeck } from "../commit.ts";
import { CENSUS, COUNTERS, RAW_DECK_MAIN, parseDeck } from "./fixtures.ts";

const DRAFT_POOL: readonly string[] = Object.freeze([
  "scanner-drizzle",
  "wp-login-brute-squad",
  "slowloris-sipper",
  "xmlrpc-pingback-amplifier",
  "grudge-booter",
  "mod-update-day",
]);

function draftOptions(seed: RunSeed, overrides: Partial<DraftOptions> = {}): DraftOptions {
  return {
    seed,
    deckId: "draft-under-test",
    budgetBps: 10_000,
    pool: DRAFT_POOL,
    slotWeightBps: 2500,
    ...overrides,
  };
}

describe("draftThreatDeck — determinism", () => {
  test("same seed ×100 → byte-identical presentations, deck, and commit hash", () => {
    const baseline = commitDeck(draftThreatDeck(draftOptions(asRunSeed(7n))).deck);
    const baselineJson = JSON.stringify(draftThreatDeck(draftOptions(asRunSeed(7n))).presentations);
    const seen = new Set<string>();
    for (let run = 0; run < 100; run += 1) {
      const outcome = draftThreatDeck(draftOptions(asRunSeed(7n)));
      seen.add(`${commitDeck(outcome.deck).deckHash}|${JSON.stringify(outcome.presentations)}`);
    }
    expect(seen.size).toBe(1);
    expect([...seen][0]).toBe(`${baseline.deckHash}|${baselineJson}`);
  });

  test("different seeds diverge (picks or affixes differ)", () => {
    const a = JSON.stringify(draftThreatDeck(draftOptions(asRunSeed(7n))).deck);
    const b = JSON.stringify(draftThreatDeck(draftOptions(asRunSeed(8n))).deck);
    expect(a).not.toBe(b);
  });

  test("the same seed affix-less vs affix-enabled diverges only in affixes", () => {
    const plain = draftThreatDeck(draftOptions(asRunSeed(11n), { affixPool: [] }));
    const spiced = draftThreatDeck(draftOptions(asRunSeed(11n), { affixPool: ["distributed", "encrypted"] }));
    expect(plain.deck.entries.map((e) => e.threatId)).toEqual(spiced.deck.entries.map((e) => e.threatId));
    for (const entry of plain.deck.entries) {
      expect("affix" in entry).toBe(false);
    }
  });
});

describe("draftThreatDeck — legality is never the dice's business", () => {
  test("budget sums exactly for every seed tried (equal slots + remainder)", () => {
    for (let value = 1n; value <= 25n; value += 1n) {
      const { deck } = draftThreatDeck(draftOptions(asRunSeed(value), { slotWeightBps: 3000 }));
      const sum = deck.entries.reduce((total, entry) => total + entry.weightBps, 0);
      expect(sum).toBe(10_000);
      // and it survives the strict parser untouched (wire view minus kind)
      const wire = { id: deck.id, budgetBps: deck.budgetBps, entries: deck.entries };
      expect(JSON.stringify(parseThreatDeck(wire, { census: CENSUS }))).toBe(JSON.stringify(deck));
    }
  });

  test("pickIndex always lands inside the presented offer", () => {
    for (let value = 1n; value <= 15n; value += 1n) {
      const { presentations } = draftThreatDeck(draftOptions(asRunSeed(value)));
      for (const presentation of presentations) {
        expect(presentation.pickIndex).toBeGreaterThanOrEqual(0);
        expect(presentation.pickIndex).toBeLessThan(presentation.candidates.length);
        expect(presentation.taken).toBe(presentation.candidates[presentation.pickIndex]);
      }
    }
  });

  test("offered threats are distinct within a presentation and never reused across picks", () => {
    const { deck, presentations } = draftThreatDeck(draftOptions(asRunSeed(3n), { slotWeightBps: 2000 }));
    const ids = deck.entries.map((entry) => entry.threatId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const presentation of presentations) {
      const offered = presentation.candidates.map((candidate) => candidate.threatId);
      expect(new Set(offered).size).toBe(offered.length);
    }
  });

  test("pool too small for the budget fails loud (DECK_ILLEGAL, not a shrug)", () => {
    expect(
      () => draftThreatDeck(draftOptions(asRunSeed(1n), { slotWeightBps: 1000 })),
    ).toThrowError(VersusError);
    try {
      draftThreatDeck(draftOptions(asRunSeed(1n), { slotWeightBps: 1000 }));
    } catch (caught) {
      expect((caught as VersusError).code).toBe("DECK_ILLEGAL");
    }
  });

  test("affix pool outside §2.13 is refused at the boundary", () => {
    expect(
      () => draftThreatDeck(draftOptions(asRunSeed(1n), { affixPool: ["ghost-protocol"] as never })),
    ).toThrowError(/AFFIX_VOCABULARY/);
  });

  test("float budget is refused (integer law)", () => {
    expect(
      () => draftThreatDeck(draftOptions(asRunSeed(1n), { budgetBps: 9999.5 })),
    ).toThrowError(/safe integer/);
  });
});

describe("draftThreatDeck — census gate (unknown pool ids die at draft time)", () => {
  test("a ghost pool id is refused with UNKNOWN_THREAT when census is supplied", () => {
    let caught: unknown = null;
    try {
      draftThreatDeck(draftOptions(asRunSeed(1n), {
        pool: [...DRAFT_POOL, "ghost-threat"],
        census: CENSUS,
      }));
    } catch (thrown) {
      caught = thrown;
    }
    expect(caught).toBeInstanceOf(VersusError);
    expect((caught as VersusError).code).toBe("UNKNOWN_THREAT");
    expect((caught as VersusError).path).toContain("draft.pool");
  });

  test("the full real pool passes the same gate", () => {
    const { deck } = draftThreatDeck(draftOptions(asRunSeed(2n), { pool: DRAFT_POOL, census: CENSUS }));
    expect(deck.entries).toHaveLength(4);
  });
});

describe("draftThreatDeck — scriptedPicks (script the CHOICE, never the dice)", () => {
  test("scripting the dice's own picks byte-reproduces the RNG draft (choice-preserving)", () => {
    const dice = draftThreatDeck(draftOptions(asRunSeed(9n)));
    const echoed = draftThreatDeck(draftOptions(asRunSeed(9n), {
      scriptedPicks: dice.presentations.map((p) => p.pickIndex),
    }));
    expect(JSON.stringify(echoed)).toBe(JSON.stringify(dice));
  });

  test("diverging picks consume no extra stream positions — first offers byte-match", () => {
    const dice = draftThreatDeck(draftOptions(asRunSeed(9n)));
    const scripted = draftThreatDeck(draftOptions(asRunSeed(9n), { scriptedPicks: [2, 0, 1, 0] }));
    // Presentation 0 draws from the identical bag on the identical stream:
    expect(JSON.stringify(scripted.presentations[0]?.candidates))
      .toBe(JSON.stringify(dice.presentations[0]?.candidates));
    // Later offers MAY diverge — legitimately, because different threats
    // left the pool. What never diverges is the dice cadence itself.
    expect(scripted.presentations.map((p) => p.pickIndex)).toEqual([2, 0, 1, 0]);
    for (const [index, presentation] of scripted.presentations.entries()) {
      expect(presentation.taken).toBe(presentation.candidates[presentation.pickIndex]);
      expect(scripted.deck.entries[index]?.threatId).toBe(presentation.taken.threatId);
    }
    // every scripted deck stays budget-clean (legality is never the choice's business)
    expect(scripted.deck.entries.reduce((total, e) => total + e.weightBps, 0)).toBe(10_000);
  });

  test("pick count mismatch is refused before any dice roll", () => {
    expect(
      () => draftThreatDeck(draftOptions(asRunSeed(1n), { scriptedPicks: [0, 0] })),
    ).toThrowError(/cannot serve 4 presentations/);
  });

  test("non-integer scripted index is NOT_A_SAFE_INTEGER", () => {
    let caught: unknown = null;
    try {
      draftThreatDeck(draftOptions(asRunSeed(1n), { scriptedPicks: [0, 1, 2.5, 0] }));
    } catch (thrown) {
      caught = thrown;
    }
    expect((caught as VersusError).code).toBe("NOT_A_SAFE_INTEGER");
    expect((caught as VersusError).path).toContain("draft.scriptedPicks[2]");
  });

  test("out-of-offer scripted index is OUT_OF_RANGE naming the presentation", () => {
    let caught: unknown = null;
    try {
      draftThreatDeck(draftOptions(asRunSeed(1n), { scriptedPicks: [0, 5, 0, 0] }));
    } catch (thrown) {
      caught = thrown;
    }
    expect((caught as VersusError).code).toBe("OUT_OF_RANGE");
    expect((caught as VersusError).path).toContain("draft.scriptedPicks[1]");
  });
});

describe("validateDraftedDeck", () => {
  test("a drafted deck over the real registry validates clean", () => {
    // 6-pick draft: four 2500 slots would need pool ≥ picks; use 2500×4.
    const { deck } = draftThreatDeck(draftOptions(asRunSeed(21n)));
    const violations = validateDraftedDeck(deck, { census: CENSUS, counters: COUNTERS });
    expect(violations).toEqual([]);
  });

  test("missing counter map entry reports COUNTER_ABSENT (R-15 analog)", () => {
    const deck = parseDeck(RAW_DECK_MAIN);
    const trimmed = new Map(COUNTERS);
    trimmed.delete("slowloris-sipper");
    const violations = validateDraftedDeck(deck, { census: CENSUS, counters: trimmed });
    expect(violations.map((violation) => violation.code)).toEqual(["COUNTER_ABSENT"]);
    expect(violations[0]?.threatId).toBe("slowloris-sipper");
  });

  test("legality failures flow through as rows, never throws", () => {
    const flat = parseDeck({
      id: "flat-draft",
      budgetBps: 9_999,
      entries: [
        { threatId: "scanner-drizzle", weightBps: 3333 },
        { threatId: "wp-login-brute-squad", weightBps: 3333 },
        { threatId: "slowloris-sipper", weightBps: 3333 },
      ],
    });
    const codes = validateDraftedDeck(flat, { census: CENSUS, counters: COUNTERS }).map((v) => v.code);
    expect(codes).toContain("ROLE_QUOTA_EXCEEDED");
  });

  test("the violation code census is exactly the documented set", () => {
    expect([...DRAFT_VIOLATION_CODES].sort()).toEqual([
      "COUNTER_ABSENT",
      "DENOMINATION_QUOTA_EXCEEDED",
      "MINIMUM_ROLES_UNMET",
      "POOL_CAP_EXCEEDED",
      "ROLE_QUOTA_EXCEEDED",
      "UNKNOWN_THREAT",
    ]);
  });
});
