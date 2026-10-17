/**
 * versus/draft tests: determinism (same seed ×100 byte-identical,
 * cross-seed divergence), the v2 exact-sum COST law holding for ANY pick
 * sequence (slots keep weights budget-shaped; the affordability-downgrade
 * law plus the compensation walk book the costs), pool-exhaustion guards,
 * and validateDraftedDeck as DATA (violations reported, never thrown).
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
  compensateExactCostSum,
  draftThreatDeck,
  validateDraftedDeck,
  type DraftCandidate,
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
        { threatId: "scanner-drizzle", weightBps: 3333, costBps: 3333 },
        { threatId: "wp-login-brute-squad", weightBps: 3333, costBps: 3333 },
        { threatId: "slowloris-sipper", weightBps: 3333, costBps: 3333 },
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

/* ═══════════════ hh-versus-deck-v2 (owner ruling 2026-10-17) ═══════════════ */

// The v1 draft golden, captured at base 70b16b4 BEFORE the v2 shape change
// (plain-only drafts over DRAFT_POOL, budget 10_000, slot 2_500). The
// cadence law says the v2 draft must reproduce threatId / weightBps /
// pickIndex EXACTLY — costs are additive fields, never new dice.
const V1_GOLDEN = {
  seed9: {
    pickIndexes: [1, 0, 2, 2],
    threatIds: ["mod-update-day", "slowloris-sipper", "grudge-booter", "wp-login-brute-squad"],
  },
  seed7: {
    pickIndexes: [2, 1, 0, 2],
    threatIds: ["mod-update-day", "wp-login-brute-squad", "grudge-booter", "scanner-drizzle"],
  },
} as const;

describe("draftThreatDeck — v2 cadence law (zero drift vs the v1 golden)", () => {
  for (const [name, golden] of Object.entries(V1_GOLDEN)) {
    const seed = name === "seed9" ? 9n : 7n;
    test(`dice run replays the v1 golden picks byte-exact (seed ${seed})`, () => {
      const dice = draftThreatDeck(draftOptions(asRunSeed(seed)));
      expect(dice.presentations.map((p) => p.pickIndex)).toEqual([...golden.pickIndexes]);
      expect(dice.presentations.map((p) => p.taken.threatId)).toEqual([...golden.threatIds]);
      expect(dice.deck.entries.map((e) => e.weightBps)).toEqual([2500, 2500, 2500, 2500]);
      // plain-only ⇒ cost ≡ weight and the walk is the identity (v1-defaulted
      // decks are byte-comparable pick sequences — the headline zero-drift proof)
      expect(dice.deck.entries.map((e) => e.costBps)).toEqual([2500, 2500, 2500, 2500]);
    });
    test(`scripted echo of the golden indices byte-reproduces the dice run (seed ${seed})`, () => {
      const scripted = draftThreatDeck(draftOptions(asRunSeed(seed), { scriptedPicks: [...golden.pickIndexes] }));
      const dice = draftThreatDeck(draftOptions(asRunSeed(seed)));
      expect(JSON.stringify(scripted)).toBe(JSON.stringify(dice));
    });
  }

  test("affix MATH never reshapes the offer — threatId sequence is affix-invariant", () => {
    const plain = draftThreatDeck(draftOptions(asRunSeed(9n)));
    for (const affixPool of [["bounded"], ["piggybacked-on-a-maintenance-window"], ["adaptive", "two-stage", "bounded"]]) {
      const spiced = draftThreatDeck(draftOptions(asRunSeed(9n), { affixPool: affixPool as never, affixChanceBps: 10_000 }));
      expect(spiced.presentations.map((p) => p.taken.threatId)).toEqual(plain.presentations.map((p) => p.taken.threatId));
      expect(spiced.presentations.map((p) => p.pickIndex)).toEqual(plain.presentations.map((p) => p.pickIndex));
    }
  });
});

describe("draftThreatDeck — v2 affordability-downgrade law", () => {
  test("an affix that NEVER fits slot+bank presents byte-identically to the plain draft", () => {
    // maintenance-window ×2.0 = 5000 over a 2500 slot; plain banks nothing,
    // so no earlier discount can ever cover it — every roll downgrades to
    // its plain twin AT PRESENTATION (same dice, weaker card).
    const plain = draftThreatDeck(draftOptions(asRunSeed(9n), { affixPool: [] }));
    const impossible = draftThreatDeck(draftOptions(asRunSeed(9n), {
      affixPool: ["piggybacked-on-a-maintenance-window"],
      affixChanceBps: 10_000,
    }));
    expect(JSON.stringify(impossible)).toBe(JSON.stringify(plain));
    for (const presentation of impossible.presentations) {
      for (const candidate of presentation.candidates) {
        expect("affix" in candidate).toBe(false);
        expect(candidate.costBps).toBe(candidate.weightBps);
      }
    }
  });

  test("banked discounts are capped by cheaper affixes — the 2.0× affix still never lands", () => {
    // bounded (0.8×) banks 500 per take; maintenance needs bank ≥ 2500 at
    // presentation time — with 4 slots at 2500, at most 3 bounded takes
    // bank before the last check (1500 < 2500). Bounded may land; the 2.0×
    // affix must be ABSENT from every offer; the walk books Σcost == budget.
    const { deck, presentations } = draftThreatDeck(draftOptions(asRunSeed(9n), {
      affixPool: ["bounded", "piggybacked-on-a-maintenance-window"],
      affixChanceBps: 10_000,
    }));
    for (const presentation of presentations) {
      for (const candidate of presentation.candidates) {
        expect(candidate.affix).not.toBe("piggybacked-on-a-maintenance-window");
        if (candidate.affix === "bounded") expect(candidate.costBps).toBe(Math.ceil(candidate.weightBps * 0.8));
      }
    }
    expect(deck.entries.map((e) => e.threatId)).toEqual([...V1_GOLDEN.seed9.threatIds]);
    expect(deck.entries.reduce((total, e) => total + e.costBps, 0)).toBe(10_000);
    const wire = { id: deck.id, budgetBps: deck.budgetBps, entries: deck.entries };
    expect(JSON.stringify(parseThreatDeck(wire, { census: CENSUS }))).toBe(JSON.stringify(deck));
  });
});

