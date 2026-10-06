/**
 * Round-2 review fixes, each pinned by its test group (S-4, S-12, S-13,
 * S-14, S-16). Test names read as the laws they enforce (Law 5).
 */

import { describe, expect, it } from "vitest";
import {
  applyInheritanceManifest,
  assertLineageIntegrity,
  canonicalClone,
  canonicalJson,
  CREDIT_SCORE_MAX,
  digestSaveValue,
  emptyLineageGraph,
  foundCompany,
  newCompanyNode,
  newSaveFile,
  parseCompanyNode,
  parseSaveWire,
  saveFileToWire,
  spawnChildFromParent,
  UNIT_FRACTION_MAX,
  UNIT_FRACTION_MIN,
  type CompanyNode,
  type SaveFile,
} from "../index";
import { founderNode, graphWithFounder, id, legalManifest } from "./helpers";

/* ═══════════════════════ S-4: display-domain number law ═══════════════════════ */

type ScarRow = CompanyNode["scars"][number];
type UnlockRow = CompanyNode["nodesUnlocked"][number];

function founderWire(): CompanyNode {
  return canonicalClone(founderNode()) as unknown as CompanyNode;
}

function withScars(node: CompanyNode, mutate: (scar: ScarRow) => ScarRow): CompanyNode {
  return { ...node, scars: node.scars.map(mutate) };
}

function withUnlocks(node: CompanyNode, mutate: (u: UnlockRow) => UnlockRow): CompanyNode {
  return { ...node, nodesUnlocked: node.nodesUnlocked.map(mutate) };
}

describe("S-4 — exempted display-domain numbers are bounded at parse", () => {
  it("clearance.progress is a unit fraction — a day-count sneaking in as 31 is rejected", () => {
    expect(() => parseCompanyNode(withScars(founderWire(), (s) => ({ ...s, clearance: { ...s.clearance, progress: 31 } })))).toThrow(/outside display fraction/);
    expect(() => parseCompanyNode(withScars(founderWire(), (s) => ({ ...s, clearance: { ...s.clearance, progress: UNIT_FRACTION_MIN - 0.1 } })))).toThrow(/outside display fraction/);
    expect(() => parseCompanyNode(withScars(founderWire(), (s) => ({ ...s, clearance: { ...s.clearance, progress: UNIT_FRACTION_MAX } })))).not.toThrow();
    expect(() => parseCompanyNode(withScars(founderWire(), (s) => ({ ...s, clearance: { ...s.clearance, progress: UNIT_FRACTION_MIN } })))).not.toThrow();
  });

  it("nodesUnlocked.faded is a unit fraction — knowledge decay never drifts off the bar", () => {
    expect(() => parseCompanyNode(withUnlocks(founderWire(), (u) => ({ ...u, faded: 1.01 })))).toThrow(/outside display fraction/);
    expect(() => parseCompanyNode(withUnlocks(founderWire(), (u) => ({ ...u, faded: -0.001 })))).toThrow(/outside display fraction/);
    expect(() => parseCompanyNode(withUnlocks(founderWire(), (u) => ({ ...u, faded: 0.4 })))).not.toThrow();
  });

  it("creditGrade.score stays inside the 0..850 gauge — 851 is a bug, not a bonus", () => {
    const bad = { ...founderWire(), creditGrade: { ...founderWire().creditGrade, score: CREDIT_SCORE_MAX + 1 } };
    expect(() => parseCompanyNode(bad)).toThrow(/outside credit score/);
    expect(() => parseCompanyNode({ ...bad, creditGrade: { ...bad.creditGrade, score: -1 } })).toThrow(/outside credit score/);
    expect(() => parseCompanyNode({ ...bad, creditGrade: { ...bad.creditGrade, score: CREDIT_SCORE_MAX } })).not.toThrow();
  });

  it("scar mapPosition is a safe-integer grid — half-cells and precision-lost giants rejected", () => {
    expect(() => parseCompanyNode(withScars(founderWire(), (s) => ({ ...s, mapPosition: { x: 4.5, y: 2 } })))).toThrow(/safe-integer grid/);
    expect(() => parseCompanyNode(withScars(founderWire(), (s) => ({ ...s, mapPosition: { x: 2 ** 53, y: 2 } })))).toThrow(/safe-integer grid/);
    expect(() => parseCompanyNode(withScars(founderWire(), (s) => ({ ...s, mapPosition: { x: -7, y: 3 } })))).not.toThrow();
  });

  it("-0 normalizes to +0 on every exempted leaf — a signed zero never enters display state", () => {
    const node = founderWire();
    const parsed = parseCompanyNode({
      ...withScars(withUnlocks(node, (u) => ({ ...u, faded: -0 })), (s) => ({
        ...s,
        clearance: { ...s.clearance, progress: -0 },
        mapPosition: { x: -0, y: -0 },
      })),
      creditGrade: { ...node.creditGrade, score: -0 },
    });
    const scar = parsed.scars[0];
    const unlock = parsed.nodesUnlocked[0];
    if (scar === undefined || unlock === undefined || scar.mapPosition === null) throw new Error("fixture");
    expect(Object.is(scar.clearance.progress, 0)).toBe(true);
    expect(Object.is(scar.mapPosition.x, 0)).toBe(true);
    expect(Object.is(scar.mapPosition.y, 0)).toBe(true);
    expect(Object.is(unlock.faded, 0)).toBe(true);
    expect(Object.is(parsed.creditGrade.score, 0)).toBe(true);
  });
});

