/**
 * g6Data delegation proof (REST-PROTO-FINAL, c9c0433 hand-off note).
 *
 * g6Data.adaptWaveSlice used to hand-roll the foreign-slice projection and
 * dropped the authored `rules` block + the per-wave feint/secondIncident
 * markers. It now delegates to the canonical `parseForeignWaveSlice`
 * (waves/foreign.ts). Two obligations, both PROVEN here rather than asserted
 * in prose:
 *
 *  1. CARRY-THROUGH — the engine-vocabulary rules and the wave-4 marker now
 *     actually arrive on the parsed table (they never could before).
 *  2. PLAN NEUTRALITY — for the inputs g6Runner feeds, the carried rules and
 *     markers change NOTHING: every rules consumer in waves/generate.ts is
 *     absent-gated on data this gate never supplies (no dominantDefenseFamily
 *     in any planWave input, incident state stays "quiet", the g1 slices
 *     author no feint marker). Pinned by digest equality: full delegated
 *     table vs the legacy stripped table, per profile, per wave. If a future
 *     engine change lets the rules fire on g6's quiet inputs, this test goes
 *     red first — and the falsification control at the end proves the
 *     equality is sensing the rules block, not vacuum.
 */
import { describe, expect, it } from "vitest";
import threatRegistryRaw from "../../../../../../packages/content/threats/registry-core.json?raw";
import webWaveRaw from "../../../../../../packages/content/waves/g1-shared-web-first-quarter.json?raw";
import gameWaveRaw from "../../../../../../packages/content/waves/g1-game-servers-first-quarter.json?raw";
import { asRunSeed } from "@hh/sim-core/types";
import { digestCanonicalValue } from "@hh/sim-core/replay";
import {
  INITIAL_DIRECTOR_STATE,
  buildInvitations,
  ledgerSnapshot,
  parseWaveTable,
  planWave,
  waveStream,
  type WaveTable,
} from "@hh/sim-core/waves";
import { G6_PROFILES, type G6Profile, type G6TypeId } from "../g6Data";
import { WAVE_WINDOW_MINUTES } from "../g6Runner";

const SEED = asRunSeed(42n);

const WAVE_RAW: Readonly<Record<G6TypeId, string>> = Object.freeze({
  "official:shared-web": webWaveRaw,
  "official:game-servers": gameWaveRaw,
});

/* ─────────── frozen replica of the REPLACED hand-rolled copy (g6Data @cf7a696) ─────────── */

interface RegistryThreat {
  readonly id: string;
  readonly family: string;
  readonly band: string;
  readonly denomination: string;
}

function legacyThreatIndex(): ReadonlyMap<string, RegistryThreat> {
  const parsed = JSON.parse(threatRegistryRaw) as { threats: RegistryThreat[] };
  return new Map(parsed.threats.map((t) => [t.id, t]));
}

/** Verbatim copy of the retired adapter — the expected shape for the
 *  strip-equality arm (rules-block-free by construction). */
function legacyAdaptWaveSlice(raw: unknown, typeBundleId: string): WaveTable {
  const slice = raw as {
    id: string;
    waves: ReadonlyArray<{
      n: number;
      parPct: number;
      trough?: boolean;
      entries: ReadonlyArray<{ threat: string; role: string; pressurePct: number; band: string }>;
    }>;
  };
  const index = legacyThreatIndex();
  return parseWaveTable({
    id: slice.id,
    typeBundleId,
    tuningSheet: "B",
    unitsPerPressurePoint: 1,
    waves: slice.waves.map((w) => ({
      n: w.n,
      windowMinutes: WAVE_WINDOW_MINUTES,
      rampMin: 3,
      plateauMin: 3,
      decayMin: 2,
      parPct: w.parPct,
      hard: w.trough !== true,
      entries: w.entries.map((e) => {
        const meta = index.get(e.threat);
        if (meta === undefined) {
          throw new Error(`g6Data: slice threat "${e.threat}" absent from registry-core`);
        }
        const role = e.role.split("/")[0]!.toLowerCase();
        return {
          threatId: e.threat,
          role: role === "healer" ? "healer" : role,
          family: meta.family,
          band: e.band,
          sharePct: e.pressurePct,
          denominations: [meta.denomination],
          targets: ["origin"],
        };
      }),
    })),
  });
}

/* ─────────────────────────────── strip helper ─────────────────────────────── */

/** Drop exactly the fields the legacy copy could not carry: the whole-table
 *  `rules` block and the per-wave feint/secondIncident markers. (JSON round
 *  trip erases undefined-valued keys; the parsed tables are plain
 *  numbers/strings/arrays — no bigint lives on a WaveTable.) */
