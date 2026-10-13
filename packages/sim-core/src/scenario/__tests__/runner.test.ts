/** runner.test.ts — the mission loop proven on the seventeen shipped §1.5
 *  scenarios: every doc wins as authored, every doc loses when exactly one
 *  wire input is flipped (same seed), timeout is honest, and a run is
 *  byte-identical ×100 by construction.
 *
 *  VOCAB-EXPANSION LADDER — all five rungs are now CONSUMED. The §1.5
 *  missions still unrunnable sit in the adjacent-seams list below (do NOT
 *  bolt them on; each is a deliberate future ticket):
 *  1. CONSUMED (wave three, 2026-10-13): written-off-count observation
 *     predicate → "Post-Breach Aftermath" (:3213) shipped.
 *  2. CONSUMED (wave three, 2026-10-13): metrics-delta/window predicate →
 *     "Contract Recompete" (:3839) and "The Sev-0" (:3240, partial: the
 *     recovery curve is expressible, the restraint sequence is not).
 *  3. CONSUMED (wave three, 2026-10-13): family-labeled arrivals →
 *     "Free Tier Flood" (:3574); segments carry an optional dominantFamily
 *     and the runner counts mint-time arrivals per family.
 *  4. CONSUMED (wave four, 2026-10-13): covenant terms on the wire
 *     (limits.covenants) + the breach-count predicate → "The Covenant"
 *     (:3772) shipped. The runner now seeds the money lane with the terms
 *     (and re-anchors freeAtMonthStart to the opening bankroll — without
 *     that, month-one burn closes at zero and the runway readout is
 *     forever the met-sentinel). death-by-cause:"covenant-default" stays
 *     unfalsifiable INSIDE an interlude clock: the grace machinery needs
 *     ~140+ more sim-minutes than the review gives it.
 *  5. CONSUMED (wave four, 2026-10-13): reputation in the observation
 *     (EconomyState.reputation.overallBps, published since 57ea80e) →
 *     "Review Bomb" (:3870) shipped.
 *  VOCAB CEILING: the fifteen→nineteen predicate set now covers every
 *  §1.5 drama the money lane can even see. Remaining known seams (same
 *  spirit): hands/door intents on the wire would unlock "Understaffed
 *  Sunday" (~:3657); alternate-path routing → "The Fiber Cut" (~:3368);
 *  chargeback/post-mortem/major-incident INPUTS (the reputation deltas
 *  exist in economy, foldMoneyLaneTick forwards none of them) → "The
 *  Chargeback Wave" (~:3721) and the transparency half of the Review-Bomb
 *  family. */
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
import { corpusAuthority } from "./corpusFixtures.ts";
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
        const report = runScenario(shippedScenario(id), BASE_SEED, { seedOffset: offset, corpus: corpusAuthority() });
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

  it("Post-Breach Aftermath when the disclosure reaches the rest of the base → the ceiling breaks", () => {
    // ONE idea, expressed as one wire push: the breached book is six hourly
    // accounts; the flip signs six more before the board meeting. The dunning
    // ladder kills them at the SAME 7% card-failure dice, so the cascade
    // crosses the written-off ceiling (7) in the last hour of the clock —
    // the exact tick is dice-bound per seed, the LOSS is not.
    const disclosed = flip("post-breach-aftermath", (wire) => {
      for (let i = 7; i <= 12; i += 1) {
        wire.contracts.push({
          id: `pb-0${String(i)}`,
          customer: `Copycat Host ${String(i)}`,
          mrcMicroUsd: 18_000_000,
          billingCycle: "hourly",
          termMonths: 12,
          termStartMin: 0,
          termEndMin: 30_000,
          autoRenew: true,
        });
      }
    });
    const loseTicks: number[] = [];
    for (const offset of [0, 1, 2, 3, 4]) {
      const report = runScenario(disclosed, BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("lost");
      expect(report.stopReason).toMatch(/^lose:written-off-above:6@\d+$/);
      loseTicks.push(Number(report.endMinute));
    }
    expect(loseTicks).toEqual([301, 313, 311, 307, 297]); // seed 904..908
    // discriminating pair: the shipped book never crosses the ceiling.
    for (const offset of [0, 1, 2, 3, 4]) {
      const calm = runScenario(shippedScenario("post-breach-aftermath"), BASE_SEED, { seedOffset: offset });
      expect(calm.stopReason).toBe("win@320");
      expect(calm.observation.writtenOffCustomers).toBeLessThan(7);
    }
  });

  it("Contract Recompete with the doubled fourth wave → the bounce budget is spent", () => {
    // ONE field: the recovery ladder's closing step doubles 14 → 28 visits/min.
    // The tenant arm converts (≤24 terminal bounces across five seeds); the
    // flooded arm crosses the 25-bounce budget within a few minutes of the
    // step — the recompete the player wins by SPENDING, not shouting.
    const flooded = flip("contract-recompete", (wire) => {
      wire.traffic.segments[3] = { fromMinute: 180, ratePerMin: 28 };
    });
    const loseTicks: number[] = [];
    for (const offset of [0, 1, 2, 3, 4]) {
      const report = runScenario(flooded, BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("lost");
      expect(report.stopReason).toMatch(/^lose:bounces-above:25@\d+$/);
      loseTicks.push(Number(report.endMinute));
    }
    expect(loseTicks).toEqual([200, 199, 202, 198, 202]); // seed 904..908
    for (const offset of [0, 1, 2, 3, 4]) {
      const calm = runScenario(shippedScenario("contract-recompete"), BASE_SEED, { seedOffset: offset });
      expect(calm.stopReason).toBe("win@240");
      expect(calm.observation.bounces).toBeLessThanOrEqual(24);
    }
  });

  it("Free Tier Flood with the abuse wave at 40/min → the malicious ceiling breaks", () => {
    // ONE field: the flood step goes 26 → 40 malicious visits/min. Integer
    // rates mint deterministically, so the 3,200-ceiling breach lands at the
    // EXACT same tick on all five seeds — the census law made visible.
    const inundated = flip("free-tier-flood", (wire) => {
      wire.traffic.segments[2] = { fromMinute: 120, ratePerMin: 40, family: "malicious" };
    });
    for (const offset of [0, 1, 2, 3, 4]) {
      const report = runScenario(inundated, BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("lost");
      expect(report.stopReason).toBe("lose:family-arrivals-above:malicious:3200@200");
      expect(report.observation.arrivalsByFamily["malicious"]).toBe(3240);
    }
    // discriminator: the tuned-controls arm keeps the abusers under the line
    for (const offset of [0, 1, 2]) {
      const calm = runScenario(shippedScenario("free-tier-flood"), BASE_SEED, { seedOffset: offset });
      expect(calm.stopReason).toBe("win@240");
      expect(calm.observation.arrivalsByFamily["malicious"]).toBe(3146);
    }
  });

  it("The Sev-0 with a six-fold escalation → the bounce scar crosses the mandate", () => {
    // ONE field: the post-incident step goes 14 → 60 visits/min (the
    // un-mitigated escalation instead of the repaired climb). The 30-bounce
    // mandate is crossed within minutes of the step, seed-jittered by the
    // retry dice — same story the calm arm never tells (≤29 bounces ×5).
    const escalated = flip("the-sev-0", (wire) => {
      wire.traffic.segments[2] = { fromMinute: 150, ratePerMin: 60 };
    });
    const loseTicks: number[] = [];
    for (const offset of [0, 1, 2, 3, 4]) {
      const report = runScenario(escalated, BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("lost");
      expect(report.stopReason).toMatch(/^lose:bounces-above:30@\d+$/);
      loseTicks.push(Number(report.endMinute));
    }
    expect(loseTicks).toEqual([162, 163, 162, 163, 160]); // seed 904..908
    for (const offset of [0, 1, 2, 3, 4]) {
      const calm = runScenario(shippedScenario("the-sev-0"), BASE_SEED, { seedOffset: offset });
      expect(calm.stopReason).toBe("win@240");
      expect(calm.observation.bounces).toBeLessThanOrEqual(29);
    }
  });

  it("The Covenant with one growth-buildout invoice → the breach row lands AT the roll", () => {
    // ONE wire push: a 70B µ$ buildout opex row at minute 100. The lean
    // book's month-one runway is ≈8.1 months; the buildout drags the burn
    // denominator to ≈80B and the same t420 review reads ≈0.25 months —
    // under the 6-month covenant. The breach is CALENDAR-bound, so unlike
    // every dice-bound flip above, all five seeds stop at the same tick.
    const levered = flip("the-covenant", (wire) => {
      wire.limits.opex.push({ atMinute: 100, amountMicroUsd: 70_000_000_000, memo: "growth-buildout" });
    });
    for (const offset of [0, 1, 2, 3, 4]) {
      const report = runScenario(levered, BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("lost");
      expect(report.stopReason).toBe("lose:covenant-breached-count-above:0@420");
      expect(report.observation.covenantBreaches).toBe(1);
      expect(report.observation.deaths).toEqual([]); // the interlude ends before the grace machinery
    }
    // discriminating pair: the lean book meets the covenant at every seed.
    for (const offset of [0, 1, 2, 3, 4]) {
      const lean = runScenario(shippedScenario("the-covenant"), BASE_SEED, { seedOffset: offset });
      expect(lean.stopReason).toBe("win@480");
      expect(lean.observation.covenantBreaches).toBe(0);
    }
  });

  it("Review Bomb with twelve astroturf accounts signed → the rating crater crosses the floor", () => {
    // ONE idea, expressed as one wire push: the smear wave arrives as
    // twelve more delinquent hourly accounts (the astroturf campaign made
    // mechanical — see the wire's NON-EXPRESSIBLE note). The dunning
    // ladder kills 15–17 of the eighteen by the end; each write-off is a
    // −600 bps review, and the 1,500-bps floor is crossed in the last
    // half-hour — dice-bound per seed, the LOSS is not.
    const bombed = flip("review-bomb", (wire) => {
      const ladder = [60_000_000, 48_000_000, 36_000_000, 30_000_000, 24_000_000, 18_000_000];
      for (let i = 6; i < 18; i += 1) {
        wire.contracts.push({
          id: `rb-${String(i + 1).padStart(2, "0")}`,
          customer: `Astroturf Account ${String(i + 1)}`,
          mrcMicroUsd: ladder[i % 6],
          billingCycle: "hourly",
          termMonths: 12,
          termStartMin: 0,
          termEndMin: 30_000,
          autoRenew: true,
        });
      }
    });
    const loseTicks: number[] = [];
    for (const offset of [0, 1, 2, 3, 4]) {
      const report = runScenario(bombed, BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("lost");
      expect(report.stopReason).toMatch(/^lose:reputation-below:1500@\d+$/);
      loseTicks.push(Number(report.endMinute));
    }
    expect(loseTicks).toEqual([310, 300, 292, 299, 292]); // seed 904..908
    // discriminating pair: the six-account book never touches the floor.
    for (const offset of [0, 1, 2, 3, 4]) {
      const survived = runScenario(shippedScenario("review-bomb"), BASE_SEED, { seedOffset: offset });
      expect(survived.stopReason).toBe("win@320");
      expect(survived.observation.reputationBps >= 6000n).toBe(true);
    }
    // the eighteen-account flip is the heaviest money lane in the suite —
    // hourly invoices × 18 books × 10 runs; wall-clock budget, not a flake.
  }, 30_000);
});

describe("wave-three missions — engine truth (2026-10-13)", () => {
  it("Post-Breach: the dunning ladder grinds the six-account book to its full kill by the meeting", () => {
    // The rung-1 witness: writtenOffCustomers is not decorative. The final
    // terminations are card-failure dice armed, so the count still CREEPS in
    // the last hours — pinned per seed (four to six of the shaken accounts
    // are dead by t320, never the whole ceiling of seven), and every book
    // has converged to all-six by the cascade that follows.
    const woAtMeeting = [6, 5, 6, 4, 6];
    woAtMeeting.forEach((expected, offset) => {
      const report = runScenario(shippedScenario("post-breach-aftermath"), BASE_SEED, { seedOffset: offset });
      expect(report.stopReason).toBe("win@320");
      expect(report.observation.writtenOffCustomers).toBe(expected);
      expect(report.observation.deaths).toEqual([]);
    });
    // past the board meeting the same book dies of its own cascade —
    // falsifier that survive:320 is load-bearing: stretch the meeting to
    // seven hours (clock AND its survive line, one idea) and the churn-
    // collapse the terminations sustain arrives first, on every seed.
    const stretched = JSON.parse(JSON.stringify(SHIPPED_SCENARIO_WIRES["post-breach-aftermath"])) as {
      limits: { maxSimMinutes: number };
      objectives: { win: Record<string, unknown>[] };
    };
    stretched.limits.maxSimMinutes = 420;
    stretched.objectives.win[0] = { kind: "survive-minutes", minutes: 420 };
    const beyond = runScenario(parseScenarioDoc(stretched as unknown as ScenarioWire), BASE_SEED, {
      seedOffset: 0,
    });
    expect(beyond.stopReason).toBe("lose:death-by-cause:any@358");
    expect(beyond.observation.deaths).toEqual(["churn-collapse"]);
    expect(beyond.observation.writtenOffCustomers).toBe(6);
  });

  it("Free Tier Flood: mint-time family census is dice-free at integer rates", () => {
    // Rung-3 witness: organic and malicious arrivals are counted from the
    // arrival events' envelope attribution, so the SAME counts stand on all
    // five seeds — the ceiling that breaks at t200 is arithmetic, not luck.
    for (const offset of [0, 1, 2, 3, 4]) {
      const report = runScenario(shippedScenario("free-tier-flood"), BASE_SEED, { seedOffset: offset });
      expect(report.observation.arrivalsByFamily["organic"]).toBe(1672);
      expect(report.observation.arrivalsByFamily["malicious"]).toBe(3146);
      expect(report.observation.settledInvoices).toBe(0); // no contracts: pure traffic story
    }
  });

  it("delta witnesses: the served window actually moved in both rung-2 missions", () => {
    // Contract Recompete: recovery ladder 6→8→10→14/min makes the last
    // 60 minutes of service 840 against the opening 600 (+40%, asked +25%).
    const recompete = runScenario(shippedScenario("contract-recompete"), BASE_SEED);
    const crSums = recompete.observation.windowSums["served:60"];
    expect(crSums).toEqual({ current: 840, baseline: 600, complete: true });
    // The Sev-0: the incident crater (10→2/min) followed by the repaired
    // climb (14/min) reads 840 against 480 (+75%, asked +30%).
    const sev0 = runScenario(shippedScenario("the-sev-0"), BASE_SEED);
    const svSums = sev0.observation.windowSums["served:60"];
    expect(svSums).toEqual({ current: 840, baseline: 480, complete: true });
  });
});

describe("wave-four missions — engine truth (2026-10-13)", () => {
  it("The Covenant: the review is calendar-bound — first business-month roll is EXACTLY t420", () => {
    // The money clock crosses 43,200 biz-min at tick 420 (102.857 biz-min
    // per tick), and covenant review runs ONLY inside rollBusinessMonth.
    // So the levered arm's breach row cannot land at any other tick —
    // witness the row AND the notice move together (log/notice law at
    // tick.ts:1194-1204), while the lean arm stays at zero through the
    // whole interlude.
    const levered = flip("the-covenant", (wire) => {
      wire.limits.opex.push({ atMinute: 100, amountMicroUsd: 70_000_000_000, memo: "growth-buildout" });
    });
    const before = runScenario(levered, BASE_SEED, { tickCap: 419 });
    expect(before.stopReason).toBe("timeout@419");
    expect(before.observation.covenantBreaches).toBe(0); // no review has EVER run
    const after = runScenario(levered, BASE_SEED, { tickCap: 420 });
    expect(after.observation.covenantBreaches).toBe(1); // the roll judged
    expect(after.trace.noticesByKind["covenant-breached"]).toBe(1);
    const lean = runScenario(shippedScenario("the-covenant"), BASE_SEED);
    expect(lean.observation.covenantBreaches).toBe(0);
    expect(lean.observation.deaths).toEqual([]); // breach ≠ death inside an interlude
  });

  it("Review Bomb: the rating dies while the board never bounces a request", () => {
    // "Reputation damage happens regardless of actual uptime", made
    // mechanical: 100 slots × 2 s service on a 6/min street — every visit
    // is served on BOTH arms to the end. What differs is only the ledger:
    // write-off −600 bps vs recovery +150 bps dice. The bouncer never
    // arrives; the mob is arithmetic.
    const bombed = flip("review-bomb", (wire) => {
      const ladder = [60_000_000, 48_000_000, 36_000_000, 30_000_000, 24_000_000, 18_000_000];
      for (let i = 6; i < 18; i += 1) {
        wire.contracts.push({
          id: `rb-${String(i + 1).padStart(2, "0")}`,
          customer: `Astroturf Account ${String(i + 1)}`,
          mrcMicroUsd: ladder[i % 6],
          billingCycle: "hourly",
          termMonths: 12,
          termStartMin: 0,
          termEndMin: 30_000,
          autoRenew: true,
        });
      }
    });
    const calm = runScenario(shippedScenario("review-bomb"), BASE_SEED);
    const storm = runScenario(bombed, BASE_SEED, { tickCap: 320 }); // cap: it loses at 310
    expect(calm.trace.bounced).toBe(0);
    expect(storm.trace.bounced).toBe(0);
    expect(calm.observation.reputationBps).toBe(6850n); // dice-pinned: −600×WO +150×REC −200×CH
    expect(storm.observation.reputationBps).toBeLessThan(1500n); // crossed the floor
  }, 30_000);

  it("the rung-4 seeding re-anchor: covenant docs measure month-one burn honestly", () => {
    // Without the runner's freeAtMonthStart re-anchor, emptyEconomyState
    // starts at zero, month-one burn closes NEGATIVE (clamped to 0), the
    // runway readout is null forever, and EVERY min-direction covenant is
    // silently met. The levered arm IS the falsifier: a breach row exists.
    const levered = flip("the-covenant", (wire) => {
      wire.limits.opex.push({ atMinute: 100, amountMicroUsd: 70_000_000_000, memo: "growth-buildout" });
    });
    const lost = runScenario(levered, BASE_SEED);
    expect(lost.stopReason).toBe("lose:covenant-breached-count-above:0@420");
    // and the lean arm's review read ≈8.1 months of runway (≥6): same
    // calendar, opposite verdict — the measurement is live, not canned.
    const lean = runScenario(shippedScenario("the-covenant"), BASE_SEED);
    expect(lean.outcome).toBe("won");
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
        digests.add(reportIdentity(runScenario(doc, BASE_SEED, { tickCap: 12, corpus: corpusAuthority() })));
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

describe("shared tick fold (single home)", () => {
  it("the settle-refusal law lives ONLY in internal/tickFold.ts — both hosts call it", () => {
    const home = readFileSync(fileURLToPath(new URL("../../internal/tickFold.ts", import.meta.url)), "utf8");
    const scenario = readFileSync(fileURLToPath(new URL("../runner.ts", import.meta.url)), "utf8");
    const weekend = readFileSync(fileURLToPath(new URL("../../unattended/fastForward.ts", import.meta.url)), "utf8");
    const shape = `settle (\\S+): -(\\d+) µ\\$ on '`;
    // The law text has exactly one home…
    expect(home).toContain(shape);
    // …and must NEVER reappear in a host (that would be the pre-
    // consolidation mirror — the third copy this guard exists to refuse).
    expect(scenario).not.toContain(shape);
    expect(weekend).not.toContain(shape);
    // Both hosts route through the shared fold.
    expect(scenario).toContain("foldMoneyLaneTick");
    expect(weekend).toContain("foldMoneyLaneTick");
    expect(scenario).toContain("../internal/tickFold.ts");
    expect(weekend).toContain("../internal/tickFold.ts");
  });
});
