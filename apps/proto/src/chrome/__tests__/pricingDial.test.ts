/**
 * pricingDial (batch-E v0) — the REAL door round-trip: an adjust-price intent
 * built here, submitted through the mainline SimCoreRunner.submit(), executed
 * by pipeline/intent-door against the shipped hands, and read back off the
 * projection's receipt notices. No mocks: if the door contract moves, this
 * test moves red.
 */
import { describe, expect, it } from "vitest";
import { asMoney } from "@hh/sim-core";
import type { EntityId } from "@hh/sim-core";
import { SimCoreRunner } from "../../runner/simCoreRunner";
import {
  ADJUST_PRICE,
  BILLING_PROOF_PLAN,
  BILLING_PROOF_STEPS,
  DEMO_PLANS,
  HOURLY_CONTRACT_ID,
  INVALID_PRICE_PROBE,
  billingDeltaLine,
  billingProofKey,
  billingProofPriceKeys,
  buildAdjustPriceIntent,
  priceLadder,
  receiptLine,
} from "../pricingDial";

describe("intent shape (wire law)", () => {
  it("carries clock business (dual-clock §4.4), a REAL bigint, null effective minute", () => {
    const intent = buildAdjustPriceIntent({
      seq: 7,
      targetId: DEMO_PLANS[0]!.id,
      newPriceMicroUsd: asMoney(1_000n),
    });
    expect(intent.clock).toBe("business");
    expect(intent.origin).toBe("player");
    expect(intent.payload).toEqual({
      kind: "player-verb",
      args: {
        verb: ADJUST_PRICE,
        targetKind: "plan",
        targetId: DEMO_PLANS[0]!.id,
        newPriceMicroUsd: 1_000n,
        effectiveAtBusinessMinute: null,
      },
    });
    if (intent.payload.kind !== "player-verb") throw new Error("unreachable");
    const args = intent.payload.args;
    if (args.verb !== ADJUST_PRICE) throw new Error("unreachable");
    expect(typeof args.newPriceMicroUsd).toBe("bigint"); // requireBigint law
  });

  it("a future-dated business minute passes through the builder untouched", () => {
    const intent = buildAdjustPriceIntent({
      seq: 1,
      targetId: DEMO_PLANS[1]!.id,
      newPriceMicroUsd: asMoney(5n),
      effectiveAtBusinessMinute: 43_200,
    });
    if (intent.payload.kind !== "player-verb" || intent.payload.args.verb !== ADJUST_PRICE) {
      throw new Error("unreachable");
    }
    expect(intent.payload.args.effectiveAtBusinessMinute).toBe(43_200);
  });
});

describe("price ladder", () => {
  it("half · base · double, integer µ$, floors at 1µ$ on halving", () => {
    expect(priceLadder(asMoney(9_900_000n))).toEqual([4_950_000n, 9_900_000n, 19_800_000n]);
    expect(priceLadder(asMoney(1n))).toEqual([1n, 1n, 2n]);
    expect(() => priceLadder(INVALID_PRICE_PROBE)).toThrow(RangeError);
  });
});

