<script setup lang="ts">
/**
 * The world canvas host. Vue mounts a DOM shell; Pixi owns everything inside
 * it. Keys 1–4 fly the altitude ladder; keys bind here (not on window) so the
 * stage is focusable and keyboard-only play (§1.10 baseline) starts from the
 * canvas itself.
 */
import { onBeforeUnmount, onMounted, ref } from "vue";
import { WorldView } from "../render/world";
import type { Altitude } from "../render/camera";
import { globalBudget } from "../render/budget";

const host = ref<HTMLElement | null>(null);
let view: WorldView | null = null;

onMounted(() => {
  const el = host.value;
  if (el === null) return;
  view = new WorldView({ width: el.clientWidth, height: el.clientHeight }, globalBudget);
  void view.mount(el);
  el.addEventListener("keydown", onKey);
});

onBeforeUnmount(() => {
  host.value?.removeEventListener("keydown", onKey);
  view?.destroy();
  view = null;
});

function onKey(event: KeyboardEvent): void {
  const table: Record<string, Altitude> = { "1": "Z1", "2": "Z2", "3": "Z3", "4": "Z4" };
  const altitude = table[event.key];
  if (altitude !== undefined) {
    event.preventDefault();
    view?.goAltitude(altitude);
  }
}
</script>

<template>
  <div class="stage-wrap">
    <div ref="host" class="stage" tabindex="0" aria-label="world board canvas — keys 1 to 4 change altitude" />
  </div>
</template>

<style scoped>
.stage-wrap { position: absolute; inset: 0; }
.stage { width: 100%; height: 100%; outline: none; }
.stage:focus-visible { box-shadow: inset 0 0 0 2px var(--hh-accent); }
</style>
