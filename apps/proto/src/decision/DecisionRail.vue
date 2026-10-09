<script setup lang="ts">
/**
 * DecisionRail — §7.6's "small Now list", rendered. Thin by law: all ranking
 * lives in decision/annotate.ts, all budget choreography in decision/tracker.ts.
 * This component only (1) watches the observed store's frames, (2) forwards
 * each transition to the tracker (the tracker asks `globalBudget` — chrome
 * asks like the renderers do), (3) paints ≤3 marked decisions with the
 * spec's subtle white corner bracket plus the honest "+N" overflow, and
 * (4) registers each held annotation's Explain payload (§8.8 hookup).
 *
 * Renderer-is-terminal: data comes ONLY from the SimProjection stream — no
 * runner imports, no sim facts invented. Timer-free: frames drive everything.
 *
 * Hue discipline: white bracket = the ledger's `white`/intent-ink job (the
 * spec literally asks for a white corner bracket); money fork rides `gold`.
 * Every colour is a var(--hh-hue-*) / era token — pinned by decisionLaw.test.
 */
import { onBeforeUnmount, ref, shallowRef, watch } from "vue";
import { projection } from "../state/observedStore";
import { globalBudget } from "../render/budget";
import { ExplainRegistry, globalExplain } from "../chrome/explainRegistry";
import type { SimProjection } from "../shared/protocol";
import { DecisionTracker, type DecisionFrameResult } from "./tracker";
import type { DecisionAnnotation } from "./annotate";

const props = defineProps<{
  /** Test seam: an isolated registry. Default: the app-global one. */
  explain?: ExplainRegistry;
}>();

const tracker = new DecisionTracker(globalBudget);
const registry = props.explain ?? globalExplain;
const view = shallowRef<DecisionFrameResult>(tracker.current);
const prev = ref<SimProjection | null>(null);
const registered = new Set<string>();

watch(
  projection,
  (next) => {
    if (next === null) return;
    const result = tracker.onFrame({ prev: prev.value, next });
    prev.value = next;
    syncExplain(result.held);
    view.value = result;
  },
  { immediate: true },
);

/** Upsert-per-frame, exactly like every other live Explain value. */
function syncExplain(held: readonly DecisionAnnotation[]): void {
  const wanted = new Set<string>();
  for (const annotation of held) {
    const entryId = `decision:${annotation.id}`;
    wanted.add(entryId);
    registry.register({ id: entryId, payload: annotation.explain });
  }
  for (const entryId of registered) {
    if (!wanted.has(entryId)) registry.unregister(entryId);
  }
  registered.clear();
  for (const entryId of wanted) registered.add(entryId);
}

function ack(annotation: DecisionAnnotation): void {
  tracker.acknowledge(annotation.id);
  registry.unregister(`decision:${annotation.id}`);
  registered.delete(`decision:${annotation.id}`);
  view.value = { ...view.value, held: view.value.held.filter((a) => a.id !== annotation.id) };
}

/** 0 = wide open, 1 = closing shut. Reads the annotation's own signals —
 *  the rail never re-derives (thin-view law). */
function windowPct(annotation: DecisionAnnotation): string {
  return `${Math.round(annotation.signals.closingPressure * 100)}%`;
}

onBeforeUnmount(() => {
  tracker.dispose();
  for (const entryId of registered) registry.unregister(entryId);
  registered.clear();
});
</script>

<template>
  <aside class="decision-rail" data-test="decision-rail" data-hud-optional="true" aria-label="marked decisions">
    <h2 class="head">
      Now — what are you being asked?
      <span v-if="view.overflow > 0" class="overflow" data-test="decision-overflow">+{{ view.overflow }}</span>
    </h2>

    <p v-if="view.held.length === 0" class="none" data-test="decision-none">
      nothing forked — everything here is information
    </p>

    <article
      v-for="annotation in view.held"
      :key="annotation.id"
      class="row"
      :class="`kind-${annotation.kind}`"
      data-test="decision-row"
      :data-kind="annotation.kind"
    >
      <span class="bracket" aria-hidden="true" />
      <h3 class="title">{{ annotation.title }}</h3>
      <p class="why">{{ annotation.whyItMatters }}</p>
      <ul class="fork">
        <li v-for="option in annotation.options" :key="option.id" class="fork-option">
          {{ option.label }}
        </li>
      </ul>
      <div class="foot">
        <span class="window" :style="{ width: windowPct(annotation) }" :data-test="`decision-window-${annotation.id}`" />
        <a
          class="explain"
          role="button"
          tabindex="0"
          :data-test="`decision-explain-${annotation.id}`"
          :title="annotation.explain.formula"
          >why?</a
        >
        <button type="button" class="ack" :data-test="`decision-ack-${annotation.id}`" @click="ack(annotation)">
          decided
        </button>
      </div>
    </article>
  </aside>
</template>

<style scoped>
.decision-rail {
  position: absolute;
  right: 12px;
  top: 60px;
  width: 268px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-family: var(--hh-typeface);
  font-size: 12px;
  color: #d7e3ea;
}
.head {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--hh-accent);
  display: flex;
  align-items: center;
  gap: 8px;
}
.overflow {
  color: var(--hh-hue-azure);
  font-variant-numeric: tabular-nums;
}
.none {
  margin: 0;
  opacity: 0.55;
  font-style: italic;
}
.row {
  position: relative;
  padding: 10px 12px 8px;
  background: color-mix(in srgb, var(--hh-surface) 88%, #000);
  border: 1px solid color-mix(in srgb, var(--hh-accent) 26%, transparent);
  border-radius: var(--hh-radius);
}
/* §7.6's "subtle white corner bracket" — two ledger-white edges, top-left. */
.bracket {
  position: absolute;
  top: -1px;
  left: -1px;
  width: 14px;
  height: 14px;
  border-top: 2px solid var(--hh-hue-white);
  border-left: 2px solid var(--hh-hue-white);
}
.title {
  margin: 0 0 4px;
  font-size: 12.5px;
  font-weight: 600;
}
.kind-cash-burn .title {
  color: var(--hh-hue-gold);
}
.why {
  margin: 0 0 6px;
  opacity: 0.82;
}
.fork {
  list-style: none;
  margin: 0 0 8px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.fork-option {
  padding-left: 12px;
  position: relative;
  opacity: 0.9;
}
/* neutral diamond — the fork marker, deliberately not a bullet (bullets
   order things; the rail must not). */
.fork-option::before {
  content: "◇";
  position: absolute;
  left: 0;
  color: var(--hh-accent);
}
.foot {
  display: flex;
  align-items: center;
  gap: 8px;
}
.window {
  height: 3px;
  flex: 1;
  background: color-mix(in srgb, var(--hh-hue-azure) 65%, transparent);
  border-radius: 2px;
}
.explain {
  color: var(--hh-accent);
  text-decoration: underline dotted;
  cursor: help;
  font-size: 11px;
}
.ack {
  border: 1px solid color-mix(in srgb, var(--hh-accent) 45%, transparent);
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 10px;
  letter-spacing: 0.06em;
  padding: 2px 8px;
  border-radius: var(--hh-radius);
  cursor: pointer;
}
.ack:hover {
  background: color-mix(in srgb, var(--hh-accent) 16%, transparent);
}
</style>
