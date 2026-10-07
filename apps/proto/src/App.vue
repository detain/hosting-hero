<script setup lang="ts">
/**
 * The app shell: DOM Chrome tier (§2 layer stack) ABOVE the Pixi world, plus
 * the GATE MOUNT SWITCHER (J1). The left rail lists every stage-mountable
 * prototype gate from the frozen `ALL_GATE_MOUNTS` aggregate (gates/index.ts
 * is the single source — a new gate dir adds one spread line there and lands
 * in the selector automatically). Default view = G1; the "Sandbox" entry
 * returns the original mock-runner WorldStage + instrument chrome.
 *
 * Gate panels are self-contained: each brings its own runner/scenario and
 * mounts INTO the stage slot — the shell never rewrites gate internals.
 *
 * Boot order: observed store ← SimClient ← worker (mock runner) — the sandbox
 * keeps booting the worker exactly as before, so switching back is instant.
 * Chrome never scales with the camera; era re-skins via exactly 4 tokens;
 * Readout Mode and ChromaMeter are always one key away (§1.10).
 */
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from "vue";
import TopBar from "./chrome/TopBar.vue";
import Drawer from "./chrome/Drawer.vue";
import BezelHud from "./chrome/BezelHud.vue";
import ChromaMeter from "./chrome/ChromaMeter.vue";
import WorldStage from "./chrome/WorldStage.vue";
import GateRail, { type RailEntry } from "./chrome/GateRail.vue";
import InstrumentBezel from "./chrome/instruments/InstrumentBezel.vue";
import SimLabPanel from "./lab/SimLabPanel.vue";
import { G1_INSTRUMENTS } from "./chrome/instruments/registry";
import { ALL_GATE_MOUNTS, type GateMount } from "./gates";
import { buildCandidates, formatMicroUsd, formatRunClock, isSpiking, worstState, rhoDisplayOf } from "./chrome/metrics";
import { connectionState, ingestProjection, fault, projection as projectionRef } from "./state/observedStore";
import { SimClient, asWorkerLike, type WorkerLike } from "./bridge/simClient";
import { globalBudget } from "./render/budget";

/** The sandbox view id — never collides with a "G<n>" gateId. */
const SANDBOX_ID = "sandbox";

/** The Sim Lab view id — rail entry #8, mounted by the SAME non-gate
 *  mechanic as the sandbox (App.vue owns it; gates/index.ts is untouched —
 *  the §9.13 six are frozen). */
const SIMLAB_ID = "sim-lab";

const era = ref<"1998" | "2026">("2026");
const readout = ref(false);
const chromaVisible = ref(false);
const clientRef = shallowRef<SimClient | null>(null);
const view = ref<string>("G1");

const railEntries = computed<readonly RailEntry[]>(() => [
  ...ALL_GATE_MOUNTS.map((mount) => ({
    id: mount.gateId,
    badge: mount.gateId,
    title: mount.title,
    subtitle: mount.subtitle,
  })),
  { id: SANDBOX_ID, badge: "00", title: "Sandbox — mock runner", subtitle: "The original g1-smoke canvas, instruments and bezel chrome (no gate engine)." },
  { id: SIMLAB_ID, badge: "LAB", title: "Sim Lab — unattended + coverage", subtitle: "Service benches, not gates: run a whole weekend head-full-stop through @hh/sim-core/unattended, and paint the §2.1 coverage grid with the shared-web roster." },
]);

const activeMount = computed<GateMount | null>(
  () => ALL_GATE_MOUNTS.find((mount) => mount.gateId === view.value) ?? null,
);
const isSimLab = computed(() => activeMount.value === null && view.value === SIMLAB_ID);
const isSandbox = computed(() => activeMount.value === null && !isSimLab.value);

const projection = computed(() => projectionRef.value);
const candidates = computed(() => (projection.value === null ? [] : buildCandidates(projection.value)));
const cashLabel = computed(() =>
  projection.value === null ? "$—" : `Cash ${formatMicroUsd(projection.value.freeCashMicroUsd)}`,
);
const clockLabel = computed(() =>
  projection.value === null ? "T—offline" : `Run ${formatRunClock(projection.value.clocks.simUs)}`,
);
const worst = computed(() => (projection.value === null ? "no-data" : worstState(projection.value)));
const spiking = computed(() => projection.value !== null && isSpiking(projection.value));
const rhoLabel = computed(() => {
  const rho = projection.value === null ? null : rhoDisplayOf(projection.value);
  return rho === null ? "ρ ?" : `ρ ${rho.toFixed(2)}`;
});

onMounted(() => {
  applyEra();
  window.addEventListener("keydown", onGlobalKey);
  let worker: WorkerLike;
  try {
    worker = asWorkerLike(
      new Worker(new URL("./worker/sim.worker.ts", import.meta.url), { type: "module" }),
    );
  } catch (error) {
    // Environment without Worker support (or blocked blob): run the same
    // protocol loop in-process so the prototype still breathes.
    console.warn("[proto] falling back to in-process runner", error);
    import("./bridge/fakeWorker").then(({ FakeWorkerLike: Fake }) => {
      if (clientRef.value !== null) return;
      bootClient(new Fake());
    });
    return;
  }
  bootClient(worker);
});

function bootClient(worker: WorkerLike): void {
  const client = new SimClient(worker, {
    onProjection: (frame) => ingestProjection(frame),
    onFault: (message) => fault(message),
    onReady: (info) => console.info(`[proto] runner ready: ${info.runnerId}@${info.engineVersion}`),
  });
  clientRef.value = client;
  client.boot("g1-smoke-001", 1);
}

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onGlobalKey);
  clientRef.value?.destroy();
});

