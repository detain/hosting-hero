/** corpusFixtures.ts — the TEST-side host for the waves-tableId seam.
 *
 *  sim-core src never touches fs (browser-safe law); this helper stands in
 *  for whatever host wires scenarios in production: it loads the shipped
 *  packages/content/waves/ slices + registry-core threat metadata once and
 *  hands runScenario a CorpusAuthority. If the content moves, the probes
 *  below move with it — that is the whole point of the seam.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import type { CorpusAuthority } from "../index.ts";
import type { ForeignThreatMeta } from "../../waves/index.ts";

const CONTENT_ROOT = "../../../../../packages/content/";

function readJson(rel: string): unknown {
  return JSON.parse(readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8")) as unknown;
}

/** Registry metadata the foreign entries do not carry (family, denomination). */
function buildThreatMeta(): (threatId: string) => ForeignThreatMeta | undefined {
  const registry = readJson(`${CONTENT_ROOT}threats/registry-core.json`) as {
    threats?: { id?: string; family?: string; denomination?: string }[];
  };
  const map = new Map<string, ForeignThreatMeta>();
  for (const raw of registry.threats ?? []) {
    if (typeof raw.id !== "string" || typeof raw.family !== "string" || typeof raw.denomination !== "string") {
      throw new Error(`corpusFixtures: registry-core threat record missing id/family/denomination: ${JSON.stringify(raw).slice(0, 80)}`);
    }
    map.set(raw.id, { family: raw.family as ForeignThreatMeta["family"], denomination: raw.denomination as ForeignThreatMeta["denomination"] });
  }
  return (threatId: string) => map.get(threatId);
}

export const SHIPPED_G1_SLICE_STEM = "g1-shared-web-first-quarter";

let authority: CorpusAuthority | null = null;

/** The single authority for every corpus probe in the suite (idempotent;
 *  reads from disk exactly once per vitest worker). */
export function corpusAuthority(): CorpusAuthority {
  if (authority !== null) return authority;
  const slices = new Map<string, unknown>();
  slices.set(SHIPPED_G1_SLICE_STEM, readJson(`${CONTENT_ROOT}waves/${SHIPPED_G1_SLICE_STEM}.json`));
  authority = Object.freeze({ slices, threatMeta: buildThreatMeta() });
  return authority;
}
