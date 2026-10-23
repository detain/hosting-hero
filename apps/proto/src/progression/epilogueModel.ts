/**
 * progression/epilogueModel.ts — PURE view-projection over a finished
 * campaign: the endCampaign ending (all three §1.6 kinds — obituary, the
 * Exit, the Quiet Handoff), plus, when the host carries them, the scenario
 * exitPayout legs, the museum shelf, and the save's succession record.
 *
 * g5 projection law, kept whole:
 * - report-in, view-out. ZERO engine hexes re-derived, zero aggregates
 *   invented — medals and scars are engine-counted numbers, this file only
 *   re-formats what each field already says.
 * - EVERY rendered value ships an explain line naming the exact engine
 *   field it was read from (as-of reads, no smearing between shapes).
 * - Absent data renders the honest NO_DATA mark or an explicit "no payout"
 *   line — never a silent 0, never a fabricated leg.
 * - The whole projection deep-freezes before returning.
 *
 * The brief's phrasing "museum rows, exitPayout (when present)" splits in
 * the real engine: endCampaign itself carries neither — exitPayout rides
 * the ScenarioReport (valuation leaf) and the museum lives on the save's
 * CompanyNode. Both therefore arrive as optional plain-data props, exactly
 * as the Sim Lab bench and the campaign player each already hold them.
 */
import type { CampaignEnding } from "@hh/sim-core/campaign";
import type { MuseumExhibitRecord, Succession } from "@hh/sim-core/save";
import type { ScenarioExitPayout } from "@hh/sim-core/scenario";
import { formatMoney, NO_DATA, tabularNumber } from "../chrome/numberLaw";

export interface EpilogueExplain {
  /** The exact engine field (or composition of named fields) read. */
  readonly formula: string;
  /** The values the formula consumed — verbatim, stringified at boundary. */
  readonly inputs: readonly { readonly name: string; readonly value: string }[];
}

/** One label/value widget with its explain-this-number payload attached. */
export interface EpilogueFact {
  readonly label: string;
  readonly value: string;
  readonly explain: EpilogueExplain;
}

/** The money-at-the-end headline/slice pair plus its diligence legs. */
export interface EpilogueMoney {
  readonly exitKind: string;
  readonly headline: EpilogueFact;
  readonly slice: EpilogueFact;
  readonly legs: readonly EpilogueFact[];
}

/** One museum shelf row, provenance carried like the save records it. */
export interface EpilogueMuseumRow {
  readonly id: string;
  readonly title: string;
  readonly onShelf: boolean;
  readonly provenance: EpilogueFact;
  readonly note: string | null;
}

/** The mount-ready epilogue view. */
export interface EpilogueView {
  readonly kind: CampaignEnding["kind"];
  readonly title: string;
  readonly epitaph: string;
  /** null unless the report carries a payout; then the honest absence line. */
  readonly money: EpilogueMoney | null;
  /** Set EXACTLY when money is null — the card states the absence. */
  readonly moneyAbsentLine: string | null;
  readonly death: EpilogueFact | null;
  readonly declaredExit: EpilogueFact | null;
  readonly successionFacts: readonly EpilogueFact[];
  readonly facts: readonly EpilogueFact[];
  readonly museum: readonly EpilogueMuseumRow[];
}

export interface EpilogueInput {
  readonly ending: CampaignEnding;
  readonly payout?: ScenarioExitPayout | null | undefined;
  readonly museum?: readonly MuseumExhibitRecord[] | null | undefined;
  readonly succession?: Succession | null | undefined;
}

function fact(
  label: string,
  value: string,
  formula: string,
  inputs: readonly { readonly name: string; readonly value: string }[],
): EpilogueFact {
  return Object.freeze({ label, value, explain: Object.freeze({ formula, inputs: Object.freeze(inputs) }) });
}

