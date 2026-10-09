/**
 * waves/foreign.ts — the canonical g1-slice → engine WaveTable adapter
 * (REST-RULES-ADAPTER). Proves three things over the REAL shipped corpus
 * (read-only consumer law):
 *
 *  1. CARRY-THROUGH: the authored §2.24 rules block lands on
 *     WaveTable.rules (projected onto the engine's closed vocabulary — the
 *     ten content-CI-only keys are dropped) and the wave-4 prose
 *     secondIncident markers land on the parsed waves. The mail-hosting
 *     slice — authored WITHOUT a rules block — is the falsifiable control:
 *     its table carries the marker but no rules, so every consumer stays
 *     provably inert on it.
 *  2. SHIPPED DATA IS LIVE: feeding the host-side inputs the runners do
 *     not yet supply (WavePlanInput.incidentState / .dominantDefenseFamily)
 *     against the ADAPTED shipped table makes @4856a42's consumers fire
 *     with the MULTIPLIERS AND SHARES FROM THE SHIPPED FILE (1.8 / 2.5 /
 *     copycat reserve), not from any test constant.
 *  3. DEAD-NEUTRAL ABSENCE: with no inputs, plans on the carried table are
 *     byte-identical to plans on the pre-adapter (rules-stripped) table —
 *     the legacy digest goldens across the suite must not move, and this
 *     test would turn red if the carry itself changed behavior.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseForeignWaveSlice, projectForeignRules } from "../foreign.ts";
import type { ForeignThreatMeta } from "../foreign.ts";
import { parseWaveTable } from "../table.ts";
import type { WaveTable } from "../table.ts";
import { planWave, waveStream } from "../generate.ts";
import type { WavePlanInput } from "../generate.ts";
import { INITIAL_DIRECTOR_STATE } from "../director.ts";
import { buildInvitations, ledgerSnapshot } from "../ledger.ts";
import { asRunSeed } from "../../types.ts";
import type { RunSeed } from "../../types.ts";

/* ═══════════════════════ corpus fixtures (read-only) ═══════════════════════ */

const CONTENT_ROOT = join(process.cwd(), "..", "..", "packages", "content");

function readCorpusJson(relPath: string): Record<string, unknown> {
  const abs = join(CONTENT_ROOT, relPath);
  if (!existsSync(abs)) {
    throw new Error(`waves/foreign test: content corpus missing at ${abs} — run from packages/sim-core`);
  }
  return JSON.parse(readFileSync(abs, "utf8")) as Record<string, unknown>;
}

interface CorpusThreat {
  readonly id: string;
  readonly family: string;
  readonly band: string;
  readonly denomination: string;
}

const THREAT_INDEX = new Map<string, CorpusThreat>(
  (readCorpusJson("threats/registry-core.json")["threats"] as CorpusThreat[]).map((t) => [t.id, t]),
);

function threatMeta(threatId: string): ForeignThreatMeta | undefined {
  const meta = THREAT_INDEX.get(threatId);
  if (meta === undefined) return undefined;
  return { family: meta.family as ForeignThreatMeta["family"], denomination: meta.denomination as ForeignThreatMeta["denomination"] };
}

const GEOMETRY = Object.freeze({ windowMinutes: 12, rampMin: 3, plateauMin: 3, decayMin: 2 });

function adapt(sliceFile: string, typeBundleId: string): WaveTable {
  return parseForeignWaveSlice(readCorpusJson(`waves/${sliceFile}`), {
    typeBundleId,
    geometry: GEOMETRY,
    threatMeta,
  });
}

const SHARED_WEB = adapt("g1-shared-web-first-quarter.json", "official:shared-web");
const GAME_SERVERS = adapt("g1-game-servers-first-quarter.json", "official:game-servers");
const MAIL = adapt("g1-mail-hosting-first-quarter.json", "official:mail-hosting");

/* The shipped engine-facing rules block, verbatim from both g1 files. */
const SHIPPED_RULES = Object.freeze({
  feints: { maxPerLevel: 1, neverTwoLevelsInRow: true, namedInPostmortem: true },
  secondIncidentMultiplierDuringIncident: 1.8,
  secondIncidentMultiplierDuringRecovery: 2.5,
  copycatReservePct: Object.freeze([10, 15] as const),
});

/* ═══════════════════════ plan harness ═══════════════════════ */

const EMPTY_LEDGER = ledgerSnapshot([], 0n);
// The REAL shared-web invitation graph (read-only from the type bundle), so
// gateComposition defers built-gated wave-4 entries exactly as the shipped
// game would: an empty invitation map would mark every threat organic.
const SHARED_WEB_INVITATIONS = buildInvitations(
  (readCorpusJson("types/shared-web.json")["threats"] as { unlockedByBuildables: Record<string, readonly string[]> })
    .unlockedByBuildables,
);

