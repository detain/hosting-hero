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
 *  - the pricing book reads back through `runner.lastTickFacts().game.pricing`
 *    (there is no `pricingState()` accessor — the TickFacts seam is the
 *    single-slot authority; `attentionState()`/`recoveryState()` are the
 *    named accessors that DO exist);
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

/** Demo catalog (taste row RATIFIED 2026-10-16, ADR-0015 #1). The door
 *  itself never
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

/* ─────────────────────────── billing proof ───────────────────────────
 * The card copy CLAIMS the forwarded book moves money; this section lets
 * the card PROVE it. The controlled experiment mirrors the host-forwarding
 * suite (@8994f96, simCoreRunner.forwarding.test.ts): two fresh runners on
 * one seed, the SAME priceKeys classification, one of them takes a single
 * adjust-price order at m0; both step a fixed horizon; the cash difference
 * IS the billing delta. No fake arithmetic anywhere in the row.
 *
 * Classification law on THIS board: the demo runner's only contract that
 * settles inside a 20-minute horizon is the hourly SMB contract
 * (ctr-hourly-1, one cycle per 60 business minutes; the monthly $5M giant
 * cycles at month roll, far past the horizon). We classify it under the
 * FIRST demo plan's key, so dialing that plan moves real invoices and
 * dialing any other key demonstrates the neutral-twin law: a book entry
 * with no contract under its key changes NOTHING (byte-ident cash).
 * Elasticity churn effects may or may not ride inside the horizon — the
 * row reports raw µ$ deltas only, never a causal story beyond "billed at
 * the dialed price". */

/** The one contract the proof classifies (runner MONEY_CONTRACTS member). */
export const HOURLY_CONTRACT_ID: EntityId = asEntityId("ctr-hourly-1");

/** Fixed horizon of the proof — same window the forwarding suite pins. */
export const BILLING_PROOF_STEPS = 20;

/** The plan the hourly contract rides under (the catalog's first entry). */
export const BILLING_PROOF_PLAN: DemoPlan = DEMO_PLANS[0]!;

/** The door's override-book key for a plan target: `${targetKind}:${targetId}`. */
export function billingProofKey(planId: EntityId): string {
  return `plan:${planId}`;
}

/** Runner-construction classification: hourly contract → the proof plan's key. */
export function billingProofPriceKeys(): ReadonlyMap<EntityId, string> {
  return new Map([[HOURLY_CONTRACT_ID, billingProofKey(BILLING_PROOF_PLAN.id)]]);
}

/** Signed µ$ delta line, ASCII sign, absolute value formatted by the panel's
 *  own money law. Zero is told apart from the unkeyed case by `keyed`:
 *  a zero on a KEY the board bills would be a broken claim, so the caller
 *  passes keyed=false only for the unbilled-target honesty line. */
export function billingDeltaLine(
  controlCashMicroUsd: MoneyUnit,
  treatedCashMicroUsd: MoneyUnit,
  format: (microUsd: MoneyUnit) => string,
): { readonly deltaMicroUsd: MoneyUnit; readonly deltaText: string; readonly nonzero: boolean } {
  const deltaMicroUsd = treatedCashMicroUsd - controlCashMicroUsd;
  const sign = deltaMicroUsd > 0n ? "+" : deltaMicroUsd < 0n ? "-" : "";
  const absolute = asMoney(deltaMicroUsd < 0n ? -deltaMicroUsd : deltaMicroUsd);
  return Object.freeze({
    deltaMicroUsd: asMoney(deltaMicroUsd),
    deltaText: `${sign}${format(absolute)}`,
    nonzero: deltaMicroUsd !== 0n,
  });
}
