/**
 * doc.test.ts — the CampaignDoc boundary wall (L-CP1).
 */
import { describe, expect, it } from "vitest";
import {
  CAMPAIGN_SCHEMA,
  CAMPAIGN_EXIT_KINDS,
  CARRY_CAST_CAP,
  CARRY_STAFF_CAP,
  CampaignError,
  parseCampaignDoc,
  toCampaignWire,
} from "../index";
import { canonicalJson, fromCanonicalJson } from "../../save/index";
import { VALUATION_EXIT_KINDS } from "../../economy/index";

const valid = () => ({
  schema: CAMPAIGN_SCHEMA,
  id: "long-weekend-trilogy",
  name: "The Long Weekend Trilogy",
  chapters: [
    { chapterId: "one", scenarioId: "the-long-weekend" },
    { chapterId: "two", scenarioId: "the-angry-whale", tickCap: 200 },
  ],
  carry: { cashFloor: { thresholdMicroUsd: 5_000_000n, bridgeMicroUsd: 500_000n }, scarCapRide: true },
});

describe("parseCampaignDoc (happy path)", () => {
  it("parses chapters, defaults caps, and freezes", () => {
    const doc = parseCampaignDoc(valid());
    expect(doc.schemaVersion).toBe(1);
    expect(doc.chapters.length).toBe(2);
    expect(doc.chapters[0]?.tickCap).toBeUndefined();
    expect(doc.chapters[1]?.tickCap).toBe(200);
    expect(doc.carry.staffCap).toBe(CARRY_STAFF_CAP);
    expect(doc.carry.castCap).toBe(CARRY_CAST_CAP);
    expect(doc.carry.scarCapRide).toBe(true);
    expect(Object.isFrozen(doc)).toBe(true);
  });

  it("round-trips through the wire projection", () => {
    const doc = parseCampaignDoc(valid());
    expect(parseCampaignDoc(toCampaignWire(doc))).toEqual(doc);
  });
});

