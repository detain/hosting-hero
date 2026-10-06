/**
 * topology/ test suite — the eight mandated scenarios plus boundary guards.
 * Names read as the game laws they prove.
 */

import { describe, it, expect } from "vitest";
import { asEntityId, asMoney } from "../../types";
import type { EntityId, MoneyUnit } from "../../types";
import { createGraph, powerFeeds, feedAncestorOfKind, dataDescendants, paintTrust, compareIds } from "../graph";
import type { TopologyGraph, TrustGrant } from "../graph";
import {
  createPhysicalIndex,
  classifyPlacement,
  adjacencyTypicalUs,
  ADJACENCY_LATENCY_TABLE,
  derate80,
  thermalCouplingFixed,
  AdjacencyClass,
} from "../physical";
import type { PhysicalIndex, PlacementRecord, RackRecord, FacilityRecord } from "../physical";
import { buildDomainSet, projectionVersion } from "../domains";
import { createBlastComputer, computeBlast, computePersonBlast } from "../blast";
import { parseLink, negotiateDown, findTimeoutViolations, createLinkRegistry } from "../link";
import { assessRedundancy, maxIndependentSet } from "../redundancy";
import { linkIsLegalFor, pathLegality } from "../contract";
import {
  socketsFit,
  refusalReason,
  parseSocket,
  socketCompatibility,
  validateConnections,
  mirror,
  canConnect,
  SOCKET_PROTOCOLS,
} from "../sockets";
import type { LinkRecord } from "../link";
import type { RoutingContract } from "../contract";
import type { SocketEndpoints } from "../sockets";

const e = (s: string): EntityId => asEntityId(s);
const money = (n: number): MoneyUnit => asMoney(BigInt(n));

/* ═══════════ shared fixtures ═══════════ */

/** geography-blind test: far node depends on DB, near node shares nothing. */
function geographyGraph() {
  const g = createGraph();
  g.addNode({ id: e("db"), kind: "server", customers: 10, mrrMicroUsd: money(100) });
  g.addNode({ id: e("api"), kind: "server", customers: 5, mrrMicroUsd: money(50) });
  g.addNode({ id: e("far"), kind: "server", customers: 7, mrrMicroUsd: money(70) }); // tokyo
  g.addNode({ id: e("pdu-a"), kind: "pdu" });
  g.addNode({ id: e("pdu-b"), kind: "pdu" });
  // far DEPENDS ON db but lives nowhere near it (unplaced) — geography must
  // not gate the flood
  g.addEdge({ kind: "data", from: e("far"), to: e("db") });
  g.addEdge({ kind: "data", from: e("api"), to: e("db") });
  // THE TRAP: "redundant" api feeds off pdu-a, and so does db
  g.addEdge({ kind: "power", from: e("pdu-a"), to: e("db"), slot: e("outlet-1") });
  g.addEdge({ kind: "power", from: e("pdu-b"), to: e("api"), slot: e("outlet-1") });
  return g;
}

function placement(node: EntityId, rack: EntityId, uStart: number, powerDrawMw: bigint | null = null): PlacementRecord {
  return { node, rack, uStart, uHeight: 1, weightGrams: 1000, powerDrawMw };
}

const rackA: RackRecord = { id: e("rack-a"), facility: e("fac-1"), floor: 0, row: 0, position: 0, capacityU: 42, ratedFloorLoadGrams: 50_000 };
const rackB: RackRecord = { id: e("rack-b"), facility: e("fac-1"), floor: 0, row: 0, position: 1, capacityU: 42, ratedFloorLoadGrams: 50_000 };
const rackC: RackRecord = { id: e("rack-c"), facility: e("fac-1"), floor: 0, row: 0, position: 5, capacityU: 42, ratedFloorLoadGrams: 50_000 };
const fac1: FacilityRecord = { id: e("fac-1"), region: "eu-west" };

const rackOf = (id: EntityId): RackRecord | null => [rackA, rackB, rackC].find((r) => r.id === id) ?? null;
const facOf = (id: EntityId): FacilityRecord | null => (id === fac1.id ? fac1 : null);

/* ═══════════ 1 · blast ignores geography, catches shared PDU ═══════════ */

describe("blast radius", () => {
  it("floods across geography but not across empty space", () => {
    const g = geographyGraph();
    const index = createPhysicalIndex(); // NOTHING placed — pure geography void
    const blast = computeBlast(g, buildDomainSet(g, index), e("db"));
    expect(blast.affected).toContain(e("api"));
    expect(blast.affected).toContain(e("far")); // tokyo still dies
    expect(blast.affected).not.toContain(e("pdu-b")); // power feeds don't flood upward
    expect(blast.customerCount).toBe(22); // 10 + 5 + 7
    expect(blast.mrrMicroUsd).toBe(money(220));
  });

  it("tripping a shared PDU kills both 'redundant' services at once", () => {
    const g = geographyGraph();
    const index = createPhysicalIndex();
    // anchor db's outlet to the same circuit api uses: db on pdu-a AND
    // api's backup feed also on pdu-a → one circuit, two PSUs
    g.addEdge({ kind: "power", from: e("pdu-a"), to: e("api"), slot: e("outlet-2") });
    index.registerFacility(fac1);
    index.registerRack(rackA);
    index.registerCircuit({ node: e("pdu-a"), ratedMw: 1000n });
    const blast = computeBlast(g, buildDomainSet(g, index), e("pdu-a"));
    expect(blast.affected).toContain(e("db"));
    expect(blast.affected).toContain(e("api")); // killed via shared circuit
    expect(blast.affected).toContain(e("far")); // and its dependents
    expect(blast.viaDomains).toContain(e("domain:pdu:pdu-a"));
  });

  it("cache returns identical objects until the graph mutates", () => {
    const g = geographyGraph();
    const index = createPhysicalIndex();
    const computer = createBlastComputer(g, index);
    const first = computer.radiusOf(e("db"));
    const again = computer.radiusOf(e("db"));
    expect(again).toBe(first); // same reference — cache hit
    g.addNode({ id: e("new"), kind: "server" });
    const after = computer.radiusOf(e("db"));
    expect(after).not.toBe(first); // version bumped — recomputed
    expect(after.affected).toEqual(first.affected); // (same set here: no edges)
  });
});

