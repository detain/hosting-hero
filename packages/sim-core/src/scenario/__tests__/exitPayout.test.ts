/** exitPayout.test.ts — L-V2 (money-at-the-end 2/3, §1.6): the runner's
 *  declared-exit payout is a pure close read over ALREADY-ROLLED engine truth.
 *
 *  The drill is a c-7-class rail (chapters.ts the-long-sale, read-only study):
 *  one priceKey'd account at 50M MRC, four sixty-cent asks. Every acceptance
 *  on the SAME key amends the persisted verdict (economy/sell.ts fingerprint =
 *  shippedAtTick), so the headline is the Σ over the VERDICT MAP — the closed
 *  offer (30M), not four times the asking price. That reading IS the
 *  notice-shape law (tick.ts step 5.5, pinned by economy sell-accept.test
 *  "notice shape"): the verdict map is the at-close authority post-amendment.
 *
 *  What gets pinned at scenario altitude:
 *   - the payout rides ONLY a won close whose win line carried the
 *     sell-accepted grammar AND a config declaration (timeout/loss/sale-less
 *     win arms grow no key);
 *   - zero new dice: bare vs declared reports are byte-ident apart from the
 *     sparse key, endDigest included, on every offset (×100 twin);
 *   - the never-above-headline clamp (hg:5615 diligence posture) and the
 *     always-present exit-kind leg; the runner seam accepts ALL SEVEN kinds
 *     (wind-down slices to exactly 0 — the campaign parse wall, doc.ts
 *     RESERVED, is what keeps that kind from ever being declared in play;
 *     documented division of labor, economy/config.ts exitKindFactorBps);
 *   - the PRE-TICK-1 exitDeclaration wall (config-side BAD_ENUM naming the
 *     seven — a typo dies before the run, never silently pays nothing);
 *   - all 31 shipped registry wires digest byte-stand declared (they carry no
 *     sell-accepted win line ⇒ the key never appears; sellCatalog roster law).
 *
 *  Probe-pinned literals (this engine build, BASE_SEED 904, every offset
 *  0..4): stopReason win:sell-accepted-above:0@60, verdicts {accepted:4,
 *  refused:0}, churn/written-off 0, reputationBps 5000, headline 30M, slice
 *  12M, adjustments [concentration 7500, exit-kind 8000, reputation 9000,
 *  term-coverage 5000] — the slice-floor clamp (5000) binding before the
 *  pe-bolt-on kind factor (8000): 30M × floor(0.50) × 0.80 = 12M.
 */
import { describe, expect, it } from "vitest";

import {
  SHIPPED_SCENARIO_IDS,
  parseScenarioDoc,
  runScenario,
  shippedScenario,
} from "../index.ts";
import type { ScenarioReport } from "../index.ts";
import { asRunSeed } from "../../types.ts";
import { VALUATION_ADJUSTMENT_BASES, VALUATION_EXIT_KINDS } from "../../economy/index.ts";
import { corpusAuthority } from "./corpusFixtures.ts";

const BASE_SEED = asRunSeed(904n);

/* ───────────────────────────── fixtures ───────────────────────────── */

function drillWire(offerMicroUsd: string, win: readonly Record<string, unknown>[], lose: readonly Record<string, unknown>[]) {
  return JSON.parse(
    JSON.stringify({
      schema: "hh-scenario@1",
      id: "lv2-payout-drill",
      name: "Payout Drill",
      brief: "One keyed account, repeated sixty-cent asks; land one acceptance.",
      specRef: "§1.6 exit declaration — the cash slice at the winning close",
      specLine: 4014,
      board: { nodes: [{ id: "web-1", slots: 40, serviceTimeUs: 2000000 }], edges: [] },
      contracts: [
        { id: "d-01", mrcMicroUsd: "50000000", billingCycle: "monthly", termEndMin: 9000, termMonths: 1, autoRenew: true, priceKey: "plan:lv2-drill" },
      ],
      traffic: { tableId: "drill", segments: [{ fromMinute: 0, ratePerMin: 1 }] },
      intents: [10, 25, 40, 55].map((atTick) => ({
        atTick,
        verb: "sell-offer",
        args: { targetKind: "plan", targetId: "lv2-drill", offerPriceMicroUsd: offerMicroUsd, termMonths: 12, effectiveAtBusinessMinute: null },
      })),
      objectives: { win, lose },
      limits: { maxSimMinutes: 90 },
    }),
  ) as Record<string, unknown>;
}

/** The shipped rail shape: survive-60 + at-least-one-acceptance wins. */
const SALE_DOC = parseScenarioDoc(
  drillWire("30000000", [{ kind: "survive-minutes", minutes: 60 }, { kind: "sell-accepted-above", count: 0 }], [{ kind: "death-by-cause", cause: "any" }]),
);
/** Same offers, but the win line is sale-BLIND (survive only): the verdict
 *  lands in the ledger, never in the close condition. */
