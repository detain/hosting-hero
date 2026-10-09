/**
 * save/ suite — the seven mandated scenario groups plus boundary guards.
 * Test names read as the game laws they prove (code-philosophy Law 5).
 */

import { describe, expect, it } from "vitest";
import { asCauseId, asEntityId, type EntityId } from "../../types";
import {
  // canonical
  canonicalJson,
  canonicalClone,
  fromCanonicalJson,
  digestSaveValue,
  compareCodeUnits,
  // node
  newCompanyNode,
  parseCompanyNode,
  addScar,
  appendAttribution,
  SCAR_ACTIVE_CAP,
  // lineage
  foundCompany,
  spawnChildFromParent,
  ancestryChain,
  childrenOf,
  generationOf,
  getNode,
  queryNodes,
  countMuseumExhibits,
  assertLineageIntegrity,
  // treatment
  appendTreatment,
  queryTreatment,
  findReferenceCandidates,
  findDepositions,
  projectBook,
  // streaks
  emptyStreaks,
  advanceStreak,
  breakStreak,
  readStreak,
  streakDataRef,
  hookSatisfied,
  // modes
  SAVE_MODES,
  WRITE_FACETS,
  WRITE_ACCESS_MATRIX,
  writeGuard,
  writeAccessOf,
  pendingOd8Rows,
  liveRows,
  guardBatch,
  // faces
  readFace,
  readMuseum,
  // envelope + long save
  FILE_SCHEMA_VERSION,
  LONG_SAVE_SCHEMA_VERSION,
  newSaveFile,
  saveFileToWire,
  parseSaveWire,
  prepareAtomicWrite,
  commitAtomicWrite,
  readSave,
  emptyLineageGraph,
  createMigrationRegistry,
  registerMigration,
  planMigrationChain,
  planSaveMigration,
  migrateSaveWire,
  SAVE_MIGRATIONS,
  composeLongSave,
  serializeLongSave,
  digestLongSave,
  parseLongSave,
  parseLongSaveWire,
  type SaveStorePort,
  type SaveFile,
  type CompanyNode,
  type LongSaveDoc,
} from "../index";
import { founderNode, graphWithFounder, id, KINDNESS, legalManifest, SHORTCUT } from "./helpers";

/* ═══════════════════════ 1. canonical serialization (duplicated rules) ═══════════════════════ */

describe("canonical serialization — replay ordering rules, duplicated locally", () => {
  it("key insertion shuffle never changes bytes", () => {
    const a = canonicalJson({ zeta: 1, alpha: { delta: 4, beta: 2 }, mid: "m" });
    const b = canonicalJson({ mid: "m", alpha: { beta: 2, delta: 4 }, zeta: 1 });
    expect(a).toBe(b);
  });

  it("bigint survives exact decimal, never float-rounded", () => {
    const huge = 123456789012345678901234567890n;
    const text = canonicalJson({ us: huge });
    expect(text).toContain(`{"$i":"${huge.toString(10)}"}`);
    expect((fromCanonicalJson(text) as { us: bigint }).us).toBe(huge);
  });

  it("Map insertion order IS content — a reorder is a divergence", () => {
    const m1 = new Map<string, number>([["a", 1], ["b", 2]]);
    const m2 = new Map<string, number>([["b", 2], ["a", 1]]);
    expect(canonicalJson(m1)).not.toBe(canonicalJson(m2));
  });

  it("Set round-trips in insertion order", () => {
    const s = new Set<bigint>([7n, 3n]);
    const back = fromCanonicalJson(canonicalJson(s)) as Set<bigint>;
    expect([...back]).toEqual([7n, 3n]);
  });

  it("non-finite numbers fail loud — floats are display-only (CONVENTIONS §4)", () => {
    expect(() => canonicalJson({ x: Number.NaN })).toThrow(/banned from save state/);
    expect(() => canonicalJson({ x: Number.POSITIVE_INFINITY })).toThrow(/banned from save state/);
  });

  it("prototype-polluting keys fail loud on encode and decode", () => {
    expect(() => canonicalJson(JSON.parse('{"__proto__": 1}') as unknown)).toThrow(/unsafe object key/);
    expect(() => fromCanonicalJson('{"constructor": 1}')).toThrow(/unsafe object key/);
  });

  it("tag-shaped payload strings round-trip as plain data", () => {
    const tricky = "$i:5";
    const back = fromCanonicalJson(canonicalJson({ s: tricky })) as { s: string };
    expect(back.s).toBe(tricky);
  });

  it("cycles fail loud rather than stack-overflowing", () => {
    const cyc: Record<string, unknown> = {};
    cyc["self"] = cyc;
    expect(() => canonicalJson(cyc)).toThrow(/cyclic/);
  });

  it("digest is stable across 100 shuffled recomputations", () => {
    const build = (swap: boolean) => (swap ? { b: 2n, a: { d: 4, c: [1, "x"] } } : { a: { c: [1, "x"], d: 4 }, b: 2n });
    const digests = new Set<string>();
    for (let i = 0; i < 100; i += 1) digests.add(digestSaveValue(build(i % 2 === 0)));
    expect(digests.size).toBe(1);
  });

  it("code-unit order pins uppercase before lowercase (never locale)", () => {
    expect(compareCodeUnits("Z", "a")).toBe(-1);
    expect(canonicalJson({ a: 1, Z: 2 })).toBe('{"Z":2,"a":1}');
  });
});

/* ═══════════════════════ 2. node facets + scar law ═══════════════════════ */

