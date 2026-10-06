<script setup lang="ts">
import type { FaceProps } from "./faceProps";
defineProps<FaceProps>();
</script>

<template>
  <svg viewBox="0 0 100 34" class="face" :class="[`state-${state}`, { still: isStill }]" role="img" aria-label="bar meter">
    <rect x="2" y="10" width="96" height="14" class="track" />
    <rect v-if="ratio !== null" x="2" y="10" :width="96 * Math.max(0, Math.min(1, ratio))" height="14" class="fill" />
    <line v-if="ratio !== null" :x1="2 + 96 * Math.max(0, Math.min(1, thresholdRatio))" :x2="2 + 96 * Math.max(0, Math.min(1, thresholdRatio))" y1="6" y2="28" class="threshold-mark" />
    <text v-if="ratio === null" x="50" y="22" text-anchor="middle" class="no-data">?</text>
    <!-- Two-Channel Law: shape glyph rides the bar (greyscale pass survives) -->
    <polygon v-if="state === 'alarm'" points="90,2 97,13 83,13" class="alarm-glyph" />
  </svg>
</template>

<style scoped>
.face { width: 100%; height: auto; display: block; }
.track { fill: color-mix(in srgb, var(--hh-surface) 70%, #000); stroke: var(--hh-accent); stroke-opacity: .35; }
.fill { fill: var(--hh-accent); transition: width 140ms linear; }
.threshold-mark { stroke: var(--hh-accent); }
.no-data { fill: var(--hh-accent); font-size: 14px; }
.state-warn .fill { fill: #f2b133; }
.state-alarm .fill { fill: #e23b3b; }
.alarm-glyph { fill: #e23b3b; }
.still .fill { transition: none; }
</style>
