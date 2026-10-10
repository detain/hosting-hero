/**
 * THE ATTENTION DENOMINATION — §7.5 · OD-6(a) two denominations drawn from
 * one special-hand pool · OD-23(a) support-attention design · OD-4a the
 * BOUNDED LEDGERED LOAN.
 *
 * The everyday rail (`GameState.hands`, owned by intent-door.ts) is
 * UNTOUCHED by this module — attention is a SECOND currency minted against
 * the same pool of executive focus, scarcer by construction: capacity 1, and
 * the ONLY hand-creation event in the game is a window entry that extends a
 * bounded loan. Choreography (v0, provisional taste rows pinned in tests):
 *
 *   1. WINDOW ENTRY (`attentionWindowEntry`) — the Triage Window (arrivals
 *      queue visibly outside, patience draining) or Attention Grace (sev-1
 *      suppresses duplicate alerts, one free focus hand). Entry MINTS the
 *      focus hand as a ledgered loan: one `AttentionLoanRecord` row
 *      (repaid:false) per entry, debt +1, window ordinal +1. The loan is
 *      BOUNDED: while debt >= capacity no fresh focus hand is extended — the
 *      refusal is returned, never silently swallowed (spec: "never silent
 *      loss").
 *   2. SPEND (`attentionSpend`) — the special-hand payment path. New
 *      verb-class consumers (support/tickets, the attentionCost door list)
 *      occupy a FREE attention token under the SAME half-open occupancy law
 *      as the everyday rail. No free hand → refusal `attention-debt: …`.
 *   3. REPLENISH (`replenishAtBusinessMonth`) — the monthly budget services
 *      the OLDEST unrepaid loan (OD-4a: "repaid in the next window's
 *      attention budget"; OD-6: monthly replenish). One loan serviced per
 *      roll keeps repayment bounded by the budget that pays it.
 *
 * MONTH-ROLL SEAM (decision, documented): the pipeline owns NO business-month
 * clock — economy owns rollMonth (economy/errorBudget.ts
 * BUSINESS_MONTH_MINUTES = 43200, folded from economy/tick.ts). This seam is
 * therefore HOST-FORWARDED: the caller that detects the roll (proto runner /
 * economy wrapper) calls `replenishAtBusinessMonth(state, minute, rolled)`
 * with the boolean it already knows. The function is pure over AttentionState
 * and reads no clock; TickInputs is deliberately NOT widened (frozen contract
 * — the roll is an ACTION on state between ticks, not a step input).
 *
 * Digest law: `pipeline/digest.ts` absorbs `GameState.attention` ONLY when
 * present (digest-switch law), so every pre-attention state — all shipped
 * goldens — digests byte-identically. Purity: every function returns a NEW
 * frozen AttentionState (or the input identity when nothing changed); no
 * mutation, no RNG, no platform APIs.
 */

import type {
  AttentionLoanKind,
  AttentionLoanRecord,
  AttentionState,
  CauseId,
  HandToken,
  SimMinute,
  SimTick,
} from "../types.ts";

/* ═══════════════════════════ Errors & vocab ═══════════════════════════ */

/** Boundary parse failure — malformed STRUCTURAL input (host bug): unknown
 *  loan kind, non-integer minute, impossible capacity. Semantic outcomes
 *  (bounded refusal, no-free-hand refusal) come back as RESULT refusals, the
 *  same split the door draws between IntentDoorError and `intent-refused`. */
export class AttentionError extends Error {
  constructor(code: string, detail: string) {
    super(`attention[${code}]: ${detail}`);
    this.name = "AttentionError";
  }
}

/** The closed loan-kind vocabulary (types.ts `AttentionLoanKind` is the
 *  type-law twin of this value law). */
export const ATTENTION_LOAN_KINDS: readonly AttentionLoanKind[] = Object.freeze([
  "triage-window",
  "grace",
]);

const ATTENTION_KIND_SET: ReadonlySet<string> = new Set<string>(ATTENTION_LOAN_KINDS);

/** v0 focus-hand capacity (§7.5 "one special hand"); hosts may mint wider
 *  pools but every shipped golden path keeps the default. */
export const ATTENTION_CAPACITY_DEFAULT = 1;

/* ═══════════════════════════ Parse guards (Laws 2+4) ═══════════════════ */