function input(seed: RunSeed | bigint, extra: Partial<WavePlanInput> = {}): WavePlanInput {
  return {
    startMinute: 60,
    tick: 60n,
    rng: waveStream(typeof seed === "bigint" ? asRunSeed(seed) : seed, 4, 60),
    director: INITIAL_DIRECTOR_STATE,
    ledger: EMPTY_LEDGER,
    invitations: SHARED_WEB_INVITATIONS,
    entropyForecastPurchased: false,
    ...extra,
  };
}

/** Canonical, bigint-free serialization of the observable plan surface. */
function planKey(plan: ReturnType<typeof planWave>): string {
  const arrivals = plan.arrivals.map((a) => `${a.minute}|${a.atUs}|${a.threatId}|${a.targetId}|${a.unitOrdinal}`);
  const units = Object.keys(plan.unitsByThreat)
    .sort()
    .map((t) => `${t}=${String(plan.unitsByThreat[t])}`);
  return JSON.stringify({
    arrivals,
    units,
    deferred: plan.deferredThreatIds,
    envelope: `${plan.waveEnvelope.tableId}|${plan.waveEnvelope.role}|${plan.waveEnvelope.shape}|${String(plan.waveEnvelope.ratePerMin)}|${String(plan.waveEnvelope.telegraphed)}|${plan.waveEnvelope.dominantFamily}`,
    events: plan.events.map((e) => `${e.atUs}|${String(e.causeId)}|${e.kind === "arrival" ? String(e.unitId) : e.kind}`),
  });
}

/* ═══════════════ 1 · carry-through goldens on shipped data ═══════════════ */

describe("parseForeignWaveSlice — §2.24 rules block reaches the engine", () => {
  for (const [label, table] of [
    ["g1-shared-web", SHARED_WEB],
    ["g1-game-servers", GAME_SERVERS],
  ] as const) {
    it(`${label}: rules carried, projected to exactly the engine vocabulary`, () => {
      expect(table.rules).toEqual(SHIPPED_RULES);
      // The authored block ships 14 keys; the 10 content-CI-only keys
      // (cite, activeFamilyPoolCap, quotas…) must NOT ride through —
      // parseRules would reject them and the engine must never see them.
      expect(Object.keys(table.rules ?? {}).sort()).toEqual([
        "copycatReservePct",
        "feints",
        "secondIncidentMultiplierDuringIncident",
        "secondIncidentMultiplierDuringRecovery",
      ]);
    });

    it(`${label}: wave-4 prose secondIncident marker parses to presence`, () => {
      const wave4 = table.waves.find((w) => w.n === 4);
      expect(wave4?.secondIncident).toBe(true);
      // The marker is authored on wave 4 ONLY, and no shipped wave authors a feint.
      for (const w of table.waves) {
        if (w.n === 4) continue;
        expect(w.secondIncident).toBeUndefined();
      }
      for (const w of table.waves) expect(w.feint).toBeUndefined();
    });
  }

  it("existence data lands verbatim (threatIds, shares, registry families)", () => {
    const slice = readCorpusJson("waves/g1-shared-web-first-quarter.json");
    for (const rawWave of slice["waves"] as { n: number; entries: { threat: string; pressurePct: number; role: string }[] }[]) {
      const tableWave = SHARED_WEB.waves.find((w) => w.n === rawWave.n);
      expect(tableWave).toBeDefined();
      const byId = new Map(tableWave!.entries.map((e) => [e.threatId, e]));
      for (const e of rawWave.entries) {
        const landed = byId.get(e.threat);
        expect(landed?.sharePct).toBe(e.pressurePct);
        expect(landed?.family).toBe(THREAT_INDEX.get(e.threat)?.family);
        expect(landed?.role).toBe(e.role.split("/")[0]!.toLowerCase());
      }
    }
  });

  it("mail-hosting control: marker carried, rules ABSENT (undefined, not {})", () => {
    expect(MAIL.rules).toBeUndefined();
    expect(MAIL.waves.find((w) => w.n === 4)?.secondIncident).toBe(true);
  });

  it("adapter stays geometry/data faithful for the whole table", () => {
    expect(SHARED_WEB.id).toBe("waves/g1-shared-web-first-quarter");
    expect(SHARED_WEB.typeBundleId).toBe("official:shared-web");
    expect(SHARED_WEB.tuningSheet).toBe("B");
    expect(SHARED_WEB.unitsPerPressurePoint).toBe(1);
    expect(SHARED_WEB.waves[0]?.windowMinutes).toBe(12);
    expect(SHARED_WEB.waves[0]?.rampMin).toBe(3);
    expect(SHARED_WEB.waves[0]?.plateauMin).toBe(3);
    expect(SHARED_WEB.waves[0]?.decayMin).toBe(2);
    // hard = NOT trough, straight from the slice:
    const slice = readCorpusJson("waves/g1-shared-web-first-quarter.json");
    for (const rawWave of slice["waves"] as { n: number; trough?: boolean }[]) {
      expect(SHARED_WEB.waves.find((w) => w.n === rawWave.n)?.hard).toBe(rawWave.trough !== true);
    }
  });
});

