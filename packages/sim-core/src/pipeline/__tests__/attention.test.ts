/**
 * THE ATTENTION DENOMINATION — §7.5 · OD-6(a) two denominations, one
 * special-hand pool · OD-4a the BOUNDED LEDGERED LOAN · OD-23(a) design.
 * Pins, per the lane contract:
 *  - the loan is the ONLY hand-creation event: window entry mints exactly
 *    one ledger row; creation-event count == ledger rows, always;
 *  - BOUNDED: while debt >= capacity no fresh focus hand is extended (the
 *    refusal is returned, never silently swallowed);
 *  - replenish is a HOST-FORWARDED month seam: pipeline owns no month clock;
 *    servicing takes the OLDEST unrepaid loan, one per roll; debt clears
 *    exactly when the row flips repaid;
 *  - the half-open occupancy law (busyUntilTick <= tick frees) is SHARED with
 *    the everyday rail — never redefined here;
 *  - the door's opt-in `attentionCost`: a listed verb pays BOTH denominations
 *    or NOTHING (normal-rail refund on attention refusal; both refunded on
 *    handler refusal). Absent config = zero behavior change — byte-identity;
 *  - digest-switch law: `attention` absorbed ONLY when present; the
 *    shipped-golden movement-free proof is the FULL serial suite (g4
 *    13ba145f / drain 78dc6556 / shed trio), re-pinned here for the digest
 *    surface the attention block could have touched.
 */

import { describe, expect, it } from "vitest";
import type { ExternalIntent, GameState, PlayerVerbArgs, TickContext } from "../../types";
import { asCauseId, asRunSeed, PlayerVerb } from "../../types";
import { initialClocks, MICROS_PER_MIN } from "../../kernel/time";
import { createInitialState } from "../driver";
import { digestState } from "../digest";
import { applyIntentDoor, createBoardState, IntentDoorError } from "../intent-door";
import {
  attentionRelease,
  attentionSpend,
  attentionWindowEntry,
  ATTENTION_CAPACITY_DEFAULT,
  ATTENTION_LOAN_KINDS,
  AttentionError,
  createAttentionState,
  freeAttentionCount,
  replenishAtBusinessMonth,
} from "../attention";
import { IDS, node } from "./helpers";

const MIN = MICROS_PER_MIN;

function ctx(tick: bigint): TickContext {
  return Object.freeze({ tick, minute: Number(tick), clocks: initialClocks() });
}

function ext(tick: bigint, seq: number, args: PlayerVerbArgs): ExternalIntent {
  return Object.freeze({
    tick,
    intent: Object.freeze({
      seq,
      clock: "sim" as const,
      atUs: tick * MIN,
      origin: "player" as const,
      payload: Object.freeze({ kind: "player-verb" as const, args }),
    }),
  });
}

const communicate = (note: string, target: string | null = IDS.edge): PlayerVerbArgs =>
  Object.freeze({ verb: PlayerVerb.Communicate, target, note } as PlayerVerbArgs);

/* ═══════════════════════ createAttentionState ═══════════════════════ */

describe("createAttentionState", () => {
  it("starts as an EMPTY pool — the only hand-creation event is the loan", () => {
    const a = createAttentionState();
    expect(a.capacity).toBe(ATTENTION_CAPACITY_DEFAULT);
    expect(a.tokens).toEqual([]);
    expect(a.debt).toBe(0);
    expect(a.loanLedger).toEqual([]);
    expect(a.window).toBe(0);
    expect(a.lastReplenishBusinessMinute).toBe(0);
    expect(Object.isFrozen(a)).toBe(true);
  });

  it("refuses a nonsense capacity at the boundary (Laws 2+4)", () => {
    expect(() => createAttentionState(0)).toThrow(AttentionError);
    expect(() => createAttentionState(1.5)).toThrow(/attention\[bad-capacity\]/);
    expect(() => createAttentionState(-2)).toThrow(AttentionError);
  });
});

/* ═══════════════════════ window entry (the loan) ═══════════════════════ */