describe("CompanyNode facets — Appendix C schema", () => {
  it("a fresh node arrives with every facet present and empty (trusted by construction)", () => {
    const node = newCompanyNode({ id: "gen-0", parentId: null, name: "Garage", eraOrigin: "dial-up", foundedAtTick: 0n, successionType: "found" });
    expect(node.scars).toEqual([]);
    expect(node.habits.docRate).toBe(0n);
    expect(node.reputation.breachHistoryTicks).toEqual([]);
    expect(node.policyBook.ruleBookHash).toBe("");
  });

  it("the 4th scar RETIRES the oldest — cap governs slots, history is immortal (T8/D7)", () => {
    let node = founderNode();
    const mk = (n: string) => ({
      id: id(n),
      originEventRef: `cause-${n}`,
      acquiredAtTick: 100n + BigInt(n.length),
      modifierPayload: {},
      clearance: { rule: "audit_passed" as const, progress: 0 },
      disclosure: "disclosed" as const,
      payoffGrant: null,
      mapPosition: null,
    });
    node = addScar(node, mk("scar-2"));
    node = addScar(node, mk("scar-3"));
    expect(node.scars.length).toBe(SCAR_ACTIVE_CAP);
    node = addScar(node, mk("scar-4"));
    expect(node.scars.length).toBe(SCAR_ACTIVE_CAP);
    expect(node.scars.some((s) => s.id === "scar-data-loss")).toBe(false); // oldest demoted
    expect(node.scarsRetired.some((s) => s.id === "scar-data-loss")).toBe(true); // memorialized, not destroyed
    expect(node.scarsRetired.find((s) => s.id === "scar-data-loss")?.replacedBy).toBe("scar-4");
  });

  it("attribution events append with cause stamped at creation (L13 unretrofittable)", () => {
    const node = appendAttribution(founderNode(), "churn+6", 3932n, 500n, "cause-hc-cut-day-411");
    expect(node.attributionEvents[0]).toMatchObject({ seq: 0, effect: "churn+6", causeEventRef: "cause-hc-cut-day-411" });
  });

  it("unlocks hang off scars via scarRef (task: scars registry drives unlocks)", () => {
    const lb = founderNode().nodesUnlocked.find((u) => u.node === "load-balancer");
    expect(lb?.via).toBe("scar");
    expect(lb?.scarRef).toBe("scar-data-loss");
    expect(lb?.stamp).toBe("learned_hard_way");
  });

  it("knowledge decay is DATA: mttrBonusUs on playbook rungs, faded on wall entries", () => {
    const node = founderNode();
    expect(node.playbook[0]?.mttrBonusUs).toBe(120);
    expect(node.nodesUnlocked[0]?.faded).toBe(0);
  });

  it("parse rejects scar-cap and customer-cap violations at the boundary (Law 4)", () => {
    const node = founderNode();
    const floodedScars = canonicalClone(node) as unknown as CompanyNode;
    const scar = node.scars[0];
    if (scar === undefined) throw new Error("fixture");
    expect(() => parseCompanyNode({ ...floodedScars, scars: [scar, scar, scar, scar] })).toThrow(/exceeds active cap/);
    const book = node.customerBooks[0];
    if (book === undefined) throw new Error("fixture");
    const books = Array.from({ length: 13 }, (_, i) => ({ ...canonicalClone(book), id: `c-${i}`, name: `c-${i}` }));
    expect(() => parseCompanyNode({ ...canonicalClone(node), customerBooks: books })).toThrow(/named-customer cap/);
  });

  it("parse rejects a JSON.parse'd raw dump where bigint is required — never coerce", () => {
    const raw = JSON.parse(serializeNodeViaPlainJson(founderNode())) as Record<string, unknown>;
    expect(() => parseCompanyNode(raw)).toThrow(/expected bigint/);
  });

  it("canonicalClone preserves bigints exactly (test-workhorse guarantee)", () => {
    const node = founderNode();
    const clone = canonicalClone(node) as unknown as CompanyNode;
    expect(clone.scars[0]?.modifierPayload).toEqual({ mttrMultiplier: 65536n });
    expect(() => parseCompanyNode(clone)).not.toThrow();
  });
});

/** Deliberately lossy clone (bigint → string) to prove the parser's refusal. */
function serializeNodeViaPlainJson(node: CompanyNode): string {
  return JSON.stringify(node, (_k, v) => (typeof v === "bigint" ? v.toString(10) : v));
}

/* ═══════════════════════ 3. lineage spawn / inheritance exactness ═══════════════════════ */

/** Force an arbitrary id list into the manifest tuple shape — the manifest
 *  VALIDATOR (not the type) is what the tests under test are proving. */
const kept3 = (nodes: readonly string[]): [EntityId, EntityId, EntityId] =>
  nodes.map((n) => id(n)) as unknown as [EntityId, EntityId, EntityId];

