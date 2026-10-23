<!--
  campaign/CampaignPanel — the CAMPAIGN rail entry: play the six-arc roster
  as carried careers and keep the company in named LONG SAVE slots.

  The play unit is the ARC (campaignModel's header carries the full engine
  law: chapter-atomic chain + founding-tick thread refusal), the terminal is
  the real objective fold (stopReason verbatim per chapter), and the ending
  readout is L-G's EpilogueCard (src/progression/**) welded in: the live
  `endCampaign` result feeds it directly; after a slot reload it is rebuilt
  from the persisted ending snapshot (campaignModel.endingFromSnapshot —
  inverse of the snapshot fold, declared-exit keys never fabricated). The
  museum shelf and succession record ride in as the final node's plain-data
  carriers (campaignModel.epilogueCarriers); payout stays honest-absent —
  the engine's CampaignReport does not surface per-chapter ScenarioReports,
  so exitPayout has no campaign-side carrier (named seam, see report).

  Persistence rides the engine's canonical long-save text codec
  (storage/longSave) through named browser slots (storage/saveSlots): no
  silent overwrite (two-click confirm), corrupt slots listed honestly and
  refused at load, and a loaded company resumes at the next unplayed arc
  with its scars, museum and records intact (the lineage graph IS the
  carried state).

  Colors: era tokens + hue-ledger vars only (the LossCard posture).
-->
<script setup lang="ts">
import { computed, ref, shallowRef } from "vue";
import type { CampaignEnding } from "@hh/sim-core/campaign";
import {
  CAMPAIGN_ARCS,
  ROSTER_ARC_IDS,
  arcLockReason,
  campaignLedger,
  campaignSaveText,
  campaignStateFromSave,
  createCampaignState,
  endingFromSnapshot,
  epilogueCarriers,
  nextArcId,
  playArc,
} from "./campaignModel";
import type { CampaignState } from "./campaignModel";
import { EpilogueCard } from "../progression";
import { browserStorage, listSlots, readCampaignSave, writeCampaignSave } from "../storage/saveSlots";
import type { SlotStorage } from "../storage/saveSlots";
import { SaveSlotError } from "../storage/saveSlots";

const props = defineProps<{ readonly storage?: SlotStorage }>();

/** Injected in tests; the browser's own storage otherwise. A null port (no
 *  Web Storage in the environment) disables the slot bar HONESTLY rather
 *  than pretending saves work. */
const storage = shallowRef<SlotStorage | null>(props.storage ?? browserStorage());

const state = shallowRef<CampaignState>(createCampaignState());
const stage = ref<"idle" | "running">("idle");
const notice = ref<string | null>(null);
const failure = ref<string | null>(null);
const slotName = ref("");
/** non-null while a same-named Save waits on the second click — the inline
 *  overwrite confirm, never a silent replace. */
const pendingOverwrite = ref<string | null>(null);
const slotsTick = ref(0);

const slots = computed(() => {
  slotsTick.value; // recompute dependency after writes
  const port = storage.value;
  return port === null ? [] : listSlots(port, ROSTER_ARC_IDS);
});

const ledger = computed(() => campaignLedger(state.value));
const playable = computed(() => nextArcId(state.value));

/** The ending the card is showing RIGHT NOW (live play), if any. Cleared on
 *  load/blank so a reloaded career never re-plays its predecessor's ending
 *  as if it had just happened. shallowRef: a CampaignEnding is engine-frozen
 *  plain data, never deep-proxied. */
const liveEnding = shallowRef<CampaignEnding | null>(null);

/** Card source: the live ending verbatim, else the persisted snapshot
 *  rebuilt (reload-survivable epilogue), else nothing. */
const epilogue = computed<CampaignEnding | null>(() => {
  if (liveEnding.value !== null) return liveEnding.value;
  const persisted = state.value.lastEnding;
  return persisted === null ? null : endingFromSnapshot(persisted);
});

/** Final node's museum + succession carriers (plain data, honest absence). */
const carriers = computed(() => epilogueCarriers(state.value));

