<script setup lang="ts">
/** GATE-G5 · invoice tape — which money landed, which is deferred/AR.
 *  Ledger-tape aesthetic: right-aligned tabular money, one row per event. */
import type { ExplainPayload, TapeRow } from "./projection.ts";

defineProps<{ rows: readonly TapeRow[] }>();
const emit = defineEmits<{ explain: [payload: ExplainPayload] }>();

const EVENT_LABEL: Record<TapeRow["event"], string> = {
  issued: "ISSUE",
  landed: "LAND ",
  declined: "DECL ",
  "written-off": "W/OFF",
};
</script>

<template>
  <section class="g5-panel" aria-label="Invoice tape">
    <h2 class="g5-h">INVOICE TAPE</h2>
    <table class="g5-table" data-test="g5-tape">
      <thead>
        <tr><th>stamp</th><th>deal</th><th>event</th><th class="num">gross</th><th class="num">net</th><th>where the money is</th></tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows"
          :key="row.key"
          class="g5-tape-row"
          :class="`g5-ev--${row.event}`"
          :data-test="`g5-tape-row-${row.event}`"
          @click="emit('explain', row.explain)"
        >
          <td class="g5-stamp">{{ row.stamp }}</td>
          <td>{{ row.contractId }}</td>
          <td class="g5-ev">{{ EVENT_LABEL[row.event] }}</td>
          <td class="num">{{ row.grossText }}</td>
          <td class="num">{{ row.netText }}</td>
          <td class="g5-landing">{{ row.landing }}</td>
        </tr>
        <tr v-if="rows.length === 0"><td colspan="6" class="g5-empty">nothing on the tape yet</td></tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.g5-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
.g5-table th {
  text-align: left;
  font-size: 9px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--g5-ink-dim);
  border-bottom: 2px solid var(--g5-rule-strong);
  padding: 3px 6px;
}
.g5-table td { padding: 3px 6px; border-bottom: 1px dotted var(--g5-rule); vertical-align: baseline; }
.g5-table tr:hover td { background: var(--g5-card-hot); }
.num { text-align: right; font-variant-numeric: tabular-nums; }
.g5-stamp { color: var(--g5-ink-dim); font-variant-numeric: tabular-nums; white-space: nowrap; }
.g5-ev { font-weight: 700; letter-spacing: 0.08em; }
.g5-ev--issued .g5-ev { color: var(--g5-sodium); }
.g5-ev--landed .g5-ev { color: var(--g5-mint); }
.g5-ev--declined .g5-ev, .g5-ev--written-off .g5-ev { color: var(--g5-oxide); }
.g5-landing { color: var(--g5-ink-dim); font-size: 10.5px; }
.g5-empty { color: var(--g5-ink-dim); font-style: italic; }
</style>