describe("LineageGraph — spawn/inheritance exactness (3 nodes + doctrine + playbook ONLY)", () => {
  it("a prestige exit seeds the child with EXACTLY the manifest: 3 kept nodes, 1 doctrine, carried playbook", () => {
    const { graph, founderId } = graphWithFounder();
    const before = countMuseumExhibits(graph);
    const { graph: g2, child, edge } = spawnChildFromParent(graph, founderId, {
      childId: "co-gen-2",
      name: "Pipe & Panic II",
      foundedAtTick: 200n,
      manifest: legalManifest(),
      succession: "exit",
    });
    expect(child.nodesUnlocked.length).toBe(3); // no 4th unlock sneaks across (anycast stays behind)
    expect(child.nodesUnlocked.map((u) => u.node)).toEqual(["load-balancer", "self-service-portal", "abuse-desk"]);
    expect(child.doctrine.current?.id).toBe("doc-1");
    expect(child.doctrine.perAct).toEqual([]); // ONE doctrine, not the whole history
    expect(child.playbook.length).toBe(1); // only the CARRIED slot
    expect(child.customerBooks).toEqual([]); // relationships do NOT silently ride
    expect(child.finances.mrrMicroUsd).toBe(0n); // no cash rides an exit without an explicit slice
    expect(edge.preservedMuseumExhibitIds).toEqual(["exhibit-first-polaroid"]);
    expect(countMuseumExhibits(g2)).toBeGreaterThanOrEqual(before);
    expect(getNode(g2, founderId).identity.status).toBe("retired");
  });

  it("kept-3 is EXACT: two or four kept nodes throw (the manifest shape IS the rule)", () => {
    const { graph, founderId } = graphWithFounder();
    const two = { ...legalManifest(), keptNodes: kept3(["load-balancer", "abuse-desk"]) };
    expect(() => spawnChildFromParent(graph, founderId, { childId: "c2", name: "x", foundedAtTick: 200n, manifest: two, succession: "exit" })).toThrow(/exactly 3 kept nodes, got 2/);
    const four = { ...legalManifest(), keptNodes: kept3(["load-balancer", "self-service-portal", "abuse-desk", "anycast"]) };
    expect(() => spawnChildFromParent(graph, founderId, { childId: "c3", name: "x", foundedAtTick: 200n, manifest: four, succession: "exit" })).toThrow(/exactly 3 kept nodes, got 4/);
  });

  it("a kept node the parent never unlocked throws (no invented inheritance)", () => {
    const { graph, founderId } = graphWithFounder();
    const bogus = { ...legalManifest(), keptNodes: kept3(["load-balancer", "self-service-portal", "quantum-rack"]) };
    expect(() => spawnChildFromParent(graph, founderId, { childId: "c4", name: "x", foundedAtTick: 200n, manifest: bogus, succession: "exit" })).toThrow(/was never unlocked by the parent/);
  });

  it("duplicate kept nodes throw; non-carried playbook slots throw; >8 slots throw", () => {
    const { graph, founderId } = graphWithFounder();
    const dup = { ...legalManifest(), keptNodes: kept3(["load-balancer", "load-balancer", "abuse-desk"]) };
    expect(() => spawnChildFromParent(graph, founderId, { childId: "c5", name: "x", foundedAtTick: 200n, manifest: dup, succession: "exit" })).toThrow(/distinct/);
    const slot = legalManifest().playbook[0];
    if (slot === undefined) throw new Error("fixture");
    const notCarried = { ...legalManifest(), playbook: [{ ...slot, carried: false }] };
    expect(() => spawnChildFromParent(graph, founderId, { childId: "c6", name: "x", foundedAtTick: 200n, manifest: notCarried, succession: "exit" })).toThrow(/not marked carried/);
    const nine = { ...legalManifest(), playbook: Array.from({ length: 9 }, (_, i) => ({ ...slot, runbookId: `rb-${i}` })) };
    expect(() => spawnChildFromParent(graph, founderId, { childId: "c7", name: "x", foundedAtTick: 200n, manifest: nine, succession: "exit" })).toThrow(/exceeds carry cap/);
  });

  it("failure-restart carries the D12 'one small permanent unlock' and NEVER destroys the museum", () => {
    const { graph, founderId } = graphWithFounder();
    const manifest = { ...legalManifest(), failureOnlyUnlock: id("recovery-scenario-node") };
    const { graph: g2, child } = spawnChildFromParent(graph, founderId, { childId: "co-gen-2f", name: "The Win-Back Co", foundedAtTick: 210n, manifest, succession: "failure_restart" });
    expect(child.nodesUnlocked.length).toBe(4); // kept-3 + the failure-only gift
    expect(child.nodesUnlocked.some((u) => u.node === "recovery-scenario-node")).toBe(true);
    const parent = getNode(g2, founderId);
    expect(parent.museum.length).toBe(1); // museum survives the death, on the graph
    expect(parent.identity.status).toBe("retired");
  });

  it("cash crosses exit edges only (T8: failure makes you poorer, not paid); failure-only unlock rides failure edges only", () => {
    const { graph, founderId } = graphWithFounder();
    const paid = { ...legalManifest(), cashSliceMicroUsd: 500n };
    const gift = { ...legalManifest(), failureOnlyUnlock: id("extra") };
    expect(() => spawnChildFromParent(graph, founderId, { childId: "c8", name: "x", foundedAtTick: 200n, manifest: paid, succession: "failure_restart" })).toThrow(/cash slices cross exit edges only/);
    expect(() => spawnChildFromParent(graph, founderId, { childId: "c9", name: "x", foundedAtTick: 200n, manifest: gift, succession: "exit" })).toThrow(/failure_restart edges only/);
    expect(() => spawnChildFromParent(graph, founderId, { childId: "c10", name: "x", foundedAtTick: 200n, manifest: paid, succession: "exit" })).not.toThrow();
  });

  it("inherited nodes keep the original handwriting (§1.6 prestige whiteboard)", () => {
    const founder = founderNode();
    const withOwner: CompanyNode = {
      ...founder,
      nodesUnlocked: founder.nodesUnlocked.map((u) => (u.node === "load-balancer" ? { ...u, handwritingOwnerStaffId: id("staff-maria") } : u)),
    };
    const { graph, founderId } = graphWithFounder(withOwner);
    const { child } = spawnChildFromParent(graph, founderId, { childId: "ch", name: "x", foundedAtTick: 200n, manifest: legalManifest(), succession: "exit" });
    expect(child.nodesUnlocked.find((u) => u.node === "load-balancer")?.handwritingOwnerStaffId).toBe("staff-maria");
  });

  it("spawn is pure: the input graph is untouched (Law 3 atomic predictability)", () => {
    const { graph, founderId } = graphWithFounder();
    const snapshot = canonicalJson(getNode(graph, founderId));
    spawnChildFromParent(graph, founderId, { childId: "c11", name: "x", foundedAtTick: 200n, manifest: legalManifest(), succession: "exit" });
    expect(canonicalJson(getNode(graph, founderId))).toBe(snapshot);
    expect(graph.nodes.size).toBe(1);
    expect(graph.edges.length).toBe(0);
  });

  it("queries: by era, by tier reached, by line; generation depth; children", () => {
    const { graph, founderId } = graphWithFounder();
    const { graph: g2 } = spawnChildFromParent(graph, founderId, { childId: "g2", name: "II", foundedAtTick: 200n, manifest: legalManifest(), succession: "exit" });
    const g2Node = getNode(g2, asEntityId("g2"));
    const { graph: g3 } = spawnChildFromParent(g2, asEntityId("g2"), {
      childId: "g3",
      name: "III",
      eraOrigin: "broadband",
      foundedAtTick: 400n,
      manifest: { ...legalManifest("g2"), keptNodes: kept3(g2Node.nodesUnlocked.slice(0, 3).map((u) => u.node as string)) },
      succession: "npc_pivot",
    });
    expect(ancestryChain(g3, id("g3")).map((n) => n.id)).toEqual(["co-gen-1", "g2", "g3"]);
    expect(generationOf(g3, id("g3"))).toBe(2);
    expect(queryNodes(g3, { era: "broadband" }).map((n) => n.id)).toEqual(["g3"]);
    expect(queryNodes(g3, { rootOf: id("co-gen-1") }).length).toBe(3);
    expect(queryNodes(g3, { minTierReached: 1 }).map((n) => n.id)).toEqual(["co-gen-1"]); // only the founder reached tier 3
    expect(childrenOf(g3, id("co-gen-1")).map((n) => n.id)).toEqual(["g2"]);
  });

  it("integrity audit fails loud on orphan children; foundCompany rejects id reuse", () => {
    const { graph, founderId } = graphWithFounder();
    const orphan = newCompanyNode({ id: "orphan", parentId: "ghost", name: "o", eraOrigin: "e", foundedAtTick: 0n, successionType: "exit" });
    const nodes = new Map(graph.nodes).set(orphan.id, orphan);
    expect(() => assertLineageIntegrity({ ...graph, nodes })).toThrow(/missing parent/);
    expect(() => foundCompany(graph, { id: founderId, name: "dup", eraOrigin: "x", foundedAtTick: 0n })).toThrow(/already exists/);
  });
});

