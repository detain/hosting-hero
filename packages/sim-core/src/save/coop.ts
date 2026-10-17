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
 *
 * HARDENED 2026-10-16 (lane L-RH, owner session-5 agenda (e) delegation of the
 * ADR-0014 #D6 spike frictions @9a3d508): the seat ledger now carries THREE
 * upgraded laws —
 *  1. SAME-TICK JOINS: a join instant may host several seats; rows sharing one
 *     joinedAtTick are ordered by participantId code-unit (canonical, so two
 *     hosts applying the same join set converge to byte-equal ledgers).
 *     joinedAtTick still never decreases across rows.
 *  2. RE-JOIN = NEW ROW (ADR-0014 #D6 verbatim "re-join-as-new-row"): a
 *     participant may hold multiple tenure rows iff the tenures are disjoint
 *     half-open windows in chronological order; a writer never holds two open
 *     tenures at once. participantSeatedAt resolves per TENURE (any enclosing
 *     window seats the author), so the attribution guard's ghost-author leg
 *     checks the stamped tick against the enclosing tenure.
 *  3. MIN_WRITERS counts RECORDED writers (distinct participantIds ever
 *     seated), NOT live seats — RATIFIED history law: ruling 2's "One
 *     Company, 2–4 writers" is a lifetime shape property of the branch node,
 *     the ledger is append-only history, and per-write safety is already
 *     carried by the seating check; counting live seats would couple
 *     attribution settlement to who happens to be online (transport state),
 *     exactly the runtime coupling this contract-law file refuses.
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
 *  - any closed tenure has leftAtTick strictly after joinedAtTick;
 *  - CANONICAL ORDER (L-RH law 1): joinedAtTick ascends along the array — a
 *    same-tick run is ordered by participantId code-unit. Because the order
 *    is a function of the row SET, hosts applying the same joins in any
 *    arrival order converge to the identical ledger (save-wire determinism);
 *  - ONE TENURE AT A TIME + DISJOINT HANDOFF (L-RH law 2, ADR-0014 #D6
 *    "re-join-as-new-row"): a participant's later row may only begin at or
 *    after its previous row's leftAtTick — an open earlier tenure refuses any
 *    newer row, an overlapping closed one refuses the re-handoff;
 *  - no tick ever has more than COOP_MAX_SEAT_WRITERS open seats — counted
 *    half-open [joined, left) at each join instant, the tightest probe set.
 */
export function validateCoopSeatLedger(ledger: CoopNodeMetadata): void {
  const rows = ledger.seatHolders;
  if (rows.length === 0) fail("coop seat ledger is empty — a co-op company records at least one writer");
  for (const row of rows) {
    if (row.leftAtTick !== undefined && row.leftAtTick <= row.joinedAtTick) {
      fail(`coop seat "${row.participantId}" leftAtTick ${row.leftAtTick} is not after joinedAtTick ${row.joinedAtTick}`);
    }
  }
  for (let i = 1; i < rows.length; i += 1) {
    const prev = requireRow(rows, i - 1);
    const cur = requireRow(rows, i);
    if (cur.joinedAtTick < prev.joinedAtTick) {
      fail(`coop seat ledger row ${i} joinedAtTick ${cur.joinedAtTick} is before row ${i - 1} joinedAtTick ${prev.joinedAtTick} — joins ascend, the ledger is append-only history`);
    }
    if (cur.joinedAtTick === prev.joinedAtTick && compareParticipantIds(cur.participantId, prev.participantId) <= 0) {
      fail(`coop seat ledger row ${i} shares tick ${cur.joinedAtTick} with row ${i - 1} but participant "${cur.participantId}" does not follow "${prev.participantId}" in code-unit order — same-tick seats ascend by participantId`);
    }
  }
  const previousTenure = new Map<EntityId, SeatHolder>();
  for (const row of rows) {
    const prior = previousTenure.get(row.participantId);
    if (prior !== undefined) {
      if (prior.leftAtTick === undefined) {
        fail(`coop seat "${row.participantId}" opens a tenure at tick ${row.joinedAtTick} while its earlier tenure from tick ${prior.joinedAtTick} is still open — a writer holds one tenure at a time`);
      }
      if (row.joinedAtTick < prior.leftAtTick) {
        fail(`coop seat "${row.participantId}" tenure at tick ${row.joinedAtTick} overlaps its previous tenure [${prior.joinedAtTick}, ${prior.leftAtTick}) — re-handoff tenures must be disjoint and ordered`);
      }
    }
    previousTenure.set(row.participantId, row);
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

/** Code-unit comparison — the same ordering the canonical wire sorts use. */
function compareParticipantIds(a: EntityId, b: EntityId): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

function compareSeats(a: SeatHolder, b: SeatHolder): number {
  if (a.joinedAtTick !== b.joinedAtTick) return a.joinedAtTick < b.joinedAtTick ? -1 : 1;
  return compareParticipantIds(a.participantId, b.participantId);
}

function requireRow(rows: readonly SeatHolder[], i: number): SeatHolder {
  const row = rows[i];
  if (row === undefined) fail(`coop seat ledger row ${i} missing`);
  return row;
}

/**
 * Seat a new writer — pure: returns a ledger containing the seat at its
 * CANONICAL position (joinedAtTick asc, participantId code-unit within one
 * tick), re-validated. Insertion (not blind append) is what makes same-tick
 * joins order-independent: every host folds the same tenure set to the same
 * ledger bytes. A re-handoff for a participant with a closed tenure simply
 * lands as a new row (L-RH law 2); overlapping or open-second rows refuse.
 */
export function seatParticipant(ledger: CoopNodeMetadata | undefined, seat: SeatHolder): CoopNodeMetadata {
  const base: CoopNodeMetadata = ledger ?? { seatHolders: [] };
  const rows = [...base.seatHolders];
  let insertAt = rows.length;
  for (let i = 0; i < rows.length; i += 1) {
    if (compareSeats(requireRow(rows, i), seat) >= 0) {
      insertAt = i;
      break;
    }
  }
  rows.splice(insertAt, 0, seat);
  const next: CoopNodeMetadata = { seatHolders: rows };
  validateCoopSeatLedger(next);
  return next;
}

/** Close the participant's OPEN tenure — pure; the re-join law means a
 *  participant may own several rows, so vacate targets the single open one
 *  (disjointness guarantees at most one exists). */
export function vacateSeat(ledger: CoopNodeMetadata, participantId: EntityId, leftAtTick: SimTick): CoopNodeMetadata {
  const rows = ledger.seatHolders;
  let openIndex = -1;
  let lastLeftAtTick: SimTick | undefined;
  let hasRow = false;
  for (let i = 0; i < rows.length; i += 1) {
    const row = requireRow(rows, i);
    if (row.participantId !== participantId) continue;
    hasRow = true;
    if (row.leftAtTick === undefined) openIndex = i;
    else lastLeftAtTick = row.leftAtTick;
  }
  if (!hasRow) fail(`coop vacate: participant "${participantId}" has no seat row to leave`);
  if (openIndex < 0) fail(`coop vacate: participant "${participantId}" already left at tick ${lastLeftAtTick}`);
  const next: CoopNodeMetadata = {
    seatHolders: rows.map((row, i) =>
      i === openIndex ? { participantId: row.participantId, joinedAtTick: row.joinedAtTick, leftAtTick } : row,
    ),
  };
  validateCoopSeatLedger(next);
  return next;
}

/** Half-open seating window [joinedAtTick, leftAtTick) PER TENURE (L-RH law
 *  2) — same interval law as the executive-attention hands. A participant is
 *  seated at a tick iff ANY of their tenure rows encloses it, which is what
 *  makes the attribution guard's ghost-author leg resolve the author against
 *  the tenure enclosing the stamped tick. */
export function participantSeatedAt(ledger: CoopNodeMetadata, participantId: EntityId, tick: SimTick): boolean {
  return ledger.seatHolders.some(
    (row) =>
      row.participantId === participantId &&
      row.joinedAtTick <= tick &&
      (row.leftAtTick === undefined || tick < row.leftAtTick),
  );
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
 *  3. come from participants the ledger actually seats at committedAtTick —
 *     resolved PER TENURE (L-RH law 2): the author is checked against the
 *     half-open window enclosing the stamped tick, so a re-handoff's second
 *     tenure seats them again while the gap between tenures never does;
 *  4. sit in a genuinely multi-writer company (≥ COOP_MIN_SEAT_WRITERS
 *     distinct RECORDED writers — L-RH law 3, ratified history law: a
 *     departed co-writer keeps counting, because the check asks what kind of
 *     company this node's history records, not who is online; the per-write
 *     seating check in 3 is what refuses departed authors their own writes) —
 *     solo runs use the ordinary settlement path, not the co-op contract;
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
    fail(`coop attribution needs at least ${COOP_MIN_SEAT_WRITERS} recorded writers — the ledger records ${distinct.size}`);
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
