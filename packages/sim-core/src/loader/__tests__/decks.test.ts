/**
 * G7 content-decks loader leg — the strict deck parse, the deckCardHash v1
 * law, and the trusted boot.rules book. Fixtures are in-test JSON (the
 * loader never touches the filesystem); the trusted-shape twin is built
 * exactly like the mainline runner deck (apps/proto
 * `simCoreRunner.rules.test.ts` posture: frozen records, asRuleId/asMoney
 * branding, raw Q16.16 Fixed bigints).
 */

import { describe, expect, it } from "vitest";
import type { PolicyCard, Predicate, PolicyAction } from "../../types.ts";
import { asMetricId, asMoney, asRuleId } from "../../types.ts";
import { LoaderError } from "../boundary.ts";

// the loader test program declares no DOM lib (house types:[] posture);
// Node 22+ provides structuredClone at runtime — ambient here only.
declare const structuredClone: <T>(value: T) => T;
import {
  bootRulesFromDeck,
  DECK_CARD_HASH_DOMAIN,
  deckCardHash,
  parsePolicyDeck,
  type LoadedPolicyDeck,
} from "../decks.ts";

/* ═══════════════════════ fixtures ═══════════════════════ */

type Wire = Record<string, unknown>;
type WireList = Wire[];

/** A fully-valid deck: card A carries EVERY optional arm (for/unless/else)
 *  and all three threshold kinds; card B is the minimal estate shape. Card
 *  wire = PolicyCardWire: decimal-string bigints, required runbookName /
 *  value keys (null-allowed). */
function goldenDeck(): Wire {
  return {
    schemaVersion: 1,
    deckId: "deck:g7-mainline-storm",
    appliesTo: "official:shared-web",
    note: "the ratified storm book",
    cards: [
      {
        id: "watch-the-door",
        scope: { kind: "object", ref: "edge" },
        when: [
          { metric: "utilizationRho", comparator: ">", threshold: { kind: "value", amount: "16384", unit: "count" } },
          { metric: "queueClass.gold", comparator: "changed", threshold: { kind: "class-ref", classId: "gold" } },
          { metric: "deploy.caughtFail", comparator: "fails", threshold: { kind: "event-name", name: "deploy-7" } },
        ],
        for: { durationUs: "1800000000" },
        then: [
          { id: "raise-inspection-depth", runbookName: null, value: "131072" },
          { id: "run-runbook", runbookName: "restart-drain-loop", value: null },
        ],
        unless: [
          { metric: "lane.errorRate", comparator: "<", threshold: { kind: "value", amount: "0", unit: "ratio" } },
        ],
        else: { to: "band", ref: "consult" },
        band: "execute",
        upkeepMicroUsd: "12500",
      },
      {
        id: "quiet-night",
        scope: { kind: "estate", ref: null },
        when: [{ metric: "queue.depth", comparator: ">", threshold: { kind: "value", amount: "65536", unit: "count" } }],
        then: [{ id: "page", runbookName: null, value: null }],
        band: "inform",
        upkeepMicroUsd: "0",
      },
    ],
    _todo: "provenance rows ride the content schema leg",
  };
}

/* wire accessors — every mutator below talks JSON shape through these */
const cardsOf = (deck: Wire): WireList => deck["cards"] as WireList;
const whenOf = (card: Wire): WireList => card["when"] as WireList;
const thenOf = (card: Wire): WireList => card["then"] as WireList;
const unlessOf = (card: Wire): WireList => card["unless"] as WireList;
const scopeOf = (card: Wire): Wire => card["scope"] as Wire;
const elseOf = (card: Wire): Wire => card["else"] as Wire;
const forOf = (card: Wire): Wire => card["for"] as Wire;
const thresholdOf = (predicate: Wire): Wire => predicate["threshold"] as Wire;

function cardWire(index: number, mutate?: (card: Wire) => void): Wire {
  const card = structuredClone(cardsOf(goldenDeck())[index]!) as Wire;
  mutate?.(card);
  return card;
}

