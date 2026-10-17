/**
 * D-7 bounded storm-severity cap (ADR-0013 ruling 6) — both enforcement
 * doors, the arithmetic home, and the shipped-corpus census.
 *
 * The ruling blessed the SHAPE (engine-enforced rate ceiling + stacked
 * envelope cap) and explicitly declined to bless "128/min + 8-stacked";
 * STORM_CAP (1024/4) derives from the ratified-adjacent inventory — see the
 * bands.ts docblock. These pins keep both doors falsifiable:
 *
 *  1. PARSE door (table.ts): entries > 4 refuse; authored worst-minute mint
 *     > 1024 refuses, naming the wave; exactly-at-ceiling parses.
 *  2. PLAN door (generate.ts): emergent excess (custom pressureParams, the
 *     ×1.25 director entropy band, second-incident stacking) is clamped
 *     deterministically — pure function of inputs, zero RNG — with the
 *     presence-only `stormClamped` stamp.
 *  3. Census: every shipped g1 slice parses clean, sits far under the cap,
 *     and the clamp never fires for shipped content — the zero-golden
 *     promise, structurally pinned.
 */
import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { asRunSeed, type Fixed, type ThreatFamily } from "../../types.ts";
import { STORM_CAP, TELEGRAPH_BANDS } from "../bands.ts";
import { DEFAULT_DIRECTOR_CONFIG, INITIAL_DIRECTOR_STATE } from "../director.ts";
import type { DirectorState } from "../director.ts";
import { parseForeignWaveSlice } from "../foreign.ts";
import { planWave, waveStream } from "../generate.ts";
import type { WavePlan, WavePlanInput } from "../generate.ts";
import { buildInvitations, ledgerSnapshot } from "../ledger.ts";
import { TUNING_SHEETS } from "../pressure.ts";
import {
  authoredWaveStormBudget,
  scaleStormCounts,
  stormPlanBudgetUnits,
  stormStackFactorMicro,
} from "../storm.ts";
import { parseWaveTable } from "../table.ts";
import type { WaveTable } from "../table.ts";

const SEED = asRunSeed(7n);
const THREAT = "t-storm";
const FAMILY: ThreatFamily = "malicious";
const EMPTY_LEDGER = ledgerSnapshot([], 0n);
const OPEN_INVITATIONS = buildInvitations({});

interface WaveOpts {
  readonly parPct: number;
  readonly upp: number;
  readonly n?: number;
  readonly entries?: number;
  readonly band?: "weather" | "storm" | "hunter" | "entropy";
  readonly siRaw?: unknown;
}

/** Raw single-sheet wave table with an exact-unit mint: every entry carries
 *  an even share, so body units = parPct × upp (sheet B wave 1, S=1.0). */
function stormRaw(
  id: string,
  waves: readonly WaveOpts[],
  tuningSheet: "A" | "B" | "C" = "B",
  rules?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    id,
    typeBundleId: "official:shared-web",
    tuningSheet,
    unitsPerPressurePoint: waves[0]!.upp,
    ...(rules === undefined ? {} : { rules }),
    waves: waves.map((w, i) => {
      const count = w.entries ?? 1;
      const share = Math.floor(100 / count);
      return {
        n: w.n ?? i + 1,
        windowMinutes: 120,
        rampMin: 10,
        plateauMin: 20,
        decayMin: 10,
        parPct: w.parPct,
        hard: false,
        ...(w.siRaw === undefined ? {} : { secondIncident: w.siRaw }),
        entries: Array.from({ length: count }, (_unused, e) => ({
          threatId: e === 0 ? THREAT : `t-${String(e)}`,
          role: "swarm",
          family: FAMILY,
          band: w.band ?? "storm",
          sharePct: e === 0 ? 100 - share * (count - 1) : share,
          denominations: ["bandwidth"],
          targets: ["node-a", "node-b"],
        })),
      };
    }),
  };
}

/** Director at the emergent worst: full entropy uplift band (×1.25). */
const worstBandDirector = (): DirectorState => ({
  ...INITIAL_DIRECTOR_STATE,
  entropyBudgetFactor: DEFAULT_DIRECTOR_CONFIG.maxFactor as Fixed,
});

