/**
 * Worker-side corpus host — the WORKER-LOOP leg of the §1.5 waves-tableId
 * seam (sim-core `scenario/corpus.ts` @5df5586 + invitations @bc11697; the
 * mainline runner leg @007a15d). A boot wire carrying
 * `corpus: {tableId, waves}` turns the browser WORKER into a corpus-cited
 * drive host: this module resolves the citation into the exact
 * `CorpusDriveOptions` the runner's public seam accepts.
 *
 * One shared builder serves BOTH runner hosts — the real `sim.worker.ts` and
 * the in-process `bridge/fakeWorker.ts` — so the two cannot drift on
 * authority construction (the same anti-drift law that put
 * `wireIntentToPlayerIntent` in the codec, E2b).
 *
 * Content arrives as `?raw` build-time strings (the corpusMission /
 * coverage-grid pattern: vite embeds, zero fs in any thread). All TEN
 * shipped g1 slices are wired, each paired with the MATCHING type bundle for
 * the invitation law; the wire names a table by its shipped slice identity —
 * the JSON's own `type` minus the `official:` prefix — drift-pinned against
 * `packages/content/waves/` on disk (`__tests__/simWorker.corpus.test.ts`,
 * era-census precedent).
 *
 * LAW-OFF BOOT DEFAULT (honest v0): the wire carries no attack-surface state
 * — at boot there is no build ledger to judge against — so the authority the
 * runner receives is the law-free one (every shipped threat spawnable), the
 * exact stance `chrome/corpusMission.ts` pins its shipped witnesses against.
 * The REAL `unlockedByBuildables` law is still built per table
 * (`workerCorpusInvitations` / `workerCorpusFullBuildLog`): the suite pins
 * the corpus.test.ts promise that a FULLY-BUILT surface replays the law-off
 * windows byte-identically, so today's boot default loses no information —
 * a PARTIAL build state on the wire is a future additive field, not this leg.
 */
import type { CorpusAuthority } from "@hh/sim-core/scenario";
import { buildInvitations, buildThreatMetaLookup } from "@hh/sim-core/waves";
import type { BuildOp, ForeignThreatMeta, ThreatInvitations } from "@hh/sim-core/waves";
import type { CorpusDriveOptions } from "../runner/simCoreRunner";
import type { BootCorpusWire, CorpusTableId } from "./protocol";

import registryRaw from "../../../../packages/content/threats/registry-core.json?raw";
import bundleBackupArchivalRaw from "../../../../packages/content/types/backup-archival.json?raw";
import bundleColoRaw from "../../../../packages/content/types/colo.json?raw";
import bundleDedicatedRaw from "../../../../packages/content/types/dedicated.json?raw";
import bundleDnsRaw from "../../../../packages/content/types/dns-hosting.json?raw";
import bundleExchangeColoRaw from "../../../../packages/content/types/exchange-colo.json?raw";
import bundleGameServersRaw from "../../../../packages/content/types/game-servers.json?raw";
import bundleMailHostingRaw from "../../../../packages/content/types/mail-hosting.json?raw";
import bundleObjectStorageRaw from "../../../../packages/content/types/object-storage.json?raw";
import bundleServerlessRaw from "../../../../packages/content/types/serverless.json?raw";
import bundleSharedWebRaw from "../../../../packages/content/types/shared-web.json?raw";
import bundleTrunkGroupRaw from "../../../../packages/content/types/trunk-group-voip.json?raw";
import sliceBackupArchivalRaw from "../../../../packages/content/waves/g1-backup-archival-first-quarter.json?raw";
import sliceColoRaw from "../../../../packages/content/waves/g1-colo-first-quarter.json?raw";
import sliceDedicatedRaw from "../../../../packages/content/waves/g1-dedicated-first-quarter.json?raw";
import sliceDnsRaw from "../../../../packages/content/waves/g1-dns-hosting-first-quarter.json?raw";
import sliceExchangeColoRaw from "../../../../packages/content/waves/g1-exchange-colo-first-quarter.json?raw";
import sliceGameServersRaw from "../../../../packages/content/waves/g1-game-servers-first-quarter.json?raw";
import sliceMailHostingRaw from "../../../../packages/content/waves/g1-mail-hosting-first-quarter.json?raw";
import sliceObjectStorageRaw from "../../../../packages/content/waves/g1-object-storage-first-quarter.json?raw";
import sliceServerlessRaw from "../../../../packages/content/waves/g1-serverless-first-quarter.json?raw";
import sliceSharedWebRaw from "../../../../packages/content/waves/g1-shared-web-first-quarter.json?raw";
import sliceTrunkGroupRaw from "../../../../packages/content/waves/g1-trunk-group-first-quarter.json?raw";

