<script setup lang="ts">
/**
 * The app shell: DOM Chrome tier (§2 layer stack) ABOVE the Pixi world, plus
 * the GATE MOUNT SWITCHER (J1). The left rail lists every stage-mountable
 * prototype gate from the frozen `ALL_GATE_MOUNTS` aggregate (gates/index.ts
 * is the single source — a new gate dir adds one spread line there and lands
 * in the selector automatically). Default view = G1; the "Sandbox" entry
 * returns the WorldStage + instrument chrome driven by the mainline
 * sim-core worker (the mock toy stays behind explicit `runnerKind: "mock"`
 * boots in tests — see bootClient).
 *
 * Gate panels are self-contained: each brings its own runner/scenario and
 * mounts INTO the stage slot — the shell never rewrites gate internals.
 *
 * Boot order: observed store ← SimClient ← worker (mainline stepper,
 * sim-core) — the sandbox boots the worker through the REAL boot path,
 * armed with the production deck book (`runner/productionRules.ts`, owner
 * ruling 2026-10-19: watch-the-door on the mainline stepper; the dormant
 * switch keeps the un-armed wire reachable for tests).
 *
 * SESSION (slice-(d), wave-32): entering the SESSION view RE-BOOTS the same
 * client with the colo riders (corpus + build + the same production book);
 * the worker's boot branch stops the previous runner, so one client, one
 * worker, and the observed store never sees interleaved runs. Leaving the
 * view re-boots the sandbox default. The panel halts the run itself on the
 * company-dissolved rider (chrome/deathWatch authority).
 * Chrome never scales with the camera; era re-skins via exactly 4 tokens;
 * Readout Mode and ChromaMeter are always one key away (§1.10).
 */
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import TopBar from "./chrome/TopBar.vue";
import Drawer from "./chrome/Drawer.vue";
import BezelHud from "./chrome/BezelHud.vue";
import ChromaMeter from "./chrome/ChromaMeter.vue";
import WorldStage from "./chrome/WorldStage.vue";
import GateRail, { type RailEntry } from "./chrome/GateRail.vue";
import InstrumentBezel from "./chrome/instruments/InstrumentBezel.vue";
import SimLabPanel from "./lab/SimLabPanel.vue";
import SessionPanel from "./session/SessionPanel.vue";
import CampaignPanel from "./campaign/CampaignPanel.vue";
import { CAMPAIGN_ID } from "./campaign/campaignModel";
import { DEFAULT_SESSION_RIDERS, SESSION_ID, type SessionBootRiders } from "./session/sessionModel";
import { asPumpHost, clearSessionHandle, setSessionHandle } from "./session/sessionBus";
import { G1_INSTRUMENTS } from "./chrome/instruments/registry";
import { ALL_GATE_MOUNTS, type GateMount } from "./gates";
import { buildCandidates, formatMicroUsd, formatRunClock, isSpiking, worstState, rhoDisplayOf } from "./chrome/metrics";
import { connectionState, ingestProjection, fault, projection as projectionRef } from "./state/observedStore";
import { era, nextEra, setEra } from "./i18n/eraState";
import { SimClient, asWorkerLike, type WorkerLike } from "./bridge/simClient";
import { productionBootRules } from "./runner/productionRules";
import { globalBudget } from "./render/budget";
import DecisionRail from "./decision/DecisionRail.vue"; // §7.6 marked-decision rail
import LossCard from "./chrome/LossCard.vue"; // §9.9 obituary — batch-E v0 death rider consumer
import { toggleContrastAuditMode } from "./chrome/a11y/contrastAuditMode"; // §8.14 Contrast Audit Mode

/** The sandbox view id — never collides with a "G<n>" gateId. */
const SANDBOX_ID = "sandbox";

/** The Sim Lab view id — rail entry #8, mounted by the SAME non-gate
 *  mechanic as the sandbox (App.vue owns it; gates/index.ts is untouched —
 *  the §9.13 six are frozen). */
const SIMLAB_ID = "sim-lab";
// The SESSION view id (slice-(d), rail entry #9) rides the same App-owned
// badge route; sessionModel.SESSION_ID is its single source. The CAMPAIGN
// view id (rail entry #10) rides it too — campaignModel.CAMPAIGN_ID.