function requireMinute(value: unknown, where: string): SimMinute {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new AttentionError(
      "bad-minute",
      `${where} must be a safe integer business minute >= 0, got ${String(value)}`,
    );
  }
  return value;
}

function requireKind(value: unknown, where: string): AttentionLoanKind {
  if (typeof value !== "string" || !ATTENTION_KIND_SET.has(value)) {
    throw new AttentionError(
      "bad-kind",
      `${where} "${String(value)}" not in {${ATTENTION_LOAN_KINDS.join(", ")}}`,
    );
  }
  return value as AttentionLoanKind;
}

function rebuild(
  state: AttentionState,
  patch: {
    readonly tokens?: readonly HandToken[];
    readonly debt?: number;
    readonly loanLedger?: readonly AttentionLoanRecord[];
    readonly window?: number;
    readonly lastReplenishBusinessMinute?: SimMinute;
  },
): AttentionState {
  return Object.freeze({
    capacity: state.capacity,
    tokens: patch.tokens ?? state.tokens,
    debt: patch.debt ?? state.debt,
    loanLedger: patch.loanLedger ?? state.loanLedger,
    window: patch.window ?? state.window,
    lastReplenishBusinessMinute:
      patch.lastReplenishBusinessMinute ?? state.lastReplenishBusinessMinute,
  });
}

/* ═══════════════════════════ Constructors ═══════════════════════════ */

/** Mint an empty attention pool — NO tokens yet (the only hand-creation event
 *  is `attentionWindowEntry`). The host seeds this onto GameState once the
 *  attention denomination is in play; absent field = denomination off. */
export function createAttentionState(capacity: number = ATTENTION_CAPACITY_DEFAULT): AttentionState {
  if (!Number.isSafeInteger(capacity) || capacity < 1) {
    throw new AttentionError(
      "bad-capacity",
      `createAttentionState: capacity must be a safe integer >= 1, got ${String(capacity)}`,
    );
  }
  return Object.freeze({
    capacity,
    tokens: Object.freeze([]) as readonly HandToken[],
    debt: 0,
    loanLedger: Object.freeze([]) as readonly AttentionLoanRecord[],
    window: 0,
    lastReplenishBusinessMinute: 0,
  });
}

/* ═══════════════════════════ Release / spend ═══════════════════════════ */

/**
 * Release due attention tokens (the pinned half-open law, identical to the
 * everyday rail: a reservation ends at `busyUntilTick <= atTick`). Returns the
 * input identity when nothing matured — release sweeps never fake a state
 * change.
 */
export function attentionRelease(state: AttentionState, atTick: SimTick): AttentionState {
  let changed = false;
  const tokens = state.tokens.map(
    (token): HandToken =>
      token.busyCauseId !== null && token.busyUntilTick <= atTick
        ? Object.freeze({ ...token, busyCauseId: null })
        : token,
  );
  tokens.forEach((token, i) => {
    if (token !== state.tokens[i]) changed = true;
  });
  if (!changed) return state;
  return rebuild(state, { tokens: Object.freeze(tokens) });
}

/** Result of a special-hand spend attempt: `index` is the occupied token slot
 *  (null on refusal), `refusal` carries the `attention-debt:` vocabulary the
 *  door logs verbatim into `intent-refused`. */
export interface AttentionSpendResult {
  readonly state: AttentionState;
  readonly index: number | null;
  readonly refusal: string | null;
}

/**
 * Occupy the FIRST FREE attention token for `cost = 1` (v0 — the focus hand is
 * a single slot per special action). Due tokens are released first, so a call
 * at the occupancy boundary sees the hand free again. No free hand → identity
 * state + refusal `attention-debt: …` (spec law: the refusal event, never a
 * silent loss). Cause/occupancy mirror the everyday rail — the same
 * `intent:<seq>` attribution and the same half-open window keep the two
 * denominations legible against one another.
 */
export function attentionSpend(
  state: AttentionState,
  atTick: SimTick,
  cause: CauseId,
  untilTick: SimTick,
): AttentionSpendResult {
  const released = attentionRelease(state, atTick);
  const tokens = [...released.tokens];
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i] as HandToken;
    if (token.busyCauseId !== null) continue;
    tokens[i] = Object.freeze({ ...token, busyUntilTick: untilTick, busyCauseId: cause });
    return Object.freeze({
      state: rebuild(released, { tokens: Object.freeze(tokens) }),
      index: token.index,
      refusal: null,
    });
  }
  return Object.freeze({
    state: released,
    index: null,
    refusal: `attention-debt: no free attention hand (pool ${String(tokens.length)} of capacity ${String(released.capacity)}, debt ${String(released.debt)})`,
  });
}

