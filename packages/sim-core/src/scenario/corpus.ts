/** corpus.ts — the waves-tableId traffic seam (§1.5 storms cite content).
 *
 *  A corpus-profile scenario names a shipped `packages/content/waves/`
 *  slice by tableId and picks waves by number; this file resolves that
 *  citation through the EXISTING shipped pipeline — parseForeignWaveSlice
 *  → directorPropose → planWave — the very same law `fastForward.ts`
 *  builds its traffic windows with (mirrored witness-by-witness below).
 *  No new authority is invented here: rates, families and telegraphs come
 *  from the content, so engine-content edits flow into scenarios for free.
 *
 *  Laws:
 *  - REUSE, NO NEW AUTHORITY: every dice (wave stream, director stream,
 *    placement) is rolled exactly as the unattended lane rolls it, for the
 *    same (seed, waveN, cursor) inputs. The invitation gate below adds
 *    zero dice — it only decides whether a cited wave rolls at all.
 *  - PURE / BROWSER-SAFE: this module imports no fs. The host (or a test)
 *    injects the raw slice documents it has loaded — `slices` maps the
 *    file stem ("g1-shared-web-first-quarter") to the parsed JSON value.
 *  - FAIL LOUD: an unresolvable citation (missing slice, malformed slice,
 *    un-shipped wave number, over-cap composition) throws ScenarioError
 *    CORPUS_UNRESOLVED at resolution time — a scenario never quietly runs
 *    on silence. That law extends to the gate: when EVERY cited wave is
 *    excluded as uninvited the resolution throws rather than schedule a
 *    storm season with zero storms.
 *  - CURSOR LAW: named waves occupy consecutive window slots starting at
 *    `waveStartMinute` — citing `[4]` puts wave 4's profile at the head of
 *    the schedule; citing `[1,2,3,4,5]` replays the quarter cascade. Each
 *    SCHEDULED wave advances the cursor by its own windowMinutes. An
 *    EXCLUDED wave (invitation law below) is not scheduled: it rolls no
 *    dice and leaves no hole — the stream packs tight, so the same
 *    citation under a fuller attack surface never shifts later storms.
 *  - INVITATION LAW: a wave is invitation-gated iff any threat-id it
 *    composes has a non-empty inviter pool in the host's `invitations`
 *    map — the same law the content CI authors against, shipped in the
 *    type-bundle's `threats.unlockedByBuildables` (the slice JSON itself
 *    carries no markers; the join is threat-id based). A gated storm is
 *    EXCLUDED whole when at its scheduled start NOTHING in it is
 *    spawnable (ledger as-of: builds exist, removals haunt for the
 *    retirement lag); when at least one entry is spawnable the wave is
 *    INCLUDED and the engine's own per-entry `gateComposition` defers the
 *    uninvited remainder — so a fully-invited gated wave replays the
 *    authored envelope byte-ident, exactly the promise the content lane
 *    can author against. `gateCorpusWave` is that decision, pure and
 *    exported, so hosts and tests can ask it without rolling dice.
 */
import type { RunSeed, SimMinute, WaveEnvelope } from "../types.ts";
import { streamFor } from "../kernel/rng.ts";
import {
  AUTHORING_LAWS,
  buildInvitations,
  directorPropose,
  INITIAL_DIRECTOR_STATE,
  isThreatSpawnable,
  ledgerSnapshot,
  parseForeignWaveSlice,
  planWave,
  waveStream,
} from "../waves/index.ts";
import type { BuildOp, DirectorState, ForeignThreatMeta, ThreatInvitations, WaveTable } from "../waves/index.ts";
import { ScenarioError } from "./doc.ts";
import type { ScenarioCorpusTraffic } from "./doc.ts";

/** Geometry + bundle defaults matching the shipped g1 host precedent
 *  (apps/proto/src/runner/waveRules.ts G1_GEOMETRY / typeBundleId). */
export const DEFAULT_CORPUS_GEOMETRY: CorpusGeometry = Object.freeze({
  windowMinutes: 12,
  rampMin: 3,
  plateauMin: 3,
  decayMin: 2,
});
export const DEFAULT_CORPUS_TYPE_BUNDLE_ID = "official:shared-web";

export interface CorpusGeometry {
  readonly windowMinutes: number;
  readonly rampMin: number;
  readonly plateauMin: number;
  readonly decayMin: number;
}

