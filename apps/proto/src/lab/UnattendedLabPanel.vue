<script setup lang="ts">
/**
 * UnattendedLabPanel — "The Long Weekend" (§9.2) as a playable bench.
 *
 * Composition law mirrors HudLabPanel: everything runs LOCALLY (runUnattended
 * is pure), every string comes from the unattendedLab model, all chrome reads
 * through chrome/numberLaw + the hue ledger. Guard defaults shown are
 * PROVISIONAL owner-taste numbers and the panel SAYS so on every render.
 *
 * Hue jobs borrowed here (ledger names only, inline styles + vars):
 *  - alarm  : halt banner + error text (chrome-alarm-klaxon, the live bad-news
 *             job — a weekend that stopped IS klaxon territory);
 *  - gold   : money figures (money-moves);
 *  - red    : the first-divergence big number (final-state — the exact tick
 *             where two worlds became different facts);
 *  - grey   : digest chips / structure (neutral-aggregate);
 *  - azure  : bounce-notice for bounced-heavy buckets is NOT used — bucket
 *             heat rides rho numbers, not hues, keeping the grid quiet.
 */
import { computed, onBeforeUnmount, reactive, ref } from "vue";
import { globalExplain } from "../chrome/explainRegistry";
import ExplainValue from "../chrome/ExplainValue.vue";
import { formatMoney } from "../chrome/numberLaw";
import StatusChip from "../chrome/StatusChip.vue";
import {
  BOARD_PRESETS,
  GUARD_COMPARATORS,
  GUARD_KINDS,
  GUARD_METRICS,
  bucketRows,
  buildDelta,
  defaultForm,
  explainWeekend,
  explainWhatIf,
  guardRowFields,
  provisionalNote,
  runWeekend,
  runWeekendWhatIf,
  shortDigest,
} from "./unattendedLab";
import type { BucketRow, GuardRowDraft, LabStage, UnattendedLabForm } from "./unattendedLab";
import type { LabRunOutcome, WhatIfOutcome } from "./unattendedLab";
import { boardPresetById } from "./unattendedLab";
import type { WhatIfDeltaKind } from "./unattendedLab";

/* ─────────────────────────── form state ─────────────────────────── */

const form = reactive<UnattendedLabForm>(defaultForm());
const stage = ref<LabStage>("idle");
const outcome = ref<LabRunOutcome | null>(null);
const whatIfOutcome = ref<WhatIfOutcome | null>(null);

/** Determinism honesty witness: signature of the last completed run's form. */
const lastSignature = ref<string | null>(null);
const lastDigest = ref<string | null>(null);
const digestPin = ref<string | null>(null);

function snapshotForm(): UnattendedLabForm {
  return {
    seed: form.seed,
    boardPresetId: form.boardPresetId,
    ticks: form.ticks,
    checkpointEvery: form.checkpointEvery,
    baselineRatePerMin: form.baselineRatePerMin,
    guardRows: form.guardRows.map((row) => ({ ...row })),
    openingDollars: form.openingDollars,
    opexRows: form.opexRows.map((row) => ({ ...row })),
    withContract: form.withContract,
  };
}

function formSignature(): string {
  return JSON.stringify(snapshotForm());
}

const running = computed(() => stage.value === "building" || stage.value === "weekend" || stage.value === "whatif");
const report = computed(() => outcome.value?.report ?? null);
const runError = computed(() => outcome.value?.error ?? null);
const whatIfError = computed(() => whatIfOutcome.value?.error ?? null);
const whatIf = computed(() => whatIfOutcome.value?.result ?? null);
const buckets = computed<readonly BucketRow[]>(() => (report.value === null ? [] : bucketRows(report.value.hourlyBuckets)));
const boardNodeIds = computed(() => boardPresetById(form.boardPresetId).board.nodes.map((n) => n.id));

