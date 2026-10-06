/**
 * Authoring-rule enforcer — the content-CI gate (§1.7 pressure-budget
 * rules + §2.24 denomination/quota laws, hosting_game.md L25564).
 *
 * These are DESIGN laws, not schema laws: a table may parse fine and still
 * be badly authored. The enforcer returns every violation as data,
 * deterministically ordered (wave n, then code) so CI output is stable.
 */
import type { WaveTable, WaveDefinition } from "./table.ts";

export const VIOLATION_CODES = [
  "MAX_THREAT_ENTRIES_EXCEEDED",
  "FIRST_WAVE_OVER_40PCT_PAR",
  "TROUGH_NOT_DEEP_ENOUGH",
  "ROLE_QUOTA_EXCEEDED",
  "MISSING_NEW_ROLE_EVERY_4TH",
  "TWO_FRONT_DENOMINATIONS_EXCEEDED",
  "HARD_WAVE_SINGLE_FRONT",
  "DENOMINATION_QUOTA_PER_LEVEL_EXCEEDED",
] as const;
export type ViolationCode = (typeof VIOLATION_CODES)[number];

export interface WaveViolation {
  readonly code: ViolationCode;
  readonly waveN: number;
  readonly detail: string;
}

/** §1.7 pressure-budget constants (authoring law, not tuning). */
export const AUTHORING_LAWS = {
  maxThreatEntriesPerWave: 4,
  firstWaveMaxParPct: 40,
  troughMinDropPctBelowPeak: 45,
  maxRolesAbove30PctPerWave: 2,
  roleSharePctCeiling: 30,
  newRoleEveryNthWave: 4,
  maxDenominationsPerWave: 2,
  /** §2.24: "per level" = across the whole authored table, not one wave. */
  maxThreatsPerDenominationPerLevel: 4,
} as const;

function compareViolations(a: WaveViolation, b: WaveViolation): number {
  if (a.waveN !== b.waveN) return a.waveN - b.waveN;
  return a.code < b.code ? -1 : a.code > b.code ? 1 : 0;
}

function waveDenominations(wave: WaveDefinition): ReadonlyMap<string, string[]> {
  const map = new Map<string, string[]>();
  for (const entry of wave.entries) {
    for (const d of entry.denominations) {
      const threats = map.get(d) ?? [];
      if (!threats.includes(entry.threatId)) threats.push(entry.threatId);
      map.set(d, threats);
    }
  }
  return map;
}

function roleShares(wave: WaveDefinition): Map<string, number> {
  const shares = new Map<string, number>();
  for (const entry of wave.entries) {
    shares.set(entry.role, (shares.get(entry.role) ?? 0) + entry.sharePct);
  }
  return shares;
}

function checkWave(wave: WaveDefinition, table: WaveTable, index: number): WaveViolation[] {
  const laws = AUTHORING_LAWS;
  const out: WaveViolation[] = [];

  if (wave.entries.length > laws.maxThreatEntriesPerWave) {
    out.push({
      code: "MAX_THREAT_ENTRIES_EXCEEDED",
      waveN: wave.n,
      detail: `${wave.entries.length} threat entries in wave ${wave.n} of ${table.id} (max ${laws.maxThreatEntriesPerWave})`,
    });
  }

  const denominations = waveDenominations(wave);
  if (denominations.size > laws.maxDenominationsPerWave) {
    out.push({
      code: "TWO_FRONT_DENOMINATIONS_EXCEEDED",
      waveN: wave.n,
      detail: `wave ${wave.n} presses ${denominations.size} denominations [${[...denominations.keys()].sort().join(", ")}] (max ${laws.maxDenominationsPerWave})`,
    });
  }
  if (wave.hard && denominations.size < laws.maxDenominationsPerWave) {
    out.push({
      code: "HARD_WAVE_SINGLE_FRONT",
      waveN: wave.n,
      detail: `hard wave ${wave.n} draws only ${denominations.size} denomination(s) — every hard wave must draw two (§2.24)`,
    });
  }
  const hotRoles = [...roleShares(wave).entries()]
    .filter(([, share]) => share > laws.roleSharePctCeiling)
    .map(([role]) => role)
    .sort();
  if (hotRoles.length > laws.maxRolesAbove30PctPerWave) {
    out.push({
      code: "ROLE_QUOTA_EXCEEDED",
      waveN: wave.n,
      detail: `${hotRoles.length} roles exceed ${laws.roleSharePctCeiling}% pressure in wave ${wave.n} [${hotRoles.join(", ")}] (max ${laws.maxRolesAbove30PctPerWave})`,
    });
  }

  if (wave.n % laws.newRoleEveryNthWave === 0) {
    const seenRecent = new Set<string>();
    for (let i = Math.max(0, index - 3); i < index; i += 1) {
      for (const e of table.waves[i]?.entries ?? []) seenRecent.add(e.role);
    }
    const fresh = wave.entries.map((e) => e.role).filter((r) => !seenRecent.has(r));
    if (fresh.length === 0) {
      out.push({
        code: "MISSING_NEW_ROLE_EVERY_4TH",
        waveN: wave.n,
        detail: `wave ${wave.n} must introduce a role unseen in the previous ${laws.newRoleEveryNthWave - 1} waves (§2.1 cadence)`,
      });
    }
  }

  return out;
}

