/**
 * ADR-0013 ruling 2 (OD-9) — the co-op BRANCH-NODE contract tests:
 * seat-ledger laws, the never-customers-never-cash guard, attribution
 * stamping through cap-retire, and the additive-optional wire law
 * (single-player saves must stay byte-identical).
 */

import { describe, expect, it } from "vitest";
import { asEntityId, asRunSeed, type EntityId } from "../../types";
import type { CompanyNode, MuseumExhibitRecord, ScarRecord, SeatHolder } from "../node";
import { addScar, newCompanyNode } from "../node";
import {
  COOP_BRANCH_FACETS,
  COOP_MAX_SEAT_WRITERS,
  COOP_MIN_SEAT_WRITERS,
  commitCoopAttribution,
  guardCoopAttributionBatch,
  participantSeatedAt,
  seatParticipant,
  validateCoopSeatLedger,
  vacateSeat,
  withMuseumAttribution,
  withScarAttribution,
  type CoopAttributionBatch,
  type CoopAttributionWrite,
} from "../coop";
import { canonicalJson, fromCanonicalJson } from "../canonical";
import { newSaveFile, parseSaveWire, saveFileToWire } from "../envelope";
import { assertLineageIntegrity } from "../lineage";
import { emptyLineageGraph, foundCompany } from "../lineage";
import { graphWithFounder } from "./helpers";

const id = (s: string): EntityId => asEntityId(s);

function seat(participantId: string, joinedAtTick: bigint, leftAtTick?: bigint): SeatHolder {
  return leftAtTick === undefined
    ? { participantId: id(participantId), joinedAtTick }
    : { participantId: id(participantId), joinedAtTick, leftAtTick };
}

function twoWriterLedger() {
  return { seatHolders: [seat("p-ana", 0n), seat("p-bo", 5n)] };
}

function scar(overrides: Omit<Partial<ScarRecord>, "id"> & { id: string }): ScarRecord {
  return {
    originEventRef: "cause-x",
    acquiredAtTick: 90n,
    modifierPayload: {},
    clearance: { rule: "90_clean_days", progress: 0 },
    disclosure: "disclosed",
    payoffGrant: null,
    mapPosition: null,
    ...overrides,
    id: id(overrides.id),
  };
}

function exhibit(overrides: Omit<Partial<MuseumExhibitRecord>, "id"> & { id: string }): MuseumExhibitRecord {
  return {
    sourceFacet: "postmortems",
    sourceRef: "pm-1",
    runId: id("run-1"),
    runSeed: asRunSeed(7n),
    acquiredAtTick: 50n,
    deprecated: false,
    memorialNote: null,
    ...overrides,
    title: overrides.title ?? "t",
    id: id(overrides.id),
  };
}

function coopNode(ledger = twoWriterLedger()): CompanyNode {
  return newCompanyNode({
    id: "co-coop", parentId: null, name: "Shared Pipe", eraOrigin: "dial-up",
    foundedAtTick: 0n, successionType: "found", coop: ledger,
  });
}

function batch(committedAtTick: bigint, writes: readonly CoopAttributionWrite[]): CoopAttributionBatch {
  return { runId: id("run-coop-1"), committedAtTick, writes };
}