function stripCarriedFields(table: WaveTable): WaveTable {
  const clone = JSON.parse(
    JSON.stringify({
      ...table,
      rules: undefined,
      waves: table.waves.map((w) => ({ ...w, feint: undefined, secondIncident: undefined })),
    }),
  ) as Record<string, unknown>;
  // parseWaveTable froze deep records; rebuild through the same authority so
  // the stripped table is a legal WaveTable (identical parse path, minus the
  // carried keys) rather than a hand-forced cast.
  return parseWaveTable(clone);
}

/** g6Runner's EXACT planWave input shape (verified against its constructor). */
function planDigestFor(profile: { bundle: G6Profile["bundle"] }, table: WaveTable, waveN: number, index: number): string {
  const windowStart = 2 + index * WAVE_WINDOW_MINUTES;
  const plan = planWave(table, waveN, {
    startMinute: windowStart,
    tick: 0n,
    rng: waveStream(SEED, waveN, windowStart),
    director: INITIAL_DIRECTOR_STATE,
    ledger: ledgerSnapshot([], 0n),
    invitations: buildInvitations(profile.bundle.threats.unlockedByBuildables),
    entropyForecastPurchased: false,
  });
  return digestCanonicalValue(plan);
}

/* ─────────────────────────────── the proofs ─────────────────────────────── */

describe("g6Data · parseForeignWaveSlice delegation", () => {
  it("carry-through: the delegated tables carry what the hand-roll dropped", () => {
    for (const profile of G6_PROFILES) {
      const rules = profile.table.rules;
      expect(rules, profile.typeId).toBeDefined();
      // Engine vocabulary only — the content-CI superset keys stay out:
      const ruleKeys = Object.keys(rules ?? {}).sort();
      expect(ruleKeys).toEqual([
        "copycatReservePct",
        "feints",
        "secondIncidentMultiplierDuringIncident",
        "secondIncidentMultiplierDuringRecovery",
      ]);
      // Wave-4 secondIncident marker arrives on both authored slices:
      const marked = profile.table.waves.filter((w) => w.secondIncident === true);
      expect(marked.length, profile.typeId).toBeGreaterThan(0);
      expect(marked[0]?.n).toBe(4);
    }
  });

  it("strip-equality: legacy copy == delegated table minus the carried fields", () => {
    for (const profile of G6_PROFILES) {
      const legacy = legacyAdaptWaveSlice(JSON.parse(WAVE_RAW[profile.typeId]) as unknown, profile.typeId);
      expect(stripCarriedFields(profile.table), profile.typeId).toEqual(legacy);
    }
  });

  it("plan neutrality: every g6 plan digest is IDENTICAL on full vs stripped tables", () => {
    for (const profile of G6_PROFILES) {
      const stripped = stripCarriedFields(profile.table);
      for (const [i, wave] of profile.table.waves.entries()) {
        expect(
          planDigestFor(profile, profile.table, wave.n, i),
          `${profile.typeId} wave ${wave.n}`,
        ).toBe(planDigestFor(profile, stripped, wave.n, i));
      }
    }
  });

  it("falsification control: the same digest pair SPLITS once a dominant defense family is fed", () => {
    // Neutrality holds ONLY because g6 feeds no `dominantDefenseFamily` (the
    // copycat consumer's second gate). With one supplied, the carried
    // `copycatReservePct` becomes live plan input — full vs stripped tables
    // must then digest differently, or the equality above is meaningless.
    const profile = G6_PROFILES[0];
    if (profile === undefined) throw new Error("no g6 profiles");
    const wave = profile.table.waves[3];
    if (wave === undefined) throw new Error("no wave 4");
    const entry0 = wave.entries[0];
    if (entry0 === undefined) throw new Error("wave 4 has no entries");
    const dominant = entry0.family; // a family the copycat rescale WILL match
    const windowStart = 2 + 3 * WAVE_WINDOW_MINUTES;
    const dig = (table: WaveTable): string =>
      digestCanonicalValue(
        planWave(table, wave.n, {
          startMinute: windowStart,
          tick: 0n,
          rng: waveStream(SEED, wave.n, windowStart),
          director: INITIAL_DIRECTOR_STATE,
          ledger: ledgerSnapshot([], 0n),
          invitations: buildInvitations(profile.bundle.threats.unlockedByBuildables),
          entropyForecastPurchased: false,
          dominantDefenseFamily: dominant,
        }),
      );
    expect(dig(profile.table)).not.toBe(dig(stripCarriedFields(profile.table)));
  });
});
