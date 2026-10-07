/**
 * versus/deck boundary-parse tests: the reds (budget off-by-one, unknown
 * threatId, float weight, missing field, unknown field, bad affix, dup
 * threat), the defense-deck universe law, and the registry census builder
 * against the REAL packages/content registry.
 */
import { describe, expect, test } from "vitest";
import {
  AFFIX_VOCABULARY,
  VersusError,
  buildCounterMap,
  buildRegistryCensus,
  deckLegalityViolations,
  parseDefenseDeck,
  parseThreatDeck,
  type ThreatCensusEntry,
} from "../deck.ts";
import { CENSUS, COUNTERS, REGISTRY_RAW, RAW_DECK_LEAN, RAW_DECK_MAIN, parseDeck } from "./fixtures.ts";

const UNIVERSE = { census: CENSUS };

function expectVersus(error: () => unknown, code: string, pathFragment: string): VersusError {
  let thrown: unknown = null;
  try {
    error();
  } catch (caught) {
    thrown = caught;
  }
  expect(thrown, `expected VersusError ${code}`).toBeInstanceOf(VersusError);
  const versus = thrown as VersusError;
  expect(versus.code).toBe(code);
  expect(versus.path).toContain(pathFragment);
  return versus;
}

describe("parseThreatDeck — greens", () => {
  test("the main deck parses, freezes, and preserves the affix", () => {
    const deck = parseDeck(RAW_DECK_MAIN);
    expect(deck.kind).toBe("threat");
    expect(deck.entries).toHaveLength(6);
    expect(deck.entries[0]?.affix).toBe("distributed");
    expect(Object.isFrozen(deck)).toBe(true);
    expect(Object.isFrozen(deck.entries[0])).toBe(true);
  });

  test("optional affix is ABSENT (not undefined-valued) when unaffixed", () => {
    const deck = parseDeck(RAW_DECK_LEAN);
    expect("affix" in (deck.entries[0] as object)).toBe(false);
    expect(deck.entries[1]?.affix).toBeUndefined();
  });

  test("affix vocabulary holds the sixteen §2.13 mix-ins", () => {
    expect(AFFIX_VOCABULARY).toHaveLength(16);
    expect(new Set(AFFIX_VOCABULARY).size).toBe(16);
  });
});

