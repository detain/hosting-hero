/**
 * settle.test.ts — the campaign settlement executor (L-CP1, ADR-0018 1b).
 * Covers: registry completeness vs MATRIX B, the parseRunInstance boundary
 * wall, per-facet fold goldens, the all-32 sweep, abort-everything identity,
 * the root/node ledger split, and ×100 determinism.
 */
import { describe, expect, it } from "vitest";
import { asEntityId } from "../../types";
import type { EntityId } from "../../types";
import {
  CAMPAIGN_RUN_OUTCOMES,
  FACET_APPLIERS,
  SAVE_MODES,
  WRITE_FACETS,
  emptyLineageGraph,
  emptyStreaks,
  foundCompany,
  digestSaveValue,
  guardBatch,
  parseRunInstance,
  settleRoot,
  settleRun,
  writeGuard,
} from "../index";
import type { LineageGraph, RunInstance, SettlementBatch, WriteFacet } from "../index";

function graphWithFounder(): { graph: LineageGraph; founderId: EntityId } {
  const base = emptyLineageGraph();
  const { graph } = foundCompany(base, { id: "co-1", name: "Settling Co", eraOrigin: "2026", foundedAtTick: 0n });
  return { graph, founderId: asEntityId("co-1") };
}

// ---------------------------------------------------------------------------
// one valid payload per facet (row payloads for record facets are SINGLE rows)
// ---------------------------------------------------------------------------

const TREATMENT = {
  seq: 0,
  atTick: 1n,
  causeId: "economy:test",
  subject: "cust-1",
  dimension: "service",
  valence: 0n,
  summary: "settled quietly",
  provenance: { runId: "r-1", runSeed: 904n },
};

export const FIXTURES: Record<WriteFacet, unknown> = {
  staff: { id: "st-1", name: "Ada", hiredAtTick: 1n, role: "ops", arcStage: "act-1", skillNodesHeld: [], documented: null, morale: 0n, fatigue: 0n, onCallTurn: false, apprenticeshipRemaining: 0, careerLog: [{ atTick: 1n, kind: "hire", note: "joined" }] },
  alumni: { staffId: "st-1", leftAtTick: 2n, reason: "quit", sentiment: 0n, currentCompany: "Elsewhere", rehireDarkened: false },
  spineCast: { npcKind: "rival", accumulatorState: { grudge: 1n } },
  culture: 4096n,
  scars: { id: "scar-1", originEventRef: "e-1", acquiredAtTick: 1n, modifierPayload: {}, clearance: { rule: "90_clean_days", progress: 0 }, disclosure: "disclosed", payoffGrant: null, mapPosition: null },
  scarsRetired: { id: "scar-0", replacedBy: null, memorial: true, retiredAtTick: 1n },
  postmortems: { polaroidRef: "p-1", rootCause: "r-1", correct: true, costBreakdownMicroUsd: 0n, blameMode: "blameless", published: true, unlocks: [] },
  ghosts: { customerId: "cust-9", exitQuote: "bye", voice: "flat", cause: "churn", repaired: false },
  habits: { docRate: 0n, standardizationRate: 0n, snowflakesLeft: 3, overPermissionCount: 0, debtPayoffLatencyMin: 0 },
  deadDrives: { serial: "SN-1", deathAtTick: 1n, cause: "click" },
  hardware: { id: "hw-1", kind: "ssd", model: "x90", serial: "SN-2", installedAtTick: 1n, retiredAtTick: null, rackRef: null, events: [{ atTick: 1n, note: "boot" }] },
  unlockDraftsPassed: { node: "n-1", draftId: "d-1" },
  nodesUnlocked: { node: "n-1", via: "testimony", scarRef: null, incidentRef: null, stamp: null, stampAtTick: null, handwritingOwnerStaffId: null, faded: 0 },
  credentials: { kind: "ASN", grantedAtTick: 1n, requiresCleanDays: 90, expiryAtTick: null, revoked: false, revocationCause: null, frameState: "crisp" },
  medals: { kind: "chapter-won", levelRef: "the-long-weekend", atTick: 1n },
  linesEverRun: { type: "t1", launchedAtTick: 1n, retiredAtTick: null, placardState: "intact", distillateGranted: false, nameplateData: "" },
  codex: { "hydra": { stage: "seen", personalRecord: "0/1", lifetimeCostMicroUsd: 0n, counteredWith: [], silhouettesUnlocked: [] } },
  customerBooks: { id: "cust-1", name: "Cleo", plan: "pro", mrrMicroUsd: 100n, tenureMin: 10, termEndMin: 1_000, cohortId: "c-1", treatmentLog: [TREATMENT], grudgeScore: 0n, referenceEligible: true, status: "active", whaleShare: 0n },
  reputation: { overall: 0n, domains: { customerTrust: 0n, upstreamTrust: 0n, staffTrust: 0n, industry: 0n }, honestHostFloor: false, breachHistoryTicks: [] },
  creditGrade: { score: 600, factors: { streak: 0n, docs: 0n, audits: 0n, diversification: 0n }, effects: { interestRatio: 0n, vendorTermsDays: 30, insurancePremiumMicroUsd: 0n, personalGuarantees: false } },
  theMultiple: { current: 65536n, history: [], factors: {} },
  attributionEvents: { effect: "campaign:chapter:one:won", magnitude: 65536n, createdAtTick: 5n, causeEventRef: "win@240" },
  records: { worstOutageSeconds: 1, longestPerfectStreak: 1, biggestCustomerMrrMicroUsd: 10n, costliestMistakeMicroUsd: 1n },
  annualReports: { year: 1999, artifactRef: "ar-1999" },
  finances: { cashCapped: false, cashMicroUsd: 42n, mrrMicroUsd: 0n, deferredRevenueMicroUsd: 0n, runwayMin: 0, debt: [] },
  playbook: [{ runbookId: "rb-1", rung: 3, draftedByStaffId: null, sealState: "drilled", carried: true, mttrBonusUs: 0 }],
  wiki: [{ topic: "power", prose: "buy more", authorStaffId: null, lastVerifiedAtTick: 1n, fogState: "clear", binderFade: 0n }],
  anticipation: { tokensAvailable: 1, tokenSpends: [] },
  researchQueue: [{ node: "n-2", slotsUsed: 1, progress: 0n, paused: false, debtFinanced: false }],
  constraintCards: [{ legacyObjectRef: "obj-1", carriedLiability: "lic-1" }],
  museum: { id: "ex-1", sourceFacet: "scenario", sourceRef: "the-long-weekend", title: "A Long Weekend", runId: "r-1", runSeed: 904n, acquiredAtTick: 1n, deprecated: false, memorialNote: null },
  streaksShared: { kind: "uptime", outcome: "clean", atTick: 0n },
};

