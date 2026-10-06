<script setup lang="ts">
/**
 * gates/g1 · G1GatePanel — "the bounce loop" playable slice (§9.13 #1).
 *
 * Thesis: the central tension (defense vs friction) must land inside 90
 * seconds. The panel is deliberately small: ONE lane with beads, ONE defense
 * toggle (a real intent-door verb), the aggression slider (the one legal
 * pre-door control), and the live triad with Explain-This-Number tooltips.
 *
 * Renderer law: the template consumes ONLY protocol data — LaneStats
 * aggregates for the lane/beads, ObservedCells for the triad, protocol
 * counters for the ticker. No unit ids, no ground-truth reads.
 *
 * Motion budget: CSS-only (heartbeat-free); the bead field is an aggregate
 * count, so the paint cost is bounded by 12 elements regardless of traffic.
 */
import { computed, onMounted, onUnmounted, ref } from "vue";
import { MICROS_PER_MIN, fromRatio } from "@hh/sim-core/kernel";
import type { PlayerIntent } from "@hh/sim-core/types";
import type { SimProjection } from "../../shared/protocol.ts";
import { fixedToDisplay } from "../../shared/protocol.ts";
import { createG1Runner, type G1Runner } from "./g1Runner.ts";
import type { G1Triad } from "./g1Scenario.ts";
import { explainTriad } from "./explain.ts";

const props = withDefaults(defineProps<{ readonly seed?: number }>(), { seed: 7 });

const BEAD_CAP = 12;
const runner: G1Runner = createG1Runner({ seed: props.seed, aggressionPercent: 0 });
const projection = ref<SimProjection | null>(null);
const percent = ref(0);
const defenseOn = ref(true);
const speedX = ref<1 | 2 | 4>(1);
let intentSeq = 0;

onMounted(() => {
  runner.start((p) => (projection.value = p));
});
onUnmounted(() => runner.stop());

/** Manual macro-tick — deterministic demo control (and the test's door into
 *  the loop without wall-clock timers). */
function stepOnce(): void {
  projection.value = runner.headlessStep(100);
}

function onSlider(event: Event): void {
  percent.value = Number((event.target as HTMLInputElement).value);
  const intent: PlayerIntent = {
    seq: (intentSeq += 1),
    clock: "sim",
    atUs: (projection.value?.tick ?? 0n) * MICROS_PER_MIN,
    origin: "player",
    payload: { kind: "slider", control: "aggression", value: fromRatio(BigInt(percent.value), 100n) },
  };
  runner.submit(intent);
}

function onToggleDefense(): void {
  defenseOn.value = !defenseOn.value;
  runner.toggleDefense();
}

/** Fast-forward test button. NOTE for the orchestrator: the task said "3×
 *  speed"; the protocol's SpeedX union is 1|2|4 (shared/protocol.ts), so the
 *  closest legal fast-forward step is 4×. Kept honest rather than widened. */
function onSpeed(): void {
  speedX.value = speedX.value === 1 ? 4 : 1;
  runner.setSpeed(speedX.value);
}

/* ── protocol-derived view model ─────────────────────────────────────── */

const lane = computed(() => projection.value?.lanes[0] ?? null);
const arrivalsPerMin = computed(() => (lane.value === null ? 0 : Math.round(fixedToDisplay(lane.value.ratePerMin))));
const health = computed(() => (lane.value === null ? 1 : fixedToDisplay(lane.value.health)));
const beadCount = computed(() => Math.min(BEAD_CAP, arrivalsPerMin.value));
const beadOverflow = computed(() => Math.max(0, arrivalsPerMin.value - BEAD_CAP));

/** Renderer law: every number on this panel comes through the protocol —
 *  the cumulative triad ObservedCells are the canonical channel. */
function cellNumber(property: string): number {
  if (projection.value === null) return 0;
  for (const [key, cell] of projection.value.observed) {
    if (String(key).endsWith(`::${property}`)) return Number(cell.value ?? 0);
  }
  return 0;
}

const triad = computed<G1Triad>(() => ({
  neutralized: cellNumber("defenseBlocks"),
  falsePositives: cellNumber("falsePositives"),
  threatsLanded: cellNumber("threatsLanded"),
  benignServed: cellNumber("benignServed"),
  fpWasteUs: BigInt(cellNumber("fpWasteUs")),
  patienceBounces: cellNumber("patienceBounces"),
  doorExecuted: cellNumber("doorExecuted"),
  doorRefused: cellNumber("doorRefused"),
}));

const explanations = computed(() => explainTriad(triad.value, percent.value, defenseOn.value ? "challenge" : "pass-through"));
const wasteSeconds = computed(() => (Number(triad.value.fpWasteUs) / 1_000_000).toFixed(1));
const tick = computed(() => (projection.value === null ? "—" : String(projection.value.tick)));
</script>

