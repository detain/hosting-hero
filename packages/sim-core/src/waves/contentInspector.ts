/**
 * Read-only inspector for OFFICIAL content wave JSON (packages/content/waves/).
 *
 * Those files ship a DIFFERENT (content-workstream) schema — this inspector
 * does NOT parse them into WaveTable and NEVER rewrites them. It performs
 * cross-checks against the ratified authoring laws and returns findings as
 * data for content CI. Pure function: caller supplies the parsed JSON.
 */
import { AUTHORING_LAWS } from "./enforcer.ts";

export interface ContentInspectionFinding {
  readonly code: string;
  readonly where: string;
  readonly detail: string;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Inspect an official-content wave document. Findings use the SAME codes as
 * the enforcer where the law maps over, plus `CONTENT_*` notes for gaps
 * between the content schema and the ratified laws.
 */
export function inspectOfficialWaveJson(raw: unknown): readonly ContentInspectionFinding[] {
  const findings: ContentInspectionFinding[] = [];
  if (!isRecord(raw)) {
    return [{ code: "CONTENT_MALFORMED", where: "root", detail: "document is not an object" }];
  }
  const waves = raw.waves;
  if (!Array.isArray(waves)) {
    return [{ code: "CONTENT_MALFORMED", where: "waves", detail: "no waves array — cannot inspect" }];
  }

  for (const w of waves) {
    if (!isRecord(w)) continue;
    const n = typeof w.n === "number" ? w.n : 0;
    const where = `wave ${n}`;
    const entries = Array.isArray(w.entries) ? w.entries : [];
    if (entries.length > AUTHORING_LAWS.maxThreatEntriesPerWave) {
      findings.push({
        code: "MAX_THREAT_ENTRIES_EXCEEDED",
        where,
        detail: `${entries.length} entries (law: ≤${AUTHORING_LAWS.maxThreatEntriesPerWave})`,
      });
    }
    const denominations = Array.isArray(w.denominations) ? w.denominations.filter((d): d is string => typeof d === "string") : [];
    if (denominations.length > AUTHORING_LAWS.maxDenominationsPerWave) {
      findings.push({
        code: "TWO_FRONT_DENOMINATIONS_EXCEEDED",
        where,
        detail: `declares ${denominations.length} denominations [${denominations.join(", ")}] (law: ≤${AUTHORING_LAWS.maxDenominationsPerWave} fronts per wave, §2.24)`,
      });
    }
    if (w.hard === true && denominations.length < AUTHORING_LAWS.maxDenominationsPerWave) {
      findings.push({
        code: "HARD_WAVE_SINGLE_FRONT",
        where,
        detail: `hard wave with ${denominations.length} denomination(s) — hard waves must draw two fronts (§2.24)`,
      });
    }
    const parPct = typeof w.parPct === "number" ? w.parPct : null;
    if (n === 1 && parPct !== null && parPct > AUTHORING_LAWS.firstWaveMaxParPct) {
      findings.push({
        code: "FIRST_WAVE_OVER_40PCT_PAR",
        where,
        detail: `first wave at ${parPct}% of par (law: ≤${AUTHORING_LAWS.firstWaveMaxParPct}%)`,
      });
    }
    // Role-based laws cannot be checked: content entries carry no role field.
    const rolesMissing = entries.some((e) => !isRecord(e) || typeof e.role !== "string");
    if (rolesMissing) {
      findings.push({
        code: "CONTENT_ROLES_UNDECLARED",
        where,
        detail: "entries carry no `role` — ROLE_QUOTA / MISSING_NEW_ROLE_EVERY_4TH unverifiable from this schema",
      });
    }
  }

  // De-dup role note: one per document is enough for CI noise control.
  const seen = new Set<string>();
  return findings.filter((f) => {
    const key = `${f.code}@${f.where.startsWith("wave") && f.code === "CONTENT_ROLES_UNDECLARED" ? "doc" : f.where}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
