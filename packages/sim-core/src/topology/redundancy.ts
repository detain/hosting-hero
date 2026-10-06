/**
 * EFFECTIVE vs NOMINAL redundancy — the "Broken N+1" verdict (§4.2 R14,
 * §7.4): two replicas that share any correlation domain are ONE replica.
 * "Two services on one directory = one service." The badge in the HUD is
 * computed here and nowhere else.
 *
 * The FIVE correlation types (mirroring types.ts DependencyEdge.correlation):
 *  - power   : the replicas' feed chains touch a common PDU/circuit node,
 *  - path    : a common switch sits in every replica's data ancestry,
 *  - software: same template AND same softwareVersion (a version-pinned
 *              fleet is one CVE deep),
 *  - human   : the same staff/admin-domain governs every replica's repair
 *              (control-ancestor intersection),
 *  - time    : same change-window bucket (they were all touched in the same
 *              maintenance slot, so they all fail in the same slot).
 *
 * Four topologies (§4.2 "× four topologies") — active-active, active-
 * standby, single-region-ha, multi-region — differ only in what the caller
 * declares as a REPLICASET; this file's math is topology-agnostic and reads
 * the declared set against the graph. N+1 CLAIMED is whatever the caller
 * says; the verdict reports the EFFECTIVE count after correlation collapse.
 */

import type { EntityId } from "../types.ts";
import type { TopologyGraph } from "./graph.ts";
import { compareIds, controlAncestors, dataAncestors, powerFeeds } from "./graph.ts";

export const CORRELATION_TYPES = ["power", "path", "software", "human", "time"] as const;
export type CorrelationType = (typeof CORRELATION_TYPES)[number];

export interface ReplicasDraft {
  readonly id: EntityId;
  /** Human label ("orders-db cluster") for the HUD reason line. */
  readonly label: string;
  /** Every node that is claimed to be an independent replica. */
  readonly members: readonly EntityId[];
  /** N+1 the operator BELIEVES they run (N primaries + spare). */
  readonly claimedN: number;
}

export interface CorrelationHit {
  readonly type: CorrelationType;
  /** The shared thing: PDU id, switch id, template@version, admin/governor
   *  id, window id — tooltip shows this. */
  readonly shared: string;
  /** Members caught by this correlation. */
  readonly members: readonly EntityId[];
}

export interface RedundancyVerdict {
  readonly replicas: EntityId;
  /** Nominal: what the operator declared (claimedN + 1 units survive any
   *  single failure… if true). */
  readonly nominalCount: number;
  /** Effective: the size of the LARGEST correlation-free partition plan —
   *  replicas grouped into correlation clusters, an failure can take at
   *  most one cluster… clusters are independent units. */
  readonly effectiveCount: number;
  readonly ok: boolean;
  readonly broken: boolean;
  /** First-fatal correlation (deterministic: type order, then shared token). */
  readonly domain: CorrelationType | null;
  readonly reason: string | null;
  readonly hits: readonly CorrelationHit[];
}

function feedNodes(graph: TopologyGraph, member: EntityId): Set<string> {
  const anchors = new Set<string>();
  for (const feed of powerFeeds(graph, member)) {
    for (const node of feed.chain) {
      const rec = graph.node(node);
      // a feed chain crossing a PDU-tier node pins that PDU as the domain
      if (rec !== null && (rec.kind === "pdu" || rec.kind === "facility" || rec.kind === "room")) {
        anchors.add(node);
      }
    }
  }
  return anchors;
}

function switchAnchors(graph: TopologyGraph, member: EntityId): Set<string> {
  const anchors = new Set<string>();
  for (const ancestor of dataAncestors(graph, member)) {
    const rec = graph.node(ancestor);
    if (rec !== null && rec.kind === "switch") anchors.add(ancestor);
  }
  return anchors;
}

/**
 * Find every correlation that collapses the replica set: for each type,
 * intersect the shared-domain signatures across ALL members — a domain
 * touched by every replica means the replicas are secretly one replica.
 * Pairwise (two-of-N) hits are reported too but only ALL-member collapses
 * break N+1 outright; partial overlaps degrade the effective count.
 */
