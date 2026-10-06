<script setup lang="ts">
/**
 * gates/g3 · G3GatePanel — "the suspicion dial" playable slice (§9.13 #3).
 *
 * The player sees TWO lanes split the same traffic: EXPRESS (fast, thin
 * checks) vs DEEP INSPECTION (slow, expensive, thorough). The DIAL sets how
 * much confidence an express lane may tolerate; wire evidence folds
 * Π(1−cᵢ) in canonical order (FIX-3), so units whose evidence crosses the
 * dial get yanked mid-path — the pip strip shows it as a circle becoming a
 * triangle. "Upgrade defense" is a real intent-door verb: it moves the
 * benign ROC arm (false positives → sticky suspicion → demotions) without
 * touching adversarial damage — curve, not number.
 *
 * Renderer law: everything here is protocol truth — LaneStats aggregates for
 * the split bars, ObservedCells for pips/counters. No unit entities beyond
 * the wave-position labels pips.ts derives.
 */
import { computed, onMounted, onUnmounted, ref } from "vue";
import { MICROS_PER_MIN, fromRatio } from "@hh/sim-core/kernel";
import type { PlayerIntent } from "@hh/sim-core/types";
import type { SimProjection } from "../../shared/protocol.ts";
import { createG3Runner } from "./g3Runner.ts";
import { deriveLaneSplit, derivePips, FIXED_SCALE } from "./pips.ts";
import { G3_TRIPLE_FOLD } from "./g3Scenario.ts";

const props = withDefaults(defineProps<{ readonly seed?: number }>(), { seed: 13 });

const runner = createG3Runner({ seed: props.seed, dialPercent: 40 });
const projection = ref<SimProjection | null>(null);
const dial = ref(40);
const armed = ref(false);
const speedX = ref<1 | 2 | 4>(1);
let intentSeq = 0;

onMounted(() => runner.start((p) => (projection.value = p)));
onUnmounted(() => runner.stop());

function stepOnce(): void {
  projection.value = runner.headlessStep(100);
}

function onDial(event: Event): void {
  dial.value = Number((event.target as HTMLInputElement).value);
  const intent: PlayerIntent = {
    seq: (intentSeq += 1),
    clock: "sim",
    atUs: (projection.value?.tick ?? 0n) * MICROS_PER_MIN,
    origin: "player",
    payload: { kind: "slider", control: "dial", value: fromRatio(BigInt(dial.value), 100n) },
  };
  runner.submit(intent);
}

function onUpgrade(): void {
  armed.value = !armed.value;
  runner.upgradeDefense();
}

/** Fast-forward: SpeedX ∈ {1,2,4} (3× is not protocol-legal — see G1 note). */
function onSpeed(): void {
  speedX.value = speedX.value === 1 ? 4 : 1;
  runner.setSpeed(speedX.value);
}

const split = computed(() =>
  projection.value === null
    ? { express: 0, deep: 0, demoted: 0, routedExpressFresh: 0, routedDeepFresh: 0 }
    : deriveLaneSplit(projection.value),
);
const pips = computed(() => (projection.value === null ? [] : derivePips(projection.value)));
const foldPercent = computed(() => ((Number(G3_TRIPLE_FOLD) / FIXED_SCALE) * 100).toFixed(1));

function cellNum(suffix: string): number {
  if (projection.value === null) return 0;
  for (const [key, cell] of projection.value.observed) {
    if (String(key).endsWith(suffix)) return Number(cell.value ?? 0);
  }
  return 0;
}

/** Cumulative engine-cause ledger (per-node attribution rides observed cells). */
const blocksCell = computed(() => cellNum("waf-1::defenseBlocks"));
const fpsCell = computed(() => cellNum("waf-1::falsePositives"));

const stats = computed(() => {
  void projection.value;
  return runner.stats();
});

const totalSplit = computed(() => Math.max(1, split.value.routedExpressFresh + split.value.routedDeepFresh + split.value.demoted));
</script>

