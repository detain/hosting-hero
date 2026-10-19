/**
 * campaignLab.ts — the PURE model behind CampaignEpiloguePanel (wave-31 ask
 * (i), owner-commissioned): run the campaign's ENDING in the browser and
 * render its evidence + the authored §1.6 epilogue prose bank.
 *
 * unattendedLab.ts discipline rides this file whole: zero Vue imports (the
 * era arrives as a parameter; the panel's computed supplies getEra()), one
 * breathe() yield per LEG — the engine calls are atomic pure computations,
 * so pretend-progress inside them would be a lie — and every rendered
 * string is derived here, deterministically, pinned by __tests__.
 *
 * THE TWO HONEST CUTS (owner-briefed):
 *  1. No live obituary arm. Shipped campaign content cannot lose its FINAL
 *     beat on purpose — the terminal beat wins everywhere, and forcing a
 *     death would mean forging a doc-wire flip in the UI ("endings are
 *     observed, not authored" — endings.ts). The obituary RENDERER is proven
 *     total over the closed 3-kind union by an in-test forged CampaignReport
 *     (campaign/__tests__/endings.test.ts fixture idiom), labeled
 *     test-fixture on screen, never a live chip.
 *  2. No chips for the three parse-RESERVED exit kinds (ipo /
 *     management-buyout / wind-down — doc.ts refuses them at the wall).
 *     They are future observability, and a button that can never legally
 *     fire is UI fiction.
 *
 * Arms:
 *  - "exit-declared": a forged SINGLE-beat doc (x-1-armed-close re-plays
 *    the-long-sale declaring strategic-acquisition) so the TERMINAL chapter
 *    declares — the evidence grows declaredExitKind + exitObserved:true and
 *    the ending narrates "The Exit". Payout repro runs the authored chapter
 *    doc directly (the chain keeps only digests) → headline 48M, slice 24M.
 *  - "exit-arc": the shipped CAMPAIGN_EXIT (§E, L-V3). The declaration sits
 *    MID-chain, so the readout honest-narrates "The Quiet Handoff" while the
 *    run's exit EDGE (24M slice) stays visible as declaration-evidence.
 *
 * The epilogue bank (packages/content/packs/campaign.i18n.json, wave-29
 * L-RDR) is SIDE-LOADED here — deliberately NOT registered in packStore:
 * the bank is not shelf flavour (the wave-29 ruling), and registering it
 * would churn ~10 pins (PackId 14→15, header census, flavour pool 272/218,
 * per-root codex counts, era-trio flat-count, firmware twins…). The
 * reserved-bank carve-outs in loader/packs.ts make this exact parse legal.
 */
import type { EntityId, MoneyUnit, RunSeed } from "@hh/sim-core/types";
import { asEntityId, asMoney, asRunSeed } from "@hh/sim-core/types";
import type { LineageGraph, SettlementWrite } from "@hh/sim-core/save";
import { emptyLineageGraph, foundCompany, getNode, parseRunInstance, settleRun } from "@hh/sim-core/save";
import type {
  CampaignAuthority,
  CampaignChapterOutcome,
  CampaignDoc,
  CampaignEnding,
  CampaignEndingKind,
  CampaignExitKind,
  CampaignReport,
} from "@hh/sim-core/campaign";
import { digestCampaignReport, endCampaign, parseCampaignDoc, runCampaign } from "@hh/sim-core/campaign";
import { CAMPAIGN_EXIT, CHAPTER_AUTHORED_DOCS } from "@hh/sim-core/campaign/chapters";
import type { ScenarioDoc, ScenarioExitPayout, ScenarioRunConfig } from "@hh/sim-core/scenario";
import { runScenario, shippedScenario } from "@hh/sim-core/scenario";
import { fillTemplateBody, loadI18nPack, pickEraText } from "@hh/sim-core/loader";
import campaignBankRaw from "../../../../packages/content/packs/campaign.i18n.json?raw";
import { formatMoney, NO_DATA, tabularNumber } from "../chrome/numberLaw";

/* ═══════════════════════════ arms (closed) ═══════════════════════════ */

export const EPILOGUE_ARMS = Object.freeze(["exit-declared", "exit-arc"] as const);
export type EpilogueArm = (typeof EPILOGUE_ARMS)[number];

