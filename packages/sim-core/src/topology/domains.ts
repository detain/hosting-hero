/**
 * Failure domains — the co-location half of the two-layer law.
 *
 * ./graph.ts data edges say what CAN happen (dependency flood); this file
 * materializes what happens TOGETHER: hyperedge groups derived from the
 * physical index and the power tree —
 *
 *  - same PDU      : every device whose feed chain touches this PDU (§7.3
 *                    "single best placement trap" — the shared circuit),
 *  - same rack     : nested-grid co-residents,
 *  - same switch   : devices sharing a data-plane upstream switch,
 *  - same template : one artifact, one bug, one blast (software correlation).
 *
 * deathModel follows the Board architecture (WS-2 gap G-1): KILL_ALL for
 * hard domains (the circuit trips ⇒ everything on it dies), DEGRADE_ALL for
 * shared-capacity (the rack's cooling sags ⇒ members wobble, they don't
 * die). SHARED_CAPACITY is folded into DEGRADE_ALL + `capacityMW` here —
 * the pipeline agent can re-shape if G-1 ratifies a third mode.
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
  for (const [rack, members] of byRack) {
    domains.push({
      id: domainId("rack", rack),
      kind: "rack",
      anchor: rack,
      /* ═══ OWNER-DECISION REQUESTED (T-9) ═══
       * deathModel here is "kill-all", yet this file's header exemplar for
       * shared capacity ("the rack's cooling sags ⇒ members wobble, they
       * don't die") describes DEGRADE_ALL. Both readings are defensible;
       * the owner must pick one:
       *  (a) KEEP kill-all — a rack-level event (fire, flood, forklift)
       *      genuinely takes every U; tier-2 chain-kill stays available for
       *      the case where a placed member dies AND the rack anchor is in
       *      the killed set by some other route.
       *  (b) FLIP to degrade-all — racks join switches as amber-only
       *      shared capacity: co-residents always shade `degraded`, never
       *      `affected`; HUD reds turn ambers and blast tests re-pin.
       * Related sub-question the decision must answer: rack ANCHORS are not
       * members here (members come from placements only), so killing the
       * rack node directly currently enumerates no rack domain — neither
       * (a) nor (b) explodes co-residents through a directly-killed anchor
       * until the anchor joins `members`. Pinned by the test "PINS rack
       * deathModel = kill-all and its exact blast reading today".
       * Current code ships (a). Do not silently flip. */
      deathModel: "kill-all",
      reasonToken: "shared-rack",
      members: [...members].sort(compareIds),
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
  readonly version: number;
  readonly domains: readonly FailureDomain[];
  /** node → domains it belongs to (member index, sorted by domain id). */
  domainsFor(node: EntityId): readonly FailureDomain[];
}

/**
 * The dual-version stamp of the joint projection (T-1): the domain set
 * consumes BOTH stores — `rackDomains` reads PhysicalIndex's own version
 * (placeDevice/removeDevice/registerRack/registerCircuit bump it) while the
 * rest read graph.version. Any cache keyed on a projection of graph+index
 * MUST key on THIS number, never on graph.version alone, or a placement
 * with an untouched graph serves a stale blast radius.
 */
export function projectionVersion(graph: TopologyGraph, index: PhysicalIndex): number {
  return graph.version * 1_000_003 + index.version;
}

/** Rebuild the full co-location projection. Callers cache by
 *  (graph.version, index.version) — cheap enough to memoize freely. */
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
