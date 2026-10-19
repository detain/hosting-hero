/**
 * campaignLab.test.ts — the epilogue bench model (wave-31 ask (i)).
 *
 * Every engine witness here is RE-DERIVED from the live call (stopReason
 * grammar, the 24M/15M slices, the 48M/30M headlines, the four adjustment
 * legs): the bench stands on simulation truth, not on re-quoted sim-core
 * law literals. Twin determinism per arm; the honest-scar offset (2) is
 * exercised through the UI's own seam.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { CampaignExitKind, CampaignReport } from "@hh/sim-core/campaign";
import { CAMPAIGN_EXIT_KINDS, parseCampaignDoc } from "@hh/sim-core/campaign";
import { CAMPAIGN_EXIT } from "@hh/sim-core/campaign/chapters";
import { asMoney } from "@hh/sim-core/types";
import { epilogueProseFor, runEpilogueArm, runEpilogueDoc } from "../campaignLab";
import type { EpilogueArm, EpilogueRunRecord } from "../campaignLab";

/** Memoized so the twin/digest legs share ONE traversal per (arm, offset) —
 *  determinism is then asserted BETWEEN independent calls, not assumed. */
const recordCache = new Map<string, Promise<EpilogueRunRecord>>();
function memo(arm: EpilogueArm, offset: number): Promise<EpilogueRunRecord> {
  const key = `${arm}@${offset}`;
  let run = recordCache.get(key);
  if (run === undefined) {
    run = runEpilogueArm(arm, offset);
    recordCache.set(key, run);
  }
  return run;
}
function fresh(arm: EpilogueArm, offset: number): Promise<EpilogueRunRecord> {
  return runEpilogueArm(arm, offset);
}

/* ─────────────────────────── arm: exit-declared ─────────────────────────── */

describe("exit-declared arm — the terminal declaration narrates The Exit", () => {
  it("engine witnesses: sell-accepted terminal, declared evidence, paid 24M slice", async () => {
    const r = await memo("exit-declared", 0);
    expect(r.stage).toBe("done");
    const report = r.report as CampaignReport;
    expect(report.campaignId).toBe("epilogue-exit-declared");
    expect(report.chapterRecords.map((row) => [row.nodeId, row.chapterId, row.outcome, row.stopReason])).toEqual([
      ["co", "x-1-armed-close", "won", "win:sell-accepted-above:0@60"],
    ]);
    // The paid close spawns the heir even on the single beat (chain law) —
    // the tour ended ON the proceeds node.
    expect(report.finalNodeId).toBe("successor:epilogue-exit-declared:0");
    const ending = r.ending as NonNullable<typeof r.ending>;
    expect(ending.kind).toBe("exit");
    expect(ending.title).toBe("The Exit");
    expect(ending.evidence.declaredExitKind).toBe("strategic-acquisition");
    expect(ending.evidence.exitObserved).toBe(true);
    expect(report.edgesSpawned).toHaveLength(1);
    expect(report.edgesSpawned[0]?.type).toBe("exit");
    expect(report.edgesSpawned[0]?.manifest.cashSliceMicroUsd).toBe(asMoney(24_000_000n));
    const payout = r.payout as NonNullable<typeof r.payout>;
    expect(payout.exitKind).toBe("strategic-acquisition");
    expect(payout.headlineOfferMicroUsd).toBe(asMoney(48_000_000n));
    expect(payout.cashSliceMicroUsd).toBe(asMoney(24_000_000n));
    const legs = Object.fromEntries(payout.adjustments.map((row) => [row.basis, Number(row.factorBps)]));
    expect(legs).toEqual({ concentration: 7_500, "exit-kind": 10_000, reputation: 9_000, "term-coverage": 5_000 });
  }, 120_000);

  it("the view renders the declaration + ledger + digest", async () => {
    const r = await memo("exit-declared", 0);
    const view = r.state.view as NonNullable<typeof r.state.view>;
    expect(view.source).toBe("live");
    expect(view.declaredExitKind).toBe("strategic-acquisition");
    const ledger = view.exitLedger as NonNullable<typeof view.exitLedger>;
    expect(ledger.declaredStr).toBe("strategic-acquisition");
    expect(ledger.observedStr).toContain("observed");
    expect(ledger.sliceStr).toContain("$");
    expect(ledger.adjustments).toHaveLength(4);
    expect(ledger.adjustments.map((row) => row.text)).toContain("7,500 bps of 10,000");
    expect(r.digest).toMatch(/^[0-9a-f]{16}$/);
  }, 120_000);

  it("twin determinism: a second independent run agrees on digest and view", async () => {
    const a = await memo("exit-declared", 0);
    const b = await fresh("exit-declared", 0);
    expect(b.digest).toBe(a.digest);
    expect(JSON.stringify(b.state.view)).toBe(JSON.stringify(a.state.view));
  }, 180_000);

  it("offset 2 — the honest scar reaches the bench: one refusal, a PAID 30M/15M", async () => {
    const r = await fresh("exit-declared", 2);
    expect(r.stage).toBe("done");
    const payout = r.payout as NonNullable<typeof r.payout>;
    expect(payout.headlineOfferMicroUsd).toBe(asMoney(30_000_000n));
    expect(payout.cashSliceMicroUsd).toBe(asMoney(15_000_000n));
    const report = r.report as CampaignReport;
    expect(report.edgesSpawned[0]?.manifest.cashSliceMicroUsd).toBe(asMoney(15_000_000n));
  }, 120_000);
});

