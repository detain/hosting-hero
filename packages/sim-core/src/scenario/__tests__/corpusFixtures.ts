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
import { buildInvitations, buildThreatMetaLookup } from "../../waves/index.ts";
import type { BuildOp } from "../../waves/index.ts";

const CONTENT_ROOT = "../../../../../packages/content/";

function readJson(rel: string): unknown {
  return JSON.parse(readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8")) as unknown;
}

export const SHIPPED_G1_SLICE_STEM = "g1-shared-web-first-quarter";

/** The mail-hosting quarter: the free-tier-flood corpus twin cites it
 *  (its wave 1/2/4 compositions are the most malicious-dominant band the
 *  shipped slices carry below the wave-5 crest). Same host-stands-in
 *  reading as the shared-web slice — disk JSON, zero content edits. */
export const SHIPPED_MAIL_SLICE_STEM = "g1-mail-hosting-first-quarter";

let authority: CorpusAuthority | null = null;

/** The single authority for every corpus probe in the suite (idempotent;
 *  reads from disk exactly once per vitest worker). */
export function corpusAuthority(): CorpusAuthority {
  if (authority !== null) return authority;
  const slices = new Map<string, unknown>();
  slices.set(SHIPPED_G1_SLICE_STEM, readJson(`${CONTENT_ROOT}waves/${SHIPPED_G1_SLICE_STEM}.json`));
  slices.set(SHIPPED_MAIL_SLICE_STEM, readJson(`${CONTENT_ROOT}waves/${SHIPPED_MAIL_SLICE_STEM}.json`));
  const registry = readJson(`${CONTENT_ROOT}threats/registry-core.json`);
  authority = Object.freeze({
    slices,
    // THE single registry→threatMeta authority (m4 fold — waves/foreign.ts);
    // this host's label keeps its historical throw string verbatim.
    threatMeta: buildThreatMetaLookup(registry, "corpusFixtures"),
  });
  return authority;
}

/* ─────────────── the REAL attack-surface law (wave-five join) ────────── */

/** The shipped shared-web invite table, read from the content bundle the
 *  same way a host reads it at boot: types/shared-web.json
 *  threats.unlockedByBuildables. This is the law the synthetic SYNTH_LAW
 *  in corpus.test.ts only imitates. */
export function sharedWebInvitationLaw(): Readonly<Record<string, readonly string[]>> {
  const bundle = readJson(`${CONTENT_ROOT}types/shared-web.json`) as {
    threats?: { unlockedByBuildables?: Record<string, readonly string[]> };
  };
  const law = bundle.threats?.unlockedByBuildables;
  if (law === undefined || Object.keys(law).length === 0) {
    throw new Error("corpusFixtures: shared-web.json carries no threats.unlockedByBuildables law");
  }
  return law;
}

let lawAuthority: CorpusAuthority | null = null;

/** The SAME slices + metadata as corpusAuthority(), but with the real
 *  shared-web invitation law installed and an EMPTY buildLog: every
 *  gated storm is starved until the player's surface invites it. */
export function invitedCorpusAuthority(): CorpusAuthority {
  if (lawAuthority !== null) return lawAuthority;
  const base = corpusAuthority();
  lawAuthority = Object.freeze({ ...base, invitations: buildInvitations(sharedWebInvitationLaw()) });
  return lawAuthority;
}

/** Every buildable in the real law built at tick 0 — the fully-informed
 *  surface. Any wave the law gates, this buildLog invites. */
export const FULL_BUILD_LOG: readonly BuildOp[] = Object.freeze(
  Object.keys(sharedWebInvitationLaw())
    .sort()
    .map((buildableId) => Object.freeze({ atTick: 0n, op: "build" as const, buildableId })),
);
