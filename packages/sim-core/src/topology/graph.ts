/**
 * MultiGraph over four typed edge-sets — MASTER_REPORT §4.2 (WS-2 R1–R25):
 * graph-is-map. "What you build IS the board traffic walks and threats
 * attack." One node registry, four edge relations:
 *
 *  - `data`    — DRAWN dependencies (consumer → provider). Dragging a cable
 *                to a DB mechanically opens the SQL-injection surface: the
 *                edge IS the attack surface (§4.2 R1).
 *  - `power`   — ASSIGNED tree: facility → room → PDU → outlet → PSU. Every
 *                consumer socket ("slot") is fed by exactly one supplier;
 *                cycles are impossible by construction (fail-loud check).
 *  - `control` — admin-domain paint (controller → controlled). Also carries
 *                staff holdings: person → runbook/system/credential.
 *  - `trust`   — DERIVED auth graph, regenerated from grants
 *                (§4.2 architecture contributions: "trust edges *derived*
 *                from graph + grants"). Never hand-painted; `paintTrust`
 *                replaces the whole relation.
 *
 * The logical-vs-physical law lives across two files: THIS graph is what can
 * happen; the co-location index in ./physical.ts is what happens TOGETHER.
 *
 * Determinism (§3.4, docs/CONVENTIONS.md §4): every mutation bumps
 * `version` (blast-radius memoization key, §4.2 "memoized by board.version");
 * every set-valued query returns ids sorted by code point — never Map order
 * leaking into state; no floats, no clocks, no RNG here (structure only).
 */

import type { EntityId, MoneyUnit } from "../types.ts";
import { asMoney } from "../types.ts";

/** Edge identities share the EntityId id-space: "Everything Is a Thing"
 *  (§7.16) — a cable is hoverable/pinnable, so it gets a first-class id. */
export type EdgeId = EntityId;

export type EdgeKind = "data" | "power" | "control" | "trust";

export const EDGE_KINDS: readonly EdgeKind[] = ["data", "power", "control", "trust"];

/* ═══════════════════════════ Nodes ═══════════════════════════ */

/**
 * One registry entry. `kind` is a bundle vocabulary string ("server",
 * "switch", "pdu", "facility", "person", "runbook", …) — topology never
 * branches on business types (§4.3 R77 no-privileged-path), it branches on
 * STRUCTURE. The remaining fields exist purely so the correlation math in
 * ./redundancy.ts can answer "what do these two share?" from the node
 * itself, and the blast index can answer customer/MRR counts without
 * leaving the graph (instant-answer contract, §4.2 interaction-latency law).
 */
export interface TopoNode {
  readonly id: EntityId;
  readonly kind: string;
  /** Software/artifact template id; null = ad-hoc. Same template ⇒ same
   *  failure profile (co-residency "template" hyperedge, §4.2 R59–R71). */
  readonly template: string | null;
  /** Firmware/software version (shared-version correlation, §7.4). */
  readonly softwareVersion: string | null;
  /** Change/maintenance-window bucket (time correlation: everything changed
   *  in the same window fails in the same window). */
  readonly changeWindow: string | null;
  /** Aggregate fields, maintained upstream; topology only SUMS them. */
  readonly customers: number;
  readonly mrrMicroUsd: MoneyUnit;
}

export interface NodeDraft {
  readonly id: EntityId;
  readonly kind: string;
  readonly template?: string | null;
  readonly softwareVersion?: string | null;
  readonly changeWindow?: string | null;
  readonly customers?: number;
  readonly mrrMicroUsd?: MoneyUnit;
}

/** Boundary parse (Law 2): floats and negatives never enter trusted state.
 *  Frozen (T-11): the parsed record IS the store's copy — a caller mutating
 *  the returned object would corrupt graph state behind the `readonly`
 *  type's back, so the type-level promise is enforced at runtime. */
function parseNode(draft: NodeDraft): TopoNode {
  const customers = draft.customers ?? 0;
  if (!Number.isSafeInteger(customers) || customers < 0) {
    throw new Error(`graph.addNode: customers must be a non-negative safe integer, got ${customers}`);
  }
  return Object.freeze({
    id: draft.id,
    kind: draft.kind,
    template: draft.template ?? null,
    softwareVersion: draft.softwareVersion ?? null,
    changeWindow: draft.changeWindow ?? null,
    customers,
    mrrMicroUsd: draft.mrrMicroUsd ?? asMoney(0n),
  });
}