/* ═══════════ 2 · two PSUs, one PDU trap ═══════════ */

describe("two-PSU-one-PDU trap", () => {
  it("powerFeeds exposes both chains sharing the PDU node", () => {
    const g = createGraph();
    g.addNode({ id: e("srv"), kind: "server" });
    g.addNode({ id: e("psu1"), kind: "psu" });
    g.addNode({ id: e("psu2"), kind: "psu" });
    g.addNode({ id: e("pdu"), kind: "pdu" });
    g.addEdge({ kind: "power", from: e("psu1"), to: e("srv"), slot: e("psu-in-a") });
    g.addEdge({ kind: "power", from: e("psu2"), to: e("srv"), slot: e("psu-in-b") });
    g.addEdge({ kind: "power", from: e("pdu"), to: e("psu1"), slot: e("feed") });
    g.addEdge({ kind: "power", from: e("pdu"), to: e("psu2"), slot: e("feed") });
    const feeds = powerFeeds(g, e("srv"));
    expect(feeds).toHaveLength(2);
    for (const feed of feeds) expect(feed.chain).toContain(e("pdu"));
    // the trap: killing the pdu kills BOTH supplies → blast collapses redundancy
    const blast = computeBlast(g, buildDomainSet(g, createPhysicalIndex()), e("pdu"));
    expect(blast.affected).toContain(e("srv"));
  });

  it("graph refuses two suppliers on one socket", () => {
    const g = createGraph();
    g.addNode({ id: e("srv"), kind: "server" });
    g.addNode({ id: e("pdu-a"), kind: "pdu" });
    g.addNode({ id: e("pdu-b"), kind: "pdu" });
    g.addEdge({ kind: "power", from: e("pdu-a"), to: e("srv"), slot: e("outlet-1") });
    expect(() =>
      g.addEdge({ kind: "power", from: e("pdu-b"), to: e("srv"), slot: e("outlet-1") }),
    ).toThrow(/already fed/);
  });

  it("graph refuses power cycles", () => {
    const g = createGraph();
    g.addNode({ id: e("a"), kind: "pdu" });
    g.addNode({ id: e("b"), kind: "pdu" });
    g.addEdge({ kind: "power", from: e("a"), to: e("b"), slot: e("s1") });
    expect(() => g.addEdge({ kind: "power", from: e("b"), to: e("a"), slot: e("s2") })).toThrow(/cycle/);
  });
});

/* ═══════════ 3 · Broken N+1 on shared software version ═══════════ */

describe("redundancy", () => {
  it("two replicas one CVE: N+1 is broken by software correlation", () => {
    const g = createGraph();
    g.addNode({ id: e("w1"), kind: "server", template: "nginx", softwareVersion: "1.25.3" });
    g.addNode({ id: e("w2"), kind: "server", template: "nginx", softwareVersion: "1.25.3" });
    const verdict = assessRedundancy(g, {
      id: e("web"),
      label: "web tier",
      members: [e("w1"), e("w2")],
      claimedN: 1, // claims 1+1
    });
    expect(verdict.broken).toBe(true);
    expect(verdict.domain).toBe("software");
    expect(verdict.effectiveCount).toBe(1);
    expect(verdict.reason).toMatch(/nginx@1\.25\.3/);
  });

  it("version-patched sibling releases the correlation", () => {
    const g = createGraph();
    g.addNode({ id: e("w1"), kind: "server", template: "nginx", softwareVersion: "1.25.3" });
    g.addNode({ id: e("w2"), kind: "server", template: "nginx", softwareVersion: "1.25.4" });
    const verdict = assessRedundancy(g, { id: e("web"), label: "web", members: [e("w1"), e("w2")], claimedN: 1 });
    expect(verdict.broken).toBe(false);
    expect(verdict.effectiveCount).toBe(2);
  });

  it("two services on one directory = one service (shared power circuit)", () => {
    const g = createGraph();
    g.addNode({ id: e("s1"), kind: "server" });
    g.addNode({ id: e("s2"), kind: "server" });
    g.addNode({ id: e("pdu"), kind: "pdu" });
    g.addEdge({ kind: "power", from: e("pdu"), to: e("s1"), slot: e("o1") });
    g.addEdge({ kind: "power", from: e("pdu"), to: e("s2"), slot: e("o2") });
    const verdict = assessRedundancy(g, { id: e("pair"), label: "order DBs", members: [e("s1"), e("s2")], claimedN: 1 });
    expect(verdict.broken).toBe(true);
    expect(verdict.domain).toBe("power");
  });

  it("shared human (one admin domain) breaks N+1", () => {
    const g = createGraph();
    g.addNode({ id: e("s1"), kind: "server" });
    g.addNode({ id: e("s2"), kind: "server" });
    g.addNode({ id: e("admin"), kind: "person" });
    g.addEdge({ kind: "control", from: e("admin"), to: e("s1"), domain: "ops" });
    g.addEdge({ kind: "control", from: e("admin"), to: e("s2"), domain: "ops" });
    const verdict = assessRedundancy(g, { id: e("pair"), label: "kv store", members: [e("s1"), e("s2")], claimedN: 1 });
    expect(verdict.broken).toBe(true);
    expect(verdict.domain).toBe("human");
  });

  it("shared change window breaks N+1 (time correlation)", () => {
    const g = createGraph();
    g.addNode({ id: e("s1"), kind: "server", changeWindow: "tue-0200" });
    g.addNode({ id: e("s2"), kind: "server", changeWindow: "tue-0200" });
    const verdict = assessRedundancy(g, { id: e("pair"), label: "cache", members: [e("s1"), e("s2")], claimedN: 1 });
    expect(verdict.broken).toBe(true);
    expect(verdict.domain).toBe("time");
  });

  it("independent replicas pass; unknown member fails loud", () => {
    const g = createGraph();
    g.addNode({ id: e("s1"), kind: "server", template: "a" });
    g.addNode({ id: e("s2"), kind: "server", template: "b" });
    const ok = assessRedundancy(g, { id: e("pair"), label: "p", members: [e("s1"), e("s2")], claimedN: 1 });
    expect(ok.ok).toBe(true);
    expect(() =>
      assessRedundancy(g, { id: e("bad"), label: "b", members: [e("s1"), e("ghost")], claimedN: 1 }),
    ).toThrow(/not in the graph/);
  });
});