function onGlobalKey(event: KeyboardEvent): void {
  if (event.target instanceof HTMLInputElement) return;
  if (event.key === "c") chromaVisible.value = !chromaVisible.value;
  if (event.key === "r") readout.value = !readout.value;
}

function applyEra(): void {
  document.documentElement.dataset["era"] = era.value;
}

function toggleEra(): void {
  era.value = era.value === "1998" ? "2026" : "1998";
  applyEra();
}

function setAggression(next: number): void {
  clientRef.value?.sendSlider("defense.aggression", BigInt(Math.round(next * 65536)), "sim");
}

/** Speed gates OBSERVATION only (§4.1) — the label says so, diegistically. */
function cycleSpeed(): void {
  const current = speed.value;
  speed.value = current === 1 ? 2 : current === 2 ? 4 : 1;
  clientRef.value?.setSpeed(speed.value);
}
const speed = ref<1 | 2 | 4>(1);
</script>

<template>
  <TopBar :cash-label="cashLabel" :clock-label="clockLabel" :candidates="candidates">
    <template #right>
      <div class="hud-buttons">
        <span v-if="isSandbox" class="rho-chip">{{ rhoLabel }}</span>
        <button v-if="isSandbox" type="button" @click="cycleSpeed" :aria-label="`speed ${speed}x (observation only)`">
          {{ speed }}×
        </button>
        <button v-if="isSandbox" type="button" @click="setAggression(0)" aria-label="aggression min">Agg−</button>
        <button v-if="isSandbox" type="button" @click="setAggression(1)" aria-label="aggression max">Agg+</button>
        <button type="button" :aria-pressed="readout" @click="readout = !readout">Readout</button>
        <button type="button" :aria-pressed="chromaVisible" @click="chromaVisible = !chromaVisible">Chroma</button>
        <button type="button" @click="toggleEra">Era {{ era }}</button>
      </div>
    </template>
  </TopBar>

  <main class="app-shell">
    <GateRail v-model="view" :entries="railEntries" />

    <!-- Stage slot: the selected gate panel mounts here (self-contained — it
         drives its own runner), the Sim Lab bench mounts on its own view, or
         the sandbox WorldStage chrome returns. -->
    <section
      v-if="activeMount !== null"
      class="gate-stage"
      role="tabpanel"
      :aria-label="`${activeMount.gateId} — ${activeMount.title}`"
      :data-test-id="`gate-stage-${activeMount.gateId}`"
    >
      <component :is="activeMount.component" />
    </section>

    <section
      v-else-if="isSimLab"
      class="gate-stage"
      role="tabpanel"
      aria-label="sim-lab — Sim Lab"
      data-test-id="gate-stage-sim-lab"
    >
      <SimLabPanel />
    </section>

    <template v-else>
      <WorldStage />
      <BezelHud :worst-state="worst" :spiking="spiking" />

      <section class="instrument-rail" aria-label="instrument rail">
        <InstrumentBezel v-for="def in G1_INSTRUMENTS" :key="def.id" :def="def" :readout="readout" />
      </section>

      <ChromaMeter :budget="globalBudget" :visible="chromaVisible" />

      <p v-if="connectionState !== 'live'" class="connection">
        {{ connectionState === "faulted" ? `fault: ${projection === null ? "no frames" : "stale"}` : "connecting to sim worker…" }}
      </p>
      <footer class="ticker" role="status">
        served {{ projection?.counters.served ?? 0 }} · bounced {{ projection?.counters.bounced ?? 0 }} · amber-403
        {{ projection?.counters.blockedFalsePositive ?? 0 }} · landed {{ projection?.counters.landed ?? 0 }}
        <template v-if="spiking"> — SURGE ON THE LANE</template>
      </footer>
    </template>

    <Drawer v-model:readout="readout" />
  </main>
</template>

<style scoped>
.gate-stage {
  position: absolute;
  top: 52px;
  bottom: 0;
  left: 208px;
  right: 0;
  overflow: auto;
  z-index: 10;
  background: radial-gradient(
    120% 90% at 20% 0%,
    color-mix(in srgb, var(--hh-surface) 82%, #fff 4%) 0%,
    color-mix(in srgb, var(--hh-surface) 98%, #000 2%) 70%
  );
}
.rho-chip {
  align-self: center;
  font-variant-numeric: tabular-nums;
  color: var(--hh-accent);
  opacity: .8;
  font-size: 12px;
}
.connection {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  /* Hue law (round-4 residue fix): the connection-fault banner is a LIVE klaxon,
     so it rides the ledger "alarm" job (--hh-hue-alarm). The old inline #e23b3b /
     rgba(226,59,59,.16) were the ledger "red" canvas final-state value re-spelled;
     collapsing them onto alarm is the ratified divergence named in hues.ts
     (chrome alarm reds unify on one value; red stays reserved for canvas state). */
  background: color-mix(in srgb, var(--hh-hue-alarm) 16%, transparent);
  border: 1px dashed var(--hh-hue-alarm);
  padding: 4px 12px;
  border-radius: var(--hh-radius);
  font-size: 12px;
}
.ticker {
  position: absolute;
  left: 224px;
  right: 252px;
  bottom: 0;
  height: 34px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: color-mix(in srgb, var(--hh-accent) 80%, #fff);
  border-top: 1px solid color-mix(in srgb, var(--hh-accent) 22%, transparent);
  background: color-mix(in srgb, var(--hh-surface) 85%, #000);
  padding: 0 12px;
  z-index: 20;
}
</style>
