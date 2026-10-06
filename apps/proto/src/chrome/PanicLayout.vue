<script setup lang="ts">
/**
 * Panic Layout (§8.15 Big Number Rule, §8.8 klaxon furniture) — wraps the
 * HUD, and when the klaxon runs it dims every child marked
 * `data-hud-optional="true"` and promotes THE number: exactly one large
 * figure owns the screen — cash while calm, INCIDENT COST during panic.
 *
 * It consumes alert state, it does not mint its own: panic comes from
 * metrics.worstState + isSpiking on the live projection and the shared
 * BudgetManager's breach flag (ChromaMeter's own snapshot source).
 */
import { computed, onBeforeUnmount, onMounted, ref, useSlots } from "vue";
import { projection } from "../state/observedStore";
import { worstState, isSpiking } from "./metrics";
import { globalBudget, type BudgetSnapshot } from "../render/budget";
import { bigNumberDecision, derivePanic, incidentCost, type PanicLevel } from "./panic";
import { formatMoney, tabularNumber } from "./numberLaw";

const slots = useSlots();

const budget = ref<BudgetSnapshot | null>(null);
let sampler: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  sampler = setInterval(() => {
    budget.value = globalBudget.snapshot();
  }, 500);
  budget.value = globalBudget.snapshot();
});
onBeforeUnmount(() => {
  if (sampler !== null) clearInterval(sampler);
});

const level = computed<PanicLevel>(() => {
  const p = projection.value;
  if (p === null) return "calm";
  return derivePanic({ worst: worstState(p), spiking: isSpiking(p), budget: budget.value });
});

const cost = computed(() => {
  const p = projection.value;
  if (p === null) return null;
  return incidentCost(p.counters);
});

const owner = computed(() => bigNumberDecision(level.value));
</script>

<template>
  <div class="panic-layout" :class="`level-${level}`" :data-panic-level="level" data-test="panic-layout">
    <div
      v-if="owner === 'incident-cost' && cost !== null"
      class="headline headline--incident"
      data-test="panic-headline"
      role="alert"
    >
      <span class="kicker">incident cost — burning</span>
      <span class="big">{{ formatMoney(cost.microUsd) }}</span>
      <span class="sub">
        {{ tabularNumber(cost.falsePositives) }} visitors wrongly challenged · {{ tabularNumber(cost.landed) }} landed
      </span>
    </div>
    <div v-else class="headline headline--quiet" data-test="calm-headline-hidden" />
    <div class="content" :class="{ dimming: owner === 'incident-cost' }">
      <slot />
      <p v-if="slots.default === undefined" class="nodata">panic layout idle — nothing wrapped</p>
    </div>
  </div>
</template>

<style scoped>
.panic-layout { position: relative; font-family: var(--hh-typeface); }
.headline { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 0; }
.headline--quiet { display: none; }
.headline--incident .kicker { font-size: 10px; letter-spacing: .22em; text-transform: uppercase; color: #ef6a5a; }
.headline--incident .big {
  font-size: clamp(40px, 7vw, 76px); /* THE one large number (§8.15) */
  font-weight: 700;
  line-height: 1;
  color: #ef6a5a;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 24px color-mix(in srgb, #ef6a5a 40%, transparent);
}
.headline--incident .sub { font-size: 11px; opacity: .75; font-variant-numeric: tabular-nums; }
.level-panic { animation: klaxon 1.6s ease-in-out infinite; }
@keyframes klaxon {
  0%, 100% { background: transparent; }
  50% { background: color-mix(in srgb, #ef6a5a 5%, transparent); }
}
@media (prefers-reduced-motion: reduce) { .level-panic { animation: none; } }
/* "Nothing on the HUD the player cannot act on": optional furniture fades. */
.content :slotted([data-hud-optional="true"]) { transition: opacity .4s ease; }
.content.dimming :slotted([data-hud-optional="true"]) { opacity: .16; pointer-events: none; }
@media (prefers-reduced-motion: reduce) { .content :slotted([data-hud-optional="true"]) { transition: none; } }
.nodata { font-size: 11px; opacity: .4; text-align: center; }
</style>
