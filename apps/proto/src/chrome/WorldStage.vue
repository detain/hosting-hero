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
 *
 * Weld 3 (canvas in the product session): the stage now also takes
 * `handCapacity` and `seedEdges` so a host that booted riders (boot.build)
 * can present the SAME board the door is running — the seed is the host
 * quoting its own boot input (see boardIntent's initialEdges law), never
 * engine-board sniffing. And a canvas that cannot init (jsdom tests, a GPU
 * less browser) now fails LOUD and DARK: mount() rejection flips an honest
 * "canvas unavailable" note instead of an unhandled rejection.
 */
import { onBeforeUnmount, onMounted, ref, shallowRef } from "vue";
import { WorldView } from "../render/world";
import type { Altitude } from "../render/camera";
import { globalBudget } from "../render/budget";
import { createBoardIntentMachine, type MintArgs, type SeedCable } from "../render/boardIntent";
import type { ClockKind } from "@hh/sim-core/types";
import BoardIntentHud from "./BoardIntentHud.vue";

const props = defineProps<{
  submit?: ((args: MintArgs, clock: ClockKind) => void) | null;
  /** The host's booted hand rail capacity (session boots 3); default stays
   *  the sandbox's SANDBOX_HAND_CAPACITY inside the machine. */
  handCapacity?: number | null | undefined;
  /** Cables the host authored into its own boot rider (boot.build.board). */
  seedEdges?: readonly SeedCable[] | null | undefined;
}>();

const host = ref<HTMLElement | null>(null);
const canvasFault = shallowRef(false);
let view: WorldView | null = null;
const board = createBoardIntentMachine({
  ...(props.handCapacity === null || props.handCapacity === undefined
    ? {}
    : { handCapacity: props.handCapacity }),
  ...(props.seedEdges === null || props.seedEdges === undefined
    ? {}
    : { initialEdges: props.seedEdges }),
});

onMounted(() => {
  const el = host.value;
  if (el === null) return;
  view = new WorldView({ width: el.clientWidth, height: el.clientHeight }, globalBudget, board);
  view.onIntent = (args, clock) => props.submit?.(args, clock);
  view.mount(el).catch(() => {
    // Dark desk, honestly stated: no WebGL (headless jsdom, GPU-less host)
    // keeps the canvas empty — the intent rail below still shows the truth.
    canvasFault.value = true;
  });
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
    <p v-if="canvasFault" class="stage-fault" data-test="stage-fault" role="alert">
      canvas unavailable here — this browser had no WebGL; the intent rail below stays truthful
    </p>
    <BoardIntentHud :machine="board" />
  </div>
</template>

<style scoped>
.stage-wrap { position: absolute; inset: 0; }
.stage { width: 100%; height: 100%; outline: none; }
.stage:focus-visible { box-shadow: inset 0 0 0 2px var(--hh-accent); }
.stage-fault {
  position: absolute;
  top: 8px;
  left: 12px;
  margin: 0;
  font-size: 11px;
  color: var(--hh-hue-alarm);
}
</style>
