<script setup lang="ts">
/**
 * One type's side of the G6 stage. EVERY visual input is loaded data: the
 * palette is the bundle's skin chord (CSS vars scoped to this element), the
 * meter face is resolved from `scarce.meterWidget` (fail-loud via meterFace),
 * the rhythm strip plots the lane arrival rate the runner actually saw, and
 * the tempo badge appears only when the bundle ships `permanentIncidentClock`.
 * Two sides in dual mode are THIS component twice — one render path, no
 * type-specific branch, which is the whole gate made visible.
 */
import { computed, ref, watch } from "vue";
import { observedKey } from "@hh/sim-core/types";
import { instrumentReading, formatReadout, type InstrumentDef } from "../../chrome/instruments/registry.ts";
import { faceComponent } from "../../chrome/instruments/faces.ts";
import { fixedToDisplay, type SimProjection } from "../../shared/protocol.ts";
import { meterFace, type G6Profile } from "./g6Data.ts";
import { G6_NODE_EDGE } from "./g6Runner.ts";

const props = defineProps<{
  profile: G6Profile;
  projection: SimProjection | null;
  /** True during a divergence tick (one side bounces while the other serves). */
  spotlight?: boolean;
}>();

const slug = computed(() => props.profile.typeId.split(":").pop() ?? props.profile.typeId);

const meter = computed(() => meterFace(props.profile.meterWidget));

const instrument = computed<InstrumentDef>(() => ({
  id: `g6-meter-${slug.value}`,
  label: meter.value.label,
  entity: G6_NODE_EDGE,
  property: "utilizationRho",
  scale: "fixed",
  face: meter.value.face,
  unit: meter.value.unit,
  nominal: [0, 0.7],
  threshold: 0.9,
  direction: "up",
  fullScale: 1.2,
}));

/** Rolling trace for scope faces (display-side memory, like the bezel's). */
const samples = ref<number[]>([]);

const reading = computed(() => {
  if (props.projection === null) {
    return instrumentReading(instrument.value, undefined);
  }
  const cell = props.projection.observed.get(observedKey(G6_NODE_EDGE, "utilizationRho"));
  return instrumentReading(instrument.value, cell);
});

watch(reading, (r) => {
  if (r.ratio === null) return;
  samples.value = [...samples.value.slice(-23), r.ratio];
});

const thresholdRatio = computed(() => Math.min(1, instrument.value.threshold / instrument.value.fullScale));
const face = computed(() => faceComponent(instrument.value.face));

/* Lane rhythm: last 30 arrival-rate samples plotted as bars. */
const rhythm = ref<number[]>([]);
watch(
  () => props.projection,
  (p) => {
    if (p === null || p.lanes.length === 0) return;
    const rate = fixedToDisplay(p.lanes[0]!.ratePerMin);
    rhythm.value = [...rhythm.value.slice(-29), rate];
  },
);
const rhythmMax = computed(() => Math.max(1, ...rhythm.value));

const counters = computed(() => props.projection?.counters ?? { served: 0, bounced: 0, blockedFalsePositive: 0, landed: 0 });
const readout = computed(() => formatReadout(instrument.value, reading.value));

const skin = computed(() => ({
  "--g6-accent": props.profile.palette.accent,
  "--g6-dominant": props.profile.palette.dominant,
  "--g6-chord-1": props.profile.palette.chord[0],
  "--g6-chord-2": props.profile.palette.chord[1],
  "--g6-chord-3": props.profile.palette.chord[2],
  "--g6-chord-4": props.profile.palette.chord[3],
  "--g6-chord-5": props.profile.palette.chord[4],
}));
</script>

<template>
  <section class="side" :class="[`kind-${slug}`, { spotlight }]" :style="skin" :data-test="`g6-side-${slug}`">
    <header class="side-head">
      <h3>{{ profile.label }}</h3>
      <span v-if="profile.incident" class="tempo" data-test="g6-tempo-badge">0.25× permanent-incident clock</span>
      <span class="rhythm-name">{{ profile.arrivalRhythm }}</span>
    </header>

    <div class="gauges">
      <figure class="bezel" :class="[`state-${reading.state}`]" :aria-label="readout" :data-test="`g6-meter-${slug}`">
        <figcaption class="bezel-head">
          <span class="label">{{ instrument.label }}</span>
          <span class="value">{{ reading.state === "no-data" ? "?" : (reading.value ?? 0).toFixed(2) }}</span>
          <span class="unit">{{ instrument.unit }}</span>
        </figcaption>
        <component
          :is="face"
          :ratio="reading.ratio"
          :threshold-ratio="thresholdRatio"
          :state="reading.state"
          :is-still="reading.isStill"
          :samples="samples"
        />
        <footer class="bezel-foot">
          <span class="nominal">nominal {{ instrument.nominal[0] }}–{{ instrument.nominal[1] }} {{ instrument.unit }}</span>
          <span class="widget">{{ profile.meterWidget }}</span>
        </footer>
      </figure>

      <ul class="counters" :data-test="`g6-counters-${slug}`">
        <li class="ok"><b :data-test="`g6-served-${slug}`">{{ counters.served }}</b><span>served</span></li>
        <li class="bad"><b :data-test="`g6-bounced-${slug}`">{{ counters.bounced }}</b><span>bounced</span></li>
        <li class="worse"><b :data-test="`g6-landed-${slug}`">{{ counters.landed }}</b><span>landed</span></li>
      </ul>
    </div>

    <div class="rhythm-strip" :data-test="`g6-rhythm-${slug}`" aria-label="lane arrival rhythm, last 30 sim-minutes">
      <i
        v-for="(v, i) in rhythm"
        :key="i"
        class="bar"
        :style="{ height: `${Math.round((v / rhythmMax) * 100)}%`, background: `var(--g6-chord-${(i % 5) + 1})` }"
      />
      <span v-if="rhythm.length === 0" class="idle">awaiting first tick</span>
    </div>

    <p class="patience">patience budget: {{ profile.patienceUs }} µs (loaded)</p>
  </section>
