/**
 * STRUCTURAL wave-file check only. The wave AUTHORING LAWS (§1.7 telegraph
 * bands, par formula, trough depth, role quotas, two-front quotas, pressure
 * sums) belong to the `waves` module — this file deliberately imports NOTHING
 * from it and re-declares locally (owner directive) only the three shapes the
 * loader needs to prove a referenced wave table is a well-formed document of
 * the expected KIND, so a bundle cannot point at junk or at the wrong type:
 *
 *  S1 WAVE_LIST   — non-empty `waves[]`, each with a unique positive integer
 *                   `n`, an `entries[]` (≥1) of {threat: string,
 *                   pressurePct: integer ≥ 0}.
 *  S2 BAND_VOCAB  — every `entries[].band` is one of the four authored bands
 *                   (§2.26: weather · storm · hunter · entropy).
 *  S3 ENVELOPES   — `envelopes[]` (when present): unique string `id`, shape
 *                   keys ⊆ {ramp, plateau, decay} (WaveEnvelope contract,
 *                   types.ts), `overWaves[]` citing declared wave n's.
 *
 * Vocabulary constants here are LOCAL duplicates of the content contract —
 * never read from the wave document itself (that would make the check
 * vacuous).
 */

import type { WaveStructureIssue } from "./lint.ts";

export const WAVE_BAND_VOCAB = ["weather", "storm", "hunter", "entropy"] as const;
export const ENVELOPE_SHAPE_PHASES = ["ramp", "plateau", "decay"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function inspectWaveTableStructure(raw: unknown, ref: string): WaveStructureIssue[] {
  const issues: WaveStructureIssue[] = [];
  if (!isRecord(raw)) {
    return [{ ref, shape: "WAVE_LIST", detail: "wave table is not a JSON object" }];
  }

  /* S1 — waves list */
  const waves = raw["waves"];
  if (!Array.isArray(waves) || waves.length === 0) {
    issues.push({ ref, shape: "WAVE_LIST", detail: "'waves' must be a non-empty array" });
    return issues; // nothing further can be cited
  }
  const seenN = new Set<number>();
  waves.forEach((wave, index) => {
    const where = `waves[${index}]`;
    if (!isRecord(wave)) {
      issues.push({ ref, shape: "WAVE_LIST", detail: `${where} is not an object` });
      return;
    }
    const n = wave["n"];
    if (typeof n !== "number" || !Number.isSafeInteger(n) || n < 1) {
      issues.push({ ref, shape: "WAVE_LIST", detail: `${where}.n must be a positive integer, got ${String(wave["n"])}` });
    } else if (seenN.has(n)) {
      issues.push({ ref, shape: "WAVE_LIST", detail: `${where}.n duplicates wave n=${n}` });
    } else {
      seenN.add(n);
    }
    const entries = wave["entries"];
    if (!Array.isArray(entries) || entries.length === 0) {
      issues.push({ ref, shape: "WAVE_LIST", detail: `${where}.entries must be a non-empty array` });
      return;
    }
    entries.forEach((entry, entryIndex) => {
      const entryWhere = `${where}.entries[${entryIndex}]`;
      if (!isRecord(entry) || typeof entry["threat"] !== "string" || entry["threat"].length === 0) {
        issues.push({ ref, shape: "WAVE_LIST", detail: `${entryWhere}.threat must be a non-empty string` });
        return;
      }
      const pressure = entry["pressurePct"];
      if (typeof pressure !== "number" || !Number.isSafeInteger(pressure) || pressure < 0) {
        issues.push({
          ref,
          shape: "WAVE_LIST",
          detail: `${entryWhere}.pressurePct must be an integer ≥ 0, got ${String(entry["pressurePct"])}`,
        });
      }
      /* S2 — band vocabulary */
      if (typeof entry["band"] === "string" && !(WAVE_BAND_VOCAB as readonly string[]).includes(entry["band"])) {
        issues.push({
          ref,
          shape: "BAND_VOCAB",
          detail: `${entryWhere}.band '${entry["band"]}' is not one of [${WAVE_BAND_VOCAB.join(", ")}]`,
        });
      } else if (typeof entry["band"] !== "string") {
        issues.push({ ref, shape: "BAND_VOCAB", detail: `${entryWhere}.band must be a string band id` });
      }
    });
  });

  /* S3 — envelopes */
  const envelopes = raw["envelopes"];
  if (envelopes === undefined || envelopes === null) return issues;
  if (!Array.isArray(envelopes)) {
    issues.push({ ref, shape: "ENVELOPES", detail: "'envelopes' must be an array when present" });
    return issues;
  }
  const seenIds = new Set<string>();
  envelopes.forEach((envelope, index) => {
    const where = `envelopes[${index}]`;
    if (!isRecord(envelope)) {
      issues.push({ ref, shape: "ENVELOPES", detail: `${where} is not an object` });
      return;
    }
    const id = envelope["id"];
    if (typeof id !== "string" || id.length === 0) {
      issues.push({ ref, shape: "ENVELOPES", detail: `${where}.id must be a non-empty string` });
    } else if (seenIds.has(id)) {
      issues.push({ ref, shape: "ENVELOPES", detail: `${where}.id '${id}' is duplicated` });
    } else {
      seenIds.add(id);
    }
    const shape = envelope["shape"];
    if (isRecord(shape)) {
      for (const phase of Object.keys(shape)) {
        if (!(ENVELOPE_SHAPE_PHASES as readonly string[]).includes(phase)) {
          issues.push({
            ref,
            shape: "ENVELOPES",
            detail: `${where}.shape phase '${phase}' is outside [${ENVELOPE_SHAPE_PHASES.join(", ")}] (types.ts WaveEnvelope contract)`,
          });
        }
      }
    } else if (typeof shape !== "string" || !(ENVELOPE_SHAPE_PHASES as readonly string[]).includes(shape)) {
      issues.push({
        ref,
        shape: "ENVELOPES",
        detail: `${where}.shape must be a ramp|plateau|decay name or an object over those phases`,
      });
    }
    const overWaves = envelope["overWaves"];
    if (Array.isArray(overWaves)) {
      for (const cited of overWaves) {
        if (typeof cited !== "number" || !seenN.has(cited)) {
          issues.push({ ref, shape: "ENVELOPES", detail: `${where}.overWaves cites unknown wave n=${String(cited)}` });
        }
      }
    } else if (overWaves !== undefined && overWaves !== null) {
      issues.push({ ref, shape: "ENVELOPES", detail: `${where}.overWaves must be an array when present` });
    }
  });

  return issues;
}