describe("parseThreatDeck — reds", () => {
  test("budget off-by-one fails the exact-sum law", () => {
    const broken = structuredClone(RAW_DECK_MAIN) as { budgetBps: number };
    broken.budgetBps += 1;
    const error = expectVersus(() => parseThreatDeck(broken, UNIVERSE), "BUDGET_MISMATCH", "deck.budgetBps");
    expect(error.message).toContain("budget law is exact");
  });

  test("unknown threatId names the entry path", () => {
    const broken = { id: "d", budgetBps: 100, entries: [{ threatId: "not-a-real-threat", weightBps: 100 }] };
    expectVersus(() => parseThreatDeck(broken, UNIVERSE), "UNKNOWN_THREAT", "deck.entries[0].threatId");
  });

  test("float weight dies at the boundary (no fractions in deck math)", () => {
    const broken = {
      id: "d",
      budgetBps: 100,
      entries: [{ threatId: "scanner-drizzle", weightBps: 60.5 }, { threatId: "grudge-booter", weightBps: 39.5 }],
    };
    expectVersus(() => parseThreatDeck(broken, UNIVERSE), "NOT_A_SAFE_INTEGER", "weightBps");
  });

  test("missing field (budgetBps) reports MISSING_FIELD with dotted path", () => {
    const broken = { id: "d", entries: [{ threatId: "scanner-drizzle", weightBps: 100 }] };
    expectVersus(() => parseThreatDeck(broken, UNIVERSE), "MISSING_FIELD", "deck.budgetBps");
  });

  test("missing weightBps inside an entry", () => {
    const broken = { id: "d", budgetBps: 100, entries: [{ threatId: "scanner-drizzle" }] };
    expectVersus(() => parseThreatDeck(broken, UNIVERSE), "MISSING_FIELD", "deck.entries[0].weightBps");
  });

  test("unknown wire field is rejected (closed schema)", () => {
    const broken = { id: "d", budgetBps: 100, cheat: true, entries: [{ threatId: "scanner-drizzle", weightBps: 100 }] };
    expectVersus(() => parseThreatDeck(broken, UNIVERSE), "UNKNOWN_FIELD", "deck.cheat");
  });

  test("affix outside §2.13 is a BAD_ENUM", () => {
    const broken = {
      id: "d",
      budgetBps: 100,
      entries: [{ threatId: "scanner-drizzle", weightBps: 100, affix: "quantum-entanglement" }],
    };
    expectVersus(() => parseThreatDeck(broken, UNIVERSE), "BAD_ENUM", "entries[0].affix");
  });

  test("duplicate threatId per deck is rejected (weights merge instead)", () => {
    const broken = {
      id: "d",
      budgetBps: 100,
      entries: [
        { threatId: "scanner-drizzle", weightBps: 50 },
        { threatId: "scanner-drizzle", weightBps: 50 },
      ],
    };
    expectVersus(() => parseThreatDeck(broken, UNIVERSE), "DUPLICATE_THREAT", "entries[1].threatId");
  });

  test("zero-weight entry fails the ≥1 floor", () => {
    const broken = { id: "d", budgetBps: 100, entries: [{ threatId: "scanner-drizzle", weightBps: 0 }] };
    expectVersus(() => parseThreatDeck(broken, UNIVERSE), "OUT_OF_RANGE", "weightBps");
  });

  test("colon-bearing ids are refused (cause-grammar safety)", () => {
    const broken = { id: "deck:main", budgetBps: 100, entries: [{ threatId: "scanner-drizzle", weightBps: 100 }] };
    expectVersus(() => parseThreatDeck(broken, UNIVERSE), "OUT_OF_RANGE", "deck.id");
  });

  test("NaN weight dies at the integer boundary (typeof number is not enough)", () => {
    const broken = {
      id: "d",
      budgetBps: 100,
      entries: [{ threatId: "scanner-drizzle", weightBps: Number.NaN }, { threatId: "grudge-booter", weightBps: 100 }],
    };
    expectVersus(() => parseThreatDeck(broken, UNIVERSE), "NOT_A_SAFE_INTEGER", "weightBps");
  });

  test("Infinity budget dies at the integer boundary", () => {
    const broken = { id: "d", budgetBps: Number.POSITIVE_INFINITY, entries: [{ threatId: "scanner-drizzle", weightBps: 1 }] };
    expectVersus(() => parseThreatDeck(broken, UNIVERSE), "NOT_A_SAFE_INTEGER", "deck.budgetBps");
  });
});

