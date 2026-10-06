/**
 * LINK OBJECTS — first-class things (§7.2 R34): a cable is not an edge
 * annotation, it is a hoverable, pinnable node-adjacent record with its own
 * telemetry. Carried here as a side table keyed by DATA edge id — the graph
 * stays the topology authority, the link table says how that wire actually
 * behaves.
 *
 *  - bandwidth / negotiated speed: a 25G optic in a 10G port RUNS AT 10G
 *    silently in real life; in the game the silent downgrade is a flagged
 *    finding (§7.2 "SILENT NEGOTIATE-DOWN made visible"). Speeds are whole
 *    Mbps integers (10G = 10_000).
 *  - policy beads (§7.2, eight shapes): the closed enum below is the bead
 *    alphabet — tls / rateLimit(valve) / breaker(fuse) / timeout / pool /
 *    retry / firewall(gate) / egress. A link's list is ordered (beads string
 *    along the wire); duplicates are illegal states.
 *  - timeout monotonicity law: a request's remaining budget must SHRINK at
 *    every hop — a caller whose timeout is not strictly larger than the
 *    callee's plus its own slice is lying to itself. `findTimeoutViolations`
 *    walks data paths and returns every edge where the budget discipline
 *    breaks (the classic: web→db timeout < web→api→db total — the edge>db
 *    violation in the test plan).
 */

import type { EntityId, SimTimeUs } from "../types.ts";
import { compareIds } from "./graph.ts";
import type { EdgeId, TopologyGraph } from "./graph.ts";

/* ═══════════════════════════ Policy beads ═══════════════════════════ */

/** The eight bead shapes, named by behavior not icon (§7.2). */
export const POLICY_BEADS = [
  "tls", // padlock: encryption required on this wire
  "rateLimit", // valve: token bucket in front of the callee
  "breaker", // fuse: open the circuit on sustained failure
  "timeout", // hourglass: hard per-hop budget clamp
  "pool", // rings: bounded connection pool
  "retry", // loop: automatic re-issue (feeds retry storms)
  "firewall", // gate: L3/L4 allow-list
  "egress", // arrow-out: outbound-only / no response path assumed
] as const;

export type PolicyBead = (typeof POLICY_BEADS)[number];

export function isPolicyBead(value: string): value is PolicyBead {
  return (POLICY_BEADS as readonly string[]).includes(value);
}

/* ═══════════════════════════ Link records ═══════════════════════════ */

export interface LinkDraft {
  /** The DATA edge this link objectifies. */
  readonly edge: EdgeId;
  /** Port speed the wire is BUILT for, Mbps (10_000 = 10G). */
  readonly ratedMbps: number;
  /** Speed the two ends actually agreed, Mbps; null until telemetry says. */
  readonly negotiatedMbps: number | null;
  /** One-way propagation at rest, integer µs. */
  readonly latencyUs: SimTimeUs;
  /** Beads strung on this wire, in traversal order. */
  readonly beads: readonly string[];
  /** Per-hop timeout this wire clamps to, µs; null = no hourglass bead. */
  readonly timeoutUs: SimTimeUs | null;
  /** Contract-routing tags painted on the link (§7.2 R37). */
  readonly tags: readonly string[];
}

export interface LinkRecord extends LinkDraft {
  readonly id: EdgeId;
}

function requirePositiveInt(value: number, what: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`link: ${what} must be a positive safe integer (Mbps whole numbers), got ${value}`);
  }
}

/** Boundary parse (Law 2): unknown bead names and duplicates die here. */
export function parseLink(draft: LinkDraft): LinkRecord {
  requirePositiveInt(draft.ratedMbps, "ratedMbps");
  if (draft.negotiatedMbps !== null) requirePositiveInt(draft.negotiatedMbps, "negotiatedMbps");
  if (draft.latencyUs < 0n) throw new Error(`link ${draft.edge}: negative latency ${draft.latencyUs}µs`);
  if (draft.timeoutUs !== null && draft.timeoutUs <= 0n) {
    throw new Error(`link ${draft.edge}: timeoutUs must be > 0 when present, got ${draft.timeoutUs}`);
  }
  const seen = new Set<string>();
  for (const bead of draft.beads) {
    if (!isPolicyBead(bead)) {
      throw new Error(
        `link ${draft.edge}: unknown policy bead "${bead}" — the alphabet is ${POLICY_BEADS.join("/")}`,
      );
    }
    if (seen.has(bead)) throw new Error(`link ${draft.edge}: duplicate bead "${bead}" — string it once`);
    seen.add(bead);
  }
  return { id: draft.edge, ...draft };
}

/* ═══════════════════════════ Downgrade detection ═══════════════════════════ */