function deckWith(cards: readonly Wire[]): Wire {
  return { ...goldenDeck(), cards: [...cards] };
}

function parseError(raw: unknown): LoaderError {
  try {
    parsePolicyDeck(raw);
  } catch (error) {
    return error as LoaderError;
  }
  throw new Error("expected parsePolicyDeck to throw — it did not");
}

/** Trusted twin of golden card A — the EXACT shape the boot-rules revival
 *  and the door fold consume (rules.test.ts posture, raw Fixed bigints). */
function trustedCardA(): PolicyCard {
  return Object.freeze({
    id: asRuleId("watch-the-door"),
    scope: Object.freeze({ kind: "object", ref: "edge" }),
    when: Object.freeze([
      Object.freeze({
        metric: asMetricId("utilizationRho"),
        comparator: ">",
        threshold: Object.freeze({ kind: "value", amount: 16_384n, unit: "count" }),
      }),
      Object.freeze({
        metric: asMetricId("queueClass.gold"),
        comparator: "changed",
        threshold: Object.freeze({ kind: "class-ref", classId: "gold" }),
      }),
      Object.freeze({
        metric: asMetricId("deploy.caughtFail"),
        comparator: "fails",
        threshold: Object.freeze({ kind: "event-name", name: "deploy-7" }),
      }),
    ]),
    for: Object.freeze({ durationUs: 1_800_000_000n }),
    then: Object.freeze([
      Object.freeze({ id: "raise-inspection-depth", runbookName: null, value: 131_072n }),
      Object.freeze({ id: "run-runbook", runbookName: "restart-drain-loop", value: null }),
    ]),
    unless: Object.freeze([
      Object.freeze({
        metric: asMetricId("lane.errorRate"),
        comparator: "<",
        threshold: Object.freeze({ kind: "value", amount: 0n, unit: "ratio" }),
      }),
    ]),
    else: Object.freeze({ to: "band", ref: "consult" }),
    band: "execute",
    upkeepMicroUsd: asMoney(12_500n),
  }) as PolicyCard;
}

function goldenParsed(): LoadedPolicyDeck {
  return parsePolicyDeck(goldenDeck());
}

function trustedMinimal(): PolicyCard {
  return parsePolicyDeck(deckWith([cardWire(1)])).cards[0] as PolicyCard;
}

/* ═══════════════════════ golden parse ═══════════════════════ */

