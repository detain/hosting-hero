/**
 * replay/coopTimeline.ts — the OD-17 SHARED INCIDENT TIMELINE contract
 * (ADR-0013 session-3 ruling 8, option A, ratified 2026-10-14):
 *
 *   One event stream; every seat reads the SAME ordered log. Chosen over
 *   per-seat timelines because it is consistent with the OD-5(b)
 *   portable-sim ruling and the single-event-log determinism law — the
 *   timeline canonicalizes and digests through the SAME replay/canonical.ts
 *   machinery as intent logs, so a co-op session replays like any run.
 *
 *   Option C (duplicate-action interference) is a future opt-in twist — NOT
 *   modeled here.
 *
 * v0 is schema + law only: the relay that stamps (tick, seq) and appends is
 * the PHP-side Workerman transport lane, out of repo. The one ordering law
 * the relay must satisfy — and every consumer may assume — is a GLOBAL
 * (tick, seq) total order: each record's position in the shared log is
 * unique, and the canonical digest is computed over the (tick, seq)-ordered
 * sequence, so two seats that received the same logical events in different
 * arrival interleavings derive ONE digest.
 *
 * Dependency law (replay boundary): ../types + ./canonical.ts only.
 */

import type { EntityId, HashHex, SimTick } from "../types.ts";
import { asEntityId } from "../types.ts";
import { digestCanonicalValue, encodeCanonicalJson, fail, requireDefined } from "./canonical.ts";

/* ═══════════════════════ the record ═══════════════════════ */

/** Closed kind vocabulary (ruling 8): what a seat puts on the shared log. */
export const COOP_TIMELINE_KINDS = ["action", "sightline", "note"] as const;

export type CoopTimelineKind = (typeof COOP_TIMELINE_KINDS)[number];

/** One line of the shared incident timeline. `seq` is the relay-assigned
 *  tiebreaker inside a tick — (tick, seq) is globally unique in the log.
 *  `payload` is opaque here (the relay/transport lane interprets it), same
 *  storage-not-query-surface law as every other canonical JSON leaf. */
export interface CoopTimelineRecord {
  readonly participantId: EntityId;
  readonly tick: SimTick;
  readonly seq: number;
  readonly kind: CoopTimelineKind;
  readonly payload: Readonly<Record<string, unknown>>;
}

/* ═══════════════════════ boundary parse ═══════════════════════ */

function asDictStrict(value: unknown, where: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) fail(`${where}: expected object`);
  return value as Record<string, unknown>;
}

/** Strict boundary parse (Law 2 + Law 4): a timeline record off a seat wire
 *  must carry a real bigint tick (never a JSON string — that is the
 *  fromCanonicalJson door's job), a safe non-negative integer seq, a kind
 *  inside the closed vocabulary, and a plain-object payload. */
export function parseCoopTimelineRecord(value: unknown, where = "coopTimelineRecord"): CoopTimelineRecord {
  const d = asDictStrict(value, where);
  const participantId = d.participantId;
  if (typeof participantId !== "string" || participantId.length === 0) fail(`${where}.participantId: expected non-empty string`);
  if (typeof d.tick !== "bigint") fail(`${where}.tick: expected bigint (use decodeCanonicalJson, not JSON.parse)`);
  if (typeof d.seq !== "number" || !Number.isSafeInteger(d.seq) || d.seq < 0) fail(`${where}.seq: expected safe integer ≥ 0`);
  if (typeof d.kind !== "string" || !(COOP_TIMELINE_KINDS as readonly string[]).includes(d.kind)) {
    fail(`${where}.kind: "${String(d.kind)}" not in {${COOP_TIMELINE_KINDS.join("|")}}`);
  }
  return {
    participantId: asEntityId(participantId),
    tick: d.tick as SimTick,
    seq: d.seq,
    kind: d.kind as CoopTimelineKind,
    payload: asDictStrict(requireDefined(d.payload, `${where}.payload`), `${where}.payload`),
  };
}

/* ═══════════════════════ ordering law ═══════════════════════ */

function compareTickSeq(a: CoopTimelineRecord, b: CoopTimelineRecord): number {
  if (a.tick !== b.tick) return a.tick < b.tick ? -1 : 1;
  return a.seq - b.seq;
}

/**
 * Assert a log is already in strict (tick, seq) ascending order — the
 * append law the relay must uphold. A duplicated (tick, seq) pair throws
 * naming BOTH positions (intent-door M4 precedent): two events claiming one
 * slot is exactly the ambiguity the shared timeline exists to kill.
 */
export function assertCoopTimelineAppendOrder(records: readonly CoopTimelineRecord[]): void {
  for (let i = 1; i < records.length; i += 1) {
    const prev = requireDefined(records[i - 1], `coop timeline record ${i - 1}`);
    const cur = requireDefined(records[i], `coop timeline record ${i}`);
    const cmp = compareTickSeq(cur, prev);
    if (cmp === 0) {
      fail(`coop timeline: (${cur.tick}, ${cur.seq}) appears at both positions ${i - 1} and ${i} — (tick, seq) must be unique in the shared log`);
    }
    if (cmp < 0) {
      fail(`coop timeline: record ${i} (${cur.tick}, ${cur.seq}) sorts before record ${i - 1} (${prev.tick}, ${prev.seq}) — append order violated`);
    }
  }
}

/** Normalize any arrival interleaving of the same logical events into the
 *  one canonical order (tick asc, seq asc). Throws on duplicate (tick, seq)
 *  exactly like the append-order assert — reordering can never hide a slot
 *  collision. */
export function orderCoopTimeline(records: readonly CoopTimelineRecord[]): CoopTimelineRecord[] {
  const copy = [...records];
  copy.sort(compareTickSeq);
  for (let i = 1; i < copy.length; i += 1) {
    const prev = requireDefined(copy[i - 1], `coop timeline record ${i - 1}`);
    const cur = requireDefined(copy[i], `coop timeline record ${i}`);
    if (cur.tick === prev.tick && cur.seq === prev.seq) {
      fail(`coop timeline: (${cur.tick}, ${cur.seq}) is claimed by two records — (tick, seq) must be unique in the shared log`);
    }
  }
  return copy;
}

/* ═══════════════════════ wire + canonical forms ═══════════════════════ */

/** Stable plain-dict form (key order fixed by construction; bigints ride as
 *  real bigint for the canonical encoder, mirroring bundle.ts wire style). */
export function coopTimelineRecordToWire(record: CoopTimelineRecord): Record<string, unknown> {
  return {
    participantId: record.participantId,
    tick: record.tick,
    seq: record.seq,
    kind: record.kind,
    payload: record.payload,
  };
}

export function coopTimelineToWire(records: readonly CoopTimelineRecord[]): Record<string, unknown>[] {
  return records.map(coopTimelineRecordToWire);
}

/** Canonical JSON of the ORDERED wire — the printable shared-log form. */
export function canonicalCoopTimeline(records: readonly CoopTimelineRecord[]): string {
  return encodeCanonicalJson(coopTimelineToWire(orderCoopTimeline(records)));
}

/**
 * The OD-17 digest: one hash for one logical timeline. Interleaving-
 * invariant BY CONSTRUCTION (orders first, then digests through the same
 * replay canonical machinery as everything else), so two seats that each
 * hold the same events in different arrival orders agree without talking.
 */
export function digestCoopTimeline(records: readonly CoopTimelineRecord[]): HashHex {
  return digestCanonicalValue(orderCoopTimeline(records).map(coopTimelineRecordToWire));
}
