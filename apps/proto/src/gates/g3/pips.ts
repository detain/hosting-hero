/**
 * gates/g3 · pips — pure derivation of the renderer's pip strip and lane
 * split numbers from protocol cells. Shape-First law (§4.7): the MARK, not
 * the color, carries classification — circle = express, triangle = pulled
 * into deep inspection; an inner dot marks a sticky-suspicion lineage.
 *
 * Pure + node-testable: (SimProjection) → rows. No Vue imports.
 */
import type { SimProjection } from "../../shared/protocol.ts";

export interface G3Pip {
  /** Short label — position in the wave, never a raw entity handle. */
  readonly label: string;
  /** Confidence 0..1 (display domain). */
  readonly confidence: number;
  readonly lane: "express" | "deep";
  /** Decayed lineage suspicion 0..1 (sticky ledger readout). */
  readonly suspicion: number;
}

export interface G3LaneSplit {
  readonly express: number;
  readonly deep: number;
  readonly demoted: number;
  readonly routedExpressFresh: number;
  readonly routedDeepFresh: number;
}

export const FIXED_SCALE = 65536;

function scanSuffix(projection: SimProjection, suffix: string): Map<string, number | string> {
  const out = new Map<string, number | string>();
  for (const [key, cell] of projection.observed) {
    const k = String(key);
    if (!k.endsWith(suffix) || cell.value === null) continue;
    out.set(k.slice(0, k.length - suffix.length), typeof cell.value === "bigint" ? Number(cell.value) : cell.value);
  }
  return out;
}

/** Short human label from the deterministic id grammar
 *  `${tableId}@${tick}#${entry}.${index}` → "t3·0.2" (wave tick + slot). */
export function pipLabel(unitKey: string): string {
  const at = unitKey.lastIndexOf("@");
  if (at === -1) return unitKey.slice(0, 10);
  const tail = unitKey.slice(at + 1);
  const hash = tail.indexOf("#");
  if (hash === -1) return `t${tail}`;
  return `t${tail.slice(0, hash)}·${tail.slice(hash + 1)}`;
}

/** Live pip rows — DEEP-lane units first (the strip exists to show who got
 *  yanked), then express, each group in deterministic write order; capped
 *  from the tail so the strip is budget-bounded regardless of traffic. */
export function derivePips(projection: SimProjection, maxRows = 14): readonly G3Pip[] {
  const confidences = scanSuffix(projection, "::confidence");
  const lanes = scanSuffix(projection, "::lane");
  const suspicions = scanSuffix(projection, "::suspicion");
  const deep: G3Pip[] = [];
  const express: G3Pip[] = [];
  for (const [entity, confRaw] of confidences) {
    const row = Object.freeze({
      label: pipLabel(entity),
      confidence: Number(confRaw) / FIXED_SCALE,
      lane: lanes.get(entity) === "deep" ? ("deep" as const) : ("express" as const),
      suspicion: Number(suspicions.get(entity) ?? 0) / FIXED_SCALE,
    });
    if (row.lane === "deep") deep.push(row);
    else express.push(row);
  }
  const all = [...deep, ...express];
  return Object.freeze(all.slice(0, maxRows));
}

function laneRate(projection: SimProjection, laneId: string): number {
  const lane = projection.lanes.find((l) => String(l.laneId) === laneId);
  return lane === undefined ? 0 : Number(lane.ratePerMin) / FIXED_SCALE;
}

function cellNumber(projection: SimProjection, suffix: string): number {
  for (const [key, cell] of projection.observed) {
    if (String(key).endsWith(suffix)) return Number(cell.value ?? 0);
  }
  return 0;
}

/** Lane split numbers: live counts from LaneStats aggregates, history from
 *  the cumulative counter cells. No roster math in the renderer. */
export function deriveLaneSplit(projection: SimProjection): G3LaneSplit {
  return Object.freeze({
    express: Math.round(laneRate(projection, "lane/express")),
    deep: Math.round(laneRate(projection, "lane/deep")),
    demoted: cellNumber(projection, "lane/deep::demoted"),
    routedExpressFresh: cellNumber(projection, "lane/express::routedFresh"),
    routedDeepFresh: cellNumber(projection, "lane/deep::routedFresh"),
  });
}
