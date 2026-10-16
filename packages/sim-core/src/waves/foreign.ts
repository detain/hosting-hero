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

/**
 * THE single registry→threatMeta authority (wave-15 review m4 hygiene fold,
 * 2026-10-16). Turns a PARSED registry-core.json document into exactly the
 * lookup `ForeignWaveSliceOptions.threatMeta` (and the scenario seam's
 * `CorpusAuthority.threatMeta`) demands: threat-id → {family, denomination}.
 *
 * Fail-loud law: a record missing any of id/family/denomination throws,
 * naming the CALLING host via `where` (the label pattern `projectForeignRules`
 * already uses) so every pre-fold throw string stands verbatim. A missing
 * `threats` key is TOLERATED as empty — `parseForeignWaveSlice`'s own
 * entry-miss guard stays the loud boundary for citations that actually need
 * the metadata.
 *
 * FOLDED here (byte-identical outputs on shipped content; each host passes
 * its own module name):
 *  · `apps/proto/src/shared/corpusHost.ts`      workerThreatMeta (host-side
 *    memoization KEPT — the cross-table closure identity stands)
 *  · `apps/proto/src/chrome/corpusMission.ts`   buildThreatMeta (authority memo)
 *  · `scenario/__tests__/corpusFixtures.ts`     buildThreatMeta (authority memo)
 *  · `apps/proto/src/runner/waveRules.ts`       registryThreatIndex — its
 *    DIVERGENT edge (Array.isArray refusal on `threats`) stays EXPLICIT as a
 *    call-site pre-guard; its frozen-map posture was internal (the map only
 *    ever fed the threatMeta closure).
 *
 * NOT folded — different contract, named per the m4 row's "gate/lab readers":
 * `gates/g6/g6Data.ts`, `gates/g6/__tests__/g6DataAdapter.test.ts`,
 * `__tests__/gate-g2.test.ts`, `__tests__/gate-g6.test.ts` and
 * `waves/__tests__/foreign.test.ts` index the FULL record (band included) with
 * no per-record fail-loud — loose display-side readers, some even throwing on
 * a MISS instead of answering undefined; `loader/registries.ts`
 * `parseThreatRegistry` is the strict content-CI id-wall (different purpose).
 * When the threat schema grows, fail-loud hosts change HERE; the loose
 * readers opt in deliberately.
 */
export function buildThreatMetaLookup(
  registry: unknown,
  where: string,
): (threatId: string) => ForeignThreatMeta | undefined {
  const doc = registry as {
    threats?: { id?: string; family?: string; denomination?: string }[];
  };
  const map = new Map<string, ForeignThreatMeta>();
  for (const raw of doc.threats ?? []) {
    if (
      typeof raw.id !== "string" ||
      typeof raw.family !== "string" ||
      typeof raw.denomination !== "string"
    ) {
      throw new Error(
        `${where}: registry-core threat record missing id/family/denomination: ${JSON.stringify(raw).slice(0, 80)}`,
      );
    }
    // Frozen records: the map is shared across every caller of this authority —
    // defense-in-depth per review of 216106e (no consumer may mutate in place).
    map.set(raw.id,
      Object.freeze({
        family: raw.family as ForeignThreatMeta["family"],
        denomination: raw.denomination as ForeignThreatMeta["denomination"],
      }),
    );
  }
  return (threatId: string) => map.get(threatId);
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
