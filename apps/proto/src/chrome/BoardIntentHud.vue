<script setup lang="ts">
/**
 * chrome · BoardIntentHud — the DOM half of the §3.1 renderer-intent law
 * (L-B). Every control here is a LABELLED, keyboard-reachable surface over
 * the pure BoardIntentMachine (render/boardIntent.ts): the canvas plates
 * (render/boardPick.ts) and this rail drive the SAME machine, so mouse and
 * keyboard seats speak one grammar. Refusals voice through the proven
 * describeRefusal pack path as an azure bounce chip (g4's pattern); the
 * terms dialog keeps g4's law — Enter confirms, Escape cancels and mints
 * NOTHING. Wiring mode enters on the W key + a button, NOT Tab (g4's a11y
 * reasoning: Tab stays focus navigation); the port rail is where Tab lives.
 *
 * Dark-desk law (NodeActRow): without a mounted sink the minting controls
 * render disabled — the lab never fakes a live door.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import type { BoardIntentMachine } from "../render/boardIntent";
import {
  DEVICE_KINDS,
  INSPECTION_DEPTHS,
  SHED_ORDERS,
} from "../render/boardIntent";
import { PORT_GLYPHS } from "../gates/g4/portShapes";
import { describeRefusal } from "../i18n/refusalCopy";
import { PORT_BY_ID } from "../render/boardIntent";

const props = defineProps<{ machine: BoardIntentMachine }>();
const machine = props.machine;

/** The machine is the single authority; Vue re-renders on its version. */
const version = shallowRef(0);
const unsubscribe = machine.subscribe(() => {
  version.value += 1;
});
onBeforeUnmount(unsubscribe);

/* ── wiring mode + escape: the two global keys, bound like g4's ── */
function onKey(event: KeyboardEvent): void {
  if (event.key === "w" || event.key === "W") {
    event.preventDefault();
    machine.toggleWiring();
    return;
  }
  if (event.key === "Escape") {
    if (machine.preview !== null) machine.cancelPreview();
    else if (machine.menuNode !== null) machine.closeMenu();
  }
}
onMounted(() => window.addEventListener("keydown", onKey));
onBeforeUnmount(() => window.removeEventListener("keydown", onKey));

/* ── one computed snapshot; the template stays dumb ── */
const view = computed(() => {
  void version.value; // dependency pin: the machine is not a reactive proxy
  const chip = machine.chip;
  const voiced =
    chip === null
      ? null
      : describeRefusal(chip.reason, { verb: chip.verb, tick: String(chip.tick), hands: [] });
  const armedPort = machine.armedPort === null ? null : PORT_BY_ID_LOOKUP(machine.armedPort);
  return {
    wiring: machine.wiring,
    hasSink: machine.hasSink,
    capacity: machine.handCapacity,
    pending: machine.pending.map((t) => t.verb),
    chip,
    voiced,
    refusalSource:
      chip === null ? null : chip.source === "preview" ? "preview" : voiced?.fromPack === true ? "pack" : "wire",
    menuNode: machine.menuNode,
    menuDepth: machine.menuNode === null ? null : machine.depthOf(machine.menuNode),
    nodes: machine.sortedNodes().map((nodeId) => ({
      nodeId,
      depth: machine.depthOf(nodeId),
      defense: machine.depthOf(nodeId) !== "pass-through",
    })),
    ports: machine.sortedPorts().map((port) => ({
      portId: port.portId,
      nodeId: port.nodeId,
      relation: port.relation,
      glyph: PORT_GLYPHS[port.relation],
    })),
    edges: machine.sortedEdges().map((edge) => ({
      edgeId: edge.edgeId,
      relation: edge.relation,
      label: `${edge.from} → ${edge.to}`,
    })),
    preview: machine.preview,
    armedLabel: armedPort === null ? null : `${armedPort.nodeId} · ${armedPort.relation}`,
    armedGlyph: armedPort === null ? null : PORT_GLYPHS[armedPort.relation],
  };
});

function PORT_BY_ID_LOOKUP(portId: string) {
  const port = PORT_BY_ID.get(portId);
  return port === undefined ? null : { nodeId: port.nodeId, relation: port.relation };
}

