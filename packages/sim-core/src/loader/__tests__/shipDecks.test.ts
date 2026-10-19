/**
 * SHIPPED-DECK run (read-only!): every packages/content/decks/*.json on disk
 * is parsed through the strict boundary (G7B's loader/decks.ts) and held to
 * the authoring laws the G7C content pass committed to:
 *
 *  - MAINLINE FIRING LAW: a card's scope ref + trigger metric must name a
 *    cell the mainline hosts actually publish (pipeline/defaults.ts step-12
 *    state cells, apps/proto runner/simCoreRunner.ts lane cells, the economy
 *    reputation publisher); a crossing not witnessed rule-side in
 *    apps/proto/src/__tests__/simCoreRunner.rules.test.ts @9653a96 must be
 *    disclosed by card id inside the deck's own _todo string.
 *  - METRIC HONOR WALL: MetricId is an open string — nothing machine-stops a
 *    deck naming cpu or p95. This walk is that stop: triggers may only name
 *    the published-cell census, and queueDepth (a JS-number cell the bigint
 *    comparator law halts on) and mrrMicroUsd (a chrome key with NO engine
 *    publisher) are pinned ABSENT by name, with reasons below.
 *  - HASH LAW: deckCardHash goldens are load-bearing re-pins (self-derived at
 *    authoring 2026-10-18, RE-DERIVED at the wave-30 content retune when the
 *    promised upkeep motion landed — the 14 old→new keys ride that commit
 *    body). JSON ships no hashes — the host computes (protocol.ts:355-362
 *    opaque-key law).
 *  - PARITY DRIFT PIN: watch-the-door mirrors the gates/g7 six-card book
 *    (apps/proto/src/gates/g7/g7Deck.ts:41-51,75-82). The expected cards are
 *    hand-transcribed here — a loader test may not import apps/** — so if
 *    g7Deck ever changes, THIS test reddens. That is the pin working, not
 *    breaking: retarget deliberately and re-transcribe, or leave both still.
 *    DISCLOSED DIVERGENCE (wave-30): upkeep — shipped decks ride the small
 *    PROVISIONAL ladder, the g7 gate constants stay 0n (gate fiction is
 *    separate from live content); parity holds on every field except the
 *    machine-pinned divergence rows below.
 *
 * The parser mechanics themselves (vocabularies, arity, decimal-string law,
 * dup ids, era fences) are decks.test.ts's turf — nothing here re-litigates
 * it; probes below only prove the SHIPPED files stand where the two header
 * walls intersect (loader refuses name/_provenance, validator refuses note).
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { DelegationBand, PolicyActionId, PolicyCard } from "../../types.ts";
import { asMetricId, asMoney, asRuleId } from "../../types.ts";
import { LoaderError } from "../boundary.ts";
import {
  bootRulesFromDeck,
  deckCardHash,
  parsePolicyDeck,
  type LoadedPolicyDeck,
} from "../decks.ts";

const CONTENT = join(process.cwd(), "..", "content");
const HEX16 = /^[0-9a-f]{16}$/;

type Wire = Record<string, unknown>;

function readDeckWire(name: string): Wire {
  return JSON.parse(readFileSync(join(CONTENT, "decks", name), "utf8")) as Wire;
}

function readDeck(name: string): LoadedPolicyDeck {
  return parsePolicyDeck(readDeckWire(name));
}

const DECK_FILES = readdirSync(join(CONTENT, "decks"))
  .filter((name) => name.endsWith(".json"))
  .sort();

/* ═══════════════════ the published-cell graph (mainline truth) ═══════════════════
 * entity → metrics published as bigint Q16.16 Fixed cells the evaluator can
 * compare. Sources, all on disk at authoring:
 *   edge/waf/deep/origin × utilizationRho … pipeline/defaults.ts:1755-1756
 *   edge × retryPressure ……………………… pipeline/defaults.ts:1760-1761 (estate anchor)
 *   lane/ingress-1 × ratePerMin, health … apps/proto runner/simCoreRunner.ts:1742-1764
 *   company × reputation …………………… economy publish-on-change (@57ea80e)
 * queueDepth is PUBLISHED (defaults.ts:1755) but as a JS NUMBER — the bigint
 * comparator law (policy/grammar.ts observedValueToCellRaw) halts a numeric
 * read, so no deck may trigger on it; mrrMicroUsd is a chrome metrics key with
 * NO engine publisher — naming it would compile and LIE (never-fire). */