const baseInput = (rng: WavePlanInput["rng"], over: Partial<WavePlanInput> = {}): WavePlanInput => ({
  startMinute: 0,
  tick: 1n,
  rng,
  director: INITIAL_DIRECTOR_STATE,
  ledger: EMPTY_LEDGER,
  invitations: OPEN_INVITATIONS,
  entropyForecastPurchased: false,
  ...over,
});

const perMinuteLoad = (plan: WavePlan): Map<number, number> => {
  const byMinute = new Map<number, number>();
  for (const a of plan.arrivals) byMinute.set(a.minute, (byMinute.get(a.minute) ?? 0) + 1);
  return byMinute;
};

const serialize = (plan: WavePlan): string =>
  JSON.stringify(plan, (_k, v: unknown) => (typeof v === "bigint" ? `${String(v)}n` : v));

/* ───────────────────── parse door · rate ceiling ───────────────────── */

describe("D-7 parse door — rate ceiling (ADR-0013 ruling 6)", () => {
  it("pins the ratified constants: 1024 units/min, 4 stacked envelopes", () => {
    expect(STORM_CAP.rateUnitsPerMinute).toBe(1024);
    expect(STORM_CAP.maxStackedEnvelopes).toBe(4);
    // The band ladder IS the stack vocabulary (ADR wording): rungs = slots.
    expect(STORM_CAP.maxStackedEnvelopes).toBe(TELEGRAPH_BANDS.length);
  });

  it("accepts a wave minting EXACTLY the ceiling (1024)", () => {
    const table = parseWaveTable(stormRaw("storm-exact", [{ parPct: 32, upp: 32 }]));
    const budget = authoredWaveStormBudget(table.waves[0]!, TUNING_SHEETS.B.params, 32, undefined);
    expect(budget.bodyUnits).toBe(1024);
    expect(budget.worstMinuteUnits).toBe(1024);
  });

  it("refuses ONE unit over the ceiling (1025), naming the wave and value", () => {
    // 41 × 25 = 1025: single-entry table, so the body IS the wave mint.
    expect(() => parseWaveTable(stormRaw("storm-over", [{ parPct: 25, upp: 41 }]))).toThrow(
      /storm-over wave 1: storm budget 1025 units\/minute exceeds the D-7 ceiling 1024/,
    );
  });

  it("measures against the TABLE'S OWN tuning sheet", () => {
    // wave 3 (index 2 = a crest: B S=1.3, C S=1.5): par 31 × upp 20 →
    // sheet B mints 1002 (legal), sheet C mints 1156 (refused).
    const opts: WaveOpts[] = [
      { parPct: 1, upp: 20 },
      { parPct: 1, upp: 20 },
      { parPct: 31, upp: 20 },
    ];
    expect(() => parseWaveTable(stormRaw("storm-sheet-b", opts, "B"))).not.toThrow();
    expect(() => parseWaveTable(stormRaw("storm-sheet-c", opts, "C"))).toThrow(
      /storm-sheet-c wave 3: storm budget 1156 units\/minute exceeds the D-7 ceiling 1024/,
    );
  });
});

/* ─────────────────── parse door · stacked envelopes ─────────────────── */

describe("D-7 parse door — stacked envelope cap", () => {
  it("accepts 4 composition lines (lawful stacking)", () => {
    expect(() => parseWaveTable(stormRaw("storm-4", [{ parPct: 32, upp: 32, entries: 4 }]))).not.toThrow();
  });

  it("refuses 5 composition lines, naming the wave (§2.24 promoted to engine law)", () => {
    expect(() => parseWaveTable(stormRaw("storm-5", [{ parPct: 1, upp: 1, entries: 5 }]))).toThrow(
      /storm-5 wave 1: stacks 5 composition lines — the D-7 storm cap allows at most 4/,
    );
  });
});

/* ─────────────── parse door · second-incident stacking ─────────────── */

