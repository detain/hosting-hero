/**
 * Pricing dial (batch-E v0) — the OD-24(a) `adjust-price` door verb, given a
 * hand on the wall. Pure half: the demo catalog, the price ladder, and the
 * exact intent the runner's door path accepts.
 *
 * This rides the MAINLINE door the way every other verb does: a
 * `player-verb` PlayerIntent is submitted through `SimCoreRunner.submit()`,
 * stamped for tick+1, and fed EXACTLY once through TickInputs.externalIntents
 * (contract #10). The verdict comes back on the wire as an
 * intent-executed / intent-refused notice whose detail is
 * `<verb>: <target=…,price=…>` on an execution (E2b receipt-detail seam) and
 * `<verb>: <reason>` on a refusal.
 *
 * Honest scope ledger, E2b edition (all three original seams CLOSED):
 *  - the runner exposes `pricingState()` / `attentionState()` readbacks (E1);
 *  - the runner forwards `GameState.pricing.overrides` into the economy
 *    fold every tick (@8994f96) — an executed order DOES move the invoices
 *    of contracts classified under its key (the forwarding suite pins the
 *    exact cash delta);
 *  - the executed receipt names target + price on the wire, so the panel's
 *    confirmation line shows what the door actually booked.
 * Over the WORKER path the bigint price now revives at the boundary too
 * (`wireIntentToPlayerIntent`, E2b) — headless and worker are symmetric.
 */
import { asEntityId, asMoney, PlayerVerb } from "@hh/sim-core";
import type { EntityId, MoneyUnit, PlayerIntent } from "@hh/sim-core";

export const ADJUST_PRICE = PlayerVerb.AdjustPrice;

/** PROVISIONAL demo catalog (taste row, owner-ratify). The door itself never
 *  interprets plan ids — with no `canAdjustPrice` wired (the proto runner's
 *  config today) any well-formed target executes structurally; the catalog
 *  is what the DIAL offers, not what the engine allows. */
export interface DemoPlan {
  readonly id: EntityId;
  readonly label: string;
  readonly baseMicroUsd: MoneyUnit;
}

export const DEMO_PLANS: readonly DemoPlan[] = Object.freeze([
  Object.freeze({ id: asEntityId("plan/shared-web-basic"), label: "shared-web basic", baseMicroUsd: asMoney(9_900_000n) }),
  Object.freeze({ id: asEntityId("plan/shared-web-pro"), label: "shared-web pro", baseMicroUsd: asMoney(24_900_000n) }),
  Object.freeze({ id: asEntityId("plan/reseller-blitz"), label: "reseller blitz", baseMicroUsd: asMoney(79_000_000n) }),
]);

/** The price ladder for one plan: half · base · double. Integer µ$ (MoneyUnit
 *  makes fractions unrepresentable — Law 2); halving floors at 1µ$, never 0:
 *  a zero price is a REFUSAL demo (INVALID_PRICE_PROBE), not a ladder rung. */
export function priceLadder(baseMicroUsd: MoneyUnit): readonly MoneyUnit[] {
  if (baseMicroUsd <= 0n) {
    throw new RangeError(`priceLadder: base must be positive µ$, got ${baseMicroUsd}`);
  }
  const half = baseMicroUsd / 2n;
  return Object.freeze([half > 0n ? asMoney(half) : asMoney(1n), baseMicroUsd, asMoney(baseMicroUsd * 2n)]);
}

/** Value-domain probe: a non-positive bigint is the engine's `invalid-price`
 *  refusal (the door consumes nothing on refusals — the demo is safe). */
export const INVALID_PRICE_PROBE: MoneyUnit = asMoney(0n);

/** One wire-shaped adjust-price intent. `clock: "business"` is the Dual-Clock
 *  law (§4.4): repricing is a business action, not a packet. atUs is the
 *  intent's own-clock stamp; the door schedules by the runner's tick stamp.
 *  The bigint is a REAL bigint — in-process the door takes it verbatim; over
 *  the JSON worker path `SimClient.sendPlayerVerb` stringifies it on send and
 *  `wireIntentToPlayerIntent` revives it at the boundary (E2b closed what used
 *  to be a throw-IntentDoorError seam). */
export function buildAdjustPriceIntent(input: {
  readonly seq: number;
  readonly targetId: EntityId;
  readonly newPriceMicroUsd: MoneyUnit;
  readonly effectiveAtBusinessMinute?: number | null;
}): PlayerIntent {
  return Object.freeze({
    seq: input.seq,
    clock: "business" as const,
    atUs: 0n,
    origin: "player" as const,
    payload: Object.freeze({
      kind: "player-verb" as const,
      args: Object.freeze({
        verb: ADJUST_PRICE,
        targetKind: "plan" as const,
        targetId: input.targetId,
        newPriceMicroUsd: input.newPriceMicroUsd,
        effectiveAtBusinessMinute: input.effectiveAtBusinessMinute ?? null,
      }),
    }),
  });
}

/** Receipt line for the panel: detail of the pricing notice, verbatim wire
 *  text with the verb front-and-centre. Refusals read
 *  `adjust-price: <reason>`; executions read
 *  `adjust-price: target=<kind>:<id>,price=<µ$>` (E2b). */
export function receiptLine(detail: string | undefined, outcome: "executed" | "refused"): string {
  if (detail === undefined) return outcome === "executed" ? ADJUST_PRICE : `${ADJUST_PRICE}: (no reason on wire)`;
  return detail;
}