export type EpilogueStage = "idle" | "seeding" | "chain" | "pricing" | "projection" | "done" | "error";

/** The bench runs the five ratified seed offsets — the same 0..4 ladder the
 *  sim-core x5 census witnesses use, so the honest-scar offset (2) is
 *  reachable from the UI. Outside it the bench throws, never silently folds. */
export const EPILOGUE_MIN_OFFSET = 0;
export const EPILOGUE_MAX_OFFSET = 4;

const BASE_SEED = asRunSeed(904n);
const UNLOCK_TESTIMONY = ["waf-tier", "rack-b", "cdn-edge", "rack-a"];

/** The host-arm market catalog the exit arcs are DESIGNED for (chapters.ts
 *  §6 witness rates): strictly above the doc's own asks, near-certain on the
 *  9_500 bps accept ceiling — the sale is still dice. Keyed by chapterId so
 *  both arms' x-1 beat gets the same catalog. */
const EXIT_RATES: ReadonlyMap<string, ReadonlyMap<string, MoneyUnit>> = new Map([
  ["x-1-armed-close", new Map<string, MoneyUnit>([
    ["plan:long-sale", asMoney(40_000_000n)],
    ["sku:long-sale-b", asMoney(24_000_000n)],
  ])],
]);

/** The forged single-beat close: chapter x-1 re-used VERBATIM (same id ⇒ same
 *  seedForChapter seed ⇒ same dice), terminal ⇒ the declaration narrates.
 *  carry rides CAMPAIGN_EXIT.carry — inert for a single chapter (chain applies
 *  carry from index 1), present because the doc wall requires it. */
const EXIT_DECLARED_WIRE = {
  schema: "hh-campaign@1",
  id: "epilogue-exit-declared",
  name: "Epilogue Bench — The Declared Close",
  chapters: [
    { chapterId: "x-1-armed-close", scenarioId: "the-long-sale", exitKind: "strategic-acquisition" },
  ],
  carry: CAMPAIGN_EXIT.carry,
};
const EXIT_DECLARED_DOC: CampaignDoc = parseCampaignDoc(EXIT_DECLARED_WIRE);

/* ═══════════════════════ host composition (probe-verified recipe from
 * campaign/__tests__/chapters.test.ts:103-134 — the succession manifest's
 * 3-node law needs ≥3 distinctly unlocked nodes, pre-seeded as HOST ledger
 * testimony because no chapter batch ever writes nodesUnlocked) ═══════════ */

function founder(): { graph: LineageGraph; nodeId: EntityId } {
  let graph = emptyLineageGraph();
  ({ graph } = foundCompany(graph, { id: "co", name: "First Light Inc", eraOrigin: "2026", foundedAtTick: 0n }));
  return { graph, nodeId: asEntityId("co") };
}

function testimonyWrites(runId: string): SettlementWrite[] {
  return UNLOCK_TESTIMONY.map((node) => ({
    facet: "nodesUnlocked",
    payload: {
      node, via: "testimony", scarRef: null, incidentRef: null,
      stamp: null, stampAtTick: null, handwritingOwnerStaffId: null, faded: 0,
    },
  }));
}

function seedTestimony(graph: LineageGraph, nodeId: EntityId, runId = "pre-seed"): LineageGraph {
  return settleRun(graph, nodeId, parseRunInstance({
    runId, mode: "campaign", runSeed: 1n, startedAtTick: 0n, endedAtTick: 1n, outcome: "won",
    batch: { runId, mode: "campaign", committedAtTick: 1n, writes: testimonyWrites(runId) },
  }));
}

function resolveChapterDoc(scenarioId: string): ScenarioDoc {
  return CHAPTER_AUTHORED_DOCS[scenarioId] ?? shippedScenario(scenarioId);
}

const AUTHORITY: CampaignAuthority = {
  docOf: (scenarioId: string): ScenarioDoc => resolveChapterDoc(scenarioId),
  run: (doc, seed: RunSeed, config: ScenarioRunConfig) => runScenario(doc, seed, config),
};

/* ═══════════════════════════ run legs (progress-yielded) ═════════════════ */

