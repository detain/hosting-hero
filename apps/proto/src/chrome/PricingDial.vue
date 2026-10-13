<script setup lang="ts">
/**
 * PricingDial — an actual `adjust-price` order through the actual intent door
 * (batch-E v0). Self-contained by law: it owns a PRIVATE SimCoreRunner and
 * NEVER writes the global observed store — the mainline sandbox keeps its own
 * stream untouched. This is the G1-style local stepper pattern applied to the
 * 9th verb.
 *
 * What you see is the door's VERDICT off the wire (intent-executed /
 * intent-refused notices; since E2b the executed line names the target and
 * the price the door booked). What happens behind it, stated honestly: the
 * order lands in the runner's GameState.pricing AND, since @8994f96, that
 * book is forwarded into every economy fold as `priceOverrides` — invoices
 * on contracts classified under the touched key bill at the new price.
 */
import { computed, onBeforeUnmount, ref } from "vue";
import { asMoney } from "@hh/sim-core";
import { SimCoreRunner } from "../runner/simCoreRunner";
import { formatMicroUsd } from "./metrics";
import { tabularNumber } from "./numberLaw";
import { isPricingReceipt } from "./deathWatch";
import {
  ADJUST_PRICE,
  BILLING_PROOF_PLAN,
  BILLING_PROOF_STEPS,
  DEMO_PLANS,
  INVALID_PRICE_PROBE,
  billingDeltaLine,
  billingProofKey,
  billingProofPriceKeys,
  buildAdjustPriceIntent,
  priceLadder,
  receiptLine,
} from "./pricingDial";

const props = withDefaults(defineProps<{ seed?: number }>(), { seed: 905 });

/* The panel's ongoing session carries the SAME classification as the billing
   proof below, so the footer's claim is live right here: an executed order on
   the proof plan's key reaches this runner's economy folds too. */
const runner = new SimCoreRunner({ seed: props.seed, priceKeys: billingProofPriceKeys() });
const planIndex = ref(0);
const ladderIndex = ref(1); // rung 1 = base price — the dial starts at law
const seq = ref(0);
const tick = ref(0n);
const log = ref<readonly string[]>([]);

const plan = computed(() => DEMO_PLANS[planIndex.value]!);
const ladder = computed(() => priceLadder(plan.value.baseMicroUsd));
const proposed = computed(() => ladder.value[ladderIndex.value]!);

function pushLine(line: string): void {
  log.value = Object.freeze([line, ...log.value].slice(0, 6));
}

/** Submit through the MAINLINE door path: submit() stamps tick+1, the next
 *  headlessStep feeds it via TickInputs.externalIntents exactly once, and the
 *  receipt returns on that frame's notices. */
function submitOrder(priceMicroUsd = proposed.value): void {
  const targetId = plan.value.id;
  runner.submit(
    buildAdjustPriceIntent({ seq: (seq.value += 1), targetId, newPriceMicroUsd: priceMicroUsd }),
  );
  const frame = runner.headlessStep(1000);
  tick.value = frame.tick;
  const receipts = frame.notices.filter(isPricingReceipt);
  if (receipts.length === 0) {
    pushLine(`${formatMicroUsd(priceMicroUsd)} → no pricing receipt yet (hands busy?)`);
    return;
  }
  for (const notice of receipts) {
    pushLine(
      `${formatMicroUsd(priceMicroUsd)} · ${receiptLine(notice.detail, notice.kind === "intent-executed" ? "executed" : "refused")}`,
    );
  }
}

/** Value-domain demo: the door REFUSES a non-positive price and consumes
 *  nothing — the refusal line is the point of the button. */
function probeRefusal(): void {
  runner.submit(
    buildAdjustPriceIntent({ seq: (seq.value += 1), targetId: plan.value.id, newPriceMicroUsd: INVALID_PRICE_PROBE }),
  );
  const frame = runner.headlessStep(1000);
  tick.value = frame.tick;
  const refused = frame.notices.find((n) => n.kind === "intent-refused");
  pushLine(`0 µ$ probe → ${refused?.detail ?? "(no refusal notice — unexpected)"}`);
}

