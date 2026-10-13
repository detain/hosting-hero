/** runner.test.ts — the mission loop proven on the ten shipped §1.5
 *  scenarios: every doc wins as authored, every doc loses when exactly one
 *  wire input is flipped (same seed), timeout is honest, and a run is
 *  byte-identical ×100 by construction.
 *
 *  VOCAB-EXPANSION LADDER — the §1.5 missions still unrunnable, ranked by
 *  the ONE predicate or input each needs (do NOT bolt them on; each is a
 *  deliberate future ticket):
 *  1. written-off-count observation predicate → "Post-Breach" (~:3213) and
 *     the "Covenant" (:3772) family: their drama is accounts the dunning
 *     ladder kills, which today is invisible to the objective vocab (the
 *     observation carries writtenOffCustomers — no predicate reads it).
 *  2. metrics-delta/window predicate → "Contract Recompete" (~:3839, dropped
 *     from this wave) and "Sev-0" (~:3240): both hinge on a metric MOVING
 *     visibly within a window; static thresholds cannot express "improved".
 *  3. family-labeled arrivals in the observation → "Free Tier Flood"
 *     (~:3574): the runner pins dominantFamily "organic" for every segment,
 *     so a free-tier/malicious mix cannot be told apart at the objective.
 *  4. covenant inputs on the wire → "Covenant" (:3772) proper: the death
 *     cause exists (covenant-default) but the runner feeds no covenant terms,
 *     so death-by-cause:"covenant-default" is permanently unfalsifiable.
 *  5. reputation in the observation → "Review Bomb" (~:3870): the economy
 *     publishes company::reputation; the scenario observation does not read
 *     it yet.
 *  Adjacent known seams (same spirit): hands/door intents on the wire would
 *  unlock "Understaffed Sunday" (~:3657); alternate-path routing → "The
 *  Fiber Cut" (~:3368); chargeback/rolling-reserve inputs → "The Chargeback
 *  Wave" (~:3721). */
import { describe, expect, it } from "vitest";

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { encodeTaggedTree } from "../../internal/canonical.ts";
import { asRunSeed } from "../../types.ts";
import {
  SHIPPED_SCENARIO_IDS,
  SHIPPED_SCENARIO_WIRES,
  runScenario,
  scenarioSeed,
  shippedScenario,
} from "../index.ts";
import { parseScenarioDoc } from "../doc.ts";
import type { ScenarioReport, ScenarioWire } from "../index.ts";

const BASE_SEED = asRunSeed(904n);

/** One-input wire surgery: deep-clone the shipped JSON, flip ONE field,
 *  re-parse through the wall. The flip is the probe — everything else is
 *  byte-identical to the shipped mission. */
/** Surgery mirror — mutate plain JSON, re-cross the wall (readonly by law). */
type MutableWire = {
  limits: { opex: unknown[]; initialFreeMicroUsd: unknown; guardrails?: unknown[] };
  contracts: Record<string, unknown>[];
  traffic: { tableId: string; segments: Record<string, unknown>[] };
};

function flip(id: string, mutate: (wire: MutableWire) => void): ReturnType<typeof shippedScenario> {
  const wire = JSON.parse(JSON.stringify(SHIPPED_SCENARIO_WIRES[id])) as MutableWire;
  mutate(wire);
  return parseScenarioDoc(wire as unknown as ScenarioWire);
}

/** Canonical, bigint-safe report identity (fastForward's stableReport law). */
function reportIdentity(report: ScenarioReport): string {
  return JSON.stringify(
    encodeTaggedTree(report as unknown as Record<string, unknown>, (problem) => {
      throw new Error(`scenario report not canonical: ${String(problem.kind)}`);
    }),
    (_k, v) => (typeof v === "bigint" ? `${String(v)}n` : v),
  );
}

describe("shipped missions — win side (as authored)", () => {
  for (const id of [...SHIPPED_SCENARIO_IDS]) {
    it(`${id} is won end-to-end on three seed offsets`, () => {
      for (const offset of [0, 1, 2]) {
        const report = runScenario(shippedScenario(id), BASE_SEED, { seedOffset: offset });
        expect(report.outcome, `${id}@${offset} → ${report.stopReason}`).toBe("won");
        expect(report.stopReason).toBe(`win@${report.endMinute}`);
        expect(report.endDigest).toMatch(/^[0-9a-f]{32}$/);
      }
    });
  }
});