describe("attentionWindowEntry — the bounded ledgered loan (OD-4a)", () => {
  it("mints the focus hand: one token, one ledger row, debt +1, window +1", () => {
    const a0 = createAttentionState();
    const r = attentionWindowEntry(a0, "triage-window", 100);
    expect(r.opened).toBe(true);
    expect(r.refusal).toBeNull();
    const a1 = r.state;
    expect(a1.window).toBe(1);
    expect(a1.debt).toBe(1);
    expect(a1.tokens.length).toBe(1);
    expect(a1.tokens[0]).toEqual({ index: 0, busyUntilTick: 0n, busyCauseId: null });
    expect(a1.loanLedger.length).toBe(1);
    expect(a1.loanLedger[0]).toEqual({
      createdAtMinute: 100,
      kind: "triage-window",
      repayAtWindow: 1,
      repaid: false,
    });
    // The origin input is never mutated (Law 3).
    expect(a0.tokens).toEqual([]);
    expect(a0.debt).toBe(0);
  });

  it("is BOUNDED: while debt >= capacity no fresh hand is extended — refusal returned, not swallowed", () => {
    const a1 = attentionWindowEntry(createAttentionState(), "triage-window", 100).state;
    const r = attentionWindowEntry(a1, "grace", 200);
    expect(r.opened).toBe(false);
    expect(r.state).toBe(a1); // identity — the refusal changes nothing
    expect(r.refusal).toMatch(/^attention-debt:/);
    expect(r.refusal).toContain("capacity 1");
    // Ledger untouched: a refused entry is NOT a creation event.
    expect(r.state.loanLedger.length).toBe(1);
  });

  it("creation-event count == ledger rows across mint → service → re-mint", () => {
    let a = createAttentionState();
    let creations = 0;
    const mint = (kind: (typeof ATTENTION_LOAN_KINDS)[number], minute: number): void => {
      const r = attentionWindowEntry(a, kind, minute);
      if (r.opened) {
        creations += 1;
        a = r.state;
      }
    };
    mint("triage-window", 10); // debt 1 — opens
    mint("grace", 20); // REFUSED (bounded) — no row
    a = replenishAtBusinessMonth(a, 30, true); // services the row
    mint("grace", 40); // debt cleared — opens again
    expect(creations).toBe(2);
    expect(a.loanLedger.length).toBe(2);
    expect(a.debt).toBe(1);
    expect(a.window).toBe(2);
    expect(a.tokens.length).toBe(1); // capacity capped the POOL, the ledger keeps history
  });

  it("parses its vocabulary fail-loud: unknown kind / bad minute throw", () => {
    const a = createAttentionState();
    expect(() => attentionWindowEntry(a, "holiday" as never, 1)).toThrow(AttentionError);
    expect(() => attentionWindowEntry(a, "triage-window", -1)).toThrow(/attention\[bad-minute\]/);
    expect(() => attentionWindowEntry(a, "triage-window", 1.5)).toThrow(AttentionError);
  });
});

/* ═══════════════════════ spend / release ═══════════════════════════ */

describe("attentionSpend / attentionRelease — one pool, half-open law", () => {
  const minted = attentionWindowEntry(createAttentionState(), "triage-window", 0).state;

  it("occupies the free token with cause + stamp, then refuses while held", () => {
    const spend = attentionSpend(minted, 5n, asCauseId("intent:1"), 8n);
    expect(spend.refusal).toBeNull();
    expect(spend.index).toBe(0);
    expect(spend.state.tokens[0]).toEqual({ index: 0, busyUntilTick: 8n, busyCauseId: "intent:1" });
    const again = attentionSpend(spend.state, 5n, asCauseId("intent:2"), 8n);
    expect(again.index).toBeNull();
    expect(again.refusal).toMatch(/^attention-debt: no free attention hand/);
    expect(again.refusal).toContain("debt 1");
  });

  it("frees exactly at the half-open boundary busyUntilTick <= tick", () => {
    const busy = attentionSpend(minted, 5n, asCauseId("intent:1"), 8n).state;
    expect(attentionRelease(busy, 7n)).toBe(busy); // still held — identity
    const at = attentionRelease(busy, 8n);
    expect(at).not.toBe(busy);
    expect(at.tokens[0]?.busyCauseId).toBeNull();
    // spend sees the boundary as free WITHOUT a separate release call first:
    const spend = attentionSpend(busy, 8n, asCauseId("intent:2"), 9n);
    expect(spend.index).toBe(0);
    expect(spend.state.tokens[0]?.busyCauseId).toBe("intent:2");
  });

  it("freeAttentionCount matches the release census", () => {
    expect(freeAttentionCount(minted, 1n)).toBe(1);
    const busy = attentionSpend(minted, 5n, asCauseId("intent:1"), 8n).state;
    expect(freeAttentionCount(busy, 7n)).toBe(0);
    expect(freeAttentionCount(busy, 8n)).toBe(1);
  });
});

/* ═══════════════════════ month replenish (host-forwarded) ═══════════════ */