describe("parsePolicyDeck — golden parse", () => {
  it("parses the fully-valid deck and pins the header census", () => {
    const deck = goldenParsed();
    expect(deck.schemaVersion).toBe(1);
    expect(deck.deckId).toBe("deck:g7-mainline-storm");
    expect(deck.appliesTo).toBe("official:shared-web");
    expect(deck.note).toBe("the ratified storm book");
    expect(deck.todo).toBe("provenance rows ride the content schema leg");
    expect(deck.cards).toHaveLength(2);
    expect(deck.cards[0]?.id).toBe(asRuleId("watch-the-door"));
    expect(deck.cards[1]?.id).toBe(asRuleId("quiet-night"));
  });

  it("the parsed card deep-equals the hand-built TRUSTED shape (boot-rules twin)", () => {
    expect(goldenParsed().cards[0]).toEqual(trustedCardA());
  });

  it("bigints are revived branded and typed — === against BigInt literals", () => {
    const card = goldenParsed().cards[0] as PolicyCard;
    const trigger = card.when[0]?.threshold;
    const guard = card.unless?.[0]?.threshold;
    expect(typeof card.upkeepMicroUsd).toBe("bigint");
    expect((card.upkeepMicroUsd as bigint) === 12_500n).toBe(true);
    expect(trigger !== undefined && trigger.kind === "value" && (trigger.amount as bigint) === 16_384n).toBe(true);
    expect((card.for?.durationUs as bigint) === 1_800_000_000n).toBe(true);
    expect((card.then[0]?.value as bigint) === 131_072n).toBe(true);
    expect(guard !== undefined && guard.kind === "value" && (guard.amount as bigint) === 0n).toBe(true);
  });

  it("omit-when-unset: the minimal card carries NO for/unless/else keys at all", () => {
    const card = (goldenParsed().cards[1] ?? {}) as unknown as Record<string, unknown>;
    expect(Object.prototype.hasOwnProperty.call(card, "for")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(card, "unless")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(card, "else")).toBe(false);
  });

  it("deep-freeze census: every record and array in the deck is frozen", () => {
    const walk = (value: unknown): void => {
      if (typeof value === "object" && value !== null) {
        expect(Object.isFrozen(value)).toBe(true);
        for (const inner of Object.values(value as Record<string, unknown>)) walk(inner);
      }
    };
    walk(goldenParsed());
  });

  it("mutation attempts throw (ESM strict mode) — parsed state is immutable", () => {
    const deck = goldenParsed();
    const card = deck.cards[0] as PolicyCard;
    expect(() => {
      (deck as { cards: unknown }).cards = [];
    }).toThrow(TypeError);
    expect(() => {
      (card as { band: string }).band = "inform";
    }).toThrow(TypeError);
    expect(() => {
      (card.scope as { ref: string | null }).ref = "waf";
    }).toThrow(TypeError);
  });

  it("optional header fields absent → null (deckId/appliesTo/note/_todo all optional)", () => {
    const bare = parsePolicyDeck({ schemaVersion: 1, cards: [cardWire(1)] });
    expect(bare.deckId).toBeNull();
    expect(bare.appliesTo).toBeNull();
    expect(bare.note).toBeNull();
    expect(bare.todo).toBeNull();
  });
});

/* ═══════════════════════ vocabulary walls (BAD_ENUM) ═══════════════════════ */

describe("parsePolicyDeck — closed vocabularies", () => {
  const cases: readonly (readonly [string, (card: Wire) => void, RegExp])[] = [
    ["comparator", (c) => void (whenOf(c)[0]!["comparator"] = "≥"), /not a comparator/],
    ["metric unit", (c) => void (thresholdOf(whenOf(c)[0]!)["unit"] = "hours"), /not a metric unit/],
    ["action id", (c) => void (thenOf(c)[0]!["id"] = "reboot"), /not a policy action/],
    ["band", (c) => void (c["band"] = "delegate"), /not a delegation band/],
    ["scope kind", (c) => void (scopeOf(c)["kind"] = "pod"), /not a scope kind/],
    ["threshold kind", (c) => void (thresholdOf(whenOf(c)[0]!)["kind"] = "ref"), /not a threshold kind/],
    ["escalation target", (c) => void (elseOf(c)["to"] = "email"), /not a escalation target/],
  ];
  for (const [name, mutate, message] of cases) {
    it(`rejects an off-vocabulary ${name} with BAD_ENUM`, () => {
      const error = parseError(deckWith([cardWire(0, mutate)]));
      expect(error).toBeInstanceOf(LoaderError);
      expect(error.code).toBe("BAD_ENUM");
      expect(error.message).toMatch(message);
    });
  }

  it("names the offending dotted path for a deep vocabulary failure", () => {
    const error = parseError(deckWith([cardWire(0, (c) => void (thenOf(c)[1]!["id"] = "sleep"))]));
    expect(error.code).toBe("BAD_ENUM");
    expect(error.path).toBe("cards[0].then[1].id");
  });

  it("the BAD_ENUM verdict names the closed vocabulary it refused against", () => {
    const error = parseError(deckWith([cardWire(0, (c) => void (c["band"] = "delegate"))]));
    expect(error.message).toContain("[inform, consult, execute]");
  });
});

/* ═══════════════════════ shape walls ═══════════════════════ */

