/**
 * Family-mix weights (audit fix 3, heading 11385): the bundles'
 * `threats.familyWeights` table was parsed, digested, and consulted by
 * nobody — waves only ever carried the qualitative `activeFamilies` list.
 *
 * This module turns the authored five-key table into the ONE thing the
 * traffic generator needs: a closed, code-unit-sorted list of
 * `{family, shareMicro}` buckets summing to exactly 1_000_000 (largest-
 * remainder renormalisation, ties by code point — never Map order, never
 * floating accumulation). The CONSUMER is the pipeline arrival step's
 * optional `familyMix` config: each minted unit draws its family from the
 * mix on the arrival stream and carries it as `trueIntent` — the bundle's
 * "who attacks me and how much" contract finally steering the dice.
 *
 * Accepts both authoring shapes: plain JSON numbers (0..1, the bundle text
 * domain) and LoadedFamilyWeights Fixed bigints (the loader domain, Q16.16)
 * — the loader lane is sibling-owned, so the engine must not assume which
 * side of the boundary the caller stands on.
 */

import type { ThreatFamily } from "../types.ts";

export const THREAT_FAMILIES: readonly ThreatFamily[] = Object.freeze([
  "customerAsThreat",
  "entropic",
  "human",
  "malicious",
  "systemic",
] as const);

/** One weighted family bucket, share in micro-units (sums to 1e6). */
export interface FamilyShare {
  readonly family: ThreatFamily;
  readonly shareMicro: number;
}

const FAMILY_SET = new Set<string>(THREAT_FAMILIES);

function toMicro(value: unknown, path: string): bigint {
  if (typeof value === "bigint") {
    // Fixed domain: ratio × 1e6, round-half-up.
    if (value < 0n) throw new Error(`${path}: family weight must be non-negative, got ${String(value)}`);
    return (value * 1_000_000n + 32_768n) / 65_536n;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`${path}: family weight must be a finite number ≥ 0, got ${String(value)}`);
    }
    return BigInt(Math.round(value * 1_000_000));
  }
  throw new Error(`${path}: family weight must be a number or Fixed bigint (null = unresolved — fill the table), got ${String(value)}`);
}

/**
 * Parse a five-key familyWeights table into normalized micro shares.
 * Fail-loud contract: every key present and NON-null (a half-authored table
 * is a lie the dice must not silently smooth over), total within ±1% of 1.0
 * (renormalised exactly to 1_000_000 by largest remainder), no unknown keys.
 * Output order is code-unit sorted → deterministic cumulative rolls.
 */
export function parseFamilyWeightsTable(
  weights: Readonly<Record<string, unknown>>,
  sourcePath = "threats.familyWeights",
): readonly FamilyShare[] {
  const keys = Object.keys(weights).filter((k) => k !== "_todo");
  for (const key of keys) {
    if (!FAMILY_SET.has(key)) {
      throw new Error(`${sourcePath}: unknown family key "${key}" (closed set: ${THREAT_FAMILIES.join(", ")})`);
    }
  }
  const micros = new Map<ThreatFamily, bigint>();
  for (const family of THREAT_FAMILIES) {
    const raw = weights[family];
    if (raw === null || raw === undefined) {
      throw new Error(`${sourcePath}.${family}: unresolved weight (${String(raw)}) — the familyMix consumer requires the full numeric table`);
    }
    micros.set(family, toMicro(raw, `${sourcePath}.${family}`));
  }
  const total = [...micros.values()].reduce((a, b) => a + b, 0n);
  if (total === 0n) throw new Error(`${sourcePath}: every weight is zero — nothing can attack`);
  // ±1% tolerance on the authored sum.
  const delta = total > 1_000_000n ? total - 1_000_000n : 1_000_000n - total;
  if (delta * 100n > total) {
    throw new Error(`${sourcePath}: weights sum to ${String(total)} micro, >1% off 1.0 — fix the table`);
  }
  // Renormalise to EXACTLY 1e6 by largest remainder (code-unit tie order).
  const shares = THREAT_FAMILIES.map((family) => ({
    family,
    floor: Number((micros.get(family)! * 1_000_000n) / total),
    rem: (micros.get(family)! * 1_000_000n) % total,
  }));
  let assigned = shares.reduce((a, s) => a + s.floor, 0);
  const order = [...shares].sort((a, b) => Number(b.rem - a.rem) || (a.family < b.family ? -1 : a.family > b.family ? 1 : 0));
  for (let i = 0; i < order.length && assigned < 1_000_000; i += 1) {
    order[i]!.floor += 1;
    assigned += 1;
  }
  return Object.freeze(
    THREAT_FAMILIES.map((family) => {
      const row = shares.find((s) => s.family === family)!;
      return Object.freeze({ family, shareMicro: row.floor });
    }),
  );
}
