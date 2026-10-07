<script setup lang="ts">
/**
 * Bezel HUD (§1.4): the 10px inner border carrying the off-board register —
 * overlay tint + worst-severity top rule + pressure lip. Purely presentational;
 * severity comes from the chrome's instrument readings (one observed source).
 */
import type { InstrumentState } from "./instruments/registry";

defineProps<{
  worstState: InstrumentState;
  /** Arrival surge = pressure lip brightens (two-channel: motion + border). */
  spiking: boolean;
}>();
</script>

<template>
  <div class="bezel-hud" :class="[`sev-${worstState}`, { spiking }]" aria-hidden="true" />
</template>

<style scoped>
.bezel-hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border: 10px solid transparent;
  border-image: none;
  box-shadow: inset 0 0 0 10px color-mix(in srgb, var(--hh-surface) 78%, #000);
}
/* worst-severity top rule */
.bezel-hud::before {
  content: "";
  position: absolute;
  top: -10px;
  left: 0;
  right: 0;
  height: 3px;
  background: transparent;
}
.bezel-hud::after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 0;
  right: 0;
  height: 2px;
  background: transparent;
}
.sev-warn::before { background: var(--hh-hue-amber); }
.sev-alarm::before { background: var(--hh-hue-alarm); } /* the alarm job, one value */
.sev-no-data::before { background: repeating-linear-gradient(90deg, var(--hh-hue-grey) 0 6px, transparent 6px 12px); }
.spiking::after { background: color-mix(in srgb, var(--hh-accent) 70%, transparent); animation: lip 2s ease-in-out infinite; }
@keyframes lip { 0%, 100% { opacity: .35; } 50% { opacity: .9; } }
@media (prefers-reduced-motion: reduce) {
  .spiking::after { animation: none; opacity: .6; }
}
</style>
