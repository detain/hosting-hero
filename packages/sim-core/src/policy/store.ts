/**
 * Policy Book store — append-only rule VERSIONS with upkeep, canonical
 * evaluation order, insert/move/suspend, and the Kill Switch flag
 * (MASTER_REPORT §4.5 R3/R4/R18, Appendix B §2.1 "visible, ordered,
 * editable, auditable, each with upkeep").
 *
 * Laws honored here:
 *  - append-only: the journal is write-once — every card version ever saved
 *    stays for audit; "live" is derived as the LAST journal entry per rule id,
 *    so no row is ever edited or deleted (Law 3, pure store→store functions);
 *  - order is semantics: `order` IS the canonical evaluation order the
 *    interpreter follows (§B R4);
 *  - long-term rule-book history stays MySQL-side (§4.5 stack item 3) — this
 *    store is the in-state active book the replay hash covers.
 */

import type { MoneyUnit, PolicyCard, RuleId, SimTick } from "../types.ts";
import { asMoney } from "../types.ts";
import { validatePolicyCard } from "./grammar.ts";

export class PolicyStoreError extends Error {
  constructor(message: string) {
    super(`policy.store: ${message}`);
    this.name = "PolicyStoreError";
  }
}

/** One immutable journal row = one saved version of one card. */
export interface RuleVersionRecord {
  readonly ruleId: RuleId;
  readonly version: number;
  readonly card: PolicyCard;
  readonly introducedAtTick: SimTick;
}

export interface PolicyStore {
  /** Append-only version journal, write order = chronology. */
  readonly journal: readonly RuleVersionRecord[];
  /** Canonical evaluation order over live rule ids (R4: order is load-bearing). */
  readonly order: readonly RuleId[];
  /** Per-rule suspension set (R18). Membership only. */
  readonly suspended: readonly RuleId[];
  /** Global Kill Switch (R18: one button, freezes ALL automation). */
  readonly frozen: boolean;
}

export function createPolicyStore(): PolicyStore {
  return { journal: [], order: [], suspended: [], frozen: false };
}

/** Live version of one rule (last journal row wins), or null. */
export function liveRecord(store: PolicyStore, ruleId: RuleId): RuleVersionRecord | null {
  for (let i = store.journal.length - 1; i >= 0; i -= 1) {
    const record = store.journal[i];
    if (record !== undefined && record.ruleId === ruleId) return record;
  }
  return null;
}

export function isSuspended(store: PolicyStore, ruleId: RuleId): boolean {
  return store.suspended.includes(ruleId);
}

/** The ACTIVE book in canonical evaluation order — hand this array to
 *  RulePhaseIn.book; `suspendedRuleIds` feeds RulePhaseIn.suppressed.
 *  (Interpretation D-13: suspended cards stay in the book so order stays
 *  auditable; the contract's suppressed channel is what stops evaluation.) */
export function activeBook(store: PolicyStore): readonly PolicyCard[] {
  const cards: PolicyCard[] = [];
  for (const ruleId of store.order) {
    const record = liveRecord(store, ruleId);
    if (record === null) {
      throw new PolicyStoreError(`order references rule "${ruleId}" with no journal row — corrupt store`);
    }
    cards.push(record.card);
  }
  return cards;
}

export function suspendedRuleIds(store: PolicyStore): readonly RuleId[] {
  return store.suspended.filter((ruleId) => store.order.includes(ruleId));
}

/** Sum of upkeep over live, NON-suspended rules, µ$/sim-minute (§B 2.1
 *  "each with upkeep"; interpretation D-2: suspended rules do not accrue). */
export function upkeepPerMinute(store: PolicyStore): MoneyUnit {
  let total = 0n;
  for (const ruleId of store.order) {
    if (isSuspended(store, ruleId)) continue;
    const record = liveRecord(store, ruleId);
    if (record === null) {
      throw new PolicyStoreError(`order references rule "${ruleId}" with no journal row — corrupt store`);
    }
    total += record.card.upkeepMicroUsd;
  }
  return asMoney(total);
}

/** Insert a brand-new card at `position` (0..len) of the canonical order. */
export function insertCard(
  store: PolicyStore,
  card: PolicyCard,
  position: number,
  tick: SimTick,
): PolicyStore {
  validatePolicyCard(card);
  if (liveRecord(store, card.id) !== null) {
    throw new PolicyStoreError(`rule "${card.id}" already exists — use reviseCard for a new version`);
  }
  const width = store.order.length;
  if (!Number.isSafeInteger(position) || position < 0 || position > width) {
    throw new PolicyStoreError(`insert position ${position} outside 0..${width}`);
  }
  const order = [...store.order];
  order.splice(position, 0, card.id);
  return {
    journal: [...store.journal, { ruleId: card.id, version: 1, card, introducedAtTick: tick }],
    order,
    suspended: store.suspended,
    frozen: store.frozen,
  };
}

/** Append-only revision: a new journal row at version+1, same canonical
 *  position, suspension state carried forward. */
export function reviseCard(store: PolicyStore, card: PolicyCard, tick: SimTick): PolicyStore {
  validatePolicyCard(card);
  const previous = liveRecord(store, card.id);
  if (previous === null) {
    throw new PolicyStoreError(`cannot revise unknown rule "${card.id}" — insert it first`);
  }
  return {
    journal: [
      ...store.journal,
      { ruleId: card.id, version: previous.version + 1, card, introducedAtTick: tick },
    ],
    order: store.order,
    suspended: store.suspended,
    frozen: store.frozen,
  };
}

/** Move a live rule to a new canonical position (R4). */
export function moveCard(store: PolicyStore, ruleId: RuleId, toPosition: number): PolicyStore {
  const from = store.order.indexOf(ruleId);
  if (from < 0) throw new PolicyStoreError(`move target "${ruleId}" is not an active rule`);
  if (!Number.isSafeInteger(toPosition) || toPosition < 0 || toPosition >= store.order.length) {
    throw new PolicyStoreError(`move position ${toPosition} outside 0..${store.order.length - 1}`);
  }
  if (from === toPosition) return store;
  const order = [...store.order];
  order.splice(from, 1);
  order.splice(toPosition, 0, ruleId);
  return { journal: store.journal, order, suspended: store.suspended, frozen: store.frozen };
}

/** Per-rule suspend/resume (R18); returns the store unchanged when the state
 *  already matches. */
export function setSuspended(store: PolicyStore, ruleId: RuleId, suspended: boolean): PolicyStore {
  if (liveRecord(store, ruleId) === null) {
    throw new PolicyStoreError(`suspend target "${ruleId}" is not an active rule`);
  }
  const has = isSuspended(store, ruleId);
  if (has === suspended) return store;
  return {
    journal: store.journal,
    order: store.order,
    suspended: suspended ? [...store.suspended, ruleId] : store.suspended.filter((id) => id !== ruleId),
    frozen: store.frozen,
  };
}

/** Kill Switch (R18). While frozen the evaluator emits NOTHING; unfreezing
 *  restores prior per-rule suspensions untouched. */
export function setFrozen(store: PolicyStore, frozen: boolean): PolicyStore {
  return { journal: store.journal, order: store.order, suspended: store.suspended, frozen };
}

/** Full audit view of every saved version of one rule, oldest first. */
export function ruleHistory(store: PolicyStore, ruleId: RuleId): readonly RuleVersionRecord[] {
  return store.journal.filter((record) => record.ruleId === ruleId);
}