/* ── terms dialog focus law: Enter/Esc ride the dialog element ── */
const dialog = ref<HTMLElement | null>(null);
watch(
  () => machine.preview,
  (open) => {
    if (open !== null) void nextTick(() => dialog.value?.focus());
  },
);

function confirmTerms(): void {
  machine.confirmPreview();
}
function cancelTerms(): void {
  machine.cancelPreview();
}
function onPortActivate(portId: string): void {
  machine.armPort(portId);
}
</script>

<template>
  <section class="board-hud" data-test="board-intent-hud" :data-enabled="view.hasSink ? 'true' : 'false'">
    <div class="board-hud-row">
      <button
        type="button"
        class="board-wiring"
        data-test="board-wiring-toggle"
        :aria-pressed="view.wiring"
        @click="machine.toggleWiring()"
      >
        ⌁ wiring mode <kbd>W</kbd>
      </button>
      <span data-test="board-hands" class="board-hands" aria-label="hands">
        <span
          v-for="(verb, i) in view.pending"
          :key="`hand-${i}`"
          class="board-hand-token"
          data-test="board-hand-token"
          :data-verb="verb"
        >⚒ {{ verb }}</span>
        <span v-if="view.pending.length === 0" class="board-hands-idle">free {{ view.capacity }}</span>
      </span>
    </div>

    <p v-if="view.chip !== null" class="board-refusal" data-test="board-refuse-flash" role="alert"
      :data-refusal-source="view.refusalSource">⤺ {{ view.voiced?.text }}</p>
    <p v-if="view.wiring && view.armedLabel === null" class="board-armed" data-test="board-armed-line"
      data-refusal-source="null">pick a source port (Enter arms it)</p>
    <p v-if="view.armedLabel !== null" class="board-armed" data-test="board-armed-line">
      source armed: {{ view.armedLabel }} — Tab to a target, Enter to see terms
    </p>

    <div class="board-hud-row board-nodes">
      <button
        v-for="node in view.nodes"
        :key="node.nodeId"
        type="button"
        class="board-node"
        :data-test="`board-node-${node.nodeId}`"
        :class="{ 'board-node--armed': node.defense, 'board-node--ghost': node.nodeId.startsWith('bench-') }"
        :disabled="!view.hasSink || view.wiring"
        @click="machine.tapNode(node.nodeId)"
      >
        {{ node.nodeId }} <span class="board-node-depth">{{ node.depth }}</span>
      </button>
    </div>

    <div v-if="view.wiring" class="board-ports" data-test="board-target-rail">
      <button
        v-for="port in view.ports"
        :key="port.portId"
        type="button"
        class="board-port"
        :data-test="`board-port-${port.portId}`"
        :data-relation="port.relation"
        tabindex="0"
        role="button"
        :aria-label="port.glyph.ariaLabel + ' on ' + port.nodeId"
        :disabled="!view.hasSink"
        @click="onPortActivate(port.portId)"
        @keydown.enter.prevent="onPortActivate(port.portId)"
        @keydown.space.prevent="onPortActivate(port.portId)"
      >
        <svg viewBox="0 0 24 24" class="board-port-glyph" aria-hidden="true">
          <path :d="port.glyph.path" />
        </svg>
        <span class="board-port-id">{{ port.portId }}</span>
      </button>
    </div>

    <div v-if="view.edges.length > 0" class="board-cables" data-test="board-cables">
      <span v-for="edge in view.edges" :key="edge.edgeId" class="board-cable" :data-relation="edge.relation">
        <span class="board-cable-label">{{ edge.label }} <span class="board-cable-rel">{{ edge.relation }}</span></span>
        <button
          type="button"
          class="board-pull"
          data-test="board-pull"
          :data-edge-id="edge.edgeId"
          :disabled="!view.hasSink"
          @click="machine.pullCable(edge.edgeId)"
        >pull</button>
      </span>
    </div>

    <div v-if="view.menuNode !== null" class="board-menu" data-test="board-node-menu" role="group"
      :aria-label="`configure ${view.menuNode}`">
      <p class="board-menu-title">
        configure {{ view.menuNode }} — depth {{ view.menuDepth }}
      </p>
      <div class="board-hud-row">
        <button v-for="depth in INSPECTION_DEPTHS" :key="depth" type="button"
          :data-test="`board-depth-${depth}`" :disabled="!view.hasSink"
          :class="{ 'board-choice--on': depth === view.menuDepth }"
          @click="machine.chooseDepth(view.menuNode as string, depth)">
          {{ depth }}
        </button>
      </div>
      <div class="board-hud-row">
        <button v-for="order in SHED_ORDERS" :key="order" type="button"
          :data-test="`board-shed-${order}`" :disabled="!view.hasSink"
          @click="machine.chooseShed(view.menuNode as string, order)">
          shed: {{ order }}
        </button>
      </div>
      <div class="board-hud-row">
        <button type="button" data-test="board-defense-toggle" :disabled="!view.hasSink"
          @click="machine.toggleDefense(view.menuNode as string)">
          toggle defense
        </button>
        <button type="button" data-test="board-menu-close" @click="machine.closeMenu()">close</button>
      </div>
    </div>

    <div class="board-hud-row board-bench">
      <button v-for="kind in DEVICE_KINDS" :key="kind" type="button"
        :data-test="`board-place-${kind}`" class="board-place" :disabled="!view.hasSink"
        @click="machine.placeDevice(kind)">
        + {{ kind }}
      </button>
    </div>

    <div v-if="view.preview !== null" ref="dialog" class="board-terms" data-test="board-terms" role="dialog"
      :data-relation="view.preview.relation" aria-modal="true" tabindex="-1"
      @keydown.enter.prevent="confirmTerms" @keydown.escape.prevent="cancelTerms">
      <p class="board-terms-title">
        <template v-if="view.preview.kind === 'connect'">
          connect — {{ view.preview.relation }} · {{ view.preview.from }} → {{ view.preview.to }}
        </template>
        <template v-else>
          disconnect — {{ view.preview.relation }} · {{ view.preview.from }} → {{ view.preview.to }}
        </template>
      </p>
      <svg viewBox="0 0 24 24" class="board-port-glyph" aria-hidden="true">
        <path :d="view.preview === null ? '' : PORT_GLYPHS[view.preview.relation].path"
          :stroke-dasharray="view.preview === null ? '0' : PORT_GLYPHS[view.preview.relation].dash" />
      </svg>
      <dl class="board-terms-grid">
        <dt>edge id</dt>
        <dd class="board-terms-edge" data-test="board-terms-edge">{{ view.preview?.edgeId }}</dd>
        <dt>slot</dt>
        <dd>{{ view.preview?.slot ?? '—' }}</dd>
        <dt>hands</dt>
        <dd>1 hand, paid at the door (§7.5)</dd>
      </dl>
      <p class="board-terms-note">the door keeps the last word — a refusal bounces, nothing pays twice</p>
      <div class="board-hud-row">
        <button type="button" class="board-terms-confirm" data-test="board-terms-confirm" :disabled="!view.hasSink"
          @click="confirmTerms">
          Enter to commit
        </button>
        <button type="button" data-test="board-terms-cancel" @click="cancelTerms">
          Esc cancels (mints nothing)
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.board-hud {
  position: absolute;
  left: 12px;
  bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 360px;
  font-size: 12px;
  background: color-mix(in srgb, var(--hh-hue-grey) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--hh-hue-grey) 35%, transparent);
  border-radius: 8px;
  padding: 8px 10px;
}
.board-hud-row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }

