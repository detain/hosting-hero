/**
 * Type-bundle boundary loader — Parse, Don't Validate (Law 2).
 *
 * The bundle JSON is authored with plain numbers (Appendix A convenience);
 * every number that enters sim math is PARSED here into Fixed/bigint integer
 * µs. A float never crosses this boundary into engine state.
 *
 * This is a deliberately MINIMAL loader for the headless harness: it reads
 * the handful of fields the stub composition consumes plus schemaVersion/id
 * guards. The content-schema (zod) agent owns the full validator; when it
 * lands, this file is where the two meet.
 */

import { asEntityId, fx, type EntityId, type Fixed, type NodeRecord, type SimTimeUs, type TypeBundle } from "./sim-core.ts";

export interface ParsedBundle {
  readonly bundle: TypeBundle;
  /** visitor.patienceModel.params.budgetMs → integer µs (no float math: ms×1000). */
  readonly patienceUs: SimTimeUs | null;
  readonly unitTerm: string;
  /** visitor.weight (0..100 scale) → baseline arrivals per sim-minute (Fixed). */
  readonly baselineRatePerMin: Fixed;
}

export function parseBundleJson(raw: string, source: string): ParsedBundle {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`bundle ${source}: invalid JSON — ${String(error)}`);
  }
  return parseBundleValue(parsed, source);
}

export function parseBundleValue(value: unknown, source: string): ParsedBundle {
  const bundle = toTypeBundle(value, source);

  const budgetMs = bundle.visitor?.patienceModel?.params?.budgetMs;
  const patienceUs = budgetMs === undefined ? null : msToUs(budgetMs, `${source}:visitor.patienceModel.params.budgetMs`);

  const unitTerm = bundle.visitor?.unitTerm ?? "visitor";

  const weight = bundle.visitor?.stats?.weight;
  const baselineRatePerMin =
    weight === undefined ? fx.fromRatio(6n, 1n) : rateFromWeight(weight, `${source}:visitor.stats.weight`);

  return { bundle, patienceUs, unitTerm, baselineRatePerMin };
}

function toTypeBundle(value: unknown, source: string): TypeBundle {
  if (typeof value !== "object" || value === null) {
    throw new Error(`bundle ${source}: expected an object, got ${typeof value}`);
  }
  const record = value as Record<string, unknown>;
  const schemaVersion = record["schemaVersion"];
  if (typeof schemaVersion !== "string" || schemaVersion.length === 0) {
    throw new Error(`bundle ${source}: missing required schemaVersion (string)`);
  }
  const id = record["id"];
  if (typeof id !== "string" || id.length === 0) {
    throw new Error(`bundle ${source}: missing required id (string)`);
  }
  return value as TypeBundle;
}

function msToUs(ms: number, path: string): SimTimeUs {
  if (!Number.isSafeInteger(ms) || ms < 0) {
    throw new Error(`${path}: budgetMs must be a non-negative safe integer, got ${String(ms)}`);
  }
  return BigInt(ms) * 1_000n;
}

function rateFromWeight(weight: number, path: string): Fixed {
  if (!Number.isFinite(weight) || weight < 0) {
    throw new Error(`${path}: weight must be a finite non-negative number, got ${String(weight)}`);
  }
  // Deterministic decimal parse: scale to tenths as an integer ratio.
  const tenths = Math.round(weight * 10);
  if (!Number.isSafeInteger(tenths)) throw new Error(`${path}: weight ${String(weight)} not representable`);
  // Stub mapping: arrivals/sim-minute = weight ÷ 10 (0..100 → 0..10/min —
  // sized so the demo estate runs near the knee instead of saturating).
  return fx.fromRatio(BigInt(tenths), 100n);
}

/** Node factories for the demo estate live in stub-slots; this helper exists
 *  for future bundle-driven topologies (buildables.archetypeInstances). */
export function nodeKindFromBundle(bundle: TypeBundle, fallback: string): string {
  const archetype = bundle.buildables?.archetypeInstances?.[0]?.archetype;
  return archetype ?? fallback;
}

export const DEMO_EDGE_ID: EntityId = asEntityId("edge-1");
export const DEMO_ORIGIN_ID: EntityId = asEntityId("origin-1");

/** Shape guard reused by the engine when real topologies land. */
export function assertNodeRecord(node: NodeRecord): void {
  if (node.slots.length === 0) throw new Error(`node ${node.id}: zero slots (S ≥ 1 required)`);
}