/* ═══════════ 4 · timeout monotonicity ═══════════ */

describe("timeout monotonicity", () => {
  const link = (edge: EntityId, rated: number, timeoutUs: bigint | null): LinkRecord =>
    parseLink({ edge, ratedMbps: rated, negotiatedMbps: rated, latencyUs: 100n, beads: [], timeoutUs, tags: [] });

  it("catches the classic edge>db violation: web→api clamped tighter than api→db", () => {
    const g = createGraph();
    for (const id of ["web", "api", "db"]) g.addNode({ id: e(id), kind: "server" });
    g.addEdge({ id: e("edge-web-api"), kind: "data", from: e("web"), to: e("api") });
    g.addEdge({ id: e("edge-api-db"), kind: "data", from: e("api"), to: e("db") });
    const links = [link(e("edge-web-api"), 10_000, 100_000n), link(e("edge-api-db"), 10_000, 200_000n)];
    const violations = findTimeoutViolations(g, links);
    expect(violations).toHaveLength(1);
    expect(violations[0]?.outer).toBe(e("edge-web-api"));
    expect(violations[0]?.inner).toBe(e("edge-api-db"));
    expect(violations[0]?.requiredOuterUs).toBe(200_101n);
  });

  it("monotone chain passes clean", () => {
    const g = createGraph();
    for (const id of ["web", "api", "db"]) g.addNode({ id: e(id), kind: "server" });
    g.addEdge({ id: e("edge-web-api"), kind: "data", from: e("web"), to: e("api") });
    g.addEdge({ id: e("edge-api-db"), kind: "data", from: e("api"), to: e("db") });
    const links = [link(e("edge-web-api"), 10_000, 500_000n), link(e("edge-api-db"), 10_000, 200_000n)];
    expect(findTimeoutViolations(g, links)).toHaveLength(0);
  });

  it("hops without an hourglass bead are skipped", () => {
    const g = createGraph();
    for (const id of ["web", "api"]) g.addNode({ id: e(id), kind: "server" });
    g.addNode({ id: e("db"), kind: "server" });
    g.addEdge({ id: e("e1"), kind: "data", from: e("web"), to: e("api") });
    g.addEdge({ id: e("e2"), kind: "data", from: e("api"), to: e("db") });
    const links = [link(e("e1"), 10_000, 50_000n), link(e("e2"), 10_000, null)];
    expect(findTimeoutViolations(g, links)).toHaveLength(0);
  });
});

/* ═══════════ 5 · negotiated-down speed ═══════════ */

describe("link objects", () => {
  it("flags the 25G optic running silent at 10G", () => {
    const down = negotiateDown(
      parseLink({ edge: e("e1"), ratedMbps: 25_000, negotiatedMbps: 10_000, latencyUs: 500n, beads: ["tls"], timeoutUs: null, tags: [] }),
    );
    expect(down).not.toBeNull();
    expect(down?.lossMbps).toBe(15_000);
  });

  it("no telemetry is not a finding; full speed is not a finding", () => {
    const base = { edge: e("e1"), ratedMbps: 25_000, latencyUs: 500n, beads: [], timeoutUs: null, tags: [] } as const;
    expect(negotiateDown(parseLink({ ...base, negotiatedMbps: null }))).toBeNull();
    expect(negotiateDown(parseLink({ ...base, negotiatedMbps: 25_000 }))).toBeNull();
  });

  it("bead alphabet is closed — invented beads die at parse", () => {
    const base = { edge: e("e1"), ratedMbps: 1_000, negotiatedMbps: 1_000, latencyUs: 0n, timeoutUs: null, tags: [] } as const;
    expect(() => parseLink({ ...base, beads: ["magic"] })).toThrow(/unknown policy bead/);
    expect(() => parseLink({ ...base, beads: ["tls", "tls"] })).toThrow(/duplicate bead/);
  });

  it("registry dedupes and sorts deterministically", () => {
    const reg = createLinkRegistry();
    const mk = (edge: string, rated: number, negotiated: number) =>
      reg.attach({ edge: e(edge), ratedMbps: rated, negotiatedMbps: negotiated, latencyUs: 10n, beads: [], timeoutUs: null, tags: [] });
    mk("edge-z", 25_000, 10_000);
    mk("edge-a", 1_000, 1_000);
    mk("edge-m", 40_000, 10_000);
    expect(reg.downgrades().map((f) => f.link)).toEqual([e("edge-m"), e("edge-z")]);
    expect(() => mk("edge-z", 100, 100)).toThrow(/already has a link/);
  });
});

/* ═══════════ 6 · needs/provides refuses db-out → http-in ═══════════ */

