<script setup lang="ts">
import { computed } from "vue";
import type { FaceProps } from "./faceProps";

const props = defineProps<FaceProps>();
// Needle sweeps −60°..+60°; still at nominal (no wobble — motion is departure).
const angle = computed(() => {
  const r = props.ratio ?? 0;
  return -60 + Math.max(0, Math.min(1, r)) * 120;
});
</script>

<template>
  <svg viewBox="0 0 100 64" class="face" :class="[`state-${state}`, { still: isStill }]" role="img" aria-label="needle dial">
    <path d="M10 58 A 44 44 0 0 1 90 58" fill="none" class="dial-arc" />
    <line
      :x1="50 + Math.cos(((angle - 90) * Math.PI) / 180) * -34"
      :y1="58 + Math.sin(((angle - 90) * Math.PI) / 180) * -34"
      :x2="50"
      :y2="58"
      class="needle"
      stroke-width="2"
    />
    <line
      :x1="50 + Math.cos(((( -60 + thresholdRatio * 120) - 90) * Math.PI) / 180) * 40"
      :y1="58 + Math.sin(((( -60 + thresholdRatio * 120) - 90) * Math.PI) / 180) * 40"
      x2="50"
      y2="58"
      class="threshold-mark"
    />
    <circle cx="50" cy="58" r="4" class="hub" />
    <text v-if="ratio === null" x="50" y="40" text-anchor="middle" class="no-data">?</text>
  </svg>
</template>

<style scoped>
.face { width: 100%; height: auto; display: block; }
.dial-arc { stroke: color-mix(in srgb, var(--hh-accent) 30%, transparent); }
.needle { stroke: var(--hh-accent); transition: all 140ms linear; }
.threshold-mark { stroke: var(--hh-accent); opacity: 0.5; stroke-dasharray: 3 3; }
.hub { fill: var(--hh-accent); }
.no-data { fill: var(--hh-accent); font-size: 22px; }
.state-warn .needle { stroke: var(--hh-hue-amber); }
.state-alarm .needle { stroke: var(--hh-hue-alarm); }
.state-alarm .hub { fill: var(--hh-hue-alarm); }
.still .needle { transition: none; }
/* §8.14 reduced-motion law — OS preference independent of the .still arm. */
@media (prefers-reduced-motion: reduce) { .needle { transition: none; } }
</style>
