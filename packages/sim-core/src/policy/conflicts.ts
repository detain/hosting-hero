/**
 * Static conflict detector — runs on SAVE, never in the tick path
 * (MASTER_REPORT Appendix B §2.4, R5 "conflict detection shown in the book",
 * R7 self-inflicted incidents as content).
 *
 * Each rule compiles to a read-set (metric nouns of WHEN/UNLESS mapped
 * through the closed metric→token table) and a write-set (THEN actions
 * through the fixed action→effect table — "the table IS the surface area").
 * Pairwise interference where W(A) ∩ R(B) ≠ ∅ classifies into:
 *  (a) contradictory actions on a shared trigger,
 *  (b) cycles A⇒B⇒A — the scale-out/cost-cap oscillator archetype,
 *  (c) trigger-shadowing via rule ORDER (earlier rule consumes the event),
 *  (d) resource contention (overlapping scope + same hand/budget pool).
 *
 * 40–200 rules → ≤40k pairs: microseconds. Output ordering is fully
 * deterministic (kind rank, then rule ids, then detail).
 */

import type { PolicyActionId, PolicyCard, RuleId } from "../types.ts";
import {
  ACTION_EFFECTS,
  ACTION_POOLS,
  CONTRADICTORY_PAIRS,
  DEFAULT_METRIC_TOKENS,
  type EffectToken,
  type ResourcePool,
} from "./grammar.ts";
import { detectDirectedCyclesBounded, type DirectedGraph } from "./graph.ts";

export type ConflictKind =
  | "oscillation-cycle"
  | "contradictory-actions"
  | "order-shadowing"
  | "resource-contention"
  /** P7: the bounded cycle scan hit its work budget — the oscillation report
   *  is INCOMPLETE (truncated=true in detail), never silently "no cycles". */
  | "cycle-scan-budget-exceeded";

export interface ConflictFinding {
  readonly kind: ConflictKind;
  /** Involved rules in canonical book order. */
  readonly ruleIds: readonly RuleId[];
  /** Human-readable, byte-stable explanation (editor badges consume this). */
  readonly detail: string;
}

/** Scope selector granularity for interference purposes. */
type ScopeTag = "estate" | "object" | "grouped";

interface CompiledRule {
  readonly index: number;
  readonly ruleId: RuleId;
  readonly reads: ReadonlySet<EffectToken>;
  readonly writes: ReadonlySet<EffectToken>;
  readonly pools: ReadonlySet<ResourcePool>;
  readonly actionIds: readonly PolicyActionId[];
  /** `${metric}|${comparator}` signatures of the WHEN clause. */
  readonly signatures: ReadonlySet<string>;
  readonly scopeTag: ScopeTag;
  readonly scopeRef: string | null;
}

export interface ConflictOptions {
  /** Per-hosting-type additions to the metric→token classifier (WS-3 owns
   *  the noun namespace; the detector stays closed over tokens). */
  readonly metricTokens?: Readonly<Record<string, readonly EffectToken[]>>;
}

function tokenizeMetric(metric: string, opts: ConflictOptions): readonly EffectToken[] {
  const override = opts.metricTokens;
  const mapped = override?.[metric] ?? DEFAULT_METRIC_TOKENS[metric];
  return mapped ?? [];
}

function scopeTagOf(card: PolicyCard): ScopeTag {
  if (card.scope.kind === "estate") return "estate";
  if (card.scope.kind === "object") return "object";
  return "grouped";
}

/** Compile one card to its read/write/pool sets (exported for editor use:
 *  the same sets drive the tether-crossing display, R13/§2.4 Display). */