/** Everything the resolver needs that the wire intentionally does not
 *  carry: the raw content slices and the registry lookup. A test (or a
 *  bundling host) supplies these once and every citation resolves. */
export interface CorpusAuthority {
  /** Slice file stem → raw parsed JSON of packages/content/waves/<stem>.json */
  readonly slices: ReadonlyMap<string, unknown>;
  /** registry-core threats[] lookup (family + denomination). */
  readonly threatMeta: (threatId: string) => ForeignThreatMeta | undefined;
  readonly typeBundleId?: string;
  readonly geometry?: CorpusGeometry;
  /** Attack-surface gate for the plans: threat-id → invited-by pool,
   *  built with `buildInvitations` from the type-bundle's
   *  `threats.unlockedByBuildables` (or any host-authored law). Consulted
   *  by `gateCorpusWave` for the whole-storm exclude AND handed to
   *  `planWave` for the per-entry defer. Default: nothing locked, every
   *  shipped threat spawnable — the same stance fastForward takes, and
   *  byte-ident to a citation resolved before this seam existed. */
  readonly invitations?: ThreatInvitations;
  /** The host's attack-surface history feeding the gate: build/remove
   *  ops evaluated as-of each wave's scheduled start (retirement lag
   *  included). Default: empty log — with an invitations law that means
   *  every gated threat stays uninvited. */
  readonly buildLog?: readonly BuildOp[];
}

/** The gate's answer for one cited wave, decided before any dice: which
 *  threats carry an inviter pool, which of those are invited (spawnable)
 *  as-of the scheduled start, and whether the storm lands at all. */
export interface CorpusWavePlan {
  readonly waveN: number;
  /** Cursor position the wave was gated at (minutes from scenario start). */
  readonly scheduledStartMinute: SimMinute;
  /** Threat-ids under an invitation law (non-empty inviter pool), sorted. */
  readonly gatedThreatIds: readonly string[];
  /** Sorted subset of `gatedThreatIds` spawnable at `scheduledStartMinute`. */
  readonly invitedThreatIds: readonly string[];
  /** True iff the wave schedules: any composed threat is spawnable
   *  (ungated threats always are, so an absent/empty law ⇒ always true). */
  readonly spawns: boolean;
}

/** One scheduled wave: the shipped envelope plus its window on the clock. */
export interface CorpusWaveWindow {
  readonly waveN: number;
  readonly startMinute: SimMinute;
  readonly windowMinutes: number;
  readonly envelope: WaveEnvelope;
  /** The invitation decision that scheduled this wave (additive witness —
   *  reports digest envelopes, never plans, so this never moves a golden). */
  readonly plan: CorpusWavePlan;
}

function unresolved(path: string, message: string): never {
  throw new ScenarioError("CORPUS_UNRESOLVED", path, message);
}

/** Parse a cited slice through the shipped foreign adapter. Pure: called
 *  once per run-resolution (schedules are short; caching would cost more
 *  in content-addressing than it saves in parsing). */