/* ───────────────────────────── arm: exit-arc ───────────────────────────── */

describe("exit-arc arm — mid-chain declaration renders honestly as the quiet handoff", () => {
  it("engine witnesses: quiet-handoff terminal, exit edge visible, NO declared evidence", async () => {
    const r = await memo("exit-arc", 0);
    expect(r.stage).toBe("done");
    const report = r.report as CampaignReport;
    expect(report.campaignId).toBe("exit-the-heir-opens");
    expect(report.chapterRecords.map((row) => [row.nodeId, row.chapterId, row.outcome, row.stopReason])).toEqual([
      ["co", "x-1-armed-close", "won", "win:sell-accepted-above:0@60"],
      ["successor:exit-the-heir-opens:0", "x-2-heir-opens", "won", "win@60"],
    ]);
    const ending = r.ending as NonNullable<typeof r.ending>;
    expect(ending.kind).toBe("quiet-handoff");
    expect(ending.title).toBe("The Quiet Handoff");
    // The ending is the tour's last word: the x-2 terminal never declared,
    // so the evidence keys stay ABSENT — the bench must narrate that honestly.
    expect("declaredExitKind" in ending.evidence).toBe(false);
    expect("exitObserved" in ending.evidence).toBe(false);
    expect(report.edgesSpawned[0]?.manifest.cashSliceMicroUsd).toBe(asMoney(24_000_000n));
    const view = r.state.view as NonNullable<typeof r.state.view>;
    expect(view.declaredExitKind).toBeNull();
    const ledger = view.exitLedger as NonNullable<typeof view.exitLedger>;
    expect(ledger.declaredStr).toBe("—");
    expect(ledger.observedStr).toContain("mid-chain");
    expect(ledger.edgeCount).toBe(1);
    expect(ledger.adjustments).toHaveLength(4);
    // The x-1 payout repro still answers for the declaration-evidence rail.
    expect((r.payout as NonNullable<typeof r.payout>).headlineOfferMicroUsd).toBe(asMoney(48_000_000n));
  }, 240_000);

  it("twin determinism: digest and view byte-equal across independent runs", async () => {
    const a = await memo("exit-arc", 0);
    const b = await fresh("exit-arc", 0);
    expect(b.digest).toBe(a.digest);
    expect(JSON.stringify(b.state.view)).toBe(JSON.stringify(a.state.view));
  }, 300_000);

  it("offset 2 — the heir opens smaller, still PAID: 15M slice, 30M headline", async () => {
    const r = await fresh("exit-arc", 2);
    expect(r.stage).toBe("done");
    const report = r.report as CampaignReport;
    expect(report.edgesSpawned[0]?.manifest.cashSliceMicroUsd).toBe(asMoney(15_000_000n));
    expect(report.chapterRecords[1]?.cashStartMicroUsd).toBe(asMoney(15_000_000n));
    expect((r.payout as NonNullable<typeof r.payout>).headlineOfferMicroUsd).toBe(asMoney(30_000_000n));
  }, 240_000);
});

