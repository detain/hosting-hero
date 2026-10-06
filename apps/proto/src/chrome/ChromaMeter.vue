<script setup lang="ts">
/**
 * ChromaMeter (§1.9): the live developer overlay counting hues / FX / animated
 * elements / labels with RED on breach — "also ships player-visible as an
 * accessibility readout". It is a pure VIEW over BudgetManager.snapshot():
 * zero enforcement here — all authority stays in the gate.
 */
import { onBeforeUnmount, onMounted, ref } from "vue";
import type { BudgetManager, BudgetSnapshot } from "../render/budget";

const props = defineProps<{ budget: BudgetManager; visible: boolean }>();

const snap = ref<BudgetSnapshot | null>(null);
let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  timer = setInterval(() => {
    if (props.visible) snap.value = props.budget.snapshot();
  }, 500);
});
onBeforeUnmount(() => {
  if (timer !== null) clearInterval(timer);
});
</script>

<template>
  <div v-if="visible && snap" class="chroma" :class="{ breach: snap.breach }" role="status">
    <h3>CHROMA METER</h3>
    <dl>
      <div><dt>Alert hues</dt><dd>{{ snap.used.alertHue }}/{{ snap.caps.alertHue }} — {{ snap.activeHues.join(" ") || "—" }}</dd></div>
      <div><dt>Overlays</dt><dd>{{ snap.used.overlay }}/{{ snap.caps.overlay }}</dd></div>
      <div><dt>Event FX</dt><dd>{{ snap.used.eventFx }}/{{ snap.caps.eventFx }}</dd></div>
      <div><dt>Promoted clocks</dt><dd>{{ snap.used.promotedClock }}/{{ snap.caps.promotedClock }}</dd></div>
      <div><dt>Labels</dt><dd>{{ snap.used.label }}</dd></div>
      <div><dt>Clusters “+N”</dt><dd>{{ Object.values(snap.clusters).reduce((a, b) => a + b, 0) }}</dd></div>
    </dl>
  </div>
</template>

<style scoped>
.chroma {
  position: absolute;
  right: 16px;
  bottom: 64px;
  width: 260px;
  background: rgba(4, 8, 12, 0.88);
  border: 1px solid #4fc46a;
  padding: 10px 12px;
  font-family: var(--hh-typeface);
  color: #d7e3ea;
  font-size: 12px;
  z-index: 40;
}
.chroma.breach { border-color: #e23b3b; }
h3 { margin: 0 0 8px; font-size: 11px; letter-spacing: .18em; color: #4fc46a; }
.breach h3 { color: #e23b3b; }
dl { margin: 0; display: grid; gap: 3px; }
dl > div { display: flex; justify-content: space-between; gap: 8px; }
dt { opacity: .65; }
dd { margin: 0; font-variant-numeric: tabular-nums; }
</style>
