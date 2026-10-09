/**
 * save/reputation.ts — the ReputationLedger → ReputationState projection
 * (rest-host-wiring lane, fix-economy handoff). The load-bearing witness is
 * the byte-identity with economy's OWN publisher fold (`reputationFixed`):
 * HUD cell and save row can never disagree, because this map re-derives
 * exactly that Fixed value.
 */
import { describe, expect, it } from "vitest";
import { asCauseId, type SimMinute } from "../../types.ts";
import { fromRatio } from "../../kernel/fixed.ts";
import { reputationFixed } from "../../economy/reputation.ts";
import type { ReputationLedger } from "../../economy/reputation.ts";
import type { CovenantBreachRecord } from "../../economy/runway.ts";
import { SaveError } from "../errors.ts";
import { reputationStateFromLedger } from "../reputation.ts";

const LEDGER: ReputationLedger = Object.freeze({
  overallBps: 4_400n,
  honestHostFloor: true,
  lifetimeEvents: 7,
});

describe("reputationStateFromLedger", () => {
  it("folds overall to the unit Fixed — byte-ident to the economy publisher", () => {
    const state = reputationStateFromLedger(LEDGER);
    expect(state.overall).toBe(fromRatio(4_400n, 10_000n));
    expect(state.overall).toBe(reputationFixed(LEDGER));
  });

  it("aliases all four domains to overall (v0 single-domain reading)", () => {
    const state = reputationStateFromLedger(LEDGER);
    expect(state.domains.customerTrust).toBe(state.overall);
    expect(state.domains.upstreamTrust).toBe(state.overall);
    expect(state.domains.staffTrust).toBe(state.overall);
    expect(state.domains.industry).toBe(state.overall);
  });

  it("passes honestHostFloor through and maps breach minutes verbatim", () => {
    // Typed as economy's REAL record shape — proves the structural view
    // accepts what the covenant log actually carries.
    const breaches: readonly CovenantBreachRecord[] = Object.freeze([
      Object.freeze({ covenantId: "runway-3m", atBusinessMin: 1440 as SimMinute, monthIndex: 1, causeId: asCauseId("e:c1") }),
      Object.freeze({ covenantId: "evidence", atBusinessMin: 2880 as SimMinute, monthIndex: 2, causeId: asCauseId("e:c2") }),
    ]);
    const state = reputationStateFromLedger(LEDGER, breaches);
    expect(state.honestHostFloor).toBe(true);
    expect(state.breachHistoryTicks).toEqual([1440, 2880]);
  });

  it("defaults the breach log to empty", () => {
    expect(reputationStateFromLedger(LEDGER).breachHistoryTicks).toEqual([]);
  });

  it("endpoints: 0 bps and 10,000 bps stay exact", () => {
    expect(reputationStateFromLedger({ overallBps: 0n, honestHostFloor: false, lifetimeEvents: 0 }).overall).toBe(0n);
    expect(reputationStateFromLedger({ overallBps: 10_000n, honestHostFloor: false, lifetimeEvents: 0 }).overall).toBe(65_536n);
  });

  it("refuses an out-of-range ledger loudly (fail fast, Law 4)", () => {
    expect(() => reputationStateFromLedger({ overallBps: -1n, honestHostFloor: false, lifetimeEvents: 0 })).toThrow(SaveError);
    expect(() => reputationStateFromLedger({ overallBps: 10_001n, honestHostFloor: false, lifetimeEvents: 0 })).toThrow(/out of \[0, 10000\]/);
    expect(() => reputationStateFromLedger({ overallBps: 500 as never, honestHostFloor: false, lifetimeEvents: 0 })).toThrow(/must be bigint/);
  });

  it("returns a deeply frozen state (save rows are immutable)", () => {
    const state = reputationStateFromLedger(LEDGER);
    expect(Object.isFrozen(state)).toBe(true);
    expect(Object.isFrozen(state.domains)).toBe(true);
    expect(Object.isFrozen(state.breachHistoryTicks)).toBe(true);
  });
});