async function onRunWeekend(): Promise<void> {
  const signature = formSignature();
  const result = await runWeekend(snapshotForm(), (s) => (stage.value = s));
  outcome.value = result;
  whatIfOutcome.value = null;
  if (result.stage === "done" && result.report !== null) {
    const digest = result.report.finalDigest;
    digestPin.value =
      lastSignature.value === signature
        ? lastDigest.value === digest
          ? "digest pin ✓ — same inputs, same world (byte-identical final digest)"
          : "digest pin ✗ — SAME inputs, DIFFERENT digest (determinism violation: report it)"
        : null;
    lastSignature.value = signature;
    lastDigest.value = digest;
    registerDigestExplain(digest);
  }
}

function registerDigestExplain(digest: string): void {
  globalExplain.register({
    id: "lab:weekend-digest",
    payload: {
      title: "final state digest",
      formula: "digestState(post-advance state) — canonical fold of the whole world",
      inputs: [
        { name: "seed", value: String(form.seed) },
        { name: "ticks", value: String(form.ticks) },
        { name: "board", value: form.boardPresetId },
      ],
    },
  });
}

/* ─────────────────────────── guard rows ─────────────────────────── */

function toggleGuard(row: GuardRowDraft): void {
  row.enabled = !row.enabled;
}

/* ─────────────────────────── opex mini-form ─────────────────────────── */

function addOpexRow(): void {
  form.opexRows.push({ atMinute: form.ticks > 10 ? 10 : 1, dollars: 1, memo: "" });
}

function removeOpexRow(index: number): void {
  form.opexRows.splice(index, 1);
}

/* ─────────────────────────── what-if mini-mode ─────────────────────────── */

const deltaKind = ref<WhatIfDeltaKind>("removeNode");
const deltaNodeId = ref<string>("edge");
const surgeMultiplier = ref(3);
const surgeMinutes = ref(30);

async function onRunWhatIf(): Promise<void> {
  try {
    const delta = buildDelta({
      kind: deltaKind.value,
      nodeId: deltaNodeId.value,
      surgeMultiplier: surgeMultiplier.value,
      surgeMinutes: surgeMinutes.value,
    });
    const result = await runWeekendWhatIf(snapshotForm(), delta, (s) => (stage.value = s));
    whatIfOutcome.value = result;
    if (result.stage === "done" && result.result !== null) {
      registerDivergenceExplain(result.result.firstDivergentTick);
    }
  } catch (error) {
    whatIfOutcome.value = {
      stage: "error",
      result: null,
      error: error instanceof Error ? error.message : String(error),
    };
    stage.value = "error";
  }
}

function registerDivergenceExplain(tick: bigint | null): void {
  globalExplain.register({
    id: "lab:first-divergent",
    payload: {
      title: "first divergent tick",
      formula: "bisection over checkpoint digests: first tick where baseline ≠ variant state",
      inputs: [{ name: "tick", value: tick === null ? "none (identical to horizon)" : String(tick) }],
    },
  });
}

/* ─────────────────────────── what-if summary table ─────────────────────────── */

const whatIfRows = computed(() => {
  const result = whatIf.value;
  if (result === null) return [];
  const b = result.baseline.summary;
  const v = result.variant.summary;
  return [
    { label: "served", baseline: String(b.served), variant: String(v.served) },
    { label: "bounced", baseline: String(b.blocked), variant: String(v.blocked) },
    { label: "landed", baseline: String(b.landed), variant: String(v.landed) },
    { label: "false positives", baseline: String(b.falsePositive), variant: String(v.falsePositive) },
    { label: "rule firings", baseline: String(b.ruleFirings), variant: String(v.ruleFirings) },
    { label: "cash Δ", baseline: formatMoney(b.cashDeltaMicroUsd), variant: formatMoney(v.cashDeltaMicroUsd) },
    {
      label: "stop",
      baseline: result.deltaSummary.baselineStop === null ? "clean run" : `guard at min ${result.deltaSummary.baselineStop.atMinute}`,
      variant: result.deltaSummary.variantStop === null ? "clean run" : `guard at min ${result.deltaSummary.variantStop.atMinute}`,
    },
  ];
});

onBeforeUnmount(() => {
  globalExplain.clear();
});

