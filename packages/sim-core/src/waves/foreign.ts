/**
 * Foreign g1 wave-SLICE → engine WaveTable adapter (§2.24 / audit REST-RULES-ADAPTER).
 *
 * The shipped slices in packages/content/waves/ speak a foreign schema
 * (entries keyed `threat`/`role`/`pressurePct`, a `trough` boolean instead
 * of `hard`, prose `secondIncident` markers, and a top-level `rules` block
 * that is a SUPERSET of the engine vocabulary — ten extra keys are
 * content-CI design laws, validated against the raw slice by
 * contentInspector/enforcer, never consumed by the engine).
 *
 * Until now every consumer hand-rolled this projection and every copy
 * dropped the `rules` block AND the per-wave feint/secondIncident markers —
 * which made the @4856a42 rules consumers (feint / second incident / copycat
 * in generate.ts) structurally unable to fire on shipped content. This file
 * is the canonical carry-through: existence data verbatim, rules projected
 * onto the engine's closed vocabulary (WAVE_RULE_KEYS), per-wave markers
 * forwarded, and `parseWaveTable` kept as the single parse authority —
 * a malformed projection still throws loudly at the boundary.
 *
 * Dead-neutral contract: a slice without `rules` yields a table without
 * `rules` (undefined — not `{}`), so presence-gated consumers stay provably
 * inert and plans stay byte-identical (falsified in __tests__/foreign.test.ts
 * against the rules-free mail-hosting slice).
 */
import type { DamageDenomination, ThreatRole, WaveTable, WaveRules } from "./table.ts";
import { WAVE_RULE_KEYS, parseWaveTable } from "./table.ts";
import type { ThreatFamily } from "../types.ts";
import type { TuningSheetId } from "./pressure.ts";

/** Registry metadata the foreign entries do not carry themselves. */
export interface ForeignThreatMeta {
  readonly family: ThreatFamily;
  readonly denomination: DamageDenomination;
}

export interface ForeignWaveSliceOptions {
  /** Bundle this table belongs to (becomes WaveTable.typeBundleId). */
  readonly typeBundleId: string;
  /** Envelope geometry — the slices author existence, not shape. */
  readonly geometry: {
    readonly windowMinutes: number;
    readonly rampMin: number;
    readonly plateauMin: number;
    readonly decayMin: number;
  };
  /** Caller-supplied registry lookup; `undefined` fails the parse loudly. */
  readonly threatMeta: (threatId: string) => ForeignThreatMeta | undefined;
  readonly tuningSheet?: TuningSheetId;
  readonly unitsPerPressurePoint?: number;
}

interface ForeignEntryLike {
  readonly threat?: unknown;
  readonly role?: unknown;
  readonly pressurePct?: unknown;
  readonly band?: unknown;
}

interface ForeignWaveLike {
  readonly n?: unknown;
  readonly parPct?: unknown;
  readonly trough?: unknown;
  readonly entries?: unknown;
  readonly feint?: unknown;
  readonly secondIncident?: unknown;
}

/** Foreign role strings ("Swarm/…", "Healer …") → the THREAT_ROLES head. */
function canonicalRole(foreignRole: unknown): ThreatRole | string {
  if (typeof foreignRole !== "string" || foreignRole.length === 0) return String(foreignRole);
  const head = foreignRole.split("/")[0]!.toLowerCase();
  return head === "healer" ? "healer" : head;
}

/**
 * Project an authored §2.24 rules block onto the engine's closed vocabulary.
 * Content-CI-only keys are DROPPED here by design (they gate authoring, not
 * simulation); an authored block that is only content-CI keys projects to
 * `undefined`, keeping "no rules" the single dead-neutral representation.
 */
export function projectForeignRules(rawRules: unknown, where: string): WaveRules | undefined {
  if (rawRules === undefined || rawRules === null) return undefined;
  if (typeof rawRules !== "object" || Array.isArray(rawRules)) {
    throw new Error(`${where}: rules must be an object, got ${typeof rawRules}`);
  }
  const source = rawRules as Record<string, unknown>;
  const projected: Record<string, unknown> = {};
  for (const key of WAVE_RULE_KEYS) {
    if (source[key] !== undefined) projected[key] = source[key];
  }
  if (Object.keys(projected).length === 0) return undefined;
  return projected as WaveRules;
}

/** Boundary adapter: foreign slice JSON in → trusted engine WaveTable out. */
export function parseForeignWaveSlice(raw: unknown, options: ForeignWaveSliceOptions): WaveTable {
  if (typeof raw !== "object" || raw === null) throw new Error("foreign wave slice: expected an object");
  const slice = raw as Record<string, unknown>;
  const sliceId = typeof slice["id"] === "string" ? slice["id"] : "<unnamed slice>";
  if (!Array.isArray(slice["waves"]) || slice["waves"].length === 0) {
    throw new Error(`foreign wave slice ${sliceId}: waves must be a non-empty array`);
  }
  const waves = (slice["waves"] as readonly ForeignWaveLike[]).map((w, i) => {
    const where = `foreign wave ${i}`;
    if (!Array.isArray(w.entries) || w.entries.length === 0) {
      throw new Error(`foreign wave slice ${sliceId} ${where}: entries must be a non-empty array`);
    }
    const entries = (w.entries as readonly ForeignEntryLike[]).map((e, j) => {
      if (typeof e.threat !== "string" || e.threat.length === 0) {
        throw new Error(`foreign wave slice ${sliceId} ${where} entry ${j}: threat must be a non-empty string`);
      }
      const meta = options.threatMeta(e.threat);
      if (meta === undefined) {
        throw new Error(`foreign wave slice ${sliceId} ${where}: threat "${e.threat}" has no registry metadata`);
      }
      return {
        threatId: e.threat,
        role: canonicalRole(e.role),
        family: meta.family,
        band: e.band,
        sharePct: e.pressurePct,
        denominations: [meta.denomination],
        targets: ["origin"],
      };
    });
    return {
      n: w.n,
      windowMinutes: options.geometry.windowMinutes,
      rampMin: options.geometry.rampMin,
      plateauMin: options.geometry.plateauMin,
      decayMin: options.geometry.decayMin,
      parPct: w.parPct,
      hard: w.trough !== true,
      entries,
      // §2.24 per-wave markers — prose or boolean, presence is the law
      // (parseWave turns a non-empty prose marker into `true`).
      ...(w.feint === undefined ? {} : { feint: w.feint }),
      ...(w.secondIncident === undefined ? {} : { secondIncident: w.secondIncident }),
    };
  });
  const rules = projectForeignRules(slice["rules"], `foreign wave slice ${sliceId}`);
  return parseWaveTable({
    id: sliceId,
    typeBundleId: options.typeBundleId,
    tuningSheet: options.tuningSheet ?? "B",
    unitsPerPressurePoint: options.unitsPerPressurePoint ?? 1,
    waves,
    ...(rules === undefined ? {} : { rules }),
  });
}