// Era toggle lifted to i18n/eraState (shared ref) — pack copy tracks it too.
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
  { id: SANDBOX_ID, badge: "00", title: "Sandbox — mainline stepper", subtitle: "The g1-smoke canvas, instruments and bezel chrome, driven by the real sim-core worker — boot.rules armed with the shipped watch-the-door deck (owner-ratified 2026-10-19; inert until a card is committed)." },
  { id: SIMLAB_ID, badge: "LAB", title: "Sim Lab — unattended + coverage + epilogue", subtitle: "Service benches, not gates: run a whole weekend head-full-stop through @hh/sim-core/unattended, paint the §2.1 coverage grid with the shared-web roster, and render a campaign's ending on the real engine with its §1.6 epilogue." },
  { id: SESSION_ID, badge: "SESS", title: "Session — one continuous colo run", subtitle: "The slice-(d) product session: the shipped colo quarter (boot.corpus) over a seeded four-node maze (boot.build), the watch-the-door book armed (boot.rules), the money lane live, the intent door open from tick 1 — until the company dissolves." },
  { id: CAMPAIGN_ID, badge: "CAMP", title: "Campaign — the roster of careers", subtitle: "The §1.6 six-arc, 35-chapter roster played through the REAL engine chain — arc careers settle per Matrix-B law, the terminal line is the objective fold verbatim, and the carried company persists across sessions in named long-save slots." },
]);

const activeMount = computed<GateMount | null>(
  () => ALL_GATE_MOUNTS.find((mount) => mount.gateId === view.value) ?? null,
);
const isSimLab = computed(() => activeMount.value === null && view.value === SIMLAB_ID);
const isSession = computed(() => activeMount.value === null && view.value === SESSION_ID);
const isCampaign = computed(() => activeMount.value === null && view.value === CAMPAIGN_ID);
const isSandbox = computed(
  () => activeMount.value === null && !isSimLab.value && !isSession.value && !isCampaign.value,
);

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

/** The host behind the ONE client (real Worker or the FakeWorkerLike
 *  fallback); re-boot swaps runners inside it, never the host itself. */
const hostRef = shallowRef<WorkerLike | null>(null);

function bootClient(worker: WorkerLike): void {
  hostRef.value = worker;
  const client = new SimClient(worker, {
    onProjection: (frame) => ingestProjection(frame),
    onFault: (message) => fault(message),
    onReady: (info) => console.info(`[proto] runner ready: ${info.runnerId}@${info.engineVersion}`),
  });
  clientRef.value = client;
  // The fake fallback resolves asynchronously — if the player already
  // picked SESSION by then, the FIRST boot must be the session boot.
  if (view.value === SESSION_ID) bootSessionRunner(client);
  else bootDefaultRunner(client);
}

// Production mainline boot (owner ruling 2026-10-19): the sandbox boots
// the REAL sim-core stepper through the same 6-positional wire every
// headless witness uses; `productionBootRules()` answers the shipped
// watch-the-door book when armed (default) and undefined when dormant —
// undefined ⇒ the `rules` key is never posted ⇒ the exact pre-adoption
// wire. The mock toy remains reachable via explicit `runnerKind: "mock"`
// boots (tests only — mock + Book is a wiring bug the hosts fault loud).
function bootDefaultRunner(client: SimClient): void {
  clearSessionHandle();
  client.boot("g1-smoke-001", 1, "sim-core", undefined, undefined, productionBootRules());
}

/** SESSION boot (slice-(d)): the same client, the same worker — the boot
 *  branch stops the previous runner before minting, so re-boot is
 *  protocol-native. riders ride the frozen sessionModel data (DEFAULT —
 *  the positional boot values are byte-ident to the pre-rider call, twin-
 *  pinned by sessionRiders.test.ts); the book is the SAME production leg
 *  as the sandbox (main-thread import law: productionRules never crosses
 *  into the worker graph). A future product run passes chapter-derived
 *  riders through this one seam. */
function bootSessionRunner(client: SimClient, riders: SessionBootRiders = DEFAULT_SESSION_RIDERS): void {
  client.boot(riders.seed, 1, "sim-core", riders.corpus, riders.build, riders.rules ?? productionBootRules());
  setSessionHandle({ client, host: asPumpHost(hostRef.value) });
}

