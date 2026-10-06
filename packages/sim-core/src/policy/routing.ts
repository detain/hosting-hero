/**
 * Alert routing table (MASTER_REPORT §4.5 R30: severity → destination →
 * time-of-day → escalation path) + escalation-loop safety (gap G12:
 * "pages-that-page-yourself ... same detector machinery as R5 should cover
 * it").
 *
 * v0 note: R30 names a time-of-day leg; the clock model (§4.1) gives a
 * business calendar, and no day/night primitive exists in the shared
 * contract yet — time-of-day routing is therefore NOT invented here. It is
 * queued as DECISION REQUEST D-14 (needs an owner-blessed business-day
 * helper before a rule can key on it).
 *
 * The table is pure data validated at load; `findRoutingCycles` reuses the
 * exact cycle detector the conflict scanner uses (graph.detectDirectedCycles,
 * self-loops INCLUDED — paging yourself once is already the bug).
 */

import type { Fixed, SimTimeUs } from "../types.ts";
import { FIXED_ONE } from "../kernel/fixed.ts";
import { PolicyEvalError } from "./evaluator.ts";
import { detectDirectedCycles, type DirectedGraph } from "./graph.ts";

/** Closed severity enum (4 levels — WS-5 R35's "4-consequence decision"). */
export type AlertSeverity = "sev-1" | "sev-2" | "sev-3" | "sev-4";

export const ALERT_SEVERITIES: ReadonlySet<string> = new Set<string>([
  "sev-1",
  "sev-2",
  "sev-3",
  "sev-4",
]);

/** Destination kinds — closed enum; role/runbook refs resolve outside the
 *  policy module (staff roster / runbook library own them). */
export type DestinationKind = "role" | "runbook" | "ticket-queue" | "log" | "console";

export const DESTINATION_KINDS: ReadonlySet<string> = new Set<string>([
  "role",
  "runbook",
  "ticket-queue",
  "log",
  "console",
]);

export interface AlertDestination {
  readonly kind: DestinationKind;
  readonly ref: string;
}

export interface RoutingEntry {
  readonly id: string;
  readonly severity: AlertSeverity;
  readonly destination: AlertDestination;
  /** Sim-µs to wait before escalating; 0 = no escalation configured. */
  readonly escalateAfterUs: SimTimeUs;
  /** null when the entry terminates (no escalation path). */
  readonly escalation: AlertDestination | null;
}

export interface AlertRoutingTable {
  readonly entries: readonly RoutingEntry[];
}

export class RoutingError extends Error {
  constructor(message: string) {
    super(`policy.routing: ${message}`);
    this.name = "RoutingError";
  }
}

export function destinationLabel(destination: AlertDestination): string {
  return `${destination.kind}:${destination.ref}`;
}

/** Boundary validation — fail loud on nonsense before it pages anybody. */
export function validateRoutingTable(table: AlertRoutingTable): AlertRoutingTable {
  const ids = new Set<string>();
  for (const entry of table.entries) {
    if (entry.id.length === 0) throw new RoutingError("entry id must be non-empty");
    if (ids.has(entry.id)) throw new RoutingError(`duplicate entry id "${entry.id}"`);
    ids.add(entry.id);
    if (!ALERT_SEVERITIES.has(entry.severity)) {
      throw new RoutingError(`${entry.id}: severity "${String(entry.severity)}" not in closed enum`);
    }
    if (!DESTINATION_KINDS.has(entry.destination.kind)) {
      throw new RoutingError(`${entry.id}: destination kind "${String(entry.destination.kind)}" not in closed enum`);
    }
    if (entry.destination.ref.length === 0) throw new RoutingError(`${entry.id}: destination ref must be non-empty`);
    if (entry.escalation !== null) {
      if (entry.escalateAfterUs <= 0n) {
        throw new RoutingError(`${entry.id}: escalation target set but escalateAfterUs is ${entry.escalateAfterUs} — must be > 0`);
      }
      if (!DESTINATION_KINDS.has(entry.escalation.kind)) {
        throw new RoutingError(`${entry.id}: escalation kind "${String(entry.escalation.kind)}" not in closed enum`);
      }
      // P5: an escalation with an empty ref silently pages `role:` — nobody.
      if (entry.escalation.ref.length === 0) {
        throw new RoutingError(`${entry.id}: escalation ref must be non-empty`);
      }
    } else if (entry.escalateAfterUs < 0n) {
      throw new RoutingError(`${entry.id}: negative escalateAfterUs`);
    }
  }
  return table;
}