/* ── billing proof: the controlled twin experiment (@8994f96 pattern) ── */
interface ProofRow {
  readonly testId: string;
  readonly label: string;
  readonly value: string;
}
const proof = ref<readonly ProofRow[]>([]);
const proofRuns = ref(0);

/** Fresh control + treated twins on the panel seed, one adjust-price order
 *  booked on the treated side at m0, both stepped BILLING_PROOF_STEPS ticks.
 *  The cash gap is real economy-fold output, not display math. */
/* formatMicroUsd abbreviates at the $10k floor (its own law); the proof rows
   are cash EVIDENCE, so they print the exact grouped figure — tabularNumber
   is the same locale-free grounder the money law itself rides. */
function exactUsd(microUsd: bigint): string {
  return `$${tabularNumber(Number(microUsd / 10_000n) / 100, 2)}`;
}

function runBillingProof(): void {
  const price = proposed.value;
  const targetId = plan.value.id;
  const runs = (proofRuns.value += 1);
  const keys = billingProofPriceKeys();
  const control = new SimCoreRunner({ seed: props.seed, priceKeys: keys });
  const treated = new SimCoreRunner({ seed: props.seed, priceKeys: keys });
  treated.submit(buildAdjustPriceIntent({ seq: runs, targetId, newPriceMicroUsd: price }));
  let controlCash = 0n;
  let treatedCash = 0n;
  for (let i = 0; i < BILLING_PROOF_STEPS; i += 1) {
    controlCash = control.headlessStep(1000).freeCashMicroUsd;
    treatedCash = treated.headlessStep(1000).freeCashMicroUsd;
  }
  control.stop();
  treated.stop();
  const key = billingProofKey(targetId);
  const delta = billingDeltaLine(asMoney(controlCash), asMoney(treatedCash), formatMicroUsd);
  proof.value = Object.freeze([
    Object.freeze({ testId: "books", label: "door books", value: `${key} → ${formatMicroUsd(price)}` }),
    Object.freeze({ testId: "control", label: `control · ${BILLING_PROOF_STEPS} ticks, no order`, value: exactUsd(controlCash) }),
    Object.freeze({ testId: "treated", label: `treated · ${BILLING_PROOF_STEPS} ticks, order at m0`, value: exactUsd(treatedCash) }),
    Object.freeze({
      testId: "delta",
      label: "billing delta (treated − control)",
      value: delta.nonzero
        ? delta.deltaText
        : `0 µ$ — no contract under ${key} settles in this horizon (the board's hourly contract rides ${billingProofKey(BILLING_PROOF_PLAN.id)})`,
    }),
  ]);
  pushLine(`proof run ${runs}: ${targetId === BILLING_PROOF_PLAN.id ? "keyed plan dialed — see billing-delta row" : "unkeyed plan dialed — delta must stay 0 (neutral-twin law)"}`);
}

function selectPlan(index: number): void {
  planIndex.value = index;
  ladderIndex.value = 1;
}

onBeforeUnmount(() => runner.stop());
</script>

