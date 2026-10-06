/**
 * Save-file envelope: versioned, migratable, atomically-committed wrapper
 * around the lineage tree (Appendix C `SaveFile`, §2.4 versioning +
 * checkpointing, one-way-door law §9.6/L27).
 *
 * Wire shape (FILE_SCHEMA_VERSION = 2):
 *  { schemaVersion: { file, engine, simContract },   // triple: sim-contract
 *  saveId, createdAtTick,                            //  version gates replay
 *  lineage: { roots[], nodes[], edges[] },           //   (tree semantics here)
 *  globalRecords, streaksShared, settings }
 *
 * Determinism laws for the envelope (task item 4):
 *  - serialization uses ./canonical.ts — the LOCAL DUPLICATE of replay's
 *    canonical ordering rules: code-unit-sorted object keys, bigint exact
 *    decimal, Map/Set insertion-order, fail-loud on NaN/unsafe keys;
 *  - atomic-write contract = serialize → hash → tmp → verify-parse → replace.
 *    The store port's `replace` is the only destructive step and runs last,
 *    so a crash mid-write leaves either the old file or the new one — never
 *    a half state (crash-safety is the settlement atomicity promise);
 *  - migrations are PURE fns v(n) → v(n+1) over the WIRE doc (pre-parse),
 *    registered in a chain; old event streams are never rewritten; new fields
 *    get defaults; downgradability = keep the pre-migration backup the
 *    commit helper hands back (the literal one-way door gets a dry-run and a
 *    backup, §2.4).
 *
 * Boundary (task item 5): the REPLAY lane owns the ReplayBundle codec; the
 * LONG SAVE artifact here composes envelope + lineage + run refs and treats
 * each run's bundle as OPAQUE passthrough data (exactly as replay treats our
 * `lineage` bag). Bundles must be in their canonical-JSON shape to embed;
 * binary-form bundles live behind `replayBundleRef` pointers.
 */

import type { SimTick } from "../types.ts";
import { canonicalJson, digestSaveValue, fromCanonicalJson } from "./canonical.ts";
import { fail, requireDefined } from "./errors.ts";
import type { LineageGraph } from "./lineage.ts";
import { assertLineageIntegrity, parseLineageWireGraph } from "./lineage.ts";
import type { CompanyNode } from "./node.ts";
import { parseCompanyNode } from "./node.ts";
import type { SaveMode } from "./modes.ts";
import { SAVE_MODES } from "./modes.ts";
import type { SharedStreaks, StreakCounter } from "./streaks.ts";
import { emptyStreaks } from "./streaks.ts";

/* ═══════════════════════ typed envelope ═══════════════════════ */

export const FILE_SCHEMA_VERSION = 2 as const;

export interface SaveSchemaVersion {
  readonly file: number;
  readonly engine: string;
  /** Sim-contract version: gates whether a run's seed+input_log re-expands
   *  (mismatch → fall back to that run's last full snapshot, §2.4). */
  readonly simContract: string;
}

/** Almanac-level counters spanning the WHOLE lineage (L8: "across every
 *  company you have ever run"). Append-then-project; numbers/strings only. */
export interface GlobalRecords {
  readonly costliestThreatEver: { readonly threatId: string; readonly costMicroUsd: bigint; readonly nodeRef: string } | null;
  readonly longestStreakAcrossCompanies: number;
  readonly linesNeverPlayed: readonly string[];
  readonly recordHolders: Readonly<Record<string, { readonly value: number; readonly nodeRef: string }>>;
}

/** §2.x settings: L27 Hardcore/Ironman is a FLAG, not a mode; D9 sync policy
 *  note lives in the flag's semantics, not here. */
export interface SaveSettings {
  readonly hardcoreIronman: boolean;
  /** Opaque director memory (waves lane interprets). */
  readonly difficultyDirectorState: Readonly<Record<string, unknown>>;
  /** U4: seeded threat-intro order cache, keyed `${levelId}::${runSeed}`. */
  readonly seededOrderCache: Readonly<Record<string, string>>;
}

export interface SaveFile {
  readonly schemaVersion: SaveSchemaVersion;
  readonly saveId: string;
  readonly createdAtTick: SimTick;
  readonly lineage: LineageGraph;
  readonly globalRecords: GlobalRecords;
  /** THE single shared cross-mode counter set (streaks.ts). */
  readonly streaksShared: SharedStreaks;
  readonly settings: SaveSettings;
}

