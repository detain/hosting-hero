/**
 * LineageGraph — THE LONG SAVE as a company LINEAGE TREE (ratified R-3,
 * MASTER_REPORT §4.6 thesis 1 + Appendix C §2.5 "forking for prestige").
 *
 * The doc's "ONE Company object" is satisfied in STORAGE terms (one save,
 * one root, one graph), while exits / prestige / failure-restarts become
 * GENERATIONAL EDGES, never overwrites:
 *
 *   SaveFile ──▶ LineageGraph ──▶ CompanyNode vertices + InheritanceEdge edges
 *
 * Inheritance edges carry a MANIFEST, and the manifest is EXACT by law
 * (Appendix C §2.5 tail): a prestige/exit child receives
 *   - EXACTLY 3 kept tech nodes (the parent's unlocked set supplies them),
 *   - EXACTLY 1 doctrine entry,
 *   - ONLY carried Playbook slots (≤ PLAYBOOK_CARRY_CAP).
 * Anything else — cash, customers, scars, rep — is NEVER inherited silently;
 * the manifest's shape IS the rule (make-illegal-states-unrepresentable).
 *
 * FAILURE-RESTART edges (D12 "failure is a chapter, not a reload", L17
 * "Failure Is Narrated") additionally preserve the parent's MUSEUM: nothing
 * is destroyed — the parent is retired in place, its museum registry rides
 * the graph forever ("no destroy" law).
 *
 * All ops are pure: same inputs → new graph, zero hidden mutation (Law 3).
 */

import type { EntityId } from "../types.ts";
import { asEntityId, asMoney } from "../types.ts";
import { fail, requireDefined } from "./errors.ts";
import type { CompanyNode, DoctrineEntry, PlaybookSlotRecord } from "./node.ts";
import { newCompanyNode, NAMED_CUSTOMER_CAP, parseCompanyNode, parseDoctrine, parsePlaybookSlot, PLAYBOOK_CARRY_CAP } from "./node.ts";

/* ═══════════════════════ graph shape ═══════════════════════ */

export interface InheritanceManifest {
  /** EXACTLY 3 parent-unlocked tech nodes the child starts with (§2.5). */
  readonly keptNodes: readonly [EntityId, EntityId, EntityId];
  /** EXACTLY 1 doctrine (U27): the parent's current belief, inherited whole. */
  readonly doctrine: DoctrineEntry;
  /** Carried runbook slots only (L3: "8 slots at Assisted-or-better"). */
  readonly playbook: readonly PlaybookSlotRecord[];
  /** T7 "carry-over-but-thin": capped cash slice as an explicit number —
   *  present only when the edge type allows it; `null` = inherits no cash. */
  readonly cashSliceMicroUsd: bigint | null;
  /** D12: failure-restart carries "one small permanent unlock" — a node id
   *  granted outside the kept-3 set, tracked separately for provenance. */
  readonly failureOnlyUnlock: EntityId | null;
  /** §1.6: kept nodes render "in the previous company's handwriting". */
  readonly handwritingParent: EntityId;
}

export interface InheritanceEdge {
  readonly parentId: EntityId;
  readonly childId: EntityId;
  /** Which succession produced this edge (Appendix C succession types). */
  readonly type: "exit" | "failure_restart" | "npc_pivot";
  readonly manifest: InheritanceManifest;
  /** Museum-preservation proof: parent exhibit ids that survived the edge. */
  readonly preservedMuseumExhibitIds: readonly EntityId[];
}

export interface LineageGraph {
  /** Root "found" node(s): every node traces to one via parentId. */
  readonly roots: readonly EntityId[];
  readonly nodes: ReadonlyMap<EntityId, CompanyNode>;
  readonly edges: readonly InheritanceEdge[];
}

/* ═══════════════════════ construction (pure) ═══════════════════════ */

export function emptyLineageGraph(): LineageGraph {
  return { roots: [], nodes: new Map(), edges: [] };
}

export interface FoundOptions {
  readonly id: string;
  readonly name: string;
  readonly eraOrigin: string;
  readonly foundedAtTick: bigint;
}

/** Genesis: a founder node with no parent. Fails loud if the id exists. */
export function foundCompany(graph: LineageGraph, options: FoundOptions): { graph: LineageGraph; node: CompanyNode } {
  const id = asEntityId(options.id);
  if (graph.nodes.has(id)) fail(`foundCompany: node "${options.id}" already exists`);
  const node = newCompanyNode({
    id: options.id,
    parentId: null,
    name: options.name,
    eraOrigin: options.eraOrigin,
    foundedAtTick: options.foundedAtTick,
    successionType: "found",
  });
  return {
    graph: {
      roots: [...graph.roots, id],
      nodes: new Map(graph.nodes).set(id, node),
      edges: graph.edges,
    },
    node,
  };
}

