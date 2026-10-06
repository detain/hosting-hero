/**
 * Causality trace extractor — the "losing run explicable in one sentence"
 * primitive (§4.1 R-14…R-19: every state mutation carries a CauseId,
 * stamped at creation, attribution end-to-end; §7.0 unretrofittable
 * Attribution Ledger law).
 *
 * The engine guarantees the STAMP (causeId on every event/mutation); the
 * LINKAGE (which cause fed which) is assembled here from cause records —
 * `causeIndexFromEvents` gives the free baseline from `SimEvent[]` (each
 * event's own creation cause), and producers that thread causality further
 * (retry → bounce, rule firing → action, contract breach → credit) supply
 * parent links alongside their events.
 *
 * Red-herring lane separation (postmortem "red-herring naming", R-73…R-80
 * failure machinery): causes that merely CO-OCCURRED — same tick, or about
 * the same subject — but sit nowhere on the ancestor chain are reported in
 * a separate lane, never mixed into the explanation.
 */

import type { CauseId, EntityId, SimEvent, SimTick } from "../types.ts";
import { ReplayError } from "./canonical.ts";

export interface CauseRecord {
  readonly causeId: CauseId;
  /** null = root cause (seeded scenario beat, initial intent, …). */
  readonly parentCauseId: CauseId | null;
  readonly tick: SimTick;
  /** What kind of happenstance this is ("arrival", "retry", "verb"…). */
  readonly kind: string;
  /** One-line human phrase — the sentence is BUILT from these, §4.1. */
  readonly summary: string;
  /** Entity the cause is about, when it has one (red-herring relevance). */
  readonly subject?: EntityId;
}

/** Adapter: SimEvent → CauseRecord baseline. Events carry their creation
 *  cause; parent linkage defaults to null (root) unless `parents` maps a
 *  causeId to its contributing cause. */
export function causeRecordsFromEvents(
  events: readonly SimEvent[],
  parents?: ReadonlyMap<CauseId, CauseId>,
  summarize: (event: SimEvent) => string = defaultSummarize,
): CauseRecord[] {
  return events.map((event) => {
    const record: CauseRecord = {
      causeId: event.causeId,
      parentCauseId: parents?.get(event.causeId) ?? null,
      tick: event.tick,
      kind: event.kind,
      summary: summarize(event),
    };
    const subject = eventSubject(event);
    return subject === undefined ? record : { ...record, subject };
  });
}

function defaultSummarize(event: SimEvent): string {
  return `${event.kind}@${event.tick}`;
}

function eventSubject(event: SimEvent): EntityId | undefined {
  switch (event.kind) {
    case "arrival":
    case "served":
    case "bounced":
    case "blocked-false-positive":
    case "landed":
    case "retry":
      return event.unitId;
    case "invoice-settled":
      return event.contractId;
    default:
      return undefined; // rule-fired / checkpoint: no single subject
  }
}

export interface CauseIndex {
  /** Look up one cause. */
  get(causeId: CauseId): CauseRecord;
  /** All causes about an entity (stable tick order). */
  bySubject(subject: EntityId): readonly CauseRecord[];
  /** All causes that fired at a tick (stable cause-id order). */
  atTick(tick: SimTick): readonly CauseRecord[];
  readonly size: number;
}

/** Index the records; duplicate cause ids with CONFLICTING records fail
 *  loud (attribution is stamped once — a double-stamp is a bug). */
