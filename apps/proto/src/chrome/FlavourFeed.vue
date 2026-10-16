<script setup lang="ts">
/**
 * FlavourFeed — the Front-of-House panel (g24: the copy bank gets a mouth).
 * One deterministic FLAVOUR line per tick, drawn from the closed slot-free
 * flavour pool of the registered packs through flavourFeed.ts. Zero timers,
 * zero animation: every re-render is a click (advance / chip / era) over
 * pure law. The line element carries data-key/data-root/data-tick so mount
 * tests can watch the law answer without scraping prose.
 *
 * Era flip rides the SHARED eraState ref (App.vue's toggle and this button
 * are the same switch); the line's computed reads getEra(), so flipping
 * here re-words era-variant copy everywhere, per the i18n reactivity law.
 */
import { computed, ref } from "vue";
import { asRunSeed, type RunSeed } from "@hh/sim-core/types";
import { getEra, setEra } from "../i18n/eraState";
import {
  defaultFlavourPool,
  flavourLineAt,
  flavourPoolForRoots,
  flavourRootCounts,
  FLAVOUR_CHIP_ROOTS,
} from "./flavourFeed";

const props = withDefaults(defineProps<{ seed?: number }>(), { seed: 904 });

const runSeed: RunSeed = asRunSeed(BigInt(props.seed));
const tick = ref(0);
const activeRoot = ref<string | null>(null);

/** Chip honesty (RecoveryWatch locked-button pattern): a voice root with no
 *  slot-free line renders DISABLED with its count, never a click that
 *  throws. After the ADR-0014 #D5 widening all four chips speak (forum's
 *  slot-free lines arrived with the type packs); the locked-button law
 *  stays for any future bank that ships a root with slots on everything. */
const rootCounts = flavourRootCounts();

function chipCount(root: string): number {
  return rootCounts.get(root) ?? 0;
}

const pool = computed(() =>
  activeRoot.value === null
    ? defaultFlavourPool()
    : flavourPoolForRoots([activeRoot.value]),
);
const line = computed(() => flavourLineAt(runSeed, tick.value, getEra(), pool.value));

function advance(): void {
  tick.value += 1;
}

function chooseRoot(root: string | null): void {
  activeRoot.value = root;
}

function flipEra(): void {
  setEra(getEra() === 2026 ? 1998 : 2026);
}
</script>

<template>
  <div class="feed" data-test="feed-panel" :data-tick="tick">
    <p class="feed-line" data-test="feed-line" :data-key="line.key" :data-root="line.root">
      <span class="feed-root">{{ line.root }}</span>
      <span class="feed-text">{{ line.text }}</span>
    </p>
    <p class="feed-meta">
      tick {{ line.tick }} · {{ line.packId }} · {{ line.eraYear }}
      <button type="button" class="feed-era" data-test="feed-era" @click="flipEra">flip era</button>
    </p>
    <div class="feed-controls">
      <button type="button" data-test="feed-advance" @click="advance">next line</button>
      <button
        type="button"
        class="feed-chip"
        :class="{ on: activeRoot === null }"
        data-test="feed-root-all"
        @click="chooseRoot(null)"
      >all</button>
      <button
        v-for="root in FLAVOUR_CHIP_ROOTS"
        :key="root"
        type="button"
        class="feed-chip"
        :class="{ on: activeRoot === root }"
        :data-test="`feed-root-${root}`"
        :data-lines="chipCount(root)"
        :disabled="chipCount(root) === 0"
        :title="chipCount(root) === 0 ? `${root}: every line carries {slots} — silent in v0` : undefined"
        @click="chooseRoot(root)"
      >{{ root }}</button>
    </div>
  </div>
</template>

<style scoped>
.feed { display: grid; gap: 8px; font-family: var(--hh-typeface); }
.feed-line { margin: 0; font-size: 13px; line-height: 1.5; min-height: 2.9em; }
.feed-root {
  display: inline-block;
  margin-right: 8px;
  padding: 0 6px;
  font-size: 10px;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--hh-hue-grey);
  border: 1px solid color-mix(in srgb, var(--hh-hue-grey) 45%, transparent);
  border-radius: var(--hh-radius);
}
.feed-meta { margin: 0; font-size: 10px; color: var(--hh-hue-grey); font-variant-numeric: tabular-nums; }
.feed-controls { display: flex; flex-wrap: wrap; gap: 6px; }
.feed-controls button, .feed-era {
  border: 1px solid color-mix(in srgb, var(--hh-accent) 40%, transparent);
  background: transparent;
  color: var(--hh-accent);
  font: inherit;
  font-size: 11px;
  border-radius: var(--hh-radius);
  padding: 2px 10px;
  cursor: pointer;
}
.feed-era { padding: 0 8px; }
.feed-chip:disabled { opacity: .4; cursor: default; }
.feed-chip.on {
  background: var(--hh-accent);
  color: var(--hh-surface);
  border-color: var(--hh-accent);
}
</style>