export function emptyGlobalRecords(): GlobalRecords {
  return { costliestThreatEver: null, longestStreakAcrossCompanies: 0, linesNeverPlayed: [], recordHolders: {} };
}

export interface NewSaveOptions {
  readonly saveId: string;
  readonly engineVersion: string;
  readonly simContract: string;
  readonly createdAtTick: SimTick;
  readonly hardcoreIronman?: boolean;
}

/** A brand-new Long Save: version triple at current, empty lineage root set. */
export function newSaveFile(options: NewSaveOptions): SaveFile {
  if (options.saveId.length === 0) fail("newSaveFile: empty saveId");
  return {
    schemaVersion: { file: FILE_SCHEMA_VERSION, engine: options.engineVersion, simContract: options.simContract },
    saveId: options.saveId,
    createdAtTick: options.createdAtTick,
    lineage: { roots: [], nodes: new Map(), edges: [] },
    globalRecords: emptyGlobalRecords(),
    streaksShared: emptyStreaks(),
    settings: {
      hardcoreIronman: options.hardcoreIronman ?? false,
      difficultyDirectorState: {},
      seededOrderCache: {},
    },
  };
}

/* ═══════════════════════ wire ⇄ typed (boundary, Law 2) ═══════════════════════ */

type Dict = Record<string, unknown>;

function asDict(value: unknown, where: string): Dict {
  if (typeof value !== "object" || value === null || Array.isArray(value)) fail(`${where}: expected object`);
  return value as Dict;
}

function asStr(value: unknown, where: string): string {
  if (typeof value !== "string") fail(`${where}: expected string, got ${typeof value}`);
  return value;
}

function asInt(value: unknown, where: string): number {
  if (typeof value !== "number" || !Number.isInteger(value)) fail(`${where}: expected integer`);
  return Object.is(value, -0) ? 0 : value; // S-4c parity with node.ts: -0 normalizes at parse
}

function asBig(value: unknown, where: string): bigint {
  if (typeof value !== "bigint") fail(`${where}: expected bigint (decode with fromCanonicalJson, not JSON.parse)`);
  return value;
}

function asBool(value: unknown, where: string): boolean {
  if (typeof value !== "boolean") fail(`${where}: expected boolean`);
  return value;
}

function asArr(value: unknown, where: string): unknown[] {
  if (!Array.isArray(value)) fail(`${where}: expected array`);
  return value;
}

/** SaveFile → plain wire record (arrays, not Maps — stable, MySQL-friendly). */
export function saveFileToWire(save: SaveFile): Dict {
  return {
    schemaVersion: { file: save.schemaVersion.file, engine: save.schemaVersion.engine, simContract: save.schemaVersion.simContract },
    saveId: save.saveId,
    createdAtTick: save.createdAtTick,
    lineage: {
      roots: [...save.lineage.roots],
      nodes: [...save.lineage.nodes.values()],
      edges: save.lineage.edges.map((edge) => ({
        parentId: edge.parentId,
        childId: edge.childId,
        type: edge.type,
        manifest: {
          keptNodes: [...edge.manifest.keptNodes],
          doctrine: { id: edge.manifest.doctrine.id, textRef: edge.manifest.doctrine.textRef, adoptedAtTick: edge.manifest.doctrine.adoptedAtTick },
          playbook: edge.manifest.playbook,
          cashSliceMicroUsd: edge.manifest.cashSliceMicroUsd,
          failureOnlyUnlock: edge.manifest.failureOnlyUnlock,
          handwritingParent: edge.manifest.handwritingParent,
        },
        preservedMuseumExhibitIds: [...edge.preservedMuseumExhibitIds],
      })),
    },
    globalRecords: {
      costliestThreatEver: save.globalRecords.costliestThreatEver === null ? null : { ...save.globalRecords.costliestThreatEver },
      longestStreakAcrossCompanies: save.globalRecords.longestStreakAcrossCompanies,
      linesNeverPlayed: [...save.globalRecords.linesNeverPlayed],
      recordHolders: save.globalRecords.recordHolders,
    },
    streaksShared: {
      uptime: { ...save.streaksShared.uptime },
      noDataLoss: { ...save.streaksShared.noDataLoss },
      noSecurity: { ...save.streaksShared.noSecurity },
      noMissedBackup: { ...save.streaksShared.noMissedBackup },
    },
    settings: {
      hardcoreIronman: save.settings.hardcoreIronman,
      difficultyDirectorState: save.settings.difficultyDirectorState,
      seededOrderCache: { ...save.settings.seededOrderCache },
    },
  };
}