describe("typed sockets", () => {
  it("mirror pairs fit, crossed kinds refuse (db client ≠ http server)", () => {
    expect(socketsFit(["http-out"], ["http-in"])).toBe(true);
    expect(socketsFit(["sql-out"], ["http-in"])).toBe(false); // a DB dialer cannot plug into a listener of another protocol
    expect(refusalReason(["sql-out"], ["http-in"])).toMatch(/wrong socket type/);
  });

  it("parse rejects non-grammar socket names", () => {
    expect(() => parseSocket("db-out")).toThrow(/not a typed socket/); // db is not a protocol stem
    expect(() => parseSocket("http-side")).toThrow(/not a typed socket/);
    expect(parseSocket("http-out")).toEqual({ protocol: "http", direction: "out" });
  });

  it("compatibility matrix is coherent with socketsFit ×100 seeds", () => {
    const matrix = socketCompatibility();
    expect(matrix.get("http-out>http-in")).toBe(true);
    expect(matrix.get("http-in>http-out")).toBe(true); // a listener can dial nothing… mirror is symmetric
    expect(matrix.get("sql-out>http-in")).toBe(false);
    // every true cell must equal socketsFit on the same pair
    let checked = 0;
    for (const [key, value] of matrix) {
      const [needs, provides] = key.split(">") as [string, string];
      expect(socketsFit([needs], [provides])).toBe(value);
      checked += 1;
    }
    expect(checked).toBe(256); // 16 names × 16 names
  });

  it("validateConnections reports illegal seed edges, sorted", () => {
    const endpoints = new Map<EntityId, SocketEndpoints>([
      [e("web"), { needs: ["http-out"], provides: ["http-in"] }],
      [e("db"), { needs: ["sql-out"], provides: ["sql-in"] }],
    ]);
    const failures = validateConnections(
      [
        { from: e("web"), to: e("db") }, // web needs http-out… db speaks sql-in ⇒ refuse
        { from: e("db"), to: e("web") }, // db needs sql-out, web has http-in… refuse too
      ],
      (n) => endpoints.get(n) ?? null,
    );
    expect(failures).toHaveLength(2);
    expect(failures[0]?.reason).toContain("needs sql-in"); // db→web first (sorted): dials sql, web listens http
  });
});

/* ═══════════ 7 · flood cache determinism ×100 digest ═══════════ */

describe("determinism", () => {
  function digestBlasts(): string {
    const g = geographyGraph();
    const index = createPhysicalIndex();
    index.registerFacility(fac1);
    index.registerRack(rackA);
    index.registerCircuit({ node: e("pdu-a"), ratedMw: 2000n });
    const computer = createBlastComputer(g, index);
    let acc = 2166136261n; // FNV-1a 32 offset, kept bigint for exact mixing
    const mix = (s: string): void => {
      for (let i = 0; i < s.length; i += 1) {
        acc ^= BigInt(s.charCodeAt(i));
        acc = (acc * 16777619n) & 0xffffffffn;
      }
      acc ^= 0x9e3779b9n;
      acc &= 0xffffffffn;
    };
    for (const node of g.nodeIds()) {
      const r = computer.radiusOf(node);
      mix(`${r.anchor}:${r.affected.join(",")}|${r.degraded.join(",")}|${r.viaDomains.join(",")}:${r.customerCount}:${r.mrrMicroUsd}`);
    }
    return acc.toString(16);
  }

  it("×100 fresh-cache runs of identical graphs digest identically", () => {
    const first = digestBlasts();
    for (let i = 0; i < 99; i += 1) expect(digestBlasts()).toBe(first);
  });

  it("cached vs uncached answers agree", () => {
    const g = geographyGraph();
    const index = createPhysicalIndex();
    const computer = createBlastComputer(g, index);
    expect(computer.radiusOf(e("db"))).toEqual(computer.radiusUncached(e("db")));
  });
});

/* ═══════════ 8 · adjacency latency symmetry ═══════════ */

describe("physical index", () => {
  it("adjacency classification is symmetric", () => {
    const p1 = placement(e("n1"), rackA.id, 1);
    const p2 = placement(e("n2"), rackB.id, 5);
    const forward = classifyPlacement(p1, p2, rackOf, facOf);
    const backward = classifyPlacement(p2, p1, rackOf, facOf);
    expect(forward).toBe(backward);
    expect(forward).toBe(AdjacencyClass.AdjacentRacks);
    expect(adjacencyTypicalUs(forward)).toBe(adjacencyTypicalUs(backward));
  });

  it("whole table classifies symmetrically for every rack pair", () => {
    const nodes = [e("n1"), e("n2"), e("n3")];
    const racks = [rackA, rackB, rackC];
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = 0; j < nodes.length; j += 1) {
        const a = placement(nodes[i] as EntityId, (racks[i] as RackRecord).id, 1);
        const b = placement(nodes[j] as EntityId, (racks[j] as RackRecord).id, 2);
        expect(classifyPlacement(a, b, rackOf, facOf)).toBe(classifyPlacement(b, a, rackOf, facOf));
      }
    }
    // every authored row has a usable typical value
    for (const row of ADJACENCY_LATENCY_TABLE) {
      expect(typeof adjacencyTypicalUs(row.adjacency)).toBe("bigint");
    }
  });

  it("circuit budget: 80% derate bites and over-draw is visible", () => {
    const index = createPhysicalIndex();
    index.registerFacility(fac1);
    index.registerRack(rackA);
    index.registerCircuit({ node: e("pdu-a"), ratedMw: 1000n });
    expect(derate80(1000n)).toBe(800n);
    index.placeDevice(placement(e("s1"), rackA.id, 1, 500n));
    index.placeDevice(placement(e("s2"), rackA.id, 2, 400n));
    const ok = index.circuitBudget(e("pdu-a"), [e("s1")]);
    expect(ok.headroomMw).toBe(300n);
    expect(ok.overCap).toBe(false);
    const hot = index.circuitBudget(e("pdu-a"), [e("s1"), e("s2")]);
    expect(hot.overCap).toBe(true); // 900 > 800 — rated 1000 felt safe; derate tells truth
    expect(hot.headroomMw).toBe(-100n);
  });

  it("U-Tetris collision is refused", () => {
    const index = createPhysicalIndex();
    index.registerFacility(fac1);
    index.registerRack(rackA);
    index.placeDevice({ node: e("s1"), rack: rackA.id, uStart: 5, uHeight: 2, weightGrams: 1, powerDrawMw: null });
    expect(() => index.placeDevice(placement(e("s2"), rackA.id, 6))).toThrow(/U-Tetris collision/);
    expect(index.findGap(rackA.id, 2)).toBe(1);
    index.removeDevice(e("s1"));
    expect(index.findGap(rackA.id, 42)).toBe(1);
  });

  it("thermal coupling decays 1/2, 1/4, zero", () => {
    expect(thermalCouplingFixed(1)).toBeGreaterThan(0n);
    expect(thermalCouplingFixed(2) * 2n).toBe(thermalCouplingFixed(1));
    expect(thermalCouplingFixed(3)).toBe(0n);
  });

  it("floor load verdicts sum placements", () => {
    const index = createPhysicalIndex();
    index.registerFacility(fac1);
    index.registerRack({ ...rackA, ratedFloorLoadGrams: 2500 });
    index.placeDevice({ node: e("s1"), rack: rackA.id, uStart: 1, uHeight: 1, weightGrams: 1000, powerDrawMw: null });
    index.placeDevice({ node: e("s2"), rack: rackA.id, uStart: 2, uHeight: 1, weightGrams: 1000, powerDrawMw: null });
    index.placeDevice({ node: e("s3"), rack: rackA.id, uStart: 3, uHeight: 1, weightGrams: 1000, powerDrawMw: null });
    const verdict = index.floorLoadVerdict(fac1.id, 0, 0);
    expect(verdict.totalGrams).toBe(3000);
    expect(verdict.over).toBe(true);
  });
});

