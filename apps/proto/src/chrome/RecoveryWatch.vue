<script setup lang="ts">
/**
 * RecoveryWatch — the §7.7 engine slice gets a HUD (thin static panel: zero
 * declared motion, so zero motion-audit surface).
 * Self-contained by law (PricingDial pattern): it owns a PRIVATE SimCoreRunner
 * and NEVER writes the global observed store.
 *
 * Two honest arms, one render path:
 *  - OFF (default): an unarmed runner — `recoveryState()` is undefined and
 *    `recoveryNotices()` stays empty forever, because ADR-0012 keeps the fold
 *    out of the sim entirely. The panel says so instead of faking calm.
 *  - ON: the same runner built with `recovery: defaultRecoveryConfig()`. The
 *    seeded demo board struggles on `edge`, so the full story (episode →
 *    shadow window → second failure → lock → cleared) is reachable with the
 *    buttons below. No timers: every minute advance is a click.
 */
import { computed, onBeforeUnmount, ref } from "vue";
import { defaultRecoveryConfig } from "@hh/sim-core/pipeline";
import { SimCoreRunner } from "../runner/simCoreRunner";
import { buildRecoveryRows, buildRecoveryTape, RECOVERY_WATCH_KINDS } from "./recoveryWatch";

const props = withDefaults(defineProps<{ seed?: number }>(), { seed: 905 });

const TAPE_LIMIT = 6;
const STEP_CAP = 240; // one demo board's patience — never an unbounded loop

const armed = ref(false);
const minute = ref(0);
const seq = ref(0);
let runner = createRunner();

function createRunner(): SimCoreRunner {
  const built = new SimCoreRunner(
    armed.value ? { seed: props.seed, recovery: defaultRecoveryConfig() } : { seed: props.seed },
  );
  return built;
}

/** Rebuild at minute 0 — arming mid-run would fake a fold that wasn't there
 *  for the digests already played. */
function rebuild(): void {
  runner.stop();
  runner = createRunner();
  minute.value = 0;
  seq.value = 0;
}

function step(): void {
  const frame = runner.headlessStep(1000);
  seq.value = frame.seq;
  minute.value = frame.minute;
}

function toggleArm(): void {
  armed.value = !armed.value;
  rebuild();
}

/** Advance until the engine has said its FIRST recovery word (or the cap). */
function runToFirstStory(): void {
  if (!armed.value) return;
  let steps = 0;
  while (runner.recoveryNotices().length === 0 && steps < STEP_CAP) {
    step();
    steps += 1;
  }
}

/** Advance until the closing story (window-cleared) or the cap — lands the
 *  honest armed-but-idle state: the slice outlives its windows as episode
 *  memory, rows empty, tape full. */
function runToCleared(): void {
  if (!armed.value) return;
  let steps = 0;
  while (
    !runner.recoveryNotices().some((n) => n.kind === "window-cleared") &&
    steps < STEP_CAP
  ) {
    step();
    steps += 1;
  }
}

const rows = computed(() => {
  void seq.value; // re-read the runner only when a step landed
  return buildRecoveryRows(runner.recoveryState(), minute.value);
});

const tape = computed(() => {
  void seq.value;
  return buildRecoveryTape(runner.recoveryNotices(), TAPE_LIMIT);
});

const kindSeen = computed(() => {
  void seq.value;
  const counts = new Map<string, number>();
  for (const kind of RECOVERY_WATCH_KINDS) counts.set(kind, 0);
  for (const notice of runner.recoveryNotices()) {
    counts.set(notice.kind, (counts.get(notice.kind) ?? 0) + 1);
  }
  return counts;
});

/** The honest states, told apart by ARMING knowledge and the tape's TAIL —
 *  the panel never guesses off an empty windows map alone. */