describe("parsePolicyDeck — field discipline", () => {
  it("a missing required field fails MISSING_FIELD at its exact path", () => {
    const error = parseError(deckWith([cardWire(0, (c) => void delete c["band"])]));
    expect(error.code).toBe("MISSING_FIELD");
    expect(error.path).toBe("cards[0].band");
    const nested = parseError(deckWith([cardWire(0, (c) => void delete whenOf(c)[0]!["threshold"])]));
    expect(nested.code).toBe("MISSING_FIELD");
    expect(nested.path).toBe("cards[0].when[0].threshold");
  });

  it("the action's runbookName/value keys are REQUIRED (null allowed)", () => {
    const error = parseError(deckWith([cardWire(0, (c) => void delete thenOf(c)[0]!["value"])]));
    expect(error.code).toBe("MISSING_FIELD");
    expect(error.path).toBe("cards[0].then[0].value");
  });

  it("refuses the era invitation on a card — a deck is a book, not a schedule", () => {
    const error = parseError(deckWith([cardWire(0, (c) => void (c["era"] = "2001"))]));
    expect(error.code).toBe("UNKNOWN_FIELD");
    expect(error.path).toBe("cards[0].era");
  });

  it("refuses the availableFrom invitation on a card and on the deck", () => {
    const cardError = parseError(deckWith([cardWire(0, (c) => void (c["availableFrom"] = "2016"))]));
    expect(cardError.code).toBe("UNKNOWN_FIELD");
    expect(cardError.path).toBe("cards[0].availableFrom");
    const deckError = parseError({ ...goldenDeck(), availableFrom: "2016" });
    expect(deckError.code).toBe("UNKNOWN_FIELD");
    expect(deckError.path).toBe("availableFrom");
  });

  it("refuses unknown fields at every nested level (scope, predicate, else)", () => {
    expect(parseError(deckWith([cardWire(0, (c) => void (scopeOf(c)["tier"] = 2))])).code).toBe("UNKNOWN_FIELD");
    expect(parseError(deckWith([cardWire(0, (c) => void (whenOf(c)[0]!["comment"] = "hi"))])).code).toBe("UNKNOWN_FIELD");
    expect(parseError(deckWith([cardWire(0, (c) => void (elseOf(c)["cc"] = "founder"))])).code).toBe("UNKNOWN_FIELD");
  });

  it("the OneTwoThree arity wall: zero AND four tuples both fail OUT_OF_RANGE", () => {
    const zero = parseError(deckWith([cardWire(0, (c) => void (c["when"] = []))]));
    expect(zero.code).toBe("OUT_OF_RANGE");
    expect(zero.message).toMatch(/1\.\.3/);
    const four = parseError(
      deckWith([
        cardWire(0, (c) => {
          const action = structuredClone(thenOf(c)[0]!);
          c["then"] = [action, action, action, action];
        }),
      ]),
    );
    expect(four.code).toBe("OUT_OF_RANGE");
    expect(four.path).toBe("cards[0].then");
  });

  it("an empty deck (zero cards) is refused — not content, a mistake", () => {
    const error = parseError({ ...goldenDeck(), cards: [] });
    expect(error.code).toBe("OUT_OF_RANGE");
    expect(error.path).toBe("cards");
  });

  it("duplicate card ids are refused naming BOTH positions", () => {
    const error = parseError(deckWith([cardWire(0), cardWire(1, (c) => void (c["id"] = "watch-the-door"))]));
    expect(error.code).toBe("UNKNOWN_FIELD");
    expect(error.message).toContain("watch-the-door");
    expect(error.message).toContain("cards[0]");
    expect(error.message).toContain("cards[1]");
  });
});

/* ═══════════════════════ decimal-string + resolution walls ═══════════════════════ */