/* ═══════════ bonus · person blast + trust + contract ═══════════ */

describe("blast radius of a person", () => {
  it("bus factor counts only what NOBODY else holds", () => {
    const g = createGraph();
    g.addNode({ id: e("alice"), kind: "person" });
    g.addNode({ id: e("bob"), kind: "person" });
    g.addNode({ id: e("runbook-x"), kind: "runbook" }); // only alice
    g.addNode({ id: e("runbook-y"), kind: "runbook" }); // shared
    g.addNode({ id: e("ca"), kind: "switch" }); // trust anchor
    g.addNode({ id: e("web"), kind: "server", customers: 3, mrrMicroUsd: money(30) });
    g.addEdge({ kind: "control", from: e("alice"), to: e("runbook-x"), domain: "holder" });
    g.addEdge({ kind: "control", from: e("alice"), to: e("runbook-y"), domain: "holder" });
    g.addEdge({ kind: "control", from: e("bob"), to: e("runbook-y"), domain: "holder" });
    g.addEdge({ kind: "data", from: e("web"), to: e("runbook-y") });
    const grants: TrustGrant[] = [{ principal: e("alice"), target: e("ca"), role: "issuer" }];
    paintTrust(g, grants);
    const blast = computePersonBlast(g, e("alice"));
    expect(blast.holdings).toEqual([e("runbook-x"), e("runbook-y")]);
    expect(blast.uniquelyHeld).toEqual([e("runbook-x")]); // bob covers y
    expect(blast.busFactor).toBe(1);
    expect(blast.affected).toContain(e("ca")); // lost root of trust is lost authority
    expect(blast.customerCount).toBe(0); // web depends on the SHARED runbook — still covered
  });
});

describe("contract routing", () => {
  it("cheapest path can be contractually illegal — per-hop tag ⊇ decides", () => {
    const contract: RoutingContract = { id: e("eu-only"), requiredTags: ["eu", "pci"] };
    const legalHop = parseLink({ edge: e("e1"), ratedMbps: 1_000, negotiatedMbps: 1_000, latencyUs: 1n, beads: [], timeoutUs: null, tags: ["eu", "pci", "cheap"] });
    const illegalHop = parseLink({ edge: e("e2"), ratedMbps: 1_000, negotiatedMbps: 1_000, latencyUs: 1n, beads: [], timeoutUs: null, tags: ["us"] });
    expect(linkIsLegalFor(contract, legalHop).legal).toBe(true);
    expect(linkIsLegalFor(contract, illegalHop).missingTags).toEqual(["eu", "pci"]);
    const path = pathLegality(contract, [legalHop, illegalHop]);
    expect(path.legal).toBe(false);
    expect(path.verdicts).toHaveLength(2); // ALL hops reported, not first-fail
    expect(pathLegality({ id: e("any"), requiredTags: [] }, []).legal).toBe(true);
  });
});

/* ═══════════ ROUND-2 REVIEW FIXES · T-1, T-2, T-5, T-7, T-8, T-9, T-10, T-11 ═══════════ */

/* T-1 · blast cache must key on the (graph, physical index) PAIR */
describe("blast cache vs physical index (T-1)", () => {
  it("a placement that leaves the graph untouched invalidates the cached radius", () => {
    const g = createGraph();
    g.addNode({ id: e("db"), kind: "server" });
    g.addNode({ id: e("api"), kind: "server" });
    g.addNode({ id: e("shelf"), kind: "server" });
    g.addEdge({ kind: "data", from: e("api"), to: e("db") });
    const index = createPhysicalIndex();
    index.registerFacility(fac1);
    index.registerRack(rackA);
    const computer = createBlastComputer(g, index);
    const before = computer.radiusOf(e("db"));
    expect(before.degraded).toHaveLength(0); // nothing co-located yet
    const graphVersion = g.version;
    index.placeDevice(placement(e("shelf"), rackA.id, 1));
    index.placeDevice(placement(e("db"), rackA.id, 2));
    expect(g.version).toBe(graphVersion); // graph genuinely unchanged — old key would miss
    const after = computer.radiusOf(e("db"));
    expect(after).not.toBe(before); // the stale entry is NOT reused
    expect(after.degraded).toContain(e("shelf")); // NEW answer: rack co-resident
    expect(before.degraded).toHaveLength(0); // previously returned object intact
    expect(computer.radiusOf(e("db"))).toBe(after); // and the new version now caches
  });
});