const statusKind = computed<"offline" | "armed-quiet" | "watching" | "cleared" | "live">(() => {
  if (!armed.value) return "offline";
  if (rows.value.length > 0) return "live";
  const tail = tape.value[0];
  if (tail === undefined) return "armed-quiet";
  return tail.kind === "window-cleared" ? "cleared" : "watching";
});

const statusText = computed(() => {
  switch (statusKind.value) {
    case "offline":
      return "recovery offline — this run never armed the fold, so the engine holds zero recovery memory (ADR-0012 default-off)";
    case "armed-quiet":
      return "armed, quiet — the fold runs every tick; no node has struggled yet";
    case "watching":
      return "armed, episode memory only — quiet must hold before a shadow window opens";
    case "cleared":
      return "armed, no live windows — the last episode cleared; the slice keeps only struggle memory";
    case "live":
      return `${rows.value.length} node window${rows.value.length === 1 ? "" : "s"} live — second failure inside a window locks the floor`;
  }
});

onBeforeUnmount(() => runner.stop());
</script>

<template>
  <div class="recovery-watch" data-test="recovery-watch" :data-arm="armed ? 'on' : 'off'">
    <div class="controls">
      <button type="button" data-test="recovery-step" @click="step()">step +1m</button>
      <button type="button" data-test="recovery-run-first" :disabled="!armed" @click="runToFirstStory()">
        run to first story
      </button>
      <button type="button" data-test="recovery-run-cleared" :disabled="!armed" @click="runToCleared()">
        run to cleared
      </button>
      <button
        type="button"
        data-test="recovery-arm"
        :aria-pressed="armed"
        @click="toggleArm()"
      >
        {{ armed ? "disarm fold" : "arm recovery fold" }}
      </button>
      <span class="clock" data-test="recovery-minute">m{{ minute }} · seq {{ seq }}</span>
    </div>

    <p
      class="status"
      :class="`status--${statusKind}`"
      data-test="recovery-status"
      :data-status="statusKind"
    >
      {{ statusText }}
    </p>

    <p v-if="statusKind === 'offline'" data-test="recovery-offline">
      Nothing to watch: windows, strikes and ramps only exist when the host
      passes `recovery` into the runner. Step the unarmed run as long as you
      like — this line never changes.
    </p>

    <table v-else-if="rows.length > 0" class="rows" data-test="recovery-rows">
      <thead>
        <tr>
          <th scope="col">node</th>
          <th scope="col">phase</th>
          <th scope="col">strikes</th>
          <th scope="col">arms</th>
          <th scope="col">ramp</th>
          <th scope="col">in window</th>
          <th scope="col">closes in</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.nodeId" :data-test="`recovery-row-${row.nodeId}`">
          <td class="node">{{ row.nodeId }}</td>
          <td>
            <span :class="`chip chip--${row.tone}`" data-test="recovery-phase">{{ row.phaseLabel }}</span>
          </td>
          <td class="num">{{ row.strikes }}</td>
          <td class="num">{{ row.arms }}</td>
          <td class="ramp-cell">
            <span class="ramp-track" aria-hidden="true"
              ><span class="ramp-fill" :class="`ramp-fill--${row.tone}`" :style="{ width: row.rampPct + '%' }"
            /></span>
            <span class="num" data-test="recovery-ramp-pct">{{ row.rampPct }}%</span>
          </td>
          <td class="num">{{ row.minutesInWindow }}m</td>
          <td class="num">{{ row.minutesToClose }}m</td>
        </tr>
      </tbody>
    </table>

    <ul v-if="tape.length > 0" class="tape" data-test="recovery-tape" aria-live="polite">
      <li v-for="line in tape" :key="line.causeId" :class="{ 'tape--unrecognised': !line.recognised }">
        <strong data-test="recovery-tape-headline">{{ line.headline }}</strong>
        <span class="tape-meta">{{ line.nodeId }} · m{{ line.minute }} · arms {{ line.effectiveSlots }}</span>
        <span class="tape-line">{{ line.line }}</span>
      </li>
    </ul>

    <p v-if="armed && tape.length > 0" class="census" data-test="recovery-census">
      <span v-for="[kind, n] in kindSeen" :key="kind" class="census-kind">{{ kind }} {{ n }}</span>
    </p>

    <p class="honesty" data-test="recovery-honesty">
      Engine slice only (v0). The advisory observer OUTs — recoveryCapacityBps,
      the degradedMinutes lifetime meter, acceptsFailback and the crew queue —
      need the raw per-tick event stream the runner does not expose, so they
      stay unsurfaced. "In window" counts from the engine's own open anchor,
      not the observer meter.
    </p>
  </div>