<template>
  <section class="g3-panel" data-test="g3-panel" aria-label="Gate G3 — the suspicion dial">
    <header class="g3-head">
      <h2>G3 · The Suspicion Dial</h2>
      <p class="g3-thesis">
        Same traffic, two lanes. The dial decides how much confidence the express lane
        tolerates; a wire-evidence fold of {{ foldPercent }}% crosses it and the unit is yanked deep.
      </p>
    </header>

    <div class="g3-dial-block">
      <label class="g3-dial-label">
        Express tolerance <b data-test="dial-value">{{ dial }}%</b>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          :value="dial"
          data-test="dial-slider"
          @input="onDial"
        />
      </label>
      <button
        type="button"
        class="g3-btn"
        :class="{ 'g3-btn--armed': armed }"
        :aria-pressed="armed"
        data-test="upgrade-defense"
        @click="onUpgrade"
      >
        Upgrade express defense: {{ armed ? "CHALLENGE" : "OFF" }}
      </button>
      <button type="button" class="g3-btn" data-test="speed-btn" @click="onSpeed">
        {{ speedX === 1 ? "⏩ 4×" : "⏱ 1×" }}
      </button>
      <button type="button" class="g3-btn" data-test="step-btn" @click="stepOnce">+1 min</button>
    </div>

    <div class="g3-lanes" data-test="lane-split">
      <div class="g3-lane g3-lane--express" data-test="lane-express">
        <span class="g3-lane-name">EXPRESS</span>
        <span class="g3-bar" :style="{ width: `${(split.routedExpressFresh / totalSplit) * 100}%` }" />
        <span class="g3-lane-num">{{ split.routedExpressFresh }} routed · {{ split.express }} live</span>
      </div>
      <div class="g3-lane g3-lane--deep" data-test="lane-deep">
        <span class="g3-lane-name">DEEP INSPECTION</span>
        <span class="g3-bar" :style="{ width: `${((split.routedDeepFresh + split.demoted) / totalSplit) * 100}%` }" />
        <span class="g3-lane-num">{{ split.routedDeepFresh }} routed · {{ split.demoted }} demoted · {{ split.deep }} live</span>
      </div>
    </div>

    <div class="g3-pips" data-test="pip-strip" aria-label="Per-unit confidence pips">
      <span
        v-for="(pip, i) in pips"
        :key="`${pip.label}-${i}`"
        class="g3-pip"
        :class="[pip.lane === 'deep' ? 'g3-pip--tri' : 'g3-pip--circle', { 'g3-pip--suspect': pip.suspicion > 0 }]"
        :style="{ opacity: 0.35 + 0.65 * Math.min(1, pip.confidence * 2) }"
        :title="`${pip.label}: confidence ${(pip.confidence * 100).toFixed(0)}% · ${pip.lane}${pip.suspicion > 0 ? ` · sticky suspicion ${(pip.suspicion * 100).toFixed(0)}%` : ''}`"
        :data-test="`pip-${pip.lane}`"
      ><i v-if="pip.suspicion > 0" class="g3-pip-dot" data-test="pip-suspect-dot" /></span>
      <span v-if="pips.length === 0" class="g3-pips-empty">lane quiet</span>
    </div>
    <p class="g3-legend">
      ● express · ▲ pulled to deep inspection · inner dot = sticky lineage suspicion
    </p>

    <dl class="g3-counters">
      <div data-test="counter-neutralized"><dt>Stopped (express arm)</dt><dd>{{ blocksCell }}</dd></div>
      <div data-test="counter-fp"><dt>Customers bounced by WAF</dt><dd>{{ fpsCell }}</dd></div>
      <div data-test="counter-demoted"><dt>Mid-path yanks</dt><dd>{{ stats.midPathDemotions }}</dd></div>
      <div data-test="counter-sticky"><dt>Sticky-lane retries</dt><dd>{{ stats.stickyDemotions }}</dd></div>
    </dl>

    <p class="g3-receipt" data-test="door-receipt" :hidden="stats.doorExecuted + stats.doorRefused === 0">
      intent door: {{ stats.doorExecuted }} executed · {{ stats.doorRefused }} refused
    </p>
  </section>
</template>

<style scoped>
.g3-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  border-radius: var(--hh-radius, 8px);
  background: var(--hh-surface, #101418);
  font-family: var(--hh-typeface, monospace);
  color: var(--hh-ink, #e8ecf1);
}
.g3-head { display: flex; gap: 12px; align-items: baseline; flex-wrap: wrap; }
.g3-head h2 { margin: 0; font-size: 15px; letter-spacing: 0.06em; text-transform: uppercase; }
.g3-thesis { margin: 0; flex: 1; min-width: 240px; font-size: 12px; opacity: 0.72; }

.g3-dial-block { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
.g3-dial-label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; flex: 1; min-width: 200px; }
.g3-btn {
  padding: 8px 12px;
  border: 1px solid currentColor;
  border-radius: var(--hh-radius, 8px);
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.g3-btn--armed { border-color: var(--hh-accent, #35e0c8); color: var(--hh-accent, #35e0c8); }

.g3-lanes { display: flex; flex-direction: column; gap: 8px; }
.g3-lane { display: grid; grid-template-columns: 140px 1fr auto; align-items: center; gap: 10px; font-size: 11px; }
.g3-lane-name { letter-spacing: 0.08em; opacity: 0.8; }
.g3-bar { height: 14px; border-radius: 3px; transition: width 400ms ease; }
.g3-lane--express .g3-bar { background: color-mix(in srgb, var(--hh-accent, #35e0c8) 70%, transparent); }
.g3-lane--deep .g3-bar { background: color-mix(in srgb, #ffb454 70%, transparent); }
.g3-lane-num { opacity: 0.7; }

.g3-pips { display: flex; align-items: center; gap: 8px; min-height: 26px; flex-wrap: wrap; }
.g3-pip { position: relative; width: 16px; height: 16px; display: inline-block; }
.g3-pip--circle { border-radius: 50%; background: var(--hh-accent, #35e0c8); }
.g3-pip--tri {
  background: #ffb454;
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
  border-radius: 0;
}
.g3-pip--suspect { outline: 1px dashed #ff5d5d; outline-offset: 2px; }
.g3-pip-dot {
  position: absolute;
  inset: 38%;
  border-radius: 50%;
  background: #ff5d5d;
}
.g3-pips-empty { font-size: 11px; opacity: 0.45; }
.g3-legend { margin: 0; font-size: 10px; opacity: 0.55; }

.g3-counters { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 0; }
.g3-counters > div { padding: 6px 8px; border: 1px dashed color-mix(in srgb, currentColor 25%, transparent); }
.g3-counters dt { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.65; }
.g3-counters dd { margin: 2px 0 0; font-size: 18px; }
.g3-receipt { margin: 0; font-size: 11px; opacity: 0.6; }
</style>