/* T-2 · powerFeeds tie-break is a total order over full chains */
describe("powerFeeds determinism (T-2)", () => {
  it("feed order is authoring-order invariant — full-chain tiebreak", () => {
    const build = (firstUp: EntityId, secondUp: EntityId) => {
      const g = createGraph();
      for (const id of ["srv", "psu1", "dist", "pdu-a", "pdu-b"]) g.addNode({ id: e(id), kind: "server" });
      g.addEdge({ kind: "power", from: e("psu1"), to: e("srv"), slot: e("psu-in") });
      g.addEdge({ kind: "power", from: e("dist"), to: e("psu1"), slot: e("feed") });
      g.addEdge({ kind: "power", from: firstUp, to: e("dist"), slot: e("up-1") });
      g.addEdge({ kind: "power", from: secondUp, to: e("dist"), slot: e("up-2") });
      return powerFeeds(g, e("srv"));
    };
    const forward = build(e("pdu-a"), e("pdu-b"));
    const reverse = build(e("pdu-b"), e("pdu-a"));
    expect(forward).toEqual(reverse); // same feed SET ⇒ same answer, any authoring order
    expect(forward).toHaveLength(2); // one entry per upstream path
    // same slot AND same chain head+second (T-b: chains start at the direct
    // supplier psu1, then dist) → tie broken by the third link, ascending
    expect(forward[0]?.chain).toEqual([e("psu1"), e("dist"), e("pdu-a")]);
    expect(forward[1]?.chain).toEqual([e("psu1"), e("dist"), e("pdu-b")]);
  });
});

/* T-5 · maxIndependentSet enforces its own ordering contract */
describe("maxIndependentSet contract (T-5)", () => {
  const collide = (a: string, b: string): string => (a < b ? `${a}|${b}` : `${b}|${a}`);

  it("unsorted callers cannot slip past the ascending key contract", () => {
    // path a—b—c: b clashes with both ends; {a, c} is the true maximum.
    // Descending input used to build `${picked}|${candidate}` keys in
    // descending shape — missed every clash and returned all three.
    const collided = new Set([collide("a", "b"), collide("b", "c")]);
    const descending = maxIndependentSet([e("c"), e("b"), e("a")], collided);
    expect(descending).toEqual([e("a"), e("c")]);
    const ascending = maxIndependentSet([e("a"), e("b"), e("c")], collided);
    expect(ascending).toEqual(descending);
  });

  it("ties resolve to the lexicographically first maximum, from any order", () => {
    // 4-cycle a—b—c—d—a: maxima {a,c} and {b,d}; ascending DFS must always
    // land {a,c} whichever order the caller hands in.
    const collided = new Set([
      collide("a", "b"),
      collide("b", "c"),
      collide("c", "d"),
      collide("a", "d"),
    ]);
    expect(maxIndependentSet([e("a"), e("b"), e("c"), e("d")], collided)).toEqual([e("a"), e("c")]);
    expect(maxIndependentSet([e("d"), e("c"), e("b"), e("a")], collided)).toEqual([e("a"), e("c")]);
    expect(maxIndependentSet([e("c"), e("a"), e("d"), e("b")], collided)).toEqual([e("a"), e("c")]);
  });

  it("three replicas, one colliding pair: effective 2 keeps N+1", () => {
    const g = createGraph();
    g.addNode({ id: e("s1"), kind: "server", changeWindow: "tue-0200" });
    g.addNode({ id: e("s2"), kind: "server", changeWindow: "tue-0200" });
    g.addNode({ id: e("s3"), kind: "server", changeWindow: "fri-0300" });
    const verdict = assessRedundancy(g, {
      id: e("trio"),
      label: "trio",
      members: [e("s1"), e("s2"), e("s3")],
      claimedN: 1,
    });
    expect(verdict.nominalCount).toBe(3);
    expect(verdict.effectiveCount).toBe(2); // {s1, s3} — exact, not order-lottery
    expect(verdict.broken).toBe(false);
  });
});

/* T-7 · batch socket validation reports malformed vocab instead of crashing */
describe("socket vocabulary governance (T-7)", () => {
  it("malformed stems yield refusal LINES in the batch report, never a crash", () => {
    const endpoints = new Map<EntityId, SocketEndpoints>([
      [e("web"), { needs: ["http-out"], provides: ["http-in"] }],
      [e("weird"), { needs: ["quantum-out"], provides: ["quantum-in"] }],
    ]);
    let failures: readonly { from: EntityId; to: EntityId; reason: string }[] = [];
    expect(() => {
      failures = validateConnections(
        [
          { from: e("web"), to: e("weird") }, // valid grammar, wrong type → ordinary refusal
          { from: e("weird"), to: e("web") }, // undeclared stem → malformed refusal
        ],
        (n) => endpoints.get(n) ?? null,
      );
    }).not.toThrow(); // the full-report promise held
    expect(failures).toHaveLength(2);
    expect(failures.find((f) => f.from === e("web"))?.reason).toMatch(/wrong socket type/);
    expect(failures.find((f) => f.from === e("weird"))?.reason).toMatch(/malformed socket declaration/);
    expect(failures.find((f) => f.from === e("weird"))?.reason).toContain("quantum-out");
  });

  it("a declared protocol list opens the vocabulary; the default stays closed", () => {
    const declared: readonly string[] = [...SOCKET_PROTOCOLS, "db"];
    expect(() => parseSocket("db-out")).toThrow(/not a typed socket/); // closed by default
    expect(parseSocket("db-out", declared)).toEqual({ protocol: "db", direction: "out" });
    expect(mirror("db-out", declared)).toBe("db-in");
    expect(socketsFit(["db-out"], ["db-in"], declared)).toBe(true);
    expect(refusalReason(["db-out"], ["db-in"], declared)).toBeNull();
    // the header example ("db-out" ↔ "db-in") now actually runs via declaration
    expect(
      canConnect({ needs: ["db-out"], provides: [] }, { needs: [], provides: ["db-in"] }, declared),
    ).toBe(true);
  });
});

