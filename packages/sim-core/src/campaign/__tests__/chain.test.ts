/**
 * chain.test.ts — the campaign chapter loop (L-CP1): seed grammar, win→settle,
 * death→succession (§9.9), bootstrap one-spend law, carry bridging, and a
 * 2-chapter SMOKING campaign over the REAL scenario authority.
 */
import { describe, expect, it } from "vitest";
import { asEntityId, asMoney, asRunSeed } from "../../types";
import type { EntityId, MoneyUnit, RunSeed } from "../../types";
import {
  applyInheritanceManifest,
  emptyLineageGraph,
  foundCompany,
  getNode,
  parseRunInstance,
  settleRun,
  spawnChildFromParent,
} from "../../save/index";
import type { InheritanceManifest, LineageGraph, SettlementWrite } from "../../save/index";
import { runScenario, shippedScenario } from "../../scenario/index";
import type { ScenarioDoc, ScenarioReport, ScenarioRunConfig } from "../../scenario/index";
import {
  CAMPAIGN_SCHEMA,
  CampaignError,
  childManifestSpent,
  digestCampaignReport,
  parseCampaignDoc,
  runCampaign,
  seedForChapter,
  spendInheritanceOnChild,
} from "../index";
import type { CampaignAuthority, CampaignDoc } from "../index";

function campaignDoc(chapters: { chapterId: string; scenarioId: string; tickCap?: number; exitKind?: string }[]): CampaignDoc {
  return parseCampaignDoc({
    schema: CAMPAIGN_SCHEMA, id: "chain-test", name: "Chain Test",
    chapters,
    carry: { cashFloor: { thresholdMicroUsd: 5_000n, bridgeMicroUsd: 1_000n }, scarCapRide: true },
  });
}

function founderGraph(unlocks: string[] = []): { graph: LineageGraph; nodeId: EntityId } {
  let graph = emptyLineageGraph();
  ({ graph } = foundCompany(graph, { id: "co", name: "Chain Co", eraOrigin: "2026", foundedAtTick: 0n }));
  if (unlocks.length > 0) {
    const writes: SettlementWrite[] = unlocks.map((node) => ({
      facet: "nodesUnlocked",
      payload: { node, via: "testimony", scarRef: null, incidentRef: null, stamp: null, stampAtTick: null, handwritingOwnerStaffId: null, faded: 0 },
    }));
    graph = settleRun(graph, asEntityId("co"), parseRunInstance({
      runId: "pre-seed", mode: "campaign", runSeed: 1n, startedAtTick: 0n, endedAtTick: 1n, outcome: "won",
      batch: { runId: "pre-seed", mode: "campaign", committedAtTick: 1n, writes },
    }));
  }
  return { graph, nodeId: asEntityId("co") };
}

interface ScriptedRun {
  readonly outcome: "won" | "lost" | "timeout";
  readonly stopReason?: string;
  readonly cashEnd?: bigint;
  readonly foreignOutcome?: string;
  /** L-V3: forge the runner's PAID close (the exitPayout key the real runner
   *  grows only on won + sell-grammar + declaration). Absent ⇒ the forged
   *  report grows NO key — the ordinary-win posture byte-stands. */
  readonly exitPayout?: {
    readonly exitKind: string;
    readonly headlineOfferMicroUsd: bigint;
    readonly cashSliceMicroUsd: bigint;
  };
}

function scriptedAuthority(_doc: CampaignDoc, script: readonly ScriptedRun[]): CampaignAuthority & { readonly seen: { doc: ScenarioDoc; seed: RunSeed; config: ScenarioRunConfig }[] } {
  const seen: { doc: ScenarioDoc; seed: RunSeed; config: ScenarioRunConfig }[] = [];
  return {
    seen,
    docOf: (scenarioId) => ({ schemaVersion: 1, id: scenarioId, name: `Doc ${scenarioId}`, contracts: [], limits: { initialFreeMicroUsd: 250n } }) as unknown as ScenarioDoc,
    run: (d, seed, config) => {
      const step = script[seen.length] ?? script[script.length - 1];
      seen.push({ doc: d, seed, config });
      return {
        scenarioId: d.id, runSeed: seed,
        outcome: (step?.foreignOutcome ?? step?.outcome ?? "won") as ScenarioReport["outcome"],
        stopReason: step?.stopReason ?? "win@10",
        endTick: 10n, endMinute: 10, endDigest: "000000000000000a",
        observation: {}, objectives: { win: [], lose: [] }, trace: {},
        cashStartMicroUsd: d.limits.initialFreeMicroUsd, cashEndMicroUsd: step?.cashEnd ?? 4_000n,
        ...(step?.exitPayout === undefined ? {} : { exitPayout: step.exitPayout }),
      } as unknown as ScenarioReport;
    },
  };
}

