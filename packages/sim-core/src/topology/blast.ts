/**
 * BLAST RADIUS — the hover answer, the ghost-placement answer, the rating
 * answer, the Would-You-Have-Survived answer: ONE algorithm (§4.2).
 *
 * Semantics (WS-2, ratified):
 *  - the flood rides DATA dependencies (what can happen) — it IGNORES
 *    geography entirely: a server in Tokyo that depends on the flooded DB
 *    is affected even though nothing near it moved;
 *  - then it UNIONS the co-location domains (what happens together)
 *    anchored at or reached by the flood: tripping a shared PDU takes every
 *    member, which is how "two redundant services, one circuit" becomes
 *    visible as ONE affected set;
 *  - `affected` = killed outright: the anchor, everything downstream of it
 *    on DATA edges, and every member of a kill-all domain whose ANCHOR is
 *    itself among the dead (tripping the PDU explodes the domain —
 *    this is how "two redundant services, one circuit" reads as ONE set);
 *  - `degraded` = the amber set — co-residents in every shared domain the
 *    flood touches whose anchor did NOT explode: "db is down" cannot prove
 *    the PDU beside it is fine, so its neighbors shade amber;
 *  - `customers` / `mrrMicroUsd` aggregate the affected set's maintained
 *    fields — INSTANT-ANSWER contract: the hover tooltip must never make
 *    the caller walk the graph afterwards.
 *
 * Caching: memoized per (projection version, node). The projection version
 * is the (graph.version, index.version) pair folded into one monotonic-ish
 * stamp (domains.ts `projectionVersion`, T-1) — the flood reads BOTH stores
 * (rack domains come from the physical index), so a placement that never
 * touches the graph still invalidates every radius. The cache is a pure
 * accelerator — results are byte-identical with the cache disabled (the
 * ×100 determinism test exploits precisely this).
 */

import type { EntityId, MoneyUnit } from "../types.ts";
import { asMoney } from "../types.ts";
import type { TopologyGraph } from "./graph.ts";
import { compareIds, dataDescendants, governedBy, trustAnchors } from "./graph.ts";
import type { PhysicalIndex } from "./physical.ts";
import type { DomainSet } from "./domains.ts";
import { buildDomainSet, projectionVersion } from "./domains.ts";

export interface BlastRadius {
  readonly anchor: EntityId;
  /** Killed: anchor + data-dependency flood + members of kill-all domains
   *  whose anchor died. */
  readonly affected: readonly EntityId[];
  /** Amber: co-residents in shared domains the flood touches but that did
   *  not themselves explode. */
  readonly degraded: readonly EntityId[];
  /** Failure-domain ids that contributed, sorted — tooltip reason lines. */
  readonly viaDomains: readonly EntityId[];
  readonly customerCount: number;
  readonly mrrMicroUsd: MoneyUnit;
}

export interface BlastComputer {
  /** Hot path — cached per (projectionVersion(graph, index), node). */
  radiusOf(node: EntityId): BlastRadius;
  /** Exposed for the determinism test: same query with the accelerator off. */
  radiusUncached(node: EntityId): BlastRadius;
  /** Staff blast radius: what breaks if THIS PERSON is hit by a bus. */
  personRadiusOf(person: EntityId): PersonBlast;
  cacheSize(): number;
}

/* ═══════════════════════ Blast radius of a person (§4.2 R) ═══════════════════════ */

export interface PersonBlast {
  readonly person: EntityId;
  /** Runbooks/systems/credentials reached via control edges OUT of the
   *  person (holdings). */
  readonly holdings: readonly EntityId[];
  /** Of those, the ones NO OTHER governor holds — the bus-factor set: if
   *  this person vanishes, these go dark. */
  readonly uniquelyHeld: readonly EntityId[];
  /** |uniquelyHeld| — the bus-factor count the HUD stamps on the avatar. */
  readonly busFactor: number;
  /** Data flood if every uniquelyHeld thing died at once. */
  readonly affected: readonly EntityId[];
  readonly customerCount: number;
  readonly mrrMicroUsd: MoneyUnit;
}

/* ═══════════════════════ Core flood (pure) ═══════════════════════ */

function sumAggregates(graph: TopologyGraph, ids: readonly EntityId[]): { customers: number; mrr: MoneyUnit } {
  let customers = 0;
  let mrr = asMoney(0n);
  for (const id of ids) {
    const node = graph.node(id);
    if (node === null) continue;
    customers += node.customers;
    mrr = asMoney(mrr + node.mrrMicroUsd);
  }
  return { customers, mrr };
}

