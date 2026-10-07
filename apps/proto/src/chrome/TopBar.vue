<script setup lang="ts">
/**
 * Top bar (§1.4, §8.8 HUD skeleton): 48px fixed strip = permanent
 * instruments (cash / MRR / reputation / clock) + exactly two
 * threshold-promotion slots computed by `planPromotion` — overflow shows as
 * "+N", never silently vanishes. Manual override: each promoted chip wears a
 * pin toggle; the parent owns the candidate list and applies `toggleUserPin`
 * (chrome stays unidirectional — emit up, props down).
 *
 * Back-compat contract: `cashLabel` / `clockLabel` / `candidates` props and
 * the `.promoted-chip` / `[data-collapse]` hooks are App.vue + test pinned;
 * the extra permanent rows are opt-in.
 *
 * HUD-never-scales: everything here is px fixed in the DOM compositor tier
 * (§7.16).
 */
import { computed } from "vue";
import { planPromotion, type MetricCandidate } from "./promotion";
import type { HudPermanentRow } from "./metrics";

const props = defineProps<{
  cashLabel: string;
  clockLabel: string;
  candidates: readonly MetricCandidate[];
  /** Full permanent rows (cash/MRR/reputation/clock) when the caller wires
   *  the generalized registry; cash+clock chips stay from the labels above. */
  permanentRows?: readonly HudPermanentRow[];
  /** Which promotable ids the user has pinned (drives the pin button state). */
  pins?: Readonly<Record<string, boolean>>;
}>();

const emit = defineEmits<{ (e: "toggle-pin", id: string): void }>();

const plan = computed(() => planPromotion(props.candidates, { promotedSlots: 2 }));

/** MRR + reputation ride in as extra chips when provided (cash/clock are
 *  already rendered from the label props — no duplicates). */
const extraRows = computed(() =>
  (props.permanentRows ?? []).filter((row) => row.id !== "cash" && row.id !== "clock"),
);
</script>

<template>
  <header class="topbar" role="banner">
    <div class="permanent">
      <span class="chip cash" data-metric="cash">{{ props.cashLabel }}</span>
      <span
        v-for="row in extraRows"
        :key="row.id"
        class="chip permanent-row"
        :class="{ 'is-no-data': row.state === 'no-data' }"
        :data-metric="row.id"
        data-test="hud-permanent"
      >
        {{ row.label }} <b>{{ row.value }}</b>
      </span>
      <span class="chip clock" data-metric="clock">{{ props.clockLabel }}</span>
    </div>
    <div class="promoted" aria-label="promoted metrics">
      <span v-for="metric in plan.promoted" :key="metric.id" class="chip promoted-chip" :class="{ 'is-pinned': props.pins?.[metric.id] === true }" :data-metric="metric.id" :data-pinned="props.pins?.[metric.id] === true ? 'true' : 'false'">
        {{ metric.label }}
        <b>{{ metric.value === null ? "?" : metric.value.toFixed(1) }}</b>
        <button
          class="pin"
          type="button"
          :aria-label="props.pins?.[metric.id] === true ? `unpin ${metric.label}` : `pin ${metric.label}`"
          :aria-pressed="props.pins?.[metric.id] === true"
          data-test="pin-toggle"
          @click="emit('toggle-pin', metric.id)"
        >▸pin</button>
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
.chip.cash { border-color: var(--hh-hue-gold); color: var(--hh-hue-gold); }
.chip b { font-variant-numeric: tabular-nums; font-weight: 600; }
.permanent-row .chip, .permanent-row { color: color-mix(in srgb, var(--hh-accent) 80%, #fff); }
.permanent-row.is-no-data { opacity: .55; } /* fog: "?", never 0 (§4.1 R-66) */
.promoted-chip { border-style: dashed; border-color: color-mix(in srgb, var(--hh-accent) 55%, transparent); }
.promoted-chip.is-pinned { border-style: solid; background: color-mix(in srgb, var(--hh-accent) 22%, transparent); }
.promoted-chip b { margin-left: 6px; font-variant-numeric: tabular-nums; }
.collapse { opacity: .75; font-variant-numeric: tabular-nums; }
.pin {
  margin-left: 6px;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 10px;
  letter-spacing: .06em;
  opacity: .6;
  cursor: pointer;
}
.pin:hover, .promoted-chip.is-pinned .pin { opacity: 1; }
</style>