export interface SpawnChildOptions {
  readonly childId: string;
  readonly name: string;
  /** Defaults to the parent's era — a child founded later may re-origin elsewhere. */
  readonly eraOrigin?: string;
  readonly foundedAtTick: bigint;
  readonly manifest: InheritanceManifest;
  readonly succession: "exit" | "failure_restart" | "npc_pivot";
}

/**
 * THE prestige/exit/failure edge. Validates the manifest EXACTLY (3+1+slots,
 * Law 4), materializes the child node seeded from the manifest, retires the
 * parent in place (status "retired"; museum untouched → preserved exhibit ids
 * recorded on the edge as proof), and refuses any write that would destroy
 * history.
 */
export function spawnChildFromParent(
  graph: LineageGraph,
  parentId: EntityId,
  options: SpawnChildOptions,
): { graph: LineageGraph; child: CompanyNode; edge: InheritanceEdge } {
  const parent = requireDefined(graph.nodes.get(parentId), `spawnChildFromParent: parent "${parentId}" not in graph`);
  const childId = asEntityId(options.childId);
  if (graph.nodes.has(childId)) fail(`spawnChildFromParent: child "${options.childId}" already exists`);
  if (options.foundedAtTick < parent.identity.foundedAtTick) {
    fail(`spawnChildFromParent: foundedAtTick precedes parent founding`);
  }
  validateManifest(parent, options.manifest, options.succession);

  const manifest = options.manifest;
  const keptUnlocks = manifest.keptNodes.map((nodeId) => {
    const source = parent.nodesUnlocked.find((u) => u.node === nodeId);
    return {
      node: nodeId,
      via: source?.via ?? "acquisition",
      scarRef: source?.scarRef ?? null,
      incidentRef: source?.incidentRef ?? null,
      stamp: source?.stamp ?? null,
      stampAtTick: source?.stampAtTick ?? null,
      // §1.6: inherited nodes carry the PARENT's handwriting on them.
      handwritingOwnerStaffId: manifest.handwritingParent === parentId ? (source?.handwritingOwnerStaffId ?? null) : manifest.handwritingParent,
      faded: source?.faded ?? 0,
    };
  });

  const child = newCompanyNode({
    id: options.childId,
    parentId,
    name: options.name,
    eraOrigin: options.eraOrigin ?? parent.identity.eraOrigin,
    foundedAtTick: options.foundedAtTick,
    successionType: options.succession,
  });
  const childSeeded: CompanyNode = {
    ...child,
    nodesUnlocked: keptUnlocks,
    doctrine: { perAct: [], current: manifest.doctrine },
    playbook: manifest.playbook,
    // D12: failure is a CHAPTER — one unlock arrives outside the kept-3 set.
    ...(manifest.failureOnlyUnlock === null
      ? {}
      : {
          nodesUnlocked: [
            ...keptUnlocks,
            {
              node: manifest.failureOnlyUnlock,
              via: "milestone" as const,
              scarRef: null,
              incidentRef: null,
              stamp: null,
              stampAtTick: null,
              handwritingOwnerStaffId: null,
              faded: 0,
            },
          ],
        }),
    // Museum NEVER dies: children inherit nothing from the parent museum,
    // the parent keeps every exhibit on the graph (verified below).
  };

  const retiredParent: CompanyNode = {
    ...parent,
    identity: { ...parent.identity, status: "retired" },
  };

  const edge: InheritanceEdge = {
    parentId,
    childId,
    type: options.succession,
    manifest,
    preservedMuseumExhibitIds: parent.museum.map((e) => e.id),
  };

  const nodes = new Map(graph.nodes);
  nodes.set(parentId, retiredParent);
  nodes.set(childId, childSeeded);

  return {
    graph: { roots: graph.roots, nodes, edges: [...graph.edges, edge] },
    child: childSeeded,
    edge,
  };
}

/* ═══════════════════════ manifest exactness (the law lives here) ═══════════════════════ */