/** The one true flood, computed fresh. */
export function computeBlast(
  graph: TopologyGraph,
  domains: DomainSet,
  anchor: EntityId,
): BlastRadius {
  if (!graph.hasNode(anchor)) {
    throw new Error(`blast: unknown node "${anchor}" — cannot compute blast radius`);
  }
  // Tier 1: the logical flood — geography-blind dependency closure.
  const killed = new Set<EntityId>([anchor, ...dataDescendants(graph, anchor)]);
  const viaDomains = new Set<EntityId>();

  // Tier 2: a kill-all domain EXPLODES only when its own anchor is among
  // the dead — tripping the PDU takes every member, and every member's
  // dependents chain-kill. A domain whose anchor survived is correlation,
  // not causation, and stays amber (see tier 3).
  let frontier: EntityId[] = [...killed];
  while (frontier.length > 0) {
    const next: EntityId[] = [];
    for (const current of frontier) {
      for (const domain of domains.domainsFor(current)) {
        if (domain.deathModel !== "kill-all") continue;
        if (domain.anchor === null || !killed.has(domain.anchor)) continue;
        viaDomains.add(domain.id);
        for (const member of domain.members) {
          if (killed.has(member)) continue;
          killed.add(member);
          next.push(member);
        }
      }
      // every killed node drags its data dependents into the killed set
      for (const dependent of dataDescendants(graph, current)) {
        if (killed.has(dependent)) continue;
        killed.add(dependent);
        next.push(dependent);
      }
    }
    frontier = next;
  }

  // Tier 3: the amber set — co-residency WITHOUT confirmed causation.
  // Anything sharing an un-exploded domain with the dead: the hover shades
  // them amber, because "you found db down" cannot prove the PDU is fine —
  // everything beside it is suspect.
  const degraded = new Set<EntityId>();
  for (const dead of killed) {
    for (const domain of domains.domainsFor(dead)) {
      if (domain.deathModel === "kill-all" && domain.anchor !== null && killed.has(domain.anchor)) continue;
      viaDomains.add(domain.id);
      for (const member of domain.members) {
        if (!killed.has(member)) degraded.add(member);
      }
    }
  }

  // Amber must never overlap the killed set.
  for (const dead of killed) degraded.delete(dead);

  const affected = [...killed].sort(compareIds);
  const { customers, mrr } = sumAggregates(graph, affected);
  return {
    anchor,
    affected,
    degraded: [...degraded].sort(compareIds),
    viaDomains: [...viaDomains].sort(compareIds),
    customerCount: customers,
    mrrMicroUsd: mrr,
  };
}

/* ═══════════════════════ Person flood ═══════════════════════════ */

/**
 * Holdings = everything the person governs directly (control out-edges).
 * A holding is UNIQUELY held when no other control ancestor of the target
 * (other than this person) governs it — the runbook nobody else has read,
 * the root credential nobody else carries.
 */
export function computePersonBlast(graph: TopologyGraph, person: EntityId): PersonBlast {
  if (!graph.hasNode(person)) {
    throw new Error(`blast: unknown person node "${person}" — register it in the graph first`);
  }
  const holdings = governedBy(graph, person);
  const uniquelyHeld: EntityId[] = [];
  for (const holding of holdings) {
    const governors = graph.inEdges(holding, "control");
    const otherHolders = governors.filter((e) => e.from !== person);
    if (otherHolders.length === 0) uniquelyHeld.push(holding);
  }
  uniquelyHeld.sort(compareIds);

  // If the person is hit: everything they uniquely hold goes dark at once.
  const killed = new Set<EntityId>(uniquelyHeld);
  for (const dark of uniquelyHeld) {
    for (const dependent of dataDescendants(graph, dark)) killed.add(dependent);
  }
  // Their trust anchors matter too — a lost CA key is a dead authority.
  for (const anchor of trustAnchors(graph, person)) {
    if (!graph.hasNode(anchor)) continue;
    killed.add(anchor);
    for (const dependent of dataDescendants(graph, anchor)) killed.add(dependent);
  }
  const affected = [...killed].sort(compareIds);
  const { customers, mrr } = sumAggregates(graph, affected);
  return {
    person,
    holdings,
    uniquelyHeld,
    busFactor: uniquelyHeld.length,
    affected,
    customerCount: customers,
    mrrMicroUsd: mrr,
  };
}

/* ═══════════════════════ Cached computer ═══════════════════════════ */

export function createBlastComputer(graph: TopologyGraph, index: PhysicalIndex): BlastComputer {
  /**
   * projection version → node → radius. Old versions simply stop being read.
   * T-1: the key is the (graph.version, index.version) stamp, NOT
   * graph.version — a placeDevice bumps only the index, and the rack domains
   * it creates must invalidate the cached radii they now appear in.
   */
  const radiusCache = new Map<number, Map<EntityId, BlastRadius>>();
  /** Person blast reads the graph alone — graph.version is its full truth. */
  const personCache = new Map<number, Map<EntityId, PersonBlast>>();

  function domainsAt(): DomainSet {
    return buildDomainSet(graph, index);
  }

  function bucketFor<T>(cache: Map<number, Map<EntityId, T>>, at: number): Map<EntityId, T> {
    const atVersion = cache.get(at);
    if (atVersion !== undefined) return atVersion;
    const fresh = new Map<EntityId, T>();
    cache.set(at, fresh);
    // keep memory bounded: drop every key that is not the current one
    for (const stale of [...cache.keys()]) {
      if (stale !== at) cache.delete(stale);
    }
    return fresh;
  }

  return {
    radiusOf(node: EntityId): BlastRadius {
      const bucket = bucketFor(radiusCache, projectionVersion(graph, index));
      const hit = bucket.get(node);
      if (hit !== undefined) return hit;
      const computed = computeBlast(graph, domainsAt(), node);
      bucket.set(node, computed);
      return computed;
    },

    radiusUncached(node: EntityId): BlastRadius {
      return computeBlast(graph, domainsAt(), node);
    },

    personRadiusOf(person: EntityId): PersonBlast {
      const bucket = bucketFor(personCache, graph.version);
      const hit = bucket.get(person);
      if (hit !== undefined) return hit;
      const computed = computePersonBlast(graph, person);
      bucket.set(person, computed);
      return computed;
    },

    cacheSize(): number {
      let total = 0;
      for (const bucket of radiusCache.values()) total += bucket.size;
      for (const bucket of personCache.values()) total += bucket.size;
      return total;
    },
  };
}
