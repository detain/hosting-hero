/**
 * progression/unlockModel.ts — PURE projection over the sim-core unlocks
 * library (@hh/sim-core/unlocks): codex-ladder cards, prereq-lattice lines,
 * and fired unlock proposals, mapped to the three honest ledger bands
 * (earned / next / locked). This file is the first consumer of that library
 * anywhere in apps/proto; it adds no engine authority — every verdict comes
 * from the library's own functions, and every line here only re-formats.
 *
 * Contract laws (mirroring §8.8 readability + g5 projection discipline):
 * - No engine hexes, no RNG, no clocks: report-in, view-out, deterministic.
 * - Row order is code-unit (chrome/textLaw compareCodeUnits) for the data
 *   families; proposals ride their FIRING ORDER — the library's own record
 *   law (triggers.ts docblock), never re-sorted into a lie.
 * - The whole projection deep-freezes before returning.
 * - Vocabulary: nothing here invents causes. Gaps come from nextCodexGap,
 *   locks from whatBlocks, weather from isDemotedToWeather — verbatim law
 *   once converted to sentences.
 */
import {
  canUnlock,
  codexStageFor,
  CODEX_LADDER_DEFAULTS,
  isDemotedToWeather,
  nextCodexGap,
  parsePrereqSets,
  UnlocksError,
  WEATHER_DEMOTION_BAND,
  whatBlocks,
} from "@hh/sim-core/unlocks";
import type {
  CodexLadderConfig,
  CodexStage,
  PrereqBlocker,
  PrereqSetLike,
  UnlockProposal,
  UnlockTriggerKind,
} from "@hh/sim-core/unlocks";
import { compareCodeUnits } from "../chrome/textLaw";

/** One codex entry the ledger tracks: a threat family card and its counters. */
export interface UnlockLedgerCard {
  readonly id: string;
  /** Display name; falls back to the id when absent. */
  readonly label?: string | undefined;
  readonly sightings: number;
  readonly counters: number;
}

/** One prereq-lattice line: what a host gates behind a satisfied route. */
export interface UnlockLedgerLine {
  readonly id: string;
  readonly label?: string | undefined;
  readonly sets: readonly PrereqSetLike[];
}

/** Everything the ledger renders; all families optional (an empty ledger is honest). */
export interface UnlockLedgerInput {
  readonly cards?: readonly UnlockLedgerCard[] | undefined;
  readonly lines?: readonly UnlockLedgerLine[] | undefined;
  /** Ids the player has already satisfied (feeds canUnlock/whatBlocks). */
  readonly satisfied?: readonly string[] | undefined;
  /** Proposals as the observer recorded them — FIRING ORDER is the record. */
  readonly proposals?: readonly UnlockProposal[] | undefined;
  readonly ladder?: CodexLadderConfig | undefined;
}

export type UnlockLedgerBand = "earned" | "next" | "locked";

/** A single rendered ledger row. `shape` discriminates its origin family. */
export interface UnlockLedgerRow {
  readonly shape: "card" | "line" | "proposal";
  readonly id: string;
  readonly label: string;
  /** Codex stage for card rows that have one (band "next"); null otherwise. */
  readonly stage: CodexStage | null;
  /** Gap sentence for card rows (band "next" and "locked"); null otherwise. */
  readonly gap: string | null;
  /** Honest reason line for earned rows and locked line rows; null otherwise. */
  readonly note: string | null;
  /** Locked line rows: one readable blocker per declared route; null otherwise. */
  readonly locks: readonly string[] | null;
  /** Proposal rows: which trigger kind fired; null for the data families. */
  readonly via: UnlockTriggerKind | null;
}

/** The mount-ready view: three bands plus the census that titles them. */
export interface UnlockLedgerView {
  readonly earned: readonly UnlockLedgerRow[];
  readonly next: readonly UnlockLedgerRow[];
  readonly locked: readonly UnlockLedgerRow[];
  readonly census: {
    readonly earned: number;
    readonly next: number;
    readonly locked: number;
  };
}

function sortedUniqueIds(rows: readonly { readonly id: string }[], family: string): void {
  for (let i = 1; i < rows.length; i = i + 1) {
    const previous = rows[i - 1] as { readonly id: string };
    const current = rows[i] as { readonly id: string };
    if (previous.id === current.id) {
      throw new UnlocksError(
        "bad-value",
        family,
        `duplicate ${family} id "${current.id}" — the ledger maps one row per id`,
      );
    }
  }
}

/** nextCodexGap verdict converted to one honest sentence; the library decides. */
function gapText(card: UnlockLedgerCard, config: CodexLadderConfig): string {
  const gap = nextCodexGap({ sightings: card.sightings, counters: card.counters }, config);
  if (gap.next === null) {
    // Mastered (or an all-the-way-up row): nextCodexGap reports the top.
    return "at the top of the ladder";
  }
  if (gap.remaining === 1) {
    // "1 more sighting → analyzed" style: singular reads true for one event.
    const unit = gap.evidence === null ? "event" : gap.evidence.replace(/s$/, "");
    return `1 more ${unit} → ${gap.next}`;
  }
  return `${gap.remaining} more ${gap.evidence ?? "events"} → ${gap.next}`;
}