export function buildCauseIndex(records: readonly CauseRecord[]): CauseIndex {
  const byId = new Map<CauseId, CauseRecord>();
  const bySubject = new Map<EntityId, CauseRecord[]>();
  const byTick = new Map<SimTick, CauseRecord[]>();
  for (const record of records) {
    const existing = byId.get(record.causeId);
    if (existing !== undefined) {
      if (existing.parentCauseId !== record.parentCauseId || existing.tick !== record.tick || existing.kind !== record.kind) {
        throw new ReplayError(`buildCauseIndex: conflicting records for cause ${record.causeId}`);
      }
      continue; // identical re-registration is harmless
    }
    byId.set(record.causeId, record);
    if (record.subject !== undefined) {
      const bucket = bySubject.get(record.subject);
      if (bucket === undefined) bySubject.set(record.subject, [record]);
      else bucket.push(record);
    }
    const tickBucket = byTick.get(record.tick);
    if (tickBucket === undefined) byTick.set(record.tick, [record]);
    else tickBucket.push(record);
  }
  // Stable orders: tick asc, then code-unit cause id (never locale).
  const stableSort = (list: CauseRecord[]): CauseRecord[] =>
    [...list].sort((a, b) => (a.tick !== b.tick ? (a.tick < b.tick ? -1 : 1) : a.causeId < b.causeId ? -1 : a.causeId > b.causeId ? 1 : 0));
  for (const [subject, list] of bySubject) bySubject.set(subject, stableSort(list));
  for (const [tick, list] of byTick) byTick.set(tick, stableSort(list));

  return {
    get(causeId: CauseId): CauseRecord {
      const record = byId.get(causeId);
      if (record === undefined) throw new ReplayError(`causeIndex: unknown cause ${causeId}`);
      return record;
    },
    bySubject: (subject) => bySubject.get(subject) ?? [],
    atTick: (tick) => byTick.get(tick) ?? [],
    size: byId.size,
  };
}

export interface CausalTrace {
  /** The effect being explained. */
  readonly effect: CauseRecord;
  /** Contributing factors ROOT → EFFECT (inclusive chain). */
  readonly factors: readonly CauseRecord[];
  /** Co-occurring-but-off-chain causes, split into their own lanes so the
   *  postmortem can name red herrings explicitly. */
  readonly redHerrings: readonly {
    readonly record: CauseRecord;
    readonly reason: "same-tick" | "same-subject";
  }[];
}

/** Walk the causeId links upward from `effectCauseId`. */
export function traceContributingFactors(index: CauseIndex, effectCauseId: CauseId, options: { redHerringWindowTicks?: SimTick } = {}): CausalTrace {
  const effect = index.get(effectCauseId);
  const chain: CauseRecord[] = [];
  const onChain = new Set<CauseId>();
  const windowTicks = options.redHerringWindowTicks ?? 0n;

  let cursor: CauseRecord | null = effect;
  while (cursor !== null) {
    if (onChain.has(cursor.causeId)) throw new ReplayError(`traceContributingFactors: cause cycle at ${cursor.causeId}`);
    onChain.add(cursor.causeId);
    chain.push(cursor);
    cursor = cursor.parentCauseId === null ? null : index.get(cursor.parentCauseId);
  }
  chain.reverse(); // root → effect

  const redHerrings: { readonly record: CauseRecord; readonly reason: "same-tick" | "same-subject" }[] = [];
  const seen = new Set<CauseId>();
  const windowLo = effect.tick - windowTicks < 0n ? 0n : effect.tick - windowTicks;
  for (let tick = windowLo; tick <= effect.tick; tick += 1n) {
    for (const record of index.atTick(tick)) {
      if (onChain.has(record.causeId) || seen.has(record.causeId)) continue;
      seen.add(record.causeId);
      redHerrings.push({ record, reason: "same-tick" });
    }
  }
  if (effect.subject !== undefined) {
    for (const record of index.bySubject(effect.subject)) {
      if (onChain.has(record.causeId) || seen.has(record.causeId)) continue;
      seen.add(record.causeId);
      redHerrings.push({ record, reason: "same-subject" });
    }
  }
  return { effect, factors: chain, redHerrings };
}

/** THE "one sentence": root cause → … → effect, joined into a single
 *  readable sentence. Empty on non-annotated chains is impossible — the
 *  effect itself is always in `factors`. */
export function oneSentenceExplanation(trace: CausalTrace, joiner = " → "): string {
  return trace.factors.map((factor) => factor.summary).join(joiner);
}

/** Red-herring lane report for the postmortem UI ("what looked guilty but
 *  wasn't"), deterministic order already guaranteed by the index. */
export function redHerringLane(trace: CausalTrace): readonly string[] {
  return trace.redHerrings.map(({ record, reason }) => `[${reason}] ${record.summary} (cause ${record.causeId})`);
}
