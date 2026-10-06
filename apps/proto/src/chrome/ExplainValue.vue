<script setup lang="ts">
/**
 * ExplainValue — the §8.15 law "every number on screen is clickable" made
 * mechanical: wrap any figure in this and it gets the popover drill-down for
 * free (formula → inputs → inputs-of-inputs…). The display string arrives
 * pre-formatted by a numberLaw formatter; this component never re-mathes.
 *
 * Register the payload each frame via `globalExplain.register(...)` with a
 * stable id; pass that id here.
 */
import { ref } from "vue";
import ExplainPopover from "./ExplainPopover.vue";

const props = defineProps<{
  explainId: string;
  display: string;
  /** Unit stamp renders lighter than the value (§8.15). */
  unit?: string;
  /** Fog state: "?" styling — clickable still, payload may say "no data". */
  noData?: boolean;
}>();

const open = ref(false);
</script>

<template>
  <span class="explainable" data-test="explain-value" :data-explain-id="props.explainId">
    <button
      type="button"
      class="figure"
      :class="{ 'is-no-data': props.noData === true }"
      :aria-expanded="open"
      @click="open = !open"
    >
      {{ props.display }}<i v-if="props.unit !== undefined" class="unit">{{ props.unit }}</i>
    </button>
    <ExplainPopover v-if="open" :root-id="props.explainId" :open="true" @close="open = false" />
  </span>
</template>

<style scoped>
.explainable { position: relative; display: inline-flex; }
.figure {
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  font-variant-numeric: tabular-nums; /* Number Law: tabular figures */
  padding: 0 1px;
  cursor: pointer;
  border-bottom: 1px dotted color-mix(in srgb, var(--hh-accent) 40%, transparent);
}
.figure:hover { border-bottom-style: solid; }
.figure.is-no-data { opacity: .55; } /* "?" never "0" */
.unit { font-style: normal; font-size: .72em; font-weight: 300; opacity: .55; margin-left: 2px; }
</style>