describe("parsePolicyDeck — the bigint boundary", () => {
  it("upkeep as a JSON NUMBER is refused naming the decimal-string law", () => {
    const error = parseError(deckWith([cardWire(0, (c) => void (c["upkeepMicroUsd"] = 2))]));
    expect(error.code).toBe("WRONG_TYPE");
    expect(error.message).toMatch(/decimal STRING/i);
  });

  it("sub-micro float upkeep '1.5' fails SUB_MICROUSD_RESOLUTION", () => {
    const error = parseError(deckWith([cardWire(0, (c) => void (c["upkeepMicroUsd"] = "1.5"))]));
    expect(error.code).toBe("SUB_MICROUSD_RESOLUTION");
    expect(error.path).toBe("cards[0].upkeepMicroUsd");
  });

  it("negative upkeep is OUT_OF_RANGE — a rule costs, it never pays", () => {
    const error = parseError(deckWith([cardWire(0, (c) => void (c["upkeepMicroUsd"] = "-2"))]));
    expect(error.code).toBe("OUT_OF_RANGE");
  });

  it("threshold amount: fractional Fixed raw → NOT_A_SAFE_INTEGER; outside Q16.16 → OUT_OF_RANGE", () => {
    const frac = parseError(deckWith([cardWire(0, (c) => void (thresholdOf(whenOf(c)[0]!)["amount"] = "0.5"))]));
    expect(frac.code).toBe("NOT_A_SAFE_INTEGER");
    expect(frac.path).toBe("cards[0].when[0].threshold.amount");
    const huge = parseError(deckWith([cardWire(0, (c) => void (thresholdOf(whenOf(c)[0]!)["amount"] = "2147483648"))]));
    expect(huge.code).toBe("OUT_OF_RANGE");
    expect(huge.message).toMatch(/Q16\.16/);
  });

  it("a negative Fixed threshold amount is LEGAL by grammar (the wire never reads meaning)", () => {
    const deck = parsePolicyDeck(
      deckWith([cardWire(0, (c) => void (thresholdOf(whenOf(c)[0]!)["amount"] = "-98304"))]),
    );
    const t = deck.cards[0]?.when[0]?.threshold;
    expect(t !== undefined && t.kind === "value" && (t.amount as bigint) === -98_304n).toBe(true);
  });

  it("FOR durationUs: sub-µ fraction, zero, and non-decimal text all fail loud", () => {
    const sub = parseError(deckWith([cardWire(0, (c) => void (forOf(c)["durationUs"] = "1500.5"))]));
    expect(sub.code).toBe("SUB_MICROSECOND_RESOLUTION");
    const zero = parseError(deckWith([cardWire(0, (c) => void (forOf(c)["durationUs"] = "0"))]));
    expect(zero.code).toBe("OUT_OF_RANGE");
    const junk = parseError(deckWith([cardWire(0, (c) => void (forOf(c)["durationUs"] = "30 minutes"))]));
    expect(junk.code).toBe("WRONG_TYPE");
  });

  it("header identity fields: deckId/appliesTo patterns, schemaVersion census", () => {
    expect(parseError({ ...goldenDeck(), deckId: "decks:nope" }).code).toBe("BAD_PATTERN");
    expect(parseError({ ...goldenDeck(), appliesTo: "shared-web" }).code).toBe("BAD_PATTERN");
    const version = parseError({ ...goldenDeck(), schemaVersion: 2 });
    expect(version.code).toBe("BAD_ENUM");
    expect(version.message).toMatch(/schemaVersion 1/);
  });
});

/* ═══════════════ doubled grammar walls (loader-side, per content contract) ═══════════════ */

