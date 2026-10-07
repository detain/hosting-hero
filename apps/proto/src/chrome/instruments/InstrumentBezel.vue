<script setup lang="ts">
/**
 * One bezel, any face, era-skinned (§1.6: "all faces in one bezel so it's not
 * 30 HUDs"; "every gauge changes era free"). Readout Mode replaces the diegetic
 * face with the honest text — both always available (§1.10).
 */
import { computed, ref, watch } from "vue";
import type { InstrumentDef, InstrumentReading } from "./registry";
import { instrumentReading, formatReadout } from "./registry";
import { faceComponent } from "./faces";
import { cell } from "../../state/observedStore";
import { asEntityId } from "@hh/sim-core";

const props = defineProps<{
  def: InstrumentDef;
  readout: boolean;
}>();

const reading = computed<InstrumentReading>(() =>
  instrumentReading(props.def, cell(asEntityId(props.def.entity), props.def.property)),
);

const thresholdRatio = computed(() =>
  Math.max(0, Math.min(1, props.def.threshold / (props.def.fullScale || 1))),
);

// Rolling trace buffer for the oscilloscope face (display-side memory only).
const samples = ref<number[]>([]);
watch(reading, (r) => {
  if (r.ratio === null) return;
  samples.value = [...samples.value.slice(-23), r.ratio];
});

const face = computed(() => faceComponent(props.def.face));
</script>

<template>
  <figure class="bezel" :class="[`state-${reading.state}`]" :aria-label="formatReadout(def, reading)">
    <figcaption class="bezel-head">
      <span class="label">{{ def.label }}</span>
      <span class="value">{{ reading.state === "no-data" ? "?" : (reading.value ?? 0).toFixed(def.scale === "fixed" ? 2 : 0) }}</span>
      <span class="unit">{{ def.unit }}</span>
    </figcaption>

    <component
      v-if="!readout"
      :is="face"
      :ratio="reading.ratio"
      :threshold-ratio="thresholdRatio"
      :state="reading.state"
      :is-still="reading.isStill"
      :samples="samples"
    />
    <p v-else class="readout">{{ formatReadout(def, reading) }}</p>

    <footer class="bezel-foot">
      <!-- nominal band stamp: instruments explain themselves (§1.8) -->
      <span class="nominal">nominal {{ def.nominal[0] }}–{{ def.nominal[1] }} {{ def.unit }}</span>
      <span v-if="reading.state === 'no-data'" class="fog">fog: not instrumented</span>
      <span v-else-if="reading.certainty < 0.5" class="fog">inferred</span>
    </footer>
  </figure>
</template>

<style scoped>
.bezel {
  margin: 0;
  border: 1px solid color-mix(in srgb, var(--hh-accent) 40%, transparent);
  border-radius: var(--hh-radius);
  background: color-mix(in srgb, var(--hh-surface) 88%, #000);
  padding: 10px 12px 8px;
  min-width: 190px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03), 0 8px 24px rgba(0, 0, 0, 0.45);
}
.bezel-head { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; }
.label { font-family: var(--hh-typeface); text-transform: uppercase; letter-spacing: .12em; font-size: 11px; opacity: .7; }
.value { margin-left: auto; font-family: var(--hh-typeface); font-variant-numeric: tabular-nums; font-size: 20px; color: var(--hh-accent); }
.unit { font-size: 11px; opacity: .6; color: var(--hh-accent); }
.readout { font-family: var(--hh-typeface); font-size: 15px; color: var(--hh-accent); margin: 12px 0; }
.bezel-foot { display: flex; justify-content: space-between; margin-top: 6px; font-size: 10px; opacity: .55; }
.nominal { color: var(--hh-accent); }
.fog { color: var(--hh-hue-warm-grey-amber); } /* fog = wear-aging job */
.state-alarm { border-color: var(--hh-hue-alarm); }
.state-warn { border-color: var(--hh-hue-amber); }
</style>