describe("parseCampaignDoc (the wall)", () => {
  it("speaks the house grammar campaign[CODE] at 'path': detail", () => {
    try {
      parseCampaignDoc({ ...valid(), schema: "hh-campaign@2" });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(CampaignError);
      expect((error as Error).message).toMatch(/^campaign: BAD_ENUM at 'campaign\.schema':/);
    }
  });

  it("refuses a zero-chapter campaign and duplicate chapter ids", () => {
    expect(() => parseCampaignDoc({ ...valid(), chapters: [] })).toThrow(/EMPTY at 'campaign\.chapters'/);
    expect(() => parseCampaignDoc({ ...valid(), chapters: [{ chapterId: "one", scenarioId: "a" }, { chapterId: "one", scenarioId: "b" }] })).toThrow(/DUPLICATE at 'campaign\.chapters\[1\]/);
  });

  it("refuses the reserved perspective slot BY NAME (optional-forward)", () => {
    expect(() => parseCampaignDoc({ ...valid(), chapters: [{ chapterId: "one", scenarioId: "a", perspective: "cto" }] })).toThrow(/RESERVED at 'campaign\.chapters\[0\]\.perspective'/);
  });

  it("refuses scarCapRide:false — the scar cap is engine law", () => {
    expect(() => parseCampaignDoc({ ...valid(), carry: { cashFloor: { thresholdMicroUsd: 1n, bridgeMicroUsd: 0n }, scarCapRide: false } })).toThrow(/scarCapRide.*engine law/s);
  });

  it("refuses a bridge that pays MORE than the floor (failure is poorer, not paid)", () => {
    expect(() => parseCampaignDoc({ ...valid(), carry: { cashFloor: { thresholdMicroUsd: 100n, bridgeMicroUsd: 100n }, scarCapRide: true } })).toThrow(/poorer/);
  });

  it("refuses out-of-range caps and non-money floors", () => {
    expect(() => parseCampaignDoc({ ...valid(), carry: { cashFloor: { thresholdMicroUsd: 10n, bridgeMicroUsd: 1n }, staffCap: 4, scarCapRide: true } })).toThrow(/BAD_RANGE at 'campaign\.carry\.staffCap'/);
    expect(() => parseCampaignDoc({ ...valid(), carry: { cashFloor: { thresholdMicroUsd: 1.5 as never, bridgeMicroUsd: 1n }, scarCapRide: true } })).toThrow(/BAD_MONEY/);
    expect(() => parseCampaignDoc({ ...valid(), carry: { cashFloor: { thresholdMicroUsd: "90x" as never, bridgeMicroUsd: "1" as never }, scarCapRide: true } })).toThrow(/BAD_MONEY/);
    const wireMoney = parseCampaignDoc({ ...valid(), carry: { cashFloor: { thresholdMicroUsd: "900" as never, bridgeMicroUsd: "1" as never }, scarCapRide: true } });
    expect(wireMoney.carry.cashFloor.thresholdMicroUsd).toBe(900n);
  });

  it("refuses float tickCap, zero tickCap, unknown keys, bad ids", () => {
    expect(() => parseCampaignDoc({ ...valid(), chapters: [{ chapterId: "one", scenarioId: "a", tickCap: 2.5 }] })).toThrow(/BAD_INT at 'campaign\.chapters\[0\]\.tickCap'/);
    expect(() => parseCampaignDoc({ ...valid(), chapters: [{ chapterId: "one", scenarioId: "a", tickCap: 0 }] })).toThrow(/BAD_RANGE/);
    expect(() => parseCampaignDoc({ ...valid(), extras: 1 })).toThrow(/BAD_RECORD at 'campaign': unknown key "extras"/);
    expect(() => parseCampaignDoc({ ...valid(), id: "Bad ID" })).toThrow(/BAD_ID/);
  });
});

describe("parseCampaignDoc — the canonical wire boundary", () => {
  it("survives a save-file round trip (canonicalJson bigint transport, both money shapes)", () => {
    const doc = parseCampaignDoc(valid());
    const overWire = parseCampaignDoc(fromCanonicalJson(canonicalJson(toCampaignWire(doc))));
    expect(overWire).toEqual(doc);
    // A host may hand the wall decimal strings exactly as the JSON wire carries them.
    const strung = valid() as unknown as Record<string, unknown>;
    (strung.carry as Record<string, unknown>).cashFloor = { thresholdMicroUsd: "5000000", bridgeMicroUsd: "500000" };
    expect(parseCampaignDoc(strung).carry.cashFloor.thresholdMicroUsd).toBe(5_000_000n);
  });
});

describe("parseCampaignDoc — the §1.6 exit declaration (L-V2, money-at-the-end 2/3)", () => {
  /** Like `valid()` but THREE chapters — the position law needs a real middle. */
  const three = () => ({
    ...valid(),
    chapters: [
      { chapterId: "one", scenarioId: "the-long-weekend" },
      { chapterId: "two", scenarioId: "the-angry-whale" },
      { chapterId: "three", scenarioId: "the-hardest-lesson", tickCap: 300 },
    ],
  });

  it("the bridge vocabulary is BYTE-IDENTICAL to the economy's — same seven slugs, same order", () => {
    // CAMPAIGN_EXIT_KINDS mirrors VALUATION_EXIT_KINDS (the import law keeps
    // economy out of doc.ts, so the mirror is pinned here instead of typed):
    // two vocabularies that drift would make the declared kind reach
    // exitCashSliceMicroUsd as a foreign word. Order included — the docblock
    // cites hg:4503-4514 IN DOC ORDER on both sides.
    expect([...CAMPAIGN_EXIT_KINDS]).toEqual([...VALUATION_EXIT_KINDS]);
    expect(CAMPAIGN_EXIT_KINDS).toHaveLength(7);
    expect(Object.isFrozen(CAMPAIGN_EXIT_KINDS)).toBe(true);
  });

  it("a sale-family kind may be declared; undeclared chapters stay sparse", () => {
    const doc = parseCampaignDoc({
      ...valid(),
      chapters: [
        { chapterId: "one", scenarioId: "the-long-weekend" },
        { chapterId: "two", scenarioId: "the-angry-whale", exitKind: "strategic-acquisition" },
      ],
    });
    expect(doc.chapters[1]?.exitKind).toBe("strategic-acquisition");
    // SPARSE law both ways: an undeclared chapter grows NO key.
    expect("exitKind" in (doc.chapters[0] ?? {})).toBe(false);
  });

  it("all FOUR sale-family kinds ride; none is refused", () => {
    for (const kind of ["strategic-acquisition", "pe-platform", "pe-bolt-on", "asset-sale"] as const) {
      const doc = parseCampaignDoc({
        ...valid(),
        chapters: [{ chapterId: "one", scenarioId: "a" }, { chapterId: "two", scenarioId: "b", exitKind: kind }],
      });
      expect(doc.chapters[1]?.exitKind).toBe(kind);
    }
  });

  it("the OBSERVABILITY wall refuses ipo / management-buyout / wind-down BY NAME", () => {
    // No close mechanic observes these three in v0 — the sell-accepted grammar
    // is the ONLY exit the engine can see, so declaring one is authored fiction.
    for (const kind of ["ipo", "management-buyout", "wind-down"] as const) {
      expect(() =>
        parseCampaignDoc({
          ...valid(),
          chapters: [{ chapterId: "one", scenarioId: "a" }, { chapterId: "two", scenarioId: "b", exitKind: kind }],
        }),
      ).toThrow(new RegExp(`RESERVED at 'campaign\\.chapters\\[1\\]\\.exitKind'.*"${kind}"`));
    }
  });

  it("off-vocabulary refuses with BAD_ENUM naming all seven kinds", () => {
    // The refuted recon slug "mbo" is exactly the shape this wall exists for:
    // the doc's word is "Management buyout", never the acronym.
    let message = "";
    try {
      parseCampaignDoc({
        ...valid(),
        chapters: [{ chapterId: "one", scenarioId: "a", exitKind: "mbo" }],
      });
    } catch (error) {
      message = String((error as Error).message);
    }
    expect(message).toMatch(/^campaign: BAD_ENUM at 'campaign\.chapters\[0\]\.exitKind'/);
    for (const kind of CAMPAIGN_EXIT_KINDS) expect(message).toContain(`"${kind}"`);
    expect(() =>
      parseCampaignDoc({
        ...valid(),
        chapters: [{ chapterId: "one", scenarioId: "a", exitKind: 7 }],
      }),
    ).toThrow(/BAD_ENUM at 'campaign\.chapters\[0\]\.exitKind'/);
  });

  it("POSITION WALL SUPERSEDED (§E) — a declaring chapter may sit at ANY position", () => {
    // L-V2 landed a BAD_RANGE wall refusing non-final declarations ("the tour
    // ends where the company does"). The §E commission SUPERSEDES it the same
    // wave it is built: CAMPAIGN_EXIT's x-1 declares mid-arc because the tour
    // PLAYS ON the paid heir (§1.6 prestige). Placement is free; the runtime
    // DOC_LIE law in endings.ts is the guard — every declaring chapter answers
    // for its OWN close. Grammar walls below (enum/RESERVED) are UNTOUCHED.
    const mid = parseCampaignDoc({ ...three(), chapters: three().chapters.map((ch, i) => (i === 0 ? { ...ch, exitKind: "pe-platform" } : ch)) });
    expect(mid.chapters[0]?.exitKind).toBe("pe-platform");
    // The same kind on the LAST chapter of the same three-chapter tour parses.
    const last = three();
    (last.chapters[2] as Record<string, unknown>).exitKind = "pe-platform";
    expect(parseCampaignDoc(last).chapters[2]?.exitKind).toBe("pe-platform");
    // A single-chapter tour IS the final chapter.
    expect(
      parseCampaignDoc({ ...valid(), chapters: [{ chapterId: "one", scenarioId: "a", exitKind: "asset-sale" }] }).chapters[0]?.exitKind,
    ).toBe("asset-sale");
  });

  it("grammar precedes position — a broken value is broken wherever it sits", () => {
    // chapters[0] carries a RESERVED kind: the parseChapter wall (RESERVED)
    // fires at the boundary regardless of position — same for a BAD_ENUM kind.
    // (§E retired the position law; the grammar ordering it argued about stands.)
    const mid = three();
    (mid.chapters[0] as Record<string, unknown>).exitKind = "ipo";
    expect(() => parseCampaignDoc(mid)).toThrow(/RESERVED at 'campaign\.chapters\[0\]\.exitKind'/);
    const mid2 = three();
    (mid2.chapters[0] as Record<string, unknown>).exitKind = "trade-sale";
    expect(() => parseCampaignDoc(mid2)).toThrow(/BAD_ENUM at 'campaign\.chapters\[0\]\.exitKind'/);
  });

  it("the declaration round-trips the wire SPARSE — undeclared chapters emit no key", () => {
    const doc = parseCampaignDoc(three());
    const plain = toCampaignWire(doc);
    // canonicalJson, not JSON.stringify: the carry floors ride real bigints.
    expect(canonicalJson(plain)).not.toContain("exitKind");
    const declared = three();
    (declared.chapters[2] as Record<string, unknown>).exitKind = "pe-bolt-on";
    const parsed = parseCampaignDoc(declared);
    const wire = toCampaignWire(parsed);
    expect(wire.chapters).toEqual([
      { chapterId: "one", scenarioId: "the-long-weekend" },
      { chapterId: "two", scenarioId: "the-angry-whale" },
      { chapterId: "three", scenarioId: "the-hardest-lesson", tickCap: 300, exitKind: "pe-bolt-on" },
    ]);
    expect(parseCampaignDoc(fromCanonicalJson(canonicalJson(wire)))).toEqual(parsed);
  });
});
