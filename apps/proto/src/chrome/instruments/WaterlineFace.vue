<script setup lang="ts">
import type { FaceProps } from "./faceProps";
defineProps<FaceProps>();
</script>

<template>
  <svg viewBox="0 0 64 80" class="face" :class="[`state-${state}`, { still: isStill }]" role="img" aria-label="waterline column">
    <rect x="8" y="6" width="48" height="68" class="glass" />
    <template v-if="ratio !== null">
      <rect x="8" :y="6 + 68 * (1 - Math.max(0, Math.min(1, ratio)))" width="48" :height="68 * Math.max(0, Math.min(1, ratio))" class="liquid" />
      <line x1="8" :y1="6 + 68 * (1 - Math.max(0, Math.min(1, thresholdRatio)))" x2="56" :y2="6 + 68 * (1 - Math.max(0, Math.min(1, thresholdRatio)))" class="threshold-mark" stroke-dasharray="4 2" />
    </template>
    <text v-else x="32" y="44" text-anchor="middle" class="no-data">?</text>
  </svg>
</template>

<style scoped>
.face { width: 100%; max-width: 96px; height: auto; display: block; margin: 0 auto; }
.glass { fill: color-mix(in srgb, var(--hh-surface) 60%, #000); stroke: var(--hh-accent); stroke-opacity: .4; }
.liquid { fill: var(--hh-accent); opacity: .85; transition: all 200ms linear; }
.threshold-mark { stroke: var(--hh-accent); }
.no-data { fill: var(--hh-accent); font-size: 20px; }
.state-warn .liquid { fill: var(--hh-hue-amber); }
.state-alarm .liquid { fill: var(--hh-hue-alarm); }
.still .liquid { transition: none; }
/* §8.14 reduced-motion law — OS preference independent of the .still arm. */
@media (prefers-reduced-motion: reduce) { .liquid { transition: none; } }
</style>
