<script setup lang="ts">
/**
 * GATE-G5 · "The Book — One Quarter" (§9.13 gate #5).
 *
 * Signs customers → they bill → renewals/cliffs → dunning → churn →
 * money-you-can't-touch, all legible on one screen. The whole quarter is
 * computed ONCE at mount by the scripted engine (quarter.ts, the same code
 * the headless gate tests from sim-core); every widget below reads a pure
 * as-of projection (projection.ts). No sim mutators are introduced here —
 * this slice READS the economy's public state and shows each number its law.
 *
 * OD-1 ratified 2026-10-09 (commitment-convergence); this gate STILL shows
 * no scorecard — the Book renders ledger primitives only.
 * Content wires arrive via Vite `?raw` and are parsed at the engine boundary.
 * All economy sheet values are the shipped PROVISIONAL defaults (marked).
 */
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from "vue";
import sharedWebRaw from "../../../../../packages/content/types/shared-web.json?raw";
import waveTableRaw from "../../../../../packages/content/waves/g1-shared-web-first-quarter.json?raw";
import { businessMinuteLabel, runQuarterSafe } from "./engine.ts";
import { projectFrame, type ExplainPayload } from "./projection.ts";
import type { QuarterResult } from "./quarter.ts";
import Gate5Kanban from "./Gate5Kanban.vue";
import Gate5BucketStack from "./Gate5BucketStack.vue";
import Gate5RenewalStrip from "./Gate5RenewalStrip.vue";
import Gate5DunningLadder from "./Gate5DunningLadder.vue";
import Gate5CashVsProfit from "./Gate5CashVsProfit.vue";
import Gate5InvoiceTape from "./Gate5InvoiceTape.vue";
import Gate5BudgetPanel from "./Gate5BudgetPanel.vue";
import Gate5Ticker from "./Gate5Ticker.vue";

const SEED = 55105n; // the same scripted fate the headless gate certifies

const quarter = shallowRef<QuarterResult | null>(null);
const loadError = ref<string | null>(null);
const settleIdx = ref(0);
const explain = ref<ExplainPayload | null>(null);
const playing = ref(false);
let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  const attempt = runQuarterSafe({
    seed: SEED,
    sharedWebWire: JSON.parse(sharedWebRaw) as unknown,
    waveWire: JSON.parse(waveTableRaw) as unknown,
  });
  if (!attempt.ok) {
    loadError.value = attempt.message;
    return;
  }
  quarter.value = attempt.result;
  settleIdx.value = attempt.result.settles.length - 1; // open on the quarter's verdict
});

onBeforeUnmount(stop);

function stop(): void {
  playing.value = false;
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
}

function togglePlay(): void {
  if (playing.value) {
    stop();
    return;
  }
  const total = quarter.value?.settles.length ?? 0;
  if (total === 0) return;
  if (settleIdx.value >= total - 1) settleIdx.value = 0; // replay from day zero
  playing.value = true;
  timer = setInterval(() => {
    if (settleIdx.value >= total - 1) stop();
    else settleIdx.value += 1;
  }, 110);
}

const minute = computed(() => quarter.value?.settles[settleIdx.value]?.minute ?? 0);
const frame = computed(() =>
  quarter.value === null ? null : projectFrame(quarter.value, minute.value),
);
const incidentBanner = computed(() => {
  const q = quarter.value;
  if (q === null) return "";
  const w = q.incidentWindow;
  return `${w.id} · wave 4/${w.waveCount} incident [${w.incidentStartMin}, ${w.incidentEndMin}) · par ${w.incidentWaveParPct}%`;
});
</script>

