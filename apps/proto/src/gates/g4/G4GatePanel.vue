<!--
  gates/g4 · G4GatePanel — the drag-a-cable gate (§9.13 #4).

  RENDERING LAW: the board is SVG in the DOM layer, NOT Pixi — port glyphs
  are real focusable elements (tabindex + role=button), so the accessibility
  law "identical click-to-link fallback" comes FREE: Tab reaches every
  socket, Enter arms the source, Enter on a target opens the SAME terms card
  a pointer drop would. Drag and click are two gestures over one preview
  pipeline; the sim cannot tell them apart (pinned headless).

  COMMIT LAW: nothing enters the door without a price tag. The ladder
  (hockey-stick Δms) updates DURING the drag; the drop opens a Terms Card —
  bandwidth, cost, latency, SLA squeeze, NEW ATTACK SURFACE — confirm with
  click/Enter, abandon with Escape, Shift-confirm skips repeat cards for
  that action class. Refusals bounce and name themselves (dash + text,
  never color alone — R32 redundancy runs through the whole gate).
-->
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { G4Session, type CablePreview, type G4Snapshot } from "./g4Session.ts";
import { PORT_GLYPHS } from "./portShapes.ts";
import type { PortSpec } from "./portShapes.ts";
import { latencyLadderRows, type HopLoad } from "./latencyDelta.ts";
import type { Fixed } from "@hh/sim-core/types";

const props = withDefaults(defineProps<{ readonly seed?: number }>(), { seed: 904 });
const session = new G4Session(props.seed);
const snap = ref<G4Snapshot>(session.snapshot());
const wiringMode = ref(false);
const autoRun = ref<number | null>(null);

/* interaction state (client-side only — the sim sees intents, not gestures) */
const armedPort = ref<PortSpec | null>(null); // click-to-link source / drag start
const dragPos = ref<{ x: number; y: number } | null>(null);
const livePreview = ref<CablePreview | null>(null); // ladder during drag
const termsCard = ref<{ preview: CablePreview; origin: "drag" | "click" } | null>(null);
const refusalFlash = ref<string | null>(null);
const lastReceiptCount = ref(0);

const PALETTE = Object.freeze([
  Object.freeze({ nodeId: "web-1", kind: "server", label: "web server" }),
  Object.freeze({ nodeId: "sw-1", kind: "switch", label: "patch panel" }),
  Object.freeze({ nodeId: "web-2", kind: "server", label: "db box" }),
  Object.freeze({ nodeId: "sw-2", kind: "switch", label: "spare panel" }),
] as const);

const NODE_LAYOUT: Readonly<Record<string, { x: number; y: number }>> = Object.freeze({
  "web-1": { x: 40, y: 40 },
  "sw-1": { x: 430, y: 40 },
  "web-2": { x: 40, y: 250 },
  "sw-2": { x: 430, y: 250 },
});
const CARD_W = 290;
const CARD_H = 130;

const boardSvg = ref<SVGSVGElement | null>(null);

const activePreview = computed<CablePreview | null>(
  () => livePreview.value ?? termsCard.value?.preview ?? null,
);
const ladderRows = computed(() => {
  const preview = activePreview.value;
  if (preview === null) return [];
  return latencyLadderRows(previewLadderHops(preview));
});

/** Ladder hops mirror the preview's own after-path (pure re-derivation from
 *  the snapshot — the delta's totals are the contract, rows are its display). */
function previewLadderHops(preview: CablePreview): readonly HopLoad[] {
  const args = preview.args as { from: string; to: string; relation: string };
  const hops: HopLoad[] = [];
  const nodeOf = (id: string) => snap.value.nodes.find((n) => n.id === id);
  const from = nodeOf(args.from);
  if (from !== undefined) hops.push(Object.freeze({ label: `${args.from} service`, serviceTimeUs: from.serviceTimeUs, rho: from.rho }));
  if (args.relation === "data") {
    const to = nodeOf(args.to);
    hops.push(Object.freeze({ label: `cable to ${args.to}`, serviceTimeUs: 0n, rho: 0n as Fixed }));
    if (to !== undefined) hops.push(Object.freeze({ label: `${args.to} service`, serviceTimeUs: to.serviceTimeUs, rho: to.rho }));
  }
  return hops;
}

function placed(nodeId: string): boolean {
  return snap.value.nodes.some((n) => n.id === nodeId);
}

/* ── ports & anchors ─────────────────────────────────────────────────── */

interface PlacedPort {
  readonly spec: PortSpec;
  readonly x: number;
  readonly y: number;
}

const allPorts = computed<readonly PlacedPort[]>(() => {
  const out: PlacedPort[] = [];
  for (const node of snap.value.nodes) {
    const layout = NODE_LAYOUT[node.id];
    if (layout === undefined) continue;
    node.ports.forEach((spec, i) => {
      out.push(Object.freeze({ spec, x: layout.x + 34 + i * 52, y: layout.y + CARD_H - 26 }));
    });
  }
  return Object.freeze(out);
});

function portAnchor(spec: PortSpec): { x: number; y: number } | null {
  return allPorts.value.find((p) => p.spec.portId === spec.portId) ?? null;
}

/** glow/dim logic for wiring mode: legal DESTINATIONS for the armed source. */
function portValidity(spec: PortSpec): "source" | "valid" | "invalid" | "idle" {
  const armed = armedPort.value;
  if (armed !== null && armed.portId === spec.portId) return "source";
  if (armed === null || !wiringMode.value) return "idle";
  if (armed.relation !== spec.relation) return "invalid";
  if (armed.nodeId === spec.nodeId) return "invalid";
  const fit = session.previewCable(armed.portId, spec.portId);
  return fit.ok ? "valid" : "invalid";
}

/* ── gestures ────────────────────────────────────────────────────────── */

function svgPoint(event: MouseEvent | PointerEvent): { x: number; y: number } {
  const rect = boardSvg.value?.getBoundingClientRect();
  if (rect === undefined || rect.width === 0) return { x: 0, y: 0 };
  return { x: ((event.clientX - rect.left) / rect.width) * 760, y: ((event.clientY - rect.top) / rect.height) * 420 };
}

function onPortPointerDown(spec: PortSpec, event: PointerEvent): void {
  event.preventDefault();
  if (termsCard.value !== null) return; // card owns the screen
  armedPort.value = spec;
  dragPos.value = svgPoint(event);
  updateLivePreview(spec);
}

function onBoardPointerMove(event: PointerEvent): void {
  if (armedPort.value === null || dragPos.value === null) return;
  const point = svgPoint(event);
  dragPos.value = point;
  const target = portAtPoint(point);
  updateLivePreview(target !== null ? target.spec : null);
}

function onBoardPointerUp(event: PointerEvent): void {
  if (armedPort.value === null) return;
  const source = armedPort.value;
  const target = portAtPoint(svgPoint(event));
  armedPort.value = null;
  dragPos.value = null;
  livePreview.value = null;
  if (target !== null && target.spec.portId !== source.portId) {
    openTerms(source, target.spec, "drag");
  }
}

function portAtPoint(point: { x: number; y: number }): PlacedPort | null {
  for (const p of allPorts.value) {
    if (Math.abs(p.x - point.x) <= 20 && Math.abs(p.y - point.y) <= 20) return p;
  }
  return null;
}

function updateLivePreview(targetSpec: PortSpec | null): void {
  const armed = armedPort.value;
  if (armed === null || targetSpec === null || targetSpec.portId === armed.portId) {
    livePreview.value = null;
    return;
  }
  const verdict = session.previewCable(armed.portId, targetSpec.portId);
  livePreview.value = verdict.ok ? verdict.preview : null;
  refusalFlash.value = verdict.ok ? null : verdict.reason;
}

/** Keyboard click-to-link: Enter arms a source; Enter on a second port is
 *  the SAME preview pipeline the pointer drop feeds. Identical cable. */
function onPortActivate(spec: PortSpec): void {
  if (termsCard.value !== null) return;
  const armed = armedPort.value;
  if (armed === null) {
    armedPort.value = spec;
    refusalFlash.value = `source armed: ${spec.nodeId} · ${spec.label} — Tab to a target, Enter to see terms`;
    return;
  }
  armedPort.value = null;
  if (armed.portId === spec.portId) {
    refusalFlash.value = null;
    return;
  }
  openTerms(armed, spec, "click");
}

function openTerms(source: PortSpec, dest: PortSpec, origin: "drag" | "click"): void {
  const verdict = session.previewCable(source.portId, dest.portId);
  if (!verdict.ok) {
    refusalFlash.value = verdict.reason; // bounce, name the reason, spend nothing
    return;
  }
  refusalFlash.value = null;
  if (session.isMemoized(verdict.preview.memoKey)) {
    session.commitCable(verdict.preview, origin); // same action, same consequence ⇒ no prompt
    step();
    return;
  }
  termsCard.value = Object.freeze({ preview: verdict.preview, origin });
}

function confirmTerms(event?: { shiftKey?: boolean }): void {
  const card = termsCard.value;
  if (card === null) return;
  session.commitCable(card.preview, card.origin, { remember: event?.shiftKey === true });
  termsCard.value = null;
  step();
}

function cancelTerms(): void {
  termsCard.value = null;
  refusalFlash.value = null;
}

function pullCable(edgeId: string): void {
  session.pullCable(edgeId);
  step();
}

function place(nodeId: string, kind: string): void {
  session.placeDevice(nodeId, kind);
  step();
}

function step(): void {
  snap.value = session.step();
  const receipts = snap.value.receipts;
  if (receipts.length > lastReceiptCount.value) {
    const latest = receipts.slice(lastReceiptCount.value);
    lastReceiptCount.value = receipts.length;
    const refused = latest.find((r) => r.outcome === "refused");
    if (refused !== undefined) refusalFlash.value = refused.reason;
  }
}

/* ── global keys (W = wiring mode; TAB stays with focus per the a11y law) ─ */

function onGlobalKey(event: KeyboardEvent): void {
  if (event.key === "w" || event.key === "W") {
    if (event.target instanceof HTMLElement && (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA")) return;
    wiringMode.value = !wiringMode.value;
  }
  if (event.key === "Escape") {
    if (termsCard.value !== null) {
      cancelTerms();
    } else {
      armedPort.value = null;
      livePreview.value = null;
      dragPos.value = null;
    }
  }
}

onMounted(() => window.addEventListener("keydown", onGlobalKey));
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onGlobalKey);
  if (autoRun.value !== null) window.clearInterval(autoRun.value);
});

