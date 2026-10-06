<script setup lang="ts">
/**
 * Status Chip (§8.2, §8.15) — one of the twelve, rendered on BOTH channels:
 * colour via semantic tone class, meaning-preserving shape via the notch
 * path. Greyscale-safe by construction: the notch SVG uses currentColor on a
 * stroke, so with the colour channel stripped the geometry still separates
 * all twelve states (asserted in tests by path distinctness).
 */
import { computed } from "vue";
import { isStatusValue, notchDash, notchPath, statusChipFor, type StatusValue } from "./statusChip";

const props = defineProps<{
  /** Off-vocabulary strings degrade to UNVERIFIED — fog of authorship is a
   *  real state, and lying HEALTHY about the unknown is the worse sin. */
  value: string;
  /** Optional count badge (chips fold grouped states). */
  count?: number;
}>();

const spec = computed(() => {
  if (isStatusValue(props.value)) return statusChipFor(props.value);
  return statusChipFor("UNVERIFIED" satisfies StatusValue);
});
</script>

<template>
  <span class="chip" :class="`tone-${spec.tone}`" :data-status="spec.value" :title="spec.meaning" data-test="status-chip">
    <svg class="notch" viewBox="0 0 10 10" width="10" height="10" aria-hidden="true" focusable="false">
      <path :d="notchPath(spec.notch)" :stroke-dasharray="notchDash(spec.notch)" />
    </svg>
    <span class="label">{{ spec.value }}</span>
    <b v-if="props.count !== undefined" class="count">{{ props.count }}</b>
  </span>
</template>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px 2px 6px;
  font-family: var(--hh-typeface);
  font-size: 10px;
  letter-spacing: .1em;
  border-radius: var(--hh-radius);
  border: 1px solid currentColor;
}
.notch path { fill: none; stroke: currentColor; stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; }
.label { font-weight: 600; }
.count { font-variant-numeric: tabular-nums; opacity: .8; }
.tone-ok { color: #57d38a; }
.tone-warn { color: #e8b23c; }
.tone-danger { color: #ef6a5a; }
.tone-info { color: #6fb6ff; }
.tone-accent { color: var(--hh-accent); }
.tone-faded { color: #8b949e; }
</style>