describe("validateCoopSeatLedger — structural seat laws", () => {
  it("accepts a legal 2-writer ledger and a full 4-seat house", () => {
    expect(() => validateCoopSeatLedger(twoWriterLedger())).not.toThrow();
    const four = { seatHolders: [seat("a", 0n), seat("b", 1n), seat("c", 2n), seat("d", 3n)] };
    expect(() => validateCoopSeatLedger(four)).not.toThrow();
    expect(COOP_MAX_SEAT_WRITERS).toBe(4);
  });

  it("refuses the empty ledger — a co-op node records at least one writer", () => {
    expect(() => validateCoopSeatLedger({ seatHolders: [] })).toThrow(/empty/);
  });

  it("refuses the same participant twice (v0: one tenure row per participant)", () => {
    const dup = { seatHolders: [seat("p-ana", 0n), seat("p-ana", 5n)] };
    expect(() => validateCoopSeatLedger(dup)).toThrow(/twice/);
  });

  it("refuses joinedAtTick that does not ascend in array order (append-only history)", () => {
    const bad = { seatHolders: [seat("a", 9n), seat("b", 3n)] };
    expect(() => validateCoopSeatLedger(bad)).toThrow(/not after joinedAtTick|joinedAtTick/);
  });

  it("refuses a tenure that left at or before it joined", () => {
    const bad = { seatHolders: [seat("a", 9n, 9n)] };
    expect(() => validateCoopSeatLedger(bad)).toThrow(/leftAtTick/);
  });

  it("refuses five simultaneous open seats — the branch company seats at most four", () => {
    const five = { seatHolders: [seat("a", 0n), seat("b", 1n), seat("c", 2n), seat("d", 3n), seat("e", 4n)] };
    expect(() => validateCoopSeatLedger(five)).toThrow(/5 simultaneous writers/);
  });

  it("counts overlaps half-open: a vacated seat frees its slot before the next join", () => {
    const relay = { seatHolders: [seat("a", 0n, 10n), seat("b", 10n), seat("c", 11n), seat("d", 12n), seat("e", 13n)] };
    // a left at 10 (exclusive), so from tick 10 onward b..e = 4 open — legal.
    expect(() => validateCoopSeatLedger(relay)).not.toThrow();
  });
});

describe("seatParticipant / vacateSeat / participantSeatedAt — pure ledger ops", () => {
  it("seating appends and re-validates; the input ledger is never mutated", () => {
    const base = twoWriterLedger();
    const next = seatParticipant(base, seat("p-ci", 20n));
    expect(base.seatHolders).toHaveLength(2);
    expect(next.seatHolders).toHaveLength(3);
    expect(seatParticipant(undefined, seat("solo", 0n)).seatHolders).toHaveLength(1);
    expect(() => seatParticipant(base, seat("p-ana", 30n))).toThrow(/twice/);
  });

  it("vacate closes the open tenure; double-leave and ghost-leave throw", () => {
    const base = twoWriterLedger();
    const closed = vacateSeat(base, "p-bo" as EntityId, 40n);
    expect(closed.seatHolders[1]?.leftAtTick).toBe(40n);
    expect(() => vacateSeat(closed, "p-bo" as EntityId, 50n)).toThrow(/already left/);
    expect(() => vacateSeat(base, "p-ghost" as EntityId, 1n)).toThrow(/no seat row/);
    expect(() => vacateSeat(base, "p-ana" as EntityId, 0n)).toThrow(/not after joinedAtTick/);
  });

  it("seating window is half-open [joined, left)", () => {
    const relay = vacateSeat(twoWriterLedger(), "p-bo" as EntityId, 40n);
    expect(participantSeatedAt(relay, "p-bo" as EntityId, 5n)).toBe(true);
    expect(participantSeatedAt(relay, "p-bo" as EntityId, 39n)).toBe(true);
    expect(participantSeatedAt(relay, "p-bo" as EntityId, 40n)).toBe(false);
    expect(participantSeatedAt(relay, "p-ana" as EntityId, 10_000n)).toBe(true);
    expect(participantSeatedAt(relay, "p-ghost" as EntityId, 5n)).toBe(false);
  });
});