function validateManifest(parent: CompanyNode, manifest: InheritanceManifest, succession: string): void {
  // Law: EXACTLY three kept nodes — a tech tree you unlock by living through
  // things is a memoir, and a memoir carries three chapters, not two, not four.
  if (manifest.keptNodes.length !== 3) {
    fail(`inheritance manifest: expected exactly 3 kept nodes, got ${manifest.keptNodes.length} (${succession})`);
  }
  const [a, b, c] = manifest.keptNodes;
  if (a === b || b === c || a === c) fail("inheritance manifest: kept nodes must be distinct");

  const unlocked = new Set(parent.nodesUnlocked.map((u) => u.node));
  for (const nodeId of manifest.keptNodes) {
    if (!unlocked.has(nodeId)) fail(`inheritance manifest: kept node "${nodeId}" was never unlocked by the parent`);
  }

  // Law: exactly ONE doctrine — U27 beliefs don't fork, they pass on.
  if (manifest.doctrine.id.length === 0) fail("inheritance manifest: doctrine entry required (exactly one)");

  // Law: playbook slots are the ONLY other carrier; caps enforced (L3/PLAYBOOK_CARRY_CAP).
  if (manifest.playbook.length > PLAYBOOK_CARRY_CAP) {
    fail(`inheritance manifest: ${manifest.playbook.length} playbook slots exceeds carry cap ${PLAYBOOK_CARRY_CAP}`);
  }
  for (const slot of manifest.playbook) {
    if (!slot.carried) fail(`inheritance manifest: playbook slot "${slot.runbookId}" is not marked carried`);
  }

  if (manifest.handwritingParent !== parent.id) {
    fail(`inheritance manifest: handwritingParent "${manifest.handwritingParent}" must be the edge's parent "${parent.id}"`);
  }

  // Failure-only unlock must NOT duplicate the kept-3 (it is the EXTRA gift).
  if (manifest.failureOnlyUnlock !== null && manifest.keptNodes.includes(manifest.failureOnlyUnlock)) {
    fail(`inheritance manifest: failure-only unlock "${manifest.failureOnlyUnlock}" collides with kept nodes`);
  }
  if (succession !== "failure_restart" && manifest.failureOnlyUnlock !== null) {
    fail("inheritance manifest: failure-only unlocks ride failure_restart edges only (D12)");
  }
  if (succession !== "exit" && manifest.cashSliceMicroUsd !== null) {
    fail("inheritance manifest: cash slices cross exit edges only — failure is poorer, not paid (D12/T8)");
  }
}

/* ═══════════════════════ cash-slice application (round-2 S-14) ═══════════════════════ */

/**
 * THE seam campaign bootstrapping MUST call when a child's first run begins:
 * materializes the manifest's T7 "carry-over-but-thin" capped cash slice into
 * the child's `finances.cashMicroUsd`. spawnChildFromParent deliberately does
 * NOT apply it — the edge RECORDS the manifest, bootstrapping SPENDS it — so
 * an un-bootstrapped child provably starts on zero inherited cash.
 *
 * present-on-exit-only law (D12/T8): a non-null slice may only land on a child
 * born of an "exit" edge (failure is poorer, not paid), and the slice must be
 * ≥ 0 (debts ride the debt rail, never negative cash). A null slice on an
 * exit edge is the explicit "inherits nothing" and pins cash to 0.
 *
 * Pure: returns a NEW node, input untouched (Law 3). Mode-level cash CAPS
 * remain the write-matrix's job — this applies the amount, never adjudicates
 * the mode's ceiling.
 */
export function applyInheritanceManifest(childNode: CompanyNode, manifest: InheritanceManifest): CompanyNode {
  if (childNode.succession.type === "found") {
    fail(`applyInheritanceManifest: "${childNode.id}" is a founder — founders have no inheritance manifest to apply`);
  }
  if (childNode.succession.type !== "exit" && manifest.cashSliceMicroUsd !== null) {
    fail(
      `applyInheritanceManifest: cash slices cross exit edges only — child "${childNode.id}" was born of a ${childNode.succession.type} edge (D12/T8)`,
    );
  }
  const slice = manifest.cashSliceMicroUsd ?? 0n;
  if (slice < 0n) fail(`applyInheritanceManifest: cash slice ${slice} is negative — debts ride the debt rail, not cash`);
  return { ...childNode, finances: { ...childNode.finances, cashMicroUsd: asMoney(slice) } };
}

/* ═══════════════════════ wire parse (boundary, used by envelope) ═══════════════════════ */

type Dict = Record<string, unknown>;

function asDictWire(value: unknown, where: string): Dict {
  if (typeof value !== "object" || value === null || Array.isArray(value)) fail(`${where}: expected object`);
  return value as Dict;
}

function asArrWire(value: unknown, where: string): unknown[] {
  if (!Array.isArray(value)) fail(`${where}: expected array`);
  return value;
}