/* ═══════════════════════ 4. reputation ledger (cross-level moral memory) ═══════════════════════ */

describe("Treatment ledger — level-3 kindness surfaces as level-9 reference", () => {
  /** Fixture timeline: kindness at tick X ("level 3"); the reference query
   *  runs at LEVEL_NINE_TICK — a sim-time range scan, never wall clock. */
  const KINDNESS_TICK = 41_000n;
  const LEVEL_NINE_TICK = 101_000n;

  function nodeWithKindness(): CompanyNode {
    const base = founderNode();
    const { customerBooks } = appendTreatment(base, id("cust-acme"), {
      atTick: KINDNESS_TICK,
      causeId: "cause-save-9",
      dimension: "service",
      valence: KINDNESS,
      summary: "Maria drove out at 2am and stayed till the RAID rebuilt.",
      runId: id("run-t3"),
      runSeed: 7n,
    });
    return { ...base, customerBooks };
  }

  it("append → query round-trip: the kindness event at tick X is retrievable verbatim", () => {
    const node = nodeWithKindness();
    const hits = queryTreatment(node, { sinceTick: KINDNESS_TICK, untilTick: KINDNESS_TICK });
    expect(hits.length).toBe(1);
    const hit = hits[0];
    expect(hit?.summary).toBe("Maria drove out at 2am and stayed till the RAID rebuilt.");
    expect(hit?.dimension).toBe("service");
    expect(hit?.subject).toBe("cust-acme");
    expect(hit?.provenance.runSeed).toBe(7n); // every fact names its run + seed
  });

  it("the level-3 kindness becomes a level-9 REFERENCE CANDIDATE (generated by query, not authored)", () => {
    const candidates = findReferenceCandidates(nodeWithKindness(), {
      minKindnessValence: 16384n, // ≥ 0.25
      asOfTick: LEVEL_NINE_TICK,
      dimension: "service",
      minTenureMin: 60,
    });
    expect(candidates.map((c) => c.customer.id)).toEqual(["cust-acme"]);
    expect(candidates[0]?.proofEvent.atTick).toBe(KINDNESS_TICK); // the quote IS the stored event
  });

  it("churned customers never vouch — they become ghosts instead (L23)", () => {
    const kind = nodeWithKindness();
    const churned = { ...kind, customerBooks: kind.customerBooks.map((b) => (b.id === "cust-acme" ? { ...b, status: "churned" as const } : b)) };
    expect(findReferenceCandidates(churned, { minKindnessValence: 1n, asOfTick: LEVEL_NINE_TICK })).toEqual([]);
  });

  it("the level-1 shortcut returns as a level-9 DEPOSITION, quoted verbatim after the lag (L6)", () => {
    const base = founderNode();
    const { customerBooks } = appendTreatment(base, id("cust-globex"), {
      atTick: 41n, // "Source: pricing decision, day 41"
      causeId: "cause-price-hike",
      dimension: "pricing",
      valence: SHORTCUT,
      summary: "They raised the renewal 40% without a word.",
      runId: id("run-t1"),
      runSeed: 3n,
    });
    const node = { ...base, customerBooks };
    const hits = findDepositions(node, { dimension: "pricing", asOfTick: LEVEL_NINE_TICK, olderThanTicks: 90_000n });
    expect(hits.length).toBe(1);
    expect(hits[0]?.summary).toBe("They raised the renewal 40% without a word.");
    // the lag IS the mechanic: a too-recent query finds nothing
    expect(findDepositions(node, { dimension: "pricing", asOfTick: 100n, olderThanTicks: 90_000n })).toEqual([]);
  });

  it("query filters: subject, dimension, valence band, sim-time window (fictional-clock discipline)", () => {
    const node = nodeWithKindness();
    expect(queryTreatment(node, { subject: id("cust-globex") })).toEqual([]);
    expect(queryTreatment(node, { dimension: "pricing" })).toEqual([]);
    expect(queryTreatment(node, { minValence: 0n }).length).toBe(1);
    expect(queryTreatment(node, { maxValence: -1n })).toEqual([]);
    expect(queryTreatment(node, { sinceTick: KINDNESS_TICK + 1n })).toEqual([]);
  });

  it("projections recompute from the log; the log stays untouched (append-only spine)", () => {
    let node: CompanyNode = nodeWithKindness();
    const { customerBooks } = appendTreatment(node, id("cust-acme"), {
      atTick: 42_000n, causeId: "cause-silent-decline", dimension: "support", valence: -8000n,
      summary: "Ticket aged 6 days.", runId: id("run-t3"), runSeed: 7n,
    });
    node = { ...node, customerBooks };
    const acme = node.customerBooks.find((b) => b.id === "cust-acme");
    if (acme === undefined) throw new Error("fixture");
    const projected = projectBook(acme);
    expect(projected.grudgeScore).toBe(-8000n);
    expect(projected.referenceEligible).toBe(true);
    expect(acme.treatmentLog.length).toBe(2);
    expect(acme.grudgeScore).toBe(0n); // the OLD book object was never mutated (Law 3)
  });

  it("appendTreatment fails loud for an unknown entity ref (events attach to named entities only)", () => {
    expect(() =>
      appendTreatment(founderNode(), id("cust-phantom"), {
        atTick: 1n, causeId: "c", dimension: "service", valence: 1n, summary: "s", runId: id("r"), runSeed: 1n,
      }),
    ).toThrow(/not found/);
  });

  it("treatment events survive the full canonical round-trip through the node parser", () => {
    const revived = parseCompanyNode(canonicalClone(nodeWithKindness()), "n");
    expect(revived.customerBooks.find((b) => b.id === "cust-acme")?.treatmentLog[0]?.atTick).toBe(KINDNESS_TICK);
  });
});