export const NODE_FACETS: readonly WriteFacet[] = WRITE_FACETS.filter((f) => f !== "streaksShared");

export function batch(runId: string, writes: readonly { facet: WriteFacet; payload: unknown }[], committedAtTick = 5n): SettlementBatch {
  return { runId, mode: "campaign", committedAtTick, writes: writes.map((w) => ({ facet: w.facet, payload: w.payload })) };
}

export function instance(runId: string, writes: readonly { facet: WriteFacet; payload: unknown }[], overrides: Partial<RunInstance> = {}): RunInstance {
  return parseRunInstance({
    runId,
    mode: "campaign",
    runSeed: 904n,
    startedAtTick: 0n,
    endedAtTick: 10n,
    outcome: "won",
    batch: batch(runId, writes),
    ...overrides,
  });
}

// ---------------------------------------------------------------------------

describe("FACET_APPLIERS registry (MATRIX B full-carry law)", () => {
  it("covers every one of the 32 campaign facets exactly once", () => {
    expect(Object.keys(FACET_APPLIERS).sort()).toEqual([...WRITE_FACETS].sort());
    expect(WRITE_FACETS.length).toBe(32);
  });

  it("every applier kind equals writeGuard('campaign', facet) — no drift", () => {
    for (const facet of WRITE_FACETS) {
      expect(FACET_APPLIERS[facet].kind).toBe(writeGuard("campaign", facet));
      expect(FACET_APPLIERS[facet].facet).toBe(facet);
    }
  });

  it("streaksShared is the ONLY root-scope facet", () => {
    const roots = WRITE_FACETS.filter((f) => FACET_APPLIERS[f].scope === "root");
    expect(roots).toEqual(["streaksShared"]);
  });

  it("the campaign roster is full-carry: zero deny rows for campaign", () => {
    for (const facet of WRITE_FACETS) expect(writeGuard("campaign", facet)).not.toBe("deny");
    expect(SAVE_MODES).toContain("campaign");
    expect([...CAMPAIGN_RUN_OUTCOMES]).toEqual(["won", "lost", "timeout"]);
  });
});