function parseStreakCounter(value: unknown, where: string): StreakCounter {
  const d = asDict(value, where);
  return {
    current: asInt(d.current, `${where}.current`),
    longest: asInt(d.longest, `${where}.longest`),
    // S-12: missing key ≡ explicit null ≡ "never erased" — aligned with every
    // sibling optional (asTickOrNull, incidentRef, memorialNote, …).
    lastEraseAtTick: d.lastEraseAtTick === null || d.lastEraseAtTick === undefined ? null : asBig(d.lastEraseAtTick, `${where}.lastEraseAtTick`),
  };
}

/** Strict boundary parse of a WIRE doc at the CURRENT file version. */
export function parseSaveWire(value: unknown): SaveFile {
  const d = asDict(value, "save");
  const sv = asDict(requireDefined(d.schemaVersion, "save.schemaVersion"), "save.schemaVersion");
  const file = asInt(sv.file, "save.schemaVersion.file");
  if (file !== FILE_SCHEMA_VERSION) {
    fail(`parseSaveWire: wire is file v${file}, not current v${FILE_SCHEMA_VERSION} — run it through migrateSaveWire first`);
  }
  const lineage = parseLineageWireGraph(requireDefined(d.lineage, "save.lineage"), "save.lineage");
  const gr = asDict(requireDefined(d.globalRecords, "save.globalRecords"), "save.globalRecords");
  const costliest = gr.costliestThreatEver;
  const ss = asDict(requireDefined(d.streaksShared, "save.streaksShared"), "save.streaksShared");
  const st = asDict(requireDefined(d.settings, "save.settings"), "save.settings");
  const save: SaveFile = {
    schemaVersion: {
      file,
      engine: asStr(sv.engine, "save.schemaVersion.engine"),
      simContract: asStr(sv.simContract, "save.schemaVersion.simContract"),
    },
    saveId: asStr(d.saveId, "save.saveId"),
    createdAtTick: asBig(d.createdAtTick, "save.createdAtTick"),
    lineage,
    globalRecords: {
      costliestThreatEver:
        costliest === null || costliest === undefined
          ? null
          : (() => {
              const c = asDict(costliest, "globalRecords.costliestThreatEver");
              return { threatId: asStr(c.threatId, "threatId"), costMicroUsd: asBig(c.costMicroUsd, "costMicroUsd"), nodeRef: asStr(c.nodeRef, "nodeRef") };
            })(),
      longestStreakAcrossCompanies: asInt(gr.longestStreakAcrossCompanies, "globalRecords.longestStreakAcrossCompanies"),
      linesNeverPlayed: asArr(gr.linesNeverPlayed, "globalRecords.linesNeverPlayed").map((l, i) => asStr(l, `linesNeverPlayed[${i}]`)),
      recordHolders: (() => {
        const src = asDict(gr.recordHolders ?? {}, "globalRecords.recordHolders");
        const out: Record<string, { value: number; nodeRef: string }> = {};
        for (const [k, raw] of Object.entries(src)) {
          const r = asDict(raw, `recordHolders.${k}`);
          out[k] = { value: asInt(r.value, "value"), nodeRef: asStr(r.nodeRef, "nodeRef") };
        }
        return out;
      })(),
    },
    streaksShared: {
      uptime: parseStreakCounter(requireDefined(ss.uptime, "streaksShared.uptime"), "streaksShared.uptime"),
      noDataLoss: parseStreakCounter(requireDefined(ss.noDataLoss, "streaksShared.noDataLoss"), "streaksShared.noDataLoss"),
      noSecurity: parseStreakCounter(requireDefined(ss.noSecurity, "streaksShared.noSecurity"), "streaksShared.noSecurity"),
      noMissedBackup: parseStreakCounter(requireDefined(ss.noMissedBackup, "streaksShared.noMissedBackup"), "streaksShared.noMissedBackup"),
    },
    settings: {
      hardcoreIronman: asBool(st.hardcoreIronman, "settings.hardcoreIronman"),
      difficultyDirectorState: asDict(st.difficultyDirectorState ?? {}, "settings.difficultyDirectorState"),
      seededOrderCache: (() => {
        const src = asDict(st.seededOrderCache ?? {}, "settings.seededOrderCache");
        const out: Record<string, string> = {};
        for (const [k, v] of Object.entries(src)) out[k] = asStr(v, `seededOrderCache.${k}`);
        return out;
      })(),
    },
  };
  assertLineageIntegrity(save.lineage);
  return save;
}

