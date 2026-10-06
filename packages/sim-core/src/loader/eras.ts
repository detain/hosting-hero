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
