<script setup lang="ts">
/** GATE-G5 · error-budget panel — the E-9 story in one strip: the incident
 *  burns c07's 99.9 % budget, the risky deploy gets LOCKED (not thrown), and
 *  the settlement freeze pays back stacked clean-week refunds at resume. */
import type { BudgetRow, ExplainPayload } from "./projection.ts";

defineProps<{ rows: readonly BudgetRow[] }>();
const emit = defineEmits<{ explain: [payload: ExplainPayload] }>();
</script>

<template>
  <section class="g5-panel" aria-label="Error budgets">
    <h2 class="g5-h">ERROR BUDGETS · 99.9 % = 2,592 s a month (PROVISIONAL)</h2>
    <ul class="g5-budgets">
      <li
        v-for="row in rows"
        :key="row.contractId"
        class="g5-budget"
        :class="{ 'g5-budget--burned': row.burned }"
        :data-test="`g5-budget-row-${row.contractId}`"
        @click="emit('explain', row.explain)"
      >
        <span class="g5-bid">{{ row.contractId }}</span>
        <span class="g5-blabel">{{ row.label }}</span>
        <span class="g5-bremain" :data-test="`g5-budget-remaining-${row.contractId}`">{{ row.remainingSec }}</span>
        <span v-if="row.lockedAtMinute !== null" class="g5-blocked" :data-test="`g5-budget-locked-${row.contractId}`">
          deploy LOCKED @{{ row.lockedAtMinute }}
        </span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.g5-budgets { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 4px; }
.g5-budget {
  display: grid;
  grid-template-columns: 34px 1fr auto;
  gap: 8px;
  align-items: baseline;
  padding: 5px 7px;
  background: var(--g5-card);
  border-left: 3px solid var(--g5-teal);
  font-size: 11.5px;
  cursor: pointer;
}
.g5-budget:hover { background: var(--g5-card-hot); }
.g5-budget--burned { border-left-color: var(--g5-oxide); }
.g5-bid { font-weight: 700; }
.g5-blabel { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--g5-ink); }
.g5-bremain { font-variant-numeric: tabular-nums; font-weight: 700; color: var(--g5-ink); white-space: nowrap; }
.g5-blocked { color: var(--g5-oxide); font-size: 9.5px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 700; }
</style>