describe("seedForChapter (U4 grammar)", () => {
  it("is stable per (chapterId, seed) and divergent across chapters", () => {
    expect(seedForChapter(asRunSeed(904n), "one")).toBe(seedForChapter(asRunSeed(904n), "one"));
    expect(seedForChapter(asRunSeed(904n), "one")).not.toBe(seedForChapter(asRunSeed(904n), "two"));
    expect(seedForChapter(asRunSeed(904n), "one")).not.toBe(seedForChapter(asRunSeed(905n), "one"));
  });
});

describe("runCampaign — win path settles through the executor", () => {
  it("plays both chapters, settles facts, and bridges carry cash", () => {
    const doc = campaignDoc([{ chapterId: "one", scenarioId: "s-a" }, { chapterId: "two", scenarioId: "s-b", tickCap: 99 }]);
    const { graph, nodeId } = founderGraph();
    const authority = scriptedAuthority(doc, [{ outcome: "won", cashEnd: 100n }, { outcome: "won", cashEnd: 3_000n }]);
    const report = runCampaign(doc, asRunSeed(904n), { graph, nodeId, authority });

    expect(report.chapterRecords.map((r) => r.outcome)).toEqual(["won", "won"]);
    expect(report.chapterRecords[0]?.settledFacets).toEqual(["attributionEvents", "finances", "museum", "medals"]);
    expect(report.edgesSpawned.length).toBe(0);
    const node = getNode(report.finalGraph, nodeId);
    expect(node.finances.cashMicroUsd).toBe(3_000n);
    expect(node.museum.length).toBe(2);
    // ch1 ends at 100 < floor 5000 ⇒ ch2 opens on the 1000 bridge; tickCap rides the config
    expect(authority.seen[0]?.config).toEqual({});
    expect(authority.seen[1]?.doc.limits.initialFreeMicroUsd).toBe(1_000n);
    expect(authority.seen[1]?.config).toEqual({ tickCap: 99 });
    // chapter 0 runs the AUTHORED doc's cash (no carry override)
    expect(authority.seen[0]?.doc.limits.initialFreeMicroUsd).toBe(250n);
    expect(authority.seen[1]?.doc).not.toBe(authority.seen[0]?.doc);
    expect(authority.seen[0]?.seed).toBe(seedForChapter(asRunSeed(904n), "one"));
    expect(authority.seen[1]?.seed).toBe(seedForChapter(asRunSeed(904n), "two"));
  });

  it("seedOffset re-bases every chapter seed", () => {
    const doc = campaignDoc([{ chapterId: "one", scenarioId: "s-a" }]);
    const { graph, nodeId } = founderGraph();
    const a = runCampaign(doc, asRunSeed(904n), { graph, nodeId, authority: scriptedAuthority(doc, [{ outcome: "won" }]) });
    const b = runCampaign(doc, asRunSeed(904n), { graph, nodeId, authority: scriptedAuthority(doc, [{ outcome: "won" }]), seedOffset: 1 });
    expect(a.chapterRecords[0]?.runSeed).toBe(seedForChapter(asRunSeed(904n), "one"));
    expect(b.chapterRecords[0]?.runSeed).toBe(seedForChapter(asRunSeed(905n), "one"));
    expect(a.chapterRecords[0]?.runSeed).not.toBe(b.chapterRecords[0]?.runSeed);
  });

  it("refuses a foreign outcome from the authority", () => {
    const doc = campaignDoc([{ chapterId: "one", scenarioId: "s-a" }]);
    const { graph, nodeId } = founderGraph();
    expect(() => runCampaign(doc, asRunSeed(904n), { graph, nodeId, authority: scriptedAuthority(doc, [{ outcome: "won", foreignOutcome: "ascended" }]) }))
      .toThrow(/BAD_ENUM at 'campaign "chain-test" chapter "one"'/);
  });
});