/** Await the microtask/0-timeout boundary so Vue can paint the current stage
 *  before the next atomic block hogs the main thread. One yield per leg. */
function breathe(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

export interface EpiloguePanelState {
  readonly stage: EpilogueStage;
  readonly view: EpilogueView | null;
  readonly error: string | null;
}

/** Detailed record for the bench tests: the live report + engine projections
 *  behind the view, so a test can stand on engine truth, not display strings. */
export interface EpilogueRunRecord {
  readonly stage: "done" | "error";
  readonly state: EpiloguePanelState;
  readonly report: CampaignReport | null;
  readonly ending: CampaignEnding | null;
  readonly payout: ScenarioExitPayout | null;
  readonly digest: string | null;
}

function assertOffset(offset: number): void {
  if (!Number.isInteger(offset) || offset < EPILOGUE_MIN_OFFSET || offset > EPILOGUE_MAX_OFFSET) {
    throw new RangeError(
      `epilogue: seedOffset must be an integer ${EPILOGUE_MIN_OFFSET}..${EPILOGUE_MAX_OFFSET} — got ${offset}`,
    );
  }
}

function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

/** The payout repro: the chain stores only digests, so the bench re-runs the
 *  declaring chapter's OWN authored doc at its own chapter seed, bare against
 *  the same catalog + declaration — the same repro pattern the sim-core x5
 *  census uses. No paid-exit record ⇒ no repro (key honest: null). */
function reproducePayout(report: CampaignReport): ScenarioExitPayout | null {
  const declaring = report.chapterRecords.find(
    (row) => row.exitKind !== undefined && row.outcome === "won" && row.stopReason.startsWith("win:sell-accepted-above:"),
  );
  if (declaring === undefined || declaring.exitKind === undefined) return null;
  const catalog = EXIT_RATES.get(declaring.chapterId);
  if (catalog === undefined) return null;
  const config: ScenarioRunConfig = {
    sellMarketRates: catalog,
    exitDeclaration: { exitKind: declaring.exitKind },
  };
  const repro = runScenario(resolveChapterDoc(declaring.scenarioId), declaring.runSeed, config);
  return repro.exitPayout ?? null;
}

/** Shared engine seam for a CampaignDoc — runEpilogue dispatches here, and a
 *  test may drive a forged doc straight through it (the DOC_LIE error lane). */
export async function runEpilogueDoc(
  doc: CampaignDoc,
  offset: number,
  onStage: (stage: EpilogueStage) => void = () => undefined,
): Promise<EpilogueRunRecord> {
  assertOffset(offset);
  onStage("seeding");
  await breathe();
  try {
    const { graph, nodeId } = founder();
    const seeded = seedTestimony(graph, nodeId);
    onStage("chain");
    await breathe();
    const report = runCampaign(doc, BASE_SEED, {
      graph: seeded,
      nodeId,
      authority: AUTHORITY,
      seedOffset: offset,
      sellMarketRates: EXIT_RATES,
    });
    onStage("pricing");
    await breathe();
    const payout = reproducePayout(report);
    onStage("projection");
    await breathe();
    const ending = endCampaign(report, getNode(report.finalGraph, report.finalNodeId), doc);
    const digest = digestCampaignReport(report);
    const view = epilogueViewFor(ending, {
      source: "live",
      sourceNote: "live bench run",
      campaignId: report.campaignId,
      offset,
      report,
      payout,
      digest,
    });
    const state: EpiloguePanelState = { stage: "done", view, error: null };
    onStage("done");
    return { stage: "done", state, report, ending, payout, digest };
  } catch (error) {
    const state: EpiloguePanelState = { stage: "error", view: null, error: messageOf(error) };
    onStage("error");
    return { stage: "error", state, report: null, ending: null, payout: null, digest: null };
  }
}

export async function runEpilogue(
  arm: EpilogueArm,
  offset: number,
  onStage: (stage: EpilogueStage) => void = () => undefined,
): Promise<EpiloguePanelState> {
  return (await runEpilogueArm(arm, offset, onStage)).state;
}

export async function runEpilogueArm(
  arm: EpilogueArm,
  offset: number,
  onStage: (stage: EpilogueStage) => void = () => undefined,
): Promise<EpilogueRunRecord> {
  if (!EPILOGUE_ARMS.includes(arm)) {
    throw new RangeError(`epilogue: unknown arm "${String(arm)}" — the bench is total over [${EPILOGUE_ARMS.join(", ")}]`);
  }
  return runEpilogueDoc(arm === "exit-declared" ? EXIT_DECLARED_DOC : CAMPAIGN_EXIT, offset, onStage);
}

/* ═══════════════════════════ epilogue prose bank ═════════════════════════ */

const CAMPAIGN_BANK = loadI18nPack(JSON.parse(campaignBankRaw) as unknown);

export interface EpilogueProse {
  readonly exitKind: CampaignExitKind;
  readonly headline: string;
  readonly body1: string;
  readonly body2: string;
  readonly body3: string;
  readonly profile: string;
  readonly frameThreeCards: string;
  readonly frameHandwriting: string;
}

/** Resolve one kind's five lines + the two §1.6 prestige framing lines.
 *  Total over all SEVEN CAMPAIGN_EXIT_KINDS (the reserved three carry bank
 *  prose for the future observability rungs; no live chip reaches them).
 *  Bodies are era-FLAT today; routing through pickEraText + the caller's
 *  getEra()-tracking computed means a future rung lights for free. The bank
 *  is zero-slot by authorship — fillTemplateBody's exact-set law enforces it. */
export function epilogueProseFor(kind: CampaignExitKind, eraYear: number): EpilogueProse {
  const line = (suffix: string): string =>
    fillTemplateBody(pickEraText(CAMPAIGN_BANK, `codex.exit.${kind}.${suffix}`, eraYear), {}, `codex.exit.${kind}.${suffix}`);
  return Object.freeze({
    exitKind: kind,
    headline: line("headline"),
    body1: line("body1"),
    body2: line("body2"),
    body3: line("body3"),
    profile: line("profile"),
    frameThreeCards: fillTemplateBody(pickEraText(CAMPAIGN_BANK, "codex.exit.three-cards", eraYear), {}, "codex.exit.three-cards"),
    frameHandwriting: fillTemplateBody(pickEraText(CAMPAIGN_BANK, "codex.exit.handwriting", eraYear), {}, "codex.exit.handwriting"),
  });
}

/* ═══════════════════════════ display projections ═════════════════════════ */

export interface EpilogueEvidenceRow {
  readonly label: string;
  readonly value: string;
}

export interface EpilogueAdjustmentRow {
  readonly basis: string;
  readonly text: string;
}

export interface EpilogueExitLedger {
  /** "strategic-acquisition" (terminal declaration) or "—" (mid-chain edge:
   *  the tour's last word never declared, endings.ts:273-276). */
  readonly declaredStr: string;
  readonly observedStr: string;
  readonly edgeCount: number;
  readonly sliceStr: string;
  readonly headlineStr: string;
  readonly adjustments: readonly EpilogueAdjustmentRow[];
}

export interface EpilogueView {
  readonly source: "live" | "fixture";
  readonly sourceNote: string;
  readonly campaignId: string;
  readonly offset: number;
  readonly kind: CampaignEndingKind;
  readonly title: string;
  readonly epitaph: string;
  readonly evidenceRows: readonly EpilogueEvidenceRow[];
  readonly chapterTape: readonly CampaignChapterOutcome[];
  /** Present ONLY when the evidence carries the terminal declaration; the
   *  panel feeds it (plus getEra()) to epilogueProseFor. */
  readonly declaredExitKind: CampaignExitKind | null;
  /** Present when a declaration or a paid exit edge exists — the sale's facts. */
  readonly exitLedger: EpilogueExitLedger | null;
  /** digestCampaignReport for live runs; null for the test fixture (honest:
   *  a forged report has no bench digest claim to make). */
  readonly digest: string | null;
}

interface EpilogueViewSource {
  readonly source: "live" | "fixture";
  readonly sourceNote: string;
  readonly campaignId: string;
  readonly offset: number;
  readonly report: CampaignReport | null;
  readonly payout: ScenarioExitPayout | null;
  readonly digest: string | null;
}

function bpsText(factorBps: bigint): string {
  return `${tabularNumber(Number(factorBps))} bps of 10,000`;
}

function evidenceRowsFor(ending: CampaignEnding): readonly EpilogueEvidenceRow[] {
  const e = ending.evidence;
  return Object.freeze([
    Object.freeze({ label: "Medals", value: tabularNumber(e.medals) }),
    Object.freeze({ label: "Scars", value: tabularNumber(e.scars) }),
    Object.freeze({ label: "Reputation", value: e.reputationBps === undefined ? NO_DATA : `${tabularNumber(e.reputationBps)} bps` }),
    Object.freeze({ label: "Worst outage", value: e.worstOutageSeconds === undefined ? NO_DATA : `${tabularNumber(e.worstOutageSeconds)} s` }),
    Object.freeze({ label: "Longest perfect streak", value: e.longestPerfectStreak === undefined ? NO_DATA : tabularNumber(e.longestPerfectStreak) }),
    Object.freeze({ label: "Biggest customer MRR", value: e.biggestCustomerMrrMicroUsd === undefined ? NO_DATA : formatMoney(e.biggestCustomerMrrMicroUsd) }),
    Object.freeze({ label: "Costliest mistake", value: e.costliestMistakeMicroUsd === undefined ? NO_DATA : formatMoney(e.costliestMistakeMicroUsd) }),
    // deathStopReason is string|null BY TYPE — null is the VALUE "did not die",
    // not an absent facet; "?" (NO_DATA) stays reserved for truly absent facts.
    Object.freeze({ label: "Death cause", value: e.deathStopReason ?? "—" }),
  ]);
}

function exitLedgerFor(
  ending: CampaignEnding,
  report: CampaignReport | null,
  payout: ScenarioExitPayout | null,
): EpilogueExitLedger | null {
  const e = ending.evidence;
  const edges = report?.edgesSpawned ?? [];
  const exitEdge = edges.find((edge) => edge.type === "exit") ?? null;
  if (e.declaredExitKind === undefined && exitEdge === null) return null;
  // A mid-chain declaration never reaches the evidence (only a TERMINAL
  // chapter's declaration narrates) — the exit edge IS the witness there.
  const observed =
    e.declaredExitKind !== undefined
      ? e.exitObserved === true ? "observed — the sell-accepted verdict landed"
        : e.exitObserved === false ? "declared, never observed — failure is narrated"
          : "—"
      : exitEdge !== null ? "validated mid-chain — the heir played on, the ending stays the tour's last word"
        : "—";
  const slice = exitEdge === null ? undefined : exitEdge.manifest.cashSliceMicroUsd;
  return Object.freeze({
    declaredStr: e.declaredExitKind ?? "—",
    observedStr: observed,
    edgeCount: edges.length,
    sliceStr: slice === undefined || slice === null ? NO_DATA : formatMoney(slice),
    headlineStr: payout === null ? NO_DATA : formatMoney(payout.headlineOfferMicroUsd),
    adjustments: Object.freeze((payout?.adjustments ?? []).map((row) =>
      Object.freeze({ basis: row.basis, text: bpsText(row.factorBps) }))),
  });
}

export function epilogueViewFor(ending: CampaignEnding, o: EpilogueViewSource): EpilogueView {
  return Object.freeze({
    source: o.source,
    sourceNote: o.sourceNote,
    campaignId: o.campaignId,
    offset: o.offset,
    kind: ending.kind,
    title: ending.title,
    epitaph: ending.epitaph,
    evidenceRows: evidenceRowsFor(ending),
    chapterTape: ending.evidence.chapterOutcomes,
    declaredExitKind: ending.evidence.declaredExitKind ?? null,
    exitLedger: exitLedgerFor(ending, o.report, o.payout),
    digest: o.digest,
  });
}

/** The obituary's ONLY renderer path: a test-forged CampaignEnding (never a
 *  live chip — see the header's honest cuts). Labeled fixture in the view. */
export function epilogueFixtureState(
  ending: CampaignEnding,
  sourceNote = "test fixture — shipped content cannot reach this ending live",
): EpiloguePanelState {
  return {
    stage: "done",
    view: epilogueViewFor(ending, {
      source: "fixture",
      sourceNote,
      campaignId: "forged-fixture",
      offset: 0,
      report: null,
      payout: null,
      digest: null,
    }),
    error: null,
  };
}