</template>

<style scoped>
.recovery-watch { display: grid; gap: 8px; font-family: var(--hh-typeface); font-size: 12px; color: color-mix(in srgb, var(--hh-accent) 78%, #fff); }
.controls { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
button {
  border: 1px solid color-mix(in srgb, var(--hh-accent) 35%, transparent);
  background: transparent;
  color: inherit;
  font: inherit;
  font-variant-numeric: tabular-nums;
  border-radius: calc(var(--hh-radius) / 2);
  padding: 2px 9px;
  cursor: pointer;
}
button:hover { background: color-mix(in srgb, var(--hh-accent) 14%, transparent); }
button:disabled { opacity: .4; cursor: default; }
button[aria-pressed="true"] { border: 1px solid var(--hh-hue-cyan); color: var(--hh-hue-cyan); }
.clock { margin-left: auto; opacity: .5; font-size: 10px; font-variant-numeric: tabular-nums; }
.status { margin: 0; font-size: 11px; }
.status--offline { opacity: .55; }
.status--armed-quiet { opacity: .75; }
.status--watching { color: var(--hh-hue-azure); }
.status--cleared { color: var(--hh-hue-green); }
.status--live { color: var(--hh-hue-amber); }
.rows { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
.rows th { text-align: left; font-size: 9px; letter-spacing: .14em; text-transform: uppercase; opacity: .5; font-weight: 500; padding: 2px 6px; }
.rows td { padding: 3px 6px; border-top: 1px solid color-mix(in srgb, var(--hh-accent) 14%, transparent); }
.node { letter-spacing: .04em; }
.num { text-align: right; white-space: nowrap; }
.chip { display: inline-block; font-size: 10px; padding: 1px 8px; border-radius: 999px; }
.chip--amber { color: var(--hh-hue-amber); border: 1px solid var(--hh-hue-amber); }
.chip--alarm { color: var(--hh-hue-alarm); border: 1px solid var(--hh-hue-alarm); }
.ramp-cell { display: flex; align-items: center; gap: 6px; justify-content: flex-end; }
.ramp-track { display: inline-block; width: 56px; height: 6px; background: color-mix(in srgb, var(--hh-accent) 16%, transparent); border-radius: 3px; overflow: hidden; }
.ramp-fill { display: block; height: 100%; }
.ramp-fill--amber { background: var(--hh-hue-amber); }
.ramp-fill--alarm { background: var(--hh-hue-alarm); }
.tape { list-style: none; margin: 0; padding: 0; display: grid; gap: 3px; font-size: 11px; }
.tape li { border-left: 2px solid color-mix(in srgb, var(--hh-hue-azure) 55%, transparent); padding-left: 7px; }
.tape--unrecognised { border-left: 2px solid var(--hh-hue-alarm); }
.tape strong { font-weight: 600; }
.tape-meta { margin-left: 6px; opacity: .55; font-size: 10px; font-variant-numeric: tabular-nums; }
.tape-line { display: block; opacity: .8; }
.census { margin: 0; display: flex; flex-wrap: wrap; gap: 8px; font-size: 9px; letter-spacing: .08em; opacity: .45; font-variant-numeric: tabular-nums; }
.honesty { margin: 0; font-size: 10px; line-height: 1.45; opacity: .45; }
</style>
