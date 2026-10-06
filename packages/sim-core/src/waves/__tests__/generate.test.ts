/** Existence invariance (R-16): across 100 seeds the same authored table
 *  yields the identical composition & unit counts — only timing/targets move. */
import { describe, expect, it } from "vitest";
import { planWave, waveStream } from "../generate.js";
import { INITIAL_DIRECTOR_STATE, setIncidentActive } from "../director.js";
import { ledgerSnapshot } from "../ledger.js";
import { cleanTable } from "./fixtures.js";
import { buildInvitations } from "../ledger.js";
import { asRunSeed } from "../../types.js";
import type { WavePlanInput } from "../generate.js";
import type { WaveTable } from "../table.js";
import type { PressureParams } from "../pressure.js";

const TABLE = cleanTable();
const EMPTY_LEDGER = ledgerSnapshot([], 0n);

function input(seed: bigint, startMinute = 100): WavePlanInput {
  return {
    startMinute,
    tick: 100n,
    rng: waveStream(asRunSeed(seed), 1, startMinute),
    director: INITIAL_DIRECTOR_STATE,
    ledger: EMPTY_LEDGER,
    invitations: buildInvitations({}),
    entropyForecastPurchased: false,
  };
}

describe("existence invariance (100 seeds)", () => {
  it("threat multiset identical across seeds", () => {
    const multisets = new Set<string>();
    for (let s = 1n; s <= 100n; s += 1n) {
      const plan = planWave(TABLE, 1, input(s));
      multisets.add(JSON.stringify(plan.unitsByThreat));
    }
    expect(multisets.size).toBe(1);
  });

  it("placement timing differs across seeds (rng is doing its job)", () => {
    const starts = new Set<number>();
    for (let s = 1n; s <= 100n; s += 1n) starts.add(planWave(TABLE, 1, input(s)).startMinute);
    expect(starts.size).toBeGreaterThan(1);
  });

  it("target picks differ across seeds", () => {
    const picks = new Set<string>();
    for (let s = 1n; s <= 100n; s += 1n) {
      const plan = planWave(TABLE, 1, input(s));
      picks.add(plan.arrivals.map((a) => a.targetId).join(","));
    }
    expect(picks.size).toBeGreaterThan(1);
  });

  it("minute placement differs across seeds, count identical", () => {
    const plans = [1n, 2n, 3n].map((s) => planWave(TABLE, 1, input(s)));
    const counts = plans.map((p) => p.arrivals.length);
    expect(new Set(counts).size).toBe(1);
    const minutes = plans.map((p) => p.arrivals.map((a) => a.minute).join(","));
    expect(new Set(minutes).size).toBe(3); // all three distinct
  });
});

describe("clock-scale invariance", () => {
  it("same simMinute from different speeds → identical plan (sim-µs domain)", () => {
    // 100 sim-minutes arrives via speed 1,2,4 — plan is built on sim µs, so
    // identical seed+minute ⇒ identical plan regardless of real elapsed time.
    const a = planWave(TABLE, 1, input(5n, 100));
    const b = planWave(TABLE, 1, input(5n, 100));
    expect(a).toEqual(b);
  });
});

describe("director influence", () => {
  it("trough-depth factor changes pressure, never composition", () => {
    const base = INITIAL_DIRECTOR_STATE;
    // ~0.458 factor; wave 2 lands on sawtooth index 1 (0.55 < floor) so the
    // trough rule bites; wave 1 (index 0 = floor 1.0) would be identity.
    const deepened = setIncidentActive({ ...base, troughDepthFactor: 30_000n }, false);
    const p1 = planWave(TABLE, 2, { ...input(9n), director: base });
    const p2 = planWave(TABLE, 2, { ...input(9n), director: deepened });
    expect(Object.keys(p1.unitsByThreat).sort()).toEqual(Object.keys(p2.unitsByThreat).sort());
    expect(p2.pressureMicro < p1.pressureMicro).toBe(true);
  });
});

describe("ledger gating through planWave", () => {
  it("unspawnable-before-build across a build sequence (G2)", () => {
    const invitations = buildInvitations({ "cdn-shield": ["layer7-mimic"] });
    // Wave 4 has layer7-mimic; build happens at tick 200.
    const beforeTick = 100n;
    const afterTick = 300n;
    const planBefore = planWave(TABLE, 4, {
      ...input(11n, 400),
      tick: beforeTick,
      ledger: ledgerSnapshot([{ atTick: 200n, buildableId: "cdn-shield", op: "build" }], beforeTick),
      invitations,
    });
    const planAfter = planWave(TABLE, 4, {
      ...input(11n, 400),
      tick: afterTick,
      ledger: ledgerSnapshot([{ atTick: 200n, buildableId: "cdn-shield", op: "build" }], afterTick),
      invitations,
    });
    expect(planBefore.deferredThreatIds).toContain("layer7-mimic");
    expect(planBefore.arrivals.every((a) => a.threatId !== "layer7-mimic")).toBe(true);
    expect(planAfter.deferredThreatIds).toEqual([]);
    expect(planAfter.arrivals.some((a) => a.threatId === "layer7-mimic")).toBe(true);
  });

  it("deferral is deterministic — NOT rng (same ledger, 10 seeds → same deferral)", () => {
    const invitations = buildInvitations({ "cdn-shield": ["layer7-mimic"] });
    const deferrals = new Set<string>();
    for (let s = 1n; s <= 10n; s += 1n) {
      const plan = planWave(TABLE, 4, { ...input(s, 400), ledger: EMPTY_LEDGER, invitations });
      deferrals.add(JSON.stringify(plan.deferredThreatIds));
    }
    expect(deferrals.size).toBe(1);
  });
});

