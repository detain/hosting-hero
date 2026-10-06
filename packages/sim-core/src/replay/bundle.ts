/**
 * ReplayBundle codec (§3.3 canonical artifact set, §4.1 replay artifact,
 * §7.0 "THE LONG SAVE = checkpoint + input tail").
 *
 * Wire shape (schemaVersion 1):
 *  `{runSeed, engineVersion, contentHashes, snapshotEveryTicks,
 *    intentLog tick-stamped, directorDraws, checkpoints, snapshots,
 *    lineage}`
 *  - `intentLog` entries wrap the contract `PlayerIntent` with the macro-tick
 *    the host fed it (canonical order = what the core received, §3.2);
 *  - `checkpoints` is the dense state-hash ring (§7.0 tripwire) — the
 *    verifier's bisection oracle for first-divergent-tick;
 *  - `snapshots` are the coarse checkpoints and may EMBED the full canonical
 *    state (the LONG SAVE tail + the diff oracle);
 *  - `lineage` (CompanyNode boundary fields, Appendix C) is an OPAQUE
 *    passthrough — the save workstream owns tree semantics; this codec only
 *    guarantees byte-preserving round-trip;
 *  - UNKNOWN KEYS are captured at every validated level (bundle root,
 *    intent, director draw, checkpoint, snapshot, intent) and re-emitted on
 *    encode → forward-compatible: a newer writer's extra fields survive an
 *    older reader untouched.
 */

import type {
  Checkpoint,
  DirectorDraw,
  HashHex,
  PlayerIntent,
  ReplayBundle,
  ReplayContentHashes,
  RunSeed,
  SimTick,
} from "../types.ts";
import { asRuleId, asRunSeed } from "../types.ts";
import {
  ReplayError,
  decodeCanonicalBinary,
  decodeCanonicalJson,
  encodeCanonicalBinary,
  encodeCanonicalJson,
} from "./canonical.ts";

export const REPLAY_SCHEMA_VERSION = 1 as const;

/** Unknown-key sidecar: preserved verbatim, re-emitted on encode. */
export type BundleExtras = Readonly<Record<string, unknown>>;

export interface StampedIntent {
  /** Macro-tick the host fed this intent (replay order key). */
  readonly tick: SimTick;
  readonly intent: PlayerIntent;
  readonly extras?: BundleExtras;
}

export interface SnapshotRecord {
  readonly tick: SimTick;
  readonly stateHash: HashHex;
  /** Embedded canonical state (LONG SAVE tail / diff oracle). Absent =
   *  hash-only checkpoint (what compaction leaves for superseded ticks). */
  readonly state?: unknown;
  /** State blob encoding used in `state` when serialized on the wire. */
  readonly stateEncoding?: "canonical-json" | "canonical-binary";
  readonly extras?: BundleExtras;
}

export interface ReplayBundleDoc {
  readonly schemaVersion: typeof REPLAY_SCHEMA_VERSION;
  readonly runSeed: RunSeed;
  readonly engineVersion: string;
  readonly contentHashes: ReplayContentHashes;
  readonly snapshotEveryTicks: SimTick;
  readonly intentLog: readonly StampedIntent[];
  readonly directorDraws: readonly DirectorDraw[];
  /** Dense state-hash ring (§7.0). Tick 0 (the seed state) SHOULD be present. */
  readonly checkpoints: readonly Checkpoint[];
  /** Coarse snapshots; every entry's tick appears in `checkpoints` WITH THE
   *  SAME stateHash (parse-enforced — a snapshot may never fork the ring). */
  readonly snapshots: readonly SnapshotRecord[];
  /** CompanyNode/lineage boundary fields — opaque passthrough (§3.3 item 2,
   *  tree semantics owned by the save workstream). */
  readonly lineage: BundleExtras;
  readonly extras?: BundleExtras;
}

/* ═══════════════════════ Boundary parse guards (Law 2 + Law 4) ═══════════════════════ */

type Expect<T> = (value: unknown, where: string) => T;

const expectRecord: Expect<Record<string, unknown>> = (value, where) => {
  if (typeof value !== "object" || value === null || Array.isArray(value) || value instanceof Map || value instanceof Set) {
    throw new ReplayError(`${where}: expected a plain object, got ${typeof value}`);
  }
  return value as Record<string, unknown>;
};

const expectString: Expect<string> = (value, where) => {
  if (typeof value !== "string") throw new ReplayError(`${where}: expected string, got ${typeof value}`);
  return value;
};

const expectNumber: Expect<number> = (value, where) => {
  if (typeof value !== "number" || !Number.isSafeInteger(value)) {
    throw new ReplayError(`${where}: expected safe integer number, got ${String(value)}`);
  }
  return value;
};

