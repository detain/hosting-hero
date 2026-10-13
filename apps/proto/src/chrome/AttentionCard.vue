<script setup lang="ts">
/**
 * AttentionCard — the OD-6 second denomination gets a HUD (E2a seams (a)+(b),
 * thin static panel: zero declared motion). Self-contained by law
 * (PricingDial/RecoveryWatch pattern): private SimCoreRunner, NEVER writes
 * the global observed store, no TopBar row (the §1.4 four-id permanent-row
 * law keeps the denominations OUT of the TopBar).
 *
 * The pool starts EMPTY (planted at construction through the public pipeline
 * API, `createAttentionState` capacity 2, zero rows) and EVERY loan on the
 * ledger is opened LIVE mid-run via the runner's `enterAttentionWindow` seam
 * (E2a seam (a) closed — the card no longer rebuilds at minute 0 to borrow).
 * The bounded law is the pipeline's own: once debt reaches capacity the next
 * borrow answers the verbatim refusal and the clock keeps running. Servicing
 * is the runner's host-forwarded month roll (business-calendar grid, tick
 * 420): one oldest loan repaid per roll.
 */
import { computed, onBeforeUnmount, ref } from "vue";
import type { AttentionLoanKind } from "@hh/sim-core";
import { SimCoreRunner } from "../runner/simCoreRunner";
import {
  ATTENTION_CARD_CAPACITY,
  ATTENTION_MONTH_ROLL_STEP_CAP,
  attentionRows,
  attentionSummaryOf,
  boundedLoanProbe,
  loanRows,
  plantAttentionPool,
} from "./attentionCard";
import type { AttentionSummary } from "../shared/protocol";

const props = withDefaults(defineProps<{ seed?: number }>(), { seed: 905 });

const minute = ref(0);
const seq = ref(0);
const planted = plantAttentionPool(0); // empty pool, capacity 2 — zero planted rows
/* The WIRE roll-up (@0b35b15) once a step has landed; until then the panel
   renders the pure `attentionSummaryOf` mirror of the live pool — the same
   fields the runner stamps, not an invented story. */
const wire = ref<AttentionSummary>(attentionSummaryOf(planted.state));
const runner = createRunner();
/* The runner is a component-lifetime singleton; this counter is the
   reactivity pulse every mutation (step AND live borrow) bumps. */
const revision = ref(0);
/** Refusal from the LAST live borrow attempt (null when it opened) — the
 *  bounded law surfaced verbatim, never swallowed. */
const liveRefusal = ref<string | null>(null);

function createRunner(): SimCoreRunner {
  return new SimCoreRunner({ seed: props.seed, attention: planted.state });
}

function step(): void {
  const frame = runner.headlessStep(1000);
  seq.value = frame.seq;
  minute.value = frame.minute;
  if (frame.attention !== undefined) wire.value = frame.attention;
  revision.value += 1;
}

/** LIVE window entry — the runner's mid-run seam (@E2a (a) closed). The
 *  wire mirror advances to the pipeline's own new state; the NEXT step
 *  replaces it with the runner's stamped roll-up (same fields, same law). */
function borrow(kind: AttentionLoanKind): void {
  const result = runner.enterAttentionWindow(kind);
  liveRefusal.value = result.refusal;
  wire.value = attentionSummaryOf(result.state);
  revision.value += 1;
}

/** Advance until the month roll services the oldest row (debt drops) or the
 *  cap — the replenish seam is the runner's, we only watch it land. */
function runMonthRoll(): void {
  const debtBefore = runner.attentionState()?.debt ?? 0;
  let steps = 0;
  while (steps < ATTENTION_MONTH_ROLL_STEP_CAP) {
    step();
    steps += 1;
    if ((runner.attentionState()?.debt ?? 0) < debtBefore) break;
  }
}

const summaryRows = computed(() => {
  void revision.value; // re-read on every mutation (steps AND live borrows)
  return attentionRows(wire.value, runner.attentionState());
});

const rows = computed(() => {
  void revision.value;
  return loanRows(runner.attentionState());
});

/** Bounded law made visible without any runner: capacity+1 entries and the
 *  pipeline's own refusal string. */
const probeRefusal = boundedLoanProbe();

const servicedCount = computed(() => rows.value.filter((row) => row.repaid).length);

onBeforeUnmount(() => runner.stop());
</script>