describe("runCampaign — death → succession (§9.9)", () => {
  it("spawns a failure_restart child whose FIRST chapter spends the manifest once", () => {
    const doc = campaignDoc([{ chapterId: "one", scenarioId: "s-a" }, { chapterId: "two", scenarioId: "s-b" }]);
    const { graph, nodeId } = founderGraph(["n-1", "n-2", "n-3", "n-4"]);
    const authority = scriptedAuthority(doc, [{ outcome: "lost", stopReason: "lose:death-by-cause:any@44", cashEnd: 9n }, { outcome: "won", cashEnd: 2_000n }]);
    const report = runCampaign(doc, asRunSeed(904n), { graph, nodeId, authority });

    expect(report.chapterRecords.map((r) => [r.outcome, r.bootstrapped])).toEqual([["lost", false], ["won", true]]);
    expect(report.edgesSpawned.length).toBe(1);
    const edge = report.edgesSpawned[0];
    expect(edge?.type).toBe("failure_restart");
    expect(edge?.manifest.cashSliceMicroUsd).toBeNull(); // failure is poorer, not paid — machine-pinned
    const childId = report.finalNodeId;
    expect(childId).toBe("successor:chain-test:0");
    const child = getNode(report.finalGraph, childId);
    expect(child.parentId).toBe(nodeId);
    expect(childManifestSpent(child)).toBe(true);
    // the 3-node law rode the ledger: 3 kept + 4th via milestone
    expect(child.nodesUnlocked.map((u) => `${u.node}:${u.via}`)).toEqual(["n-1:testimony", "n-2:testimony", "n-3:testimony", "n-4:milestone"]);
    // re-spend refuses by name
    expect(() => spendInheritanceOnChild(report.finalGraph, childId)).toThrow(/manifest already spent/);
    // founder spend refuses
    expect(() => spendInheritanceOnChild(graph, nodeId)).toThrow(/founder company/);
  });

  it("an un-bootstrapped child starts on ZERO inherited cash", () => {
    const { graph, nodeId } = founderGraph(["n-1", "n-2", "n-3"]);
    const parent = getNode(graph, nodeId);
    const manifest: InheritanceManifest = {
      keptNodes: [asEntityId("n-1"), asEntityId("n-2"), asEntityId("n-3")] as unknown as InheritanceManifest["keptNodes"],
      doctrine: { id: asEntityId("doctrine:x"), textRef: "x", adoptedAtTick: 0n },
      playbook: [],
      cashSliceMicroUsd: null,
      failureOnlyUnlock: null,
      handwritingParent: parent.id,
    };
    const { graph: spawned, child } = spawnChildFromParent(graph, nodeId, { childId: "heir", name: "Heir", foundedAtTick: 1n, manifest, succession: "failure_restart" });
    expect(child.finances.cashMicroUsd).toBe(0n);
    const spent = spendInheritanceOnChild(spawned, asEntityId("heir"));
    expect(spent.node.finances.cashMicroUsd).toBe(0n); // null slice spends to zero, never to a payout
    expect(childManifestSpent(spent.node)).toBe(true);
  });

  it("refuses succession when fewer than 3 nodes are unlocked", () => {
    const doc = campaignDoc([{ chapterId: "one", scenarioId: "s-a" }, { chapterId: "two", scenarioId: "s-b" }]);
    const { graph, nodeId } = founderGraph(["n-1", "n-2"]);
    const authority = scriptedAuthority(doc, [{ outcome: "lost", stopReason: "lose:death-by-cause:any@44" }]);
    expect(() => runCampaign(doc, asRunSeed(904n), { graph, nodeId, authority })).toThrow(/3-node law needs 3 distinct unlocked nodes, found 2/);
  });

  it("a non-death loss ends the campaign where it stands; a last-chapter death spawns nobody", () => {
    const doc = campaignDoc([{ chapterId: "one", scenarioId: "s-a" }, { chapterId: "two", scenarioId: "s-b" }, { chapterId: "three", scenarioId: "s-c" }]);
    const { graph, nodeId } = founderGraph(["n-1", "n-2", "n-3"]);
    const stalled = runCampaign(doc, asRunSeed(904n), { graph, nodeId, authority: scriptedAuthority(doc, [{ outcome: "lost", stopReason: "guard:freeCashDepleted@3" }]) });
    expect(stalled.chapterRecords.length).toBe(1);
    expect(stalled.edgesSpawned.length).toBe(0);
    const timedOut = runCampaign(doc, asRunSeed(904n), { graph, nodeId, authority: scriptedAuthority(doc, [{ outcome: "timeout", stopReason: "timeout@240" }]) });
    expect(timedOut.chapterRecords.length).toBe(1);
    const lastDeath = runCampaign(campaignDoc([{ chapterId: "one", scenarioId: "s-a" }]), asRunSeed(904n), { graph, nodeId, authority: scriptedAuthority(doc, [{ outcome: "lost", stopReason: "lose:death-by-cause:any@44" }]) });
    expect(lastDeath.chapterRecords.length).toBe(1);
    expect(lastDeath.edgesSpawned.length).toBe(0);
  });

  it("succession on the 4th sorted unlock marks it via:milestone only for the failure-only node", () => {
    const doc = campaignDoc([{ chapterId: "one", scenarioId: "s-a" }, { chapterId: "two", scenarioId: "s-b" }]);
    const { graph, nodeId } = founderGraph(["n-9", "n-8", "n-7", "n-6", "n-5"]);
    const authority = scriptedAuthority(doc, [{ outcome: "lost", stopReason: "lose:death-by-cause:any@44" }, { outcome: "won" }]);
    const report = runCampaign(doc, asRunSeed(904n), { graph, nodeId, authority });
    const edge = report.edgesSpawned[0];
    expect(edge?.manifest.keptNodes).toEqual([asEntityId("n-5"), asEntityId("n-6"), asEntityId("n-7")]);
    expect(edge?.manifest.failureOnlyUnlock).toBe(asEntityId("n-8"));
  });
});

