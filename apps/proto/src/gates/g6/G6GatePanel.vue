<script setup lang="ts">
/**
 * GATE-G6 · "Two Types, One Engine" — the generality proof on screen.
 *
 * The TYPE TOGGLE swaps LOADED PROFILES into the same `G6Runner` class and
 * the same `G6Side` render component; nothing below the data boundary differs.
 * DUAL-RUN mode is the gate's screenshot moment: two runners, the SAME seed,
 * one clock driving a LIST of sides — the panel holds no per-type variables
 * at all; the divergence minute pulses in each side's own accent.
 *
 * Headless counterpart: packages/sim-core/src/__tests__/gate-g6.test.ts
 * (emergence profiles, grep-proof no-type-branches audit, ×100 digests,
 * cross-swap controls, tempo-flag proof).
 */
import { computed, onBeforeUnmount, ref, shallowRef } from "vue";
import { G6_PROFILES, type G6Profile } from "./g6Data.ts";

/** data-test slug from the typeId tail — pure derivation, no lookup table. */
function typeSlug(id: string): string {
  return id.split(":").pop() ?? id;
}
import { createG6Runner, G6Runner, TOTAL_TICKS } from "./g6Runner.ts";
import type { SimProjection } from "../../shared/protocol.ts";
import G6Side from "./G6Side.vue";

type Mode = "single" | "dual";

interface Side {
  readonly profile: G6Profile;
  runner: G6Runner;
  projection: SimProjection | null;
}

const mode = ref<Mode>("single");
const typeId = ref<string>(G6_PROFILES[0]!.typeId);
const seed = ref<number>(42);
const playing = ref(false);
const spotlight = ref(false);
const sides = shallowRef<readonly Side[]>([]);

const activeProfile = computed<G6Profile>(
  () => G6_PROFILES.find((p) => p.typeId === typeId.value) ?? G6_PROFILES[0]!,
);

/** The stage is a LIST of sides: single mode runs one profile, dual mode
 *  runs every loaded profile — same mint, same step loop, zero branching. */
function profilesForMode(): readonly G6Profile[] {
  return mode.value === "dual" ? G6_PROFILES : [activeProfile.value];
}

function reset(): void {
  halt();
  sides.value = Object.freeze(
    profilesForMode().map((profile) =>
      Object.freeze({ profile, runner: createG6Runner(profile, seed.value), projection: null }) as Side,
    ),
  );
  spotlight.value = false;
}

function stepOnce(): void {
  const current = sides.value;
  if (current.length === 0 || current.every((s) => s.runner.done())) {
    halt();
    return;
  }
  /* ONE clock drives every side — dual mode shares the seed and the step by
     construction, never by synchronization luck. */
  interface Stepped { readonly side: Side; readonly bounced: number; readonly served: number }
  const stepped: Stepped[] = current.map((side) => {
    if (side.runner.done()) return { side, bounced: 0, served: 0 };
    const prev = side.projection;
    const projection = side.runner.step();
    return {
      side: Object.freeze({ profile: side.profile, runner: side.runner, projection }) as Side,
      bounced: projection.counters.bounced - (prev?.counters.bounced ?? 0),
      served: projection.counters.served - (prev?.counters.served ?? 0),
    };
  });
  if (mode.value === "dual" && stepped.length === 2) {
    const a = stepped[0]!;
    const b = stepped[1]!;
    spotlight.value = (a.bounced > 0 && b.bounced === 0 && b.served > 0)
      || (b.bounced > 0 && a.bounced === 0 && a.served > 0);
  } else {
    spotlight.value = false;
  }
  sides.value = Object.freeze(stepped.map((entry) => entry.side));
}

function halt(): void {
  playing.value = false;
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
}

let timer: ReturnType<typeof setInterval> | null = null;

function togglePlay(): void {
  if (playing.value) {
    halt();
    return;
  }
  if (sides.value.length === 0 || sides.value.every((s) => s.runner.done())) reset();
  playing.value = true;
  timer = setInterval(stepOnce, 250);
}

function setMode(next: Mode): void {
  if (mode.value === next) return;
  mode.value = next;
  reset();
}

function setType(nextId: string): void {
  if (typeId.value === nextId || mode.value === "dual") return;
  /* HOT SWAP: same class, same seed, new loaded profile — the runner's
     constructor is the only code that ever sees a bundle. */
  typeId.value = nextId;
  reset();
}

const minute = computed(() => sides.value[0]?.projection?.minute ?? 0);

onBeforeUnmount(halt);
reset();

defineExpose({ stepOnce, reset, setMode, setType, seed, sides });
</script>

