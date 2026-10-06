/**
 * Policy grammar boundary: closed tables + card validation + numeric parsing
 * (MASTER_REPORT Appendix B §2.2, §4.5 WS-5).
 *
 * This file is the ONLY place policy data crosses from "authored JSON-shaped
 * rows" to "trusted interpreter input" (Law 2 — Parse, Don't Validate). The
 * action→effect table below IS the surface area (Appendix B §2.4: "the table
 * IS the surface area, so it's small and closed").
 *
 * No closures from data, no eval, no dynamic verbs (CONVENTIONS §4 — "a card
 * composer, never a scripting language").
 */

import type {
  Comparator,
  Fixed,
  MetricUnit,
  PolicyAction,
  PolicyActionId,
  PolicyCard,
  PolicyThreshold,
  Predicate,
} from "../types.ts";

/** Fail-loud error type for every invalid card / table row (Law 4). */
export class PolicyGrammarError extends Error {
  constructor(message: string) {
    super(`policy.grammar: ${message}`);
    this.name = "PolicyGrammarError";
  }
}

/* ═══════════════════════ Closed vocabularies ═══════════════════════ */

export const COMPARATORS: ReadonlySet<string> = new Set<string>([
  ">",
  "<",
  "changed",
  "fails",
  "completes",
]);

export const METRIC_UNITS: ReadonlySet<string> = new Set<string>([
  "percent",
  "us",
  "ms",
  "count",
  "micro-usd",
  "ratio",
  "minutes",
]);

export const ACTION_IDS: ReadonlySet<string> = new Set<string>([
  "scale-out",
  "shed-class",
  "page",
  "open-ticket",
  "dispatch-remote-hands",
  "raise-inspection-depth",
  "failover",
  "run-runbook",
  "drain",
  "queue-change",
]);

export const BANDS: ReadonlySet<string> = new Set<string>(["inform", "consult", "execute"]);

export const SCOPE_KINDS: ReadonlySet<string> = new Set<string>([
  "object",
  "role",
  "query",
  "class",
  "estate",
]);

/** Q16.16 scale — local constant so comparisons never re-derive it. */
const FIXED_SCALE = 65_536n;

/* ═══════════════════════ Effect / pool tables ═══════════════════════ */

/** State tokens an action can move (write-set vocabulary — closed enum). */
export type EffectToken =
  | "capacity"
  | "budget"
  | "load-shed"
  | "inspection-depth"
  | "routing"
  | "tickets"
  | "attention"
  | "queue-config"
  | "runbook-execution";

/** Contended resource pools per action (Appendix B §2.4(d): "same selector +
 *  hand/budget pool"). */
export type ResourcePool = "hands" | "budget" | "attention";

/** action → state deltas it may cause (the fixed action→effect table). */
export const ACTION_EFFECTS: Readonly<Record<PolicyActionId, readonly EffectToken[]>> = {
  "scale-out": ["capacity", "budget"],
  "shed-class": ["load-shed", "capacity"],
  page: ["attention"],
  "open-ticket": ["tickets", "attention"],
  "dispatch-remote-hands": ["budget"],
  "raise-inspection-depth": ["inspection-depth"],
  failover: ["routing", "capacity", "budget"],
  "run-runbook": ["runbook-execution"],
  drain: ["capacity"],
  "queue-change": ["queue-config"],
};

/** action → resource pools it consumes when executed. */
export const ACTION_POOLS: Readonly<Record<PolicyActionId, readonly ResourcePool[]>> = {
  "scale-out": ["hands", "budget"],
  "shed-class": [],
  page: ["attention"],
  "open-ticket": ["attention"],
  "dispatch-remote-hands": ["hands", "budget"],
  "raise-inspection-depth": ["hands"],
  failover: ["hands", "budget"],
  "run-runbook": ["hands"],
  drain: ["hands"],
  "queue-change": ["hands"],
};

/** Contradictory action pairs — an action that expands against one that
 *  removes the same resource, at the same trigger (Appendix B §2.4(a)). */
export const CONTRADICTORY_PAIRS: ReadonlyArray<readonly [PolicyActionId, PolicyActionId]> = [
  ["scale-out", "drain"],
  ["failover", "drain"],
];

/**
 * Default read-set classifier: observed-truth metric nouns → the state
 * tokens they depend on. Rules read METRICS (§B 2.2 "name from observed-truth
 * namespace"); metrics are open strings, so this closed table is what wires a
 * trigger metric into the effect-token graph. Unknown metric → no tokens
 * (conservative: contributes no interference edges, no false cycles).
 * Callers may extend the table at save time (per-hosting-type noun sets are a
 * WS-3 authoring contract), never per-rule.
 */