/* ═══════════════════════════ Edges ═══════════════════════════ */

/**
 * Direction semantics, stated once (all four kinds read `from → to`):
 *  - data:    `from` DEPENDS ON `to`        (blast floods IN-edges)
 *  - power:   `from` FEEDS `to` at slot     (facility→room→PDU→outlet→PSU)
 *  - control: `from` GOVERNS/HOLDS `to`     (person→runbook, domain→system)
 *  - trust:   `from` AUTHENTICATES AGAINST `to` (service→directory)
 */
export type Edge =
  | { readonly kind: "data"; readonly id: EdgeId; readonly from: EntityId; readonly to: EntityId }
  | {
      readonly kind: "power";
      readonly id: EdgeId;
      readonly from: EntityId;
      readonly to: EntityId;
      /** Consumer socket name, unique per fed node: "psu1", "psu2"… */
      readonly slot: string;
    }
  | {
      readonly kind: "control";
      readonly id: EdgeId;
      readonly from: EntityId;
      readonly to: EntityId;
      /** Admin-domain label this paint belongs to. */
      readonly domain: string;
    }
  | {
      readonly kind: "trust";
      readonly id: EdgeId;
      readonly from: EntityId;
      readonly to: EntityId;
      /** Grant/role this edge was derived from; null = explicit seed. */
      readonly via: string | null;
    };

export type EdgeDraft =
  | { readonly kind: "data"; readonly id?: EdgeId; readonly from: EntityId; readonly to: EntityId }
  | {
      readonly kind: "power";
      readonly id?: EdgeId;
      readonly from: EntityId;
      readonly to: EntityId;
      readonly slot: string;
    }
  | {
      readonly kind: "control";
      readonly id?: EdgeId;
      readonly from: EntityId;
      readonly to: EntityId;
      readonly domain: string;
    }
  | {
      readonly kind: "trust";
      readonly id?: EdgeId;
      readonly from: EntityId;
      readonly to: EntityId;
      readonly via?: string | null;
    };

function defaultEdgeId(draft: EdgeDraft): EdgeId {
  const base = `edge:${draft.kind}:${draft.from}->${draft.to}`;
  if (draft.kind === "power") return `${base}:${draft.slot}` as EdgeId;
  if (draft.kind === "control") return `${base}:${draft.domain}` as EdgeId;
  if (draft.kind === "trust") return `${base}:${draft.via ?? "grant"}` as EdgeId;
  return base as EdgeId;
}

/* ═══════════════════════════ The graph ═══════════════════════════ */

export interface TopologyGraph {
  /** Monotonic mutation counter — blast cache key (§4.2 memoize-by-version). */
  readonly version: number;

  addNode(draft: NodeDraft): TopoNode;
  removeNode(id: EntityId): void;
  node(id: EntityId): TopoNode | null;
  hasNode(id: EntityId): boolean;
  nodeIds(): readonly EntityId[];

  addEdge(draft: EdgeDraft): Edge;
  removeEdge(id: EdgeId): void;
  edge(id: EdgeId): Edge | null;
  edgesOfKind(kind: EdgeKind): readonly Edge[];
  /** Outgoing edges of `from`, optionally narrowed to one relation. */
  outEdges(from: EntityId, kind?: EdgeKind): readonly Edge[];
  /** Incoming edges at `to`, optionally narrowed to one relation. */
  inEdges(to: EntityId, kind?: EdgeKind): readonly Edge[];
}

/**
 * Code-point comparator — locale-free, stable forever (§3.4: no `Intl`, no
 * locale collation). All set-valued answers go through it.
 */