const PUBLISHED_FIXED_CELLS: ReadonlyMap<string, readonly string[]> = new Map([
  ["edge", ["utilizationRho", "retryPressure"]],
  ["waf", ["utilizationRho"]],
  ["deep", ["utilizationRho"]],
  ["origin", ["utilizationRho"]],
  ["lane/ingress-1", ["ratePerMin", "health"]],
  ["company", ["reputation"]],
]);
/** The §7.14-cardinality honor census — the ONLY metric names a shipped deck
 *  may speak (seven published or shelf-known cells; see graph above). */
const METRIC_CENSUS: readonly string[] = [
  "utilizationRho",
  "queueDepth",
  "retryPressure",
  "ratePerMin",
  "health",
  "mrrMicroUsd",
  "reputation",
];
/** Crossings witnessed firing on the mainline (simCoreRunner.rules.test.ts,
 *  @9653a96, seed 42n): edge rho over 16384 (frame 6), origin rho over 16384
 *  and over 49152. Everything else must carry its _todo disclosure by id. */
const WITNESSED_FIRINGS: ReadonlySet<string> = new Set([
  "edge|utilizationRho|>|16384",
  "origin|utilizationRho|>|16384",
  "origin|utilizationRho|>|49152",
]);

const CARD_ID_RE = /^([a-z0-9][a-z0-9-]*:)?[a-z0-9][a-z0-9-]*$/;

interface DeckMeta {
  readonly name: string;
  readonly slug: string;
  readonly deck: LoadedPolicyDeck;
}
const DECKS: readonly DeckMeta[] = DECK_FILES.map((name) => ({
  name,
  slug: name.replace(/\.json$/, ""),
  deck: readDeck(name),
}));

const allCards = (): ReadonlyArray<{ meta: DeckMeta; card: PolicyCard }> =>
  DECKS.flatMap((meta) => meta.deck.cards.map((card) => ({ meta, card })));

/* ═══════════════════════ roster + boundary parse ═══════════════════════ */

describe("shipped decks — roster and strict boundary", () => {
  it("decks/ ships exactly the three authored books, slug-named like packs", () => {
    expect(DECK_FILES).toEqual(["cold-aisle.json", "sleepless.json", "watch-the-door.json"]);
    for (const meta of DECKS) {
      expect(meta.deck.deckId).toBe(`deck:${meta.slug}`); // id carries the prefix, the filename does not (packs parallel)
      expect(meta.deck.cards.length).toBeGreaterThan(0);
      expect(meta.deck.note).toBeNull(); // the validator refuses note — nothing shipped it
    }
  });

  it("card ids are deck-namespaced house slugs, unique per deck", () => {
    for (const meta of DECKS) {
      const seen = new Set<string>();
      for (const card of meta.deck.cards) {
        const id = String(card.id);
        expect(id).toMatch(CARD_ID_RE);
        expect(id.startsWith(`${meta.slug}:`)).toBe(true);
        expect(seen.has(id)).toBe(false);
        seen.add(id);
      }
    }
    // fourteen cards ship today — the census the README row quotes
    expect(allCards().length).toBe(14);
  });

  it("appliesTo resolves exactly like the validator leg: shipped bundle id or reserved core:*", () => {
    const bundleIds = new Set(
      readdirSync(join(CONTENT, "types"))
        .filter((n) => n.endsWith(".json"))
        .map((n) => String((JSON.parse(readFileSync(join(CONTENT, "types", n), "utf8")) as Wire)["id"])),
    );
    for (const meta of DECKS) {
      const applies = String(meta.deck.appliesTo);
      const resolves = bundleIds.has(applies) || /^core:[a-z0-9][a-z0-9-]*$/.test(applies);
      expect(resolves, `${meta.name} appliesTo ${applies}`).toBe(true);
    }
  });
});

