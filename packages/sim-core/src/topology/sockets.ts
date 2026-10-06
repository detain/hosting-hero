/**
 * TYPED SOCKETS — the needs/provides compatibility matrix (§7.2 R26–R33:
 * "no free port · wrong speed · different VLAN · crosses trust boundary ·
 * not in contract" is the plug-refusal vocabulary; this file owns the FIRST
 * gate: does the plug even fit?).
 *
 * A service declares NEEDS ("I am a consumer of http-in, db-out, …") and
 * PROVIDES ("I answer http-in"). A cable may be drawn consumer→provider
 * only when the provider's socket KIND matches the consumer's expected
 * kind AND the direction convention holds: `out` sockets are what a thing
 * SPEAKS (client side), `in` sockets are what it LISTENS (server side).
 * A data edge from A to B (A depends on B) is legal iff
 *   some needs of A is the MIRROR of some provides of B, where
 *   mirror("db-out") = "db-in"  — the protocol stem meets at the plug.
 *
 * Closed vocabulary BY DEFAULT (T-7 alignment): the grammar of the check —
 * `<stem>-<in|out>`, mirror-meeting at the plug — never changes, but the
 * STEM LIST does take a caller-declared opening: every gate function here
 * accepts an optional `declared` protocol list (default `SOCKET_PROTOCOLS`).
 * Bundle data may extend the stems that way, never the grammar. The matrix
 * is data, not code — auto-validation in the editor/ghost-placement reads
 * `socketCompatibility`.
 */

import { compareIds } from "./graph.ts";
import type { EntityId } from "../types.ts";

/** Protocol stems the bundles use. Default closed set; the `declared`
 *  parameter on every check below opens it to authored extensions. */
export const SOCKET_PROTOCOLS = ["http", "sql", "ssh", "dns", "smtp", "ntp", "tcp", "rdma"] as const;
export type SocketProtocol = (typeof SOCKET_PROTOCOLS)[number];

export type SocketDirection = "in" | "out";

/** A socket name is `<protocol>-<direction>`: "http-in" listens, "sql-out"
 *  dials. Parsed at the boundary — strings that don't fit die loud. */
export interface Socket {
  readonly protocol: SocketProtocol;
  readonly direction: SocketDirection;
}

export function parseSocket(name: string, declared: readonly string[] = SOCKET_PROTOCOLS): Socket {
  const dash = name.lastIndexOf("-");
  const stem = dash > 0 ? name.slice(0, dash) : "";
  const direction = dash > 0 ? name.slice(dash + 1) : "";
  if (!declared.includes(stem) || (direction !== "in" && direction !== "out")) {
    throw new Error(
      `sockets: "${name}" is not a typed socket — grammar is <protocol>-<direction>, protocols: ${declared.join("/")}`,
    );
  }
  return { protocol: stem as SocketProtocol, direction };
}

export function socketName(socket: Socket): string {
  return `${socket.protocol}-${socket.direction}`;
}

/** The plug half of a pair: an `out` dialer meets an `in` listener.
 *  THROWS on an undeclared stem — batch callers must catch and report
 *  (see validateConnections), single-shot ghost checks may let it fly. */
export function mirror(name: string, declared: readonly string[] = SOCKET_PROTOCOLS): string {
  const socket = parseSocket(name, declared);
  return socketName({ protocol: socket.protocol, direction: socket.direction === "out" ? "in" : "out" });
}

/** Can a wire carry `needs` (consumer side) to `provides` (server side)? */
export function socketsFit(
  needs: readonly string[],
  provides: readonly string[],
  declared: readonly string[] = SOCKET_PROTOCOLS,
): boolean {
  const provided = new Set(provides);
  for (const need of needs) {
    if (provided.has(mirror(need, declared))) return true;
  }
  return false;
}

/**
 * Compatibility matrix: for every pair (needsName, providesName) in the
 * closed vocabulary, does the plug fit? Key `${needs}>${provides}`.
 * Built once, pure, deterministic (sorted keys). The UI reads it to green
 * the valid plug targets during drag; the graph validator throws the
 * refusal REASON from it.
 */
export function socketCompatibility(): ReadonlyMap<string, boolean> {
  const matrix = new Map<string, boolean>();
  const names: string[] = [];
  for (const protocol of SOCKET_PROTOCOLS) {
    for (const direction of ["in", "out"] as const) names.push(`${protocol}-${direction}`);
  }
  names.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  for (const needs of names) {
    for (const provides of names) {
      matrix.set(`${needs}>${provides}`, socketsFit([needs], [provides]));
    }
  }
  return matrix;
}

/** Why a drag was refused, in the §7.2 vocabulary — first gate only
 *  (fitting ports come later: speed/VLAN/trust/contract). THROWS when a
 *  declared stem is missing from the vocabulary; the batch path below
 *  converts that into a report line. */
export function refusalReason(
  needs: readonly string[],
  provides: readonly string[],
  declared: readonly string[] = SOCKET_PROTOCOLS,
): string | null {
  if (needs.length === 0 || provides.length === 0) return "no socket declared";
  if (socketsFit(needs, provides, declared)) return null;
  const wanted = needs.map((name) => mirror(name, declared)).sort();
  const offered = [...provides].sort();
  return `wrong socket type — needs ${wanted.join("/")} but target speaks ${offered.join("/")}`;
}

/** Node-level declaration attached by the bundle loader; topology reads
 *  it through this interface so tests can fake a service cheaply. */
export interface SocketEndpoints {
  readonly needs: readonly string[];
  readonly provides: readonly string[];
}

/** Validate a candidate data edge (consumer→provider) before addEdge. */
export function canConnect(
  consumer: SocketEndpoints,
  provider: SocketEndpoints,
  declared: readonly string[] = SOCKET_PROTOCOLS,
): boolean {
  return socketsFit(consumer.needs, provider.provides, declared);
}

/**
 * Batch guard for seed-data loading: lists every illegal pair by node id,
 * sorted, so a bad bundle fails the load with a full report — never a
 * silent shrug. T-7: a socket name outside the declared vocabulary is a
 * FAILURE LINE in that report, not an exception — one malformed stem in
 * line 4 000 must not destroy the report for the other 3 999.
 */
export function validateConnections(
  edges: readonly { readonly from: EntityId; readonly to: EntityId }[],
  endpoints: (node: EntityId) => SocketEndpoints | null,
  declared: readonly string[] = SOCKET_PROTOCOLS,
): readonly { readonly from: EntityId; readonly to: EntityId; readonly reason: string }[] {
  const failures: { from: EntityId; to: EntityId; reason: string }[] = [];
  for (const edge of edges) {
    const consumer = endpoints(edge.from);
    const provider = endpoints(edge.to);
    if (consumer === null || provider === null) {
      failures.push({ ...edge, reason: "endpoint sockets unknown" });
      continue;
    }
    let reason: string | null;
    try {
      reason = refusalReason(consumer.needs, provider.provides, declared);
    } catch (error) {
      reason = `malformed socket declaration — ${error instanceof Error ? error.message : String(error)}`;
    }
    if (reason !== null) failures.push({ ...edge, reason });
  }
  return failures.sort((a, b) => compareIds(a.from, b.from) || compareIds(a.to, b.to));
}
