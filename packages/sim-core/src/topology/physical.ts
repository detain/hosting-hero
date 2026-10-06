/**
 * Nested-grid physical index — MASTER_REPORT §4.2 R59–R71 (§7.3 placement &
 * space): floor → row → rack → U, traversed by continuous zoom.
 *
 * THE TWO-LAYER LAW, made structural: this index is what happens TOGETHER
 * (co-residency: same rack / same circuit); ./graph.ts data edges are what
 * can happen (dependency). Blast radius floods the graph and UNIONs the
 * domains materialized from here (./domains.ts) — geography never gates the
 * logical flood, and physical adjacency alone never fakes a dependency.
 *
 * This registry holds NO graph references. Where a query needs the power
 * tree (circuit budgets), the caller resolves the consumer list first via
 * `powerConsumers(graph, circuit)` in ./graph.ts and passes it in — keeping
 * the physical layer a single source of geometry (CONVENTIONS §2).
 *
 * Unit decisions (integer-only, §3.4):
 *  - power is whole milliwatts (bigint); the per-circuit 80 % derate is the
 *    exact rational ×80/100 — "the shared-PDU single best placement trap"
 *    (§7.3) must be visible from these numbers alone;
 *  - latency deltas are integer µs (SimTimeUs). They are NOT Fixed: Q16.16
 *    caps at ≈32.77 in its unit, so a region delta of 60–160 ms cannot be
 *    represented as µs-scaled Fixed without overflow (fixed.ts would fail
 *    loud). Every latency in types.ts (patienceUs, serviceTimeUs, budgets)
 *    is already integer-µs bigint — this table follows the contract;
 *  - weights are whole grams; thermal coupling is the one 0..1 ratio, held
 *    as Fixed per the kernel.
 */

import type { EntityId, Fixed, SimTimeUs } from "../types.ts";
import { FIXED_ZERO, fromRatio } from "../kernel/fixed.ts";
import { compareIds } from "./graph.ts";

/* ═══════════════════════════ Registry shapes ═══════════════════════════ */

export interface FacilityDraft {
  readonly id: EntityId;
  readonly region: string;
}

export interface FacilityRecord extends FacilityDraft {}

export interface RackDraft {
  readonly id: EntityId;
  readonly facility: EntityId;
  readonly floor: number;
  readonly row: number;
  /** Position within the row (aisle index) — adjacency is |Δposition|. */
  readonly position: number;
  readonly capacityU: number;
  /** Floor-loading rating for the rack's footprint, grams (§7.3 "tipped
   *  racks are your fault" stub). */
  readonly ratedFloorLoadGrams: number;
}

export interface RackRecord extends RackDraft {}

export interface PlacementDraft {
  /** Graph node being placed (a server, a switch, a PDU — anything that
   *  occupies metal). */
  readonly node: EntityId;
  readonly rack: EntityId;
  /** 1-based bottom U of the device. */
  readonly uStart: number;
  readonly uHeight: number;
  readonly weightGrams: number;
  /** Steady-state draw in milliwatts; null = unpowered node. */
  readonly powerDrawMw: bigint | null;
}

export interface PlacementRecord extends PlacementDraft {}

export interface CircuitDraft {
  /** Graph node of the protective device (PDU/breaker) that owns the circuit. */
  readonly node: EntityId;
  readonly ratedMw: bigint;
}

/* ═══════════════════════════ Adjacency latency table ═══════════════════════════ */

export enum AdjacencyClass {
  SameRack = "same-rack",
  AdjacentRacks = "adjacent-racks",
  SameRow = "same-row",
  SameFloor = "same-floor",
  DifferentFloor = "different-floor",
  SameRegionDifferentFacility = "same-region-different-facility",
  DifferentRegion = "different-region",
}

/** One authored row of the table. Signed delta µs vs the network baseline;
 *  `loUs === hiUs` for deterministic point values, band otherwise. */