describe("guardCoopAttributionBatch — never customers, never cash (ruling 2)", () => {
  it("accepts a clean two-writer scar + museum batch", () => {
    const b = batch(100n, [
      { facet: "scars", participantId: id("p-ana"), record: withScarAttribution(scar({ id: "s1" }), "p-ana" as EntityId) },
      { facet: "museum", participantId: id("p-bo"), record: withMuseumAttribution(exhibit({ id: "m1" }), "p-bo" as EntityId) },
    ]);
    expect(() => guardCoopAttributionBatch(b, twoWriterLedger())).not.toThrow();
  });

  it("refuses a batch onto a single-authored node (no seat ledger)", () => {
    const b = batch(100n, [{ facet: "scars", participantId: id("p-ana"), record: withScarAttribution(scar({ id: "s1" }), "p-ana" as EntityId) }]);
    expect(() => guardCoopAttributionBatch(b, undefined)).toThrow(/single-authored/);
  });

  it("refuses the empty batch — facts or nothing", () => {
    expect(() => guardCoopAttributionBatch(batch(100n, []), twoWriterLedger())).toThrow(/commits facts or nothing/);
  });

  it("refuses every non-branch facet BY NAME — customers and cash stay company-level", () => {
    // The TS type makes these unconstructible for honest callers; the batch
    // arrives from an untrusted seat wire, so the runtime check is the door.
    for (const facet of ["customerBooks", "finances", "reputation", "museum "]) {
      const forged = { facet, participantId: id("p-ana"), record: scar({ id: "s1" }) } as unknown as CoopAttributionWrite;
      expect(() => guardCoopAttributionBatch(batch(100n, [forged]), twoWriterLedger())).toThrow(/ADR-0013 ruling 2.*customers\/cash stay company-level/);
    }
    expect(COOP_BRANCH_FACETS).toEqual(["scars", "museum"]);
  });

  it("refuses writers the ledger does not seat at the commit tick", () => {
    const late = batch(3n, [{ facet: "scars", participantId: id("p-bo"), record: withScarAttribution(scar({ id: "s1" }), "p-bo" as EntityId) }]);
    expect(() => guardCoopAttributionBatch(late, twoWriterLedger())).toThrow(/not seated at tick 3/);
    const ghost = batch(100n, [{ facet: "scars", participantId: id("p-ghost"), record: withScarAttribution(scar({ id: "s1" }), "p-ghost" as EntityId) }]);
    expect(() => guardCoopAttributionBatch(ghost, twoWriterLedger())).toThrow(/not recorded in the seat ledger/);
  });

  it("refuses a solo ledger — co-op means at least two recorded writers", () => {
    const solo = { seatHolders: [seat("p-ana", 0n)] };
    const b = batch(100n, [{ facet: "scars", participantId: id("p-ana"), record: withScarAttribution(scar({ id: "s1" }), "p-ana" as EntityId) }]);
    expect(() => guardCoopAttributionBatch(b, solo)).toThrow(new RegExp(`at least ${COOP_MIN_SEAT_WRITERS} recorded writers`));
  });

  it("refuses missing and mismatched attribution stamps — no forged credit", () => {
    const unstamped = batch(100n, [{ facet: "scars", participantId: id("p-ana"), record: scar({ id: "s1" }) }]);
    expect(() => guardCoopAttributionBatch(unstamped, twoWriterLedger())).toThrow(/no attributedParticipantId stamp/);
    const mismatched = batch(100n, [{ facet: "scars", participantId: id("p-ana"), record: withScarAttribution(scar({ id: "s1" }), "p-bo" as EntityId) }]);
    expect(() => guardCoopAttributionBatch(mismatched, twoWriterLedger())).toThrow(/attribution forgery is refused/);
  });
});

describe("commitCoopAttribution — guard-then-apply, cap law survives", () => {
  it("routes scars through addScar and carries attribution into the retire row", () => {
    let node = coopNode();
    for (const s of ["s1", "s2", "s3", "s4"]) {
      node = commitCoopAttribution(node, batch(100n, [
        { facet: "scars", participantId: id("p-ana"), record: withScarAttribution(scar({ id: s, acquiredAtTick: 100n }), "p-ana" as EntityId) },
      ]));
    }
    expect(node.scars.map((r) => r.id)).toEqual(["s4", "s3", "s2"]);
    expect(node.scarsRetired).toHaveLength(1);
    expect(node.scarsRetired[0]?.id).toBe("s1");
    expect(node.scarsRetired[0]?.attributedParticipantId).toBe("p-ana");
  });

  it("appends museum exhibits without limit (no-destroy law)", () => {
    let node = coopNode();
    node = commitCoopAttribution(node, batch(10n, [
      { facet: "museum", participantId: id("p-bo"), record: withMuseumAttribution(exhibit({ id: "m1" }), "p-bo" as EntityId) },
      { facet: "museum", participantId: id("p-ana"), record: withMuseumAttribution(exhibit({ id: "m2" }), "p-ana" as EntityId) },
    ]));
    expect(node.museum.map((m) => m.id)).toEqual(["m1", "m2"]);
    expect(node.museum[0]?.attributedParticipantId).toBe("p-bo");
  });

  it("is all-or-nothing: a poisoned second write commits nothing", () => {
    const node = coopNode();
    const poisoned = batch(100n, [
      { facet: "scars", participantId: id("p-ana"), record: withScarAttribution(scar({ id: "s-ok" }), "p-ana" as EntityId) },
      { facet: "finances", participantId: id("p-bo"), record: exhibit({ id: "cash-grab" }) } as unknown as CoopAttributionWrite,
    ]);
    expect(() => commitCoopAttribution(node, poisoned)).toThrow(/facet "finances"/);
    expect(node.scars).toHaveLength(0);
    expect(node.museum).toHaveLength(0);
  });

  it("plain addScar without attribution stays key-free (Law: absent ≠ null)", () => {
    const node = addScar(newCompanyNode({ id: "co-sp", parentId: null, name: "Solo", eraOrigin: "dial-up", foundedAtTick: 0n, successionType: "found" }), scar({ id: "s1" }));
    expect("attributedParticipantId" in (node.scars[0] as object)).toBe(false);
  });
});

