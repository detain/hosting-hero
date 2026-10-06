<script setup lang="ts">
/** GATE-G5 · six-bucket stack — "Cash Is Not One Number" (§6.13).
 *  One horizontal stacked bar + a row per bucket whose tooltip carries the
 *  bucket's LAW and whose click opens Explain-This-Number. */
import type { BucketRow, ExplainPayload } from "./projection.ts";

defineProps<{
  rows: readonly BucketRow[];
  bankBalanceText: string;
  spendableText: string;
  netPositionText: string;
}>();
const emit = defineEmits<{ explain: [payload: ExplainPayload] }>();
</script>

<template>
  <section class="g5-panel" aria-label="Cash is not one number">
    <h2 class="g5-h" @click="emit('explain', rows[0]!.explain)">CASH IS NOT ONE NUMBER</h2>

    <div class="g5-stack" role="img" aria-label="Six-bucket money stack">
      <span
        v-for="row in rows"
        :key="`bar-${row.law.bucket}`"
        class="g5-stack-seg"
        :style="{ width: `${(row.share * 100).toFixed(2)}%`, background: row.law.hue }"
        :title="row.law.law"
      />
    </div>

    <ul class="g5-rows">
      <li
        v-for="row in rows"
        :key="row.law.bucket"
        class="g5-row"
        :data-test="`g5-bucket-row-${row.law.bucket}`"
        :title="row.law.law"
        @click="emit('explain', row.explain)"
      >
        <span class="g5-swatch" :style="{ background: row.law.hue }" />
        <span class="g5-row-label">{{ row.law.label }}</span>
        <span class="g5-row-law">{{ row.law.law }}</span>
        <span class="g5-row-amount" :class="{ 'g5-neg': row.amount < 0n }">{{ row.amountText }}</span>
      </li>
    </ul>

    <dl class="g5-summary">
      <div><dt>Spendable now (free)</dt><dd data-test="g5-spendable">{{ spendableText }}</dd></div>
      <div><dt>Bank balance (free+restricted+deferred)</dt><dd>{{ bankBalanceText }}</dd></div>
      <div><dt>Net position (+AR +backlog −committed)</dt><dd>{{ netPositionText }}</dd></div>
    </dl>
  </section>
</template>

<style scoped>
.g5-stack {
  display: flex;
  height: 26px;
  margin: 8px 0 10px;
  border: 1px solid var(--g5-rule-strong);
  overflow: hidden;
}
.g5-stack-seg { height: 100%; min-width: 0; transition: width 240ms ease; }
.g5-rows { list-style: none; margin: 0; padding: 0; }
.g5-row {
  display: grid;
  grid-template-columns: 12px 132px 1fr auto;
  gap: 8px;
  align-items: baseline;
  padding: 5px 4px;
  border-bottom: 1px dotted var(--g5-rule);
  cursor: pointer;
  font-size: 12px;
}
.g5-row:hover { background: var(--g5-card-hot); }
.g5-swatch { width: 12px; height: 12px; align-self: center; }
.g5-row-label { font-weight: 700; letter-spacing: 0.04em; }
.g5-row-law { color: var(--g5-ink-dim); font-size: 10.5px; line-height: 1.35; }
.g5-row-amount { font-variant-numeric: tabular-nums; font-weight: 700; color: var(--g5-ink); }
.g5-neg { color: var(--g5-oxide); }
.g5-summary { display: flex; gap: 18px; margin: 10px 0 0; flex-wrap: wrap; }
.g5-summary div { display: grid; gap: 2px; }
.g5-summary dt { font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.14em; color: var(--g5-ink-dim); }
.g5-summary dd { margin: 0; font-size: 15px; font-weight: 700; font-variant-numeric: tabular-nums; color: var(--g5-mint); }
</style>
