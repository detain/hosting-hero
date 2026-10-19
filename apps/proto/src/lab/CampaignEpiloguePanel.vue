<script setup lang="ts">
/**
 * CampaignEpiloguePanel — the §1.6 epilogue bench (wave-31 ask (i)): runs the
 * campaign's ending ON THE REAL ENGINE (main thread, sandbox-bench style —
 * unattendedLab precedent) and renders the terminal readout verbatim: title,
 * epitaph, evidence facets, chapter tape, the exit ledger with the valuation
 * adjustment legs, and the authored epilogue prose from the campaign bank.
 *
 * Honesty laws this panel lives by:
 *  - engine strings (title/epitaph/stopReasons) are NEVER re-worded here —
 *    §9.9: dry and accurate, never a punchline;
 *  - the mid-chain declaration renders honestly: CAMPAIGN_EXIT narrates the
 *    QUIET HANDOFF (the ending is the tour's last word) while the run's exit
 *    EDGE + payout repro stay visible as declaration-evidence;
 *  - absent facts print "?" (numberLaw NO_DATA), never a coerced zero;
 *  - a DOC_LIE (a forged doc whose close refutes its declaration) renders in
 *    the visible error lane — a falsified declaration must be SEEN;
 *  - the obituary is reachable only through the `fixture` prop (a forged
 *    panel state from the tests) and is always labeled test-fixture, never
 *    a chip;
 *  - the prose block resolves through getEra() inside a computed, so the
 *    era toggle re-derives copy (byte-ident today — the bank is era-flat).
 *
 * Hue jobs borrowed (ledger names only): gold = money + the exit ledger
 * (money-moves), grey = digest/tape structure (neutral-aggregate), red = the
 * error lane and the death cause (the live bad-news job), green = the live
 * source badge (the bench answering honestly), azure = the prose rail.
 */
import { computed, ref } from "vue";
import { getEra } from "../i18n/eraState";
import { shortDigest } from "./unattendedLab";
import {
  EPILOGUE_ARMS,
  EPILOGUE_MAX_OFFSET,
  EPILOGUE_MIN_OFFSET,
  epilogueProseFor,
  runEpilogue,
} from "./campaignLab";
import type { EpilogueArm, EpiloguePanelState, EpilogueStage } from "./campaignLab";

const props = defineProps<{ fixture?: EpiloguePanelState }>();

// The fixture seam carries a WHOLE panel state: the tests mount a forged
// obituary DONE-state (renderer totality over the closed union) or an
// ERROR-state (a DOC_LIE lane must be visibly renderable), never live chips.
const stage = ref<EpilogueStage>(props.fixture?.stage ?? "idle");
const view = ref<EpiloguePanelState["view"]>(props.fixture?.view ?? null);
const error = ref<string | null>(props.fixture?.error ?? null);
const arm = ref<EpilogueArm>("exit-declared");
const offset = ref<number>(EPILOGUE_MIN_OFFSET);

const running = computed(() =>
  stage.value === "seeding" || stage.value === "chain" || stage.value === "pricing" || stage.value === "projection",
);
const ledger = computed(() => view.value?.exitLedger ?? null);
const digestLabel = computed(() => (view.value?.digest === null || view.value?.digest === undefined ? "—" : shortDigest(view.value.digest)));
const prose = computed(() => {
  const kind = view.value?.declaredExitKind ?? null;
  return kind === null ? null : epilogueProseFor(kind, getEra());
});

async function run(): Promise<void> {
  error.value = null;
  const next = await runEpilogue(arm.value, offset.value, (s) => {
    stage.value = s;
  });
  stage.value = next.stage;
  view.value = next.view;
  error.value = next.error;
}

function bumpOffset(delta: number): void {
  const next = offset.value + delta;
  if (next < EPILOGUE_MIN_OFFSET || next > EPILOGUE_MAX_OFFSET) return;
  offset.value = next;
}
</script>

