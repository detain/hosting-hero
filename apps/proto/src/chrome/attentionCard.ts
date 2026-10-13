/**
 * Attention card (E2a seam (b)) — the OD-6/OD-23(a) focus-hand denomination
 * gets a chrome readback. Pure half: pool planting through the PUBLIC
 * pipeline API, the bounded-entry probe, and row builders.
 *
 * The law this panel exists to show: the attention pool is a SECOND
 * DENOMINATION of the one executive-attention budget (OD-6, decided
 * 2026-10-09 rec #22). A triage-window entry MINTS a hand as a bounded loan
 * (`attentionWindowEntry` — the ONLY hand-creation event), debt >= capacity
 * REFUSES further loans until the month-roll replenish services the oldest
 * row (one loan per roll, host-forwarded — the proto runner carries that
 * seam, crossing the business-month grid at tick 420).
 *
 * Honest seam ledger:
 *  - entry is host-called at CONSTRUCTION (`plantAttentionPool`, public
 *    pipeline API) AND MID-RUN through the runner's `enterAttentionWindow`
 *    seam (E2a seam (a) CLOSED — the @8994f96 `attentionState()` readback
 *    gained its write twin: action-on-state between ticks, mint-or-refuse
 *    through `attentionWindowEntry` only). The intent door still has NO
 *    borrowing verb — loans are planted by the host, not paid for with hands;
 *  - repayment authority is the runner's month-roll forward; the card only
 *    READS `runner.attentionState()` + the wire's AttentionSummary (@0b35b15).
 */
import { attentionWindowEntry, createAttentionState } from "@hh/sim-core/pipeline";
import type { AttentionLoanKind, AttentionState } from "@hh/sim-core";
import type { AttentionSummary } from "../shared/protocol";

/** The door-side default capacity the pool is minted at (two focus hands). */
export const ATTENTION_CARD_CAPACITY = 2;

/** The month roll the runner's business-calendar grid crosses at tick 420 —
 *  the step cap for "run the month roll" gets a small margin. */
export const ATTENTION_MONTH_ROLL_STEP_CAP = 430;

export interface PlantedPool {
  readonly state: AttentionState;
  /** Refusal text from the LAST attempted entry (null when every loan
   *  opened) — the bounded law made visible without any runner at all. */
  readonly refusal: string | null;
}

/** Plant `loans` triage-window rows through the public API at construction.
 *  Beyond capacity the pipeline refuses (identity state) — the refusal is
 *  surfaced, never swallowed. */
export function plantAttentionPool(
  loans: number,
  capacity: number = ATTENTION_CARD_CAPACITY,
): PlantedPool {
  let state = createAttentionState(capacity);
  let refusal: string | null = null;
  for (let i = 0; i < loans; i += 1) {
    const result = attentionWindowEntry(state, "triage-window" satisfies AttentionLoanKind, i);
    state = result.state;
    refusal = result.opened ? null : result.refusal;
  }
  return Object.freeze({ state, refusal });
}

/** Open `capacity` loans then push ONE past the bound — the refusal string
 *  the pipeline answers verbatim. Zero-runner demo of the bounded law. */
export function boundedLoanProbe(capacity: number = ATTENTION_CARD_CAPACITY): string | null {
  return plantAttentionPool(capacity + 1, capacity).refusal;
}

/** One rendered loan-ledger row (append-order history, never sorted). */
export interface LoanRow {
  readonly index: number;
  readonly kind: string;
  readonly createdAtMinute: number;
  readonly repayAtWindow: number;
  readonly repaid: boolean;
}

export function loanRows(state: AttentionState | undefined): readonly LoanRow[] {
  if (state === undefined) return Object.freeze([]);
  return Object.freeze(
    state.loanLedger.map((row, index) =>
      Object.freeze({
        index,
        kind: row.kind,
        createdAtMinute: row.createdAtMinute,
        repayAtWindow: row.repayAtWindow,
        repaid: row.repaid,
      }),
    ),
  );
}

/** The same roll-up the runner stamps onto the wire (protocol.ts
 *  AttentionSummary) — used for the pre-first-step render only; once a step
 *  lands, the WIRE copy is the authority the panel reads. */
export function attentionSummaryOf(state: AttentionState): AttentionSummary {
  return Object.freeze({
    capacity: state.capacity,
    debt: state.debt,
    window: state.window,
    loanCount: state.loanLedger.length,
  });
}

/** Summary rows off the WIRE (the authority chrome is allowed to read);
 *  free-hands and last-replenish come from the local accessor read. */
export interface AttentionRow {
  /** Stable data-test slug (derived at build time, never in the template). */
  readonly testId: string;
  readonly label: string;
  readonly value: string;
}

export function attentionRows(
  summary: AttentionSummary | undefined,
  state: AttentionState | undefined,
): readonly AttentionRow[] {
  if (summary === undefined || state === undefined) return Object.freeze([]);
  let free = 0;
  for (const token of state.tokens) if (token.busyCauseId === null) free += 1;
  return Object.freeze([
    Object.freeze({ testId: "capacity", label: "capacity", value: String(summary.capacity) }),
    Object.freeze({ testId: "debt", label: "debt (unrepaid loans)", value: String(summary.debt) }),
    Object.freeze({ testId: "window", label: "window (entries opened)", value: String(summary.window) }),
    Object.freeze({ testId: "ledger", label: "loan ledger rows", value: String(summary.loanCount) }),
    Object.freeze({ testId: "free", label: "free focus hands", value: `${free} of ${state.tokens.length} minted` }),
    Object.freeze({ testId: "replenish", label: "last replenish (biz-min)", value: String(state.lastReplenishBusinessMinute) }),
  ]);
}