describe("parseDefenseDeck", () => {
  const universe = { buildableUniverse: new Set(["waf", "cache", "meter"]) };

  test("a committed defense deck parses and freezes", () => {
    const deck = parseDefenseDeck(
      {
        id: "fortress-1",
        buildables: ["waf", "cache"],
        policyCardHashes: ["hh-card-aaa", "hh-card-bbb"],
        doctrineRef: "absorb-and-serve",
        handCapacity: 2,
      },
      universe,
    );
    expect(deck.kind).toBe("defense");
    expect(deck.buildables).toEqual(["waf", "cache"]);
    expect(Object.isFrozen(deck.policyCardHashes)).toBe(true);
  });

  test("buildable outside the palette universe is refused", () => {
    expectVersus(
      () => parseDefenseDeck(
        { id: "d", buildables: ["orbital-laser"], policyCardHashes: [], doctrineRef: "x", handCapacity: 1 },
        universe,
      ),
      "UNKNOWN_BUILDABLE",
      "buildables[0]",
    );
  });

  test("missing doctrine ref / hand capacity 0 are boundary reds", () => {
    expectVersus(
      () => parseDefenseDeck({ id: "d", buildables: [], policyCardHashes: [], handCapacity: 2 }, universe),
      "MISSING_FIELD",
      "defense.doctrineRef",
    );
    expectVersus(
      () => parseDefenseDeck(
        { id: "d", buildables: [], policyCardHashes: [], doctrineRef: "x", handCapacity: 0 },
        universe,
      ),
      "OUT_OF_RANGE",
      "defense.handCapacity",
    );
  });

  test("duplicate buildable is refused with the dedicated DUPLICATE_ENTRY code", () => {
    expectVersus(
      () => parseDefenseDeck(
        { id: "d", buildables: ["waf", "waf"], policyCardHashes: [], doctrineRef: "x", handCapacity: 1 },
        universe,
      ),
      "DUPLICATE_ENTRY",
      "defense.buildables[1]",
    );
  });

  test("duplicate policy-card hash is refused with the dedicated DUPLICATE_ENTRY code", () => {
    expectVersus(
      () => parseDefenseDeck(
        { id: "d", buildables: [], policyCardHashes: ["hh-card-aaa", "hh-card-aaa"], doctrineRef: "x", handCapacity: 1 },
        universe,
      ),
      "DUPLICATE_ENTRY",
      "defense.policyCardHashes[1]",
    );
  });

  test("float handCapacity dies at the integer boundary", () => {
    expectVersus(
      () => parseDefenseDeck(
        { id: "d", buildables: [], policyCardHashes: [], doctrineRef: "x", handCapacity: 1.5 },
        universe,
      ),
      "NOT_A_SAFE_INTEGER",
      "handCapacity",
    );
  });
});

describe("buildRegistryCensus / buildCounterMap vs the REAL registry", () => {
  test("all sixteen registry threats census cleanly", () => {
    expect(CENSUS.size).toBe(16);
    const mimic = CENSUS.get("layer7-mimic");
    expect(mimic?.roles).toEqual(["mimic"]);
    expect(mimic?.denomination).toBe("concurrency");
    expect(mimic?.band).toBe("hunter");
  });

  test("compound registry labels fold onto waves THREAT_ROLES", () => {
    const healer = CENSUS.get("empty-server-spiral");
    expect(healer?.roles).toContain("healer"); // 'Healer/Spawner' → healer
    const bypass = CENSUS.get("vulnerable-plugin-compromise");
    expect(bypass?.roles).toEqual(["bypass", "sapper"]); // 'Bypass/Flyer' → bypass, order kept
  });

  test("customerAsThreat flips the family (§9.4)", () => {
    expect(CENSUS.get("noisy-query-table-scan")?.family).toBe("customerAsThreat");
    expect(CENSUS.get("grudge-booter")?.family).toBe("malicious");
  });

  test("every registry threat ships at least one counter (Second Answer)", () => {
    for (const [threatId, meta] of CENSUS) {
      expect(meta, `census row for ${threatId}`).toBeTruthy();
      expect((COUNTERS.get(threatId) ?? []).length).toBeGreaterThan(0);
    }
  });

  test("census rejects junk registries fail-loud", () => {
    expectVersus(() => buildRegistryCensus({ threats: [] }), "OUT_OF_RANGE", "census.threats");
    expectVersus(
      () => buildRegistryCensus({ threats: [{ id: "x", family: "chaos", band: "weather", roles: ["Swarm"], denomination: "bandwidth" }] }),
      "BAD_ENUM",
      "family",
    );
  });
});