function toggleAuto(): void {
  if (autoRun.value !== null) {
    window.clearInterval(autoRun.value);
    autoRun.value = null;
  } else {
    autoRun.value = window.setInterval(step, 2000);
  }
}

/* ── derived display helpers ─────────────────────────────────────────── */

const dragPath = computed(() => {
  const armed = armedPort.value;
  const pos = dragPos.value;
  if (armed === null || pos === null) return "";
  const anchor = portAnchor(armed);
  if (anchor === null) return "";
  const mid = (anchor.x + pos.x) / 2;
  return `M ${anchor.x} ${anchor.y} C ${mid} ${anchor.y} ${mid} ${pos.y} ${pos.x} ${pos.y}`;
});

function edgePath(from: string, to: string, curve: number): string {
  const a = NODE_LAYOUT[from];
  const b = NODE_LAYOUT[to];
  if (a === undefined || b === undefined) return "";
  const ax = a.x + CARD_W / 2;
  const ay = a.y + CARD_H - 26;
  const bx = b.x + CARD_W / 2;
  const by = b.y + CARD_H - 26;
  const mx = (ax + bx) / 2;
  const my = Math.min(ay, by) - curve;
  return `M ${ax} ${ay} Q ${mx} ${my} ${bx} ${by}`;
}

function ms(deltaMs: number): string {
  const sign = deltaMs > 0 ? "+" : deltaMs < 0 ? "−" : "";
  return `${sign}${Math.abs(deltaMs).toFixed(3)} ms`;
}

