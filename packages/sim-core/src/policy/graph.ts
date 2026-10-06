/**
 * Deterministic directed-cycle detection (MASTER_REPORT Appendix B §2.4(b),
 * gap G12: "same detector machinery ... should cover it").
 *
 * Shared by the static conflict detector (rule A⇒B oscillation cycles) and
 * the alert-routing table (self-page escalation cycles — G12). Output is
 * byte-stable: cycles are canonicalized by rotation to their
 * lexicographically-smallest member, deduplicated, and sorted by
 * (length, joined-labels).
 *
 * Two entry points:
 *  - `detectDirectedCycles` — COMPLETE elementary-cycle enumeration (one DFS
 *    per root restricted to nodes ≥ the root, so each cycle is discovered
 *    from its minimum-order node). Exponential in the cycle count of a dense
 *    graph — fine for routing tables, NOT for a mutual-interference K_n.
 *  - `detectDirectedCyclesBounded` — length- and work-bounded scan for the
 *    save-lint path (P7): estate rules sharing `capacity` form a dense
 *    interference graph, and full enumeration can hang the editor; the spec
 *    only names the A⇒B⇒A archetype, so bound length ≤ 3 and report
 *    truncation past a work budget instead of completing.
 */

export interface DirectedGraph {
  /** Node labels in caller-provided order; duplicates are rejected (Law 4). */
  readonly nodes: readonly string[];
  readonly edges: readonly (readonly [string, string])[];
}

export class GraphError extends Error {
  constructor(message: string) {
    super(`policy.graph: ${message}`);
    this.name = "GraphError";
  }
}

function canonicalRotation(cycle: readonly string[]): string[] {
  let minIndex = 0;
  for (let i = 1; i < cycle.length; i += 1) {
    if ((cycle[i] as string) < (cycle[minIndex] as string)) minIndex = i;
  }
  return [...cycle.slice(minIndex), ...cycle.slice(0, minIndex)];
}

interface CompiledGraph {
  readonly index: Map<string, number>;
  readonly adjacency: string[][];
}

function compileGraph(graph: DirectedGraph, includeSelfLoops: boolean): CompiledGraph {
  const index = new Map<string, number>();
  graph.nodes.forEach((node, i) => {
    if (index.has(node)) throw new GraphError(`duplicate node "${node}"`);
    index.set(node, i);
  });
  const adjacency: string[][] = graph.nodes.map(() => []);
  for (const [from, to] of graph.edges) {
    const fromIndex = index.get(from);
    const toIndex = index.get(to);
    if (fromIndex === undefined || toIndex === undefined) {
      throw new GraphError(`edge ${from}→${to} references an unknown node`);
    }
    if (from === to && !includeSelfLoops) continue;
    if (!adjacency[fromIndex]?.includes(to)) adjacency[fromIndex]?.push(to);
  }
  return { index, adjacency };
}

export interface CycleScanOptions {
  /** Longest cycle reported, in nodes (self-loop = 1). The save-lint
   *  archetype is A⇒B⇒A, so 2–3 is all the spec names; Infinity = complete. */
  readonly maxCycleLength: number;
  /** Hard cap on neighbor-expansion steps; past it the scan halts with
   *  `truncated: true` instead of hanging on a dense mutual-interference K_n. */
  readonly workBudget: number;
}

export interface CycleScanResult {
  readonly cycles: string[][];
  /** True when the work budget stopped the scan — the cycle report is INCOMPLETE. */
  readonly truncated: boolean;
  /** Neighbor-expansion steps actually taken. */
  readonly steps: number;
}

/** Save-lint defaults: the A⇒B⇒A archetype at depth ≤ 3, 100k DFS steps. */
export const DEFAULT_CYCLE_SCAN: CycleScanOptions = { maxCycleLength: 3, workBudget: 100_000 };

function scan(graph: DirectedGraph, includeSelfLoops: boolean, opts: CycleScanOptions): CycleScanResult {
  const { index, adjacency } = compileGraph(graph, includeSelfLoops);
  const found = new Map<string, string[]>();
  const path: string[] = [];
  const onPath = new Set<string>();
  let steps = 0;
  let truncated = false;

  function visit(root: string, node: string): boolean {
    const neighbors = adjacency[index.get(node) as number] ?? [];
    for (const next of neighbors) {
      steps += 1;
      if (steps > opts.workBudget) {
        truncated = true;
        return false; // unwind — the budget is the law here
      }
      if (next === root) {
        const cycle = canonicalRotation(path);
        const key = cycle.join("\u0000");
        if (!found.has(key)) found.set(key, cycle);
        continue;
      }
      // Bound the search: only extend while a cycle could still close within
      // maxCycleLength (path holds the current chain, root first).
      if (path.length >= opts.maxCycleLength) continue;
      // Restriction "≥ root" keeps the enumeration complete without repeats.
      if ((index.get(next) as number) < (index.get(root) as number)) continue;
      if (onPath.has(next)) continue;
      onPath.add(next);
      path.push(next);
      const keepGoing = visit(root, next);
      path.pop();
      onPath.delete(next);
      if (!keepGoing) return false;
    }
    return true;
  }

  for (const root of graph.nodes) {
    onPath.add(root);
    path.push(root);
    const keepGoing = visit(root, root);
    path.pop();
    onPath.delete(root);
    if (!keepGoing) break;
  }

  const cycles = [...found.values()];
  cycles.sort((a, b) => {
    if (a.length !== b.length) return a.length - b.length;
    const ka = a.join("\u0000");
    const kb = b.join("\u0000");
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
  return { cycles, truncated, steps };
}

/**
 * Return every distinct elementary cycle as node-label sequences in traversal
 * order (COMPLETE enumeration — see the module header for the algorithm and
 * why density matters). A self-loop yields the single-element cycle `[a]`,
 * included only when `includeSelfLoops` is set — a rule feeding its own
 * trigger is stabilizing negative feedback in this grammar (the FOR-debounce
 * exists for it), so oscillation scans pass false; routing scans pass true
 * because page-yourself IS the bug even in one hop (G12).
 */
export function detectDirectedCycles(graph: DirectedGraph, includeSelfLoops: boolean): string[][] {
  return scan(graph, includeSelfLoops, { maxCycleLength: Infinity, workBudget: Infinity }).cycles;
}

/** Length- and work-bounded cycle scan (P7): reports truncation instead of
 *  hanging on a dense graph. `truncated: true` means MORE cycles may exist
 *  beyond `maxCycleLength` or past the work budget — callers must surface
 *  that (the save-lint emits a CYCLE_SCAN_BUDGET_EXCEEDED finding). */
export function detectDirectedCyclesBounded(
  graph: DirectedGraph,
  includeSelfLoops: boolean,
  opts: CycleScanOptions = DEFAULT_CYCLE_SCAN,
): CycleScanResult {
  return scan(graph, includeSelfLoops, opts);
}
