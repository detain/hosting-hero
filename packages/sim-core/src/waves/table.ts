/**
 * Wave-table schema + boundary parser (§4.1 R-16: "randomness decides timing
 * and target, never existence" — existence lives HERE, in authored tables).
 *
 * parseWaveTable does STRUCTURE only (types, enums, sequential waves,
 * shares summing to 100, unique threatIds per wave — an identity law the
 * generator and replay ordinals depend on). Design-law breaks (≤4 entries, first-wave ≤40%
 * par, trough depth, role quota, new-role cadence, denomination caps) are
 * NOT parser errors — they are content-CI violations returned as data by
 * enforcer.ts, so an author sees every break in one run.
 */
import type { ThreatFamily } from "../types.ts";
import type { TelegraphBand } from "./bands.ts";
import { isTelegraphBand } from "./bands.ts";
import type { TuningSheetId } from "./pressure.ts";

/** Threat Role Taxonomy, 12 roles (§2.1 line 6061). */
export const THREAT_ROLES = [
  "swarm", "tank", "sapper", "stealth", "splitter", "healer",
  "bypass", "siege", "debuffer", "mimic", "parasite", "boss",
] as const;
export type ThreatRole = (typeof THREAT_ROLES)[number];

/** Damage denominations — the fronts a wave can press (§2.24). */
export const DAMAGE_DENOMINATIONS = [
  "bandwidth", "concurrency", "hands", "cash", "reputation", "data-integrity",
] as const;
export type DamageDenomination = (typeof DAMAGE_DENOMINATIONS)[number];

const ROLE_SET: ReadonlySet<string> = new Set(THREAT_ROLES);
const DENOM_SET: ReadonlySet<string> = new Set(DAMAGE_DENOMINATIONS);
const FAMILY_SET: ReadonlySet<string> = new Set([
  "malicious", "entropic", "human", "systemic", "customerAsThreat",
]);
const SHEET_SET: ReadonlySet<string> = new Set(["A", "B", "C"]);

export interface CompositionEntry {
  readonly threatId: string;
  readonly role: ThreatRole;
  readonly family: ThreatFamily;
  readonly band: TelegraphBand;
  /** Integer % of this wave's pressure budget; shares sum to 100. */
  readonly sharePct: number;
  /** Fronts this threat presses (1..6, wave-level ≤2 enforced by CI). */
  readonly denominations: readonly DamageDenomination[];
  /** Target pool — RNG picks ONE of these per unit (target, never existence). */
  readonly targets: readonly string[];
}

export interface WaveDefinition {
  /** 1-based, sequential. */
  readonly n: number;
  /** Placement window for the envelope, sim minutes. */
  readonly windowMinutes: number;
  readonly rampMin: number;
  readonly plateauMin: number;
  readonly decayMin: number;
  /** % of P(n) this wave spends; first wave ≤40 (enforced by CI). */
  readonly parPct: number;
  readonly hard: boolean;
  readonly entries: readonly CompositionEntry[];
  /** AUDIT FIX 4 (§2.24 feints): this wave opens with a decoy sub-burst —
   *  the first quarter of every entry's units (min 1) is re-parked on the
   *  envelope's opening beat. Timing-only split, zero RNG cost; consumed
   *  ONLY when the table also authors `rules.feints`. */
  readonly feint?: boolean;
  /** AUDIT FIX 4 (§2.24 second incident): a follow-on copy rides AFTER the
   *  envelope once an incident window is active (see WavePlanInput
   *  .incidentState). Authoring accepts a boolean OR the foreign slices'
   *  prose marker (non-empty string = present). */
  readonly secondIncident?: boolean;
}

/** §2.24 rules block, engine-facing subset (closed vocabulary — unknown
 *  keys throw at the boundary, never silently ignored). */
export interface WaveFeintRule {
  readonly maxPerLevel: number;
  readonly neverTwoLevelsInRow: boolean;
  readonly namedInPostmortem?: boolean;
}

