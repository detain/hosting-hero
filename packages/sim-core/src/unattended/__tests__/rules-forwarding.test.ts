/**
 * unattended/fastForward.ts — `traffic.rules` forwarding (B4 host inputs).
 *
 * The weekend runner is the second host of the §2.24 wave rules after the
 * proto runner: `rules` is OPTIONAL and every field is spread into the
 * per-wave planWave input ONLY when present. These tests pin both halves:
 *
 *  1. ABSENT (or an empty rules bag) ⇒ byte-identical to no-key-at-all —
 *     the shipped weekend goldens stay honest under the additive change.
 *  2. PRESENT ⇒ the record reaches planWave end-to-end: incidentState
 *     amplifies the marker-carrying wave and moves the stream. Copycat and
 *     oversell ride the identical spread block but are runtime-neutral by
 *     engine law (envelope-rate minting) — pinned as LAW pins below, with
 *     the positive composition/timing proof in the proto runner's waveRules
 *     liveness gate. Deterministic seeds make every witness stable.
 */
import { describe, expect, it } from "vitest";
import { fromInt } from "../../kernel/fixed.ts";
import { runUnattended } from "../index.ts";
import type { UnattendedReport, UnattendedWaveRules } from "../index.ts";
import { UA_PRESSURE, smallContract, uaConfig, uaWaveTable } from "./fixtures.ts";

/** One wave, `secondIncident` marked, with the §2.24 rules block; TWO
 *  families so a copycat dominant (human) actually rescales shares. */
function rulesWaveTable(): unknown {
  return Object.freeze({
    id: "ua-rules-table",
    typeBundleId: "shared-web",
    tuningSheet: "A",
    unitsPerPressurePoint: 2,
    rules: Object.freeze({
      secondIncidentMultiplierDuringIncident: 1.8,
      secondIncidentMultiplierDuringRecovery: 2.5,
      copycatReservePct: Object.freeze([10, 15]),
    }),
    waves: Object.freeze([
      Object.freeze({
        n: 1,
        windowMinutes: 60,
        rampMin: 10,
        plateauMin: 30,
        decayMin: 10,
        parPct: 40,
        hard: false,
        secondIncident: true,
        entries: Object.freeze([
          Object.freeze({
            threatId: "ua-swarm-1",
            role: "swarm",
            family: "malicious",
            band: "storm",
            sharePct: 60,
            denominations: Object.freeze(["concurrency"]),
            targets: Object.freeze(["web-1"]),
          }),
          Object.freeze({
            threatId: "ua-human-1",
            role: "swarm",
            family: "human",
            band: "storm",
            sharePct: 40,
            denominations: Object.freeze(["concurrency"]),
            targets: Object.freeze(["web-1"]),
          }),
        ]),
      }),
    ]),
  });
}

/** Wide-open pass-through board + one small contract: the run stays alive
 *  the full 130 ticks (same shape as the errorBudgetGone witness). */
const PASS_BOARD = {
  nodes: [{ id: "web-1", slots: 40, serviceTimeUs: 2_000_000n, inspectionDepth: "pass-through" as const }],
};
const MONEY = {
  contracts: [smallContract("c-rules", 100_000_000n, 100_000)],
  initialFreeMicroUsd: 50_000_000_000n,
};

function rulesRun(rules?: UnattendedWaveRules): UnattendedReport {
  return runUnattended(
    uaConfig({
      ticks: 130n,
      board: PASS_BOARD,
      money: MONEY,
      traffic: {
        table: rulesWaveTable(),
        pressureParams: UA_PRESSURE,
        baselineRatePerMin: fromInt(5),
        ...(rules === undefined ? {} : { rules }),
      },
    }),
  );
}

function totalArrivals(report: UnattendedReport): number {
  return report.hourlyBuckets.reduce((sum, bucket) => sum + bucket.arrivals, 0);
}

describe("traffic.rules forwarding is provably inert when absent", () => {
  it("no key, undefined key, and an empty rules bag all byte-agree", () => {
    const plain = rulesRun(undefined);
    const empty = rulesRun({});
    expect(empty.finalDigest).toBe(plain.finalDigest);
    expect(totalArrivals(empty)).toBe(totalArrivals(plain));
    expect(empty.perCheckpoint.map((c) => c.digest)).toEqual(plain.perCheckpoint.map((c) => c.digest));
  });
});

describe("traffic.rules reaches the per-wave plan", () => {
  it("incidentState 'active' amplifies the secondIncident-marked wave", () => {
    const quiet = rulesRun({});
    const hot = rulesRun({ incidentState: "active" });
    // ×1.8 follow-ons raise unitsTotal ⇒ envelope rate ⇒ minted arrivals.
    expect(totalArrivals(hot)).toBeGreaterThan(totalArrivals(quiet));
    expect(hot.finalDigest).not.toBe(quiet.finalDigest);
  });

  it("incidentState 'recovering' amplifies harder (×2.5 > ×1.8)", () => {
    const hot = rulesRun({ incidentState: "active" });
    const healing = rulesRun({ incidentState: "recovering" });
    expect(totalArrivals(healing)).toBeGreaterThanOrEqual(totalArrivals(hot));
    expect(healing.finalDigest).not.toBe(hot.finalDigest);
  });

  /* The engine's RUNTIME is envelope-rate-driven: createArrivalStep mints
   * floor+fractional rolls from `ratePerMin` alone, never from plan.arrivals
   * timing or plan.unitsByThreat composition. So the positive proof that the
   * rules record reaches planWave is the incidentState witness above (it
   * moves unitsTotal → rate → stream) plus the proto runner's per-wave PLAN
   * witnesses (waveRules liveness). The two pins below are LAW pins, not
   * wiring pins: copycat and oversell are DIGEST-NEUTRAL at runtime today.
   * If a future engine starts consuming plan composition/timing, these go
   * red on purpose and the owning lane re-decides the weekend goldens. */

  it("LAW: dominantDefenseFamily rescales composition, never the runtime digest", () => {
    const authored = rulesRun({});
    const copycat = rulesRun({ dominantDefenseFamily: "human" });
    expect(copycat.finalDigest).toBe(authored.finalDigest);
    expect(totalArrivals(copycat)).toBe(totalArrivals(authored));
  });

  it("LAW: oversell clumps plan timing, never the runtime digest", () => {
    const calm = rulesRun({});
    const oversold = rulesRun({
      oversell: { ratioMicro: 8_000_000n, homogeneityMicro: 1_000_000n },
    });
    expect(oversold.finalDigest).toBe(calm.finalDigest);
    expect(totalArrivals(oversold)).toBe(totalArrivals(calm));
  });
});
