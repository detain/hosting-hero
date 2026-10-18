/**
 * campaign/endings.ts — the campaign's terminal readout v0 (Act III rung,
 * wave-26 owner ruling). `endCampaign` is a PURE projection over a finished
 * `CampaignReport` and its final `CompanyNode`: it SELECTS which of three §9.9
 * endings the run earned and narrates it from facts the simulation already
 * owns. ZERO writes, ZERO new state — the state-freeze law of the whole
 * campaign module rides untouched: `chain.ts` never imports this file, nothing
 * `endCampaign` returns enters `digestCampaignReport`, and the function holds
 * no write path at all. It is a mouth, not a hand.
 *
 * The three kinds, and the exact law each is grounded in:
 *
 *  1. obituary      — the FINAL chapter is a loss. §9.9 "Failure is Narrated,
 *     Not Punished" (hg:35151-35158): "an obituary page with the real cause —
 *     derived from the simulation, not authored". The epitaph carries the
 *     terminal `stopReason` VERBATIM; the §9.9 guardrail is absolute — "the
 *     game is never funny at the moment of loss … dry and accurate, never a
 *     punchline" (hg:35160-35161).
 *  2. exit          — the FINAL chapter WON on the sell-accepted verdict
 *     grammar (`win:sell-accepted-above:…`), §1.5 "Sell the Company" — "the
 *     best possible campaign ending" (hg:4014-4021). v0 is VERDICT-OBSERVED
 *     ONLY: it reads the stopReason the (future) Act III exit chapter will emit
 *     and calls the ending — it does NOT mint a cashSlice, does NOT spawn an
 *     `exit` inheritance edge, and never touches `node.finances`. Selling is
 *     an OWNERSHIP event the money-untouched sell law reserves for the host
 *     (see economy sell-acceptance posture); this lane only narrates its verdict.
 *  3. quiet-handoff — everything else a run can end on: the company stood at
 *     the finish. §9.9 "The Quiet Handoff" — the infrastructure runs fine
 *     without you, the `Days Since Last Outage` counter "keeps going up after
 *     the credits start … the best ending available for a game with this
 *     thesis" (hg:35126-35128). Its evidence rides the records facet EXACTLY as
 *     disk holds it: `worstOutageSeconds` / `longestPerfectStreak` are the two
 *     outage/streak facts the save owns — there is no separate "days since last
 *     outage" number to read, so the readout quotes what exists rather than
 *     inventing one.
 *
 * SELECTION IS PRECEDENCE-ORDERED and TERMINAL-ONLY: a loss ANYWHERE earlier
 * does NOT select the ending — only the LAST chapter's outcome does. Mid-chain
 * death spawns a §9.9 heir and the tour walks on (chain.ts succession law); if
 * that heir wins the closing beat, the ending is a handoff, not an obituary.
 *
 * CEILINGS, recorded honestly — three owner walls this lane declines:
 *  - The Goal Card lens (L14, `node.goalCard`) is authoring metadata; a
 *    goal-declared ending needs a CampaignDoc goal field (doc-field = owner
 *    wall) — NOT taken here.
 *  - The seven §1.6 ExitKinds bridge (`node.succession.exitKind`) is opaque and
 *    content-pending (WS-3 taxonomy); mapping an ending onto a specific exit
 *    kind is an owner wall — endCampaign never reads or writes `exitKind`.
 *  - Due Diligence / valuation arithmetic (§1.5 :4017 "EBITDA adjusted for
 *    churn … clawed back in diligence") is NOT v0 — the exit ending is
 *    verdict-only, no multiple, no clawback. Refused.
 *
 * Import law: ../types + ../kernel/fixed + the save type surface + ./chain +
 * ./doc. No engine, no fs, no RNG (a pure read never rolls a die).
 */

import type { Fixed, MoneyUnit } from "../types.ts";
import { FIXED_SCALE } from "../kernel/fixed.ts";
import type { CampaignRunOutcome, CompanyNode } from "../save/index.ts";
import type { CampaignChapterRecord } from "./doc.ts";
import { CampaignError } from "./doc.ts";
import type { CampaignReport } from "./chain.ts";