export interface WaveRules {
  readonly feints?: WaveFeintRule;
  readonly secondIncidentMultiplierDuringIncident?: number;
  readonly secondIncidentMultiplierDuringRecovery?: number;
  /** [min, max] band; v0 CONSUMES THE LOWER BOUND deterministically. */
  readonly copycatReservePct?: readonly [number, number];
}

export interface WaveTable {
  readonly id: string;
  readonly typeBundleId: string;
  readonly tuningSheet: TuningSheetId;
  /** Units spawned per whole pressure point of a wave's budget (int ≥1). */
  readonly unitsPerPressurePoint: number;
  readonly waves: readonly WaveDefinition[];
  /** AUDIT FIX 4: the authored §2.24 rules block (absent ⇒ dead-neutral:
   *  feint/secondIncident/copycat semantics never fire). */
  readonly rules?: WaveRules;
}

function reqInt(obj: Record<string, unknown>, key: string, where: string, min: number): number {
  const v = obj[key];
  if (typeof v !== "number" || !Number.isSafeInteger(v) || v < min) {
    throw new Error(`${where}: ${key} must be an integer ≥ ${min}, got ${String(v)}`);
  }
  return v;
}

function reqString(obj: Record<string, unknown>, key: string, where: string): string {
  const v = obj[key];
  if (typeof v !== "string" || v.length === 0) throw new Error(`${where}: ${key} must be a non-empty string`);
  return v;
}

function parseEntry(raw: unknown, where: string): CompositionEntry {
  if (typeof raw !== "object" || raw === null) throw new Error(`${where}: entry must be an object`);
  const obj = raw as Record<string, unknown>;
  const threatId = reqString(obj, "threatId", where);
  const role = reqString(obj, "role", where);
  if (!ROLE_SET.has(role)) throw new Error(`${where}: unknown role "${role}"`);
  const family = reqString(obj, "family", where);
  if (!FAMILY_SET.has(family)) throw new Error(`${where}: unknown family "${family}"`);
  const band = obj.band;
  if (!isTelegraphBand(band)) throw new Error(`${where}: band must be weather|storm|hunter|entropy, got ${String(band)}`);
  const sharePct = reqInt(obj, "sharePct", where, 1);
  if (sharePct > 100) throw new Error(`${where}: sharePct ${sharePct} exceeds 100`);
  if (!Array.isArray(obj.denominations) || obj.denominations.length === 0) {
    throw new Error(`${where}: denominations must be a non-empty array`);
  }
  const denominations: DamageDenomination[] = [];
  for (const d of obj.denominations) {
    if (typeof d !== "string" || !DENOM_SET.has(d)) throw new Error(`${where}: unknown denomination ${String(d)}`);
    const denom = d as DamageDenomination;
    if (!denominations.includes(denom)) denominations.push(denom);
  }
  if (!Array.isArray(obj.targets) || obj.targets.length === 0) {
    throw new Error(`${where}: targets pool must be a non-empty array`);
  }
  const targets = obj.targets.map((t, i) => {
    if (typeof t !== "string" || t.length === 0) throw new Error(`${where}: targets[${i}] must be non-empty string`);
    return t;
  });
  return { threatId, role: role as ThreatRole, family: family as ThreatFamily, band, sharePct, denominations, targets };
}