const SALE_BLIND_DOC = parseScenarioDoc(
  drillWire("30000000", [{ kind: "survive-minutes", minutes: 60 }], [{ kind: "death-by-cause", cause: "any" }]),
);
/** A rail that loses at tick 1 (cash-below a line the default bankroll sits
 *  under): the declared exit must NOT pay a loser. */
const LOSING_DOC = parseScenarioDoc(
  drillWire("30000000", [{ kind: "sell-accepted-above", count: 99 }], [{ kind: "cash-below", microUsd: "1000000000000000" }]),
);
/** Count 99 is unreachable: the clock runs out with four verdicts on the
 *  books and no WON close. */
const STALLED_DOC = parseScenarioDoc(
  drillWire("30000000", [{ kind: "sell-accepted-above", count: 99 }], [{ kind: "death-by-cause", cause: "any" }]),
);

const FROZEN_ADJUSTMENTS = Object.freeze([
  Object.freeze({ basis: "concentration", factorBps: 7500n }),
  Object.freeze({ basis: "exit-kind", factorBps: 8000n }),
  Object.freeze({ basis: "reputation", factorBps: 9000n }),
  Object.freeze({ basis: "term-coverage", factorBps: 5000n }),
]);

const DECLARED = (exitKind: string) => ({ exitDeclaration: { exitKind } });

/* ───────────────────────────── the payout ───────────────────────────── */

