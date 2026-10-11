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
  DEMO_PLANS,
  INVALID_PRICE_PROBE,
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

  it("a clean order EXECUTES — receipt notice detail is the bare verb", () => {
    const { submit } = dial();
    const receipts = submit(19_800_000n);
    expect(receipts).toHaveLength(1);
    expect(receipts[0]!.kind).toBe("intent-executed");
    expect(receipts[0]!.detail).toBe(ADJUST_PRICE);
    expect(receiptLine(receipts[0]!.detail, "executed")).toBe("adjust-price");
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
    const pricing = frame.notices.filter((n) => n.detail === ADJUST_PRICE);
    expect(pricing.filter((n) => n.kind === "intent-executed")).toHaveLength(2);
  });
});