/* ═══════════════════════ migration registry (pure v(n)→v(n+1)) ═══════════════════════ */

export interface SaveMigration {
  readonly from: number;
  readonly to: number;
  readonly description: string;
  /** One-way-door dry-run report lines (§9.6: show the door before opening). */
  readonly dryRunNotes: readonly string[];
  /** PURE wire→wire transform. Never rewrite old event streams; defaults for
   *  new fields; deprecated mechanics keep their data (Appendix C §2.4). */
  readonly migrate: (doc: Dict) => Dict;
}

export interface MigrationRegistry {
  readonly migrations: ReadonlyMap<number, SaveMigration>;
}

export function createMigrationRegistry(migrations: readonly SaveMigration[] = []): MigrationRegistry {
  const map = new Map<number, SaveMigration>();
  for (const m of migrations) {
    if (map.has(m.from)) fail(`migration registry: duplicate migration from v${m.from}`);
    if (m.to !== m.from + 1) fail(`migration registry: v${m.from}→v${m.to} skips a version — chains must step by one`);
    map.set(m.from, m);
  }
  return { migrations: map };
}

export function registerMigration(registry: MigrationRegistry, migration: SaveMigration): MigrationRegistry {
  return createMigrationRegistry([...registry.migrations.values(), migration]);
}

export function planMigrationChain(registry: MigrationRegistry, from: number, to: number): readonly SaveMigration[] {
  if (from === to) return [];
  if (from > to) fail(`migration plan: downgrade ${from}→${to} is not a migration — restore the pre-migration backup instead (one-way door)`);
  const chain: SaveMigration[] = [];
  let cursor = from;
  while (cursor < to) {
    const step = registry.migrations.get(cursor);
    if (step === undefined) fail(`migration plan: no v${cursor}→v${cursor + 1} path — this save cannot load on this build`);
    chain.push(step);
    cursor = step.to;
  }
  return chain;
}

export interface MigrationPlan {
  readonly chain: readonly SaveMigration[];
  readonly dryRunNotes: readonly string[];
  readonly backupRequired: true;
}

export function planSaveMigration(registry: MigrationRegistry, wire: Dict, target = FILE_SCHEMA_VERSION): MigrationPlan {
  const sv = asDict(requireDefined(wire.schemaVersion, "wire.schemaVersion"), "wire.schemaVersion");
  const from = asInt(sv.file, "wire.schemaVersion.file");
  const chain = planMigrationChain(registry, from, target);
  return {
    chain,
    dryRunNotes: chain.flatMap((m) => m.dryRunNotes),
    backupRequired: true,
  };
}

/** Apply the chain to a wire doc; each step re-stamps its version. Pure:
 *  returns a NEW doc, input untouched (Law 3). */
export function migrateSaveWire(registry: MigrationRegistry, wire: Dict, target = FILE_SCHEMA_VERSION): Dict {
  const plan = planSaveMigration(registry, wire, target);
  let doc = wire;
  for (const step of plan.chain) {
    const before = asInt(requireDefined(asDict(doc.schemaVersion, "doc.schemaVersion").file, "doc.schemaVersion.file"), "version");
    doc = step.migrate(doc);
    const after = asInt(requireDefined(asDict(doc.schemaVersion, "doc.schemaVersion").file, "doc.schemaVersion.file"), "version");
    if (after !== step.to || before !== step.from) {
      fail(`migration v${step.from}→v${step.to} returned version ${after} — migration contract violated`);
    }
  }
  return doc;
}

/** THE DEFAULT REGISTRY. The v1→v2 stub is the Appendix C prototype's literal
 *  exercise: "adds breach_history[] mid-save". Pure, additive, non-destructive. */