/* ═══════════════════════ hash law: book, goldens, sensitivity ═══════════════════════ */

describe("shipped decks — deckCardHash v1 law", () => {
  it("bootRulesFromDeck yields one entry per card; hashes are 16-hex, unique across ALL decks", () => {
    const all = new Set<string>();
    for (const meta of DECKS) {
      const book = bootRulesFromDeck(meta.deck);
      expect(book.entries.length).toBe(meta.deck.cards.length);
      book.entries.forEach((entry, index) => {
        expect(entry.hash).toMatch(HEX16);
        expect(entry.card).toBe(meta.deck.cards[index]); // identity, not copies
        expect(all.has(entry.hash)).toBe(false);
        all.add(entry.hash);
      });
    }
    expect(all.size).toBe(14);
  });

  // Self-derived at authoring (2026-10-18), RE-DERIVED at the wave-30 content
  // retune (upkeep 0 → the small-value ladder re-keystrokes every card — the
  // promised motion of the wave-29 rider, old→new in the commit body). From
  // this exact JSON, permanent load-bearing re-pins: ANY leaf move in a
  // shipped card re-derives its key and reddens these literals. That is the
  // lookup-key law doing its job.
  it("cold-aisle hash goldens", () => {
    expect(goldenMap("cold-aisle.json")).toEqual({
      "cold-aisle:murmur-the-bell": "07872042156b0c23",
      "cold-aisle:ask-the-senior-again": "fb195f752cfc2dbd",
      "cold-aisle:quarter-watch": "814bf11301e5d782",
      "cold-aisle:queue-etiquette": "90c1149fffeed59a",
      "cold-aisle:health-ribbon": "25e157a84610179c",
    });
  });

  it("sleepless hash goldens", () => {
    expect(goldenMap("sleepless.json")).toEqual({
      "sleepless:cold-thought-count": "86194eb20593b0e4",
      "sleepless:second-wind": "a8833576d20d87fc",
      "sleepless:panic-failover": "6fc54cc18eafe4df",
    });
  });

  it("watch-the-door hash goldens", () => {
    expect(goldenMap("watch-the-door.json")).toEqual({
      "watch-the-door:watch-the-door": "3d40a6bd7be36a6d",
      "watch-the-door:page-the-founder": "844da135e611941f",
      "watch-the-door:shed-the-small": "c562a9d3204b1986",
      "watch-the-door:escape-hatch": "cbe0cb31ab601d39",
      "watch-the-door:the-underwriter": "2c0e9763ab2d1bc8",
      "watch-the-door:ask-the-senior": "7d93c1199556c3ed",
    });
  });

  it("one leaf moves, the key moves — across every clause family", () => {
    const base = deckCardHash(readDeck("watch-the-door.json").cards[0] as PolicyCard);
    const probes: ReadonlyArray<[string, (card: Wire) => void]> = [
      ["threshold amount", (c) => { const when0 = (c["when"] as Wire[])[0] as Wire; (when0["threshold"] as Wire)["amount"] = "16385"; }],
      ["upkeep", (c) => { c["upkeepMicroUsd"] = "1"; }],
      ["band", (c) => { c["band"] = "inform"; }],
      ["action id", (c) => { const then0 = (c["then"] as Wire[])[0] as Wire; then0["id"] = "drain"; }],
      ["scope ref", (c) => { (c["scope"] as Wire)["ref"] = "origin"; }],
      ["escalation arm appears", (c) => { c["else"] = { to: "band", ref: "consult" }; }],
    ];
    for (const [what, mutate] of probes) {
      const wire = readDeckWire("watch-the-door.json");
      const card = (wire["cards"] as Wire[])[0] as Wire;
      mutate(card);
      const moved = deckCardHash(parsePolicyDeck(wire).cards[0] as PolicyCard);
      expect(moved, what).not.toBe(base);
    }
  });

  it("no shipped deck carries an embedded hash — the host computes the key", () => {
    // The law is structural: no KEY may pose as a hash field and no string
    // VALUE may be a 16-hex digest. (Prose in _todo may name hashes freely —
    // this lane's own disclosures do.)
    const badKey = (value: unknown): boolean => {
      if (Array.isArray(value)) return value.some(badKey);
      if (value !== null && typeof value === "object") {
        for (const [k, v] of Object.entries(value as Wire)) {
          if (/hash|digest|fingerprint/i.test(k)) return true;
          if (badKey(v)) return true;
        }
      }
      return false;
    };
    const hexValue = (value: unknown): boolean => {
      if (typeof value === "string") return HEX16.test(value);
      if (Array.isArray(value)) return value.some(hexValue);
      if (value !== null && typeof value === "object") return Object.values(value as Wire).some(hexValue);
      return false;
    };
    for (const meta of DECKS) {
      const wire = JSON.parse(readFileSync(join(CONTENT, "decks", meta.name), "utf8")) as unknown;
      expect(badKey(wire), meta.name).toBe(false);
      expect(hexValue(wire), meta.name).toBe(false);
    }
  });
});

