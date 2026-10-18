/**
 * Era-availability resolution (§0.4 era grid, R66 — "failing to transition
 * = real lose condition"). Pure lookups over the loaded, boundary-validated
 * bundle (loader/bundle.ts guarantees YearString = /^\d{4}$/ or null).
 *
 * Status semantics:
 *  - "available"        eraYear ∈ [availableFrom, obsoleteBy)
 *  - "pre-introduction" eraYear < availableFrom
 *  - "obsolete"         eraYear ≥ obsoleteBy
 *  - "undocumented"     availableFrom null — the doc does not date the line
 *    (game-servers per its _todo); the line is neither granted nor denied:
 *    callers decide their policy, this helper never invents an era.
 */

import type { LoadedTypeBundle } from "./bundle.ts";
import { LoaderError } from "./boundary.ts";

export type EraStatus = "available" | "pre-introduction" | "obsolete" | "undocumented";

export interface EraResolution {
  readonly bundleId: string;
  readonly eraYear: number;
  readonly status: EraStatus;
  readonly availableFrom: string | null;
  readonly obsoleteBy: string | null;
}

function parseYear(text: string, field: string): number {
  const year = Number(text);
  if (!Number.isSafeInteger(year)) {
    throw new LoaderError("WRONG_TYPE", field, `'${text}' is not a 4-digit year`);
  }
  return year;
}

export function resolveEraAvailability(bundle: LoadedTypeBundle, eraYear: number): EraResolution {
  if (!Number.isSafeInteger(eraYear) || eraYear < 0) {
    throw new LoaderError("OUT_OF_RANGE", "resolveEraAvailability.eraYear", `${eraYear} must be a non-negative integer year`);
  }
  const { availableFrom, obsoleteBy } = bundle.eras;
  const base = { bundleId: bundle.id, eraYear, availableFrom, obsoleteBy };
  if (availableFrom === null) return Object.freeze({ ...base, status: "undocumented" as const });
  if (eraYear < parseYear(availableFrom, `${bundle.id}.eras.availableFrom`)) {
    return Object.freeze({ ...base, status: "pre-introduction" as const });
  }
  if (obsoleteBy !== null && eraYear >= parseYear(obsoleteBy, `${bundle.id}.eras.obsoleteBy`)) {
    return Object.freeze({ ...base, status: "obsolete" as const });
  }
  return Object.freeze({ ...base, status: "available" as const });
}

/** Ids of bundles shipping in the era, sorted (deterministic CI-safe list). */
export function bundlesLiveInEra(
  bundles: readonly LoadedTypeBundle[],
  eraYear: number,
  opts: { readonly includeUndocumented?: boolean } = {},
): readonly string[] {
  const includeUndocumented = opts.includeUndocumented ?? false;
  return bundles
    .filter((bundle) => {
      const { status } = resolveEraAvailability(bundle, eraYear);
      return status === "available" || (includeUndocumented && status === "undocumented");
    })
    .map((bundle) => bundle.id)
    .sort();
}

/** Opaque per-era override object authored under eras.eraOverrides (§0.4:
 *  era = 4 chrome tokens + set-dressing); undefined when none authored. */
export function eraOverrideFor(
  bundle: LoadedTypeBundle,
  eraKey: string,
): LoadedTypeBundle["eras"]["eraOverrides"][string] | undefined {
  return bundle.eras.eraOverrides[eraKey];
}

/**
 * L-EM (ADR-0019 program 4) — the per-tech leg of the §0.4 grid: "Whole
 * branches of the tech tree are greyed out with 'not invented yet.'"
 * Resolution law, in order:
 *  1. `eras.availability[techId]` row present → its own window, using the
 *     SAME four-status semantics as resolveEraAvailability (the bundle-level
 *     law verbatim, including "undocumented = neither grant nor deny" — an
 *     undated `from` never invents an introduction; retirement machinery
 *     rides from+to pairs, pinned by forged fixtures, never shipped dates).
 *  2. no row → delegate to the bundle-level resolveEraAvailability: the
 *     line's OWN date gates its whole line ("2009 shared-hosting-and-cPanel"
 *     ⇒ nothing on that shelf exists in a 1998 run).
 *  3. bundle also undocumented → "undocumented": neither granted nor denied;
 *     the door caller decides its policy and this helper never invents an era.
 */
export interface TechAvailability {
  readonly bundleId: string;
  readonly techId: string;
  readonly eraYear: number;
  readonly status: EraStatus;
  readonly availableFrom: string | null;
  readonly obsoleteBy: string | null;
  /** Which authority produced the verdict: "row" = eras.availability named
   *  this tech; "bundle" = the line-level dates gated it; "undocumented" =
   *  neither dated it (grants nothing, denies nothing). */
  readonly source: "row" | "bundle" | "undocumented";
}

export function resolveTechAvailability(
  bundle: LoadedTypeBundle,
  techId: string,
  eraYear: number,
): TechAvailability {
  if (typeof techId !== "string" || techId.length === 0) {
    throw new LoaderError("WRONG_TYPE", "resolveTechAvailability.techId", `${String(techId)} must be a non-empty tech id`);
  }
  if (!Number.isSafeInteger(eraYear) || eraYear < 0) {
    throw new LoaderError("OUT_OF_RANGE", "resolveTechAvailability.eraYear", `${eraYear} must be a non-negative integer year`);
  }
  const row = bundle.eras.availability[techId];
  if (row !== undefined) {
    const base = { bundleId: bundle.id, techId, eraYear, source: "row" as const };
    if (row.from === null) {
      return Object.freeze({ ...base, status: "undocumented" as const, availableFrom: null, obsoleteBy: row.to });
    }
    if (eraYear < parseYear(row.from, `${bundle.id}.eras.availability.${techId}.from`)) {
      return Object.freeze({ ...base, status: "pre-introduction" as const, availableFrom: row.from, obsoleteBy: row.to });
    }
    if (row.to !== null && eraYear >= parseYear(row.to, `${bundle.id}.eras.availability.${techId}.to`)) {
      return Object.freeze({ ...base, status: "obsolete" as const, availableFrom: row.from, obsoleteBy: row.to });
    }
    return Object.freeze({ ...base, status: "available" as const, availableFrom: row.from, obsoleteBy: row.to });
  }
  const fallback = resolveEraAvailability(bundle, eraYear);
  const source = fallback.status === "undocumented" ? ("undocumented" as const) : ("bundle" as const);
  return Object.freeze({ ...fallback, techId, source });
}