<template>
  <div class="g6">
    <header class="chrome">
      <div class="title-block">
        <h2 data-test="g6-title">Two Types · One Engine</h2>
        <p class="sub">zero type-specific branches — the bundle data is the whole story</p>
      </div>
      <div class="controls">
        <div class="seg" role="group" aria-label="mode">
          <button data-test="g6-mode-single" :class="{ on: mode === 'single' }" @click="setMode('single')">Single</button>
          <button data-test="g6-mode-dual" :class="{ on: mode === 'dual' }" @click="setMode('dual')">Dual-run</button>
        </div>
        <div v-if="mode === 'single'" class="seg" role="group" aria-label="hosting type">
          <button
            v-for="p in G6_PROFILES"
            :key="p.typeId"
            :data-test="`g6-type-${typeSlug(p.typeId)}`"
            :class="{ on: typeId === p.typeId }"
            @click="setType(p.typeId)"
          >{{ p.label }}</button>
        </div>
        <label class="seed">seed
          <input v-model.number="seed" type="number" min="0" data-test="g6-seed" @change="reset" />
        </label>
        <div class="transport">
          <button data-test="g6-step" @click="stepOnce">Step ▸</button>
          <button data-test="g6-play" :class="{ on: playing }" @click="togglePlay">{{ playing ? "❚❚ Pause" : "▶ Play" }}</button>
          <button data-test="g6-reset" @click="reset">↺</button>
        </div>
      </div>
    </header>

    <div class="clockbar">
      <span class="minute" data-test="g6-minute">sim-min {{ minute }} / {{ TOTAL_TICKS }}</span>
      <span class="law">same board · same law · same runner class — {{ mode === "dual" ? "two loaded bundles, one clock" : "loaded bundle drives everything" }}</span>
    </div>

    <main class="stage" :class="{ dual: mode === 'dual' }">
      <template v-if="mode === 'dual'">
        <G6Side :profile="sides[0]!.profile" :projection="sides[0]!.projection" :spotlight="spotlight" />
        <div class="divider" aria-hidden="true"><span>one<br />seed</span></div>
        <G6Side :profile="sides[1]!.profile" :projection="sides[1]!.projection" :spotlight="spotlight" />
      </template>
      <G6Side v-else-if="sides[0]" :key="sides[0].profile.typeId" :profile="sides[0].profile" :projection="sides[0].projection" />
    </main>
  </div>
</template>

<style scoped>
.g6 { display: flex; flex-direction: column; gap: 12px; min-height: 100%; }
.chrome {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  flex-wrap: wrap;
  padding-bottom: 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--hh-accent) 25%, transparent);
}
.title-block h2 {
  margin: 0;
  font-family: var(--hh-typeface);
  font-size: 26px;
  letter-spacing: .02em;
  color: var(--hh-accent);
}
.sub { margin: 2px 0 0; font-size: 11px; opacity: .55; letter-spacing: .08em; }
.controls { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.seg { display: inline-flex; border: 1px solid color-mix(in srgb, var(--hh-accent) 40%, transparent); border-radius: var(--hh-radius); overflow: hidden; }
.seg button {
  appearance: none;
  background: transparent;
  border: 0;
  color: var(--hh-accent);
  font-family: var(--hh-typeface);
  font-size: 12px;
  letter-spacing: .1em;
  text-transform: uppercase;
  padding: 7px 13px;
  cursor: pointer;
}
.seg button + button { border-left: 1px solid color-mix(in srgb, var(--hh-accent) 30%, transparent); }
.seg button.on { background: color-mix(in srgb, var(--hh-accent) 22%, transparent); }
.seed { font-size: 11px; letter-spacing: .08em; opacity: .8; display: inline-flex; align-items: center; gap: 6px; }
.seed input {
  width: 70px;
  background: color-mix(in srgb, #000 40%, var(--hh-surface));
  border: 1px solid color-mix(in srgb, var(--hh-accent) 35%, transparent);
  border-radius: 4px;
  color: var(--hh-accent);
  font-family: var(--hh-typeface);
  padding: 4px 6px;
}
.transport { display: inline-flex; gap: 6px; }
.transport button {
  appearance: none;
  background: color-mix(in srgb, var(--hh-accent) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--hh-accent) 45%, transparent);
  border-radius: var(--hh-radius);
  color: var(--hh-accent);
  font-family: var(--hh-typeface);
  font-size: 12px;
  letter-spacing: .08em;
  padding: 7px 12px;
  cursor: pointer;
}
.transport button.on { background: color-mix(in srgb, var(--hh-accent) 34%, transparent); }
.clockbar { display: flex; justify-content: space-between; align-items: baseline; font-size: 11px; }
.minute { font-family: var(--hh-typeface); font-variant-numeric: tabular-nums; font-size: 15px; color: var(--hh-accent); letter-spacing: .06em; }
.law { opacity: .5; letter-spacing: .1em; text-transform: uppercase; }
.stage { display: grid; gap: 14px; flex: 1 1 auto; }
.stage.dual { grid-template-columns: 1fr 46px 1fr; align-items: stretch; }
.divider {
  align-self: center;
  text-align: center;
  font-size: 10px;
  letter-spacing: .22em;
  text-transform: uppercase;
  opacity: .5;
  color: var(--hh-accent);
  border-top: 1px dashed color-mix(in srgb, var(--hh-accent) 40%, transparent);
  padding-top: 6px;
}
</style>