function goldenMap(name: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const card of readDeck(name).cards) out[String(card.id)] = deckCardHash(card);
  return out;
}

/* ═══════════════════════ parity twin: the g7 book, re-authored ═══════════════════════
 * Trusted twins of apps/proto/src/gates/g7/g7Deck.ts:75-82 (built with the
 * card() factory at :53-73 over BUSY/SWAMPED at :41-51), hand-transcribed —
 * imports across the apps boundary are law-forbidden here. Disclosed
 * retargets (also in the deck _todo): scope refs node/edge→edge,
 * node/origin→origin; BUSY amount 40960→16384 (mainline-witnessed crossing;
 * 40960 is the g7-storm board's line the mainline never reaches); card ids
 * gain the `watch-the-door:` namespace. Order is the g7 stamping order.
 * DISCLOSED DIVERGENCE (wave-30 content retune): UPKEEP. The shipped JSON now
 * carries the small PROVISIONAL ladder (inform 5k / consult 10k / execute 25k
 * / execute-wall-card 40k µ$ per sim-minute); the g7 gate constants stay 0n —
 * gate fiction is a separate body of material from live content and the
 * retune commission named only the shipped decks. The twins below therefore
 * hold on every field EXCEPT upkeep, and the divergence list is machine-pinned
 * (shipped value per card id, gate value 0n): a silent move on EITHER side
 * THIS test can see — the shipped JSON or these hand-transcribed twins —
 * reddens it HERE; the real g7Deck.ts constants are invisible across the
 * apps boundary (import law) and are pinned PROTO-side at
 * apps/proto/src/__tests__/deckBoot.rules.test.ts (UPKEEP_DIVERGENCE drift
 * pin, wave-30 closeout W30-01). */

function twin(
  id: string,
  ref: string,
  amount: bigint,
  actionId: PolicyActionId,
  value: bigint | null,
  band: DelegationBand,
): PolicyCard {
  return Object.freeze({
    id: asRuleId(`watch-the-door:${id}`),
    scope: Object.freeze({ kind: "object", ref }),
    when: Object.freeze([
      Object.freeze({
        metric: asMetricId("utilizationRho"),
        comparator: ">",
        threshold: Object.freeze({ kind: "value", amount, unit: "count" }),
      }),
    ]),
    then: Object.freeze([Object.freeze({ id: actionId, runbookName: null, value })]),
    band,
    upkeepMicroUsd: asMoney(0n), // the g7 gate fiction: unpriced, BY DESIGN (see divergence below)
  }) as PolicyCard;
}

/** The machine-pinned disclosed divergence: shipped upkeep per card vs the
 *  g7 twin's 0n. If the ladder retunes, flip these together with the JSON. */