</template>

<style scoped>
.side {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 18px;
  border: 1px solid color-mix(in srgb, var(--g6-accent) 45%, transparent);
  border-radius: var(--hh-radius);
  background:
    radial-gradient(120% 90% at 12% 0%, color-mix(in srgb, var(--g6-dominant) 30%, transparent), transparent 60%),
    linear-gradient(160deg, color-mix(in srgb, var(--g6-chord-1) 12%, transparent), transparent 45%),
    color-mix(in srgb, var(--hh-surface) 88%, #000);
  color: var(--g6-accent);
  position: relative;
  overflow: hidden;
}
.side::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: repeating-linear-gradient(0deg, transparent 0 3px, rgba(0, 0, 0, 0.055) 3px 4px);
}
.side-head { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.side-head h3 {
  margin: 0;
  font-family: var(--hh-typeface);
  font-size: 21px;
  letter-spacing: .04em;
  text-transform: uppercase;
  color: var(--g6-accent);
}
.tempo {
  font-size: 10px;
  letter-spacing: .14em;
  text-transform: uppercase;
  padding: 3px 8px;
  border: 1px dashed var(--g6-chord-4);
  border-radius: 999px;
  color: var(--g6-chord-4);
}
.rhythm-name { margin-left: auto; font-size: 10px; opacity: .55; letter-spacing: .1em; }
.gauges { display: flex; gap: 16px; align-items: stretch; }
.bezel {
  margin: 0;
  flex: 1 1 auto;
  border: 1px solid color-mix(in srgb, var(--g6-accent) 40%, transparent);
  border-radius: var(--hh-radius);
  background: color-mix(in srgb, var(--hh-surface) 85%, #000);
  padding: 10px 12px 8px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03), 0 8px 24px rgba(0, 0, 0, .45);
}
.bezel-head { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; }
.label { text-transform: uppercase; letter-spacing: .12em; font-size: 11px; opacity: .7; }
.value { margin-left: auto; font-family: var(--hh-typeface); font-variant-numeric: tabular-nums; font-size: 20px; }
.unit { font-size: 11px; opacity: .6; }
.bezel-foot { display: flex; justify-content: space-between; margin-top: 6px; font-size: 10px; opacity: .55; }
.state-alarm { border-color: #e23b3b; }
.state-warn { border-color: #f2b133; }
.counters { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; align-content: center; }
.counters b { font-family: var(--hh-typeface); font-size: 26px; font-variant-numeric: tabular-nums; display: block; line-height: 1; }
.counters span { font-size: 10px; letter-spacing: .14em; text-transform: uppercase; opacity: .6; }
.counters .ok b { color: var(--g6-chord-3); }
.counters .bad b { color: #f2b133; }
.counters .worse b { color: #e23b3b; }
.rhythm-strip {
  height: 56px;
  display: flex;
  align-items: flex-end;
  gap: 2px;
  padding: 6px 8px;
  border: 1px solid color-mix(in srgb, var(--g6-accent) 25%, transparent);
  border-radius: calc(var(--hh-radius) / 2);
  background: color-mix(in srgb, #000 45%, var(--hh-surface));
}
.bar { flex: 1 1 auto; min-height: 2px; border-radius: 1px; opacity: .9; transition: height 160ms linear; }
.idle { font-size: 11px; opacity: .5; align-self: center; }
.patience { margin: 0; font-size: 10px; opacity: .45; letter-spacing: .06em; }
/* One orchestrated motion: the divergence-minute pulse (the screenshot beat). */
.spotlight { animation: g6-pulse 900ms ease-out 1; }
@keyframes g6-pulse {
  0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--g6-accent) 80%, transparent); }
  35% { box-shadow: 0 0 0 7px color-mix(in srgb, var(--g6-accent) 26%, transparent); }
  100% { box-shadow: 0 0 0 0 transparent; }
}
</style>