export function compareIds(a: EntityId, b: EntityId): -1 | 0 | 1 {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function sortedIds(ids: Iterable<EntityId>): readonly EntityId[] {
  return [...new Set(ids)].sort(compareIds);
}

export function createGraph(): TopologyGraph {
  const nodes = new Map<EntityId, TopoNode>();
  const edges = new Map<EdgeId, Edge>();
  const outIndex = new Map<EntityId, Set<EdgeId>>();
  const inIndex = new Map<EntityId, Set<EdgeId>>();
  let version = 0;

  function requireNode(id: EntityId, role: string): TopoNode {
    const found = nodes.get(id);
    if (found === undefined) {
      throw new Error(`graph: unknown node "${id}" (${role}) — register it before wiring edges`);
    }
    return found;
  }

  function link(from: EntityId, to: EntityId, id: EdgeId): void {
    const outSet = outIndex.get(from) ?? new Set<EdgeId>();
    outSet.add(id);
    outIndex.set(from, outSet);
    const inSet = inIndex.get(to) ?? new Set<EdgeId>();
    inSet.add(id);
    inIndex.set(to, inSet);
  }

  function unlink(from: EntityId, to: EntityId, id: EdgeId): void {
    outIndex.get(from)?.delete(id);
    inIndex.get(to)?.delete(id);
  }

  /** Walk power in-edges upward from `start`; throws if `forbidden` is
   *  reached (the new edge would close a cycle in the feed tree). */
  function assertNoPowerCycle(start: EntityId, forbidden: EntityId): void {
    const seen = new Set<EntityId>([start]);
    let frontier: EntityId[] = [start];
    while (frontier.length > 0) {
      const next: EntityId[] = [];
      for (const current of frontier) {
        for (const edgeId of inIndex.get(current) ?? []) {
          const edge = edges.get(edgeId);
          if (edge === undefined || edge.kind !== "power") continue;
          if (edge.from === forbidden) {
            throw new Error(
              `graph.addEdge(power): "${edge.from}" already draws power through "${forbidden}" — the feed graph is a tree (facility→room→PDU→outlet→PSU), cycles are illegal`,
            );
          }
          if (seen.has(edge.from)) continue;
          seen.add(edge.from);
          next.push(edge.from);
        }
      }
      frontier = next;
    }
  }

  function collect(index: Map<EntityId, Set<EdgeId>>, id: EntityId, kind: EdgeKind | undefined): readonly Edge[] {
    const found: Edge[] = [];
    for (const edgeId of index.get(id) ?? []) {
      const edge = edges.get(edgeId);
      if (edge === undefined) continue;
      if (kind !== undefined && edge.kind !== kind) continue;
      found.push(edge);
    }
    return found;
  }

  return {
    get version(): number {
      return version;
    },

    addNode(draft: NodeDraft): TopoNode {
      if (nodes.has(draft.id)) {
        throw new Error(`graph.addNode: duplicate node id "${draft.id}"`);
      }
      const parsed = parseNode(draft);
      nodes.set(parsed.id, parsed);
      version += 1;
      return parsed;
    },

    removeNode(id: EntityId): void {
      requireNode(id, "removeNode");
      const doomed = [...collect(outIndex, id, undefined), ...collect(inIndex, id, undefined)];
      for (const edge of doomed) {
        unlink(edge.from, edge.to, edge.id);
        edges.delete(edge.id);
      }
      outIndex.delete(id);
      inIndex.delete(id);
      nodes.delete(id);
      version += 1;
    },

    node(id: EntityId): TopoNode | null {
      return nodes.get(id) ?? null;
    },

    hasNode(id: EntityId): boolean {
      return nodes.has(id);
    },

    nodeIds(): readonly EntityId[] {
      return sortedIds(nodes.keys());
    },

    addEdge(draft: EdgeDraft): Edge {
      const from = requireNode(draft.from, "edge from");
      const to = requireNode(draft.to, "edge to");
      if (from.id === to.id) {
        throw new Error(`graph.addEdge: self-edge on "${from.id}" is illegal`);
      }
      const id = draft.id ?? defaultEdgeId(draft);
      if (edges.has(id)) {
        throw new Error(`graph.addEdge: duplicate edge id "${id}"`);
      }
      if (draft.kind === "power") {
        if (draft.slot.length === 0) {
          throw new Error(`graph.addEdge(power): empty slot name on feed into "${to.id}"`);
        }
        const occupied = collect(inIndex, to.id, "power").find((e) => e.kind === "power" && e.slot === draft.slot);
        if (occupied !== undefined) {
          throw new Error(
            `graph.addEdge(power): slot "${draft.slot}" on "${to.id}" already fed by "${occupied.from}" — one supplier per socket`,
          );
        }
        assertNoPowerCycle(from.id, to.id);
      }
      const edge: Edge = Object.freeze(
        draft.kind === "data"
          ? { kind: "data", id, from: draft.from, to: draft.to }
          : draft.kind === "power"
            ? { kind: "power", id, from: draft.from, to: draft.to, slot: draft.slot }
            : draft.kind === "control"
              ? { kind: "control", id, from: draft.from, to: draft.to, domain: draft.domain }
              : { kind: "trust", id, from: draft.from, to: draft.to, via: draft.via ?? null },
      );
      edges.set(id, edge);
      link(edge.from, edge.to, id);
      version += 1;
      return edge;
    },

    removeEdge(id: EdgeId): void {
      const edge = edges.get(id);
      if (edge === undefined) {
        throw new Error(`graph.removeEdge: unknown edge id "${id}"`);
      }
      unlink(edge.from, edge.to, id);
      edges.delete(id);
      version += 1;
    },

    edge(id: EdgeId): Edge | null {
      return edges.get(id) ?? null;
    },

    edgesOfKind(kind: EdgeKind): readonly Edge[] {
      const found: Edge[] = [];
      for (const edge of edges.values()) {
        if (edge.kind === kind) found.push(edge);
      }
      return found;
    },

    outEdges(from: EntityId, kind?: EdgeKind): readonly Edge[] {
      requireNode(from, "outEdges");
      return collect(outIndex, from, kind);
    },

    inEdges(to: EntityId, kind?: EdgeKind): readonly Edge[] {
      requireNode(to, "inEdges");
      return collect(inIndex, to, kind);
    },
  };
}

/* ═══════════════════════════ Structural queries ═══════════════════════════ */

/**
 * One upstream power feed PATH, from the consumer socket to one root
 * supplier. A dual-fed outlet (ATS) yields one entry per upstream path —
 * conservative on purpose: redundancy math treats every traversed PDU as a
 * shared domain until proven otherwise. */
export interface PowerFeed {
  readonly slot: string;
  /** [supplier, supplier-of-supplier, …] — nearest first, terminated at a
   *  root. T-b pin: `chain[0]` IS the node feeding the device (the direct
   *  supplier), NOT the tier above it — consumers like redundancy's
   *  `feedNodes` and `feedAncestorOfKind` read "which upstreams does this
   *  node sit behind" off this array, and a chain that skipped the direct
   *  supplier hid the very PDU a device hangs off. Pinned by the
   *  "powerFeeds chain shape (T-b)" tests. */
  readonly chain: readonly EntityId[];
}

/** Ceiling on upstream feed paths a single `powerFeeds` call may enumerate
 *  (T-10). The depth-64 belt stops tall chains but not a WIDE one: a
 *  diamond-merged feed DAG doubles the path count per merge stage, so k
 *  merge layers explode as 2^k. Enumeration claims a slot per path produced
 *  at every recursion level; past the cap the walk fails loud instead of
 *  hanging the simulation tick that hovered a device. */
const MAX_UPSTREAM_PATHS = 4096;

interface PathBudget {
  remaining: number;
}

function claimPath(budget: PathBudget, at: EntityId): void {
  budget.remaining -= 1;
  if (budget.remaining >= 0) return;
  throw new Error(
    `graph.powerFeeds: upstream feed enumeration exceeded the ${MAX_UPSTREAM_PATHS}-path cap near "${at}" — the power graph merges circuits too aggressively to enumerate (path cap, T-10)`,
  );
}

function upstreamPaths(
  graph: TopologyGraph,
  supplier: EntityId,
  depth: number,
  budget: PathBudget,
): readonly (readonly EntityId[])[] {
  // Belt against pathological recursion; the cycle guard in addEdge already
  // makes the feed graph acyclic.
  if (depth > 64) {
    throw new Error(`graph.powerFeeds: upstream power chain deeper than 64 at "${supplier}" — feed tree is malformed`);
  }
  const feeds = graph.inEdges(supplier, "power");
  if (feeds.length === 0) return [];
  const paths: EntityId[][] = [];
  for (const edge of feeds) {
    if (edge.kind !== "power") continue;
    const rest = upstreamPaths(graph, edge.from, depth + 1, budget);
    if (rest.length === 0) {
      claimPath(budget, edge.from);
      paths.push([edge.from]);
      continue;
    }
    for (const tail of rest) {
      claimPath(budget, edge.from);
      paths.push([edge.from, ...tail]);
    }
  }
  return paths;
}

/** Element-wise lexicographic order over feed chains (T-2): slot equality
 *  with a shared head supplier is normal (one PSU fed by two PDUs), and the
 *  old comparator answered 1 for equal heads — letting Set insertion order
 *  (i.e. authoring order) decide the tie. Full-sequence compare is a total
 *  order, so the same feed SET always yields the same answer. */
function compareChains(a: readonly EntityId[], b: readonly EntityId[]): number {
  const shared = Math.min(a.length, b.length);
  for (let i = 0; i < shared; i += 1) {
    const order = compareIds(a[i] as EntityId, b[i] as EntityId);
    if (order !== 0) return order;
  }
  return a.length - b.length;
}

/** Every incoming power feed path of `device`, ordered by (slot, chain).
 *  Each chain starts at the device's DIRECT supplier (T-b) — see
 *  `PowerFeed.chain`. */
export function powerFeeds(graph: TopologyGraph, device: EntityId): readonly PowerFeed[] {
  const budget: PathBudget = { remaining: MAX_UPSTREAM_PATHS };
  const feeds: PowerFeed[] = [];
  for (const edge of graph.inEdges(device, "power")) {
    if (edge.kind !== "power") continue;
    const paths = upstreamPaths(graph, edge.from, 0, budget);
    if (paths.length === 0) {
      feeds.push({ slot: edge.slot, chain: [edge.from] });
      continue;
    }
    // `upstreamPaths` enumerates the suppliers ABOVE edge.from; the feed of
    // the device itself begins at edge.from (T-b), so it heads every chain.
    for (const chain of paths) feeds.push({ slot: edge.slot, chain: [edge.from, ...chain] });
  }
  return feeds.sort(
    (a, b) =>
      (a.slot < b.slot ? -1 : a.slot > b.slot ? 1 : 0) ||
      compareChains(a.chain as readonly EntityId[], b.chain as readonly EntityId[]),
  );
}

/** Nearest ancestor (per feed) whose node `kind` matches — e.g. the PDU each
 *  PSU feed ultimately hangs off. The search walks the chain from its head,
 *  so the DIRECT supplier (chain[0], T-b) is part of the answer space; null
 *  only when a feed genuinely bypasses that tier. */
export function feedAncestorOfKind(
  graph: TopologyGraph,
  device: EntityId,
  kind: string,
): readonly { slot: string; ancestor: EntityId | null }[] {
  return powerFeeds(graph, device).map((feed) => {
    for (const ancestorId of feed.chain) {
      const ancestor = graph.node(ancestorId);
      if (ancestor !== null && ancestor.kind === kind) return { slot: feed.slot, ancestor: ancestorId };
    }
    return { slot: feed.slot, ancestor: null };
  });
}

/** Transitive data providers of `id` (everything it — or anything it
 *  depends on — consumes), nearest-first BFS, self excluded. */
export function dataAncestors(graph: TopologyGraph, id: EntityId): readonly EntityId[] {
  const seen = new Set<EntityId>([id]);
  const reached: EntityId[] = [];
  let frontier: EntityId[] = [id];
  while (frontier.length > 0) {
    const next: EntityId[] = [];
    for (const current of frontier) {
      for (const edge of graph.outEdges(current, "data")) {
        if (seen.has(edge.to)) continue;
        seen.add(edge.to);
        reached.push(edge.to);
        next.push(edge.to);
      }
    }
    frontier = next;
  }
  return sortedIds(reached);
}

/** Transitive data DEPENDENTS of `id` — everything whose dependency chain
 *  reaches it (data in-edges, reversed flood). This is the logical half of
 *  blast radius. Self excluded, result sorted. */
export function dataDescendants(graph: TopologyGraph, id: EntityId): readonly EntityId[] {
  const seen = new Set<EntityId>([id]);
  const reached: EntityId[] = [];
  let frontier: EntityId[] = [id];
  while (frontier.length > 0) {
    const next: EntityId[] = [];
    for (const current of frontier) {
      for (const edge of graph.inEdges(current, "data")) {
        if (seen.has(edge.from)) continue;
        seen.add(edge.from);
        reached.push(edge.from);
        next.push(edge.from);
      }
    }
    frontier = next;
  }
  return sortedIds(reached);
}

/** Transitive control governors of `id` (admin domains AND staff who hold it
 *  through them), climbing control in-edges. */
export function controlAncestors(graph: TopologyGraph, id: EntityId): readonly EntityId[] {
  const seen = new Set<EntityId>([id]);
  const reached: EntityId[] = [];
  let frontier: EntityId[] = [id];
  while (frontier.length > 0) {
    const next: EntityId[] = [];
    for (const current of frontier) {
      for (const edge of graph.inEdges(current, "control")) {
        if (seen.has(edge.from)) continue;
        seen.add(edge.from);
        reached.push(edge.from);
        next.push(edge.from);
      }
    }
    frontier = next;
  }
  return sortedIds(reached);
}

/** Everything this node GOVERNS via control edges (direct paint targets). */
export function governedBy(graph: TopologyGraph, controller: EntityId): readonly EntityId[] {
  const targets: EntityId[] = [];
  for (const edge of graph.outEdges(controller, "control")) targets.push(edge.to);
  return sortedIds(targets);
}

/** Every device the circuit feeds, transitively, down the POWER tree
 *  (outgoing power edges). Excludes the circuit node itself. Sorted. */
export function powerConsumers(graph: TopologyGraph, circuit: EntityId): readonly EntityId[] {
  const seen = new Set<EntityId>([circuit]);
  const reached: EntityId[] = [];
  let frontier: EntityId[] = [circuit];
  while (frontier.length > 0) {
    const next: EntityId[] = [];
    for (const current of frontier) {
      for (const edge of graph.outEdges(current, "power")) {
        if (seen.has(edge.to)) continue;
        seen.add(edge.to);
        reached.push(edge.to);
        next.push(edge.to);
      }
    }
    frontier = next;
  }
  return sortedIds(reached);
}

/** Who directly governs this node (control in-edge sources). */
export function governorsOf(graph: TopologyGraph, target: EntityId): readonly EntityId[] {
  const holders: EntityId[] = [];
  for (const edge of graph.inEdges(target, "control")) holders.push(edge.from);
  return sortedIds(holders);
}

/* ═══════════════════════════ Trust derivation ═══════════════════════════ */

/** Source fact for the derived auth graph: `principal` may act against
 *  `target` under `role` (a directory group, an OAuth scope, a sudo rule). */
export interface TrustGrant {
  readonly principal: EntityId;
  readonly target: EntityId;
  readonly role: string;
}

function trustEdgeId(grant: TrustGrant): EdgeId {
  return `edge:trust:${grant.principal}->${grant.target}:${grant.role}` as EdgeId;
}

/**
 * Replace the entire trust relation with one derived from `grants` — the
 * "derived, not painted" law (§4.2). Deterministic: grants are sorted by
 * (principal, target, role) before painting, so the same grant SET always
 * yields the same graph regardless of authoring order.
 */
export function paintTrust(graph: TopologyGraph, grants: readonly TrustGrant[]): void {
  for (const edge of [...graph.edgesOfKind("trust")]) graph.removeEdge(edge.id);
  const ordered = [...grants].sort(
    (a, b) =>
      compareIds(a.principal, b.principal) ||
      compareIds(a.target, b.target) ||
      (a.role < b.role ? -1 : a.role > b.role ? 1 : 0),
  );
  for (const grant of ordered) {
    graph.addEdge({
      kind: "trust",
      id: trustEdgeId(grant),
      from: grant.principal,
      to: grant.target,
      via: grant.role,
    });
  }
}

/** Auth check: can `principal` reach `target` through the trust chain? */
export function isTrustedTo(graph: TopologyGraph, principal: EntityId, target: EntityId): boolean {
  if (!graph.hasNode(principal) || !graph.hasNode(target)) return false;
  const seen = new Set<EntityId>([principal]);
  let frontier: EntityId[] = [principal];
  while (frontier.length > 0) {
    const next: EntityId[] = [];
    for (const current of frontier) {
      for (const edge of graph.outEdges(current, "trust")) {
        if (edge.to === target) return true;
        if (seen.has(edge.to)) continue;
        seen.add(edge.to);
        next.push(edge.to);
      }
    }
    frontier = next;
  }
  return false;
}

/** Transitive trust anchors of `id` — the directories/CEAs it (or anything it
 *  trusts) authenticates against. Feeds the shared-directory correlation. */
export function trustAnchors(graph: TopologyGraph, id: EntityId): readonly EntityId[] {
  const seen = new Set<EntityId>([id]);
  const reached: EntityId[] = [];
  let frontier: EntityId[] = [id];
  while (frontier.length > 0) {
    const next: EntityId[] = [];
    for (const current of frontier) {
      for (const edge of graph.outEdges(current, "trust")) {
        if (seen.has(edge.to)) continue;
        seen.add(edge.to);
        reached.push(edge.to);
        next.push(edge.to);
      }
    }
    frontier = next;
  }
  return sortedIds(reached);
}