/** Exposed for the DOM tests (asserting vocabulary, not vibes). */
defineExpose({ GUARD_KINDS, GUARD_METRICS, GUARD_COMPARATORS, BOARD_PRESETS });
</script>

<template>
  <div class="unattended-lab" data-test="lab-unattended">
    <header class="lab-head">
      <h2>Unattended Weekend — §9.2 bench</h2>
      <p class="provisional" data-test="lab-provisional">{{ provisionalNote() }}</p>
    </header>

    <div class="lab-cols">
      <!-- ══ config column ══ -->
      <section class="lab-config" aria-label="weekend config">
        <fieldset>
          <legend>World</legend>
          <label>seed
            <input v-model.number="form.seed" type="number" min="0" step="1" data-test="lab-input-seed" />
          </label>
          <label>board
            <select v-model="form.boardPresetId" data-test="lab-input-board">
              <option v-for="preset in BOARD_PRESETS" :key="preset.id" :value="preset.id">
                {{ preset.label }}
              </option>
            </select>
          </label>
          <p class="board-note">{{ boardPresetById(form.boardPresetId).note }}</p>
          <label>ticks (≤ 2880)
            <input v-model.number="form.ticks" type="number" min="1" max="2880" step="1" data-test="lab-input-ticks" />
          </label>
          <label>checkpoint every
            <input v-model.number="form.checkpointEvery" type="number" min="1" step="1" data-test="lab-input-checkpoint" />
          </label>
          <label>baseline arrivals / min
            <input v-model.number="form.baselineRatePerMin" type="number" min="0" step="1" data-test="lab-input-rate" />
          </label>
        </fieldset>

        <fieldset>
          <legend>Guards ({{ GUARD_KINDS.length }} kinds — PROVISIONAL defaults)</legend>
          <div v-for="row in form.guardRows" :key="row.kind" class="guard-row" :data-test="`lab-guard-${row.kind}`">
            <label class="guard-toggle">
              <input type="checkbox" :checked="row.enabled" data-test="lab-guard-toggle" @change="toggleGuard(row)" />
              <code>{{ row.kind }}</code>
            </label>
            <template v-if="row.enabled">
              <template v-for="field in guardRowFields(row.kind)" :key="field">
                <label v-if="field === 'sustainedMin'" class="mini">sustain min
                  <input v-model.number="row.sustainedMin" type="number" min="1" step="1" />
                </label>
                <label v-else-if="field === 'degradedPctGt'" class="mini">degraded %
                  <input v-model.number="row.degradedPctGt" type="number" min="1" max="99" step="1" />
                </label>
                <label v-else-if="field === 'firingsPerMinGt'" class="mini">firings/min
                  <input v-model.number="row.firingsPerMinGt" type="number" min="0" step="1" />
                </label>
                <label v-else-if="field === 'remainingSecLte'" class="mini">budget sec ≤
                  <input v-model.number="row.remainingSecLte" type="number" min="0" step="1" />
                </label>
                <label v-else-if="field === 'metric'" class="mini">metric
                  <select v-model="row.metric">
                    <option v-for="metric in GUARD_METRICS" :key="metric" :value="metric">{{ metric }}</option>
                  </select>
                </label>
                <label v-else-if="field === 'comparator'" class="mini">cmp
                  <select v-model="row.comparator">
                    <option v-for="cmp in GUARD_COMPARATORS" :key="cmp" :value="cmp">{{ cmp }}</option>
                  </select>
                </label>
                <label v-else-if="field === 'value'" class="mini">value
                  <input v-model.number="row.value" type="number" step="any" />
                </label>
              </template>
            </template>
          </div>
        </fieldset>

        <fieldset>
          <legend>Money (µ$ ledger underneath, $ here)</legend>
          <label>opening free $
            <input v-model.number="form.openingDollars" type="number" min="0" step="any" data-test="lab-input-opening" />
          </label>
          <label class="guard-toggle">
            <input v-model="form.withContract" type="checkbox" data-test="lab-input-contract" />
            run one gold contract (MRC $5/mo)
          </label>
          <div v-for="(row, i) in form.opexRows" :key="i" class="opex-row" :data-test="`lab-opex-${i}`">
            <label>min <input v-model.number="row.atMinute" type="number" min="0" step="1" class="w-slim" /></label>
            <label>$ <input v-model.number="row.dollars" type="number" min="0" step="any" class="w-slim" /></label>
            <label>memo <input v-model="row.memo" type="text" placeholder="auto" /></label>
            <button type="button" aria-label="remove opex row" @click="removeOpexRow(i)">✕</button>
          </div>
          <button type="button" class="ghost" data-test="lab-opex-add" @click="addOpexRow">+ burn</button>
        </fieldset>

        <div class="run-row">
          <button type="button" class="run" data-test="lab-run-weekend" :disabled="running" @click="onRunWeekend">
            {{ stage === "weekend" ? "running the weekend…" : "Run Weekend" }}
          </button>
        </div>
        <p class="stage" data-test="lab-stage" aria-live="polite">stage: {{ stage }}</p>

        <fieldset class="whatif">
          <legend>What-if mini-mode</legend>
          <label>delta
            <select v-model="deltaKind" data-test="lab-whatif-kind">
              <option value="removeNode">removeNode</option>
              <option value="disableDefense">disableDefense</option>
              <option value="trafficSurge">trafficSurge</option>
            </select>
          </label>
          <label v-if="deltaKind !== 'trafficSurge'">node
            <select v-model="deltaNodeId" data-test="lab-whatif-node">
              <option v-for="id in boardNodeIds" :key="id" :value="id">{{ id }}</option>
            </select>
          </label>
          <template v-if="deltaKind === 'trafficSurge'">
            <label>× baseline
              <input v-model.number="surgeMultiplier" type="number" min="0" step="any" data-test="lab-whatif-mult" />
            </label>
            <label>minutes
              <input v-model.number="surgeMinutes" type="number" min="1" step="1" data-test="lab-whatif-min" />
            </label>
          </template>
          <button type="button" class="run" data-test="lab-run-whatif" :disabled="running" @click="onRunWhatIf">
            {{ stage === "whatif" ? "bisecting two worlds…" : "Run What-If" }}
          </button>
        </fieldset>
      </section>

      <!-- ══ output column ══ -->
      <section class="lab-output" aria-label="weekend report">
        <p v-if="runError !== null" class="err" data-test="lab-error">{{ runError }}</p>
        <p v-else-if="whatIfError !== null" class="err" data-test="lab-error">{{ whatIfError }}</p>

        <template v-if="report !== null">
          <p v-if="digestPin !== null" class="pin-note" data-test="lab-digest-pin">{{ digestPin }}</p>

          <!-- halt banner -->
          <div v-if="report.stop !== null" class="halt" data-test="lab-halt" role="alert">
            <strong>{{ report.stop.reason }}</strong> at sim-minute {{ report.stop.atMinute }}
            <span class="digest">snapshot {{ shortDigest(report.stop.snapshotDigest) }}</span>
            <ul class="triggered">
              <li v-for="ev in report.stop.triggered" :key="ev.reason">
                {{ ev.reason }} — {{ ev.verdict }} ({{ ev.runMin }} min run)
              </li>
            </ul>
          </div>
          <div v-else class="clean" data-test="lab-clean">
            no guard fired — the weekend ran its full {{ form.ticks }} minutes
          </div>

          <p class="explain" data-test="lab-explanation">{{ explainWeekend(report) }}</p>

          <div class="digest-chip">
            final
            <ExplainValue explain-id="lab:weekend-digest" :display="shortDigest(report.finalDigest)" />
            <span class="ticks">{{ String(report.ticksRun) }} ticks</span>
          </div>

          <!-- checkpoint timeline -->
          <div class="timeline" data-test="lab-timeline" aria-label="checkpoint timeline">
            <span v-for="cp in report.perCheckpoint" :key="String(cp.tick)" class="cp" :title="cp.digest">
              <b>{{ String(cp.tick) }}</b><i>{{ shortDigest(cp.digest) }}</i>
            </span>
          </div>

          <!-- hourly buckets -->
          <table class="buckets" data-test="lab-buckets">
            <thead>
              <tr>
                <th>h</th><th>srv</th><th>bnce</th><th>lnd</th><th>FP</th><th>arr</th>
                <th>rate/min</th><th>ρ̄</th><th>ρ peak</th><th>degr</th><th>cash̄</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in buckets" :key="row.hour" :data-test="`lab-bucket-${row.hour}`">
                <td>{{ row.hour }}</td><td>{{ row.served }}</td><td>{{ row.blocked }}</td>
                <td>{{ row.landed }}</td><td>{{ row.falsePositive }}</td><td>{{ row.arrivals }}</td>
                <td>{{ row.ratePerMin }}</td><td>{{ row.meanRho }}</td><td>{{ row.peakRho }}</td>
                <td>{{ row.degradedTicks }}</td><td class="money">{{ row.meanCash }}</td>
              </tr>
            </tbody>
          </table>

          <!-- warns verbatim -->
          <ul v-if="report.warns.length > 0" class="warns" data-test="lab-warns">
            <li v-for="warn in report.warns" :key="warn"><code>{{ warn }}</code></li>
          </ul>
        </template>

        <!-- what-if verdict -->
        <template v-if="whatIf !== null">
          <div class="divergent" data-test="lab-divergent">
            <span class="big-num" data-test="lab-divergent-tick">
              {{ whatIf.firstDivergentTick === null ? "—" : String(whatIf.firstDivergentTick) }}
            </span>
            <span class="divergent-label">first divergent tick</span>
          </div>
          <p class="explain" data-test="lab-whatif-explain">{{ explainWhatIf(whatIf) }}</p>
          <table class="compare" data-test="lab-whatif-summary">
            <thead>
              <tr><th>metric</th><th>baseline</th><th>variant</th></tr>
            </thead>
            <tbody>
              <tr v-for="row in whatIfRows" :key="row.label">
                <td>{{ row.label }}</td><td>{{ row.baseline }}</td><td>{{ row.variant }}</td>
              </tr>
            </tbody>
          </table>
        </template>

        <p v-if="report === null && whatIf === null && runError === null && whatIfError === null" class="hint" data-test="lab-idle">
          configure the weekend, then <StatusChip value="PENDING" /> — nothing has run yet.
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* Era tokens only (§8 chrome law): typeface/radius/surface/accent + hue
   ledger vars via var(--hh-hue-*). No 6-digit hex is spelled in this block —
   the hue-law scanner walks lab/ too. */