<template>
  <div class="g5-root" data-test="g5-root">
    <header class="g5-head">
      <div>
        <h1>THE BOOK — ONE QUARTER</h1>
        <p class="g5-sub">
          gate G5 · §9.13 · bundle
          <b>{{ quarter?.bundleId ?? "…" }}</b>
          · sheet <b>{{ quarter?.tuningSheetMarker ?? "…" }}</b> (PROVISIONAL — carried, never resolved)
          · no scorecard (OD-1): ledger primitives only
        </p>
      </div>
      <p v-if="quarter" class="g5-incident" data-test="g5-incident-banner">{{ incidentBanner }}</p>
    </header>

    <p v-if="loadError" class="g5-fatal" data-test="g5-error">{{ loadError }}</p>
    <p v-else-if="!quarter" class="g5-loading" data-test="g5-loading">computing the quarter…</p>

    <template v-else-if="frame">
      <div class="g5-controls">
        <button class="g5-play" type="button" data-test="g5-play" @click="togglePlay">
          {{ playing ? "■ pause" : "▶ play quarter" }}
        </button>
        <input
          class="g5-scrubber"
          data-test="g5-scrubber"
          type="range"
          min="0"
          :max="quarter.settles.length - 1"
          step="1"
          :value="settleIdx"
          @input="settleIdx = Number(($event.target as HTMLInputElement).value)"
        />
        <span class="g5-readout" data-test="g5-minute-readout">{{ businessMinuteLabel(minute) }}</span>
        <button
          class="g5-reputation"
          type="button"
          data-test="g5-reputation"
          :title="frame.reputation.published ? `company::reputation published at m${frame.reputation.lastPublishedAtMinute}` : 'opening score — nothing published yet'"
          @click="explain = frame.reputation.explain"
        >rep {{ frame.reputation.percentText }}</button>
        <span class="g5-ends">quarter ends {{ businessMinuteLabel(frame.quarterEndsAt) }}</span>
      </div>

      <div class="g5-body" :class="{ 'g5-body--explain-open': explain !== null }">
        <div class="g5-main">
          <Gate5Kanban :columns="frame.kanban" @explain="explain = $event" />
          <div class="g5-band">
            <Gate5BucketStack
              :rows="frame.buckets"
              :bank-balance-text="frame.bankBalanceText"
              :spendable-text="frame.spendableText"
              :net-position-text="frame.netPositionText"
              @explain="explain = $event"
            />
            <Gate5CashVsProfit :months="frame.months" @explain="explain = $event" />
          </div>
          <div class="g5-band g5-band--split">
            <Gate5RenewalStrip :rows="frame.renewals" :minute="frame.minute" :quarter-ends-at="frame.quarterEndsAt" @explain="explain = $event" />
            <Gate5DunningLadder :rows="frame.dunning" @explain="explain = $event" />
          </div>
          <div class="g5-band g5-band--split">
            <Gate5InvoiceTape :rows="frame.tape" @explain="explain = $event" />
            <div class="g5-stackcol">
              <Gate5BudgetPanel :rows="frame.budgets" @explain="explain = $event" />
              <Gate5Ticker :rows="frame.ticker" />
            </div>
          </div>
        </div>

        <aside v-if="explain" class="g5-dock" data-test="g5-explain-panel" aria-label="Explain this number">
          <div class="g5-dock-head">
            <h2 data-test="g5-explain-title">{{ explain.title }}</h2>
            <button class="g5-dock-close" type="button" data-test="g5-close-explain" @click="explain = null">✕</button>
          </div>
          <p class="g5-formula" data-test="g5-explain-formula">{{ explain.formula }}</p>
          <dl class="g5-inputs">
            <div v-for="input in explain.inputs" :key="input.name" class="g5-input-row" data-test="g5-explain-input-row">
              <dt>{{ input.name }}</dt>
              <dd>{{ input.value }}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </template>
  </div>
</template>

<style>
/* Skin: the shared-web bundle's own chord (§ skin.palette: municipal
   beige-and-teal, sodium yellow, oxide red, dishwater grey, mint), bound as
   local tokens so the slice stands alone in tests and inside any era shell.

   hue-law:bundle-data — this whole --g5-* chord is CONTENT, not chrome
   semantics: per the Five-Asset law the skin palette ships inside the
   shared-web bundle, so these hexes legitimately bypass HUE_LEDGER. Note
   --g5-sodium #f2b133 merely coincides with the ledger "amber" alert-fill
   value; it is the bundle's sodium-yellow skin token (gates/__tests__/
   hueLawGates.test.ts allowlists exactly this file+value against this marker). */
.g5-root {
  --g5-typeface: "Space Grotesk", "Avenir Next", "Segoe UI Variable", sans-serif;
  --g5-bg: #0f1817;
  --g5-panel: #14201e;
  --g5-card: #1b2a27;
  --g5-card-hot: #233531;
  --g5-rule: #2b3d39;
  --g5-rule-strong: #3c534e;
  --g5-ink: #e9e3d3;
  --g5-ink-dim: #96a49d;
  --g5-putty: #c9bda0;
  --g5-sodium: #f2b133;
  --g5-sodium-soft: rgba(242, 177, 51, 0.16);
  --g5-oxide: #c0503b;
  --g5-dishwater: #6d7f85;
  --g5-mint: #7fd6a4;
  --g5-teal: #3f9c93;
  --g5-teal-soft: rgba(63, 156, 147, 0.18);
  color: var(--g5-ink);
  font-family: var(--hh-typeface, var(--g5-typeface));
  background:
    radial-gradient(1100px 400px at 12% -8%, rgba(63, 156, 147, 0.10), transparent 62%),
    radial-gradient(900px 500px at 105% 110%, rgba(242, 177, 51, 0.07), transparent 60%),
    repeating-linear-gradient(0deg, transparent 0 27px, rgba(233, 227, 211, 0.028) 27px 28px),
    var(--g5-bg);
  border: 1px solid var(--g5-rule-strong);
  padding: 14px 16px 20px;
}
</style>