export function compileRuleSets(card: PolicyCard, opts: ConflictOptions = {}): Omit<CompiledRule, "index"> {
  const reads = new Set<EffectToken>();
  const signatures = new Set<string>();
  for (const predicate of [...card.when, ...(card.unless ?? [])]) {
    for (const token of tokenizeMetric(String(predicate.metric), opts)) reads.add(token);
  }
  for (const predicate of card.when) {
    signatures.add(`${String(predicate.metric)}|${predicate.comparator}`);
  }
  const writes = new Set<EffectToken>();
  const pools = new Set<ResourcePool>();
  const actionIds: PolicyActionId[] = [];
  for (const action of card.then) {
    actionIds.push(action.id);
    for (const token of ACTION_EFFECTS[action.id]) writes.add(token);
    for (const pool of ACTION_POOLS[action.id]) pools.add(pool);
  }
  return {
    ruleId: card.id,
    reads,
    writes,
    pools,
    actionIds,
    signatures,
    scopeTag: scopeTagOf(card),
    scopeRef: card.scope.ref,
  };
}

/** Conservative scope overlap: estate touches everything; two object scopes
 *  overlap only on the same ref; grouped (role/query/class) scopes are
 *  un-analyzable without the tag index (G4), so overlap is ASSUMED — extra
 *  warnings are the safe direction on a save-time lint. */
function scopesOverlap(a: CompiledRule, b: CompiledRule): boolean {
  if (a.scopeTag === "estate" || b.scopeTag === "estate") return true;
  if (a.scopeTag === "object" && b.scopeTag === "object") return a.scopeRef === b.scopeRef;
  return true;
}

function intersects<A>(a: ReadonlySet<A>, b: ReadonlySet<A>): boolean {
  for (const item of a) {
    if (b.has(item)) return true;
  }
  return false;
}

function sharedTokens<A>(a: ReadonlySet<A>, b: ReadonlySet<A>): A[] {
  const out: A[] = [];
  for (const item of a) {
    if (b.has(item)) out.push(item);
  }
  return out.sort((x, y) => (String(x) < String(y) ? -1 : String(x) > String(y) ? 1 : 0));
}

function contradictoryPairBetween(
  a: CompiledRule,
  b: CompiledRule,
): readonly [PolicyActionId, PolicyActionId] | null {
  for (const [x, y] of CONTRADICTORY_PAIRS) {
    if (
      (a.actionIds.includes(x) && b.actionIds.includes(y)) ||
      (a.actionIds.includes(y) && b.actionIds.includes(x))
    ) {
      return [x, y] as const;
    }
  }
  return null;
}

/** Pairwise static conflict scan of an ORDERED book (array order = canonical
 *  evaluation order). Pure and deterministic. */
