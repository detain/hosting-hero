<script setup lang="ts">
import { computed } from "vue";
import type { FaceProps } from "./faceProps";

const props = defineProps<FaceProps>();
// Oscilloscope: the bezel feeds the rolling trace; this face only plots.
const points = computed(() => {
  const series = props.samples && props.samples.length > 1 ? props.samples : [props.ratio ?? 0];
  const n = series.length;
  return series
    .map((v, i) => {
      const x = 4 + (92 * i) / Math.max(1, n - 1);
      const y = 44 - Math.max(0, Math.min(1, v)) * 38;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
});
</script>

<template>
  <svg viewBox="0 0 100 48" class="face" :class="[`state-${state}`, { still: isStill }]" role="img" aria-label="oscilloscope trace">
    <rect x="2" y="2" width="96" height="44" class="screen" />
    <line x1="2" :y1="44 - Math.max(0, Math.min(1, thresholdRatio)) * 38" x2="98" :y2="44 - Math.max(0, Math.min(1, thresholdRatio)) * 38" class="threshold-mark" />
    <polyline v-if="ratio !== null" :points="points" class="trace" fill="none" />
    <text v-else x="50" y="28" text-anchor="middle" class="no-data">?</text>
  </svg>
</template>

<style scoped>
.face { width: 100%; height: auto; display: block; }
.screen { fill: #05080c; stroke: var(--hh-accent); stroke-opacity: .3; } /* screen-black: hueLaw allowlist neutral */
.trace { stroke: var(--hh-accent); stroke-width: 1.5; }
.threshold-mark { stroke: var(--hh-accent); opacity: .5; stroke-dasharray: 2 2; }
.no-data { fill: var(--hh-accent); font-size: 16px; }
.state-warn .trace { stroke: var(--hh-hue-amber); }
.state-alarm .trace { stroke: var(--hh-hue-alarm); }
</style>
