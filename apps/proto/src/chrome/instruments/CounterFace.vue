<script setup lang="ts">
import { computed } from "vue";
import type { FaceProps } from "./faceProps";

const props = defineProps<FaceProps>();
// Counter face: tabular figures + digit rolling when off-nominal (§8.15 Number
// Law). Null renders "?" in the same slot footprint — NO DATA ≠ 0.
const digits = computed(() => {
  if (props.ratio === null) return ["?"];
  const value = Math.round(props.ratio * 1000);
  return value.toString().padStart(4, "0").split("");
});
</script>

<template>
  <div class="face counter" :class="[`state-${state}`, { still: isStill }]" role="img" aria-label="digit counter">
    <span v-for="(digit, i) in digits" :key="i" class="digit" :data-rolling="!isStill && digit !== '?' ? 'yes' : undefined">{{ digit }}</span>
  </div>
</template>

<style scoped>
.counter { display: flex; gap: 2px; font-family: var(--hh-typeface); font-variant-numeric: tabular-nums; font-size: 26px; letter-spacing: .04em; }
.digit { background: color-mix(in srgb, var(--hh-surface) 70%, #000); color: var(--hh-accent); padding: 2px 5px; border-radius: calc(var(--hh-radius) / 2); }
.state-warn .digit { color: var(--hh-hue-amber); }
.state-alarm .digit { color: var(--hh-hue-alarm); }
.digit[data-rolling="yes"] { animation: roll 320ms ease-out; }
@keyframes roll { from { transform: translateY(-40%); opacity: .2; } to { transform: none; opacity: 1; } }
.still .digit { animation: none; }
/* §8.14 reduced-motion law: the OS preference must work without the .still
   (Readout) arm — additive guard, pinned by chrome/a11y/motionAudit scan. */
@media (prefers-reduced-motion: reduce) { .digit[data-rolling="yes"] { animation: none; } }
</style>
