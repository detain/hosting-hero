/**
 * endings.test.ts — the campaign terminal readout (Act III rung, wave-26).
 *
 * endCampaign is a pure projection: every test is data-in/data-out. Nothing
 * runs live — the Act II real-death witness reuses the AUTHORED chapter ids
 * from chapters.ts (read-only import) around the stopReason the wave-25 death
 * lane actually produced (`lose:death-by-cause:any@73`), never a scenario run.
 */
import { describe, expect, it } from "vitest";
import { asEntityId, asMoney, asRunSeed } from "../../types";
import type { CompanyNode, MedalRecord, ScarRecord } from "../../save/index";
import { emptyLineageGraph, newCompanyNode, reputationStateFromLedger } from "../../save/index";
import { endCampaign, ENDING_KINDS, CampaignError } from "../index";
import type { CampaignChapterRecord, CampaignEnding, CampaignReport } from "../index";
import { CAMPAIGN_ACT_TWO } from "../chapters";

/* ── fixtures ─────────────────────────────────────────────────────────── */

function rec(overrides: Partial<CampaignChapterRecord>): CampaignChapterRecord {
  const base: CampaignChapterRecord = {
    chapterId: "c-1",
    scenarioId: "s-a",
    runId: "run-1",
    nodeId: "co",
    runSeed: asRunSeed(904n),
    outcome: "won",
    stopReason: "win@240",
    endTick: 240n,
    endMinute: 240,
    endDigest: "0".repeat(32),
    cashStartMicroUsd: asMoney(1_000n),
    cashEndMicroUsd: asMoney(2_000n),
    settledFacets: [],
    bootstrapped: false,
  };
  return { ...base, ...overrides };
}

function report(...records: CampaignChapterRecord[]): CampaignReport {
  return {
    campaignId: "act-three-test",
    baseRunSeed: asRunSeed(904n),
    finalNodeId: asEntityId("co"),
    chapterRecords: records,
    edgesSpawned: [],
    finalGraph: emptyLineageGraph(),
  };
}

function founderNode(): CompanyNode {
  return newCompanyNode({
    id: "co",
    parentId: null,
    name: "Co",
    eraOrigin: "2026",
    foundedAtTick: 0n,
    successionType: "found",
  });
}

/** A node whose facets carry every fact the readout quotes. */
function richNode(): CompanyNode {
  const medal: MedalRecord = { kind: "zero-downtime", levelRef: "b-3-skeleton-weekend", atTick: 300n };
  // endCampaign counts scar SLOTS only (never reads a field), so the fixture
  // stands in for a slot without pretending at scar grammar.
  const scar = {} as unknown as ScarRecord;
  return {
    ...founderNode(),
    records: {
      worstOutageSeconds: 3_600,
      longestPerfectStreak: 90,
      biggestCustomerMrrMicroUsd: asMoney(250_000_000n),
      costliestMistakeMicroUsd: asMoney(75_000_000n),
    },
    reputation: reputationStateFromLedger({ overallBps: 1_500n, honestHostFloor: false, lifetimeEvents: 3 }),
    medals: [medal],
    scars: [scar],
  };
}

const DEATH_STOP = "lose:death-by-cause:any@73";

/* ── selection precedence ─────────────────────────────────────────────── */

describe("endCampaign — terminal-only precedence", () => {
  it("terminal loss selects the obituary and quotes the cause verbatim (§9.9)", () => {
    const ending = endCampaign(report(rec({ outcome: "lost", stopReason: DEATH_STOP })), founderNode());
    expect(ending.kind).toBe("obituary");
    expect(ending.title).toBe("The Obituary");
    expect(ending.evidence.deathStopReason).toBe(DEATH_STOP);
    expect(ending.epitaph).toContain(DEATH_STOP);
  });

  it("a mid-chain loss does NOT select the obituary — only the terminal beat does", () => {
    // §9.9 succession law: death mid-tour spawns an heir and the tour walks on.
    const ending = endCampaign(
      report(rec({ chapterId: "b-4", outcome: "lost", stopReason: DEATH_STOP }), rec({ chapterId: "b-7" })),
      founderNode(),
    );
    expect(ending.kind).toBe("quiet-handoff");
    expect(ending.evidence.deathStopReason).toBeNull();
  });

  it("terminal win on the sell-accepted grammar selects the exit (§1.5)", () => {
    const ending = endCampaign(
      report(rec({ outcome: "won", stopReason: "win:sell-accepted-above:0@480" })),
      founderNode(),
    );
    expect(ending.kind).toBe("exit");
    expect(ending.title).toBe("The Exit");
    expect(ending.evidence.deathStopReason).toBeNull();
  });

  it("a terminal timeout is the company still standing — quiet-handoff", () => {
    const ending = endCampaign(report(rec({ outcome: "timeout", stopReason: "timeout@480" })), founderNode());
    expect(ending.kind).toBe("quiet-handoff");
    expect(ending.evidence.deathStopReason).toBeNull();
  });

  it("the closed union is exactly three kinds and every kind is reachable", () => {
    expect([...ENDING_KINDS].sort()).toEqual(["exit", "obituary", "quiet-handoff"]);
    const rows: readonly [CampaignChapterRecord, (typeof ENDING_KINDS)[number]][] = [
      [rec({ outcome: "lost", stopReason: DEATH_STOP }), "obituary"],
      [rec({ outcome: "won", stopReason: "win:sell-accepted-above:0@480" }), "exit"],
      [rec({ outcome: "won", stopReason: "win@240" }), "quiet-handoff"],
      [rec({ outcome: "timeout", stopReason: "timeout@240" }), "quiet-handoff"],
    ];
    for (const [record, expected] of rows) {
      expect(endCampaign(report(record), founderNode()).kind).toBe(expected);
    }
  });
});

