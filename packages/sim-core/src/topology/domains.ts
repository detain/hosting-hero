/**
 * Failure domains — the co-location half of the two-layer law.
 *
 * ./graph.ts data edges say what CAN happen (dependency flood); this file
 * materializes what happens TOGETHER: hyperedge groups derived from the
 * physical index and the power tree —
 *
 *  - same PDU      : every device whose feed chain touches this PDU (§7.3
 *                    "single best placement trap" — the shared circuit),
 *                    KILL_ALL — power kills, RED,
 *  - same rack     : nested-grid co-residents, DEGRADE_ALL — racks degrade,
 *                    AMBER (T-9 ratified 2026-10-09),
 *  - same switch   : devices sharing a data-plane upstream switch,
 *                    DEGRADE_ALL (the rack's amber precedent),
 *  - same template : one artifact, one bug, one blast (software correlation).
 *
 * deathModel is the RATIFIED two-color law (T-9, owner decision 2026-10-09,
 * docs/adr/0009): power kills RED, racks degrade AMBER. KILL_ALL for the
 * power domains (the circuit trips ⇒ everything on it dies), DEGRADE_ALL for
 * racks and switches (the rack's cooling sags ⇒ members wobble, they don't
 * die). SHARED_CAPACITY is folded into DEGRADE_ALL + `capacityMW` here.
 *
 * Everything here is a PURE PROJECTION: rebuilt on demand from graph +
 * index, never stored as authority. That is why mutating the graph needs no
 * cache-invalidation dance beyond `version`.
 */

import type { EntityId } from "../types.ts";
import type { TopologyGraph } from "./graph.ts";
import { compareIds, dataDescendants, powerConsumers } from "./graph.ts";
import type { PhysicalIndex } from "./physical.ts";

export type DomainKind = "pdu" | "rack" | "switch" | "template";

export type DeathModel = "kill-all" | "degrade-all";

export interface FailureDomain {
  readonly id: EntityId;
  readonly kind: DomainKind;
  /** The anchor node whose failure takes the domain out (PDU / rack node
   *  id). For templates there is no anchor node — `null` — and the anchor
   *  for the fire is the template string reported in `reasonToken`. */
  readonly anchor: EntityId | null;
  readonly deathModel: DeathModel;
  readonly reasonToken: string;
  /** Members INCLUDING the anchor. Sorted by id — deterministic iteration. */
  readonly members: readonly EntityId[];
}

export function domainId(kind: DomainKind, anchor: EntityId | string): EntityId {
  return `domain:${kind}:${anchor}` as EntityId;
}

/* ═══════════════════════ Same-PDU / same-circuit from the power tree ═══════════════════════ */

/** Every node with power out-edges (any supplier tier: PDU, room feeder,
 *  facility) owns a downstream kill-set. Graph-driven — a supplier exists
 *  whether or not a circuit rating was registered in the physical index
 *  (ratings are for budgets, not for coupling). */
export function pduDomains(graph: TopologyGraph): readonly FailureDomain[] {
  const domains: FailureDomain[] = [];
  for (const nodeId of graph.nodeIds()) {
    if (graph.outEdges(nodeId, "power").length === 0) continue;
    const consumers = powerConsumers(graph, nodeId);
    const members = [nodeId, ...consumers];
    domains.push({
      id: domainId("pdu", nodeId),
      kind: "pdu",
      anchor: nodeId,
      deathModel: "kill-all",
      reasonToken: "shared-circuit",
      members: [...new Set(members)].sort(compareIds),
    });
  }
  return domains;
}

/** One domain per rack that holds devices. The rack itself is a graph node
 *  only if the caller registered it; the anchor is the rack id either way. */
export function rackDomains(graph: TopologyGraph, index: PhysicalIndex): readonly FailureDomain[] {
  const byRack = new Map<EntityId, EntityId[]>();
  for (const nodeId of graph.nodeIds()) {
    const placement = index.placementOf(nodeId);
    if (placement === null) continue;
    const bucket = byRack.get(placement.rack) ?? [];
    bucket.push(nodeId);
    byRack.set(placement.rack, bucket);
  }
  const domains: FailureDomain[] = [];
  for (const [rack, placements] of byRack) {
    domains.push({
      id: domainId("rack", rack),
      kind: "rack",
      anchor: rack,
      /* RATIFIED (T-9, owner decision 2026-10-09, docs/adr/0009): racks
       * DEGRADE-ALL and the anchor JOINS members. The two-color split of
       * the Board stands — a power-domain kill is RED (kills residents),
       * a rack domain is AMBER (degrades residents). Consequences, all
       * read off the existing blast tiers: killing the rack node dies the
       * rack itself (tier 1) and shades every co-resident amber (tier 3)
       * — no tier-2 explosion, ever; killing a co-resident shades the
       * rack node amber like any other member (the switch precedent).
       * The anchor lives INSIDE `members` (the interface contract, "members
       * INCLUDING the anchor"), sorted over the WHOLE array — T-8 discipline,
       * Set-dedup like pduDomains. Blast goldens and the rack-pin tests were
       * re-cut DELIBERATELY at ratification, never as drift. */
      deathModel: "degrade-all",
      reasonToken: "shared-rack",
      members: [...new Set([rack, ...placements])].sort(compareIds),
    });
  }
  return domains;
}

