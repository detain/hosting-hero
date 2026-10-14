/**
 * save/coop.ts — the CO-OP BRANCH-NODE contract (ADR-0013 session-3 ruling 2,
 * OD-9, ratified 2026-10-14):
 *
 *   "One Company, 2–4 writers. The branch node holds museum artifacts + scars
 *    per participant and never customers or cash — the ledger stays
 *    single-authored, mirroring the ratified Matrix-B shadow-instance law
 *    (OD-8/74f157b)."
 *
 * This file is CONTRACT + LAW, not runtime enforcement: sim-core has no live
 * MP host yet (the Workerman relay stays PHP-side, out of repo). The seat
 * ledger rides CompanyNode.coop (node.ts, additive-optional — single-player
 * saves carry no key and their digests never move); attribution rides the
 * existing scar/museum records via `attributedParticipantId`. The museum and
 * the scrapbook are REUSED, never forked — per the ruling's exact nouns.
 *
 * Import rule (workstream boundary): ../types + ./* only. node.ts must NEVER
 * import this file (one-way edge, no cycle).
 */

import type { EntityId, SimTick } from "../types.ts";
import { fail } from "./errors.ts";
import { addScar } from "./node.ts";
import type {
  CompanyNode,
  CoopNodeMetadata,
  MuseumExhibitRecord,
  ScarRecord,
  SeatHolder,
} from "./node.ts";

/* ═══════════════════════ the branch facets (closed vocabulary) ═══════════════════════ */

/** A co-op company seats between two and four writers (ruling 2: "2–4"). */
export const COOP_MIN_SEAT_WRITERS = 2 as const;
export const COOP_MAX_SEAT_WRITERS = 4 as const;

/** The ONLY facets a co-op writer may touch: museum artifacts + scars.
 *  Everything else on WRITE_FACETS — customerBooks, finances (cash),
 *  reputation, the whole almanac — stays company-level and single-authored. */
export const COOP_BRANCH_FACETS = ["scars", "museum"] as const;

export type CoopBranchFacet = (typeof COOP_BRANCH_FACETS)[number];

/* ═══════════════════════ attribution writes (the guarded batch) ═══════════════════════ */

/** One co-op write: a writer, seated at `committedAtTick`, donates a scar or
 *  a museum exhibit. The record carries its own `attributedParticipantId`
 *  stamp (see withScarAttribution / withMuseumAttribution) — the guard below
 *  refuses any write whose stamp disagrees with its author, so a forged
 *  attribution can never ride a batch into the node. */
export interface CoopAttributionWrite {
  readonly facet: CoopBranchFacet;
  readonly participantId: EntityId;
  readonly record: ScarRecord | MuseumExhibitRecord;
}

/** Atomic settlement-shaped batch (§2.4 precedent via modes.guardBatch:
 *  every run commits facts or nothing). */
export interface CoopAttributionBatch {
  readonly runId: EntityId;
  readonly committedAtTick: SimTick;
  readonly writes: readonly CoopAttributionWrite[];
}

/* ═══════════════════════ seat ledger laws ═══════════════════════ */

/**
 * Validate a seat ledger (structural law — safe to run on parsed wires):
 *  - at least one recorded writer (an empty coop node is a phantom company);
 *  - one row per participant — v0 law: a departure + re-handoff is a TRANSPORT
 *    gap, the ledger does not yet model second tenures;
 *  - joinedAtTick strictly ascending in array order (the ledger is append-
 *    only history, not a bag);
 *  - any closed tenure has leftAtTick strictly after joinedAtTick;
 *  - no tick ever has more than COOP_MAX_SEAT_WRITERS open seats — counted
 *    half-open [joined, left) at each join instant, the tightest probe set.
 */
