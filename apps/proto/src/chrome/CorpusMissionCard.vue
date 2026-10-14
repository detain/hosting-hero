<script setup lang="ts">
/**
 * CorpusMissionCard — the 11th §1.5 mission (`metastable-corpus`) becomes
 * RUNNABLE from proto: the browser host injects the shipped g1 wave table as
 * a CorpusAuthority (corpusMission.ts, the proto leg of the @5df5586 seam)
 * and the card shows the scenario suite's own witnesses live — win@240 on
 * the authored arm, guard:cascadeCollapse on the ONE-field wire flip, and
 * the fail-loud CORPUS_UNRESOLVED refusal when the authority is withheld.
 *
 * Invitation law (the @bc11697 join, adopted here): a verdict panel names,
 * per cited wave, which threats carry an inviter pool and which are invited
 * AT THE SURFACE AS-SCHEDULED — toggled between the fresh board (empty
 * buildLog: the fully-gated wave-1 citation starves, the flip's wave 5
 * rides the packed cursor) and the seeded full build (every law buildable
 * at tick 0: every storm lands and both runs replay the law-off witnesses
 * byte-ident). The three original arm buttons stay exactly as pinned —
 * law-on vs law-off is surfaced side by side, never substituted.
 *
 * Button-driven, zero timers, zero runner of its own: runScenario is a pure
 * synchronous composition (mints + driver + money lane) the click awaits
 * directly. Thin static panel — no motion surface.
 */
import { computed, onBeforeUnmount, ref } from "vue";
import {
  corpusMissionDoc,
  corpusMissionFlipDoc,
  missionRows,
  runCorpusMission,
  verdictRows,
} from "./corpusMission";
import type { CorpusMissionArm, CorpusMissionSurface } from "./corpusMission";

const TAPE_LIMIT = 24;
const lines = ref<readonly string[]>([]);
const busy = ref(false);

const ARM_HEADERS: Readonly<Record<CorpusMissionArm, string>> = Object.freeze({
  win: "— authored arm (waves [1]) · law off —",
  "lose-flip": "— one-flip arm (waves [1,5]) · law off —",
  "no-authority": "— no-authority probe —",
  "law-empty-win": "— law on · fresh board · authored [1] —",
  "law-empty-flip": "— law on · fresh board · one-flip [1,5] —",
  "law-seeded-win": "— law on · seeded full build · authored [1] —",
  "law-seeded-flip": "— law on · seeded full build · one-flip [1,5] —",
});

function push(header: string, rows: readonly string[]): void {
  lines.value = Object.freeze([header, ...rows, "", ...lines.value].slice(0, TAPE_LIMIT));
}

function run(arm: CorpusMissionArm, offsets: readonly number[]): void {
  busy.value = true;
  for (const offset of offsets) {
    push(ARM_HEADERS[arm], missionRows(runCorpusMission(arm, offset)));
  }
  busy.value = false;
}

/** The invitation-law probe: the fresh-board starvation, the packed-cursor
 *  landing, and the seeded equivalence — three verdicts worth of tape. */
function runLawProbe(): void {
  busy.value = true;
  for (const arm of ["law-empty-win", "law-empty-flip", "law-seeded-win"] as const) {
    push(ARM_HEADERS[arm], missionRows(runCorpusMission(arm, 0)));
  }
  busy.value = false;
}

/* Verdict panel — buildLog toggle between the fresh board and the seeded
   full build; recomputed from the seam's own scheduling authority. */
const surface = ref<Exclude<CorpusMissionSurface, "off">>("empty-surface");

const verdictLines = computed<readonly string[]>(() =>
  Object.freeze([
    `authored citation — waves [1] — ${surface.value === "empty-surface" ? "fresh board" : "seeded full build"}`,
    ...verdictRows(corpusMissionDoc(), surface.value),
    "one-flip citation — waves [1,5]",
    ...verdictRows(corpusMissionFlipDoc(), surface.value),
  ]),
);

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
      <button type="button" data-test="corpus-run-law" :disabled="busy" @click="runLawProbe()">
        invitation-law probe (fresh vs seeded surface)
      </button>
      <button type="button" data-test="corpus-clear" @click="clearTape()">clear</button>
    </div>

    <div class="verdicts" data-test="corpus-verdicts">
      <div class="toggle" role="group" aria-label="attack-surface buildLog">
        <button
          type="button"
          data-test="corpus-surface-empty"
          :aria-pressed="surface === 'empty-surface'"
          @click="surface = 'empty-surface'"
        >
          fresh board (empty buildLog)
        </button>
        <button
          type="button"
          data-test="corpus-surface-seeded"
          :aria-pressed="surface === 'seeded-surface'"
          @click="surface = 'seeded-surface'"
        >
          seeded (all law buildables @ t0)
        </button>
      </div>
      <ul class="tape verdicts-tape">
        <li v-for="(line, i) in verdictLines" :key="`v-${i}`" :class="{ head: !line.startsWith('wave ') }">{{ line }}</li>
      </ul>
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
      sim-core never touches fs. The invitations panel joins the REAL
      shared-web law (types/shared-web.json unlockedByBuildables, @bc11697):
      the authored wave-1 storm hides scanner-drizzle behind
      public-whois-listing, so a fresh board starves it (fail-loud, the
      law-empty-win arm) while the flip's wave 5 still rides its ungated
      layer7-mimic on the packed cursor; a seeded full build replays the
      law-off witnesses byte-ident. The mission arms above stay law-off —
      the suite's pinned digest witnesses — and the mainline worker/table
      corpus adapter remains the one leg not wired here. Witness base seed
      904n, seeds offset 0/1/2.
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
[data-test="corpus-run-law"] { border-color: color-mix(in srgb, var(--hh-hue-cyan) 55%, transparent); }
[data-test="corpus-fail-loud"] { border-style: dashed; opacity: .7; }
.verdicts { display: grid; gap: 4px; }
.toggle { display: flex; gap: 6px; }
.toggle button[aria-pressed="true"] { background: color-mix(in srgb, var(--hh-accent) 22%, transparent); border-style: solid; }
.verdicts-tape { font-size: 11px; }
.tape { list-style: none; margin: 0; padding: 0; display: grid; gap: 1px; font-size: 11px; font-variant-numeric: tabular-nums; }
.tape li { white-space: pre-wrap; opacity: .85; border-left: 2px solid color-mix(in srgb, var(--hh-hue-grey) 45%, transparent); padding-left: 7px; }
.tape li.head { color: var(--hh-hue-cyan); border-left: 2px solid var(--hh-hue-cyan); }
.quiet { margin: 0; font-size: 10px; opacity: .55; }
.honesty { margin: 0; font-size: 10px; line-height: 1.45; opacity: .45; }
</style>