/* T-8 · FailureDomain.members stays ascending for EVERY domain, anchor included */
describe("domain member order contract (T-8)", () => {
  it("switch-domain members stay sorted when the anchor sorts AFTER its dependents", () => {
    const g = createGraph();
    g.addNode({ id: e("sw-zulu"), kind: "switch" });
    g.addNode({ id: e("api-alpha"), kind: "server" });
    g.addNode({ id: e("web-beta"), kind: "server" });
    g.addEdge({ kind: "data", from: e("api-alpha"), to: e("sw-zulu") });
    g.addEdge({ kind: "data", from: e("web-beta"), to: e("sw-zulu") });
    const domains = buildDomainSet(g, createPhysicalIndex()).domains;
    const sw = domains.find((d) => d.id === e("domain:switch:sw-zulu"));
    expect(sw?.members).toEqual([e("api-alpha"), e("sw-zulu"), e("web-beta")]);
    for (const domain of domains) {
      expect(domain.members).toEqual([...domain.members].sort(compareIds));
    }
  });
});

/* T-9 · PINS current rack semantics while the OWNER-DECISION is open */
describe("rack deathModel pin (T-9 — pending OWNER-DECISION)", () => {
  it("PINS rack deathModel = kill-all and its exact blast reading today", () => {
    const g = createGraph();
    g.addNode({ id: e("srv-1"), kind: "server" });
    g.addNode({ id: e("srv-2"), kind: "server" });
    g.addNode({ id: e("rack-a"), kind: "rack" });
    const index = createPhysicalIndex();
    index.registerFacility(fac1);
    index.registerRack(rackA);
    index.placeDevice(placement(e("srv-1"), rackA.id, 1));
    index.placeDevice(placement(e("srv-2"), rackA.id, 2));
    const rack = buildDomainSet(g, index).domains.find((d) => d.id === e("domain:rack:rack-a"));
    expect(rack?.deathModel).toBe("kill-all");
    // observable reading TODAY: a co-resident death finds the domain, the
    // un-exploded anchor keeps it amber (tier 3), never kill-all.
    const srvDeath = computeBlast(g, buildDomainSet(g, index), e("srv-1"));
    expect(srvDeath.affected).toEqual([e("srv-1")]);
    expect(srvDeath.degraded).toEqual([e("srv-2")]);
    // anchor-not-member reality (placements fill members): killing the rack
    // NODE enumerates no rack domain at all — neither option (a) nor (b)
    // currently explodes co-residents through a directly-killed anchor.
    // The OWNER-DECISION must also say whether the anchor joins members.
    const rackDeath = computeBlast(g, buildDomainSet(g, index), e("rack-a"));
    expect(rackDeath.affected).toEqual([e("rack-a")]);
    expect(rackDeath.degraded).toHaveLength(0);
  });
});

/* T-10 · upstream enumeration caps PATHS, not just depth */
describe("upstream path cap (T-10)", () => {
  /** Two roots, `layers` merge stages of two nodes each — every node fed by
   *  BOTH nodes of the stage below; srv hangs off the top. Paths = 2^layers. */
  function mergeDag(layers: number) {
    const g = createGraph();
    g.addNode({ id: e("srv"), kind: "server" });
    let prev: readonly EntityId[] = [e("L0a"), e("L0b")];
    for (const id of prev) g.addNode({ id, kind: "pdu" });
    for (let layer = 1; layer <= layers; layer += 1) {
      const current: readonly EntityId[] = [e(`L${layer}a`), e(`L${layer}b`)];
      for (const id of current) g.addNode({ id, kind: "pdu" });
      for (const up of current) {
        for (const down of prev) {
          g.addEdge({ kind: "power", from: down, to: up, slot: e(`s:${down}`) });
        }
      }
      prev = current;
    }
    g.addEdge({ kind: "power", from: prev[0] as EntityId, to: e("srv"), slot: e("psu-in") });
    return g;
  }

  it("a deep multi-merge DAG fails LOUD at the cap instead of exploding", () => {
    const g = mergeDag(13); // 8192 upstream paths — 2^13, the exponential shape
    expect(() => powerFeeds(g, e("srv"))).toThrow(/path cap/);
  });

  it("within-cap merge DAG still enumerates, in canonical chain order", () => {
    const g = mergeDag(8); // 256 paths — comfortably inside the 4096 ceiling
    const feeds = powerFeeds(g, e("srv"));
    expect(feeds).toHaveLength(256);
    const keys = feeds.map((f) => f.chain.join("/"));
    expect(keys).toEqual([...keys].sort()); // total order over full chains
    // T-b: every chain heads at srv's DIRECT supplier L8a; the 2^8 fork
    // happens one tier up, so the merge pair now lives at chain[1].
    expect(new Set(feeds.map((f) => f.chain[0]))).toEqual(new Set([e("L8a")]));
    expect(new Set(feeds.map((f) => f.chain[1]))).toEqual(new Set([e("L7a"), e("L7b")]));
  });
});

/* T-11 · returned records are frozen — the readonly types are runtime truth */
describe("frozen records (T-11)", () => {
  it("mutating a returned node or edge throws and cannot poison the graph", () => {
    const g = createGraph();
    const node = g.addNode({ id: e("srv"), kind: "server", customers: 2 });
    g.addNode({ id: e("db"), kind: "server" });
    const edge = g.addEdge({ kind: "data", from: e("srv"), to: e("db") });
    expect(Object.isFrozen(node)).toBe(true);
    expect(Object.isFrozen(edge)).toBe(true);
    expect(() => {
      (node as unknown as { kind: string }).kind = "impossible";
    }).toThrow(TypeError);
    expect(() => {
      (edge as unknown as { to: EntityId }).to = e("evil");
    }).toThrow(TypeError);
    expect(g.node(e("srv"))?.kind).toBe("server"); // store intact
    expect(g.edge(edge.id)?.to).toBe(e("db"));
  });
});