/* ── obituary real-cause witnesses ────────────────────────────────────── */

describe("endCampaign — the real cause, not a punchline", () => {
  it("Act II witness: b-4-hardest-lesson dying to company death reads the authored death grammar", () => {
    // The REAL chapter ids from the shipped Act II doc (chapters.ts:534) around
    // the wave-25 death lane's actual terminal stopReason — no live run needed.
    const spec = CAMPAIGN_ACT_TWO.chapters.find((chapter) => chapter.chapterId === "b-4-hardest-lesson");
    expect(spec?.scenarioId).toBe("the-hardest-lesson");
    const death = rec({ chapterId: "b-4-hardest-lesson", scenarioId: spec?.scenarioId ?? "?", outcome: "lost", stopReason: DEATH_STOP });
    const ending = endCampaign(report(death), founderNode());
    expect(ending.kind).toBe("obituary");
    const last = ending.evidence.chapterOutcomes.at(-1);
    // The projection row is {chapterId, outcome, stopReason} — the record's
    // scenarioId stays in the record; the readout copies only the terminal line.
    expect(last).toEqual({ chapterId: "b-4-hardest-lesson", outcome: "lost", stopReason: DEATH_STOP });
    expect(ending.epitaph).toContain(DEATH_STOP);
  });

  it("a guard-shaped loss (no lose: prefix) is still an obituary — outcome governs, not the string", () => {
    const ending = endCampaign(report(rec({ outcome: "lost", stopReason: "guard:freeCashDepleted@3" })), founderNode());
    expect(ending.kind).toBe("obituary");
    expect(ending.evidence.deathStopReason).toBe("guard:freeCashDepleted@3");
    expect(ending.epitaph).toContain("guard:freeCashDepleted@3");
  });

  it("deathStopReason is non-null exactly when the kind is obituary", () => {
    const cases: CampaignChapterRecord[] = [
      rec({ outcome: "won", stopReason: "win@240" }),
      rec({ outcome: "won", stopReason: "win:sell-accepted-above:0@480" }),
      rec({ outcome: "timeout", stopReason: "timeout@240" }),
      rec({ outcome: "lost", stopReason: DEATH_STOP }),
    ];
    for (const terminal of cases) {
      const ending = endCampaign(report(terminal), founderNode());
      expect(ending.evidence.deathStopReason !== null).toBe(ending.kind === "obituary");
    }
  });
});

/* ── exit anti-lie + money-untouched law ──────────────────────────────── */

describe("endCampaign — executed is not accepted, and the exit never spends", () => {
  it("an EXECUTED sell-offer win does NOT yield the exit (anti-lie: executed ≠ accepted)", () => {
    const ending = endCampaign(
      report(rec({ outcome: "won", stopReason: "win:intents-executed-above:sell-offer:2@240" })),
      founderNode(),
    );
    expect(ending.kind).toBe("quiet-handoff");
  });

  it("a sell-accepted win MID-chain with a plain-win terminal stays quiet-handoff", () => {
    const ending = endCampaign(
      report(rec({ chapterId: "c-sell", stopReason: "win:sell-accepted-above:0@480" }), rec({ chapterId: "c-last", stopReason: "win@240" })),
      founderNode(),
    );
    expect(ending.kind).toBe("quiet-handoff");
  });

  it("the exit is verdict-observed: no cash on the ending, node.finances untouched, no keys beyond the vocabulary", () => {
    const node = richNode();
    const financesBefore = JSON.stringify(node.finances, (_k, v) => (typeof v === "bigint" ? String(v) : v));
    const ending = endCampaign(report(rec({ outcome: "won", stopReason: "win:sell-accepted-above:0@480" })), node);
    expect(JSON.stringify(ending, (_k, v) => (typeof v === "bigint" ? String(v) : v)).toLowerCase()).not.toContain("cash");
    expect(JSON.stringify(node.finances, (_k, v) => (typeof v === "bigint" ? String(v) : v))).toBe(financesBefore);
    expect(Object.keys(ending).sort()).toEqual(["epitaph", "evidence", "kind", "title"]);
  });
});