describe("D-7 parse door — follow-on copy stacks into the ceiling", () => {
  const siRules = { secondIncidentMultiplierDuringRecovery: 2.5 };

  it("accepts body 682 whose 2.5× copy lands one unit under (1023)", () => {
    const table = parseWaveTable(stormRaw("si-under", [{ parPct: 22, upp: 31, siRaw: true }], "B", siRules));
    const budget = authoredWaveStormBudget(table.waves[0]!, TUNING_SHEETS.B.params, 31, table.rules);
    expect(budget.bodyUnits).toBe(682);
    expect(budget.followOnUnits).toBe(1023);
    expect(budget.worstMinuteUnits).toBe(1023); // copy rides AFTER-envelope minutes, never summed
  });

  it("refuses body 690 whose 2.5× copy reaches 1035 — though the body alone was legal", () => {
    const raw = stormRaw("si-over", [{ parPct: 23, upp: 30, siRaw: true }], "B", siRules);
    expect(() => parseWaveTable(raw)).toThrow(
      /si-over wave 1: storm budget 1035 units\/minute exceeds the D-7 ceiling 1024 \(body 690, follow-on 1035\)/,
    );
    // Falsifier: WITHOUT the follow-on term the same table sails under —
    // the stacked copy is the load-bearing breach, not the body.
    const table = parseWaveTable(stormRaw("si-over", [{ parPct: 23, upp: 30 }], "B", siRules));
    const unflagged = authoredWaveStormBudget(table.waves[0]!, TUNING_SHEETS.B.params, 30, table.rules);
    expect(unflagged.bodyUnits).toBe(690);
    expect(unflagged.worstMinuteUnits).toBe(690);
  });
});

/* ───────────────────── plan door · deterministic clamp ───────────────────── */

describe("D-7 plan door — deterministic director clamp", () => {
  it("clamps an emergent oversize body to the ceiling (identity below)", () => {
    // Parse measures sheet B (682 ≤ cap); the host runs a ×2 pressure sheet,
    // the body would mint 1364 — the plan door shrinks it to 1024.
    const table = parseWaveTable(stormRaw("clamp-body", [{ parPct: 22, upp: 31 }]));
    const inflated = { ...TUNING_SHEETS.B.params, baseMicro: 2n * TUNING_SHEETS.B.params.baseMicro };
    const plan = planWave(table, 1, baseInput(waveStream(SEED, 1, 0), { pressureParams: inflated }));
    expect(plan.stormClamped).toBe(true);
    expect(plan.arrivals).toHaveLength(1024);
    expect(Object.values(plan.unitsByThreat).reduce((a, b) => a + b, 0)).toBe(1024);
  });

  it("holds BOTH minutes under the ceiling when the copy stacks (budget ÷ 1.5)", () => {
    const table = parseWaveTable(stormRaw("clamp-si", [{ parPct: 22, upp: 31, siRaw: true }], "B", {
      secondIncidentMultiplierDuringRecovery: 2.5,
    }));
    const inflated = { ...TUNING_SHEETS.B.params, baseMicro: 2n * TUNING_SHEETS.B.params.baseMicro };
    const plan = planWave(table, 1, baseInput(waveStream(SEED, 1, 0), {
      pressureParams: inflated,
      incidentState: "recovering",
    }));
    expect(plan.stormClamped).toBe(true);
    expect(plan.unitsByThreat[THREAT]).toBe(682); // 1364 → floor at 1024/1.5
    for (const [, count] of perMinuteLoad(plan)) expect(count).toBeLessThanOrEqual(1024);
    const copies = plan.arrivals.filter((a) => a.unitOrdinal > 682);
    expect(copies).toHaveLength(1023); // 682 × 1.5 follow-on, one under the ceiling
  });

  it("stamps NOTHING and mints nothing differently below the ceiling (presence-only)", () => {
    const table = parseWaveTable(stormRaw("clamp-idle", [{ parPct: 10, upp: 1 }]));
    const plain = planWave(table, 1, baseInput(waveStream(SEED, 1, 0)));
    expect("stormClamped" in plain).toBe(false);
    // The override input alone (same ceiling) changes nothing — byte-ident.
    const explicit = planWave(table, 1, baseInput(waveStream(SEED, 1, 0), { stormCeilingUnitsPerMinute: 1024 }));
    expect(explicit).toEqual(plain);
  });

  it("clamp determinism ×100: fresh streams + full director band replay identically", () => {
    // 4 entropy lines at the ×1.25 ceiling: authored 1024 parses exactly,
    // each line emergent 320 → 1280 total → floor-scaled back to 256/line.
    const table = parseWaveTable(stormRaw("clamp-det", [{ parPct: 32, upp: 32, entries: 4, band: "entropy" }]));
    const digests = new Set<string>();
    for (let run = 0; run < 100; run += 1) {
      const plan = planWave(table, 1, baseInput(waveStream(SEED, 1, 0), { director: worstBandDirector() }));
      expect(plan.stormClamped).toBe(true);
      expect(plan.arrivals).toHaveLength(1024);
      expect(Object.values(plan.unitsByThreat).sort((a, b) => a - b)).toEqual([256, 256, 256, 256]);
      digests.add(serialize(plan));
    }
    expect(digests.size).toBe(1);
  });

  it("refuses a malformed ceiling override (fail-loud at the boundary)", () => {
    const table = parseWaveTable(stormRaw("clamp-bad", [{ parPct: 1, upp: 1 }]));
    expect(() =>
      planWave(table, 1, baseInput(waveStream(SEED, 1, 0), { stormCeilingUnitsPerMinute: 0 })),
    ).toThrow(/stormCeilingUnitsPerMinute must be an integer ≥ 1/);
    expect(() =>
      planWave(table, 1, baseInput(waveStream(SEED, 1, 0), { stormCeilingUnitsPerMinute: 2.5 })),
    ).toThrow(/stormCeilingUnitsPerMinute must be an integer ≥ 1/);
  });
});

