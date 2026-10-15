/** runner.test.ts — the mission loop proven on the twenty-six shipped
 *  §1.5 scenarios: every doc wins as authored, every doc loses when
 *  exactly one
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
 *  CHANNELS LADDER (wave five, 2026-10-13) — the INPUT channels the vocab
 *  ceiling named are now wired, and their three pilots shipped:
 *  C1. CONSUMED: door intents on the wire (`intents:` rows, validated
 *      against the door's own VERB_ARG_SHAPES by the fs drift-pin in
 *      intentGrammar.test.ts, fed to TickInputs.externalIntents exactly
 *      once each) + the executed/refused count predicates → "The
 *      Understaffed Sunday" (:3657). The spec's backlog-size score is
 *      still not an observation (§7.5 has no ticket queue), so the
 *      accumulation ARC stands in as the refusal census.
 *  C2. CONSUMED: economy host-signals (`signals:` rows folded per minute
 *      through the exported engine primitives — the step-8.5/12.45/12.5
 *      mirror) + chargeback/postmortem-credit predicates, riding the
 *      rung-5 reputation lines → "The Chargeback Wave" (:3721) stage 1
 *      and "The Slow Week After" (:4025). The processor side of the Wave
 *      (monitoring-program fines, rolling reserve, termination) has no
 *      engine field yet — stage 1 only, recorded in the wire docblock;
 *      the Slow Week's morale/credits half stays non-expressible too.
 *  C3. STILL OPEN: alternate-path routing → "The Fiber Cut" (~:3368)
 *      needs mazing-in-scenario (the maze is a gate/runner composition,
 *      not a wire field) — deliberate future ticket, do not bolt on.
 *  C4. CONSUMED (wave five, corpus invitations authority bc11697 + the
 *      real-content gate join proved in corpus.test.ts): the shared-web
 *      attack-surface law from packages/content now drives
 *      gateCorpusWave over the shipped g1 slices — invitation-gated
 *      waves leave no cursor hole, a fully invited citation replays the
 *      authored envelopes byte-ident, and an all-starved citation fails
 *      loud. RULING: this is proved as an authority-side gate property,
 *      NOT as a new mission doc — invitation state lives on the host's
 *      CorpusAuthority.buildLog, not on the wire, and the mission loop
 *      pins every doc under the PLAIN (law-free) authority by design.
 *  WAVE-FIVE CONVERSIONS (this suite's describe "wave-five conversions")
 *  ride all three fresh seams: the door's communicate cadence gets its
 *  green-site mirror ("Someone Else's Outage" :4047), the post-mortem
 *  STYLE slot + the unused honestPostmortems channel get their blame-
 *  culture story ("The RFO" :4034), and the corrupts channel (16c6add)
 *  gets its silent-queue level ("The Threshold Day" :4086) via the new
 *  `limits.corrupts` arm, the `corruptions` observation field, and the
 *  corruption-above/below predicate pair (vocab now twenty-nine).
 *  WAVE-SIX ENGINE RUNGS (2026-10-14, this suite's describe "wave-six
 *  missions") — the rungs the accepted investigation numbered past the
 *  vocab ladder:
 *  6. CONSUMED: attention denominations on the wire (limits.attention —
 *     capacity + the door's attentionCost vocabulary @eff5694; the runner
 *     mints the pool through triage-window entries at business minute 0
 *     and mirrors the fastForward calendar roll, dead-ledger authority
 *     @9ca31c3) → "The Founder Bus Factor" (:3880) shipped.
 *  7. CONSUMED (wave seven): price on the wire — contracts rows gained an
 *     optional `priceKey` ('<kind>:<id>', the door's override-key grammar
 *     mirrored module-privately in doc.ts) that registers a contract
 *     against the L1 elasticity book (@5781335); the money lane already
 *     consumes GameState.pricing.overrides via internal/tickFold.ts:346,
 *     so an adjust-price intent through the rung-8 door rail moves churn
 *     odds the moment a row names a key → "The Copycat" (:3429) shipped.
 *     The cliff dice stay cut-proof by construction: the retention factor
 *     clamps at exactly 1.0 under any discount (§5.11 law — no discount
 *     ever bought certainty), so the mission's flip answers on the MONTHLY
 *     logo-churn band alone.
 *  8. CONSUMED: the change-freeze band (limits.freeze answered by the
 *     door's canPlaceDevice / canAdjustPrice host seams) → "The Change
 *     Freeze" (:3625) shipped.
 *  9. CONSUMED (wave eight): the per-verb intent census — the intent four
 *     (executed/refused × above/below) gained an optional `verb` dimension
 *     (closed PLAYER_VERBS mirror already walled in doc.ts, BAD_ENUM on an
 *     off-roster verb). The runner folds a verb→count census off the SAME
 *     TickResult.doorReceipts stream the totals read — zero new dice, zero
 *     RNG change, absent verb keeps the exact pre-rung-9 whole-rail total
 *     (sparse: shipped wires byte-ident). Vocab stays twenty-nine kinds:
 *     this is a dimension, not a kind. → "The Understaffed Sunday (Triage
 *     Twin)" (:3657) ships as the real-wire separation witness (describe
 *     "rung 9 — the per-verb intent census" below).
 *  10. CONSUMED (wave nine): the familyMix dial — `limits.familyMix` puts
 *      the bundle's five-key familyWeights table on the wire through the
 *      waves authority (INTEGER µ-shares 0..1e6 — no floats on any wire,
 *      the canary law, converted to Fixed Q16.16 at the wall; the authority
 *      reused whole: sum ±1% checked, shares renormalised to 1,000,000 µ,
 *      zero buckets dropped as authored absences). Armed, createArrivalStep rolls identity per mint
 *      (defaults.ts:284) and the runner counts the ROLL at the arrival
 *      step's OUTPUT — a pure pass-through wrapper over the sanctioned slot
 *      override (defaults.ts:1354), the one place the rolled family is
 *      legible before the same-tick terminal purge (driver.ts:957). Engine
 *      truth recorded at the wall (doc.ts): all five families are
 *      adversarial — the dial steers WHICH flavor dominates, never benign
 *      traffic; flavors are mechanistically identical through the pipeline,
 *      so the dial's instrument is the family census itself (rung-3's own
 *      kind of story). Vocab stays twenty-nine kinds; the wire key is
 *      CONDITIONAL — unarmed docs never grow it and all 29 pre-rung wires
 *      byte-stand (the original "Free Tier Flood" label twin still reads
 *      exactly organic 1,672 / malicious 3,146 — pinned below). → "Free
 *      Tier Flood (Mix Twin)" (:3574) ships the ninety-percent story the
 *      one-envelope-per-minute law made fiction (describe "rung 10 — the
 *      familyMix dial" at the foot of this file).
 *  NO-RUNG: "Free Tier Flood (Corpus Twin)" (:3574) cites the shipped mail
 *  quarter through the tableId seam (@5df5586).
 *  Engine debt this lane reported but did not touch: internal/tickFold.ts
 *  still forwards no signal inputs — the scenario composes around it
 *  (rung-4 covenant precedent); a future fold pass-through retires the
 *  mirror docblock in runner.ts. */
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
  limits: {
    opex: unknown[];
    initialFreeMicroUsd: unknown;
    guardrails?: unknown[];
    attention?: { capacity: number; cost: Record<string, number> };
    freeze?: { fromMinute: number; toMinute: number };
    familyMix?: { weights: Record<string, number> };  };
  contracts: Record<string, unknown>[];
  traffic: {
    tableId: string;
    /** Segments profile only — never read for a corpus wire (the waves
     *  field below is that shape's home; the clone is plain JSON either
     *  way, this type is surgical convenience, not a wall). */
    segments: Record<string, unknown>[];
    waves?: number[];
    waveStartMinute?: number;
    baselineRatePerMin?: number;
  };
  intents?: Record<string, unknown>[];
  signals?: {
    majorIncidents?: Record<string, unknown>[];
    honestPostmortems?: Record<string, unknown>[];
    postmortems?: Record<string, unknown>[];
    chargebacks?: Record<string, unknown>[];
  };
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
  }, 30_000); // twelve-account × ten 320-clock runs sit at ~5.1s on a loaded box — the Chargeback-Wave clock precedent

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