export function validateCoopSeatLedger(ledger: CoopNodeMetadata): void {
  const rows = ledger.seatHolders;
  if (rows.length === 0) fail("coop seat ledger is empty — a co-op company records at least one writer");
  const seen = new Set<EntityId>();
  for (const row of rows) {
    if (seen.has(row.participantId)) {
      fail(`coop seat ledger lists participant "${row.participantId}" twice — v0 allows one tenure row per participant`);
    }
    seen.add(row.participantId);
    if (row.leftAtTick !== undefined && row.leftAtTick <= row.joinedAtTick) {
      fail(`coop seat "${row.participantId}" leftAtTick ${row.leftAtTick} is not after joinedAtTick ${row.joinedAtTick}`);
    }
  }
  for (let i = 1; i < rows.length; i += 1) {
    const prev = requireRow(rows, i - 1);
    const cur = requireRow(rows, i);
    if (cur.joinedAtTick <= prev.joinedAtTick) {
      fail(`coop seat ledger row ${i} joinedAtTick ${cur.joinedAtTick} is not after row ${i - 1} joinedAtTick ${prev.joinedAtTick} — the ledger is append-only history`);
    }
  }
  for (let i = 0; i < rows.length; i += 1) {
    const probe = requireRow(rows, i).joinedAtTick;
    let open = 0;
    for (const row of rows) {
      if (row.joinedAtTick > probe) continue;
      if (row.leftAtTick !== undefined && row.leftAtTick <= probe) continue;
      open += 1;
    }
    if (open > COOP_MAX_SEAT_WRITERS) {
      fail(`coop seat ledger has ${open} simultaneous writers at tick ${probe} — the branch company seats at most ${COOP_MAX_SEAT_WRITERS}`);
    }
  }
}

function requireRow(rows: readonly SeatHolder[], i: number): SeatHolder {
  const row = rows[i];
  if (row === undefined) fail(`coop seat ledger row ${i} missing`);
  return row;
}

/** Seat a new writer — pure: returns the extended ledger, re-validated. */
export function seatParticipant(ledger: CoopNodeMetadata | undefined, seat: SeatHolder): CoopNodeMetadata {
  const base: CoopNodeMetadata = ledger ?? { seatHolders: [] };
  const next: CoopNodeMetadata = { seatHolders: [...base.seatHolders, seat] };
  validateCoopSeatLedger(next);
  return next;
}

/** Close a writer's open tenure — pure; the row must exist and be seated. */
export function vacateSeat(ledger: CoopNodeMetadata, participantId: EntityId, leftAtTick: SimTick): CoopNodeMetadata {
  const target = ledger.seatHolders.find((row) => row.participantId === participantId);
  if (target === undefined) fail(`coop vacate: participant "${participantId}" has no seat row to leave`);
  if (target.leftAtTick !== undefined) fail(`coop vacate: participant "${participantId}" already left at tick ${target.leftAtTick}`);
  const next: CoopNodeMetadata = {
    seatHolders: ledger.seatHolders.map((row) =>
      row.participantId === participantId ? { participantId: row.participantId, joinedAtTick: row.joinedAtTick, leftAtTick } : row,
    ),
  };
  validateCoopSeatLedger(next);
  return next;
}

/** Half-open seating window [joinedAtTick, leftAtTick) — same interval law
 *  as the executive-attention hands. */
export function participantSeatedAt(ledger: CoopNodeMetadata, participantId: EntityId, tick: SimTick): boolean {
  const row = ledger.seatHolders.find((r) => r.participantId === participantId);
  if (row === undefined) return false;
  if (row.joinedAtTick > tick) return false;
  return row.leftAtTick === undefined || tick < row.leftAtTick;
}

/* ═══════════════════════ attribution stamps ═══════════════════════ */

/** Stamp a scar with its co-op author (returns a new record — Law 3). */
export function withScarAttribution(scar: ScarRecord, participantId: EntityId): ScarRecord {
  return { ...scar, attributedParticipantId: participantId };
}

/** Stamp a museum exhibit with its donating participant (Law 3 pure). */
export function withMuseumAttribution(exhibit: MuseumExhibitRecord, participantId: EntityId): MuseumExhibitRecord {
  return { ...exhibit, attributedParticipantId: participantId };
}

/* ═══════════════════════ the guard law (validator, not runtime) ═══════════════════════ */