describe("runCampaign — the exit edge spawns on a PAID close (§E, L-V3)", () => {
  const PAID: ScriptedRun = {
    outcome: "won",
    stopReason: "win:sell-accepted-above:0@60",
    cashEnd: 500n,
    exitPayout: { exitKind: "strategic-acquisition", headlineOfferMicroUsd: 30_000n, cashSliceMicroUsd: 1_200n },
  };

  it("won + payout grows the exit edge: slice rides, gift FORCED null, the heir plays on", () => {
    const doc = campaignDoc([
      { chapterId: "one", scenarioId: "s-a", exitKind: "strategic-acquisition" },
      { chapterId: "two", scenarioId: "s-b" },
    ]);
    const { graph, nodeId } = founderGraph(["n-1", "n-2", "n-3", "n-4"]);
    const authority = scriptedAuthority(doc, [PAID, { outcome: "won", cashEnd: 2_000n }]);
    const report = runCampaign(doc, asRunSeed(904n), { graph, nodeId, authority });

    // the declaring record carries the sparse stamp; the heir's record stays key-absent
    expect(report.chapterRecords[0]?.exitKind).toBe("strategic-acquisition");
    expect("exitKind" in (report.chapterRecords[1] ?? {})).toBe(false);
    // the exit EDGE: paid slice rides, gift is refused by law (lineage: an
    // heir that was just PAID does not also get the good datacenter)
    expect(report.edgesSpawned.length).toBe(1);
    const edge = report.edgesSpawned[0];
    expect(edge?.type).toBe("exit");
    expect(edge?.manifest.cashSliceMicroUsd).toBe(1_200n); // machine-pinned: PAID, not null
    expect(edge?.manifest.failureOnlyUnlock).toBeNull(); // the n-4 gift is FORCED away
    expect(edge?.manifest.keptNodes).toEqual([asEntityId("n-1"), asEntityId("n-2"), asEntityId("n-3")]);
    // play-on: the heir is the active node and the 3-node law applies to exit edges too
    expect(report.finalNodeId).toBe("successor:chain-test:0");
    expect(report.chapterRecords[1]?.nodeId).toBe("successor:chain-test:0");
    expect(report.chapterRecords[1]?.bootstrapped).toBe(true);
    const child = getNode(report.finalGraph, report.finalNodeId);
    expect(child.nodesUnlocked.map((u) => `${u.node}:${u.via}`)).toEqual(["n-1:testimony", "n-2:testimony", "n-3:testimony"]);
    expect(childManifestSpent(child)).toBe(true);
    // the declaration reaches the runner as its own config key (the chain never
    // interprets it — the runner's exit wall owns semantics)
    expect(authority.seen[0]?.config).toEqual({ exitDeclaration: { exitKind: "strategic-acquisition" } });
  });

  it("the exitFunded law at the chain seam: the heir opens ON THE PROCEEDS, never the bridge", () => {
    // carry floor 5_000 / bridge 1_000; the slice 1_200 sits UNDER the floor —
    // the old unconditional bridge law would have opened this chapter at
    // 1_000 (POORER than the money the sale just paid). Falsifier: revert the
    // exitFunded carry rule and this pin reddens.
    const doc = campaignDoc([
      { chapterId: "one", scenarioId: "s-a", exitKind: "pe-platform" },
      { chapterId: "two", scenarioId: "s-b" },
    ]);
    const { graph, nodeId } = founderGraph(["n-1", "n-2", "n-3"]);
    const authority = scriptedAuthority(doc, [
      { outcome: "won", stopReason: "win:sell-accepted-above:0@60", cashEnd: 500n, exitPayout: { exitKind: "pe-platform", headlineOfferMicroUsd: 30_000n, cashSliceMicroUsd: 1_200n } },
      { outcome: "won", cashEnd: 2_000n },
    ]);
    runCampaign(doc, asRunSeed(904n), { graph, nodeId, authority });
    expect(authority.seen[1]?.doc.limits.initialFreeMicroUsd).toBe(1_200n); // the slice, verbatim
  });

  it("exitFunded is consumed EXACTLY ONCE — the heir's SECOND chapter lives on the ordinary bridge law", () => {
    const doc = campaignDoc([
      { chapterId: "one", scenarioId: "s-a", exitKind: "strategic-acquisition" },
      { chapterId: "two", scenarioId: "s-b" },
      { chapterId: "three", scenarioId: "s-c" },
    ]);
    const { graph, nodeId } = founderGraph(["n-1", "n-2", "n-3"]);
    const authority = scriptedAuthority(doc, [PAID, { outcome: "won", cashEnd: 900n }, { outcome: "won", cashEnd: 4_000n }]);
    const report = runCampaign(doc, asRunSeed(904n), { graph, nodeId, authority });
    expect(authority.seen[1]?.doc.limits.initialFreeMicroUsd).toBe(1_200n); // heir's first chapter: paid
    expect(report.chapterRecords[1]?.bootstrapped).toBe(true);
    expect(authority.seen[2]?.doc.limits.initialFreeMicroUsd).toBe(1_000n); // second chapter: ordinary bridge (900 < floor 5_000)
    expect(report.chapterRecords[2]?.bootstrapped).toBe(false);
    expect(report.edgesSpawned.length).toBe(1); // the win at 'three' grows no payout ⇒ no second edge
  });

  it("a terminal declaring chapter that SELLS still spawns — the tour halts with the heir in graph", () => {
    const doc = campaignDoc([{ chapterId: "one", scenarioId: "s-a", exitKind: "strategic-acquisition" }]);
    const { graph, nodeId } = founderGraph(["n-1", "n-2", "n-3"]);
    const authority = scriptedAuthority(doc, [PAID]);
    const report = runCampaign(doc, asRunSeed(904n), { graph, nodeId, authority });
    expect(report.chapterRecords.length).toBe(1);
    expect(report.edgesSpawned.length).toBe(1);
    expect(report.edgesSpawned[0]?.type).toBe("exit");
    expect(report.finalNodeId).toBe("successor:chain-test:0");
    const heir = getNode(report.finalGraph, report.finalNodeId);
    expect(heir.identity.name).toBe("Successor of Chain Co");
    expect(heir.parentId).toBe(nodeId);
  });

  it("tickCap, declaration and the catalog arm COEXIST in one config; un-armed chapters key-stand", () => {
    const doc = campaignDoc([
      { chapterId: "one", scenarioId: "s-a", exitKind: "pe-platform" },
      { chapterId: "two", scenarioId: "s-b", tickCap: 7 },
    ]);
    const { graph, nodeId } = founderGraph();
    const rates = new Map<string, MoneyUnit>([["plan:x", asMoney(9n)]]);
    const authority = scriptedAuthority(doc, [{ outcome: "won" }, { outcome: "won" }]);
    const report = runCampaign(doc, asRunSeed(904n), { graph, nodeId, authority, sellMarketRates: new Map([["one", rates]]) });
    // chapter one: declared, NO tickCap, catalog armed — exitDeclaration + sellMarketRates ride
    expect(authority.seen[0]?.config).toEqual({ exitDeclaration: { exitKind: "pe-platform" }, sellMarketRates: rates });
    // chapter two: undeclared, NO catalog entry for its chapterId — the shape
    // byte-stands at { tickCap } exactly (the shipped-tour posture)
    expect(authority.seen[1]?.config).toEqual({ tickCap: 7 });
    // won with NO payout ⇒ NO exit edge — the ordinary win branch byte-stands
    expect(report.edgesSpawned.length).toBe(0);
    expect("exitKind" in (report.chapterRecords[0] ?? {})).toBe(true); // the RECORD stamp is declaration-driven…
    expect(report.chapterRecords[0]?.exitKind).toBe("pe-platform");
  });
});

