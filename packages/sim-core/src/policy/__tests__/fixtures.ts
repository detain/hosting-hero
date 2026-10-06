/**
 * Shared test fixtures for the policy module. Fixed-point literals here are
 * authored with Math.round in TEST code only (acceptable: fixtures are the
 * boundary parse; sim logic never sees floats).
 */

import {
  asEntityId,
  asMetricId,
  asMoney,
  asRuleId,
  asRunSeed,
  observedKey,
  type EntityId,
  type MetricId,
  type ObservedCell,
  type ObservedKey,
  type PolicyAction,
  type PolicyCard,
  type PolicyEscalation,
  type PolicyThreshold,
  type Predicate,
  type ResolutionBand,
  type RuleId,
  type RulePhaseIn,
  type SimTick,
  type TickContext,
} from "../../types";
import { streamFor } from "../../kernel/rng";

/** Fixed literal: F(0.85) → Q16.16 raw. */
export function F(x: number): bigint {
  return BigInt(Math.round(x * 65536));
}

export const MIN_US = 60_000_000n;

export function cell(value: bigint | null, status: ObservedCell<unknown>["status"] = "live"): ObservedCell<unknown> {
  return {
    value,
    fidelity: (status === "live" ? 4 : 1) as ResolutionBand,
    freshnessUs: 0n,
    coverage: F(1),
    certainty: F(status === "unknown" ? 0 : 1),
    status,
  };
}

export function predicate(metric: string, comparator: Predicate["comparator"], threshold: PolicyThreshold): Predicate {
  return { metric: asMetricId(metric), comparator, threshold };
}

export function valueThreshold(
  amount: bigint,
  unit: "percent" | "us" | "ms" | "count" | "micro-usd" | "ratio" | "minutes",
): PolicyThreshold {
  return { kind: "value", amount, unit };
}

export function action(id: PolicyAction["id"], value: bigint | null = null, runbookName: string | null = null): PolicyAction {
  return { id, value, runbookName };
}

export interface CardSpec {
  readonly id: string;
  readonly scopeEntity?: string | null;
  readonly scopeKind?: PolicyCard["scope"]["kind"];
  readonly when: readonly Predicate[];
  readonly forUs?: bigint;
  readonly then: readonly PolicyAction[];
  readonly unless?: readonly Predicate[];
  readonly escalate?: PolicyEscalation;
  readonly band?: PolicyCard["band"];
  readonly upkeep?: bigint;
}

export function card(spec: CardSpec): PolicyCard {
  const scopeKind = spec.scopeKind ?? (spec.scopeEntity === undefined || spec.scopeEntity === null ? "estate" : "object");
  const base: PolicyCard = {
    id: asRuleId(spec.id),
    scope: { kind: scopeKind, ref: scopeKind === "estate" ? null : (spec.scopeEntity ?? null) },
    when: tuple3(spec.when) as PolicyCard["when"],
    then: tuple3(spec.then) as PolicyCard["then"],
    band: spec.band ?? "execute",
    upkeepMicroUsd: asMoney(spec.upkeep ?? 10n),
  };
  // Optional clauses assembled at the fixture boundary (cast is test-side
  // authoring convenience; real cards go through validatePolicyCard).
  const clauses: Record<string, unknown> = {};
  if (spec.forUs !== undefined) clauses.for = { durationUs: spec.forUs };
  if (spec.unless !== undefined) clauses.unless = spec.unless;
  if (spec.escalate !== undefined) clauses.else = spec.escalate;
  return { ...base, ...clauses } as PolicyCard;
}

function tuple3<T>(items: readonly T[]): readonly T[] {
  if (items.length < 1 || items.length > 3) throw new Error(`fixture tuple must be 1..3, got ${items.length}`);
  return [...items];
}

export function tickContext(tick: SimTick): TickContext {
  return {
    tick,
    minute: Number(tick),
    clocks: { realUs: tick * 1_000_000n, simUs: tick * MIN_US, businessUs: tick * 1_000_000n, wallUs: tick * 1_000_000n },
  };
}

/** One tick of observed truth: cells = [entity, property, value|null, status?]. */
export function observedOf(cells: readonly (readonly [string, string, bigint | null, ("live" | "stale" | "unknown")?])[]): Map<ObservedKey, ObservedCell<unknown>> {
  const map = new Map<ObservedKey, ObservedCell<unknown>>();
  for (const [entity, property, value, status] of cells) {
    map.set(observedKey(asEntityId(entity), property), cell(value, status ?? "live"));
  }
  return map;
}

export function phaseInput(
  tick: SimTick,
  observed: ReadonlyMap<ObservedKey, ObservedCell<unknown>>,
  book: readonly PolicyCard[],
  rngSeed: bigint = 42n,
  suppressed: readonly RuleId[] = [],
): RulePhaseIn {
  const context = tickContext(tick);
  return {
    context,
    observed,
    book,
    suppressed,
    rng: streamFor(asRunSeed(rngSeed), "policy-test", context.minute),
  };
}

/** Stable JSON for byte-comparing intents/firings (bigint → string). */
export function stableJson(value: unknown): string {
  return JSON.stringify(value, (_k, v) => (typeof v === "bigint" ? `${v}n` : v));
}

/** Total-index helper for tests under noUncheckedIndexedAccess. */
export function at<T>(arr: readonly T[], i: number): T {
  const value = arr[i];
  if (value === undefined) throw new Error(`fixture: missing index ${i} of ${arr.length}`);
  return value;
}

export const ENT = {
  web: "web-1",
  db: "db-1",
  edge: "edge-2",
} satisfies Record<string, string>;

export function cpuEntities(): EntityId[] {
  return [asEntityId(ENT.web), asEntityId(ENT.db)];
}

export type { MetricId };