describe("parsePolicyDeck — estate ref + runbookName discipline", () => {
  it("estate scope with a non-null ref is refused", () => {
    const error = parseError(deckWith([cardWire(1, (c) => void (scopeOf(c)["ref"] = "farm-1"))]));
    expect(error.code).toBe("WRONG_TYPE");
    expect(error.message).toMatch(/estate scope ref must be null/);
  });

  it("non-estate scope with null or empty ref is refused", () => {
    expect(parseError(deckWith([cardWire(0, (c) => void (scopeOf(c)["ref"] = null))])).code).toBe("WRONG_TYPE");
    const empty = parseError(deckWith([cardWire(0, (c) => void (scopeOf(c)["ref"] = ""))]));
    expect(empty.code).toBe("WRONG_TYPE");
    expect(empty.message).toMatch(/empty string|non-empty ref/);
  });

  it("run-runbook requires a non-empty runbookName; other verbs must carry null", () => {
    const missing = parseError(deckWith([cardWire(0, (c) => void (thenOf(c)[1]!["runbookName"] = null))]));
    expect(missing.code).toBe("WRONG_TYPE");
    expect(missing.message).toMatch(/run-runbook requires/);
    const leaked = parseError(deckWith([cardWire(0, (c) => void (thenOf(c)[0]!["runbookName"] = "ghost"))]));
    expect(leaked.code).toBe("WRONG_TYPE");
    expect(leaked.message).toMatch(/only legal on run-runbook/);
  });

  it("comparator↔threshold PAIRING is NOT re-invented here — the evaluator owns it (codec doctrine)", () => {
    // ">" beside a class-ref is grammar-illegal (the engine fold refuses)
    // yet SHAPE-legal: the parse must succeed so the engine stays the
    // single authority on pairing.
    const deck = parsePolicyDeck(
      deckWith([cardWire(0, (c) => void (whenOf(c)[0]!["threshold"] = { kind: "class-ref", classId: "gold" }))]),
    );
    const t = deck.cards[0]?.when[0]?.threshold;
    expect(t !== undefined && t.kind === "class-ref").toBe(true);
  });
});

/* ═══════════════════════ deckCardHash ═══════════════════════ */

