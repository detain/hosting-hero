<script setup lang="ts">
/** GATE-G5 · economy notice ticker — the quarter's live wire. Newest notice
 *  STAMPS in (the one orchestrated animation of this slice).
 *
 *  COPY LAYER (i18n lane): a cliff-lapse row gains a pack-spoken second line
 *  — decision `alert.churn-fuse` filled with the signer's customer label from
 *  GATE5_SCRIPT. The wire's own kind/detail/cause columns stay VERBATIM
 *  ledger truth; pack prose supplements, never replaces, the data. Kinds
 *  without a pack key render exactly as before (see i18n/noticeCopy.ts).
 *
 *  HOST-WIRING ADDITION (rest-host-wiring lane): the three new economy kinds
 *  (contract-activated / covenant-breached / chargeback-posted) fall through
 *  to the PROVISIONAL voices in gates/g5/noticeSurface.ts — pack prose still
 *  wins whenever noticeWireCopy returns a line.
 *
 *  DEATH PAIR (lane L4): the OD-25(a) kinds (death-imminent /
 *  company-dissolved, contractId "company") need NO wiring here — their pack
 *  keys are zero-slot, so noticeWireCopy resolves them label-free and the
 *  provisional voices stay only as the pack-less fallback. Deaths are
 *  unreachable inside the quarter horizon; a hand-authored scenario that
 *  mints one rides this generic path. */
import { computed } from "vue";
import { signingsById, type TickerRow } from "./projection.ts";
import { noticeWireCopy } from "../../i18n/noticeCopy.ts";
import { voiceEconomyNotice } from "./noticeSurface.ts";

const props = defineProps<{ rows: readonly TickerRow[] }>();

/** Row → second-line prose: pack copy first, provisional voice as the
 *  fallback for the new kinds (null = chrome keeps its silence). */
const copyByRowKey = computed(
  () =>
    new Map(
      props.rows.map((row) => [
        row.key,
        noticeWireCopy(row.kind, signingsById.get(row.contractId)?.customerLabel ?? null)
          ?? voiceEconomyNotice(row.kind),
      ]),
    ),
);
</script>

<template>
  <section class="g5-panel g5-ticker" aria-label="Economy notices">
    <h2 class="g5-h">NOTICE WIRE</h2>
    <ul>
      <li
        v-for="(row, i) in rows"
        :key="row.key"
        class="g5-wire"
        :class="{ 'g5-stamp': i === 0 }"
        :data-test="`g5-ticker-row-${row.kind}`"
      >
        <span class="g5-wstamp">{{ row.kind }}</span>
        <span class="g5-wid">{{ row.contractId }}</span>
        <span class="g5-wdetail">{{ row.detail }}</span>
        <span class="g5-wcause" :title="row.causeId">{{ row.causeId }}</span>
        <span v-if="copyByRowKey.get(row.key) !== null" class="g5-wcopy" data-test="g5-ticker-copy">
          {{ copyByRowKey.get(row.key) }}
        </span>
      </li>
      <li v-if="rows.length === 0" class="g5-silent">the wire is quiet.</li>
    </ul>
  </section>
</template>

<style scoped>
.g5-ticker ul { list-style: none; margin: 0; padding: 0; max-height: 240px; overflow-y: auto; }
.g5-wire {
  display: grid;
  grid-template-columns: 150px 34px 70px 1fr;
  gap: 8px;
  padding: 3px 4px;
  font-size: 11px;
  border-bottom: 1px dotted var(--g5-rule);
  white-space: nowrap;
}
.g5-wstamp { font-weight: 700; letter-spacing: 0.06em; color: var(--g5-ink); }
.g5-wid { color: var(--g5-teal); font-weight: 700; }
.g5-wdetail { color: var(--g5-mint); font-variant-numeric: tabular-nums; text-align: right; }
.g5-wcause { overflow: hidden; text-overflow: ellipsis; color: var(--g5-ink-dim); font-size: 10px; }
.g5-wcopy { grid-column: 1 / -1; white-space: normal; color: var(--g5-ink-dim); font-style: italic; font-size: 10px; }
.g5-silent { color: var(--g5-ink-dim); font-style: italic; }
/* the one orchestrated motion: a new notice SLAMS onto the wire */
.g5-stamp { animation: g5-slam 320ms cubic-bezier(0.2, 1.4, 0.4, 1) both; background: var(--g5-sodium-soft); }
@keyframes g5-slam {
  from { transform: translateY(-8px) rotate(-0.6deg) scale(1.02); opacity: 0; }
  to { transform: none; opacity: 1; }
}
</style>