describe("SMOKING campaign — real scenario authority, two shipped chapters", () => {
  const doc = parseCampaignDoc({
    schema: CAMPAIGN_SCHEMA, id: "trilogy", name: "The Long Weekend Trilogy",
    chapters: [{ chapterId: "one", scenarioId: "the-long-weekend" }, { chapterId: "two", scenarioId: "the-angry-whale" }],
    // bridge pinned to the whale's OWN authored cash ⇒ chapter two is the
    // byte-identical plain run (applyCarryToDoc identity) — the win is the
    // shipped baseline, not a re-authored bet.
    carry: { cashFloor: { thresholdMicroUsd: 1_000_000_000_000_000n, bridgeMicroUsd: 40_000_000n }, scarCapRide: true },
  });
  const authority: CampaignAuthority = { docOf: (id) => shippedScenario(id), run: (d, s, c) => runScenario(d, s, c) };

  function freshGraph(): { graph: LineageGraph; nodeId: EntityId } {
    let graph = emptyLineageGraph();
    ({ graph } = foundCompany(graph, { id: "co", name: "Trilogy Co", eraOrigin: "2026", foundedAtTick: 0n }));
    return { graph, nodeId: asEntityId("co") };
  }

  it("both chapters win with the settled ledger to prove the loop", async () => {
    const { graph, nodeId } = freshGraph();
    const report = runCampaign(doc, asRunSeed(904n), { graph, nodeId, authority });
    expect(report.chapterRecords.map((r) => [r.scenarioId, r.stopReason])).toEqual([
      ["the-long-weekend", "win@240"],
      ["the-angry-whale", "win@200"],
    ]);
    // seed grammar goldens (deterministic function of (chapterId, baseSeed))
    expect(report.chapterRecords[0]?.runSeed).toBe(seedForChapter(asRunSeed(904n), "one"));
    expect(report.chapterRecords[1]?.runSeed).toBe(seedForChapter(asRunSeed(904n), "two"));
    expect(report.chapterRecords[1]?.runSeed).not.toBe(report.chapterRecords[0]?.runSeed);
    const node = getNode(report.finalGraph, nodeId);
    expect(node.finances.cashMicroUsd).toBe(report.chapterRecords[1]?.cashEndMicroUsd);
    expect(node.medals.length).toBe(2);
    expect(node.museum.length).toBe(2);
    expect(node.attributionEvents.map((e) => e.magnitude)).toEqual([65536n, 65536n]);
  }, 60_000);

  it("twin campaigns are byte-identical and a foreign seed diverges", async () => {
    const a = runCampaign(doc, asRunSeed(904n), { ...freshGraph(), authority });
    const b = runCampaign(doc, asRunSeed(904n), { ...freshGraph(), authority });
    expect(digestCampaignReport(a)).toBe(digestCampaignReport(b));
    const c = runCampaign(doc, asRunSeed(905n), { ...freshGraph(), authority });
    expect(digestCampaignReport(c)).not.toBe(digestCampaignReport(a));
    expect(c.chapterRecords.map((r) => r.outcome)).toEqual(["won", "won"]);
  }, 120_000);

  it("digestCampaignReport is ×100 stable on one report", async () => {
    const { graph, nodeId } = freshGraph();
    const report = runCampaign(doc, asRunSeed(904n), { graph, nodeId, authority });
    const digests = new Set<string>();
    for (let i = 0; i < 100; i += 1) digests.add(digestCampaignReport(report));
    expect(digests.size).toBe(1);
    expect([...digests][0]).toMatch(/^[0-9a-f]{16}$/);
  }, 60_000);
});

