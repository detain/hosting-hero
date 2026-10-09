/**
 * Mode write-access matrix — OD-8 RATIFIED as Matrix B (owner decision
 * 2026-10-09, recorded in docs/adr/0009-owner-ratifications-calibration.md).
 *
 * Appendix C §2.5 posed three options (A bypass / B ledger-only / C diegetic
 * staffing) and DECISIONS-PENDING.md carried the specialist recommendation (B).
 * The owner ratified B — with one explicit carve-out — and this file now
 * ENCODES THE RATIFICATION:
 *
 *  - `campaign` rows ship LIVE (full-carry writes, L18 — the doc is
 *    unambiguous there, and the game is unplayable without them);
 *  - `scenario`, `daily`, `consultant` and `blitz` rows are LIVE with the
 *    Matrix B pattern that was formerly the stored recommendation: a shadow
 *    instance appends ONLY records / medals / streaksShared / codex at
 *    settlement and is DENIED every other facet (§2.5-B: NEVER scars,
 *    reputation, customer_book, cash);
 *  - `endless` is the carve-out — contested at ratification, so its rows stay
 *    status PENDING and `writeGuard()` THROWS naming OD-8 on any attempt to
 *    exercise one. The declared `kind` still mirrors campaign semantics
 *    (§2.5: "the Long Save continuing in place") as data for a future
 *    unblock.
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
 *  - deny:     probes may READ this kind (writeGuard returns it as data), but
 *              the facet is off-limits at settlement: a batch row targeting a
 *              denied facet is a defect, and guardBatch aborts the entire
 *              settlement with a throw (§2.4 atomicity — never a silent no-op). */
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

/** Facets a Matrix B shadow instance may append at settlement (§2.5-B):
 *  records, medals, streaks (mode-stamped), codex stages. Nothing else. */
const MATRIX_B_LEDGER_FACETS: ReadonlySet<WriteFacet> = new Set<WriteFacet>([
  "records",
  "medals",
  "streaksShared",
  "codex",
]);

/** Modes whose rows flipped LIVE under the OD-8 Matrix B ratification
 *  (owner decision 2026-10-09, ADR-0009). Endless is NOT here — it was
 *  explicitly held PENDING as contested. */
const RATIFIED_MATRIX_B_MODES: readonly SaveMode[] = ["scenario", "daily", "consultant", "blitz"];

/** The ratified Matrix B pattern (owner decision 2026-10-09, ADR-0009):
 *  shadow instances write ONLY records, medals, streaksShared and codex —
 *  NEVER scars, reputation, customer_book, cash (§2.5-B).
 *  For the still-held endless rows the same function is recommendation-as-
 *  DATA only: endless mirrors campaign semantics (§2.5: "the Long Save
 *  continuing in place") until the owner unblocks it. */
function matrixBKind(mode: SaveMode, facet: WriteFacet): WriteKind {
  if (mode === "endless") {
    // §2.5: endless is "the Long Save continuing in place" — same node,
    // quarterly commits; the held row mirrors campaign semantics.
    return APPEND_FACETS.has(facet) ? "append" : "instance";
  }
  return MATRIX_B_LEDGER_FACETS.has(facet) ? "append" : "deny";
}

/** A LIVE row under the Matrix B ratification (scenario/daily/consultant/blitz). */
function ratifiedRow(mode: SaveMode, facet: WriteFacet): WriteAccessRow {
  return {
    mode,
    facet,
    kind: matrixBKind(mode, facet),
    status: "LIVE",
    note: `OD-8 Matrix B ratified 2026-10-09 (ADR-0009): shadow-instance rows write ONLY records/medals/streaks/codex, NEVER scars/reputation/customer_book/cash.`,
  };
}

/** An endless row: held PENDING (contested at the 2026-10-09 ratification)
 *  with the campaign-mirror recommendation carried as data. */
function pendingRow(mode: SaveMode, facet: WriteFacet): WriteAccessRow {
  return {
    mode,
    facet,
    kind: matrixBKind(mode, facet),
    status: "PENDING_OD8",
    note: `OD-8 ratified Matrix B 2026-10-09 but "${mode}" rows are explicitly HELD PENDING (contested); kind mirrors campaign semantics as data only — exercising this row throws.`,
  };
}

function buildMatrix(): readonly WriteAccessRow[] {
  const rows: WriteAccessRow[] = [];
  for (const facet of WRITE_FACETS) rows.push(campaignRow(facet));
  for (const mode of SAVE_MODES) {
    if (mode === "campaign") continue;
    const rowOf = RATIFIED_MATRIX_B_MODES.includes(mode) ? ratifiedRow : pendingRow;
    for (const facet of WRITE_FACETS) rows.push(rowOf(mode, facet));
  }
  return rows;
}

export const WRITE_ACCESS_MATRIX: readonly WriteAccessRow[] = buildMatrix();

const ROW_INDEX: ReadonlyMap<string, WriteAccessRow> = new Map(
  WRITE_ACCESS_MATRIX.map((row) => [`${row.mode}::${row.facet}`, row]),
);

/* ═══════════════════════ the commit-time gate ═══════════════════════ */

/** Settlement calls this for every row of a run's `writes[]` batch.
 *  LIVE → returns the permitted WriteKind. A ratified-mode row may lawfully
 *  return "deny" as probe data — but deny is ENFORCED, not silently skipped:
 *  a settlement batch row targeting a denied facet makes guardBatch throw and
 *  the whole batch aborts (§2.4 atomicity).
 *  PENDING → THROWS naming OD-8: the surviving PENDING rows are endless,
 *  explicitly held at the 2026-10-09 Matrix B ratification — exercising one
 *  while contested is a defect we want LOUD (Law 4), not one we want guessed. */
export function writeGuard(mode: SaveMode, facet: WriteFacet): WriteKind {
  const row = ROW_INDEX.get(`${mode}::${facet}`);
  if (row === undefined) fail(`writeGuard: no matrix row for mode "${mode}" facet "${facet}" (corrupt matrix)`);
  if (row.status === "PENDING_OD8") {
    fail(
      `OD-8 was ratified as Matrix B on 2026-10-09, but mode "${mode}" rows are explicitly HELD PENDING (contested): it may not write facet "${facet}" until the owner unblocks them. ` +
        `See docs/DECISIONS-PENDING.md OD-8, docs/adr/0009-owner-ratifications-calibration.md, and Appendix C §2.5 (current row carries the campaign-mirror recommendation as data).`,
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

/** Gate a whole batch BEFORE applying it: any held-PENDING or Matrix-B-denied
 *  row aborts the entire settlement (atomicity, Appendix C §2.4 — a
 *  half-committed batch is banned). Denied facets throw HERE rather than
 *  silently passing: writeGuard returns "deny" as data for probes, but a
 *  batch that targets a denied facet is a defect, not a no-op. */
export function guardBatch(batch: SettlementBatch): void {
  if (batch.writes.length === 0) fail("guardBatch: empty settlement batch — every run commits facts or nothing");
  for (const write of batch.writes) {
    const kind = writeGuard(batch.mode, write.facet);
    if (kind === "deny") {
      fail(
        `guardBatch: OD-8 Matrix B (ratified 2026-10-09) denies mode "${batch.mode}" the facet "${write.facet}" — a shadow-instance batch carries ONLY records/medals/streaksShared/codex, never scars/reputation/customer_book/cash. Whole settlement aborted (§2.4 atomicity).`,
      );
    }
  }
}