/* ═══════════════════════ S-12: streak counter optional alignment ═══════════════════════ */

describe("S-12 — parseStreakCounter treats a missing lastEraseAtTick key as absent", () => {
  function streakWire(): Record<string, unknown> {
    const save = newSaveFile({ saveId: "s12", engineVersion: "0.1.0", simContract: "rng-v1", createdAtTick: 0n });
    return canonicalClone(saveFileToWire(save)) as Record<string, unknown>;
  }

  function uptimeOf(wire: Record<string, unknown>): Record<string, unknown> {
    return (wire.streaksShared as Record<string, Record<string, unknown>>).uptime as Record<string, unknown>;
  }

  it("key entirely absent parses as null (was: threw while siblings defaulted)", () => {
    const wire = streakWire();
    delete uptimeOf(wire).lastEraseAtTick;
    const save = parseSaveWire(wire);
    expect(save.streaksShared.uptime.lastEraseAtTick).toBeNull();
  });

  it("explicit null still parses as null (both wire shapes honored)", () => {
    const wire = streakWire();
    uptimeOf(wire).lastEraseAtTick = null;
    expect(parseSaveWire(wire).streaksShared.uptime.lastEraseAtTick).toBeNull();
  });

  it("a real bigint tick is preserved; a wrong type still fails loud (optional ≠ coercible)", () => {
    const good = streakWire();
    uptimeOf(good).lastEraseAtTick = 900n;
    expect(parseSaveWire(good).streaksShared.uptime.lastEraseAtTick).toBe(900n);
    const bad = streakWire();
    uptimeOf(bad).lastEraseAtTick = "900";
    expect(() => parseSaveWire(bad)).toThrow(/expected bigint/);
  });
});

/* ═══════════════════════ S-13: ghost roots rejected ═══════════════════════ */

describe("S-13 — assertLineageIntegrity enforces roots ⊆ node set", () => {
  it("a declared root with no vertex is a ghost genealogy — fail loud", () => {
    const { graph } = graphWithFounder();
    expect(() => assertLineageIntegrity({ ...graph, roots: [...graph.roots, id("ghost-co")] })).toThrow(/ghost root/);
  });

  it("honest roots still pass (the check never cries wolf)", () => {
    const { graph } = graphWithFounder();
    expect(() => assertLineageIntegrity(graph)).not.toThrow();
  });

  it("the ghost is caught through the full wire boundary too, not just the direct call", () => {
    const { graph } = graphWithFounder();
    const save = newSaveFile({ saveId: "s13", engineVersion: "0.1.0", simContract: "rng-v1", createdAtTick: 0n });
    const wire = saveFileToWire({ ...save, lineage: { ...graph, roots: [...graph.roots, id("phantom")] } }) as unknown as Record<string, unknown>;
    expect(() => parseSaveWire(canonicalClone(wire))).toThrow(/ghost root/);
  });
});

/* ═══════════════════════ S-14: cash slice gets applied ═══════════════════════ */