describe("campaign error surface", () => {
  it("CampaignError grammar is house-standard", () => {
    expect(new CampaignError("X at 'y': z").message).toBe("campaign: X at 'y': z");
  });

  it("runCampaign propagates authority docOf failures (host resolves ids)", () => {
    const doc = campaignDoc([{ chapterId: "one", scenarioId: "missing" }]);
    const { graph, nodeId } = founderGraph();
    const authority: CampaignAuthority = {
      docOf: () => {
        throw new Error("unknown scenario");
      },
      run: () => expect.unreachable(),
    };
    expect(() => runCampaign(doc, asRunSeed(904n), { graph, nodeId, authority })).toThrow(/unknown scenario/);
  });
});

describe("runCampaign — the timeout posture", () => {
  it("settles facts and a memorial, never cash or medals, and stops", () => {
    const doc = campaignDoc([{ chapterId: "one", scenarioId: "s-a" }, { chapterId: "two", scenarioId: "s-b" }]);
    const { graph, nodeId } = founderGraph();
    const authority = scriptedAuthority(doc, [{ outcome: "timeout", stopReason: "timeout@120", cashEnd: 7_777n }]);
    const report = runCampaign(doc, asRunSeed(904n), { graph, nodeId, authority });
    expect(report.chapterRecords[0]?.settledFacets).toEqual(["attributionEvents", "museum"]);
    expect(report.chapterRecords[0]?.outcome).toBe("timeout");
    expect(report.chapterRecords.length).toBe(1); // timeout is an ending, not a death — no successor, no next chapter
    expect(report.edgesSpawned.length).toBe(0);
    const node = getNode(report.finalGraph, nodeId);
    expect(node.finances.cashMicroUsd).toBe(0n); // cash never rides a timeout — the 7_777 dies with the run
    expect(node.attributionEvents[0]?.magnitude).toBe(0n); // a timeout neither builds nor breaks the Multiple
    expect(node.museum[0]?.memorialNote).toBe("timeout@120");
    expect(node.medals.length).toBe(0);
  });
});