/** The closed §9.9 ending vocabulary (roster order is decorative; SELECTION
 *  precedence — obituary beats exit beats quiet-handoff — lives in
 *  `selectKind` below). The three are mutually exclusive per terminal
 *  state (a beat cannot both die and be sold). */
export const ENDING_KINDS = ["obituary", "quiet-handoff", "exit"] as const;
export type CampaignEndingKind = (typeof ENDING_KINDS)[number];

/** One chapter's terminal line, projected for the readout. A COPY — the record
 *  itself never changes shape (the digest-prefix law of chain.ts). */
export interface CampaignChapterOutcome {
  readonly chapterId: string;
  readonly outcome: CampaignRunOutcome;
  readonly stopReason: string;
}

/** The facts the readout stands on. Every field is a verbatim read of an
 *  EXISTING facet — never a derived metric invented here. The records fields
 *  and `reputationBps` are OPTIONAL so a forged/legacy node that predates a
 *  facet yields `undefined` (absent/zero honest), never a crash. */
export interface CampaignEndingEvidence {
  readonly chapterOutcomes: readonly CampaignChapterOutcome[];
  readonly worstOutageSeconds?: number;
  readonly longestPerfectStreak?: number;
  readonly biggestCustomerMrrMicroUsd?: MoneyUnit;
  readonly costliestMistakeMicroUsd?: MoneyUnit;
  readonly medals: number;
  readonly scars: number;
  readonly reputationBps?: number;
  /** The terminal loss cause verbatim (§9.9) — non-null exactly when kind is
   *  "obituary". Structured so a consumer can act on the cause without parsing
   *  the narrated epitaph. */
  readonly deathStopReason: string | null;
}

/** The campaign's terminal readout — one object, fully frozen. */
export interface CampaignEnding {
  readonly kind: CampaignEndingKind;
  readonly title: string;
  readonly epitaph: string;
  readonly evidence: CampaignEndingEvidence;
}

/** Terminal WON on the sell-ACCEPTED verdict grammar (§1.5). Anchored prefix,
 *  never a substring test — the whole ANTI-LIE of this lane is that an
 *  executed sell-offer (the door verb RAN) is NOT an accepted sale, and a plain
 *  `win@` never matches. The exact future Act III string this awaits is
 *  `win:sell-accepted-above:<count>@<minute>` (sibling AC-S ships the predicate;
 *  endCampaign consumes only the resulting stopReason text). */
const SELL_ACCEPTED_SHAPE = /^win:sell-accepted-above:/;

const ENDING_TITLES: Record<CampaignEndingKind, string> = Object.freeze({
  // hg:35151 "Failure is Narrated, Not Punished" — the obituary page.
  obituary: "The Obituary",
  // hg:35123 "The Quiet Handoff".
  "quiet-handoff": "The Quiet Handoff",
  // hg:4014 "Sell the Company" — the run-up + the Due Diligence close.
  exit: "The Exit",
});

function selectKind(terminal: CampaignChapterRecord): CampaignEndingKind {
  // 1. obituary (hg:35151) — the FINAL beat is a loss. Earlier mid-chain
  //    losses do not select: they birth an heir (chain.ts) and the tour walks on.
  if (terminal.outcome === "lost") return "obituary";
  // 2. exit (hg:4014) — the FINAL beat WON on the sell-accepted verdict.
  if (terminal.outcome === "won" && SELL_ACCEPTED_SHAPE.test(terminal.stopReason)) return "exit";
  // 3. quiet-handoff (hg:35123) — the company stood at the end: the tour
  //    finished won, or the clock ran out (timeout) with no dissolution, no sale.
  return "quiet-handoff";
}

function epitaphFor(kind: CampaignEndingKind, terminal: CampaignChapterRecord): string {
  switch (kind) {
    case "obituary":
      // hg:35154-35155 — the real cause, straight from the simulation, verbatim.
      return `The company did not survive its last chapter. Cause, as the simulation recorded it: ${terminal.stopReason}.`;
    case "exit":
      // hg:4021-4023 — dry, no number: the verdict is the ending, not a valuation.
      return "The company was sold. The run-up closed, and every boring decision the game taught held.";
    case "quiet-handoff":
      // hg:35126-35128 — the board runs fine without you.
      return "You handed the company to your team and left. The board keeps its uptime; Days Since Last Outage keeps counting after the credits start.";
  }
}

