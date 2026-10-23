/**
 * epilogueModel unit law — pure projection over the campaign ending plus
 * the optional payout / museum / succession plain-data props. Coverage per
 * §1.6: all three ending kinds, the exitPayout-present and exitPayout-
 * absent honest lines, museum provenance, succession lines, the 7 evidence
 * facts with NO_DATA honesty, explain payload presence, freeze, determinism.
 * Fixtures are shaped from the engine's own type files (campaign/endings.ts,
 * scenario/runner.ts, save/node.ts) — zero fabricated fields.
 */
import { describe, expect, it } from "vitest";
import type { CampaignEnding } from "@hh/sim-core/campaign";
import type { ScenarioExitPayout } from "@hh/sim-core/scenario";
import type { MuseumExhibitRecord, Succession } from "@hh/sim-core/save";
import { formatMoney, NO_DATA } from "../../chrome/numberLaw";
import { buildEpilogueView } from "../epilogueModel";

const BASE_EVIDENCE = {
  chapterOutcomes: [
    { chapterId: "a-1", outcome: "won" as const, stopReason: "win@240" },
    { chapterId: "b-2", outcome: "won" as const, stopReason: "survive@300" },
  ],
  medals: 4,
  scars: 2,
  deathStopReason: null,
};

function ending(
  over: { kind: string; title: string; epitaph: string } & Record<string, unknown>,
): CampaignEnding {
  const { kind, title, epitaph, ...evidence } = over;
  return {
    kind,
    title,
    epitaph,
    evidence: { ...BASE_EVIDENCE, ...evidence },
  } as unknown as CampaignEnding;
}

const OBITUARY = ending({
  kind: "obituary",
  title: "The Obituary",
  epitaph: 'The company died at "death-by-cause:churn" — Failure is Narrated, Not Punished.',
  deathStopReason: "death-by-cause:churn",
  scars: 5,
  chapterOutcomes: [
    { chapterId: "a-1", outcome: "won" as const, stopReason: "win@240" },
    { chapterId: "b-3", outcome: "lost" as const, stopReason: "death-by-cause:churn" },
  ],
  worstOutageSeconds: 904,
  costliestMistakeMicroUsd: 25_000_000n,
});

const EXIT = ending({
  kind: "exit",
  title: "The Exit",
  epitaph: "The long sale closed.",
  declaredExitKind: "strategic-acquisition",
  exitObserved: true,
  chapterOutcomes: [
    { chapterId: "c-7", outcome: "won" as const, stopReason: "win:sell-accepted-above:0@420" },
  ],
  reputationBps: 8_123,
  longestPerfectStreak: 33,
});

const QUIET = ending({
  kind: "quiet-handoff",
  title: "The Quiet Handoff",
  epitaph: "The company stood; the tour walked on.",
});

const PAYOUT = {
  exitKind: "strategic-acquisition",
  headlineOfferMicroUsd: 40_000_000_000n,
  cashSliceMicroUsd: 24_000_000_000n,
  adjustments: [
    { basis: "churn", factorBps: 9_500n },
    { basis: "concentration", factorBps: 9_800n },
  ],
} as unknown as ScenarioExitPayout;

const EXHIBIT = {
  id: "exhibit:hydra-first",
  sourceFacet: "codex",
  sourceRef: "codex:hydra",
  title: "First Hydra Neutralized",
  runId: "run-2",
  runSeed: 904n,
  acquiredAtTick: 118n,
  deprecated: false,
  memorialNote: null,
} as MuseumExhibitRecord;

const RETIRED = { ...EXHIBIT, id: "exhibit:old", deprecated: true, memorialNote: "kept by migration law" } as unknown as MuseumExhibitRecord;

describe("buildEpilogueView — all three §1.6 kinds", () => {
  it("renders the obituary with its verbatim death cause", () => {
    const view = buildEpilogueView({ ending: OBITUARY });
    expect(view.kind).toBe("obituary");
    expect(view.title).toBe("The Obituary");
    expect(view.epitaph).toContain("death-by-cause:churn");
    expect(view.death?.value).toBe("death-by-cause:churn");
    expect(view.death?.explain.formula).toContain("deathStopReason");
  });

  it("renders the exit with declared + observed lines", () => {
    const view = buildEpilogueView({ ending: EXIT });
    expect(view.kind).toBe("exit");
    expect(view.death).toBeNull();
    expect(view.declaredExit?.value).toBe("strategic-acquisition — observed — the sell-accepted verdict landed");
  });

  it("renders the quiet handoff with no death, no declaration", () => {
    const view = buildEpilogueView({ ending: QUIET });
    expect(view.kind).toBe("quiet-handoff");
    expect(view.death).toBeNull();
    expect(view.declaredExit).toBeNull();
  });

  it("tells a declared-but-never-observed exit honestly", () => {
    const declaredOnly = ending({
      kind: "obituary",
      title: "The Obituary",
      epitaph: "died short of the sale",
      deathStopReason: "death-by-cause:float",
      declaredExitKind: "management-buyout",
      exitObserved: false,
    });
    const view = buildEpilogueView({ ending: declaredOnly });
    expect(view.declaredExit?.value).toBe("management-buyout — declared, never observed — failure is narrated");
  });
});