.board-hud button {
  font: inherit;
  background: transparent;
  color: var(--hh-hue-grey);
  border: 1px solid color-mix(in srgb, var(--hh-hue-grey) 45%, transparent);
  border-radius: 4px;
  padding: 2px 6px;
  cursor: pointer;
}
.board-hud button:disabled { opacity: 0.45; cursor: not-allowed; }
.board-hud button:focus-visible { outline: 2px solid color-mix(in srgb, var(--hh-hue-cyan) 80%, transparent); }

.board-wiring[aria-pressed="true"] { color: var(--hh-hue-cyan); border-color: var(--hh-hue-cyan); }
.board-node--armed { color: var(--hh-hue-amber); border-color: color-mix(in srgb, var(--hh-hue-amber) 60%, transparent); }
.board-node--ghost { color: var(--hh-hue-warm-grey-amber); }
.board-choice--on { color: var(--hh-hue-green); border-color: color-mix(in srgb, var(--hh-hue-green) 60%, transparent); }
.board-place { color: var(--hh-hue-gold); }

.board-hands { color: var(--hh-hue-grey); }
.board-hand-token { color: var(--hh-hue-gold); border: 1px dashed color-mix(in srgb, var(--hh-hue-gold) 55%, transparent); border-radius: 4px; padding: 0 4px; }
.board-hands-idle { color: var(--hh-hue-grey); }