export function detectConflicts(
  book: readonly PolicyCard[],
  opts: ConflictOptions = {},
): readonly ConflictFinding[] {
  const compiled: CompiledRule[] = book.map((card, index) => ({
    ...compileRuleSets(card, opts),
    index,
  }));
  const findings: ConflictFinding[] = [];

  /* (b) oscillation cycles over the interference graph: edge A→B iff A's
   * write-set can move B's trigger tokens AND the scopes overlap. Length-1
   * self-feed is EXCLUDED — a rule writing the metric it watches is ordinary
   * stabilizing negative feedback (the FOR-debounce exists for it); the doc's
   * oscillator archetype is explicitly A⇒B⇒A (§2.4(b)). */
  const nodes: string[] = compiled.map((rule) => String(rule.index));
  const edges: (readonly [string, string])[] = [];
  for (const a of compiled) {
    for (const b of compiled) {
      if (a.index === b.index) continue;
      if (!scopesOverlap(a, b)) continue;
      if (intersects(a.writes, b.reads)) edges.push([String(a.index), String(b.index)]);
    }
  }
  const graph: DirectedGraph = { nodes, edges };
  // P7: BOUNDED scan. Estate rules sharing `capacity` make this graph a
  // mutual-interference K_n — complete elementary-cycle enumeration is
  // exponential and can hang save-lint. The spec's archetype is A⇒B⇒A, so we
  // scan lengths 2–3 under a hard work budget and surface truncation loudly.
  const scan = detectDirectedCyclesBounded(graph, false);
  if (scan.truncated) {
    findings.push({
      kind: "cycle-scan-budget-exceeded",
      ruleIds: [],
      detail:
        `CYCLE_SCAN_BUDGET_EXCEEDED: oscillation scan stopped after ${scan.steps} DFS steps ` +
        `(max cycle length 3) — truncated=true, cycle report INCOMPLETE; ` +
        `the book's interference graph is dense (K_n over shared tokens)`,
    });
  }
  for (const cycle of scan.cycles) {
    const ids = cycle.map((label) => ruleIdAt(compiled, Number(label)));
    const tokens = cycle
      .flatMap((label, i) => {
        const rule = compiled[Number(label)] as CompiledRule;
        const next = compiled[Number(cycle[(i + 1) % cycle.length] as string)] as CompiledRule;
        return sharedTokens(rule.writes, next.reads).map(String);
      })
      .filter((token, i, all) => all.indexOf(token) === i)
      .sort();
    findings.push({
      kind: "oscillation-cycle",
      ruleIds: orderIds(compiled, ids),
      detail: `A⇒B cycle over tokens [${tokens.join(",")}] — the scale-out/cost-cap archetype (R7)`,
    });
  }

  /* Pairwise (a), (c), (d) over book-ordered pairs. */
  for (const a of compiled) {
    for (const b of compiled) {
      if (a.index >= b.index) continue;
      if (!scopesOverlap(a, b)) continue;
      const ids = [a.ruleId, b.ruleId] as const;

      // (a) contradictory actions fired off a shared trigger.
      if (intersects(a.reads, b.reads)) {
        const pair = contradictoryPairBetween(a, b);
        if (pair !== null) {
          findings.push({
            kind: "contradictory-actions",
            ruleIds: ids,
            detail: `"${pair[0]}" vs "${pair[1]}" on shared trigger tokens [${sharedTokens(a.reads, b.reads).map(String).join(",")}]`,
          });
        }
      }

      // (c) order-shadowing: shared trigger signature AND the earlier rule's
      // action can consume the very condition the later rule waits on
      // (§2.4(c) "earlier rule consumes the event").
      const sharedSignature = [...a.signatures].some((sig) => b.signatures.has(sig));
      if (sharedSignature && intersects(a.writes, b.reads)) {
        findings.push({
          kind: "order-shadowing",
          ruleIds: ids,
          detail: `#${a.index} ${a.ruleId} fires first on a shared trigger and writes [${sharedTokens(a.writes, b.reads).map(String).join(",")}] that #${b.index} ${b.ruleId} still reads — later rule may never fire`,
        });
      }

      // (d) resource contention: overlapping scope + same hand/budget pool.
      if (intersects(a.pools, b.pools)) {
        findings.push({
          kind: "resource-contention",
          ruleIds: ids,
          detail: `shared ${sharedTokens(a.pools, b.pools).join("/")} pool under overlapping scope`,
        });
      }
    }
  }

  return sortFindings(findings);
}

/* ═══════════════════════ Deterministic output order ═══════════════════════ */

const KIND_RANK: Readonly<Record<ConflictKind, number>> = {
  "oscillation-cycle": 0,
  "contradictory-actions": 1,
  "order-shadowing": 2,
  "resource-contention": 3,
  // Rank 4 (last): an incompleteness notice, kept after real findings so a
  // truncation never displaces a planted oscillator in the editor list.
  "cycle-scan-budget-exceeded": 4,
};

function sortFindings(findings: readonly ConflictFinding[]): ConflictFinding[] {
  return [...findings].sort((x, y) => {
    if (KIND_RANK[x.kind] !== KIND_RANK[y.kind]) return KIND_RANK[x.kind] - KIND_RANK[y.kind];
    const kx = `${x.ruleIds.join("\u0000")}\u0001${x.detail}`;
    const ky = `${y.ruleIds.join("\u0000")}\u0001${y.detail}`;
    return kx < ky ? -1 : kx > ky ? 1 : 0;
  });
}

function ruleIdAt(compiled: readonly CompiledRule[], index: number): RuleId {
  const rule = compiled[index];
  if (rule === undefined) throw new Error(`policy.conflicts: internal index ${index} out of range`);
  return rule.ruleId;
}

function orderIds(compiled: readonly CompiledRule[], ids: readonly RuleId[]): RuleId[] {
  const position = new Map(compiled.map((rule) => [rule.ruleId, rule.index]));
  return [...new Set(ids)].sort((x, y) => (position.get(x) as number) - (position.get(y) as number));
}