/** Map the `page` action's numeric value (Fixed 1..4) to a severity. */
export function severityFromPageValue(value: Fixed | null): AlertSeverity {
  if (value === null) return "sev-3"; // unparameterized page = default low
  const whole = value / FIXED_ONE;
  if (whole <= 1n) return "sev-1";
  if (whole === 2n) return "sev-2";
  if (whole === 3n) return "sev-3";
  return "sev-4";
}

export interface AlertDispatch {
  readonly entryId: string;
  readonly destination: AlertDestination;
  /** null = no escalation configured; else the sim-µs deadline. */
  readonly escalateDueAtUs: SimTimeUs | null;
}

/** First dispatch for an alert: entries are searched in TABLE ORDER (author
 *  order is the tiebreak — same law as the rule book). Throws when nothing
 *  routes the severity (a page that goes nowhere is a silent incident, Law 4). */
export function routeAlert(table: AlertRoutingTable, severity: AlertSeverity, atUs: SimTimeUs): AlertDispatch {
  for (const entry of table.entries) {
    if (entry.severity !== severity) continue;
    const due =
      entry.escalation !== null && entry.escalateAfterUs > 0n ? atUs + entry.escalateAfterUs : null;
    return { entryId: entry.id, destination: entry.destination, escalateDueAtUs: due };
  }
  throw new RoutingError(`no routing entry for severity "${severity}"`);
}

/**
 * Project the escalation chain for a severity: ordered destination labels,
 * stopping at a terminal, at a revisit (cycle — G12), or at MAX_ESCALATION_HOPS
 * (a loud guard, not a silent loop).
 */
export const MAX_ESCALATION_HOPS = 16;

export function projectEscalationChain(table: AlertRoutingTable, severity: AlertSeverity): readonly string[] {
  const first = routeAlert(table, severity, 0n);
  const chain: string[] = [destinationLabel(first.destination)];
  const visited = new Set(chain);
  let current: AlertDestination | null = entryById(table, first.entryId)?.escalation ?? null;
  let hops = 0;
  while (current !== null) {
    if (hops >= MAX_ESCALATION_HOPS) {
      throw new PolicyEvalError(
        `routing: escalation chain for "${severity}" exceeded ${MAX_ESCALATION_HOPS} hops — pathological table`,
      );
    }
    const label = destinationLabel(current);
    if (visited.has(label)) {
      chain.push(`${label}!`); // cycle marker — see findRoutingCycles
      return chain;
    }
    visited.add(label);
    chain.push(label);
    hops += 1;
    // N2: the carrier is the SAME entry a dispatch would pick — first match
    // in table order for this destination ("author order is the tiebreak",
    // as in routeAlert). The old heuristic ("first entry with this label that
    // happens to escalate") let a secondary entry hijack the chain past a
    // primary TERMINAL carrier sharing the destination, projecting pages
    // that would never be sent.
    const carrier = table.entries.find((entry) => destinationLabel(entry.destination) === label);
    current = carrier?.escalation ?? null;
  }
  return chain;
}

function entryById(table: AlertRoutingTable, id: string): RoutingEntry | undefined {
  return table.entries.find((entry) => entry.id === id);
}

/** Directed graph of destination → escalation-destination edges. */
export function buildRoutingGraph(table: AlertRoutingTable): DirectedGraph {
  const nodes = new Set<string>();
  const edges: (readonly [string, string])[] = [];
  for (const entry of table.entries) {
    const from = destinationLabel(entry.destination);
    nodes.add(from);
    if (entry.escalation !== null) {
      const to = destinationLabel(entry.escalation);
      nodes.add(to);
      edges.push([from, to]);
    }
  }
  return { nodes: [...nodes].sort(), edges };
}

/** Self-page / escalation-loop detection (G12) — SAME cycle detector the rule
 *  conflict scanner runs, self-loops included. Empty array = safe table.
 *  Deterministic: sorted nodes feed the canonicalized detector output. */
export function findRoutingCycles(table: AlertRoutingTable): string[][] {
  return detectDirectedCycles(buildRoutingGraph(table), true);
}