/* ─────────────────────────── storm.ts math ─────────────────────────── */

describe("storm.ts — clamp arithmetic is deterministic and conservative", () => {
  it("budget division floors the headroom only when the copy EXCEEDS the body", () => {
    // stack factor = max(1.0, multiplier − 1): a 2.5× follow-on mints 1.5×
    // the body as copy — the copied minute is the heavier one, so the body
    // budgets at ceiling/1.5. A 1.5× multiplier copies 0.5× — the BODY is
    // the heavier minute, no headroom needed.
    expect(stormPlanBudgetUnits(1000, undefined)).toBe(1000);
    expect(stormPlanBudgetUnits(1000, 2.5)).toBe(666);
    expect(stormPlanBudgetUnits(1000, 1.5)).toBe(1000);
    expect(stormPlanBudgetUnits(1000, 1.2)).toBe(1000);
  });

  it("stack factor is the follow-on multiple, floored at 1.0", () => {
    expect(stormStackFactorMicro(undefined)).toBe(1_000_000n);
    expect(stormStackFactorMicro(2.5)).toBe(1_500_000n);
    expect(stormStackFactorMicro(1.5)).toBe(1_000_000n);
    expect(stormStackFactorMicro(1.2)).toBe(1_000_000n);
  });

  it("proportional floor scaling under-mints, never redistributes", () => {
    const scaled = scaleStormCounts([{ threatId: "a", count: 100 }, { threatId: "b", count: 100 }], 150);
    expect(scaled.clamped).toBe(true);
    expect(scaled.counts.map((c) => c.count)).toEqual([75, 75]);
    const idle = scaleStormCounts([{ threatId: "a", count: 1 }, { threatId: "b", count: 2 }], 5);
    expect(idle.clamped).toBe(false);
    expect(idle.counts).toEqual([{ threatId: "a", count: 1 }, { threatId: "b", count: 2 }]);
    expect(() => scaleStormCounts([{ count: 1 }], -2)).toThrow(/bad budgetUnits/);
  });
});

/* ───────────────────────── shipped corpus census ───────────────────────── */

const CONTENT_ROOT = `${process.cwd()}/../../packages/content`;
const GEOMETRY = Object.freeze({ windowMinutes: 12, rampMin: 3, plateauMin: 3, decayMin: 2 });

interface CorpusThreat {
  readonly id: string;
  readonly family: string;
  readonly denomination: string;
}

const THREAT_INDEX = new Map<string, { family: ThreatFamily; denomination: string }>(
  (JSON.parse(readFileSync(`${CONTENT_ROOT}/threats/registry-core.json`, "utf8")).threats as CorpusThreat[]).map(
    (t) => [t.id, { family: t.family as ThreatFamily, denomination: t.denomination }],
  ),
);