describe("deckCardHash — hh-deck-card-hash-v1", () => {
  it("the domain tag is the version string the law names", () => {
    expect(DECK_CARD_HASH_DOMAIN).toBe("hh-deck-card-hash-v1");
  });

  it("deterministic: the same card twice folds to the same 16-hex digest", () => {
    const first = deckCardHash(trustedCardA());
    expect(first).toMatch(/^[0-9a-f]{16}$/);
    expect(deckCardHash(structuredClone(trustedCardA()) as PolicyCard)).toBe(first);
  });

  it("key-order stable: the SAME content written with shuffled property order hashes equal", () => {
    const card = trustedCardA();
    const shuffled = {
      band: card.band,
      upkeepMicroUsd: card.upkeepMicroUsd,
      then: card.then,
      when: card.when,
      else: card.else,
      unless: card.unless,
      for: card.for,
      scope: { ref: card.scope.ref, kind: card.scope.kind },
      id: card.id,
    } as PolicyCard;
    expect(deckCardHash(shuffled)).toBe(deckCardHash(card));
  });

  it("literal golden for the fixture cards (self-derived, disclosed) — a silent fold change reddens here", () => {
    expect(deckCardHash(trustedCardA())).toBe("9a79414b808015a0"); // self-derived 2026-10-18, disclosed
    expect(deckCardHash(trustedMinimal())).toBe("d2f3fcae833abf6f"); // self-derived 2026-10-18, disclosed
  });

  it("sensitive to EVERY top-level field and nested clause (falsifiable matrix)", () => {
    const base = deckCardHash(trustedCardA());
    const a = trustedCardA();
    const minimal = trustedMinimal();
    const pred = (index: number): Predicate => a.when[index] as Predicate;
    const act = (index: number): PolicyAction => a.then[index] as PolicyAction;
    const variants: readonly (readonly [string, PolicyCard])[] = [
      ["id", { ...a, id: asRuleId("watch-the-docr") }],
      ["scope.ref", { ...a, scope: Object.freeze({ kind: "object", ref: "waf" }) }],
      ["scope.kind", { ...a, scope: Object.freeze({ kind: "role", ref: "edge" }) }],
      ["band", { ...a, band: "consult" }],
      ["upkeepMicroUsd", { ...a, upkeepMicroUsd: asMoney(12_501n) }],
      ["when arity", { ...a, when: Object.freeze([pred(0)]) as PolicyCard["when"] }],
      ["when.0.metric", { ...a, when: Object.freeze([{ ...pred(0), metric: asMetricId("utilizationRho.b") }, pred(1), pred(2)]) as PolicyCard["when"] }],
      ["when.0.threshold.amount", { ...a, when: Object.freeze([{ ...pred(0), threshold: Object.freeze({ kind: "value", amount: 16_385n, unit: "count" }) }, pred(1), pred(2)]) as PolicyCard["when"] }],
      ["threshold.unit", { ...a, when: Object.freeze([{ ...pred(0), threshold: Object.freeze({ kind: "value", amount: 16_384n, unit: "ratio" }) }, pred(1), pred(2)]) as PolicyCard["when"] }],
      ["threshold kind (2nd predicate)", { ...a, when: Object.freeze([pred(0), { ...pred(1), threshold: Object.freeze({ kind: "event-name", name: "gold" }) }, pred(2)]) as PolicyCard["when"] }],
      ["for presence", { ...minimal, for: Object.freeze({ durationUs: 1n }) }],
      ["for.durationUs", { ...a, for: Object.freeze({ durationUs: 1_800_000_001n }) }],
      ["then arity", { ...a, then: Object.freeze([act(0)]) as PolicyCard["then"] }],
      ["then.0.value", { ...a, then: Object.freeze([{ ...act(0), value: 131_073n }, act(1)]) as PolicyCard["then"] }],
      ["then.1.runbookName", { ...a, then: Object.freeze([act(0), { ...act(1), runbookName: "restart-drain-loops" }]) as PolicyCard["then"] }],
      ["then.1.value null-vs-number", { ...a, then: Object.freeze([act(0), { ...act(1), value: 0n }]) as PolicyCard["then"] }],
      ["unless presence", { ...minimal, unless: Object.freeze([pred(0)]) as Exclude<PolicyCard["unless"], undefined> }],
      ["unless.0.metric", { ...a, unless: Object.freeze([{ ...(a.unless?.[0] as Predicate), metric: asMetricId("lane.errorRate.b") }]) as Exclude<PolicyCard["unless"], undefined> }],
      ["else presence", { ...minimal, else: Object.freeze({ to: "role", ref: "founder" }) as Exclude<PolicyCard["else"], undefined> }],
      ["else.to", { ...a, else: Object.freeze({ to: "role", ref: "consult" }) as Exclude<PolicyCard["else"], undefined> }],
      ["else.ref", { ...a, else: Object.freeze({ to: "band", ref: "execute" }) as Exclude<PolicyCard["else"], undefined> }],
    ];
    for (const [name, variant] of variants) {
      expect(deckCardHash(variant), `variant ${name} must move the hash`).not.toBe(base);
    }
  });

  it("scope.ref null-vs-string is distinct; the ∅ sentinel keeps nulls out of the empty-string collision", () => {
    const withNull = trustedMinimal(); // estate, ref null
    const withString = { ...withNull, scope: Object.freeze({ kind: "object", ref: "edge" }) } as PolicyCard;
    expect(deckCardHash(withNull)).not.toBe(deckCardHash(withString));
    const withEmpty = { ...withNull, scope: Object.freeze({ kind: "object", ref: "" }) } as unknown as PolicyCard;
    expect(deckCardHash(withEmpty)).not.toBe(deckCardHash(withString));
    expect(deckCardHash(withEmpty)).not.toBe(deckCardHash(withNull));
  });

  it("wire-identity by design: the decimal STRING of a bigint folds to the same key", () => {
    // The revival keeps money/Fixed as decimal text in the fold, so a host
    // may key a book from raw (un-revived) wire JSON and agree. Pinned as
    // LAW, not accident.
    const a = trustedCardA();
    const wireForm = { ...a, upkeepMicroUsd: "12500" } as unknown as PolicyCard;
    expect(deckCardHash(wireForm)).toBe(deckCardHash(a));
  });

  it("fails loud on UNTRUSTED input (a hand-built card that lies about shape)", () => {
    const lying = { ...trustedCardA(), upkeepMicroUsd: 12500 } as unknown as PolicyCard;
    try {
      deckCardHash(lying);
      expect.unreachable();
    } catch (error) {
      expect((error as LoaderError).code).toBe("WRONG_TYPE");
    }
    const extra = { ...(trustedMinimal() as object), era: "2001" } as unknown as PolicyCard;
    try {
      deckCardHash(extra);
      expect.unreachable();
    } catch (error) {
      expect((error as LoaderError).code).toBe("UNKNOWN_FIELD");
    }
  });

  it("the door relationship is documented, not claimed equal: the COMPLETE walk moves with the optional arms the door fingerprint omits", () => {
    // The door's cardFingerprint (intent-door.ts M3) omits for/unless/else;
    // deckCardHash walks them — pinned by the "presence" variants above.
    // Here: same id, same door-visible content, DIFFERENT unless arm ⇒
    // ruleBookHash-style fold could NOT see it; deckCardHash must.
    const a = trustedCardA();
    const relabelledGuard = {
      ...a,
      unless: Object.freeze([{ ...(a.unless?.[0] as Predicate), metric: asMetricId("lane.errorRate") }]) as Exclude<PolicyCard["unless"], undefined>,
    } as PolicyCard;
    // same metrics as the golden card ⇒ deckCardHash EQUAL (sanity), while
    // any REAL guard edit (see matrix) moved it — the walk is total.
    expect(deckCardHash(relabelledGuard)).toBe(deckCardHash(a));
  });
});

