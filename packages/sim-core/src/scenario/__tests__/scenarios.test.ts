/** scenarios.test.ts — the shipped library is twenty-nine, cites §1.5
 *  verbatim, survives a JSON round-trip, and parses to the same documents
 *  it ships as frozen constants (the import-time wall is not decorative). */
import { describe, expect, it } from "vitest";

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  SHIPPED_SCENARIO_IDS,
  SHIPPED_SCENARIO_WIRES,
  SHIPPED_SCENARIOS,
  parseScenarioDoc,
  shippedScenario,
} from "../index.ts";
import type { ScenarioWire } from "../index.ts";

const SPEC_HEADINGS: Readonly<Record<string, string>> = {
  "the-long-weekend": "The Long Weekend",
  "deadbeat-quarter": "Deadbeat Quarter",
  "the-angry-whale": "The Angry Whale",
  "collections-week": "Collections Week",
  metastable: "Metastable",
  "metastable-corpus": "Metastable",
  "launch-day": "Launch Day",
  "ddos-season": "DDoS Season",
  "runway-six-weeks": "Runway: 6 Weeks",
  "the-price-hike": "The Price Hike",
  "the-quiet-month": "The Quiet Month",
  "post-breach-aftermath": "Post-Breach",
  "contract-recompete": "Contract Recompete",
  "free-tier-flood": "Free Tier Flood",
  "the-sev-0": "The Sev-0",
  "the-covenant": "Covenant",
  "review-bomb": "Review Bomb",
  "understaffed-sunday": "The Understaffed Sunday",
  "chargeback-wave": "The Chargeback Wave",
  "the-slow-week-after": "The Slow Week After",
  "someone-elses-outage": "Someone Else's Outage",
  "the-rfo": "The RFO",
  "the-threshold-day": "The Threshold Day",
  "the-founder-bus-factor": "The Founder Bus Factor",
  "the-change-freeze": "The Change Freeze",
  "free-tier-flood-corpus": "Free Tier Flood",
  "the-copycat": "The Copycat",
  "the-ransom-customer": "The Ransom Customer",
  "understaffed-sunday-triage": "The Understaffed Sunday",
};

describe("the shipped set", () => {
  it("is exactly the twenty-nine shipped §1.5 wires (twenty-seven missions; Metastable, Free Tier Flood and The Understaffed Sunday each ship twice)", () => {
    expect(SHIPPED_SCENARIO_IDS).toEqual([
      "the-long-weekend",
      "deadbeat-quarter",
      "the-angry-whale",
      "collections-week",
      "metastable",
      "metastable-corpus",
      "launch-day",
      "ddos-season",
      "runway-six-weeks",
      "the-price-hike",
      "the-quiet-month",
      "post-breach-aftermath",
      "contract-recompete",
      "free-tier-flood",
      "the-sev-0",
      "the-covenant",
      "review-bomb",
      "understaffed-sunday",
      "chargeback-wave",
      "the-slow-week-after",
      "someone-elses-outage",
      "the-rfo",
      "the-threshold-day",
      "the-founder-bus-factor",
      "the-change-freeze",
      "free-tier-flood-corpus",
      "the-ransom-customer",
      "the-copycat",
      "understaffed-sunday-triage",
    ]);
  });

  it("every doc's id matches its registry key and its wire", () => {
    for (const id of SHIPPED_SCENARIO_IDS) {
      const doc = shippedScenario(id);
      expect(doc.id).toBe(id);
      expect(SHIPPED_SCENARIOS[id]).toBe(doc);
      expect(SHIPPED_SCENARIO_WIRES[id]?.id).toBe(id);
    }
  });

  it("unknown ids fail loud, never silent", () => {
    expect(() => shippedScenario("the-sleepy-otter")).toThrow(/not shipped/);
  });
});

describe("wire honesty", () => {
  for (const id of SHIPPED_SCENARIO_IDS) {
    it(`${id}: the wire is plain JSON and re-parsing it reproduces the frozen doc`, () => {
      const wire = SHIPPED_SCENARIO_WIRES[id] as ScenarioWire;
      const roundTrip = JSON.parse(JSON.stringify(wire)) as ScenarioWire;
      expect(roundTrip).toEqual(wire);
      const reparsed = parseScenarioDoc(roundTrip);
      expect(reparsed).toEqual(SHIPPED_SCENARIOS[id]);
    });

    it(`${id}: every burn and cliff lands inside the clock`, () => {
      const doc = shippedScenario(id);
      for (const draft of doc.limits.opex) expect(draft.atMinute).toBeLessThanOrEqual(doc.limits.maxSimMinutes);
      for (const spec of doc.contracts) {
        expect(Math.ceil((spec.contract.termEndMin * 7) / 720)).toBeLessThanOrEqual(doc.limits.maxSimMinutes);
      }
    });

    it(`${id}: cites ${SPEC_HEADINGS[id]} verbatim from the §1.5 library`, () => {
      const doc = shippedScenario(id);
      expect(doc.specRef).toContain(SPEC_HEADINGS[id] ?? "");
      const spec = readFileSync(fileURLToPath(new URL("../../../../../hosting_game.md", import.meta.url)), "utf8");
      const headingLine = spec
        .split("\n")
        .find((line) => line.startsWith("#") && line.includes(SPEC_HEADINGS[id] ?? "^never^"));
      expect(headingLine ?? "").toContain(SPEC_HEADINGS[id] ?? "");
      if (doc.specLine !== null) {
        const lines = spec.split("\n");
        const window = lines.slice(Math.max(0, doc.specLine - 12), doc.specLine + 12).join("\n");
        expect(window).toContain(SPEC_HEADINGS[id] ?? "");
      }
    });
  }

  it("briefs stay under the wall and names are human", () => {
    for (const id of SHIPPED_SCENARIO_IDS) {
      const doc = shippedScenario(id);
      expect(doc.brief.length).toBeGreaterThan(20);
      expect(doc.name.length).toBeGreaterThan(3);
    }
  });
});
