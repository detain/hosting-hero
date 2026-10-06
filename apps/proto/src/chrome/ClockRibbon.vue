<script setup lang="ts">
/**
 * Unified Clock Ribbon (§7.9, §8.8) — one strip, now centered, history
 * LEFT, obligations RIGHT, scrubbable; ops track above, business track
 * below. The three highest urgency×consequence future pips render ENLARGED
 * and coloured — and each enlargement ASKS the BudgetManager's
 * promotedClock cap before mounting (chrome asks like the renderers do;
 * if the budget refuses, the pip stays a grey tick — two authorities,
 * one truth).
 *
 * Renderer-is-terminal: clock values come ONLY from the observed store's
 * SimProjection; no runner imports, no sim facts invented.
 */
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { projection } from "../state/observedStore";
import { globalBudget } from "../render/budget";
import {
  buildRibbonModel,
  clockHeads,
  type RibbonEntry,
  type RibbonWindows,
} from "./clockRibbon";

const props = defineProps<{
  entries: readonly RibbonEntry[];
  /** Half-window per track; defaults: 120 sim-min ops, 30 business-days. */
  windows?: Partial<RibbonWindows>;
}>();

const WINDOWS: RibbonWindows = { ops: 120n * 60_000_000n, business: 30n * 86_400_000_000n };
const windowUs = computed<RibbonWindows>(() => ({ ...WINDOWS, ...props.windows }));
const SCRUB_STEP = 0.25; // quarter-strip per click

const scrub = ref<Partial<Record<keyof RibbonWindows, bigint>>>({ ops: 0n, business: 0n });

const model = computed(() => {
  const p = projection.value;
  if (p === null) return null;
  return buildRibbonModel(props.entries, p.clocks, {
    windows: windowUs.value,
    scrubUs: scrub.value,
  });
});

const heads = computed(() => {
  const p = projection.value;
  return p === null ? [] : clockHeads(p.clocks);
});

/* Budget ask: enlarged pips request a promotedClock slot by score priority. */
const granted = ref<ReadonlySet<string>>(new Set());
const heldIds = new Set<string>();

function refreshBudgetGrants(): void {
  const m = model.value;
  const next = new Set<string>();
  const wanted = new Set<string>();
  if (m !== null) {
    for (const id of m.enlarged) {
      const placement = m.positions.find((p) => p.entry.id === id);
      wanted.add(`ribbon:${id}`);
      const result = globalBudget.admit({
        id: `ribbon:${id}`,
        category: "promotedClock",
        priority: Math.round((placement?.score ?? 0) * 100),
      });
      if (result.admitted) next.add(id);
    }
  }
  for (const held of heldIds) {
    if (!wanted.has(held)) globalBudget.release(held);
  }
  heldIds.clear();
  for (const id of next) heldIds.add(`ribbon:${id}`);
  granted.value = next;
}

watch(model, refreshBudgetGrants, { immediate: true });
onBeforeUnmount(() => {
  for (const held of heldIds) globalBudget.release(held);
  heldIds.clear();
});

function scrubBy(direction: -1 | 1 | 0): void {
  if (direction === 0) {
    scrub.value = { ops: 0n, business: 0n };
    return;
  }
  const step = (half: bigint) => (half / 4n) * BigInt(direction);
  scrub.value = {
    ops: (scrub.value.ops ?? 0n) + step(windowUs.value.ops),
    business: (scrub.value.business ?? 0n) + step(windowUs.value.business),
  };
}

function pipLeft(placement: { side: "past" | "future"; offset: number }): string {
  const pct = placement.offset * 50;
  return placement.side === "future" ? `calc(${50 + pct}% - 5px)` : `calc(${50 - pct}% - 5px)`;
}
</script>