<template>
  <div class="attention-card" data-test="attention-card">
    <div class="controls">
      <button type="button" data-test="attention-step" @click="step()">step +1m</button>
      <button type="button" data-test="attention-borrow" @click="borrow('triage-window')">
        borrow triage-window loan (live seam)
      </button>
      <button type="button" data-test="attention-borrow-grace" @click="borrow('grace')">
        borrow grace loan (live seam)
      </button>
      <button type="button" data-test="attention-roll" @click="runMonthRoll()">
        run the month roll (≤ {{ ATTENTION_MONTH_ROLL_STEP_CAP }} steps)
      </button>
      <span class="clock" data-test="attention-clock">m{{ minute }} · seq {{ seq }}</span>
    </div>

    <table v-if="summaryRows.length > 0" class="rows" data-test="attention-rows">
      <tbody>
        <tr v-for="row in summaryRows" :key="row.label" :data-test="`attention-row-${row.testId}`">
          <th scope="row">{{ row.label }}</th>
          <td class="num">{{ row.value }}</td>
        </tr>
      </tbody>
    </table>

    <table v-if="rows.length > 0" class="rows ledger" data-test="attention-ledger">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">kind</th>
          <th scope="col">taken m</th>
          <th scope="col">repay window</th>
          <th scope="col">state</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.index" :data-test="`attention-loan-${row.index}`">
          <td class="num">{{ row.index }}</td>
          <td>{{ row.kind }}</td>
          <td class="num">{{ row.createdAtMinute }}</td>
          <td class="num">{{ row.repayAtWindow }}</td>
          <td>
            <span v-if="row.repaid" class="chip chip--green" data-test="attention-repaid">repaid</span>
            <span v-else class="chip chip--amber" data-test="attention-outstanding">outstanding</span>
          </td>
        </tr>
      </tbody>
    </table>

    <p class="meter" data-test="attention-serviced">
      serviced by month rolls: {{ servicedCount }} of {{ rows.length }} · capacity law: {{ ATTENTION_CARD_CAPACITY }}
    </p>

    <p v-if="liveRefusal !== null" class="refusal" data-test="attention-borrow-refusal">
      bounded refusal (live attempt): {{ liveRefusal }}
    </p>
    <p v-else class="probe" data-test="attention-probe">
      bound probe (public API, no runner): {{ probeRefusal }}
    </p>

    <p class="honesty" data-test="attention-honesty">
      Wire authority: the AttentionSummary block (@0b35b15) rides every frame
      of this pooled runner; the ledger and replenish stamp read the runner's
      local attentionState(). Every loan here opened LIVE mid-run through the
      runner's host-forwarded `enterAttentionWindow` seam (E2a seam (a) closed
      — it was a rebuild-at-minute-0 before). GAP that REMAINS, stated
      honestly: the intent door has no borrowing verb, so a loan is a HOST
      action-on-state between ticks, not a hand-paid player verb — and
      repayment is the runner's forwarded month roll, one oldest loan per
      roll. Thresholds are PROVISIONAL (ratify-on-playtest).
    </p>
  </div>
</template>

<style scoped>
.attention-card { display: grid; gap: 8px; font-family: var(--hh-typeface); font-size: 12px; color: color-mix(in srgb, var(--hh-accent) 78%, #fff); }
.controls { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
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
button:disabled { opacity: .4; cursor: default; }
[data-test="attention-borrow"],
[data-test="attention-borrow-grace"] { border-color: color-mix(in srgb, var(--hh-hue-azure) 55%, transparent); }
.clock { margin-left: auto; opacity: .5; font-size: 10px; font-variant-numeric: tabular-nums; }
.rows { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; font-size: 11px; }
.rows th { text-align: left; font-weight: 500; opacity: .6; font-size: 10px; padding: 2px 6px 2px 0; }
.rows td { padding: 2px 6px 2px 0; }
.ledger thead th { font-size: 9px; letter-spacing: .14em; text-transform: uppercase; opacity: .5; font-weight: 500; }
.ledger td { border-top: 1px solid color-mix(in srgb, var(--hh-accent) 14%, transparent); }
.num { text-align: right; white-space: nowrap; }
.chip { display: inline-block; font-size: 10px; padding: 1px 8px; border-radius: 999px; }
.chip--amber { color: var(--hh-hue-amber); border: 1px solid var(--hh-hue-amber); }
.chip--green { color: var(--hh-hue-green); border: 1px solid var(--hh-hue-green); }
.meter { margin: 0; font-size: 10px; opacity: .6; font-variant-numeric: tabular-nums; }
.refusal { margin: 0; font-size: 10px; color: var(--hh-hue-alarm); }
.probe { margin: 0; font-size: 10px; opacity: .55; }
.honesty { margin: 0; font-size: 10px; line-height: 1.45; opacity: .45; }
</style>