export const SAVE_MIGRATIONS: MigrationRegistry = createMigrationRegistry([
  {
    from: 1,
    to: 2,
    description: "add reputation.breachHistoryTicks (v2): trustworthiness ledger per the U22 clean-day ladder",
    dryRunNotes: [
      "adds nodes[].reputation.breachHistoryTicks = [] (append-only, starts empty)",
      "bumps schemaVersion.file 1 → 2",
      "rewrites nothing else; old event streams untouched",
    ],
    migrate: (doc) => {
      const lineage = asDict(requireDefined(doc.lineage, "v1 doc.lineage"), "doc.lineage");
      const nodes = asArr(lineage.nodes, "lineage.nodes").map((raw) => {
        const node = asDict(raw, "lineage.nodes[]");
        const reputation = asDict(requireDefined(node.reputation, "node.reputation"), "node.reputation");
        if (reputation.breachHistoryTicks !== undefined) return node; // already migrated — pass through
        return { ...node, reputation: { ...reputation, breachHistoryTicks: [] } };
      });
      const sv = asDict(requireDefined(doc.schemaVersion, "doc.schemaVersion"), "doc.schemaVersion");
      return {
        ...doc,
        schemaVersion: { ...sv, file: 2 },
        lineage: { ...lineage, nodes },
      };
    },
  },
]);

/* ═══════════════════════ atomic-write contract ═══════════════════════ */

/** Storage port injected by the host (IndexedDB / fs / MySQL row — save/ owns
 *  no platform I/O; the CONTRACT is: replace(key) is atomic and last). */
export interface SaveStorePort {
  read(key: string): string | null;
  writeTmp(key: string, payload: string): void;
  /** Atomic swap tmp → final (POSIX rename / IndexedDB single tx). */
  replace(key: string): void;
  deleteTmp(key: string): void;
}

export interface PreparedAtomicWrite {
  readonly key: string;
  readonly tmpKey: string;
  readonly payload: string;
  readonly digest: string;
  readonly fileVersion: number;
}

/** STEP 1+2 of the contract: serialize (canonical) → hash. Deterministic:
 *  same SaveFile, any key order → same payload bytes and same digest. */
export function prepareAtomicWrite(save: SaveFile, key = `save:${save.saveId}`): PreparedAtomicWrite {
  const payload = canonicalJson(saveFileToWire(save));
  const digest = digestSaveValue(fromCanonicalJson(payload)); // hash the DECODED value: canonical round-trip proof baked in
  return { key, tmpKey: `${key}.tmp`, payload, digest, fileVersion: save.schemaVersion.file };
}

/** Full contract: serialize → hash → tmp-write → re-parse-verify → replace.
 *  Verification failure aborts BEFORE replace (old file survives untouched).
 *  Returns the backup text of the previous payload (null when none) — the
 *  downgradability window materializes as data the caller can keep. */
export function commitAtomicWrite(port: SaveStorePort, save: SaveFile, key?: string): { digest: string; previousBackup: string | null } {
  const prepared = prepareAtomicWrite(save, key);
  const previousBackup = port.read(prepared.key);
  port.writeTmp(prepared.tmpKey, prepared.payload);
  try {
    const reread = port.read(prepared.tmpKey);
    if (reread === null) fail("commitAtomicWrite: tmp payload vanished before verify");
    if (reread !== prepared.payload) fail("commitAtomicWrite: tmp payload differs from serialized bytes");
    const migrated = migrateSaveWire(SAVE_MIGRATIONS, asDict(fromCanonicalJson(reread), "commitAtomicWrite.wire"));
    parseSaveWire(migrated); // full boundary parse of our own bytes — fail loud pre-replace
  } catch (error) {
    port.deleteTmp(prepared.tmpKey);
    throw error;
  }
  port.replace(prepared.key);
  return { digest: prepared.digest, previousBackup };
}

/** Load + verify: read text → decode → migrate → parse; optionally pin the
 *  digest (the hash-chain integrity check for settlement receipts). */
export function readSave(port: SaveStorePort, key: string, opts: { expectDigest?: string } = {}): SaveFile {
  const text = port.read(key);
  if (text === null) fail(`readSave: no save at "${key}"`);
  if (opts.expectDigest !== undefined) {
    const actual = digestSaveValue(fromCanonicalJson(text));
    if (actual !== opts.expectDigest) fail(`readSave: digest mismatch (chain broken or file corrupted) at "${key}"`);
  }
  const wire = asDict(fromCanonicalJson(text), "readSave.wire");
  const migrated = migrateSaveWire(SAVE_MIGRATIONS, wire);
  return parseSaveWire(migrated);
}

