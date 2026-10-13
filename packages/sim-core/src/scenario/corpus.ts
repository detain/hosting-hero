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
 *    same (seed, waveN, cursor) inputs.
 *  - PURE / BROWSER-SAFE: this module imports no fs. The host (or a test)
 *    injects the raw slice documents it has loaded — `slices` maps the
 *    file stem ("g1-shared-web-first-quarter") to the parsed JSON value.
 *  - FAIL LOUD: an unresolvable citation (missing slice, malformed slice,
 *    un-shipped wave number) throws ScenarioError CORPUS_UNRESOLVED at
 *    resolution time — a scenario never quietly runs on silence.
 *  - CURSOR LAW: named waves occupy consecutive window slots starting at
 *    `waveStartMinute` — citing `[4]` puts wave 4's profile at the head of
 *    the schedule; citing `[1,2,3,4,5]` replays the quarter cascade. Each
 *    scheduled wave advances the cursor by its own windowMinutes.
 */
import type { RunSeed, SimMinute, WaveEnvelope } from "../types.ts";
import { streamFor } from "../kernel/rng.ts";
import {
  buildInvitations,
  directorPropose,
  INITIAL_DIRECTOR_STATE,
  ledgerSnapshot,
  parseForeignWaveSlice,
  planWave,
  waveStream,
} from "../waves/index.ts";
import type { DirectorState, ForeignThreatMeta, ThreatInvitations, WaveTable } from "../waves/index.ts";
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
  /** Attack-surface gate for the plans. Default: nothing locked, every
   *  shipped threat spawnable — the same stance fastForward takes. */
  readonly invitations?: ThreatInvitations;
}

/** One scheduled wave: the shipped envelope plus its window on the clock. */
export interface CorpusWaveWindow {
  readonly waveN: number;
  readonly startMinute: SimMinute;
  readonly windowMinutes: number;
  readonly envelope: WaveEnvelope;
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
    const rng = waveStream(runSeed, wave.n, cursor);
    const proposed = directorPropose(director, BigInt(cursor), streamFor(runSeed, "director", cursor));
    director = proposed.next;
    const plan = planWave(table, wave.n, {
      startMinute: cursor,
      tick: BigInt(cursor),
      rng,
      director,
      ledger: ledgerSnapshot([], 0n),
      invitations,
      entropyForecastPurchased: false,
    });
    windows.push(
      Object.freeze({
        waveN: wave.n,
        startMinute: plan.startMinute,
        windowMinutes: wave.windowMinutes,
        envelope: plan.waveEnvelope,
      }),
    );
    cursor += wave.windowMinutes;
  }
  return Object.freeze(windows);
}