const UPKEEP_DIVERGENCE: Readonly<Record<string, { readonly shipped: bigint; readonly gate: bigint }>> =
  Object.freeze({
    "watch-the-door:watch-the-door": Object.freeze({ shipped: 25_000n, gate: 0n }),
    "watch-the-door:page-the-founder": Object.freeze({ shipped: 25_000n, gate: 0n }),
    "watch-the-door:shed-the-small": Object.freeze({ shipped: 25_000n, gate: 0n }),
    "watch-the-door:escape-hatch": Object.freeze({ shipped: 40_000n, gate: 0n }),
    "watch-the-door:the-underwriter": Object.freeze({ shipped: 5_000n, gate: 0n }),
    "watch-the-door:ask-the-senior": Object.freeze({ shipped: 10_000n, gate: 0n }),
  });

/** Erase the ONE disclosed-divergent field for the structural equality walk. */
function withoutUpkeep(card: PolicyCard): PolicyCard {
  return { ...card, upkeepMicroUsd: asMoney(0n) };
}

describe("shipped decks — watch-the-door parity against the gates/g7 book", () => {
  it("all six cards equal the hand-transcribed g7 twins on every field EXCEPT the disclosed upkeep divergence", () => {
    const parsed = DECKS.find((meta) => meta.name === "watch-the-door.json")?.deck.cards;
    expect(parsed).toBeDefined();
    const twins: readonly PolicyCard[] = [
      twin("watch-the-door", "edge", 16_384n, "raise-inspection-depth", 131_072n, "execute"),
      twin("page-the-founder", "edge", 16_384n, "page", null, "execute"),
      twin("shed-the-small", "edge", 16_384n, "shed-class", null, "execute"),
      twin("escape-hatch", "origin", 16_384n, "failover", null, "execute"),
      twin("the-underwriter", "origin", 49_152n, "scale-out", 131_072n, "inform"),
      twin("ask-the-senior", "edge", 16_384n, "open-ticket", null, "consult"),
    ];
    const cards = parsed as readonly PolicyCard[];
    // Upkeep-erased, the two books are FIELD FOR FIELD identical — the parity law holds.
    expect(cards.map(withoutUpkeep)).toEqual(twins.map(withoutUpkeep));
    // And the divergence is exactly the disclosed set: shipped side carries the
    // ladder, gate side carries 0n — each id checked against its own row.
    for (const card of cards) {
      const row = UPKEEP_DIVERGENCE[String(card.id)];
      if (row === undefined) throw new Error(`undisclosed card id ${String(card.id)} in the shipped book`);
      expect(card.upkeepMicroUsd).toBe(row.shipped);
    }
    for (const t of twins) {
      const twinRow = UPKEEP_DIVERGENCE[String(t.id)];
      if (twinRow === undefined) throw new Error(`twin id ${String(t.id)} missing from the divergence list`);
      expect(t.upkeepMicroUsd).toBe(twinRow.gate);
    }
  });
});

/* ═══════════════════════ honesty walks ═══════════════════════ */