function asStrWire(value: unknown, where: string): string {
  if (typeof value !== "string") fail(`${where}: expected string`);
  return value;
}

function asBigWire(value: unknown, where: string): bigint {
  if (typeof value !== "bigint") fail(`${where}: expected bigint (decode with fromCanonicalJson)`);
  return value;
}

export function parseInheritanceEdge(value: unknown, where = "edge"): InheritanceEdge {
  const d = asDictWire(value, where);
  const manifestRaw = asDictWire(requireDefined(d.manifest, `${where}.manifest`), `${where}.manifest`);
  const keptRaw = asArrWire(manifestRaw.keptNodes, `${where}.manifest.keptNodes`);
  if (keptRaw.length !== 3) fail(`${where}.manifest.keptNodes: expected exactly 3, got ${keptRaw.length} (the 3-node law)`);
  const keptNodes: [EntityId, EntityId, EntityId] = [
    asEntityId(asStrWire(keptRaw[0], `${where}.manifest.keptNodes[0]`)),
    asEntityId(asStrWire(keptRaw[1], `${where}.manifest.keptNodes[1]`)),
    asEntityId(asStrWire(keptRaw[2], `${where}.manifest.keptNodes[2]`)),
  ];
  const cashRaw = manifestRaw.cashSliceMicroUsd;
  const unlockRaw = manifestRaw.failureOnlyUnlock;
  return {
    parentId: asEntityId(asStrWire(requireDefined(d.parentId, `${where}.parentId`), `${where}.parentId`)),
    childId: asEntityId(asStrWire(requireDefined(d.childId, `${where}.childId`), `${where}.childId`)),
    type: asEdgeType(d.type, `${where}.type`),
    manifest: {
      keptNodes,
      doctrine: parseDoctrine(requireDefined(manifestRaw.doctrine, `${where}.manifest.doctrine`), `${where}.manifest.doctrine`),
      playbook: asArrWire(manifestRaw.playbook, `${where}.manifest.playbook`).map((p, i) => parsePlaybookSlot(p, `${where}.manifest.playbook[${i}]`)),
      cashSliceMicroUsd: cashRaw === null || cashRaw === undefined ? null : asBigWire(cashRaw, `${where}.manifest.cashSliceMicroUsd`),
      failureOnlyUnlock: unlockRaw === null || unlockRaw === undefined ? null : asEntityId(asStrWire(unlockRaw, `${where}.manifest.failureOnlyUnlock`)),
      handwritingParent: asEntityId(asStrWire(requireDefined(manifestRaw.handwritingParent, `${where}.manifest.handwritingParent`), `${where}.manifest.handwritingParent`)),
    },
    preservedMuseumExhibitIds: asArrWire(d.preservedMuseumExhibitIds ?? [], `${where}.preservedMuseumExhibitIds`).map((x, i) => asEntityId(asStrWire(x, `${where}.preservedMuseumExhibitIds[${i}]`))),
  };
}

function asEdgeType(value: unknown, where: string): InheritanceEdge["type"] {
  const s = asStrWire(value, where);
  if (s !== "exit" && s !== "failure_restart" && s !== "npc_pivot") fail(`${where}: "${s}" is not an inheritance edge type`);
  return s;
}

/** Parse the `{roots, nodes[], edges[]}` wire shape into a validated graph. */
export function parseLineageWireGraph(value: unknown, where = "lineage"): LineageGraph {
  const d = asDictWire(value, where);
  const nodes = new Map<EntityId, CompanyNode>();
  for (const [i, raw] of asArrWire(d.nodes, `${where}.nodes`).entries()) {
    const node = parseCompanyNode(raw, `${where}.nodes[${i}]`);
    if (nodes.has(node.id)) fail(`${where}.nodes[${i}]: duplicate node id "${node.id}"`);
    nodes.set(node.id, node);
  }
  const edges = asArrWire(d.edges, `${where}.edges`).map((raw, i) => parseInheritanceEdge(raw, `${where}.edges[${i}]`));
  const roots = asArrWire(d.roots, `${where}.roots`).map((r, i) => asEntityId(asStrWire(r, `${where}.roots[${i}]`)));
  const graph: LineageGraph = { roots, nodes, edges };
  assertLineageIntegrity(graph);
  return graph;
}

/* ═══════════════════════ queries (read side of the tree) ═══════════════════════ */

export function getNode(graph: LineageGraph, id: EntityId): CompanyNode {
  return requireDefined(graph.nodes.get(id), `getNode: "${id}" not in lineage`);
}