const expectBigint: Expect<bigint> = (value, where) => {
  if (typeof value !== "bigint") throw new ReplayError(`${where}: expected bigint, got ${typeof value}`);
  return value;
};

const expectArray: Expect<readonly unknown[]> = (value, where) => {
  if (!Array.isArray(value)) throw new ReplayError(`${where}: expected array, got ${typeof value}`);
  return value as readonly unknown[];
};

function expectEnum<T extends string>(value: unknown, allowed: readonly T[], where: string): T {
  expectString(value, where);
  if (!allowed.includes(value as T)) {
    throw new ReplayError(`${where}: "${value}" not in {${allowed.join(", ")}}`);
  }
  return value as T;
}

/** Split a wire record into {known fields consumed} → extras of the rest. */
function takeExtras(wire: Record<string, unknown>, known: readonly string[]): BundleExtras | undefined {
  const extras: Record<string, unknown> = {};
  let any = false;
  for (const key of Object.keys(wire)) {
    if (!known.includes(key)) {
      extras[key] = wire[key];
      any = true;
    }
  }
  return any ? extras : undefined;
}

function mergeExtras<T extends Record<string, unknown>>(wire: T, extras: BundleExtras | undefined): T {
  if (extras === undefined || Object.keys(extras).length === 0) return wire;
  return { ...wire, ...extras };
}

/* ═══════════════════════ Intent / draw / record parsing ═══════════════════════ */

const INTENT_KEYS = ["seq", "clock", "atUs", "origin", "ruleId", "payload"] as const;

function parsePlayerIntent(wire: Record<string, unknown>, where: string): { intent: PlayerIntent; extras?: BundleExtras } {
  const payload = expectRecord(wire.payload, `${where}.payload`) as PlayerIntent["payload"];
  expectString(payload.kind, `${where}.payload.kind`); // forward-compat: any kind string survives; the runner validates semantics
  const base = {
    seq: expectNumber(wire.seq, `${where}.seq`),
    clock: expectEnum(wire.clock, ["sim", "business", "wall"] as const, `${where}.clock`),
    atUs: expectBigint(wire.atUs, `${where}.atUs`),
    origin: expectEnum(wire.origin, ["player", "rule"] as const, `${where}.origin`),
    payload,
  };
  const intent: PlayerIntent =
    wire.ruleId === undefined
      ? (base as PlayerIntent)
      : ({ ...base, ruleId: asRuleId(expectString(wire.ruleId, `${where}.ruleId`)) } as PlayerIntent);
  const extras = takeExtras(wire, INTENT_KEYS);
  return extras === undefined ? { intent } : { intent, extras };
}

/** The stamped wrapper is format-owned: unknown keys live INSIDE `intent`
 *  (forward-compat rides the intent record); the wrapper itself is exactly
 *  `{tick, intent}`. */
function parseStampedIntent(value: unknown, index: number): StampedIntent {
  const where = `intentLog[${index}]`;
  const wire = expectRecord(value, where);
  const tick = expectBigint(wire.tick, `${where}.tick`);
  const intentWire = expectRecord(wire.intent, `${where}.intent`);
  const outerExtras = takeExtras(wire, ["tick", "intent"]);
  if (outerExtras !== undefined) {
    throw new ReplayError(`${where}: unknown key(s) [${Object.keys(outerExtras).join(", ")}] — stamped intents carry extensions inside .intent`);
  }
  const { intent, extras } = parsePlayerIntent(intentWire, `${where}.intent`);
  return extras === undefined ? { tick, intent } : { tick, intent, extras };
}

function parseDirectorDraw(value: unknown, index: number): DirectorDraw {
  const where = `directorDraws[${index}]`;
  const wire = expectRecord(value, where);
  return {
    atTick: expectBigint(wire.atTick, `${where}.atTick`),
    subject: expectEnum(wire.subject, ["sawtooth-trough-depth", "entropy-budget"] as const, `${where}.subject`),
    value: expectBigint(wire.value, `${where}.value`),
  };
}

function parseCheckpoint(value: unknown, index: number): Checkpoint {
  const where = `checkpoints[${index}]`;
  const wire = expectRecord(value, where);
  return { tick: expectBigint(wire.tick, `${where}.tick`), stateHash: expectString(wire.stateHash, `${where}.stateHash`) };
}

const SNAPSHOT_KEYS = ["tick", "stateHash", "state", "stateEncoding"] as const;