/* ═══════════════ 2 · projection law (projectForeignRules) ═══════════════ */

describe("projectForeignRules", () => {
  it("absent or null → undefined (single dead-neutral representation)", () => {
    expect(projectForeignRules(undefined, "x")).toBeUndefined();
    expect(projectForeignRules(null, "x")).toBeUndefined();
  });
  it("content-CI-only keys alone project to undefined", () => {
    expect(projectForeignRules({ maxThreatEntriesPerWave: 4, cite: "§2.24" }, "x")).toBeUndefined();
  });
  it("non-object rules fail loud", () => {
    expect(() => projectForeignRules([1, 2], "foreign slice")).toThrow(/foreign slice: rules must be an object/);
  });
  it("engine keys survive, extras are dropped — deep validation deferred to parseRules", () => {
    expect(projectForeignRules({ copycatReservePct: [10, 15], firstWaveMaxParPct: 40 }, "x")).toEqual({
      copycatReservePct: [10, 15],
    });
  });
});

/* ═══════════════ 3 · fail-loud adapter probes ═══════════════ */

describe("parseForeignWaveSlice fail-loud guards", () => {
  const opts = { typeBundleId: "t", geometry: GEOMETRY, threatMeta };
  it("unknown threat (no registry metadata) throws naming it", () => {
    expect(() =>
      parseForeignWaveSlice(
        { id: "probe", waves: [{ n: 1, parPct: 50, entries: [{ threat: "ghost-threat-9000", role: "swarm", pressurePct: 100, band: "storm" }] }] },
        opts,
      ),
    ).toThrow(/threat "ghost-threat-9000" has no registry metadata/);
  });
  it("empty slice waves throw", () => {
    expect(() => parseForeignWaveSlice({ id: "probe", waves: [] }, opts)).toThrow(/waves must be a non-empty array/);
  });
});

/* ═══════════ 4 · shipped data is LIVE — consumers fire on shipped values ═══════════ */

describe("second incident fires on shipped g1-shared-web wave 4 with SHIPPED multipliers", () => {
  // Wave 4 = ticket-avalanche-hydra (human, 55%) + vulnerable-plugin-compromise
  // (malicious, 45%). With no invitations built, gateComposition defers the
  // plugin threat, so every quiet arrival is hydra — the follow-on copy
  // count is exactly round(C × 0.8) from the shipped 1.8.
  const quiet = planWave(SHARED_WEB, 4, input(101n));
  const active = planWave(SHARED_WEB, 4, input(101n, { incidentState: "active" }));
  const recovering = planWave(SHARED_WEB, 4, input(101n, { incidentState: "recovering" }));

  it("quiet arm has positive authored traffic (guard: the test can actually fail)", () => {
    expect(quiet.arrivals.length).toBeGreaterThan(0);
    // built-gated entry deferred on the empty ledger; hydra (ungated) carries all traffic
    expect(quiet.deferredThreatIds).toContain("vulnerable-plugin-compromise");
    expect(quiet.arrivals.every((a) => a.threatId === "ticket-avalanche-hydra")).toBe(true);
  });

  it("active: follow-on = round(C × (1.8−1)) extra arrivals, ordinals continue", () => {
    const c = quiet.arrivals.length;
    expect(active.arrivals.length).toBe(c + Math.round(c * 0.8));
    const seen = new Set<string>();
    for (const a of active.arrivals) {
      const id = `${a.threatId}#${String(a.unitOrdinal)}`;
      expect(seen.has(id)).toBe(false); // unitId ordinals stay unique
      seen.add(id);
    }
    // The generator mirrors originals in INSERTION (ordinal) order, not the
    // re-sorted arrival order: extras[j] clones originals[j % C].
    const originals = [...quiet.arrivals].sort((p, q) => p.unitOrdinal - q.unitOrdinal);
    for (const a of active.arrivals.filter((arr) => arr.unitOrdinal > c)) {
      const src = originals[(a.unitOrdinal - c - 1) % c]!;
      expect(a.minute).toBe(src.minute + 8); // start + envelopeMinutes(3+3+2)
      expect(a.targetId).toBe(src.targetId);
    }
  });

  it("recovering: shipped 2.5 multiplier → strictly bigger follow-on than active", () => {
    const c = quiet.arrivals.length;
    expect(recovering.arrivals.length).toBe(c + Math.round(c * 1.5));
    expect(recovering.arrivals.length).toBeGreaterThan(active.arrivals.length);
  });

  it("unitsByThreat (existence record) is UNMOVED — timing/traffic only", () => {
    expect(active.unitsByThreat).toEqual(quiet.unitsByThreat);
    expect(recovering.unitsByThreat).toEqual(quiet.unitsByThreat);
  });
});