describe("shipped missions — lose side (ONE flipped wire input, same seed)", () => {
  it("Long Weekend starves under a brutal burn drip → guard halt", () => {
    const starved = flip("the-long-weekend", (wire) => {
      wire.limits.opex = Array.from({ length: 239 }, (_unused, i) => ({
        atMinute: i + 1,
        amountMicroUsd: 6_000_000,
        memo: `x-${String(i + 1).padStart(3, "0")}`,
      }));
    });
    const report = runScenario(starved, BASE_SEED);
    expect(report.outcome).toBe("lost");
    expect(report.stopReason).toBe("guard:freeCashDepleted@3");
    expect(report.trace.economyRefusals).toBeGreaterThan(0);
  });

  it("Deadbeat Quarter with no customers and no cash → canonical death", () => {
    const hollow = flip("deadbeat-quarter", (wire) => {
      wire.contracts = [];
      wire.limits.initialFreeMicroUsd = 0;
      wire.limits.opex = [{ atMinute: 1, amountMicroUsd: 1, memo: "dust" }];
    });
    const report = runScenario(hollow, BASE_SEED);
    expect(report.outcome).toBe("lost");
    expect(report.observation.deaths.length).toBe(1);
    expect(report.stopReason).toMatch(/^lose:death-by-cause:any@\d+$/);
    // the collapse lands mid-quarter, never at the clock edge
    expect(Number(report.endMinute)).toBeLessThan(120);
  });

  it("The Angry Whale with auto-renew off → the whale walks at its cliff", () => {
    const unkept = flip("the-angry-whale", (wire) => {
      const whale = wire.contracts[0];
      if (whale !== undefined) whale.autoRenew = false;
    });
    const report = runScenario(unkept, BASE_SEED);
    expect(report.outcome).toBe("lost");
    expect(report.stopReason).toBe("lose:churn-above:0@111");
    expect(report.observation.churnedCustomers).toBe(1);
    // the loss lands exactly at the cliff, before the survive line completes
    expect(Number(report.endMinute)).toBeLessThan(shippedScenario("the-angry-whale").limits.maxSimMinutes);
    const keep = report.objectives.win.find((row) => row.predicate.kind === "churn-below");
    expect(keep?.holds ?? true).toBe(false); // the "keep them" row is broken
  });

  it("Collections Week with an empty book → churn-collapse at the sustain wall", () => {
    // The seed design died at the tick-252 cliffs; the committed engine's
    // cliff dice cannot be forced to walk the whole book out (best ~45 %),
    // so the one-flip loss is the honest collapse: no contracts arms the
    // churn floor immediately — clock-bound, so identical on every offset.
    const hollow = flip("collections-week", (wire) => {
      wire.contracts = [];
    });
    for (const offset of [0, 1, 2]) {
      const report = runScenario(hollow, BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("lost");
      expect(report.stopReason).toBe("lose:death-by-cause:churn-collapse@44");
      expect(report.observation.deaths).toEqual(["churn-collapse"]);
    }
  });

  it("Metastable surge running three minutes longer locks the node → guard halt", () => {
    // ONE field: the surge's closing segment starts at 36 instead of 33.
    // Backlog + retries hold every slot past the 10-minute degraded wall —
    // on every seed offset, because the locked state is self-sustaining.
    const locked = flip("metastable", (wire) => {
      wire.traffic.segments[2] = { fromMinute: 36, ratePerMin: 4 };
    });
    for (const offset of [0, 1, 2]) {
      const report = runScenario(locked, BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("lost");
      expect(report.stopReason).toBe("guard:cascadeCollapse@39");
    }
    // §1.5's premise is retries SUSTAINING the overload: the locked arm
    // accumulates bounce/retry traffic, the win arm drains almost none —
    // the pair is the discriminating pin (calm full-run ≤ 5 bounces vs
    // locked-by-t39 ≥ 10).
    const calm = runScenario(shippedScenario("metastable"), BASE_SEED);
    expect(calm.stopReason).toBe("win@240");
    expect(calm.trace.eventsByKind["bounced"] ?? 0).toBeLessThanOrEqual(5);
    const lockedProbe = runScenario(locked, BASE_SEED);
    expect(lockedProbe.trace.eventsByKind["bounced"] ?? 0).toBeGreaterThanOrEqual(10);
    expect(lockedProbe.trace.eventsByKind["retry"] ?? 0).toBeGreaterThanOrEqual(10);
  });

  it("Launch Day with the spike twice as loud → the bounce budget is spent", () => {
    // ONE field: the hug-of-death step goes 40 → 80 visits/min. The calm
    // arm converts (≤29 terminal bounces across five seeds); the loud arm
    // crosses the 40-bounce budget at the same ticks on every offset —
    // the launch that rate-limits its own audience into the floor.
    const overwhelmed = flip("launch-day", (wire) => {
      wire.traffic.segments[1] = { fromMinute: 30, ratePerMin: 80 };
    });
    const loseTicks: number[] = [];
    for (const offset of [0, 1, 2, 3, 4]) {
      const report = runScenario(overwhelmed, BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("lost");
      expect(report.stopReason).toMatch(/^lose:bounces-above:40@\d+$/);
      loseTicks.push(Number(report.endMinute));
    }
    expect(loseTicks).toEqual([36, 38, 37, 36, 36]); // seed 904..908
    // discriminating pair: the shipped arm never spends the budget it cites
    for (const offset of [0, 1, 2, 3, 4]) {
      const calm = runScenario(shippedScenario("launch-day"), BASE_SEED, { seedOffset: offset });
      expect(calm.stopReason).toBe("win@240");
      expect(calm.observation.bounces).toBeLessThanOrEqual(29);
    }
  });

  it("DDoS Season whose gradient keeps climbing → the sustained wall closes", () => {
    // ONE field: the closing ladder step doubles 8 → 16 visits/min. The
    // season-as-curve arm runs four hours at ZERO bounces; the rude season
    // pins the node past ρ .9 and the 10-minute degraded wall halts it at
    // the same tick on every seed — the guard is the level ending.
    const rude = flip("ddos-season", (wire) => {
      wire.traffic.segments[3] = { fromMinute: 180, ratePerMin: 16 };
    });
    for (const offset of [0, 1, 2, 3, 4]) {
      const report = runScenario(rude, BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("lost");
      expect(report.stopReason).toBe("guard:cascadeCollapse@189");
      expect(report.trace.eventsByKind["bounced"] ?? 0).toBeGreaterThanOrEqual(8);
    }
    // discriminator: the polite season never bounces a visitor at all
    for (const offset of [0, 1, 2]) {
      const calm = runScenario(shippedScenario("ddos-season"), BASE_SEED, { seedOffset: offset });
      expect(calm.stopReason).toBe("win@240");
      expect(calm.observation.bounces).toBe(0);
    }
  });

  it("Runway: 6 Weeks with the anchor deal slipping → float-insolvency at the gate", () => {
    // ONE field pair (one wire idea: the deal's start): both anchor accounts
    // slip 32,400 → 36,000 biz-minutes. The settle lands after the 43-minute
    // zero-cash spell closes, and the company dies of float-insolvency at
    // t343 on all five seeds — clock-bound, so the tick is exact.
    const slipped = flip("runway-six-weeks", (wire) => {
      for (const contract of wire.contracts) contract.termStartMin = 36_000;
    });
    for (const offset of [0, 1, 2, 3, 4]) {
      const report = runScenario(slipped, BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("lost");
      expect(report.stopReason).toBe("lose:death-by-cause:float-insolvency@343");
      expect(report.observation.deaths).toEqual(["float-insolvency"]);
      expect(report.trace.economyRefusals).toBe(2); // the t315 + t330 payrolls
    }
    // the win arm survives with the SAME razor, rescued: fixed final cash,
    // exactly two anchor settles, and one refused burn on the way down.
    for (const offset of [0, 1, 2, 3, 4]) {
      const saved = runScenario(shippedScenario("runway-six-weeks"), BASE_SEED, { seedOffset: offset });
      expect(saved.stopReason).toBe("win@600");
      expect(saved.observation.cashFreeMicroUsd).toBe(71_630_000n);
      expect(saved.observation.settledInvoices).toBe(2);
      expect(saved.trace.economyRefusals).toBe(1);
    }
  });

  it("The Price Hike at a 300% jump → the board mandate is crossed", () => {
    // ONE idea, applied where the spec applies it (every vendor bill): the
    // hike-tier burns go 15 Mµ$ → 45 Mµ$. The eaten-margin arm bottoms out
    // above the 50 Mµ$ line (cash never dips near it); the jumped arm crosses
    // the mandate at t310 on all five seeds — same burn memo, same clock.
    const jumped = flip("the-price-hike", (wire) => {
      const rows = wire.limits.opex as { memo: string; amountMicroUsd: number }[];
      for (const row of rows) if (row.memo.startsWith("hike-")) row.amountMicroUsd = 45_000_000;
    });
    for (const offset of [0, 1, 2, 3, 4]) {
      const report = runScenario(jumped, BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("lost");
      expect(report.stopReason).toBe("lose:cash-below:50000000@310");
      expect(report.observation.cashFreeMicroUsd).toBe(21_762_000n);
    }
    for (const offset of [0, 1, 2]) {
      const eaten = runScenario(shippedScenario("the-price-hike"), BASE_SEED, { seedOffset: offset });
      expect(eaten.stopReason).toBe("win@480");
      expect(eaten.observation.cashFreeMicroUsd).toBe(133_524_000n);
    }
  });

  it("The Quiet Month buying the extra row of servers → the mandate blinks", () => {
    // ONE field: the temptation memo keeps its slot at t120 and its
    // 3 Mµ$ line becomes what a row of servers actually costs, 120 Mµ$.
    // The level dies at the purchase tick on every seed — the budget was
    // always the antagonist; this wave proves it.
    const cramming = flip("the-quiet-month", (wire) => {
      const rows = wire.limits.opex as { memo: string; amountMicroUsd: number }[];
      const temptation = rows.find((row) => row.memo === "the-extra-row-of-servers");
      if (temptation !== undefined) temptation.amountMicroUsd = 120_000_000;
    });
    for (const offset of [0, 1, 2, 3, 4]) {
      const report = runScenario(cramming, BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("lost");
      expect(report.stopReason).toBe("lose:cash-below:150000000@120");
      expect(report.observation.cashFreeMicroUsd).toBe(134_938_000n);
    }
    for (const offset of [0, 1, 2]) {
      const quiet = runScenario(shippedScenario("the-quiet-month"), BASE_SEED, { seedOffset: offset });
      expect(quiet.stopReason).toBe("win@480");
      expect(quiet.observation.bounces).toBe(0);
    }
  });
});

describe("wave-two missions — engine truth (2026-10-13)", () => {
  it("Runway: 6 Weeks is a cash-TIMING razor, not a cash-LEVEL one", () => {
    // The mission's soul, pinned mid-run: the payroll drain reaches EXACTLY
    // zero at t300 (nothing else moves the ledger), the anchor settle lands
    // inside the insolvency window at t315, and the float gate (zero + a
    // refused settlement + 43 min) is what the slipped-deal flip dies to.
    const doc = shippedScenario("runway-six-weeks");
    const atZero = runScenario(doc, BASE_SEED, { tickCap: 300 });
    expect(atZero.stopReason).toBe("timeout@300");
    expect(atZero.observation.cashFreeMicroUsd).toBe(0n);
    const rescued = runScenario(doc, BASE_SEED, { tickCap: 315 });
    expect(rescued.observation.cashFreeMicroUsd).toBeGreaterThan(0n);
    expect(rescued.observation.settledInvoices).toBe(2); // both anchors pay inside the window
    expect(rescued.trace.economyRefusals).toBe(1); // the t315 payroll bounced first
  });
});

describe("salvage missions — engine truth (ADR-0011)", () => {
  it("Collections Week: hourly invoices land from the first hour, anchors renew, dice thin the small book", () => {
    // settledInvoices >= 1000 falsifies the pre-salvage assumption that
    // hourly billing resembles monthly (first settle near t214 — it does not).
    // churnedCustomers is dice-bound per seed: the exact walk-out counts are
    // deterministic for (doc, seed+0..2) and pinned here.
    const churnByOffset: number[] = [];
    for (const offset of [0, 1, 2]) {
      const report = runScenario(shippedScenario("collections-week"), BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("won");
      expect(report.stopReason).toBe("win@240");
      expect(report.observation.settledInvoices).toBeGreaterThanOrEqual(1000);
      // six accounts, two anchors renewing — at most the four dice can leave
      expect(report.observation.churnedCustomers).toBeLessThanOrEqual(4);
      churnByOffset.push(report.observation.churnedCustomers);
    }
    expect(churnByOffset).toEqual([0, 2, 1]); // seed 904/905/906 walk-outs
  });

  it("Metastable: the intermediate trigger IS the metastable band — some seeds drain, some cascade", () => {
    // The spec's whole premise: identical inputs, divergent fates by dice.
    // The shipped win arm and the flipped lose arm sit OUTSIDE the band
    // (deterministic on every offset); this middle arm sits inside it.
    const middle = parseScenarioDoc({
      ...(JSON.parse(JSON.stringify(SHIPPED_SCENARIO_WIRES.metastable)) as ScenarioWire),
      traffic: {
        tableId: "metastable-storm",
        segments: [
          { fromMinute: 0, ratePerMin: 5 },
          { fromMinute: 30, ratePerMin: 10 },
          { fromMinute: 36, ratePerMin: 5 },
        ],
      },
    });
    const outcomes = new Set<string>();
    for (let offset = 0; offset < 15; offset += 1) {
      const report = runScenario(middle, BASE_SEED, { seedOffset: offset });
      outcomes.add(report.outcome);
      expect(["won", "lost"]).toContain(report.outcome);
      if (report.outcome === "lost") expect(report.stopReason).toMatch(/^guard:cascadeCollapse@\d+$/);
      else expect(report.stopReason).toBe("win@240");
    }
    expect(outcomes.size).toBe(2); // both fates occur — metastability, pinned
  });
});

describe("timeout and caps", () => {
  it("tickCap cuts the clock and the outcome says timeout", () => {
    const report = runScenario(shippedScenario("the-long-weekend"), BASE_SEED, { tickCap: 40 });
    expect(report.outcome).toBe("timeout");
    expect(report.stopReason).toBe("timeout@40");
    expect(report.endTick).toBe(40n);
  });

  it("tickCap never exceeds the declared clock", () => {
    const report = runScenario(shippedScenario("the-angry-whale"), BASE_SEED, { tickCap: 9999 });
    expect(Number(report.endMinute)).toBeLessThanOrEqual(200);
  });

  it("a negative seed offset is refused loudly", () => {
    expect(() => runScenario(shippedScenario("the-long-weekend"), BASE_SEED, { seedOffset: -1 })).toThrow(
      /seedOffset/,
    );
  });

  it("scenarioSeed is the documented walk", () => {
    const report = runScenario(shippedScenario("deadbeat-quarter"), BASE_SEED, { seedOffset: 2 });
    expect(report.runSeed).toBe(scenarioSeed(BASE_SEED, 2));
  });
});

describe("determinism", () => {
  for (const id of [...SHIPPED_SCENARIO_IDS]) {
    it(`${id}: 12-minute arm is byte-identical ×100`, () => {
      const doc = shippedScenario(id);
      const digests = new Set<string>();
      for (let i = 0; i < 100; i += 1) {
        digests.add(reportIdentity(runScenario(doc, BASE_SEED, { tickCap: 12 })));
      }
      expect(digests.size).toBe(1);
    });
  }

  it("full-length shipped runs agree across fresh calls and fresh parses", () => {
    for (const id of ["the-long-weekend", "the-angry-whale", "runway-six-weeks", "the-price-hike", "the-quiet-month", "ddos-season", "launch-day"] as const) {
      const wire = JSON.parse(JSON.stringify(SHIPPED_SCENARIO_WIRES[id]));
      const a = runScenario(parseScenarioDoc(wire), BASE_SEED, { tickCap: 60 });
      const b = runScenario(shippedScenario(id), BASE_SEED, { tickCap: 60 });
      expect(reportIdentity(a)).toBe(reportIdentity(b));
      expect(a.endDigest).toBe(b.endDigest);
    }
  });

  it("the whale churn cliff holds its drama across five seed offsets", () => {
    const unkept = flip("the-angry-whale", (wire) => {
      const whale = wire.contracts[0];
      if (whale !== undefined) whale.autoRenew = false;
    });
    const churnTicks = new Set<number>();
    for (const offset of [0, 1, 2, 3, 4]) {
      churnTicks.add(Number(runScenario(unkept, BASE_SEED, { seedOffset: offset }).endMinute));
    }
    expect(churnTicks.has(111)).toBe(true); // every offset churns AT the cliff — timing is clock-bound, dice-bound
    const full = runScenario(unkept, BASE_SEED, { seedOffset: 0 });
    expect(full.outcome).toBe("lost");
  });
});

describe("mirrored refusal law (pinned against the unattended source)", () => {
  it("runner.ts and fastForward.ts carry the identical settle-refusal regex", () => {
    const here = readFileSync(fileURLToPath(new URL("../runner.ts", import.meta.url)), "utf8");
    const there = readFileSync(fileURLToPath(new URL("../../unattended/fastForward.ts", import.meta.url)), "utf8");
    const shape = `settle (\\S+): -(\\d+) µ\\$ on '`;
    expect(here).toContain(shape);
    expect(there).toContain(shape);
  });
});