.board-refusal {
  margin: 0;
  border: 2px dashed var(--hh-hue-azure);
  color: var(--hh-hue-azure);
  border-radius: 6px;
  padding: 3px 6px;
  animation: board-refuse-bounce 320ms ease-out 1;
}
@keyframes board-refuse-bounce {
  0% { transform: translateY(-10px); }
  55% { transform: translateY(3px); }
  100% { transform: none; }
}

.board-armed { margin: 0; color: var(--hh-hue-grey); }

.board-port { display: inline-flex; align-items: center; gap: 4px; }
.board-port-glyph { width: 16px; height: 16px; display: inline-block; }
/* R32 hue flavor per relation shape — static ledger vars only (hueLaw). */
.board-port[data-relation="data"] .board-port-glyph path { fill: var(--hh-hue-cyan); }
.board-port[data-relation="power"] .board-port-glyph path { fill: var(--hh-hue-copper); }
.board-port[data-relation="control"] .board-port-glyph path { fill: var(--hh-hue-white); }
.board-port[data-relation="trust"] .board-port-glyph path { fill: var(--hh-hue-violet); }
.board-terms[data-relation="data"] .board-port-glyph path { fill: var(--hh-hue-cyan); }
.board-terms[data-relation="power"] .board-port-glyph path { fill: var(--hh-hue-copper); }
.board-terms[data-relation="control"] .board-port-glyph path { fill: var(--hh-hue-white); }
.board-terms[data-relation="trust"] .board-port-glyph path { fill: var(--hh-hue-violet); }
.board-port-id { color: var(--hh-hue-grey); }

.board-cable { display: inline-flex; align-items: center; gap: 4px; border: 1px solid color-mix(in srgb, var(--hh-hue-grey) 40%, transparent); border-radius: 4px; padding: 1px 4px; }
.board-cable[data-relation="data"] .board-cable-rel { color: var(--hh-hue-cyan); }
.board-cable-label { color: var(--hh-hue-grey); }
.board-pull { color: var(--hh-hue-alarm); }

.board-menu { border: 1px solid color-mix(in srgb, var(--hh-hue-gold) 45%, transparent); border-radius: 6px; padding: 4px 6px; }
.board-menu-title { margin: 0 0 4px; color: var(--hh-hue-gold); }

.board-terms {
  position: absolute;
  inset: auto 12px 12px auto;
  right: 12px;
  bottom: 12px;
  border: 1px solid color-mix(in srgb, var(--hh-hue-grey) 50%, transparent);
  background: color-mix(in srgb, var(--hh-hue-grey) 10%, transparent);
  border-radius: 8px;
  padding: 8px 10px;
  width: min(320px, 80vw);
}
.board-terms:focus-visible { outline: 2px solid color-mix(in srgb, var(--hh-hue-cyan) 80%, transparent); }
.board-terms-title { margin: 0; color: var(--hh-hue-green); }
.board-terms-grid { display: grid; grid-template-columns: auto 1fr; gap: 2px 8px; margin: 4px 0; }
.board-terms-grid dt { color: var(--hh-hue-grey); }
.board-terms-grid dd { margin: 0; color: var(--hh-hue-grey); }
.board-terms-edge { overflow-wrap: anywhere; }
.board-terms-note { margin: 4px 0; color: var(--hh-hue-grey); font-style: italic; }
.board-terms-confirm { color: var(--hh-hue-green); }

@media (prefers-reduced-motion: reduce) {
  .board-refusal { animation: none; }
}
</style>