const visibleReceipts = computed(() => snap.value.receipts.slice(-9).reverse());
</script>

<template>
  <section class="g4" data-test="g4-panel" :class="{ 'g4--wiring': wiringMode }">
    <header class="g4-head">
      <div class="g4-title">
        <h2>Drag a Cable</h2>
        <p class="g4-sub">a connection is a dependency — price it before you pay for it</p>
      </div>
      <div class="g4-meters" data-test="g4-meters">
        <span class="g4-meter">board v<b>{{ snap.boardVersion }}</b></span>
        <span class="g4-meter">tick<b>{{ snap.tick.toString() }}</b></span>
        <span class="g4-meter g4-meter--digest" :title="snap.digest">digest {{ snap.digest.slice(0, 8) }}</span>
      </div>
    </header>

    <div class="g4-toolbar">
      <button
        v-for="item in PALETTE"
        :key="item.nodeId"
        class="g4-btn"
        data-test="palette-btn"
        :data-test-id="`palette-${item.nodeId}`"
        :disabled="placed(item.nodeId)"
        @click="place(item.nodeId, item.kind)"
      >
        ▣ place {{ item.label }}
        <small>{{ item.nodeId }}</small>
      </button>
      <span class="g4-spacer" />
      <button class="g4-btn" data-test="g4-wiring-toggle" :class="{ 'g4-btn--on': wiringMode }" @click="wiringMode = !wiringMode">
        ⌁ wiring mode <kbd>W</kbd>
      </button>
      <button class="g4-btn" data-test="g4-step" @click="step()">▶ step</button>
      <button class="g4-btn" :class="{ 'g4-btn--on': autoRun !== null }" data-test="g4-auto" @click="toggleAuto()">
        {{ autoRun === null ? "auto" : "halt" }}
      </button>
    </div>

    <div class="g4-stage">
      <svg
        ref="boardSvg"
        class="g4-board"
        data-test="g4-board"
        viewBox="0 0 760 420"
        @pointermove="onBoardPointerMove"
        @pointerup="onBoardPointerUp"
      >
        <defs>
          <pattern id="g4-grid" width="26" height="26" patternUnits="userSpaceOnUse">
            <path d="M 26 0 L 0 0 0 26" fill="none" stroke="var(--g4-grid)" stroke-width="0.6" />
          </pattern>
        </defs>
        <rect class="g4-atmos" width="760" height="420" fill="url(#g4-grid)" />

        <g :class="{ 'g4-world': true, 'g4-world--dim': wiringMode }">
          <g v-for="node in snap.nodes" :key="node.id" class="g4-device" :transform="`translate(${NODE_LAYOUT[node.id]?.x ?? 0},${NODE_LAYOUT[node.id]?.y ?? 0})`">
            <rect class="g4-device-plate" :width="CARD_W" :height="CARD_H" />
            <text class="g4-device-id" x="12" y="24">{{ node.id }}</text>
            <text class="g4-device-kind" x="12" y="42">{{ node.kind }}</text>
            <text class="g4-device-meta" x="12" y="60">service {{ (node.serviceTimeUs / 1000n) }}ms · ρ≈{{ Math.round(Number(node.rho) * 100 / 65536) }}</text>
            <text v-if="!node.ports.some(p => p.relation === 'power') || !snap.edges.some(e => e.relation === 'power' && e.to === node.id)" class="g4-device-alarm" x="12" y="82">
              ⚠ NO POWER FEED
            </text>
          </g>

          <path
            v-for="edge in snap.edges"
            :key="edge.id"
            class="g4-edge"
            :class="`g4-edge--${edge.relation}`"
            :d="edgePath(edge.from, edge.to, edge.relation === 'power' ? 40 : 26)"
            :stroke-dasharray="PORT_GLYPHS[edge.relation].dash"
            :stroke-width="PORT_GLYPHS[edge.relation].strokeWidth"
          />
        </g>

        <!-- ports render OUTSIDE the dim group: in wiring mode the world
             recedes and the sockets are the only bright things left -->
        <g
          v-for="p in allPorts"
          :key="p.spec.portId"
          class="g4-port"
          :class="[
            `g4-port--${p.spec.relation}`,
            `g4-port--${portValidity(p.spec)}`,
          ]"
          :transform="`translate(${p.x - 12},${p.y - 12})`"
          tabindex="0"
          role="button"
          :aria-label="`${PORT_GLYPHS[p.spec.relation].ariaLabel} on ${p.spec.nodeId} · ${p.spec.label}`"
          :data-test="`port-${p.spec.portId}`"
          @pointerdown="onPortPointerDown(p.spec, $event)"
          @keydown.enter.prevent="onPortActivate(p.spec)"
          @keydown.space.prevent="onPortActivate(p.spec)"
        >
          <path class="g4-port-glyph" :d="PORT_GLYPHS[p.spec.relation].path" />
        </g>

        <path v-if="dragPath !== ''" class="g4-drag-cable" :d="dragPath" />

        <g v-for="node in snap.nodes" :key="`pull-${node.id}`">
          <g
            v-for="edge in snap.edges.filter((e) => e.to === node.id && NODE_LAYOUT[e.from] !== undefined)"
            :key="`edge-btn-${edge.id}`"
            class="g4-edge-pull"
            :transform="`translate(${((NODE_LAYOUT[edge.from]?.x ?? 0) + (NODE_LAYOUT[edge.to]?.x ?? 0)) / 2 + CARD_W / 2 - 9},${Math.min(NODE_LAYOUT[edge.from]?.y ?? 0, NODE_LAYOUT[edge.to]?.y ?? 0) + 16})`"
          >
            <circle r="9" />
            <text class="g4-pull-x" y="4" text-anchor="middle">×</text>
            <title>{{ edge.id }} — click to disconnect-drain (v0 plain pull)</title>
            <rect x="-12" y="-12" width="24" height="24" fill="transparent" @click="pullCable(edge.id)" />
          </g>
        </g>
      </svg>

      <!-- LIVE LATENCY LADDER — visible during drag / card, never during idle -->
      <aside v-if="livePreview !== null || termsCard !== null" class="g4-ladder" data-test="ladder-panel" aria-live="polite">
        <h3>latency ladder</h3>
        <table>
          <tbody>
            <tr v-for="row in ladderRows" :key="row.label" :class="{ 'g4-ladder-saturated': row.saturated }">
              <td>{{ row.label }}</td>
              <td class="g4-num">{{ row.baseMs.toFixed(1) }}</td>
              <td class="g4-num"><b>{{ row.effectiveMs.toFixed(1) }}</b></td>
              <td class="g4-num">ρ {{ row.rhoPct }}%</td>
            </tr>
          </tbody>
        </table>
        <p class="g4-ladder-delta" data-test="ladder-delta">
          Δ <b>{{ activePreview === null ? "" : ms(activePreview.delta.deltaMs) }}</b>
          <span v-if="(activePreview?.delta.saturatedLabels.length ?? 0) > 0"> · at capacity</span>
        </p>
      </aside>

      <!-- TERMS CARD — the commit-before-consequence door -->
      <div
        v-if="termsCard !== null"
        class="g4-terms"
        data-test="terms-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="g4-terms-title"
        @keydown.escape.prevent="cancelTerms"
        @keydown.enter.prevent="confirmTerms($event)"
        tabindex="-1"
      >
        <h3 id="g4-terms-title">{{ termsCard.preview.card.headline }}</h3>
        <dl>
          <template v-for="row in termsCard.preview.card.rows" :key="row.label">
            <dt>{{ row.label }}</dt>
            <dd :data-test="`term-${row.label.toLowerCase().replace(/[^a-z]+/g, '-')}`">
              {{ row.value }} <small>{{ row.explain }}</small>
            </dd>
          </template>
        </dl>
        <ul class="g4-surface" data-test="terms-attack-surface">
          <li v-for="delta in termsCard.preview.card.attackSurface" :key="delta.family">
            <b>{{ delta.family }}</b> — {{ delta.note }}
          </li>
        </ul>
        <p class="g4-commit-note">
          committing spends 1 hand for {{ termsCard.preview.card.commit.busyTicks }} ticks ·
          origin: {{ termsCard.origin }} — the sim cannot tell
        </p>
        <div class="g4-terms-actions">
          <button class="g4-btn g4-btn--commit" data-test="terms-confirm" @click="confirmTerms($event)">
            commit cable <kbd>Enter</kbd> <small>shift = stop asking for this link type</small>
          </button>
          <button class="g4-btn" data-test="terms-cancel" @click="cancelTerms">abandon <kbd>Esc</kbd></button>
        </div>
      </div>

      <aside class="g4-rail">
        <div class="g4-hands" data-test="hands-rail" aria-label="hands">
          <span
            v-for="hand in snap.hands"
            :key="hand.index"
            class="g4-hand"
            :class="{ 'g4-hand--busy': hand.busyCauseId !== null && Number(hand.busyUntilTick) > Number(snap.tick) }"
          >
            ✋{{ hand.index + 1 }}
            <small v-if="hand.busyCauseId !== null && Number(hand.busyUntilTick) > Number(snap.tick)">
              → tick {{ hand.busyUntilTick }}
            </small>
            <small v-else>free</small>
          </span>
        </div>

        <p v-if="refusalFlash !== null" class="g4-refusal" data-test="refuse-flash" role="alert">
          ⤺ {{ refusalFlash }}
        </p>

        <ol class="g4-log" data-test="receipt-log">
          <li v-for="r in visibleReceipts" :key="r.seq" :class="`g4-receipt--${r.outcome}`">
            <b>[{{ r.outcome === "executed" ? "✓" : "✗" }}]</b>
            t{{ r.tick }} #{{ r.seq }} {{ r.verb }}
            <small v-if="r.clientLabel">{{ r.clientLabel }}</small>
            <em v-if="r.reason">— {{ r.reason }}</em>
          </li>
        </ol>
      </aside>
    </div>
  </section>