describe("replenishAtBusinessMonth — the OD-4a repayment seam", () => {
  it("off a roll it is pure IDENTITY (the seam is cheap to call every minute)", () => {
    const a = attentionWindowEntry(createAttentionState(), "triage-window", 10).state;
    expect(replenishAtBusinessMonth(a, 43_200, false)).toBe(a);
  });

  it("on a roll services the OLDEST unrepaid loan, decrements debt, stamps the minute", () => {
    let a = attentionWindowEntry(createAttentionState(2), "triage-window", 10).state;
    const second = attentionWindowEntry(a, "grace", 20).state;
    a = second;
    expect(a.debt).toBe(2);
    const serviced = replenishAtBusinessMonth(a, 43_200, true);
    expect(serviced.loanLedger[0]?.repaid).toBe(true); // oldest first
    expect(serviced.loanLedger[1]?.repaid).toBe(false); // one per roll — BOUNDED budget
    expect(serviced.debt).toBe(1);
    expect(serviced.lastReplenishBusinessMinute).toBe(43_200);
    // Repayment flips a row exactly once and never mutates history:
    expect(a.loanLedger[0]?.repaid).toBe(false);
    const rollAgain = replenishAtBusinessMonth(serviced, 86_400, true);
    expect(rollAgain.loanLedger[0]?.repaid).toBe(true); // idempotent on the row
    expect(rollAgain.loanLedger[1]?.repaid).toBe(true);
    expect(rollAgain.debt).toBe(0);
  });

  it("debt clearing RE-ARMS the bounded mint", () => {
    const owed = attentionWindowEntry(createAttentionState(), "grace", 5).state;
    expect(attentionWindowEntry(owed, "grace", 6).opened).toBe(false);
    const paid = replenishAtBusinessMonth(owed, 43_200, true);
    expect(paid.debt).toBe(0);
    const reentered = attentionWindowEntry(paid, "triage-window", 43_201);
    expect(reentered.opened).toBe(true);
    expect(reentered.state.window).toBe(2);
  });
});

/* ═══════════════════════ door wiring: attentionCost ═══════════════════════ */

function doorState(seedAttention: boolean): GameState {
  const attention = seedAttention
    ? attentionWindowEntry(createAttentionState(), "triage-window", 0).state
    : undefined;
  return createInitialState({
    runSeed: asRunSeed(7n),
    engineVersion: "test-attention",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
    clocks: initialClocks(),
    nodes: [node(IDS.edge, { slots: 2, serviceUs: MIN }), node(IDS.origin, { slots: 1, serviceUs: MIN })],
    handCapacity: 2,
    board: createBoardState(),
    ...(attention !== undefined ? { attention } : {}),
  });
}

describe("door attentionCost — double-denomination payment (OD-6a)", () => {
  const CONFIG = { attentionCost: { [PlayerVerb.Communicate]: 1 as const } };

  it("a listed verb pays NORMAL hand AND attention token for the same cause/window", () => {
    const s0 = doorState(true);
    const r = applyIntentDoor(s0, ctx(1n), [ext(1n, 11, communicate("hello"))], CONFIG);
    expect(r.receipts[0]?.outcome).toBe("executed");
    const attention = r.state.attention;
    expect(attention?.tokens[0]).toEqual({
      index: 0,
      busyUntilTick: 3n, // communicate occupancy 2 → half-open [1,3)
      busyCauseId: "intent:11",
    });
    expect(attention?.debt).toBe(1);
    // Normal rail paid too (unchanged law): one of two hands busy.
    const freeNormal = (r.state.hands?.tokens ?? []).filter((t) => t.busyCauseId === null).length;
    expect(freeNormal).toBe(1);
  });

  it("second listed verb same tick: attention refused `attention-debt`, NORMAL RAIL REFUNDED", () => {
    const s0 = doorState(true);
    const r1 = applyIntentDoor(s0, ctx(1n), [ext(1n, 11, communicate("first"))], CONFIG);
    const r2 = applyIntentDoor(r1.state, ctx(1n), [ext(1n, 12, communicate("second"))], CONFIG);
    expect(r2.receipts[0]?.outcome).toBe("refused");
    expect(r2.receipts[0]?.reason).toMatch(/^attention-debt:/);
    // The failed attempt refunded its normal payment — still exactly 1 busy.
    const busy = (r2.state.hands?.tokens ?? []).filter((t) => t.busyCauseId !== null);
    expect(busy.length).toBe(1);
    expect(busy[0]?.busyCauseId).toBe("intent:11");
  });

  it("listed verb on a state WITHOUT the pool refuses attention-debt (never mints silently)", () => {
    const s0 = doorState(false);
    const r = applyIntentDoor(s0, ctx(1n), [ext(1n, 11, communicate("hello"))], CONFIG);
    expect(r.receipts[0]?.reason).toMatch(/^attention-debt:/);
    expect(r.receipts[0]?.reason).toContain("absent");
    expect(r.state.attention).toBeUndefined();
    // Nothing spent anywhere: the rail refund kept hands identity-untouched.
    expect(r.state.hands).toBe(s0.hands);
  });

  it("handler refusal refunds BOTH denominations (a refusal spends NOTHING)", () => {
    const s0 = doorState(true);
    const bad = ext(1n, 11, {
      verb: PlayerVerb.Communicate,
      target: "nope" as never,
      note: "hello",
    } as PlayerVerbArgs);
    const r = applyIntentDoor(s0, ctx(1n), [bad], CONFIG);
    expect(r.receipts[0]?.reason).toContain("unknown-node");
    expect(r.state.attention?.tokens[0]?.busyCauseId).toBeNull(); // special refunded
    const busy = (r.state.hands?.tokens ?? []).filter((t) => t.busyCauseId !== null);
    expect(busy.length).toBe(0); // normal refunded
  });

  it("UNLISTED verbs are untouched by the denomination (cost paid in normal hands only)", () => {
    const s0 = doorState(true);
    const r = applyIntentDoor(s0, ctx(1n), [ext(1n, 11, communicate("x"))], {});
    expect(r.receipts[0]?.outcome).toBe("executed");
    expect(r.state.attention).toBe(s0.attention); // identity — never materialized
  });

  it("BYTE-IDENTITY gate: no attentionCost + no attention field ⇒ pass is the HEAD pass", () => {
    const s0 = doorState(false);
    const plain = applyIntentDoor(s0, ctx(1n), [ext(1n, 11, communicate("x"))], {});
    expect(plain.state.attention).toBeUndefined();
    // Config carrying an explicit 0 is IDENTICAL to omission:
    const zero = applyIntentDoor(s0, ctx(1n), [ext(1n, 11, communicate("x"))], {
      attentionCost: { [PlayerVerb.Communicate]: 0 },
    });
    expect(zero.state.hands).toEqual(plain.state.hands);
    expect(digestState(zero.state)).toBe(digestState(plain.state));
  });

  it("a 2-valued attentionCost is host programming garbage and throws at the boundary", () => {
    const s0 = doorState(true);
    expect(() =>
      applyIntentDoor(s0, ctx(1n), [], {
        attentionCost: { [PlayerVerb.Communicate]: 2 as never },
      }),
    ).toThrow(IntentDoorError);
  });
});