describe("buildEpilogueView — the money at the end", () => {
  it("projects headline, slice and legs when the report carries a payout", () => {
    const view = buildEpilogueView({ ending: EXIT, payout: PAYOUT });
    expect(view.money?.exitKind).toBe("strategic-acquisition");
    expect(view.money?.headline.value).toBe(formatMoney(40_000_000_000n));
    expect(view.money?.slice.value).toBe(formatMoney(24_000_000_000n));
    expect(view.money?.legs.map((leg) => leg.label)).toEqual(["churn", "concentration"]);
    expect(view.money?.legs[0]?.value).toBe("9,500 bps of 10,000");
    expect(view.moneyAbsentLine).toBeNull();
  });

  it("states the absence when there is no payout — never a zero", () => {
    const view = buildEpilogueView({ ending: OBITUARY });
    expect(view.money).toBeNull();
    expect(view.moneyAbsentLine).toMatch(/never sold|died before/i);
  });

  it("treats an explicit null payout like absence (host mapping)", () => {
    const view = buildEpilogueView({ ending: QUIET, payout: null });
    expect(view.money).toBeNull();
    expect(view.moneyAbsentLine).not.toBeNull();
  });
});

describe("buildEpilogueView — succession, museum, evidence", () => {
  it("always carries the terminal-beat succession line", () => {
    const view = buildEpilogueView({ ending: OBITUARY });
    expect(view.successionFacts[0]?.value).toBe("b-3 — lost · death-by-cause:churn");
    expect(view.successionFacts[0]?.label).toBe("Final beat");
  });

  it("adds the save's succession row when handed one", () => {
    const succession = { type: "exit", exitKind: "strategic-acquisition" } as Succession;
    const view = buildEpilogueView({ ending: EXIT, succession });
    const row = view.successionFacts[1];
    expect(row?.label).toBe("Succession");
    expect(row?.value).toBe("exit · strategic-acquisition");
  });

  it("prints a plain failure_restart succession without a dangling separator", () => {
    const view = buildEpilogueView({
      ending: OBITUARY,
      succession: { type: "failure_restart", exitKind: null } as Succession,
    });
    expect(view.successionFacts[1]?.value).toBe("failure_restart");
  });

  it("marks shelf state and provenance for museum exhibits", () => {
    const view = buildEpilogueView({ ending: QUIET, museum: [EXHIBIT, RETIRED] });
    expect(view.museum[0]?.onShelf).toBe(true);
    expect(view.museum[0]?.provenance.value).toBe("run run-2 · seed 904 · tick 118");
    expect(view.museum[1]?.onShelf).toBe(false);
    expect(view.museum[1]?.note).toBe("kept by migration law");
  });

  it("keeps an empty shelf empty and honest", () => {
    const view = buildEpilogueView({ ending: QUIET });
    expect(view.museum).toEqual([]);
  });

  it("always renders the seven evidence facts, absent ones as NO_DATA", () => {
    const view = buildEpilogueView({ ending: QUIET });
    expect(view.facts.map((fact) => fact.label)).toEqual([
      "Medals",
      "Scars",
      "Reputation",
      "Worst outage",
      "Longest perfect streak",
      "Biggest customer MRR",
      "Costliest mistake",
    ]);
    expect(view.facts[2]?.value).toBe(NO_DATA);
    expect(view.facts[0]?.value).toBe("4");
    const full = buildEpilogueView({ ending: OBITUARY });
    expect(full.facts[3]?.value).toBe("904 s");
    expect(full.facts[6]?.value).toBe(formatMoney(25_000_000n));
  });

  it("never aggregates: medals/scars values are the engine's own numbers", () => {
    const view = buildEpilogueView({ ending: OBITUARY });
    expect(view.facts[0]?.value).toBe(String(OBITUARY.evidence.medals));
    expect(view.facts[1]?.value).toBe(String(OBITUARY.evidence.scars));
    expect(view.facts[0]?.explain.formula).toContain("never sums");
  });
});

describe("buildEpilogueView — discipline", () => {
  it("every fact ships an explain payload naming its engine field", () => {
    const view = buildEpilogueView({ ending: EXIT, payout: PAYOUT, museum: [EXHIBIT] });
    const allFacts = [
      ...view.facts,
      ...view.successionFacts,
      view.money?.headline,
      view.money?.slice,
      ...(view.money?.legs ?? []),
      view.declaredExit,
      view.museum[0]?.provenance,
    ].filter((fact) => fact !== undefined && fact !== null);
    for (const fact of allFacts) {
      expect(fact.explain.formula.length).toBeGreaterThan(0);
      expect(fact.explain.inputs.length).toBeGreaterThan(0);
    }
  });

  it("freezes the whole view and every row inside it", () => {
    const view = buildEpilogueView({ ending: EXIT, payout: PAYOUT, museum: [EXHIBIT], succession: { type: "exit", exitKind: null } as Succession });
    expect(Object.isFrozen(view)).toBe(true);
    expect(Object.isFrozen(view.facts)).toBe(true);
    expect(Object.isFrozen(view.facts[0])).toBe(true);
    expect(Object.isFrozen(view.money)).toBe(true);
    expect(Object.isFrozen(view.money?.legs[0])).toBe(true);
    expect(Object.isFrozen(view.museum[0])).toBe(true);
  });

  it("is deterministic: twin builds are deep-equal", () => {
    const input = { ending: EXIT, payout: PAYOUT, museum: [EXHIBIT] };
    expect(buildEpilogueView(input)).toEqual(buildEpilogueView(input));
  });
});