</template>

<style scoped>
/* gate-local chord on the era tokens (--hh-*): copper + cyan patch bay.
   Committed palette per frontend-philosophy — the board is dark metal,
   cables are bright enamel, refusals are a red dash (never red alone). */
.g4 {
  --g4-hue-data: var(--hh-accent, #35e0e6);
  --g4-hue-power: #e07b39; /* copper — the one era-independent truth */
  --g4-hue-control: #e8e6df;
  --g4-hue-trust: #9f7be6;
  --g4-grid: color-mix(in srgb, var(--hh-accent, #35e0e6) 14%, transparent);
  --g4-plate: color-mix(in srgb, var(--hh-surface, #0d131c) 82%, #9aa7b8);
  --g4-ink: var(--hh-accent, #35e0e6);
  font-family: var(--hh-typeface, "Space Grotesk", monospace);
  color: var(--g4-ink);
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 100%;
}

.g4-head { display: flex; justify-content: space-between; align-items: baseline; gap: 18px; }
.g4-title h2 { margin: 0; font-size: 22px; letter-spacing: 0.04em; text-transform: uppercase; }
.g4-sub { margin: 2px 0 0; opacity: 0.75; font-size: 12px; }
.g4-meters { display: flex; gap: 10px; font-size: 12px; }
.g4-meter { border: 1px solid var(--g4-ink); padding: 2px 8px; border-radius: var(--hh-radius, 12px); }
.g4-meter b { margin-left: 4px; }
.g4-meter--digest { opacity: 0.7; font-variant-numeric: tabular-nums; }

.g4-toolbar { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.g4-spacer { flex: 1; }
.g4-btn {
  font: inherit; font-size: 12px;
  background: transparent; color: var(--g4-ink);
  border: 1px solid var(--g4-ink);
  border-radius: var(--hh-radius, 12px);
  padding: 4px 10px; cursor: pointer;
}
.g4-btn small { opacity: 0.65; margin-left: 4px; }
.g4-btn kbd { border: 1px solid currentColor; border-radius: 3px; padding: 0 4px; font-size: 10px; }
.g4-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.g4-btn--on { background: var(--g4-ink); color: var(--hh-surface, #0d131c); }

.g4-stage { position: relative; display: grid; grid-template-columns: 1fr 230px; gap: 12px; }

.g4-board { width: 100%; background: radial-gradient(120% 90% at 50% 8%, color-mix(in srgb, var(--g4-ink) 8%, transparent), transparent), var(--hh-surface, #0d131c); border: 1px solid color-mix(in srgb, var(--g4-ink) 45%, transparent); border-radius: var(--hh-radius, 12px); touch-action: none; }

.g4-world { transition: filter 350ms ease, opacity 350ms ease; }
.g4-world--dim { filter: saturate(0.28) brightness(0.8); opacity: 0.55; }

.g4-device-plate { fill: var(--g4-plate); stroke: color-mix(in srgb, var(--g4-ink) 60%, transparent); stroke-width: 1; rx: 6; }
.g4-device-id { fill: var(--g4-ink); font-size: 15px; font-weight: 700; letter-spacing: 0.05em; }
.g4-device-kind, .g4-device-meta { fill: var(--g4-ink); font-size: 10.5px; opacity: 0.7; }
.g4-device-alarm { fill: #ff5c5c; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; }

.g4-edge { fill: none; }
.g4-edge--data { stroke: var(--g4-hue-data); }
.g4-edge--power { stroke: var(--g4-hue-power); }
.g4-edge--control { stroke: var(--g4-hue-control); }
.g4-edge--trust { stroke: var(--g4-hue-trust); }

.g4-port { cursor: crosshair; outline-offset: 3px; }
.g4-port-glyph { fill: none; stroke: currentColor; stroke-width: 1.6; }
.g4-port--data { color: var(--g4-hue-data); }
.g4-port--power { color: var(--g4-hue-power); }
.g4-port--control { color: var(--g4-hue-control); }
.g4-port--trust { color: var(--g4-hue-trust); }
.g4-port--source .g4-port-glyph { fill: currentColor; }
.g4-port--source { filter: drop-shadow(0 0 6px currentColor); }
.g4-port--valid .g4-port-glyph { fill: currentColor; }
.g4-port--valid { filter: drop-shadow(0 0 9px currentColor); animation: g4-glow 900ms ease-in-out infinite alternate; }
.g4-port--invalid { opacity: 0.22; }
@keyframes g4-glow { from { filter: drop-shadow(0 0 4px currentColor); } to { filter: drop-shadow(0 0 12px currentColor); } }

.g4-drag-cable { fill: none; stroke: #fff; stroke-width: 2; stroke-dasharray: 7 5; pointer-events: none; filter: drop-shadow(0 0 5px rgba(255,255,255,0.7)); }

.g4-edge-pull circle { fill: #200d0d; stroke: #ff5c5c; stroke-width: 1.2; }
.g4-pull-x { fill: #ff5c5c; font-size: 12px; font-weight: 700; }

.g4-ladder {
  position: absolute; left: 8px; bottom: 8px; width: 320px;
  background: color-mix(in srgb, var(--hh-surface, #0d131c) 88%, black);
  border: 1px solid var(--g4-hue-data); border-radius: var(--hh-radius, 12px);
  padding: 8px 12px; font-size: 11.5px;
}
.g4-ladder h3 { margin: 0 0 6px; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.8; }
.g4-ladder table { width: 100%; border-collapse: collapse; }
.g4-ladder td { padding: 2px 4px; }
.g4-num { text-align: right; font-variant-numeric: tabular-nums; }
.g4-ladder-saturated td { text-decoration: underline dashed 1.5px; }
.g4-ladder-delta { margin: 6px 0 0; font-size: 15px; }

.g4-terms {
  position: absolute; right: 246px; top: 30px; width: 330px;
  background: var(--hh-surface, #0d131c);
  border: 2px solid var(--g4-ink);
  border-radius: var(--hh-radius, 12px);
  box-shadow: 0 0 0 1px black, 14px 18px 44px rgba(0, 0, 0, 0.65);
  padding: 14px 16px;
  outline: none;
  z-index: 5;
  animation: g4-slam 240ms cubic-bezier(0.15, 0.9, 0.3, 1.4);
}
@keyframes g4-slam { from { transform: translateY(-14px) scale(0.96); opacity: 0; } to { transform: none; opacity: 1; } }
.g4-terms h3 { margin: 0 0 8px; font-size: 15px; letter-spacing: 0.03em; }
.g4-terms dl { display: grid; grid-template-columns: 92px 1fr; gap: 4px 10px; margin: 0; font-size: 12px; }
.g4-terms dt { opacity: 0.65; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em; align-self: center; }
.g4-terms dd { margin: 0; }
.g4-terms dd small { display: block; opacity: 0.6; font-size: 10.5px; }
.g4-surface { margin: 10px 0 0; padding: 0 0 0 4px; list-style: none; font-size: 11.5px; }
.g4-surface li { border-left: 3px dashed #ff5c5c; padding: 2px 8px; margin: 4px 0; }
.g4-commit-note { font-size: 11px; opacity: 0.75; margin: 10px 0 8px; }
.g4-terms-actions { display: flex; gap: 8px; flex-direction: column; }
.g4-btn--commit { border-width: 2px; font-weight: 700; }

.g4-rail { display: flex; flex-direction: column; gap: 10px; font-size: 11.5px; }
.g4-hands { display: flex; gap: 8px; }
.g4-hand { border: 1px solid currentColor; border-radius: var(--hh-radius, 12px); padding: 3px 8px; }
.g4-hand--busy { color: var(--g4-hue-power); animation: g4-tick 1.2s steps(2) infinite; }
@keyframes g4-tick { 50% { opacity: 0.55; } }
.g4-hand small { opacity: 0.8; margin-left: 4px; }

.g4-refusal { margin: 0; padding: 6px 10px; border: 2px dashed #ff5c5c; border-radius: var(--hh-radius, 12px); color: #ff9d9d; font-size: 11.5px; animation: g4-bounce 320ms; }
@keyframes g4-bounce { 0% { transform: translateY(-10px) } 55% { transform: translateY(3px) } 100% { transform: none } }

.g4-log { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 3px; opacity: 0.88; }
.g4-log li { font-size: 10.5px; border-bottom: 1px dotted color-mix(in srgb, var(--g4-ink) 30%, transparent); padding-bottom: 2px; }
.g4-log small { display: block; opacity: 0.6; }
.g4-log em { color: #ff9d9d; font-style: normal; }
.g4-receipt--refused b { color: #ff5c5c; }
.g4-receipt--executed b { color: #6ce28a; }
</style>
