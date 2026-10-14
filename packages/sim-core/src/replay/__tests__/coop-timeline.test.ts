/**
 * ADR-0013 ruling 8 (OD-17) — the SHARED INCIDENT TIMELINE contract tests.
 * Heart of the law: two seats that received the SAME logical events in
 * different arrival interleavings must derive ONE canonical digest.
 */

import { describe, expect, it } from "vitest";
import { asEntityId, type EntityId } from "../../types";
import {
  COOP_TIMELINE_KINDS,
  assertCoopTimelineAppendOrder,
  canonicalCoopTimeline,
  coopTimelineRecordToWire,
  coopTimelineToWire,
  digestCoopTimeline,
  orderCoopTimeline,
  parseCoopTimelineRecord,
  type CoopTimelineRecord,
} from "../coopTimeline";
import { decodeCanonicalJson, encodeCanonicalJson } from "../canonical";

const id = (s: string): EntityId => asEntityId(s);

function rec(participant: string, tick: bigint, seq: number, kind: string = "action", payload: Record<string, unknown> = { verb: "place" }): CoopTimelineRecord {
  return { participantId: id(participant), tick, seq, kind: kind as CoopTimelineRecord["kind"], payload };
}

/** Six logical events from two seats, already in canonical (tick, seq) order. */
function logicalTimeline(): CoopTimelineRecord[] {
  return [
    rec("p-ana", 10n, 0, "action", { verb: "connect" }),
    rec("p-ana", 10n, 1, "note", { text: "watching the edge" }),
    rec("p-bo", 12n, 0, "sightline", { node: "edge-1" }),
    rec("p-ana", 25n, 0, "action", { verb: "shed" }),
    rec("p-bo", 25n, 1, "action", { verb: "observe" }),
    rec("p-bo", 31n, 0, "note", { text: "postmortem soon" }),
  ];
}

describe("digestCoopTimeline — one log, one digest, any interleaving", () => {
  it("seat-order permutations of the same logical timeline share one digest", () => {
    const canonical = logicalTimeline();
    const seatA = [...canonical];
    // Seat B watched arrivals shuffle: reverse, and an interleaving split.
    const seatB = [...canonical].reverse();
    const head = canonical.slice(0, 4);
    const tail = canonical.slice(4);
    const seatC = [...tail, ...head];
    const dA = digestCoopTimeline(seatA);
    expect(digestCoopTimeline(seatB)).toBe(dA);
    expect(digestCoopTimeline(seatC)).toBe(dA);
    expect(canonicalCoopTimeline(seatB)).toBe(canonicalCoopTimeline(seatA));
  });

  it("the digest moves on content: one payload byte, one kind, one author", () => {
    const base = logicalTimeline();
    const baseline = digestCoopTimeline(base);
    const edited = base.map((r, i) => (i === 2 ? { ...r, payload: { node: "edge-2" } } : r));
    expect(digestCoopTimeline(edited)).not.toBe(baseline);
    const rekindled = base.map((r, i) => (i === 0 ? { ...r, kind: "note" as const } : r));
    expect(digestCoopTimeline(rekindled)).not.toBe(baseline);
    const reauthored = base.map((r, i) => (i === 5 ? { ...r, participantId: id("p-zed") } : r));
    expect(digestCoopTimeline(reauthored)).not.toBe(baseline);
  });

  it("the empty and single-event logs digest deterministically", () => {
    expect(digestCoopTimeline([])).toBe(digestCoopTimeline([]));
    const one = [rec("p-ana", 0n, 0)];
    expect(digestCoopTimeline(one)).toBe(digestCoopTimeline([...one]));
  });
});