/* ─────────────────────────────── prose bank ─────────────────────────────── */

describe("epilogueProseFor — total over the closed exit-kind union", () => {
  it("all seven kinds resolve six lines + the two framing lines, zero slots", () => {
    const kinds = CAMPAIGN_EXIT_KINDS as readonly CampaignExitKind[];
    expect(kinds).toHaveLength(7);
    let threeCards = "";
    let handwriting = "";
    for (const kind of kinds) {
      const prose = epilogueProseFor(kind, 2026);
      const lines = [prose.headline, prose.body1, prose.body2, prose.body3, prose.profile];
      for (const line of lines) {
        expect(line.length, `${kind}: line non-empty`).toBeGreaterThan(0);
        expect(line, `${kind}: zero-slot (no brace survives the exact-set fill)`).not.toContain("{");
      }
      expect(prose.exitKind).toBe(kind);
      expect(threeCards === "" || prose.frameThreeCards === threeCards).toBe(true);
      expect(handwriting === "" || prose.frameHandwriting === handwriting).toBe(true);
      threeCards = prose.frameThreeCards;
      handwriting = prose.frameHandwriting;
    }
  });

  it("era-flat: the 1998 and 2026 resolutions are byte-identical (plain templates)", () => {
    const early = epilogueProseFor("strategic-acquisition", 1998);
    const late = epilogueProseFor("strategic-acquisition", 2026);
    expect(JSON.stringify(early)).toBe(JSON.stringify(late));
  });
});

/* ─────────────────────────── error lane + guards ─────────────────────────── */

describe("error lane + guards", () => {
  it("a forged doc whose close refutes its declaration surfaces DOC_LIE visibly (endings are observed)", async () => {
    // Tick-cap the declaring beat below its sale clock: the sim reaches the
    // doc's own last minute WITHOUT the sell-accepted verdict — the terminal
    // per-chapter walk must throw and the bench must carry the message, not
    // swallow it (this is the exact halt-doc falsifier the sim-core lane pins).
    const haltDoc = parseCampaignDoc({
      schema: "hh-campaign@1",
      id: "epilogue-halt-doc",
      name: "The Exit That Was Not",
      chapters: [
        { chapterId: "x-1-armed-close", scenarioId: "the-long-sale", tickCap: 30, exitKind: "strategic-acquisition" },
        { chapterId: "x-2-heir-opens", scenarioId: "the-quarter-that-ran-itself" },
      ],
      carry: CAMPAIGN_EXIT.carry,
    });
    const r = await runEpilogueDoc(haltDoc, 0);
    expect(r.stage).toBe("error");
    expect(r.state.error).toContain("DOC_LIE");
    expect(r.state.error).toContain("endings are observed, not authored");
    expect(r.state.view).toBeNull();
  }, 120_000);

  it("offsets outside the ratified 0..4 ladder refuse; unknown arms refuse", async () => {
    await expect(fresh("exit-arc", 5)).rejects.toThrow(RangeError);
    await expect(fresh("exit-arc", -1)).rejects.toThrow(/seedOffset/);
    await expect(runEpilogueArm("ipo-sunset" as EpilogueArm, 0)).rejects.toThrow(/unknown arm/);
  });
});

/* ───────────────────── worker-graph quarantine scan ───────────────────── */

describe("worker quarantine — the campaign bench never crosses the wire", () => {
  it("no worker-graph file mentions the campaign lane (main-thread bench only)", () => {
    for (const rel of [
      join("src", "worker", "sim.worker.ts"),
      join("src", "bridge", "fakeWorker.ts"),
      join("src", "runner", "index.ts"),
    ]) {
      const source = readFileSync(join(process.cwd(), rel), "utf8");
      expect(source.toLowerCase(), `${rel} must stay campaign-free`).not.toContain("campaign");
    }
  });
});