<style scoped>
.g5-root { display: grid; gap: 10px; border-radius: var(--hh-radius, 0); }
.g5-head { display: flex; justify-content: space-between; align-items: end; gap: 16px; flex-wrap: wrap; }
.g5-head h1 {
  margin: 0;
  font-size: clamp(18px, 2.6vw, 30px);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--g5-ink);
}
.g5-head h1::after { content: " ▪"; color: var(--g5-sodium); }
.g5-sub { margin: 3px 0 0; font-size: 11px; color: var(--g5-ink-dim); letter-spacing: 0.04em; }
.g5-sub b { color: var(--g5-putty); }
.g5-incident {
  margin: 0;
  font-size: 10.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--g5-sodium);
  border: 1px dashed var(--g5-sodium);
  padding: 4px 8px;
}
.g5-loading, .g5-fatal { padding: 40px 8px; font-size: 13px; color: var(--g5-ink-dim); font-style: italic; }
.g5-fatal { color: var(--g5-oxide); font-style: normal; white-space: pre-wrap; }

.g5-controls { display: flex; align-items: center; gap: 12px; }
.g5-play {
  font: 700 11px/1 var(--hh-typeface, var(--g5-typeface));
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--g5-bg);
  background: var(--g5-sodium);
  border: 0;
  padding: 7px 12px;
  cursor: pointer;
}
.g5-play:hover { filter: brightness(1.1); }
.g5-scrubber { flex: 1; accent-color: var(--g5-teal); height: 22px; cursor: ew-resize; }
.g5-readout { font-weight: 700; font-variant-numeric: tabular-nums; color: var(--g5-mint); min-width: 118px; }
.g5-reputation {
  font: inherit;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--g5-ink);
  background: none;
  border: 1px solid var(--g5-rule);
  border-radius: 3px;
  padding: 1px 8px;
  cursor: pointer;
}
.g5-reputation:hover { border-color: var(--g5-teal); color: var(--g5-teal); }
.g5-ends { font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--g5-ink-dim); }

.g5-body { display: grid; }
.g5-body--explain-open { grid-template-columns: minmax(0, 1fr) 320px; gap: 12px; align-items: start; }
.g5-main { display: grid; gap: 10px; min-width: 0; }
.g5-band { display: grid; gap: 10px; min-width: 0; }
.g5-band--split { grid-template-columns: 3fr 2fr; }
.g5-band > * { min-width: 0; }
.g5-stackcol { display: grid; gap: 10px; align-content: start; min-width: 0; }

.g5-panel {
  background: var(--g5-panel);
  border: 1px solid var(--g5-rule);
  padding: 10px 12px 12px;
}
.g5-h {
  margin: 0;
  font-size: 10.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--g5-putty);
  cursor: pointer;
}
.g5-h:hover { color: var(--g5-sodium); }

.g5-dock {
  position: sticky;
  top: 8px;
  background: var(--g5-card);
  border: 1px solid var(--g5-sodium);
  padding: 10px 12px 12px;
  display: grid;
  gap: 8px;
}
.g5-dock-head { display: flex; justify-content: space-between; align-items: start; gap: 8px; }
.g5-dock h2 { margin: 0; font-size: 13px; letter-spacing: 0.04em; color: var(--g5-sodium); }
.g5-dock-close { background: none; border: 0; color: var(--g5-ink-dim); font-size: 14px; cursor: pointer; }
.g5-formula { margin: 0; font-size: 11.5px; line-height: 1.5; color: var(--g5-ink); }
.g5-inputs { margin: 0; display: grid; gap: 4px; }
.g5-input-row {
  display: grid;
  grid-template-columns: 132px 1fr;
  gap: 8px;
  font-size: 11px;
  border-bottom: 1px dotted var(--g5-rule);
  padding-bottom: 3px;
}
.g5-input-row dt { color: var(--g5-ink-dim); text-transform: uppercase; letter-spacing: 0.08em; font-size: 9.5px; }
.g5-input-row dd { margin: 0; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }

@media (max-width: 1100px) {
  .g5-body--explain-open { grid-template-columns: 1fr; }
  .g5-band--split { grid-template-columns: 1fr; }
}
</style>