export function findCorrelations(graph: TopologyGraph, draft: ReplicasDraft): readonly CorrelationHit[] {
  const hits: CorrelationHit[] = [];
  if (draft.members.length < 2) return hits;

  const signature = (
    kind: CorrelationType,
    extract: (member: EntityId) => Set<string>,
  ): void => {
    const perMember = draft.members.map(extract);
    // full intersection = fatal collapse; pairwise = degradation note
    const common = perMember.reduce((acc, set) => new Set([...acc].filter((v) => set.has(v))));
    for (const shared of common) {
      hits.push({ type: kind, shared, members: [...draft.members].sort(compareIds) });
    }
    if (common.size === 0) {
      // still surface pairwise overlaps so the HUD can shade pairs amber
      for (let i = 0; i < perMember.length; i += 1) {
        for (let j = i + 1; j < perMember.length; j += 1) {
          const a = perMember[i];
          const b = perMember[j];
          const left = draft.members[i];
          const right = draft.members[j];
          if (a === undefined || b === undefined || left === undefined || right === undefined) continue;
          for (const shared of [...a].sort()) {
            if (!b.has(shared)) continue;
            hits.push({
              type: kind,
              shared,
              members: [left, right].sort(compareIds),
            });
          }
        }
      }
    }
  };

  signature("power", (m) => feedNodes(graph, m));
  signature("path", (m) => switchAnchors(graph, m));
  signature("software", (m) => {
    const node = graph.node(m);
    if (node === null || node.template === null || node.softwareVersion === null) return new Set<string>();
    return new Set<string>([`${node.template}@${node.softwareVersion}`]);
  });
  signature("human", (m) => new Set<string>(controlAncestors(graph, m)));
  signature("time", (m) => {
    const node = graph.node(m);
    if (node === null || node.changeWindow === null) return new Set<string>();
    return new Set<string>([node.changeWindow]);
  });

  return hits.sort(
    (a, b) =>
      CORRELATION_TYPES.indexOf(a.type) - CORRELATION_TYPES.indexOf(b.type) ||
      (a.shared < b.shared ? -1 : a.shared > b.shared ? 1 : 0) ||
      compareIds(a.members[0] ?? ("" as EntityId), b.members[0] ?? ("" as EntityId)),
  );
}

/**
 * Maximum independent set over the collision relation, brute force with a
 * size bound — exact because replica sets are small (game-bounded ≤ ~10).
 * DFS take-then-skip keeps enumeration order deterministic and the first
 * maximum found wins ties.
 *
 * T-5: the ascending order the collided-key contract demands
 * (`${smaller}|${larger}`, built by assessRedundancy) is now ENFORCED here
 * with an internal sort instead of a documented hope — an unsorted caller
 * used to generate `${picked}|${candidate}` keys in descending shape that
 * no set built in canonical order contains, silently under-reporting
 * clashes. Dedup stays the caller's business (nominalCount counts what was
 * declared); only the ORDER is normalized.
 */
export function maxIndependentSet(members: readonly EntityId[], collided: ReadonlySet<string>): readonly EntityId[] {
  const ordered = [...members].sort(compareIds);
  let best: EntityId[] = [];
  const chosen: EntityId[] = [];
  const clashes = (candidate: EntityId): boolean =>
    chosen.some((picked) => collided.has(`${picked}|${candidate}`));
  function search(index: number): void {
    if (index === ordered.length) {
      if (chosen.length > best.length) best = [...chosen];
      return;
    }
    // bound: even taking everything left cannot beat the incumbent
    if (chosen.length + (ordered.length - index) <= best.length) return;
    const candidate = ordered[index];
    if (candidate !== undefined && !clashes(candidate)) {
      chosen.push(candidate);
      search(index + 1);
      chosen.pop();
    }
    search(index + 1);
  }
  search(0);
  return best;
}

/**
 * Verdict math: two members that share ANY correlation domain can die from
 * one event, so they cannot BOTH count toward N+1. Effective redundancy =
 * the largest correlation-free subset (max independent set over that
 * collision graph). N+1 holds only if effectiveCount ≥ claimedN + 1.
 */
export function assessRedundancy(graph: TopologyGraph, draft: ReplicasDraft): RedundancyVerdict {
  for (const member of draft.members) {
    if (!graph.hasNode(member)) {
      throw new Error(`redundancy: replica "${member}" of set "${draft.id}" is not in the graph`);
    }
  }
  const hits = findCorrelations(graph, draft);
  const collided = new Set<string>();
  for (const hit of hits) {
    const sorted = [...hit.members].sort(compareIds);
    for (let i = 0; i < sorted.length; i += 1) {
      for (let j = i + 1; j < sorted.length; j += 1) {
        const a = sorted[i];
        const b = sorted[j];
        if (a !== undefined && b !== undefined) collided.add(`${a}|${b}`);
      }
    }
  }

  const members = [...draft.members].sort(compareIds);
  const effectiveCount = maxIndependentSet(members, collided).length;
  const nominalCount = draft.members.length;
  const fatal = hits.find((h) => h.members.length === draft.members.length) ?? hits[0] ?? null;
  // N+1 needs N+1 INDEPENDENT units: broken when the free set shrinks to
  // claimedN or below (e.g. two PSUs on one PDU ⇒ 2 members collapse to 1).
  const broken = effectiveCount < draft.claimedN + 1;
  return {
    replicas: draft.id,
    nominalCount,
    effectiveCount,
    ok: !broken,
    broken,
    domain: fatal?.type ?? null,
    reason:
      fatal === null
        ? null
        : `${draft.label}: ${fatal.type} correlation on "${fatal.shared}" — ${nominalCount} claimed replicas behave like ${effectiveCount}`,
    hits,
  };
}