describe("the mainline door accepts the dial (live SimCoreRunner)", () => {
  function dial(seed = 42) {
    const runner = new SimCoreRunner({ seed });
    return { runner, submit: (priceMicroUsd: bigint, targetId = DEMO_PLANS[0]!.id) => {
      runner.submit(buildAdjustPriceIntent({ seq: 1, targetId, newPriceMicroUsd: asMoney(priceMicroUsd) }));
      const frame = runner.headlessStep(1000);
      return frame.notices.filter((n) => n.kind === "intent-executed" || n.kind === "intent-refused");
    } };
  }

  it("a clean order EXECUTES — receipt notice detail names verb, target and booked price", () => {
    const { submit } = dial();
    const receipts = submit(19_800_000n);
    expect(receipts).toHaveLength(1);
    expect(receipts[0]!.kind).toBe("intent-executed");
    // E2b seam 4: the executed rider carries the handler's booked detail.
    expect(receipts[0]!.detail).toBe("adjust-price: target=plan:plan/shared-web-basic,price=19800000");
    expect(receiptLine(receipts[0]!.detail, "executed")).toBe(
      "adjust-price: target=plan:plan/shared-web-basic,price=19800000",
    );
  });

  it("0 µ$ is a value-domain REFUSAL — the door consumes nothing", () => {
    const { submit } = dial();
    const receipts = submit(INVALID_PRICE_PROBE);
    expect(receipts).toHaveLength(1);
    expect(receipts[0]!.kind).toBe("intent-refused");
    expect(receipts[0]!.detail).toMatch(/^adjust-price: invalid-price/);
  });

  it("an empty target id refuses with empty-target-id (parse-don't-validate downstream)", () => {
    const { runner } = dial();
    // Wire-shaped garbage: an id that fails the door's VALUE guard (not the
    // host brand — asEntityId itself refuses empty, so the cast is honest).
    runner.submit(
      buildAdjustPriceIntent({ seq: 1, targetId: "" as unknown as EntityId, newPriceMicroUsd: asMoney(9n) }),
    );
    const frame = runner.headlessStep(1000);
    const refused = frame.notices.find((n) => n.kind === "intent-refused");
    expect(refused?.detail).toMatch(/^adjust-price: empty-target-id/);
  });

  it("two orders in one frame: hands (capacity 2) pay both — the dial never starves itself", () => {
    const runner = new SimCoreRunner({ seed: 7 });
    for (const [i, plan] of DEMO_PLANS.slice(0, 2).entries()) {
      runner.submit(
        buildAdjustPriceIntent({ seq: i + 1, targetId: plan.id, newPriceMicroUsd: asMoney(123n + BigInt(i)) }),
      );
    }
    const frame = runner.headlessStep(1000);
    // E2b: executed details are `adjust-price: target=…`; the pricing lane is
    // every notice whose detail opens with the verb + colon.
    const pricing = frame.notices.filter((n) => (n.detail ?? "").startsWith(`${ADJUST_PRICE}:`));
    expect(pricing.filter((n) => n.kind === "intent-executed")).toHaveLength(2);
  });
});

describe("billing proof (the card's evidence section, @8994f96 pattern)", () => {
  it("classifies the hourly contract under the proof plan's door key", () => {
    const keys = billingProofPriceKeys();
    expect([...keys.entries()]).toEqual([
      [HOURLY_CONTRACT_ID, "plan:plan/shared-web-basic"],
    ]);
    expect(billingProofKey(BILLING_PROOF_PLAN.id)).toBe("plan:plan/shared-web-basic");
    expect(BILLING_PROOF_PLAN).toBe(DEMO_PLANS[0]);
    expect(BILLING_PROOF_STEPS).toBe(20);
  });

  it("billingDeltaLine signs the gap and never eats the minus", () => {
    const fmt = (v: bigint) => `${v}µ`;
    expect(billingDeltaLine(asMoney(100n), asMoney(160n), fmt)).toEqual({
      deltaMicroUsd: 60n,
      deltaText: "+60µ",
      nonzero: true,
    });
    expect(billingDeltaLine(asMoney(100n), asMoney(40n), fmt).deltaText).toBe("-60µ");
    expect(billingDeltaLine(asMoney(100n), asMoney(100n), fmt)).toEqual({
      deltaMicroUsd: 0n,
      deltaText: "0µ",
      nonzero: false,
    });
  });

  it("the twin experiment on the panel seed: keyed dial moves cash, unkeyed stays byte-inert", () => {
    const keys = billingProofPriceKeys();
    const run = (mutate?: (treated: SimCoreRunner) => void): { control: bigint; treated: bigint } => {
      const control = new SimCoreRunner({ seed: 905, priceKeys: keys });
      const treated = new SimCoreRunner({ seed: 905, priceKeys: keys });
      mutate?.(treated);
      let c = 0n;
      let t = 0n;
      for (let i = 0; i < BILLING_PROOF_STEPS; i += 1) {
        c = control.headlessStep(1000).freeCashMicroUsd;
        t = treated.headlessStep(1000).freeCashMicroUsd;
      }
      control.stop();
      treated.stop();
      return { control: c, treated: t };
    };
    const inert = run();
    expect(inert.treated).toBe(inert.control); // order-less twin == control law

    const keyed = run((t) =>
      t.submit(buildAdjustPriceIntent({ seq: 1, targetId: BILLING_PROOF_PLAN.id, newPriceMicroUsd: priceLadder(BILLING_PROOF_PLAN.baseMicroUsd)[1]! })),
    );
    expect(keyed.control).toBe(inert.control); // control is order-independent
    expect(keyed.treated).not.toBe(keyed.control); // the fold MOVED — real µ$
    expect(keyed.treated).toBe(24_994_926_732n); // probe-derived 2026-10-13 literal

    const unkeyed = run((t) =>
      t.submit(buildAdjustPriceIntent({ seq: 1, targetId: DEMO_PLANS[1]!.id, newPriceMicroUsd: asMoney(123_456n) })),
    );
    expect(unkeyed.treated).toBe(inert.control); // neutral-twin law: no contract, no delta
  }, 30_000);
});
