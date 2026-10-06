<script setup lang="ts">
/** GATE-G5 · renewal calendar strip — a quarter ruler with CLIFF markers.
 *  The law made visible: the pulse opens 90 days out, the cliff is a MINUTE. */
import type { ExplainPayload, RenewalRow } from "./projection.ts";

const props = defineProps<{ rows: readonly RenewalRow[]; minute: number; quarterEndsAt: number }>();
const emit = defineEmits<{ explain: [payload: ExplainPayload] }>();

function pct(m: number): string {
  return `${Math.min(100, Math.max(0, (m / props.quarterEndsAt) * 100)).toFixed(2)}%`;
}

const STATUS_LABEL: Record<RenewalRow["status"], string> = {
  quiet: "—",
  pulsing: "PULSE",
  renewed: "RENEWED",
  lapsed: "LAPSED",
  "dead-ladder": "DUNNED OUT",
};
</script>

<template>
  <section class="g5-panel" aria-label="Renewal calendar">
    <h2 class="g5-h">RENEWAL STRIP · cliffs are minutes, not vibes</h2>
    <div class="g5-ruler" :data-test="`g5-ruler-minute-${minute}`">
      <span class="g5-ruler-fill" :style="{ width: pct(minute) }" />
      <span class="g5-ruler-now" :style="{ left: pct(minute) }" title="now" />
      <span
        v-for="row in rows"
        :key="`tick-${row.contractId}`"
        class="g5-cliff-tick"
        :class="{ 'g5-cliff--lapsed': row.status === 'lapsed', 'g5-cliff--renewed': row.status === 'renewed' }"
        :style="{ left: pct(row.cliffMinute) }"
        :title="`${row.contractId} cliff @ ${row.cliffMinute}`"
      />
    </div>
    <ul class="g5-renewals">
      <li
        v-for="row in rows"
        :key="row.contractId"
        class="g5-renewal"
        :data-test="`g5-renewal-row-${row.contractId}`"
        @click="emit('explain', row.explain)"
      >
        <span class="g5-rid">{{ row.contractId }}</span>
        <span class="g5-rlabel">{{ row.label }}</span>
        <span class="g5-rpulse" :class="{ 'g5-on': row.pulseOpen }">
          pulse {{ row.pulseOpenMinute <= 0 ? "pre-open" : `@${row.pulseOpenMinute}` }}
        </span>
        <span class="g5-rcliff">cliff @{{ row.cliffMinute }}</span>
        <span class="g5-rstatus" :data-test="`g5-renewal-status-${row.contractId}`">{{ STATUS_LABEL[row.status] }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.g5-ruler {
  position: relative;
  height: 18px;
  margin: 8px 0 8px;
  background:
    repeating-linear-gradient(90deg, var(--g5-rule) 0 1px, transparent 1px calc(100% / 30)),
    var(--g5-card);
  border: 1px solid var(--g5-rule-strong);
}
.g5-ruler-fill { position: absolute; inset: 0 auto 0 0; background: var(--g5-teal-soft); }
.g5-ruler-now { position: absolute; top: -3px; bottom: -3px; width: 2px; background: var(--g5-sodium); }
.g5-cliff-tick { position: absolute; top: 1px; bottom: 1px; width: 3px; background: var(--g5-ink-dim); }
.g5-cliff--lapsed { background: var(--g5-oxide); }
.g5-cliff--renewed { background: var(--g5-mint); }
.g5-renewals { list-style: none; margin: 0; padding: 0; }
.g5-renewal {
  display: grid;
  grid-template-columns: 34px 1fr auto auto 84px;
  gap: 8px;
  padding: 4px 4px;
  border-bottom: 1px dotted var(--g5-rule);
  font-size: 11.5px;
  cursor: pointer;
}
.g5-renewal:hover { background: var(--g5-card-hot); }
.g5-rid { font-weight: 700; }
.g5-rlabel { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.g5-rpulse { color: var(--g5-ink-dim); font-variant-numeric: tabular-nums; }
.g5-rpulse.g5-on { color: var(--g5-sodium); font-weight: 700; }
.g5-rcliff { color: var(--g5-ink-dim); font-variant-numeric: tabular-nums; }
.g5-rstatus { text-align: right; font-weight: 700; letter-spacing: 0.1em; font-size: 10px; color: var(--g5-ink); }
</style>