/* ═══════════════════════ Same-switch from the data graph ═══════════════════════ */

/** For each node of kind "switch": the set of endpoints whose data path
 *  reaches that switch — everything that transitively depends on it. */
export function switchDomains(graph: TopologyGraph): readonly FailureDomain[] {
  const domains: FailureDomain[] = [];
  for (const switchId of graph.nodeIds()) {
    const node = graph.node(switchId);
    if (node === null || node.kind !== "switch") continue;
    domains.push({
      id: domainId("switch", switchId),
      kind: "switch",
      anchor: switchId,
      deathModel: "degrade-all",
      reasonToken: "shared-switch",
      // sorted over the WHOLE array (T-8): prepending the anchor to sorted
      // descendants violated the FailureDomain sorted-members contract
      // whenever the switch id sorted after one of its dependents.
      members: [switchId, ...dataDescendants(graph, switchId)].sort(compareIds),
    });
  }
  return domains;
}

/* ═══════════════════════ Same-template from node metadata ═══════════════════════ */

/** Nodes sharing a software/artifact template fail together when the
 *  template itself is the vector (log4shell shape: no cable required). */
export function templateDomains(graph: TopologyGraph): readonly FailureDomain[] {
  const byTemplate = new Map<string, EntityId[]>();
  for (const nodeId of graph.nodeIds()) {
    const node = graph.node(nodeId);
    if (node === null || node.template === null) continue;
    const bucket = byTemplate.get(node.template) ?? [];
    bucket.push(nodeId);
    byTemplate.set(node.template, bucket);
  }
  const domains: FailureDomain[] = [];
  for (const [template, members] of [...byTemplate].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    domains.push({
      id: domainId("template", template),
      kind: "template",
      anchor: null,
      deathModel: "kill-all",
      reasonToken: `shared-template:${template}`,
      members: [...members].sort(compareIds),
    });
  }
  return domains;
}

/* ═══════════════════════ Aggregate projection ═══════════════════════ */

export interface DomainSet {
  /** Exact `(graph, index)` pair key — see `projectionVersion` (T-a). */
  readonly version: string;
  readonly domains: readonly FailureDomain[];
  /** node → domains it belongs to (member index, sorted by domain id). */
  domainsFor(node: EntityId): readonly FailureDomain[];
}

/**
 * The dual-version stamp of the joint projection (T-1): the domain set
 * consumes BOTH stores — `rackDomains` reads PhysicalIndex's own version
 * (placeDevice/removeDevice/registerRack/registerCircuit bump it) while the
 * rest read graph.version. Any cache keyed on a projection of graph+index
 * MUST key on THIS stamp, never on graph.version alone, or a placement
 * with an untouched graph serves a stale blast radius.
 *
 * T-a: the stamp is the EXACT pair key `"${graph.version}:${index.version}"`.
 * The previous fold `graph.version * 1_000_003 + index.version` collided
 * whenever index.version reached 1_000_003 — the pairs (1, 1_000_003) and
 * (2, 0) both folded to 2_000_006 — a theoretical-but-free bug, fixed by
 * refusing to fold at all. String key over BigInt arithmetic: every cache
 * that consumes this stamp is a `Map`, which hashes strings exactly as
 * cheaply as numbers, and one small allocation per lookup is noise at
 * cache-key frequency (one call per hover-frame per queried node).
 * Pinned by the "projectionVersion pair key (T-a)" tests.
 */
export function projectionVersion(graph: TopologyGraph, index: PhysicalIndex): string {
  return `${graph.version}:${index.version}`;
}

/** Rebuild the full co-location projection. Callers cache by
 *  `projectionVersion(graph, index)` — cheap enough to memoize freely. */
export function buildDomainSet(graph: TopologyGraph, index: PhysicalIndex): DomainSet {
  const domains = [...pduDomains(graph), ...rackDomains(graph, index), ...switchDomains(graph), ...templateDomains(graph)].sort(
    (a, b) => compareIds(a.id, b.id),
  );
  const byNode = new Map<EntityId, FailureDomain[]>();
  for (const domain of domains) {
    for (const member of domain.members) {
      const bucket = byNode.get(member) ?? [];
      bucket.push(domain);
      byNode.set(member, bucket);
    }
  }
  return {
    version: projectionVersion(graph, index),
    domains,
    domainsFor(node: EntityId): readonly FailureDomain[] {
      return byNode.get(node) ?? [];
    },
  };
}