function parseWave(raw: unknown, expectedN: number, where: string): WaveDefinition {
  if (typeof raw !== "object" || raw === null) throw new Error(`${where}: wave must be an object`);
  const obj = raw as Record<string, unknown>;
  const n = reqInt(obj, "n", where, 1);
  if (n !== expectedN) throw new Error(`${where}: wave n must be sequential starting at 1, got ${n}`);
  const windowMinutes = reqInt(obj, "windowMinutes", where, 1);
  const rampMin = reqInt(obj, "rampMin", where, 0);
  const plateauMin = reqInt(obj, "plateauMin", where, 0);
  const decayMin = reqInt(obj, "decayMin", where, 0);
  if (rampMin + plateauMin + decayMin > windowMinutes) {
    throw new Error(`${where}: envelope ${rampMin + plateauMin + decayMin}min exceeds window ${windowMinutes}min`);
  }
  const parPct = reqInt(obj, "parPct", where, 1);
  if (parPct > 100) throw new Error(`${where}: parPct ${parPct} exceeds 100`);
  if (typeof obj.hard !== "boolean") throw new Error(`${where}: hard must be a boolean`);
  if (!Array.isArray(obj.entries) || obj.entries.length === 0) {
    throw new Error(`${where}: entries must be a non-empty array`);
  }
  const entries = obj.entries.map((e, i) => parseEntry(e, `${where} entry ${i}`));
  // W1 (identity law, NOT a design law): threatIds are unique WITHIN a wave.
  // The generator keys existence by threatId (units[threatId]) and derives
  // causeId/unitId ordinals from it — a duplicate would silently clobber one
  // threat's existence onto the other and collide replay identities.
  const seenThreatIds = new Set<string>();
  for (const e of entries) {
    if (seenThreatIds.has(e.threatId)) {
      throw new Error(`${where}: duplicate threatId "${e.threatId}" within one wave`);
    }
    seenThreatIds.add(e.threatId);
  }
  const shareSum = entries.reduce((acc, e) => acc + e.sharePct, 0);
  if (shareSum !== 100) throw new Error(`${where}: sharePct must sum to 100, got ${shareSum}`);
  if (obj.feint !== undefined && typeof obj.feint !== "boolean") {
    throw new Error(`${where}: feint must be a boolean when present, got ${String(obj.feint)}`);
  }
  // Foreign slices author secondIncident as PROSE ("ticket avalanche
  // arrives inside the defacement window -> 1.8x…") — presence is the law,
  // the sentence is commentary. Engine tables author a boolean.
  const siRaw = obj.secondIncident;
  const secondIncident =
    typeof siRaw === "string" ? siRaw.length > 0 || undefined : siRaw === true ? true : siRaw === false ? false : undefined;
  if (typeof siRaw !== "undefined" && secondIncident === undefined) {
    throw new Error(`${where}: secondIncident must be a boolean or a non-empty prose marker, got ${String(siRaw)}`);
  }
  return {
    n,
    windowMinutes,
    rampMin,
    plateauMin,
    decayMin,
    parPct,
    hard: obj.hard,
    entries,
    ...(obj.feint === undefined ? {} : { feint: obj.feint }),
    ...(secondIncident === undefined ? {} : { secondIncident }),
  };
}

/** Closed §2.24 engine vocabulary — the ONLY rules keys parseRules accepts.
 *  Exported so the foreign-slice adapter (foreign.ts) projects onto exactly
 *  this set — one source of truth for "what the engine consumes". */
export const WAVE_RULE_KEYS = [
  "feints",
  "secondIncidentMultiplierDuringIncident",
  "secondIncidentMultiplierDuringRecovery",
  "copycatReservePct",
] as const;

const RULE_KEYS: ReadonlySet<string> = new Set(WAVE_RULE_KEYS);

/** Closed-vocabulary rules parser (§2.24). Structural gates that were
 *  already enforced unconditionally (maxThreatEntriesPerWave, firstWave-
 *  MaxParPct, denomination quotas, pool caps…) stay OUT of the engine
 *  surface: the engine consumes exactly the three DEAD-DATA families —
 *  feints, second-incident multipliers, copycat reserve. */
