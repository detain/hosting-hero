/** chargeback-guard.test.ts — the L-GUARD artifact (ADR-0019 program 2):
 *  `composeSignalRows` is funding-honest under thin openings, and the
 *  §1.5 Chargeback Wave doc (hosting_game.md :3721 — the C2 channels pilot
 *  "The Chargeback Wave" / "Processor Freeze") is un-shelved as a
 *  TEST-ONLY probe on the real mission shape.
 *
 *  ROOT CAUSE (disk-verified @7c2a13e, pre-fix): the composer's cash leg
 *  posted the cfg-owned $20 fee via `postEntry` OUTSIDE both money-lane
 *  insolvency guards — inside the fold a negative-bucket throw is caught
 *  and the tick voided (tickFold catch-and-void); a scheduled opex burn
 *  the book cannot cover is refused at the tick head (refuse-not-overdraft)
 *  — the fee post had NEITHER, so once the campaign bridge re-based the
 *  doc onto 300_000_000 µ$ and the hourly dunning dice wound `free` into
 *  [0, fee), every bridge seed crashed at sim-minute 140 with
 *  `RangeError: economy/buckets: chargeback cw-04: -20000000 µ$ on 'free'
 *  (had … µ$) would go negative` (L-CP3 shelf note @5d0577b, DP fresh-ask
 *  #2). NOTE: the intake ticket's "count/winddown pair computed against
 *  the opening bankroll" hypothesis is REFUTED by the source — signal
 *  rows are doc-authored (atMinute + contractId), the fee is cfg-owned;
 *  no bankroll-derived arithmetic exists. The true hole was the unguarded
 *  post.
 *
 *  LAW PINNED HERE (both directions):
 *  - GUARD LIVE: an insolvent fee is refused with a report witness
 *    (minute/contract/fee/free — business clock, the cause-grammar minute),
 *    and ONLY the cash leg is refused — the dispute notice census, the
 *    §2.10 rating signal and the chargebacksApplied wave count all stay
 *    verbatim (the trace never drops the wave). A refusal moves no money:
 *    cashEnd equals the witness free EXACTLY — the falsifier that the
 *    posture is refuse, never clamp (a clamp would have bottomed at 0).
 *  - GUARD INERT: at the authored opening the sparse report key is absent
 *    and the run is byte-identical to pre-fix — the digest pinned below was
 *    captured from 7c2a13e in a detached worktree A/B and EQUALS the
 *    post-fix value to the hex.
 *
 *  CAMPAIGN STATUS: this probe proves the guard holds for the real
 *  chargeback-wave shape under the bridge opening. CAMPAIGN ADOPTION
 *  AWAITS A FUTURE ACT DECISION — the shelf lives in campaign/chapters.ts
 *  (the L-CP3 lane owns shelving/unshelving; a content-forbidden roster
 *  row is not this lane's call to flip).
 */
import { describe, expect, it } from "vitest";

import { encodeTaggedTree } from "../../internal/canonical.ts";
import { asRunSeed } from "../../types.ts";
import { parseScenarioDoc } from "../doc.ts";
import { runScenario, SHIPPED_SCENARIO_WIRES } from "../index.ts";
import type { ScenarioReport, ScenarioWire } from "../index.ts";

const BASE_SEED = asRunSeed(904n);

/** The campaign bridge number (chapters.ts @5d0577b): the-price-hike's
 *  authored opening, re-based onto the chargeback-wave wire exactly the
 *  way applyCarryToDoc does — a limits.initialFreeMicroUsd override. */
const BRIDGE_OPENING_MICRO_USD = 300_000_000;

type MutableWire = {
  limits: { initialFreeMicroUsd: unknown };
};

function withOpening(opening: number): ReturnType<typeof parseScenarioDoc> {
  const wire = JSON.parse(JSON.stringify(SHIPPED_SCENARIO_WIRES["chargeback-wave"])) as MutableWire;
  wire.limits.initialFreeMicroUsd = opening;
  return parseScenarioDoc(wire as unknown as ScenarioWire);
}

type FeeRefusal = NonNullable<ScenarioReport["chargebackFeeRefusals"]>[number];

function refusals(report: ScenarioReport): readonly FeeRefusal[] {
  return report.chargebackFeeRefusals ?? [];
}

/** Canonical, bigint-safe report identity (runner.test.ts reportIdentity law). */
function reportIdentity(report: ScenarioReport): string {
  return JSON.stringify(
    encodeTaggedTree(report as unknown as Record<string, unknown>, (problem) => {
      throw new Error(`scenario report not canonical: ${String(problem.kind)}`);
    }),
    (_k, v) => (typeof v === "bigint" ? `${String(v)}n` : v),
  );
}