describe("draftThreatDeck — v2 exact-sum compensation walk", () => {
  test("uniform bounded draft: walk ADDS back to cost ≡ weight, deterministic ×25", () => {
    // every candidate rolls bounded: 2000×4 = 8000, delta +2000 → bulk +500
    // per entry (all caps 4000, all mobile) → 2500×4 — the committed deck
    // lands cost-for-weight identical to the plain draft.
    const runs = new Set<string>();
    for (let run = 0; run < 25; run += 1) {
      const { deck } = draftThreatDeck(draftOptions(asRunSeed(5n), {
        affixPool: ["bounded"],
        affixChanceBps: 10_000,
      }));
      expect(deck.entries.every((e) => e.affix === "bounded")).toBe(true);
      expect(deck.entries.map((e) => e.costBps)).toEqual([2500, 2500, 2500, 2500]);
      expect(deck.entries.reduce((total, e) => total + e.costBps, 0)).toBe(10_000);
      runs.add(JSON.stringify(deck));
    }
    expect(runs.size).toBe(1);
    const drafted = draftThreatDeck(draftOptions(asRunSeed(5n), { affixPool: ["bounded"], affixChanceBps: 10_000 }));
    const wire = { id: drafted.deck.id, budgetBps: drafted.deck.budgetBps, entries: drafted.deck.entries };
    expect(JSON.stringify(parseThreatDeck(wire, { census: CENSUS }))).toBe(JSON.stringify(drafted.deck));
  });

  test("SEAM (walk law, falsifiable directly): weight-desc order, ∓1-per-lap, clamps, identity", () => {
    const candidate = (threatId: string, weightBps: number, costBps: number): DraftCandidate =>
      Object.freeze({ threatId, weightBps, costBps });

    // delta == 0 → IDENTITY: the exact input array rides out unchanged.
    const exact = Object.freeze([candidate("scanner-drizzle", 60, 60), candidate("grudge-booter", 40, 40)]);
    expect(compensateExactCostSum(exact, 100)).toBe(exact);

    // asymmetric ADD (hand-computed): Σcost 800 over budget 999 → delta 199.
    // order = weight-desc, code-unit tie: a,b,c (300) then d (99). Bulk lap
    // 199/4 = 49 each → [289,289,289,129]; partial lap in walk order adds the
    // last 3 bps to a,b,c → [290,290,290,129] — the asymmetry fingerprint.
    const lopsided = [
      candidate("a", 300, 240),
      candidate("b", 300, 240),
      candidate("c", 300, 240),
      candidate("d", 99, 80),
    ];
    expect(compensateExactCostSum(lopsided, 999).map((e) => e.costBps)).toEqual([290, 290, 290, 129]);

    // SUBTRACTION leg requires forged over-budget costs (public drafts can
    // never reach it — the downgrade law keeps Σcost ≤ budget): 200−190 → 10,
    // floor max(1,⌊10/2⌋)=5 respected.
    expect(compensateExactCostSum([candidate("x", 10, 100)], 10).map((e) => e.costBps)).toEqual([10]);
    // two entries pinned at their floors, residual 1 bps unabsorbable → fail
    // loud at draft.cost with the dedicated code — never book an illegal deck.
    expect(() => compensateExactCostSum([candidate("x", 10, 100), candidate("y", 10, 100)], 9))
      .toThrowError(VersusError);
    try {
      compensateExactCostSum([candidate("x", 10, 100), candidate("y", 10, 100)], 9);
    } catch (caught) {
      const versus = caught as VersusError;
      expect(versus.code).toBe("AFFIX_COST_UNFEASIBLE");
      expect(versus.path).toContain("draft.cost");
    }
    // ADD leg pinned at caps (presented cost × 2): budget 10, single 1-bps
    // entry → cap 2 absorbs 1, residual 8 has nowhere to go.
    let caught: unknown = null;
    try {
      compensateExactCostSum([candidate("x", 1, 1)], 10);
    } catch (thrown) {
      caught = thrown;
    }
    expect((caught as VersusError).code).toBe("AFFIX_COST_UNFEASIBLE");
  });

  test("walk preserves affixes + entry ORDER (order, like the offer, is semantic)", () => {
    const { deck } = draftThreatDeck(draftOptions(asRunSeed(5n), { affixPool: ["bounded"], affixChanceBps: 10_000 }));
    const plain = draftThreatDeck(draftOptions(asRunSeed(5n)));
    expect(deck.entries.map((e) => e.threatId)).toEqual(plain.deck.entries.map((e) => e.threatId));
    expect(deck.entries.map((e) => e.weightBps)).toEqual(plain.deck.entries.map((e) => e.weightBps));
  });
});