// View switch = boot switch (one client, one run at a time): entering
// SESSION hands the wire the colo riders; leaving re-boots the sandbox.
watch(view, (next, prev) => {
  const client = clientRef.value;
  if (client === null) return; // fake fallback path boots on arrival
  if (next === SESSION_ID) bootSessionRunner(client);
  else if (prev === SESSION_ID) bootDefaultRunner(client);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onGlobalKey);
  clearSessionHandle();
  clientRef.value?.destroy();
});

function onGlobalKey(event: KeyboardEvent): void {
  if (event.target instanceof HTMLInputElement) return;
  if (event.key === "c") chromaVisible.value = !chromaVisible.value;
  if (event.key === "r") readout.value = !readout.value;
  if (event.key === "a") toggleContrastAuditMode(); // 'a' = Eyes: luminance-only audit (§8.14)
}

function applyEra(): void {
  document.documentElement.dataset["era"] = String(era.value);
}

// Any era change re-skins — programmatic setEra() can't drift the skin from
// the copy (the toggle below stays synchronous for its own click path).
watch(era, applyEra);

function toggleEra(): void {
  // N-way canon cycle (OD-22 ratified four-phase axis) — eraState.nextEra is
  // the single authority, wrapped at 2026 back to 1998.
  setEra(nextEra(era.value));
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
/** OD-10 (ADR-0013 ruling 3): max-LEGIBLE clock speed is 2× until G1
 *  playtest data exists. This changes NO legality — the SpeedX door keeps
 *  its shipped 1|2|4 ladder (3× stays illegal in SpeedX, not here) — it
 *  only surfaces the honesty hint once the observation dial is above the
 *  legibility line, in the label and in a quiet chip beside it. */
const LEGIBLE_SPEED_MAX = 2;
const speedAria = computed(() =>
  speed.value > LEGIBLE_SPEED_MAX
    ? `speed ${String(speed.value)}x (observation only) — past the ${String(LEGIBLE_SPEED_MAX)}x legibility limit, anomalies hide (OD-10)`
    : `speed ${String(speed.value)}x (observation only)`,
);
</script>

<template>
  <TopBar :cash-label="cashLabel" :clock-label="clockLabel" :candidates="candidates">
    <template #right>
      <div class="hud-buttons">
        <span v-if="isSandbox" class="rho-chip">{{ rhoLabel }}</span>
        <button v-if="isSandbox" type="button" @click="cycleSpeed" :aria-label="speedAria">
          {{ speed }}×
        </button>
        <span
          v-if="isSandbox && speed > LEGIBLE_SPEED_MAX"
          class="speed-hint"
          data-test="speed-legibility-hint"
        >past {{ LEGIBLE_SPEED_MAX }}× the log thins — legibility is on you (OD-10)</span>
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

    <section
      v-else-if="isSession"
      class="gate-stage"
      role="tabpanel"
      aria-label="session — one continuous colo run"
      :data-test-id="`gate-stage-${SESSION_ID}`"
    >
      <SessionPanel />
    </section>

    <!-- CAMPAIGN (wave-32 slice-(e)-adjacent): the rail badge route's fourth
         product view. No boot branch anywhere — the roster plays through the
         synchronous engine chain in-thread (Sim Lab's epilogue posture), and
         the carried company rides long-save text through named browser slots. -->
    <section
      v-else-if="isCampaign"
      class="gate-stage"
      role="tabpanel"
      aria-label="campaign — the roster of careers"
      :data-test-id="`gate-stage-${CAMPAIGN_ID}`"
    >
      <CampaignPanel />
    </section>

    <template v-else>
      <WorldStage :submit="(args, clock) => clientRef?.sendPlayerVerb(args, clock)" />
      <BezelHud :worst-state="worst" :spiking="spiking" />

      <section class="instrument-rail" aria-label="instrument rail">
        <InstrumentBezel v-for="def in G1_INSTRUMENTS" :key="def.id" :def="def" :readout="readout" />
      </section>

      <ChromaMeter :budget="globalBudget" :visible="chromaVisible" />

      <!-- §7.6 Decision Highlight v0: watches the same observed-store frames
           the canvas does; claims markedDecision slots via globalBudget. -->
      <DecisionRail />

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

    <!-- §9.9 shell-level loss tier: watches the SAME wire the sandbox reads
         (economy-notice death riders); raises the warning strip, then slams
         the obituary on dissolution. View-independent — gates included. -->
    <LossCard />
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
.speed-hint {
  align-self: center;
  font-size: 10px;
  opacity: .55;
  color: var(--hh-accent);
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