/**
 * Run every authored-wave law against a parsed table.
 * Trough rule: a LOCAL MINIMUM in parPct (drop from the wave before, no
 * drop after) must sit ≥45% below the highest parPct seen before it.
 */
export function enforceWaveTable(table: WaveTable): readonly WaveViolation[] {
  const laws = AUTHORING_LAWS;
  const violations: WaveViolation[] = [];
  const waves = table.waves;

  const first = waves[0];
  if (first !== undefined && first.parPct > laws.firstWaveMaxParPct) {
    violations.push({
      code: "FIRST_WAVE_OVER_40PCT_PAR",
      waveN: first.n,
      detail: `first wave spends ${first.parPct}% of par (max ${laws.firstWaveMaxParPct}%)`,
    });
  }

  let runningPeakPct = 0;
  for (let i = 0; i < waves.length; i += 1) {
    const wave = waves[i]!;
    const prev = waves[i - 1];
    const next = waves[i + 1];
    const isTrough =
      prev !== undefined &&
      wave.parPct < prev.parPct &&
      (next === undefined || wave.parPct <= next.parPct);
    if (isTrough && runningPeakPct > 0) {
      // Pure-integer test: (peak − trough) × 100 ≥ 45 × peak  ⇔  drop ≥45%.
      const dropScaled = (runningPeakPct - wave.parPct) * 100;
      const requiredScaled = laws.troughMinDropPctBelowPeak * runningPeakPct;
      if (dropScaled < requiredScaled) {
        violations.push({
          code: "TROUGH_NOT_DEEP_ENOUGH",
          waveN: wave.n,
          detail: `trough wave ${wave.n} at ${wave.parPct}% is not ≥${laws.troughMinDropPctBelowPeak}% below preceding peak ${runningPeakPct}% (sawtooth needs a real breath, §1.7c)`,
        });
      }
    }
    if (wave.parPct > runningPeakPct) runningPeakPct = wave.parPct;
    violations.push(...checkWave(wave, table, i));
  }

  // Table-level ("per level", §2.24): ≤4 distinct threats may share one
  // denomination across the WHOLE authored table. Reported against the last
  // wave that references the denomination (deterministic).
  const denomThreats = new Map<string, Set<string>>();
  const denomLastWave = new Map<string, number>();
  for (const wave of waves) {
    for (const [denom, threats] of waveDenominations(wave)) {
      const acc = denomThreats.get(denom) ?? new Set<string>();
      for (const t of threats) acc.add(t);
      denomThreats.set(denom, acc);
      denomLastWave.set(denom, wave.n);
    }
  }
  for (const denom of [...denomThreats.keys()].sort()) {
    const count = denomThreats.get(denom)?.size ?? 0;
    if (count > laws.maxThreatsPerDenominationPerLevel) {
      violations.push({
        code: "DENOMINATION_QUOTA_PER_LEVEL_EXCEEDED",
        waveN: denomLastWave.get(denom) ?? 0,
        detail: `${count} distinct threats share denomination "${denom}" across the level (max ${laws.maxThreatsPerDenominationPerLevel}) — variety per front collapses (§2.24)`,
      });
    }
  }

  return violations.sort(compareViolations);
}