export const DEFAULT_METRIC_TOKENS: Readonly<Record<string, readonly EffectToken[]>> = {
  cpu: ["capacity"],
  load: ["capacity"],
  "queue-depth": ["capacity"],
  p95: ["capacity", "inspection-depth"],
  cost: ["capacity", "budget"],
  "budget-remaining": ["budget"],
  upkeep: ["budget"],
  utilization: ["capacity"],
  "shed-share": ["load-shed"],
  "inspection-blocks": ["inspection-depth"],
  tickets: ["tickets"],
  "ticket-backlog": ["tickets"],
  suspicion: ["inspection-depth"],
};

/* ═══════════════════════ Boundary validation ═══════════════════════ */

function checkTuple(length: number, what: string, ruleId: string): void {
  if (length < 1 || length > 3) {
    throw new PolicyGrammarError(
      `${ruleId}: ${what} must hold 1..3 items (grammar tuple), got ${length}`,
    );
  }
}

function checkPredicate(predicate: Predicate, ruleId: string, clause: string): void {
  if (!COMPARATORS.has(predicate.comparator)) {
    throw new PolicyGrammarError(
      `${ruleId}: ${clause} comparator "${String(predicate.comparator)}" is not in the closed enum`,
    );
  }
  checkThreshold(predicate.threshold, ruleId, clause, predicate.comparator);
}

function checkThreshold(threshold: PolicyThreshold, ruleId: string, clause: string, comparator: Comparator): void {
  if (threshold.kind === "value") {
    if (!METRIC_UNITS.has(threshold.unit)) {
      throw new PolicyGrammarError(
        `${ruleId}: ${clause} unit "${String(threshold.unit)}" is not in the closed enum`,
      );
    }
    if (typeof threshold.amount !== "bigint") {
      throw new PolicyGrammarError(`${ruleId}: ${clause} amount must be a Fixed bigint`);
    }
    return;
  }
  // ">"/"<" need a numeric threshold; event-name/class-ref only pair with the
  // event comparators (changed/fails/completes read engine counters).
  if (comparator === ">" || comparator === "<") {
    throw new PolicyGrammarError(
      `${ruleId}: ${clause} comparator "${comparator}" requires a value threshold, got ${threshold.kind}`,
    );
  }
}

function checkAction(action: PolicyAction, ruleId: string): void {
  if (!ACTION_IDS.has(action.id)) {
    throw new PolicyGrammarError(`${ruleId}: THEN action "${String(action.id)}" is not in the closed verb enum`);
  }
  if (action.id === "run-runbook" && (typeof action.runbookName !== "string" || action.runbookName.length === 0)) {
    throw new PolicyGrammarError(`${ruleId}: run-runbook requires a non-empty runbookName`);
  }
  if (action.id !== "run-runbook" && action.runbookName !== null) {
    throw new PolicyGrammarError(`${ruleId}: runbookName is only legal on run-runbook`);
  }
  if (action.value !== null && typeof action.value !== "bigint") {
    throw new PolicyGrammarError(`${ruleId}: action value must be a Fixed bigint or null`);
  }
}

/**
 * Validate one authored card at the store boundary. Throws
 * PolicyGrammarError with a rule-qualified, clause-specific message (Law 4).
 * Returns the card untouched on success so callers can chain.
 */
