/**
 * InstrumentRegistry (§1.8): "one bezel asset re-skinned by era tokens;
 * EXACTLY 5 faces (needle/bar/waterline/oscilloscope/counter); each carries
 * unit stamp + nominal band + threshold mark + ghost trace; one alarm
 * behaviour; at nominal, instruments are still; every instrument has Readout
 * Mode." The fog binding law (§4.1, ARCHITECTURE §4.1) lives in
 * `instrumentReading` — degradation is a property of THIS binding layer, not
 * of 200 components.
 */
import type { ProtoCell } from "../../shared/protocol";
import type { FaceKind } from "./faces";

export type { FaceKind };
export const FACE_KINDS: readonly FaceKind[] = ["needle", "bar", "waterline", "scope", "counter"];

/** How a cell's payload maps to a display number. "fixed" = Q16.16 bigint,
 *  "raw" = plain int cell. (Display-side parse — never writes back.) */
export type CellScale = "fixed" | "raw";

export interface InstrumentDef {
  readonly id: string;
  readonly label: string;
  /** The observed-cell address: `${entityId}::${property}` split in two so
   *  ids stay opaque. */
  readonly entity: string;
  readonly property: string;
  readonly scale: CellScale;
  readonly face: FaceKind;
  /** Unit stamp, printed, never abbreviated below its floor (Number Law). */
  readonly unit: string;
  /** Comfortable operating band [low, high] in display units. */
  readonly nominal: readonly [number, number];
  /** The alarm line; direction says which side kills you. */
  readonly threshold: number;
  readonly direction: "up" | "down";
  /** Full-scale for ratio normalization on faces. */
  readonly fullScale: number;
}

export type InstrumentState = "nominal" | "warn" | "alarm" | "no-data";

export interface InstrumentReading {
  readonly state: InstrumentState;
  /** null whenever state is "no-data" — nothing, not zero (R-66). */
  readonly value: number | null;
  /** 0..1 across fullScale for face geometry; null = no geometry to draw. */
  readonly ratio: number | null;
  /** True when the face must be STILL (§1.8: at nominal, instruments are
   *  still — motion is reserved for departure from nominal). */
  readonly isStill: boolean;
  /** Certainty 0..1 from the cell — drives stroke weight (hairline=inferred,
   *  normal=measured, heavy=verified, §1.1). */
  readonly certainty: number;
}

/** The one binding computation every face/bezel shares. */
export function instrumentReading(def: InstrumentDef, cell: ProtoCell | undefined): InstrumentReading {
  const certainty = cell === undefined ? 0 : Number(cell.certainty) / 65536;
  const value = displayValue(def, cell);
  if (value === null) {
    return { state: "no-data", value: null, ratio: null, isStill: true, certainty };
  }
  const ratio = Math.max(0, Math.min(1, value / (def.fullScale === 0 ? 1 : def.fullScale)));
  const breached = def.direction === "up" ? value >= def.threshold : value <= def.threshold;
  const insideNominal = value >= def.nominal[0] && value <= def.nominal[1];
  const state: InstrumentState = breached ? "alarm" : insideNominal ? "nominal" : "warn";
  return {
    state,
    value,
    ratio,
    isStill: state === "nominal",
    certainty,
  };
}

function displayValue(def: InstrumentDef, cell: ProtoCell | undefined): number | null {
  if (cell === undefined || cell.value === null) return null;
  if (def.scale === "fixed") {
    // Fixed cells arrive as Q16.16 bigint at this layer; an int payload under
    // a fixed binding is a producer bug — refuse loudly rather than guess.
    if (typeof cell.value !== "bigint") {
      throw new Error(`instrument "${def.id}": expected fixed cell, got ${typeof cell.value}`);
    }
    return Number(cell.value) / 65536;
  }
  if (typeof cell.value === "bigint") {
    throw new Error(`instrument "${def.id}": expected int cell, got fixed`);
  }
  if (typeof cell.value !== "number") {
    throw new Error(`instrument "${def.id}": expected numeric cell, got text`);
  }
  return cell.value;
}

/** Readout Mode text (§1.10: "the diegetic version is the pretty one; the
 *  readout is the honest one; both always available"). NO DATA reads "?" —
 *  visually distinct from a zero, per the drawer house-spec. */
export function formatReadout(def: InstrumentDef, reading: InstrumentReading): string {
  if (reading.state === "no-data") return "?";
  const value = reading.value ?? 0;
  const rounded = def.scale === "fixed" ? value.toFixed(2) : Math.round(value).toString();
  return `${def.label} ${rounded} ${def.unit}${reading.state === "alarm" ? " — breach" : ""}`;
}

/** Hand-wave-detector helper for authoring: every def must actually be able
 *  to express the four required marks (throw at registration if not). */
export function assertInstrumentComplete(def: InstrumentDef): void {
  if (!Number.isFinite(def.threshold)) {
    throw new Error(`instrument "${def.id}": missing threshold mark — hand-wave rejected`);
  }
  if (def.nominal[0] > def.nominal[1]) {
    throw new Error(`instrument "${def.id}": inverted nominal band`);
  }
  if (!FACE_KINDS.includes(def.face)) {
    throw new Error(`instrument "${def.id}": face "${def.face}" is not one of the five`);
  }
}

/** The G1 demo roster — five instruments, one per face, bound to mock metrics. */
export const G1_INSTRUMENTS: readonly InstrumentDef[] = [
  {
    id: "inst-rho",
    label: "Load ρ",
    entity: "node/app-1",
    property: "utilizationRho",
    scale: "fixed",
    face: "needle",
    unit: "ρ",
    nominal: [0, 0.7],
    threshold: 0.9,
    direction: "up",
    fullScale: 1.2,
  },
  {
    id: "inst-queue",
    label: "Queue",
    entity: "node/app-1",
    property: "queueDepth",
    scale: "raw",
    face: "bar",
    unit: "units",
    nominal: [0, 20],
    threshold: 55,
    direction: "up",
    fullScale: 80,
  },
  {
    id: "inst-health",
    label: "Lane health",
    entity: "node/app-1",
    property: "health",
    scale: "fixed",
    face: "waterline",
    unit: "h",
    nominal: [0.55, 1],
    threshold: 0.35,
    direction: "down",
    fullScale: 1,
  },
  {
    id: "inst-p50",
    label: "p50 latency",
    entity: "node/app-1",
    property: "p50LatencyUs",
    scale: "raw",
    face: "scope",
    unit: "µs",
    nominal: [0, 260_000],
    threshold: 500_000,
    direction: "up",
    fullScale: 800_000,
  },
  {
    id: "inst-fp",
    label: "Amber-403s",
    entity: "lane/ingress-1",
    property: "falsePositives",
    scale: "raw",
    face: "counter",
    unit: "403",
    nominal: [0, 40],
    threshold: 120,
    direction: "up",
    fullScale: 1000,
  },
];