export interface AdjacencyLatencyRow {
  readonly adjacency: AdjacencyClass;
  readonly loUs: SimTimeUs;
  readonly hiUs: SimTimeUs;
}

/** §7.3 "latency geometry on map-levels": same rack −0.3 ms … region
 *  +60–160 ms. Authored once; symmetric by construction. */
export const ADJACENCY_LATENCY_TABLE: readonly AdjacencyLatencyRow[] = [
  { adjacency: AdjacencyClass.SameRack, loUs: -300n, hiUs: -300n },
  { adjacency: AdjacencyClass.AdjacentRacks, loUs: -150n, hiUs: -150n },
  { adjacency: AdjacencyClass.SameRow, loUs: -50n, hiUs: -50n },
  { adjacency: AdjacencyClass.SameFloor, loUs: 0n, hiUs: 0n },
  { adjacency: AdjacencyClass.DifferentFloor, loUs: 200n, hiUs: 200n },
  { adjacency: AdjacencyClass.SameRegionDifferentFacility, loUs: 1_000n, hiUs: 3_000n },
  { adjacency: AdjacencyClass.DifferentRegion, loUs: 60_000n, hiUs: 160_000n },
];

function tableRow(adjacency: AdjacencyClass): AdjacencyLatencyRow {
  const row = ADJACENCY_LATENCY_TABLE.find((r) => r.adjacency === adjacency);
  if (row === undefined) {
    throw new Error(`physical: no authored adjacency latency row for "${adjacency}"`);
  }
  return row;
}

/** Floor mean of the band — the deterministic single number for hover math
 *  (bigint division truncates toward −∞; means here: −300, −150, −50, 0,
 *  200, 2000, 110000 µs). */
export function adjacencyTypicalUs(adjacency: AdjacencyClass): SimTimeUs {
  const row = tableRow(adjacency);
  return (row.loUs + row.hiUs) / 2n;
}

/* ═══════════════════════════ Budget / verdict shapes ═══════════════════════════ */

export interface PowerBudget {
  readonly circuit: EntityId;
  readonly ratedMw: bigint;
  /** rated × 80 %, floor — NEVMA-style continuous-load derate. */
  readonly deratedCapMw: bigint;
  readonly drawnMw: bigint;
  /** deratedCap − drawn; negative = over budget (placement should have been
   *  refused; kept queryable so the HUD can draw the red bar). */
  readonly headroomMw: bigint;
  readonly overCap: boolean;
}

/** Exact 80 % derate as integer milliwatts (no float, no Fixed overflow). */
export function derate80(ratedMw: bigint): bigint {
  if (ratedMw < 0n) {
    throw new Error(`physical.derate80: negative rating ${ratedMw}mW`);
  }
  return (ratedMw * 80n) / 100n;
}

export interface FloorLoadVerdict {
  readonly facility: EntityId;
  readonly floor: number;
  readonly row: number;
  readonly totalGrams: number;
  readonly ratedGrams: number;
  readonly over: boolean;
}

export interface ThermalNeighbor {
  readonly rack: EntityId;
  readonly distance: number;
  /** 0..1 Fixed coupling — heat shares sideways, decays with gaps. */
  readonly coupling: Fixed;
}

/** Sideways heat sharing by row distance: 1 → 1/2, 2 → 1/4, else 0. */
export function thermalCouplingFixed(distance: number): Fixed {
  if (distance <= 0) return FIXED_ZERO;
  if (distance === 1) return fromRatio(1n, 2n);
  if (distance === 2) return fromRatio(1n, 4n);
  return FIXED_ZERO;
}

/* ═══════════════════════════ Adjacency classifier ═══════════════════════════ */

/**
 * Classify placement adjacency over records + their rack/facility context.
 * Symmetric in (a, b) by construction: every predicate is an equality or an
 * absolute difference. Resolver callbacks keep the classifier pure — tests
 * can prove symmetry without building an index.
 */