function parseSnapshot(value: unknown, index: number): SnapshotRecord {
  const where = `snapshots[${index}]`;
  const wire = expectRecord(value, where);
  const stateHash = expectString(wire.stateHash, `${where}.stateHash`);
  const encoding =
    wire.stateEncoding === undefined ? undefined : expectEnum(wire.stateEncoding, ["canonical-json", "canonical-binary"] as const, `${where}.stateEncoding`);
  const record: { tick: SimTick; stateHash: HashHex; state?: unknown; stateEncoding?: "canonical-json" | "canonical-binary" } = {
    tick: expectBigint(wire.tick, `${where}.tick`),
    stateHash,
  };
  if (wire.state !== undefined) {
    record.state = wire.state; // decoded by the canonical layer already (bigints/Maps intact)
  }
  // N3: `stateEncoding` is preserved even when `state` is absent — dropping
  // it here made decode→encode NON-idempotent for hash-only snapshots that
  // carry an encoding declaration. Round-trip byte-stability is the law.
  if (encoding !== undefined) record.stateEncoding = encoding;
  const extras = takeExtras(wire, SNAPSHOT_KEYS);
  return extras === undefined ? record : { ...record, extras };
}

/* ═══════════════════════ Document parse / validate ═══════════════════════ */

function assertMonotonicTicks(ticks: readonly bigint[], what: string): void {
  for (let i = 1; i < ticks.length; i += 1) {
    const prev = ticks[i - 1] as bigint;
    const cur = ticks[i] as bigint;
    if (cur <= prev) throw new ReplayError(`${what}: ticks must strictly increase (${prev} → ${cur})`);
  }
}

/** Parse a decoded wire record into a validated, extras-preserving doc. */
export function parseReplayBundleWire(wire: unknown): ReplayBundleDoc {
  const root = expectRecord(wire, "bundle");
  const schemaVersion = expectNumber(root.schemaVersion, "bundle.schemaVersion");
  if (schemaVersion !== REPLAY_SCHEMA_VERSION) {
    throw new ReplayError(`bundle.schemaVersion: unsupported version ${schemaVersion} (this build reads ${REPLAY_SCHEMA_VERSION})`);
  }
  const hashesWire = expectRecord(root.contentHashes, "bundle.contentHashes");
  const cardsWire = expectRecord(hashesWire.rulesetCardHashes, "bundle.contentHashes.rulesetCardHashes");
  const rulesetCardHashes: Record<string, HashHex> = {};
  for (const key of Object.keys(cardsWire)) rulesetCardHashes[key] = expectString(cardsWire[key], `bundle.contentHashes.rulesetCardHashes.${key}`);

  const intentLog = expectArray(root.intentLog, "bundle.intentLog").map(parseStampedIntent);
  const directorDraws = expectArray(root.directorDraws, "bundle.directorDraws").map(parseDirectorDraw);
  const checkpoints = expectArray(root.checkpoints, "bundle.checkpoints").map(parseCheckpoint);
  const snapshots = expectArray(root.snapshots, "bundle.snapshots").map(parseSnapshot);
  assertMonotonicTicks(intentLog.map((e) => e.tick), "bundle.intentLog.tick");
  assertMonotonicTicks(checkpoints.map((c) => c.tick), "bundle.checkpoints.tick");
  assertMonotonicTicks(snapshots.map((s) => s.tick), "bundle.snapshots.tick");
  // R3: snapshot ⊆ checkpoint ring is a TICK *AND HASH* inclusion. Accepting
  // a same-tick snapshot with a different stateHash would let it silently
  // OVERWRITE the ring entry in the verifier's hash-point map — skipping a
  // check point and breaking the bisection precondition (the ring must stay
  // the single dense truth the bisection probes).
  const ringHashByTick = new Map<SimTick, HashHex>(checkpoints.map((c) => [c.tick, c.stateHash]));
  for (const snap of snapshots) {
    const ringHash = ringHashByTick.get(snap.tick);
    if (ringHash === undefined) {
      throw new ReplayError(`bundle.snapshots: snapshot tick ${snap.tick} missing from checkpoints`);
    }
    if (ringHash !== snap.stateHash) {
      throw new ReplayError(
        `bundle.snapshots: snapshot tick ${snap.tick} stateHash ${snap.stateHash} disagrees with checkpoint ring hash ${ringHash}`,
      );
    }
  }

  const doc: ReplayBundleDoc = {
    schemaVersion: REPLAY_SCHEMA_VERSION,
    runSeed: asRunSeed(expectBigint(root.runSeed, "bundle.runSeed")),
    engineVersion: expectString(root.engineVersion, "bundle.engineVersion"),
    contentHashes: {
      rulesetCardHashes,
      sheetsHash: expectString(hashesWire.sheetsHash, "bundle.contentHashes.sheetsHash"),
      ruleBookHash: expectString(hashesWire.ruleBookHash, "bundle.contentHashes.ruleBookHash"),
    },
    snapshotEveryTicks: expectBigint(root.snapshotEveryTicks, "bundle.snapshotEveryTicks"),
    intentLog,
    directorDraws,
    checkpoints,
    snapshots,
    lineage: expectRecord(root.lineage ?? {}, "bundle.lineage"),
  };
  const extras = takeExtras(root, [
    "schemaVersion",
    "runSeed",
    "engineVersion",
    "contentHashes",
    "snapshotEveryTicks",
    "intentLog",
    "directorDraws",
    "checkpoints",
    "snapshots",
    "lineage",
  ]);
  return extras === undefined ? doc : { ...doc, extras };
}