describe("wire round-trip — additive-optional, digest-stable single-player", () => {
  function saveWith(node: CompanyNode) {
    const { graph } = graphWithFounder(node);
    return { ...newSaveFile({ saveId: "sv-1", engineVersion: "e", simContract: "c", createdAtTick: 0n }), lineage: graph };
  }

  it("coop ledger + attribution stamps survive save → canonical wire → parse", () => {
    const node = commitCoopAttribution(coopNode(), batch(100n, [
      { facet: "scars", participantId: id("p-ana"), record: withScarAttribution(scar({ id: "s1" }), "p-ana" as EntityId) },
      { facet: "museum", participantId: id("p-bo"), record: withMuseumAttribution(exhibit({ id: "m1" }), "p-bo" as EntityId) },
    ]));
    const text = canonicalJson(saveFileToWire(saveWith(node)));
    const revived = parseSaveWire(fromCanonicalJson(text));
    const back = revived.lineage.nodes.get("co-coop" as EntityId);
    expect(back?.coop?.seatHolders.map((s) => [s.participantId, s.joinedAtTick, s.leftAtTick])).toEqual([["p-ana", 0n, undefined], ["p-bo", 5n, undefined]]);
    expect(back?.scars[0]?.attributedParticipantId).toBe("p-ana");
    expect(back?.museum[0]?.attributedParticipantId).toBe("p-bo");
    // re-serializing the parsed node must be byte-identical (idempotent wire)
    expect(canonicalJson(saveFileToWire(revived))).toBe(text);
  });

  it("a single-player node carries NO coop key — its wire bytes are untouched", () => {
    const sp = newCompanyNode({ id: "co-sp", parentId: null, name: "Solo", eraOrigin: "dial-up", foundedAtTick: 0n, successionType: "found" });
    const wire = saveFileToWire(saveWith(sp));
    const nodeWire = (wire.lineage as { nodes: Record<string, unknown>[] }).nodes[0];
    expect("coop" in (nodeWire as object)).toBe(false);
    expect("attributedParticipantId" in (sp as unknown as object)).toBe(false);
  });

  it("missing ≡ null absorbs: leftAtTick:null parses to absent (S-12 law)", () => {
    const node = coopNode();
    const wire = saveFileToWire(saveWith(node)) as unknown as {
      lineage: { nodes: { coop?: { seatHolders: Record<string, unknown>[] } }[] };
    };
    const firstSeat = wire.lineage.nodes[0]?.["coop"]?.["seatHolders"][0];
    if (firstSeat === undefined) throw new Error("fixture lost its coop seat");
    firstSeat["leftAtTick"] = null;
    const revived = parseSaveWire(fromCanonicalJson(canonicalJson(wire)));
    expect(revived.lineage.nodes.get("co-coop" as EntityId)?.coop?.seatHolders[0]?.leftAtTick).toBeUndefined();
  });

  it("assertLineageIntegrity re-checks the seat ledger on every parsed graph", () => {
    const illegal = { ...emptyLineageGraph() };
    const bad = coopNode({ seatHolders: [] });
    const { graph } = foundCompany(illegal, { id: bad.id, name: "X", eraOrigin: "dial-up", foundedAtTick: 0n });
    const nodes = new Map(graph.nodes);
    nodes.set(bad.id, bad);
    expect(() => assertLineageIntegrity({ ...graph, nodes })).toThrow(/seat ledger is empty/);
  });
});