describe("L-GUARD — composeSignalRows funding-honesty (ADR-0019 program 2)", () => {
  it("un-shelved chargeback-wave: the bridge opening runs and WINS on five offsets", () => {
    // Pre-fix this arm was the crash: all five offsets threw the buckets
    // RangeError at sim-minute 140 (worktree A/B @7c2a13e, verbatim above).
    const doc = withOpening(BRIDGE_OPENING_MICRO_USD);
    for (const offset of [0, 1, 2, 3, 4]) {
      const report = runScenario(doc, BASE_SEED, { seedOffset: offset });
      expect(report.outcome, `${report.stopReason}`).toBe("won");
      expect(report.stopReason).toBe("win@200");
      // The wave is NOT dropped: four disputes ride the observation even
      // though one fee per offset goes unpaid.
      expect(report.observation.chargebacksApplied).toBe(4);
      const refused = refusals(report);
      expect(refused.length).toBe(1);
      const refusal = refused[0]!;
      expect(refusal.contractId).toBe("cw-04");
      expect(refusal.atBusinessMinute).toBe(14_400); // m140 × 43200/7 — exact
      expect(refusal.feeMicroUsd).toBe(20_000_000n);
    }
  });

  it("refuse-not-clamp: a refused fee moves NO money — witness free == cashEnd exactly", () => {
    // The both-directions falsifier against the clamp posture: a clamp
    // would have bottomed free at 0n and moved the dunning dice downstream.
    const doc = withOpening(BRIDGE_OPENING_MICRO_USD);
    for (const offset of [0, 1, 2, 3, 4]) {
      const report = runScenario(doc, BASE_SEED, { seedOffset: offset });
      const refusal = refusals(report)[0]!;
      expect(report.cashEndMicroUsd).toBe(refusal.freeMicroUsd);
      expect(report.cashEndMicroUsd).toBeGreaterThan(0n);
    }
    // Exact self-derived witnesses for offset 0 (probe-pinned, disclosed).
    const first = runScenario(doc, BASE_SEED, { seedOffset: 0 });
    expect(first.cashEndMicroUsd).toBe(993_070n);
    expect(refusals(first)[0]!.freeMicroUsd).toBe(993_070n);
    expect(first.endDigest).toBe("5c73d1c60ab86b783b1dc90bbbdf0b03");
  });

  it("guard inert at the authored opening: no sparse key, pre-fix digest byte-ident", () => {
    const report = runScenario(withOpening(100_000_000_000), BASE_SEED, { seedOffset: 0 });
    expect(report.outcome).toBe("won");
    expect(report.observation.chargebacksApplied).toBe(4);
    // Sparse-key law: the funded report never grows the witness key.
    expect("chargebackFeeRefusals" in report).toBe(false);
    // Captured from 7c2a13e (detached worktree, pre-fix) — EQUAL post-fix
    // to the hex: the guard casts no shadow on a funded run.
    expect(report.endDigest).toBe("8bc901aa8a17facc3b1dc90bbbdf0b03");
  });

  it("unfunded wave keeps its full trace: 10M opening — four disputes, four refusals, exact rating math", () => {
    const report = runScenario(withOpening(10_000_000), BASE_SEED, { seedOffset: 0 });
    const refused = refusals(report);
    expect(refused.length).toBe(4);
    // Sorted-visit order over the four rows, business-cause minutes of the
    // sim-minute grid (floor of minute × 43200/7).
    expect(refused.map((row) => [row.contractId, row.atBusinessMinute])).toEqual([
      ["cw-01", 2057],
      ["cw-02", 6171],
      ["cw-03", 10285],
      ["cw-04", 14400],
    ]);
    for (const row of refused) {
      expect(row.feeMicroUsd).toBe(20_000_000n);
      expect(row.freeMicroUsd).toBe(500_928n);
    }
    // EVENT legs verbatim despite the fully-unpaid fees: the notice census
    // counts every posting, the §2.10 damage lands exact (5000 − 4 × 400 —
    // this seed's dunning noise is zero, a falsifiable pin), the mission
    // still weathers the wave.
    expect(report.trace.noticesByKind["chargeback-posted"]).toBe(4);
    expect(report.observation.chargebacksApplied).toBe(4);
    expect(report.observation.reputationBps).toBe(3400n);
    expect(report.cashEndMicroUsd).toBe(500_928n);
    expect(report.outcome).toBe("won");
  });

  it("determinism: report identity byte-ident ×3 fresh runs at the bridge opening", () => {
    const doc = withOpening(BRIDGE_OPENING_MICRO_USD);
    const a = runScenario(doc, BASE_SEED, { seedOffset: 2 });
    const b = runScenario(doc, BASE_SEED, { seedOffset: 2 });
    const c = runScenario(doc, BASE_SEED, { seedOffset: 2 });
    expect(reportIdentity(b)).toBe(reportIdentity(a));
    expect(reportIdentity(c)).toBe(reportIdentity(a));
    // The witness rides the canonical identity — frozen, bigint-clean.
    expect(reportIdentity(a)).toContain("20000000");
  });
});