<template>
  <section class="ribbon" data-test="hud-ribbon" aria-label="unified clock ribbon">
    <div class="heads">
      <span v-for="head in heads" :key="head.kind" class="head" :data-test="`clock-head-${head.kind}`">
        <i>{{ head.label }}</i>
        <b>{{ head.display }}</b>
      </span>
      <span v-if="heads.length === 0" class="head head--nodata" data-test="clock-head-none">
        <i>clocks</i><b>?</b>
      </span>
    </div>

    <div class="scrub" role="group" aria-label="scrub the ribbon">
      <button type="button" data-test="ribbon-scrub-left" aria-label="look back" @click="scrubBy(-1)">◀</button>
      <button type="button" data-test="ribbon-reset" aria-label="back to now" @click="scrubBy(0)">now</button>
      <button type="button" data-test="ribbon-scrub-right" aria-label="look ahead" @click="scrubBy(1)">▶</button>
    </div>

    <div class="strip" data-test="ribbon-strip">
      <div class="now-line" aria-hidden="true" />
      <div class="track track--ops" data-test="ribbon-track-ops">
        <template v-if="model">
          <span
            v-for="placement in model.positions.filter((p) => p.entry.track === 'ops')"
            :key="placement.entry.id"
            class="pip"
            :class="{
              'pip--enlarged': model.enlarged.includes(placement.entry.id) && granted.has(placement.entry.id),
              'pip--tick': !(model.enlarged.includes(placement.entry.id) && granted.has(placement.entry.id)),
              'pip--past': placement.side === 'past',
              [`tone-${placement.entry.tone ?? 'neutral'}`]: true,
            }"
            :style="{ left: pipLeft(placement) }"
            :data-test="`ribbon-pip-${placement.entry.id}`"
            :title="`${placement.entry.label} — ${placement.side} ${Math.round(placement.offset * 100)}%`"
          >{{ model.enlarged.includes(placement.entry.id) && granted.has(placement.entry.id) ? placement.entry.label : "" }}</span>
        </template>
      </div>
      <div class="track track--business" data-test="ribbon-track-business">
        <template v-if="model">
          <span
            v-for="placement in model.positions.filter((p) => p.entry.track === 'business')"
            :key="placement.entry.id"
            class="pip"
            :class="{
              'pip--enlarged': model.enlarged.includes(placement.entry.id) && granted.has(placement.entry.id),
              'pip--tick': !(model.enlarged.includes(placement.entry.id) && granted.has(placement.entry.id)),
              'pip--past': placement.side === 'past',
              [`tone-${placement.entry.tone ?? 'neutral'}`]: true,
            }"
            :style="{ left: pipLeft(placement) }"
            :data-test="`ribbon-pip-${placement.entry.id}`"
            :title="`${placement.entry.label} — ${placement.side} ${Math.round(placement.offset * 100)}%`"
          >{{ model.enlarged.includes(placement.entry.id) && granted.has(placement.entry.id) ? placement.entry.label : "" }}</span>
        </template>
      </div>
    </div>

    <div v-if="model && model.offscreenCount > 0" class="offscreen" data-test="ribbon-offscreen">
      {{ model.offscreenCount }} off-window
    </div>
  </section>
</template>

<style scoped>
.ribbon {
  --hud-ribbon-h: 72px;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 4px;
  padding: 6px 16px;
  font-family: var(--hh-typeface);
  background: color-mix(in srgb, var(--hh-surface) 88%, #000);
  border-block: 1px solid color-mix(in srgb, var(--hh-accent) 22%, transparent);
}
.heads { display: flex; gap: 18px; }
.head { font-size: 11px; letter-spacing: .08em; color: color-mix(in srgb, var(--hh-accent) 65%, #fff); }
.head i { font-style: normal; opacity: .55; margin-right: 6px; text-transform: uppercase; }
.head b { font-variant-numeric: tabular-nums; }
.scrub { position: absolute; right: 16px; top: 6px; display: flex; gap: 4px; }
.scrub button {
  border: 1px solid color-mix(in srgb, var(--hh-accent) 35%, transparent);
  background: transparent;
  color: var(--hh-accent);
  font: inherit;
  font-size: 10px;
  border-radius: var(--hh-radius);
  padding: 1px 7px;
  cursor: pointer;
}
.ribbon { position: relative; }
.strip {
  position: relative;
  height: var(--hud-ribbon-h);
  border-radius: var(--hh-radius);
  background:
    linear-gradient(color-mix(in srgb, var(--hh-accent) 6%, transparent), color-mix(in srgb, var(--hh-accent) 6%, transparent));
}
.now-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: color-mix(in srgb, var(--hh-accent) 70%, transparent);
}
.track { position: absolute; left: 0; right: 0; height: 50%; }
.track--ops { top: 0; }        /* ops above  */
.track--business { bottom: 0; } /* business below (§8.8 two tracks) */
.pip {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  white-space: nowrap;
}
.pip--tick {
  width: 2px;
  height: 10px;
  background: color-mix(in srgb, #9aa4ad 60%, transparent); /* small grey tick */
}
.pip--past { opacity: .8; }
.pip--enlarged {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid currentColor;
  background: color-mix(in srgb, var(--hh-surface) 70%, transparent);
}
.tone-good { color: #57d38a; }
.tone-warn { color: #e8b23c; }
.tone-bad { color: #ef6a5a; }
.tone-neutral { color: var(--hh-accent); }
.pip--tick.tone-good { background: #57d38a; }
.pip--tick.tone-warn { background: #e8b23c; }
.pip--tick.tone-bad { background: #ef6a5a; }
.pip--tick.tone-neutral { background: color-mix(in srgb, #9aa4ad 60%, transparent); }
.offscreen { font-size: 10px; opacity: .6; letter-spacing: .06em; }
</style>