function parseRules(raw: unknown, where: string): WaveRules {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new Error(`${where}: rules must be an object`);
  }
  const obj = raw as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    if (!RULE_KEYS.has(key)) throw new Error(`${where}: unknown rules key "${key}" (closed vocabulary)`);
  }
  const rules: { -readonly [K in keyof WaveRules]: WaveRules[K] } = {};
  if (obj.feints !== undefined) {
    if (typeof obj.feints !== "object" || obj.feints === null) throw new Error(`${where}: rules.feints must be an object`);
    const f = obj.feints as Record<string, unknown>;
    for (const key of Object.keys(f)) {
      if (!new Set(["maxPerLevel", "neverTwoLevelsInRow", "namedInPostmortem"]).has(key)) {
        throw new Error(`${where}: unknown rules.feints key "${key}" (closed vocabulary)`);
      }
    }
    const maxPerLevel = reqInt(f, "maxPerLevel", `${where} rules.feints`, 1);
    if (typeof f.neverTwoLevelsInRow !== "boolean") {
      throw new Error(`${where}: rules.feints.neverTwoLevelsInRow must be a boolean`);
    }
    if (f.namedInPostmortem !== undefined && typeof f.namedInPostmortem !== "boolean") {
      throw new Error(`${where}: rules.feints.namedInPostmortem must be a boolean`);
    }
    rules.feints = {
      maxPerLevel,
      neverTwoLevelsInRow: f.neverTwoLevelsInRow,
      ...(f.namedInPostmortem === undefined ? {} : { namedInPostmortem: f.namedInPostmortem }),
    };
  }
  for (const key of ["secondIncidentMultiplierDuringIncident", "secondIncidentMultiplierDuringRecovery"] as const) {
    const v = obj[key];
    if (v !== undefined) {
      if (typeof v !== "number" || !Number.isFinite(v) || v <= 1) {
        throw new Error(`${where}: rules.${key} must be a finite number > 1, got ${String(v)}`);
      }
      rules[key] = v;
    }
  }
  if (obj.copycatReservePct !== undefined) {
    const v = obj.copycatReservePct;
    if (
      !Array.isArray(v) || v.length !== 2 ||
      v.some((x) => typeof x !== "number" || !Number.isFinite(x) || x < 0 || x > 100) ||
      (v[0] as number) > (v[1] as number)
    ) {
      throw new Error(`${where}: rules.copycatReservePct must be [min,max] ⊂ 0..100 with min ≤ max`);
    }
    rules.copycatReservePct = Object.freeze([v[0] as number, v[1] as number] as const);
  }
  return Object.freeze(rules);
}

/** Boundary parser: unknown in → trusted WaveTable out, or a loud throw. */
export function parseWaveTable(raw: unknown): WaveTable {
  if (typeof raw !== "object" || raw === null) throw new Error("wave table: expected object");
  const obj = raw as Record<string, unknown>;
  const id = reqString(obj, "id", "wave table");
  const typeBundleId = reqString(obj, "typeBundleId", "wave table");
  const tuningSheet = reqString(obj, "tuningSheet", "wave table");
  if (!SHEET_SET.has(tuningSheet)) throw new Error(`wave table: tuningSheet must be A|B|C, got "${tuningSheet}"`);
  const unitsPerPressurePoint = reqInt(obj, "unitsPerPressurePoint", "wave table", 1);
  if (!Array.isArray(obj.waves) || obj.waves.length === 0) {
    throw new Error("wave table: waves must be a non-empty array");
  }
  const waves = obj.waves.map((w, i) => parseWave(w, i + 1, `wave table ${id} wave[${i}]`));
  const rules = obj.rules === undefined ? undefined : parseRules(obj.rules, `wave table ${id}`);
  if (rules?.feints?.neverTwoLevelsInRow) {
    for (let i = 1; i < waves.length; i += 1) {
      if (waves[i - 1]?.feint && waves[i]?.feint) {
        throw new Error(
          `wave table ${id}: waves ${String(waves[i - 1]?.n)} and ${String(waves[i]?.n)} both feint — rules.feints.neverTwoLevelsInRow forbids it (§2.24)`,
        );
      }
    }
  }
  if (rules?.feints) {
    const flagged = waves.filter((w) => w.feint).length;
    if (flagged > rules.feints.maxPerLevel) {
      throw new Error(
        `wave table ${id}: ${String(flagged)} feint waves exceed rules.feints.maxPerLevel ${String(rules.feints.maxPerLevel)} (§2.24 one decoy per level)`,
      );
    }
  }
  return {
    id,
    typeBundleId,
    tuningSheet: tuningSheet as TuningSheetId,
    unitsPerPressurePoint,
    waves,
    ...(rules === undefined ? {} : { rules }),
  };
}