describe("append-order law", () => {
  it("accepts a strictly ascending (tick, seq) log", () => {
    expect(() => assertCoopTimelineAppendOrder(logicalTimeline())).not.toThrow();
  });

  it("refuses a record that sorts before its predecessor", () => {
    const broken = logicalTimeline();
    const swapped = [broken[1], broken[0]] as [CoopTimelineRecord, CoopTimelineRecord];
    const log = [...swapped, ...broken.slice(2)];
    expect(() => assertCoopTimelineAppendOrder(log)).toThrow(/sorts before record/);
  });

  it("refuses a duplicated (tick, seq) slot, naming BOTH positions", () => {
    const twin = rec("p-bo", 10n, 0, "action", { verb: "collide" });
    const log = [rec("p-ana", 10n, 0), twin, rec("p-ana", 11n, 0)];
    expect(() => assertCoopTimelineAppendOrder(log)).toThrow(/\(10, 0\) appears at both positions 0 and 1/);
    expect(() => orderCoopTimeline(log)).toThrow(/claimed by two records/);
  });
});

describe("orderCoopTimeline — the interleaving normalizer", () => {
  it("sorts by tick asc then seq asc, without mutating the input", () => {
    const input = logicalTimeline().reverse();
    const ordered = orderCoopTimeline(input);
    expect(input.map((r) => r.participantId)).toEqual(logicalTimeline().reverse().map((r) => r.participantId));
    expect(ordered.map((r) => [r.tick, r.seq])).toEqual([[10n, 0], [10n, 1], [12n, 0], [25n, 0], [25n, 1], [31n, 0]]);
  });

  it("is idempotent and keeps already-ordered logs as-is", () => {
    const canon = logicalTimeline();
    expect(orderCoopTimeline(canon)).toEqual(canon);
    expect(orderCoopTimeline(orderCoopTimeline(canon))).toEqual(canon);
  });
});

describe("parseCoopTimelineRecord — strict boundary", () => {
  it("accepts a record decoded from canonical JSON (bigint tick preserved)", () => {
    const wire = coopTimelineRecordToWire(rec("p-ana", 42n, 3, "sightline", { node: "n1", weight: 1_000_000_000_000n }));
    const text = encodeCanonicalJson(wire);
    const parsed = parseCoopTimelineRecord(decodeCanonicalJson(text));
    expect(parsed.tick).toBe(42n);
    expect(parsed.seq).toBe(3);
    expect(parsed.kind).toBe("sightline");
    expect(parsed.payload["weight"]).toBe(1_000_000_000_000n);
    // payload stays OPAQUE — the timeline stores, the transport interprets
    expect(parsed.payload["node"]).toBe("n1");
  });

  it("refuses string ticks, bad kinds, negative/fractional seqs, missing payloads", () => {
    const good = coopTimelineRecordToWire(rec("p-ana", 42n, 0));
    expect(() => parseCoopTimelineRecord({ ...good, tick: "42" })).toThrow(/expected bigint/);
    expect(() => parseCoopTimelineRecord({ ...good, kind: "betrayal" })).toThrow(/not in \{action\|sightline\|note\}/);
    expect(() => parseCoopTimelineRecord({ ...good, seq: -1 })).toThrow(/safe integer/);
    expect(() => parseCoopTimelineRecord({ ...good, seq: 1.5 })).toThrow(/safe integer/);
    expect(() => parseCoopTimelineRecord({ ...good, participantId: "" })).toThrow(/non-empty string/);
    const { payload: _dropped, ...noPayload } = good;
    expect(() => parseCoopTimelineRecord(noPayload)).toThrow(/payload is required but missing|payload/);
    expect(COOP_TIMELINE_KINDS).toEqual(["action", "sightline", "note"]);
  });
});

describe("wire form", () => {
  it("coopTimelineToWire is key-ordered and round-trips through canonical JSON", () => {
    const wire = coopTimelineToWire(logicalTimeline());
    expect(Object.keys(wire[0] as object)).toEqual(["participantId", "tick", "seq", "kind", "payload"]);
    const back = (decodeCanonicalJson(encodeCanonicalJson(wire)) as Record<string, unknown>[]).map((r, i) => parseCoopTimelineRecord(r, `record[${i}]`));
    expect(digestCoopTimeline(back)).toBe(digestCoopTimeline(logicalTimeline()));
  });
});