function censusTable(file: string): WaveTable {
  const slice = JSON.parse(readFileSync(`${CONTENT_ROOT}/waves/${file}`, "utf8")) as Record<string, unknown>;
  return parseForeignWaveSlice(slice, {
    typeBundleId: `official:${String(slice["id"]) ?? file}`,
    geometry: GEOMETRY,
    threatMeta: (threatId) => {
      const m = THREAT_INDEX.get(threatId);
      return m === undefined ? undefined : { family: m.family, denomination: m.denomination as never };
    },
  });
}

describe("shipped g1 corpus — under the D-7 ceiling, clamp inert", () => {
  const root = `${CONTENT_ROOT}/waves`;
  const files = readdirSync(root).filter((f) => f.endsWith(".json")).sort();
  expect(files.length).toBe(14);

  for (const file of files) {
    it(`AUTHORS ${file} every wave at or under the ceiling`, () => {
      const table = censusTable(file);
      const params = TUNING_SHEETS[table.tuningSheet].params;
      for (const wave of table.waves) {
        expect(wave.entries.length).toBeLessThanOrEqual(STORM_CAP.maxStackedEnvelopes);
        const budget = authoredWaveStormBudget(wave, params, table.unitsPerPressurePoint, table.rules);
        expect(budget.worstMinuteUnits).toBeLessThanOrEqual(STORM_CAP.rateUnitsPerMinute);
      }
    });
  }

  it("the whole shipped corpus tops out at 240 authored units — 4.3× headroom under 1024", () => {
    // Census pin (2026-10-15, re-cut for the type-8 serverless slice —
    // eight g1 tables now; FIGURE UNCHANGED: the serverless par ladder
    // tops out on the same wave-5 par-100 shape as mail/dns/storage): every
    // slice's worst authored minute across all g1 tables (par 100). If
    // content grows past this, this pin MOVES — that is a deliberate
    // re-audit trigger, not a failure of the cap.
    let maxAuthored = 0;
    for (const file of files) {
      const table = censusTable(file);
      const params = TUNING_SHEETS[table.tuningSheet].params;
      for (const wave of table.waves) {
        const budget = authoredWaveStormBudget(wave, params, table.unitsPerPressurePoint, table.rules);
        maxAuthored = Math.max(maxAuthored, budget.worstMinuteUnits);
      }
    }
    expect(maxAuthored).toBe(240);
    expect(STORM_CAP.rateUnitsPerMinute / maxAuthored).toBeGreaterThanOrEqual(4);
  });

  it("plans every shipped wave at the full director band WITHOUT the clamp firing", () => {
    // The zero-golden promise, structurally: even the emergent worst case
    // (entropy lines ×1.25) never touches the ceiling, so planWave's shape
    // and counts are byte-identical to the pre-cap code for shipped content.
    for (const file of files) {
      const table = censusTable(file);
      for (const wave of table.waves) {
        const seed = asRunSeed(BigInt(wave.n));
        const plan = planWave(table, wave.n, baseInput(waveStream(seed, wave.n, 0), {
          director: worstBandDirector(),
        }));
        expect(
          plan.stormClamped,
          `${file} wave ${String(wave.n)} clamped — shipped content must stay under`,
        ).toBeUndefined();
        for (const [, count] of perMinuteLoad(plan)) expect(count).toBeLessThanOrEqual(STORM_CAP.rateUnitsPerMinute);
      }
    }
  });
});

/* ─────────────────────── run-seed divergence sanity ─────────────────────── */

it("clamp output still varies by seed in TIMING only (R-16 survives the cap)", () => {
  const table = parseWaveTable(stormRaw("clamp-seed", [{ parPct: 22, upp: 31 }]));
  const inflated = { ...TUNING_SHEETS.B.params, baseMicro: 2n * TUNING_SHEETS.B.params.baseMicro };
  const planA = planWave(table, 1, baseInput(waveStream(asRunSeed(11n), 1, 0), { pressureParams: inflated }));
  const planB = planWave(table, 1, baseInput(waveStream(asRunSeed(12n), 1, 0), { pressureParams: inflated }));
  expect(planA.unitsByThreat).toEqual(planB.unitsByThreat); // existence: same multiset
  expect(planA.arrivals.map((a) => a.minute)).not.toEqual(planB.arrivals.map((a) => a.minute)); // timing: differs
});
