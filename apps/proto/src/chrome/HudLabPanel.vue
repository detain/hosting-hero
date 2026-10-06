<script setup lang="ts">
/**
 * HudLabPanel — the chrome lane's stage: every load-bearing HUD component
 * mounted against the LIVE SimCoreRunner stream, fed through the sanctioned
 * singleton write path (ingestProjection). The shell integrator wires this
 * mount later via the GATE_MOUNTS manifest below — chrome does NOT touch
 * App.vue / gates/index.ts (lane law).
 *
 * The runner is constructed locally (headless stepper) so the lab works
 * before the shell adoption; when the app's own worker is wired, the panel
 * keeps reading the same store singletons and the local engine can be
 * switched off via `:local-engine="false"`.
 */
import { computed, onBeforeUnmount, ref, watchEffect } from "vue";
import { SimCoreRunner } from "../runner/simCoreRunner";
import { ingestProjection, projection } from "../state/observedStore";
import TopBar from "./TopBar.vue";
import ClockRibbon from "./ClockRibbon.vue";
import ExplainValue from "./ExplainValue.vue";
import StatusChip from "./StatusChip.vue";
import AlertStack from "./AlertStack.vue";
import PanicLayout from "./PanicLayout.vue";
import { buildHudCandidates, formatMicroUsd, formatRunClock, hudPermanentRows, rhoDisplayOf } from "./metrics";
import { planPromotion, toggleUserPin, type MetricCandidate } from "./promotion";
import { globalExplain } from "./explainRegistry";
import { allStatusChips } from "./statusChip";
import { businessDaysUntil } from "./clockRibbon";
import type { RibbonEntry } from "./clockRibbon";

const props = withDefaults(defineProps<{ seed?: number; localEngine?: boolean }>(), {
  seed: 904,
  localEngine: true,
});

/* ═════════════════ engine: headless stepper into the store ═════════════════ */

const runner = props.localEngine ? new SimCoreRunner({ seed: props.seed }) : null;
const auto = ref(false);
let timer: ReturnType<typeof setInterval> | null = null;

function step(): void {
  if (runner === null) return;
  ingestProjection(runner.headlessStep(1000));
}

watchEffect(() => {
  if (!auto.value) {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
    return;
  }
  timer = setInterval(step, 250);
});

onBeforeUnmount(() => {
  if (timer !== null) clearInterval(timer);
  runner?.stop();
  globalExplain.clear();
});

/* ═════════════════════ top bar + manual pin override ═════════════════════ */

const pins = ref<Readonly<Record<string, boolean>>>({});

const candidates = computed<readonly MetricCandidate[]>(() => {
  const p = projection.value;
  if (p === null) return [];
  return buildHudCandidates(p).map((c) =>
    c.kind === "promotable" && pins.value[c.id] === true ? { ...c, userPinned: true } : c,
  );
});

const permanentRows = computed(() => hudPermanentRows(projection.value));
const cashLabel = computed(() =>
  projection.value === null ? "$—" : `Cash ${formatMicroUsd(projection.value.freeCashMicroUsd)}`,
);
const clockLabel = computed(() =>
  projection.value === null ? "T+?" : `Run ${formatRunClock(projection.value.clocks.simUs)}`,
);

const pinNotice = ref<string | null>(null);

function onTogglePin(id: string): void {
  const result = toggleUserPin(candidates.value, id, { promotedSlots: 2 });
  if (result.outcome === "capacity-refused") {
    pinNotice.value = "both slots are already user-pinned — unpin one first";
    return;
  }
  pinNotice.value = null;
  pins.value = { ...pins.value, [id]: result.outcome === "pinned" };
}

/* ═══════════════════ ribbon: commit ledger + history demo ═══════════════════ */

const ribbonEntries = computed<readonly RibbonEntry[]>(() => {
  const p = projection.value;
  if (p === null) return [];
  const { simUs, businessUs } = p.clocks;
  const MIN = 60_000_000n;
  const DAY = 86_400_000_000n;
  const entries: RibbonEntry[] = [
    { id: "wave-next", label: "next wave", track: "ops", dueUs: simUs + 45n * MIN, consequence: 0.8 },
    { id: "patience", label: "visitor patience", track: "ops", dueUs: simUs + 12n * MIN, consequence: 0.9 },
    { id: "payroll", label: "payroll", track: "business", dueUs: businessUs + 6n * DAY, consequence: 1 },
    { id: "cert-expiry", label: "TLS cert expiry", track: "business", dueUs: businessUs + 9n * DAY, consequence: 0.6 },
    { id: "renewal-wave", label: "renewal wave", track: "business", dueUs: businessUs + 2n * DAY, consequence: 0.5 },
    { id: "audit", label: "quarter audit", track: "business", dueUs: businessUs + 21n * DAY, consequence: 0.7 },
  ];
  if (p.counters.landed > 0) {
    const back = 20n * MIN;
    entries.push({
      id: "incident-landed",
      label: "landed hit",
      track: "ops",
      dueUs: simUs > back ? simUs - back : 0n, // earliest the strip can show is t0
      consequence: 0.4,
      history: true,
      tone: "bad",
    });
  }
  entries.push({ id: "boot", label: "run start", track: "ops", dueUs: 0n, consequence: 0.1, history: true, tone: "good" });
  return entries;
});

/* ══════════════ explain: ρ → queue → arrivals recursive chain ══════════════ */

