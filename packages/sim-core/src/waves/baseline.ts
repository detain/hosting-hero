/**
 * Diurnal baseline curves (§1.7: "baseline traffic is continuous, never
 * zero"). Curves are AUTHORED DATA — integer piecewise-linear tables passed
 * in by the caller. Nothing here knows what a "web host" or a "mail era"
 * is; types live in the content package, sampling lives here.
 *
 * Sampling is exact bigint integer interpolation, clock-scale invariant
 * (period and anchors are all SIM µs).
 */
import type { SimTimeUs } from "../types.ts";

export interface DiurnalCurvePoint {
  /** Offset within the period, µs, ascending, first point at 0. */
  readonly atUs: SimTimeUs;
  /** Relative traffic, positive integer micro-units (never zero → never a
   *  silent dead night). */
  readonly valueMicro: bigint;
}

export interface DiurnalCurveTable {
  readonly id: string;
  /** Period of repetition, µs (e.g. one sim day). */
  readonly periodUs: SimTimeUs;
  readonly points: readonly DiurnalCurvePoint[];
}

function asFiniteBigInt(value: unknown, where: string): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number" && Number.isSafeInteger(value)) return BigInt(value);
  throw new Error(`${where}: expected integer/bigint, got ${String(value)}`);
}

/**
 * Boundary parser (Law 2). Throws descriptive errors; what comes out is
 * trusted DiurnalCurveTable data for the rest of the system.
 */
export function parseDiurnalCurve(raw: unknown): DiurnalCurveTable {
  if (typeof raw !== "object" || raw === null) throw new Error("diurnal curve: expected object");
  const obj = raw as Record<string, unknown>;
  const id = typeof obj.id === "string" && obj.id.length > 0 ? obj.id : null;
  if (id === null) throw new Error("diurnal curve: missing/empty id");
  const periodUs = asFiniteBigInt(obj.periodUs, `diurnal curve ${id}: periodUs`);
  if (periodUs <= 0n) throw new Error(`diurnal curve ${id}: periodUs must be positive, got ${periodUs}`);
  if (!Array.isArray(obj.points) || obj.points.length < 2) {
    throw new Error(`diurnal curve ${id}: points must be an array of at least 2`);
  }
  let prevAt = -1n;
  const points: DiurnalCurvePoint[] = [];
  for (const [i, entry] of obj.points.entries()) {
    const where = `diurnal curve ${id} point ${i}`;
    if (typeof entry !== "object" || entry === null) throw new Error(`${where}: expected object`);
    const p = entry as Record<string, unknown>;
    const atUs = asFiniteBigInt(p.atUs, `${where}: atUs`);
    const valueMicro = asFiniteBigInt(p.valueMicro, `${where}: valueMicro`);
    if (atUs <= prevAt) throw new Error(`${where}: atUs ${atUs} must strictly ascend (prev ${prevAt})`);
    if (atUs >= periodUs) throw new Error(`${where}: atUs ${atUs} must be inside period ${periodUs}`);
    if (valueMicro <= 0n) throw new Error(`${where}: valueMicro must be > 0 — baseline is never zero (§1.7)`);
    points.push({ atUs, valueMicro });
    prevAt = atUs;
  }
  if (points[0]?.atUs !== 0n) throw new Error(`diurnal curve ${id}: first point must sit at atUs 0`);
  return { id, periodUs, points };
}

function mod(a: bigint, m: bigint): bigint {
  const r = a % m;
  return r < 0n ? r + m : r;
}

/**
 * Exact integer piecewise-linear sample at an absolute sim time.
 * The segment from the last point wraps to the first point +1 period.
 * Returns micro-units (bigint, unbounded — never squeezed through Fixed).
 */
export function sampleCurveMicro(curve: DiurnalCurveTable, atUs: SimTimeUs): bigint {
  const t = mod(atUs, curve.periodUs);
  const pts = curve.points;
  let seg = pts.length - 1; // wrap segment: last point → first point next period
  for (let i = 0; i < pts.length - 1; i += 1) {
    const next = pts[i + 1];
    if (next === undefined) break;
    if (t >= pts[i]!.atUs && t < next.atUs) {
      seg = i;
      break;
    }
  }
  const a = pts[seg]!;
  const b = seg === pts.length - 1 ? { atUs: pts[0]!.atUs + curve.periodUs, valueMicro: pts[0]!.valueMicro } : pts[seg + 1]!;
  const span = b.atUs - a.atUs;
  const delta = t - a.atUs;
  // Round-half-up integer interpolation.
  return (a.valueMicro * span + delta * (b.valueMicro - a.valueMicro) + span / 2n) / span;
}

/** Flat baseline used when a table ships no curve (never zero: 1 unit). */
export const FLAT_BASELINE: DiurnalCurveTable = {
  id: "flat",
  periodUs: 86_400_000_000n,
  points: [
    { atUs: 0n, valueMicro: 1_000_000n },
    { atUs: 43_200_000_000n, valueMicro: 1_000_000n },
  ],
};