/**
 * The ADR-0013 ruling-2 guard: a co-op attribution batch must
 *  1. commit facts or nothing (empty batches are refused, mirroring
 *     modes.guardBatch's atomicity law);
 *  2. touch ONLY the branch facets — scars and museum. Any other facet name
 *     (customerBooks = customers, finances = cash, …) is refused by name,
 *     quoting the ruling. The batch may arrive parsed from an untrusted
 *     seat wire, so this checks the runtime value, not just the TS type;
 *  3. come from participants the ledger actually seats at committedAtTick;
 *  4. sit in a genuinely multi-writer company (≥ COOP_MIN_SEAT_WRITERS
 *     distinct recorded writers) — solo runs use the ordinary settlement
 *     path, not the co-op contract;
 *  5. carry an attribution stamp on every record that equals its author.
 *
 * SCOPE NOTE (review m2 @8c0ff88): the guard verifies FACET, seating and
 * stamp — NOT per-record shape. A MuseumExhibitRecord aimed at facet
 * "scars" casts through (commitCoopAttribution's `write.record as
 * ScarRecord`) and is only caught later by node.ts wire-parse. Per-facet
 * record parsing is the TRANSPORT BOUNDARY's obligation (the seat wire
 * must parse before batching); this guard owns attribution law only.
 */
export function guardCoopAttributionBatch(batch: CoopAttributionBatch, ledger: CoopNodeMetadata | undefined): void {
  if (ledger === undefined) {
    fail("coop attribution batch has no seat ledger — the node is single-authored; use the ordinary settlement path");
  }
  if (batch.writes.length === 0) fail("coop attribution batch is empty — every run commits facts or nothing");
  const distinct = new Set(ledger.seatHolders.map((row) => row.participantId));
  if (distinct.size < COOP_MIN_SEAT_WRITERS) {
    fail(`coop attribution needs at least ${COOP_MIN_SEAT_WRITERS} recorded writers — the ledger seats ${distinct.size}`);
  }
  for (let i = 0; i < batch.writes.length; i += 1) {
    const where = `coop write ${i}`;
    const write = batch.writes[i];
    if (write === undefined) fail(`${where} missing`);
    const facet: string = write.facet;
    if (!(COOP_BRANCH_FACETS as readonly string[]).includes(facet)) {
      fail(
        `${where} targets facet "${facet}" — ADR-0013 ruling 2: participants write only {${COOP_BRANCH_FACETS.join(", ")}}; customers/cash stay company-level and single-authored`,
      );
    }
    if (!distinct.has(write.participantId)) {
      fail(`${where} author "${write.participantId}" is not recorded in the seat ledger`);
    }
    if (!participantSeatedAt(ledger, write.participantId, batch.committedAtTick)) {
      fail(`${where} author "${write.participantId}" is not seated at tick ${batch.committedAtTick}`);
    }
    const stamp = (write.record as { readonly attributedParticipantId?: EntityId }).attributedParticipantId;
    if (stamp === undefined) {
      fail(`${where} record "${write.record.id}" carries no attributedParticipantId stamp — stamp it with withScarAttribution/withMuseumAttribution`);
    }
    if (stamp !== write.participantId) {
      fail(`${where} claims author "${write.participantId}" but the record is stamped "${stamp}" — attribution forgery is refused`);
    }
  }
}

/**
 * Guard, then apply — all-or-nothing (the guard sees every write before the
 * first is committed). Scar writes route through addScar so the three-floor
 * cap-retire law survives co-op writes (attribution rides the demotion);
 * museum writes append — the museum never destroys exhibits (§2.5).
 * Record-shape validation is NOT done here — see the scope note on
 * guardCoopAttributionBatch (transport boundary's obligation, m2 @8c0ff88).
 */
export function commitCoopAttribution(node: CompanyNode, batch: CoopAttributionBatch): CompanyNode {
  guardCoopAttributionBatch(batch, node.coop);
  let next = node;
  for (const write of batch.writes) {
    if (write.facet === "scars") {
      next = addScar(next, write.record as ScarRecord);
    } else {
      next = { ...next, museum: [...next.museum, write.record as MuseumExhibitRecord] };
    }
  }
  return next;
}