export function validatePolicyCard(card: PolicyCard): PolicyCard {
  if (typeof card.id !== "string" || card.id.length === 0) {
    throw new PolicyGrammarError("card id must be a non-empty string");
  }
  const ruleId = card.id;

  if (!SCOPE_KINDS.has(card.scope.kind)) {
    throw new PolicyGrammarError(
      `${ruleId}: scope kind "${String(card.scope.kind)}" is not in the closed enum`,
    );
  }
  if (card.scope.kind !== "estate" && (typeof card.scope.ref !== "string" || card.scope.ref.length === 0)) {
    throw new PolicyGrammarError(`${ruleId}: non-estate scope requires a non-empty ref`);
  }
  if (card.scope.kind === "estate" && card.scope.ref !== null) {
    throw new PolicyGrammarError(`${ruleId}: estate scope ref must be null`);
  }

  checkTuple(card.when.length, "WHEN", ruleId);
  for (const predicate of card.when) checkPredicate(predicate, ruleId, "WHEN");

  if (card.for !== undefined) {
    if (typeof card.for.durationUs !== "bigint" || card.for.durationUs <= 0n) {
      throw new PolicyGrammarError(`${ruleId}: FOR durationUs must be a positive bigint of µs`);
    }
  }

  checkTuple(card.then.length, "THEN", ruleId);
  for (const action of card.then) checkAction(action, ruleId);

  if (card.unless !== undefined) {
    checkTuple(card.unless.length, "UNLESS", ruleId);
    for (const guard of card.unless) checkPredicate(guard, ruleId, "UNLESS");
  }

  if (card.else !== undefined) {
    const to = card.else.to;
    if (to !== "band" && to !== "role" && to !== "runbook") {
      throw new PolicyGrammarError(`${ruleId}: ELSE target "${String(to)}" is not band|role|runbook`);
    }
    if (typeof card.else.ref !== "string" || card.else.ref.length === 0) {
      throw new PolicyGrammarError(`${ruleId}: ELSE ref must be a non-empty string`);
    }
    if (to === "band" && !BANDS.has(card.else.ref)) {
      throw new PolicyGrammarError(`${ruleId}: ELSE band "${card.else.ref}" is not inform|consult|execute`);
    }
  }

  if (!BANDS.has(card.band)) {
    throw new PolicyGrammarError(`${ruleId}: band "${String(card.band)}" is not inform|consult|execute`);
  }
  if (typeof card.upkeepMicroUsd !== "bigint" || card.upkeepMicroUsd < 0n) {
    throw new PolicyGrammarError(`${ruleId}: upkeepMicroUsd must be a non-negative bigint of µ$`);
  }
  return card;
}

/* ═══════════════════════ Threshold parsing ═══════════════════════ */

/**
 * Convert a Fixed threshold amount to the cell's native integer domain.
 * Units describe how the THRESHOLD is written; observed cells carry their
 * natural values (Fixed fractions for percent/ratio/count, integer µs for
 * latency metrics, integer µ$ for money — see DECISIONS interpretation D-7):
 *  - percent / ratio / count → Fixed raw unchanged (cell is Fixed);
 *  - us   → Fixed µs → integer µs;
 *  - ms   → Fixed ms → integer µs;
 *  - minutes → Fixed min → integer µs;
 *  - micro-usd → Fixed WHOLE DOLLARS → integer µ$ (Q16.16 cannot hold µ$).
 */
interface UnitRatio {
  readonly num: bigint;
  readonly den: bigint;
}

const IDENTITY: UnitRatio = { num: 1n, den: 1n };

const UNIT_RATIO: Readonly<Record<MetricUnit, UnitRatio>> = {
  percent: IDENTITY,
  ratio: IDENTITY,
  count: IDENTITY,
  us: { num: 1n, den: FIXED_SCALE },
  ms: { num: 1_000n, den: FIXED_SCALE },
  minutes: { num: 60_000_000n, den: FIXED_SCALE },
  "micro-usd": { num: 1_000_000n, den: FIXED_SCALE },
};

function divideRoundHalfAway(numerator: bigint, denominator: bigint): bigint {
  const negative = numerator < 0n !== denominator < 0n;
  const absNum = numerator < 0n ? -numerator : numerator;
  const absDen = denominator < 0n ? -denominator : denominator;
  const whole = absNum / absDen;
  const doubled = (absNum % absDen) * 2n;
  const magnitude = doubled >= absDen ? whole + 1n : whole;
  return negative ? -magnitude : magnitude;
}

export function thresholdAmountToCellRaw(unit: MetricUnit, amount: Fixed): bigint {
  const ratio = UNIT_RATIO[unit];
  return divideRoundHalfAway(amount * ratio.num, ratio.den);
}

/** Parse one ObservedCell value to the comparable integer domain. Cells must
 *  already carry bigint (Fixed or integer µs/µ$) — a JS number reaching the
 *  interpreter means the step-12 writer skipped its boundary parse (Law 2),
 *  so we halt rather than do float math in a logic path (CONVENTIONS §4). */
export function observedValueToCellRaw(value: unknown, ruleId: string, metric: string): bigint {
  if (typeof value === "bigint") return value;
  throw new PolicyGrammarError(
    `${ruleId}: observed cell for metric "${metric}" carries ${typeof value} ${String(value)} — ` +
      `sim writers must parse to Fixed/integer bigint at the boundary`,
  );
}