/** One wire table identity → the shipped content behind it. The slice STEMS
 *  key the authority map exactly like corpusMission keys it
 *  (`G1_SLICE_STEM`), so the citation the runner resolves is byte-content
 *  the same files the chrome card and the sim-core suite read. */
interface CorpusTableEntry {
  readonly sliceStem: string;
  readonly sliceRaw: string;
  readonly bundleRaw: string;
}

const CORPUS_TABLES: Readonly<Record<CorpusTableId, CorpusTableEntry>> = Object.freeze({
  "shared-web": Object.freeze({
    sliceStem: "g1-shared-web-first-quarter",
    sliceRaw: sliceSharedWebRaw,
    bundleRaw: bundleSharedWebRaw,
  }),
  "game-servers": Object.freeze({
    sliceStem: "g1-game-servers-first-quarter",
    sliceRaw: sliceGameServersRaw,
    bundleRaw: bundleGameServersRaw,
  }),
  "mail-hosting": Object.freeze({
    sliceStem: "g1-mail-hosting-first-quarter",
    sliceRaw: sliceMailHostingRaw,
    bundleRaw: bundleMailHostingRaw,
  }),
  "dns-hosting": Object.freeze({
    sliceStem: "g1-dns-hosting-first-quarter",
    sliceRaw: sliceDnsRaw,
    bundleRaw: bundleDnsRaw,
  }),
  dedicated: Object.freeze({
    sliceStem: "g1-dedicated-first-quarter",
    sliceRaw: sliceDedicatedRaw,
    bundleRaw: bundleDedicatedRaw,
  }),
  "object-storage": Object.freeze({
    sliceStem: "g1-object-storage-first-quarter",
    sliceRaw: sliceObjectStorageRaw,
    bundleRaw: bundleObjectStorageRaw,
  }),
  "trunk-group-voip": Object.freeze({
    // The slice FILE slugs shorter than the identity it declares
    // (`type: "official:trunk-group-voip"` — the wire names the declared
    // identity, the drift pin reads it off the JSON, not the filename).
    sliceStem: "g1-trunk-group-first-quarter",
    sliceRaw: sliceTrunkGroupRaw,
    bundleRaw: bundleTrunkGroupRaw,
  }),
  serverless: Object.freeze({
    sliceStem: "g1-serverless-first-quarter",
    sliceRaw: sliceServerlessRaw,
    bundleRaw: bundleServerlessRaw,
  }),
  "exchange-colo": Object.freeze({
    sliceStem: "g1-exchange-colo-first-quarter",
    sliceRaw: sliceExchangeColoRaw,
    bundleRaw: bundleExchangeColoRaw,
  }),
  // The generic colo card (type 10, "Amps and Aisles") — NOT the
  // exchange-colo sibling; the wire names the DECLARED identity both slices
  // carry in their own JSON `type`, so the two tables cannot collide.
  colo: Object.freeze({
    sliceStem: "g1-colo-first-quarter",
    sliceRaw: sliceColoRaw,
    bundleRaw: bundleColoRaw,
  }),
  // The backup/archival card (type 11, "Restore Point") — Schedule lineage;
  // additive-only join per the content-is-authority drift law.
  "backup-archival": Object.freeze({
    sliceStem: "g1-backup-archival-first-quarter",
    sliceRaw: sliceBackupArchivalRaw,
    bundleRaw: bundleBackupArchivalRaw,
  }),
});

/* ────────────────────────── registry threatMeta (once) ────────────────────────── */

let threatMetaLookup: ((threatId: string) => ForeignThreatMeta | undefined) | null = null;