export function classifyPlacement(
  a: PlacementRecord,
  b: PlacementRecord,
  rackOf: (id: EntityId) => RackRecord | null,
  facilityOf: (id: EntityId) => FacilityRecord | null,
): AdjacencyClass {
  if (a.rack === b.rack) return AdjacencyClass.SameRack;
  const rackA = rackOf(a.rack);
  const rackB = rackOf(b.rack);
  if (rackA === null || rackB === null) {
    throw new Error(`physical: adjacency needs both racks registered ("${a.rack}", "${b.rack}")`);
  }
  if (rackA.facility !== rackB.facility) {
    const facA = facilityOf(rackA.facility);
    const facB = facilityOf(rackB.facility);
    if (facA === null || facB === null) {
      throw new Error("physical: adjacency needs both facilities registered");
    }
    return facA.region === facB.region
      ? AdjacencyClass.SameRegionDifferentFacility
      : AdjacencyClass.DifferentRegion;
  }
  if (rackA.floor !== rackB.floor) return AdjacencyClass.DifferentFloor;
  if (rackA.row !== rackB.row) return AdjacencyClass.SameFloor;
  return Math.abs(rackA.position - rackB.position) === 1
    ? AdjacencyClass.AdjacentRacks
    : AdjacencyClass.SameRow;
}

/* ═══════════════════════════ The index ═══════════════════════════ */

export interface PhysicalIndex {
  readonly version: number;

  registerFacility(draft: FacilityDraft): FacilityRecord;
  registerRack(draft: RackDraft): RackRecord;
  rack(id: EntityId): RackRecord | null;
  facility(id: EntityId): FacilityRecord | null;
  racksInRow(facility: EntityId, floor: number, row: number): readonly RackRecord[];

  placeDevice(draft: PlacementDraft): PlacementRecord;
  removeDevice(node: EntityId): void;
  placementOf(node: EntityId): PlacementRecord | null;
  devicesInRack(rack: EntityId): readonly PlacementRecord[];
  /** Lowest starting U with `uHeight` free contiguous slots, null if full. */
  findGap(rackId: EntityId, uHeight: number): number | null;

  registerCircuit(draft: CircuitDraft): CircuitDraft;
  circuitRating(node: EntityId): bigint | null;
  /** Sum the draw of `consumers` (resolved by the caller from the power
   *  tree) against this circuit's derated budget. */
  circuitBudget(circuit: EntityId, consumers: readonly EntityId[]): PowerBudget;

  adjacencyBetween(a: EntityId, b: EntityId): AdjacencyClass;
  adjacencyLatencyUs(a: EntityId, b: EntityId): SimTimeUs;
  thermalNeighbors(rackId: EntityId, span: number): readonly ThermalNeighbor[];
  floorLoadVerdict(facility: EntityId, floor: number, row: number): FloorLoadVerdict;
}