/* ═══════════════════════ Doc → wire → text/bytes ═══════════════════════ */

function intentToWire(entry: StampedIntent): Record<string, unknown> {
  const { intent } = entry;
  const intentWireBase: Record<string, unknown> = {
    seq: intent.seq,
    clock: intent.clock,
    atUs: intent.atUs,
    origin: intent.origin,
    payload: intent.payload,
  };
  const intentWire = intent.ruleId === undefined ? intentWireBase : { ...intentWireBase, ruleId: intent.ruleId };
  return { tick: entry.tick, intent: mergeExtras(intentWire, entry.extras) };
}

function snapshotToWire(snap: SnapshotRecord): Record<string, unknown> {
  const wire: Record<string, unknown> = { tick: snap.tick, stateHash: snap.stateHash };
  if (snap.state !== undefined) wire.state = snap.state;
  if (snap.stateEncoding !== undefined) wire.stateEncoding = snap.stateEncoding; // emitted with OR without state (N3)
  return mergeExtras(wire, snap.extras);
}

/** Build the wire record (extras merged back in, doc-typed fields first). */
export function replayBundleDocToWire(doc: ReplayBundleDoc): Record<string, unknown> {
  const wire: Record<string, unknown> = {
    schemaVersion: doc.schemaVersion,
    runSeed: doc.runSeed,
    engineVersion: doc.engineVersion,
    contentHashes: { rulesetCardHashes: { ...doc.contentHashes.rulesetCardHashes }, sheetsHash: doc.contentHashes.sheetsHash, ruleBookHash: doc.contentHashes.ruleBookHash },
    snapshotEveryTicks: doc.snapshotEveryTicks,
    intentLog: doc.intentLog.map(intentToWire),
    directorDraws: doc.directorDraws.map((d) => ({ atTick: d.atTick, subject: d.subject, value: d.value })),
    checkpoints: doc.checkpoints.map((c) => ({ tick: c.tick, stateHash: c.stateHash })),
    snapshots: doc.snapshots.map(snapshotToWire),
    lineage: { ...doc.lineage },
  };
  return mergeExtras(wire, doc.extras);
}

export function encodeReplayBundleJson(doc: ReplayBundleDoc): string {
  return encodeCanonicalJson(replayBundleDocToWire(doc));
}

export function encodeReplayBundleBinary(doc: ReplayBundleDoc): Uint8Array {
  return encodeCanonicalBinary(replayBundleDocToWire(doc));
}

export function decodeReplayBundleJson(text: string): ReplayBundleDoc {
  return parseReplayBundleWire(decodeCanonicalJson(text));
}

export function decodeReplayBundleBinary(bytes: Uint8Array): ReplayBundleDoc {
  return parseReplayBundleWire(decodeCanonicalBinary(bytes));
}

/** Format auto-detection for stored bundles (string = JSON, bytes = binary). */
export function decodeReplayBundle(textOrBytes: string | Uint8Array): ReplayBundleDoc {
  return typeof textOrBytes === "string" ? decodeReplayBundleJson(textOrBytes) : decodeReplayBundleBinary(textOrBytes);
}

/* ═══════════════════════ Contract projection (§3.3 canonical fields) ═══════════════════════ */

/** Project a doc down to the shared-contract `ReplayBundle` (intents
 *  un-stamped, snapshots flattened to `{tick, stateHash}`). */
export function toReplayBundle(doc: ReplayBundleDoc): ReplayBundle {
  return {
    runSeed: doc.runSeed,
    engineVersion: doc.engineVersion,
    contentHashes: doc.contentHashes,
    snapshotEveryTicks: doc.snapshotEveryTicks,
    intentLog: doc.intentLog.map((entry) => entry.intent),
    directorDraws: doc.directorDraws,
    snapshots: doc.snapshots.map((s) => ({ tick: s.tick, stateHash: s.stateHash })),
  };
}

/** Convenience for callers assembling intents from a host event loop:
 *  stamp each intent's consumption tick with `tickOf(intent)` (order kept). */
export function stampIntents(intents: readonly PlayerIntent[], tickOf: (intent: PlayerIntent) => SimTick): StampedIntent[] {
  return intents.map((intent) => ({ tick: tickOf(intent), intent }));
}


