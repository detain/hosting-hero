<script setup lang="ts">
/**
 * Top bar (§1.4): permanent instruments (cash / clock) + exactly two
 * threshold-promotion slots computed by `planPromotion` — overflow shows as
 * "+N", never silently vanishes. HUD-never-scales: everything here is px
 * fixed in the DOM compositor tier (§7.16).
 */
import { computed } from "vue";
import { planPromotion, type MetricCandidate } from "./promotion";

const props = defineProps<{
  cashLabel: string;
  clockLabel: string;
  candidates: readonly MetricCandidate[];
}>();

const plan = computed(() => planPromotion(props.candidates, { promotedSlots: 2 }));
</script>

<template>
  <header class="topbar" role="banner">
    <div class="permanent">
      <span class="chip cash" data-metric="cash">{{ props.cashLabel }}</span>
      <span class="chip clock" data-metric="clock">{{ props.clockLabel }}</span>
    </div>
    <div class="promoted" aria-label="promoted metrics">
      <span v-for="metric in plan.promoted" :key="metric.id" class="chip promoted-chip" :data-metric="metric.id">
        {{ metric.label }}
        <b>{{ metric.value === null ? "?" : metric.value.toFixed(1) }}</b>
      </span>
      <span v-if="plan.collapsedCount > 0" class="chip collapse" data-collapse>+{{ plan.collapsedCount }}</span>
    </div>
    <div class="spacer" />
    <slot name="right" />
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 48px;
  padding: 0 16px;
  background: color-mix(in srgb, var(--hh-surface) 92%, #000);
  border-bottom: 1px solid color-mix(in srgb, var(--hh-accent) 30%, transparent);
  font-family: var(--hh-typeface);
}
.permanent, .promoted { display: flex; gap: 8px; }
.spacer { flex: 1; }
.chip {
  padding: 3px 10px;
  border-radius: var(--hh-radius);
  font-size: 13px;
  letter-spacing: .03em;
  background: color-mix(in srgb, var(--hh-accent) 10%, transparent);
  color: var(--hh-accent);
  border: 1px solid transparent;
}
.chip.cash { border-color: #e8b23c; color: #e8b23c; }
.promoted-chip { border-style: dashed; border-color: color-mix(in srgb, var(--hh-accent) 55%, transparent); }
.promoted-chip b { margin-left: 6px; font-variant-numeric: tabular-nums; }
.collapse { opacity: .75; font-variant-numeric: tabular-nums; }
</style>
