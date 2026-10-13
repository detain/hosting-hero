<script setup lang="ts">
/**
 * CorpusMissionCard — the 11th §1.5 mission (`metastable-corpus`) becomes
 * RUNNABLE from proto: the browser host injects the shipped g1 wave table as
 * a CorpusAuthority (corpusMission.ts, the proto leg of the @5df5586 seam)
 * and the card shows the scenario suite's own witnesses live — win@240 on
 * the authored arm, guard:cascadeCollapse on the ONE-field wire flip, and
 * the fail-loud CORPUS_UNRESOLVED refusal when the authority is withheld.
 *
 * Button-driven, zero timers, zero runner of its own: runScenario is a pure
 * synchronous composition (mints + driver + money lane) the click awaits
 * directly. Thin static panel — no motion surface.
 */
import { onBeforeUnmount, ref } from "vue";
import { runCorpusMission, missionRows } from "./corpusMission";
import type { CorpusMissionArm } from "./corpusMission";

const TAPE_LIMIT = 24;
const lines = ref<readonly string[]>([]);
const busy = ref(false);

function push(header: string, rows: readonly string[]): void {
  lines.value = Object.freeze([header, ...rows, "", ...lines.value].slice(0, TAPE_LIMIT));
}

function run(arm: CorpusMissionArm, offsets: readonly number[]): void {
  busy.value = true;
  for (const offset of offsets) {
    const outcome = runCorpusMission(arm, offset);
    push(`— ${arm === "win" ? "authored arm (waves [1])" : arm === "lose-flip" ? "one-flip arm (waves [1,5])" : "no-authority probe"} —`, missionRows(outcome));
  }
  busy.value = false;
}

/** Clearing is a render op, but keep the tape reference frozen like the rest. */
function clearTape(): void {
  lines.value = Object.freeze([]);
}

onBeforeUnmount(() => {
  lines.value = Object.freeze([]);
});
</script>

<template>
  <div class="corpus-mission" data-test="corpus-mission">
    <div class="controls">
      <button type="button" data-test="corpus-run-win" :disabled="busy" @click="run('win', [0, 1, 2])">
        run mission · offsets 0/1/2
      </button>
      <button type="button" data-test="corpus-run-flip" :disabled="busy" @click="run('lose-flip', [0, 1, 2])">
        one-flip lose arm (waves [1,5])
      </button>
      <button type="button" data-test="corpus-fail-loud" :disabled="busy" @click="run('no-authority', [0])">
        withhold the authority (fail-loud probe)
      </button>
      <button type="button" data-test="corpus-clear" @click="clearTape()">clear</button>
    </div>

    <ul v-if="lines.length > 0" class="tape" data-test="corpus-tape" aria-live="polite">
      <li v-for="(line, i) in lines" :key="`${line}-${i}`" :class="{ head: line.startsWith('—') }">{{ line }}</li>
    </ul>
    <p v-else class="quiet" data-test="corpus-quiet">
      nothing run yet — the mission is the Metastable heading's corpus twin:
      the REAL g1 wave-1 storm over the 4/min floor, 240 minutes to prove
      the knife-edge.
    </p>

    <p class="honesty" data-test="corpus-honesty">
      Proto host leg of the waves-tableId seam (@5df5586): the g1 slice JSON
      and the threat registry arrive as build-time ?raw strings, seal into
      one frozen CorpusAuthority, and the scenario barrel runs the mission —
      sim-core never touches fs. Invitations are the empty authority (the
      attack-surface-gated storms leg is host adoption owed, same as the
      sim-core suite). Witness base seed 904n, seeds offset 0/1/2.
    </p>
  </div>
</template>

<style scoped>
.corpus-mission { display: grid; gap: 8px; font-family: var(--hh-typeface); font-size: 12px; color: color-mix(in srgb, var(--hh-accent) 78%, #fff); }
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
[data-test="corpus-run-win"] { border-color: color-mix(in srgb, var(--hh-hue-green) 55%, transparent); }
[data-test="corpus-run-flip"] { border-color: color-mix(in srgb, var(--hh-hue-amber) 55%, transparent); }
[data-test="corpus-fail-loud"] { border-style: dashed; opacity: .7; }
.tape { list-style: none; margin: 0; padding: 0; display: grid; gap: 1px; font-size: 11px; font-variant-numeric: tabular-nums; }
.tape li { white-space: pre-wrap; opacity: .85; border-left: 2px solid color-mix(in srgb, var(--hh-hue-grey) 45%, transparent); padding-left: 7px; }
.tape li.head { color: var(--hh-hue-cyan); border-left: 2px solid var(--hh-hue-cyan); }
.quiet { margin: 0; font-size: 10px; opacity: .55; }
.honesty { margin: 0; font-size: 10px; line-height: 1.45; opacity: .45; }
</style>