function moneyView(payout: ScenarioExitPayout): EpilogueMoney {
  const headline = fact(
    "Headline offer",
    formatMoney(payout.headlineOfferMicroUsd),
    "ScenarioExitPayout.headlineOfferMicroUsd — the sum of ACCEPTED sell offers the engine rolled at close; this card only re-formats it.",
    [{ name: "headlineOfferMicroUsd", value: payout.headlineOfferMicroUsd.toString() }],
  );
  const slice = fact(
    "Cash slice",
    formatMoney(payout.cashSliceMicroUsd),
    "ScenarioExitPayout.cashSliceMicroUsd — the valuation leaf's slice of the headline, never above it.",
    [{ name: "cashSliceMicroUsd", value: payout.cashSliceMicroUsd.toString() }],
  );
  const legs = payout.adjustments.map((adjustment) =>
    fact(
      adjustment.basis,
      `${tabularNumber(Number(adjustment.factorBps))} bps of 10,000`,
      "ValuationAdjustment leg — factorBps of 10,000; diligence knocks price off (never above 1.0).",
      [{ name: "factorBps", value: adjustment.factorBps.toString() }],
    ),
  );
  legs.forEach(Object.freeze);
  return Object.freeze({
    exitKind: payout.exitKind,
    headline,
    slice,
    legs: Object.freeze(legs),
  });
}

/** campaignLab's observed-str law, kept verbatim so both surfaces agree. */
function observedStr(ending: CampaignEnding): string {
  if (ending.evidence.exitObserved === true) {
    return "observed — the sell-accepted verdict landed";
  }
  if (ending.evidence.exitObserved === false) {
    return "declared, never observed — failure is narrated";
  }
  return NO_DATA;
}

function evidenceFacts(ending: CampaignEnding): readonly EpilogueFact[] {
  const evidence = ending.evidence;
  const read = (field: string) => `CampaignEndingEvidence.${field} — read as-of, this card never sums.`;
  const facts: EpilogueFact[] = [
    fact("Medals", String(evidence.medals), read("medals"), [
      { name: "medals", value: String(evidence.medals) },
    ]),
    fact("Scars", String(evidence.scars), read("scars"), [
      { name: "scars", value: String(evidence.scars) },
    ]),
    fact(
      "Reputation",
      evidence.reputationBps === undefined ? NO_DATA : `${tabularNumber(Number(evidence.reputationBps))} bps`,
      read("reputationBps"),
      [{ name: "reputationBps", value: evidence.reputationBps?.toString() ?? NO_DATA }],
    ),
    fact(
      "Worst outage",
      evidence.worstOutageSeconds === undefined ? NO_DATA : `${tabularNumber(evidence.worstOutageSeconds)} s`,
      read("worstOutageSeconds"),
      [{ name: "worstOutageSeconds", value: evidence.worstOutageSeconds === undefined ? NO_DATA : String(evidence.worstOutageSeconds) }],
    ),
    fact(
      "Longest perfect streak",
      evidence.longestPerfectStreak === undefined ? NO_DATA : tabularNumber(evidence.longestPerfectStreak),
      read("longestPerfectStreak"),
      [{ name: "longestPerfectStreak", value: evidence.longestPerfectStreak === undefined ? NO_DATA : String(evidence.longestPerfectStreak) }],
    ),
    fact(
      "Biggest customer MRR",
      evidence.biggestCustomerMrrMicroUsd === undefined ? NO_DATA : formatMoney(evidence.biggestCustomerMrrMicroUsd),
      read("biggestCustomerMrrMicroUsd"),
      [{ name: "biggestCustomerMrrMicroUsd", value: evidence.biggestCustomerMrrMicroUsd?.toString() ?? NO_DATA }],
    ),
    fact(
      "Costliest mistake",
      evidence.costliestMistakeMicroUsd === undefined ? NO_DATA : formatMoney(evidence.costliestMistakeMicroUsd),
      read("costliestMistakeMicroUsd"),
      [{ name: "costliestMistakeMicroUsd", value: evidence.costliestMistakeMicroUsd?.toString() ?? NO_DATA }],
    ),
  ];
  facts.forEach(Object.freeze);
  return Object.freeze(facts);
}