<template>
  <section class="g1-panel" data-test="g1-panel" aria-label="Gate G1 — the bounce loop">
    <header class="g1-head">
      <h2>G1 · The Bounce Loop</h2>
      <p class="g1-thesis">Defense buys captures and costs customers. Push the slider — watch all three move.</p>
      <span class="g1-tick" data-test="tick-readout">min {{ tick }}</span>
    </header>

    <div class="g1-lane" :style="{ opacity: 0.35 + 0.65 * health }" data-test="lane-strip">
      <span
        v-for="i in beadCount"
        :key="i"
        class="g1-bead"
        :class="{ 'g1-bead--hot': health < 0.7 }"
        data-test="bead"
      />
      <span v-if="beadOverflow > 0" class="g1-overflow" data-test="bead-overflow">+{{ beadOverflow }}/min</span>
      <span v-if="beadCount === 0" class="g1-idle">lane idle</span>
    </div>
    <p class="g1-lane-caption" data-test="lane-caption">
      {{ arrivalsPerMin }} arrivals/min · lane health {{ Math.round(health * 100) }}%
    </p>

    <div class="g1-controls">
      <label class="g1-slider-block">
        <span class="g1-label">Aggression <b data-test="aggression-value">{{ percent }}%</b></span>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          :value="percent"
          data-test="aggression-slider"
          @input="onSlider"
        />
        <span class="g1-slider-hint">moves capture probability ↔ false-positive rate — never a damage number</span>
      </label>

      <button
        type="button"
        class="g1-btn"
        :class="{ 'g1-btn--armed': defenseOn }"
        :aria-pressed="defenseOn"
        data-test="defense-toggle"
        @click="onToggleDefense"
      >
        WAF challenge lane: {{ defenseOn ? "ON" : "OFF" }}
      </button>

      <button type="button" class="g1-btn" data-test="speed-btn" @click="onSpeed">
        {{ speedX === 1 ? "⏩ 4× fast-forward" : "⏱ 1× normal" }}
      </button>

      <button type="button" class="g1-btn g1-btn--step" data-test="step-btn" @click="stepOnce">
        +1 min
      </button>
    </div>

    <dl class="g1-triad" data-test="triad">
      <div class="g1-triad-item" data-test="triad-neutralized">
        <dt>Stopped <button type="button" class="g1-why" :title="explanations.neutralized" data-test="explain-neutralized" aria-label="Explain this number">?</button></dt>
        <dd>{{ triad.neutralized }}</dd>
      </div>
      <div class="g1-triad-item" data-test="triad-false-positives">
        <dt>Bounced customers <button type="button" class="g1-why" :title="explanations.falsePositives" data-test="explain-false-positives" aria-label="Explain this number">?</button></dt>
        <dd>{{ triad.falsePositives }}</dd>
      </div>
      <div class="g1-triad-item" data-test="triad-landed">
        <dt>Breaches landed <button type="button" class="g1-why" :title="explanations.threatsLanded" data-test="explain-landed" aria-label="Explain this number">?</button></dt>
        <dd>{{ triad.threatsLanded }}</dd>
      </div>
      <div class="g1-triad-item g1-triad-item--wide" data-test="triad-waste">
        <dt>Friction tax <button type="button" class="g1-why" :title="explanations.waste" data-test="explain-waste" aria-label="Explain this number">?</button></dt>
        <dd>{{ wasteSeconds }}s of WAF time</dd>
      </div>
    </dl>

    <p class="g1-receipt" data-test="door-receipt" :hidden="triad.doorExecuted + triad.doorRefused === 0">
      intent door: {{ triad.doorExecuted }} executed · {{ triad.doorRefused }} refused
    </p>
  </section>
</template>

<style scoped>
.g1-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  border-radius: var(--hh-radius, 8px);
  background: var(--hh-surface, #101418);
  font-family: var(--hh-typeface, monospace);
  color: var(--hh-ink, #e8ecf1);
}
.g1-head { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
.g1-head h2 { margin: 0; font-size: 15px; letter-spacing: 0.06em; text-transform: uppercase; }
.g1-thesis { margin: 0; flex: 1; min-width: 220px; font-size: 12px; opacity: 0.72; }
.g1-tick { font-size: 12px; opacity: 0.6; }

.g1-lane {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 6px 10px;
  border-left: 3px solid var(--hh-accent, #35e0c8);
  background: linear-gradient(90deg, color-mix(in srgb, var(--hh-accent, #35e0c8) 12%, transparent), transparent);
}
.g1-bead {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--hh-accent, #35e0c8);
  animation: g1-pulse 1.6s ease-in-out infinite;
}
.g1-bead--hot { background: #ff5d5d; }
.g1-overflow { font-size: 11px; opacity: 0.7; }
.g1-idle { font-size: 11px; opacity: 0.45; }
@keyframes g1-pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.25); opacity: 1; }
}
.g1-lane-caption { margin: 0; font-size: 11px; opacity: 0.65; }

.g1-controls { display: flex; align-items: flex-end; gap: 14px; flex-wrap: wrap; }
.g1-slider-block { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 200px; }
.g1-label { font-size: 12px; }
.g1-slider-hint { font-size: 10px; opacity: 0.55; }
.g1-btn {
  padding: 8px 12px;
  border: 1px solid currentColor;
  border-radius: var(--hh-radius, 8px);
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.g1-btn--armed { border-color: var(--hh-accent, #35e0c8); color: var(--hh-accent, #35e0c8); }

.g1-triad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 0; }
.g1-triad-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  border: 1px dashed color-mix(in srgb, currentColor 25%, transparent);
}
.g1-triad-item--wide { grid-column: 1 / -1; }
.g1-triad dt { display: flex; align-items: center; gap: 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.7; }
.g1-triad dd { margin: 0; font-size: 22px; }
.g1-why {
  width: 16px; height: 16px; padding: 0;
  border-radius: 50%;
  border: 1px solid currentColor;
  background: transparent;
  color: inherit;
  font-size: 10px;
  cursor: help;
}
.g1-receipt { margin: 0; font-size: 11px; opacity: 0.6; }
</style>