describe("applyInheritanceManifest — the seam's own law (machine-pinned)", () => {
  it("is value-idempotent: re-applying a null-slice manifest still mints zero, never a payout", () => {
    const { graph, nodeId } = founderGraph(["n-1", "n-2", "n-3"]);
    const parent = getNode(graph, nodeId);
    const manifest: InheritanceManifest = {
      keptNodes: [asEntityId("n-1"), asEntityId("n-2"), asEntityId("n-3")] as unknown as InheritanceManifest["keptNodes"],
      doctrine: { id: asEntityId("doctrine:x"), textRef: "x", adoptedAtTick: 0n },
      playbook: [],
      cashSliceMicroUsd: null,
      failureOnlyUnlock: null,
      handwritingParent: parent.id,
    };
    const { child } = spawnChildFromParent(graph, nodeId, { childId: "heir", name: "Heir", foundedAtTick: 1n, manifest, succession: "failure_restart" });
    const once = applyInheritanceManifest(child, manifest);
    const twice = applyInheritanceManifest(once, manifest);
    expect(once.finances.cashMicroUsd).toBe(0n);
    expect(twice.finances.cashMicroUsd).toBe(0n);
    expect(child.museum.length).toBe(0); // the seam itself leaves no marker — the chain's museum marker owns re-spend refusal
  });
});