/* ═══════════════════════ 5. shared cross-mode streaks ═══════════════════════ */

describe("Uptime streak — ONE shared cross-mode counter set", () => {
  it("advance grows current and pins longest; break resets current but never history (L22)", () => {
    let streaks = emptyStreaks();
    streaks = advanceStreak(advanceStreak(advanceStreak(streaks, "uptime"), "uptime"), "uptime");
    expect(streaks.uptime).toEqual({ current: 3, longest: 3, lastEraseAtTick: null });
    streaks = breakStreak(streaks, "uptime", 900n, asCauseId("cause-sev1"));
    expect(streaks.uptime.current).toBe(0);
    expect(streaks.uptime.longest).toBe(3); // breaking hurts MORE the longer it ran — the number remembers
    expect(streaks.uptime.lastEraseAtTick).toBe(900n); // the whiteboard's erase moment (L9)
  });

  it("single counter, many readers: financing, insurance, hiring refs ALL see one truth (L9/L11)", () => {
    let streaks = emptyStreaks();
    for (let i = 0; i < 5; i += 1) streaks = advanceStreak(streaks, "uptime");
    const financing = { hookId: "financing:terms", requires: streakDataRef("uptime"), minCurrent: 4 };
    const insurance = { hookId: "insurance:premium-break", requires: streakDataRef("uptime"), minCurrent: 10 };
    const hiring = { hookId: "hiring:enterprise-cred", requires: streakDataRef("uptime"), minCurrent: 5 };
    expect([hookSatisfied(streaks, financing), hookSatisfied(streaks, insurance), hookSatisfied(streaks, hiring)]).toEqual([true, false, true]);
    expect(readStreak(streaks, hiring.requires)).toEqual(readStreak(streaks, financing.requires)); // ONE counter behind every ref
    streaks = breakStreak(streaks, "uptime", 6n, asCauseId("cause-outage"));
    expect(hookSatisfied(streaks, financing)).toBe(false); // one break moves every consumer at once
  });

  it("the four streaks are independent counters (no-SLA-breach ≠ missed backup)", () => {
    let streaks = advanceStreak(emptyStreaks(), "no_missed_backup");
    streaks = breakStreak(streaks, "no_data_loss", 3n, asCauseId("cause-flood"));
    expect(streaks.noMissedBackup.current).toBe(1);
    expect(streaks.noDataLoss.lastEraseAtTick).toBe(3n);
  });

  it("readStreak fails loud on a foreign-facet ref (hook contract is typed data, not vibes)", () => {
    expect(() => readStreak(emptyStreaks(), streakDataRef("uptime"))).not.toThrow();
    expect(() => readStreak(emptyStreaks(), { facet: "finances", kind: "uptime" } as never)).toThrow(/not the shared streak set/);
  });
});

/* ═══════════════════════ 6. OD-8 write-access matrix (Matrix B ratified) ═══════════════════════ */

const RATIFIED_MATRIX_B = ["scenario", "daily", "consultant", "blitz"] as const;
/** §2.5-B: the only facets a Matrix B shadow instance appends. */
const MATRIX_B_LEDGER = new Set(["records", "medals", "streaksShared", "codex"]);