watchEffect(() => {
  const p = projection.value;
  if (p === null) return;
  globalExplain.register({
    id: "hh:rho",
    payload: {
      title: "utilization ρ",
      formula: "ρ = arrivals × service time / capacity",
      inputs: [
        { name: "served", value: String(p.counters.served) },
        { name: "bounced", value: String(p.counters.bounced) },
      ],
    },
    // Drill DOWN the traffic split — each counter is its own explainer.
    inputRefs: { bounced: "hh:bounce-mix" },
  });
  globalExplain.register({
    id: "hh:bounce-mix",
    payload: {
      title: "bounce mix",
      formula: "bounces = queue overflow + patience expiry (raw sim facts)",
      inputs: [
        { name: "landed inside mix", value: String(p.counters.landed) },
        { name: "false blocks", value: String(p.counters.blockedFalsePositive) },
      ],
    },
    inputRefs: { "false blocks": "hh:fp-fee" },
  });
  globalExplain.register({
    id: "hh:fp-fee",
    payload: {
      title: "false-positive cost",
      formula: "waste = blocked_false_positive × 20s challenge fee",
      inputs: [{ name: "fee µ$/visitor", value: "20000000" }],
    },
  });
});

const rhoValue = computed(() => (projection.value === null ? null : rhoDisplayOf(projection.value)));

/* ═══════════════════════════ status + derived ════════════════════════════ */

const payrollRow = computed(() => {
  const p = projection.value;
  if (p === null) return "—";
  const days = businessDaysUntil(p.clocks.businessUs, p.clocks.businessUs + 6n * 86_400_000_000n);
  return `payroll in ${days} business-day${days === 1 ? "" : "s"}`;
});

const sharedPlan = computed(() => planPromotion(candidates.value, { promotedSlots: 2 }));
</script>

<template>
  <PanicLayout>
    <div class="hud-lab" data-test="hud-lab">
      <TopBar
        :cash-label="cashLabel"
        :clock-label="clockLabel"
        :candidates="candidates"
        :permanent-rows="permanentRows"
        :pins="pins"
        @toggle-pin="onTogglePin"
      />
      <p v-if="pinNotice !== null" class="pin-notice" role="status" data-test="pin-notice">{{ pinNotice }}</p>

      <div class="engine-row">
        <button type="button" data-test="lab-step" :disabled="runner === null" @click="step">step +1m</button>
        <button type="button" data-test="lab-auto" :aria-pressed="auto" @click="auto = !auto">{{ auto ? "■ stop" : "▶ auto" }}</button>
        <span class="seq" data-test="lab-seq">seq {{ projection?.seq ?? "—" }}</span>
        <span class="payroll" data-test="lab-payroll">{{ payrollRow }}</span>
      </div>

      <ClockRibbon :entries="ribbonEntries" />

      <div class="grid">
        <section class="card" data-hud-optional="true" data-test="lab-explain">
          <h4>Explain-This-Number (§8.8)</h4>
          <p class="demo">
            ρ =
            <ExplainValue
              explain-id="hh:rho"
              :display="rhoValue === null ? '?' : (rhoValue * 100).toFixed(rhoValue * 100 < 10 ? 1 : 0)"
              unit="%"
              :no-data="rhoValue === null"
            />
            — click it, then click an input.
          </p>
        </section>

        <section class="card" data-test="lab-alerts">
          <AlertStack />
        </section>

        <section class="card" data-hud-optional="true" data-test="lab-chips">
          <h4>Status chips — 12, two-channel (§8.2)</h4>
          <div class="chips">
            <StatusChip v-for="spec in allStatusChips()" :key="spec.value" :value="spec.value" />
          </div>
        </section>

        <section class="card" data-hud-optional="true" data-test="lab-promotion">
          <h4>Promotion plan (§1.4)</h4>
          <p class="mono">
            permanent {{ sharedPlan.permanent.length }} · promoted
            {{ sharedPlan.promoted.map((m) => m.label).join(", ") || "—" }}
            <template v-if="sharedPlan.collapsedCount > 0"> · +{{ sharedPlan.collapsedCount }} waiting</template>
          </p>
        </section>
      </div>
    </div>
  </PanicLayout>
</template>

<style scoped>
.hud-lab { display: grid; gap: 10px; padding: 10px 0; }
.engine-row { display: flex; gap: 10px; align-items: center; font-size: 11px; font-family: var(--hh-typeface); }
.engine-row button {
  border: 1px solid color-mix(in srgb, var(--hh-accent) 40%, transparent);
  background: transparent;
  color: var(--hh-accent);
  font: inherit;
  border-radius: var(--hh-radius);
  padding: 2px 10px;
  cursor: pointer;
}
.engine-row button:disabled { opacity: .4; cursor: default; }
.seq, .payroll { opacity: .6; font-variant-numeric: tabular-nums; }
.pin-notice { margin: 0; font-size: 11px; color: #e8b23c; font-family: var(--hh-typeface); }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; }
.card {
  padding: 10px;
  font-family: var(--hh-typeface);
  background: color-mix(in srgb, var(--hh-surface) 92%, #000);
  border: 1px solid color-mix(in srgb, var(--hh-accent) 18%, transparent);
  border-radius: var(--hh-radius);
}
.card h4 { margin: 0 0 8px; font-size: 10px; letter-spacing: .18em; text-transform: uppercase; opacity: .55; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.mono, .demo { font-size: 12px; margin: 0; color: color-mix(in srgb, var(--hh-accent) 70%, #fff); }
</style>