.unattended-lab {
  font-family: var(--hh-typeface);
  color: var(--hh-accent);
  padding: 14px 18px 40px;
  max-width: 1240px;
}
.lab-head h2 {
  margin: 0 0 2px;
  font-size: 17px;
  letter-spacing: 0.04em;
}
.provisional {
  margin: 0 0 10px;
  font-size: 11px;
  color: color-mix(in srgb, var(--hh-accent) 62%, transparent);
}
.lab-cols {
  display: grid;
  grid-template-columns: minmax(320px, 420px) 1fr;
  gap: 18px;
  align-items: start;
}
fieldset {
  border: 1px solid color-mix(in srgb, var(--hh-accent) 22%, transparent);
  border-radius: var(--hh-radius);
  margin: 0 0 10px;
  padding: 8px 10px 10px;
}
legend {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--hh-accent) 70%, transparent);
  padding: 0 6px;
}
label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  margin: 4px 0;
}
label.mini { margin: 2px 6px 2px 0; font-size: 11px; }
.w-slim { width: 74px; }
input, select {
  font: inherit;
  background: color-mix(in srgb, var(--hh-surface) 80%, #000 6%);
  color: var(--hh-accent);
  border: 1px solid color-mix(in srgb, var(--hh-accent) 30%, transparent);
  border-radius: var(--hh-radius);
  padding: 2px 6px;
  width: 110px;
}
select { width: auto; max-width: 200px; }
.board-note { font-size: 11px; margin: 2px 0 6px; opacity: 0.75; }
.guard-row { border-top: 1px dashed color-mix(in srgb, var(--hh-accent) 14%, transparent); padding: 3px 0; display: flex; flex-wrap: wrap; align-items: center; }
.guard-row:first-of-type { border-top: none; }
.guard-toggle { font-size: 12px; }
.guard-row code, .warns code { font-size: 11px; color: color-mix(in srgb, var(--hh-accent) 88%, #fff 4%); }
.opex-row { display: flex; gap: 6px; align-items: center; font-size: 11px; }
.opex-row input[type="text"] { width: 120px; }
button {
  font: inherit;
  background: color-mix(in srgb, var(--hh-accent) 14%, transparent);
  color: var(--hh-accent);
  border: 1px solid color-mix(in srgb, var(--hh-accent) 45%, transparent);
  border-radius: var(--hh-radius);
  padding: 3px 10px;
  cursor: pointer;
}
button.ghost { background: transparent; opacity: 0.8; }
button.run { font-weight: 700; letter-spacing: 0.03em; }
button:disabled { opacity: 0.45; cursor: wait; }
.run-row { margin: 8px 0 2px; }
.stage { font-size: 11px; opacity: 0.7; margin: 4px 0 10px; }
.whatif { margin-top: 12px; }

/* output side */
.err {
  border: 1px dashed var(--hh-hue-alarm);
  background: color-mix(in srgb, var(--hh-hue-alarm) 14%, transparent);
  padding: 8px 10px;
  border-radius: var(--hh-radius);
  font-size: 12px;
}
.halt {
  border: 1px solid var(--hh-hue-alarm);
  background: color-mix(in srgb, var(--hh-hue-alarm) 18%, var(--hh-surface));
  padding: 8px 12px;
  border-radius: var(--hh-radius);
  font-size: 13px;
  margin-bottom: 8px;
}
.halt .digest { display: block; font-size: 11px; opacity: 0.8; }
.triggered { margin: 4px 0 0; padding-left: 18px; font-size: 11px; }
.clean {
  border-left: 3px solid var(--hh-hue-green);
  padding: 4px 10px;
  font-size: 12px;
  margin-bottom: 8px;
}
.explain { font-size: 13px; line-height: 1.45; margin: 8px 0; }
.pin-note {
  font-size: 11px;
  color: var(--hh-hue-green);
  border: 1px dashed color-mix(in srgb, var(--hh-hue-green) 50%, transparent);
  border-radius: var(--hh-radius);
  padding: 3px 8px;
  display: inline-block;
  margin: 0 0 8px;
}
.digest-chip { font-size: 12px; display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.digest-chip .ticks { opacity: 0.6; font-size: 11px; }
.timeline {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 8px 0 12px;
}
.cp {
  display: inline-flex;
  flex-direction: column;
  border: 1px solid color-mix(in srgb, var(--hh-hue-grey) 60%, transparent);
  border-radius: var(--hh-radius);
  padding: 2px 8px;
  font-size: 10px;
  line-height: 1.3;
  background: color-mix(in srgb, var(--hh-surface) 88%, #000 4%);
}
.cp b { font-size: 11px; }
.cp i { font-style: normal; color: var(--hh-hue-grey); }
table { border-collapse: collapse; width: 100%; font-size: 11px; font-variant-numeric: tabular-nums; margin-bottom: 10px; }
th, td { border-bottom: 1px solid color-mix(in srgb, var(--hh-accent) 12%, transparent); padding: 3px 6px; text-align: right; }
th:first-child, td:first-child { text-align: left; }
th { opacity: 0.7; font-weight: 600; }
td.money { color: var(--hh-hue-gold); }
.warns { padding-left: 18px; font-size: 11px; }
.divergent { display: flex; align-items: baseline; gap: 12px; margin: 10px 0 4px; }
.big-num {
  font-size: 44px;
  line-height: 1;
  color: var(--hh-hue-red);
  font-variant-numeric: tabular-nums;
}
.divergent-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.7; }
.compare { max-width: 640px; }
.hint { font-size: 12px; opacity: 0.75; display: flex; gap: 8px; align-items: center; }
</style>