describe("exitPayout — engine truth at the declared winning close (L-V2)", () => {
  it("the drill closes as probed: won on the sell-accepted grammar, offset-invariant", () => {
    for (let offset = 0; offset < 5; offset += 1) {
      const report = runScenario(SALE_DOC, BASE_SEED, { seedOffset: offset, ...DECLARED("pe-bolt-on") });
      expect(report.outcome).toBe("won");
      expect(report.stopReason).toBe("win:sell-accepted-above:0@60");
      expect(report.observation.sellVerdicts).toEqual({ accepted: 4, refused: 0 });
    }
  });

  it("probe-pinned payout: headline is the amended verdict Σ, slice is the clamped product", () => {
    const payout = runScenario(SALE_DOC, BASE_SEED, { ...DECLARED("pe-bolt-on") }).exitPayout;
    expect(payout).toBeDefined();
    expect(payout?.exitKind).toBe("pe-bolt-on");
    // FOUR acceptances on one key ⇒ ONE persisted verdict. The headline is the
    // closed offer (30M), never 4×30M — the amendment law is the headline law.
    expect(payout?.headlineOfferMicroUsd).toBe(30_000_000n);
    // 30M × 0.75 × 0.9 × 0.5 (term-coverage) = 0.3375 → slice-floor clamp 0.5
    // → × 0.8 pe-bolt-on kind factor = 12M, exact.
    expect(payout?.cashSliceMicroUsd).toBe(12_000_000n);
    expect(payout?.adjustments).toEqual(FROZEN_ADJUSTMENTS);
  });

  it("never above headline, every basis legal, exit-kind leg always present, code-unit sorted", () => {
    for (const exitKind of ["strategic-acquisition", "pe-platform", "pe-bolt-on", "asset-sale"] as const) {
      const payout = runScenario(SALE_DOC, BASE_SEED, DECLARED(exitKind))?.exitPayout;
      expect(payout).toBeDefined();
      if (payout === undefined) continue;
      expect(payout.cashSliceMicroUsd <= payout.headlineOfferMicroUsd).toBe(true);
      expect(payout.cashSliceMicroUsd >= 0n).toBe(true);
      expect(payout.exitKind).toBe(exitKind);
      for (const leg of payout.adjustments) {
        // The registry rows are {basis, cite} pairs — the basis set is the law.
        expect(VALUATION_ADJUSTMENT_BASES.map((row) => row.basis)).toContain(leg.basis);
        expect(leg.factorBps >= 0n && leg.factorBps <= 10_000n).toBe(true);
      }
      const bases = payout.adjustments.map((leg) => leg.basis);
      expect(bases.filter((basis) => basis === "exit-kind")).toHaveLength(1);
      expect([...bases].sort()).toEqual(bases);
    }
  });

  it("the runner seam accepts all seven kinds — wind-down slices to EXACTLY 0 (division of labor)", () => {
    // Campaign's parse wall (doc.ts RESERVED) is what keeps ipo/mbo/wind-down
    // from being DECLARED in play; the runner stays vocabulary-honest and the
    // economy leaf stays total: wind-down's kind factor is 0 (hg:4512 — "keep
    // what's left"), so the slice is zero, and the exit-kind leg says so.
    expect(VALUATION_EXIT_KINDS).toHaveLength(7);
    const payout = runScenario(SALE_DOC, BASE_SEED, DECLARED("wind-down"))?.exitPayout;
    expect(payout?.cashSliceMicroUsd).toBe(0n);
    expect(payout?.headlineOfferMicroUsd).toBe(30_000_000n);
    const kindLeg = payout?.adjustments.find((leg) => leg.basis === "exit-kind");
    expect(kindLeg?.factorBps).toBe(0n);
  });

  it("zero new dice: bare vs declared are byte-ident apart from the sparse key, every offset", () => {
    for (let offset = 0; offset < 5; offset += 1) {
      const bare = runScenario(SALE_DOC, BASE_SEED, { seedOffset: offset });
      const declared = runScenario(SALE_DOC, BASE_SEED, { seedOffset: offset, ...DECLARED("pe-platform") });
      expect(declared.exitPayout).toBeDefined();
      // The endDigest — the state-freeze authority — never moves…
      expect(declared.endDigest).toBe(bare.endDigest);
      // …and the WHOLE report is identical once the one sparse key is folded.
      const { exitPayout: _folded, ...rest } = declared;
      expect(rest).toEqual(bare);
      expect(Object.prototype.hasOwnProperty.call(bare, "exitPayout")).toBe(false);
    }
  });

  it("determinism twin ×100: the same frozen numbers, every repeat", () => {
    let previous: ScenarioReport | undefined;
    for (let repeat = 0; repeat < 100; repeat += 1) {
      const report = runScenario(SALE_DOC, BASE_SEED, DECLARED("pe-bolt-on"));
      if (previous !== undefined) {
        expect(report.exitPayout).toEqual(previous.exitPayout);
        expect(report.endDigest).toBe(previous.endDigest);
      }
      previous = report;
    }
    expect(previous?.exitPayout?.cashSliceMicroUsd).toBe(12_000_000n);
  });

  it("the payout is observation-gated: only a WON close ON the sale grammar pays", () => {
    // Won, but the win line never carried the carrier ⇒ no key (a sale nobody
    // conditioned the ending on is a ledger event, not an exit).
    const saleBlind = runScenario(SALE_BLIND_DOC, BASE_SEED, DECLARED("pe-bolt-on"));
    expect(saleBlind.outcome).toBe("won");
    expect(saleBlind.exitPayout).toBeUndefined();
    // Lost with a declaration ⇒ no key (declarations do not pay losers).
    const lost = runScenario(LOSING_DOC, BASE_SEED, DECLARED("strategic-acquisition"));
    expect(lost.outcome).toBe("lost");
    expect(lost.exitPayout).toBeUndefined();
    // Timed out with verdicts on the books ⇒ no key (timeout is silence, not
    // a sale; the endings layer narrates it, the money lane never pays it).
    const stalled = runScenario(STALLED_DOC, BASE_SEED, DECLARED("asset-sale"));
    expect(stalled.outcome).toBe("timeout");
    expect(stalled.exitPayout).toBeUndefined();
  });

  it("the exitDeclaration wall is PRE-TICK-1 and names the seven", () => {
    // A typo'd kind throws at the seam instead of limping to a close that
    // would silently pay nothing. The LOSING_DOC arm proves pre-tick-1-ness:
    // that wire's tick-1 loss would have produced a (payout-less, defined)
    // report had the run started at all.
    const run = () => runScenario(LOSING_DOC, BASE_SEED, DECLARED("mbo"));
    expect(run).toThrow(Error);
    let message = "";
    try {
      run();
    } catch (error) {
      message = String((error as Error).message);
    }
    expect(message).toContain("scenario[BAD_ENUM] at 'runScenario.exitDeclaration'");
    for (const kind of VALUATION_EXIT_KINDS) expect(message).toContain(`"${kind}"`);
    expect(message).toContain('"mbo"');
    // Non-string kinds die at the same wall.
    expect(() => runScenario(LOSING_DOC, BASE_SEED, DECLARED(42 as unknown as string))).toThrow(/BAD_ENUM\] at 'runScenario\.exitDeclaration'/);
  });

  it("all 31 shipped wires byte-stand declared — none carries a sell-accepted win line", () => {
    for (const id of [...SHIPPED_SCENARIO_IDS]) {
      const doc = shippedScenario(id);
      const bare = runScenario(doc, BASE_SEED, { tickCap: 12, corpus: corpusAuthority() });
      const declared = runScenario(doc, BASE_SEED, { tickCap: 12, corpus: corpusAuthority(), ...DECLARED("pe-bolt-on") });
      expect(declared.exitPayout).toBeUndefined();
      expect(declared.endDigest).toBe(bare.endDigest);
      expect(declared).toEqual(bare);
    }
    expect(SHIPPED_SCENARIO_IDS).toHaveLength(31);
  });
});