/* ═══════════════════════ THE LONG SAVE artifact (task item 5) ═══════════════════════ */

export const LONG_SAVE_SCHEMA_VERSION = 1 as const;

/** One committed run inside the Long Save. The bundle itself is owned by the
 *  replay lane (seed + intentLog + checkpoints + snapshots); save composes
 *  the reference or embeds the canonical-JSON form OPAQUELY — the same
 *  non-decoding passthrough replay applies to our lineage field. */
export interface LongSaveRunRef {
  readonly runId: string;
  readonly mode: SaveMode;
  readonly committedAtTick: SimTick;
  /** Pointer into the bundle store (always present, even when embedded). */
  readonly replayBundleRef: string;
  /** Optional embedded canonical-JSON bundle doc — opaque passthrough. */
  readonly replayBundle?: unknown;
}

export interface LongSaveDoc {
  readonly schemaVersion: typeof LONG_SAVE_SCHEMA_VERSION;
  readonly envelope: SaveFile;
  readonly runs: readonly LongSaveRunRef[];
}

export function composeLongSave(envelope: SaveFile, runs: readonly LongSaveRunRef[]): LongSaveDoc {
  const seen = new Set<string>();
  for (const run of runs) {
    if (run.runId.length === 0) fail("composeLongSave: empty runId");
    if (seen.has(run.runId)) fail(`composeLongSave: duplicate run "${run.runId}"`);
    seen.add(run.runId);
  }
  return { schemaVersion: LONG_SAVE_SCHEMA_VERSION, envelope, runs: [...runs] };
}

export function longSaveToWire(doc: LongSaveDoc): Dict {
  return {
    schemaVersion: doc.schemaVersion,
    envelope: saveFileToWire(doc.envelope),
    runs: doc.runs.map((run) => ({
      runId: run.runId,
      mode: run.mode,
      committedAtTick: run.committedAtTick,
      replayBundleRef: run.replayBundleRef,
      ...(run.replayBundle === undefined ? {} : { replayBundle: run.replayBundle }),
    })),
  };
}

export function parseLongSaveWire(value: unknown): LongSaveDoc {
  const d = asDict(value, "longSave");
  const version = asInt(d.schemaVersion, "longSave.schemaVersion");
  if (version !== LONG_SAVE_SCHEMA_VERSION) fail(`parseLongSaveWire: unsupported long-save version ${version}`);
  const envelope = parseSaveWire(requireDefined(d.envelope, "longSave.envelope"));
  const runs = asArr(d.runs, "longSave.runs").map((raw, i) => {
    const where = `longSave.runs[${i}]`;
    const r = asDict(raw, where);
    const mode = asStr(r.mode, `${where}.mode`);
    if (!SAVE_MODES.includes(mode as SaveMode)) fail(`${where}.mode: "${mode}" is not a known save mode`);
    const bundle = r.replayBundle;
    if (bundle !== undefined) {
      // Passthrough integrity: an embedded bundle must at least survive the
      // canonical round-trip (it may hold bigints; unknown shapes stay unknown).
      canonicalJson(bundle);
    }
    return {
      runId: asStr(r.runId, `${where}.runId`),
      mode: mode as SaveMode,
      committedAtTick: asBig(r.committedAtTick, `${where}.committedAtTick`),
      replayBundleRef: asStr(r.replayBundleRef, `${where}.replayBundleRef`),
      ...(bundle === undefined ? {} : { replayBundle: bundle }),
    } satisfies LongSaveRunRef;
  });
  return composeLongSave(envelope, runs);
}

/** Serialize the whole Long Save artifact deterministically + digest it. */
export function serializeLongSave(doc: LongSaveDoc): string {
  return canonicalJson(longSaveToWire(doc));
}

export function digestLongSave(doc: LongSaveDoc): string {
  return digestSaveValue(fromCanonicalJson(serializeLongSave(doc)));
}

export function parseLongSave(text: string): LongSaveDoc {
  return parseLongSaveWire(fromCanonicalJson(text));
}

/* re-export for facet parse typing convenience */
export type { CompanyNode };
