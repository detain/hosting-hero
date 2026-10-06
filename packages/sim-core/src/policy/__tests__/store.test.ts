import { describe, expect, it } from "vitest";

import { asRuleId } from "../../types";
import { PolicyGrammarError } from "../grammar";
import {
  activeBook,
  createPolicyStore,
  insertCard,
  isSuspended,
  moveCard,
  reviseCard,
  ruleHistory,
  setFrozen,
  setSuspended,
  suspendedRuleIds,
  upkeepPerMinute,
  PolicyStoreError,
} from "../store";
import { card, valueThreshold, predicate, action, F } from "./fixtures";

const LOW = card({
  id: "r-low",
  scopeEntity: "web-1",
  when: [predicate("cpu", ">", valueThreshold(F(0.85), "percent"))],
  then: [action("scale-out", F(2))],
});
const HIGH = card({
  id: "r-high",
  when: [predicate("p95", ">", valueThreshold(F(200), "ms"))],
  then: [action("page", F(1))],
  upkeep: 25n,
});

describe("policy store — append-only versions, order, upkeep, kill switch", () => {
  it("inserts cards and keeps canonical order", () => {
    let store = createPolicyStore();
    store = insertCard(store, LOW, 0, 1n);
    store = insertCard(store, HIGH, 1, 2n);
    expect(activeBook(store).map((c) => c.id)).toEqual([LOW.id, HIGH.id]);
    expect(upkeepPerMinute(store)).toBe(35n);
  });

  it("rejects duplicate ids, bad positions and invalid cards (fail loud)", () => {
    let store = insertCard(createPolicyStore(), LOW, 0, 0n);
    expect(() => insertCard(store, LOW, 1, 1n)).toThrow(PolicyStoreError);
    expect(() => insertCard(store, HIGH, 5, 1n)).toThrow(/outside 0\.\./);
    const broken = card({
      id: "r-broken",
      when: [predicate("cpu", ">" as const, { kind: "event-name", name: "boot" })],
      then: [action("page")],
    });
    expect(() => insertCard(store, broken, 0, 0n)).toThrow(PolicyGrammarError);
  });

  it("revises as a new version in place; history stays append-only", () => {
    let store = insertCard(createPolicyStore(), LOW, 0, 1n);
    const patched: typeof LOW = { ...LOW, upkeepMicroUsd: 99n as typeof LOW.upkeepMicroUsd };
    store = reviseCard(store, patched, 7n);
    expect(activeBook(store)[0]?.upkeepMicroUsd).toBe(99n);
    expect(upkeepPerMinute(store)).toBe(99n);
    const history = ruleHistory(store, LOW.id);
    expect(history.map((h) => h.version)).toEqual([1, 2]);
    expect(() => reviseCard(createPolicyStore(), patched, 1n)).toThrow(/insert it first/);
  });

  it("moves change the canonical evaluation order", () => {
    let store = insertCard(insertCard(createPolicyStore(), LOW, 0, 0n), HIGH, 1, 0n);
    store = moveCard(store, HIGH.id, 0);
    expect(activeBook(store).map((c) => c.id)).toEqual([HIGH.id, LOW.id]);
    expect(() => moveCard(store, asRuleId("ghost"), 0)).toThrow(PolicyStoreError);
    expect(() => moveCard(store, HIGH.id, 9)).toThrow(/outside/);
  });

  it("suspends per rule: order kept, upkeep stops accruing (D-2)", () => {
    let store = insertCard(insertCard(createPolicyStore(), LOW, 0, 0n), HIGH, 1, 0n);
    expect(isSuspended(store, LOW.id)).toBe(false);
    store = setSuspended(store, LOW.id, true);
    expect(suspendedRuleIds(store)).toEqual([LOW.id]);
    expect(activeBook(store).map((c) => c.id)).toEqual([LOW.id, HIGH.id]); // still listed
    expect(upkeepPerMinute(store)).toBe(25n);
    store = setSuspended(store, LOW.id, false);
    expect(suspendedRuleIds(store)).toEqual([]);
    expect(upkeepPerMinute(store)).toBe(35n);
  });

  it("freeze is a pure global flag (Kill Switch, R18)", () => {
    const store = insertCard(createPolicyStore(), LOW, 0, 0n);
    const frozen = setFrozen(store, true);
    expect(frozen.frozen).toBe(true);
    expect(store.frozen).toBe(false); // original untouched (Law 3)
    expect(activeBook(frozen).length).toBe(1); // freeze changes no content
  });
});
