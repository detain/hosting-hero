<script setup lang="ts">
/**
 * The world canvas host. Vue mounts a DOM shell; Pixi owns everything inside
 * it. Keys 1–4 fly the altitude ladder; keys bind here (not on window) so the
 * stage is focusable and keyboard-only play (§1.10 baseline) starts from the
 * canvas itself.
 *
 * L-B (canvas intent): the board is now interactive. The pure intent machine
 * (render/boardIntent.ts) is constructed HERE and shared with the Pixi layer
 * (via WorldView's board option) and the DOM rail (BoardIntentHud); every
 * minted PlayerVerb leaves through WorldView.onIntent and lands on the
 * `submit` prop — the host's SimClient.sendPlayerVerb shape, verbatim. The
 * prop is OPTIONAL: an unwelded stage renders the honest dark desk.
 */
import { onBeforeUnmount, onMounted, ref } from "vue";
import { WorldView } from "../render/world";
import type { Altitude } from "../render/camera";
import { globalBudget } from "../render/budget";
import { createBoardIntentMachine, type MintArgs } from "../render/boardIntent";
import type { ClockKind } from "@hh/sim-core/types";
import BoardIntentHud from "./BoardIntentHud.vue";

const props = defineProps<{
  submit?: ((args: MintArgs, clock: ClockKind) => void) | null;
}>();

const host = ref<HTMLElement | null>(null);
let view: WorldView | null = null;
const board = createBoardIntentMachine();

onMounted(() => {
  const el = host.value;
  if (el === null) return;
  view = new WorldView({ width: el.clientWidth, height: el.clientHeight }, globalBudget, board);
  view.onIntent = (args, clock) => props.submit?.(args, clock);
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
    <div ref="host" class="stage" tabindex="0" aria-label="world board canvas — keys 1 to 4 change altitude, W toggles wiring mode" />
    <BoardIntentHud :machine="board" />
  </div>
</template>

<style scoped>
.stage-wrap { position: absolute; inset: 0; }
.stage { width: 100%; height: 100%; outline: none; }
.stage:focus-visible { box-shadow: inset 0 0 0 2px var(--hh-accent); }
</style>