describe("deckLegalityViolations (role/denomination/role-cadence laws)", () => {
  test("five concurrency threats blow the per-denomination quota", () => {
    const deck = parseDeck({
      id: "conc-five",
      budgetBps: 10_000,
      entries: [
        { threatId: "wp-login-brute-squad", weightBps: 1600 },
        { threatId: "slowloris-sipper", weightBps: 1600 },
        { threatId: "layer7-mimic", weightBps: 1600 },
        { threatId: "noisy-query-table-scan", weightBps: 1600 },
        { threatId: "hoarder-noisy-neighbor", weightBps: 1600 },
        { threatId: "grudge-booter", weightBps: 1000 },
        { threatId: "mod-update-day", weightBps: 1000 },
      ],
    });
    const codes = deckLegalityViolations(deck, CENSUS).map((violation) => violation.code);
    expect(codes).toContain("DENOMINATION_QUOTA_EXCEEDED");
  });

  test("three evenly-hot roles exceed the ≤2-hot-role ceiling", () => {
    const deck = parseDeck({
      id: "flat-hot",
      budgetBps: 9_999,
      entries: [
        { threatId: "scanner-drizzle", weightBps: 3333 },
        { threatId: "wp-login-brute-squad", weightBps: 3333 },
        { threatId: "slowloris-sipper", weightBps: 3333 },
      ],
    });
    const codes = deckLegalityViolations(deck, CENSUS).map((violation) => violation.code);
    expect(codes).toContain("ROLE_QUOTA_EXCEEDED");
  });

  test("30% boundary at MAX_SAFE-adjacent budgets is priced BIGINT-exact, not float", () => {
    // Reviewer probe: budget 7_500_000_000_000_003 with three roles at
    // weight 2_250_000_000_000_001. Exact math: 100×weight =
    // 225_000_000_000_000_100 > 30×budget = 225_000_000_000_000_090 ⇒ HOT.
    // Float64 (ULP 32 near 2^57) rounds BOTH products to …096 ⇒ the old
    // number-arithmetic law read equality as "not hot" and the 3-hot-role
    // ceiling silently passed. BigInt comparison restores the exact >.
    const budget = 7_500_000_000_000_003;
    const hot = 2_250_000_000_000_001;
    const forgedCensus: ReadonlyMap<string, ThreatCensusEntry> = new Map([
      ["gauntlet-heat-a", { roles: ["swarm"], denomination: "bandwidth", band: "weather", family: "malicious" }],
      ["gauntlet-heat-b", { roles: ["tank"], denomination: "concurrency", band: "storm", family: "malicious" }],
      ["gauntlet-heat-c", { roles: ["stealth"], denomination: "hands", band: "hunter", family: "malicious" }],
      ["gauntlet-filler", { roles: ["mimic"], denomination: "cash", band: "entropy", family: "entropic" }],
    ]);
    const deck = parseThreatDeck({
      id: "bigint-edge",
      budgetBps: budget,
      entries: [
        { threatId: "gauntlet-heat-a", weightBps: hot },
        { threatId: "gauntlet-heat-b", weightBps: hot },
        { threatId: "gauntlet-heat-c", weightBps: hot },
        // filler absorbs the exact remainder: 3×hot + filler === budget
        { threatId: "gauntlet-filler", weightBps: budget - 3 * hot },
      ],
    }, { census: forgedCensus });
    const violations = deckLegalityViolations(deck, forgedCensus);
    const hotRow = violations.find((violation) => violation.code === "ROLE_QUOTA_EXCEEDED");
    expect(hotRow, "three exactly-just-over-30% roles must trip the ≤2 ceiling").toBeDefined();
    // roleWeights iterate insertion order, then sort code-unit: stealth, swarm, tank
    expect(hotRow?.detail).toContain("[stealth, swarm, tank]");
    // the filler role is NOT hot (10% share) and no other law is tripped
    expect(violations.map((violation) => violation.code)).toEqual(["ROLE_QUOTA_EXCEEDED"]);
  });

  test("two roles fail the fresh-role cadence floor", () => {
    const deck = parseDeck({
      id: "two-roles",
      budgetBps: 10_000,
      entries: [
        { threatId: "scanner-drizzle", weightBps: 6000 },
        { threatId: "wp-login-brute-squad", weightBps: 4000 },
      ],
    });
    const codes = deckLegalityViolations(deck, CENSUS).map((violation) => violation.code);
    expect(codes).toContain("MINIMUM_ROLES_UNMET");
  });

  test("the main deck is legality-clean", () => {
    const deck = parseDeck(RAW_DECK_MAIN);
    expect(deckLegalityViolations(deck, CENSUS)).toEqual([]);
  });
});