/** Finite-number gate for a possibly-foreign records leaf (Law 4 at the read
 *  boundary): a missing/non-finite value is reported ABSENT, never coerced. */
function numberOrUndefined(value: number | undefined): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/** Bigint money gate — same absent-honest posture as numberOrUndefined. */
function moneyOrUndefined(value: MoneyUnit | undefined): MoneyUnit | undefined {
  return typeof value === "bigint" ? value : undefined;
}

/** Exact inverse of `reputation.ts` `fromRatio(overallBps, 10_000n)` — the save
 *  stores reputation as a Fixed ratio; the readout speaks the economy's bps.
 *  Round-half-away mirrors the kernel, so a value that came from an integer bps
 *  round-trips exactly (1500 bps in → 1500 out). Not an invented metric: it is
 *  the documented carrier the ledger itself wrote into `ReputationState.overall`. */
function fixedToBps(value: Fixed): number {
  const scaled = value * 10_000n;
  const negative = scaled < 0n;
  const magnitude = (negative ? -scaled : scaled) + FIXED_SCALE / 2n;
  return Number((negative ? -magnitude : magnitude) / FIXED_SCALE);
}

function readEvidence(
  report: CampaignReport,
  finalNode: CompanyNode,
  kind: CampaignEndingKind,
  terminal: CampaignChapterRecord,
): CampaignEndingEvidence {
  const chapterOutcomes = Object.freeze(
    report.chapterRecords.map((row) =>
      Object.freeze({ chapterId: row.chapterId, outcome: row.outcome, stopReason: row.stopReason }),
    ),
  );
  // Read every fact defensively: a legacy/forged node may lack a facet, and the
  // honest answer for a missing fact is absence (or a zero count), never a throw.
  const records = finalNode.records;
  const reputation = finalNode.reputation;
  const worst = numberOrUndefined(records?.worstOutageSeconds);
  const streak = numberOrUndefined(records?.longestPerfectStreak);
  const biggestMrr = moneyOrUndefined(records?.biggestCustomerMrrMicroUsd);
  const costliest = moneyOrUndefined(records?.costliestMistakeMicroUsd);
  const rep = typeof reputation?.overall === "bigint" ? fixedToBps(reputation.overall) : undefined;
  return Object.freeze({
    chapterOutcomes,
    ...(worst !== undefined ? { worstOutageSeconds: worst } : {}),
    ...(streak !== undefined ? { longestPerfectStreak: streak } : {}),
    ...(biggestMrr !== undefined ? { biggestCustomerMrrMicroUsd: biggestMrr } : {}),
    ...(costliest !== undefined ? { costliestMistakeMicroUsd: costliest } : {}),
    medals: Array.isArray(finalNode.medals) ? finalNode.medals.length : 0,
    scars: Array.isArray(finalNode.scars) ? finalNode.scars.length : 0,
    ...(rep !== undefined ? { reputationBps: rep } : {}),
    deathStopReason: kind === "obituary" ? terminal.stopReason : null,
  });
}

/**
 * Project the campaign's terminal readout. Pure (same report + same node →
 * deeply-equal frozen ending) and total over every reachable report: the closed
 * three-kind union covers loss-terminal, sell-won, and everything-else. The
 * empty report is the one illegal state and it fails loud at the boundary.
 */
export function endCampaign(report: CampaignReport, finalNode: CompanyNode): CampaignEnding {
  const terminal = report.chapterRecords.at(-1);
  if (terminal === undefined) {
    throw new CampaignError(`EMPTY at 'campaign "${report.campaignId}"': an ending needs at least one played chapter record`);
  }
  const kind = selectKind(terminal);
  return Object.freeze({
    kind,
    title: ENDING_TITLES[kind],
    epitaph: epitaphFor(kind, terminal),
    evidence: readEvidence(report, finalNode, kind, terminal),
  });
}