function tableFor(traffic: ScenarioCorpusTraffic, authority: CorpusAuthority): WaveTable {
  const raw = authority.slices.get(traffic.tableId);
  if (raw === undefined) {
    unresolved(
      "traffic.tableId",
      `corpus table "${traffic.tableId}" is not among the injected slices — the host must supply packages/content/waves/${traffic.tableId}.json`,
    );
  }
  let table: WaveTable;
  try {
    table = parseForeignWaveSlice(raw, {
      typeBundleId: authority.typeBundleId ?? DEFAULT_CORPUS_TYPE_BUNDLE_ID,
      geometry: authority.geometry ?? DEFAULT_CORPUS_GEOMETRY,
      threatMeta: authority.threatMeta,
    });
  } catch (cause) {
    unresolved(
      "traffic.tableId",
      `corpus table "${traffic.tableId}" failed the shipped foreign-slice parse: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
  }
  return table;
}

/** Pure invitation decision for one wave — zero dice, zero mutation.
 *  `startMinute` is read as the ledger's as-of tick (the seam's shared
 *  minute↔tick unit precedent: planWave is fed `tick: BigInt(cursor)`). */
export function gateCorpusWave(
  waveN: number,
  threatIds: Iterable<string>,
  startMinute: SimMinute,
  invitations: ThreatInvitations,
  buildLog: readonly BuildOp[],
): CorpusWavePlan {
  const surface = ledgerSnapshot(buildLog, BigInt(startMinute));
  const gatedThreatIds: string[] = [];
  const invitedThreatIds: string[] = [];
  let spawns = false;
  for (const threatId of [...new Set(threatIds)].sort()) {
    const spawnable = isThreatSpawnable(threatId, surface, invitations);
    const pool = invitations.get(threatId);
    if (pool !== undefined && pool.length > 0) {
      gatedThreatIds.push(threatId);
      if (spawnable) invitedThreatIds.push(threatId);
    }
    if (spawnable) spawns = true;
  }
  return Object.freeze({
    waveN,
    scheduledStartMinute: startMinute,
    gatedThreatIds: Object.freeze(gatedThreatIds),
    invitedThreatIds: Object.freeze(invitedThreatIds),
    spawns,
  });
}

/** Resolve a corpus citation into scheduled wave windows for one run
 *  seed. Deterministic by construction: same (traffic, seed, authority)
 *  ⇒ same windows, byte-for-byte (pinned ×100 in the suite). */
export function resolveCorpusWindows(
  traffic: ScenarioCorpusTraffic,
  runSeed: RunSeed,
  authority: CorpusAuthority,
): readonly CorpusWaveWindow[] {
  const table = tableFor(traffic, authority);
  const invitations = authority.invitations ?? buildInvitations({});
  const buildLog = authority.buildLog ?? [];
  const windows: CorpusWaveWindow[] = [];
  let director: DirectorState = INITIAL_DIRECTOR_STATE;
  let cursor: SimMinute = traffic.waveStartMinute;
  for (const waveN of traffic.waves) {
    const wave = table.waves.find((w) => w.n === waveN);
    if (wave === undefined) {
      unresolved(
        "traffic.waves",
        `corpus table "${traffic.tableId}" ships no wave ${waveN} (it ships waves 1–${table.waves[table.waves.length - 1]?.n ?? 0})`,
      );
    }
    // Backstop of the parse door: parseWaveTable already refuses over-cap
    // waves since the D-7 storm cap became engine law (ADR-0013 ruling 6),
    // so this seam check only fires for authority shapes the parser never
    // saw. An over-cap wave must never silently plan a table the content
    // CI would refuse to ship.
    if (wave.entries.length > AUTHORING_LAWS.maxThreatEntriesPerWave) {
      unresolved(
        "traffic.waves",
        `corpus table "${traffic.tableId}" wave ${wave.n} composes ${wave.entries.length} threats — the §2.24 authoring law caps a wave at ${AUTHORING_LAWS.maxThreatEntriesPerWave}`,
      );
    }
    const threatIds = wave.entries.map((entry) => entry.threatId);
    const plan = gateCorpusWave(wave.n, threatIds, cursor, invitations, buildLog);
    if (!plan.spawns) continue; // CURSOR LAW: an excluded storm leaves no hole.
    const rng = waveStream(runSeed, wave.n, cursor);
    const proposed = directorPropose(director, BigInt(cursor), streamFor(runSeed, "director", cursor));
    director = proposed.next;
    const scheduled = planWave(table, wave.n, {
      startMinute: cursor,
      tick: BigInt(cursor),
      rng,
      director,
      // Same as-of reading as the gate; planWave consumes the snapshot only
      // through gateComposition (existing-buildables set), so an empty log
      // is byte-ident to the pre-gate `ledgerSnapshot([], 0n)` this seam
      // shipped with — the single code path is the default-off proof.
      ledger: ledgerSnapshot(buildLog, BigInt(cursor)),
      invitations,
      entropyForecastPurchased: false,
    });
    windows.push(
      Object.freeze({
        waveN: wave.n,
        startMinute: scheduled.startMinute,
        windowMinutes: wave.windowMinutes,
        envelope: scheduled.waveEnvelope,
        plan,
      }),
    );
    cursor += wave.windowMinutes;
  }
  if (windows.length === 0) {
    unresolved(
      "traffic.waves",
      `every cited wave of corpus table "${traffic.tableId}" is uninvited at the attack surface as scheduled — a storm citation whose every storm is gated resolves to nothing only by error, never by silence (waves cited: ${traffic.waves.join(",")})`,
    );
  }
  return Object.freeze(windows);
}