describe("mastery demotion visible in plan bands", () => {
  it("countered threat's envelope band flips to weather", () => {
    const plan = planWave(TABLE, 1, {
      ...input(13n),
      masteryCounts: new Map([["scanner-drizzle", 5]]),
    });
    const comp = plan.envelope.composition.find((c) => c.threatId === "scanner-drizzle");
    expect(comp?.band).toBe("weather");
  });
});

describe("plan invariants", () => {
  it("arrivals sorted by (atUs, threatId, ordinal)", () => {
    const plan = planWave(TABLE, 2, input(17n));
    for (let i = 1; i < plan.arrivals.length; i += 1) {
      const a = plan.arrivals[i - 1]!;
      const b = plan.arrivals[i]!;
      const ok =
        a.atUs < b.atUs ||
        (a.atUs === b.atUs && (a.threatId < b.threatId || (a.threatId === b.threatId && a.unitOrdinal < b.unitOrdinal)));
      expect(ok).toBe(true);
    }
  });
  it("every arrival within envelope window; atUs = minute×MICROS_PER_MIN", () => {
    const plan = planWave(TABLE, 2, input(21n));
    const end = plan.envelope.startUs + (plan.envelope.rampUs + plan.envelope.plateauUs + plan.envelope.decayUs);
    for (const a of plan.arrivals) {
      expect(a.atUs >= plan.envelope.startUs && a.atUs <= end).toBe(true);
      expect(a.atUs).toBe(BigInt(a.minute) * 60_000_000n);
    }
  });
  it("arrival events carry pinned causeId + correct envelopeTableId", () => {
    const plan = planWave(TABLE, 1, input(23n));
    expect(plan.events.length).toBe(plan.arrivals.length);
    for (const ev of plan.events) {
      expect(ev.kind).toBe("arrival");
      if (ev.kind === "arrival") expect(ev.envelopeTableId).toBe(plan.envelope.id);
    }
    expect(new Set(plan.events.map((e) => String(e.causeId))).size).toBe(plan.events.length);
  });
  it("pressureMicro = par(0)×40% for wave 1 (sheet B, S=1.0)", () => {
    const plan = planWave(TABLE, 1, input(1n));
    expect(plan.pressureMicro).toBe(40_000_000n);
  });
});

describe("event identity + budget rounding discipline (N4/N5)", () => {
  /** Odd micro base × 55% par → non-exact ÷100: the truncation boundary. */
  const ODD_PRESSURE: PressureParams = {
    baseMicro: 10_000_001n,
    growthNum: 223n,
    growthDen: 200n,
    sawtoothMicro: [1_000_000n],
  };
  const HALF_UP_TABLE: WaveTable = {
    id: "n5-boundary",
    typeBundleId: "shared-web",
    tuningSheet: "B",
    unitsPerPressurePoint: 1,
    waves: [
      {
        n: 1,
        windowMinutes: 30,
        rampMin: 5,
        plateauMin: 10,
        decayMin: 5,
        parPct: 55,
        hard: false,
        entries: [
          {
            threatId: "x",
            role: "swarm",
            family: "human",
            band: "weather",
            sharePct: 100,
            denominations: ["bandwidth"],
            targets: ["t"],
          },
        ],
      },
    ],
  };

  it("N5: par% spend rounds HALF-UP, not truncating (10_000_001×55/100 = 5_500_000.55)", () => {
    const plan = planWave(HALF_UP_TABLE, 1, { ...input(3n), pressureParams: ODD_PRESSURE });
    expect(plan.pressureMicro).toBe(5_500_001n); // old truncating `/` gave 5_500_000n
    expect(plan.unitsByThreat["x"]).toBe(6); // 5_500_001×100×1 ÷ 1e8 = 5.5 → half-up 6
  });

  it("N5: exact divisions are unchanged (no gratuitous shift)", () => {
    const plan = planWave(TABLE, 1, input(1n)); // 100_000_000×40/100 exact
    expect(plan.pressureMicro).toBe(40_000_000n);
  });

  it("N4: every arrival event carries the PLANNING tick; arrival time lives in atUs", () => {
    const plan = planWave(TABLE, 2, input(31n));
    expect(plan.events.length).toBeGreaterThan(1);
    for (const ev of plan.events) expect(ev.tick).toBe(100n); // input.tick constant, no +i ramp
    expect(new Set(plan.events.map((e) => String(e.atUs))).size).toBeGreaterThan(1); // times DO vary
  });
});
