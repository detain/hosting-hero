/**
 * Mode write-access matrix — OD-8, PENDING OWNER DECISION.
 *
 * Appendix C §2.5 poses three options (A bypass / B ledger-only / C diegetic
 * staffing) and explicitly says "not decided". DECISIONS-PENDING.md OD-8
 * carries the specialist recommendation (B) but the owner has NOT ratified.
 * This file therefore ENCODES THE INDETERMINACY AS DATA rather than silently
 * choosing:
 *
 *  - `campaign` rows ship LIVE (full-carry writes, L18 — the doc is
 *    unambiguous there, and the game is unplayable without them);
 *  - EVERY row for the contested modes (scenario, endless, daily, consultant,
 *    blitz) is status PENDING: the declared `kind` is the Option-B RECOMMENDED
 *    semantics stored as reference data (so ratification is a status flip,
 *    not a redesign), and `writeGuard()` THROWS naming OD-8 on any attempt to
 *    exercise a contested row.
 *  - endless is contested too: §2.5 argues it is "the Long Save continuing in
 *    place", but the register keeps it under OD-8 — we do not pre-decide.
 *
 * The write protocol underneath (Appendix C §2.4): modes NEVER mutate the
 * Company mid-run; a run accumulates a `writes[]` batch that is committed at
 * SETTLEMENT, and `writeGuard(mode, facet)` is the commit-time gate.
 */

import { fail } from "./errors.ts";

export type SaveMode = "campaign" | "scenario" | "endless" | "daily" | "consultant" | "blitz";

export const SAVE_MODES: readonly SaveMode[] = ["campaign", "scenario", "endless", "daily", "consultant", "blitz"];

/** How a committed write-batch row may touch one facet.
 *  - append:   event-spine only — the batch appends facts, never rewrites;
 *  - instance: bounded projection/state — the batch replaces the value;
 *  - deny:     the facet is invisible to this mode at settlement. */
export type WriteKind = "append" | "instance" | "deny";

export type RowStatus = "LIVE" | "PENDING_OD8";

/** The ~30 write facets (the faces compile READ views over these — the
 *  facet list is storage, the Wall/Scrapbook/Almanac/People faces in faces.ts
 *  are projections; never confuse the two, WS-6 R6). */
export const WRITE_FACETS = [
  "staff",
  "alumni",
  "spineCast",
  "culture",
  "scars",
  "scarsRetired",
  "postmortems",
  "ghosts",
  "habits",
  "deadDrives",
  "hardware",
  "unlockDraftsPassed",
  "nodesUnlocked",
  "credentials",
  "medals",
  "linesEverRun",
  "codex",
  "customerBooks",
  "reputation",
  "creditGrade",
  "theMultiple",
  "attributionEvents",
  "records",
  "annualReports",
  "finances",
  "playbook",
  "wiki",
  "anticipation",
  "researchQueue",
  "constraintCards",
  "museum",
  "streaksShared",
] as const;

export type WriteFacet = (typeof WRITE_FACETS)[number];

export interface WriteAccessRow {
  readonly mode: SaveMode;
  readonly facet: WriteFacet;
  readonly kind: WriteKind;
  readonly status: RowStatus;
  readonly note: string;
}

/* ═══════════════════════ the declarative table ═══════════════════════ */

/** Facets whose truth is an event spine (append) vs a bounded value
 *  (instance). Mode-independent classification. */
const APPEND_FACETS: ReadonlySet<WriteFacet> = new Set<WriteFacet>([
  "staff",
  "alumni",
  "spineCast",
  "scars",
  "scarsRetired",
  "postmortems",
  "ghosts",
  "deadDrives",
  "hardware",
  "unlockDraftsPassed",
  "nodesUnlocked",
  "credentials",
  "medals",
  "linesEverRun",
  "customerBooks",
  "attributionEvents",
  "records",
  "annualReports",
  "museum",
  "streaksShared",
]);

function campaignRow(facet: WriteFacet): WriteAccessRow {
  const kind: WriteKind = APPEND_FACETS.has(facet) ? "append" : "instance";
  return { mode: "campaign", facet, kind, status: "LIVE", note: "L18: campaign full-carry — the Long Save's home mode." };
}

/** Option-B recommended semantics, stored as DATA for the pending modes.
 *  Ratifying B = flipping status to LIVE; ratifying A = deny everywhere but
 *  codex-seen; ratifying C = bespoke rows. The recommendation is NOT applied. */