<template>
  <section class="epilogue-bench" data-test="epilogue-bench">
    <p class="epilogue-lede">
      The ending, rendered from the real engine: run the campaign to its terminal readout
      ({{ EPILOGUE_ARMS.join(" · ") }}) and read the §9.9 evidence with the authored §1.6 epilogue.
      No live obituary — shipped content cannot reach one; the renderer's obituary arm is a
      labeled test fixture. The reserved exit kinds (ipo, management-buyout, wind-down) have no
      chip: the engine cannot yet see them close.
    </p>

    <div class="epilogue-controls">
      <nav class="epilogue-arms" role="tablist" aria-label="epilogue arms">
        <button
          v-for="option in EPILOGUE_ARMS"
          :key="option"
          type="button"
          role="tab"
          :aria-selected="arm === option"
          class="epilogue-arm"
          :class="{ active: arm === option }"
          :data-test="`epilogue-arm-${option}`"
          :disabled="running"
          @click="arm = option"
        >
          {{ option }}
        </button>
      </nav>
      <div class="epilogue-offset">
        <button type="button" data-test="epilogue-offset-down" :disabled="running || offset <= EPILOGUE_MIN_OFFSET" @click="bumpOffset(-1)">−</button>
        <span data-test="epilogue-offset">offset {{ offset }}</span>
        <button type="button" data-test="epilogue-offset-up" :disabled="running || offset >= EPILOGUE_MAX_OFFSET" @click="bumpOffset(1)">+</button>
      </div>
      <button type="button" class="epilogue-run" data-test="epilogue-run" :disabled="running" @click="run">
        Run Epilogue
      </button>
    </div>

    <p v-if="running" class="epilogue-stage" data-test="epilogue-stage">{{ stage }}…</p>
    <p v-else-if="view === null && error === null" class="epilogue-stage" data-test="epilogue-stage">idle — pick an arm and run</p>
    <p v-if="error !== null" class="epilogue-error" data-test="epilogue-error" role="alert">{{ error }}</p>

    <div v-if="view !== null && !running" role="tabpanel" class="epilogue-ending" data-test="epilogue-ending">
      <p class="epilogue-source" :data-source="view.source" data-test="epilogue-source">
        {{ view.source === "fixture" ? `test fixture — ${view.sourceNote}` : view.sourceNote }}
        · {{ view.campaignId }} · <span data-test="epilogue-digest">{{ digestLabel }}</span>
      </p>
      <h3 class="epilogue-title" data-test="epilogue-title">{{ view.title }}</h3>
      <p class="epilogue-kind" data-test="epilogue-kind">ending kind: {{ view.kind }}</p>
      <p class="epilogue-epitaph" data-test="epilogue-epitaph">{{ view.epitaph }}</p>

      <dl class="epilogue-evidence">
        <div v-for="row in view.evidenceRows" :key="row.label" class="epilogue-fact" :data-label="row.label" data-test="epilogue-evidence">
          <dt>{{ row.label }}</dt>
          <dd>{{ row.value }}</dd>
        </div>
      </dl>

      <ul class="epilogue-tape">
        <li v-for="beat in view.chapterTape" :key="beat.chapterId" class="epilogue-tape-row" data-test="epilogue-tape-row">
          {{ beat.chapterId }} — {{ beat.outcome }} — {{ beat.stopReason }}
        </li>
      </ul>

      <div v-if="ledger !== null" class="epilogue-ledger" data-test="epilogue-exit-ledger">
        <p class="epilogue-ledger-head">Exit ledger</p>
        <p>declared: <span data-test="epilogue-declared-kind">{{ ledger.declaredStr }}</span></p>
        <p class="epilogue-narration" data-test="epilogue-narration">{{ ledger.observedStr }}</p>
        <p>edges spawned: {{ ledger.edgeCount }}</p>
        <p>cash slice (exit edge): <span class="epilogue-money" data-test="epilogue-slice">{{ ledger.sliceStr }}</span></p>
        <p>headline offer (repro): <span class="epilogue-money" data-test="epilogue-headline">{{ ledger.headlineStr }}</span></p>
        <ul class="epilogue-adjustments">
          <li v-for="row in ledger.adjustments" :key="row.basis" class="epilogue-adjustment" data-test="epilogue-adjustment">
            {{ row.basis }}: {{ row.text }}
          </li>
        </ul>
      </div>

      <div v-if="prose !== null" class="epilogue-prose" data-test="epilogue-prose">
        <h4 class="epilogue-prose-headline" data-test="epilogue-prose-headline">{{ prose.headline }}</h4>
        <p data-test="epilogue-prose-body1">{{ prose.body1 }}</p>
        <p data-test="epilogue-prose-body2">{{ prose.body2 }}</p>
        <p data-test="epilogue-prose-body3">{{ prose.body3 }}</p>
        <p class="epilogue-prose-profile" data-test="epilogue-prose-profile">{{ prose.profile }}</p>
        <div class="epilogue-frame">
          <p data-test="epilogue-frame-three-cards">{{ prose.frameThreeCards }}</p>
          <p data-test="epilogue-frame-handwriting">{{ prose.frameHandwriting }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.epilogue-bench { padding: 14px 18px 24px; display: grid; gap: 12px; }
.epilogue-lede { margin: 0; font-size: 12px; line-height: 1.5; color: color-mix(in srgb, var(--hh-accent) 78%, transparent); max-width: 72ch; }
.epilogue-controls { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.epilogue-arms { display: flex; gap: 4px; }
.epilogue-arm {
  font: inherit; font-size: 12px; letter-spacing: 0.04em; padding: 4px 12px; cursor: pointer;
  color: color-mix(in srgb, var(--hh-accent) 70%, transparent);
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--hh-accent) 26%, transparent);
  border-radius: var(--hh-radius);
}
.epilogue-arm.active { color: var(--hh-accent); border-color: color-mix(in srgb, var(--hh-accent) 60%, transparent); background: color-mix(in srgb, var(--hh-surface) 80%, #fff 3%); }
.epilogue-offset { display: flex; align-items: center; gap: 6px; }
.epilogue-offset button { font: inherit; width: 26px; height: 26px; cursor: pointer; color: var(--hh-accent); background: transparent; border: 1px solid color-mix(in srgb, var(--hh-accent) 34%, transparent); border-radius: var(--hh-radius); }
.epilogue-offset span { font-size: 12px; color: color-mix(in srgb, var(--hh-hue-grey) 90%, transparent); }
.epilogue-run {
  font: inherit; font-size: 12px; padding: 5px 16px; cursor: pointer;
  color: var(--hh-accent);
  background: color-mix(in srgb, var(--hh-accent) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--hh-accent) 55%, transparent);
  border-radius: var(--hh-radius);
}
.epilogue-run:disabled { opacity: 0.45; cursor: progress; }
.epilogue-stage { font-size: 12px; color: var(--hh-hue-grey); margin: 0; }
.epilogue-error {
  margin: 0; font-size: 12px; line-height: 1.5; white-space: pre-wrap;
  color: var(--hh-hue-red);
  border: 1px solid color-mix(in srgb, var(--hh-hue-red) 45%, transparent);
  border-radius: var(--hh-radius);
  background: color-mix(in srgb, var(--hh-hue-red) 10%, transparent);
  padding: 8px 10px;
}
.epilogue-ending { display: grid; gap: 8px; border: 1px solid color-mix(in srgb, var(--hh-accent) 24%, transparent); border-radius: var(--hh-radius); padding: 12px 14px; }
.epilogue-source { margin: 0; font-size: 11px; color: color-mix(in srgb, var(--hh-hue-green) 85%, transparent); }
.epilogue-source[data-source="fixture"] { color: var(--hh-hue-gold); }
.epilogue-title { margin: 0; font-size: 16px; color: var(--hh-accent); }
.epilogue-kind { margin: 0; font-size: 11px; color: var(--hh-hue-grey); }
.epilogue-epitaph { margin: 0; font-size: 13px; line-height: 1.5; color: color-mix(in srgb, var(--hh-accent) 88%, transparent); }
.epilogue-evidence { margin: 4px 0 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 4px 14px; }
.epilogue-fact { display: flex; justify-content: space-between; gap: 10px; border-bottom: 1px dashed color-mix(in srgb, var(--hh-hue-grey) 25%, transparent); }
.epilogue-fact dt { font-size: 11px; color: var(--hh-hue-grey); }
.epilogue-fact dd { margin: 0; font-size: 11px; color: var(--hh-accent); }
.epilogue-tape { margin: 0; padding-left: 18px; display: grid; gap: 2px; }
.epilogue-tape-row { font-size: 11px; color: color-mix(in srgb, var(--hh-accent) 78%, transparent); }
.epilogue-ledger { display: grid; gap: 3px; border: 1px solid color-mix(in srgb, var(--hh-hue-gold) 38%, transparent); border-radius: var(--hh-radius); padding: 10px 12px; font-size: 12px; }
.epilogue-ledger p { margin: 0; color: color-mix(in srgb, var(--hh-accent) 85%, transparent); }
.epilogue-ledger-head { color: var(--hh-hue-gold); letter-spacing: 0.06em; text-transform: uppercase; font-size: 11px; }
.epilogue-narration { color: var(--hh-hue-grey) !important; }
.epilogue-money { color: var(--hh-hue-gold); }
.epilogue-adjustments { margin: 0; padding-left: 18px; display: grid; gap: 2px; }
.epilogue-adjustment { font-size: 11px; color: color-mix(in srgb, var(--hh-hue-gold) 80%, transparent); }
.epilogue-prose { display: grid; gap: 6px; border-left: 2px solid color-mix(in srgb, var(--hh-hue-azure) 55%, transparent); padding: 4px 0 4px 12px; }
.epilogue-prose-headline { margin: 0; font-size: 13px; color: var(--hh-hue-azure); }
.epilogue-prose p { margin: 0; font-size: 12px; line-height: 1.55; color: color-mix(in srgb, var(--hh-accent) 86%, transparent); }
.epilogue-prose-profile { color: var(--hh-hue-grey) !important; font-style: italic; }
.epilogue-frame { display: grid; gap: 4px; margin-top: 4px; }
.epilogue-frame p { color: color-mix(in srgb, var(--hh-hue-white) 88%, transparent); font-size: 11px; }
</style>