function cardRows(
  cards: readonly UnlockLedgerCard[],
  config: CodexLadderConfig,
  earned: UnlockLedgerRow[],
  next: UnlockLedgerRow[],
  locked: UnlockLedgerRow[],
): void {
  for (const card of cards) {
    const stage = codexStageFor({ sightings: card.sightings, counters: card.counters }, config);
    const base = { shape: "card" as const, id: card.id, label: card.label ?? card.id };
    if (stage === null) {
      locked.push({ ...base, stage: null, gap: gapText(card, config), note: null, locks: null, via: null });
      continue;
    }
    if (isDemotedToWeather(card.counters, config)) {
      earned.push({
        ...base,
        stage,
        gap: null,
        note: `mastered — the ${WEATHER_DEMOTION_BAND} plays by itself now`,
        locks: null,
        via: null,
      });
      continue;
    }
    next.push({ ...base, stage, gap: gapText(card, config), note: null, locks: null, via: null });
  }
}

function lineRows(
  lines: readonly UnlockLedgerLine[],
  satisfied: ReadonlySet<string>,
  earned: UnlockLedgerRow[],
  locked: UnlockLedgerRow[],
): void {
  for (const line of lines) {
    const base = { shape: "line" as const, id: line.id, label: line.label ?? line.id };
    const parsed = parsePrereqSets([...line.sets], `lines["${line.id}"].prereqSets`);
    if (canUnlock(parsed, satisfied)) {
      earned.push({
        ...base,
        stage: null,
        gap: null,
        note:
          parsed.length === 0
            ? "authored-ungated — the line declares no lock"
            : "a declared route is satisfied",
        locks: null,
        via: null,
      });
      continue;
    }
    const blockers: readonly PrereqBlocker[] = whatBlocks(parsed, satisfied);
    const locks = blockers.map(
      (blocker) =>
        `route ${blocker.setIndex} — ` +
        [
          blocker.missingTech.length > 0
            ? `tech: ${blocker.missingTech.join(", ")}`
            : null,
          blocker.missingCommercial.length > 0
            ? `commercial: ${blocker.missingCommercial.join(", ")}`
            : null,
          blocker.missingAlt === null ? null : `alt route: ${blocker.missingAlt}`,
        ]
          .filter((part): part is string => part !== null)
          .join(" · "),
    );
    locked.push({ ...base, stage: null, gap: null, note: null, locks, via: null });
  }
}

function proposalRows(proposals: readonly UnlockProposal[], earned: UnlockLedgerRow[]): void {
  for (const proposal of proposals) {
    const targetRef = proposal.targetRef as string;
    earned.push({
      shape: "proposal",
      id: targetRef,
      label: targetRef,
      stage: null,
      gap: null,
      note: `fired via ${proposal.via} at tick ${proposal.atTick.toString()} — ${proposal.causeId}`,
      locks: null,
      via: proposal.via,
    });
  }
}

/**
 * Build the mount-ready unlock ledger view. Fail-loud on structural garbage
 * (duplicate ids, malformed prereq sets) via the library's own error family;
 * value-level refusals (unsatisfied routes) become honest locked rows.
 */
export function buildUnlockLedger(input: UnlockLedgerInput): UnlockLedgerView {
  const config: CodexLadderConfig = input.ladder ?? CODEX_LADDER_DEFAULTS;
  const satisfied = new Set<string>(input.satisfied ?? []);

  const cards = [...(input.cards ?? [])].sort((a, b) => compareCodeUnits(a.id, b.id));
  sortedUniqueIds(cards, "cards");
  const lines = [...(input.lines ?? [])].sort((a, b) => compareCodeUnits(a.id, b.id));
  sortedUniqueIds(lines, "lines");

  const earned: UnlockLedgerRow[] = [];
  const next: UnlockLedgerRow[] = [];
  const locked: UnlockLedgerRow[] = [];

  cardRows(cards, config, earned, next, locked);
  lineRows(lines, satisfied, earned, locked);
  // Firing order is the record — proposals ride the observer's sequence.
  proposalRows(input.proposals ?? [], earned);

  earned.forEach(Object.freeze);
  next.forEach(Object.freeze);
  locked.forEach(Object.freeze);
  const view: UnlockLedgerView = {
    earned: Object.freeze(earned),
    next: Object.freeze(next),
    locked: Object.freeze(locked),
    census: Object.freeze({
      earned: earned.length,
      next: next.length,
      locked: locked.length,
    }),
  };
  return Object.freeze(view);
}