describe("Mode write-access matrix — OD-8 Matrix B LIVE, endless held, campaign full-carry", () => {
  it("campaign may write EVERY facet (full-carry, L18)", () => {
    for (const facet of WRITE_FACETS) {
      expect(() => writeGuard("campaign", facet)).not.toThrow();
    }
    expect(liveRows("campaign").length).toBe(WRITE_FACETS.length);
  });

  it("event-spine facets are append; mutable projections are instance (campaign)", () => {
    expect(writeGuard("campaign", "customerBooks")).toBe("append"); // treatment log is append-only
    expect(writeGuard("campaign", "streaksShared")).toBe("append");
    expect(writeGuard("campaign", "habits")).toBe("instance");
    expect(writeGuard("campaign", "reputation")).toBe("instance"); // the PROJECTION; the log is the spine
    expect(writeGuard("campaign", "playbook")).toBe("instance");
  });

  it("OD-8 Matrix B (ratified 2026-10-09, ADR-0009): scenario/daily/consultant/blitz rows are LIVE and never throw", () => {
    for (const mode of RATIFIED_MATRIX_B) {
      for (const facet of WRITE_FACETS) {
        expect(() => writeGuard(mode, facet)).not.toThrow();
        expect(writeAccessOf(mode, facet).status).toBe("LIVE");
      }
    }
  });

  it("Matrix B pattern enforced: ratified modes APPEND only records/medals/streaksShared/codex and DENY everything else (§2.5-B)", () => {
    for (const mode of RATIFIED_MATRIX_B) {
      const appendFacets = WRITE_ACCESS_MATRIX.filter((r) => r.mode === mode && r.kind === "append")
        .map((r) => r.facet)
        .sort();
      expect(appendFacets).toEqual([...MATRIX_B_LEDGER].sort()); // exactly the ledger four
      for (const facet of WRITE_FACETS) {
        const expected = MATRIX_B_LEDGER.has(facet) ? "append" : "deny";
        expect(writeGuard(mode, facet)).toBe(expected);
      }
    }
    // the split named in the ratification:
    expect(writeGuard("scenario", "records")).toBe("append");
    expect(writeGuard("scenario", "scars")).toBe("deny"); // NEVER scars/rep/customer_book/cash
    expect(writeGuard("daily", "finances")).toBe("deny"); // Bulletproof precedent: earnings unusable
  });

  it("endless stays contested: all 32 rows PENDING_OD8 and EVERY writeGuard call THROWS naming OD-8", () => {
    for (const facet of WRITE_FACETS) {
      expect(writeAccessOf("endless", facet).status).toBe("PENDING_OD8");
      expect(() => writeGuard("endless", facet)).toThrow(/OD-8/);
    }
    // campaign-mirror recommendation carried as DATA only (§2.5 Long Save in place):
    expect(writeAccessOf("endless", "habits").kind).toBe("instance");
    expect(writeAccessOf("endless", "records").kind).toBe("append");
    // the throw names the held mode and the hold, fail-loud (Law 4):
    expect(() => writeGuard("endless", "habits")).toThrow(/"endless".*HELD PENDING/s);
  });

  it("matrix arithmetic under Matrix B: LIVE + PENDING counts derived from SAVE_MODES × WRITE_FACETS", () => {
    const total = SAVE_MODES.length * WRITE_FACETS.length; // 6 × 32 = 192
    expect(WRITE_ACCESS_MATRIX.length).toBe(total);
    expect(pendingOd8Rows().length).toBe(WRITE_FACETS.length); // endless only
    expect(pendingOd8Rows().every((r) => r.mode === "endless")).toBe(true);
    expect(liveRows().length).toBe(total - WRITE_FACETS.length); // campaign + 4 ratified modes
    const ratifiedLive = liveRows().filter((r) => r.mode !== "campaign").length;
    expect(ratifiedLive).toBe(RATIFIED_MATRIX_B.length * WRITE_FACETS.length); // 4 × 32 = 128
    for (const mode of SAVE_MODES) {
      const expected = mode === "endless" ? 0 : WRITE_FACETS.length;
      expect(liveRows(mode).length).toBe(expected);
    }
  });

  it("guardBatch aborts a whole settlement batch on a denied or held row (settlement atomicity, §2.4)", () => {
    const ok = { runId: "run-1", mode: "campaign" as const, committedAtTick: 10n, writes: [{ facet: "records" as const, payload: {} }] };
    expect(() => guardBatch(ok)).not.toThrow();
    // a ratified ledger-only batch commits:
    const ledgerBatch = {
      runId: "run-3",
      mode: "blitz" as const,
      committedAtTick: 10n,
      writes: (["records", "medals", "streaksShared", "codex"] as const).map((facet) => ({ facet, payload: {} })),
    };
    expect(() => guardBatch(ledgerBatch)).not.toThrow();
    // LIVE-but-denied row in a ratified mode's batch: aborted by the Matrix B deny, not silently passed
    const tainted = { runId: "run-2", mode: "blitz" as const, committedAtTick: 10n, writes: [{ facet: "medals" as const, payload: {} }, { facet: "scars" as const, payload: {} }] };
    expect(() => guardBatch(tainted)).toThrow(/denies mode "blitz"/);
    // held endless row: still throws naming OD-8
    const held = { runId: "run-4", mode: "endless" as const, committedAtTick: 10n, writes: [{ facet: "records" as const, payload: {} }] };
    expect(() => guardBatch(held)).toThrow(/OD-8/);
    expect(() => guardBatch({ runId: "r", mode: "campaign", committedAtTick: 0n, writes: [] })).toThrow(/facts or nothing/);
  });

  it("matrix is exhaustive: one row per mode × facet, no duplicates", () => {
    expect(WRITE_ACCESS_MATRIX.length).toBe(SAVE_MODES.length * WRITE_FACETS.length);
    const keys = WRITE_ACCESS_MATRIX.map((r) => `${r.mode}::${r.facet}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

/* ═══════════════════════ 7. migration registry (v1→v2 stub, versioning discipline) ═══════════════════════ */

function v1Wire(): Record<string, unknown> {
  const wire = canonicalClone(saveFileToWire(fixtureSave())) as Record<string, unknown>;
  const lineage = wire.lineage as { nodes: Record<string, unknown>[] };
  for (const node of lineage.nodes) {
    delete (node.reputation as Record<string, unknown>).breachHistoryTicks;
  }
  (wire.schemaVersion as { file: number }).file = 1;
  return wire;
}

describe("Migration chain v1→v2 — pure, additive, deterministic (one-way door exercised)", () => {
  it("v1→v2 adds breachHistoryTicks defaults WITHOUT rewriting old streams", () => {
    const v1 = v1Wire();
    const before = canonicalJson(v1);
    const v2 = migrateSaveWire(SAVE_MIGRATIONS, v1);
    expect((v2.schemaVersion as { file: number }).file).toBe(FILE_SCHEMA_VERSION);
    for (const raw of (v2.lineage as { nodes: Record<string, unknown>[] }).nodes) {
      expect((raw.reputation as { breachHistoryTicks: unknown }).breachHistoryTicks).toEqual([]);
    }
    expect(canonicalJson(v1)).toBe(before); // input untouched (Law 3)
  });

  it("migration ×50 yields byte-identical output (determinism discipline)", () => {
    const digests = new Set<string>();
    for (let i = 0; i < 50; i += 1) digests.add(digestSaveValue(migrateSaveWire(SAVE_MIGRATIONS, v1Wire())));
    expect(digests.size).toBe(1);
  });

  it("a migrated v1 doc parses as a current SaveFile", () => {
    const save = parseSaveWire(migrateSaveWire(SAVE_MIGRATIONS, v1Wire()));
    expect(save.schemaVersion.file).toBe(2);
    expect(save.lineage.nodes.size).toBe(2);
  });

  it("registry discipline: step-by-one only; gaps, leaps and downgrades fail loud", () => {
    expect(() => planMigrationChain(SAVE_MIGRATIONS, 1, 3)).toThrow(/no v2→v3 path/);
    expect(() => planMigrationChain(SAVE_MIGRATIONS, 2, 1)).toThrow(/backup instead/);
    expect(() =>
      registerMigration(createMigrationRegistry(), {
        from: 1, to: 3, description: "illegal leap", dryRunNotes: [], migrate: (d) => d,
      }),
    ).toThrow(/skips a version/);
  });

  it("dry-run plan names the changes BEFORE the door opens (§9.6/L27)", () => {
    const plan = planSaveMigration(SAVE_MIGRATIONS, v1Wire());
    expect(plan.backupRequired).toBe(true);
    expect(plan.dryRunNotes.join("\n")).toMatch(/breachHistoryTicks/);
    expect(plan.chain.length).toBe(1);
  });

  it("the v1→v2 step is idempotent: re-running over migrated nodes is a pass-through", () => {
    const step = SAVE_MIGRATIONS.migrations.get(1);
    if (step === undefined) throw new Error("registry lost its stub");
    const once = step.migrate(v1Wire());
    const twice = step.migrate(once);
    expect(canonicalJson(twice)).toBe(canonicalJson(once));
  });
});

/* ═══════════════════════ 8. atomic envelope (serialize → hash → replace) ═══════════════════════ */

function fixtureSave(): SaveFile {
  const { graph, founderId } = graphWithFounder();
  const { graph: g2 } = spawnChildFromParent(graph, founderId, {
    childId: "co-gen-2", name: "Successor", foundedAtTick: 300n, manifest: legalManifest(), succession: "exit",
  });
  const save = newSaveFile({ saveId: "longsave-alpha", engineVersion: "0.1.0", simContract: "rng-v1", createdAtTick: 0n });
  return { ...save, lineage: g2, streaksShared: advanceStreak(advanceStreak(save.streaksShared, "uptime"), "uptime") };
}

class MemoryStore implements SaveStorePort {
  readonly files = new Map<string, string>();
  replaces = 0;
  read(key: string): string | null {
    return this.files.get(key) ?? null;
  }
  writeTmp(key: string, payload: string): void {
    this.files.set(key, payload);
  }
  replace(key: string): void {
    const tmp = this.files.get(`${key}.tmp`);
    if (tmp === undefined) throw new Error("replace without tmp");
    this.files.set(key, tmp);
    this.files.delete(`${key}.tmp`);
    this.replaces += 1;
  }
  deleteTmp(key: string): void {
    this.files.delete(key);
  }
}

describe("Atomic save-file envelope — serialize → hash → replace", () => {
  it("digest stable ×100, including shuffled property insertion order", () => {
    const save = fixtureSave();
    const digests = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      const shuffled: SaveFile =
        i % 2 === 0
          ? save
          : { streaksShared: save.streaksShared, createdAtTick: save.createdAtTick, saveId: save.saveId, settings: save.settings, globalRecords: save.globalRecords, schemaVersion: save.schemaVersion, lineage: save.lineage };
      digests.add(prepareAtomicWrite(shuffled).digest);
    }
    expect(digests.size).toBe(1);
  });

  it("commit → read round-trips the FULL lineage (nodes, edges, bigints, streaks)", () => {
    const store = new MemoryStore();
    const save = fixtureSave();
    const { digest, previousBackup } = commitAtomicWrite(store, save);
    expect(previousBackup).toBeNull();
    const loaded = readSave(store, "save:longsave-alpha", { expectDigest: digest });
    expect(loaded.saveId).toBe("longsave-alpha");
    expect(loaded.lineage.nodes.size).toBe(2);
    expect(loaded.lineage.edges[0]?.manifest.keptNodes.length).toBe(3);
    expect(loaded.streaksShared.uptime.current).toBe(2);
    expect(loaded.lineage.nodes.get(id("co-gen-1"))?.scars[0]?.modifierPayload).toEqual({ mttrMultiplier: 65536n });
    // second commit REPLACES (tmp→final), previous payload handed back as backup
    const second = commitAtomicWrite(store, { ...save, createdAtTick: 1n });
    expect(second.previousBackup).not.toBeNull();
    expect(store.replaces).toBe(2);
  });

  it("replace is LAST: a corrupted tmp payload aborts before touching the old file", () => {
    const store = new MemoryStore();
    const save = fixtureSave();
    commitAtomicWrite(store, save);
    const goodText = store.read("save:longsave-alpha");
    class CorruptStore extends MemoryStore {
      override writeTmp(key: string, payload: string): void {
        super.writeTmp(key, payload.replace('"longsave-alpha"', '"longsave-alpha"')); // bytes differ from what we hashed
        const stored = this.files.get(key);
        if (stored !== undefined) this.files.set(key, `${stored.slice(0, -1)} `); // mutate after serialize
      }
    }
    const corrupt = new CorruptStore();
    corrupt.files.set("save:longsave-alpha", goodText ?? "");
    expect(() => commitAtomicWrite(corrupt, save)).toThrow(/differs from serialized bytes/);
    expect(corrupt.read("save:longsave-alpha")).toBe(goodText); // OLD file intact
    expect(corrupt.replaces).toBe(0);
    expect(corrupt.read("save:longsave-alpha.tmp")).toBeNull(); // tmp cleaned up
  });

  it("digest mismatch on load fails loud (hash-chain integrity, WS-6 R5)", () => {
    const store = new MemoryStore();
    commitAtomicWrite(store, fixtureSave());
    expect(() => readSave(store, "save:longsave-alpha", { expectDigest: "deadbeefdeadbeef" })).toThrow(/digest mismatch/);
  });

  it("a v1 file migrates automatically inside readSave (old saves still load)", () => {
    const store = new MemoryStore();
    store.files.set("save:legacy", canonicalJson(v1Wire()));
    const loaded = readSave(store, "save:legacy");
    expect(loaded.schemaVersion.file).toBe(2);
    expect(loaded.lineage.nodes.get(id("co-gen-1"))?.reputation.breachHistoryTicks).toEqual([]);
  });

  it("parseSaveWire refuses a foreign file version with a migrate-me error (fail loud, no coercion)", () => {
    expect(() => parseSaveWire(v1Wire())).toThrow(/run it through migrateSaveWire/);
  });
});

/* ═══════════════════════ 9. THE LONG SAVE artifact composition ═══════════════════════ */

const runRefs = () => [
  {
    runId: "run-t1",
    mode: "campaign" as const,
    committedAtTick: 300n,
    replayBundleRef: "bundle-store/run-t1.hhcb",
    // OPAQUE passthrough — a replay-lane bundle doc; save never decodes it
    replayBundle: { schemaVersion: 1, runSeed: 7n, intentLog: [{ tick: 5n, intent: { seq: 1, clock: "sim", atUs: 1000n, origin: "player", payload: { kind: "verb", verb: "rack-put", target: null, value: null } } }] },
  },
  { runId: "run-t3", mode: "consultant" as const, committedAtTick: 41_000n, replayBundleRef: "bundle-store/run-t3.hhcb" },
];

describe("Long Save artifact — envelope + lineage + replay bundles composed", () => {
  it("compose → serialize → digest → parse round-trips; the embedded bundle stays opaque", () => {
    const doc = composeLongSave(fixtureSave(), runRefs());
    const text = serializeLongSave(doc);
    expect(digestLongSave(doc)).toMatch(/^[0-9a-f]{16}$/);
    const revived = parseLongSave(text);
    expect(revived.schemaVersion).toBe(LONG_SAVE_SCHEMA_VERSION);
    expect(revived.runs.length).toBe(2);
    expect(revived.envelope.lineage.nodes.size).toBe(2);
    const embedded = revived.runs[0]?.replayBundle as { runSeed: bigint };
    expect(embedded.runSeed).toBe(7n); // composed AROUND the bundle without ever decoding it
  });

  it("digest stable ×10 across recomputation (runs order is content — pinned, not shuffled)", () => {
    const digests = new Set<string>();
    for (let i = 0; i < 10; i += 1) digests.add(digestLongSave(composeLongSave(fixtureSave(), runRefs())));
    expect(digests.size).toBe(1);
  });

  it("duplicate run ids and unknown modes fail loud at composition/parse (Law 4)", () => {
    const first = runRefs()[0];
    if (first === undefined) throw new Error("fixture");
    expect(() => composeLongSave(fixtureSave(), [first, { ...first }])).toThrow(/duplicate run/);
    expect(() =>
      parseLongSaveWire({
        schemaVersion: 1,
        envelope: saveFileToWire(fixtureSave()),
        runs: [{ runId: "r", mode: "ping-pong", committedAtTick: 1n, replayBundleRef: "x" }],
      }),
    ).toThrow(/not a known save mode/);
  });

  it("the lineage tree inside the artifact re-validates its 3-node law on parse", () => {
    const doc: LongSaveDoc = composeLongSave(fixtureSave(), []);
    const wire = fromCanonicalJson(serializeLongSave(doc)) as Record<string, unknown>;
    const envelope = wire.envelope as { lineage: { edges: Record<string, unknown>[] } };
    const manifest = envelope.lineage.edges[0]?.manifest as { keptNodes: unknown[] };
    if (manifest === undefined) throw new Error("fixture needs an edge");
    manifest.keptNodes = manifest.keptNodes.slice(0, 2);
    expect(() => parseLongSaveWire(wire)).toThrow(/exactly 3|3-node law/);
  });
});

/* ═══════════════════════ 10. faces are VIEWS, not buckets ═══════════════════════ */

describe("Four read faces compile from facets (query views)", () => {
  const ctxFor = (save: SaveFile) => ({ streaks: save.streaksShared, globalRecords: { totalCompanies: 1 } });

  it("each face reads its mapped facets (Appendix C §2.3 table)", () => {
    const save = fixtureSave();
    const founder = id("co-gen-1");
    const wall = readFace(founder, save.lineage, "wall", ctxFor(save));
    const scrap = readFace(founder, save.lineage, "scrapbook", ctxFor(save));
    const alm = readFace(founder, save.lineage, "almanac", ctxFor(save));
    const ppl = readFace(founder, save.lineage, "people", ctxFor(save));
    if (wall.face !== "wall" || scrap.face !== "scrapbook" || alm.face !== "almanac" || ppl.face !== "people") throw new Error("face dispatch mismatch");
    expect(wall.view.streaks.uptime.current).toBe(2); // shared streak surfaces through the Wall view
    expect(scrap.view.scars.length).toBe(1);
    expect(alm.view.attributionEvents).toEqual([]);
    expect(ppl.view.wikiAuthorship).toEqual([]);
    // storage discipline: no face exposes a facet it doesn't own (§2.3)
    expect("staff" in wall.view).toBe(false);
    expect("records" in scrap.view).toBe(false);
  });

  it("the museum walks all four faces plus the immortal exhibit registry", () => {
    const save = fixtureSave();
    const tour = readMuseum(getNode(save.lineage, id("co-gen-1")), ctxFor(save));
    expect(tour.exhibits.map((e) => e.title)).toEqual(["The 2am Drive"]);
    expect(tour.wall.streaks).toBe(save.streaksShared);
  });

  it("a child's Scrapbook is EMPTY where the parent's is full — faces never leak across generations; only manifests travel", () => {
    const save = fixtureSave();
    const child = getNode(save.lineage, id("co-gen-2"));
    expect(child.scars).toEqual([]);
    expect(child.museum).toEqual([]);
    expect(child.nodesUnlocked.length).toBe(3); // …and that's the ENTIRE inheritance
  });
});