function optionBRecommendedKind(mode: SaveMode, facet: WriteFacet): WriteKind {
  // §2.5-B: shadow instances write ONLY records, medals, streaks (mode-stamped),
  // codex stages, intel currency. NEVER scars, reputation, customer_book, cash.
  const ledgerSet: ReadonlySet<WriteFacet> = new Set<WriteFacet>(["records", "medals", "streaksShared", "codex"]);
  if (mode === "endless") {
    // §2.5: endless is "the Long Save continuing in place" — same node,
    // quarterly commits; recommended row mirrors campaign semantics.
    return APPEND_FACETS.has(facet) ? "append" : "instance";
  }
  return ledgerSet.has(facet) ? "append" : "deny";
}

function pendingRow(mode: SaveMode, facet: WriteFacet): WriteAccessRow {
  return {
    mode,
    facet,
    kind: optionBRecommendedKind(mode, facet),
    status: "PENDING_OD8",
    note: `OD-8 undecided — kind shows Option-B recommendation only; exercising this row throws.`,
  };
}

function buildMatrix(): readonly WriteAccessRow[] {
  const rows: WriteAccessRow[] = [];
  for (const facet of WRITE_FACETS) rows.push(campaignRow(facet));
  for (const mode of SAVE_MODES) {
    if (mode === "campaign") continue;
    for (const facet of WRITE_FACETS) rows.push(pendingRow(mode, facet));
  }
  return rows;
}

export const WRITE_ACCESS_MATRIX: readonly WriteAccessRow[] = buildMatrix();

const ROW_INDEX: ReadonlyMap<string, WriteAccessRow> = new Map(
  WRITE_ACCESS_MATRIX.map((row) => [`${row.mode}::${row.facet}`, row]),
);

/* ═══════════════════════ the commit-time gate ═══════════════════════ */

/** Settlement calls this for every row of a run's `writes[]` batch.
 *  LIVE → returns the permitted WriteKind. PENDING → THROWS naming OD-8:
 *  exercising a contested mode's write before the owner decides is a defect
 *  we want LOUD (Law 4), not one we want guessed. */
export function writeGuard(mode: SaveMode, facet: WriteFacet): WriteKind {
  const row = ROW_INDEX.get(`${mode}::${facet}`);
  if (row === undefined) fail(`writeGuard: no matrix row for mode "${mode}" facet "${facet}" (corrupt matrix)`);
  if (row.status === "PENDING_OD8") {
    fail(
      `OD-8 (mode write-access matrix) is a PENDING owner decision: mode "${mode}" may not write facet "${facet}" until OD-8 is ratified. ` +
        `See docs/DECISIONS-PENDING.md OD-8 and Appendix C §2.5 (options A/B/C; current row carries the Option-B recommendation as data).`,
    );
  }
  return row.kind;
}

/** Non-throwing probe for UI/validation: is this row live and what kind? */
export function writeAccessOf(mode: SaveMode, facet: WriteFacet): WriteAccessRow {
  const row = ROW_INDEX.get(`${mode}::${facet}`);
  return row ?? fail(`writeAccessOf: no row for "${mode}"::"${facet}"`);
}

export function pendingOd8Rows(): readonly WriteAccessRow[] {
  return WRITE_ACCESS_MATRIX.filter((row) => row.status === "PENDING_OD8");
}

export function liveRows(mode?: SaveMode): readonly WriteAccessRow[] {
  return WRITE_ACCESS_MATRIX.filter((row) => row.status === "LIVE" && (mode === undefined || row.mode === mode));
}

/* ═══════════════════════ settlement batch typing ═══════════════════════ */

/** One row of a run's outcome `writes[]` batch (RunInstance.outcome.writes). */
export interface SettlementWrite {
  readonly facet: WriteFacet;
  /** Canonical artifact id/value for this facet — validated by the facet's
   *  own applier, which the settlement executor pairs with writeGuard. */
  readonly payload: unknown;
}

export interface SettlementBatch {
  readonly runId: string;
  readonly mode: SaveMode;
  readonly committedAtTick: bigint;
  readonly writes: readonly SettlementWrite[];
}

/** Gate a whole batch BEFORE applying it: any contested row aborts the entire
 *  settlement (atomicity, Appendix C §2.4 — a half-committed batch is banned). */
export function guardBatch(batch: SettlementBatch): void {
  if (batch.writes.length === 0) fail("guardBatch: empty settlement batch — every run commits facts or nothing");
  for (const write of batch.writes) {
    writeGuard(batch.mode, write.facet);
  }
}