/** Registry metadata the foreign slice entries do not carry (family,
 *  denomination) — the memoized worker-side wrapper over THE single
 *  registry→threatMeta authority (`buildThreatMetaLookup`, waves/foreign.ts
 *  — the m4 fold retired this file's former "browser twin" copy). The
 *  cross-table closure identity stands: every table's authority shares this
 *  one lookup over the same ?raw registry-core. */
function workerThreatMeta(): (threatId: string) => ForeignThreatMeta | undefined {
  if (threatMetaLookup !== null) return threatMetaLookup;
  threatMetaLookup = buildThreatMetaLookup(JSON.parse(registryRaw), "corpusHost");
  return threatMetaLookup;
}

/* ─────────────────────────── memoized authorities ─────────────────────────── */

const lawOffAuthorities = new Map<CorpusTableId, CorpusAuthority>();

/** The law-off authority for one cited table (every shipped threat
 *  spawnable) — the boot default, memoized per table, frozen. Carries the
 *  cited bundle's own `type` as `typeBundleId` so the seam names the right
 *  type universe for any of the eight tables (the chrome card, pinned to
 *  shared-web, never needed the override). */
export function workerCorpusAuthority(tableId: CorpusTableId): CorpusAuthority {
  const cached = lawOffAuthorities.get(tableId);
  if (cached !== undefined) return cached;
  const entry = CORPUS_TABLES[tableId];
  const slices = new Map<string, unknown>();
  slices.set(entry.sliceStem, JSON.parse(entry.sliceRaw) as unknown);
  const authority = Object.freeze({
    slices,
    threatMeta: workerThreatMeta(),
    typeBundleId: `official:${tableId}`,
  });
  lawOffAuthorities.set(tableId, authority);
  return authority;
}

/* ────────────────── the REAL invitation law, per table ────────────────── */

function bundleInvitationLaw(tableId: CorpusTableId): Readonly<Record<string, readonly string[]>> {
  const bundle = JSON.parse(CORPUS_TABLES[tableId].bundleRaw) as {
    threats?: { unlockedByBuildables?: Record<string, readonly string[]> };
  };
  const law = bundle.threats?.unlockedByBuildables;
  if (law === undefined || Object.keys(law).length === 0) {
    throw new Error(`corpusHost: ${tableId}.json carries no threats.unlockedByBuildables law`);
  }
  return law;
}

const invitationsByTable = new Map<CorpusTableId, ThreatInvitations>();

/** threat-id → inviter pool for one cited table, inverted by the SAME public
 *  `buildInvitations` the scenario fixture host uses — no second authority
 *  is invented here (corpusMission.protoInvitations, generalized to eight).
 *  Not consumed by the boot path (law-off default above): it feeds the
 *  seeded-equivalence witness and tomorrow's surface-carrying wire field. */
export function workerCorpusInvitations(tableId: CorpusTableId): ThreatInvitations {
  const cached = invitationsByTable.get(tableId);
  if (cached !== undefined) return cached;
  const built = buildInvitations(bundleInvitationLaw(tableId));
  invitationsByTable.set(tableId, built);
  return built;
}

/** Browser twin of corpusFixtures.FULL_BUILD_LOG for one table: every
 *  buildable the law names, built at tick 0 — the fully-informed surface the
 *  law-off byte-identity promise is proved against. */
export function workerCorpusFullBuildLog(tableId: CorpusTableId): readonly BuildOp[] {
  return Object.freeze(
    Object.keys(bundleInvitationLaw(tableId))
      .sort()
      .map((buildableId) => Object.freeze({ atTick: 0n, op: "build" as const, buildableId })),
  );
}

/* ─────────────────────────── the drive seam input ─────────────────────────── */

/** Wire citation → `SimCoreRunner` corpus options. Pure and memoized over the
 *  table; the citation's domain wall (≥1 wave, strictly ascending, each ≥ 1,
 *  unresolvable slice) stays with the runner's `mintCorpusDrive` — a boot
 *  that carries garbage faults LOUD through the worker's boot-fault channel,
 *  never boots a quiet season by silence. */
export function workerCorpusDrive(wire: BootCorpusWire): CorpusDriveOptions {
  return Object.freeze({
    authority: workerCorpusAuthority(wire.tableId),
    waves: wire.waves,
    tableId: CORPUS_TABLES[wire.tableId].sliceStem,
  });
}