<template>
  <div class="pricing-dial" data-test="pricing-dial">
    <div class="plans" role="radiogroup" aria-label="price target plan">
      <button
        v-for="(p, i) in DEMO_PLANS"
        :key="p.id"
        type="button"
        role="radio"
        :aria-checked="i === planIndex"
        :data-test="`dial-plan-${p.id}`"
        :class="{ on: i === planIndex }"
        @click="selectPlan(i)"
      >
        {{ p.label }}
      </button>
    </div>

    <div class="ladder" role="radiogroup" aria-label="proposed price">
      <button
        v-for="(price, i) in ladder"
        :key="String(price)"
        type="button"
        role="radio"
        :aria-checked="i === ladderIndex"
        :data-test="`dial-rung-${i}`"
        :class="{ on: i === ladderIndex }"
        @click="ladderIndex = i"
      >
        {{ formatMicroUsd(price) }}
      </button>
    </div>

    <div class="send">
      <button type="button" data-test="dial-send" @click="submitOrder()">
        submit {{ ADJUST_PRICE }} → {{ formatMicroUsd(proposed) }}
      </button>
      <button type="button" data-test="dial-refuse-probe" title="value-domain refusal demo (consumes nothing)" @click="probeRefusal()">
        probe invalid-price
      </button>
      <span class="tick" data-test="dial-tick">door tick {{ tick }}</span>
    </div>

    <ul v-if="log.length > 0" class="log" data-test="dial-log" aria-live="polite">
      <li v-for="(line, i) in log" :key="`${line}-${i}`">{{ line }}</li>
    </ul>

    <div class="proof" data-test="dial-proof">
      <button type="button" data-test="dial-billing-proof" @click="runBillingProof()">
        run billing proof · control vs treated × {{ BILLING_PROOF_STEPS }} ticks
      </button>
      <table v-if="proof.length > 0" class="proof-rows" data-test="dial-proof-rows">
        <tbody>
          <tr v-for="row in proof" :key="row.label" :data-test="`dial-proof-${row.testId}`">
            <th scope="row">{{ row.label }}</th>
            <td class="num">{{ row.value }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="proof.length > 0" class="proof-honesty" data-test="dial-proof-honesty">
        Twins share one seed and one priceKeys classification; the only
        difference is the order. The hourly SMB contract is keyed under
        “shared-web basic” — dial that plan and the delta is real µ$; dial
        any other key and the neutral-twin law holds the delta at 0.
        Elasticity band coefficients are PROVISIONAL (ratify-on-playtest);
        churn effects may or may not ride inside the horizon — the row
        reports raw cash, never a richer story.
      </p>
    </div>

    <p class="honesty" data-test="dial-honesty">
      Verdicts are the real intent door on a private runner. The override book
      lands in GameState.pricing and the runner forwards it into every economy
      fold — an “executed” order bills the next invoices on contracts under
      that key at the new price.
    </p>
  </div>
</template>

<style scoped>
.pricing-dial { display: grid; gap: 8px; font-family: var(--hh-typeface); font-size: 12px; color: color-mix(in srgb, var(--hh-accent) 78%, #fff); }
.plans, .ladder, .send { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
button {
  border: 1px solid color-mix(in srgb, var(--hh-accent) 35%, transparent);
  background: transparent;
  color: inherit;
  font: inherit;
  font-variant-numeric: tabular-nums;
  border-radius: calc(var(--hh-radius) / 2);
  padding: 2px 9px;
  cursor: pointer;
}
button:hover { background: color-mix(in srgb, var(--hh-accent) 14%, transparent); }
button[aria-pressed="true"], button.on { border-color: var(--hh-hue-cyan); color: var(--hh-hue-cyan); }
[data-test="dial-send"] { border-color: color-mix(in srgb, var(--hh-hue-cyan) 60%, transparent); }
[data-test="dial-refuse-probe"] { border-style: dashed; opacity: .7; }
.tick { margin-left: auto; opacity: .5; font-size: 10px; }
.log { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; font-size: 11px; }
.log li { opacity: .85; border-left: 2px solid color-mix(in srgb, var(--hh-hue-cyan) 45%, transparent); padding-left: 7px; }
.proof { display: grid; gap: 4px; }
.proof-rows { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; font-size: 11px; }
.proof-rows th { text-align: left; font-weight: 500; opacity: .6; padding: 2px 6px 2px 0; white-space: nowrap; }
.proof-rows td { padding: 2px 0; }
.num { text-align: right; white-space: nowrap; }
[data-test="dial-billing-proof"] { justify-self: start; border-color: color-mix(in srgb, var(--hh-hue-gold) 55%, transparent); }
.proof-honesty { margin: 0; font-size: 10px; line-height: 1.45; opacity: .5; }
.honesty { margin: 0; font-size: 10px; line-height: 1.45; opacity: .45; }
</style>