describe("S-14 — applyInheritanceManifest materializes the T7 cash slice (present-on-exit-only)", () => {
  it("spawn records the manifest, apply spends it — the child's cash lands exactly once", () => {
    const { graph, founderId } = graphWithFounder();
    const manifest = { ...legalManifest(), cashSliceMicroUsd: 250_000n };
    const { child } = spawnChildFromParent(graph, founderId, { childId: "co-gen-2", name: "II", foundedAtTick: 200n, manifest, succession: "exit" });
    expect(child.finances.cashMicroUsd).toBe(0n); // bootstrap has NOT run yet — provably zero
    const bootstrapped = applyInheritanceManifest(child, manifest);
    expect(bootstrapped.finances.cashMicroUsd).toBe(250_000n);
    expect(child.finances.cashMicroUsd).toBe(0n); // pure: the input node is untouched (Law 3)
    const revived = parseCompanyNode(canonicalClone(bootstrapped));
    expect(revived.finances.cashMicroUsd).toBe(250_000n); // survives the full wire round-trip
  });

  it("null slice on an exit edge is the explicit 'inherits nothing' → cash pinned to 0", () => {
    const { graph, founderId } = graphWithFounder();
    const { child } = spawnChildFromParent(graph, founderId, { childId: "c-nul", name: "N", foundedAtTick: 200n, manifest: legalManifest(), succession: "exit" });
    const applied = applyInheritanceManifest(child, legalManifest());
    expect(applied.finances.cashMicroUsd).toBe(0n);
  });

  it("a non-null slice meeting a non-exit child throws — the law is checked at apply, not only at spawn", () => {
    const failureChild = newCompanyNode({ id: "f", parentId: "p", name: "f", eraOrigin: "e", foundedAtTick: 0n, successionType: "failure_restart" });
    expect(() => applyInheritanceManifest(failureChild, { ...legalManifest("p"), cashSliceMicroUsd: 10n })).toThrow(/cross exit edges only/);
    const pivotChild = newCompanyNode({ id: "v", parentId: "p", name: "v", eraOrigin: "e", foundedAtTick: 0n, successionType: "npc_pivot" });
    expect(() => applyInheritanceManifest(pivotChild, { ...legalManifest("p"), cashSliceMicroUsd: 10n })).toThrow(/cross exit edges only/);
  });

  it("founders have no manifest to apply; negative slices are debts in cash's clothing — both throw", () => {
    const founder = newCompanyNode({ id: "g0", parentId: null, name: "g", eraOrigin: "e", foundedAtTick: 0n, successionType: "found" });
    expect(() => applyInheritanceManifest(founder, legalManifest("g0"))).toThrow(/founder/);
    const exitChild = newCompanyNode({ id: "x", parentId: "p", name: "x", eraOrigin: "e", foundedAtTick: 0n, successionType: "exit" });
    expect(() => applyInheritanceManifest(exitChild, { ...legalManifest("p"), cashSliceMicroUsd: -1n })).toThrow(/negative/);
  });
});

/* ═══════════════════════ S-16: serialize stability ═══════════════════════ */

/** Rebuild plain objects with REVERSED key insertion order, recursively.
 *  Maps/Sets keep their order — array/Map order IS content by law. */
function deepShuffleKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(deepShuffleKeys);
  if (value instanceof Map) return new Map([...value].map(([k, v]) => [k, deepShuffleKeys(v)]));
  if (value instanceof Set) return value;
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, deepShuffleKeys(v)]).reverse();
    return Object.fromEntries(entries);
  }
  return value;
}

function twoGenSave(): SaveFile {
  const { graph, founderId } = graphWithFounder();
  const { graph: g2 } = spawnChildFromParent(graph, founderId, { childId: "co-gen-2", name: "II", foundedAtTick: 300n, manifest: legalManifest(), succession: "exit" });
  const base = newSaveFile({ saveId: "s16", engineVersion: "0.1.0", simContract: "rng-v1", createdAtTick: 0n });
  return { ...base, lineage: g2 };
}

describe("S-16 — serialization stability: key-shuffle is invisible, creation order is content", () => {
  it("shuffling key insertion order anywhere inside node content changes neither bytes nor digest", () => {
    const wire = saveFileToWire(twoGenSave());
    const shuffled = deepShuffleKeys(wire);
    expect(canonicalJson(shuffled)).toBe(canonicalJson(wire));
    expect(digestSaveValue(shuffled)).toBe(digestSaveValue(wire));
    expect(() => parseSaveWire(canonicalClone(shuffled) as Record<string, unknown>)).not.toThrow();
  });

  it("the nodes-array creation order IS content: different Map insertion → different bytes, same parsed set", () => {
    const save = twoGenSave();
    const ordered = new Map(save.lineage.nodes); // founder inserted first
    const reversed = new Map([...ordered].reverse());
    const wireA = saveFileToWire({ ...save, lineage: { ...save.lineage, nodes: ordered } });
    const wireB = saveFileToWire({ ...save, lineage: { ...save.lineage, nodes: reversed } });
    expect(canonicalJson(wireA)).not.toBe(canonicalJson(wireB));
    const parsedA = parseSaveWire(canonicalClone(wireA) as Record<string, unknown>);
    const parsedB = parseSaveWire(canonicalClone(wireB) as Record<string, unknown>);
    expect([...parsedA.lineage.nodes.keys()].sort()).toEqual([...parsedB.lineage.nodes.keys()].sort());
    expect(parsedA.lineage.nodes.size).toBe(2);
  });

  it("emptyLineageGraph stays valid under the new ghost-root law (zero roots, zero nodes)", () => {
    expect(() => assertLineageIntegrity(emptyLineageGraph())).not.toThrow();
    const { graph } = foundCompany(emptyLineageGraph(), { id: "solo", name: "s", eraOrigin: "e", foundedAtTick: 0n });
    expect(() => assertLineageIntegrity(graph)).not.toThrow();
  });
});