function museumRows(museum: readonly MuseumExhibitRecord[]): readonly EpilogueMuseumRow[] {
  return Object.freeze(
    museum.map((exhibit) =>
      Object.freeze({
        id: exhibit.id,
        title: exhibit.title,
        onShelf: exhibit.deprecated === false,
        provenance: fact(
          "Provenance",
          `run ${String(exhibit.runId)} · seed ${exhibit.runSeed.toString()} · tick ${exhibit.acquiredAtTick.toString()}`,
          "MuseumExhibitRecord run+seed+tick — the provenance law: every exhibit names the run that earned it.",
          [
            { name: "runId", value: String(exhibit.runId) },
            { name: "runSeed", value: exhibit.runSeed.toString() },
            { name: "acquiredAtTick", value: exhibit.acquiredAtTick.toString() },
          ],
        ),
        note: exhibit.memorialNote,
      }),
    ),
  );
}

/**
 * Build the mount-ready epilogue view. Every input rides the engine's own
 * type shapes (CampaignEnding from endCampaign, optional ScenarioExitPayout,
 * MuseumExhibitRecord[], Succession) — nothing here parses or guesses.
 */
export function buildEpilogueView(input: EpilogueInput): EpilogueView {
  const { ending } = input;

  const successionFacts: EpilogueFact[] = [];
  const outcomes = ending.evidence.chapterOutcomes;
  const terminal = outcomes[outcomes.length - 1];
  if (terminal !== undefined) {
    successionFacts.push(
      fact(
        "Final beat",
        `${terminal.chapterId} — ${terminal.outcome} · ${terminal.stopReason}`,
        "CampaignEndingEvidence.chapterOutcomes — the terminal chapter row, endCampaign's own selection.",
        [
          { name: "chapterId", value: terminal.chapterId },
          { name: "outcome", value: String(terminal.outcome) },
          { name: "stopReason", value: String(terminal.stopReason) },
        ],
      ),
    );
  }
  if (input.succession !== null && input.succession !== undefined) {
    successionFacts.push(
      fact(
        "Succession",
        input.succession.exitKind === null
          ? input.succession.type
          : `${input.succession.type} · ${input.succession.exitKind}`,
        "CompanyNode.succession — the save's lineage record, carried beside the ending.",
        [
          { name: "type", value: input.succession.type },
          { name: "exitKind", value: input.succession.exitKind ?? NO_DATA },
        ],
      ),
    );
  }
  successionFacts.forEach(Object.freeze);

  const death =
    ending.evidence.deathStopReason === null
      ? null
      : fact(
          "Death cause",
          ending.evidence.deathStopReason,
          "CampaignEndingEvidence.deathStopReason — the terminal stopReason VERBATIM (§9.9: the real cause, derived, not authored).",
          [{ name: "deathStopReason", value: ending.evidence.deathStopReason }],
        );

  const declaredExit =
    ending.evidence.declaredExitKind === undefined
      ? null
      : fact(
          "Declared exit",
          `${ending.evidence.declaredExitKind} — ${observedStr(ending)}`,
          "CampaignEndingEvidence.declaredExitKind and exitObserved — the declaration and whether the market ever answered it.",
          [
            { name: "declaredExitKind", value: ending.evidence.declaredExitKind },
            { name: "exitObserved", value: ending.evidence.exitObserved === undefined ? NO_DATA : String(ending.evidence.exitObserved) },
          ],
        );

  const view: EpilogueView = {
    kind: ending.kind,
    title: ending.title,
    epitaph: ending.epitaph,
    money: input.payout === null || input.payout === undefined ? null : moneyView(input.payout),
    moneyAbsentLine:
      input.payout === null || input.payout === undefined
        ? "No payout on this record — the company never sold, or the run died before any offer was taken."
        : null,
    death,
    declaredExit,
    successionFacts: Object.freeze(successionFacts),
    facts: evidenceFacts(ending),
    museum: museumRows(input.museum ?? []),
  };
  return Object.freeze(view);
}