describe("parseRunInstance boundary wall", () => {
  const valid = () => ({
    runId: "r-1", mode: "campaign", runSeed: 904n, startedAtTick: 0n, endedAtTick: 10n, outcome: "won",
    batch: { runId: "r-1", mode: "campaign", committedAtTick: 5n, writes: [{ facet: "medals", payload: FIXTURES.medals }] },
  });

  it("accepts the happy path and deep-freezes everything", () => {
    const run = parseRunInstance(valid());
    expect(run.mode).toBe("campaign");
    expect(Object.isFrozen(run)).toBe(true);
    expect(Object.isFrozen(run.batch.writes[0]?.payload)).toBe(true);
  });

  it("refuses unknown keys by name", () => {
    expect(() => parseRunInstance({ ...valid(), sneaky: 1 })).toThrow(/unknown key "sneaky"/);
  });

  it("refuses non-campaign modes", () => {
    expect(() => parseRunInstance({ ...valid(), mode: "endless" })).toThrow(/mode must be "campaign"/);
    expect(() => parseRunInstance({ ...valid(), batch: { ...valid().batch, mode: "scenario" } })).toThrow(/mode must be "campaign"/);
  });

  it("refuses string seeds and foreign outcomes", () => {
    expect(() => parseRunInstance({ ...valid(), runSeed: "904" })).toThrow(/runSeed must be bigint/);
    expect(() => parseRunInstance({ ...valid(), outcome: "victory" })).toThrow(/outcome must be one of won|lost|timeout/);
  });

  it("refuses runId drift between instance and batch", () => {
    expect(() => parseRunInstance({ ...valid(), batch: { ...valid().batch, runId: "other" } })).toThrow(/disagrees with runId/);
  });

  it("refuses window violations (end<start, commit outside span)", () => {
    expect(() => parseRunInstance({ ...valid(), startedAtTick: 11n })).toThrow(/before startedAtTick/);
    expect(() => parseRunInstance({ ...valid(), batch: { ...valid().batch, committedAtTick: 99n } })).toThrow(/outside \[startedAtTick, endedAtTick\]/);
  });

  it("refuses foreign facets and payload-key-less rows", () => {
    expect(() => parseRunInstance({ ...valid(), batch: { ...valid().batch, writes: [{ facet: "secrets", payload: {} }] } })).toThrow(/WRITE_FACETS/);
    const { payload: _gone, ...rowLess } = { facet: "medals" as WriteFacet, payload: FIXTURES.medals };
    expect(() => parseRunInstance({ ...valid(), batch: { ...valid().batch, writes: [rowLess] } })).toThrow(/missing key "payload"/);
  });

  it("refuses an empty batch through guardBatch pairing (wall bypassed by typed literal)", () => {
    const { graph, founderId } = graphWithFounder();
    const bypassed = {
      runId: "e", mode: "campaign", runSeed: 904n, startedAtTick: 0n, endedAtTick: 10n, outcome: "won",
      batch: { runId: "e", mode: "campaign", committedAtTick: 5n, writes: [] },
    } as unknown as RunInstance;
    expect(() => settleRun(graph, founderId, bypassed)).toThrow(/facts or nothing/);
  });
});