describe("wave-five missions — one-flip losses (channels ladder)", () => {
  function drowningRail(): ReturnType<typeof shippedScenario> {
    return flip("understaffed-sunday", (wire) => {
      wire.intents = Array.from({ length: 36 }, (_unused, i) => ({
        atTick: 5 + i,
        verb: "communicate",
        args: { target: null, note: `sunday-ticket-${String(i + 1).padStart(2, "0")}` },
      }));
    });
  }

  it("Understaffed Sunday answering every minute → the rail drowns in refusals", () => {
    // ONE change: the ticket rail's cadence. Every-other-tick answering
    // fits a capacity-1 hand's 2-tick occupation exactly; answering every
    // minute leaves the on-call hand busy on alternate ticks and the
    // 6-refusal ceiling snaps at the SAME tick on every seed — hands are
    // arithmetic, not dice.
    const drowning = drowningRail();
    for (const offset of [0, 1, 2, 3, 4]) {
      const report = runScenario(drowning, BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("lost");
      expect(report.stopReason).toBe("lose:intents-refused-above:6@18");
      expect(report.observation.intentsExecuted).toBe(7);
      expect(report.observation.intentsRefused).toBe(7);
    }
    // discriminating pair: the authored cadence answers all eighteen with
    // a silent refusal column — the Sunday that was, in fact, coverable.
    for (const offset of [0, 1, 2, 3, 4]) {
      const calm = runScenario(shippedScenario("understaffed-sunday"), BASE_SEED, { seedOffset: offset });
      expect(calm.stopReason).toBe("win@40");
      expect(calm.observation.intentsExecuted).toBe(18);
      expect(calm.observation.intentsRefused).toBe(0);
    }
  });

  it("Chargeback Wave with twenty-four disputes → the rating floor is crossed", () => {
    // ONE wire line: the dispute ledger gets a second page (20 more rows
    // cycling the same four accounts). The hourly accounts keep paying —
    // recoveries outrun terminations, which is why the authored 4-dispute
    // arm floats at 6,100–8,350 bps — but 24 × −400 drags the rating under
    // 1,500 in the last third. Fire minutes are dice-bound per seed; the
    // LOSS is not.
    const buried = flip("chargeback-wave", (wire) => {
      const rows = wire.signals?.chargebacks;
      if (rows === undefined) throw new Error("wire lost its signal rows");
      for (let i = 0; i < 20; i += 1) {
        rows.push({ atMinute: 150 + i * 2, contractId: `cw-0${String((i % 4) + 1)}` });
      }
    });
    const loseTicks: number[] = [];
    const disputesAtStop: number[] = [];
    for (const offset of [0, 1, 2, 3, 4]) {
      const report = runScenario(buried, BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("lost");
      expect(report.stopReason).toMatch(/^lose:reputation-below:1500@\d+$/);
      loseTicks.push(Number(report.endMinute));
      disputesAtStop.push(report.observation.chargebacksApplied);
    }
    expect(loseTicks).toEqual([176, 170, 172, 180, 170]); // seed 904..908
    expect(disputesAtStop).toEqual([18, 15, 16, 20, 15]); // the stop freezes the count mid-page
    for (const offset of [0, 1, 2, 3, 4]) {
      const calm = runScenario(shippedScenario("chargeback-wave"), BASE_SEED, { seedOffset: offset });
      expect(calm.stopReason).toBe("win@200");
      expect(calm.observation.chargebacksApplied).toBe(4);
      expect(calm.observation.reputationBps).toBeGreaterThanOrEqual(6100n);
    }
  }, 30_000);

  it("The Slow Week After filing with two changes in flight → ambiguous card, no floor", () => {
    // ONE field: changesInFlight 0 → 2 crosses the attribution ceiling
    // (cfg.postMortem.maxAttributableChanges = 1). The SAME card, one
    // field lazier, credits nothing, never stands the honest-host floor,
    // and the second declared incident costs full price — −500 instead of
    // the floored −250 — crossing the 4,400 line the minute it lands.
    const fudged = flip("the-slow-week-after", (wire) => {
      const row = wire.signals?.postmortems?.[0];
      if (row === undefined) throw new Error("wire lost its filing");
      row.changesInFlight = 2;
    });
    for (const offset of [0, 1, 2, 3, 4]) {
      const report = runScenario(fudged, BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("lost");
      expect(report.stopReason).toBe("lose:reputation-below:4400@60");
      expect(report.observation.postmortemCreditsBps).toBe(0n);
      expect(report.observation.reputationBps).toBe(4000n); // 5000 −500 −500, floor never stood
      expect(report.trace.noticesByKind["postmortem-unattributed"]).toBe(1);
    }
    for (const offset of [0, 1, 2, 3, 4]) {
      const clean = runScenario(shippedScenario("the-slow-week-after"), BASE_SEED, { seedOffset: offset });
      expect(clean.stopReason).toBe("win@100");
      expect(clean.observation.postmortemCreditsBps).toBe(250n);
      expect(clean.observation.reputationBps).toBe(4500n); // −500 +250 −250(halved by the floor)
      expect(clean.observation.deaths).toEqual([]); // the monthly book keeps churn-collapse silent
    }
  });
});

describe("rung 9 — the per-verb intent census separates what the total cannot", () => {
  // The triage twin (:3657 re-read): one hand, two calls, three runbook
  // knob-walks. The authored arm refuses a CALL; the one-tick flip (answering
  // the second call at t7 instead of t6) moves the collision onto the first
  // knob-walk and dies at t8. Both arms show EXACTLY ONE refusal — every
  // total-based `intents-refused-*` line answers identically on both (the
  // arithmetic proof lives in objectives.test.ts); only the verb census
  // knows which promise died. Zero dice: rate-0 traffic, door path seed-free.
  function lateAnswerFlip(): ReturnType<typeof shippedScenario> {
    return flip("understaffed-sunday-triage", (wire) => {
      const rail = wire.intents;
      if (rail === undefined) throw new Error("wire lost its rail");
      rail[1]!.atTick = 7;
    });
  }

  it("authored arm: runbook survives, a call drops — won@12 on five offsets", () => {
    for (const offset of [0, 1, 2, 3, 4]) {
      const report = runScenario(shippedScenario("understaffed-sunday-triage"), BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("won");
      expect(report.stopReason).toBe("win@12");
      expect(report.observation.intentsExecuted).toBe(4);
      expect(report.observation.intentsRefused).toBe(1); // the TOTAL any pre-rung-9 line can see
      expect(report.observation.intentsExecutedByVerb).toEqual({ "configure-node": 3, communicate: 1 });
      expect(report.observation.intentsRefusedByVerb).toEqual({ communicate: 1 });
    }
  });

  it("flipped arm: the RUNBOOK is what drops — lose@8 on five offsets, same refusal total", () => {
    const drowned = lateAnswerFlip();
    for (const offset of [0, 1, 2, 3, 4]) {
      const report = runScenario(drowned, BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("lost");
      expect(report.stopReason).toBe("lose:intents-refused-above:configure-node:0@8");
      expect(report.observation.intentsRefused).toBe(1); // identical total to the won arm
      expect(report.observation.intentsRefusedByVerb).toEqual({ "configure-node": 1 });
      expect(report.observation.intentsExecutedByVerb).toEqual({ communicate: 2 });
      // the rung-9 lose row is the discriminator; the line names its verb.
      const row = report.objectives.lose.find(
        (r) => r.predicate.kind === "intents-refused-above" && r.predicate.verb === "configure-node",
      );
      expect(row?.holds).toBe(true);
    }
  });

  it("the sparse law holds on the quiet rails: absent-verb censuses stay empty", () => {
    // Missions with no door feed read {} on both census maps — the exact
    // pre-rung-9 predicate-EVALUATION shape (EMPTY_OBSERVATION carries the
    // two keys always-present with frozen empty maps; the observation key
    // set grew at rung 9, no digest covers it — zero goldens rode the rung).
    const calm = runScenario(shippedScenario("the-long-weekend"), BASE_SEED);
    expect(calm.observation.intentsExecutedByVerb).toEqual({});
    expect(calm.observation.intentsRefusedByVerb).toEqual({});
    // And the original Sunday's all-communicate rail reads a single-verb map
    // whose values sum to the total — one receipt stream, two views.
    const sunday = runScenario(shippedScenario("understaffed-sunday"), BASE_SEED);
    const sum = Object.values(sunday.observation.intentsExecutedByVerb).reduce((a, b) => a + b, 0);
    expect(sum).toBe(sunday.observation.intentsExecuted); // 18 — the :1025 pin's own rail
    expect(sunday.observation.intentsExecutedByVerb).toEqual({ communicate: 18 });
  });
});

describe("wave-five missions — engine truth (channels)", () => {
  it("receipt counts and the event ledger agree — two authorities, one story", () => {
    const calm = runScenario(shippedScenario("understaffed-sunday"), BASE_SEED);
    expect(calm.trace.eventsByKind["intent-executed"]).toBe(calm.observation.intentsExecuted);
    expect(calm.trace.eventsByKind["intent-refused"]).toBeUndefined(); // nothing refused to event
    const drowned = runScenario(
      flip("understaffed-sunday", (wire) => {
        wire.intents = Array.from({ length: 12 }, (_unused, i) => ({
          atTick: 5 + i,
          verb: "communicate",
          args: { target: null, note: `rail-${String(i + 1).padStart(2, "0")}` },
        }));
      }),
      BASE_SEED,
      { tickCap: 30 },
    );
    expect(drowned.trace.eventsByKind["intent-refused"]).toBe(drowned.observation.intentsRefused);
    expect(drowned.observation.intentsRefused).toBeGreaterThan(0);
  });

  it("the raw assertion channel moves the rating WITHOUT the log the credits predicate reads", () => {
    // Two doors to the same +250 and the same honest-host floor — and the
    // ONLY difference is the adjudicated row. Swap the filing for an
    // honestPostmortems claim of the same cause: the rating math is
    // identical, postmortemCreditsBps stays 0, and the authored win line
    // (postmortem-credits-above:250) can never fire.
    const asserted = flip("the-slow-week-after", (wire) => {
      if (wire.signals === undefined) throw new Error("wire lost its signals");
      wire.signals.postmortems = [];
      wire.signals.honestPostmortems = [{ atMinute: 40, cause: "scenario:incident:20:0" }];
    });
    const report = runScenario(asserted, BASE_SEED, { tickCap: 120 });
    expect(report.stopReason).toBe("timeout@120"); // the credit line never closes the win
    expect(report.observation.reputationBps).toBe(4500n);
    expect(report.observation.postmortemCreditsBps).toBe(0n);
    expect(report.trace.noticesByKind["postmortem-filed"]).toBeUndefined();
  });

  it("a dispute costs exactly the engine's fee — twin arm differs by 4 × 20 Mµ$", () => {
    // The composition adds NO hidden mechanics: same seed, same books, the
    // ONLY difference is the four signal rows. Invoice dice are cash-free,
    // so every settle matches; cash differs by exactly 4 ×
    // cfg.fees.chargebackFeeMicroUsd and the rating by 4 × 400 bps.
    const bare = flip("chargeback-wave", (wire) => {
      if (wire.signals !== undefined) wire.signals.chargebacks = [];
    });
    const paid = runScenario(shippedScenario("chargeback-wave"), BASE_SEED, { tickCap: 200 });
    const twin = runScenario(bare, BASE_SEED, { tickCap: 200 });
    expect(paid.observation.chargebacksApplied).toBe(4);
    expect(twin.observation.chargebacksApplied).toBe(0);
    expect(paid.observation.settledInvoices).toBe(twin.observation.settledInvoices);
    expect(twin.observation.cashFreeMicroUsd - paid.observation.cashFreeMicroUsd).toBe(80_000_000n);
    expect(twin.observation.reputationBps - paid.observation.reputationBps).toBe(1600n);
  }, 30_000);

  it("no intents on the wire means ZERO door traffic on a classic mission", () => {
    const lw = runScenario(shippedScenario("the-long-weekend"), BASE_SEED, { tickCap: 30 });
    expect(lw.observation.intentsExecuted).toBe(0);
    expect(lw.observation.intentsRefused).toBe(0);
    expect(lw.observation.chargebacksApplied).toBe(0);
    expect(lw.observation.postmortemCreditsBps).toBe(0n);
  });
});

describe("wave-five conversions — outage grace, blame culture, the silent queue", () => {
  it("Someone Else's Outage packing burst B to every minute → grace snaps at t26", () => {
    // ONE spacing sin: burst B's rows move from every-other-tick
    // (25,27,29,31,33) to one-per-minute (25,26,27,28,29), the way a real
    // inbox arrives when someone else's region falls. The capacity-1 hand
    // is still busy from the t25 reply when t26 asks, and the authored
    // refused-below:1 line makes a single refusal terminal. Hands are
    // arithmetic: exact on all five seed offsets.
    const packed = flip("someone-elses-outage", (wire) => {
      const rows = wire.intents;
      if (rows === undefined) throw new Error("wire lost its rail");
      rows.splice(6, 4,
        { atTick: 26, verb: "communicate", args: { target: null, note: "r-b-2" } },
        { atTick: 27, verb: "communicate", args: { target: null, note: "r-b-3" } },
        { atTick: 28, verb: "communicate", args: { target: null, note: "r-b-4" } },
        { atTick: 29, verb: "communicate", args: { target: null, note: "r-b-5" } },
      );
    });
    for (const offset of [0, 1, 2, 3, 4]) {
      const report = runScenario(packed, BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("lost");
      expect(report.stopReason).toBe("lose:intents-refused-above:0@26");
      expect(report.observation.intentsExecuted).toBe(6);
      expect(report.observation.intentsRefused).toBe(1);
    }
    // discriminating pair: the authored cadence answers all fifteen with
    // a zero refusal column — AND zero bounces, the green-site premise.
    for (const offset of [0, 1, 2, 3, 4]) {
      const calm = runScenario(shippedScenario("someone-elses-outage"), BASE_SEED, { seedOffset: offset });
      expect(calm.stopReason).toBe("win@60");
      expect(calm.observation.intentsExecuted).toBe(15);
      expect(calm.observation.intentsRefused).toBe(0);
      expect(calm.observation.bounces).toBe(0);
    }
  });

  it("The RFO printing a finger-pointing doc → the second outage lands at full price", () => {
    // ONE word: style blameless → blame. The doc is still logged and
    // read (postmortem.ts books the row), but an uncredited filing pays
    // ZERO reputation and never stands the honest-host floor — so the
    // m60 major lands −500 on 4,500 instead of the floored −250, and the
    // authored reputation-above:4500 knife-edge (the halved hit) snaps
    // the minute the second incident posts. Money is a meter here; the
    // clip is dice-free, exact ×5.
    const pointed = flip("the-rfo", (wire) => {
      const row = wire.signals?.postmortems?.[0];
      if (row === undefined) throw new Error("wire lost its filing");
      row.style = "blame";
    });
    for (const offset of [0, 1, 2, 3, 4]) {
      const report = runScenario(pointed, BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("lost");
      expect(report.stopReason).toBe("lose:reputation-below:4500@60");
      expect(report.observation.postmortemCreditsBps).toBe(0n); // blame pays nothing
      expect(report.observation.reputationBps).toBe(4000n); // 5000 −500 −500, floor never stood
    }
    // the authored blameless run: the filing credits 250, the floor
    // halves the m60 hit to −250 landing EXACTLY on 4,500 (which the
    // below:4500 line reads as not-below), and the m70 transparency
    // claim lifts the close to 4,750 — while postmortem-credits-above:200
    // stays a witness of the FILING, not of the speech (the honest row
    // books no credit).
    for (const offset of [0, 1, 2, 3, 4]) {
      const calm = runScenario(shippedScenario("the-rfo"), BASE_SEED, { seedOffset: offset });
      expect(calm.stopReason).toBe("win@100");
      expect(calm.observation.reputationBps).toBe(4750n);
      expect(calm.observation.postmortemCreditsBps).toBe(250n);
      expect(calm.trace.noticesByKind["postmortem-filed"]).toBe(1);
    }
  });

  it("The Threshold Day growing one arrival past the line → the census doubles in silence", () => {
    // ONE row of the traffic graph: 6/min becomes 7/min at m100. The
    // board serves five; the corrupts channel makes NO bounce noise, so
    // the only truth is the corruption counter. Deterministic arithmetic
    // (integer rates + certainty dial + zero retries) — the SAME census
    // on every seed offset, and the same crossing tick.
    const seventh = flip("the-threshold-day", (wire) => {
      const step = wire.traffic.segments[1];
      if (step === undefined) throw new Error("wire lost its second step");
      step.ratePerMin = 7;
    });
    for (const offset of [0, 1, 2, 3, 4]) {
      const report = runScenario(seventh, BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("lost");
      expect(report.stopReason).toBe("lose:corruption-above:149@153");
      expect(report.observation.bounces).toBe(0); // the green dashboard lies to the end
    }
    // the authored sixth-per-minute arm: 105 corruptions at the clock,
    // identical on all five offsets, and still zero bounces — the whole
    // loss is a number the bounce-era HUD never shows.
    const censuses: number[] = [];
    for (const offset of [0, 1, 2, 3, 4]) {
      const calm = runScenario(shippedScenario("the-threshold-day"), BASE_SEED, { seedOffset: offset });
      expect(calm.stopReason).toBe("win@160");
      expect(calm.observation.bounces).toBe(0);
      censuses.push(calm.observation.corruptions);
    }
    expect(censuses).toEqual([105, 105, 105, 105, 105]); // dice-free: the telegraph was arithmetic
  });
});

describe("wave-six missions — the taxed rail, the tape, the cited flood", () => {
  it("Founder Bus Factor with ONE attention hand → every second thought dies at t12", () => {
    // ONE number: limits.attention.capacity 2 → 1. The rail is unchanged;
    // the (communicate, configure) pairs still land at t5..t24, but now
    // the odd-minute configure rows arrive while the handover minute owns
    // the only token — refusals at t6, t8, t10, t12 and the authored
    // refused-above:3 line snaps at the fourth. Pure door arithmetic
    // (rate-0 traffic never rolls the arrival dice): identical on all
    // five seed offsets, the understaffed-sunday :3657 @110f516 law.
    const solo = flip("the-founder-bus-factor", (wire) => {
      const attention = wire.limits.attention;
      if (attention === undefined) throw new Error("wire lost its pool");
      attention.capacity = 1;
    });
    for (const offset of [0, 1, 2, 3, 4]) {
      const report = runScenario(solo, BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("lost");
      expect(report.stopReason).toBe("lose:intents-refused-above:3@12");
      expect(report.observation.intentsExecuted).toBe(4);
      expect(report.observation.intentsRefused).toBe(4);
    }
    // discriminating pair: capacity 2 flows the WHOLE queue — 20 of 20
    // rows, zero refusals, on every offset. The two hands were enough;
    // the myth the loanLedger deepens is that they ever are again.
    for (const offset of [0, 1, 2, 3, 4]) {
      const calm = runScenario(shippedScenario("the-founder-bus-factor"), BASE_SEED, { seedOffset: offset });
      expect(calm.stopReason).toBe("win@40");
      expect(calm.observation.intentsExecuted).toBe(20);
      expect(calm.observation.intentsRefused).toBe(0);
    }
  });

  it("The Change Freeze deploying under the tape → the refusal lands at t75", () => {
    // ONE number: the probe deploy moves from t20 (legal, pre-band) to
    // t75 (under the tape, inside [60,120]). The door's canPlaceDevice
    // host seam answers `placement-rejected: change-freeze` at the exact
    // beat — zero dice, zero money lane, identical ×5. Everything else on
    // the wire is byte-identical to the authored, patient mission whose
    // knob-only fix (configure at t70, shed at t80, words at t90) is
    // EXACTLY what the spec's day-3 break asks for.
    const tempted = flip("the-change-freeze", (wire) => {
      const probe = wire.intents?.[0];
      if (probe === undefined) throw new Error("wire lost its probe deploy");
      probe.atTick = 75;
    });
    for (const offset of [0, 1, 2, 3, 4]) {
      const report = runScenario(tempted, BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("lost");
      expect(report.stopReason).toBe("lose:intents-refused-above:0@75");
      expect(report.observation.intentsRefused).toBe(1);
    }
    // the authored arm: deploys land OUTSIDE the band (t20 pre-freeze,
    // t150 post-thaw), knobs land INSIDE it, and the tape never fires —
    // the hazard-tape contract, quiet on all five offsets.
    for (const offset of [0, 1, 2, 3, 4]) {
      const calm = runScenario(shippedScenario("the-change-freeze"), BASE_SEED, { seedOffset: offset });
      expect(calm.stopReason).toBe("win@240");
      expect(calm.observation.intentsExecuted).toBe(5);
      expect(calm.observation.intentsRefused).toBe(0);
    }
  });

  it("Free Tier Flood (Corpus Twin) citing the brute-squad wave → the abuse ceiling snaps", () => {
    // ONE citation added: waves [1,4] → [1,2,4] pulls the mail quarter's
    // wave-2 storm band (vulnerable-plugin-compromise + wp-login-brute-
    // squad, both malicious-family) into the queue. The authored band
    // (drizzle + mimic) holds 145–149 malicious mints — twenty-five-plus
    // of margin under the 176 ceiling; the added storm breaks the
    // 175-floor crossing at t[39,39,38,35,35], the content's own
    // waveStream dice deciding the beat inside a one-minute spread (the
    // metastable-corpus banded-witness law @5df5586 — the RATES are the
    // content's; if the corpus retunes, this mission retunes with it).
    const flooded = flip("free-tier-flood-corpus", (wire) => {
      wire.traffic.waves = [1, 2, 4];
    });
    const loseTicks: number[] = [];
    for (const offset of [0, 1, 2, 3, 4]) {
      const report = runScenario(flooded, BASE_SEED, { seedOffset: offset, corpus: corpusAuthority() });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("lost");
      expect(report.stopReason).toMatch(/^lose:family-arrivals-above:malicious:175@\d+$/);
      loseTicks.push(Number(report.endMinute));
    }
    expect(loseTicks).toEqual([39, 39, 38, 35, 35]); // seed 904..908
    // the authored citation: every offset wins with the organic trickle
    // fully deterministic (integer 8/min × 240 = 1,920 — the rate never
    // rolls the dice) and the malicious census inside its probed band.
    const censuses: number[] = [];
    for (const offset of [0, 1, 2, 3, 4]) {
      const calm = runScenario(shippedScenario("free-tier-flood-corpus"), BASE_SEED, {
        seedOffset: offset,
        corpus: corpusAuthority(),
      });
      expect(calm.stopReason).toBe("win@240");
      expect(calm.observation.arrivalsByFamily["organic"]).toBe(1920);
      censuses.push(calm.observation.arrivalsByFamily["malicious"] ?? 0);
    }
    expect(censuses).toEqual([147, 149, 149, 145, 147]); // content-owned rates, probe-pinned
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

describe("wave-seven missions — price elasticity (rung 7)", () => {
  /* The Copycat (§1.5 :3429). The shipped wire cuts the shield plan to
   * 85% at t30 (outside the ±10% dead band → churn floor 450→416 bps);
   * the flip softens the SAME intent to 95% (inside the band → every
   * elasticity factor is exactly 10_000 → applyFactorBps identity → the
   * dice answer on the raw floor). One wire field moves; the money lane
   * is byte-ident elsewhere. */

  const CUT_15 = 30_600_000_000;
  const CUT_5 = 34_200_000_000;
  const flipPrice = (microUsd: number) =>
    flip("the-copycat", (w) => {
      const intent = w.intents?.[0] as { args: Record<string, unknown> } | undefined;
      if (intent === undefined) throw new Error("copycat wire lost its adjust-price row");
      intent.args.newPriceMicroUsd = microUsd;
    });

  const FLIP_TICKS = [420, 840, 1260, 1680, 2520] as const;

  it("the 5% (dead-band) flip churns the whale at the raw-floor month on all five seeds", () => {
    for (const offset of [0, 1, 2, 3, 4]) {
      const report = runScenario(flipPrice(CUT_5), BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("lost");
      expect(report.stopReason).toBe(`lose:churn-above:0@${FLIP_TICKS[offset]}`);
    }
  });

  it("zero-roll control — the dead-band flip behaves EXACTLY like never cutting at all", () => {
    // Inside the band no dice is re-weighted (identity factor), so the
    // timid cut and the silent book must answer with the same ticks.
    // (End digests differ: the flip arm really spent the hand, wrote the
    // book row, and bills 5% less — the CONTROL is the churn clock.)
    const silent = flip("the-copycat", (w) => {
      w.intents = [];
    });
    for (const offset of [0, 1, 2, 3, 4]) {
      const timid = runScenario(flipPrice(CUT_5), BASE_SEED, { seedOffset: offset });
      const none = runScenario(silent, BASE_SEED, { seedOffset: offset });
      expect(none.stopReason).toBe(timid.stopReason);
    }
  });

  it("the 15% (out-of-band) cut saves the whale exactly where the die landed in the band", () => {
    // Offsets 0-2: the shipped arm wins the full clock while the flip
    // churns at month one/two/three — elasticity, not luck, moved that
    // die's reach. Offsets 3-4 roll UNDER 416 too (both arms churn, the
    // mission docblock records it; win coverage is the suite-standard
    // offsets 0-2 loop above).
    for (const offset of [0, 1, 2]) {
      const brave = runScenario(flipPrice(CUT_15), BASE_SEED, { seedOffset: offset });
      expect(brave.stopReason).toBe(`win@${brave.endMinute}`);
      const timid = runScenario(flipPrice(CUT_5), BASE_SEED, { seedOffset: offset });
      expect(timid.stopReason).toBe(`lose:churn-above:0@${FLIP_TICKS[offset]}`);
    }
  });

  /* The Ransom Customer (§1.5 :3984). Paying is an opex row, refusing is
   * deleting it; the mail-quarter storm is IDENTICAL in both worlds —
   * response-conditional traffic is a blocking primitive (honest v1), so
   * the flip is scored purely on the ledger corridor. */

  const RANSOM_CROSSES = [180, 185, 184, 182, 180] as const;

  it("dropping the ransom row crosses the 167 Mµ$ ceiling at the pinned ticks", () => {
    const unpaid = flip("the-ransom-customer", (w) => {
      w.limits.opex = [];
    });
    for (const offset of [0, 1, 2, 3, 4]) {
      const report = runScenario(unpaid, BASE_SEED, { seedOffset: offset, corpus: corpusAuthority() });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("lost");
      expect(report.stopReason).toBe(`lose:cash-above:167000000@${RANSOM_CROSSES[offset]}`);
    }
  });

  it("the ransom never truncates the storm — bounce census is arm-blind to the crossing tick", () => {
    const paid = shippedScenario("the-ransom-customer");
    const unpaid = flip("the-ransom-customer", (w) => {
      w.limits.opex = [];
    });
    for (const offset of [0, 1, 2, 3, 4]) {
      const cap = RANSOM_CROSSES[offset] ?? RANSOM_CROSSES[0];
      const opts = { seedOffset: offset, corpus: corpusAuthority(), tickCap: cap };
      const p = runScenario(paid, BASE_SEED, opts);
      const u = runScenario(unpaid, BASE_SEED, opts);
      expect(u.observation.bounces).toBe(p.observation.bounces);
    }
  });
});

describe("rung 10 — the familyMix dial (composition on the wire)", () => {
  /* The dial's honest v0 scope (doc.ts familyMix row): all five authored
   * families are ADVERSARIAL and mechanistically identical through the
   * pipeline — the dial steers which flavor dominates, and the family
   * census is the instrument that reads it. These legs pin exactly that:
   * composition arithmetic, conservation over the mint ledger, the label
   * cover story ignored when armed, and zero movement for the 29 unarmed
   * pre-rung wires. */
  it("the shipped mix counts the ROLL, not the label — and conserves mints", () => {
    for (const offset of [0, 1, 2, 3, 4]) {
      const report = runScenario(shippedScenario("free-tier-flood-mix"), BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("won");
      expect(report.stopReason).toBe("win@240");
      const census = report.observation.arrivalsByFamily;
      // The cover story is intact and IGNORED: the segments all say
      // "organic", yet not one mint rolled organic — the dial rolled it.
      expect(census.organic, `offset ${offset}`).toBeUndefined();
      // 90/5/5 within sampling noise, every offset inside both bands.
      expect(census.customerAsThreat).toBeGreaterThan(4000);
      expect(census.customerAsThreat).toBeLessThan(4700);
      expect(census.human).toBeGreaterThan(120);
      // Conservation: the census IS the mint ledger. Integer rates make
      // 4,818 arrivals exact; the family die re-rolls IDENTITIES only.
      const total = Object.values(census).reduce((a, b) => a + b, 0);
      expect(total).toBe(4818);
      expect(report.trace.eventsByKind["arrival"]).toBe(4818);
    }
  }, 30_000);

  it("the certainty flip crosses the ceiling at EXACTLY t236 on every seed", () => {
    // One field — the dial itself — to certainty abuse: every mint rolls
    // abuser, so the census equals cumulative arrivals and the crossing is
    // dice-FROZEN arithmetic (4,688 at t235, 4,714 at t236). The flip
    // discriminates through the elasticity of COMPOSITION, not seed luck:
    // the same exact tick on all five probed offsets.
    const total = flip("free-tier-flood-mix", (w) => {
      if (w.limits.familyMix === undefined) throw new Error("wire lost its dial");
      w.limits.familyMix.weights = { customerAsThreat: 1_000_000, entropic: 0, human: 0, malicious: 0, systemic: 0 };
    });
    for (const offset of [0, 1, 2, 3, 4]) {
      const report = runScenario(total, BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `offset ${offset} → ${report.stopReason}`).toBe("lost");
      expect(report.stopReason).toBe("lose:family-arrivals-above:customerAsThreat:4700@236");
      expect(report.observation.arrivalsByFamily).toEqual({ customerAsThreat: 4714 });
    }
  }, 30_000);

  it("control: delete the dial and the story is untellable — labels stay organic, timeout@240", () => {
    // The attribution is load-bearing: without limits.familyMix the same
    // wire counts envelope LABELS (all organic), the abuse floor never
    // closes the win, and the ceiling never opens the loss.
    const bare = flip("free-tier-flood-mix", (w) => {
      delete w.limits.familyMix;
    });
    const report = runScenario(bare, BASE_SEED);
    expect(report.outcome).toBe("timeout");
    expect(report.stopReason).toBe("timeout@240");
    expect(report.observation.arrivalsByFamily).toEqual({ organic: 4818 });
  }, 30_000);

  it("the wall refuses tables it could never roll", () => {
    // Floats never ride a scenario wire (canary determinism law, the same
    // reason money is integer µ$): 0.9 is refused even though it is the
    // bundle-side fraction form the waves authority itself would take.
    expect(() =>
      flip("free-tier-flood-mix", (w) => {
        if (w.limits.familyMix === undefined) throw new Error("wire lost its dial");
        w.limits.familyMix.weights = { customerAsThreat: 0.9, entropic: 0, human: 0.05, malicious: 0, systemic: 0.05 };
      }),
    ).toThrow(/no floats on the wire/);
    expect(() =>
      flip("free-tier-flood-mix", (w) => {
        if (w.limits.familyMix === undefined) throw new Error("wire lost its dial");
        w.limits.familyMix.weights = { customerAsThreat: 0, entropic: 0, human: 0, malicious: 0, systemic: 0 };
      }),
    ).toThrow(/BAD_LIMITS/);
    expect(() =>
      flip("free-tier-flood-mix", (w) => {
        if (w.limits.familyMix === undefined) throw new Error("wire lost its dial");
        w.limits.familyMix.weights = { customerAsThreat: 450_000, entropic: 0, human: 50_000, malicious: 0, systemic: 50_000 };
      }),
    ).toThrow(/BAD_LIMITS/);
    expect(() =>
      flip("free-tier-flood-mix", (w) => {
        if (w.limits.familyMix === undefined) throw new Error("wire lost its dial");
        (w.limits.familyMix as Record<string, unknown>).extra = true;
      }),
    ).toThrow(/BAD_LIMITS/);
  });

  it("sparse law: unarmed docs never grow the key — all 29 pre-rung wires byte-stand", () => {
    for (const id of SHIPPED_SCENARIO_IDS) {
      if (id === "free-tier-flood-mix") continue;
      expect(shippedScenario(id).limits.familyMix, id).toBeUndefined();
    }
    // The rung-3 label twin reads its exact pre-rung census: the observer
    // wrapper is not in its path at all (organic 1,672 + malicious 3,146,
    // the b5017df figures, unmoved).
    const label = runScenario(shippedScenario("free-tier-flood"), BASE_SEED);
    expect(label.observation.arrivalsByFamily).toEqual({ malicious: 3146, organic: 1672 });
  }, 30_000);
});