function breathe(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function marksFor(arcId: string) {
  return state.value.marks.filter((mark) => mark.arcId === arcId);
}

async function onPlay(arcId: string): Promise<void> {
  if (arcLockReason(state.value, arcId) !== null || stage.value !== "idle") return;
  stage.value = "running";
  failure.value = null;
  notice.value = null;
  await breathe(); // paint the running stage before the synchronous chain
  await breathe();
  try {
    const result = playArc(state.value, arcId);
    state.value = result.state;
    liveEnding.value = result.ending;
    notice.value = null;
  } catch (error) {
    failure.value = error instanceof Error ? error.message : String(error);
  } finally {
    stage.value = "idle";
  }
}

function onSave(): void {
  const port = storage.value;
  if (port === null) {
    failure.value = "this environment has no Web Storage — slots are unavailable";
    return;
  }
  const name = slotName.value.trim();
  try {
    const overwrite = pendingOverwrite.value === name && name.length > 0;
    writeCampaignSave(port, name, campaignSaveText(state.value), { overwrite });
    pendingOverwrite.value = null;
    slotsTick.value += 1;
    notice.value = `carried company saved to "${name.trim()}"`;
  } catch (error) {
    if (error instanceof SaveSlotError && error.message.includes("already holds")) {
      pendingOverwrite.value = name;
      notice.value = null;
      return;
    }
    failure.value = error instanceof Error ? error.message : String(error);
  }
}

function onLoad(name: string): void {
  const port = storage.value;
  if (port === null) return;
  failure.value = null;
  const text = readCampaignSave(port, name);
  if (text === null) {
    failure.value = `slot "${name}" vanished before the read`;
    slotsTick.value += 1;
    return;
  }
  try {
    state.value = campaignStateFromSave(text);
    liveEnding.value = null;
    pendingOverwrite.value = null;
    notice.value = `loaded "${name}" — the company resumes at its next unplayed arc`;
  } catch (error) {
    failure.value = `slot "${name}" is corrupt: ${error instanceof Error ? error.message : String(error)}`;
  }
}

function onNewCareer(): void {
  state.value = createCampaignState();
  liveEnding.value = null;
  pendingOverwrite.value = null;
  notice.value = "a blank carried company — the roster opens at the prologue";
}
</script>

<template>
  <section class="camp-panel" data-test="camp-panel" aria-label="campaign — the roster of careers">
    <header class="camp-header">
      <h2 class="camp-title">The Campaign</h2>
      <p class="camp-sub">
        Six arcs, thirty-five chapters, carried as careers — the engine's
        real chain, the real terminal line, the real obituary.
      </p>
      <p class="camp-ledger" data-test="camp-ledger">
        <span>{{ ledger.careers }}/{{ CAMPAIGN_ARCS.length }} careers carried</span>
        <span>{{ ledger.chaptersPlayed }} chapters settled</span>
        <span v-if="ledger.rosterDone" data-test="camp-roster-done" class="camp-done-line">
          the roster is complete
        </span>
      </p>
    </header>

    <p v-if="stage === 'running'" class="camp-running" data-test="camp-running" role="status">
      the chain is running…
    </p>
    <p v-if="failure !== null" class="camp-failure" data-test="camp-error" role="alert">{{ failure }}</p>
    <p v-if="notice !== null" class="camp-notice" data-test="camp-notice">{{ notice }}</p>

    <aside
      v-if="epilogue !== null"
      class="camp-ending"
      data-test="camp-ending"
      role="alert"
      :aria-label="`ending — ${epilogue.title}`"
    >
      <EpilogueCard
        :ending="epilogue"
        :museum="carriers?.museum ?? null"
        :succession="carriers?.succession ?? null"
      />
    </aside>

    <ol class="camp-roster" aria-label="campaign roster">
      <li
        v-for="(arc, arcIndex) in CAMPAIGN_ARCS"
        :key="arc.id"
        class="camp-arc"
        :data-test="`camp-arc-${arc.id}`"
      >
        <div class="camp-arc-head">
          <span class="camp-arc-no">{{ arcIndex + 1 }}</span>
          <span class="camp-arc-name">{{ arc.name }}</span>
          <span class="camp-arc-count">{{ arc.chapters.length }} chapters</span>
          <span
            class="camp-arc-status"
            :data-test="`camp-status-${arc.id}`"
            :data-status="arcLockReason(state, arc.id) ?? 'next'"
          >
            {{ arcLockReason(state, arc.id) === 'played' ? 'PLAYED' : arcLockReason(state, arc.id) === 'locked' ? 'LOCKED' : 'NEXT' }}
          </span>
          <button
            class="camp-play"
            :data-test="`camp-play-${arc.id}`"
            :disabled="arcLockReason(state, arc.id) !== null || stage === 'running'"
            :title="arcLockReason(state, arc.id) === 'locked' ? `play ${playable ?? 'the roster'} first` : arcLockReason(state, arc.id) === 'played' ? 'this career is in the ledger' : 'run this career through the real chain'"
            @click="onPlay(arc.id)"
          >
            Play career
          </button>
        </div>
        <ul v-if="marksFor(arc.id).length > 0" class="camp-chapters" :data-test="`camp-chapters-${arc.id}`">
          <li
            v-for="mark in marksFor(arc.id)"
            :key="mark.runId"
            class="camp-chapter"
            :data-test="`camp-chapter-row-${mark.runId}`"
            :data-outcome="mark.outcome"
          >
            <span class="camp-chapter-id">{{ mark.chapterId }}</span>
            <span class="camp-chapter-outcome">{{ mark.outcome }}</span>
            <span class="camp-chapter-stop">{{ mark.stopReason }}</span>
          </li>
        </ul>
      </li>
    </ol>

    <footer class="camp-slots" aria-label="long save slots" data-test="camp-slots">
      <div class="camp-slot-bar">
        <input
          v-model="slotName"
          class="camp-slot-name"
          data-test="camp-slot-name"
          type="text"
          maxlength="40"
          placeholder="slot name"
          :disabled="storage === null"
          aria-label="save slot name"
        />
        <button
          class="camp-save"
          data-test="camp-save"
          :disabled="storage === null || (state.marks.length === 0 && state.playedArcIds.length === 0) || slotName.trim().length === 0"
          :title="storage === null ? 'no Web Storage in this environment' : slotName.trim().length === 0 ? 'name the slot first' : 'serialize the carried company'"
          @click="onSave"
        >
          Save now
        </button>
        <button
          v-if="pendingOverwrite !== null"
          class="camp-save-confirm"
          data-test="camp-save-confirm"
          @click="onSave"
        >
          overwrite “{{ pendingOverwrite }}”?
        </button>
        <button
          class="camp-new-career"
          data-test="camp-new-career"
          title="start a fresh carried company IN THE PANEL (slots are untouched — saving is a separate, explicit act)"
          @click="onNewCareer"
        >
          Blank company
        </button>
      </div>
      <ul v-if="slots.length > 0" class="camp-slot-list" data-test="camp-slot-list">
        <li v-for="slot in slots" :key="slot.name" class="camp-slot-row" :data-test="`camp-slot-row-${slot.name}`">
          <span class="camp-slot-label">{{ slot.name }}</span>
          <span class="camp-slot-meta">
            {{ slot.corrupt ? 'unparseable' : `${slot.playedArcIds.length} arcs · ${slot.chaptersPlayed} chapters` }}
            <template v-if="slot.lastEndingKind !== null"> · {{ slot.lastEndingKind }}</template>
          </span>
          <button
            class="camp-slot-load"
            :data-test="`camp-slot-load-${slot.name}`"
            :disabled="slot.corrupt"
            :title="slot.corrupt ? 'this slot failed the strict restore — it stays listed, never silently repaired' : 'resume this company'"
            @click="onLoad(slot.name)"
          >
            Load
          </button>
        </li>
      </ul>
      <p v-else-if="storage !== null" class="camp-slot-empty" data-test="camp-slot-empty">
        no slots yet — save the carried company to name your first
      </p>
      <p v-else class="camp-slot-none" data-test="camp-slot-none">
        Web Storage is unavailable here; the roster still plays, nothing persists
      </p>
    </footer>
  </section>
</template>

<style scoped>
.camp-panel {
  font-family: var(--hh-typeface);
  color: inherit;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.camp-title {
  margin: 0;
  font-size: 20px;
  letter-spacing: 0.04em;
  color: var(--hh-hue-gold);
}
.camp-sub {
  margin: 4px 0 0;
  opacity: 0.82;
  font-size: 13px;
}
.camp-ledger {
  margin: 6px 0 0;
  display: flex;
  gap: 14px;
  font-size: 12px;
  opacity: 0.75;
}
.camp-done-line {
  color: var(--hh-hue-green);
}
.camp-running {
  color: var(--hh-hue-azure);
  margin: 0;
}
.camp-failure {
  color: var(--hh-hue-alarm);
  margin: 0;
  font-size: 12px;
}
.camp-notice {
  color: var(--hh-hue-green);
  margin: 0;
  font-size: 12px;
}
.camp-ending {
  border: 1px solid color-mix(in srgb, var(--hh-hue-rule-ink) 55%, #fff 0%);
  border-radius: var(--hh-radius);
  background: color-mix(in srgb, var(--hh-surface) 88%, var(--hh-hue-rule-ink) 12%);
  padding: 10px 12px;
}
/* The banner internals are EpilogueCard's own scoped styles (weld 1) —
   only the frame belongs to the panel. */
.camp-roster {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.camp-arc {
  border: 1px solid color-mix(in srgb, var(--hh-surface) 70%, #fff 30%);
  border-radius: var(--hh-radius);
  padding: 8px 10px;
}
.camp-arc-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.camp-arc-no {
  font-size: 11px;
  opacity: 0.6;
}
.camp-arc-name {
  font-size: 14px;
}
.camp-arc-count {
  font-size: 11px;
  opacity: 0.7;
}
.camp-arc-status {
  margin-left: auto;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.camp-arc-status[data-status='played'] {
  color: var(--hh-hue-green);
}
.camp-arc-status[data-status='next'] {
  color: var(--hh-hue-gold);
}
.camp-arc-status[data-status='locked'] {
  color: var(--hh-hue-grey);
}
.camp-play {
  font-family: inherit;
  font-size: 12px;
  border-radius: var(--hh-radius);
  border: 1px solid var(--hh-hue-green);
  background: color-mix(in srgb, var(--hh-surface) 82%, var(--hh-hue-green) 18%);
  color: inherit;
  padding: 3px 10px;
  cursor: pointer;
}
.camp-play:disabled {
  border-color: var(--hh-hue-grey);
  opacity: 0.5;
  cursor: not-allowed;
}
.camp-chapters {
  list-style: none;
  margin: 6px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.camp-chapter {
  display: flex;
  gap: 10px;
  font-size: 11px;
  opacity: 0.86;
}
.camp-chapter-outcome {
  color: color-mix(in srgb, var(--hh-ink, #d7e3ea) 80%, var(--hh-hue-grey) 20%);
}
.camp-chapter[data-outcome='won'] .camp-chapter-outcome {
  color: var(--hh-hue-green);
}
.camp-chapter[data-outcome='lost'] .camp-chapter-outcome,
.camp-chapter[data-outcome='timeout'] .camp-chapter-outcome {
  color: var(--hh-hue-alarm);
}
.camp-chapter-stop {
  opacity: 0.75;
}
.camp-slots {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.camp-slot-bar {
  display: flex;
  gap: 8px;
  align-items: center;
}
.camp-slot-name {
  font-family: inherit;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: var(--hh-radius);
  border: 1px solid color-mix(in srgb, var(--hh-surface) 60%, #fff 40%);
  background: var(--hh-surface);
  color: inherit;
  min-width: 160px;
}
.camp-save,
.camp-save-confirm,
.camp-new-career,
.camp-slot-load {
  font-family: inherit;
  font-size: 12px;
  border-radius: var(--hh-radius);
  border: 1px solid var(--hh-accent);
  background: color-mix(in srgb, var(--hh-surface) 84%, var(--hh-accent) 16%);
  color: inherit;
  padding: 3px 10px;
  cursor: pointer;
}
.camp-save:disabled,
.camp-slot-load:disabled,
.camp-new-career:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: var(--hh-hue-grey);
}
.camp-save-confirm {
  border-color: var(--hh-hue-alarm);
  color: var(--hh-hue-alarm);
}
.camp-slot-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.camp-slot-row {
  display: flex;
  gap: 10px;
  align-items: baseline;
  font-size: 12px;
}
.camp-slot-label {
  color: var(--hh-hue-azure);
}
.camp-slot-meta {
  opacity: 0.78;
}
.camp-slot-row .camp-slot-load {
  margin-left: auto;
}
.camp-slot-empty,
.camp-slot-none {
  font-size: 11px;
  opacity: 0.6;
  margin: 0;
}
</style>