describe("settleRun folds (per-facet goldens)", () => {
  it("commits every node-scope facet in one 31-row sweep", () => {
    const { graph, founderId } = graphWithFounder();
    const run = instance("sweep", NODE_FACETS.map((facet) => ({ facet, payload: FIXTURES[facet] })));
    const out = settleRun(graph, founderId, run);
    const node = out.nodes.get(founderId);
    expect(node).toBeDefined();
    expect(node?.staff.length).toBe(1);
    expect(node?.museum.length).toBe(1);
    expect(node?.finances.cashMicroUsd).toBe(42n);
    expect(node?.culture).toBe(4096n);
    expect(node?.attributionEvents[0]?.seq).toBe(0);
    // input untouched — COW identity
    expect(graph.nodes.get(founderId)?.staff.length).toBe(0);
  });

  it("stamps attribution seq from the writer, refusing self-stamped payloads", () => {
    const { graph, founderId } = graphWithFounder();
    const attr = FIXTURES.attributionEvents as Record<string, unknown>;
    const first = settleRun(graph, founderId, instance("a", [{ facet: "attributionEvents", payload: attr }]));
    const second = settleRun(first, founderId, instance("b", [{ facet: "attributionEvents", payload: { ...attr, effect: "second" } }]));
    expect(second.nodes.get(founderId)?.attributionEvents.map((e) => e.seq)).toEqual([0, 1]);
    expect(() => settleRun(graph, founderId, instance("c", [{ facet: "attributionEvents", payload: { ...attr, seq: 7 } }]))).toThrow(/stamps it/);
  });

  it("max-merges records both directions (facts never decrease)", () => {
    const { graph, founderId } = graphWithFounder();
    const big = { worstOutageSeconds: 90, longestPerfectStreak: 50, biggestCustomerMrrMicroUsd: 900n, costliestMistakeMicroUsd: 800n };
    const once = settleRun(graph, founderId, instance("big", [{ facet: "records", payload: big }]));
    const after = settleRun(once, founderId, instance("small", [{ facet: "records", payload: FIXTURES.records }]));
    expect(after.nodes.get(founderId)?.records).toEqual(big);
  });

  it("upserts customer books with treatment-log seq rebasing", () => {
    const { graph, founderId } = graphWithFounder();
    const once = settleRun(graph, founderId, instance("one", [{ facet: "customerBooks", payload: FIXTURES.customerBooks }]));
    const followUp = {
      ...(FIXTURES.customerBooks as Record<string, unknown>),
      status: "won_back",
      treatmentLog: [{ ...TREATMENT, seq: 0 }, { ...TREATMENT, seq: 1, dimension: "honesty" }],
    };
    const twice = settleRun(once, founderId, instance("two", [{ facet: "customerBooks", payload: followUp }]));
    const book = twice.nodes.get(founderId)?.customerBooks[0];
    expect(twice.nodes.get(founderId)?.customerBooks.length).toBe(1);
    expect(book?.status).toBe("won_back");
    expect(book?.treatmentLog.map((e) => e.seq)).toEqual([0, 1, 2]);
  });

  it("merges hardware events and spine-cast accumulators by identity", () => {
    const { graph, founderId } = graphWithFounder();
    const once = settleRun(graph, founderId, instance("hw1", [
      { facet: "hardware", payload: FIXTURES.hardware },
      { facet: "spineCast", payload: FIXTURES.spineCast },
    ]));
    const twice = settleRun(once, founderId, instance("hw2", [
      { facet: "hardware", payload: { ...(FIXTURES.hardware as Record<string, unknown>), events: [{ atTick: 2n, note: "firmware" }] } },
      { facet: "spineCast", payload: { npcKind: "rival", accumulatorState: { grudge: 2n, fear: 1n } } },
    ]));
    expect(twice.nodes.get(founderId)?.hardware[0]?.events.length).toBe(2);
    expect(twice.nodes.get(founderId)?.spineCast.length).toBe(1);
    expect(twice.nodes.get(founderId)?.spineCast[0]?.accumulatorState).toEqual({ grudge: 2n, fear: 1n });
  });

  it("routes scars through addScar so the 3-cap retires the oldest", () => {
    const { graph, founderId } = graphWithFounder();
    let out = graph;
    for (const n of ["a", "b", "c", "d"]) {
      out = settleRun(out, founderId, instance(`scar-${n}`, [{ facet: "scars", payload: { ...(FIXTURES.scars as Record<string, unknown>), id: `scar-${n}` } }]));
    }
    const node = out.nodes.get(founderId);
    // addScar PREPENDS: newest stays, the oldest tail retires (memorialized).
    expect(node?.scars.map((s) => s.id)).toEqual(["scar-d", "scar-c", "scar-b"]);
    expect(node?.scarsRetired.map((s) => s.id)).toEqual(["scar-a"]);
  });

  it("refuses duplicate museum ids and duplicate report years", () => {
    const { graph, founderId } = graphWithFounder();
    const once = settleRun(graph, founderId, instance("m1", [{ facet: "museum", payload: FIXTURES.museum }]));
    expect(() => settleRun(once, founderId, instance("m2", [{ facet: "museum", payload: FIXTURES.museum }]))).toThrow(/already catalogued/);
    const rep = settleRun(graph, founderId, instance("y1", [{ facet: "annualReports", payload: FIXTURES.annualReports }]));
    expect(() => settleRun(rep, founderId, instance("y2", [{ facet: "annualReports", payload: { year: 1999, artifactRef: "again" } }]))).toThrow(/already reported/);
  });

  it("refuses a root-scope batch and preserves graph identity", () => {
    const { graph, founderId } = graphWithFounder();
    const run = instance("root", [{ facet: "medals", payload: FIXTURES.medals }, { facet: "streaksShared", payload: FIXTURES.streaksShared }]);
    expect(() => settleRun(graph, founderId, run)).toThrow(/root ledgers are split/);
    expect(graph.nodes.get(founderId)?.medals.length).toBe(0);
  });

  it("names the offending facet when a payload is malformed", () => {
    const { graph, founderId } = graphWithFounder();
    expect(() => settleRun(graph, founderId, instance("bad", [{ facet: "scars", payload: { id: "x" } }]))).toThrow(/"scars"/);
  });

  it("refuses unknown nodes and mode drift past the wall", () => {
    const { graph } = graphWithFounder();
    const run = instance("nowhere", [{ facet: "medals", payload: FIXTURES.medals }]);
    expect(() => settleRun(graph, asEntityId("ghost"), run)).toThrow(/no node "ghost"/);
    const drifted = { ...run, batch: { ...run.batch, runId: "other" } } as RunInstance;
    expect(() => settleRun(graph, asEntityId("co-1"), drifted)).toThrow(/disagrees with run/);
  });

  it("pairs guardBatch: a denied shadow-mode row aborts before any fold", () => {
    expect(() => guardBatch({ runId: "sh", mode: "scenario", committedAtTick: 1n, writes: [{ facet: "staff", payload: FIXTURES.staff }] })).toThrow(/denies mode "scenario"/);
  });

  it("is ×100 deterministic on identical batches", () => {
    const { graph, founderId } = graphWithFounder();
    const run = instance("det", [{ facet: "museum", payload: FIXTURES.museum }, { facet: "records", payload: FIXTURES.records }, { facet: "finances", payload: FIXTURES.finances }]);
    const digests = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      digests.add(digestSaveValue(settleRun(graph, founderId, run).nodes.get(founderId)));
    }
    expect(digests.size).toBe(1);
  });
});

