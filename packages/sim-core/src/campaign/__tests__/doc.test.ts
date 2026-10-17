/**
 * doc.test.ts — the CampaignDoc boundary wall (L-CP1).
 */
import { describe, expect, it } from "vitest";
import {
  CAMPAIGN_SCHEMA,
  CARRY_CAST_CAP,
  CARRY_STAFF_CAP,
  CampaignError,
  parseCampaignDoc,
  toCampaignWire,
} from "../index";
import { canonicalJson, fromCanonicalJson } from "../../save/index";

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
