<script setup lang="ts">
/** GATE-G5 · cash-vs-profit two-pane — the SAME month read twice.
 *  Left pane is accrual (the accountant's month), right pane is cash (the
 *  banker's month). When one smiles and the other craters, the wall speaks. */
import type { ExplainPayload, MonthPane } from "./projection.ts";

defineProps<{ months: readonly MonthPane[] }>();
const emit = defineEmits<{ explain: [payload: ExplainPayload] }>();
</script>

<template>
  <section class="g5-panel" aria-label="Cash versus profit">
    <h2 class="g5-h">THE SAME MONTH, TWICE · profit is an opinion, cash is a fact</h2>
    <div class="g5-panes">
      <div class="g5-pane g5-pane--profit">
        <h3>BOOK PROFIT (accrual)</h3>
        <ul>
          <li
            v-for="m in months"
            :key="`p-${m.label}`"
            :data-test="`g5-profit-${m.label.replace(/\s/g, '')}`"
            @click="emit('explain', m.explain)"
          >
            <span class="g5-mlabel">{{ m.label }}</span>
            <span class="g5-num" :class="m.profitPositive ? 'g5-pos' : 'g5-neg'">{{ m.profitText }}</span>
            <span class="g5-sub">revenue {{ m.accrualText }} − opex {{ m.opexText }}</span>
          </li>
        </ul>
      </div>
      <div class="g5-divider" aria-hidden="true">vs</div>
      <div class="g5-pane g5-pane--cash">
        <h3>OPERATING FREE CASH (Δ month · capital excluded)</h3>
        <ul>
          <li
            v-for="m in months"
            :key="`c-${m.label}`"
            :data-test="`g5-cash-${m.label.replace(/\s/g, '')}`"
            :class="{ 'g5-crater': m.cashCratering }"
            @click="emit('explain', m.explain)"
          >
            <span class="g5-mlabel">{{ m.label }}</span>
            <span class="g5-num" :class="m.cashCratering ? 'g5-neg' : 'g5-pos'">{{ m.cashText }}</span>
            <span class="g5-sub">collected to free {{ m.collectedText }}<template v-if="m.cashCratering"> · CRATERING</template></span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.g5-panes { display: grid; grid-template-columns: 1fr auto 1fr; gap: 10px; align-items: start; }
.g5-pane h3 {
  margin: 4px 0 6px;
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--g5-ink-dim);
}
.g5-pane--profit h3 { color: var(--g5-sodium); }
.g5-pane--cash h3 { color: var(--g5-teal); }
.g5-pane ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
.g5-pane li {
  display: grid;
  grid-template-columns: 74px auto;
  grid-template-rows: auto auto;
  gap: 0 10px;
  padding: 5px 7px;
  background: var(--g5-card);
  border-left: 3px solid var(--g5-rule-strong);
  cursor: pointer;
}
.g5-pane li:hover { background: var(--g5-card-hot); }
.g5-mlabel { font-size: 11px; font-weight: 700; }
.g5-num { font-size: 17px; font-weight: 700; text-align: right; font-variant-numeric: tabular-nums; }
.g5-pos { color: var(--g5-mint); }
.g5-neg { color: var(--g5-oxide); }
.g5-sub { grid-column: 1 / -1; font-size: 10px; color: var(--g5-ink-dim); }
.g5-crater { border-left-color: var(--g5-oxide); animation: g5-crater-pulse 1.6s ease-in-out infinite; }
@keyframes g5-crater-pulse {
  0%, 100% { box-shadow: inset 0 0 0 0 rgba(0, 0, 0, 0); }
  50% { box-shadow: inset 0 0 22px 0 rgba(140, 30, 20, 0.35); }
}
.g5-divider {
  align-self: center;
  font: 700 12px/1 var(--hh-typeface, var(--g5-typeface));
  letter-spacing: 0.3em;
  writing-mode: vertical-rl;
  color: var(--g5-ink-dim);
  text-transform: uppercase;
}
</style>