/* ═══════════════════════ bootRulesFromDeck ═══════════════════════ */

describe("bootRulesFromDeck — the trusted book", () => {
  it("entry shape: {hash, card}, frozen, hash === deckCardHash(card)", () => {
    const deck = goldenParsed();
    const rules = bootRulesFromDeck(deck);
    expect(rules.entries).toHaveLength(2);
    const entry = rules.entries[0]!;
    expect(entry.hash).toBe(deckCardHash(deck.cards[0] as PolicyCard));
    expect(entry.card).toBe(deck.cards[0]); // same trusted instance, no re-mint
    expect(Object.isFrozen(rules)).toBe(true);
    expect(Object.isFrozen(rules.entries)).toBe(true);
    expect(Object.isFrozen(entry)).toBe(true);
  });

  it("deterministic: two folds of equal decks deep-equal (host-built once, read many)", () => {
    expect(bootRulesFromDeck(goldenParsed())).toEqual(bootRulesFromDeck(goldenParsed()));
  });

  it("structurally satisfies the boot-rules book contract (local mirror of protocol.ts BootRules)", () => {
    interface BootRulesMirror {
      readonly entries: readonly { readonly hash: string; readonly card: PolicyCard }[];
    }
    const rules: BootRulesMirror = bootRulesFromDeck(goldenParsed());
    const lookup = new Map(rules.entries.map((entry) => [entry.hash, entry.card]));
    expect(lookup.get(deckCardHash(trustedCardA()))).toEqual(trustedCardA());
    expect(lookup.get("deadbeefdeadbeef")).toBeUndefined();
  });

  it("a hand-built deck with a duplicate hash is refused naming BOTH positions", () => {
    const card = trustedMinimal();
    const forged = { cards: [card, card] } as unknown as LoadedPolicyDeck;
    try {
      bootRulesFromDeck(forged);
      expect.unreachable();
    } catch (error) {
      const loader = error as LoaderError;
      expect(loader.code).toBe("UNKNOWN_FIELD");
      expect(loader.message).toContain("cards[0]");
      expect(loader.message).toContain("cards[1]");
    }
  });

  it("an empty hand-built book is the legal armed-but-silent arm", () => {
    const rules = bootRulesFromDeck({ cards: [] } as unknown as LoadedPolicyDeck);
    expect(rules.entries).toEqual([]);
  });
});