/* ── evidence rides the existing facets ───────────────────────────────── */

describe("endCampaign — evidence quotes what the save actually holds", () => {
  it("every records facet leaf, medal/scar counts, and the reputation round-trip", () => {
    const ending = endCampaign(
      report(rec({ chapterId: "c-1" }), rec({ chapterId: "c-2", outcome: "lost", stopReason: DEATH_STOP })),
      richNode(),
    );
    expect(ending.evidence.worstOutageSeconds).toBe(3_600);
    expect(ending.evidence.longestPerfectStreak).toBe(90);
    expect(ending.evidence.biggestCustomerMrrMicroUsd).toBe(asMoney(250_000_000n));
    expect(ending.evidence.costliestMistakeMicroUsd).toBe(asMoney(75_000_000n));
    expect(ending.evidence.medals).toBe(1);
    expect(ending.evidence.scars).toBe(1);
    // 1_500 bps written by fromRatio must come back out as exactly 1_500.
    expect(ending.evidence.reputationBps).toBe(1_500);
    expect(ending.evidence.chapterOutcomes.map((row) => row.chapterId)).toEqual(["c-1", "c-2"]);
    expect(ending.evidence.chapterOutcomes[1]?.outcome).toBe("lost");
  });

  it("a node missing the records/reputation facets answers absent-or-zero, never a crash", () => {
    const bare = { ...founderNode(), records: undefined, reputation: undefined } as unknown as CompanyNode;
    const ending = endCampaign(report(rec({ outcome: "lost", stopReason: DEATH_STOP })), bare);
    expect("worstOutageSeconds" in ending.evidence).toBe(false);
    expect("longestPerfectStreak" in ending.evidence).toBe(false);
    expect("biggestCustomerMrrMicroUsd" in ending.evidence).toBe(false);
    expect("costliestMistakeMicroUsd" in ending.evidence).toBe(false);
    expect("reputationBps" in ending.evidence).toBe(false);
    expect(ending.evidence.medals).toBe(0);
    expect(ending.evidence.scars).toBe(0);
  });

  it("non-finite / non-bigint leaves are absent, not coerced", () => {
    // Forged foreign bytes (a string where money lives, NaN where a number
    // lives) — the cast stands in for a legacy/corrupt node the typed world
    // cannot author. endCampaign must answer absent, not coerce.
    const forged = {
      ...founderNode(),
      records: {
        worstOutageSeconds: Number.NaN,
        longestPerfectStreak: 90,
        biggestCustomerMrrMicroUsd: "250000000",
        costliestMistakeMicroUsd: asMoney(75n),
      },
    } as unknown as CompanyNode;
    const ending = endCampaign(report(rec({})), forged);
    expect("worstOutageSeconds" in ending.evidence).toBe(false);
    expect("biggestCustomerMrrMicroUsd" in ending.evidence).toBe(false);
    expect(ending.evidence.longestPerfectStreak).toBe(90);
    expect(ending.evidence.costliestMistakeMicroUsd).toBe(asMoney(75n));
  });
});

/* ── purity and boundary ──────────────────────────────────────────────── */

describe("endCampaign — pure projection, loud boundary", () => {
  it("deterministic and fully frozen at every level", () => {
    const node = richNode();
    const first: CampaignEnding = endCampaign(report(rec({ outcome: "lost", stopReason: DEATH_STOP })), node);
    const second: CampaignEnding = endCampaign(report(rec({ outcome: "lost", stopReason: DEATH_STOP })), node);
    expect(second).toEqual(first);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.evidence)).toBe(true);
    expect(first.evidence.chapterOutcomes.every(Object.isFrozen)).toBe(true);
  });

  it("the report and node ride in by identity: endCampaign mutates nothing", () => {
    const node = richNode();
    const played = report(rec({ outcome: "lost", stopReason: DEATH_STOP }));
    const ending = endCampaign(played, node);
    expect(ending.evidence.chapterOutcomes[0]).not.toBe(played.chapterRecords[0]);
    expect(node.records.longestPerfectStreak).toBe(90);
    expect(played.chapterRecords[0]?.outcome).toBe("lost");
  });

  it("the empty report is the one illegal state and fails loud at the boundary", () => {
    expect(() => endCampaign(report(), founderNode())).toThrow(CampaignError);
    expect(() => endCampaign(report(), founderNode())).toThrow(/EMPTY at 'campaign "act-three-test"'/);
  });
});