describe("settleRoot folds the shared streak ledger", () => {
  it("advances clean rows and breaks breach rows in order", () => {
    const streaks = settleRoot(emptyStreaks(), batch("st", [
      { facet: "streaksShared", payload: { kind: "uptime", outcome: "clean" } },
      { facet: "streaksShared", payload: { kind: "uptime", outcome: "clean" } },
      { facet: "streaksShared", payload: { kind: "uptime", outcome: "breach", atTick: 10n, cause: "incident:x" } },
      { facet: "streaksShared", payload: { kind: "no_data_loss", outcome: "clean" } },
    ]));
    expect(streaks.uptime).toEqual({ current: 0, longest: 2, lastEraseAtTick: 10n });
    expect(streaks.noDataLoss.current).toBe(1);
  });

  it("refuses node-scope rows and malformed streak payloads", () => {
    expect(() => settleRoot(emptyStreaks(), batch("mix", [{ facet: "medals", payload: FIXTURES.medals }]))).toThrow(/streaksShared rows only/);
    expect(() => settleRoot(emptyStreaks(), batch("bad", [{ facet: "streaksShared", payload: { kind: "money", outcome: "clean" } }]))).toThrow(/kind must be one of/);
    expect(() => settleRoot(emptyStreaks(), batch("bad2", [{ facet: "streaksShared", payload: { kind: "uptime", outcome: "breach" } }]))).toThrow(/atTick must be bigint/);
  });
});

describe("settleRun — exhibit posture", () => {
  it("accepts a deprecated exhibit and a memorial note (history is never deleted)", () => {
    const { graph, founderId } = graphWithFounder();
    const fixture = FIXTURES.museum as Record<string, unknown>;
    const row = { ...fixture, id: "chapter:memorial-1", deprecated: true, memorialNote: "lost:death-by-cause:any@44" };
    const settled = settleRun(graph, founderId, instance("mem", [{ facet: "museum", payload: row }]));
    const node = settled.nodes.get(founderId)!;
    expect(node.museum[0]?.deprecated).toBe(true);
    expect(node.museum[0]?.memorialNote).toBe("lost:death-by-cause:any@44");
  });
});