describe("copycat reserve fires with the SHIPPED [10,15] band on shared-web wave 4", () => {
  // dominantDefenseFamily = "human" matches ticket-avalanche-hydra (the only
  // ungated entry): pool = 1e6 − 0 → the matched entry takes the WHOLE wave
  // budget, so its count grows over the authored 55% share.
  const plain = planWave(SHARED_WEB, 4, input(101n));
  const copycat = planWave(SHARED_WEB, 4, input(101n, { dominantDefenseFamily: "human" }));
  const unmatched = planWave(SHARED_WEB, 4, input(101n, { dominantDefenseFamily: "systemic" }));

  it("matched family absorbs the reserve: hydra count grows, plan differs", () => {
    expect(copycat.unitsByThreat["ticket-avalanche-hydra"]).toBeGreaterThan(
      plain.unitsByThreat["ticket-avalanche-hydra"] ?? 0,
    );
    expect(planKey(copycat)).not.toBe(planKey(plain));
  });

  it("family with no wave-4 entry stays byte-identical (authored shares)", () => {
    expect(planKey(unmatched)).toBe(planKey(plain));
  });
});

/* ═══════════ 5 · dead-neutral absence + ×100 determinism ═══════════ */

describe("presence-gating across the shipped corpus", () => {
  it("rules-free mail slice: incidentState input changes NOTHING (marker without rules is inert)", () => {
    expect(planKey(planWave(MAIL, 4, input(303n)))).toBe(planKey(planWave(MAIL, 4, input(303n, { incidentState: "active" }))));
  });

  it("carried tables with NO rule inputs plan byte-identical to the pre-adapter (rules-stripped) table", () => {
    // The exact table the old hand-rolled adapters produced (no rules, no
    // markers) — reconstructed through the same boundary parser.
    const stripToLegacy = (table: WaveTable): WaveTable =>
      parseWaveTable({
        id: table.id,
        typeBundleId: table.typeBundleId,
        tuningSheet: table.tuningSheet,
        unitsPerPressurePoint: table.unitsPerPressurePoint,
        waves: table.waves.map((w) => {
          const { feint: _f, secondIncident: _s, ...rest } = w;
          return rest;
        }),
      });
    const legacyWeb = stripToLegacy(SHARED_WEB);
    const legacyGame = stripToLegacy(GAME_SERVERS);
    expect(legacyWeb.rules).toBeUndefined();
    expect(legacyWeb.waves.find((w) => w.n === 4)?.secondIncident).toBeUndefined();
    // sanity: the CARRIED tables really do differ from legacy where it counts
    expect(SHARED_WEB.rules).toEqual(SHIPPED_RULES);
    for (const seed of [101n, 102n, 103n]) {
      expect(planKey(planWave(SHARED_WEB, 4, input(seed)))).toBe(planKey(planWave(legacyWeb, 4, input(seed))));
      expect(planKey(planWave(GAME_SERVERS, 4, input(seed)))).toBe(planKey(planWave(legacyGame, 4, input(seed))));
    }
  });

  it("×100 seed arms agree: independent fresh runs of each shipped-data consumer are identical", () => {
    for (let s = 1; s <= 100; s += 1) {
      const seed = asRunSeed(BigInt(s) * 7n + 100n);
      for (const extra of [
        {},
        { incidentState: "active" as const },
        { incidentState: "recovering" as const },
        { dominantDefenseFamily: "human" as const },
        { incidentState: "active" as const, dominantDefenseFamily: "human" as const },
      ]) {
        expect(planKey(planWave(SHARED_WEB, 4, input(seed, { ...extra })))).toBe(
          planKey(planWave(SHARED_WEB, 4, input(seed, { ...extra }))),
        );
      }
    }
  });

  it("second incident moves EVERY seed in the cohort (fires on data, not on dice)", () => {
    for (let s = 1; s <= 100; s += 1) {
      const seed = asRunSeed(BigInt(s) * 7n + 100n);
      const quiet = planWave(SHARED_WEB, 4, input(seed));
      const active = planWave(SHARED_WEB, 4, input(seed, { incidentState: "active" }));
      expect(active.arrivals.length).toBe(quiet.arrivals.length + Math.round(quiet.arrivals.length * 0.8));
    }
  });
});
