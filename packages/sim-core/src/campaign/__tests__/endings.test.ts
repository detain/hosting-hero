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
import { endCampaign, ENDING_KINDS, CampaignError, CAMPAIGN_SCHEMA, parseCampaignDoc } from "../index";
import type { CampaignChapterRecord, CampaignDoc, CampaignEnding, CampaignReport } from "../index";
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

/* ── the declared exit (L-V2, money-at-the-end 2/3) ───────────────────── */

describe("endCampaign — the declared exit is validated, never obeyed (L-V2)", () => {
  /** Parse a one-chapter campaign doc whose FINAL chapter declares `kind`. */
  function declaring(kind: string): CampaignDoc {
    return parseCampaignDoc({
      schema: CAMPAIGN_SCHEMA,
      id: "lv2-test",
      name: "The Long Sale",
      chapters: [{ chapterId: "c-1", scenarioId: "s-a", exitKind: kind }],
      carry: { cashFloor: { thresholdMicroUsd: 5_000_000n, bridgeMicroUsd: 500_000n }, scarCapRide: true },
    });
  }
  function undeclaring(): CampaignDoc {
    return parseCampaignDoc({
      schema: CAMPAIGN_SCHEMA,
      id: "lv2-test",
      name: "The Long Sale",
      chapters: [{ chapterId: "c-1", scenarioId: "s-a" }],
      carry: { cashFloor: { thresholdMicroUsd: 5_000_000n, bridgeMicroUsd: 500_000n }, scarCapRide: true },
    });
  }

  // The EXACT frozen evidence key set an undeclared readout emits on a
  // default-faceted node (newCompanyNode ships zero-valued records +
  // reputation, so those leaves ride). FALSIFIABLE PIN: if the third-arg
  // plumbing ever let a key materialize WITHOUT a declaration — or a declared
  // key leak into the undeclared shape — these lists go red.
  const FROZEN_UNDECLARED_KEYS = [
    "biggestCustomerMrrMicroUsd",
    "chapterOutcomes",
    "costliestMistakeMicroUsd",
    "deathStopReason",
    "longestPerfectStreak",
    "medals",
    "reputationBps",
    "scars",
    "worstOutageSeconds",
  ];
  const ALL_TERMINALS: CampaignChapterRecord[] = [
    rec({ outcome: "lost", stopReason: DEATH_STOP }),
    rec({ outcome: "won", stopReason: "win:sell-accepted-above:0@480" }),
    rec({ outcome: "won", stopReason: "win@240" }),
    rec({ outcome: "timeout", stopReason: "timeout@240" }),
  ];

  it("two-arg call sites byte-stand: the undeclared evidence shape is FROZEN", () => {
    for (const terminal of ALL_TERMINALS) {
      expect(Object.keys(endCampaign(report(terminal), founderNode()).evidence).sort()).toEqual(FROZEN_UNDECLARED_KEYS);
      // Passing the doc explicitly changes NOTHING when it declares nothing…
      expect(endCampaign(report(terminal), founderNode(), undeclaring())).toEqual(endCampaign(report(terminal), founderNode()));
      // …and an explicit-undefined third arg is the same door.
      expect(endCampaign(report(terminal), founderNode(), undefined)).toEqual(endCampaign(report(terminal), founderNode()));
    }
    // The shipped Act II doc declares no exits — the standing tour reads byte-stand.
    for (const terminal of ALL_TERMINALS) {
      expect(endCampaign(report(terminal), founderNode(), CAMPAIGN_ACT_TWO)).toEqual(endCampaign(report(terminal), founderNode()));
    }
  });

  it("a declared sell-observed win: kind exit + declaredExitKind + exitObserved:true", () => {
    const ending = endCampaign(
      report(rec({ outcome: "won", stopReason: "win:sell-accepted-above:0@480" })),
      founderNode(),
      declaring("pe-bolt-on"),
    );
    expect(ending.kind).toBe("exit");
    expect(ending.evidence.declaredExitKind).toBe("pe-bolt-on");
    expect(ending.evidence.exitObserved).toBe(true);
    // The pre-existing leaves ride untouched beside the new keys.
    expect(ending.evidence.deathStopReason).toBeNull();
    expect(Object.keys(ending.evidence).sort()).toEqual([...FROZEN_UNDECLARED_KEYS, "declaredExitKind", "exitObserved"].sort());
  });

  it("terminal LOST with a declaration stays an obituary — failure is NARRATED (hg §9.9 :35151)", () => {
    // "The company died before it sold": kind/title/epitaph byte-stand (the
    // death cause still owns the story), the EVIDENCE carries the honest
    // promise-vs-fact pair — the narration is data, not a rewritten ending.
    const declared = endCampaign(report(rec({ outcome: "lost", stopReason: DEATH_STOP })), founderNode(), declaring("strategic-acquisition"));
    const plain = endCampaign(report(rec({ outcome: "lost", stopReason: DEATH_STOP })), founderNode());
    expect(declared.kind).toBe("obituary");
    expect(declared.title).toBe(plain.title);
    expect(declared.epitaph).toBe(plain.epitaph);
    expect(declared.evidence.deathStopReason).toBe(DEATH_STOP);
    expect(declared.evidence.declaredExitKind).toBe("strategic-acquisition");
    expect(declared.evidence.exitObserved).toBe(false);
  });

  it("§E AMENDMENT — a terminal TIMEOUT with a declaration now THROWS DOC_LIE", () => {
    // L-V2's asymmetry ("the clock running out is silence about the promise")
    // is SUPERSEDED by the §E commission: the scenario runner evaluates a
    // declared chapter's win line WITH the sale predicate to the doc's OWN
    // contract horizon (win lines are ANDed — the-long-sale: survive-60 AND
    // sell-accepted-above:0). Reaching maxSimMinutes without ever observing
    // the accepted verdict is the simulation REFUTING the promise, not
    // abstaining on it. Only a LOST death still narrates ("died before it
    // sold" — hg §9.9 :35151, the obituary test above).
    const run = () => endCampaign(report(rec({ outcome: "timeout", stopReason: "timeout@240" })), founderNode(), declaring("asset-sale"));
    expect(run).toThrow(CampaignError);
    expect(run).toThrow(
      /^campaign: DOC_LIE at 'campaign "act-three-test"': the doc declares "asset-sale" but the simulation closed on "timeout@240" — endings are observed, not authored$/,
    );
  });

  it("§E per-chapter walk — a MID-CHAIN declaration answers for its OWN close", () => {
    // Two-chapter docs: chapters[0] declares, the FINAL chapter does not (the
    // terminal evidence keys stay the last chapter's business — §E widened
    // WHICH chapters must be truthful, not which ending the readout narrates).
    const twoDoc = (firstKind: string | undefined) =>
      parseCampaignDoc({
        schema: "hh-campaign@1",
        id: "act-three-test",
        name: "The Walk",
        chapters: [
          { chapterId: "c-1", scenarioId: "s-a", ...(firstKind === undefined ? {} : { exitKind: firstKind }) },
          { chapterId: "c-2", scenarioId: "s-b" },
        ],
        carry: { cashFloor: { thresholdMicroUsd: 5_000_000n, bridgeMicroUsd: 500_000n }, scarCapRide: true },
      });

    // PAID truth: the declaring mid-chain chapter sells, the tour plays on —
    // NO throw; terminal handoff grows NO evidence keys (terminal undeclared).
    const sold = endCampaign(
      report(rec({ chapterId: "c-1", stopReason: "win:sell-accepted-above:0@60" }), rec({ chapterId: "c-2", stopReason: "win@60" })),
      founderNode(),
      twoDoc("strategic-acquisition"),
    );
    expect(sold.kind).toBe("quiet-handoff");
    expect("declaredExitKind" in sold.evidence).toBe(false);

    // Declared mid-chain chapter TIMES OUT → the walk throws, NAMING the
    // chapter (the terminal message stays chapter-less; the paths differ).
    expect(() =>
      endCampaign(
        report(rec({ chapterId: "c-1", outcome: "timeout", stopReason: "timeout@90" }), rec({ chapterId: "c-2", stopReason: "win@60" })),
        founderNode(),
        twoDoc("strategic-acquisition"),
      ),
    ).toThrow(/DOC_LIE at 'campaign "act-three-test" chapter "c-1"': the doc declares "strategic-acquisition" but the simulation closed on "timeout@90"/);

    // Declared mid-chain chapter WINS WITHOUT THE SALE → same lie, same rail.
    expect(() =>
      endCampaign(
        report(rec({ chapterId: "c-1", stopReason: "win@60" }), rec({ chapterId: "c-2", stopReason: "win@60" })),
        founderNode(),
        twoDoc("pe-platform"),
      ),
    ).toThrow(/chapter "c-1".*declares "pe-platform".*"win@60"/);

    // Declared mid-chain chapter DIES → narration, not a lie: the chain rises
    // through the ORDINARY death succession (null slice); the walk skips lost.
    const died = endCampaign(
      report(rec({ chapterId: "c-1", outcome: "lost", stopReason: DEATH_STOP }), rec({ chapterId: "c-2", stopReason: "win@60" })),
      founderNode(),
      twoDoc("asset-sale"),
    );
    expect(died.kind).toBe("quiet-handoff");
    expect("declaredExitKind" in died.evidence).toBe(false);
  });

  it("§E walk judges an EARLY HALT — the declaring chapter may BE the terminal record", () => {
    // The slice(0,-1) trim pre-§E left exactly one silent hole: the tour
    // halts on a declaring chapter (timeout mid-arc — the doc's FINAL chapter
    // never played), so the terminal check reads the UNDECLARED last spec row
    // and stays silent while the record it just narrated is a refuted
    // declaration. The widened walk covers every record; the doc-final
    // message above stays chapter-less, the walk's names the chapter.
    const haltDoc = parseCampaignDoc({
      schema: "hh-campaign@1",
      id: "act-three-test",
      name: "The Early Halt",
      chapters: [
        { chapterId: "c-1", scenarioId: "s-a", exitKind: "strategic-acquisition" },
        { chapterId: "c-2", scenarioId: "s-b" },
      ],
      carry: { cashFloor: { thresholdMicroUsd: 5_000_000n, bridgeMicroUsd: 500_000n }, scarCapRide: true },
    });
    // TIMEOUT as the terminal record of a mid-chain declaration → throw,
    // naming the chapter, on the record that IS terminal.
    expect(() =>
      endCampaign(report(rec({ chapterId: "c-1", outcome: "timeout", stopReason: "timeout@30" })), founderNode(), haltDoc),
    ).toThrow(/DOC_LIE at 'campaign "act-three-test" chapter "c-1"': the doc declares "strategic-acquisition" but the simulation closed on "timeout@30"/);
    // WON without the sale → same rail.
    expect(() =>
      endCampaign(report(rec({ chapterId: "c-1", stopReason: "win@30" })), founderNode(), haltDoc),
    ).toThrow(/chapter "c-1".*"win@30"/);
    // LOST death as the terminal record → narration, not a lie (obituary;
    // the walk skips lost closes; the death-evidence read is unchanged).
    const died = endCampaign(
      report(rec({ chapterId: "c-1", outcome: "lost", stopReason: DEATH_STOP })),
      founderNode(),
      haltDoc,
    );
    expect(died.kind).toBe("obituary");
    expect("declaredExitKind" in died.evidence).toBe(false);
  });

  it("a WON non-sale close with a declaration throws DOC_LIE — endings are observed, not authored", () => {
    const run = () => endCampaign(report(rec({ outcome: "won", stopReason: "win@240" })), founderNode(), declaring("strategic-acquisition"));
    expect(run).toThrow(CampaignError);
    expect(run).toThrow(
      /^campaign: DOC_LIE at 'campaign "act-three-test"': the doc declares "strategic-acquisition" but the simulation closed on "win@240" — endings are observed, not authored$/,
    );
  });

  it("precedence is UNCHANGED by a declaration — obituary still outranks everything", () => {
    // A mid-chain sell win with a declared terminal LOSS stays an obituary
    // (the declaration rides the terminal chapter, the selection reads it).
    const ending = endCampaign(
      report(rec({ chapterId: "c-sell", stopReason: "win:sell-accepted-above:0@480" }), rec({ chapterId: "c-last", outcome: "lost", stopReason: DEATH_STOP })),
      founderNode(),
      declaring("pe-platform"),
    );
    expect(ending.kind).toBe("obituary");
    expect(ending.evidence.exitObserved).toBe(false);
  });

  it("money-untouched law SURVIVES the declaration: the readout never grows a cash word", () => {
    const node = richNode();
    const ending = endCampaign(
      report(rec({ outcome: "won", stopReason: "win:sell-accepted-above:0@480" })),
      node,
      declaring("pe-bolt-on"),
    );
    expect(JSON.stringify(ending, (_k, v) => (typeof v === "bigint" ? String(v) : v)).toLowerCase()).not.toContain("cash");
    expect(Object.keys(ending).sort()).toEqual(["epitaph", "evidence", "kind", "title"]);
  });

  it("declared readouts are frozen too, and pure across repeats", () => {
    const doc = declaring("asset-sale");
    const first = endCampaign(report(rec({ outcome: "won", stopReason: "win:sell-accepted-above:2@90" })), founderNode(), doc);
    const second = endCampaign(report(rec({ outcome: "won", stopReason: "win:sell-accepted-above:2@90" })), founderNode(), doc);
    expect(second).toEqual(first);
    expect(Object.isFrozen(first.evidence)).toBe(true);
  });
});