export interface SpeedFinding {
  readonly link: EdgeId;
  readonly ratedMbps: number;
  readonly negotiatedMbps: number;
  /** rated − negotiated, Mbps — the silent tax being paid. */
  readonly lossMbps: number;
}

/** null negotiated = no telemetry yet, NOT a finding (yet). */
export function negotiateDown(link: LinkRecord): SpeedFinding | null {
  if (link.negotiatedMbps === null) return null;
  if (link.negotiatedMbps >= link.ratedMbps) return null;
  return {
    link: link.id,
    ratedMbps: link.ratedMbps,
    negotiatedMbps: link.negotiatedMbps,
    lossMbps: link.ratedMbps - link.negotiatedMbps,
  };
}

/* ═══════════════════════════ Timeout monotonicity ═══════════════════════════ */

/**
 * The law (visualized as a shrinking budget bar per hop): for every DIRECT
 * data dependency pair caller→callee whose link carries an explicit timeout,
 * the caller's wire must allow strictly MORE time than the callee's next
 * wire down — otherwise a response that arrives "in time" downstream has
 * already been abandoned upstream, and the retry loop the caller fires
 * doubles the callee's load exactly when it is slowest.
 *
 * Concretely, for chain A → B → C: violation when
 *   timeout(A→B) ≤ latency(A→B) + timeout(B→C) + latency(B→C)
 * i.e. B's own budget does not fit inside what A granted B. Hops without an
 * explicit timeout clamp are skipped (the caller owns that discipline).
 *
 * Deterministic output: sorted by (upstream edge, downstream edge).
 */
export interface TimeoutViolation {
  /** The too-tight upstream wire (the liar). */
  readonly outer: EdgeId;
  /** The downstream wire whose budget does not fit (the victim). */
  readonly inner: EdgeId;
  readonly outerTimeoutUs: SimTimeUs;
  /** What the outer wire would need: inner budget + inner latency + 1µs. */
  readonly requiredOuterUs: SimTimeUs;
}

export function findTimeoutViolations(graph: TopologyGraph, links: readonly LinkRecord[]): readonly TimeoutViolation[] {
  const byEdge = new Map<EdgeId, LinkRecord>();
  for (const link of links) byEdge.set(link.id, link);
  const violations: TimeoutViolation[] = [];
  for (const edge of graph.edgesOfKind("data")) {
    const outer = byEdge.get(edge.id);
    if (outer === undefined || outer.timeoutUs === null) continue;
    // walk the DATA out-edge of the callee: A→B is `edge`, B→C is one hop on
    const callee = edge.to;
    for (const nextEdge of graph.outEdges(callee, "data")) {
      const inner = byEdge.get(nextEdge.id);
      if (inner === undefined || inner.timeoutUs === null) continue;
      const needed = inner.timeoutUs + inner.latencyUs + 1n;
      if (outer.timeoutUs >= needed) continue;
      violations.push({
        outer: outer.id,
        inner: inner.id,
        outerTimeoutUs: outer.timeoutUs,
        requiredOuterUs: needed,
      });
    }
  }
  return violations.sort(
    (a, b) => compareIds(a.outer, b.outer) || compareIds(a.inner, b.inner),
  );
}

/* ═══════════════════════════ Link side-table ═══════════════════════════ */

export interface LinkRegistry {
  readonly version: number;
  attach(draft: LinkDraft): LinkRecord;
  detach(edge: EdgeId): void;
  of(edge: EdgeId): LinkRecord | null;
  all(): readonly LinkRecord[];
  /** Every link currently running under-rated, sorted by link id. */
  downgrades(): readonly SpeedFinding[];
}

export function createLinkRegistry(): LinkRegistry {
  const links = new Map<EdgeId, LinkRecord>();
  let version = 0;

  function allSorted(): readonly LinkRecord[] {
    return [...links.values()].sort((a, b) => compareIds(a.id, b.id));
  }

  return {
    get version(): number {
      return version;
    },
    attach(draft: LinkDraft): LinkRecord {
      if (links.has(draft.edge)) throw new Error(`links: edge "${draft.edge}" already has a link object`);
      const parsed = parseLink(draft);
      links.set(parsed.id, parsed);
      version += 1;
      return parsed;
    },
    detach(edge: EdgeId): void {
      if (!links.delete(edge)) throw new Error(`links: no link object on edge "${edge}"`);
      version += 1;
    },
    of: (edge: EntityId) => links.get(edge) ?? null,
    all: allSorted,
    downgrades(): readonly SpeedFinding[] {
      const findings: SpeedFinding[] = [];
      for (const link of allSorted()) {
        const finding = negotiateDown(link);
        if (finding !== null) findings.push(finding);
      }
      return findings;
    },
  };
}