export function createPhysicalIndex(): PhysicalIndex {
  const facilities = new Map<EntityId, FacilityRecord>();
  const racks = new Map<EntityId, RackRecord>();
  const placements = new Map<EntityId, PlacementRecord>();
  /** rack id → U index → occupying node. */
  const occupancy = new Map<EntityId, Map<number, EntityId>>();
  const circuits = new Map<EntityId, bigint>();
  let version = 0;

  function requireFacility(id: EntityId): FacilityRecord {
    const found = facilities.get(id);
    if (found === undefined) throw new Error(`physical: unknown facility "${id}"`);
    return found;
  }

  function requireRack(id: EntityId): RackRecord {
    const found = racks.get(id);
    if (found === undefined) throw new Error(`physical: unknown rack "${id}"`);
    return found;
  }

  function requirePlacement(id: EntityId): PlacementRecord {
    const found = placements.get(id);
    if (found === undefined) throw new Error(`physical: node "${id}" has no placement`);
    return found;
  }

  function classify(a: EntityId, b: EntityId): AdjacencyClass {
    return classifyPlacement(
      requirePlacement(a),
      requirePlacement(b),
      (id) => racks.get(id) ?? null,
      (id) => facilities.get(id) ?? null,
    );
  }

  function devicesIn(rackId: EntityId): readonly PlacementRecord[] {
    requireRack(rackId);
    const found: PlacementRecord[] = [];
    for (const placement of placements.values()) {
      if (placement.rack === rackId) found.push(placement);
    }
    return found.sort((a, b) => a.uStart - b.uStart || compareIds(a.node, b.node));
  }

  function racksIn(facility: EntityId, floor: number, row: number): readonly RackRecord[] {
    requireFacility(facility);
    const found: RackRecord[] = [];
    for (const rack of racks.values()) {
      if (rack.facility === facility && rack.floor === floor && rack.row === row) found.push(rack);
    }
    return found.sort((a, b) => a.position - b.position || compareIds(a.id, b.id));
  }

  return {
    get version(): number {
      return version;
    },

    registerFacility(draft: FacilityDraft): FacilityRecord {
      if (facilities.has(draft.id)) throw new Error(`physical: duplicate facility "${draft.id}"`);
      if (draft.region.length === 0) throw new Error(`physical: facility "${draft.id}" has empty region`);
      const record: FacilityRecord = { id: draft.id, region: draft.region };
      facilities.set(record.id, record);
      version += 1;
      return record;
    },

    registerRack(draft: RackDraft): RackRecord {
      if (racks.has(draft.id)) throw new Error(`physical: duplicate rack "${draft.id}"`);
      requireFacility(draft.facility);
      if (!Number.isSafeInteger(draft.capacityU) || draft.capacityU < 1) {
        throw new Error(`physical: rack "${draft.id}" capacityU must be a positive safe integer`);
      }
      if (!Number.isSafeInteger(draft.ratedFloorLoadGrams) || draft.ratedFloorLoadGrams < 0) {
        throw new Error(`physical: rack "${draft.id}" ratedFloorLoadGrams must be a non-negative safe integer`);
      }
      const record: RackRecord = { ...draft };
      racks.set(record.id, record);
      version += 1;
      return record;
    },

    rack: (id: EntityId) => racks.get(id) ?? null,
    facility: (id: EntityId) => facilities.get(id) ?? null,

    racksInRow: racksIn,

    placeDevice(draft: PlacementDraft): PlacementRecord {
      if (placements.has(draft.node)) {
        throw new Error(`physical: node "${draft.node}" already placed — removeDevice first`);
      }
      const rack = requireRack(draft.rack);
      if (!Number.isSafeInteger(draft.uStart) || !Number.isSafeInteger(draft.uHeight)) {
        throw new Error(`physical: U coordinates for "${draft.node}" must be safe integers`);
      }
      if (draft.uHeight < 1) throw new Error(`physical: node "${draft.node}" needs uHeight ≥ 1`);
      if (draft.uStart < 1 || draft.uStart + draft.uHeight - 1 > rack.capacityU) {
        throw new Error(
          `physical: node "${draft.node}" does not fit rack "${rack.id}" (U ${draft.uStart}+${draft.uHeight} vs ${rack.capacityU}U)`,
        );
      }
      if (!Number.isSafeInteger(draft.weightGrams) || draft.weightGrams < 0) {
        throw new Error(`physical: node "${draft.node}" weightGrams must be a non-negative safe integer`);
      }
      const cells = occupancy.get(rack.id) ?? new Map<number, EntityId>();
      for (let u = draft.uStart; u < draft.uStart + draft.uHeight; u += 1) {
        const occupant = cells.get(u);
        if (occupant !== undefined) {
          throw new Error(`physical: U${u} of rack "${rack.id}" already holds "${occupant}" — U-Tetris collision`);
        }
      }
      for (let u = draft.uStart; u < draft.uStart + draft.uHeight; u += 1) cells.set(u, draft.node);
      occupancy.set(rack.id, cells);
      const record: PlacementRecord = { ...draft };
      placements.set(record.node, record);
      version += 1;
      return record;
    },

    removeDevice(node: EntityId): void {
      const placement = requirePlacement(node);
      const cells = occupancy.get(placement.rack);
      if (cells !== undefined) {
        for (let u = placement.uStart; u < placement.uStart + placement.uHeight; u += 1) cells.delete(u);
      }
      placements.delete(node);
      version += 1;
    },

    placementOf: (node: EntityId) => placements.get(node) ?? null,

    devicesInRack: devicesIn,

    findGap(rackId: EntityId, uHeight: number): number | null {
      const rack = requireRack(rackId);
      if (!Number.isSafeInteger(uHeight) || uHeight < 1) {
        throw new Error(`physical: findGap needs uHeight ≥ 1, got ${uHeight}`);
      }
      const cells = occupancy.get(rackId);
      for (let start = 1; start + uHeight - 1 <= rack.capacityU; start += 1) {
        let free = true;
        for (let u = start; u < start + uHeight; u += 1) {
          if (cells?.get(u) !== undefined) {
            free = false;
            break;
          }
        }
        if (free) return start;
      }
      return null;
    },

    registerCircuit(draft: CircuitDraft): CircuitDraft {
      if (circuits.has(draft.node)) throw new Error(`physical: duplicate circuit on "${draft.node}"`);
      if (draft.ratedMw <= 0n) throw new Error(`physical: circuit "${draft.node}" rating must be > 0 mW`);
      circuits.set(draft.node, draft.ratedMw);
      version += 1;
      return draft;
    },

    circuitRating: (node: EntityId) => circuits.get(node) ?? null,

    circuitBudget(circuit: EntityId, consumers: readonly EntityId[]): PowerBudget {
      const ratedMw = circuits.get(circuit);
      if (ratedMw === undefined) throw new Error(`physical: "${circuit}" is not a registered circuit`);
      let drawnMw = 0n;
      for (const consumer of consumers) {
        const placement = placements.get(consumer);
        if (placement === undefined) continue;
        if (placement.powerDrawMw !== null) drawnMw += placement.powerDrawMw;
      }
      const deratedCapMw = derate80(ratedMw);
      return {
        circuit,
        ratedMw,
        deratedCapMw,
        drawnMw,
        headroomMw: deratedCapMw - drawnMw,
        overCap: drawnMw > deratedCapMw,
      };
    },

    adjacencyBetween: classify,

    adjacencyLatencyUs(a: EntityId, b: EntityId): SimTimeUs {
      return adjacencyTypicalUs(classify(a, b));
    },

    thermalNeighbors(rackId: EntityId, span: number): readonly ThermalNeighbor[] {
      const rack = requireRack(rackId);
      if (!Number.isSafeInteger(span) || span < 1) {
        throw new Error(`physical: thermal span must be a positive safe integer, got ${span}`);
      }
      const found: ThermalNeighbor[] = [];
      for (const candidate of racks.values()) {
        if (candidate.id === rack.id) continue;
        if (candidate.facility !== rack.facility || candidate.floor !== rack.floor || candidate.row !== rack.row) {
          continue;
        }
        const distance = Math.abs(candidate.position - rack.position);
        if (distance > span) continue;
        found.push({ rack: candidate.id, distance, coupling: thermalCouplingFixed(distance) });
      }
      return found.sort((a, b) => a.distance - b.distance || compareIds(a.rack, b.rack));
    },

    floorLoadVerdict(facility: EntityId, floor: number, row: number): FloorLoadVerdict {
      requireFacility(facility);
      let totalGrams = 0;
      let ratedGrams = 0;
      for (const rack of racksIn(facility, floor, row)) {
        ratedGrams += rack.ratedFloorLoadGrams;
        for (const device of devicesIn(rack.id)) totalGrams += device.weightGrams;
      }
      return { facility, floor, row, totalGrams, ratedGrams, over: totalGrams > ratedGrams };
    },
  };
}