/* ═══════════════════════ digest-switch law ═══════════════════════ */

describe("digest — attention absorbed ONLY when present (digest-switch law)", () => {
  it("adding the field MOVES the digest; removing it returns to the base", () => {
    const base = doorState(false);
    const withAttention = doorState(true);
    expect(digestState(withAttention)).not.toBe(digestState(base));
    // Different ledger content moves the digest again (rows are absorbed):
    const second = attentionWindowEntry(
      replenishAtBusinessMonth(withAttention.attention ?? createAttentionState(), 1, true),
      "grace",
      2,
    ).state;
    const s2 = Object.freeze({ ...base, attention: second });
    expect(digestState(s2)).not.toBe(digestState(withAttention));
  });
});

/* ═══════════════════════ determinism ×100 pair ═══════════════════════ */

describe("determinism ×100 — attention sequences replay byte-identically", () => {
  it("two fresh closures of the scripted lane agree on every tick's digest", () => {
    const run = (): string[] => {
      const chain: string[] = [];
      let s = doorState(false);
      // tick 1: mint the window (host seam), then a double-denomination verb.
      let entry = attentionWindowEntry(s.attention ?? createAttentionState(), "triage-window", 1);
      s = Object.freeze({ ...s, attention: entry.state });
      const r1 = applyIntentDoor(s, ctx(1n), [ext(1n, 1, communicate("one"))], {
        attentionCost: { [PlayerVerb.Communicate]: 1 },
      });
      s = r1.state;
      chain.push(digestState(s));
      // tick 2: second attempt while the focus hand is held → refusal, no spend.
      const r2 = applyIntentDoor(s, ctx(2n), [ext(2n, 2, communicate("two"))], {
        attentionCost: { [PlayerVerb.Communicate]: 1 },
      });
      s = r2.state;
      chain.push(digestState(s));
      // tick 3: occupancy matures (half-open at 3n), verb lands again; then the
      // host rolls the business month: the loan is serviced.
      const r3 = applyIntentDoor(s, ctx(3n), [ext(3n, 3, communicate("three"))], {
        attentionCost: { [PlayerVerb.Communicate]: 1 },
      });
      chain.push(digestState(r3.state));
      const paid = replenishAtBusinessMonth(r3.state.attention ?? createAttentionState(), 43_200, true);
      chain.push(digestState(Object.freeze({ ...r3.state, attention: paid })));
      return chain;
    };
    const a = run();
    const b = run();
    expect(a.length).toBe(4);
    for (let i = 0; i < a.length; i += 1) expect(a[i]).toBe(b[i]);
    // ×100 replay stability of the terminal digest.
    const final = a[a.length - 1] as string;
    for (let n = 0; n < 100; n += 1) expect(run()[3]).toBe(final);
  });
});
