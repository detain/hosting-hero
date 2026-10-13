/**
 * attentionCard pure half — the OD-6 second denomination's plant/probe/row
 * logic against the PUBLIC pipeline API. Zero runner, zero DOM: if the
 * attention machinery moves, the card's claims move red here first.
 */
import { describe, expect, it } from "vitest";
import {
  ATTENTION_CARD_CAPACITY,
  attentionRows,
  attentionSummaryOf,
  boundedLoanProbe,
  loanRows,
  plantAttentionPool,
} from "../attentionCard";

describe("plantAttentionPool (construction planting, public pipeline API)", () => {
  it("zero loans mints an empty pool — the window entry is the ONLY hand event", () => {
    const { state, refusal } = plantAttentionPool(0);
    expect(refusal).toBeNull();
    expect(state.debt).toBe(0);
    expect(state.window).toBe(0);
    expect(state.tokens.length).toBe(0);
    expect(state.capacity).toBe(ATTENTION_CARD_CAPACITY);
  });

  it("one loan: window 1, debt 1, one free token, one outstanding row", () => {
    const { state } = plantAttentionPool(1);
    expect(state.debt).toBe(1);
    expect(state.window).toBe(1);
    expect(state.tokens.length).toBe(1);
    const rows = loanRows(state);
    expect(rows.length).toBe(1);
    expect(rows[0]).toEqual({
      index: 0,
      kind: "triage-window",
      createdAtMinute: 0,
      repayAtWindow: 1,
      repaid: false,
    });
  });

  it("capacity loans open cleanly; one past the bound refuses and says why", () => {
    const full = plantAttentionPool(ATTENTION_CARD_CAPACITY);
    expect(full.refusal).toBeNull();
    expect(full.state.debt).toBe(2);
    const over = plantAttentionPool(ATTENTION_CARD_CAPACITY + 1);
    expect(over.state.debt).toBe(2); // identity past the bound — never 3
    expect(over.state.loanLedger.length).toBe(2);
    expect(over.refusal).toContain("attention-debt: 2 unrepaid focus-hand loan(s) of capacity 2");
    expect(over.refusal).toContain("the replenish seam must service a row");
  });

  it("the runner-less bound probe answers the pipeline's own refusal verbatim", () => {
    expect(boundedLoanProbe()).toBe(plantAttentionPool(3).refusal);
  });
});

describe("row builders", () => {
  it("attentionSummaryOf mirrors the wire roll-up fields", () => {
    const { state } = plantAttentionPool(2);
    expect(attentionSummaryOf(state)).toEqual({ capacity: 2, debt: 2, window: 2, loanCount: 2 });
  });

  it("summary rows render capacity/debt/window/ledger/free/replenish", () => {
    const { state } = plantAttentionPool(1);
    const rows = attentionRows(attentionSummaryOf(state), state);
    const byId = new Map(rows.map((r) => [r.testId, r.value]));
    expect(byId.get("capacity")).toBe("2");
    expect(byId.get("debt")).toBe("1");
    expect(byId.get("window")).toBe("1");
    expect(byId.get("ledger")).toBe("1");
    expect(byId.get("free")).toBe("1 of 1 minted");
    expect(byId.get("replenish")).toBe("0");
  });

  it("an unarmed pool answers zero rows (absent-while-idle, never invented)", () => {
    expect(attentionRows(undefined, undefined)).toEqual([]);
    expect(loanRows(undefined)).toEqual([]);
  });
});
