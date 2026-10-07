<script setup lang="ts">
/**
 * SimLabPanel — the rail's single "Sim Lab" entry (sandbox mechanic: it is
 * NOT a §9.13 gate; gates/index.ts never hears of it). Internal tabs keep
 * BOTH lab panels mounted with v-show so a ran weekend survives a tab flip —
 * the report is the point of the bench, not scenery.
 */
import { ref } from "vue";
import UnattendedLabPanel from "./UnattendedLabPanel.vue";
import CoverageGridPanel from "./CoverageGridPanel.vue";

type LabTab = "weekend" | "coverage";
const tab = ref<LabTab>("weekend");
</script>

<template>
  <div class="sim-lab" data-test="sim-lab">
    <nav class="lab-tabs" role="tablist" aria-label="sim lab sections">
      <button
        type="button"
        role="tab"
        :aria-selected="tab === 'weekend'"
        class="lab-tab"
        :class="{ active: tab === 'weekend' }"
        data-test="lab-tab-weekend"
        @click="tab = 'weekend'"
      >
        Unattended Weekend
      </button>
      <button
        type="button"
        role="tab"
        :aria-selected="tab === 'coverage'"
        class="lab-tab"
        :class="{ active: tab === 'coverage' }"
        data-test="lab-tab-coverage"
        @click="tab = 'coverage'"
      >
        Coverage Grid
      </button>
    </nav>
    <div v-show="tab === 'weekend'" role="tabpanel" data-test="lab-panel-weekend">
      <UnattendedLabPanel />
    </div>
    <div v-show="tab === 'coverage'" role="tabpanel" data-test="lab-panel-coverage">
      <CoverageGridPanel />
    </div>
  </div>
</template>

<style scoped>
.lab-tabs { display: flex; gap: 4px; border-bottom: 1px solid color-mix(in srgb, var(--hh-accent) 22%, transparent); padding: 8px 18px 0; }
.lab-tab {
  font: inherit;
  font-size: 12px;
  letter-spacing: 0.04em;
  background: transparent;
  color: color-mix(in srgb, var(--hh-accent) 70%, transparent);
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: var(--hh-radius) var(--hh-radius) 0 0;
  padding: 4px 14px;
  cursor: pointer;
}
.lab-tab.active {
  color: var(--hh-accent);
  border-color: color-mix(in srgb, var(--hh-accent) 30%, transparent);
  background: color-mix(in srgb, var(--hh-surface) 80%, #fff 3%);
}
</style>