describe("shipped decks — mainline firing + honor walls", () => {
  it("every card watches a published Fixed cell; every unwitnessed crossing is disclosed by id", () => {
    for (const { meta, card } of allCards()) {
      expect(card.scope.kind, `${card.id} scope kind`).toBe("object"); // mainline resolves no role/query/class
      const ref = card.scope.ref as string;
      const published = PUBLISHED_FIXED_CELLS.get(ref);
      expect(published, `${meta.name}: ${card.id} ref ${ref} publishes nothing`).toBeDefined();
      for (const group of [card.when, card.unless ?? []]) {
        for (const predicate of group) {
          expect(
            (published as readonly string[]).includes(String(predicate.metric)),
            `${meta.name}: ${card.id} triggers ${ref}::${String(predicate.metric)} which mainline never publishes as Fixed`,
          ).toBe(true);
          const t = predicate.threshold;
          if (t.kind === "value" && (predicate.comparator === ">" || predicate.comparator === "<")) {
            const key = `${ref}|${String(predicate.metric)}|${predicate.comparator}|${t.amount.toString()}`;
            if (!WITNESSED_FIRINGS.has(key)) {
              expect(
                (meta.deck.todo as string).includes(String(card.id)),
                `${meta.name}: ${card.id} crosses ${key} unwitnessed — the deck _todo must name it`,
              ).toBe(true);
            }
          }
        }
      }
    }
  });

  it("metric honor wall: triggers name only the published census; queueDepth and mrrMicroUsd stay out", () => {
    for (const { card } of allCards()) {
      for (const group of [card.when, card.unless ?? []]) {
        for (const predicate of group) {
          expect(METRIC_CENSUS, `${card.id} metric ${String(predicate.metric)} is off-census (a lie waiting to compile)`).toContain(String(predicate.metric));
        }
      }
    }
    // queueDepth: published as a JS NUMBER — a bigint comparator halts on it.
    // mrrMicroUsd: chrome-only key, NO engine publisher — never fires.
    const forbidden = ["queueDepth", "mrrMicroUsd"];
    for (const { card } of allCards()) {
      for (const group of [card.when, card.unless ?? []]) {
        for (const predicate of group) expect(forbidden).not.toContain(String(predicate.metric));
      }
    }
  });

  it("upkeep law (wave-30 retune): every card carries its PROVISIONAL ladder value; each deck Σ pins; _todo discloses", () => {
    // The ladder (orchestrator recommendation, doc-grounded on §7.14:28536
    // 'each carries a small upkeep' + the delegation bands at :28594-28602
    // (definitions land :28601-28602 — line-shifted by the wave-29 riders;
    // W30-02 re-anchor), PROVISIONAL ratify-on-playtest per ADR-0016 #10):
    // inform 5,000 /
    // consult 10,000 / execute 25,000 µ$ per sim-minute — and an execute card
    // whose THEN arm is the bought-verb wall (failover) is priced ABOVE the
    // plain execute at 40,000. The rule is DERIVED from the card's own band +
    // verb, not copied from the JSON: the 14 hash goldens above are the
    // per-card literals; this is the LAW that explains them.
    const ladderOf = (card: PolicyCard): bigint => {
      if (card.band === "inform") return 5_000n;
      if (card.band === "consult") return 10_000n;
      return card.then[0]?.id === "failover" ? 40_000n : 25_000n;
    };
    const DECK_SUM: Readonly<Record<string, bigint>> = Object.freeze({
      "watch-the-door.json": 130_000n, // 3×25k execute + 40k wall + 5k inform + 10k consult
      "cold-aisle.json": 35_000n, // 3×5k inform + 2×10k consult — all advisory, no wall line here
      "sleepless.json": 50_000n, // 2×5k inform + 40k wall (panic-failover)
    });
    for (const meta of DECKS) {
      let sum = 0n;
      for (const card of meta.deck.cards) {
        expect(card.upkeepMicroUsd, `${meta.name}: ${String(card.id)} off the ladder`).toBe(ladderOf(card));
        sum += card.upkeepMicroUsd;
      }
      expect(sum, `${meta.name} Σ upkeep`).toBe(DECK_SUM[meta.name]);
      expect(meta.deck.todo).toContain("PROVISIONAL");
      expect(meta.deck.todo).toMatch(/upkeep/i);
      expect(meta.deck.todo).toContain("THE RETUNE LANDED");
    }
  });

  it("the header ships only the loader∩validator intersection — name and _provenance are refused", () => {
    for (const meta of DECKS) {
      const wire = readDeckWire(meta.name);
      expect(Object.keys(wire).sort()).toEqual(["_todo", "appliesTo", "cards", "deckId", "schemaVersion"]);
    }
    const withName = readDeckWire("sleepless.json");
    withName["name"] = "The Sleepless Watch";
    const nameError = parseError(withName);
    expect(nameError.code).toBe("UNKNOWN_FIELD");
    expect(nameError.path).toBe("name");
    const withProvenance = readDeckWire("sleepless.json");
    withProvenance["_provenance"] = { cards: "§7.14:28526-28530" };
    const provError = parseError(withProvenance);
    expect(provError.code).toBe("UNKNOWN_FIELD");
    expect(provError.path).toBe("_provenance");
  });
});

function parseError(raw: unknown): LoaderError {
  try {
    parsePolicyDeck(raw);
  } catch (error) {
    return error as LoaderError;
  }
  throw new Error("expected parsePolicyDeck to throw — it did not");
}