export function childrenOf(graph: LineageGraph, id: EntityId): readonly CompanyNode[] {
  return graph.edges.filter((e) => e.parentId === id).map((e) => requireDefined(graph.nodes.get(e.childId), `childrenOf: missing child "${e.childId}"`));
}

/** Root → node chain (generation 0 first). Fails loud on orphans/cycles. */
export function ancestryChain(graph: LineageGraph, id: EntityId): readonly CompanyNode[] {
  const chain: CompanyNode[] = [];
  const visiting = new Set<EntityId>();
  let cursor: EntityId = id;
  for (;;) {
    if (visiting.has(cursor)) fail(`ancestryChain: cycle at "${cursor}"`);
    visiting.add(cursor);
    const node = requireDefined(graph.nodes.get(cursor), `ancestryChain: missing node "${cursor}"`);
    chain.unshift(node);
    if (node.parentId === null) {
      if (!graph.roots.includes(cursor)) fail(`ancestryChain: "${cursor}" has no parent but is not a root`);
      return chain;
    }
    cursor = node.parentId;
  }
}

export interface NodeFilter {
  readonly era?: string;
  readonly minTierReached?: number;
  readonly rootOf?: EntityId;
  readonly status?: CompanyNode["identity"]["status"];
}

/** Query by era / tier reached / line (root). All clauses AND together. */
export function queryNodes(graph: LineageGraph, filter: NodeFilter): readonly CompanyNode[] {
  const results: CompanyNode[] = [];
  for (const node of graph.nodes.values()) {
    if (filter.era !== undefined && node.identity.eraOrigin !== filter.era) continue;
    if (filter.minTierReached !== undefined && node.tierReached < filter.minTierReached) continue;
    if (filter.status !== undefined && node.identity.status !== filter.status) continue;
    if (filter.rootOf !== undefined) {
      const root = requireDefined(ancestryChain(graph, node.id)[0], "queryNodes: empty ancestry chain");
      if (root.id !== filter.rootOf) continue;
    }
    results.push(node);
  }
  // Stable order regardless of Map insertion (Law 3 predictability).
  return results.sort((x, y) => (x.id < y.id ? -1 : x.id > y.id ? 1 : 0));
}

/** Lineage depth of a node (root = generation 0). */
export function generationOf(graph: LineageGraph, id: EntityId): number {
  return ancestryChain(graph, id).length - 1;
}

/** Total museum exhibits across the whole lineage — the "no destroy" audit:
 *  this count may only ever GROW as edges are added. */
export function countMuseumExhibits(graph: LineageGraph): number {
  let total = 0;
  for (const node of graph.nodes.values()) total += node.museum.length;
  return total;
}

/** Re-validate a decoded graph's integrity (edges↔parentIds, uniqueness,
 *  caps). Called from the envelope parser at the boundary (Law 2). */
export function assertLineageIntegrity(graph: LineageGraph): void {
  // S-13: roots ⊆ node set — a declared root with no vertex is a ghost
  // genealogy: every ancestry walk from it would die on a missing node.
  for (const root of graph.roots) {
    if (!graph.nodes.has(root)) fail(`assertLineageIntegrity: ghost root "${root}" is not in the node set (roots ⊆ nodes)`);
  }
  for (const node of graph.nodes.values()) {
    if (node.customerBooks.length > NAMED_CUSTOMER_CAP) {
      fail(`assertLineageIntegrity: node "${node.id}" exceeds named-customer cap`);
    }
    if (node.parentId === null) {
      if (!graph.roots.includes(node.id)) fail(`assertLineageIntegrity: orphan root "${node.id}"`);
      continue;
    }
    const parent = graph.nodes.get(node.parentId);
    if (parent === undefined) fail(`assertLineageIntegrity: node "${node.id}" references missing parent "${node.parentId}"`);
    const edge = graph.edges.find((e) => e.childId === node.id);
    if (edge === undefined) fail(`assertLineageIntegrity: no inheritance edge for child "${node.id}"`);
    if (edge.parentId !== node.parentId) fail(`assertLineageIntegrity: edge/parentId mismatch at "${node.id}"`);
  }
  for (const edge of graph.edges) {
    if (!graph.nodes.has(edge.parentId)) fail(`assertLineageIntegrity: edge from missing parent "${edge.parentId}"`);
    if (!graph.nodes.has(edge.childId)) fail(`assertLineageIntegrity: edge to missing child "${edge.childId}"`);
    if (edge.manifest.keptNodes.length !== 3) fail(`assertLineageIntegrity: edge →"${edge.childId}" violates the 3-node law`);
  }
}