/** Free-hand census AFTER due release — the check the door runs before
 *  touching the rail. */
export function freeAttentionCount(state: AttentionState, atTick: SimTick): number {
  const released = attentionRelease(state, atTick);
  let free = 0;
  for (const token of released.tokens) if (token.busyCauseId === null) free += 1;
  return free;
}

/* ═══════════════════════════ Window entry (the loan) ═══════════════════════════ */

/** Result of a window-entry mint. `opened` false = the bounded loan refused:
 *  state identity, ledger untouched, refusal text for the host's event lane. */
export interface AttentionWindowResult {
  readonly state: AttentionState;
  readonly opened: boolean;
  readonly refusal: string | null;
}

/**
 * TRIAGE-WINDOW / GRACE ENTRY — the ONLY hand-creation event (OD-4a). Mints
 * the focus hand as a bounded loan: window ordinal +1, one ledgered
 * `AttentionLoanRecord` (repaid:false — the row IS the outstanding debt),
 * debt +1, and a fresh free token while the pool has room (a re-entry on a
 * full pool re-arms the loan WITHOUT forging a second token — capacity is the
 * law, the ledger is the history). Bounded refusal: while debt >= capacity the
 * budget is already fully owed, so no fresh focus hand is extended — the
 * replenish seam must service a row first.
 */
export function attentionWindowEntry(
  state: AttentionState,
  kind: AttentionLoanKind,
  atBusinessMinute: SimMinute,
): AttentionWindowResult {
  const parsedKind = requireKind(kind, "attentionWindowEntry: kind");
  requireMinute(atBusinessMinute, "attentionWindowEntry: atBusinessMinute");
  if (state.debt >= state.capacity) {
    return Object.freeze({
      state,
      opened: false,
      refusal: `attention-debt: ${String(state.debt)} unrepaid focus-hand loan(s) of capacity ${String(state.capacity)} — the replenish seam must service a row before a fresh window extends another hand`,
    });
  }
  const window = state.window + 1;
  const row: AttentionLoanRecord = Object.freeze({
    createdAtMinute: atBusinessMinute,
    kind: parsedKind,
    repayAtWindow: window,
    repaid: false,
  });
  const tokens =
    state.tokens.length < state.capacity
      ? Object.freeze([
          ...state.tokens,
          Object.freeze({
            index: state.tokens.length,
            busyUntilTick: 0n,
            busyCauseId: null,
          }) as HandToken,
        ])
      : state.tokens;
  return Object.freeze({
    state: rebuild(state, {
      tokens,
      debt: state.debt + 1,
      loanLedger: Object.freeze([...state.loanLedger, row]),
      window,
    }),
    opened: true,
    refusal: null,
  });
}

/* ═══════════════════════════ Monthly replenish ═══════════════════════════ */

/**
 * THE MONTH-ROLL SEAM — host-forwarded (see header: pipeline owns no month
 * clock; economy's rollMonth drives the boolean). On a roll: the OLDEST
 * unrepaid loan is serviced out of the replenished attention budget
 * (`repaid` flips exactly once, debt −1) and `lastReplenishBusinessMinute`
 * stamps the minute. One loan per roll keeps repayment bounded by the monthly
 * budget that pays it (OD-4a "bounded"). Off a roll: input identity — the
 * seam is cheap to call every minute.
 */
export function replenishAtBusinessMonth(
  state: AttentionState,
  atBusinessMinute: SimMinute,
  atBusinessMonthRoll: boolean,
): AttentionState {
  if (!atBusinessMonthRoll) return state;
  requireMinute(atBusinessMinute, "replenishAtBusinessMonth: atBusinessMinute");
  const oldest = state.loanLedger.findIndex((row) => !row.repaid);
  if (oldest === -1) {
    return rebuild(state, { lastReplenishBusinessMinute: atBusinessMinute });
  }
  const ledger = [...state.loanLedger];
  const serviced = ledger[oldest] as AttentionLoanRecord;
  ledger[oldest] = Object.freeze({ ...serviced, repaid: true });
  return rebuild(state, {
    loanLedger: Object.freeze(ledger),
    debt: state.debt - 1,
    lastReplenishBusinessMinute: atBusinessMinute,
  });
}
