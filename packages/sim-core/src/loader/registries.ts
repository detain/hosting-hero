/**
 * Read-only indexes over the content registries (threats / visitor
 * archetypes) used by the cross-reference leg of the Ruleset Diff Linter.
 * The linter only needs identity sets; the files' own deep validation belongs
 * to packages/content/script/validate.mjs (content CI), and the loader dir
 * must not edit or re-adjudicate content — resolve, don't rewrite (Law 3).
 */

import { LoaderError } from "./boundary.ts";

export interface ThreatRegistryIndex {
  readonly source: string;
  /** Registry threat ids (deduplicated; duplicates fail the parse). */
  readonly threatIds: ReadonlySet<string>;
  readonly threatCount: number;
}

export interface VisitorArchetypeIndex {
  readonly source: string;
  readonly archetypeIds: ReadonlySet<string>;
  readonly archetypeCount: number;
}

function requireStringArrayIds(
  raw: unknown,
  key: "threats" | "archetypes",
  source: string,
): ReadonlySet<string> {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new LoaderError("WRONG_TYPE", source, `${source} must be an object with a '${key}' array`);
  }
  const list = (raw as Record<string, unknown>)[key];
  if (!Array.isArray(list)) {
    throw new LoaderError("WRONG_TYPE", `${source}.${key}`, `expected array under '${key}'`);
  }
  const ids = new Set<string>();
  list.forEach((entry, index) => {
    const where = `${source}.${key}[${index}]`;
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
      throw new LoaderError("WRONG_TYPE", where, "expected an object entry");
    }
    const id = (entry as Record<string, unknown>).id;
    if (typeof id !== "string" || id.length === 0) {
      throw new LoaderError("WRONG_TYPE", `${where}.id`, "expected string id");
    }
    if (ids.has(id)) {
      throw new LoaderError("OUT_OF_RANGE", `${where}.id`, `duplicate id '${id}' in ${source}`);
    }
    ids.add(id);
  });
  return ids;
}

export function parseThreatRegistry(raw: unknown, source = "threats/registry-core.json"): ThreatRegistryIndex {
  const threatIds = requireStringArrayIds(raw, "threats", source);
  return { source, threatIds, threatCount: threatIds.size };
}

export function parseVisitorArchetypeRegistry(
  raw: unknown,
  source = "visitors/archetypes-core.json",
): VisitorArchetypeIndex {
  const archetypeIds = requireStringArrayIds(raw, "archetypes", source);
  return { source, archetypeIds, archetypeCount: archetypeIds.size };
}