/* ROUND-3 HYGIENE · T-a (exact pair key) + T-b (chain head = direct supplier) */

/* T-a · projectionVersion is the exact "graph:index" string — no fold ceiling */
describe("projectionVersion pair key (T-a)", () => {
  /** projectionVersion reads ONLY the two version counters, so forging the
   *  pair inputs is an honest unit probe — and the only cheap way to reach
   *  the counter combinations the old ×1_000_003 fold collided on. */
  const stampAt = (graphVersion: number, indexVersion: number): string =>
    projectionVersion(
      { version: graphVersion } as unknown as TopologyGraph,
      { version: indexVersion } as unknown as PhysicalIndex,
    );

  it("is the exact `${graph.version}:${index.version}` string", () => {
    expect(stampAt(7, 9)).toBe("7:9");
    expect(stampAt(0, 0)).toBe("0:0");
  });

  it("separates every pair the old fold collided", () => {
    // old math: 1*1_000_003 + 1_000_003 === 2*1_000_003 + 0 === 2_000_006
    expect(stampAt(1, 1_000_003)).not.toBe(stampAt(2, 0));
    expect(stampAt(0, 12_345_678)).not.toBe(stampAt(12_345_678, 0));
  });

  it("real stores: stable across reads, moves on graph AND on index mutations", () => {
    const g = createGraph();
    const index = createPhysicalIndex();
    index.registerFacility(fac1);
    index.registerRack(rackA);
    expect(projectionVersion(g, index)).toBe("0:2");
    expect(projectionVersion(g, index)).toBe("0:2"); // pure reads repeat exactly
    g.addNode({ id: e("srv"), kind: "server" });
    expect(projectionVersion(g, index)).toBe("1:2"); // graph half moved
    index.placeDevice(placement(e("srv"), rackA.id, 1));
    expect(projectionVersion(g, index)).toBe("1:3"); // index half moved, graph still 1 (T-1 shape)
  });

  it("DomainSet.version carries the same pair stamp", () => {
    const g = createGraph();
    const index = createPhysicalIndex();
    index.registerFacility(fac1);
    expect(buildDomainSet(g, index).version).toBe("0:1");
  });
});

/* T-b · powerFeeds chains START at the device's direct supplier */
describe("powerFeeds chain shape (T-b)", () => {
  /** facility → room → PDU → PSU, the canonical §7.3 shared-circuit depth:
   *  the PDU is the PSU's DIRECT supplier and has upstream feeders itself. */
  function deepFeedGraph() {
    const g = createGraph();
    for (const [id, kind] of [
      ["fac", "facility"],
      ["room", "room"],
      ["pdu", "pdu"],
      ["psu", "psu"],
    ] as const) {
      g.addNode({ id: e(id), kind });
    }
    g.addEdge({ kind: "power", from: e("fac"), to: e("room"), slot: e("feeder") });
    g.addEdge({ kind: "power", from: e("room"), to: e("pdu"), slot: e("in") });
    g.addEdge({ kind: "power", from: e("pdu"), to: e("psu"), slot: e("outlet") });
    return g;
  }

  it("3-deep feed: chain is [pdu, room, facility] — direct supplier FIRST, root LAST", () => {
    const feeds = powerFeeds(deepFeedGraph(), e("psu"));
    expect(feeds).toHaveLength(1);
    expect(feeds[0]?.slot).toBe(e("outlet"));
    expect(feeds[0]?.chain).toEqual([e("pdu"), e("room"), e("fac")]);
    // the documented invariant: chain[0] is exactly the node feeding the
    // device. Under the pre-T-b enumeration this chain read [room, facility]
    // and the shared PDU — the very domain §7.3 warns about — was invisible.
    expect(feeds[0]?.chain[0]).toBe(e("pdu"));
  });

  it("root-fed device: the single-node chain IS the direct supplier (invariant holds at every depth)", () => {
    const g = createGraph();
    g.addNode({ id: e("srv"), kind: "server" });
    g.addNode({ id: e("pdu"), kind: "pdu" });
    g.addEdge({ kind: "power", from: e("pdu"), to: e("srv"), slot: e("o1") });
    expect(powerFeeds(g, e("srv"))[0]?.chain).toEqual([e("pdu")]);
  });

  it("feedAncestorOfKind answers its own doc example: the PDU a feed hangs off", () => {
    const g = deepFeedGraph();
    expect(feedAncestorOfKind(g, e("psu"), "pdu")).toEqual([{ slot: e("outlet"), ancestor: e("pdu") }]);
    // the device itself is never in its own chain — only upstreams are
    expect(feedAncestorOfKind(g, e("psu"), "psu")).toEqual([{ slot: e("outlet"), ancestor: null }]);
  });

  it("redundancy pins the PDU token for two PSUs behind one room-fed circuit", () => {
    const g = deepFeedGraph();
    g.addNode({ id: e("psu2"), kind: "psu" });
    g.addEdge({ kind: "power", from: e("pdu"), to: e("psu2"), slot: e("outlet-2") });
    const verdict = assessRedundancy(g, {
      id: e("pair"),
      label: "dual PSU",
      members: [e("psu"), e("psu2")],
      claimedN: 1,
    });
    expect(verdict.broken).toBe(true);
    expect(verdict.domain).toBe("power");
    // the hit set must NAME the circuit (pre-T-b it could only ever report
    // the room/facility above it); .some, not .find — the hits sort puts
    // "facility" first by code point.
    expect(verdict.hits.some((h) => h.type === "power" && h.shared === e("pdu"))).toBe(true);
  });
});
